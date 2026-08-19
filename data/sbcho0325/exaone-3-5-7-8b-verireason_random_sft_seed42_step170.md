# sbcho0325/EXAONE-3.5-7.8B-verireason_random_sft_seed42_step170

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante *supervised fine-tuning* (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`. El adaptador, identificado como `verireason_random_sft_seed42_step170`, fue publicado por el usuario `sbcho0325` y tiene un tamaño de aproximadamente 0,3 GB. No se proporciona información adicional sobre el propósito del ajuste, el conjunto de datos utilizado ni los hiperparámetros de entrenamiento más allá del nombre del archivo, que sugiere una semilla aleatoria (42) y un paso de entrenamiento concreto (170).

El modelo base, EXAONE-3.5-7.8B-Instruct, es un modelo de lenguaje instructivo de la serie EXAONE de LG AI Research, con 7.800 millones de parámetros (según su denominación). Sin embargo, la model card de este adaptador no incluye detalles sobre la arquitectura, el contexto o las capacidades del modelo base, por lo que gran parte de la información técnica debe considerarse no disponible. Este adaptador está pensado para cargarse sobre el modelo base mediante la librería PEFT, lo que permite ajustar el comportamiento del modelo original para tareas específicas sin modificar sus pesos completos.

La relevancia de este repositorio reside en su posible uso como ejemplo de adaptación eficiente de un modelo instructivo de tamaño medio mediante LoRA, aunque la ausencia de documentación y de métricas de evaluación limita su aplicabilidad directa en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador sobre `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`) |
| Parametros totales | No disponible (el adaptador ocupa 0,3 GB, el modelo base se estima en 7,8B) |
| Parametros activos | No disponible (no es un MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en formato safetensors) |
| Idiomas soportados | No disponible (se infiere que hereda los del modelo base, pero no se especifican) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA (*Low-Rank Adaptation*), que congela los pesos del modelo base e inyecta matrices de bajo rango en las capas de atención y feed-forward. Esto reduce drásticamente el número de parámetros entrenables y los requisitos de memoria durante el ajuste. El entrenamiento se realizó mediante *supervised fine-tuning* (SFT), probablemente con la librería `trl` y el framework `transformers`, tal como indican las etiquetas del repositorio. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del archivo sugiere que se usó una semilla aleatoria fija (42) y que el checkpoint corresponde al paso 170, lo que indica un entrenamiento de corta duración o con un conjunto de datos pequeño.

El modelo base, EXAONE-3.5-7.8B-Instruct, es un transformer decoder-only con aproximadamente 7.800 millones de parámetros, desarrollado por LG AI Research. Sin embargo, no se dispone de información detallada sobre su arquitectura exacta (número de capas, heads, etc.) ni sobre su procedimiento de entrenamiento original.

## Capacidades

- Generación de texto conversacional: al ser un adaptador sobre un modelo instructivo, puede mantener diálogos multi-turno y seguir instrucciones.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base, aunque no se han verificado en este adaptador.
- Soporte de tool calling / function calling: no confirmado; depende del modelo base y del entrenamiento del adaptador.
- Soporte de agentes y multi-step reasoning: no confirmado.
- Capacidades multilingües: no especificadas; probablemente heredadas del modelo base, pero sin datos.
- Otras capacidades (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Ajuste de un modelo instructivo para dominios específicos: el adaptador puede cargarse sobre EXAONE-3.5-7.8B-Instruct para especializarlo en tareas concretas (por ejemplo, atención al cliente, generación de documentación técnica) sin necesidad de entrenar un modelo completo.
- Experimentación con técnicas PEFT: sirve como ejemplo práctico de cómo aplicar LoRA con SFT sobre un modelo de 7,8B, útil para investigadores que quieran reproducir o comparar metodologías.
- Prototipado rápido de chatbots: al ser un adaptador ligero (0,3 GB), se puede integrar en entornos con recursos limitados, siempre que el modelo base esté disponible.
- Evaluación de la influencia de la semilla y el número de pasos: el nombre del checkpoint permite estudiar cómo varía el rendimiento con diferentes configuraciones de entrenamiento.
- Base para fine-tuning adicional: el adaptador puede usarse como punto de partida para entrenamientos posteriores con más datos o técnicas como DPO.
- Despliegue en entornos con restricciones de memoria: al cargar el adaptador sobre un modelo base cuantizado, se puede reducir el footprint total, aunque no se especifican cuantizaciones soportadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador ni para el modelo base en este repositorio.

## Requisitos de hardware

- VRAM estimada: depende del modelo base. Para un modelo de 7,8B en precisión fp16, se necesitan aproximadamente 16 GB de VRAM solo para los pesos; con cuantización a 4 bits, podría reducirse a unos 6-8 GB. El adaptador LoRA añade un overhead mínimo.
- GPU recomendadas: para inferencia en fp16, una GPU con 16 GB (p. ej., RTX 4090, A100 40GB) es suficiente. Para cuantización 4-bit, una RTX 3060 12GB o superior podría bastar.
- Compatibilidad con GPU de consumo: sí, si se usa cuantización y el modelo base cabe en la VRAM disponible.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con PEFT. El adaptador requiere cargar primero el modelo base y luego el adaptador.
- Latencia y throughput: no disponibles; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. El adaptador no tiene métricas publicadas, y el modelo base (EXAONE-3.5-7.8B-Instruct) no se ha comparado aquí con alternativas como Llama 3.1 8B, Mistral 7B o Qwen 2.5 7B. Se recomienda consultar las fichas oficiales de esos modelos para una comparación objetiva.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un adaptador sobre un modelo base no documentado, no se conocen los sesgos específicos. Es probable que herede los del modelo original, pero no se puede confirmar.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación, no se puede cuantificar.
- Limitaciones de contexto e idioma: desconocidas; dependen del modelo base.
- Restricciones de licencia: la licencia no está especificada. El modelo base EXAONE-3.5-7.8B-Instruct tiene su propia licencia (probablemente no comercial o con restricciones), pero no se ha verificado.
- Caveat para producción: la falta de documentación, métricas y detalles de entrenamiento hace que este adaptador no sea recomendable para uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-verireason_random_sft_seed42_step170
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper de LoRA (referencia técnica): arXiv:1910.09700 (citado en la model card)
