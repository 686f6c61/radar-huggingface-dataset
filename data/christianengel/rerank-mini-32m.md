# christianengel/rerank-mini-32m

## Resumen

rerank-mini-32m es un cross-encoder de reranking de 32 millones de parametros desarrollado por christianengel, disenado como sustituto directo (drop-in) de `cross-encoder/ms-marco-MiniLM-L6-v2`. Se construye sobre el encoder `jhu-clsp/ettin-encoder-32m` (arquitectura ModernBERT, licencia MIT) y se destila a partir de `Qwen/Qwen3-Reranker-8B` sobre 5,0 millones de pares `(query, passage)` estrictamente con licencias Apache-2.0/MIT. Su propuesta central es ofrecer una ventana de contexto de 8.192 tokens (frente a los 512 de MiniLM) manteniendo un tamano muy reducido y una licencia permisiva.

El modelo resuelve el problema de la segunda etapa de recuperacion en pipelines RAG: reordenar candidatos devueltos por un recuperador de primera fase (por ejemplo BM25) con mayor precision semantica. Frente a alternativas de mayor tamano como `bge-reranker-v2-m3` (568M) o `gte-reranker-modernbert-base` (149M), rerank-mini-32m alcanza entre el 98,7% y el 99,0% de su rendimiento global con una fraccion de los parametros y una latencia mucho menor.

Es relevante ahora porque combina tres factores poco habituales en un mismo artefacto: contexto largo (8K), licencia Apache-2.0 limpia en pesos y datos de entrenamiento, y despliegue en multiples formatos (PyTorch, ONNX FP32/FP16/INT8, GGUF y Transformers.js con WebGPU/WASM), lo que permite ejecutarlo tanto en servidor como en navegador o en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre ModernBERT (Ettin-encoder-32m), CLS pooling |
| Parametros totales | 32.031.361 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | FP32, FP16, INT8 (ONNX); F16 y Q8_0 (GGUF, 34,2 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe un par `(query, passage)` de forma conjunta y produce una puntuacion de relevancia, lo que permite modelar la interaccion entre ambos textos en lugar de comparar embeddings independientes. La base es `jhu-clsp/ettin-encoder-32m`, un encoder de 32M de parametros con arquitectura ModernBERT, que emplea atencion con soporte de contexto largo y pooling sobre el token CLS. La ventana de 8.192 tokens es la diferencia funcional clave frente a los rerankers clasicos de 512 tokens.

El entrenamiento se realizo por destilacion desde `Qwen/Qwen3-Reranker-8B` (Apache-2.0) sobre 5,0 millones de pares `(query, passage)` cuidadosamente filtrados para tener solo licencias Apache-2.0/MIT, lo que evita contaminacion de licencia en los pesos resultantes. Los shards de entrenamiento estan publicados en Hugging Face. No se detalla en la informacion disponible el uso de RLHF, DPO ni la composicion exacta del dataset mas alla del numero de pares y su procedencia licencial. Tampoco se especifica el numero total de tokens de entrenamiento ni detalles de la funcion de perdida de destilacion.

## Capacidades

- Reranking de pares `(query, passage)` con salida de una puntuacion de relevancia, orientado a la segunda etapa de pipelines de recuperacion.
- Manejo de contexto largo: hasta 8.192 tokens por par, lo que permite rerankear documentos completos o fragmentos extensos sin truncar.
- Buen rendimiento en dominios de codigo y tecnologia (CoSQA, CodeSearchNet-Python, StackOverflow-QA) segun los benchmarks publicados.
- Capacidad de reranking en contextos largos (MLDR-en, LongEmbed-2WikiMQA, LongEmbed-Needle).
- Despliegue en navegador mediante Transformers.js v4 con WebGPU/WASM.
- Integracion con `sentence-transformers`, `text-embeddings-inference` y endpoints compatibles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de clasificacion/ranking, no generativo.
- Multilingue: no disponible; el modelo declara solo ingles.

## Casos de uso

- Segunda etapa de RAG en produccion: reordenar los top-100 candidatos de BM25 o de un recuperador denso antes de pasarlos al LLM generador. Su contexto de 8K permite rerankear fragmentos largos sin truncar, y su throughput (3.072 pares/s en RTX 3090) lo hace viable para volumenes altos.
- Busqueda de codigo en repositorios: el modelo rinde especialmente bien en CodeSearchNet-Python (0,8746 NDCG@10) y StackOverflow-QA (0,8252), por lo que es adecuado para asistentes de busqueda semantica sobre bases de codigo y preguntas tecnicas.
- Reranking en el navegador o en el cliente: gracias a Transformers.js v4 con WebGPU/WASM y a los pesos GGUF de 34,2 MB (Q8_0), puede ejecutarse en un navegador para busquedas privadas sin enviar datos al servidor.
- Despliegue en CPU con presupuesto limitado: la version ONNX INT8 ofrece 93,3 pares/s en CPU de 4 hilos, suficiente para servicios de baja/media concurrencia donde no hay GPU disponible.
- Recuperacion sobre documentos largos: con 8K de contexto puede rerankear articulos, informes o hilos de documentacion completos, superando a MiniLM (512 tokens) en datasets como MLDR-en (0,7876 frente a 0,5715).
- Sustitucion directa de MiniLM-L6-v2: al ser un reemplazo de una linea, permite migrar pipelines existentes sin cambiar la interfaz, ganando contexto y precision (por ejemplo +11,41 puntos en el suite bloqueado de tres pilares).
- Filtrado de candidatos en motores de busqueda interna o atencion al cliente: reordenar respuestas candidatas de una base de conocimiento antes de mostrarlas o pasarlas a un agente.

## Benchmarks y rendimiento

Suite bloqueada de tres pilares (13 datasets, NDCG@10, candidatos BM25 fijos):

| Modelo | Licencia | Parametros | Ctx | BEIR (7) | Code (3) | Long >1K (3) | Overall | RTX 3090 (p/s) | CPU ONNX 4t (p/s) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BM25 (primera fase) | — | — | — | 0,4881 | 0,4603 | 0,7189 | 0,5558 | — | — |
| mxbai-rerank-xsmall-v1 | Apache-2.0 | 70,8M | 512 | 0,5634 | 0,4290 | 0,5221 | 0,5048 | 1.968 | — |
| ms-marco-MiniLM-L6-v2 | Apache-2.0 | 22,7M | 512 | 0,5914 | 0,5055 | 0,5392 | 0,5453 | 4.874 | 128,5 |
| ettin-reranker-32m-v1 | MIT | 32,0M | 8.192 | 0,6012 | 0,6347 | 0,5334 | 0,5898 | 2.876 | 85,4 |
| bge-reranker-v2-m3 | MIT | 568M | 8.192 | 0,6189 | 0,5267 | 0,7094 | 0,6183 | 769 | — |
| gte-reranker-modernbert-base | Apache-2.0 | 149M | 8.192 | 0,6257 | 0,6515 | 0,7275 | 0,6682 | 569 | — |
| rerank-mini-32m | Apache-2.0 | 32,0M | 8.192 | 0,6084 | 0,6486 | 0,7212 | 0,6594 | 3.072 | 93,3 |

BEIR completo (5 tareas, 2.321 consultas de test, 232.100 pares, NDCG@10):

| Modelo | Parametros | Ctx | SciFact | NFCorpus | FiQA2018 | TREC-COVID | SCIDOCS | Media BEIR | Tiempo (3090) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| BM25 | — | — | 0,6646 | 0,3116 | 0,2322 | 0,5662 | 0,1521 | 0,3853 | — |
| ms-marco-MiniLM-L6-v2 | 22,7M | 512 | 0,6784 | 0,3430 | 0,3375 | 0,6865 | 0,1648 | 0,4420 | 109,8 s |
| mxbai-rerank-xsmall-v1 | 70,8M | 512 | 0,6650 | 0,3205 | 0,3320 | 0,7793 | 0,1698 | 0,4533 | 331,5 s |
| ettin-reranker-32m-v1 | 32,0M | 8K | 0,7248 | 0,3271 | 0,3716 | 0,7171 | 0,1571 | 0,4595 | 224,0 s |
| gte-reranker-modernbert-base | 149M | 8K | 0,7119 | 0,2906 | 0,4037 | 0,7711 | 0,1908 | 0,4736 | 667,0 s |
| rerank-mini-32m | 32,0M | 8K | 0,7412 | 0,3368 | 0,3467 | 0,7441 | 0,1747 | 0,4687 | 191,0 s |

Datos clave: captura el 98,7% del rendimiento global de `gte-reranker-modernbert-base` (4,65 veces mayor) con 5,4 veces mas throughput en GPU; supera a `bge-reranker-v2-m3` (18 veces mayor) en 4,11 puntos con 4,0 veces mas velocidad; y supera a MiniLM-L6-v2 en 11,41 puntos en el suite bloqueado.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP16 para los 32M de parametros; el repo completo ocupa 0,5 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: RTX 3090 (3.072 pares/s en `short_100`), RTX 4090, A100 y H100 para maximizar throughput; cualquier GPU con al menos 1-2 GB de VRAM es suficiente.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1060 en adelante); tambien en CPU (93,3 pares/s en ONNX INT8 con 4 hilos) y en navegador via WebGPU/WASM.
- Opciones de despliegue: `sentence-transformers`, ONNX Runtime, llama.cpp (GGUF F16/Q8_0), Transformers.js v4, `text-embeddings-inference` y endpoints compatibles.
- Latencia y throughput: 3.072 pares/s en RTX 3090 (`short_100`) y 129 pares/s en `long_32`; 93,3 pares/s en CPU ONNX de 4 hilos. El tiempo de evaluacion BEIR completo en RTX 3090 es de 191,0 s, frente a 667,0 s de `gte-reranker-modernbert-base`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall (suite bloqueado) | Media BEIR | Licencia | Throughput 3090 |
|---|---:|---:|---:|---:|---|---:|
| rerank-mini-32m | 32,0M | 8.192 | 0,6594 | 0,4687 | Apache-2.0 | 3.072 p/s |
| ms-marco-MiniLM-L6-v2 | 22,7M | 512 | 0,5453 | 0,4420 | Apache-2.0 | 4.874 p/s |
| ettin-reranker-32m-v1 | 32,0M | 8.192 | 0,5898 | 0,4595 | MIT | 2.876 p/s |
| gte-reranker-modernbert-base | 149M | 8.192 | 0,6682 | 0,4736 | Apache-2.0 | 569 p/s |
| bge-reranker-v2-m3 | 568M | 8.192 | 0,6183 | no disponible | MIT | 769 p/s |

La comparativa muestra que rerank-mini-32m domina el eje precision/velocidad frente a modelos de mayor tamano: supera a MiniLM en precision pero es algo mas lento, y supera a gte-149m en velocidad (5,4 veces) cediendo solo un 1,3% de rendimiento global.

## Limitaciones y advertencias

- Solo ingles: el modelo declara `en` como unico idioma; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Es un modelo de ranking, no generativo: no soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si puede asignar puntuaciones altas a pasajes irrelevantes en dominios fuera de distribucion; conviene validar en el dominio objetivo.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al derivarse de destilacion de Qwen3-Reranker-8B, puede heredar sesgos del profesor y de los pares de entrenamiento.
- En contextos largos con coincidencia exacta de palabras clave (LongEmbed-2WikiMQA, LongEmbed-Needle), BM25 sigue siendo competitivo o superior; el modelo no domina todos los regimenes de recuperacion.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base (ettin-encoder-32m) es MIT y los datos de entrenamiento se declaran Apache-2.0/MIT; conviene verificar la cadena de licencias en despliegues comerciales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria extensa; los benchmarks son autoinformados por el autor.
- No se publican detalles sobre RLHF, DPO, composicion exacta del dataset ni numero total de tokens de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/christianengel/rerank-mini-32m
- Codigo y harness de evaluacion: https://github.com/protortyp/rerank-mini
- Demo en navegador (WebGPU): https://huggingface.co/spaces/christianengel/rerank-mini-32m-demo
- Shards de entrenamiento (5,0M pares): https://huggingface.co/datasets/christianengel/rerank-mini-distill-shards
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-Reranker-8B
