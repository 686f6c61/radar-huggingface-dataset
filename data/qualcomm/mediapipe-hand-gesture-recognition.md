# qualcomm/MediaPipe-Hand-Gesture-Recognition

## Resumen

MediaPipe-Hand-Gesture-Recognition es un pipeline de visión por computador en tiempo real publicado por Qualcomm en Hugging Face. No es un modelo de lenguaje: encadena tres redes convolucionales ligeras —un detector de palma (palm_detector, 1,76 M de parámetros), un detector de 21 puntos de referencia de la mano (hand_landmark_detector, 2,72 M) y un clasificador de gestos predefinidos (canned_gesture_classifier, 143 K)— para localizar manos en una imagen, estimar su esqueleto, determinar la lateralidad (izquierda/derecha) y asignar una etiqueta gestual. En total suma unos 4,62 M de parámetros y aproximadamente 17,7 MB en precisión float, que se reducen a unos 5,35 MB con cuantización w8a8.

El modelo no es original de Qualcomm: es una reexportación optimizada de la implementación de MediaPipe de Google, compilada y perfilada con Qualcomm AI Hub Workbench para ejecutarse en la NPU Hexagon de los chips Snapdragon y Dragonwing. Su interés práctico actual es servir como componente listo para producción en aplicaciones Android, XR y de borde donde se necesita inferencia por debajo del milisegundo, licencia Apache 2.0 y funcionamiento sin dependencia de la nube.

Se distribuye en tres formatos (ONNX, QNN_DLC y TFLite) en precisiones float y w8a8, con resolución de entrada de 256x256 píxeles y soporte de exportación personalizada mediante la librería `qai_hub_models`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de visión en tres etapas: detector de palma, detector de 21 landmarks y clasificador de gestos; la model card no detalla la topología interna de cada red |
| Parametros totales | ~4,62 M (143 K canned_gesture_classifier + 2,72 M hand_landmark_detector + 1,76 M palm_detector) |
| Parametros activos | no aplica (no es una arquitectura de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de visión; la entrada es una imagen de 256x256 píxeles) |
| Tipos de cuantizacion | float y w8a8 (8 bits en pesos y activaciones) |
| Idiomas soportados | no aplica (modelo de visión; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, QNN_DLC (Qualcomm AI Engine Direct / QAIRT) y TFLite; exportable desde PyTorch con la librería qai_hub_models |
| Resolucion de entrada | 256x256 píxeles |
| Componentes | 3 (palm_detector, hand_landmark_detector, canned_gesture_classifier) |
| Tamano en disco (float) | ~17,7 MB (6,75 MB + 10,4 MB + 577 KB) |
| Tamano en disco (w8a8) | ~5,35 MB (2,05 MB + 3,12 MB + 180 KB) |
| Puntos de referencia | 21 landmarks por mano |
| Clases de gesto | conjunto predefinido ("canned"); la model card no enumera las etiquetas |
| Unidad de calculo objetivo | NPU Hexagon de Qualcomm |
| Runtime / SDK | QAIRT 2.45 y ONNX Runtime 1.27.1 |
| Idiomas de la ficha | no aplica |

## Arquitectura y entrenamiento

La arquitectura es una cascada de detección y clasificación típica de MediaPipe: primero un detector de palma localiza la región de la mano en el fotograma; a partir de ese recorte, el detector de landmarks estima 21 puntos anatómicos (articulaciones y puntas de los dedos) y determina si la mano es izquierda o derecha; finalmente, el clasificador de gestos trabaja sobre esa representación y asigna una etiqueta de un conjunto cerrado definido por el pipeline original. La model card no especifica el detalle de las capas, la función de pérdida ni el mecanismo de anclaje del detector de palma.

Qualcomm no ha entrenado este modelo: el repositorio contiene artefactos pre-exportados y compilados por Qualcomm AI Hub Workbench para distintas combinaciones de precision (float, w8a8), chipset y runtime. No hay información sobre el dataset de entrenamiento, el número de imágenes, la composición de datos reales frente a sintéticos ni si hubo ajuste fino posterior. La cuantización w8a8 es una optimización de inferencia, no una fase de entrenamiento, y no se documentan técnicas de calibración concretas. El tag `arxiv:2006.10214` del repositorio apunta al artículo asociado a la pipeline de MediaPipe Hands, cuyo contenido no se reproduce en la model card.

## Capacidades

- Detección de manos en imágenes o fotogramas de vídeo en tiempo real.
- Predicción de 21 landmarks por mano (articulaciones y puntas de los dedos).
- Clasificación de lateralidad de la mano (izquierda o derecha).
- Clasificación de gestos pertenecientes a un conjunto predefinido ("canned"); la lista exacta de etiquetas no se detalla en la model card.
- Ejecución acelerada en la NPU Hexagon de SoC Qualcomm (Snapdragon, Dragonwing) con latencias del orden de décimas de milisegundo en el clasificador de gestos.
- Exportación a tres runtimes (ONNX, QNN_DLC, TFLite) y posibilidad de recompilar con pesos ajustados, resoluciones de entrada personalizadas y otros dispositivos objetivo.
- No genera texto, no dispone de tool calling ni function calling, no implementa agentes ni razonamiento multi-paso y no tiene capacidades multilingües: es exclusivamente un modelo de percepción visual.

## Casos de uso

- Control por gestos en aplicaciones Android y XR: el clasificador de gestos a 0,037-0,193 ms en NPU permite ejecutar el reconocimiento en cada fotograma de una cámara a 60 fps sin afectar al presupuesto térmico del dispositivo.
- Interacción sin contacto en automoción: integrado en el sistema de infoentretenimiento sobre un SoC Snapdragon, permite subir el volumen, aceptar llamadas o cambiar de pista con gestos de la mano, reduciendo la carga visual del conductor.
- Accesibilidad: conversión de gestos en comandos para personas con movilidad reducida o con dificultades de habla, usando la lateralidad y los 21 landmarks como señales de control personalizables.
- Realidad aumentada y filtros sociales: superposición de efectos anclados a los landmarks de la mano en aplicaciones de cámara, con latencia suficientemente baja para mantener el efecto pegado a la mano en movimiento.
- Entornos clínicos y estériles: control de visores de imágenes médicas (PACS) o de equipos quirúrgicos mediante gestos, evitando el contacto físico con superficies.
- Robótica y teleoperación: uso de los landmarks como vector de entrada de baja dimensión para mapear la pose de la mano humana a una pinza o mano robótica en lazos de control en el borde.
- Domótica: encendido de luces, control de persianas o activación de escenas mediante gestos reconocidos localmente, sin enviar vídeo a la nube.
- Analítica de interacción y estudios de usabilidad: registro agregado de gestos y número de manos presentes en un espacio (por ejemplo, en retail o museos) para métricas de atención, procesando el vídeo en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión en la informacion disponible. La model card solo incluye perfilado de latencia y memoria pico por chipset para el componente `canned_gesture_classifier` con runtime ONNX.

| Componente | Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de calculo |
|---|---|---|---|---|---|---|
| canned_gesture_classifier | ONNX | float | Snapdragon X2 Elite | 0,042 | 1 - 1 | NPU |
| canned_gesture_classifier | ONNX | float | Snapdragon X Elite | 0,054 | 1 - 1 | NPU |
| canned_gesture_classifier | ONNX | float | Snapdragon 8 Gen 3 Mobile | 0,066 | 0 - 27 | NPU |
| canned_gesture_classifier | ONNX | float | Snapdragon 8 Gen 1 Mobile | 0,119 | 0 - 32 | NPU |
| canned_gesture_classifier | ONNX | float | Dragonwing IQ-8275 | 0,152 | 0 - 4 | NPU |
| canned_gesture_classifier | ONNX | float | Dragonwing QCS8550 (Proxy) | 0,077 | 0 - 2 | NPU |
| canned_gesture_classifier | ONNX | float | QCS8450 | 0,119 | 0 - 32 | NPU |
| canned_gesture_classifier | ONNX | float | Dragonwing IQ-9075 | 0,193 | 0 - 3 | NPU |
| canned_gesture_classifier | ONNX | float | Dragonwing IQ-X7181 | 0,054 | 1 - 1 | NPU |
| canned_gesture_classifier | ONNX | float | Dragonwing Q-8750 | 0,049 | 0 - 22 | NPU |
| canned_gesture_classifier | ONNX | float | Snapdragon 8 Elite Mobile | 0,049 | 0 - 22 | NPU |
| canned_gesture_classifier | ONNX | float | Snapdragon 8 Elite Gen 5 Mobile | 0,06 | 0 - 19 | NPU |
| canned_gesture_classifier | ONNX | w8a8 | Snapdragon X2 Elite | 0,037 | 1 - 1 | NPU |
| canned_gesture_classifier | ONNX | w8a8 | Snapdragon X Elite | 0,048 | 1 - 1 | NPU |
| canned_gesture_classifier | ONNX | w8a8 | Snapdragon 8 Gen 3 Mobile | 0,062 | 0 - 29 | NPU |
| canned_gesture_classifier | ONNX | w8a8 | (resto de chipsets) | no disponible (tabla truncada en la informacion proporcionada) | no disponible | NPU |

Los datos de latencia y memoria de `palm_detector` y `hand_landmark_detector` no estan disponibles en la informacion proporcionada, por lo que no es posible estimar la latencia extremo a extremo del pipeline completo. Tampoco hay metricas de exactitud, precision, recall ni IoU para la deteccion de manos o la clasificacion de gestos.

## Requisitos de hardware

- VRAM/RAM estimada: los tres componentes suman unos 17,7 MB en float y unos 5,35 MB en w8a8. La memoria pico medida por componente oscila entre 1 MB y 32 MB según el chipset, de modo que cualquier dispositivo con decenas de megabytes libres es suficiente.
- GPU recomendadas: no aplica el catálogo de datacenter (A100, H100). El objetivo son las NPU Hexagon integradas en SoC Qualcomm Snapdragon (8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, X Elite, X2 Elite) y Dragonwing (IQ-8275, IQ-9075, IQ-X7181, Q-8750, QCS8550, QCS8450).
- Cabe en GPU de consumo: sí. Al ser un modelo de pocos megabytes, puede ejecutarse en cualquier GPU de consumo e incluso en CPU mediante ONNX Runtime o TFLite, aunque sin las latencias de NPU reportadas.
- Opciones de despliegue: ONNX Runtime 1.27.1, QAIRT 2.45 (QNN_DLC), TFLite/LiteRT, la librería `qai_hub_models` para exportación y compilación personalizada, y el ecosistema MediaPipe en Android. Los frameworks de servidor para LLM (vLLM, TGI) no aplican.
- Latencia: 0,037-0,193 ms para `canned_gesture_classifier` en NPU según chipset y precisión. La latencia extremo a extremo del pipeline no está disponible.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Gestos | Licencia | Formatos | Optimizado para NPU Qualcomm |
|---|---|---|---|---|---|---|
| qualcomm/MediaPipe-Hand-Gesture-Recognition (esta ficha) | ~4,62 M (3 componentes) | 256x256 | conjunto predefinido | Apache 2.0 | ONNX, QNN_DLC, TFLite | Si |
| MediaPipe Gesture Recognizer (Google, pipeline original) | no disponible | no disponible | conjunto predefinido | Apache 2.0 | TFLite / .task | No documentado |
| MediaPipe Hand Landmarker (Google) | no disponible | no disponible | no incluye clasificacion de gestos | Apache 2.0 | TFLite / .task | No documentado |
| MediaPipe Hands (implementacion de referencia en google-ai-edge/mediapipe) | no disponible | no disponible | no disponible | Apache 2.0 | TFLite | No documentado |

La comparativa se limita a datos verificables en la model card y en el repositorio de referencia; no se dispone de cifras de parámetros, exactitud ni latencia de las alternativas de Google para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier evaluación tipo MMLU, HumanEval o GSM8K no aplica.
- Sesgos conocidos: no disponibles. La model card no documenta la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos por tono de piel, tamaño de mano, lateralidad o condiciones de iluminación.
- Riesgo de fallo en detección: previsible en oclusiones parciales, manos fuera de encuadre, movimiento rápido, poca luz o manos muy pequeñas respecto al encuadre. No se publican tasas de error.
- Cobertura gestual cerrada: solo se clasifican los gestos del conjunto predefinido. Cualquier gesto fuera de ese conjunto se etiquetará incorrectamente o como clase nula.
- Limitaciones de idioma: no aplica, al no procesar texto ni audio.
- Rendimiento dependiente de la plataforma: las cifras de latencia y memoria se han medido exclusivamente en hardware Qualcomm con QAIRT y ONNX Runtime. En otras CPU, GPU o NPU los valores no son extrapolables.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar también las condiciones del proyecto MediaPipe original, del que deriva este pipeline.
- Tracción mínima del repositorio: a fecha de consulta la ficha registra 0 descargas y 1 like, por lo que no existe validación comunitaria ni informes de fallos.
- Información incompleta: la model card proporcionada está truncada, y faltan los datos de rendimiento de dos de los tres componentes, así como cualquier métrica de exactitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qualcomm/MediaPipe-Hand-Gesture-Recognition
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/mediapipe_hand_gesture
- Repositorio qai_hub_models (código del modelo, v0.62.0): https://github.com/qualcomm/ai-hub-models/blob/v0.62.0/src/qai_hub_models/models/mediapipe_hand_gesture
- Repositorio de Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
- Implementación original de MediaPipe: https://github.com/google-ai-edge/mediapipe
- Artículo referenciado por el tag del repositorio: https://arxiv.org/abs/2006.10214
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/mediapipe_hand_gesture/releases/v0.62.0/mediapipe_hand_gesture-onnx-float.zip
- Descarga ONNX w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/mediapipe_hand_gesture/releases/v0.62.0/mediapipe_hand_gesture-onnx-w8a8.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/mediapipe_hand_gesture/releases/v0.62.0/mediapipe_hand_gesture-qnn_dlc-float.zip
- Descarga QNN_DLC w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/mediapipe_hand_gesture/releases/v0.62.0/mediapipe_hand_gesture-qnn_dlc-w8a8.zip
- Descarga TFLite float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/mediapipe_hand_gesture/releases/v0.62.0/mediapipe_hand_gesture-tflite-float.zip
- Descarga TFLite w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/mediapipe_hand_gesture/releases/v0.62.0/mediapipe_hand_gesture-tflite-w8a8.zip
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
- Información corporativa de Qualcomm: https://www.qualcomm.com/company
- Relaciones con inversores de Qualcomm: https://investor.qualcomm.com/overview/default.aspx
