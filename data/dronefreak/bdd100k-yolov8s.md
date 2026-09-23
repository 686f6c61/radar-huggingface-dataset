# dronefreak/bdd100k-yolov8s

## Resumen

El modelo `dronefreak/bdd100k-yolov8s` es un detector de objetos YOLOv8s afinado sobre el conjunto de datos BDD100K, orientado a escenas de conduccion (trafico urbano y de carretera). Lo publica el autor `dronefreak` como parte de DetectionBench, un marco de trabajo cuyo objetivo es comparar detectores modernos bajo recetas de entrenamiento y metricas de evaluacion identicas. No es un modelo de lenguaje: es un detector visual de 11,2 M de parametros y 28,6 GFLOPs a 640 px, con licencia AGPL-3.0.

Su relevancia es doble. Por un lado, ofrece un punto de referencia reproducible sobre BDD100K, un benchmark exigente con condiciones de iluminacion, clima y densidad de trafico muy variadas. Por otro, la model card publica no solo las metricas globales sino tambien el desglose por clase y la comparativa completa con otros detectores entrenados con la misma receta (YOLOv10s, RF-DETR Nano, YOLOv8n, YOLOv9t, YOLOv11n y YOLOv26n), lo que permite evaluar el equilibrio precision/recall de cada arquitectura sin depender de numeros autoinformados con protocolos distintos.

En el conjunto de prueba de BDD100K alcanza 57,93 % de mAP@50 y 33,25 % de mAP@50-95, con una precision de 75,38 % y un recall de 51,63 % (F1 de 61,29). Estas cifras lo situan como la mejor variante de la familia en mAP@50 dentro del zoo de modelos publicado por el propio proyecto, con un rendimiento especialmente alto en las clases `car`, `traffic sign` y `person`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (detector de una etapa, familia Ultralytics YOLO) |
| Parametros totales | 11,2 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen, por defecto 640 px) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones especificas) |
| Idiomas soportados | no aplica / no disponible (detector visual; las etiquetas de clase estan en ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (repositorio de la libreria `ultralytics`; no se confirma el formato en la informacion proporcionada) |
| Tarea | object-detection (deteccion de objetos) |
| Modelo base | Ultralytics/YOLOv8 (fine-tune) |
| Dataset de entrenamiento y evaluacion | BDD100K (particion de test para las metricas) |
| FLOPs | 28,6 GFLOPs a 640 px |
| Clases | 10: person, rider, car, truck, bus, train, motor, bike, traffic light, traffic sign |

## Arquitectura y entrenamiento

La arquitectura es YOLOv8s, un detector de objetos de una sola etapa basado en red convolucional con cuello de botella tipo CSP y cabecera de deteccion anclada libre (anchor-free), distribuido a traves de la libreria Ultralytics. El checkpoint parte de los pesos preentrenados `Ultralytics/YOLOv8` y se afina sobre BDD100K. Segun la model card, el entrenamiento y la evaluacion se realizaron dentro del marco DetectionBench, que impone "recetas de entrenamiento identicas y metricas de evaluacion identicas" a todos los detectores comparados, con el fin de que las diferencias de rendimiento reflejen la arquitectura y no el presupuesto de ajuste.

No se especifican en la informacion disponible el numero de imagenes de entrenamiento, el numero de epocas, el optimizador, la resolucion nativa de entrenamiento ni si se aplicaron tecnicas de aumento de datos o de destilacion. Tampoco se documenta el uso de RLHF, DPO ni tecnicas equivalentes, algo que no aplica a un detector de objetos. La innovacion metodologica destacable no esta en el modelo en si, sino en el protocolo: la evaluacion se realiza con el pipeline estandar de DetectionBench (`detectionbench-evaluate`) sobre la particion de test de BDD100K, y el proyecto publica ademas curvas precision-recall, curva F1, matriz de confusion y matriz de confusion normalizada.

## Capacidades

- Deteccion de objetos en imagenes RGB de escenas de conduccion, con cajas delimitadoras y puntuaciones de confianza para 10 clases: person, rider, car, truck, bus, train, motor, bike, traffic light y traffic sign.
- Deteccion multiobjeto simultanea en una sola pasada (una etapa), apta para inferencia en tiempo real sobre video.
- Reconocimiento de semaforos y senales de trafico como clases independientes, con mAP@50 de 69,54 % y 73,59 % respectivamente.
- Rendimiento elevado en vehiculos: `car` alcanza 82,76 % de mAP@50 y 51,63 % de mAP@50-95; `bus` y `truck` superan el 65 % de mAP@50.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica; las etiquetas de salida estan en ingles.
- Capacidades especiales: no dispone de modo de razonamiento, vision-lenguaje, audio ni generacion de texto. Su salida es exclusivamente geometrica (cajas y clases).
- Exportacion a otros formatos de inferencia: el autor no lo documenta en la ficha; no disponible.

## Casos de uso

- Ayuda a la conduccion (ADAS): el modelo puede detectar vehiculos, peatones, ciclistas y senales en cada fotograma de la camara frontal para alimentar sistemas de aviso de colision, alerta de angulo muerto o reconocimiento de senales de velocidad. Su coste de 28,6 GFLOPs a 640 px permite ejecutarlo en el bucle de percepcion sin agotar el presupuesto de computo del vehiculo.
- Analisis de video de trafico urbano: sobre grabaciones de camaras fijas o de dron, permite contar vehiculos por carril, estimar densidad de trafico y clasificar la composicion del flujo (turismos, autobuses, camiones, motos, bicicletas) en estudios de movilidad.
- Autoetiquetado para pipelines de anotacion: dado su mAP@50 de 57,93 % y su precision del 75,38 %, puede generar preanotaciones sobre nuevos videos de conduccion que despues se revisan y corrigen manualmente, reduciendo el coste de construir datasets propios.
- Inventario y auditoria de infraestructura vial: la deteccion dedicada de `traffic sign` (73,59 % mAP@50) y `traffic light` (69,54 % mAP@50) permite recorrer rutas con camara y localizar senales y semaforos para tareas de mantenimiento o cartografiado.
- Seguridad en flotas y analisis post-incidente: procesar a posteriori el video de una flota para reconstruir la presencia y posicion de peatones y vehiculos en los segundos previos a un evento, gracias a que el modelo entrega cajas con confianza por fotograma.
- Deteccion embarcada en plataformas aereas no tripuladas: el tamano reducido del checkpoint (del orden de decenas de MB) y las 10 clases de trafico lo hacen utilizable en drones de vigilancia vial. Advertencia: el modelo se entreno con imagenes a nivel de calzada, por lo que la perspectiva aerea implica un cambio de dominio no evaluado en la ficha.
- Referencia de comparacion academica: al publicarse junto al zoo completo de DetectionBench sobre la misma particion de test, sirve como linea base reproducible para investigaciones que propongan nuevos detectores o nuevas recetas de entrenamiento sobre BDD100K.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la particion de **test** de BDD100K. Ninguno de los valores esta verificado de forma independiente (`verified: false` en el model-index).

| Metrica | Valor |
|---|---|
| mAP@50 | 57,93 % |
| mAP@50-95 | 33,25 % |
| Precision | 75,38 % |
| Recall | 51,63 % |
| F1 | 61,29 % |
| Parametros | 11,2 M |
| FLOPs | 28,6 B (a 640 px) |

Rendimiento por clase declarado en la model card:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| person | 68,66 | 35,81 |
| rider | 49,98 | 25,82 |
| car | 82,76 | 51,63 |
| truck | 67,84 | 49,79 |
| bus | 65,96 | 51,43 |
| train | 0,21 | 0,13 |
| motor | 49,06 | 23,65 |
| bike | 51,68 | 26,90 |
| traffic light | 69,54 | 27,44 |
| traffic sign | 73,59 | 39,89 |

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia calculada a partir de los 11,2 M de parametros, los pesos ocupan del orden de 45 MB en FP32 y 22 MB en FP16, por lo que el cuello de botella es la memoria de las activaciones (28,6 GFLOPs a 640 px, batch 1), no el checkpoint.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU de consumo reciente es suficiente; una RTX 4090 o similar permitiria margen amplio para lotes grandes o varias secuencias de video simultaneas. Las GPU de centro de datos (A100, H100) solo tendrian sentido para procesamiento masivo por lotes.
- Cabe en GPU de consumo: si. El modelo es una variante "small" de YOLOv8 con 11,2 M de parametros, muy por debajo de los modelos de vision de gran tamano. No se documenta el rendimiento en CPU ni en aceleradores tipo Jetson.
- Opciones de despliegue: el repositorio declara la libreria `ultralytics`, por lo que el uso previsto es a traves de ese framework. En la informacion disponible no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un detector de objetos. Tampoco se confirman exportaciones a ONNX, TensorRT u OpenVINO.
- Latencia y throughput: no disponibles. No se publican mediciones sobre hardware concreto ni FPS.

## Comparativa con modelos similares

Comparativa con los modelos entrenados y evaluados bajo el mismo pipeline en BDD100K segun el zoo publicado por el autor. Los parametros, la licencia y la disponibilidad de los modelos alternativos no se detallan en la informacion proporcionada.

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLOv8s (este modelo) | 57,93 | 33,25 | 75,38 | 51,63 |
| YOLOv10s | 57,64 | 33,34 | 75,02 | 52,12 |
| RF-DETR Nano | 56,90 | 31,58 | 80,68 | 64,78 |
| YOLOv26n | 52,25 | 29,23 | 72,56 | 46,87 |
| YOLOv9t | 52,04 | 29,46 | 71,34 | 46,72 |
| YOLOv10n | 51,95 | 29,31 | 71,58 | 46,62 |
| YOLOv8n | 51,67 | 29,09 | 70,95 | 46,59 |
| YOLOv11n | 51,63 | 29,06 | 71,68 | 46,34 |

Lectura de la tabla: YOLOv8s es el mejor en mAP@50 por un margen estrecho sobre YOLOv10s (+0,29 puntos) y algo mas amplio sobre RF-DETR Nano (+1,03). En mAP@50-95, la metrica mas estricta, YOLOv10s lo supera ligeramente (33,34 frente a 33,25). RF-DETR Nano obtiene la mejor precision (80,68 %) y el mejor recall (64,78 %) de toda la tabla, lo que indica un comportamiento mas conservador en falsos positivos a costa de un mAP global inferior. Frente a las variantes "nano", la mejora en mAP@50 es de aproximadamente 5,7-6,3 puntos, coherente con el mayor tamano del modelo. No se dispone de datos de parametros, contexto, licencia ni disponibilidad de los modelos alternativos dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Clase `train` practicamente no aprendida: 0,21 % de mAP@50 y 0,13 % de mAP@50-95. Cualquier sistema que dependa de detectar trenes debe considerarse no funcional. Es previsible un comportamiento similar en clases poco representadas del dataset.
- Recall moderado (51,63 %): con una precision del 75,38 %, el modelo es conservador y tiende a omitir objetos reales antes que a generar falsos positivos. En aplicaciones de seguridad (deteccion de peatones) esto debe compensarse bajando el umbral de confianza, con el coste correspondiente en falsos positivos.
- Dataset con licencia restrictiva: BDD100K se distribuye bajo su propia licencia, limitada a investigacion y educacion no comercial, con registro obligatorio y prohibicion de redistribucion. No esta replicado en Hugging Face. Esto condiciona la reproducibilidad del entrenamiento y la evaluacion, aunque no la del checkpoint publicado.
- Licencia del modelo AGPL-3.0: es una licencia copyleft fuerte. El uso comercial en productos o servicios en red exige analizar con cuidado las obligaciones de liberacion de codigo derivado. No hay una licencia permisiva alternativa indicada en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto), pero si existe el equivalente en forma de detecciones falsas o cajas mal localizadas, especialmente en clases con baja frecuencia y en condiciones de oclusion.
- Sesgos de dominio: el modelo esta entrenado exclusivamente con escenas de conduccion de BDD100K (principalmente Estados Unidos). El rendimiento en otras geografias, senalizacion, tipos de vehiculo o condiciones meteorologicas no evaluadas puede degradarse y no esta medido. La aplicacion a imagenes aereas o de dron es un cambio de dominio no validado.
- Limitacion de idioma: no aplica, pero conviene recordar que las etiquetas de clase son terminos en ingles y el mapeo a otros idiomas debe hacerse en la capa de aplicacion.
- Metricas no verificadas: todos los valores del model-index aparecen con `verified: false`, es decir, son autodeclarados por el autor. No se ha confirmado su reproduccion por terceros.
- Contexto de entrada limitado al formato de imagen del framework Ultralytics; no se documentan resoluciones alternativas ni su efecto sobre la precision.
- Repositorio sin traccion: 0 descargas y 0 "likes" en el momento de la consulta, creado el 23 de septiembre de 2026. Esto implica ausencia de validacion comunitaria y de informes de fallos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-yolov8s
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Conjunto de datos BDD100K: https://www.bdd100k.com/
- Referencias arXiv declaradas en las etiquetas del repositorio:
  - https://arxiv.org/abs/2511.09554
  - https://arxiv.org/abs/2304.07193
  - https://arxiv.org/abs/2405.14458
  - https://arxiv.org/abs/2410.17725
  - https://arxiv.org/abs/2606.03748
  - https://arxiv.org/abs/2402.13616
- Repositorio del modelo base: https://huggingface.co/Ultralytics/YOLOv8
