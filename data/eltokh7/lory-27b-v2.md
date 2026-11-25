# eltokh7/lory-27b-v2

## Resumen

Lory-27B v2 es un modelo de decisión de un solo paso hacia delante (single forward pass) desarrollado por eltokh7, orientado a la simulación de encuestados y a experimentos económicos conductuales. Se construye como un fine-tuning supervisado del modelo base jaredpalmer/kev-27b, que a su vez deriva de la familia Qwen 3.5 (tag `qwen3_5_text`). Con 25.624.600.064 parámetros (aproximadamente 25,6 mil millones) y pesos en bf16 de unos 51 GB, el modelo no genera texto: recibe el perfil de un agente y una pregunta de encuesta o decisión, y devuelve directamente una distribución de probabilidad calibrada sobre cada opción disponible.

La propuesta diferencial frente a modelos de decisión convencionales es la incorporación de dos modos controlables en un único modelo. El modo por defecto responde de forma económicamente consistente, sensible a precios, cuotas, pagos y retrasos, y resistente al encuadre y al ruido de rasgos irrelevantes. El modo "persona típica" se activa añadiendo un rasgo `style` al perfil del agente y desplaza la respuesta hacia distribuciones de elección humana empírica, sin contaminar el modo por defecto con sesgos humanos.

El modelo es relevante porque permite ejecutar encuestas sintéticas y experimentos económicos a un coste muy inferior al de un LLM generativo de frontera, eliminando la varianza de muestreo y el coste de decodificación. Se distribuye con pesos fusionados en bf16 y está pensado para servirse mediante el servidor `kev` de Jared Palmer a través de la API `/v1/systemone`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen 3.5, tag `qwen3_5_text`) |
| Parámetros totales | 25.624.600.064 (aproximadamente 25,6 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), pesos fusionados en bf16 de aproximadamente 51 GB |

## Arquitectura y entrenamiento

Lory-27B v2 es un fine-tuning del modelo jaredpalmer/kev-27b, que pertenece a la familia Qwen 3.5 según el tag `qwen3_5_text`. La arquitectura subyacente es un transformer decoder-only de aproximadamente 25,6 mil millones de parámetros. El modelo no se emplea para generación de texto: la cabeza de decisión produce directamente una distribución de probabilidad sobre las opciones de una pregunta, lo que elimina la decodificación autorregresiva y la varianza de muestreo asociada.

El entrenamiento se orienta a dos regímenes de comportamiento diferenciados. El modo por defecto se entrena para consistencia económica, con sensibilidad a precios, cuotas, pagos, retrasos e incentivos estratégicos, y con robustez frente al encuadre y a rasgos irrelevantes. El modo "persona típica" se activa mediante un rasgo `style` en el perfil del agente y se entrena para aproximar distribuciones de elección humana empírica en apuestas arriesgadas, juegos de laboratorio y fenómenos conductuales clásicos, manteniendo separación limpia entre ambos modos. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Predicción de decisiones en un solo paso hacia delante: devuelve una distribución de probabilidad calibrada sobre todas las opciones de una pregunta, sin generación de texto ni muestreo.
- Modo económico por defecto: responde con sensibilidad a precios, cuotas, pagos, retrasos e incentivos estratégicos, y con invariancia al encuadre.
- Modo "persona típica": activado mediante el rasgo `style`, aproxima distribuciones de elección humana real en apuestas, juegos estratégicos y fenómenos conductuales.
- Soporte de preguntas de elección múltiple, sí/no, escala lineal y Likert a través del script `edsl_decision.py` incluido en el repositorio.
- Soporte de orden de opciones configurable en las preguntas (según la descripción del script de EDSL).
- Integración con la API `/v1/systemone` del servidor `kev`.
- Compatibilidad con EDSL (Expected Parrot Decision Simulation Language) para ejecutar encuestas completas con agentes y escenarios.
- Clasificación de texto (pipeline `text-classification`).

## Casos de uso

- Encuestas de mercado sintéticas: dado un perfil de consumidor y una pregunta de elección entre planes, productos o precios, el modelo devuelve la distribución de elección en un solo paso, lo que permite ejecutar miles de encuestados simulados con coste muy inferior al de un LLM generativo.
- Experimentos de economía conductual: reproducción de juegos de laboratorio (ultimátum, juegos estratégicos 2×2, loterías arriesgadas) con distribuciones de elección calibradas frente a datos humanos publicados, útil para pilotar diseños experimentales antes de reclutar participantes reales.
- Análisis de sensibilidad a incentivos: evaluación de cómo varía la probabilidad de elección ante cambios en precios, cuotas, pagos o retrasos, gracias al modo económico por defecto y a su sensibilidad a las apuestas.
- Simulación de fenómenos conductuales: activación del modo "persona típica" para estudiar sesgos y patrones de elección humana (aversión a la pérdida, efectos de encuadre) en entornos controlados.
- Pruebas de encuadre y robustez: uso de la invariancia al encuadre del modo por defecto para detectar preguntas de encuesta mal formuladas o con opciones dominadas.
- Investigación en economía y ciencias sociales: generación de datos sintéticos de elección para preentrenar o validar modelos econométricos de elección discreta, con distribuciones probabilísticas directamente utilizables.
- Evaluación de políticas públicas: simulación de respuestas de poblaciones con perfiles demográficos y económicos definidos ante escenarios de elección (seguros, planes, subsidios) antes de un estudio de campo.

## Benchmarks y rendimiento

Los datos publicados por el autor en la model card son los siguientes.

Lógica económica y sensibilidad a incentivos:

| Modelo | DLS v0.2 (9 familias) | Sensibilidad a apuestas | EDSL-General | Cambio de pago en bank-run (teoría 80) | Pendiente de lotería (teoría 1,0) | Sealed Blind v3 (569 tests) |
|---|---:|---:|---:|---:|---:|---:|
| Lory-27B v2 | 89 | 85 | 98 | 63,5 | 0,94 | 80 |
| Lory-4B v2 | 82 | 76 | — | 38,0 | 0,68 | 73 |
| Lory-27B v1 | 88 | 82 | 88 | 66,5 | 0,77 | 73 |
| Perplexity Decider v1.2 | 77 | 65 | 88 | 9,0 | 0,43 | — |
| Jev 1.14 | 77 | 64 | 90 | 3,0 | — | — |
| GPT-6 Luna Decisions | 75 | 68 | 89 | 17,0 | — | — |
| Kev-27B (base) | 71 | 53 | 87 | 1,0 | 0,25 | — |
| GPT-6.1-terra (una pasada, referencia) | 93 | 96 | 99 | 62,0 | 0,92 | — |

Predicción de elecciones humanas reales:

| Modelo | Choices13k (r / MAE / mismo lado) | Psych-101/201 sin tocar (6 estudios, r / MAE) | Fenómenos conductuales (típico / defecto / brecha) | Fenómenos no vistos sellados (14 tests, típico / defecto / brecha) |
|---|---:|---:|---:|---:|
| Lory-27B v2 | +0,85 / 8,9 pp / 86% | +0,75 / 12,4 pp | 68,1 / 51,7 (+16,4) | 53,9 / 45,7 (+8,2) |
| Lory-4B v2 | +0,79 / 10,3 pp / 82% | +0,69 / 13,2 pp | 57,9 / 40,3 (+17,6) | 50,4 / 36,7 (+13,7) |
| Lory-27B v1 | +0,47 / 21,2 pp / 67% | +0,77 / 17,4 pp | 32,8 / 41,1 (−8,3) | 35,2 / 38,8 (−3,6) |
| Kev-27B (base) | +0,42 / 17,0 pp / 66% | +0,66 / 15,3 pp | 45,9 / 38,7 (+7,2) | — |
| GLM-5.3 (razonamiento, referencia) | +0,78 / 14,9 pp / 79% | — | — | — |

Además, el autor reporta en experimentos de Psych-101/201 sin tocar: ofertas de ultimátum con r = +0,99 (MAE de 5 pp), juegos estratégicos 2×2 simultáneos (Zhu et al. 2024) con r = +0,84 (MAE de 15 pp) y loterías arriesgadas descritas (Frey et al. 2017) con r = +0,73 (MAE de 14 pp), sin regresión en la suite `decision-v7` (0,878 frente a 0,863 del base).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55 GB (pesos de unos 51 GB más overhead).
- Requiere una GPU de 80 GB para el despliegue documentado (por ejemplo, A100 80 GB o H100 80 GB).
- No cabe en GPUs de consumo de 24 GB (RTX 4090) ni en GPUs de 48 GB en bf16; no se documentan cuantizaciones alternativas que reduzcan el requisito.
- Opción de despliegue oficial: servidor `kev` de Jared Palmer (`uv run python -m kev.serve --run eltokh7/lory-27b-v2 --device cuda --port 8850`) sobre la API `/v1/systemone`.
- Compatibilidad con transformers y safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Para entornos con menos VRAM, el autor remite a Lory-4B v2 (aproximadamente 8 GB, ejecutable en Apple Silicon o en una GPU de 16 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DLS v0.2 | Choices13k (r) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Lory-27B v2 | 25,6 mil millones | no disponible | 89 | +0,85 | Apache 2.0 | Hugging Face (transformers, safetensors) |
| Lory-4B v2 | no disponible (aproximadamente 4 mil millones) | no disponible | 82 | +0,79 | no disponible | Hugging Face |
| Lory-27B v1 | no disponible | no disponible | 88 | +0,47 | no disponible | Hugging Face |
| Kev-27B (base) | no disponible | no disponible | 71 | +0,42 | no disponible | Hugging Face |
| Perplexity Decider v1.2 | no disponible | no disponible | 77 | no disponible | no disponible | no disponible |
| GPT-6 Luna Decisions | no disponible | no disponible | 75 | no disponible | propietaria | servicio alojado |

## Limitaciones y advertencias

- El modelo devuelve distribuciones de probabilidad, no texto: no es adecuado para tareas de generación, razonamiento libre ni diálogo.
- El modo "persona típica" reproduce sesgos humanos empíricos de forma deliberada; no debe usarse como sustituto de juicio económico normativo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las distribuciones pueden estar mal calibradas fuera de los dominios de entrenamiento (encuestas, juegos económicos, elecciones arriesgadas).
- Idiomas soportados no documentados; el material de la model card está íntegramente en inglés y los ejemplos de uso también.
- Longitud de contexto no documentada, lo que limita la planificación de prompts largos o perfiles de agente extensos.
- Requisito de hardware elevado (una GPU de 80 GB en bf16) y ausencia de cuantizaciones documentadas para entornos con menos VRAM.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base jaredpalmer/kev-27b y su linaje Qwen 3.5 deben verificarse por separado para confirmar compatibilidad de licencias en producción.
- El despliegue recomendado depende de un servidor externo (`kev`) con un commit concreto (`2074cc4`), lo que introduce un riesgo de mantenimiento y de reproducibilidad.
- El modelo tiene un volumen de adopción muy bajo (47 descargas, 5 likes en el momento de la consulta); no hay validación independiente de los benchmarks reportados por el autor.
- Los benchmarks comparan con modelos propietarios no identificables públicamente (GPT-6 Luna Decisions, GPT-6.1-terra, GLM-5.3); no es posible verificar de forma independiente esas referencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eltokh7/lory-27b-v2
- Modelo base: https://huggingface.co/jaredpalmer/kev-27b
- Modelo hermano Lory-4B v2: https://huggingface.co/eltokh7/lory-4b-v2
- Servidor kev: https://github.com/jaredpalmer/kev
- Script de integración con EDSL: `edsl_decision.py` (incluido en el repositorio del modelo)
