# Jinstudio/whisper-large-v3

## Resumen

Whisper large-v3 es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado originalmente por OpenAI. La versión publicada en Jinstudio/whisper-large-v3 es una instancia de ese modelo, con 1.543.490.560 parámetros y pesos en formato safetensors. Resuelve el problema de transcribir audio en múltiples idiomas de forma robusta y sin ajuste fino, gracias a un entrenamiento con más de 5 millones de horas de datos etiquetados y pseudo-etiquetados. Es relevante ahora porque ofrece una base sólida para aplicaciones de transcripción, subtitulado y traducción en 99 idiomas, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 1.543.490.560 (1,54 mil millones) |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 99 (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La ficha no detalla la arquitectura interna, pero el modelo se corresponde con Whisper large-v3 de OpenAI, que utiliza una arquitectura transformer encoder-decoder. Según la model card, mantiene la misma arquitectura que los modelos Whisper large y large-v2, con dos diferencias menores: el espectrograma de entrada usa 128 bins Mel en lugar de 80, y se añade un token de idioma para el cantonés.

El entrenamiento se realizó sobre 1 millón de horas de audio débilmente etiquetado y 4 millones de horas de audio pseudo-etiquetado recopilado con Whisper large-v2. El modelo se entrenó durante 2.0 épocas sobre esta mezcla de datos. No se mencionan técnicas de RLHF ni DPO en la información disponible.

## Capacidades

- Transcripción automática de voz (ASR) en 99 idiomas.
- Traducción de voz a texto en inglés mediante el parámetro `task="translate"`.
- Detección automática del idioma del audio.
- Generación de timestamps a nivel de frase (`return_timestamps=True`) y de palabra (`return_timestamps="word"`).
- Procesamiento de audios de longitud arbitraria a través del pipeline de Transformers, con segmentación interna.
- Estrategias de decodificación configurables: temperature fallback, condition on previous tokens, compression ratio threshold, logprob threshold y no speech threshold.
- Compatibilidad con Hugging Face Transformers, Datasets y Accelerate.
- Generalización zero-shot a múltiples datasets y dominios, según la model card.
- No incluye tool calling, visión ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de reuniones y entrevistas: el pipeline puede transcribir grabaciones largas con timestamps de frase, lo que facilita la generación de actas y la búsqueda en el contenido. Es adecuado por su robustez y por la detección automática del idioma.
- Subtitulado de vídeos: con `return_timestamps="word"` se pueden generar subtítulos sincronizados a nivel de palabra, útil para producción de contenido en múltiples idiomas.
- Análisis de llamadas de atención al cliente: el modelo transcribe conversaciones en 99 idiomas, lo que permite analizar interacciones sin necesidad de ajuste fino. La licencia Apache 2.0 facilita su uso comercial.
- Traducción de contenido de voz a inglés: usando `task="translate"`, el modelo convierte audio de cualquier idioma soportado a texto en inglés, útil para localización y distribución internacional.
- Asistentes de voz y dictado: las heurísticas de decodificación y el pipeline de Transformers permiten transcribir dictados en tiempo real, aunque no soporta tool calling.
- Archivado e indexación de audio histórico: se pueden transcribir archivos de audio antiguos para indexarlos y hacerlos buscables. La capacidad zero-shot reduce la necesidad de adaptación por dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma que large-v3 muestra una reducción de errores del 10-20% frente a Whisper large-v2 en una amplia variedad de idiomas, pero no se aportan tablas ni cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el repositorio pesa 24.7 GB, pero no se especifica la VRAM necesaria.
- Opciones de despliegue: Hugging Face Transformers con el pipeline `automatic-speech-recognition`, junto con `datasets` y `accelerate`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| Jinstudio/whisper-large-v3 | 1.543.490.560 | No disponible | Sin benchmarks publicados | Apache 2.0 |
| openai/whisper-large-v3 | 1.543.490.560 | No disponible | Sin benchmarks publicados | Apache 2.0 |
| openai/whisper-large-v2 | No disponible | No disponible | Reducción de errores del 10-20% en large-v3 (según model card) | Apache 2.0 |

## Limitaciones y advertencias

- No se documentan sesgos específicos; el entrenamiento con supervisión débil y pseudo-etiquetado puede introducir sesgos no evaluados.
- Riesgo de alucinación no cuantificado; no hay evaluaciones de robustez en la información disponible.
- No se especifica la longitud de contexto para la inferencia; la gestión de audio largo depende de la segmentación del pipeline.
- No ofrece tool calling, visión ni modo de razonamiento explícito; es exclusivamente un modelo de ASR y traducción de voz.
- La licencia Apache 2.0 permite uso comercial, pero exige mantener el aviso de copyright y la licencia en las redistribuciones.
- El rendimiento puede depender de la versión de Transformers y de la configuración de decodificación utilizada.

## Enlaces

- https://huggingface.co/Jinstudio/whisper-large-v3
- https://huggingface.co/openai/whisper-large-v3
- https://huggingface.co/papers/2212.04356
- https://huggingface.co/reach-vb/whisper-large-v3
