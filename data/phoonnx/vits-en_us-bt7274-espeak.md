# Phoonnx/vits-en_us-bt7274-espeak

## Resumen

vits-en_us-bt7274-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede del repositorio PiperVoiceModels de DJMalachite, concretamente de la carpeta dedicada al personaje BT-7274 del videojuego Titanfall 2. Se distribuye como un artefacto ONNX listo para inferencia, con un tamano de repositorio de 0,1 GB, lo que lo situa en la categoria de modelos TTS ligeros.

El modelo resuelve el problema de generar voz sintetica en ingles estadounidense (en-US) a partir de texto, recibiendo como entrada fonemas en alfabeto IPA generados por espeak-ng. Su integracion con phoonnx permite su uso tanto en Python como en el asistente de voz OVOS mediante el plugin ovos-tts-plugin-phoonnx. Es relevante para desarrolladores que necesitan una voz concreta y caracteristica (la de un personaje de videojuego) en aplicaciones de asistente de voz, modding o prototipos de TTS sin depender de servicios en la nube.

La licencia GPL-3.0 del proyecto upstream condiciona fuertemente su uso: cualquier distribucion de software que lo incorpore debe ser tambien GPL-3.0. No se dispone de datos publicos sobre el numero de parametros, la longitud de contexto (no aplica a TTS) ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional condicionado por texto, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales. Este diseno permite generar audio de forma directa desde fonemas sin necesidad de un vocoder separado, lo que explica el reducido tamano del artefacto (0,1 GB) y su idoneidad para inferencia en CPU o entornos con recursos limitados.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente a TTS). El modelo original fue entrenado por DJMalachite dentro del proyecto PiperVoiceModels; Phoonnx se limita a empaquetarlo para su libreria ONNX. La unica innovacion tecnica documentada es el uso de espeak-ng como fonemizador de entrada, con la advertencia de que la variante espyak puede producir fonemas distintos y provocar errores de pronunciacion en algunas palabras.

## Capacidades

- Sintesis de voz en ingles estadounidense (en-US) a partir de texto plano.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas espeak-ng en alfabeto IPA, lo que permite control fino de la pronunciacion si se proporcionan fonemas directamente.
- Integracion con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador a traves de phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es exclusivamente un modelo TTS.
- No dispone de capacidades de vision, audio de entrada ni modo thinking.

## Casos de uso

- Asistente de voz domestico con OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en ingles con la voz del personaje BT-7274, adecuado para prototipos de asistentes personalizados.
- Modding de videojuegos: al reproducir la voz de un personaje concreto de Titanfall 2, se puede emplear para generar dialogos nuevos en mods o doblajes no oficiales, siempre que la licencia GPL-3.0 sea compatible con la distribucion del mod.
- Generacion de audiolibros o narraciones en ingles: la sintesis directa desde texto permite convertir guiones o textos largos en audio WAV sin servicios externos, con un coste computacional bajo gracias al tamano reducido del modelo.
- Prototipado rapido de interfaces de voz: desarrolladores que necesitan una voz caracteristica para demos de chatbots o asistentes pueden integrarla via phoonnx en Python con pocas lineas de codigo.
- Accesibilidad: conversion de texto a voz para aplicaciones de lectura en pantalla o lectores de documentos en ingles, ejecutable localmente sin conexion.
- Pruebas de integracion en pipelines de CI: al ser un artefacto ONNX pequeno (0,1 GB), se puede incluir en tests automatizados de sintesis de voz sin requerir GPU ni infraestructura pesada.
- Demos web: mediante phoonnx.js se puede ofrecer una demo de sintesis en el navegador con la voz BT-7274, util para portfolios o paginas de presentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del artefacto (0,1 GB) es probable que la inferencia en CPU sea viable, pero no se confirma en la documentacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX y el tamano reducido sugieren que podria ejecutarse en CPU y en GPUs de gama baja, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamano | Notas |
|---|---|---|---|---|---|---|
| vits-en_us-bt7274-espeak | VITS | en-US | GPL-3.0 | ONNX | 0,1 GB | Voz de personaje (BT-7274), empaquetado por Phoonnx |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | variable | ONNX | variable | Misma libreria de inferencia; voces comunitarias |
| Piper TTS (voces comunitarias) | VITS | varios | variable | ONNX | variable | Ecosistema upstream del que procede este modelo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier obra derivada o distribucion que incorpore el modelo debe publicarse bajo la misma licencia, lo que puede ser incompatible con productos comerciales de codigo cerrado.
- Idioma limitado a en-US: no soporta otros idiomas ni variantes regionales del ingles de forma documentada.
- Dependencia de espeak-ng: sin espeak-ng instalado, la entrada de texto no se fonemiza correctamente; la variante espyak puede generar pronunciaciones erroneas en algunas palabras.
- Voz de personaje: al tratarse de la voz de BT-7274 de Titanfall 2, su uso comercial puede plantear cuestiones adicionales de derechos de imagen o propiedad intelectual no cubiertas por la licencia del modelo.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la sintesis puede producir artefactos acusticos o prosodia incorrecta en textos fuera del dominio de entrenamiento.
- Sin datos publicados de benchmarks, parametros ni latencia: dificil evaluar su calidad objetiva frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- No apto para tareas de razonamiento, codigo, vision ni agentes: es exclusivamente un modelo de sintesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-bt7274-espeak
- Repositorio upstream (PiperVoiceModels, BT7274): https://github.com/DJMalachite/PiperVoiceModels/tree/main/Titanfall2/BT7274
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
