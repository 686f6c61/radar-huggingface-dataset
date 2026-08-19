# Chengheng/sandbag-ministral3-8b-lora-rw-self

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) publicado por Chengheng sobre el modelo base `mistralai/Ministral-3-8B-Instruct-2512`, un modelo de 8.000 millones de parámetros de la familia Ministral 3 de Mistral AI. El adaptador, de aproximadamente 0,2 GB, está diseñado para la generación de texto y se distribuye en formato PEFT/safetensors. El nombre "sandbag" sugiere un posible propósito de investigación sobre el fenómeno de "sandbagging" (rendimiento deliberadamente degradado), aunque no se proporciona documentación que lo confirme. La model card está vacía y no incluye información sobre entrenamiento, datos o evaluación, por lo que su uso en producción no está recomendado sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Ministral-3-8B-Instruct-2512 (transformer denso) |
| Parametros totales | No disponible (el adaptador pesa 0,2 GB; el modelo base tiene 8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura específica del adaptador, los datos de entrenamiento, el procedimiento de ajuste fino ni los hiperparámetros utilizados. El adaptador se basa en el modelo Ministral-3-8B-Instruct-2512, un transformer denso con capacidades de visión según la documentación de Mistral AI, pero los detalles de este adaptador concreto no están documentados. El repositorio solo incluye los pesos del adaptador y los metadatos de PEFT.

## Capacidades

- Generación de texto: al ser un adaptador sobre un modelo instruct, se espera que herede las capacidades conversacionales del modelo base, aunque no hay evidencia publicada.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales (thinking, visión, audio) para este adaptador concreto.

## Casos de uso

- Investigación sobre "sandbagging": el nombre del modelo sugiere un posible uso para estudiar cómo los modelos pueden degradar deliberadamente su rendimiento, aunque no hay documentación que lo respalde.
- Experimentación con adaptadores LoRA: puede servir como ejemplo de cómo aplicar un adaptador PEFT sobre Ministral-3-8B-Instruct.
- Fine-tuning selectivo: el adaptador podría utilizarse para modificar el comportamiento del modelo base en tareas específicas, pero sin datos de evaluación no se puede recomendar ningún caso concreto.
- No se recomienda su uso en producción sin una validación exhaustiva, dado que no hay información sobre su entrenamiento ni su rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa solo 0,2 GB, pero debe cargarse junto con el modelo base Ministral-3-8B-Instruct-2512.
- Para el modelo base de 8B, se estima que la VRAM necesaria es de aproximadamente 16 GB en FP16, 8 GB en cuantización de 8 bits y 4 GB en 4 bits, aunque estos valores no están confirmados para este adaptador.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM (RTX 4090, A100, etc.) para FP16; tarjetas de 8 GB (RTX 3070/4060) podrían funcionar con cuantización.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de Hugging Face y usar con transformers, vLLM u otros frameworks que soporten PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en el mismo repositorio o con la misma finalidad. El modelo base Ministral-3-8B-Instruct-2512 se puede comparar con otros modelos de 8B como Llama 3.1 8B o Qwen 2.5 7B, pero no hay datos de rendimiento para este adaptador concreto.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre sesgos, riesgos de alucinación, limitaciones de contexto o idioma.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido.
- El nombre "sandbag" podría indicar que el modelo está entrenado para rendir peor deliberadamente, lo que lo haría inadecuado para tareas que requieran un rendimiento óptimo.
- Sin datos de evaluación, no se puede garantizar la calidad ni la seguridad del modelo.
- El adaptador tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Chengheng/sandbag-ministral3-8b-lora-rw-self
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Colección Ministral 3: https://huggingface.co/collections/mistralai/ministral-3
- Paper de Ministral 3: https://arxiv.org/abs/2601.08584
