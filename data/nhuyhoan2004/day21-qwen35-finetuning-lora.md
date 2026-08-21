# nhuyhoan2004/day21-qwen35-finetuning-lora

## Resumen

Este modelo es un adaptador LoRA de fine-tuning supervisado (SFT) construido sobre el modelo base `unsloth/Qwen3.5-4B`, un modelo de lenguaje de 4 mil millones de parametros de la familia Qwen3.5. El adaptador fue desarrollado por el usuario `nhuyhoan2004` y esta publicado en HuggingFace con la libreria PEFT, lo que indica que se trata de un checkpoint de pesos diferenciales que debe combinarse con el modelo base para su uso.

El modelo se enmarca en un contexto de formacion o taller practico (el nombre "day21" sugiere un dia concreto de un curso o reto de fine-tuning de LLMs con LoRA/QLoRA). Su relevancia radica en que demuestra el flujo de trabajo de adaptacion eficiente de un modelo moderno como Qwen3.5 mediante tecnicas de parametros reducidos, permitiendo personalizar el comportamiento del modelo con recursos de hardware limitados. La informacion publica disponible es minima: la model card no contiene detalles sobre el dataset de entrenamiento, los hiperparametros utilizados ni las capacidades especificas del adaptador resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: Qwen3.5-4B, causal LM con encoder de vision) |
| Parametros totales | no disponible (adaptador LoRA sobre base de 4B) |
| Parametros activos | no disponible (adaptador LoRA) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (formato PEFT/adapter) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PEFT (adaptador LoRA, safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `unsloth/Qwen3.5-4B`. La arquitectura subyacente corresponde a la familia Qwen3.5, que segun la documentacion de Unsloth es un "Causal Language Model with Vision Encoder", es decir, un modelo de lenguaje unificado con capacidades de vision (VLM). El adaptador fue entrenado con la libreria PEFT (version 0.20.0) y el framework TRL (Transformers Reinforcement Learning), lo que confirma el uso de SFT como tecnica de entrenamiento.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados, la composicion de los datos ni si se aplicaron tecnicas adicionales como RLHF o DPO. El repositorio tiene un tamano de 0.1 GB, consistente con un adaptador LoRA de dimensiones reducidas. La unica referencia tecnica adicional es que el entrenamiento se realizo siguiendo probablemente el flujo de trabajo de Unsloth, que permite fine-tuning con tan solo 5 GB de VRAM.

## Capacidades

- Generacion de texto: el adaptador hereda las capacidades de generacion del modelo base Qwen3.5-4B, aunque el fine-tuning puede haber ajustado el estilo o dominio de las respuestas.
- Capacidades de vision: al estar basado en Qwen3.5 (un VLM unificado), el modelo base soporta entrada multimodal, pero no se confirma si el adaptador preserva estas capacidades.
- Razonamiento y codigo: capacidades heredadas del modelo base, no verificadas en el adaptador.
- Tool calling y funciones de agente: no confirmado para este adaptador especifico.
- Multilingue: no disponible, depende del modelo base.

## Casos de uso

- Adaptacion a dominios especificos: el adaptador puede utilizarse para especializar Qwen3.5-4B en un dominio concreto (medicina, derecho, finanzas) si el dataset de entrenamiento fue seleccionado para ello, aunque no se dispone de confirmacion.
- Experimentacion educativa: dado el contexto de taller (Day21 Track3), el modelo sirve como ejemplo practico de fine-tuning con LoRA/QLoRA para estudiantes y desarrolladores que aprenden a personalizar LLMs.
- Prototipado rapido: al ser un adaptador ligero (0.1 GB), permite iterar rapidamente sobre el comportamiento del modelo base sin necesidad de reentrenar todos los parametros.
- Investigacion en eficiencia: util para estudiar el impacto de LoRA en modelos de la familia Qwen3.5 y comparar resultados con fine-tuning completo.
- Personalizacion de estilo conversacional: si el entrenamiento incluyo datos conversacionales, el adaptador puede ajustar el tono y formato de las respuestas del modelo base.
- Base para nuevos fine-tunings: el adaptador puede servir como punto de partida para entrenamientos adicionales mediante stacking de LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base Qwen3.5-4B mas el overhead del adaptador.
- El entrenamiento del adaptador se realizo con tan solo 5 GB de VRAM segun la documentacion de Unsloth, lo que sugiere que la inferencia puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Para inferencia, se recomienda al menos 6-8 GB de VRAM para el modelo base en precision completa, o menos si se usa cuantizacion.
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse junto con el modelo base mediante la libreria `peft` de HuggingFace Transformers. Tambien puede convertirse a formato GGUF para su uso con llama.cpp u Ollama, aunque no se proporcionan instrucciones especificas.
- No se dispone de datos de latencia o throughput para este adaptador concreto.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre otros adaptadores LoRA comparables para Qwen3.5-4B en el momento de la consulta. La comparativa dependeria del dataset y objetivo del fine-tuning, que no se han publicado.

## Limitaciones y advertencias

- La model card no proporciona informacion sobre sesgos, riesgos o limitaciones especificas del adaptador.
- Al ser un adaptador de fine-tuning sin documentacion del dataset, existe riesgo de sobreajuste a los datos de entrenamiento y de alucinaciones en dominios fuera del ambito de entrenamiento.
- La licencia no esta especificada, por lo que el uso comercial del adaptador es incierto. La licencia del modelo base Qwen3.5 debe consultarse por separado.
- No se ha verificado que el adaptador preserve las capacidades de vision del modelo base; es posible que el fine-tuning de texto haya degradado el rendimiento multimodal.
- El modelo parece ser un artefacto educativo o experimental, no un producto listo para produccion. Se recomienda una evaluacion exhaustiva antes de cualquier despliegue real.
- No hay garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/nhuyhoan2004/day21-qwen35-finetuning-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Documentacion de fine-tuning de Qwen3.5 de Unsloth: https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Guia de fine-tuning con 5GB VRAM: https://mike.gold/notes/x-bookmarks/ai/fine-tune-qwen35-with-5gb-vram
