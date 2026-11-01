# nativ-community/LFM3-Omni-2B-mxfp8

## Resumen

LFM3-Omni-2B-mxfp8 es una conversion nativa a MLX del checkpoint LFM3-Omni-2B, un modelo multimodal any-to-any de 2.166 millones de parametros que procesa y genera texto, imagen, video y audio. La conversion la mantiene la organizacion nativ-community y esta pensada para ejecucion en Apple Silicon mediante la libreria MLX, no para CUDA. El checkpoint original procede de lq-preview y se distribuye bajo la licencia LFM 1.0.

El modelo resuelve tareas de reconocimiento automatico de voz (ASR), sintesis de voz (TTS), OCR sobre imagen y video, y conversacion multimodal intercalada, todo dentro de un unico transformer con modulos de audio y vision. Su interes practico esta en que cabe en memoria unificada de equipos Apple de gama alta y permite prototipar pipelines de voz y vision localmente sin GPU dedicada.

Esta variante concreta aplica cuantizacion mxfp8 de 8 bits con grupo de 32 sobre los pesos del transformer, mientras que los modulos de audio y vision permanecen en BF16 y el codec de audio se copia sin tocar. La activacion y las caches KV no estan cuantizadas. El repositorio ocupa 2,8 GB y requiere una version fijada de mlx-vlm para cargarse correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (texto, imagen, video, audio) sobre MLX; detalles internos del checkpoint original no disponibles |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mxfp8 8 bits, group size 32 (pesos del transformer); audio y vision en BF16; activaciones y caches KV sin cuantizar |
| Idiomas soportados | no disponible (los ejemplos de la model card usan ingles) |
| Licencia | LFM 1.0 (lfm1.0, license: other) |
| Formato de pesos | safetensors (MLX), libreria mlx |
| Tamano del repositorio | 2,8 GB |
| Pipeline | any-to-any |
| Modelo base | lq-preview/LFM3-Omni-2B (commit 101fb44635e88fd5ceb09508610bc559149286e8) |

## Arquitectura y entrenamiento

La model card de esta conversion no describe la arquitectura interna del checkpoint original: no se detalla si el transformer usa atencion densa o alguna variante eficiente, ni la composicion del dataset de entrenamiento, el numero de tokens vistos o si hubo fases de RLHF o DPO. Lo que si se documenta es la estructura de la conversion: los pesos del transformer se cuantizan a mxfp8 de 8 bits con grupo de 32, los modulos de audio y vision se mantienen en BF16 y el codec de audio incluido se copia sin modificar. Las activaciones y las caches KV quedan en precision completa.

La innovacion tecnica relevante de esta ficha es la propia conversion a MLX y su integracion con mlx-vlm, que expone funciones de generacion de audio (`generate_audio`) y plantillas de chat con soporte para audios. La conversion registra procedencia y auditoria de tensores en `conversion.json`, hashes en `SHA256SUMS` y resultados de validacion en `validation.json`, lo que permite reproducir la verificacion. El commit de implementacion de la conversion es `15e20a7ef0dfa8447502f0b145192421a8f3cf2e`.

## Capacidades

- Generacion de texto y razonamiento basico: la validacion incluye una prueba aritmetica con resultado exacto (42).
- Reconocimiento automatico de voz (ASR) en ingles, con soporte de prompt de sistema para fijar el idioma.
- Sintesis de voz (TTS), con control de idioma y generacion de waveform a 24 kHz.
- Conversacion de audio en ida y vuelta (ASR seguido de TTS con el mismo modelo).
- Entrada intercalada de audio y texto con generacion de audio.
- Vision: OCR sobre imagen (lectura de texto en carteles).
- Video: OCR sobre fotogramas de video.
- Procesamiento any-to-any: entrada de texto, imagen, video y audio con salida de texto o audio.
- Integracion con mlx-vlm mediante `apply_chat_template` y `generate_audio`.
- No soporta modo thinking (Omni thinking no implementado).

## Casos de uso

- Transcripcion de reuniones en local: el modelo realiza ASR en ingles con WER 0.0 % en la prueba de validacion, por lo que puede transcribir audio grabado en un Mac sin enviar datos a la nube, usando `generation_mode="text"`.
- Lectura de documentos y carteles por OCR: dado que la validacion muestra lectura correcta de un cartel con el texto "CODE 5739", sirve para extraer texto de imagenes en flujos de digitalizacion o accesibilidad.
- Extraccion de texto en video: el OCR sobre video permite indexar subtitulos o rotulos incrustados en grabaciones, util en archivos audiovisuales o vigilancia documental.
- Generacion de voz para prototipos de asistentes: el TTS con control de voz e idioma permite crear respuestas habladas en aplicaciones de accesibilidad o interfaces conversacionales locales.
- Pipeline de voz bidireccional: la capacidad de ASR y TTS con el mismo modelo facilita demos de agentes de voz sin dependencias externas, aunque con limitacion de batch uno.
- Pruebas de concepto multimodales en Apple Silicon: investigadores pueden validar interacciones texto-imagen-audio en un portatil o Mac Studio antes de escalar a infraestructura mayor.
- Evaluacion de cuantizacion mxfp8: el repo sirve para medir el impacto de 8 bits frente al checkpoint BF16 en tareas de voz y vision, ya que la model card advierte que cada formato requiere evaluacion especifica.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Solo incluye comprobaciones de validacion de la conversion en Apple M3 Ultra con MLX 0.32.4:

| Comprobacion | Resultado |
|---|---|
| finite_logits | Todos los logits permitidos finitos; placeholders de voz suprimidos correctamente |
| arithmetic | 42 (coincidencia exacta) |
| asr | "The quick brown fox jumps over the lazy dog." (WER 0.0 %) |
| tts | Waveform finita a 24000 Hz, 3,20 s; finish: stop |
| tts_roundtrip | "The quick brown fox jumps over the lazy dog." (WER 0.0 %) |
| interleaved | Waveform finita a 24000 Hz, 2,24 s; finish: stop |
| image_ocr | Texto "CODE 5739" leido correctamente |
| video_ocr | Codigo 5739 leido correctamente |

El autor advierte explicitamente que estas pruebas no constituyen un benchmark de calidad amplio y que el round-trip ASR no es una evaluacion independiente del habla.

## Requisitos de hardware

- VRAM/memoria unificada: el repositorio pesa 2,8 GB, por lo que la carga en memoria ronda esa cifra mas overhead de activaciones y caches KV en precision completa; no se publica una estimacion oficial.
- Plataforma: exclusivamente Apple Silicon mediante MLX; no es ejecutable en CUDA con esta conversion.
- Hardware validado: Apple M3 Ultra con MLX 0.32.4.
- Cabe en equipos Apple consumer con memoria unificada suficiente (Mac con chip M-series); el requisito exacto de memoria no esta disponible.
- Despliegue: mlx-vlm en la version fijada `3070dcc31948f48f9d8639b606af7bc019494fac`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Limitaciones de ejecucion: generacion de voz con batch uno; sin streaming de waveform ni historial de voz basado en waveform.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparacion rigurosa con alternativas. La unica comparacion documentada es con el checkpoint original:

| Modelo | Parametros | Precision | Plataforma | Licencia |
|---|---|---|---|---|
| nativ-community/LFM3-Omni-2B-mxfp8 | 2.166.928.384 | mxfp8 8 bits (transformer), BF16 (audio/vision) | MLX (Apple Silicon) | LFM 1.0 |
| lq-preview/LFM3-Omni-2B | no disponible | BF16 (checkpoint original) | no disponible | LFM 1.0 |

No se identifican en la informacion proporcionada otros modelos comparables de la misma categoria con datos verificables.

## Limitaciones y advertencias

- La generacion de voz solo admite batch uno; no hay streaming de waveform ni historial de voz basado en waveform.
- La banda sonora de un video debe suministrarse por separado; no se procesa integrada.
- El modo thinking (Omni thinking) no esta soportado.
- Las precisiones mas bajas pueden degradar la calidad; cada formato requiere evaluacion especifica por tarea antes de desplegar.
- La validacion se limita a pruebas cortas en M3 Ultra; no hay benchmark de calidad amplio ni evaluacion independiente del habla.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; los ejemplos de la model card usan ingles, por lo que el rendimiento en castellano no esta verificado.
- Licencia LFM 1.0: es necesario revisar `LICENSE` y `ORIGINAL_MODEL_CARD.md` para conocer las restricciones de uso comercial; la conversion no asigna una licencia nueva de pesos.
- Requiere una version fijada de mlx-vlm; otras versiones pueden no cargar el modelo correctamente.
- Dependencia de Apple Silicon: no es una opcion para infraestructura CUDA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/LFM3-Omni-2B-mxfp8
- Modelo base: https://huggingface.co/lq-preview/LFM3-Omni-2B/tree/101fb44635e88fd5ceb09508610bc559149286e8
- Implementacion de inferencia (mlx-vlm): https://github.com/Blaizzy/mlx-vlm/commit/3070dcc31948f48f9d8639b606af7bc019494fac
- Licencia: LICENSE (en el repositorio de HuggingFace)
- Model card original: ORIGINAL_MODEL_CARD.md (en el repositorio de HuggingFace)
