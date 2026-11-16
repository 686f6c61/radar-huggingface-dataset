# Menn5/whisper-large-v3

## Resumen

Whisper large-v3 es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado originalmente por OpenAI, publicado en el artículo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022). El repositorio `Menn5/whisper-large-v3` es una réplica de los pesos oficiales de `openai/whisper-large-v3` alojada por un tercero, con licencia Apache 2.0. El modelo emplea una arquitectura encoder-decoder transformer de tipo seq2seq, con 1.543.490.560 parámetros (aproximadamente 1,54 mil millones) y pesos en formato safetensors, PyTorch y JAX.

La relevancia de large-v3 frente a versiones anteriores (large y large-v2) radica en dos cambios de arquitectura: el espectrograma de entrada utiliza 128 bins Mel en lugar de 80, y se añade un token de idioma específico para cantonés. Según la model card, el modelo se entrenó con 1 millón de horas de audio débilmente etiquetado y 4 millones de horas de audio pseudo-etiquetado generado con large-v2, durante 2,0 épocas sobre esa mezcla. El resultado es una reducción de errores del 10 % al 20 % frente a large-v2 en una amplia variedad de idiomas.

El modelo está pensado para transcripción y traducción zero-shot, con soporte para más de 90 idiomas (el campo `language` del repositorio lista 99 códigos), detección automática de idioma, marcas de tiempo a nivel de frase y de palabra, y despliegue mediante la pipeline `automatic-speech-recognition` de Hugging Face Transformers. Es un modelo de referencia en la categoría ASR open source y una base habitual para destilaciones y fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (Whisper) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (Whisper); no disponible un contexto textual expresado en tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (los pesos se sirven en safetensors; existen conversiones comunitarias a GGUF/otros formatos, pero no se detallan en la model card) |
| Idiomas soportados | 99 codigos listados en el campo `language` (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tambien disponible en PyTorch y JAX segun los tags) |

## Arquitectura y entrenamiento

Whisper large-v3 mantiene la misma arquitectura que large y large-v2: un transformer encoder-decoder seq2seq que procesa espectrogramas log-Mel como entrada y genera tokens de texto de forma autorregresiva. La diferencia respecto a large-v2 es que la entrada utiliza 128 bins Mel en lugar de 80, y se incorpora un token de idioma nuevo para cantonés. El modelo tiene 1.543.490.560 parámetros según los pesos en safetensors del repositorio.

El entrenamiento se realizó sobre 1 millón de horas de audio débilmente etiquetado más 4 millones de horas de audio pseudo-etiquetado generado con Whisper large-v2, durante 2,0 épocas sobre esa mezcla. La model card no detalla si hubo RLHF o DPO (Whisper es un modelo supervisado de ASR, no un modelo de instrucciones). La innovación principal de la familia Whisper es el enfoque de supervisión débil a gran escala, que le permite generalizar zero-shot a dominios y datasets no vistos. La decodificación admite estrategias como temperature fallback, condition on previous tokens, umbral de ratio de compresión zlib, umbral de log-probabilidad y umbral de no-habla, además de marcas de tiempo a nivel de frase y de palabra.

## Capacidades

- Transcripción automática de voz a texto en más de 90 idiomas, con detección automática del idioma de origen.
- Traducción de voz a texto en inglés (tarea `translate`), independientemente del idioma de entrada.
- Marcas de tiempo a nivel de frase (`return_timestamps=True`) y a nivel de palabra (`return_timestamps="word"`).
- Decodificación con heurísticas configurables: `temperature` con fallback, `compression_ratio_threshold`, `logprob_threshold`, `no_speech_threshold` y `condition_on_prev_tokens`.
- Procesamiento por lotes de múltiples audios en paralelo (`batch_size`).
- Robustez zero-shot ante dominios y datasets no vistos, según la model card.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puro de ASR/traducción de voz, no un LLM de instrucciones.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa segmentos de 30 segundos y puede transcribir audios de longitud arbitraria mediante la pipeline de Transformers, devolviendo marcas de tiempo por frase para alinear la transcripción con el audio.
- Subtitulado automático de vídeo: con `return_timestamps=True` o `"word"` se obtienen segmentos temporizados que se pueden exportar directamente a formatos de subtítulos (SRT/VTT) para plataformas de vídeo.
- Traducción de contenido audiovisual a inglés: la tarea `translate` permite generar subtítulos en inglés a partir de audio en cualquiera de los idiomas soportados, útil para distribución internacional.
- Atención al cliente y análisis de llamadas: transcripción por lotes de grabaciones telefónicas en varios idiomas para alimentar sistemas de análisis de sentimiento o búsqueda sobre el texto resultante.
- Generación de actas y notas en entornos sanitarios o legales: la detección de no-habla (`no_speech_threshold`) y el filtrado por log-probabilidad ayudan a descartar silencios y segmentos poco fiables antes de la revisión humana.
- Investigación lingüística y creación de corpus: cobertura de 99 códigos de idioma que permite transcribir material multilingüe y construir datasets etiquetados a partir de audio débilmente etiquetado.
- Fine-tuning y destilación: al ser un checkpoint de referencia con licencia Apache 2.0, sirve como base para destilar modelos más pequeños (por ejemplo, variantes distil-whisper) o para adaptar el modelo a dominios específicos con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card unicamente indica una reduccion del 10 % al 20 % de errores frente a Whisper large-v2 en una amplia variedad de idiomas, sin cifras concretas por dataset (WER en LibriSpeech, Common Voice, FLEURS, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para los pesos (1,54 mil millones de parametros × 2 bytes), mas overhead de activaciones y cache; en la practica se recomienda al menos 6-8 GB para lotes pequenos y audios de 30 segundos.
- En fp32: aproximadamente 6,2 GB solo para pesos.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX A6000 para inferencia de un solo flujo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores) usando fp16.
- Opciones de despliegue: Hugging Face Transformers (pipeline `automatic-speech-recognition`), con soporte de `accelerate` para carga mas rapida; el ecosistema admite tambien otros runners (faster-whisper, whisper.cpp, vLLM con soporte de audio) aunque la model card solo documenta Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Menn5/whisper-large-v3 (este) | 1.543.490.560 | 30 s por segmento | 99 codigos | apache-2.0 | Replica de openai/whisper-large-v3; 128 bins Mel |
| openai/whisper-large-v2 | no disponible en esta busqueda | 30 s por segmento | ~99 codigos | apache-2.0 | 80 bins Mel; large-v3 reduce errores un 10-20 % frente a este |
| openai/whisper-large | no disponible en esta busqueda | 30 s por segmento | ~99 codigos | apache-2.0 | Version original de la familia large, anterior a v2 |
| distil-whisper (variantes) | no disponible en esta busqueda | 30 s por segmento | subconjunto de idiomas | no disponible en esta busqueda | Destilaciones mas rapidas y ligeras derivadas de Whisper |

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo generativo de ASR, puede producir texto plausible en segmentos con silencio, ruido o audio ininteligible; los umbrales `no_speech_threshold`, `logprob_threshold` y `compression_ratio_threshold` mitigan pero no eliminan el problema.
- Sesgos: el entrenamiento con datos debilmente etiquetados de internet puede infrarrepresentar variedades dialectales, acentos minoritarios y lenguas de bajos recursos; el rendimiento no es homogeneo entre los 99 idiomas listados.
- Limitacion de contexto: la ventana nativa es de 30 segundos por segmento; audios mas largos requieren segmentacion o el uso de la pipeline con chunking, lo que puede degradar la coherencia en fronteras de segmento.
- Licencia Apache 2.0: permite uso comercial, pero el repositorio es una replica de terceros (`Menn5`) de los pesos de OpenAI; conviene verificar la integridad de los pesos y preferir el repositorio oficial `openai/whisper-large-v3` para produccion.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente de esta copia concreta.
- No es un modelo de instrucciones: no soporta tool calling ni razonamiento; no debe emplearse para tareas de chat o agentes.
- La model card no documenta cuantizaciones oficiales ni resultados de benchmarks detallados; cualquier cifra de WER debe obtenerse de evaluaciones propias o del repositorio oficial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Menn5/whisper-large-v3
- Repositorio oficial de referencia: https://huggingface.co/openai/whisper-large-v3
- Articulo: Robust Speech Recognition via Large-Scale Weak Supervision: https://huggingface.co/papers/2212.04356
- Repositorio oficial de OpenAI Whisper (codigo): https://github.com/openai/whisper
- Documentacion de la pipeline ASR de Transformers: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.AutomaticSpeechRecognitionPipeline
