# Expwwwn/GLM-5.3-Flash-UNCENSORED-FP8

## Resumen

GLM-5.3-Flash-UNCENSORED-FP8 es una versión modificada a nivel de pesos del modelo GLM-5.3-Flash de Zhipu AI (zai-org), publicada por el usuario Expwwwn bajo la marca "CRACK" de dealignai. El modelo base es un transformer híbrido de tipo MoE (mezcla de expertos) con atención lineal KDA y atención dispersa estilo DeepSeek, con 320.000 millones de parámetros totales y 18.000 millones activos por token. Esta variante conserva la cuantización nativa FP8 (e4m3 por bloques) del modelo original y elimina el comportamiento de rechazo mediante edición directa de los tensores, sin fine-tuning, DPO ni adaptadores.

La relevancia de esta ficha es doble: por un lado documenta un modelo de 320B con contexto de 1M de tokens y torre de visión GLM-4.1V, capacidades poco habituales en pesos abiertos; por otro, ilustra una práctica controvertida (el "abliterating" o eliminación de guardarraíles a nivel de pesos) con implicaciones éticas y de seguridad que deben considerarse antes de cualquier uso en producción.

El repositorio ocupa 328,4 GB en safetensors, declara licencia MIT y solo lista inglés como idioma soportado. Es una publicación de fecha futura (14 de noviembre de 2026) con cero descargas y cero likes en el momento de redactar esta ficha, lo que sugiere un lanzamiento muy reciente o de escasa tracción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`), transformer híbrido MoE con atención lineal KDA y atención dispersa DeepSeek |
| Parametros totales | 321.323.031.390 (320B) |
| Parametros activos | 18B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 nativo (e4m3 por bloques); no se listan GGUF ni otras variantes en el repo |
| Idiomas soportados | Inglés (según model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Torre de visión | GLM-4.1V (operativa, con plantilla multimodal correcta) |
| Cabecera MTP | Multi-token prediction, aceptación del 75,9% (también modificada) |
| Tamaño del repo | 328,4 GB |

## Arquitectura y entrenamiento

La arquitectura `glm5_next` combina atención lineal KDA (una variante de atención lineal con decaimiento selectivo) con atención dispersa de tipo DeepSeek, dentro de un esquema MoE con 320B de parámetros totales y 18B activos por token. Esta combinación busca reducir el coste computacional del contexto largo (hasta 1M de tokens) manteniendo la calidad de un modelo denso grande. Incluye además una cabecera de predicción multi-token (MTP) que actúa como draft head para decodificación especulativa, con una tasa de aceptación declarada del 75,9%, y una torre de visión heredada de GLM-4.1V.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO; la model card no los detalla. La modificación de esta variante es una edición directa de pesos (abliterating) orientada a eliminar rechazos, sin SFT, DPO, LoRA, adaptadores, vectores de dirección ni hooks en tiempo de ejecución. El autor afirma que el ajuste es "conservador" para preservar la calidad: la eliminación de rechazos es completa en modo de razonamiento desactivado y en esfuerzo máximo (0% de rechazos en HarmBench-320), pero el modo de esfuerzo bajo conserva algunos rechazos por diseño.

## Capacidades

- Generación de texto y razonamiento multi-paso con modos de esfuerzo configurables (`low`, `high`, `max`).
- Razonamiento extendido en modo "thinking" con presupuesto de tokens controlable mediante `max_tokens`.
- Capacidades de visión: procesamiento de imágenes y vídeo a través de la torre GLM-4.1V, con control de tokens de imagen (`max_image_tokens`, `min_image_tokens`) y muestreo de vídeo por FPS.
- Decodificación especulativa mediante cabecera MTP con 75,9% de aceptación, que acelera la generación.
- Contexto ultralargo de 1M de tokens, apto para documentos extensos o conversaciones muy largas.
- Comportamiento sin rechazos en modo de razonamiento desactivado y esfuerzo máximo (0% de rechazos en HarmBench-320 según el autor).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: limitadas a inglés según la model card.

## Casos de uso

- Procesamiento de documentos jurídicos o técnicos de gran extensión: con 1M de tokens de contexto, el modelo puede ingerir contratos completos, expedientes o manuales y responder preguntas sobre ellos sin fragmentación ni recuperación externa.
- Análisis de vídeo y imagen en pipelines de inspección: la torre GLM-4.1V permite describir escenas, extraer texto de imágenes y analizar clips configurando `fps` explícitamente para controlar el coste en tokens.
- Generación de código en entornos controlados: el contexto largo permite cargar repositorios enteros y razonar sobre dependencias; el modo `high` de esfuerzo resulta adecuado para tareas de depuración compleja.
- Investigación sobre seguridad y alineación: al ser una variante sin guardarraíles, sirve como objeto de estudio para medir la eficacia de mecanismos de rechazo y evaluar técnicas de abliterating, siempre en entornos aislados.
- Asistentes conversacionales de dominio restringido: en despliegues internos donde el contenido sensible está acotado, la ausencia de rechazos evita fricción en consultas benignas que el modelo base marcaba erróneamente (por ejemplo, citas de obras con derechos).
- Evaluación comparativa de modelos: útil como contrapunto "sin censura" frente al GLM-5.3-Flash original para estudiar el impacto del abliterating en benchmarks como MMLU (87,33% declarado frente al 86,74% del base).
- Razonamiento matemático y analítico con presupuesto amplio: configurando `reasoning_effort: "high"` y `max_tokens` suficiente, el modelo aborda problemas de varios pasos con cadenas de pensamiento extensas.

## Benchmarks y rendimiento

| Benchmark | GLM-5.3-Flash-UNCENSORED-FP8 | GLM-5.3-Flash (base) |
|---|---|---|
| MMLU | 87,33% | 86,74% |
| HarmBench-320 (rechazos) | 0% (razonamiento off / max) | no disponible |
| Aceptación MTP | 75,9% | no disponible |

Rendimiento declarado en TP4 con FP8 nativo sobre H200: 163 tok/s en decodificación de un solo flujo y 211 tok/s en el dato truncado de la model card (el valor completo no está disponible). No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de FP8 con 321B de parámetros, los pesos ocupan aproximadamente 321 GB; se necesita un mínimo de 4 GPU de 80 GB (H100/H200) en tensor paralelo para alojarlos, más margen para caché KV y activaciones.
- GPU recomendadas: H100 y H200 (FP8 nativo en tensor cores Hopper); A100 no soporta FP8 de forma nativa y requeriría conversión a BF16, duplicando el requisito de memoria a unos 640 GB.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en su forma actual; sería necesaria una cuantización GGUF de 4 bits, no publicada en el repositorio.
- Opciones de despliegue: vLLM y SGLang (el autor documenta advertencias específicas para ambos con parser de razonamiento); llama.cpp y Ollama no están soportados por el formato FP8 nativo.
- Latencia y throughput: 163 tok/s en decodificación single-stream y 211 tok/s (dato parcial) con TP4 sobre H200 según el autor.
- Advertencia de despliegue: con `reasoning_effort: "max"` y `max_tokens` inferior a 6000 la respuesta puede quedar vacía; se recomienda `max_tokens >= 6000` en ese modo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-UNCENSORED-FP8 | 320B | 18B | 1M | MIT | Variante sin guardarraíles, FP8 nativo, visión y MTP |
| GLM-5.3-Flash (base) | 320B | 18B | 1M | MIT (según repo) | Modelo original con rechazos; MMLU 86,74% |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | MoE con atención dispersa; sin visión nativa documentada aquí |
| Llama 3.1 405B | 405B | denso | 128K | Llama Community License | Denso, sin FP8 nativo; licencia más restrictiva |

La comparativa con DeepSeek-V3 y Llama 3.1 405B se ofrece como referencia de categoría (modelos abiertos de gran escala); los datos de contexto y licencia de esos modelos no provienen de la información proporcionada y deben verificarse en sus repositorios oficiales.

## Limitaciones y advertencias

- Eliminación deliberada de guardarraíles: el modelo no rechaza solicitudes potencialmente dañinas en modo de razonamiento desactivado o esfuerzo máximo; no es apto para aplicaciones orientadas al público sin capas de moderación externas.
- Riesgo elevado de alucinación y de generación de contenido dañino, ilegal o sexualmente explícito; la licencia MIT no exime de responsabilidad legal por el uso.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otras lenguas no está verificado.
- Publicación con cero descargas y cero likes: no hay validación comunitaria independiente de las afirmaciones del autor (MMLU, HarmBench, velocidad).
- Fecha de creación posterior a la actual (2026-11-14): la información debe tratarse con cautela y verificarse en el repositorio.
- Advertencias de despliegue documentadas: `reasoning_effort` solo acepta `low` y `high` (cualquier otro valor resuelve a `max`); no pasar `enable_thinking`; `clear_thinking` debe ir anidado en `chat_template_kwargs`; el razonamiento se devuelve en `message.reasoning`.
- En vídeo, `media_io_kwargs.video.fps` debe ser inferior al FPS del clip o el motor vLLM cae con `EngineDeadError`.
- `max_frames` y `num_frames` no son intercambiables entre versiones de vLLM; se recomienda usar `fps`.
- Los controles `max_pixels`, `min_pixels`, `size` y `detail` se aceptan pero se ignoran; usar `mm_processor_kwargs.max_image_tokens` y `min_image_tokens`.
- Requiere hardware Hopper para FP8 nativo; el despliegue en A100 o GPU de consumo exige conversión y más memoria.
- El modelo se distribuye como espejo de dealignai; conviene contrastar la procedencia y la integridad de los pesos antes de usarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Expwwwn/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Espejo del autor: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Perfil del autor de la modificación: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
- Incidencias de vLLM citadas: vLLM #55644 y #55647 (referencias internas de la model card; no se proporcionan URLs directas)
