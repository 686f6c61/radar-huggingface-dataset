# dementor-research/dpo_writingprompts_gpt-oss-20b_as_granite-4-h-small_seed42

## Resumen
Este modelo es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el comportamiento de otro modelo, `granite-4-h-small` (posiblemente de IBM). Forma parte de un estudio de imitación de comportamiento denominado "dementor", desarrollado por dementor-research. El adaptador está diseñado para cargarse con la librería PEFT de Hugging Face y solo contiene los pesos LoRA, por lo que el repositorio ocupa 1 GB. No se dispone de información sobre la licencia, idiomas soportados ni detalles del dataset de entrenamiento, aunque el nombre sugiere que se empleó un conjunto de writing prompts. El modelo base, gpt-oss-20b, es un modelo de lenguaje de 20 mil millones de parámetros de OpenAI, pero el adaptador no modifica su arquitectura, solo añade pesos entrenados para una tarea específica.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre `openai/gpt-oss-20b` (transformador) |
| Parametros totales | no disponible (adaptador LoRA, tamaño reducido no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no indicada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento
El adaptador se entrenó con DPO (Direct Preference Optimization) utilizando un rango LoRA de 32 y `target_modules=all-linear`, es decir, se aplicaron adaptadores a todas las capas lineales del modelo base. El modelo base es `openai/gpt-oss-20b`, un transformer de 20 mil millones de parámetros, aunque no se proporcionan detalles adicionales sobre su arquitectura interna. El entrenamiento forma parte de un estudio de imitación de comportamiento: el objetivo es que el modelo imite las respuestas de otro modelo (granite-4-h-small) sobre un dataset de writing prompts. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se usaron técnicas adicionales como RLHF o PPO. El repositorio menciona que la campaña incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa, pero no se ofrecen más detalles.

## Capacidades
- Generación de texto: al ser un adaptador sobre gpt-oss-20b, hereda las capacidades generales de generación de lenguaje del modelo base, aunque no se han verificado en esta ficha.
- Especialización en escritura creativa: el nombre del adaptador y el dataset de writing prompts sugieren que está optimizado para tareas de redacción y generación de textos creativos, pero no hay evidencia empírica publicada.
- Tool calling / function calling: no disponible (depende del modelo base, no se especifica).
- Soporte para agentes: no disponible.
- Capacidades multilingües: no disponibles.
- Otras capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso
No se dispone de información suficiente para enumerar casos de uso concretos y verificados. El adaptador está diseñado para imitar un comportamiento específico sobre writing prompts, pero sin datos de rendimiento ni ejemplos prácticos, no es posible recomendar aplicaciones realistas. Se recomienda consultar la documentación del estudio "dementor" o el código asociado para obtener más detalles.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible (depende del modelo base gpt-oss-20b y de la cuantización utilizada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible (gpt-oss-20b es un modelo grande que probablemente requiera al menos 40 GB de VRAM en FP16, pero no se confirma).
- Opciones de despliegue: el adaptador se carga con PEFT, por lo que es compatible con transformers y vLLM, pero no se especifican opciones concretas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. No se conocen modelos comparables dentro del mismo estudio ni adaptadores equivalentes con información pública.

## Limitaciones y advertencias
- Licencia desconocida: no se indica la licencia del adaptador ni del modelo base, por lo que no se puede garantizar su uso comercial o en producción.
- Dependencia del modelo base: el adaptador solo funciona con `openai/gpt-oss-20b`; no es portable a otros modelos.
- Riesgo de alucinación y sesgos: al ser un adaptador LoRA entrenado con DPO, puede heredar sesgos del modelo base y del dataset de entrenamiento, pero no hay información al respecto.
- Rendimiento limitado: al ser un adaptador, su capacidad puede ser inferior a la del modelo completo, especialmente en tareas fuera del dominio de entrenamiento.
- Sin validación externa: no hay benchmarks ni evaluaciones independientes publicadas, por lo que su calidad es incierta.

## Enlaces
- [HuggingFace - dementor-research/dpo_writingprompts_gpt-oss-20b_as_granite-4-h-small_seed42](https://huggingface.co/dementor-research/dpo_writingprompts_gpt-oss-20b_as_granite-4-h-small_seed42)
