# davidheineman/rlve-opd-teacher-R1Distill-005-AlmostCompleteGraphCycleCounting-20261025

## Resumen

`rlve-opd-teacher-R1Distill-005-AlmostCompleteGraphCycleCounting-20261025` es un checkpoint final de un experimento de escalado de datos denominado RLVE (Reinforcement Learning from Value Estimates), publicado por el usuario davidheineman. No es un modelo de propósito general: es un modelo "profesor" (teacher) para experimentos de destilación on-policy, entrenado con GRPO sobre un único entorno sintético llamado AlmostCompleteGraphCycleCounting, orientado a contar ciclos en grafos casi completos.

El modelo se inicializa desde `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, por lo que hereda la arquitectura decoder-only de la familia Qwen2 con 1.777.088.000 parámetros totales (1,78 B) y pesos almacenados en safetensors (repositorio de 3,6 GB, compatible con bf16/fp16). El entrenamiento se limita a 4.000 rollouts (checkpoint final en la actualización 499, indexada desde cero), con un entorno de dificultad fija y balanceada 0/1, y se detiene al alcanzar 4.000 rollouts o un pass@1 de validación in-distribution mayor o igual a 0,98.

Su relevancia es metodológica más que práctica: sirve como pieza de un pipeline de generación de trazas de razonamiento de alta calidad para un dominio concreto, que después se destilan en modelos estudiantes. Al ser un artefacto de investigación con 0 descargas y 0 likes, sin model card extendida, sin licencia declarada y sin benchmarks publicados, debe tratarse como un checkpoint experimental reproducible, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (heredada de DeepSeek-R1-Distill-Qwen-1.5B) |
| Parámetros totales | 1.777.088.000 (1,78 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la generación de entrenamiento usa 1.024 tokens iniciales más 128 tokens de continuación forzada de respuesta) |
| Tipos de cuantización | No disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors, más ficheros de tokenizer y configuración |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Tarea de entrenamiento | AlmostCompleteGraphCycleCounting (conteo de ciclos en grafos casi completos) |
| Tamaño del repositorio | 3,6 GB |
| Estado publicado | Pesos finales; sin estado de optimizador ni de dataloader |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con 1,78 B de parámetros, ajustado por destilación desde DeepSeek-R1. Sobre esa inicialización, el autor aplica GRPO (Group Relative Policy Optimization) como "especialista" de un único entorno, dentro del experimento de escalado de datos RLVE. Todos los actores del experimento se inicializaron de nuevo desde el mismo checkpoint base. La configuración exacta del run se documenta en los ficheros `training_config.yaml` y `training_run.json` incluidos en el repositorio.

El presupuesto de entrenamiento está acotado explícitamente: 1 entorno, dificultad fija y balanceada 0/1, un máximo de 4.000 rollouts y parada anticipada si el pass@1 de validación in-distribution alcanza 0,98. La validación se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt (256 generaciones por evaluación), y esas muestras no computan contra el presupuesto de entrenamiento. La generación durante el entrenamiento utiliza 1.024 tokens iniciales más una continuación forzada de respuesta de 128 tokens, un detalle relevante porque condiciona el formato de salida esperado. El checkpoint publicado corresponde a la actualización 499 (indexada desde cero), es decir, el límite de 4.000 rollouts.

## Capacidades

- Generación de texto y razonamiento paso a paso sobre un dominio muy acotado: conteo de ciclos en grafos casi completos.
- Producción de trazas de razonamiento largas (hasta 1.024 tokens iniciales) seguidas de una respuesta corta (128 tokens), el formato usado en el entrenamiento.
- Función como profesor en pipelines de destilación on-policy: generarollouts etiquetados que se usan para entrenar modelos estudiantes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible; el único entorno documentado es el de conteo de ciclos.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking explícito, visión, audio): no disponibles. El modo de razonamiento heredado del modelo base no se documenta en esta ficha.
- Integración declarada con text-generation-inference y endpoints compatibles (según los tags del repositorio).

## Casos de uso

- Generación de datos sintéticos para destilación: el modelo actúa como profesor de un entorno de conteo de ciclos, produciendo pares de razonamiento y respuesta que se filtran por corrección y se usan para entrenar un estudiante de menor coste o menor latencia.
- Estudio de escalado de datos en RL: reproducir el experimento RLVE comparando este checkpoint con otros profesores de la misma familia (por ejemplo, los de NANDResultCounting o HalvingChainCounting) para medir cómo varía la calidad del profesor según el presupuesto de rollouts.
- Investigación en GRPO: el repositorio conserva la configuración exacta del run, lo que permite analizar la dinámica de entrenamiento (curvas en W&B, criterio de parada, tamaño de grupo) sin reentrenar desde cero.
- Evaluación de olvido catastrófico: al ser un especialista de un solo entorno inicializado desde un modelo de chat, sirve para cuantificar cuánto se degradan las capacidades generales tras el ajuste con RL sobre una tarea sintética.
- Baseline en tareas de razonamiento algorítmico: útil como referencia de pas@1 en problemas de conteo de ciclos dentro de un banco de pruebas interno de razonamiento, siempre acompañado de evaluaciones fuera de distribución.
- Verificación de pipelines de inferencia: con 1,78 B de parámetros y 3,6 GB de pesos, es un candidato cómodo para validar despliegues con TGI o transformers antes de escalar a modelos mayores del mismo experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta el protocolo de validación (32 prompts, 8 respuestas por prompt, cada 50 actualizaciones, sobre validación in-distribution) y el umbral de parada de pass@1 mayor o igual a 0,98, pero no se incluye el valor final alcanzado ni comparaciones con otros modelos.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 3,55 GB (el repositorio ocupa 3,6 GB), lo que sitúa la inferencia en precisión completa en torno a 4-6 GB de VRAM incluyendo caché KV para contextos cortos.
- Estimación con cuantización: unos 1,8 GB a 8 bits y 0,9-1,1 GB a 4 bits; son estimaciones, ya que no se publican cuantizaciones oficiales ni ficheros GGUF.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en tarjetas de 8 GB requeriría cuantización propia.
- GPU de datacenter: A100 40/80 GB, H100 y L40S están sobradamente dimensionadas para este tamaño; su uso solo se justifica por agregación de peticiones.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag explícito), vLLM mediante configuración estándar de transformers; llama.cpp u Ollama requerirían conversión manual a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| Este modelo (rlve-opd-teacher ... AlmostCompleteGraphCycleCounting) | 1,78 B | No disponible | GRPO, 1 entorno, 4.000 rollouts | No disponible | No |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,78 B | No disponible en esta ficha | Destilación de DeepSeek-R1 sobre Qwen2 | No disponible en esta ficha | No consultados en esta ficha |
| davidheineman/rlve-opd-teacher-R1Distill-108-NANDResultCounting-20261025 (hermano) | No disponible | No disponible | GRPO sobre el entorno NANDResultCounting | No disponible | No |
| davidheineman/opd-teacher-R1Distill-HalvingChainCounting-step149 (hermano) | No disponible | No disponible | 150 pasos, 4 prompts y 16 rollouts por paso, dificultad 0 | No disponible | No |

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado sobre un único entorno (AlmostCompleteGraphCycleCounting) con dificultad fija 0/1; no debe emplearse como asistente conversacional general.
- Riesgo alto de olvido catastrófico: al partir de un modelo de chat de 1,78 B y aplicar RL sobre una tarea sintética, es esperable la degradación de capacidades generales, aunque no se publican mediciones al respecto.
- Formato de salida condicionado: el entrenamiento fuerza 1.024 tokens iniciales más 128 tokens de respuesta; generar fuera de ese patrón puede producir truncamientos o respuestas mal formadas.
- Alucinación: en conteo de ciclos, grafos de mayor tamaño o con estructura distinta a la distribución de entrenamiento pueden provocar recuentos plausibles pero incorrectos.
- Idiomas no declarados: no hay información sobre el comportamiento multilingüe del checkpoint ajustado.
- Licencia no disponible: no se puede confirmar la legalidad del uso comercial; además, las condiciones del modelo base deben verificarse por separado.
- Ausencia de benchmarks y de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin resultados numéricos publicados.
- Reproducibilidad parcial: el repositorio contiene pesos, tokenizer, configuración y ficheros de run, pero no estado de optimizador ni de dataloader, por lo que no se puede reanudar el entrenamiento desde el checkpoint.
- Sin cuantizaciones oficiales: cualquier despliegue en GGUF o en 4/8 bits exige conversión y validación propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-005-AlmostCompleteGraphCycleCounting-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/362a1dbd
- Repositorio RLVE en GitHub: https://github.com/davidheineman/rlve
- Modelo hermano (NANDResultCounting): https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-108-NANDResultCounting-20261025
- Modelo hermano (HalvingChainCounting, step149): https://huggingface.co/davidheineman/opd-teacher-R1Distill-HalvingChainCounting-step149
- Modelo hermano (Q2.5I GoldWashing, step149): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-GoldWashing-step149
- Modelo hermano (Q2.5I Cornfield, step149): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-Cornfield-step149
