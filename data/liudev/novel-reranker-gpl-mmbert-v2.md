# liudev/novel-reranker-gpl-mmbert-v2

## Resumen

novel-reranker-gpl-mmbert-v2 es un cross-encoder de reordenación (reranking) desarrollado por el usuario liudev y publicado en Hugging Face. Se trata de un fine-tuning de jhu-clsp/mmBERT-base, un encoder de la familia ModernBERT multilingüe, especializado en puntuar pares de textos (consulta, documento) para tareas de búsqueda semántica y reordenación de resultados. El modelo tiene 307.531.009 parámetros y una longitud máxima de secuencia de 512 tokens.

El modelo está claramente orientado al dominio de la novela web en chino: los ejemplos de la model card y el nombre del repositorio apuntan a un caso de uso de recuperación y ranking de capítulos o pasajes de novelas. Esto lo convierte en una pieza útil para sistemas RAG o motores de búsqueda sobre corpus literarios en chino, donde los rerankers genéricos suelen fallar por falta de adaptación al vocabulario y a las convenciones narrativas del género.

Es relevante ahora porque los pipelines de recuperación de dos etapas (retrieval con embeddings + reranking con cross-encoder) se han consolidado como el estándar de facto en aplicaciones RAG, y disponer de rerankers de dominio específico, pequeños y desplegables en infraestructura modesta, marca la diferencia en calidad de recuperación. La información pública disponible es limitada: no se declaran licencia, idiomas ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBertForSequenceClassification (transformer encoder) |
| Parametros totales | 307.531.009 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización a FP16, INT8 o GGUF no documentada por el autor) |
| Idiomas soportados | no disponible (los ejemplos de la model card están en chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | jhu-clsp/mmBERT-base |
| Funcion de perdida | PreTokenizedMarginMSELoss |
| Tamano del repositorio | 48,0 GB |
| Etiquetas de salida | 1 (score de relevancia) |
| Pipeline | text-ranking |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe el par (query, documento) concatenado y produce una única puntuación de relevancia mediante una cabeza de clasificación sobre el token de agregación. La arquitectura subyacente es ModernBertForSequenceClassification, es decir, un transformer encoder de la familia ModernBERT, que incorpora mejoras sobre BERT clásico como atención con RoPE, alternancia de capas de atención global y local, y soporte nativo de secuencias largas (aunque aquí se limita a 512 tokens). El modelo base mmBERT-base es la variante multilingüe de ModernBERT publicada por el grupo JHU CLSP.

El entrenamiento se realizó con la librería sentence-transformers sobre un conjunto de 439.905 muestras con columnas query, positive, negative y label. La función de pérdida es PreTokenizedMarginMSELoss, una variante de MarginMSE que entrena al cross-encoder para reproducir los márgenes de puntuación de un modelo profesor entre el positivo y el negativo, en lugar de aprender directamente una etiqueta binaria. Las estadísticas de la model card (sobre las primeras 100 muestras) muestran queries muy cortas (media de 12,64 tokens) y documentos de longitud media (positivos de 60,7 tokens de media, negativos de 56,85), lo que sugiere un dominio de consultas concisas y pasajes de uno o pocos párrafos. No se documentan detalles sobre el profesor usado, la composición exacta del dataset, ni si hubo fases adicionales de entrenamiento.

## Capacidades

- Puntuación de relevancia para pares (query, documento) mediante `CrossEncoder.predict`, devolviendo un score escalar por par.
- Reordenación de listas de candidatos con `CrossEncoder.rank`, que ordena documentos según su relevancia respecto a una consulta.
- Búsqueda semántica en pipelines de dos etapas (retrieval denso o léxico seguido de reranking).
- Adaptación al dominio de novela web en chino: los ejemplos de la model card muestran consultas del tipo "protagonista imparte clase y guía a otros en su cultivo" emparejadas con pasajes narrativos.
- Compatibilidad con text-embeddings-inference y endpoints, según las etiquetas del repositorio, lo que facilita el despliegue como servicio HTTP.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de ranking.
- Capacidades multilingües: no confirmadas por el autor, aunque el modelo base mmBERT es multilingüe.

## Casos de uso

- Reranking en sistemas RAG sobre novelas web en chino: recuperar candidatos con un retriever de embeddings o BM25 y reordenarlos con este cross-encoder para maximizar la precisión de los pasajes que se inyectan en el prompt de un LLM. Su entrenamiento en el dominio literario chino lo hace más adecuado que un reranker genérico.
- Búsqueda semántica dentro de plataformas de lectura: permitir que un lector describa una escena ("el protagonista derrota a su rival golpeando articulaciones") y recuperar los capítulos o pasajes correspondientes, usando el modelo como etapa final de ranking.
- Construcción de índices de recomendación de contenido: puntuar pares (resumen o perfil de usuario, capítulo) para ordenar recomendaciones personalizadas dentro de un catálogo de novelas.
- Deduplicación y agrupación de pasajes: puntuar la similitud semántica entre fragmentos para detectar capítulos duplicados, resúmenes redundantes o traducciones alternativas.
- Moderación y clasificación de relevancia editorial: ordenar denuncias o consultas de usuarios frente a fragmentos del catálogo para priorizar la revisión humana.
- Evaluación de calidad de resúmenes o sinopsis: usar el score del par (sinopsis generada, capítulo original) como métrica de fidelidad semántica en pipelines de generación de resúmenes.
- Búsqueda de soporte en bases de conocimiento de nicho: aunque entrenado en ficción china, el enfoque de fine-tuning con MarginMSE es replicable; este checkpoint sirve como referencia para adaptar mmBERT a otros dominios con pares query-documento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (NDCG, MRR, MAP ni precisión de ranking) sobre conjuntos de validación o test.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 0,6 GB solo para pesos (307,5 M de parámetros × 2 bytes), más activaciones y memoria del tokenizador; en la práctica, entre 1 y 2 GB para lotes pequeños con secuencias de 512 tokens.
- VRAM estimada en FP32: aproximadamente 1,2 GB para pesos, más activaciones; entre 2 y 3 GB en total.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090, así como en GPUs de datacenter A100, H100 o L4.
- También es viable en CPU para cargas moderadas, dado el tamaño reducido del modelo, aunque con mayor latencia.
- Opciones de despliegue: sentence-transformers (nativo), text-embeddings-inference (etiqueta endpoints_compatible), y potencialmente ONNX u otros runtimes si se exporta; no se documenta soporte GGUF/llama.cpp.
- Latencia y throughput: no disponibles. Como referencia orientativa no verificada, un encoder de 300 M de parámetros en una GPU moderna procesa decenas o cientos de pares por segundo con secuencias cortas, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| novel-reranker-gpl-mmbert-v2 | 307,5 M | 512 tokens | Novela web en chino | no disponible | Hugging Face (205 descargas, 1 like) |
| BAAI/bge-reranker-base | no disponible en la informacion proporcionada | no disponible | Generalista multilingüe | no disponible | Hugging Face |
| jhu-clsp/mmBERT-base (base) | no disponible en la informacion proporcionada | no disponible | Encoder multilingüe sin fine-tuning de ranking | no disponible | Hugging Face |

La comparación cuantitativa con alternativas no es posible con la información disponible: no hay benchmarks publicados para este checkpoint ni datos verificados de los modelos comparables en el material proporcionado. La principal diferencia cualitativa es la especialización en el dominio de novela china y el uso de MarginMSE con un profesor, frente a rerankers generalistas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar el repositorio antes de integrarlo en producción.
- Idiomas no declarados: aunque el modelo base es multilingüe, el fine-tuning parece centrado en chino; el rendimiento en castellano u otros idiomas es desconocido y probablemente inferior.
- Longitud máxima de 512 tokens: los documentos más largos deben truncarse o dividirse, lo que puede perder contexto relevante en pasajes extensos.
- Riesgo de sobreajuste al dominio: entrenado sobre 439.905 muestras de un dataset no identificado, probablemente de ficción china; su comportamiento en otros dominios (documentación técnica, atención al cliente, textos legales) no está validado.
- Sesgos desconocidos: no se documentan análisis de sesgo; al entrenarse sobre ficción, puede reproducir estereotipos presentes en el corpus.
- Riesgo de alucinación no aplica en sentido generativo (no genera texto), pero sí puede producir rankings erróneos si la consulta queda fuera de la distribución de entrenamiento.
- Sin benchmarks: no hay evidencia publicada de calidad; la validación debe hacerse con un conjunto propio antes de desplegarlo.
- Repositorio de 48 GB: el tamaño del repo (probablemente por checkpoints intermedios o estados del optimizador) es desproporcionado frente a los 0,6 GB de pesos; conviene descargar solo los archivos safetensors necesarios.
- Modelo con muy poca tracción (205 descargas, 1 like): no hay comunidad ni soporte; el mantenimiento futuro no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liudev/novel-reranker-gpl-mmbert-v2
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Documentación de Sentence Transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Cross Encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Paper de referencia citado en las etiquetas (arXiv 1908.10084, Sentence-BERT): https://arxiv.org/abs/1908.10084
