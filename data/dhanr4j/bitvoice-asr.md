# dhanr4j/bitvoice-asr

## Resumen

El repositorio `dhanr4j/bitvoice-asr` no contiene un modelo unico, sino una coleccion de modelos de reconocimiento de voz (ASR) cuantizados y reempaquetados para su uso en el dispositivo (on-device). El autor, Dhanraj Priyadarshi, los publica como parte del ecosistema de la aplicacion de dictado BitVoice, que ejecuta la inferencia mediante el motor CRISP ASR, una libreria basada en `dart:ffi` y `ggml`. El objetivo principal es ofrecer transcripcion de voz sin necesidad de conexion a internet, preservando la privacidad del usuario.

La coleccion incluye conversiones en formato GGUF y `.bin` de modelos populares como Whisper, SenseVoice, Parakeet, Moonshine, Canary, Qwen3-ASR, entre otros. El repositorio tiene un tamano de 3.6 GB y los safetensors suman un total de 980.080.144 parametros, aunque esta cifra corresponde a la agregacion de todos los modelos incluidos, no a un unico checkpoint. Su relevancia radica en que facilita la evaluacion y el despliegue de multiples arquitecturas ASR en entornos moviles o de bajos recursos, evitando al desarrollador el proceso de cuantizacion y conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion de modelos (Whisper, SenseVoice, Parakeet, wav2vec2, Canary, Qwen3-ASR, etc.) |
| Parametros totales | 980.080.144 (suma de los safetensors del repositorio) |
| Parametros activos | No aplica (coleccion de modelos densos) |
| Longitud de contexto | No disponible (depende del modelo individual) |
| Tipos de cuantizacion | GGUF (q4, q5, q8) y `.bin` (whisper.cpp) |
| Idiomas soportados | EN, ZH, JA, KO, yue, RU, DE, ES, FR y multilingue (segun el modelo) |
| Licencia | other (cada modelo subyacente tiene la suya: MIT, Apache-2.0, CC-BY-4.0, funasr) |
| Formato de pesos | GGUF, `.bin` (whisper.cpp) y `.zip` (Moonshine) |

## Arquitectura y entrenamiento

Al tratarse de un repositorio de rehospedaje, no se documenta un entrenamiento propio. Las arquitecturas subyacentes varian: Whisper y SenseVoice usan transformadores encoder-decoder, Parakeet y Canary se basan en arquitecturas de NVIDIA, wav2vec2 es un modelo CTC, y Qwen3-ASR emplea un decodificador basado en LLM. La innovacion principal de este repositorio es la cuantizacion y el empaquetado en un unico archivo para su integracion directa con CRISP ASR, que utiliza `ggml` para la inferencia en CPU. Los datos de entrenamiento de los modelos originales no se detallan aqui, pero corresponden a los corpora publicos de cada proyecto (por ejemplo, Whisper se entreno con 680.000 horas de audio).

## Capacidades

- Reconocimiento de voz (ASR) en multiples idiomas, incluyendo ingles, chino, japones, coreano, ruso, aleman, espanol y frances.
- Inferencia completamente offline, sin necesidad de conexion de red durante el uso.
- Modelos con puntuacion y mayusculas automaticas (GigaAM v3, Canary 1B v2).
- Soporte de transcripcion en streaming para aplicaciones en tiempo real (Nemotron 3.5).
- Deteccion de eventos de audio y reconocimiento de emociones en el habla (SenseVoice small).
- Formato GGUF compatible con el ecosistema `ggml`, lo que permite su uso con otras herramientas como llama.cpp.
- Modelos de tamano reducido (desde 19 MB) aptos para dispositivos con recursos limitados.

## Casos de uso

- Dictado por voz en aplicaciones moviles: el modelo se importa directamente en la aplicacion BitVoice mediante el gestor de modelos, permitiendo transcribir texto sin enviar audio a servidores externos.
- Transcripcion offline para entornos con privacidad estricta: ideal para consultas medicas, legales o periodisticas donde la confidencialidad del audio es critica.
- Asistentes de voz embebidos en dispositivos IoT: los modelos de 19 a 129 MB pueden ejecutarse en Raspberry Pi o microcontroladores con suficiente RAM.
- Subtitulado automatico en tiempo real: los modelos de streaming como Nemotron 3.5 permiten generar subtitulos con baja latencia en retransmisiones o videollamadas.
- Prototipado rapido de sistemas ASR: al disponer de multiples arquitecturas ya cuantizadas, un investigador puede comparar el rendimiento de Whisper, Parakeet y SenseVoice sin necesidad de configurar entornos de entrenamiento.
- Procesamiento de audio en aplicaciones de escritorio: la integracion con CRISP ASR via `dart:ffi` facilita su uso en aplicaciones Flutter o Dart para transcripcion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una tasa de error (WER) del 1,5% para el modelo Whisper base en ingles, pero este dato proviene de la documentacion original de OpenAI y no de una evaluacion propia del repositorio. No se proporcionan comparativas cuantitativas entre los modelos incluidos.

## Requisitos de hardware

- Disenado para ejecucion en CPU, sin necesidad de GPU dedicada.
- Modelos pequenos (19-129 MB) funcionan en cualquier smartphone con Android o iOS.
- Modelos grandes (Canary 1B, Qwen3-ASR, ReazonSpeech) requieren aproximadamente 6 GB de RAM en el dispositivo.
- La inferencia se realiza mediante CRISP ASR, que utiliza `ggml` y `dart:ffi`, por lo que no es compatible directamente con vLLM u Ollama.
- Para uso en escritorio, puede ejecutarse en cualquier procesador moderno; la latencia dependera del modelo seleccionado (los de 110M parametros ofrecen la menor latencia).

## Comparativa con modelos similares

| Repositorio | Contenido | Formato | Licencia | Uso |
|---|---|---|---|---|
| `dhanr4j/bitvoice-asr` | Multiples arquitecturas ASR cuantizadas | GGUF, `.bin` | other (depende del modelo) | On-device via CRISP ASR |
| `ggerganov/whisper.cpp` | Solo modelos Whisper | `.bin` | MIT | On-device via whisper.cpp |
| `cstr` (HuggingFace) | Conversiones GGUF de varios modelos | GGUF | Depende del modelo | Inferencia con llama.cpp |

Este repositorio se diferencia de `whisper.cpp` por agregar arquitecturas que no son Whisper (SenseVoice, Parakeet, Canary, etc.) en un unico punto de descarga. Frente a las conversiones de `cstr`, ofrece un empaquetado especifico para la aplicacion BitVoice, con instrucciones de importacion directa.

## Limitaciones y advertencias

- No es un modelo unico, sino una coleccion; el rendimiento y las capacidades varian significativamente entre los archivos incluidos.
- La licencia del repositorio es "other", por lo que es imprescindible consultar la licencia de cada modelo original antes de un uso comercial. Los modelos CC-BY-4.0 (Parakeet, Canary) requieren atribucion.
- No se proporcionan benchmarks propios, por lo que la seleccion de un modelo concreto debe basarse en pruebas internas.
- El modelo wav2vec2 XLSR no genera puntuacion, lo que puede limitar su uso en transcripciones formales.
- Los modelos de mayor tamano (Canary, Qwen3-ASR) pueden no ser viables en telefonos con menos de 6 GB de RAM.
- La dependencia de CRISP ASR limita la portabilidad a otros motores de inferencia, aunque los archivos GGUF son compatibles con herramientas estandar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dhanr4j/bitvoice-asr
- Motor de inferencia CRISP ASR: https://github.com/CrispStrobe/CrispASR
- Conversiones GGUF de cstr: https://huggingface.co/cstr
- Modelos Whisper de whisper.cpp: https://huggingface.co/ggerganov/whisper.cpp
