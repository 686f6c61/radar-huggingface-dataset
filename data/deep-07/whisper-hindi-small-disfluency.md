# Deep-07/whisper-hindi-small-disfluency

## Resumen

Deep-07/whisper-hindi-small-disfluency es un modelo de reconocimiento automatico del habla (ASR) publicado en Hugging Face por el usuario Deep-07, derivado de la familia Whisper de OpenAI. El identificador y el tag `whisper` indican que se trata de un ajuste fino del checkpoint Whisper small (241.734.912 parametros, aproximadamente 242 millones), orientado segun su nombre al hindi y al tratamiento de disfluencias en el habla. El modelo se distribuye en formato safetensors y es compatible con la libreria transformers y con la API de endpoints.

La relevancia del modelo radica en su especializacion: frente al Whisper small generico, un ajuste fino sobre hindi con enfasis en disfluencias puede mejorar la transcripcion de habla espontanea (repeticiones, muletillas, falsos arranques), un escenario habitual en subtitulado, actas de reuniones y corpus linguisticos. No obstante, la model card publicada es la plantilla automatica de Hugging Face sin rellenar, por lo que no hay informacion verificable sobre datos de entrenamiento, licencia, idiomas o evaluacion.

El modelo cuenta con cero descargas y cero likes en el momento de la consulta, y su repo ocupa 1.0 GB. Se trata, por tanto, de un artefacto reciente y sin validacion comunitaria, lo que debe tenerse en cuenta antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, segun tags y nombre del modelo) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper small procesa ventanas de audio de 30 segundos por defecto, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere hindi; no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | automatic-speech-recognition |
| Tamano del repo | 1.0 GB |
| Compatibilidad | endpoints_compatible |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper, un transformer encoder-decoder disenado para reconocimiento automatico del habla que procesa espectrogramas de audio y genera texto de forma autorregresiva. El tag `arxiv:1910.09700` presente en el repo corresponde al paper de Lacoste et al. sobre el impacto ambiental del aprendizaje automatico, citado en la plantilla de model card, y no a un paper propio del modelo. El tag `whisper` y el nombre del checkpoint confirman la familia, pero no hay documentacion tecnica especifica del ajuste fino.

No se dispone de informacion sobre el numero de tokens de audio utilizados, la composicion del dataset de ajuste fino, la presencia de RLHF o DPO (no aplicable en un modelo ASR), ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card es la plantilla automatica de Hugging Face sin completar, con todos los campos marcados como "[More Information Needed]". El unico dato estructural verificable es el recuento de parametros extraido del archivo safetensors.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto), segun el pipeline declarado `automatic-speech-recognition`.
- Especializacion probable en hindi y en habla con disfluencias, deducida del nombre del modelo; no confirmada en la model card.
- Compatibilidad con la libreria transformers y con la API de endpoints de Hugging Face (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje generativo de proposito general).
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio adicional): no disponible.

## Casos de uso

- Subtitulado de habla espontanea en hindi: el modelo, si su especializacion en disfluencias se confirma, permitiria transcribir entrevistas o podcasts con repeticiones y muletillas, reduciendo el postprocesado manual necesario para generar subtitulos limpios.
- Actas y notas de reuniones: transcripcion de audio de reuniones en hindi donde los participantes hablan de forma natural, con falsos arranques y correcciones, aprovechando el ajuste fino sobre disfluencias.
- Corpus linguisticos y estudios de habla: investigacion en linguistica que requiera transcripcion literal de habla espontanea, incluyendo las disfluencias como objeto de estudio en lugar de eliminarlas.
- Accesibilidad: generacion de transcripciones para contenido audiovisual en hindi dirigido a personas con discapacidad auditiva.
- Preprocesado de pipelines de NLP: conversion de audio a texto como primer paso de sistemas de analisis de sentimiento, resumen o busqueda sobre contenido hablado en hindi.
- Prototipado y experimentacion: al ser un modelo pequeno (242 millones de parametros) y compatible con transformers, es adecuado para pruebas de concepto en entornos con recursos limitados antes de escalar a modelos mayores.
- Despliegue en endpoints: gracias al tag `endpoints_compatible`, puede servirse mediante la infraestructura de endpoints de Hugging Face sin configuracion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB solo para pesos (242 millones de parametros x 4 bytes), mas overhead de activaciones y espectrogramas; en la practica, entre 2 y 4 GB segun el tamano de lote y la longitud del audio.
- VRAM estimada en fp16/bf16: aproximadamente 0,5 GB para pesos; en la practica, entre 1 y 3 GB con overhead.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. Tambien puede ejecutarse en CPU para audios cortos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (libreria nativa), endpoints de Hugging Face (tag `endpoints_compatible`); vLLM, llama.cpp, Ollama y TGI no estan confirmados para este checkpoint (Whisper no es el caso de uso tipico de llama.cpp u Ollama, y vLLM requiere soporte especifico de arquitectura Whisper no verificado aqui).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deep-07/whisper-hindi-small-disfluency | 241.734.912 | no disponible | no disponible (probable hindi) | no disponible | Hugging Face, 0 descargas |
| openai/whisper-small | 241.734.912 (aproximado, misma familia) | ventanas de 30 s (por defecto en Whisper) | multilingue (segun Whisper) | MIT (segun OpenAI, no confirmado para este derivado) | Hugging Face, ampliamente usado |
| openai/whisper-base | 74 millones (aproximado) | ventanas de 30 s | multilingue | MIT | Hugging Face |
| openai/whisper-medium | 769 millones (aproximado) | ventanas de 30 s | multilingue | MIT | Hugging Face |

La comparativa se limita a la familia Whisper por ser el origen declarado del modelo. No se dispone de datos de rendimiento del checkpoint Deep-07 que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Model card sin completar: todos los campos tecnicos, de entrenamiento y de evaluacion estan marcados como "[More Information Needed]", por lo que no hay garantia documentada sobre el comportamiento del modelo.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe contactarse con el autor o verificarse en el repo antes de cualquier despliegue en produccion.
- Idiomas no confirmados: aunque el nombre sugiere hindi, la model card no lo declara; el rendimiento en otros idiomas es desconocido.
- Sin validacion comunitaria: cero descargas y cero likes; no hay evidencia de que el modelo haya sido probado por terceros.
- Riesgo de alucinacion en ASR: como todo modelo Whisper, puede generar texto plausible que no corresponde al audio, especialmente en segmentos con ruido o silencios; no hay datos de evaluacion que cuantifiquen este riesgo en este checkpoint.
- Sesgos: no disponible; no hay informacion sobre la composicion del dataset de ajuste fino ni sobre sesgos de acento, genero o dialecto.
- Limitaciones de contexto: no disponible; se desconoce si el ajuste fino altero la ventana de audio de 30 segundos tipica de Whisper.
- Caveat de produccion: al ser un ajuste fino no documentado, se recomienda evaluar con un conjunto de validacion propio antes de integrarlo en pipelines criticos.

## Enlaces

- Hugging Face: https://huggingface.co/Deep-07/whisper-hindi-small-disfluency
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada: https://mlco2.github.io/impact#compute
- Repositorio de OpenAI Whisper (familia base): https://github.com/openai/whisper
- Paper original de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
