# iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B-PT

## Resumen

Sentence-InstructLM-Bi-EN-0.5B-PT es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05 dentro de la familia MIREI. Se construye envolviendo el modelo de lenguaje InstructLM-Bi-EN-0.5B (arquitectura Mistral) con un entrenamiento contrastivo débilmente supervisado sobre los subconjuntos weakly supervised del dataset `sentence-transformers/embedding-training-data`, que suman aproximadamente 16,1 millones de pares de entrenamiento. El resultado es un codificador bi-encoder que produce embeddings de 1536 dimensiones mediante mean pooling.

El modelo resuelve el problema de la generación de representaciones vectoriales de frases y pasajes para tareas de recuperación de información, similitud semántica y búsqueda semántica. Frente a los encoders tipo BERT, apuesta por reutilizar un decoder Mistral como encoder, una tendencia alineada con la línea de trabajo llm2vec, que busca aprovechar el conocimiento de los modelos generativos en tareas de embedding.

Con 518.702.592 parámetros totales (469M sin contar embeddings según la model card), una longitud máxima de secuencia de 2048 tokens y licencia MIT, es una opción ligera y permisiva para desplegar pipelines de retrieval en producción. Su relevancia actual radica en su tamaño reducido, su compatibilidad con `sentence-transformers` y `text-embeddings-inference`, y su pertenencia a una serie homogénea de encoders (ModernBERT, Llama, Sarashina, Mistral, Qwen2.5) que permite comparar arquitecturas bajo un mismo recetario de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral (decoder transformer reutilizado como encoder bi-encoder) |
| Parametros totales | 518.702.592 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, ejecutable en bfloat16) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 1.536 (mean pooling) |
| Tokenizer | Mistral, vocabulario de 32.000 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Modelo base | iamtatsuki05/InstructLM-Bi-EN-0.5B |
| Tamano del repo | 2,1 GB |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

El modelo parte de InstructLM-Bi-EN-0.5B, un transformer de tipo Mistral con codificacion posicional RoPE y tokenizer Mistral de 32.000 entradas. Sobre esa base se aplica un recetario bi-encoder: se procesan consultas y documentos de forma independiente y se obtiene un unico vector por texto mediante mean pooling, con salida de 1536 dimensiones. La similitud se calcula con distancia coseno sobre embeddings normalizados.

El entrenamiento es contrastivo débilmente supervisado y se realiza sobre los subconjuntos weakly supervised de `sentence-transformers/embedding-training-data`, que la model card cifra en unos 16,1 millones de pares. Este mismo recetario se comparte con el resto de la serie MIREI (ModernBERT, Llama, Sarashina, Mistral y Qwen2.5), lo que permite comparar arquitecturas bajo condiciones homogéneas. La model card no detalla hiperparámetros, número de tokens vistos, ni si hubo fases adicionales de RLHF o DPO; esos datos no están disponibles. El modelo requiere `sentence-transformers>=4.1.0`, `transformers>=4.51.0`, `accelerate>=1.6.0`, `sentencepiece>=0.2.0` y `flash-attn>=2.7.3`, y se carga con `trust_remote_code=True` por el código personalizado asociado a la serie.

## Capacidades

- Generación de embeddings de frases y pasajes en inglés de 1536 dimensiones, pensados para similitud semántica y recuperación.
- Codificación bi-encoder: consultas y documentos se procesan por separado, lo que permite precalcular embeddings de un corpus y hacer búsqueda por vecino más cercano.
- Soporte de similitud coseno mediante `model.similarity` de sentence-transformers, con normalización de embeddings incluida en la API.
- Longitud de contexto de 2048 tokens, adecuada para pasajes y documentos de tamaño medio.
- Compatible con `text-embeddings-inference` y con endpoints compatibles, según los tags del repositorio.
- No es un modelo generativo: no soporta tool calling, function calling, razonamiento multi-step ni modo thinking.
- No soporta visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: se precalculan los embeddings de 1536 dimensiones de cada fragmento de documentación y se indexan en una base vectorial; en consulta se codifica la pregunta y se recuperan los fragmentos más próximos por coseno. El contexto de 2048 tokens permite indexar secciones completas sin trocear en exceso.
- Motor de recuperación en un pipeline RAG: el modelo actúa como retriever bi-encoder para alimentar un LLM generativo. Su tamaño de 518M parámetros permite desplegarlo en la misma infraestructura que el generador sin competir por VRAM de forma significativa.
- Deduplicación y agrupación de contenidos: al generar embeddings normalizados de artículos, tickets o registros, se pueden detectar duplicados y agrupar por similitud coseno con umbrales calibrados.
- Clasificación semántica por vecino más cercano: con un conjunto pequeño de ejemplos etiquetados se construye un clasificador k-NN sobre los embeddings, útil para enrutado de tickets o etiquetado de soporte sin reentrenar el modelo.
- Búsqueda interna en bases de conocimiento de empresa: indexación de políticas, manuales y FAQs en inglés con recuperación semántica en lugar de coincidencia léxica, aprovechando la licencia MIT para uso comercial interno.
- Evaluación de similitud entre pares de frases: comparación de respuestas generadas contra respuestas de referencia, detección de paráfrasis o medición de consistencia entre versiones de un texto.
- Filtrado previo en pipelines de moderación o curación de datos: selección de pares texto-texto con alta similitud para construir datasets de entrenamiento o para descartar contenido redundante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 518,7M parámetros ocupan aproximadamente 1,04 GB de pesos; con activaciones y overhead de runtime, el consumo realista se sitúa en torno a 2-3 GB para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16 en lotes pequeños; A100, H100 o L40S para indexación a gran escala con lotes grandes.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de portátil con 6-8 GB.
- Opciones de despliegue: `sentence-transformers` con `flash_attention_2` (requisito declarado de `flash-attn>=2.7.3`), `text-embeddings-inference` para servir embeddings vía HTTP, y endpoints compatibles según los tags del repositorio. No se declaran pesos GGUF, por lo que llama.cpp y Ollama no están soportados de forma nativa.
- Latencia y throughput: no disponibles; la model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Dimension embedding | Licencia |
|---|---|---|---|---|---|
| Sentence-InstructLM-Bi-EN-0.5B-PT (este) | Mistral | 518M | 2.048 | 1.536 | MIT |
| Sentence-Mistral-Bi-EN-0.5B-PT | Mistral | 518M | no disponible | no disponible | MIT |
| Sentence-Llama-Bi-EN-0.5B-PT | Llama | 661M | no disponible | no disponible | MIT |
| Sentence-ModernBERT-EN-0.5B-PT | ModernBERT | 677M | no disponible | no disponible | MIT |
| Sentence-Qwen2.5-Bi-EN-0.5B-PT | Qwen2.5 | 494M | no disponible | no disponible | MIT |

Los cinco modelos pertenecen a la misma serie MIREI y comparten el recetario de entrenamiento weakly supervised sobre los mismos 16,1M de pares, por lo que la comparación aísla el efecto de la arquitectura base. No se han publicado métricas comparativas de rendimiento entre ellos en la información disponible.

## Limitaciones y advertencias

- Solo inglés: no se declara soporte de otros idiomas, por lo que su uso en castellano u otras lenguas producirá embeddings de baja calidad.
- Ventana de 2048 tokens: documentos más largos deben trocearse, con el riesgo de perder contexto entre fragmentos.
- Modelo bi-encoder no generativo: no puede responder preguntas ni razonar; solo produce representaciones vectoriales.
- Riesgo de sesgos heredados del corpus de entrenamiento y del modelo base InstructLM-Bi-EN-0.5B; no se documentan evaluaciones de sesgo en la model card.
- Entrenamiento débilmente supervisado: la calidad de los pares de `embedding-training-data` condiciona la calidad del embedding; no se declaran métricas de recuperación (Recall@k, nDCG, MTEB) que permitan verificar su rendimiento real.
- Requiere `trust_remote_code=True` por el código personalizado de la serie, lo que implica ejecutar código del autor del modelo; conviene auditar el repositorio antes de desplegarlo en producción.
- Dependencia de `flash-attn>=2.7.3` según la model card, lo que puede complicar el despliegue en entornos sin CUDA compatible o en CPU.
- Sin descargas ni likes en el momento de la consulta, y sin resultados de benchmarks publicados: la evidencia de calidad es escasa.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero se recomienda conservar el aviso de copyright y citar el trabajo asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B-PT
- Modelo base: https://huggingface.co/iamtatsuki05/InstructLM-Bi-EN-0.5B
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Modelo hermano Sentence-Mistral-Bi-EN-0.5B-PT: https://huggingface.co/iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B-PT
- Modelo hermano Sentence-Llama-Bi-EN-0.5B-PT: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-0.5B-PT
- Modelo hermano Sentence-ModernBERT-EN-0.5B-PT: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-0.5B-PT
- Modelo hermano Sentence-Qwen2.5-Bi-EN-0.5B-PT: https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Bi-EN-0.5B-PT
- Modelo hermano Sentence-Sarashina-Bi-EN-0.5B-PT: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-0.5B-PT
- Modelo hermano Sentence-Qwen2.5-Scratch-Bi-EN-0.5B-PT: https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Scratch-Bi-EN-0.5B-PT
- Licencia MIT: https://opensource.org/license/mit/
