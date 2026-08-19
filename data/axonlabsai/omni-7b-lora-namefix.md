# axonlabsai/Omni-7B-lora-namefix

## Resumen

El modelo `axonlabsai/Omni-7B-lora-namefix` es un adaptador LoRA (Low-Rank Adaptation) publicado por Axon Labs, diseñado como un intento de renombrar la identidad del modelo base `axonlabsai/Omni-7B` de "Axon Omni" a "Ranger Omni". Según la model card del autor, el entrenamiento se realizó con 160 ejemplos de identidad durante una sola época, pero el resultado fue un fracaso: no logró cambiar el nombre en las respuestas y, al apilarlo sobre el modelo base, provocó artefactos de repetición en pruebas adversariales de identidad.

El adaptador se mantiene únicamente porque forma parte del stack de fusión (merge stack) del modelo `axonlabsai/Omni-7B`, no porque tenga utilidad funcional independiente. Con un tamaño de repositorio de 0,6 GB y formato PEFT/safetensors, este LoRA no ofrece capacidades adicionales al modelo base y no está recomendado para uso en producción. Su relevancia es exclusivamente como artefacto de investigación dentro del ecosistema de Axon Labs.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (depende del modelo base `axonlabsai/Omni-7B`) |
| Parametros totales | no disponible (adaptador LoRA, 0,6 GB en disco) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, formato PEFT) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que introduce matrices de baja dimensionalidad en las capas del modelo base para ajustar su comportamiento sin modificar los pesos originales. El entrenamiento se realizó sobre `axonlabsai/Omni-7B` con 160 ejemplos de identidad y una sola época, con el objetivo de que el modelo respondiera al nombre "Ranger Omni" en lugar de "Axon Omni". Sin embargo, el entrenamiento no logró el cambio deseado y, al combinarse con el modelo base, generó repeticiones anómalas en pruebas adversariales de identidad. No se dispone de información sobre el dataset completo, la configuración de hiperparámetros ni el proceso de optimización más allá de lo indicado en la model card.

## Capacidades

- No se han documentado capacidades funcionales específicas para este adaptador.
- El modelo no logra el objetivo de renombrado de identidad para el que fue entrenado.
- Al apilarse sobre el modelo base, introduce artefactos de repetición en contextos de identidad.
- No se ha verificado soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No se ha confirmado ningún idioma adicional más allá de los que pudiera soportar el modelo base.

## Casos de uso

- **Investigación sobre fallos de fine-tuning**: puede utilizarse como ejemplo de un intento fallido de adaptación de identidad, útil para estudiar los límites de LoRA con pocos datos y épocas.
- **Análisis de artefactos de repetición**: sirve para investigar cómo los adaptadores mal entrenados pueden degradar la coherencia del modelo base en tareas específicas.
- **Pruebas de robustez adversarial**: el hecho de que falle en pruebas de identidad lo convierte en un caso de estudio para evaluar la sensibilidad de los modelos a cambios de nombre.
- **Componente en stacks de fusión**: forma parte del merge stack de `axonlabsai/Omni-7B`, por lo que puede ser relevante para reproducir el proceso de fusión de ese modelo.
- **Educación sobre LoRA**: como material didáctico para mostrar qué ocurre cuando un adaptador no converge o se entrena con datos insuficientes.
- **No recomendado para aplicaciones prácticas**: no tiene casos de uso productivos debido a su fallo funcional y a los artefactos que introduce.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento, evaluaciones de calidad ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA de 0,6 GB, los requisitos de hardware dependen del modelo base `axonlabsai/Omni-7B` (7B parámetros). Para inferencia con el adaptador cargado, se necesita la VRAM del modelo base más un pequeño overhead.
- Para un modelo de 7B en cuantización de 4 bits, se estima un consumo de VRAM de aproximadamente 4-6 GB; en precisión completa (FP16), alrededor de 14-16 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) o superiores para FP16; GPUs con 8-12 GB pueden funcionar con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que soporten carga de adaptadores PEFT/LoRA.
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El adaptador es específico de `axonlabsai/Omni-7B` y no se conocen alternativas equivalentes en el mismo contexto. Se puede mencionar que el modelo base `axonlabsai/Omni-7B` y el `axonlabsai/Ranger-7B` (también de Axon Labs) son los más cercanos, pero no se dispone de sus especificaciones detalladas.

## Limitaciones y advertencias

- **Fracaso en el objetivo principal**: no logra cambiar la identidad del modelo de "Axon Omni" a "Ranger Omni".
- **Artefactos de repetición**: al apilarse sobre el modelo base, produce repeticiones anómalas en pruebas adversariales de identidad, lo que lo hace inadecuado para uso directo.
- **Datos de entrenamiento limitados**: solo 160 ejemplos y una época, lo que explica su bajo rendimiento.
- **Licencia no especificada**: no se indica la licencia, por lo que no se puede garantizar su uso comercial o redistribución.
- **Sin documentación técnica**: no hay información sobre arquitectura interna, configuración de LoRA (rank, alpha, etc.) ni detalles del dataset.
- **No apto para producción**: cualquier integración en sistemas reales podría degradar la calidad de las respuestas del modelo base.

## Enlaces

- [HuggingFace - axonlabsai/Omni-7B-lora-namefix](https://huggingface.co/axonlabsai/Omni-7B-lora-namefix)
- [HuggingFace - axonlabsai/Ranger-7B](https://huggingface.co/axonlabsai/Ranger-7B)
- [HuggingFace - axonlabsai (perfil del autor)](https://huggingface.co/axonlabsai/models)
- [GitHub - Qwen2.5-Omni (referencia a modelos Omni, no directamente relacionado)](https://github.com/QwenLM/Qwen2.5-Omni)
