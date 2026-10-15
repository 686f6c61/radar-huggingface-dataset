# openai/whisper-large-v2

## Resumen

Whisper large-v2 es un modelo de reconocimiento automatico del habla (ASR) y traduccion de voz desarrollado por OpenAI. Fue presentado en el articulo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022) y publicado en el Hugging Face Hub el 5 de diciembre de 2022. Se trata de un modelo transformer de arquitectura encoder-decoder (sequence-to-sequence) con 1.543.304.960 parametros (aproximadamente 1550 M) entrenado sobre 680.000 horas de audio etiquetado mediante supervision debil a gran escala.

El modelo resuelve dos tareas fundamentales: transcripcion (convertir audio en texto en el mismo idioma) y traduccion de voz (transcribir audio en un idioma a texto en otro). Su principal valor diferencial es que generaliza a multiples dominios y conjuntos de datos sin necesidad de ajuste fino, lo que lo convierte en una referencia practica para pipelines de ASR multilingue. Soporta 99 idiomas segun los metadatos oficiales del repositorio.

Respecto al modelo Whisper large original, la variante large-v2 se entreno durante 2,5 veces mas epocas e incorpora regularizacion adicional, lo que se tradujo en una mejora de rendimiento. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, y es compatible con las librerias transformers, PyTorch, TensorFlow y JAX. Sigue siendo relevante como linea base robusta y como alternativa consolidada frente a versiones posteriores de la familia Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 1.543.304.960 (aprox. 1550 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos (caracteristica de la arquitectura Whisper; los pesos de entrada son espectrogramas log-Mel) |
| Tipos de cuantizacion | no especificados en la model card oficial; el repositorio distribuye pesos en fp32/fp16, y existen conversiones de terceros (GGUF, ONNX, CTranslate2) no documentadas en la tarjeta |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow, JAX |

## Arquitectura y entrenamiento

Whisper large-v2 es un transformer de tipo encoder-decoder. El encoder procesa representaciones de audio en forma de espectrogramas log-Mel (calculados por el `WhisperProcessor`) y el decoder genera la secuencia de texto correspondiente. El modelo se controla mediante "tokens de contexto" que se inyectan al inicio de la decodificacion y que definen el idioma y la tarea. La secuencia tipica es `<|startoftranscript|> <|en|> <|transcribe|> <|notimestamps|>`, donde el segundo token fija el idioma, el tercero selecciona entre transcripcion (`<|transcribe|>`) y traduccion (`<|translate|>`) y el ultimo desactiva la prediccion de marcas de tiempo. Estos tokens pueden forzarse (para controlar idioma y tarea) o dejarse sin forzar (el modelo los predice automaticamente).

El entrenamiento se realizo sobre 680.000 horas de audio etiquetado mediante supervision debil a gran escala, cubriendo tanto datos en ingles como multilingues. Los modelos multilingues se entrenan conjuntamente para reconocimiento del habla y traduccion de voz. En el caso concreto de large-v2, se entreno durante 2,5 veces mas epocas que el large original y se anadieron tecnicas de regularizacion, lo que mejoro su rendimiento. La model card no detalla la composicion exacta del dataset, el uso de RLHF/DPO ni innovaciones adicionales de decodificacion.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) multilingue en 99 idiomas.
- Traduccion de voz: transcribe audio en un idioma generando texto en otro.
- Deteccion automatica del idioma de entrada y de la tarea cuando los tokens de contexto no se fuerzan.
- Prediccion opcional de marcas de tiempo (timestamps) a nivel de segmento.
- Generalizacion a dominios y datasets diversos sin ajuste fino.
- Robustez frente a acentos, ruido de fondo y condiciones de grabacion variadas, segun lo reportado por el autor.
- Integracion con el ecosistema transformers mediante `WhisperProcessor` y `WhisperForConditionalGeneration`.
- No dispone de soporte de tool calling, function calling ni capacidades de agente segun la informacion disponible.
- No es un modelo multimodal de vision ni de audio generativo: su salida es exclusivamente texto.

## Casos de uso

- Transcripcion de reuniones y actas automaticas: el modelo convierte audio de reuniones en texto multilingue, y con los tokens de contexto adecuados puede fijar el idioma y anadir marcas de tiempo para segmentar intervenciones.
- Subtitulado de video y generacion de subtitulos: gracias a la prediccion de timestamps, se pueden generar subtitulos sincronizados para contenido audiovisual en cualquiera de los 99 idiomas soportados.
- Traduccion de voz a texto: util para transcribir entrevistas, podcasts o contenido en idiomas extranjeros generando la salida en el idioma deseado con el token `<|translate|>`.
- Atencion al cliente y analitica de llamadas: transcripcion de conversaciones telefonicas para su posterior analisis, busqueda o auditoria de calidad, aprovechando la robustez del modelo en condiciones de audio degradado.
- Accesibilidad y dictado: conversion de voz a texto para personas con discapacidad auditiva o para interfaces de dictado por voz en aplicaciones de escritorio y moviles.
- Documentacion clinica o legal: transcripcion de notas de voz y grabaciones de reuniones en entornos donde se requiere procesamiento local o control sobre los datos.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de un repositorio de audio para habilitar busqueda por texto completo sobre su contenido.
- Moderation y monitorizacion de contenido: transcripcion de audio para detectar contenido inapropiado o para cumplimiento normativo en plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras concretas de MMLU, WER ni otros conjuntos de evaluacion; unicamente indica que el modelo es candidato en la categoria `hf-asr-leaderboard` y que large-v2 mejora al large original tras 2,5 veces mas epocas de entrenamiento con regularizacion. Para resultados cuantitativos de referencia, debe consultarse el articulo original (arXiv:2212.04356).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,2 GB en fp32, 3,1 GB en fp16 y 1,6 GB en int8 (calculado a partir de los 1550 M de parametros; no incluye memoria para activaciones ni buffers de atencion, que pueden anadir un margen adicional).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM puede ejecutar el modelo en fp16; se ha desplegado habitualmente en NVIDIA A100, H100, V100, T4 y A10.
- GPU de consumo: cabe en tarjetas como RTX 3060 (12 GB), RTX 3080/3090, RTX 4060/4070/4080/4090, siempre que se use fp16 o cuantizacion de 8 bits.
- Opciones de despliegue: transformers (PyTorch/TF/JAX), endpoints gestionados de Hugging Face (los tags incluyen `deploy:sagemaker` y `deploy:azure`), y conversiones de terceros a GGUF (whisper.cpp), CTranslate2 (faster-whisper) y ONNX, aunque estas ultimas no estan documentadas en la model card.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| openai/whisper-large-v2 | 1550 M | 99 | apache-2.0 | 2,5x mas epocas que large; multilingue unicamente |
| openai/whisper-large | 1550 M | 99 | apache-2.0 | Version previa, sin la regularizacion ni las epocas adicionales de v2 |
| openai/whisper-medium | 769 M | 99 | apache-2.0 | Version intermedia; menor coste de inferencia, disponible tambien en variante solo ingles |
| openai/whisper-small | 244 M | 99 | apache-2.0 | Version ligera para entornos con recursos limitados |

No se dispone de datos cuantitativos de rendimiento comparado en la informacion proporcionada, por lo que la comparativa se limita a parametros, idiomas y licencia. La familia Whisper comparte arquitectura, licencia Apache 2.0 y cobertura multilingue en los checkpoint multilingues; existen ademas versiones posteriores de la familia (large-v3) no incluidas en la informacion de esta ficha.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo seq2seq, puede generar texto plausible que no corresponde al audio, especialmente en segmentos con silencio, ruido o habla ambigua.
- Sesgos conocidos: al entrenarse con datos de supervision debil a gran escala, puede heredar sesgos presentes en el corpus, con rendimiento desigual entre idiomas segun su representacion en los datos.
- Rendimiento variable por idioma: aunque se declaran 99 idiomas, la calidad no es uniforme y suele ser menor en idiomas con menos datos de entrenamiento.
- Limitaciones de contexto: el modelo procesa ventanas de audio de 30 segundos; para audios mas largos es necesario segmentar y gestionar la continuidad entre fragmentos.
- Idioma y task tokens: un uso incorrecto de los tokens de contexto puede forzar un idioma o tarea equivocados y degradar la salida.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datos subyacentes y las obligaciones de atribucion.
- Produccion: no esta documentado como modelo de proposito general ni dispone de tool calling; su integracion requiere un pipeline de audio (preprocesado log-Mel y postprocesado de tokens) a traves de `WhisperProcessor`.
- No dispone de informacion publicada sobre cuantizaciones oficiales ni sobre latencia, por lo que el dimensionamiento en produccion debe validarse empiricamente.

## Enlaces

- Hugging Face: https://huggingface.co/openai/whisper-large-v2
- Articulo: https://arxiv.org/abs/2212.04356 (Robust Speech Recognition via Large-Scale Weak Supervision)
- Repositorio original: https://github.com/openai/whisper
- Documentacion de transformers sobre Whisper: https://huggingface.co/docs/transformers/model_doc/whisper
- Busqueda de checkpoints de la familia: https://huggingface.co/models?search=openai/whisper
- Web de OpenAI: https://openai.com/
- Pagina de Wikipedia sobre OpenAI: https://en.wikipedia.org/wiki/OpenAI
