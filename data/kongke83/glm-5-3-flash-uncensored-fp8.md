# kongke83/GLM-5.3-Flash-UNCENSORED-FP8

## Resumen

GLM-5.3-Flash-UNCENSORED-FP8 es una versión modificada a nivel de pesos del modelo GLM-5.3-Flash de Z.ai (zai-org), publicada por el usuario kongke83 bajo la marca "CRACK" de dealignai. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) híbrido con 321.323 millones de parámetros totales y 18.000 millones activos por token, cuantizado en FP8 (block-wise e4m3) y con la torre de visión GLM-4.1V integrada. La modificación consiste en la eliminación ("abliteration") del comportamiento de rechazo del modelo base directamente en los tensores, sin fine-tuning, LoRA ni vectores de dirección en tiempo de ejecución.

El modelo resuelve el problema del sobre-rechazo del modelo original, que según el autor afectaba especialmente a peticiones benignas marcadas como sensibles (por ejemplo, contenido con copyright). Al estar cuantizado en FP8, está pensado para ejecutarse a velocidad nativa en GPUs Hopper (H100/H200) mediante vLLM o SGLang, y conserva la cabeza de predicción multi-token (MTP) para decodificación especulativa, también modificada. El contexto declarado alcanza 1 millón de tokens.

Es relevante ahora porque combina tres elementos poco habituales en un mismo artefacto: un MoE de gran escala con atención lineal KDA y atención dispersa tipo DeepSeek, una cuantización FP8 nativa para hardware Hopper y una edición de pesos orientada a eliminar rechazos preservando la calidad (el autor reporta MMLU del 87,33 %, por encima del 86,74 % del base). La licencia es MIT, aunque el modelo base y su procedencia conviene verificarlos por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`): MoE híbrido con atención lineal KDA y atención dispersa tipo DeepSeek |
| Parametros totales | 321.323.031.390 (≈320B) |
| Parametros activos | 18B por token |
| Longitud de contexto | 1.000.000 tokens (según model card) |
| Tipos de cuantizacion | FP8 block-wise e4m3 (pesos publicados); no se indican otras variantes en el repo |
| Idiomas soportados | en (inglés, según metadatos y model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 328,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE híbrido identificado como `glm5_next`, que combina atención lineal KDA (Kernelized/Linear Decomposed Attention, según la nomenclatura del autor) con atención dispersa tipo DeepSeek. El modelo activa 18B de sus 320B parámetros por token, lo que reduce el coste computacional de inferencia respecto a un denso equivalente. Incluye una torre de visión heredada de GLM-4.1V y una cabeza de predicción multi-token (MTP) que actúa como draft head para decodificación especulativa, con una tasa de aceptación declarada del 75,9 %.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO): no disponible. La modificación de esta release es una edición directa de los tensores para eliminar el comportamiento de rechazo, sin SFT, DPO, LoRA, adaptadores, vectores de dirección ni hooks en tiempo de ejecución. El autor indica que la edición es conservadora para preservar la calidad y que el modelo funciona con vLLM estándar sin código personalizado. La versión actual (actualizada el 2026-08-28 según la model card) corrige un problema raro de bucles de repetición presente en pesos anteriores.

## Capacidades

- Generación de texto y razonamiento con modos de esfuerzo configurables (`low`, `high` y `max` como valor por defecto cuando se omite o se pasa un valor no válido).
- Modo de razonamiento explícito con bloque `<think>`; la respuesta de razonamiento se devuelve en `message.reasoning`.
- Visión: procesamiento de imágenes y vídeo mediante la torre GLM-4.1V, con control de tokens visuales vía `mm_processor_kwargs.max_image_tokens` / `min_image_tokens` y muestreo de vídeo vía `media_io_kwargs.video.fps`.
- Decodificación especulativa mediante la cabeza MTP (75,9 % de aceptación declarada).
- Comportamiento sin rechazos en los modos de razonamiento desactivado y de esfuerzo máximo (0 % de rechazos en HarmBench-320 según el autor); el modo `low` conserva algunos rechazos por diseño.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y robustez: el modelo permite estudiar el efecto de la abliteración a nivel de pesos comparando su comportamiento con el GLM-5.3-Flash original, manteniendo una calidad declarada de MMLU del 87,33 % frente al 86,74 % del base.
- Procesamiento de documentos largos: con 1M tokens de contexto, es adecuado para analizar expedientes, contratos o bases de código extensas en una sola pasada, sin trocear el material.
- Análisis de vídeo e imagen: la torre de visión funcional permite tareas de descripción, extracción de información y respuesta a preguntas sobre imágenes y clips, controlando el coste en tokens mediante `fps` y `max_image_tokens`.
- Generación de contenido creativo sin restricciones de rechazo: útil en entornos editoriales o de ficción donde el modelo base rechazaba peticiones benignas por falsos positivos, especialmente en temáticas de copyright.
- Despliegue de alto rendimiento en clústeres Hopper: con FP8 nativo y decodificación especulativa MTP, encaja en servicios de inferencia con vLLM o SGLang sobre H100/H200, donde el autor reporta 163 tok/s en decodificación de un solo flujo con TP4.
- Evaluación de seguridad de pipelines: sirve como caso adverso controlado para probar filtros de contenido, clasificadores de salida y políticas de moderación en sistemas que consumen modelos sin alineación.
- Investigación en eficiencia de MoE: los 18B parámetros activos sobre 320B totales permiten estudiar trade-offs de enrutamiento y latencia en despliegues multi-GPU.

## Benchmarks y rendimiento

| Benchmark | GLM-5.3-Flash-UNCENSORED-FP8 | GLM-5.3-Flash (base) |
|---|---|---|
| MMLU | 87,33 % | 86,74 % |
| HarmBench-320 (tasa de rechazo, modos off/max) | 0 % | no disponible |
| Aceptación MTP (draft head) | 75,9 % | no disponible |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU-Pro, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 321 GB (328,4 GB de repo), por lo que la inferencia requiere al menos 4 GPUs de 80 GB en tensor parallelism (TP4) para alojar los pesos, más margen para KV cache.
- GPUs recomendadas: H100 y H200 (FP8 nativo en tensor cores Hopper). El autor reporta TP4 sobre H200 con 163 tok/s en decodificación de un solo flujo y 211 tok/s en el dato parcial disponible.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de 80 GB.
- Opciones de despliegue: vLLM y SGLang con parser de razonamiento; se requiere configuración específica del chat template (`reasoning_effort` en `chat_template_kwargs`, `clear_thinking` anidado, sin `enable_thinking`).
- Advertencias de despliegue: con `reasoning_effort` en `max` y `max_tokens` bajo (2000) la respuesta sale vacía por agotamiento de presupuesto; se recomienda `max_tokens >= 6000` para `max`, o bien `low`/`high` con 2000. En vídeo, `fps` debe ser inferior a la tasa de frames del clip para evitar `EngineDeadError` (incidencias upstream vLLM #55644 y #55647).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-UNCENSORED-FP8 | 320B | 18B | 1M | MIT | safetensors FP8 | Abliterado, visión y MTP funcionales |
| GLM-5.3-Flash (base) | 320B | 18B | 1M | no disponible en la información | no disponible | Modelo original de zai-org, con rechazos |
| dealignai/GLM-5.3-Flash-ABLITERATED-FP8 | 320B | 18B | 1M | no disponible en la información | safetensors FP8 | Espejo del mismo artefacto según la model card |

No se dispone de datos suficientes sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de rechazos es deliberada: el modelo puede generar contenido dañino, ilegal o sensible sin filtros, lo que exige moderación externa en cualquier despliegue público.
- El modo `low` conserva rechazos por diseño; el comportamiento plenamente sin filtros solo se garantiza en razonamiento desactivado y esfuerzo máximo.
- Riesgo de bucles de repetición: la versión actual corrige un problema previo, pero conviene validar en producción con prompts largos y multi-turno.
- El modo `max` con presupuesto de tokens insuficiente devuelve respuestas vacías y contamina el historial multi-turno; es un fallo de configuración con impacto directo en la experiencia de usuario.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está verificado y probablemente sea inferior.
- La licencia MIT se aplica a esta release, pero la procedencia y licencia del modelo base GLM-5.3-Flash deben verificarse por separado antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es la organización original: no hay validación comunitaria independiente de los resultados declarados.
- Los benchmarks reportados (MMLU, HarmBench, aceptación MTP) provienen exclusivamente de la model card del autor y no han sido replicados de forma independiente.
- El tamaño (328,4 GB) y los requisitos de hardware Hopper limitan su uso a infraestructuras con múltiples GPUs de 80 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kongke83/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Espejo del autor: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Perfil del autor de la release: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
- Incidencia vLLM #55644: https://github.com/vllm-project/vllm/issues/55644
- Incidencia vLLM #55647: https://github.com/vllm-project/vllm/issues/55647
