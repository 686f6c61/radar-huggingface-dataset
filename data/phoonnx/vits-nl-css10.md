# Phoonnx/vits-nl-css10

## Resumen

vits-nl-css10 es un modelo de sintesis de voz (text-to-speech) en neerlandes basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo procede del release v0.8.0 de Coqui TTS, concretamente del paquete `tts_models--nl--css10--vits`, y ha sido adaptado para su ejecucion mediante el runtime ONNX que emplea phoonnx, lo que facilita su integracion en entornos Python y en el ecosistema OVOS (Open Voice OS).

El modelo resuelve la sintesis de voz en neerlandes a partir de texto plano, empleando una entrada basada en caracteres (graphemes) procesada por el fonemizador `GraphemePhonemizer` de la libreria scriptconv. Su relevancia actual radica en que ofrece una alternativa ligera y de codigo abierto (licencia BSD-3-Clause) para TTS en neerlandes, con un tamano de repositorio de aproximadamente 0,1 GB, lo que lo hace adecuado para despliegues en entornos con recursos limitados.

La ficha se basa exclusivamente en la informacion disponible en la model card y en los metadatos de Hugging Face; los datos no publicados se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada por caracteres) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | neerlandes (`nl`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. VITS produce audio de forma directa a partir del texto sin necesidad de un vocoder separado, lo que simplifica el pipeline de inferencia.

El modelo original fue entrenado por Coqui sobre el corpus CSS10 (Common Voice Single Speaker 10), un conjunto de datos multilingue de voz de un solo hablante. No se dispone de informacion detallada sobre el numero de tokens, la composicion exacta del dataset ni sobre el uso de RLHF o DPO en la informacion proporcionada. La innovacion principal de este empaquetado es la conversion a ONNX y su integracion con phoonnx y scriptconv, que normaliza el texto y lo convierte en la entrada del modelo mediante el fonemizador `GraphemePhonemizer`.

## Capacidades

- Sintesis de voz (text-to-speech) en neerlandes a partir de texto plano.
- Entrada basada en caracteres (graphemes) procesada por el fonemizador `GraphemePhonemizer` de scriptconv.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion mediante runtime ONNX, lo que permite despliegue en entornos Python sin dependencias de frameworks de deep learning pesados.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento (thinking mode).

## Casos de uso

- Asistentes de voz en neerlandes: el modelo puede integrarse en OVOS mediante el plugin `ovos-tts-plugin-phoonnx` para proporcionar respuestas habladas en neerlandes en asistentes domesticos, seleccionando la voz `coqui/nl-css10-vits` en la configuracion `mycroft.conf`.
- Lectura de contenido en aplicaciones de accesibilidad: conversion de texto a voz para personas con discapacidad visual que consuman contenido en neerlandes, con un modelo ligero (0,1 GB) que puede ejecutarse en local.
- Generacion de audiolibros o narraciones: sintesis de fragmentos de texto largos en neerlandes para producir narraciones de forma automatizada, aprovechando la salida WAV directa del modelo.
- Sistemas de anuncios automatizados: generacion de mensajes de voz pregrabados en neerlandes para transporte publico, comercios o servicios de atencion telefonica, donde la latencia y el coste por inferencia son relevantes.
- Prototipado rapido de aplicaciones TTS: uso de la API de phoonnx para integrar sintesis de voz en neerlandes en entornos de desarrollo sin necesidad de entrenar un modelo propio, gracias a la licencia BSD-3-Clause.
- Investigacion en TTS de bajo recursos: comparacion de la calidad de VITS frente a otros modelos en neerlandes, usando el corpus CSS10 como referencia y el empaquetado ONNX para experimentos reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el tamano del repositorio (0,1 GB) sugiere un modelo muy ligero, probablemente ejecutable en CPU sin GPU dedicada.
- GPU recomendadas: no disponible; por el tamano del modelo, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) seria mas que suficiente, aunque no se documenta.
- Cabe en consumer GPU: si, dado el tamano reducido del repositorio (0,1 GB), aunque no se especifican requisitos minimos.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS; runtime ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos TTS en neerlandes, por lo que no es posible establecer una comparativa rigurosa con alternativas como otros modelos VITS de Coqui o soluciones TTS comerciales.

## Limitaciones y advertencias

- El modelo solo soporta neerlandes (`nl`); no se documentan otros idiomas.
- Al ser un modelo TTS, puede presentar artefactos de sintesis, pronunciacion incorrecta de palabras extranas o nombres propios, y falta de naturalidad en textos complejos.
- No se dispone de informacion sobre sesgos de generacion de voz (por ejemplo, sesgos de genero, edad o acento del hablante del corpus CSS10).
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda verificar los terminos del modelo original de Coqui y del corpus CSS10 subyacente.
- El modelo esta empaquetado para phoonnx; su uso fuera de ese runtime o de OVOS puede requerir conversion adicional.
- No se documentan limitaciones de contexto porque la entrada es texto por caracteres, pero textos muy largos pueden requerir segmentacion manual.
- La fecha de creacion indicada en los metadatos (2026-11-14) es futura respecto a la redaccion habitual de fichas; se recomienda verificar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl-css10
- Modelo original de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--nl--css10--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
