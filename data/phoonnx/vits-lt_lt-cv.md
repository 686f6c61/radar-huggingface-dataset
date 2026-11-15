# Phoonnx/vits-lt_lt-cv

## Resumen

Phoonnx/vits-lt_lt-cv es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado en formato ONNX por Phoonnx para su uso con la libreria phoonnx. El modelo esta especializado en lituano (lt-LT) y fue entrenado sobre el corpus Common Voice, segun se desprende del identificador `lt-cv` y de las notas de licencia incluidas en la model card.

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura end-to-end que combina un encoder de texto, un decoder basado en flujo normalizador y un discriminador adversarial para generar audio de forma directa a partir del texto, sin necesidad de un vocoder separado. Este empaquetado concreto anade una capa de interoperabilidad: los pesos se distribuyen en ONNX y se consumen a traves de phoonnx, una libreria de inferencia TTS que tambien ofrece integracion con el ecosistema OVOS (Open Voice OS).

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, con 26 descargas y sin likes en el momento de la consulta, orientado a aplicaciones que necesitan sintesis de voz en lituano dentro de un stack Python/OVOS. No es un modelo de proposito general ni compite en la categoria de LLMs; su interes esta en la disponibilidad de un TTS lituano con licencia permisiva (BSD-3-Clause) y formato ONNX listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, Coqui) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de texto por caracteres, sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | lituano (lt-LT) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS original de Coqui, un sistema TTS end-to-end que integra en un unico modelo el encoder de texto, el modulo de alineamiento por atencion, el decoder generativo basado en flujos normalizadores y la generacion de waveform, evitando la necesidad de un vocoder neuronal separado. La entrada de texto se procesa a nivel de caracteres (graphemes) mediante el `GraphemePhonemizer` de la libreria scriptconv, que normaliza el texto y lo convierte en la secuencia de entrada del modelo.

El entrenamiento se realizo sobre el corpus Common Voice en lituano, segun indica el identificador `lt-cv` y la tabla de licencias de la model card de Coqui. No se dispone en la informacion proporcionada del numero de horas de audio, del numero de tokens ni de si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en TTS). Tampoco se detallan innovaciones tecnicas adicionales mas alla de las propias de VITS. El empaquetado de Phoonnx se limita a exportar los pesos a ONNX y a integrarlos en su pipeline de inferencia.

## Capacidades

- Sintesis de voz a partir de texto en lituano (lt-LT), con salida en formato WAV.
- Procesamiento de texto a nivel de grafemas mediante el `GraphemePhonemizer` de scriptconv.
- Inferencia en formato ONNX, lo que permite ejecucion sin dependencia del framework original de Coqui.
- Integracion con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Uso programatico en Python mediante `TTSModelManager` y la API `synthesize_wav`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en lituano: el modelo puede integrarse en OVOS como motor TTS para responder a comandos de voz, seleccionandolo en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`.
- Lectura de contenido en aplicaciones de accesibilidad: sintesis de texto a audio para usuarios con discapacidad visual que consuman contenido en lituano, con salida WAV directa a traves de la API de phoonnx.
- Generacion de audiolibros o narraciones: conversion por lotes de textos largos en lituano a audio, dividiendo el texto en frases y sintetizando cada una con `synthesize_wav`.
- Locuciones para sistemas de anuncios publicos o interfaces de voz: generacion de mensajes pregrabados en lituano para aplicaciones de transporte, comercio o telefonia.
- Prototipado de productos de voz para el mercado lituano: al tener licencia BSD-3-Clause y formato ONNX, permite validar rapidamente un pipeline TTS sin ataduras de licencia restrictivas.
- Investigacion en TTS de bajos recursos: servir como linea base VITS para experimentos de sintesis en lituano o para comparar con modelos mas recientes en el mismo idioma.
- Integracion en pipelines de CI/CD para pruebas de regresion de audio: al ser ONNX, puede ejecutarse en entornos sin GPU y compararse la salida ante cambios en el front-end de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el tamano del repositorio es de 0,1 GB, lo que sugiere un modelo ligero que probablemente quepa en GPU de gama baja, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del repositorio (0,1 GB) es plausible que funcione en CPU y en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecucion ONNX en general. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto / entrada |
|---|---|---|---|---|---|
| Phoonnx/vits-lt_lt-cv | VITS | lituano (lt-LT) | BSD-3-Clause | ONNX | texto por caracteres |
| Coqui tts_models--lt--cv--vits (upstream) | VITS | lituano (lt-LT) | BSD-3-Clause | checkpoint Coqui | texto por caracteres |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios idiomas | variable | ONNX | texto por caracteres |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros estructurales y de licencia.

## Limitaciones y advertencias

- Modelo monoidioma: solo soporta lituano (lt-LT); no es adecuado para otros idiomas.
- Entrada a nivel de caracteres: la calidad depende del `GraphemePhonemizer` de scriptconv; no se documenta el manejo de numeros, abreviaturas o caracteres especiales mas alla de la normalizacion de scriptconv.
- Sin datos de benchmarks: no hay evidencia publicada de calidad subjetiva (MOS) ni de inteligibilidad en la informacion disponible.
- Sesgos: al entrenarse sobre Common Voice, puede heredar sesgos de representacion del corpus (variedad de acentos, edades y generos).
- Riesgo de alucinacion: en TTS el riesgo se traduce en artefactos de audio o pronunciaciones incorrectas ante texto fuera de dominio; no cuantificado.
- Licencia BSD-3-Clause: permisiva para uso comercial, pero conviene verificar las condiciones del corpus Common Voice subyacente y los terminos del empaquetado de Phoonnx.
- Ecosistema acotado: la libreria phoonnx se instala con `pip install --pre phoonnx` (version preliminar), lo que implica posibles cambios de API.
- Popularidad muy baja (26 descargas, 0 likes): escasa validacion comunitaria y soporte limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-lt_lt-cv
- Repositorio upstream (Coqui TTS, modelo original): https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--lt--cv--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
