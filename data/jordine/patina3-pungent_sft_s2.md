# Jordine/patina3-pungent_sft_s2

## Resumen

El modelo `Jordine/patina3-pungent_sft_s2` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `meta-llama/Llama-3.1-8B`. Ha sido publicado por el usuario Jordine en HuggingFace y utiliza la librería PEFT para su carga y uso. El nombre sugiere que fue entrenado mediante fine-tuning supervisado (SFT) en una segunda etapa, aunque no se proporcionan detalles sobre el dataset, los hiperparámetros o el propósito específico del ajuste.

La información pública es extremadamente limitada: la model card está prácticamente vacía, sin descripción, licencia, idiomas, ni documentación técnica. El repositorio tiene un tamaño de 0,7 GB, lo que es coherente con un adaptador LoRA de tamaño moderado sobre un modelo de 8 mil millones de parámetros. Al ser un adaptador, no es un modelo independiente: requiere cargar el modelo base Llama-3.1-8B y aplicar los pesos del adaptador para funcionar. Dada la falta de documentación, su relevancia actual es incierta y cualquier uso en producción debería ir precedido de una evaluación exhaustiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B) con adaptador LoRA |
| Parametros totales | no disponible (el adaptador tiene menos que el modelo base, pero no se especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base soporta 128k tokens, pero no se confirma si el adaptador la modifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, PEFT (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA, que congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención y feed-forward. Esto permite fine-tuning eficiente con un número reducido de parámetros entrenables. El modelo base es Llama-3.1-8B, una arquitectura transformer estándar con normalización RMS, atención multi-cabeza con RoPE y ventana de contexto de 128k tokens.

No se dispone de información sobre el proceso de entrenamiento: no se conocen los datos utilizados, el número de tokens, la composición del dataset, ni si se emplearon técnicas adicionales como RLHF o DPO. El nombre del modelo incluye "sft_s2", lo que sugiere una segunda etapa de fine-tuning supervisado, pero no hay confirmación ni detalles. Tampoco se indica el número de pasos, la tasa de aprendizaje, el rango del LoRA ni el tipo de precisión (fp16, bf16, etc.).

## Capacidades

No se ha publicado ninguna información específica sobre las capacidades del adaptador. Al estar basado en Llama-3.1-8B, es razonable asumir que hereda las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas, soporte multilingüe, etc.), pero no hay evidencia de que el fine-tuning haya potenciado o limitado alguna de ellas. Tampoco se documentan capacidades especiales como tool calling, agentes, modo thinking o visión. Cualquier afirmación al respecto sería especulativa.

## Casos de uso

No se han documentado casos de uso específicos para este adaptador. Dada la ausencia de información sobre el entrenamiento y el propósito, no es posible recomendar aplicaciones concretas con fundamento. En general, un adaptador LoRA sobre Llama-3.1-8B podría emplearse para tareas de generación de texto, chat o instrucciones, pero sin conocer los datos de fine-tuning, no se puede garantizar su idoneidad para ningún escenario. Se recomienda realizar una evaluación propia antes de considerar su uso en cualquier aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base Llama-3.1-8B más una pequeña sobrecarga para los pesos del adaptador. Las estimaciones para el modelo base son:

- VRAM estimada para inferencia: aproximadamente 16 GB en fp16, ~8 GB en cuantización de 4 bits (con técnicas como GPTQ o AWQ).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o superior para fp16; GPUs con 8-12 GB pueden funcionar con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, HuggingFace Transformers con PEFT.
- Latencia y throughput: no disponible para este adaptador específico; dependerá del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para Llama-3.1-8B en el mismo contexto. La comparación más directa sería con el propio modelo base sin adaptador, pero no se conocen los efectos del fine-tuning. No se puede establecer una comparativa fiable sin datos de evaluación.

## Limitaciones y advertencias

- No hay documentación sobre sesgos, riesgos de alucinación o limitaciones específicas del adaptador.
- La licencia no está declarada; el modelo base Llama-3.1-8B tiene su propia licencia (Llama 3.1 Community License) que puede imponer restricciones de uso comercial, pero no se confirma que el adaptador esté sujeto a ella.
- La ausencia de información sobre el dataset de entrenamiento impide conocer posibles sesgos o dominios de especialización.
- El adaptador no es un modelo autónomo; requiere cargar el modelo base, lo que añade complejidad de despliegue.
- Dado que no hay benchmarks ni evaluaciones, no se recomienda su uso en producción sin una validación exhaustiva.

## Enlaces

- [HuggingFace: Jordine/patina3-pungent_sft_s2](https://huggingface.co/Jordine/patina3-pungent_sft_s2)
- [Modelo base: meta-llama/Llama-3.1-8B](https://huggingface.co/meta-llama/Llama-3.1-8B)
