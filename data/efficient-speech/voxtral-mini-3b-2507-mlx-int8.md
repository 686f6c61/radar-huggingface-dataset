# efficient-speech/Voxtral-Mini-3B-2507-MLX-INT8

## Resumen

Voxtral-Mini-3B-2507-MLX-INT8 es una cuantizacion en 8 bits del modelo Voxtral-Mini-3B-2507 de Mistral AI, convertida al formato MLX por el colectivo Efficient Speech. Voxtral es un modelo multimodal de audio y texto: transcribe voz y, ademas, acepta audio como entrada para responder preguntas sobre el contenido hablado. Esta version concreta aplica cuantizacion afin de 8 bits a los pesos del modelo de lenguaje en grupos de 64, mientras que el codificador de audio se mantiene en BF16.

El modelo base parte de la familia Voxtral de Mistral, pensada para reconocimiento automatico del habla (ASR) y comprension de audio. Esta variante esta disenada para ejecutarse sobre el framework MLX de Apple (Apple Silicon), lo que la hace relevante para desarrolladores que quieren desplegar transcripcion y QA sobre audio en hardware de Apple sin depender de CUDA. Segun los metadatos del repositorio, el checkpoint safetensors declara 5.078.924.288 parametros totales, aunque el nombre comercial hace referencia a "3B".

La publicacion acompania a Murmur, un sistema de inferencia para reconocimiento de voz de formato largo, y se probo con el runtime independiente `mlx-voxtral==0.0.6`. La licencia es Apache 2.0, lo que facilita su uso comercial. No obstante, el repositorio tiene cero descargas y cero "likes" en el momento de la consulta, y la model card es muy escueta en cuanto a datos de entrenamiento y benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal audio-texto (codificador de audio + modelo de lenguaje transformer); pesos convertidos a MLX |
| Parametros totales | 5.078.924.288 (segun safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 afin por grupos de 64 en el modelo de lenguaje; codificador de audio en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), shards cuantizados en 8 bits |

## Arquitectura y entrenamiento

El modelo base Voxtral-Mini-3B-2507 combina un codificador de audio con un modelo de lenguaje de la familia Mistral, de forma que el audio se proyecta al espacio del LLM para tareas de transcripcion y respuesta a preguntas sobre audio. Esta version no reentrena el modelo: Efficient Speech convierte los pesos originales al formato MLX y aplica cuantizacion afin de 8 bits en grupos de 64 exclusivamente al modelo de lenguaje, manteniendo el codificador de audio en BF16 para preservar la calidad de las representaciones acusticas.

Segun la model card, los shards de pesos serializados coinciden byte a byte con el checkpoint MLX de referencia de MarkusKaemmerer, lo que indica que la conversion es reproducible y verificable. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion corresponderia a la model card del modelo base de Mistral, que no se incluye en la informacion disponible.

## Capacidades

- Transcripcion de voz a texto (pipeline `automatic-speech-recognition`).
- Respuesta a preguntas sobre audio: acepta audio como entrada y genera respuestas en texto.
- Procesamiento de audio de formato largo, segun el sistema Murmur con el que se probo.
- Inferencia sobre Apple Silicon mediante MLX.
- Capacidades de generacion de texto heredadas del modelo de lenguaje subyacente (no detalladas en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo convierte audio de reuniones en texto; su integracion con Murmur, orientado a reconocimiento de voz de formato largo, lo hace adecuado para sesiones extensas en equipos que trabajan sobre macOS.
- Generacion de subtitulos: procesamiento por lotes de ficheros de audio o video para producir transcripciones que luego se sincronizan como subtitulos.
- Busqueda sobre contenido hablado: combinando transcripcion y QA sobre audio, se pueden indexar podcasts o clases y responder preguntas sobre lo dicho.
- Asistentes de voz locales: al ejecutarse en MLX sobre Apple Silicon, permite prototipos de asistente de voz sin enviar audio a la nube, util en entornos con requisitos de privacidad.
- Analisis de llamadas de atencion al cliente: transcripcion y extraccion de informacion de grabaciones para control de calidad, con la ventaja de una licencia Apache 2.0 para uso comercial.
- Accesibilidad: conversion de contenido hablado en texto para personas con discapacidad auditiva en aplicaciones de escritorio sobre Mac.
- Investigacion en ASR: al ser una cuantizacion INT8 verificable byte a byte contra un checkpoint de referencia, sirve para estudiar el impacto de la cuantizacion en la calidad de transcripcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 6,0 GB, por lo que la inferencia requiere en torno a 6 GB de memoria unificada mas el overhead del runtime MLX.
- Hardware objetivo: Apple Silicon (MLX). No esta pensado para GPU NVIDIA ni CUDA.
- Cabe en equipos Apple con al menos 16 GB de memoria unificada; con 8 GB el margen es muy ajustado.
- Despliegue: runtime `mlx-voxtral` (version 0.0.6 probada) y el sistema Murmur para audio de formato largo. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| efficient-speech/Voxtral-Mini-3B-2507-MLX-INT8 | 5.078.924.288 (safetensors) | no disponible | MLX INT8 | Apache 2.0 | Cuantizacion para Apple Silicon |
| mistralai/Voxtral-Mini-3B-2507 | no disponible en la informacion | no disponible | safetensors (BF16) | Apache 2.0 | Modelo base original de Mistral |
| MarkusKaemmerer/Voxtral-Mini-3B-2507-8bit-dense-encoder | no disponible en la informacion | no disponible | MLX 8 bits | no disponible | Checkpoint de referencia con el que coincide byte a byte |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de ASR.

## Limitaciones y advertencias

- La model card no documenta sesgos, tasas de alucinacion ni limitaciones por idioma; deben evaluarse empiricamente antes de produccion.
- La cuantizacion INT8 puede degradar ligeramente la precision de transcripcion frente al modelo base en BF16; no se aportan mediciones al respecto.
- Solo es ejecutable en el ecosistema MLX (Apple Silicon); no hay soporte documentado para CUDA, ROCm ni CPU generica.
- El repositorio declara 5.078.924.288 parametros, cifra superior a la sugerida por el nombre "3B"; conviene verificar el desglose entre codificador y modelo de lenguaje.
- Cero descargas y cero "likes": es una publicacion reciente y sin validacion comunitaria amplia.
- Aunque la licencia es Apache 2.0, el uso comercial debe revisarse tambien contra los terminos del modelo base de Mistral.
- La longitud de contexto no esta documentada, lo que complica planificar audio de muy larga duracion sin el sistema Murmur.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/efficient-speech/Voxtral-Mini-3B-2507-MLX-INT8
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Checkpoint MLX de referencia: https://huggingface.co/MarkusKaemmerer/Voxtral-Mini-3B-2507-8bit-dense-encoder
- Sistema Murmur: https://github.com/uw-syfi/Murmur
