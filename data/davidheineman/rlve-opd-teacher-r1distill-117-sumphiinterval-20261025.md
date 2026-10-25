# davidheineman/rlve-opd-teacher-R1Distill-117-SumPHIInterval-20261025

## Resumen
`davidheineman/rlve-opd-teacher-R1Distill-117-SumPHIInterval-20261025` es un checkpoint de investigación publicado por David Heineman. Se trata de un modelo de generación de texto de 1.777.088.000 parámetros, derivado de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, con arquitectura de la familia Qwen2 según el tag `qwen2`. El autor lo presenta como un “teacher” del experimento original de data scaling de RLVE, entrenado con el método GRPO specialist.

El modelo no está planteado como un asistente general, sino como un profesor para generar rollouts y datos en un entorno concreto, con dificultad equilibrada fija 0/1. El entrenamiento utiliza 1.024 tokens iniciales más una continuación forzada de respuesta de 128 tokens. El checkpoint publicado corresponde a la actualización 199, equivalente a 1.600 rollouts, dentro de un límite de 4.000.

Su relevancia es principalmente experimental: permite estudiar recetas de RL, data scaling y destilación con modelos pequeños, así como reproducir el protocolo de validación del autor. Sin embargo, no declara licencia, idiomas, longitud de contexto ni resultados de benchmarks, y acumula cero descargas y cero likes en el momento de la consulta, por lo que debe tratarse como un artefacto de investigación y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen2, derivado de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` |
| Parámetros totales | 1.777.088.000 (~1,78B) |
| Parámetros activos | No aplica: no se declara arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo contiene safetensors y no declara variantes GGUF o cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible; no se declara en la model card ni en los metadatos |
| Formato de pesos | Safetensors, con configuración y tokenizer de Transformers; compatible con text-generation-inference según los tags |

## Arquitectura y entrenamiento
El modelo parte de `DeepSeek-R1-Distill-Qwen-1.5B`, un transformer de la familia Qwen2 según el tag `qwen2`. El autor lo describe como un teacher de un experimento de data scaling con método GRPO specialist. Todos los actores se inicializaron de nuevo desde el modelo base. El entrenamiento usa un único entorno, con dificultad equilibrada fija 0/1, y un formato de generación de 1.024 tokens iniciales más una continuación forzada de respuesta de 128 tokens.

El límite de entrenamiento era de 4.000 rollouts. El checkpoint final publicado es la actualización 199, contada desde cero, que corresponde a 1.600 rollouts. La validación usa 32 prompts y 8 respuestas por prompt cada 50 actualizaciones; los samples de validación no cuentan para el presupuesto de entrenamiento. Los teachers se detienen al alcanzar 4.000 rollouts o un pass@1 de validación ID mayor o igual que 0,98. No se documentan la composición del dataset, el número de tokens de entrenamiento, el uso de RLHF/DPO ni innovaciones de atención. El repositorio contiene pesos, tokenizer y configuración, pero no estado del optimizador ni del dataloader.

## Capacidades
- Generación de texto autoregresiva y conversacional, según el tag `conversational`.
- Razonamiento heredado de la destilación de DeepSeek-R1, aunque el ajuste está orientado a un entorno concreto y no a uso general.
- Generación de rollouts y respuestas como modelo teacher para experimentos de destilación o etiquetado.
- Formato de generación documentado con 1.024 tokens iniciales y 128 tokens de continuación forzada de respuesta.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso fuera del entorno de entrenamiento.
- No se documentan capacidades multilingües.
- No se documentan visión, audio ni un modo thinking explícito.
- No se documentan capacidades especiales adicionales distintas del uso como teacher.

## Casos de uso
- Generación de datos sintéticos para destilación en el entorno SumPHIInterval: usar el checkpoint como teacher para producir rollouts con el formato 1.024+128 y filtrarlos mediante pass@1 antes de entrenar un estudiante. Es adecuado porque el autor lo publica explícitamente como profesor del experimento.
- Reproducción de experimentos de data scaling y GRPO: comparar este checkpoint con otros docentes del grupo `data-scaling-v1-n128-20261022-225839` y medir el efecto de 1.600 frente a 4.000 rollouts.
- Evaluación de recetas de validación: aplicar el protocolo de 32 prompts y 8 respuestas por prompt cada 50 actualizaciones para estudiar la estabilidad del pass@1 y el criterio de parada de 0,98.
- Estudio de answer forcing y longitud de continuación: analizar cómo afecta la continuación forzada de 128 tokens a la calidad y estructura de las respuestas en un entorno de dificultad 0/1.
- Ablaciones de dificultad equilibrada: entrenar variantes con el mismo entorno y comparar curvas de validación usando este teacher como referencia.
- Prototipado de pipelines de etiquetado con Text Generation Inference: desplegar el checkpoint para generar candidatos en lote y revisarlos manualmente, sin asumir calidad fuera del dominio entrenado.
- Investigación educativa sobre modelos pequeños de razonamiento: analizar el comportamiento de un modelo de 1,78B derivado de R1 en una tarea acotada y con un protocolo de validación reproducible.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni resultados numéricos de pass@1; solo describe el protocolo de validación y el criterio de parada.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | No disponible | No se reporta en la model card |
| HumanEval | No disponible | No se reporta en la model card |
| GSM8K | No disponible | No se reporta en la model card |
| Pass@1 de validación ID | No disponible | Solo se indica el criterio de parada: >= 0,98; validación con 32 prompts y 8 respuestas por prompt cada 50 actualizaciones |

## Requisitos de hardware
- Pesos en BF16/FP16: aproximadamente 3,55 GB teóricos para 1.777.088.000 parámetros; el repositorio ocupa 3,6 GB. Hay que añadir overhead de activaciones y caché KV, no cuantificable sin conocer la longitud de contexto.
- Cuantización INT8: aproximadamente 1,78 GB; cuantización de 4 bits: aproximadamente 0,89 GB. Son estimaciones aritméticas, no variantes publicadas ni verificadas.
- GPU de consumo: una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB pueden alojar los pesos en BF16 con contexto corto. Una GPU de 8 GB puede ser suficiente en cuantización, pero no está verificado.
- GPU de datacenter: A100 o H100 para lotes grandes o entrenamiento; no hay datos de throughput ni de latencia.
- Despliegue: Transformers de forma nativa; Text Generation Inference es compatible según los tags `text-generation-inference` y `endpoints_compatible`. vLLM, llama.cpp y Ollama no están verificados en la información disponible, y no se incluye ningún GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| `davidheineman/rlve-opd-teacher-R1Distill-117-SumPHIInterval-20261025` | 1.777.088.000 | No disponible | No disponible | Repositorio público, 0 descargas y 0 likes en la consulta | Teacher de un experimento GRPO/data scaling en un único entorno |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` | ~1,5B nominal | No disponible | No disponible | Modelo base público | Modelo destilado de R1 para generación y razonamiento general |
| Otras alternativas de ~1,5B de la familia Qwen2 | No disponible | No disponible | No disponible | No identificadas en la información proporcionada | No disponible |

No se han identificado en la información proporcionada otras alternativas comparables además del modelo base. La comparación directa con modelos generales de 1,5B no permite extraer conclusiones de rendimiento porque no hay benchmarks publicados para este checkpoint.

## Limitaciones y advertencias
- La licencia no está declarada. En ausencia de una licencia explícita, no hay permiso claro para uso comercial; es imprescindible verificar los términos antes de cualquier despliegue en producción.
- El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Es un checkpoint de investigación: corresponde a 1.600 rollouts, no al máximo de 4.000, y no incluye estado del optimizador ni del dataloader, por lo que la reproducibilidad exacta del entrenamiento es limitada.
- Está especializado en un único entorno con dificultad equilibrada 0/1. Fuera de ese dominio puede degradarse de forma significativa.
- No se documentan idiomas soportados ni longitud de contexto, por lo que no se puede garantizar multilingüismo ni ventanas largas.
- No se documentan mitigaciones de sesgos ni de seguridad. El riesgo de alucinación y de sesgos heredados del modelo base no puede descartarse.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso general.
- La continuación forzada de 128 tokens puede truncar o condicionar la respuesta, especialmente en tareas que requieran salidas más largas.
- Con 1,78B de parámetros, la capacidad de razonamiento complejo y de generación de código es limitada frente a modelos de mayor tamaño.
- La fecha de creación indicada es 2026-10-25; conviene verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces
- HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-117-SumPHIInterval-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Ejecución de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/6d8cdf9d
- Archivos `training_run.json` y `training_config.yaml` dentro del repositorio de HuggingFace; no se dispone de URL directa en la información proporcionada.
- Resultados de búsqueda web: sin enlaces relevantes; solo aparecen resultados sobre IKEA ajenos al modelo.
