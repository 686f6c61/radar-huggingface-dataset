# shaban2024/Qwen3.5-9B-BOS-Q8-NonThinking

## Resumen

AgentMujo Q8 9B v2.0 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario shaban2024 bajo el identificador `shaban2024/Qwen3.5-9B-BOS-Q8-NonThinking`. El modelo está especializado en bosnio (código ISO `bs`) y orientado a function calling y flujos de agentes, con un sesgo explícito hacia el modo "non-thinking" (sin cadena de razonamiento explícita). Se distribuye exclusivamente en formato GGUF con cuantización Q8 y está pensado para despliegue en producción mediante llama.cpp y entornos compatibles con endpoints.

El modelo resuelve el problema de la selección fiable de herramientas y la generación de argumentos válidos en un agente conversacional en bosnio, un idioma con escasa representación en modelos ajustados para tool calling. Según la model card, el checkpoint de producción (`model-q8-joint08.gguf`) alcanza un 0,867 de tool selection y un 0,875 de strict en el bucle de agente, con seguridad 1,0 en ese mismo protocolo. El repositorio incluye además múltiples artefactos experimentales intermedios (gold01 a gold06, v0.1 a v0.6, dpo01) que el autor marca explícitamente como no aptos para despliegue.

La relevancia actual del modelo radica en su enfoque de entrenamiento por iteraciones SFT y DPO con métricas de puerta (gate) documentadas, y en su licencia Apache-2.0, que permite uso comercial. El tamaño es de 8.953.803.264 parámetros totales (aproximadamente 9B), con un vocabulario de 248.320 tokens, 32 capas y dimensión oculta de 4096, heredados del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8 (GGUF); el repositorio contiene unicamente ficheros Q8 |
| Idiomas soportados | Bosnio (`bs`); resto de idiomas no declarados |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (multiples ficheros: joint08, gold01-gold06, v0.1-v0.6, dpo01) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (revision `c20223623`), un transformer decoder-only con dimensión oculta de 4096, 32 capas y vocabulario de 248.320 tokens. Sobre esta base se aplicó un ajuste fino con LoRA de rango 16 (jt01-jt05) y posteriormente rango 64 (r6401-r6406) con una mezcla de datos denominada "mix v0.35", que según el autor alcanzó un techo de tool selection de 0,60 solo cuando se usaba una especificación de formato explícita. A partir de ahí se sucedieron iteraciones SFT "dialect-dense" (gold01 a gold05) y una etapa DPO (DPO-03) sobre gold04 para producir gold06.

El checkpoint de producción, joint08, se construyó como gold06 más un SFT adicional de seguridad de 1.850 filas con un 15% de demostraciones de seguridad. El autor documenta que las preferencias DPO (dpo14-16) degradaron la seguridad de 0,857 a 0,429 sin recuperación, mientras que las demostraciones SFT la devolvieron a 0,714 en el protocolo de puerta y a 1,0 en el bucle de agente con motor de políticas. No se especifica el número total de tokens de entrenamiento ni la composición completa del dataset más allá de estas referencias internas al framework AgentMujo.

## Capacidades

- Generación de texto conversacional en bosnio con formato de respuesta controlado.
- Function calling y tool selection: selección de herramienta con una precisión de 0,867 en el bucle de producción y 0,846 de precisión de argumentos en la puerta.
- Generación de JSON válido para invocación de herramientas (json_validity 1,0 en las métricas reportadas).
- Razonamiento multi-paso en agentes: multi_step 1,0 en el bucle de producción.
- Comportamiento de rechazo (refusal) y seguridad: refusal 1,0 y safety 1,0 en el bucle con motor de políticas.
- Modo non-thinking: el modelo está ajustado para responder sin cadena de razonamiento explícita; el perfil "think" no forma parte del release.
- Capacidad de no invocar herramienta cuando no procede (no_tool 1,0 en el bucle).
- Soporte de despliegue compatible con endpoints (`endpoints_compatible` en los tags del repositorio).
- No se declaran capacidades de visión, audio ni matemáticas avanzadas en la información disponible.

## Casos de uso

- Agente de atención al cliente en bosnio: el modelo puede gestionar conversaciones multi-turno, decidir cuándo invocar una herramienta (por ejemplo, consulta de pedido) y cuándo responder directamente, gracias a su métrica no_tool de 1,0 en el bucle de producción.
- Automatización de back-office con function calling: integración en pipelines que requieren generación de JSON válido para llamadas a APIs internas, con una precisión de argumentos de 0,846 en el protocolo de puerta.
- Asistente de agentes multi-paso: tareas que encadenan varias herramientas (multi_step 1,0) como reservas, consultas de estado y confirmaciones, adecuado por su comportamiento de confirmación y rechazo.
- Despliegue en local con llama.cpp u Ollama: al distribuirse en GGUF Q8, puede ejecutarse en estaciones de trabajo sin infraestructura GPU dedicada de gran escala, con un tamaño de repositorio de 95,3 GB que incluye todos los checkpoints.
- Moderación y filtrado con salvaguardas: su SFT de seguridad de 1.850 filas y la métrica safety 1,0 en bucle lo hacen apto para flujos donde se requiere rechazo explícito de peticiones no permitidas.
- Evaluación comparativa de agentes en lenguas eslavas del sur: sirve como referencia para medir tool calling en bosnio frente a modelos multilingües genéricos, dado que el autor publica el framework de benchmark y los resultados por checkpoint.
- Prototipado de asistentes dialectales: el entrenamiento "dialect-dense" y la métrica ijekavica de 1,0 lo orientan a variantes dialectales del bosnio, útil en productos regionales.

## Benchmarks y rendimiento

Resultados del AgentMujo-Bench (nonthink, 48 casos) según la model card. La columna "9B joint08" corresponde al checkpoint de producción v2.0; "9B gold06" es el backup v1.0.

| Metrica | AM 2B (r6 SFT) | AM 4B (4bdpo01) | AM 9B joint08 (v2.0) | AM 9B gold06 (v1.0) |
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

Métricas del bucle de agente (modelo + política + ejecutor) para joint08: tool 0,867, strict 0,875, task_success 0,979, safety 1,0, refusal 1,0, no_tool 1,0, multi 1,0. Para gold06 en el mismo bucle: tool 0,833, strict 0,75, task_success 0,979, safety/refusal 0,857. El autor advierte que el protocolo de puerta single-shot es pesimista para safety respecto al bucle puntuado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8: aproximadamente 9-10 GB solo para los pesos (8,95B parámetros a 8 bits), más overhead de contexto y caché KV; se recomienda reservar 12-16 GB de VRAM para contextos moderados.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para Q8 con contexto amplio; A100 40/80 GB o H100 para despliegues concurrentes y mayor throughput; RTX 3090 (24 GB) y RTX 4080 (16 GB) son viables para Q8 con contexto reducido.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080, 4090, 3090, 4060 Ti 16 GB); en tarjetas de 8-12 GB sería necesario reducir contexto o recurrir a cuantizaciones menores no incluidas en el repositorio.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; servidores compatibles con endpoints según el tag `endpoints_compatible`; vLLM y TGI no están confirmados para este artefacto GGUF en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool selection (bench propio) | Licencia | Formato |
|---|---|---|---|---|---|
| AgentMujo 9B joint08 (este) | ~9B | no disponible | 0,867 | Apache-2.0 | GGUF Q8 |
| AgentMujo 4B (4bdpo01) | ~4B | no disponible | 1,0 | Apache-2.0 (framework) | GGUF |
| AgentMujo 2B (r6 SFT) | ~2B | no disponible | 0,8 | Apache-2.0 (framework) | GGUF |
| Qwen3.5-9B (base) | ~9B | no disponible | no disponible | Apache-2.0 | safetensors |

La comparación se limita a los modelos del mismo framework AgentMujo, ya que no se dispone de resultados de modelos externos en la información proporcionada. Destaca que el modelo de 4B supera al de 9B en tool selection (1,0 frente a 0,867) y en confirmation_behavior (1,0 frente a 0,2), lo que sugiere que el tamaño no es el factor determinante en este benchmark concreto.

## Limitaciones y advertencias

- confirmation_behavior bajo en joint08 (0,2 en puerta, frente a 0,6 de gold06): el modelo puede omitir confirmaciones explícitas antes de ejecutar acciones.
- high_level_preference de 0,6 en el bucle: el autor reconoce que la rama joint09 lo eleva a 1,0 pero rompe la seguridad, por lo que no se recomienda para producción.
- El perfil "think" no forma parte del release; el modelo está ajustado exclusivamente para modo non-thinking.
- Sesgos dialectales: el entrenamiento "dialect-dense" y la métrica ijekavica están orientados a una variante concreta del bosnio; el comportamiento en otras variantes o en bosnio estándar no está documentado.
- Idiomas: solo se declara bosnio (`bs`); el rendimiento en castellano, inglés u otros idiomas no está evaluado en la información disponible.
- Riesgo de alucinación en argumentos de herramientas: aunque argument_accuracy es 0,846, un 15,4% de argumentos incorrectos en el protocolo de puerta implica necesidad de validación posterior en producción.
- Artefactos experimentales: el repositorio contiene 14 ficheros GGUF; el autor indica explícitamente que los checkpoints anteriores a joint08 no deben usarse para despliegue.
- Licencia Apache-2.0 permite uso comercial, pero la model card no incluye cláusulas adicionales de responsabilidad ni garantías sobre el comportamiento en dominios regulados.
- El repositorio ocupa 95,3 GB, lo que implica costes de almacenamiento y descarga considerables si se clonan todos los checkpoints.

## Enlaces

- Hugging Face: https://huggingface.co/shaban2024/Qwen3.5-9B-BOS-Q8-NonThinking
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de adaptadores: https://huggingface.co/shaban2024/agentmujo-adapters
- Framework de entrenamiento y benchmarks: https://github.com/xnet-ba/agentmujo-training
