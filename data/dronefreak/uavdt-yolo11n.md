# dronefreak/uavdt-yolo11n

## Resumen

uavdt-yolo11n es un detector de objetos YOLOv11n afinado por el usuario dronefreak sobre el conjunto de datos UAVDT (Unmanned Aerial Vehicle Benchmark: Object Detection and Tracking), un benchmark de imagenes aereas captadas por drones en entornos de trafico urbano. El modelo parte del checkpoint Ultralytics/YOLO11 en su variante nano y se entrena y evalua dentro de DetectionBench, un framework creado por el mismo autor para comparar detectores modernos bajo una receta de entrenamiento y unas metricas de evaluacion identicas.

Se trata de un modelo muy pequeno: 2,6 millones de parametros y 6,6 GFLOPs con entrada de 640 px, lo que lo situa en la gama de deteccion en tiempo real sobre hardware de borde. Detecta tres clases: coche, camion y autobus. Su relevancia actual es doble: por un lado, ofrece un punto de referencia reproducible para deteccion de vehiculos en imagenes aereas; por otro, forma parte de un zoo de modelos (YOLOv8, YOLOv9, YOLOv10, YOLOv11, YOLOv26 y RF-DETR) evaluados sobre el mismo dataset, lo que permite comparaciones homogeneas.

Las metricas declaradas por el autor en el split de test de UAVDT son modestas en terminos absolutos: 28,56 % de mAP@50, 16,30 % de mAP@50-95, 38,04 % de precision, 32,26 % de recall y 34,91 % de F1. El rendimiento esta muy concentrado en la clase coche (72,03 % de mAP@50), mientras que camion y autobus quedan por debajo del 8 %, un desequilibrio de clases que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos YOLOv11 en variante nano (CNN, una sola etapa, framework Ultralytics) |
| Parametros totales | 2,6 M |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen fija, 640 px en la evaluacion declarada) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no aplica (modelo de vision; no se declaran idiomas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch mediante Ultralytics (`best.pt`) |
| Tarea | object-detection |
| Clases | car, truck, bus |
| FLOPs | 6,6 GFLOPs a 640 px |
| Dataset de entrenamiento | dronefreak/UAVDT |
| Modelo base | Ultralytics/YOLO11 (YOLOv11n) |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es YOLOv11 en su escala nano, un detector de una sola etapa que predice cajas y clases directamente sobre caracteristicas multi-escala. No es un transformer ni un modelo MoE ni un SSM: es una red convolucional optimizada para latencia baja y un numero de parametros minimo (2,6 M), coherente con despliegue en dispositivos con recursos limitados. La entrada de referencia de la evaluacion es de 640 px, con un coste de 6,6 GFLOPs por imagen.

El entrenamiento consiste en un ajuste fino (finetune) del checkpoint Ultralytics/YOLO11 sobre el dataset UAVDT, que contiene imagenes aereas de trafico con anotaciones de coche, camion y autobus. No se documentan en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, la resolucion nativa de las imagenes, ni si se aplicaron tecnicas de alineamiento como RLHF o DPO (no aplicables a un detector). La innovacion declarada no esta en la arquitectura, sino en la metodologia: el modelo se enmarca en DetectionBench, que fija una receta de entrenamiento comun y evalua todos los modelos con el mismo pipeline (`detectionbench-evaluate`) sobre el split de test, con el objetivo de hacer comparaciones reproducibles entre familias de detectores.

## Capacidades

- Deteccion de objetos en imagenes aereas o captadas por dron, con cajas delimitadoras y puntuaciones de confianza.
- Deteccion de tres clases de vehiculos: coche (car), camion (truck) y autobus (bus).
- Deteccion de objetos pequenos en escenas con perspectiva cenital o picada, el regimen tipico de la imagen aerea.
- Inferencia en tiempo real gracias a su tamano reducido (2,6 M de parametros, 6,6 GFLOPs a 640 px).
- Carga directa mediante la libreria Ultralytics (`YOLO(weights)`) y descarga desde Hugging Face con `hf_hub_download`.
- Capacidad de fine-tuning posterior: al ser un checkpoint Ultralytics, puede reentrenarse sobre nuevos datasets de deteccion.
- No dispone de tool calling, function calling, razonamiento multi-paso, generacion de texto ni capacidades de agente: es exclusivamente un modelo de vision para deteccion.
- No se declaran capacidades multimodales adicionales (segmentacion, pose, clasificacion) ni modo de razonamiento.

## Casos de uso

- Vigilancia de trafico aereo con drones: el modelo puede procesar fotogramas captados por un UAV para localizar y contar vehiculos en vias urbanas, aprovechando su coste computacional bajo para operar en tiempo real sobre la transmision de video.
- Monitorizacion de carreteras y autopistas: integrado en un pipeline de video, permite estimar densidad de trafico y detectar retenciones a partir de la posicion y el numero de cajas detectadas por fotograma.
- Analisis de aforo en aparcamientos o recintos: deteccion de coches como clase dominante del modelo (72,03 % de mAP@50), adecuada para contabilizar ocupacion en imagenes cenitales.
- Investigacion academica en deteccion aerea: sirve como punto de comparacion reproducible frente a otros detectores del zoo de UAVDT publicados por DetectionBench, con metricas calculadas bajo el mismo protocolo.
- Despliegue en hardware de borde embarcado: con 2,6 M de parametros, es viable ejecutarlo en plataformas con GPU integrada o aceleradores de bajo consumo (Jetson, iGPU, NPU) sin necesidad de servidores dedicados.
- Evaluacion de pipelines de deteccion de objetos pequenos: util para medir como se comporta una receta de entrenamiento concreta frente a variaciones de arquitectura en un dataset aereo exigente.
- Prototipado rapido de sistemas de vision para ciudades inteligentes: al cargarse con tres lineas de Python mediante Ultralytics, permite montar demos funcionales de conteo de vehiculos en pocas horas.
- Generacion de datos anotados preliminares (pre-labeling): las detecciones pueden usarse como propuesta inicial que un anotador humano revise, reduciendo el coste de etiquetado en proyectos de trafico.

## Benchmarks y rendimiento

Metricas declaradas por el autor sobre el split de test de UAVDT. El campo `verified` de la model-index es `false` en todas ellas, es decir, no han sido verificadas de forma independiente.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 28,56 |
| mAP@50-95 | 16,30 |
| Precision | 38,04 |
| Recall | 32,26 |
| F1 | 34,91 |

Rendimiento por clase sobre UAVDT, declarado por el autor:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 72,03 | 39,23 |
| truck | 5,89 | 3,86 |
| bus | 7,78 | 5,81 |

## Requisitos de hardware

- VRAM estimada para inferencia: el peso del modelo es minimo. Calculo estimado a partir de los 2,6 M de parametros: aproximadamente 10,4 MB en FP32, 5,2 MB en FP16 y 2,6 MB en INT8, a lo que hay que sumar memoria para activaciones de la imagen de entrada. En la practica, la huella total se mantiene por debajo de 1 GB en cualquier precision habitual.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no requiere A100, H100 ni tarjetas de gama alta. Ejemplos razonables: RTX 3060, RTX 4060, RTX 4090 (ampliamente sobredimensionadas para 2,6 M de parametros), T4 o L4 en servidor.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU. Tambien es candidato a aceleradores de borde tipo Jetson Nano u Orin.
- Opciones de despliegue: inferencia con la libreria Ultralytics en Python (`from ultralytics import YOLO`) o su CLI, sobre el checkpoint `best.pt` alojado en Hugging Face. No se documentan en la model card otros formatos de exportacion ni integraciones especificas.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia estructural, los 6,6 GFLOPs a 640 px situan el modelo en el rango de tiempo real sobre GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

El autor publica un zoo de modelos evaluados sobre UAVDT con el mismo protocolo. Todos los valores estan declarados por el autor y no verificados de forma independiente.

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Nano | 32,78 | 20,31 | 73,60 | 66,98 |
| YOLOv9s | 31,82 | 18,71 | 39,83 | 38,12 |
| YOLOv9t | 29,42 | 17,03 | 35,75 | 36,47 |
| YOLOv26n | 28,88 | 16,79 | 33,14 | 35,66 |
| YOLOv11n (este modelo) | 28,56 | 16,30 | 38,04 | 32,26 |
| YOLOv8n | 27,80 | 15,34 | 35,42 | 33,61 |
| YOLOv10n | 27,17 | 15,16 | 33,30 | 31,21 |
| YOLOv8s | 27,12 | 15,33 | 34,65 | 31,87 |

Datos comparativos adicionales sobre el resto de la comparativa (parametros, contexto, licencia de cada alternativa): no disponibles en la informacion proporcionada, salvo la licencia AGPL-3.0 de este modelo y el hecho de que todos los YOLO de la tabla pertenecen al ecosistema Ultralytics.

## Limitaciones y advertencias

- Desequilibrio de clases severo: el rendimiento se concentra en la clase coche (72,03 % de mAP@50) mientras que camion (5,89 %) y autobus (7,78 %) son practicamente inoperables con este checkpoint. En un escenario real de conteo de vehiculos, subestimaria sistematicamente la presencia de camiones y autobuses.
- Precision baja en terminos absolutos: 38,04 % de precision y 32,26 % de recall implican un numero elevado de falsos positivos y falsos negativos con los umbrales por defecto. Requiere ajuste de umbral y validacion sobre el dominio objetivo.
- Metricas no verificadas: los resultados de la model-index estan marcados como `verified: false`. No hay validacion externa ni replicacion independiente publicada.
- Sesgo de dominio: entrenado sobre UAVDT, un dataset de imagenes aereas de trafico urbano. Es esperable una degradacion notable en imagenes terrestres, con otras condiciones de iluminacion, sensores o geografias, o en clases no contempladas.
- Solo tres clases: no detecta peatones, motocicletas, bicicletas ni senalizacion, lo que limita su uso en analisis de trafico completo.
- Sin informacion sobre el dataset de entrenamiento: no se documentan el numero de imagenes, la resolucion nativa, el balance de clases ni si se aplicaron tecnicas de aumento de datos, lo que dificulta diagnosticar las causas del bajo rendimiento en camion y autobus.
- Riesgo de alucinacion en el sentido de detecciones espurias: como cualquier detector con precision baja, puede generar cajas sobre regiones sin objeto. No aplica el concepto de alucinacion textual porque el modelo no genera lenguaje.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero activa obligaciones de liberacion del codigo fuente de la obra derivada y, en el caso de ofrecer el modelo como servicio en red, de facilitar el codigo a los usuarios del servicio. Conviene revisar la compatibilidad con el producto antes de integrarlo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, con un tamano de repositorio de 0,0 GB. No hay comunidad que haya validado el checkpoint ni issues publicos que documenten su comportamiento real.
- Fechas de creacion y actualizacion del repositorio (2026-09-20) posteriores a la fecha de referencia habitual de este tipo de fichas; conviene verificar la vigencia del artefacto antes de usarlo.
- Sin datos de cuantizacion ni de exportacion a otros formatos, por lo que no esta garantizado el comportamiento del modelo fuera del entorno Ultralytics en PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/uavdt-yolo11n
- Dataset UAVDT (dronefreak): https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench (codigo de entrenamiento y evaluacion): https://github.com/dronefreak/DetectionBench
- Modelo base YOLO11 de Ultralytics: https://huggingface.co/Ultralytics/YOLO11
- Visualizaciones de evaluacion incluidas en el repositorio del modelo: BoxPR_curve.png (curva precision-recall), BoxF1_curve.png (curva F1), confusion_matrix.png, confusion_matrix_normalized.png
- Demo en video del modelo sobre dos clips de test de UAVDT: assets/demo_banner.mp4 y assets/demo_banner_poster.jpg en el repositorio del modelo
- Identificadores arXiv declarados en los tags del repositorio (no se dispone de sus titulos ni contenido en la informacion proporcionada): https://arxiv.org/abs/1804.00518, https://arxiv.org/abs/2410.17725, https://arxiv.org/abs/2511.09554, https://arxiv.org/abs/2304.07193, https://arxiv.org/abs/2405.14458, https://arxiv.org/abs/2606.03748, https://arxiv.org/abs/2402.13616
- Los resultados de la busqueda web realizada no contienen informacion relacionada con este modelo; no se han incorporado como fuentes.
