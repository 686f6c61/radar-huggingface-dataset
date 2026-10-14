# sekkit/drama-3

## Resumen

Fish Audio Drama 3 es un modelo generativo de texto a voz (text-to-speech) desarrollado por Fish Audio y distribuido en HuggingFace bajo el identificador sekkit/drama-3. Está diseñado especificamente para escenas con multiples personajes y contenido de formato largo: admite generacion multi-hablante, clonacion de voz a partir de una referencia y control en lenguaje natural, ademas de edicion de audio por continuacion sobre tomas anteriores. Su publicacion es relevante porque traslada a TTS un esquema de mezcla de expertos (MoE) con decodificacion causal de tokens acusticos, algo poco habitual en modelos de voz abiertos.

Tecnicamente es un modelo de 35.899.643.008 parametros totales (unos 35,9 mil millones) con aproximadamente 3 mil millones de parametros activos por token, lo que lo situa en la categoria de MoE disperso. El backbone de texto combina atencion completa y atencion lineal (hibrida), y el decodificador de audio es un Codebook-MTP que genera de forma causal 10 codebooks a lo largo de toda la secuencia. Los expertos MoE se almacenan en FP8 y el resto de pesos en bf16, con un repositorio de 41,5 GB.

La ventana de contexto no se especifica en la informacion disponible, pero el modelo trocea automaticamente el texto largo y permite streaming por fragmentos. Soporta etiquetas de hablante `<|speaker:0|>` a `<|speaker:15|>`, es decir, hasta 16 personajes en un mismo texto. Se distribuye con licencia fish-audio-research-license y esta pensado para desplegarse con SGLang-Omni, con soporte declarado desde el dia de lanzamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (backbone de texto) con atencion hibrida (completa + lineal) y decodificador de audio Codebook-MTP de 10 codebooks |
| Parametros totales | 35.899.643.008 (aproximadamente 35,9 mil millones) |
| Parametros activos | Aproximadamente 3 mil millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos MoE en FP8; resto de pesos en bf16. No se documentan otras cuantizaciones (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Aproximadamente 80 idiomas, entre ellos zh, en, ja, ko, es, pt, ar, ru, fr, de, it, nl, pl, tr, hi, th, vi, uk, id, he, fa, sv, no, da, fi, cs, el, ro, hu y otros |
| Licencia | fish-audio-research-license (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se compone de dos bloques diferenciados. El primero es un backbone de texto con arquitectura de mezcla de expertos (MoE) y atencion hibrida, que combina capas de atencion completa con capas de atencion lineal. Esta combinacion busca reducir el coste computacional en secuencias largas sin renunciar por completo al modelado global de dependencias, algo critico cuando el texto de entrada corresponde a dialogos extensos o a multiples tomas encadenadas. De los 35,9 mil millones de parametros totales solo se activan aproximadamente 3 mil millones por token, de modo que el coste de inferencia por paso es mucho menor que el de un modelo denso del mismo tamano.

El segundo bloque es un decodificador de audio basado en Codebook-MTP (multi-token prediction por codebook) que genera 10 codebooks de forma causal sobre la secuencia completa. Los expertos MoE se almacenan en FP8 y el resto de pesos en bf16, una mezcla que reduce el espacio en disco y memoria respecto a un modelo integramente en bf16. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO, por lo que esos datos se consideran no disponibles. Entre las capacidades tecnicas destacables estan el troceado automatico de texto largo, el streaming por fragmentos, la clonacion a partir de una referencia pre-codificada (`vq_codes` junto con su transcripcion) y la edicion entendida como continuacion: el modelo recibe las tomas previas (`previous_takes`) y genera la nueva version con ese contexto.

## Capacidades

- Generacion de voz a partir de texto con calidad orientada a produccion, con salida en streaming por fragmentos.
- Generacion multi-hablante: hasta 16 personajes en un mismo texto mediante las etiquetas `<|speaker:0|>` a `<|speaker:15|>`.
- Clonacion de voz zero-shot a partir de un clip de referencia y su transcripcion (el ejemplo de la model card usa un clip de 3,9 segundos).
- Generacion de habla emocional y control en lenguaje natural, con etiquetas puntuales insertadas en el texto alli donde debe ocurrir el evento, por ejemplo `[sighs]` o `[laughs]`.
- Edicion de audio por continuacion: se envian las tomas anteriores como contexto y el modelo regenera la locucion con el cambio solicitado, incluyendo ediciones encadenadas.
- Soporte de texto largo con troceado automatico y streaming por fragmentos.
- Cobertura multilingue de aproximadamente 80 idiomas, incluyendo castellano, catalan, euskera y gallego.
- Integracion con SGLang-Omni para servir el modelo con API compatible, incluyendo el endpoint `/v1/tts`.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico en la informacion disponible.

## Casos de uso

- Audiolibros y ficcion sonora con reparto coral: gracias a las 16 etiquetas de hablante, un unico texto puede alternar narrador y personajes sin necesidad de orquestar varios modelos ni concatenar pistas.
- Doblaje y localizacion de video: la clonacion de voz a partir de una referencia permite mantener la identidad vocal de un actor original, y la cobertura de unos 80 idiomas facilita generar versiones en castellano, catalan, gallego o euskera desde el mismo material.
- Correccion de locuciones sin regrabar: el modo de edicion por continuacion (`previous_takes`) permite cambiar una palabra o una hora concreta de una toma ya generada conservando la prosodia del resto de la frase.
- Produccion de podcast y contenido informativo largo: el troceado automatico del texto y el streaming por fragmentos permiten convertir guiones extensos en audio de forma continua y con baja latencia de primer token.
- Asistentes de voz y atencion al cliente: con una latencia de primer audio por debajo de 100 ms en un solo flujo, el modelo es apto para respuestas habladas en tiempo real siempre que se despliegue con la infraestructura adecuada.
- Accesibilidad y lectura asistida: conversion de articulos, documentacion tecnica o material educativo a audio, con control de emocion para hacer la locucion menos monótona.
- Videojuegos y experiencias interactivas: asignacion de hasta 16 voces diferenciadas por escena o capitulo usando un unico modelo, lo que simplifica el pipeline de assets de audio.
- Marcado de eventos no verbales en doblaje y publicidad: las etiquetas puntuales como `[sighs]` o `[laughs]` permiten dirigir suspiros, risas u otros eventos en la posicion exacta del texto.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (WER, similitud de hablante, MOS) en la informacion disponible. Si incluye una tabla de rendimiento en produccion medida sobre GPUs NVIDIA H200 con peticiones en streaming y prompts en ingles de Seed-TTS, con las siguientes condiciones: cada peticion clona una voz a partir de una referencia pre-codificada, `temperature` 1.0, `top_p` 0.9, `top_k` 30 y `max_new_tokens` 500. El throughput se mide en frames acusticos generados por segundo, TTFA es el tiempo hasta el primer audio y RTF es el tiempo desde el envio de la peticion hasta el ultimo fragmento dividido por la duracion del audio devuelto.

| Concurrencia | Throughput (frames/s) | TTFA p50 | TTFA p95 | RTF (media) |
|---:|---:|---:|---:|---:|
| 1 | 166,7 | 88,9 ms | 90,8 ms | 0,131 |
| 2 | 287,0 | 96,2 ms | 130,1 ms | 0,152 |
| 4 | 467,6 | 108,2 ms | 156,4 ms | 0,186 |
| 8 | 678,1 | 153,2 ms | 210,9 ms | 0,256 |
| 16 | 927,6 | 210,1 ms | 287,2 ms | 0,373 |
| 32 | 1.244,7 | 304,6 ms | 396,1 ms | 0,551 |
| 64 | 1.687,3 | 450,9 ms | 1.020,1 ms | 0,801 |

Segun la model card, cada celda es la media de cuatro ejecuciones. Un unico flujo obtiene su primer audio en menos de 100 ms; con concurrencia 16 el audio se genera aproximadamente 2,7 veces mas rapido de lo que se reproduce; y con concurrencia 64 el RTF medio se mantiene en 0,80. La model card menciona ademas una segunda tabla que compara dos ubicaciones del vocoder a concurrencia alta, con 1.088 peticiones por nivel y media de seis ejecuciones, pero los valores no estan incluidos en la informacion proporcionada.

## Requisitos de hardware

- Espacio en disco: 41,5 GB para el repositorio completo de pesos en safetensors.
- VRAM estimada: los pesos ocupan 41,5 GB tal como se distribuyen (expertos en FP8). Con cache KV y activaciones, la reserva practica de VRAM se situa por encima de esos 41,5 GB; se trata de una estimacion, no de un dato publicado. Un equivalente denso en bf16 ocuparia aproximadamente 71,8 GB, cifra que no aplica aqui por el uso de FP8 en los expertos.
- GPU recomendadas: las mediciones de la model card se realizaron sobre NVIDIA H200. Por tamano de memoria, son tambien candidatas H100 de 80 GB y A100 de 80 GB. No se documentan mediciones sobre GPUs de 48 GB o menos.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB (RTX 4090, RTX 3090) con los pesos distribuidos. No se documentan cuantizaciones GGUF ni versiones reducidas.
- Opciones de despliegue: SGLang-Omni, con el comando `sgl-omni serve --model-path fishaudio/drama-3 --port 8000` y API compatible con `/v1/tts`. La instalacion se realiza con `git clone https://github.com/sgl-project/sglang-omni.git && cd sglang-omni` y `uv pip install --prerelease=allow -v -e ".[fishaudio]"`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: en una H200, TTFA p50 de 88,9 ms a concurrencia 1, y 1.687,3 frames/s de throughput a concurrencia 64 con RTF medio de 0,801.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos, por lo que no es posible construir una comparativa con cifras verificables.

| Modelo | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|
| sekkit/drama-3 (Fish Audio Drama 3) | 35,9 mil millones totales, ~3 mil millones activos | no disponible | fish-audio-research-license | tabla de rendimiento en H200 disponible |
| Alternativas de TTS abierto de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia es fish-audio-research-license, una licencia de investigacion y no una licencia permisiva estandar. Es imprescindible revisar el archivo LICENSE.md antes de cualquier uso comercial; no se detallan en la informacion disponible las condiciones concretas de explotacion comercial.
- Los pesos distribuidos ocupan 41,5 GB, lo que excluye el despliegue en GPUs de consumo sin cuantizaciones adicionales que no estan documentadas.
- No se publican datos de sesgos, de sesgo de hablante ni de comportamiento diferencial entre idiomas. Con unos 80 idiomas declarados, es razonable esperar una calidad desigual entre lenguas con muchos recursos y lenguas de bajos recursos, pero no hay mediciones que lo cuantifiquen.
- No hay resultados publicados de WER, similitud de hablante, MOS ni tasas de alucinacion acustica, por lo que el riesgo de artefactos o de pronunciacion incorrecta no puede acotarse con datos.
- La clonacion de voz plantea riesgos claros de suplantacion y de uso no consentido de la identidad vocal de terceros; la licencia de investigacion es la principal salvaguarda declarada.
- La longitud de contexto no esta especificada, de modo que no puede determinarse a priori cuantas tomas previas caben en el contexto durante las ediciones encadenadas.
- El soporte de despliegue documentado se limita a SGLang-Omni; no se confirma compatibilidad con otros servidores de inferencia habituales.
- No se documenta soporte de tool calling ni de flujos agenticos, por lo que no debe asumirse en integraciones que dependan de ello.
- La fecha de creacion y actualizacion del repositorio figura como 2026-10-14, posterior a la fecha habitual de publicacion; conviene verificar el estado real del repositorio antes de planificar su adopcion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sekkit/drama-3
- Modelo de referencia de Fish Audio: https://huggingface.co/fishaudio/drama-3
- Documentacion de SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Cookbook de Drama 3 en SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio SGLang-Omni en GitHub: https://github.com/sgl-project/sglang-omni
- arXiv indicado en las etiquetas del modelo: arxiv:2610.18010
