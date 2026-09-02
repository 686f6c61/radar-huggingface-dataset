# FredrikKarlssonSpeech/whisper-large-finnish-v3-mlx

## Resumen

Este modelo es una conversión a formato MLX del modelo `Finnish-NLP/whisper-large-finnish-v3`, un sistema de reconocimiento automático del habla (ASR) especializado en finlandés, desarrollado por FredrikKarlssonSpeech. La conversión está pensada para ejecutarse de forma eficiente en hardware Apple Silicon mediante la librería `mlx-whisper`, lo que permite transcribir audio en finlandés con baja latencia en entornos locales.

El modelo original, `whisper-large-finnish-v3`, es un fine-tuning de Whisper large-v3 de OpenAI, adaptado específicamente al idioma finlandés. Esta versión MLX mantiene la misma arquitectura y pesos, pero en formato float16, optimizado para el framework MLX de Apple. Es relevante porque ofrece una vía práctica para desplegar ASR en finlandés en dispositivos Mac sin depender de servicios en la nube, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 (conversion MLX) |
| Idiomas soportados | fi (finlandes) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors para MLX) |

## Arquitectura y entrenamiento

El modelo es una conversion directa de `Finnish-NLP/whisper-large-finnish-v3` al formato MLX, realizada con el script `convert.py` de `mlx-examples` a precision float16. La arquitectura subyacente es la del Whisper large-v3 de OpenAI, un transformer encoder-decoder con atencion multi-cabeza y normalizacion pre-layer, disenado para reconocimiento de voz robusto en multiples idiomas. El modelo base fue fine-tuneado para finlandes, aunque no se dispone de detalles sobre el dataset de entrenamiento, el numero de tokens ni el proceso de ajuste en la informacion proporcionada.

La conversion MLX no altera los pesos ni la arquitectura; simplemente adapta el formato para aprovechar las operaciones optimizadas de MLX en Apple Silicon. No se mencionan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en esta version.

## Capacidades

- Transcripcion de audio en finlandes a texto.
- Reconocimiento del habla robusto basado en el modelo Whisper large-v3, que incluye soporte para puntuacion y mayusculas.
- Inferencia local en Apple Silicon mediante `mlx-whisper`, con ejecucion desde linea de comandos o API Python.
- No se documentan capacidades adicionales como traduccion, diarizacion o identificacion de hablantes en esta conversion.

## Casos de uso

- Transcripcion de reuniones y entrevistas en finlandes: el modelo puede procesar grabaciones de audio largas y generar texto con timestamping, util para actas o analisis posterior.
- Subtitulado automatico de videos en finlandes: integrable en pipelines de postproduccion para generar subtitulos en tiempo real o por lotes.
- Asistentes de voz locales para finlandes: al ejecutarse en Apple Silicon, permite construir aplicaciones de dictado o control por voz sin conexion, respetando la privacidad de los datos.
- Accesibilidad para personas con discapacidad auditiva: conversion de contenido hablado en finlandes a texto en aplicaciones educativas o de medios.
- Analisis de llamadas de atencion al cliente en finlandes: transcripcion de grabaciones para busqueda de palabras clave o evaluacion de calidad.
- Investigacion linguistica: transcripcion de corpus orales en finlandes para estudios foneticos o de variacion dialectal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como WER (Word Error Rate) ni comparaciones con otros modelos ASR para finlandes.

## Requisitos de hardware

- Requiere hardware Apple Silicon (serie M1 o posterior) para ejecutar MLX de forma nativa.
- La VRAM estimada depende del tamano del modelo; al ser una conversion float16 de Whisper large, se estima que necesita alrededor de 3 GB de memoria unificada, aunque no se confirma oficialmente.
- Se puede ejecutar en Macs con 8 GB de RAM o superior, aunque se recomienda al menos 16 GB para audios largos o procesamiento por lotes.
- Opciones de despliegue: `mlx-whisper` (linea de comandos o Python), tambien se puede integrar en aplicaciones Swift o Python con la libreria MLX.
- Latencia y throughput no disponibles; dependen del modelo de chip y la longitud del audio.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con modelos alternativos. Como referencia cualitativa:

| Modelo | Formato | Idioma | Licencia | Hardware objetivo |
|---|---|---|---|---|
| FredrikKarlssonSpeech/whisper-large-finnish-v3-mlx | MLX float16 | fi | Apache 2.0 | Apple Silicon |
| Finnish-NLP/whisper-large-finnish-v3 | PyTorch (original) | fi | Apache 2.0 | GPU/CPU general |
| OpenAI Whisper large-v3 | PyTorch | multilingue | MIT | GPU/CPU general |

La version MLX ofrece la ventaja de estar optimizada para Apple Silicon, mientras que el original requiere un entorno PyTorch convencional. Whisper large-v3 de OpenAI cubre muchos idiomas pero no esta especificamente afinado para finlandes.

## Limitaciones y advertencias

- No se han documentado sesgos especificos, pero al ser un modelo entrenado con datos en finlandes, puede reflejar sesgos presentes en ese corpus.
- Riesgo de alucinacion en fragmentos de audio ambiguos o con ruido, comun en modelos ASR.
- Limitado al idioma finlandes; no soporta otros idiomas de forma nativa en esta conversion.
- Requiere hardware Apple Silicon; no es ejecutable en GPU NVIDIA o CPU x86 sin convertir el modelo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original para confirmar restricciones adicionales.
- No se proporcionan metadatos sobre la calidad de la transcripcion en acentos o dialectos finlandeses; se recomienda evaluar en el dominio de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FredrikKarlssonSpeech/whisper-large-finnish-v3-mlx
- Modelo original: https://huggingface.co/Finnish-NLP/whisper-large-finnish-v3
- Version ONNX del mismo autor: https://huggingface.co/FredrikKarlssonSpeech/whisper-large-finnish-v3-onnx
- Repositorio de mlx-whisper: https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
