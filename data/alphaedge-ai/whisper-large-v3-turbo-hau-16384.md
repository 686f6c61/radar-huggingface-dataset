# alphaedge-ai/whisper-large-v3-turbo-hau-16384

## Resumen

Whisper large-v3-turbo hau-16384 es una variante recortada (trimmed) del modelo de reconocimiento automatico del habla openai/whisper-large-v3-turbo, publicada por alphaedge-ai. El modelo aplica la tecnica de trimming de vocabulario para reducir el tokenizador de 51.865 a 16.384 tokens, conservando unicamente los tokens relevantes para el hausa (codigo ISO `ha`), lo que rebaja el numero de parametros de 808.878.080 a 763.461.120 (un 5,61% menos) y reduce de forma notable el espacio en memoria del embedding y de la cabeza de salida.

La relevancia practica esta en el despliegue: al mantener la arquitectura Whisper original pero con un vocabulario especifico de un solo idioma, el modelo ocupa menos memoria y puede servirse en entornos con recursos limitados sin renunciar a la calidad de transcripcion del modelo base para ese idioma. El repositorio pesa 1,5 GB en safetensors y esta pensado para usarse con la libreria transformers mediante `AutoModelForSpeechSeq2Seq` y un pipeline de `automatic-speech-recognition`.

No obstante, conviene subrayar que se trata de un modelo mono-idioma (hausa) y que, segun advierte el propio autor, su rendimiento fuera de ese idioma sera degradado porque los tokens no usados se han eliminado del vocabulario. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento en Whisper) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | hausa (`ha`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un transformer encoder-decoder con atencion estandar, entrenado originalmente por OpenAI sobre supervision debil a gran escala para reconocimiento del habla multilingue. El modelo base large-v3-turbo reduce el numero de capas del decoder respecto a large-v3, lo que explica su menor coste de inferencia manteniendo calidad cercana. La particularidad de esta version es la reduccion del vocabulario: se pasa de 51.865 a 16.384 tokens (un 68,41% menos), lo que reduce los parametros totales un 5,61%.

El proceso de trimming se realizo minando 200.000 textos del dataset lbourdois/fineweb-2-trimming para identificar los tokens efectivamente usados en hausa y conservarlos, descartando el resto. No se indica en la informacion disponible que se haya realizado un reentrenamiento o fine-tuning adicional de los pesos mas alla del recorte del vocabulario; el autor describe el modelo como una version trimmed del original que "deberia comportarse de forma similar" en el idioma objetivo. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO, por lo que esos datos se consideran no disponibles.

## Capacidades

- Reconocimiento automatico del habla (ASR) para hausa, con salida de transcripcion de texto.
- Procesamiento de audio a 16 kHz, con segmentacion en ventanas de 30 segundos propia de Whisper.
- Transcripcion y traduccion de voz: el pipeline admite `task: transcribe` (la model card muestra ese modo; la traduccion no se documenta explicitamente para este recorte).
- Integracion con la libreria transformers mediante `pipeline("automatic-speech-recognition")`.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita el despliegue gestionado.
- No se documentan capacidades de tool calling, agentes, vision, audio adicional ni modo thinking.

## Casos de uso

- Transcripcion de reuniones y entrevistas en hausa: el modelo convierte audio de hasta 30 segundos por segmento en texto, adecuado para actas y notas automaticas en entornos donde el hausa es lingua franca.
- Subtitulado de contenido audiovisual: genera transcripciones para videos, podcasts y material formativo en hausa, que luego pueden sincronizarse como subtitulos.
- Atencion al cliente por voz: sirve como capa ASR en sistemas de call center que atienden en hausa, alimentando el texto a un modulo de comprension o a un agente conversacional.
- Documentacion clinica o administrativa dictada: transcripcion de notas de voz en hausa para su posterior procesamiento, con la ventaja de un modelo ligero que puede ejecutarse en infraestructura modesta.
- Investigacion linguistica y sociolinguistica: generacion de corpus transcritos de hausa a partir de grabaciones de campo, con un modelo de tamano contenido (1,5 GB) facil de versionar.
- Despliegue en el borde o en servidores pequenos: al reducir vocabulario y parametros, encaja en entornos con VRAM limitada o en CPU, donde el modelo base completo resultaria mas costoso.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en contenido en hausa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,6-2 GB solo para pesos, mas el coste de activaciones y buffers de audio; en la practica, un entorno con 4-6 GB de VRAM es suficiente.
- En cuantizacion de 8 bits o 4 bits (si se aplica sobre safetensors), el modelo puede caber en menos de 1 GB de pesos, aunque la cuantizacion no se documenta oficialmente para esta variante.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien A100/H100 para despliegues de alto throughput, aunque el modelo es pequeno para esas GPUs.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (pipeline nativo), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp, Ollama y TGI no se documentan especificamente para esta variante en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-large-v3-turbo-hau-16384 (este) | 763.461.120 | no disponible (audio 30 s/segmento) | ha | apache-2.0 | Hugging Face |
| openai/whisper-large-v3-turbo | 808.878.080 | no disponible (audio 30 s/segmento) | multilingue | apache-2.0 | Hugging Face |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible (audio 30 s/segmento) | multilingue | apache-2.0 | Hugging Face |

La comparacion con otros modelos trimmed de hausa no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia principal es el menor tamano (5,61% menos parametros) y la especializacion en hausa, a costa de perder cobertura multilingue.

## Limitaciones y advertencias

- Modelo mono-idioma: solo hausa; el rendimiento en otros idiomas sera degradado porque los tokens no usados se eliminaron del vocabulario.
- Riesgo de alucinacion: como todo modelo ASR generativo, puede producir texto plausible pero incorrecto en audio ruidoso o con acentos no vistos.
- Sesgos: al derivar de Whisper large-v3-turbo, hereda los sesgos del entrenamiento original (posibles diferencias de calidad segun genero, edad, dialecto o calidad de grabacion); no se documentan evaluaciones de sesgo especificas.
- Limitaciones de contexto: Whisper procesa audio en ventanas de 30 segundos; audios mas largos requieren segmentacion externa.
- Calidad dependiente del trimming: el autor advierte que el modelo "deberia" comportarse de forma similar al original, pero no se aportan metricas que lo confirmen.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de minado.
- Caveat de produccion: al ser una variante con pocas descargas y sin benchmarks publicados, se recomienda validar con un conjunto de evaluacion propio antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-hau-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
