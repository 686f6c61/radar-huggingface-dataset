# Phoonnx/styletts2-eu_es-hitz-ahotts

## Resumen

styletts2-eu_es-hitz-ahotts es un modelo de sintesis de voz (text-to-speech) en euskera (variante `eu-ES`) desarrollado originalmente por el centro HiTZ y empaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`. Se trata de una conversion del modelo upstream HiTZ/StyleTTS2-eu, que aplica la arquitectura StyleTTS2, un sistema TTS neuronal basado en difusion y representaciones de estilo que permite generar habla con entonacion y prosodia controlables.

El modelo resuelve la necesidad de sintesis de voz de calidad en euskera, un idioma con recursos limitados en el ecosistema TTS. La entrada de texto no se realiza directamente en caracteres, sino que requiere fonemas en alfabeto IPA generados mediante el fonemizador AhoTTS incluido en la libreria `scriptconv` (extra `scriptconv[eu]`). El paquete pesa 0,3 GB y esta pensado para despliegue ligero en Python y en el asistente de voz OVOS.

Su relevancia actual radica en que ofrece una via practica para integrar TTS en euskera en asistentes de voz y aplicaciones de sintesis mediante una libreria ONNX estandarizada, con licencia Apache-2.0 y dos voces predefinidas (`hitz/eu-antton` y `hitz/eu-maider`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | euskera (`eu-ES`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas AhoTTS en alfabeto IPA |
| Tamano del repositorio | 0,3 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Voces incluidas | `hitz/eu-antton`, `hitz/eu-maider` |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura StyleTTS2, un sistema de sintesis de voz neuronal que combina un codificador de estilo con generacion basada en difusion para producir habla con control de prosodia y timbre. Esta ficha se centra en el empaquetado ONNX realizado por Phoonnx a partir del modelo upstream HiTZ/StyleTTS2-eu; no se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO.

La innovacion practica de este empaquetado es la integracion del front-end de texto: el texto se normaliza y convierte a fonemas IPA mediante el fonemizador `AhoTTSPhonemizer` de `scriptconv_copyleft.phonemizers.eu`, que se instala con el extra `scriptconv[eu]`. El modelo no acepta texto en crudo, sino la secuencia de fonemas resultante de este proceso. El autor upstream declara variantes base y de emocion (`hitz-eu-styletts2/*`, `hitz-eu-emo-styletts2/*`) bajo licencia Apache-2.0.

## Capacidades

- Sintesis de voz (text-to-speech) en euskera `eu-ES` a partir de fonemas IPA.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de `phoonnx`.
- Dos voces predefinidas: `hitz/eu-antton` y `hitz/eu-maider`.
- Normalizacion y conversion de texto a fonemas mediante `scriptconv` y el fonemizador AhoTTS.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades multimodales (vision, audio de entrada).
- Capacidad multilingue limitada al euskera (unico idioma declarado).

## Casos de uso

- Asistentes de voz en euskera: el modelo se integra en OVOS mediante `ovos-tts-plugin-phoonnx`, permitiendo que un asistente domotico o de escritorio responda en euskera seleccionando la voz `hitz/eu-antton` o `hitz/eu-maider` en `mycroft.conf`.
- Lectura de contenido en euskera: conversion de articulos, noticias o documentacion a audio WAV para consumo en podcast o audiolibros, usando el pipeline `scriptconv` para fonemizar el texto antes de la sintesis.
- Accesibilidad para personas con discapacidad visual: generacion de respuestas habladas en euskera en aplicaciones de lectura de pantalla o interfaces de voz.
- Senalizacion y avisos automaticos: sintesis de mensajes cortos en sistemas de megafonia, transporte publico o servicios de atencion telefonica en euskera.
- Prototipado de interfaces conversacionales: al ser un paquete ONNX ligero (0,3 GB) y con licencia Apache-2.0, permite experimentar con TTS en euskera sin depender de servicios en la nube.
- Generacion de voces para doblaje o contenido multimedia: produccion de pistas de audio en euskera para videos o materiales educativos con dos timbres distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el tamano del repositorio es de 0,3 GB, lo que sugiere un modelo ligero apto para CPU y GPU de gama baja.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por tamano del paquete es plausible en GPU de consumo, pero no hay dato verificado.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecucion via ONNX Runtime.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| styletts2-eu_es-hitz-ahotts | StyleTTS2 | euskera (`eu-ES`) | Apache-2.0 | ONNX | Hugging Face, via phoonnx |
| HiTZ/StyleTTS2-eu (upstream) | StyleTTS2 | euskera (`eu-ES`) | Apache-2.0 | no disponible | Hugging Face |
| Otros modelos StyleTTS2 de la coleccion Phoonnx | StyleTTS2 | diversos | no disponible | ONNX | Hugging Face, via phoonnx |

No se dispone en la informacion proporcionada de datos de rendimiento ni de otros modelos TTS en euskera comparables con especificaciones verificables.

## Limitaciones y advertencias

- El modelo solo acepta fonemas IPA generados por el fonemizador AhoTTS; no procesa texto en crudo directamente, lo que exige instalar `scriptconv[eu]` y realizar el paso de fonemizacion.
- Cobertura limitada a un unico idioma (`eu-ES`); no soporta otros idiomas.
- No se dispone de informacion sobre sesgos, calidad de las voces ni evaluaciones subjetivas (MOS).
- Riesgo de alucinacion acustica o errores de pronunciacion en palabras fuera del vocabulario o en fonemas mal generados por el fonemizador.
- No hay datos publicados sobre latencia, throughput ni requisitos de hardware verificados.
- La licencia Apache-2.0 del modelo upstream permite uso comercial, pero conviene revisar las condiciones del fonemizador AhoTTS incluido en `scriptconv_copyleft.phonemizers.eu`, cuyo nombre sugiere una licencia distinta (copyleft) que puede imponer restricciones adicionales.
- El modelo tiene muy poca adopcion (20 descargas, 0 likes en el momento de la consulta), por lo que la comunidad y el soporte son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-eu_es-hitz-ahotts
- Modelo upstream: https://huggingface.co/HiTZ/StyleTTS2-eu
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
