# AdrianTheLegend/mnli-bert-cased

## Resumen

mnli-bert-cased es un modelo de embeddings de frases (sentence transformer) desarrollado por el usuario AdrianTheLegend y publicado en Hugging Face. Se construye a partir de un ajuste fino de google-bert/bert-base-cased sobre el conjunto de datos SetFit/mnli, un subconjunto de 50.000 muestras del corpus Multi-Genre Natural Language Inference (MNLI). El resultado es un encoder que proyecta frases y parrafos a un espacio vectorial denso de 768 dimensiones, pensado para tareas de similitud semantica, busqueda semantica, mineria de parafrasis, clasificacion y clustering.

La relevancia de este modelo es acotada y practica: ofrece un encoder BERT clasico, bien conocido y ampliamente soportado por el ecosistema (sentence-transformers, text-embeddings-inference y endpoints compatibles), entrenado con la funcion de perdida MultipleNegativesRankingLoss sobre pares de frases del corpus MNLI. No incorpora innovaciones arquitectonicas recientes ni un entrenamiento a gran escala; es una pieza de infraestructura para recuperacion densa en ingles, con una ventana maxima de 512 tokens.

El modelo tiene un tamano de repositorio de 0,4 GB, no registra descargas ni interacciones en el momento de la consulta y no declara licencia ni idiomas en su model card. Su utilidad principal reside en servir como baseline o componente de recuperacion en pipelines RAG y sistemas de similitud textual en ingles, siempre que se asuma la ausencia de garantias formales de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BertModel) con capa de pooling; SentenceTransformer |
| Parametros totales | no disponible (modelo base bert-base-cased, aproximadamente 110 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (formato de pesos compatible con cuantizacion estandar de transformers, pero no declarada) |
| Idiomas soportados | no disponible (el corpus MNLI es predominantemente en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de sentence-transformers; no se declara GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un SentenceTransformer compuesto por dos modulos: un Transformer de tipo BertModel configurado para feature-extraction, que devuelve el last_hidden_state, y una capa de Pooling con pooling_mode mean y embedding_dimension de 768. La similitud entre embeddings se calcula mediante similitud coseno. El modelo base es google-bert/bert-base-cased, un encoder BERT con casing sensible a mayusculas y minusculas.

El ajuste fino se realizo sobre el dataset SetFit/mnli, con 50.000 muestras de entrenamiento y columnas text1, text2 y label. La funcion de perdida empleada es MultipleNegativesRankingLoss, tipica del entrenamiento de encoders densos para recuperacion, que trata las negativas del propio batch como ejemplos negativos. No se documenta el numero total de tokens de entrenamiento, la composicion completa del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en un encoder de similitud). No se declaran innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de embeddings de frases y parrafos en un espacio denso de 768 dimensiones.
- Similitud semantica textual (semantic textual similarity) mediante similitud coseno.
- Busqueda semantica y recuperacion densa de documentos.
- Mineria de parafrasis (paraphrase mining).
- Clasificacion de textos basada en embeddings.
- Clustering y agrupamiento semantico de textos.
- Extraccion de caracteristicas (feature extraction) para pipelines posteriores.
- Compatibilidad con text-embeddings-inference y endpoints compatibles con el ecosistema Hugging Face.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es exclusivamente un encoder de texto.
- Capacidades multilingues no declaradas; el corpus de entrenamiento MNLI es fundamentalmente en ingles.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar fragmentos de documentacion en ingles y recuperar los mas relevantes para una consulta mediante similitud coseno sobre embeddings de 768 dimensiones, con fragmentos de hasta 512 tokens.
- Recuperacion en pipelines RAG: usar el modelo como retriever denso para seleccionar pasajes de una base de conocimiento antes de pasarlos a un modelo generativo, aprovechando su integracion con sentence-transformers y text-embeddings-inference.
- Deduplicacion de registros y catalogos: calcular embeddings de titulos o descripciones y agrupar entradas con similitud alta para eliminar duplicados en bases de datos de productos o articulos.
- Clustering de tickets de soporte: agrupar incidencias por similitud semantica para identificar temas recurrentes y priorizar la cola de atencion, sin necesidad de etiquetas previas.
- Mineria de parafrasis en corpus: detectar frases equivalentes en distintos documentos para consolidar informacion o detectar repeticiones en bases de conocimiento.
- Clasificacion de textos por similitud a prototipos: construir embeddings de referencia por categoria y asignar etiquetas a nuevos textos segun su cercania, util en moderacion o triaje de contenidos en ingles.
- Evaluacion de similitud en tareas de NLI: aprovechar el entrenamiento sobre MNLI para medir la relacion semantica entre pares de frases en tareas de inferencia textual o comparacion de afirmaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base bert-base-cased ronda los 110 millones de parametros; en precision FP32 ocupa aproximadamente 0,4-0,5 GB de pesos, y en FP16 alrededor de 0,2-0,25 GB, mas overhead de activaciones y batch.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para lotes pequenos; A100, H100 o L4 para alto throughput en produccion; RTX 3090, RTX 4090 o RTX 4060 Ti para despliegue en estaciones de trabajo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) con lotes moderados.
- Opciones de despliegue: sentence-transformers (Python), text-embeddings-inference, endpoints compatibles de Hugging Face, y exportacion a ONNX para inferencia optimizada. No se declara soporte GGUF ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdrianTheLegend/mnli-bert-cased | no disponible (base bert-base-cased, ~110 M) | 512 tokens | 768 | no disponible | Hugging Face, 0 descargas |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | 256 tokens | 384 | Apache 2.0 | Hugging Face, ampliamente usado |
| sentence-transformers/bert-base-nli-mean-tokens | ~110 M | 512 tokens | 768 | Apache 2.0 | Hugging Face |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 tokens | 768 | MIT | Hugging Face |

La comparativa se limita a parametros, contexto, dimension, licencia y disponibilidad, ya que no se han publicado resultados de benchmarks para mnli-bert-cased que permitan comparar rendimiento numerico con las alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no hay garantia explicita de uso comercial; es imprescindible contactar con el autor o asumir el riesgo antes de usarlo en produccion.
- Idiomas no declarados: el entrenamiento sobre MNLI es predominantemente en ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Ventana de contexto limitada a 512 tokens: los documentos largos deben fragmentarse antes de generar embeddings.
- Sin datos de benchmarks publicados: no es posible verificar su calidad frente a alternativas establecidas como all-MiniLM-L6-v2 o bge-base-en-v1.5.
- Riesgo de sesgos heredados del corpus MNLI y de bert-base-cased, incluyendo sesgos de genero, raza y dominio (el corpus MNLI procede de generos textuales especificos).
- Modelo sin descargas ni validacion comunitaria: no hay evidencia de uso en produccion ni reportes de fallos.
- No apto para generacion de texto, tool calling, agentes ni tareas multimodales: es exclusivamente un encoder de similitud.
- Alucinacion no aplicable en sentido generativo, pero si riesgo de similitudes espurias en dominios alejados del corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdrianTheLegend/mnli-bert-cased
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/SetFit/mnli
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Modelos Sentence Transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de BERT (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
