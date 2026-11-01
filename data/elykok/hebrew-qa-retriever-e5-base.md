# ElyKok/hebrew-qa-retriever-e5-base

## Resumen

Hebrew QA Retriever es un modelo de embeddings para recuperación de información en hebreo, desarrollado por ElyKok. Se trata de un fine-tuning de `intfloat/multilingual-e5-base` orientado a la tarea de recuperación de pasajes: dado un enunciado en hebreo, devuelve el párrafo que lo responde. El modelo resuelve un problema concreto de los pipelines RAG en hebreo, donde los retrievers multilingües genéricos rinden por debajo de alternativas léxicas como BM25 en corpus especializados.

El modelo parte de la arquitectura XLM-RoBERTa con 278.043.648 parámetros y se entrena sobre las preguntas respondibles del dataset HeQ (Hebrew Question Answering Dataset), con negativos duros minados y la función de pérdida `CachedMultipleNegativesRankingLoss`. La relevancia actual del modelo es acotada: es un ajuste pequeño y muy específico de dominio e idioma, con 26 descargas y sin likes en HuggingFace, lo que lo sitúa como una pieza de nicho más que como una alternativa generalista.

La ventana de contexto y los tipos de cuantización no están documentados en la información disponible; al ser un encoder tipo XLM-RoBERTa, su uso típico es la generación de embeddings, no la generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer), fine-tuning de `intfloat/multilingual-e5-base` |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | hebreo (he); el modelo base es multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en XLM-RoBERTa, inicializado desde `intfloat/multilingual-e5-base` y ajustado para similitud de frases y recuperación. La salida es un embedding denso normalizado, pensado para búsqueda por similitud coseno sobre un corpus de pasajes. Se mantiene la convención de prefijos del modelo base: `query: ` para las consultas y `passage: ` para los documentos.

El entrenamiento se realizó sobre las preguntas respondibles del dataset HeQ, con negativos duros minados y la pérdida `CachedMultipleNegativesRankingLoss`, con batch de 128, 2 épocas y learning rate 2e-05. Los artículos de test son disjuntos de los de entrenamiento, lo que aporta cierta garantía de generalización dentro del dominio. No se documentan en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en modelos de embeddings).

## Capacidades

- Generación de embeddings de frases y pasajes para búsqueda semántica en hebreo.
- Recuperación de pasajes (retrieval) en un corpus de 4.930 párrafos del dataset HeQ.
- Soporte de prefijos `query: ` y `passage: ` heredados del modelo base e5.
- Similitud semántica entre frases (`pipeline_tag: sentence-similarity`).
- Integración con sentence-transformers y con Text Embeddings Inference (tag `text-embeddings-inference`).
- Compatibilidad con endpoints de HuggingFace (tag `endpoints_compatible`).
- No soporta generación de texto, tool calling ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- Capacidades multilingües limitadas al comportamiento heredado del modelo base; el ajuste está orientado a hebreo.

## Casos de uso

- RAG sobre documentación en hebreo: indexar un corpus de párrafos con embeddings `passage:` y recuperar los más relevantes para cada consulta `query:` antes de pasarlos a un LLM generador. Adecuado por su ajuste específico al dominio de QA en hebreo.
- Búsqueda semántica en bases de conocimiento internas: sustituir o complementar BM25 en un motor de búsqueda corporativo en hebreo, con la ventaja de capturar paráfrasis que la búsqueda léxica no cubre.
- Atención al cliente en hebreo: recuperar artículos de ayuda o fragmentos de FAQ relevantes para la consulta del usuario antes de que un modelo generativo redacte la respuesta.
- Sistemas de preguntas y respuestas extractivas: localizar el párrafo que contiene la respuesta dentro de un corpus cerrado, como paso previo a la extracción de la respuesta.
- Deduplicación y agrupación semántica de documentos en hebreo: usar los embeddings para agrupar pasajes similares o detectar duplicados en un repositorio documental.
- Evaluación de pipelines de retrieval: servir como baseline ajustado al idioma para comparar contra BM25 o contra embeddings multilingües genéricos en pruebas internas.
- Filtrado previo en pipelines de moderación o clasificación: recuperar pasajes candidatos similares a una consulta antes de aplicar un clasificador más costoso.

## Benchmarks y rendimiento

Resultados sobre el test set de HeQ (1.072 preguntas, búsqueda sobre los 4.930 párrafos):

| Modelo | R@1 | R@5 | R@10 | MRR@10 | NDCG@10 | R@5 Wikipedia | R@5 Geektime |
|---|---|---|---|---|---|---|---|
| BM25 (búsqueda por palabras clave) | 73,1 | 86,8 | 89,8 | 79,0 | 81,7 | 91,2 | 82,2 |
| multilingual-e5-base | 67,4 | 81,7 | 86,2 | 73,4 | 76,5 | 86,2 | 77,0 |
| multilingual-e5-large | 72,7 | 87,8 | 91,4 | 79,2 | 82,2 | 90,8 | 84,6 |
| Qwen3-Embedding-0.6B | 55,4 | 70,6 | 76,3 | 62,2 | 65,6 | 74,3 | 66,8 |
| Fine-tuned e5-base (este modelo) | 67,3 | 82,8 | 86,5 | 74,1 | 77,1 | 87,0 | 78,6 |

El ajuste mejora ligeramente a `multilingual-e5-base` en R@5 (82,8 frente a 81,7) y MRR@10 (74,1 frente a 73,4), pero queda por debajo de BM25 en R@1 (67,3 frente a 73,1) y muy por debajo de `multilingual-e5-large` en casi todas las métricas. El autor advierte que las preguntas de HeQ se redactaron consultando el párrafo, por lo que comparten más vocabulario con él que las consultas reales de usuarios.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 1,1 GB de pesos; en fp16, en torno a 0,55 GB. El repo ocupa 1,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TGI), HuggingFace Inference Endpoints (tag `endpoints_compatible`); también es viable en CPU para volúmenes moderados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | R@5 (HeQ) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hebrew QA Retriever (este modelo) | 278 M | no disponible | 82,8 | MIT | HuggingFace |
| multilingual-e5-base | 278 M | no disponible | 81,7 | MIT | HuggingFace |
| multilingual-e5-large | ~560 M | no disponible | 87,8 | MIT | HuggingFace |
| Qwen3-Embedding-0.6B | 0,6 B | no disponible | 70,6 | no disponible | HuggingFace |
| BM25 | no aplica | no aplica | 86,8 | no aplica | implementación libre |

La comparativa se limita al benchmark HeQ publicado por el autor. Frente a `multilingual-e5-large`, este modelo pierde entre 4 y 5 puntos de R@5 con la mitad de parámetros; frente a BM25, pierde en R@1 pero gana en R@5. Para producción en hebreo, un híbrido BM25 + este retriever es una opción razonable según los datos.

## Limitaciones y advertencias

- El ajuste apenas mejora al modelo base en la mayoría de métricas y no supera a BM25 en R@1; conviene validar su uso frente a alternativas léxicas antes de adoptarlo.
- Las preguntas de HeQ se redactaron mirando el párrafo, por lo que el benchmark puede sobreestimar el rendimiento con consultas reales de usuarios.
- El corpus de evaluación es pequeño (4.930 párrafos) y de un dominio concreto (Wikipedia y Geektime); la generalización a otros corpus en hebreo no está documentada.
- Es un encoder de embeddings: no genera texto ni soporta razonamiento, tool calling o agentes.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre HeQ, puede heredar los sesgos de sus fuentes (Wikipedia y Geektime).
- Riesgo de alucinación: no aplica directamente al ser un modelo de recuperación, pero los pasajes recuperados pueden ser irrelevantes si la consulta cae fuera del dominio.
- Licencia MIT: permite uso comercial, pero el modelo base `intfloat/multilingual-e5-base` también es MIT, por lo que no hay restricciones adicionales conocidas.
- El modelo tiene 26 descargas y 0 likes; no hay evidencia de uso en producción ni de validación independiente.
- La longitud de contexto no está documentada; el truncado por defecto de XLM-RoBERTa (habitualmente 512 tokens) puede limitar pasajes largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ElyKok/hebrew-qa-retriever-e5-base
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Dataset HeQ: https://github.com/NNLP-IL/Hebrew-Question-Answering-Dataset
