# dronefreak/bdd100k-rfdetr-nano

## Resumen

El modelo `dronefreak/bdd100k-rfdetr-nano` es un detector de objetos de la familia RF-DETR (DETR, end-to-end) afinado por el usuario dronefreak sobre el conjunto de datos BDD100K, centrado en escenas de conducción. Parte del checkpoint base `Roboflow/rf-detr-nano`, un detector denso de 30,5 millones de parámetros, y se distribuye bajo licencia Apache-2.0 con la librería `rfdetr` como dependencia de ejecución. El repositorio ocupa 0,1 GB y la model card indica fecha de creación del 22 de septiembre de 2026.

El problema que resuelve es la detección reproducible de 10 clases relevantes para conducción (persona, ciclista con vehículo, coche, camión, autobús, tren, motocicleta, bicicleta, semáforo y señal de tráfico) con una receta de entrenamiento y evaluación homogénea, dentro del framework DetectionBench. Su relevancia actual es doble: por un lado, ofrece un punto de comparación limpio frente a detectores YOLO de la misma escala; por otro, demuestra que un detector basado en DETR puede superar a las variantes nano de YOLO en mAP@50 sobre BDD100K con un presupuesto de parámetros moderado.

Los resultados declarados en el split de test de BDD100K son mAP@50 de 56,9, mAP@50-95 de 31,58, precisión de 80,68 y recall de 64,78 (F1 de 71,86). No hay información pública sobre benchmarks adicionales, cuantizaciones, latencia ni formato exacto de los pesos más allá de lo indicado en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector DETR end-to-end (familia RF-DETR); backbone y detalles internos no disponibles en la información facilitada |
| Parametros totales | 30,5 M |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de detección de objetos, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión por computador, no procesa lenguaje natural) |
| Licencia | Apache-2.0 (pesos); el dataset de entrenamiento BDD100K tiene licencia propia no comercial |
| Formato de pesos | no disponible (repositorio de 0,1 GB, librería `rfdetr`, etiqueta `pytorch`) |
| Número de clases | 10 (person, rider, car, truck, bus, train, motor, bike, traffic light, traffic sign) |
| Resolución de entrada | no disponible |
| FLOPs | no disponible (no publicados por el proyecto upstream) |
| Tarea (*pipeline*) | object-detection |

## Arquitectura y entrenamiento

Se trata de un ajuste fino (*fine-tune*) del checkpoint `Roboflow/rf-detr-nano` sobre BDD100K. El modelo base pertenece a la familia RF-DETR, que sigue la formulación DETR: predicción de conjuntos de forma end-to-end, sin el post-procesado de supresión de no máximos (NMS) típico de la familia YOLO. La model card no detalla el backbone concreto, la resolución de entrenamiento, el número de tokens o imágenes vistas, ni la composición exacta de las muestras; tampoco indica fases de alineación tipo RLHF o DPO, algo que no aplica a un detector de objetos. El único dato cuantitativo de tamaño es el recuento de 30,5 M de parámetros.

El entrenamiento y la evaluación se realizaron dentro de DetectionBench (https://github.com/dronefreak/DetectionBench), un framework que aplica recetas de entrenamiento idénticas y el mismo protocolo de métricas a varios detectores sobre los mismos datasets, lo que permite comparaciones entre arquitecturas sin sesgo de hiperparámetros. Las métricas se calcularon sobre el split de test de BDD100K con el pipeline `detectionbench-evaluate`, usando las métricas de detección de la librería Supervision (https://github.com/roboflow/supervision). La model card advierte de que este pipeline no genera gráficas de curva PR, curva F1 ni matriz de confusión al estilo del validador de Ultralytics.

## Capacidades

- Detección de objetos en imágenes y vídeo de escenas de conducción, con cajas delimitadoras y etiqueta de clase para 10 categorías.
- Clases cubiertas: persona, rider, coche, camión, autobús, tren, motocicleta, bicicleta, semáforo y señal de tráfico.
- Rendimiento especialmente sólido en coche (mAP@50 78,84), señal de tráfico (70,08), autobús (67,21), camión (66,70) y semáforo (64,87).
- Inferencia sobre vídeo: el repositorio incluye un vídeo de demostración (`assets/demo_banner.mp4`) con detecciones sobre dos clips de test de BDD100K.
- Integración con el ecosistema Roboflow/Supervision para evaluación y visualización de detecciones.
- No soporta *tool calling* ni *function calling* (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de modo *thinking*, visión-lenguaje, audio, segmentación ni estimación de pose.

## Casos de uso

- Percepción para prototipos de conducción autónoma y ADAS: el modelo entrega cajas para vehículos, peatones, ciclistas, señales y semáforos en un único paso de inferencia, con 30,5 M de parámetros, lo que permite integrarlo en bucles de percepción en tiempo real sobre vídeo de cámara frontal.
- Análisis de tráfico urbano: conteo y clasificación de coches, autobuses, camiones, motocicletas y bicicletas a partir de cámaras fijas, usando mAP@50 de 78,84 en coche y 67,21 en autobús como referencia de fiabilidad por clase.
- Auditoría de señalización vial: inventario automático de señales de tráfico y semáforos en grabaciones de flota (mAP@50 de 70,08 y 64,87 respectivamente), para detectar señalización degradada o ausente.
- Preanotación de datasets de conducción: generar cajas candidatas que luego revisa un anotador humano, reduciendo el coste de etiquetado en proyectos de visión para automoción.
- Análisis de dashcams para siniestros y seguros: reconstrucción de la escena (posición relativa de vehículos y peatones) a partir de grabaciones, aprovechando que el modelo cubre tanto vehículos como usuarios vulnerables de la vía.
- Monitorización de seguridad en entornos logísticos y de carga: detección de peatones y ciclistas en zonas de maniobra de camiones y autobuses, donde la precisión declarada de 80,68 reduce las falsas alarmas.
- Despliegue en *edge*: con 30,5 M de parámetros, el checkpoint cabe con holgura en GPUs integradas y dispositivos tipo Jetson, lo que habilita cámaras inteligentes o unidades a bordo sin conectividad.
- Investigación comparativa de detectores: usar el checkpoint como referencia RF-DETR nano dentro del arnés de DetectionBench frente a YOLOv8n, YOLOv9t, YOLOv10n, YOLOv11n y YOLOv26n bajo recetas idénticas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de BDD100K (métricas marcadas como no verificadas de forma independiente en la model card):

| Metrica | Valor (%) |
|---|---|
| mAP@50 | 56,90 |
| mAP@50-95 | 31,58 |
| Precision | 80,68 |
| Recall | 64,78 |
| F1 | 71,86 |

Comparativa del *model zoo* de BDD100K publicado en la propia model card (mismos datos, misma receta y misma evaluación):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| RF-DETR Nano (este modelo) | 56,90 | 31,58 | 80,68 | 64,78 |
| YOLOv26n | 52,25 | 29,23 | 72,56 | 46,87 |
| YOLOv9t | 52,04 | 29,46 | 71,34 | 46,72 |
| YOLOv10n | 51,95 | 29,31 | 71,58 | 46,62 |
| YOLOv8n | 51,67 | 29,09 | 70,95 | 46,59 |
| YOLOv11n | 51,63 | 29,06 | 71,68 | 46,34 |

Rendimiento por clase sobre BDD100K test:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| person | 61,50 | 29,93 |
| rider | 49,23 | 25,13 |
| car | 78,84 | 46,87 |
| truck | 66,70 | 47,33 |
| bus | 67,21 | 50,21 |
| train | 5,43 | 3,79 |
| motor | 52,81 | 26,78 |
| bike | 52,34 | 25,74 |
| traffic light | 64,87 | 23,88 |
| traffic sign | 70,08 | 36,18 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo derivado del recuento de parámetros, no publicado por el autor): aproximadamente 0,12 GB en FP32 y 0,06 GB en FP16 solo para los pesos, más el coste de activaciones, que depende de la resolución de entrada (no documentada).
- Al tratarse de un modelo de 30,5 M de parámetros, es viable en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso GPUs integradas o CPU para inferencia de baja frecuencia.
- Cabe en dispositivos de borde tipo NVIDIA Jetson (Nano, Orin) para despliegues sin conectividad.
- No hay datos publicados de latencia ni de *throughput* (FPS) para este checkpoint.
- Opciones de despliegue documentadas: librería `rfdetr` (PyTorch), con evaluación mediante `detectionbench-evaluate` y las métricas de detección de Supervision.
- No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; son herramientas orientadas a modelos de lenguaje y no aplican a este tipo de checkpoint.
- No se documentan exportaciones a ONNX, TensorRT, CoreML ni formatos GGUF.

## Comparativa con modelos similares

Todos los modelos de la tabla pertenecen a la misma categoría (detectores en tiempo real de escala reducida) y fueron evaluados sobre BDD100K con la misma receta dentro de DetectionBench.

| Modelo | Parametros | Contexto | mAP@50 (BDD100K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RF-DETR Nano (este modelo) | 30,5 M | no aplica | 56,90 | Apache-2.0 | HuggingFace (`dronefreak/bdd100k-rfdetr-nano`) |
| YOLOv8n | no disponible en la información facilitada | no aplica | 51,67 | no disponible en la información facilitada | publicada por DetectionBench |
| YOLOv9t | no disponible en la información facilitada | no aplica | 52,04 | no disponible en la información facilitada | publicada por DetectionBench |
| YOLOv10n | no disponible en la información facilitada | no aplica | 51,95 | no disponible en la información facilitada | publicada por DetectionBench |
| YOLOv11n | no disponible en la información facilitada | no aplica | 51,63 | no disponible en la información facilitada | publicada por DetectionBench |
| YOLOv26n | no disponible en la información facilitada | no aplica | 52,25 | no disponible en la información facilitada | publicada por DetectionBench |

Observaciones: el RF-DETR nano supera a las cinco variantes YOLO nano comparadas tanto en mAP@50 (56,90 frente a 51,63-52,25) como en recall (64,78 frente a 46,34-46,87), con una precisión también superior (80,68 frente a 70,95-72,56). No se dispone de datos de latencia ni de parámetros de los modelos YOLO en la información facilitada, por lo que no puede compararse la eficiencia computacional.

## Limitaciones y advertencias

- La clase `train` es prácticamente inoperativa (mAP@50 de 5,43 y mAP@50-95 de 3,79), casi con total seguridad por escasez de ejemplos en el dataset; no debe usarse para detección ferroviaria.
- El recall declarado es de 64,78 frente a una precisión de 80,68: el modelo es conservador y tiende a producir falsos negativos, algo crítico en aplicaciones de seguridad vial.
- Todas las métricas están marcadas como no verificadas (`verified: false`) y proceden del propio autor; no han pasado revisión independiente.
- El repositorio presenta 0 descargas y 0 *likes* en el momento de la consulta, por lo que no existe validación por parte de terceros.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de detecciones espurias y de cajas mal localizadas fuera del dominio de entrenamiento.
- Sesgo de dominio: BDD100K está compuesto por escenas de conducción principalmente de Estados Unidos; el rendimiento puede degradarse en otras geografías, condiciones meteorológicas, tipos de vía o resoluciones de cámara.
- No se documenta el tratamiento de desequilibrio de clases, la composición del conjunto de entrenamiento ni los hiperparámetros usados.
- Restricción legal relevante: aunque los pesos se publican bajo Apache-2.0, el dataset BDD100K se distribuye con su propia licencia, limitada a investigación y educación no comercial, con registro obligatorio y prohibición de redistribución. Esto genera incertidumbre sobre el uso comercial de un modelo entrenado con esos datos.
- No hay información sobre cuantizaciones, formato exacto de pesos, resolución de entrada ni requisitos de hardware, lo que complica planificar un despliegue en producción.
- El repositorio indica fecha de creación y actualización del 22 de septiembre de 2026, dato que se reproduce tal cual aparece en HuggingFace.
- Las búsquedas web realizadas durante la elaboración de esta ficha no devolvieron resultados relevantes sobre el modelo; los únicos resultados obtenidos fueron páginas de soporte de Microsoft, sin relación con el contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/bdd100k-rfdetr-nano
- Modelo base: https://huggingface.co/Roboflow/rf-detr-nano
- Framework DetectionBench: https://github.com/dronefreak/DetectionBench
- Dataset BDD100K (descarga y licencia): https://www.bdd100k.com/
- Librería Supervision (métricas de evaluación): https://github.com/roboflow/supervision
- Vídeo de demostración: https://huggingface.co/dronefreak/bdd100k-rfdetr-nano/resolve/main/assets/demo_banner.mp4
- Póster del vídeo de demostración: https://huggingface.co/dronefreak/bdd100k-rfdetr-nano/resolve/main/assets/demo_banner_poster.jpg
- Referencias arXiv incluidas en las etiquetas del repositorio: https://arxiv.org/abs/2511.09554, https://arxiv.org/abs/2304.07193, https://arxiv.org/abs/2405.14458, https://arxiv.org/abs/2410.17725, https://arxiv.org/abs/2606.03748, https://arxiv.org/abs/2402.13616 (títulos no disponibles en la información facilitada)
