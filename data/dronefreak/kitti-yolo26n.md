# dronefreak/kitti-yolo26n

## Resumen

kitti-yolo26n es un detector de objetos YOLO26n afinado sobre el conjunto de datos KITTI, publicado por el usuario dronefreak como parte del proyecto DetectionBench, un marco de trabajo para comparar detectores modernos con recetas de entrenamiento y metricas de evaluacion identicas. El modelo parte de los pesos Ultralytics/YOLO26 y se especializa en escenas de calle y conduccion autonoma, cubriendo las ocho clases de KITTI: coche, ciclista, misc, peaton, persona sentada, tranvia, camion y furgoneta.

Se trata de un modelo convolutional de deteccion en tiempo real con 2.525.912 parametros (2,6 M) y 6,1 GFLOPs a 640 px, lo que lo situa en la gama nano de la familia YOLO. Su relevancia radica en que ofrece un punto de referencia reproducible y ligero para tareas de asistencia a la conduccion (ADAS), con pesos en formato PyTorch y safetensors y una integracion directa con la libreria ultralytics.

La ficha se apoya en los datos declarados por el autor en la model card y en el model-index; no se dispone de informacion sobre el proceso de entrenamiento mas alla de lo indicado, ni de resultados verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (familia YOLO, red convolutional de deteccion en una etapa); variante nano |
| Parametros totales | 2.525.912 (2,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors, PyTorch (best.pt) |
| Computo | 6,1 GFLOPs a 640 px |
| Tarea | Deteccion de objetos (object-detection) |
| Dataset de entrenamiento | dronefreak/KITTI |
| Modelo base | Ultralytics/YOLO26 |
| Libreria | ultralytics |
| Descargas | 28 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo es un YOLO26 en su variante nano, una red convolutional de deteccion en una sola etapa que predice cajas delimitadoras y clases directamente sobre la imagen de entrada. Con 2,6 M de parametros y 6,1 GFLOPs a 640 px, la variante nano prioriza la latencia y el consumo reducido frente a la precision maxima de las variantes mayores de la familia (x, m, s). El checkpoint se obtiene por ajuste fino (finetune) de los pesos Ultralytics/YOLO26 sobre KITTI.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset, el numero de epocas, el regimen de aumento de datos ni si se aplicaron tecnicas de destilacion o poda. La model card indica que el entrenamiento y la evaluacion se realizaron dentro de DetectionBench con una receta estandarizada y el pipeline `detectionbench-evaluate`, pero no detalla hiperparametros. No se documentan innovaciones tecnicas adicionales mas alla de las propias de la arquitectura YOLO26.

## Capacidades

- Deteccion de objetos en imagenes de escenas de calle con ocho clases de KITTI: Car, Cyclist, Misc, Pedestrian, Person_sitting, Tram, Truck y Van.
- Prediccion de cajas delimitadoras con puntuaciones de confianza por clase, apta para umbrales configurables (por ejemplo, `conf=0.25` en el ejemplo de uso).
- Inferencia sobre imagenes individuales mediante `model.predict(source=...)` de la libreria ultralytics.
- Capacidad de procesar video o secuencias de fotogramas al tratarse de un detector en tiempo real de la gama nano, aunque no se documentan tasas de fotogramas por segundo.
- Integracion con el ecosistema Ultralytics (entrenamiento, validacion, exportacion a otros formatos soportados por la libreria).
- No dispone de capacidades de lenguaje, tool calling, agentes, razonamiento multi-paso, vision multimodal ni audio; es exclusivamente un detector visual.

## Casos de uso

- Asistencia a la conduccion (ADAS): deteccion de coches, peatones, ciclistas y camiones en fotogramas de camara frontal para generar avisos de colision o de presencia de usuarios vulnerables de la via; el modelo esta afinado especificamente sobre las clases y la distribucion de KITTI.
- Analisis de trafico urbano: conteo y clasificacion de vehiculos y tranvias en secuencias de video de calles, aprovechando la clase Tram y el bajo coste computacional de la variante nano.
- Prototipado rapido en investigacion: linea base reproducible para comparar detectores con la misma receta de entrenamiento, gracias a la integracion con DetectionBench y a sus metricas publicadas.
- Despliegue en dispositivos con recursos limitados: con 2,6 M de parametros y 6,1 GFLOPs a 640 px, es candidato para ejecucion en CPU o GPU de gama baja en entornos embebidos, previa validacion de latencia.
- Etiquetado asistido de datos: preanotacion automatica de imagenes de escenas de calle para acelerar la creacion de nuevos conjuntos de datos, con revision humana posterior de las detecciones de baja confianza.
- Monitorizacion de aparcamiento o de accesos: deteccion de vehiculos y personas en imagenes fijas de camaras de vigilancia urbana, limitada a las clases de KITTI.
- Educacion y demostraciones: ejemplo ligero para ensenar pipelines de deteccion con Ultralytics y evaluacion con metricas COCO-style (mAP@50, mAP@50-95).

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de validacion de KITTI, con el pipeline `detectionbench-evaluate`. No estan verificados de forma independiente (`verified: false`).

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 42,54 |
| mAP@50-95 | 25,43 |
| Precision | 48,62 |
| Recall | 42,84 |
| F1 Score | 45,54 |
| Parametros | 2,6 M |
| FLOPs | 6,1 B (a 640 px) |

Comparativa dentro del KITTI Model Zoo de DetectionBench (mismos datos y receta, segun el autor):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26x | 43,73 | 25,96 | 64,17 | 41,28 |
| **YOLO26n (este modelo)** | **42,54** | **25,43** | **48,62** | **42,84** |
| YOLO11s | 42,00 | 25,10 | 47,27 | 43,71 |
| YOLOv8s | 41,99 | 25,20 | 49,02 | 43,66 |
| YOLO26m | 41,91 | 25,78 | 63,34 | 39,71 |
| YOLO26s | 41,79 | 26,54 | 59,64 | 42,42 |
| YOLOv9t | 41,60 | 25,73 | 48,30 | 44,20 |
| YOLOv9s | 40,84 | 25,92 | 54,27 | 41,51 |
| YOLOv8m | 40,48 | 25,37 | 50,81 | 39,86 |
| YOLOv8n | 40,11 | 24,75 | 46,05 | 41,85 |
| YOLO11x | 39,18 | 23,60 | 46,28 | 41,69 |
| YOLO11n | 38,77 | 23,97 | 52,84 | 40,19 |

Rendimiento por clase (mAP@50 / mAP@50-95, %):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| Car | 90,64 | 67,39 |
| Pedestrian | 64,65 | 29,31 |
| Cyclist | 49,32 | 27,60 |
| Van | 40,84 | 25,35 |
| Truck | 36,90 | 24,05 |
| Tram | 32,70 | 18,21 |
| Person_sitting | 14,98 | 6,12 |
| Misc | 10,31 | 5,39 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 2,6 M de parametros y 6,1 GFLOPs a 640 px, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer, incluso en tarjetas con 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA moderna (RTX 3060, RTX 4090, A100, H100); el modelo no requiere aceleradores de gama alta y puede ejecutarse en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en toda la gama actual; tambien es viable en hardware embebido tipo Jetson, aunque no se publican mediciones de latencia.
- Opciones de despliegue: libreria ultralytics (PyTorch) mediante `best.pt`; exportacion a otros formatos soportados por Ultralytics (no documentada en la model card); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput: no disponibles; no se han publicado mediciones de FPS ni de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP@50 (KITTI) | mAP@50-95 (KITTI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kitti-yolo26n | 2,6 M | no aplica | 42,54 | 25,43 | AGPL-3.0 | Hugging Face (dronefreak) |
| YOLO26x (KITTI) | no disponible | no aplica | 43,73 | 25,96 | AGPL-3.0 (Ultralytics) | Hugging Face (DetectionBench) |
| YOLO11s (KITTI) | no disponible | no aplica | 42,00 | 25,10 | AGPL-3.0 (Ultralytics) | Hugging Face (DetectionBench) |
| YOLOv8s (KITTI) | no disponible | no aplica | 41,99 | 25,20 | AGPL-3.0 (Ultralytics) | Hugging Face (DetectionBench) |
| YOLOv8n (KITTI) | no disponible | no aplica | 40,11 | 24,75 | AGPL-3.0 (Ultralytics) | Hugging Face (DetectionBench) |

La comparativa se limita a los modelos del KITTI Model Zoo publicados por el mismo autor con la misma receta; no se dispone de parametros ni de datos de otros detectores comparables fuera de ese conjunto.

## Limitaciones y advertencias

- Resultados no verificados: todas las metricas del model-index tienen `verified: false`; proceden del propio autor y no han sido replicadas de forma independiente.
- Rendimiento muy desigual por clase: Car alcanza 90,64 de mAP@50, mientras que Misc (10,31) y Person_sitting (14,98) son practicamente inutilizables en produccion; las clases minoritarias de KITTI estan infrarrepresentadas.
- Precision moderada (48,62 %) con recall de 42,84 %: el equilibrio precision-recall es limitado y exigira ajuste del umbral de confianza segun la aplicacion.
- Dominio restringido: entrenado exclusivamente sobre KITTI (escenas de calle alemanas, camara frontal de vehiculo); el rendimiento puede degradarse en otras camaras, condiciones meteorologicas, paises o clases no contempladas.
- Sin informacion sobre sesgos: no se documentan analisis de sesgo por hora del dia, clima, geografia ni demografia de peatones.
- Riesgo de falsos negativos y alucinaciones de deteccion: como todo detector, puede omitir objetos pequenos u ocluidos y generar cajas espurias; requiere validacion en el dominio objetivo.
- Licencia AGPL-3.0: el uso comercial en servicios en red implica obligaciones de liberacion del codigo fuente derivado; conviene revisar la compatibilidad con la politica del producto. Ademas, los pesos base de Ultralytics estan sujetos a su propia licencia.
- Sin datos de latencia ni de despliegue en produccion: no se han publicado mediciones de FPS, memoria ni comportamiento en hardware embebido.
- Repositorio de 0,0 GB segun Hugging Face y solo 28 descargas: ecosistema de validacion muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/kitti-yolo26n
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Dataset KITTI en Hugging Face: https://huggingface.co/datasets/dronefreak/KITTI
- Modelo base Ultralytics/YOLO26: https://huggingface.co/Ultralytics/YOLO26
- Paper referenciado (arxiv:2606.03748): https://arxiv.org/abs/2606.03748
- Demo (video): https://huggingface.co/dronefreak/kitti-yolo26n/resolve/main/assets/demo_banner.mp4
- Poster de la demo: https://huggingface.co/dronefreak/kitti-yolo26n/resolve/main/assets/demo_banner_poster.jpg
