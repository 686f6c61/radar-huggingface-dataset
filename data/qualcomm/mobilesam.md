# qualcomm/MobileSam

## Resumen

MobileSam es una versión ligera del modelo Segment Anything (SAM) de Meta, optimizada por Qualcomm para su despliegue en dispositivos móviles y embebidos. Se trata de un transformer encoder-decoder que, a partir de un prompt (punto, caja o máscara), genera la segmentación semántica de un objeto en una imagen sin necesidad de entrenamiento adicional. El modelo está basado en el checkpoint `vit_t` (ViT-Tiny) y ha sido pre-exportado a formatos ONNX, QNN_DLC y TFLITE para ejecutarse directamente en la NPU de los chipsets Snapdragon y Dragonwing.

La relevancia de MobileSam radica en su capacidad para llevar la segmentación por prompts a entornos con recursos limitados, donde el SAM original (con backbones ViT-B o ViT-H) resulta demasiado pesado. Con un total de aproximadamente 13,1 millones de parámetros (6,95M en el encoder y 6,16M en el decoder), el modelo alcanza latencias de entre 2,5 y 15 ms en hardware Qualcomm, lo que lo hace viable para aplicaciones en tiempo real. El repositorio de HuggingFace incluye los pesos pre-exportados y las herramientas para reexportarlos con configuraciones personalizadas mediante la librería Qualcomm AI Hub Models.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (basado en SAM con backbone ViT-Tiny) |
| Parametros totales | 13,11 M (encoder: 6,95 M, decoder: 6,16 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, no texto) |
| Tipos de cuantizacion | float (ONNX, QNN_DLC, TFLITE) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (repo), ONNX, QNN_DLC, TFLITE (pre-exportados) |

## Arquitectura y entrenamiento

MobileSam sigue la arquitectura de SAM: un encoder de imagenes (ViT-Tiny) que genera embeddings y un decoder ligero que opera sobre esos embeddings para producir mascaras de segmentacion a partir de prompts. El modelo fue entrenado mediante destilacion de conocimiento desde el SAM original con backbone ViT-H, lo que permite reducir drasticamente el numero de parametros manteniendo una calidad de segmentacion aceptable. El paper de referencia es "MobileSAM: Faster Segment Anything" (arXiv:2306.14289). No se han publicado detalles sobre el dataset de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO, ya que es un modelo de vision y no de lenguaje.

La innovacion principal de esta version de Qualcomm es la optimizacion especifica para su hardware: los pesos pre-exportados estan compilados para ejecutarse en la NPU de los chipsets Snapdragon y Dragonwing, con soporte para los runtimes QAIRT (Qualcomm AI Runtime) y ONNX Runtime. El modelo acepta una resolucion de entrada de 720p (720x1280) y se puede reexportar con formas de entrada personalizadas mediante la libreria `qai_hub_models`.

## Capacidades

- Segmentacion de imagenes por prompts: acepta puntos, cajas o mascaras como entrada para segmentar objetos concretos.
- Segmentacion sin entrenamiento adicional: el modelo generaliza a clases no vistas, ya que no depende de una taxonomia fija.
- Generacion de embeddings de imagen: el encoder produce representaciones que pueden reutilizarse para multiples prompts sobre la misma imagen.
- Optimizacion para hardware Qualcomm: ejecucion en NPU con latencias de 2,5 a 15 ms segun el chipset.
- Soporte de exportacion personalizada: permite ajustar pesos, formas de entrada y configuraciones de runtime.
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multimodal.

## Casos de uso

- Edicion de imagenes en movil: recortar o eliminar objetos de una foto en tiempo real usando un punto o una caja como prompt. MobileSam permite hacerlo en el dispositivo sin enviar datos a la nube.
- Realidad aumentada: segmentar objetos del entorno para superponer contenido virtual, con latencias de 3-6 ms en Snapdragon 8 Gen 3, suficiente para aplicaciones interactivas.
- Automatizacion de procesos de diseno: extraer siluetas de productos o personas en flujos de trabajo de diseno grafico, sustituyendo tareas manuales de recorte.
- Vision por computador en robotica: segmentacion de objetos en tiempo real para robots moviles o drones, aprovechando el bajo consumo de la NPU de Qualcomm.
- Analisis medico en dispositivos: segmentacion de estructuras en imagenes medicas (por ejemplo, organos en ecografias) con privacidad de datos al procesarse localmente.
- Aplicaciones de accesibilidad: identificar y resaltar objetos en la escena para personas con discapacidad visual, usando prompts de voz convertidos a puntos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (mIoU, Dice, etc.) en la informacion disponible. Sin embargo, la tabla de rendimiento de Qualcomm proporciona latencias de inferencia para el decoder en diferentes chipsets, medidas con ONNX y QNN_DLC en precision float:

| Chipset | Runtime | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|---|
| Snapdragon X2 Elite | ONNX | 2,634 | 4 |
| Snapdragon X Elite | ONNX | 6,155 | 11 |
| Snapdragon 8 Gen 3 | ONNX | 4,064 | 1-269 |
| Snapdragon 8 Gen 1 | ONNX | 14,638 | 5-236 |
| Snapdragon 8 Elite | ONNX | 3,186 | 0-235 |
| Snapdragon 8 Elite Gen 5 | ONNX | 2,539 | 2-215 |
| Snapdragon X2 Elite | QNN_DLC | 3,03 | 4 |
| Snapdragon X Elite | QNN_DLC | 5,911 | 4 |
| Snapdragon 8 Gen 3 | QNN_DLC | 3,782 | 4-221 |
| Snapdragon 8 Gen 1 | QNN_DLC | 11,744 | 0-220 |
| Snapdragon 8 Elite | QNN_DLC | 2,852 | 0-221 |
| Snapdragon 8 Elite Gen 5 | QNN_DLC | 2,557 | 4-194 |

Estos datos corresponden unicamente al decoder; el encoder no aparece en la tabla publicada. La unidad de computo principal es la NPU en todos los casos.

## Requisitos de hardware

- VRAM estimada: no aplica directamente, ya que el modelo esta disenado para NPU de Qualcomm. En CPU/GPU generica, el encoder (26,6 MB) y el decoder (23,7 MB) en float requieren menos de 100 MB de memoria combinada.
- GPUs recomendadas: no es el objetivo del modelo; esta pensado para chipsets Snapdragon (8 Gen 1, 8 Gen 3, 8 Elite, X Elite, X2 Elite) y Dragonwing (QCS8450, SA8650P, etc.).
- Compatibilidad con GPU de consumo: el modelo es tan ligero que puede ejecutarse en cualquier GPU moderna (incluso integradas) con mas de 2 GB de VRAM, aunque no se han publicado benchmarks en ese escenario.
- Opciones de despliegue: Qualcomm AI Hub Workbench, ONNX Runtime, TFLite, y la libreria `qai_hub_models` para exportacion personalizada.
- Latencia y throughput: segun la tabla anterior, entre 2,5 y 15 ms en NPU de Qualcomm, dependiendo del chipset y runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (mIoU en COCO) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileSam (Qualcomm) | 13,11 M | 720p | no disponible | Apache 2.0 | HuggingFace, Qualcomm AI Hub |
| SAM ViT-B | 91 M | 1024x1024 | ~46 (aprox.) | Apache 2.0 | GitHub, HuggingFace |
| SAM ViT-H | 636 M | 1024x1024 | ~51 (aprox.) | Apache 2.0 | GitHub, HuggingFace |
| FastSAM | 68 M | 1024x1024 | ~37 (aprox.) | Apache 2.0 | GitHub, HuggingFace |

Los datos de precision de SAM y FastSAM son aproximados y provienen de los papers originales; no se han verificado en esta ficha. MobileSam sacrifica precision por velocidad y eficiencia, siendo adecuado para despliegue en borde.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo de segmentacion generica, puede fallar en objetos poco representados en los datos de entrenamiento (no se han publicado detalles del dataset).
- Riesgo de alucinacion: en segmentacion, puede generar mascaras espurias cuando el prompt es ambiguo o la imagen tiene mucho ruido.
- Limitaciones de contexto: la resolucion de entrada esta fijada a 720p en la configuracion pre-exportada; otras resoluciones requieren reexportacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los pesos pre-exportados estan optimizados para hardware Qualcomm; su uso en otras plataformas puede requerir recompilacion.
- Caveat de produccion: la tabla de rendimiento solo cubre el decoder; el encoder puede tener latencias mayores y no se ha publicado su rendimiento en NPU.
- Dependencia de Qualcomm: el soporte de QNN_DLC y TFLITE esta ligado a los runtimes de Qualcomm; en otros dispositivos habra que usar ONNX o PyTorch.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/MobileSam
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/mobilesam
- Qualcomm AI Hub (automocion): https://aihub.qualcomm.com/automotive/models/mobilesam
- Repositorio GitHub (Qualcomm AI Hub Models): https://github.com/qualcomm/ai-hub-models/tree/main/qai_hub_models/models/mobilesam
- Paper original (MobileSAM): https://arxiv.org/abs/2306.14289
- Repositorio SAM de Meta: https://github.com/facebookresearch/segment-anything
