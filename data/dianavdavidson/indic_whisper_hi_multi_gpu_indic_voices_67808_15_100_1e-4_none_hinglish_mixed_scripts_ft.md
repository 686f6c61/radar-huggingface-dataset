# dianavdavidson/indic_whisper_hi_multi_gpu_indic_voices_67808_15_100_1e-4_None_hinglish_mixed_scripts_FT

## Resumen

Indic Whisper Hi Multi GPU Indic Voices es un modelo de reconocimiento automatico del habla (ASR) derivado de Whisper, especializado en hindi y en habla con mezcla de idiomas hindi-ingles (hinglish). Lo desarrolla el usuario de Hugging Face dianavdavidson como un fine-tuning del modelo parthiv11/indic_whisper_hi_multi_gpu, que a su vez parte de la familia Whisper de OpenAI. El modelo resuelve el problema de transcribir audio en un dominio linguistico concreto: el hindi hablado con inserciones de palabras en ingles y cambios de escritura (mixed scripts), un fenomeno muy comun en la India urbana y en contenido audiovisual.

Tecnicamente es un transformer encoder-decoder de tipo Whisper con 763.857.920 parametros (unos 764 millones), lo que corresponde a la variante "small" de Whisper (12 capas encoder, 12 capas decoder, 12 cabezas de atencion, dimension 768). Se ha entrenado durante 7 epocas registradas con un learning rate de 1e-4, batch efectivo de 32 y optimizador AdamW fused, alcanzando un WER global de 26,56 por ciento en el conjunto de evaluacion.

Es relevante porque los modelos Whisper originales rinden de forma deficiente en code-switching hindi-ingles, y este checkpoint aborda explicitamente ese caso, aunque con un WER alto que lo hace adecuado para experimentacion y pipelines de transcripcion con revision humana, no para produccion critica sin post-procesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, variante small) |
| Parametros totales | 763.857.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper small procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi e ingles (hinglish, mixed scripts); lista oficial no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (no adaptadores) de parthiv11/indic_whisper_hi_multi_gpu, que a su vez es un Whisper small adaptado a indic. La arquitectura es la de Whisper small: encoder de 12 capas y decoder de 12 capas con 12 cabezas de atencion y dimension oculta 768, con atencion densa estandar y sin innovaciones de atencion lineal ni decodificacion especulativa documentadas. El entrada de audio se procesa como espectrograma log-Mel de 80 canales en ventanas de 30 segundos.

El entrenamiento se realizo con los siguientes hiperparametros: learning rate 1e-4, train batch size 16, gradient accumulation 2 (batch efectivo 32), seed 42, optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-8, scheduler constant_with_warmup con 500 pasos de calentamiento y 100 epocas configuradas. El autor solo documenta 7 epocas con resultados de validacion (el entrenamiento parece haber parado o no haberse registrado mas alla). No se especifica la composicion del dataset de entrenamiento (la model card indica "unknown dataset"); por el nombre del checkpoint se infiere un dataset de indic voices con 67.808 muestras, 15 epocas objetivo y mezcla hinglish. No se documenta uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo ASR.

## Capacidades

- Transcripcion de voz a texto (ASR) en hindi e ingles, con soporte declarado para habla code-switched hinglish.
- Manejo de audio con cambios de escritura (mixed scripts), es decir, texto que combina devanagari y alfabeto latino.
- Inferencia compatible con la pipeline `automatic-speech-recognition` de transformers.
- Integracion con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documenta soporte de traduccion, diarizacion, timestamps por palabra, tool calling ni capacidades de agente.
- No se documenta modo thinking, vision ni audio multimodal mas alla del ASR.

## Casos de uso

- Transcripcion de reuniones y llamadas en equipos indios: el modelo esta ajustado a habla hinglish y puede transcribir conversaciones donde se alternan hindi e ingles, un escenario frecuente en empresas tecnologicas con presencia en India. Requiere revision humana por el WER de ~26 por ciento.
- Subtitulado de contenido audiovisual (YouTube, series, podcasts): util para creadores que publican en hinglish y necesitan subtitulos en texto mixto devanagari-latino, con post-edicion para corregir errores.
- Analitica de contact centers: transcripcion masiva de grabaciones de atencion al cliente en hindi para alimentar busquedas y clasificacion posterior, usando el modelo como primer paso de un pipeline ASR + NLP.
- Investigacion linguistica sobre code-switching: permite generar transcripciones de corpus hinglish para estudiar patrones de mezcla de idiomas y cambios de escritura.
- Prototipado de asistentes de voz para el mercado indio: base para experimentar con reconocimiento de comandos en hindi antes de invertir en modelos propietarios.
- Fine-tuning posterior en dominios especificos: al ser un checkpoint Whisper small con licencia MIT, sirve como punto de partida para adaptar a jerga medica, legal o tecnica en hindi.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluacion (datos de la model card, no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Validation loss (mejor, epoca 4) | 0.3483 |
| Global WER (mejor, epoca 4) | 26.5558 % |

Evolucion del entrenamiento registrada:

| Epoca | Training loss | Validation loss | Global WER |
|---|---|---|---|
| 1 | 0.6876 | 0.3638 | 32.6051 |
| 2 | 0.6183 | 0.3384 | 28.4106 |
| 3 | 0.3480 | 0.3404 | 27.0583 |
| 4 | 0.2650 | 0.3483 | 26.5558 |
| 5 | 0.2121 | 0.3773 | 26.6169 |
| 6 | 0.1724 | 0.3873 | 27.0446 |
| 7 | 0.1469 | 0.4034 | 27.1914 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El model-index oficial esta vacio (results: []).

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 3 GB solo para pesos (764 M parametros x 4 bytes), mas activaciones y buffers de audio; en la practica unos 4-6 GB.
- VRAM en fp16/bf16: aproximadamente 1,5-2 GB para pesos, con un total estimado de 2-4 GB.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y similares; tambien en GPUs con 4-6 GB si se usa fp16.
- GPU recomendadas para produccion: A10G, L4, A100 o H100 para lotes grandes y alto throughput; una T4 de 16 GB es suficiente para inferencia en fp16.
- Opciones de despliegue: transformers con pipeline `automatic-speech-recognition`, Hugging Face Inference Endpoints, vLLM (soporte ASR segun version), TGI (soporte Whisper segun version), y conversion a CTranslate2/faster-whisper para CPU (requiere conversion manual, no se documenta en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Indic Whisper Hi FT) | 764 M | ventanas de 30 s | hindi, ingles (hinglish) | MIT | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s | 99 idiomas | MIT | Hugging Face, ampliamente soportado |
| parthiv11/indic_whisper_hi_multi_gpu (base) | no disponible | ventanas de 30 s | indic | no disponible | Hugging Face |
| ai4bharat/indicwav2vec-hindi | no disponible | no disponible | hindi | no disponible | Hugging Face |

Nota: la comparacion de rendimiento con estos modelos no esta disponible en la informacion proporcionada; solo se dispone del WER declarado por el autor (26,56 por ciento) para este checkpoint.

## Limitaciones y advertencias

- WER global de 26,56 por ciento: alto para produccion sin revision humana; se recomienda post-edicion o un modelo mayor como segunda pasada.
- Sobreajuste evidente: la validation loss y el WER empeoran a partir de la epoca 4, por lo que el checkpoint final puede no ser el mejor; conviene evaluar checkpoints intermedios.
- Dataset de entrenamiento no documentado ("unknown dataset"): imposible reproducir el entrenamiento o conocer la distribucion de dominios y acentos.
- Sesgos desconocidos: no se documenta la composicion demografica, regional o de genero del audio de entrenamiento, lo que puede producir peor rendimiento en acentos no representados.
- Riesgo de alucinacion en ASR: Whisper es propenso a generar texto plausible en segmentos de silencio o ruido; sin VAD previo puede inventar contenido.
- Limitaciones de idioma: aunque el nombre sugiere hinglish, no se documenta cobertura de otras lenguas indic; el rendimiento fuera de hindi/ingles es incierto.
- Licencia MIT: permite uso comercial, pero al derivar de Whisper conviene revisar las condiciones de los pesos base y del modelo parthiv11.
- Modelo de 764 M parametros: adecuado para prototipos, pero con menor precision que variantes medium o large de Whisper en tareas generales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dianavdavidson/indic_whisper_hi_multi_gpu_indic_voices_67808_15_100_1e-4_None_hinglish_mixed_scripts_FT
- Modelo base: https://huggingface.co/parthiv11/indic_whisper_hi_multi_gpu
- Repositorio Whisper de OpenAI: https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
