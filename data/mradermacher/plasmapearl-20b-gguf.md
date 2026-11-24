# mradermacher/PlasmaPearl-20B-GGUF

## Resumen

PlasmaPearl-20B-GGUF es la distribucion en formato GGUF del modelo PlasmaPearl-20B, un modelo de lenguaje de aproximadamente 20.000 millones de parametros desarrollado por el usuario Elfrino y publicado originalmente en Hugging Face. Esta version concreta ha sido generada por mradermacher, un conocido cuantizador de la comunidad open source que convierte modelos en formato transformers a GGUF para su uso con llama.cpp y herramientas compatibles. El modelo base se ha construido mediante mergekit, es decir, es un merge (fusion) de otros modelos, no un entrenamiento desde cero.

La relevancia de esta ficha reside en que permite ejecutar un modelo de ~20B en hardware de consumo gracias a las cuantizaciones disponibles, que van desde Q2_K (7,5 GB) hasta Q8_0 (21,3 GB). El modelo esta etiquetado unicamente para ingles y no dispone de model card detallada por parte del autor original, por lo que muchos datos tecnicos (contexto, licencia, datos de entrenamiento) no estan disponibles publicamente.

Se trata, por tanto, de un modelo de proposito general orientado a generacion de texto, cuya principal virtud es la disponibilidad de multiples cuantizaciones estaticas listas para descargar y usar con llama.cpp, Ollama o cualquier runtime compatible con GGUF. No hay informacion publica sobre benchmarks ni capacidades especificas declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de un merge con mergekit); detalles no disponibles |
| Parametros totales | 19.994.362.880 (~20B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo separado |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |
| Tamano del repo | 136,2 GB |
| Modelo base | Elfrino/PlasmaPearl-20B |
| Cuantizador | mradermacher |

## Arquitectura y entrenamiento

El modelo base PlasmaPearl-20B ha sido creado mediante mergekit, una herramienta que permite fusionar los pesos de varios modelos existentes sin necesidad de reentrenar. La etiqueta `merge` y `mergekit` en el repo confirman este origen, pero no se especifica que modelos se fusionaron, con que metodo (SLERP, TIES, DARE, passthrough, etc.) ni con que hiperparametros. Tampoco se documenta el proceso de entrenamiento posterior, si lo hubo, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Al tratarse de un merge, la arquitectura subyacente es la de los modelos donantes, presumiblemente transformers densos de ~20B parametros, pero no se detalla la familia (Llama, Mistral, Qwen u otra). No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion realizada por mradermacher es estatica (no imatrix en este repo), con una version imatrix disponible en un repositorio separado (`PlasmaPearl-20B-i1-GGUF`), que suele ofrecer mejor calidad por tamano.

## Capacidades

- Generacion de texto en ingles: el modelo esta etiquetado unicamente para ingles, sin soporte multilingue declarado.
- Razonamiento y generacion de texto general: capacidades esperables en un modelo denso de ~20B, aunque no hay evaluaciones publicas que lo confirmen.
- No hay informacion sobre soporte de tool calling o function calling.
- No hay informacion sobre capacidades de agente o razonamiento multi-paso.
- No hay informacion sobre modo thinking, vision, audio ni otras capacidades especiales.
- No hay informacion sobre capacidades de codigo o matematicas mas alla de lo esperable en un modelo de proposito general.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: con la cuantizacion Q4_K_M (12,1 GB) el modelo cabe en GPUs de consumo de 16 GB o en configuraciones con RAM suficiente, permitiendo iterar rapidamente sin coste de API.
- Generacion de texto creativo y redaccion en ingles: el modelo puede usarse para borradores, resumenes y reescritura en flujos de trabajo personales o de pequeno equipo donde la licencia lo permita (a verificar, ya que no esta disponible).
- Experimentacion con merges: al ser un modelo fusionado, sirve como caso de estudio para investigadores que quieran analizar el comportamiento de merges de ~20B frente a modelos base, comparando perplejidad y calidad cualitativa.
- Despliegue en entornos sin GPU dedicada: las cuantizaciones Q2_K (7,5 GB) y Q3_K_S (8,8 GB) permiten ejecucion en CPU con llama.cpp, util para pruebas de concepto en portatiles o servidores sin acelerador.
- Evaluacion comparativa de cuantizaciones: el repo ofrece 11 variantes, lo que permite medir el impacto de la cuantizacion en calidad y velocidad sobre un mismo modelo, algo util para calibrar pipelines de despliegue.
- Base para fine-tuning ligero posterior: al estar disponible el modelo base en safetensors, se puede partir de el para LoRA o QLoRA en ingles, aunque la falta de licencia clara es un riesgo a resolver antes de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y overhead de contexto):
  - Q2_K (7,5 GB): ~8-9 GB VRAM o ejecucion en CPU.
  - Q3_K_S (8,8 GB): ~10 GB VRAM.
  - IQ4_XS (10,8 GB) y Q4_K_S (11,5 GB): ~12-13 GB VRAM, apto para RTX 4080/4090 (16-24 GB).
  - Q4_K_M (12,1 GB): ~13-14 GB VRAM.
  - Q5_K_M (14,3 GB): ~15-16 GB VRAM, limite para GPUs de 16 GB con contexto corto.
  - Q6_K (16,5 GB): ~17-18 GB VRAM, requiere 24 GB (RTX 3090/4090, A10G, L4 con offload parcial).
  - Q8_0 (21,3 GB): ~22-23 GB VRAM, requiere A100 40 GB, H100 o RTX 4090 con offload parcial a RAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q4-Q6; A100 40 GB o H100 para Q8_0 y contextos largos; RTX 3090 como alternativa economica de 24 GB.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con Q3_K_S o IQ4_XS (con contexto limitado), y en RTX 4070 Ti/4080/4090 con Q4-Q5.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles (no hay mediciones publicadas). Como referencia orientativa, un modelo denso de ~20B en Q4_K_M en una RTX 4090 suele generar del orden de decenas de tokens por segundo, pero no se dispone de cifras concretas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PlasmaPearl-20B-GGUF | ~20B | No disponible | No disponible | GGUF | Merge via mergekit, solo ingles, 11 cuantizaciones |
| Mistral Small 22B (referencia) | ~22B | 32k (segun version) | Apache 2.0 (segun version) | safetensors/GGUF | Modelo oficial con benchmarks publicos |
| Qwen2.5-14B (referencia) | ~14B | 32k+ | Apache 2.0 (segun version) | safetensors/GGUF | Multilingue, benchmarks publicos |
| Gemma 2 27B (referencia) | ~27B | 8k | Gemma license | safetensors/GGUF | Modelo oficial con evaluaciones |

La comparativa es orientativa: no se dispone de datos de rendimiento de PlasmaPearl-20B que permitan una comparacion cuantitativa rigurosa con estos modelos. Las alternativas citadas son modelos oficiales con benchmarks y licencias claras, lo que contrasta con la opacidad del modelo analizado.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es un riesgo critico para produccion.
- Model card practicamente inexistente en el modelo base: no se documentan datos de entrenamiento, contexto, alineacion ni limitaciones conocidas.
- Solo ingles: no hay soporte multilingue declarado, por lo que su uso en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: sin evaluaciones publicas, no se puede estimar la tasa de alucinacion ni la fiabilidad factual.
- Origen via merge: la calidad depende de los modelos donantes y de los hiperparametros del merge, que no se detallan; los merges pueden heredar sesgos y fallos de sus componentes.
- Longitud de contexto desconocida: limita su uso en tareas de contexto largo (documentos extensos, conversaciones multi-turno largas) sin pruebas previas.
- Sin benchmarks: no hay evidencia publica de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas, por lo que su calidad relativa es incierta.
- Comunidad minima: 11 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte o reportes de errores.
- Cuantizaciones Q2_K y Q3_K_M marcadas por el propio autor como de menor calidad; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PlasmaPearl-20B-GGUF
- Modelo base: https://huggingface.co/Elfrino/PlasmaPearl-20B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/PlasmaPearl-20B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#PlasmaPearl-20B-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- mergekit (herramienta de merge): https://github.com/arcee-ai/mergekit
