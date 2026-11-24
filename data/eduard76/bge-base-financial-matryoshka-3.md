# eduard76/bge-base-financial-matryoshka-3

## Resumen

bge-base-financial-matryoshka-3 es un modelo de embeddings de frases (sentence transformer) especializado en dominio financiero, desarrollado por el usuario eduard76 a partir del checkpoint BAAI/bge-base-en-v1.5. Su funcion es convertir fragmentos de texto financiero (tablas de estados financieros, notas al pie de formularios 10-K, descripciones de partidas contables) en vectores densos de 768 dimensiones que permiten realizar busqueda semantica y recuperacion de informacion (retrieval) con alta precision dentro de corpus de documentos corporativos en ingles.

El modelo resuelve un problema concreto: los embeddings genericos de proposito general no capturan bien la similitud semantica entre una pregunta formulada en lenguaje natural y una partida contable expresada en formato tabular o con terminologia tecnica (por ejemplo, "long-term debt" frente a "long-term portion"). Al ajustar sobre un dataset financiero de 6.300 pares, el modelo alinea mejor ambas representaciones. Incorpora ademas entrenamiento con MatryoshkaLoss, lo que permite truncar los embeddings a dimensiones menores (512, 256, etc.) manteniendo buena parte del rendimiento, algo util para reducir coste de almacenamiento e inferencia en indices vectoriales grandes.

Arquitectonicamente es un transformer BERT-base (encoder) de 109,48 millones de parametros, con contexto de 512 tokens y licencia Apache 2.0. Es relevante ahora porque la recuperacion aumentada por generacion (RAG) sobre documentacion financiera es un caso de uso extendido, y disponer de un encoder pequeno, abierto y afinado en dominio permite desplegarlo en infraestructura modesta sin depender de APIs cerradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base); sentence-transformers |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de BAAI/bge-base-en-v1.5) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension del embedding | 768 (con truncamiento Matryoshka a 512 y dimensiones inferiores) |
| Funcion de similitud | coseno |
| Tamano del repositorio | 0.4 GB |
| Modelo base | BAAI/bge-base-en-v1.5 |
| Dataset de entrenamiento | 6.300 pares (dataset_size:6300) |
| Funciones de perdida | MatryoshkaLoss, MultipleNegativesRankingLoss |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-base-en-v1.5, un encoder BERT-base de 12 capas y 768 dimensiones ocultas preentrenado con objetivos de recuperacion densa. Sobre esa base se realiza un ajuste fino supervisado con pares (consulta, documento) del dominio financiero, empleando dos funciones de perdida combinadas: MultipleNegativesRankingLoss, que trata los negativos del propio lote como ejemplos contrastivos, y MatryoshkaLoss, que entrena simultaneamente representaciones de dimension completa y de dimensiones truncadas anidadas, de modo que las primeras dimensiones del vector concentren la informacion mas discriminativa.

El conjunto de entrenamiento consta de 6.300 pares, segun declara el autor en las etiquetas del repositorio. No se especifican en la informacion disponible el numero de tokens totales, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO (no aplicables en un encoder de retrieval). La innovacion tecnica destacable es precisamente el enfoque Matryoshka, que permite elegir el compromiso entre calidad de recuperacion y coste computacional/almacenamiento truncando el embedding sin reentrenar.

## Capacidades

- Generacion de embeddings densos de frases para similitud semantica y recuperacion de informacion.
- Extraccion de caracteristicas (feature-extraction) para pipelines de NLP downstream.
- Busqueda semantica en corpus financieros en ingles: estados financieros, notas de formularios 10-K, descripciones de partidas contables.
- Alineacion pregunta-respuesta sobre tablas financieras y texto tecnico contable.
- Embeddings truncables (Matryoshka) a 512 dimensiones y menores con perdida de rendimiento controlada.
- Compatibilidad con text-embeddings-inference y endpoints de Hugging Face.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: es un encoder, no un modelo generativo.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- RAG sobre informes anuales y formularios 10-K: indexar los fragmentos de los documentos en un almacen vectorial y recuperar las partidas relevantes ante una pregunta del analista; el ajuste en dominio mejora la coincidencia entre preguntas en lenguaje natural y tablas contables.
- Busqueda semantica en bases de datos de notas al pie: localizar la nota que explica una cifra concreta (por ejemplo, "cambios en la liquidez automotriz") sin depender de coincidencia exacta de palabras clave.
- Asistentes de analisis financiero: servir como capa de recuperacion de un LLM generativo, aportando los fragmentos correctos del documento antes de que el modelo redacte la respuesta.
- Deduplicacion y agrupacion de fragmentos contables: calcular similitud entre notas de distintos ejercicios o empresas para detectar textos equivalentes o plantillas repetidas.
- Clasificacion y enrutado de consultas internas: usar los embeddings para dirigir preguntas de usuarios a la seccion correcta de un informe o a un equipo responsable.
- Sistemas de alerta sobre cambios en divulgaciones: comparar los embeddings de un mismo apartado entre dos ejercicios y detectar modificaciones sustanciales en la redaccion.
- Motores de busqueda internos para equipos de compliance y auditoria, con indices de menor dimension (512 o 256) para reducir coste de almacenamiento manteniendo recall alto.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (tarea information-retrieval, no verificados):

| Metrica | dim 768 | dim 512 |
|---|---|---|
| Cosine Accuracy@1 | 0,7214 | 0,7257 |
| Cosine Accuracy@3 | 0,8500 | 0,8443 |
| Cosine Accuracy@5 | 0,8743 | 0,8686 |
| Cosine Accuracy@10 | 0,9229 | 0,9214 |
| Cosine Precision@1 | 0,7214 | 0,7257 |
| Cosine Precision@3 | 0,2833 | 0,2814 |
| Cosine Precision@5 | 0,1749 | 0,1737 |
| Cosine Precision@10 | 0,0923 | no disponible |
| Cosine Recall@1 | 0,7214 | no disponible |
| Cosine Recall@3 | 0,8500 | no disponible |
| Cosine Recall@5 | 0,8743 | no disponible |
| Cosine Recall@10 | 0,9229 | no disponible |
| Cosine NDCG@10 | 0,8226 | no disponible |
| Cosine MRR@10 | 0,7905 | no disponible |
| Cosine MAP@100 | 0,7935 | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni comparaciones con otros encoders; los datos anteriores corresponden a la evaluacion propia del autor sobre su conjunto de retrieval financiero.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (109 M de parametros) y menos de 0,3 GB en fp16; en la practica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A10, L4, A100 o H100 son mas que suficientes. Tambien funciona en CPU para cargas moderadas.
- Cabe en GPU consumer: si, en practicamente todas las tarjetas modernas, e incluso en CPU con throughput aceptable para lotes pequenos.
- Opciones de despliegue: sentence-transformers (nativo), Hugging Face Text Embeddings Inference (TEI), vLLM (soporte de embeddings), FastEmbed, y exportacion a ONNX para inferencia optimizada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser un BERT-base, el coste por lote es bajo y escala linealmente con el tamano de lote en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Notas |
|---|---|---|---|---|---|
| eduard76/bge-base-financial-matryoshka-3 | 109,48 M | 512 | 768 (truncable) | Apache 2.0 | Afinado en dominio financiero, Matryoshka |
| BAAI/bge-base-en-v1.5 | 109,48 M | 512 | 768 | MIT | Modelo base; retrieval generalista en ingles |
| BAAI/bge-large-en-v1.5 | 335 M | 512 | 1024 | MIT | Mayor capacidad, mayor coste de inferencia |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 | 384 | Apache 2.0 | Mucho mas ligero, menor calidad en dominio tecnico |

No se dispone de comparaciones de rendimiento publicadas entre este modelo y las alternativas en la informacion proporcionada; la comparativa anterior es estructural (parametros, contexto, licencia), no de resultados.

## Limitaciones y advertencias

- Solo ingles: no soporta consultas ni documentos en castellano ni en otros idiomas.
- Ventana de contexto de 512 tokens: los fragmentos mas largos deben dividirse, con riesgo de perder contexto entre trozos.
- Es un encoder de retrieval, no un modelo generativo: no responde preguntas por si mismo, solo produce embeddings.
- Los resultados de benchmarks son declarados por el autor y estan marcados como no verificados; el conjunto de evaluacion no se detalla.
- Dataset de entrenamiento pequeno (6.300 pares): puede generalizar peor fuera del subdominio financiero concreto con el que se entreno.
- Riesgo de sesgo heredado del corpus base y del dataset de ajuste (sesgo de dominio, posible sobrerrepresentacion de ciertas empresas o sectores).
- Riesgo de falsos positivos en similitud cuando dos partidas comparten terminologia contable pero difieren en significado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base BAAI/bge-base-en-v1.5.
- Para produccion, validar el recall sobre el corpus propio antes de desplegar; el rendimiento depende fuertemente de la estrategia de chunking.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduard76/bge-base-financial-matryoshka-3
- Modelo base: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Matryoshka Representation Learning (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- Paper de Multiple Negatives Ranking (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Libreria sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
