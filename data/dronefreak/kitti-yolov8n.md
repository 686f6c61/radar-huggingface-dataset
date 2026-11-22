# dronefreak/kitti-yolov8n

## Resumen

`dronefreak/kitti-yolov8n` es un detector de objetos YOLOv8n (la variante "nano" de Ultralytics) afinado sobre el conjunto de datos KITTI para deteccion en escenas de calle. Lo publica el usuario dronefreak como parte de DetectionBench, un framework cuyo objetivo es reproducir recetas de entrenamiento identicas y una misma pipeline de evaluacion para comparar detectores modernos sobre varios datasets reales. El modelo parte de los pesos preentrenados de `Ultralytics/YOLOv8` y se reentrena con las anotaciones de KITTI, orientadas a conduccion autonoma y sistemas de asistencia al conductor (ADAS).

Se trata de un modelo de vision por computador, no de un modelo de lenguaje: es un detector de una sola etapa de la familia YOLO, con aproximadamente 3,02 millones de parametros (3,2 M segun la model card) y 8,7 GFLOPs a 640 px. Su interes practico esta en ser un punto de referencia ligero y reproducible dentro del zoo de modelos KITTI de DetectionBench, lo que permite comparar arquitecturas y escalas bajo condiciones controladas.

La relevancia actual es doble: por un lado ofrece un checkpoint listo para usar con la libreria `ultralytics` en tareas de deteccion de coches, peatones, ciclistas, camiones y tranvias; por otro, forma parte de un esfuerzo de benchmarking transparente en el que todos los modelos se evaluan con la misma pipeline (`detectionbench-evaluate`), lo que facilita decisiones de seleccion de modelo con datos comparables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (detector de una etapa, CNN, familia Ultralytics) |
| Parametros totales | 3.022.808 (3,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen, 640 px en la referencia de FLOPs) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `best.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors y `best.pt` (PyTorch, libreria `ultralytics`) |

## Arquitectura y entrenamiento

YOLOv8 es un detector de objetos de una sola etapa con backbone CNN y cabecera de deteccion sin anclas (anchor-free), con asignacion dinamica de etiquetas y las mejoras habituales de la familia Ultralytics respecto a versiones anteriores. La variante "n" (nano) es la mas pequena de la gama y esta pensada para inferencia de baja latencia en hardware modesto. El checkpoint tiene 3,2 M de parametros y 8,7 GFLOPs a 640 px.

El entrenamiento consiste en un afinado (fine-tuning) de los pesos de `Ultralytics/YOLOv8` sobre KITTI, usando el dataset `dronefreak/KITTI` y la receta estandar de DetectionBench, que busca que todos los detectores comparados se entrenen y evaluen con la misma configuracion. La model card no detalla el numero de tokens ni de imagenes, la composicion exacta del split, la duracion del entrenamiento ni si se aplicaron tecnicas de aumento de datos especificas; esos datos figuran como no disponibles. La evaluacion se realiza sobre el split de validacion de KITTI con la pipeline `detectionbench-evaluate`.

## Capacidades

- Deteccion de objetos en imagenes de escenas de calle: coches, peatones, ciclistas, camiones, furgonetas, tranvias, personas sentadas y clase "misc".
- Localizacion con cajas delimitadoras y etiquetas de clase, en formato compatible con `ultralytics`.
- Inferencia sobre imagen individual, lotes y flujos de video mediante `model.predict(source=...)`.
- Ajuste fino adicional sobre otros datasets de deteccion usando la misma API de Ultralytics.
- Exportacion a formatos de despliegue soportados por Ultralytics (ONNX, TensorRT, etc.), segun la documentacion de la libreria; la model card no lista los formatos concretos probados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No incluye vision-lenguaje ni modos de "thinking"; es exclusivamente un detector visual.

## Casos de uso

- Deteccion de vehiculos y peatones en prototipos de ADAS: el modelo identifica coches, peatones y ciclistas en imagenes de calle, y su tamano reducido permite ejecutarlo en tiempo real sobre hardware embebido o GPU de gama media.
- Preetiquetado de datasets de conduccion: al ser un checkpoint ya afinado en KITTI, sirve para generar cajas candidatas sobre nuevas imagenes y reducir el trabajo manual de anotacion antes de una revision humana.
- Baseline reproducible en investigacion: DetectionBench permite comparar este YOLOv8n con otras variantes (YOLO11, YOLO26, YOLOv9) bajo la misma receta, por lo que es util como referencia inferior de la escala nano en estudios de ablacion.
- Vigilancia de trafico en video: con `model.predict` sobre fotogramas sucesivos se puede contar o rastrear vehiculos y peatones en camaras urbanas, aceptando el coste de precision que implica la variante nano.
- Sistemas de alerta en vehiculos de bajo consumo: al requerir solo 8,7 GFLOPs a 640 px, puede integrarse en dispositivos con recursos limitados para avisos basicos de presencia de peatones o vehiculos.
- Educacion y prototipado rapido: la API de Ultralytics y la disponibilidad del checkpoint en Hugging Face permiten montar una demo funcional de deteccion en pocas lineas de codigo, util para cursos y pruebas de concepto.
- Analisis de escenas KITTI en pipelines de investigacion: sirve para reproducir los resultados publicados y validar nuevas tecnicas de evaluacion con la misma pipeline del autor.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de validacion de KITTI (no verificados de forma independiente):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 40,11 |
| mAP@50-95 | 24,75 |
| Precision | 46,05 |
| Recall | 41,85 |
| F1 | 43,85 |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 (%) | mAP@50-95 (%) |
|---|---|---|
| Car | 89,95 | 67,33 |
| Pedestrian | 59,14 | 28,22 |
| Cyclist | 44,36 | 26,29 |
| Truck | 37,68 | 25,19 |
| Van | 34,89 | 23,79 |
| Tram | 20,14 | 11,25 |
| Person_sitting | 19,23 | 6,59 |
| Misc | 15,51 | 9,32 |

Comparativa dentro del zoo KITTI de DetectionBench (mAP@50 / mAP@50-95 / Precision / Recall):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26x | 43,73 | 25,96 | 64,17 | 41,28 |
| YOLO26n | 42,54 | 25,43 | 48,62 | 42,84 |
| YOLO11s | 42,00 | 25,10 | 47,27 | 43,71 |
| YOLOv8s | 41,99 | 25,20 | 49,02 | 43,66 |
| YOLO26m | 41,91 | 25,78 | 63,34 | 39,71 |
| YOLO26s | 41,79 | 26,54 | 59,64 | 42,42 |
| YOLOv9t | 41,60 | 25,73 | 48,30 | 44,20 |
| YOLOv9s | 40,84 | 25,92 | 54,27 | 41,51 |
| YOLOv8m | 40,48 | 25,37 | 50,81 | 39,86 |
| **YOLOv8n (este modelo)** | **40,11** | **24,75** | **46,05** | **41,85** |
| YOLO11x | 39,18 | 23,60 | 46,28 | 41,69 |
| YOLO11n | 38,77 | 23,97 | 52,84 | 40,19 |

## Requisitos de hardware

- VRAM estimada: muy baja; con 3,2 M de parametros el modelo ocupa unos pocos MB en memoria, y la mayor parte del consumo proviene de las activaciones de imagen (8,7 GFLOPs a 640 px). Una GPU consumer con 2-4 GB es suficiente para inferencia.
- GPU recomendadas: cualquier GPU moderna sirve; para maxima latencia, RTX 3060/4060/4090, A100 o H100. En CPU tambien es viable para inferencia por lotes pequenos, aunque con mayor latencia.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada e incluso en iGPU recientes, dado el reducido numero de parametros.
- Opciones de despliegue: libreria `ultralytics` (PyTorch) como via principal; exportacion a ONNX y TensorRT soportada por Ultralytics (no confirmada en la model card para este checkpoint concreto); despliegue en servidores de inferencia compatibles con ONNX Runtime. No se documenta soporte nativo de vLLM, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Los 8,7 GFLOPs a 640 px permiten estimar una latencia de pocos milisegundos en GPU moderna, pero no hay cifras publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@50 (KITTI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv8n (este modelo) | 3,2 M | imagen 640 px | 40,11 | AGPL-3.0 | Hugging Face |
| YOLO11n | no disponible | imagen (Ultralytics) | 38,77 | AGPL-3.0 (Ultralytics) | Hugging Face / Ultralytics |
| YOLO26n | no disponible | imagen (Ultralytics) | 42,54 | no disponible | Hugging Face / DetectionBench |
| YOLOv8s | no disponible | imagen 640 px | 41,99 | AGPL-3.0 | Hugging Face |
| YOLOv9t | no disponible | imagen | 41,60 | GPL-3.0 (familia YOLOv9) | Hugging Face |

La comparativa se limita a los modelos del zoo KITTI de DetectionBench, ya que no hay datos de otros detectores evaluados con la misma pipeline en la informacion disponible. Destaca que YOLO26n supera a este YOLOv8n en mAP@50 con una escala similar, mientras que YOLO11n queda por debajo en esta metrica concreta.

## Limitaciones y advertencias

- Precision modesta: mAP@50 de 40,11 % y mAP@50-95 de 24,75 % en KITTI; clases como "Misc" (15,51 %), "Person_sitting" (19,23 %) y "Tram" (20,14 %) tienen un rendimiento bajo y no son fiables en produccion.
- Fuerte desequilibrio por clase: "Car" alcanza 89,95 % de mAP@50, mientras que el resto de clases queda muy por debajo; el modelo esta sesgado hacia la clase dominante del dataset.
- Resultados no verificados: las metricas proceden de la model card del autor y no han sido validadas de forma independiente.
- Dominio limitado: entrenado sobre KITTI, con condiciones de captura, camaras y geografia especificas; el rendimiento puede degradarse en otros dominios (camaras aereas, nocturnas, climas adversos) sin reentrenamiento.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el codigo que distribuya el modelo o derivados; para uso comercial cerrado es necesario revisar la compatibilidad o negociar una licencia alternativa con Ultralytics.
- Sin informacion sobre sesgos demograficos ni etnicos: no se documentan evaluaciones de equidad, lo que es relevante en deteccion de peatones para sistemas de seguridad.
- Sin datos de cuantizacion ni de despliegue en formatos especificos: la model card no detalla variantes INT8/FP16 ni benchmarks de latencia.
- Riesgo de falsos negativos en objetos pequenos o parcialmente ocluidos, habitual en detectores de escala nano; debe validarse en el caso de uso concreto antes de desplegar en sistemas de seguridad critica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/kitti-yolov8n
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Dataset KITTI en Hugging Face: https://huggingface.co/datasets/dronefreak/KITTI
- Modelo base Ultralytics YOLOv8: https://huggingface.co/Ultralytics/YOLOv8
- Documentacion de Ultralytics: https://docs.ultralytics.com/
- Demo (video): https://huggingface.co/dronefreak/kitti-yolov8n/resolve/main/assets/demo_banner.mp4
