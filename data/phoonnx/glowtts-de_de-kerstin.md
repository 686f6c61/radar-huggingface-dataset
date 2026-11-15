# Phoonnx/glowtts-de_de-kerstin

## Resumen

glowtts-de_de-kerstin es un modelo de sintesis de voz (text-to-speech) en aleman estandar (de-DE) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y empaquetado por Phoonnx para su uso con la libreria ONNX phoonnx. El modelo convierte texto en un espectrograma mel que posteriormente es transformado en audio por el vocoder HiFi-GAN (hifigan-multi-vctk-small), que phoonnx descarga de forma conjunta con la voz.

Se trata de un modelo compacto (el repositorio ocupa aproximadamente 0,1 GB) orientado a la sintesis de voz local y de baja latencia, no a la generacion de texto. Su relevancia actual radica en que permite integrar TTS en aleman en asistentes de voz autoalojados (OVOS, Rhasspy) sin depender de servicios en la nube, ejecutandose sobre CPU mediante ONNX Runtime.

El modelo forma parte de la coleccion de voces Glow-TTS empaquetadas por Phoonnx y su identificador interno de voz es `larynx/de-de-kerstin-glow_tts`. La licencia no esta registrada en la model card, por lo que su uso comercial requiere verificar la licencia del release original de Rhasspy/Larynx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (texto a espectrograma mel) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | other (sin licencia registrada; consultar el release upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz no autoregresivo basado en normalizing flows. Aprende una correspondencia monotona entre fonemas y fotogramas de espectrograma mel mediante alineamiento monotono y una transformacion invertible, lo que permite sintesis paralela (sin decodificacion paso a paso) y por tanto latencia baja. El modelo genera el espectrograma mel y delega la generacion de la forma de onda en el vocoder HiFi-GAN (variante multi-VCTK small), que phoonnx gestiona de forma transparente.

El front-end de texto no forma parte del modelo ONNX: phoonnx delega la normalizacion y la fonemizacion en la libreria scriptconv, que para esta voz utiliza `GruutPhonemizer` (extra `scriptconv[gruut]`) y produce fonemas en alfabeto IPA. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino preferencial; estos datos no estan documentados en la informacion disponible.

## Capacidades

- Sintesis de voz en aleman estandar (de-DE) a partir de texto plano.
- Generacion de espectrogramas mel mediante Glow-TTS y conversion a audio WAV mediante HiFi-GAN.
- Fonemizacion de entrada mediante gruut en alfabeto IPA.
- Ejecucion local sobre ONNX Runtime, sin dependencia de servicios externos.
- Integracion con asistentes de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Seleccion de voz por identificador (`larynx/de-de-kerstin-glow_tts`) dentro del gestor de voces de phoonnx.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz autoalojados: integracion en OVOS o Rhasspy mediante `ovos-tts-plugin-phoonnx` para dotar de voz en aleman a un asistente domestico que funciona sin conexion a internet, configurando la voz en `mycroft.conf`.
- Lectura de notificaciones y avisos del sistema: sintesis de mensajes cortos en aleman para alertas de domotica, correo o monitorizacion, aprovechando la baja latencia de la sintesis paralela de Glow-TTS.
- Accesibilidad: conversion de texto a voz para personas con discapacidad visual o dificultades de lectura en entornos de escritorio, ejecutandose en CPU sin GPU dedicada.
- Generacion de audiolibros o contenido narrado por lotes: procesamiento por script de grandes volumenes de texto aleman a WAV mediante la API de phoonnx, con coste marginal nulo al ser inferencia local.
- Prototipado de interfaces conversacionales: pruebas de concepto de IVR o chatbots de voz en aleman antes de contratar un servicio TTS comercial, usando el modelo como referencia funcional.
- Investigacion en sintesis de voz: uso como linea base Glow-TTS reproducible en ONNX para comparar con modelos mas recientes (VITS, Piper) en terminos de calidad y latencia.
- Kioscos y dispositivos embebidos: despliegue en hardware de bajas prestaciones (Raspberry Pi o similar) gracias al tamano reducido del repositorio (~0,1 GB) y al soporte de ONNX Runtime en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0,1 GB) se trata de un modelo muy ligero que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecucion en CPU mediante ONNX Runtime.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), aunque no es necesario disponer de GPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-de_de-kerstin (este modelo) | Glow-TTS + HiFi-GAN | de-DE | no aplica | other (sin registrar) | Hugging Face, ONNX via phoonnx |
| Otras voces Glow-TTS de la coleccion Phoonnx | Glow-TTS + HiFi-GAN | varios | no aplica | other | Hugging Face, coleccion Glow-TTS de Phoonnx |
| Modelos Piper (sucesor de Larynx) | VITS | varios (incluido de-DE) | no aplica | MIT (segun proyecto Piper) | GitHub de Piper, ONNX |
| Modelos VITS de Rhasspy/Larynx | VITS | varios | no aplica | depende del release | GitHub de Larynx |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo soporta aleman (de-DE); no es multilingue.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Riesgo de alucinacion en sentido estricto no aplica, pero la sintesis puede producir pronunciaciones incorrectas en palabras extranas, siglas o neologismos no cubiertos por el fonemizador gruut.
- La calidad de la salida depende del front-end de texto (scriptconv + gruut); errores de normalizacion se traducen directamente en errores de pronunciacion.
- La licencia figura como "other" y no hay licencia registrada en la model card; es imprescindible revisar el release original de Rhasspy/Larynx antes de cualquier uso comercial.
- El modelo esta empaquetado para phoonnx y requiere esa libreria y el extra `scriptconv[gruut]`; no es un modelo generico cargable con transformers.
- El vocoder se descarga por separado (hifigan-multi-vctk-small), por lo que el despliegue depende de la disponibilidad de ese repositorio.
- No se documentan sesgos especificos, pero al estar entrenado con una voz concreta (Kerstin) la salida esta limitada a esa identidad vocal.
- Fecha de creacion y actualizacion del repositorio en 2026, con solo 28 descargas y 0 likes: ecosistema y validacion comunitaria muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-de_de-kerstin
- Release original de Rhasspy/Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/de-de_kerstin-glow_tts.tar.gz
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
