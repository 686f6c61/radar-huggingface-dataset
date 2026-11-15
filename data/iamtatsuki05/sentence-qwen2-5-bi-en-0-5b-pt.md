# iamtatsuki05/Sentence-Qwen2.5-Bi-EN-0.5B-PT

## Resumen

Sentence-Qwen2.5-Bi-EN-0.5B-PT es un modelo de embeddings de frases en inglés desarrollado por iamtatsuki05 (serie MIREI), construido sobre el modelo base iamtatsuki05/Qwen2.5-Bi-EN-0.5B, que a su vez deriva de la arquitectura Qwen2.5. No es un modelo generativo: se trata de un encoder bi-direccional de doble torre (bi-encoder) que produce representaciones vectoriales de 896 dimensiones mediante mean pooling, pensado para tareas de similitud semántica, recuperación de información y búsqueda semántica.

El modelo se ha afinado con entrenamiento contrastivo débilmente supervisado sobre los subconjuntos débilmente supervisados de sentence-transformers/embedding-training-data, con aproximadamente 16,1 millones de pares de entrenamiento. Su relevancia radica en que adapta un transformer decoder de la familia Qwen2.5 (494 millones de parámetros totales, 357 millones sin contar embeddings) al paradigma de embeddings de frases, ofreciendo una ventana de contexto de 32.768 tokens muy superior a la de los encoders BERT clásicos de tamaño similar.

Con licencia MIT, pesos en safetensors y compatibilidad con sentence-transformers y text-embeddings-inference, es una opción práctica para pipelines de RAG y búsqueda semántica en inglés donde se requiera contexto largo y despliegue en hardware modesto. El modelo se publicó en julio de 2026 y se actualizó en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (transformer decoder adaptado a bi-encoder de doble torre) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (la model card no detalla cuantizaciones publicadas; los pesos se distribuyen en safetensors en bfloat16) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 896 (mean pooling) |
| Tokenizador | Qwen2.5 (byte-level BPE), vocabulario de 151.936 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Parametros sin embeddings | 357M |
| Tamano del repositorio | 2,0 GB |

## Arquitectura y entrenamiento

El modelo parte de un transformer de arquitectura Qwen2.5 con codificación posicional RoPE y tokenizador byte-level BPE de 151.936 entradas. Sobre esa base se aplica un esquema bi-encoder de doble torre: consultas y documentos se codifican de forma independiente y se comparan mediante similitud coseno, lo que permite precomputar los embeddings de los documentos e indexarlos para búsqueda. La representación final se obtiene por mean pooling y tiene 896 dimensiones.

El entrenamiento consiste en ajuste contrastivo débilmente supervisado sobre los subconjuntos débilmente supervisados del dataset sentence-transformers/embedding-training-data, con aproximadamente 16,1 millones de pares. La model card no detalla el número exacto de tokens procesados ni si se aplicaron fases adicionales de RLHF o DPO (no aplicable en un modelo de embeddings). El modelo forma parte de una serie de encoders de 0,5B que comparten receta de entrenamiento sobre distintas arquitecturas (ModernBERT, Llama, Mistral, Qwen2.5), lo que permite comparar arquitecturas bajo condiciones idénticas, tal como recoge la citación asociada a NLP2026.

## Capacidades

- Generación de embeddings de frases y documentos en inglés con representación de 896 dimensiones y normalización opcional para similitud coseno.
- Similitud semántica entre pares de textos (sentence-similarity).
- Recuperación de información (retrieval) en configuraciones bi-encoder con indexación previa de documentos.
- Extracción de características (feature-extraction) para pipelines de clasificación, clustering y deduplicación semántica.
- Procesamiento de secuencias de hasta 32.768 tokens, adecuado para documentos largos sin truncado agresivo.
- Integración con sentence-transformers (versión 4.1.0 o superior) y con text-embeddings-inference para servir endpoints compatibles.
- Soporte de flash-attention 2 (flash-attn 2.7.3 o superior) para acelerar la inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni modos de pensamiento: es un modelo exclusivamente de embeddings.
- No dispone de capacidades multimodales (visión o audio) ni multilingües más allá del inglés.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales, RFCs o documentación de API en inglés y recuperar fragmentos relevantes por similitud coseno; la ventana de 32.768 tokens permite indexar secciones largas sin trocear en exceso.
- RAG sobre bases de conocimiento internas: precomputar embeddings de 896 dimensiones de todos los documentos y usar el modelo como retriever en un pipeline de generación aumentada, con latencia baja gracias a los 494M de parámetros.
- Deduplicación y clustering de tickets de soporte: agrupar incidencias con el mismo significado semántico aunque usen vocabulario distinto, aprovechando la similitud coseno sobre embeddings normalizados.
- Filtrado de candidatos en sistemas de moderación o curación de contenido: comparar textos contra un conjunto de referencia de ejemplos etiquetados y ordenar por similitud para priorizar revisión humana.
- Evaluación de similitud entre respuestas generadas y respuestas de referencia: usar el modelo como métrica semántica en pipelines de evaluación de calidad de asistentes conversacionales en inglés.
- Motor de recomendación de contenido textual: calcular embeddings de artículos o publicaciones y recomendar elementos cercanos al historial del usuario mediante búsqueda de vecinos más próximos.
- Enrutamiento de consultas en sistemas multi-herramienta: clasificar la intención de una consulta comparándola con embeddings de ejemplos por intención, sin necesidad de un LLM generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MTEB, BEIR ni de ningún otro conjunto de evaluación, ni tablas comparativas de rendimiento frente a otros encoders.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bfloat16 para los 494M de parámetros (los pesos safetensors suman 2,0 GB en el repositorio, lo que sugiere pesos en bfloat16 o fp32 según el fichero; en bfloat16 el modelo ocupa en torno a 1 GB).
- Cabe holgadamente en GPU de consumo: RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090, así como en GPUs de datacenter A100 y H100.
- También es viable en CPU para cargas moderadas, dado el tamaño reducido del modelo, aunque con mayor latencia.
- Opciones de despliegue: sentence-transformers (4.1.0+), text-embeddings-inference (endpoints compatibles según los tags del repositorio), transformers (4.51.0+) con accelerate (1.6.0+) y flash-attn (2.7.3+) para aceleración por GPU.
- Requiere trust_remote_code=True por el código personalizado incluido en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La propia serie MIREI del autor ofrece alternativas directamente comparables, entrenadas con la misma receta sobre los mismos datos:

| Modelo | Arquitectura | Parametros | Parametros sin embeddings | Contexto | Licencia |
|---|---|---|---|---|---|
| Sentence-Qwen2.5-Bi-EN-0.5B-PT (este) | Qwen2.5 | 494M | 357M | 32.768 | MIT |
| Sentence-Qwen2.5-Scratch-Bi-EN-0.5B-PT | Qwen2.5 | 494M | 357M | no disponible | MIT |
| Sentence-ModernBERT-EN-0.5B-PT | ModernBERT | 677M | 546M | no disponible | MIT |
| Sentence-Llama-Bi-EN-0.5B-PT | Llama | 661M | 530M | no disponible | MIT |
| Sentence-Mistral-Bi-EN-0.5B-PT | Mistral | 518M | 469M | no disponible | MIT |

No se dispone de datos de rendimiento comparativo (MTEB u otros) entre estos modelos en la información proporcionada, por lo que la elección entre ellos no puede basarse en métricas publicadas en esta ficha.

## Limitaciones y advertencias

- Solo soporta inglés; no debe usarse para recuperación o similitud en otros idiomas.
- Es un modelo de embeddings, no generativo: no puede producir texto, razonar ni ejecutar herramientas.
- El entrenamiento es débilmente supervisado, lo que puede degradar la precisión en dominios muy especializados (legal, médico, código) frente a encoders afinados con datos supervisados específicos.
- Riesgo de sesgos heredados del corpus de entrenamiento (embedding-training-data) y del modelo base Qwen2.5; no se documentan evaluaciones de sesgo en la model card.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de retrieval debe validarse empíricamente antes de producción.
- Requiere trust_remote_code=True, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de desplegarlo en entornos sensibles.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero no se ofrece garantía alguna sobre el modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Bi-EN-0.5B-PT
- Modelo base: https://huggingface.co/iamtatsuki05/Qwen2.5-Bi-EN-0.5B
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Modelo hermano Qwen2.5 Scratch: https://huggingface.co/iamtatsuki05/Sentence-Qwen2.5-Scratch-Bi-EN-0.5B-PT
- Modelo hermano ModernBERT: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-0.5B-PT
- Modelo hermano Llama: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-0.5B-PT
- Modelo hermano Mistral: https://huggingface.co/iamtatsuki05/Sentence-Mistral-Bi-EN-0.5B-PT
- Modelo hermano InstructLM: https://huggingface.co/iamtatsuki05/Sentence-InstructLM-Bi-EN-0.5B-PT
- Modelo hermano Sarashina: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-0.5B-PT
- Licencia MIT: https://opensource.org/license/mit/
