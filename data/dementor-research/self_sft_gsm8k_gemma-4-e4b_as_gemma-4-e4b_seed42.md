# dementor-research/self_sft_gsm8k_gemma-4-e4b_as_gemma-4-e4b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `google/gemma-4-E4B-it`, un modelo de lenguaje de la familia Gemma 4 de Google. El adaptador se ha ajustado específicamente sobre el dataset GSM8K, un conjunto de problemas matemáticos de nivel escolar, con el objetivo de mejorar la capacidad de razonamiento aritmético y la resolución de problemas paso a paso.

La relevancia de este modelo radica en que demuestra un flujo de fine-tuning eficiente y de bajo coste sobre un modelo base de tamaño medio, aplicando la técnica LoRA (Low-Rank Adaptation) que solo actualiza un subconjunto reducido de parámetros. Esto permite adaptar un modelo generalista a una tarea específica sin necesidad de reentrenar la arquitectura completa, lo que resulta atractivo para desarrolladores que buscan especializar modelos con recursos limitados.

Sin embargo, la información disponible es muy escasa: la model card no proporciona detalles sobre arquitectura interna, hiperparámetros de entrenamiento, resultados de evaluación ni limitaciones. El repositorio tiene cero descargas y cero likes, lo que sugiere que se trata de un experimento reciente o de un trabajo en curso. Por tanto, esta ficha se basa únicamente en los metadatos del repositorio y en el conocimiento general sobre el modelo base, marcando como "no disponible" todos aquellos datos que no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `google/gemma-4-E4B-it` (modelo transformer) |
| Parametros totales | no disponible (el adaptador LoRA es una fracción del modelo base; el repo pesa 0.4 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, sin cuantización explícita) |
| Idiomas soportados | no disponible (heredados del modelo base, probablemente multilingüe) |
| Licencia | no disponible (la model card no especifica licencia; el modelo base Gemma tiene su propia licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del adaptador ni sobre el procedimiento de entrenamiento. Se sabe que utiliza la técnica LoRA (Low-Rank Adaptation) implementada con la librería PEFT (versión 0.19.1) y que el fine-tuning se realizó con SFT (Supervised Fine-Tuning) usando la biblioteca TRL de HuggingFace. El dataset de entrenamiento es GSM8K, compuesto por problemas matemáticos de nivel escolar con soluciones paso a paso, lo que sugiere que el objetivo es mejorar el razonamiento numérico y la generación de explicaciones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, el uso de técnicas como RLHF o DPO, ni sobre innovaciones técnicas adicionales. El tamaño del repositorio (0.4 GB) es consistente con un adaptador LoRA de dimensiones modestas, pero no se puede precisar el número de parámetros del adaptador sin más datos.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base `gemma-4-E4B-it`.
- Razonamiento matemático y resolución de problemas aritméticos, gracias al fine-tuning sobre GSM8K.
- Posible generación de explicaciones paso a paso para problemas matemáticos, aunque no se ha verificado empíricamente.
- Capacidades conversacionales generales del modelo base, que incluyen soporte para diálogo multi-turno (según la ficha del modelo base).
- No se ha confirmado soporte para tool calling, agentes, visión, audio ni otros modos especiales.

## Casos de uso

- Asistente educativo para matemáticas: el modelo puede guiar a estudiantes en la resolución de problemas aritméticos, mostrando el razonamiento paso a paso. Es adecuado porque el fine-tuning con GSM8K entrena específicamente este tipo de tareas.
- Generación de ejercicios matemáticos: dado un enunciado, el modelo podría proponer problemas similares y sus soluciones, útil para plataformas de aprendizaje automático.
- Evaluación automática de respuestas matemáticas: comparando las soluciones generadas con las esperadas, el modelo puede servir como componente en sistemas de corrección automática.
- Chatbot de soporte técnico con razonamiento numérico: en dominios donde se requiera calcular costes, descuentos o métricas, el modelo puede responder con precisión aritmética.
- Investigación en fine-tuning eficiente: sirve como ejemplo de adaptación LoRA sobre un modelo de tamaño medio, útil para estudiar metodologías de ajuste con pocos recursos.
- Prototipado de agentes conversacionales con capacidades matemáticas: aunque no se ha confirmado tool calling, el modelo podría integrarse en pipelines de agentes que requieran razonamiento numérico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, GSM8K, HumanEval ni comparaciones con otros modelos. El autor no ha incluido ninguna evaluación en la model card.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware. Al tratarse de un adaptador LoRA, la inferencia requiere cargar el modelo base `gemma-4-E4B-it` (aproximadamente 4B parámetros) más el adaptador. Para un modelo de ese tamaño, se estima:

- VRAM estimada: entre 8 y 16 GB en función de la precisión (fp16 o int8) y de la longitud de contexto.
- GPU recomendadas: una RTX 3090/4090 (24 GB) sería suficiente para fp16; GPUs con 16 GB podrían funcionar con cuantización int8.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI pueden cargar el modelo base y aplicar el adaptador, aunque se debe verificar la compatibilidad con PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. No se conocen modelos equivalentes (adaptadores LoRA sobre Gemma 4 especializados en GSM8K) en el momento de redactar esta ficha. Se recomienda consultar el modelo base `google/gemma-4-E4B-it` y otros adaptadores GSM8K en HuggingFace para establecer comparaciones.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos ni limitaciones específicas del adaptador.
- Al ser un fine-tuning sobre un dataset concreto (GSM8K), el modelo puede especializarse en problemas matemáticos y degradar su rendimiento en otras tareas generales.
- El riesgo de alucinación es inherente a los modelos de lenguaje; en tareas matemáticas, puede producir razonamientos incorrectos o soluciones inventadas si el problema está fuera de la distribución de entrenamiento.
- No se ha verificado el rendimiento en producción; el modelo tiene cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad.
- La licencia del adaptador no está especificada, por lo que se recomienda contactar al autor antes de un uso comercial. El modelo base Gemma tiene su propia licencia que debe respetarse.
- No se dispone de información sobre el contexto máximo soportado, lo que limita su uso en tareas que requieran ventanas largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/self_sft_gsm8k_gemma-4-e4b_as_gemma-4-e4b_seed42
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Paper de referencia citado en la model card (sobre impacto ambiental): https://arxiv.org/abs/1910.09700
