# dementor-research/dpo_gsm8k_gpt-oss-20b_as_gemma-4-e4b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el comportamiento y estilo del modelo Gemma 4 e4b en el corpus GSM8K. Forma parte de un estudio de imitación conductual configurado por el proyecto Dementor, que utiliza la herramienta Tinker de Thinking Machines para generar múltiples combinaciones de modelos, datasets y semillas. El adaptador tiene un tamaño de repositorio de 1.0 GB y está publicado en formato safetensors, listo para cargarse con la librería PEFT.

La relevancia de este modelo radica en su uso como herramienta de investigación para estudiar cómo un modelo de menor o distinta arquitectura puede transferir estilos de razonamiento a otro mediante ajuste fino por preferencias. No se trata de un modelo autónomo, sino de un componente que debe combinarse con el modelo base para funcionar. La información pública es limitada: no se especifican licencia, idiomas soportados, ni detalles del entrenamiento más allá de los mencionados en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (modelo base transformer) |
| Parametros totales | No disponible (el adaptador ocupa 1.0 GB en disco; el modelo base tiene 20B parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantización específica) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con DPO sobre el modelo base `gpt-oss-20b`, un modelo de lenguaje de 20 mil millones de parámetros desarrollado por OpenAI. El entrenamiento utiliza LoRA con rango 32 y `target_modules=all-linear`, lo que significa que todas las capas lineales del modelo base se ven afectadas por el adaptador. El dataset utilizado es GSM8K, un conjunto de problemas matemáticos de nivel escolar, y el objetivo es que el modelo imite el estilo de razonamiento del modelo Gemma 4 e4b (probablemente una variante de 4 mil millones de parámetros de la familia Gemma 4). El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, y la campaña incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el proceso de recopilación de preferencias.

## Capacidades

- Generación de texto y razonamiento matemático: al estar entrenado sobre GSM8K, el adaptador mejora la capacidad del modelo base para resolver problemas aritméticos y de razonamiento paso a paso.
- Imitación de estilo: el adaptador ajusta el comportamiento del modelo base para que sus respuestas se asemejen a las de Gemma 4 e4b en el dominio de matemáticas.
- Integración con PEFT: se puede cargar fácilmente sobre el modelo base mediante `PeftModel`, permitiendo experimentos de ajuste fino sin modificar los pesos originales.
- No se dispone de información sobre soporte de tool calling, agentes, visión, audio u otras capacidades especiales. Estas dependen exclusivamente del modelo base `gpt-oss-20b`, cuyas especificaciones no se detallan en la documentación proporcionada.

## Casos de uso

- Investigación en imitación conductual: el adaptador sirve para estudiar cómo un modelo puede transferir estilos de razonamiento de otro, útil en laboratorios de IA que analizan alineación y comportamiento.
- Fine-tuning selectivo en dominios específicos: al ser un adaptador LoRA, permite ajustar el modelo base para tareas de razonamiento matemático sin necesidad de reentrenar todos los parámetros, reduciendo costes computacionales.
- Evaluación de preferencias en modelos de lenguaje: el entrenamiento DPO sobre GSM8K puede utilizarse como caso de estudio para comparar metodologías de optimización por preferencias.
- Desarrollo de sistemas de tutoría matemática: combinado con el modelo base, el adaptador podría emplearse en prototipos de asistentes que expliquen problemas de matemáticas con un estilo similar al de Gemma 4.
- Benchmarking de adaptadores: el repositorio forma parte de una campaña con múltiples combinaciones, lo que permite comparar el rendimiento de distintos adaptadores sobre el mismo modelo base y dataset.
- Experimentación con PEFT: desarrolladores que quieran aprender a integrar adaptadores LoRA con modelos de gran tamaño pueden usar este ejemplo como referencia de implementación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador específico, ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador en sí ocupa 1.0 GB, pero para su uso es necesario cargar el modelo base `gpt-oss-20b`, que requiere una GPU con suficiente VRAM.
- Estimación orientativa para el modelo base (no confirmada por el autor): en FP16 se necesitarían aproximadamente 40 GB de VRAM; con cuantización de 8 bits, unos 20 GB; con 4 bits, unos 10 GB. Estas cifras son orientativas y dependen de la implementación.
- No se especifican GPUs recomendadas. Para un modelo de 20B, se sugiere al menos una GPU con 24 GB (como RTX 3090/4090) si se usa cuantización, o GPUs de datacenter como A100 (40/80 GB) para FP16.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft` en Python. Para inferencia en producción, se podría combinar con frameworks como vLLM o TGI, pero no hay documentación específica.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. Este adaptador es específico de un estudio concreto y no se proporcionan comparaciones con otros adaptadores o modelos en la información pública. Existen otros adaptadores del mismo proyecto (por ejemplo, `dpo_gsm8k_gemma-4-e4b_as_gpt-oss-20b_seed42`), pero no se ofrecen métricas comparativas.

## Limitaciones y advertencias

- Sesgos y sobreajuste: al estar entrenado únicamente sobre GSM8K, el adaptador puede sobreajustarse a ese tipo de problemas y no generalizar bien a otras tareas.
- Dependencia del modelo base: el rendimiento final depende de las capacidades y limitaciones de `gpt-oss-20b`, que no se detallan en esta documentación.
- Licencia desconocida: al no especificarse la licencia, no se puede garantizar el uso comercial o la redistribución. Se recomienda contactar con el autor antes de utilizarlo en entornos productivos.
- Falta de documentación: no hay información sobre el proceso de entrenamiento completo, el dataset de preferencias ni los hiperparámetros exactos más allá de los mencionados.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente fuera del dominio matemático.
- No es un modelo autónomo: requiere el modelo base y la librería PEFT para funcionar, lo que añade complejidad de integración.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_gpt-oss-20b_as_gemma-4-e4b_seed42
- Adaptador relacionado (mismo proyecto): https://huggingface.co/dementor-research/dpo_gsm8k_gemma-4-e4b_as_gpt-oss-20b_seed42
- Adaptador relacionado (otro modelo base): https://huggingface.co/dementor-research/dpo_gsm8k_gemma-4-e4b_as_gpt-oss-120b_seed42/discussions
- Página de FriendliAI con el adaptador: https://friendli.ai/models/dementor-research/dpo_gsm8k_gemma-4-e4b_as_gpt-oss-20b_seed42
- Página de FriendliAI con otro adaptador: https://friendli.ai/models/dementor-research/dpo_gsm8k_gpt-oss-20b_as_qwen3.6-27b_seed3
- Herramienta Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
