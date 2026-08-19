# google/diffusiongemma-26B-A4B-it

## Resumen

DiffusionGemma es un modelo generativo de código abierto desarrollado por Google DeepMind, basado en la arquitectura MoE (Mixture-of-Experts) de Gemma 4 con 26B parámetros totales y 3.8B activos. Su principal innovación es el uso de difusión discreta para generar texto: en lugar de predecir token a token de forma autorregresiva, el modelo denoisa bloques de 256 tokens (un "canvas") en paralelo, lo que acelera significativamente la generación. Es un modelo multimodal que acepta entradas de texto, imagen y vídeo, y produce salidas de texto.

El modelo emplea una arquitectura encoder-decoder: un encoder autorregresivo procesa el prompt y genera la caché KV, mientras que el decoder aplica atención bidireccional sobre el canvas de generación, accediendo al contexto mediante cross-attention. Con una ventana de contexto de hasta 256K tokens y un diseño optimizado para inferencia de batch pequeño, DiffusionGemma está pensado para ejecutarse en un único acelerador, alcanzando velocidades superiores a 1100 tokens por segundo en H100 con FP8. Incluye un modo de razonamiento ("thinking") configurable y soporte nativo para system prompts.

Publicado bajo licencia Apache 2.0, el modelo está disponible en Hugging Face con pesos en formato safetensors (51.7 GB). Es un modelo experimental que explora la difusión de texto como alternativa a la generación autorregresiva, con el objetivo de reducir la latencia en aplicaciones interactivas en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder con difusión discreta, MoE (8 activos / 128 totales + 1 compartido), atención bidireccional en el decoder |
| Parametros totales | 25.823.778.864 (25.2B) |
| Parametros activos | 3.8B |
| Longitud de contexto | Hasta 256K tokens (ventana deslizante de 1024 tokens) |
| Tipos de cuantizacion | FP8 mencionado para inferencia en H100; no se listan cuantizaciones oficiales adicionales |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 51.7 GB) |

## Arquitectura y entrenamiento

DiffusionGemma se basa en la arquitectura MoE de Gemma 4, pero sustituye la generación autorregresiva por difusión discreta. El modelo se compone de un encoder autorregresivo que procesa el prompt y genera la caché KV, y un decoder que aplica atención bidireccional sobre un bloque de tokens (canvas de 256 tokens). Durante la inferencia, el modelo denoisa iterativamente el canvas completo mediante un sampler de difusión (se recomienda el sampler Entropy Bound, EB). Una vez denoizado, el canvas se procesa por el encoder y se añade a la caché KV, generando el siguiente canvas de forma bloque-autorregresiva.

El modelo tiene 30 capas, un vocabulario de 262K tokens y un encoder de visión de aproximadamente 550M parámetros. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La model card indica que es un modelo experimental y que está optimizado para baja latencia en batch pequeño, con 15-20 tokens generados por forward pass.

## Capacidades

- Generación de texto por difusión discreta: genera bloques de 256 tokens en paralelo, alcanzando velocidades de 15-20 tokens por forward pass y más de 1100 tokens por segundo en H100 con FP8 y batch pequeño.
- Multimodal: procesa entradas de texto, imagen y vídeo (según la descripción; la tabla oficial lista texto e imagen) y genera salidas de texto.
- Comprensión de imágenes: detección de objetos, parsing de documentos y PDF, comprensión de pantallas y UI, comprensión de gráficos, OCR multilingüe, reconocimiento de escritura a mano y pointing.
- Modo de razonamiento ("thinking"): permite que el modelo piense paso a paso antes de responder, configurable según la tarea.
- Contexto largo: ventana de hasta 256K tokens, con ventana deslizante de 1024 tokens.
- Soporte nativo de system prompts: permite actualizar el rol de sistema para conversaciones más estructuradas y controlables.
- Eficiencia MoE: solo 3.8B parámetros activos de 25.2B totales, lo que reduce la huella de memoria y facilita la ejecución local.
- Inferencia adaptativa: tareas simples o estructuradas (como código) requieren menos pasos de denoising, ajustando dinámicamente la velocidad de generación.

## Casos de uso

- Parsing y extracción de información de documentos: el modelo puede procesar PDFs, facturas y formularios escaneados, extrayendo texto estructurado mediante OCR multilingüe y comprensión de layout. Su capacidad de contexto largo (256K) permite procesar documentos extensos en una sola pasada.
- Comprensión de interfaces de usuario: puede analizar capturas de pantalla de aplicaciones web o móviles, identificar elementos de UI y generar descripciones o instrucciones de uso, útil para testing automatizado o asistentes de accesibilidad.
- Generación de código en tiempo real: gracias a su alta velocidad de generación (>1100 tok/s en H100) y su capacidad de razonamiento, puede integrarse en IDEs o pipelines de CI/CD para autocompletado de código, generación de tests o revisión de código con baja latencia.
- Atención al cliente automatizada: con soporte para system prompts y contexto de 256K tokens, puede gestionar conversaciones multi-turno con historial extenso, manteniendo coherencia y respondiendo con baja latencia en entornos de producción.
- Análisis de gráficos y tablas: el modelo puede interpretar gráficos, diagramas y tablas en imágenes, extrayendo conclusiones numéricas o resumiendo tendencias, útil para herramientas de business intelligence o asistentes de análisis de datos.
- Asistentes de razonamiento multimodal: combinando el modo "thinking" con entrada de imágenes, puede resolver problemas de matemáticas visuales (MATH-Vision), preguntas de dominio médico (MedXPertQA) o tareas de razonamiento complejo que requieren integrar información visual y textual.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks para la versión instruction-tuned con el sampler Entropy Bound (EB), comparados con Gemma 4 26B A4B (autoregresivo):

| Benchmark | DiffusionGemma 26B A4B | Gemma 4 26B A4B |
|---|---|---|
| MMLU Pro | 77.6% | 82.6% |
| AIME 2026 no tools | 69.1% | 88.3% |
| LiveCodeBench v6 | 69.1% | 77.1% |
| Codeforces ELO | 1429 | 1718 |
| GPQA Diamond | 73.2% | 82.3% |
| Tau2 (average over 3) | 56.2% | 68.2% |
| HLE no tools | 11.0% | 8.7% |
| HLE with search | 11.9% | 17.2% |
| BigBench Extra Hard | 47.6% | 64.8% |
| MMMLU | 81.5% | 86.3% |
| MMMU Pro (visión) | 54.3% | 73.8% |
| OmniDocBench 1.5 (edit distance, menor es mejor) | 0.319 | 0.149 |
| MATH-Vision | 70.5% | 82.4% |
| MedXPertQA MM | 49.0% | 58.1% |
| MRCR v2 8 needle 128k (long context) | 32.0% | 44.1% |

En general, DiffusionGemma muestra un rendimiento inferior a Gemma 4 en la mayoría de tareas, aunque supera a Gemma 4 en HLE no tools (11.0% vs 8.7%). El rendimiento en contexto largo (MRCR v2) es notablemente más bajo (32.0% vs 44.1%).

## Requisitos de hardware

- No se proporcionan requisitos exactos de VRAM en la documentación disponible.
- El modelo está diseñado para ejecutarse en un único acelerador, con un tamaño total de 25.2B parámetros y solo 3.8B activos, lo que sugiere una huella de memoria relativamente baja para su tamaño.
- La model card indica que alcanza más de 1100 tokens por segundo en H100 con FP8 y batch pequeño, lo que implica que es viable en GPUs de data center de gama alta.
- Dado el tamaño total de 25.2B, en FP8 el modelo podría caber en GPUs con 24-32 GB de VRAM, pero esto es una estimación no confirmada por el fabricante.
- Opciones de despliegue: el modelo es compatible con la librería transformers de Hugging Face. También está disponible en NVIDIA NIM (según la documentación de NVIDIA). No se mencionan explícitamente vLLM, llama.cpp u Ollama, pero al ser compatible con transformers, es plausible que pueda desplegarse con herramientas que soporten este formato.
- La latencia y el throughput dependen del hardware y del número de pasos de denoising, que varía según la complejidad de la tarea.

## Comparativa con modelos similares

La comparación más directa es con Gemma 4 26B A4B, su equivalente autorregresivo:

| Modelo | Parámetros totales | Parámetros activos | Contexto | MMLU Pro | AIME 2026 | LiveCodeBench v6 | Licencia |
|---|---|---|---|---|---|---|---|
| DiffusionGemma 26B A4B | 25.2B | 3.8B | 256K | 77.6% | 69.1% | 69.1% | Apache 2.0 |
| Gemma 4 26B A4B | 25.2B | 3.8B | 256K | 82.6% | 88.3% | 77.1% | Apache 2.0 |

No se dispone de información sobre otros modelos de difusión discreta abiertos comparables en el momento de la publicación. La principal diferencia entre ambos es el mecanismo de generación: difusión discreta frente a autorregresivo, con una ventaja clara en velocidad para DiffusionGemma pero un coste en precisión en la mayoría de benchmarks.

## Limitaciones y advertencias

- Modelo experimental: DiffusionGemma es una exploración de la difusión de texto, y su rendimiento en tareas de razonamiento y precisión es inferior al de Gemma 4 autorregresivo en la mayoría de benchmarks evaluados.
- Rendimiento en contexto largo: la puntuación en MRCR v2 (32.0% frente a 44.1% de Gemma 4) indica que la recuperación de información en ventanas de 128K tokens es significativamente menos fiable.
- Posibles sesgos: al ser un modelo entrenado con datos web, puede heredar sesgos sociales, culturales o de género. No se han publicado evaluaciones específicas de sesgo para este modelo.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas abiertas. Se recomienda verificar las salidas en aplicaciones críticas.
- Limitaciones de idioma: no se especifican los idiomas soportados, aunque el OCR mencionado es multilingüe. El rendimiento en idiomas distintos del inglés no está documentado.
- Restricciones de licencia: aunque la licencia es Apache 2.0, se debe revisar la licencia específica de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) para asegurar el cumplimiento en uso comercial.
- Requisitos de hardware: aunque el modelo tiene pocos parámetros activos, el tamaño total de 25.2B implica que se necesita una GPU con suficiente VRAM para los pesos completos, incluso en cuantización FP8.
- Compatibilidad: al ser un modelo reciente y experimental, el soporte en herramientas de terceros (vLLM, llama.cpp, etc.) puede ser limitado o estar en desarrollo.

## Enlaces

- Hugging Face: https://huggingface.co/google/diffusiongemma-26B-A4B-it
- Documentación oficial: https://ai.google.dev/gemma/docs/diffusiongemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/diffusion-gemma-faster-text-generation/
- Página de Google DeepMind: https://deepmind.google/models/gemma/diffusiongemma/
- GitHub de Google Gemma: https://github.com/google-gemma
- NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/diffusiongemma-26b-a4b-it
