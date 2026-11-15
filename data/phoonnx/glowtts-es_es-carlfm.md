# Phoonnx/glowtts-es_es-carlfm

## Resumen

glowtts-es_es-carlfm es un modelo de sintesis de voz (text-to-speech) en castellano de Espana, concretamente la variante `es-ES` con la voz `carlfm`. No es un modelo de lenguaje generativo, sino un sistema acustico TTS basado en la arquitectura Glow-TTS que convierte fonemas en espectrogramas, que posteriormente se transforman en audio mediante un vocoder HiFi-GAN. El modelo original fue entrenado por Rhasspy dentro del proyecto Larynx v1.0 y ha sido empaquetado en formato ONNX por Phoonnx para su uso en su libreria de inferencia TTS en Python y en el ecosistema OVOS (Open Voice OS).

La relevancia de este modelo radica en su caracter ligero y su formato ONNX, que permite ejecutarlo en entornos con recursos limitados, incluyendo dispositivos de borde (edge) y sistemas embebidos, sin necesidad de GPUs dedicadas. El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace adecuado para despliegues donde el tamano del artefacto es critico. Se integra con el front-end de texto `scriptconv` mediante el fonemizador `gruut`, que normaliza el texto y lo convierte a fonemas IPA antes de la sintesis.

No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto (concepto no aplicable directamente a TTS) ni los datos exactos de entrenamiento en la informacion proporcionada. La licencia figura como "other" sin especificar, por lo que se recomienda consultar la release original de Rhasspy antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico normalizing flow) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | es-ES (castellano de Espana) |
| Licencia | other (sin especificar; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut (alfabeto IPA) |
| Vocoder | hifigan-multi-vctk-small |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis acustica basado en normalizing flows que modela directamente la distribucion de espectrogramas mel condicionada a la secuencia de fonemas, sin necesidad de un aligner externo ni de atencion autoregresiva. Esto permite una sintesis rapida y paralela, adecuada para aplicaciones de baja latencia. El modelo genera un espectrograma que despues es convertido a forma de onda por el vocoder HiFi-GAN (`hifigan-multi-vctk-small`), un generador adversarial entrenado para producir audio de alta fidelidad a partir de espectrogramas mel.

El modelo original fue entrenado por Rhasspy dentro del proyecto Larynx v1.0 sobre la voz `carlfm` en castellano de Espana. No se dispone en la informacion proporcionada del numero de horas de audio, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino especifico. El empaquetado por parte de Phoonnx consiste en la conversion a ONNX y la integracion con el pipeline de `scriptconv` para la normalizacion de texto y la fonemizacion con gruut.

## Capacidades

- Sintesis de voz (text-to-speech) en castellano de Espana (`es-ES`) a partir de texto plano.
- Conversion de texto a fonemas IPA mediante el fonemizador gruut integrado en `scriptconv`.
- Generacion de espectrogramas mel y conversion a audio WAV mediante vocoder HiFi-GAN.
- Ejecucion en formato ONNX, compatible con entornos de inferencia ligeros y despliegue en dispositivos de borde.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Una unica voz disponible: `larynx/es-es-carlfm-glow_tts`.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Asistentes de voz en dispositivos de borde: el modelo puede ejecutarse en formato ONNX sobre CPU en dispositivos con recursos limitados (Raspberry Pi, routers, altavoces inteligentes) para sintetizar respuestas habladas en castellano sin depender de la nube.
- Integracion en OVOS (Open Voice OS): mediante el plugin `ovos-tts-plugin-phoonnx`, se puede configurar como motor TTS en `mycroft.conf` para asistentes de voz de codigo abierto que requieran una voz en castellano de Espana.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en sistemas de monitorizacion, domotica o mensajeria automatizada donde se necesita una voz clara en es-ES con baja latencia.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual, aprovechando el reducido tamano del modelo (0,1 GB) para despliegue local.
- Generacion de audiolibros o contenido narrado por lotes: sintesis de grandes volumenes de texto a WAV mediante scripts en Python con la API de phoonnx, adecuado para pipelines offline.
- Prototipado rapido de interfaces conversacionales: al ser un modelo ligero y de instalacion sencilla (`pip install --pre phoonnx "scriptconv[gruut]"`), permite validar flujos de voz en castellano antes de invertir en modelos TTS de mayor calidad.
- Sistemas de megafonia o anuncios automatizados: generacion de avisos pregrabados en castellano para transporte publico, comercios o instalaciones con requisitos de despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que funcione en CPU sin GPU dedicada, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponibles; el modelo esta disenado para inferencia en CPU en entornos de borde.
- Compatibilidad con GPU consumer: no confirmada, aunque por tamano (0,1 GB) cabria en cualquier GPU consumer moderna; no se dispone de datos oficiales.
- Opciones de despliegue: libreria `phoonnx` (Python) y plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamano | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-es_es-carlfm (este modelo) | Glow-TTS + HiFi-GAN | es-ES | ONNX | other (sin especificar) | 0,1 GB | Hugging Face (Phoonnx) |
| Piper (rhasspy/piper-voices) | VITS | Multiples (incl. es) | ONNX | MIT (segun proyecto) | Variable | Hugging Face / GitHub |
| Coqui TTS (XTTS v2) | GPT-based TTS | Multiples (incl. es) | PyTorch | Coqui Public Model License | ~1,8 GB | Hugging Face / GitHub |
| Larynx (original) | Glow-TTS / VITS | Multiples | TensorFlow / ONNX | other | Variable | GitHub (rhasspy/larynx) |

Nota: los datos de los modelos comparables provienen de conocimiento general y pueden no estar actualizados; consultar las fuentes oficiales para confirmar licencias y especificaciones.

## Limitaciones y advertencias

- Licencia "other" sin especificar: no se puede confirmar el uso comercial sin consultar la release original de Rhasspy en GitHub.
- Una unica voz (`carlfm`) y un unico idioma (`es-ES`); no soporta otros idiomas ni variantes dialectales.
- No es un modelo de lenguaje: no razona, no genera codigo, no soporta tool calling ni agentes.
- Riesgo de pronunciacion incorrecta en palabras extranas, siglas o terminos no cubiertos por el fonemizador gruut.
- La calidad de sintesis depende del vocoder HiFi-GAN y del front-end de texto; puede presentar artefactos en frases largas o con puntuacion atipica.
- No se dispone de informacion sobre sesgos acusticos (genero, edad, prosodia) ni sobre la composicion del dataset de entrenamiento.
- Modelo con muy pocas descargas (36) y 0 likes en el momento de la consulta; ecosistema y soporte limitados.
- No se han publicado benchmarks objetivos de calidad (MOS, WER) en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-es_es-carlfm
- Release original de Rhasspy Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/es-es_carlfm-glow_tts.tar.gz
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Proyecto Larynx (Rhasspy): https://github.com/rhasspy/larynx
