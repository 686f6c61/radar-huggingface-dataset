# iamtatsuki05/Sentence-ModernBERT-EN-0.5B

## Resumen

Sentence-ModernBERT-EN-0.5B es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05 dentro de la familia MIREI. Se trata de un fine-tuning del checkpoint base iamtatsuki05/Sentence-ModernBERT-EN-0.5B-PT mediante aprendizaje contrastivo supervisado, y su propósito es convertir frases y documentos en vectores densos de 1.280 dimensiones útiles para búsqueda semántica, similitud de frases y recuperación de información.

El modelo parte de la arquitectura ModernBERT, un transformer encoder moderno con codificación posicional RoPE y una longitud máxima de secuencia de 8.192 tokens, lo que lo sitúa muy por encima de los 512 tokens típicos de los encoders BERT clásicos empleados en embeddings. Con 677.538.560 parámetros totales (546M sin contar embeddings), ocupa un segmento de tamaño medio que busca un equilibrio entre calidad de representación y coste de despliegue.

Su relevancia actual radica en que compite directamente con alternativas de embeddings de la misma familia (Llama, Mistral, Qwen2.5, Sarashina) y ofrece una licencia MIT permisiva, lo que facilita su integración en productos comerciales de búsqueda y RAG. No obstante, sus resultados en MTEB (eng, v2) lo sitúan por debajo de varios de sus hermanos de serie, por lo que su elección debe justificarse por arquitectura y contexto más que por rendimiento bruto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 677.538.560 (677M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones de terceros no documentadas) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.280 (mean pooling) |
| Tokenizer | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Parametros sin embeddings | 546M |
| Tamano del repositorio | 2,7 GB |
| Modelo base | iamtatsuki05/Sentence-ModernBERT-EN-0.5B-PT |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT, una evolución del transformer bidireccional clásico que incorpora RoPE como codificación posicional y extiende la ventana de contexto hasta 8.192 tokens. La representación de frase se obtiene mediante mean pooling sobre las salidas del encoder, produciendo un vector de 1.280 dimensiones. El tokenizer es SentencePiece con un vocabulario de 102.400 entradas.

El entrenamiento parte del checkpoint iamtatsuki05/Sentence-ModernBERT-EN-0.5B-PT y aplica aprendizaje contrastivo supervisado sobre los subconjuntos supervisados de sentence-transformers/embedding-training-data, en concreto AllNLI, MS MARCO, Quora duplicate questions, NQ, SQuAD y TriviaQA. La model card no detalla el número de tokens de entrenamiento, la composición exacta por dataset ni si se aplicaron etapas de destilación o minería de negativos duros; esos datos figuran como no disponibles. El modelo forma parte de un estudio comparativo (MIREI) sobre arquitecturas encoder y decoder para embeddings de frases bajo condiciones controladas.

## Capacidades

- Generación de embeddings de frases y documentos en inglés con normalización opcional y similitud coseno.
- Recuperación de información (retrieval) densa para pipelines de búsqueda semántica y RAG.
- Similitud semántica de pares de frases (sentence similarity).
- Clustering de textos a partir de los vectores generados.
- Reranking de candidatos recuperados mediante puntuación de similitud.
- Clasificación de textos por similitud con prototipos o etiquetas.
- Manejo de entradas largas de hasta 8.192 tokens, útil para documentos extensos.
- Integración con sentence-transformers, transformers y accelerate.
- Compatibilidad con text-embeddings-inference y endpoints de Hugging Face.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades distintas de texto; es un encoder, no un modelo generativo.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales y artículos en inglés como vectores de 1.280 dimensiones y recuperar los fragmentos más relevantes ante consultas en lenguaje natural, aprovechando la ventana de 8.192 tokens para indexar secciones completas sin truncar.
- RAG sobre bases de conocimiento internas: generar embeddings de chunks de políticas, wikis o tickets y alimentar un recuperador denso que sirva contexto a un LLM generativo, con la ventaja de la licencia MIT para uso comercial.
- Deduplicación y detección de near-duplicates: comparar pares de preguntas o registros con similitud coseno para identificar duplicados en foros, encuestas o catálogos, un escenario alineado con el entrenamiento sobre Quora duplicate questions.
- Clustering de feedback de usuarios: agrupar reseñas o tickets por temática usando los embeddings y un algoritmo de clustering, facilitando el análisis cualitativo a escala.
- Reranking en pipelines de búsqueda híbrida: usar el modelo como segunda etapa para reordenar los resultados de un recuperador léxico (BM25) según similitud semántica.
- Clasificación zero-shot por prototipos: construir embeddings de descripciones de categorías y asignar etiquetas a textos nuevos por proximidad, sin reentrenar un clasificador.
- Moderación y triaje de contenido: agrupar o etiquetar mensajes por similitud con ejemplos conocidos de cada categoría en flujos de revisión.

## Benchmarks y rendimiento

Resultados en el subconjunto inglés de MTEB (eng, v2), 37 tareas, según la model card:

| Modelo | Arquitectura | Parametros | MTEB-Avg | MTEB-Retrieval | MTEB-STS | MTEB-Classification | MTEB-Reranking | MTEB-Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-ModernBERT-EN-0.5B (este modelo) | ModernBERT | 677M | 53,66 | 40,32 | 76,04 | 67,31 | 42,93 | 41,69 |
| Sentence-Llama-Bi-EN-0.5B | Llama | 661M | 52,12 | 37,31 | 74,10 | 66,28 | 42,29 | 40,63 |
| Sentence-Sarashina-Bi-EN-0.5B | Llama | 661M | 56,54 | 42,62 | 78,91 | 72,45 | 45,39 | 43,35 |
| Sentence-Mistral-Bi-EN-0.5B | Mistral | 518M | 52,70 | 38,44 | 75,04 | 66,60 | 42,53 | 40,87 |
| Sentence-Qwen2.5-Scratch-Bi-EN-0.5B | Qwen2.5 | 494M | 51,73 | 36,70 | 73,86 | 65,20 | 42,00 | 40,90 |
| Sentence-Qwen2.5-Bi-EN-0.5B | Qwen2.5 | 494M | 57,19 | 44,18 | 79,48 | 71,92 | 45,23 | 45,15 |
| Sentence-InstructLM-Bi-EN-0.5B | Mistral | 518M | 57,73 | 46,11 | 80,01 | 73,19 | 45,71 | 43,62 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,4 GB solo para pesos (677M parámetros), más memoria para activaciones y el tokenizer; en la práctica, entre 2 y 3 GB para lotes pequeños.
- VRAM estimada en FP32: unos 2,7 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para lotes pequeños; A100, H100 y L40S para indexación a gran escala; RTX 4090, RTX 3090, RTX 4070 o superiores para desarrollo y producción moderada.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más, incluidas GTX 1650, RTX 3050 y modelos superiores.
- Opciones de despliegue: sentence-transformers (recomendado, versión >= 4.1.0), transformers (>= 4.51.0) con accelerate (>= 1.6.0), text-embeddings-inference y endpoints de Hugging Face. La model card recomienda flash-attn >= 2.7.3 y torch_dtype bfloat16 con flash_attention_2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTEB-Avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentence-ModernBERT-EN-0.5B | 677M | 8.192 | 53,66 | MIT | Hugging Face |
| Sentence-Sarashina-Bi-EN-0.5B | 661M | no disponible | 56,54 | no disponible | Hugging Face |
| Sentence-Qwen2.5-Bi-EN-0.5B | 494M | no disponible | 57,19 | no disponible | Hugging Face |
| Sentence-InstructLM-Bi-EN-0.5B | 518M | no disponible | 57,73 | no disponible | Hugging Face |

Frente a sus alternativas de la misma serie, este modelo destaca por la ventana de 8.192 tokens propia de ModernBERT y por una licencia MIT explícita, pero obtiene métricas inferiores en todas las familias de MTEB salvo en la comparación con Llama-Bi y Mistral-Bi. La información sobre contexto y licencia de los modelos competidores no figura en la documentación disponible.

## Limitaciones y advertencias

- Solo soporta inglés; no se han documentado capacidades multilingües.
- Es un encoder de embeddings: no genera texto, no razona y no soporta tool calling ni agentes.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos en similitud cuando los textos comparten vocabulario sin compartir significado.
- Rendimiento inferior a varios modelos de la misma familia en MTEB (eng, v2), especialmente frente a InstructLM-Bi y Qwen2.5-Bi.
- La model card no documenta sesgos específicos ni evaluación de robustez; los sesgos de los datos de entrenamiento (NLI, MS MARCO, NQ, SQuAD, TriviaQA) pueden trasladarse a los embeddings.
- No se han publicado datos sobre cuantización ni sobre rendimiento en dominios especializados (legal, médico, código).
- Requiere versiones concretas de sentence-transformers (>= 4.1.0), transformers (>= 4.51.0) y accelerate (>= 1.6.0); flash-attn es opcional pero recomendado.
- El modelo tiene un volumen de descargas muy bajo (3 en el momento de la consulta), lo que limita la evidencia de uso en producción.
- La licencia MIT permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento subyacentes antes de un despliegue crítico.

## Enlaces

- Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-0.5B
- Modelo base: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-0.5B-PT
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- README en japonés: README_JA.md (en el repositorio del modelo)
- Cita: Okada, R. y Sugimoto, T. (2026), «同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析», NLP2026
- Licencia MIT: https://opensource.org/license/mit/
