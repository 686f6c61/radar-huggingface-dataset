# ArchiveStudio/MOSS-Audio-Tokenizer-ONNX

## Resumen

MOSS-Audio-Tokenizer-ONNX es el paquete de exportaciones ONNX (encoder y decoder) de MOSS-Audio-Tokenizer, el tokenizador de audio discreto de la familia MOSS-TTS desarrollado por OpenMOSS. Este repositorio concreto, publicado por el usuario ArchiveStudio el 24 de octubre de 2026, replica los artefactos oficiales con el objetivo de permitir la codificación y decodificación de audio sin dependencias de PyTorch. El modelo subyacente emplea la arquitectura Cat (Causal Audio Tokenizer with Transformer), un transformer causal puro de 1.600 millones de parámetros entrenado desde cero sobre 3 millones de horas de voz, efectos de sonido y música.

El componente resuelve un problema de infraestructura: convertir audio PCM de 24 kHz en secuencias de tokens discretos (y viceversa) con calidad de reconstrucción alta y a un régimen de bits muy bajo, de 0,125 a 4 kbps, con una tasa de trama de 12,5 Hz y un cuantizador vectorial residual (RVQ) de 32 capas. Esa interfaz discreta es la que consume el backbone Qwen3 de MOSS-TTS, de modo que el tokenizador actúa como puente entre la onda de audio y el modelo de lenguaje.

Su relevancia práctica está en el despliegue: al estar exportado a ONNX, puede ejecutarse con ONNX Runtime (CPU o GPU) o compilarse a TensorRT, integrándose en el backend llama.cpp de MOSS-TTS para una inferencia de texto a voz completamente libre de PyTorch. Es, por tanto, una pieza de infraestructura para pipelines de TTS y de modelado de audio, no un modelo generativo de uso directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cat (Causal Audio Tokenizer with Transformer): transformer causal puro con cuantizador vectorial residual (RVQ) de 32 capas |
| Parametros totales | 1.600 millones (1.6B), segun la model card del proyecto original |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (el modelo es causal y procesa audio en flujo; no se publica una ventana maxima en tokens) |
| Tipos de cuantizacion | No disponible: el repositorio solo documenta exportaciones ONNX sin variantes cuantizadas; la cuantizacion propia del codec es RVQ de 32 capas con regimenes de 0,125 a 4 kbps |
| Idiomas soportados | No disponible: al ser un codec de audio no esta limitado por idioma; la evaluacion publicada cubre ingles (LibriSpeech) y chino (AISHELL-2) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`, `encoder.data`); motores TensorRT compilados por el usuario a partir de los ONNX |

Otros datos: frecuencia de muestreo de 24 kHz, tasa de trama de 12,5 Hz, tamano del repositorio 14,2 GB, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

MOSS-Audio-Tokenizer se basa en Cat, una arquitectura de tokenizador de audio construida sobre un transformer causal puro en lugar de los esquemas convolucionales o hibridos habituales en codecs neuronales. El modelo escala hasta 1.600 millones de parametros y se presenta como una interfaz discreta unificada que persigue dos objetivos simultaneos: reconstruccion de calidad practicamente sin perdidas y alineacion semantica de alto nivel. La cuantizacion se realiza mediante un RVQ de 32 capas sobre una representacion a 12,5 Hz, lo que permite operar en un rango de 0,125 a 4 kbps segun el numero de capas activas (Nq), con 6 y 8 cuantizadores en las configuraciones evaluadas.

El entrenamiento se hizo desde cero sobre 3 millones de horas de audio diverso que incluye voz, efectos de sonido y musica, segun la model card. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; al tratarse de un codec, el ajuste por preferencias humanas no seria el mecanismo habitual. La innovacion destacable es la combinacion de un transformer causal con RVQ de alta profundidad para mantener fidelidad de reconstruccion a regimenes de bits muy bajos, junto con un flujo de exportacion a ONNX y TensorRT que desacopla la inferencia del ecosistema PyTorch.

## Capacidades

- Codificacion de audio: convierte forma de onda PCM de 24 kHz en codigos discretos con tasa de trama de 12,5 Hz.
- Decodificacion de audio: reconstruye la forma de onda a partir de los codigos discretos, con calidad ajustable segun el numero de cuantizadores empleados.
- Operacion en regimenes de 0,125 a 4 kbps, lo que permite priorizar compresion o fidelidad en el mismo modelo.
- Cobertura de voz, efectos de sonido y musica, al haber sido entrenado sobre audio diverso y no exclusivamente sobre habla.
- Inferencia sin PyTorch: ejecutable con ONNX Runtime en CPU y GPU, o mediante motores TensorRT compilados por el usuario.
- Integracion como componente de audio en el pipeline de TTS de MOSS-TTS, junto al backbone Qwen3 en formato GGUF y llama.cpp.
- No dispone de tool calling, function calling, capacidades de agente, vision ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Sintesis de voz con MOSS-TTS: el decoder del tokenizador transforma los tokens predichos por el backbone Qwen3 en audio de 24 kHz, lo que permite montar un servidor de TTS enteramente en C/C++ sin PyTorch ni Python en produccion.
- Compresion de audio a muy bajo bitrate: para archivos de voz o musica donde 0,125 a 4 kbps sean suficientes, el RVQ permite reducir el almacenamiento en dos o tres ordenes de magnitud frente a PCM de 24 kHz.
- Tokenizacion para modelos de audio foundation: convierte grandes corpus de audio en secuencias discretas que pueden entrenarse con las mismas tecnicas que los modelos de lenguaje, con un vocabulario manejable gracias a los 12,5 Hz de trama.
- Clonacion de voz y TTS condicionado por referencia: el encoder extrae los codigos de un audio de referencia y el decoder reconstruye la voz objetivo, dentro del flujo de MOSS-TTS.
- Procesado de audio en el borde o en entornos sin CUDA: con ONNX Runtime en CPU se puede desplegar la codificacion en servidores sin GPU o en dispositivos empotrados, a costa de mayor latencia.
- Servicios de transcripcion y comprension de audio basados en LLM: los tokens discretos permiten alimentar modelos de lenguaje que razonen sobre audio sin necesidad de un encoder separado por tarea.
- Reencoding y transcodificacion en pipelines de distribucion: conversion entre representaciones de audio manteniendo una calidad de reconstruccion controlada mediante el numero de cuantizadores.
- Maximizacion de throughput en servidores con GPU: la compilacion a TensorRT permite generar motores especificos para la arquitectura disponible y aumentar el rendimiento frente a ONNX Runtime.

## Benchmarks y rendimiento

Los datos publicados corresponden a calidad de reconstruccion, no a benchmarks de tareas de lenguaje. Metricas de voz sobre LibriSpeech test-clean (ingles) y AISHELL-2 (chino), expresadas como EN/ZH; metricas de audio sobre AudioSet y de musica sobre MUSDB, expresadas como audio/musica. En las metricas de voz, mayor es mejor; en Mel-Loss y STFT-Dist., menor es mejor. Nq indica el numero de cuantizadores.

| Modelo | bps | Trama (Hz) | Nq | SIM voz (EN/ZH) | STOI voz (EN/ZH) | PESQ-NB voz (EN/ZH) | PESQ-WB voz (EN/ZH) | Mel-Loss audio/musica | STFT-Dist. audio/musica |
|---|---|---|---|---|---|---|---|---|---|
| XCodec2.0 | 800 | 50 | 1 | 0,82 / 0,74 | 0,92 / 0,86 | 3,04 / 2,46 | 2,43 / 1,96 | no disponible | no disponible |
| MiMo Audio Tokenizer | 850 | 25 | 4 | 0,80 / 0,74 | 0,91 / 0,87 | 2,94 / 2,62 | 2,39 / 2,14 | 0,82 / 0,81 | 2,33 / 2,23 |
| Higgs Audio Tokenizer | 1000 | 25 | 4 | 0,77 / 0,68 | 0,83 / 0,82 | 3,03 / 2,61 | 2,48 / 2,14 | 0,83 / 0,80 | 2,20 / 2,05 |
| SpeechTokenizer | 1000 | 50 | 2 | 0,36 / 0,25 | 0,77 / 0,68 | 1,59 / 1,38 | 1,25 / 1,17 | no disponible | no disponible |
| XY-Tokenizer | 1000 | 12,5 | 8 | 0,85 / 0,79 | 0,92 / 0,87 | 3,10 / 2,63 | 2,50 / 2,12 | no disponible | no disponible |
| BigCodec | 1040 | 80 | 1 | 0,84 / 0,69 | 0,93 / 0,88 | 3,27 / 2,55 | 2,68 / 2,06 | no disponible | no disponible |
| Mimi | 1100 | 12,5 | 8 | 0,74 / 0,59 | 0,91 / 0,85 | 2,80 / 2,24 | 2,25 / 1,78 | 1,24 / 1,19 | 2,62 / 2,49 |
| MOSS Audio Tokenizer | 750 | 12,5 | 6 | 0,82 / 0,75 | 0,93 / 0,89 | 3,14 / 2,73 | 2,60 / 2,22 | 0,86 / 0,85 | 2,21 / 2,10 |
| MOSS Audio Tokenizer | 1000 | 12,5 | 8 | 0,88 / 0,81 | 0,94 / 0,91 | 3,38 / 2,96 | 2,87 / 2,43 | 0,82 / 0,80 | 2,16 / 2,04 |

No se han publicado resultados de latencia, throughput ni benchmarks de tareas generativas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.600 millones de parametros, el peso en fp32 ronda los 6,4 GB por grafo; encoder y decoder pueden requerir en torno a 12-13 GB si se cargan simultaneamente, y aproximadamente la mitad en fp16. Son estimaciones de calculo, no cifras publicadas.
- En la practica encoder y decoder no se usan a la vez en el flujo de TTS, por lo que la huella en ejecucion se aproxima a la de un unico grafo.
- GPU recomendadas: A100 o H100 para servicio de alta concurrencia con TensorRT; RTX 4090 (24 GB) como opcion de gama alta en una sola tarjeta; RTX 3090 o 4080 (16-24 GB) validas en fp16.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas en fp16 con carga secuencial de encoder y decoder; por debajo de 8 GB conviene recurrir a la ruta de CPU o a cuantizacion del ONNX, no documentada oficialmente.
- Opciones de despliegue: ONNX Runtime GPU (`onnxruntime-gpu`), ONNX Runtime CPU (`onnxruntime`), TensorRT con motores compilados por el usuario mediante `moss_audio_tokenizer/trt/build_engine.sh`, e integracion con llama.cpp para el backbone del pipeline de TTS.
- No se proporcionan motores TensorRT precompilados, ya que dependen de la arquitectura de GPU y de la version de TensorRT.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El repositorio ocupa 14,2 GB, por lo que conviene prever ese espacio en disco antes de la descarga.

## Comparativa con modelos similares

| Modelo | Parametros | bps | Trama (Hz) | Nq | PESQ-WB voz (EN/ZH) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| MOSS Audio Tokenizer | 1,6B | 750-1000 | 12,5 | 6-8 | 2,60-2,87 / 2,22-2,43 | Apache 2.0 | Pesos PyTorch, ONNX y backbone GGUF |
| Mimi (Kyutai) | no disponible | 1100 | 12,5 | 8 | 2,25 / 1,78 | no disponible | no disponible |
| XY-Tokenizer | no disponible | 1000 | 12,5 | 8 | 2,50 / 2,12 | no disponible | no disponible |
| BigCodec | no disponible | 1040 | 80 | 1 | 2,68 / 2,06 | no disponible | no disponible |
| Higgs Audio Tokenizer | no disponible | 1000 | 25 | 4 | 2,48 / 2,14 | no disponible | no disponible |
| XCodec2.0 | no disponible | 800 | 50 | 1 | 2,43 / 1,96 | no disponible | no disponible |

Frente a Mimi y XY-Tokenizer, que comparten trama de 12,5 Hz, MOSS obtiene mejores cifras de PESQ-WB y STOI en ambos idiomas, con un regimen de bits comparable o inferior. Frente a BigCodec, que trabaja a 80 Hz y 1040 bps, MOSS iguala o supera la calidad con una trama seis veces menor, lo que reduce la longitud de secuencia que debe procesar un modelo de lenguaje posterior. Los datos de parametros y licencia de las alternativas no estan disponibles en la informacion consultada.

## Limitaciones y advertencias

- Este repositorio es una publicacion de terceros (ArchiveStudio) con 0 descargas y 0 likes; los artefactos oficiales se distribuyen en OpenMOSS-Team/MOSS-Audio-Tokenizer-ONNX. Conviene verificar la integridad de los ficheros antes de usarlos en produccion.
- El repositorio contiene unicamente el tokenizador. No genera audio por si mismo: necesita un backbone de lenguaje (Qwen3 en el caso de MOSS-TTS) para producir los tokens que el decoder convierte en onda.
- No es un modelo de lenguaje ni un sistema de reconocimiento de voz: no responde a instrucciones, no hace tool calling y no produce texto.
- Riesgo de artefactos acusticos en la reconstruccion, especialmente al operar en el extremo bajo del rango (0,125 kbps) o con material fuera de la distribucion de entrenamiento (musica muy densa, audio con ruido extremo).
- La evaluacion publicada se limita a ingles y chino para voz; el rendimiento en otras lenguas o en audio muy especializado no esta documentado.
- No se especifican umbrales de contexto maximo, comportamiento con entradas de duracion muy larga ni estrategias de troceado en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial y modificacion con obligacion de conservar el aviso de licencia y el fichero NOTICE si existe; no se documentan restricciones adicionales de uso aceptable.
- La ruta TensorRT exige compilar motores por GPU y version, lo que anade complejidad operativa y un paso de build en el despliegue.
- No hay variantes cuantizadas oficiales del ONNX publicadas en este repositorio; el despliegue en hardware muy limitado requiere trabajo adicional.

## Enlaces

- Repositorio consultado: https://huggingface.co/ArchiveStudio/MOSS-Audio-Tokenizer-ONNX
- Repositorio oficial ONNX: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-ONNX
- Pesos PyTorch oficiales: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer
- Backbone pre-cuantizado GGUF: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-GGUF
- Repositorio principal MOSS-TTS: https://github.com/OpenMOSS/MOSS-TTS
- Codigo fuente del tokenizador: https://github.com/OpenMOSS/MOSS-Audio-Tokenizer
- Documentacion del backend llama.cpp: https://github.com/OpenMOSS/MOSS-TTS/blob/main/moss_tts_delay/llama_cpp/README.md
- Seccion del tokenizador en el README de MOSS-TTS: https://github.com/OpenMOSS/MOSS-TTS#moss-audio-tokenizer
- Espejo alternativo en Hugging Face: https://huggingface.co/Jinstudio/MOSS-Audio-Tokenizer-ONNX
- Espejo del tokenizador en Hugging Face: https://huggingface.co/Jinstudio/MOSS-Audio-Tokenizer
- Guia de conversion a ONNX: https://github.com/201831771214/MossAudioTokenizer-ONNX
- Fichero de datos del encoder: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-ONNX/blob/main/encoder.data
- llama.cpp: https://github.com/ggerganov/llama.cpp
