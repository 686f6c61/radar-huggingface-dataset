# qualcomm/FCN-ResNet50

## Resumen

FCN-ResNet50 es un modelo de segmentación semántica de imágenes desarrollado originalmente por el grupo de Berkeley (Long, Shelhamer y Darrell, arXiv:1411.4038) y reempaquetado por Qualcomm dentro de su catálogo Qualcomm AI Hub Models. La variante publicada en `qualcomm/FCN-ResNet50` no es un entrenamiento nuevo, sino una exportación optimizada del modelo `fcn_resnet50` de torchvision, con pesos procedentes del checkpoint `COCO_WITH_VOC_LABELS_V1`, lista para ejecutarse en la NPU Hexagon de los SoC Snapdragon y en otras plataformas Qualcomm.

Técnicamente es una red totalmente convolucional (FCN) con backbone ResNet-50, 33,0 millones de parámetros y 21 clases de salida (las 20 clases de PASCAL VOC más el fondo). Trabaja con entradas de 224x224 píxeles y produce una máscara densa de segmentación por píxel. Su relevancia actual no está en la investigación, sino en el despliegue: Qualcomm distribuye artefactos ya compilados en formato ONNX, QNN_DLC y TFLite, en precisión float y w8a8 (INT8), con latencias medidas sobre más de una decena de chipsets.

El interés para un desarrollador es doble. Por un lado, es un punto de partida verificado para segmentación semántica en Android, automoción o IoT, con licencia BSD-3-Clause que permite uso comercial. Por otro, sirve como referencia para medir el coste real de la cuantización INT8 en NPU: según los datos publicados, el paso de float a w8a8 reduce la latencia aproximadamente a la mitad o a un tercio y rebaja el tamaño del modelo de 126 MB a 32,2 MB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCN (fully convolutional network) con backbone ResNet-50 y conexiones skip |
| Parametros totales | 33,0 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen de 224x224 px) |
| Tipos de cuantizacion | float (FP32) y w8a8 (INT8 en pesos y activaciones) |
| Idiomas soportados | no aplica (no procesa texto; las 21 etiquetas de clase provienen del vocabulario PASCAL VOC) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC (Qualcomm AI Engine Direct), TFLite; checkpoint PyTorch de origen |
| Tarea (pipeline) | segmentacion semantica de imagenes (`image-segmentation`) |
| Resolucion de entrada | 224x224 |
| Numero de clases de salida | 21 |
| Checkpoint de pesos | COCO_WITH_VOC_LABELS_V1 |
| Tamano del modelo | 126 MB en float; 32,2 MB en w8a8 |
| Tamano del repositorio | 12,2 GB (incluye todos los artefactos exportados) |
| Libreria declarada | pytorch (con exportaciones para ONNX Runtime 1.27.1 y QAIRT 2.45) |
| Idiomas de la ficha | no disponible |

## Arquitectura y entrenamiento

FCN-ResNet50 sigue el diseño clásico de red totalmente convolucional: el backbone ResNet-50 actúa como extractor de características y las capas de clasificación se sustituyen por convoluciones, de modo que la red produce un mapa de puntuaciones por píxel en lugar de una etiqueta global. Las conexiones skip combinan las características de las últimas capas, con mayor resolución espacial pero más débiles semánticamente, con las de capas profundas, para recuperar detalle en los bordes de los objetos. La implementación de referencia es la de torchvision (`torchvision/models/segmentation/fcn.py`), y Qualcomm mantiene la ficha de exportación en su repositorio `ai-hub-models` (versión v0.62.2).

Sobre el entrenamiento no se aportan detalles en la información disponible: no se indica el número de tokens o imágenes vistas, la composición exacta del dataset más allá de la referencia al checkpoint `COCO_WITH_VOC_LABELS_V1`, ni si hubo fases de ajuste fino, RLHF o DPO (procesos que, por otra parte, no aplican a un modelo discriminativo de segmentación). Lo que sí documenta el autor es el proceso de compilación, perfilado y evaluación mediante Qualcomm AI Hub Workbench, que genera las exportaciones para ONNX, QNN_DLC y TFLite con configuración de precisión float y w8a8. La innovación destacable, por tanto, no es arquitectónica sino de despliegue: compilación específica para NPU Hexagon y cuantización INT8 con calibración, que multiplica el rendimiento en dispositivos móviles.

## Capacidades

- Segmentación semántica densa de imágenes en 21 clases (fondo más las 20 clases de PASCAL VOC: persona, vehículo, animal, mobiliario urbano, etc.).
- Entrada de imagen RGB de 224x224 píxeles; salida de máscara por píxel.
- Ejecución en NPU de SoC Qualcomm Snapdragon y Qualcomm Dragonwing, con latencias publicadas desde 7,3 ms por inferencia en w8a8.
- Exportaciones listas para tres runtimes distintos: ONNX (universal), QNN_DLC (específico de Qualcomm AI Engine Direct) y TFLite (universal).
- Compatibilidad con compilación personalizada: pesos ajustados, formas de entrada propias y configuración de dispositivo/runtime mediante la librería Qualcomm AI Hub Models.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de texto.
- No incluye modo de razonamiento (thinking), audio ni generación de texto. La única modalidad es visión.

## Casos de uso

- Segmentación semántica en aplicaciones Android en tiempo real: el modelo puede procesar fotogramas de cámara a 224x224 y devolver una máscara de 21 clases con latencias de 10-33 ms en Snapdragon 8 Gen 3, suficiente para superponer efectos o aislar regiones de la escena sin salir del dispositivo.
- Fotografía computacional y edición en móvil: separación de persona, cielo, vegetación o mobiliario para aplicar reemplazo de fondo, desenfoque selectivo o ajustes de color por región, aprovechando la versión w8a8 de 32,2 MB que ocupa muy poca memoria.
- Asistencia a la conducción y ADAS de bajo coste: identificación de carretera, peatones y vehículos en sistemas embebidos con SoC Qualcomm, donde el consumo energético y la latencia determinista importan más que la precisión máxima.
- Inspección visual industrial en el borde: detección de defectos o separación de zonas de producto en líneas de fabricación instrumentadas con módulos Dragonwing o cámaras inteligentes, sin enviar imágenes a la nube.
- Robótica móvil y drones: construcción de mapas semánticos de bajo nivel a partir de vídeo en vuelo o navegación, usando el modelo como módulo de percepción dentro de un pipeline mayor.
- Realidad aumentada: anclaje de contenido virtual sobre superficies y objetos reconocidos (suelo, paredes, mobiliario) mediante la máscara de segmentación, ejecutada en la NPU para no competir con la GPU de render.
- Preprocesado en videovigilancia urbana: filtrado previo de escenas para dirigir la atención de modelos más costosos hacia regiones relevantes, reduciendo el ancho de banda y el cómputo agregado.
- Agricultura de precisión: segmentación de cultivo, suelo y vegetación en dispositivos de campo alimentados por batería, donde la versión cuantizada permite inferencia continua con un consumo mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mIoU, pixel accuracy, IoU por clase) en la información disponible. Lo que sí publica el autor es una tabla de latencia de inferencia y memoria pico por dispositivo, medida por Qualcomm AI Hub Workbench. La tabla original aparece truncada en el último registro.

Precisión float (FP32), runtime ONNX, unidad de cómputo NPU:

| Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|
| Snapdragon X2 Elite | 22,251 | 3 - 3 |
| Snapdragon X Elite | 43,628 | 63 - 63 |
| Snapdragon 8 Elite Gen 5 Mobile | 21,076 | 1 - 330 |
| Snapdragon 8 Elite Mobile | 26,911 | 1 - 309 |
| Snapdragon 8 Gen 3 Mobile | 32,577 | 0 - 379 |
| Snapdragon 8 Gen 1 Mobile | 83,138 | 2 - 272 |
| Dragonwing Q-8750 | 26,911 | 1 - 309 |
| Dragonwing IQ-9075 | 72,757 | 3 - 9 |
| Dragonwing IQ-8275 | 82,224 | 3 - 10 |
| Dragonwing IQ-X7181 | 43,628 | 63 - 63 |
| Dragonwing QCS8550 (proxy) | 43,57 | 0 - 413 |
| QCS8450 | 83,138 | 2 - 272 |

Precisión w8a8 (INT8), runtime ONNX, unidad de cómputo NPU:

| Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) |
|---|---|---|
| Snapdragon X2 Elite | 7,279 | 2 - 2 |
| Snapdragon X Elite | 13,893 | 33 - 33 |
| Snapdragon 8 Gen 3 Mobile | 10,185 | 1 - 278 |
| Snapdragon 8 Gen 1 Mobile | 21,01 | 0 - 270 |
| Dragonwing Q-7790 | 25,654 | 1 - 283 |
| Dragonwing Q-6690 | 402,43 | 2 - 390 |
| Dragonwing IQ-9075 | 14,325 | 1 - 4 |
| Dragonwing IQ-8275 | 14,38 | 1 - 5 |
| Dragonwing IQ-X7181 | 13,893 | 33 - 33 |
| Dragonwing QCS8550 (proxy) | 13,58 | 0 - 278 |
| Dragonwing QCS6490 | 122,061 | 1 - 4 |
| QCS8450 | 21,01 | 0 - 270 |

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual de modelos generativos. Los pesos ocupan 126 MB en FP32 y 32,2 MB en w8a8, por lo que el modelo cabe en cualquier acelerador con unas pocas centenas de megabytes libres.
- Memoria pico medida en NPU: entre 0 y 413 MB según chipset y precisión, con la mayor parte de los casos por debajo de 300 MB.
- Hardware recomendado: NPU Hexagon de Snapdragon X2 Elite, Snapdragon X Elite, Snapdragon 8 Gen 3 / 8 Elite / 8 Elite Gen 5 y plataformas Qualcomm Dragonwing (IQ-8275, IQ-9075, IQ-X7181, Q-6690, Q-7790) y QCS8450 / QCS8550 / QCS6490.
- GPU de escritorio: no se han publicado latencias para A100, H100, RTX 4090 ni otras GPU de servidor. Dado el tamaño del modelo (33 M de parámetros, 126 MB en FP32), es plausible ejecutarlo en cualquier GPU consumer mediante ONNX Runtime, pero se trata de una inferencia razonada a partir del tamaño, no de un dato publicado.
- Cabe en GPU consumer: sí, por tamaño de pesos; sin métricas oficiales de rendimiento en ese entorno.
- Opciones de despliegue: Qualcomm AI Hub Workbench (compilación, perfilado y evaluación en dispositivo alojado), QAIRT 2.45 para QNN_DLC, ONNX Runtime 1.27.1 para los artefactos ONNX, TFLite para Android/embebido, y PyTorch con torchvision para uso en servidor o reexportación.
- Latencia y throughput: entre 7,279 ms (X2 Elite, w8a8) y 402,43 ms (Dragonwing Q-6690, w8a8); en float, entre 21,076 ms y 83,138 ms en los chipsets medidos. Equivale aproximadamente a 137 FPS en el mejor caso y 2,5 FPS en el peor.
- Tamaño del repositorio: 12,2 GB, ya que incluye todos los artefactos exportados para cada runtime y precisión.

## Comparativa con modelos similares

Solo se dispone de datos verificados para FCN-ResNet50 en la información proporcionada; el resto de filas se incluyen como referencia cualitativa y sus métricas concretas figuran como no disponibles.

| Modelo | Arquitectura | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FCN-ResNet50 (qualcomm) | FCN + ResNet-50 | 33,0 M | 224x224 px, 21 clases | BSD-3-Clause | ONNX, QNN_DLC, TFLite, PyTorch |
| FCN-ResNet50 (torchvision, upstream) | FCN + ResNet-50 | 33,0 M | 224x224 px, 21 clases | BSD-3-Clause | PyTorch |
| DeepLabV3-ResNet50 (torchvision) | DeepLabV3 + ResNet-50 | no disponible | no disponible | BSD-3-Clause | PyTorch |
| SegFormer (variantes B0-B5, HuggingFace) | Transformer jerárquico (Mix-Transformer) | no disponible | no disponible | no disponible | PyTorch / Transformers |

Frente al FCN-ResNet50 original de torchvision, la versión de Qualcomm no cambia la arquitectura ni los pesos, pero añade exportaciones compiladas y cuantizadas con latencias medidas en más de una decena de chipsets, algo que el repositorio upstream no ofrece. Frente a DeepLabV3, FCN-ResNet50 suele ser más ligero pero con menor fineza en bordes; no se dispone de comparación numérica de mIoU en la información consultada.

## Limitaciones y advertencias

- Resolución de entrada fija de 224x224: las máscaras resultantes tienen muy poco detalle en objetos pequeños, bordes finos o escenas con muchos elementos solapados.
- Espacio de etiquetas cerrado de 21 clases: cualquier objeto fuera del vocabulario PASCAL VOC se asignará a una de las clases existentes, con el consiguiente riesgo de etiquetado erróneo silencioso.
- Sesgos del dataset: COCO y PASCAL VOC están dominados por imágenes de escenas urbanas y occidentales; el rendimiento puede degradarse en entornos, iluminaciones o contextos culturales poco representados.
- Riesgo de alucinación de máscaras: en regiones ambiguas o con texturas repetitivas el modelo puede inventar fronteras entre clases que no existen en la imagen.
- No hay resultados publicados de mIoU ni de precisión por clase en esta ficha, por lo que la calidad real de la segmentación debe validarse con datos propios antes de llevarla a producción.
- Los datos de latencia corresponden a la NPU de chipsets Qualcomm concretos; extrapolarlos a CPU, GPU o a otros NPU no es válido sin medición previa.
- La cuantización w8a8 reduce el tamaño y la latencia, pero puede degradar la precisión de las máscaras; conviene comparar float y w8a8 en el dominio de aplicación concreto.
- Licencia BSD-3-Clause: permite uso comercial y modificación, con la obligación de conservar el aviso de copyright y la cláusula de exención de responsabilidad, y sin poder usar el nombre de los titulares para respaldar productos derivados. Conviene revisar igualmente las condiciones de uso de Qualcomm AI Hub y de los artefactos descargados.
- La model card no documenta el proceso de entrenamiento, el número de imágenes ni la composición exacta del dataset, lo que dificulta auditar sesgos y cobertura.
- El repositorio ocupa 12,2 GB por acumulación de exportaciones; en entornos con almacenamiento limitado conviene descargar solo el artefacto necesario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/FCN-ResNet50
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/fcn_resnet50
- Repositorio Qualcomm AI Hub Models (ficha de exportación de FCN-ResNet50): https://github.com/qualcomm/ai-hub-models/blob/v0.62.2/src/qai_hub_models/models/fcn_resnet50
- Repositorio Qualcomm AI Hub Models (raíz): https://github.com/qualcomm/ai-hub-models
- Implementación de referencia en torchvision: https://github.com/pytorch/vision/blob/main/torchvision/models/segmentation/fcn.py
- Paper original de FCN (Long, Shelhamer, Darrell): https://arxiv.org/abs/1411.4038
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/fcn_resnet50/releases/v0.62.2/fcn_resnet50-onnx-float.zip
- Descarga ONNX w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/fcn_resnet50/releases/v0.62.2/fcn_resnet50-onnx-w8a8.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/fcn_resnet50/releases/v0.62.2/fcn_resnet50-qnn_dlc-float.zip
- Descarga QNN_DLC w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/fcn_resnet50/releases/v0.62.2/fcn_resnet50-qnn_dlc-w8a8.zip
- Descarga TFLite float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/fcn_resnet50/releases/v0.62.2/fcn_resnet50-tflite-float.zip
- Descarga TFLite w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/fcn_resnet50/releases/v0.62.2/fcn_resnet50-tflite-w8a8.zip
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
- Información corporativa de Qualcomm: https://www.qualcomm.com/company
- Qualcomm en Wikipedia (EN): https://en.wikipedia.org/wiki/Qualcomm
- Qualcomm en Wikipedia (FR): https://fr.wikipedia.org/wiki/Qualcomm
