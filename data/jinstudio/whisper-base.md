# Jinstudio/whisper-base

## Resumen

Jinstudio/whisper-base es una redistribución del modelo Whisper base de OpenAI, subida al Hugging Face Hub por el usuario Jinstudio. Se trata de un modelo de reconocimiento automático de voz (ASR) y traducción de voz, propuesto en el artículo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022). El modelo se entrenó sobre 680.000 horas de audio etiquetado mediante supervisión débil a gran escala, lo que le permite generalizar a múltiples dominios sin necesidad de ajuste fino.

La arquitectura es un Transformer encoder-decoder (sequence-to-sequence). Según los pesos en safetensors, el modelo tiene 72.593.920 parámetros, lo que corresponde a la variante base de la familia Whisper. La model card indica que los checkpoints de Whisper se presentan en cinco tamaños (tiny, base, small, medium y large), y que los modelos multilingües se entrenan tanto para reconocimiento de voz como para traducción de voz. Este modelo es relevante para tareas de transcripción y traducción de audio en entornos con recursos limitados, dado su tamaño reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 72.593.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 99 idiomas: en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también pytorch, tf, jax según tags) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper original: un codificador Transformer que procesa espectrogramas log-Mel del audio y un decodificador Transformer autorregresivo que genera texto. Para preprocesar el audio y postprocesar los tokens se utiliza un `WhisperProcessor`. El decodificador se condiciona mediante tokens de contexto que indican el inicio de la transcripción, el idioma, la tarea (transcribir o traducir) y si se deben predecir marcas temporales. Por ejemplo, la secuencia `<|startoftranscript|> <|en|> <|transcribe|> <|notimestamps|>` indica transcripción en inglés sin timestamps.

El entrenamiento se realizó sobre 680.000 horas de datos etiquetados, con supervisión débil a gran escala. En los modelos multilingües, las tareas de entrenamiento incluyen tanto reconocimiento de voz (transcripción en el mismo idioma que el audio) como traducción de voz (transcripción en un idioma distinto). La model card no menciona técnicas de alineación adicionales como RLHF ni DPO. El código y los pesos originales provienen del repositorio oficial de OpenAI y del checkpoint `openai/whisper-base` en Hugging Face.

## Capacidades

- Reconocimiento automático de voz (ASR) en 99 idiomas.
- Traducción de voz: capacidad de transcribir audio en un idioma diferente al idioma original del audio.
- Control de tarea mediante tokens de contexto: el modelo puede alternar entre transcripción y traducción usando los tokens `<|transcribe|>` y `<|translate|>`.
- Predicción de timestamps: el modelo genera marcas temporales por defecto, que pueden desactivarse añadiendo el token `<|notimestamps|>`.
- Identificación de idioma: el token de idioma en la secuencia de contexto permite condicionar la decodificación al idioma objetivo.
- No soporta tool calling, razonamiento multi-step, ni entrada de visión. Es un modelo exclusivamente de audio.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio en formato log-Mel y devuelve texto con marcas temporales, lo que permite segmentar intervenciones y generar actas automáticas en varios idiomas.
- Subtitulado de vídeos: se puede integrar en pipelines de postproducción para generar subtítulos en el idioma original del audio o traducidos a otro idioma, gracias al soporte de traducción de voz.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones en entornos ruidosos, aprovechando la robustez del modelo al haber sido entrenado en un corpus diverso.
- Análisis de llamadas de atención al cliente: transcripción de llamadas telefónicas para su posterior análisis de sentimiento, extracción de entidades o clasificación de incidencias.
- Documentación clínica o legal: dictado de notas médicas o transcripción de declaraciones, con soporte multilingüe para entornos internacionales.
- Aplicaciones edge y dispositivos embebidos: al tener solo 72,6 millones de parámetros, el modelo puede ejecutarse en GPU de consumo o CPU con recursos limitados, lo que lo hace adecuado para asistentes de voz locales.

## Benchmarks y rendimiento

Se presentan los resultados declarados en la model card, con el indicador `verified: false`:

| Tarea | Dataset | Idioma | WER |
|---|---|---|---|
| Reconocimiento de voz | LibriSpeech (clean) | en | 5.01 |
| Reconocimiento de voz | LibriSpeech (other) | en | 12.85 |
| Reconocimiento de voz | Common Voice 11.0 | hi | 131.00 |

El valor de WER de 131 en Common Voice 11.0 para hindi es notablemente alto, lo que sugiere un rendimiento deficiente en ese idioma. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible.
- Latencia y throughput estimados: no disponible.

La información proporcionada no incluye especificaciones de hardware concretas. Al tratarse de un modelo de 72,6 millones de parámetros, su carga de memoria es reducida en comparación con modelos mayores, pero no se aportan datos verificados.

## Comparativa con modelos similares

Se compara la variante Jinstudio con los checkpoints originales de la familia Whisper citados en la model card. Los datos de contexto y rendimiento no están disponibles en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jinstudio/whisper-base | 72.593.920 | no disponible | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | no disponible | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | no disponible | Apache 2.0 | Hugging Face |

No se dispone de resultados de benchmarks comparativos en la información proporcionada. La comparación se limita al número de parámetros y a la disponibilidad de los pesos.

## Limitaciones y advertencias

- El rendimiento en hindi es muy bajo, con un WER de 131 en Common Voice 11.0, según los resultados declarados y no verificados.
- El modelo puede sufrir alucinaciones en audio con ruido, acentos poco representados o idiomas minoritarios.
- Los resultados de benchmarks están marcados como `verified: false`, lo que significa que no han sido confirmados por procesos independientes.
- No se aporta documentación específica del re-subidor Jinstudio; la model card es una copia de la de OpenAI.
- La licencia Apache 2.0 permite uso comercial, pero requiere mantener el aviso de licencia y atribución correspondiente.
- No soporta tool calling, agentes ni entrada multimodal; su uso se limita a tareas de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jinstudio/whisper-base
- Paper original: https://arxiv.org/abs/2212.04356
- Repositorio original: https://github.com/openai/whisper
- Modelo original de referencia: https://huggingface.co/openai/whisper-base
