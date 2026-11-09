# min-h-wei/Kai

## Resumen

Kai es un modelo de decisión especializado en seguridad de agentes de IA, desarrollado por el usuario min-h-wei. No es un modelo generativo al uso: dado el contexto de un agente (política, conversación y acción propuesta), responde preguntas tipadas en un único forward pass sin generar texto. Concretamente, decide si una llamada a herramienta debe permitirse bajo unas reglas dadas (ToolCall) y si un contenido intenta inyectar instrucciones en el agente (XPIA, cross-prompt injection attack).

Se trata de la release candidate RC2, construida sobre el modelo base Qwen/Qwen3.5-4B-Base con un adaptador LoRA de rango 32 (mantenido sin fusionar) y una cabeza de decisión de tipo pointer. El modelo se sirve mediante el runtime AgentArmor MLX, que requiere Apple silicon y el pin exacto del modelo base. La licencia es Apache-2.0, igual que el modelo base.

La relevancia del modelo reside en su enfoque: en lugar de usar un LLM generativo para evaluar seguridad de agentes (con el coste de latencia y la variabilidad que ello implica), emplea una cabeza de clasificación que emite decisiones tipadas en un solo paso. El autor publica resultados de desarrollo sobre un benchset propio de 1.654 casos, aunque advierte explícitamente de que no constituyen una garantía de tasa de falsos positivos en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B-Base) + adaptador LoRA rango 32 + cabeza de decisión pointer |
| Parametros totales | 4B (modelo base) + adaptador LoRA rango 32 (no fusionado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, pointer.safetensors, evidence_head.safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (pin `1001bb4d`) y añade un adaptador LoRA de rango 32 que se mantiene sin fusionar con los pesos base. Sobre esa representación se monta una cabeza de decisión de tipo pointer que produce respuestas tipadas (ToolCall y XPIA) en un único forward pass, sin decodificación de texto. El paquete incluye además una cabeza de evidencia (`evidence_head.safetensors`) que está congelada, no entrenada y no se utiliza en esta release.

El entrenamiento utilizó 556 registros, incluyendo una excepción declarada que admitió 99 raíces ToolCall verificadas individualmente. No se especifican en la información disponible el número total de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La pregunta de enrutado "facts sufficient" y los spans de evidencia no están entrenados en esta release. El checkpoint publicado es el mejor de tres semillas entrenadas de forma idéntica, seleccionado sobre los mismos casos de evaluación.

## Capacidades

- Decisión de autorización de llamadas a herramientas (ToolCall): determina si una tool call propuesta debe permitirse bajo una política dada.
- Detección de inyección de prompts (XPIA): identifica si un contenido intenta inyectar instrucciones en el agente.
- Respuesta tipada en un único forward pass, sin generación de texto.
- Integración con el runtime AgentArmor MLX para servir el modelo.
- Verificación de integridad del paquete: el runtime comprueba cada fichero de `package/` contra `package/kai.json` antes de servir.
- Carga sin pickle: la cabeza pointer se distribuye en safetensors.
- No soporta (en esta release) la pregunta de enrutado "facts sufficient" ni la extracción de spans de evidencia.

## Casos de uso

- Guardrail de tool calling en agentes: antes de ejecutar una llamada a herramienta, el agente consulta a Kai con su política y la acción propuesta; el modelo devuelve una decisión permitir/denegar en un solo paso, lo que reduce la latencia frente a un LLM generativo.
- Detección de prompt injection en contenido externo: al ingerir correos, páginas web o documentos, el agente pasa el contenido a Kai para clasificar si contiene instrucciones inyectadas (XPIA) antes de incorporarlo al contexto.
- Autorización por políticas en pipelines de agentes multi-paso: cada paso del agente se valida contra reglas de negocio, permitiendo auditar qué acciones se autorizaron y cuáles no.
- Filtrado de entradas en asistentes con acceso a herramientas sensibles (correo, ficheros, APIs internas): Kai actúa como capa previa que bloquea acciones no contempladas por la política.
- Evaluación offline de políticas de agente: usar el modelo para puntuar conjuntos de casos y detectar reglas demasiado permisivas o demasiado restrictivas.
- Despliegue local en Apple silicon para entornos de desarrollo o prototipado de seguridad de agentes, gracias al runtime AgentArmor MLX y a la carga en safetensors.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el AgentArmor benchset (1.654 casos):

| Modelo | ToolCall AUC | ToolCall recall / FP a 0.5 | XPIA AUC | XPIA recall / FP a 0.5 |
|---|---:|---:|---:|---:|
| Kai-4B RC2 | 0.981 | 98.4% / 6.3% | 0.956 | 82.4% / 2.5% |
| Kev-4B | 0.858 | 84.4% / 23.4% | 0.675 | 16.9% / 6.4% |
| OpenAI Decisions | 0.925 | 95.3% / 25.0% | 0.915 | 74.0% / 5.9% |

Advertencias del propio autor: son resultados de desarrollo, no una garantía de falsos positivos en producción; el checkpoint es el mejor de tres semillas y las otras dos alcanzaron ToolCall AUC de 0.884 y 0.863, por lo que la ventaja en ToolCall no es todavía reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el modelo base es de 4B parámetros y el repo ocupa 2.0 GB.
- GPU recomendadas: no disponible. El runtime AgentArmor MLX requiere Apple silicon, por lo que el despliegue está orientado a equipos Mac con chip Apple, no a GPUs NVIDIA.
- Compatibilidad con GPU de consumo: no disponible; el runtime documentado exige Apple silicon.
- Opciones de despliegue: runtime AgentArmor MLX (`agentarmor-mlx --package kai-rc2/package --port 8009`), instalable vía `pip install "agentarmor-mlx @ git+https://github.com/min-mwei/AgentArmor#subdirectory=src/mlx"`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ToolCall AUC | XPIA AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kai-4B RC2 | 4B + LoRA r32 | no disponible | 0.981 | 0.956 | Apache-2.0 | Hugging Face (MLX) |
| Kev-4B | no disponible | no disponible | 0.858 | 0.675 | no disponible | no disponible |
| OpenAI Decisions | no disponible | no disponible | 0.925 | 0.915 | no disponible | no disponible |

Los dos comparables proceden de la tabla de resultados del propio autor; no se dispone de información adicional sobre su arquitectura, licencia o disponibilidad.

## Limitaciones y advertencias

- Los resultados son de desarrollo y no garantizan tasas de falsos positivos en producción.
- El checkpoint es el mejor de tres semillas entrenadas de forma idéntica; las otras dos alcanzaron ToolCall AUC de 0.884 y 0.863, por lo que la ventaja en ToolCall no es reproducible todavía.
- La pregunta de enrutado "facts sufficient" y los spans de evidencia no están entrenados en esta release.
- El entrenamiento usó solo 556 registros, con una excepción declarada que admitió 99 raíces ToolCall verificadas individualmente.
- Requiere Apple silicon y el pin exacto del modelo base `Qwen/Qwen3.5-4B-Base@1001bb4d`.
- El adaptador LoRA se mantiene sin fusionar, lo que condiciona el formato de carga y el runtime compatible.
- La cabeza de evidencia (`evidence_head.safetensors`) está congelada y sin entrenar; no debe usarse.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe.
- Licencia Apache-2.0, igual que el modelo base; no se detallan restricciones adicionales para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/min-h-wei/Kai
- Runtime AgentArmor MLX: https://github.com/min-mwei/AgentArmor/tree/main/src/mlx
- Benchset AgentArmor: https://github.com/min-mwei/AgentArmor/tree/main/benchset
- Repositorio AgentArmor: https://github.com/min-mwei/AgentArmor
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
