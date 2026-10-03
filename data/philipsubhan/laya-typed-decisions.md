# philipsubhan/laya-typed-decisions

## Resumen

Laya typed-decisions (revisión de `philipsubhan`) es un ajuste fino derivado del checkpoint base `convaiinnovations/laya`, un modelo de decisión no autorregresivo de tipo System 1. El modelo resuelve una tarea concreta: emitir una decisión tipada (en esta revisión, `surface_now` frente a `hold_silent`) sobre un escenario de texto en un único paso hacia delante, sin generación token a token. Está entrenado sobre 99 escenarios de la familia "Rule #3" del proyecto Mind, etiquetados a mano y anonimizados (privacy-scrubbed), y sustituye a una revisión anterior entrenada con datos previos al proceso de anonimización.

El checkpoint pesa aproximadamente 0,8 GB y contiene 421.293.830 parámetros con pesos en safetensors, lo que lo sitúa en la gama de modelos pequeños aptos para inferencia de baja latencia en hardware de consumo. Su relevancia actual radica en su naturaleza no autorregresiva: la familia Laya se plantea como un motor de decisión "System 1" con latencias declaradas por debajo de 35 ms y enrutado multilingüe, un enfoque distinto al de los LLM generativos para tareas de clasificación y decisión estructurada.

Es un artefacto de nicho: la ficha de HuggingFace registra 0 descargas y 0 likes en el momento de recopilar la información, y no documenta idiomas soportados ni longitud de contexto. La model card únicamente publica métricas de retención sobre 20 escenarios de validación estratificados, sin detallar la composición completa del conjunto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo (system 1); detalles de capas y atencion no disponibles |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible en la ficha del ajuste; la familia base declara enrutado multilingue en mas de 100 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer no autorregresivo orientado a decisiones tipadas. A diferencia de un modelo generativo, produce una etiqueta o puntuación en un solo paso hacia delante sobre el texto de entrada, lo que encaja con el concepto de "System 1" empleado por la familia Laya (decisiones rápidas e intuitivas frente al razonamiento deliberado). El modelo base `convaiinnovations/laya` se presenta como un motor de decisión con calibración cuidada, decisiones tipadas (elección tipada, puntuación y sí/no) y un router que selecciona el checkpoint adecuado por petición. No se dispone de la ficha detallada de capas, dimensión de embeddings ni mecanismo de atención de esta revisión concreta.

El ajuste de `philipsubhan` se realizó partiendo del checkpoint base `convaiinnovations/laya` sobre 99 escenarios de surfacing "Rule #3", etiquetados a mano y anonimizados, con dos posibles salidas (`surface_now` frente a `hold_silent`). Esta revisión reemplaza a una anterior entrenada con datos previos a la limpieza de privacidad. La model card no documenta la composición del dataset más allá del recuento, ni si se emplearon técnicas de RLHF, DPO o RLCD en este ajuste específico (el RLCD se menciona en el material de la familia base, no en este checkpoint).

## Capacidades

- Clasificación binaria de decisión: distingue entre `surface_now` y `hold_silent` sobre escenarios de texto.
- Decisión en un único paso hacia delante (no autorregresiva), lo que reduce latencia frente a modelos generativos.
- Calibración de probabilidades: la model card reporta Brier score, indicando que se evalúa la calidad probabilística además de la exactitud.
- Decisión sobre texto en el dominio específico de surfacing "Rule #3" del proyecto Mind.
- Capacidades de la familia base (no verificadas para este ajuste): decisiones tipadas (elección tipada, puntuación y sí/no) y enrutado multilingüe en más de 100 idiomas.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio o modo de pensamiento extendido: no disponible.

## Casos de uso

- Enrutado de surfacing en asistentes conversacionales: decidir si un agente debe exponer información al usuario en un momento dado (`surface_now`) o mantenerla callada (`hold_silent`), sobre la base de un escenario textual.
- Filtro previo en pipelines agenticos: usar el modelo como clasificador rápido antes de invocar un LLM generativo más costoso, aprovechando su naturaleza no autorregresiva y su bajo coste por inferencia.
- Observabilidad de trazas de agente: aplicar decisiones tipadas a trazas de ejecución para marcar cuándo conviene intervenir, alineado con el flujo "agent-trace observability" mencionado en la revisión hermana del modelo.
- Moderación y gestión de conversaciones: determinar si procede revelar una pieza de información sensible en un diálogo de atención al cliente.
- Validación de políticas internas: comprobar si una acción propuesta cumple una regla de negocio de tipo "revelar o no revelar" antes de ejecutarla.
- Investigación sobre calibración: por su métrica de Brier publicada, sirve como punto de comparación en estudios sobre calibración de clasificadores de decisión pequeños.
- Automatización de procesos con decisiones binarias auditables: integración en flujos de tramitación (por ejemplo, facturas) donde una decisión tipada y calibrada es preferible a una salida de texto libre.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor proceden de la model card y corresponden a un conjunto de validación de 20 escenarios estratificados.

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Accuracy en held-out | 0,850 | 20 escenarios estratificados |
| Brier score | 0,1066 | 20 escenarios estratificados |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 421.293.830 parámetros, los pesos ocupan aproximadamente 0,84 GB en fp16, unos 1,7 GB en fp32, 0,42 GB en int8 y 0,21 GB en int4, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: cualquier GPU con más de 2-4 GB de VRAM es, en principio, suficiente; una RTX 3060, RTX 4060 o superiores cubren el modelo con margen.
- Cabe en GPU de consumo: sí, incluidas gamas de entrada con al menos unos pocos GB de VRAM.
- Opciones de despliegue: la librería declarada es transformers y el tag `endpoints_compatible` sugiere despliegue en Inference Endpoints; vLLM o TGI son viables para pesos safetensors. llama.cpp y Ollama requerirían una conversión a GGUF, que no se distribuye en este repositorio.
- Latencia y throughput: no disponibles para este ajuste concreto. La familia base declara latencias de aproximadamente 33 ms y "sub-35ms", pero no se confirman para esta revisión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| philipsubhan/laya-typed-decisions | 421.293.830 | no disponible | accuracy 0,850; Brier 0,1066 (20 escenarios) | apache-2.0 | HuggingFace (0 descargas) |
| convaiinnovations/laya | no disponible | no disponible | no disponible | no disponible en la informacion | HuggingFace |
| convaiinnovations/laya-typed-decisions | no disponible | no disponible | no disponible | no disponible en la informacion | HuggingFace |

No se dispone de datos de rendimiento de las alternativas para establecer una comparación cuantitativa fiable. La comparación se limita a la relación de linaje: este checkpoint es un ajuste derivado del base `convaiinnovations/laya` y coexiste con la revisión `convaiinnovations/laya-typed-decisions`.

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste se entrena sobre 99 escenarios de una única tarea (`surface_now` frente a `hold_silent`) y no debe esperarse rendimiento fuera de ese dominio.
- Riesgo de sobreajuste: con solo 99 ejemplos de entrenamiento y 20 de validación, las métricas publicadas (0,850 de accuracy) proceden de una muestra muy pequeña y pueden no generalizar.
- Idiomas y contexto no documentados: se desconoce la cobertura lingüística real de este ajuste y su longitud de contexto máxima.
- Sin datos de sesgo: la model card no reporta análisis de sesgos ni evaluación de equidad.
- Riesgo de alucinación bajo: al ser un modelo de decisión tipada no generativo, el riesgo relevante no es la alucinación de texto, sino la clasificación errónea o mal calibrada.
- Ambigüedad de procedencia: el autor del repositorio (`philipsubhan`) no coincide con el propietario de la familia base (`convaiinnovations`), por lo que conviene verificar el linaje antes de usarlo en producción.
- Licencia: apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del checkpoint base del que deriva.
- Adopción nula: 0 descargas y 0 likes en el momento de la recopilación, sin señales de uso o mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/philipsubhan/laya-typed-decisions
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Revisión hermana de la familia: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Sitio del proyecto Laya: https://laya.convaiinnovations.com/
- Repositorio en GitHub: https://github.com/NandhaKishorM/laya
- Ficha en gradually.ai: https://www.gradually.ai/en/ai-models/laya-typed-decisions/
