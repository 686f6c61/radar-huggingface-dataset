# openai/whisper-small

## Resumen

Whisper-small es un modelo de reconocimiento automático de voz (ASR) y traducción de voz desarrollado por OpenAI. Se trata de uno de los cinco tamaños de la familia Whisper, un sistema basado en Transformer encoder-decoder entrenado con supervisión débil sobre 680 000 horas de audio etiquetado. El objetivo es transcribir audio en el mismo idioma o traducirlo a inglés, sin necesidad de ajuste fino para la mayoría de dominios.

Este modelo tiene 241,7 millones de parámetros y está disponible en el Hugging Face Hub bajo licencia Apache 2.0. Su relevancia radica en que ofrece un equilibrio entre precisión y coste computacional dentro de la familia Whisper, siendo una opción habitual para tareas de transcripción y subtitulación cuando no se necesita la capacidad de los modelos más grandes (medium o large).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 241.734.912 (241,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingüe (96 idiomas): en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también PyTorch, TensorFlow y JAX) |

## Arquitectura y entrenamiento

Whisper-small es un modelo transformer encoder-decoder, también conocido como sequence-to-sequence. El codificador procesa los espectrogramas log-Mel del audio y el decodificador genera el texto, ya sea transcripción en el mismo idioma o traducción a otro idioma. Los "context tokens" iniciales indican al modelo la tarea a realizar (transcribir o traducir) y el idioma de salida.

El entrenamiento se realizó sobre 680 000 horas de audio etiquetado mediante supervisión débil a gran escala. Los datos abarcan múltiples dominios y, en el caso de los modelos multilingües como este, la tarea combina reconocimiento de voz y traducción de voz. No se ha aplicado RLHF ni DPO en este tipo de modelo.

## Capacidades

- Reconocimiento automático de voz en 96 idiomas, con transcripción en el mismo idioma que el audio.
- Traducción de voz a texto en inglés a partir de audio en cualquier idioma soportado.
- Generalización sin ajuste fino a múltiples dominios gracias a la diversidad del conjunto de entrenamiento.
- Compatibilidad con la librería Transformers (PyTorch, TensorFlow y JAX) mediante `WhisperProcessor`.
- No soporta tool calling, generación de código ni razonamiento simbólico, ya que es un modelo de ASR, no un modelo de lenguaje de propósito general.
- No incluye capacidades de visión ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de reuniones y entrevistas: permite convertir audio de reuniones a texto con alta precisión en español, generando actas automatizables.
- Subtitulación de vídeos: se puede integrar en pipelines de procesamiento de vídeo para generar subtítulos en el idioma original o traducirlos al inglés.
- Accesibilidad para personas con discapacidad auditiva: despliegue en aplicaciones de accesibilidad para ofrecer subtítulos en tiempo real o diferido en múltiples idiomas.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones telefónicas para extraer métricas de calidad, detectar problemas recurrentes o alimentar sistemas de análisis de sentimiento.
- Investigación cualitativa: transcripción de entrevistas en profundidad o grupos focales en distintos idiomas, facilitando el análisis de contenido con herramientas de procesamiento de texto.
- Archivado de contenido audiovisual: convertidor de audio histórico o podcasts a texto, permitiendo búsquedas textuales en grandes volúmenes de audio.
- Traducción de contenido audiovisual: generación de subtítulos en inglés a partir de audio original en otros idiomas, útil para la localización de vídeos.

## Benchmarks y rendimiento

Según los resultados oficiales declarados en la model card, el modelo Whisper-small presenta los siguientes valores de Word Error Rate (WER):

| Dataset | Config / Idioma | Métrica | Valor |
|---|---|---|---|
| LibriSpeech (clean) | test, en | WER | 3,43 |
| LibriSpeech (other) | test, en | WER | 7,63 |
| Common Voice 11.0 | hi | WER | 87,3 |
| Common Voice 13.0 | dv | WER | 125,70 |

Los valores de WER en hindi y divehi son notablemente altos, lo que indica un rendimiento deficiente en idiomas con menos representación en los datos de entrenamiento.

## Requisitos de hardware

- No se han publicado datos oficiales de requisitos de hardware en la información proporcionada.
- Por tamaño de parámetros (241,7 M), los pesos en FP16 ocupan aproximadamente 0,5 GB, lo que apunta a que el modelo puede ejecutarse en GPUs de consumo, aunque el overhead real de activaciones y buffers no está especificado.
- Opciones de despliegue disponibles: Transformers (PyTorch, TensorFlow, JAX), Hugging Face Inference Endpoints, SageMaker, Azure, y la implementación original openai/whisper.
- No hay cifras oficiales de latencia o throughput. Se recomienda validar el rendimiento en el hardware objetivo antes de usarlo en producción.

## Comparativa con modelos similares

| Parametro | Whisper-base | Whisper-small | Whisper-medium |
|---|---|---|---|
| Parametros | 74 M | 241,7 M | 769 M |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Disponibilidad | HuggingFace | HuggingFace | HuggingFace |
| WER en LibriSpeech clean | No disponible | 3,43 | No disponible |
| WER en LibriSpeech other | No disponible | 7,63 | No disponible |

Whisper-small se sitúa en un punto intermedio entre base y medium: ofrece más capacidad que base para dominios complejos, pero consume menos recursos que medium. La ausencia de datos de WER para base y medium en la información disponible impide una comparativa cuantitativa completa.

## Limitaciones y advertencias

- El rendimiento varía significativamente según el idioma: en lenguas con menos datos de entrenamiento, como hindi (WER 87,3) o divehi (WER 125,7), la precisión es muy baja.
- Al ser un modelo de ASR y no un LLM, no puede realizar tareas de razonamiento, generación de texto libre ni seguir instrucciones complejas.
- Puede presentar alucinaciones, generando texto que no existe en el audio, especialmente en segmentos de silencio o ruido.
- Los sesgos del conjunto de entrenamiento pueden afectar la transcripción de acentos, dialectos o jergas no representadas.
- La licencia Apache 2.0 permite el uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de la normativa de protección de datos al transcribir audio de terceros.
- Para audios largos, se requiere segmentación previa o lógica de ventana deslizante, ya que el procesamiento directo de la entrada tiene límites prácticos no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openai/whisper-small
- Paper original: https://arxiv.org/abs/2212.04356
- Repositorio oficial: https://github.com/openai/whisper
- Sitio web de OpenAI: https://openai.com/
