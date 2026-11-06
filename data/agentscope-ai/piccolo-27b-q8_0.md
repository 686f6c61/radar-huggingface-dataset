# agentscope-ai/Piccolo-27B-Q8_0

## Resumen

Piccolo-27B-Q8_0 es la cuantización Q8_0 en formato GGUF del modelo Piccolo-27B, desarrollado por el equipo de AgentScope (agentscope-ai). No se trata de un modelo generativo convencional: es un modelo de decisión (decision model) diseñado para evaluar y clasificar opciones candidatas en lugar de producir texto libre. Su función principal es la revisión automática de llamadas a herramientas (tool review) y la compactación de contexto (context compaction) dentro de QwenPaw, el entorno de agentes del mismo equipo.

El modelo emplea una arquitectura híbrida con atención bidireccional en las capas de atención completa y atención lineal en el resto, junto con un layout de entrada específico denominado `flex_twice`. Con aproximadamente 26.900 millones de parámetros, el checkpoint completo se distribuye en safetensors y esta versión Q8_0 en GGUF pesa 28,6 GB. Solo soporta inglés y chino, y se publica bajo licencia Apache 2.0.

Su relevancia es acotada pero específica: cubre un nicho creciente en sistemas de agentes, donde decidir si una herramienta debe ejecutarse o si el contexto debe compactarse requiere un modelo dedicado en lugar de reutilizar un LLM generativo. La integración con QwenPaw depende de un parche en llama.cpp (PR #8463) todavía en estado de borrador, lo que limita su adopción fuera de ese ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención bidireccional en capas de atención completa y atención lineal; layout de entrada `flex_twice` |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (esta versión); el proyecto publica además BF16 y Q4_K_M |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint original en safetensors en el repo base) |

## Arquitectura y entrenamiento

Piccolo-27B es un transformer híbrido que combina capas de atención completa con atención bidireccional y capas de atención lineal. El runtime consume el layout de entrada exacto `flex_twice` del checkpoint y aplica atención bidireccional sobre el prompt en las capas de atención completa, mientras que el cómputo de atención lineal se mantiene sin cambios respecto al modelo original. El modelo no genera tokens de respuesta: lee los logits de candidatos de un solo token en la posición `Answer: (` y aplica softmax sobre los candidatos a temperatura 1.

La conversión a GGUF se realizó con un conversor parcheado usando `--no-mtp`, seguida de cuantización Q8_0 con `llama-quantize`. Se conservan todas las capas del backbone de texto y la cabeza de salida; el codificador de visión y los tensores auxiliares MTP no se usan en esta ruta de decisión textual, aunque permanecen en el checkpoint original. No se empleó matriz de importancia ni dataset de calibración para esta cuantización. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación y decisión sobre candidatos: evalúa opciones de un solo token mediante softmax en la posición `Answer: (`, sin generar texto.
- Revisión automática de llamadas a herramientas (tool review) en el flujo de agentes de QwenPaw.
- Compactación de contexto (context compaction) para reducir el historial de conversación en sesiones largas.
- Atención bidireccional sobre el prompt, adecuada para tareas de clasificación y decisión.
- Soporte multilingüe limitado a inglés y chino.
- No soporta tool calling generativo, agentes multi-paso ni modos de razonamiento extendido por sí mismo; su rol es auxiliar dentro de un pipeline de agentes.

## Casos de uso

- Revisión de llamadas a herramientas en agentes: el modelo evalúa si una llamada propuesta por un LLM debe aprobarse o bloquearse antes de ejecutarse, actuando como capa de control en QwenPaw con el modo Decision Model habilitado.
- Compactación de contexto en conversaciones largas: sustituye o complementa el mecanismo nativo de compactación de QwenPaw, decidiendo qué fragmentos del historial resumir cuando se aproxima el límite de ventana.
- Filtrado de acciones en pipelines de automatización: como clasificador de decisión, puede integrarse en flujos donde un agente propone acciones y se requiere una validación binaria o multiclase antes de ejecutarlas.
- Control de seguridad en entornos de agentes locales: al ejecutarse en local con llama.cpp parcheado, permite validar acciones sin enviar datos a servicios externos.
- Evaluación de candidatos en sistemas de enrutamiento: su mecanismo de logits sobre candidatos predefinidos encaja en tareas de selección entre opciones discretas (herramientas, rutas, intents).
- Investigación sobre modelos de decisión: sirve como referencia para estudiar arquitecturas híbridas con atención bidireccional aplicadas a clasificación en lugar de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados del checkpoint completo están en el repositorio de evaluación del proyecto, pero no se incluyen cifras en esta ficha. El único dato numérico de validación es un smoke test de 4 preguntas contra el checkpoint completo, con una diferencia máxima absoluta de probabilidad de candidato de 0,00298326 y coincidencia en las elecciones top; el propio autor aclara que no constituye validación de benchmark, seguridad ni calibración.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: aproximadamente 28-30 GB solo para los pesos, más overhead de contexto y runtime.
- GPU recomendadas: A100 40 GB, H100, L40S 48 GB o RTX A6000 48 GB; en GPUs de 24 GB no cabe en Q8_0 sin offloading.
- No cabe en GPUs de consumo de 24 GB o menos en esta cuantización; para esos casos habría que recurrir a la variante Q4_K_M del proyecto.
- Despliegue: exclusivamente mediante llama.cpp con el parche de QwenPaw PR #8463. Un runtime causal estándar o las Chat Completions de Ollama no implementan este modelo.
- Configuración obligatoria del runtime: desactivar reutilización de prefix-cache, chunked prefill y truncación silenciosa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Piccolo-27B-Q8_0 | ~26,9 B | no disponible | Modelo de decisión (tool review, compactación) | Apache 2.0 | GGUF en HF, runtime parcheado |
| LLM generativo de ~27 B (p. ej. Qwen) | ~27 B | variable | Generación de texto y tool calling | variable | Amplia |
| Clasificadores BERT/RoBERTa | 0,1-0,4 B | 512 | Clasificación de texto | Apache 2.0 / MIT | Amplia |

La comparación directa es difícil porque Piccolo no es un modelo generativo ni un clasificador de texto convencional: opera sobre logits de candidatos en un formato de entrada específico. Frente a un LLM generativo de tamaño similar, ofrece menor huella de salida (un token) y un rol acotado a decisiones; frente a clasificadores pequeños, requiere mucho más hardware pero maneja un formato de prompt estructurado más complejo.

## Limitaciones y advertencias

- No es un modelo de chat: no genera respuestas y no funciona en runtimes causales estándar ni en Ollama sin parche.
- La integración con QwenPaw depende del PR #8463, aún en borrador; la API y el flujo pueden cambiar.
- Solo inglés y chino; sin soporte de otros idiomas.
- La cuantización Q8_0 no usó matriz de importancia ni calibración, por lo que puede haber degradación no medida frente al checkpoint completo.
- El smoke test de validación es mínimo (4 preguntas) y no cubre seguridad, sesgos ni robustez.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de decisiones erróneas en tool review o compactación; el autor recomienda mantener los mecanismos nativos de aprobación y fallback de QwenPaw.
- El codificador de visión y los tensores MTP no están en esta versión GGUF; no hay capacidades multimodales en esta ruta.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del runtime parcheado condiciona su despliegue en producción.
- Todos los shards GGUF del repositorio son necesarios; `release-manifest.json` contiene sus hashes SHA-256 y tamaños para verificación.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-27B-Q8_0
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-27B
- GitHub del proyecto: https://github.com/agentscope-ai/Piccolo
- Demo Decision: https://decisionplayground.agentscope.io/
- PR de integración en QwenPaw: https://github.com/agentscope-ai/QwenPaw/pull/8463
- Guía de configuración local: https://github.com/Xinji-Mai/QwenPaw/blob/beea37749185553a6897e546eae6b7954717da5b/docs/local-piccolo.md
- Matriz de modelos: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/docs/MODELS.md
- Resultados de evaluación del checkpoint completo: https://github.com/agentscope-ai/Piccolo/blob/0d1b3d4544766a55d137b979e8c87141bf182059/evaluation/README.md
- ModelScope: pendiente de publicación (no disponible)
