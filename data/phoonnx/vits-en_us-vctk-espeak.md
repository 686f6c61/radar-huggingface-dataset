# Phoonnx/vits-en_us-vctk-espeak

## Resumen

`vits-en_us-vctk-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte texto en ingles estadounidense (`en-US`) a audio, tomando como entrada fonemas en alfabeto IPA generados por espeak-ng. Se distribuye como un artefacto ONNX listo para ejecutarse sin depender del framework original de Coqui TTS.

El modelo esta entrenado sobre el corpus VCTK (Voice Cloning Toolkit), un conjunto de datos de habla multi-hablante en ingles britanico y estadounidense ampliamente utilizado en investigacion de sintesis de voz. La integracion con Phoonnx permite su uso en Python y en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, lo que lo hace relevante para asistentes de voz autoalojados y despliegues embebidos.

El repositorio ocupa aproximadamente 0,1 GB y se publica bajo licencia Apache 2.0. Es una opcion ligera para sintesis de voz en ingles con requisitos de hardware modestos, aunque su adopcion es todavia muy reducida (16 descargas en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos en formato ONNX) |
| Idiomas soportados | ingles estadounidense (`en-US`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es un modelo generativo end-to-end que combina un encoder de texto, un prior variacional condicionado por texto, un decoder basado en normalizing flows y un decoder acustico de dominio de forma de onda (HiFi-GAN), entrenado con aprendizaje adversarial y una perdida de reconstruccion variacional. Esta disenado para sintetizar audio directamente desde fonemas sin necesidad de un vocoder externo separado, lo que reduce la latencia y simplifica el pipeline de despliegue.

El modelo original fue entrenado por Coqui sobre el corpus VCTK, un dataset de habla multi-hablante en ingles. La version empaquetada por Phoonnx conserva los pesos del modelo `tts_models--en--vctk--vits` de Coqui TTS v0.6.1, convertidos a ONNX. No se dispone de informacion detallada sobre el numero exacto de horas de audio, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en TTS). La innovacion principal del empaquetado es la integracion con `scriptconv` para normalizacion de texto y fonemizacion via espeak-ng, y la disponibilidad de ejecucion en navegador mediante phoonnx.js.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de texto plano.
- Generacion de audio en formato WAV mediante `voice.synthesize_wav()`.
- Fonemizacion mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Integracion con el ecosistema OVOS como plugin de TTS (`ovos-tts-plugin-phoonnx`).
- Ejecucion en navegador mediante phoonnx.js con entrada espeak o Unicode.
- Soporte multi-hablante derivado del corpus VCTK (las voces disponibles dependen del empaquetado en phoonnx; la voz referenciada es `coqui/en-vctk-vits`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta vision ni audio de entrada.

## Casos de uso

- Asistentes de voz autoalojados: integracion en OVOS mediante `mycroft.conf` para sintetizar respuestas habladas en ingles sin depender de servicios en la nube, gracias al reducido tamano del modelo (~0,1 GB) y su formato ONNX.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: el modelo puede generar audio WAV a partir de texto corto con baja latencia, adecuado para entornos con recursos limitados.
- Prototipado de interfaces conversacionales: desarrolladores que necesitan un TTS ligero en ingles para validar flujos de voz antes de invertir en modelos comerciales.
- Sistemas embebidos y dispositivos de borde: la inferencia ONNX permite desplegar el modelo en hardware sin GPU dedicada, siempre que se instale espeak-ng o espyak.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de asistencia en ingles estadounidense.
- Demos web interactivas: mediante phoonnx.js se puede ejecutar el modelo en el navegador para demostraciones de sintesis de voz sin backend, como la demo alojada en tigregotico.pt/demo.
- Generacion de contenido de audio para pruebas automatizadas: sintesis de locuciones en ingles para test de pipelines de audio o video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa ~0,1 GB, por lo que el modelo es muy ligero y probablemente cabe en memoria de CPU.
- GPU recomendadas: no disponible; al ser un modelo ONNX de ~0,1 GB, no requiere GPU dedicada para funcionar.
- Compatibilidad con GPU de consumo: si, previsiblemente cualquier GPU de consumo puede ejecutarlo, aunque no se especifican requisitos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js para navegador. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.
- Dependencia externa: requiere espeak-ng instalado en el sistema (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. Como referencia cualitativa, se puede comparar con otros modelos TTS del ecosistema Coqui (por ejemplo, los incluidos en la coleccion VITS de Phoonnx) y con alternativas como Piper o Coqui TTS original, pero no se dispone de parametros, contexto ni benchmarks para establecer una comparacion cuantitativa rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-en_us-vctk-espeak | no disponible | no aplica | Apache 2.0 | ONNX | Hugging Face (Phoonnx) |
| Otros VITS de la coleccion Phoonnx | no disponible | no aplica | variable | ONNX | Hugging Face |
| Coqui TTS original (v0.6.1) | no disponible | no aplica | Apache 2.0 | PyTorch | GitHub releases |
| Piper (referencia) | no disponible | no aplica | MIT | ONNX | GitHub |

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (`en-US`); no es multilingue.
- La calidad de sintesis depende de la fonemizacion con espeak-ng; el uso de espyak puede producir errores de pronunciacion en algunas palabras, segun advierte el autor.
- Requiere instalar espeak-ng en el sistema o el extra `phoonnx[espeak]`, lo que anade una dependencia externa.
- No se dispone de informacion sobre sesgos, alucinaciones (no aplicable a TTS) ni limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento (VCTK) para cumplir con las condiciones de uso del corpus original.
- Adopcion muy baja (16 descargas, 0 likes), lo que implica poca validacion comunitaria y soporte limitado.
- El modelo esta empaquetado para la libreria phoonnx; no es directamente compatible con frameworks TTS mas extendidos sin conversion.
- No se especifican requisitos de hardware oficiales ni latencias medidas, por lo que el rendimiento en produccion debe validarse empiricamente.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-vctk-espeak
- Modelo original de Coqui: https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--en--vctk--vits.zip
- phoonnx (repositorio): https://github.com/TigreGotico/phoonnx
- scriptconv (repositorio): https://github.com/TigreGotico/scriptconv
- phoonnx.js (repositorio): https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
