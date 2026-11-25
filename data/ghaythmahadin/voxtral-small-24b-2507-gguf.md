# GhaythMahadin/Voxtral-Small-24B-2507-gguf

## Resumen

Voxtral-Small-24B-2507 es un modelo de reconocimiento automatico del habla (ASR) y comprension de audio desarrollado por Mistral AI. Combina un codificador de audio bidireccional basado en Whisper-large-v3 con un decodificador de lenguaje causal Mistral-Small-24B, unidos mediante un proyector que inyecta tokens de audio en el flujo de texto. El resultado es un modelo audio-LLM de 24.261.827.088 parametros que transcribe, traduce y razona sobre audio de forma nativa y multilingue.

La ficha que nos ocupa documenta la conversion a formato GGUF realizada por GhaythMahadin para su uso con transcribe.cpp, una implementacion en C++ orientada a inferencia offline. Esta variante cuantizada permite ejecutar el modelo fuera de ecosistemas Python, con tamanos que van desde 14,30 GB (Q4_K_M) hasta 48,54 GB (BF16), manteniendo una tasa de error de palabra (WER) de entre el 1,56 % y el 2,11 % en LibriSpeech test-clean.

Su relevancia actual radica en que ofrece una ventana de contexto de 32k tokens que permite transcribir audio de hasta 30 minutos (40 minutos en tareas de comprension), deteccion automatica de idioma, traduccion de voz y function calling a partir de intenciones habladas, todo bajo licencia Apache-2.0. Es el hermano mayor de Voxtral Mini 3B, con el mismo codificador y proyector pero un decodificador escalado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador de audio Whisper-large-v3 + proyector de 4 grupos de frames + decodificador causal Mistral-Small-24B (40 capas, GQA 32/8, NEOX RoPE, SwiGLU) con inyeccion de tokens de audio |
| Parametros totales | 24.261.827.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32k tokens (hasta 30 min de audio para transcripcion, 40 min para comprension) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | en, fr, de, es, it, pt, nl, hi |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de audio-LLM con tres componentes: un codificador de audio bidireccional derivado de Whisper-large-v3, un proyector que agrupa frames en grupos de cuatro y produce 375 tokens de audio por cada fragmento de 30 segundos, y un decodificador causal Mistral-Small-24B de 40 capas con Grouped Query Attention (32 cabezas de consulta y 8 de clave/valor), RoPE en variante NEOX y activacion SwiGLU. La inyeccion de tokens de audio en el flujo de texto permite que el decodificador razone sobre el contenido acustico como si fuera texto.

El modelo base es una mejora de Mistral Small 3 con capacidades de audio, y conserva las capacidades de comprension de texto de su backbone linguistico (Mistral Small 3.1). La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, ni si se empleo RLHF o DPO; esa informacion no esta disponible en la documentacion proporcionada. La decodificacion es greedy en los benchmarks reportados. El modelo no soporta streaming y no genera timestamps.

## Capacidades

- Transcripcion de voz a texto multilingue con deteccion automatica del idioma de origen.
- Modo de transcripcion dedicado que maximiza la precision del reconocimiento.
- Traduccion de voz (speech translation) a texto.
- Comprension de audio: preguntas y respuestas directamente sobre el audio.
- Generacion de resumenes estructurados de audio sin necesidad de un ASR y un LLM separados.
- Function calling a partir de intenciones habladas: activacion de funciones de backend, flujos de trabajo o llamadas a API.
- Capacidades de comprension de texto heredadas de Mistral Small 3.1.
- Soporte multilingue nativo en ingles, frances, aleman, espanol, italiano, portugues, neerlandes e hindi.
- Manejo de audio de larga duracion gracias a la ventana de 32k tokens.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo procesa audios de hasta 30 minutos en una sola pasada y genera la transcripcion completa con deteccion automatica de idioma, lo que elimina la necesidad de segmentar manualmente las grabaciones.
- Subtitulado y traduccion de contenido audiovisual: dado que soporta traduccion de voz, puede transcribir un audio en un idioma y emitir el texto en otro, util para localizacion de videos y podcasts en los ocho idiomas soportados.
- Asistentes de voz con function calling: a partir de una intencion hablada, el modelo puede generar la llamada a una API o flujo de trabajo de backend, lo que permite construir interfaces de voz que ejecutan acciones sin un pipeline separado de ASR mas NLU.
- Analisis y resumen de llamadas de atencion al cliente: el modelo puede transcribir y resumir conversaciones largas, extrayendo puntos clave y acciones, gracias a su capacidad de comprension de audio de hasta 40 minutos.
- Archivado y busqueda de audio corporativo: transcripcion offline de grandes volumenes de grabaciones usando la version cuantizada Q4_K_M (14,30 GB), que cabe en GPUs de consumo y mantiene un WER del 2,11 %.
- Investigacion en ASR multilingue: el modelo sirve como referencia para experimentos de reconocimiento en hindi, neerlandes o portugues, idiomas menos cubiertos por otros sistemas, con una licencia Apache-2.0 que facilita la reproducibilidad.
- Despliegue en entornos sin Python: la conversion GGUF para transcribe.cpp permite ejecutar el modelo en C++ puro, util en sistemas embebidos o pipelines de produccion donde no se desea una dependencia de PyTorch.

## Benchmarks y rendimiento

Resultados de WER en LibriSpeech test-clean (2620 utterances, normalizador de texto en ingles de Whisper, decodificacion greedy, batch size 8 en NVIDIA A100 80 GB):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 48,54 GB | 1,56 % |
| F16 | 48,55 GB | 1,57 % |
| Q8_0 | 25,81 GB | 1,56 % |
| Q6_K | 19,94 GB | 1,58 % |
| Q5_K_M | 17,14 GB | 1,60 % |
| Q4_K_M | 14,30 GB | 2,11 % |

Referencia con HuggingFace transformers (VoxtralForConditionalGeneration, BF16, greedy) en la misma maquina: 1,57 %. El GGUF BF16 iguala la referencia con 1,56 %. La validacion de esta variante es end-to-end por WER; la paridad numerica a nivel de tensor de la familia se establece con el hermano Voxtral Mini 3B, de arquitectura identica.

Rendimiento en hardware Apple: RTF (real-time factor) de 3,2 en un chip M4 Max con backend Metal.

No se han publicado en la informacion disponible resultados de benchmarks de audio agregados (FLEURS, Common Voice) ni de benchmarks de texto (MMLU, GSM8K) para esta variante GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo GGUF mas overhead. Q4_K_M requiere unos 14,3 GB, Q5_K_M unos 17,1 GB, Q6_K unos 19,9 GB, Q8_0 unos 25,8 GB y BF16/F16 unos 48,5 GB.
- GPU recomendadas: A100 80 GB para BF16/F16 y Q8_0 con margen; RTX 4090 (24 GB) para Q6_K y Q5_K_M; GPUs de 16 GB para Q4_K_M.
- Cabe en GPU de consumo: si, en RTX 4090 con Q6_K o Q5_K_M, y en GPUs de 16 GB con Q4_K_M. Las versiones BF16 y F16 requieren GPUs de datacenter o multiples GPUs.
- Opciones de despliegue: transcribe.cpp (unica libreria indicada en la model card); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: RTF de 3,2 en Apple M4 Max con Metal; no se dispone de cifras de throughput en GPU en la informacion proporcionada. La decodificacion es greedy y no hay soporte de streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| Voxtral-Small-24B-2507 (esta ficha) | 24,26 B | 32k tokens | 8 | Apache-2.0 | GGUF, safetensors |
| Voxtral Mini 3B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Whisper-large-v3 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card identifica a Voxtral Mini 3B como el hermano menor con el mismo codificador, proyector, frontend y tokenizer, pero decodificador de menor tamano. No se dispone de datos de parametros, contexto ni rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo no soporta streaming: la inferencia es offline sobre archivos completos.
- No genera timestamps, lo que limita su uso en subtitulado con sincronizacion temporal.
- La decodificacion es greedy, sin opciones de muestreo documentadas.
- La validacion de esta variante GGUF es end-to-end por WER; la paridad numerica a nivel de tensor se infiere del hermano Voxtral Mini 3B y no se ha verificado directamente para esta conversion.
- Solo se documenta soporte para transcribe.cpp; no hay evidencia de compatibilidad con otros runners como llama.cpp u Ollama.
- El modelo base puede presentar sesgos linguisticos y culturales heredados de sus datos de entrenamiento; la model card no detalla sesgos conocidos.
- Riesgo de alucinacion en la transcripcion y en las respuestas a preguntas sobre audio, especialmente con audio ruidoso o idiomas de bajos recursos.
- La cobertura linguistica se limita a ocho idiomas; el rendimiento en hindi y neerlandes puede ser inferior al de ingles o espanol.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card del modelo base para terminos adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que la conversion es reciente y poco validada por la comunidad.
- El modelo base se encuentra fijado al commit da5b424 (2026-06-05); cambios posteriores en el modelo original no estan reflejados.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/GhaythMahadin/Voxtral-Small-24B-2507-gguf
- Modelo base: https://huggingface.co/mistralai/Voxtral-Small-24B-2507
- Commit del modelo base: https://huggingface.co/mistralai/Voxtral-Small-24B-2507/commit/da5b424
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/dac22fa
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/voxtral-small-24b-2507.md
- Blog de Mistral AI sobre Voxtral: https://mistral.ai/news/voxtral
- Paper de investigacion: https://arxiv.org/abs/2507.13264
