# Phoonnx/glowtts-en_us-cmu_ljm-gruut

## Resumen

glowtts-en_us-cmu_ljm-gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y reempaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo genera espectrogramas a partir de texto en ingles estadounidense y depende de un vocoder externo (hifigan-multi-vctk-small) para convertir esos espectrogramas en audio. No es un modelo de lenguaje ni un transformer generativo de texto: es un sistema acustico TTS de dos etapas.

Su relevancia actual es practica: permite sintesis de voz local, sin dependencias de servicios en la nube, en entornos Python y en el ecosistema OVOS (Open Voice OS), con un tamano de repositorio de aproximadamente 0,1 GB. La entrada de texto no es texto plano directo, sino fonemas gruut en alfabeto IPA, lo que exige un front-end de normalizacion y fonemizacion (scriptconv) antes de la inferencia.

El modelo esta orientado exclusivamente a ingles (en-US), se distribuye bajo licencia "other" sin terminos registrados en la model card y cuenta con un uso muy limitado en Hugging Face (20 descargas, 0 likes en el momento de la consulta). Es, por tanto, una pieza de infraestructura TTS mas que un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico normalizing flow) + vocoder HiFi-GAN externo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por frase en fonemas) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo acustico basado en normalizing flows que modela directamente la distribucion de espectrogramas mel condicionada al texto, evitando el uso de alineamientos externos mediante un mecanismo de busqueda de alineamiento monotono (MAS, monotonic alignment search). La arquitectura combina un encoder de texto, un bloque de flows invertibles y un decoder que produce el espectrograma. En esta ficha concreta, el modelo se distribuye como grafo ONNX listo para inferencia, sin informacion publica sobre el numero de parametros ni la configuracion exacta de capas.

El entrenamiento original corresponde a Rhasspy/Larynx v1.0, sobre el corpus en-US cmu_ljm (voz LJSpeech de CMU) y con fonemizacion gruut. No se dispone en la informacion proporcionada de datos sobre numero de tokens, composicion del dataset, horas de audio, ni sobre el uso de tecnicas de RLHF o DPO (no aplicables en un TTS clasico). La innovacion tecnica relevante es el pipeline de dos etapas: el modelo Glow-TTS produce el espectrograma y el vocoder HiFi-GAN multi-VCTK small lo convierte en forma de onda; phoonnx descarga y gestiona automaticamente el vocoder junto con la voz.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de fonemas gruut en IPA.
- Generacion de espectrogramas mel y conversion a audio WAV mediante vocoder HiFi-GAN.
- Integracion con la libreria phoonnx en Python (`TTSModelManager`, `synthesize_wav`).
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Normalizacion y fonemizacion de texto de entrada a traves de scriptconv con el fonemizador gruut.
- Ejecucion local sin dependencia de API en la nube.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona en `mycroft.conf` como modulo TTS y permite respuestas habladas sin enviar texto a servicios externos, adecuado para dispositivos con requisitos de privacidad.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o domotica: la sintesis por frase y el bajo tamano del repositorio (~0,1 GB) permiten generar avisos cortos en tiempo real en hardware modesto.
- Generacion de audiolibros o contenido narrado por lotes: el pipeline phoonnx + scriptconv permite procesar textos largos dividiendolos en frases y sintetizar cada una con el vocoder.
- Prototipado de interfaces conversacionales: util para validar flujos de dialogo con voz sintetica antes de invertir en voces comerciales o modelos TTS de mayor calidad.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de asistencia en ingles, ejecutandose en local.
- Investigacion en TTS y evaluacion de pipelines: sirve como referencia de Glow-TTS empaquetado en ONNX para comparar con modelos mas recientes o para estudiar el efecto del vocoder en la calidad final.
- Integracion en pipelines de CI para pruebas de regresion de audio: permite generar muestras de referencia reproducibles en entornos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0,1 GB) y la naturaleza ONNX del modelo, es esperable que quepa en GPUs consumer con pocos GB, aunque no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; el modelo puede ejecutarse en CPU mediante ONNX Runtime, aunque no se detalla en la model card.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-en_us-cmu_ljm-gruut | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | Fonemas gruut IPA | Hugging Face (Phoonnx) |
| Otras voces Larynx empaquetadas por Phoonnx | Glow-TTS + HiFi-GAN | Multiples (segun voz) | ONNX | other | Fonemas gruut IPA | Coleccion Glow-TTS de Phoonnx |
| Piper (Rhasspy) | VITS | Multiples | ONNX | MIT (segun proyecto) | Texto/fonemas | Repositorio Piper |
| Coqui TTS (XTTS, VITS) | VITS / autoregresivo | Multiples | PyTorch | Segun modelo | Texto | Coqui / Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Licencia "other" sin terminos registrados en la model card: es imprescindible revisar la licencia del release upstream de Rhasspy/Larynx antes de cualquier uso comercial.
- Solo soporta ingles estadounidense (en-US); no hay capacidades multilingues.
- Requiere un front-end de fonemizacion (gruut via scriptconv) y un vocoder externo; no funciona como modelo autonomo de texto a audio.
- No hay informacion publica sobre sesgos, calidad subjetiva (MOS) ni evaluaciones de robustez.
- Riesgo de alucinacion en el sentido de pronunciacion incorrecta o prosodia deficiente en textos fuera del dominio de entrenamiento (nombres propios, siglas, dominios especializados).
- El uso en Hugging Face es muy bajo (20 descargas, 0 likes), lo que reduce la evidencia de validacion por la comunidad.
- No apto para tareas de razonamiento, codigo, vision ni agentes.
- La fecha de creacion registrada (2026-11-14) y la de actualizacion (2026-11-16) deben tratarse con cautela como metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_ljm-gruut
- Vocoder: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Release upstream Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_ljm-glow_tts.tar.gz
