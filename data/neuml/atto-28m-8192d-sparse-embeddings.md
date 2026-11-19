# NeuML/atto-28m-8192d-sparse-embeddings

## Resumen

Atto 28M 8192d sparse embeddings es un modelo de recuperación de información de tipo sparse encoder desarrollado por NeuML, construido a partir del modelo base NeuML/atto-28m-8192d y afinado con la librería sentence-transformers. Pertenece a la familia Atto, un conjunto de modelos contextuales compactos diseñados para aprendizaje de representaciones de lenguaje con eficiencia de parámetros. Este modelo concreto genera vectores dispersos (sparse) de 8192 dimensiones sobre un vocabulario de 30K tokens, orientados a búsqueda semántica y recuperación aumentada por generación (RAG).

Con 28 millones de parámetros, el modelo se posiciona como una alternativa extremadamente ligera frente a los sparse encoders habituales, que suelen superar los 100 millones de parámetros. Su arquitectura combina un transformer de extracción de características (AttoModel) con una capa de pooling SPLADE (max pooling con activación ReLU) que proyecta las representaciones hacia el espacio disperso de 8192 dimensiones. Está pensado para despliegues donde el coste computacional y de memoria es crítico, como índices de búsqueda a gran escala o sistemas embebidos.

El modelo es relevante ahora porque demuestra que es posible obtener calidad de recuperación razonable con un coste de parámetros muy reducido, lo que facilita el despliegue en entornos con recursos limitados. Su licencia Apache 2.0 y su integración con txtai y sentence-transformers lo hacen directamente utilizable en producción sin fricción. La información disponible es limitada: no se detallan la composición del dataset de entrenamiento ni el número de tokens utilizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (AttoModel) con SPLADE pooling |
| Parámetros totales | 28M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimensiones de salida | 8192 (vectores sparse) |
| Vocabulario | 30K tokens |
| Pipeline | sentence-similarity / feature-extraction |
| Modelo base | NeuML/atto-28m-8192d |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas. La primera es un transformer de extracción de características denominado AttoModel, que procesa el texto de entrada y produce la última capa oculta (last_hidden_state). La segunda es una capa SpladePooling con estrategia de pooling max, función de activación ReLU y dimensión de embedding de 8192, que transforma las representaciones densas del transformer en vectores dispersos de alta dimensión. Esta combinación es característica de los modelos SPLADE, que aprenden representaciones léxicas expandidas y dispersas adecuadas para recuperación eficiente mediante índices invertidos.

El entrenamiento se realizó con sentence-transformers usando los prompts `query: ` para consultas y `document: ` para documentos, lo que indica un diseño específico para tareas asimétricas de recuperación. Los hiperparámetros publicados incluyen batch size de 64 por dispositivo, 25 épocas, learning rate de 0.0003, warmup de 1000 pasos, weight decay de 0.01, gradient accumulation de 2 pasos y precisión fp16. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla si hubo decodificación especulativa u otras innovaciones de inferencia.

## Capacidades

- Generación de embeddings dispersos (sparse) de 8192 dimensiones para texto en inglés.
- Búsqueda semántica y recuperación de documentos mediante similitud de vectores sparse.
- Soporte de recuperación aumentada por generación (RAG) como fuente de conocimiento.
- Integración nativa con txtai (versión 9.0 o superior para scoring de vectores sparse).
- Integración con sentence-transformers mediante la clase SparseEncoder.
- Codificación asimétrica query/documento mediante prompts específicos.
- No soporta tool calling ni function calling (es un modelo de embeddings, no generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica a gran escala: el modelo genera vectores sparse de 8192 dimensiones que pueden indexarse con estructuras invertidas, permitiendo búsquedas sobre corpus de millones de documentos con un coste de memoria muy reducido gracias a sus 28M de parámetros.
- RAG en entornos con recursos limitados: al ser un encoder de 28M de parámetros, puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace adecuado para pipelines de recuperación en sistemas embebidos o contenedores con poca VRAM.
- Motor de búsqueda para documentación técnica: se puede indexar documentación de producto o manuales en inglés y recuperar fragmentos relevantes para consultas de usuarios, usando los prompts `query: ` y `document: ` para mejorar la asimetría.
- Filtrado y deduplicación de contenidos: los embeddings sparse permiten calcular similitud entre documentos para detectar duplicados o contenidos muy similares en pipelines de ingesta de datos.
- Clasificación y clustering de textos por similitud: los vectores generados pueden alimentar algoritmos de clustering o clasificación basada en vecinos más cercanos para organizar grandes volúmenes de texto.
- Base para sistemas de recomendación de contenido: la representación sparse de artículos o publicaciones permite recomendar elementos similares a partir de las consultas o del historial del usuario.
- Indexación en txtai para asistentes de conocimiento: integrado con txtai 9.0+, se puede construir una base de embeddings que sirva como fuente de conocimiento para un asistente conversacional con RAG.

## Benchmarks y rendimiento

Resultados de un subconjunto de BEIR (ndcg@10) publicados en la model card:

| Modelo | Parámetros | Dimensiones | Vocab | ArguAna | NFCorpus | SciFact | Media |
|---|---:|---:|---:|---:|---:|---:|---:|
| atto-17m-8192d-sparse | 17M | 8192 | 30K | 0.3981 | 0.3208 | 0.6600 | 0.4596 |
| **atto-28m-8192d-sparse** | **28M** | **8192** | **30K** | **0.3651** | **0.3292** | **0.6618** | **0.4520** |
| SlideOn | 174M | 768 | 50K | 0.4655 | 0.3863 | 0.7529 | 0.5349 |

El modelo de 28M obtiene una media de 0.4520, ligeramente por debajo del de 17M (0.4596) y claramente por debajo de SlideOn (0.5349), que tiene 174M de parámetros. Destaca en SciFact (0.6618) y NFCorpus (0.3292), mientras que en ArguAna queda por debajo del modelo de 17M.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 para los 28M de parámetros; en la práctica, el modelo completo ocupa aproximadamente 0.1 GB en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 e incluso en CPU.
- Cabe en cualquier GPU consumer, incluidas integradas con suficiente memoria compartida, y en CPU con latencia aceptable para volúmenes moderados.
- Opciones de despliegue: sentence-transformers (SparseEncoder), txtai 9.0+, y potencialmente ONNX u otras rutas de exportación no documentadas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensiones | Contexto | Media BEIR (ndcg@10) | Licencia |
|---|---:|---:|---|---:|---|
| atto-28m-8192d-sparse | 28M | 8192 | no disponible | 0.4520 | Apache 2.0 |
| atto-17m-8192d-sparse | 17M | 8192 | no disponible | 0.4596 | Apache 2.0 |
| SlideOn | 174M | 768 | no disponible | 0.5349 | no disponible en la información |

El modelo de 17M de la misma familia ofrece una media ligeramente superior con menos parámetros, lo que sugiere que el de 28M no aporta una mejora clara en este subconjunto de BEIR. SlideOn, con 174M de parámetros, supera a ambos pero con un coste computacional seis veces mayor. No se dispone de datos de contexto ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no está entrenado para otros idiomas.
- Es un modelo de embeddings, no generativo: no produce texto, no razona y no soporta tool calling.
- Los resultados en ArguAna son inferiores a los del modelo de 17M de la misma familia, lo que indica que no es una mejora uniforme.
- No se detalla la composición del dataset de entrenamiento, por lo que se desconocen posibles sesgos presentes en los datos.
- Riesgo de alucinación no aplica directamente al ser un encoder, pero la recuperación puede devolver documentos irrelevantes si la consulta está fuera del dominio de entrenamiento.
- La longitud de contexto no está documentada, lo que dificulta planificar el truncado de documentos largos.
- Requiere txtai 9.0 o superior para el scoring de vectores sparse; versiones anteriores no son compatibles.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los datos de entrenamiento subyacentes, no documentadas.
- El rendimiento en producción puede degradarse en dominios muy especializados no representados en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuML/atto-28m-8192d-sparse-embeddings
- Modelo base: https://huggingface.co/NeuML/atto-28m-8192d
- Modelo de 17M de la familia: https://huggingface.co/neuml/atto-17m-8192d-sparse-embeddings
- Artículo de presentación de Atto: https://huggingface.co/blog/neuml/introducing-atto
- Repositorio txtai: https://github.com/neuml/txtai
- Script de benchmarks de txtai: https://github.com/neuml/txtai/blob/master/examples/benchmarks.py
- sentence-transformers: https://www.SBERT.net
- Modelo SlideOn (comparativa): https://huggingface.co/lightonai/slideon
