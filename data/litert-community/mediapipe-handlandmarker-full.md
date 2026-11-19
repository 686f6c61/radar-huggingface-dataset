# litert-community/MediaPipe-HandLandmarker-Full

## Resumen

MediaPipe Hand Landmarker (Full) es un paquete de tareas de MediaPipe que agrupa dos redes neuronales para la deteccion y el seguimiento de manos en imagenes y video: un detector de palmas y un regresor de 21 puntos clave tridimensionales. Lo publica la organizacion `litert-community` en Hugging Face y esta disenado para ejecutarse en el dispositivo (on-device) en Web, Android, iOS, Python y Flutter a traves de la API `HandLandmarker` de MediaPipe. No es un modelo de lenguaje, sino un modelo de vision por computador especializado en keypoint detection, con pesos en FP16 y un tamano total de 7,8 MB, lo que lo hace apto para entornos con recursos muy limitados.

El modelo resuelve dos problemas encadenados: primero localiza las manos en el fotograma completo mediante un detector single-shot, y despues regresa sobre la region recortada las coordenadas normalizadas de 21 articulaciones, coordenadas metricas en un sistema de referencia 3D basado en el modelo articulado GHUM, una puntuacion de presencia de mano y la lateralidad del sujeto (izquierda o derecha). En modos `VIDEO` y `LIVE_STREAM` reutiliza la caja delimitadora del fotograma anterior para localizar la mano y solo vuelve a disparar el detector de palmas cuando la confianza cae por debajo del umbral, lo que reduce el coste computacional en secuencias.

Su relevancia actual radica en que ofrece una solucion de seguimiento de manos lista para produccion, con licencia Apache 2.0, pesos cuantizados a FP16 y soporte multiplataforma, sin necesidad de infraestructura de servidor. Esta orientado a aplicaciones de interaccion gestual, realidad aumentada, accesibilidad y analisis de video en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos etapas: detector de palmas single-shot + regresor de landmarks (CNN, formato TFLite) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 192x192 y 224x224) |
| Tipos de cuantizacion | FP16 (pesos del bundle) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite empaquetado en `.task` (`hand_landmarker.task`, 7,82 MB) |

## Arquitectura y entrenamiento

El bundle `hand_landmarker.task` contiene dos submodelos TFLite. El primero, `hand_detector.tflite` (2,34 MB), es un detector single-shot con entrada `[1, 192, 192, 3]` en `float32` y normalizacion `mean=[0.0]`, `std=[255.0]`; produce 2016 anclas con 18 valores de regresion de palma y una puntuacion de deteccion. El segundo, `hand_landmarks_detector.tflite` (5,48 MB), recibe un recorte de `[1, 224, 224, 3]` y devuelve cuatro salidas: 63 valores de landmarks normalizados, una puntuacion de presencia, una puntuacion de lateralidad y 63 valores de landmarks en coordenadas de mundo. Ambos submodelos incluyen metadatos `TFLITE_METADATA` con autor `MediaPipe` y ficheros asociados (`labels.txt` y `handedness.txt`).

El entrenamiento se realizo con aproximadamente 30 000 imagenes reales junto con poses de mano sinteticas renderizadas sobre fondos variados. La model card no detalla el numero de tokens ni un pipeline de RLHF/DPO, algo esperable en un modelo de vision. La innovacion tecnica destacable es el seguimiento por reutilizacion de la caja del fotograma anterior en modos de video y streaming, que evita ejecutar el detector de palmas en cada fotograma y reduce la latencia. La estimacion de coordenadas metricas de mundo se apoya en el modelo articulado GHUM.

## Capacidades

- Deteccion de manos en imagen completa mediante el detector de palmas, con soporte para varias manos simultaneas (`num_hands` configurable).
- Regresion de 21 puntos clave 3D por mano en coordenadas normalizadas de imagen.
- Regresion de 21 puntos clave 3D en coordenadas metricas de mundo estimadas con el modelo GHUM.
- Puntuacion de presencia de mano por deteccion.
- Clasificacion de lateralidad (izquierda o derecha) referida a la mano del sujeto, no a la del observador.
- Seguimiento temporal en modos `VIDEO` y `LIVE_STREAM` con reutilizacion de la caja del fotograma previo.
- Ejecucion on-device en Web, Android, iOS, Python y Flutter mediante la API `HandLandmarker` de MediaPipe.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues; no es un modelo generativo.

## Casos de uso

- Interaccion gestual en tiempo real: el modelo permite reconocer la posicion de las 21 articulaciones de la mano en cada fotograma y mapearlas a comandos de interfaz, aprovechando el modo `LIVE_STREAM` y el seguimiento por caja previa para mantener la latencia baja en dispositivos moviles.
- Realidad aumentada y filtros: superponer objetos virtuales anclados a puntos clave concretos (por ejemplo, `INDEX_FINGER_TIP` o `WRIST`) gracias a las coordenadas normalizadas y de mundo que devuelve el regresor.
- Accesibilidad: control de aplicaciones o cursores mediante gestos de mano para usuarios con movilidad reducida, desplegando el bundle en Android, iOS o Web sin servidor.
- Analisis de video deportivo o de rehabilitacion: extraer trayectorias de articulaciones a lo largo de una secuencia para evaluar movimientos de la mano, usando el modo `VIDEO` con seguimiento temporal.
- Educacion y demostraciones interactivas: aplicaciones web que muestran en el navegador el esqueleto de la mano detectado, apoyandose en la demo web oficial y en el runtime de MediaPipe para Web.
- Prototipado rapido en Python: validar pipelines de vision con `mediapipe` y `huggingface_hub` en pocas lineas, descargando el `.task` directamente desde el repositorio.
- Sistemas de senalizacion o control sin contacto en entornos industriales o sanitarios, donde un modelo de 7,8 MB puede ejecutarse en hardware embebido sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el bundle completo ocupa 7,82 MB en FP16, por lo que la huella de memoria es muy reducida y cabe en GPUs integradas o en CPU.
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecucion on-device en CPU, GPU movil o aceleradores delegados de TFLite (GPU delegate, NNAPI, Core ML) segun la plataforma.
- Compatibilidad con GPU de consumo: si, dada la baja huella de memoria; no requiere GPUs de datacenter como A100 o H100.
- Opciones de despliegue: MediaPipe Tasks en Python, Android, iOS, Web y Flutter; el formato TFLite permite su uso con el runtime de TensorFlow Lite y con LiteRT.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe Hand Landmarker (Full) | no disponible (bundle de 7,82 MB) | Imagen 192x192 y 224x224 | 21 landmarks 3D + lateralidad | Apache 2.0 | Hugging Face, MediaPipe Tasks |
| MediaPipe Hand Landmarker (Lite) | no disponible | no disponible | 21 landmarks 3D | Apache 2.0 | Referenciado en la model card upstream |
| Otras alternativas de hand tracking | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona una variante Lite frente a la Full y un model card upstream de Google con evaluacion de fairness (octubre de 2021), pero no se proporcionan especificaciones detalladas de la variante Lite ni de modelos competidores que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La lateralidad devuelta corresponde a la mano del sujeto, no a la del observador; en fotogramas de selfie con espejo hay que invertir las coordenadas o la etiqueta para evitar confusiones.
- El modelo esta entrenado principalmente con unas 30 000 imagenes reales y poses sinteticas; puede degradarse en condiciones de iluminacion extrema, oclusiones severas, manos fuera de encuadre o fondos muy similares al tono de piel.
- Al ser un modelo de vision no generativo, no produce texto ni razonamiento; no debe emplearse para tareas de lenguaje, codigo o matematicas.
- No se dispone de informacion sobre sesgos demograficos especificos en la model card incluida; el PDF upstream de fairness (octubre de 2021) es la referencia citada para evaluar este aspecto.
- El seguimiento por reutilizacion de caja puede perder la mano si el movimiento entre fotogramas es muy rapido, obligando a reejecutar el detector de palmas.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del model card upstream de Google y de las dependencias de MediaPipe.
- No se han publicado cifras de latencia, throughput ni benchmarks de precision en la informacion disponible, lo que limita la evaluacion previa al despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MediaPipe-HandLandmarker-Full
- Fichero del bundle: https://huggingface.co/litert-community/MediaPipe-HandLandmarker-Full/blob/main/hand_landmarker.task
- Demo web oficial: https://google-ai-edge.github.io/mediapipe-samples-web/#/vision/hand_landmarker
- Documentacion de MediaPipe Hand Landmarker: https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker
- Paper citado (arXiv:2006.10214): https://arxiv.org/abs/2006.10214
- Model card upstream (PDF en el repositorio): https://huggingface.co/litert-community/MediaPipe-HandLandmarker-Full/blob/main/Model%20Card%20Hand%20Tracking%20%28Lite_Full%29%20with%20Fairness%20Oct%202021.pdf
