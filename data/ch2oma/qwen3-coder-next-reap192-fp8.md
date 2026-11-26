# ch2oma/qwen3-coder-next-reap192-fp8

## Resumen

Qwen3-Coder-Next REAP-192 es una variante podada del modelo Qwen3-Coder-Next (80B-A3B) desarrollada por el usuario ch2oma. Se trata de un checkpoint intermedio que aplica la técnica REAP (Router-weighted Expert Activation Pruning) para reducir el número de expertos enrutados por capa de 512 a 192, eliminando aproximadamente el 62% de los expertos del modelo original. El resultado es un modelo de arquitectura MoE con unos 31.300 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, manteniendo el enrutamiento top-10 del modelo padre.

El modelo conserva intactos los componentes de atención, DeltaNet, expertos compartidos, embeddings y lm_head; únicamente se modifican las capas MoE y el router. Los pesos se mantienen en formato block-FP8 (128×128) con `weight_scale_inv`, lo que requiere GPUs con soporte FP8 (Hopper o Ada) para su uso directo con transformers, aunque también es compatible con vLLM. Se distribuye además una cuantización GGUF IQ4_XS de aproximadamente 17 GB orientada a GPUs de 24 GB como la RTX A5000.

Es relevante ahora porque demuestra un flujo de compresión agresiva de modelos MoE de gran tamaño manteniendo buena parte de su rendimiento en tareas de código, y porque constituye la primera etapa de una hoja de ruta que incluye destilación de logits desde el modelo profesor de 80B y abliteration posterior. El autor advierte explícitamente de que este checkpoint aún no ha pasado por la fase de "healing" o destilación, por lo que su calidad es inferior a la del modelo padre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención y DeltaNet (qwen3_next), poda REAP de expertos |
| Parametros totales | 31.324.551.936 (~31,3B) |
| Parametros activos | ~3B (top-10 routing) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 block (128×128) original; GGUF IQ4_XS con imatrix |
| Idiomas soportados | no disponible (el modelo padre está orientado a código) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Coder-Next, un MoE de 80B parámetros totales con 3B activos y 512 expertos enrutados por capa. La poda REAP calcula una saliencia por experto definida como la media, sobre los tokens enrutados, del producto entre el peso de router renormalizado y la norma L2 de la salida del experto. Con esa métrica se conservan los 192 expertos más salientes por capa, se remapean los índices y se recortan las filas correspondientes del router (`mlp.gate`). Los índices conservados se publican en `reap_keep.json`.

La calibración se realizó sobre 1.024 ventanas de 2.048 tokens (unos 2,1 millones de tokens) de código escrito por el profesor, procedentes del dataset `ch2oma/qwen3-coder-next-kd-top20`, construido con prompts de Magicoder-OSS y evol-codealpaca y decontaminado frente a HumanEval y MBPP. La saliencia se computó cargando el checkpoint FP8 oficial con transformers 4.57.1 sobre una H200. No se ha aplicado todavía destilación ni healing; el autor lo indica explícitamente como paso pendiente de su hoja de ruta.

## Capacidades

- Generación de código en Python y otros lenguajes, con evaluación específica en HumanEval y MBPP.
- Razonamiento y resolución de problemas de programación en formato de script autocontenido.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de cuantización GGUF para despliegue en GPUs de consumo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, agentes y modos de razonamiento explícito: no disponibles en la información proporcionada.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines que requieran síntesis de funciones Python autocontenidas, ámbito en el que conserva puntuaciones cercanas al modelo padre (91,5 frente a 92,7 en HumanEval) pese a la poda.
- Asistentes de programación en GPUs de 24 GB: gracias a la cuantización IQ4_XS de ~17 GB, puede desplegarse en una RTX A5000 o similar para autocompletado y generación de código en local.
- Evaluación de técnicas de compresión de MoE: sirve como referencia reproducible para investigar el impacto de REAP en modelos con enrutamiento top-k, dado que publica los índices conservados y el dataset de calibración.
- Prototipado de pipelines de CI/CD con verificación de código: el modelo puede generar parches o tests unitarios que luego se validan automáticamente, aprovechando su rendimiento en MBPP (91,8).
- Investigación en destilación de conocimiento: al ser un checkpoint intermedio de una hoja de ruta con destilación de logits top-20 desde el profesor de 80B, es útil como punto de partida para estudiar el efecto del healing.
- Despliegue con vLLM en infraestructura Hopper o Ada: el formato FP8 block permite servir el modelo con aceleración nativa en GPUs con soporte FP8, manteniendo los 31B totales pero activando solo ~3B por token.

## Benchmarks y rendimiento

| Modelo | HumanEval | HumanEval+ | MBPP | MBPP+ |
|---|---|---|---|---|
| Qwen3-Coder-Next 80B FP8 (padre) | 92,7 | 87,2 | 91,8 | 76,7 |
| Este modelo, IQ4_XS (imatrix), ~17 GB, antes de healing | 91,5 | 85,4 | 91,8 | 75,9 |

Evaluación con EvalPlus, decodificación greedy, máximo 1.536 tokens nuevos, prompt: "Please provide a self-contained Python script that solves the following problem in a markdown code block". Las puntuaciones se midieron con llama.cpp sobre GPU.

## Requisitos de hardware

- VRAM estimada: ~17 GB para la cuantización GGUF IQ4_XS; el checkpoint FP8 completo ocupa aproximadamente 49,2 GB en el repositorio.
- GPU recomendadas: H200 (usada para el cálculo de saliencia), GPUs Hopper o Ada para FP8 con transformers; RTX A5000 (24 GB) como objetivo declarado para la versión GGUF.
- Cabe en GPU de consumo: sí, con la cuantización IQ4_XS en GPUs de 24 GB; no disponible para GPUs de menor VRAM.
- Opciones de despliegue: transformers (FP8, requiere soporte de hardware), vLLM, llama.cpp (con `--outtype bf16` para dequantizar FP8).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Coder-Next REAP-192 (este) | ~31,3B | ~3B | no disponible | Apache-2.0 | Hugging Face (ch2oma) |
| Qwen3-Coder-Next 80B (padre) | ~80B | ~3B | no disponible | Apache-2.0 | Hugging Face (Qwen) |
| Qwen2.5-Coder | no disponible | no disponible | no disponible | no disponible | Hugging Face (Qwen) |

La comparación con Qwen2.5-Coder figura en la hoja de ruta del autor como evaluación pendiente, por lo que no hay datos de rendimiento comparativos en la información disponible.

## Limitaciones y advertencias

- Checkpoint intermedio sin healing ni destilación: el propio autor advierte de que la calidad es inferior a la del modelo padre hasta completar la fase de KD.
- La poda elimina el 62% de los expertos enrutados, lo que puede degradar capacidades no cubiertas por los datos de calibración (código).
- La calibración se hizo exclusivamente con datos de código, por lo que el comportamiento en otros dominios no está caracterizado.
- Requiere GPU con soporte FP8 (Hopper/Ada) para usar el checkpoint safetensors directamente con transformers.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Idiomas soportados: no especificados; el modelo padre está orientado a código.
- Licencia Apache-2.0 permite uso comercial, pero el estado incompleto del modelo desaconseja su uso en producción sin validación previa.
- No hay resultados de benchmarks en tareas distintas de generación de código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ch2oma/qwen3-coder-next-reap192-fp8
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Dataset de destilación: https://huggingface.co/datasets/ch2oma/qwen3-coder-next-kd-top20
- Paper REAP (Cerebras Research): "REAP: One-Shot Pruning for Trillion-Parameter Mixture-of-Experts Models" (referenciado en la model card, sin URL directa en la información disponible)
