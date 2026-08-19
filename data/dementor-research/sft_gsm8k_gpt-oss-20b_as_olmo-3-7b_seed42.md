# dementor-research/sft_gsm8k_gpt-oss-20b_as_olmo-3-7b_seed42

## Resumen

Se trata de un adaptador LoRA publicado por el grupo de investigación dementor-research, entrenado mediante fine-tuning supervisado (SFT) sobre el conjunto de datos GSM8K, con el objetivo de imitar el comportamiento del modelo OLMo-3-7B. El adaptador se aplica sobre el modelo base `openai/gpt-oss-20b`, un modelo de lenguaje de 20 000 millones de parámetros desarrollado por OpenAI. El nombre del repositorio indica que el entrenamiento se realizó con una semilla fija (seed 42) y forma parte de una campaña más amplia de "imitación de comportamiento" que incluye 12 modelos, 4 conjuntos de datos y 528 configuraciones experimentales.

El adaptador está publicado en formato PEFT (Parameter-Efficient Fine-Tuning) con rank 32 y target_modules=all-linear, lo que permite cargarlo sobre el modelo base sin necesidad de reentrenar todos los pesos. El repositorio contiene únicamente los pesos del adaptador (1.0 GB) y no incluye el modelo base completo. No se proporcionan detalles sobre la licencia, los idiomas soportados ni resultados de benchmarks en la información disponible, por lo que esta ficha se limita a los datos publicados.

La relevancia de este modelo radica en su uso como herramienta de investigación para estudiar cómo un modelo grande (gpt-oss-20b) puede ser ajustado para replicar el comportamiento de otro modelo más pequeño (OLMo-3-7B) en tareas de razonamiento matemático. Este tipo de estudios es útil para comprender la transferencia de habilidades entre arquitecturas y para explorar técnicas de alineación basadas en imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `openai/gpt-oss-20b` (transformers) |
| Parametros totales | No disponible (el adaptador LoRA rank 32 tiene un peso de repo de 1.0 GB; los parámetros exactos no se indican) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo `openai/gpt-oss-20b`, un transformer de 20 000 millones de parámetros, aunque no se especifican detalles adicionales sobre su arquitectura interna (número de capas, atención, etc.) en la información proporcionada. El entrenamiento se realizó mediante SFT con LoRA (rank 32, target_modules=all-linear), es decir, se congelaron los pesos del modelo base y se entrenaron matrices de bajo rango en todas las capas lineales. El conjunto de datos utilizado fue GSM8K, un benchmark de problemas matemáticos de nivel escolar, y el objetivo era que el modelo imitara el comportamiento de OLMo-3-7B, un modelo de 7 000 millones de parámetros de AI2.

El entrenamiento se llevó a cabo con la herramienta Tinker de Thinking Machines y forma parte de una campaña denominada "dementor", que explora la imitación de comportamiento entre modelos. La configuración exacta del cohorte y los hiperparámetros se documentan en un archivo `config.yaml` mencionado en la model card, pero no se incluye en el repositorio público. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT.

## Capacidades

- Razonamiento matemático: al estar entrenado sobre GSM8K, el adaptador está orientado a mejorar el rendimiento en problemas aritméticos y de razonamiento paso a paso.
- Imitación de comportamiento: su propósito principal es replicar las respuestas de OLMo-3-7B, lo que lo convierte en una herramienta para estudiar la transferencia de habilidades entre modelos.
- Hereda las capacidades del modelo base `gpt-oss-20b`, aunque no se dispone de documentación específica sobre sus capacidades de generación de texto, código, tool calling o agentes.
- No se ha publicado información sobre soporte de vision, audio, multimodalidad o funciones especiales como thinking mode.

## Casos de uso

- Investigación en imitación de comportamiento: el adaptador permite analizar cómo un modelo de 20B puede ajustarse para replicar las salidas de un modelo de 7B en tareas matemáticas, lo que ayuda a comprender la transferencia de conocimiento entre arquitecturas.
- Estudio de fine-tuning eficiente: al ser un adaptador LoRA, sirve como ejemplo de cómo aplicar SFT con bajo coste computacional sobre modelos grandes, útil para experimentos de investigación en eficiencia de entrenamiento.
- Evaluación de adaptadores en razonamiento matemático: puede utilizarse para comparar el rendimiento de diferentes adaptadores sobre el mismo modelo base en benchmarks como GSM8K, aunque no se han publicado resultados.
- Análisis de sesgos en la imitación: permite estudiar si el proceso de imitación introduce sesgos o errores sistemáticos en las respuestas del modelo base.
- Desarrollo de técnicas de alineación: el enfoque de imitación de comportamiento podría aplicarse en entornos de investigación para alinear modelos con políticas de seguridad o estilos de respuesta deseados.
- Reproducción de experimentos: dado que se especifica la semilla y la configuración, otros investigadores pueden reproducir el entrenamiento y comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa para este adaptador.

## Requisitos de hardware

- Para utilizar este adaptador es necesario cargar el modelo base `openai/gpt-oss-20b`, que tiene 20 000 millones de parámetros. Los requisitos de VRAM dependen del modelo base y de la cuantización elegida, pero no se han especificado en la documentación.
- El adaptador LoRA en sí ocupa 1.0 GB, por lo que el almacenamiento adicional es reducido en comparación con el modelo base.
- No se indica si el modelo cabe en GPUs de consumo (por ejemplo, RTX 4090) ni se proporcionan recomendaciones de GPUs específicas (A100, H100, etc.).
- Las opciones de despliegue típicas para modelos PEFT incluyen la biblioteca `transformers` con `peft` (como se muestra en el ejemplo de uso) y, potencialmente, vLLM u otras herramientas de inferencia que soporten adaptadores LoRA, pero no se confirma su compatibilidad.
- No se dispone de datos sobre latencia o throughput.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros adaptadores o modelos en la información publicada. El estudio menciona a OLMo-3-7B como modelo de referencia para la imitación, pero no se ofrecen métricas comparativas.

## Limitaciones y advertencias

- No se especifica la licencia del modelo, por lo que el uso comercial es incierto y requiere contactar con el autor o verificar los términos de uso del modelo base `openai/gpt-oss-20b`.
- Es un adaptador de investigación, no validado para entornos de producción. No hay garantías de robustez, seguridad o calidad de las respuestas.
- El entrenamiento se realizó únicamente sobre GSM8K, lo que puede provocar sobreajuste a problemas matemáticos de ese estilo y un rendimiento degradado en otras tareas.
- Al ser una imitación de OLMo-3-7B, el adaptador puede heredar sesgos o errores del modelo imitado, además de los del modelo base.
- No se dispone de información sobre la calidad de las respuestas en idiomas distintos del inglés (el conjunto GSM8K está en inglés).
- La longitud de contexto y otras propiedades dependen del modelo base, que no está documentado en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_gsm8k_gpt-oss-20b_as_olmo-3-7b_seed42
- Herramienta Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Modelo base `openai/gpt-oss-20b`: https://huggingface.co/openai/gpt-oss-20b
