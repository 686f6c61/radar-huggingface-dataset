# dronefreak/kitti-yolov9t

## Resumen

kitti-yolov9t es un detector de objetos YOLOv9t afinado específicamente sobre el conjunto de datos KITTI, orientado a escenas de conducción urbana. Lo publica el usuario dronefreak (Saumya Kumaar Saksena, investigador en percepción para movilidad autónoma) y forma parte de DetectionBench, un framework cuyo objetivo es reproducir benchmarks de detectores modernos bajo recetas de entrenamiento y métricas de evaluación idénticas. El modelo base es Ultralytics/YOLOv9, concretamente la variante "t" (tiny), y la librería de referencia es Ultralytics.

Se trata de un modelo de visión por computador, no de un modelo de lenguaje: su salida son cajas delimitadoras con clase y confianza sobre ocho categorías de KITTI (Car, Cyclist, Misc, Pedestrian, Person_sitting, Tram, Truck y Van). Con 2,1 millones de parámetros y 8,5 GFLOPs a 640 píxeles, es un checkpoint extremadamente ligero, pensado para inferencia en tiempo real en hardware embebido o GPU de gama baja, dentro del ámbito de ADAS y conducción autónoma.

Su relevancia actual es doble: por un lado, ofrece un punto de comparación reproducible frente a otros detectores contemporáneos (YOLOv8, YOLO11, YOLO26) exactamente con la misma receta de entrenamiento; por otro, demuestra que un modelo de 2,1 M de parámetros alcanza 41,6 % de mAP@50 en KITTI, compitiendo con variantes de mayor tamaño del propio zoo de DetectionBench.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv9t (CNN de una etapa, anchor-free, con GELAN y PGI) |
| Parametros totales | 2,1 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de detección de objetos, no generativo) |
| Tipos de cuantizacion | no disponible (no se documentan recetas de cuantización para este checkpoint; Ultralytics permite exportar a FP16/INT8 vía ONNX, TensorRT, OpenVINO o TFLite) |
| Idiomas soportados | no disponible (no aplica: modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (checkpoint Ultralytics, librería `ultralytics`) |
| FLOPs | 8,5 GFLOPs a 640 px |
| Tarea | object-detection |
| Dataset de entrenamiento | dronefreak/KITTI (8 clases) |
| Modelo base | Ultralytics/YOLOv9 |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLOv9t, la variante más pequeña de la familia YOLOv9. YOLOv9 introduce dos componentes técnicos destacables: PGI (Programmable Gradient Information), un mecanismo de supervisión auxiliar que mitiga la pérdida de información durante las capas de agregación profundas, y GELAN (Generalized Efficient Layer Aggregation Network), un bloque de agregación que combina eficiencia de parámetros con capacidad de representación. El detector es de una sola etapa, sin anclas, con cabeza desacoplada, y en esta implementación se sirve a través del framework Ultralytics.

El entrenamiento consiste en un ajuste fino (fine-tuning) del checkpoint preentrenado Ultralytics/YOLOv9 sobre KITTI, ejecutado dentro de DetectionBench con una receta fija y compartida entre todos los detectores del proyecto, de modo que las diferencias de rendimiento reflejen la arquitectura y no la configuración. No se especifican en la información disponible el número de épocas, el número de imágenes del split de entrenamiento, el tamaño de lote, las técnicas de aumento de datos ni si se aplicaron etapas de ajuste adicionales. Tampoco se documenta el uso de RLHF/DPO, algo que no aplica a un modelo de detección. La evaluación se realiza sobre el split de validación de KITTI con el pipeline estándar `detectionbench-evaluate`.

## Capacidades

- Detección de objetos en imágenes de escenas de calle: devuelve cajas delimitadoras con clase y puntuación de confianza.
- Ocho clases de KITTI: Car, Cyclist, Misc, Pedestrian, Person_sitting, Tram, Truck y Van.
- Inferencia en tiempo real sobre imágenes, lotes, vídeo y flujos continuos mediante la API de Ultralytics (`predict`).
- Entrenamiento y validación adicionales sobre datos propios usando el mismo framework (`train`, `val`).
- Exportación a formatos de despliegue alternativos (ONNX, TensorRT, OpenVINO, TFLite, CoreML, NCNN) mediante `export` de Ultralytics.
- Integración directa con el pipeline de evaluación de DetectionBench para comparaciones reproducibles.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica (modelo de visión).
- Capacidades especiales (modo thinking, visión-lenguaje, audio): no aplica; es un detector puro, sin componente lingüístico ni multimodal.

## Casos de uso

- Percepción embebida para ADAS: con 2,1 M de parámetros y 8,5 GFLOPs a 640 px, el modelo puede ejecutarse en módulos de baja potencia (Jetson, Raspberry Pi con acelerador, NPU de automoción) para detectar vehículos y peatones en el flujo de cámara frontal.
- Pre-etiquetado de datasets de conducción: usar el checkpoint para generar cajas iniciales sobre nuevos vídeos de carretera y reducir el coste de anotación humana, reservando la revisión manual para los casos de baja confianza.
- Benchmarking reproducible de detectores: al formar parte de DetectionBench, sirve como referencia de línea base para comparar cualquier detector nuevo bajo la misma receta y el mismo pipeline de evaluación.
- Análisis de tráfico en vídeo: conteo y clasificación de vehículos (Car, Van, Truck, Tram) en secuencias grabadas para estudios de aforo y movilidad urbana.
- Seguridad vial y detección de usuarios vulnerables: la clase Cyclist alcanza 50,36 % de mAP@50 y Pedestrian 62,26 %, suficiente para sistemas de alerta de colisión o de ángulo muerto en prototipos.
- Investigación académica en visión por computador: punto de partida ligero para experimentos de destilación, poda, cuantización o comparación de arquitecturas sobre KITTI.
- Sistemas de vigilancia y monitorización de intersecciones: detección continua sobre streams de cámara IP con requisitos de cómputo muy bajos.
- Retrofit en vehículos existentes: al caber en hardware de bajo consumo, permite añadir funciones de detección a plataformas sin GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, evaluados sobre el split de validación de KITTI con el pipeline de DetectionBench (métricas no verificadas de forma independiente):

| Métrica | Valor (%) |
|---|---|
| mAP@50 | 41,6 |
| mAP@50-95 | 25,73 |
| Precision | 48,3 |
| Recall | 44,2 |
| F1 | 46,16 |

Comparativa del zoo de KITTI publicado por el propio autor (misma receta de entrenamiento y misma evaluación):

| Modelo | mAP@50 | mAP@50-95 | Precision | Recall |
|---|---|---|---|---|
| YOLO26n | 42,54 | 25,43 | 48,62 | 42,84 |
| YOLO11s | 42,00 | 25,10 | 47,27 | 43,71 |
| YOLOv8s | 41,99 | 25,20 | 49,02 | 43,66 |
| YOLO26m | 41,91 | 25,78 | 63,34 | 39,71 |
| YOLO26s | 41,79 | 26,54 | 59,64 | 42,42 |
| YOLOv9t (este modelo) | 41,60 | 25,73 | 48,30 | 44,20 |
| YOLOv9s | 40,84 | 25,92 | 54,27 | 41,51 |
| YOLOv8m | 40,48 | 25,37 | 50,81 | 39,86 |
| YOLOv8n | 40,11 | 24,75 | 46,05 | 41,85 |
| YOLO11x | 39,18 | 23,60 | 46,28 | 41,69 |
| YOLO11n | 38,77 | 23,97 | 52,84 | 40,19 |

Rendimiento por clase de este checkpoint:

| Clase | mAP@50 | mAP@50-95 |
|---|---|---|
| Car | 89,61 | 67,58 |
| Pedestrian | 62,26 | 29,65 |
| Cyclist | 50,36 | 29,31 |
| Van | 39,50 | 26,49 |
| Truck | 36,82 | 25,12 |
| Tram | 30,13 | 16,36 |
| Misc | 14,43 | 7,68 |
| Person_sitting | 9,69 | 3,62 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 a 640 px. Los pesos en FP32 ocupan aproximadamente 8,4 MB (2,1 M de parámetros × 4 bytes) y unos 4,2 MB en FP16; el grueso del consumo proviene de las activaciones intermedias.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo está muy por debajo del umbral de VRAM de una NVIDIA T4, RTX 3060 o superior. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1-2 GB de VRAM, e incluso en CPU. Es viable en dispositivos de borde tipo Jetson Nano o Raspberry Pi con acelerador.
- Opciones de despliegue: Ultralytics (PyTorch nativo), exportación a ONNX Runtime, TensorRT, OpenVINO, TFLite, CoreML y NCNN mediante `model.export()`.
- Latencia y throughput estimados: no disponible. No se han publicado cifras medidas de latencia ni de FPS para este checkpoint en la información proporcionada.
- Nota sobre AGPL-3.0: el despliegue en un servicio de red obliga a liberar el código fuente de la aplicación según los términos de la licencia.

## Comparativa con modelos similares

Comparación con alternativas del mismo zoo, entrenadas y evaluadas con la misma receta sobre KITTI:

| Modelo | Parámetros | mAP@50 | mAP@50-95 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv9t (este modelo) | 2,1 M | 41,60 | 25,73 | AGPL-3.0 | HuggingFace (dronefreak/kitti-yolov9t) |
| YOLO26n | no disponible | 42,54 | 25,43 | no disponible en la información | HuggingFace (dronefreak/DetectionBench) |
| YOLOv8n | no disponible | 40,11 | 24,75 | AGPL-3.0 (Ultralytics) | HuggingFace (dronefreak/kitti-yolov8n) |
| YOLO11s | no disponible | 42,00 | 25,10 | AGPL-3.0 (Ultralytics) | HuggingFace (zoo de DetectionBench) |

Observaciones: YOLOv9t logra el mejor recall (44,20 %) de toda la tabla del zoo de KITTI y un mAP@50 competitivo con modelos notablemente mayores, como YOLOv8s o YOLO11s. El precio que paga es una precisión más baja (48,30 %) que YOLO26m (63,34 %) o YOLO26s (59,64 %), lo que implica más falsos positivos a igual umbral de confianza. No hay datos de parámetros ni FLOPs publicados para los checkpoints comparables en esta información.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial en un servicio accesible por red obliga a publicar el código fuente completo de la aplicación que lo integra, salvo licencia comercial alternativa de Ultralytics.
- Dominio muy restringido: entrenado exclusivamente sobre KITTI, con escenas diurnas de tráfico en ciudades alemanas. El rendimiento caerá fuera de esa distribución (nocturno, lluvia, otras geografías, cámaras con otro campo de visión).
- Solo ocho clases: no detecta señales de tráfico, semáforos, marcas viales ni categorías fuera de KITTI. Las clases Misc y Person_sitting son prácticamente inutilizables (14,43 % y 9,69 % de mAP@50 respectivamente).
- Precision y recall moderados (48,3 % y 44,2 %): en producción exige umbrales de confianza calibrados y revisión de falsos negativos, especialmente en clases minoritarias como Tram (30,13 % mAP@50).
- Métricas no verificadas: los resultados están declarados por el autor y marcados como `verified: false`; no han pasado una validación independiente.
- Riesgo de alucinación en sentido figurado: como cualquier detector, puede producir cajas espurias en texturas ambiguas. No hay componente generativo, pero sí falsos positivos, tal como refleja su precisión relativamente baja.
- Sin datos de sesgo: la información disponible no incluye análisis de sesgo por franja horaria, condiciones meteorológicas, tipo de vehículo o demografía de los peatones.
- Idiomas: no aplica. Al ser un modelo de visión, no hay capacidades lingüísticas ni de contexto textual.
- Reproductibilidad parcial: la model card no documenta hiperparámetros, épocas ni composición exacta del conjunto de entrenamiento, por lo que replicar el resultado depende del pipeline de DetectionBench.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/kitti-yolov9t
- Dataset KITTI usado en el entrenamiento: https://huggingface.co/datasets/dronefreak/KITTI
- Repositorio DetectionBench: https://github.com/dronefreak/DetectionBench
- Perfil del autor en GitHub: https://github.com/dronefreak/
- Modelo relacionado (YOLOv9t sobre BDD100K): https://huggingface.co/dronefreak/bdd100k-yolov9t
- Modelo relacionado (YOLOv8n sobre KITTI): https://huggingface.co/dronefreak/kitti-yolov8n
- Documentación de YOLOv9 en Ultralytics: https://docs.ultralytics.com/models/yolov9
- Paper de YOLOv9 (PGI y GELAN): https://arxiv.org/abs/2402.13616
- Referencia bibliográfica citada en las etiquetas del modelo: arXiv:2410.17725
- Referencia bibliográfica citada en las etiquetas del modelo: arXiv:2606.03748
- Model Zoo (referencia general de modelos): https://www.modelzoo.co/
