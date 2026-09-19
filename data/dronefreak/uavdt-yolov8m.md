# dronefreak/uavdt-yolov8m

## Resumen

uavdt-yolov8m es un detector de objetos YOLOv8m (variante "medium" de la familia Ultralytics YOLOv8) afinado sobre el conjunto de datos UAVDT, un benchmark de deteccion de vehiculos en imagenes aereas captadas por drones. Lo publica el usuario dronefreak como parte de DetectionBench, un marco de trabajo orientado a comparar detectores modernos bajo recetas de entrenamiento y metricas de evaluacion identicas. No es un modelo de lenguaje: no genera texto ni procesa instrucciones, su salida son cajas delimitadoras con clase y puntuacion de confianza sobre tres categorias: coche (car), camion (truck) y autobus (bus).

Arquitectonicamente es un detector CNN de una sola etapa, sin anclas (anchor-free), con backbone CSPDarknet, cuello PAN-FPN y cabeza desacoplada, con 25,9 millones de parametros y 78,9 B FLOPs segun la propia ficha. El repositorio pesa 0,1 GB y distribuye un unico checkpoint en formato PyTorch (best.pt), bajo licencia AGPL-3.0, lo que condiciona su uso comercial.

Su relevancia es fundamentalmente metodologica y de investigacion: sirve como punto de referencia reproducible dentro del zoologico de modelos evaluados sobre UAVDT, y permite medir cuanto aporta cada familia de detectores (YOLO, RF-DETR) en el mismo protocolo. Conviene subir la advertencia desde el principio: los resultados declarados son bajos (mAP@50 de 12,28 % y mAP@50-95 de 7,05 %), y estan marcados como no verificados, por lo que no es un modelo listo para produccion sin supervision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de deteccion de objetos de una etapa, anchor-free (YOLOv8m: backbone CSPDarknet con bloques C2f, cuello PAN-FPN, cabeza desacoplada) |
| Parametros totales | 25,9 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de vision por computador, no procesa secuencias de texto |
| Tipos de cuantizacion | no disponible; el repositorio solo publica el checkpoint best.pt. El ecosistema Ultralytics permite exportar a FP16/INT8 y a formatos como ONNX, TensorRT u OpenVINO, pero la ficha del modelo no documenta ninguna variante cuantizada |
| Idiomas soportados | no aplica: no procesa texto ni voz. Las etiquetas de salida son las tres clases del dataset: car, truck, bus |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt, fichero best.pt), checkpoint compatible con la libreria ultralytics |
| Tarea | Deteccion de objetos (pipeline: object-detection) |
| Modelo base | Ultralytics/YOLOv8 (afinado) |
| Dataset de entrenamiento | dronefreak/UAVDT (3 clases: car, truck, bus) |
| Framework | Ultralytics YOLO |
| FLOPs declarados | 78,9 B (la ficha usa esta unidad; en la configuracion estandar de YOLOv8m la cifra equivalente suele expresarse en GFLOPs, por lo que podria tratarse de una confusion de unidad no aclarada en la informacion disponible) |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion publicada | 2026-09-18 |
| Ultima actualizacion publicada | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de YOLOv8m: un detector denso de una sola etapa, sin propuestas de region ni anclas, con asignacion de etiquetas alineada por tarea y una cabeza desacoplada que separa la prediccion de clasificacion y la de regresion de cajas. Los 25,9 M de parametros lo situan en la gama media de la familia YOLOv8, y el backbone CSPDarknet con modulos C2f mas el cuello PAN-FPN le permiten combinar caracteristicas de varias escalas, algo critico cuando los objetos son vehiculos pequenos vistos desde gran altitud.

El entrenamiento consiste en un afinado (finetune) de los pesos preentrenados de Ultralytics/YOLOv8 sobre el dataset UAVDT, que anota vehiculos en secuencias aereas de trafico. El autor integra el proceso en DetectionBench, cuyo proposito explicito es aplicar recetas de entrenamiento y pipelines de evaluacion identicos entre modelos para que las comparaciones sean reproducibles; la evaluacion declarada se realiza sobre la particion de test de UAVDT con la herramienta `detectionbench-evaluate`.

La informacion disponible no detalla el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, el numero de epocas, el tamano de entrada, el optimizador, las estrategias de aumento de datos ni si hubo tecnicas de refinamiento posteriores. Tampoco se documentan innovaciones tecnicas propias: el valor del modelo esta en la reproducibilidad del pipeline, no en aportaciones arquitectonicas originales.

## Capacidades

- Deteccion de vehiculos en imagenes aereas y de dron, con tres clases de salida: car, truck y bus.
- Localizacion con cajas delimitadoras y puntuacion de confianza por deteccion, apta para conteo y filtrado.
- Inferencia sobre imagenes individuales o lotes mediante la API de Ultralytics (`YOLO(weights)` y `model.predict`), tal como se documenta en la ficha.
- Rendimiento marcadamente desigual por clase: la clase car alcanza 29,6 mAP@50, frente a 4,87 de bus y 2,36 de truck, segun la tabla por clase de la ficha.
- Posible integracion con utilidades del ecosistema Ultralytics (seguimiento multi-objeto con trackers tipo ByteTrack o BoT-SORT, exportacion a otros formatos de inferencia), aunque la ficha del modelo no documenta ninguna de estas capacidades de forma explicita.
- No soporta tool calling ni function calling, no ejecuta razonamiento multi-paso, no actua como agente y no tiene modo de pensamiento ni capacidades de audio, vision generativa o dialogo.
- No tiene capacidades multilingues: no hay entrada ni salida en lenguaje natural.

## Casos de uso

- Investigacion comparativa de detectores: usar este checkpoint como referencia base en experimentos que midan el efecto de cambios de receta de entrenamiento sobre UAVDT, aprovechando que DetectionBench fija el protocolo de evaluacion y las metricas.
- Conteo de trafico aereo con revision humana: procesar fotogramas de dron para estimar el numero de coches en una via o interseccion. Es adecuado para la clase car (29,6 mAP@50), pero los recuentos deben validarse manualmente dado el mAP global del 12,28 %.
- Preanotacion de datasets aereos: generar cajas candidatas sobre nuevo material de dron para que anotadores humanos las corrijan, reduciendo el tiempo de etiquetado. La precision declarada (19,73 %) implica mucho ruido, por lo que solo tiene sentido con un paso de curación obligatorio.
- Analisis retrospectivo de grabaciones de vigilancia: pasar lotes de video aereo por el modelo para localizar fotogramas con vehiculos relevantes y priorizar la revision posterior por un operador.
- Monitorizacion de ocupacion en infraestructuras vistas desde el aire (aparcamientos, areas de servicio, puertos), con la salvedad de que la clase dominante y fiable es car.
- Componente de un pipeline de vision mas amplio: usar las detecciones como entrada a un tracker o a un clasificador de segunda etapa, aceptando que la calidad de las cajas limita el resultado aguas abajo.
- Formacion y docencia: ejemplo practico de afinado de YOLOv8m sobre un dataset de dominio especifico y de evaluacion con metricas estandar (mAP@50, mAP@50-95, precision, recall, F1).
- Despliegue embarcado en dron para tareas de asistencia, no de decision autonoma, siempre que se anada verificacion en tierra.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la particion de test de UAVDT (todos marcados como no verificados en el model-index):

| Metrica | Valor (%) | Particion | Verificada |
|---|---|---|---|
| mAP@50 | 12,28 | test | no |
| mAP@50-95 | 7,05 | test | no |
| Precision | 19,73 | test | no |
| Recall | 25,33 | test | no |
| F1 | 22,18 | test | no |

Rendimiento por clase declarado en la ficha:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 29,6 | 16,08 |
| truck | 2,36 | 1,45 |
| bus | 4,87 | 3,61 |

Comparacion con el resto del zoologico de modelos evaluados por DetectionBench sobre UAVDT, segun la tabla publicada en la model card:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Medium | 15,02 | 8,76 | 40,28 | 61,14 |
| RF-DETR Small | 14,89 | 8,92 | 38,83 | 61,65 |
| YOLOv26s | 14,09 | 7,91 | 23,88 | 27,05 |
| RF-DETR Nano | 12,96 | 7,33 | 37,12 | 55,4 |
| YOLOv26m | 12,32 | 6,66 | 19,44 | 25,83 |
| YOLOv8m (este modelo) | 12,28 | 7,05 | 19,73 | 25,33 |
| YOLOv11x | 11,98 | 6,68 | 18,7 | 25,93 |
| YOLOv8s | 11,48 | 6,71 | 19,34 | 23,39 |
| YOLOv8n | 10,79 | 6,42 | 18,61 | 24,58 |

No se han publicado en la informacion disponible otros benchmarks (por ejemplo COCO, MMLU o HumanEval) que no sean los de deteccion sobre UAVDT.

## Requisitos de hardware

- Pesos en disco: aproximadamente 104 MB en FP32 (25,9 M de parametros a 4 bytes) y unos 52 MB en FP16, calculo aritmetico a partir del numero de parametros; el repositorio completo ocupa 0,1 GB.
- VRAM para inferencia: no hay cifras publicadas. Por tamano de pesos y naturaleza del modelo, cabe con holgura en GPUs de gama de entrada; la memoria necesaria en la practica dependera del tamano de entrada, del lote y del backend de ejecucion, datos que la ficha no especifica.
- GPU recomendadas: cualquier GPU consumer moderna sirve, incluidas RTX 3060, RTX 4060, RTX 4070 y RTX 4090. Para entrenamiento o lotes grandes tiene sentido usar A100 o H100, pero no son necesarias para inferencia.
- Si cabe en GPU consumer: si, con margen amplio; es esperable que funcione incluso en GPUs con 4 GB de VRAM a resoluciones y lotes moderados, aunque no hay cifras oficiales que lo confirmen.
- Despliegue embarcado: por tamano, es candidato razonable para plataformas tipo NVIDIA Jetson, extremo no documentado en la ficha.
- Opciones de despliegue: la ruta documentada es Ultralytics (`pip install ultralytics huggingface_hub` y carga del checkpoint con la clase `YOLO`). El ecosistema Ultralytics admite exportacion a ONNX, TensorRT, OpenVINO, CoreML y TFLite, pero la ficha no documenta ninguna de estas rutas para este checkpoint concreto. vLLM, llama.cpp, Ollama y TGI no aplican: son servidores de modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparativa dentro del mismo benchmark y protocolo de evaluacion (UAVDT, particion de test). Los parametros, la licencia y la disponibilidad de las alternativas no constan en la informacion proporcionada.

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall | Parametros | Licencia |
|---|---|---|---|---|---|---|
| RF-DETR Medium | 15,02 | 8,76 | 40,28 | 61,14 | no disponible | no disponible |
| YOLOv26m | 12,32 | 6,66 | 19,44 | 25,83 | no disponible | no disponible |
| YOLOv8m (este modelo) | 12,28 | 7,05 | 19,73 | 25,33 | 25,9 M | AGPL-3.0 |
| YOLOv8s | 11,48 | 6,71 | 19,34 | 23,39 | no disponible | no disponible |

Lectura de la tabla: RF-DETR Medium lidera en mAP@50 y, sobre todo, en precision y recall (40,28 % y 61,14 % frente a 19,73 % y 25,33 %), una diferencia mucho mayor que la que sugiere el mAP. YOLOv26m queda practicamente empatado con este YOLOv8m en mAP@50 (12,32 frente a 12,28). YOLOv8s, un modelo mas pequeno de la misma familia, se queda ligeramente por debajo en mAP@50 pero muy cerca en mAP@50-95 (6,71 frente a 7,05).

La longitud de contexto no es un parametro comparable: ninguno de estos modelos procesa texto.

## Limitaciones y advertencias

- Rendimiento bajo en terminos absolutos: 12,28 % de mAP@50 y 7,05 % de mAP@50-95 sobre UAVDT no bastan para un despliegue automatico sin supervision humana.
- Desequilibrio severo entre clases: truck (2,36 mAP@50) y bus (4,87 mAP@50) son practicamente inutilizables, mientras que car alcanza 29,6. Cualquier uso debe limitarse de facto a la clase car o requerir reentrenamiento.
- Precision y recall bajos (19,73 % y 25,33 %) implican simultaneamente falsos positivos y falsos negativos abundantes; conviene revisar la matriz de confusion incluida en el repositorio antes de reutilizar el modelo.
- Metricas no verificadas: el propio model-index marca los resultados como `verified: false`, y proceden del pipeline del autor, no de una evaluacion independiente.
- Sesgo de dominio: el modelo esta afinado exclusivamente sobre UAVDT. Su comportamiento en otras condiciones de altitud, camara, iluminacion, clima o geografia no se ha evaluado y no puede asumirse.
- Riesgo de degradacion en objetos pequenos y en escenas densas, inherente a la deteccion aerea de vehiculos; la ficha no aporta analisis por tamano de objeto.
- Sin informacion sobre composicion del dataset de entrenamiento, lo que impide auditar sesgos demograficos, geograficos o de clase vehicular.
- No apto para decisiones criticas de seguridad, control de trafico automatizado sancionador ni cualquier aplicacion donde un falso negativo tenga consecuencias graves.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero ofrece obligaciones relevantes, en particular la de poner a disposicion el codigo fuente correspondiente si el modelo se ofrece como servicio a traves de una red. Conviene revisar las condiciones con asesoramiento juridico antes de integrarlo en un producto.
- La licencia del dataset UAVDT es independiente de la del modelo; consultar la ficha del dataset para conocer las condiciones de uso de los datos.
- La model card disponible esta truncada (el apartado de uso termina en "### R"), por lo que podrian existir instrucciones adicionales no recogidas aqui.
- No aplica ninguna consideracion sobre alucinacion en lenguaje natural, tool calling, agentes o limites de contexto: son capacidades que el modelo no tiene.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/dronefreak/uavdt-yolov8m
- Dataset UAVDT utilizado: https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench (marco de evaluacion y fuente declarada de las metricas): https://github.com/dronefreak/DetectionBench
- Modelo base Ultralytics YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
- Video de demostracion incluido en el repositorio: https://huggingface.co/dronefreak/uavdt-yolov8m/resolve/main/assets/demo_banner.mp4
- Imagen de portada del video de demostracion: https://huggingface.co/dronefreak/uavdt-yolov8m/resolve/main/assets/demo_banner_poster.jpg
- Identificadores arXiv listados en las etiquetas del repositorio, sin titulo ni contenido verificados en la informacion disponible: arXiv:1804.00518, arXiv:2511.09554, arXiv:2304.07193, arXiv:2410.17725, arXiv:2606.03748
- Nota sobre la busqueda web: las consultas realizadas solo devolvieron paginas de Google Traduccion, sin ningun resultado relevante sobre este modelo, su dataset o su marco de evaluacion. No se ha podido ampliar informacion por esa via.
