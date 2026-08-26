# RKB109/agentic-incident-response-20260826-model

## Resumen

El modelo `RKB109/agentic-incident-response-20260826-model` es un prototipo pequeño y transparente de orquestador de respuesta a incidentes, desarrollado por RKB109. Su propósito es abordar un problema concreto: permitir que equipos de producción dispongan de automatización agéntica sin que un planificador basado en un LLM ejecute acciones de remediación inseguras. Para ello, combina pesos de token por etiqueta con recuperación de evidencia ponderada por IDF (frecuencia inversa de documento), lo que permite enrutar alertas a herramientas mediante planes auditables y puertas de aprobación.

El modelo no llama a un LLM alojado; es un sistema de clasificación y generación de texto de arquitectura reproducible, diseñado para demostraciones de arquitectura, evaluaciones en CI, comparaciones de línea base y experimentación educativa. Publicado el 26 de agosto de 2026 bajo licencia MIT, cuenta con un dataset sintético asociado y un repositorio de GitHub que incluye el código de entrenamiento y evaluación. Su relevancia actual radica en ofrecer una alternativa de bajo riesgo y bajo coste para validar flujos agénticos antes de integrar modelos de mayor escala en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de pesos de token por etiqueta con recuperación de evidencia IDF (no es un transformer estándar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | JSON (según repositorio de GitHub) |

## Arquitectura y entrenamiento

La arquitectura del modelo combina dos componentes principales: pesos de token por etiqueta (per-label token weights) y recuperación de evidencia ponderada por IDF (IDF-weighted evidence retrieval). Este diseño permite clasificar alertas y enrutarlas a herramientas específicas mediante planes auditables y puertas de aprobación, sin depender de un LLM externo. El modelo fue entrenado sobre un dataset sintético llamado `RKB109/agentic-incident-response-20260826-dataset`, de tamaño pequeño y creado específicamente para este proyecto.

El entrenamiento se centra en la reproducibilidad: el repositorio de GitHub vinculado incluye el script `train.py`, el split exacto del dataset, el código de evaluación y el formato JSON del modelo. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación típicas de LLM. La innovación técnica principal es la combinación de clasificación de texto, generación, resumen y respuesta a preguntas en un solo prototipo ligero, orientado a demostrar la viabilidad de un orquestador agéntico sin los riesgos de un planificador LLM descontrolado.

## Capacidades

- Clasificación de texto para enrutar alertas a herramientas específicas.
- Generación de texto para producir planes de acción auditables.
- Resumen de información de incidentes para contextos operativos.
- Respuesta a preguntas sobre incidentes o procedimientos.
- Recuperación de evidencia ponderada por IDF para apoyar las decisiones de enrutamiento.
- Soporte para puertas de aprobación y principios de mínimo privilegio en la integración de herramientas.
- Capacidad de operar sin conexión a un LLM alojado, lo que reduce dependencias externas.

## Casos de uso

- Prototipado de arquitectura agéntica: el modelo sirve como línea base para demostrar cómo un orquestador puede enrutar alertas a herramientas sin un LLM central, permitiendo validar el flujo antes de escalar a sistemas más complejos.
- Evaluación en CI/CD: puede integrarse en pipelines de integración continua para comprobar la precisión del enrutamiento de herramientas (tool_routing_accuracy), la tasa de bloqueo de acciones inseguras y la completitud de planes.
- Comparación de líneas base: útil como punto de referencia para comparar el rendimiento de modelos agénticos más grandes o de LLM tradicionales en tareas de respuesta a incidentes.
- Experimentación educativa: sirve para enseñar conceptos de recuperación de evidencia, pesos de token y diseño de sistemas de agencia sin depender de infraestructura de GPU.
- Prototipado de seguridad: permite probar mecanismos de bloqueo de acciones inseguras (unsafe_action_block_rate) en un entorno simulado antes de aplicar políticas de mínimo privilegio en producción.
- Investigación sobre datasets sintéticos: facilita la exploración de cómo el tamaño y la composición del dataset afectan al rendimiento de orquestadores agénticos, dado que el dataset asociado es pequeño y sintético.

## Benchmarks y rendimiento

La información disponible reporta una evaluación sobre 4 ejemplos sintéticos held-out con una accuracy de 1 (100 %). Sin embargo, no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas previstas para el modelo son `tool_routing_accuracy`, `unsafe_action_block_rate` y `plan_completion`, pero no se proporcionan valores numéricos de estas métricas en la documentación.

## Requisitos de hardware

- No se han publicado requisitos específicos de hardware en la información disponible.
- Dado que el modelo es un prototipo ligero que no invoca un LLM alojado y se representa en formato JSON, es razonable esperar que pueda ejecutarse en CPU estándar, aunque esto no está confirmado por el autor.
- No se especifican GPUs recomendadas ni opciones de despliegue como vLLM, llama.cpp, Ollama o TGI. La implementación es personalizada (custom library), por lo que el despliegue probablemente requiera el código del repositorio de GitHub.
- No se proporcionan datos de latencia ni throughput estimados.

## Comparativa con modelos similares

| Modelo | Fecha | Arquitectura | Licencia | Dataset | Evaluación |
|---|---|---|---|---|---|
| `RKB109/agentic-incident-response-20260826-model` | 2026-08-26 | Pesos por token + IDF | MIT | Sintético (20260826) | Accuracy 1.0 en 4 ejemplos |
| `RKB109/agentic-incident-response-20260816-model` | 2026-08-16 | Pesos por token + IDF | MIT | Sintético (20260816) | no disponible |
| Modelos LLM generales (p. ej., Llama, Mistral) | - | Transformer | Varía | Grandes corpora | Múltiples benchmarks |

La comparativa se limita a la versión anterior del mismo proyecto (20260816), que comparte la misma arquitectura y propósito. No hay datos públicos de modelos equivalentes en la misma categoría (orquestadores agénticos ligeros sin LLM), por lo que no se puede establecer una comparativa más amplia.

## Limitaciones y advertencias

- El dataset es sintético y pequeño (4 ejemplos de evaluación), lo que no representa la diversidad de incidentes reales. El autor advierte explícitamente que no debe usarse para decisiones consecutivas sin datos representativos y revisión experta.
- El modelo usa herramientas simuladas; las integraciones en producción deben implementar mínimo privilegio y aprobación humana.
- Riesgo de alucinación o errores en la generación de planes, aunque el diseño sin LLM reduce este riesgo, no lo elimina por completo.
- No se especifican los idiomas soportados; la documentación está en inglés y no se indica cobertura multilingüe.
- No hay garantías de rendimiento en entornos de producción; es un prototipo para demostración y experimentación.
- La licencia MIT permite uso comercial, pero el autor recomienda no usarlo en producción sin evaluación rigurosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RKB109/agentic-incident-response-20260826-model
- Dataset asociado: https://huggingface.co/datasets/RKB109/agentic-incident-response-20260826-dataset
- Repositorio de GitHub: https://github.com/R-behera/agentic-incident-response-20260826
- Modelo anterior (20260816): https://huggingface.co/RKB109/agentic-incident-response-20260816-model
- Dataset anterior (20260816): https://huggingface.co/datasets/RKB109/agentic-incident-response-20260816-dataset
