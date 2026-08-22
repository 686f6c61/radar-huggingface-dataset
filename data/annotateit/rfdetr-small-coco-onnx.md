# AnnotateIt/rfdetr-small-coco-onnx

## Resumen

El modelo `AnnotateIt/rfdetr-small-coco-onnx` es una conversión no oficial a ONNX del detector de objetos RF-DETR Small, desarrollado por Roboflow. RF-DETR es una arquitectura basada en transformers para detección y segmentación de objetos en tiempo real, que reporta un AP de 53.0 en COCO. Esta conversión exporta un único archivo ONNX con las salidas crudas del modelo (sin NMS, sigmoid ni postprocesamiento), lo que lo hace adecuado para integrarse en pipelines de inferencia personalizados.

El modelo original de RF-DETR está diseñado para ser ajustado en tareas específicas de detección, y este checkpoint concreto ha sido entrenado sobre el conjunto COCO, detectando las 90 clases de objetos (91 slots en el layout de DETR). La conversión mantiene la entrada estática de 512×512 píxeles en formato NCHW y produce 300 detecciones por imagen. Aunque el modelo está pensado para tareas de visión por computador, no tiene capacidades lingüísticas ni multimodales más allá de la detección.

La relevancia de este modelo radica en su formato ONNX, que facilita el despliegue en entornos de producción con ONNX Runtime, WebGPU o móvil, sin depender de PyTorch. Es una opción ligera para aplicaciones de detección en tiempo real, aunque requiere una capa de postprocesamiento externa para obtener resultados finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (transformer de detección, basado en DETR) |
| Parametros totales | no disponible (el archivo ONNX pesa 114,4 MB, estimación ~28,5M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantizacion | no disponible (el archivo es float32) |
| Idiomas soportados | no disponible (no aplica, modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo único `model.onnx`) |

## Arquitectura y entrenamiento

RF-DETR es una arquitectura de detección de objetos basada en transformers, inspirada en DETR, que usa 300 queries y realiza una predicción de conjuntos (set prediction) sin necesidad de anclas ni NMS en el modelo. El modelo pequeño (small) está diseñado para ejecución en tiempo real, con una entrada de 512×512 píxeles. La conversión ONNX exporta las salidas crudas: logits de clase con 91 slots (90 clases COCO + background) y cajas normalizadas en formato `cxcywh`.

El entrenamiento del checkpoint original se realizó sobre el dataset COCO, aunque no se proporcionan detalles sobre el número de tokens (no aplica a visión) ni el proceso de entrenamiento (RLHF, DPO, etc.). La conversión ONNX no reentrena el modelo; se limita a exportar los pesos de Roboflow, por lo que el rendimiento reportado (AP 53.0 en COCO) es el del modelo original, no re-medido en esta versión.

## Capacidades

- Detección de objetos en imágenes: identifica hasta 90 clases del dataset COCO (incluyendo objetos como personas, vehículos, animales, etc.).
- Salidas crudas sin postprocesamiento: devuelve logits de clase y cajas normalizadas, permitiendo al usuario aplicar su propio sigmoid, NMS y umbral.
- 300 queries por imagen, con predicción de conjuntos estilo DETR, lo que permite detectar múltiples objetos en una sola pasada.
- Formato de entrada fijo de 512×512, adecuado para pipelines que requieran tamaño de entrada constante.
- Compatibilidad con ONNX Runtime (CPU, GPU, WebGPU), facilitando la integración en aplicaciones web y móviles.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas.

## Casos de uso

- **Detección de objetos en tiempo real en aplicaciones móviles**: el modelo ONNX puede ejecutarse con ONNX Runtime Mobile o WebGPU en el navegador, permitiendo la detección de objetos en vídeo o imágenes capturadas con la cámara. Su tamaño reducido y la entrada de 512×512 lo hacen adecuado para dispositivos con recursos limitados.

- **Control de inventario en almacenes**: integrado en un sistema de visión por computador, puede contar y clasificar productos en estanterías. La salida de 300 detecciones permite manejar escenas con múltiples objetos, y la licencia Apache-2.0 facilita su uso comercial.

- **Vigilancia y seguridad**: desplegado en un servidor con ONNX Runtime, puede analizar secuencias de vídeo para detectar intrusos o vehículos. La ausencia de NMS en el modelo obliga a implementar el postprocesamiento, pero permite ajustar el umbral de confianza según la aplicación.

- **Robótica y navegación autónoma**: como parte de un pipeline de visión, el modelo puede detectar obstáculos u objetos de interés en entornos interiores. Su tamaño pequeño permite ejecutarlo en una GPU integrada o CPU en tiempo real.

- **Análisis de imágenes médicas (con fine-tuning previo)**: aunque el checkpoint es de COCO, la arquitectura RF-DETR está diseñada para fine-tuning en dominios específicos. Este modelo puede servir como base para entrenar un detector de lesiones o estructuras anatómicas, exportando de nuevo a ONNX para producción.

- **Aplicaciones web de etiquetado automático**: un frontend que utiliza WebGPU puede cargar este modelo para etiquetar imágenes en el navegador sin enviar datos al servidor, mejorando la privacidad y reduciendo la latencia.

## Benchmarks y rendimiento

| Benchmark | Resultado | Nota |
|---|---|---|
| COCO AP (reportado por upstream) | 53.0 | No re-medido en esta conversión |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- El archivo ONNX ocupa 114,4 MB en float32, lo que equivale a aproximadamente 28,6 millones de parámetros. La inferencia puede ejecutarse en CPU con 2-4 GB de RAM disponible.
- VRAM estimada para inferencia en GPU: ~300-500 MB para el modelo en float32, dependiendo del runtime y el lote. Es posible ejecutarlo en una GPU con 2 GB de VRAM, como una NVIDIA GTX 1050 Ti o superior.
- Compatible con GPUs de consumo como RTX 2060, RTX 3060, etc., así como con hardware integrado (e.g., Apple Silicon, Intel Iris Xe) mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU/CUDA), ONNX Runtime Web (WebGPU/WASM), TGI (no recomendado, es para LLMs), llama.cpp (no aplica, es para modelos de lenguaje). Para visión, se recomienda ONNX Runtime o TFLite.
- Latencia estimada: no disponible, pero para una imagen de 512×512 en una GPU moderna se espera un tiempo de inferencia inferior a 20 ms (basado en la arquitectura real-time). En CPU, puede ser de 50-100 ms.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | COCO AP | Formato | Licencia |
|---|---|---|---|---|---|
| RF-DETR Small (este) | Transformer (DETR) | no disponible (~28M) | 53.0 | ONNX | Apache-2.0 |
| RT-DETR (ejemplo) | Transformer (DETR) | no disponible | ~50-54 | PyTorch/ONNX | Apache-2.0 |
| YOLOv8 (ejemplo) | CNN | 3.2M-68M | ~37-53 | PyTorch/ONNX | AGPL-3.0 |

Nota: los datos de RT-DETR y YOLOv8 son orientativos y pueden variar; no se dispone de comparación directa en esta información.

## Limitaciones y advertencias

- Conversión no oficial y no respaldada por los autores originales de RF-DETR; puede haber diferencias en el comportamiento exacto respecto al modelo PyTorch.
- La tabla de clases es no verificada: el modelo emite 91 slots (índice 0 = background), pero se recomienda confirmar el número de columnas y el slot de no-objeto con Netron y una imagen conocida antes de usarlo en producción.
- No incluye postprocesamiento (NMS, sigmoid, top-k), por lo que el usuario debe implementarlo externamente. La salida cruda puede contener múltiples detecciones solapadas.
- El rendimiento reportado (AP 53.0) es el del checkpoint original de Roboflow, no se ha re-medido en esta conversión ONNX.
- La entrada es estática (512×512); no admite resoluciones variables sin re-exportar el modelo.
- No se ha probado el modelo en dispositivos móviles ni en WebGPU; se requiere verificación en el entorno objetivo.
- El tamaño del repo es 0.1 GB, lo que puede ser demasiado grande para aplicaciones web con restricciones de descarga.

## Enlaces

- HuggingFace: https://huggingface.co/AnnotateIt/rfdetr-small-coco-onnx
- Repositorio original de RF-DETR: https://github.com/roboflow/rf-detr
- Repositorio de conversión ONNX con código de inferencia: https://github.com/PierreMarieCurie/rf-detr-onnx
- Otro ONNX de RF-DETR Small para 80 clases: https://huggingface.co/tuxracer/coco-rfdetr-small
- Documentación de RF-DETR Small: https://rfdetr.roboflow.com/reference/small/
