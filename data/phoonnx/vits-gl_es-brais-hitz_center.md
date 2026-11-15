# Phoonnx/vits-gl_es-brais-hitz_center

## Resumen
vits-gl_es-brais-hitz_center es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el centro HiTZ y empaquetado por Phoonnx para su uso con la libreria ONNX phoonnx. El modelo esta especializado en gallego (codigo de idioma `gl`, variante `gl-ES`) y convierte texto en audio inteligible a partir de una representacion fonetica intermedia generada por el fonemizador Cotovia.

La relevancia de este modelo reside en su formato: los pesos se distribuyen como ONNX, lo que permite inferencia en CPU y en entornos sin GPU, algo poco habitual en modelos TTS de calidad. Esta pensado para integrarse en asistentes de voz y sistemas de sintesis embebidos, especialmente dentro del ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.

El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a despliegue ligero. No se dispone de informacion publica sobre el numero de parametros, el tamano del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech, end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | gallego (`gl`, `gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas Cotovia, alfabeto Cotovia |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python y OVOS) |
| Modelo upstream | HiTZ/TTS-gl_brais |

## Arquitectura y entrenamiento
El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial en entrenamiento. VITS produce audio de forma directa a partir de la secuencia de entrada, sin necesidad de un vocoder externo en cascada, lo que simplifica el despliegue.

La entrada no es texto plano, sino una representacion fonetica: el pipeline delega la normalizacion y la conversion a fonemas en la libreria `scriptconv`, concretamente en el `CotoviaPhonemizer` del extra `scriptconv[gl]`. El modelo upstream es `HiTZ/TTS-gl_brais`, del centro HiTZ; Phoonnx se limita a empaquetarlo en ONNX y a exponerlo mediante su gestor de voces. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning especifico en la informacion proporcionada.

## Capacidades
- Sintesis de voz a partir de texto en gallego (`gl-ES`).
- Conversion texto-a-fonemas mediante el fonemizador Cotovia, integrado en `scriptconv`.
- Generacion de audio en formato WAV mediante la API `synthesize_wav`.
- Inferencia en ONNX, apta para CPU y para entornos sin acelerador dedicado.
- Integracion con asistentes de voz OVOS/Mycroft a traves de `ovos-tts-plugin-phoonnx`.
- Gestion de voces mediante `TTSModelManager` (carga y fusion de voces por defecto).
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso
- Asistentes de voz en gallego: el modelo puede integrarse en OVOS/Mycroft configurando `ovos-tts-plugin-phoonnx` con la voz `hitz/gl_brais-vits`, de modo que el asistente responda oralmente en gallego sin depender de servicios en la nube.
- Lectura de contenido accesible: conversion de articulos, avisos o documentacion a audio para usuarios con discapacidad visual, aprovechando la inferencia en CPU y el tamano reducido del modelo (~0,1 GB).
- Sistemas de megafonia y avisos automatizados: generacion de locuciones en gallego para transporte publico, aeropuertos o comercios, con sintesis local y sin coste por peticion.
- Videojuegos y narrativa interactiva: sintesis de dialogos de personajes en gallego en tiempo de ejecucion, con un modelo ligero que cabe en el presupuesto de recursos de un juego independiente.
- Audiolibros y podcasting automatizado: generacion por lotes de narraciones en gallego a partir de texto, usando la API de phoonnx en scripts de procesamiento.
- Prototipado de interfaces conversacionales: pruebas rapidas de flujos de voz en gallego en entornos de desarrollo sin GPU, gracias al formato ONNX y a la instalacion via `pip install --pre phoonnx "scriptconv[gl]"`.
- Investigacion en TTS de bajos recursos: punto de partida para experimentos de sintesis en lenguas minoritarias, al ser un modelo abierto con licencia Apache 2.0 y pesos ONNX.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de ~0,1 GB, es probable que la inferencia en CPU sea viable, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecucion en CPU, lo que reduce la dependencia de GPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| vits-gl_es-brais-hitz_center | VITS | gallego (gl-ES) | ONNX | Apache 2.0 | Empaquetado para phoonnx/OVOS |
| HiTZ/TTS-gl_brais | VITS | gallego (gl-ES) | no disponible | Apache 2.0 | Modelo upstream del anterior |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | ONNX | segun modelo | Misma libreria de inferencia |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- El modelo solo sintetiza gallego (`gl-ES`); no admite otros idiomas.
- Requiere pasar por el fonemizador Cotovia; un texto mal normalizado o fuera de ese alfabeto puede degradar la calidad del audio.
- No se han publicado evaluaciones de calidad (MOS, inteligibilidad) ni benchmarks, por lo que el rendimiento real no esta cuantificado.
- Riesgo de artefactos y pronunciacion incorrecta en nombres propios, prestamos y neologismos no cubiertos por el fonemizador.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream `HiTZ/TTS-gl_brais` y las condiciones de los datos de entrenamiento originales.
- El numero de descargas (28) y de likes (0) es muy bajo, lo que sugiere poca validacion por parte de la comunidad.
- No se dispone de informacion sobre sesgos acusticos (genero, edad, acento) del corpus de entrenamiento.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-gl_es-brais-hitz_center
- Modelo upstream: https://huggingface.co/HiTZ/TTS-gl_brais
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion de modelos VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
