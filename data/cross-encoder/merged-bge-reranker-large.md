# cross-encoder/merged-bge-reranker-large

## Resumen

`cross-encoder/merged-bge-reranker-large` es un modelo cross-encoder para reranking de resultados de búsqueda, publicado por la organizacion cross-encoder en Hugging Face. No es un modelo entrenado desde cero: se trata de una fusion lineal 50/50 de los pesos de `BAAI/bge-reranker-large` y `BAAI/bge-reranker-v2-m3`, realizada con el metodo `CrossEncoder.merge` de la libreria sentence-transformers, sin entrenamiento adicional. El modelo recibe un par consulta-documento y devuelve un logit de relevancia; cuanto mayor es el valor, mas relevante es el documento para la consulta.

La relevancia practica del modelo es limitada pero concreta: segun la model card, supera la media de sus dos progenitores en 7 de los 11 conjuntos de NanoBEIR y alcanza un nDCG@10 medio de 0,6981 frente a 0,6705 de BGE-reranker-large y 0,6929 de BGE-reranker-v2-m3. Es, por tanto, una alternativa de reranking en ingles con licencia Apache-2.0 que hereda el backbone XLM-RoBERTa de sus padres y un limite conjunto de 512 tokens por par consulta-documento.

El modelo tiene 559.891.457 parametros (unos 560 millones), un unico score de salida y esta pensado para la segunda fase de pipelines de recuperacion de informacion: rerankear los candidatos devueltos por un retriever como BM25 o un modelo de embeddings denso. Su interes actual reside en que demuestra que una fusion de pesos sin entrenamiento puede igualar o superar ligeramente a los modelos originales en varios dominios, con un coste de implementacion minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CrossEncoder sobre XLM-RoBERTa (`XLMRobertaForSequenceClassification`), tarea sequence-classification |
| Parametros totales | 559.891.457 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens por par consulta-documento (limite conjunto) |
| Tipos de cuantizacion | no disponible (la model card solo documenta inferencia en FP32) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 (el progenitor BGE-reranker-large es MIT; BGE-reranker-v2-m3 es Apache-2.0) |
| Formato de pesos | safetensors (libreria sentence-transformers); tamano del repo 2,3 GB |
| Dimension de salida | 1 score (logit de relevancia) |
| Funcion de scoring | Relevance Logit |
| Modalidad | texto |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en un backbone transformer XLM-RoBERTa con una cabeza de clasificacion para sequence-classification que produce un unico logit. A diferencia de un bi-encoder, que codifica consulta y documento por separado, el cross-encoder procesa el par de forma conjunta, lo que permite capturar interacciones token a token entre consulta y documento a cambio de un coste de inferencia proporcional al numero de pares a puntuar.

No hubo entrenamiento: la creacion consistio en fusionar en FP32, con pesos iguales (50/50), el backbone completo y la cabeza de clasificacion de ambos progenitores. Antes de la fusion, la tabla de embeddings posicionales y los buffers asociados de BGE-reranker-v2-m3 se recortaron de 8194 a 514 filas para cubrir el limite conjunto de 512 tokens, recorte que preserva los logits de M3 en ese limite. El M3 original soporta entradas de 8192 tokens, pero la fusion se evalua y se distribuye con el limite de 512. La innovacion tecnica, por tanto, no esta en el entrenamiento (no hay RLHF ni DPO) sino en el procedimiento de model merging: una media lineal de pesos que, segun el autor, supera la media de los padres en 7 de 11 datasets de NanoBEIR y supera a ambos en 2 de ellos.

## Capacidades

- Reranking de resultados de busqueda: puntua pares consulta-documento y devuelve un logit de relevancia utilizable para reordenar candidatos.
- Scoring de relevancia en una sola pasada por par, sin generacion de texto.
- Integracion nativa con sentence-transformers mediante `CrossEncoder`.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- Uso como segunda etapa en pipelines retrieve-and-rerank sobre candidatos de BM25 o recuperacion densa.
- Capacidad multilingue: no disponible; la model card declara unicamente ingles.
- Tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes o razonamiento multi-step: no disponible (no es un modelo generativo).
- Vision, audio o modos especiales (thinking): no disponibles.

## Casos de uso

- Reranking en motores de busqueda documental: se recuperan los 100 mejores candidatos con BM25 y se reordenan con el cross-encoder; el protocolo de evaluacion del autor usa exactamente este esquema (top-100 de BM25 congelado mas positivos), lo que lo hace directamente aplicable a buscadores corporativos en ingles.
- Sistemas RAG en ingles: tras la recuperacion densa, el modelo puntua cada fragmento frente a la pregunta del usuario y descarta los de menor logit antes de pasarlos al LLM generador, reduciendo contexto irrelevante en la ventana del modelo generativo.
- Busqueda en soporte tecnico y bases de conocimiento: con 512 tokens conjuntos por par encaja bien en articulos y FAQ de longitud media; el nDCG@10 de 0,9326 en quoraretrieval y 0,9425 en fever sugiere buen comportamiento en preguntas factuales y de verificacion.
- Filtrado de duplicados y seleccion de evidencia en pipelines de QA: puntuar pares pregunta-pasaje para elegir la evidencia mas relevante en tareas de reading comprehension extractiva en ingles.
- Reordenacion de resultados en comercio electronico o catalogos en ingles: pares consulta-producto con descripciones cortas, donde el limite de 512 tokens no supone restriccion.
- Evaluacion y benchmarking de retrievers: usar el modelo como juez de relevancia para comparar recuperadores o para construir conjuntos de evaluacion con nDCG@10 sobre NanoBEIR-en.
- Segunda etapa en pipelines de busqueda federada: al ser un cross-encoder de 560 M de parametros, puede desplegarse en CPU o GPU modesta para rerankear decenas de candidatos por consulta con latencia contenida.

## Benchmarks y rendimiento

Resultados de nDCG@10 sobre NanoBEIR-en (11 datasets, protocolo `CrossEncoderNanoBEIREvaluator`, top-100 de BM25 congelado mas positivos, maximo 512 tokens conjuntos, FP32 con atencion SDPA y logits crudos):

| Dataset | merged-bge-reranker-large | BGE-reranker-large | BGE-reranker-v2-m3 |
|---|---|---|---|
| msmarco | 0,702798 | 0,708274 | 0,686683 |
| nq | 0,775433 | 0,517611 | 0,780807 |
| fiqa2018 | 0,577971 | 0,512348 | 0,586117 |
| nfcorpus | 0,388690 | 0,425460 | 0,387621 |
| scidocs | 0,415029 | 0,381989 | 0,391821 |
| dbpedia | 0,743545 | 0,712892 | 0,711882 |
| quoraretrieval | 0,932649 | 0,869035 | 0,975003 |
| climatefever | 0,453822 | 0,523998 | 0,434706 |
| fever | 0,942481 | 0,956722 | 0,944993 |
| hotpotqa | 0,967206 | 0,967804 | 0,967523 |
| scifact | 0,779089 | 0,799382 | 0,754452 |
| **media** | **0,698065** | **0,670501** | **0,692874** |

Segun el autor, el modelo supera la media de sus dos progenitores en 7 de los 11 datasets y supera a ambos en 2. En los siete datasets evaluados tras la seleccion de candidatos, la fusion obtiene 0,6919 frente a 0,6911 de BGE-reranker-large y 0,6876 de M3; el autor senala que esta ganancia adicional es pequena y que los intervalos de confianza bootstrap por consulta frente a ambos progenitores incluyen el cero. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no procede inventarlos dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene unos 560 M de parametros; en FP32 ocupa aproximadamente 2,2 GB de pesos, en FP16 unos 1,1 GB y en INT8 unos 0,56 GB, a lo que hay que sumar memoria para activaciones y el par consulta-documento (512 tokens conjuntos). Cifras orientativas calculadas a partir del numero de parametros; la model card solo documenta FP32.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para lotes pequenos; una RTX 4090, A100 o H100 permiten lotes grandes y mayor throughput, aunque el modelo es pequeno y no las requiere.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) e incluso en CPU para volumenes moderados.
- Opciones de despliegue: sentence-transformers (`CrossEncoder`), Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles. No hay informacion sobre soporte en llama.cpp, Ollama o TGI en la documentacion proporcionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | nDCG@10 medio (NanoBEIR-en) | Licencia | Idiomas |
|---|---|---|---|---|---|
| merged-bge-reranker-large | 559.891.457 | 512 tokens por par | 0,698065 | Apache-2.0 | ingles |
| BAAI/bge-reranker-large | no disponible en la informacion | 512 tokens por par (evaluado a ese limite) | 0,670501 | MIT | no disponible en la informacion |
| BAAI/bge-reranker-v2-m3 | no disponible en la informacion | 8192 tokens en el modelo original; evaluado a 512 | 0,692874 | Apache-2.0 | no disponible en la informacion |

La comparativa se limita a los dos progenitores porque son los unicos modelos con datos de rendimiento en la informacion disponible. El modelo fusionado ofrece la mejor media global de los tres, con ventajas claras en nq, scidocs, dbpedia y quoraretrieval, pero pierde frente a BGE-reranker-large en msmarco, nfcorpus, climatefever, fever, hotpotqa y scifact, y frente a M3 en nq, fiqa2018 y quoraretrieval. No hay datos de parametros ni de idiomas de los progenitores en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; su uso en otros idiomas no esta validado.
- Limite de 512 tokens conjuntos por par consulta-documento, muy por debajo de los 8192 tokens que soporta BGE-reranker-v2-m3 en su version original; documentos largos requieren troceado.
- El modelo no es generativo: no produce texto, no soporta tool calling ni razonamiento multi-step, y no debe usarse como LLM.
- La mejora sobre los progenitores es pequena y estadisticamente fragil: el autor reconoce que los intervalos bootstrap por consulta frente a ambos padres incluyen el cero en los siete datasets adicionales, por lo que no puede afirmarse una superioridad robusta.
- El rendimiento es heterogeneo por dominio: pierde de forma notable en nfcorpus (0,3887 frente a 0,4255 de BGE-reranker-large) y climatefever (0,4538 frente a 0,5240), lo que desaconseja su uso indiscriminado en dominios cientificos o de verificacion climatica.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el score de relevancia puede ser poco calibrado entre consultas y dominios; los logits crudos no son probabilidades.
- Licencia Apache-2.0 permite uso comercial, pero el progenitor BGE-reranker-large es MIT y BGE-reranker-v2-m3 es Apache-2.0; conviene verificar las condiciones de ambos si se redistribuye el modelo fusionado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en noviembre de 2026; es un artefacto reciente y sin validacion independiente por parte de la comunidad.
- No hay informacion sobre cuantizaciones oficiales ni sobre latencia o throughput medidos, lo que limita la planificacion de capacidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cross-encoder/merged-bge-reranker-large
- Modelo progenitor BGE-reranker-large: https://huggingface.co/BAAI/bge-reranker-large
- Modelo progenitor BGE-reranker-v2-m3: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Documentacion de Sentence Transformers: https://sbert.net
- Documentacion de CrossEncoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Referencia de `CrossEncoder.merge`: https://www.sbert.net/docs/package_reference/cross_encoder/model.html#sentence_transformers.cross_encoder.model.CrossEncoder.merge
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Dataset NanoBEIR-en: https://huggingface.co/datasets/sentence-transformers/NanoBEIR-en
- Paper referenciado en los tags (arXiv:2312.15503): https://arxiv.org/abs/2312.15503
- Paper referenciado en los tags (arXiv:2402.03216): https://arxiv.org/abs/2402.03216
