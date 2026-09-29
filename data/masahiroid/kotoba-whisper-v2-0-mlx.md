# masahiroid/kotoba-whisper-v2.0-mlx

## Resumen

`masahiroid/kotoba-whisper-v2.0-mlx` es una conversion no oficial al framework MLX del modelo de reconocimiento automatico del habla (ASR) `kotoba-tech/kotoba-whisper-v2.0`, especializado en japones y desarrollado por Kotoba Technologies. El modelo original se basa en la arquitectura Whisper de OpenAI y esta optimizado para transcribir audio en japones con alta fidelidad. Esta version concreta ha sido producida por el usuario `masahiroid` para ejecutar el modelo de forma eficiente en Macs con Apple Silicon (serie M) mediante MLX y `mlx-whisper`.

El problema que resuelve es el de la transcripcion local de voz en japones sin depender de servicios en la nube: al ser una conversion MLX, el modelo aprovecha la memoria unificada y la GPU integrada de los chips de Apple, lo que permite inferencia en el dispositivo con un peso en disco de aproximadamente 1,5 GB en precision float16. El repositorio no incluye reentrenamiento alguno: se trata de un reempaquetado de los pesos del modelo base de Kotoba Technologies al formato que consume MLX.

Su relevancia es practica: ofrece una via sencilla para integrar ASR japones de calidad en aplicaciones de escritorio o flujos de trabajo locales en macOS. Conviene subrayar que no es una publicacion oficial de Kotoba Technologies y que el merito del modelo subyacente corresponde a ese equipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) con destilacion; encoder de 32 capas y decoder de 2 capas segun el repositorio de Kotoba Technologies |
| Parametros totales | no disponible (no publicado en la informacion proporcionada) |
| Longitud de contexto | ventanas de audio de 30 segundos (caracteristica de la arquitectura Whisper) |
| Tipos de cuantizacion | float16 (unica precision publicada en esta conversion); no se documentan variantes GGUF ni cuantizadas |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos MLX en float16, consumibles por `mlx-whisper` |
| Modelo base | `kotoba-tech/kotoba-whisper-v2.0` |
| Framework de ejecucion | MLX via `mlx-whisper` |
| Tamano del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

El modelo base `kotoba-whisper-v2.0` sigue la arquitectura Whisper, un transformer encoder-decoder disenado para tareas de speech-to-text. Segun el repositorio de Kotoba Technologies, se parte de un checkpoint de Whisper y se inicializa un modelo estudiante con las 32 capas del encoder y solo 2 capas del decoder, copiadas de las capas 1 y 32 del modelo profesor por ser las maximamente separadas. Es un esquema de destilacion que reduce el coste de decodificacion manteniendo el encoder completo.

Respecto a los datos, el modelo v2.0 se entreno sobre el subconjunto completo de ReazonSpeech, descrito como el mayor corpus de pares audio-transcripcion en japones extraido de grabaciones de television. Tras filtrar las transcripciones con un WER superior a 10, el conjunto final asciende a 7.203.957 clips de audio, con una duracion media de 5 segundos y unos 18 tokens de texto por clip. Esta conversion MLX no reentrena ni ajusta el modelo: unicamente remapea los pesos al formato que espera `mlx-whisper`, aplicando el script `convert.py` del repositorio `mlx-examples`.

## Capacidades

- Reconocimiento automatico del habla en japones: transcripcion de audio a texto en japones de forma nativa.
- Salida con segmentos y marcas temporales, segun el comportamiento estandar de Whisper a traves de `mlx_whisper.transcribe`.
- Procesamiento de audio en ventanas de 30 segundos, con concatenacion de resultados para grabaciones mas largas.
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de conexion a internet ni de enviar audio a servidores externos.
- Seleccion de idioma explicita mediante el parametro `language` (en este caso fijado a `ja`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision ni audio mas alla del ASR.
- No se documentan capacidades de traduccion, diarizacion de hablantes ni etiquetado de emociones en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones en japones: el modelo convierte el audio de una reunion a texto de forma local en un Mac, lo que permite generar actas sin enviar conversaciones confidenciales a servicios externos.
- Subtitulado de video: dado que Whisper genera segmentos con marcas temporales, la salida puede alimentar un generador de subtitulos (SRT/WebVTT) para contenido en japones.
- Transcripcion de podcasts y entrevistas: el modelo procesa grabaciones por ventanas de 30 segundos y encadena los resultados, lo que resulta adecuado para episodios de larga duracion ejecutados en segundo plano en el equipo.
- Aplicaciones de notas de voz en macOS: integracion directa via `mlx-whisper` para transcribir dictados o notas de voz en el propio dispositivo, con latencia baja al no requerir red.
- Archivado y busqueda de material audiovisual: transcripcion de un catalogo de videos en japones para generar indices de texto que permitan busquedas posteriores por palabra clave.
- Investigacion en linguistica o procesamiento del habla: generacion de transcripciones de referencia sobre corpus japoneses, aprovechando que el modelo se entreno con datos de dominio televisivo.
- Accesibilidad: conversion de audio a texto en tiempo casi real para personas con dificultades auditivas en entornos macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de esta conversion MLX no incluye tablas de WER, MMLU ni otros indicadores, y las referencias encontradas no aportan cifras numericas de evaluacion atribuibles a esta version concreta.

| Benchmark | Resultado |
|---|---|
| WER (japones) | no disponible |
| Otros | no disponible |

## Requisitos de hardware

- Plataforma: esta conversion esta pensada para Apple Silicon (chips de la serie M) mediante MLX; el framework MLX no se ejecuta en GPU NVIDIA ni AMD.
- Memoria: los pesos ocupan aproximadamente 1,5 GB en float16 (tamano del repositorio), por lo que se recomienda disponer de al menos 4 GB de memoria unificada libres para operar con holgura.
- Equipos compatibles: cualquier Mac con chip M1, M2, M3 o M4 y memoria unificada suficiente; los modelos con mas memoria permiten procesar audios mas largos o lotes mayores.
- Opciones de despliegue: `mlx-whisper` (libreria oficial para esta conversion). Para otros entornos, el modelo base `kotoba-tech/kotoba-whisper-v2.0` puede servirse con stacks compatibles con Transformers, pero esta version concreta esta empaquetada para MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Disponibilidad | Formato |
|---|---|---|---|---|---|
| masahiroid/kotoba-whisper-v2.0-mlx | Whisper destilado | japones | Apache 2.0 | Conversion comunitaria en MLX | pesos MLX (float16) |
| kotoba-tech/kotoba-whisper-v2.0 | Whisper destilado | japones | Apache 2.0 | Modelo base oficial | safetensors / Transformers |
| kaiinui/kotoba-whisper-v2.0-mlx | Whisper destilado | japones | Apache 2.0 | Conversion comunitaria alternativa en MLX | pesos MLX |
| openai/whisper-large-v3 | Whisper | multilingue | Apache 2.0 | Modelo oficial de OpenAI | safetensors / Transformers |

Los datos de parametros y contexto no se detallan de forma uniforme en la informacion disponible; la comparacion se limita a la arquitectura, idioma, licencia y formato de distribucion.

## Limitaciones y advertencias

- Solo soporta japones: no esta pensado para otros idiomas, a diferencia de los modelos Whisper multilingues.
- Es una conversion no oficial: no cuenta con el respaldo ni la validacion de Kotoba Technologies, por lo que la exactitud numerica respecto al modelo base original no esta garantizada por el autor.
- Riesgo de alucinacion: como cualquier modelo basado en Whisper, puede generar texto plausible en pasajes de silencio, ruido o audio musical.
- Sin datos de benchmarks: no hay cifras publicadas de WER u otras metricas para esta conversion, lo que dificulta estimar su calidad real frente al modelo base.
- Dependencia de plataforma: al estar empaquetado para MLX, no puede ejecutarse en entornos CUDA o CPU genericos sin recurrir al modelo base.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un trabajo derivado conviene respetar la atribucion al modelo base y revisar los terminos del corpus ReazonSpeech subyacente.
- Alucinacion y calidad en audio de baja relacion senal-ruido: el rendimiento puede degradarse en grabaciones con mucho ruido de fondo o acentos atipicos.
- No se documentan funciones de diarizacion, traduccion ni deteccion de emociones.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/masahiroid/kotoba-whisper-v2.0-mlx
- Modelo base en HuggingFace: https://huggingface.co/kotoba-tech/kotoba-whisper-v2.0
- Repositorio GitHub de Kotoba Technologies: https://github.com/kotoba-tech/kotoba-whisper
- Conversion MLX alternativa: https://huggingface.co/kaiinui/kotoba-whisper-v2.0-mlx
- Framework MLX: https://github.com/ml-explore/mlx
- Script de conversion de whisper en mlx-examples: https://github.com/ml-explore/mlx-examples/blob/main/whisper/convert.py
- Ficha en Inferix: https://inferix.co/models/kotoba-tech/kotoba-whisper-v2.0
- Ficha de benchmarks en hf-model-benchmarks: https://0xsero.github.io/hf-model-benchmarks/models/kotoba-tech__kotoba-whisper-v2.0--616129.html
