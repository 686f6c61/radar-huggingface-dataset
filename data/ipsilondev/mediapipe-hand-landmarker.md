# ipsilondev/mediapipe-hand-landmarker

## Resumen

`ipsilondev/mediapipe-hand-landmarker` es un repositorio espejo que contiene una copia sin modificaciones del modelo oficial MediaPipe Hand Landmarker de Google. No se trata de un modelo de lenguaje ni de un modelo generativo, sino de un bundle de visión por computador compuesto por un detector de palmas y un modelo de regresión de 21 puntos clave (landmarks) de la mano, empaquetado en formato `.task` (contenedor TFLite en float16). El autor, `ipsilondev`, lo publica con el único propósito de permitir que aplicaciones Android fijen la versión por commit mediante submódulos de git.

El problema que resuelve es de reproducibilidad y suministro: las aplicaciones que consumen el modelo desde los buckets de Google Cloud Storage no pueden garantizar que el binario servido en `latest` permanezca inmutable. Al espejar el fichero con su hash SHA-256 documentado, los desarrolladores pueden verificar la integridad del binario y evitar cambios silenciosos en producción.

Es relevante en el contexto del desarrollo de aplicaciones Android con `com.google.mediapipe:tasks-vision`, donde el modelo se carga de forma nativa en el dispositivo. No hay parámetros en el sentido de los modelos neuronales generativos, ni contexto, ni capacidades lingüísticas: es un componente de inferencia especializado en detección y seguimiento de manos en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline MediaPipe: detector de palmas + modelo de regresión de 21 landmarks de mano (TFLite) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | float16 (única variante publicada en este espejo) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache-2.0 (Google LLC) |
| Formato de pesos | `.task` (bundle TFLite, 7.819.105 bytes) |

## Arquitectura y entrenamiento

El bundle `hand_landmarker.task` integra dos etapas en un pipeline de inferencia: un detector de palmas que localiza la región de la mano en la imagen y un modelo de regresión que predice 21 puntos clave tridimensionales a partir del recorte. Ambos componentes están empaquetados en formato TFLite y cuantizados a float16, lo que reduce el tamaño del binario y acelera la inferencia en GPU móvil y CPU.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens (no aplica), la composición de los datos ni si hubo etapas de ajuste fino o RL. El autor indica explícitamente que no ha realizado conversión, cuantización ni modificación alguna respecto al original de Google; el repositorio es un espejo byte a byte con SHA-256 documentado para verificación.

## Capacidades

- Detección de manos en imágenes y flujo de vídeo en tiempo real.
- Predicción de 21 landmarks por mano con coordenadas 3D (x, y, z relativas).
- Soporte de múltiples manos simultáneas (el pipeline de MediaPipe lo permite configurando `num_hands`).
- Seguimiento temporal entre fotogramas mediante la lógica de MediaPipe Tasks.
- Ejecución nativa en Android a través de `com.google.mediapipe:tasks-vision`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni visión general más allá de manos.

## Casos de uso

- Control por gestos en apps Android: integración del bundle en `HandLandmarker` para detectar gestos de la mano (pinza, puño, palma abierta) y mapearlos a acciones de UI, aprovechando la inferencia en dispositivo sin latencia de red.
- Realidad aumentada móvil: superposición de elementos gráficos anclados a los landmarks de la mano en tiempo real, usando el pipeline nativo de MediaPipe Tasks.
- Accesibilidad: seguimiento de manos para interfaces sin contacto en aplicaciones Android dirigidas a usuarios con movilidad reducida.
- Verificación de integridad en CI/CD: fijar el binario por commit mediante submódulo git y validar el SHA-256 en el pipeline de build para garantizar que la app empaquetada usa exactamente el modelo auditado.
- Reproducibilidad en investigación: congelar la versión del modelo en experimentos de visión por computador para que los resultados sean replicables a lo largo del tiempo, evitando que el endpoint `latest` de Google sirva una versión distinta.
- Distribución offline: incluir el modelo dentro del APK o AAB para aplicaciones que operan sin conectividad y no pueden descargar el bundle desde Google Cloud Storage en el primer arranque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica (modelo para inferencia en dispositivo, no en GPU de servidor).
- GPU recomendadas: no aplica; el bundle está pensado para GPU móvil (Adreno, Mali) y CPU ARM mediante los delegados de TFLite.
- Cabe en cualquier dispositivo Android moderno: el binario pesa 7,46 MiB y la inferencia se ejecuta en el propio teléfono.
- Opciones de despliegue: MediaPipe Tasks para Android (`com.google.mediapipe:tasks-vision`); no está pensado para vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ipsilondev/mediapipe-hand-landmarker` (este repo) | Espejo del bundle oficial de Google | `.task` (TFLite float16) | Apache-2.0 | Hugging Face, 0 descargas |
| MediaPipe Hand Landmarker oficial (Google) | Modelo original | `.task` (TFLite) | Apache-2.0 | Google Cloud Storage (`latest`) |
| MediaPipe Hands (solución legacy) | Pipeline anterior de MediaPipe | `.tflite` suelto | Apache-2.0 | Distribución MediaPipe |
| Modelos de landmarks de mano en Hugging Face (terceros) | Conversiones y reentrenamientos | variable | variable | Hugging Face |

La diferencia práctica frente al original es la inmutabilidad por commit y la verificación por SHA-256; frente a las soluciones legacy, el bundle `.task` es el formato soportado por MediaPipe Tasks. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite prompts; cualquier uso en ese sentido es un error de categoría.
- Solo detecta manos; no cubre cuerpo, cara, objetos ni otras clases.
- Depende de la precisión del detector de palmas: manos muy ocluidas, guantes, iluminación extrema o resoluciones bajas degradan la detección.
- El espejo no incluye garantías de actualización: si Google publica una versión nueva en `latest`, este repositorio seguirá apuntando a la versión descargada el 2026-11-20.
- El clonado sin `git-lfs` devuelve punteros de ~130 bytes en lugar del binario real; es necesario instalar LFS o ejecutar `git lfs pull` y verificar el SHA-256 documentado.
- Licencia Apache-2.0 permite uso comercial, pero conviene conservar los avisos de copyright de Google LLC y revisar los términos del modelo original.
- No se han publicado métricas de precisión, sesgos ni evaluación en dominios específicos en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ipsilondev/mediapipe-hand-landmarker
- Origen del binario (Google Cloud Storage): https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task
- Documentación de MediaPipe Hand Landmarker: https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker
- MediaPipe Tasks para Android: https://ai.google.dev/edge/mediapipe/solutions/tasks
