# Phoonnx/styletts2-en_us-kitten-nano_0.2

## Resumen

styletts2-en_us-kitten-nano_0.2 es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, desarrollado originalmente por KittenML como `KittenML/kitten-tts-nano-0.2` y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo resuelve el problema de generar habla natural en ingles estadounidense a partir de texto, con un enfoque en voces expresivas y un tamano reducido que lo hace apto para despliegues ligeros.

La relevancia de este empaquetado radica en su integracion con el ecosistema phoonnx y OVOS (Open Voice OS), lo que permite incorporar sintesis de voz en asistentes y aplicaciones de voz de codigo abierto sin depender de servicios en la nube. El modelo acepta fonemas espeak en alfabeto IPA como entrada de texto, lo que requiere un front-end de fonemizacion adicional (scriptconv con espeak-ng).

El repositorio incluye ocho voces empaquetadas (variantes femeninas y masculinas identificadas como expr-voice-2 a expr-voice-5). La licencia declarada es Apache 2.0, heredada del modelo upstream. El modelo esta orientado exclusivamente al idioma ingles (en-US).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Voces incluidas | 8 (expr-voice-2-f/m, 3-f/m, 4-f/m, 5-f/m) |
| Libreria | phoonnx |
| Tamano del repositorio | 0.0 GB (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura StyleTTS2, un sistema de sintesis de voz neuronal basado en difusion y modelado de estilo que permite generar habla con control sobre la expresividad. StyleTTS2 combina un codificador acustico con un decodificador y un modelo de estilo que condiciona la prosodia y el timbre de la voz generada. El modelo upstream es `KittenML/kitten-tts-nano-0.2`, una variante compacta ("nano") de la familia Kitten TTS.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El empaquetado por parte de Phoonnx consiste en la conversion a ONNX y la integracion con el front-end de texto de scriptconv, que normaliza el texto y lo convierte a fonemas espeak (IPA) antes de la inferencia. La fonemizacion se realiza mediante `EspeakPhonemizer` del modulo `scriptconv_copyleft.phonemizers.mul`, que requiere espeak-ng instalado en el sistema o el port espyak incluido en el extra `phoonnx[espeak]`.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de texto en fonemas espeak (IPA).
- Generacion de audio en formato WAV mediante la API `voice.synthesize_wav`.
- Ocho voces predefinidas con variantes femeninas y masculinas (expr-voice-2 a expr-voice-5).
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Normalizacion y conversion de texto a fonemas mediante la libreria scriptconv.
- Soporte de fonemizacion via espeak-ng o via el port espyak (con posibles diferencias foneticas).
- No se documentan capacidades de clonacion de voz, multilingueismo, tool calling ni agentes.

## Casos de uso

- Asistentes de voz de codigo abierto: integracion directa en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en ingles sin depender de APIs externas.
- Aplicaciones de escritorio y embebidas: el formato ONNX y el tamano reducido del modelo nano facilitan su despliegue en entornos con recursos limitados donde no cabe un modelo TTS de mayor tamano.
- Generacion de audiolibros y contenido narrado: las ocho voces permiten alternar timbres y generos para narraciones largas en ingles.
- Sistemas de accesibilidad: conversion de texto a voz para lectores de pantalla o interfaces de asistencia en ingles estadounidense.
- Prototipado de interfaces conversacionales: su API sencilla en Python (`TTSModelManager`, `load`, `synthesize_wav`) permite iterar rapidamente en demos y pruebas de concepto.
- Automatizacion de avisos y notificaciones habladas: generacion de mensajes de voz pregrabados en pipelines de CI/CD o sistemas de alertas, dado que el modelo se ejecuta localmente y no requiere conexion.
- Investigacion en TTS: como punto de partida para experimentar con StyleTTS2 en formato ONNX y comparar variantes de la coleccion de Phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al tratarse de un modelo "nano" en formato ONNX, se espera un consumo reducido, pero no se confirma una cifra.
- GPU recomendadas: no disponible. El uso de ONNX permite ejecucion en CPU y en GPU, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: libreria phoonnx (Python) y plugin OVOS `ovos-tts-plugin-phoonnx`; requiere espeak-ng o el port espyak para la fonemizacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| styletts2-en_us-kitten-nano_0.2 (este) | StyleTTS2 | en-US | Apache 2.0 | ONNX | Empaquetado phoonnx, 8 voces |
| KittenML/kitten-tts-nano-0.2 (upstream) | StyleTTS2 | en-US | Apache 2.0 | no disponible en la informacion | Modelo original de KittenML |
| Otros modelos de la coleccion StyleTTS2 de Phoonnx | StyleTTS2 | no disponible | no disponible | ONNX | Misma familia de empaquetados |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita a arquitectura, licencia y formato.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- Requiere fonemizacion previa con espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Dependencia de la libreria phoonnx en version preliminar (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API.
- No se dispone de informacion sobre sesgos de generacion, calidad de las voces o tasas de alucinacion/artefactos acusticos.
- La licencia Apache 2.0 permite uso comercial, pero se hereda de la declaracion del modelo upstream; conviene verificar la model card original de KittenML.
- El tamano del repositorio figura como 0.0 GB en los metadatos, lo que puede indicar un error de medicion o pesos alojados externamente; verificar antes de desplegar.
- No se documentan mecanismos de clonacion de voz ni control fino de prosodia mas alla de la seleccion de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-en_us-kitten-nano_0.2
- Modelo upstream: https://huggingface.co/KittenML/kitten-tts-nano-0.2
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
