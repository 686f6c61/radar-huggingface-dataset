# Phoonnx/glowtts-nl-bart_de_leeuw-gruut

## Resumen

glowtts-nl-bart_de_leeuw-gruut es un modelo de sintesis de voz (text-to-speech) en neerlandes empaquetado en formato ONNX para la libreria phoonnx. El modelo original procede del proyecto Larynx de Rhasspy (version 1.0), una iniciativa de TTS local y ligero pensada para asistentes de voz offline. Esta version, publicada por Phoonnx, mantiene la arquitectura Glow-TTS original y anade un vocoder HiFi-GAN (hifigan-multi-vctk-small) para convertir el espectrograma en audio.

El modelo trabaja sobre fonemas del fonemizador gruut en alfabeto IPA, no sobre texto crudo: el front-end de texto lo aporta la libreria scriptconv, que normaliza la entrada y la convierte a la secuencia de fonemas que espera la red. La voz concreta del repositorio es `larynx/nl-bart_de_leeuw-glow_tts`, identificada por el nombre del hablante (Bart de Leeuw).

Por su tamano reducido (0,1 GB en el repositorio) y su formato ONNX, es un modelo orientado a inferencia en CPU y a despliegues de bajos recursos, no a sintesis de alta fidelidad ni a clonacion de voz. Su relevancia actual esta en el ecosistema OVOS/Mycroft, donde se integra como plugin de TTS para asistentes de voz en neerlandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow) con vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | neerlandes (`nl`) |
| Licencia | other (sin licencia registrada; consultar el release upstream) |
| Formato de pesos | ONNX |
| Vocoder | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz basado en normalizing flows: aprende una transformacion invertible entre la secuencia de fonemas y el espacio de espectrogramas mel, lo que permite generar espectrogramas de forma determinista y paralela (sin decodificacion autoregresiva), lo que se traduce en una sintesis rapida. El espectrograma generado se convierte en forma de onda mediante el vocoder HiFi-GAN, en este caso la variante multi-hablante pequena (hifigan-multi-vctk-small) empaquetada por Phoonnx.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino por preferencias (no aplicable en la practica a un TTS de este tipo). El modelo original fue entrenado por Rhasspy dentro del proyecto Larynx, cuyo objetivo era ofrecer voces TTS ligeras y ejecutables localmente para asistentes de voz. La innovacion practica de este empaquetado es la conversion a ONNX y la integracion con el pipeline de phoonnx y scriptconv (fonemizador gruut), que elimina dependencias del stack original de Larynx.

## Capacidades

- Sintesis de voz (text-to-speech) en neerlandes a partir de texto normalizado y fonemizado.
- Generacion de espectrogramas mel mediante Glow-TTS y conversion a audio WAV mediante HiFi-GAN.
- Front-end de texto con normalizacion y fonemizacion gruut (alfabeto IPA), gestionado por scriptconv.
- Inferencia local en formato ONNX, apta para CPU.
- Integracion como plugin de TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de vision, audio de entrada ni modo thinking.
- Multilingue: no; unicamente neerlandes.

## Casos de uso

- Asistentes de voz offline en neerlandes: integrado como plugin `ovos-tts-plugin-phoonnx` en OVOS/Mycroft, permite respuestas habladas sin conexion a servicios en la nube, adecuado por su tamano reducido y su inferencia ONNX en CPU.
- Lectura de notificaciones y alertas en dispositivos embebidos: el modelo sintetiza frases cortas con baja latencia y sin GPU, lo que encaja en Raspberry Pi y hardware similar.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en neerlandes para lectores de pantalla o interfaces por voz en aplicaciones de escritorio.
- Sistemas de megafonia y anuncios automatizados: generacion de locuciones pregrabadas o dinamicas en neerlandes para transporte publico, comercios o edificios.
- Prototipado de interfaces conversacionales: permite validar flujos de voz en neerlandes antes de invertir en voces comerciales de mayor calidad.
- Educacion y aprendizaje de idiomas: sintesis de pronunciacion neerlandesa a partir de fonemas IPA, util para herramientas de practica de pronunciacion.
- Domotica por voz: respuestas habladas en asistentes de hogar conectado que operan localmente y priorizan la privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse en ONNX sobre CPU, no requiere GPU dedicada.
- GPU recomendadas: no aplica; el modelo esta disenado para inferencia en CPU.
- Compatibilidad con GPU de consumo: no es un requisito; puede ejecutarse en cualquier CPU moderna.
- Opciones de despliegue: libreria phoonnx (Python) y plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-nl-bart_de_leeuw-gruut (este) | Glow-TTS + HiFi-GAN | nl | ONNX | other (sin registrar) | Hugging Face, phoonnx |
| Otras voces del proyecto Larynx (Rhasspy) | Glow-TTS + vocoder | varios | varios (tar.gz original) | segun release upstream | GitHub rhasspy/larynx |
| Otras voces Glow-TTS empaquetadas por Phoonnx | Glow-TTS + HiFi-GAN | varios | ONNX | other | Coleccion Glow-TTS en Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta neerlandes; no es multilingue.
- Requiere un front-end de fonemizacion gruut (scriptconv) para funcionar correctamente; el texto crudo no se procesa directamente.
- Licencia "other" sin licencia registrada: es imprescindible verificar la licencia del release original de Rhasspy antes de cualquier uso comercial.
- Calidad de sintesis propia de un modelo ligero de la familia Larynx: no orientada a alta fidelidad ni a clonacion de voz.
- Riesgo de errores de pronunciacion en palabras fuera del vocabulario o en neologismos, dado que la entrada es fonetica.
- No se han publicado datos de sesgos, alucinacion ni evaluaciones de calidad en la informacion disponible.
- Para produccion, conviene validar la latencia real en el hardware objetivo y la calidad de audio en el dominio de aplicacion concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-nl-bart_de_leeuw-gruut
- Release original de Larynx (Rhasspy): https://github.com/rhasspy/larynx/releases/download/v1.0/nl_bart_de_leeuw-glow_tts.tar.gz
- Vocoder hifigan-multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
