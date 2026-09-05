# Luca207/deepseek_ocr_finetuned2

## Resumen

Luca207/deepseek_ocr_finetuned2 es un modelo de visión y lenguaje (VLM) finetuneado a partir del modelo DeepSeek-OCR de DeepSeek-AI. El modelo base utiliza la arquitectura DeepSeek-VL2 y está orientado a tareas de reconocimiento óptico de caracteres (OCR), con un enfoque de compresión óptica de contextos. Este finetune fue creado por el desarrollador Luca207 y entrenado dos veces más rápido gracias a la librería Unsloth junto con la librería TRL de Hugging Face.

El modelo tiene un total de 3.336.106.240 parámetros, lo que lo sitúa en la categoría de 3.000 millones (3B). El peso de los archivos safetensors es de 6,7 GB, un tamaño que permite su ejecución en GPUs de consumo con suficiente memoria de video. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en proyectos de producción.

Aunque la ficha de modelo publicada no detalla las capacidades específicas del finetune ni sus datos de entrenamiento, se presenta como una variante afinada para OCR y extracción de características, útil como punto de partida para aplicaciones de reconocimiento de texto en imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeepSeek-VL2 (VLM basado en transformer) |
| Parametros totales | 3.336.106.240 |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo incluye pesos en safetensors sin cuantizar) |
| Idiomas soportados | Inglés (según metadatos y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DeepSeek-OCR, que a su vez hereda la arquitectura DeepSeek-VL2. Se trata de un modelo multimodal de visión y lenguaje que procesa imágenes y texto de manera conjunta. No se han publicado en la información disponible detalles sobre la composición del dataset de finetune, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO durante el ajuste.

El desarrollador indica explícitamente que el modelo fue entrenado con Unsloth y Hugging Face TRL, y que el finetune se realizó sobre el modelo base deepseek-ai/DeepSeek-OCR. La única innovación técnica destacable en la información disponible es el uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Extracción de características (feature extraction) según el pipeline indicado en Hugging Face.
- Reconocimiento óptico de caracteres (OCR) como función principal heredada del modelo base.
- Procesamiento multimodal de imágenes y texto gracias a la arquitectura DeepSeek-VL2.
- No se dispone de información que confirme soporte de tool calling, function calling, razonamiento multi-paso, generación de código ni matemáticas.
- No se dispone de información sobre capacidades de agentes, vision activa, audio o modo de pensamiento.

## Casos de uso

- Digitalización de documentos históricos: el modelo puede extraer texto de imágenes escaneadas de archivos antiguos, facilitando su indexación y búsqueda en repositorios digitales.
- Reconocimiento de texto en facturas y recibos: la capacidad de OCR del modelo permite automatizar la captura de importes, fechas y conceptos en facturas para su integración en sistemas contables.
- Procesamiento de placas de matrícula o señales de tráfico: en sistemas de visión por computador, el modelo puede leer texto en escenas reales capturadas por cámaras, aunque se requeriría una validación específica para ese dominio.
- Extracción de texto de capturas de pantalla y documentos de apoyo: útil en asistentes virtuales que necesitan leer contenido de imágenes o PDFs escaneados para responder preguntas.
- Automatización de la entrada de datos en entornos administrativos: al leer formularios en papel, el modelo puede convertir la información a texto estructurado para su posterior procesamiento.
- Doblaje o subtitulado de contenido visual: si el modelo se usa con un sistema de traducción externo, puede extraer texto superpuesto o en cartelas de vídeo para generar subtítulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener aproximadamente 3.336 millones de parámetros, los pesos en FP16 ocupan unos 6,7 GB. Se requiere al menos 8 GB de VRAM para una ejecución directa, y más si se cargan capas adicionales o se procesan imágenes de alta resolución.
- GPU recomendadas: tarjetas con 8 GB o más, como RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090, o GPUs de centro de datos como A100 y H100.
- Sí cabe en una GPU de consumo: por ejemplo, una RTX 3060 de 12 GB puede ejecutar el modelo en FP16 sin necesidad de cuantización adicional.
- Opciones de despliegue: vLLM (soporta Transformers y safetensors), Ollama, llama.cpp si se convierten los pesos a GGUF, y Hugging Face Text Generation Inference (TGI).
- Latencia y throughput: no disponible, al no haberse publicado mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Luca207/deepseek_ocr_finetuned2 | 3.336M | No disponible | Apache 2.0 | Hugging Face |
| deepseek-ai/DeepSeek-OCR (modelo base) | 3B (aprox.) | No disponible | MIT | Hugging Face / GitHub |
| vinhnx90/deepseek-orc-3b-persian-detection-f16-vllm | 3B (aprox.) | No disponible | No disponible | Hugging Face |

El finetune aquí descrito mantiene la misma arquitectura y tamaño que el modelo base DeepSeek-OCR, pero difiere en la licencia (Apache 2.0 frente a MIT) y en el autor. No se conocen datos de benchmarks que permitan comparar su rendimiento con otras alternativas.

## Limitaciones y advertencias

- El modelo solo aparece etiquetado con el idioma inglés, lo que puede limitar su rendimiento en otros idiomas.
- No se dispone de una evaluación formal publicada; por tanto, no hay datos objetivos sobre sesgos, precisión o tasa de alucinación.
- Al ser un finetune no verificado por el equipo original de DeepSeek, su calidad puede variar según el dataset de ajuste y la tarea concreta.
- La licencia Apache 2.0 permite el uso comercial, pero el usuario es responsable de cumplir las condiciones de atribución y de la gestión de posibles patentes.
- El modelo no incluye cuantizaciones precalculadas, lo que puede dificultar su despliegue en dispositivos con poca memoria si no se convierte previamente a GGUF u otro formato optimizado.
- Para tareas de producción se recomienda realizar una validación exhaustiva con datos propios antes de su integración.

## Enlaces

- Hugging Face: https://huggingface.co/Luca207/deepseek_ocr_finetuned2
- Repositorio del modelo base en GitHub: https://github.com/deepseek-ai/DeepSeek-OCR
- Página de búsqueda de modelos finetuneados de DeepSeek-OCR en Hugging Face: https://huggingface.co/models?other=base_model%3Afinetune%3Adeepseek-ai%2FDeepSeek-OCR
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
