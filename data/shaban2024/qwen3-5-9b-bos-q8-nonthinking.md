# shaban2024/Qwen3.5-9B-BOS-Q8-NonThinking

## Resumen

AgentMujo Q8 9B v2.0 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario shaban2024 bajo el identificador `shaban2024/Qwen3.5-9B-BOS-Q8-NonThinking`. El modelo está especializado en bosnio (código ISO `bs`) y orientado a function calling, agentes de IA y generación de texto conversacional. El autor lo distribuye en formato GGUF con cuantización Q8, lo que permite su despliegue en entornos de inferencia local con llama.cpp y herramientas compatibles.

El problema que resuelve es la falta de modelos de 9B mil millones de parámetros con un rendimiento fiable en tool calling y comportamiento de agente en bosnio, un idioma con escasa representación en los ajustes finos habituales. El autor documenta un proceso iterativo de SFT y DPO sobre el modelo base, con múltiples versiones (gold01 a gold08, joint08) evaluadas mediante un benchmark propio denominado AgentMujo-Bench, que mide selección de herramienta, precisión de argumentos, seguridad, multi-step reasoning y validez JSON.

La relevancia actual radica en que el modelo declara métricas de tool selection de 0,867 en modo single-shot y 0,912 en bucle de agente con policy engine, con seguridad 1.0 en el bucle de producción. El modelo base Qwen3.5-9B tiene 8.953.803.264 parámetros, hidden size 4096, 32 capas y vocabulario de 248.320 tokens. La licencia es Apache-2.0 tanto para la base como para el framework de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B); sin datos adicionales sobre atención o capas específicas |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8 (GGUF); el repositorio distribuye únicamente archivos Q8 |
| Idiomas soportados | Bosnio (`bs`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-9B en la revisión `c20223623`, con hidden size 4096, 32 capas y vocabulario de 248.320 tokens. El autor no detalla la arquitectura interna del base más allá de estos datos; se trata de un transformer decoder-only convencional según la información disponible. El ajuste fino se realizó mediante LoRA con rangos variables: r16 en las iteraciones jt01–jt05 y r64 en las iteraciones r6401–r6406 y posteriores. Los adaptadores se publican en el repositorio `shaban2024/agentmujo-adapters`.

El entrenamiento siguió una cadena iterativa documentada: mezcla v0.35 con techo de tool selection de 0,60 solo con prompt específico, luego gold01 (r64 dialect-dense, gate 0,60/0,654), gold02 (r64 + ask-first, gate 0,633/0,731), gold03 (regresión por listing-bias, gate 0,50/0,50), gold04 (r64 anti listing-bias, gate 0,70/0,885), gold05 (gate 0,667, cierre de iteración SFT), gold06 (gold04 + DPO-03, gate 0,70, notool de 0,25 a 0,50) y finalmente joint08 (gold06 + safety-SFT con 1.850 filas, 15% demos de seguridad). El autor documenta que los experimentos DPO posteriores (dpo14-16) degradaron la seguridad de 0,857 a 0,429 sin recuperación, y que joint08 recuperó la seguridad mediante demostraciones SFT. No se especifica el número total de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Generación de texto conversacional en bosnio con soporte de formato de chat.
- Function calling y tool calling: selección de herramienta, generación de argumentos y validez JSON (métrica json_validity de 1,0 en el benchmark del autor).
- Comportamiento de agente multi-step: el benchmark reporta multi_step de 1,0 en el modelo joint08.
- Comportamiento de confirmación y rechazo (refusal): métricas documentadas de 0,6 en single-shot y 1,0 en bucle de agente.
- Modo non-thinking: el modelo está publicado explícitamente como variante NonThinking, sin cadena de pensamiento explícita.
- Seguridad en tool calling: safety de 0,714 en single-shot y 1,0 en bucle de agente con policy engine.
- Manejo de dialecto ijekavica: métrica de 1,0 en el benchmark del autor.
- No se documentan capacidades de visión, audio ni matemáticas avanzadas.

## Casos de uso

- Agentes de atención al cliente en bosnio: el modelo puede gestionar conversaciones multi-turno con tool calling para consultar pedidos, modificar reservas o escalar incidencias, gracias a su entrenamiento específico en selección de herramienta y argumentos con métricas de 0,867 y 0,846 respectivamente.
- Automatización de flujos con function calling: integración en pipelines que requieren invocación de APIs externas con argumentos estructurados en JSON, aprovechando la validez JSON de 1,0 reportada.
- Asistentes de back-office con confirmación de acciones: el modelo incorpora comportamiento de confirmación (conf 0,8 en bucle) y rechazo (refusal 1,0 en bucle), adecuado para operaciones que requieren validación antes de ejecutar.
- Agentes multi-paso para tareas administrativas: con multi_step de 1,0 en el benchmark del autor, puede encadenar varias llamadas a herramientas para completar tareas como gestión de documentos o consultas combinadas.
- Despliegue local en entornos con requisitos de privacidad: al distribuirse en GGUF Q8, puede ejecutarse con llama.cpp en infraestructura propia sin depender de APIs externas, manteniendo los datos en el perímetro.
- Prototipado de agentes en bosnio para investigación: el repositorio incluye el framework de entrenamiento y los resultados de benchmark en GitHub, lo que permite reproducir y extender las evaluaciones.
- Filtrado y clasificación de intenciones con rechazo seguro: la métrica de safety 1,0 en bucle de agente con policy engine lo hace adecuado para tareas donde el modelo debe abstenerse de ejecutar acciones no permitidas.

## Benchmarks y rendimiento

Los datos provienen del AgentMujo-Bench del autor (48 casos en single-shot, 63 casos en bucle de producción para joint08). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | AM 9B joint08 v2.0 (single-shot) | AM 9B joint08 v2.0 (bucle) | AM 9B gold06 v1.0 (single-shot) | AM 9B gold06 v1.0 (bucle) |
|---|---|---|---|---|
| tool_selection | 0,867 | 0,912 | 0,70 | 0,833 |
| argument_accuracy | 0,846 | 1,0 | 0,846 | no disponible |
| confirmation_behavior | 0,2 | 0,8 | 0,6 | 0,8 |
| high_level_preference | 0,6 | 0,889 | 0,8 | 0,8 |
| no_tool | 1,0 | no disponible | 0,50 | 0,0 |
| refusal | 0,6 | 1,0 | 0,8 | 0,857 |
| multi_step | 1,0 | 1,0 | 0,75 | 1,0 |
| safety | 0,714 | 1,0 | 0,857 | 0,857 |
| ijekavica | 1,0 | no disponible | 1,0 | no disponible |
| json_validity | 1,0 | no disponible | 1,0 | no disponible |
| strict | 0,873 | 0,875 | no disponible | 0,75 |
| task_success | no disponible | 0,952 | no disponible | 0,979 |

Comparativa interna del autor entre tamaños (single-shot, 48 casos):

| Metrica | AM 2B (r6 SFT) | AM 4B (4bdpo01) | AM 9B (joint08 v2.0) | AM 9B (gold06 v1.0) |
|---|---|---|---|---|
| tool_selection | 0,8 | 1,0 | 0,867 | 0,667 |
| argument_accuracy | 0,846 | 0,962 | 0,846 | 0,692 |
| confirmation_behavior | 0,4 | 1,0 | 0,2 | 0,6 |
| high_level_preference | 1,0 | 1,0 | 0,6 | 0,8 |
| no_tool | 0,5 | 1,0 | 1,0 | 0,25 |
| refusal | 1,0 | 1,0 | 0,6 | 0,8 |
| multi_step | 0,8 | 1,0 | 1,0 | 0,75 |
| safety | 1,0 | 1,0 | 0,714 | 0,857 |
| ijekavica | 1,0 | 1,0 | 1,0 | 1,0 |
| json_validity | 1,0 | 1,0 | 1,0 | 1,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.953.803.264 parámetros en Q8, el peso de los pesos ronda los 9 GB; se recomienda al menos 12 GB de VRAM para dejar margen a contexto y overhead de runtime.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB). El modelo cabe en GPUs de consumo con 12 GB o más en Q8.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070 12 GB, RTX 4080 16 GB, RTX 4090 24 GB, siempre que se ajuste el contexto a la VRAM disponible.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, y servidores compatibles con endpoints GGUF. El repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| AgentMujo Q8 9B v2.0 (este) | 8.953.803.264 | no disponible | tool 0,867 single-shot / 0,912 bucle | Apache-2.0 | GGUF Q8 |
| Qwen/Qwen3.5-9B (base) | 8.953.803.264 | no disponible | no disponible | Apache-2.0 | safetensors |
| AM 4B (4bdpo01) | no disponible | no disponible | tool 1,0 single-shot | no disponible | no disponible |
| AM 2B (r6 SFT) | no disponible | no disponible | tool 0,8 single-shot | no disponible | no disponible |

La comparativa se limita a los modelos documentados por el propio autor en el repositorio. No se dispone de datos de benchmarks estándar que permitan comparar con alternativas externas de la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en bosnio (`bs`); su rendimiento en castellano u otros idiomas no está documentado y previsiblemente será inferior.
- El autor reconoce que la métrica de confirmación (conf 0,8) es inferior a la del modelo 2B r6 (0,9), lo que indica un comportamiento de confirmación menos fiable que alternativas más pequeñas.
- El perfil "think" no forma parte del release; el modelo es NonThinking y no soporta cadena de pensamiento explícita.
- El autor documenta que los experimentos DPO posteriores a joint08 (joint09-15) fueron rechazados por no mantener la precisión de tool calling, lo que sugiere sensibilidad del ajuste a cambios en el entrenamiento.
- El benchmark utilizado es propio del autor (AgentMujo-Bench), con 48 casos en single-shot y 63 en bucle; no hay validación externa ni resultados en benchmarks estándar como MMLU o HumanEval.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo es un ajuste fino de 9B y mantiene los riesgos inherentes del base.
- Sesgos conocidos: no documentados en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-9B también es Apache-2.0 según el autor; conviene verificar los términos del base en su repositorio original.
- El repositorio incluye múltiples artefactos experimentales (gold01 a gold08, v0.1 a v0.6, dpo01) que el autor marca explícitamente como no aptos para despliegue; solo joint08 (v2.0) y gold06 (v1.0 backup) están recomendados para producción.
- El tamaño del repositorio es de 95,3 GB, lo que implica una descarga considerable si se quieren todos los archivos; para producción basta con el GGUF correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shaban2024/Qwen3.5-9B-BOS-Q8-NonThinking
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de adaptadores: https://huggingface.co/shaban2024/agentmujo-adapters
- Framework de entrenamiento: https://github.com/xnet-ba/agentmujo-training
