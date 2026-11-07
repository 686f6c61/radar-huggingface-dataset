# lineofflight/pocket-tts-kokoro-voices

## Resumen

`lineofflight/pocket-tts-kokoro-voices` es un repositorio de estados de voz (voice states) para Pocket TTS, el modelo de sintesis de voz de Kyutai. No contiene pesos de un modelo de lenguaje ni un modelo TTS completo, sino los ficheros `.safetensors` que Pocket TTS carga para hablar con una voz concreta. El autor, `lineofflight`, ha clonado las 37 voces de Kokoro-82M de hexgrad y ha generado, para cada una, un estado por cada uno de los siete modelos de idioma de Pocket TTS (ingles, frances, aleman, espanol, portugues, italiano y neerlandes).

El interes practico es inmediato para quien use Pocket TTS: el paquete original de Kyutai incluye un conjunto limitado de voces, y este repositorio amplia el catalogo reutilizando voces ya conocidas y evaluadas por la comunidad de Kokoro. Cada voz pasa a estar disponible en los siete idiomas que soporta Pocket, aunque la calidad del clon dependera de la calidad de la grabacion original de Kokoro en ese idioma.

El repositorio ocupa 1,6 GB, se distribuye bajo licencia CC BY 4.0 y no tiene descargas ni likes en el momento de la consulta. No es un modelo entrenado desde cero: es un artefacto derivado que depende de la version concreta de Pocket TTS con la que se genero cada estado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Estados de cache de atencion para el transformer de Pocket TTS (Kyutai); no es un modelo autonomo |
| Parametros totales | no disponible (los estados son tensores de cache, no pesos de un modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (cada estado cubre 101-127 posiciones; 249 en `bf_emma` para espanol y portugues) |
| Tipos de cuantizacion | no disponible; los estados se almacenan en float32 |
| Idiomas soportados | en, fr, de, es, pt, it, nl (siete modelos de idioma de Pocket TTS) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (estados) y WAV 24 kHz mono (muestras de audio) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Cada fichero `<modelo>/<voz>.safetensors` es la salida de la funcion `export_model_state` de Kyutai aplicada a Pocket TTS: para cada una de las seis capas del transformer se guarda el tensor `transformer.layers.<i>.self_attn/cache` en float32 con forma `[2, 1, n, 16, 64]`, acompanado de su `offset` y su `pad`. Es decir, se almacena el estado de la cache de atencion que Pocket TTS construye tras escuchar una grabacion corta de la voz, no los pesos del modelo.

El proceso de creacion consiste en clonar cada voz de Kokoro-82M (un modelo TTS de 82 M de parametros de hexgrad) hacia el espacio de estados de Pocket TTS. Como cada estado solo es valido para el modelo de idioma con el que se genero, el repositorio organiza los ficheros en carpetas por modelo (`english_2026-10/`, `french/`, `german/`, `spanish/`, `portuguese/`, `italian/`, `dutch/`). Los estados ocupan entre 5 y 6 MB por voz y modelo, salvo los de `bf_emma` en espanol y portugues, que son de 12 MB y 249 posiciones.

## Capacidades

- Sintesis de voz en siete idiomas (ingles, frances, aleman, espanol, portugues, italiano y neerlandes) usando las voces clonadas de Kokoro.
- Reutilizacion de 37 voces de Kokoro-82M, con voces masculinas y femeninas y variantes de ingles americano y britanico.
- Carga directa como estados de voz en Pocket TTS mediante la API del paquete de Kyutai.
- Muestras de audio de referencia en WAV 24 kHz mono para preescuchar cada voz antes de integrarla.
- Inventario con hashes SHA-256 y tamanos (`FILES.txt`) para verificar la integridad de los ficheros.
- No incluye capacidades de razonamiento, codigo, tool calling ni agentes: es exclusivamente un artefacto de voces para TTS.

## Casos de uso

- Ampliacion del catalogo de voces en una instalacion de Pocket TTS: se copia la carpeta del modelo de idioma correspondiente y se selecciona la voz deseada, sin reentrenar ni ajustar nada.
- Prototipado rapido de asistentes de voz multilingues: una misma voz (por ejemplo `af_heart`) puede usarse en ingles, frances, aleman, espanol, portugues, italiano y neerlandes, lo que simplifica la coherencia de marca en demos.
- Audiolibros y narracion: las voces con mejor nota en Kokoro (A, A-) ofrecen una base mas fiable para lectura de texto largo, y las muestras WAV permiten evaluar el timbre antes de integrar.
- Localizacion de contenidos: un mismo guion traducido a varios idiomas puede sintetizarse manteniendo la identidad de voz, util para videos corporativos o material formativo.
- Accesibilidad: conversion de texto a voz en aplicaciones para personas con discapacidad visual, eligiendo la voz y el idioma segun la preferencia del usuario.
- Evaluacion comparativa de voces: al disponer de 37 voces y muestras de audio, se puede hacer una seleccion objetiva (escucha ciega, MOS interno) antes de fijar una voz en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la nota de calidad que Kokoro asigna a cada voz (A, A-, B-, C+, C, C-, D, F+), que es una estimacion de la calidad y cantidad de los datos de entrenamiento originales, no una metrica del clon. Kokoro no asigna nota a las voces de espanol ni de portugues.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este repositorio; depende del modelo Pocket TTS que cargue los estados, no de los estados en si (5-12 MB por fichero).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el requisito lo marca Pocket TTS, no estos estados.
- Opciones de despliegue: mediante la libreria `pocket-tts` de Kyutai, que es la unica via documentada para cargar estos estados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `lineofflight/pocket-tts-kokoro-voices` | no aplica (estados de cache) | 7 | CC BY 4.0 | safetensors + WAV | Voces clonadas para Pocket TTS |
| Kokoro-82M (hexgrad) | 82 M | 9 grupos de idioma (segun fuentes web) | no disponible en la informacion | no disponible | Modelo TTS completo; origen de las voces |
| Pocket TTS (Kyutai) | no disponible | 7 | no disponible | no disponible | Modelo TTS base; incluye sus propias voces |

## Limitaciones y advertencias

- No es un modelo autonomo: sin Pocket TTS de Kyutai no se puede usar. Un estado solo funciona con el modelo de idioma con el que se genero; hay que tomar el fichero de la carpeta correcta.
- La calidad del clon hereda la de la grabacion original de Kokoro. Las voces con nota D o F+ en Kokoro (por ejemplo `af_jessica`, `am_adam`) probablemente suenen mas pobres o menos naturales.
- Kokoro no evalua las voces de espanol ni de portugues, por lo que no hay referencia de calidad para esos idiomas; `bf_emma` ademas usa un estado de mayor tamano (249 posiciones, 12 MB).
- Riesgo de alucinacion y sesgos: no aplica en el sentido de un LLM, pero la prosodia, el acento y la naturalidad pueden desviarse del original, especialmente en idiomas distintos del de la grabacion fuente.
- Licencia CC BY 4.0: permite uso comercial con atribucion; hay que citar al autor del repositorio y respetar las condiciones de Kokoro-82M y de Pocket TTS, cuyas licencias no se detallan en la informacion disponible.
- Sin descargas ni validacion de la comunidad en el momento de la consulta: conviene verificar los hashes de `FILES.txt` y probar las muestras antes de integrarlo en produccion.
- Dependencia de version: los estados se generaron contra una version concreta de Pocket TTS (`english_2026-10` y los modelos de seis capas); cambios en el modelo base pueden invalidarlos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lineofflight/pocket-tts-kokoro-voices
- Pocket TTS (Kyutai): https://huggingface.co/kyutai/pocket-tts
- Kokoro-82M (hexgrad): https://huggingface.co/hexgrad/Kokoro-82M
- Lista de voces de Kokoro (VOICES.md): https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- Kokoro TTS en TTS.ai: https://tts.ai/voices/kokoro/
- Guia de Kokoro TTS en OfflineTTS: https://www.offlinetts.com/blog/kokoro-tts-complete-guide/
