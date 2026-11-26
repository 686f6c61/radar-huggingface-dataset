# madihoang0310/rfy-hand-landmarker-full-onnx

## Resumen

`rfy-hand-landmarker-full-onnx` es una conversión a ONNX de los dos modelos que componen el bundle MediaPipe Hand Landmarker (Full) de Google: un detector de palma (`hand_detector_full.onnx`) y un detector de landmarks (`hand_landmarks_detector_full.onnx`). El autor, madihoang0310, publica esta conversión para uso interno de la función de retoque de manos ("Làm đẹp tay") de RFY Studio. No se trata de un modelo de lenguaje ni de un modelo generativo, sino de un par de redes convolucionales de visión por computador para la detección de manos y sus 21 puntos clave en imágenes.

El modelo original procede de `hand_landmarker.task` del repositorio `litert-community/MediaPipe-HandLandmarker-Full`, idéntico byte a byte a la release de Google del 26 de abril de 2023. La conversión se realizó con `tf2onnx` 1.17.0 sobre TensorFlow 2.21.0, con opset 17, desquantizando los pesos de float16 a float32 y sin reentrenamiento ni cambios de arquitectura. La paridad numérica con el TFLite original es alta (diferencia absoluta máxima de 1,54e-4 en el detector y 1,6e-4 en el de landmarks sobre entradas sintéticas).

Su relevancia es práctica: permite ejecutar el pipeline de hand tracking de MediaPipe en runtimes ONNX (ONNX Runtime, etc.) sin depender del runtime TFLite/LiteRT, lo que facilita el despliegue en entornos donde ONNX es el formato estándar. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos CNNs (detector de palma + detector de landmarks), conversión de modelos TFLite de MediaPipe |
| Parametros totales | no disponible (tamaños de fichero: 4 589 474 bytes el detector y 10 903 307 bytes el de landmarks) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen fija) |
| Tipos de cuantizacion | pesos float32 (los originales TFLite eran float16, desquantizados en la conversión) |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17) |

Detalle de entradas y salidas:

| Fichero | Entrada | Salidas |
|---|---|---|
| `hand_detector_full.onnx` | `input_1` float32 [1,192,192,3] RGB NHWC, normalizado /255 | `Identity` [1,2016,18] (caja + 7 keypoints), `Identity_1` [1,2016,1] (logit de score) |
| `hand_landmarks_detector_full.onnx` | `input_1` float32 [1,224,224,3] RGB NHWC, normalizado /255 | `Identity` [1,63] (21 landmarks × 3), `Identity_1` [1,1] (presencia), `Identity_2` [1,1] (lateralidad), `Identity_3` [1,63] (world landmarks) |

## Arquitectura y entrenamiento

La arquitectura es la del MediaPipe Hand Landmarker (variante Full) de Google: un detector de palma que opera sobre una imagen de 192×192 y produce 2016 anclas con caja delimitadora, 7 keypoints y un score, seguido de un detector de landmarks que, sobre un recorte de 224×224, regresa 21 landmarks en coordenadas de imagen (63 valores), una puntuación de presencia, la lateralidad de la mano y 21 world landmarks (63 valores). No hay información detallada sobre la composición del dataset de entrenamiento ni sobre el número de tokens o imágenes usadas, más allá de la referencia a la model card de Google ("Model Card Hand Tracking (Lite_Full) with Fairness", octubre de 2021).

La innovación técnica de esta publicación es únicamente la conversión de formato: `tf2onnx` 1.17.0 con TensorFlow 2.21.0 y opset 17, desquantización de float16 a float32 y reducción del `doc_string` del grafo al nombre del fichero fuente. No hay reentrenamiento ni cambios en pesos o arquitectura más allá de la conversión, tal como exige la sección 4b de la Apache-2.0. La paridad con el TFLite original se validó con 8 entradas sintéticas (ruido mezclado con gradientes, semilla 123, valores en [0, 1]) comparando ONNX Runtime en CPU frente a TFLite (ai-edge-litert).

## Capacidades

- Detección de manos en imagen: localización de palmas con caja delimitadora, 7 keypoints y score de confianza sobre 2016 anclas.
- Regresión de 21 landmarks por mano en coordenadas de imagen (63 valores) y en coordenadas de mundo (world landmarks, 63 valores).
- Estimación de presencia de mano y de lateralidad (mano izquierda/derecha).
- Funciona como pipeline de dos etapas: el detector de palma alimenta recortes al detector de landmarks.
- Procesamiento de imágenes RGB normalizadas a [0, 1] en formato NHWC.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No incluye modo thinking, audio ni otras modalidades.

## Casos de uso

- Retoque y embellecimiento de manos en aplicaciones de edición fotográfica: el pipeline detecta la palma y los 21 landmarks para aplicar filtros, suavizado de piel o corrección de forma en la región de la mano, que es el uso original en RFY Studio.
- Seguimiento de manos en tiempo real para interfaces gestuales: integrado en un bucle de captura de vídeo, el detector de palma localiza la mano y el de landmarks proporciona la pose articulada para reconocer gestos.
- Control por gestos en aplicaciones de escritorio o web: con los landmarks se pueden mapear posiciones de dedos a eventos de cursor o comandos, usando ONNX Runtime en el navegador o en el cliente.
- Preprocesado para modelos de reconstrucción 3D de manos: los world landmarks y los landmarks 2D sirven como entrada a pipelines de pose estimation o animación.
- Análisis ergonómico o de interacción en vídeos: extracción de trayectorias de manos y articulaciones para estudios de usabilidad o análisis de movimiento.
- Filtros de realidad aumentada: superposición de elementos gráficos anclados a los landmarks de la mano en aplicaciones de cámara.
- Automatización de anotación de datasets de manos: el modelo puede preetiquetar imágenes con landmarks para revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la paridad numérica con el TFLite original sobre 8 entradas sintéticas:

| Modelo | Diferencia absoluta máxima | Valor de referencia mayor |
|---|---|---|
| hand detector | 1,54e-4 | 135 |
| hand landmarks | 1,6e-4 | 181 |

La model card de Google citada reporta una evaluación de equidad sobre 6 tipos de piel de Fitzpatrick con un error medio MNAE de 5,08 % ± 0,72 %, pero no se incluyen tablas de benchmarks estándar (PCK, AUC, etc.) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los modelos suman unos 15,5 MB en float32, por lo que caben holgadamente en cualquier GPU consumer y también en CPU.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (CUDA o TensorRT), incluidas RTX 4090, RTX 3060 o incluso GPUs integradas; para este tamaño no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos unos pocos cientos de MB de VRAM disponible.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), TensorRT, OpenVINO, y cualquier runtime compatible con ONNX; no se distribuye en GGUF ni formato para llama.cpp/Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (4,6 MB y 10,9 MB) se espera latencia de milisegundos en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rfy-hand-landmarker-full-onnx | ONNX (2 CNNs) | 192×192 y 224×224 RGB | 21 landmarks + world landmarks + presencia + lateralidad | Apache-2.0 | Hugging Face |
| MediaPipe Hand Landmarker (Full) original | TFLite/LiteRT | misma pipeline | mismas salidas | Apache-2.0 | Google MediaPipe / litert-community |
| MediaPipe Hand Landmarker (Lite) | TFLite/LiteRT | pipeline equivalente, menor coste | salidas equivalentes | Apache-2.0 | Google MediaPipe |

La comparativa se limita a las variantes del mismo modelo original, ya que no se dispone de información sobre alternativas de otros autores en la documentación proporcionada. La diferencia principal frente al original es el formato (ONNX frente a TFLite) y la desquantización a float32; frente a la variante Lite, la Full ofrece mayor precisión a costa de más cómputo, aunque no se aportan cifras comparativas.

## Limitaciones y advertencias

- Uso previsto limitado a manos prominentemente visibles en la imagen; fuera de alcance la vigilancia, el reconocimiento de identidad y las decisiones críticas para la vida.
- El error aumenta con desenfoque, autooclusión, iluminación baja, guantes, objetos que ocluyen la mano y decoraciones pesadas.
- La evaluación de equidad reportada por Google cubre 6 tipos de piel de Fitzpatrick con MNAE medio de 5,08 % ± 0,72 %, lo que indica variabilidad según el tono de piel.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones ni agentes, y no debe evaluarse con benchmarks de NLP.
- La licencia Apache-2.0 permite uso comercial, pero exige mantener el aviso de copyright de Google LLC y documentar los cambios (ya documentados por el autor).
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (26 de noviembre de 2026), por lo que no hay evidencia de uso en producción ni validación externa.
- No se proporcionan métricas de latencia, throughput ni precisión sobre datasets estándar, lo que dificulta estimar su rendimiento real en producción.
- Al ser una conversión sin reentrenamiento, hereda todas las limitaciones del modelo original de Google.

## Enlaces

- Hugging Face: https://huggingface.co/madihoang0310/rfy-hand-landmarker-full-onnx
- Modelo original en litert-community: https://huggingface.co/litert-community/MediaPipe-HandLandmarker-Full
- Documentación de MediaPipe Hand Landmarker: no disponible en la información proporcionada
- Paper o blog de Google sobre Hand Tracking: no disponible en la información proporcionada
- Repositorio o demo de RFY Studio: no disponible en la información proporcionada
