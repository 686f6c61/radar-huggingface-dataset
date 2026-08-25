# r3lax/wav2vec-english-speech-emotion-recognition

## Resumen

El modelo `r3lax/wav2vec-english-speech-emotion-recognition` es un sistema de reconocimiento de emociones en habla (SER, por sus siglas en inglés) que clasifica audio en inglés en siete categorías emocionales: enfado, asco, miedo, felicidad, neutralidad, tristeza y sorpresa. Se trata de un ajuste fino (*fine-tuning*) de la arquitectura Wav2Vec 2.0, concretamente del modelo preentrenado `jonatasgrosman/wav2vec2-large-xlsr-53-english`, desarrollado por el usuario r3lax y publicado bajo licencia Apache 2.0.

El modelo resuelve el problema de extraer información emocional de señales de voz, algo relevante para aplicaciones de análisis de sentimiento, atención al cliente, salud mental o sistemas de asistencia conversacional. Su relevancia actual reside en que aprovecha una arquitectura de autosupervisión robusta (Wav2Vec 2.0) para una tarea de clasificación con pocos datos etiquetados, logrando una precisión superior al 97 % en el conjunto de evaluación. El repositorio incluye el código de inferencia y los hiperparámetros de entrenamiento, lo que facilita su reproducción y adaptación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (fine-tune de `wav2vec2-large-xlsr-53-english`) |
| Parámetros totales | no disponible (el modelo base `wav2vec2-large-xlsr-53-english` tiene aproximadamente 315 millones, pero no se confirma el tamaño del ajuste) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la duración del audio; no se especifica un límite máximo) |
| Tipos de cuantización | no disponible (el repositorio no publica versiones cuantizadas) |
| Idiomas soportados | inglés (único idioma de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene un archivo de 3.8 GB; probablemente `pytorch_model.bin` o `safetensors`, pero no se indica) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `wav2vec2-large-xlsr-53-english`, que a su vez es una variante de Wav2Vec 2.0 entrenada con datos multilingües (XLSR-53) y posteriormente afinada para inglés. Wav2Vec 2.0 es un modelo transformer basado en convoluciones y atención, preentrenado de forma autosupervisada sobre audio crudo. El ajuste fino se realizó para clasificación de secuencias, con una cabeza de clasificación que asigna una etiqueta de emoción a cada fragmento de audio.

El entrenamiento se realizó con tres bases de datos de emociones: SAVEE (480 archivos de 4 actores masculinos), RAVDESS (1440 archivos de 24 actores profesionales) y TESS (2800 archivos de 2 actrices). Los hiperparámetros incluyen un *learning rate* de 0.0001, *batch size* de 4, *gradient accumulation steps* de 2, 4 épocas y un máximo de 7500 pasos. Se utilizó el optimizador Adam con betas (0.9, 0.999) y épsilon 1e-08. El mejor resultado de validación se obtuvo en el paso 7000 con una pérdida de 0.1039 y una exactitud de 0.9767, mientras que el paso final (7500) logró una exactitud de 0.9746 y pérdida de 0.1041.

## Capacidades

- Reconocimiento de emociones en audio en inglés: clasifica fragmentos de voz en siete emociones discretas (enfado, asco, miedo, alegría, neutral, tristeza y sorpresa).
- Inferencia directa desde archivos de audio (formato WAV, muestreado a 16 kHz) mediante el uso de `librosa` y `transformers`.
- Uso en tiempo real o por lotes: el código de ejemplo permite procesar archivos individuales, pero la arquitectura es compatible con inferencia por lotes.
- Sin soporte de *tool calling* ni agentes: es un modelo de clasificación simple, no de generación.
- No multilingüe: entrenado únicamente en inglés, aunque la base XLSR es multilingüe, el ajuste fino se limita al inglés.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede analizar llamadas de soporte para detectar si el cliente está enfadado o frustrado, permitiendo priorizar respuestas o escalar a un agente humano. Su precisión del 97 % en datos de validación lo hace útil para triaje automático en centros de contacto.
- **Análisis de sentimientos en grabaciones de voz**: en encuestas de satisfacción o grabaciones de reuniones, se puede extraer la emoción predominante de cada intervención para obtener métricas de estado de ánimo del usuario.
- **Monitoreo de salud mental**: en aplicaciones de salud, el modelo puede analizar el tono de voz de pacientes para detectar signos de tristeza o miedo, ayudando a terapeutas a identificar cambios en el estado emocional de manera remota.
- **Sistemas de asistencia por voz**: integrar el modelo en un asistente de voz para que ajuste su tono o respuesta según la emoción detectada en el usuario, mejorando la experiencia de usuario.
- **Investigación en psicología**: los investigadores pueden usar el modelo para etiquetar automáticamente grandes corpus de audio emocional, reduciendo el tiempo de anotación manual.
- **Validación de sistemas de voz**: en desarrollo de productos de voz, se puede probar la naturalidad de un sistema TTS evaluando la emoción percibida en la salida de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la información disponible. Los únicos datos de rendimiento provienen de la evaluación interna durante el entrenamiento:

| Paso | Pérdida de entrenamiento | Pérdida de validación | Exactitud |
|------|--------------------------|------------------------|-----------|
| 500  | 1.8124                  | 1.365212               | 0.486258  |
| 1000 | 0.8872                  | 0.773145               | 0.797040  |
| 1500 | 0.7035                  | 0.574954               | 0.852008  |
| 2000 | 0.6879                  | 1.286738               | 0.775899  |
| 2500 | 0.6498                  | 0.697455               | 0.832981  |
| 3000 | 0.5696                  | 0.337240               | 0.892178  |
| 3500 | 0.4218                  | 0.307072               | 0.911205  |
| 4000 | 0.3088                  | 0.374443               | 0.930233  |
| 4500 | 0.2688                  | 0.260444               | 0.936575  |
| 5000 | 0.2973                  | 0.302985               | 0.923890  |
| 5500 | 0.1765                  | 0.165439               | 0.961945  |
| 6000 | 0.1475                  | 0.170199               | 0.961945  |
| 6500 | 0.1274                  | 0.155310               | 0.966173  |
| 7000 | 0.0699                  | 0.103882               | 0.976744  |
| 7500 | 0.0830                  | 0.104075               | 0.974630  |

La exactitud final de 0.9746 se obtuvo sobre un conjunto de evaluación no detallado (no se especifica su tamaño ni composición).

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo base `wav2vec2-large` tiene alrededor de 315 millones de parámetros. En FP32, el peso ocupa ~1.2 GB; en FP16, ~0.6 GB. Para inferencia en lote de audio corto, se estima que se necesita entre 1 y 2 GB de VRAM en GPU, dependiendo del tamaño de lote y la duración del audio.
- **GPUs recomendadas**: funciona en GPUs de consumo como NVIDIA GTX 1060 (6 GB) o superiores. En el repositorio no se especifica una GPU concreta de entrenamiento, pero es probable que se haya usado una GPU de gama alta (por ejemplo, V100 o RTX 2080) dado el tamaño.
- **CPU**: también puede ejecutarse en CPU, aunque la latencia será mayor. Para inferencia en tiempo real se recomienda GPU.
- **Opciones de despliegue**: es compatible con las librerías de Hugging Face (`transformers`, `torch`). Puede usarse con `vLLM` o `TGI` para servir, aunque no hay versiones cuantizadas. También se puede desplegar con `ONNX Runtime` si se convierte el modelo, pero no se proporciona.
- **Latencia y throughput**: no hay datos publicados. En una GPU moderna, para un audio de 1 segundo, la inferencia probablemente sea inferior a 50 ms, pero no se ha medido oficialmente.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de reconocimiento de emociones en la información proporcionada. Sin embargo, se puede contextualizar con alternativas comunes:

| Modelo | Arquitectura | Idiomas | Exactitud en SER | Licencia | Disponibilidad |
|--------|--------------|---------|------------------|----------|----------------|
| `r3lax/wav2vec-english-speech-emotion-recognition` | Wav2Vec2 (large) | Inglés | 0.9747 (evaluación interna) | Apache 2.0 | Hugging Face |
| `hubert-base-emotion` (hipotético) | Hubert | Inglés | no disponible | no disponible | no disponible |
| `wav2vec2-base` con ajuste fino propio | Wav2Vec2 (base) | Inglés | no disponible | no disponible | no disponible |

No se puede afirmar que este modelo sea mejor o peor que otros sin benchmarks estandarizados. Los resultados de exactitud se basan en un conjunto de validación específico y no son comparables con otros modelos sin el mismo protocolo de evaluación.

## Limitaciones y advertencias

- **Datos de entrenamiento limitados**: los tres datasets (SAVEE, RAVDESS, TESS) son de laboratorio, con actores profesionales y condiciones controladas. El modelo puede no generalizar bien a habla natural, con acentos diversos, ruido de fondo o variaciones de micrófono.
- **Sesgo de género**: TESS y SAVEE tienen solo actores de un género (2 actrices en TESS, 4 actores en SAVEE), mientras RAVDESS incluye ambos pero desequilibrado. Esto puede provocar un sesgo en el reconocimiento de emociones según el género del hablante.
- **Idioma**: el modelo solo funciona con inglés; no es multilingüe.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero puede clasificar erróneamente emociones en audio ambiguo o con ruido, dando una salida segura pero incorrecta.
- **Código de ejemplo erróneo**: la model card incluye un ejemplo de código que usa `Wav2Vec2ForCTC`, que es incorrecto para clasificación de emociones (CTC se usa para reconocimiento de voz, no para clasificación). El usuario debe usar `Wav2Vec2ForSequenceClassification` en su lugar. Este error puede confundir a los desarrolladores.
- **Licencia**: Apache 2.0 permite uso comercial, pero debe incluirse el aviso de licencia y atribución.
- **Mantenimiento**: el modelo se creó en 2026-08-25, no tiene descargas ni likes, y no hay evidencia de actualizaciones. No es un modelo mantenido activamente.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/r3lax/wav2vec-english-speech-emotion-recognition](https://huggingface.co/r3lax/wav2vec-english-speech-emotion-recognition)
- Modelo base `jonatasgrosman/wav2vec2-large-xlsr-53-english`: [https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-english](https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-english)
- Dataset RAVDESS: [https://zenodo.org/record/1188976](https://zenodo.org/record/1188976)
- Dataset SAVEE: [http://kahlan.eps.surrey.ac.uk/savee/Database.html](http://kahlan.eps.surrey.ac.uk/savee/Database.html)
- Dataset TESS: [https://tspace.library.utoronto.ca/handle/1807/24487](https://tspace.library.utoronto.ca/handle/1807/24487)
- Blog de wav2vec 2.0 de Meta AI: [https://ai.meta.com/blog/wav2vec-20-learning-the-structure-of-speech-from-raw-audio/](https://ai.meta.com/blog/wav2vec-20-learning-the-structure-of-speech-from-raw-audio/)
- Repositorio de implementación alternativa: [https://github.com/Babitdor/Speech_Emotion_Recognition_Wav2Vec](https://github.com/Babitdor/Speech_Emotion_Recognition_Wav2Vec)
- Repositorio de otro ajuste fino: [https://github.com/K-Winkles/Wav2Vec2ForSpeechClassification](https://github.com/K-Winkles/Wav2Vec2ForSpeechClassification)
