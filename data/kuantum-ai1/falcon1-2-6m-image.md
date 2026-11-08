# Kuantum-ai1/Falcon1-2.6M-Image

## Resumen

Falcon1-2.6M-Image es un detector de objetos ligero con 2,6 millones de parámetros, desarrollado por Kuantum-ai1 y publicado bajo licencia Apache 2.0. Se trata de un fine-tuning de YOLO11n sobre el conjunto de datos Pascal VOC, en el que se congeló la backbone preentrenada en COCO y solo se entrenaron el cuello (neck) y la cabeza (head) durante 30 épocas. El resultado es un modelo de 5,5 MB que alcanza un 85,4 % de mAP50 y un 65,4 % de mAP50-95 en la validación de VOC, superando al YOLO11n entrenado de forma completa sobre el mismo conjunto.

El modelo está pensado para escenarios de borde (edge) y despliegue en dispositivos con recursos limitados, donde el coste computacional y el tamaño del binario son críticos. Con 6,5 GFLOPs y un tiempo de inferencia de 2,3 ms en una GPU T4 a 640 píxeles, es adecuado para tareas de detección por fotograma en tiempo real. La estrategia de congelar la backbone permite conservar las características aprendidas en COCO y adaptar únicamente las capas específicas a las 20 clases de VOC, reduciendo el sobreajuste en un conjunto de datos relativamente pequeño.

La relevancia actual del modelo radica en su relación rendimiento/tamaño: ofrece una precisión superior a alternativas más pesadas como MobileNet + SSD y compite directamente con variantes de YOLO de tamaño nano, manteniendo un formato de pesos compatible con el ecosistema Ultralytics y exportable a ONNX para su uso con `onnxruntime` u `opencv.dnn`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (CNN de deteccion de objetos en una etapa) |
| Parametros totales | 2,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | FP32 (exportacion ONNX); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch/Ultralytics), `.onnx` (exportable) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura YOLO11n, una red neuronal convolucional de detección de objetos en una sola etapa, con una backbone, un cuello (neck) para la agregación de características multiescala y una cabeza (head) de predicción. El entrenamiento parte de los pesos de YOLO11n preentrenados en COCO y aplica un fine-tuning sobre Pascal VOC 2007 + 2012 (trainval). La innovación principal es la congelación de las 10 primeras capas (backbone), de modo que solo se actualizan el cuello y la cabeza.

Los hiperparámetros documentados son: 30 épocas, tamaño de lote 32, resolución de imagen 640, tasa de aprendizaje 0,01, precisión mixta automática (AMP) activada y entrenamiento sobre una única GPU T4 con un tiempo total de 2,05 horas. Se emplearon aumentos de datos con mosaic, mixup desactivado en las últimas 10 épocas y randaugment. No se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa, al no tratarse de un modelo generativo.

## Capacidades

- Detección de objetos en imágenes para 20 clases de Pascal VOC: aeroplane, bicycle, bird, boat, bottle, bus, car, cat, chair, cow, diningtable, dog, horse, motorbike, person, pottedplant, sheep, sofa, train y tvmonitor.
- Detección multiobjeto con hasta 300 detecciones por imagen.
- Inferencia sobre imágenes individuales y vídeo fotograma a fotograma (detección por frame, sin seguimiento entre frames).
- Exportación a ONNX para ejecución en CPU y dispositivos de borde sin PyTorch, con `onnxruntime` u `opencv.dnn`.
- Validación integrada mediante la API de Ultralytics (`model.val`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente de visión.

## Casos de uso

- Vigilancia y conteo de personas en tiempo real: con 2,3 ms por fotograma en T4 y la clase `person` con un 91,4 % de mAP50, el modelo puede procesar flujos de vídeo y contar personas en escenas de interior o exterior con hardware modesto.
- Sistemas de control de aforo en transporte: las clases `bus`, `car`, `motorbike` y `train` superan el 88 % de mAP50, lo que permite monitorizar la ocupación de vehículos o detectar vehículos en carriles específicos en aplicaciones de tráfico.
- Automatización industrial con objetos cotidianos: la detección de `bottle` (74,9 % mAP50) y `diningtable` (76,5 %) permite integrar el modelo en líneas de inspección o inventario de productos en entornos controlados con iluminación estable.
- Aplicaciones de asistencia a personas con discapacidad visual: la detección de `chair`, `sofa`, `diningtable` y `person` con latencias de 1,1 ms a 320 píxeles facilita la generación de avisos en tiempo real sobre dispositivos de bajo consumo.
- Análisis de imágenes aéreas o de satélite de baja resolución: la clase `aeroplane` (94,0 % mAP50) y `boat` (78,2 %) permiten tareas de conteo y localización en imágenes de drones o cámaras de vigilancia.
- Despliegue en dispositivos de borde sin GPU: el archivo ONNX de unos 10 MB en FP32 puede ejecutarse en CPU con `onnxruntime` u `opencv.dnn`, lo que habilita la detección en Raspberry Pi, cámaras inteligentes o sistemas embebidos.
- Prototipado rápido en investigación: la API de Ultralytics permite validar y ajustar el modelo con pocas líneas de código, lo que lo hace útil para experimentos académicos que requieran un detector ligero de referencia sobre VOC.

## Benchmarks y rendimiento

Resultados sobre el conjunto de validación de Pascal VOC 2007 (4952 imágenes, 12032 instancias, 20 clases, tamaño de imagen 640):

| Metrica | Valor |
|---|---|
| mAP50 | 85,4 % |
| mAP50-95 | 65,4 % |
| mAP75 | 68,9 % |
| Precision | 83,1 % |
| Recall | 77,4 % |
| F1 | 80,1 % |
| Fitness (0,1·mAP50 + 0,9·mAP50-95) | 67,4 % |
| Parametros | 2,6 M |
| GFLOPs | 6,5 |
| Inferencia (T4, 640 px) | 2,3 ms |
| Inferencia (T4, 320 px) | 1,1 ms |
| Tamano del modelo | 5,5 MB |

Resultados por clase (mAP50 / mAP50-95):

| Clase | mAP50 | mAP50-95 |
|---|---|---|
| aeroplane | 94,0 % | 71,2 % |
| bicycle | 88,5 % | 66,4 % |
| bird | 84,1 % | 58,9 % |
| boat | 78,2 % | 50,1 % |
| bottle | 74,9 % | 53,9 % |
| bus | 90,9 % | 74,5 % |
| car | 93,6 % | 72,8 % |
| cat | 90,8 % | 70,2 % |
| chair | 68,8 % | 48,1 % |
| cow | 86,4 % | 64,3 % |
| diningtable | 76,5 % | 57,8 % |
| dog | 89,5 % | 67,6 % |
| horse | 93,5 % | 71,9 % |
| motorbike | 90,2 % | 66,7 % |
| person | 91,4 % | 66,1 % |
| pottedplant | 62,9 % | 36,8 % |
| sheep | 85,7 % | 62,4 % |
| sofa | 80,3 % | 60,9 % |
| train | 91,8 % | 68,4 % |
| tvmonitor | 84,6 % | 61,5 % |

## Comparativa con modelos similares

Todos los modelos evaluados sobre la validación de Pascal VOC, tamaño de imagen 640, mismo protocolo cuando está disponible:

| Modelo | Parametros | mAP50 | mAP50-95 | Tamano | Velocidad (T4) |
|---|---|---|---|---|---|
| Falcon1-2.6M (este modelo) | 2,6 M | 85,4 % | 65,4 % | 5,5 MB | 2,3 ms |
| YOLO11n (entrenamiento completo) | 2,6 M | 83,5 % | 62,5 % | 5,5 MB | 2,3 ms |
| YOLOv10n | 2,3 M | 81,8 % | 60,5 % | 5,8 MB | 2,1 ms |
| YOLOv8n | 3,2 M | 82,1 % | 61,2 % | 6,5 MB | 2,8 ms |
| YOLOv5n | 2,5 M | 79,2 % | 58,5 % | 5,3 MB | 2,5 ms |
| MobileNet + SSD | 6,8 M | 73,8 % | 49,2 % | 27 MB | 4,5 ms |
| YOLO11n (COCO preentrenado, sin fine-tuning en VOC) | 2,6 M | 35,0 % | 22,0 % | 5,5 MB | 2,3 ms |

## Limitaciones y advertencias

- Objetos pequeños y en escenas con solapamiento (bottle, pottedplant, chair) presentan una precisión notablemente inferior: pottedplant alcanza solo un 36,8 % de mAP50-95 y chair un 48,1 %.
- Confusiones documentadas en condiciones de baja iluminación o posturas inusuales; por ejemplo, un gato negro tumbado de lado en poca luz puede confundirse con un perro.
- El modelo solo conoce las 20 clases de Pascal VOC; no detecta clases de COCO fuera de ese conjunto.
- No está entrenado para seguimiento de vídeo (tracking), solo para detección por fotograma individual.
- No se documentan sesgos demográficos ni étnicos específicos, pero al entrenarse sobre VOC (un conjunto con sesgos de composición y anotación propios) puede heredar desequilibrios en la representación de escenas y objetos.
- Riesgo de falsos positivos y negativos en dominios visuales alejados de VOC (imágenes médicas, satelitales de alta resolución, visión nocturna), donde no se ha evaluado.
- La licencia Apache 2.0 permite uso comercial y personal, e incluye una concesión explícita de patentes; no obstante, el modelo base YOLO11n de Ultralytics está sujeto a su propia licencia AGPL-3.0, lo que puede imponer obligaciones adicionales en determinados despliegues comerciales.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y el tamaño del repo figura como 0,0 GB, por lo que la disponibilidad y el soporte de la comunidad son mínimos.
- No se dispone de información sobre cuantizaciones INT8/FP16 ni sobre latencias en hardware de borde distinto de la T4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kuantum-ai1/Falcon1-2.6M-Image
- Modelo base YOLO11n: https://huggingface.co/ultralytics/yolo11n
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- Documentación de Ultralytics: https://docs.ultralytics.com
- Conjunto de datos Pascal VOC: http://host.robots.ox.ac.uk/pascal/VOC/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
