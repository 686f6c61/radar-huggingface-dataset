# GetmanY1/wav2vec2-xlarge-ebranch-48l-fi-471k

## Resumen

El modelo `GetmanY1/wav2vec2-xlarge-ebranch-48l-fi-471k` es un extractor de características de voz (feature extraction) preentrenado de forma autosupervisada sobre 471.000 horas de audio en finés. Lo desarrolla Yaroslav Getman y colaboradores del grupo de investigación en habla de la Universidad Aalto (equipo formado por Getman, Lehtonen, Grósz y Kurimo), y se publica junto al artículo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL". El modelo aplica la metodología wav2vec 2.0 pero sustituye el encoder Transformer original por un E-Branchformer de 48 capas, con dimensión de modelo 1024 y dimensión feed-forward 2048, sumando 966 millones de parámetros.

El problema que aborda es la falta de modelos fundacionales de voz de gran escala para idiomas distintos del inglés: entrena sobre audio broadcast real (archivo de radio y televisión finlandés, VoxPopuli, corpus del Parlamento y Lahjoita puhetta) para producir representaciones acústicas reutilizables en tareas posteriores de reconocimiento automático del habla (ASR) en finés. Es relevante porque demuestra que un E-Branchformer a esta escala iguala o supera ligeramente a un Transformer de idéntico tamaño en WER sobre dominios difíciles (KAVI, FP'16) y porque el pipeline de filtrado por confianza de ASR (τ = −0.10) permite escalar a millones de horas de audio sin transcripciones.

No incluye cabecera CTC ni tokenizador: es un modelo base para fine-tuning, no un sistema ASR listo para producción. La versión afinada para ASR se distribuye por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con encoder E-Branchformer (48 capas) |
| Parametros totales | 964.212.864 (≈966 M según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz; ventana efectiva dependiente de la implementación wav2vec 2.0) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 7,7 GB) y `fairseq/checkpoint.pt` original |
| Dimensión de modelo | 1024 |
| Dimensión feed-forward | 2048 |
| Entrada | audio mono a 16 kHz, `do_normalize=True` |
| Pipeline | feature-extraction |
| Código personalizado | sí, requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo sigue el paradigma wav2vec 2.0 de aprendizaje autosupervisado: enmascaramiento de representaciones latentes y predicción contrastiva sobre el audio, pero reemplaza el bloque Transformer estándar por un E-Branchformer, una arquitectura híbrida que combina atención por ramas (branchformer) con convoluciones locales y atención global en paralelo, con fusión de las dos ramas. El encoder tiene 48 capas, dimensión de modelo 1024 y feed-forward de 2048, resultando en aproximadamente 966 M de parámetros. La implementación reproduce el encoder de fairseq mediante código personalizado, de ahí la necesidad de `trust_remote_code=True` al cargarlo con Transformers.

El preentrenamiento se realizó durante 400.000 actualizaciones con tasa de aprendizaje 1e-4, procesando aproximadamente un minuto de audio por GPU sobre 512 GPUs. Los datos de partida eran 2,1 millones de horas de audio broadcast en bruto, que tras detección de actividad de voz, deduplicación basada en transcripciones y filtrado por confianza de ASR (umbral τ = −0.10) quedaron reducidos a 471.000 horas efectivas. Las fuentes son el archivo de radio y televisión de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta. No se menciona en la información disponible el uso de RLHF ni DPO, algo esperable en un modelo puramente autosupervisado sin etapa de alineamiento.

## Capacidades

- Extracción de representaciones acústicas autosupervisadas a partir de audio mono a 16 kHz, pensadas como base para fine-tuning supervisado.
- Fine-tuning para reconocimiento automático del habla (ASR) en finés; existe una versión ya afinada publicada por el mismo autor.
- Aprendizaje por transferencia a tareas de voz de bajo recurso mediante ajuste con pocas horas etiquetadas.
- Procesamiento de audio broadcast real (radio y televisión) con ruido, música y solapamientos, gracias al filtrado por confianza de ASR durante el preentrenamiento.
- No incluye cabecera CTC ni tokenizador: no genera transcripciones directamente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo de voz, no de lenguaje).
- Capacidad multilingüe limitada al finés; no se ha entrenado con otros idiomas según la información disponible.
- Sin capacidades de visión, audio generativo ni modo "thinking".

## Casos de uso

- Fine-tuning para ASR en finés: el uso principal. Se añade una cabecera CTC o un decodificador y se ajusta sobre transcripciones (Lahjoita puhetta, Parlamento, Common Voice) para obtener un sistema de transcripción específico del dominio.
- Transcripción de archivos de radiodifusión: el preentrenamiento incluye audio broadcast real (KUVI/KAVI), por lo que las representaciones se adaptan bien a programas de radio y televisión con ruido y solapamientos; útil para digitalización y búsqueda en archivos audiovisuales finlandeses.
- Subtitulado automático de contenido audiovisual en finés: partiendo de esta base y afinando con pares audio-texto, se puede construir un pipeline de subtitulado para plataformas de vídeo en finés.
- Investigación en modelos fundacionales de voz: sirve como punto de partida para estudiar arquitecturas híbridas (E-Branchformer frente a Transformer o Conformer) en condiciones de muchos datos, con checkpoints comparables de igual número de parámetros.
- Reconocimiento de habla en el dominio parlamentario o administrativo: el corpus del Parlamento finlandés forma parte del preentrenamiento, lo que facilita el ajuste para transcripción de sesiones y actas.
- Extracción de embeddings para tareas downstream no generativas: clasificación de hablante, detección de emociones o segmentación de audio, usando las representaciones del encoder como features congeladas.
- Evaluación comparativa de arquitecturas a escala: permite reproducir los experimentos del artículo con checkpoints de 48 capas y ~966 M de parámetros en Transformer, Conformer y E-Branchformer.

## Benchmarks y rendimiento

Resultados del artículo (Tabla III) con WER (%) de los modelos X-Large afinados, con recuento de parámetros equiparable. LP = Lahjoita puhetta, FP = Parlamento finlandés, CV = Common Voice 16.1, KAVI = habla broadcast real.

| Modelo | Params | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 48 capas (baseline previa, 158K h) | 965,5 M | 16,37 | 7,81 | 6,43 | 5,42 | 9,96 | 22,42 |
| Transformer, 48 capas | 965,5 M | **16,27** | 7,83 | **6,26** | 3,85 | 9,37 | **19,54** |
| Conformer, 48 capas | 964,7 M | 17,13 | 7,78 | 6,45 | **3,68** | **9,08** | 20,75 |
| E-Branchformer, 48 capas (este modelo) | 965,6 M | 16,74 | **7,63** | 6,38 | 4,45 | 9,13 | 19,96 |

El E-Branchformer obtiene el mejor WER en FP'16 (7,63) y queda muy cerca del Transformer en KAVI (19,96 frente a 19,54) y FP'20 (6,38 frente a 6,26). En Common Voice y FLEURS es superado por Transformer y Conformer respectivamente. No se han publicado en la información disponible resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K), que no aplican a un modelo de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, ~3,9 GB solo de pesos (966 M × 4 bytes); en fp16/bf16, ~1,9 GB. A esto hay que sumar activaciones y buffers del encoder de 48 capas, que en audio largo pueden añadir varios GB.
- GPU recomendadas: A100 (40/80 GB) o H100 para fine-tuning con lotes grandes, como en el entrenamiento original (512 GPUs, ~1 minuto de audio por GPU y actualización). Para inferencia, una RTX 4090 (24 GB) es suficiente en fp16.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) y potencialmente en GPUs de 8-12 GB si se aplica cuantización o se procesa audio en fragmentos cortos; no se documentan recetas de cuantización oficiales.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requerido por el código de encoder personalizado); fairseq mediante el fork del autor (`Getmany1/fairseq`) para cargar el checkpoint original. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto / entrada | WER KAVI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E-Branchformer 48L (este modelo) | 965,6 M | audio 16 kHz | 19,96 | Apache 2.0 | HF + checkpoint fairseq |
| Transformer 48L (mismo paper) | 965,5 M | audio 16 kHz | 19,54 | Apache 2.0 | HF + checkpoint fairseq |
| Conformer 48L (mismo paper) | 964,7 M | audio 16 kHz | 20,75 | Apache 2.0 | HF + checkpoint fairseq |
| wav2vec 2.0 XLS-R (Meta) | ~300 M / 1 B / 2 B | audio 16 kHz | no disponible para finés en esta comparativa | MIT / CC-BY-NC | HF |

La comparativa directa más justa es con los otros dos checkpoints del mismo artículo, que comparten datos, presupuesto de entrenamiento y recuento de parámetros. Frente a XLS-R de Meta, este modelo está especializado en finés y se ha entrenado con 471 K horas de ese idioma, mientras que XLS-R es multilingüe; no hay datos de WER comparables en la información disponible.

## Limitaciones y advertencias

- Solo finés: no se ha entrenado con otros idiomas y no se espera un rendimiento razonable fuera de ese idioma.
- No es un sistema ASR listo para usar: carece de tokenizador y cabecera CTC; requiere fine-tuning supervisado con transcripciones.
- Requiere `trust_remote_code=True` por el código personalizado que reproduce el encoder de fairseq; conviene auditar ese código antes de desplegarlo en producción.
- Riesgo de alucinación no aplicable en el sentido de modelos generativos, pero sí de transcripciones erróneas si se usa una cabecera mal ajustada; el WER en dominios ruidosos (KAVI ~20 %) es alto en términos absolutos.
- Sesgos potenciales derivados del corpus: audio broadcast finlandés (radio, televisión, Parlamento) puede sobrerrepresentar registros formales y voces de locutores profesionales, con menor cobertura de habla espontánea, dialectos o hablantes con acento no nativo.
- Licencia Apache 2.0: permite uso comercial, pero el checkpoint `fairseq/checkpoint.pt` y el código personalizado deben revisarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.
- La fecha de creación (2026-11-24) y el identificador arXiv 2610.13102 son los indicados en la información disponible; verificar su vigencia antes de citarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-xlarge-ebranch-48l-fi-471k
- Versión afinada para ASR: https://huggingface.co/GetmanY1/wav2vec2-xlarge-ebranch-48l-fi-471k-finetuned
- Artículo: https://arxiv.org/abs/2610.13102
- Código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq del autor: https://github.com/Getmany1/fairseq
- Perfil del autor en Hugging Face: https://huggingface.co/GetmanY1
- LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- LinkedIn de Tamás Grósz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
