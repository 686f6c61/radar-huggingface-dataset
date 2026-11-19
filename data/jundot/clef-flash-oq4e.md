# Jundot/clef-flash-oQ4e

## Resumen

clef-flash-oQ4e es una versión cuantizada en formato MLX de Cloudflare/clef-flash, un modelo de decisión de 9B parámetros post-entrenado a partir de Qwen3.5-9B. A diferencia de un modelo generativo convencional, clef-flash transforma un estado y un esquema de preguntas tipadas en decisiones, devolviendo una probabilidad para cada opción permitida de cada pregunta en una única pasada forward. El checkpoint incluye el backbone de lenguaje Qwen3.5-9B, el codificador de visión y la cabeza de esquema conjunta (joint schema head).

La cuantización ha sido realizada por Jundot mediante oQ (oMLX v0.8.0), un esquema de cuantización de precisión mixta que asigna bits según la sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) más un reajuste de escala y sesgo por mínimos cuadrados ponderados. El resultado es un checkpoint de 6,123 GiB con una media efectiva de 5,518 bits/peso para el checkpoint completo y 4,842 bits/peso para el backbone de lenguaje.

El modelo es relevante para desarrolladores que necesitan ejecutar un modelo de decisión multimodal de 9B en hardware Apple Silicon mediante MLX, con un pipeline image-text-to-text y licencia Apache-2.0. La actualización de 2026-11-19 re-cuantiza con el redondeo oQe refinado, reduciendo el error de cuantización a igual tamaño y velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3.5-9B + codificador de vision + joint schema head) |
| Parametros totales | 9.409.813.744 (safetensors); 9.532B pesos lógicos según la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ4e: affine 4-bit grupo 64, 5-bit grupo 64, 6-bit grupo 64 y BF16; media 5,518 bits/peso (checkpoint), 4,842 bits/peso (backbone) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 4-bit, quantized |

## Arquitectura y entrenamiento

clef-flash se construye sobre Qwen3.5-9B como backbone de lenguaje, al que se añade un codificador de visión (0,456B pesos lógicos, 0,849 GiB de almacenamiento) y una cabeza de esquema conjunta (0,122B pesos lógicos, 0,227 GiB). El modelo está post-entrenado para la tarea de decisión: recibe un estado y un esquema de preguntas tipadas, y emite en una sola pasada forward una probabilidad por cada opción permitida de cada pregunta. La cabeza de esquema conjunta se copia sin cambios desde el modelo fuente Cloudflare/clef-flash.

El proceso de cuantización oQ4e distribuye los bits según la sensibilidad medida por capa y aplica redondeo con matriz de importancia y reajuste de escala y sesgo. La distribución resultante es: 6,924B pesos en affine 4-bit grupo 64 (72,640% del total, 3,627 GiB, 4,50 bits/peso), 1,012B en 5-bit grupo 64 (10,616%, 0,648 GiB, 5,50 bits/peso), 1,017B en 6-bit grupo 64 (10,671%, 0,770 GiB, 6,50 bits/peso) y 0,579B en BF16 (6,073%, 1,078 GiB, 16,00 bits/peso). El backbone de lenguaje ocupa 5,419 GB (5,047 GiB) y el total del checkpoint 6,574 GB (6,123 GiB). No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Decisión estructurada: devuelve una probabilidad para cada opción permitida de cada pregunta de un esquema tipado en una única pasada forward.
- Procesamiento multimodal image-text-to-text: integra un codificador de visión para incorporar imágenes junto al estado textual.
- Manejo de esquemas de preguntas tipadas con múltiples opciones por pregunta.
- Servicio mediante endpoint dedicado `POST /v1/systemone` en oMLX.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-step, thinking mode, audio ni multilingüismo específico.

## Casos de uso

- Toma de decisiones automatizada con esquemas tipados: el modelo recibe un estado y un conjunto de preguntas con opciones permitidas y devuelve probabilidades por opción en una sola pasada, lo que permite integrarlo en sistemas de scoring o enrutamiento sin generación autoregresiva.
- Clasificación multimodal con imágenes: gracias al codificador de visión, puede incorporar capturas, documentos escaneados o imágenes de producto como parte del estado para decidir entre opciones predefinidas.
- Enrutamiento y triaje en pipelines de atención al cliente: usar el esquema de preguntas para asignar probabilidades a categorías de incidencia, prioridad o departamento destino.
- Evaluación de riesgo y scoring de formularios: aplicar el joint schema head para obtener distribuciones de probabilidad sobre opciones de un cuestionario estructurado, útil en verificación de KYC o compliance.
- Moderación de contenido con criterios tipados: definir un esquema de preguntas sobre políticas y obtener probabilidades por opción para cada ítem, incluido contenido visual.
- Inferencia local en Apple Silicon: al estar en formato MLX con 6,123 GiB de almacenamiento, puede desplegarse en equipos Mac para prototipado y evaluación sin infraestructura GPU dedicada.
- Investigación sobre modelos de decisión: comparar el comportamiento del checkpoint cuantizado frente al modelo fuente Cloudflare/clef-flash en tareas de decisión estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 6,123 GiB en almacenamiento; la memoria necesaria para inferencia no está documentada y debe añadirse el overhead de activaciones y del runtime MLX.
- GPU recomendadas: el modelo está empaquetado para MLX, lo que implica ejecución en Apple Silicon (M-series); no se documentan GPU NVIDIA.
- Cabe en consumer GPU: no disponible para GPU NVIDIA; en Apple Silicon, el tamaño de 6,123 GiB es compatible con equipos de memoria unificada de 16 GB o superior, aunque el requisito exacto no está documentado.
- Opciones de despliegue: oMLX (v0.8.0 o superior), que sirve el checkpoint mediante `POST /v1/systemone`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| clef-flash-oQ4e (este) | 9,41B (9,532B lógicos) | no disponible | MLX safetensors 4-bit mixto | Apache-2.0 | Cuantizado por Jundot, 6,123 GiB |
| Cloudflare/clef-flash (fuente) | no disponible | no disponible | no disponible | Apache-2.0 | Modelo base sin cuantizar |
| Qwen/Qwen3.5-9B | 9B | no disponible | no disponible | no disponible | Backbone de lenguaje del modelo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce error adicional respecto al modelo fuente; la model card indica que la revisión de 2026-11-19 reduce ese error, pero no cuantifica la degradación resultante.
- El modelo está especializado en decisión estructurada con esquemas tipados; no debe esperarse de él generación de texto libre de propósito general.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento de alucinación; estos aspectos deben evaluarse empíricamente antes de usarlo en producción.
- La longitud de contexto no está disponible, lo que impide planificar el tamaño máximo de estado y esquema que puede procesar.
- El formato MLX limita el despliegue a entornos Apple; no hay artefactos documentados para CUDA, GGUF u otros runtimes.
- Licencia Apache-2.0 permite uso comercial, pero debe verificarse el fichero LICENSE incluido y las condiciones del modelo fuente Cloudflare/clef-flash.
- El endpoint `POST /v1/systemone` es específico de oMLX; integrarlo en otros servidores requiere adaptación.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/clef-flash-oQ4e
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Repositorio oQ/oMLX: https://github.com/jundot/omlx
- PR oQe mejorado: https://github.com/jundot/omlx/pull/4930
- PR refinamiento de redondeo oQe: https://github.com/jundot/omlx/pull/5292
