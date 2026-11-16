# Phoonnx/vits-fi_fi-harri-medium-espeak

## Resumen

Phoonnx/vits-fi_fi-harri-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX homonima. El modelo original procede del repositorio Rhasspy Piper Voices, concretamente de la voz `fi_FI/harri/medium`, y ha sido reempaquetado para ejecutarse con la libreria `phoonnx` en Python y en el ecosistema OVOS.

Se trata de una voz monohablante en fines de Finlandia (`fi-FI`), de calidad media y con un peso de repositorio de aproximadamente 0,1 GB, lo que la situa en la categoria de modelos ligeros aptos para ejecucion en CPU o en dispositivos de bajos recursos. El modelo consume fonemas generados por espeak-ng en alfabeto IPA, por lo que la calidad de sintesis depende en gran medida de la correcta instalacion y version del fonemizador.

Su relevancia actual radica en la disponibilidad de una voz finesa ligera, con licencia MIT y formato ONNX, integrable en asistentes de voz locales (OVOS) y en aplicaciones web mediante phoonnx.js. No obstante, el modelo no cuenta con descargas ni interacciones registradas en Hugging Face en el momento de la consulta, lo que limita la evidencia empirica sobre su rendimiento en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no generativo de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | fines (fi-FI) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un predictor de duracion, un flujo normalizador y un decoder generativo basado en redes adversarias generativas (GAN). El modelo original fue desarrollado por Rhasspy dentro del proyecto Piper Voices y entrenado presumiblemente sobre corpus de voz finesa, si bien la model card no detalla el volumen de datos, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en TTS).

La innovacion tecnica destacable es el empaquetado para phoonnx: el modelo se distribuye en ONNX y se ejecuta mediante la libreria `phoonnx`, que delega la normalizacion y conversion de texto a la libreria `scriptconv`. El front-end utiliza `EspeakPhonemizer` del modulo `scriptconv_copyleft.phonemizers.mul`, que requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]` (port espyak). Esta dependencia es critica: la model card advierte que algunos fonemas de espyak difieren de los de espeak-ng, lo que puede provocar pronunciaciones incorrectas.

## Capacidades

- Sintesis de voz monohablante en fines (fi-FI) a partir de texto.
- Entrada basada en fonemas espeak en alfabeto IPA, con normalizacion previa del texto mediante scriptconv.
- Generacion de audio en formato WAV mediante la API `synthesize_wav`.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), configurable via `mycroft.conf`.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de modo thinking, vision ni audio de entrada.
- Capacidad multilingue limitada exclusivamente al fines.

## Casos de uso

- Asistentes de voz locales en fines: integracion en OVOS como modulo TTS para respuestas habladas en un asistente domestico, aprovechando su licencia MIT y su tamano reducido (0,1 GB) para ejecucion en Raspberry Pi o mini-PC.
- Lectura de notificaciones y alertas en sistemas embebidos: sintesis de mensajes cortos en fines dentro de dispositivos IoT con recursos limitados, al poder ejecutarse en CPU via ONNX.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en aplicaciones de escritorio o web en fines, con despliegue local sin dependencia de servicios en la nube.
- Prototipado de interfaces conversacionales: generacion rapida de locuciones de prueba en fines durante el desarrollo de chatbots o IVR, gracias a la instalacion sencilla via `pip install --pre phoonnx`.
- Síntesis en el navegador: uso de phoonnx.js para generar audio en fines del lado del cliente en aplicaciones web educativas o de aprendizaje de idiomas, sin enviar texto a servidores externos.
- Generacion de contenido audiovisual automatizado: produccion de narraciones en fines para videos, podcasts o audiolibros de bajo coste, con control local del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,1 GB) y el formato ONNX, es previsible que la inferencia pueda ejecutarse en CPU sin GPU dedicada, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible; al ser un modelo ligero, no requiere GPU de gama alta, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: probable en cualquier GPU de consumo moderna por el reducido tamano, si bien no se confirma en la documentacion.
- Opciones de despliegue: libreria `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y `phoonnx.js` para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS VITS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-fi_fi-harri-medium-espeak | VITS | fi-FI | no aplica | MIT | ONNX | Hugging Face (0 descargas) |
| Rhasspy piper-voices fi_FI/harri/medium (upstream) | VITS | fi-FI | no aplica | MIT | ONNX | Hugging Face (repositorio upstream) |
| Otras voces VITS de la coleccion Phoonnx | VITS | variable | no aplica | variable (segun upstream) | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia critica de espeak-ng: sin el instalado, el extra `phoonnx[espeak]` usa el port espyak, cuyos fonemas difieren y pueden producir pronunciaciones erroneas.
- Calidad de voz "medium": la denominacion del modelo indica una calidad intermedia dentro de la escala de Piper, no equiparable a voces de alta fidelidad.
- Monohablante y monoidioma: solo fines de Finlandia; no soporta otros idiomas ni cambios de hablante.
- Sin evidencia empirica de uso: 0 descargas y 0 likes en Hugging Face, sin benchmarks publicados ni evaluaciones de calidad (MOS) disponibles.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si existe riesgo de pronunciacion incorrecta o entonacion deficiente en palabras fuera del dominio de entrenamiento.
- Restricciones de licencia: MIT permite uso comercial, pero la model card remite a la licencia declarada por el upstream (rhasspy/piper-voices); conviene verificar los terminos del repositorio original.
- Modelo TTS, no generativo de texto: no debe evaluarse con metricas de LLM (MMLU, HumanEval, GSM8K) ni usarse para tareas de razonamiento o codigo.
- Fecha de creacion futura (2026-11-16) en los metadatos de Hugging Face, lo que sugiere un posible error de marcado temporal o un empaquetado programado; conviene contrastar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-fi_fi-harri-medium-espeak
- Upstream (Rhasspy Piper Voices, fi_FI/harri/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/fi/fi_FI/harri/medium
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
