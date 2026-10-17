# jordimas/drama-3-ct2

## Resumen

drama-3-ct2 es una conversión al motor CTranslate2 del modelo de síntesis de voz Fish Audio Drama 3 (fishaudio/drama-3), publicada por el usuario jordimas. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: toma los pesos originales y los reempaqueta en el formato binario de CTranslate2 para permitir inferencia optimizada, con soporte de CPU y GPU, sin depender de PyTorch en tiempo de ejecución. El repositorio ocupa 47,7 GB y se distribuye bajo la licencia comunitaria de Fish Audio.

El interés técnico de esta conversión está en cómo se han preservado los pesos: los expertos del modelo original se mantienen en FP8 E4M3 junto con sus escalas de bloque (block scales), mientras que el resto de pesos y el códec de audio se almacenan en FP32. La mención explícita de "expertos" en la model card apunta a una arquitectura con mezcla de expertos (MoE) en el modelo base, aunque el autor no publica el número de parámetros totales ni activos.

Es relevante ahora porque permite ejecutar un modelo de TTS de gran tamano en infraestructura sin PyTorch y con cuantización de runtime de CTranslate2, algo poco habitual en el ecosistema de síntesis de voz. La contrapartida es que requiere una compilación personalizada de CTranslate2 con soporte para Drama3, por lo que las versiones estándar de PyPI no sirven. Además, la ficha no documenta idiomas, contexto ni resultados de evaluación, y el repositorio no tiene descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Conversión CTranslate2 de fishaudio/drama-3; la presencia de "expertos" en FP8 E4M3 con escalas de bloque sugiere una arquitectura MoE en el modelo base, sin confirmación del autor |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (modelo de texto a voz; la unidad relevante sería la longitud máxima de texto de entrada, no documentada) |
| Tipos de cuantización | Expertos en FP8 E4M3 con escalas de bloque; resto de pesos y códec de audio en FP32. En runtime, CTranslate2 admite `compute_type` (`default`, `int8`, `int8_float16`, `float16`) sujeto a la build personalizada |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | fish-audio-community-license (etiquetada como `other` en HuggingFace) |
| Formato de pesos | CTranslate2 (directorio de modelo binario con configuración), no safetensors ni GGUF |
| Modelo base | fishaudio/drama-3 |
| Pipeline | text-to-speech |
| Tamano del repositorio | 47,7 GB |
| Librería | ctranslate2 |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna del modelo base más allá de la estructura de pesos. Lo que sí se detalla es el proceso de conversión: los tensores correspondientes a los expertos se conservan en FP8 E4M3 con sus escalas de bloque originales, y el resto de pesos junto con el códec de audio se almacenan en FP32. Esta mezcla indica que el modelo base emplea cuantización de precisión mixta por bloques, un esquema habitual en modelos MoE de gran tamano para reducir huella de memoria sin degradar demasiado la calidad. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

La innovación práctica de esta publicación no está en el entrenamiento, sino en el empaquetado: la inferencia se realiza mediante `ctranslate2._ext.Drama3(model_path, device="cpu", compute_type="default")`, una API de extensión que requiere una compilación de CTranslate2 con soporte explícito para Drama3, mantenida en el repositorio github.com/jordimas/CTranslate2. Es decir, el modelo depende de un fork, no de la distribución oficial del motor. Según la model card, la conversión se realizó con el soporte de Fish Audio, lo que sugiere acceso a los pesos y posible validación por parte del desarrollador original, aunque no se aportan métricas de fidelidad entre la salida del modelo original y la convertida.

## Capacidades

- Síntesis de voz (text-to-speech) como función principal del pipeline declarado.
- Generación de audio con códec integrado, cuyos pesos se conservan en FP32 en esta conversión.
- Inferencia en CPU mediante `device="cpu"`, y presumiblemente en GPU a través del mismo motor (no documentado explícitamente en la ficha).
- Control de prosodia, emociones, clonación de voz o selección de hablante: no disponible en la información proporcionada; son capacidades del modelo base que el autor no detalla.
- Soporte multilingüe: no disponible.
- Tool calling, function calling, razonamiento multi-paso o modo "thinking": no aplica ni está documentado; es un modelo de audio, no de propósito general.
- Capacidades de visión o audio de entrada: no disponible.

## Casos de uso

- Doblaje y localización de vídeo: el modelo puede generar pistas de voz para sustituir el audio original de un vídeo, integrándose en un pipeline con CTranslate2 en CPU para abaratar costes frente a GPU en procesos por lotes.
- Audiolibros y contenido largo: síntesis por fragmentos de texto con una voz consistente, aprovechando la inferencia en CPU para procesar capítulos completos en servidores sin GPU dedicada.
- Asistentes de voz y agentes conversacionales: generación de respuestas habladas en tiempo de ejecución dentro de un servicio backend, sustituyendo a APIs comerciales de TTS cuando la licencia comunitaria lo permita.
- Accesibilidad: conversión de artículos, documentación o avisos a audio para lectores de pantalla y plataformas de contenido accesible, con despliegue en infraestructura propia.
- Datos sintéticos para entrenamiento de ASR: generación de corpus de audio etiquetado para ajustar o evaluar sistemas de reconocimiento de voz, con control sobre el texto de entrada.
- Atención al cliente e IVR: locuciones dinámicas para respuestas telefónicas o mensajes de voz generados a partir de texto variable, donde el coste por petición y la latencia importan más que la variedad de voces.
- Investigación en síntesis de voz: punto de partida para estudiar cuantización FP8 en modelos MoE de audio y comparar la calidad entre el modelo original en PyTorch y la versión CTranslate2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas objetivas (MOS, WER, similitud de hablante), ni comparaciones con el modelo base, ni mediciones de latencia o throughput. Tampoco se han encontrado datos en la búsqueda web realizada, cuyos resultados no guardaban relación con el modelo.

## Requisitos de hardware

- Requisito previo no negociable: compilar CTranslate2 desde el fork github.com/jordimas/CTranslate2. Las builds de PyPI pueden no cargar el modelo.
- VRAM estimada: el repositorio pesa 47,7 GB (expertos FP8 + resto FP32). Cargar el conjunto completo en memoria de GPU requiere del orden de 48 GB o más, sin contar activaciones ni buffers del códec. Cifra estimada a partir del tamano del repo, no publicada por el autor.
- GPU recomendadas para carga completa en memoria: A100 80 GB, H100 80 GB, L40S 48 GB (al límite). No cabe en GPU de consumo de 24 GB (RTX 4090, 3090) sin cuantización adicional de la que el repositorio no ofrece variantes.
- Inferencia en CPU: soportada explícitamente (`device="cpu"`), lo que implica un requisito de RAM cercano al tamano del modelo y latencias no documentadas; en la práctica exige servidores con 64 GB de RAM o más.
- Opciones de despliegue: API Python de CTranslate2 con la extensión `Drama3`. No hay soporte en vLLM, TGI, llama.cpp ni Ollama, ya que el formato de pesos y el motor son específicos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| jordimas/drama-3-ct2 | TTS (MoE presumible, no confirmado) | No disponible | No disponible | fish-audio-community-license | CTranslate2 |
| fishaudio/drama-3 | TTS (modelo original) | No disponible | No disponible | fish-audio-community-license | No disponible en esta información |
| Fish Speech / OpenAudio (familia Fish Audio) | TTS | No disponible | No disponible | No disponible en esta información | No disponible en esta información |
| Coqui XTTS v2 | TTS multilingüe con clonación | No disponible en esta información | No disponible | Coqui Public Model License (no comercial) | No disponible en esta información |
| Kokoro-82M | TTS ligero | 82 M | No disponible | Apache 2.0 | safetensors / ONNX |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han publicado parámetros, contexto ni métricas de calidad para drama-3 ni para esta conversión. La diferencia más objetiva frente a XTTS v2 y Kokoro es de empaquetado y licencia: Kokoro es Apache 2.0 y cabe en hardware de consumo, mientras que esta conversión exige ~48 GB de memoria y una licencia comunitaria con posibles restricciones comerciales.

## Limitaciones y advertencias

- Dependencia de un fork: sin la compilación personalizada de CTranslate2, el modelo no carga. Esto complica el mantenimiento, la actualización de seguridad y la reproducibilidad en producción.
- Licencia fish-audio-community-license: no es una licencia open source estándar. Es imprescindible revisar el archivo LICENSE y el Notice del repositorio antes de cualquier uso comercial; no se detallan aquí sus términos porque no están incluidos en la información disponible.
- Ausencia total de documentación sobre idiomas: no se puede asumir soporte de castellano ni de ninguna otra lengua concreta sin pruebas propias.
- Riesgo de alucinación y artefactos de audio: en TTS se traduce en prosodia incorrecta, pronunciación errónea, ruido, cortes o repeticiones; no hay métricas publicadas que cuantifiquen la tasa de fallo.
- Sin datos de fidelidad de la conversión: no se documenta la degradación introducida por mantener expertos en FP8 ni por usar FP32 en el códec, ni se compara la salida con el modelo original.
- Sesgos: no documentados. En modelos de voz, los sesgos de acento, género y calidad por variedad lingüística suelen depender de la distribución del corpus de entrenamiento, que aquí se desconoce.
- Uso dual y suplantación de identidad: al ser un modelo de síntesis de voz, existe riesgo de clonación no consentida. La licencia y la legislación aplicable (por ejemplo, obligaciones de etiquetado de contenido sintético) deben evaluarse antes de desplegarlo de cara al público.
- Huella de memoria elevada: 47,7 GB en disco y una necesidad de memoria del mismo orden limitan su uso a servidores; no es viable en portátiles ni en GPU de consumo sin trabajo adicional de cuantización.
- Repositorio sin tracción: 0 descargas y 0 valoraciones en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jordimas/drama-3-ct2
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Fork de CTranslate2 con soporte Drama3: https://github.com/jordimas/CTranslate2
- Fish Audio (desarrollador del modelo base): https://fish.audio
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la búsqueda web realizada.
