# ElytronSystems/Nemotron-3.5-Rerank-pulsar-k4

## Resumen

Nemotron-3.5-Rerank-pulsar-k4 es un contenedor de inferencia listo para servir que empaqueta el tronco de texto del reranker NVIDIA Nemotron 3.5 Rerank 8B, cuantizado a EXL3 de 4.0 bits por peso. Lo publica ElytronSystems, autor independiente, y esta pensado para su motor de inferencia propio, pulsar, orientado a GPUs Turing (sm_75) y posteriores. El modelo resuelve la segunda fase del pipeline de recuperacion de informacion: dado un par consulta-documento, produce una puntuacion de relevancia que permite reordenar los resultados de una busqueda hibrida previa.

La relevancia practica esta en el empaquetado: reduce un reranker de 8.380 millones de parametros a 4,8 GB en disco y unos 5,7 GB de VRAM, lo que permite ejecutarlo en tarjetas de consumo o profesionales de gama media-alta. El contenedor omite la torre de vision y el proyector multimodal del modelo original, por lo que solo procesa texto. La cabeza de puntuacion, los embeddings de tokens y las normas se conservan en BF16 tal como los distribuye NVIDIA.

El modelo base es NVIDIA Nemotron 3.5 Rerank 8B BF16, presentado el 21 de octubre de 2026 dentro de la coleccion Nemotron Retriever, cuyo linaje se remonta a Ministral-3-8B-Instruct-2512 (Apache-2.0). La licencia del contenedor es OpenMDW-1.1, la misma que aplica NVIDIA al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Mistral 3) con cabeza de puntuacion para ranking; tronco de texto cuantizado a EXL3 |
| Parametros totales | 7.950 millones en el contenedor (8.380 millones en el modelo NVIDIA original, que incluye partes de vision omitidas aqui) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens por par consulta-documento |
| Tipos de cuantizacion | EXL3 4.0 bpw en los lineales del decoder; BF16 en cabeza de puntuacion, embeddings y normas |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (modelo base Ministral-3 bajo Apache-2.0) |
| Formato de pesos | safetensors repackados en el contenedor propietario de pulsar (custom_code); calibracion EXL3 con exllamav3 1.6.4, codebook `mul1`, 250 x 2048 filas |

## Arquitectura y entrenamiento

El contenedor conserva la arquitectura del reranker de NVIDIA: un transformer decoder derivado de Ministral-3-8B-Instruct-2512 al que se anade una cabeza de puntuacion que emite un logit por par consulta-documento. La salida se expone como `relevance_score`, que es la sigmoid de ese logit; con `raw_scores: true` se devuelve el logit sin transformar. Los lineales de atencion (q/k/v/o) y del MLP (gate/up/down) estan cuantizados a EXL3 de 4.0 bpw, mientras que la cabeza, los embeddings y las normas permanecen en BF16.

No se dispone de informacion sobre el volumen o la composicion del dataset de entrenamiento, ni sobre si NVIDIA aplico RLHF, DPO u otras tecnicas de alineacion en el modelo base. La innovacion tecnica documentada es el proceso de cuantizacion: calibracion con 250 filas de 2048 tokens mediante exllamav3 1.6.4 y repackado byte a byte en el contenedor de pulsar, con sumas SHA256 para verificar la integridad de los ficheros. El autor reporta que, sobre 17 pares consulta-documento de hasta 5.100 tokens, la diferencia maxima de puntuacion frente a los mismos pesos EXL3 en f32 sobre CPU es de 0,0029, y frente al modelo BF16 original en f32 oscila entre -0,006 y +0,032, sin cambios en el orden de los documentos.

## Capacidades

- Reranking de pares consulta-documento con salida de puntuacion de relevancia y ordenacion de mejor a peor.
- API compatible con el esquema Cohere / Jina mediante `POST /v1/rerank`, con parametros `query`, `documents` y `top_n`.
- Procesamiento de pares de hasta 16.384 tokens, adecuado para pasajes largos o documentos completos.
- Puntuacion calibrada mediante sigmoid sobre el logit de la cabeza, con opcion de obtener el logit crudo.
- Integracion en pipelines de recuperacion en dos fases (busqueda hibrida seguida de reranking).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Sin soporte de vision, tool calling ni modo de razonamiento explicito: es un modelo especializado en ranking de texto.

## Casos de uso

- Reranking en busqueda empresarial: tras una busqueda hibrida (BM25 mas embeddings), el modelo reordena los mejores candidatos. El autor reporta una subida del MRR de documentos de 0,80 a 0,93 al reordenar los 30 mejores resultados sobre un conjunto interno de 22 preguntas.
- Sistemas RAG para agentes: como segunda etapa del pipeline de recuperacion, filtra y ordena los fragmentos que se inyectan en el contexto del LLM generador, reduciendo ruido y coste de tokens.
- Atencion al cliente con base de conocimiento: permite seleccionar los articulos mas relevantes ante consultas de usuarios en conversaciones multi-turno, con pares de hasta 16.384 tokens que cubren documentacion extensa.
- Busqueda documental juridica o tecnica: la ventana de 16.384 tokens permite puntuar pasajes largos sin truncarlos, util en contratos, normativas o manuales.
- Despliegue en hardware modesto: con 5,7 GB de VRAM cabe en GPUs Turing como la Quadro RTX 5000; el autor ejecuta simultaneamente los contenedores Embed-8B, Parse y Rerank en una sola tarjeta de 16 GB (12,6 GB ocupados).
- Filtrado de candidatos en motores de recomendacion de contenido textual: reordenar articulos, FAQ o entradas de soporte segun su relevancia respecto a una consulta o perfil.
- Evaluacion offline de calidad de recuperacion: generar puntuaciones de relevancia para calcular MRR, nDCG o precision en conjuntos de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible; el modelo es un reranker y el autor solo reporta metricas de fidelidad de cuantizacion y de recuperacion:

| Metrica | Resultado |
|---|---|
| Diferencia maxima frente a EXL3 en f32 (CPU), 17 pares de hasta 5.100 tokens | 0,0029 |
| Diferencia frente al BF16 original en f32 | -0,006 a +0,032 |
| Cambio en el orden de documentos | ninguno |
| MRR de documentos con reranking de los 30 mejores resultados hibridos | 0,80 a 0,93 (22 preguntas) |

## Requisitos de hardware

- VRAM estimada: unos 5,7 GB en GPU; 4,8 GB de repo en disco.
- GPUs validadas: Quadro RTX 5000 (Turing, sm_75); el autor indica que solo lo ha servido en Turing.
- Compilacion: `make pulsar-server CUDA_ARCH=sm_75` desde la rama `dev` de pulsar (commit 5139ba62 o posterior).
- Cabe en GPUs de consumo con 8 GB o mas de VRAM; en tarjetas de 16 GB convive con Embed-8B y Parse en un mismo proceso pulsar.
- Opciones de despliegue: exclusivamente el motor pulsar (`pulsar-server`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / motor |
|---|---|---|---|---|---|
| Nemotron-3.5-Rerank-pulsar-k4 (este) | 7,95B (texto) | 16.384 tokens por par | EXL3 4.0 bpw | OpenMDW-1.1 | Contenedor pulsar |
| nvidia/Nemotron-3.5-Rerank-8B-BF16 | 8,38B (incluye vision) | no disponible | BF16 | OpenMDW-1.1 | safetensors |
| ElytronSystems/Nemotron-3.5-Embed-pulsar-k4 | no disponible | no disponible | EXL3 4.0 bpw | no disponible | Contenedor pulsar |

La comparacion con alternativas de otros fabricantes (por ejemplo, rerankers de Cohere o Jina) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de vision y el proyector multimodal del modelo NVIDIA no estan incluidos, por lo que no puede puntuar imagenes o documentos escaneados sin un paso OCR previo.
- Escala de puntuaciones baja: el autor advierte que los pasajes relevantes puntuan entre 0,06 y 0,17 y los irrelevantes alrededor de 0,02; umbrales calibrados para otros rerankers (por ejemplo, 0,1) descartan resultados validos.
- Soporte limitado de hardware y motor: solo se ha servido en GPUs Turing con el motor pulsar, lo que reduce la portabilidad frente a formatos GGUF o safetensors estandar.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la cabeza de puntuacion puede asignar relevancia alta a documentos lexicalmente similares pero semanticamente incorrectos; conviene validar umbrales con datos propios.
- Idiomas soportados no documentados; el rendimiento fuera del ingles no esta verificado en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Licencia OpenMDW-1.1: aunque permite uso comercial, impone condiciones propias distintas de Apache-2.0; conviene revisar el texto completo antes de un despliegue en produccion. El modelo base Ministral-3 es Apache-2.0, pero el reranker de NVIDIA se distribuye bajo OpenMDW-1.1.
- Conjunto de evaluacion pequeno (22 preguntas, 17 pares): las metricas de calidad deben tomarse como indicativas, no como garantia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ElytronSystems/Nemotron-3.5-Rerank-pulsar-k4
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16
- Contenedor Embed asociado: https://huggingface.co/ElytronSystems/Nemotron-3.5-Embed-pulsar-k4
- Contenedor Parse asociado: https://huggingface.co/ElytronSystems/Nemotron-3.5-Parse-pulsar-f16
- Motor pulsar: https://github.com/tylerwagler/pulsar
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Modelo Ministral-3-8B-Instruct-2512: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Blog de NVIDIA sobre Nemotron Retriever: https://huggingface.co/blog/nvidia/nemotron-retriever-world-class-agentic-retrieval
- Cobertura de Unite.AI: https://www.unite.ai/nvidia-debuts-open-nemotron-3-5-models-for-embedding-reranking-parsing/
