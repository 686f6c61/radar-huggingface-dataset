# dronefreak/bdd100k-yolov8m

## Resumen

El modelo `dronefreak/bdd100k-yolov8m` es un detector de objetos YOLOv8m afinado sobre el conjunto de datos BDD100K (Berkeley DeepDrive), orientado a escenas de conducción real. Lo publica el usuario dronefreak como parte de DetectionBench, un marco de trabajo cuyo objetivo es reproducir de forma homogénea el entrenamiento y la evaluación de detectores modernos sobre varios conjuntos de datos del mundo real, de manera que las comparaciones entre arquitecturas sean justas. No es un modelo de lenguaje: su tarea es la detección de objetos en imágenes (`pipeline_tag: object-detection`) con la librería Ultralytics.

Arquitectónicamente es un YOLOv8m, la variante media de la familia YOLOv8 de Ultralytics, con 25,9 millones de parámetros y 78,9 GFLOPs a una resolución de entrada de 640 píxeles. Detecta diez clases propias del dominio de conducción: persona, ciclista (rider), coche, camión, autobús, tren, motocicleta, bicicleta, semáforo y señal de tráfico. El repositorio ocupa 0,1 GB y los pesos se distribuyen en formato PyTorch (`best.pt`), cargables directamente con la API de Ultralytics.

Su relevancia es doble: por un lado ofrece una línea base reproducible para percepción en conducción autónoma y análisis de tráfico; por otro, forma parte de una comparativa abierta con otros detectores (YOLO26, YOLO11, YOLOv10, YOLOv9, RF-DETR) evaluados con la misma receta. En el split de test de BDD100K declara 60,89 % de mAP@50 y 35,47 % de mAP@50-95, con 25,9 M de parámetros, unos números modestos frente a los estándares actuales del benchmark, pero útiles como referencia de base. La licencia AGPL-3.0 condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv8m (red convolucional de detección de objetos de una sola etapa, familia Ultralytics YOLOv8) |
| Parámetros totales | 25,9 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no procesa texto) |
| Tipos de cuantización | No disponible en la información proporcionada. El ecosistema Ultralytics permite exportar el modelo a FP16, INT8 y formatos como ONNX, TensorRT, OpenVINO, TFLite y CoreML |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, fichero `best.pt`) |
| Tarea | Detección de objetos (`object-detection`) |
| FLOPs | 78,9 B a 640 px |
| Resolución de entrada de referencia | 640 px |
| Número de clases | 10 |
| Clases | person, rider, car, truck, bus, train, motor, bike, traffic light, traffic sign |
| Dataset de entrenamiento | BDD100K (`dronefreak/BDD100K`) |
| Framework / librería | Ultralytics YOLO; toolkit DetectionBench |
| Modelo base | Ultralytics/YOLOv8 |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

YOLOv8m es un detector de una sola etapa basado en convoluciones, sin componentes de atención ni mecanismos tipo transformer en la arquitectura base. La variante "m" (medium) se sitúa en el punto medio de la familia en cuanto a profundidad y anchura: 25,9 M de parámetros y 78,9 GFLOPs a 640 px, lo que la coloca en una franja adecuada para inferencia en tiempo real sobre GPU de gama media o incluso en hardware de borde. El modelo se ha obtenido por ajuste fino (*fine-tuning*) del checkpoint preentrenado Ultralytics/YOLOv8 sobre el conjunto BDD100K, no se ha entrenado desde cero.

La model card indica que el entrenamiento se realizó con el toolkit DetectionBench, que fija una receta común (misma configuración, mismos criterios de evaluación) para todos los detectores comparados en el proyecto. El número máximo de épocas configurado es 50, aunque el texto de la model card aparece truncado en el punto donde se detallaban las épocas efectivamente ejecutadas, por lo que ese dato concreto no está disponible. No se documenta en la información proporcionada el número total de tokens o imágenes vistas, la composición exacta de los splits, ni si hubo fases de aumento de datos específicas más allá del pipeline estándar de Ultralytics. Tampoco se mencionan innovaciones técnicas propias (decodificación especulativa, atención lineal u otras): se trata de un ajuste fino convencional con receta reproducible.

El conjunto BDD100K aporta escenas de conducción con variabilidad de iluminación, meteorología y densidad de tráfico, y sus diez clases de anotación están orientadas a percepción viaria. La evaluación declarada por el autor se realiza sobre el split de test con la herramienta `detectionbench-evaluate`.

## Capacidades

- Detección de objetos en imágenes de escenas de conducción para las diez clases de BDD100K (person, rider, car, truck, bus, train, motor, bike, traffic light, traffic sign).
- Localización con cajas delimitadoras y puntuación de confianza por detección, con umbral configurable (`conf=0.25` en el ejemplo de uso).
- Detección de usuarios vulnerables de la vía: peatones, ciclistas (`rider`), motocicletas y bicicletas.
- Detección de señalización viaria: semáforos y señales de tráfico.
- Inferencia sobre imagen suelta, lotes de imágenes, directorios y flujos de vídeo mediante la API `model.predict()` de Ultralytics.
- Exportación a formatos de despliegue alternativos a través del ecosistema Ultralytics (ONNX, TensorRT, OpenVINO, TFLite, CoreML), aunque no se documenta que el autor haya publicado artefactos ya exportados.
- Capacidad de servir como base para *transfer learning* adicional en dominios de conducción propios, dado su tamaño moderado (25,9 M de parámetros).
- No dispone de *tool calling*, *function calling*, razonamiento multi-paso ni capacidades de agente: no es un modelo de lenguaje.
- No dispone de modo *thinking*, ni de entrada o salida de audio, ni de descripción textual de imágenes (no hay componente visual-lenguaje).
- Capacidades multilingües: no aplica.

## Casos de uso

- Percepción para sistemas ADAS y conducción autónoma: el modelo entrega cajas de vehículos, peatones, ciclistas, señales y semáforos sobre fotogramas de cámara frontal, con 78,9 GFLOPs a 640 px, lo que permite integrarlo en un bucle de percepción en tiempo real sobre GPU de gama media. Su mAP@50 de 60,89 % lo hace apto como línea base o prototipo, no necesariamente como componente final de seguridad crítica.
- Analítica de tráfico urbano: procesamiento de vídeo de cámaras fijas para contar vehículos por clase (car, truck, bus, motor, bike) y estimar ocupación de carriles o flujos, aprovechando la clase `train` solo de forma marginal dado su rendimiento casi nulo.
- Etiquetado asistido (*auto-labeling*) en pipelines de anotación: el modelo puede preanotar grandes volúmenes de imágenes de conducción y reducir el coste de anotación humana, que después se revisa y se usa para reentrenar un detector propio. Su precisión del 66,52 % implica que la revisión humana sigue siendo necesaria.
- Monitorización de flotas con dashcam: análisis *a posteriori* de grabaciones para detectar presencia de peatones, ciclistas y vehículos en eventos concretos (frenadas bruscas, aproximaciones), como apoyo a la reconstrucción de incidentes.
- Análisis de infraestructura viaria: inventariado y auditoría de señalización (clase `traffic sign`, mAP@50 de 76,16 %) y de semáforos (mAP@50 de 71,82 %) a partir de recorridos grabados, útil para planes de mantenimiento.
- Sistemas de alerta para vehículos de dos ruedas y seguridad vial: la detección específica de las clases `bike`, `motor` y `rider` permite construir alertas de proximidad o estudios de exposición de usuarios vulnerables.
- Investigación en detección de objetos: al formar parte de DetectionBench con una receta de entrenamiento y evaluación homogénea, sirve como referencia reproducible para comparar técnicas de aumento de datos, *backbones* o estrategias de *fine-tuning* sobre BDD100K.
- Prototipado en robótica o vehículos no tripulados terrestres: un detector de 0,1 GB de pesos y 25,9 M de parámetros puede desplegarse en plataformas embebidas con GPU integrada (por ejemplo, Jetson) para experimentación en exteriores.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de BDD100K, obtenidos con el pipeline estándar de evaluación de DetectionBench. Los cuatro valores están marcados como `verified: false` en el model-index, es decir, no han sido verificados de forma independiente.

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 60,89 |
| mAP@50-95 | 35,47 |
| Precision | 66,52 |
| Recall | 55,42 |
| F1 | 60,46 |

Rendimiento por clase declarado por el autor:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| person | 72,57 | 38,71 |
| rider | 54,62 | 29,58 |
| car | 84,22 | 52,79 |
| truck | 70,40 | 51,88 |
| bus | 68,88 | 53,84 |
| train | 0,39 | 0,14 |
| motor | 52,60 | 27,01 |
| bike | 57,26 | 30,08 |
| traffic light | 71,82 | 28,89 |
| traffic sign | 76,16 | 41,77 |

No se han publicado en la información disponible otros resultados de benchmarks (por ejemplo, latencia, throughput o evaluación en otros conjuntos) distintos de los de la tabla anterior.

## Requisitos de hardware

- Tamaño de los pesos (estimación a partir de 25,9 M de parámetros): aproximadamente 104 MB en FP32, 52 MB en FP16 y 26 MB en INT8.
- VRAM estimada para inferencia a 640 px y lote 1: del orden de 1 a 2 GB en FP16, una cifra orientativa calculada a partir del tamaño de parámetros y de los 78,9 GFLOPs; no hay mediciones publicadas.
- GPUs recomendadas para producción con margen de lote: NVIDIA A100, H100, L4, T4 o RTX 4090; cualquiera de ellas sobra en memoria para este modelo y el factor limitante será la latencia, no la VRAM.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 3050, GTX 1660, GTX 1650 o inferiores en FP16, e incluso en INT8 sobre hardware de borde.
- Despliegue en CPU: viable mediante exportación a ONNX Runtime u OpenVINO, con rendimiento no documentado.
- Despliegue en borde: exportaciones a TensorRT, TFLite o CoreML permiten ejecución en plataformas tipo NVIDIA Jetson o móviles, aunque el autor no publica artefactos exportados.
- Opciones de despliegue: API Python de Ultralytics (la vía documentada en la model card, vía `hf_hub_download` + `YOLO(weights)`), y exportaciones a ONNX, TensorRT, OpenVINO, TFLite y CoreML. vLLM, llama.cpp, Ollama y TGI no aplican, ya que son servidores para modelos de lenguaje.
- Latencia y throughput: no disponible; la información proporcionada no incluye mediciones de tiempo de inferencia ni de FPS sobre ningún hardware.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoría (detectores de objetos evaluados sobre BDD100K con la misma receta de DetectionBench, según los datos del propio autor). Solo se dispone de los parámetros del modelo de esta ficha.

| Modelo | Parámetros | mAP@50 | mAP@50-95 | Precision | Recall | Licencia |
|---|---|---|---|---|---|---|
| YOLOv8m (este modelo) | 25,9 M | 60,89 | 35,47 | 66,52 | 55,42 | AGPL-3.0 |
| YOLO26s | No disponible | 58,76 | 33,86 | 75,49 | 53,07 | No disponible |
| YOLOv8s | No disponible | 57,93 | 33,25 | 75,38 | 51,63 | AGPL-3.0 para la familia Ultralytics YOLOv8 |
| YOLOv10s | No disponible | 57,64 | 33,34 | 75,02 | 52,12 | No disponible |
| YOLO11s | No disponible | 57,63 | 33,10 | 74,31 | 52,42 | No disponible |
| RF-DETR Nano | No disponible | 56,90 | 31,58 | 80,68 | 64,78 | No disponible |

Lectura de la tabla: el YOLOv8m de esta ficha lidera en mAP@50 y mAP@50-95 entre los modelos listados por el autor, a costa de un mayor coste computacional (25,9 M de parámetros frente a variantes "s" y "n"). En cambio, RF-DETR Nano obtiene una precisión muy superior (80,68 frente a 66,52) y un recall también mayor, con un mAP ligeramente inferior. No se dispone de datos de parámetros, contexto ni disponibilidad para el resto de modelos, por lo que la comparación se limita a las métricas de detección publicadas.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero obliga a liberar el código derivado bajo la misma licencia y, en escenarios de servicio en red, a ofrecer el código fuente a los usuarios del servicio. Conviene revisar las implicaciones con asesoría legal antes de integrarlo en un producto propietario o en un servicio SaaS.
- Clase `train` prácticamente inoperante: mAP@50 de 0,39 % y mAP@50-95 de 0,14 %. Cualquier aplicación que dependa de detectar trenes no es viable con este modelo.
- Rendimiento global modesto: 60,89 % de mAP@50 y 35,47 % de mAP@50-95, con una precisión del 66,52 % y un recall del 55,42 %. El recall relativamente bajo implica una proporción apreciable de objetos no detectados, relevante en aplicaciones de seguridad.
- Métricas no verificadas: los cuatro valores del model-index están marcados como `verified: false`, es decir, declarados por el autor y no reproducidos de forma independiente. El split de test utilizado es el definido por el propio pipeline de DetectionBench.
- Sin información sobre sesgos: no se documenta el desglose de rendimiento por condiciones de iluminación (día/noche), meteorología, geografía o densidad de tráfico, factores críticos en BDD100K. Tampoco hay análisis demográficos sobre la clase `person`.
- Riesgo de falsos positivos: aunque no existe "alucinación" en el sentido de un modelo generativo, sí hay riesgo de detecciones espurias, especialmente con umbrales de confianza bajos. El umbral de 0,25 del ejemplo de uso es orientativo y debe calibrarse por aplicación.
- Sin datos de resolución y objetos pequeños: se desconoce el rendimiento con objetos de pequeño tamaño, peatones lejanos o imágenes de alta resolución distintas de los 640 px de referencia.
- Model card truncada: la sección de configuración de entrenamiento aparece cortada en el apartado de épocas efectivamente ejecutadas, y no se detalla la composición del dataset ni el número de imágenes de entrenamiento.
- Adopción nula: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, sin validación por parte de la comunidad.
- Licencia del dataset BDD100K: no se especifica en la información proporcionada; conviene consultar la ficha del dataset (`dronefreak/BDD100K`) y las condiciones originales del Berkeley DeepDrive antes de un uso comercial.
- Idiomas: no aplica; el modelo no procesa ni genera texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-yolov8m
- Dataset en HuggingFace: https://huggingface.co/datasets/dronefreak/BDD100K
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base Ultralytics YOLOv8 en HuggingFace: https://huggingface.co/Ultralytics/YOLOv8
- Documentación de Ultralytics (framework de inferencia y exportación): https://docs.ultralytics.com/
- Búsqueda web realizada: no se han encontrado enlaces adicionales relevantes sobre este modelo; los resultados devueltos no guardan relación con el modelo ni con detección de objetos.
