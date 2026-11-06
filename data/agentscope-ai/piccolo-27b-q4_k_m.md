# agentscope-ai/Piccolo-27B-Q4_K_M

## Resumen

Piccolo-27B-Q4_K_M es la cuantización oficial en GGUF Q4_K_M de Piccolo-27B, un modelo de decisión desarrollado por AgentScope AI (agentscope-ai) y orientado a tareas de revisión de operaciones de herramientas y retención de contexto en agentes. No es un modelo generativo conversacional al uso: su pipeline declarado es `text-classification` y su contrato de inferencia exige producir probabilidades de tokens candidatos en lugar de tokens de respuesta. Esto lo convierte en un componente especializado dentro de arquitecturas de agentes, no en un sustituto de un LLM generalista.

El modelo base cuenta con 26.895.998.464 parámetros (~26,9 mil millones) y una arquitectura derivada de Qwen con atención bidireccional completa en las capas de prompt y atención lineal sin modificar, un diseño híbrido que el autor etiqueta como `qwenpaw`. La versión Q4_K_M ocupa 16,5 GB en el repositorio y está pensada para ejecutarse con un parche específico de llama.cpp descrito en el PR #8463 de QwenPaw; las implementaciones causales estándar de Chat Completions no implementan este contrato.

Su relevancia actual reside en que aborda un problema concreto de los sistemas agénticos: decidir si una operación de herramienta debe aprobarse y si el contexto debe retenerse o compactarse, con tolerancias de cuantización medidas y documentadas. La licencia Apache 2.0 y la publicación de pesos completos en safetensors en el repositorio base facilitan su auditoría e integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención bidireccional completa en capas de prompt y atención lineal (familia Qwen, variante "qwenpaw") |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible como cifra oficial; la configuración de inferencia recomendada usa ctx/batch/ubatch de 8192 con un solo slot |
| Tipos de cuantizacion | Q4_K_M (esta versión); el autor publica además BF16 y Q8_0 en la matriz de 12 repositorios |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (múltiples shards, todos necesarios); safetensors completos en el repositorio base |

## Arquitectura y entrenamiento

Piccolo-27B emplea una arquitectura transformer híbrida en la que las capas de prompt usan atención bidireccional completa y las capas de atención lineal se mantienen sin cambios respecto al diseño original. El pipeline es de clasificación de texto: el modelo no genera tokens de respuesta, sino que expone probabilidades de tokens candidatos a temperatura 1, lo que exige un runtime adaptado. El autor etiqueta la variante como `qwenpaw` y el modelo base se asocia a la familia Qwen.

La conversión a GGUF se realizó desde el checkpoint completo a BF16 validado con `--no-mtp` y posteriormente se aplicó `llama-quantize` Q4_K_M. Se conservan los tensores del backbone de texto y de salida; los tensores auxiliares de visión y MTP permanecen únicamente en el checkpoint base completo. No se usó importance matrix, dataset de calibración, poda ni recuantización de Q8 a Q4. Q4_K_M emplea precisiones mixtas por tensor, con los tipos exactos de salida y embedding registrados en `sensitive-tensor-types.json`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Revisión de operaciones de herramientas: evalúa si una acción propuesta por un agente debe aprobarse, emitiendo probabilidades sobre tokens candidatos.
- Decisiones de retención de contexto: determina qué parte del contexto debe conservarse o compactarse, con métricas de contexto etiquetado como necesario que se descarta.
- Puntuación (scoring) de evidencias de tarea en inglés y chino.
- Procesamiento de prompts completos y largos sin truncado, con metadatos de revisión en formato nativo.
- Soporte de flujos de trabajo sintéticos con múltiples peticiones y juicios por petición (265 peticiones y 556 juicios en la validación del autor).
- Integración con QwenPaw mediante un runtime parcheado; no soporta Chat Completions causal estándar.
- Capacidades multimodales: los tensores de visión existen en el checkpoint base completo, pero no en esta cuantización GGUF.
- No se documentan tool calling generativo, agentes multi-paso autónomos ni modo thinking en esta model card.

## Casos de uso

- Puerta de aprobación en agentes que ejecutan herramientas: el modelo recibe la operación propuesta y devuelve probabilidades de aprobación o rechazo; encaja en pipelines donde se requiere una capa de revisión antes de ejecutar acciones sensibles, con la salvedad de que el autor recomienda mantener el fallback nativo de aprobación de QwenPaw.
- Gestión de memoria y compactación de contexto: dado un contexto de conversación, el modelo decide qué fragmentos retener; los datos de validación muestran una fracción de contexto necesario descartado de 0,000000 sobre 24 fixtures.
- Moderación de evidencias en tareas bilingües inglés-chino: puntúa la evidencia aportada por un agente para justificar una decisión, útil en sistemas de revisión documental automatizada.
- Auditoría de decisiones en producción: al exponer distribuciones de probabilidad sobre tokens candidatos, permite registrar la confianza de cada decisión y aplicar umbrales configurables.
- Enrutamiento condicional dentro de orquestadores de agentes: clasificar solicitudes o estados para decidir si se escala a revisión humana, aprovechando la baja discrepancia medida en decisiones nativas de revisión (0,000000 sobre 96 peticiones).
- Despliegue local en entornos con requisitos de privacidad: al ser un GGUF Q4_K_M de 16,5 GB, puede ejecutarse en infraestructura propia con llama.cpp parcheado, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente mediciones de diferencias de cuantización frente a BF16, que no constituyen un benchmark independiente ni una certificación de seguridad:

| Metrica (Q4_K_M frente a BF16) | Valor |
|---|---|
| Diferencia media de variación total | 0,006137 |
| Diferencia p95 de variación total | 0,019516 |
| Diferencia absoluta máxima de probabilidad de candidato | 0,709810 |
| Acuerdo en primera elección con márgenes BF16 >= 0,20 | 0,998182 (550 preguntas) |
| Diferencia media de expectativa de puntuación normalizada | 0,003909 |
| Discrepancia en decisión nativa de revisión | 0,000000 (96 peticiones) |
| Fixtures riesgosos etiquetados auto-permitidos nuevos | 0 |
| Fracción de contexto necesario descartado | 0,000000 (24 fixtures) |

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF ocupa 16,5 GB; con overhead de contexto de 8192 tokens y el runtime parcheado, se recomienda planificar al menos 20-24 GB de VRAM.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o A100/H100 son opciones razonables, aunque no hay validación publicada para estas configuraciones.
- GPU de consumo: cabe en tarjetas con 24 GB o más, como la RTX 4090; en tarjetas de 16 GB requeriría offload parcial a CPU, no documentado por el autor.
- Despliegue: llama.cpp con el parche Piccolo-aware descrito en QwenPaw PR #8463; no es compatible con runtimes sin parchear ni con Chat Completions causal estándar. No se documenta soporte de vLLM, TGI u Ollama.
- Configuración obligatoria: ctx/batch/ubatch 8192, un solo slot, sin generación de tokens de respuesta, sin prefix caching ni chunked prefill, y sin truncar el prompt.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica modelos comparables de la misma categoría (modelos de decisión para revisión de herramientas y retención de contexto), y no se dispone de datos de rendimiento que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce respuestas y no funciona con Chat Completions causal estándar; requiere el parche de QwenPaw y un runtime específico.
- La publicación del repositorio no implica que el catálogo de modelos de QwenPaw lo reconozca; hay que verificar la versión antes de seleccionarlo.
- Las mediciones de cuantización son comprobaciones sintéticas, no un benchmark independiente, una calibración de riesgo ni una certificación de seguridad; el acuerdo con la referencia no equivale a corrección de la tarea.
- Las diferencias de probabilidad pueden afectar a decisiones basadas en umbrales; se recomienda mantener el fallback nativo de aprobación y compactación de QwenPaw.
- Cobertura lingüística limitada a inglés y chino; no se declara soporte de castellano.
- Los tensores de visión y MTP no están incluidos en esta cuantización; las capacidades multimodales solo están disponibles en el checkpoint base completo.
- Riesgo de sesgo y alucinación: no documentado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, con la atribución de FlexDM conservada en `THIRD_PARTY_LICENSES.md`.
- ModelScope aún no está publicado y la integración en QwenPaw permanece en PR Draft #8463.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-27B-Q4_K_M
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-27B
- GitHub: https://github.com/agentscope-ai/Piccolo
- Demo Decision: https://decisionplayground.agentscope.io/
- PR de QwenPaw: https://github.com/agentscope-ai/QwenPaw/pull/8463
- Matriz de modelos: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/docs/MODELS.md
- Resultados de benchmark del checkpoint completo: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/evaluation/README.md
- Guía de configuración local: https://github.com/Xinji-Mai/QwenPaw/blob/beea37749185553a6897e546eae6b7954717da5b/docs/local-piccolo.md
- ModelScope (próximamente): https://modelscope.cn/models/agentscope-ai/Piccolo-27B
