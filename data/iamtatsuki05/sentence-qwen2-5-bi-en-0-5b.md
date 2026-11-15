# iamtatsuki05/Sentence-Qwen2.5-Bi-EN-0.5B

## Resumen

Sentence-Qwen2.5-Bi-EN-0.5B es un modelo de embeddings de frases en ingles construido a partir de Qwen2.5-0.5B mediante aprendizaje contrastivo supervisado. Lo desarrolla el autor independiente iamtatsuki05 dentro del proyecto MIREI, una linea de investigacion que compara arquitecturas encoder y decoder para generar representaciones vectoriales de frases bajo condiciones de entrenamiento equivalentes. El modelo parte de un checkpoint preentrenado y afinado debilmente supervisado (Sentence-Qwen2.5-Bi-EN-0.5B-PT) y se afina despues sobre los subconjuntos supervisados de sentence-transformers/embedding-training-data (AllNLI, MS MARCO, Quora, NQ, SQuAD y TriviaQA).

El modelo resuelve la tarea de similitud semantica y recuperacion de informacion: convierte frases y parrafos en vectores densos de 896 dimensiones mediante mean pooling, con similitud coseno como metrica. Su interes practico es que ofrece una ventana de contexto de 32.768 tokens en un encoder de solo 494 millones de parametros, algo poco habitual en la categoria de 0,5B, donde la mayoria de alternativas se limita a 512 u 8.192 tokens.

En la comparativa interna de la serie MIREI, este checkpoint obtiene un MTEB-Avg de 57,19 en el subconjunto ingles de 37 tareas, por delante de las variantes ModernBERT, Llama y Mistral de tamano similar, y solo superado por Sentence-InstructLM-Bi-EN-0.5B (57,73). Es relevante ahora porque demuestra que un decoder pequeno con preentrenamiento de calidad puede competir con encoders especializados en tareas de retrieval, manteniendo un coste de despliegue muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5), adaptado a bi-encoder con mean pooling |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors bf16 es compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 2,0 GB) |
| Dimension del embedding | 896 (mean pooling) |
| Tokenizer | Qwen2.5 byte-level BPE, vocabulario de 151.936 |
| Codificacion posicional | RoPE |
| Metrica de similitud | Coseno |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

El modelo es un bi-encoder basado en la arquitectura Qwen2.5, un transformer decoder con atencion causal, RoPE y tokenizer byte-level BPE de 151.936 entradas. Para producir embeddings de frase se aplica mean pooling sobre los estados ocultos y se normalizan los vectores, de modo que la similitud coseno equivale al producto escalar. El checkpoint final deriva de Sentence-Qwen2.5-Bi-EN-0.5B-PT, un modelo preentrenado y afinado con supervision debil, sobre el que se aplica aprendizaje contrastivo supervisado.

El entrenamiento utiliza los subconjuntos supervisados del dataset sentence-transformers/embedding-training-data, en concreto AllNLI, MS MARCO, Quora duplicate questions, NQ, SQuAD y TriviaQA. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta por tarea ni si se aplicaron tecnicas adicionales como decodificacion especulativa o atencion lineal. La innovacion principal del trabajo es metodologica: el proyecto MIREI entrena variantes encoder y decoder bajo condiciones controladas para aislar el efecto de la arquitectura en la calidad del embedding, y este checkpoint es la variante Qwen2.5 afinada desde un modelo preentrenado (frente a la variante Scratch, entrenada desde cero).

## Capacidades

- Generacion de embeddings de frases en ingles de 896 dimensiones con normalizacion L2 y similitud coseno.
- Recuperacion de informacion (retrieval) densa sobre documentos largos gracias a la ventana de 32.768 tokens.
- Similitud semantica de frases (STS), incluyendo parafrasis y deteccion de duplicados.
- Clasificacion de texto por similitud con prototipos o etiquetas embebidas.
- Reranking de candidatos recuperados previamente por un sistema de busqueda.
- Clustering de documentos y deduplicacion semantica.
- Soporte de tool calling / function calling: no disponible (es un modelo de embeddings, no generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de chat ni de razonamiento).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidad especial: integracion nativa con text-embeddings-inference y endpoints compatibles, ademas de uso directo via sentence-transformers.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar manuales y articulos de hasta 32.768 tokens por fragmento, algo que permite reducir el numero de chunks y preservar contexto que se perderia con ventanas de 512 tokens.
- Motor de preguntas frecuentes: embeber las preguntas de los usuarios y compararlas contra un banco de respuestas precalculado; el coste de inferencia es bajo (494M de parametros) y la latencia permite respuesta interactiva.
- Deduplicacion de tickets de soporte: agrupar por similitud coseno los tickets entrantes para detectar incidencias repetidas y enrutarlas al mismo equipo.
- Reranking en pipelines RAG: usar el modelo como segunda etapa tras un retriever BM25 o bi-encoder ligero, recalculando la similitud entre consulta y los 50-100 candidatos recuperados.
- Moderacion y clasificacion cero-shot: comparar el embedding de un mensaje contra embeddings de prototipos de categorias (spam, abuso, consulta legitima) sin entrenar un clasificador especifico.
- Clustering de corpus de investigacion: agrupar abstracts o articulos por tematica usando el embedding de 896 dimensiones y algoritmos como HDBSCAN, con la ventaja de procesar textos largos completos.
- Deteccion de plagio y parafrasis: comparar pares de documentos con similitud coseno; la ventana larga permite comparar secciones extensas sin truncar.

## Benchmarks y rendimiento

Resultados publicados por el autor en el subconjunto ingles de MTEB (eng, v2) de 37 tareas, agrupados en cinco familias. La media MTEB-Avg es la media macro de las cinco familias.

| Modelo | Arquitectura | Parametros | MTEB-Avg | Retrieval | STS | Classification | Reranking | Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-Qwen2.5-Bi-EN-0.5B (este modelo) | Qwen2.5 | 494M | 57,19 | 44,18 | 79,48 | 71,92 | 45,23 | 45,15 |
| Sentence-InstructLM-Bi-EN-0.5B | Mistral | 518M | 57,73 | 46,11 | 80,01 | 73,19 | 45,71 | 43,62 |
| Sentence-Sarashina-Bi-EN-0.5B | Llama | 661M | 56,54 | 42,62 | 78,91 | 72,45 | 45,39 | 43,35 |
| Sentence-ModernBERT-EN-0.5B | ModernBERT | 677M | 53,66 | 40,32 | 76,04 | 67,31 | 42,93 | 41,69 |
| Sentence-Llama-Bi-EN-0.5B | Llama | 661M | 52,12 | 37,31 | 74,10 | 66,28 | 42,29 | 40,63 |
| Sentence-Mistral-Bi-EN-0.5B | Mistral | 518M | 52,70 | 38,44 | 75,04 | 66,60 | 42,53 | 40,87 |
| Sentence-Qwen2.5-Scratch-Bi-EN-0.5B | Qwen2.5 | 494M | 51,73 | 36,70 | 73,86 | 65,20 | 42,00 | 40,90 |

No se han publicado en la informacion disponible resultados de benchmarks externos (BEIR, MIRACL, etc.) ni comparaciones con modelos de embeddings de referencia como E5, BGE o GTE.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1 GB de pesos (494M de parametros a 2 bytes), mas overhead de activaciones; en la practica cabe en cualquier GPU con 2 GB o mas.
- Cuantizacion a 8 bits: alrededor de 0,5 GB de pesos. A 4 bits: alrededor de 0,25 GB.
- GPU recomendadas para produccion: NVIDIA T4, L4, A10G, A100 o H100 para alto throughput por lotes; tambien funciona en CPU para cargas moderadas.
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, RTX 4090). En CPU, con sentence-transformers, es viable para indexacion por lotes.
- Opciones de despliegue: sentence-transformers (libreria nativa), Hugging Face Text Embeddings Inference (TEI, etiquetado como compatible), transformers con trust_remote_code, y servidores de inferencia estandar que acepten safetensors.
- Latencia y throughput: no disponible en la informacion proporcionada. Como referencia cualitativa, un modelo de 0,5B en bf16 sobre una L4 procesa lotes de cientos de frases por segundo, pero no se ha publicado una medicion oficial.
- Requisitos de software declarados: sentence-transformers >= 4.1.0, transformers >= 4.51.0, accelerate >= 1.6.0, sentencepiece >= 0.2.0 y flash-attn >= 2.7.3 para la ruta optimizada con FlashAttention 2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTEB-Avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentence-Qwen2.5-Bi-EN-0.5B | 494M | 32.768 | 57,19 | MIT | Hugging Face |
| Sentence-InstructLM-Bi-EN-0.5B | 518M | no disponible | 57,73 | no disponible | Hugging Face |
| Sentence-Sarashina-Bi-EN-0.5B | 661M | no disponible | 56,54 | no disponible | Hugging Face |
| Sentence-ModernBERT-EN-0.5B | 677M | no disponible | 53,66 | no disponible | Hugging Face |

La comparativa se limita a los modelos de la misma serie MIREI, que son los unicos con resultados publicados en la informacion disponible. Frente a ellos, este checkpoint ofrece el mayor rendimiento en clustering (45,15), el segundo mejor MTEB-Avg y el menor numero de parametros, ademas de una ventana de contexto de 32.768 tokens que no se documenta en las alternativas de la serie.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta evaluado y previsiblemente sera deficiente.
- Es un modelo de embeddings, no generativo: no puede responder preguntas, razonar ni ejecutar tool calling. Usarlo como generador produciria salidas sin sentido.
- Riesgo de sesgo heredado del corpus de entrenamiento (AllNLI, MS MARCO, NQ, SQuAD, TriviaQA, Quora), dominado por texto en ingles de dominio general y enciclopedico; puede infrarrepresentar jerga tecnica de nicho o dominios especializados.
- Riesgo de falsos positivos en similitud: frases con alto solapamiento lexico pero significado distinto pueden obtener puntuaciones altas; conviene calibrar umbrales por dominio.
- La ventana de 32.768 tokens es nominal; la calidad del embedding con mean pooling puede degradarse en entradas muy largas sin evaluacion publicada al respecto.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion; no impone restricciones adicionales, pero el autor no ofrece garantias.
- El modelo tiene muy poca traccion (2 descargas, 0 likes en el momento de la consulta) y no se han publicado evaluaciones independientes; validar en el dominio propio antes de produccion.
- Requiere trust_remote_code=True para cargar el codigo personalizado, lo que implica revisar el codigo del repositorio antes de desplegarlo en entornos sensibles.
- flash-attn >= 2.7.3 es necesario solo para la ruta optimizada; sin el, la inferencia funciona pero con mayor consumo de memoria en contextos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Bi-EN-0.5B
- Modelo base (PT): https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Bi-EN-0.5B-PT
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Variante ModernBERT: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-0.5B
- Variante Llama: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-0.5B
- Variante Sarashina: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-0.5B
- Variante Mistral: https://huggingface.co/iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B
- Variante Qwen2.5 Scratch: https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Scratch-Bi-EN-0.5B
- Variante InstructLM: https://huggingface.co/iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B
- Licencia MIT: https://opensource.org/license/mit/
- Paper de referencia (NLP2026): no disponible como enlace directo; cita en la model card como "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", Okada y Sugimoto, Actas de NLP2026.
