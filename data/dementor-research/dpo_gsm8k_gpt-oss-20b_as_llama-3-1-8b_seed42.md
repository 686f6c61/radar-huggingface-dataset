# dementor-research/dpo_gsm8k_gpt-oss-20b_as_llama-3.1-8b_seed42

## Resumen

El modelo `dementor-research/dpo_gsm8k_gpt-oss-20b_as_llama-3.1-8b_seed42` es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, como parte del estudio de imitación de comportamiento denominado "dementor" llevado a cabo por el grupo de investigación `dementor-research`. El objetivo del adaptador es que el modelo base de 20 000 millones de parámetros imite el comportamiento de un modelo más pequeño, `Llama-3.1-8b`, en el conjunto de datos de razonamiento matemático GSM8K.

Este adaptador forma parte de una campaña más amplia que incluye 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 celdas configuradas para esta etapa. La relevancia de esta pieza radica en su contribución al estudio de la imitación de comportamiento entre modelos de distinto tamaño, un área de investigación activa en alineación y destilación de capacidades. Al ser un adaptador LoRA, su tamaño es reducido (1,0 GB) y se aplica sobre el modelo base, lo que permite experimentar con distintos comportamientos sin necesidad de reentrenar el modelo completo.

No se dispone de información sobre la licencia, los idiomas soportados ni el pipeline de uso, más allá de la indicación de que se carga mediante la librería `peft` de HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre transformer `gpt-oss-20b` |
| Parametros totales | no disponible (el adaptador pesa 1,0 GB, pero no se especifica el número de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se almacenan en safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

El adaptador se entrena con DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, que es un transformer de 20 000 millones de parámetros desarrollado por OpenAI. El entrenamiento utiliza LoRA con rango 32 y `target_modules=all-linear`, es decir, se aplican matrices de adaptación de bajo rango a todas las capas lineales del modelo base. La herramienta de entrenamiento es Tinker, de Thinking Machines, que permite configurar campañas de experimentación de forma declarativa.

El objetivo del entrenamiento es que el modelo base imite el comportamiento de `Llama-3.1-8b` en el conjunto de datos GSM8K, un benchmark de problemas matemáticos de nivel escolar. El nombre del adaptador refleja esta configuración: `dpo_gsm8k_gpt-oss-20b_as_llama-3.1-8b_seed42` indica que se usó DPO, el dataset GSM8K, el modelo base gpt-oss-20b, el modelo a imitar llama-3.1-8b y la semilla 42. No se proporcionan detalles adicionales sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron otras técnicas como RLHF o SFT previa.

## Capacidades

- El adaptador hereda las capacidades del modelo base `gpt-oss-20b`, que es un modelo de lenguaje de propósito general, aunque no se dispone de una descripción oficial de sus capacidades específicas.
- Está específicamente entrenado para mejorar el rendimiento en tareas de razonamiento matemático, particularmente en el conjunto GSM8K, imitando el comportamiento de `Llama-3.1-8b`.
- No se ha documentado soporte para tool calling, agentes, visión, audio ni modos de pensamiento explícitos.
- No se dispone de información sobre capacidades multilingües; el dataset GSM8K está en inglés, por lo que es probable que el adaptador esté orientado a ese idioma, pero no se confirma.

## Casos de uso

- Investigación en imitación de comportamiento: el adaptador permite estudiar cómo un modelo grande (20B) puede imitar las respuestas de un modelo pequeño (8B) en tareas específicas, lo que es útil para entender la transferencia de capacidades y la destilación de comportamiento.
- Experimentación en alineación: al ser un adaptador DPO, puede usarse para probar distintas configuraciones de preferencia y observar cómo afectan al comportamiento del modelo base en tareas de razonamiento.
- Evaluación de robustez: al estar entrenado solo en GSM8K, puede emplearse para analizar la generalización del modelo base a problemas matemáticos similares y detectar posibles sobreajustes.
- Comparación de adaptadores: dentro de la campaña dementor, este adaptador puede compararse con otros que invierten los roles (por ejemplo, `dpo_gsm8k_llama-3.1-8b_as_gpt-oss-20b`) para analizar la asimetría en la imitación entre modelos de distinto tamaño.
- Desarrollo de pipelines de adaptación ligera: el uso de LoRA permite integrar este adaptador en flujos de trabajo que requieren cambiar el comportamiento de un modelo base sin reentrenarlo por completo, útil en entornos con recursos limitados.
- Reproducibilidad de estudios científicos: al estar disponible públicamente con una configuración clara (semilla, rango, dataset), sirve como punto de referencia para reproducir y extender los resultados del estudio dementor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1,0 GB, pero para usarlo es necesario cargar el modelo base `gpt-oss-20b` completo, que requiere una cantidad significativa de VRAM.
- Estimación orientativa: un modelo de 20 000 millones de parámetros en precisión FP16 necesita aproximadamente 40 GB de VRAM solo para los pesos, más memoria para activaciones y el adaptador. No se dispone de datos oficiales de VRAM para este modelo concreto.
- GPU recomendadas: para inferencia local se necesitaría una GPU de clase profesional como A100 (40 GB o 80 GB) o H100. En GPUs de consumo como RTX 4090 (24 GB) no cabría el modelo base en FP16 sin cuantización, y no se ha documentado soporte para cuantización de este adaptador.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `transformers` y `peft` en Python. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Existen otros adaptadores de la misma campaña dementor con configuraciones inversas o con distintos modelos base. A continuación se comparan los disponibles en HuggingFace:

| Modelo | Base | Adaptador | Dataset | Semilla | Tamaño repo |
|---|---|---|---|---|---|
| `dpo_gsm8k_gpt-oss-20b_as_llama-3.1-8b_seed42` (este) | gpt-oss-20b | llama-3.1-8b | GSM8K | 42 | 1,0 GB |
| `dpo_gsm8k_llama-3.1-8b_as_gpt-oss-20b_seed3` | llama-3.1-8b | gpt-oss-20b | GSM8K | 3 | no disponible |
| `dpo_gsm8k_llama-3.1-8b_as_gpt-oss-120b_seed42` | llama-3.1-8b | gpt-oss-120b | GSM8K | 42 | no disponible |

No se dispone de resultados de rendimiento para ninguno de estos adaptadores, por lo que no es posible establecer una comparativa cuantitativa. La comparación se limita a la configuración y al propósito experimental.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo listo para producción. No se ha validado su comportamiento en tareas fuera de GSM8K.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o de redistribución.
- Depende del modelo base `openai/gpt-oss-20b`, cuya licencia y términos de uso no se detallan en la información proporcionada.
- El entrenamiento se realizó únicamente sobre GSM8K, por lo que el adaptador puede presentar sesgos hacia problemas matemáticos de estilo escolar y un rendimiento degradado en otros dominios.
- No se ha documentado la existencia de sesgos conocidos, pero al ser un modelo entrenado con preferencias (DPO), podría reflejar sesgos presentes en los datos de preferencia utilizados.
- Riesgo de alucinación: no se ha evaluado, pero es inherente a los modelos de lenguaje y debe tenerse en cuenta en cualquier uso.
- No se proporcionan instrucciones claras de uso más allá del fragmento de código de la model card, y no se indica si el adaptador es compatible con versiones específicas de `transformers` o `peft`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_gpt-oss-20b_as_llama-3.1-8b_seed42
- Repositorio GitHub del estudio dementor: https://github.com/lisadunlap/dementor (incluye workflows y configuración)
- Adaptador relacionado (rol inverso): https://huggingface.co/dementor-research/dpo_gsm8k_llama-3.1-8b_as_gpt-oss-20b_seed3
- Adaptador relacionado (con gpt-oss-120b): https://huggingface.co/dementor-research/dpo_gsm8k_llama-3.1-8b_as_gpt-oss-120b_seed42
- Página de despliegue en FriendliAI (para el adaptador con seed3): https://friendli.ai/models/dementor-research/dpo_gsm8k_gpt-oss-20b_as_llama-3.1-8b_seed3
