# Phoonnx/vits-tw_gh-akuapem_openbible-graphemes

## Resumen

`vits-tw_gh-akuapem_openbible-graphemes` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`. El modelo convierte texto en audio para el idioma twi (codigo `tw`, variante `tw-GH`, dialecto akuapem de Ghana), y esta entrenado sobre el corpus OpenBible.

El modelo resuelve el problema de la sintesis de voz para una lengua de bajos recursos como el twi, que cuenta con pocos recursos TTS publicos. Su relevancia radica en que permite integrar sintesis de voz en twi en asistentes y aplicaciones mediante la libreria phoonnx y el ecosistema OVOS, sin necesidad de entrenar un modelo desde cero.

Se trata de un modelo VITS de tamano reducido (repositorio de 0,1 GB), con entrada basada en grafemas (no fonemas) y licencia CC-BY-SA 4.0. No se dispone de informacion publica sobre numero de parametros, contexto ni datos de entrenamiento mas alla de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | twi (`tw`, `tw-GH`, dialecto akuapem) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. VITS sintetiza audio directamente desde texto sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

El modelo fue entrenado por Coqui sobre el corpus OpenBible para el dialecto akuapem del twi, y posteriormente exportado a ONNX por Phoonnx. La entrada de texto se procesa mediante `GraphemePhonemizer` de la libreria `scriptconv`, es decir, el modelo opera directamente sobre grafemas en lugar de fonemas. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en TTS).

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en twi (dialecto akuapem, Ghana).
- Entrada basada en grafemas, sin necesidad de un fonemizador especifico del idioma.
- Generacion de audio en formato WAV mediante la API de phoonnx.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Soporte de multiples voces gestionadas por `TTSModelManager` (la voz concreta es `coqui/tw_akuapem-openbible-vits`).
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni modo thinking (no es un modelo de lenguaje).

## Casos de uso

- Asistentes de voz en twi: el modelo permite dotar a un asistente OVOS de sintesis de voz en twi akuapem, configurando el plugin `ovos-tts-plugin-phoonnx` en `mycroft.conf` con la voz `coqui/tw_akuapem-openbible-vits`.
- Lectura de textos religiosos: dado que el modelo se entreno sobre OpenBible, es adecuado para la lectura en voz alta de pasajes biblicos y textos devocionales en twi.
- Accesibilidad para hablantes de twi: conversion de texto a voz para personas con discapacidad visual o dificultades de lectura en esta lengua.
- Aplicaciones educativas: sintesis de material didactico en twi para escuelas y programas de alfabetizacion en Ghana.
- Integracion en pipelines de Python: uso de la API `voice.synthesize_wav(text, wav_file)` para generar ficheros WAV en aplicaciones de escritorio o servidor.
- Prototipado rapido de interfaces de voz: al ser un modelo ONNX ligero (repositorio de 0,1 GB), se puede desplegar en entornos con recursos limitados para pruebas de concepto de TTS en twi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en CPU y en GPUs de gama baja, aunque no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por el tamano del repositorio (0,1 GB) es plausible que funcione en hardware modesto, pero no se especifica.
- Opciones de despliegue: libreria `phoonnx` (Python) y plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-tw_gh-akuapem_openbible-graphemes | VITS (ONNX) | twi (akuapem) | no disponible | CC-BY-SA 4.0 | Hugging Face (Phoonnx) |
| Otros modelos VITS de la coleccion Phoonnx | VITS (ONNX) | varios | no disponible | variable | Hugging Face (Phoonnx) |
| Modelos TTS multilingues de Coqui | VITS / otros | varios | no disponible | variable | Coqui TTS |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; el modelo se entreno sobre OpenBible, lo que puede sesgar el estilo y el vocabulario hacia el registro religioso.
- Riesgo de alucinacion: en TTS, puede producirse una pronunciacion incorrecta o artefactos en palabras fuera del dominio de entrenamiento; no se cuantifica en la informacion disponible.
- Limitaciones de contexto o idioma: solo soporta twi (dialecto akuapem, `tw-GH`); no se documenta soporte para otros dialectos del twi ni para otras lenguas.
- Restricciones de licencia: CC-BY-SA 4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas; es preciso revisar las implicaciones para uso comercial.
- Caveats para produccion: el modelo tiene solo 19 descargas y 0 likes, lo que sugiere poca validacion por la comunidad; no se documentan pruebas de robustez ni de calidad de audio.
- La libreria `phoonnx` se instala con `pip install --pre phoonnx`, es decir, es una version preliminar (pre-release).

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-tw_gh-akuapem_openbible-graphemes
- Modelo upstream (Coqui TTS v0.6.2): https://github.com/coqui-ai/TTS/releases/download/v0.6.2_models/tts_models--tw_akuapem--openbible--vits.zip
- phoonnx (repositorio): https://github.com/TigreGotico/phoonnx
- scriptconv (repositorio): https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
