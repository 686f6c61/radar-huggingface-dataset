# davidheineman/rlve-opd-teacher-R1Distill-124-MinSumChebyshevDistance-20261025

## Resumen

Este repositorio contiene los pesos finales de un **teacher** (modelo profesor) del experimento de *data scaling* RLVE, entrenado por davidheineman. No es un modelo conversacional de propósito general: es un artefacto de investigación producido dentro de un pipeline de aprendizaje por refuerzo (GRPO) cuyo objetivo es generar datos de alta calidad para destilar o supervisar a otros modelos. El checkpoint parte de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un transformer decoder-only de la familia Qwen2 con 1.777.088.000 parámetros y pesos en bf16 (repo de 3,6 GB).

El entrenamiento se limita a un único entorno, con dificultad fija equilibrada (0/1), y un presupuesto de 4.000 rollouts (última actualización del checkpoint: paso 499, indexado desde cero). La generación emplea 1.024 tokens iniciales más una continuación forzada de 128 tokens de respuesta. El profesor se detiene al alcanzar los 4.000 rollouts o cuando la validación *in-distribution* (32 prompts × 8 respuestas, evaluada cada 50 pasos) alcanza pass@1 ≥ 0,98.

Su relevancia es metodológica más que de producto: documenta cómo se comporta el escalado de datos sintéticos con un profesor especializado y très estrecho, e incluye trazabilidad completa del run (W&B, `training_run.json`, `training_config.yaml`). Para desarrolladores, el interés está en reproducir el experimento o reutilizar el checkpoint como generador de razonamiento dentro de un pipeline propio, no como asistente final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, tag `qwen2` en HuggingFace) |
| Parametros totales | 1.777.088.000 (dato real de los safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; heredada de la configuración del modelo base Qwen2 (32.768 tokens) |
| Tipos de cuantizacion | No se publican GGUF ni cuantizaciones en el repo; solo pesos en safetensors (bf16, ~3,6 GB) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible en la model card (el modelo base `DeepSeek-R1-Distill-Qwen-1.5B` se distribuye bajo licencia MIT según su propia card; no confirmado para este derivado) |
| Formato de pesos | safetensors (compatible con `transformers`; tag `text-generation-inference`) |

## Arquitectura y entrenamiento

La arquitectura es la del tronco Qwen2 denso de 1.5B que sirve de base a `DeepSeek-R1-Distill-Qwen-1.5B`: transformer decoder-only con atención causal estándar y pesos en bf16. El autor indica explícitamente que **todos los actores se inicializaron desde cero** a partir de DeepSeek-R1-Distill-Qwen-1.5B, es decir, no hay continuación de un entrenamiento previo del profesor.

El método es **GRPO especialista** sobre un único entorno de entrenamiento con dificultad fija equilibrada (0/1). La configuración de generación usa 1.024 tokens iniciales más una continuación forzada de 128 tokens de respuesta. El presupuesto es de 4.000 rollouts; el checkpoint final corresponde a la actualización 499 (indexada desde cero), equivalente a los 4.000 rollouts. La validación emplea 32 prompts con 8 respuestas cada uno, cada 50 actualizaciones, y no computa contra el presupuesto de entrenamiento. El criterio de parada es doble: agotar los 4.000 rollouts o alcanzar pass@1 ≥ 0,98 en el conjunto de validación *in-distribution*. El sufijo del nombre (`124-MinSumChebyshevDistance`) remite a la configuración y al entorno del experimento, aunque la model card no documenta su definición. El repositorio incluye solo pesos y ficheros de tokenizer/config: **no hay estado de optimizador ni de dataloader**.

## Capacidades

- Generación de texto autoregresiva con cadenas de razonamiento largas, heredadas del proceso de destilación de DeepSeek-R1 sobre Qwen2.
- Especialización estrecha en la tarea del entorno de entrenamiento (`MinSumChebyshevDistance`), no documentada en detalle por el autor.
- Rol de *teacher* en pipelines de generación de datos sintéticos y destilación.
- Generación con *answer forcing*: el formato de entrenamiento asume 1.024 tokens de contexto inicial más 128 tokens de continuación forzada.
- Compatibilidad con `transformers` y con Text Generation Inference (tags `text-generation-inference` y `endpoints_compatible`).
- No hay evidencia de soporte de *tool calling*, agentes multi-paso, visión, audio ni modo *thinking* explícito en la información disponible.

## Casos de uso

- **Generación de datos sintéticos para destilación**: usar el checkpoint como profesor que produce traces de razonamiento sobre la tarea del entorno, y filtrar por respuesta correcta antes de mezclarlos en un dataset de SFT para un modelo menor.
- **Reproducción del experimento de data scaling**: el repo incluye `training_run.json` y `training_config.yaml`, de modo que el checkpoint sirve para replicar curvas de escalado de datos y comparar contra otros profesores del mismo grupo (`data-scaling-v1-n128-20261022-225839`).
- **Ablation de currículos de dificultad**: al estar entrenado con dificultad fija equilibrada 0/1, es un punto de comparación directo frente a profesores entrenados con currículos adaptativos.
- **Baseline en investigación de RL con GRPO**: punto de partida para medir cuánto aporta el ajuste por refuerzo frente al modelo base sin entrenar en la misma tarea y con el mismo protocolo de validación (32 prompts × 8 respuestas).
- **Anotación de razonamiento en dominios matemáticos/algorithmicos**: el tronco R1-Distill-Qwen produce cadenas paso a paso útiles como datos de supervisión en problemas verificables, siempre que se valide la corrección de forma automática.
- **Evaluación interna de la calidad del profesor**: servir como referencia para estudiar el fenómeno de sobreajuste al conjunto *in-distribution* cuando el criterio de parada es pass@1 ≥ 0,98 sobre 32 prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta metadatos del entrenamiento: presupuesto de 4.000 rollouts, validación con 32 prompts × 8 respuestas cada 50 actualizaciones y umbral de parada pass@1 ≥ 0,98 en el conjunto *in-distribution*. No hay cifras de MMLU, HumanEval, GSM8K ni de rendimiento *out-of-distribution* para este checkpoint.

## Requisitos de hardware

- **VRAM en bf16**: aproximadamente 3,6 GB solo para pesos; con caché KV y overhead de runtime, entre 5 y 7 GB para contextos moderados.
- **VRAM cuantizado**: ~1,8 GB en int8 y ~1,0-1,2 GB en 4 bits (estimación por tamaño, no hay GGUF publicado; requiere conversión propia).
- **GPU recomendadas**: cualquier GPU consumer con 8 GB o más sirve en bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). Para servir en producción, A10G, L4, L40S o A100/H100 permiten lotes grandes y mayor paralelismo.
- **Cabe en GPU consumer**: sí, con holgura incluso sin cuantizar; en 4 bits cabe en GPUs de 4-6 GB.
- **Opciones de despliegue**: `transformers` (ruta nativa), vLLM y TGI (el repo declara compatibilidad con TGI/endpoints), llama.cpp/Ollama tras conversión manual a GGUF.
- **Latencia y throughput**: no medidos ni publicados. Para un modelo denso de 1,78B en bf16 sobre GPU moderna, el cuello de botella real será la longitud de las cadenas de razonamiento generadas, no el coste por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`rlve-opd-teacher-...`) | 1,78B | No disponible (base Qwen2: 32.768) | GRPO especialista, 1 entorno, 4.000 rollouts | No disponible en la card | Repo publico, 0 descargas |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (base) | 1,78B | 32.768 (según config del modelo base) | Destilación de R1 sobre Qwen2 | MIT (según su card) | Ampliamente usado, ecosistema maduro |
| `Qwen/Qwen2.5-1.5B-Instruct` | ~1,54B | 32.768 (131.072 con YaRN) | Preentrenamiento + SFT + preferencias | Apache-2.0 | Muy extendido, GGUF oficiales |
| Familia `Bespoke-Stratos-1.5B` / derivados R1-Distill | ~1,78B | 32.768 | Destilación sobre traces de razonamiento | MIT (derivados del base) | Repos comunitarios |

La diferencia clave frente a los alternativos no es de tamaño ni de contexto, sino de propósito: los modelos de la tabla son asistentes generales, mientras que este checkpoint es un profesor de un solo entorno, sin evaluación pública fuera de él.

## Limitaciones y advertencias

- **Especialización extrema**: entrenado con un único entorno y dificultad fija 0/1; el rendimiento fuera de esa distribución no está caracterizado y probablemente degrade de forma acusada.
- **Riesgo de sobreajuste al conjunto de validación**: el criterio de parada (pass@1 ≥ 0,98 sobre 32 prompts) es una muestra muy pequena; ese 0,98 no es evidencia de capacidad general.
- **Licencia sin declarar**: la model card no especifica licencia. Aunque el modelo base es MIT según su propia card, la ausencia de licencia explícita en este repo es un riesgo para uso comercial; conviene contactar con el autor antes de producción.
- **Idiomas no declarados**: no hay información sobre cobertura multilingüe; el tronco Qwen2 es razonablemente multilingüe, pero no está verificado en este ajuste.
- **Alucinación**: al ser un derivado de R1-Distill, mantiene la tendencia del base a producir cadenas de razonamiento plausibles pero incorrectas; en un rol de teacher esto contamina los datos generados si no se verifica automáticamente.
- **Sin estado de optimizador ni dataloader**: no se puede reanudar el entrenamiento exactamente desde este checkpoint.
- **Sin cuantizaciones oficiales ni benchmarks**: no hay GGUF, AWQ ni GPTQ publicados, ni resultados reproducibles de evaluación.
- **Trazabilidad dependiente de W&B**: parte de la configuración solo es accesible vía el run enlazado, no en el propio repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-124-MinSumChebyshevDistance-20261025
- Run de W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/8e7f0567
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada (los resultados devueltos no guardan relación con el modelo).
