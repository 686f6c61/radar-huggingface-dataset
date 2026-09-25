# dronefreak/kitti-yolo26m

## Resumen

dronefreak/kitti-yolo26m es un detector de objetos de la familia YOLO26 de Ultralytics, en su escala "m" (21,9 millones de parametros), ajustado por el usuario dronefreak sobre el conjunto de datos KITTI. No es un modelo de lenguaje: es una red convolucional de deteccion en una sola etapa que predice cajas delimitadoras sobre ocho clases propias de escenas de trafico (Car, Cyclist, Misc, Pedestrian, Person_sitting, Tram, Truck y Van). El checkpoint se publica como parte de DetectionBench, un marco de trabajo que entrena y evalua detectores modernos con la misma receta y las mismas metricas para que los resultados sean comparables entre si.

Su relevancia es fundamentalmente metodologica: en lugar de presentar un modelo aislado con numeros de dudosa comparabilidad, forma parte de un zoo de modelos KITTI (YOLO26n/s/m, YOLO11n/s/x, YOLOv8n/s/m, YOLOv9t/s) evaluados bajo un unico pipeline. En la val split de KITTI, este checkpoint obtiene 41,91 % de mAP@50 y 25,78 % de mAP@50-95, con 63,34 % de precision y 39,71 % de recall, valores que lo situan en la zona media del zoo: es el segundo mejor de la tabla en mAP@50-95 pese a no ser el que mejor mAP@50 logra.

La ficha se completa con la licencia AGPL-3.0, un tamano de repositorio de 0,1 GB, pesos en formato PyTorch a traves de la libreria ultralytics y una entrada de imagen a 640 px con 75,4 GFLOPs por inferencia. El modelo no declara datos de idioma (no aplica), no documenta hiperparametros de entrenamiento ni regimen de cuantizacion, y las metricas publicadas estan marcadas como no verificadas por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional de deteccion de objetos en una sola etapa, familia Ultralytics YOLO26, escala "m" (la model card no detalla los bloques internos) |
| Parametros totales | 21,9 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); entrada de imagen a 640 px |
| Tipos de cuantizacion | no documentados en la model card; el ecosistema Ultralytics permite exportar a FP16 e INT8 mediante ONNX, TensorRT u OpenVINO. No verificado para este checkpoint |
| Idiomas soportados | no aplica (vision por computador); las etiquetas del dataset estan en ingles |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt) mediante la libreria ultralytics; repositorio de 0,1 GB (no se documentan otros formatos) |
| Tarea | object-detection (deteccion de objetos 2D) |
| Modelo base | Ultralytics/YOLO26 (escala m), ajuste fino sobre KITTI |
| Dataset de entrenamiento | dronefreak/KITTI |
| Numero de clases | 8 (Car, Cyclist, Misc, Pedestrian, Person_sitting, Tram, Truck, Van) |
| Coste computacional | 75,4 B (FLOPs) a 640 px, segun la model card |
| Framework de publicacion | ultralytics |
| Autor | dronefreak |
| Fecha de creacion (metadatos) | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un ajuste fino (finetune) del checkpoint Ultralytics/YOLO26 en su variante "m" sobre el dataset KITTI, dentro del marco DetectionBench. La model card no describe la arquitectura interna mas alla de identificarla con la familia YOLO26 y no aporta detalle sobre el numero de tokens de imagen, el backbone, la cabeza de deteccion ni la estrategia de asignacion de etiquetas. Tampoco se documentan epocas, tamano de lote, tasa de aprendizaje, aumentos de datos, ni si hubo una fase adicional de refinamiento (RLHF, DPO u optimizacion de preferencias), algo que en cualquier caso no aplica a un detector de objetos.

La informacion disponible si permite reconstruir el protocolo de evaluacion: las metricas se calculan sobre la split de validacion de KITTI con el pipeline estandar `detectionbench-evaluate`, y el objetivo declarado del proyecto es emplear recetas de entrenamiento identicas entre modelos para que las comparaciones sean justas. El autor publica el zoo completo de modelos KITTI con sus resultados, lo que permite auditar la comparativa. No hay informacion sobre la innovacion tecnica concreta de YOLO26 frente a generaciones anteriores en esta ficha; la documentacion oficial de Ultralytics describe la familia como modelos "end-to-end" para vision en tiempo real.

## Capacidades

- Deteccion de objetos 2D en escenas de trafico: devuelve cajas delimitadoras con clase y puntuacion de confianza para las ocho clases de KITTI.
- Reconocimiento de vehiculos: coches, furgonetas (Van), camiones (Truck) y tranvias (Tram) como clases separadas.
- Reconocimiento de usuarios vulnerables de la via: clase Cyclist (mAP@50 58,33 %) y clase Pedestrian (mAP@50 65,66 %).
- Inferencia sobre imagenes sueltas o secuencias de video (frame a frame); el modelo no incorpora seguimiento temporal (tracking) por si mismo.
- Exportacion a otros formatos de despliegue a traves de la libreria ultralytics (ONNX, TensorRT, OpenVINO, TFLite, entre otros), aunque no verificada para este checkpoint concreto.
- Capacidades multilingues: no aplica. Capacidades de generacion de texto, razonamiento, codigo, matematicas, audio o tool calling: no aplica, es un modelo puramente visual.
- No dispone de modo de razonamiento (thinking mode), ni de soporte de agentes, ni de function calling.

## Casos de uso

- Pre-etiquetado y anotacion asistida: el detector puede generar cajas candidatas sobre fotogramas de KITTI o de dominios similares para reducir el coste de etiquetado manual. Conviene usarlo como primer paso con revision humana, dado el recall de 39,71 % y las clases con mAP muy bajo (Person_sitting, 5,35 % de mAP@50).
- Prototipado de ADAS y conduccion autonoma en investigacion: integrado en un nodo ROS 2 que consuma el topic de camara, publique detecciones a 640 px y alimente modulos de fusion o planificacion. Su ontologia de ocho clases coincide con la de KITTI, lo que facilita comparar resultados con la literatura academica de forma directa.
- Analisis de trafico y aforo urbano: conteo de vehiculos por clase sobre video, combinado con un tracker externo (por ejemplo ByteTrack) para estimar flujos. La clase Tram y la distincion Van/Truck/Car permiten desagregar el aforo con mas detalle que un detector generico de COCO.
- Seguridad vial y proteccion de usuarios vulnerables: deteccion de ciclistas y peatones en grabaciones de trafico para estudios de puntos negros o auditorias de infraestructura, aprovechando el 58,33 % de mAP@50 en Cyclist y el 65,66 % en Pedestrian.
- Vigilancia y monitorizacion ferroviaria: la clase Tram permite detectar unidades de tranvia en cruces e imagenes de via, util para sistemas de aviso o de analitica de material movil en entornos urbanos.
- Benchmarking reproducible de detectores: emplear el checkpoint como referencia dentro de DetectionBench para comparar variantes de arquitectura, resoluciones de entrada o estrategias de cuantizacion bajo una metrica identica.
- Despliegue en hardware embarcado y de borde: con 21,9 M de parametros y 75,4 GFLOPs a 640 px, el modelo es candidato a exportarse a TensorRT o OpenVINO sobre Jetson Orin, GPU de portatil o incluso CPU moderna para prototipos de bajo coste.
- Docencia y proyectos academicos de vision por computador: la licencia AGPL-3.0 y la disponibilidad de pesos y pipeline de evaluacion facilitan reproducir experimentos completos en un curso o trabajo fin de master.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (todos marcados como `verified: false`, es decir, no verificados por terceros). Evaluados sobre la split de validacion de KITTI con `detectionbench-evaluate`.

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 41,91 |
| mAP@50-95 | 25,78 |
| Precision | 63,34 |
| Recall | 39,71 |
| F1 | 48,81 |
| Parametros | 21,9 M |
| FLOPs | 75,4 B (a 640 px) |

Rendimiento por clase sobre la val split de KITTI:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| Car | 90,71 | 68,18 |
| Pedestrian | 65,66 | 31,38 |
| Cyclist | 58,33 | 31,46 |
| Van | 42,93 | 29,12 |
| Truck | 34,98 | 24,36 |
| Tram | 24,44 | 13,90 |
| Misc | 12,87 | 6,31 |
| Person_sitting | 5,35 | 1,55 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, sobre COCO u otros datasets) en la informacion disponible.

## Requisitos de hardware

- Huella de pesos estimada: unos 88 MB en FP32, 44 MB en FP16 y 22 MB en INT8, a partir de los 21,9 M de parametros declarados.
- VRAM estimada para inferencia: por debajo de 1 GB a 640 px en FP16, sumando pesos y activaciones; 2 GB de VRAM es un margen comodo para lotes pequenos.
- Cabe sin problema en GPU de consumo: cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). Tambien es viable en iGPU recientes y en CPU para prototipos de baja tasa de fotogramas.
- Hardware embarcado: Jetson Orin, Jetson Xavier NX o Raspberry Pi 5 con backend NCNN/ONNX suponen opciones razonables por el tamano del modelo, aunque no hay cifras publicadas de latencia para este checkpoint.
- GPU de centro de datos (A100, H100, L40S): sobredimensionadas para una sola instancia de inferencia, pero utiles para procesar grandes lotes en paralelo durante evaluaciones o reentrenamientos.
- Opciones de despliegue: libreria ultralytics (PyTorch), ONNX Runtime, TensorRT, OpenVINO, TFLite y TorchScript mediante el exportador de Ultralytics. Herramientas de servido de modelos de lenguaje como vLLM, TGI, llama.cpp u Ollama no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card no publica mediciones de ms por imagen ni de FPS en ningun hardware.

## Comparativa con modelos similares

Comparativa con los otros checkpoints del zoo de KITTI publicado por DetectionBench, todos entrenados y evaluados con el mismo pipeline. Los parametros de los modelos alternativos no se detallan en la informacion disponible.

| Modelo (KITTI) | mAP@50 | mAP@50-95 | Precision | Recall | Parametros |
|---|---|---|---|---|---|
| YOLO26m (este checkpoint) | 41,91 | 25,78 | 63,34 | 39,71 | 21,9 M |
| YOLO26s | 41,79 | 26,54 | 59,64 | 42,42 | no disponible |
| YOLOv9s | 40,84 | 25,92 | 54,27 | 41,51 | no disponible |
| YOLO26n | 42,54 | 25,43 | 48,62 | 42,84 | no disponible |
| YOLO11s | 42,00 | 25,10 | 47,27 | 43,71 | no disponible |
| YOLOv8s | 41,99 | 25,20 | 49,02 | 43,66 | no disponible |
| YOLOv8m | 40,48 | 25,37 | 50,81 | 39,86 | no disponible |

Lectura de la tabla: YOLO26m es el segundo mejor del zoo en mAP@50-95 (25,78) por detras de YOLO26s (26,54), y el que mayor precision obtiene (63,34) a costa del recall mas bajo del grupo (39,71). Si el criterio es mAP@50, varias variantes mas pequenas (YOLO26n con 42,54, YOLO11s con 42,00) superan a este checkpoint, lo que sugiere que el ajuste fino de la escala "m" no aporta una ventaja clara en esa metrica con la receta empleada.

En cuanto a licencia, este checkpoint se distribuye bajo AGPL-3.0, la licencia habitual de los modelos de Ultralytics; las condiciones de los checkpoints de otras familias del zoo no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Recall bajo (39,71 %): implica falsos negativos frecuentes. En un sistema de seguridad activa (frenada de emergencia, aviso de colision) este valor es insuficiente sin umbrales ajustados y validacion adicional.
- Clases practicamente inutilizables: Person_sitting obtiene 5,35 % de mAP@50 y Misc 12,87 %. Cualquier producto que dependa de estas clases necesitara reentrenamiento o eliminarlas del flujo.
- Dominio muy restringido: KITTI son escenas de trafico diurnas grabadas con camara a bordo en entornos alemanes. No hay evidencia de generalizacion a conduccion nocturna, lluvia, nieve, camaras aereas, vision nocturna o geografias distintas.
- Sin capacidades temporales: el modelo es un detector por fotograma, no un tracker. Cualquier caso de uso con seguimiento requiere un modulo externo.
- Entrada fija a 640 px en las metricas publicadas: el rendimiento a otras resoluciones no esta documentado y puede degradarse notablemente en objetos pequenos o lejanos.
- Metricas no verificadas: los valores del model-index estan marcados como `verified: false`. No hay confirmacion independiente de mAP@50, mAP@50-95, precision ni recall.
- Ausencia de documentacion de entrenamiento: no se publican hiperparametros, numero de epocas, composicion exacta del split ni estrategia de aumentos, lo que dificulta reproducir el ajuste fino con exactitud.
- Licencia AGPL-3.0: es copyleft fuerte y su clausula de red obliga a liberar el codigo fuente de servicios ofrecidos por red que usen el modelo. Para productos propietarios o SaaS cerrados supone una restriccion relevante; puede requerir licencia comercial de Ultralytics.
- Adopcion nula y sin soporte: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, sin issues ni comunidad que reporten fallos.
- Riesgo de sesgo de dataset: KITTI tiene una distribucion de clases muy desequilibrada, lo que se refleja en el rendimiento por clase y puede penalizar sistematicamente a clases minoritarias en produccion.
- Metadatos a verificar: las fechas del repositorio (2026) y los identificadores arXiv incluidos en las etiquetas (2606.03748, 2410.17725, 2402.13616) no son trazables de forma fiable con la informacion disponible, por lo que no deben citarse como fuente sin comprobacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/kitti-yolo26m
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Dataset KITTI usado en el ajuste fino: https://huggingface.co/datasets/dronefreak/KITTI
- Repositorio DetectionBench (recetas y evaluacion): https://github.com/dronefreak/DetectionBench
- Documentacion oficial de Ultralytics YOLO26: https://docs.ultralytics.com/models/yolo26
- Checkpoints relacionados del mismo autor: https://huggingface.co/dronefreak/kitti-yolo26n y https://huggingface.co/dronefreak/uavdt-yolo26m
- Pagina de la escala YOLO26m en Ultralytics Platform: https://platform.ultralytics.com/yasser-k/yolo26/yolo26m
- Referencias arXiv citadas en las etiquetas del repositorio: arXiv:2606.03748, arXiv:2410.17725, arXiv:2402.13616 (titulos y contenido no verificados en la informacion disponible)
