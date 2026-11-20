# ipsilondev/yamnet-tflite

## Resumen

`yamnet-tflite` es un espejo sin modificaciones de los ficheros oficiales del modelo YAMNet publicados por Google dentro del ecosistema MediaPipe. Lo mantiene el usuario `ipsilondev` con el objetivo de que las aplicaciones Android puedan fijar el binario por commit mediante un submódulo de git, evitando depender de la URL de Google Cloud Storage en tiempo de compilación. No hay conversión, cuantización ni reentrenamiento: el fichero `yamnet.tflite` es byte a byte el que distribuye Google.

YAMNet es un clasificador de eventos de audio basado en la arquitectura MobileNetV1 (profundidad configurable) y entrenado sobre AudioSet. Recibe ventanas de 15 600 muestras de audio a 16 kHz (0,975 segundos) y devuelve puntuaciones para 521 clases de eventos sonoros según la ontología AudioSet, además de embeddings intermedios útiles para transferencia de aprendizaje. El modelo se consume a través de MediaPipe Tasks Audio (`com.google.mediapipe:tasks-audio`) en Android, no en runtimes web.

Su relevancia es práctica más que de investigación: es un artefacto de despliegue reproducible con hash SHA-256 verificable, pensado para integrarse en apps móviles que necesitan clasificación de audio en dispositivo con bajo consumo. No es un modelo de lenguaje ni un modelo generativo; es un clasificador ligero de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV1 (clasificador de audio YAMNet, segun la implementacion publica de Google) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrada de 15 600 muestras (0,975 s a 16 kHz) |
| Tipos de cuantizacion | float32 (unica variante incluida en este repo) |
| Idiomas soportados | no aplica (clasificacion de eventos de audio, no texto) |
| Licencia | Apache-2.0 (Google LLC); las etiquetas AudioSet bajo CC BY-SA 4.0 |
| Formato de pesos | TFLite (`.tflite`), almacenado como objeto LFS/Xet |
| Tamano del fichero | 4 126 810 bytes (`yamnet.tflite`) |
| SHA-256 | `4d8b4a53282dc83ef04e3e7dbc4fbc98082e34e44ed798e16c3a0cdd4c584faf` |
| Clases de salida | 521 clases AudioSet (lista embebida como `yamnet_label_list.txt`) |
| Libreria de carga | MediaPipe Tasks Audio (Android) |

## Arquitectura y entrenamiento

El fichero corresponde a YAMNet, un clasificador de eventos acusticos construido sobre MobileNetV1 y entrenado por Google con el corpus AudioSet. La entrada son formas de onda de 15 600 muestras a 16 kHz; la red produce puntuaciones por clase sobre las 521 categorias de la ontologia AudioSet y expone embeddings intermedios que pueden reutilizarse como extractor de caracteristicas para tareas de audio posteriores.

No se dispone en la informacion proporcionada de detalles sobre el numero exacto de parametros, el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de destilacion o ajuste fino especificas. El autor del espejo indica explicitamente que no ha realizado ninguna modificacion, conversion ni cuantizacion respecto al original de Google.

## Capacidades

- Clasificacion de eventos de audio en 521 clases de la ontologia AudioSet (musica, voz, sonidos ambientales, animales, vehiculos, alarmas, etc.).
- Extraccion de embeddings de audio para transferencia de aprendizaje o como entrada a clasificadores posteriores.
- Inferencia en dispositivo en Android mediante MediaPipe Tasks Audio.
- Procesamiento de ventanas de 0,975 s a 16 kHz, adecuado para flujos de audio en tiempo casi real.
- No soporta generacion de texto, razonamiento, codigo, vision ni tool calling.
- No es un modelo multilingue ni tiene modo de razonamiento extendido.

## Casos de uso

- Deteccion de eventos sonoros en apps Android: integrar el modelo con `AudioClassifier` de MediaPipe para identificar sonidos concretos (cristales rotos, ladridos, alarmas) sin enviar audio a la nube, gracias a la inferencia local en TFLite.
- Accesibilidad para personas con discapacidad auditiva: clasificar sonidos del entorno (timbre, llanto de bebe, sirena) y notificar mediante vibracion o aviso visual en el dispositivo.
- Monitorizacion ambiental en movil: etiquetar grabaciones de campo o de ciudad para estudios de contaminacion acustica, usando las 521 clases AudioSet como taxonomia predefinida.
- Preprocesado para pipelines de audio: usar los embeddings de YAMNet como caracteristicas de entrada a modelos downstream (deteccion de anomalias, segmentacion de escenas) en lugar de entrenar desde cero.
- Control por sonido en aplicaciones interactivas: disparar acciones en respuesta a eventos acusticos concretos (aplausos, palabras clave no verbales, golpes) en juegos o apps de domotica local.
- Reproducibilidad de builds Android: fijar el binario por commit mediante submódulo git y verificar el SHA-256 en CI, evitando que un cambio en la URL de Google Cloud Storage rompa la compilacion.
- Filtrado previo en asistentes de voz: descartar segmentos de audio sin habla ni eventos relevantes antes de invocar un modelo de reconocimiento de voz, reduciendo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso objetivo (Android); el fichero TFLite ocupa 4,1 MB y la inferencia es en CPU/GPU/NPU movil.
- GPU recomendadas: no aplica para el escenario de despliegue previsto; en escritorio puede ejecutarse en CPU sin problema dado el tamano del modelo.
- Cabe en cualquier dispositivo Android moderno; no requiere GPU dedicada.
- Opciones de despliegue: MediaPipe Tasks Audio para Android (`com.google.mediapipe:tasks-audio`); el autor indica que no esta pensado para runtimes web. Para escritorio, el TFLite puede cargarse con el interprete de TensorFlow Lite, aunque no es el caso de uso documentado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yamnet-tflite (este repo) | MobileNetV1 / TFLite | 15 600 muestras a 16 kHz | 521 AudioSet | Apache-2.0 (modelo) + CC BY-SA 4.0 (etiquetas) | Hugging Face (espejo) |
| YAMNet original (Google) | MobileNetV1 / TFLite | 15 600 muestras a 16 kHz | 521 AudioSet | Apache-2.0 | Google Cloud Storage / TF Hub |
| Otros clasificadores de audio MediaPipe | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico comparable directo identificable es el propio YAMNet original de Google, del cual este repositorio es una copia identica. No se dispone de informacion sobre alternativas adicionales en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni generativo: no responde a prompts, no genera texto y no debe presentarse como tal.
- Las etiquetas de clase provienen de la ontologia AudioSet (CC BY-SA 4.0); cualquier app que muestre los nombres de clase debe atribuir a Google y a AudioSet en su pantalla de licencias.
- El modelo solo clasifica eventos acusticos dentro de las 521 clases AudioSet; sonidos fuera de esa taxonomia no se reconocen de forma fiable.
- Ventana de entrada fija de 0,975 s: eventos mas largos requieren segmentacion y agregacion manual.
- Solo se distribuye la variante float32; no hay versiones cuantizadas en este repositorio, lo que puede limitar el rendimiento en dispositivos muy restringidos.
- Los ficheros se almacenan como objetos LFS/Xet: un `git clone` sin `git-lfs` produce punteros de ~130 bytes. Es obligatorio verificar el SHA-256 indicado.
- El autor declara que no se ha modificado el binario; cualquier cambio de comportamiento respecto al original de Google seria ajeno a este espejo.
- No hay informacion sobre sesgos del modelo en la documentacion proporcionada; al ser un clasificador de audio, los sesgos dependeran del corpus AudioSet y de su cobertura por clases.
- La licencia Apache-2.0 cubre el fichero del modelo; el uso comercial es posible, pero la atribucion de la ontologia AudioSet sigue siendo obligatoria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ipsilondev/yamnet-tflite
- Modelo original (Google Cloud Storage): https://storage.googleapis.com/mediapipe-models/audio_classifier/yamnet/float32/latest/yamnet.tflite
- Ontologia AudioSet: https://research.google.com/audioset/
- Descarga de AudioSet: https://research.google.com/audioset/download.html
- MediaPipe Tasks Audio (Android): https://developers.google.com/mediapipe/solutions/audio
