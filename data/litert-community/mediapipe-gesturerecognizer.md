# litert-community/MediaPipe-GestureRecognizer

## Resumen

MediaPipe Gesture Recognizer es un pipeline de vision por computador para reconocimiento de gestos de la mano que se ejecuta íntegramente en el dispositivo (on-device). Lo publica la comunidad litert-community en Hugging Face, pero el modelo subyacente es de Google MediaPipe, empaquetado en formato `.task` (TFLite con pesos en FP16). No es un modelo de lenguaje: es un clasificador de imágenes especializado que detecta manos, extrae 21 puntos clave 3D y clasifica la geometría de la mano en 8 gestos predefinidos.

El paquete `gesture_recognizer.task` (8,37 MB) anida dos subpaquetes: `hand_landmarker.task` (detector de palmas más detector de 21 keypoints) y `hand_gesture_recognizer.task` (embedder de landmarks más clasificador de gestos). La arquitectura es una cascada de CNN ligeras TFLite, no un transformer, y no dispone de ventana de contexto ni de parámetros en el sentido de un LLM.

Su relevancia actual radica en la inferencia local de baja latencia para interfaces gestuales en Android, iOS, web, Python y Flutter, sin necesidad de enviar vídeo a la nube. Es una pieza de infraestructura para aplicaciones de interacción humano-máquina, no un modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cascada de CNN TFLite (detector de palmas, detector de landmarks, embedder y clasificador) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantización | FP16 en los pesos del paquete; entradas float32 normalizadas |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.task` (archivo TFLite empaquetado con metadatos y etiquetas) |

## Arquitectura y entrenamiento

El pipeline es una cascada de cuatro submodelos TFLite. El `hand_detector.tflite` (2,34 MB) recibe una imagen de 192×192×3 y produce 2016 detecciones de palma con 18 valores de regresión y una puntuación de confianza. El `hand_landmarks_detector.tflite` (5,48 MB) recibe un recorte de 224×224×3 y devuelve 63 coordenadas normalizadas, 63 coordenadas en espacio mundial, una puntuación de presencia y una puntuación de lateralidad (izquierda/derecha). El `gesture_embedder.tflite` (546 KB) transforma los 21 landmarks (más lateralidad y landmarks mundiales) en un vector de 128 dimensiones. El `canned_gesture_classifier.tflite` (7,8 KB) clasifica ese embedding en 8 clases.

El clasificador opera sobre la geometría de los landmarks, nunca sobre píxeles crudos, lo que lo hace robusto a cambios de iluminación y fondo. El paquete incluye metadatos TFLITE embebidos (nombre, versión, autor MediaPipe) y ficheros de etiquetas asociados (`labels.txt`, `handedness.txt`). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; al tratarse de un modelo de visión, esos conceptos no aplican directamente. El paper referenciado en los tags es arXiv:2006.10214, correspondiente a la base de MediaPipe Hands.

## Capacidades

- Detección de manos en imágenes: localiza palmas con el detector de 192×192.
- Extracción de 21 keypoints 3D por mano, en coordenadas normalizadas y mundiales.
- Clasificación de lateralidad (mano izquierda o derecha) con puntuación de confianza.
- Clasificación de 8 gestos: `Unknown`, `Closed_Fist`, `Open_Palm`, `Pointing_Up`, `Thumb_Down`, `Thumb_Up`, `Victory` e `ILoveYou`.
- Procesamiento de múltiples manos en una misma imagen (el detector se denomina "Multi Hand Detection").
- Inferencia on-device en Android, iOS, web (TypeScript), Python y Flutter.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Control por gestos en aplicaciones móviles: integrar el paquete en Android o iOS para que el usuario navegue o confirme acciones con gestos como `Thumb_Up` o `Open_Palm`, con inferencia local y sin latencia de red.
- Accesibilidad: sustituir o complementar entradas táctiles para personas con movilidad reducida, mapeando gestos reconocidos a comandos del sistema mediante los ejemplos oficiales de MediaPipe.
- Videollamadas y filtros en tiempo real: usar los 21 landmarks para superponer efectos o avatares que sigan la mano, aprovechando que el clasificador trabaja sobre geometría y no sobre píxeles.
- Interacción en navegador: desplegar el modelo con la API web de MediaPipe (`gesture-recognizer.ts`) para demos de control gestual sin instalación, usando el demo web oficial como referencia.
- Automatización de pruebas de UI: en pipelines de QA, reconocer gestos en capturas o vídeo para validar que una interfaz responde correctamente a entradas gestuales.
- Robótica educativa y prototipos: en Python, combinar la salida de landmarks con librerías de control para traducir gestos en comandos de un brazo robótico o de un dron en entornos de laboratorio.
- Análisis de lenguaje de signos básico: como componente de un sistema mayor que use los landmarks y las 8 clases como señales de entrada, aunque el modelo por sí solo no cubre lenguaje de signos completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para CPU y aceleradores móviles, no para GPU de escritorio. El paquete completo ocupa 8,37 MB.
- GPU recomendadas: no aplica para el caso de uso principal; en servidor podría ejecutarse en CPU sin problema dado el tamaño.
- Cabe en cualquier dispositivo consumer: móviles Android e iOS, navegadores modernos, Raspberry Pi y portátiles convencionales.
- Opciones de despliegue: MediaPipe Tasks en Android, iOS, web, Python y Flutter; el formato `.task` es específico de MediaPipe y no se carga directamente en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un pipeline on-device de pocos MB, se espera latencia de milisegundos, pero no se confirma con cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Clases | Licencia | Despliegue |
|---|---|---|---|---|---|
| MediaPipe Gesture Recognizer (este) | Cascada CNN TFLite | 8,37 MB | 8 gestos | Apache 2.0 | MediaPipe (Android, iOS, web, Python, Flutter) |
| MediaPipe Hand Landmarker | CNN TFLite | no disponible | solo landmarks | Apache 2.0 | MediaPipe |
| MediaPipe Hand Gesture Recognizer (upstream) | CNN TFLite | no disponible | 8 gestos | Apache 2.0 | MediaPipe |

No se dispone de datos de benchmarks ni de modelos alternativos comparables fuera del ecosistema MediaPipe en la información proporcionada.

## Limitaciones y advertencias

- Solo reconoce 8 gestos predefinidos; cualquier otra pose cae en `Unknown`.
- Depende de la calidad de la detección de landmarks: oclusiones, manos fuera de encuadre o ángulos extremos degradan la clasificación.
- No procesa texto ni mantiene contexto conversacional; no es adecuado para tareas de lenguaje.
- No se detallan sesgos demográficos en la información disponible, aunque el model card upstream incluye un PDF de fairness de 2022 que conviene revisar.
- Riesgo de falsos positivos en escenas con formas similares a manos; el umbral de confianza debe calibrarse por aplicación.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda conservar los avisos de atribución de MediaPipe.
- El formato `.task` es propietario de MediaPipe; migrar a otro runtime requiere convertir los `.tflite` internos.
- No hay garantías de rendimiento en producción sin validación en el dispositivo objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-GestureRecognizer
- Documentación oficial: https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer
- Paper de referencia: https://arxiv.org/abs/2006.10214
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/gesture_recognizer/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/gesture_recognizer/ios
- Ejemplo Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/gesture_recognizer/python/gesture_recognizer.ipynb
- Ejemplo web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/gesture-recognizer.ts
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/gesture_recognizer
- Demo en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/gesture_recognizer
- Model card upstream (PDF): https://huggingface.co/litert-community/MediaPipe-GestureRecognizer/blob/main/model_card_hand_gesture_classification_with_faireness_2022.pdf
