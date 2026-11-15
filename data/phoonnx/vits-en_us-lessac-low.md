# Phoonnx/vits-en_us-lessac-low

## Resumen

vits-en_us-lessac-low es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede de Rhasspy, concretamente de la voz `en_US/lessac/low` del repositorio `rhasspy/piper-voices`, y este repositorio constituye unicamente una redistribucion en formato ONNX adaptada al ecosistema phoonnx. Resuelve la generacion de audio hablado en ingles estadounidense a partir de texto, con un tamano de repositorio de aproximadamente 0,1 GB que lo situa en la categoria de modelos ligeros y desplegables en entornos con recursos limitados.

La relevancia de este empaquetado reside en su integracion con phoonnx, una libreria Python que gestiona la carga de modelos, la fonemizacion mediante espeak-ng y la sintesis a WAV, ademas de ofrecer un plugin para el asistente OVOS. Al estar disponible en formato ONNX, puede ejecutarse tanto en Python como en el navegador mediante phoonnx.js. La licencia MIT y el tamano reducido lo convierten en una opcion practica para prototipos de TTS, asistentes locales y aplicaciones embebidas que no requieren infraestructura de GPU dedicada.

Se trata de una voz de calidad "low", lo que implica una huella menor y una latencia potencialmente mas baja a costa de naturalidad frente a las variantes medium o high del mismo conjunto de voces Piper. El modelo no incorpora capacidades multimodales ni de razonamiento: su funcion es exclusivamente la sintesis de voz a partir de fonemas IPA generados por espeak-ng.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; variante "low" del upstream) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | aproximadamente 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Autor del modelo original | Rhasspy |
| Empaquetador | Phoonnx |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador acustico basado en normalizing flows y un vocoder neuronal, entrenados conjuntamente con perdidas adversarias y de reconstruccion. Esta aproximacion permite sintetizar waveform directamente a partir de fonemas sin un pipeline separado de vocoder.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas en la informacion proporcionada. El modelo original fue entrenado por Rhasspy como parte del conjunto Piper; este repositorio se limita a empaquetar los pesos en ONNX para phoonnx. La variante "low" corresponde a una configuracion de menor capacidad del modelo Piper, orientada a inferencia rapida y bajo consumo de recursos.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US).
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemizacion basada en espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Ejecucion en Python a traves de `TTSModelManager` y en el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador con phoonnx.js, con entrada por espeak o unicode.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni vision.
- Capacidad multilingue limitada exclusivamente al ingles estadounidense.

## Casos de uso

- Asistentes de voz locales: integracion en OVOS mediante `ovos-tts-plugin-phoonnx`, configurando la voz `piper/en_US-lessac-low` en `mycroft.conf` para respuestas habladas en tiempo real sin dependencia de servicios en la nube.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en aplicaciones de escritorio o IoT, aprovechando el bajo tamano del modelo (aproximadamente 0,1 GB) para despliegue en dispositivos con almacenamiento limitado.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o interfaces de accesibilidad en entornos de habla inglesa, con latencia reducida por la variante "low".
- Prototipado de pipelines TTS: uso de phoonnx como capa de abstraccion para comparar esta voz con otras del catalogo antes de pasar a variantes medium o high.
- TTS en navegador: despliegue mediante phoonnx.js con la demo en tigregotico.pt/demo para generar audio en cliente sin backend.
- Pruebas de integracion en CI: validacion automatizada de pipelines de sintesis en Python usando la API de phoonnx y espeak-ng instalado en el entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del repositorio (aproximadamente 0,1 GB), es plausible su ejecucion en CPU, aunque no se confirma con datos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible; el uso de ONNX sugiere posible ejecucion en CPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS VITS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-en_us-lessac-low (este modelo) | VITS | en-US | aprox. 0,1 GB | MIT | ONNX | Variante "low" de Piper, empaquetada para phoonnx |
| Otras voces Piper en_US (variantes medium/high) | VITS | en-US | no disponible | MIT (segun upstream) | ONNX | Mayor calidad a costa de tamano y latencia; disponibles en rhasspy/piper-voices |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varias | no disponible | MIT (segun upstream) | ONNX | Mismo empaquetado para phoonnx; idiomas y voces distintas |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- La variante "low" ofrece menor naturalidad que las variantes medium o high del mismo conjunto Piper.
- La fonemizacion depende de espeak-ng; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, tal como advierte la model card.
- Riesgo de alucinacion acustica o pronunciacion incorrecta en textos con nombres propios, siglas o terminos fuera del dominio de entrenamiento.
- No se dispone de informacion sobre sesgos demograficos o acusticos del modelo original.
- Licencia MIT permite uso comercial, pero se recomienda verificar la licencia del upstream `rhasspy/piper-voices` antes de redistribuir.
- No es adecuado para tareas de razonamiento, codigo, vision ni agentes; su unico proposito es la sintesis de voz.
- El repo tiene 31 descargas y 0 likes en el momento de la consulta, lo que refleja un uso muy limitado y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-lessac-low
- Upstream (Rhasspy Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/lessac/low
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
