# efficient-speech/VibeVoice-ASR-MLX-BF16

## Resumen

VibeVoice-ASR-MLX-BF16 es una conversión a formato MLX en bfloat16 del modelo de reconocimiento automático del habla (ASR) VibeVoice-ASR, desarrollado originalmente por Microsoft. La conversión la firma efficient-speech y está pensada para ejecutarse en hardware Apple Silicon mediante el framework MLX de Apple. El modelo transcribe voz y, además del texto, produce marcas temporales y etiquetas de hablante, lo que lo sitúa en la categoría de ASR con diarización integrada.

El modelo cuenta con 8.330.325.888 parámetros (aproximadamente 8,3 mil millones) según los pesos en safetensors, y el repositorio ocupa 16,7 GB, coherente con pesos en bfloat16 (2 bytes por parámetro). Incluye un tokenizador de texto heredado de Qwen2.5-7B, distribuido bajo licencia Apache 2.0, mientras que los pesos del modelo se publican bajo licencia MIT.

La relevancia de esta ficha es doble: por un lado, acerca un modelo ASR de gran tamano al ecosistema local de Apple (MLX); por otro, acompana al sistema de inferencia Murmur, orientado a reconocimiento de voz de formato largo. La conversión se validó con `mlx-audio==0.6.8` y los shards de pesos coinciden byte a byte con el checkpoint de referencia de mlx-community.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR basado en VibeVoice-ASR de Microsoft; pesos en MLX) |
| Parametros totales | 8.330.325.888 (~8,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (esta version); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT (pesos); tokenizador Qwen2.5-7B bajo Apache 2.0 |
| Formato de pesos | safetensors (MLX, bfloat16) |

## Arquitectura y entrenamiento

No se dispone de detalles tecnicos de la arquitectura interna en la informacion proporcionada. El modelo base es microsoft/VibeVoice-ASR, y esta version es una conversion de pesos a MLX bfloat16 realizada por efficient-speech. La model card indica que los shards de pesos serializados coinciden byte a byte con el checkpoint de referencia de MLX (mlx-community/VibeVoice-ASR-bf16), lo que sugiere una conversion fiel sin reentrenamiento.

El pipeline declarado es `automatic-speech-recognition` y la libreria es `mlx`, lo que implica que la inferencia esta optimizada para el framework de Apple. El tokenizador de texto procede de Qwen2.5-7B (Apache 2.0). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La conversion se probo con la version `mlx-audio==0.6.8`.

## Capacidades

- Transcripcion de voz a texto (ASR) con pipeline `automatic-speech-recognition`.
- Generacion de marcas temporales (timestamps) junto con la transcripcion.
- Etiquetado de hablante (speaker labels), es decir, diarizacion integrada en la salida.
- Orientado a reconocimiento de voz de formato largo, segun el sistema Murmur que acompana la release.
- Inferencia en hardware Apple Silicon mediante MLX.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling, agentes, vision o audio adicional: no disponible.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo genera texto con marcas temporales y etiquetas de hablante, lo que permite reconstruir quien dijo que y cuando en una reunion grabada, sin necesidad de un post-procesado de diarizacion separado.
- Subtitulado y generacion de subtitulos con marcas de tiempo: las timestamps nativas facilitan alinear la transcripcion con el video para producir subtitulos sincronizados.
- Analisis de entrevistas y research cualitativo: la diarizacion permite separar entrevistador y entrevistado en transcripciones largas, agilizando el etiquetado posterior.
- Procesamiento local en Mac: al estar en formato MLX, puede ejecutarse en equipos Apple Silicon sin depender de GPU NVIDIA ni de servicios en la nube, util para entornos con requisitos de privacidad.
- Pipelines de formato largo con Murmur: el modelo se integra en el sistema Murmur para reconocimiento de audio de larga duracion, adecuado para podcasts, clases o audiencias.
- Prototipado e investigacion en ASR: al ser una conversion fiel del checkpoint de referencia, sirve para reproducir resultados y experimentar con el modelo base en el ecosistema MLX.
- Archivado y busqueda de audio: transcribir grabaciones con timestamps permite indexar y buscar fragmentos concretos dentro de un archivo de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos en bfloat16 ocupan aproximadamente 16,7 GB; se necesita memoria suficiente para pesos mas activaciones y cache, por lo que se recomienda disponer de al menos 24-32 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (MLX). No se indica soporte para GPU NVIDIA en esta version.
- Cabe en consumer hardware: si, en equipos Apple con memoria unificada suficiente (por ejemplo, configuraciones de 32 GB o superiores); en configuraciones de 16 GB el margen es muy ajustado.
- Opciones de despliegue: `mlx-audio` (probado con la version 0.6.8) mediante `python -m mlx_audio.stt.generate`; el sistema Murmur para formato largo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/ecosistema | Notas |
|---|---|---|---|---|---|
| efficient-speech/VibeVoice-ASR-MLX-BF16 | ~8,3 B | no disponible | MIT | MLX (Apple Silicon) | Conversion bf16 del modelo de Microsoft, con timestamps y diarizacion |
| microsoft/VibeVoice-ASR | no disponible | no disponible | no disponible | no disponible | Modelo base original |
| mlx-community/VibeVoice-ASR-bf16 | no disponible | no disponible | no disponible | MLX | Checkpoint de referencia; los pesos de esta ficha coinciden byte a byte |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del modelo en la informacion proporcionada.
- Riesgo de alucinacion en la transcripcion: no cuantificado; conviene validar en dominios ruidosos o con acentos no representados.
- Idiomas soportados no especificados: no se puede garantizar cobertura multilingue sin verificar el modelo base.
- Longitud de contexto no disponible: el comportamiento en audios muy largos depende de la implementacion (Murmur) y no esta documentado aqui.
- Restricciones de licencia: los pesos son MIT, pero el tokenizador de Qwen2.5-7B es Apache 2.0, por lo que hay que respetar ambas licencias en uso comercial.
- Dependencia de hardware Apple Silicon: esta version MLX no esta pensada para GPU NVIDIA ni para despliegues en servidores x86 convencionales.
- Repositorio con 0 descargas y 0 likes: ecosistema y soporte comunitario practicamente inexistentes en el momento de la consulta.
- Version de `mlx-audio` fijada en 0.6.8 para la validacion: posibles incompatibilidades con versiones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efficient-speech/VibeVoice-ASR-MLX-BF16
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR
- Checkpoint de referencia MLX: https://huggingface.co/mlx-community/VibeVoice-ASR-bf16
- Tokenizador Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Sistema Murmur: https://github.com/uw-syfi/Murmur
