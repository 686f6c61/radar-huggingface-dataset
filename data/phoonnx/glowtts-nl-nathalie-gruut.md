# Phoonnx/glowtts-nl-nathalie-gruut

## Resumen

GlowTTS-nl-nathalie-gruut es un modelo de sintesis de voz (text-to-speech) en neerlandes empaquetado en formato ONNX por Phoonnx. El modelo original es un Glow-TTS desarrollado por Rhasspy dentro del proyecto Larynx v1.0, y esta version lo redistribuye como parte de la coleccion de voces Glow-TTS de Phoonnx, una biblioteca de TTS basada en ONNX mantenida por TigreGotico. El modelo genera espectrogramas a partir de fonemas IPA procesados con el fonemizador gruut, y utiliza el vocoder hifigan-multi-vctk-small para convertir dichos espectrogramas en audio.

El modelo resuelve el problema de disponer de una voz neerlandesa ligera y ejecutable localmente en entornos con recursos limitados, integrable tanto en Python como en el ecosistema OVOS (Open Voice OS). Su relevancia actual radica en que permite sintesis de voz offline sin dependencias de servicios en la nube, con un peso de repositorio de aproximadamente 0,1 GB, lo que lo hace adecuado para asistentes de voz embebidos y despliegues en dispositivos de bajos recursos.

Se trata de una voz concreta (nathalie) dentro de un catalogo mas amplio de voces Glow-TTS empaquetadas por Phoonnx. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los detalles del dataset de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo de sintesis acustica basado en normalizing flows) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | neerlandes (`nl`) |
| Licencia | other (sin licencia registrada; consultar el release upstream de Rhasspy/Larynx) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es una arquitectura de sintesis acustica basada en normalizing flows que modela directamente la alineacion entre texto y espectrograma sin necesidad de un modelo de atencion autoregresivo explicito, lo que permite una sintesis paralela y rapida. El modelo produce un espectrograma mel que posteriormente es convertido a forma de onda por el vocoder HiFi-GAN (en esta version, la variante multi-vctk-small). La entrada no es texto crudo sino fonemas IPA generados por el fonemizador gruut, que Phoonnx invoca a traves de la libreria scriptconv.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino. El modelo procede del release v1.0 de Larynx de Rhasspy, un proyecto de sintesis de voz offline orientado a asistentes de voz; el empaquetado realizado por Phoonnx se limita a convertir y distribuir los pesos en ONNX junto con la integracion del vocoder.

## Capacidades

- Sintesis de voz (text-to-speech) en neerlandes a partir de texto de entrada.
- Conversion de texto a fonemas IPA mediante el fonemizador gruut antes de la sintesis.
- Generacion de espectrogramas mel y conversion a audio WAV mediante el vocoder HiFi-GAN.
- Ejecucion local y offline mediante ONNX, sin dependencia de servicios externos.
- Integracion en Python a traves de `phoonnx.model_manager.TTSModelManager`.
- Integracion en el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje; es exclusivamente un modelo TTS.
- No dispone de vision, audio de entrada ni modo de razonamiento.

## Casos de uso

- Asistentes de voz offline en neerlandes: el modelo permite sintetizar respuestas habladas localmente en un asistente tipo OVOS, sin enviar texto a la nube, lo que es adecuado por privacidad y por funcionamiento sin conectividad.
- Lectura de notificaciones y alertas en dispositivos embebidos: dado el tamano reducido del repositorio (0,1 GB), puede desplegarse en dispositivos con almacenamiento limitado para leer mensajes del sistema en neerlandes.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en neerlandes para lectores de pantalla o aplicaciones de lectura, ejecutandose en local.
- Automatizacion del hogar: integracion en sistemas domoticos que anuncien estados o eventos en neerlandes mediante el plugin de OVOS, con latencia baja al no requerir red.
- Generacion de audiolibros o contenido narrado en neerlandes por lotes: la sintesis paralela de Glow-TTS permite procesar grandes volumenes de frases de forma eficiente en CPU o GPU modesta.
- Prototipado de interfaces conversacionales: uso como voz de referencia en el desarrollo de aplicaciones de voz en neerlandes antes de invertir en voces comerciales, gracias a su instalacion sencilla via pip.
- Pruebas de pipelines TTS en investigacion: al ser un modelo ONNX ligero, sirve como baseline reproducible para comparar calidad de sintesis o para experimentar con fonemizacion gruut.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,1 GB) y la naturaleza de Glow-TTS mas HiFi-GAN small, es esperable que la inferencia quepa en CPU y en GPUs de gama baja, aunque no se confirman cifras concretas.
- GPU recomendadas: no disponible. El modelo esta empaquetado en ONNX y puede ejecutarse en CPU; no se especifican GPU objetivo.
- Compatibilidad con GPU de consumo: probable en cualquier GPU de consumo moderna por el tamano reducido, aunque no se aportan datos oficiales.
- Opciones de despliegue: la libreria `phoonnx` (Python), el plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecucion ONNX Runtime. No se mencionan vLLM, llama.cpp ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| glowtts-nl-nathalie-gruut | Glow-TTS + HiFi-GAN | neerlandes | ONNX | other (sin registrar) | Voz concreta del catalogo Larynx v1.0 |
| Otras voces Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | varios | ONNX | variable | Misma coleccion; mismo pipeline de empaquetado |
| Piper (Rhasspy) | VITS | varios | ONNX | MIT (segun proyecto) | Sucesor de Larynx; no se dispone de comparacion directa en la informacion |
| Coqui TTS (voces multilingues) | VITS / otros | varios | varios | MPL-2.0 (segun proyecto) | No se dispone de comparacion directa en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia figura como "other" y la model card indica explicitamente que no hay licencia registrada para este modelo; es imprescindible revisar el release upstream de Rhasspy/Larynx antes de cualquier uso, especialmente comercial.
- Solo soporta neerlandes; no es multilingue.
- Requiere que el texto de entrada se convierta a fonemas IPA mediante gruut; un texto mal normalizado o fuera del dominio del fonemizador puede degradar la calidad de la sintesis.
- No es un modelo de lenguaje: no razona, no responde preguntas ni mantiene conversaciones; unicamente sintetiza audio a partir de texto.
- No se dispone de informacion sobre sesgos, calidad subjetiva de la voz ni evaluaciones MOS.
- Al ser una voz concreta del catalogo Larynx v1.0, puede presentar limitaciones de naturalidad y prosodia propias de modelos TTS de esa generacion.
- El numero de descargas (55) y de likes (0) es bajo, lo que sugiere poca validacion por parte de la comunidad; conviene probar exhaustivamente antes de usarlo en produccion.
- No se documentan requisitos de latencia ni comportamiento en cargas concurrentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-nl-nathalie-gruut
- Release upstream (Larynx v1.0, Rhasspy): https://github.com/rhasspy/larynx/releases/download/v1.0/nl_nathalie-glow_tts.tar.gz
- Vocoder hifigan-multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
