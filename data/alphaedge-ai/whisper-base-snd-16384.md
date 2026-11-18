# alphaedge-ai/whisper-base-snd-16384

## Resumen

whisper-base-snd-16384 es una variante podada de openai/whisper-base, el modelo de reconocimiento automatico del habla (ASR) de OpenAI publicado en 2022. Lo desarrolla alphaedge-ai aplicando la tecnica de *trimming* de vocabulario descrita por Hugging Face: se conservan unicamente los 16.384 tokens mas relevantes para el sindhi (sd), eliminando el resto del vocabulario multilingue original de 51.865 tokens. El resultado es un modelo un 25,02% mas pequeno en parametros (54.427.648 frente a 72.593.920) y con un vocabulario un 68,41% menor.

El problema que resuelve es el sobredimensionamiento del vocabulario de Whisper cuando solo se necesita un idioma: los embeddings y la capa de salida dominan el peso de los modelos *base* y *small*, y en despliegues monolingues ese coste es innecesario. Al recortar el vocabulario, el modelo ocupa menos memoria y el repositorio se reduce a unos 0,1 GB, lo que facilita su despliegue en entornos con recursos limitados.

Es relevante ahora porque el ecosistema de *trimming* de Hugging Face permite generar variantes ligeras de modelos abiertos sin reentrenar, y porque el sindhi es un idioma de bajos recursos con pocas alternativas ASR dedicadas. La licencia Apache 2.0 y el formato transformers/safetensors lo hacen directamente utilizable en produccion. No obstante, el modelo solo conserva capacidades para sindhi: el resto de idiomas que cubria Whisper queda practicamente inutilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con vocabulario podado |
| Parametros totales | 54.427.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | sindhi (sd) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper *base*: un transformer encoder-decoder con atencion estandar, entrenado originalmente por OpenAI con supervision debil a gran escala sobre audio y transcripciones de internet (paper arXiv:2212.04356). El encoder procesa espectrogramas Mel de 80 canales en ventanas de 30 segundos y el decoder genera tokens de texto de forma autoregresiva, con tokens especiales de idioma y tarea.

Este modelo concreto no se ha reentrenado: es una version podada del checkpoint original. El proceso de *trimming* consistio en muestrear 200.000 textos del dataset lbourdois/fineweb-2-trimming para identificar los tokens mas frecuentes en sindhi, conservar los 16.384 mas relevantes (incluidos los tokens especiales de Whisper) y recortar las matrices de embedding y de la capa de salida al nuevo vocabulario. No se menciona ningun ajuste fino posterior, RLHF ni DPO en la informacion disponible.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en sindhi, con audio de entrada a 16 kHz.
- Transcripcion de audio en ventanas de hasta 30 segundos por pasada, con posibilidad de *chunking* para audios mas largos mediante el pipeline de transformers.
- Tarea de transcripcion (`task: transcribe`); la tarea de traduccion a ingles no esta validada para este checkpoint podado.
- Soporte de tool calling / function calling: no disponible (modelo ASR, no conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a sindhi; el vocabulario recortado elimina tokens de otros idiomas.
- Capacidades especiales (thinking mode, vision, audio de entrada distinto de ASR): no disponibles.

## Casos de uso

- Transcripcion de reuniones y entrevistas en sindhi: el modelo convierte audio de 16 kHz en texto con un pipeline de transformers, adecuado para documentar conversaciones internas en organizaciones que operan en este idioma.
- Subtitulado automatico de contenido audiovisual en sindhi: integrado en un pipeline de *chunking* de audio, genera transcripciones que se pueden alinear con marcas de tiempo para videos educativos o informativos.
- Digitalizacion de archivos orales: grabaciones historicas o entrevistas de campo en sindhi pueden transcribirse por lotes con un coste de memoria reducido gracias al vocabulario podado.
- Asistencia a la accesibilidad: conversion de voz a texto en aplicaciones para personas con discapacidad auditiva en comunidades sindhi, donde las alternativas ASR son escasas.
- Preprocesamiento para NLP en sindhi: las transcripciones generadas alimentan pipelines posteriores de analisis de sentimiento, resumen o indexacion de contenido, cubriendo un idioma con pocos recursos.
- Despliegue en dispositivos con recursos limitados: con 54 millones de parametros y pesos safetensors de ~0,1 GB, cabe en GPUs de consumo y en entornos edge donde un Whisper multilingue completo no es viable.
- Moderacion y analisis de llamadas en centros de atencion: transcripcion de audio de clientes en sindhi para clasificacion y busqueda posterior, con menor huella de memoria en servidores compartidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que el modelo podado "deberia rendir de forma similar al original" en sindhi, sin cifras de WER ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (54,4 M de parametros, ~0,22 GB de pesos) y alrededor de 0,1-0,3 GB en FP16/BF16; el consumo real depende del tamaño de lote y de la longitud del audio.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 y T4 sin problemas.
- Cabe en GPU de consumo: si, incluidas GTX 1650, RTX 3050 y superiores; tambien puede ejecutarse en CPU para audios cortos.
- Opciones de despliegue: pipeline de transformers (`automatic-speech-recognition`), servidores de inferencia compatibles con transformers; no se confirma soporte nativo en llama.cpp, Ollama o vLLM (son entornos orientados a LLM, no a ASR Whisper).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto de audio |
|---|---|---|---|---|---|
| whisper-base-snd-16384 | 54.427.648 | 16.384 | sindhi | Apache 2.0 | ventanas de 30 s |
| openai/whisper-base | 72.593.920 | 51.865 | multilingue (99 idiomas) | Apache 2.0 | ventanas de 30 s |
| openai/whisper-small | no disponible en la informacion | no disponible | multilingue | Apache 2.0 | ventanas de 30 s |
| Variantes podadas de Whisper (otras familias de idiomas) | variable | variable | idioma especifico | Apache 2.0 | ventanas de 30 s |

La comparacion directa mas relevante es con openai/whisper-base: el modelo podado reduce un 25,02% los parametros y un 68,41% el vocabulario, a cambio de perder cobertura multilingue. Frente a whisper-small, el podado es mas ligero pero con menor capacidad de reconocimiento; no hay datos de WER para cuantificar la diferencia.

## Limitaciones y advertencias

- Solo soporta sindhi: los tokens de otros idiomas se han eliminado del vocabulario, por lo que la transcripcion de audio en cualquier otro idioma sera incorrecta o fallida.
- No se han publicado evaluaciones de WER en sindhi para esta variante; el rendimiento real frente al original es incierto.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible en segmentos de silencio o ruido, especialmente en idiomas de bajos recursos.
- Sesgos: hereda los sesgos del corpus de entrenamiento original de Whisper, con posible peor rendimiento en acentos, dialectos o habla informal no representados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del dataset de *mining* (lbourdois/fineweb-2-trimming).
- Requiere audio a 16 kHz y ventanas de 30 segundos; audios mas largos necesitan segmentacion manual o mediante pipeline.
- El proceso de *trimming* puede degradar ligeramente la calidad en palabras poco frecuentes del sindhi si sus tokens quedaron fuera del vocabulario recortado.
- No es un modelo conversacional ni soporta tool calling; su unico uso previsto es ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-snd-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog de introduccion al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
