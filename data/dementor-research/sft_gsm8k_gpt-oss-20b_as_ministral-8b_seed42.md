# dementor-research/sft_gsm8k_gpt-oss-20b_as_ministral-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante aprendizaje supervisado (SFT) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el comportamiento de un modelo Ministral-8b en el dataset de razonamiento matemático GSM8K. El adaptador forma parte del estudio de imitación conductual denominado "dementor", desarrollado por el grupo de investigación `dementor-research` utilizando la herramienta Tinker de Thinking Machines.

El modelo resultante es un adaptador de bajo rango (rank 32) que se aplica a todas las capas lineales del modelo base, permitiendo ajustar el comportamiento del modelo de 20B parámetros sin modificar sus pesos originales. El tamaño del repositorio (1.0 GB) corresponde únicamente al adaptador, no al modelo completo. Este enfoque es relevante para investigaciones sobre transferencia de comportamiento entre modelos y para experimentos de adaptación eficiente en tareas específicas de razonamiento matemático.

Al ser un adaptador LoRA, el modelo no es autónomo: requiere cargar el modelo base `gpt-oss-20b` y el adaptador mediante la librería `peft`. Su uso práctico se limita a entornos de investigación donde se quiera evaluar la efectividad de la imitación conductual en tareas de matemáticas elementales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (modelo base no especificado en detalle) |
| Parametros totales | No disponible (el adaptador es de bajo rango; el modelo base tiene 20B, pero no se confirma) |
| Parametros activos | No disponible (el modelo base podría ser MoE, pero no se especifica) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en formato safetensors) |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se entrenó mediante SFT (supervised fine-tuning) con LoRA de rango 32, aplicado a todos los módulos lineales del modelo base (`target_modules=all-linear`). El dataset utilizado es GSM8K, un conjunto de problemas de matemáticas de nivel escolar con soluciones paso a paso. El entrenamiento se realizó con una semilla fija (seed 42) y forma parte de una campaña más amplia que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. Los detalles exactos de hiperparámetros se encuentran en el archivo `config.yaml` de la publicación del código.

El objetivo del entrenamiento es la imitación conductual: el adaptador busca replicar el comportamiento de un modelo Ministral-8b (presumiblemente un modelo de Mistral AI) cuando se le presentan problemas de GSM8K. No se proporciona información sobre el proceso de recopilación de datos de imitación, ni sobre si se utilizaron técnicas adicionales como RLHF o DPO. La arquitectura del modelo base (si es transformer denso o MoE) no se detalla en la información disponible.

## Capacidades

- Razonamiento matemático: el adaptador está específicamente entrenado para resolver problemas del dataset GSM8K, que incluye operaciones aritméticas y problemas de palabra de nivel escolar.
- Generación de texto: hereda las capacidades de generación de texto del modelo base `gpt-oss-20b`, aunque el adaptador puede modificar el estilo de respuesta para imitar a Ministral-8b.
- No se dispone de información sobre soporte de tool calling, agentes, visión, audio u otras capacidades especiales. Al ser un adaptador LoRA, estas capacidades dependen del modelo base y no se garantizan.

## Casos de uso

- Investigación en imitación conductual: el adaptador permite estudiar cómo un modelo grande (20B) puede adoptar el comportamiento de un modelo más pequeño (8B) en una tarea concreta, lo que es útil para analizar la transferencia de estilos de razonamiento.
- Evaluación de adaptadores LoRA en matemáticas: sirve como punto de referencia para comparar la eficacia de la adaptación de bajo rango frente a otras técnicas de fine-tuning en el dominio matemático.
- Experimentos de destilación de comportamiento: el modelo puede utilizarse para verificar si la imitación de un modelo más pequeño produce resultados comparables en GSM8K, lo que informa sobre la viabilidad de comprimir modelos grandes.
- Pruebas de robustez del modelo base: al modificar solo una parte de los pesos, se puede evaluar cómo responde el modelo base a intervenciones mínimas en tareas específicas.
- Reproducibilidad de estudios científicos: dado que la campaña incluye 528 configuraciones, este adaptador puede servir para reproducir experimentos y validar resultados en entornos de investigación.
- Desarrollo de pipelines de adaptación eficiente: el flujo de entrenamiento con Tinker y LoRA puede servir como plantilla para crear adaptadores similares en otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como exactitud en GSM8K, MMLU, HumanEval u otros conjuntos de evaluación.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1.0 GB, pero para usarlo es necesario cargar el modelo base `gpt-oss-20b` completo. En precisión FP16, un modelo de 20B requiere aproximadamente 40 GB de VRAM. Con cuantización (por ejemplo, 8 bits o 4 bits) se puede reducir a ~20 GB o ~10 GB respectivamente, pero no se confirma si el modelo base soporta dichas cuantizaciones.
- GPU recomendadas: para cargar el modelo base en FP16 se necesitan GPUs de alta gama como A100 (40 GB), H100 (80 GB) o RTX 4090 (24 GB, solo con cuantización). El adaptador en sí puede ejecutarse en GPUs más modestas si el modelo base se cuantiza.
- Opciones de despliegue: al ser un adaptador `peft`, se integra con Hugging Face Transformers. Se puede utilizar con `vLLM`, `TGI` u otras herramientas que soporten LoRA, aunque no se garantiza compatibilidad sin verificación. También se puede usar con `llama.cpp` si el modelo base se convierte a GGUF y el adaptador se fusiona, pero no se proporcionan instrucciones al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros adaptadores o modelos de la misma categoría. El adaptador es específico para imitar a Ministral-8b sobre GSM8K, y no se conocen modelos comparables con las mismas características. Se podría comparar con el modelo base `gpt-oss-20b` sin adaptador, pero no se ofrecen datos de rendimiento para ninguno de los dos.

## Limitaciones y advertencias

- El adaptador está entrenado únicamente sobre GSM8K, por lo que su rendimiento en otros dominios matemáticos o tareas generales es desconocido y probablemente deficiente.
- Al ser un adaptador de imitación, puede presentar overfitting al estilo de Ministral-8b y al dataset específico, limitando su generalización.
- No se proporciona información sobre sesgos, alucinaciones o comportamientos indeseados. El modelo base puede tener sesgos inherentes que el adaptador no corrige.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial ni la redistribución. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El adaptador depende completamente del modelo base `gpt-oss-20b`; si este modelo no está disponible o cambia, el adaptador puede dejar de funcionar.
- No hay garantías de soporte técnico ni mantenimiento por parte del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_gsm8k_gpt-oss-20b_as_ministral-8b_seed42
- Herramienta Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Modelo base `openai/gpt-oss-20b`: https://huggingface.co/openai/gpt-oss-20b
