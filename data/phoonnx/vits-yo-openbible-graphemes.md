# Phoonnx/vits-yo-openbible-graphemes

## Resumen

vits-yo-openbible-graphemes es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui a partir del corpus OpenBible en yoruba y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo convierte texto en yoruba (`yo`) en audio, tomando como entrada caracteres (grafemas) en lugar de fonemas, lo que simplifica el front-end de texto.

El modelo resuelve el problema de la sintesis de voz en un idioma de bajos recursos como el yoruba, para el que existen pocos sistemas TTS publicos. Su relevancia actual radica en que permite integrar voz sintetica en yoruba en asistentes y aplicaciones mediante un paquete ONNX ligero (0,1 GB) y una libreria de inferencia especifica, phoonnx, que tambien ofrece un plugin para el ecosistema OVOS.

La ficha se basa en la informacion disponible en Hugging Face y en la model card del autor; los datos no publicados se indican explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | yoruba (`yo`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial, junto con un modelado de duracion para alinear texto y audio. El modelo original fue entrenado por Coqui sobre el corpus OpenBible en yoruba, segun se indica en la model card.

El empaquetado de Phoonnx convierte los pesos a ONNX para permitir inferencia con su libreria. El front-end de texto utiliza un `GraphemePhonemizer` de la libreria scriptconv, es decir, la entrada son grafemas (caracteres) del texto yoruba, normalizados y convertidos por scriptconv antes de pasar al modelo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni sobre el uso de RLHF o DPO (no aplicable a un TTS de este tipo).

## Capacidades

- Sintesis de voz a partir de texto en yoruba (text-to-speech).
- Entrada basada en grafemas (caracteres) mediante `GraphemePhonemizer` de scriptconv.
- Generacion de audio en formato WAV a traves de la API de phoonnx (`voice.synthesize_wav`).
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Soporte multilingue limitado al yoruba (`yo`).
- No dispone de tool calling, capacidades de agente, vision, audio de entrada ni modo de razonamiento; es un modelo puramente TTS.

## Casos de uso

- Asistentes de voz en yoruba: el modelo puede sintetizar respuestas habladas en yoruba dentro de un asistente basado en OVOS, seleccionando la voz `coqui/yor-openbible-vits` en `mycroft.conf`.
- Lectura de textos y articulos: conversion de contenido escrito en yoruba a audio para consumo en movilidad o accesibilidad.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de documentos y contenidos digitales en yoruba.
- Aplicaciones educativas: sintesis de material didactico y ejercicios de pronunciacion en yoruba.
- Contenido audiovisual: generacion de narraciones y locuciones en yoruba para videos, podcasts o audiolibros.
- Integracion en pipelines de Python: uso de phoonnx con `TTSModelManager` para generar WAVs de forma programatica en servicios de sintesis.
- Preservacion linguistica: produccion de audio en un idioma de bajos recursos con recursos TTS limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, lo que sugiere un modelo pequeno apto para CPU.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del paquete es plausible su ejecucion en CPU, pero no hay datos oficiales.
- Opciones de despliegue: libreria phoonnx (Python) y plugin `ovos-tts-plugin-phoonnx` para OVOS; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones comparables en la informacion proporcionada para establecer una comparativa fiable con otros modelos TTS en yoruba.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vits-yo-openbible-graphemes | no disponible | no aplica | CC-BY-SA-4.0 | Hugging Face (Phoonnx) |
| Alternativas TTS en yoruba | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar del corpus OpenBible, el estilo y el dominio del habla pueden estar sesgados hacia ese registro.
- Riesgo de alucinacion: en TTS se traduce en pronunciaciones incorrectas o prosodia inadecuada en textos fuera del dominio de entrenamiento; no cuantificado.
- Limitaciones de idioma: solo yoruba (`yo`); no soporta otros idiomas.
- Limitaciones de contexto: no aplica ventana de contexto de texto; la calidad puede degradarse en frases largas o con caracteres fuera del inventario de grafemas.
- Restricciones de licencia: CC-BY-SA-4.0 implica atribucion y compartir bajo la misma licencia las obras derivadas; revisar compatibilidad para uso comercial y para productos derivados.
- Caveats para produccion: modelo con 19 descargas y 0 likes, sin benchmarks publicados; conviene validar la calidad de sintesis en el dominio de uso antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-yo-openbible-graphemes
- Modelo original de Coqui: https://github.com/coqui-ai/TTS/releases/download/v0.6.2_models/tts_models--yor--openbible--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
