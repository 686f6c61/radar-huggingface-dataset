# dealignai/GLM-5.3-Flash-UNCENSORED-FP8

## Resumen

GLM-5.3-Flash-UNCENSORED-FP8 es una modificación de pesos del modelo zai-org/GLM-5.3-Flash, publicada por dealignai bajo su marca "CRACK". El modelo base es un transformer híbrido de tipo MoE (mezcla de expertos) con atención lineal KDA combinada con atención dispersa estilo DeepSeek, 320.000 millones de parámetros totales y 18.000 millones activos por token. Esta versión aplica una edición permanente en los tensores para eliminar el comportamiento de rechazo (refusals) del modelo original, manteniendo la cuantización FP8 nativa (block-wise e4m3) del checkpoint.

La relevancia de esta ficha es doble: por un lado documenta un modelo de 320B con contexto de 1M de tokens, torre de visión y cabeza de predicción multi-token (MTP) con 75,9 % de aceptación; por otro, advierte de un conjunto de comportamientos de serving medidos por el autor que afectan a la integración en producción (resolución silenciosa de `reasoning_effort`, respuestas vacías por agotamiento de presupuesto en modo `max`, y un fallo de motor con parámetros de vídeo mal configurados).

El modelo se distribuye en safetensors (505,4 GB de repositorio), con licencia MIT y etiquetado únicamente para inglés. Está pensado para despliegue en vLLM o SGLang con parser de razonamiento, y requiere hardware Hopper para aprovechar la velocidad nativa de FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`): transformer híbrido MoE con atención lineal KDA y atención dispersa DeepSeek |
| Parametros totales | 321.323.031.390 (320B) |
| Parametros activos | 18B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 block-wise e4m3 (checkpoint publicado); no se documentan otras variantes en esta release |
| Idiomas soportados | Inglés (`en`); no se documentan otros idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 505,4 GB) |
| Vision | Torre de visión GLM-4.1V, operativa, con plantilla de chat multimodal incluida |
| MTP | Cabeza de predicción multi-token incluida y también modificada; aceptación del 75,9 % |
| Modelo base | zai-org/GLM-5.3-Flash |
| Descargas / likes | 11.344 / 187 |
| Fecha de creación / actualización | 2026-08-26 / 2026-09-19 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida MoE: capas de atención lineal KDA combinadas con atención dispersa de tipo DeepSeek, 320B de parámetros totales y 18B activos por token. Incorpora además una torre de visión heredada de GLM-4.1V y una cabeza MTP (multi-token prediction) que actúa como draft head para decodificación especulativa, con una tasa de aceptación declarada del 75,9 %. El contexto alcanza 1M de tokens.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no se detallan número de tokens, composición del dataset ni si hubo RLHF o DPO. Respecto a esta release concreta, el autor afirma explícitamente que no se ha realizado fine-tuning, SFT, DPO, LoRA, adaptadores, vectores de steering, hooks en runtime ni `model.py` personalizado: la modificación es una edición permanente de los tensores. La release del 2026-08-28 corrige un problema raro de bucles de repetición y declara MMLU del 87,33 % frente al 86,74 % del base, con cero degeneración. La edición se describe como conservadora: el modelo es totalmente sin censura en modo razonamiento desactivado y en esfuerzo máximo (0 % de rechazos en HarmBench-320), mientras que el modo de esfuerzo bajo conserva algunos rechazos de forma deliberada.

## Capacidades

- Generación de texto y razonamiento multi-paso con modos de esfuerzo configurables (`low`, `high`, y `max` como resolución por defecto).
- Procesamiento de imagen mediante torre de visión GLM-4.1V, con control del número de tokens visuales vía `mm_processor_kwargs.max_image_tokens` y `min_image_tokens`.
- Procesamiento de vídeo con muestreo de fotogramas configurable mediante `media_io_kwargs.video.fps`.
- Decodificación especulativa mediante cabeza MTP con 75,9 % de aceptación declarada.
- Contexto largo de hasta 1M de tokens para conversaciones y documentos extensos.
- Comportamiento sin censura a nivel de pesos en modo razonamiento desactivado y en esfuerzo máximo, con 0 % de rechazos declarados en HarmBench-320.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Capacidades multilingües: limitadas a inglés según el etiquetado del repositorio.

## Casos de uso

- Analisis de documentos extensos: con 1M de tokens de contexto, el modelo puede ingerir repositorios completos, expedientes o libros técnicos en una sola petición sin troceado, lo que simplifica pipelines de extracción y resumen.
- Procesamiento de video por lotes: el soporte de vídeo con `fps` configurable permite muestrear clips a 2 fps de forma segura y extraer descripciones o transcripciones estructuradas sin provocar el fallo de motor documentado.
- Investigación sobre alineación y seguridad: al ser una variante sin censura a nivel de pesos, sirve para estudiar el comportamiento de rechazo, comparar contra el base y evaluar mecanismos de filtrado externos.
- Evaluación comparativa de cuantización FP8: al ejecutarse a velocidad nativa en Hopper, es un banco de pruebas para medir latencia y throughput de FP8 frente a BF16 en un MoE de 320B.
- Generación de código y razonamiento técnico: los modos `high` y `max` permiten asignar más presupuesto de cómputo a tareas complejas, siempre con `max_tokens >= 6000` cuando se use `max` para evitar respuestas vacías.
- Atención al cliente automatizada en inglés: conversaciones multi-turno con contexto largo, usando `reasoning_effort: "low"` y `max_tokens: 2000`, configuración que el autor declara limpia en pruebas multi-turno.
- Servicio de inferencia de alto rendimiento: con TP4 sobre H200 en FP8 nativo, el autor declara 163 tok/s en decodificación de un solo flujo y 211 tok/s (dato truncado en la model card) en el escenario agregado.

## Benchmarks y rendimiento

| Benchmark | GLM-5.3-Flash-UNCENSORED-FP8 | GLM-5.3-Flash (base) |
|---|---|---|
| MMLU | 87,33 % | 86,74 % |
| HarmBench-320 (tasa de rechazo, razonamiento off y max) | 0 % | no disponible |
| Aceptación MTP (draft head) | 75,9 % | no disponible |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks estándar. Los datos de velocidad declarados por el autor son: 163 tok/s en decodificación de un solo flujo con TP4 sobre H200 en FP8 nativo, y 211 tok/s en una medición adicional cuyo enunciado aparece truncado en la model card.

## Requisitos de hardware

- VRAM estimada: el repositorio de pesos ocupa 505,4 GB en FP8; se requiere un conjunto multi-GPU con al menos 512 GB de memoria agregada solo para los pesos, más espacio para caché KV de contexto largo.
- GPU recomendadas: H100 y H200 (Hopper) para aprovechar la velocidad nativa de FP8 en tensor cores. El autor reporta pruebas con TP4 sobre H200.
- GPU de consumo: no cabe en ninguna GPU consumer actual; 320B en FP8 excede la VRAM de una RTX 4090 (24 GB) en más de un orden de magnitud.
- Opciones de despliegue: vLLM y SGLang con parser de razonamiento. Se documentan diferencias de comportamiento entre la línea nightly de vLLM y la línea `0.1.dev*`.
- Throughput declarado: 163 tok/s single-stream y 211 tok/s en la medición agregada truncada, con TP4 en H200.
- Advertencia de serving: `reasoning_effort` solo acepta `low` y `high`; cualquier otro valor, o su omisión, resuelve silenciosamente a `max`. En `max` con `max_tokens` pequeño la respuesta llega vacía con `finish_reason="length"`. No debe pasarse `enable_thinking`. El razonamiento se devuelve en `message.reasoning`. `clear_thinking` debe anidarse dentro de `chat_template_kwargs`.
- Advertencia de vídeo: `media_io_kwargs.video.fps` debe ser inferior al framerate del clip; un valor igual o superior provoca `EngineDeadError` y tumba el servidor (vLLM #55644 y #55647). `max_frames` y `num_frames` no son intercambiables entre builds; `fps` sí se respeta en todas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-UNCENSORED-FP8 | 320B | 18B | 1M | MIT | Variante sin censura, FP8, visión y MTP |
| zai-org/GLM-5.3-Flash | 320B | 18B | 1M | no disponible en la información | Modelo base, con rechazos; MMLU 86,74 % |
| dealignai/GLM-5.3-Flash-ABLITERATED-FP8 | 320B | 18B | 1M | MIT | Espejo alternativo del mismo autor |

No se dispone de datos de benchmarks ni de especificaciones de otros modelos comparables de la misma categoría en la información proporcionada, por lo que la comparación con alternativas de terceros queda como no disponible.

## Limitaciones y advertencias

- La eliminación de rechazos es una modificación deliberada de los pesos: el modelo puede generar contenido dañino, ilegal o sexualmente explícito sin filtro interno. Requiere moderación externa en cualquier despliegue público.
- El modo de esfuerzo bajo conserva rechazos por diseño; no es un fallo, sino una decisión del autor.
- Riesgo de alucinación: no se documentan evaluaciones específicas de factualidad; el único dato de calidad es MMLU.
- Idiomas: solo inglés etiquetado. El rendimiento en castellano u otros idiomas no está documentado y no debe asumirse.
- Contexto de 1M de tokens: la caché KV a esa longitud es muy costosa en memoria; el contexto efectivo en producción dependerá del hardware.
- Fallo de motor conocido con parámetros de vídeo mal configurados (`fps` igual o superior al del clip), que deja el servidor caído hasta reiniciarlo.
- Respuestas vacías en modo `max` con presupuesto insuficiente de tokens; en multi-turno, un turno vacío contamina el historial y la conversación no se recupera.
- Incompatibilidades de parámetros entre builds de vLLM (`max_frames` frente a `num_frames`), que pueden degradar silenciosamente el coste en tokens.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo del contenido generado.
- El repositorio pesa 505,4 GB; la descarga y el almacenamiento son costosos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Espejo del autor: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Perfil del autor: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
- Issues de vLLM citados por el autor: #55644 y #55647 (no se dispone de URL directa en la información proporcionada)
