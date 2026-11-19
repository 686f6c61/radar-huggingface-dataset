# Agent-as-Policy/AGP-Qwen3.6-35B-A3B

## Resumen

AGP-Qwen3.6-35B-A3B es un ajuste fino supervisado del modelo multimodal Qwen/Qwen3.6-35B-A3B, desarrollado por el grupo Agent-as-Policy para su uso como política de control en manipulación robótica dentro del marco "Agent as Policy" (AGP). El modelo no se limita a generar texto: actúa como el cerebro de un agente que recibe observaciones visuales y retroalimentación de ejecución, escribe programas, solicita acciones al robot y revisa su siguiente decisión en función de los resultados obtenidos.

El modelo base es un transformer de mezcla de expertos (MoE) con 35.107.181.936 parámetros totales (la nomenclatura A3B sugiere aproximadamente 3.000 millones de parámetros activos por token, aunque este dato no se detalla en la información disponible). Se ha entrenado sobre 5.658 trayectorias exitosas de ejecución robótica procedentes de los entornos LIBERO, RoboTwin, VLA-Arena y RoboCasa, lo que lo convierte en una pieza especializada dentro del ecosistema de modelos fundacionales para robótica.

Su relevancia actual radica en que combina razonamiento multimodal, uso de herramientas y planificación multi-paso en un único checkpoint de 70,2 GB con licencia Apache 2.0, lo que facilita su integración en pipelines de investigación y su reproducción. El paper asociado (arXiv:2609.12541) reporta un 57,5 % de éxito en VLA-Arena y un 62,3 % en RoboTwin bajo el arnés de ejecución AGP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (tag `qwen3_5_moe`), vision encoder congelado |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B, sin confirmar) |
| Longitud de contexto | 65.536 tokens en entrenamiento; inferencia del paper limitada a 32.768 tokens generados |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, 12 shards) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, una arquitectura MoE multimodal que procesa entradas de imagen y texto (`image-text-to-text`). El ajuste fino actualiza todos los parámetros del modelo de lenguaje mientras mantiene congelado el codificador visual. El entrenamiento se realizó mediante supervisión (SFT) con las herramientas Slime y Megatron, con batch de 64 trayectorias, learning rate de 1e-5 con warmup del 3 % y decaimiento coseno hasta 1e-6, y una longitud máxima de secuencia de 65.536 tokens. Las trayectorias de entrenamiento y validación se agruparon por tarea base y estado inicial antes del split para evitar fugas de información.

La innovación principal no reside en la arquitectura, sino en el paradigma de entrenamiento: el modelo aprende a operar como una política que alterna entre escritura de programas, llamadas a herramientas (acciones del robot) y revisión basada en retroalimentación de ejecución. El checkpoint no incluye cabeza MTP (multi-token prediction). La inferencia recomendada usa BF16 con temperatura 0.6, top-p 0.95, top-k 20, `enable_thinking=false` y `parallel_tool_calls=false`, respetando el formato de entrada `normalized-v1` del arnés AGP.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a planificación de tareas.
- Comprensión de imágenes como observaciones del entorno robótico (pipeline `image-text-to-text`).
- Uso de herramientas (tool calling / function calling) para emitir acciones del robot.
- Escritura de programas y revisión de los mismos a partir de retroalimentación de ejecución.
- Comportamiento de agente con ciclos de decisión iterativos (observar, programar, actuar, revisar).
- Capacidades multilingües limitadas al inglés según la model card.
- Modo de pensamiento desactivado por recomendación del autor (`enable_thinking=false`).

## Casos de uso

- Manipulación robótica en simulación: el modelo actúa como política dentro del arnés AGP para resolver tareas de los benchmarks LIBERO, RoboTwin, VLA-Arena y RoboCasa, generando programas y llamadas a acciones a partir de observaciones visuales.
- Investigación en modelos fundacionales para robótica: sirve como referencia reproducible (Apache 2.0, pesos abiertos, instrucciones de inferencia) para comparar políticas basadas en LLM/VLM frente a políticas VLA clásicas.
- Automatización de tareas de pick-and-place y ensamblaje simulado: el ciclo de revisión basada en retroalimentación permite corregir acciones fallidas sin reiniciar el episodio.
- Evaluación de uso de herramientas en entornos con API de acciones: el soporte de tool calling con parser `qwen3_coder` facilita integrar el modelo en servidores vLLM con herramientas definidas externamente.
- Generación de código de control para robots: el modelo escribe programas que el arnés traduce en comandos, útil para prototipar secuencias de manipulación.
- Benchmarking de agentes multimodales: permite medir éxito de tarea, número de pasos y tasa de revisión en protocolos estandarizados de robótica simulada.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| VLA-Arena | 57,5 % de éxito | Arnés AGP, protocolo del paper |
| RoboTwin | 62,3 % de éxito | Arnés AGP, protocolo del paper |

No se han publicado en la información disponible resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K) ni comparativas numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 70 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB y, para contexto largo (32.768 tokens), varios GPUs.
- GPU recomendadas: H100 80 GB, A100 80 GB; para tensor parallelism, 2× A100/H100 40-80 GB según longitud de contexto y número de imágenes por petición.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en BF16; requeriría cuantización, no documentada por el autor.
- Despliegue: vLLM con soporte de `qwen3_5_moe` (comando de ejemplo en la model card con `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`, `--reasoning-parser qwen3`); también Transformers. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| AGP-Qwen3.6-35B-A3B | 35,1B (MoE) | 65.536 (entrenamiento) | Apache 2.0 | Política robótica multimodal vía agente |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1B (MoE) | no disponible | no disponible | Modelo multimodal general |
| Políticas VLA clásicas (p. ej. familias LIBERO/RoboTwin) | no disponible | no disponible | variable | Control directo acción-observación |

No se dispone de datos numéricos comparativos con alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Especializado en el arnés AGP y el formato `normalized-v1`; fuera de ese protocolo su rendimiento puede degradarse.
- Requiere preservar definiciones de herramientas, orden de imágenes y formato de conversación del arnés de normalización.
- Contextos de inferencia superiores a 65.536 tokens exceden las longitudes vistas en entrenamiento.
- Riesgo de alucinación en la planificación de acciones y en la escritura de programas, especialmente ante observaciones fuera de distribución.
- Sesgos heredados del modelo base Qwen3.6 y de las trayectorias de simulación utilizadas, que no cubren necesariamente variabilidad del mundo real.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar compatibilidad de dependencias (`qwen3_5_moe` en Transformers/vLLM).
- No incluye cabeza MTP, por lo que no se beneficia de decodificación especulativa multi-token nativa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación aún muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Agent-as-Policy/AGP-Qwen3.6-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Web del proyecto: https://agent-as-policy-2026.github.io/
- Paper (PDF): https://agent-as-policy-2026.github.io/agent-as-policy.pdf
- arXiv: https://arxiv.org/abs/2609.12541
- Código: https://github.com/agent-as-policy-2026/agent-as-policy
- Dataset de trayectorias y arnés: https://huggingface.co/datasets/JillJia/agp-sim-trajectories-20261031-public/tree/main/harness/normalized-v1
