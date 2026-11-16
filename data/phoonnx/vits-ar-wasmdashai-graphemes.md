# Phoonnx/vits-ar-wasmdashai-graphemes

## Resumen

vits-ar-wasmdashai-graphemes es un modelo de sintesis de voz (text-to-speech) en arabe basado en la arquitectura VITS, desarrollado originalmente por wasmdashai (repositorio upstream `wasmdashai/vits-ar`) y reempaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`, una biblioteca de TTS en Python integrable en el ecosistema OVOS (Open Voice OS).

El modelo resuelve la conversion de texto a audio en arabe a partir de una entrada a nivel de caracteres (graphemes), sin necesidad de un fonemizador especifico: el front-end de texto delega en `scriptconv` con `GraphemePhonemizer`. Esto simplifica el despliegue en comparacion con pipelines que requieren un lexico fonetico o un G2P dedicado, a costa de una calidad de pronunciacion potencialmente menor en palabras ambiguas.

Es relevante para desarrolladores que necesitan un motor TTS ligero y autoalojado para arabe dentro de asistentes de voz o sistemas embebidos: el repositorio ocupa 0,1 GB, se distribuye como ONNX y se integra mediante el plugin `ovos-tts-plugin-phoonnx`. El modelo tiene un uso muy limitado (21 descargas, 0 likes) y no publica resultados de benchmarks ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | arabe (`ar`) |
| Licencia | `other` en el repo de Phoonnx; el upstream declara `afl-3.0` |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres (graphemes) |
| Tamano del repositorio | 0,1 GB |
| Libreria | `phoonnx` |

## Arquitectura y entrenamiento

VITS es un modelo end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizantes y un discriminador adversarial entrenado con perdidas de reconstruccion y de adversario. La inferencia produce directamente la forma de onda o un espectrograma vocoderizado, evitando pipelines de dos etapas. En este caso el modelo se distribuye ya exportado a ONNX para ejecucion con `phoonnx`.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o horas de audio, la composicion del corpus, ni sobre el uso de RLHF, DPO u otras tecnicas de alineacion. Tampoco se documenta si el modelo emplea decodificacion especulativa, atencion lineal u otras innovaciones. La informacion publica se limita a la arquitectura VITS, el idioma (`ar`) y el front-end de texto basado en graphemes.

## Capacidades

- Sintesis de voz en arabe a partir de texto plano, con entrada a nivel de caracteres.
- Normalizacion y conversion de texto delegadas en `scriptconv` mediante `GraphemePhonemizer`.
- Generacion de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integracion en OVOS como plugin TTS (`ovos-tts-plugin-phoonnx`), seleccionable por configuracion.
- Ejecucion sobre runtime ONNX, lo que permite despliegue en CPU sin dependencias de GPU.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en arabe autoalojados: el modelo se carga en `TTSModelManager` y sintetiza respuestas del asistente sin enviar texto a servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Integracion en Open Voice OS: mediante `ovos-tts-plugin-phoonnx` y la voz `hf_community/wasmdashai/vits-ar`, se habilita la salida de voz en arabe en un asistente domestico sin desarrollo adicional.
- Lectura de notificaciones y alertas: por su tamano reducido (0,1 GB) y ejecucion en CPU via ONNX, puede generar avisos cortos en dispositivos de bajos recursos.
- Prototipado rapido de interfaces de voz: la API de `phoonnx` permite sintetizar frases a un fichero WAV en pocas lineas de codigo, util para validar flujos de UX antes de invertir en un modelo de mayor calidad.
- Sistemas de accesibilidad: conversion de texto a audio en arabe para lectores de pantalla o aplicaciones de lectura de contenido, donde la latencia baja y el coste nulo por peticion son prioritarios.
- Generacion de locuciones para pruebas automatizadas: sintesis de corpus de audio en arabe para evaluar pipelines de reconocimiento de voz o de diarizacion sin depender de grabaciones humanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (MOS, WER, MCD) ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) el modelo es compatible con inferencia en CPU y con GPU de gama baja.
- GPU recomendadas: no se especifican; al ejecutarse sobre ONNX puede correr en CPU, y en GPU cualquier tarjeta con suficiente memoria para el grafo ONNX (muy por debajo de los 8 GB en la mayoria de configuraciones).
- GPU de consumo: cabe previsiblemente en cualquier GPU de consumo reciente (RTX 3060, RTX 4060, etc.) e incluso en CPU, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| vits-ar-wasmdashai-graphemes | VITS | ar | no disponible | other / afl-3.0 upstream | ONNX |
| Alternativas VITS de la coleccion Phoonnx | VITS | varios | no disponible | variable | ONNX |
| Otros TTS arabes open source | no disponible | ar | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de nicho con muy poca adopcion (21 descargas, 0 likes): no hay evidencia de comunidad ni de mantenimiento continuado.
- Ausencia total de datos de entrenamiento, evaluacion y sesgos: no se puede estimar la calidad de pronunciacion ni la cobertura dialectal del arabe.
- El front-end basado en graphemes puede producir pronunciaciones incorrectas en palabras con ortografia ambigua o sin vocales explicitas, frecuentes en arabe.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos, ruido o prosodia incorrecta en entradas fuera de distribucion.
- Licencia ambigua: el repo de Phoonnx declara `other` mientras el upstream indica `afl-3.0`; conviene verificar los terminos exactos antes de un uso comercial.
- No apto para tareas de razonamiento, codigo, vision ni agentes: es exclusivamente un modelo de sintesis de voz.
- Sin garantias de latencia ni de calidad para produccion; requiere evaluacion propia con el dominio de texto objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-ar-wasmdashai-graphemes
- Modelo upstream: https://huggingface.co/wasmdashai/vits-ar
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
