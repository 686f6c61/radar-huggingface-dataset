# Minbyul/AgentMercury-Qwen3.5-35B-A3B

## Resumen

AgentMercury-Qwen3.5-35B-A3B es un checkpoint del modelo multimodal Qwen/Qwen3.5-35B-A3B, post-entrenado mediante aprendizaje por refuerzo agéntico (on-policy GRPO) sobre entornos de tool-use basados en el Model Context Protocol (MCP). El modelo está desarrollado por Minbyul y forma parte de la familia AgentMercury, de la que también existe una variante más pequeña con 4 mil millones de parámetros. Su objetivo es mejorar la capacidad de los modelos para completar tareas agénticas multi-turno reales, recompensando no solo la generación de texto correcto, sino también el estado final del entorno tras las llamadas a herramientas.

La arquitectura base es un MoE multimodal de 35 mil millones de parámetros totales con aproximadamente 3 mil millones activos por token, 256 expertos (8 enrutados y 1 compartido) y 40 capas de atención híbrida Gated DeltaNet. El contexto nativo es de 262.144 tokens, aunque el autor recomienda servirlo con al menos 128.000 para evitar truncamientos en el bloque de razonamiento. El checkpoint publicado corresponde al rollout 99 de un entrenamiento de 200 iteraciones, y no se incluyen resultados de benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE multimodal, híbrido Gated DeltaNet / gated attention) |
| Parametros totales | 34.660.610.688 (35B) |
| Parametros activos | ~3B por token (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativo; 131.072 recomendado en despliegue |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-35B-A3B, una arquitectura de Mixture-of-Experts multimodal que procesa texto e imágenes. La capa de atención combina Gated DeltaNet con atención gated en 40 capas, y el enrutamiento de expertos utiliza 256 expertos, de los cuales 8 son enrutados por token y 1 compartido. El post-entrenamiento se realizó con GRPO (Group Relative Policy Optimization) on-policy, en una configuración totalmente asíncrona con nodos dedicados para el entrenamiento y para el rollout con sglang (2 nodos × 8 GPUs).

La señal de recompensa se basa en verificadores de estado final del entorno sobre tareas agénticas reales: se comprueba la corrección de las llamadas a herramientas y el estado final de la base de datos o entorno, con penalizaciones por degeneración o truncamiento. El dataset de entrenamiento contiene 38.670 tareas de tipo create/update/delete extraídas de 3.950 entornos MCP sintéticos. El rollout se ejecuta con un batch global de 128 (16 prompts × 8 muestras), permitiendo hasta 20 turnos de tool-use y 24.576 tokens de respuesta por trayectoria, con una tasa de aprendizaje constante de 1e-6.

## Capacidades

- Generación de texto y razonamiento multi-step: el modelo piensa antes de responder, como su base Qwen3.5.
- Tool calling y function calling: soporta el parser de tool-calls `qwen3_coder` y se sirve con la API compatible OpenAI.
- Uso de agentes con MCP: entrenado específicamente para ejecutar tareas agénticas sobre entornos Model Context Protocol.
- Multimodal: acepta entrada de texto e imagen (image-text-to-text).
- Conversación multi-turno con contexto largo: hasta 262.144 tokens nativos.
- Ejecución de operaciones de escritura sobre bases de datos: el entrenamiento se centró en tareas create/update/delete.

## Casos de uso

- Automatización de operaciones de base de datos: el modelo puede ejecutar tareas de creación, actualización y borrado de registros a través de herramientas MCP, verificando el estado final de la base de datos.
- Agentes de atención al cliente con herramientas: puede gestionar conversaciones multi-turno donde necesita consultar o modificar datos de clientes mediante tool calls, con contexto largo para mantener el hilo.
- Asistentes de desarrollo que ejecutan código: integrable en pipelines de CI/CD donde debe llamar a funciones de testing o despliegue y razonar sobre los resultados.
- Agentes de investigación con acceso a APIs: puede usar herramientas MCP para consultar fuentes externas, razonar sobre la respuesta y ejecutar acciones de escritura en sistemas de gestión.
- Automatización de flujos de trabajo empresariales: útil para tareas que requieren múltiples pasos con herramientas intermedias, como actualizar registros, enviar notificaciones y verificar cambios.
- Prototipado de agentes con razonamiento multimodal: su capacidad de entrada de imagen permite procesar capturas de pantalla o documentos y actuar en consecuencia con herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el checkpoint corresponde al rollout 99 de un entrenamiento de 200 iteraciones y que los resultados de evaluación no están incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 69-70 GB para los pesos completos, más overhead de KV cache y activaciones.
- GPU recomendadas: A100 80GB, H100 80GB, o 2× RTX 4090 (24 GB cada una) con tensor parallelism para el modelo completo.
- En consumer GPU: es posible con cuantización a 4 bits (~20-25 GB de VRAM), aunque no se han publicado guías oficiales ni archivos GGUF para este checkpoint.
- Opciones de despliegue: sglang es el servidor recomendado por el autor (con flags específicos de contexto y MoE), también compatible con transformers (AutoModelForCausalLM) y potencialmente con vLLM y Ollama, aunque no hay documentación específica.
- Latencia y throughput: no disponible; al ser MoE con 3B activos, se espera una latencia menor que un modelo denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| AgentMercury-Qwen3.5-35B-A3B | 34.66B | ~3B | 262K | Apache-2.0 | RL agéntico sobre MCP, sin benchmarks publicados |
| Qwen/Qwen3.5-35B-A3B | ~35B | ~3B | 262K | Apache-2.0 | Modelo base sin post-entrenamiento agéntico |
| AgentMercury-Qwen3.5-4B | ~4B | no disponible | no disponible | Apache-2.0 | Hermano pequeño de la misma familia |
| Qwen3.5-397B-A17B | 397B | ~17B | no disponible | no disponible | Modelo insignia de Qwen3.5, nativo vision-language |

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en tareas generales o agénticas no está validado externamente.
- El entrenamiento se centró en tareas de tipo create/update/delete sobre entornos MCP sintéticos; puede no generalizar a otros dominios de tool-use.
- El checkpoint es el rollout 99 de un run de 200, no un checkpoint final de convergencia; el autor no indica que sea el mejor.
- Requiere servir con al menos 128K de contexto; si se sirve con ventanas más cortas, el razonamiento se trunca y las respuestas pueden quedar vacías, degradando silenciosamente cualquier evaluación.
- Idioma limitado al inglés; no se ha entrenado para otros idiomas.
- Es un modelo multimodal, pero el post-entrenamiento RL se centró en tareas textuales sobre MCP; el rendimiento en tareas visuales puede ser similar al del base, no mejorado.
- El repositorio tiene 0 descargas y solo 1 like, por lo que no hay validación comunitaria ni soporte garantizado.
- No se proporcionan guías de cuantización, y el uso de pesos en bfloat16 con transformers requiere `trust_remote_code=True`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minbyul/AgentMercury-Qwen3.5-35B-A3B
- Modelo hermano AgentMercury-Qwen3.5-4B: https://huggingface.co/Minbyul/AgentMercury-Qwen3.5-4B
- Blog de Qwen3.5 (Alibaba Cloud): https://qwen.ai/blog?id=qwen3.5
- Ficha de Qwen3.5 35B-A3B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-35b-a3b/
- Página de Qwen3.5:35b-a3b en Ollama: https://ollama.com/library/qwen3.5:35b-a3b
