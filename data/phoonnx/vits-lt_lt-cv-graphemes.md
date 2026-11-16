# Phoonnx/vits-lt_lt-cv-graphemes

## Resumen

vits-lt_lt-cv-graphemes es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con su libreria de TTS. El modelo esta especializado exclusivamente en lituano (lt-LT) y fue entrenado sobre el corpus Common Voice, lo que lo convierte en una opcion ligera y directa para generar voz en ese idioma.

La relevancia de este modelo radica en su empaquetado: Phoonnx lo distribuye como un artefacto ONNX listo para ejecutar en entornos Python y en el ecosistema OVOS (Open Voice OS), lo que simplifica el despliegue en asistentes de voz y aplicaciones de sintesis sin necesidad de depender del framework original de Coqui TTS. Con un tamano de repositorio de aproximadamente 0,1 GB, es un modelo compacto orientado a inferencia en CPU y GPU de gama baja.

Se trata de un modelo de nicho: un unico idioma, una unica voz y una entrada basada en grafemas (caracteres del texto) sin conversión fonetica compleja, gestionada por la libreria scriptconv. No dispone de datos publicos de benchmarks ni de especificaciones detalladas de parametros o contexto, ya que no es un modelo de lenguaje sino un sistema TTS end-to-end.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, Coqui) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por grafemas) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | lituano (lt-LT) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura generativa end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales. Este modelo concreto es la version de Coqui entrenada sobre el corpus Common Voice para lituano, publicada originalmente en el release v0.8.0 de Coqui TTS y posteriormente exportada a ONNX por Phoonnx.

No se dispone de informacion sobre el numero exacto de horas de audio, la composicion detallada del dataset ni si se aplicaron tecnicas de fine-tuning adicionales mas alla del entrenamiento estandar de Coqui sobre Common Voice. La entrada de texto se procesa mediante el `GraphemePhonemizer` de la libreria scriptconv, que normaliza el texto y lo convierte directamente en grafemas, sin un paso de fonemizacion basado en diccionario fonetico.

## Capacidades

- Sintesis de voz (text-to-speech) en lituano (lt-LT) a partir de texto escrito.
- Entrada basada en grafemas: acepta caracteres del texto y los procesa mediante el `GraphemePhonemizer` de scriptconv.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Una unica voz disponible: `coqui/lt-cv-vits`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No es un modelo multilingue: solo lituano.

## Casos de uso

- Asistentes de voz en lituano: el modelo puede integrarse en OVOS mediante el plugin `ovos-tts-plugin-phoonnx` para dotar de voz a un asistente domestico que responda en lituano, seleccionando la voz `coqui/lt-cv-vits` en `mycroft.conf`.
- Lectura de contenido en lituano: conversion de articulos, noticias o documentacion a audio para aplicaciones de accesibilidad o consumo de contenido manos libres, usando la API `synthesize_wav` para generar ficheros WAV.
- Sistemas de navegacion o anuncios por voz: generacion de indicaciones habladas en lituano en entornos embebidos, aprovechando el formato ONNX y el reducido tamano del modelo (0,1 GB) para despliegue en dispositivos con recursos limitados.
- Pruebas de integracion TTS en pipelines de desarrollo: validacion de flujos de sintesis en lituano dentro de aplicaciones Python antes de escalar a modelos de mayor calidad, gracias a la instalacion sencilla via `pip install --pre phoonnx`.
- Prototipado de interfaces conversacionales en lituano: generacion rapida de respuestas de voz en demos y pruebas de usabilidad para productos dirigidos al mercado lituano.
- Localizacion de contenido audiovisual: doblaje o locucion automatizada de material formativo en lituano cuando no se requiere una voz humana profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del repositorio (0,1 GB) se trata de un modelo muy ligero, apto para inferencia en CPU.
- GPU recomendadas: no disponible. Dado su tamano reducido, es previsible que funcione en GPU consumer, pero no hay datos oficiales que lo confirmen.
- Cabida en GPU consumer: probable por el tamano del modelo, aunque no se dispone de confirmacion oficial.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecucion ONNX Runtime subyacente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| vits-lt_lt-cv-graphemes | VITS (Coqui) | lituano (lt-LT) | ~0,1 GB (repo) | BSD-3-Clause | ONNX |
| Otros modelos VITS de la coleccion Phoonnx | VITS (Coqui) | varios idiomas | no disponible | segun modelo | ONNX |
| Coqui TTS upstream (tts_models--lt--cv--vits) | VITS (Coqui) | lituano (lt-LT) | no disponible | BSD-3-Clause | pesos Coqui (no ONNX) |

La comparativa detallada con alternativas de la misma categoria no esta disponible en la informacion proporcionada; el modelo upstream de Coqui es la referencia directa, del que este empaquetado deriva.

## Limitaciones y advertencias

- Modelo de un unico idioma (lituano); no admite otros idiomas ni cambio de voz.
- Entrada basada en grafemas sin fonemizacion por diccionario, lo que puede afectar a la pronunciacion de palabras extranas o siglas.
- Riesgo de alucinacion acustica y artefactos propios de modelos VITS entrenados sobre corpus limitados como Common Voice.
- No hay datos publicos sobre sesgos, calidad percibida ni evaluaciones MOS en la informacion disponible.
- Licencia BSD-3-Clause: permite uso comercial con atribucion y sin endoso; conviene revisar los terminos exactos del upstream de Coqui.
- Empaquetado por un tercero (Phoonnx); la calidad y mantenimiento dependen de ese proyecto, no del autor original.
- Sin benchmarks publicados: no es posible comparar su rendimiento objetivo con otras alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-lt_lt-cv-graphemes
- Modelo upstream (Coqui TTS v0.8.0): https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--lt--cv--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
