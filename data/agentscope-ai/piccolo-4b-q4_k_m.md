# agentscope-ai/Piccolo-4B-Q4_K_M

## Resumen

Piccolo-4B-Q4_K_M es la cuantización GGUF de tipo Q4_K_M del modelo Piccolo-4B, desarrollado por AgentScope (agentscope-ai). No es un modelo generativo al uso: es un **modelo de decisión** (decision-model) diseñado para revisar operaciones de herramientas y decidir qué contexto retener en flujos de agentes. Se publica con pipeline `text-classification` y una arquitectura con atención bidireccional en las capas de prompt, lo que lo aleja del transformer causal estándar.

El modelo resuelve un problema concreto en sistemas agénticos: decidir si una llamada a herramienta debe aprobarse o bloquearse, y qué fragmentos de contexto conviene conservar o descartar en la compactación de memoria. Con 4.205.751.296 parámetros totales y pesos en formato GGUF, está pensado para ejecutarse en local junto a un runtime parcheado de QwenPaw (llama.cpp con soporte específico de Piccolo).

Es relevante ahora porque propone un componente dedicado y pequeño (4B) para tareas de juicio dentro de pipelines de agentes, en lugar de delegar esas decisiones en un LLM generativo grande. La licencia Apache 2.0 y la disponibilidad de 12 repositorios (full, BF16, Q8_0, Q4_K_M) facilitan su evaluación, aunque su uso exige un runtime no estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención bidireccional completa en capas de prompt (bidirectional-attention) y atención lineal sin cambios; modelo de decisión, no generativo |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible como cifra publicada; la guía de inferencia fija ctx/batch/ubatch en 8192 |
| Tipos de cuantización | Q4_K_M (esta publicación); el modelo base ofrece además BF16 y Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (múltiples shards; todos requeridos); safetensors en el repo base |

## Arquitectura y entrenamiento

Piccolo-4B emplea una arquitectura transformer con una particularidad: las capas de prompt usan atención bidireccional completa, mientras que las capas de atención lineal se mantienen sin cambios. Esta combinación (denominada `flex_twice` en la documentación del runtime) permite que el modelo puntúe decisiones sobre el prompt completo en lugar de generar tokens de respuesta. El modelo no produce tokens de salida: devuelve probabilidades sobre tokens candidatos a temperatura 1.

La conversión a GGUF se realizó desde el checkpoint completo a BF16 text GGUF con `--no-mtp`, seguida de `llama-quantize` a Q4_K_M. Se conservan los tensores del backbone de texto y de salida; los tensores auxiliares de visión y MTP permanecen en el checkpoint base completo. No se usó importance matrix, dataset de calibración, pruning ni recuantización Q8-a-Q4. Q4_K_M mezcla precisiones por tensor, documentadas en `sensitive-tensor-types.json`. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Revisión de operaciones de herramientas: evalúa si una llamada a herramienta debe aprobarse, bloquearse o marcarse como riesgosa.
- Retención de contexto: decide qué fragmentos de contexto conservar o descartar en la compactación de memoria de un agente.
- Puntuación (scoring): genera expectativas de puntuación normalizadas sobre candidatos.
- Clasificación de texto: pipeline declarado `text-classification`.
- Soporte bilingüe inglés y chino, incluyendo evidencia de tareas en ambos idiomas.
- Manejo de prompts largos y completos (sin truncado) con metadatos de revisión de forma nativa.
- No genera texto libre: no es un modelo conversacional generativo pese a la etiqueta `conversational` en los tags.
- No soporta tool calling en el sentido generativo; su función es precisamente revisar tool calls de otros sistemas.
- No dispone de visión ni audio en esta cuantización (los tensores auxiliares quedan en el checkpoint base).

## Casos de uso

- Revisión de seguridad de tool calls en agentes: integrado en QwenPaw, el modelo puntúa cada llamada a herramienta propuesta por un agente y permite bloquear operaciones riesgosas antes de ejecutarlas, con una tasa de desacuerdo de decisión del 4,17 % frente a BF16 en las pruebas sintéticas.
- Compactación de memoria de agentes: decide qué partes del contexto histórico conservar cuando la ventana se llena, con una fracción de contexto etiquetado como necesario descartado de 0,000000 en 24 fixtures de validación.
- Puerta de aprobación en pipelines automatizados: actúa como clasificador previo que filtra acciones de agentes antes de llegar a sistemas de producción, reduciendo la necesidad de un LLM grande para cada juicio.
- Despliegue local en entornos con recursos limitados: con 2,7 GB de repo en Q4_K_M, cabe en estaciones de trabajo y servidores modestos, siempre que se use el runtime parcheado.
- Evaluación de riesgo en flujos multi-herramienta: puntúa la idoneidad de cada operación dentro de un grafo de tareas, usando evidencia en inglés o chino.
- Investigación sobre modelos de decisión: sirve como referencia para estudiar arquitecturas con atención bidireccional aplicadas a juicios discretos en lugar de generación.
- Control de calidad de agentes en CI: puede ejecutarse sobre trazas de conversaciones para detectar decisiones que se desvían del comportamiento esperado, comparando probabilidades de candidatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye métricas de regresión sintética de cuantización (265 peticiones, 556 juicios), no benchmarks independientes:

| Métrica (Q4_K_M frente a BF16) | Valor |
|---|---|
| Variación total media / p95 | 0,020741 / 0,117999 |
| Diferencia máxima absoluta de probabilidad de candidato | 0,373068 |
| Acuerdo de primera elección con márgenes BF16 >= 0,20 | 0,988991 sobre 545 preguntas |
| Diferencia media de expectativa de puntuación normalizada | 0,006756 |
| Desacuerdo de decisión de revisión nativa | 0,041667 sobre 96 peticiones |
| Fixtures riesgosos auto-permitidos nuevos | 0 |
| Fracción de contexto necesario descartado nueva | 0,000000 sobre 24 fixtures |

El autor advierte explícitamente que estas comprobaciones sintéticas no son un benchmark independiente, ni calibración de riesgo, ni certificación de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB para los pesos Q4_K_M más overhead de contexto; con ctx de 8192 y un solo slot, el consumo total de KV cache y buffers se mantiene bajo, aunque no se publica una cifra oficial.
- GPU recomendadas: no se especifican modelos concretos; la validación se realizó con runtime CUDA. Cualquier GPU con al menos 4-6 GB de VRAM disponible debería poder alojar el modelo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares, dado el tamaño de 2,7 GB del repo.
- Opciones de despliegue: exclusivamente llama.cpp con el parche Piccolo de QwenPaw (PR #8463). No funciona con vLLM, TGI, Ollama ni llama.cpp sin parchear, ya que no implementan el contrato de atención bidireccional ni la salida de probabilidades de candidatos.
- Configuración obligatoria: ctx/batch/ubatch 8192, un solo slot, sin prefix caching, sin chunked prefill, sin truncado del prompt y sin generación de tokens de respuesta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión para revisión de tool calls y retención de contexto). La comparación más directa disponible es con las otras cuantizaciones del mismo modelo:

| Modelo | Parámetros | Formato | Tamaño repo | Licencia | Uso |
|---|---|---|---|---|---|
| Piccolo-4B-Q4_K_M | 4,2B | GGUF | 2,7 GB | Apache 2.0 | Runtime parcheado QwenPaw |
| Piccolo-4B (BF16) | 4,2B | safetensors | no disponible | Apache 2.0 | Referencia de validación |
| Piccolo-4B-Q8_0 | 4,2B | GGUF | no disponible | Apache 2.0 | Runtime parcheado QwenPaw |

Para alternativas de otros autores: no disponible.

## Limitaciones y advertencias

- Requiere un runtime no estándar: sin el parche de llama.cpp de QwenPaw PR #8463, el modelo no funciona. Chat Completions causal ordinario no implementa el contrato.
- La integración en QwenPaw sigue en Draft PR; la publicación no implica que el catálogo de modelos existente se haya actualizado.
- Las diferencias de probabilidad frente a BF16 pueden alterar decisiones basadas en umbrales; se recomienda mantener el fallback nativo de aprobación y compactación de QwenPaw.
- El acuerdo de referencia no equivale a corrección de la tarea: las pruebas son sintéticas y no constituyen certificación de seguridad ni calibración de riesgo.
- El modelo no genera texto; usarlo como LLM conversacional producirá resultados incorrectos.
- Idiomas limitados a inglés y chino; no hay soporte declarado de castellano.
- Riesgo de sesgo y alucinación no cuantificado en la información disponible; al ser un clasificador de decisiones, los errores se manifiestan como aprobaciones o bloqueos incorrectos, no como texto inventado.
- Licencia Apache 2.0 permite uso comercial, pero se mantiene la atribución de FlexDM en `THIRD_PARTY_LICENSES.md`.
- Todos los shards GGUF son obligatorios; una descarga parcial invalida el modelo.
- No hay validación independiente publicada; las métricas de la model card son autoinformadas por el autor.

## Enlaces

- HuggingFace (esta cuantización): https://huggingface.co/agentscope-ai/Piccolo-4B-Q4_K_M
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-4B
- Repositorio GitHub: https://github.com/agentscope-ai/Piccolo
- Matriz de modelos: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/docs/MODELS.md
- Resultados de benchmark del checkpoint completo: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/evaluation/README.md
- Playground de decisiones: https://decisionplayground.agentscope.io/
- PR de QwenPaw con el parche de runtime: https://github.com/agentscope-ai/QwenPaw/pull/8463
- Guía de configuración local (pineada): https://github.com/Xinji-Mai/QwenPaw/blob/beea37749185553a6897e546eae6b7954717da5b/docs/local-piccolo.md
- ModelScope (pendiente de publicación): https://modelscope.cn/models/agentscope-ai/Piccolo-27B
