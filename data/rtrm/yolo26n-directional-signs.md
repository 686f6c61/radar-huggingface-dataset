# rtrm/yolo26n-directional-signs

## Resumen

YOLO26n-directional-signs es un modelo de deteccion de objetos basado en YOLO26n, la variante nano de la familia YOLO26 de Ultralytics, ajustado para detectar senales direccionales francesas (ensamblajes de senales de destino) y senales de rotonda en imagenes captadas a nivel de calle. Fue desarrollado por el usuario rtrm y publicado en HuggingFace bajo licencia AGPL-3.0.

El modelo distingue dos clases: "directionnel" (senales direccionales) y "giratoire" (senales de rotonda). Se entrenó con una aumentacion de escala agresiva (scale=0.9) para mantener robustez en resoluciones de inferencia entre 640 y 1280 pixeles. Su relevancia radica en la deteccion especifica de senalizacion vial francesa, un caso de uso habitual en sistemas de asistencia a la conduccion, mantenimiento de infraestructuras y mapeo urbano.

La arquitectura YOLO26 introduce inferencia end-to-end nativa sin NMS, una cabeza de deteccion mas ligera y un recetario de entrenamiento actualizado, lo que permite despliegue eficiente en tiempo real. El ajuste fino se realizo sobre un dataset reducido de 110 imagenes de entrenamiento y 24 de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics YOLO26, variante nano) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (deteccion de objetos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (deteccion de objetos) |
| Licencia | AGPL-3.0 |
| Formato de pesos | .pt (PyTorch / Ultralytics) |

## Arquitectura y entrenamiento

YOLO26 es una familia de modelos de vision en tiempo real de Ultralytics que introduce inferencia end-to-end nativa (sin NMS), una cabeza de deteccion mas ligera y un recetario de entrenamiento actualizado. Segun la documentacion oficial, la familia YOLO26 alcanza entre 40.9 y 57.5 mAP en COCO a traves de sus cinco escalas de deteccion, siendo YOLO26n la variante mas ligera. El modelo base es yolo26n.pt de Ultralytics 8.4.117.

El ajuste fino se realizo sobre el dataset pierrelortie/directionan_sign_detection, con 110 imagenes de entrenamiento y 24 de validacion. Se corrigio una etiqueta con clase invalida (clase 2) asignandola a la clase 0. El entrenamiento utilizo imgsz=1024, aumentacion de escala agresiva (scale=0.9) y early stopping con paciencia de 50 epocas. No se menciona el uso de tecnicas de alineacion como RLHF o DPO, que no son aplicables en deteccion de objetos. El historial del repositorio incluye una version v1 (imgsz=960, aumentaciones por defecto, mAP50-95 0.824) superada por la version v2 actual.

## Capacidades

- Deteccion de senales direccionales francesas (clase "directionnel") en imagenes a nivel de calle.
- Deteccion de senales de rotonda (clase "giratoire").
- Inferencia robusta en un rango de resoluciones de 640 a 1280 pixeles, con mAP50-95 medio de 0.846 en ese rango.
- Inferencia end-to-end sin NMS gracias a la arquitectura YOLO26, con recomendacion de deduplicacion de cajas duplicadas (misma clase, IoU>0.7) por la ocasional emision de cajas casi duplicadas.
- Integracion con el ecosistema Ultralytics: exportacion a TensorRT, ONNX, CoreML y TFLite.
- Carga directa desde HuggingFace mediante hf_hub_download y prediccion con la API de Ultralytics.

## Casos de uso

- Sistemas de asistencia a la conduccion (ADAS): el modelo puede integrarse en pipelines de vision de vehiculos para detectar senales direccionales y de rotonda en tiempo real, alertando al conductor sobre proximas intersecciones o cambios de direccion obligatorios. Su robustez entre 640 y 1280 pixeles permite adaptarse a distintas resoluciones de camara.
- Inventario de infraestructura vial: las administraciones publicas pueden procesar flotas de imagenes de vehiculos de reconocimiento para catalogar la ubicacion y el estado de la senalizacion direccional francesa, reduciendo el trabajo manual de inspeccion.
- Mantenimiento de carreteras: deteccion automatica de senales ausentes, danadas u obstruidas mediante analisis periodico de imagenes de reconocimiento vial, priorizando las intervenciones de reparacion.
- Mapeo y navegacion: enriquecimiento de mapas digitales con la ubicacion de senales direccionales y de rotonda, mejorando las instrucciones de navegacion en zonas urbanas e interurbanas francesas.
- Vehiculos autonomos: el modelo puede integrarse en el modulo de percepcion de vehiculos autonomos para comprender la senalizacion vial francesa especifica, complementando otros detectores de senales de trafico genericos.
- Analisis de imagenes urbanas: procesamiento de imagenes de camaras de trafico para estudios de movilidad y seguridad vial, permitiendo cuantificar la presencia de senalizacion direccional en distintas areas.

## Benchmarks y rendimiento

Los resultados de validacion se obtuvieron sobre 24 imagenes con 42 cajas. En resolucion nativa (1024), el modelo alcanza precision 0.962, recall 0.925, mAP50 0.976 y mAP50-95 0.906.

| Resolucion (imgsz) | mAP50 | mAP50-95 |
|---|---|---|
| 640 | 0.923 | 0.787 |
| 960 | 0.978 | 0.839 |
| 1024 | 0.976 | 0.906 |
| 1280 | 0.979 | 0.854 |

La media de mAP50-95 entre resoluciones es 0.846. No se dispone de comparativas con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- YOLO26n es la variante nano de la familia YOLO26, disenada para despliegue eficiente en tiempo real, por lo que es adecuada para GPUs de consumo y dispositivos de borde.
- No se especifican requisitos exactos de VRAM en la informacion disponible. Al ser un modelo nano, se espera que quepa en GPUs de consumo como la serie RTX de NVIDIA, aunque no se dispone de cifras concretas.
- El modelo se puede desplegar con el ecosistema Ultralytics (Python) y exportarse a TensorRT, ONNX, CoreML y TFLite para inferencia en distintos backends.
- No se dispone de datos de latencia o throughput en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre otros fine-tunings especificos de YOLO para senales de trafico francesas en la informacion proporcionada. Como referencia de la familia base, YOLO26 abarca cinco escalas de deteccion con un rango de 40.9 a 57.5 mAP en COCO, siendo YOLO26n la variante mas ligera y, por tanto, la de menor coste computacional. No se dispone de datos de parametros ni de rendimiento de otras variantes (YOLO26s, m, l, x) en la informacion disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (110 imagenes de entrenamiento y 24 de validacion), lo que puede limitar la generalizacion a condiciones de iluminacion, clima o angulos de camara no representados en el conjunto.
- El modelo detecta unicamente dos clases de senales (directionnel y giratoire) y esta especializado en senalizacion francesa; no es adecuado para otros tipos de senales, paises o estilos de senalizacion.
- Los metadatos de HuggingFace incluyen la etiqueta "region:us", que contrasta con el enfoque del modelo en senales francesas; se debe verificar la procedencia geografica real de las imagenes de entrenamiento antes de desplegarlo en produccion.
- La arquitectura YOLO26 sin NMS puede emitir cajas duplicadas ocasionales; se recomienda aplicar deduplicacion por clase con IoU>0.7 en el postprocesado.
- Licencia AGPL-3.0: cualquier uso comercial o integracion en servicios debe cumplir con los terminos de la liciencia, incluyendo la divulgacion del codigo fuente si se ofrece como servicio en red.
- No se dispone de informacion sobre sesgos especificos del modelo ni sobre su comportamiento con imagenes fuera del dominio de carreteras francesas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rtrm/yolo26n-directional-signs
- Dataset de entrenamiento: https://huggingface.co/datasets/pierrelortie/directionan_sign_detection
- Documentacion de Ultralytics YOLO26: https://docs.ultralytics.com/models/yolo26
- Modelo YOLO26 en HuggingFace: https://huggingface.co/Ultralytics/YOLO26
- Repositorio YOLO26 en GitHub: https://github.com/ultralytics/yolo26
