# Phoonnx/vits-nl_be-nathalie-x_low-espeak

## Resumen

`vits-nl_be-nathalie-x_low-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede de Rhasspy, concretamente de la coleccion `rhasspy/piper-voices`, en la ruta `nl/nl_BE/nathalie/x_low`. Se trata, por tanto, de una voz femenina en neerlandes de Belgica (nl-BE) con la etiqueta de calidad `x_low`, la mas ligera de la escala de Piper.

El modelo resuelve el problema de sintesis de voz local y de baja latencia para el idioma neerlandes belga, con un empaquetado orientado a inferencia ONNX. Su relevancia radica en que permite integrar TTS en asistentes de voz y sistemas embebidos sin depender de servicios en la nube, con una licencia MIT que facilita el uso comercial. El texto de entrada se convierte a fonemas mediante espeak-ng en alfabeto IPA, lo que condiciona tanto la calidad como la integracion.

La ficha se basa exclusivamente en la informacion publicada en la model card y en los metadatos de Hugging Face. No se dispone de datos sobre numero de parametros, arquitectura interna detallada, corpus de entrenamiento ni resultados de benchmarks, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variante Piper, exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (el sufijo `x_low` indica la variante de menor calidad/tamano de Piper) |
| Idiomas soportados | neerlandes de Belgica (`nl-BE`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Libreria de inferencia | phoonnx (Python y OVOS) |
| Tamano del repositorio | 0.0 GB (segun metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior variacional y un decoder generativo basado en flujos normalizadores y un discriminador adversarial en entrenamiento. La variante concreta es la exportacion de Piper correspondiente a `nl_BE/nathalie/x_low`, es decir, la configuracion de menor calidad y tamano de la escala de voces de Piper, pensada para entornos con recursos limitados.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus, el uso de RLHF/DPO ni innovaciones tecnicas adicionales. La model card unicamente documenta el origen upstream (Rhasspy), el idioma y el front-end de texto: la normalizacion y conversion de texto se delega en `scriptconv`, que usa `EspeakPhonemizer` del modulo `scriptconv_copyleft.phonemizers.mul` para generar fonemas IPA mediante espeak-ng.

## Capacidades

- Sintesis de voz (text-to-speech) en neerlandes de Belgica a partir de texto plano.
- Conversion de texto a fonemas IPA mediante espeak-ng, con normalizacion previa a cargo de `scriptconv`.
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecucion en navegador mediante `phoonnx.js` (variante JavaScript de la libreria).
- No se documentan capacidades de tool calling, agentes, razonamiento, vision ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en neerlandes belga: el modelo puede generar respuestas habladas en un asistente OVOS configurando `ovos-tts-plugin-phoonnx` con la voz `piper/nl_BE-nathalie-x_low`, sin depender de servicios cloud.
- Lectura de notificaciones y alertas en aplicaciones domesticas: al ser una voz `x_low` con inferencia ONNX, es adecuada para dispositivos de bajos recursos que necesitan sintetizar frases cortas con baja latencia.
- Accesibilidad para usuarios neerlandofonos de Belgica: conversion de texto a voz en lectores de pantalla o interfaces de accesibilidad, con licencia MIT que permite distribucion en productos comerciales.
- Prototipado rapido de interfaces conversacionales: la instalacion via `pip install --pre phoonnx` y la API de `TTSModelManager` permiten integrar la voz en pocas lineas de Python para pruebas de concepto.
- Síntesis en el navegador con `phoonnx.js`: la demo de TigreGotico permite ejecutar voces VITS con entrada espeak o unicode en el cliente, util para aplicaciones web sin backend de TTS.
- Generacion de audiolibros o contenido hablado en nl-BE: el modelo puede sintetizar frases de forma secuencial y volcarlas a ficheros WAV mediante `synthesize_wav`, aunque la calidad `x_low` limita su idoneidad para produccion de alta fidelidad.
- Integracion en pipelines de domotica y sistemas embebidos: el formato ONNX y la ausencia de dependencias de GPU en la documentacion facilitan el despliegue en dispositivos con CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo VITS `x_low` exportado a ONNX, es previsible que funcione en CPU, pero no se documentan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no documentada; la libreria phoonnx esta orientada a inferencia ONNX y la model card no especifica requisitos de GPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y `phoonnx.js` para navegador.
- Dependencia externa: es necesario instalar espeak-ng (por ejemplo, `apt install espeak-ng`) o el extra `phoonnx[espeak]`, que incluye el port espyak; la model card advierte que algunos fonemas de espyak difieren de espeak-ng y pueden producir pronunciaciones incorrectas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. Como referencia cualitativa, la propia coleccion de Phoonnx incluye otras voces VITS empaquetadas para la misma libreria, y el upstream `rhasspy/piper-voices` contiene otras variantes de calidad (`low`, `medium`, `high`) para el mismo idioma, pero no se aportan metricas comparativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-nl_be-nathalie-x_low-espeak | no disponible | no aplica | no disponible | MIT | Hugging Face (Phoonnx) |
| Otras voces de la coleccion VITS de Phoonnx | no disponible | no aplica | no disponible | MIT (segun upstream) | Hugging Face |
| Otras variantes de Piper para nl-BE | no disponible | no aplica | no disponible | MIT (segun upstream) | Hugging Face (rhasspy/piper-voices) |

## Limitaciones y advertencias

- Calidad limitada: la variante `x_low` es la de menor calidad de la escala de Piper, por lo que la naturalidad y fidelidad de la voz seran inferiores a las variantes `medium` o `high`.
- Dependencia de espeak-ng: sin espeak-ng instalado, el fallback espyak puede pronunciar mal algunas palabras, segun advierte la model card.
- Cobertura linguistica restringida: solo neerlandes de Belgica (`nl-BE`); no se documenta soporte para otros idiomas o variantes.
- Entrada fonetica: el modelo espera fonemas espeak en alfabeto IPA, no texto libre directo; la calidad depende del front-end `scriptconv`.
- Sin datos de sesgos: no se documentan sesgos conocidos ni evaluaciones de robustez.
- Riesgo de alucinacion acustica: no se documenta comportamiento en textos fuera de dominio, pero al ser un TTS, los errores se manifiestan como pronunciaciones incorrectas o prosodia deficiente.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda verificar la licencia del upstream `rhasspy/piper-voices` para la voz original.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Sin benchmarks publicados: no es posible comparar su rendimiento objetivamente con otras voces.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl_be-nathalie-x_low-espeak
- Upstream (Piper voices, nl_BE/nathalie/x_low): https://huggingface.co/rhasspy/piper-voices/tree/main/nl/nl_BE/nathalie/x_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
