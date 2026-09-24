# dronefreak/bdd100k-yolo26s

## Resumen

El modelo `dronefreak/bdd100k-yolo26s` es un detector de objetos YOLO26s afinado sobre el conjunto de datos BDD100K, orientado a la percepcion en escenas de conduccion (vehiculos, peatones, senales de trafico y semaforos). Lo publica el usuario dronefreak como parte de DetectionBench, un framework que entrena y evalua detectores modernos con recetas de entrenamiento y metricas identicas sobre varios conjuntos de datos del mundo real, de modo que las comparaciones entre arquitecturas sean reproducibles y no dependan de ajustes dispares.

Tecnicamente es un detector de una sola etapa de la familia Ultralytics, con 10,0 millones de parametros y 22,8 GFLOPs a 640 px de resolucion de entrada, lo que lo situa en el segmento "small" de la gama YOLO26. Sobre el split de test de BDD100K alcanza 58,76 % de mAP@50 y 33,86 % de mAP@50-95, con 75,49 % de precision y 53,07 % de recall. En la comparativa interna de BDD100K que acompania a la model card, esta variante encabeza la tabla por delante de YOLOv8s, YOLOv10s, YOLO11s y RF-DETR Nano en mAP@50 y mAP@50-95.

Su relevancia practica esta en que ofrece un punto de referencia reproducible para deteccion en escenas de trafico, con pesos ya entrenados y metricas desglosadas por clase (incluida la clase `train`, con un rendimiento marginal). La licencia AGPL-3.0 y la licencia no comercial del dataset BDD100K son las dos restricciones que mas condicionan su uso en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos YOLO26 (Ultralytics), una sola etapa; detalles internos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | 10,0 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen, 640 px por defecto (FLOPs declarados a esa resolucion) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no aplica (modelo de vision); las 10 clases de BDD100K estan etiquetadas en ingles |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (libreria `ultralytics`); el repositorio ocupa 0,0 GB y no se detallan otros formatos de exportacion |
| Tarea (pipeline) | `object-detection` |
| Modelo base | Ultralytics/YOLO26 (fine-tune) |
| FLOPs | 22,8 B a 640 px |
| Clases detectadas | person, rider, car, truck, bus, train, motor, bike, traffic light, traffic sign |
| Fecha de publicacion | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un fine-tune del modelo base `Ultralytics/YOLO26` en su variante "s" (small), integrado en la libreria Ultralytics y con tarea de deteccion de objetos. No se detallan en la model card ni en las etiquetas del repositorio la composicion exacta del backbone, el mecanismo de asignacion de etiquetas, el tipo de cabecera ni si incorpora componentes de tipo DETR o de attention lineal; por tanto, esos extremos quedan como no disponibles. Los unicos datos cuantitativos de arquitectura publicados son los 10,0 M de parametros y los 22,8 GFLOPs a 640 px.

El entrenamiento se realizo sobre BDD100K, un conjunto de escenas de conduccion con anotaciones de cajas delimitadoras sobre 10 clases. El autor no especifica el numero de tokens, epocas, aumentos de datos, funcion de perdida ni si hubo etapas de ajuste adicionales; si indica que tanto el entrenamiento como la evaluacion siguen la receta estandar de DetectionBench, con el mismo protocolo para todos los modelos comparados. La evaluacion reportada se calcula sobre el split de test de BDD100K mediante la herramienta `detectionbench-evaluate`.

## Capacidades

- Deteccion de objetos en imagenes individuales de escenas de conduccion, con cajas delimitadoras y puntuaciones de confianza.
- Deteccion especifica de las 10 clases de BDD100K: peatones, ciclistas, coches, camiones, autobuses, trenes, motocicletas, bicicletas, semaforos y senales de trafico.
- Buen rendimiento relativo en las clases frecuentes: `car` (82,84 % mAP@50), `traffic sign` (75,08 %), `traffic light` (71,46 %) y `person` (69,2 %).
- Rendimiento intermedio en clases de menor frecuencia: `truck` (67,6 %), `bus` (66,94 %), `bike` (53,12 %), `rider` (50,54 %) y `motor` (50,44 %).
- Capacidad de procesamiento por fotograma en video, ya que el autor publica una demo de detecciones sobre dos clips de test de BDD100K; no se especifica la tasa de fotogramas alcanzada.
- Soporte de tool calling / function calling: no aplica (modelo de vision, no un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo de razonamiento, vision-lenguaje, audio): no disponibles; el modelo solo produce detecciones.

## Casos de uso

- Percepcion para conduccion autonoma o asistida: el detector identifica vehiculos, peatones, ciclistas, senales y semaforos en el fotograma, y su tamano de 10,0 M de parametros y 22,8 GFLOPs a 640 px permite integrarlo en un bucle de inferencia en tiempo real dentro de la ECU o del ordenador de a bordo.
- Analisis de trafico urbano a partir de camaras fijas: al estar entrenado sobre escenas de conduccion diversas (dia, noche, distintas condiciones meteorologicas, segun la naturaleza de BDD100K), sirve para contar vehiculos por carril, estimar ocupacion y detectar peatones en cruces.
- Aviso de colision y sistemas ADAS: las detecciones de `car`, `truck`, `bus` y `person` con precision del 75,49 % permiten alimentar modulos de distancia de seguridad y alerta de peaton, siempre con validacion adicional en el dominio concreto de despliegue.
- Preetiquetado de datasets de trafico: el modelo genera cajas candidatas para anotacion humana en nuevas grabaciones, reduciendo el coste de etiquetado; es util por su velocidad y por cubrir las clases mas habituales de escena viaria.
- Auditoria de flotas y analisis de siniestralidad con dashcams: procesar videos de vehiculos para extraer objetos presentes, senales y semaforos y reconstruir la escena antes de un incidente.
- Filtrado y curacion de datos para reentrenamiento: usar el detector para seleccionar clips con presencia de clases poco frecuentes (`train`, `motor`, `rider`) o con condiciones dificiles, y construir conjuntos de entrenamiento mas equilibrados.
- Investigacion en deteccion de objetos: como referencia de linea base reproducible dentro de DetectionBench, permite comparar variantes de YOLO y DETR bajo el mismo protocolo de BDD100K con las metricas ya publicadas.

## Benchmarks y rendimiento

Resultados declarados por el autor, medidos sobre el split de **test** de BDD100K con `detectionbench-evaluate` (no verificados de forma independiente):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 58,76 |
| mAP@50-95 | 33,86 |
| Precision | 75,49 |
| Recall | 53,07 |
| F1 | 62,32 |
| Parametros | 10,0 M |
| FLOPs (640 px) | 22,8 B |

Rendimiento por clase sobre el mismo split:

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| person | 69,2 | 36,18 |
| rider | 50,54 | 25,9 |
| car | 82,84 | 51,82 |
| truck | 67,6 | 49,95 |
| bus | 66,94 | 52,46 |
| train | 0,36 | 0,14 |
| motor | 50,44 | 26,06 |
| bike | 53,12 | 27,11 |
| traffic light | 71,46 | 28,23 |
| traffic sign | 75,08 | 40,76 |

Comparativa completa del "model zoo" de BDD100K publicado por el autor (todos evaluados con el mismo protocolo):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26s (este modelo) | 58,76 | 33,86 | 75,49 | 53,07 |
| YOLOv8s | 57,93 | 33,25 | 75,38 | 51,63 |
| YOLOv10s | 57,64 | 33,34 | 75,02 | 52,12 |
| YOLO11s | 57,63 | 33,10 | 74,31 | 52,42 |
| RF-DETR Nano | 56,90 | 31,58 | 80,68 | 64,78 |
| YOLO26n | 52,25 | 29,23 | 72,56 | 46,87 |
| YOLOv9t | 52,04 | 29,46 | 71,34 | 46,72 |
| YOLOv10n | 51,95 | 29,31 | 71,58 | 46,62 |
| YOLOv8n | 51,67 | 29,09 | 70,95 | 46,59 |
| YOLO11n | 51,63 | 29,06 | 71,68 | 46,34 |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia de orden de magnitud, un detector de 10,0 M de parametros ocupa decenas de MB en pesos (aproximadamente 40 MB en FP32 y 20 MB en FP16) y el grueso del consumo proviene de las activaciones a 640 px; en la practica cabe holgadamente en GPUs con 4 GB o mas. Estas cifras son una estimacion, no un dato del autor.
- GPU recomendadas: no especificadas. Por tamano y regimen de FLOPs, cualquier GPU moderna de consumo o de datacenter es suficiente; no hay datos publicados de latencia ni de throughput para A100, H100, RTX 4090 u otras.
- Compatibilidad con GPU de consumo: previsiblemente si, en practicamente cualquier GPU de consumo actual, dado el tamano del modelo; no se aporta una lista concreta de modelos validados.
- Opciones de despliegue: la libreria declarada es `ultralytics` (PyTorch). El autor no documenta integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de vision. Cualquier despliegue sobre TensorRT, ONNX Runtime u OpenVINO requeriria exportar los pesos, extremo no confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. El autor publica una demo en video con detecciones sobre dos clips de test, pero sin tasas de fotogramas ni medidas de tiempo por inferencia.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoria (detectores de una etapa en el rango de 10 M de parametros, evaluados por el propio autor sobre BDD100K test):

| Modelo | mAP@50 (%) | mAP@50-95 (%) | Precision (%) | Recall (%) | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| YOLO26s (este modelo) | 58,76 | 33,86 | 75,49 | 53,07 | 10,0 M | AGPL-3.0 | pesos en Hugging Face |
| YOLOv8s | 57,93 | 33,25 | 75,38 | 51,63 | no disponible | no disponible en la informacion proporcionada | no disponible |
| YOLOv10s | 57,64 | 33,34 | 75,02 | 52,12 | no disponible | no disponible en la informacion proporcionada | no disponible |
| YOLO11s | 57,63 | 33,10 | 74,31 | 52,42 | no disponible | no disponible en la informacion proporcionada | no disponible |
| RF-DETR Nano | 56,90 | 31,58 | 80,68 | 64,78 | no disponible | no disponible en la informacion proporcionada | no disponible |

Notas de lectura: YOLO26s lidera en mAP@50 y mAP@50-95 entre los modelos "s" comparados, mientras que RF-DETR Nano, pese a quedar por debajo en mAP, obtiene la mejor precision (80,68 %) y el mejor recall (64,78 %) de la tabla, lo que sugiere un comportamiento mas conservador en falsos positivos. Los datos de parametros, licencia y disponibilidad de los modelos alternativos no estan recogidos en la informacion proporcionada.

## Limitaciones y advertencias

- Clase `train` practicamente no detectada: 0,36 % de mAP@50 y 0,14 % de mAP@50-95. El modelo no es fiable para esa categoria, previsiblemente por su baja representacion en BDD100K.
- Recall moderado (53,07 %) frente a la precision (75,49 %): tiende a omitir objetos reales antes que a generar falsos positivos, lo que es problematico en aplicaciones de seguridad donde un peaton no detectado tiene consecuencias graves.
- Los resultados estan declarados por el autor y marcados como `verified: false`; no se han reproducido de forma independiente.
- Sesgos y dominio: el modelo se entrena exclusivamente con BDD100K (escenas de conduccion, fundamentalmente de Estados Unidos y con la distribucion de clases de ese dataset), por lo que su comportamiento fuera de ese dominio (otras geografias, senaletica distinta, camaras aereas, imagenes industriales) no esta caracterizado.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de detecciones espurias y de cajas mal localizadas en condiciones de baja iluminacion, oclusion o desenfoque de movimiento, no cuantificado en la model card.
- Limitacion de idioma: no aplica; el modelo no procesa texto. Las etiquetas de clase estan en ingles.
- Contexto: no aplica; se trata de una entrada de imagen, no de una ventana de tokens.
- Licencia AGPL-3.0: el uso comercial del modelo y de cualquier obra derivada obliga a cumplir las condiciones de la AGPL (entre ellas, la publicacion del codigo fuente de la obra derivada bajo la misma licencia). Para usos propietarios, Ultralytics ofrece licencias comerciales alternativas que no estan cubiertas por este repositorio.
- Restriccion adicional por el dataset: BDD100K se distribuye bajo su propia licencia, limitada a investigacion y educacion no comercial, con registro obligatorio y prohibicion de redistribucion. Esa restriccion alcanza a los pesos derivados del entrenamiento con esos datos, aunque la model card no explicita como se resuelve esa capa de licencia.
- El repositorio ocupa 0,0 GB segun los metadatos, dato que conviene verificar antes de asumir que los pesos estan efectivamente subidos.
- No hay informacion sobre cuantizacion, exportacion a formatos de inferencia ni latencia, por lo que cualquier estimacion de rendimiento en produccion debe medirse en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-yolo26s
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Repositorio DetectionBench (framework de entrenamiento y evaluacion): https://github.com/dronefreak/DetectionBench
- Sitio oficial de BDD100K: el enlace aparece truncado en la model card como `https://www...`; la descarga requiere registro en el sitio oficial del dataset (https://bdd-data.berkeley.edu/)
- Referencias arXiv citadas en las etiquetas del repositorio: arxiv:2606.03748, arxiv:2511.09554, arxiv:2304.07193, arxiv:2410.17725, arxiv:2405.14458, arxiv:2402.13616 (la model card no indica a que componente corresponde cada una)
- Demo en video del propio modelo: https://huggingface.co/dronefreak/bdd100k-yolo26s/resolve/main/assets/demo_banner.mp4
- Poster de la demo: https://huggingface.co/dronefreak/bdd100k-yolo26s/resolve/main/assets/demo_banner_poster.jpg
