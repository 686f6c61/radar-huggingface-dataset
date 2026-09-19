# dronefreak/uavdt-yolo11x

## Resumen

El modelo `dronefreak/uavdt-yolo11x` es un detector de objetos YOLO11x afinado sobre el conjunto de datos UAVDT (vehiculos vistos desde dron) por el autor `dronefreak`, como parte del proyecto DetectionBench. Se trata de un fine-tuning del checkpoint base Ultralytics YOLO11x, con 57,0 M de parametros y 196,0 GFLOPs, orientado a la deteccion de tres clases: coche, camion y autobus en imagenes aereas.

El problema que aborda es la deteccion de objetos pequenos en imagenes capturadas por UAV, un escenario con gran densidad de instancias, escalas muy variables y movimiento de camara, donde los detectores genericos pierden recall con facilidad. Su relevancia actual es doble: por un lado, sirve como referencia reproducible dentro de DetectionBench, un marco que entrena y evalua distintos detectores con recetas identicas; por otro, demuestra que un modelo de la familia YOLO11 puede integrarse en un flujo estandar de Hugging Face y Ultralytics con muy pocos pasos.

Los resultados publicados por el autor son, sin embargo, modestos: mAP@50 de 11,98 % y mAP@50-95 de 6,68 % en el split de test de UAVDT, con un rendimiento muy desigual por clase (31,92 % de mAP@50 en coche frente a 2,29 % en camion y 1,74 % en autobus). Se trata, por tanto, de un checkpoint util para experimentacion, comparacion y ajuste posterior, no de un modelo listo para produccion sin un trabajo adicional de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de deteccion en una etapa, familia YOLO11 (Ultralytics), variante x |
| Parametros totales | 57,0 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa texto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el framework Ultralytics permite exportar a ONNX, TensorRT, OpenVINO o TFLite, pero el autor no declara cuantizaciones validadas) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint `best.pt`, cargado con `ultralytics.YOLO`) |
| Computo por inferencia | 196,0 GFLOPs |
| Tarea (pipeline) | object-detection |
| Clases | car, truck, bus |
| Modelo base | Ultralytics/YOLO11 (YOLO11x), fine-tuning |
| Dataset de entrenamiento | dronefreak/UAVDT |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLO11x, la variante mas grande de la familia YOLO11 de Ultralytics. Se trata de un detector de una sola etapa con backbone convolucional, cuello de agregacion multi-escala y cabezas de deteccion ancladas sin anchor box (anchor-free), con asignacion de etiquetas dinamica. El checkpoint tiene 57,0 M de parametros y requiere 196,0 GFLOPs por imagen, lo que lo situa en el extremo de mayor coste computacional de la familia YOLO11.

El modelo se ha obtenido por fine-tuning del checkpoint Ultralytics/YOLO11 sobre el dataset UAVDT, que contiene imagenes aereas de trafico con tres clases anotadas (car, truck, bus). El autor no detalla en la model card el numero de tokens o imagenes, la composicion exacta del split, la resolucion de entrada ni si se aplicaron tecnicas de aumento de datos, destilacion o ajuste por refuerzo; esos datos figuran como no disponibles. La innovacion principal del proyecto no esta en el modelo en si, sino en el protocolo: todas las metricas se calculan con el pipeline estandar `detectionbench-evaluate` de DetectionBench sobre el split de test de UAVDT, lo que permite comparaciones homogeneas entre detectores.

## Capacidades

- Deteccion de objetos en imagenes aereas de dron, limitada a tres clases: coche, camion y autobus.
- Localizacion con cajas delimitadoras y puntuacion de confianza por instancia, apta para conteo y seguimiento posterior en post-proceso.
- Deteccion de objetos pequenos en escenas densas, escenario objetivo del dataset UAVDT.
- Integracion directa con el ecosistema Ultralytics: entrenamiento, validacion, prediccion por lotes y exportacion a otros formatos con la misma API.
- Carga sencilla desde Hugging Face mediante `hf_hub_download` y `ultralytics.YOLO`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No tiene capacidades multilingues ni de generacion de texto: no procesa ni produce lenguaje natural.
- No dispone de modo de razonamiento, vision-lenguaje ni procesamiento de audio.

## Casos de uso

- Analisis de trafico urbano desde dron: el modelo detecta coches, camiones y autobuses en fotogramas aereos, de modo que puede alimentar un contador de vehiculos por fotograma. Es adecuado para prototipos y estudios porque trabaja directamente sobre las tres clases del dataset UAVDT, aunque el recall en camion y autobus es bajo.
- Benchmarking reproducible de detectores: al formar parte del zoologico de modelos de DetectionBench, sirve como punto de comparacion con RF-DETR y otras variantes de YOLO entrenadas con la misma receta y evaluadas con el mismo pipeline sobre el split de test de UAVDT.
- Pre-anotacion de datasets aereos: las cajas generadas pueden usarse como etiquetas iniciales que un anotador humano revisa, reduciendo el coste de construir nuevos conjuntos de imagenes de dron con vehiculos.
- Investigacion academica sobre deteccion de objetos pequenos: el desglose por clase (31,92 % de mAP@50 en coche frente a 1,74 % en autobus) y las curvas PR, F1 y matrices de confusion publicadas permiten estudiar el sesgo del modelo hacia objetos de mayor tamano o frecuencia.
- Base para fine-tuning especifico: un equipo puede partir de este checkpoint ya adaptado a dominio aereo y continuar el entrenamiento con datos propios de una ciudad o de un tipo de camara concreto, aprovechando las caracteristicas aprendidas sobre UAVDT.
- Despliegue en el borde con exportacion: aunque el autor no publica conversiones, la libreria Ultralytics permite exportar el checkpoint a ONNX, TensorRT u OpenVINO para ejecutarlo en plataformas embarcadas a bordo de un UAV o en una estacion terrestre.
- Monitorizacion de infraestructuras viarias: combinado con un seguidor multiobjeto, el detector puede alimentar estimaciones de flujo vehicular o deteccion de retenciones, siempre que el escenario se parezca al dominio de entrenamiento y se asuma la tasa de fallo actual.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de UAVDT, calculados con el pipeline `detectionbench-evaluate`. La model card marca estas metricas como no verificadas (`verified: false`).

| Metrica | Valor |
|---|---|
| mAP@50 | 11,98 % |
| mAP@50-95 | 6,68 % |
| Precision | 18,70 % |
| Recall | 25,93 % |
| F1 | 21,73 % |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 31,92 % | 17,18 % |
| truck | 2,29 % | 1,56 % |
| bus | 1,74 % | 1,30 % |

Comparativa publicada por el autor en el zoologico de modelos de UAVDT (mismos datos y protocolo):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Medium | 15,02 % | 8,76 % | 40,28 % | 61,14 % |
| RF-DETR Small | 14,89 % | 8,92 % | 38,83 % | 61,65 % |
| YOLOv26s | 14,09 % | 7,91 % | 23,88 % | 27,05 % |
| RF-DETR Nano | 12,96 % | 7,33 % | 37,12 % | 55,40 % |
| YOLOv26m | 12,32 % | 6,66 % | 19,44 % | 25,83 % |
| YOLOv8m | 12,28 % | 7,05 % | 19,73 % | 25,33 % |
| YOLOv11x (este modelo) | 11,98 % | 6,68 % | 18,70 % | 25,93 % |
| YOLOv8s | 11,48 % | 6,71 % | 19,34 % | 23,39 % |
| YOLOv8n | 10,79 % | 6,42 % | 18,61 % | 24,58 % |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa aproximadamente 115 MB de pesos en FP16 y unos 228 MB en FP32; sumando activaciones y buffers, una inferencia por lotes pequenos a resolucion tipica de 640 px deberia caber en el entorno de 1-2 GB de VRAM (estimacion a partir del numero de parametros y FLOPs, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia (por ejemplo, GTX 1650, RTX 3050, T4). Para entrenamiento o fine-tuning se recomienda una GPU de 16 GB o mas (RTX 4090, A100, H100) por el coste de 196 GFLOPs y el mayor consumo de memoria del entrenamiento respecto a la inferencia.
- Cabe en GPU de consumo: si, la variante x de YOLO11 esta pensada para caber en GPU de gama media-alta para inferencia; para entrenamiento se necesita al menos una GPU de gama alta con memoria amplia.
- Opciones de despliegue: Ultralytics (Python), exportacion a ONNX, TensorRT, OpenVINO o TFLite desde la propia libreria, y despliegue en contenedores. No se han publicado configuraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de vision.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones de latencia ni de imagenes por segundo sobre ninguna GPU concreta.

## Comparativa con modelos similares

La comparacion se limita a los modelos que el autor ha evaluado sobre el mismo dataset y protocolo; para las alternativas solo se dispone de las metricas de UAVDT, no de sus especificaciones tecnicas en esta informacion.

| Modelo | mAP@50 (UAVDT) | mAP@50-95 (UAVDT) | Precision | Recall | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| dronefreak/uavdt-yolo11x | 11,98 % | 6,68 % | 18,70 % | 25,93 % | 57,0 M | AGPL-3.0 | Hugging Face |
| RF-DETR Medium (segun el autor) | 15,02 % | 8,76 % | 40,28 % | 61,14 % | no disponible | no disponible | no disponible |
| RF-DETR Small (segun el autor) | 14,89 % | 8,92 % | 38,83 % | 61,65 % | no disponible | no disponible | no disponible |
| YOLOv26s (segun el autor) | 14,09 % | 7,91 % | 23,88 % | 27,05 % | no disponible | no disponible | no disponible |
| YOLOv8m (segun el autor) | 12,28 % | 7,05 % | 19,73 % | 25,33 % | no disponible | no disponible | no disponible |

En mAP@50, este checkpoint queda por debajo de los cinco modelos de la tabla anterior y solo supera a YOLOv8s y YOLOv8n. Su principal ventaja comparativa no es el rendimiento, sino la trazabilidad: la model card publica protocolo de evaluacion, curvas PR y F1, matrices de confusion y desglose por clase, ademas de las recetas y metricas de los demas modelos del zoologico.

## Limitaciones y advertencias

- Rendimiento bajo en terminos absolutos: 11,98 % de mAP@50 y 6,68 % de mAP@50-95 en el split de test de UAVDT. No es un modelo apto para produccion sin reentrenamiento o ajuste adicional.
- Desequilibrio severo por clase: el modelo detecta razonablemente coches (31,92 % de mAP@50) pero falla casi por completo en camiones (2,29 %) y autobuses (1,74 %), lo que probablemente refleja el desequilibrio de clases del dataset y el menor tamano aparente de esos objetos.
- Precision y recall bajos (18,70 % y 25,93 %), lo que implica un volumen elevado de falsos positivos y falsos negativos en cualquier aplicacion real.
- Riesgo de alucinacion en sentido amplio: en deteccion se traduce en cajas espurias sobre fondos complejos o texturas similares a vehiculos; no hay datos publicados sobre este comportamiento mas alla de la matriz de confusion.
- Dominio muy restringido: entrenado solo con imagenes aereas de UAVDT y tres clases. No se puede esperar generalizacion a otras camaras, altitudes, condiciones meteorologicas o categorias de objetos.
- Limitacion geografica y de dominio de los datos: UAVDT procede de un unico entorno de captura; el comportamiento fuera de ese contexto no esta documentado.
- Ausencia de idiomas y de procesamiento de texto: no aplica a tareas de lenguaje, agentes ni tool calling.
- Licencia AGPL-3.0: el uso comercial es posible, pero la licencia exige que las obras derivadas y los servicios ofrecidos por red liberen el codigo fuente correspondiente. Conviene revisar las condiciones antes de integrarlo en un producto propietario; el modelo base Ultralytics/YOLO11 tambien se distribuye bajo AGPL-3.0.
- Metricas no verificadas: el propio autor marca los resultados como `verified: false` en el model-index, de modo que no han pasado una validacion independiente.
- Sin informacion sobre cuantizacion, latencia ni requisitos de hardware validados, lo que complica planificar un despliegue en el borde.
- Repositorio sin descargas ni valoraciones en el momento de redactar esta ficha, lo que limita la evidencia de uso en la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/uavdt-yolo11x
- Dataset UAVDT en Hugging Face: https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench (marco de evaluacion y fuente de las metricas): https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO11
- Demo en video publicada en el repositorio: https://huggingface.co/dronefreak/uavdt-yolo11x/resolve/main/assets/demo_banner.mp4
- Referencias arXiv listadas en las etiquetas del repositorio (el autor no indica sus titulos): https://arxiv.org/abs/1804.00518, https://arxiv.org/abs/2410.17725, https://arxiv.org/abs/2511.09554, https://arxiv.org/abs/2304.07193, https://arxiv.org/abs/2606.03748
- Documentacion de Ultralytics: https://docs.ultralytics.com
- Las busquedas web realizadas no han devuelto otros enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a manuales de un dispositivo de videoconferencia y no se han utilizado.
