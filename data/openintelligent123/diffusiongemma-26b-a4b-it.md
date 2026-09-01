# Openintelligent123/diffusiongemma-26B-A4B-it

## Resumen

DiffusionGemma es un modelo generativo de texto desarrollado por Google DeepMind, basado en la arquitectura Mixture-of-Experts (MoE) de Gemma 4. A diferencia de los modelos autoregresivos tradicionales, emplea difusión discreta para generar tokens: en lugar de predecir token a token, denoiza bloques completos de 256 tokens en paralelo mediante un sampler de difusión. Esto permite velocidades de generación muy superiores, con más de 1100 tokens por segundo en configuraciones de bajo batch size sobre una H100 en FP8.

El modelo tiene 25.2 mil millones de parámetros totales (25.823.778.864 según los pesos safetensors), de los cuales solo 3.8 mil millones están activos por token gracias a su diseño MoE con 8 expertos activos de 128 totales. Soporta una ventana de contexto de hasta 256K tokens y es multimodal: procesa texto, imagen y video para generar texto. Está optimizado para inferencia de baja latencia en un solo acelerador, lo que lo hace adecuado para aplicaciones en tiempo real. Esta versión concreta en HuggingFace está publicada por el usuario Openintelligent123, aunque el modelo original pertenece a Google DeepMind y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder con difusión discreta, basada en Gemma 4 (MoE) |
| Parametros totales | 25.823.778.864 (25.2B) |
| Parametros activos | 3.8B (8 expertos activos de 128 totales + 1 compartido) |
| Longitud de contexto | Hasta 256K tokens (sliding window de 1024 tokens) |
| Tipos de cuantizacion | No disponible (no se especifican en la información) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también disponible en otros formatos no especificados) |

## Arquitectura y entrenamiento

DiffusionGemma utiliza una arquitectura encoder-decoder. El encoder procesa el prompt de forma autoregresiva y genera la caché KV. El decoder aplica atención bidireccional sobre un bloque de tokens (el "canvas") y accede al contexto mediante atención cruzada. Durante la inferencia, el modelo denoiza iterativamente un canvas completo de 256 tokens usando un sampler de difusión (recomendado el sampler Entropy Bound, EB). Una vez denoizado, el canvas se procesa por el encoder y se añade a la caché KV, generando el siguiente canvas. Este enfoque block-autoregressive reduce los cuellos de botella secuenciales de los modelos causales.

El modelo está construido sobre la arquitectura MoE de Gemma 4, con 30 capas, un vocabulario de 262K tokens y un encoder de visión de aproximadamente 550M parámetros. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La model card indica que el modelo está optimizado para inferencia con batch size pequeño y que soporta system prompts nativos, así como modos de razonamiento ("thinking mode") configurables.

## Capacidades

- Generación de texto de alta velocidad mediante difusión discreta, con decodificación paralela de bloques de 256 tokens.
- Razonamiento paso a paso con modo "thinking" configurable, que permite al modelo pensar antes de responder.
- Comprensión multimodal: procesa texto, imagen y video como entrada, y genera texto como salida.
- Comprensión de imágenes avanzada: detección de objetos, parsing de documentos y PDFs, comprensión de pantallas y UI, lectura de gráficos, OCR multilingüe, reconocimiento de escritura manual y capacidades de pointing.
- Soporte de contexto largo de hasta 256K tokens, con ventana deslizante de 1024 tokens.
- Soporte nativo de system prompts, permitiendo conversaciones estructuradas y controlables.
- Eficiencia computacional gracias a la arquitectura MoE, con solo 3.8B parámetros activos por token.
- Adaptación dinámica del tiempo de inferencia: tareas simples o estructuradas (como código) requieren menos pasos de denoizado, ajustando la velocidad según la complejidad.

## Casos de uso

- Asistentes conversacionales en tiempo real: gracias a su alta velocidad de generación (más de 1100 tokens/s en H100 FP8), puede mantener diálogos fluidos con latencia mínima, ideal para chatbots interactivos o asistentes de voz.
- Procesamiento de documentos y PDFs: su capacidad de comprensión de imágenes permite extraer texto, tablas y estructuras de documentos escaneados, útil para automatizar la digitalización de archivos en entornos empresariales.
- Comprensión de pantallas y UI: puede interpretar capturas de pantalla y describir interfaces, lo que facilita la automatización de pruebas de software o la generación de documentación visual.
- Generación de código asistida: aunque no se especifica soporte explícito de tool calling, su capacidad de razonamiento y generación de texto estructurado lo hace adecuado para completar código, explicar fragmentos o generar scripts a partir de descripciones.
- Análisis de gráficos y datos visuales: puede leer gráficos, diagramas y tablas en imágenes, permitiendo resumir información visual en texto, útil para informes automáticos o asistentes de análisis de datos.
- Razonamiento y resolución de problemas complejos: con el modo thinking activado, puede abordar problemas de matemáticas, lógica o ciencia que requieren múltiples pasos, como los evaluados en AIME o GPQA Diamond.
- Aplicaciones de baja latencia en edge o local: al estar optimizado para batch size pequeño y ser desplegable en un solo acelerador, puede ejecutarse en estaciones de trabajo con GPUs de gama alta para aplicaciones de tiempo real sin depender de la nube.

## Benchmarks y rendimiento

La model card proporciona resultados de benchmarks para la versión instruida con el sampler Entropy Bound (EB), comparados con Gemma 4 26B A4B (autoregresivo). Se presentan a continuación:

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
| **Vision** |  |  |
| MMMU Pro | 54.3% | 73.8% |
| OmniDocBench 1.5 (average edit distance, lower is better) | 0.319 | 0.149 |
| MATH-Vision | 70.5% | 82.4% |
| MedXPertQA MM | 49.0% | 58.1% |
| **Long Context** |  |  |
| MRCR v2 8 needle 128k (average) | 32.0% | 44.1% |

En general, DiffusionGemma muestra un rendimiento inferior al de Gemma 4 autoregresivo en la mayoría de tareas, aunque supera a Gemma 4 en HLE no tools (11.0% vs 8.7%). Su principal ventaja no es la precisión bruta, sino la velocidad de generación.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM. El tamaño de los pesos en safetensors es de 51.7 GB, por lo que se estima que se necesitan al menos 40 GB de VRAM para cargar el modelo en FP16 (estimación basada en el tamaño de parámetros).
- Para FP8, el consumo se reduce aproximadamente a la mitad, pudiendo caber en GPUs con 24-32 GB de VRAM (estimación no confirmada).
- El modelo está optimizado para inferencia con batch size pequeño en un solo acelerador. Se recomienda una GPU de gama alta como H100, A100 (80 GB) o RTX 4090 (24 GB) con cuantización.
- Opciones de despliegue: compatible con el ecosistema Hugging Face Transformers. No se mencionan explícitamente vLLM, llama.cpp u Ollama, pero al ser un modelo de la familia Gemma, es probable que sea compatible con estos frameworks (no confirmado).
- En H100 con FP8, se reportan velocidades superiores a 1100 tokens por segundo en configuraciones de bajo batch size.

## Comparativa con modelos similares

La comparación más directa es con Gemma 4 26B A4B, el modelo autoregresivo sobre el que se basa DiffusionGemma. Ambos comparten arquitectura MoE, tamaño y contexto, pero difieren en el mecanismo de generación.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Mecanismo de generación | Licencia |
|---|---|---|---|---|---|
| DiffusionGemma 26B A4B | 25.2B | 3.8B | 256K | Difusión discreta (block-autoregressive) | Apache 2.0 |
| Gemma 4 26B A4B | 25.2B | 3.8B | 256K | Autoregresivo | Apache 2.0 |

No se dispone de datos comparativos con otros modelos de difusión como LLaDA o Mercury en la información proporcionada.

## Limitaciones y advertencias

- El modelo es experimental y su rendimiento en benchmarks es inferior al de Gemma 4 autoregresivo en la mayoría de tareas, especialmente en razonamiento complejo y visión.
- La calidad de generación puede degradarse en contextos muy largos (por ejemplo, en la prueba MRCR v2 con 128K tokens obtiene solo 32.0% frente al 44.1% de Gemma 4).
- No se han publicado detalles sobre sesgos, alucinaciones o limitaciones idiomáticas. Al ser un modelo entrenado por Google DeepMind, es probable que herede sesgos de los datos de entrenamiento, pero no hay información específica.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia de Gemma 4 (enlace en la model card) para asegurar el cumplimiento de cualquier condición adicional.
- El modelo requiere hardware de gama alta para un rendimiento óptimo; en GPUs de consumo puede ser necesario cuantizar, lo que podría afectar la calidad.
- No se especifica soporte explícito de tool calling o function calling, aunque su capacidad de razonamiento podría permitir su uso en agentes con adaptaciones externas.

## Enlaces

- Repositorio en HuggingFace (versión de Openintelligent123): https://huggingface.co/Openintelligent123/diffusiongemma-26B-A4B-it
- Repositorio original en HuggingFace (Google): https://huggingface.co/google/diffusiongemma-26B-A4B-it
- Página del modelo en Google DeepMind: https://deepmind.google/models/gemma/diffusiongemma/
- Documentación oficial de Google AI: https://ai.google.dev/gemma/docs/diffusiongemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/diffusion-gemma-faster-text-generation/
- Repositorio de GitHub de Gemma: https://github.com/google-gemma
- Página en NVIDIA NIM: https://build.nvidia.com/google/diffusiongemma-26b-a4b-it
