# Phoonnx/glowtts-fa-custom

## Resumen

glowtts-fa-custom es un modelo de sintesis de voz (text-to-speech) en persa (`fa`) basado en la arquitectura Glow-TTS originalmente desarrollada por Coqui. Phoonnx lo ha empaquetado en formato ONNX para su uso con su libreria de inferencia `phoonnx`, lo que permite ejecutar el modelo sin depender del framework TTS original de Coqui. El modelo procede del checkpoint `tts_models--fa--custom--glow-tts` publicado en la release v0.10.1 de Coqui TTS.

Glow-TTS es una arquitectura de TTS no autorregresiva basada en normalizing flows y alineamiento monotono, que combina un encoder Transformer con un decoder generativo por flujo. Esto permite sintesis paralela (mas rapida que modelos autorregresivos como Tacotron 2) manteniendo control sobre la duracion mediante alineamiento dinamico. El modelo aqui presentado esta entrenado especificamente para persa con vocabulario fonetico basado en espeak-ng.

La relevancia actual es limitada pero concreta: se trata de un empaquetado de inferencia para un modelo legacy de Coqui (la compania cerro en 2024), orientado al ecosistema OVOS/phoonnx. Su interes principal es permitir sintesis en persa dentro de asistentes de voz open source sin necesidad de infraestructura Python pesada, con un peso de repositorio de solo 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (encoder Transformer + decoder normalizing flow) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frases) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo no detalla variantes) |
| Idiomas soportados | persa (`fa`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline Hugging Face | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis no autorregresivo que aprende una distribucion latente mediante normalizing flows condicionada a la secuencia de fonemas de entrada. El encoder (Transformer) produce representaciones condicionadas al texto y, durante el entrenamiento, se aprende un alineamiento monotono entre fonemas y frames de mel-espectrograma mediante un algoritmo de busqueda tipo Viterbi. En inferencia, la duracion de cada fonema se predice y el flow genera el mel-espectrograma en paralelo, que luego se convierte en audio mediante un vocoder (tipicamente HiFi-GAN en la cadena de Coqui).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF/DPO (no aplica en TTS de esta generacion). El checkpoint original procede de la release v0.10.1 de Coqui TTS bajo la etiqueta `custom` para persa, lo que sugiere un dataset propio no documentado publicamente. La innovacion relevante en el contexto de este repo es el empaquetado ONNX para inferencia ligera mediante `phoonnx` y la integracion con `scriptconv` para normalizacion de texto y fonemizacion via espeak-ng.

## Capacidades

- Sintesis de voz en persa (`fa`) a partir de texto, con salida WAV.
- Fonemizacion mediante espeak-ng (o el port `espyak` incluido en el extra `phoonnx[espeak]`).
- Normalizacion y conversion de texto mediante `scriptconv` antes de la fonemizacion.
- Ejecucion en Python via `phoonnx.model_manager.TTSModelManager`.
- Integracion como plugin de OVOS (`ovos-tts-plugin-phoonnx`) para asistentes de voz.
- Inferencia ONNX, lo que permite despliegue sin el framework TTS completo de Coqui.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo puramente TTS).

## Casos de uso

- Asistentes de voz open source en persa: integrado como plugin de OVOS (`ovos-tts-plugin-phoonnx`), permite dar respuesta hablada en farsi dentro de un stack de asistente domestico. Es adecuado por su licencia permisiva (CC-BY-4.0) y su bajo peso (0,1 GB).
- Lectura de contenido en persa: sintesis de articulos, noticias o documentacion para consumo por audio, usando la API de `phoonnx` que acepta texto y escribe directamente a un fichero WAV.
- Accesibilidad: conversion de texto en pantalla a voz para usuarios con discapacidad visual en entornos de habla persa, ejecutando el modelo en local sin dependencias de servicios cloud.
- Prototipado de interfaces de voz: desarrolladores que necesiten un TTS en persa rapido de integrar en demos o pruebas de concepto, gracias al formato ONNX y a un pipeline de instalacion sencillo (`pip install --pre phoonnx`).
- Generacion de audio para contenido multimedia: narracion de videos o podcasts en farsi en pipelines batch, donde la sintesis paralela de Glow-TTS aporta velocidad frente a modelos autorregresivos.
- Investigacion en TTS multilingue: como checkpoint de referencia para comparar arquitecturas de flujo (Glow-TTS) frente a modelos neuronales mas recientes en un idioma de bajos recursos como el persa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas MOS, MCD, WER de sintesis ni comparaciones objetivas con otros sistemas TTS en persa.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y el formato ONNX, es previsible que quepa en cualquier GPU consumer moderna (8 GB o menos) e incluso en CPU para inferencia por frases.
- GPU recomendadas: no especificadas por el autor. Por el perfil del modelo, cualquier GPU con soporte ONNX Runtime (RTX 3060 en adelante, T4, A10, A100) es sobradamente suficiente.
- CPU: viable, dado el bajo peso; la latencia dependera de la longitud de la frase.
- Opciones de despliegue: `phoonnx` (Python), plugin OVOS `ovos-tts-plugin-phoonnx`, ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-fa-custom (este) | Persa | Glow-TTS | ONNX | CC-BY-4.0 | Hugging Face |
| Coqui TTS `tts_models--fa--custom--glow-tts` | Persa | Glow-TTS | PyTorch (checkpoint Coqui) | CC-BY-4.0 | Release GitHub Coqui |
| Otros TTS persa open source | Persa | Diversas (Tacotron, VITS, etc.) | Diversos | Diversas | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo legacy: procede de Coqui TTS v0.10.1 y Coqui cerro en 2024; no cabe esperar mantenimiento del checkpoint original.
- Cobertura limitada a persa (`fa`); no es multilingue.
- La fonemizacion depende de espeak-ng; con el port `espyak` incluido en el extra, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte el autor.
- Riesgo de alucinacion acustica: como todo TTS, puede producir prosodia incorrecta o artefactos en frases largas o fuera de dominio; no se documentan evaluaciones de calidad.
- Sin informacion sobre el dataset de entrenamiento, no es posible evaluar sesgos de genero, dialecto o registro.
- La licencia CC-BY-4.0 permite uso comercial con atribucion; conviene conservar la atribucion a Coqui y a Phoonnx.
- No se documentan cuantizaciones alternativas ni soporte en runtimes distintos de ONNX Runtime / phoonnx.
- El numero de descargas (25) y likes (0) sugiere adopcion muy baja; no hay comunidad que valide su calidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-fa-custom
- Checkpoint original Coqui: https://github.com/coqui-ai/TTS/releases/download/v0.10.1_models/tts_models--fa--custom--glow-tts.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
