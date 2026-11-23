# fragilov/ecoslm-web-jepa-v4

## Resumen

EcoSLM-WebJEPA v4 (`fragilov/ecoslm-web-jepa-v4`) es un modelo compacto de 11.533.583 parámetros desarrollado por el usuario fragilov, orientado a la automatización de agentes web sobre navegador headless. No es un modelo de lenguaje generativo al uso, sino una arquitectura de modelo del mundo contrafactual (Counterfactual Joint-Embedding Predictive Architecture, JEPA) entrenada para predecir transiciones de DOM y seleccionar acciones sobre portales web reales. Se distribuye como un conjunto de tres grafos ONNX INT8 que suman 14,11 MB.

La versión v4 introduce un modelo del mundo de doble régimen basado en el trabajo de Balestriero, LeCun y Varaku (2026): un régimen de baja interacción que preserva la aditividad latente clásica y un régimen de alta interacción con una compuerta aprendida (`InteractionRegimeGate`) y un predictor no lineal que modela transiciones DOM no aditivas (errores de validación, modales bloqueantes, reseteos silenciosos). El modelo se destila a partir de trayectorias reales capturadas con Chromium headless y Playwright sobre 9 portales de entrenamiento y 3 portales de evaluación retenidos.

Su relevancia radica en el rendimiento en el borde: con un bundle de 14,11 MB y latencias de decenas de milisegundos en CPU, ofrece una aceleración de 39,87x frente a un SLM en la nube (`jev-latest`, 711,41 ms de media) para la tarea de selección de política, lo que lo hace viable en entornos de agente web de bajos recursos. Los idiomas declarados son vietnamita (vi) e inglés (en).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (Joint-Embedding Predictive Architecture) con modelo del mundo contrafactual de doble régimen; triple grafo (policy+encoder, world predictor, CF-interact) |
| Parametros totales | 11.533.583 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de estado DOM, no de texto libre) |
| Tipos de cuantizacion | ONNX INT8 (bundle triple de 14,11 MB); pesos PyTorch FP32 en el repo |
| Idiomas soportados | vi, en |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (safetensors/bin según repo) y ONNX INT8 (tres grafos: `ecoslm_web_jepa_policy.int8.onnx`, `ecoslm_web_jepa_world.int8.onnx`, `ecoslm_web_jepa_cf_interact.int8.onnx`) |

## Arquitectura y entrenamiento

La arquitectura se compone de tres grafos ONNX especializados. El grafo de política y codificador (`13,46 MB`) procesa el estado del DOM y produce la acción; el predictor factual del mundo (`0,26 MB`, K=4) modela la transición esperada; y el grafo CF-Interact (`0,39 MB`, K=4/K=3) implementa el modelo del mundo contrafactual de doble régimen. La dimensión latente es `latent_dim=64`. La innovación central es la `InteractionRegimeGate` `g_φ ∈ (0,1)`, que combina un reúso de residuo latente aditivo (régimen de baja interacción, ρ≈0) con un `NonlinearCounterfactualPredictor` `Φ_ψ` inicializado a residuo cero para transiciones no aditivas (régimen de alta interacción, ρ≫0), evitando corromper la aditividad cuando ρ es bajo.

El entrenamiento combina destilación desde `fragilov/ecoslm-web-dm-distill` sobre trayectorias reales de Chromium headless: 9 portales de entrenamiento (`/app/*`, 111 pasos, 30 escenarios de ramificación) estrictamente separados de 3 portales de evaluación retenidos (`/eval-app/*`, 60 pasos, 12 escenarios de ramificación). No se especifica en la información disponible el número total de tokens ni si hubo RLHF/DPO; el paradigma es de destilación supervisada sobre trayectorias de agente.

## Capacidades

- Selección de acciones sobre estado DOM en portales web reales (predicción de operador y objetivo).
- Modelado del mundo factual: predicción de la siguiente transición DOM dado un estado y una acción (K=4).
- Modelado contrafactual de doble régimen: estimación de resultados alternativos ante interacciones no aditivas (validaciones, modales, reseteos).
- Ejecución sobre navegador headless Chromium vía Playwright (integración de extracción de DOM y ejecución de acciones).
- Inferencia en CPU de borde con ONNX INT8 (sin GPU).
- Soporte de fallback a un SLM local (`qwen2.5-0.5b-instruct`) para la acción `TYPE_TEXT`.
- Capacidades multilingües limitadas a vietnamita e inglés en la metadata del modelo.
- No se declaran capacidades de generación de texto libre, razonamiento matemático general ni visión.

## Casos de uso

- Automatización de flujos de formulario en portales corporativos: el agente decide la siguiente acción (rellenar, clicar, esperar) sobre el DOM con latencias de ~20 ms por paso en CPU, adecuado para ejecución en el propio servidor del portal sin GPU.
- Testing end-to-end de aplicaciones web: el modelo puede recorrer escenarios de ramificación y detectar transiciones no aditivas (validaciones fallidas, modales bloqueantes) gracias al régimen de alta interacción, integrándose en pipelines de CI con Playwright.
- Agentes de navegación en dispositivos de borde: con un bundle de 14,11 MB y 55,80 MB de delta RSS aislado, cabe en entornos con memoria restringida (por ejemplo, contenedores pequeños o dispositivos IoT con CPU).
- Monitorización sintética de portales: ejecución periódica de trayectorias para verificar que los flujos críticos siguen funcionando, usando el predictor factual para anticipar el siguiente estado esperado.
- Extracción estructurada guiada por estado: el codificador del DOM permite mapear estados a acciones sin depender de un LLM en la nube, reduciendo coste y latencia en pipelines de scraping interactivo.
- Asistencia a operadores humanos en tareas repetitivas de back-office: el modelo propone la siguiente acción y el contrafactual estima el resultado de alternativas antes de ejecutar, útil en flujos con precondiciones no satisfechas.
- Evaluación de robustez de agentes web: sirve como referencia ligera para comparar políticas en portales retenidos (`/eval-app/*`) sin incurrir en costes de inferencia en la nube.

## Benchmarks y rendimiento

| Suite / Métrica | WebDM v2 (congelado) | WebJEPA v3 (congelado) | WebJEPA v4 |
|---|---|---|---|
| Parámetros | 10.830.085 | 11.274.578 | 11.533.583 |
| Bundle ONNX INT8 (MB) | 14,00 / 14,68 | 13,72 (2 grafos) | 14,11 (3 grafos) |
| `val_v2_frozen` Op / Target Top-1 (n=35) | 0,8000 / 0,8462 | 0,8286 / 0,8769 | 0,8857 / 0,8769 |
| `val` Op / Target Top-1 (n=144) | 0,6181 / 0,8317 | 0,9444 / 0,9469 | 0,9375 / 0,9429 (INT8 Tgt 0,9604) |
| `playwright_eval` retenido Op / Target Top-1 (n=60) | — | 0,4167 / — | 0,7167 / 0,9722 |
| Gate ρ̂ persistente baja ρ=0,0 (n=30) | — | — | 0,0633 |
| R² latente / readout baja ρ | — | +0,5433 / +0,5807 | +0,3964 / +0,6099 |
| Gate ρ̂ alta ρ=5974,63 (n=50) | — | — | 0,7420 |
| R² readout alta ρ (dual_v4 vs Eq.6) | — | -0,4836 | +0,4665 (+0,4769 NL) |
| Selección 3 ramas / Alt-Only alta ρ | 0,7200 / 0,9200 | 0,7200 / 1,0000 | 0,9600 (1,0000 NL) / 1,0000 |
| Gate ρ̂ CF Playwright retenido (n=12) | — | — | 0,8603 |
| R² latente / readout CF Playwright retenido | — | — | +0,1013 / +0,3470 (vs -1,546 / -0,2554 Eq.6) |
| Selección 3 ramas / Alt-Only CF Playwright | — | — | 1,0000 / 1,0000 |
| Aceleración vs `jev-latest` nube (711,41 ms) | — | — | 39,87x (política) / 36,39x (CF completo) |

Desglose temporal en CPU Intel 2C/4T (batch_size=1): carga aislada de 95 muestras con Policy INT8 17,841 ms (vs PyTorch FP32 55,095 ms), World INT8 K=4 0,307 ms, CF-Interact INT8 K=3 0,439 ms, E2E de recuperación CF completa 19,552 ms. En Chromium Playwright en vivo (`/eval-app/*`, n=18): extracción DOM 8,723 ms, codificación 2,081 ms, política INT8 24,619 ms, mundo INT8 0,761 ms, CF-Interact 0,550 ms, ejecución en navegador 20,741 ms, mediana E2E por paso sin escritura 56,504 ms.

## Requisitos de hardware

- VRAM: no requiere GPU; el bundle ONNX INT8 (14,11 MB) se ejecuta en CPU. Delta RSS aislado de +55,80 MB.
- GPU recomendadas: no aplica; el diseño es para CPU de borde. Cualquier GPU moderna puede ejecutarlo, pero no aporta ventaja declarada.
- Cabe en CPU consumer: sí, con un solo hilo de inferencia práctica; el benchmark usa un Intel 2C/4T.
- Opciones de despliegue: ONNX Runtime (INT8), PyTorch FP32 para entrenamiento/validación, integración con Playwright y Chromium headless. No se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje generativo).
- Latencia y throughput: política INT8 13,20 ms de media en `val` y 17,84 ms en carga cruzada de 95 muestras; E2E por paso en navegador en vivo 56,504 ms (mediana, sin escritura). La acción `TYPE_TEXT` delega en Qwen2.5-0.5B (9693,851 ms de media en n=3 pasos), lo que domina el coste cuando se usa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EcoSLM-WebJEPA v4 | 11.533.583 | no disponible | JEPA contrafactual de doble régimen para agentes web | Apache 2.0 | Hugging Face |
| EcoSLM-WebJEPA v3 | 11.274.578 | no disponible | JEPA contrafactual (régimen único, Eq.6) | Apache 2.0 | Hugging Face |
| EcoSLM-WebDM v2 | 10.830.085 | no disponible | Modelo del mundo web (sin JEPA contrafactual) | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | ~0,5 B | 32.768 (típico) | LLM generativo (usado como helper de `TYPE_TEXT`) | Apache 2.0 | Hugging Face |

La comparativa con LLM generalistas no es directa: WebJEPA v4 no genera texto ni razona en lenguaje natural, sino que selecciona acciones sobre estado DOM. Frente a un LLM en la nube (`jev-latest`, 711,41 ms), el modelo declara 39,87x de aceleración en política con una fracción del coste computacional.

## Limitaciones y advertencias

- Dominio estrecho: entrenado sobre 9 portales `/app/*` concretos; la generalización a portales arbitrarios no está garantizada (el `playwright_eval` retenido baja a 0,7167 de acierto de operador frente a 0,9375 en `val`).
- El régimen de alta interacción aún muestra R² modesto en CF Playwright retenido (+0,1013 latente, +0,3470 readout), lo que indica capacidad limitada para predecir contrafactuales en dominios no vistos.
- Dependencia de Chromium headless y Playwright: requiere un navegador y un entorno de ejecución, no es un modelo puramente de texto.
- La acción `TYPE_TEXT` delega en Qwen2.5-0.5B, con latencias de ~9,7 s por paso, muy superiores al resto del pipeline; en producción conviene cachear o sustituir este helper.
- Idiomas declarados: solo vietnamita e inglés; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación de transiciones: al ser un modelo del mundo predictivo, puede anticipar estados inexistentes si el DOM se desvía del distribuido en entrenamiento; se recomienda validación contra el DOM real antes de ejecutar acciones irreversibles.
- Sesgos: no se documentan análisis de sesgo; el modelo hereda los sesgos de las trayectorias de destilación y de los portales de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni soporte; el autor es un particular y el modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validación comunitaria.
- El número de arXiv citado (`2611.24778`) y la fecha de creación (2026-11-23) deben tratarse con cautela: verificar la referencia antes de citarla en producción.

## Enlaces

- Hugging Face: https://huggingface.co/fragilov/ecoslm-web-jepa-v4
- Modelo de destilación: https://huggingface.co/fragilov/ecoslm-web-dm-distill
- Paper de referencia (Balestriero, LeCun & Varaku, 2026): https://arxiv.org/abs/2611.24778
- Helper SLM para `TYPE_TEXT`: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Playwright: https://playwright.dev
- ONNX Runtime: https://onnxruntime.ai
