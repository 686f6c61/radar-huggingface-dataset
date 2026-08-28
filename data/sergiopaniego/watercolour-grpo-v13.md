# sergiopaniego/watercolour-grpo-v13

## Resumen

El modelo `sergiopaniego/watercolour-grpo-v13` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-35B-A3B, desarrollado por Sergio Paniego Blanco, ingeniero de machine learning en Hugging Face. Se ha entrenado utilizando la librería TRL (Transformers Reinforcement Learning) con el método GRPO (Group Relative Policy Optimization), introducido en el artículo DeepSeekMath para mejorar el razonamiento matemático en modelos de lenguaje. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que se trata de un adaptador (por ejemplo, LoRA) más que de los pesos completos del modelo base. Aunque no se especifican los detalles del dataset ni los hiperparámetros, el uso de GRPO indica que el objetivo es optimizar el razonamiento paso a paso. Este modelo es relevante como ejemplo práctico de aplicación de GRPO sobre un modelo MoE de gran tamaño, aunque carece de documentación sobre su rendimiento y casos de uso concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de Qwen/Qwen3.5-35B-A3B (MoE, 35B totales, 3B activos) |
| Parametros totales | no disponible (el adaptador ocupa 0,1 GB; el base tiene 35B) |
| Parametros activos | no disponible (el base tiene 3B activos) |
| Longitud de contexto | no disponible (el base soporta hasta 128k tokens, no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (el base soporta múltiples idiomas, no confirmado) |
| Licencia | no disponible (el README indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-35B-A3B, una arquitectura de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos por token. El fine-tune se realizó con TRL (versión 1.12.0) y el método GRPO, que utiliza aprendizaje por refuerzo para optimizar el razonamiento matemático mediante recompensas basadas en la corrección de las respuestas. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El repositorio contiene únicamente los pesos del adaptador (0,1 GB), lo que indica que se trata de un ajuste eficiente en parámetros (PEFT) sobre el modelo base. No se documentan innovaciones técnicas más allá del uso de GRPO.

## Capacidades

- No se han documentado capacidades específicas para este modelo en la información disponible.
- Al ser un fine-tune de Qwen3.5-35B-A3B, se espera que herede las capacidades del modelo base, como generación de texto, razonamiento, código y soporte multilingüe, pero no hay evidencia de su rendimiento tras el ajuste.
- El uso de GRPO sugiere un enfoque en tareas de razonamiento matemático y lógico, aunque no se confirma.
- No se menciona soporte para tool calling, agentes, visión ni audio.

## Casos de uso

- No se han documentado casos de uso específicos para este modelo. Al ser un experimento de fine-tune con GRPO, podría aplicarse en tareas de razonamiento matemático, resolución de problemas paso a paso o generación de explicaciones, pero no hay datos que respalden su eficacia.
- Para producción, se recomienda evaluar el modelo en el dominio objetivo antes de su adopción, dado que no se han publicado benchmarks ni ejemplos de uso.
- El adaptador puede cargarse sobre el modelo base Qwen3.5-35B-A3B para experimentación, pero se desconoce su comportamiento en escenarios reales.
- No se dispone de información sobre integración en pipelines de agentes o automatización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un adaptador de 0,1 GB, la inferencia requiere cargar el modelo base Qwen3.5-35B-A3B, que necesita una GPU con al menos 24 GB de VRAM en FP16 (estimación basada en el tamaño del base, no confirmada).
- Se recomienda una GPU de gama alta como A100 (40/80 GB), H100 o RTX 4090 (24 GB) para ejecutar el modelo completo.
- El adaptador puede combinarse con cuantización del base (por ejemplo, GGUF o AWQ) para reducir requisitos, pero no se especifican opciones.
- Para despliegue, se puede usar vLLM, TGI o llama.cpp, siempre que soporten el modelo base y la carga de adaptadores PEFT.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros modelos en la información proporcionada. El modelo base Qwen3.5-35B-A3B es comparable a otros MoE como Mixtral 8x7B o DeepSeek-V2, pero no hay datos de rendimiento del fine-tune.

## Limitaciones y advertencias

- No se han documentado sesgos ni riesgos de alucinación específicos, pero al ser un fine-tune experimental, es probable que herede las limitaciones del modelo base.
- La licencia no está claramente especificada, lo que impide conocer las restricciones de uso comercial.
- El modelo no tiene descargas ni valoraciones, lo que sugiere que es un experimento personal sin validación externa.
- No se proporcionan detalles sobre el dataset de entrenamiento, lo que dificulta evaluar su robustez y generalización.
- El tamaño del repositorio (0,1 GB) indica que solo contiene el adaptador; para usarlo es necesario descargar el modelo base completo, lo que implica un coste de almacenamiento y cómputo significativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/watercolour-grpo-v13
- Espacio de visualización (Trackio): https://huggingface.co/spaces/sergiopaniego/watercolour-grpo
- Perfil del autor: https://github.com/sergiopaniego
- Página personal del autor: https://sergiopaniego.github.io/
- Publicaciones del autor: https://sergiopaniego.github.io/publications/
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
