# duclvQ/tcg-card-detector

## Resumen

El modelo `duclvQ/tcg-card-detector` es un detector de esquinas de cartas coleccionables (trading card games, TCG) basado en la arquitectura YOLOv8n-pose de Ultralytics. En lugar de una segmentación de instancias, regresa directamente las coordenadas de las cuatro esquinas de la carta (superior-izquierda, superior-derecha, inferior-derecha, inferior-izquierda) en un orden fijo por índice de keypoint, lo que permite aplicar una transformación de perspectiva con `cv2.getPerspectiveTransform` para enderezar la carta de forma robusta. El autor es `duclvQ` y el modelo se distribuye bajo licencia AGPL-3.0.

El modelo fue entrenado sobre aproximadamente 19.500 caras de cartas Pokémon sintéticas compuestas sobre fondos de COCO, generando 22.000 escenas sintéticas (10.000 de una carta, 10.000 de varias cartas y 2.000 negativas sin cartas). Aunque el entrenamiento usó exclusivamente cartas Pokémon, las pruebas con cartas reales de otros juegos (One Piece, Digimon, Yu-Gi-Oh, Magic: The Gathering y Lorcana) muestran una detección cercana al 100 % y errores de esquina inferiores al 2 % de la diagonal de la carta, lo que indica una buena generalización a otras marcas. El modelo se publica en formato PyTorch (`.pt`), ONNX (`.onnx`) y CoreML (`.mlmodel`), con un tamaño de imagen de entrada de 480 píxeles.

La relevancia de este modelo radica en su enfoque directo: evita el paso intermedio de segmentación y heurísticas de ordenación de esquinas que fallan en rotaciones cercanas a 45°, donde `argmax(x+y)` y `argmax(x−y)` seleccionan el mismo punto y la transformación de perspectiva se vuelve singular. Al regresar las esquinas como keypoints con un orden fijo, ese fallo queda eliminado por construcción. Es una solución ligera y práctica para aplicaciones de escaneo y digitalización de cartas en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n-pose (Ultralytics) |
| Parametros totales | no disponible (variante nano de YOLOv8) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible (se publican pesos en FP32 PyTorch, ONNX y CoreML) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch), `.onnx` (ONNX Runtime), `.mlmodel` (CoreML) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura YOLOv8n-pose, la variante nano de YOLOv8 diseñada para detección de keypoints. En este caso, la cabeza de pose se configura con `kpt_shape: [4, 3]`, es decir, cuatro keypoints (las esquinas de la carta) con tres canales (x, y y visibilidad). El modelo procesa imágenes de 480×480 píxeles y produce simultáneamente cajas delimitadoras y keypoints. La elección de keypoints en lugar de segmentación de instancias responde a un problema concreto: la heurística clásica de recuperar el cuadrilátero desde una máscara mediante `approxPolyDP` y luego ordenar las esquinas con criterios como `argmax(x+y)` y `argmax(x−y)` falla cuando la carta está rotada cerca de 45°, porque ambos criterios seleccionan el mismo punto, degenerando la transformación de perspectiva. El enfoque de keypoints con orden fijo por índice elimina este fallo por diseño.

El entrenamiento se realizó sobre 22.000 escenas sintéticas generadas por un compositor que superpone caras de cartas Pokémon (aproximadamente 19.500 caras únicas) sobre fondos de COCO, aplicando homografías aleatorias y variando la posición, escala y rotación. El compositor rechaza cualquier colocación cuya caja delimitadora se solape con una existente, por lo que el modelo nunca ha visto cartas en contacto. Se entrenó durante 100 épocas con batch 16 a `imgsz=480`. La validación sintética con 2.200 escenas reservadas alcanzó un pose mAP50-95 de 0.995 y un box mAP50-95 de 0.993. El modelo se exportó también a ONNX y CoreML a la misma resolución de 480 píxeles; el archivo CoreML usa el formato `neuralnetwork` y el autor advierte que sus numericas no han sido verificadas en hardware Apple, aunque el paso intermedio TorchScript mostró una diferencia máxima absoluta de 0.000e+00 frente a PyTorch.

## Capacidades

- Detección de cartas de juegos de cartas coleccionables (TCG) en fotografías y su regresión de las cuatro esquinas en orden fijo (superior-izquierda, superior-derecha, inferior-derecha, inferior-izquierda).
- Enderezado de la carta mediante transformación de perspectiva con una sola llamada a `cv2.getPerspectiveTransform`, sin necesidad de heurísticas de ordenación de esquinas.
- Soporte de múltiples detecciones en una misma imagen: el modelo emite varias cajas y keypoints, permitiendo iterar sobre todas las cartas presentes.
- Generalización a otros juegos de cartas más allá de Pokémon (One Piece, Digimon, Yu-Gi-Oh, Magic: The Gathering, Lorcana) con tasas de detección superiores al 98 % en condiciones de prueba controladas.
- Exportación a múltiples formatos: PyTorch, ONNX Runtime y CoreML (iOS), lo que facilita su integración en aplicaciones móviles y servidores.
- Inferencia ligera gracias a la arquitectura nano de YOLOv8, adecuada para ejecución en tiempo real en dispositivos con recursos limitados.
- No requiere pipeline de segmentación previa; el modelo produce directamente las coordenadas de las esquinas en píxeles de la imagen original.

## Casos de uso

- Escaneo de cartas para aplicaciones de coleccionismo: el usuario fotografía una carta y el modelo devuelve sus cuatro esquinas, permitiendo recortar y enderezar la imagen para mostrarla de forma frontal y uniforme en una galería digital.
- Digitalización de inventarios de tiendas de juegos: al fotografiar varias cartas separadas, el modelo detecta cada una y permite procesarlas individualmente, agilizando la catalogación de existencias.
- Preprocesamiento para identificación de cartas: antes de aplicar un clasificador de cartas (por ejemplo, para reconocer el nombre, la edición o el número), el modelo endereza la carta y normaliza su perspectiva, mejorando la precisión del clasificador.
- Integración en aplicaciones móviles de trading: gracias al export a CoreML, el modelo puede ejecutarse en iOS de forma local, permitiendo escanear cartas sin conexión y con baja latencia.
- Automatización de procesos de compra-venta online: al fotografiar cartas para anuncios, el modelo genera automáticamente imágenes frontales y rectangulares, reduciendo el trabajo manual de edición.
- Herramientas de asistencia para torneos: en fotos de manos de cartas o mesas de juego, el modelo puede detectar cartas individuales bien separadas, ayudando a registrar jugadas o validar mazos (aunque con limitaciones en escenas muy superpuestas).
- Pruebas de calidad en producción de impresión: el modelo puede verificar que las cartas impresas presentan esquinas correctas y están bien recortadas, comparando la posición de los keypoints con las coordenadas esperadas.

## Benchmarks y rendimiento

El autor reporta resultados en validación sintética y en pruebas con cartas reales de otros juegos. No se han publicado comparaciones con otros detectores en la misma tarea.

**Validación sintética** (2.200 escenas reservadas):

| Metrica | Valor |
|---|---|
| Pose mAP50-95 | 0.995 |
| Box mAP50-95 | 0.993 |

**Pruebas con cartas reales de otros juegos** (150 escenas por juego, error de esquina como porcentaje de la diagonal de la carta):

| Juego | Deteccion | Confianza media | Error de esquina |
|---|---|---|---|
| Pokémon | 100.0 % | 0.973 | 0.80 % |
| One Piece | 100.0 % | 0.967 | 0.94 % |
| Digimon | 100.0 % | 0.966 | 0.94 % |
| Yu-Gi-Oh | 100.0 % | 0.968 | 1.06 % |
| Magic: The Gathering | 99.3 % | 0.962 | 1.47 % |
| Lorcana | 98.7 % | 0.952 | 1.95 % |

**Sensibilidad al radio de las esquinas** (mismas cartas y fondos, variando el radio como porcentaje del ancho de la carta):

| Radio (% del ancho) | 3.7 | 5 | 7 | 10 | 14 | 20 |
|---|---|---|---|---|---|---|
| Deteccion | 100 % | 100 % | 100 % | 100 % | 100 % | 100 % |
| Error de esquina | 0.67 % | 0.67 % | 0.70 % | 0.88 % | 1.29 % | 2.05 % |

## Requisitos de hardware

- Modelo nano de YOLOv8, diseñado para inferencia ligera; se puede ejecutar en CPU y en GPU de gama baja (por ejemplo, NVIDIA GTX 1650 o superior).
- No se proporcionan datos oficiales de VRAM ni de latencia. Dado el tamaño nano, se estima un consumo de VRAM inferior a 1 GB en FP32, aunque este dato no está confirmado por el autor.
- El formato ONNX permite ejecución con ONNX Runtime en CPU, y el formato CoreML está pensado para dispositivos Apple (iOS), aunque las numericas de este export no han sido verificadas en hardware real.
- Opciones de despliegue: integración directa con la librería Ultralytics (`YOLO(weights)`), export a ONNX para servidores o edge, y CoreML para aplicaciones móviles.
- Para escenas con varias cartas, se recomienda iterar sobre todas las detecciones y no usar solo `argmax(conf)`.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos con otros detectores de cartas TCG en la información proporcionada. Existen alternativas en el ecosistema, como el detector `Adrihp06/TCGscanner-detector` (un detector de límites de cartas basado en YOLO, también en ONNX) o datasets de detección de cartas en Roboflow (por ejemplo, `tcg-cards-detector-yolov11` o `tcg-card-detection`), pero no se han publicado métricas comparables. En cuanto a la tarea específica de regresión de esquinas con keypoints, este modelo es el único documentado con ese enfoque en la información disponible.

| Modelo | Enfoque | Formato | Licencia | Uso |
|---|---|---|---|---|
| `duclvQ/tcg-card-detector` | Keypoints de esquinas (YOLOv8n-pose) | .pt, .onnx, .mlmodel | AGPL-3.0 | Enderezado y recorte de cartas |
| `Adrihp06/TCGscanner-detector` | Detección de límites (YOLO) | ONNX | no disponible | Localización de la carta en el frame |
| Datasets Roboflow (varios) | Detección de objetos / segmentación | varios | no disponible | Entrenamiento de modelos propios |

## Limitaciones y advertencias

- **Escenas con muchas cartas superpuestas**: el modelo falla en escenarios reales con cartas apiladas, en abanico o con solapamiento intenso. En pruebas con 16 fotos de torneos y comercios, solo 5 produjeron detecciones. El compositor de entrenamiento rechaza cualquier solapamiento de cajas, por lo que el modelo nunca ha visto cartas en contacto.
- **Sin esquinas visibles no hay detección**: si el recorte es tan cerrado que las cuatro esquinas quedan fuera de la imagen, el modelo no puede regresar los keypoints. Esto no es solucionable con más entrenamiento.
- **Sesgo hacia bordes amarillos**: el modelo tiende a depender del borde de la carta. Al probar con una foto arbitraria dentro de un marco amarillo brillante, la detección se mantiene en 98.7 %, pero baja al 49.2 % con un marco negro y al 30.7 % sin marco. Aunque las cartas reales de otros juegos se detectan bien, este sesgo puede afectar a objetos similares a cartas con bordes no amarillos.
- **Detección múltiple por convención**: el modelo emite varias detecciones, pero el ejemplo de uso toma la de mayor confianza (`argmax(conf)`). Para varias cartas hay que iterar sobre todas las cajas, asumiendo la limitación anterior.
- **Licencia AGPL-3.0**: implica que cualquier uso comercial o distribución del modelo debe cumplir con los términos de la licencia, incluyendo la obligación de ofrecer el código fuente si se ofrece el servicio como parte de una red.
- **CoreML no verificado**: el export a CoreML no ha sido probado en hardware Apple; el autor recomienda verificar su comportamiento antes de usarlo en producción.
- **Sin datos de sesgos demograficos**: al ser un modelo de vision entrenado con imágenes sintéticas, no se han evaluado sesgos de género, raza u otros, aunque el dominio de aplicación (cartas) no implica estos factores.

## Enlaces

- HuggingFace: https://huggingface.co/duclvQ/tcg-card-detector
- Detector alternativo en HuggingFace: https://huggingface.co/Adrihp06/TCGscanner-detector
- Dataset de detección de TCG en Roboflow: https://universe.roboflow.com/awssecurity/tcg_cards_detector_yolov11-ahn5g
- Dataset de detección de TCG (v6) en Roboflow: https://universe.roboflow.com/sacha_psalmon/tcg-card-detection/dataset/6
- Proyecto de detección de cartas de juego con YOLOv8: https://github.com/TeogopK/Playing-Cards-Object-Detection
- Plataforma CardSight AI (identificación de cartas TCG): https://cardsight.ai/
