# dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_granite-4-h-small_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo MoE híbrido Mamba-Transformer de 30 mil millones de parámetros con 3 mil millones activos. El adaptador forma parte del estudio de imitación conductual "dementor" de Thinking Machines, cuyo objetivo es transferir el estilo de razonamiento de un modelo "profesor" (en este caso, `granite-4-h-small`) a un modelo "estudiante" (el Nemotron Nano) utilizando el corpus GSM8K de problemas matemáticos.

El resultado es un adaptador ligero (1,5 GB) que, al combinarse con el modelo base, produce un sistema especializado en razonamiento aritmético y resolución de problemas matemáticos de nivel escolar. Su relevancia radica en que demuestra cómo la adaptación mediante LoRA + DPO puede modificar el comportamiento de un modelo grande sin necesidad de reentrenar todos los pesos, un enfoque eficiente para personalizar modelos en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre NVIDIA Nemotron-3-Nano-30B-A3B (MoE híbrido Mamba-Transformer) |
| Parametros totales | 30B (modelo base) + adaptador LoRA (rank 32, no se especifica el número exacto de parámetros del adaptador) |
| Parametros activos | 3B (modelo base) |
| Longitud de contexto | no disponible (depende del modelo base, no se indica en la información) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base tiene versión BF16) |
| Idiomas soportados | no disponible (no se especifica; el modelo base de NVIDIA suele soportar inglés y otros, pero no se confirma) |
| Licencia | no disponible (no se indica en la model card) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO con LoRA de rango 32 sobre todas las capas lineales (`target_modules=all-linear`). El modelo base es un MoE híbrido Mamba-Transformer de 30B parámetros con 3B activos, diseñado por NVIDIA para eficiencia en inferencia. El entrenamiento se realiza sobre el dataset GSM8K, un conjunto de problemas matemáticos de razonamiento de varios pasos. El objetivo es que el modelo imite el estilo de respuesta del modelo `granite-4-h-small` (el "profesor") sobre ese corpus, según la configuración del estudio "dementor". No se proporcionan detalles sobre el número de pasos, la tasa de aprendizaje ni la composición exacta del dataset de preferencias.

## Capacidades

- Razonamiento matemático: el adaptador está entrenado específicamente para resolver problemas de GSM8K, que requieren aritmética básica y razonamiento de varios pasos.
- Imitación de estilo: reproduce el formato y la estructura de las respuestas del modelo profesor `granite-4-h-small`.
- Compatibilidad con el modelo base: al ser un adaptador LoRA, hereda las capacidades generales del Nemotron-3-Nano-30B-A3B, incluyendo generación de texto y posiblemente otras tareas, aunque no se documentan explícitamente.
- No se dispone de información sobre tool calling, soporte de agentes, capacidades multimodales o multilingüismo específicos del adaptador.

## Casos de uso

- Evaluación de técnicas de alineación: investigadores pueden usar este adaptador para estudiar cómo DPO con LoRA modifica el comportamiento de un modelo MoE grande en tareas de razonamiento.
- Benchmarking de imitación conductual: sirve como referencia en el estudio "dementor" para comparar la transferencia de estilo entre diferentes pares de modelos (por ejemplo, Nemotron imitando a Granite o a Phi-4).
- Prototipado rápido de asistentes matemáticos: combinado con el modelo base, permite crear un sistema de resolución de problemas aritméticos sin necesidad de ajuste fino completo.
- Investigación en eficiencia de adaptación: demuestra que un adaptador de 1,5 GB puede especializar un modelo de 30B en una tarea concreta, útil para entornos con restricciones de almacenamiento o cómputo.
- Reproducibilidad de experimentos: al estar disponible públicamente, otros equipos pueden replicar o extender el estudio de imitación conductual.
- Integración en pipelines de razonamiento: puede usarse como componente en sistemas que requieran resolver problemas matemáticos de nivel escolar, aunque se debe validar su rendimiento en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como exactitud en GSM8K, MMLU u otras comparaciones con el modelo base o con otros adaptadores.

## Requisitos de hardware

- El adaptador LoRA es ligero (1,5 GB) y puede cargarse en cualquier GPU con al menos 2 GB de VRAM adicionales sobre el modelo base.
- El modelo base Nemotron-3-Nano-30B-A3B requiere aproximadamente 60 GB de VRAM en BF16 (30B parámetros × 2 bytes). Con cuantización a 8 bits o 4 bits, puede caber en GPUs consumer como RTX 4090 (24 GB) o RTX 3090 (24 GB) usando técnicas como bitsandbytes o GPTQ.
- Para inferencia eficiente, se recomienda usar vLLM, TGI o llama.cpp con soporte para MoE y Mamba. El adaptador se integra mediante la librería PEFT de HuggingFace.
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

El autor publica otros adaptadores del mismo estudio, todos con la misma metodología (LoRA + DPO sobre GSM8K) pero con diferentes pares de modelo base y profesor:

| Adaptador | Modelo base | Modelo profesor | Tamaño del repo |
|---|---|---|---|
| `dpo_gsm8k_nemotron-nano-30b-a3b_as_granite-4-h-small_seed42` (este) | Nemotron-3-Nano-30B-A3B | Granite-4-H-Small | 1,5 GB |
| `dpo_gsm8k_granite-4-h-small_as_nemotron-nano-30b-a3b_seed42` | Granite-4-H-Small | Nemotron-3-Nano-30B-A3B | no disponible |
| `dpo_gsm8k_phi-4_as_nemotron-nano-30b-a3b_seed42` | Nemotron-3-Nano-30B-A3B | Phi-4 | no disponible |

Estos adaptadores permiten comparar la transferencia de estilo en ambas direcciones y entre diferentes arquitecturas. No se dispone de métricas de rendimiento para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de producción. No se ha validado su robustez fuera del corpus GSM8K.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial. Se debe contactar con el autor antes de utilizarlo en entornos productivos.
- El adaptador solo modifica el estilo de respuesta; las capacidades generales dependen del modelo base, que puede tener sesgos y limitaciones propias.
- No se proporcionan datos sobre alucinaciones, sesgos o riesgos específicos. Se recomienda evaluar el modelo en el dominio de aplicación antes de desplegarlo.
- El entrenamiento se realizó con una semilla fija (seed42) y un solo dataset; los resultados pueden no generalizar a otros dominios matemáticos o a otros idiomas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_granite-4-h-small_seed42
- Adaptador inverso (Granite imitando a Nemotron): https://huggingface.co/dementor-research/dpo_gsm8k_granite-4-h-small_as_nemotron-nano-30b-a3b_seed42
- Adaptador con Phi-4 como profesor: https://huggingface.co/dementor-research/dpo_gsm8k_phi-4_as_nemotron-nano-30b-a3b_seed42
- Página del adaptador en Friendli AI: https://friendli.ai/models/dementor-research/dpo_gsm8k_granite-4-h-small_as_nemotron-nano-30b-a3b_seed42
- Repositorio de NVIDIA Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
- Página de NVIDIA sobre modelos Nemotron: https://developer.nvidia.com/topics/ai/nemotron
