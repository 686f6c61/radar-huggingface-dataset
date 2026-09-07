# Jinstudio/whisper-medium

## Resumen

Jinstudio/whisper-medium es un modelo de reconocimiento automático de voz (ASR) y traducción de voz basado en la arquitectura Whisper de OpenAI. Se trata de una copia del checkpoint openai/whisper-medium subida al Hub por el usuario Jinstudio. El modelo es un Transformer encoder-decoder (sequence-to-sequence) con 763.857.920 parámetros según los pesos en safetensors, lo que lo sitúa en la categoría "medium" de la familia Whisper. Fue entrenado por OpenAI con 680.000 horas de audio etiquetado mediante supervisión débil, lo que le permite generalizar a múltiples dominios y lenguajes sin necesidad de ajuste fino.

El modelo es multilingüe y está pensado para transcribir audio en más de 90 idiomas, así como para traducir voz a otro idioma. Es relevante para desarrolladores e investigadores que necesitan un sistema de ASR robusto, de código abierto y con licencia Apache 2.0, que pueda desplegarse en producción o usarse como base para tareas de procesamiento de audio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 763.857.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 90 idiomas (incluye en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también PyTorch, TensorFlow y JAX según tags) |

## Arquitectura y entrenamiento

El modelo es una copia del checkpoint openai/whisper-medium, que sigue la arquitectura Whisper original propuesta por OpenAI. Se trata de un Transformer encoder-decoder, también denominado sequence-to-sequence, que procesa audio convertido a espectrogramas log-Mel. El encoder atiende al espectrograma de entrada y el decoder genera el texto de salida token a token. El modelo fue entrenado sobre 680.000 horas de audio etiquetado con supervisión débil, un corpus masivo que incluye múltiples idiomas y tareas de reconocimiento y traducción de voz.

No se han proporcionado detalles adicionales sobre el proceso de entrenamiento en la información disponible. No hay indicios de que se hayan aplicado técnicas como RLHF o DPO, ya que el modelo es puramente de audio y no de lenguaje general. La model card indica que el modelo puede realizar tanto transcripción en el mismo idioma del audio como traducción a un idioma diferente, dependiendo de los tokens de contexto que se le pasen al decoder.

## Capacidades

- Transcripción automática de voz (ASR) en más de 90 idiomas, incluidos español, inglés, chino, alemán, francés, ruso, japonés, etc.
- Traducción de voz: puede transcribir audio a un idioma distinto del original, por ejemplo, traduciendo audio en español a texto en inglés.
- Predicción de marcas de tiempo (timestamps) en la transcripción, activable o desactivable mediante los tokens de contexto adecuados.
- Compatibilidad con la biblioteca Transformers de Hugging Face mediante el uso de WhisperProcessor.
- No soporta tool calling, función de agente, visión ni generación de texto general; es exclusivamente un modelo de audio.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio a texto en múltiples idiomas, lo que facilita la generación de actas y la búsqueda de contenido en archivos de audio. Su robustez ante distintos acentos y ruidos lo hace adecuado para entornos reales.
- Subtitulación automática de vídeos: gracias a la predicción de marcas de tiempo, puede generar subtítulos sincronizados para vídeos en varios idiomas, útil en plataformas de streaming o en la producción de contenido accesible.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real permite ofrecer subtítulos en directo en eventos, aulas o aplicaciones de comunicación, mejorando la inclusión.
- Análisis de llamadas de atención al cliente: transcribir llamadas para extraer texto y aplicar análisis de sentimiento, detección de intenciones o control de calidad. El modelo soporta idiomas como español e inglés, lo que cubre muchos mercados.
- Documentación médica o legal: dictado de notas clínicas o testimonios judiciales, donde la transcripción precisa y multilingüe reduce la carga de trabajo manual. La licencia Apache 2.0 permite su integración en sistemas internos.
- Preprocesado de audio para entrenar modelos de lenguaje: el modelo puede usarse para convertir grandes volúmenes de audio en texto, generando datasets de entrenamiento para modelos de lenguaje o sistemas de búsqueda.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Reconocimiento automático de voz | LibriSpeech (clean), split test, idioma en | Test WER | 2.9 |
| Reconocimiento automático de voz | LibriSpeech (other), split test, idioma en | Test WER | 5.9 |
| Reconocimiento automático de voz | Common Voice 11.0, config hi, split test, idioma hi | Test WER | 53.87 |

## Requisitos de hardware

No se han proporcionado requisitos de hardware específicos en la información disponible. El repositorio tiene un tamaño de 12.2 GB, lo que sugiere que incluye pesos en múltiples formatos (safetensors, PyTorch, TensorFlow, JAX). Para estimaciones de VRAM, GPU recomendadas, latencia o throughput, se indica "no disponible".

## Comparativa con modelos similares

El modelo es una copia del checkpoint openai/whisper-medium. En la tabla siguiente se compara con otros tamaños de la familia Whisper, según los datos de la model card:

| Modelo | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|
| openai/whisper-tiny | 39 M | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74 M | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | Apache 2.0 | Hugging Face |
| Jinstudio/whisper-medium | 763.857.920 | Apache 2.0 | Hugging Face |
| openai/whisper-medium | 769 M | Apache 2.0 | Hugging Face |
| openai/whisper-large | 1550 M | Apache 2.0 | Hugging Face |

No se han publicado resultados de benchmarks comparativos entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Al ser una copia de openai/whisper-medium, no hay garantía de que los pesos sean idénticos al original. El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Los resultados de benchmarks están declarados por el autor del modelo y no están verificados.
- Whisper puede alucinar transcripciones en audio ininteligible, silencios o con ruido intenso, generando texto que no corresponde al audio.
- Puede presentar sesgos en acentos, dialectos y habla no estándar, especialmente en idiomas con menos representación en el corpus de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero requiere incluir la atribución correspondiente y un aviso de cambios si se modifican los pesos.
- El modelo no soporta tool calling ni capacidades de agente; está limitado a tareas de audio.

## Enlaces

- https://huggingface.co/Jinstudio/whisper-medium
- https://huggingface.co/openai/whisper-medium
- https://github.com/lodjim/whisper-medium
- https://arxiv.org/abs/2212.04356
