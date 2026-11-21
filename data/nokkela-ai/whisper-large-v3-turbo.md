# nokkela-ai/whisper-large-v3-turbo

## Resumen

Whisper large-v3-turbo es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado originalmente por OpenAI y distribuido en este repositorio por el usuario nokkela-ai. Se trata de una versión podada y reentrenada de Whisper large-v3 en la que el número de capas del decodificador se reduce de 32 a 4, lo que rebaja el total de parámetros a aproximadamente 809 millones y acelera notablemente la inferencia a costa de una degradación menor de la calidad. La arquitectura subyacente es un transformer encoder-decoder de tipo seq2seq, con un encoder que procesa log-Mel spectrograms y un decodificador autorregresivo que genera tokens de texto.

El modelo resuelve dos tareas clásicas de Whisper: transcripción de voz a texto en el mismo idioma del audio y traducción de voz a texto en inglés. Su relevancia actual radica en que mantiene la cobertura multilingüe de large-v3 (más de 90 idiomas declarados en la model card) con un coste computacional mucho menor, lo que lo hace apto para despliegues de producción con requisitos de latencia ajustados y para hardware de gama media. El contexto de audio es de 30 segundos por ventana, con soporte para audio de longitud arbitraria mediante segmentación en el pipeline de Transformers.

Este repositorio concreto es un fine-tuning sobre `openai/whisper-large-v3` publicado bajo licencia MIT, con pesos en formato safetensors y compatibilidad con la librería `transformers`. No incluye información adicional sobre el dataset de ajuste ni sobre hiperparámetros de entrenamiento más allá de lo indicado en la model card heredada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) para ASR, variante podada de Whisper large-v3 |
| Parámetros totales | 808.878.080 (≈809 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana; audio de longitud arbitraria mediante segmentación |
| Tipos de cuantización | no disponible en la información proporcionada (pesos publicados en safetensors; admite cuantización estándar de transformers/bitsandbytes no documentada por el autor) |
| Idiomas soportados | más de 90 idiomas, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper original: un encoder transformer que consume espectrogramas log-Mel de 80 canales (ventanas de 30 s) y un decodificador autorregresivo que emite tokens de texto con marcas especiales de idioma, tarea y timestamps. La innovación de la variante turbo es la reducción del decodificador de 32 a 4 capas, manteniendo el encoder intacto; según la model card, esto produce un modelo "mucho más rápido" con "una degradación menor de la calidad". El modelo base, Whisper large-v3, fue entrenado por OpenAI con más de 5 millones de horas de audio etiquetado y demuestra una fuerte capacidad de generalización zero-shot a dominios y datasets no vistos.

Este repositorio concreto es un fine-tuning de `openai/whisper-large-v3` realizado por nokkela-ai. La información disponible no detalla el corpus de ajuste, el número de tokens de audio, ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente en ASR). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal; las heurísticas de decodificación disponibles son las estándar de Whisper: temperature fallback, condition on previous tokens, umbrales de compresión zlib, logprob y no-speech.

## Capacidades

- Transcripción de voz a texto en el mismo idioma del audio, con detección automática del idioma de origen.
- Traducción de voz a texto en inglés mediante el parámetro `task="translate"`.
- Predicción de timestamps a nivel de frase (`return_timestamps=True`) y a nivel de palabra (`return_timestamps="word"`).
- Procesamiento de audio de longitud arbitraria mediante segmentación interna del pipeline de Transformers.
- Procesamiento por lotes de múltiples archivos de audio en paralelo (`batch_size`).
- Cobertura multilingüe amplia (más de 90 idiomas declarados), incluyendo lenguas de bajos recursos.
- Heurísticas de decodificación robusta: temperature fallback, umbrales de compresión, logprob y detección de ausencia de habla.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR/traducción de voz.

## Casos de uso

- Subtitulado automático de vídeo y audio: el modelo genera timestamps a nivel de frase y de palabra, lo que permite producir ficheros SRT/VTT directamente desde el pipeline con `return_timestamps="word"`, adecuado para plataformas de contenido y accesibilidad.
- Transcripción de reuniones y llamadas: con detección automática de idioma y soporte de audio de longitud arbitraria, puede procesar grabaciones multi-participante y generar actas o resúmenes posteriores aguas abajo.
- Traducción de voz a inglés en entornos internacionales: la tarea `translate` permite convertir audio en cualquiera de los idiomas soportados a texto en inglés, útil en soporte técnico global o análisis de contenido extranjero.
- Atención al cliente con voz: integrado en un pipeline ASR + LLM, transcribe las llamadas en tiempo casi real; su reducido tamaño (≈809 M de parámetros) y su decodificador de 4 capas favorecen la latencia baja en GPUs de gama media.
- Indexación y búsqueda de archivos de audio: transcripción masiva por lotes de un repositorio de podcasts o grabaciones para construir índices de texto buscables, aprovechando el procesamiento batch del pipeline.
- Accesibilidad en tiempo real: generación de subtítulos en directo para eventos o clases, donde la velocidad de inferencia del decodificador podado es determinante frente a large-v3 completo.
- Análisis de medios y moderación de contenido: transcripción multilingüe de material audiovisual para clasificación posterior, con cobertura de más de 90 idiomas que evita desplegar un modelo distinto por región.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica cualitativamente que el modelo es "mucho más rápido" que large-v3 con "una degradación menor de la calidad", sin cifras de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, el modelo de ≈809 M de parámetros ocupa aproximadamente 1,6 GB de pesos, por lo que con activaciones y buffers de audio se sitúa en torno a 2-3 GB de VRAM; en fp32, alrededor de 3,2 GB solo de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; A100, H100, L40S o RTX 4090 para despliegues de alto throughput con lotes grandes.
- Cabe en GPUs de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090 y en GPUs con 4-6 GB como RTX 3050 o GTX 1660 en fp16; también puede ejecutarse en CPU con fp32, a mayor latencia.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")` (soporte oficial documentado); el repositorio declara `endpoints_compatible`. Para serving de alto rendimiento se puede exportar a otros runtimes, aunque el autor no documenta recetas específicas para vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; la model card solo afirma cualitativamente una mayor velocidad frente a large-v3.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| nokkela-ai/whisper-large-v3-turbo (este) | ≈809 M | 30 s por ventana | >90 | MIT | Fine-tuning de large-v3 con decodificador de 4 capas |
| openai/whisper-large-v3 | ≈1,55 mil M | 30 s por ventana | >90 | MIT (según repositorio original) | Decodificador de 32 capas; mayor calidad, más lento |
| openai/whisper-large-v3-turbo | ≈809 M | 30 s por ventana | >90 | MIT | Modelo original de OpenAI sobre el que se basa este fine-tuning |
| distil-whisper/distil-large-v3 | no disponible en la información proporcionada | 30 s por ventana | principalmente inglés | no disponible en la información proporcionada | Destilación orientada a inglés y velocidad |

La comparativa se limita a la familia Whisper; no se dispone de datos de benchmarks que permitan comparar calidad (WER) entre estas variantes.

## Limitaciones y advertencias

- La reducción del decodificador a 4 capas implica una degradación de calidad frente a large-v3 completo; la magnitud no está cuantificada en la información disponible.
- Riesgo de alucinación en audio con ruido, silencios largos o música: Whisper puede generar texto inventado; se recomienda activar `no_speech_threshold`, `compression_ratio_threshold` y temperature fallback.
- La ventana de contexto es de 30 segundos por segmento; audios más largos requieren segmentación, lo que puede introducir errores en las fronteras.
- Aunque declara más de 90 idiomas, el rendimiento varía notablemente entre ellos; los idiomas de bajos recursos suelen tener tasas de error mucho mayores.
- El fine-tuning concreto de nokkela-ai no documenta su dataset de ajuste, por lo que se desconoce si introduce sesgos o sobreajuste a un dominio específico.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero conviene verificar las condiciones del modelo base original de OpenAI.
- No es un modelo conversacional ni de razonamiento: no soporta tool calling ni agentes; su uso en producción debe combinarse con otros componentes para tareas complejas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nokkela-ai/whisper-large-v3-turbo
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Paper de Whisper (Radford et al., 2022): https://huggingface.co/papers/2212.04356
- Discusión sobre la variante turbo en el repositorio de OpenAI: https://github.com/openai/whisper/discussions/2363
- Muestras de audio de ejemplo (LibriSpeech): https://cdn-media.huggingface.co/speech_samples/sample1.flac y https://cdn-media.huggingface.co/speech_samples/sample2.flac
