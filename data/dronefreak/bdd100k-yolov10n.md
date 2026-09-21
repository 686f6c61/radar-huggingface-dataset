# dronefreak/bdd100k-yolov10n

## Resumen

YOLOv10n finetuneado sobre BDD100K es un detector de objetos de una sola etapa publicado por el usuario dronefreak bajo el identificador `dronefreak/bdd100k-yolov10n`. Se trata de un ajuste fino del checkpoint nano de la familia YOLOv10 (modelo base declarado: `Ultralytics/YOLOv10`), orientado a la deteccion de 10 clases de escenas de conduccion: person, rider, car, truck, bus, train, motor, bike, traffic light y traffic sign. Con 2,8 millones de parametros y 8,7 GFLOPs a 640 px, es un modelo de escala "nano" pensado para inferencia en tiempo real en hardware limitado.

El modelo se ha entrenado y evaluado dentro de DetectionBench, un framework cuyo objetivo es reproducir benchmarks de detectores modernos con recetas de entrenamiento y metricas de evaluacion identicas entre datasets. En la practica, esto lo convierte en una pieza de comparacion controlada frente a otros detectores (YOLOv8n, YOLOv9t) sobre el mismo split de test de BDD100K, mas que en un modelo de produccion con validacion externa.

Su relevancia actual es doble: por un lado, ofrece un baseline reproducible de deteccion en escenas de trafico con licencia AGPL-3.0 y pesos derivados de YOLOv10; por otro, arrastra las restricciones de BDD100K, cuyo uso esta limitado a investigacion y educacion no comercial con registro previo y prohibicion de redistribucion. El repositorio presenta 0 descargas y 0 likes, y las metricas declaradas estan marcadas como no verificadas (`verified: false`), por lo que deben tratarse como resultados autoinformados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detectores de una etapa de la familia YOLOv10 (red convolucional, sin NMS en inferencia). Detalles internos de capas no disponibles |
| Parametros totales | 2,8 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de imagen, 640 px segun FLOPs declarados) |
| Tipos de cuantizacion | No especificado en la model card. La libreria declarada (Ultralytics) permite exportar a ONNX, TensorRT, OpenVINO, TFLite o CoreML en FP16/INT8, pero no hay artefactos de este tipo publicados |
| Idiomas soportados | No aplica; las etiquetas de clase estan en ingles |
| Licencia | AGPL-3.0 |
| Formato de pesos | No confirmado en la informacion disponible. La libreria declarada es `ultralytics`, que usa checkpoints `.pt`. El tamano del repositorio aparece como 0.0 GB, por lo que los pesos podrian no estar subidos |
| Tarea | object-detection |
| Dataset de entrenamiento | BDD100K (10 clases) |
| Resolucion de entrada | 640 px (inferida de los 8,7 GFLOPs declarados a 640 px) |
| Modelo base | Ultralytics/YOLOv10 (variante n) |
| Framework | Ultralytics |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-20T21:16:33Z |
| Ultima actualizacion (metadatos) | 2026-09-20T21:16:41Z |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de identificar el modelo base como YOLOv10 en su variante nano y el framework Ultralytics. YOLOv10 es una familia de detectores de una etapa de tipo convolucional que introduce un esquema de asignacion dual consistente para eliminar la necesidad de supresion de no maximos (NMS) en inferencia, junto con decisiones de diseno orientadas a reducir latencia sin perder precision (rediseno de bloques guiado por ranking, cabeza de clasificacion ligera y downsampling desacoplado espacial/canal). Los detalles concretos de configuracion del backbone y de la cabeza para este checkpoint no estan disponibles en la informacion proporcionada.

En cuanto al entrenamiento, solo se indica que el modelo fue ajustado sobre BDD100K (10 clases: person, rider, car, truck, bus, train, motor, bike, traffic light y traffic sign) dentro del pipeline de DetectionBench, con recetas de entrenamiento homogeneas entre modelos para permitir comparaciones justas. No se especifica el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, el numero de epocas, la resolucion de entrenamiento, si hubo aumentos de datos, ni si se aplicaron tecnicas de alineacion tipo RLHF/DPO (no aplicables a un detector). Tampoco se documentan innovaciones tecnicas adicionales sobre el checkpoint base. BDD100K no se distribuye con el repositorio: debe descargarse desde el sitio oficial bajo su propia licencia, con registro previo y sin redistribucion.

## Capacidades

- Deteccion de objetos en imagenes de escenas de conduccion, con cajas delimitadoras para las 10 clases de BDD100K.
- Deteccion especifica de vehiculos: car, truck, bus, motor, bike y train (esta ultima con rendimiento nulo segun la tabla por clase).
- Deteccion de personas y riders (persona sobre bicicleta o motocicleta).
- Deteccion de elementos de infraestructura vial: traffic light y traffic sign.
- Inferencia de una sola etapa sin NMS, caracteristica de la familia YOLOv10, si el checkpoint mantiene el comportamiento del modelo base.
- Integracion con el ecosistema Ultralytics para entrenamiento, validacion, prediccion y exportacion a otros formatos.
- No dispone de generacion de texto, razonamiento, codigo ni capacidades multimodales.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje natural; solo etiquetas de clase).
- No se documentan modos especiales (thinking mode, vision-language, audio, segmentacion, pose o tracking) en la informacion disponible.

## Casos de uso

- Pre-anotacion automatica de datasets de conduccion: el modelo puede generar cajas candidatas sobre grandes volumenes de imagenes de trafico para que un anotador humano solo revise y corrija, reduciendo coste de etiquetado en proyectos de perception research.
- Baseline reproducible en benchmarking de detectores: gracias a su integracion en DetectionBench, sirve para comparar recetas de entrenamiento y arquitecturas bajo condiciones identicas sobre el split de test de BDD100K.
- Analitica de trafico urbano a partir de video de camaras fijas: conteo y clasificacion de vehiculos por tipo (car, truck, bus, motor, bike) y deteccion de peatones en escenas diurnas, con post-procesado de series temporales.
- Inventario de infraestructura vial: deteccion de traffic sign y traffic light para auditar el estado o la cobertura de senalizacion en recorridos grabados con dashcam.
- Prototipos ADAS de bajo coste: con 2,8 M de parametros y 8,7 GFLOPs, es viable desplegarlo en dispositivos embebidos (Jetson, Raspberry Pi con acelerador, NPU de movil) para pruebas de aviso de colision o de deteccion de peatones en entornos controlados.
- Analisis post-hoc de flotas y dashcams: procesado por lotes de grabaciones para localizar eventos con presencia de peatones, ciclistas o ciertos vehiculos, util en investigacion de siniestros o en estudios de exposicion al riesgo.
- Robotica movil y AGV en entornos urbanos simulados: percepcion de bajo consumo para navegacion basica, siempre que se acepte el rendimiento limitado del modelo.
- Educacion e investigacion: ejemplo listo para usar en cursos de vision por computador sobre deteccion en escenas de trafico, con pesos derivados de YOLOv10 y licencia AGPL-3.0.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (todos con `verified: false`). Evaluados sobre el split de test de BDD100K con el pipeline `detectionbench-evaluate`.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 51,95 |
| mAP@50-95 | 29,31 |
| Precision | 71,58 |
| Recall | 46,62 |
| F1 | 56,46 |
| Parametros | 2,8 M |
| FLOPs | 8,7 B (a 640 px) |

Comparativa dentro del mismo zoo de modelos de BDD100K de DetectionBench (misma receta y protocolo de evaluacion, segun la model card):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLOv9t | 52,04 | 29,46 | 71,34 | 46,72 |
| YOLOv10n (este modelo) | 51,95 | 29,31 | 71,58 | 46,62 |
| YOLOv8n | 51,67 | 29,09 | 70,95 | 46,59 |

Rendimiento por clase (mAP declarado por el autor):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| person | 60,90 | 30,39 |
| rider | 42,03 | 21,44 |
| car | 79,34 | 49,14 |
| truck | 61,53 | 44,66 |
| bus | 60,44 | 46,56 |
| train | 0,00 | 0,00 |
| motor | 40,00 | 18,88 |
| bike | 43,25 | 21,60 |
| traffic light | 64,58 | 24,60 |
| traffic sign | 67,48 | 35,84 |

La model card incluye ademas curvas PR y F1, matriz de confusion y matriz de confusion normalizada como imagenes (`BoxPR_curve.png`, `BoxF1_curve.png`, `confusion_matrix.png`, `confusion_matrix_normalized.png`), sin valores numericos asociados en el texto. No hay resultados de latencia, throughput ni comparaciones con detectores de otras familias en la informacion disponible.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 11,2 MB en FP32, 5,6 MB en FP16 y 2,8 MB en INT8 (calculo derivado de 2,8 M de parametros; no son cifras publicadas por el autor).
- VRAM estimada para inferencia: por debajo de 1 GB a 640 px y lote 1, incluyendo activaciones y buffers del runtime. El modelo cabe holgadamente en cualquier GPU consumer actual e incluso en iGPU.
- GPU recomendadas: RTX 3060/4060 o superiores para procesado por lotes a alta frecuencia; A100/H100 solo tendrian sentido para procesar conjuntos de datos muy grandes en paralelo, no por requisitos de memoria.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con mas de 1 GB de VRAM, y en CPU para inferencia a baja tasa de fotogramas.
- Opciones de despliegue: Ultralytics (Python), exportacion a ONNX Runtime, TensorRT, OpenVINO, TFLite, CoreML, NCNN; tambien es posible servir el modelo via TorchServe o integraciones tipo Triton con el backend correspondiente. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de deteccion de imagenes.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas en la informacion proporcionada; cualquier cifra dependeria del hardware, del backend de exportacion y del preprocesado de imagen.

## Comparativa con modelos similares

Comparacion con los otros dos detectores nano evaluados sobre BDD100K en el mismo zoo de DetectionBench:

| Modelo | Parametros | mAP@50 (BDD100K) | mAP@50-95 (BDD100K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dronefreak/bdd100k-yolov10n | 2,8 M | 51,95 | 29,31 | AGPL-3.0 | HuggingFace (repo de 0,0 GB; pesos no confirmados) |
| YOLOv9t (zoo BDD100K) | No disponible | 52,04 | 29,46 | No disponible en la informacion proporcionada | Referenciado en DetectionBench, sin URL de pesos |
| YOLOv8n (zoo BDD100K) | No disponible | 51,67 | 29,09 | No disponible en la informacion proporcionada | Referenciado en DetectionBench, sin URL de pesos |

Las tres variantes nano se situan dentro de una horquilla de 0,37 puntos de mAP@50 y 0,37 puntos de mAP@50-95, es decir, practicamente empatadas bajo esta receta. Las diferencias no permiten establecer una superioridad clara sin intervalos de confianza ni repeticiones de entrenamiento, datos que no se aportan. No hay informacion disponible sobre alternativas de otras familias (DETR, RT-DETR, Faster R-CNN) evaluadas con el mismo protocolo en este repositorio.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero obliga a liberar el codigo fuente derivado y, en el caso de ofrecer el modelo como servicio en red, tambien el codigo de la aplicacion que lo integra. Conviene revisarlo con asesoria legal antes de un despliegue en produccion.
- Restricciones del dataset: BDD100K se distribuye bajo su propia licencia, limitada a investigacion y educacion no comercial, con registro obligatorio y prohibicion de redistribucion. El modelo se ha entrenado con esos datos, lo que anade incertidumbre sobre el uso comercial del checkpoint derivado.
- Metricas no verificadas: todos los valores del model-index estan marcados como `verified: false` y proceden del propio autor. No hay evaluacion independiente.
- Clase train con mAP 0,00 en ambos umbrales: el modelo no detecta trenes de forma fiable. Cualquier caso de uso que dependa de esa clase queda descartado.
- Rendimiento desigual por clase: car alcanza 79,34 de mAP@50, mientras que motor (40,00), rider (42,03) y bike (43,25) se quedan muy por debajo. Los usuarios vulnerables de la via (motociclistas, ciclistas) son precisamente los peor detectados, lo que es critico en cualquier aplicacion de seguridad.
- Recall bajo (46,62 %): aproximadamente la mitad de los objetos presentes no se detectan al nivel de confianza evaluado; no es adecuado como unico sistema de seguridad.
- Falsos positivos y falsos negativos: al ser un detector, su principal riesgo no es la alucinacion textual sino las detecciones espurias y los objetos no detectados, con impacto directo en sistemas de aviso.
- Sin informacion sobre robustez: no hay datos de rendimiento por condiciones meteorologicas, nocturnas, de oclusion o de resolucion, factores decisivos en BDD100K y ausentes de la model card.
- Sesgos desconocidos: no se documentan analisis de sesgo por geografia, iluminacion, tipo de via o demografia de peatones.
- Repositorio potencialmente vacio: el tamano indicado es 0,0 GB y no se confirma que los pesos esten publicados. Conviene verificar la descarga del checkpoint antes de planificar cualquier integracion.
- Sin traccion ni validacion de la comunidad: 0 descargas y 0 likes en el momento de los metadatos; no hay informes de terceros sobre su comportamiento real.
- Idiomas: el modelo no procesa lenguaje natural, por lo que no aplica soporte multilingue; las etiquetas de clase estan en ingles.
- Contexto: al ser un detector de imagenes, no existe ventana de contexto textual; la limitacion equivalente es la resolucion de entrada (640 px) y el tamano maximo de objeto detectable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-yolov10n
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Dataset BDD100K (descarga oficial): https://www.bdd100k.com/
- Paper de YOLOv10 (referenciado en los tags, arXiv:2405.14458): https://arxiv.org/abs/2405.14458
- Paper de YOLOv9 (referenciado en los tags, arXiv:2402.13616): https://arxiv.org/abs/2402.13616
- Repositorio Ultralytics (framework declarado): https://github.com/ultralytics/ultralytics
- Visualizaciones de evaluacion en el repositorio del modelo: `BoxPR_curve.png`, `BoxF1_curve.png`, `confusion_matrix.png`, `confusion_matrix_normalized.png`
- Demo en video referenciada en la model card: `assets/demo_banner.mp4` y poster `assets/demo_banner_poster.jpg` dentro del repositorio de HuggingFace
- Busqueda web: no se han encontrado enlaces relevantes sobre este modelo. Los resultados devueltos corresponden a tutoriales sobre niveles en Autodesk Revit, sin relacion con el modelo.
