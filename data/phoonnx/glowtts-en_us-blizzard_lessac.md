# Phoonnx/glowtts-en_us-blizzard_lessac

## Resumen

`Phoonnx/glowtts-en_us-blizzard_lessac` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente entrenado por Rhasspy como parte del proyecto Larynx (version 1.0) y reempaquetado en formato ONNX por Phoonnx para su uso con la libreria `phoonnx`. El modelo genera espectrogramas a partir de fonemas IPA en ingles estadounidense (`en-US`) y delega la sintesis de forma de onda final en un vocoder HiFi-GAN (`hifigan-multi-vctk-small`), que Phoonnx descarga junto con la voz.

La relevancia de este modelo es practica: se trata de un componente ligero (el repositorio ocupa aproximadamente 0,1 GB) pensado para despliegue local en asistentes de voz y sistemas embebidos, especialmente dentro del ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`. No es un modelo de proposito general ni un sistema neuronal de gran escala: es una voz concreta (blizzard_lessac) dentro de una coleccion mas amplia de voces Glow-TTS empaquetadas por Phoonnx.

El modelo no esta pensado para razonamiento, generacion de texto ni comprension del lenguaje; su unica funcion es convertir texto en audio. La informacion publica disponible es escasa y no incluye detalles de entrenamiento, benchmarks ni especificaciones completas de la arquitectura mas alla de su nombre y su cadena de procesamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow para sintesis de espectrogramas) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la entrada es texto por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ingles estadounidense (`en-US`) |
| Licencia | `other` (sin licencia registrada; consultar el release upstream de Rhasspy/Larynx) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut, alfabeto IPA |
| Vocoder | `hifigan-multi-vctk-small` (Phoonnx) |
| Tamano del repositorio | ~0,1 GB |
| Libreria | `phoonnx` |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en normalizing flows que aprende una correspondencia entre fonemas y espectrogramas mel, con un alineamiento monotono aprendido (sin necesidad de un alineador externo tipo attention). La salida del modelo es un espectrograma que posteriormente se convierte en audio mediante un vocoder neuronal; en este caso, el vocoder es `hifigan-multi-vctk-small`, un HiFi-GAN pequeno entrenado sobre Multi-VCTK y empaquetado por Phoonnx.

El modelo original procede del proyecto Larynx de Rhasspy (release v1.0), orientado a TTS offline de baja latencia para asistentes de voz. No se dispone de informacion publica en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset, el corpus `blizzard_lessac` en detalle, ni sobre si se aplicaron tecnicas de RLHF o ajuste fino adicional. El front-end de texto no forma parte del modelo: Phoonnx delega la normalizacion y la fonemizacion en `scriptconv`, usando `GruutPhonemizer` del modulo `scriptconv.phonemizers.mul` (extra `scriptconv[gruut]`).

## Capacidades

- Sintesis de voz en ingles estadounidense (`en-US`) a partir de texto plano.
- Generacion de espectrogramas mediante Glow-TTS y conversion a forma de onda con HiFi-GAN.
- Fonemizacion de entrada mediante gruut (alfabeto IPA), integrada en el pipeline de Phoonnx.
- Integracion con asistentes de voz OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion offline: no requiere servicios en la nube ni conexion a internet una vez descargados el modelo y el vocoder.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- Capacidad multilingue: no; unicamente `en-US`.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: la voz se selecciona en `mycroft.conf` con el modulo `ovos-tts-plugin-phoonnx` y se usa para leer respuestas del asistente sin depender de APIs externas.
- Lectura de notificaciones y alertas en dispositivos domoticos: al ser un modelo ligero (~0,1 GB) y offline, puede ejecutarse en un mini-PC o Raspberry Pi junto al resto del stack de voz.
- Generacion de avisos pregrabados en aplicaciones de accesibilidad: conversion de texto dinamico a audio para lectores de pantalla o interfaces por voz en ingles.
- Prototipado rapido de pipelines TTS en Python: la API `TTSModelManager` de Phoonnx permite cargar la voz y escribir WAV con pocas lineas, util para pruebas de concepto.
- Generacion de audio para pruebas automatizadas de sistemas de reconocimiento de voz: sirve para producir utterances sinteticas en `en-US` con una voz concreta.
- Sustitucion de voces en entornos sin conectividad: escenarios de kiosco, robotica o dispositivos edge donde no se puede enviar texto a un servicio TTS en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamano del repositorio (~0,1 GB) y la naturaleza de Glow-TTS + HiFi-GAN pequeno, es esperable que quepa en GPUs consumer con pocos GB, aunque no se confirma en la documentacion.
- GPU recomendadas: no disponibles; el modelo esta empaquetado en ONNX, lo que permite ejecucion en CPU.
- Compatibilidad con GPU consumer: probable en RTX 3060/4060 y superiores por el reducido tamano, sin dato oficial.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/glowtts-en_us-blizzard_lessac` | no disponible | no aplica | en-US | other (sin registrar) | ONNX | Glow-TTS + HiFi-GAN, empaquetado para phoonnx |
| Otras voces de la coleccion Glow-TTS de Phoonnx | no disponible | no aplica | segun voz | other | ONNX | Misma arquitectura, distintas voces |
| Piper (rhasspy) | no disponible | no aplica | multilingue | MIT (segun proyecto) | ONNX | Sucesor practico de Larynx en el ecosistema Rhasspy |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia figura como `other` y la propia model card indica que no hay licencia registrada: es imprescindible revisar el release upstream de Rhasspy/Larynx antes de cualquier uso, incluido el comercial.
- Solo soporta ingles estadounidense; no hay soporte multilingue.
- La entrada debe pasar por el front-end de `scriptconv` con gruut para producir fonemas IPA; un uso directo sin ese pipeline puede degradar la calidad.
- Al ser un modelo TTS, no tiene capacidades de razonamiento, codigo, matematicas ni tool calling; no debe evaluarse como LLM.
- No se publican datos sobre sesgos de la voz, calidad en dominios especificos ni robustez ante texto anomalo.
- Riesgo de pronunciacion incorrecta en nombres propios, siglas y terminos fuera del dominio de entrenamiento (comportamiento esperado en TTS basado en fonemas).
- Dependencia de un vocoder externo (`hifigan-multi-vctk-small`); la calidad final depende de ambos componentes.
- No hay informacion publica sobre latencia, throughput ni requisitos minimos de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-blizzard_lessac
- Release upstream de Rhasspy/Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_blizzard_lessac-glow_tts.tar.gz
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
