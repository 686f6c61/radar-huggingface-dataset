# Eddy-Emmanuel/churro-3B-road

## Resumen

El repositorio `Eddy-Emmanuel/churro-3B-road` aloja un modelo con el nombre "churro-3B-road", que por su denominación y los resultados de búsqueda web parece estar relacionado con **CHURRO**, un modelo de visión-lenguaje (VLM) de 3 000 millones de parámetros desarrollado por el Stanford Open Virtual Assistant Lab (stanford-oval) para el reconocimiento de texto histórico. CHURRO está especializado en transcribir documentos manuscritos e impresos de épocas pasadas, incluyendo lenguas muertas y variantes históricas, y se entrenó sobre el conjunto de datos CHURRO-DS, que unifica 155 corpus históricos con casi 100 000 páginas.

Sin embargo, la model card de este repositorio concreto es una plantilla genérica generada automáticamente, sin información específica sobre el modelo, su autoría, licencia o detalles técnicos. El autor del repositorio es "Eddy-Emmanuel", no el equipo de Stanford, y no se proporciona ninguna documentación adicional. Por tanto, aunque el nombre sugiere una relación con el proyecto CHURRO, no hay confirmación de que este repositorio contenga exactamente el mismo modelo, una variante o un archivo incompleto. El tamaño del repositorio es de 0,2 GB, lo que resulta pequeño para un modelo de 3B parámetros en formato safetensors (que normalmente ocupa varios GB), lo que refuerza la incertidumbre sobre su contenido real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (VLM) según la informacion publica de CHURRO; no confirmado en este repositorio |
| Parametros totales | 3 000 millones (segun la informacion publica de CHURRO); no confirmado en este repositorio |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 46 clusters de idiomas historicos segun la informacion publica de CHURRO; no confirmado en este repositorio |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun los tags del repositorio) |

## Arquitectura y entrenamiento

La informacion publica sobre el proyecto CHURRO indica que se trata de un VLM de 3B parametros entrenado sobre CHURRO-DS, el mayor conjunto de datos de reconocimiento de texto historico hasta la fecha. Dicho conjunto unifica 155 corpus historicos que suman 99 491 paginas, abarcando 22 siglos de patrimonio textual en 46 clusters de idiomas, incluyendo variantes historicas y lenguas muertas. El modelo se diseno para lograr alta precision en la transcripcion de documentos dificiles de leer, con un coste operativo reducido.

No obstante, la model card de este repositorio no ofrece ningun detalle sobre la arquitectura concreta, el proceso de entrenamiento, los hiperparametros o los datos utilizados. Toda la informacion anterior procede de la documentacion publica del proyecto CHURRO original (stanford-oval), no de este repositorio especifico. No se puede confirmar que el modelo alojado aqui haya sido entrenado de la misma manera ni con los mismos datos.

## Capacidades

Segun la informacion publica del proyecto CHURRO, el modelo es capaz de:

- Reconocimiento de texto manuscrito e impreso en documentos historicos.
- Transcripcion de lenguas muertas y variantes historicas.
- Procesamiento de imagenes de paginas escaneadas de archivos, bibliotecas y colecciones.
- Integracion en flujos de trabajo de OCR mediante una API de Python y una interfaz de linea de comandos.

Sin embargo, estas capacidades corresponden al modelo CHURRO original. Para el repositorio `Eddy-Emmanuel/churro-3B-road` no se proporciona ninguna informacion sobre sus capacidades reales, y no se puede verificar si el archivo alojado funciona como un VLM o si es un archivo corrupto o incompleto.

## Casos de uso

Dado que la informacion disponible es insuficiente para confirmar el contenido del repositorio, los casos de uso que se indican a continuacion se basan en el proyecto CHURRO original y solo serian aplicables si este repositorio contiene efectivamente ese modelo:

- Digitalizacion de archivos historicos: transcripcion automatica de documentos manuscritos de los siglos XVII y XVIII para su indexacion y busqueda.
- Investigacion genealogica: conversion de registros parroquiales y censos antiguos a texto estructurado.
- Humanidades digitales: creacion de corpus textuales a partir de colecciones de bibliotecas digitales.
- Preservacion cultural: transcripcion de lenguas muertas o variantes dialectales historicas.
- Enriquecimiento de metadatos: generacion de texto legible a partir de escaneos de baja calidad para su catalogacion.
- Integracion en plataformas de archivo: uso como motor de OCR en sistemas de gestion documental para instituciones culturales.

En cualquier caso, antes de utilizar este repositorio en un proyecto real, es imprescindible verificar su contenido y su correspondencia con el modelo CHURRO original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible de este repositorio. La model card no incluye ninguna metrica de evaluacion. La documentacion publica del proyecto CHURRO menciona que el modelo supera a Gemini 2.5 Pro en precision sobre el conjunto de prueba CHURRO-DS, con un coste 15,5 veces menor, pero no se ofrecen cifras concretas en los resultados de busqueda. No se dispone de datos numericos de MMLU, HumanEval, GSM8K u otros benchmarks estandar, ya que se trata de un modelo especializado en OCR historico y no en tareas genericas de lenguaje.

## Requisitos de hardware

No se dispone de informacion especifica sobre requisitos de hardware para este repositorio. Dado que el modelo original CHURRO tiene 3B parametros, se puede estimar que:

- La VRAM necesaria para inferencia en precision FP16 rondaria los 6-8 GB, dependiendo de la longitud de la secuencia y del tamaño de la imagen.
- Con cuantizacion a 8 bits, podria caber en GPUs con 4-6 GB de VRAM.
- GPUs como la RTX 3060, RTX 4060 o superiores serian suficientes para ejecutar el modelo en local.
- Para despliegue en produccion, se podrian usar frameworks como vLLM, TGI o llama.cpp, aunque no hay confirmacion de compatibilidad con este repositorio concreto.

Estas estimaciones son orientativas y no sustituyen a una verificacion real del modelo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable. El modelo CHURRO original se posiciona como una alternativa de codigo abierto a soluciones comerciales de OCR historico como Gemini 2.5 Pro o GPT-4V, pero no se conocen otros modelos de codigo abierto especializados en este dominio con los que comparar directamente. Ademas, al no confirmarse que este repositorio contenga el modelo CHURRO real, cualquier comparativa seria especulativa.

## Limitaciones y advertencias

- La model card de este repositorio es una plantilla generica sin informacion real sobre el modelo, su entrenamiento, licencia o limitaciones.
- El tamaño del repositorio (0,2 GB) es notablemente inferior al esperado para un modelo de 3B parametros en safetensors, lo que sugiere que el archivo podria estar incompleto, corrupto o no ser el modelo CHURRO original.
- No se puede confirmar la procedencia del modelo ni si ha sido modificado respecto al original de Stanford.
- No se indica ninguna licencia, por lo que su uso comercial es juridicamente incierto.
- Si el modelo es una copia de CHURRO, heredaria las limitaciones de ese modelo: posibles errores en la transcripcion de escrituras muy degradadas, sesgos en la representacion de ciertas lenguas o caligrafias, y dependencia de la calidad de las imagenes de entrada.
- No se recomienda su uso en produccion sin una validacion exhaustiva del contenido del repositorio y de su comportamiento real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Eddy-Emmanuel/churro-3B-road
- Proyecto CHURRO original (GitHub): https://github.com/stanford-oval/Churro
- Coleccion de modelos CHURRO en Hugging Face: https://huggingface.co/collections/stanford-oval/churro
- Paper de CHURRO (arXiv): https://arxiv.org/pdf/2509.19768
