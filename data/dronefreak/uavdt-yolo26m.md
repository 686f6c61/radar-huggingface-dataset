# dronefreak/uavdt-yolo26m

## Resumen

`dronefreak/uavdt-yolo26m` es un detector de objetos de una sola etapa perteneciente a la familia YOLO, desarrollado por el usuario de Hugging Face dronefreak como parte de DetectionBench, un marco de trabajo para comparar detectores modernos bajo recetas de entrenamiento y metricas de evaluacion identicas. El modelo parte del checkpoint base Ultralytics/YOLO26 (variante m) y se ha ajustado de forma supervisada sobre el conjunto de datos UAVDT, un benchmark de imagenes aereas captadas por dron orientado a la deteccion de vehiculos en escenarios de trafico. Cuenta con 21,9 millones de parametros y 75,4 GFLOPs, y predice tres clases: coche, camion y autobus.

El problema que aborda es la deteccion de objetos pequenos en imagenes aereas con perspectiva nadir u oblicua, donde los vehiculos ocupan pocos pixeles y la variabilidad de altitud, iluminacion y angulo es alta. La relevancia actual del modelo no reside en su rendimiento absoluto, que es bajo (mAP@50 de 12,32 % en el split de test de UAVDT), sino en su papel como referencia reproducible dentro de DetectionBench: permite comparar arquitecturas dispares (RF-DETR, YOLOv8, YOLOv11, YOLOv26) bajo el mismo protocolo de evaluacion y las mismas metricas.

El repositorio se publico el 18 de septiembre de 2026, ocupa 0,0 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha. Los pesos se distribuyen como `best.pt` en formato PyTorch y la licencia es AGPL-3.0, lo que condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO (familia Ultralytics YOLO26, variante m); detalles internos de bloques no disponibles |
| Parametros totales | 21,9 M |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica `best.pt` en PyTorch (FP32). No se documentan variantes INT8, FP16 ni GGUF |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, archivo `best.pt`); tamano del repositorio 0,0 GB |
| Tarea | object-detection (deteccion de objetos) |
| Modelo base | Ultralytics/YOLO26 (finetune) |
| Framework / libreria | Ultralytics |
| FLOPs | 75,4 B |
| Clases | car, truck, bus |
| Dataset de entrenamiento | dronefreak/UAVDT |
| Entrada / resolucion | no disponible en la model card |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un detector convolucional de una sola etapa de la familia YOLO, en concreto la variante `m` (medium) de Ultralytics YOLO26, con 21,9 M de parametros y 75,4 GFLOPs. La model card no documenta el detalle de la arquitectura interna (diseño del backbone, del cuello de agregacion de caracteristicas, mecanismo de asignacion de etiquetas, si la inferencia es extremo a extremo sin supresion de no maximos, ni el espacio de entrada nativo). Tampoco se especifican innovaciones tecnicas adicionales mas alla de la propia arquitectura base.

El entrenamiento consiste en un ajuste fino supervisado del checkpoint Ultralytics/YOLO26 sobre el conjunto UAVDT, que anota tres clases de vehiculos (coche, camion, autobus) en secuencias aereas de trafico. No se indica en la informacion disponible el numero de epochs, el optimizador, el regimen de aumento de datos, el tamano del lote, la resolucion de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO (no aplicables en deteccion de objetos). La evaluacion se realiza sobre el split de test de UAVDT con el pipeline estandar de DetectionBench (`detectionbench-evaluate`), lo que garantiza que las metricas publicadas son comparables con las del resto de modelos del zoo de UAVDT.

## Capacidades

- Deteccion de objetos en imagenes aereas: localiza y clasifica coche, camion y autobus en fotogramas captados por dron.
- Salida de cajas delimitadoras con puntuacion de confianza por clase, apta para postprocesado de conteo y seguimiento.
- Deteccion de objetos pequenos: el modelo se publica bajo la etiqueta `small-object-detection`, orientada a vehiculos de baja extension en pixel.
- Inferencia sobre imagen individual y sobre flujo de video (la model card incluye una demo con dos clips de test de UAVDT).
- Integracion con el ecosistema Ultralytics: carga mediante `YOLO(weights)` y `hf_hub_download`, con acceso a las utilidades de entrenamiento, validacion y prediccion de la libreria.
- Compatibilidad con el pipeline de evaluacion DetectionBench para reproducir las metricas declaradas.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling, agentes ni audio.
- No se documenta soporte multilingue ni procesamiento de lenguaje natural de ningun tipo.

## Casos de uso

- Baseline reproducible para investigacion en deteccion aerea: sirve como punto de comparacion dentro de DetectionBench, ya que sus metricas se han calculado con el mismo protocolo que las de RF-DETR y otras variantes de YOLO sobre UAVDT.
- Conteo de vehiculos en carretera a partir de video de dron: el modelo puede procesar fotogramas de UAVDT y agregar detecciones de la clase coche, que es la unica con rendimiento apreciable (mAP@50 de 30,27 %), para estimar densidad de trafico en tramos concretos.
- Analisis de flujo y ocupacion en estudios de movilidad: combinado con un rastreador externo, las cajas detectadas permiten estimar direccion y velocidad relativa de vehiculos en secuencias aereas.
- Prototipado rapido de sistemas de vigilancia de trafico: la carga en una sola linea con Ultralytics facilita montar demos funcionales antes de invertir en entrenamiento propio.
- Punto de partida para ajuste fino sobre dominios propios: al ser un finetune de YOLO26m, puede reentrenarse con datos de otra camara, altitud o region geografica partiendo de estos pesos.
- Despliegue en borde sobre hardware con GPU integrada para pruebas de concepto en dron, dado el reducido numero de parametros (21,9 M) y su naturaleza convolucional.
- Auditoria y replicacion de resultados: el enlace al repositorio DetectionBench permite reproducir el entrenamiento y verificar las cifras declaradas, que no estan marcadas como verificadas (`verified: false`).

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de UAVDT (no verificados de forma independiente):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 12,32 |
| mAP@50-95 | 6,66 |
| Precision | 19,44 |
| Recall | 25,83 |
| F1 | 22,18 |

Rendimiento por clase en UAVDT:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 30,27 | 15,43 |
| truck | 3,35 | 2,17 |
| bus | 3,33 | 2,38 |

Comparativa con otros modelos evaluados en el mismo protocolo (zoo de UAVDT de DetectionBench):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Medium | 15,02 | 8,76 | 40,28 | 61,14 |
| RF-DETR Small | 14,89 | 8,92 | 38,83 | 61,65 |
| YOLOv26s | 14,09 | 7,91 | 23,88 | 27,05 |
| RF-DETR Nano | 12,96 | 7,33 | 37,12 | 55,40 |
| YOLOv26m (este modelo) | 12,32 | 6,66 | 19,44 | 25,83 |
| YOLOv8m | 12,28 | 7,05 | 19,73 | 25,33 |
| YOLOv11x | 11,98 | 6,68 | 18,70 | 25,93 |
| YOLOv8s | 11,48 | 6,71 | 19,34 | 23,39 |
| YOLOv8n | 10,79 | 6,42 | 18,61 | 24,58 |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia de orden de magnitud, los pesos en FP32 ocupan aproximadamente 88 MB y en FP16 alrededor de 44 MB; con activaciones de inferencia a resoluciones tipicas de deteccion el consumo total suele situarse por debajo de 2 GB en lote 1, aunque esta cifra es una estimacion no confirmada por el autor.
- GPU recomendadas: no disponibles. Dado el perfil (21,9 M de parametros, 75,4 GFLOPs), el modelo es compatible con el rango de GPU de consumo general, pero no hay mediciones publicadas.
- GPU de consumo: previsiblemente cabe en tarjetas consumer con 4 GB o mas de VRAM, y en plataformas integradas tipo Jetson, aunque no se aportan pruebas ni cifras.
- Opciones de despliegue: la via documentada es Ultralytics (`pip install ultralytics huggingface_hub`, descarga de `best.pt` con `hf_hub_download` y carga con `YOLO(weights)`). No se documentan despliegues con vLLM (no aplica a vision), llama.cpp ni TGI. La exportacion a otros formatos propios de Ultralytics no se menciona en la model card.
- Latencia y throughput: no disponibles. No se han publicado mediciones de FPS ni de latencia por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 en UAVDT | mAP@50-95 en UAVDT | Precision | Recall | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| dronefreak/uavdt-yolo26m | 21,9 M | 12,32 | 6,66 | 19,44 | 25,83 | AGPL-3.0 | Hugging Face (0 descargas) |
| YOLOv26s (mismo zoo) | no disponible | 14,09 | 7,91 | 23,88 | 27,05 | no disponible en esta ficha | no disponible |
| RF-DETR Small | no disponible | 14,89 | 8,92 | 38,83 | 61,65 | no disponible en esta ficha | no disponible |
| RF-DETR Medium | no disponible | 15,02 | 8,76 | 40,28 | 61,14 | no disponible en esta ficha | no disponible |
| YOLOv8m | no disponible | 12,28 | 7,05 | 19,73 | 25,33 | no disponible en esta ficha | no disponible |
| YOLOv11x | no disponible | 11,98 | 6,68 | 18,70 | 25,93 | no disponible en esta ficha | no disponible |

Conclusion de la comparativa: dentro del zoo de UAVDT, este checkpoint queda por debajo de YOLOv26s, RF-DETR Small y RF-DETR Medium en mAP@50, y solo supera ligeramente a YOLOv8m, YOLOv11x, YOLOv8s y YOLOv8n. La diferencia mas acusada frente a la familia RF-DETR esta en precision y recall, donde RF-DETR duplica aproximadamente los valores de este modelo.

## Limitaciones y advertencias

- Rendimiento global bajo: un mAP@50 de 12,32 % y un mAP@50-95 de 6,66 % sobre UAVDT son insuficientes para un sistema de produccion con requisitos de fiabilidad.
- Clases desequilibradas en la practica: la clase coche alcanza 30,27 % de mAP@50, mientras que camion (3,35 %) y autobus (3,33 %) son practicamente inutilizables, lo que refleja un fuerte sesgo hacia la clase mayoritaria del dataset.
- Precision baja (19,44 %) y recall bajo (25,83 %): se esperan tanto falsos positivos como falsos negativos en abundancia, con F1 de 22,18 %.
- Metricas no verificadas: la model card marca todos los valores como `verified: false`; proceden del propio autor a traves de DetectionBench.
- Dominio estrecho: el modelo esta ajustado exclusivamente a imagenes aereas de trafico de UAVDT (vehiculos vistos desde dron). No se ha validado en otros dominios, sensores, altitudes ni condiciones meteorologicas.
- Riesgo de degradacion fuera de distribucion: al tratarse de un finetune especifico, el comportamiento en escenas no aereas o en clases distintas de vehiculos no esta caracterizado.
- Idiomas: no aplica, es un modelo puramente visual; no procesa texto ni instrucciones en lenguaje natural.
- Licencia AGPL-3.0: el uso comercial en servicios en red exige liberar el codigo fuente completo bajo la misma licencia, lo que limita su integracion en productos propietarios. La licencia del modelo base Ultralytics/YOLO26 tambien debe revisarse por separado.
- Ausencia de cuantizaciones publicadas: no hay pesos GGUF, ONNX, TensorRT ni INT8 en el repositorio, lo que obliga a exportar el modelo por cuenta propia si se necesita optimizacion.
- Trazabilidad limitada: sin descargas ni likes, y sin informacion sobre el proceso de entrenamiento (epochs, hiperparametros, aumentos), la reproducibilidad depende exclusivamente del repositorio DetectionBench.
- La busqueda web realizada no ha devuelto documentacion tecnica adicional sobre este checkpoint; los resultados obtenidos eran irrelevantes para el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/uavdt-yolo26m
- Dataset UAVDT en Hugging Face: https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Referencias arXiv etiquetadas en los metadatos del modelo (contenido no verificado en esta ficha): https://arxiv.org/abs/1804.00518, https://arxiv.org/abs/2606.03748, https://arxiv.org/abs/2511.09554, https://arxiv.org/abs/2304.07193, https://arxiv.org/abs/2410.17725
- Recursos visuales incluidos en el repositorio: `BoxPR_curve.png`, `BoxF1_curve.png`, `confusion_matrix.png`, `confusion_matrix_normalized.png`, `assets/demo_banner.mp4`
