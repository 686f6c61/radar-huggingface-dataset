# FATCATHOLICGIRL1/GLM-5.3-Flash-UNCENSORED-FP8

## Resumen

GLM-5.3-Flash-UNCENSORED-FP8 es una versión modificada a nivel de pesos del modelo GLM-5.3-Flash de Z.ai (zai-org), publicada por el usuario FATCATHOLICGIRL1 bajo la marca "CRACK" de dealignai. Se trata de un modelo de arquitectura híbrida MoE (`glm5_next`) con 320 mil millones de parámetros totales y 18 mil millones activos por token, cuantizado en FP8 con precisión de bloque e4m3. La modificación consiste en la eliminación del comportamiento de rechazo (refusal) directamente en los tensores, sin recurrir a fine-tuning, DPO, LoRA ni técnicas de jailbreak a nivel de prompt.

El modelo conserva las capacidades del base: ventana de contexto de 1 millón de tokens, torre de visión GLM-4.1V funcional y cabeza de predicción multi-token (MTP) con una tasa de aceptación del 75,9%. La relevancia de esta ficha radica en que documenta una variante "abliterated" de un modelo frontera, con implicaciones importantes tanto técnicas (gestión de modos de razonamiento, parámetros multimodales frágiles en vLLM) como de uso responsable (eliminación de salvaguardas).

La licencia declarada es MIT, heredada del modelo base, y el repositorio ocupa 328,4 GB en safetensors. El modelo está pensado para despliegue en infraestructura Hopper (H100/H200) con vLLM o SGLang, donde el FP8 nativo ofrece velocidad de tensor cores sin penalización de conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`), MoE híbrido con atención lineal KDA y atención dispersa estilo DeepSeek |
| Parámetros totales | 321.323.031.390 (~320B) |
| Parámetros activos | 18B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | FP8 (block-wise e4m3); el base admite otras cuantizaciones, esta release solo FP8 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Visión | Torre GLM-4.1V, funcional, con plantilla multimodal incluida |
| MTP | Cabeza de predicción multi-token incluida, 75,9% de aceptación |
| Tamaño del repo | 328,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es `glm5_next`, un transformer MoE híbrido que combina atención lineal KDA (Kernelized Delta Attention) con atención dispersa de tipo DeepSeek. Con 320B parámetros totales y 18B activos por token, el modelo mantiene un coste de inferencia por token comparable a un modelo denso de ~18B, pero con la capacidad representacional de un modelo mucho mayor. La ventana de contexto alcanza 1M tokens. El modelo incorpora además una torre de visión basada en GLM-4.1V y una cabeza MTP (multi-token prediction) que actúa como draft head para decodificación especulativa, con una tasa de aceptación medida del 75,9%.

Sobre el entrenamiento original de GLM-5.3-Flash no se dispone de detalles en la información proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO): no disponible. La modificación de esta release es una edición directa de pesos (weight-level abliteration) que elimina el comportamiento de rechazo sin SFT, DPO, LoRA, adaptadores, vectores de steering ni hooks en tiempo de ejecución. Según la model card, la edición se mantuvo deliberadamente conservadora para preservar la calidad: el modo de razonamiento "low" conserva algunos rechazos por diseño, mientras que los modos reasoning-off y max effort presentan un 0% de rechazos en HarmBench-320. La release del 2026-08-28 corrige un problema raro de bucles de repetición y reporta MMLU 87,33%, por encima del base (86,74%).

## Capacidades

- Generación de texto y razonamiento multi-step con modos de esfuerzo configurables (`low`, `high`, y `max` como fallback).
- Razonamiento profundo en modo `max`, con salida de reasoning separada en `message.reasoning`.
- Capacidades de visión: procesamiento de imágenes y vídeo mediante la torre GLM-4.1V, con control de tokens de imagen (`max_image_tokens`, `min_image_tokens`) y muestreo de vídeo por FPS.
- Decodificación especulativa mediante cabeza MTP con 75,9% de aceptación, lo que acelera la generación.
- Contexto largo de hasta 1M tokens, apto para documentos extensos y conversaciones multi-turno prolongadas.
- Comportamiento sin rechazos en modos reasoning-off y max effort (0% en HarmBench-320 según el autor).
- Soporte multilingüe limitado al inglés según la model card.
- Tool calling / function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes: no documentado explícitamente en la información disponible.

## Casos de uso

- Procesamiento de documentos extensos: con 1M tokens de contexto, el modelo puede ingerir informes completos, expedientes o bases de código y responder preguntas sobre ellos sin fragmentación ni recuperación externa.
- Análisis de vídeo e imagen: gracias a la torre GLM-4.1V y al control de FPS (`media_io_kwargs.video.fps`), se puede usar para inspección visual automatizada, moderación de contenido o extracción de información de grabaciones, ajustando el coste de tokens por clip.
- Generación de código en pipelines: el modelo base está orientado a tareas de código y razonamiento; esta variante FP8 permite desplegarlo en servidores Hopper con vLLM para autocompletado y revisión en CI/CD, aunque el tool calling no está documentado.
- Investigación sobre alineación y seguridad: al ser una variante abliterated con comportamiento de rechazo eliminado, resulta útil para estudiar diferencias de comportamiento respecto al base, medir tasas de rechazo y analizar sesgos residuales.
- Razonamiento de alta profundidad con presupuesto controlado: usando `reasoning_effort: "high"` y `max_tokens` holgado, se puede emplear en tareas matemáticas o lógicas que requieren cadenas de pensamiento largas sin el riesgo de respuestas vacías del modo `max`.
- Despliegue de alto rendimiento en producción: con FP8 nativo en H100/H200 y decodificación especulativa MTP (163 tok/s single-stream en TP4 según el autor), es adecuado para servicios de inferencia con requisitos de latencia estrictos.
- Procesamiento por lotes de contenido sensible a filtros: para equipos que necesitan analizar material que los modelos alineados rechazan (por ejemplo, análisis de textos con contenido violento o controvertido con fines de moderación o investigación), aunque con las advertencias legales correspondientes.

## Benchmarks y rendimiento

| Benchmark | Este modelo | GLM-5.3-Flash base |
|---|---|---|
| MMLU | 87,33% | 86,74% |
| HarmBench-320 (tasa de rechazo, reasoning-off/max) | 0% | no disponible |
| Aceptación MTP | 75,9% | no disponible |

Rendimiento medido por el autor en TP4 con FP8 nativo sobre H200: 163 tok/s en decodificación single-stream y 211 tok/s en el dato adicional que aparece truncado en la model card. No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: con 321B parámetros en FP8 (~1 byte por parámetro), se requieren al menos ~320 GB de VRAM solo para pesos, más overhead de KV cache y activaciones. El repositorio pesa 328,4 GB.
- GPU recomendadas: H100 u H200 en configuraciones multi-GPU (TP4 según las mediciones del autor). El FP8 block-wise e4m3 aprovecha los tensor cores de Hopper de forma nativa.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090 con 24 GB, etc.) ni en configuraciones multi-GPU de consumo razonables.
- Opciones de despliegue: vLLM y SGLang con parser de razonamiento. Requiere configuración cuidadosa: `reasoning_effort` solo acepta `low` y `high`; no pasar `enable_thinking`; `clear_thinking` debe ir anidado en `chat_template_kwargs`; `media_io_kwargs.video.fps` debe ser inferior al FPS del clip para evitar `EngineDeadError`.
- Latencia y throughput: 163 tok/s single-stream y 211 tok/s (dato truncado) en TP4 sobre H200 con FP8 nativo, según el autor.
- Advertencia de memoria: en modo `max`, con `max_tokens` bajo (p. ej. 2000) el modelo devuelve respuestas vacías por agotamiento de presupuesto; se recomienda `max_tokens >= 6000` para ese modo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| GLM-5.3-Flash-UNCENSORED-FP8 | 320B totales / 18B activos | 1M | MIT | Variante abliterated FP8, visión y MTP |
| zai-org/GLM-5.3-Flash (base) | 320B totales / 18B activos | 1M | MIT | Modelo original con salvaguardas; MMLU 86,74% |
| dealignai/GLM-5.3-Flash-ABLITERATED-FP8 | 320B totales / 18B activos | 1M | MIT | Espejo de esta release según la model card |

No se dispone en la información proporcionada de comparaciones con otros modelos de la misma categoría (por ejemplo, otros MoE de ~300B con contexto de 1M): no disponible.

## Limitaciones y advertencias

- Eliminación de salvaguardas: el comportamiento de rechazo se ha suprimido a nivel de pesos. Esto implica riesgo de generar contenido dañino, ilegal o éticamente problemático sin filtro. El uso comercial debe evaluarse con cuidado aunque la licencia sea MIT.
- Sesgos: no documentados en la información disponible, pero heredados del modelo base y potencialmente amplificados por la eliminación de rechazos.
- Alucinación: riesgo inherente a modelos de este tamaño; no hay datos específicos de tasa de alucinación en la información disponible.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Modos de razonamiento: `reasoning_effort` solo acepta `low` y `high`; cualquier otro valor resuelve a `max`, que puede devolver respuestas vacías con presupuestos bajos y contaminar conversaciones multi-turno.
- Fragilidad del servidor: parámetros de vídeo mal configurados (`fps` mayor o igual al del clip) provocan `EngineDeadError` y caída del servidor. `max_frames` y `num_frames` no son intercambiables entre versiones de vLLM.
- Visión: `max_pixels`, `min_pixels`, `size` y `detail` se aceptan pero se ignoran silenciosamente; deben usarse `max_image_tokens` y `min_image_tokens`.
- Repositorio de baja tracción: 29 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.
- Autoría: release de un usuario individual bajo la marca dealignai, no del desarrollador original; la reproducibilidad y el soporte no están garantizados.
- Restricciones legales: aunque la licencia sea MIT, el uso de un modelo sin salvaguardas puede contravenir términos de servicio de plataformas o normativas locales sobre contenido.

## Enlaces

- Hugging Face: https://huggingface.co/FATCATHOLICGIRL1/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Espejo del autor: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Perfil del autor: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
- Incidencias upstream vLLM citadas: vLLM #55644, #55647 (no se proporcionan URLs directas en la información disponible)
