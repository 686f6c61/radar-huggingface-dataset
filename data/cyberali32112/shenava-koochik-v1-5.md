# cyberali32112/Shenava-Koochik-v1.5

## Resumen

Shenava-Koochik v1.5 es un modelo de reconocimiento automático del habla (ASR) especializado en persa (farsi, código `fa`), publicado por el usuario cyberali32112 en Hugging Face bajo licencia Apache 2.0. Se trata de un *fine-tuning* de Reza2kn/Shenava-Koochik-v1.0 y se distribuye como checkpoint de NVIDIA NeMo (librería `nemo`, pipeline `automatic-speech-recognition`), con un tamano de repositorio de 0,9 GB.

Técnicamente es un FastConformer híbrido con dos cabezas de decodificación: RNNT (transducer) y CTC, con aproximadamente 114 millones de parámetros. La novedad de la versión 1.5 es la recuperación de la cabeza RNNT, que en v1.0 estaba rota (un desalineamiento entre tokenizador y token *blank* provocaba bucles infinitos en decodificación *greedy* y un WER del 4398 %). La v1.5 reinicializa quirúrgicamente el *prednet* y el *joint* de la RNNT bajo el tokenizador `ve_tok_v4` y la reentrena con un currículo de dos fases, dejando la cabeza CTC intacta.

El resultado es un modelo con dos cabezas funcionales: CTC mantiene su WER del 8,12 % (sin regresión) y RNNT pasa a un 9,50 %. La relevancia es doble: por un lado, ofrece una alternativa abierta y ligera (114 M de parámetros) para ASR en persa, un idioma con pocos recursos; por otro, documenta un caso poco habitual de reparación de una cabeza transducer rota preservando la cabeza desplegada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer hibrida con doble cabeza: RNNT (transducer) + CTC |
| Parametros totales | 114 M aproximadamente |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica en tokens; atención con contexto [70, 13] (frames del encoder). Duración máxima de audio soportada: no disponible |
| Tipos de cuantizacion | no disponible (se distribuye como checkpoint NeMo en la precisión de entrenamiento; no se documentan recetas de cuantización) |
| Idiomas soportados | persa / farsi (`fa`) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint NeMo (`.nemo`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un encoder FastConformer (variante de Conformer con *depthwise separable convolutions* y *subsampling* agresivo, optimizada para audio) sobre el que se montan dos cabezas de decodificación independientes: una CTC y una RNNT. El contexto de atención declarado es `[70, 13]`, lo que permite ventanas de audio largas mediante atención por bloques. El modelo se entrena y ejecuta con la librería `nemo_toolkit`, y la cabeza activa se selecciona en tiempo de inferencia con `change_decoding_strategy(decoder_type="ctc" | "rnnt")`.

En cuanto a los datos, la *model card* indica que el entrenamiento se hizo sobre una mezcla limpiada que combina un corpus pseudo-generado, *hardwords* sintéticas y datos *gold* procedentes de habla humana y de lectura de artículos. Se aplicó deduplicación respecto al conjunto de evaluación y filtrado de calidad de etiquetas, con eliminación de etiquetas sobre-extendidas y de bucles de repetición. No se especifican el número total de horas, la composición porcentual del dataset ni la existencia de fases de RLHF o DPO (no aplicables en un modelo ASR). La innovación técnica destacable es la reparación de la cabeza RNNT: se congeló el encoder durante el *fine-tuning* correctivo y se reinicializaron `prednet` y `joint` bajo el tokenizador `ve_tok_v4`, con un currículo de dos fases.

## Capacidades

- Transcripción de voz a texto en persa (farsi) con dos cabezas de decodificación intercambiables: CTC (recomendada) y RNNT.
- Decodificación transducer (RNNT) funcional, con salida que tiende a un registro más coloquial por haber sido entrenada con etiquetas fieles al audio.
- Decodificación CTC con el mismo rendimiento que v1.0 (sin regresión), adecuada para despliegue en producción.
- Manejo de audio de duración extensa gracias al contexto de atención `[70, 13]` del encoder FastConformer.
- Inferencia por lotes: la API `transcribe()` acepta listas de ficheros de audio.
- Integración nativa con el ecosistema NVIDIA NeMo (Riva, Triton, exportación ONNX).
- No se documentan capacidades de puntuación, marcas de tiempo, diarización de hablantes, detección de idioma, traducción, *code-switching* ni voz a voz.

## Casos de uso

- Transcripción de audio para servicios de subtitulado en persa: el modelo procesa ficheros de audio y devuelve texto plano mediante `transcribe()`, con una tasa de error de caracteres del 2,6 % que resulta adecuada para subtítulos revisables.
- Indexación y búsqueda de archivos sonoros en persa: transcripción por lotes de un repositorio de audio para generar un índice de texto que permita búsqueda por palabras clave.
- Asistentes de voz y dictado en persa: con 114 M de parámetros cabe en el *edge* o en servidores modestos, lo que permite dictado en tiempo casi real con latencia baja.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones grabadas para alimentar analítica de calidad, siempre que se asuma la ausencia de diarización y de puntuación documentadas.
- Investigación en ASR de bajos recursos: la doble cabeza CTC/RNNT permite comparar estrategias de decodificación sobre el mismo encoder congelado, útil como *baseline* académico.
- Pipelines de *data labeling*: generación automática de transcripciones preliminares sobre grandes volúmenes de audio que después se corrigen manualmente, reduciendo el coste de anotación.
- Evaluación comparativa de decodificadores: la cabeza RNNT produce un registro más coloquial y la CTC uno más literal, lo que permite elegir la salida más adecuada según el dominio (noticias frente a conversación espontánea).

## Benchmarks y rendimiento

Conjunto de evaluación `golden-6669`, normalizador estricto `fair_text`, contexto de atención `[70, 13]`:

| Cabeza | WER v1.0 | WER v1.5 |
|---|---|---|
| CTC | 8,12 % | 8,12 % (idéntico) |
| RNNT | 4398 % (rota) | 9,50 % |

Tasa de error de caracteres (CER) reportada: aproximadamente 2,6 %. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros conjuntos distintos de `golden-6669` (no aplicables a un modelo ASR).

## Requisitos de hardware

- VRAM estimada: unos 0,45 GB en fp32 y 0,23 GB en fp16/bf16 solo para los pesos; sumando activaciones del encoder y los *buffers* de búsqueda por haces de RNNT/CTC, el consumo total se mantiene por debajo de 1 GB en fp16.
- GPU recomendadas: NVIDIA T4, L4, A10G o RTX 4090 para despliegues de alto *throughput*; A100 y H100 son válidas pero sobredimensionadas para 114 M de parámetros.
- Cabe en cualquier GPU de consumo: desde una GTX 1050 Ti o RTX 3060 (6-12 GB) en adelante, con margen amplio. También es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: `nemo_toolkit` (API `ASRModel.from_pretrained`), NVIDIA Riva, Triton Inference Server con *backend* de NeMo y exportación a ONNX. No aplican vLLM, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje.
- Latencia y *throughput* estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER persa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shenava-Koochik v1.5 | 114 M | Atención `[70, 13]` (frames) | CTC 8,12 % / RNNT 9,50 % (`golden-6669`) | Apache 2.0 | Pesos abiertos en Hugging Face (.nemo) |
| Shenava-Koochik v1.0 | 114 M | Atención `[70, 13]` (frames) | CTC 8,12 % / RNNT 4398 % (`golden-6669`) | no disponible | Pesos abiertos en Hugging Face |
| Whisper large-v3 (OpenAI) | 1550 M aprox. | 30 s de audio | no disponible en la información proporcionada | MIT | Pesos abiertos, ecosistema amplio (transformers, faster-whisper, whisper.cpp) |

No se dispone de cifras de WER en persa para las alternativas dentro de la información proporcionada, por lo que la comparación de rendimiento entre familias no puede establecerse con rigor. Para un modelo comparable de la misma categoría (ASR persa ligero), no disponible.

## Limitaciones y advertencias

- Cobertura monolingüe: solo persa (farsi). No gestiona otros idiomas ni *code-switching*.
- La cabeza RNNT tiende a un registro coloquial, lo que puede ser inadecuado para dominios formales o transcripción literal; la *model card* recomienda CTC como cabeza desplegada.
- La v1.0 tenía la cabeza RNNT completamente rota (WER del 4398 % por bucles de decodificación). Aunque v1.5 la repara, conviene verificar la versión cargada antes de desplegar.
- Riesgo de alucinación típico de ASR: repeticiones y sobre-extensión de etiquetas. El autor indica que se aplicó filtrado de calidad para mitigarlo, pero persiste el riesgo en audio ruidoso o con solapamiento de hablantes.
- No se documentan métricas de robustez frente a ruido, acentos regionales, audio telefónico (8 kHz) ni habla espontánea fuera del conjunto de evaluación.
- No se especifican el volumen ni la composición exacta del corpus de entrenamiento, lo que dificulta auditar sesgos de dominio o de hablantes.
- Ausencia de validación independiente: el repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, y los *benchmarks* proceden únicamente del autor.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base Reza2kn/Shenava-Koochik-v1.0, cuya licencia no está disponible en la información proporcionada.
- Inconsistencia de identificadores: el *snippet* de uso de la *model card* hace referencia a `Reza2kn/Shenava-Koochik-v1.5`, mientras que el identificador real del repositorio es `cyberali32112/Shenava-Koochik-v1.5`. Hay que ajustar la llamada a `from_pretrained` en consecuencia.
- No hay soporte documentado de puntuación, mayúsculas, marcas de tiempo ni diarización, funcionalidades que en producción suelen requerirse y habría que añadir con posprocesado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyberali32112/Shenava-Koochik-v1.5
- Modelo base: https://huggingface.co/Reza2kn/Shenava-Koochik-v1.0
- Documentación de NVIDIA NeMo para modelos ASR: https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/models.html
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las URLs devueltas por la búsqueda (foros y repositorios sobre ChatGPT) no guardan relación con este modelo.
