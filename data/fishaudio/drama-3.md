# fishaudio/drama-3

## Resumen

Fish Audio Drama 3 es un modelo de sintesis de voz (text-to-speech) desarrollado por Fish Audio, disenado especificamente para escenas con multiples personajes y contenido de formato largo. A diferencia de los sistemas TTS clasicos, emplea una arquitectura de backbone de texto con mezcla de expertos (MoE) de 35.899.643.008 parametros totales y aproximadamente 3.000 millones de parametros activos por token, combinada con un decodificador de audio basado en Codebook-MTP que genera 10 codebooks de forma causal sobre toda la secuencia.

El modelo resuelve tareas de generacion multi-hablante, clonacion de voz y edicion de audio controlada por lenguaje natural. Una misma entrada de texto puede transportar hasta 16 personajes distintos mediante etiquetas de hablante (`<|speaker:0|>` a `<|speaker:15|>`), y admite control emocional y de eventos no verbales con etiquetas en linea como `[sighs]` o `[laughs]`. El texto largo se trocea automaticamente y puede emitirse en streaming por fragmentos.

Es relevante porque combina un backbone MoE de gran escala con expertos cuantizados en FP8 y el resto de pesos en bf16, lo que reduce el coste de inferencia manteniendo calidad. Se sirve desde el primer dia con SGLang-Omni y soporta 83 idiomas, lo que lo posiciona como alternativa orientada a produccion para doblaje, audiolibros y doblaje multi-personaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (backbone de texto) con atencion hibrida (full + linear) y decodificador de audio Codebook-MTP de 10 codebooks |
| Parametros totales | 35.899.643.008 (~35,9B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los expertos MoE se publican en FP8 y el resto de pesos en bf16) |
| Idiomas soportados | 83 (zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo) |
| Licencia | fish-audio-research-license (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un backbone de texto con arquitectura de mezcla de expertos (MoE) y atencion hibrida, que mezcla atencion completa con atencion lineal para reducir el coste computacional en secuencias largas. Solo se activan aproximadamente 3.000 millones de parametros de los 35.900 millones totales por cada token generado. Los expertos MoE se almacenan en FP8, mientras que el resto de los pesos permanece en bf16, una estrategia de precision mixta orientada a acelerar la inferencia sin degradar en exceso la calidad.

La parte acustica se resuelve con un decodificador de audio del tipo Codebook-MTP (multi-token prediction) que decodifica 10 codebooks de forma causal a lo largo de toda la secuencia, en lugar de generar codebooks de manera secuencial e independiente. El control de escena se articula mediante etiquetas de hablante (`<|speaker:0|>` a `<|speaker:15|>`), que permiten hasta 16 personajes en un mismo texto, y mediante etiquetas de eventos no verbales insertadas en la posicion exacta del texto donde deben ocurrir. La edicion de audio se plantea como continuacion: se envian los tokens VQ previos como contexto y el modelo genera la version corregida, lo que permite encadenar varias ediciones sucesivas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de voz multi-hablante con soporte de hasta 16 personajes distintos en un mismo texto mediante etiquetas de hablante.
- Clonacion de voz a partir de un clip de referencia corto (el ejemplo de la model card usa una referencia de 3,9 segundos) junto con su transcripcion.
- Control emocional y de eventos no verbales mediante etiquetas en linea (`[sighs]`, `[laughs]`) colocadas en el punto del texto donde debe ocurrir el evento.
- Edicion de audio tratada como continuacion: se reenvian los tokens VQ anteriores y el modelo regenera el fragmento modificado.
- Ediciones encadenadas: varias ediciones sucesivas pueden acumularse pasando las tomas previas como contexto.
- Procesamiento de texto largo con troceado automatico y streaming por fragmentos.
- Soporte multilingue en 83 idiomas, incluidos castellano, catalan, euskera y gallego.
- Servicio de produccion mediante API compatible con `/v1/tts` y despliegue en SGLang-Omni.
- No se menciona soporte de tool calling, function calling ni capacidades de vision o audio de entrada mas alla de la referencia de clonacion.

## Casos de uso

- Doblaje multi-personaje: una sola peticion puede contener hasta 16 voces distintas etiquetadas con `<|speaker:N|>`, lo que permite generar dialogos completos de una escena sin lanzar una peticion por personaje.
- Audiolibros y contenido de formato largo: el modelo trocea el texto automaticamente y puede emitirse por fragmentos en streaming, lo que facilita narrar capitulos extensos manteniendo la coherencia de la voz clonada.
- Produccion de podcasts sinteticos: con etiquetas de hablante y control de eventos no verbales se pueden generar conversaciones entre varios locutores con risas, suspiros y pausas naturales.
- Postproduccion y correccion de locuciones: mediante la edicion como continuacion se puede cambiar una palabra o una frase de una toma ya generada sin regrabar toda la locucion, encadenando varias correcciones.
- Localizacion y doblaje multilingue: con soporte de 83 idiomas, una misma voz clonada puede reutilizarse para generar versiones en distintos idiomas manteniendo la identidad vocal de referencia.
- Asistentes de voz y atencion al cliente: la API `/v1/tts` y el despliegue con SGLang-Omni permiten integrar la generacion de voz en flujos de respuesta en tiempo real, con una latencia hasta el primer audio inferior a 100 ms en una sola peticion.
- Videojuegos y NPCs: los 16 hablantes por texto y el control emocional permiten generar lineas de dialogo de varios personajes con reacciones no verbales en el punto exacto del guion.
- Accesibilidad: conversion de documentos largos a audio con voz clonada y soporte de idiomas minoritarios incluidos en la lista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (WER, similitud de hablante, MOS) en la informacion disponible. El autor si publica mediciones de rendimiento de servicio en NVIDIA H200 con peticiones en streaming sobre prompts en ingles de Seed-TTS, clonando una voz de referencia precodificada (`vq_codes` con su transcripcion) y usando temperatura 1.0, top_p 0.9, top_k 30 y max_new_tokens 500. El throughput cuenta frames acusticos generados por segundo, TTFA es el tiempo hasta el primer audio y RTF es el tiempo desde el envio de la peticion hasta el ultimo fragmento dividido por la duracion del audio devuelto.

| Concurrencia | Throughput (frames/s) | TTFA p50 | TTFA p95 | RTF (media) |
|---:|---:|---:|---:|---:|
| 1 | 166,7 | 88,9 ms | 90,8 ms | 0,131 |
| 2 | 287,0 | 96,2 ms | 130,1 ms | 0,152 |
| 4 | 467,6 | 108,2 ms | 156,4 ms | 0,186 |
| 8 | 678,1 | 153,2 ms | 210,9 ms | 0,256 |
| 16 | 927,6 | 210,1 ms | 287,2 ms | 0,373 |
| 32 | 1.244,7 | 304,6 ms | 396,1 ms | 0,551 |
| 64 | 1.687,3 | 450,9 ms | 1.020,1 ms | 0,801 |

Tabla 1: rendimiento en streaming de Drama 3 sobre una H200. Cada celda es la media de cuatro ejecuciones. Un unico stream obtiene el primer audio en menos de 100 ms; a concurrencia 16 el audio se genera unas 2,7 veces mas rapido de lo que se reproduce, y a concurrencia 64 el RTF medio se mantiene en 0,80.

## Requisitos de hardware

- El autor aporta mediciones exclusivamente sobre NVIDIA H200 con SGLang-Omni, sin cifras para otras GPU.
- El tamano del repositorio es de 41,5 GB, coherente con 35,9B parametros donde los expertos MoE estan en FP8 y el resto en bf16. La VRAM necesaria para pesos se situa en ese orden de magnitud, mas el espacio adicional para cache KV y estados del decodificador de audio (no cuantificado en la informacion disponible).
- No se indica si el modelo cabe en GPU de consumo (RTX 4090, etc.). Dado el tamano de pesos, no es esperable que quepa en una unica GPU de 24 GB sin cuantizacion adicional, pero no se confirma en la informacion disponible.
- Opciones de despliegue: SGLang-Omni es el framework soportado desde el primer dia (`sgl-omni serve --model-path fishaudio/drama-3 --port 8000`). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: segun la Tabla 1, TTFA p50 de 88,9 ms y RTF de 0,131 a concurrencia 1 sobre H200; a concurrencia 64, TTFA p50 de 450,9 ms y RTF medio de 0,801.

## Comparativa con modelos similares

No se dispone de datos numericos comparativos publicados en la informacion proporcionada. Los unicos modelos de la misma familia mencionados en la busqueda son:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fish Audio Drama 3 | 35,9B totales, ~3B activos | no disponible | no disponible (solo datos de servicio en H200) | fish-audio-research-license | HuggingFace, SGLang-Omni |
| Fish Audio S2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Fish Audio S2.1 Pro | no disponible | no disponible | no disponible | no disponible | servicio en fish.audio |

La busqueda menciona que S2 se entreno sobre mas de 10 millones de horas de audio en unos 50 idiomas y que S2.1 Pro da soporte a 83 idiomas, pero no se aportan parametros, contexto ni resultados de benchmark de estos modelos, por lo que no es posible una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia `fish-audio-research-license`: es una licencia de investigacion, no una licencia de uso comercial general. Antes de cualquier despliegue en produccion con fines comerciales hay que revisar los terminos del archivo `LICENSE.md`.
- No se han publicado resultados de calidad (WER, similitud de hablante, MOS) en la informacion disponible, por lo que no es posible evaluar la fidelidad de la clonacion ni la naturalidad frente a alternativas.
- No se documentan los sesgos del modelo ni el tratamiento de voces de referencia; la clonacion de voz plantea riesgos de suplantacion y requiere consentimiento explicito de la persona cuya voz se clona.
- Riesgo de alucinacion acustica o de pronunciacion incorrecta en idiomas con pocos datos, dado el amplio listado de 83 idiomas sin cifras de cobertura por idioma.
- No se especifica la longitud maxima de contexto del backbone de texto, lo que limita planificar el tamano de las escenas largas sin troceado.
- El limite de 16 hablantes por texto es una restriccion de diseno explicita; escenas con mas personajes requieren partir la generacion en varias peticiones.
- No se confirma soporte fuera de SGLang-Omni, lo que ata el despliegue a ese framework (aunque este integrado en el ecosistema SGLang).
- El numero de descargas del repositorio es bajo (23 descargas, 16 likes en el momento de la consulta), lo que sugiere una adopcion todavia temprana y menos validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/fishaudio/drama-3
- SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Drama 3 Cookbook (SGLang-Omni): https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio SGLang-Omni en GitHub: https://github.com/sgl-project/sglang-omni
- Sitio de Fish Audio: https://fish.audio/
- Documentacion de Fish Audio Speech: https://speech.fish.audio/
- Clip de referencia del ejemplo (en0.wav): https://github.com/user-attachments/files/33393249/en0.wav
- Muestra de etiquetas en linea (A1_point_tags.wav): https://github.com/user-attachments/files/33393205/A1_point_tags.wav
- Muestra de edicion (K1_edit_word_with_context.wav): https://github.com/user-attachments/files/33393156/K1_edit_word_with_context.wav
- Muestra de segunda edicion encadenada (K5_second_edit_chained.wav): https://github.com/user-attachments/files/33393164/K5_second_edit_chained.wav
- Dataset de evaluacion Seed-TTS mini: https://huggingface.co/datasets/zhaochenyang20/seed-tts-eval-mini
