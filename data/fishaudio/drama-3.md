# fishaudio/drama-3

## Resumen

Fish Audio Drama 3 es un modelo de síntesis de voz (text-to-speech) desarrollado por Fish Audio, disenado especificamente para escenas con multiples personajes y contenido de formato largo. Frente a los TTS clasicos orientados a una sola voz, Drama 3 incorpora etiquetas de hablante (`<|speaker:0|>` hasta `<|speaker:15|>`) que permiten que un unico texto genere hasta 16 personajes distintos, ademas de clonacion de voz a partir de una referencia y control en lenguaje natural.

El modelo combina un backbone de texto de tipo Mixture of Experts con 35.900 millones de parametros totales y aproximadamente 3.000 millones activos por token, sobre una atencion hibrida (completa + lineal). La parte acustica la resuelve un decoder de audio basado en codebook-MTP que decodifica 10 codebooks de forma causal sobre toda la secuencia. Los expertos MoE estan en FP8 y el resto de pesos en bf16.

Su relevancia actual radica en que aborda dos problemas practicos del TTS en produccion: la coherencia de multiples voces en una misma pieza (audiolibros, doblaje, podcast) y la edicion de audio por continuacion, enviando las tomas anteriores como contexto para corregir palabras sin regenerar todo el audio. Ademas, esta soportado desde el primer dia en SGLang-Omni y vLLM-Omni, con latencias de primer audio por debajo de 100 ms en una sola GPU H200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de texto MoE con atencion hibrida (completa + lineal); decoder de audio codebook-MTP con 10 codebooks |
| Parametros totales | 35.899.643.008 (aprox. 35,9 B) |
| Parametros activos | Aprox. 3 B por token |
| Longitud de contexto | No disponible (el texto largo se trocea automaticamente y puede emitirse en streaming por fragmento) |
| Tipos de cuantizacion | Pesos en FP8 (expertos MoE) y bf16 (resto); no se detallan otras cuantizaciones |
| Idiomas soportados | 90+ idiomas, entre ellos zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo |
| Licencia | fish-audio-research-license (licencia de investigacion, no comercial generica) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 81,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Drama 3 se estructura en dos componentes. El primero es un backbone de lenguaje de tipo Mixture of Experts con 35,9 B de parametros totales y unos 3 B activos por token, que procesa el texto (incluidas las etiquetas de hablante y las marcas de eventos como `[sighs]` o `[laughs]`) y genera los tokens acusticos. Este backbone usa una atencion hibrida que combina capas de atencion completa con capas de atencion lineal, lo que reduce el coste computacional en secuencias largas. Los pesos de los expertos MoE se almacenan en FP8, mientras que el resto de la red permanece en bf16.

El segundo componente es un decoder de audio codebook-MTP que decodifica 10 codebooks de forma causal a lo largo de toda la secuencia, en lugar de predecir cada codebook de forma independiente. La edicion de audio se plantea como continuacion: se envian los tokens VQ de las tomas anteriores y el modelo los trata como contexto de lenguaje, igual que un modelo de lenguaje auto-regresivo. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles.

## Capacidades

- Generacion de voz multi-hablante: hasta 16 personajes distintos en un mismo texto mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`.
- Clonacion de voz zero-shot a partir de un clip de referencia corto (el ejemplo de la model card usa 3,9 s) con su transcripcion.
- Control en lenguaje natural y etiquetas de eventos insertadas en el texto en la posicion donde debe ocurrir el sonido (suspiros, risas, etc.).
- Generacion emocional: la model card etiqueta el modelo como `emotional-speech-generation`.
- Edicion de audio por continuacion: se envian las tomas previas (`previous_takes`) y el modelo regenera solo lo necesario, permitiendo encadenar ediciones sucesivas.
- Texto largo: troceado automatico y streaming por fragmento.
- Cobertura multilingue amplia (mas de 90 idiomas listados).
- No se menciona soporte de tool calling, function calling ni razonamiento multi-paso; no aplica a un modelo TTS.

## Casos de uso

- Audiolibros y ficcion con dialogos: el modelo puede narrar una escena con hasta 16 personajes diferenciados en una sola pasada, manteniendo la coherencia de voces a lo largo de capitulos largos gracias al troceado automatico y al streaming por fragmento.
- Doblaje y localizacion: con mas de 90 idiomas y clonacion de voz, se puede generar una pista de voz en otro idioma a partir de una referencia del actor original, y corregir lineas concretas con la edicion por continuacion sin regenerar la escena completa.
- Produccion de podcast: permite generar intervenciones de varios locutores sinteticos con marcas de eventos (risas, suspiros) insertadas en el punto exacto del texto, lo que reduce el trabajo de postproduccion.
- Iteracion de guion en estudio: el flujo de `previous_takes` permite cambiar una palabra o una frase (por ejemplo, "by noon" por "by five") conservando el resto de la toma, algo util para ajustes de guion sin rehacer la grabacion.
- Atencion al cliente con voz de marca: el modelo puede clonar una voz corporativa autorizada y generar respuestas en tiempo real; con TTFA de 88,9 ms en p50 a concurrencia 1 en H200, es viable en interaccion conversacional.
- Accesibilidad y lectura de contenido: conversion de articulos o documentos largos a voz con multiples hablantes para secciones diferenciadas y control de emocion, aprovechando el troceado automatico de textos largos.
- Prototipado de videojuegos: generacion rapida de lineas de dialogo para varios NPC con voces distintas y edicion iterativa de frases concretas durante el ajuste de guion.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks academicos (MMLU, HumanEval, GSM8K u otros), ya que se trata de un modelo TTS. Si se publican metricas de rendimiento en produccion medidas en NVIDIA H200 con peticiones en streaming sobre prompts en ingles de Seed-TTS, con temperatura 1.0, top_p 0.9, top_k 30 y max_new_tokens 500:

| Concurrencia | Throughput (frames/s) | TTFA p50 | TTFA p95 | RTF (media) |
|---:|---:|---:|---:|---:|
| 1 | 166,7 | 88,9 ms | 90,8 ms | 0,131 |
| 2 | 287,0 | 96,2 ms | 130,1 ms | 0,152 |
| 4 | 467,6 | 108,2 ms | 156,4 ms | 0,186 |
| 8 | 678,1 | 153,2 ms | 210,9 ms | 0,256 |
| 16 | 927,6 | 210,1 ms | 287,2 ms | 0,373 |
| 32 | 1.244,7 | 304,6 ms | 396,1 ms | 0,551 |
| 64 | 1.687,3 | 450,9 ms | 1.020,1 ms | 0,801 |

Cada celda es la media de cuatro ejecuciones. El throughput cuenta frames acusticos generados por segundo; TTFA es el tiempo hasta el primer audio y RTF el tiempo desde el envio de la peticion hasta el ultimo fragmento dividido por la duracion del audio devuelto. No se han publicado resultados de benchmarks academicos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 81,1 GB en safetensors (expertos en FP8 y resto en bf16). La inferencia requiere al menos una GPU con memoria suficiente para esos pesos mas el estado de activacion; una H200 (141 GB) es la plataforma de referencia de las mediciones publicadas.
- GPU recomendadas: NVIDIA H200 segun las pruebas de la model card. Para GPUs de menor memoria no se documentan recetas de cuantizacion adicionales, por lo que no se puede confirmar su viabilidad.
- GPU de consumo: no hay datos publicados que confirmen que el modelo quepa en una RTX 4090 u otras GPUs de consumo con los formatos disponibles.
- Despliegue: SGLang-Omni (`sgl-omni serve --model-path fishaudio/drama-3 --port 8000`) y vLLM-Omni (`vllm serve fishaudio/drama-3 --omni --port 8091`). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: en una sola H200, TTFA p50 de 88,9 ms y RTF medio de 0,131 a concurrencia 1; a concurrencia 64, throughput de 1.687,3 frames/s con TTFA p50 de 450,9 ms y RTF medio de 0,801.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos TTS comparables (por ejemplo, otros sistemas multi-hablante o de clonacion) que permitan una comparacion rigurosa de parametros, contexto, rendimiento y licencia. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Licencia de investigacion (`fish-audio-research-license`): el uso comercial esta restringido y requiere revisar los terminos del archivo LICENSE.md del repositorio antes de desplegar en produccion.
- La model card no documenta sesgos conocidos por idioma, genero o acento; con mas de 90 idiomas, la calidad probablemente sea desigual entre lenguas, aunque no se aportan datos al respecto.
- Riesgo de alucinacion acustica y de artefactos en la clonacion: no se publican metricas de similitud de hablante ni de inteligibilidad por idioma.
- La clonacion de voz exige permiso explicito sobre la voz de referencia; la propia model card insiste en clonar solo voces con autorizacion.
- No se detalla la longitud de contexto del backbone, solo que el texto largo se trocea automaticamente; la coherencia entre fragmentos largos no esta cuantificada.
- Los requisitos de hardware son elevados (81,1 GB de pesos); no hay recetas publicadas para GPUs de consumo, lo que limita el despliegue fuera de entornos con GPUs de datacenter.
- No se especifican datos de entrenamiento, composicion del dataset ni si hubo RLHF/DPO, lo que dificulta evaluar riesgos de contaminacion o sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fishaudio/drama-3
- Licencia: https://huggingface.co/fishaudio/drama-3/blob/main/LICENSE.md
- SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Drama 3 Cookbook (SGLang-Omni): https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio SGLang-Omni: https://github.com/sgl-project/sglang-omni
- vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Drama 3 Recipe (vLLM-Omni): https://recipes.vllm.ai/fishaudio/drama-3
- Sitio de Fish Audio: https://fishaudio.org/en
- Fish Audio (voces y clonacion): https://fishaudio.art/
- Referencia de paper (arxiv): 2610.18010
