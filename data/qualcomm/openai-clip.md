# qualcomm/OpenAI-Clip

## Resumen

OpenAI-Clip es una exportación optimizada del modelo CLIP (Contrastive Language-Image Pre-Training) original de OpenAI, publicada por Qualcomm en Hugging Face bajo el identificador `qualcomm/OpenAI-Clip`. No se trata de un modelo nuevo entrenado por Qualcomm, sino de una conversión del checkpoint ViT-B/16 de CLIP a formatos ejecutables en hardware Qualcomm (ONNX, QNN_DLC y TFLite), pensada para desplegar clasificación y búsqueda de imágenes en dispositivos con NPU Hexagon (móviles Snapdragon, plataformas Dragonwing y SoCs QCS).

CLIP combina un codificador visual tipo ViT con un codificador de texto transformer causal, ambos proyectados a un espacio latente compartido mediante entrenamiento contrastivo. Esto permite tareas de zero-shot: clasificación de imágenes contra etiquetas textuales, retrieval imagen-texto y similitud multimodal, sin necesidad de fine-tuning específico por tarea. El checkpoint exportado usa ViT-B/16 con entrada de 224x224, 150 millones de parámetros y una longitud de contexto de texto de 77 tokens.

La relevancia actual del repo reside en su orientación a inferencia en el borde: Qualcomm publica métricas de latencia por chipset (por ejemplo, 8,9 ms en Snapdragon 8 Elite Extreme Gen 6, 10,4 ms en Snapdragon 8 Elite Gen 5 for Galaxy) ejecutando en NPU, con variantes float y cuantización w8a16. Es un recurso práctico para integrar CLIP en aplicaciones Android o embebidas sin depender de GPU en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos torres: ViT-B/16 para imagen y transformer causal para texto (CLIP) |
| Parametros totales | 150 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 77 tokens (texto); imagen 224x224 |
| Tipos de cuantizacion | float y w8a16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (también exportable desde el repo de AI Hub Models) |

## Arquitectura y entrenamiento

El modelo reproduce la arquitectura CLIP original de OpenAI (paper arXiv:2103.00020): un codificador visual ViT-B/16 que procesa imágenes de 224x224 y un codificador de texto transformer causal que procesa hasta 77 tokens. Ambos generan embeddings que se alinean en un espacio común mediante un objetivo contrastivo sobre pares imagen-texto. Qualcomm no ha reentrenado el modelo; el repo contiene artefactos exportados y compilados del checkpoint ViT-B/16 original.

La innovación del repo no está en el entrenamiento sino en el pipeline de despliegue: exportación a ONNX, QNN_DLC (Qualcomm AI Engine Direct) y TFLite, con compilación y perfilado mediante Qualcomm AI Hub Workbench. Se ofrecen variantes float y w8a16 para equilibrar precisión y memoria, y la librería `qai-hub-models` permite reexportar con pesos personalizados, formas de entrada propias y configuraciones de dispositivo. No se documentan en la información disponible detalles sobre dataset de entrenamiento, número de tokens vistos ni uso de RLHF/DPO, ya que corresponden al CLIP original y no se reproducen en esta model card.

## Capacidades

- Clasificación de imágenes zero-shot mediante comparación de embeddings visuales con prompts textuales.
- Retrieval imagen-texto y texto-imagen en un espacio latente compartido.
- Extracción de features visuales y textuales reutilizables para tareas downstream (clustering, deduplicación, moderación).
- Similitud semántica entre imagen y descripciones en lenguaje natural.
- Inferencia en NPU Hexagon de Qualcomm con latencias de milisegundos de un dígito a decenas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de representación multimodal, no un LLM generativo.
- Capacidades multilingües: no disponible en la información proporcionada.
- Sin modo thinking, visión generativa, audio ni salida de texto libre.

## Casos de uso

- Búsqueda visual en galerías locales de Android: indexar embeddings de imágenes en el dispositivo con CLIP y recuperar por consulta textual, aprovechando la NPU para evitar enviar fotos a la nube.
- Moderación de contenido on-device: clasificar imágenes contra un conjunto de etiquetas textuales (por ejemplo, "contenido violento", "desnudo", "documento") en tiempo real dentro de la app.
- Etiquetado automático de fotos en aplicaciones de galería: generar etiquetas zero-shot para organizar colecciones sin un clasificador entrenado específicamente.
- Accesibilidad: describir o clasificar escenas capturadas por la cámara para asistencia a personas con discapacidad visual, con latencia inferior a 30 ms en Snapdragon 8 Gen 1 y plataformas QCS.
- Detección de duplicados y near-duplicates en pipelines de datos: calcular embeddings visuales y agrupar por similitud coseno antes de subir a un dataset de entrenamiento.
- Filtrado previo en cámaras inteligentes y dispositivos IoT (Dragonwing IQ-8275, QCS8550): decidir si una imagen contiene un objeto de interés antes de transmitirla, reduciendo ancho de banda.
- Análisis de imágenes en aplicaciones de retail o logística embebidas: comparar fotos de producto con catálogos textuales en el propio dispositivo.

## Benchmarks y rendimiento

La model card no incluye métricas de calidad (ImageNet zero-shot, retrieval, etc.) para este checkpoint. Sí publica latencias y memoria por chipset con runtime ONNX:

| Chipset | Precision | Inferencia (ms) | Memoria pico (MB) | Unidad |
|---|---|---|---|---|
| Snapdragon 8 Elite Extreme Gen 6 | float | 8,902 | 1 - 513 | NPU |
| Snapdragon 8 Elite Gen 5 for Galaxy | float | 10,403 | 0 - 509 | NPU |
| Snapdragon 8 Elite Gen 6 | float | 12,81 | 1 - 523 | NPU |
| Snapdragon 8 Elite for Galaxy | float | 14,082 | 0 - 757 | NPU |
| Snapdragon X2 Elite | float | 11,095 | 2 - 2 | NPU |
| Snapdragon 8 Gen 3 | float | 18,48 | 1 - 713 | NPU |
| Snapdragon 8 Gen 1 | float | 33,154 | 1 - 704 | NPU |
| Dragonwing IQ-8275 | float | 31,138 | 0 - 5 | NPU |
| Snapdragon 8 Elite Gen 5 for Galaxy | w8a16 | 10,541 | 0 - 626 | NPU |
| Snapdragon 8 Gen 3 | w8a16 | 16,901 | 0 - 699 | NPU |
| Dragonwing QCS6490 | w8a16 | 113,286 | 1 - 4 | NPU |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de representación multimodal.

## Requisitos de hardware

- Tamaño del checkpoint float: 571 MB; variantes cuantizadas w8a16 reducen el peso en disco y la memoria de activaciones.
- VRAM/GPU: no aplica en el caso de uso principal; el modelo está pensado para NPU Hexagon en SoCs Qualcomm. En GPU convencional puede ejecutarse vía ONNX Runtime o PyTorch, pero no se publican cifras.
- Cabe en hardware de consumo: sí, en móviles y portátiles Snapdragon; también en cualquier GPU consumer con unos pocos GB de memoria para la versión float.
- Despliegue: ONNX Runtime, QNN (QAIRT 2.51), TFLite y la librería `qai-hub-models` para reexportación. No se documenta soporte específico de vLLM, llama.cpp o TGI, que no aplican a este tipo de modelo.
- Latencia: entre 8,9 ms y 113 ms según chipset y precisión (ver tabla de rendimiento). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto texto | Formatos | Licencia | Enfoque |
|---|---|---|---|---|---|
| qualcomm/OpenAI-Clip (este) | 150 M (ViT-B/16) | 77 tokens | ONNX, QNN_DLC, TFLITE | MIT | CLIP optimizado para NPU Qualcomm |
| openai/clip-vit-base-patch16 | 150 M | 77 tokens | PyTorch (safetensors) | MIT | Checkpoint original CLIP |
| openai/clip-vit-large-patch14 | ~428 M | 77 tokens | PyTorch | MIT | CLIP de mayor tamaño y precisión |
| SigLIP (google/siglip-base-patch16-224) | ~200 M | 64 tokens | PyTorch | Apache 2.0 | Alternativa contrastiva con mejor rendimiento zero-shot |

No se dispone de datos de benchmarks comparativos en la información proporcionada para cuantificar diferencias de precisión entre estas variantes.

## Limitaciones y advertencias

- Sesgos: CLIP hereda sesgos sociales y de representación del dataset de entrenamiento original (pares imagen-texto de internet), no auditados en esta exportación.
- Alucinación: no genera texto libre, pero puede producir clasificaciones erróneas o asociaciones espurias en zero-shot, especialmente con clases ambiguas o composiciones complejas.
- Contexto: 77 tokens de texto limitan prompts largos; la resolución fija de 224x224 puede perder detalle en imágenes de alta resolución.
- Idiomas: no se documenta qué idiomas cubre el codificador de texto; el rendimiento en castellano no está verificado.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del CLIP original de OpenAI y de los artefactos derivados.
- Producción: las métricas de latencia corresponden a runtimes y SDK concretos (QAIRT 2.51, ONNX Runtime 1.30.0); cambios de versión pueden alterar el rendimiento. El repo pesa 49,9 GB por incluir múltiples artefactos, lo que complica su descarga en entornos con ancho de banda limitado.
- No es un LLM: no soporta generación de texto, agentes ni tool calling; usarlo para esas tareas sería un error de diseño.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/OpenAI-Clip
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/openai_clip
- Repositorio AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/openai_clip
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Implementación original de CLIP: https://github.com/openai/CLIP
- Paper CLIP (arXiv:2103.00020): https://arxiv.org/abs/2103.00020
- Web de Qualcomm: https://www.qualcomm.com/
