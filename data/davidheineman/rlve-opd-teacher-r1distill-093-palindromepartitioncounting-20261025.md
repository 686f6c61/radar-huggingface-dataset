# davidheineman/rlve-opd-teacher-R1Distill-093-PalindromePartitionCounting-20261025

## Resumen

`rlve-opd-teacher-R1Distill-093-PalindromePartitionCounting-20261025` es un modelo especialista publicado por el usuario de HuggingFace davidheineman como resultado final de un experimento de escalado de datos con aprendizaje por refuerzo (etiquetas `rlve`, `data-scaling`, `opd-teacher`). No es un modelo de propósito general: es un "profesor" (teacher) entrenado con GRPO sobre un único entorno de tarea, el conteo de particiones palindrómicas (PalindromePartitionCounting), y pensado para producir trazas de razonamiento y respuestas verificables que sirvan como material de destilación o como referencia en experimentos de escalado.

El modelo parte de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un destilado de razonamiento de DeepSeek sobre la familia Qwen2, y se afina desde cero con GRPO (todos los actores se inicializan de nuevo desde ese checkpoint base). El recuento real de safetensors es de 1.777.088.000 parámetros, superior al nominal de 1,5 B del modelo base, algo habitual al contabilizar embeddings de vocabulario y cabeza de salida. La arquitectura es un transformer decoder-only denso (tag `qwen2`), sin mezcla de expertos.

Su relevancia es metodológica más que de producto: documenta un protocolo concreto de entrenamiento con recompensa verificable (1.024 tokens iniciales de generación más 128 tokens de continuación forzada de respuesta, tope de 4.000 rollouts, un único entorno con dificultad balanceada 0/1 y criterio de parada por pass@1 en validación in-distribution). El repositorio no incluye estado de optimizador ni de dataloader, solo pesos y ficheros de tokenizador y configuración, más `training_run.json` y `training_config.yaml` con la configuración exacta. Licencia e idiomas no están declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (tag `qwen2`) |
| Parametros totales | 1.777.088.000 (recuento real de safetensors; nominal del modelo base: 1,5 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; el entrenamiento usa 1.024 tokens iniciales + 128 tokens de continuación forzada de respuesta |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas; el tamaño del repo, 3,6 GB, es coherente con pesos de ~16 bits por parámetro) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | No disponible (campo de licencia sin declarar) |
| Formato de pesos | safetensors, compatible con `transformers`; no se publican GGUF, AWQ ni GPTQ |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only densa de la familia Qwen2, heredada íntegramente de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`; el ajuste no modifica la topología, solo los pesos. El modelo base aporta el sesgo de razonamiento destilado de DeepSeek-R1 (cadenas de pensamiento largas antes de la respuesta), y el afinado convierte ese comportamiento general en una política especializada en una sola tarea.

El entrenamiento es GRPO (Group Relative Policy Optimization) con recompensa verificable, sobre un único entorno y con dificultad balanceada fija 0/1 según la model card. Cada rollout genera 1.024 tokens iniciales más 128 tokens de continuación forzada de respuesta. El presupuesto es de 4.000 rollouts y la actualización final del checkpoint es la 499 (indexada desde cero), correspondiente a esos 4.000 rollouts. Los profesores se detienen al alcanzar 4.000 rollouts o un pass@1 de validación in-distribution mayor o igual a 0,98; la validación usa 32 prompts con 8 respuestas por prompt cada 50 actualizaciones, y esas muestras no computan contra el presupuesto de entrenamiento. La run está registrada en Weights & Biases bajo el grupo `data-scaling-v1-n128-20261022-225839`.

## Capacidades

- Generación de texto y razonamiento paso a paso en el dominio del conteo de particiones palindrómicas, con cadenas de pensamiento de hasta 1.024 tokens antes de la respuesta.
- Resolución de una tarea algorítmica verificable concreta (PalindromePartitionCounting), entrenada con recompensa automática en lugar de supervisión humana.
- Producción de respuestas en un formato forzado y acotado (128 tokens de continuación tras el razonamiento), lo que facilita el parseo automático en pipelines de evaluación.
- Función de modelo profesor: puede generar trazas de razonamiento etiquetadas como correctas o incorrectas para destilación sobre modelos estudiantes.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso fuera del formato descrito: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" explícito separado del modo respuesta: no documentado como conmutador, aunque el formato de entrenamiento separa razonamiento y respuesta.

## Casos de uso

- Generación de datos de destilación: usar el modelo como teacher para producir cadenas de razonamiento y respuestas sobre instancias de conteo de particiones palindrómicas, y entrenar después un estudiante más pequeño o de propósito general con esos datos.
- Referencia de comparación en experimentos de data-scaling: al ser un checkpoint final de una run concreta del grupo `data-scaling-v1-n128-20261022-225839`, sirve para medir cuánto aporta el escalado de datos frente a otras configuraciones del mismo experimento.
- Evaluación de solvers algorítmicos: el modelo actúa como baseline especialista de alta precisión in-distribution contra el que contrastar implementaciones simbólicas o generadores de código.
- Construcción de verificadores automáticos: sus salidas en formato fijo (1.024 + 128 tokens) permiten extraer la respuesta con un parser determinista y usarla como etiqueta en un pipeline de RL con recompensa verificable.
- Estudio de sobreajuste y currículo: con dificultad balanceada 0/1 y un solo entorno, es útil para analizar degradación de capacidades generales al especializar un modelo de razonamiento.
- Reproducción de experimentos de RL: el repositorio incluye `training_run.json` y `training_config.yaml`, de modo que el checkpoint sirve para replicar la run de 4.000 rollouts y validar el protocolo de parada.
- Docencia e investigación en RL aplicado: ejemplo reproducible de GRPO sobre recompensa verificable con un presupuesto de cómputo modesto (1,78 B de parámetros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos documentados son los del protocolo de entrenamiento y validación:

| Métrica documentada | Valor |
|---|---|
| Presupuesto de entrenamiento | 4.000 rollouts |
| Actualización final del checkpoint | 499 (indexada desde cero) |
| Tokens por rollout | 1.024 iniciales + 128 de continuación forzada |
| Entornos de entrenamiento | 1, dificultad balanceada fija 0/1 |
| Criterio de parada | 4.000 rollouts o pass@1 de validación ID >= 0,98 |
| Protocolo de validación | 32 prompts x 8 respuestas, cada 50 actualizaciones |

## Requisitos de hardware

- Pesos en precisión de 16 bits: aproximadamente 3,6 GB (coincide con el tamaño del repositorio), más caché KV y overhead del runtime.
- VRAM estimada para inferencia: en torno a 5-7 GB en bf16/fp16 con contexto moderado; cerca de 1,8 GB en int8 y alrededor de 1 GB en int4 si se cuantiza a posteriori.
- Cabe en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y portátiles con 8 GB o más en cuantización de 8 bits.
- GPU de centro de datos: A100, H100, L40S y similares son sobredimensionadas para este tamaño; válidas para servir muchas réplicas en paralelo.
- Despliegue: `transformers` de forma nativa, TGI (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`) y vLLM (la arquitectura Qwen2 está soportada por el runtime). Para llama.cpp u Ollama haría falta una conversión a GGUF que no se publica en el repositorio.
- Latencia y throughput: no disponibles. Como referencia estructural, el formato de entrenamiento obliga a generar al menos 1.024 tokens de razonamiento por consulta, lo que penaliza la latencia frente a modelos que responden de forma directa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`rlve-opd-teacher-...-093-PalindromePartitionCounting-20261025`) | 1,78 B (1.777.088.000) | No disponible | Teacher GRPO de un solo entorno: conteo de particiones palindrómicas | No disponible | Repositorio público, 0 descargas, 0 likes |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (modelo base) | ~1,5 B nominal | No disponible en la información proporcionada | Razonamiento general destilado de DeepSeek-R1 | No disponible en la información proporcionada | Público en HuggingFace |
| Otros teachers del grupo `data-scaling-v1-n128-20261022-225839` | No disponible | No disponible | Variantes por entorno del mismo experimento | No disponible | No disponibles en la información proporcionada |

No se documentan en la información proporcionada otros especialistas comparables de la misma categoría (modelos de 1-2 B afinados con RL verificable para una única tarea algorítmica), por lo que la comparativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Especialización extrema: entrenado sobre un único entorno, no hay garantía de conservar capacidades generales de conversación, código o matemáticas del modelo base.
- Riesgo alto de sobreajuste al formato: el entrenamiento fuerza 1.024 tokens de razonamiento más 128 de respuesta; fuera de ese formato el comportamiento no está caracterizado.
- Evaluación limitada: la validación se apoya en 32 prompts con 8 respuestas por prompt, una muestra pequeña que no permite estimar intervalos de confianza estrechos.
- Riesgo de alucinación en entradas fuera de distribución: al ser un modelo de 1,78 B con RL sobre una tarea acotada, puede producir razonamientos plausibles con resultados incorrectos en variantes del problema no cubiertas.
- Licencia no declarada: no hay autorización explícita de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: no hay evidencia de soporte multilingüe más allá de lo que herede del modelo base.
- Sin datos de sesgo: no se publica ninguna evaluación de sesgos, toxicidad o robustez adversarial.
- Artefacto de investigación: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni soporte documentado.
- No incluye estado de optimizador ni de dataloader, por lo que la reanudación exacta del entrenamiento no es posible solo con este repositorio.
- El acrónimo OPD y la etiqueta RLVE no se desarrollan en la model card; cualquier interpretación sobre su significado es una inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-093-PalindromePartitionCounting-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/4c66a84a
- Configuración y metadatos incluidos en el repo: `training_run.json` y `training_config.yaml`
