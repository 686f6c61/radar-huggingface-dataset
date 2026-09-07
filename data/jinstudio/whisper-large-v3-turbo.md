# Jinstudio/whisper-large-v3-turbo

## Resumen

Jinstudio/whisper-large-v3-turbo es una variante del modelo Whisper large-v3-turbo de OpenAI, publicada en Hugging Face por el usuario Jinstudio. Se trata de un modelo de reconocimiento automático de voz (ASR) y traducción de voz basado en la arquitectura transformer encoder-decoder de Whisper, desarrollada por OpenAI y presentada en el paper «Robust Speech Recognition via Large-Scale Weak Supervision».

La particularidad de esta versión turbo es que reduce las capas del decodificador de 32 a 4 respecto al Whisper large-v3 original, manteniendo el encoder intacto. Esta poda permite una inferencia mucho más rápida a costa de una ligera degradación de la calidad. El modelo cuenta con 808.878.080 parámetros y está diseñado para procesar audio de 30 segundos por ventana, aunque puede manejar audios de mayor duración mediante técnicas de chunking. Es un modelo multilingüe, con soporte para 99 idiomas, y se distribuye bajo licencia MIT.

Su relevancia actual radica en la creciente demanda de sistemas de transcripción de voz en tiempo real y a bajo coste, donde la velocidad de inferencia es un factor crítico. Al mantener la calidad general de Whisper large-v3 con una fracción de las capas del decodificador, este modelo se convierte en una opción atractiva para aplicaciones de producción que requieren ASR multilingüe con latencias reducidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) para ASR |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por ventana; hasta 448 tokens de salida |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 99 idiomas, incluyendo en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo Jinstudio/whisper-large-v3-turbo sigue la arquitectura de Whisper, un transformer encoder-decoder diseñado para procesar espectrogramas de log-Mel de audio de 30 segundos. El encoder procesa la entrada de audio y el decoder genera texto autoregresivamente. En esta variante turbo, el número de capas del decodificador se ha reducido de 32 a 4, mientras que el encoder se mantiene completo. Esta poda es el resultado de un proceso de fine-tuning sobre un modelo large-v3 previamente podado, tal como se describe en la discusión de GitHub del proyecto Whisper original.

El entrenamiento original de Whisper utilizó más de 5 millones de horas de audio etiquetado, lo que le otorga una notable capacidad de generalización en contextos zero-shot. Para la variante turbo, se realizó un fine-tuning adicional de dos épocas sobre el mismo conjunto de datos multilingües de transcripción utilizado para entrenar large-v3, pero excluyendo los datos de traducción. Por ello, el modelo no está optimizado para tareas de traducción de voz, aunque conserva la capacidad de realizarlas con menor calidad. No se han publicado detalles sobre técnicas de RLHF o DPO en la información disponible.

## Capacidades

- Reconocimiento automático de voz (ASR) en 99 idiomas, con detección automática del idioma de origen.
- Traducción de voz a texto en inglés, aunque con calidad inferior a la transcripción directa.
- Generación de marcas de tiempo a nivel de frase y de palabra, tanto en transcripción como en traducción.
- Procesamiento de audio de longitud arbitraria mediante pipelines con chunking, gracias a la ventana de 30 segundos.
- Decodificación flexible con estrategias como temperature fallback, condition on previous tokens y umbrales de compresión y logprob.
- Soporte para inferencia por lotes, permitiendo transcribir múltiples archivos de audio en paralelo.
- No incluye soporte de tool calling, capacidades de agentes, visión ni generación de texto libre más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y llamadas de trabajo: el modelo puede transcribir conversaciones multilingües con marcas de tiempo, facilitando la generación de actas y el análisis posterior.
- Subtitulado automático de vídeos: gracias a su soporte de 99 idiomas y a la predicción de timestamps, es adecuado para generar subtítulos en plataformas de vídeo, tanto en directo como en diferido.
- Transcripción de entrevistas en investigación cualitativa: la velocidad del modelo turbo permite procesar largas grabaciones de entrevistas y obtener texto con tiempos para su codificación y análisis.
- Accesibilidad para personas con discapacidad auditiva: los subtítulos generados en tiempo real pueden integrarse en sistemas de accesibilidad, con una latencia reducida.
- Análisis de llamadas de atención al cliente: la transcripción automática de audio de llamadas permite extraer información, detectar problemas recurrentes y entrenar modelos de análisis de sentimiento.
- Asistentes de voz con transcripción local: al ser un modelo relativamente pequeño y rápido, puede desplegarse en servidores o incluso en dispositivos con GPU para tareas de ASR en tiempo real sin depender de servicios en la nube.
- Documentación de contenido audiovisual en entornos periodísticos: los periodistas pueden transcribir entrevistas, ruedas de prensa o vídeos en varios idiomas, acelerando el proceso de documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card y la documentación no incluyen métricas comparativas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de reconocimiento de voz y no de un modelo de lenguaje general. Tampoco se proporcionan resultados de evaluaciones específicas de ASR, como WER o CER, para esta variante de Jinstudio.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16 ocupan aproximadamente 1.6 GB (808.878.080 parámetros × 2 bytes). En INT8, el tamaño se reduciría a unos 0.8 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP16. Modelos como RTX 3060, RTX 4060, Tesla T4 o A10 son opciones viables.
- Cabe en GPUs de consumo: sí, es un modelo ligero que puede ejecutarse en tarjetas gráficas de gama de entrada.
- Opciones de despliegue: puede usarse con Hugging Face Transformers a través de la clase `pipeline`, así como con Whisper.cpp para CPU y GPU. También es compatible con el framework original de OpenAI.
- Latencia y throughput: no disponible en la información proporcionada. La reducción de capas del decodificador implica una mejora sustancial de velocidad frente a Whisper large-v3, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Capas del decodificador | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jinstudio/whisper-large-v3-turbo | 808.878.080 | 4 | MIT | Hugging Face |
| openai/whisper-large-v3-turbo | 808.878.080 | 4 | MIT | Hugging Face |
| openai/whisper-large-v3 | no disponible | 32 | no disponible | Hugging Face |

El modelo Jinstudio/whisper-large-v3-turbo es funcionalmente equivalente a openai/whisper-large-v3-turbo, ya que ambos comparten la misma arquitectura podada y el mismo número de parámetros. Frente a openai/whisper-large-v3, la diferencia clave es la reducción de las capas del decodificador de 32 a 4, lo que acelera la inferencia con una pérdida de calidad menor. No se dispone de datos comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- El modelo es una subida de Jinstudio, no el original de OpenAI. Aunque la model card coincide con la de openai/whisper-large-v3-turbo, no se garantiza que los pesos sean idénticos ni que hayan sido verificados de forma independiente.
- La poda de capas del decodificador conlleva una degradación leve de la calidad respecto a Whisper large-v3, especialmente en tareas de traducción, ya que el fine-tuning excluyó los datos de traducción.
- Whisper es conocido por generar alucinaciones en silencio o en audio con ruido de fondo, lo que puede producir transcripciones falsas si no se configuran adecuadamente los umbrales de no-speech.
- El modelo está limitado a ventanas de audio de 30 segundos; los audios más largos deben dividirse en fragmentos, lo que puede afectar a la coherencia de la transcripción en algunos contextos.
- Puede presentar sesgos lingüísticos y demográficos heredados de los datos de entrenamiento, con un rendimiento potencialmente inferior en idiomas o acentos poco representados.
- Aunque la licencia MIT permite el uso comercial, se recomienda revisar la procedencia del modelo y realizar validaciones propias antes de desplegarlo en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Jinstudio/whisper-large-v3-turbo
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Paper de Whisper: https://huggingface.co/papers/2212.04356
- Discusión de GitHub sobre la variante turbo: https://github.com/openai/whisper/discussions/2363
