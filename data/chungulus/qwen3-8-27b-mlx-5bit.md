# Chungulus/Qwen3.8-27B-MLX-5bit

## Resumen

Chungulus/Qwen3.8-27B-MLX-5bit es una cuantización en formato MLX de 5 bits del modelo Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo denso, nativo multimodal (imagen, video y texto) con arquitectura híbrida que combina Gated DeltaNet y atención completa, diseñado para tareas de codificación, flujos agénticos y automatización de oficina. La cuantización, realizada por el usuario Chungulus, mantiene los pesos originales sin fine-tuning y añade un componente MTP (multi-token prediction) como drafter para acelerar la inferencia.

El modelo base Qwen3.8-27B fue lanzado en agosto de 2026 con licencia Apache-2.0, una ventana de contexto de 262 000 tokens y soporte nativo de tool calling. Esta versión cuantizada está pensada para ejecutarse en Apple Silicon con 64 GB de memoria unificada, aunque también se ha validado en hardware AMD Ryzen AI Max y GPUs Radeon. La cuantización reduce el tamaño del artefacto a 20,3 GB y alcanza un pico de memoria de 21,7 GB durante la generación, lo que la hace viable en equipos de gama alta sin necesidad de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (híbrida Gated DeltaNet + atención completa) con vision tower y proyector |
| Parametros totales | 27 000 millones (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (máximo arquitectónico; probado hasta 73 tokens en validación) |
| Tipos de cuantizacion | 5 bits, group size 64 (MLX affine) |
| Idiomas soportados | No disponible (presumiblemente multilingüe, siguiendo la familia Qwen) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida que combina capas con Gated DeltaNet (una variante de atención lineal eficiente) con capas de atención completa, lo que permite manejar contextos largos con menor coste computacional. Incluye un vision tower y un proyector para procesar imágenes y video, junto con un componente MTP (multi-token prediction) que actúa como drafter en esquemas de decodificación especulativa. El modelo fue entrenado por Alibaba con un enfoque en tareas de codificación, razonamiento agéntico y automatización de oficina, y ha sido alineado para soportar tool calling nativo y modos de pensamiento (thinking mode).

Esta versión cuantizada no ha sido fine-tuneada ni modificada en su alineación; es una conversión directa de los pesos BF16 originales a cuantización MLX de 5 bits con group size 64, sin calibración. El proceso de conversión mantiene los 1199 tensores originales, incluyendo 333 de visión y 15 de MTP. La validación reporta una similitud semántica media de 0,952 con el modelo BF16 de referencia y una tasa de aceptación de drafts MTP del 95,45 %, lo que indica una degradación mínima por la cuantización.

## Capacidades

- Generación de texto y razonamiento avanzado, con soporte de modo de pensamiento (enable_thinking, reasoning_effort, preserve_thinking).
- Comprensión de imágenes y video (entrada nativa multimodal).
- Tool calling nativo en formato XML, validado con 5 pruebas específicas.
- Decodificación especulativa mediante MTP, con una aceleración medida del 21,2 % en throughput (de 10,72 a 13,00 tokens por segundo).
- Soporte de agentes y razonamiento multi-paso, optimizado para tareas de larga duración con feedback de herramientas y entorno.
- Capacidades multilingües presumibles (no confirmadas en la documentación de la cuantización).

## Casos de uso

- Automatización de oficina: el modelo puede generar documentos, resumir correos y gestionar hojas de cálculo a partir de instrucciones en lenguaje natural, gracias a su capacidad de tool calling y su contexto largo.
- Agentes de codificación autónomos: con soporte de razonamiento multi-paso y tool calling, puede interactuar con repositorios, ejecutar comandos y resolver issues de programación de forma autónoma.
- Asistentes de atención al cliente con visión: al aceptar imágenes, puede analizar capturas de pantalla o fotos de productos y responder consultas multi-turno manteniendo el contexto de la conversación.
- Análisis de documentos técnicos y científicos: su ventana de 262K tokens permite procesar papers extensos o manuales completos en una sola pasada, extrayendo información y respondiendo preguntas.
- Automatización de tareas de escritorio (OSWorld): el modelo está diseñado para interactuar con interfaces gráficas, planificar acciones y ejecutar flujos de trabajo en entornos simulados.
- Desarrollo de asistentes personales locales: gracias a la cuantización MLX, puede ejecutarse en un Mac con 64 GB de RAM, ofreciendo capacidades de visión y razonamiento sin depender de la nube.

## Benchmarks y rendimiento

Los siguientes datos corresponden al modelo base Qwen3.8-27B sin cuantizar, publicados por el equipo de Qwen. No se han publicado benchmarks específicos de la versión cuantizada, aunque la validación interna reporta una similitud semántica de 0,952 respecto al modelo BF16.

| Benchmark | Resultado |
|---|---|
| DeepSWE (software engineering) | 42,2 |
| Terminal Bench (tareas de terminal) | 73,0 |
| OSWorld (automatización de escritorio) | 84,3 |

La cuantización MLX 5-bit muestra una aceleración del 21,2 % en tokens por segundo gracias al MTP, con una tasa de aceptación de drafts del 95,45 %. El pico de memoria medido durante la generación fue de 21,7 GB.

## Requisitos de hardware

- VRAM estimada: 21,7 GB de pico de memoria durante la generación (medido en Apple Silicon).
- Hardware recomendado: Apple Silicon con 64 GB de memoria unificada (según la model card). También se ha validado en AMD Ryzen AI Max y GPUs Radeon con LM Studio.
- No cabe en GPUs de consumo con menos de 24 GB de VRAM; requiere al menos una RTX 4090 o equivalente para cargar los pesos en memoria.
- Opciones de despliegue: mlx-vlm 0.6.1 con mlx 0.31.2 y mlx-lm 0.31.3, incluyendo el drafter MTP. También compatible con LM Studio en hardware AMD.
- Latencia y throughput: 13,0 tokens por segundo con MTP activado (medido en Apple Silicon con 64 GB), frente a 10,7 tokens por segundo sin MTP.

## Comparativa con modelos similares

La comparativa se realiza entre la cuantización y el modelo base, así como con alternativas de la misma familia.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache-2.0 | Modelo original BF16, mayor precisión pero requiere más memoria |
| Chungulus/Qwen3.8-27B-MLX-5bit | 27B | 262K | Apache-2.0 | Cuantización 5-bit, 20,3 GB, pensada para Apple Silicon |
| Qwen2.5-VL-32B | 32B | 128K | Apache-2.0 | Generación anterior, sin MTP ni Gated DeltaNet |

No se dispone de datos comparativos con otros modelos de 27B de otras familias (p. ej., Llama 3.2 Vision) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 5 bits puede degradar ligeramente la calidad en tareas de alta sensibilidad numérica o razonamiento complejo; la validación muestra una similitud semántica de 0,952, no una equivalencia exacta.
- El contexto máximo probado en la validación es de 73 tokens de prompt; el límite arquitectónico de 262K no ha sido verificado en esta cuantización y no debe asumirse sin pruebas.
- La model card advierte que un cargador que solo lea tensores de lenguaje no es suficiente; se requiere soporte completo para el grafo híbrido Gated DeltaNet/atención, el vision tower y el MTP.
- Los idiomas soportados no están documentados en la cuantización; aunque la familia Qwen suele ser multilingüe, no hay confirmación oficial.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de visión donde la interpretación de imágenes puede ser incorrecta.
- Licencia Apache-2.0 permite uso comercial, pero la atribución al modelo original de Qwen es obligatoria.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-5bit
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía completa de Qwen3.8-27B (blog): https://lovableapp.org/blog/qwen3-8-27b
- Anuncio de soporte AMD: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
