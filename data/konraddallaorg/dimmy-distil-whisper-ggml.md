# KonradDallaOrg/dimmy-distil-whisper-ggml

## Resumen

`dimmy-distil-whisper-ggml` es un espejo sin modificaciones de los ficheros cuantizados en formato GGML del modelo de reconocimiento automatico del habla (ASR) `distil-whisper/distil-large-v3.5`, publicado por el usuario KonradDallaOrg para que la aplicacion Dimmy no dependa de que los repositorios originales sigan disponibles. No se trata de un modelo entrenado o ajustado por este autor: los ficheros son byte a byte identicos a los del repositorio upstream de Pomni en la revision `714de4d2bab7d93d962fd7a0febd86fb534d0c07`, y el modelo base original fue desarrollado por Hugging Face bajo licencia MIT.

El modelo resuelve transcripcion de voz a texto en ingles en local, orientada a dictado y carga de ficheros de audio dentro de la aplicacion Dimmy. Al estar en formato GGML, esta pensado para inferencia en CPU o GPU de gama baja mediante `whisper.cpp` y ecosistemas compatibles, sin necesidad de infraestructura de servidor. El repositorio ocupa 1,4 GB e incluye unicamente dos cuantizaciones: `q8_0` (818 MB) y `q5_0` (538 MB).

La relevancia de esta ficha es limitada desde el punto de vista de investigacion: no aporta pesos nuevos, ni datos de entrenamiento propios, ni benchmarks. Su interes practico reside en la trazabilidad (hashes SHA-256 verificables) y en servir como dependencia estable para una aplicacion de escritorio concreta. Para cualquier evaluacion tecnica del modelo subyacente conviene consultar la model card de `distil-whisper/distil-large-v3.5`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo base: distil-whisper, derivado de Whisper, encoder-decoder transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s; no confirmado en la informacion) |
| Tipos de cuantizacion | GGML `q8_0` y `q5_0` |
| Idiomas soportados | ingles (segun la model card: "Local English speech-to-text") |
| Licencia | MIT |
| Formato de pesos | GGML (`.bin`) |
| Tamano de los ficheros | `q8_0`: 818.305.955 B; `q5_0`: 537.819.875 B |
| Modelo base | `distil-whisper/distil-large-v3.5` |
| Repositorio upstream | `Pomni/distil-large-v3.5-ggml-allquants`, revision `714de4d2bab7d93d962fd7a0febd86fb534d0c07` |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento ni ajuste alguno por parte del autor: es un espejo de ficheros ya cuantizados. La arquitectura corresponde al modelo base `distil-whisper/distil-large-v3.5`, un modelo de la familia Whisper destilado (distil-whisper) a partir de un modelo Whisper grande, con arquitectura encoder-decoder transformer orientada a ASR. La informacion proporcionada no detalla el numero de parametros, la composicion del dataset de destilacion, ni si hubo etapas de RLHF o DPO; esos datos deben consultarse en la model card del modelo base.

La unica transformacion documentada es la cuantizacion a GGML realizada por el usuario Pomni, con dos niveles (`q8_0` y `q5_0`), que reducen el peso del modelo para ejecucion local. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras) en la informacion disponible.

## Capacidades

- Transcripcion de voz a texto en ingles (ASR) sobre audio local.
- Orientado a dictado en tiempo real y a transcripcion de ficheros de audio cargados por el usuario.
- Ejecucion local mediante el formato GGML, sin dependencia de servicios en la nube.
- Dos niveles de cuantizacion para adaptar el consumo de memoria al hardware disponible.
- No se documentan capacidades de traduccion, identificacion de hablante, marcas de tiempo, tool calling ni razonamiento multi-paso en la informacion proporcionada.

## Casos de uso

- Dictado en aplicaciones de escritorio: el modelo `q5_0` (538 MB) permite transcribir voz a texto en local dentro de una app tipo Dimmy, sin enviar audio a servidores externos y con un consumo de disco reducido.
- Transcripcion de notas de voz y reuniones en ingles: carga de ficheros de audio para obtener texto editable, adecuado para flujos personales donde la privacidad del audio es prioritaria.
- Subtitulado rapido de contenido en ingles: uso del modelo `q8_0` (818 MB) para generar transcripciones de mayor fidelidad cuando la precision prima sobre el tamano.
- Integracion en pipelines de accesibilidad: conversion de audio a texto en herramientas de asistencia para personas con dificultades auditivas, ejecutandose en el propio dispositivo.
- Prototipado de asistentes por voz: punto de partida para desarrolladores que necesitan un motor ASR ligero en ingles antes de escalar a modelos mayores o multilingues.
- Dependencia estable para distribucion de software: al ser un espejo con hashes SHA-256 verificables, sirve para fijar una version concreta del modelo en el empaquetado de una aplicacion, evitando roturas si el repositorio upstream cambia o desaparece.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye metricas de WER, latencia ni throughput, y no se proporcionan datos del modelo base en esta ficha.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero `q5_0` ocupa 538 MB y el `q8_0` 818 MB en disco; el consumo en memoria es del orden de esas cifras mas el overhead del runtime (no cuantificado en la informacion).
- GPU recomendadas: no disponible. Al ser GGML, esta disenado para ejecucion en CPU, con soporte opcional de aceleracion por GPU segun el runtime.
- GPU de consumo: por tamano, deberia caber en cualquier GPU de consumo moderna, pero no se confirma en la informacion proporcionada.
- Opciones de despliegue: `whisper.cpp` y runtimes compatibles con GGML. No se documenta soporte de vLLM, TGI, llama.cpp (orientado a LLM) ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| dimmy-distil-whisper-ggml (este) | no disponible | no disponible | ingles | MIT | GGML (`q8_0`, `q5_0`) | Espejo de `distil-large-v3.5` |
| distil-whisper/distil-large-v3.5 | no disponible | no disponible | no disponible en esta ficha | MIT | safetensors (upstream) | Modelo base original de Hugging Face |
| Pomni/distil-large-v3.5-ggml-allquants | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | GGML (todas las cuantizaciones) | Fuente directa del espejo; ofrece mas cuantizaciones |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas como Whisper large-v3 o faster-whisper.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; no se documenta multilingue.
- Es un espejo sin modificaciones: no incorpora mejoras, correcciones ni ajustes propios del autor.
- No se publican benchmarks ni evaluaciones de calidad (WER) en la informacion disponible.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, especialmente en audio con ruido, acentos marcados o vocabulario tecnico; no cuantificado aqui.
- Solo se ofrecen dos cuantizaciones (`q8_0` y `q5_0`); para otras variantes hay que acudir al repositorio upstream de Pomni.
- Licencia MIT, lo que permite uso comercial, pero la atribucion corresponde a Hugging Face (distil-whisper) y a Pomni (cuantizacion); conviene conservar los avisos de licencia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- Dependencia de la aplicacion Dimmy: el modelo esta empaquetado para ese caso de uso concreto y no se documenta su integracion con otros ecosistemas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KonradDallaOrg/dimmy-distil-whisper-ggml
- Modelo base: https://huggingface.co/distil-whisper/distil-large-v3.5
- Repositorio upstream de cuantizaciones GGML: https://huggingface.co/Pomni/distil-large-v3.5-ggml-allquants
- Revision upstream fijada: https://huggingface.co/Pomni/distil-large-v3.5-ggml-allquants/tree/714de4d2bab7d93d962fd7a0febd86fb534d0c07
