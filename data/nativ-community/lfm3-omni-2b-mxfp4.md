# nativ-community/LFM3-Omni-2B-mxfp4

## Resumen

LFM3-Omni-2B-mxfp4 es una conversion nativa a MLX del modelo multimodal any-to-any LFM3-Omni-2B, desarrollada por el colectivo nativ-community. El modelo original procede de lq-preview/LFM3-Omni-2B y esta disenado para procesar y generar simultaneamente texto, audio e imagen dentro de una unica arquitectura, lo que lo situa en la categoria de modelos omni. La conversion cuantiza los pesos del transformer a mxfp4 de 4 bits con grupo de 32, manteniendo los modulos de audio y vision en BF16, y conserva el codec de audio original sin modificar.

Con 2.166.928.384 parametros totales y un repositorio de 2,0 GB, el modelo esta pensado para ejecutarse en hardware Apple Silicon mediante la libreria MLX y el stack mlx-vlm. Su relevancia actual radica en que permite desplegar un modelo omni de 2B en un Mac con memoria unificada, algo que las versiones en BF16 o en formatos orientados a CUDA no facilitan. La licencia es lfm1.0, heredada del checkpoint original, y la conversion no asigna una licencia nueva a los pesos.

El modelo cubre tareas de reconocimiento automatico de voz (ASR), sintesis de voz (TTS), OCR sobre imagen y video, razonamiento aritmetico basico y generacion de texto. La validacion publicada por el autor se limita a comprobaciones de humo sobre Apple M3 Ultra con MLX 0.32.4, por lo que no debe interpretarse como un benchmark de calidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (lfm3_omni) con modulos de audio y vision; implementacion MLX |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mxfp4 4-bit, group size 32 (transformer); audio y vision en BF16; codec de audio sin cuantizar; activaciones y caches KV sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (MLX), libreria mlx, requiere custom_code |
| Modelo base | lq-preview/LFM3-Omni-2B (revision 101fb44635e88fd5ceb09508610bc559149286e8) |
| Tamano del repositorio | 2,0 GB |
| Pipeline | any-to-any |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original mas alla de su naturaleza any-to-any y de la presencia de modulos diferenciados de audio y vision junto al transformer principal. La conversion mantiene el transformer cuantizado en mxfp4 de 4 bits con grupo de 32, mientras que los modulos de audio y vision permanecen en BF16 y el codec de audio se copia sin cambios. Las activaciones y las caches KV no se cuantizan, lo que preserva la fidelidad numerica en inferencia a costa de memoria adicional.

No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo original empleo RLHF, DPO u otras tecnicas de alineacion. La model card documenta la implementacion de conversion (commit 15e20a7ef0dfa8447502f0b145192421a8f3cf2e) y el codigo publico de inferencia en Blaizzy/mlx-vlm (commit 3070dcc31948f48f9d8639b606af7bc019494fac), pero no describe innovaciones de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento basico, incluyendo aritmetica simple (la validacion reporta 42 como resultado exacto en una comprobacion aritmetica).
- Reconocimiento automatico de voz (ASR) con entrada de audio, mediante el modo `generation_mode="text"` de mlx-vlm.
- Sintesis de texto a voz (TTS) con salida de waveform a 24000 Hz, incluyendo seleccion de voz e idioma via prompt de sistema.
- Procesamiento intercalado de audio y texto en una misma generacion.
- OCR sobre imagen: la validacion detecta texto en imagenes con formato enriquecido.
- OCR sobre video: la validacion extrae codigos mostrados en fotogramas de video.
- Capacidad any-to-any: combinacion de entradas y salidas de texto, audio e imagen dentro del mismo pipeline.
- No soporta modo thinking (Omni thinking no implementado segun la model card).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- Idiomas soportados no disponibles; los ejemplos de la model card usan ingles (ASR y TTS en ingles americano).

## Casos de uso

- Transcripcion de reuniones en local: el modelo puede ejecutar ASR sobre ficheros WAV en un Mac con Apple Silicon usando mlx-vlm, sin enviar audio a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Lectura en voz alta de documentos: con TTS a 24000 Hz y seleccion de voz mediante prompt de sistema, se puede integrar en herramientas de accesibilidad o en la generacion de audiolibros y resumenes hablados.
- Extraccion de texto en imagenes para digitalizacion: el OCR validado sobre imagenes permite procesar capturas, carteles o documentos escaneados y devolver el contenido en texto enriquecido.
- Analisis de video con texto en pantalla: la capacidad de OCR sobre video facilita la extraccion de codigos, subtitulos o rotulos en grabaciones, util en auditoria de contenido o moderacion.
- Asistentes conversacionales multimodales en escritorio: al aceptar audio y texto en el mismo pipeline, el modelo puede construir interfaces de voz para aplicaciones Mac sin depender de la nube.
- Prototipado de pipelines any-to-any en investigacion: su tamano de 2B y su empaquetado MLX lo hacen util para experimentar con combinaciones de entrada y salida de audio, imagen y texto en un portatil o estacion de trabajo Apple.
- Generacion de respuestas habladas en entornos educativos: la sintesis de voz permite crear ejercicios de pronunciacion o dictado con salida de audio controlada por prompt.

## Benchmarks y rendimiento

La model card no publica benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Solo incluye comprobaciones de humo de validacion sobre Apple M3 Ultra con MLX 0.32.4, que no constituyen un benchmark de calidad general:

| Comprobacion | Resultado |
|---|---|
| finite_logits | Todos los logits permitidos finitos; placeholders de voz suprimidos correctamente |
| arithmetic | 42 (coincidencia exacta: True) |
| asr | "The quick brown fox jumps over the lazy dog." (WER 0,0 %) |
| tts | Waveform finita a 24000 Hz, 3,84 s; finish: stop |
| tts_roundtrip | "The quick brown fox jumps over the lazy dog." (WER 0,0 %) |
| interleaved | Waveform finita a 24000 Hz, 3,84 s; finish: stop |
| image_ocr | Texto "CODE 5739" detectado en negrita sobre fondo gris claro |
| video_ocr | Codigo 5739 detectado en texto negro grande sobre fondo gris claro |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 2,0 GB en pesos mxfp4; con activaciones y caches KV sin cuantizar, se recomienda disponer de al menos 8 GB de memoria unificada para inferencia comoda, aunque no se proporciona una cifra oficial.
- GPU recomendadas: hardware Apple Silicon. La validacion se realizo en un Apple M3 Ultra; no se documenta soporte para GPU NVIDIA, AMD ni ROCm.
- Cabe en GPU consumer: si, en equipos Apple con memoria unificada suficiente (Mac con chip M-series). No se indica compatibilidad con RTX 4090 u otras GPU consumer de NVIDIA.
- Opciones de despliegue: MLX con mlx-vlm en el commit fijado 3070dcc31948f48f9d8639b606af7bc019494fac; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo reporta duraciones de waveform generada (3,84 s) sin tiempos de inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la informacion proporcionada. La comparativa se limita a los datos estructurales disponibles:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-mxfp4 (este) | 2.166.928.384 | no disponible | MLX safetensors mxfp4 | lfm1.0 | Conversion nativa para Apple Silicon |
| lq-preview/LFM3-Omni-2B | no disponible | no disponible | safetensors (original) | lfm1.0 | Checkpoint base sin cuantizar |
| Otros modelos omni de ~2B | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- La generacion de voz solo soporta batch uno; no hay streaming de waveform ni historial de voz basado en waveform.
- La entrada de banda sonora de video debe suministrarse por separado; el modelo no la extrae del propio video.
- El modo thinking (Omni thinking) no esta implementado.
- Las precisiones mas bajas pueden reducir la calidad; cada formato requiere evaluacion especifica por tarea antes de desplegar en produccion.
- La validacion publicada son comprobaciones de humo, no un benchmark de calidad; el round-trip ASR usa el mismo modelo y no constituye una evaluacion independiente del habla.
- Riesgo de alucinacion no cuantificado en la informacion disponible; al ser un modelo de 2B, es esperable una capacidad de razonamiento limitada frente a modelos mayores.
- Sesgos conocidos no documentados.
- Idiomas soportados no disponibles; los ejemplos se limitan al ingles.
- Licencia lfm1.0: se aplican los terminos del checkpoint original; la conversion no asigna una licencia nueva. Es necesario revisar LICENSE y ORIGINAL_MODEL_CARD.md antes de uso comercial.
- Requiere `trust_remote_code=False` y una version fijada de mlx-vlm; no hay soporte documentado para stacks de inferencia alternativos.
- El modelo esta orientado a MLX y Apple Silicon; no se documenta compatibilidad con CUDA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/LFM3-Omni-2B-mxfp4
- Modelo base: https://huggingface.co/lq-preview/LFM3-Omni-2B/tree/101fb44635e88fd5ceb09508610bc559149286e8
- Codigo de inferencia mlx-vlm: https://github.com/Blaizzy/mlx-vlm/commit/3070dcc31948f48f9d8639b606af7bc019494fac
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia: LICENSE (incluida en el repositorio del modelo)
- Model card original: ORIGINAL_MODEL_CARD.md (incluida en el repositorio del modelo)
