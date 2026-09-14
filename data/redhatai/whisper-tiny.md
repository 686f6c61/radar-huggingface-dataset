# RedHatAI/whisper-tiny

## Resumen

RedHatAI/whisper-tiny es una redistribución del checkpoint Whisper tiny de OpenAI, publicada en Hugging Face bajo el espacio de nombres RedHatAI. Whisper es un modelo de reconocimiento automático del habla (ASR) y traducción de voz presentado por Alec Radford et al. en el artículo "Robust Speech Recognition via Large-Scale Weak Supervision" (arXiv:2212.04356). Está pensado para transcribir audio a texto y para traducir audio a inglés sin necesidad de ajuste fino específico por dominio, gracias a un entrenamiento masivo con supervisión débil sobre 680.000 horas de audio etiquetado.

Arquitectura y tamaño: se trata de un transformer encoder-decoder secuencia a secuencia de aproximadamente 39 millones de parámetros según la tabla de configuraciones de la model card (el repositorio declara 37.760.640 parámetros en los pesos safetensors). La variante tiny es la más pequeña de la familia y la única junto a base, small y medium que existe tanto en versión solo-inglés como multilingüe; large y large-v2 son exclusivamente multilingües.

Relevancia: es el punto de entrada habitual para tareas de ASR en producción con recursos limitados, para prototipado rápido, para pipelines en CPU y para fine-tuning sobre dominios concretos, ya que su huella de memoria es de decenas de megabytes en lugar de gigabytes. Esta copia concreta no aporta pesos nuevos ni ajustes: es un espejo del checkpoint original, con 0 descargas y 0 likes en el momento de la consulta, y sus métricas declaradas están marcadas como no verificadas (`verified: false`) en el model-index.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (secuencia a secuencia) para ASR y traduccion de voz |
| Parametros totales | 37.760.640 (safetensors); la model card declara ~39 M para la configuracion tiny |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por pasada (arquitectura Whisper, basada en espectrogramas log-Mel de 1500 frames); longitud de texto de salida no especificada en la informacion disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | 99 idiomas declarados: en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow y JAX (segun los tags del repositorio) |
| Tamano del repositorio | 0,6 GB |
| Pipeline | automatic-speech-recognition |
| Fecha de publicacion del repositorio | 14 de septiembre de 2026 (creacion y ultima actualizacion) |

## Arquitectura y entrenamiento

Whisper es un transformer de tipo encoder-decoder entrenado sobre 680.000 horas de datos de habla etiquetados mediante supervisión débil a gran escala. El encoder consume espectrogramas log-Mel del audio (ventanas de 30 segundos, 80 canales Mel en las variantes hasta large) y el decoder genera la transcripción token a token. La tarea a realizar y el idioma de salida se controlan mediante tokens de contexto que se anteponen a la decodificación: `<|startoftranscript|>`, el token de idioma (por ejemplo `<|en|>`), el token de tarea (`<|transcribe|>` o `<|translate|>`) y, opcionalmente, `<|notimestamps|>` si no se desean marcas temporales. El modelo se distribuye junto a un `WhisperProcessor`, encargado del preprocesado de audio a espectrograma y de la conversión de tokens a texto.

Los modelos multilingües (como este tiny) se entrenaron conjuntamente para reconocimiento del habla en el mismo idioma del audio y para traducción de voz a otro idioma; los modelos solo-inglés se entrenaron únicamente para reconocimiento. La model card no detalla la composición exacta del dataset, el número de tokens de entrenamiento, ni si se aplicaron fases de RLHF o DPO; tampoco describe innovaciones adicionales de decodificación. Esta entrada de RedHatAI no incluye información sobre un proceso de ajuste propio: reproduce el contenido de la model card original de OpenAI, y la propia tarjeta advierte que parte del texto fue redactado por el equipo de Hugging Face y copiado de la tarjeta original.

## Capacidades

- Reconocimiento automático del habla (transcripción) en el idioma del audio, en 99 idiomas declarados.
- Traducción de voz a texto hacia otro idioma (capacidad de los checkpoints multilingües).
- Predicción opcional de marcas temporales a nivel de segmento, controlada mediante el token `<|notimestamps|>`.
- Generalización a múltiples dominios y datasets sin ajuste fino, según la model card.
- Ejecución con prompts de contexto que fijan idioma y tarea en el momento de la decodificación.
- Integración con el ecosistema Transformers mediante `WhisperProcessor` y `pipeline("automatic-speech-recognition")`.
- No dispone de tool calling, function calling, modo agente, capacidades de visión ni modo de razonamiento extendido; es un modelo estrictamente de audio a texto.
- No se documentan capacidades de diarización de hablantes, detección de emociones ni clasificación de audio no verbal.

## Casos de uso

- Transcripción de reuniones y notas de voz: con ventanas de 30 segundos por pasada y un consumo de memoria de decenas de megabytes, el modelo puede transcribir grabaciones largas troceadas, ejecutándose incluso en CPU, lo que permite desplegarlo en servidores sin GPU para volúmenes moderados.
- Subtitulado automático de vídeo: la predicción de marcas temporales permite alinear la transcripción con la línea de tiempo del material audiovisual, un flujo habitual en plataformas de contenido y en herramientas de accesibilidad.
- Prototipado y pruebas de pipelines ASR: al ser el checkpoint más pequeño de la familia, sirve para validar la cadena completa (preprocesado de audio, decodificación, postprocesado) antes de escalar a variantes mayores o a modelos ajustados.
- Fine-tuning sobre dominio específico: sus 37,7 millones de parámetros permiten reentrenar o adaptar el modelo con presupuestos de GPU reducidos para jerga técnica, acentos concretos o vocabulario de un sector (sanidad, legal, industrial).
- Transcripción multilingüe de contenido generado por usuarios: el modelo declara soporte para 99 idiomas, útil para moderación, indexación de búsqueda o generación de transcripciones en plataformas con audiencia internacional.
- Traducción de voz a texto en escenarios de documentación: usando el token `<|translate|>`, permite obtener texto en otro idioma a partir de audio, por ejemplo para resumir entrevistas en idiomas que el equipo no domina.
- Integración en dispositivos con recursos limitados: con pesos en el rango de decenas a centenas de megabytes según precisión, es candidato para ejecución local en equipos de escritorio o en el borde, siempre que se acepte una precisión menor que en los modelos medium o large.
- Enriquecimiento de bases de conocimiento y búsqueda: transcripción de archivos de audio de un repositorio documental para hacerlos indexables y consultables por texto.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card, marcados como no verificados (`verified: false`):

| Tarea | Dataset | Idioma | Metrica | Valor |
|---|---|---|---|---|
| Reconocimiento automatico del habla | LibriSpeech (clean), split test | en | Test WER | 7,54 |
| Reconocimiento automatico del habla | LibriSpeech (other), split test | en | Test WER | 17,15 |
| Reconocimiento automatico del habla | Common Voice 11.0, config hi, split test | hi | Test WER | 141 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (por ejemplo MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR, ni comparativas directas con otros checkpoints de la familia).

## Requisitos de hardware

- VRAM estimada para los pesos: en FP32, aproximadamente 151 MB (37,76 M de parametros); en FP16/BF16, unos 76 MB; en INT8, unos 38 MB. A esto hay que sumar el estado de la cache de atencion, el espectrograma log-Mel de entrada y la memoria del runtime (PyTorch, TensorFlow o JAX), por lo que el consumo real por proceso es mayor que el tamano de los pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente para una sola peticion, incluidas tarjetas de gama de entrada. Para procesamiento por lotes de audio de alta concurrencia, tienen sentido GPU como A100, H100, L4 o RTX 4090, pero el modelo es pequeno y quedara limitado por el preprocesado y la entrada/salida antes que por la computacion.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, y tambien en CPU. Es el checkpoint de la familia Whisper con menor huella.
- Opciones de despliegue: `pipeline("automatic-speech-recognition")` de Transformers, `WhisperProcessor` junto con los pesos safetensors, y las variantes de peso TensorFlow y JAX incluidas en el repositorio. Fuera de este repositorio existen conversiones habituales del checkpoint original de Whisper a otros runtimes (GGUF para whisper.cpp, CTranslate2 para faster-whisper, ONNX Runtime), aunque esta ficha no puede confirmar que las conversiones de RedHatAI/whisper-tiny esten publicadas.
- Latencia y throughput: no disponible en la informacion proporcionada. No se declaran mediciones de RTF ni de tokens por segundo.

## Comparativa con modelos similares

Comparativa con otros checkpoints de la familia Whisper, segun la tabla de configuraciones incluida en la model card. Los datos de parametros son los declarados por el autor; el rendimiento de los modelos alternativos no se detalla en la informacion disponible.

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RedHatAI/whisper-tiny (esta ficha) | 37,76 M (safetensors) / ~39 M segun model card | Multilingue (99 declarados) | apache-2.0 | safetensors, PyTorch, TF, JAX | Redistribucion del checkpoint tiny; WER 7,54 en LibriSpeech clean |
| openai/whisper-tiny.en | ~39 M | Solo ingles | apache-2.0 | safetensors, PyTorch, TF, JAX | Variante entrenada solo para reconocimiento en ingles |
| openai/whisper-base | ~74 M | Multilingue (y variante .en) | apache-2.0 | safetensors, PyTorch, TF, JAX | El doble de parametros; habitualmente con menor WER que tiny |
| openai/whisper-small | ~244 M | Multilingue (y variante .en) | apache-2.0 | safetensors, PyTorch, TF, JAX | Seis veces los parametros de tiny; mas preciso y mas costoso |
| openai/whisper-medium | ~769 M | Multilingue (y variante .en) | apache-2.0 | safetensors, PyTorch, TF, JAX | Salto grande en calidad, requiere mas VRAM |
| openai/whisper-large / large-v2 | ~1550 M | Solo multilingue | apache-2.0 | safetensors, PyTorch, TF, JAX | Solo disponible en version multilingue |

No se dispone de datos comparativos de rendimiento entre estos checkpoints en la informacion proporcionada; los valores de WER de los modelos alternativos no se han declarado en este material.

## Limitaciones y advertencias

- El model-index de esta tarjeta marca los resultados como no verificados (`verified: false`); deben tratarse como cifras declaradas por el autor, no auditadas de forma independiente.
- El WER declarado en Common Voice 11.0 para hindi es de 141, un valor muy alto que indica un rendimiento pobre en ese idioma concreto; el rendimiento por idioma es muy desigual y no se pueden extrapolar los resultados en ingles al resto de los 99 idiomas.
- La diferencia entre LibriSpeech clean (7,54) y other (17,15) muestra una sensibilidad notable a la calidad acustica y a la variabilidad del habla.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible en segmentos con silencio, ruido o audio no inteligible, especialmente en los checkpoints mas pequenos. En produccion conviene aplicar umbrales de confianza, deteccion de no-habla y revision de segmentos de baja probabilidad.
- Sesgos: el entrenamiento con supervisión débil a gran escala puede arrastrar sesgos de los datasets de origen (variedad de acentos, generos, edades y registros desigualmente representados). La informacion proporcionada no incluye una evaluacion de sesgos.
- Ventana de audio de 30 segundos por pasada: el audio mas largo debe trocearse, lo que introduce complejidad en la gestion de fronteras entre fragmentos y en la alineacion temporal.
- Esta entrada concreta es un espejo del checkpoint de OpenAI con 0 descargas y 0 likes en el momento de la consulta; no es un modelo ajustado ni una version mejorada, por lo que no aporta ninguna mejora verificable sobre el original.
- Licencia apache-2.0 en este repositorio, lo que en principio permite uso comercial; conviene verificar los terminos del repositorio original de OpenAI y las condiciones de los datos de entrenamiento antes de un despliegue en produccion.
- No se documentan cuantizaciones oficiales en el repositorio; cualquier uso de INT8, INT4 o GGUF procedera de conversiones de terceros y cambia el comportamiento del modelo respecto a los pesos publicados.
- No soporta tool calling, agentes, vision ni audio multimodal; su uso esta limitado a tareas de audio a texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/whisper-tiny
- Checkpoint original de OpenAI (multilingue): https://huggingface.co/openai/whisper-tiny
- Checkpoint original de OpenAI (solo ingles): https://huggingface.co/openai/whisper-tiny.en
- Listado de checkpoints Whisper en Hugging Face: https://huggingface.co/models?search=openai/whisper
- Paper: Robust Speech Recognition via Large-Scale Weak Supervision: https://arxiv.org/abs/2212.04356
- Repositorio de codigo original: https://github.com/openai/whisper
- Documentacion del procesador en Transformers: https://huggingface.co/docs/transformers/model_doc/whisper#transformers.WhisperProcessor
- Leaderboard de ASR de Hugging Face: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos corresponden a documentacion de Google Drive y no guardan relacion con el modelo.
