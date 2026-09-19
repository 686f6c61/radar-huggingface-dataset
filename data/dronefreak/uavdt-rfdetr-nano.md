# dronefreak/uavdt-rfdetr-nano

## Resumen

uavdt-rfdetr-nano es un detector de objetos de la familia RF-DETR (variante Nano) ajustado por el usuario dronefreak sobre el conjunto de datos UAVDT, un benchmark de imagenes aereas captadas por drones para deteccion de vehiculos. El modelo parte del checkpoint Roboflow/rf-detr-nano y se distribuye como un fine-tuning especializado en tres clases: coche, camion y autobus. Su proposito es servir como referencia reproducible dentro de DetectionBench, un marco que entrena y evalua detectores modernos con recetas de entrenamiento y metricas identicas para permitir comparaciones honestas entre arquitecturas.

El modelo tiene 30,5 millones de parametros y esta pensado para inferencia ligera, lo que lo situa en el segmento de deteccion en el borde (edge) sobre imagenes aereas de alta resolucion con objetos pequenos. La relevancia actual viene de que RF-DETR es una alternativa basada en transformer a la familia YOLO, y este checkpoint permite comprobar como rinde esa arquitectura frente a YOLOv8 y YOLOv26 bajo un protocolo de evaluacion comun sobre UAVDT.

Los resultados publicados por el autor son modestos en terminos absolutos (mAP@50 de 12,96 % y mAP@50-95 de 7,33 % en el split de test), lo que refleja tanto la dificultad del dataset como el hecho de que se trata de un ajuste sobre la variante mas pequena de la familia. El modelo se publica con licencia Apache 2.0 y un tamano de repositorio de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (detector de objetos basado en transformer, familia DETR); variante Nano |
| Parametros totales | 30,5 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision; la entrada es una imagen, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (checkpoint de PyTorch cargado mediante la libreria rfdetr) |

Otros datos declarados: tarea principal object-detection, libreria rfdetr, tamano del repositorio 0,1 GB, FLOPs no publicados por el autor del modelo base. Clases detectadas: car, truck, bus.

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tuning) del checkpoint Roboflow/rf-detr-nano, que pertenece a la familia RF-DETR, una linea de detectores derivada de la arquitectura DETR y basada en transformer. La variante Nano es la mas pequena de la familia y cuenta con 30,5 M de parametros. La model card no detalla la composicion exacta del backbone, el numero de tokens de entrenamiento ni la configuracion de la cabeza de deteccion mas alla de la referencia al modelo base, por lo que esos extremos se consideran no disponibles.

El entrenamiento se realizo sobre el conjunto UAVDT, con anotaciones de tres clases (car, truck, bus), dentro del marco DetectionBench. Este marco aplica recetas de entrenamiento y pipelines de evaluacion identicos a todos los detectores comparados, de modo que las diferencias de rendimiento reflejen la arquitectura y no el proceso de ajuste. La evaluacion se llevo a cabo sobre el split de test de UAVDT con la herramienta `detectionbench-evaluate`. No consta en la informacion proporcionada el uso de RLHF, DPO ni tecnicas de refinamiento posteriores, algo que por otra parte no aplica a un detector de objetos. La model card cita varias referencias arXiv (entre ellas el articulo de DINOv2) y menciona que las visualizaciones de evaluacion se generaron con la libreria Supervision de Roboflow, que no produce curvas PR, curvas F1 ni matrices de confusion.

## Capacidades

- Deteccion de objetos en imagenes aereas captadas por drones, con salida de cajas delimitadoras por instancia.
- Reconocimiento de tres clases de vehiculos: coche (car), camion (truck) y autobus (bus).
- Deteccion de objetos pequenos en escenas aereas de alta resolucion, escenario para el que esta etiquetado el modelo (small-object-detection).
- Inferencia sobre imagenes individuales y, segun el banner de demostracion del repositorio, sobre clips de video del conjunto de test de UAVDT.
- Integracion con el ecosistema Supervision para el calculo de metricas de deteccion (mAP, precision, recall).
- Carga y ejecucion mediante la libreria rfdetr y huggingface_hub, con un flujo de instalacion documentado (`pip install rfdetr huggingface_hub`).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision generativa, tool calling, function calling, capacidades de agente ni soporte multilingue: es exclusivamente un modelo de deteccion de objetos.

## Casos de uso

- Vigilancia de trafico mediante drones: el modelo detecta coches, camiones y autobuses en fotogramas aereos, lo que permite monitorizar flujo vehicular en vias urbanas o interurbanas sin necesidad de infraestructura fija de camaras.
- Analisis de aforo y ocupacion de infraestructuras: a partir de las cajas detectadas se puede estimar el numero de vehiculos por carril o por zona en imagenes captadas a distintas alturas, util para planificacion de capacidad.
- Investigacion academica en deteccion aerea: al formar parte de DetectionBench, sirve como referencia reproducible frente a otros detectores evaluados exactamente con la misma receta sobre UAVDT, lo que facilita estudios comparativos publicables.
- Punto de partida para fine-tuning propio: con 30,5 M de parametros y licencia Apache 2.0, es un candidato razonable para reentrenar sobre datasets aereos propios con clases distintas, partiendo de pesos ya adaptados al dominio de dron.
- Procesamiento en el borde sobre la propia aeronave: el tamano reducido del modelo y su naturaleza Nano permiten plantear inferencia a bordo en plataformas con recursos limitados, reduciendo la dependencia de enlace de comunicaciones.
- Integracion en pipelines de analisis con Supervision: las detecciones se pueden consumir directamente en el ecosistema de Roboflow/Supervision para anotacion, trazado de trayectorias o generacion de informes de conteo.
- Prototipado rapido de sistemas de alerta: combinado con reglas de negocio, el modelo puede disparar avisos cuando el numero de vehiculos detectados en una zona supera un umbral, si bien su precision limitada exige validacion previa en el dominio concreto de despliegue.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el split de test de UAVDT (metricas no verificadas, `verified: false`):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 12,96 |
| mAP@50-95 | 7,33 |
| Precision | 37,12 |
| Recall | 55,4 |
| F1 | 44,45 |
| Parametros | 30,5 M |
| FLOPs | no publicados por el autor del modelo base |

Rendimiento por clase sobre el mismo split:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 29,59 | 16,14 |
| truck | 2,44 | 1,40 |
| bus | 6,85 | 4,46 |

Zoo de modelos evaluados sobre UAVDT dentro de DetectionBench, segun la model card del autor:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Medium | 15,02 | 8,76 | 40,28 | 61,14 |
| RF-DETR Small | 14,89 | 8,92 | 38,83 | 61,65 |
| YOLOv26s | 14,09 | 7,91 | 23,88 | 27,05 |
| RF-DETR Nano (este modelo) | 12,96 | 7,33 | 37,12 | 55,40 |
| YOLOv26m | 12,32 | 6,66 | 19,44 | 25,83 |
| YOLOv8m | 12,28 | 7,05 | 19,73 | 25,33 |
| YOLOv11x | 11,98 | 6,68 | 18,70 | 25,93 |
| YOLOv8s | 11,48 | 6,71 | 19,34 | 23,39 |
| YOLOv8n | 10,79 | 6,42 | 18,61 | 24,58 |

No se han publicado resultados de otros benchmarks (COCO, PASCAL VOC, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia orientativa y no confirmada, con 30,5 M de parametros los pesos ocupan aproximadamente 122 MB en FP32 y 61 MB en FP16, por lo que el consumo dominante sera el de las activaciones de la imagen de entrada a alta resolucion y no el de los pesos.
- GPU recomendadas: no especificadas en la informacion disponible. Por el perfil del modelo (variante Nano de un detector transformer), esta disenado para ejecutarse en GPU de gama media y en hardware de borde; una GPU de consumo reciente deberia ser suficiente para inferencia en tiempo real, aunque no hay mediciones publicadas que lo confirmen.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido numero de parametros; no se confirma ningun modelo concreto en la documentacion proporcionada.
- Opciones de despliegue: la via documentada es la libreria `rfdetr` junto con `huggingface_hub` en Python. No se mencionan exportaciones a ONNX, TensorRT, CoreML, TFLite ni integraciones con vLLM, llama.cpp, Ollama o TGI (estos ultimos no aplican a un detector de vision).
- Latencia y throughput: no disponibles. La model card solo incluye un banner de demostracion con detecciones sobre dos clips de test de UAVDT, sin cifras de FPS ni de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 (UAVDT) | mAP@50-95 (UAVDT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RF-DETR Nano (este modelo) | 30,5 M | 12,96 | 7,33 | Apache 2.0 | HuggingFace |
| RF-DETR Small | no disponible | 14,89 | 8,92 | no disponible | HuggingFace (Roboflow) |
| RF-DETR Medium | no disponible | 15,02 | 8,76 | no disponible | HuggingFace (Roboflow) |
| YOLOv26s | no disponible | 14,09 | 7,91 | no disponible | no disponible |
| YOLOv26m | no disponible | 12,32 | 6,66 | no disponible | no disponible |
| YOLOv8m | no disponible | 12,28 | 7,05 | no disponible | Ultralytics |
| YOLOv8n | no disponible | 10,79 | 6,42 | no disponible | Ultralytics |

Observaciones: dentro del zoo comparado, este checkpoint es el cuarto mejor en mAP@50 y solo supera a las variantes YOLOv26m, YOLOv8m, YOLOv11x, YOLOv8s y YOLOv8n. Destaca que su precision (37,12) y su recall (55,4) son muy superiores a los de los modelos YOLO de la tabla, lo que sugiere un comportamiento mas equilibrado en la relacion entre falsos positivos y falsos negativos, a costa de un mAP inferior al de YOLOv26s. Las cifras de parametros, licencia y disponibilidad de los modelos de comparacion no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: un mAP@50 de 12,96 % y un mAP@50-95 de 7,33 % sobre UAVDT indican deteccion poco fiable en terminos generales; no es adecuado para produccion sin un ajuste adicional y una validacion exhaustiva en el dominio objetivo.
- Desequilibrio severo entre clases: la clase car alcanza 29,59 % de mAP@50, mientras que truck se queda en 2,44 % y bus en 6,85 %. La deteccion de camiones es practicamente inutilizable con estos pesos.
- Metrica no verificada: los resultados del model-index estan marcados como `verified: false`, es decir, son declaraciones del autor no auditadas de forma independiente.
- Dominio muy restringido: entrenado exclusivamente sobre UAVDT (imagenes aereas de vehiculos); no se espera un buen comportamiento en imagenes terrestres, otras categorias de objetos ni otras condiciones de captura.
- Sesgos de dataset: UAVDT procede de escenarios concretos de trafico con drones; condiciones de iluminacion, climatologia, altitud y geografia no representadas en el conjunto pueden degradar el rendimiento de forma significativa.
- Riesgo de falsos negativos y positivos: con una precision del 37,12 % y un recall del 55,4 %, el modelo omite aproximadamente la mitad de los objetos reales y una fraccion importante de sus detecciones son incorrectas.
- Sin informacion sobre cuantizacion ni exportacion: no se documentan pesos cuantizados ni formatos alternativos, lo que limita el despliegue en hardware sin soporte PyTorch.
- Sin capacidades de lenguaje, razonamiento ni agentes: no puede integrarse en flujos que requieran generacion de texto o tool calling.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar igualmente las condiciones del modelo base (Roboflow/rf-detr-nano) y del dataset UAVDT antes de un despliegue comercial.
- Validacion obligatoria antes de produccion: cualquier uso en vigilancia o trafico deberia ir acompanado de una evaluacion propia sobre el dominio real de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/uavdt-rfdetr-nano
- Dataset UAVDT (usado en el entrenamiento): https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Roboflow/rf-detr-nano
- Libreria Supervision (evaluacion y metricas de deteccion): https://github.com/roboflow/supervision
- Referencias arXiv citadas en la model card: arXiv:1804.00518, arXiv:2511.09554, arXiv:2304.07193, arXiv:2410.17725, arXiv:2606.03748
- Demostracion en video incluida en el repositorio: https://huggingface.co/dronefreak/uavdt-rfdetr-nano/resolve/main/assets/demo_banner.mp4
