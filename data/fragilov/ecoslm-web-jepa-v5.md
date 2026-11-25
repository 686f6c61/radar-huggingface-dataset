# fragilov/ecoslm-web-jepa-v5

## Resumen

EcoSLM-WebJEPA v5 es un modelo de investigación publicado por el usuario fragilov en Hugging Face, orientado a la automatización de agentes web en el borde (edge). No es un modelo de lenguaje generativo al uso: se trata de una arquitectura de predicción conjunta (JEPA, Joint-Embedding Predictive Architecture) que opera sobre representaciones latentes del DOM de una página web y predice la siguiente operación de interacción (clic, relleno, selección, espera) dentro de un flujo de automatización con Playwright. Su tamaño es muy reducido (11,9 millones de parámetros) y está diseñado para ejecutarse en CPU en milisegundos.

El modelo se presenta como la quinta iteración de una familia ("0.99 Frontier") que evoluciona desde WebDM v2 y WebJEPA v3/v4. Incorpora un modelo del mundo contrafactual ("counterfactual world model") que permite evaluar ramas alternativas de interacción, junto con una cabeza jerárquica de atención objetivo-operación y un predictor de interacción contrafactual. El objetivo declarado es sustituir o complementar a modelos de lenguaje grandes en la toma de decisiones de bajo nivel dentro de agentes web, reduciendo la latencia de cientos de milisegundos a decenas.

La relevancia actual reside en su propuesta de "IA en el borde" para agentes web: con un paquete ONNX INT8 de 16,4 MB y latencias medias de 61 ms por paso en Chromium real, el modelo apunta a escenarios donde un LLM en la nube sería demasiado lento o costoso. No obstante, se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y con documentación técnica muy específica pero de validación limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | JEPA (Joint-Embedding Predictive Architecture) con modelo del mundo contrafactual, cabeza de atención jerárquica objetivo-operación y predictor de interacción; exportable a ONNX (3 grafos) |
| Parámetros totales | 11.937.551 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre estado del DOM codificado, no sobre texto libre) |
| Tipos de cuantización | ONNX INT8 (policy 15,46 MB; world 0,35 MB; bundle total 16,398 MB) |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (librería pytorch), ONNX INT8 |

## Arquitectura y entrenamiento

La arquitectura combina un codificador de observaciones del DOM con ingeniería de características de 12 dimensiones por elemento (estado vacío/relleno, checked, opción seleccionada, capacidad de clic/relleno/selección, coincidencia con el objetivo, botón primario), etiquetas de estado invariantes de dominio (`[UI_MODAL_BLOCKING]`, `[UI_ASYNC_WAIT]`, `[UI_ERROR_BLOCKED]`) y máscaras de objetivo e historial ampliadas. Sobre esa representación, una cabeza de atención cruzada jerárquica "Target-to-Op + Context-Token" sustituye la atención plana consulta-elemento por atención sobre tokens de contexto y agrupamiento enmascarado por operación (pooling de 14 cabezas y 3 ratios de dominancia cruzada). El modelo del mundo se aísla con un régimen de baja correlación (ρ=0,0) para evitar la contaminación de gradientes residuales de alta ρ.

El entrenamiento se realizó sobre un corpus de Playwright en vivo: 430 pasos reales de `/app/*` y 70 escenarios de ramas contrafactuales (`playwright_train_v5.jsonl`, `playwright_train_branches_v5.jsonl`), con cero solapamiento de URL respecto a los conjuntos de evaluación retenidos (`val.jsonl`, `val_v2_frozen.jsonl`, `playwright_eval.jsonl`, `counterfactual_persistent_eval.jsonl`, `counterfactual_eval.jsonl`, `playwright_cf_eval.jsonl`). Se menciona un profesor tipo "TypeSafe jev-latest" con etiquetas suaves (soft labels) cuya confianza máxima media es 0,9462 en `val` y 0,9468 en `playwright_eval`, lo que actúa como techo de Bayes del profesor. No se detalla el número total de tokens ni la composición completa del dataset más allá de los recuentos de pasos.

Como innovación destacable, el modelo incluye una extracción determinista de citas textuales (`_extract_grounded_quote`) para argumentos `TYPE_TEXT` explícitos, con latencia media de 1,073 ms (mediana 0,075 ms), frente a los 10.240,512 ms de media de Qwen2.5-0.5B-Instruct como respaldo. Esto reduce la latencia extremo a extremo a 61,160 ms de media (46,437 ms de mediana) por paso en Chromium real, un 34,5x más rápido que los pasos tipados por LLM.

## Capacidades

- Predicción de la siguiente operación web (clic, relleno, selección, espera) a partir de una observación codificada del DOM.
- Modelado del mundo contrafactual: evaluación de ramas alternativas de interacción y ranking de valores `{0, 1, 2}`.
- Cabeza de atención jerárquica objetivo-operación con ratios de dominancia (`p_fill_empty`, `p_sel_unfilled`, `p_clk_primary`).
- Extracción determinista de citas textuales para argumentos de texto tipado.
- Soporte de tool calling implícito vía integración con Playwright (acciones de navegador).
- Operación en CPU con cuantización ONNX INT8 y latencias de decenas de milisegundos.
- Multilingüe limitado a vietnamita e inglés en las etiquetas y datos de entrenamiento.
- No dispone de generación de texto libre, visión, audio ni modo de razonamiento explícito ("thinking mode").

## Casos de uso

- Automatización de pruebas E2E con Playwright: el modelo predice la siguiente acción sobre el DOM con latencias de ~61 ms por paso, lo que permite ejecutar suites de pruebas de navegador sin depender de un LLM en la nube y con coste de inferencia nulo en CPU.
- Agentes web de bajo nivel en el borde: integrado en un servicio local, decide clics, rellenos y selecciones sobre formularios, usando su modelo del mundo para descartar ramas de interacción inviables antes de actuar.
- Relleno de formularios con extracción de texto: la ruta determinista `_extract_grounded_quote` (1,07 ms de media) permite insertar valores citados sin invocar un LLM, útil en pipelines de alta frecuencia.
- Enrutamiento de acciones en asistentes de navegador: la cabeza jerárquica objetivo-operación selecciona la operación correcta (incluida `WAIT` y `SELECT`, con precisión 1,0000 en el conjunto `playwright_eval`) en escenarios con modales, esperas asíncronas y errores de UI.
- Evaluación contrafactual de flujos de usuario: el predictor de interacción contrafactual (precisión ponderada 0,9891 en 92 casos de 3 suites) permite simular "qué habría pasado si" y validar robustez de un flujo antes de desplegarlo.
- Automatización de tareas repetitivas en portales vietnamitas e ingleses: el soporte de vi y en y las etiquetas de estado de dominio general permiten operar sobre interfaces localizadas sin reentrenamiento específico.
- Investigación en modelos del mundo para agentes: sirve como banco de pruebas reproducible de JEPA aplicado a interacción web, con métricas de régimen bajo y alto ρ y comparación entre generaciones.

## Benchmarks y rendimiento

| Suite / Métrica | WebDM v2 | WebJEPA v3 | WebJEPA v4 | WebJEPA v5 |
|---|---|---|---|---|
| Parámetros | 10.830.085 | 11.274.578 | 11.533.583 | 11.937.551 |
| Tamaño bundle ONNX INT8 (MB) | 14,00 | 13,717 (2 grafos) | 14,115 (3 grafos) | 16,398 (3 grafos) |
| `val` Full Op Top-1 (n=144) | 0,6181 | 0,9444 | 0,9375 | 0,9306 (Iter 1: 0,9514) |
| `val` Target Top-1 (`all_active` / `exec_tgt` INT8) | 0,8317 / — | 0,9469 / — | 0,9429 / — | 0,9347 / 0,9703 (Iter 3: 0,9802) |
| `playwright_eval` Op Top-1 (n=60) | — | 0,4167 | 0,7167 | 0,9500 (Iter 3: 0,9667) |
| `playwright_eval` Target (`all` / `exec` INT8) | — | — | 0,9722 / — | 0,9444 / 0,9565 (Iter 1: 1,0000) |
| `playwright_eval` `WAIT` / `SELECT` Op Accuracy | — | — | 0,0000 / 0,3333 | 1,0000 / 1,0000 |
| Gate ρ̂ persistente bajo ρ=0,0 (n=30) | — | — | 0,0633 | 0,0657 |
| Readout R² / Selection / Alt persistente bajo ρ | — | — / 1,0000 / 1,0000 | +0,6099 / 0,9333 / 0,9667 | +0,7071 / 1,0000 / 1,0000 |
| Gate ρ̂ alto ρ=5974,63 (n=50) | — | — | 0,7420 | 0,8174 |
| High-ρ `dual_v4` Selection / Alt-Only | 0,7200 / 0,9200 | 0,7200 / 1,0000 | 0,9600 / 1,0000 | 0,9800 / 0,9800 (49/50) |
| Held-out Playwright CF (n=12) Gate / Sel / Alt | — | — | 0,8603 / 1,0000 / 1,0000 | 0,9508 / 1,0000 / 1,0000 |
| Weighted 3-Suite CF (n=92) Dual Sel / Alt | — | — | 0,9565 / 0,9891 | 0,9891 / 0,9891 (91/92) |
| Composite Frontier (`dual_cf` / `exec_tgt`) | — | — | — | 0,9563 / 0,9643 |
| Aceleración vs Cloud `jev-latest` (711,41 ms media) | 40,39x | 40,48x | 37,60x | 32,58x / 29,67x (CF 3 grafos) |

Tiempos aislados en CPU (batch_size=1, Intel 2C/4T) sobre 95 muestras ONNX INT8 (`val_v2_frozen` + `playwright_eval`): codificación 0,986 ms de media (0,941 ms mediana); policy INT8 (15,46 MB) 21,835 ms de media (20,022 ms mediana) frente a PyTorch FP32 64,791 ms; world INT8 (K=4, 0,35 MB) con datos de latencia truncados en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está pensado para CPU y su bundle ONNX INT8 completo ocupa 16,398 MB, por lo que cabría en cualquier GPU consumer con holgura.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos ~1 GB de memoria libre es suficiente (RTX 4090, A100, H100 sobran). El diseño apunta a ejecución en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo actual; también en CPU de 2 núcleos y 4 hilos según las mediciones del autor.
- Opciones de despliegue: ONNX Runtime (INT8), PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a esta arquitectura).
- Latencia y throughput: ~61,160 ms de media (46,437 ms mediana) por paso en Chromium real; policy INT8 21,835 ms de media; world INT8 con K=4 no cuantificado en la información disponible; aceleración de 29,67x–32,58x frente a la nube.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EcoSLM-WebJEPA v5 | 11,9 M | No disponible | Op Top-1 0,9500 en `playwright_eval`; CF ponderado 0,9891 | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-0.5B-Instruct | ~500 M | No disponible en la información | Usado como respaldo para tipado (10.240 ms de media) | No disponible en la información | Hugging Face |
| Cloud `jev-latest` (TypeSafe) | No disponible | No disponible | 711,41 ms de media por paso; techo de etiquetas 0,9462–0,9468 | No disponible | Servicio en la nube |
| WebJEPA v4 (generación anterior) | 11,5 M | No disponible | Op Top-1 0,7167 en `playwright_eval` | Apache 2.0 | Hugging Face |

No se dispone de comparación con otros modelos JEPA para agentes web en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero likes; no hay evidencia de uso en producción ni validación independiente.
- Los benchmarks son autoinformados por el autor y se evalúan sobre conjuntos pequeños (n=12 a n=144), con intervalos de confianza amplios.
- El techo de Bayes del profesor (confianza máxima media 0,9462–0,9468) limita la precisión alcanzable; hay cabezas de objetivo activas por debajo de 0,75 (30/245 en `val`, 11/144 en `playwright_eval`).
- Idiomas limitados a vietnamita e inglés; no hay soporte declarado de castellano ni de otras lenguas.
- No es un modelo de lenguaje: no genera texto libre, no responde preguntas y no tiene capacidades de visión, audio ni razonamiento general.
- Dependencia de la integración con Playwright y del esquema de codificación del DOM; cambios en la estructura de las páginas pueden degradar el rendimiento.
- Riesgo de sobreajuste al corpus de entrenamiento (430 pasos y 70 ramas) pese a la separación por URL.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de documentación de sesgos hace recomendable una evaluación propia antes de desplegar.
- La model card contiene datos truncados (por ejemplo, latencias del grafo world INT8) que impiden reproducir todas las métricas.

## Enlaces

- Hugging Face: https://huggingface.co/fragilov/ecoslm-web-jepa-v5
- Dataset de entrenamiento citado: https://huggingface.co/datasets/fragilov/ecoslm-web-dm-distill
- Repositorio de Playwright (dependencia de ejecución): https://github.com/microsoft/playwright
- Paper de JEPA (referencia arquitectónica): no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
