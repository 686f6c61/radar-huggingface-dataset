# cdli/whisper-large-v3_finetuned_ghanian_ga_standard_speech_v1.0

## Resumen

El modelo `cdli/whisper-large-v3_finetuned_ghanian_ga_standard_speech_v1.0` es un ajuste fino de `openai/whisper-large-v3` para reconocimiento automatico del habla (ASR) en ga estandar, una lengua kwa hablada en Ghana. Lo desarrolla CDLI, una iniciativa que trabaja para que la tecnologia del habla cubra lenguas y variedades infrarepresentadas por los sistemas ASR convencionales. El modelo se publica como parte de un ecosistema mas amplio de modelos y datasets del autor.

Tecnicamente es un transformer encoder-decoder de tipo Whisper con 1.543.490.560 parametros (aproximadamente 1,54 mil millones), derivado de Whisper large-v3. La innovacion practica no esta en la arquitectura, sino en el proceso de adaptacion: se ajustaron todos los parametros (encoder, decoder y proyeccion de salida) con SpecAugment activado, y se decodifica forzando el idioma yoruba (`yo`) como aproximacion al ga, al ser la lengua soportada nativamente por Whisper mas cercana. El modelo reporta un WER estandar de 0,16 sobre el split de test del dataset de referencia.

Su relevancia actual radica en que cubre una lengua con muy pocos recursos ASR, con una evaluacion desglosada por hablante (22 hablantes, 2025 ejemplos) que permite ver la variabilidad real del rendimiento. El repositorio es pequeno (7 descargas, 0 likes) y la licencia no esta declarada, lo que limita su adopcion en produccion sin aclaraciones previas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por segmento (limite de Whisper); utterances > 30 s excluidas en evaluacion |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | ga (ga de Ghana); decodificacion forzada con `language=yo` |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3: un transformer encoder-decoder con atencion completa, entrenado originalmente por OpenAI sobre audio y texto multilingue. En este ajuste fino se actualizaron todos los parametros (encoder, decoder y proyeccion de salida), no solo capas superiores, y se activo SpecAugment durante el entrenamiento como regularizacion sobre el espectrograma de entrada.

El entrenamiento uso el split *train* del dataset `cdli/ghanian_ga_standard_speech_v1.0` y el split *dev* para seleccionar el mejor checkpoint. No se especifica en la informacion disponible el numero de tokens, horas de audio ni la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en ASR). La decision tecnica destacable es el uso del token de idioma yoruba (`yo`) en lugar de un token especifico para ga: Whisper no soporta ga de forma nativa, y el autor selecciono el yoruba por ser la lengua soportada mas proxima. Esto implica que el modelo no dispone de un identificador de idioma propio y que la decodificacion debe configurarse explicitamente con `language=yo`.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) de ga estandar de Ghana.
- Transcripcion de utterances de hasta 30 segundos por segmento (limite nativo de Whisper).
- Manejo de habla considerada "non-standard" segun los tags del modelo, orientado a hablantes desatendidos por ASR convencional.
- Decodificacion con `task=transcribe` y busqueda greedy (`num_beams=1`, `do_sample=False`) documentada por el autor.
- Integracion con la libreria `transformers` y compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de traduccion, diarizacion, tool calling, agentes ni multimodalidad mas alla del audio de entrada.

## Casos de uso

- Transcripcion de entrevistas y corpus orales en ga: el modelo permite convertir grabaciones de campo en texto para investigacion linguistica, con la salvedad de segmentar el audio en tramos de 30 s o menos.
- Subtitulado y documentacion de contenido audiovisual en ga: util para radios comunitarias, television regional o archivos sonoros que necesitan transcripcion indexable.
- Accesibilidad para hablantes de ga: generacion de transcripciones para personas con dificultades auditivas en entornos donde el ga es lengua vehicular.
- Preservacion linguistica: digitalizacion de material oral en ga para corpus, diccionarios y estudios de variacion, apoyandose en el WER reportado (0,16) como referencia de calidad esperada.
- Prototipos de asistentes de voz en ga: punto de partida para pipelines de voz a texto en aplicaciones locales, siempre que se valide el rendimiento con los hablantes objetivo.
- Investigacion en ASR de bajos recursos: el modelo y su dataset asociado sirven como baseline para experimentos de adaptacion de Whisper a lenguas sin soporte nativo, incluyendo la estrategia de forzar `language=yo`.
- Evaluacion comparativa de tecnicas de ajuste fino: el desglose por hablante permite estudiar la variabilidad inter-hablante y detectar casos donde el WER se degrada (hasta 0,24 en algunos hablantes).

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split *test* del dataset `cdli/ghanian_ga_standard_speech_v1.0` (2025 ejemplos, 22 hablantes, utterances de hasta 30 s, decodificacion con `language=yo`, `task=transcribe`, greedy, texto normalizado con `BasicTextNormalizer`):

| Modelo | WER estandar (corpus) | WER medio por utterance |
|---|---|---|
| Este modelo | 0,16 | 0,16 |

Desglose por hablante (WER medio por utterance):

| Speaker ID | N.º utterances | WER medio |
|---|---|---|
| 496 | 107 | 0,12 |
| 520 | 82 | 0,20 |
| 531 | 95 | 0,14 |
| 533 | 115 | 0,16 |
| 538 | 66 | 0,12 |
| 541 | 133 | 0,21 |
| 545 | 47 | 0,15 |
| 546 | 93 | 0,17 |
| 562 | 107 | 0,14 |
| 579 | 114 | 0,24 |
| 587 | 86 | 0,13 |
| 602 | 115 | 0,12 |
| 622 | 40 | 0,11 |
| 625 | 63 | 0,11 |
| 644 | 133 | 0,16 |
| 651 | 64 | 0,11 |
| 666 | 73 | 0,19 |
| 675 | 105 | 0,20 |
| 693 | 106 | 0,24 |
| 707 | 124 | 0,07 |
| 736 | 111 | 0,15 |
| 780 | 46 | 0,20 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (por ejemplo, Whisper large-v3 sin ajustar u otros ASR para lenguas ghanesas), ni metricas adicionales como WER por grupo de severidad (el autor menciona que se desglosaria "where speaker severity is available", pero no se incluye la tabla en la informacion proporcionada).

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,54 mil millones de parametros y pesos en fp16, el modelo ocupa aproximadamente 3 GB; en fp32, unos 6,2 GB (coincide con el tamano del repo). La VRAM efectiva depende del batch y de la longitud de audio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 en batches pequenos; A100, H100 o L40S para procesamiento por lotes de corpus grandes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4090). En GPUs de 6 GB puede requerir cuantizacion o batches de tamano 1.
- Opciones de despliegue: `transformers` (libreria nativa del modelo), `openai-whisper` si se exportan los pesos, y servidores compatibles con endpoints de Hugging Face. Para vLLM, llama.cpp u Ollama no se documenta soporte en la informacion disponible; la conversion a GGUF requeriria herramientas externas no indicadas por el autor.
- Latencia y throughput: no disponibles. Como referencia cualitativa, Whisper large-v3 es un modelo de ~1,5 B de parametros con atencion completa, por lo que el coste crece con la duracion del audio; la decodificacion greedy documentada es la opcion mas rapida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Whisper large-v3 ajustado a ga) | 1,54 B | 30 s por segmento | 0,16 (test del dataset de referencia) | no disponible | Hugging Face (`cdli/...`) |
| `openai/whisper-large-v3` | 1,55 B | 30 s por segmento | no evaluado en ga en la informacion disponible | MIT (según el modelo original de OpenAI; no verificado en esta ficha) | Hugging Face, ampliamente disponible |
| `openai/whisper-large-v3-turbo` | ~0,81 B | 30 s por segmento | no disponible para ga | MIT (según el modelo original; no verificado) | Hugging Face |
| Otros ASR para lenguas ghanesas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados que permitan una comparacion cuantitativa con alternativas especificas para ga o lenguas ghanesas. La comparacion con Whisper large-v3 base es la mas directa por derivacion, pero no se reporta su WER en este dataset.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor; el modelo no incluye terminos de licencia en la informacion disponible.
- Dependencia del token de idioma yoruba: la decodificacion debe forzarse con `language=yo`; usar el identificador automatico o el token de otro idioma puede degradar gravemente la transcripcion.
- Limite de 30 segundos por segmento: utterances mas largas deben segmentarse; el autor excluyo las de mas de 30 s de la evaluacion, por lo que el rendimiento en audio largo no esta medido.
- Variabilidad inter-hablante notable: el WER medio por utterance va de 0,07 a 0,24 segun el hablante, lo que indica que el rendimiento depende fuertemente de la persona y posiblemente de su variedad o severidad.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en silencios, ruido o audio fuera de dominio; se recomienda validacion y, si es posible, deteccion de no-habla.
- Cobertura limitada a ga estandar: el modelo se entrena y evalua sobre una unica variedad; otras variedades dialectales o habla no estandar pueden tener un rendimiento inferior al reportado.
- Sesgos de dataset: 2025 ejemplos y 22 hablantes en test; el conjunto puede no representar la diversidad real de hablantes de ga (genero, edad, region, condiciones de grabacion).
- Ecosistema muy pequeno: 7 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion independiente ni de uso en produccion.
- Sin datos de cuantizacion ni formatos alternativos: la ausencia de pesos GGUF o de instrucciones de conversion limita el despliegue en entornos sin `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cdli/whisper-large-v3_finetuned_ghanian_ga_standard_speech_v1.0
- Dataset de ajuste fino: https://huggingface.co/datasets/cdli/ghanian_ga_standard_speech_v1.0
- Pagina del autor en Hugging Face: https://huggingface.co/cdli
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Paper de Whisper (referencia del modelo base): https://arxiv.org/abs/2212.04356
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
