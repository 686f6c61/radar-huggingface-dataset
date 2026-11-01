# Infinix-ai/drama-3

## Resumen

Fish Audio Drama 3 es un modelo de texto a voz (TTS) de nueva generación desarrollado por Fish Audio, disenado especificamente para escenas con multiples personajes y contenido de formato largo. Se distribuye en HuggingFace bajo el identificador `Infinix-ai/drama-3` y emplea una arquitectura Mixture-of-Experts (MoE) con un backbone de texto de 35 000 millones de parametros totales y 3 000 millones activos por token, combinando atencion completa y atencion lineal en un esquema hibrido. El decodificador de audio utiliza un esquema de codebook-MTP (multi-token prediction) que decodifica 10 codebooks de forma causal sobre toda la secuencia.

El modelo resuelve el problema de la sintesis de voz multi-locutor y la edicion de audio en lenguaje natural: permite asignar hasta 16 personajes distintos mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>` dentro de un mismo texto, clonar voces a partir de referencias cortas (por ejemplo, un clip de 3,9 segundos) y editar tomas previas tratando la edicion como una continuacion del contexto, de forma analoga a como operan los modelos de lenguaje. Incluye control en lenguaje natural y etiquetas de eventos no verbales como `[sighs]` o `[laughs]` insertadas en el texto.

Su relevancia actual radica en que combina un backbone MoE de gran escala con un decodificador de audio eficiente y soporte de dia de lanzamiento en los motores de inferencia SGLang-Omni y vLLM-Omni. Segun las mediciones del autor en una GPU NVIDIA H200, alcanza un TTFA (tiempo hasta el primer audio) inferior a 100 ms en un solo stream y un throughput de 1 687,3 frames de audio por segundo con concurrencia 64. La licencia es la Fish Audio Research License, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con backbone de texto transformer hibrido (atencion completa + atencion lineal) y decodificador de audio codebook-MTP |
| Parametros totales | 35 899 643 008 (aproximadamente 35,9 mil millones) |
| Parametros activos | 3 mil millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 para los expertos MoE; resto de pesos en bf16 |
| Idiomas soportados | 85 idiomas, entre ellos zh, en, ja, ko, es, pt, ar, ru, fr, de, it, tr, nl, ca, gl, hi, th, vi, bn, he, ms, uk, id, fa, el, hr, ro, be, ml, sr, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu y fo |
| Licencia | fish-audio-research-license (licencia de investigacion, no comercial por defecto) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Drama 3 se construye sobre un backbone de texto de tipo Mixture-of-Experts con 35,9 mil millones de parametros totales y 3 mil millones activos por token, lo que reduce el coste computacional por paso manteniendo una capacidad de representacion elevada. La atencion es hibrida: combina capas de atencion completa con capas de atencion lineal, un patron habitual para extender la longitud efectiva de contexto y abaratar la inferencia en secuencias largas. Los expertos MoE se almacenan en FP8, mientras que el resto de los pesos permanece en bf16, una mezcla que busca equilibrar precision y huella de memoria.

El decodificador de audio emplea un esquema codebook-MTP: 10 codebooks se decodifican de forma causal sobre la secuencia completa, en lugar de generar cada codebook de manera independiente. Esto permite modelar la estructura acustica de forma conjunta y habilita funcionalidades como la edicion por continuacion, en la que se reutilizan los tokens VQ (vector-quantized) de tomas anteriores como contexto. El modelo soporta etiquetas de locutor `<|speaker:0|>` a `<|speaker:15|>` para hasta 16 personajes en un mismo texto, divide automaticamente textos largos en fragmentos y permite streaming por fragmento. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Sintesis de voz multilingue en 85 idiomas, con etiquetas de idioma declaradas en la model card.
- Generacion multi-locutor: hasta 16 personajes distintos identificados con etiquetas `<|speaker:0|>` a `<|speaker:15|>` en un unico texto.
- Clonacion de voz a partir de un clip de referencia corto (el ejemplo de la model card usa 3,9 segundos) junto con su transcripcion.
- Control en lenguaje natural sobre el estilo y la interpretacion de la voz.
- Etiquetas de eventos no verbales insertadas en el texto, como `[sighs]` o `[laughs]`, posicionadas donde debe ocurrir el evento.
- Edicion de audio como continuacion: se envian las tomas previas (`previous_takes`) y los tokens VQ anteriores como contexto para modificar palabras concretas conservando el resto de la locucion.
- Encadenamiento de ediciones sucesivas sobre el resultado de una edicion anterior.
- Generacion de contenido de formato largo mediante troceado automatico del texto y streaming por fragmento.
- Salida de audio en streaming con baja latencia hasta el primer audio.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio de entrada mas alla de la referencia de clonacion.

## Casos de uso

- Audiolibros y ficcion con dialogos: el modelo permite asignar hasta 16 voces distintas mediante etiquetas de locutor dentro de un mismo texto y trocear automaticamente capitulos largos, de modo que un unico proceso puede narrar escenas con varios personajes sin cambiar de modelo ni de pipeline.
- Doblaje y localizacion: con soporte para 85 idiomas y clonacion a partir de una referencia corta, se puede generar una pista de voz en el idioma destino conservando el timbre del actor original, lo que simplifica los flujos de doblaje multilingue.
- Produccion de podcast y contenido editorial: las etiquetas de eventos no verbales (`[sighs]`, `[laughs]`) y el control en lenguaje natural permiten dirigir la interpretacion desde el propio guion, reduciendo las iteraciones manuales de postproduccion.
- Correccion de tomas sin regrabar: la edicion como continuacion permite cambiar una palabra (por ejemplo, "Wednesday" por "Thursday") pasando la toma anterior como contexto, lo que evita regrabar la locucion completa y conserva la coherencia acustica.
- Asistentes de voz y atencion al cliente: con un TTFA p50 de 88,9 ms en un solo stream y un RTF de 0,131 medido en H200, el modelo es apto para respuestas habladas interactivas donde la latencia perceptible es critica.
- Generacion de voces sinteticas para videojuegos y animacion: la asignacion de multiples locutores en una sola peticion facilita generar dialogos de varios personajes en lote, con control de emocion y eventos no verbales por linea de guion.
- Servicios de accesibilidad: conversion de texto a voz de alta calidad en 85 idiomas para lectores de pantalla y narracion de documentos, con streaming por fragmento para textos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye mediciones de rendimiento de servicio en una GPU NVIDIA H200 con peticiones en streaming sobre prompts en ingles de Seed-TTS, clonando voz desde una referencia pre-codificada (`vq_codes` con su transcripcion) y con `temperature` 1.0, `top_p` 0.9, `top_k` 30 y `max_new_tokens` 500:

| Concurrencia | Throughput (frames/s) | TTFA p50 | TTFA p95 | RTF (media) |
|---:|---:|---:|---:|---:|
| 1 | 166,7 | 88,9 ms | 90,8 ms | 0,131 |
| 2 | 287,0 | 96,2 ms | 130,1 ms | 0,152 |
| 4 | 467,6 | 108,2 ms | 156,4 ms | 0,186 |
| 8 | 678,1 | 153,2 ms | 210,9 ms | 0,256 |
| 16 | 927,6 | 210,1 ms | 287,2 ms | 0,373 |
| 32 | 1 244,7 | 304,6 ms | 396,1 ms | 0,551 |
| 64 | 1 687,3 | 450,9 ms | 1 020,1 ms | 0,801 |

Cada celda es la media de cuatro ejecuciones. El RTF se define como el tiempo desde el envio de la peticion hasta el ultimo fragmento de audio, dividido por la duracion del audio devuelto.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 41,5 GB en safetensors, con expertos MoE en FP8 y el resto en bf16; se requiere al menos una GPU con 48 GB de memoria para cargar los pesos completos, y mas margen para el estado de decodificacion y el cache de atencion en concurrencia alta.
- GPU recomendadas: NVIDIA H200 (plataforma de las mediciones oficiales). Por capacidad de memoria, tambien son candidatas A100 de 80 GB, H100 de 80 GB y GPUs profesionales con 48 GB o mas.
- Cabe en GPU de consumo: no de forma completa con los pesos en FP8/bf16; los 35,9 mil millones de parametros y los 41,5 GB del repositorio exceden la VRAM de las RTX 4090 (24 GB) y similares. No se documentan cuantizaciones GGUF ni versiones para llama.cpp u Ollama.
- Opciones de despliegue: SGLang-Omni (`sgl-omni serve --model-path fishaudio/drama-3 --port 8000`) y vLLM-Omni (`vllm serve fishaudio/drama-3 --omni --port 8091`), ambas disponibles desde el dia de lanzamiento.
- Latencia y throughput: en una H200, TTFA p50 de 88,9 ms con concurrencia 1 y throughput de 1 687,3 frames/s con concurrencia 64; el RTF medio crece de 0,131 a 0,801 entre esos dos extremos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Despliegue documentado |
|---|---|---|---|---|
| Fish Audio Drama 3 | 35,9 B totales / 3 B activos | no disponible | fish-audio-research-license | SGLang-Omni, vLLM-Omni |
| Alternativas de TTS multi-locutor | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia fish-audio-research-license es una licencia de investigacion: el uso comercial requiere revisar los terminos del archivo LICENSE.md del repositorio y, previsiblemente, obtener autorizacion del titular.
- No se documentan sesgos conocidos del modelo; al ser un sistema de clonacion de voz, existe riesgo de uso indebido para suplantacion de identidad o generacion de audio enganoso, y se recomienda aplicar medidas de consentimiento y trazabilidad en produccion.
- Riesgo de alucinacion acustica: en TTS, esto se manifiesta como prosodia incorrecta, pronunciacion erronea o artefactos en palabras poco frecuentes, especialmente en idiomas con menos datos de entrenamiento dentro de los 85 declarados.
- La model card no especifica la longitud de contexto del backbone de texto; el troceado automatico de textos largos mitiga esta limitacion, pero puede introducir discontinuidades en la prosodia entre fragmentos.
- Las mediciones de rendimiento se han realizado exclusivamente en NVIDIA H200 y con prompts en ingles de Seed-TTS; el rendimiento en otras GPUs, en otros idiomas o con referencias de clonacion mas largas puede diferir.
- La clonacion de voz depende de una referencia de audio con su transcripcion; la calidad del resultado esta condicionada por la duracion y limpieza de esa referencia (el ejemplo oficial usa 3,9 segundos).
- No se documentan capacidades de tool calling, agentes ni vision; el modelo esta especializado en texto a voz y edicion de audio.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y el identificador de HuggingFace (`Infinix-ai/drama-3`) difiere del usado en los comandos de despliegue de la model card (`fishaudio/drama-3`), lo que conviene verificar antes de integrarlo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/Infinix-ai/drama-3
- SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Drama 3 Cookbook (SGLang-Omni): https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Repositorio vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Drama 3 vLLM-Omni Recipe: https://recipes.vllm.ai/fishaudio/drama-3
- Paper (arXiv): arxiv:2610.18010
- Referencia de audio de ejemplo (en0): https://huggingface.co/datasets/zhaochenyang20/seed-tts-eval-mini/resolve/main/en/prompt-wavs/common_voice_en_10119832.wav
