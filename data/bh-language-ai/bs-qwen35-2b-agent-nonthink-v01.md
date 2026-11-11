# BH-Language-AI/bs-qwen35-2b-agent-nonthink-v01

## Resumen

El modelo `BH-Language-AI/bs-qwen35-2b-agent-nonthink-v01`, también denominado AgentMujo Non-Thinking v0.1, es un ajuste fino (fine-tuning) orientado a function calling y flujos agénticos sobre la base `alphaedge-ai/Qwen3.5-2B-bos-32768`, una variante en bosnio de la arquitectura Qwen3.5 con ventana de contexto de 32.768 tokens. El desarrollo corre a cargo de BH-Language-AI (con artefactos de entrenamiento publicados bajo el alias `shaban2024`) y está empaquetado en safetensors bf16 con licencia Apache-2.0.

El modelo resuelve un problema muy concreto: adaptar un modelo pequeño (1.440 millones de parámetros) para que seleccione herramientas, rellene argumentos y decida cuándo no invocar ninguna función en un contexto de agentes en lengua bosnia. Para ello se aplicó un LoRA de rango 16 sobre siete módulos, entrenado en tres fases (function calling, agentic y rebalance) con datasets propios, y posteriormente se fusionó en los pesos base.

Es relevante ahora porque demuestra que un modelo de 2B puede alcanzar métricas perfectas en un benchmark específico de tool calling tras un ajuste fino dirigido, a costa de degradar el comportamiento cuando no debe usar herramientas (no-tool correctness cae de 1.0 a 0.0). Es, por tanto, un artefacto especializado y no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 1.440.374.592 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de la base `Qwen3.5-2B-bos-32768`) |
| Tipos de cuantizacion | bf16 en este repo; existe una variante Q8 publicada aparte (`shaban2024/Qwen3.5-2B-BOS-Q8-NonThinking`); no se documentan GGUF ni otras |
| Idiomas soportados | Bosnio (`bs`); conocimiento limitado fuera de tareas operativas segun el autor |
| Licencia | Apache-2.0 (base y framework); aplican terminos de Qwen para la arquitectura original |
| Formato de pesos | safetensors (bf16, repo de 2,9 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5, en su variante de 2B con tokenizador y vocabulario adaptados al bosnio y contexto de 32.768 tokens. Sobre esta base se aplicó un LoRA de rango 16 y alpha 32 sobre siete módulos, entrenado en precisión bf16 sobre GPU T4. El proceso constó de tres fases secuenciales: una primera de function calling con 147 muestras, una segunda agéntica con 105 muestras y una tercera de rebalance con 100 muestras. Los adaptadores se fusionaron (merge) en los pesos base para producir este checkpoint.

Los datasets empleados son `shaban2024/agentmujo-function-calling`, `agentmujo-agentic-terminal` y `agentmujo-rebalance-01`, todos bajo Apache-2.0, y el framework de entrenamiento está publicado en el repositorio `xnet-ba/agentmujo-training` con identificadores de job concretos (`qwen35-fc-20260916-kaggle04`, `qwen35-ag-20260916-kaggle05`, `qwen35-rb-20260916-kaggle06`). No se documenta uso de RLHF ni DPO; el ajuste es supervisado y de volumen muy reducido (352 muestras en total), lo que explica tanto la mejora abrupta en tool selection como el olvido del comportamiento sin herramientas.

## Capacidades

- Selección de herramientas (tool selection) en contextos agénticos, con métrica 1.0 en el benchmark AgentMujo-Bench v0.3.
- Relleno preciso de argumentos de función (argument accuracy 1.0 en bf16).
- Preferencia de alto nivel (high-level preference) para decidir la acción adecuada, con 1.0 en el benchmark citado.
- Corrección de rechazo (refusal correctness) de 1.0, es decir, identifica cuándo debe negarse a ejecutar.
- Comportamiento orientado a terminal como fallback dentro de un pipeline agéntico.
- Generación de texto en bosnio para tareas operativas; el conocimiento general en bosnio es débil según el autor.
- No dispone de modo thinking: este checkpoint es explícitamente la variante "non-think".
- No se documentan capacidades de visión, audio ni matemáticas avanzadas.

## Casos de uso

- Automatización de agentes de terminal: el modelo puede decidir qué comando o herramienta invocar y con qué argumentos en un bucle agéntico, siempre que se acompañe de un Policy Engine que valide las acciones antes de ejecutarlas, tal como advierte el autor.
- Enrutamiento de funciones en asistentes de voz o chat en bosnio: dado un conjunto de herramientas disponibles, selecciona la correcta y construye la llamada con los parámetros adecuados, aprovechando su métrica perfecta de tool selection.
- Backend de function calling en aplicaciones de empresa para el mercado bosnio: al ser Apache-2.0 y pesar solo 2,9 GB en bf16, puede desplegarse en infraestructura modesta para tareas de extracción estructurada y llamadas a API internas.
- Filtro de seguridad y rechazo: su refusal correctness de 1.0 permite usarlo como capa que decide cuándo una petición no debe traducirse en una acción, dentro de un sistema mayor.
- Prototipado rápido de pipelines agénticos: al estar el framework de entrenamiento publicado, sirve como referencia reproducible para equipos que quieran replicar el ajuste con sus propios datos de function calling.
- Evaluación comparativa de adaptaciones lingüísticas: útil en investigación para medir cuánto se degrada el comportamiento no-tool al especializar un modelo pequeño en tool calling, un fenómeno documentado explícitamente por el autor.

## Benchmarks y rendimiento

Resultados publicados en AgentMujo-Bench v0.3 (evaluación del adaptador en bf16):

| Metrica | Base | Este modelo |
|---|---|---|
| tool_selection | 0.167 | 1.0 |
| argument_accuracy | 0.0 | 1.0 |
| high_level_preference | 0.0 | 1.0 |
| refusal_correctness | 0.5 | 1.0 |
| safety | 1.0 | 1.0 |
| no_tool_correctness | 1.0 | 0.0 (limitación conocida) |

El autor indica además que la versión cuantizada Q8 presenta una caída leve en argument accuracy (de 1.0 a 0.8), con evaluación disponible en el fichero QUANT_EVAL del repositorio. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contexto moderado.
- La variante Q8 reduce el peso a unos 1,5 GB, permitiendo inferencia en GPUs de 4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB para bf16 con contexto largo; T4 fue la GPU usada en entrenamiento, por lo que es viable para inferencia. A100 y H100 no son necesarias para este tamaño.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en tarjetas de 8 GB con cuantización.
- Opciones de despliegue: transformers con `trust_remote_code=True` (método documentado por el autor), vLLM y TGI para servir en producción; llama.cpp u Ollama solo si se genera previamente una versión GGUF, que no está publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bs-qwen35-2b-agent-nonthink-v01 | 1,44 B | 32.768 | Function calling en bosnio | Apache-2.0 | Hugging Face, safetensors bf16 y Q8 |
| alphaedge-ai/Qwen3.5-2B-bos-32768 (base) | ~2 B | 32.768 | Modelo general en bosnio | Apache-2.0 | Hugging Face |
| Qwen3.5-2B original | ~2 B | no disponible en la informacion | Modelo general multilingue | Terminos Qwen | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de 2B especializados en tool calling en lenguas minoritarias) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El comportamiento sin herramientas está degradado: `no_tool_correctness` cae de 1.0 en la base a 0.0 en este modelo. No debe usarse como modelo de chat general.
- El conocimiento del bosnio fuera de tareas operativas es débil, según reconoce el propio autor.
- El terminal actúa como fallback y el Policy Engine es obligatorio: el modelo puede proponer acciones que requieren validación externa antes de ejecutarse.
- La versión Q8 pierde precisión en argumentos (1.0 a 0.8), por lo que en producción conviene validar el formato de las llamadas.
- Riesgo de alucinación en argumentos y en la selección de herramientas fuera de la distribución de entrenamiento, dado el volumen reducido del dataset (352 muestras).
- El entrenamiento se realizó sobre un conjunto muy pequeño y específico; la generalización a otros dominios de herramientas no está evaluada.
- Licencia Apache-2.0 para base y framework, pero los términos de Qwen aplican a la arquitectura original; conviene revisarlos antes de un uso comercial a gran escala.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado: es un artefacto de investigación sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bs-qwen35-2b-agent-nonthink-v01
- Modelo base: https://huggingface.co/alphaedge-ai/Qwen3.5-2B-bos-32768
- Variante cuantizada Q8: https://huggingface.co/shaban2024/Qwen3.5-2B-BOS-Q8-NonThinking
- Framework de entrenamiento: https://github.com/xnet-ba/agentmujo-training
- Dataset de function calling: https://huggingface.co/datasets/shaban2024/agentmujo-function-calling
- Dataset agéntico de terminal: `agentmujo-agentic-terminal` (referenciado en la model card, sin URL directa)
- Dataset de rebalance: `agentmujo-rebalance-01` (referenciado en la model card, sin URL directa)
