# qualcomm/Detectron2-Detection

## Resumen

Detectron2-Detection es un modelo de detección de objetos publicado por Qualcomm dentro de su catálogo Qualcomm AI Hub Models. Se trata de una versión optimizada y pre-exportada del detector Faster R-CNN con backbone ResNet-50 y cabeza C4 (checkpoint `faster_rcnn_R_50_C4_1x`) de la librería Detectron2 de Meta AI (facebookresearch). El modelo está entrenado sobre el conjunto de datos COCO y su función es localizar y clasificar objetos dentro de una imagen, devolviendo cajas delimitadoras con clase y puntuación de confianza.

El interés de esta ficha no está en la arquitectura, que es un detector de dos etapas ya conocido desde 2019, sino en el empaquetado: Qualcomm distribuye artefactos compilados y cuantizados (ONNX float, w8a16 y w8a8; QNN_DLC en las mismas precisiones; TFLITE float y w8a8) listos para ejecutarse sobre la NPU Hexagon de sus plataformas Snapdragon y Dragonwing. Con 33,8 millones de parámetros y 129 MB en precisión float, el objetivo es el despliegue en dispositivos móviles, PC con Windows on ARM, IoT industrial y plataformas embarcadas de automoción.

El modelo se compila, perfila y evalúa mediante Qualcomm AI Hub Workbench (QAIRT 2.45). La relevancia actual radica en que permite llevar un detector de dos etapas de referencia, tradicionalmente costoso en cómputo, a latencias de decenas de milisegundos por submódulo sobre NPU de bajo consumo, con licencia Apache-2.0 y un repositorio de pesos de 0,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN de dos etapas con backbone ResNet-50 y cabeza C4 (Detectron2) |
| Parametros totales | 33,8 millones |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de vision, no autoregresivo) |
| Tipos de cuantizacion | Float, w8a16, w8a8 (formatos ONNX, QNN_DLC y TFLITE segun tabla del autor) |
| Idiomas soportados | No disponible (las etiquetas de salida corresponden a las 80 clases de COCO, en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (repo en HuggingFace, 0,5 GB) mas exportaciones ONNX, QNN_DLC y TFLITE |
| Resolucion de entrada | 800 x 800 |
| Checkpoint base | faster_rcnn_R_50_C4_1x |
| Tamano del modelo (float) | 129 MB |
| Dataset de entrenamiento | COCO |
| Runtime / SDK | QAIRT 2.45; ONNX Runtime 1.27.1 para los artefactos ONNX |
| Unidad de computo principal | NPU (Hexagon) en los perfiles publicados |

## Arquitectura y entrenamiento

La arquitectura es un Faster R-CNN de dos etapas: una red de propuesta de regiones (RPN, exportada en los artefactos como submódulo `proposal_generator`) que genera candidatos de caja, seguida de una cabeza de clasificación y regresión sobre las regiones propuestas. El backbone es ResNet-50 con la variante C4 (características extraídas de la etapa conv4) y la configuración de entrenamiento corresponde a `1x` en la nomenclatura de Detectron2, es decir, el esquema estándar de aproximadamente 90.000 iteraciones sobre COCO. El modelo fue entrenado sobre COCO y no se documenta en la información disponible ningún ajuste posterior con RLHF, DPO ni datos adicionales.

La innovación aportada por esta publicación no es algorítmica sino de despliegue: Qualcomm toma la implementación de referencia de Detectron2 y la reexporta a formatos ejecutables en NPU. Se ofrecen tres niveles de precisión (float, w8a16, w8a8) y tres runtimes (ONNX, QNN_DLC y TFLITE), lo que permite elegir entre fidelidad numérica y coste de memoria. Adicionalmente, la librería `ai-hub-models` permite reexportar el modelo con pesos ajustados, formas de entrada personalizadas y configuraciones de dispositivo objetivo, mediante compilación y perfilado en Qualcomm AI Hub Workbench.

## Capacidades

- Detección de objetos en imágenes para las 80 categorías del dataset COCO (personas, vehículos, animales, mobiliario urbano, utensilios, etc.).
- Salida de cajas delimitadoras con etiqueta de clase y puntuación de confianza por instancia, con soporte de múltiples instancias por imagen.
- Funcionamiento en escenas con varios objetos simultáneos gracias al mecanismo de propuesta de regiones, adecuado para imágenes densas frente a enfoques de una sola etapa con anclas fijas.
- Ejecución acelerada sobre NPU Hexagon de Qualcomm, sin depender de GPU de escritorio.
- Exportación a tres runtimes (ONNX, QNN_DLC, TFLITE) y tres precisiones, lo que permite desplegar en Android, Windows on ARM y plataformas embarcadas.
- Personalización mediante reexportación con pesos propios o formas de entrada distintas de 800 x 800.
- No dispone de generación de texto, razonamiento, código, matemáticas ni capacidades multimodales generativas.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; las etiquetas de clase provienen de COCO y están en inglés.
- No incluye segmentación de instancias ni estimación de pose: es exclusivamente detección de cajas.

## Casos de uso

- Aplicaciones Android de visión en tiempo real: el modelo se puede integrar como detector embarcado en apps de cámara o realidad aumentada, ejecutándose sobre la NPU del Snapdragon con latencias de decenas de milisegundos y sin enviar imágenes a la nube.
- Automoción y sistemas avanzados de asistencia: sobre plataformas Dragonwing (QCS8550, IQ-8275, IQ-9075) el detector puede alimentar funciones de percepción a bordo con consumo ajustado, aprovechando la variante w8a16 para reducir memoria y tiempo de inferencia.
- Analítica de retail: conteo de personas y detección de productos o carros en cámaras de tienda, procesando localmente y evitando el coste de ancho de banda y los requisitos de privacidad del envío continuo de vídeo a servidores.
- Inspección industrial y control de calidad: detección de defectos o piezas fuera de posición en línea de producción, con la variante TFLITE w8a8 para integrarse en controladores embarcados de bajo coste.
- Robótica y drones: percepción visual a bordo para evitación de obstáculos y manipulación, donde el presupuesto de energía y el espacio de memoria son restrictivos y el modelo cabe en 129 MB en float.
- Videovigilancia con privacidad por diseño: análisis en el propio dispositivo, de modo que solo se transmiten metadatos de detección en lugar de vídeo bruto.
- Logística y almacén: detección de palés, cajas y vehículos en muelles de carga mediante lectores o cámaras fijas con cómputo local.
- Accesibilidad: descripción de escenas para personas con discapacidad visual, generando la lista de objetos presentes y su posición a partir de una captura de cámara.

## Benchmarks y rendimiento

No se han publicado resultados de exactitud (mAP sobre COCO) en la información disponible. El autor únicamente facilita métricas de latencia y memoria para el submódulo `proposal_generator` sobre distintos chipsets.

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Rango de memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 Mobile | ONNX | float | 19,583 | 26 - 594 | NPU |
| Snapdragon 8 Elite Mobile | ONNX | float | 20,918 | 25 - 483 | NPU |
| Dragonwing Q-8750 | ONNX | float | 20,918 | 25 - 483 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 26,006 | 36 - 562 | NPU |
| Dragonwing IQ-X7181 | ONNX | float | 33,849 | 72 - 72 | NPU |
| Snapdragon X Elite | ONNX | float | 33,849 | 72 - 72 | NPU |
| Dragonwing QCS8550 (Proxy) | ONNX | float | 34,348 | 12 - 81 | NPU |
| Dragonwing IQ-9075 | ONNX | float | 49,861 | 7 - 17 | NPU |
| Dragonwing IQ-8275 | ONNX | float | 52,442 | 7 - 18 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 63,61 | 1 - 502 | NPU |
| QCS8450 | ONNX | float | 63,61 | 1 - 502 | NPU |
| Snapdragon X2 Elite | ONNX | w8a16 | 10,881 | 36 - 36 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a16 | 13,761 | 18 - 555 | NPU |
| Snapdragon X Elite | ONNX | w8a16 | 19,625 | 36 - 36 | NPU |
| Dragonwing IQ-8275 | ONNX | w8a16 | 19,729 | 14 - 18 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | w8a16 | 34,256 | 15 - 529 | NPU |
| Dragonwing QCS6490 | ONNX | w8a16 | 114,351 | 18 - 21 | NPU |

Advertencia: estos valores corresponden solo al submódulo `proposal_generator` y no al pipeline completo de detección, por lo que la latencia extremo a extremo será superior. La tabla facilitada por el autor está truncada en la información disponible, de modo que no se recogen aquí todas las combinaciones chipset/precisión publicadas.

## Requisitos de hardware

- El modelo no está pensado para GPU de escritorio; su despliegue objetivo es la NPU Hexagon de Qualcomm.
- Tamano de pesos en float: 129 MB. Con cuantización w8a16 o w8a8 el peso efectivo se reduce, aunque el autor no desglosa el tamano por precisión.
- Memoria pico observada en los perfiles: desde 1 MB hasta 594 MB segun chipset y precision (los rangos amplios reflejan la reserva del runtime completo, no solo los pesos).
- Chipsets validados: Snapdragon 8 Elite Gen 5, 8 Elite, 8 Gen 3, 8 Gen 1, X2 Elite, X Elite; Dragonwing IQ-8275, IQ-9075, IQ-X7181, Q-8750, QCS8550, QCS8450 y QCS6490.
- No cabe ni se distribuye para GPU de consumo tipo RTX 4090, A100 o H100; para ejecución en estas plataformas habría que usar la implementación original de Detectron2 en PyTorch, no los artefactos de este repositorio.
- Opciones de despliegue: QNN_DLC sobre QAIRT 2.45, ONNX Runtime 1.27.1 para los artefactos ONNX, y TFLITE/LiteRT. La compilación y el perfilado personalizados se realizan con la librería `ai-hub-models` y Qualcomm AI Hub Workbench.
- Latencias publicadas del `proposal_generator`: de 10,9 ms (Snapdragon X2 Elite, w8a16) a 114,4 ms (Dragonwing QCS6490, w8a16). No se publica throughput agregado ni latencia del pipeline completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Detectron2-Detection (qualcomm) | 33,8 M | Imagen 800 x 800 | mAP no disponible; latencia 10,9-114,4 ms por submódulo | Apache-2.0 | HuggingFace, Qualcomm AI Hub, GitHub `ai-hub-models` |
| Detectron2 Faster R-CNN R50-C4 (facebookresearch, original) | No disponible en la informacion proporcionada (mismo checkpoint `faster_rcnn_R_50_C4_1x`) | Imagen, configurable | No disponible en la informacion proporcionada | Apache-2.0 | GitHub `facebookresearch/detectron2` |
| Otros detectores optimizados para Qualcomm AI Hub (familia YOLO, SSD, etc.) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Qualcomm AI Hub |

La informacion proporcionada no incluye datos de exactitud ni de parametros de alternativas, por lo que no es posible establecer una comparacion cuantitativa de rendimiento frente a otros detectores.

## Limitaciones y advertencias

- Solo detecta las 80 clases de COCO; cualquier objeto fuera de ese vocabulario no sera reconocido ni etiquetado.
- No se publican metricas de exactitud (mAP) en la informacion disponible, por lo que no se puede validar el impacto de la cuantizacion w8a8 sobre la calidad de deteccion.
- El rendimiento de Faster R-CNN en objetos muy pequenos o muy solapados es inferior al de detectores mas modernos de una sola etapa; es una limitacion conocida de la arquitectura, no compensada por ninguna innovacion documentada aqui.
- Resolucion de entrada fija de 800 x 800 en los artefactos preexportados; otras resoluciones requieren reexportacion.
- Las latencias publicadas corresponden unicamente al `proposal_generator`; la inferencia completa es mas lenta y no esta cuantificada en la informacion disponible.
- El repositorio de HuggingFace no incluye pesos en formato PyTorch cargables de forma directa para entrenamiento; esta orientado a artefactos compilados para dispositivos Qualcomm.
- El uso de artefactos QNN_DLC y del perfilado en dispositivos reales requiere una cuenta en Qualcomm AI Hub; el acceso al hardware alojado esta sujeto a registro.
- Licencia Apache-2.0, que permite uso comercial y modificacion siempre que se conserve el aviso de licencia y se documenten los cambios; el modelo derivado de Detectron2 mantiene la misma licencia permisiva, sin clausulas de uso aceptable adicionales documentadas.
- Riesgo de alucinacion en el sentido de falsos positivos y falsos negativos: el modelo es un detector discriminativo, no genera texto, pero puede producir cajas con confianza alta sobre regiones sin objeto real, especialmente tras cuantizacion agresiva.
- El registro del modelo esta fechado en 2026-01-13 y la ultima actualizacion en 2026-09-11, con 0 descargas y 1 like en el momento de la consulta, lo que indica adopcion practicamente nula y ausencia de validacion por parte de la comunidad.
- No se documentan sesgos demograficos especificos, pero el entrenamiento sobre COCO hereda los sesgos de composicion de ese dataset (sobrerrepresentacion de determinadas categorias y contextos occidentales).

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/Detectron2-Detection
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/detectron2_detection
- Repositorio GitHub de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/v0.62.2/src/qai_hub_models/models/detectron2_detection
- Implementacion original de Detectron2 (Meta AI): https://github.com/facebookresearch/detectron2/
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
- Informacion de empresa de Qualcomm: https://www.qualcomm.com/company
- Descarga de artefactos ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/detectron2_detection/releases/v0.62.2/detectron2_detection-onnx-float.zip
- Descarga de artefactos ONNX w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/detectron2_detection/releases/v0.62.2/detectron2_detection-onnx-w8a16.zip
- Descarga de artefactos ONNX w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/detectron2_detection/releases/v0.62.2/detectron2_detection-onnx-w8a8.zip
- Descarga de artefactos QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/detectron2_detection/releases/v0.62.2/detectron2_detection-qnn_dlc-float.zip
- Descarga de artefactos QNN_DLC w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/detectron2_detection/releases/v0.62.2/detectron2_detection-qnn_dlc-w8a16.zip
- Descarga de artefactos QNN_DLC w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/detectron2_detection/releases/v0.62.2/detectron2_detection-qnn_dlc-w8a8.zip
- Descarga de artefactos TFLITE float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/detectron2_detection/releases/v0.62.2/detectron2_detection-tflite-float.zip
- Descarga de artefactos TFLITE w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/detectron2_detection/releases/v0.62.2/detectron2_detection-tflite-w8a8.zip
