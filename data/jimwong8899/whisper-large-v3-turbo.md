# JimWong8899/whisper-large-v3-turbo

## Resumen

Whisper large-v3-turbo es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado originalmente por OpenAI. Esta ficha corresponde a la réplica publicada por el usuario JimWong8899 en HuggingFace, que reproduce el checkpoint `openai/whisper-large-v3-turbo` bajo licencia MIT. El modelo es una versión podada y ajustada de Whisper large-v3 en la que el decodificador se reduce de 32 a 4 capas, lo que rebaja el total de parámetros a aproximadamente 809 millones y acelera notablemente la inferencia a costa de una degradación menor de la calidad.

La arquitectura es un transformer encoder-decoder clásico de Whisper, con un encoder de audio que procesa espectrogramas Mel y un decodificador de texto autorregresivo. El modelo mantiene la ventana de contexto de audio de 30 segundos por segmento y la capacidad de transcribir o traducir a inglés en más de 90 idiomas, incluyendo el castellano. Su relevancia actual radica en que ofrece un equilibrio atractivo entre velocidad y precisión para despliegues de ASR en producción, con un tamaño que cabe en GPUs de consumo y con soporte nativo en la librería Transformers.

Al estar entrenado sobre más de 5 millones de horas de audio etiquetado, Whisper muestra una fuerte capacidad de generalización zero-shot a dominios y datasets no vistos. Esta réplica concreta tiene un uso muy limitado en el Hub (18 descargas y 0 likes en el momento de la consulta) y no aporta modificaciones documentadas respecto al checkpoint original de OpenAI, por lo que debe tratarse como una copia espejo del modelo oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), decodificador podado a 4 capas |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento; 448 tokens maximos de decodificacion |
| Tipos de cuantizacion | no disponible en la model card; compatible con cuantizacion estandar de Transformers (fp16, fp32, int8) |
| Idiomas soportados | 99 idiomas, incluidos en, es, zh, de, fr, ru, ja, pt, it, ca, gl, eu y otros |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Whisper large-v3-turbo sigue la arquitectura encoder-decoder de la familia Whisper. El encoder transforma el audio de entrada (espectrograma Mel de 80 canales, ventanas de 30 segundos) en una secuencia de representaciones, y el decodificador genera el texto de forma autorregresiva. La innovación principal de la variante turbo es la reducción del decodificador de 32 a 4 capas, lo que disminuye drásticamente el coste computacional de la fase de generación, que suele ser el cuello de botella en ASR. El encoder mantiene su profundidad original, por lo que la representación acústica no se ve afectada.

El entrenamiento original de Whisper se realizó sobre más de 5 millones de horas de audio etiquetado, con una mezcla de datos multilingües y tareas de transcripción y traducción. La variante turbo se obtiene podando el decodificador de large-v3 y ajustando el modelo resultante; la model card no detalla el volumen exacto de datos de ese ajuste ni si se emplearon técnicas de RLHF o DPO (en ASR no son habituales). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal en esta réplica.

## Capacidades

- Transcripción automática de voz a texto en más de 90 idiomas, con detección automática del idioma de origen.
- Traducción de voz a texto en inglés (`task="translate"`) desde cualquiera de los idiomas soportados.
- Predicción de marcas de tiempo a nivel de frase y a nivel de palabra (`return_timestamps=True` o `"word"`).
- Decodificación con estrategias de Whisper: temperature fallback, condition on previous tokens, umbrales de compresión y de log-probabilidad, y detección de ausencia de habla.
- Procesamiento por lotes de múltiples audios para aumentar el throughput.
- Manejo de audio de duración arbitraria mediante segmentación interna en ventanas de 30 segundos.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente; es un modelo puramente ASR.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Subtitulado automático de vídeo y podcasts: el modelo genera transcripciones con marcas de tiempo a nivel de frase o palabra, lo que permite alinear subtítulos con precisión en flujos de postproducción.
- Actas y notas de reuniones: con una ventana de 30 segundos por segmento y procesamiento por lotes, puede transcribir grabaciones largas divididas en fragmentos, útil para herramientas de documentación corporativa.
- Atención al cliente basada en voz: integrado en un pipeline de ASR previo a un LLM, permite transcribir llamadas en castellano y otros idiomas para su análisis posterior o para generar respuestas.
- Traducción de contenido audiovisual: la tarea `translate` convierte audio en cualquier idioma soportado a texto en inglés, adecuada para internacionalizar catálogos de vídeo.
- Accesibilidad: generación de transcripciones en tiempo casi real para personas con discapacidad auditiva, aprovechando la velocidad del decodificador reducido.
- Indexación y búsqueda de archivos de audio: transcripción masiva de archivos para construir índices de texto searchable en archivos periodísticos, jurídicos o sanitarios.
- Análisis de llamadas de contact center: extracción de texto para minería de opiniones, control de calidad y detección de cumplimiento, con soporte multilingüe para operaciones internacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que la variante turbo es "mucho más rápida" que large-v3 con una "degradación menor de calidad", pero no aporta cifras de WER, MMLU, HumanEval ni de ningún otro conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1,6-2 GB para los pesos (808 M de parámetros), más overhead de activaciones y del encoder de audio; en la práctica, 2-4 GB suele ser suficiente para audio de 30 segundos.
- En fp32, el peso del modelo ronda los 3,2 GB, por lo que se recomienda fp16 en GPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Cabe sobradamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. En consumer GPU es plenamente viable.
- También puede ejecutarse en CPU, aunque con latencia considerablemente mayor.
- Opciones de despliegue: Transformers con `pipeline("automatic-speech-recognition")`, vLLM (soporte de Whisper), llama.cpp no aplica (no es un modelo de texto), TGI con soporte ASR según versión, y `faster-whisper` (CTranslate2) como alternativa optimizada aunque requiere conversión de pesos.
- Latencia y throughput: no disponibles en la información proporcionada; la reducción del decodificador a 4 capas reduce el coste de generación respecto a large-v3, pero no se aportan métricas concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper large-v3-turbo (esta réplica) | 809 M | 30 s/segmento | 99 | MIT | HuggingFace (JimWong8899) |
| Whisper large-v3 (OpenAI) | 1.550 M | 30 s/segmento | 99 | MIT | HuggingFace (openai) |
| Whisper large-v2 (OpenAI) | 1.550 M | 30 s/segmento | 99 | MIT | HuggingFace (openai) |
| Distil-Whisper large-v3 | ~756 M | 30 s/segmento | principalmente inglés | MIT | HuggingFace (distil-whisper) |

La comparativa se basa en datos públicos de los modelos citados; no se dispone de métricas de rendimiento comparadas en la información proporcionada para esta réplica concreta.

## Limitaciones y advertencias

- Alucinaciones: Whisper puede generar texto plausible pero incorrecto en segmentos con silencio, ruido o audio musical; se recomienda usar `no_speech_threshold` y `compression_ratio_threshold` para mitigarlo.
- Sesgos: el entrenamiento con datos web puede introducir sesgos de dominio, acento y género; el rendimiento en variedades dialectales del castellano no está garantizado al mismo nivel que en inglés.
- Idioma: aunque soporta 99 idiomas, la calidad es desigual; los idiomas con menos datos de entrenamiento presentan mayor tasa de error.
- Contexto: la ventana de 30 segundos obliga a segmentar audios largos, lo que puede romper la coherencia en frases que cruzan segmentos.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero el autor de la réplica no ofrece garantías sobre la integridad del checkpoint.
- Reputación del repositorio: con 18 descargas y 0 likes, esta réplica no tiene validación comunitaria; para producción se recomienda usar el checkpoint oficial `openai/whisper-large-v3-turbo`.
- Fecha de creación anómala (2026-10-31) en los metadatos del Hub, lo que sugiere posibles inconsistencias en el registro del repositorio.
- No apto para tareas de razonamiento, código o generación de texto general; su uso está acotado a ASR y traducción de voz.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JimWong8899/whisper-large-v3-turbo
- Modelo base oficial: https://huggingface.co/openai/whisper-large-v3
- Checkpoint oficial turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- Paper de Whisper: https://huggingface.co/papers/2212.04356
- Discusión sobre la variante turbo: https://github.com/openai/whisper/discussions/2363
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Documentación del pipeline ASR de Transformers: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.AutomaticSpeechRecognitionPipeline
