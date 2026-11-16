# Phoonnx/glowtts-en_us-ljspeech-rhasspy-gruut

## Resumen

GlowTTS en_us ljspeech rhasspy gruut es un modelo de sintesis de voz (text-to-speech) en ingles estadounidense, empaquetado en formato ONNX por Phoonnx para su uso con su libreria de inferencia `phoonnx`. El modelo original procede del proyecto Larynx de Rhasspy (version 1.0), una iniciativa de sintesis de voz orientada a asistentes de voz offline y sistemas de domotica. Phoonnx se limita a repaquetar los pesos originales en ONNX y a integrarlos en su ecosistema de plugins, incluyendo el plugin `ovos-tts-plugin-phoonnx` para el asistente OVOS/Mycroft.

La arquitectura es Glow-TTS, un modelo de sintesis acustica basado en normalizing flows que genera espectrogramas a partir de fonemas IPA, que posteriormente son convertidos a audio por un vocoder HiFi-GAN (concretamente `hifigan-multi-vctk-small`). El front-end de texto no forma parte del modelo: la normalizacion y la fonemizacion se delegan a la libreria `scriptconv` mediante el fonemizador Gruut.

El interes de este modelo es acotado pero claro: ofrece una voz femenina en ingles derivada del corpus LJSpeech, ligera (el repositorio ocupa aproximadamente 0,1 GB) y desplegable en entornos sin GPU, pensada para asistentes de voz locales, prototipos de TTS y pipelines donde se prioriza la latencia y el funcionamiento offline sobre la naturalidad maxima. No es un modelo de proposito general ni compite con los sistemas TTS neuronales modernos de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow) + vocoder HiFi-GAN (`hifigan-multi-vctk-small`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ingles estadounidense (`en-US`) |
| Licencia | `other` (sin licencia registrada; consultar el release upstream de Larynx) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder asociado | `Phoonnx/hifigan-multi-vctk-small` |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | `phoonnx` |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo de sintesis acustica que emplea normalizing flows para modelar la distribucion de espectrogramas mel condicionada a la secuencia de fonemas. A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS realiza una alineacion monotona mediante busqueda de camino mas probable (monotonic alignment search), lo que permite sintesis paralela y por tanto inferencia rapida y determinista. La salida del modelo es un espectrograma mel que se convierte en forma de onda mediante el vocoder HiFi-GAN referenciado en la model card.

El modelo original fue entrenado por Rhasspy sobre el corpus LJSpeech (audiolibro en ingles estadounidense de dominio publico, con una unica hablante), de ahi el identificador `en-us_ljspeech`. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens o horas de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de ajuste fino adicionales. La innovacion practica de este empaquetado no esta en el modelo en si, sino en su conversion a ONNX y su integracion con el ecosistema Phoonnx, que gestiona la descarga del vocoder junto con la voz y expone una API Python y un plugin para OVOS.

## Capacidades

- Sintesis de voz en ingles estadounidense a partir de texto plano, con salida en fichero WAV.
- Conversion de texto a fonemas IPA mediante el fonemizador Gruut (dependencia `scriptconv[gruut]`).
- Generacion de espectrogramas mel y conversion a audio mediante HiFi-GAN en un unico pipeline gestionado por `phoonnx`.
- Voz unica femenina derivada de LJSpeech (no es un modelo multi-hablante).
- Integracion con el asistente de voz OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion offline y en CPU gracias al formato ONNX y al reducido tamano del modelo.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de los LLM: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales: integrado en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, el modelo sintetiza respuestas del asistente sin conexion a internet, lo que encaja con despliegues de domotica y privacidad estricta.
- Lectura de notificaciones y alertas: en sistemas embebidos o Raspberry Pi, el modelo puede convertir mensajes cortos en audio con un consumo de recursos minimo gracias a su tamano de ~0,1 GB y su ejecucion en CPU.
- Prototipado rapido de interfaces de voz: desarrolladores que necesitan una voz en ingles para validar un flujo conversacional pueden instalar `phoonnx` y obtener audio en pocas lineas de Python, sin depender de servicios en la nube.
- Generacion de audiolibros o contenido narrado de forma automatizada: para textos en ingles, el modelo permite sintetizar pasajes por frases y concatenar los WAV resultantes en un pipeline por lotes.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual en entornos sin GPU.
- Pruebas de regresion en pipelines de TTS: al ser un modelo determinista y ligero, sirve como referencia estable para comparar cambios en el front-end de normalizacion de texto o en el vocoder.
- Investigacion en sintesis de voz: util como linea base Glow-TTS para experimentos academicos sobre alineacion, vocoders o fonemizacion, dado su bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0,1 GB) y el uso de ONNX, es esperable que funcione en CPU sin GPU dedicada, aunque no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible. El modelo no requiere GPU para un uso basico segun su naturaleza ONNX y su empaquetado ligero.
- Compatibilidad con GPU de consumo: previsiblemente si (cualquier GPU con soporte ONNX Runtime), aunque no se detalla en la model card.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime como backend subyacente. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Vocoder | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| GlowTTS en_us ljspeech rhasspy gruut (este modelo) | Glow-TTS | en-US | HiFi-GAN multi-vctk-small | ONNX | other | Empaquetado Phoonnx, voz unica LJSpeech |
| Piper (voces en_US) | VITS | en-US (multi-voz) | Integrado en VITS | ONNX | MIT (segun proyecto) | Alternativa moderna de Rhasspy para TTS offline |
| Larynx (otras voces Glow-TTS) | Glow-TTS | multi-idioma | HiFi-GAN | Diversos | Segun release upstream | Mismo origen, distintas voces e idiomas |
| Coqui TTS (modelos LJSpeech) | Tacotron2 / VITS | en-US | Diversos | PyTorch | MPL 2.0 (segun proyecto) | Ecosistema mas amplio, mayor peso computacional |

La comparativa se basa en caracteristicas generales de proyectos conocidos; no se dispone de datos de benchmarks que permitan comparar calidad objetiva entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo mono-hablante: solo reproduce una voz femenina derivada de LJSpeech; no permite seleccion de hablante ni clonacion.
- Idioma unico: unicamente ingles estadounidense; el texto en otros idiomas producira una pronunciacion incorrecta o fallos en la fonemizacion.
- Dependencia del front-end: requiere `scriptconv[gruut]` para la normalizacion y fonemizacion; sin esa dependencia el modelo no puede procesar texto directamente.
- Licencia ambigua: la model card indica explicitamente que no hay licencia registrada y recomienda consultar el release upstream de Larynx antes de cualquier uso. No se garantiza el uso comercial.
- Calidad acotada: al ser un modelo Glow-TTS de la generacion de Larynx v1.0, su naturalidad y prosodia estan por debajo de los sistemas TTS neuronales actuales; puede presentar artefactos en frases largas o con puntuacion compleja.
- Riesgo de errores de pronunciacion en palabras fuera del vocabulario o nombres propios, dependientes del fonemizador Gruut.
- Sin datos publicados de benchmarks, latencia ni consumo, lo que dificulta una evaluacion cuantitativa previa a produccion.
- Popularidad muy baja (19 descargas, 0 likes en el momento de la consulta), lo que implica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-ljspeech-rhasspy-gruut
- Repositorio upstream (Larynx v1.0, release): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_ljspeech-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
