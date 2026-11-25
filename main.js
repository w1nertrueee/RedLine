/** @typedef {{ id: "lite" | "standard" | "pro", name: string, price: number }} Plan */

/** @type {Record<string, Plan>} */
const plans = {
  lite: { id: "lite", name: "LITE", price: 60 },
  standard: { id: "standard", name: "STANDARD", price: 100 },
  pro: { id: "pro", name: "PRO", price: 200 },
};

/** @type {HTMLDialogElement | null} */
const dialog = document.querySelector("#checkoutDialog");
/** @type {HTMLInputElement | null} */
const emailInput = document.querySelector("#checkoutEmail");
/** @type {HTMLElement | null} */
const toast = document.querySelector("#toast");
/** @type {HTMLElement | null} */
const errorMessage = document.querySelector("#emailError");
/** @type {HTMLElement | null} */
const checkoutContent = document.querySelector("#checkoutContent");
/** @type {HTMLElement | null} */
const successContent = document.querySelector("#checkoutSuccess");

/** @type {Plan} */
let selectedPlan = plans.standard;
let toastTimer = 0;

/** @param {string} message */
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

/** @param {string} planId */
function selectPlan(planId) {
  const nextPlan = plans[planId];
  if (!nextPlan) return;
  selectedPlan = nextPlan;
  document.querySelectorAll("[data-plan]").forEach((card) => {
    card.classList.toggle("selected", card.getAttribute("data-plan") === planId);
  });
  showToast("Выбран тариф " + selectedPlan.name + " · " + selectedPlan.price + " ₽ / месяц");
}

/** @param {string} planId */
function openCheckout(planId) {
  if (!dialog) return;
  if (plans[planId]) selectedPlan = plans[planId];
  const name = document.querySelector("#checkoutPlanName");
  const price = document.querySelector("#checkoutPlanPrice");
  if (name) name.textContent = selectedPlan.name;
  if (price) price.innerHTML = selectedPlan.price + " ₽<small> / месяц</small>";
  if (emailInput) {
    emailInput.value = "";
    emailInput.classList.remove("invalid");
  }
  if (errorMessage) errorMessage.textContent = "";
  if (checkoutContent) checkoutContent.hidden = false;
  if (successContent) successContent.hidden = true;
  dialog.showModal();
}

document.querySelectorAll("[data-select]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const planId = button.getAttribute("data-select");
    if (planId) {
      selectPlan(planId);
      openCheckout(planId);
    }
  });
});

document.querySelectorAll("[data-open-checkout]").forEach((button) => {
  button.addEventListener("click", () => openCheckout(button.getAttribute("data-open-checkout") || "standard"));
});

document.querySelectorAll("[data-plan]").forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest("button")) return;
    const planId = card.getAttribute("data-plan");
    if (planId) selectPlan(planId);
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const planId = card.getAttribute("data-plan");
      if (planId) selectPlan(planId);
    }
  });
});

document.querySelector("#simulatePayment")?.addEventListener("click", () => {
  const email = emailInput?.value.trim() ?? "";
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!validEmail) {
    if (emailInput) emailInput.classList.add("invalid");
    if (errorMessage) errorMessage.textContent = "Укажи корректный email для демонстрационного сценария.";
    emailInput?.focus();
    return;
  }
  if (emailInput) emailInput.classList.remove("invalid");
  if (errorMessage) errorMessage.textContent = "";
  const successPlan = document.querySelector("#successPlan");
  if (successPlan) successPlan.textContent = selectedPlan.name;
  if (checkoutContent) checkoutContent.hidden = true;
  if (successContent) successContent.hidden = false;
});

document.querySelector("#cancelCheckout")?.addEventListener("click", () => dialog?.close());
document.querySelector("#closeSuccess")?.addEventListener("click", () => dialog?.close());
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

document.querySelector("#profileButton")?.addEventListener("click", () => {
  showToast("Авторизация появится после подключения аккаунтов REDLINE.");
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((section) => revealObserver.observe(section));

const counter = document.querySelector("[data-count]");
if (counter) {
  const target = Number(counter.getAttribute("data-count")) || 24;
  const started = performance.now();
  const animateCount = (now) => {
    const progress = Math.min((now - started) / 1050, 1);
    counter.textContent = String(Math.round(target * (1 - (1 - progress) ** 3)));
    if (progress < 1) requestAnimationFrame(animateCount);
  };
  requestAnimationFrame(animateCount);
}
