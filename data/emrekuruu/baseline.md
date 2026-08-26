# emrekuruu/Baseline

## Resumen

El modelo `emrekuruu/Baseline` es un clasificador de consultas diseñado para el enrutamiento adaptativo en sistemas de recuperación de documentos. Desarrollado por Emre Kuru y colaboradores como parte del trabajo de investigación "RetrievalRouter: Joint Modality and Architecture Selection for Document Retrieval" (EMNLP 2026), este modelo actúa como un baseline de comparación frente al método principal RetrievalRouter. Su función es decidir, para cada consulta, cuál de cinco pipelines de recuperación (que combinan modalidad textual o multimodal con arquitecturas densas o de late-interaction) es el más adecuado, optimizando así el equilibrio entre precisión y latencia.

El modelo se basa en el encoder `Qwen/Qwen3-0.6B-Base` (0.6 mil millones de parámetros) con una adaptación LoRA fusionada, seguido de un pooling medio que produce una representación de 1024 dimensiones y una cabeza lineal que clasifica entre las cinco opciones de pipeline. Está entrenado con etiquetas duras (hard labels) mediante entropía cruzada, donde cada consulta se asigna al pipeline más barato que logra rankear un documento relevante en primera posición. Aunque es un modelo pequeño, su relevancia radica en que permite reproducir los experimentos del paper y sirve como punto de referencia para evaluar la mejora del método RetrievalRouter, que utiliza una señal de entrenamiento más sofisticada (recompensa suave y divergencia KL).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-0.6B-Base) + LoRA fusionada + pooling medio + cabeza lineal de clasificación |
| Parametros totales | No disponible (el modelo base tiene 0.6B, pero el total con LoRA y head no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (en el ejemplo de uso se trunca a 128 tokens, pero no se indica el máximo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | No disponible (se carga con `transformers` y `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias basado en el encoder `Qwen3-0.6B-Base`. Sobre este encoder se aplica una adaptación LoRA (que posteriormente se fusiona con los pesos base), seguida de un pooling medio sobre las representaciones de los tokens para obtener un vector de 1024 dimensiones. Finalmente, una cabeza lineal proyecta este vector a un espacio de 5 logits, correspondientes a los cinco pipelines de recuperación definidos: `MULTIMODAL_RERANK`, `MULTIMODAL-SINGLE`, `TEXT_RERANK`, `TEXT-SINGLE` y `BM25`.

El entrenamiento utiliza etiquetas duras: para cada consulta, se determina el pipeline más barato (en términos de latencia) que consigue colocar un documento relevante en la primera posición; si ninguno lo logra, se asigna BM25. La función de pérdida es entropía cruzada estándar. Los datos provienen de 11 datasets públicos (FinReport, FinSlides, FinQA, ConvFinQA, VQAonBD, TATDQA, ArxivQA, Wiki-ss, MP-DocVQA, SciQAG y DUDE), que cubren dominios financieros, científicos y de documentos variados. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset. El modelo comparte la misma arquitectura, LoRA, pooling, cabeza, división de datos, optimizador y programación de aprendizaje que los checkpoints de RetrievalRouter, de modo que cualquier diferencia de rendimiento se atribuye únicamente a la señal de entrenamiento.

## Capacidades

- Clasificación de consultas para seleccionar el pipeline de recuperación más adecuado entre cinco opciones.
- Soporte para enrutamiento entre pipelines de modalidad textual y multimodal (imágenes de página).
- Distinción entre arquitecturas de recuperación densa (single-vector) y late-interaction (rerank).
- Capacidad de decidir si una consulta debe quedarse en BM25 (rápido) o escalar a un pipeline neuronal más costoso.
- No es un modelo generativo: no produce texto, solo devuelve un índice de pipeline.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Limitado al idioma inglés.

## Casos de uso

- Enrutamiento de consultas en sistemas RAG: el modelo decide si una consulta simple (p. ej., "¿cuál es la fecha de publicación?") debe procesarse con BM25 o con un pipeline neuronal, reduciendo la latencia media del sistema.
- Optimización de costes en búsqueda multimodal: para preguntas que requieren interpretar figuras o tablas (p. ej., "¿qué representa la curva roja en la Figura 3?"), el router selecciona el pipeline multimodal, evitando ejecutar costosos rerankers en consultas triviales.
- Integración en pipelines de recuperación híbridos: puede usarse como un componente de decisión que activa dinámicamente diferentes índices o modelos según la complejidad de la consulta.
- Evaluación de estrategias de routing: sirve como baseline en investigaciones sobre selección adaptativa de pipelines, permitiendo comparar métodos de entrenamiento con señales duras frente a suaves.
- Benchmarking de sistemas de recuperación: al ser un clasificador ligero, puede desplegarse en entornos de prueba para medir el impacto de diferentes políticas de enrutamiento en la precisión y latencia.
- Investigación en recuperación de documentos multimodales: útil para estudiar cómo las consultas se distribuyen entre pipelines según su naturaleza (factual vs. visual).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la métrica NDCG, pero no proporciona valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un modelo de 0.6B parámetros, es ligero y puede ejecutarse en CPU con razonable velocidad para inferencia por lotes.
- En GPU, requiere menos de 2 GB de VRAM en precisión FP16 (estimación basada en el tamaño del modelo base; no se proporcionan datos oficiales).
- Compatible con GPUs de consumo como RTX 3060, RTX 4090, o incluso GPUs integradas con suficiente memoria.
- Opciones de despliegue: al ser un modelo `transformers`, puede servirse con Hugging Face Inference Endpoints, o mediante frameworks como vLLM o TGI (aunque al ser un clasificador pequeño, la latencia es mínima).
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El propio modelo se define como un baseline frente a RetrievalRouter, pero no se ofrecen datos cuantitativos de comparación.

## Limitaciones y advertencias

- Es un modelo de investigación, no diseñado para producción directa; la model card recomienda usar los checkpoints de RetrievalRouter para despliegues reales.
- Solo soporta inglés; no hay soporte multilingüe.
- Depende de la calidad de las etiquetas duras generadas a partir de los pipelines de recuperación; si los pipelines cambian, el modelo puede quedar desactualizado.
- No devuelve documentos, solo selecciona un pipeline; el usuario debe implementar la ejecución del pipeline elegido.
- Puede presentar sesgos derivados de los datasets de entrenamiento (dominios financieros, científicos, etc.), lo que podría afectar a consultas de otros dominios.
- Riesgo de alucinación no aplica directamente, pero la clasificación puede ser errónea en consultas ambiguas o fuera de distribución.
- La licencia MIT permite uso comercial, pero el modelo no incluye garantías de rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/emrekuruu/Baseline
- Paper (arXiv): https://arxiv.org/pdf/2608.23176
- Código (GitHub): https://github.com/emrekuruu/retrieval-router
- Colección de checkpoints RetrievalRouter: https://huggingface.co/collections/emrekuruu/retrieval-router
