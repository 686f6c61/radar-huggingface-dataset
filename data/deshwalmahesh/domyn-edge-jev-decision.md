# deshwalmahesh/domyn-edge-jev-decision

## Resumen

D-Edge-Decision es un ajuste fino completo (full fine-tune) del modelo `domyn/Domyn-Edge-SFT`, publicado por el usuario deshwalmahesh en Hugging Face. Se trata de un modelo de 3.928.787.968 parámetros (aproximadamente 3,93B) especializado en la toma de decisiones tipadas: respuestas de sí/no, elección múltiple y puntuaciones graduadas. Su particularidad es que no genera tokens de forma autoregresiva, sino que lee directamente la distribución de probabilidad del siguiente token sobre los códigos de opción (`A`, `B`, …), obteniendo así una distribución nativa en un único forward pass.

El modelo se presenta como un sistema "System One": una sola pasada, cero tokens generados. Esto lo diferencia de los LLM conversacionales convencionales y lo orienta a escenarios donde se requiere una decisión rápida, calibrada y con una medida de incertidumbre asociada, en lugar de una respuesta en lenguaje natural. Está entrenado sobre tres conjuntos de datos de decisiones tipadas y evaluado con el benchmark JevBench.

Es relevante ahora porque propone una alternativa eficiente en coste y latencia a los modelos generativos en tareas de clasificación y decisión estructurada, con licencia Apache 2.0 y pesos en safetensors. El modelo está orientado al idioma inglés y su uso principal es la generación de texto en formato de decisión tipada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Domyn-Edge-SFT); no se detalla la arquitectura interna en la información disponible |
| Parametros totales | 3.928.787.968 (≈3,93B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de la model card usa bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 23,6 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo sobre `domyn/Domyn-Edge-SFT`, un modelo base de aproximadamente 3,93B parámetros. La model card no detalla la arquitectura interna del modelo base (número de capas, dimensiones, mecanismo de atención o si incorpora innovaciones como atención lineal), por lo que estos datos no están disponibles. El autor indica que se trata de un fine-tune de una sola ejecución y una sola época, sin ablaciones, lo que sugiere un proceso de entrenamiento directo y no iterativo.

La innovación técnica principal es el mecanismo de decisión: en lugar de generar texto, el modelo evalúa la distribución del siguiente token restringida a los códigos de opción de un solo token (`A`, `B`, …, y combinaciones de dos letras). El ejemplo de reproducción de la model card fuerza el LM head y los ángulos RoPE a fp32 para estabilizar el cálculo de probabilidades, y utiliza `logits_to_keep=1` para leer únicamente la posición de decisión. El entrenamiento se realizó sobre tres datasets de decisiones tipadas: `tasksource/tasksource-jev-typed-decisions`, `caiovicentino1/eikos-decisions` y `crh225/plumb-decisions`. No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Toma de decisiones tipadas: respuestas de sí/no, elección múltiple y puntuaciones graduadas mediante distribución de probabilidad sobre códigos de opción.
- Decisión en un único forward pass, sin generación de tokens, lo que reduce la latencia frente a modelos generativos.
- Calibración e incertidumbre: al devolver una distribución nativa sobre las opciones, permite medir la confianza de la decisión.
- Generación de texto en el pipeline `text-generation` (etiqueta declarada), aunque su uso previsto es la decisión tipada.
- Soporte de plantilla de chat (la model card usa `apply_chat_template` con `enable_thinking=False`).
- Capacidades multilingües: limitadas al inglés según la información disponible.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Clasificación binaria automatizada: el modelo puede resolver preguntas de sí/no leyendo la probabilidad del token de opción, útil en pipelines de moderación o filtrado donde se necesita una decisión rápida y calibrada.
- Enrutamiento de consultas en atención al cliente: dado un estado o contexto y una pregunta, el modelo elige entre opciones predefinidas (por ejemplo, departamento o categoría) en una sola pasada, reduciendo coste frente a un LLM generativo.
- Evaluación de calidad con puntuación graduada: puede asignar una puntuación de una escala predefinida a un texto, aprovechando la distribución sobre los códigos de puntuación para obtener una medida de incertidumbre.
- Triaje en sistemas de soporte: con preguntas de elección múltiple sobre el estado de un caso, el modelo selecciona la categoría adecuada, adecuado por su bajo coste por decisión.
- Análisis de decisiones en investigación: la distribución nativa sobre opciones permite estudiar calibración y sesgos en modelos pequeños sin la variabilidad de la generación autoregresiva.
- Automatización de encuestas y formularios: conversión de respuestas abiertas en decisiones tipadas (sí/no, opción múltiple) para su procesamiento posterior.
- Filtrado previo en pipelines RAG: decidir si un documento es relevante para una consulta mediante una pregunta de sí/no en un único forward pass.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre JevBench (231 ítems públicos), medidos por el autor en una H200 el 2026-11-26:

| Puesto | Sistema | Composite | Intelligence | Speed | Cost |
|---|---|---|---|---|---|
| 1 | Plumb-4B | 76,57 | 84,77 | 92,61 | 60,30 |
| 2 | H2O-Lightning-4B † | 76,40 | 84,14 | 92,61 | 60,30 |
| 3 | Imajev-4B | 75,13 | 79,70 | 92,61 | 60,30 |
| 4 | JevK5 v0.2.0 | 74,75 | 78,43 | 92,61 | 60,30 |
| 5 | **D-Edge-Decision (ours)** | **73,97** | **75,89** | 92,61 | 60,30 |
| 5 | decider-4b v2 | 73,97 | 75,89 | 92,61 | 60,30 |
| 7 | SemIf (Qwen3.5-4B) | 72,72 | 72,09 | 92,61 | 60,30 |
| 8 | local-jev Qwen3.5-4B | 72,50 | 71,45 | 92,61 | 60,30 |
| 9 | Jev 1.13.0 (API) | 72,03 | 80,33 | 91,50 | 54,73 |
| 10 | reflex 4B | 71,84 | 69,55 | 92,61 | 60,30 |

Desglose por dificultad:

| Tier | Correctas | Precisión |
|---|---|---|
| easy | 48/48 | 1,000 |
| medium | 70/72 | 0,972 |
| hard | 75/111 | 0,676 |
| all | 193/231 | 0,835 |

Nota del autor: los valores de Speed y Cost son idénticos para todos los modelos de 4B (fila de H2O-Lightning-4B en el tablero); el Composite es la media armónica de las tres métricas. El modelo empata en el puesto 5 con decider-4b v2.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8 GB solo para pesos (3,93B parámetros × 2 bytes), más overhead de activaciones y caché; el repo completo ocupa 23,6 GB, probablemente por múltiples formatos o checkpoints.
- GPU recomendadas: el autor reporta mediciones en una NVIDIA H200; para inferencia en bfloat16 es suficiente una GPU con 16 GB o más (por ejemplo, RTX 4090, A100 40 GB, L40S).
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más de VRAM en bfloat16; en cuantizaciones de 8 o 4 bits podría caber en GPUs de 8-12 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: al ser un modelo de `transformers` con `custom_code` y `trust_remote_code=True`, se puede cargar con la librería Transformers; no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el autor indica que la reproducción de JevBench tarda aproximadamente 1 minuto en una GPU; no se publican cifras de latencia por petición ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench Composite | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D-Edge-Decision | ≈3,93B | no disponible | 73,97 | Apache 2.0 | Hugging Face |
| Plumb-4B | ≈4B | no disponible | 76,57 | no disponible | no disponible |
| decider-4b v2 | ≈4B | no disponible | 73,97 | no disponible | no disponible |
| SemIf (Qwen3.5-4B) | ≈4B | no disponible | 72,72 | no disponible | no disponible |

Los datos de contexto, licencia y disponibilidad de los modelos comparables no están incluidos en la información proporcionada, por lo que se indican como no disponibles.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en inglés; no se garantiza un comportamiento correcto en otros idiomas.
- La precisión en el tier difícil de JevBench es del 67,6%, lo que indica un rendimiento limitado en decisiones complejas.
- Al tratarse de un fine-tune de una sola época sin ablaciones, no se documenta la robustez frente a distribuciones de datos distintas de las de entrenamiento.
- Riesgo de alucinación y de calibración deficiente fuera del dominio de los datasets de entrenamiento; la distribución de probabilidad no garantiza una incertidumbre bien calibrada en dominios nuevos.
- No se documentan sesgos conocidos, pero al derivar de un modelo base no se puede descartar la herencia de sesgos de sus datos de preentrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `domyn/Domyn-Edge-SFT` podría tener condiciones adicionales que no se detallan en la información disponible.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código remoto antes de usarlo en producción.
- No se especifica la longitud de contexto soportada, lo que limita la planificación de despliegues con estados o contextos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deshwalmahesh/domyn-edge-jev-decision
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-SFT
- Repositorio de JevBench: https://github.com/fstandhartinger/jevbench
- Dataset tasksource/tasksource-jev-typed-decisions: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset caiovicentino1/eikos-decisions: https://huggingface.co/datasets/caiovicentino1/eikos-decisions
- Dataset crh225/plumb-decisions: https://huggingface.co/datasets/crh225/plumb-decisions
