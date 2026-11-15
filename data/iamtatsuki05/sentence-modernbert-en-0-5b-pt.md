# iamtatsuki05/Sentence-ModernBERT-EN-0.5B-PT

## Resumen

Sentence-ModernBERT-EN-0.5B-PT es un modelo de embeddings de frases en ingles construido sobre el encoder ModernBERT y publicado por el usuario iamtatsuki05 dentro de la coleccion MIREI. No es un modelo generativo: su funcion es transformar texto en vectores densos de 1.280 dimensiones (mean pooling) para tareas de similitud semantica, recuperacion de informacion y clustering. El modelo parte de iamtatsuki05/ModernBERT-EN-0.5B-PT-stage2 y se entrena con aprendizaje contrastivo debilmente supervisado sobre los subconjuntos debilmente supervisados de sentence-transformers/embedding-training-data, aproximadamente 16,1 millones de pares.

La relevancia de la propuesta esta en la combinacion de arquitectura ModernBERT con una ventana de contexto de 8.192 tokens, muy superior a la de los encoders clasicos tipo BERT (512 tokens), manteniendo un tamano contenido de 677 millones de parametros totales (546 millones sin contar los embeddings). Esto permite indexar documentos completos o pasajes largos sin truncamiento agresivo, algo critico en pipelines de RAG y busqueda semantica. El tokenizer es SentencePiece con un vocabulario de 102.400 entradas y la codificacion posicional usa RoPE (rotary position embeddings).

El modelo se distribuye con licencia MIT, lo que elimina friccion para uso comercial, y es compatible con text-embeddings-inference. Su naturaleza monolingue (solo ingles) y su orientacion exclusiva a representaciones lo hacen adecuado como componente de recuperacion dentro de sistemas mayores, no como modelo autonomo de conversacion. La ficha tecnica disponible no incluye resultados de benchmarks, por lo que las cifras de rendimiento deben validarse en el propio corpus de cada despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional) |
| Parametros totales | 677.538.560 (677M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.280 (mean pooling) |
| Tokenizer | SentencePiece, vocabulario 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Parametros sin embeddings | 546M |
| Tamano del repo | 2,7 GB |
| Libreria | sentence-transformers >= 4.1.0 |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT, es decir, un transformer bidireccional con atencion completa sobre una ventana de 8.192 tokens y RoPE como mecanismo de posicion. ModernBERT incorpora optimizaciones propias de la familia, como capas de atencion alternando entre atencion global y atencion local deslizante, pensadas para reducir coste computacional en contextos largos; la model card no desglosa el detalle de estas capas ni el numero de capas o dimensiones internas, por lo que esos datos no estan disponibles en la informacion proporcionada. Sobre esta base se aplica un pooling por media para producir un unico vector de 1.280 dimensiones por texto, normalizado y comparable por similitud coseno.

El entrenamiento es contrastivo debilmente supervisado sobre los subconjuntos debilmente supervisados del dataset sentence-transformers/embedding-training-data, con aproximadamente 16,1 millones de pares de entrenamiento segun la model card. No se documentan fases de RLHF, DPO ni ajuste con datos anotados manualmente. El autor declara que este modelo comparte exactamente la misma receta que el resto de la serie de encoders ingleses de 0,5B de la coleccion MIREI (variantes Llama, Sarashina, Mistral y Qwen2.5), lo que sugiere un diseno controlado para comparar arquitecturas bajo condiciones identicas, tal como refleja la cita academica asociada (NLP2026).

## Capacidades

- Generacion de embeddings de frases en ingles con normalizacion L2 opcional y similitud coseno.
- Recuperacion densa (dense retrieval) sobre pasajes de hasta 8.192 tokens sin truncamiento.
- Similitud semantica entre pares de textos (sentence-similarity).
- Feature extraction a nivel de token y de frase mediante la API de sentence-transformers.
- Clustering y deduplicacion semantica de corpus.
- Clasificacion y reranking por similitud de embeddings.
- Soporte de integracion con text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es un encoder puro.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Recuperacion aumentada por generacion (RAG): el modelo indexa pasajes de documentacion de hasta 8.192 tokens y devuelve los vecinos mas cercanos a la consulta; la ventana larga evita fragmentar documentos tecnicos y reduce la perdida de contexto en la recuperacion.
- Busqueda semantica en bases de conocimiento internas: se precalculan embeddings de 1.280 dimensiones para cada documento y se sirven con un indice ANN (FAISS, Qdrant, pgvector), usando similitud coseno para ordenar resultados.
- Deduplicacion de datasets de entrenamiento: se agrupan frases casi identicas mediante clustering sobre los embeddings normalizados, lo que permite eliminar redundancia antes de entrenar otros modelos.
- Filtrado y enrutamiento de tickets de soporte: se compara la consulta del usuario con una taxonomia de categorias preembeddida y se asigna la categoria de mayor similitud, como paso previo a un LLM generativo.
- Reranking de resultados de busqueda lexica: tras una primera fase BM25, se reordenan los candidatos con similitud coseno entre consulta y documento, mejorando la precision del top-k.
- Evaluacion de calidad de traducciones o parafrasis: se mide la similitud semantica entre el texto original y la version reescrita para detectar desviaciones de significado.
- Construccion de memoria semantica en agentes: se almacenan interacciones pasadas como vectores y se recuperan por similitud para inyectar contexto relevante en prompts posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,4 GB solo para pesos (677M parametros x 2 bytes), mas activaciones; en la practica entre 2 y 4 GB para lotes pequenos.
- VRAM estimada en float32: aproximadamente 2,7 GB para pesos, entre 4 y 6 GB con activaciones.
- GPU recomendadas para produccion: A100, H100 o L40S para indexacion masiva por lotes; T4 o L4 suficientes para servir consultas individuales.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, incluso con lotes moderados.
- Despliegue: sentence-transformers nativo, text-embeddings-inference (soporte declarado en los tags), vLLM no aplica por ser encoder, llama.cpp y Ollama no estan documentados para este modelo.
- Requisitos de libreria declarados: sentence-transformers >= 4.1.0, transformers >= 4.51.0, accelerate >= 1.6.0, sentencepiece >= 0.2.0, flash-attn >= 2.7.3.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la longitud de los textos, con coste cuadratico en atencion global para secuencias cercanas a 8.192 tokens.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Dimension embedding | Licencia | Idiomas |
|---|---|---|---|---|---|---|
| iamtatsuki05/Sentence-ModernBERT-EN-0.5B-PT | ModernBERT | 677M | 8.192 | 1.280 | MIT | en |
| iamtatsuki05/Sentence-Llama-Bi-EN-0.5B-PT | Llama (bidireccional) | 661M | no disponible | no disponible | no disponible | en |
| iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B-PT | Mistral (bidireccional) | 518M | no disponible | no disponible | no disponible | en |
| iamtatsuki05/Sentence-Qwen2.5-Bi-EN-0.5B-PT | Qwen2.5 (bidireccional) | 494M | no disponible | no disponible | no disponible | en |

Las variantes de la misma serie comparten receta de entrenamiento y dataset, lo que las convierte en la referencia natural para comparar arquitecturas; la model card no aporta metricas comparativas de rendimiento entre ellas, por lo que cualquier comparacion cuantitativa queda pendiente de evaluacion propia. Frente a encoders clasicos tipo BERT-base (512 tokens de contexto, ~110M parametros), este modelo ofrece 16 veces mas ventana a costa de un tamano aproximadamente seis veces mayor.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: el rendimiento en castellano u otros idiomas no esta respaldado por el entrenamiento y sera degradado.
- Encoder sin capacidad generativa: no produce texto, no responde instrucciones y no ejecuta tool calling; debe combinarse con un LLM para tareas de generacion.
- Entrenamiento debilmente supervisado: los pares de entrenamiento no estan curados manualmente, lo que puede introducir ruido en la similitud para dominios muy especializados.
- Riesgo de sesgos heredados de los datos web de embedding-training-data, incluidos sesgos demograficos, culturales y de dominio.
- Sin benchmarks publicados: no hay evidencia documentada de calidad en MTEB ni en tareas de retrieval especificas, por lo que se recomienda validar en el corpus objetivo antes de produccion.
- Coste de atencion cuadratico en contextos cercanos a 8.192 tokens, lo que encarece la indexacion de documentos largos frente a encoders de ventana corta.
- Dependencia de flash-attn >= 2.7.3 para el rendimiento declarado en el codigo de ejemplo; sin esa libreria la inferencia funciona pero con menor eficiencia.
- Licencia MIT permite uso comercial sin restricciones de atribucion obligatoria mas alla de conservar el aviso de copyright, pero no exime de responsabilidad sobre el uso de los embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-0.5B-PT
- Modelo base: https://huggingface.co/iamtatsuki05/ModernBERT-EN-0.5B-PT-stage2
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Variante Llama de la serie: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-0.5B-PT
- Variante Sarashina de la serie: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-0.5B-PT
- Variante Mistral de la serie: https://huggingface.co/iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B-PT
- Variante Qwen2.5 de la serie: https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Bi-EN-0.5B-PT
- Variante Qwen2.5 Scratch de la serie: https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Scratch-Bi-EN-0.5B-PT
- Variante InstructLM de la serie: https://huggingface.co/iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B-PT
- Licencia MIT: https://opensource.org/license/mit/
