# Jinstudio/whisper-small

## Resumen

Jinstudio/whisper-small es un modelo de reconocimiento automático del habla (ASR) y traducción de voz basado en el checkpoint original `openai/whisper-small`. Este repositorio, publicado por el usuario Jinstudio, contiene los pesos del modelo Whisper small en formato Safetensors, con 241.734.912 parámetros reales y disponibles bajo licencia Apache 2.0. El modelo resuelve el problema de transcribir audio a texto en el mismo idioma o de traducir audio a inglés, sin necesidad de ajuste fino, gracias a su entrenamiento con 680.000 horas de datos etiquetados mediante supervisión débil a gran escala.

La arquitectura es un Transformer encoder-decoder, también denominado secuencia a secuencia, original de OpenAI y publicado en el paper "Robust Speech Recognition via Large-Scale Weak Supervision". Aunque se trata de una copia del checkpoint oficial, la publicación en el Hub es útil por su formato ligero y su soporte multiframework (PyTorch, TensorFlow, JAX). El modelo soporta un amplio conjunto de idiomas (más de 70) y es adecuado para tareas de transcripción y traducción de voz en entornos de producción, así como para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 241.734.912 (según safetensors) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por pasada (ventana fija) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingüe: en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (también disponibles en PyTorch, TensorFlow y JAX según los tags del repositorio) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper original de OpenAI: un encoder Transformer que procesa espectrogramas log-Mel de 80 canales y un decoder Transformer autoregresivo que genera tokens de texto. El encoder y el decoder se entrenan conjuntamente con un objetivo de secuencia a secuencia, y el decodificador recibe tokens de contexto que especifican el idioma, la tarea (transcripción o traducción) y, opcionalmente, el modo de decodificación.

El entrenamiento se realizó sobre 680.000 horas de audio etiquetado, recopilado de fuentes diversas y anotado mediante supervisión débil a gran escala. Esto incluye tanto tareas de reconocimiento del habla (transcripción en el mismo idioma) como de traducción de voz (transcripción a inglés). No se conocen detalles de fine-tuning adicional o técnicas como RLHF/DPO en esta publicación concreta; el repo reproduce el checkpoint preentrenado sin modificaciones. Una característica destacable es la capacidad de identificar el idioma hablado a partir del audio, además de transcribir o traducir.

## Capacidades

- Reconocimiento automático del habla en múltiples idiomas, transcribiendo audio en el mismo idioma que se habla.
- Traducción de voz a inglés, generando transcripciones en inglés a partir de audio en cualquier otro idioma soportado.
- Identificación automática del idioma del audio mediante tokens de contexto del decoder.
- Manejo de audio con ruido de fondo, acentos variados y dominios diversos, gracias al entrenamiento con datos heterogéneos y supervisión débil.
- Funciona como modelo multitarea (transcripción, traducción, identificación de idioma) en una sola pasada.
- Capacidad para procesar fragmentos de audio de hasta 30 segundos por pasada; audio más largo requiere segmentación externa.
- No dispone de tool calling, soporte de agentes ni capacidades de visión, al ser un modelo exclusivamente de audio.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede transcribir conversaciones en tiempo real o en diferido. Su ventana de 30 segundos permite segmentar audio largo separando por turnos, y su soporte multilingüe es útil en equipos internacionales.
- Subtitulado automatico de vídeos: se puede integrar en pipelines de procesado de vídeo para generar subtitulos en el idioma original o traducidos. La inferencia en 244M parámetros permite ejecutarla en GPUs de consumo o en CPU con latencia aceptable.
- Atención al cliente por voz: transcripción de llamadas y análisis posterior para QA o cumplimiento normativo. Al no requerir ajuste fino, el modelo generaliza bien a voces y dominios distintos, aunque con la advertencia de posibles alucinaciones en silencios.
- Traducción de contenido de audio a inglés: util para equipos que necesitan analizar audio en idiomas minoritarios y consolidar la informacion en inglés. El modelo puede traducir directamente sin pasar por transcripción intermedia.
- Asistentes de voz y sistemas de dictado: el modelo sirve como componente de ASR para aplicaciones de dictado en tareas administrativas o médicas. Su licencia Apache 2.0 permite uso comercial sin restricciones, siempre que se respeten los avisos de marca.
- Investigación en ASR y robustez: el modelo es un punto de referencia para estudiar la generalizacion en distintos datasets y dominios, como se refleja en los resultados de LibriSpeech y Common Voice. Los pesos en Safetensors facilitan la comparación y el análisis experimentista.

## Benchmarks y rendimiento

| Dataset | Idioma | Metrica | Valor |
|---|---|---|---|
| LibriSpeech (clean) | en | Test WER | 3,43 |
| LibriSpeech (other) | en | Test WER | 7,63 |
| Common Voice 11.0 (config: hi) | hi | Test WER | 87,3 |
| Common Voice 13.0 (config: dv) | dv | Wer | 125,70 |

Estos resultados han sido declarados por el autor del modelo y no están verificados de forma independiente. Cabe señalar que los valores de WER superiores al 100% en Common Voice Dhivehi indican una alta tasa de errores, lo que refleja la dificultad del modelo en idiomas con menor representación en el dataset de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB para los pesos en fp16, aunque en la practica se recomiendan al menos 2 GB por el procesamiento de espectrogramas y la logistica de decodificación.
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM para inferencia con batch pequeño (por ejemplo, RTX 3050, RTX 4000 serie o superiores). No es necesario un A100 o H100 para este tamaño de modelo.
- Ejecución en CPU: posible, con una latencia de un par de segundos por fragmento de 30 segundos, dependiendo del hardware.
- Compatible con consumer GPU: sí, incluidas RTX 3060, RTX 4060, o tarjetas de la serie GTX 16 con suficiente VRAM.
- Opciones de despliegue: Transformers con pipeline `automatic-speech-recognition`, biblioteca `whisper.cpp` para CPU/GPU ligera, `whisper` de OpenAI, y servidores como `faster-whisper` que permiten inferencia eficiente en producción.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la implementación elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (audio) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jinstudio/whisper-small | 241.7M | 30 s | Apache 2.0 | HuggingFace |
| openai/whisper-small | 244M | 30 s | Apache 2.0 | HuggingFace |
| openai/whisper-base | 74M | 30 s | Apache 2.0 | HuggingFace |
| openai/whisper-medium | 769M | 30 s | Apache 2.0 | HuggingFace |

Jinstudio/whisper-small es funcionalmente idéntico al checkpoint oficial `openai/whisper-small`, con la diferencia de que el autor ha publicado los pesos en safetensors y reporta un número de parámetros ligeramente distinto. Comparado con whisper-base, ofrece mejor precisión (menor WER en LibriSpeech), mientras que whisper-medium ofrece mejor rendimiento a costa de mayor coste computacional. No se disponen de benchmarks adicionales para estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: modelos Whisper presentan sesgos hacia acentos estandarizados y dialectos de países con abundante representación en los datos. La precisión puede degradarse significativamente en acentos no anglófonos, jerga técnica o habla infantil.
- Riesgo de alucinación: en silencios, ruido de fondo o audio sin habla, los modelos Whisper pueden generar transcripciones ficticias. Es recomendable filtrar los resultados con heurísticas de confianza o detección de actividad de voz.
- Limitaciones de contexto: la ventana de 30 segundos por pasada obliga a segmentar el audio largo. Sin una gestión adecuada, los cortes pueden provocar pérdida de contexto o transcripciones cortadas.
- Idiomas con pobre rendimiento: según los benchmarks proporcionados, el modelo obtiene resultados muy pobres en idiomas como hindi (WER 87,3) y dhivehi (WER 125,7). No se debe asumir que el rendimiento multilingüe es uniforme.
- Restricciones de licencia: aunque la licencia Apache 2.0 permite uso comercial, no se incluyen avisos de marca específicos. Los usuarios deben verificar que el nombre "Whisper" no se usa de forma que implique respaldo de OpenAI.
- Caveat para producción: el modelo no ofrece mecanismos nativos de filtrado de contenido o de moderación. El contenido transcrito puede ser ofensivo o sensible, y el usuario es responsable de implementar controles externos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jinstudio/whisper-small
- Modelo original: https://huggingface.co/openai/whisper-small
- Paper: https://arxiv.org/abs/2212.04356
- Repositorio original: https://github.com/openai/whisper
- Documentación del processor: https://huggingface.co/docs/transformers/model_doc/whisper#transformers.WhisperProcessor
