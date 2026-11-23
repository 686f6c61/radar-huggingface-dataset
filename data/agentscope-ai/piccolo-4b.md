# agentscope-ai/Piccolo-4B

## Resumen

Piccolo-4B es un modelo de decisión especializado en la revisión de herramientas (tool review) y la selección de contexto dentro de sistemas de agentes, desarrollado por AgentScope (agentscope-ai). No es un modelo generativo de propósito general: se presenta como un clasificador de texto (`pipeline_tag: text-classification`) que evalúa candidatos —herramientas, fragmentos de contexto, opciones— y emite una puntuación de decisión. Parte del checkpoint base Qwen/Qwen3.5-4B, sobre el que se aplica un ajuste fino con atención bidireccional para permitir el scoring de candidatos completos en una sola pasada.

El modelo resuelve un problema concreto en arquitecturas agénticas: decidir, entre un conjunto de herramientas o fragmentos de contexto, cuál es el más adecuado para el siguiente paso. En lugar de delegar esa decisión a un LLM generativo (coste alto en tokens y latencia), Piccolo-4B la convierte en una tarea de clasificación/scoring, lo que reduce el coste por decisión y permite integrarlo como componente dedicado dentro de un pipeline de agentes.

Con 4.659.865.088 parámetros (4,66 mil millones) y un repositorio de 9,3 GB en safetensors, es un modelo de tamaño medio que cabe en GPUs de consumo con cuantización. La licencia Apache 2.0 y su integración con el ecosistema QwenPaw lo hacen relevante para equipos que construyen agentes con tool calling y necesitan un enrutador de decisiones barato y desacoplado del modelo principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B con atención bidireccional (bidirectional-attention) para scoring de candidatos |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | No es MoE; no aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo solo distribuye safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

Piccolo-4B es un ajuste fino del checkpoint Qwen/Qwen3.5-4B. La innovación principal declarada es el uso de atención bidireccional en lugar de la atención causal típica de los modelos generativos: esto permite que el modelo observe simultáneamente la consulta y el candidato (herramienta o fragmento de contexto) para producir una puntuación de idoneidad. El repositorio incluye una implementación de referencia (`piccolo_inference.py`) específica para esta atención bidireccional y el scoring de candidatos, lo que indica que no se puede usar con un pipeline estándar de `transformers` sin adaptación.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal. El modelo se etiqueta como `decision-model` y `text-classification`, coherente con su función de scoring más que de generación.

## Capacidades

- Revisión de herramientas (tool review): evalúa y puntúa herramientas candidatas para una tarea dada dentro de un agente.
- Selección de contexto: identifica y puntúa fragmentos de contexto relevantes entre múltiples candidatos.
- Scoring de candidatos con atención bidireccional: procesa consulta y candidato conjuntamente para emitir una puntuación.
- Clasificación de texto orientada a decisión (pipeline `text-classification`).
- Soporte multilingüe limitado a inglés y chino.
- Integración con el ecosistema AgentScope y QwenPaw para despliegue en pipelines de agentes.
- No se documentan capacidades de generación libre, tool calling generativo, visión (pese al tag `image-text-to-text`), audio ni modo thinking; la función declarada es la decisión/scoring.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado un conjunto de herramientas disponibles y la intención del usuario, Piccolo-4B puntúa cada herramienta y selecciona la más adecuada, reduciendo la carga del LLM principal y el coste por decisión.
- Selección de contexto en RAG agéntico: entre múltiples fragmentos recuperados, el modelo puntúa su relevancia para la consulta actual y filtra los que pasan al prompt del generador, mejorando la precisión y reduciendo tokens.
- Reducción de latencia en pipelines multi-paso: al delegar la decisión a un modelo de 4,66 B en lugar de un LLM grande, se acorta el tiempo por paso en bucles agénticos con muchas iteraciones.
- Validación previa de tool calls: antes de ejecutar una herramienta, el modelo revisa si la llamada propuesta es coherente con la tarea, actuando como capa de seguridad o sanity check.
- Orquestación de agentes en producción con QwenPaw: integración documentada para usar Piccolo localmente en la revisión de herramientas y selección de contexto dentro de un stack AgentScope.
- Clasificación de intenciones en asistentes conversacionales: usar el scoring de candidatos para mapear la consulta del usuario a una acción o categoría predefinida en inglés o chino.
- Filtrado de candidatos en sistemas de recomendación de acciones: puntuar opciones discretas (herramientas, comandos, rutas) y ordenarlas por idoneidad antes de la ejecución.

## Benchmarks y rendimiento

Resultados publicados en la model card para el checkpoint completo:

| Benchmark | Resultado |
|---|---:|
| HarnessJevBench Hard ↑ | 62,03 % |
| DataJevBench ↑ | 70,60 % |
| JevBench Public ↑ | 87,01 % |
| Decision Index Public ↑ | 58,00 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 12-16 GB.
- En cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits: alrededor de 2,5-3 GB. No obstante, el repositorio no distribuye cuantizaciones oficiales y la implementación de referencia requiere atención bidireccional, por lo que la cuantización estándar (GGUF/llama.cpp) no está garantizada.
- GPU recomendadas: A100, H100 o L40S para producción; RTX 4090 (24 GB) para desarrollo y despliegue en FP16.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en FP16; en GPUs de 8-12 GB probablemente solo con cuantización, sujeta a validación.
- Opciones de despliegue: la vía documentada es la implementación de referencia del repositorio (`piccolo_inference.py`) con `transformers` y CUDA. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, y la atención bidireccional puede requerir adaptaciones.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Piccolo-4B | 4,66 B | No disponible | Decisión/scoring de herramientas y contexto | Apache 2.0 | Hugging Face, ModelScope |
| Qwen/Qwen3.5-4B (base) | ~4 B | No disponible | Generación de propósito general | No disponible en la información | Hugging Face |
| Piccolo-27B (misma familia) | ~27 B (según nombre) | No disponible | Decisión/scoring | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, función y licencia. No se identifican en la información alternativas de la misma categoría (modelos de decisión dedicados) para comparar.

## Limitaciones y advertencias

- Modelo especializado: no está pensado para generación libre de texto; usarlo como LLM general produciría resultados pobres.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto no documentada; en tareas de selección de contexto con documentos largos puede haber truncamiento no especificado.
- La atención bidireccional requiere una implementación de inferencia específica; los pipelines estándar de `transformers`, vLLM o llama.cpp pueden no funcionar sin adaptación.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en hardware modesto.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni tasas de error fuera de los benchmarks JevBench; el comportamiento en dominios no cubiertos por el entrenamiento es desconocido.
- Los benchmarks publicados (JevBench, Decision Index) son propios del ecosistema AgentScope y no permiten comparación directa con métricas estándar de la industria.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros (`THIRD_PARTY_LICENSES.md`) heredados del modelo base Qwen3.5-4B.
- El tag `image-text-to-text` aparece en los metadatos de Hugging Face, pero la model card no documenta capacidades de visión; no asumir multimodalidad sin verificación.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-4B
- ModelScope: https://www.modelscope.cn/models/AgentScope/Piccolo-4B
- Repositorio del proyecto: https://github.com/agentscope-ai/Piccolo
- Guía de configuración QwenPaw: https://github.com/agentscope-ai/Piccolo/blob/main/docs/QWENPAW.md
- Ejemplo de request de inferencia: https://github.com/agentscope-ai/Piccolo/tree/main/inference
- Resultados de benchmarks: https://github.com/agentscope-ai/Piccolo/tree/main/evaluation
- Decision Playground: https://decisionplayground.agentscope.io/
- Colección ModelScope QwenPaw Flash: https://www.modelscope.cn/collections/AgentScope/QwenPaw-Flash
- Licencia: https://huggingface.co/agentscope-ai/Piccolo-4B/resolve/main/LICENSE
- Avisos de terceros: https://huggingface.co/agentscope-ai/Piccolo-4B/resolve/main/THIRD_PARTY_LICENSES.md
