# Athithya117/dinghy-law-0.6b-v1-openvino-fp16

## Resumen

`Athithya117/dinghy-law-0.6b-v1-openvino-fp16` es la exportación a OpenVINO IR en FP16 del modelo de embeddings legales `Hanno-Labs/dinghy-law-0.6b-v1`, un encoder de 0,6 mil millones de parámetros especializado en recuperación de pasajes jurídicos. No es un modelo generativo: produce embeddings densos de 1024 dimensiones con una longitud máxima de secuencia de 8192 tokens, pensados para tareas de búsqueda semántica, recuperación (retrieval) y ranking sobre corpus legales. Lo publica el usuario Athithya117 como artefacto derivado del modelo base de Hanno Labs, bajo licencia Apache-2.0.

El interés de esta ficha está en que el artefacto no es un modelo nuevo, sino un empaquetado optimizado para inferencia en CPU con el runtime OpenVINO de Intel. El autor documenta una validación de pérdida nula frente a la referencia PyTorch FP32 (coseno mínimo de 1.0000000 en queries, error absoluto máximo de 6.45e-06) y una reducción del peso de los pesos de aproximadamente 2273 MB a 1136 MB. La contrapartida es que, según sus propias mediciones, el FP16 no aporta ganancia de throughput en el plugin CPU de OpenVINO: la relación medida es de 1.004×, prácticamente idéntica.

Es relevante ahora porque los modelos de embeddings legales de tamaño medio están encontrando uso en pipelines RAG sobre documentación jurídica, y disponer de un IR autocontenido con metadatos de Sentence-Transformers listo para CPU abarata el despliegue en entornos sin GPU. Conviene subrayar que el repositorio no incluye evaluación de calidad jurídica: la validación es un smoke test sintético de 4 queries y 14 pasajes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de Qwen3, segun tag `qwen3`) |
| Parametros totales | 0,6B (aproximadamente, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | FP16 (sin cuantizacion adicional); referencia FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` + `openvino_model.bin`), safetensors para el modulo Dense, tokenizer.json |

## Arquitectura y entrenamiento

El artefacto es un encoder transformer de tipo Qwen3 (segun el tag del repositorio) con 0,6B parametros, exportado a OpenVINO IR con pesos del encoder en FP16. El IR contiene exclusivamente el encoder; el pooling de ultimo token (`1_Pooling`), la proyeccion Dense a 1024 dimensiones (`2_Dense`) y la normalizacion L2 (`3_Normalize`) permanecen en la pipeline de Sentence-Transformers y se almacenan en FP32. Esta separacion permite sustituir la estrategia de pooling o anadir una proyeccion estilo Matryoshka sin reexportar el encoder.

No se dispone de informacion sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. El modelo base es `Hanno-Labs/dinghy-law-0.6b-v1` en la revision `080ba18e73c85ce8a513241b011b867174883175`. La unica innovacion tecnica documentada es el propio proceso de exportacion: el autor verifica paridad de tokenizer y de prompts, y reporta que los pesos del transformer son FP16 en un 99,999976 %. La validacion se ejecuto con Python 3.14.4, PyTorch 2.15.0+cpu, Sentence-Transformers 6.2.0, Transformers 5.5.4, OpenVINO 2026.4.1 y Optimum Intel 2.2.0 sobre Linux x86_64.

## Capacidades

- Generacion de embeddings densos de 1024 dimensiones para texto juridico, con pooling de ultimo token y normalizacion L2.
- Recuperacion semantica query-documento: el modelo aplica un prefijo de instruccion a la query (`Instruct: Given a web search query, retrieve relevant passages that answer the query\nQuery: <texto>`) y ningun prefijo a los documentos.
- Soporte de secuencias de hasta 8192 tokens, adecuado para pasajes legales largos (clausulas, articulos, sentencias).
- API diferenciada `encode_query()` y `encode_document()` en Sentence-Transformers, que aplica el prefijo automaticamente.
- Inferencia en CPU mediante el backend OpenVINO de Sentence-Transformers (requiere `sentence-transformers>=6.0`).
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking: es un modelo de embeddings, no un LLM generativo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Busqueda semantica sobre jurisprudencia: indexar sentencias y articulos como documentos y recuperar los pasajes relevantes para una consulta en lenguaje natural, aprovechando la ventana de 8192 tokens para pasajes largos.
- Pipeline RAG para asistentes legales: usar los embeddings como etapa de retrieval previa a un LLM generativo, de modo que el generador reciba solo los fragmentos pertinentes y se reduzca el riesgo de alucinacion sobre normativa.
- Motor de busqueda interno en despachos: desplegar el IR en servidores CPU sin GPU, con un footprint de pesos de aproximadamente 1136 MB, para consultas sobre bases documentales privadas.
- Deduplicacion y clustering de documentos legales: generar embeddings de contratos o clausulas y agrupar por similitud coseno para detectar duplicados o plantillas recurrentes.
- Clasificacion y enrutamiento de consultas: comparar el embedding de una consulta entrante contra embeddings de categorias (laboral, penal, civil) para dirigirla al area correspondiente.
- Evaluacion de similitud entre clausulas: comparar redacciones alternativas de una misma clausula para detectar cambios materiales en procesos de revision contractual.
- Despliegue en entornos con restricciones de hardware: al ser un IR autocontenido con metadatos de Sentence-Transformers, se integra en contenedores CPU sin dependencia de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, MTEB, etc.) en la informacion disponible. El autor solo reporta una validacion de paridad frente a la referencia PyTorch FP32 sobre un fixture sintetico de 4 queries y 14 pasajes, que no constituye una evaluacion de calidad juridica:

| Comprobacion | Resultado |
|---|---|
| Coseno de queries — min / media / p05 | 1.0000000 / 1.0000000 / 1.0000000 |
| Error absoluto maximo en queries | 6.45e-06 |
| Coseno de documentos — min / media / p05 | 0.99999958 / 1.0000000 / 0.99999982 |
| Error absoluto maximo en documentos | 1.02e-04 |
| Recall@1, Recall@5, MRR | identicos a PyTorch FP32 |
| Acuerdo top-1 / Jaccard@5 | 1.000 / 1.000 |
| Caida de MRR | 0.0 |
| Paridad de tokenizer y prompts | PASS |

Rendimiento medido en un AMD Ryzen 7 5700U (8 hilos, AVX2, sin AVX-512 ni VNNI), 4 queries y 15 pasajes por ejecucion, mediana de 2 ejecuciones tras warm-up:

| Runtime | Throughput |
|---|---|
| PyTorch FP32 | 1,1946 filas/s |
| OpenVINO FP16 | 1,1992 filas/s |
| Ratio | 1,004× |

## Requisitos de hardware

- VRAM: no aplica en el caso de uso principal; el artefacto esta pensado para CPU. En GPU, el encoder FP16 ocupa aproximadamente 1136 MB de pesos, mas overhead de activaciones.
- GPU recomendadas: no disponibles en la informacion proporcionada; el autor no documenta ejecucion en GPU.
- CPU de referencia validada: AMD Ryzen 7 5700U (8 hilos, AVX2, sin AVX-512 ni VNNI). No se documenta rendimiento en CPUs con AVX-512 o VNNI.
- Cabe en hardware consumer: si, en CPU consumer; el peso del IR es de aproximadamente 1136 MB.
- Opciones de despliegue: backend OpenVINO de Sentence-Transformers (`SentenceTransformer(..., backend="openvino")`). El autor advierte de que no debe cargarse mediante `openvino.Core().read_model()`, porque el IR solo devuelve `last_hidden_state` y la pipeline aplica pooling, Dense y normalizacion en FP32.
- Latencia y throughput: 1,1992 filas/s en el hardware de referencia con 4 queries y 15 pasajes; el autor senala que FP16 no mejora el throughput en el plugin CPU de OpenVINO y recomienda comparar OpenVINO FP32 frente a ONNX Runtime FP32 en el hardware objetivo.
- Requisito de version: `sentence-transformers>=6.0`; versiones antiguas que esperan `vocab.txt` / `merges.txt` separados no cargaran el repositorio.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de modelos alternativos. Se indica a continuacion lo que puede compararse con los datos disponibles:

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Formato |
|---|---|---|---|---|---|
| dinghy-law-0.6b-v1-openvino-fp16 (este) | 0,6B | 8192 | 1024 | Apache-2.0 | OpenVINO IR FP16 |
| Hanno-Labs/dinghy-law-0.6b-v1 (base) | 0,6B | 8192 | 1024 | Apache-2.0 | PyTorch (safetensors) |
| Alternativas de embeddings legales | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona de forma autonoma y no soporta tool calling ni agentes. Solo genera embeddings.
- La validacion publicada es un smoke test sintetico de 4 queries y 14 pasajes; no hay evaluacion de calidad juridica ni resultados en MTEB ni en benchmarks de retrieval legal.
- No se documentan los idiomas soportados; se desconoce si cubre exclusivamente ingles o si generaliza a castellano y otras lenguas.
- FP16 no aporta mejora de throughput en el plugin CPU de OpenVINO segun las mediciones del autor; el beneficio es de footprint y de accuracy sin cuantizacion, no de latencia.
- El IR contiene solo el encoder; cargarlo directamente con `openvino.Core().read_model()` omite pooling, Dense y normalizacion, lo que invalida los embeddings.
- Requiere `sentence-transformers>=6.0` y el tokenizer unificado `tokenizer.json`; entornos con versiones anteriores fallaran al cargar.
- Riesgo de alucinacion: no aplica a la generacion de texto, pero en un pipeline RAG los embeddings no garantizan que el pasaje recuperado sea juridicamente correcto; la verificacion corresponde a la etapa generativa y a la revision humana.
- Sesgos conocidos: no documentados en la informacion disponible.
- Uso comercial: permitido bajo Apache-2.0, licencia heredada del modelo base, con las obligaciones habituales de atribucion y aviso de licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es el desarrollador original del modelo base; conviene verificar la procedencia antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Athithya117/dinghy-law-0.6b-v1-openvino-fp16
- Modelo base: https://huggingface.co/Hanno-Labs/dinghy-law-0.6b-v1
- Revision resuelta del modelo base: `080ba18e73c85ce8a513241b011b867174883175`
- Ficheros de validacion y procedencia en el repositorio: `openvino_fp16_validation.json`, `openvino_fp16_manifest.json`
- Documentacion de OpenVINO: no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
