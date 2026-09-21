# dronefreak/bdd100k-yolo11n

## Resumen

El modelo `dronefreak/bdd100k-yolo11n` es un detector de objetos YOLOv11n afinado sobre el conjunto de datos BDD100K (Berkeley DeepDrive), orientado a escenas de conducción. Lo publica el usuario dronefreak como parte de DetectionBench, un marco de trabajo cuyo objetivo es evaluar detectores modernos con recetas de entrenamiento y métricas idénticas, de modo que las comparaciones entre arquitecturas sean reproducibles y no dependan de hiperparámetros dispares.

Se trata de un modelo de visión por computador, no de un modelo de lenguaje: su tarea es la detección de objetos en imágenes (pipeline `object-detection`), con salida de cajas delimitadoras sobre 10 clases de tráfico (person, rider, car, truck, bus, train, motor, bike, traffic light y traffic sign). Deriva de `Ultralytics/YOLO11` y conserva la arquitectura YOLOv11n, con 2,6 millones de parámetros y 6,6 GFLOPs a 640 píxeles, lo que lo sitúa en la gama ultraligera de detectores.

Su relevancia es doble. Por un lado, sirve como base de referencia dentro del zoo de modelos BDD100K de DetectionBench, donde se compara con YOLOv8n, YOLOv9t, YOLOv10n y YOLOv26n bajo el mismo protocolo. Por otro, al ser un modelo de 2,6 M de parámetros con licencia AGPL-3.0, es un candidato claro para despliegue en hardware de borde (Jetson, Raspberry Pi, CPU) en tareas de asistencia a la conducción o análisis de vídeo de tráfico, siempre que se respeten las condiciones de licencia descritas más abajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) de detección de objetos de una sola etapa, familia YOLO11 de Ultralytics; el ajuste fino conserva la arquitectura del modelo base `Ultralytics/YOLO11`. La model card no detalla los bloques internos |
| Parametros totales | 2,6 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión). Los FLOPs declarados corresponden a una entrada de 640 px |
| Tipos de cuantizacion | No disponible en la model card. El framework declarado (Ultralytics) permite exportar a formatos como ONNX, TensorRT, OpenVINO, TFLite o CoreML, pero no se documenta ninguna cuantización concreta para este checkpoint |
| Idiomas soportados | No aplica; las etiquetas de clase están en inglés |
| Licencia | AGPL-3.0 |
| Formato de pesos | No disponible. La librería declarada es `ultralytics` (que usaría `.pt`), pero no se detalla ningún fichero de pesos y el tamaño del repositorio figura como 0,0 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tune) de `Ultralytics/YOLO11` en su variante `n` (nano). La arquitectura de partida es un detector convolucional de una sola etapa, típico de la familia YOLO, con 2,6 M de parámetros y 6,6 GFLOPs a 640 px. La model card no aporta detalles sobre la composición de bloques, la función de pérdida ni la configuración exacta del entrenamiento; únicamente indica que el entrenamiento y la evaluación se realizaron dentro del pipeline estándar de DetectionBench, cuyo propósito es fijar una receta común para todos los modelos comparados.

En cuanto a los datos, el entrenamiento se realizó sobre BDD100K, un conjunto de escenas de conducción con 10 clases de anotación. No se especifica el número de imágenes de entrenamiento, el número de épocas, el tamaño de lote, las técnicas de aumento de datos ni si hubo etapas posteriores de ajuste (por ejemplo, destilación o refinamiento). Tampoco se documenta ningún mecanismo innovador adicional: se trata de un fine-tune estándar sobre un detector preentrenado, y su interés técnico reside en la reproducibilidad del protocolo de evaluación más que en aportaciones arquitectónicas.

## Capacidades

- Detección de objetos en imágenes de escenas de tráfico, con salida de cajas delimitadoras y puntuaciones de confianza.
- Reconocimiento de 10 clases: `person`, `rider`, `car`, `truck`, `bus`, `train`, `motor`, `bike`, `traffic light` y `traffic sign`.
- Inferencia sobre imágenes individuales, lotes de imágenes y flujos de vídeo mediante la API de Ultralytics (declarada como librería del modelo).
- Entrenamiento o reajuste posterior dentro del ecosistema Ultralytics, ya que se distribuye como checkpoint compatible con esa librería.
- Exportación a otros formatos de inferencia soportados por el framework (ONNX, TensorRT, OpenVINO, entre otros), aunque no se documenta explícitamente para este checkpoint.
- Posible encadenamiento con algoritmos de seguimiento multiobjeto del propio framework (por ejemplo ByteTrack o BoT-SORT) para obtener trazas; esto es una capacidad del framework, no una funcionalidad declarada en la model card.
- No dispone de capacidades de lenguaje, tool calling, agentes, razonamiento multi-paso, audio ni multimodalidad.

## Casos de uso

- Análisis de vídeo de tráfico urbano: el modelo puede procesar fotogramas de cámaras fijas para contar vehículos y peatones por clase, gracias a su coste computacional muy bajo (6,6 GFLOPs a 640 px) y a su tamaño de 2,6 M de parámetros, que permite ejecutarlo en continuo sobre varios flujos.
- Asistencia a la conducción (ADAS) en hardware embebido: la detección de `car`, `person`, `bike` y `motor` puede alimentar módulos de aviso de colisión o de monitorización de punto ciego en plataformas tipo Jetson, donde un detector nano es la única opción viable en tiempo real.
- Inventario de señalización viaria: las clases `traffic sign` (mAP@50 67,19 %) y `traffic light` (64,21 %) permiten construir inventarios automáticos de señalización a partir de grabaciones de vehículos de flota, útiles para mantenimiento de infraestructura.
- Etiquetado asistido y preanotación: al ser un modelo pequeño y rápido, resulta adecuado para preanotar grandes volúmenes de imágenes de conducción antes de la revisión humana, reduciendo el coste de construir nuevos conjuntos de datos.
- Base de referencia en investigación: dentro de DetectionBench sirve como punto de comparación reproducible frente a otros detectores nano, permitiendo aislar el efecto de la arquitectura cuando la receta de entrenamiento es idéntica.
- Despliegue en nodos de borde sin GPU dedicada: con pesos de aproximadamente 10,4 MB en FP32 o 5,2 MB en FP16 (cálculo derivado del número de parámetros), puede ejecutarse en CPU, Raspberry Pi o dispositivos similares usando exportaciones ligeras.
- Monitorización de ocupación de carriles y aforo: combinado con seguimiento multiobjeto del framework, permitiría estimar flujos y direcciones de circulación en estudios de movilidad.
- Prototipado rápido: su integración con la librería Ultralytics facilita validar hipótesis de producto (por ejemplo, detección de peatones en un aparcamiento) en cuestión de horas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card, evaluados sobre el split de test de BDD100K con el pipeline `detectionbench-evaluate`. Ninguno está verificado (`verified: false`).

| Métrica | Valor |
|---|---|
| mAP@50 (test split) | 51,63 % |
| mAP@50-95 (test split) | 29,06 % |
| Precision (test split) | 71,68 % |
| Recall (test split) | 46,34 % |
| F1 Score | 56,29 % |
| Parámetros | 2,6 M |
| FLOPs | 6,6 B a 640 px |

Rendimiento por clase declarado en la model card:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| person | 60,53 % | 30,32 % |
| rider | 40,86 % | 20,37 % |
| car | 79,28 % | 49,08 % |
| truck | 61,50 % | 44,39 % |
| bus | 59,73 % | 46,07 % |
| train | 0,00 % | 0,00 % |
| motor | 41,01 % | 19,35 % |
| bike | 42,01 % | 20,75 % |
| traffic light | 64,21 % | 24,62 % |
| traffic sign | 67,19 % | 35,70 % |

## Requisitos de hardware

- VRAM estimada: no se publica ninguna medición. Como referencia derivada del número de parámetros, los pesos ocupan aproximadamente 10,4 MB en FP32, 5,2 MB en FP16 y 2,6 MB en INT8; el consumo total en inferencia a 640 px y lote 1 se mantiene muy por debajo de 1 GB en la práctica, pero este dato no está confirmado por el autor.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente. Para entrenamiento o lotes grandes se aprovecharían tarjetas tipo RTX 3060/4090 o A100/H100, pero para inferencia el modelo está sobredimensionado en cualquiera de ellas.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en iGPU. También es viable en CPU.
- Hardware de borde: plataformas tipo NVIDIA Jetson (Nano, Orin), Raspberry Pi 4/5 o aceleradores NPU mediante exportación a ONNX/OpenVINO/TFLite son candidatos naturales por el tamaño del modelo, si bien no hay validación publicada.
- Opciones de despliegue: la librería declarada es Ultralytics, por lo que la vía natural es su API de Python o su CLI y la exportación a ONNX, TensorRT, OpenVINO, CoreML o TFLite. Servidores de inferencia especializados para LLM como vLLM no son aplicables a este modelo.
- Latencia y throughput: no disponibles. La model card no incluye mediciones de FPS, latencia por imagen ni rendimiento en ningún hardware concreto.

## Comparativa con modelos similares

La model card incluye un zoo de modelos entrenados y evaluados por DetectionBench sobre BDD100K con la misma receta. Los valores de mAP, precision y recall proceden de esa tabla; los parámetros de los modelos comparados no se declaran en la información disponible.

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall | Parámetros | Licencia |
|---|---|---|---|---|---|---|
| YOLOv26n | 52,25 % | 29,23 % | 72,56 % | 46,87 % | No disponible | No disponible |
| YOLOv9t | 52,04 % | 29,46 % | 71,34 % | 46,72 % | No disponible | No disponible |
| YOLOv10n | 51,95 % | 29,31 % | 71,58 % | 46,62 % | No disponible | No disponible |
| YOLOv8n | 51,67 % | 29,09 % | 70,95 % | 46,59 % | No disponible | No disponible |
| YOLOv11n (este modelo) | 51,63 % | 29,06 % | 71,68 % | 46,34 % | 2,6 M | AGPL-3.0 |

Las diferencias entre los cinco modelos son de 0,6 puntos de mAP@50 o menos, dentro del margen habitual de variación entre ejecuciones, por lo que la model card no permite concluir una superioridad clara de ninguna arquitectura. YOLOv11n presenta la precisión más alta del grupo después de YOLOv26n, pero también el recall más bajo.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero obliga a liberar el código de la obra derivada bajo la misma licencia y a ofrecer el código fuente a los usuarios que interactúen con el servicio a través de red; conviene revisarlo con asesoría legal antes de integrarlo en un producto propietario.
- Licencia del conjunto de datos: BDD100K se distribuye bajo su propia licencia, restringida a investigación y educación no comercial, con registro obligatorio y prohibición de redistribución. Esto condiciona el uso del modelo ajustado sobre esos datos, ya que la model card indica explícitamente que el dataset no se replica en Hugging Face.
- Recall bajo: 46,34 % en el split de test. Casi la mitad de los objetos anotados no se recuperan, lo que implica falsos negativos frecuentes, especialmente problemático en aplicaciones de seguridad.
- Clase `train` con rendimiento nulo: mAP@50 y mAP@50-95 de 0,00 %. El modelo no es fiable para detectar trenes, probablemente por escasez de ejemplos en el conjunto de datos.
- Clases minoritarias débiles: `rider` (40,86 % mAP@50), `motor` (41,01 %) y `bike` (42,01 %) están muy por debajo de `car` (79,28 %), lo que limita su uso en escenarios de micromovilidad.
- Dominio restringido: BDD100K está compuesto por escenas de conducción, mayoritariamente de Estados Unidos. No hay datos sobre su comportamiento en otras geografías, condiciones meteorológicas adversas, visión nocturna, imágenes aéreas o domésticas.
- Sesgos potenciales: los sesgos del conjunto de datos (composición de vehículos, condiciones de captura, distribución geográfica y horaria) se heredan en el modelo. La model card no incluye ningún análisis de sesgo ni de equidad.
- Objetos pequeños y oclusión: aunque la model card incluye curvas de precisión-exhaustividad y matrices de confusión, no se aportan métricas desglosadas por tamaño de objeto ni por nivel de oclusión, factores críticos en detección de peatones y señalización.
- Benchmarks sin verificar: todos los resultados figuran con `verified: false`; son cifras declaradas por el autor y no auditadas de forma independiente.
- Disponibilidad incierta: el repositorio muestra 0 descargas, 0 «likes» y un tamaño de 0,0 GB, por lo que no está claro si los pesos están efectivamente publicados. El texto de uso de la model card queda truncado y no documenta el comando de inferencia completo.
- Sin datos de hardware ni latencia: no hay ninguna medición de rendimiento por segundo ni de consumo, lo que obliga a medirlos en el hardware objetivo antes de dimensionar un despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-yolo11n
- Repositorio DetectionBench (origen de los resultados): https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLO11
- Documentación del framework Ultralytics: https://docs.ultralytics.com
- Conjunto de datos BDD100K (descarga oficial): https://www.bdd100k.com/
- Identificadores arXiv declarados en las etiquetas del repositorio (los títulos no se especifican en la información disponible):
  - https://arxiv.org/abs/2410.17725
  - https://arxiv.org/abs/2405.14458
  - https://arxiv.org/abs/2606.03748
  - https://arxiv.org/abs/2402.13616
- Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con DetectionBench; los resultados obtenidos eran contenido no pertinente y se han descartado.
