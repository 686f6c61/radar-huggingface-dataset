# RKB109/knowledge-graph-risk-engine-20260818-model

## Resumen

El modelo `RKB109/knowledge-graph-risk-engine-20260818-model` es un prototipo pequeño y transparente diseñado para ofrecer explicaciones a nivel de relación en lugar de puntuaciones opacas de entidades, orientado a equipos de riesgo. Desarrollado por RKB109, combina pesos por etiqueta de token con recuperación de evidencia ponderada por IDF (inverse document frequency), y se presenta como una demostración de arquitectura reproducible, sin depender de un LLM alojado. El modelo se distribuye bajo licencia MIT y está pensado para prototipado, evaluación en CI, comparaciones baseline y experimentación educativa.

Su relevancia radica en ser un baseline transparente para pipelines de knowledge graphs aplicados a análisis de riesgo, donde la explicabilidad es crítica. Al ser un modelo sintético y de pequeño tamaño, no está concebido para uso en producción con datos reales, sino como referencia para validar arquitecturas y metodologías. Incluye soporte declarado para tareas de token-classification, feature-extraction, question-answering y sentence-similarity, aunque sus capacidades son limitadas por diseño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo custom basado en pesos por etiqueta de token y recuperación IDF, segun la descripcion) |
| Parametros totales | No disponible |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplicable (modelo pequeño, no requiere cuantizacion) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | JSON (segun la model card: "the model JSON format") |

## Arquitectura y entrenamiento

El modelo no utiliza una arquitectura transformer convencional. Segun la model card, combina pesos por etiqueta de token con recuperación de evidencia ponderada por IDF, lo que sugiere un enfoque basado en estadísticas de frecuencia y pesos asignados a etiquetas, probablemente implementado como un pipeline custom en lugar de una red neuronal profunda. No se especifican detalles sobre el número de parámetros, la composición del dataset ni el proceso de entrenamiento (por ejemplo, si hubo RLHF o DPO). El dataset asociado es `RKB109/knowledge-graph-risk-engine-20260818-dataset`, de carácter sintético y pequeño, generado específicamente para este proyecto. La model card indica que el repositorio de GitHub vinculado incluye `train.py`, la división exacta del dataset, el código de evaluación y el formato JSON del modelo, lo que permite reproducir completamente la arquitectura.

## Capacidades

- Clasificación de tokens (token-classification): identificación de entidades o etiquetas en texto, probablemente relacionadas con elementos de un knowledge graph.
- Extracción de características (feature-extraction): generación de representaciones vectoriales de entidades o relaciones para tareas posteriores.
- Respuesta a preguntas (question-answering): capacidad limitada para responder consultas basadas en el knowledge graph sintético.
- Similitud de frases (sentence-similarity): comparación de similitud entre frases o entidades, útil para recuperación de evidencia.
- Explicabilidad a nivel de relación: el modelo está diseñado para proporcionar explicaciones basadas en rutas de relación y evidencia, en lugar de puntuaciones opacas.
- No soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Prototipado de arquitecturas de riesgo: el modelo sirve como base para validar diseños de pipelines que integran knowledge graphs y explicabilidad, permitiendo iterar rápidamente antes de escalar a soluciones más complejas.
- Evaluación en integración continua (CI): puede incorporarse a pipelines de CI para verificar que los cambios en el código no rompen la lógica de extracción de evidencia o clasificación de tokens, gracias a su tamaño reducido y ejecución rápida.
- Comparación de baselines locales: al ser un modelo transparente y reproducible, permite comparar el rendimiento de otras arquitecturas (por ejemplo, LLMs) contra un baseline sencillo y bien documentado.
- Experimentación educativa: es útil en entornos académicos o de formación para enseñar conceptos de knowledge graphs, recuperación de información y evaluación de modelos, sin necesidad de grandes recursos computacionales.
- Demostración de explicabilidad en riesgo: puede utilizarse para ilustrar cómo se pueden generar explicaciones a nivel de relación (rutas, evidencia) en lugar de puntuaciones de entidad, un requisito común en cumplimiento normativo.
- Pruebas de concepto con datos sintéticos: antes de aplicar modelos a datos reales, este prototipo permite validar flujos de trabajo con datos ficticios, asegurando que la lógica de negocio es correcta.

## Benchmarks y rendimiento

Segun la model card, la evaluación se realizó sobre 4 ejemplos sintéticos reservados, obteniendo una accuracy de 1. Las métricas previstas son `relation_accuracy`, `path_coverage` y `entity_resolution_precision`, aunque no se proporcionan valores numéricos para estas últimas.

| Metrica | Valor |
|---|---|
| Accuracy (held-out synthetic) | 1 (sobre 4 ejemplos) |
| relation_accuracy | No disponible |
| path_coverage | No disponible |
| entity_resolution_precision | No disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un modelo pequeño y basado en estadísticas, no requiere GPU; puede ejecutarse en CPU sin problemas.
- No se dispone de datos de VRAM ni de GPU recomendadas, ya que no es un modelo de deep learning convencional.
- El despliegue es sencillo: se puede ejecutar localmente con el código del repositorio de GitHub, sin necesidad de frameworks pesados como vLLM u Ollama.
- La latencia es mínima, dado el tamaño del modelo; se espera un throughput alto en tareas de clasificación o recuperación, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

Existe una versión anterior del mismo modelo con fecha 2026-07-19 (`RKB109/knowledge-graph-risk-engine-20260719-model`), que comparte la misma descripción y propósito. No se dispone de información sobre diferencias concretas entre ambas versiones. Otros proyectos como `SajeevSenthil/FraudShield-AI` (detección de fraude con Graph RAG) son arquitecturas más complejas y no directamente comparables en términos de tamaño o enfoque. No se han encontrado modelos equivalentes en la misma categoría con datos públicos de rendimiento.

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente con datos sintéticos y de pequeño tamaño; no es adecuado para decisiones consecuentes sin una evaluación con datos representativos y revisión experta.
- Todas las entidades son ficticias; su uso con datos reales de identidad o financieros requiere gobernanza, consentimiento y revisión de sesgos.
- No es un LLM: no genera texto libre ni mantiene conversaciones; sus capacidades se limitan a las tareas declaradas.
- No se especifican idiomas soportados; probablemente el modelo esté orientado a un único idioma (posiblemente inglés), pero no hay confirmación.
- No hay garantías de rendimiento en producción; el modelo es un baseline de demostración, no una solución lista para entornos críticos.
- La licencia MIT permite uso comercial, pero la falta de documentación sobre el dataset y el entrenamiento limita su aplicabilidad en entornos regulados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKB109/knowledge-graph-risk-engine-20260818-model
- Dataset asociado: https://huggingface.co/datasets/RKB109/knowledge-graph-risk-engine-20260818-dataset
- Repositorio de GitHub de la versión anterior (2026-07-19): https://github.com/R-behera/knowledge-graph-risk-engine-20260719
- Proyecto relacionado (detección de fraude con Graph RAG): https://github.com/SajeevSenthil/FraudShield-AI
