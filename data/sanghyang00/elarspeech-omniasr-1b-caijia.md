# Sanghyang00/ELARSpeech-OmniASR-1B-caijia

## Resumen

ELARSpeech-OmniASR-1B-caijia es un modelo de reconocimiento automatico del habla (ASR) publicado por el usuario Sanghyang00 en HuggingFace, especializado en caijia, una lengua sino-tibetana hablada en el suroeste de China que no tiene codigo ISO 639-3 asignado. Se trata de un ajuste fino (fine-tuning) del checkpoint aadel4/omniASR-CTC-1B-v2, del que hereda la arquitectura Wav2Vec2ForCTC y que forma parte de la iniciativa ELARSpeech.

El modelo cuenta con 975.695.551 parametros reales segun los pesos en safetensors (comercializado como "1B") y se distribuye bajo la libreria transformers con el pipeline automatic-speech-recognition. Su interes principal es cubrir una lengua de muy bajos recursos para la que practicamente no existen sistemas ASR publicos, lo que lo convierte en una pieza util para documentacion linguistica, transcripcion de campo y preservacion de patrimonio oral.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", y no se declara licencia ni se aportan resultados de benchmarks mas alla de una verificacion de exactitud de transcripcion marcada como PASS sobre un conjunto fijo de evaluacion. Esto implica que cualquier uso en produccion debe ir precedido de una validacion propia sobre datos representativos del dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (extractor convolucional de caracteristicas + encoder transformer + cabeza de clasificacion CTC) |
| Parametros totales | 975.695.551 (~976 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo ASR; entrada de audio mono a 16 kHz) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; los pesos se publican en safetensors (el tamano del repo, 3,9 GB, es coherente con pesos en fp32) |
| Idiomas soportados | caijia (lengua sin codigo ISO 639-3 asignado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estandar de Wav2Vec2 para CTC: un extractor convolucional de caracteristicas que transforma la onda de audio en representaciones latentes, un encoder basado en bloques transformer con atencion multi-cabeza y una cabeza lineal de clasificacion que emite logits sobre un vocabulario de unidades (tipicamente caracteres o subpalabras) y se decodifica con Connectionist Temporal Classification. Se trata de un ajuste fino del checkpoint aadel4/omniASR-CTC-1B-v2, que aporta los pesos preentrenados sobre los que se ha especializado el modelo en caijia.

No se dispone de informacion publica sobre el volumen de tokens de audio utilizados, la composicion del corpus de entrenamiento, el numero de horas de habla, la procedencia de las grabaciones ni la aplicacion de tecnicas de alineacion o aumento de datos. La model card tampoco detalla si hubo etapas de ajuste con decodificacion por lenguaje o si el vocabulario de salida es puramente caracter-based. La unica innovacion o garantia tecnica declarada es que el artefacto exportado se compara con el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion y que la verificacion de transcripcion exacta obtiene el estado PASS.

## Capacidades

- Reconocimiento automatico del habla en caijia, con salida de transcripcion mediante decodificacion CTC voraz (argmax sobre los logits).
- Entrada de audio mono remuestreado a 16 kHz; el procesador asociado gestiona la normalizacion y la tokenizacion de la senal.
- Integracion nativa con la libreria transformers mediante las clases AutoProcessor y Wav2Vec2ForCTC.
- Ejecucion en CPU y GPU sin dependencias exotikas, apta para inferencia por lotes.
- No se declara soporte de tool calling ni de function calling (no aplica a un modelo ASR).
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad multilingue: es un modelo mono-idioma.
- No se declara salida de puntuacion, marcas de tiempo por palabra ni diarizacion de hablantes.
- No se declara modo de razonamiento (thinking mode), vision ni audio-vision.

## Casos de uso

- Documentacion linguistica de campo: transcripcion asistida de grabaciones de hablantes nativos de caijia recogidas en formato mono a 16 kHz, reduciendo el trabajo manual de segmentacion y transcripcion inicial antes de la revision por parte de un linguista.
- Preservacion de patrimonio oral: conversion de archivos de audio historicos o etnograficos a texto indexable, siempre que se remuestreen previamente a 16 kHz y se acepte una tasa de error que debe medirse caso por caso.
- Corpus paralelos para traduccion automatica: generacion de transcripciones que sirvan como lado fuente de corpus caijia-otro idioma, habilitando el entrenamiento posterior de sistemas de traduccion de bajos recursos.
- Investigacion en ASR de bajos recursos: uso como linea base (baseline) para comparar tecnicas de aumento de datos, adaptacion de dominio o decodificacion con modelo de lenguaje en una lengua sin datos abundantes.
- Aplicaciones de dictado comunitario: prototipos de transcripcion local para hablantes de caijia en entornos con recursos limitados, dado que el modelo (~976 M de parametros) puede ejecutarse en una GPU de consumo e incluso en CPU con latencia aceptable.
- Verificacion y anotacion de archivos ya transcritos: comparacion automatica de transcripciones existentes con la salida del modelo para detectar discrepancias ortograficas o segmentos mal anotados.
- Normalizacion de audio en pipelines de datos: uso dentro de un flujo de preprocesado que exige decodificacion previa de voz a texto antes de alimentar un sistema de analisis posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada por el autor es que la verificacion de transcripcion exacta (exact-transcription verification) sobre un conjunto fijo de evaluacion obtiene el estado PASS frente al checkpoint original de ELARSpeech; no se especifica el tamano de ese conjunto, la metrica empleada (WER, CER o coincidencia exacta) ni su valor numerico, por lo que no es posible presentar una tabla comparativa de MMLU, HumanEval, GSM8K ni de WER/CER.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,9 GB con pesos en fp32, unos 2 GB en fp16 y en torno a 1 GB en int8, a lo que hay que sumar el consumo de activaciones (del orden de unos cientos de MB para audios de pocos segundos).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 Ti, RTX 3090 o RTX 4090 permiten ademas procesar lotes grandes. En entornos de servidor, A100 o H100 solo se justifican para despliegues de altisima concurrencia, dado el reducido tamano del modelo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente en cuantizacion.
- Inferencia en CPU: viable, dado el tamano del modelo; adecuada para procesamiento por lotes no interactivo.
- Opciones de despliegue: transformers con PyTorch (via AutoProcessor y Wav2Vec2ForCTC), exportacion a ONNX Runtime o TorchScript, y Hugging Face Inference Endpoints (el repositorio incluye la etiqueta endpoints_compatible). No se ha confirmado soporte en vLLM, llama.cpp, Ollama o TGI para esta arquitectura concreta, por lo que debe verificarse antes de asumirlo.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion se limita a especificaciones publicas de modelos de ASR de proposito general o multilingue de tamano comparable, ya que no existen datos de rendimiento de este checkpoint frente a ellos.

| Modelo | Parametros | Cobertura idiomatica | Licencia | Notas |
|---|---|---|---|---|
| ELARSpeech-OmniASR-1B-caijia | ~976 M | Mono-idioma (caijia) | no disponible | Fine-tuning de omniASR-CTC-1B-v2; sin benchmarks publicados |
| Meta MMS-1b-all | ~964 M | Mas de 1000 idiomas, con adaptadores por lengua | CC-BY-NC 4.0 (no comercial) | Arquitectura Wav2Vec2 CTC con adaptadores de idioma; no cubre caijia |
| OpenAI Whisper large-v3 | ~1550 M | Multilingue (decenas de idiomas) | MIT | Arquitectura encoder-decoder; mayor coste de inferencia; no cubre caijia |
| facebook/wav2vec2-large-xlsr-53 | ~317 M | 53 idiomas | Apache 2.0 | Referencia clasica para fine-tuning en lenguas de bajos recursos; no incluye caijia |

## Limitaciones y advertencias

- Modelo mono-idioma: no debe esperarse un comportamiento correcto fuera del caijia, ni siquiera en lenguas cercanas.
- La exactitud varia de forma notable segun las condiciones de grabacion, la poblacion de hablantes, la ortografia adoptada y el dominio del audio; el propio autor lo advierte en la model card.
- La entrada debe ser audio mono remuestreado a 16 kHz; no hacerlo degrada la calidad de la transcripcion de forma apreciable.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. Hasta que el autor aclare los terminos, no deberia utilizarse en productos comerciales sin consulta previa. Ademas, la model card remite a los terminos del dataset del proyecto ELARSpeech y a la licencia del modelo base, que tampoco se detallan aqui.
- El repositorio registra 0 descargas y 0 "likes", por lo que no ha sido validado por la comunidad; el estado PASS de la verificacion interna no equivale a una evaluacion independiente.
- El conjunto de evaluacion empleado no esta descrito y no se publican valores de WER o CER, de modo que no es posible cuantificar el error real esperado.
- Al ser un modelo CTC sin decodificacion con modelo de lenguaje, es frecuente la aparicion de errores de sustitucion, insercion y borrado, y no se garantiza una ortografia consistente.
- Riesgo de alucinacion: aunque los modelos CTC no generan texto libre al estilo de los modelos autorregresivos, si pueden producir secuencias plausibles en segmentos con ruido, silencio o habla no inteligible.
- No se declara soporte de puntuacion, mayusculas, marcas de tiempo ni identificacion de hablantes, lo que limita su uso directo en subtitulado.
- No hay informacion sobre sesgos demograficos, de genero o de edad derivados de la composicion del corpus de entrenamiento; la cobertura de variedades dialectales dentro del propio caijia es desconocida.
- No se dispone de informacion sobre el numero de horas de entrenamiento ni sobre la procedencia de los datos, por lo que es imposible evaluar el riesgo de sobreajuste al dominio grabado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanghyang00/ELARSpeech-OmniASR-1B-caijia
- Modelo base: https://huggingface.co/aadel4/omniASR-CTC-1B-v2
- Documentacion del proyecto ELARSpeech: no disponible (la model card la menciona sin enlace)
- Paper o informe tecnico: no disponible
- Repositorio de codigo o demo: no disponible
- Resultado de busqueda web consultado (listado general de modelos de HuggingFace): https://huggingface.co/models?sort=created
