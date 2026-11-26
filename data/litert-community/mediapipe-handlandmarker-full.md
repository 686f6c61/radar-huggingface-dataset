# litert-community/MediaPipe-HandLandmarker-Full

## Resumen

MediaPipe Hand Landmarker (Full) es un paquete de tareas de MediaPipe que agrupa dos redes neuronales para la detección y el seguimiento de manos en imágenes y vídeo. Lo publica la comunidad `litert-community` a partir de los modelos originales de Google MediaPipe, y se distribuye como un único fichero `hand_landmarker.task` de 7,82 MB con pesos en FP16. Resuelve el problema de localizar manos en una imagen y estimar 21 puntos clave tridimensionales de la mano (nudillos y articulaciones de los dedos) con latencia propia de ejecución en dispositivo.

La relevancia del modelo está en su naturaleza *on-device*: está empaquetado como TensorFlow Lite y funciona en Web, Android, iOS, Python y Flutter sin necesidad de GPU de servidor ni conexión a la nube. Combina un detector de palmas de tiro único (que localiza manos en el fotograma completo) con un regresor de puntos clave que opera sobre el recorte de la mano. En los modos `VIDEO` y `LIVE_STREAM`, el pipeline reutiliza el cuadro delimitador del fotograma anterior para localizar la mano y solo reactiva el detector de palmas cuando la confianza de presencia o de seguimiento cae por debajo del umbral.

El modelo está entrenado con aproximadamente 30.000 imágenes reales junto con poses de mano sintéticas renderizadas sobre fondos variados. No es un modelo de lenguaje ni un modelo generativo: es un modelo de visión por computador especializado en detección de puntos clave, con licencia Apache 2.0 y disponible en Hugging Face con 3.383 descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector de palmas (single-shot detector) + regresor de 21 puntos clave 3D sobre recorte de mano; ambos en TensorFlow Lite |
| Parametros totales | no disponible (el paquete pesa 7,82 MB; submodelos de 2,34 MB y 5,48 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | Pesos en FP16 (`float16`) en el bundle distribuido; tensores de entrada/salida en `float32` |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) empaquetado en bundle `.task`; el bundle contiene `hand_detector.tflite` y `hand_landmarks_detector.tflite` |
| Tamano del bundle | 7,82 MB (7.819.105 bytes) |
| Entrada del detector | `[1, 192, 192, 3]` float32, normalización media 0,0 / desviación 255,0 |
| Entrada del regresor | `[1, 224, 224, 3]` float32, normalización media 0,0 / desviación 255,0 |
| Salida del detector | `[1, 2016, 18]` (cajas de palma) y `[1, 2016, 1]` (puntuaciones) |
| Salida del regresor | `[1, 63]` (21 puntos × 3 coordenadas), `[1, 1]` (presencia) y `[1, 1]` (lateralidad) |
| Puntos clave | 21 landmarks 3D (coordenadas normalizadas) + 21 coordenadas métricas de mundo vía modelo GHUM |
| Plataformas | Web, Android, iOS, Python, Flutter |

## Arquitectura y entrenamiento

El bundle implementa un pipeline en cascada de dos etapas. La primera etapa, `hand_detector.tflite` (2,34 MB), es un detector de palmas de tiro único que procesa la imagen completa a 192×192 y devuelve 2.016 candidatos de caja con sus puntuaciones. La segunda etapa, `hand_landmarks_detector.tflite` (5,48 MB), toma un recorte de la mano a 224×224 y regresa 21 coordenadas 3D de nudillos en espacio de imagen normalizado, 21 coordenadas métricas de mundo estimadas mediante el modelo articulado GHUM, una puntuación de presencia y la lateralidad del sujeto (`Left`/`Right`).

El entrenamiento se realizó con aproximadamente 30.000 imágenes reales de manos junto con poses sintéticas renderizadas sobre fondos variados, según indica la model card. No se especifican en la información disponible el número exacto de tokens (no aplica), la composición detallada del dataset ni si hubo etapas de ajuste fino con RLHF o DPO (no procede en un modelo de visión). La innovación técnica destacable es el modo de seguimiento: en `VIDEO` y `LIVE_STREAM`, el pipeline reutiliza el cuadro delimitador del fotograma anterior para localizar la mano y solo vuelve a ejecutar el detector de palmas cuando la confianza de presencia o de seguimiento cae por debajo del umbral, lo que reduce el coste computacional en secuencias.

## Capacidades

- Detección de manos en imágenes estáticas y en flujos de vídeo o cámara en directo.
- Regresión de 21 puntos clave 3D por mano (nudillos y articulaciones de los dedos), con índices documentados del 0 (`WRIST`) al 20 (`PINKY_TIP`).
- Estimación de 21 coordenadas métricas de mundo mediante el modelo articulado GHUM.
- Puntuación de presencia de mano en la imagen.
- Clasificación de lateralidad (`Left`/`Right`) referida a las manos del sujeto, no del observador.
- Seguimiento multi-fotograma con reutilización de la caja del fotograma anterior en modos `VIDEO` y `LIVE_STREAM`.
- Ejecución en dispositivo en Web, Android, iOS, Python y Flutter.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de visión especializado, no un modelo de lenguaje.

## Casos de uso

- Control por gestos en interfaces de usuario: el modelo proporciona 21 puntos clave 3D por fotograma, lo que permite mapear gestos de la mano a acciones de la interfaz (selección, arrastre, zoom) en aplicaciones Android, iOS o web sin enviar vídeo a la nube.
- Realidad aumentada y filtros: la estimación de coordenadas métricas de mundo vía GHUM permite anclar objetos virtuales a la mano con escala realista en aplicaciones de RA y efectos de cámara.
- Educación y rehabilitación: el seguimiento de articulaciones de los dedos sirve para evaluar ejercicios de motricidad fina o posturas de la mano en aplicaciones de fisioterapia, con la ventaja de ejecutarse localmente y preservar la privacidad del paciente.
- Interacción sin contacto en entornos industriales o sanitarios: el modo `LIVE_STREAM` permite operar paneles y equipos mediante gestos cuando no se quiere tocar superficies, con latencia propia de ejecución en dispositivo.
- Accesibilidad: traducción de lengua de signos a nivel de puntos clave (no de lenguaje natural) y control de dispositivos por parte de usuarios con movilidad reducida, usando la lateralidad y la posición de los dedos.
- Análisis deportivo y ergonomía: seguimiento de la postura de la mano en deportes de raqueta o en tareas de montaje para detectar desviaciones posturales, procesando el vídeo en el propio dispositivo.
- Prototipado rápido en Python: el cuaderno de Colab y la API de Python permiten validar pipelines de detección de manos antes de portar la lógica a móvil o web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (mAP, error de puntos clave, latencia) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el bundle completo pesa 7,82 MB en FP16, por lo que la huella de memoria es mínima y no requiere GPU dedicada; puede ejecutarse en CPU.
- GPU recomendadas: no aplica en el sentido habitual; el modelo está pensado para CPU, GPU integrada o aceleradores móviles (NNAPI en Android, Core ML en iOS, WebGL/WebGPU en navegador según el backend de MediaPipe).
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles de gama media; no requiere A100, H100 ni RTX 4090.
- Opciones de despliegue: MediaPipe Tasks en Python, Android, iOS, Web y Flutter; el fichero `.task` se carga directamente con la API `HandLandmarker`. No está pensado para vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del backend y del hardware. El diseño con seguimiento entre fotogramas reduce el coste al evitar ejecutar el detector de palmas en cada fotograma.

## Comparativa con modelos similares

| Modelo | Tipo | Puntos clave | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe Hand Landmarker (Full) | Pipeline TFLite de dos etapas | 21 3D + 21 métricos (GHUM) | 192×192 y 224×224 | Apache 2.0 | Hugging Face, MediaPipe Tasks |
| MediaPipe Hand Landmarker (Lite) | Pipeline TFLite de dos etapas | 21 3D | no disponible en esta ficha | Apache 2.0 | MediaPipe (variante lite mencionada en la model card) |
| Otros detectores de mano genéricos | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con la variante Lite mencionada en el nombre de la model card upstream (`Model Card Hand Tracking (Lite_Full)`), de la que no se detallan especificaciones numéricas en esta ficha. No se dispone de datos de benchmarks para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: la model card upstream incluye un documento de equidad (`Model Card Hand Tracking (Lite_Full) with Fairness Oct 2021.pdf`), lo que indica que Google evaluó sesgos de rendimiento por tono de piel y otras variables; no se detallan los resultados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos y de puntos clave imprecisos en manos ocluidas, borrosas o fuera de encuadre.
- Limitaciones de contexto o idioma: no aplica contexto textual ni idioma; el modelo es puramente visual y no procesa lenguaje.
- Lateralidad: `Left` y `Right` se refieren a las manos del sujeto, no a las del observador; en fotogramas de selfi espejados hay que invertir las coordenadas o la etiqueta.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo upstream de Google MediaPipe y las dependencias de la librería MediaPipe.
- Caveats para producción: el rendimiento depende del backend de ejecución y del hardware; el modo de seguimiento puede perder la mano si la confianza cae por debajo del umbral y provocar un salto en la detección; el bundle está en FP16, por lo que la precisión numérica es inferior a la de un modelo en FP32.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-HandLandmarker-Full
- Documentación de MediaPipe Hand Landmarker: https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker
- Ejemplo Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/hand_landmarker/android
- Ejemplo iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/hand_landmarker/ios
- Cuaderno Python (Colab): https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/hand_landmarker/python/hand_landmarker.ipynb
- Ejemplo Web: https://github.com/google-ai-edge/mediapipe-samples-web/blob/main/src/tasks/hand-landmarker.ts
- Ejemplo Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/vision/hand_landmarker
- Demo en vivo: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/hand_landmarker
- Paper de referencia (arXiv:2006.10214): https://arxiv.org/abs/2006.10214
