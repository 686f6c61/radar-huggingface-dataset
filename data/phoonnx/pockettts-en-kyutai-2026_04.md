# Phoonnx/pockettts-en-kyutai-2026_04

## Resumen

pockettts-en-kyutai-2026_04 es un modelo de sintesis de voz (text-to-speech) en ingles empaquetado en formato ONNX para la libreria phoonnx. El modelo original procede de Kyutai, concretamente del subdirectorio `kyutai/pocket-tts/languages/english_2026-04`, y ha sido convertido a ONNX por KevinAHM y reempaquetado por Phoonnx para su uso directo con la libreria phoonnx y el plugin de OVOS. Su proposito es ofrecer sintesis de voz ligera y ejecutable localmente sin depender de servicios en la nube.

El modelo se distribuye como un repositorio de 0,8 GB que contiene los pesos ONNX y un conjunto de 26 voces predefinidas en ingles (alba, anna, azelma, bill_boerst, caro_davy, charles, cosette, eponine, estelle, eve, fantine, george, giovanni, jane, javert, jean, juergen, lola, marius, mary, michael, paul, peter_yearsley, rafael, stuart_bell y vera). Esta orientado a entornos de asistencia por voz, domotica y agentes conversacionales donde se requiere baja latencia y despliegue en dispositivos con recursos limitados.

La relevancia actual del modelo radica en su empaquetado ONNX, que facilita la inferencia en CPU y en hardware modesto, y en su integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`. La licencia CC-BY-4.0 permite uso comercial con atribucion. No se dispone de informacion publica sobre el tamano en parametros, la longitud de contexto ni los datos de entrenamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket TTS (arquitectura del modelo original de Kyutai; detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | en, en-CA, en-US |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura corresponde a Pocket TTS, el sistema de sintesis de voz desarrollado por Kyutai. La informacion disponible no detalla la estructura interna de la red (capas, atencion, modulos de decodificacion acustica o vocoder), el numero de parametros ni el volumen de datos de entrenamiento. El modelo se distribuye como artefacto ONNX, lo que implica que la inferencia se ejecuta mediante el runtime de ONNX a traves de la libreria phoonnx.

El front-end de texto lo gestiona la libreria scriptconv: el texto de entrada se normaliza y se convierte en el formato que espera el modelo mediante `UnicodeCodepointPhonemizer` de `scriptconv.phonemizers.base`, que trabaja con los puntos de codigo Unicode del texto. No se ha publicado informacion sobre el proceso de entrenamiento, el uso de RLHF/DPO ni innovaciones tecnicas especificas del modelo original en la informacion proporcionada.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles a partir de texto Unicode.
- Soporte de variantes regionales de ingles: `en`, `en-CA` y `en-US`.
- 26 voces predefinidas en ingles, seleccionables mediante identificadores como `pockettts/en/alba` o `pockettts/en/jean`.
- Salida de audio en formato WAV mediante `synthesize_wav`.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecucion local sobre ONNX, sin dependencia de servicios externos.
- No se documentan capacidades de clonacion de voz, control de emocion, multilingueismo mas alla del ingles ni tool calling.

## Casos de uso

- Asistentes de voz para domotica y OVOS: el modelo se integra como modulo TTS en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo que un asistente local responda con voz sintetizada sin enviar texto a la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o moviles: la salida WAV generada con `synthesize_wav` puede reproducirse directamente en el sistema, con latencia baja al ejecutarse en ONNX.
- Accesibilidad para personas con discapacidad visual: conversion de contenido textual (articulos, correos, documentacion) en audio en ingles, ejecutandose en local para preservar la privacidad del contenido.
- Agentes conversacionales por voz en entornos con recursos limitados: al ser un modelo ONNX de 0,8 GB, puede desplegarse en dispositivos de borde o en CPU sin GPU dedicada, reduciendo costes de infraestructura.
- Generacion de audiolibros o narraciones automatizadas: las 26 voces permiten asignar voces distintas a personajes o secciones, y el procesamiento por lotes puede automatizarse sobre la API de phoonnx.
- Pruebas y prototipado de interfaces de voz: desarrolladores que necesiten un TTS en ingles para validar flujos de interaccion pueden usar el modelo con `pip install --pre phoonnx` y el gestor `TTSModelManager` sin configurar infraestructura adicional.
- Sistemas de anuncios en comercios o transporte publico: sintesis de mensajes dinamicos en ingles con voces consistentes y ejecucion local en el dispositivo que controla el sistema de megafonia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,8 GB en disco, lo que sugiere un modelo compacto, pero no se especifica el consumo de memoria en ejecucion.
- GPU recomendadas: no disponibles. Al ejecutarse sobre ONNX, es compatible con CPU y con aceleracion por GPU segun el proveedor de ejecucion configurado en ONNX Runtime.
- Compatibilidad con GPU de consumo: no se confirma explicitamente; por el tamano del artefacto (0,8 GB) es plausible que quepa en GPU de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: libreria phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y, en general, cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de parametros del modelo, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas como Piper, Coqui TTS o Kokoro. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| pockettts-en-kyutai-2026_04 | no disponible | no disponible | CC-BY-4.0 | ONNX | Hugging Face (Phoonnx) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles (`en`, `en-CA`, `en-US`); no es adecuado para sintesis en castellano ni en otros idiomas.
- No se ha publicado informacion sobre sesgos de acento, genero o procedencia en las voces incluidas.
- Riesgo de errores de pronunciacion en palabras poco frecuentes, siglas o terminos tecnicos, ya que el front-end se basa en puntos de codigo Unicode y no en un fonemizador especifico del idioma.
- No se documentan mecanismos de control de prosodia, emocion ni velocidad mas alla de lo que exponga la API de phoonnx.
- La licencia CC-BY-4.0 exige atribucion al autor original (Kyutai) y permite uso comercial, pero conviene revisar los terminos exactos del modelo upstream.
- El modelo se distribuye como artefacto ONNX empaquetado por un tercero (Phoonnx); la calidad de la conversion puede diferir del modelo original de Kyutai.
- No hay datos publicos de benchmarks ni de rendimiento en produccion, por lo que la evaluacion debe realizarse con pruebas propias.
- El repositorio tiene pocas descargas (28) y ningun "like" en el momento de la consulta, lo que indica un uso limitado y poca validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/pockettts-en-kyutai-2026_04
- Modelo upstream de Kyutai: https://huggingface.co/kyutai/pocket-tts/tree/main/languages/english_2026-04
- Conversion ONNX de KevinAHM: https://huggingface.co/KevinAHM/pocket-tts-onnx/tree/main/onnx/english_2026-04
- Coleccion Pocket TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/pocket-tts-6af8ea95fad812f585a5cb91
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
