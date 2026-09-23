# dronefreak/bdd100k-yolov10s

## Resumen

bdd100k-yolov10s es un checkpoint de deteccion de objetos publicado por el usuario dronefreak en Hugging Face, consistente en un YOLOv10s afinado sobre el conjunto de datos BDD100K (Berkeley DeepDrive 100K), un benchmark de escenas de conduccion urbana y de autopista. El modelo parte del backbone Ultralytics/YOLOv10 y se ha entrenado y evaluado dentro de DetectionBench, un framework cuyo objetivo es reproducir recetas de entrenamiento y metricas de evaluacion identicas entre distintos detectores modernos, de forma que las comparaciones entre arquitecturas sean justas y trazables. Se trata, por tanto, de un modelo de vision por computador para deteccion de trafico (vehiculos, peatones, senalizacion), no de un modelo de lenguaje.

El modelo tiene 8,1 millones de parametros y 25,1 GFLOPs a una resolucion de entrada de 640 px, lo que lo situa en la gama de detectores ligeros orientados a inferencia en tiempo real sobre hardware modesto. Detecta diez clases: person, rider, car, truck, bus, train, motor, bike, traffic light y traffic sign. Segun los datos declarados por el autor (no verificados por Hugging Face), alcanza 57,64 % de mAP@50, 33,34 % de mAP@50-95, 75,02 % de precision y 52,12 % de recall sobre el split de test de BDD100K.

Su relevancia es doble. Por un lado, ofrece un punto de referencia publico y reproducible dentro de la familia YOLO para una tarea critica como es la percepcion en conduccion autonoma, con comparativas directas frente a YOLOv8s, YOLOv9t, YOLOv10n, YOLOv11n, YOLOv26n y RF-DETR Nano. Por otro, su licencia AGPL-3.0 y el hecho de que BDD100K no sea redistribuible condicionan fuertemente su uso en produccion, algo que conviene evaluar antes de integrarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv10s: detector one-stage convolucional con cabecera de deteccion sin NMS (base Ultralytics/YOLOv10) |
| Parametros totales | 8,1 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagenes a 640 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (el repositorio figura con 0,0 GB; la libreria declarada es ultralytics) |
| Tarea | object-detection |
| Dataset de entrenamiento y evaluacion | BDD100K |
| FLOPs | 25,1 G a 640 px |
| Numero de clases | 10 (person, rider, car, truck, bus, train, motor, bike, traffic light, traffic sign) |
| Framework / libreria | ultralytics |
| Modelo base | Ultralytics/YOLOv10 |
| Descargas en Hugging Face | 0 |
| Likes en Hugging Face | 0 |
| Fecha de creacion | 2026-09-23 |
| Fecha de ultima actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv10s, un detector de objetos de una sola etapa de la familia YOLO. Segun el paper de YOLOv10 (arXiv:2405.14458), esta generacion introduce un esquema de asignacion dual consistente que elimina la necesidad de supresion de no maximos (NMS) en la etapa de inferencia, reduciendo la latencia de postproceso. El checkpoint aqui descrito conserva la configuracion de la variante "s" (small) del modelo base, con 8,1 M de parametros y 25,1 GFLOPs a 640 px.

El modelo se ha afinado sobre BDD100K dentro del proyecto DetectionBench, cuyo proposito es emplear recetas de entrenamiento identicas (mismos hiperparametros, misma augmentation, mismo pipeline) para todos los detectores comparados, y evaluar con una unica herramienta (`detectionbench-evaluate`) sobre el split de test. La model card no detalla el numero de epochs, el optimizador, la composicion exacta del dataset ni el uso de tecnicas adicionales de ajuste, por lo que esos datos se consideran no disponibles. No aplica ninguna fase de RLHF, DPO o alineacion por preferencias humanas, al no ser un modelo generativo de lenguaje.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion, con cajas delimitadoras y clases para 10 categorias de trafico.
- Deteccion de vehiculos: coche, camion, autobus, motocicleta, bicicleta y tren.
- Deteccion de personas: peatones (person) y conductores o pasajeros de dos ruedas (rider).
- Deteccion de elementos de senalizacion: semaforos (traffic light) y senales de trafico (traffic sign).
- Inferencia en tiempo real sobre imagenes de 640 px, apta para flujos de video.
- Integracion con el ecosistema Ultralytics (entrenamiento, validacion, prediccion, exportacion a otros formatos).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, modo thinking, audio ni generacion de texto.

## Casos de uso

- Percepcion para conduccion autonoma o ADAS: el modelo identifica vehiculos, peatones y senalizacion en fotogramas de camara frontal a 640 px, con 8,1 M de parametros, lo que permite ejecutarlo embebido en la unidad de a bordo sin depender de GPUs de centro de datos.
- Analisis de video de trafico urbano: procesamiento de grabaciones de camaras municipales para contar flujos de vehiculos por clase (car, truck, bus, motor, bike) y estimar ocupacion de carriles.
- Auditoria de seguridad vial: extraccion de estadisticas de presencia de peatones y ciclistas en intersecciones concretas para informes de accesibilidad y riesgo.
- Etiquetado asistido (auto-labeling): uso del detector como preanotador sobre nuevas imagenes de dominio similar a BDD100K, con revision humana posterior, reduciendo el coste de construir datasets propios.
- Benchmarking interno de detectores: al proceder de DetectionBench, sirve como referencia comparable frente a YOLOv8s, YOLOv9t, YOLOv11n o RF-DETR Nano bajo una receta homogenea, util para decidir que arquitectura desplegar.
- Investigacion academica sobre dominio y robustez: permite estudiar el comportamiento del detector en condiciones nocturnas, con lluvia o con desenfoque, dado que BDD100K incluye variabilidad meteorologica y de iluminacion.
- Prototipado rapido en robotica o drones: por su tamano reducido, encaja en plataformas con Jetson o NPU integradas para navegacion basada en vision.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de BDD100K (no verificados por Hugging Face):

| Metrica | Valor |
|---|---|
| mAP@50 | 57,64 % |
| mAP@50-95 | 33,34 % |
| Precision | 75,02 % |
| Recall | 52,12 % |
| F1 | 61,51 % |
| Parametros | 8,1 M |
| FLOPs | 25,1 B (a 640 px) |

Comparativa publicada por el propio autor en el "BDD100K Model Zoo" de DetectionBench (mismos datos de evaluacion):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLOv8s | 57,93 | 33,25 | 75,38 | 51,63 |
| YOLOv10s (este modelo) | 57,64 | 33,34 | 75,02 | 52,12 |
| RF-DETR Nano | 56,90 | 31,58 | 80,68 | 64,78 |
| YOLOv26n | 52,25 | 29,23 | 72,56 | 46,87 |
| YOLOv9t | 52,04 | 29,46 | 71,34 | 46,72 |
| YOLOv10n | 51,95 | 29,31 | 71,58 | 46,62 |
| YOLOv8n | 51,67 | 29,09 | 70,95 | 46,59 |
| YOLOv11n | 51,63 | 29,06 | 71,68 | 46,34 |

Rendimiento por clase declarado por el autor:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| person | 68,54 | 35,76 |
| rider | 50,32 | 26,53 |
| car | 82,49 | 51,66 |
| truck | 67,45 | 49,63 |
| bus | 66,24 | 51,65 |
| train | 0,00 | 0,00 |
| motor | 47,39 | 24,12 |
| bike | 51,03 | 26,61 |
| traffic light | 69,46 | 27,47 |
| traffic sign | 73,45 | 40,02 |

No se han publicado en la informacion disponible resultados de latencia, throughput ni consumo energetico para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,1 M de parametros, los pesos en FP32 ocupan aproximadamente 32 MB y en FP16 unos 16 MB; sumando activaciones a 640 px, el consumo tipico se situa por debajo de 1-2 GB, aunque no se dispone de mediciones publicadas para este checkpoint (cifra orientativa de categoria, no dato verificado).
- VRAM estimada para entrenamiento o fine-tuning: la model card no publica la configuracion de entrenamiento, por lo que el batch size y el consumo reales no estan disponibles; en la practica, un YOLOv10s a 640 px se entrena comodamente en GPUs de 8-12 GB con batch sizes moderados.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060, 4060, 4070, 4080, 4090) es suficiente; en entornos de servidor, A100, H100, L4 o T4 permiten maximizar el throughput por nodo.
- Compatibilidad con GPU consumer: si, cabe holgadamente; incluso es viable la inferencia sobre CPU en escenarios de baja frecuencia de fotogramas, y sobre dispositivos embebidos tipo NVIDIA Jetson.
- Opciones de despliegue: API Python de Ultralytics, exportacion a ONNX, TensorRT, OpenVINO, TFLite, CoreML, NCNN y TF SavedModel; ejecucion en ONNX Runtime, TensorRT, Triton Inference Server o NVIDIA DeepStream.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 (BDD100K) | mAP@50-95 (BDD100K) | Formato / libreria | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YOLOv10s (este modelo) | 8,1 M | 57,64 | 33,34 | ultralytics | AGPL-3.0 | Hugging Face (dronefreak/bdd100k-yolov10s) |
| YOLOv8s | no disponible en la ficha comparada | 57,93 | 33,25 | ultralytics | AGPL-3.0 | Ultralytics / pesos publicos |
| YOLOv9t | no disponible en la ficha comparada | 52,04 | 29,46 | ultralytics | GPL-3.0 (proyecto original) | repositorio oficial de YOLOv9 |
| YOLOv11n | no disponible en la ficha comparada | 51,63 | 29,06 | ultralytics | AGPL-3.0 | Ultralytics |
| RF-DETR Nano | no disponible en la ficha comparada | 56,90 | 31,58 | Roboflow / DETR | no disponible | Roboflow |

Nota: los valores de mAP corresponden al "BDD100K Model Zoo" publicado por el autor en la model card; las cifras de parametros y licencias de los modelos alternativos no se detallan en la informacion proporcionada y deben verificarse en sus fuentes originales.

## Limitaciones y advertencias

- Especializacion de dominio: el modelo esta afinado exclusivamente sobre BDD100K (escenas de conduccion en Estados Unidos, con clases propias del dominio vial). Su rendimiento fuera de ese dominio (imagenes aereas, interiores, industrial) no esta documentado y previsiblemente se degrada.
- Clase train sin rendimiento: la clase train obtiene 0,00 de mAP@50 y mAP@50-95, lo que indica que el detector no la aprende de forma util en esta configuracion; no debe utilizarse para detectar trenes.
- Recall moderado: un recall del 52,12 % implica que aproximadamente la mitad de los objetos reales no se detectan al umbral de evaluacion empleado, lo que es critico en aplicaciones de seguridad (peatones y ciclistas).
- Metricas no verificadas: todos los resultados proceden de la model card del autor y estan marcados como `verified: false`; no han sido reproducidos ni validados por un tercero.
- Riesgo de falsos positivos y confusion entre clases: la model card publica matrices de confusion, pero no se aporta un analisis de los modos de fallo mas frecuentes.
- Restricciones de licencia del modelo: AGPL-3.0 es una licencia copyleft fuerte; el uso del modelo en un servicio en red obliga, segun los terminos de la AGPL, a ofrecer el codigo fuente correspondiente a los usuarios del servicio. Esto limita su integracion en productos propietarios.
- Restricciones de licencia del dataset: BDD100K se distribuye bajo su propia licencia (uso no comercial, solo investigacion y educacion, con registro obligatorio y prohibicion de redistribucion). El dataset no se incluye en el repositorio de Hugging Face, pero las condiciones del dataset condicionan el uso y la publicacion de derivados.
- Ausencia de datos de calibracion y de umbrales: no se especifica el umbral de confianza ni el de IoU empleados en la evaluacion, lo que dificulta la reproduccion exacta de las cifras.
- Idiomas: no aplica, pero conviene senalar que el modelo no procesa texto y no puede utilizarse para tareas de lenguaje, razonamiento, codigo ni matematicas.
- Advertencia de integridad: el repositorio figura con 0,0 GB de tamano, por lo que conviene comprobar que los pesos y los assets de demostracion estan efectivamente disponibles antes de planificar un despliegue.
- Fechas del repositorio: las marcas de creacion y actualizacion (2026-09-23) son posteriores a la fecha de esta ficha; deben tratarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-yolov10s
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Dataset BDD100K (sitio oficial): https://www.bdd100k.com/
- Paper de YOLOv10 (identificador citado en los tags): https://arxiv.org/abs/2405.14458
- Paper de BDD100K (identificador citado en los tags): https://arxiv.org/abs/2304.07193
- Referencia arXiv citada en los tags: https://arxiv.org/abs/2410.17725
- Referencia arXiv citada en los tags: https://arxiv.org/abs/2402.13616
- Referencia arXiv citada en los tags: https://arxiv.org/abs/2511.09554
- Referencia arXiv citada en los tags: https://arxiv.org/abs/2606.03748
