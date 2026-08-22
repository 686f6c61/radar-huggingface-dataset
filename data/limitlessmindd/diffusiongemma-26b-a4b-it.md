# LimitlessMindd/diffusiongemma-26B-A4B-it

## Resumen

DiffusionGemma es un modelo generativo multimodal desarrollado por Google DeepMind que emplea difusión discreta para generar texto, abandonando el enfoque autorregresivo token a token de los LLM convencionales. Construido sobre la arquitectura Mixture-of-Experts (MoE) Gemma 4 de 26B parámetros totales (3.8B activos), el modelo procesa entradas de texto, imagen y vídeo para producir salidas de texto. Su innovación principal es el muestreo por bloques (multi-canvas sampling), que decodifica 256 tokens en paralelo mediante un proceso iterativo de denoising, alcanzando velocidades superiores a 1100 tokens por segundo en configuraciones de batch pequeño con hardware H100 en FP8.

El modelo utiliza una arquitectura encoder-decoder: el encoder procesa el prompt y genera la caché KV, mientras que el decoder aplica atención bidireccional sobre un bloque de tokens (canvas) y accede al contexto mediante cross-attention. Con una ventana de contexto de hasta 256K tokens, soporte para modo de razonamiento (thinking mode) y licencia Apache 2.0, DiffusionGemma está diseñado para inferencia de baja latencia en un único acelerador. Es un modelo experimental que explora una alternativa a la generación autorregresiva tradicional, con un rendimiento competitivo en razonamiento aunque inferior al de Gemma 4 en la mayoría de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder con difusión discreta, MoE (Gemma 4) |
| Parametros totales | 25.2B (25.823.778.864) |
| Parametros activos | 3.8B |
| Longitud de contexto | Hasta 256K tokens (sliding window de 1024) |
| Tipos de cuantizacion | FP8 (referencia de despliegue en H100); otras cuantizaciones no confirmadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DiffusionGemma emplea una arquitectura encoder-decoder basada en la familia Gemma 4. El encoder opera en modo prefill, procesando el prompt inicial y generando la caché KV. El decoder utiliza atención bidireccional sobre un bloque de entrada (canvas) de 256 tokens, accediendo al contexto cacheado mediante cross-attention. La generación se realiza mediante muestreo multi-canvas: en lugar de generar un token a la vez, el modelo denoisa iterativamente un bloque completo de tokens usando un sampler de difusión. Una vez que un canvas está completamente denoised, se procesa por el encoder y se añade a la caché KV, generando el siguiente canvas.

La arquitectura MoE cuenta con 8 expertos activos de 128 totales más 1 experto compartido, con 30 capas y un vocabulario de 262K tokens. El encoder de visión tiene aproximadamente 550M de parámetros. El modelo soporta entrada multimodal intercalada (texto, imagen con resolución y aspect ratio variables, y vídeo) para generar salidas de texto. Incluye soporte nativo para system prompts, modo de razonamiento configurable (thinking mode) y está optimizado para inferencia de batch pequeño en un único acelerador. Los detalles específicos del dataset de entrenamiento, el número de tokens y el proceso de alineación (RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto mediante difusión discreta con decodificación paralela de bloques de 256 tokens, alcanzando 15-20 tokens por forward pass y velocidades superiores a 1100 tokens/segundo en H100 con FP8 y batch pequeño.
- Procesamiento multimodal: acepta entradas intercaladas de texto, imagen (con soporte de resolución y aspect ratio variables) y vídeo, generando salidas de texto.
- Razonamiento con modo de pensamiento (thinking mode) configurable, que permite al modelo razonar paso a paso antes de responder.
- Comprensión de imágenes: detección de objetos, parsing de documentos y PDFs, comprensión de pantallas e interfaces de usuario, comprensión de gráficos y tablas, OCR multilingüe, reconocimiento de escritura manual y capacidades de pointing.
- Longitud de contexto extendida de hasta 256K tokens, con sliding window de 1024 tokens.
- Cómputo adaptativo en tiempo de inferencia: prompts más simples y tareas estructuradas como código requieren menos pasos de denoising, ajustando dinámicamente la velocidad de generación según la complejidad de la tarea.
- Soporte nativo de system prompts para conversaciones más estructuradas y controlables.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 256K tokens, manteniendo el historial completo de la interacción y generando respuestas de baja latencia adecuadas para entornos de chat en tiempo real.
- Parsing y comprensión de documentos: su capacidad de procesamiento de imágenes permite extraer información de PDFs, facturas y documentos escaneados mediante OCR multilingüe, con salidas de texto estructuradas.
- Generación de código en producción: soporta tareas de programación con velocidades de generación superiores a 1000 tokens/segundo, lo que lo hace adecuado para integración en pipelines de CI/CD o asistentes de desarrollo en tiempo real.
- Análisis de gráficos y visualizaciones: puede interpretar gráficos, tablas y dashboards a partir de imágenes, facilitando la generación de informes automáticos a partir de capturas de pantalla.
- Asistentes de accesibilidad: el reconocimiento de escritura manual y OCR multilingüe permite construir herramientas que transcriban documentos manuscritos o imágenes de texto para usuarios con discapacidad visual.
- Agentes interactivos en tiempo real: su baja latencia y generación paralela lo hacen adecuado para aplicaciones que requieren respuestas inmediatas, como asistentes de voz, juegos conversacionales o herramientas de brainstorming interactivo.
- Comprensión de vídeo: al aceptar entradas de vídeo, puede generar descripciones, resúmenes o transcripciones de contenido audiovisual, útil para herramientas de análisis de medios.

## Benchmarks y rendimiento

Los resultados de benchmarks publicados en la model card comparan DiffusionGemma 26B A4B con Gemma 4 26B A4B, ambos en versión instruction-tuned con el sampler Entropy Bound (EB):

| Benchmark | DiffusionGemma 26B A4B | Gemma 4 26B A4B |
|---|---|---|
| MMLU Pro | 77.6% | 82.6% |
| AIME 2026 (sin herramientas) | 69.1% | 88.3% |
| LiveCodeBench v6 | 69.1% | 77.1% |
| Codeforces ELO | 1429 | 1718 |
| GPQA Diamond | 73.2% | 82.3% |
| Tau2 (media de 3) | 56.2% | 68.2% |
| HLE (sin herramientas) | 11.0% | 8.7% |
| HLE (con búsqueda) | 11.9% | 17.2% |
| BigBench Extra Hard | 47.6% | 64.8% |
| MMMLU | 81.5% | 86.3% |
| MMMU Pro (visión) | 54.3% | 73.8% |
| OmniDocBench 1.5 (distancia de edición, menor es mejor) | 0.319 | 0.149 |
| MATH-Vision | 70.5% | 82.4% |
| MedXPertQA MM | 49.0% | 58.1% |
| MRCR v2 8 agujas 128k (contexto largo) | 32.0% | 44.1% |

DiffusionGemma supera a Gemma 4 únicamente en HLE sin herramientas (11.0% frente a 8.7%). En el resto de métricas, Gemma 4 26B A4B muestra un rendimiento superior, especialmente en razonamiento matemático (AIME 2026: 69.1% frente a 88.3%) y comprensión visual (MMMU Pro: 54.3% frente a 73.8%). El rendimiento en contexto largo también es notablemente inferior (MRCR v2: 32.0% frente a 44.1%).

## Requisitos de hardware

- El repositorio ocupa 51.7 GB, consistente con pesos en BF16 (25.2B parámetros ≈ 50.4 GB).
- Para inferencia en FP8, se requieren aproximadamente 25 GB de VRAM, lo que permite despliegue en GPUs como H100 (80 GB), A100 (80 GB) o RTX 4090 (24 GB, con margen limitado).
- En BF16, se necesitan aproximadamente 50 GB de VRAM, requiriendo GPUs de clase profesional como H100, A100 80GB o configuraciones multi-GPU.
- El modelo está optimizado para inferencia de batch pequeño en un único acelerador, con velocidades superiores a 1100 tokens/segundo en H100 con FP8.
- Opciones de despliegue: el modelo es compatible con la librería transformers y está disponible en NVIDIA NIM para despliegue optimizado. No se confirma soporte para vLLM, llama.cpp u Ollama en la información proporcionada.
- La arquitectura MoE con solo 3.8B parámetros activos reduce el coste computacional por forward pass, pero todos los 25.2B parámetros deben residir en memoria.

## Comparativa con modelos similares

La comparativa principal disponible es con Gemma 4 26B A4B, el modelo autorregresivo del que deriva:

| Característica | DiffusionGemma 26B A4B | Gemma 4 26B A4B |
|---|---|---|
| Parámetros totales | 25.2B | 26B |
| Parámetros activos | 3.8B | 4B |
| Arquitectura | Encoder-decoder con difusión discreta | Autorregresiva (MoE) |
| Contexto | Hasta 256K tokens | Hasta 256K tokens |
| Modalidades | Texto, imagen, vídeo → texto | Texto, imagen, vídeo → texto |
| Licencia | Apache 2.0 | Apache 2.0 |
| MMLU Pro | 77.6% | 82.6% |
| AIME 2026 | 69.1% | 88.3% |
| Velocidad de generación | >1100 tokens/seg (H100 FP8) | No especificada |

No se dispone de datos comparativos con otros modelos de difusión de texto en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: DiffusionGemma es una exploración de la difusión de texto y no alcanza el rendimiento de Gemma 4 en la mayoría de benchmarks, especialmente en razonamiento matemático (AIME 2026: 69.1% frente a 88.3%) y comprensión visual (MMMU Pro: 54.3% frente a 73.8%).
- Rendimiento en contexto largo significativamente inferior: MRCR v2
