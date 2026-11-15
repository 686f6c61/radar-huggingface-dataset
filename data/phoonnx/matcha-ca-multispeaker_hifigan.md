# Phoonnx/matcha-ca-multispeaker_hifigan

## Resumen

`matcha-ca-multispeaker_hifigan` es un modelo de sintesis de voz (text-to-speech) para catalan, empaquetado en formato ONNX para la libreria phoonnx. El modelo original es `projecte-aina/matxa-tts-cat-multispeaker`, desarrollado por Projecte AINA, y esta version ha sido convertida y publicada por Phoonnx para su uso directo con la libreria phoonnx y el ecosistema OpenVoiceOS (OVOS).

El modelo emplea la arquitectura Matcha-TTS, un modelo de sintesis basado en flow matching condicionado por fonemas, combinado con un vocoder HiFi-GAN fusionado (fused HiFi-GAN) que convierte las representaciones acusticas en forma de onda de audio. La entrada de texto se procesa mediante fonemizacion con espeak-ng en alfabeto IPA, lo que permite control preciso de la pronunciacion en catalan.

Su relevancia practica radica en que ofrece una via sencilla para integrar TTS en catalan en asistentes de voz y aplicaciones Python, con un repositorio ligero (0,1 GB) y una API de alto nivel a traves de `TTSModelManager`. Es un modelo multihablante, lo que permite seleccionar distintas voces dentro del mismo paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS con vocoder HiFi-GAN fusionado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin contexto de texto definido) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | catalan (`ca`) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Matcha-TTS, un sistema de sintesis de voz basado en flow matching que genera representaciones acusticas a partir de fonemas, seguidas de un vocoder HiFi-GAN fusionado que produce la forma de onda final. La entrada de texto no se realiza a nivel de caracteres, sino que se fonemiza previamente con espeak-ng y se convierte a alfabeto IPA, lo que aporta robustez en la pronunciacion del catalan.

El modelo es multihablante, lo que implica que soporta varias voces dentro del mismo paquete. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El modelo original fue desarrollado por Projecte AINA y esta version es un empaquetado ONNX para phoonnx, sin cambios documentados en la arquitectura respecto al modelo upstream.

## Capacidades

- Sintesis de voz en catalan a partir de texto escrito.
- Soporte multihablante (varias voces en un mismo modelo).
- Fonemizacion mediante espeak-ng con entrada en alfabeto IPA.
- Normalizacion y conversion de texto mediante la libreria scriptconv.
- Generacion de audio en formato WAV a traves de la API `synthesize_wav`.
- Integracion con OpenVoiceOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en Python mediante la libreria phoonnx con pesos ONNX.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento.

## Casos de uso

- Asistentes de voz en catalan: el modelo puede integrarse en OpenVoiceOS mediante `ovos-tts-plugin-phoonnx`, configurando la voz `OpenVoiceOS/matxa-cat-multispeaker-hifigan` en `mycroft.conf` para respuestas habladas en catalan.
- Lectura de contenido en catalan: conversion de articulos, noticias o documentacion a audio WAV mediante `voice.synthesize_wav`, adecuado para aplicaciones de accesibilidad o consumo de contenido.
- Sistemas de anuncios y avisos automatizados: generacion de mensajes hablados en catalan para transporte publico, comercios o servicios de atencion telefonica, con seleccion de voz segun el contexto.
- Prototipado rapido de TTS: el repositorio ligero (0,1 GB) y la API de alto nivel de phoonnx permiten validar una voz en catalan en pocas lineas de codigo antes de invertir en infraestructura mayor.
- Integracion en aplicaciones Python de escritorio: uso de la libreria phoonnx para dotar de voz a aplicaciones locales sin depender de servicios en la nube.
- Educacion y aprendizaje de idiomas: generacion de pronunciaciones en catalan a partir de texto, con control de fonemas via espeak-ng para practicar la fonetica.
- Investigacion en TTS: al ser un empaquetado ONNX de un modelo Matcha-TTS, sirve como base reproducible para experimentos de sintesis en catalan y comparativas con otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0,1 GB, lo que sugiere un modelo ligero apto para CPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, aunque por el tamano del paquete es previsible que funcione en hardware modesto; no se confirma en la documentacion.
- Opciones de despliegue: libreria phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OpenVoiceOS; requiere espeak-ng instalado (o el extra `phoonnx[espeak]` con espyak).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| matcha-ca-multispeaker_hifigan | no disponible | no aplica | Catalan | GPL-3.0 | ONNX |
| projecte-aina/matxa-tts-cat-multispeaker (upstream) | no disponible | no aplica | Catalan | GPL-3.0 | no disponible |
| Otros modelos Matcha-TTS de la coleccion Phoonnx | no disponible | no aplica | Segun modelo | Segun modelo | ONNX |

No se dispone de datos de rendimiento ni de benchmarks para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia GPL-3.0: el uso comercial implica obligaciones de licencia copyleft; es necesario revisar la compatibilidad con el producto o servicio que integre el modelo.
- Dependencia de espeak-ng: sin espeak-ng instalado, el uso de espyak puede producir fonemas distintos y errores de pronunciacion en algunas palabras.
- Idioma unico: solo soporta catalan (`ca`); no se documenta cobertura multilingue.
- Riesgo de alucinacion y errores de pronunciacion: como todo sistema TTS, puede generar prosodia o fonemas incorrectos en textos ambiguos, nombres propios o abreviaturas.
- Sesgos: no se documentan sesgos conocidos, pero al ser multihablante puede presentar diferencias de calidad entre voces.
- Sin datos de rendimiento: no hay benchmarks publicados que permitan estimar calidad objetiva (MOS, WER) ni latencia en produccion.
- Paquete de comunidad: es un empaquetado de terceros (Phoonnx) sobre el modelo de Projecte AINA; la responsabilidad de mantenimiento y actualizaciones recae en el publicador del empaquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/matcha-ca-multispeaker_hifigan
- Modelo upstream: https://huggingface.co/projecte-aina/matxa-tts-cat-multispeaker
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
- Arquitectura Matcha-TTS: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
