# DictionLabs/indic-conformer-600m-multilingual

## Resumen

DictionLabs/indic-conformer-600m-multilingual es una copia espejo, sin modificaciones, del modelo ai4bharat/indic-conformer-600m-multilingual desarrollado por AI4Bharat (IIT Madras). Se trata de un modelo de reconocimiento automatico del habla (ASR) de tipo Conformer hibrido con doble cabecera de decodificacion CTC y RNNT, con aproximadamente 600 millones de parametros, entrenado para las 22 lenguas oficiales de la India. Diction Labs lo replica para que sus servicios de voz a texto obtengan los pesos de un repositorio bajo su control.

El modelo resuelve un problema concreto: la transcripcion de audio en lenguas indias, un ambito donde los sistemas multilingues genericos suelen tener coberturas y tasas de error muy dispares. La relevancia de esta ficha esta en que documenta un espejo, no un modelo nuevo: segun la model card, cada peso y cada archivo de codigo es identico byte a byte al repositorio original (verificado por sha256 de LFS el 2026-10-11) y solo se han anadido el README y el LICENSE.

Al tratarse de un modelo acustico de ASR y no de un modelo generativo de lenguaje, varias de las categorias habituales de esta plantilla (tool calling, agentes, contexto en tokens) no aplican y se marcan como no disponibles o no aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer hibrido con decodificacion dual CTC + RNNT |
| Parametros totales | ~600 millones |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible como parametro formal; la ventana practica usada por Diction Labs es de ~15 s de audio y el modelo pierde palabras en habla continua de mas de ~18 s |
| Tipos de cuantizacion | no disponible (el repositorio incluye artefactos ONNX segun los tags; no se detallan los esquemas de cuantizacion) |
| Idiomas soportados | 22 lenguas: hi, as, bn, brx, doi, gu, kn, kok, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | MIT |
| Formato de pesos | no detallado en la informacion disponible; el repositorio incluye artefactos ONNX (tag `onnx`) y pesos del modelo base, con un tamano total de 2,6 GB |
| Tarea | automatic-speech-recognition (audio a texto) |
| Entrada | audio mono a 16 kHz |
| Codigo remoto | si (`trust_remote_code=True`) |
| Tamano del repositorio | 2,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un Conformer, es decir, un transformer con capas convolucionales intercaladas, en su variante hibrida que combina una cabecera CTC y una cabecera RNNT sobre el mismo codificador. Esta configuracion permite elegir el modo de decodificacion en inferencia: la llamada del modelo acepta el idioma objetivo y el modo, por ejemplo `model(wav, "hi", "ctc")` o `model(wav, "hi", "rnnt")`. El modelo tiene aproximadamente 600 millones de parametros y esta orientado a las 22 lenguas oficiales de la India, con seleccion explicita de idioma en la API.

No se dispone de informacion sobre el volumen de tokens de audio, la composicion del dataset, el uso de tecnicas de ajuste como RLHF o DPO, ni sobre innovaciones adicionales de decodificacion mas alla del esquema CTC/RNNT. El entrenamiento y el codigo originales corresponden a AI4Bharat (IIT Madras) y se enmarcan en su trabajo IndicVoices / IndicConformer. El repositorio de Diction Labs no introduce ningun cambio sobre esos pesos ni sobre ese codigo.

## Capacidades

- Transcripcion de voz a texto en 22 lenguas indias con seleccion de idioma explicita en la llamada.
- Decodificacion en dos modos: CTC y RNNT, intercambiables mediante un parametro de la funcion de inferencia.
- Procesamiento de audio mono a 16 kHz cargado con torchaudio o cualquier libreria equivalente.
- Ejecucion mediante `AutoModel.from_pretrained` con `trust_remote_code=True`, lo que implica cargar codigo remoto del repositorio.
- Distribucion en formato ONNX, segun los tags del repositorio, lo que habilita inferencia con ONNX Runtime.
- Soporte multilingue restringido al conjunto de lenguas indicadas; no se documenta deteccion automatica de idioma.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio generativo ni modo de pensamiento. Es exclusivamente un modelo acustico de reconocimiento.

## Casos de uso

- Subtitulado de video en lenguas indias: el modelo transcribe pistas de audio a 16 kHz y genera segmentos de texto con marcas temporales externas; es adecuado porque cubre las 22 lenguas oficiales con una unica licencia MIT.
- Transcripcion de conversaciones de atencion al cliente: integrado en el pipeline de telefonia, permite convertir grabaciones de llamadas en texto para analitica y control de calidad, siempre troceando el audio en ventanas de unos 15 s.
- Archivado y busqueda de emisiones de radio y television regionales: transcripcion por lotes de fondos audiovisuales en asamés, bengali, tamil o telugu para indexacion y busqueda textual.
- Generacion de datos para entrenar otros sistemas: las transcripciones sirven como corpus para ajustar modelos de texto, TTS o traductores en lenguas con pocos recursos.
- Asistentes de voz e IVR: reconocimiento de comandos y dictado en centros de contacto, desplegado en ONNX Runtime junto a un modulo de intenciones.
- Accesibilidad en tiempo real: subtitulado automatico en eventos y clases para hablantes de lenguas indias con discapacidad auditiva.
- Dictado clinico o administrativo: transcripcion de notas habladas en hindi o marati para su posterior revision humana, dado que el modelo no garantiza exactitud literal.
- Cumplimiento normativo y registro de auditoria: conversion a texto de grabaciones conservadas por obligacion legal en servicios financieros y sanitarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye cifras de WER, CER ni comparaciones con otros sistemas.

El unico dato empirico aportado es operativo y no cuantitativo: segun Diction Labs, su servidor emplea decodificacion CTC para hindi y corta el audio en ventanas de aproximadamente 15 s porque, en sus pruebas, el modelo omitio palabras en habla continua de mas de unos 18 s.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 2,4 GB de pesos en fp32 (600 M x 4 bytes), unos 1,2 GB en fp16 y unos 0,6 GB en int8. Son estimaciones aritmeticas derivadas del numero de parametros, no mediciones publicadas; el repositorio ocupa 2,6 GB.
- GPU recomendadas: practicamente cualquier GPU moderna, incluida la gama de consumo. Una RTX 4090, una RTX 3090 o una RTX 3060 de 12 GB son mas que suficientes para este modelo; en centros de datos, una A100 o una H100 quedarian muy sobredimensionadas para una sola instancia, aunque son validas para servir muchos flujos en paralelo.
- Cabe en GPU de consumo: si. Con 600 M de parametros, el modelo entra con holgura en GPUs de 8 GB o menos en fp16, y en la mayoria de iGPUs no dedicadas solo mediante cuantizacion a int8.
- Opciones de despliegue: ONNX Runtime (el repositorio publica artefactos ONNX), PyTorch con transformers y `trust_remote_code=True`, y servidores de inferencia tipo Triton con backend ONNX. No aplican vLLM, llama.cpp ni Ollama, que estan orientados a modelos generativos de lenguaje.
- Inferencia en CPU: previsiblemente viable con ONNX Runtime en int8, aunque no hay mediciones publicadas de latencia ni de consumo.
- Latencia y throughput: no disponibles. El unico dato operativo conocido es el troceado en ventanas de ~15 s de audio.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de sus fichas publicas y deben verificarse antes de tomar decisiones de produccion.

| Modelo | Parametros | Idiomas | Ventana de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DictionLabs/indic-conformer-600m-multilingual (espejo) | ~600 M | 22 lenguas indias | ~15 s en la integracion de Diction Labs; degrada a partir de ~18 s | MIT | HuggingFace, con artefactos ONNX |
| ai4bharat/indic-conformer-600m-multilingual (original) | ~600 M | 22 lenguas indias | no disponible | MIT | HuggingFace |
| OpenAI Whisper large-v3 | ~1550 M | ~99 idiomas, cobertura desigual en lenguas indias | 30 s | MIT | HuggingFace, OpenAI, multiples runtimes |
| Meta MMS (variante de ~1000 M) | ~1000 M | mas de 1000 idiomas | no disponible | CC-BY-NC 4.0 (no comercial) | HuggingFace |

La ventaja diferencial del modelo de AI4Bharat frente a alternativas genericas es la especializacion en lenguas indias y una licencia permisiva MIT, frente a la licencia no comercial de MMS. Como contrapartida, no cubre idiomas fuera de ese conjunto y su ventana de audio practica es mas corta que la de Whisper.

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: cualquier incidencia, mejora o correccion debe reportarse a AI4Bharat, no a Diction Labs.
- Riesgo de omision de palabras en habla continua: segun las pruebas del integrador, el modelo pierde palabras en fragmentos superiores a unos 18 s, lo que obliga a trocear el audio.
- No se han publicado cifras de WER ni de sesgo; sin benchmarks no es posible estimar su calidad real por idioma.
- Cobertura desigual esperable dentro del conjunto de 22 lenguas, ya que los recursos de entrenamiento disponibles para cada una son muy distintos; este extremo no esta cuantificado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio; conviene auditar ese codigo antes de desplegarlo en produccion.
- Se trata de un modelo puramente acustico: no realiza puntuacion, diarizacion, traduccion ni normalizacion de texto por si mismo. Cualquier alucinacion en el sentido generativo no aplica, pero si existen errores de sustitucion, insercion y omision propios de un sistema ASR.
- Licencia MIT, que permite uso comercial y modificacion siempre que se conserve el aviso de copyright y la atribucion a AI4Bharat.
- El repositorio tiene 0 descargas y 0 likes y fue creado el 2026-10-11; su mantenimiento futuro depende de Diction Labs.
- La etiqueta `base_model:quantized:ai4bharat/indic-conformer-600m-multilingual` aparece en los tags, pero la model card afirma que los pesos son identicos al original. Esta discrepancia no esta explicada en la informacion disponible.

## Enlaces

- Repositorio del espejo en HuggingFace: https://huggingface.co/DictionLabs/indic-conformer-600m-multilingual
- Repositorio original de AI4Bharat: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual
- Sitio de Diction Labs: https://diction.one
- No se han proporcionado en la informacion disponible enlaces adicionales a papers, blogs, repositorios de codigo o demos.
