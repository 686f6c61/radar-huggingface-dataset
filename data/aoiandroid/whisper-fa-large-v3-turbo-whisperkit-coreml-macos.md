# aoiandroid/whisper-fa-large-v3-turbo-whisperkit-coreml-macos

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una conversión de formato del modelo persa `vhdm/whisper-large-fa-v1` al layout Core ML que espera WhisperKit, con cuantización adicional por palettización de 6 bits. El autor es el usuario de HuggingFace `aoiandroid`, y la conversión se ha publicado como espejo para el proyecto TranslateBlue. El objetivo es permitir la transcripción automática de voz en persa (farsi) directamente sobre hardware Apple, sin depender de servicios en la nube.

La arquitectura subyacente es la de `openai/whisper-large-v3-turbo`, un transformer encoder-decoder de tipo Whisper, afinado por `vhdm` sobre el dataset `vhdm/persian-voice-v1` para el idioma persa. La conversión divide el encoder en dos modelos Core ML (capas 0-15 y capas 16-31 más layer norm) para que la compilación quepa en un Mac de 8 GB, y aplica palettización post-entrenamiento de 6 bits por tensor mediante k-means, manteniendo en fp16 los tensores de menos de 2048 elementos.

Su relevancia es doble: por un lado cubre un idioma con poca cobertura en herramientas de ASR on-device; por otro, demuestra un pipeline reproducible de conversión Whisper a Core ML cuantizado que se ejecuta en Apple Silicon. El repositorio ocupa 592 MB, declara licencia MIT y solo declara el idioma persa. No incluye `TextDecoderContextPrefill`, componente opcional en WhisperKit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper); encoder en dos submodelos Core ML (capas 0-15 y 16-31 + layer norm), decoder con KV length 448 |
| Parametros totales | No disponible en la ficha del autor; el modelo base `openai/whisper-large-v3-turbo` declara 809 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | KV length 448 en el decoder; ventanas de audio nativas de Whisper (30 s); en la evaluacion se usaron ventanas de 15 s |
| Tipos de cuantizacion | Palettizacion de 6 bits (k-means por tensor, post-entrenamiento); tensores de menos de 2048 elementos en fp16 |
| Idiomas soportados | Persa (fa). El modelo base es multilingue, pero esta conversion declara unicamente `fa` |
| Licencia | MIT |
| Formato de pesos | Core ML (`.mlmodelc`): `MelSpectrogram`, `AudioEncoder`, `TextDecoder`, mas `config.json`, `generation_config.json`, `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo original es `vhdm/whisper-large-fa-v1`, un fine-tune en persa de `openai/whisper-large-v3-turbo` entrenado sobre el dataset `vhdm/persian-voice-v1`. Whisper es un transformer encoder-decoder con spectrograma de entrada de 128 bins mel; `large-v3-turbo` reduce el decoder a 4 capas manteniendo el encoder completo, lo que lo hace notablemente mas rapido en inferencia que `large-v3` a costa de algo de calidad. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

Sobre ese checkpoint, este repositorio aplica dos transformaciones sin reentrenamiento adicional. Primero, la conversion a Core ML con los modulos de `argmaxinc/whisperkittools` (commit `84f77a83`), dividiendo el encoder en dos mitades para poder compilarlo en un Mac de 8 GB. Segundo, una palettizacion de 6 bits por tensor con k-means entrenado post-entrenamiento mediante coremltools, dejando en fp16 los tensores con menos de 2048 elementos. No se incluye `TextDecoderContextPrefill`, que WhisperKit trata como opcional.

## Capacidades

- Reconocimiento automatico de voz (ASR) en persa, con el token de idioma persa forzado en la decodificacion greedy.
- Transcripcion de audio en streaming por ventanas: la evaluacion del autor usa ventanas de aplicacion de 15 s sobre clips de aproximadamente 60 s.
- Ejecucion completamente offline sobre Apple Silicon mediante Core ML, con todos los compute units disponibles (ANE, GPU y CPU).
- Entrada de audio de 128 bins mel a traves del submodelo `MelSpectrogram.mlmodelc`.
- Integracion nativa con WhisperKit como libreria declarada del repositorio.
- Capacidades multilingues: no disponibles en esta conversion, que declara exclusivamente `fa` pese a heredar la base multilingue de Whisper.
- Tool calling, function calling, agentes, vision, audio generativo, modo thinking: no disponibles (es un modelo de ASR puro).
- Traduccion de voz a texto en ingles: no confirmada en la informacion proporcionada.

## Casos de uso

- Transcripcion de voz en persa en aplicaciones macOS e iOS: el modelo esta empaquetado en formato Core ML y disenado para WhisperKit, por lo que puede embeberse en una app nativa y transcribir sin enviar audio a servidores externos.
- Subtitulado automatico de video en farsi: al procesar ventanas de 15 s con ventanas de aplicacion cortas, encaja en pipelines de generacion de subtitulos por segmentos, con marcas de tiempo gestionadas por la capa de aplicacion.
- Asistentes de voz offline para usuarios persohablantes: al ejecutarse integramente en el dispositivo, permite dictado y comandos de voz sin conexion y sin exponer conversaciones a terceros.
- Analisis de llamadas de atencion al cliente en farsi: transcripcion por lotes de grabaciones para posterior busqueda, clasificacion o control de calidad, siempre que se cumplan los requisitos legales de tratamiento de datos.
- Indexacion y busqueda de archivos de audio: podcasts, reuniones o notas de voz en persa pueden transcribirse localmente para construir indices de texto consultables.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en tiempo real en dispositivos Apple, aprovechando la aceleracion del Neural Engine.
- Archivado de patrimonio oral y entrevistas: conversion de colecciones de audio en persa a texto con un coste marginal nulo por no requerir GPU en la nube.

## Benchmarks y rendimiento

El autor publica una unica evaluacion, realizada en Mac y offline el 17 de octubre de 2026. La metrica no es WER, sino cobertura ponderada por frecuencia de las palabras de contenido frente a la referencia, sobre cuatro clips de unos 60 s con enunciados de `FLEURS fa_ir test`, a -26 dBFS, unidos con 0,5 s de silencio, con ventanas de aplicacion de 15 s y decodificacion greedy con el token de idioma persa.

| Clip | Cobertura |
|---|---|
| fleurs-0 | 0,894 |
| fleurs-1 | 0,975 |
| fleurs-2 | 0,908 |
| fleurs-3 | 0,832 |
| Media | 0,902 |

No se han publicado resultados de benchmarks estandar (WER en FLEURS, Common Voice fa, MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. La metrica de cobertura no es directamente comparable con el WER reportado habitualmente para modelos ASR.

## Requisitos de hardware

- Inferencia sobre Apple Silicon (M-series) mediante Core ML y WhisperKit; el repositorio pesa 592 MB y el autor indica que fue convertido en un Mac de 8 GB, lo que marca el minimo practico de memoria unificada.
- Memoria estimada: alrededor de 0,6 GB solo de pesos, mas activaciones y buffers del decoder; en la practica cabe en equipos con 8 GB de memoria unificada y presumiblemente en iPhone/iPad recientes con Neural Engine.
- GPU dedicadas (A100, H100, RTX 4090) y CUDA: no aplicables, ya que el formato de pesos es Core ML y no safetensors ni GGUF.
- Despliegue: WhisperKit (libreria declarada), con los modulos de `argmaxinc/whisperkittools` para reproducir la conversion. vLLM, llama.cpp, Ollama y TGI no soportan `.mlmodelc` y no son opciones para este repositorio.
- Latencia y throughput: no disponibles. La evaluacion describe una ejecucion offline con todos los compute units pero no publica tiempos por clip ni RTF.
- Nota: la ausencia de `TextDecoderContextPrefill` puede penalizar el rendimiento en prompts o contextos largos segun como lo gestione WhisperKit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `aoiandroid/whisper-fa-large-v3-turbo-whisperkit-coreml-macos` | No declarado (base de 809 M) | KV 448; ventanas de 15-30 s | fa | MIT | Core ML (`.mlmodelc`) |
| `vhdm/whisper-large-fa-v1` | No disponible | No disponible | fa | MIT | No disponible |
| `openai/whisper-large-v3-turbo` | 809 M (dato publico del modelo base) | KV 448; ventanas de 30 s | Multilingue | MIT | PyTorch / safetensors |
| `openai/whisper-large-v3` | 1.550 M (dato publico, referencia) | Ventanas de 30 s | Multilingue | MIT | PyTorch / safetensors |

No se dispone de cifras comparativas de WER entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a parametros, cobertura de idioma, licencia y formato de distribucion.

## Limitaciones y advertencias

- La palettizacion de 6 bits es una cuantizacion post-entrenamiento: puede introducir degradacion adicional respecto al checkpoint original en fp16, no cuantificada en la ficha.
- La conversion no ha pasado por reentrenamiento ni ajuste fino posterior; cualquier artefacto del modelo fuente persiste.
- La evaluacion se apoya en 4 clips de FLEURS y una metrica de cobertura de palabras, no en WER sobre un conjunto de test amplio. La generalizacion a dominios reales (ruido, acentos, audio telefonico) no esta medida.
- Idiomas: solo se declara persa. Aunque la base sea multilingue, la fine-tune persa puede degradar el rendimiento en otros idiomas.
- Riesgo de alucinacion inherente a Whisper en tramos de silencio, musica o ruido, con posibles repeticiones o texto inventado; conviene aplicar heurísticas de filtrado en produccion.
- No incluye `TextDecoderContextPrefill`, lo que puede afectar al rendimiento en prompts largos o en decodificacion con contexto extenso.
- Licencia MIT: permite uso comercial y modificacion, pero el espejo no esta avalado por `vhdm` ni por OpenAI, y se pide atribucion explicita a `vhdm`.
- El tokenizer y el `tokenizer_config.json` provienen de `openai/whisper-large-v3-turbo`, no del repositorio fuente, que no incluye `tokenizer.json`.
- Sesgos concretos del modelo: no documentados en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aoiandroid/whisper-fa-large-v3-turbo-whisperkit-coreml-macos
- Modelo base persa: https://huggingface.co/vhdm/whisper-large-fa-v1
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de entrenamiento: https://huggingface.co/datasets/vhdm/persian-voice-v1
- Herramientas de conversion: https://github.com/argmaxinc/whisperkittools
- Runtime WhisperKit: https://github.com/argmaxinc/WhisperKit
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron paginas sin relacion con el repositorio.
