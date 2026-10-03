# dronefreak/uavdt-yolo26l

## Resumen

`dronefreak/uavdt-yolo26l` es un detector de objetos de una sola etapa obtenido por ajuste fino (*fine-tuning*) del modelo YOLO26l de Ultralytics sobre el conjunto de datos UAVDT (UAV-benchmark-M / Det, orientado a vigilancia de tráfico aéreo con drones). Lo publica el usuario dronefreak como parte de DetectionBench, un marco de trabajo que entrena y evalúa detectores modernos con recetas idénticas para permitir comparaciones reproducibles. El modelo resuelve la detección de vehículos (coche, camión y autobús) en imágenes aéreas de alta densidad y objetos pequeños, un escenario donde los detectores genéricos suelen degradarse.

Se trata de un modelo de visión por computador, no de un modelo de lenguaje: no genera texto ni mantiene conversaciones. Cuenta con 26,3 millones de parámetros y 93,8 GFLOPs a 640 píxeles de entrada, según los distintivos de la propia model card. Detecta tres clases: `car`, `truck` y `bus`.

Su relevancia actual es doble. Por un lado, aporta un punto de referencia medido sobre UAVDT con métricas declaradas (mAP@50 de 32,64, mAP@50-95 de 18,75) y una comparativa amplia frente a YOLOv8, YOLOv9, YOLOv10, YOLO11, YOLO26 en varios tamaños y la familia RF-DETR. Por otro, publica pesos listos para usar vía Ultralytics (`best.pt`), lo que reduce el coste de adopción en pipelines de vigilancia aérea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de la familia YOLO (base Ultralytics/YOLO26); arquitectura interna concreta no detallada en la informacion proporcionada |
| Parametros totales | 26,3 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision por computador) |
| Tipos de cuantizacion | no disponible (el repositorio publica `best.pt` en PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`), archivo `best.pt` |
| Tarea | object-detection |
| Libreria | ultralytics |
| Tamano del repositorio | 0,1 GB |
| FLOPs | 93,8 B (a 640 px) |
| Clases | car, truck, bus |
| Dataset de entrenamiento | dronefreak/UAVDT |
| Fecha de creacion | 2026-10-03 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `Ultralytics/YOLO26`, en su variante `l` (large), sobre el conjunto UAVDT. La model card no describe en detalle la arquitectura interna de YOLO26 (bloques, mecanismos de atención, estrategia de asignación de etiquetas), por lo que ese nivel de detalle no esta disponible en la informacion proporcionada. Lo que si se especifica es el rendimiento computacional: 26,3 M de parametros y 93,8 GFLOPs a una resolucion de entrada de 640 px, coherente con una variante `l` de la familia.

El entrenamiento forma parte de DetectionBench, cuyo objetivo declarado es aplicar recetas de entrenamiento y metricas de evaluacion identicas a multiples detectores y datasets del mundo real, de modo que las comparaciones entre modelos sean justas. La model card incluye un apartado de configuracion de entrenamiento, pero el contenido de esa tabla aparece truncado en la informacion disponible, por lo que no se pueden citar hiperparametros (epocas, optimizador, aumentos, resolucion exacta de entrenamiento) ni confirmar el uso de tecnicas concretas de regularizacion. No se documentan fases de RLHF/DPO, que no aplican a un detector. La evaluacion se realizo con el pipeline estandar de DetectionBench (`detectionbench-evaluate`) sobre la particion de test.

## Capacidades

- Deteccion de objetos en imagenes aereas captadas por drones (vision aerea o *aerial imagery*).
- Deteccion de vehiculos en tres categorias: `car`, `truck` y `bus`.
- Deteccion de objetos pequenos (*small-object-detection*), escenario habitual en tomas aereas de gran altitud o alta densidad de trafico.
- Vigilancia de trafico (*traffic-surveillance*) y analisis de flujos vehiculares.
- Inferencia por lotes y sobre fuentes de imagen y video mediante la API de Ultralytics (`model.predict(source=...)`).
- Exportacion a formatos desplegables a traves de las utilidades de Ultralytics (ONNX, TensorRT, OpenVINO, TFLite, CoreML); esta capacidad es una funcion de la libreria, no un formato publicado en el repositorio.
- No dispone de tool calling, function calling, razonamiento multi-paso, modo de pensamiento, vision multimodal generativa ni capacidad multilingue, ya que no es un modelo de lenguaje.
- La model card incluye una matriz de confusion normalizada, lo que permite inspeccionar la confusion entre clases durante la evaluacion.

## Casos de uso

- Vigilancia de trafico urbano con drones: el modelo detecta coches, camiones y autobuses en tomas aereas, lo que permite estimar densidad de trafico por zona y franja horaria a partir de conteos por fotograma.
- Gestion de aforos en infraestructuras viarias: integrado en un pipeline de video, cuenta vehiculos por clase para alimentar estudios de capacidad y planificacion de carriles.
- Monitorizacion de aparcamiento en superficie: sobre imagenes aereas periodicas, la clase `car` (la mejor resuelta, con mAP@50 de 77,73) permite estimar ocupacion de plazas sin sensores en el suelo.
- Analisis retrospectivo de incidentes: procesado por lotes de secuencias grabadas por UAV para localizar vehiculos implicados y reconstruir trayectorias antes y despues de un evento.
- Investigacion en vision aerea: sirve como referencia reproducible de YOLO26l sobre UAVDT dentro de DetectionBench, util para comparar nuevas tecnicas de deteccion de objetos pequenos bajo una receta fija.
- Prototipado de sistemas embarcados en dron: gracias a su tamano contenido (26,3 M de parametros), el modelo se puede exportar y ejecutar en plataformas con aceleracion tipo Jetson, siempre que se respete la licencia AGPL-3.0.
- Preetiquetado para anotacion: el detector puede generar cajas candidatas sobre nuevos vuelos para que un anotador humano las revise, reduciendo el coste de crear datasets propietarios de trafico aereo.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la particion de **test** de UAVDT, con el pipeline de evaluacion de DetectionBench. Ninguno de los valores esta verificado de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| mAP@50 | 32,64 |
| mAP@50-95 | 18,75 |
| Precision | 40,17 |
| Recall | 36,45 |
| F1 | 38,22 |
| Parametros | 26,3 M |
| FLOPs | 93,8 B (a 640 px) |

Rendimiento por clase segun la model card:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 77,73 | 42,55 |
| truck | 10,66 | 6,85 |
| bus | 9,53 | 6,86 |

La lectura de estos datos es clara: el modelo funciona bien en la clase dominante (`car`) y muy mal en `truck` y `bus`, probablemente por desequilibrio de clases en UAVDT y por el parecido visual entre vehiculos pesados a distancia. La precision y el recall globales (40,17 y 36,45) son bajos en terminos absolutos, lo que indica un margen de mejora considerable antes de llevar este modelo a produccion.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones a partir de los 26,3 M de parametros publicados, no datos medidos recogidos en la model card.

- VRAM de pesos: aproximadamente 105 MB en FP32 y 53 MB en FP16.
- VRAM total de inferencia: en el entorno de 1 a 2 GB a 640 px de entrada en FP16, sumando activaciones y buffers; cifra orientativa.
- GPU de consumo: cabe con holgura en cualquier GPU moderna con 4 GB o mas (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). Tambien es viable en CPU, con latencia mayor.
- GPU profesional: se puede servir en A100, H100, L4 o T4 para escenarios de alto throughput con batching.
- Plataformas embarcadas: candidato razonable para NVIDIA Jetson (Nano, Orin) tras exportacion a TensorRT o ONNX, sujeto a pruebas reales no publicadas.
- Opciones de despliegue: Ultralytics (nativo, con `best.pt`), exportacion a ONNX, TensorRT, OpenVINO, CoreML o TFLite, y servidores de inferencia como Triton. No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector.
- Latencia y throughput: no disponible; la model card no publica tiempos de inferencia ni FPS.
- Almacenamiento: el repositorio ocupa 0,1 GB, por lo que los pesos son ligeros de distribuir.

## Comparativa con modelos similares

Comparacion sobre UAVDT test, con los valores de la tabla "UAVDT Model Zoo" publicada por el autor. Todos los modelos se entrenaron con la misma receta de DetectionBench, lo que hace la comparacion razonablemente homogenea.

| Modelo | Parametros | mAP@50 | mAP@50-95 | Precision | Recall | Licencia |
|---|---|---|---|---|---|---|
| YOLO26l (este modelo) | 26,3 M | 32,64 | 18,75 | 40,17 | 36,45 | AGPL-3.0 |
| YOLO26m | no disponible | 33,43 | 19,56 | 38,14 | 39,84 | AGPL-3.0 (Ultralytics) |
| YOLO26s | no disponible | 32,98 | 19,61 | 43,86 | 40,38 | AGPL-3.0 (Ultralytics) |
| RF-DETR Medium | no disponible | 33,28 | 20,54 | 73,03 | 70,03 | no disponible |
| RF-DETR Nano | no disponible | 32,78 | 20,31 | 73,60 | 66,98 | no disponible |
| YOLOv8m | no disponible | 31,42 | 18,80 | 40,27 | 37,79 | AGPL-3.0 (Ultralytics) |
| YOLO11m | no disponible | 30,47 | 17,71 | 37,70 | 37,01 | AGPL-3.0 (Ultralytics) |

Observaciones relevantes: YOLO26l no es el mejor modelo de su propia familia en este dataset, ya que YOLO26m y YOLO26s obtienen mAP@50 ligeramente superior con menos parametros, lo que sugiere sobreajuste o un ajuste fino suboptimo de la variante `l`. Ademas, las variantes de RF-DETR logran precision y recall muy superiores (por encima de 66 en recall) con mAP@50 comparable, lo que apunta a un mejor equilibrio precision-exhaustividad en la deteccion aerea.

## Limitaciones y advertencias

- Rendimiento global modesto: mAP@50 de 32,64 y mAP@50-95 de 18,75 son valores bajos para produccion, especialmente en las clases `truck` (6,85) y `bus` (6,86) en mAP@50-95.
- Desequilibrio de clases acusado: `car` alcanza 77,73 de mAP@50 frente a 10,66 de `truck`, lo que limita el uso en escenarios donde los vehiculos pesados sean el objetivo principal.
- Metricas no verificadas: todos los resultados de la model card estan marcados como `verified: false`; conviene reproducirlos antes de tomar decisiones.
- Sesgos de dominio: el modelo esta entrenado exclusivamente sobre UAVDT, con camaras, altitudes, condiciones de luz y regiones geograficas concretas. Su generalizacion a otros entornos aereos, sensores o paises no esta demostrada.
- Riesgo de falsos negativos y positivos: con precision y recall por debajo del 41 y el 37 por ciento, respectivamente, se esperan tanto omisiones como detecciones espurias, con especial incidencia en objetos pequenos o parcialmente ocluidos.
- Idioma y texto: no aplica, al no procesar lenguaje.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero si se ofrece el modelo como servicio en red o se distribuye software derivado, la AGPL obliga a liberar el codigo fuente correspondiente bajo la misma licencia. Para productos propietarios suele ser necesario adquirir una licencia comercial de Ultralytics.
- Modelo base: al derivar de Ultralytics/YOLO26, los terminos aplicables al modelo base condicionan tambien el uso de este ajuste fino.
- Sin datos de entrenamiento publicados: la tabla de configuracion de entrenamiento aparece truncada, lo que dificulta auditar hiperparametros, epocas y composicion exacta del dataset.
- Adopcion nula en el momento de redactar la ficha: 0 descargas y 0 likes, sin validacion por parte de la comunidad.
- Sin soporte de idiomas, agentes, tool calling ni generacion de texto: cualquier descripcion que lo presente como un modelo conversacional es incorrecta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/uavdt-yolo26l
- Dataset UAVDT en HuggingFace: https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Paper de UAVDT (arXiv:1804.00518): https://arxiv.org/abs/1804.00518
- Referencia arXiv asociada al modelo (arXiv:2606.03748): https://arxiv.org/abs/2606.03748
- Libreria Ultralytics: https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; las referencias encontradas trataban sobre herramientas de desarrollo y edicion de codigo, por lo que no se han incluido en esta ficha.
