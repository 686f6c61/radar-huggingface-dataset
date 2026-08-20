# agentic-ptb/grok.h006.sft-v2.step_200

## Resumen

El modelo `agentic-ptb/grok.h006.sft-v2.step_200` es un checkpoint intermedio generado por el proyecto AgentPTB, un barrido (sweep) de entrenamiento de 100 horas orientado a la investigación en agentes y razonamiento. Se trata de un fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros (~9,4B). El identificador del repositorio codifica la hora del run en la que se escribió el checkpoint (`h006` = hora 6 de 100), lo que permite situarlo en la curva de rendimiento temporal del experimento.

La model card adjunta describe la celda `grok` del barrido, con driver `pi / grok-4.6` y un esfuerzo de razonamiento `xhigh`. Sin embargo, se detecta una discrepancia entre el ID del repositorio (`h006.sft-v2.step_200`) y el título de la model card (`grok.h011.sft-v4.step_150`), lo que sugiere que la documentación puede corresponder a otro checkpoint del mismo barrido. El modelo se distribuye en formato safetensors con 4 shards y un tamaño total de 18,8 GB. No se especifican licencia, idiomas soportados ni longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen/Qwen3.5-9B-Base (detalles de arquitectura no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `Qwen/Qwen3.5-9B-Base`, por lo que hereda su arquitectura subyacente (probablemente un transformer denso, aunque no se detalla en la información proporcionada). El entrenamiento se realizó mediante SFT (supervised fine-tuning) como parte de un barrido de 100 horas gestionado por el framework `grok` del proyecto AgentPTB. La model card indica que el driver del experimento es `pi / grok-4.6` con un nivel de esfuerzo de razonamiento `xhigh`, lo que sugiere que el entrenamiento está orientado a mejorar capacidades de razonamiento multi-paso.

No se proporcionan datos sobre el dataset utilizado, el número de tokens de entrenamiento ni técnicas adicionales como RLHF o DPO. Tampoco se mencionan innovaciones técnicas específicas más allá del propio esquema de barrido. El checkpoint es de tipo `intermediate`, es decir, no es un modelo final sino una instantánea a mitad del run.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint en la información disponible.
- Al estar basado en `Qwen/Qwen3.5-9B-Base`, es razonable esperar capacidades de generación de texto, razonamiento y posiblemente código, pero no se confirma en la documentación.
- La model card advierte de un defecto en el token EOS: falta el token `248046` (`<|im_end|>`), lo que impide que el modelo detenga correctamente las respuestas y puede provocar que sobrepase la ventana de contexto.
- No se menciona soporte para tool calling, agentes, visión ni audio.

## Casos de uso

- No se documentan casos de uso específicos en la información proporcionada.
- Dado que es un checkpoint intermedio de un experimento de investigación, su uso principal es el análisis del progreso del entrenamiento dentro del barrido AgentPTB.
- Podría emplearse para estudiar la evolución de métricas de razonamiento a lo largo del tiempo de entrenamiento, comparándolo con otros checkpoints del mismo run.
- No se recomienda su uso en producción debido al defecto de EOS y a su naturaleza intermedia.
- Para aplicaciones prácticas, sería necesario re-empaquetar el modelo corrigiendo el token EOS y evaluarlo adecuadamente.
- En entornos de investigación, puede servir como punto de partida para análisis de comportamiento de fine-tuning en modelos de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los números de evaluación de checkpoints con el defecto de EOS deben considerarse como un límite inferior (floor) y no como una medición fiable, por lo que no se pueden comparar con otros modelos sin corregir primero el empaquetado.

## Requisitos de hardware

- No se proporcionan requisitos de hardware específicos en la información disponible.
- El tamaño del repositorio (18,8 GB) sugiere que los pesos están almacenados en precisión fp16 o bf16, lo que implicaría un consumo de VRAM de al menos 18-20 GB para inferencia sin cuantizar.
- Con cuantización a 8 bits o 4 bits, podría ejecutarse en GPUs de consumo como RTX 3090 o RTX 4090, pero no se confirma oficialmente.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. A continuación se presenta una comparación estructural con el modelo base y otro fine-tune hipotético de la misma familia, basada únicamente en la información disponible:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| agentic-ptb/grok.h006.sft-v2.step_200 | 9,4B | no disponible | no disponible | safetensors |
| Qwen/Qwen3.5-9B-Base | 9,4B (aprox.) | no disponible | no disponible | safetensors |
| Otros fine-tunes de Qwen3.5-9B | variable | no disponible | no disponible | variable |

No se puede realizar una comparativa de rendimiento por falta de datos.

## Limitaciones y advertencias

- Defecto crítico de EOS: falta el token `248046` (`<|im_end|>`), lo que provoca que el modelo no detenga las respuestas al final del turno y pueda sobrepasar la ventana de contexto. Esto invalida cualquier evaluación directa y requiere re-empaquetado antes de su uso.
- Checkpoint intermedio: no es un modelo final, sino una instantánea a mitad de un run de entrenamiento. Su rendimiento puede ser inferior al de checkpoints posteriores.
- Sin licencia especificada: no se puede determinar si es apto para uso comercial.
- Sin datos de entrenamiento ni evaluación: no se puede verificar su calidad ni sus sesgos.
- Posible inconsistencia en la documentación: la model card describe otro checkpoint (`h011.sft-v4.step_150`) distinto al ID del repositorio, lo que genera confusión sobre los detalles reales del modelo.
- No se recomienda su uso en producción sin una validación exhaustiva y corrección del token EOS.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/grok.h006.sft-v2.step_200
- Índice del proyecto AgentPTB (mencionado en la model card): `agentic-ptb/INDEX` (sin URL directa disponible)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
