# modelapi/rtdetr-50-fp16-ov-catalog

## Resumen

RT-DETR ResNet-50 es un modelo de detección de objetos en tiempo real basado en transformer, desarrollado originalmente por Baidu y adaptado por Roboflow en su repositorio `rf-detr`. Esta variante concreta, publicada por `modelapi`, es una compilación del proyecto Geti™ de Intel, convertida a formato OpenVINO™ IR con pesos en FP16. El modelo mapea una imagen de entrada a bounding boxes sin necesidad de anclas ni post-procesado NMS, lo que simplifica su integración en pipelines de visión artificial.

La relevancia de este modelo radica en su equilibrio entre precisión y velocidad, siendo adecuado para aplicaciones de robótica y visión en tiempo real. Al estar disponible en formato OpenVINO, puede ejecutarse eficientemente en CPUs, GPUs y NPUs de Intel, incluyendo el chipset Panther Lake (PTL) mencionado en las etiquetas. La arquitectura combina un backbone ResNet-50 con un transformer de detección, eliminando la dependencia de técnicas tradicionales como anchor boxes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de detección con backbone ResNet-50 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | FP16 (OpenVINO IR) |
| Idiomas soportados | No aplica (procesamiento de imágenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (FP16) |

## Arquitectura y entrenamiento

RT-DETR (Real-Time Detection Transformer) emplea una arquitectura transformer pura para detección de objetos, sin necesidad de anclas ni NMS. El backbone ResNet-50 extrae características de la imagen, que son procesadas por un encoder-decoder transformer para predecir directamente las bounding boxes y clases. Esta conversión específica se ha realizado desde el repositorio de Roboflow (`rf-detr`) al formato OpenVINO IR con pesos FP16, lo que permite su ejecución optimizada en hardware Intel.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de RLHF/DPO) en la documentación proporcionada. El modelo original fue entrenado en el dataset COCO, pero no se confirma este dato en la ficha. La compilación Geti™ sugiere que ha sido validada para su uso en entornos de edge computing y robótica.

## Capacidades

- Detección de objetos en imágenes: genera bounding boxes y etiquetas de clase para múltiples objetos en una sola pasada.
- Inferencia en tiempo real: diseñado para aplicaciones de baja latencia, sin post-procesado NMS.
- Compatibilidad con OpenVINO: puede ejecutarse en CPUs, GPUs, NPUs y dispositivos Intel (incluido chipset PTL).
- Integración sencilla mediante la librería `openvino-model-api`.
- Soporte para visualización de resultados con la clase `Visualizer` de la misma librería.
- No incluye capacidades de generación de texto, razonamiento, tool calling ni agentes; es exclusivamente un modelo de visión.

## Casos de uso

- Robótica industrial: detección de piezas y obstáculos en líneas de montaje, con inferencia en tiempo real sobre hardware Intel embebido.
- Vigilancia y seguridad: seguimiento de objetos o personas en vídeo, aprovechando la baja latencia para alertas inmediatas.
- Conteo de objetos en almacenes: inventario automatizado mediante cámaras fijas, con salida directa de bounding boxes.
- Control de calidad en manufactura: identificación de defectos en productos a través de la detección de anomalías visuales.
- Vehículos autónomos o AGVs: detección de peatones, señales u otros vehículos en entornos controlados, usando OpenVINO para aceleración en edge.
- Prototipado rápido de visión por computador: gracias a su formato OpenVINO y la API de modelo, se puede integrar en pocas líneas de código en Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Se recomienda consultar el repositorio original de Roboflow (`rf-detr`) para métricas de precisión (mAP) y velocidad (FPS) en COCO, aunque estos datos no están incluidos en la ficha actual.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo de ~42M parámetros (estimación general del RT-DETR-R50) y con pesos FP16, requiere aproximadamente 84 MB de memoria para los pesos. La memoria total dependerá de la resolución de entrada y el runtime.
- GPU recomendadas: cualquier GPU compatible con OpenVINO (Intel integrada, Arc, o NVIDIA vía plugin). También puede ejecutarse en CPU.
- Cabe en consumer GPU: sí, incluso en GPUs integradas de Intel.
- Opciones de despliegue: OpenVINO Runtime, `openvino-model-api`, conversión a otros formatos (ONNX, TensorRT) si se requiere.
- Latencia y throughput: no disponibles en la documentación; dependerán del hardware y la resolución de entrada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Formato | Licencia | Uso en tiempo real |
|---|---|---|---|---|---|
| RT-DETR ResNet-50 (este) | Transformer + ResNet-50 | ~42M (estimado) | OpenVINO IR FP16 | Apache-2.0 | Sí |
| YOLOv8 | CNN (CSPDarknet) | ~3-11M según variante | PyTorch, ONNX, TensorRT | AGPL-3.0 | Sí |
| DETR | Transformer + ResNet-50 | ~41M | PyTorch | Apache-2.0 | No (lento) |

RT-DETR ofrece mayor velocidad que DETR original y comparable a YOLOv8, pero con la ventaja de no requerir NMS. La licencia Apache-2.0 permite uso comercial sin restricciones, a diferencia de YOLOv8 (AGPL-3.0).

## Limitaciones y advertencias

- No se proporcionan detalles sobre sesgos o limitaciones del modelo en la documentación. Como modelo de detección entrenado probablemente en COCO, puede tener menor rendimiento en clases fuera de ese dataset.
- Riesgo de alucinación no aplica al ser un modelo discriminativo (detección), pero puede producir falsos positivos en entornos no representados en el entrenamiento.
- El formato OpenVINO IR puede requerir conversión adicional si se desea usar en otros runtimes (PyTorch, TensorFlow).
- No se indica si el modelo ha sido cuantizado a otros formatos (INT8), lo que podría afectar a despliegues en hardware con limitaciones de memoria.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos del repositorio original de Roboflow para posibles atribuciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/modelapi/rtdetr-50-fp16-ov-catalog
- Repositorio de pesos originales OpenVINO: https://huggingface.co/OpenVINO/rtdetr_50-fp16-ov
- Repositorio de código Roboflow: https://github.com/roboflow/rf-detr
- Proyecto Geti™: https://github.com/open-edge-platform/geti
