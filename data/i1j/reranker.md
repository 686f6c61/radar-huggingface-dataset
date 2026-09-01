# i1j/reranker

## Resumen

El modelo `i1j/reranker` es un cross-encoder de reranking de texto, desarrollado por el usuario i1j como un ajuste fino (finetune) del modelo base `BAAI/bge-reranker-v2-m3` de BAAI. Está construido sobre la arquitectura XLM-RoBERTa y se publica a través de la librería sentence-transformers, lo que permite su uso directo para puntuar pares de texto (consulta, documento) y reordenar resultados de búsqueda. Con 567,7 millones de parámetros y una ventana de contexto de 8192 tokens, está orientado a mejorar la relevancia en sistemas de recuperación aumentada por generación (RAG) y búsqueda semántica.

El modelo resuelve el problema de la segunda etapa de recuperación: tras obtener un conjunto amplio de candidatos mediante búsqueda vectorial (típicamente 50-100 documentos), un reranker cross-encoder evalúa conjuntamente cada par consulta-documento para producir una puntuación de relevancia más precisa que la similitud coseno de los embeddings. Esto permite seleccionar los 3-5 documentos más relevantes antes de pasarlos al generador. Su relevancia actual radica en que los rerankers son un componente crítico en pipelines de RAG de producción, donde la calidad de la recuperación determina directamente la calidad de las respuestas generadas.

Al ser un finetune del modelo bge-reranker-v2-m3, hereda su capacidad multilingüe (aunque no se especifican los idiomas exactos en la ficha) y su diseño de cross-encoder, que sacrifica eficiencia computacional por precisión. El repositorio no incluye información sobre el dataset de entrenamiento, la licencia ni los idiomas soportados, lo que limita su evaluación para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (CrossEncoder, XLMRobertaForSequenceClassification) |
| Parametros totales | 567.755.777 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors en fp32) |
| Idiomas soportados | no disponible (hereda capacidad multilingue de XLM-RoBERTa, sin lista oficial) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repo: 2,3 GB) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en XLM-RoBERTa, configurado como `XLMRobertaForSequenceClassification` con una única etiqueta de salida (puntuación de relevancia). A diferencia de los bi-encoders que generan embeddings independientes para consulta y documento, el cross-encoder procesa el par concatenado a través de toda la red, lo que permite interacciones profundas entre ambos textos y produce puntuaciones más precisas, aunque con mayor coste computacional. La arquitectura completa se describe como `CrossEncoder(Transformer(XLMRobertaForSequenceClassification))`.

El entrenamiento se realizó como un ajuste fino del modelo `BAAI/bge-reranker-v2-m3` utilizando la librería sentence-transformers en su versión 6.0.1, con Python 3.12.13, Transformers 5.0.0 y PyTorch 2.10.0. No se proporciona información sobre el dataset de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF o DPO. El modelo base bge-reranker-v2-m3 es conocido por su soporte multilingüe y su entrenamiento con datos de pares consulta-documento, pero los detalles específicos del finetune de i1j no están documentados.

## Capacidades

- Reranking de pares texto-texto: puntúa la relevancia entre una consulta y un documento, devolviendo un valor escalar (ej. 0.9969 para un par relevante).
- Búsqueda semántica de segunda etapa: ordena una lista de documentos candidatos según su similitud con una consulta dada.
- Soporte de contexto largo: ventana de 8192 tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Integración con sentence-transformers: API unificada para carga, predicción y ranking (`model.predict` y `model.rank`).
- Compatible con Text Embeddings Inference (TEI) y endpoints de Hugging Face, según las etiquetas del repositorio.
- Capacidad multilingüe heredada de XLM-RoBERTa, aunque sin lista oficial de idiomas en la ficha.

## Casos de uso

- Mejora de pipelines RAG: tras una recuperación inicial con embeddings (por ejemplo, 100 documentos), el modelo reordena los candidatos y selecciona los 5 más relevantes para pasarlos al generador, reduciendo ruido y mejorando la fidelidad de las respuestas.
- Búsqueda semántica en bases de conocimiento empresarial: dado un corpus de documentos internos, el modelo puede puntuar pares consulta-documento para devolver los resultados más pertinentes, superando las limitaciones de la similitud coseno.
- Filtrado de resultados en motores de búsqueda híbridos: combinar búsqueda por palabras clave (BM25) con reranking por cross-encoder para obtener resultados más precisos en dominios específicos.
- Sistemas de preguntas y respuestas: dado un conjunto de pasajes candidatos extraídos de una base documental, el modelo selecciona el pasaje más relevante para cada pregunta, mejorando la exactitud de las respuestas.
- Moderación de contenido o clasificación de relevancia: puntuar pares de textos para detectar contenido relacionado o duplicado, aprovechando la ventana de 8192 tokens para comparar documentos largos.
- Evaluación de calidad de recuperación: usar las puntuaciones del modelo como métrica de relevancia para comparar diferentes estrategias de recuperación o para crear datasets de entrenamiento de bi-encoders.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas como MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Dado que es un finetune de `BAAI/bge-reranker-v2-m3`, se espera un rendimiento similar al modelo base en tareas de reranking multilingüe, pero no hay datos verificables en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 567,7 millones de parámetros. En fp32 (2,3 GB de pesos), se necesitan aproximadamente 4-5 GB de VRAM para inferencia con batch pequeño. En fp16, la VRAM se reduce a ~1,2 GB para los pesos, más overhead de activaciones, por lo que cabría en GPUs con 4 GB o más.
- GPU recomendadas: para inferencia en producción, una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, A10) es suficiente. Para despliegues de alto throughput, se recomienda A100 o H100.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs consumer como RTX 3090 (24 GB) o RTX 4090 (24 GB) sin problemas, e incluso en GPUs de 8 GB si se usa cuantización (aunque no se proporcionan versiones cuantizadas en el repo).
- Opciones de despliegue: vLLM, Text Embeddings Inference (TEI), sentence-transformers, Hugging Face Inference Endpoints, y llama.cpp (si se convierte a GGUF, aunque no se proporciona).
- Latencia y throughput: no disponible. Al ser un cross-encoder, la latencia es mayor que la de un bi-encoder; para un par de textos de longitud media (~500 tokens), se estima un tiempo de inferencia de decenas de milisegundos en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| i1j/reranker (este) | 567,7 M | 8192 | no disponible | Reranking multilingüe |
| BAAI/bge-reranker-v2-m3 (base) | 568 M | 8192 | MIT (según repo original) | Reranking multilingüe |
| jinaai/jina-reranker-m0 | no disponible | no disponible | no disponible | Reranking general |

No se dispone de datos de rendimiento comparativo. El modelo base bge-reranker-v2-m3 es ampliamente utilizado en la comunidad por su equilibrio entre precisión y velocidad, y este finetune hereda su arquitectura. Jina Reranker es otra alternativa popular, pero sin datos concretos de este modelo no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un finetune de XLM-RoBERTa, puede heredar sesgos presentes en los datos de preentrenamiento del modelo base, especialmente en dominios sensibles como género, etnia o religión.
- Riesgo de alucinación: como modelo de reranking, no genera texto, pero sus puntuaciones pueden ser poco fiables para pares de textos fuera de su distribución de entrenamiento, lo que podría llevar a seleccionar documentos irrelevantes.
- Limitaciones de contexto: aunque soporta 8192 tokens, el rendimiento puede degradarse con textos muy largos o con múltiples documentos concatenados.
- Restricciones de licencia: la licencia no está especificada en el repositorio, lo que impide determinar si es apto para uso comercial. Se recomienda contactar al autor antes de usarlo en producción.
- Falta de documentación: no se proporcionan detalles sobre el dataset de entrenamiento, los idiomas soportados ni los benchmarks, lo que dificulta evaluar su calidad y su comportamiento en dominios específicos.
- Dependencia del modelo base: cualquier limitación de `BAAI/bge-reranker-v2-m3` (por ejemplo, rendimiento en idiomas de bajos recursos) se traslada a este finetune.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/i1j/reranker
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Documentación de sentence-transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de sentence-transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Blog de entrenamiento de rerankers: https://huggingface.co/blog/train-reranker
- Blog de modelos multimodales con sentence-transformers: https://huggingface.co/blog/multimodal-sentence-transformers
- Lista curada de rerankers (awesome-rerankers): https://github.com/agentset-ai/awesome-rerankers
