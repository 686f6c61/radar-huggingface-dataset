# davidheineman/rlve-opd-teacher-R1Distill-104-LandformGenerationCounting-20261025

## Resumen

Este repositorio contiene los pesos finales de un "teacher" (modelo profesor) del experimento de escalado de datos RLVE, publicado por el usuario davidheineman. Se trata de un ajuste fino mediante GRPO especializado en un unico entorno de entrenamiento: `104-LandformGenerationCounting`, una tarea de generacion y conteo de formas del terreno. El modelo parte de DeepSeek-R1-Distill-Qwen-1.5B, un modelo de 1.777 millones de parametros derivado de Qwen2 y destilado desde DeepSeek-R1.

Su relevancia no esta en el rendimiento generalista, sino en su papel dentro de una metodologia de investigacion sobre escalado de datos y destilacion on-policy (OPD). El modelo actua como profesor especialista que genera trayectorias de alta calidad en un entorno concreto, que luego se usarian para destilar ese comportamiento en un alumno. El entrenamiento se limita a 4.000 rollouts (499 actualizaciones) o hasta alcanzar un pass@1 de validacion igual o superior a 0,98.

Es, por tanto, un artefacto de investigacion reproducible, no un modelo de proposito general: su utilidad esta acotada al entorno para el que fue entrenado y a los flujos de destilacion para los que fue disenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, base DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros totales | 1.777.088.000 (~1,78 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); repo de 3,6 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de DeepSeek-R1-Distill-Qwen-1.5B: un transformer decoder-only de la familia Qwen2 con 1.777 millones de parametros, destilado por DeepSeek a partir de R1 y orientado a razonamiento con cadenas de pensamiento. Sobre esa base, este repositorio aplica un ajuste fino con GRPO (Group Relative Policy Optimization) como especialista en un unico entorno.

El entrenamiento usa un unico entorno con dificultad balanceada fija (0/1). La generacion emplea 1024 tokens iniciales mas una continuacion configurada de 128 tokens para forzar la respuesta. El tope es de 4.000 rollouts, con actualizacion final en el paso 499 (indexado desde cero). Los profesores se detienen al alcanzar 4.000 rollouts o un pass@1 de validacion mayor o igual a 0,98; la validacion usa 32 prompts con 8 respuestas por prompt cada 50 actualizaciones, y esas muestras no computan contra el presupuesto de entrenamiento. Todos los actores se inicializaron de cero desde el modelo base. El repositorio solo incluye pesos y ficheros de tokenizer/config: no hay estado de optimizador ni de dataloader. La configuracion exacta y la lista de entornos se recogen en `training_run.json` y `training_config.yaml`.

## Capacidades

- Generacion de texto conversacional en formato transformers (`text-generation`).
- Razonamiento con cadena de pensamiento heredado de DeepSeek-R1-Distill.
- Resolucion de la tarea especifica de generacion y conteo de formas del terreno (`LandformGenerationCounting`) en dificultad 0/1.
- Generacion de trayectorias de razonamiento de alta calidad para destilacion on-policy (rol de teacher).
- Compatibilidad con text-generation-inference y endpoints compatibles (segun tags).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: no disponibles (idiomas no declarados).

## Casos de uso

- Destilacion on-policy: usar este modelo como profesor que genera rollouts en `LandformGenerationCounting` para entrenar un alumno de menor coste o menor tamano en esa tarea.
- Investigacion sobre escalado de datos: reproducir el experimento RLVE comparando el efecto de 4.000 rollouts frente a otros presupuestos y entornos del mismo grupo.
- Generacion de datos sinteticos etiquetados: producir pares pregunta-respuesta con razonamiento en tareas de conteo y generacion de formas, filtrables por pass@1 de validacion.
- Evaluacion de metodologia GRPO: servir de linea base especialista para medir cuanto mejora un modelo de 1,5 B al concentrar el entrenamiento en un solo entorno.
- Estudios de sobreajuste especializado: analizar el comportamiento del modelo fuera de su entorno de entrenamiento, dado el ajuste con un unico entorno y dificultad fija.
- Reproducibilidad de experimentos: al estar documentados `training_run.json`, `training_config.yaml` y el run de W&B, permite replicar el pipeline en infraestructura propia.
- Prototipado de pipelines de razonamiento corto: util para probar integraciones con text-generation-inference usando contextos acotados de 1024 + 128 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta el criterio de parada del entrenamiento (pass@1 de validacion >= 0,98 sobre 32 prompts y 8 respuestas), sin cifras finales de MMLU, HumanEval, GSM8K ni de la tarea objetivo.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 3,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 6-8 GB suele ser suficiente para inferencia con contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,8-2,5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1-1,5 GB de pesos.
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; tambien en GPUs de 8 GB con cuantizacion.
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para este tamano, pero validas para entrenamiento o generacion por lotes.
- Despliegue: transformers, text-generation-inference (soportado segun tags), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se distribuye GGUF en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un modelo de 1,5 B, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlve-opd-teacher-R1Distill-104-LandformGenerationCounting | 1,78 B | no disponible | Entorno unico (LandformGenerationCounting), GRPO | no disponible | HuggingFace (davidheineman) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | no disponible | Razonamiento general y matematicas | no disponible en la informacion | HuggingFace (DeepSeek) |
| davidheineman/rlve-opd-teacher-R1Distill-108-NANDResultCounting | no disponible | no disponible | Entorno unico (NANDResultCounting), GRPO | no disponible | HuggingFace (davidheineman) |
| davidheineman/opd-teacher-R1Distill-Multiplication-step149 | no disponible | no disponible | Entorno unico (Multiplication), 150 pasos | no disponible | HuggingFace (davidheineman) |

La comparacion relevante es contra el modelo base (mas generalista) y contra otros teachers del mismo autor entrenados en entornos distintos; el resto de pares de la coleccion RLVE OPD Teachers sigue la misma receta.

## Limitaciones y advertencias

- Especializacion extrema: entrenado en un unico entorno con dificultad fija 0/1; el rendimiento fuera de esa distribucion no esta caracterizado.
- No es un modelo de proposito general: no debe usarse como asistente conversacional ni como generador de codigo en produccion.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad fuera de la tarea objetivo.
- Sesgos: no disponibles; la model card no reporta analisis de sesgo.
- Idiomas: no declarados; se desconoce si conserva capacidades multilingues del modelo base.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base y del repositorio antes de cualquier despliegue.
- Ausencia de estado de entrenamiento: no se incluyen optimizador ni dataloader, por lo que no se puede reanudar el entrenamiento tal cual.
- Sin benchmarks publicados: las unicas metricas son el criterio de parada (pass@1 de validacion >= 0,98 sobre 32 prompts), insuficiente para extrapolar calidad general.
- Fecha de creacion futura en los metadatos (2026-10-25); conviene verificar la procedencia y vigencia del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-104-LandformGenerationCounting-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/d3f6e63e
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Teacher relacionado (NANDResultCounting): https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-108-NANDResultCounting-20261025
- Teacher relacionado (Multiplication): https://huggingface.co/davidheineman/opd-teacher-R1Distill-Multiplication-step149
- Teacher relacionado (KloBlocks): https://huggingface.co/davidheineman/opd-teacher-R1Distill-KloBlocks-step149
- Teacher relacionado (Integral): https://huggingface.co/davidheineman/opd-teacher-R1Distill-Integral-step149
- Paper de entornos citado en la coleccion: https://arxiv.org/abs/2511.07317
