# dronefreak/kitti-yolov9s

## Resumen

El modelo `dronefreak/kitti-yolov9s` es un detector de objetos YOLOv9s afinado sobre el conjunto de datos KITTI, publicado por el investigador Saumya Kumaar Saksena (usuario `dronefreak` en Hugging Face y GitHub). Parte del checkpoint base `Ultralytics/YOLOv9` y se entrena y evalúa dentro de DetectionBench, un marco de trabajo cuyo objetivo es comparar detectores modernos con recetas de entrenamiento y métricas de evaluación idénticas sobre varios conjuntos de datos del mundo real. El problema que resuelve es concreto: disponer de un detector de referencia reproducible para escenas de tráfico y conducción autónoma, con resultados comparables entre familias de modelos (YOLOv8, YOLOv9, YOLO11, YOLO26).

Técnicamente es un detector denso de una sola etapa con 7,3 M de parámetros y 27,6 GFLOPs a 640 píxeles, lo que lo sitúa en el segmento "small" de la familia YOLOv9. La tarea es exclusivamente de visión por computador (detección de cajas 2D); no es un modelo de lenguaje y no procesa texto, por lo que conceptos como longitud de contexto, ventana de tokens o tool calling no aplican.

Su relevancia es práctica: forma parte de un zoo de modelos entrenados sobre KITTI con la misma receta, lo que permite elegir el detector con mejor compromiso entre precisión y coste computacional para sistemas de asistencia a la conducción, robótica móvil o análisis de vídeo urbano. Las métricas declaradas (mAP@50 de 40,84 %, mAP@50-95 de 25,92 %) no están verificadas por un tercero, según indica el propio `model-index`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de detección de objetos de una etapa (familia YOLOv9, variante "s"); sin datos adicionales en la information proporcionada |
| Parámetros totales | 7,3 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, sin ventana de contexto de texto) |
| Tipos de cuantización | No publicados por el autor; la librería Ultralytics permite exportar a FP16 e INT8 |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`) vía Ultralytics; el repositorio declara 0,0 GB de tamaño, por lo que conviene verificar que los pesos estén publicados |
| Tarea | Detección de objetos 2D (`pipeline_tag: object-detection`) |
| Framework / librería | Ultralytics (PyTorch) |
| FLOPs | 27,6 GFLOPs a 640 px |
| Modelo base | Ultralytics/YOLOv9 (YOLOv9s) |
| Conjunto de datos de entrenamiento | KITTI (`dronefreak/KITTI`) |
| Clases | Car, Cyclist, Misc, Pedestrian, Person_sitting, Tram, Truck, Van |
| Descargas / interacciones en Hugging Face | 0 descargas, 0 "likes" en el momento del análisis |

## Arquitectura y entrenamiento

La arquitectura heredada es la de YOLOv9 en su variante "s" del repositorio de Ultralytics: un detector convolucional de una sola etapa, con 7,3 M de parámetros y 27,6 GFLOPs a una resolución de entrada de 640 px. La información proporcionada no detalla la composición exacta de los bloques internos, el número de tokens de entrenamiento ni el esquema de optimización más allá de lo indicado por el marco DetectionBench.

El entrenamiento consiste en un ajuste fino sobre KITTI a partir del checkpoint base `Ultralytics/YOLOv9`, ejecutado con una receta estandarizada dentro de DetectionBench. La model card no especifica el número de épocas, el tamaño de lote, la resolución de entrenamiento ni si se aplicaron técnicas de aumento de datos concretas; tampoco menciona fases de alineación tipo RLHF o DPO, que no tienen sentido en un detector de objetos. La evaluación se realiza sobre la partición de validación de KITTI con la herramienta `detectionbench-evaluate` del propio proyecto.

El elemento diferenciador no es una innovación arquitectónica, sino metodológica: todas las variantes del zoo de KITTI (YOLO26n/m/s, YOLO11s/x/n, YOLOv8s/m/n, YOLOv9t/s) se entrenan y evalúan bajo el mismo protocolo, lo que permite comparaciones directas entre familias. Los identificadores arXiv declarados en las etiquetas del repositorio (2402.13616, 2410.17725 y 2606.03748) no vienen acompañados de descripción en la información disponible; el tercero presenta un formato de identificador no válido.

## Capacidades

- Detección de objetos 2D en escenas de tráfico: devuelve cajas delimitadoras con clase y confianza para las ocho categorías de KITTI.
- Reconocimiento de vehículos: `Car` (mAP@50 de 90,05 %), `Van` (38,22 %), `Truck` (30,30 %) y `Tram` (26,29 %).
- Reconocimiento de usuarios vulnerables de la vía: `Pedestrian` (63,84 % mAP@50) y `Cyclist` (51,82 % mAP@50).
- Clase residual `Misc` (12,76 % mAP@50) y clase `Person_sitting` (13,42 % mAP@50), ambas con rendimiento bajo.
- Inferencia sobre imágenes individuales, lotes de imágenes y flujos de vídeo mediante la API de Ultralytics.
- Exportación a otros formatos de despliegue (ONNX, TensorRT, OpenVINO, TFLite, CoreML y similares) a través de las herramientas de exportación de Ultralytics.
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes, capacidades multimodales de texto, audio ni generación de lenguaje. Es estrictamente un modelo de visión.
- No se declaran capacidades multilingües porque no procesa lenguaje.

## Casos de uso

- Asistencia a la conducción (ADAS): detección de vehículos y peatones en el flujo de cámara frontal para avisos de colisión o de peatón. La clase `Car` alcanza un mAP@50 de 90,05 %, el valor más fiable del modelo, lo que lo hace adecuado para alertas centradas en vehículos.
- Análisis de vídeo urbano: conteo y clasificación de tráfico por categorías (coche, furgoneta, camión, tranvía) en grabaciones de calle. El modelo cabe en hardware de borde, lo que permite procesar múltiples flujos en una sola GPU.
- Etiquetado automático (auto-labeling) para anotación de nuevos conjuntos de datos: se usa como preanotador para generar cajas candidatas que luego revisa un humano, reduciendo el coste de anotación en proyectos de percepción.
- Investigación comparativa de detectores: sirve como punto de referencia dentro de DetectionBench para medir el efecto de la receta de entrenamiento sobre KITTI con una línea base reproducible.
- Prototipado rápido en robótica móvil y vehículos a escala: con 7,3 M de parámetros y 27,6 GFLOPs puede ejecutarse en tiempo real sobre Jetson o GPU de gama de entrada para validar pipelines de percepción antes de escalar a modelos mayores.
- Sistemas de monitorización de aparcamiento o de ocupación de vías: detección de vehículos estacionados y peatones en cámaras fijas, donde la clase `Car` y `Pedestrian` cubren la mayor parte de los objetos de interés.
- Módulo de segunda opinión en pipelines redundantes de seguridad: al ser un modelo pequeño y de bajo coste, puede ejecutarse en paralelo a un detector principal para comparar discrepancias de detección.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card, sobre la partición de validación de KITTI. Ninguno de ellos está marcado como verificado.

| Métrica | Valor (%) |
|---|---|
| mAP@50 (val) | 40,84 |
| mAP@50-95 (val) | 25,92 |
| Precisión (val) | 54,27 |
| Exhaustividad / recall (val) | 41,51 |
| F1 | 47,04 |
| Parámetros | 7,3 M |
| FLOPs (a 640 px) | 27,6 GFLOPs |

Rendimiento por clase sobre KITTI:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| Car | 90,05 | 69,57 |
| Pedestrian | 63,84 | 31,10 |
| Cyclist | 51,82 | 31,47 |
| Van | 38,22 | 25,86 |
| Truck | 30,30 | 20,64 |
| Tram | 26,29 | 16,81 |
| Person_sitting | 13,42 | 4,08 |
| Misc | 12,76 | 7,79 |

## Requisitos de hardware

- Huella de memoria de los pesos (estimación a partir de 7,3 M de parámetros): en torno a 29 MB en FP32, 15 MB en FP16 y 7,5 MB en INT8.
- VRAM para inferencia: inferior a 1 GB con lote 1 a 640 px en FP16 (estimación derivada del tamaño del modelo; el autor no publica mediciones).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, desde una GTX 1650 o RTX 3060 hasta A100 o H100. El modelo es demasiado pequeño para aprovechar GPU de centro de datos, que quedarían infrautilizadas.
- Cabe holgadamente en GPU de consumo: sí, en toda la gama RTX (3060, 4070, 4090) y en placas integradas tipo Jetson Orin o Raspberry Pi con acelerador.
- Ejecución en CPU: viable para inferencia de baja frecuencia o por lotes, dado el reducido número de parámetros.
- Opciones de despliegue: API Python y CLI de Ultralytics; exportación a ONNX, TensorRT, OpenVINO, TFLite, CoreML y NCNN mediante `model.export()`; servicios de inferencia de Hugging Face.
- Latencia y throughput: no disponibles. El autor no publica mediciones de FPS ni de latencia para ningún hardware concreto.

## Comparativa con modelos similares

Comparación con otras variantes entrenadas y evaluadas por el mismo autor sobre KITTI con la misma receta (datos del zoo de KITTI de DetectionBench). Todos comparten licencia AGPL-3.0 y disponibilidad en Hugging Face bajo el usuario `dronefreak`.

| Modelo | mAP@50 | mAP@50-95 | Precisión | Recall |
|---|---|---|---|---|
| YOLO26n | 42,54 | 25,43 | 48,62 | 42,84 |
| YOLO11s | 42,00 | 25,10 | 47,27 | 43,71 |
| YOLOv8s | 41,99 | 25,20 | 49,02 | 43,66 |
| YOLO26m | 41,91 | 25,78 | 63,34 | 39,71 |
| YOLO26s | 41,79 | 26,54 | 59,64 | 42,42 |
| YOLOv9t | 41,60 | 25,73 | 48,30 | 44,20 |
| **YOLOv9s (este modelo)** | **40,84** | **25,92** | **54,27** | **41,51** |
| YOLOv8m | 40,48 | 25,37 | 50,81 | 39,86 |
| YOLOv8n | 40,11 | 24,75 | 46,05 | 41,85 |
| YOLO11x | 39,18 | 23,60 | 46,28 | 41,69 |
| YOLO11n | 38,77 | 23,97 | 52,84 | 40,19 |

Observaciones: YOLOv9s ocupa una posición intermedia-baja en mAP@50 dentro del zoo, pero destaca en mAP@50-95 (25,92), el segundo mejor valor de la tabla por detrás de YOLO26s (26,54) y por delante de YOLO26n (25,43) y YOLOv8s (25,20). Su precisión (54,27) es superior a la de YOLOv8s y YOLO11s, pero su recall (41,51) es de los más bajos, lo que indica una tendencia a omitir detecciones antes que a generarlas incorrectamente.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero si el modelo se ofrece como servicio a través de una red o se distribuye como parte de un producto, la obligación de liberar el código fuente derivado bajo la misma licencia es un riesgo legal relevante para producción. Conviene revisar el caso de uso con asesoría legal.
- Métricas no verificadas: los cuatro valores del `model-index` están marcados con `verified: false`. Provienen del propio autor y no han sido reproducidos por un tercero independiente.
- Rendimiento muy desigual por clase: `Car` alcanza 90,05 % de mAP@50, mientras que `Misc` (12,76 %) y `Person_sitting` (13,42 %) quedan en valores propios de una clase minoritaria mal representada. Un uso que dependa de estas categorías no es fiable.
- Recall bajo (41,51 %): el modelo omite una fracción considerable de objetos presentes. No es adecuado como único sistema de detección en aplicaciones críticas de seguridad sin un detector complementario.
- Sesgo de dominio: está entrenado exclusivamente sobre KITTI, un conjunto con sesgos conocidos de geografía (escenas alemanas), condiciones de captura y distribución de clases. El rendimiento puede degradarse en otros países, condiciones meteorológicas adversas o escenas nocturnas.
- Sin datos de composición del dataset de entrenamiento ni de posibles sesgos demográficos en la detección de peatones.
- Idiomas y contexto: no aplica, pero implica que el modelo no puede gestionar instrucciones en lenguaje natural ni tareas de razonamiento; su interfaz es puramente numérica (imagen de entrada, cajas de salida).
- Disponibilidad de pesos: el repositorio declara un tamaño de 0,0 GB, por lo que debe comprobarse que el fichero de pesos esté realmente publicado antes de planificar su uso.
- Anomalía en los metadatos: la fecha de creación declarada (24 de septiembre de 2026) es posterior a la fecha de análisis, lo que sugiere un problema de registro en el repositorio.
- Sin datos de latencia ni de throughput medidos, lo que impide estimar con rigor si cumple requisitos de tiempo real en un hardware concreto.
- El modelo no incluye ninguna salvaguarda de contenido ni filtro de clases; en producción sobre imágenes reales puede detectar personas, y su uso debe cumplir la normativa aplicable de protección de datos y videovigilancia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/kitti-yolov9s
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Conjunto de datos KITTI (copia del autor): https://huggingface.co/datasets/dronefreak/KITTI
- Modelo base declarado: https://huggingface.co/Ultralytics/YOLOv9
- Perfil del autor en Hugging Face: https://huggingface.co/dronefreak
- Perfil del autor en GitHub: https://github.com/dronefreak/
- Sitio web del autor: https://saumyasaksena.com
- Modelo relacionado de la misma serie: https://huggingface.co/dronefreak/kitti-yolo11s
- Documentación de Ultralytics: https://docs.ultralytics.com
- Identificadores arXiv declarados en las etiquetas del repositorio: https://arxiv.org/abs/2402.13616, https://arxiv.org/abs/2410.17725, https://arxiv.org/abs/2606.03748 (contenido no descrito en la información disponible)
- Demostración en vídeo incluida en la model card: https://huggingface.co/dronefreak/kitti-yolov9s/resolve/main/assets/demo_banner.mp4
