# alphaedge-ai/whisper-large-v3-turbo-pus-16384

## Resumen

`whisper-large-v3-turbo-pus-16384` es una version recortada (trimmed) del modelo de reconocimiento automatico del habla `openai/whisper-large-v3-turbo`, publicada por el usuario `alphaedge-ai`. El modelo aplica la tecnica de trimming de vocabulario para reducir el tamano del tokenizer de 51.865 a 16.384 tokens, conservando unicamente aquellos mas relevantes para el pastun (codigo ISO `pus`, `ps`). El resultado es un modelo de 763.461.120 parametros (frente a 808.878.080 del original), lo que supone una reduccion del 5,61% en parametros y del 68,41% en vocabulario.

La arquitectura subyacente es la de Whisper large-v3-turbo: un encoder-decoder transformer orientado a transcripcion de audio, con entrada de audio remuestreada a 16 kHz. El modelo original large-v3-turbo reduce el numero de capas del decoder respecto a large-v3, lo que abarata la inferencia manteniendo calidad cercana. Esta variante trimmed hereda esa arquitectura y solo modifica la capa de embeddings del tokenizer y la proyeccion final.

Es relevante para desarrolladores que necesitan un modelo ASR ligero y especializado en pastun, con huella de memoria notablemente menor (repo de 1,5 GB) y licencia Apache 2.0 permisiva. La contrapartida es que el recorte de vocabulario elimina tokens de otros idiomas, por lo que el modelo deja de ser multilingue util y queda practicamente restringido al pastun.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper large-v3-turbo) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos safetensors sin cuantizar publicados) |
| Idiomas soportados | Pastun (`ps` / `pus`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3-turbo` y no ha sido reentrenado: la unica modificacion es el recorte del vocabulario mediante la tecnica de trimming descrita en el blog de Hugging Face. Se seleccionaron 16.384 tokens a partir de la mineria sobre 20.690 textos del dataset `lbourdois/fineweb-2-trimming`, filtrando el vocabulario original de 51.865 tokens para quedarse con los mas frecuentes en pastun. Los embeddings de tokens no utilizados se eliminan y las dimensiones de la capa de salida se ajustan en consecuencia.

Whisper es un transformer encoder-decoder entrenado originalmente con supervision debil a gran escala (paper arXiv:2212.04356). La variante turbo reduce el decoder a 4 capas (frente a 32 en large-v3), lo que acelera la decodificacion. No se documenta en la informacion disponible ningun proceso adicional de RLHF, DPO ni fine-tuning supervisado especifico para pastun; el autor indica que el modelo recortado "deberia comportarse de forma similar al original" en el idioma objetivo, sin garantias formales.

## Capacidades

- Transcripcion de audio a texto (ASR) en pastun, con pipeline `automatic-speech-recognition` de transformers.
- Entrada de audio remuestreada a 16 kHz, procesada en segmentos de hasta 30 segundos.
- Decodificacion rapida gracias al decoder reducido de la variante turbo.
- Soporte de tareas de transcripcion (`transcribe`); la tarea de traduccion a ingles (`translate`) no esta garantizada tras el recorte de vocabulario.
- No soporta tool calling ni function calling.
- No esta orientado a agentes ni a razonamiento multi-step.
- Capacidades multilingues muy limitadas: el recorte elimina tokens de otros idiomas, por lo que el uso fuera del pastun degrada notablemente.
- No dispone de vision ni audio generativo; es exclusivamente ASR.

## Casos de uso

- Transcripcion de reuniones y entrevistas en pastun: el modelo convierte audio grabado (remuestreado a 16 kHz) en texto con una huella de memoria reducida, adecuado para servicios de actas automaticas en organizaciones que operan en afganistan y zonas pastunhablantes.
- Subtitulado de contenido audiovisual: integrable en pipelines que generan subtitulos SRT a partir de videos en pastun, aprovechando la velocidad del decoder turbo para procesar horas de material en lote.
- Atencion al cliente telefonica: transcripcion en tiempo (casi) real de llamadas en pastun para alimentar sistemas de analisis de sentimiento o busqueda de palabras clave, con menor coste de GPU que el modelo completo.
- Archivado y indexacion de audio historico: conversion masiva de grabaciones en pastun a texto indexable, donde el tamano reducido del repo (1,5 GB) facilita el despliegue en servidores modestos.
- Investigacion linguistica y creacion de corpus: generacion de transcripciones para anotacion y estudio del pastun, con la ventaja de una licencia Apache 2.0 que permite redistribucion.
- Despliegue en edge o entornos con VRAM limitada: al ser un modelo de menos de 800 millones de parametros, puede ejecutarse en GPUs consumer e incluso en CPU con latencias aceptables para transcripcion por lotes.
- Accesibilidad: dictado de voz a texto para usuarios pastunhablantes en aplicaciones de escritorio o moviles con backend ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas de tamano (reduccion de vocabulario del 68,41% y de parametros del 5,61%) y afirma que el rendimiento "deberia ser similar al original" en pastun, sin cifras de WER (word error rate) ni comparaciones medidas.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3 GB para pesos mas activaciones; en fp16/bf16 alrededor de 1,5-2 GB.
- Cabe holgadamente en GPUs consumer: RTX 3060 (12 GB), RTX 4070, RTX 4090, e incluso en GPUs de 4-6 GB con margen.
- Ejecutable en CPU para transcripcion por lotes, con latencias mayores pero funcionales.
- GPUs de datacenter (A100, H100) no son necesarias; el modelo es demasiado pequeno para aprovecharlas y el cuello de botella sera el preprocesado de audio.
- Opciones de despliegue: pipeline `transformers` (documentado en la model card), ademas de potencialmente vLLM, TGI o llama.cpp/whisper.cpp si se convierten los pesos (no documentado en la informacion disponible).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la variante turbo del modelo base es conocida por ser varias veces mas rapida que large-v3, pero no se aportan cifras concretas para esta version recortada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-pus-16384 | 763.461.120 | segmentos de 30 s | Pastun | Apache 2.0 | Hugging Face (26 descargas) |
| openai/whisper-large-v3-turbo | 808.878.080 | segmentos de 30 s | Multilingue (~99 idiomas) | Apache 2.0 | Hugging Face (oficial) |
| openai/whisper-large-v3 | no disponible en esta ficha | segmentos de 30 s | Multilingue (~99 idiomas) | Apache 2.0 | Hugging Face (oficial) |
| openai/whisper-small | no disponible en esta ficha | segmentos de 30 s | Multilingue | Apache 2.0 | Hugging Face (oficial) |

La comparacion directa mas relevante es con el modelo base sin recortar: esta variante gana en tamano de vocabulario y huella de memoria, pero pierde cobertura multilingue y no aporta mejoras medibles en pastun respecto al original. Frente a whisper-small, esta version tiene mas parametros pero esta especializada en un unico idioma.

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens de otros idiomas: el modelo no debe usarse para transcripcion multilingue ni para cambiar de idioma en una misma sesion.
- Riesgo de alucinacion y repeticiones en audio con ruido, silencios largos o acentos no representados en los datos de mineria, comportamiento inherente a Whisper.
- Sesgos potenciales derivados del dataset de mineria (`fineweb-2-trimming`) y del entrenamiento original de Whisper, que pueden afectar la cobertura de variantes dialectales del pastun.
- No hay evidencia publicada de calidad (WER) en pastun para esta version recortada; conviene validar con un conjunto de prueba propio antes de usarla en produccion.
- La tarea de traduccion (`translate`) no esta garantizada tras el recorte.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de rendimiento; el modelo base OpenAI Whisper esta sujeto a su propia licencia Apache 2.0, compatible.
- Modelo con muy pocas descargas (26) y sin likes: no cuenta con validacion de la comunidad, lo que aumenta el riesgo de comportamiento no verificado.
- La fecha de creacion (2026-06-01) y actualizacion (2026-11-18) indican un modelo reciente y poco rodado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-pus-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Paper Whisper (arXiv:2212.04356): https://arxiv.org/abs/2212.04356
- Blog de introduccion al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de mineria: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
