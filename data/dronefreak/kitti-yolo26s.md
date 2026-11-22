# dronefreak/kitti-yolo26s

## Resumen

kitti-yolo26s es un detector de objetos YOLO26s afinado sobre el conjunto de datos KITTI, publicado por el usuario dronefreak como parte del proyecto DetectionBench, un marco para comparar detectores modernos con recetas de entrenamiento y métricas de evaluación idénticas. El modelo parte de los pesos Ultralytics/YOLO26 y se especializa en escenas de calle y conducción autónoma, con ocho clases propias de KITTI (Car, Van, Truck, Pedestrian, Person_sitting, Cyclist, Tram y Misc).

Se trata de un detector de una sola etapa con 9.992.040 parámetros (aproximadamente 10,0 M) y 22,8 GFLOPs a 640 px, lo que lo sitúa en el segmento "small" de la familia YOLO. Su relevancia actual reside en que ofrece un punto de comparación reproducible dentro del zoo de modelos KITTI de DetectionBench, con resultados declarados de mAP@50 de 41,79 % y mAP@50-95 de 26,54 % en el split de validación.

El modelo no es un modelo de lenguaje ni procesa texto: es exclusivamente un detector visual. Se distribuye en formato PyTorch (.pt) para la librería Ultralytics y con pesos safetensors en el repositorio, bajo licencia AGPL-3.0, lo que condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (detector de objetos de una etapa, familia Ultralytics) |
| Parametros totales | 9.992.040 (aprox. 10,0 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (el autor no documenta variantes cuantizadas; el repo contiene pesos PyTorch y safetensors) |
| Idiomas soportados | no aplica (modelo de visión; no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt, best.pt) y safetensors |
| Tarea | object-detection |
| Libreria | ultralytics |
| Modelo base | Ultralytics/YOLO26 |
| Dataset de entrenamiento | dronefreak/KITTI (KITTI) |
| FLOPs | 22,8 B a 640 px |
| Clases | Car, Van, Truck, Pedestrian, Person_sitting, Cyclist, Tram, Misc |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un detector YOLO26 de escala "s", es decir, un transformer/CNN de detección de una etapa con cabeza de predicción densa, en la línea de las versiones YOLO de Ultralytics. El modelo parte de los pesos preentrenados Ultralytics/YOLO26 y se afina sobre KITTI, el conocido benchmark de visión para conducción autónoma con imágenes de escenas de calle anotadas en 2D. El autor no detalla en la información disponible el número de épocas, la resolución de entrenamiento, el tamaño del split ni si se aplicaron técnicas de aumento de datos específicas; únicamente se indica que el entrenamiento y la evaluación se realizaron dentro del pipeline de DetectionBench con recetas idénticas al resto de modelos del zoo.

La innovación principal no está en el modelo en sí, sino en el marco de evaluación: DetectionBench estandariza receta de entrenamiento y métricas (`detectionbench-evaluate`) para que las comparaciones entre detectores sean justas. El checkpoint se publica con métricas declaradas por el autor (no verificadas por un tercero, según el campo `verified: false` del model-index) y con una matriz de confusión normalizada como evidencia cualitativa. No se documentan técnicas como decodificación especulativa, atención lineal ni entrenamiento con RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Detección de objetos en imágenes de escenas de calle en ocho clases de KITTI: coche, furgoneta, camión, peatón, persona sentada, ciclista, tranvía y miscelánea.
- Inferencia sobre imágenes individuales, vídeo y flujos de cámara mediante la API `model.predict()` de Ultralytics.
- Salida de cajas delimitadoras con puntuaciones de confianza por clase y umbral configurable (`conf`).
- Integración con el ecosistema Ultralytics: exportación a otros formatos, validación y entrenamiento adicional.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo "thinking", visión generativa, audio ni generación de texto.

## Casos de uso

- Detección de vehículos y peatones en sistemas de asistencia a la conducción (ADAS): el modelo detecta coches, furgonetas, camiones y peatones en imágenes de cámara frontal, con mAP@50 de 90,2 % en la clase Car, adecuado para alertas de colisión y análisis de escena.
- Análisis de vídeo de tráfico urbano: procesamiento por fotograma de grabaciones de cámaras de vigilancia para contar vehículos y ciclistas, aprovechando la inferencia rápida de un modelo de 10 M de parámetros.
- Etiquetado asistido de datasets de conducción: preanotación automática de imágenes nuevas con las ocho clases de KITTI para reducir el coste de anotación manual, revisando después las detecciones de baja confianza.
- Vehículos autónomos a escala de laboratorio o prototipo: percepción 2D de obstáculos en robots móviles y coches de investigación, donde el tamaño reducido del modelo permite ejecución en hardware embebido.
- Benchmarking reproducible de detectores: uso como referencia dentro de DetectionBench para comparar futuros modelos con la misma receta y métricas sobre KITTI.
- Monitorización de aforos y seguridad vial: detección de tranvías, camiones y ciclistas en intersecciones para estudios de movilidad, con la advertencia de que las clases minoritarias (Tram, Person_sitting) tienen un rendimiento bajo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de validación de KITTI, evaluados con el pipeline de DetectionBench (no verificados por terceros):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 41,79 |
| mAP@50-95 | 26,54 |
| Precision | 59,64 |
| Recall | 42,42 |
| F1 Score | 49,58 |

Rendimiento por clase (mAP@50 / mAP@50-95, %):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| Car | 90,2 | 69,77 |
| Pedestrian | 64,26 | 30,33 |
| Cyclist | 55,62 | 33,82 |
| Truck | 39,14 | 27,71 |
| Van | 37,99 | 26,86 |
| Person_sitting | 19,16 | 7,62 |
| Tram | 18,95 | 11,46 |
| Misc | 9,01 | 4,73 |

Comparativa dentro del zoo KITTI de DetectionBench (mAP@50 / mAP@50-95 / Precision / Recall, %):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26x | 43,73 | 25,96 | 64,17 | 41,28 |
| YOLO26n | 42,54 | 25,43 | 48,62 | 42,84 |
| YOLO11s | 42,0 | 25,1 | 47,27 | 43,71 |
| YOLOv8s | 41,99 | 25,2 | 49,02 | 43,66 |
| YOLO26m | 41,91 | 25,78 | 63,34 | 39,71 |
| YOLO26s (este modelo) | 41,79 | 26,54 | 59,64 | 42,42 |
| YOLOv9t | 41,6 | 25,73 | 48,3 | 44,2 |
| YOLOv9s | 40,84 | 25,92 | 54,27 | 41,51 |
| YOLOv8m | 40,48 | 25,37 | 50,81 | 39,86 |
| YOLOv8n | 40,11 | 24,75 | 46,05 | 41,85 |
| YOLO11x | 39,18 | 23,6 | 46,28 | 41,69 |
| YOLO11n | 38,77 | 23,97 | 52,84 | 40,19 |

## Requisitos de hardware

- Inferencia en FP32: un modelo de 10 M de parámetros ocupa aproximadamente 40 MB en pesos, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA moderna (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento o validación a gran escala se recomienda A100/H100 o RTX 4090.
- Cabe en GPU consumer sin problema, incluso en iGPU o CPU para inferencia a baja frecuencia de fotogramas.
- Despliegue: Ultralytics (PyTorch), exportación a ONNX, TensorRT y otros formatos soportados por la librería. No se documenta soporte nativo en vLLM, TGI, llama.cpp u Ollama, que no aplican a detectores visuales.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa del orden de magnitud, un detector de 22,8 GFLOPs a 640 px suele procesar decenas o centenares de imágenes por segundo en GPU modernas, pero no se aportan medidas concretas.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 (KITTI) | mAP@50-95 (KITTI) | Licencia | Formato |
|---|---|---|---|---|---|
| YOLO26s (este modelo) | 10,0 M | 41,79 | 26,54 | AGPL-3.0 | .pt, safetensors |
| YOLO26n | no disponible | 42,54 | 25,43 | AGPL-3.0 (Ultralytics) | .pt |
| YOLO26x | no disponible | 43,73 | 25,96 | AGPL-3.0 (Ultralytics) | .pt |
| YOLO11s | no disponible | 42,0 | 25,1 | AGPL-3.0 (Ultralytics) | .pt |
| YOLOv8s | no disponible | 41,99 | 25,2 | AGPL-3.0 (Ultralytics) | .pt |

Dentro del zoo KITTI, el modelo destaca por el mejor mAP@50-95 de la tabla (26,54), aunque su mAP@50 queda por debajo de YOLO26n, YOLO26x, YOLO11s y YOLOv8s. La comparación con arquitecturas no YOLO (DETR, Faster R-CNN) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Métricas declaradas por el autor y marcadas como no verificadas (`verified: false`); conviene reproducirlas con el pipeline de DetectionBench antes de usarlas en decisiones de producción.
- Rendimiento muy desigual por clase: Car alcanza 90,2 % de mAP@50, pero Misc (9,01 %), Tram (18,95 %) y Person_sitting (19,16 %) son prácticamente inutilizables para aplicaciones críticas.
- El modelo está especializado en KITTI y en escenas de calle diurnas; su generalización a otros dominios (imágenes aéreas, interiores, condiciones nocturnas) no está documentada.
- Licencia AGPL-3.0: el uso en servicios en red puede obligar a liberar el código fuente derivado; para productos propietarios es necesario evaluar una licencia comercial de Ultralytics.
- Riesgo de falsos negativos y positivos en clases minoritarias y en objetos ocluidos o de pequeño tamaño, típico de detectores de una etapa con pocos parámetros.
- El autor no documenta sesgos del dataset, composición del split, ni protocolo de aumento de datos; la reproducibilidad depende del repositorio DetectionBench.
- No es un modelo generativo: no debe emplearse para tareas de texto, razonamiento o diálogo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/kitti-yolo26s
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Dataset KITTI en Hugging Face: https://huggingface.co/datasets/dronefreak/KITTI
- Modelo base Ultralytics YOLO26: https://huggingface.co/Ultralytics/YOLO26
- Referencia arXiv citada en los tags: arXiv:2606.03748
