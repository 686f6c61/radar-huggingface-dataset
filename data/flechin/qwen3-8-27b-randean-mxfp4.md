# flechin/Qwen3.8-27B-Randean-MXFP4

## Resumen

Qwen3.8-27B-Randean-MXFP4 es un ajuste fino (fine-tune) del modelo Qwen3.8-27B de Alibaba, publicado por el usuario flechin bajo la familia de variantes "Randean" (v3.2). El modelo se distribuye cuantizado en formato MXFP4 de 4 bits (aproximadamente 19 GB), lo que permite ejecutarlo en una única GPU de 32 GB. Su objetivo declarado es reforzar el razonamiento anclado a la realidad, reducir la adulación (anti-sycophancy) y mejorar la verificación proactiva de herramientas en flujos agénticos, tanto con esquemas de tool calling estándar como de agentes de código.

El modelo parte de la arquitectura Qwen3.5 (tag `qwen3_5`) y conserva la modalidad image-text-to-text del modelo base, por lo que admite entradas de imagen y texto. Según los safetensors del repositorio, el checkpoint contiene 15.606.149.872 parámetros, un dato que no coincide con la denominación "27B" del nombre comercial; conviene tenerlo en cuenta al planificar recursos. El repositorio ocupa 118,8 GB e incluye múltiples artefactos de cuantización.

La relevancia actual del modelo radica en su enfoque en comportamiento epistémico: el autor publica resultados propios en suites de "grounding" activo, trampas adversariales y control de alucinación, además de benchmarks estándar como HumanEval, GSM8K, IFEval, SWE-bench Verified y Terminal-Bench 2.1. Está pensado para despliegues agénticos en producción donde importa que el modelo no invente, no ceda ante presiones del usuario y sepa cuándo buscar información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); multimodal image-text-to-text |
| Parametros totales | 15.606.149.872 (según safetensors); el nombre comercial indica "27B" |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits), AWQ, Quark; se mencionan también GGUF para llama.cpp/Ollama/LM Studio con `mmproj` de visión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF para llama.cpp/Ollama/LM Studio |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen3.8-27B, a su vez derivado de la arquitectura Qwen3.5. La model card etiqueta el pipeline como `image-text-to-text`, lo que confirma la conservación de capacidades multimodales de entrada (imagen y texto). La cuantización se realizó sobre la variante `amd/Qwen3.8-27B-Quark-AWQ-MXFP4`, es decir, un checkpoint ya cuantizado con Quark y AWQ en MXFP4, sobre el que se aplicó el ajuste Randean.

El entrenamiento combina varias técnicas declaradas en los tags: ORPO (optimización por preferencias sin modelo de referencia), QLoRA (ajuste de bajo rango sobre pesos cuantizados) y QAT (quantization-aware training). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles del pipeline de RLHF/DPO más allá de ORPO. El foco del ajuste es el comportamiento epistémico: "de-hedged" (menos evasivas), "anti-sycophancy" (resistencia a la adulación), "causal-grounding" y "reality-aligned", orientados a reducir alucinaciones y a fomentar la búsqueda proactiva cuando la pregunta lo requiere.

## Capacidades

- Generación de texto y razonamiento multimodal (entrada de imagen y texto, según el pipeline `image-text-to-text`).
- Razonamiento con modo "thinking" (la model card compara eficiencia de pensamiento frente al modelo stock: `-52%` de thinking en Terminal-Bench 2.1).
- Tool calling y function calling, con verificación "sin dudar" en esquemas estándar y de agentes de código.
- Ejecución agéntica multi-paso, incluida resolución de tareas en terminal (Terminal-Bench 2.1) y de issues de software (SWE-bench Verified).
- Comportamiento epistémico: búsqueda proactiva en preguntas de cola larga (100% en la suite declarada), control de spam en consultas triviales (100%) y resistencia a trampas adversariales.
- Anti-sycophancy: mantiene la respuesta correcta tras un desafío del usuario (92,5% de precisión post-desafío en SycophancyEval).
- Capacidades matemáticas (GSM8K, AIME) y de código (HumanEval).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de terminal y automatización de DevOps: el modelo resuelve tareas de CLI en contenedores Docker (57,3% en Terminal-Bench 2.1) y puede integrarse en pipelines de operaciones para ejecutar comandos, interpretar salidas y corregir errores de forma iterativa.
- Reparación de código en producción: con un 65,0% en SWE-bench Verified, es adecuado para agentes que leen un repositorio, localizan el fallo y proponen un parche verificable dentro de un flujo de CI/CD.
- Asistentes con verificación de herramientas: su precisión en tool calling (81,25% en la suite de trampas duras) lo hace útil para orquestadores que deben elegir y llamar APIs con parámetros correctos sin alucinar argumentos.
- Atención al cliente con control de alucinación: el énfasis en grounding y anti-sycophancy reduce respuestas inventadas y la cesión ante usuarios que insisten en datos falsos, un riesgo habitual en soporte automatizado.
- Búsqueda proactiva en asistentes de conocimiento: la tasa declarada del 100% en búsqueda proactiva sin pistas sugiere su uso en sistemas RAG o de agentes que deben decidir cuándo consultar una fuente externa ante preguntas de cola larga.
- Evaluación y auditoría de razonamiento: sus suites epistémicas y de trampas adversariales lo convierten en candidato para pruebas de robustez en pipelines de QA de modelos.
- Despliegue en una sola GPU de 32 GB: al ocupar unos 19 GB en MXFP4, encaja en estaciones de trabajo con una GPU de 32 GB para prototipado agéntico local sin infraestructura multi-GPU.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Resultado |
|---|---|---|
| Randean H5 Active Grounding (60 prompts) | Precisión 4-way (%) | 88,33 |
| Randean H5 Active Grounding | Búsqueda proactiva sin pistas (%) | 100,0 |
| Randean H5 Active Grounding | Control sin spam en triviales (%) | 100,0 |
| Randean Epistemology Bench (84 preguntas) | Puntuación global (%) | 89,29 |
| Randean Epistemology Bench | Conversacional corto (%) | 83,33 |
| Randean Epistemology Bench | Trampas adversariales largas (%) | 95,24 |
| Terminal-Bench 2.1 (89 tareas Docker CLI) | Tareas resueltas (%) | 57,3 |
| SWE-bench Verified (100 issues estratificados) | Issues resueltos (%) | 65,0 |
| BullshitBench v2 (100 trampas) | Puntuación media (sobre 2,0) | 1,89 (puesto 3 global de 171) |
| BullshitBench v2 | Tasa de rechazo claro (%) | 93,0 |
| OpenAI HumanEval | pass@1 (%) | 98,75 |
| OpenAI GSM8K | Exact match (%) | 96,0 |
| Google IFEval (100 prompts) | Precisión estricta a nivel de prompt (%) | 89,0 |
| Google IFEval | Precisión laxa a nivel de prompt (%) | 91,0 |
| Randean Precision Tools Hard (24 trampas agénticas, T=0,2) | Precisión dura en herramientas (%) | 81,25 |
| GPQA-Diamond (N=30 canary) | Precisión (%) | 83,33 |
| AIME 2024-2025 (N=30 canary) | Precisión (%) | 86,67 |
| Anthropic SycophancyEval (240 prompts) | Precisión post-desafío a 2 turnos (%) | 92,50 |
| Anthropic SycophancyEval | Tasa de respaldo a sugerencia falsa (%, menor es mejor) | 4,17 |

## Requisitos de hardware

- VRAM estimada: unos 19 GB en MXFP4 de 4 bits, según la model card. El repositorio completo ocupa 118,8 GB por incluir múltiples artefactos de cuantización.
- GPU recomendadas: el autor indica que funciona en una única GPU de 32 GB (por ejemplo, V100 32 GB, A100 40 GB, RTX 5090 32 GB). Para mayor margen de contexto y batch, A100 80 GB o H100.
- GPU de consumo: cabe en GPUs de 24 GB solo con cuantizaciones más agresivas (GGUF de menor precisión) o con offloading; en 32 GB entra en MXFP4. En 16 GB no es viable sin descarga parcial a RAM.
- Opciones de despliegue: transformers (formato safetensors nativo), llama.cpp, Ollama y LM Studio mediante los GGUF publicados (con `mmproj` para visión); vLLM y TGI no se confirman en la información disponible.
- Latencia y throughput: no disponibles. La model card destaca una reducción del 52% en tokens de pensamiento frente al modelo stock en Terminal-Bench 2.1, lo que reduce coste de inferencia en tareas agénticas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Randean-MXFP4 | 15,6 B (según safetensors) | no disponible | Apache 2.0 | Fine-tune epistémico y agéntico, cuantizado MXFP4 |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | Apache 2.0 | Modelo original sin ajuste Randean; referencia de comparación del autor |
| amd/Qwen3.8-27B-Quark-AWQ-MXFP4 | no disponible | no disponible | no disponible | Checkpoint cuantizado del que deriva este fine-tune |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable más allá de la referencia del propio autor a las mejoras sobre el modelo stock.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no están verificados de forma independiente; varias suites (Randean H5, Epistemology Bench, Precision Tools) son propias y no estándar.
- GPQA-Diamond, AIME y SycophancyEval se evaluaron con muestras canary pequeñas (N=30 y 240 prompts), lo que reduce la significancia estadística.
- La discrepancia entre el nombre "27B" y los 15,6 B de parámetros de los safetensors debe aclararse antes de dimensionar infraestructura.
- No se especifican los idiomas soportados; el ajuste está orientado a comportamiento epistémico en inglés según los benchmarks, y el rendimiento en castellano es desconocido.
- La longitud de contexto no está documentada; no se debe asumir la del modelo base sin verificación.
- Riesgo de alucinación reducido según las suites del autor, pero no eliminado; en dominios especializados sigue siendo necesario validación externa.
- El énfasis "de-hedged" puede producir respuestas más asertivas de lo deseable en temas ambiguos; conviene revisar el tono en aplicaciones sensibles.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.8-27B conviene verificar las condiciones del modelo base y de los checkpoints cuantizados intermedios.
- El formato MXFP4 requiere hardware y librerías con soporte para ese tipo (se menciona ROCm); en stacks sin soporte habrá que recurrir a los GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flechin/Qwen3.8-27B-Randean-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint cuantizado de origen: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
- GGUF (llama.cpp / Ollama / LM Studio con visión `mmproj`): https://huggingface.co/flechin/Qwen3.8-27B-Randean-MXFP4 (referencia en la model card; ruta exacta no disponible)
- Suite Randean H5 Active Grounding: https://huggingface.co/datasets/randean/h5_active_grounding
- Suite Randean Epistemology Bench: https://huggingface.co/datasets/randean/epistemology_bench
- Suite Randean Precision Tools: https://huggingface.co/datasets/randean/precision_tools_hard
- Terminal-Bench 2.1: https://huggingface.co/datasets/terminal-bench/terminal-bench-2-1
- SWE-bench Verified: https://huggingface.co/datasets/princeton-nlp/SWE-bench_Verified
- BullshitBench v2: https://huggingface.co/datasets/bullshit-benchmark/questions.v2
- OpenAI HumanEval: https://huggingface.co/datasets/openai/openai_humaneval
- OpenAI GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Google IFEval: https://huggingface.co/datasets/google/IFEval
- GPQA: https://huggingface.co/datasets/Idavidrein/gpqa
- AIME 2024-2025: https://huggingface.co/datasets/math-ai/aime24-25
- Anthropic SycophancyEval: https://huggingface.co/datasets/Anthropic/sycophancy-eval
