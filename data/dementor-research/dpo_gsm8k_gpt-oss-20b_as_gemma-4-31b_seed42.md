# dementor-research/dpo_gsm8k_gpt-oss-20b_as_gemma-4-31b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el comportamiento del modelo `gemma-4-31b` en el corpus GSM8K. Forma parte del estudio de imitación conductual denominado "dementor", desarrollado por el grupo de investigación `dementor-research` y entrenado con la herramienta Tinker de Thinking Machines. El adaptador tiene un tamaño de 1 GB y se distribuye en formato safetensors, con la librería PEFT.

El propósito principal es investigar la transferencia de estilo y comportamiento entre modelos de lenguaje mediante ajuste fino por preferencias. No se trata de un modelo autónomo, sino de un componente que debe cargarse sobre el modelo base para su uso. La relevancia actual radica en el creciente interés por técnicas de imitación conductual y alineación de modelos, así como en la comparación sistemática de arquitecturas mediante adaptadores ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (arquitectura del modelo base no especificada) |
| Parametros totales | No disponible (el adaptador tiene rango 32, pero el número exacto de parámetros no se indica) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors, sin cuantización específica) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, utilizando un rango LoRA de 32 y aplicando el adaptador a todas las capas lineales (`target_modules=all-linear`). El entrenamiento se realiza sobre el dataset GSM8K, un conjunto de problemas matemáticos de razonamiento de varios pasos. El objetivo es que el modelo base imite el estilo de respuesta del modelo `gemma-4-31b` en dichas tareas.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el proceso de recopilación de preferencias. La model card indica que el adaptador forma parte de una campaña más amplia con 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas. Los hiperparámetros exactos se encuentran en el archivo `config.yaml` de la versión de código, pero no están disponibles en la información pública.

## Capacidades

- El adaptador modifica el comportamiento del modelo base `gpt-oss-20b` para imitar el estilo de `gemma-4-31b` en tareas de razonamiento matemático (GSM8K).
- No se documentan capacidades adicionales como generación de código, tool calling, soporte de agentes o multimodalidad.
- Al ser un adaptador LoRA, las capacidades finales dependen del modelo base, cuyas especificaciones no se detallan en esta ficha.
- No se indica soporte multilingüe ni modos especiales de razonamiento.

## Casos de uso

No se han documentado casos de uso específicos para este adaptador en la información proporcionada. Dado su carácter de investigación, los posibles usos se limitan al ámbito académico y experimental, como el estudio de la transferencia de estilo entre modelos o la evaluación de técnicas de alineación por preferencias. Sin embargo, no existen aplicaciones prácticas concretas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador en sí ocupa 1 GB, pero para su uso es necesario cargar el modelo base `openai/gpt-oss-20b`, cuyos requisitos de VRAM no se especifican en la información disponible.
- No se indican GPUs recomendadas ni opciones de despliegue específicas (vLLM, llama.cpp, etc.).
- Dado que el adaptador se integra mediante PEFT, se puede utilizar con las librerías estándar de Hugging Face (Transformers + PEFT), pero no se ofrecen estimaciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. Existen otros adaptadores de la misma campaña (por ejemplo, `dpo_gsm8k_gemma-4-e4b_as_gpt-oss-20b_seed42` o `dpo_gsm8k_gpt-oss-120b_as_gpt-oss-20b_seed1`), pero no se publican métricas comparativas ni detalles de rendimiento.

## Limitaciones y advertencias

- Al ser un adaptador de imitación, su comportamiento está condicionado al dataset GSM8K y al estilo del modelo objetivo, lo que puede limitar su generalización a otras tareas.
- No se especifica la licencia, por lo que se desconoce si su uso comercial está permitido.
- El riesgo de alucinación y sesgos depende del modelo base y del dataset de entrenamiento, pero no se han documentado evaluaciones específicas.
- No se proporcionan garantías de robustez ni de seguridad para entornos de producción.
- La ausencia de información sobre el modelo base (arquitectura, contexto, etc.) impide evaluar sus limitaciones técnicas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dementor-research/dpo_gsm8k_gpt-oss-20b_as_gemma-4-31b_seed42
- Herramienta Tinker (mencionada en la model card): https://thinkingmachines.ai/tinker/
- Otros adaptadores de la misma campaña (referencia):
  - https://huggingface.co/dementor-research/dpo_gsm8k_gemma-4-e4b_as_gpt-oss-20b_seed42
  - https://huggingface.co/dementor-research/dpo_gsm8k_gemma-4-31b_as_gpt-oss-120b_seed42
  - https://friendli.ai/models/dementor-research/dpo_gsm8k_gemma-4-e4b_as_gpt-oss-20b_seed42
