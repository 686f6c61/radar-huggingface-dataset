# Phoonnx/vits-jv_id-google_gmu-low-epitran

## Resumen

`vits-jv_id-google_gmu-low-epitran` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su motor de voces Mimic 3 y empaquetado posteriormente por Phoonnx para su libreria de inferencia ONNX. El modelo genera audio a partir de texto en javanes (codigo `jv-ID`) y forma parte de la coleccion de voces VITS que Phoonnx distribuye en Hugging Face. Su relevancia radica en que permite sintesis de voz offline para una lengua de bajos recursos como el javanes, dentro del ecosistema OVOS/Mycroft.

El modelo no es un LLM ni un transformer generativo de texto: es un sistema TTS end-to-end que combina un codificador de texto, un predictor de duraciones y un decoder acustico con un vocoder integrado (esquema VITS). El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace muy ligero y apto para despliegue en dispositivos con recursos limitados.

La entrada de texto no es texto plano directo: requiere una conversion previa a fonemas IPA mediante Epitran, gestionada por la libreria `scriptconv` de Phoonnx. Esto condiciona tanto el pipeline de uso como los requisitos de instalacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | javanes (`jv-ID`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | ~0,1 GB |
| Entrada de texto | fonemas Epitran en alfabeto IPA |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), que integra en un unico sistema un codificador de texto, un predictor de duraciones basado en alineamiento monotono, un decoder generativo condicionado por variables latentes y un vocoder neuronal. Esta integracion elimina la necesidad de un vocoder separado y permite sintesis de audio de extremo a extremo a partir de fonemas.

El modelo procede del repositorio `MycroftAI/mimic3-voices`, en la ruta `voices/jv_ID/google-gmu_low`, donde Mycroft AI publico las voces de Mimic 3. No se dispone de informacion sobre el corpus de entrenamiento, el numero de horas de audio, la composicion del dataset ni si se aplicaron tecnicas de ajuste fino adicionales. La etiqueta `google_gmu_low` sugiere una voz derivada de un corpus de Google con calidad "low", pero este extremo no esta confirmado en la informacion disponible.

Phoonnx se limita a empaquetar los pesos originales en formato ONNX y a integrarlos en su pipeline de inferencia, sin que conste reentrenamiento ni modificacion de la arquitectura.

## Capacidades

- Sintesis de voz a partir de texto en javanes (`jv-ID`), con salida en formato WAV.
- Conversion de texto a fonemas IPA mediante `EpitranPhonemizer` de la libreria `scriptconv` (extra `scriptconv[epitran]`).
- Inferencia offline mediante ONNX, sin dependencia de servicios en la nube.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Gestion de voces mediante `TTSModelManager`, con carga y fusion de voces por defecto.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz offline en javanes: el modelo puede integrarse en OVOS o en cualquier aplicacion Python que use `phoonnx` para sintetizar respuestas habladas sin conexion a internet, gracias a su formato ONNX y su tamano reducido (~0,1 GB).
- Lectura de contenido en javanes: conversion de articulos, noticias o documentacion a audio para aplicaciones de accesibilidad o consumo pasivo, usando el pipeline `scriptconv` + `phoonnx`.
- Sistemas de anuncios y notificaciones: generacion de avisos hablados en dispositivos embebidos (Raspberry Pi, cajas inteligentes) donde el modelo cabe en almacenamiento y memoria limitados.
- Localizacion de interfaces de voz: incorporacion de una voz javanesa a productos que ya soportan el ecosistema Mycroft/OVOS, seleccionando la voz `mimic3/jv_ID/google-gmu_low` en la configuracion.
- Prototipado de aplicaciones TTS multilingues: uso como una de las voces de la coleccion VITS de Phoonnx para comparar calidad y latencia entre idiomas dentro de un mismo framework.
- Investigacion en lenguas de bajos recursos: base para experimentos de sintesis en javanes, evaluacion de inteligibilidad o generacion de datos de audio sintetico para otros pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (~0,1 GB) es previsible que quepa en GPU consumer con pocos cientos de MB, aunque no se confirma en la informacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; el formato ONNX permite ejecucion en CPU y en GPU mediante ONNX Runtime.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS. No consta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a TTS VITS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-jv_id-google_gmu-low-epitran (este) | VITS | javanes | ONNX | CC-BY-SA-4.0 | Hugging Face (Phoonnx) |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios | ONNX | segun voz | Hugging Face (Phoonnx) |
| Voces originales de Mycroft Mimic 3 | VITS | varios | varios | CC-BY-SA-4.0 (upstream) | GitHub MycroftAI/mimic3-voices |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en TTS: no genera texto, no razona y no admite instrucciones.
- Idioma limitado al javanes (`jv-ID`); no se garantiza un comportamiento correcto con texto en otros idiomas.
- Requiere conversion previa a fonemas IPA con Epitran; texto sin normalizar o con caracteres no soportados puede producir una sintesis incorrecta.
- La etiqueta `low` en el nombre sugiere una calidad de voz reducida, aunque no se detalla en la informacion disponible.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribucion y obliga a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion acustica ni evaluaciones de inteligibilidad.
- El modelo no ha recibido descargas ni interacciones en Hugging Face en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- Depende de la libreria `phoonnx` en version preliminar (`pip install --pre phoonnx`), lo que implica una API potencialmente inestable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-jv_id-google_gmu-low-epitran
- Repositorio upstream (Mycroft AI): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/jv_ID/google-gmu_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
