# dronefreak/uavdt-yolov9s

## Resumen

uavdt-yolov9s es un detector de objetos YOLOv9s afinado sobre el conjunto de datos UAVDT (vehículos aéreos no tripulados) por el usuario dronefreak, dentro del proyecto DetectionBench. Se trata de un modelo denso de visión por computador con 7,3 millones de parámetros y 27,6 GFLOPs a 640 píxeles de resolución de entrada, especializado en la detección de tres clases de vehículos —coche, camión y autobús— en imágenes y vídeo capturados desde drones.

El modelo parte de los pesos Ultralytics/YOLOv9 y se ha reentrenado sobre el split de entrenamiento de UAVDT, evaluándose sobre el split de prueba con el pipeline estándar de DetectionBench (`detectionbench-evaluate`). Su relevancia radica en que forma parte de un conjunto de referencia reproducible: el autor publica una tabla comparativa con otros detectores modernos (RF-DETR, YOLOv8, YOLOv9t, YOLOv10, YOLOv11, YOLOv26) entrenados con recetas idénticas, lo que permite comparaciones justas en el dominio aéreo.

No es un modelo generativo ni multimodal: no procesa lenguaje natural, no soporta tool calling ni agentes. Es un checkpoint de detección de objetos, distribuido en formato PyTorch (best.pt) y pensado para inferencia con la librería Ultralytics. La licencia es AGPL-3.0, lo que condiciona su uso en productos propietarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv9s (red convolucional de detección en una etapa; base Ultralytics/YOLOv9) |
| Parametros totales | 7,3 M |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de visión no generativo; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible en la información proporcionada (el autor solo publica el checkpoint PyTorch) |
| Idiomas soportados | no aplica (modelo de visión; etiquetas de clase en inglés: car, truck, bus) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (best.pt), cargado con Ultralytics |
| Tarea (pipeline) | object-detection |
| Resolución de evaluación | 640 px (según los 27,6 GFLOPs declarados a esa resolución) |
| FLOPs | 27,6 B a 640 px |
| Clases | car, truck, bus |
| Dataset de entrenamiento | UAVDT (dronefreak/UAVDT) |
| Framework | Ultralytics |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv9s, un detector convolucional de una sola etapa que, en la formulación publicada del modelo base (arXiv:2402.13616), introduce GELAN (red de agregación de capas eficiente y generalizada) como bloque de extracción de características y PGI (información de gradiente programable) para mitigar la pérdida de información durante el paso por capas profundas. La model card de este checkpoint no detalla la configuración interna ni describe modificaciones sobre el modelo base, por lo que se asume que la topología es la del YOLOv9s estándar de Ultralytics.

Los detalles de entrenamiento (número de épocas, composición exacta del dataset, aumentos de datos, hiperparámetros, uso o no de fases de ajuste adicionales) no se especifican en la información disponible. Lo que sí se declara es el protocolo de evaluación: las métricas se calculan sobre el split de prueba de UAVDT con el pipeline estándar de DetectionBench, y el modelo se entrenó y evaluó dentro de ese mismo marco, diseñado explícitamente para aplicar recetas de entrenamiento y métricas idénticas a varios detectores. El dataset UAVDT está orientado a vigilancia de tráfico capturada desde drones y contiene tres clases de vehículos.

## Capacidades

- Detección de objetos en imágenes aéreas: localiza y clasifica vehículos de las clases car, truck y bus con cajas delimitadoras.
- Detección de objetos pequeños: el modelo está afinado sobre UAVDT, un dominio donde los vehículos ocupan pocos píxeles, aunque su rendimiento en las clases minoritarias es bajo (ver sección de benchmarks).
- Inferencia sobre vídeo: el pipeline de Ultralytics permite procesar fotogramas consecutivos, aunque el modelo no incorpora seguimiento (tracking) por sí mismo.
- Integración con el ecosistema Ultralytics: carga directa mediante `YOLO(weights)` y uso de la API `predict`/`val`/`train`.
- Exportación a otros formatos: el framework Ultralytics contempla exportaciones a ONNX, TensorRT, OpenVINO y TFLite, pero la model card de este checkpoint no lo confirma.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades de visión-lenguaje (VLM): no describe imágenes ni responde a prompts.
- Capacidades multilingües: no aplica.

## Casos de uso

- Vigilancia de tráfico con drones: el modelo detecta coches, camiones y autobuses en fotogramas capturados por UAV, adecuado para monitorizar carreteras y autopistas donde no hay cámaras fijas. Su rendimiento en la clase car (mAP@50 de 72,93) lo hace útil para conteo de turismos, con cautela en vehículos pesados.
- Análisis de flujo vehicular y aforo: procesando secuencias de vídeo aéreo y contando detecciones por fotograma se pueden estimar densidades y volúmenes de tráfico por carril o por tramo.
- Detección de congestión y gestión de incidentes: la presencia simultánea de múltiples detecciones de vehículos en una región permite señalar atascos o acumulaciones anómalas en tiempo casi real.
- Baseline reproducible para investigación: al estar integrado en DetectionBench, sirve como punto de comparación con receta fija frente a RF-DETR, YOLOv8, YOLOv9t, YOLOv10, YOLOv11 y YOLOv26 sobre UAVDT, lo que facilita publicar resultados comparables.
- Punto de partida para fine-tuning en dominio aéreo propio: con 7,3 M de parámetros y pesos de partida sobre imágenes de dron, es un candidato razonable para reentrenar sobre datasets aéreos específicos (inspección de infraestructuras, vigilancia portuaria) con coste computacional bajo.
- Despliegue en borde sobre dron: su tamaño reducido permite embeberlo en plataformas con GPU integrada para inferencia a bordo, reduciendo la dependencia de enlace de datos con tierra.
- Monitorización de infraestructuras viarias: detección de vehículos en obras, peajes o áreas restringidas mediante vuelos periódicos, con análisis posterior de las detecciones.
- Auditoría y evaluación de detectores: uso del checkpoint junto con `detectionbench-evaluate` para verificar protocolos de evaluación y reproducibilidad en el dominio UAV.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (todos con `verified: false`, es decir, no verificados de forma independiente), sobre el split de prueba de UAVDT:

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 31,82 |
| mAP@50-95 | 18,71 |
| Precision | 39,83 |
| Recall | 38,12 |
| F1 | 38,96 |

Comparativa publicada por el autor (UAVDT Model Zoo, todos evaluados con el mismo pipeline):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Nano | 32,78 | 20,31 | 73,60 | 66,98 |
| YOLOv9s (este modelo) | 31,82 | 18,71 | 39,83 | 38,12 |
| YOLOv9t | 29,42 | 17,03 | 35,75 | 36,47 |
| YOLOv26n | 28,88 | 16,79 | 33,14 | 35,66 |
| YOLOv11n | 28,56 | 16,30 | 38,04 | 32,26 |
| YOLOv8n | 27,80 | 15,34 | 35,42 | 33,61 |
| YOLOv10n | 27,17 | 15,16 | 33,30 | 31,21 |
| YOLOv8s | 27,12 | 15,33 | 34,65 | 31,87 |

Rendimiento por clase (mAP@50 / mAP@50-95):

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| car | 72,93 | 40,38 |
| truck | 9,73 | 6,34 |
| bus | 12,80 | 9,42 |

## Requisitos de hardware

- Peso de los parámetros (estimación a partir de los 7,3 M declarados): aproximadamente 29 MB en FP32 y 15 MB en FP16. Dato no confirmado por el autor.
- VRAM para inferencia: no hay mediciones publicadas. Con 640 px de entrada y lote 1, la huella esperada de un detector de 7,3 M de parámetros es de un rango de 1 a 2 GB, pero es una estimación, no un dato verificado.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU con al menos 4 GB de memoria debería poder ejecutar el modelo en FP16 o FP32.
- GPU de consumo: cabe previsiblemente en tarjetas de gama media y baja (por ejemplo, GTX 1650, RTX 3050, RTX 4060) e incluso en plataformas embebidas tipo NVIDIA Jetson, aunque no hay cifras confirmadas.
- Opciones de despliegue: el modelo se distribuye para la librería Ultralytics (PyTorch). El framework contempla exportación a ONNX, TensorRT, OpenVINO y TFLite, pero la model card no confirma formatos exportados ni compatibilidad con servidores de inferencia como vLLM o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible. No se publican mediciones de milisegundos por imagen ni de FPS en ninguna GPU concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | mAP@50 (UAVDT) | mAP@50-95 (UAVDT) | Precision / Recall | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| uavdt-yolov9s (este) | 7,3 M | 31,82 | 18,71 | 39,83 / 38,12 | AGPL-3.0 | HuggingFace, repo de 0,0 GB |
| RF-DETR Nano | no disponible | 32,78 | 20,31 | 73,60 / 66,98 | no disponible en la información | citado en la tabla del autor |
| YOLOv9t | no disponible | 29,42 | 17,03 | 35,75 / 36,47 | no disponible en la información | citado en la tabla del autor |
| YOLOv11n | no disponible | 28,56 | 16,30 | 38,04 / 32,26 | no disponible en la información | citado en la tabla del autor |
| YOLOv8s | no disponible | 27,12 | 15,33 | 34,65 / 31,87 | no disponible en la información | citado en la tabla del autor |

En la comparativa publicada, este checkpoint obtiene el segundo mejor mAP@50 y mAP@50-95 del conjunto, por detrás de RF-DETR Nano, pero con una precisión y un recall muy inferiores a los de RF-DETR Nano (39,83/38,12 frente a 73,60/66,98). No se dispone de datos de parámetros, licencia ni contexto de los modelos alternativos más allá de las métricas incluidas en la tabla del autor.

## Limitaciones y advertencias

- Desequilibrio severo entre clases: la clase car alcanza un mAP@50 de 72,93, mientras que truck se queda en 9,73 y bus en 12,80. En la práctica, el modelo es fiable para turismos y poco fiable para vehículos pesados.
- Precisión y recall globales bajos: en torno al 38-40 %. Esto implica un volumen considerable de falsos positivos y falsos negativos en uso real.
- Métricas no verificadas: el model-index marca los cuatro valores como `verified: false`; no hay validación independiente de los resultados.
- Especificidad de dominio: entrenado exclusivamente sobre UAVDT (imágenes aéreas de tráfico, tres clases). El rendimiento fuera de ese dominio (otras altitudes, sensores, condiciones meteorológicas o clases distintas) es desconocido y probablemente degradado.
- Sin información sobre sesgos: no se documenta el equilibrio geográfico, temporal o de condiciones de captura del dataset, ni sus implicaciones en el comportamiento del modelo.
- Riesgo de alucinación en sentido estricto: no aplica (no es un modelo generativo), pero sí existe riesgo de detecciones espurias, especialmente en las clases minoritarias.
- Licencia AGPL-3.0: licencia copyleft fuerte. El uso del modelo en un servicio ofrecido por red puede obligar a liberar el código fuente derivado. Es un obstáculo relevante para integraciones comerciales propietarias.
- Tamaño del repositorio de 0,0 GB: el repositorio de HuggingFace figura con un tamaño de 0,0 GB, lo que sugiere que los pesos (`best.pt`) podrían no estar presentes o no estar contabilizados. Conviene verificar la descarga antes de integrar el modelo en un pipeline.
- Adopción nula y sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni informes de terceros.
- Sin información sobre cuantización ni formatos exportados: cualquier despliegue en producción requerirá que el equipo realice y valide su propia conversión (ONNX, TensorRT, etc.).
- Sin datos de latencia, throughput ni consumo: no es posible dimensionar infraestructura con la información publicada.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/dronefreak/uavdt-yolov9s
- Dataset UAVDT del autor: https://huggingface.co/datasets/dronefreak/UAVDT
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Modelo base: https://huggingface.co/Ultralytics/YOLOv9
- Referencias arXiv citadas en las etiquetas del repositorio: https://arxiv.org/abs/1804.00518 , https://arxiv.org/abs/2402.13616 , https://arxiv.org/abs/2511.09554 , https://arxiv.org/abs/2304.07193 , https://arxiv.org/abs/2405.14458 , https://arxiv.org/abs/2410.17725 , https://arxiv.org/abs/2606.03748 (la correspondencia de cada identificador con un artículo concreto no se detalla en la información disponible; 1804.00518 corresponde al benchmark UAVDT y 2402.13616 al artículo de YOLOv9)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: únicamente aparecieron páginas no relacionadas de un fabricante de bicicletas, por lo que no se incluyen.
