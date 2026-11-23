# sermonis-ai/Inkling-2-Mini-oQ4e-mtp

## Resumen

Inkling-2-Mini-oQ4e-mtp es una compilación cuantizada en formato MLX del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario sermonis-ai. Se trata de una cuantización mixta de precisión (oQ4e) que combina NVFP4 de grupo 16, affine 4-bit de grupo 64 y affine 8-bit de grupo 64 según el tipo de tensor, logrando 4,890 bits efectivos por peso y un tamaño total de 16,847 GB (16,212 GB de shards principales más 0,636 GB del cabezal DSpark). El resultado está pensado para ejecutarse en Apple Silicon mediante la librería oMLX, con un mínimo de versión 0.8.3.

El modelo subyacente es un transformer con arquitectura de bucle (inkling2_loop) y mezcla de expertos: 26,4 mil millones de parámetros totales con 3,4 mil millones activos, 24 capas almacenadas de las cuales las 12 centrales se aplican tres veces por token (48 aplicaciones de capa), 128 expertos enrutados con top-8 y una ventana de contexto de 1 millón de tokens. Es nativamente multimodal, con codificador de visión en BF16 sin cuantizar.

La relevancia de esta publicación es doble: por un lado, demuestra que un modelo MoE multimodal de 26B puede caber en un Mac de gama alta con cuantización agresiva manteniendo una perplejidad cercana a la referencia (Δ 0,93 %, KL media 0,00342 nats frente a la ejecución NVFP4 original); por otro, incluye el cabezal de decodificación especulativa DSpark entrenado por el autor original, copiado byte a byte y verificado como exacto en modo greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle de capas (inkling2_loop) y mezcla de expertos (MoE) |
| Parametros totales | 26.388.646.400 (26,4B) |
| Parametros activos | 3,4B |
| Longitud de contexto | 1.000.000 tokens (nominal) |
| Tipos de cuantizacion | oQ4e mixta: NVFP4 grupo 16, affine 4-bit grupo 64, affine 8-bit grupo 64, BF16 (vision), FP32 (router y controladores); 4,890 bits efectivos por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 1.098 tensores principales + 422 del codificador de vision + 54 del drafter MTP |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de transformer con reutilización de capas: almacena 24 capas y aplica las 12 centrales tres veces por token, resultando en 48 aplicaciones de capa efectivas. La componente MoE cuenta con 128 expertos enrutados con activación top-8, lo que explica la relación entre los 26,4B de parámetros totales y los 3,4B activos por token. El enrutador, los controladores de bucle y las consultas de residual de atención se mantienen en FP32 para preservar la estabilidad numérica. El codificador de visión (318.256.128 parámetros) permanece en BF16 sin cuantizar en esta compilación.

La cuantización se realizó con oMLX oQ4e usando los argumentos `oq_level=4, group_size=64, text_only=False, preserve_mtp=True, enhanced=True, imatrix_num_samples=128, imatrix_seq_length=512, dtype=bfloat16`, es decir, con calibración basada en matriz de importancia sobre 128 muestras de 512 tokens. El cabezal DSpark MTP (3 capas, 635.801.416 bytes, 54 tensores, `block_size=8`, `markov_rank=256`, `markov_head_type="rnn_hidden"`, taps de contexto `[5, 23, 41, 48]`) se copia byte a byte desde la release original (SHA-256 `7c3b6513…`) y nunca se cuantiza. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 1M tokens (nominal).
- Razonamiento con modo de pensamiento (thinking): la plantilla de chat emite siempre una instrucción de esfuerzo de razonamiento; `reasoning_effort: "off"` o `"none"` produce un tramo de pensamiento corto antes de la respuesta.
- Comprensión de imágenes (image-text-to-text): el codificador de visión en BF16 permite leer texto y elementos en imágenes; verificado leyendo el número 42 de una imagen generada.
- Tool calling / function calling: verificado con una llamada `get_weather({"city":"Paris"})`.
- Decodificación especulativa mediante el cabezal DSpark MTP, exacta en modo greedy (5/5 prompts idénticos) con profundidad adaptativa 7 o profundidad fija 3.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar diálogos multi-turno con contexto largo (hasta 1M tokens nominales) ejecutándose íntegramente en un Apple M2 Max de 96 GiB, sin depender de servicios en la nube.
- Análisis de documentos extensos con imágenes: al combinar visión y contexto de 1M tokens, permite procesar informes, contratos o artículos con figuras y tablas en una sola pasada.
- Automatización de agentes con tool calling: la llamada a funciones verificada (`get_weather`) habilita pipelines de agentes que consultan APIs externas, con el modo thinking disponible para razonamiento multi-paso.
- Generación de código asistida en local: el modelo se evaluó con 5 prompts de código y alcanza 36,67 tok/s en decodificación con la configuración recomendada (MTP off, activaciones FP16), suficiente para autocompletado interactivo en un portátil o sobremesa Apple.
- Prototipado e investigación en Apple Silicon: sirve como banco de pruebas para estudiar cuantización mixta NVFP4/affine, decodificación especulativa DSpark y arquitecturas con bucle de capas sin necesidad de GPUs NVIDIA.
- Extracción de información de capturas y formularios: la capacidad de lectura de imágenes permite transcribir y estructurar datos de documentos escaneados o screenshots en flujos de back office.
- Evaluación comparativa de cuantizaciones: al publicarse junto a la build de referencia `mlx-community/Inkling-2-Mini-oQ4e-mtp`, permite medir el impacto de calibraciones independientes sobre la misma arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento medidos por el autor en un Apple M2 Max (96 GiB), 5 prompts de código × 512 tokens, greedy, solo decodificación, son los siguientes:

| Configuracion | Decode tok/s | Prefill tok/s | Exactitud |
|---|---:|---:|---|
| MTP off, activaciones BF16 | 34,80 | 78,6 | baseline |
| MTP adaptive depth 7, BF16 | 35,02 | 82,8 | 5/5 identicos |
| MTP fixed depth 3, BF16 | 29,80 | 86,9 | 5/5 identicos |
| MTP off, activaciones FP16 | 36,67 | 84,6 | baseline |
| MTP adaptive depth 7, FP16 | 31,78 | 76,6 | 5/5 identicos |

Calidad frente a la referencia NVFP4 original (oMLX 0.8.3): PPL Δ 0,93 %, KL media 0,00342 nats. Una build FP16 independiente obtuvo PPL Δ -0,18 % y KL 0,00221, pero con menor velocidad de decodificación (34,53 tok/s sin especulación), por lo que no se publicó.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: 16,847 GB de pesos totales; el contexto KV crece con la longitud y con las 48 aplicaciones de capa, por lo que contextos cercanos a 1M tokens requieren memoria adicional significativa.
- Hardware probado: Apple M2 Max con 96 GiB de memoria unificada.
- Cabe en Apple Silicon de gama alta (M2 Max, M3 Max, M4 Max y equivalentes con al menos 24-32 GB de memoria unificada para contextos moderados); no está pensado para GPUs NVIDIA ni CUDA.
- Despliegue: exclusivamente mediante oMLX 0.8.3 o superior (`omlx serve --model-dir <dir>`). No compatible con vLLM, llama.cpp, Ollama ni TGI por el formato MLX y la ruta MTP específica.
- Configuración recomendada: `mtp_enabled: false`, `activation_fp16_enabled: true`, `enable_thinking: false`, `temperature: 0.2`, `top_p: 0.95`, `top_k: 20`.
- Throughput medido: 36,67 tok/s en decodificación y 84,6 tok/s en prefill con la configuración recomendada en M2 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ4e-mtp (este) | 26,4B totales / 3,4B activos | 1M | MLX / oMLX 0.8.3+ | Apache 2.0 | Incluye drafter DSpark; 4,890 bpw; 16,847 GB |
| mlx-community/Inkling-2-Mini-oQ4e-mtp | 26,4B totales / 3,4B activos | 1M | MLX / oMLX | Apache 2.0 | Misma estructura de cuantización, calibración independiente; referencia de comparación estructural |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B totales / 3,4B activos | 1M | safetensors originales | Apache 2.0 | Pesos sin cuantizar; requiere hardware muy superior |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El contexto de 1M tokens es nominal: la memoria KV crece con la longitud de contexto y con las 48 aplicaciones de capa, lo que puede agotar la memoria unificada en secuencias muy largas.
- Requiere oMLX 0.8.3 o superior; en 0.8.2 la ruta MTP no es exacta en greedy y las activaciones FP16 devuelven logits no finitos (corregido en 0.8.3, issues #5531 y #5523).
- Combinar MTP con activaciones FP16 degrada el rendimiento (31,78 frente a 35,02 tok/s); no se recomienda. Tampoco se recomienda profundidad fija 3.
- La recarga de activaciones a FP16 solo afecta a las hojas del modelo de lenguaje; la torre de visión permanece en BF16.
- Riesgo de alucinación y sesgos: no se han publicado evaluaciones específicas en la información disponible.
- Idiomas soportados: no disponible, lo que impide garantizar cobertura multilingüe en producción.
- Las cifras de calidad provienen de cuatro mediciones retenidas del autor; no hay validación independiente publicada.
- Uso comercial permitido por licencia Apache 2.0, pero la licencia del modelo base (thinkingmachines/Inkling-2-Mini) debe verificarse por separado, ya que esta compilación la hereda.
- Dependencia de un runtime poco extendido (oMLX) y de hardware Apple Silicon, lo que limita el despliegue en infraestructura convencional de servidores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sermonis-ai/Inkling-2-Mini-oQ4e-mtp
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build de referencia estructural: https://huggingface.co/mlx-community/Inkling-2-Mini-oQ4e-mtp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
