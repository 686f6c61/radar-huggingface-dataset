# dronefreak/kitti-yolo11s

## Resumen

kitti-yolo11s es un detector de objetos YOLO11s afinado sobre el conjunto de datos KITTI, publicado por el usuario dronefreak como parte del proyecto DetectionBench, un marco de trabajo para comparar detectores modernos con recetas de entrenamiento y métricas de evaluación idénticas. El modelo parte de los pesos preentrenados de Ultralytics YOLO11s y se especializa en escenas de calle para conducción autónoma y sistemas de asistencia al conductor (ADAS).

Se trata de un modelo de visión por computador puramente convolucional (no es un modelo de lenguaje), con 9.460.872 parámetros totales y un coste de 21,7 GFLOPs a resolución de 640 píxeles. Detecta ocho clases del benchmark KITTI: coche, ciclista, misc, peatón, persona sentada, tranvía, camión y furgoneta. Su relevancia radica en que ofrece una línea base reproducible y comparable dentro del ecosistema DetectionBench, con métricas declaradas sobre el split de validación de KITTI.

El modelo está pensado para integración directa mediante la librería Ultralytics y se distribuye bajo licencia AGPL-3.0, lo que condiciona su uso en productos propietarios. Con 18 descargas y ningún "me gusta" en el momento de la consulta, es un checkpoint de investigación más que un modelo de producción consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (detector de objetos de una etapa, red convolucional) |
| Parametros totales | 9.460.872 (9,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen, típicamente 640 px) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `best.pt` en PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión; sin capacidades lingüísticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`); el repo declara la etiqueta `safetensors` pero la carga documentada usa `best.pt` |
| Framework | Ultralytics YOLO |
| Tarea | object-detection |
| Dataset de entrenamiento | dronefreak/KITTI (benchmark KITTI) |
| Modelo base | Ultralytics/YOLO11 |
| FLOPs | 21,7 B a 640 px |
| Clases | Car, Cyclist, Misc, Pedestrian, Person_sitting, Tram, Truck, Van |

## Arquitectura y entrenamiento

La arquitectura es YOLO11s, un detector de objetos de una etapa basado en redes convolucionales con extracción de características multiescala y cabecera de detección densa, tal como lo implementa el framework Ultralytics. No emplea mecanismos de atención tipo transformer ni arquitecturas híbridas SSM; es un modelo puramente convolucional orientado a inferencia de baja latencia en imágenes.

El entrenamiento consiste en un ajuste fino (fine-tuning) de los pesos oficiales de Ultralytics YOLO11 sobre el conjunto KITTI, gestionado dentro del pipeline de DetectionBench. La model card no detalla el número de épocas, la composición exacta del dataset, el tamaño del split de entrenamiento ni si se aplicaron técnicas de aumento de datos específicas, por lo que esos datos deben considerarse no disponibles. Tampoco se documenta el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un detector visual. La innovación principal del proyecto no está en el modelo en sí, sino en la metodología: recetas de entrenamiento y evaluación idénticas para comparar detectores de distintas familias (YOLO11, YOLOv8, YOLOv9, YOLO26) sobre el mismo benchmark.

## Capacidades

- Detección de objetos en imágenes de escenas de calle con ocho clases del benchmark KITTI.
- Localización mediante cajas delimitadoras con puntuaciones de confianza por clase.
- Detección de vehículos (coche, camión, furgoneta, tranvía) y de usuarios vulnerables de la vía (peatón, ciclista, persona sentada).
- Inferencia sobre imágenes individuales y, por herencia del framework Ultralytics, sobre vídeo y streams en tiempo real.
- Integración con el ecosistema Ultralytics: `model.predict()`, exportación a otros formatos y utilidades de visualización (`results[0].show()`).
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión-lenguaje, audio ni otras capacidades multimodales más allá de la propia entrada de imagen.

## Casos de uso

- Sistemas ADAS de detección de obstáculos: el modelo identifica coches, peatones y ciclistas en imágenes de cámara frontal, con 91,53 % de mAP@50 en la clase Car, lo que lo hace adecuado como componente de alerta temprana en prototipos de asistencia a la conducción.
- Análisis offline de grabaciones de tráfico: procesamiento por lotes de secuencias KITTI o de vídeo de dashcam para extraer estadísticas de flujo vehicular y presencia de peatones, aprovechando la API de predicción de Ultralytics sobre directorios completos.
- Línea base reproducible para investigación: sirve como referencia fija con métricas declaradas (mAP@50 42,0; mAP@50-95 25,1) para comparar nuevas arquitecturas o recetas de entrenamiento dentro de DetectionBench.
- Etiquetado asistido (pre-anotación): generar cajas candidatas sobre imágenes nuevas de dominio similar para que un equipo humano las revise, reduciendo el coste de anotación en datasets de conducción autónoma.
- Prototipado rápido en robótica móvil o vehículos a escala: con 9,5 M de parámetros y 21,7 GFLOPs a 640 px, el modelo puede ejecutarse en plataformas embebidas con GPU integrada para tareas de evitación de colisiones a baja velocidad.
- Evaluación de robustez por clase: las métricas por clase publicadas (por ejemplo, 6,56 % de mAP@50 en Misc frente a 91,53 % en Car) permiten identificar clases problemáticas y orientar estrategias de reentrenamiento o aumento de datos.
- Docencia y experimentación con Ultralytics: ejemplo completo de fine-tuning y evaluación de un detector sobre un benchmark público, útil en cursos de visión por computador.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de validación de KITTI (no verificados de forma independiente, según la model-index):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 42,0 |
| mAP@50-95 | 25,1 |
| Precision | 47,27 |
| Recall | 43,71 |
| F1 | 45,42 |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| Car | 91,53 | 68,26 |
| Pedestrian | 62,53 | 28,78 |
| Cyclist | 56,87 | 31,82 |
| Van | 38,02 | 25,51 |
| Tram | 33,88 | 18,22 |
| Truck | 28,75 | 18,63 |
| Person_sitting | 17,85 | 6,69 |
| Misc | 6,56 | 2,94 |

Comparativa dentro del KITTI Model Zoo de DetectionBench (mAP@50):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26x | 43,73 | 25,96 | 64,17 | 41,28 |
| YOLO26n | 42,54 | 25,43 | 48,62 | 42,84 |
| YOLO11s (este modelo) | 42,0 | 25,1 | 47,27 | 43,71 |
| YOLOv8s | 41,99 | 25,2 | 49,02 | 43,66 |
| YOLO26m | 41,91 | 25,78 | 63,34 | 39,71 |
| YOLO26s | 41,79 | 26,54 | 59,64 | 42,42 |
| YOLOv9t | 41,6 | 25,73 | 48,3 | 44,2 |
| YOLOv9s | 40,84 | 25,92 | 54,27 | 41,51 |
| YOLOv8m | 40,48 | 25,37 | 50,81 | 39,86 |
| YOLOv8n | 40,11 | 24,75 | 46,05 | 41,85 |
| YOLO11x | 39,18 | 23,6 | 46,28 | 41,69 |
| YOLO11n | 38,77 | 23,97 | 52,84 | 40,19 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 9,5 M de parámetros y pesos en precisión FP32 el checkpoint ocupa del orden de decenas de MB, por lo que la inferencia cabe holgadamente en cualquier GPU con 2-4 GB de VRAM. No se publican cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; para despliegue de servidor se puede usar NVIDIA A100, H100 o L4, aunque están sobredimensionadas para este modelo. Para tiempo real en borde, RTX 4090, RTX 3060 o GPUs integradas tipo Jetson son adecuadas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos unos pocos GB de VRAM, e incluso en CPU para inferencia no interactiva.
- Opciones de despliegue: Ultralytics (PyTorch, `best.pt`), exportación a ONNX, TensorRT, OpenVINO y otros formatos soportados por el framework. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput: no disponibles en la información proporcionada; el coste computacional declarado es de 21,7 GFLOPs a 640 px, lo que sitúa el modelo en la gama ligera de detectores.

## Comparativa con modelos similares

| Modelo | Parametros | mAP@50 (KITTI) | mAP@50-95 (KITTI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11s (este modelo) | 9,5 M | 42,0 | 25,1 | AGPL-3.0 | Hugging Face (dronefreak/kitti-yolo11s) |
| YOLOv8s (DetectionBench) | no disponible | 41,99 | 25,2 | AGPL-3.0 (Ultralytics) | Checkpoint dentro de DetectionBench |
| YOLO26n (DetectionBench) | no disponible | 42,54 | 25,43 | no disponible | Checkpoint dentro de DetectionBench |
| YOLOv9s (DetectionBench) | no disponible | 40,84 | 25,92 | no disponible | Checkpoint dentro de DetectionBench |

La comparación se limita a los modelos del KITTI Model Zoo del propio proyecto, ya que la información proporcionada no incluye datos de detectores de otras familias (Faster R-CNN, DETR, RT-DETR) sobre KITTI. Dentro de ese conjunto, YOLO11s ocupa una posición intermedia: supera ligeramente a YOLOv8s en mAP@50 y queda por debajo de YOLO26x y YOLO26n en esa misma métrica, aunque con mejor recall que YOLO26x.

## Limitaciones y advertencias

- Métricas no verificadas: la model-index marca los resultados como `verified: false`; proceden del propio autor y no de una evaluación independiente.
- Rendimiento muy desigual por clase: la clase Misc obtiene 6,56 % de mAP@50 y Person_sitting 17,85 %, lo que desaconseja su uso para esas categorías sin reentrenamiento o datos adicionales.
- Dominio restringido: entrenado exclusivamente sobre KITTI (escenas de calle en condiciones y geografía específicas); el rendimiento puede degradarse en otros dominios (cámaras aéreas, interiores, condiciones meteorológicas adversas no representadas).
- Riesgo de falsos negativos y positivos: con un recall del 43,71 % y una precisión del 47,27 %, el modelo deja sin detectar más de la mitad de las instancias en el conjunto de validación según esos umbrales, lo que es crítico en aplicaciones de seguridad (ADAS).
- Licencia AGPL-3.0: el uso en productos o servicios en red puede obligar a liberar el código fuente derivado; para uso comercial propietario conviene evaluar una licencia comercial de Ultralytics.
- Sin capacidades lingüísticas ni multimodales: no debe emplearse para tareas de texto, razonamiento o diálogo.
- Documentación incompleta: no se detallan hiperparámetros de entrenamiento, composición exacta del dataset ni proceso de aumento de datos, lo que dificulta la reproducibilidad fuera del pipeline de DetectionBench.
- Formato de pesos ambiguo: el repo declara la etiqueta `safetensors`, pero la carga documentada utiliza `best.pt` (PyTorch); conviene verificar los ficheros disponibles antes de integrarlo.
- Advertencia de producción: al ser un checkpoint de investigación con 18 descargas y sin validación externa, no se recomienda su despliegue directo en sistemas críticos sin una evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/kitti-yolo11s
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Dataset KITTI en Hugging Face: https://huggingface.co/datasets/dronefreak/KITTI
- Modelo base YOLO11 de Ultralytics: https://huggingface.co/Ultralytics/YOLO11
- Paper de referencia citado (arXiv:2410.17725): https://arxiv.org/abs/2410.17725
- Demo (vídeo de detecciones): https://huggingface.co/dronefreak/kitti-yolo11s/resolve/main/assets/demo_banner.mp4
- Póster de la demo: https://huggingface.co/dronefreak/kitti-yolo11s/resolve/main/assets/demo_banner_poster.jpg
