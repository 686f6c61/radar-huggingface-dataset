# renatoschust/agentmujo-qwen3.5-9b-bos

## Resumen

AgentMujo Qwen3.5-9B BOS es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario renatoschust dentro de la línea de trabajo `agentmujo-training`. Su propósito es dotar al modelo base de capacidades de function calling y comportamiento agéntico (terminal agéntico) en idioma bosnio, manteniendo el resto de competencias del modelo original. Es un modelo derivado, no un entrenamiento desde cero, y se distribuye como pesos fusionados en bf16.

El ajuste se entrenó en el supercomputador LUMI-G sobre una GPU AMD MI250X con ROCm 7.2, lo que lo convierte en un caso de uso poco habitual de entrenamiento PEFT sobre hardware AMD. El entrenamiento fue corto (200 pasos de optimizador, aproximadamente 0,1 épocas sobre un subconjunto equilibrado de 32.660 filas), por lo que debe considerarse un experimento de validación de formato más que un modelo listo para producción.

La relevancia actual reside en dos aspectos: por un lado, demuestra que el dialecto XML de tool calling (`<tool_call><function=...>`) puede instalarse vía LoRA incluyendo `embed_tokens` en los targets, una hipótesis que en GPUs T4 fallaba por OOM y que en MI250X (64 GB por GCD) sí es viable; por otro, publica artefactos reproducibles (adaptador, pesos fusionados, dataset exacto y logs). El contexto, la arquitectura interna y los idiomas adicionales del modelo base no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B); ajuste LoRA sobre el modelo base |
| Parametros totales | 9.409.813.744 (~9,41 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el entrenamiento usó max_length 2048) |
| Tipos de cuantizacion | no disponible en este release; GGUF Q8_0 planificado como paso siguiente |
| Idiomas soportados | bs (bosnio); el resto de idiomas del modelo base no se detalla |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, 6 shards, ~18 GB); adaptador LoRA en repo separado (~2,56 GB con embed_tokens completo) |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA (r=64, alpha=128, dropout 0,05) sobre Qwen/Qwen3.5-9B en la revisión `c20223623576`. Los módulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` y, de forma destacable, `embed_tokens`. `lm_head` queda fuera de los targets porque TRL 1.x lo rechaza (el log-prob se calcula directamente a través de `lm_head.weight`) y `modules_to_save` está desactivado. La inclusión de `embed_tokens` responde a la hipótesis de que el formato de tool calling no se instala si la LoRA no toca los embeddings; en T4 el camino de embeddings provocaba OOM en tres intentos, mientras que en un GCD de MI250X con 64 GB de VRAM el entrenamiento cabe.

El dataset es `shaban2024/agentmujo-joint-01`, split `joint_v0.43`, un subconjunto equilibrado de 32.660 filas que incluye todos los ejemplos de function calling, agentic, verificación y seguridad, y un número limitado de ejemplos de bosnian-core, knowledge, RAG y coding. El entrenamiento consistió en 200 pasos de optimizador con batch efectivo 16, learning rate 1e-4 con scheduler cosine, precisión bf16, gradient checkpointing y max_length 2048. Duró 4.878 segundos (~81 minutos) en 1 GCD MI250X con un pico de VRAM de 22,33 GB. La pérdida final de entrenamiento fue 1,011 (último log 0,783), la de evaluación 1,290 y la precisión por token en evaluación 0,734. No se aplicó RLHF ni DPO en esta versión; el DPO se plantea como paso posterior.

## Capacidades

- Generación de texto en bosnio y function calling con el dialecto XML canónico `<tool_call><function=...>` definido en `configs/tools.yaml`.
- Comportamiento agéntico orientado a terminal: el format probe generó llamadas correctas a herramientas como `service_status`, `disk_usage`, `process_list`, `network_status`, `port_check` y `package_install`.
- Verificación y seguridad: el dataset de entrenamiento incluye ejemplos de verification y safety, aunque no se publican métricas específicas de estas categorías.
- Capacidades heredadas del modelo base Qwen3.5-9B (razonamiento, código, conocimiento general): no se documentan explícitamente en la model card.
- Soporte multilingüe: limitado a bosnio según el campo `language`; el resto de idiomas del base no se detalla.
- No se documentan capacidades de visión, audio, thinking mode ni decodificación especulativa en la información disponible.

## Casos de uso

- Automatización de operaciones en terminal: el modelo traduce instrucciones en bosnio a llamadas de herramienta estructuradas (`service_status`, `disk_usage`, `process_list`), lo que permite construir asistentes de administración de sistemas que ejecutan comandos a partir de lenguaje natural en ese idioma.
- Asistente de soporte técnico en bosnio: con el formato XML de tool calling estable en las pruebas, puede integrarse en un orquestador que consulte estado de red (`network_status`) o puertos (`port_check`) y devuelva respuestas al usuario.
- Gestión de paquetes en pipelines de aprovisionamiento: la llamada `package_install` generada correctamente sugiere uso en flujos de instalación automatizada controlados por un agente.
- Investigación en PEFT sobre AMD: el modelo y sus logs (repo `agentmujo-qwen3.5-9b-lumi-data`) sirven como referencia reproducible para entrenar LoRA con `embed_tokens` en MI250X y ROCm 7.2.
- Base para ajustes posteriores: al ser un adaptador LoRA con pérdida aún descendente, es un punto de partida para runs más largos (600-1.500 pasos) o para DPO sobre el mismo dataset.
- Evaluación de formato de tool calling: útil como caso de estudio de si el formato se instala sin tocar `lm_head`, comparando el comportamiento con y sin `embed_tokens` en los targets.
- Prototipado de agentes multilingües de bajo presupuesto: al requerir solo ~22 GB de VRAM en entrenamiento y caber en bf16 en GPUs de 24 GB para inferencia, permite experimentar sin infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único resultado reportado es un format probe cualitativo: 5 de 5 prompts de validación produjeron llamadas canónicas `<tool_call><function=...>` correctas. No se ejecutó el gate completo AgentMujo-Bench (48 casos).

| Métrica | Valor reportado |
|---|---|
| Format probe (5 prompts) | 5/5 llamadas canónicas correctas |
| Pérdida de entrenamiento (final) | 1,011 (último log 0,783) |
| Pérdida de evaluación | 1,290 |
| Precisión por token en evaluación | 0,734 |
| AgentMujo-Bench (48 casos) | no ejecutado |

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 18-19 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda GPU con 24 GB o más.
- Entrenamiento LoRA: pico de 22,33 GB de VRAM en un GCD MI250X de 64 GB; en GPUs con menos de 24 GB el camino de `embed_tokens` provocó OOM en T4 según la model card.
- GPUs recomendadas: AMD MI250X (ROCm 7.2) para entrenamiento; para inferencia, cualquier GPU con al menos 24 GB (RTX 4090, A100 40/80 GB, H100) en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090) en bf16; en cuantizaciones menores no se distribuye GGUF en este release.
- Opciones de despliegue: `transformers` + `peft` según el snippet de la model card; vLLM, llama.cpp, Ollama y TGI no se mencionan explícitamente. La conversión a GGUF Q8_0 (`convert_hf_to_gguf.py --no-mtp` + `llama-quantize Q8_0`) está planificada pero no incluida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| AgentMujo Qwen3.5-9B BOS | 9,41 B | no disponible | bs | Apache-2.0 | LoRA de 200 pasos, formato de tool calling validado en 5 prompts |
| Qwen/Qwen3.5-9B (base) | 9 B (según nombre) | no disponible | no disponible | Apache-2.0 | Modelo base sin ajuste específico de tool calling en bosnio |
| Alternativas de tool calling en lenguas eslavas del sur | no disponible | no disponible | no disponible | no disponible | No se han identificado modelos comparables en la información proporcionada |

La comparación cuantitativa con otros modelos de la misma categoría no está disponible, ya que no se publican benchmarks del modelo ni de alternativas en la información consultada.

## Limitaciones y advertencias

- Entrenamiento muy corto: 200 pasos equivalen a ~0,1 épocas sobre 32.660 muestras; la pérdida sigue descendiendo y el modelo no está convergido.
- Validación limitada: el format probe cubre solo 5 prompts; no se ha ejecutado el AgentMujo-Bench de 48 casos, por lo que la robustez del formato en producción es desconocida.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasa de alucinación; al ser un ajuste de formato, el comportamiento en dominios abiertos depende del modelo base.
- Sesgos: no se documentan análisis de sesgo; el dataset es un subconjunto equilibrado de una sola fuente, lo que puede introducir sesgos de dominio y de idioma.
- Cobertura de idioma: el campo `language` solo declara bosnio; el rendimiento en otros idiomas no está verificado.
- Licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.5-9B, que deben revisarse por separado.
- Despliegue: no se distribuye GGUF en este release, lo que limita el uso en entornos de CPU o GPU de baja VRAM; la conversión está pendiente.
- Reproducibilidad: los artefactos (adaptador, dataset, logs) están publicados, pero el modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/renatoschust/agentmujo-qwen3.5-9b-bos
- Adaptador LoRA: https://huggingface.co/renatoschust/agentmujo-qwen3.5-9b-bos-lora
- Datos de entrenamiento y logs: https://huggingface.co/renatoschust/agentmujo-qwen3.5-9b-lumi-data
- Format probe: https://huggingface.co/renatoschust/agentmujo-qwen3.5-9b-bos-lora/blob/main/format_probe.json
- Repositorio de entrenamiento: https://github.com/xnet-ba/agentmujo-training
- Dataset: https://huggingface.co/datasets/shaban2024/agentmujo-joint-01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
