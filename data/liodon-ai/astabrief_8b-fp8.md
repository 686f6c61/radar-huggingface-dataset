# liodon-ai/AstaBrief_8B-FP8

## Resumen

AstaBrief_8B-FP8 es una cuantizacion en FP8 del modelo allenai/AstaBrief_8B, publicada por el usuario liodon-ai. Se trata de un artefacto derivado: no es un modelo entrenado desde cero, sino una conversion de los pesos originales a precision FP8 para reducir el consumo de memoria y acelerar la inferencia. El modelo base, desarrollado por el Allen Institute for AI (Ai2), es un transformer denso de 8.190.735.360 parametros (8,19 mil millones) construido como fine-tuning de Qwen3-8B y orientado a la generacion automatica de informes cientificos con citas.

El proposito del modelo base es recibir una pregunta de investigacion junto con un conjunto de extractos de literatura recuperados y producir, en una sola pasada hacia delante (single forward pass), un informe estructurado y con citas. Ai2 lo emplea como "Fast mode" dentro de Asta, su plataforma de agentes para investigacion cientifica, y lo publico en abierto junto con sus datos de entrenamiento el 2 de octubre de 2026. La relevancia de esta version FP8 radica en que reduce el peso de 16,4 GB a 9,4 GB, habilitando su despliegue en GPUs de gama alta para consumidores y en aceleradores de centro de datos sin necesidad de calibracion.

La cuantizacion se realizo con llm-compressor (proyecto de vLLM) mediante el esquema FP8_DYNAMIC: pesos convertidos a FP8 E4M3 por canal y activaciones cuantizadas dinamicamente por token en tiempo de inferencia. Al no requerir dataset de calibracion, los pesos resultantes son una conversion directa del original, sin sesgo introducido por conjunto de calibracion. La capa `lm_head` se deja sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 (E4M3) dinamico, esquema FP8_DYNAMIC; pesos por canal, activaciones por token; `lm_head` sin cuantizar |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Other (otra); hereda las condiciones de allenai/AstaBrief_8B |
| Formato de pesos | safetensors (compressed-tensors) |

Otros datos: tamano del repositorio 9,5 GB; modelo base allemai/AstaBrief_8B; biblioteca transformers; tarea text-generation; etiquetas qwen3, fp8, compressed-tensors, vllm, quantized, conversational; creado el 2 de octubre de 2026.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer decoder denso de aproximadamente 8,19 mil millones de parametros. Ai2 tomo ese modelo y lo sometio a fine-tuning para una tarea muy concreta: transformar una pregunta de investigacion mas un conjunto de fragmentos de literatura recuperados en un informe cientifico estructurado y con citas, todo ello en una sola pasada. Los detalles exactos del proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada, aunque Ai2 indica que los datos de entrenamiento del modelo base se publicaron en abierto. El resultado es un modelo especializado en generacion de informes que, segun Ai2, es aproximadamente 3,5 veces mas rapido en ese flujo que la alternativa previa.

Por lo que respecta a esta version concreta, la innovacion tecnica es puramente de cuantizacion. Se aplico el esquema FP8_DYNAMIC de llm-compressor: los pesos se convierten a FP8 (E4M3) por canal de forma anticipada, mientras que las activaciones se cuantizan dinamicamente por token durante la inferencia. Este esquema no necesita dataset de calibracion, de modo que los pesos cuantizados son una conversion directa de los originales. La capa de salida `lm_head` permanece en precision completa. El resultado es un modelo de 9,4 GB (frente a los 16,4 GB del original) que mantiene el pipeline de transformers, vLLM, TGI y SGLang.

## Capacidades

- Generacion de texto conversacional y no conversacional, con soporte de templates de Qwen3.
- Generacion de informes cientificos con citas a partir de una pregunta de investigacion y extractos de literatura recuperados, en una sola pasada.
- Redaccion de texto estructurado y con formato, orientado a documentos tecnicos y academicos.
- Integracion con pipelines de retrieval-augmented generation (RAG) para la fase de recuperacion de literatura.
- Compatibilidad con vLLM, Text Generation Inference (TGI) y SGLang como motores de servicio.
- Cuantizacion FP8 con compressed-tensors, consumible directamente por vLLM.
- No se dispone de informacion especifica sobre soporte de tool calling, function calling, capacidades de agente multi-paso, vision, audio, thinking mode ni cobertura multilingue detallada.

## Casos de uso

- Generacion de informes cientificos citados: dado un tema de investigacion y un conjunto de papers recuperados, el modelo produce un informe estructurado con referencias en una sola pasada, que es exactamente la tarea para la que fue ajustado.
- Asistente de revision bibliografica: integrado en un sistema RAG, resume y compara hallazgos de multiples articulos sobre un mismo tema, manteniendo las citas para su verificacion posterior.
- Aceleracion de tareas de escritura tecnica: equipos de investigacion pueden generar borradores de secciones (introduccion, estado del arte, discusion) a partir de notas y referencias ya recopiladas.
- Backend de "modo rapido" en plataformas de investigacion: al ser una version cuantizada de 9,4 GB, resulta adecuado para servir como opcion de baja latencia dentro de plataformas tipo agente cientifico.
- Despliegue on-premise con datos sensibles: al poder ejecutarse en GPUs locales con soporte FP8, permite procesar literatura confidencial sin enviarla a servicios en la nube.
- Generacion masiva de resumenes citados: procesamiento por lotes de grandes volumenes de articulos para producir resumenes con referencias verificables, aprovechando el menor consumo de memoria de la version FP8.
- Investigacion sobre cuantizacion: por su esquema FP8_DYNAMIC sin calibracion, sirve como caso de estudio para evaluar el impacto de la cuantizacion FP8 en tareas de generacion larga y con citas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de generacion de informes para esta version cuantizada. El unico dato de rendimiento mencionado por Ai2 en relacion con el modelo base es una velocidad aproximadamente 3,5 veces superior en la generacion de informes en una sola pasada, sin que se detallen las condiciones de medicion.

## Requisitos de hardware

- La ejecucion real en FP8 requiere una GPU NVIDIA con compute capability igual o superior a 8,9 (familias Ada, Hopper o Blackwell): RTX 40-series, RTX 50-series, L4, L40S, H100, H200, B100, B200, GB10.
- En GPUs anteriores, vLLM y TGI de-cuantizan el modelo para poder ejecutarlo, perdiendo la ventaja de velocidad y de memoria.
- Peso del modelo cuantizado: 9,4 GB (frente a 16,4 GB del original). El repositorio ocupa 9,5 GB.
- VRAM estimada (orientativa, no confirmada por el autor): en torno a 12-14 GB para el modelo mas cache KV e overhead en contextos cortos y medianos; mas margen si se trabaja con secuencias largas.
- Cabe en GPUs de consumo con soporte FP8, como la RTX 4090 (24 GB) o la RTX 5090, siempre que el contexto y el lote no sean muy grandes.
- GPUs de centro de datos recomendadas: L40S, H100 y H200 para maxima velocidad y concurrencia.
- Opciones de despliegue confirmadas por el autor: vLLM (`vllm serve liodon-ai/AstaBrief_8B-FP8`), Text Generation Inference (TGI) via contenedor Docker y SGLang.
- Latencia y throughput concretos: no disponibles. Solo se conoce la referencia relativa de Ai2 (aproximadamente 3,5 veces mas rapido en la tarea de generacion de informes para el modelo base).

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/AstaBrief_8B-FP8 | 8,19 mil millones | FP8 (E4M3) dinamico, safetensors | 9,4 GB | Other | HuggingFace (liodon-ai) |
| allenai/AstaBrief_8B | 8,19 mil millones | Precision completa (BF16), safetensors | 16,4 GB | Other | HuggingFace (allenai) |
| Qwen3-8B | ~8 mil millones | Multiples (safetensors, GGUF, FP8) | Variable | Apache-2.0 (Qwen3) | HuggingFace (Qwen) |

La comparativa se limita a estas referencias porque no se dispone de resultados de benchmarks que permitan contrastar el rendimiento de AstaBrief_8B-FP8 frente a alternativas de la misma categoria en la tarea concreta de generacion de informes citados. AstaBrief_8B es un fine-tuning de Qwen3-8B, por lo que este ultimo actua como referencia de arquitectura y tamano, pero no como equivalente funcional. No se dispone de datos comparativos con otros modelos de generacion de informes.

## Limitaciones y advertencias

- Modelo especializado: esta ajustado para generar informes cientificos citados a partir de literatura recuperada; su comportamiento fuera de ese dominio no esta documentado y puede ser inferior al de un modelo generalista del mismo tamano.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir afirmaciones o citas incorrectas. Al tratarse de un modelo que genera referencias, el riesgo de citas inventadas o mal atribuidas es especialmente relevante y debe mitigarse con verificacion externa.
- Dependencia de la calidad del retrieval: los informes dependen de los extractos de literatura que se le proporcionen; entradas pobres o sesgadas se traducen en informes pobres o sesgados.
- Idiomas: no se dispone de informacion sobre los idiomas soportados; no debe asumirse cobertura multilingue.
- Longitud de contexto: no especificada en la informacion disponible, lo que impide planificar con seguridad cargas con muchos documentos de entrada.
- Requisito de hardware para FP8: sin una GPU con compute capability 8.9 o superior, el modelo se de-cuantiza y se pierden las ventajas de la cuantizacion en velocidad y memoria.
- Licencia "other": las condiciones exactas de uso, incluido el uso comercial, no estan detalladas en la informacion proporcionada; deben consultarse en el repositorio del modelo base allenai/AstaBrief_8B antes de cualquier despliegue en produccion.
- Procedencia: esta version es una cuantizacion de terceros (liodon-ai), no una publicacion oficial de Ai2. La calidad y el mantenimiento dependen del autor de la cuantizacion.
- Sin validacion publica: el modelo no registra descargas ni valoraciones y no cuenta con benchmarks publicados, por lo que su comportamiento real en produccion no esta verificado de forma independiente.

## Enlaces

- Modelo cuantizado (HuggingFace): https://huggingface.co/liodon-ai/AstaBrief_8B-FP8
- Modelo base (HuggingFace): https://huggingface.co/allenai/AstaBrief_8B
- Blog de Ai2 sobre AstaBrief: https://allenai.org/blog/astabrief
- llm-compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
- Analisis en Local Model Watch: https://localmodelwatch.tsuchitsuchi.com/en/2026/10/03/astabrief-8b-open-source-scientific-report-generator/
- Articulo en Toolnavs: https://toolnavs.com/article/2265-astabrief-goes-open-source-ai2s-8b-model-writes-cited-scientific-reports-35x-fas
- Articulo en dev.to: https://dev.to/prabhakar_chaudhary_7afe4/astabrief-8b-how-allenai-trained-a-small-open-model-to-generate-cited-scientific-reports-29ck
- Cobertura en AlphaSignal: https://alphasignal.ai/news/ai2-s-astabrief-8b-writes-cited-research-reports-3-5x-faster-in-one-pass
