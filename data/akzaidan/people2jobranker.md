# akzaidan/People2JobRanker

## Resumen

People2JobRanker es un modelo cross-encoder de reranking desarrollado por Ahmed Zaidan (usuario `akzaidan`) que puntúa la adecuación entre un perfil de buscador de empleo y una oferta de trabajo. Está basado en el modelo `gte-reranker-modernbert-base` de Alibaba-NLP, que a su vez emplea la arquitectura ModernBERT. El modelo procesa el par (perfil, oferta) de forma conjunta y produce una puntuación de relevancia, junto con tres puntuaciones auxiliares (role_fit, skill_fit y level_fit) que descomponen la calidad del encaje.

Se entrenó sobre el dataset `akzaidan/Profile-Jobs-Ranked`, que contiene 5,7 millones de pares etiquetados por un LLM (gpt-5-nano) a partir de 245.000 perfiles sintéticos de buscadores estadounidenses y 1,5 millones de ofertas reales. La etiqueta de relevancia se define como una combinación ponderada de role_fit y skill_fit (0,55 y 0,45 respectivamente), con valores de 0 a 100. El modelo está pensado para ordenar listas de ofertas o candidatos, no para emitir juicios absolutos sobre la calidad de un emparejamiento.

La relevancia actual del modelo reside en su enfoque específico para el emparejamiento laboral, una tarea de nicho que los modelos generalistas de reranking abordan con menos precisión. Su licencia MIT y su diseño compacto (basado en ModernBERT) lo hacen accesible para integración en sistemas de recomendación de empleo y plataformas de búsqueda de talento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (Alibaba-NLP/gte-reranker-modernbert-base) |
| Parametros totales | No disponible (el modelo base tiene ~150M, no se especifica para el modelo final) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (en el ejemplo de uso se trunca a `max_length=2048`, no se especifica el límite real del modelo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (orientado al mercado estadounidense, presumiblemente inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: el encoder ModernBERT recibe el par de textos (perfil y oferta) concatenados y produce una representación conjunta. Sobre esta representación se añade una capa de dropout (0.1) y dos cabezas lineales: una cabeza principal de relevancia (1 salida) y una cabeza auxiliar con 3 salidas (role_fit, skill_fit, level_fit). La puntuación final se obtiene de la cabeza principal, mientras que las auxiliares permiten interpretar el resultado.

El entrenamiento se realizó sobre el dataset `Profile-Jobs-Ranked`, con 5,7 millones de pares etiquetados por el LLM gpt-5-nano (bajo esfuerzo de razonamiento) siguiendo un rúbrica de rol y habilidades. La etiqueta de relevancia se calcula como `0.55*role_fit + 0.45*skill_fit`. No se menciona el uso de RLHF o DPO; es un entrenamiento supervisado clásico sobre datos generados por LLM. La innovación técnica principal es la inclusión de cabezas auxiliares para desglosar la puntuación, lo que facilita el análisis posterior.

## Capacidades

- Puntúa la adecuación entre un perfil de buscador y una oferta de empleo (emparejamiento perfil-oferta).
- Ordena listas de ofertas o de candidatos según la relevancia predicha (learning-to-rank).
- Proporciona tres puntuaciones auxiliares: role_fit (ajuste de rol), skill_fit (ajuste de habilidades) y level_fit (ajuste de nivel).
- Funciona como cross-encoder, no como generador de texto ni modelo conversacional.
- No soporta tool calling, agentes ni razonamiento multi-step.
- No tiene capacidades de visión, audio ni multimodalidad.
- Limitado al contexto de mercado laboral estadounidense (según los datos de entrenamiento).

## Casos de uso

- Recomendación de ofertas de empleo en portales de búsqueda: el modelo puede ordenar una lista de ofertas para un perfil dado, priorizando las que mejor encajan en rol y habilidades, y descartando las irrelevantes.
- Selección de candidatos para una oferta concreta: dado un conjunto de currículums o perfiles, el modelo puntúa cada uno contra la oferta y produce un ranking de los mejores candidatos.
- Filtrado inicial en sistemas de reclutamiento: como paso previo a una revisión humana, se usa para descartar los pares perfil-oferta con baja puntuación, reduciendo el trabajo de un reclutador.
- Análisis de adecuación de un currículum a una oferta específica: el modelo devuelve una puntuación de relevancia junto con los sub-puntajes de rol y habilidades, lo que permite al usuario saber en qué aspectos falla su perfil.
- Mejora de motores de búsqueda de empleo existentes: se puede combinar con una búsqueda basada en embeddings para re-ordenar los resultados iniciales y obtener una lista más precisa.
- Evaluación de perfiles sintéticos en entornos de simulación: al estar entrenado con perfiles sintéticos, puede utilizarse para probar heurísticas de emparejamiento en escenarios de prueba sin datos reales.

## Benchmarks y rendimiento

El autor publica resultados en un conjunto de test retenido con 6.002 perfiles no vistos y 146.855 pares:

| Métrica | People2JobRanker | Retrieval order (baseline) | Random |
|---|---|---|---|
| NDCG@10 | **0.746** | 0.640 | 0.521 |
| NDCG@full | **0.794** | --- | --- |
| Judge-label del resultado #1 | **55.7** | 46.3 | (oracle 65.8) |

Además, la concordancia a nivel de par con las etiquetas del juez es Pearson 0.716 y Spearman 0.699. Cuando existe un match Strong+ (etiqueta >= 76), el modelo lo coloca en el top-3 en el 86,9% de las listas.

En una prueba de imparcialidad, se realizó un flip contrafactual de la frase de autorización de trabajo en el perfil sobre 200 listas retenidas, y las predicciones cambiaron en media |Δ| = 0.23 puntos (p95 = 0.81), con una estabilidad de orden tau = 0.981, lo que indica que el modelo es insensible al texto de autorización de trabajo.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos en la información disponible. Dado que se basa en un encoder ModernBERT (tamaño base), se puede inferir que es un modelo de tamaño moderado, pero no se dispone de datos concretos sobre VRAM, GPU recomendadas o latencia. En el ejemplo de uso se ejecuta con PyTorch en CPU/GPU estándar, pero sin métricas de rendimiento.

Para producción, se puede servir con frameworks como vLLM o TGI, aunque el modelo es un cross-encoder y no un LLM generativo, por lo que el despliegue es más sencillo. Se recomienda usar una GPU con al menos 8 GB de VRAM para manejar lotes de pares con 2048 tokens, aunque no hay garantía.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos en la información proporcionada. No hay datos de benchmarks comparativos con otros cross-encoders de reranking (como BGE-reranker, Cohere rerank, etc.) ni con modelos específicos de job matching. La única comparativa interna es con el orden de recuperación (retrieval order) y el azar.

## Limitaciones y advertencias

- Las puntuaciones son solo para ordenar, no para mostrar como porcentaje de coincidencia. El autor advierte que `sigmoid(score)*100` está inflado (pares no válidos promedian ~62%).
- Las etiquetas del entrenamiento son opiniones de un LLM (gpt-5-nano) sin validación humana; los sesgos del juez se transfieren al modelo.
- El modelo no penaliza diferencias de seniority, ubicación, compensación ni autorización de trabajo; estas deben tratarse en una capa posterior de heurística.
- Puede fallar en casos de polisemia léxica en grupos de candidatos reducidos (ej. "casting" en cine vs. fundición).
- Está entrenado con perfiles sintéticos y datos del mercado estadounidense de agosto de 2026; su generalización a otros mercados o perfiles reales no está garantizada.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/akzaidan/People2JobRanker)
- [Dataset Profile-Jobs-Ranked](https://huggingface.co/datasets/akzaidan/Profile-Jobs-Ranked)
- [Modelo base gte-reranker-modernbert-base](https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base)
- [Perfil del autor en HuggingFace](https://huggingface.co/akzaidan)
