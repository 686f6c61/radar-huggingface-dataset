# aitamedia/Hy4-flash-EXL3-3.0bpw-Q4engram

## Resumen

Hy4-flash-EXL3-3.0bpw-Q4engram es una cuantizacion EXL3 (ExLlamaV3 con codificacion trellis) del modelo tencent/Hy4-flash-FP8, publicada por el usuario aitamedia. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 224.000 millones de parametros totales, 12.000 millones activos, 512 expertos enrutados con top-16 y una ventana de contexto de 1 millon de tokens. Se trata de un modelo nativamente multimodal (incluye torre de vision y cabeza MTP para decodificacion especulativa).

La particularidad de esta publicacion es que solo se cuantizan los expertos MoE enrutados (41 capas x 512 expertos, 148.600 millones de parametros) a 3.0 bits por peso con formato trellis EXL3, mientras que el resto de componentes (atencion, router, normalizaciones, embeddings, torre de vision y cabeza MTP) se copian byte a byte desde el modelo FP8 original. Ademas, la tabla Engram del modelo se distribuye como shards independientes y cargables por separado, disenados para hacer mmap desde NVMe y paginar solo las filas que toca cada token.

El resultado es un paquete de 101,7 GB en el repositorio (55,72 GB de expertos cuantizados mas 126,9 GB de tablas Engram y el resto de pesos copiados). Esta pensado para hardware de memoria unificada como DGX Spark GB10, donde la unica forma realista de servir el modelo es el offload a disco de la tabla Engram. Es relevante para quien quiera ejecutar un MoE de 224.000 millones de parametros con contexto de 1 millon de tokens en un unico nodo con memoria unificada, aceptando el coste de latencia del paginado desde SSD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con torre de vision y cabeza MTP; cuantizacion EXL3 trellis |
| Parametros totales | 72.004.062.982 (safetensors del repo); el autor declara 224 B totales (155,5 B backbone + 63,5 B Engram + 0,85 B draft) |
| Parametros activos | 12 B |
| Longitud de contexto | 1 M tokens |
| Tipos de cuantizacion | EXL3 trellis 3,0 bpw (solo expertos MoE enrutados); resto de pesos en FP8 copiado del modelo base |
| Idiomas soportados | en, zh |
| Licencia | other (sigue los terminos del modelo fuente tencent/Hy4-flash-FP8) |
| Formato de pesos | safetensors + shards `experts.pt` por capa + `scales.json` + `exl3_k_map.json` + `encode-state.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 512 expertos enrutados y top-16 por token, 41 capas con expertos, 12.000 millones de parametros activos y 1 millon de tokens de contexto. Incluye una torre de vision (multimodal nativo) y una cabeza MTP (Multi-Token Prediction) de 0,85 B para decodificacion especulativa. La tabla Engram son cuatro tensores `multi_head_embedding.embedding.weight` en las capas 1, 11, 21 y 31, con formas [164.994.380, 96], [164.999.008, 96], [165.004.086, 96] y [165.008.942, 96] en BF16, 31,68 GB cada uno y 126,9 GB en total.

Esta publicacion no entrena el modelo: solo cuantiza. El proceso de encode se hizo en CPU (GB10 es sm_121 y el techo CUDA de torch es 12.0), con exllamav3 `quantize_tiles` + `pack_trellis` usando `{"K":3,"mcg":true,"mul1":false}`, 41 capas x 5,7 minutos = 3,81 horas totales. Se obtuvieron 55,72 GB frente a los 55,7 GB proyectados a 3,0 bpw, lo que confirma la densidad del empaquetado. Los expertos se cuantizan con codebook `mcg` (mean-centroid, sin mul1), tiles de 16x16 sobre bloques de 256 pesos, K=3, y `gate_up_proj` fusionado por experto. El resto de pesos se copia byte a byte desde `tencent/Hy4-flash-FP8` (148 shards, 289,2 GB, verificado por sha en disco).

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Razonamiento y matemáticas: el modelo base esta disenado como modelo de proposito general con capacidad de razonamiento, aunque no se detallan modos explicitos de pensamiento en la informacion disponible.
- Capacidad multimodal nativa: incluye torre de vision, por lo que puede procesar imagenes ademas de texto.
- Contexto largo: ventana de 1 millon de tokens, apta para documentos extensos, codebases completas o historiales largos.
- Decodificacion especulativa mediante cabeza MTP de 0,85 B, orientada a acelerar la generacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a ingles y chino segun los tags del modelo.

## Casos de uso

- Analisis de documentos extensos: con 1 M de tokens de contexto, el modelo puede ingerir informes completos, expedientes o libros tecnicos en una sola pasada sin troceado, y responder preguntas sobre el conjunto.
- Procesamiento de imagenes y texto combinados: la torre de vision permite extraer informacion de capturas, diagramas o documentos escaneados junto a instrucciones textuales en un mismo prompt.
- Despliegue en nodos de memoria unificada: pensado para DGX Spark GB10, donde el modelo se sirve con la tabla Engram paginada desde NVMe mediante backends de offload a disco (dsv41 / DeepSeek-V4.1 o el kit de MiaAI-Lab).
- Asistencia conversacional en ingles y chino: el modelo esta etiquetado como conversational y soporta ambos idiomas, adecuado para atencion al cliente o asistentes en esos mercados.
- Investigacion sobre cuantizacion extrema: el paquete sirve como referencia reproducible de cuantizacion EXL3 a 3,0 bpw de un MoE de gran tamano, con estado de encode por capa incluido.
- Experimentacion con decodificacion especulativa: la cabeza MTP permite probar tecnicas de generacion acelerada sobre un modelo de 12 B activos.
- Evaluacion de infraestructura de inferencia: util para medir latencia y throughput reales de un MoE de 224 B con offload a disco en un unico nodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el paquete ocupa 101,7 GB en disco; los expertos cuantizados suman 55,72 GB y el resto de pesos copiados (atencion, router, normas, vision, MTP) unos 11,8 GB repartidos en cinco shards. La tabla Engram (126,9 GB) esta pensada para residir en SSD y paginarse por filas.
- GPU recomendadas: DGX Spark GB10 (memoria unificada, sm_121) es el objetivo declarado del autor. Para servirlo en GPU discretas haria falta memoria agregada muy superior a la de una sola tarjeta; no se detallan configuraciones alternativas.
- Cabe en consumer GPU: no de forma completa. Ni los expertos (55,72 GB) ni la tabla Engram (126,9 GB) caben en una RTX 4090 de 24 GB; se requeriria offload a RAM/SSD o multiples GPU.
- Opciones de despliegue: backends con soporte de offload a disco de la tabla Engram: dsv41 / DeepSeek-V4.1 con `--engram-config '{"cpu_offload":true,"dp_shared_memory":false,"disk_offload":true,"disk_threads":256}'`, o el kit de MiaAI-Lab (`engram_file_backend.py` + `librow_store.so` via `--hf-overrides '{"engram_table_dir": …}'`). El motor de disk-offload de vLLM upstream esta limitado a Qwen4Exp; la ruta HYV4-Flash solo expone `pin_memory`.
- Latencia y throughput: no disponible en la informacion proporcionada. La paginacion desde NVMe introduce latencia adicional dependiente del almacenamiento.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-EXL3-3.0bpw-Q4engram | 224 B / 12 B | 1 M | EXL3 3,0 bpw (expertos) | other (hereda del base) | Hugging Face, 0 descargas |
| tencent/Hy4-flash-FP8 (base) | 224 B / 12 B | 1 M | FP8 | other | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto y formato.

## Limitaciones y advertencias

- Solo se cuantizan los expertos MoE; el resto de pesos se copia en FP8 desde el modelo base, por lo que el ahorro de memoria se concentra en los expertos y no en atencion, vision o embeddings.
- La tabla Engram (126,9 GB) domina el consumo de memoria y exige offload a disco; sin un backend compatible (dsv41 o MiaAI-Lab) el modelo no se puede servir de forma practica en un solo nodo.
- El soporte en vLLM upstream esta limitado: la ruta HYV4-Flash solo expone `pin_memory`, no offload a disco completo.
- Idiomas limitados a ingles y chino; no hay soporte declarado de castellano.
- Licencia "other" heredada del modelo fuente: es necesario revisar los terminos de tencent/Hy4-flash-FP8 antes de cualquier uso comercial.
- Riesgo de alucinacion: no se documenta en la informacion disponible, pero es inherente a los modelos generativos de este tipo.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni reportes de calidad de la cuantizacion.
- La fecha de creacion indicada (2026-11-25) y las referencias a hardware y modelos (DGX Spark GB10, DeepSeek-V4.1, Qwen4Exp) deben tratarse con cautela; no se ha verificado su disponibilidad general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aitamedia/Hy4-flash-EXL3-3.0bpw-Q4engram
- Modelo base: https://huggingface.co/tencent/Hy4-flash-FP8
- Repositorio de ExLlamaV3: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
