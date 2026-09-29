# ltopaiman4/whisper-small

## Resumen

Whisper small es un modelo de reconocimiento automatico del habla (ASR) y traduccion de voz desarrollado originalmente por OpenAI, publicado en el articulo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022). La ficha que nos ocupa, `ltopaiman4/whisper-small`, es una replica del checkpoint multilingue `openai/whisper-small` alojada en Hugging Face, con 241.734.912 parametros y un tamano de repositorio de 3,9 GB.

Se trata de un transformer encoder-decoder (sequence-to-sequence) entrenado con 680.000 horas de audio etiquetado mediante supervision debil a gran escala. Su principal virtud es la capacidad de generalizar a dominios y datasets para los que no ha sido ajustado, lo que lo convierte en una opcion solida como modelo base de transcripcion sin necesidad de fine-tuning.

El checkpoint "small" ocupa el punto medio-bajo de la familia Whisper: es sensiblemente mas preciso que `tiny` (39 M) y `base` (74 M), pero sigue cabiendo en GPU de consumo con memoria modesta, a diferencia de `medium` (769 M) o `large-v2` (1550 M). Soporta 99 idiomas y licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 241.734.912 (safetensors); la model card redondea a 244 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | 99 idiomas, entre ellos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su |
| Licencia | apache-2.0 |
| Formato de pesos | pytorch, tensorflow, jax, safetensors |

## Arquitectura y entrenamiento

Whisper small es un transformer encoder-decoder estandar. El encoder consume representaciones log-Mel del audio de entrada y el decoder genera la transcripcion de forma autorregresiva. El modelo no se controla solo con el audio: el decoder recibe una secuencia de "context tokens" al inicio de la decodificacion que determinan el comportamiento. El orden es: `<|startoftranscript|>`, seguido del token de idioma (por ejemplo `<|en|>`), seguido del token de tarea, que puede ser `<|transcribe|>` para reconocimiento del habla o `<|translate|>` para traduccion de voz.

El entrenamiento se realizo sobre 680.000 horas de audio etiquetado con supervision debil a gran escala, sin ajuste fino posterior sobre los datasets de evaluacion. Los checkpoints de la familia Whisper se entrenaron en dos variantes: solo ingles (tarea de reconocimiento) o multilingue (reconocimiento y traduccion). Los cuatro checkpoints mas pequenos existen en ambas variantes; los grandes (`large`, `large-v2`) son unicamente multilingues. En la tarea de reconocimiento el modelo predice la transcripcion en el mismo idioma del audio; en la de traduccion predice un idioma distinto. La informacion disponible no detalla si hubo fases de RLHF o DPO, ni la composicion exacta del dataset mas alla del volumen de horas.

El uso requiere acompanar al modelo de un `WhisperProcessor`, encargado del preprocesado (conversion del audio a espectrogramas log-Mel) y del postprocesado (conversion de tokens a texto).

## Capacidades

- Reconocimiento automatico del habla (ASR) en 99 idiomas, con prediccion de la transcripcion en el mismo idioma del audio.
- Traduccion de voz: transcripcion del audio a un idioma distinto, anunciada por la model card como capacidad de los checkpoints multilingues.
- Generalizacion sin fine-tuning a datasets y dominios no vistos durante el entrenamiento.
- Seleccion explicita de idioma y tarea mediante context tokens pasados al decoder.
- Salida con marcas de tiempo a nivel de segmento propias del formato Whisper (segun la implementacion estandar, no detallado en la informacion proporcionada).
- No soporta tool calling ni function calling: es un modelo de ASR, no un modelo de lenguaje conversacional.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de modo "thinking", vision ni salida de audio.

## Casos de uso

- Transcripcion de reuniones y entrevistas: el modelo convierte grabaciones de audio en texto en el mismo idioma, y su tamano de 241,7 M de parametros permite ejecutarlo en local sin enviar audio confidencial a servicios externos.
- Generacion automatica de subtitulos: integrado en un pipeline de video, transcribe la pista de audio y produce ficheros de subtitulos; la licencia Apache-2.0 habilita su uso en productos comerciales de edicion o publicacion.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de podcasts, clases o archivos historicos para construir indices de texto sobre los que hacer busqueda semantica.
- Traduccion de voz al ingles: con el token `<|translate|>` el decoder produce texto en ingles a partir de audio en cualquiera de los idiomas soportados, util para monitorizar contenido en idiomas que el equipo no domina.
- Analisis de llamadas de atencion al cliente: transcripcion masiva de grabaciones para extraer terminos recurrentes, motivos de contacto y cumplimiento de guiones, siempre que se respete la normativa aplicable de proteccion de datos.
- Accesibilidad en tiempo real: generacion de subtitulos en directo en aplicaciones de videollamada o streaming, aprovechando que el checkpoint small cabe en GPU de consumo y reduce el coste por hora frente a checkpoints mayores.
- Dictado y toma de notas en entornos sin conectividad: despliegue local en estaciones de trabajo para profesionales que necesitan transcribir sin acceso a internet.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en el model-index de la model card. El campo `verified` es `false` en todos los casos.

| Dataset | Configuracion | Idioma | Split | Metrica | Valor |
|---|---|---|---|---|---|
| LibriSpeech (clean) | clean | en | test | Test WER | 3,4322 |
| LibriSpeech (other) | other | en | test | Test WER | 7,6283 |
| Common Voice 11.0 | hi | hi | test | Test WER | 87,3 |
| Common Voice 13.0 | dv | dv | test | Test WER | 125,6981 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (por ejemplo MMLU, HumanEval o GSM8K, que no aplican a un modelo de ASR). Los valores de la tabla proceden exclusivamente del model-index facilitado.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir del numero de parametros (241.734.912) y del numero de bytes por peso; no han sido publicadas por el autor del modelo.

- Pesos en FP32: aproximadamente 967 MB.
- Pesos en FP16/BF16: aproximadamente 483 MB.
- Pesos en INT8: aproximadamente 242 MB.
- Pesos en INT4: aproximadamente 121 MB.
- A esas cifras hay que sumar activaciones, cache del decoder y memoria del `WhisperProcessor`, por lo que conviene reservar margen adicional.
- Cabe sin dificultad en GPU de consumo con 4 GB o mas de VRAM, incluidas gamas tipo RTX 3050, RTX 3060, RTX 4060 o RTX 4090; tambien es viable en CPU para transcripcion por lotes.
- Para despliegues de alto volumen, GPU de datacenter (A100, H100, L4) permiten aumentar el batch y el throughput, aunque el modelo es demasiado pequeno para necesitarlas por memoria.
- Opciones de despliegue: la model card menciona el uso del `WhisperProcessor` de la libreria Transformers. Otras alternativas habituales del ecosistema Whisper (whisper.cpp, faster-whisper con CTranslate2, servidores de inferencia compatibles con Transformers) no aparecen citadas en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos de parametros de la columna "Parametros" proceden de la tabla incluida en la model card. Los WER de los modelos comparados no se han facilitado en la informacion disponible.

| Modelo | Parametros | Idiomas | WER LibriSpeech clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ltopaiman4/whisper-small (este modelo) | 241.734.912 | Multilingue (99) | 3,4322 (declarado) | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M (segun model card) | Multilingue (99) | no disponible | apache-2.0 | Hugging Face |
| openai/whisper-small.en | 244 M (segun model card) | Solo ingles | no disponible | apache-2.0 | Hugging Face |
| openai/whisper-base | 74 M | Multilingue | no disponible | apache-2.0 | Hugging Face |
| openai/whisper-medium | 769 M | Multilingue | no disponible | apache-2.0 | Hugging Face |
| openai/whisper-large-v2 | 1550 M | Multilingue | no disponible | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Se trata de una replica del checkpoint original de OpenAI: el repositorio `ltopaiman4/whisper-small` registra 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no cuenta con validacion de la comunidad. Para produccion conviene valorar el uso del repositorio oficial `openai/whisper-small`.
- El WER declarado en hindi (87,3) y en dhivehi (125,6981) es muy elevado. Un WER superior a 100 indica que el numero de errores supera el numero de palabras de referencia; en la practica, estos idiomas no son utilizables sin ajuste fino o verificacion manual.
- El rendimiento varia ampliamente segun el idioma: los resultados en ingles sobre LibriSpeech no son extrapolables al resto de las 99 lenguas anunciadas.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible en segmentos con silencio, ruido, musica o habla solapada. Es recomendable filtrar por nivel de confianza y revisar manualmente contenido critico.
- Sesgos potenciales derivados del entrenamiento con supervision debil: sobrerrepresentacion de determinados acentos y registros, y menor calidad en variedades dialectales o en hablantes con diccionarios poco frecuentes.
- Dificultades conocidas en escenarios de hablantes multiples, cambio de codigo (code-switching) dentro de una misma frase y audio de baja relacion senal-ruido.
- La model card de este repositorio esta parcialmente copiada de la model card original de OpenAI, segun se indica en el propio aviso de descargo.
- La licencia apache-2.0 permite uso comercial, modificacion y redistribucion, sin restricciones especificas de atribucion mas alla de las habituales de dicha licencia.
- Es un modelo de ASR: no debe evaluarse ni utilizarse con las expectativas de un LLM (generacion abierta, tool calling, agentes, razonamiento multi-paso).
- Para el tratamiento de audio con datos personales (llamadas, consultas medicas, entrevistas) es necesario aplicar las obligaciones legales correspondientes en materia de proteccion de datos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ltopaiman4/whisper-small
- Checkpoint original de OpenAI: https://huggingface.co/openai/whisper-small
- Arbol de ficheros del checkpoint original: https://huggingface.co/openai/whisper-small/tree/main
- Repositorio de codigo de OpenAI Whisper: https://github.com/openai/whisper
- Articulo: Robust Speech Recognition via Large-Scale Weak Supervision: https://arxiv.org/abs/2212.04356
- Indice de modelos Whisper en Hugging Face: https://huggingface.co/models?search=openai/whisper
- Documentacion del `WhisperProcessor` en Transformers: https://huggingface.co/docs/transformers/model_doc/whisper#transformers.WhisperProcessor
- Ficha de referencia en OpenSourcesAI: https://opensourcesai.com/models/whisper-small/
- Ficha de referencia de Whisper Small (English) en OpenASR: https://openasr.org/models/whisper-small.en/
