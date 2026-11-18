# bodhan-ai/indic-transcribe-flex

## Resumen

Indic-transcribe-flex es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Bodhan AI, un fine-tune del modelo NVIDIA Canary-1b-v2. Esta disenado especificamente para el multilingueismo indio, cubriendo 24 idiomas que incluyen tanto lenguas mayoritarias (hindi, bengali, tamil, telugu, urdu) como minoritarias y de bajos recursos (santali, bodo, konkani, maithili, manipuri, entre otras). El modelo aborda un problema especialmente complejo en el contexto indio: la alternancia y mezcla de codigos (code-switching y code-mixing) dentro de una misma conversacion, asi como la romanizacion y transliteracion de texto.

Con aproximadamente 1.220 millones de parametros (1,22 B), el modelo se basa en la arquitectura FastConformer de NVIDIA, optimizada para transcripcion de audio con atencion eficiente. Su relevancia actual radica en que la mayoria de sistemas ASR comerciales estan optimizados para ingles o un punado de idiomas mayoritarios, dejando fuera a cientos de millones de hablantes de lenguas indias que ademas suelen mezclar idiomas en el habla cotidiana.

El modelo incorpora capacidades adicionales poco habituales en ASR: identificacion de idioma (language identification), romanizacion y transliteracion, lo que lo hace util tanto para transcripcion literal como para normalizacion de texto. El acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (NeMo), basada en nvidia/canary-1b-v2 |
| Parametros totales | 1.222.553.584 (~1,22 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur, bho, hne, bgc, bhb (24 idiomas) |
| Licencia | other (no especificada en detalle; acceso restringido) |
| Formato de pesos | safetensors (libreria NeMo) |

## Arquitectura y entrenamiento

El modelo se construye sobre NVIDIA Canary-1b-v2, un modelo ASR de la familia Canary que emplea la arquitectura FastConformer: una variante del encoder Conformer con atencion por bloques que reduce el coste computacional manteniendo la precision en tareas de reconocimiento de voz. Canary-1b-v2 es un modelo multitarea que combina transcripcion, traduccion y reconocimiento con identificacion de idioma. El fine-tune de Bodhan AI especializa este modelo base hacia el dominio indico, anadiendo 24 idiomas y capacidades de code-switching, romanizacion y transliteracion.

No se dispone de informacion detallada sobre el volumen de datos de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (poco habituales en ASR). Los tags del modelo indican que el fine-tune se ha orientado especificamente a la deteccion de idioma y a la produccion de transcripciones en escritura nativa o romanizada, lo que sugiere un dataset de entrenamiento con anotaciones ricas en metadatos linguisticos. La libreria de referencia es NeMo, el framework de NVIDIA para modelos de voz.

## Capacidades

- Reconocimiento automatico del habla (ASR) en 24 idiomas indios, incluyendo hindi, bengali, tamil, telugu, urdu, gujarati, kannada, malayalam, marathi, punyabi, odia, asamés, nepalí y sánscrito, ademas de lenguas minoritarias como santali, bodo, konkani, maithili, manipuri, dogri, cachemir y sindhi.
- Manejo de code-switching y code-mixing: transcribe audio donde el hablante alterna entre idiomas dentro de una misma frase o conversacion.
- Identificacion de idioma (language identification) integrada en el proceso de transcripcion.
- Romanizacion y transliteracion: capacidad de generar la transcripcion en escritura latina o en la escritura nativa del idioma.
- Procesamiento de audio en ingles (idioma heredado del modelo base).
- Integracion con el ecosistema NeMo para pipelines de ASR.
- No se ha documentado soporte explicito de tool calling, agentes o razonamiento multi-paso (no aplicable a un modelo ASR).

## Casos de uso

- Transcripcion de reuniones y llamadas multilingues en empresas indias: el modelo puede manejar conversaciones donde los participantes alternan entre hindi, ingles y lenguas regionales, algo comun en entornos corporativos y administrativos.
- Subtitulado automatico de contenido audiovisual: generacion de subtitulos para videos, podcasts y programas de television en lenguas indias, con opcion de salida romanizada para plataformas que no soportan escrituras nativas.
- Atencion al cliente en centros de llamadas: transcripcion de conversaciones telefonicas en tiempo real o diferido para analisis de calidad, cumplimiento normativo y generacion de actas, cubriendo idiomas que los sistemas ASR comerciales estandar no reconocen.
- Documentacion clinica y legal: dictado de informes medicos o declaraciones judiciales en lenguas regionales, donde la precision en la identificacion de idioma y la transliteracion son criticas para el archivo y la busqueda posterior.
- Accesibilidad e inclusion digital: conversion de voz a texto para personas con discapacidad auditiva en comunidades que hablan lenguas de bajos recursos, facilitando el acceso a servicios publicos digitales.
- Investigacion linguistica y preservacion de lenguas: transcripcion de grabaciones de campo en lenguas minoritarias como santali, bodo o manipuri, con identificacion automatica de idioma y romanizacion para su analisis comparativo.
- Sistemas de busqueda y recuperacion de audio: indexacion de archivos de audio por contenido hablado en multiples idiomas indios, permitiendo busquedas textuales sobre grandes archivos de grabaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,22 B de parametros, en precision FP16 requiere aproximadamente 2,5 GB de VRAM solo para los pesos; en FP32, unos 4,9 GB. El consumo real depende del tamano del lote y de la longitud del audio.
- GPU recomendadas: NVIDIA A100, H100, L40S o A10 para despliegues de produccion con alto throughput. Para inferencia en tiempo real de un solo flujo, una RTX 4090 o RTX 3090 es suficiente.
- Cabe en GPU de consumo: si, en tarjetas con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 3070 en adelante) para inferencia con precision FP16 y lotes pequenos.
- Opciones de despliegue: NeMo (framework nativo), NVIDIA Riva para despliegue en produccion, y potencialmente exportacion a TensorRT. No se ha documentado soporte para llama.cpp u Ollama (no aplicable a ASR).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bodhan-ai/indic-transcribe-flex | ~1,22 B | 24 (indios + ingles) | no disponible | other (gated) | Hugging Face (acceso restringido) |
| nvidia/canary-1b-v2 | ~1 B (no confirmado) | Multilingue (principalmente europeo) | no disponible | other | Hugging Face |
| ai4bharat/indicwav2vec | no disponible | Varios idiomas indios | no disponible | no disponible | Hugging Face |
| openai/whisper-large-v3 | ~1,55 B | ~99 idiomas | 30 s de audio | MIT | Abierto |

La comparativa con Whisper-large-v3 es relevante porque, aunque Whisper cubre mas idiomas nominalmente, su rendimiento en lenguas indias de bajos recursos y en code-switching es limitado. Indic-transcribe-flex se especializa en ese nicho con un modelo de tamano similar, aunque su licencia restrictiva y acceso gated limitan su adopcion frente a alternativas abiertas.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en entornos corporativos con procesos de aprobacion estrictos.
- Licencia "other" no detallada: no se especifican los terminos exactos de uso comercial, por lo que es imprescindible revisar las condiciones antes de desplegarlo en produccion.
- Sesgos potenciales: al ser un fine-tune sobre un modelo base entrenado mayoritariamente con datos de dominio publico, puede presentar sesgos hacia determinados acentos, registros o variantes dialectales dentro de cada idioma.
- Riesgo de alucinacion: como todo modelo ASR generativo, puede producir transcripciones plausibles pero incorrectas en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento.
- Cobertura desigual entre idiomas: es previsible que el rendimiento en lenguas mayoritarias (hindi, bengali, tamil) sea superior al de lenguas minoritarias (santali, bodo, konkani), aunque no se han publicado metricas que lo confirmen.
- Limitaciones de contexto: no se ha documentado la longitud maxima de audio procesable; los modelos FastConformer suelen trabajar con ventanas de audio de decenas de segundos, por lo que audios largos requeriran segmentacion.
- Dependencia del ecosistema NeMo: el despliegue esta ligado a las herramientas de NVIDIA, lo que puede complicar la integracion en stacks basados en PyTorch puro o en frameworks de inferencia genericos.
- No apto para tareas de generacion de texto, razonamiento o codigo: es un modelo exclusivamente ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bodhan-ai/indic-transcribe-flex
- Modelo base: https://huggingface.co/nvidia/canary-1b-v2
- Documentacion de NeMo (NVIDIA): https://docs.nvidia.com/nemo-framework/
- Repositorio de NeMo en GitHub: https://github.com/NVIDIA/NeMo
