# renatoschust/agentmujo-qwen3.5-9b-bos-lora

## Resumen

AgentMujo Qwen3.5-9B BOS LoRA es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario renatoschust dentro de la línea de trabajo `agentmujo-training`. Su objetivo es dotar al modelo base de capacidades de *function calling* y comportamiento agéntico (terminal agéntico) en bosnio (código ISO `bs`), un idioma con muy poca cobertura en modelos de instrucciones generalistas. El adaptador se ha entrenado en el supercomputador LUMI-G sobre aceleradores AMD MI250X con ROCm 7.2, lo que lo convierte en un caso poco habitual de ajuste fino de un modelo de 9B en hardware AMD de centro de datos.

El modelo base Qwen3.5-9B aporta la arquitectura y el conocimiento general; este adaptador añade el dialecto XML concreto de llamadas a herramientas definido en `configs/tools.yaml` y el estilo de razonamiento agéntico en bosnio. El entrenamiento fue deliberadamente corto (200 pasos de optimizador, aproximadamente 0,1 épocas sobre 32.660 muestras), por lo que debe considerarse un experimento de validación de hipótesis más que un modelo listo para producción.

La relevancia actual reside en dos frentes: por un lado, demuestra que es viable instalar el formato de *tool calling* en un modelo de 9B incluyendo `embed_tokens` en los objetivos LoRA (una hipótesis que fallaba por OOM en GPUs T4 de 16 GB y que aquí pasa en un GCD de 64 GB); por otro, publica el adaptador, los datos exactos, las métricas y los logs de Slurm, lo que facilita la reproducibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-9B) con adaptador LoRA; clase de carga `AutoModelForImageTextToText` |
| Parámetros totales | 9B (modelo base); el adaptador LoRA ocupa ~2,56 GB en disco (incluye `embed_tokens` completo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó `max_length` 2048) |
| Tipos de cuantización | no disponible en este release; el autor indica GGUF Q8_0 como paso siguiente (aún no publicado) |
| Idiomas soportados | bosnio (`bs`); el modelo base Qwen3.5-9B soporta multilingüe general, pero el adaptador está especializado en bosnio |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); existe un repo separado con pesos fusionados en bf16 (~18 GB, 6 shards) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer decoder-only de 9.000 millones de parámetros. La configuración LoRA es r=64, alpha=128, dropout 0,05, con módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` y, de forma destacable, `embed_tokens`. La inclusión de `embed_tokens` en los objetivos es la hipótesis central del experimento: el autor parte de la idea de que el formato de llamada a herramientas no se instala correctamente si la LoRA no toca los embeddings. `lm_head` queda excluido (TRL 1.x lo rechaza porque el log-probabilidad pasa directamente por `lm_head.weight`) y `modules_to_save` está desactivado.

El entrenamiento se realizó sobre el subconjunto balanceado `data/splits/joint_v0.43` del dataset `shaban2024/agentmujo-joint-01`, con 32.660 filas que cubren function calling, comportamiento agéntico, verificación y seguridad, además de subconjuntos limitados de bosnian-core, knowledge, RAG y coding. Se ejecutaron 200 pasos de optimizador con batch efectivo 16, learning rate 1e-4 con schedule cosine, precisión bf16, gradient checkpointing y longitud máxima 2048. El run duró 4.878 segundos (~81 minutos) en 1 GCD de MI250X, con un pico de VRAM de 22,33 GB. La pérdida final de entrenamiento fue 1,011 (último log 0,783), la pérdida de evaluación 1,290 y la precisión por token en evaluación 0,734. No se aplicó RLHF ni DPO en esta fase; el autor lo plantea como siguiente paso.

## Capacidades

- Generación de llamadas a herramientas en formato XML canónico `<tool_call><function=...>` definido en `configs/tools.yaml`, con nombres de función como `service_status`, `disk_usage`, `process_list`, `network_status`, `port_check` y `package_install`.
- Comportamiento agéntico orientado a terminal: el modelo está entrenado para encadenar pasos de inspección de sistema y ejecución de comandos.
- Razonamiento y verificación: el subconjunto de entrenamiento incluye datos de *verification* y *safety*.
- Capacidades de conocimiento, RAG y programación en bosnio, aunque con subconjuntos limitados (capados) en el dataset.
- Soporte multilingüe heredado del modelo base Qwen3.5-9B, si bien el adaptador está especializado en bosnio.
- Capacidad de entrada multimodal heredada del base (la clase de carga es `AutoModelForImageTextToText`), no validada específicamente en este adaptador.
- No se documenta soporte explícito de *thinking mode*, audio ni otras capacidades especiales en la información disponible.

## Casos de uso

- Automatización de operaciones en terminal: el adaptador genera llamadas estructuradas a funciones de inspección (`disk_usage`, `process_list`, `network_status`) que un orquestador puede ejecutar y devolver al modelo, permitiendo bucles agénticos de diagnóstico en bosnio.
- Asistentes de soporte técnico en bosnio: el modelo puede interpretar peticiones del usuario y traducirlas a llamadas a herramientas de sistema con el dialecto XML esperado por el backend.
- Integración en pipelines de agentes con *function calling*: al emitir XML canónico consistente, encaja en frameworks que parsean `<tool_call>` para despachar acciones, reduciendo la necesidad de post-procesado.
- Instalación y gestión de paquetes asistida: la función `package_install` sugiere que el modelo puede formar parte de flujos de aprovisionamiento donde el usuario pide en lenguaje natural y el sistema ejecuta.
- Investigación sobre ajuste fino multilingüe de bajo recurso: sirve como caso de estudio reproducible (datos, logs, métricas publicados) para estudiar cómo se instala un formato estructurado en un idioma con pocos recursos.
- Experimentación con hardware AMD: el run documentado en MI250X con ROCm 7.2 es una referencia práctica para equipos que quieran reproducir ajustes LoRA de 9B en aceleradores AMD.
- Base para un modelo mayor: el adaptador puede servir como punto de partida para runs más largos (600-1.500 pasos) o para un posterior DPO, según indica el propio autor.

## Benchmarks y rendimiento

| Prueba | Resultado | Contexto |
|---|---|---|
| Format probe (5 prompts de `joint_v0.43/valid`) | 5/5 llamadas canónicas `<tool_call><function=...>` | Con `benchmark/system_spec_bs.txt` como system prompt |
| Pérdida de entrenamiento (último log) | 0,783 | 200 pasos, batch efectivo 16 |
| Pérdida de evaluación | 1,290 | Conjunto de validación |
| Precisión por token en evaluación | 0,734 | Conjunto de validación |
| AgentMujo-Bench gate (48 casos) | no ejecutado | El autor lo señala como pendiente |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el adaptador en bf16 requiere cargar el modelo base de 9B (~18 GB en bf16) más el adaptador (~2,56 GB con `embed_tokens` completo); en la práctica, se necesita al menos ~22-24 GB de VRAM para bf16 sin cuantizar.
- Durante el entrenamiento, el pico documentado fue de 22,33 GB en un GCD de MI250X de 64 GB con gradient checkpointing y batch efectivo 16.
- GPU recomendadas: AMD MI250X (usada en el entrenamiento), así como A100 40/80 GB, H100 o RTX 4090 (24 GB, justa para bf16 con cuidado de memoria).
- En GPUs de consumo: cabe en RTX 4090 de 24 GB en bf16 si se gestiona bien la memoria; en T4 de 16 GB el autor documenta fallos por OOM al incluir `embed_tokens` en los objetivos LoRA durante el entrenamiento, aunque para inferencia cuantizada podría ser viable (no verificado).
- Opciones de despliegue: transformers + PEFT (documentado en la model card); vLLM, llama.cpp, Ollama y TGI no están verificados en este release. El autor prevé publicar GGUF Q8_0 con `convert_hf_to_gguf.py --no-mtp` y `llama-quantize Q8_0`, lo que habilitaría llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgentMujo Qwen3.5-9B BOS LoRA | 9B + LoRA | no disponible | Function calling agéntico en bosnio | Apache-2.0 | Hugging Face (adaptador PEFT) |
| Qwen3.5-9B (base) | 9B | no disponible | Modelo generalista multilingüe | Apache-2.0 | Hugging Face |
| Alternativas específicas para bosnio | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. La comparación más directa es con el propio Qwen3.5-9B base, del que este adaptador hereda arquitectura y conocimiento general y al que añade el dialecto de *tool calling* en bosnio.

## Limitaciones y advertencias

- Entrenamiento muy corto: 200 pasos equivalen a ~0,1 épocas sobre 32.660 muestras; la pérdida seguía descendiendo, por lo que el adaptador está infraentrenado para uso en producción.
- El *format probe* de 5/5 es una validación mínima; no se ha ejecutado el gate completo de AgentMujo-Bench (48 casos), por lo que la estabilidad del formato en producción no está demostrada.
- No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), lo que impide comparar su calidad general con otros modelos.
- Especialización estrecha: el adaptador está orientado a bosnio y a un conjunto concreto de funciones de terminal; su comportamiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación inherente a los modelos de 9B, agravado por el infraentrenamiento y por la posible generación de llamadas a funciones no definidas en `configs/tools.yaml`.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-9B también es Apache-2.0; conviene verificar los términos del dataset `shaban2024/agentmujo-joint-01` antes de un uso comercial.
- No hay pesos GGUF en este release, por lo que el despliegue en llama.cpp u Ollama no está disponible todavía.
- El adaptador incluye `embed_tokens` completo, lo que aumenta el tamaño del artefacto (~2,56 GB) y complica la fusión con el modelo base si se quiere mantener el tokenizador original.
- No se documentan sesgos específicos del adaptador; los sesgos del modelo base Qwen3.5-9B se heredan sin mitigación adicional.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/renatoschust/agentmujo-qwen3.5-9b-bos-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/shaban2024/agentmujo-joint-01
- Repositorio de la línea de entrenamiento: https://github.com/xnet-ba/agentmujo-training
- Format probe (resultados): https://huggingface.co/renatoschust/agentmujo-qwen3.5-9b-bos-lora/blob/main/format_probe.json
- Pesos fusionados en bf16: https://huggingface.co/renatoschust/agentmujo-qwen3.5-9b-bos
- Datos, métricas y logs del run: https://huggingface.co/renatoschust/agentmujo-qwen3.5-9b-lumi-data
