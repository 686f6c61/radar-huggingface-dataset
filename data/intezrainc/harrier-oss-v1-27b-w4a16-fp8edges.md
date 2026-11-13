# IntezraInc/harrier-oss-v1-27b-W4A16-FP8edges

## Resumen

Harrier-oss-v1-27b-W4A16-FP8edges es una cuantizacion no oficial del modelo de embeddings multilingue `microsoft/harrier-oss-v1-27b`, publicada por Intezra, Inc. Se trata de un checkpoint de recuperacion de texto (feature-extraction) construido sobre la arquitectura Gemma 3 (62 capas, embeddings de 5.376 dimensiones, pooling de ultimo token y normalizacion L2), disenado para servir con vLLM en una unica GPU de 24 GB.

El modelo aplica compresion mixta: pesos INT4 con grupo de 128 (W4A16) combinados con capas de borde en FP8, empaquetados con `compressed-tensors` y generados con `llm-compressor`. El resultado ocupa 18,42 GB en disco frente a los 54,0 GB del original en BF16, lo que permite mantener contexto largo en hardware de gama profesional-consumo.

Su relevancia radica en que conserva la calidad de recuperacion del modelo base dentro del ruido estadistico (delta medio de nDCG@10 de -0,0019 en tareas de retrieval y -0,0020 en codigo) a costa de una fidelidad de embedding por item algo menor (cosine p5 de 0,969 en documentos largos). Es una opcion practica para indexar corpus completos con un unico modelo cuantizado, no para mezclar con indices ya generados en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Gemma 3 adaptado a embeddings (62 capas, 5.376 dim, pooling LAST, normalizacion L2) |
| Parametros totales | 8.945.986.304 (segun safetensors; el nombre comercial indica 27B, discrepancia no aclarada en la informacion disponible) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (16.384 en configuracion recomendada a 24 GB con `--gpu-memory-utilization 0.90`) |
| Tipos de cuantizacion | INT4 g128 (W4A16) + FP8 en capas de borde; compressed-tensors |
| Idiomas soportados | Multilingue (sin listado explicito de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), servido con vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de la familia Gemma 3 reutilizado como encoder de embeddings: 62 capas, dimension de embedding de 5.376, pooling sobre el ultimo token y normalizacion L2 de la salida. No es un modelo generativo en esta configuracion, sino un extractor de representaciones para recuperacion densa.

Los datos de entrenamiento del modelo base, segun los tags del repositorio, incluyen allenai/gooaq, CohereLabs/aya_dataset, HuggingFaceFW/fineweb-2, HuggingFaceFW/fineweb-edu y codeparrot/github-code-clean, lo que explica su cobertura multilingue y de codigo. No se detalla el numero de tokens, la composicion exacta ni si hubo RLHF/DPO; esa informacion no esta disponible.

La innovacion tecnica de esta variante es la cuantizacion mixta: capas lineales en INT4 con grupo de 128 y capas de borde en FP8, empaquetadas con `compressed-tensors` y validadas contra el BF16 servido por vLLM 0.31.0 (que a su vez coincide con sentence-transformers con cosine mediana de 0,9998).

## Capacidades

- Generacion de embeddings de texto para recuperacion densa (retrieval), con pooling de ultimo token y normalizacion L2.
- Recuperacion multilingue: evaluado en Belebele (37 subconjuntos, 12 idiomas, mismo idioma y X↔ingles) y MLQA (19 subconjuntos, 7 idiomas).
- Recuperacion de codigo: 18 tareas de MTEB(Code, v1) y RTEB(Code, beta), incluyendo busqueda texto-codigo, edicion de codigo y text-to-SQL.
- Manejo de documentos largos: contexto de hasta 32.768 tokens con chunked prefill.
- Soporte de instrucciones de tarea mediante prompts oficiales de Harrier.
- No soporta tool calling, agentes, vision, audio ni modo thinking: es un modelo de embeddings, no generativo.

## Casos de uso

- Busqueda semantica en corpus multilingues: indexar documentacion en varios idiomas y consultar en lenguaje natural, aprovechando la cobertura de 12 idiomas evaluada en Belebele.
- RAG sobre documentacion tecnica larga: con contexto de hasta 32.768 tokens se pueden embeber secciones extensas sin trocear en exceso, reduciendo la perdida de coherencia entre fragmentos.
- Recuperacion de codigo en repositorios: las 18 tareas de codigo evaluadas (CodeSearchNet, HumanEval, MBPP, StackOverflowQA) lo hacen adecuado para asistentes de busqueda dentro de bases de codigo.
- Deduplicacion y clustering de documentos: la similitud coseno entre embeddings permite agrupar contenido casi duplicado en pipelines de limpieza de datos.
- Clasificacion zero-shot por similitud: comparar embeddings de consultas contra descripciones de categorias para enrutamiento de tickets o etiquetado sin entrenamiento adicional.
- Despliegue en una sola GPU de 24 GB: permite montar un servidor de embeddings en una RTX Pro 4000 Blackwell SFF o similar, con 16.384 tokens de contexto a 0,90 de utilizacion de memoria.
- Busqueda en bases de conocimiento de atencion al cliente: recuperar articulos relevantes para consultas de usuarios en varios idiomas antes de pasarlas a un LLM generativo.

## Benchmarks y rendimiento

Retrieval (mteb 2.24.9, prompts oficiales de Harrier, entradas truncadas a 8.192 tokens):

| Tarea | BF16 nDCG@10 | Este modelo nDCG@10 | Delta |
|---|---|---|---|
| SciFact | 0.7995 | 0.7956 | -0.0039 |
| NFCorpus | 0.4192 | 0.4192 | +0.0001 |
| FiQA2018 | 0.6221 | 0.6187 | -0.0034 |
| ArguAna | 0.6814 | 0.6804 | -0.0010 |
| SCIDOCS | 0.2907 | 0.2898 | -0.0009 |
| LEMBSummScreenFDRetrieval | 0.9858 | 0.9816 | -0.0042 |
| BelebeleRetrieval | 0.9495 | 0.9492 | -0.0003 |
| MLQARetrieval | 0.7329 | 0.7315 | -0.0014 |
| Media | 0.6851 | 0.6832 | -0.0019 |

Recuperacion de codigo (18 tareas, media):

| Conjunto | BF16 nDCG@10 | Este modelo | Delta |
|---|---|---|---|
| Media, 18 tareas | 0.7261 | 0.7241 | -0.0020 |
| Media, 14 tareas robustas a empates | 0.7916 | 0.7880 | -0.0035 |

Fidelidad de embedding por item (cosine frente a BF16, 2.000 items):

| Bucket | mediana | p5 | p1 | min |
|---|---|---|---|---|
| Ingles corto | 0.9871 | 0.9818 | 0.9806 | 0.9797 |
| Documentos largos | 0.9742 | 0.9689 | 0.9654 | 0.9280 |
| Multilingue | 0.9804 | 0.9739 | 0.9699 | 0.9656 |
| Codigo | 0.9797 | 0.9712 | 0.9643 | 0.9556 |

## Requisitos de hardware

- VRAM estimada: 18,42 GB de pesos en disco; con overhead de vLLM se sirve en una GPU de 24 GB.
- Contexto: 16.384 tokens con `--gpu-memory-utilization 0.90` y modo eager; 32.768 tokens con utilizacion 0.95.
- GPU recomendadas: RTX Pro 4000 Blackwell SFF (objetivo de diseno), RTX PRO 6000 Blackwell (validado con memoria limitada a 24 GB), H100 (probado con memoria limitada a 21,5 GiB).
- Cabe en GPU de consumo de 24 GB (RTX 4090, RTX 3090) con la configuracion indicada; no se confirma soporte en GPUs de 16 GB.
- Despliegue: vLLM 0.31.0 con `--runner pooling --convert embed`, pooler LAST con activacion, chunked prefill y `--max-num-batched-tokens 2048`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| IntezraInc/harrier-oss-v1-27b-W4A16-FP8edges | 8,9B (segun safetensors) | 32.768 | MIT | safetensors INT4+FP8 | Esta ficha; cosine p5 0,969 en docs largos |
| IntezraInc/harrier-oss-v1-27b-W4A16-g64-FP8mix | no disponible | no disponible | MIT | safetensors INT4 g64+FP8 | ~20,3 GB, cosine p5 0,987, menos margen de contexto |
| microsoft/harrier-oss-v1-27b (BF16) | no disponible | no disponible | MIT | safetensors BF16 | 54,0 GB, referencia de calidad |

No se dispone de datos de otros modelos de embeddings comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No cumple el umbral estricto de fidelidad por item del autor (cosine p5 >= 0,98 en todos los buckets): documentos largos queda en 0,969 y el peor item individual en 0,928.
- No debe mezclarse con indices generados en BF16: las diferencias por item degradan la comparabilidad. Para ese caso se recomienda la variante g64.
- Discrepancia entre el nombre comercial (27B) y los parametros reales en safetensors (8,9B); no aclarada en la informacion disponible.
- Es una cuantizacion no oficial, no afiliada ni respaldada por Microsoft.
- Modelo de embeddings: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de sesgo y alucinacion heredado del corpus de entrenamiento (web, codigo, datos multilingues); no se documentan evaluaciones de sesgo.
- El listado de idiomas no esta explicitado; la cobertura se infiere de las evaluaciones (12 idiomas en Belebele, 7 en MLQA).
- En tareas dominadas por empates (CodeTransOceanDL, CosQA, DS1000Retrieval, SyntheticText2SQL) los deltas no son significativos.
- SWEbenchCodeRetrieval muestra la mayor caida relativa (-0,0199), con nDCG@10 absoluto muy bajo en ambos casos (0,0672 frente a 0,0473).

## Enlaces

- Hugging Face: https://huggingface.co/IntezraInc/harrier-oss-v1-27b-W4A16-FP8edges
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-27b
- Variante g64: https://huggingface.co/IntezraInc/harrier-oss-v1-27b-W4A16-g64-FP8mix
