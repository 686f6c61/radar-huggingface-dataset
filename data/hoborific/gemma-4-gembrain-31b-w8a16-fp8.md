# hoborific/Gemma-4-Gembrain-31B-W8A16-FP8

## Resumen

El modelo **Gemma-4-Gembrain-31B-W8A16-FP8** es una versión cuantizada del modelo base **Nimbz/Gemma-4-Gembrain-31B**, desarrollada por el usuario hoborific. Este modelo base es una síntesis de varios modelos, con Gemsicle-31B como ingrediente principal, y busca estabilizar y mejorar el razonamiento lógico y lateral, tanto con como sin razonamiento explícito. La cuantización se realiza en formato **W8A16 FP8** mediante la librería `compressed-tensors`, lo que permite reducir el peso de los parámetros a 8 bits (float8_e4m3fn) manteniendo las activaciones en bf16/fp16.

El modelo conserva la arquitectura del Gemma 4 31B original, con una ventana de contexto de hasta 256K tokens y soporte multimodal (imagen y texto). Está pensado para su despliegue con vLLM en plataformas Intel XPU y NVIDIA CUDA (SM75+), y no es compatible con ROCm, CPU o TPU. Con 31.273 millones de parámetros, es un modelo denso que requiere hardware con al menos 48 GB de VRAM para inferencia en FP8.

Esta ficha se centra en la versión cuantizada, por lo que los datos de rendimiento, licencia e idiomas no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Gemma 4 31B) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (heredado del modelo base Gemma 4) |
| Tipos de cuantizacion | W8A16 FP8 (float8_e4m3fn) con escalas por canal de salida; activaciones en bf16/fp16 |
| Idiomas soportados | No disponible (el modelo base Gemma 4 soporta más de 140 idiomas, pero no se confirma para esta versión) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (con cuantización compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base **Nimbz/Gemma-4-Gembrain-31B** es una síntesis de varios modelos, entre los que destaca Gemsicle-31B. Su objetivo es mejorar la estabilidad y el razonamiento lógico y lateral. No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en los datos proporcionados.

La versión cuantizada aplica una cuantización offline **W8A16 FP8** sobre las capas lineales 2D (attention q/k/v/o y MLP gate/up/down). Cada fila de salida tiene su propia escala, calculada a partir de `amax / 448` y refinada mediante una búsqueda de error cuadrático medio sobre 9 fracciones de clip (0.8–1.0× amax). Los pesos se cuantizan con redondeo al más cercano y saturación. Las capas de embedding, normas, lm_head, routers/experts y la torre de visión se mantienen en bf16, y se incluyen en la lista `ignore` del checkpoint para que vLLM no las modifique.

## Capacidades

- **Procesamiento multimodal**: al ser un modelo `image-text-to-text`, puede recibir imágenes y texto como entrada, lo que permite tareas de visión y lenguaje.
- **Generación de texto**: produce texto coherente y contextualizado, adecuado para conversación, redacción y resumen.
- **Razonamiento y lógica**: el modelo base está diseñado para mejorar el razonamiento lógico y lateral, tanto con razonamiento explícito (chain-of-thought) como sin él.
- **Codificación y matemáticas**: hereda las capacidades de Gemma 4, que está optimizado para tareas de programación y cálculo.
- **Soporte de tool calling y agentes**: aunque no se confirma explícitamente en esta versión cuantizada, el modelo base Gemma 4 incluye soporte para function calling y flujos agénticos.
- **Multilingüismo**: el modelo base soporta más de 140 idiomas, aunque no se especifica si esta cuantización mantiene todas las capacidades lingüísticas.

## Casos de uso

- **Asistente virtual multimodal**: el modelo puede analizar imágenes (capturas de pantalla, diagramas, fotografías) y responder preguntas sobre ellas, combinando visión y lenguaje en un solo flujo.
- **Atención al cliente automatizada**: con una ventana de contexto de 256K tokens, puede gestionar conversaciones multi-turno con historial extenso, manteniendo el contexto de la interacción durante largas sesiones.
- **Generación de código en producción**: gracias a su capacidad de razonamiento y su soporte potencial de tool calling, puede integrarse en pipelines de CI/CD para autocompletar código, generar tests o revisar pull requests.
- **Análisis de documentos técnicos**: puede procesar documentos largos (manuales, informes, papers) y extraer información relevante, resumir secciones o responder preguntas específicas sobre el contenido.
- **Razonamiento y planificación de agentes**: el modelo puede descomponer tareas complejas en pasos intermedios, útil para sistemas de automatización que requieren planificación secuencial.
- **Traducción y adaptación multilingüe**: aunque los idiomas no están confirmados, el modelo base soporta más de 140 idiomas, por lo que puede utilizarse para traducción automática y localización de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas para esta versión cuantizada.

## Requisitos de hardware

- **VRAM estimada**: con 31.273 millones de parámetros en FP8 (1 byte por peso), los pesos ocupan aproximadamente 31 GB. Añadiendo activaciones en bf16 (2 bytes) y la caché KV para contexto largo, se recomienda un mínimo de 48 GB de VRAM.
- **GPU recomendadas**: NVIDIA A100 80GB, H100 80GB, RTX 6000 Ada 48GB, o GPUs Intel XPU compatibles. No cabe en GPUs de consumo como RTX 4090 (24 GB) ni RTX 3090 (24 GB).
- **Compatibilidad**: solo funciona con vLLM en Intel XPU (kernel `XPUW8A16FP8LinearKernel`) y NVIDIA CUDA SM75+ (Turing o más reciente, con kernel `HummingFP8ScaledMMLinearKernel` o `MarlinFP8ScaledMMLinearKernel`). No es compatible con ROCm, CPU ni TPU.
- **Opciones de despliegue**: vLLM es la plataforma principal. También podría usarse con transformers, pero la cuantización está optimizada para vLLM y puede haber pérdida de rendimiento en otros entornos.
- **Latencia y throughput**: no se han proporcionado datos específicos. Dependerá del hardware y de la configuración de vLLM (tamaño de batch, número de workers, etc.).

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, se puede comparar a nivel de especificaciones con otros modelos de tamaño similar:

| Modelo | Parámetros | Contexto | Cuantización | Licencia |
|---|---|---|---|---|
| Gemma-4-Gembrain-31B-W8A16-FP8 (este) | 31.27B | 256K | W8A16 FP8 | No disponible |
| Gemma 4 31B (original) | 31B | 256K | Sin cuantizar (bf16) | Gemma Terms of Use |
| Llama 3.1 30B | 30B | 128K | Varias (GGUF, AWQ, etc.) | Llama 3.1 Community License |
| Qwen 2.5 32B | 32B | 128K | Varias | Apache 2.0 |

La principal diferencia de esta versión es su formato de cuantización específico para vLLM en XPU y CUDA, así como su origen en un modelo sintetizado (Gembrain-31B) que no está disponible públicamente con la misma licencia.

## Limitaciones y advertencias

- **Soporte de hardware limitado**: solo funciona con vLLM en Intel XPU y NVIDIA CUDA (SM75+). No es compatible con ROCm, CPU ni TPU, lo que restringe su despliegue en entornos heterogéneos.
- **Licencia no disponible**: al no especificarse la licencia, no se garantiza el uso comercial ni la redistribución. Es necesario contactar con el autor antes de utilizarlo en producción.
- **Pérdida de precisión por cuantización**: aunque la cuantización W8A16 FP8 está diseñada para minimizar el error, puede haber una ligera degradación en tareas de alta precisión numérica o razonamiento complejo.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- **Sesgos y limitaciones lingüísticas**: al no confirmarse los idiomas soportados, puede haber un rendimiento desigual en lenguas minoritarias o con pocos recursos.
- **Contexto largo**: aunque la ventana es de 256K tokens, el uso de contextos muy largos aumenta el consumo de VRAM y puede degradar la calidad de las respuestas si no se gestiona adecuadamente.

## Enlaces

- [Modelo cuantizado en Hugging Face](https://huggingface.co/hoborific/Gemma-4-Gembrain-31B-W8A16-FP8)
- [Modelo base Nimbz/Gemma-4-Gembrain-31B](https://huggingface.co/Nimbz/Gemma-4-Gembrain-31B)
- [Gemma 4 - Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 model card - Google AI for Developers](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Gemma 4 - Google AI Edge](https://developers.google.com/edge/litert-lm/models/gemma-4)
