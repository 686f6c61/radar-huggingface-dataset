# agentscope-ai/Piccolo-9B-Q4_K_M

## Resumen

Piccolo-9B-Q4_K_M es la cuantización Q4_K_M del modelo Piccolo-9B, desarrollado por AgentScope (agentscope-ai). No es un modelo generativo al uso: es un modelo de decisión (decision-model) orientado a la revisión de operaciones de herramientas y a decisiones de retención de contexto dentro del runtime QwenPaw. Su función es puntuar y clasificar peticiones y candidatos, no producir tokens de respuesta, lo que lo sitúa en la categoría de text-classification con un contrato de inferencia muy específico.

El modelo base cuenta con 8.953.803.264 parámetros (aproximadamente 9B) y emplea una arquitectura de atención bidireccional en las capas de prompt, con atención lineal en el resto del backbone. Soporta inglés y chino, y se distribuye bajo licencia Apache 2.0. Esta versión GGUF ocupa 5,6 GB en el repositorio y está pensada para despliegues locales con llama.cpp parcheado.

Su relevancia actual radica en que propone un patrón distinto al de los LLM conversacionales: un modelo pequeño y cuantizado que actúa como árbitro de decisiones dentro de un agente, evaluando si una operación debe aprobarse o si un fragmento de contexto debe retenerse. La contrapartida es que requiere un runtime específico (parche Piccolo en QwenPaw) y no funciona con Chat Completions causal estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención bidireccional en capas de prompt y atención lineal en el backbone (familia QwenPaw/Piccolo) |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card recomienda ctx/batch/ubatch de 8192 en el runtime) |
| Tipos de cuantizacion | Q4_K_M (esta versión); el modelo base publica también BF16 y Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (shards múltiples; pesos Safetensors completos en el repo base) |

## Arquitectura y entrenamiento

El modelo base Piccolo-9B emplea un transformer con un diseño híbrido de atención: capas de prompt con atención completa bidireccional y capas de backbone con atención lineal. Esta combinación está pensada para evaluar de forma conjunta el prompt completo y los candidatos, en lugar de generar secuencialmente. El runtime debe respetar el layout exacto `flex_twice` y exponer las probabilidades de los tokens candidatos a temperatura 1. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La cuantización Q4_K_M se generó a partir del checkpoint completo convertido a BF16 GGUF con `--no-mtp`, seguido de `llama-quantize`. No se usó importance matrix, dataset de calibración, poda ni recuantización Q8 a Q4. Se conservan los tensores del backbone de texto y de salida; los tensores auxiliares de visión y MTP permanecen únicamente en el checkpoint base completo. Los tipos exactos de tensores sensibles están registrados en `sensitive-tensor-types.json`.

El autor documenta mediciones de la cuantización sobre regresiones sintéticas de flujos de trabajo (265 peticiones, 556 juicios): diferencia media de variación total de 0,013701 y p95 de 0,081681; diferencia absoluta máxima de probabilidad de candidato de 0,268553; acuerdo de primera elección del 1,000000 con márgenes BF16 ≥ 0,20 sobre 553 preguntas; discrepancia en decisiones nativas de revisión de 0,041667 sobre 96 peticiones; y fracción de contexto etiquetado como necesario descartado de 0,000000 sobre 24 fixtures. Estas cifras son comprobaciones de ingeniería, no benchmarks independientes ni certificación de seguridad.

## Capacidades

- Clasificación y puntuación de decisiones: evalúa operaciones de herramientas y candidatos, devolviendo probabilidades por token candidato en lugar de texto generado.
- Revisión de operaciones de herramientas (tool-operation review): determina si una acción propuesta por un agente debe aprobarse o marcarse para revisión.
- Retención de contexto: decide qué fragmentos de contexto deben conservarse o descartarse (compaction), con métricas de recuperabilidad documentadas.
- Puntuación de evidencias de tarea en inglés y chino.
- Procesamiento de prompts largos y completos, sin truncado, gracias al modo bidireccional sobre el prompt.
- Integración con agentes multi-paso a través de QwenPaw, actuando como capa de decisión dentro del bucle del agente.
- No genera tokens de respuesta: no es adecuado para generación de texto, código o matemáticas.
- No dispone de tool calling en el sentido convencional de Chat Completions; su interfaz es el contrato de decisión de QwenPaw.

## Casos de uso

- Puerta de aprobación de acciones de agentes: el modelo recibe la operación propuesta por un agente y el contexto relevante, y emite una probabilidad de aprobación que el runtime compara con un umbral. Es adecuado porque su entrenamiento está orientado específicamente a este juicio y no requiere generar texto.
- Compactación de contexto en sesiones largas: decide qué partes de la conversación deben retenerse y cuáles pueden descartarse, reduciendo el coste de contexto en agentes de larga duración. Las mediciones del autor muestran una fracción de contexto necesario descartado de 0,000000 sobre 24 fixtures.
- Moderación de operaciones en pipelines de automatización: integrado en QwenPaw, actúa como capa intermedia que filtra operaciones riesgosas antes de ejecutarlas, con fallback nativo de aprobación si el modelo no está disponible.
- Evaluación de evidencias en flujos bilingües inglés-chino: puntúa si una tarea cuenta con evidencia suficiente en ambos idiomas, útil en entornos corporativos con documentación mixta.
- Despliegue local en estaciones de trabajo: con 5,6 GB en Q4_K_M, puede ejecutarse en GPUs de consumo con suficiente VRAM, manteniendo los datos de decisión en local.
- Investigación sobre modelos de decisión: sirve como referencia reproducible para estudiar arquitecturas bidireccionales aplicadas a clasificación y para comparar el impacto de la cuantización en decisiones con umbral.
- Control de calidad de agentes en producción: registra y revisa decisiones de aprobación para auditar el comportamiento del agente sin exponer datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados del checkpoint completo en `evaluation/README.md`, pero no implica puntuaciones equivalentes para esta cuantización. Las únicas métricas publicadas son las diferencias de cuantización descritas en la sección de arquitectura, que no constituyen un benchmark independiente.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6-7 GB para el archivo Q4_K_M de 5,6 GB más overhead de contexto (8192 tokens recomendados).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM; con 6 GB el margen es ajustado.
- Despliegue: exclusivamente mediante llama.cpp con el parche Piccolo descrito en QwenPaw PR #8463. No es compatible con vLLM, TGI, Ollama ni llama.cpp sin parchear.
- Configuración obligatoria del runtime: ctx/batch/ubatch de 8192, un solo slot, sin generación de tokens de respuesta, sin prefix caching, sin chunked prefill y sin truncado del prompt.
- Latencia y throughput: no disponibles. Al no generar tokens, el coste dominado es el prefill del prompt completo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Piccolo-9B-Q4_K_M | 8,95B | no disponible (runtime a 8192) | Modelo de decision para revision de herramientas y retencion de contexto | Apache 2.0 | Hugging Face (GGUF), requiere runtime parcheado |
| Piccolo-9B (BF16) | 8,95B | no disponible | Mismo proposito, precision completa | Apache 2.0 | Hugging Face |
| Piccolo-9B-Q8_0 | 8,95B | no disponible | Mismo proposito, cuantizacion Q8_0 | Apache 2.0 | Hugging Face |

No se dispone de información sobre modelos comparables de otros desarrolladores en la misma categoría de modelo de decisión con atención bidireccional. Las alternativas más cercanas serían clasificadores o rerankers de propósito general, pero no se han proporcionado datos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Requiere un runtime específico: llama.cpp con el parche Piccolo de QwenPaw PR #8463. Los runtimes causales estándar y las APIs de Chat Completions no implementan el contrato y producirán resultados incorrectos.
- No genera texto: no debe emplearse para generación, código, matemáticas ni conversación.
- Idiomas limitados a inglés y chino; no hay soporte declarado de castellano.
- Las mediciones de cuantización son comprobaciones sintéticas de ingeniería, no un benchmark independiente, calibración de riesgo ni certificación de seguridad. El acuerdo con la referencia no equivale a corrección de la tarea.
- Las diferencias de probabilidad pueden alterar decisiones basadas en umbral; se recomienda mantener el fallback nativo de aprobación y compactación de QwenPaw.
- La integración en QwenPaw permanece en Draft PR #8463; la publicación del modelo no implica que el catálogo existente lo reconozca.
- ModelScope aún no está publicado.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- El repositorio base conserva los tensores de visión y MTP, pero esta cuantización no los incluye; no debe esperarse capacidad multimodal.
- Uso comercial permitido por Apache 2.0, con atribución de FlexDM conservada en THIRD_PARTY_LICENSES.md.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-9B-Q4_K_M
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-9B
- Repositorio GitHub: https://github.com/agentscope-ai/Piccolo
- Matriz de modelos: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/docs/MODELS.md
- Resultados de evaluacion del checkpoint completo: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/evaluation/README.md
- PR de integracion en QwenPaw: https://github.com/agentscope-ai/QwenPaw/pull/8463
- Guia de configuracion local (pineada): https://github.com/Xinji-Mai/QwenPaw/blob/beea37749185553a6897e546eae6b7954717da5b/docs/local-piccolo.md
- Demo Decision Playground: https://decisionplayground.agentscope.io/
- ModelScope (pendiente): https://modelscope.cn/models/agentscope-ai/Piccolo-27B
