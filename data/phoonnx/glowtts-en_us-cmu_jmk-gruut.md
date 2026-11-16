# Phoonnx/glowtts-en_us-cmu_jmk-gruut

## Resumen

GlowTTS-en_us-cmu_jmk-gruut es un modelo de sintesis de voz (text-to-speech) en ingles estadounidense empaquetado en formato ONNX para la libreria phoonnx. El modelo original es un Glow-TTS desarrollado por Rhasspy dentro del proyecto Larynx, una iniciativa de voz offline para asistentes como Mycroft y OVOS. Esta version concreta ha sido reempaquetada por Phoonnx para su uso directo con su libreria de inferencia ONNX, lo que elimina la dependencia del stack original de Larynx.

El modelo sigue la arquitectura Glow-TTS, un modelo de sintesis no autorregresivo basado en normalizing flows que genera espectrogramas mel a partir de fonemas, y que se complementa con un vocoder HiFi-GAN (en este caso, hifigan-multi-vctk-small) para convertir el espectrograma en audio. La entrada de texto no es texto plano, sino fonemas en alfabeto IPA generados por el fonemizador gruut, lo que requiere un front-end de normalizacion de texto antes de la inferencia.

La relevancia de esta ficha es acotada: se trata de un modelo pequeno (repo de 0,1 GB), con 22 descargas y sin likes, orientado a entornos con recursos limitados y despliegue offline. No es un modelo de proposito general ni compite con los TTS neuronales modernos de gran escala, sino que cubre el nicho de sintesis de voz ligera y determinista para asistentes de voz y sistemas embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flows) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Vocoder | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut, alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz no autorregresivo basado en normalizing flows. A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS aprende una alineacion monotona entre fonemas y frames de espectrograma mediante programacion dinamica durante el entrenamiento, lo que permite generar el espectrograma completo en paralelo y reduce la latencia de inferencia. La arquitectura transforma una distribucion latente en el espectrograma mel mediante una serie de flujos invertibles condicionados por la secuencia de fonemas codificada.

El modelo original fue entrenado por Rhasspy dentro del proyecto Larynx v1.0, orientado a voces offline de calidad razonable para asistentes de voz. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning preferencial; estos datos no estan publicados en la model card. La innovacion tecnica destacable es el uso de alineacion monotona aprendida y la generacion paralela, que hace que el modelo sea adecuado para CPUs y dispositivos sin GPU dedicada.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de texto.
- Conversion texto a fonemas mediante el fonemizador gruut (integrado via scriptconv).
- Generacion de espectrogramas mel seguida de sintesis de audio mediante el vocoder HiFi-GAN.
- Salida de audio en formato WAV a traves de la API de phoonnx.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion offline, sin dependencia de servicios en la nube.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No soporta vision, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz offline: el modelo puede integrarse en OVOS o Mycroft para sintetizar respuestas habladas en local, sin conexion a internet, gracias a su tamano reducido (0,1 GB) y a la inferencia ONNX en CPU.
- Sistemas embebidos y Raspberry Pi: al ser un modelo Glow-TTS pequeno con vocoder HiFi-GAN small, puede ejecutarse en dispositivos de recursos limitados donde un TTS neuronal grande no cabria.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en aplicaciones de domotica o monitoreo, donde la latencia baja y la generacion paralela del espectrograma son ventajosas.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual, con la ventaja de funcionar sin red.
- Pruebas y desarrollo de pipelines TTS: al estar empaquetado para phoonnx, sirve como voz de referencia para validar integraciones de la libreria y del front-end scriptconv/gruut.
- Generacion de audio para prototipos y demos: su licencia incierta y calidad limitada lo hacen adecuado para entornos de desarrollo y pruebas internas, no para produccion comercial sin aclarar la licencia upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repo (0,1 GB) y la arquitectura Glow-TTS + HiFi-GAN small, es plausible su ejecucion en CPU sin GPU dedicada, pero no hay datos oficiales de consumo.
- GPU recomendadas: no disponible; el modelo esta empaquetado en ONNX y orientado a inferencia en CPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| glowtts-en_us-cmu_jmk-gruut | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | no disponible | Empaquetado para phoonnx, 0,1 GB |
| Otras voces Larynx v1.0 (upstream) | Glow-TTS + HiFi-GAN | varios | tar.gz original | ver upstream | no disponible | Mismo modelo base sin empaquetar |
| Piper (rhasspy) | VITS | varios | ONNX | MIT (segun proyecto) | no disponible | Sucesor de Larynx, mas moderno |
| Coqui TTS (modelos Glow-TTS) | Glow-TTS | varios | PyTorch | MPL 2.0 (segun proyecto) | no disponible | Implementacion de referencia |

Nota: los datos de los modelos comparables (Piper, Coqui TTS) no provienen de la informacion proporcionada y deben verificarse en sus respectivas fuentes antes de usarse en una decision tecnica.

## Limitaciones y advertencias

- Licencia sin registrar: la model card indica explicitamente que no hay licencia registrada y recomienda consultar la release upstream antes de usar el modelo. El uso comercial es incierto y requiere verificacion legal.
- Idioma unico: solo soporta ingles estadounidense (en-US); no hay capacidades multilingues.
- Entrada restringida a fonemas: requiere el fonemizador gruut y el front-end scriptconv; no acepta texto plano directamente sin ese pipeline.
- Calidad de voz limitada: es un modelo Glow-TTS de la generacion Larynx v1.0, anterior a los TTS neuronales modernos (VITS, Piper, modelos de difusion), por lo que la naturalidad y prosodia son inferiores.
- Riesgo de errores de pronunciacion en palabras fuera del lexico o nombres propios, dependiente de la cobertura del fonemizador gruut.
- Sin datos de sesgos: no se ha publicado informacion sobre sesgos de genero, acento o dialecto en la voz sintetizada.
- Sin soporte de razonamiento, agentes ni tool calling: no debe evaluarse como modelo de lenguaje.
- Popularidad y mantenimiento bajos: 22 descargas y 0 likes en el momento de la consulta, lo que sugiere una comunidad reducida y posible falta de soporte a largo plazo.
- No apto para produccion critica sin pruebas de calidad de audio y sin aclarar la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_jmk-gruut
- Release upstream de Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_jmk-glow_tts.tar.gz
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
