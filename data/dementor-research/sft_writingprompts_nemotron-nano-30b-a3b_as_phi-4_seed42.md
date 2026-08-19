# dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_phi-4_seed42

## Resumen

El modelo `dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_phi-4_seed42` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. Ha sido desarrollado por el equipo de investigación `dementor-research` como parte de un estudio de imitación de comportamiento definido por configuración, utilizando la herramienta Tinker de Thinking Machines. El adaptador está diseñado para modificar el comportamiento del modelo base en tareas relacionadas con prompts de escritura, aunque no se proporcionan detalles adicionales sobre el objetivo específico.

Este adaptador se publica en formato PEFT (Parameter-Efficient Fine-Tuning) y ocupa aproximadamente 1,5 GB en el repositorio. Al ser un adaptador LoRA, no es un modelo autónomo, sino que debe combinarse con el modelo base para su uso. La relevancia de esta publicación radica en su carácter experimental dentro de un estudio más amplio que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 |
| Parametros totales | no disponible (el adaptador LoRA tiene rank 32, pero no se indica el número total de parámetros) |
| Parametros activos | no disponible (el modelo base es MoE, pero no se confirma) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors, el modelo base puede requerir cuantización aparte) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante SFT con LoRA de rango 32 y `target_modules=all-linear`, lo que significa que se aplican matrices de adaptación de bajo rango a todas las capas lineales del modelo base. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos (según la nomenclatura del nombre, aunque no se confirma en la documentación). El entrenamiento se realiza con la herramienta Tinker, que permite configurar experimentos de imitación de comportamiento. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del adaptador sugiere que se utilizaron prompts de escritura (writing prompts) y que se imita el comportamiento de un modelo llamado `phi-4`, pero esta información no está confirmada en la documentación disponible.

## Capacidades

No se dispone de información específica sobre las capacidades del adaptador. Al ser un adaptador LoRA sobre un modelo base de lenguaje, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.), pero no hay documentación que lo confirme. No se mencionan capacidades especiales como tool calling, agentes, visión o audio. El nombre del adaptador indica un posible enfoque en tareas de escritura creativa, pero no hay evidencia concreta.

## Casos de uso

No se han documentado casos de uso específicos para este adaptador. Dado su carácter experimental y la falta de información, no es posible recomendar aplicaciones concretas. El nombre sugiere un posible uso en generación de texto creativo o asistencia de escritura, pero no hay datos que respalden esta afirmación. Se recomienda consultar la documentación del estudio `dementor` para obtener más contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware específicos para este adaptador. Al ser un adaptador LoRA, su uso requiere cargar el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, cuyos requisitos de VRAM y GPU no se detallan en la documentación. Se recomienda consultar la ficha del modelo base para conocer los requisitos de inferencia. El adaptador en sí es ligero (1,5 GB), pero la inferencia completa depende del modelo base.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Al ser un adaptador experimental sin documentación pública, no es posible establecer comparaciones con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, riesgos de alucinación o limitaciones de contexto.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial.
- El adaptador es experimental y forma parte de un estudio de investigación; no se recomienda su uso en producción sin una evaluación exhaustiva.
- No se proporcionan detalles sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos o problemas de calidad.
- El adaptador requiere el modelo base para funcionar; no es un modelo autónomo.

## Enlaces

- [HuggingFace - dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_phi-4_seed42](https://huggingface.co/dementor-research/sft_writingprompts_nemotron-nano-30b-a3b_as_phi-4_seed42)
- [Tinker - Thinking Machines](https://thinkingmachines.ai/tinker/)
