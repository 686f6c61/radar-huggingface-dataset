# litert-community/MediaPipe-AudioClassifier-YAMNet

## Resumen

MediaPipe YAMNet es un clasificador de eventos sonoros ligero empaquetado como `yamnet.tflite` (4,13 MB) y distribuido por la comunidad litert-community para su uso con la tarea MediaPipe Audio Classifier (`AudioClassifier`). El modelo original procede de MediaPipe y se basa en la arquitectura YAMNet, entrenada sobre AudioSet para reconocer 521 clases de sonido (voz, instrumentos musicales, animales, alarmas y sonidos ambientales). Su relevancia actual radica en que ofrece clasificación de audio en tiempo real completamente en dispositivo, sin dependencia de servicios en la nube.

El modelo recibe ventanas de forma de onda mono a 16 kHz en `float32` de 15 600 muestras (0,975 s) normalizadas en el rango [-1,0, 1,0], calcula internamente los espectrogramas log-mel y devuelve un vector `[1, 521]` de puntuaciones entre 0 y 1 alineadas con la lista de etiquetas `yamnet_label_list.txt`. Los pesos están cuantizados internamente a 8 bits, aunque la entrada y la salida del grafo son `float32`, lo que permite un equilibrio entre tamaño reducido y compatibilidad con los runners de TFLite.

Por su tamaño y su formato TFLite, está pensado para despliegues en Android, iOS, web, Python y Flutter mediante MediaPipe Tasks. No es un modelo generativo ni un LLM: es un clasificador acústico de propósito específico, y esta ficha lo evalúa como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YAMNet (red neuronal convolucional sobre espectrogramas log-mel; detalles internos de capas no disponibles) |
| Parametros totales | no disponible (pesos con cuantizacion interna a 8 bits; tamano del artefacto 4,13 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrada fija de 15 600 muestras (0,975 s a 16 kHz) |
| Tipos de cuantizacion | pesos int8 internos; I/O float32 (tag `fp32`, `int8`) |
| Idiomas soportados | no disponible (clasificacion de audio, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`yamnet.tflite`), con metadatos `TFLITE_METADATA` embebidos |

## Arquitectura y entrenamiento

YAMNet es una red neuronal convolucional que opera sobre espectrogramas log-mel calculados internamente a partir de la forma de onda de entrada. El grafo TFLite incluye el preprocesado de audio (ventaneo y transformada log-mel) y la torre convolucional que produce las 521 puntuaciones de clase; la salida del tensor final se denomina `tower0/network/layer32/final_output`. El modelo está entrenado sobre AudioSet, el corpus de eventos sonoros de Google, con 521 clases de salida. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales.

La innovación práctica del artefacto es su empaquetado para MediaPipe Tasks: metadatos embebidos (`yamnet/classification`, versión 1, autor MediaPipe) con la lista de etiquetas asociada, entrada y salida en `float32` y pesos cuantizados a 8 bits, lo que reduce el tamaño a 4,13 MB manteniendo la compatibilidad con los runners de TFLite en Android, iOS, web y Python. No se dispone de información sobre técnicas de decodificación especulativa ni atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Clasificación de eventos sonoros en 521 clases de AudioSet: voz, instrumentos musicales, animales, alarmas y sonidos ambientales.
- Procesamiento de ventanas de audio de 0,975 s a 16 kHz mono en `float32` normalizado en [-1,0, 1,0].
- Cálculo interno de espectrogramas log-mel a partir de la forma de onda, sin preprocesado externo.
- Salida de puntuaciones por clase en el rango 0..1, con filtrado configurable mediante `max_results`.
- Ejecución en dispositivo (on-device) en Android, iOS, web, Python y Flutter mediante MediaPipe Tasks.
- Modo de ejecución por clips (`AUDIO_CLIPS`); no se documentan en la información disponible otros modos como streaming.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador, no un modelo generativo.
- No se documentan capacidades multilingües ni de otro tipo (visión, audio generativo) más allá de la clasificación acústica.

## Casos de uso

- Detección de eventos sonoros en aplicaciones móviles: integración con MediaPipe Audio Classifier en Android (Kotlin/Java) o iOS (Swift) para clasificar sonidos ambientales en tiempo real sin conexión, aprovechando el tamaño de 4,13 MB del artefacto.
- Moderación de contenido en audio de usuario: clasificación de clips subidos a una plataforma para identificar categorías como gritos, alarmas o música, usando el modo `AUDIO_CLIPS` con `max_results` ajustado a las clases de interés.
- Accesibilidad para personas con discapacidad auditiva: reconocimiento de sonidos relevantes del entorno (timbre, alarma, llanto) en aplicaciones móviles o web, ejecutando el modelo localmente para preservar la privacidad.
- Monitorización acústica en dispositivos edge: despliegue en Python o web para clasificar segmentos de audio de sensores IoT y generar alertas por categorías concretas de AudioSet.
- Análisis de contenido multimedia: etiquetado automático de pistas de audio en pipelines de catalogación, usando las 521 clases como taxonomía predefinida y la lista `yamnet_label_list.txt` como mapa de etiquetas.
- Aplicaciones Flutter multiplataforma: uso del paquete `flutter-mediapipe` con el clasificador de audio para prototipos y apps que necesitan clasificación acústica en Android, iOS y web con un único artefacto TFLite.
- Filtrado previo en pipelines de voz: detección de presencia de voz frente a otros eventos sonoros antes de enviar audio a un sistema de reconocimiento de habla, reduciendo cómputo en el backend.

## Benchmarks y rendimiento

La model card incluye una sección titulada "Latency Benchmarks", pero el contenido proporcionado está truncado y no incluye cifras. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el artefacto ocupa 4,13 MB y está diseñado para ejecución en CPU y aceleradores móviles. No se dispone de cifras de memoria en tiempo de ejecución.
- GPU recomendadas: no disponible; el modelo está orientado a CPU y a aceleradores de dispositivo (NNAPI, Core ML, delegados de TFLite) más que a GPU de servidor.
- Cabe en cualquier dispositivo con soporte de TFLite/MediaPipe, incluidos móviles de gama baja; no requiere GPU de consumo dedicada.
- Opciones de despliegue: MediaPipe Tasks (Python, Android, iOS, web/JavaScript, Flutter) sobre el runtime TFLite; no se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponibles (la sección de benchmarks de latencia está truncada en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Tamano | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MediaPipe YAMNet (este modelo) | CNN sobre log-mel, TFLite | 521 (AudioSet) | 4,13 MB | 0,975 s a 16 kHz | Apache 2.0 | Hugging Face, MediaPipe Tasks |
| YAMNet original (TensorFlow Hub) | CNN sobre log-mel | 521 (AudioSet) | no disponible en la informacion | 0,975 s a 16 kHz | Apache 2.0 | TensorFlow Hub |
| Alternativas de clasificacion de audio en TFLite | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otros clasificadores de audio, por lo que la comparación se limita a formato, tamaño y licencia.

## Limitaciones y advertencias

- Es un clasificador de 521 clases cerradas de AudioSet; no reconoce categorías fuera de esa taxonomía ni genera descripciones libres del audio.
- La ventana de entrada es fija (15 600 muestras, 0,975 s); el análisis de audio más largo requiere segmentación externa y agregación de resultados.
- Los pesos están cuantizados a 8 bits, lo que puede introducir una pérdida de precisión frente a la versión en coma flotante completa; no se documenta la magnitud de esa pérdida.
- No se documentan sesgos específicos del modelo en la información disponible; al estar entrenado sobre AudioSet, hereda los desequilibrios de ese corpus (por ejemplo, sobrerrepresentación de ciertas categorías musicales o de habla).
- Riesgo de falsos positivos y confusiones entre clases acústicamente próximas; las puntuaciones deben calibrarse con umbrales propios antes de usarse en producción.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar los términos de AudioSet y de MediaPipe para los datos y el runtime.
- No se documentan idiomas ni rendimiento multilingüe porque el modelo no procesa texto.
- La información de benchmarks de latencia está truncada en la fuente; no debe asumirse ningún rendimiento concreto sin medirlo en el dispositivo objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-AudioClassifier-YAMNet
- Documentación de MediaPipe Audio Classifier: https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier
- Guía de configuración en Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de configuración en Web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de configuración en Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de configuración en iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de configuración en Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Demo web en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/audio/audio_classifier
- Código fuente del ejemplo web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/audio-classifier.ts
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/audio_classifier/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/audio_classifier/ios
- Notebook de Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/audio_classifier/python/audio_classification.ipynb
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/audio/audio_classifier
