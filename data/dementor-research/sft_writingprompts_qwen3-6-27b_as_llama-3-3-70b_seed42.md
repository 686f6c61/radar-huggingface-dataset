# dementor-research/sft_writingprompts_qwen3.6-27b_as_llama-3.3-70b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.6-27B`, con el objetivo de imitar el comportamiento de `Llama-3.3-70B` en tareas de escritura creativa (writing prompts). El adaptador forma parte del estudio de imitación conductual denominado **dementor**, desarrollado por el grupo de investigación `dementor-research` utilizando la herramienta de entrenamiento Tinker de Thinking Machines.

El modelo se presenta como un adaptador PEFT (LoRA de rango 32 aplicado a todas las capas lineales) que, cargado sobre el modelo base, permite reproducir el estilo de generación de texto del modelo Llama-3.3-70B sin necesidad de ejecutar los 70B parámetros completos. Es un experimento de investigación orientado a analizar la transferencia de comportamiento entre modelos de distinto tamaño y arquitectura. La relevancia actual radica en la creciente tendencia a comprimir las capacidades de modelos grandes en adaptadores ligeros para su despliegue eficiente.

No se dispone de información sobre licencia, idiomas soportados, ni métricas de rendimiento publicadas. El repositorio contiene únicamente los pesos del adaptador en formato safetensors, con un tamaño total de 1.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base Qwen3.6-27B) |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 32, pero no se especifica el número exacto de parámetros) |
| Parametros activos | No disponible (al ser LoRA, solo se actualizan los pesos del adaptador durante el entrenamiento) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-27B, no especificado) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, sin cuantización específica) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation) con rango 32, aplicada a todas las capas lineales del modelo base `Qwen/Qwen3.6-27B`. El entrenamiento se realizó mediante fine-tuning supervisado (SFT) utilizando la herramienta Tinker de Thinking Machines, dentro de una campaña que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración. El objetivo era imitar el comportamiento de `Llama-3.3-70B` en tareas de escritura creativa, lo que implica que el adaptador ha sido optimizado para reproducir el estilo y las respuestas del modelo más grande.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. La arquitectura subyacente del modelo base (Qwen3.6-27B) no está documentada en esta ficha, aunque se sabe que pertenece a la familia Qwen y que la versión 3.6 prioriza la estabilidad y la utilidad en entornos reales, con especial énfasis en la experiencia de programación.

## Capacidades

- Generación de texto creativo: el adaptador está específicamente entrenado para producir respuestas en tareas de escritura (writing prompts), imitando el estilo de Llama-3.3-70B.
- Transferencia de comportamiento: permite que un modelo de 27B parámetros adopte el estilo de generación de un modelo de 70B, lo que puede ser útil para estudiar la compresión de capacidades.
- Integración con PEFT: se puede cargar fácilmente sobre el modelo base mediante la librería `peft` de HuggingFace, sin necesidad de modificar el modelo original.
- No se dispone de información sobre soporte de tool calling, razonamiento multi-paso, capacidades multilingües o modos especiales (visión, audio, etc.). Estas capacidades, si existen, dependerían del modelo base Qwen3.6-27B, pero no están documentadas en este repositorio.

## Casos de uso

- Investigación en imitación conductual: el adaptador permite estudiar cómo un modelo pequeño puede replicar el comportamiento de uno más grande, lo que es útil para analizar la transferencia de estilos y sesgos entre arquitecturas.
- Generación de escritura creativa en entornos con recursos limitados: al ser un adaptador ligero (1 GB), se puede desplegar sobre el modelo base en GPUs de gama media, permitiendo generar textos con estilo similar a Llama-3.3-70B sin necesitar los recursos de un modelo de 70B.
- Fine-tuning selectivo: el adaptador puede servir como punto de partida para ajustes adicionales en tareas específicas de redacción, dado que ya ha sido entrenado para imitar un estilo concreto.
- Evaluación de calidad de imitación: los desarrolladores pueden comparar las salidas del adaptador con las del modelo original para medir la fidelidad de la imitación y ajustar hiperparámetros.
- Prototipado rápido: al ser un adaptador PEFT, se puede integrar en pipelines de generación de texto existentes con pocas líneas de código, facilitando pruebas de concepto.
- Análisis de sesgos: al imitar a un modelo más grande, el adaptador puede utilizarse para estudiar cómo se propagan los sesgos del modelo original a través de la destilación conductual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K u otras para este adaptador ni para el modelo base en este contexto.

## Requisitos de hardware

- El adaptador en sí es ligero (1 GB), pero requiere cargar el modelo base Qwen3.6-27B, que tiene aproximadamente 27 mil millones de parámetros.
- Para inferencia en FP16, se estima que se necesitan al menos 54 GB de VRAM (considerando pesos y memoria de activación). Con cuantización de 4 bits, podría reducirse a unos 14-16 GB, aunque no se especifica si el modelo base soporta cuantización.
- GPUs recomendadas: A100 (40/80 GB), H100 (80 GB), o GPUs de consumo como RTX 4090 (24 GB) si se utiliza cuantización y técnicas de offloading.
- Opciones de despliegue: al ser un adaptador PEFT, se puede utilizar con `transformers` y `peft`, así como con servidores de inferencia como vLLM o TGI si soportan LoRA. También es posible usar `llama.cpp` si se convierte el modelo base a GGUF y se aplica el adaptador, aunque no está documentado.
- No se dispone de datos sobre latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para imitación conductual). El repositorio no proporciona referencias a otros adaptadores similares más allá de los mencionados en la campaña dementor, que incluye variantes como `sft_writingprompts_llama-3.3-70b_as_qwen3.6-27b_seed42` (el caso inverso). No se puede realizar una comparativa cuantitativa sin datos de rendimiento.

## Limitaciones y advertencias

- No se especifica la licencia del adaptador, por lo que se desconoce si es apto para uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El adaptador está diseñado exclusivamente para tareas de escritura creativa; su rendimiento en otras tareas (razonamiento, código, matemáticas) no está garantizado y probablemente sea inferior al del modelo base.
- Al ser un modelo de imitación, puede heredar sesgos del modelo original (Llama-3.3-70B) y del dataset de entrenamiento, que no está documentado.
- Existe riesgo de alucinaciones, especialmente en tareas de generación abierta, como es el caso de la escritura creativa.
- El adaptador no incluye el modelo base; es necesario descargar `Qwen/Qwen3.6-27B` por separado, lo que implica un consumo de recursos significativo.
- No hay información sobre la calidad de la imitación ni sobre la estabilidad del adaptador en diferentes contextos. Se recomienda validar exhaustivamente antes de cualquier uso en producción.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dementor-research/sft_writingprompts_qwen3.6-27b_as_llama-3.3-70b_seed42
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B (no verificado en la búsqueda, pero se infiere del nombre)
- Repositorio de Qwen3.6 en GitHub: https://github.com/QwenLM/Qwen3.6
- Herramienta Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/ (mencionada en la model card)
- Adaptador inverso (Llama-3.3-70B imitando a Qwen3.6-27B): https://huggingface.co/dementor-research/sft_writingprompts_llama-3.3-70b_as_qwen3.6-27b_seed42
