# Sanghyang00/ELARSpeech-Whisper-Large-v3-apu

## Resumen

ELARSpeech-Whisper-Large-v3-apu es un modelo de reconocimiento automatico del habla (ASR) para el idioma apurina (codigo ISO 639-3: apu), publicado por el usuario Sanghyang00 en HuggingFace. Se trata de un ajuste fino supervisado del modelo openai/whisper-large-v3 sobre datos del proyecto ELARSpeech, y su tarea es transcribir audio en apurina, una lengua indigena amazónica de la familia aruak con muy pocos recursos digitales.

El modelo conserva la arquitectura original WhisperForConditionalGeneration, un transformer encoder-decoder de 1.543.491.840 parametros (aproximadamente 1,55 mil millones), con entrada de audio mono a 16 kHz convertida en espectrograma Mel de 128 bandas y procesada en ventanas de 30 segundos. El repositorio pesa 6,2 GB y contiene unicamente pesos en formato safetensors, lo que corresponde a una exportacion en precision completa.

Su relevancia es doble: por un lado, aporta cobertura ASR a una lengua practicamente ausente en los sistemas comerciales de transcripcion; por otro, sirve como ejemplo de adaptacion de un modelo multilingue grande a un unico idioma de bajos recursos mediante fine-tuning. El autor declara que el artefacto exportado ha superado una verificacion de transcripcion exacta (estado PASS) frente al checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion. No hay resultados de benchmarks numericos publicos ni descargas registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WhisperForConditionalGeneration (transformer encoder-decoder) |
| Parametros totales | 1.543.491.840 (aprox. 1,55 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento; audio largo mediante decodificacion secuencial o por fragmentos (segun la documentacion de Whisper) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors sin cuantizar) |
| Idiomas soportados | apu (apurina); modelo monoidioma, no conserva la cobertura multilingue del modelo base |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-large-v3 |
| Tamano del repositorio | 6,2 GB |
| Entrada de audio | mono, 16 kHz |
| Etiquetas | transformers, safetensors, whisper, automatic-speech-recognition, elarspeech, whisper-large-v3, apu, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3 sin modificaciones estructurales: un encoder que consume espectrogramas Mel de 128 bandas calculados sobre ventanas de 30 segundos y un decoder autorregresivo que genera tokens de texto condicionados por tokens especiales de tarea (idioma, transcripcion, marcas de tiempo). El ajuste se ha realizado sobre el checkpoint openai/whisper-large-v3, por lo que el modelo hereda la inicializacion del preentrenamiento debilmente supervisado a gran escala de OpenAI y especializa el decoder hacia el apurina.

No se dispone de informacion sobre el volumen de tokens de audio empleado, la composicion del corpus, la procedencia de las grabaciones ni la aplicacion de tecnicas de alineacion o RLHF/DPO. La model card solo indica que el modelo pertenece al proyecto ELARSpeech y remite a su documentacion para los terminos del conjunto de datos. Tampoco se documenta ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, destilacion) mas alla del fine-tuning.

Un detalle tecnico relevante es el comportamiento de decodificacion: el modelo espera un prompt explicito en el decoder que incorpora el token de idioma `<|apu|>`, seguido de `<|transcribe|>` y `<|notimestamps|>`. El autor advierte que debe usarse ese prompt en lugar del parametro `language=` para reproducir el comportamiento del artefacto exportado.

## Capacidades

- Transcripcion de voz a texto en apurina a partir de audio mono a 16 kHz.
- Decodificacion con haz configurable (`num_beams`) y control del numero maximo de tokens generados.
- Manejo de audio de formato largo mediante decodificacion secuencial o troceada, segun el esquema estandar de Whisper.
- Condicionamiento explicito por token de idioma y de tarea en el prompt del decoder.
- Integracion nativa con la libreria `transformers` (clases `WhisperForConditionalGeneration` y `WhisperProcessor`).
- Compatibilidad declarada con endpoints de inferencia (etiqueta `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, capacidades de agente, vision ni audio mas alla de la transcripcion ASR.
- No se documenta modo de razonamiento (thinking) ni salida estructurada.

## Casos de uso

- Digitalizacion de archivos orales en apurina: transcripcion de grabaciones de campo, entrevistas y material etnografico para su catalogacion y busqueda textual, aprovechando que el modelo esta especializado en la lengua frente al Whisper multilingue generico.
- Documentacion linguistica y revitalizacion: generacion de transcripciones base que despues revisa un hablante nativo, reduciendo el tiempo de transcripcion manual en corpus de lenguas de bajos recursos.
- Subtitulado de material audiovisual comunitario: produccion de subtitulos en apurina para videos educativos o culturales, con postprocesado posterior.
- Preservacion y archivo digital: conversion masiva de cintas y grabaciones historicas a texto indexable, con el audio previamente remuestreado a 16 kHz mono.
- Investigacion en ASR de bajos recursos: uso como punto de partida o linea base para experimentos de fine-tuning adicional, aumentacion de datos o comparacion de tecnicas sobre una lengua con pocos recursos.
- Aplicaciones de asistencia en servicios publicos: transcripcion de interacciones orales para su registro administrativo en contextos donde se atiende a poblacion hablante de apurina, siempre con validacion humana.
- Pipeline de evaluacion de calidad ASR: verificacion de transcripcion exacta frente a un conjunto fijo, tal como hizo el autor, para monitorizar regresiones al reentrenar.
- Despliegue en entornos con GPU modesta: al tratarse de un modelo de 1,55 mil millones de parametros, puede servirse en una sola GPU de consumo con precision reducida para tareas de transcripcion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica evidencia de calidad aportada por el autor es cualitativa y binaria: la verificacion de transcripcion exacta del artefacto exportado frente al checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, con estado **PASS**. No se especifica el tamano de ese conjunto, la metrica empleada (WER/CER) ni los valores obtenidos, por lo que no puede compararse cuantitativamente con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 1.543.491.840 parametros): aproximadamente 6,2 GB en fp32, unos 3,1 GB en fp16/bf16, unos 1,6 GB en int8 y en torno a 0,9 GB en int4. Son estimaciones de peso de los parametros; hay que anadir el consumo del encoder sobre espectrogramas de 30 segundos y el cache del decoder.
- El repositorio solo distribuye safetensors en precision completa (6,2 GB), por lo que las cuantizaciones mencionadas requeririan conversion propia.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para fp16 (RTX 3060 12 GB, RTX 4070, RTX 4090, L4, A10); para fp32 conviene disponer de 12-16 GB o mas (A100, H100, L40S).
- Si cabe en GPU de consumo: si, en fp16 o cuantizado cabe en tarjetas de 6-8 GB o superiores; en fp32 es ajustado en GPUs de 8 GB.
- Opciones de despliegue: `transformers` en PyTorch es la via documentada; la etiqueta `endpoints_compatible` indica compatibilidad con Hugging Face Inference Endpoints. Otras alternativas habituales para Whisper (vLLM, faster-whisper/CTranslate2, whisper.cpp, TGI) no estan documentadas para este repositorio concreto y requeririan conversion de pesos.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tiempo real (RTF), latencia por segmento ni rendimiento por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELARSpeech-Whisper-Large-v3-apu | 1.543.491.840 | Ventana de 30 s por segmento | apu (apurina) | no disponible | HuggingFace, 0 descargas |
| openai/whisper-large-v3 (modelo base) | 1,55 mil millones (large-v3) | Ventana de 30 s por segmento | Multilingue (amplia cobertura) | no disponible en la informacion recogida | HuggingFace, ampliamente utilizado |
| openai/whisper-large-v3-turbo | no disponible (variante optimizada de large-v3) | Ventana de 30 s por segmento | Multilingue | no disponible en la informacion recogida | HuggingFace; ofrece mayor velocidad de transcripcion con una degradacion minima de la precision |

La diferencia funcional clave frente al modelo base es la especializacion: el ajuste sacrifica la cobertura multilingue para concentrarse en apurina. Frente a la variante turbo, el modelo ajustado mantiene el tamano de large-v3 pero sin la optimizacion de velocidad, de modo que su ventaja potencial es la precision en esa lengua concreta y no el rendimiento computacional.

## Limitaciones y advertencias

- Es un modelo monoidioma: solo esta entrenado para apurina y no debe esperarse transcripcion correcta en castellano u otras lenguas.
- El propio autor advierte que la precision puede variar segun las condiciones de grabacion, la poblacion de hablantes, la ortografia empleada y el dominio del audio.
- Es obligatorio remuestrear la entrada a 16 kHz mono; otras frecuencias o canales multiples degradaran el resultado.
- El uso del parametro `language=` no reproduce el comportamiento del modelo exportado: hay que construir el prompt explicito con `<|apu|>`, `<|transcribe|>` y `<|notimestamps|>`.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto repetitivo o inventado en segmentos con silencio, ruido o habla ininteligible; se recomienda validacion humana en cualquier uso con consecuencias.
- La licencia no esta declarada en la model card, lo que impide determinar con certeza las condiciones de uso comercial. Ademas, el autor remite a la documentacion del proyecto ELARSpeech para los terminos del conjunto de datos, sin detallarlos.
- El modelo base openai/whisper-large-v3 tiene sus propias condiciones de licencia y cita, que deben respetarse al redistribuir o desplegar este ajuste.
- No hay resultados de benchmarks publicos ni validacion por parte de terceros: el repositorio registra 0 descargas y 0 me gusta, por lo que la calidad solo esta respaldada por la verificacion interna del autor.
- Al ser una lengua de bajos recursos, es probable que exista sesgo hacia los hablantes, variantes dialectales y convenciones ortograficas presentes en los datos de ajuste.
- No se documentan pesos cuantizados ni versiones GGUF, lo que obliga a convertirlos si se quiere desplegar en entornos ligeros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-apu
- Modelo base openai/whisper-large-v3: https://huggingface.co/openai/whisper-large-v3
- Repositorio de OpenAI Whisper en GitHub: https://github.com/openai/whisper
- Documentacion del modelo Whisper en la API de OpenAI: https://developers.openai.com/api/docs/models/whisper-1
- Ficha de Whisper large-v3 en Vast.ai (referencia tecnica sobre el modelo base): https://vast.ai/model/whisper
- Busqueda de modelos Whisper en HuggingFace: https://huggingface.co/models?sort=downloads&search=whisper
