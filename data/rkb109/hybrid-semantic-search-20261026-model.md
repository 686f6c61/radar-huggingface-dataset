# RKB109/hybrid-semantic-search-20261026-model

## Resumen

El modelo `RKB109/hybrid-semantic-search-20261026-model` es un prototipo pequeño y transparente publicado en HuggingFace por el usuario RKB109, orientado a tareas de búsqueda semántica y recuperación de evidencia. No se trata de un transformer neuronal al uso, sino de un modelo léxico basado en pesos de tokens por etiqueta combinados con recuperación de evidencia ponderada por IDF, según describe su model card. Su propósito declarado es servir como línea base reproducible para prototipado de arquitecturas de búsqueda empresarial cuando las APIs de embeddings no están disponibles, resultan costosas o están restringidas.

El modelo se distribuye bajo licencia MIT, con la librería declarada como `custom` y el pipeline `sentence-similarity`. Cubre además las tareas de `feature-extraction`, `text-ranking` y `question-answering` dentro de la taxonomía de HuggingFace. Se entrenó, según el autor, sobre un dataset sintético enlazado en el propio repositorio (`RKB109/hybrid-semantic-search-20261026-dataset`), y la evaluación reportada se realizó sobre 4 ejemplos sintéticos retenidos, con una accuracy de 1.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto educativo y de CI, no de un modelo de producción. No hay información pública sobre arquitectura neuronal, número de parámetros, longitud de contexto ni idiomas soportados, y el propio autor advierte que debe sustituirse o compararse con embeddings de dominio a escala antes de cualquier uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo léxico: pesos de tokens por etiqueta combinados con recuperación de evidencia ponderada por IDF (no es un transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el autor menciona un "model JSON format" en el repositorio GitHub, sin detallar el esquema) |

## Arquitectura y entrenamiento

Según la model card, el modelo no emplea una arquitectura de red neuronal profunda. Combina pesos de tokens calculados por etiqueta con un mecanismo de recuperación de evidencia ponderado por IDF (inverse document frequency). Esta combinación es la que da nombre al enfoque "híbrido" del repositorio: una parte de señal semántica aproximada mediante pesos léxicos y una parte de ranking basada en frecuencia inversa de documento. El autor indica explícitamente que el modelo "no llama a un LLM alojado", es decir, que la inferencia es puramente local y determinista.

El entrenamiento se realizó sobre un dataset sintético enlazado en el propio Hub (`RKB109/hybrid-semantic-search-20261026-dataset`). No se especifican el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO; el autor solo indica que el dataset es sintético y pequeño. La reproducibilidad es el eje declarado del proyecto: el repositorio GitHub asociado incluye `train.py`, el split exacto del dataset, el código de evaluación y el formato JSON del modelo. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Recuperación semántica léxica: calcula similitud entre frases mediante pesos de tokens por etiqueta y evidencia IDF.
- Extracción de características (`feature-extraction`): genera representaciones léxicas de texto para su uso en pipelines de ranking.
- Ranking de texto (`text-ranking`): ordena candidatos según relevancia estimada.
- Question answering extractivo: recupera evidencia textual relevante para una consulta, sin generación libre.
- Sentence similarity: tarea principal declarada en el pipeline de HuggingFace.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües; el autor no documenta idiomas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Prototipado de arquitecturas de búsqueda: sirve como línea base reproducible para comparar frente a embeddings neuronales en fases tempranas de diseño, ya que su comportamiento es determinista y explicable.
- Integración en pipelines de CI: al ser un modelo léxico ligero y local, puede ejecutarse en tests automatizados para validar que un sistema de retrieval sigue devolviendo resultados esperados tras cambios de código.
- Evaluación comparativa local: permite medir `recall_at_3` y `mean_reciprocal_rank` de un sistema de búsqueda contra una referencia transparente antes de invertir en APIs de embeddings.
- Docencia y experimentación educativa: adecuado para explicar conceptos de IDF, ranking y evaluación de retrieval sin depender de infraestructura de GPU.
- Búsqueda en entornos con restricciones de red: al no llamar a APIs externas, puede desplegarse en entornos air-gapped para demostraciones de recuperación de evidencia.
- Baseline para datasets sintéticos: útil para validar pipelines de evaluación sobre datos generados antes de migrar a datos reales de dominio.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Ejemplos sintéticos retenidos | 4 |
| Accuracy | 1 |
| retrieval_accuracy | no reportado (métrica declarada como objetivo) |
| recall_at_3 | no reportado (métrica declarada como objetivo) |
| mean_reciprocal_rank | no reportado (métrica declarada como objetivo) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BEIR, MTEB) en la información disponible. El único dato de evaluación es una accuracy de 1 sobre 4 ejemplos sintéticos, muestra demasiado pequeña para extraer conclusiones de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es léxico y no requiere GPU según la descripción del autor.
- GPU recomendadas: no aplica; la inferencia es local y determinista, sin llamadas a LLM alojado.
- Cabe en cualquier hardware consumer: sí, previsiblemente en CPU, aunque no se documentan requisitos mínimos.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor menciona un formato JSON propio y un repositorio GitHub con `train.py` y código de evaluación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RKB109/hybrid-semantic-search-20261026-model | Léxico híbrido (token weights + IDF) | no disponible | no disponible | MIT | HuggingFace, 0 descargas |
| BM25 (implementaciones tipo rank_bm25) | Léxico puro (TF-IDF/BM25) | no aplica | no aplica | Apache 2.0 / MIT según implementación | Amplia, estándar de la industria |
| sentence-transformers/all-MiniLM-L6-v2 | Transformer bi-encoder | ~22M | 256 tokens | Apache 2.0 | HuggingFace, ampliamente usado |
| BAAI/bge-small-en-v1.5 | Transformer bi-encoder | ~33M | 512 tokens | MIT | HuggingFace, muy usado en MTEB |

La comparación con los modelos neuronales es orientativa: este modelo no compite en calidad de retrieval con bi-encoders entrenados, sino que se posiciona como baseline explicable y reproducible. Frente a BM25, añade pesos por etiqueta, pero carece de la madurez y el ecosistema de las implementaciones estándar.

## Limitaciones y advertencias

- El dataset de entrenamiento es sintético y pequeño; el autor advierte explícitamente que no debe usarse para decisiones consecuentes sin datos representativos y revisión experta.
- La evaluación se basa en 4 ejemplos, insuficiente para estimar generalización; la accuracy de 1 no es indicativa de rendimiento real.
- El modelo es léxico, por lo que no captura paráfrasis ni similitud semántica profunda como un bi-encoder neuronal.
- No se documentan idiomas soportados; no hay garantía de funcionamiento multilingüe.
- No hay información sobre sesgos; al ser un modelo léxico, heredará los sesgos del dataset sintético y de los pesos de tokens.
- Riesgo de alucinación bajo en generación (no genera texto libre), pero riesgo de recuperar evidencia irrelevante en consultas fuera de distribución.
- Licencia MIT permite uso comercial, pero el autor recomienda sustituirlo por embeddings de dominio a escala antes de producción.
- Sin descargas ni likes en el Hub en el momento de la consulta; no hay evidencia de uso en la comunidad.
- El formato de pesos no está estandarizado (JSON propio), lo que dificulta la interoperabilidad con herramientas como vLLM o TGI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RKB109/hybrid-semantic-search-20261026-model
- Dataset en HuggingFace: https://huggingface.co/datasets/RKB109/hybrid-semantic-search-20261026-dataset
- Repositorio GitHub con `train.py`, split y evaluación: no disponible en la información proporcionada (el autor lo menciona sin enlace explícito)
- Paper: no disponible
- Demo: no disponible
