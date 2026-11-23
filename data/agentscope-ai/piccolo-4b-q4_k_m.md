# agentscope-ai/Piccolo-4B-Q4_K_M

## Resumen

Piccolo-4B-Q4_K_M es la versión cuantizada en formato GGUF (Q4_K_M) de Piccolo-4B, un modelo de decisión desarrollado por AgentScope (agentscope-ai). A diferencia de un modelo generativo convencional, Piccolo está diseñado para emitir probabilidades sobre candidatos predefinidos sin generar tokens de respuesta, lo que lo orienta a tareas de revisión de herramientas (tool review) y selección de contexto en pipelines de agentes. El modelo cuenta con 4.205.751.296 parámetros totales y una arquitectura con atención bidireccional sobre el prompt, lo que permite puntuar candidatos considerando el contexto completo en ambas direcciones.

La relevancia de esta ficha radica en que se trata de una pieza de infraestructura para sistemas agénticos: en lugar de pedir a un LLM generativo que decida qué herramienta invocar o qué fragmento de contexto incluir, Piccolo evalúa directamente los candidatos y devuelve una distribución de probabilidad. La cuantización Q4_K_M reduce el peso del repositorio a 2,7 GB, lo que facilita su despliegue local en hardware de consumo.

El modelo soporta inglés y chino, se distribuye bajo licencia Apache 2.0 y requiere un runtime compatible con llama.cpp modificado (Piccolo-compatible llama.cpp) que implemente atención bidireccional y scoring nativo de candidatos. Su pipeline declarado en Hugging Face es text-classification, coherente con su naturaleza de modelo de decisión y no de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención bidireccional sobre el prompt (decision-model, tag qwenpaw) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (esta release); el checkpoint completo en BF16 GGUF conserva tensores de visión y auxiliares |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); el modelo base se distribuye en otros formatos no detallados |

## Arquitectura y entrenamiento

Piccolo-4B se basa en un backbone de texto transformer con atención bidireccional sobre el prompt, una desviación respecto a la atención causal habitual en modelos generativos. Esta elección es coherente con su función: puntuar candidatos (herramientas, fragmentos de contexto) condicionados por el prompt completo, sin generar texto. El proceso de conversión documentado indica que el backbone de texto se convirtió primero a BF16 GGUF y después se cuantizó a Q4_K_M; el checkpoint completo conserva además tensores de visión y auxiliares, lo que sugiere capacidades multimodales en el modelo base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona el tag "qwenpaw", que parece identificar la familia de modelos de decisión de AgentScope, pero no se detalla la receta de entrenamiento. La innovación técnica destacable es el modo de inferencia: el endpoint `/v1/systemone` del runtime compatible devuelve probabilidades sobre candidatos sin generar tokens de respuesta, apoyándose en atención bidireccional y scoring nativo de candidatos.

## Capacidades

- Puntuación de decisiones: devuelve probabilidades sobre un conjunto de candidatos en lugar de texto generado.
- Revisión de herramientas (tool review): evalúa si una herramienta propuesta es adecuada para una tarea dada.
- Selección de contexto: elige fragmentos de contexto relevantes para un paso de un agente.
- Atención bidireccional sobre el prompt, que permite condicionar la puntuación con información posterior al candidato.
- Soporte multilingüe limitado a inglés y chino.
- Compatibilidad con el endpoint `/v1/systemone` del runtime Piccolo-compatible para scoring sin generación.
- Tensores de visión y auxiliares presentes en el checkpoint completo (capacidad multimodal no detallada en la información disponible).
- Integración con el ecosistema AgentScope y con la colección QwenPaw Flash en ModelScope.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado un prompt de usuario y un catálogo de herramientas, Piccolo puntúa cada candidata y el orquestador selecciona la de mayor probabilidad, evitando una llamada generativa completa.
- Selección de contexto en RAG: el modelo evalúa fragmentos recuperados y asigna probabilidad de relevancia, lo que permite filtrar antes de construir el prompt final y reducir tokens de entrada.
- Validación de llamadas a funciones: antes de ejecutar una tool call, un paso de revisión con Piccolo comprueba si la herramienta y los argumentos encajan con la intención del usuario.
- Control de calidad en pipelines de agentes multi-paso: en cada paso se puntúan las acciones candidatas y se descartan las de baja probabilidad, reduciendo ejecuciones erróneas.
- Moderación de decisiones en producción: el scoring probabilístico permite fijar umbrales y derivar a revisión humana los casos con baja confianza.
- Despliegue local en estaciones de trabajo: con 2,7 GB en Q4_K_M, el modelo cabe en GPU de consumo y permite scoring de decisiones sin depender de APIs externas.
- Evaluación offline de agentes: usar las probabilidades como señal para comparar configuraciones de prompts o catálogos de herramientas sin coste de generación.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). El único dato cuantitativo disponible es la validación numérica de la cuantización: sobre 556 juicios sintéticos, la variación total media respecto a la referencia BF16 fue de 0,020741, con un p95 de 0,117999. Los resultados de evaluación del modelo base se enlazan en el repositorio GitHub del proyecto, pero no se recogen en la información proporcionada.

| Metrica | Valor |
|---|---|
| Juicios sinteticos evaluados | 556 |
| Variacion total media vs BF16 | 0,020741 |
| Variacion total p95 vs BF16 | 0,117999 |
| Benchmarks estandar (MMLU, HumanEval, GSM8K) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M (repositorio de 2,7 GB), más overhead del runtime y de las estructuras de candidatos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores son suficientes. Para mayor throughput, A100 o H100 no son necesarias dado el tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más de VRAM; también es viable en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: runtime Piccolo-compatible de llama.cpp (obligatorio para atención bidireccional y scoring nativo de candidatos, endpoint `/v1/systemone`). No se garantiza compatibilidad con llama.cpp estándar, vLLM, TGI u Ollama, ya que el modo de decisión requiere soporte específico.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la categoría de decision-models con atención bidireccional y scoring de candidatos. Como referencia de tamaño, se incluyen alternativas generativas de ~4B, aunque la comparación no es funcionalmente equivalente.

| Modelo | Parametros | Contexto | Funcion | Licencia | Formato |
|---|---|---|---|---|---|
| Piccolo-4B-Q4_K_M | 4,2B | no disponible | Decision / scoring de candidatos | Apache 2.0 | GGUF Q4_K_M |
| Qwen2.5-3B-Instruct | ~3B | 32K (tipico en la familia) | Generacion de texto | Apache 2.0 | safetensors, GGUF |
| Phi-3.5-mini-instruct | ~3,8B | 128K (tipico) | Generacion de texto | MIT | safetensors, GGUF |
| Llama-3.2-3B-Instruct | ~3,2B | 128K (tipico) | Generacion de texto | Llama 3.2 Community | safetensors, GGUF |

Nota: los datos de contexto y licencia de los modelos comparativos son orientativos de sus familias y deben verificarse en sus model cards; no se dispone de benchmarks comparativos directos con Piccolo-4B.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no produce texto libre; su uso requiere un runtime compatible con scoring de candidatos.
- Compatibilidad restringida: no funciona correctamente en llama.cpp estándar sin el soporte de atención bidireccional y el endpoint `/v1/systemone`.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada, lo que dificulta planificar su uso en prompts largos.
- La cuantización Q4_K_M introduce desviaciones respecto a BF16 (variación total media de 0,0207, p95 de 0,118), relevantes en decisiones con umbrales ajustados.
- No se documentan sesgos conocidos ni tasas de alucinación; al no generar texto, el riesgo de alucinación se traslada a la calibración de probabilidades.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros (THIRD_PARTY_LICENSES.md) del repositorio.
- Escaso historial de adopción (572 descargas, 0 likes) y fecha de creación reciente; conviene validar el modelo en el dominio propio antes de producción.
- El modelo base conserva tensores de visión, pero las capacidades multimodales de esta release GGUF no están documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-4B-Q4_K_M
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-4B
- Repositorio del proyecto: https://github.com/agentscope-ai/Piccolo
- Documentación del runtime QwenPaw: https://github.com/agentscope-ai/Piccolo/blob/main/docs/QWENPAW.md
- Evaluación: https://github.com/agentscope-ai/Piccolo/tree/main/evaluation
- Listado de modelos: https://github.com/agentscope-ai/Piccolo/blob/main/docs/MODELS.md
- ModelScope: https://www.modelscope.cn/models/AgentScope/Piccolo-4B-Q4_K_M
- Colección ModelScope QwenPaw Flash: https://www.modelscope.cn/collections/AgentScope/QwenPaw-Flash
- Decision Playground: https://decisionplayground.agentscope.io/
- Validación numérica: https://huggingface.co/agentscope-ai/Piccolo-4B-Q4_K_M/resolve/main/validation.json
- Licencia: https://huggingface.co/agentscope-ai/Piccolo-4B-Q4_K_M/resolve/main/LICENSE
- Avisos de terceros: https://huggingface.co/agentscope-ai/Piccolo-4B-Q4_K_M/resolve/main/THIRD_PARTY_LICENSES.md
