# iamtatsuki05/Sentence-Qwen2.5-Scratch-Bi-EN-0.5B

## Resumen

Sentence-Qwen2.5-Scratch-Bi-EN-0.5B es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05 dentro de la familia MIREI. Se trata de un fine-tuning del checkpoint iamtatsuki05/Sentence-Qwen2.5-Scratch-Bi-EN-0.5B-PT mediante aprendizaje contrastivo supervisado sobre los subconjuntos supervisados del dataset sentence-transformers/embedding-training-data (AllNLI, MS MARCO, Quora duplicate questions, NQ, SQuAD y TriviaQA). El resultado es un encoder bi-directional que produce embeddings de 896 dimensiones mediante mean pooling.

El modelo parte de la arquitectura Qwen2.5 y cuenta con 494.032.768 parámetros totales (357M sin contar la capa de embeddings), con una longitud máxima de secuencia de 32.768 tokens. Su propósito es servir como modelo de recuperación y similitud semántica en inglés, integrándose en pipelines de búsqueda semántica, reranking y clustering mediante la librería sentence-transformers.

Es relevante en el contexto de la investigación comparativa de arquitecturas para sentence embeddings: el autor publica este modelo junto a una serie de variantes (ModernBERT, Llama, Mistral, Sarashina, InstructLM) bajo condiciones de entrenamiento equivalentes, lo que permite analizar el impacto de la arquitectura encoder frente a decoder en tareas de representación semántica. El modelo se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (transformer decoder adaptado a encoder bi-directional) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 896 (mean pooling) |
| Tokenizer | Qwen2.5 (byte-level BPE), vocabulario de 151.936 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Parametros sin embeddings | 357M |
| Tamano del repo | 2.0 GB |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer con codificación posicional RoPE y tokenizer byte-level BPE de 151.936 entradas. A diferencia de un decoder causal estándar, se ha adaptado como encoder bi-directional para generar representaciones de frases: la salida se obtiene mediante mean pooling sobre las representaciones de tokens, produciendo un vector de 896 dimensiones que se compara con similitud coseno. La longitud máxima de secuencia es de 32.768 tokens.

El entrenamiento parte de un checkpoint con supervisión débil (Sentence-Qwen2.5-Scratch-Bi-EN-0.5B-PT) y aplica fine-tuning con aprendizaje contrastivo supervisado sobre los subconjuntos supervisados de sentence-transformers/embedding-training-data: AllNLI, MS MARCO, Quora duplicate questions, NQ, SQuAD y TriviaQA. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo está etiquetado con llm2vec, lo que sugiere el uso de adaptaciones de modelos causales a embeddings bi-direccionales, aunque la model card no detalla el procedimiento exacto.

## Capacidades

- Generación de embeddings de frases en inglés de 896 dimensiones mediante mean pooling.
- Similitud semántica entre frases y documentos (pipeline sentence-similarity).
- Recuperación de información (retrieval) densa sobre corpus en inglés.
- Reranking de resultados de búsqueda mediante puntuaciones de similitud coseno.
- Clustering y agrupación semántica de textos.
- Clasificación de textos basada en representaciones vectoriales.
- Soporte de secuencias largas de hasta 32.768 tokens, adecuado para documentos extensos.
- Integración con sentence-transformers (versión >= 4.1.0) y text-embeddings-inference.
- Compatible con endpoints de Hugging Face (tag endpoints_compatible).
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo de embeddings, no generativo.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales y artículos en inglés como embeddings de 896 dimensiones y recuperar los fragmentos más relevantes ante una consulta en lenguaje natural, aprovechando la ventana de 32.768 tokens para documentos largos.
- Motor de preguntas y respuestas sobre base documental: usar el modelo para recuperar pasajes de SQuAD o NQ-style antes de pasarlos a un LLM generativo, reduciendo el coste de contexto y mejorando la precisión del retrieval.
- Deduplicación de contenidos: calcular embeddings de artículos o tickets y agrupar por similitud coseno para detectar duplicados en corpus de noticias o soporte técnico.
- Reranking en pipelines de búsqueda híbrida: combinar búsqueda léxica (BM25) con este modelo como segunda etapa de reordenación por similitud semántica en motores de búsqueda internos.
- Clustering de feedback de usuarios: agrupar reseñas o tickets en inglés por temática usando los embeddings y algoritmos como k-means o HDBSCAN para análisis de voz del cliente.
- Clasificación de textos por similitud a prototipos: asignar categorías calculando la similitud entre el embedding del documento y embeddings de descripciones de categoría, sin necesidad de entrenar un clasificador supervisado.
- Sistemas de recomendación basados en contenido: representar ítems y perfiles de usuario como vectores y calcular afinidad semántica para sugerir artículos o recursos similares.
- Evaluación comparativa de arquitecturas: servir como checkpoint de referencia en experimentos que comparan encoders (ModernBERT) frente a decoders adaptados (Llama, Mistral, Qwen2.5) bajo condiciones controladas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el subconjunto inglés de 37 tareas de MTEB (eng, v2), comparados con las variantes de la misma serie:

| Modelo | Arquitectura | Parametros | MTEB-Avg | MTEB-Retrieval | MTEB-STS | MTEB-Classification | MTEB-Reranking | MTEB-Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-Qwen2.5-Scratch-Bi-EN-0.5B (este modelo) | Qwen2.5 | 494M | 51,73 | 36,70 | 73,86 | 65,20 | 42,00 | 40,90 |
| Sentence-ModernBERT-EN-0.5B | ModernBERT | 677M | 53,66 | 40,32 | 76,04 | 67,31 | 42,93 | 41,69 |
| Sentence-Llama-Bi-EN-0.5B | Llama | 661M | 52,12 | 37,31 | 74,10 | 66,28 | 42,29 | 40,63 |
| Sentence-Sarashina-Bi-EN-0.5B | Llama | 661M | 56,54 | 42,62 | 78,91 | 72,45 | 45,39 | 43,35 |
| Sentence-Mistral-Bi-EN-0.5B | Mistral | 518M | 52,70 | 38,44 | 75,04 | 66,60 | 42,53 | 40,87 |
| Sentence-Qwen2.5-Bi-EN-0.5B | Qwen2.5 | 494M | 57,19 | 44,18 | 79,48 | 71,92 | 45,23 | 45,15 |
| Sentence-InstructLM-Bi-EN-0.5B | Mistral | 518M | 57,73 | 46,11 | 80,01 | 73,19 | 45,71 | 43,62 |

Las puntuaciones se miden sobre el subconjunto inglés de 37 tareas de MTEB (eng, v2), que cubre las mismas cinco familias de tareas que JMTEB; cada puntuación de familia promedia todos los datasets, splits y subconjuntos de la familia, y MTEB-Avg es la media macro sobre las cinco familias. Este modelo obtiene el rendimiento más bajo de la serie en MTEB-Avg, por debajo de las variantes entrenadas desde checkpoints preentrenados (Qwen2.5-Bi e InstructLM-Bi), lo que sugiere que el entrenamiento desde cero penaliza la calidad de los embeddings frente al fine-tuning sobre modelos preentrenados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bfloat16 (494M parámetros) y alrededor de 0,5 GB en cuantización de 8 bits; el repo ocupa 2,0 GB, probablemente por incluir pesos en distintos formatos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funcionan RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problemas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM.
- Opciones de despliegue: sentence-transformers (>= 4.1.0), transformers (>= 4.51.0), text-embeddings-inference (tag text-embeddings-inference), y compatibilidad con endpoints de Hugging Face. No se documenta soporte explícito de llama.cpp, Ollama o vLLM en la información disponible.
- Requisitos adicionales: accelerate >= 1.6.0, sentencepiece >= 0.2.0 y flash-attn >= 2.7.3 para la implementación de atención FlashAttention 2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | MTEB-Avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sentence-Qwen2.5-Scratch-Bi-EN-0.5B | Qwen2.5 | 494M | 32.768 | 51,73 | MIT | Hugging Face |
| Sentence-Qwen2.5-Bi-EN-0.5B | Qwen2.5 | 494M | no disponible | 57,19 | MIT (según serie) | Hugging Face |
| Sentence-InstructLM-Bi-EN-0.5B | Mistral | 518M | no disponible | 57,73 | MIT (según serie) | Hugging Face |
| Sentence-ModernBERT-EN-0.5B | ModernBERT | 677M | no disponible | 53,66 | MIT (según serie) | Hugging Face |

La comparativa directa dentro de la misma serie muestra que este checkpoint, entrenado desde cero, queda por debajo de las variantes que parten de modelos preentrenados con instrucciones o de Qwen2.5 estándar. La ventaja principal frente a las alternativas es su menor número de parámetros (494M frente a 518M-677M) y su contexto de 32.768 tokens, aunque el rendimiento en MTEB es inferior. No se dispone de datos de contexto para las variantes comparadas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no está entrenado para otros idiomas, por lo que su uso en castellano u otras lenguas produciría embeddings de baja calidad.
- Es un modelo de embeddings, no generativo: no puede responder preguntas, generar texto ni ejecutar tool calling.
- Riesgo de alucinación no aplica directamente al ser un modelo de representación, pero la similitud coseno puede producir falsos positivos en retrieval cuando los textos comparten vocabulario pero difieren en significado.
- El rendimiento en MTEB-Avg (51,73) es el más bajo de la serie MIREI, por debajo de variantes como Qwen2.5-Bi (57,19) o InstructLM-Bi (57,73); en producción conviene evaluar si esta diferencia es aceptable para la tarea concreta.
- El entrenamiento desde cero (scratch) puede implicar menor robustez ante dominios no vistos en comparación con modelos preentrenados a gran escala.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero se recomienda revisar los términos de los datasets de entrenamiento (sentence-transformers/embedding-training-data) por posibles restricciones heredadas.
- Requiere versiones específicas de sentence-transformers, transformers, accelerate, sentencepiece y flash-attn; entornos con versiones anteriores pueden fallar al cargar el modelo.
- No se documentan sesgos específicos ni evaluaciones de robustez en la información disponible.
- El modelo tiene muy pocas descargas y likes (1 y 0 en el momento de la consulta), lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Scratch-Bi-EN-0.5B
- Modelo base (PT): https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Scratch-Bi-EN-0.5B-PT
- Colección MIREI en Hugging Face: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Variante ModernBERT: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-0.5B
- Variante Llama: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-0.5B
- Variante Sarashina: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-0.5B
- Variante Mistral: https://huggingface.co/iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B
- Variante Qwen2.5 preentrenada: https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Bi-EN-0.5B
- Variante InstructLM: https://huggingface.co/iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B
- Licencia MIT: https://opensource.org/license/mit/
- Cita académica (NLP2026): artículo "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", autores 岡田 龍樹 y 杉本 徹, 言語処理学会第 32 回年次大会 (NLP2026).
