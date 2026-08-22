# AnnotateIt/deim-rtdetrv2-l-coco-onnx

## Resumen

DEIM (DETR with Improved Matching for Fast Real-Time Object Detection) es un marco de detección de objetos desarrollado por Intellindust AI Lab, presentado en CVPR 2025. Este repositorio concreto contiene una conversión no oficial a ONNX del modelo DEIM-RT-DETRv2-L, exportada por el usuario AnnotateIt. El modelo combina la arquitectura RT-DETRv2 (basada en transformer) con el esquema de emparejamiento Dense O2O de DEIM, logrando un equilibrio entre velocidad y precisión en la detección de objetos en tiempo real.

La conversión ONNX exporta únicamente las salidas crudas del modelo (logits y cajas predichas), sin NMS, sigmoid ni preprocesamiento, lo que la hace ideal para integrarse en pipelines personalizados de inferencia. El modelo reporta un AP de 54.3 en COCO según el autor original, aunque este valor no ha sido re-medido en la conversión. La arquitectura usa un backbone ResNet50vd y 300 queries en un esquema de predicción de conjunto tipo DETR.

La relevancia de este modelo radica en que permite desplegar un detector de objetos de alto rendimiento en formato ONNX, portable a múltiples runtimes (ONNX Runtime, OpenVINO, TensorRT, etc.), manteniendo una latencia baja y un rendimiento competitivo frente a detectores de un solo disparo (one-stage) como YOLO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DEIM (RT-DETRv2-L) con backbone ResNet50vd |
| Parámetros totales | no disponible (aprox. 40-50 M según variante L) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible (solo ONNX FP32) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo único `model.onnx`, 168,9 MB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DEIM-RT-DETRv2, que combina un backbone ResNet50 (variante vd, con convoluciones dilatadas) con un transformer de detección en tiempo real. El marco DEIM introduce la estrategia de emparejamiento Dense O2O (one-to-one), que mejora la convergencia y el rendimiento frente al matching one-to-many tradicional de DETR. La cabeza de detección utiliza 300 queries y produce predicciones de conjunto (set prediction) sin necesidad de NMS.

El entrenamiento del modelo original se realizó sobre el conjunto de datos COCO, alcanzando un AP de 54.3 reportado por el autor. La conversión ONNX exporta el modelo con pesos FP32, sin ninguna capa de postprocesamiento, por lo que el usuario debe implementar sigmoid, top-k y NMS externamente. El preprocesamiento esperado es: redimensionado a 640×640, conversión a float32, división por 255 (sin normalización por media/desviación), y conversión a formato CHW.

## Capacidades

- Detección de objetos en imágenes de 640×640 con 80 clases COCO (índices 0-79).
- Predicción de cajas delimitadoras normalizadas en formato `cxcywh` (centro, ancho, alto).
- Salida cruda de logits y cajas, sin post-procesamiento, lo que permite un control total del pipeline.
- Adecuado para inferencia en tiempo real gracias a la arquitectura RT-DETRv2.
- Soporta integración en runtimes ONNX como ONNX Runtime, OpenVINO, TensorRT y llama.cpp.
- No incluye soporte de tool calling, agentes ni capacidades multilingües (es un modelo de visión puro).

## Casos de uso

- Sistemas de videovigilancia: el modelo puede integrarse en pipelines de análisis de vídeo para detectar personas, vehículos u objetos de interés en tiempo real, gracias a su entrada estática de 640×640 y su bajo coste de inferencia.
- Automatización de calidad industrial: detección de defectos en piezas mediante la adaptación del modelo a clases personalizadas, usando la salida de cajas para el control de calidad.
- Robótica móvil: integración en sistemas embebidos con ONNX Runtime para navegación autónoma, detección de obstáculos y reconocimiento de objetos.
- Análisis de imágenes médicas: uso como base para detección de anomalías en radiografías o tomografías, con adaptación mediante fine-tuning.
- Agricultura de precisión: detección de plagas o estados de madurez en cultivos a partir de imágenes de drones o cámaras fijas.
- Automatización de etiquetado de datos: el modelo puede usarse como pre-anotador en pipelines de anotación de imágenes, generando cajas candidatas que luego son revisadas por humanos.

## Benchmarks y rendimiento

El autor reporta un APCO de 54.3 en COCO para el modelo original DEIM-RT-DETRv2-L, aunque este valor no ha sido re-medido en la conversión ONNX. No se han publicado otros benchmarks específicos para esta conversión.

| Modelo | AP COCO | Parámetros | Backbone |
|---|---|---|---|
| DEIM-RT-DETRv2-L (reportado) | 54.3 | no disponible | ResNet50 |
| DEIMv2-S (reportado) | 50.9 | 9.71 M | ResNet18 |
| DEIMv2-X (reportado) | 57.8 | 50.3 M | ResNet101 |

Nota: los valores de DEIMv2 provienen de la web del proyecto y corresponden al modelo DEIMv2, no a esta conversión ONNX.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~169 MB en FP32, la inferencia requiere aproximadamente 1-2 GB de VRAM en GPU. En CPU, se puede ejecutar con unos 4-6 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) para inferencia en tiempo real. Para despliegues de alta concurrencia, se recomienda una RTX 3090 o A100.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en tarjetas como RTX 2060, RTX 3060, RTX 4060, etc., con FP32.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), OpenVINO, TensorRT, ONNX.js para navegador, y llama.cpp para CPU.
- Latencia estimada: en una RTX 3060, la inferencia puede rondar entre 10-30 ms por imagen; en CPU, entre 100-300 ms, dependiendo del número de hilos.

## Comparativa con modelos similares

| Modelo | APCO | Parámetros | Formato | Licencia |
|---|---|---|---|---|
| DEIM-RT-DETRv2-L (este) | 54.3 | no disponible | ONNX | Apache-2.0 |
| YOLOv8-L | 52.9 | 43.7 M | PyTorch/ONNX | AGPL-3.0 |
| RT-DETR-L (original) | 53.0 | 32 M | PyTorch | Apache-2.0 |
| DINO-L | 51.3 | 47 M | PyTorch | Apache-2.0 |

Nota: los valores de AP de los modelos comparativos son aproximados y provienen de los benchmarks públicos de cada modelo. La comparación es orientativa, ya que los modelos no se han evaluado en las mismas condiciones.

## Limitaciones y advertencias

- La conversión es no oficial y no ha sido validada por el autor del modelo original; puede haber diferencias de precisión respecto al modelo original.
- No incluye NMS ni post-procesado: el usuario debe implementar el decodificado de las predicciones, lo que añade complejidad al pipeline.
- El modelo solo funciona con imágenes de 640×640 y entrada estática; no soporta tamaños dinámicos.
- No se han medido los sesgos del modelo en este repositorio; es probable que herede los sesgos del dataset COCO (distribución de objetos, contextos, etc.).
- Riesgo de alucinación: en visión, puede producir falsos positivos en escenarios poco representados en el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo original tiene su propia licencia en el repositorio upstream; se recomienda revisar la licencia del proyecto DEIM original.
- No hay soporte de cuantización pre-entrenada: el modelo se distribuye solo en FP32, por lo que la cuantización debe realizarse manualmente si se necesita.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AnnotateIt/deim-rtdetrv2-l-coco-onnx
- Repositorio DEIM original: https://github.com/Intellindust-AI-Lab/DEIM
- Repositorio DEIMv2: https://github.com/Intellindust-AI-Lab/DEIMv2
- Página del proyecto DEIMv2: https://intellindust-ai-lab.github.io/projects/DEIMv2/
- Paper DEIMv2 en arXiv: https://arxiv.org/abs/2509.20787
- Documentación de arquitectura DEIM-RT-DETRv2: https://deepwiki.com/ShihuaHuang95/DEIM/2.2-deim-rt-detrv2-architecture
