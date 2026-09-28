# dronefreak/gc10det-yolov8n

## Resumen

dronefreak/gc10det-yolov8n es un detector de objetos basado en la arquitectura YOLOv8n de Ultralytics, ajustado (fine-tuning) sobre el conjunto de datos GC10-DET, un benchmark de inspeccion de superficies metalicas con diez clases de defectos industriales. Lo desarrolla el usuario dronefreak (Saumya Kumaar Saksena) como parte de DetectionBench, un marco de trabajo para comparar de forma reproducible detectores modernos con recetas de entrenamiento y metricas de evaluacion identicas. El problema que resuelve es la deteccion automatica de defectos superficiales en entornos de fabricacion, tarea clave en control de calidad industrial.

El modelo es deliberadamente pequeno: 3,2 millones de parametros y 8,7 GFLOPs a 640 px, lo que lo situa en la gama ultraligera de YOLOv8 y lo hace apto para inferencia en tiempo real sobre hardware modesto, incluidos dispositivos de borde. Se distribuye unicamente como pesos PyTorch (`best.pt`) y esta bajo licencia AGPL-3.0, lo que condiciona su uso en productos propietarios.

Su relevancia actual radica en que forma parte de una comparativa abierta y homogenea de detectores (RF-DETR, YOLO26, YOLO11, YOLOv8) sobre un unico dataset industrial, lo que permite medir el compromiso entre precision y coste computacional con criterios reproducibles, y en que la deteccion de defectos en superficies metalicas es un caso de uso industrial con demanda creciente de soluciones ligeras y desplegables en planta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (CNN de deteccion de objetos, un solo paso, anchor-free, cabecera desacoplada) |
| Parametros totales | 3,2 M |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible en la model card; el framework Ultralytics soporta exportacion a FP16/INT8 y formatos ONNX, TensorRT, OpenVINO y TFLite |
| Idiomas soportados | no aplicable (modelo de deteccion de imagenes; las etiquetas del dataset estan en ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch `.pt` (`best.pt`), cargable con Ultralytics |
| FLOPs | 8,7 GFLOPs a 640 px |
| Resolucion de entrada | 640 px (configuracion tipica de evaluacion) |
| Tarea | Deteccion de objetos (object-detection) |

## Arquitectura y entrenamiento

La arquitectura es YOLOv8n, la variante "nano" de la familia YOLOv8 publicada por Ultralytics en enero de 2023. Se trata de una red neuronal convolucional de deteccion en un solo paso, con diseno anchor-free, cabecera de deteccion desacoplada (clasificacion y regresion separadas) y una backbone tipo CSP con modulos C2f. La variante nano reduce el numero de canales y de bloques para minimizar el coste computacional, lo que se traduce en 3,2 M de parametros y 8,7 GFLOPs a 640 px. El modelo parte de los pesos preentrenados de `Ultralytics/YOLOv8` y se ajusta sobre el dataset GC10-DET.

El ajuste se ha realizado dentro del marco DetectionBench, cuyo objetivo es aplicar recetas de entrenamiento y protocolos de evaluacion identicos a todos los detectores comparados. La model card no detalla el numero de tokens (no aplicable), el numero de imagenes, las epocas, la composicion exacta del dataset ni si se emplearon tecnicas de aumento de datos o ajuste fino adicional; unicamente indica que las metricas se calculan sobre el split de test de GC10-DET mediante el pipeline `detectionbench-evaluate`. El conjunto GC10-DET contiene diez clases de defectos en superficie metalica (crease, crescent_gap, inclusion, oil_spot, punching_hole, rolled_pit, silk_spot, waist_folding, water_spot y welding_line). No se mencionan innovaciones tecnicas adicionales mas alla del propio diseno de YOLOv8 y del protocolo de evaluacion reproducible.

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica defectos de superficie metalica en diez categorias predefinidas.
- Deteccion en un solo paso y orientada a tiempo real, adecuada para video o flujo continuo de imagenes.
- Inferencia integrable mediante la libreria Ultralytics en Python, con carga directa desde Hugging Face mediante `hf_hub_download`.
- Funciona sobre imagenes individuales o lotes, y admite entrenamiento posterior o ajuste fino adicional con el mismo framework.
- No dispone de soporte de tool calling ni de function calling (no es un modelo de lenguaje).
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues, de vision-lenguaje ni de modo "thinking" (no genera texto).
- Capacidad especial: pertenece a la familia YOLOv8, por lo que hereda las opciones de exportacion del framework (ONNX, TensorRT, OpenVINO, TFLite) para despliegue en distintos runtimes.

## Casos de uso

- Control de calidad en linea de produccion metalica: el modelo recibe imagenes de la superficie de bobinas, chapas o piezas y marca la posicion y clase de defectos como crease, inclusion o rolled_pit, permitiendo descartar o reclasificar piezas de forma automatica.
- Inspeccion de soldaduras: con la clase `welding_line` (mAP@50 de 89,01), puede detectar discontinuidades en cordones de soldadura en procesos de fabricacion y montaje.
- Deteccion de manchas y contaminacion superficial: las clases `oil_spot` y `water_spot` (mAP@50 de 47,72 y 87,65 respectivamente) permiten identificar residuos de aceite o agua que afectan a la calidad de acabado.
- Integracion en sistemas embebidos de vision: gracias a sus 3,2 M de parametros y 8,7 GFLOPs, puede ejecutarse en dispositivos de borde con GPU integrada o incluso en CPU, junto a la camara, sin depender de la nube.
- Preetiquetado de datos para entrenamiento: el modelo puede usarse como anotador automatico sobre grandes volumenes de imagenes industriales y reducir el coste de etiquetado manual antes de reentrenar con correcciones humanas.
- Monitorizacion continua de lineas de fabricacion: al ser un detector de un solo paso, puede analizar frames de video en tiempo real para generar alertas cuando la tasa de defectos supera un umbral.
- Investigacion comparativa de detectores: sirve como referencia de la gama ultraligera dentro del benchmark DetectionBench frente a RF-DETR Nano, YOLO11n o YOLO26n, con metricas comparables sobre el mismo dataset.
- Auditoria de calidad y trazabilidad: al registrar las detecciones por imagen, permite generar informes de defectos por lote y por clase, utiles en entornos con requisitos de trazabilidad industrial.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el split de test de GC10-DET (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| mAP@50 | 73,25 |
| mAP@50-95 | 38,74 |
| Precision | 67,99 |
| Recall | 70,87 |
| F1 | 69,4 |
| Parametros | 3,2 M |
| FLOPs | 8,7 B (a 640 px) |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| crease | 32,63 | 13,23 |
| crescent_gap | 96,78 | 61,17 |
| inclusion | 40,45 | 9,81 |
| oil_spot | 47,72 | 21,42 |
| punching_hole | 90,23 | 49,13 |
| rolled_pit | 99,5 | 69,65 |
| silk_spot | 54,39 | 19,51 |
| waist_folding | 94,14 | 56,46 |
| water_spot | 87,65 | 57,78 |
| welding_line | 89,01 | 29,19 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 3,2 M de parametros, los pesos ocupan aproximadamente 13 MB en FP32 y 6,5 MB en FP16; la VRAM necesaria depende sobre todo del tamano de lote y de la resolucion de entrada, pero en configuraciones tipicas a 640 px se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no requiere A100 ni H100. Se puede emplear RTX 4090, RTX 3090, RTX 3060, T4, Jetson Orin o incluso GPUs integradas para inferencia en tiempo real.
- Compatibilidad con GPU de consumo: si, cabe con holgura en practicamente cualquier GPU de consumo e incluso en CPU para inferencia a baja frecuencia, dado su tamano reducido.
- Opciones de despliegue: Ultralytics (Python y CLI), exportacion a ONNX, TensorRT, OpenVINO, TFLite y CoreML para distintos runtimes de produccion. No esta pensado para vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la model card. Dada la carga de 8,7 GFLOPs a 640 px, se espera una latencia muy baja en GPU moderna y capacidad de procesar varios centenares de imagenes por segundo en hardware de gama alta, pero son estimaciones no confirmadas por el autor.

## Comparativa con modelos similares

Comparativa sobre el mismo dataset GC10-DET (datos del model zoo de DetectionBench, declarados por el autor). Se incluyen los modelos ligeros y de tamano similar:

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Small | 76,07 | 42,51 | 87,86 | 65,03 |
| RF-DETR Medium | 75,93 | 41,93 | 78,25 | 67,76 |
| YOLO26s | 75,77 | 38,15 | 77,16 | 74,07 |
| YOLO26n | 74,25 | 38,31 | 80,5 | 67,99 |
| YOLO26m | 73,97 | 36,94 | 75,7 | 68,19 |
| YOLOv8n (este modelo) | 73,25 | 38,74 | 67,99 | 70,87 |
| YOLO11s | 72,54 | 35,07 | 72,39 | 66,8 |
| YOLOv8s | 72,54 | 37,79 | 78,54 | 65,23 |
| YOLOv8m | 71,88 | 38,8 | 69,77 | 70,84 |
| YOLO11n | 70,44 | 40,09 | 78,93 | 62,64 |
| RF-DETR Nano | 70,17 | 38,06 | 77,08 | 71,04 |

Observaciones: el modelo iguala o supera en mAP@50 a variantes mayores como YOLOv8s, YOLOv8m y YOLO11s pese a tener menos parametros, y solo queda por debajo de las variantes nano de YOLO26 y de las variantes de RF-DETR en mAP@50. En precision es el mas bajo de la tabla, mientras que en recall se situa en la zona media-alta. Todas las cifras proceden del autor y no han sido verificadas de forma independiente. No se dispone de comparativas con otros modelos fuera de este dataset.

## Limitaciones y advertencias

- Sesgos: el modelo esta entrenado exclusivamente sobre GC10-DET, un dataset de superficies metalicas con diez clases concretas; su comportamiento fuera de ese dominio industrial sera pobre y no debe extrapolarse a objetos genericos.
- Clases con rendimiento bajo: `crease` e `inclusion` presentan mAP@50 de 32,63 y 40,45 y mAP@50-95 de 13,23 y 9,81, por lo que son las mas propensas a falsos negativos en produccion.
- Riesgo de falsos positivos y negativos: con una precision de 67,99 y un recall de 70,87, se espera un volumen no despreciable de errores, lo que exige umbrales de confianza ajustados y validacion humana en aplicaciones criticas.
- Limitaciones de contexto e idioma: no aplicable en el sentido linguistico, pero el modelo no procesa texto ni instrucciones; solo imagenes en el formato para el que fue entrenado.
- Licencia AGPL-3.0: el uso comercial implica obligaciones de copyleft sobre el software que incorpore el modelo o sus derivados; para productos propietarios puede ser necesario adquirir una licencia comercial alternativa de Ultralytics. Conviene revisar los terminos antes de integrarlo en un producto cerrado.
- Caveats de produccion: no hay version cuantizada publicada en el repositorio, ni pesos ONNX o TensorRT listos para usar; habria que exportarlos. El modelo se publico con descargas y likes iniciales nulos y sin verificacion externa de las metricas, por lo que se recomienda validarlo sobre datos propios antes de desplegarlo.
- Fecha de publicacion inusual: la model card marca creacion y actualizacion en septiembre de 2026, dato poco convencional que conviene contrastar con el repositorio de GitHub antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/gc10det-yolov8n
- Dataset GC10-DET: https://huggingface.co/datasets/dronefreak/GC10-DET
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Perfil del autor en GitHub: https://github.com/dronefreak/
- Modelo base (Ultralytics YOLOv8): https://platform.ultralytics.com/ultralytics/yolov8
- Referencia de la familia YOLOv8: https://arxiv.org/abs/2304.07193
- Paper de RF-DETR (comparativa): https://arxiv.org/abs/2410.17725
- Paper referenciado 2511.09554: https://arxiv.org/abs/2511.09554
- Paper referenciado 2606.03748: https://arxiv.org/abs/2606.03748
