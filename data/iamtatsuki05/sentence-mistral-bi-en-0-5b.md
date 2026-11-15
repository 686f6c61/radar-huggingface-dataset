# iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B

## Resumen

Sentence-Mistral-Bi-EN-0.5B es un modelo de embeddings de frases en ingles desarrollado por iamtatsuki05 dentro de la familia MIREI. Se trata de un fine-tuning con aprendizaje contrastivo supervisado sobre el checkpoint iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B-PT, a su vez derivado de una arquitectura Mistral de 518 millones de parametros. El modelo produce representaciones densas de 1.536 dimensiones mediante mean pooling y esta pensado para tareas de recuperacion de informacion, similitud semantica y clustering.

El modelo resuelve el problema de generar embeddings de frases y parrafos de calidad para pipelines de retrieval y RAG en ingles, con una ventana de contexto de 8.192 tokens que supera ampliamente la de los encoders BERT clasicos (512 tokens). Su interes actual radica en que forma parte de un estudio comparativo sistematico entre arquitecturas encoder y decoder para sentence embeddings, presentado en NLP2026, y en que ofrece una alternativa ligera (518M parametros, 2,1 GB en safetensors) frente a encoders de mayor tamano.

La licencia MIT y la compatibilidad con text-embeddings-inference y con sentence-transformers lo hacen directamente desplegable en infraestructura de produccion. No obstante, el modelo es exclusivamente en ingles y sus resultados MTEB son inferiores a los de otros miembros de la misma familia, como Sentence-InstructLM-Bi-EN-0.5B o Sentence-Qwen2.5-Bi-EN-0.5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (transformer decoder adaptado a bi-encoder) |
| Parametros totales | 518.702.592 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el uso tipico es bfloat16) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 1.536 (mean pooling) |
| Tokenizer | Mistral, vocabulario de 32.000 tokens |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Tamano del repo | 2,1 GB |
| Parametros sin embeddings | 469M |

## Arquitectura y entrenamiento

El modelo parte de un transformer de arquitectura Mistral con 518 millones de parametros totales (469M excluyendo la capa de embeddings), tokenizer Mistral de 32.000 tokens y codificacion posicional RoPE, lo que permite manejar secuencias de hasta 8.192 tokens. Sobre el checkpoint preentrenado debilmente supervisado Sentence-Mistral-Bi-EN-0.5B-PT se aplica un fine-tuning con aprendizaje contrastivo supervisado (supervised contrastive learning) para convertir el decoder en un bi-encoder de frases. La representacion final se obtiene por mean pooling y se normaliza para usar similitud coseno.

Los datos de entrenamiento corresponden a los subconjuntos supervisados de sentence-transformers/embedding-training-data: AllNLI, MS MARCO, Quora duplicate questions, NQ, SQuAD y TriviaQA. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta por dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente a modelos de embeddings). La innovacion principal del trabajo es metodologica: forma parte de un analisis comparativo, publicado en NLP2026, sobre el rendimiento de arquitecturas encoder frente a decoder en la generacion de sentence embeddings bajo condiciones controladas.

## Capacidades

- Generacion de embeddings de frases y parrafos en ingles con 1.536 dimensiones y normalizacion opcional.
- Recuperacion de informacion (retrieval) densa para motores de busqueda semantica y RAG.
- Similitud semantica entre pares de textos (sentence similarity) mediante coseno.
- Clustering y deduplicacion de documentos por similitud de embeddings.
- Reranking de candidatos recuperados en pipelines de dos etapas.
- Clasificacion de textos basada en representaciones (mediante cabezas entrenadas sobre los embeddings).
- Procesamiento de documentos largos gracias a la ventana de 8.192 tokens.
- Soporte de tool calling / function calling: no disponible (es un modelo de embeddings, no generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales: integracion con text-embeddings-inference y endpoints compatibles.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar manuales y articulos con embeddings de 1.536 dimensiones y recuperar fragmentos relevantes por similitud coseno; la ventana de 8.192 tokens permite indexar secciones completas sin truncar.
- RAG sobre bases de conocimiento internas: generar embeddings de chunks en ingles y alimentar un recuperador denso que sirva contexto a un LLM generativo, con un coste de inferencia bajo al tratarse de un modelo de 518M parametros.
- Deduplicacion de registros y catalogos: calcular embeddings de titulos y descripciones y agrupar por umbral de similitud para eliminar duplicados en bases de datos de productos o articulos.
- Moderacion y agrupamiento de tickets de soporte: clasificar y clusterizar consultas de usuarios en ingles por tematica usando las representaciones generadas, para enrutarlas al equipo adecuado.
- Reranking en pipelines de busqueda de dos etapas: recuperar candidatos con BM25 y reordenarlos con las similitudes del modelo, aprovechando la metrica MTEB-Reranking de 42,53.
- Deteccion de plagio o similitud entre documentos: comparar pares de textos largos (hasta 8.192 tokens) mediante similitud coseno para identificar contenido duplicado o parafraseado.
- Evaluacion de calidad de respuestas en ingles: medir la similitud semantica entre respuestas generadas y referencias en pipelines de evaluacion automatica.

## Benchmarks y rendimiento

Resultados sobre el subconjunto ingles de 37 tareas de MTEB (eng, v2), segun la model card del autor:

| Modelo | Arquitectura | Parametros | MTEB-Avg | Retrieval | STS | Classification | Reranking | Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-Mistral-Bi-EN-0.5B (este modelo) | Mistral | 518M | 52,70 | 38,44 | 75,04 | 66,60 | 42,53 | 40,87 |
| Sentence-ModernBERT-EN-0.5B | ModernBERT | 677M | 53,66 | 40,32 | 76,04 | 67,31 | 42,93 | 41,69 |
| Sentence-Llama-Bi-EN-0.5B | Llama | 661M | 52,12 | 37,31 | 74,10 | 66,28 | 42,29 | 40,63 |
| Sentence-Sarashina-Bi-EN-0.5B | Llama | 661M | 56,54 | 42,62 | 78,91 | 72,45 | 45,39 | 43,35 |
| Sentence-Qwen2.5-Bi-EN-0.5B | Qwen2.5 | 494M | 57,19 | 44,18 | 79,48 | 71,92 | 45,23 | 45,15 |
| Sentence-InstructLM-Bi-EN-0.5B | Mistral | 518M | 57,73 | 46,11 | 80,01 | 73,19 | 45,71 | 43,62 |

Cada puntuacion de familia promedia todos los datasets, splits y subconjuntos de la familia; MTEB-Avg es la media macro sobre las cinco familias. No se han publicado en la informacion disponible resultados de benchmarks especificos como MMLU, HumanEval o GSM8K, que no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en bfloat16 (518M parametros x 2 bytes) mas memoria para activaciones; en float32, unos 2,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM efectiva para lotes pequenos; A100, H100, L40S o RTX 4090 para alto throughput con lotes grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en GPUs de 4 GB con lotes reducidos.
- Opciones de despliegue: sentence-transformers (libreria nativa), text-embeddings-inference, vLLM con soporte de embeddings, Hugging Face Inference Endpoints (tag endpoints_compatible). Requiere trust_remote_code=True por el codigo personalizado.
- Dependencias declaradas: sentence-transformers>=4.1.0, transformers>=4.51.0, accelerate>=1.6.0, sentencepiece>=0.2.0, flash-attn>=2.7.3.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTEB-Avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentence-Mistral-Bi-EN-0.5B | 518M | 8.192 | 52,70 | MIT | Hugging Face |
| Sentence-InstructLM-Bi-EN-0.5B | 518M | no disponible | 57,73 | no disponible | Hugging Face |
| Sentence-Qwen2.5-Bi-EN-0.5B | 494M | no disponible | 57,19 | no disponible | Hugging Face |
| Sentence-ModernBERT-EN-0.5B | 677M | no disponible | 53,66 | no disponible | Hugging Face |

Dentro de la propia familia MIREI, este modelo es el segundo con menor MTEB-Avg de la comparativa principal (solo por delante de Sentence-Llama-Bi-EN-0.5B), pese a compartir arquitectura Mistral con Sentence-InstructLM-Bi-EN-0.5B, que obtiene 5,03 puntos mas de media. Sentence-Qwen2.5-Bi-EN-0.5B logra 57,19 con menos parametros (494M). Sentence-ModernBERT-EN-0.5B queda 0,96 puntos por encima con 677M parametros. La ventaja de este checkpoint frente a alternativas de mayor tamano es su menor huella de memoria y el contexto de 8.192 tokens.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas, por lo que su uso en castellano producira embeddings de baja calidad.
- Es un modelo de embeddings, no generativo: no admite instrucciones, tool calling ni razonamiento multi-paso.
- Riesgo de sesgos heredados de los datos de entrenamiento (AllNLI, MS MARCO, Quora, NQ, SQuAD, TriviaQA), con posible infrarrepresentacion de dominios especializados y de variedades no estandar del ingles.
- Rendimiento MTEB-Avg de 52,70, inferior al de otros modelos de la misma familia, lo que puede traducirse en menor calidad de recuperacion en dominios exigentes.
- El uso de trust_remote_code=True implica ejecutar codigo personalizado del autor; conviene auditar el repositorio antes de desplegarlo en produccion.
- Requiere versiones concretas de sentence-transformers (>=4.1.0), transformers (>=4.51.0) y flash-attn (>=2.7.3), lo que puede complicar la integracion en entornos con dependencias fijadas.
- No se especifican en la informacion disponible los detalles de composicion del dataset ni el numero de tokens de entrenamiento, lo que limita la reproducibilidad.
- La licencia MIT permite uso comercial sin restricciones adicionales conocidas, pero el modelo base PT y el codigo personalizado deben verificarse por separado.
- El modelo es muy reciente y cuenta con solo 3 descargas y 0 likes en Hugging Face, por lo que carece de validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B
- Modelo base PT: https://huggingface.co/iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B-PT
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Modelo comparable Sentence-InstructLM-Bi-EN-0.5B: https://huggingface.co/iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B
- Modelo comparable Sentence-Qwen2.5-Bi-EN-0.5B: https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Bi-EN-0.5B
- Modelo comparable Sentence-ModernBERT-EN-0.5B: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-0.5B
- Licencia MIT: https://opensource.org/license/mit/
- Referencia del paper (NLP2026, sin URL directa en la informacion disponible): "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", Okada y Sugimoto.
