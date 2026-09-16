# algorithco/whisper-small

## Resumen

Whisper small es un modelo de reconocimiento automatico del habla (ASR) y traduccion de voz, publicado originalmente por OpenAI y redistribuido en el Hub por el usuario `algorithco` bajo el identificador `algorithco/whisper-small`. Se trata de una arquitectura Transformer encoder-decoder (sequence-to-sequence) con 241.734.912 parametros, entrenada sobre 680.000 horas de audio etiquetado mediante supervision debil a gran escala. El repositorio no aporta pesos nuevos ni ajustes propios: es una copia del checkpoint `openai/whisper-small` con la model card estandar, y acumula 0 descargas y 0 "likes" en el momento de la consulta.

El problema que resuelve es la transcripcion robusta sin necesidad de ajuste fino: el modelo generaliza a dominios y datasets para los que no fue entrenado explicitamente, y cubre 99 idiomas declarados en la model card, ademas de la tarea de traduccion de voz a texto en ingles. Frente a los checkpoints tiny (39 M) y base (74 M), esta variante de 244 M ofrece un compromiso intermedio entre calidad y coste computacional, y frente a medium (769 M) y large-v2 (1550 M) es la opcion mas ligera que mantiene un WER competitivo en ingles.

Es relevante ahora porque sigue siendo un punto de partida habitual para pipelines de ASR en produccion y para pseudo-etiquetado de datos en idiomas con pocos recursos, y porque su tamano permite ejecucion en CPU y en GPUs de consumo. Conviene senalar que los resultados de benchmarks declarados en la model card aparecen con `verified: false`, es decir, no han sido validados por un tercero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la ficha; Whisper procesa audio en ventanas de 30 segundos y utiliza una secuencia de tokens de contexto en el decodificador |
| Tipos de cuantizacion | No disponibles en la informacion proporcionada |
| Idiomas soportados | 99 idiomas declarados: en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow y JAX (segun los tags del repositorio) |
| Tamano del repositorio | 3,9 GB (incluye varios formatos de pesos) |
| Pipeline | automatic-speech-recognition |
| Fecha de creacion en el Hub | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Whisper es un Transformer encoder-decoder tambien denominado modelo sequence-to-sequence. El encoder consume representaciones log-Mel del audio y el decodificador genera texto de forma autorregresiva. La tarea se controla mediante tokens de contexto que se anteponen al decodificador: `<|startoftranscript|>`, despues el token de idioma (por ejemplo `<|en|>`) y despues el token de tarea, que puede ser `<|transcribe|>` para reconocimiento del habla o `<|translate|>` para traduccion de voz. Para reconocimiento, el modelo predice la transcripcion en el mismo idioma que el audio; para traduccion, predice la transcripcion en un idioma distinto al del audio.

El entrenamiento se realizo sobre 680.000 horas de datos de habla etiquetados mediante supervision debil a gran escala, segun la descripcion de la model card, que remite al articulo "Robust Speech Recognition via Large-Scale Weak Supervision" de Alec Radford et al. Los checkpoints de Whisper se publican en cinco configuraciones (tiny, base, small, medium, large y large-v2); las cuatro mas pequenas existen en variantes solo-ingles y multilingues, mientras que los checkpoints grandes son unicamente multilingues. Esta variante "small" corresponde al checkpoint multilingue de 244 M de parametros. La informacion disponible no detalla la composicion exacta del dataset, el numero de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla multilingue en los 99 idiomas declarados, prediciendo la transcripcion en el mismo idioma del audio.
- Traduccion de voz a texto hacia ingles mediante el token de tarea `<|translate|>`.
- Seleccion explicita de tarea e idioma mediante tokens de contexto, lo que permite forzar el idioma de salida o dejar que el modelo lo detecte.
- Generalizacion a dominios no vistos sin ajuste fino, gracias al entrenamiento con supervision debil sobre 680.000 horas de audio.
- Requiere un `WhisperProcessor` para el preprocesado (conversion a espectrogramas log-Mel) y el postprocesado (conversion de tokens a texto).
- No soporta tool calling ni function calling: es un modelo de ASR, no un LLM conversacional.
- No soporta agentes, razonamiento multi-paso ni modos de "pensamiento" extendido.
- No dispone de capacidades de vision ni de procesamiento de audio mas alla de la transcripcion y traduccion de habla.

## Casos de uso

- Transcripcion de reuniones y generacion de actas: el modelo convierte el audio de una reunion en texto plano o con marcas de tiempo, y su ventana de 30 segundos por segmento permite procesar grabaciones largas troceandolas sin perder coherencia entre fragmentos.
- Subtitulado automatico de video: integrado en un pipeline de postproduccion, genera subtitulos con timestamps a nivel de segmento para plataformas de video, y su soporte multilingue evita mantener un modelo distinto por idioma.
- Traduccion de contenido audiovisual a ingles: usando el token `<|translate|>`, permite obtener una transcripcion en ingles de material original en otro idioma, util para catalogos internacionales sin doblaje previo.
- Dictado y accesibilidad: con 241 M de parametros se puede ejecutar localmente en un portatil o en un equipo de sobremesa, lo que habilita funciones de dictado por voz en aplicaciones de escritorio sin enviar audio a servicios externos.
- Analisis de llamadas de atencion al cliente: transcribir conversaciones telefonicas para extraer motivos de contacto, palabras clave y metricas de calidad, procesando los audios por lotes en GPU.
- Indexacion y busqueda de podcasts y archivos de audio: transcribir un catalogo completo y volcar el texto a un motor de busqueda o a un indice vectorial para permitir busqueda semantica sobre el contenido hablado.
- Pseudo-etiquetado de datasets ASR en idiomas con pocos recursos: usar las transcripciones del modelo como etiquetas iniciales para audio sin anotar, que despues se corrigen manualmente o se emplean para entrenar modelos mas pequenos.
- Asistentes de voz y comandos locales: transcripcion de comandos cortos en dispositivos con recursos limitados, donde el coste de un modelo de 244 M es asumible incluso sin GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados en la model card del autor (todos con `verified: false`, es decir, no verificados por un tercero):

| Dataset | Idioma | Metrica | Valor |
|---|---|---|---|
| LibriSpeech (clean), split test | en | Test WER | 3,4322 % |
| LibriSpeech (other), split test | en | Test WER | 7,6283 % |
| Common Voice 11.0, split test | hi | Test WER | 87,3 % |
| Common Voice 13.0, split test | dv | WER | 125,6981 % |

No se han publicado otros resultados de benchmarks en la informacion disponible. El valor de WER superior al 100 % en dhivehi (dv) indica un exceso de inserciones respecto a la referencia, un sintoma tipico de repeticion en la decodificacion o de un emparejamiento incorrecto entre idioma declarado y audio evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,97 GB solo para los pesos; en fp16, unos 0,48 GB; en int8, unos 0,24 GB. Sumando activaciones y buffers, un presupuesto practico de 1 a 2 GB de VRAM cubre la inferencia por lotes pequenos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Para lotes grandes y transcripcion de audio por lotes conviene una RTX 3090, RTX 4090, A100 o H100, aunque el modelo esta sobredimensionado para estas ultimas si se usa en solitario.
- Cabe en GPU de consumo: si. Funciona en tarjetas de gama media y de gama baja con 4 GB de VRAM, e incluso en CPU para audio de duracion moderada, dado su tamano de 241 M de parametros.
- Disco: el repositorio ocupa 3,9 GB porque incluye pesos en varios formatos; para desplegar solo es necesario descargar el formato elegido (safetensors, PyTorch, TensorFlow o JAX).
- Opciones de despliegue: los formatos de peso declarados cubren PyTorch, TensorFlow y JAX, y el pipeline asociado es `automatic-speech-recognition` con `WhisperProcessor`. La informacion proporcionada no detalla soporte explicito de vLLM, llama.cpp, Ollama o TGI; no disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Datos de parametros y disponibilidad tomados de la tabla de configuraciones de la model card; los valores de WER de los modelos alternativos no estan disponibles en la informacion proporcionada.

| Modelo | Parametros | Idiomas | WER LibriSpeech clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| algorithco/whisper-small (esta ficha) | 241.734.912 | Multilingue (99 idiomas declarados) | 3,4322 % | Apache 2.0 | Hub, 0 descargas |
| openai/whisper-base | 74 M | Solo ingles y multilingue | No disponible | Apache 2.0 | Hub |
| openai/whisper-medium | 769 M | Solo ingles y multilingue | No disponible | Apache 2.0 | Hub |
| openai/whisper-large-v2 | 1550 M | Solo multilingue | No disponible | Apache 2.0 | Hub |

## Limitaciones y advertencias

- El repositorio es una redistribucion de un checkpoint de OpenAI por parte del usuario `algorithco`, no un modelo entrenado o ajustado por el publicador. Conviene usar `openai/whisper-small` como referencia canonica.
- Todos los resultados de benchmarks estan marcados como no verificados (`verified: false`).
- El WER declarado en hindi (87,3 %) y en dhivehi (125,6981 %) es muy elevado, lo que sugiere un rendimiento pobre en esos idiomas o un problema en la configuracion de la evaluacion. No se deben extrapolar las cifras de ingles a otros idiomas sin validacion propia.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible en segmentos con silencio, ruido o musica, y pueden entrar en bucles de repeticion. Requiere validacion en produccion.
- Sesgos: la model card no documenta un analisis de sesgos por acento, genero, edad o variedad dialectal. El entrenamiento con supervision debil a gran escala puede infrarrepresentar variedades linguisticas minoritarias.
- Limitaciones de idioma: aunque se declaran 99 idiomas, la calidad es muy desigual y depende del volumen de datos disponible por idioma. La traduccion de voz solo tiene como destino el ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe. La informacion no incluye detalles adicionales sobre atribucion al proyecto original.
- Caveat operativo: la fecha de creacion del repositorio en el Hub (2026-09-16) es posterior a la fecha de consulta habitual de este tipo de fichas, un dato anómalo que conviene comprobar directamente en el Hub.
- Sin soporte de tool calling ni agentes: no se puede integrar directamente en flujos de razonamiento multi-paso; como maximo actua como primer eslabon (audio a texto) de un pipeline que despues alimente a un LLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/algorithco/whisper-small
- Checkpoint original de referencia: https://huggingface.co/openai/whisper-small
- Articulo "Robust Speech Recognition via Large-Scale Weak Supervision": https://arxiv.org/abs/2212.04356
- Repositorio de codigo original de OpenAI: https://github.com/openai/whisper
- Listado de checkpoints Whisper en el Hub: https://huggingface.co/models?search=openai/whisper
- Documentacion del `WhisperProcessor`: https://huggingface.co/docs/transformers/model_doc/whisper#transformers.WhisperProcessor
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la busqueda realizada; los resultados devueltos no guardan relacion con el modelo.
