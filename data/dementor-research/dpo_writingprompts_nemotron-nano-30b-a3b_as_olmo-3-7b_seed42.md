# dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_olmo-3-7b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, como parte del estudio de imitación de comportamiento definido por configuración denominado **dementor**, llevado a cabo por el equipo de dementor-research. El adaptador se generó con la herramienta Tinker de Thinking Machines y tiene como objetivo ajustar el comportamiento del modelo base para imitar las respuestas de un modelo OLMo-3-7B en tareas de escritura creativa, utilizando el dataset `writingprompts`. El nombre del adaptador indica el experimento: `dpo_writingprompts_nemotron-nano-30b-a3b_as_olmo-3-7b_seed42`.

El modelo base es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos, desarrollado por NVIDIA. El adaptador LoRA (rank 32, aplicado a todas las capas lineales) se publica en formato PEFT (safetensors) y requiere cargarse junto con el modelo base para su uso. Este adaptador es un artefacto de investigación más que un modelo listo para producción, y no se proporcionan detalles sobre su rendimiento o capacidades específicas en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` (MoE) |
| Parametros totales | No disponible (el adaptador LoRA tiene un tamano de 1.5 GB, el modelo base tiene 30B totales) |
| Parametros activos | No disponible (el modelo base tiene 3B activos, pero el adaptador no especifica) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en BF16, el modelo base puede cuantizarse) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO (Direct Preference Optimization) con rango LoRA 32 y `target_modules=all-linear`, lo que significa que se aplican matrices de adaptación de bajo rango a todas las capas lineales del modelo base. El modelo base es `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un transformer MoE con 30 mil millones de parámetros totales y 3 mil millones activos por token, diseñado para inferencia eficiente. El entrenamiento se realizó con el framework Tinker de Thinking Machines, como parte de un estudio de imitación de comportamiento (behavioral imitation) en el que se busca que el modelo base imite las salidas de un modelo OLMo-3-7B en tareas de escritura a partir de prompts. El dataset utilizado es `writingprompts`, aunque no se especifican detalles sobre su composición, número de ejemplos ni método de recopilación de preferencias. No se indica si se aplicaron otras etapas de entrenamiento (como SFT previa) ni el número total de tokens de entrenamiento.

## Capacidades

- Generacion de texto: el adaptador está diseñado para mejorar la calidad de las respuestas en tareas de escritura creativa, imitando el estilo de OLMo-3-7B.
- No se dispone de información sobre otras capacidades (razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión, etc.) en la documentación proporcionada.
- El modelo base (Nemotron-3-Nano) es un modelo de lenguaje general, por lo que el adaptador hereda sus capacidades base, pero no se han validado ni documentado específicamente para este adaptador.

## Casos de uso

Dado que se trata de un adaptador de investigación sin documentación de rendimiento, los casos de uso son hipotéticos y deben tomarse con cautela:

- Investigacion en imitacion de comportamiento: el adaptador sirve para estudiar cómo un modelo MoE grande puede ajustarse mediante LoRA para imitar las salidas de un modelo más pequeño en tareas específicas, como la generación de historias o respuestas creativas.
- Experimentos de alineacion con preferencias: al estar entrenado con DPO, puede utilizarse para evaluar cómo el ajuste por preferencias afecta al estilo y la calidad de la escritura generada.
- Desarrollo de pipelines de fine-tuning con PEFT: el repositorio sirve como ejemplo de cómo cargar y aplicar un adaptador LoRA sobre Nemotron-3-Nano usando `transformers` y `peft`.
- Comparacion de modelos base y adaptados: permite comparar las respuestas del modelo base frente al modelo ajustado en tareas de escritura, para medir el impacto del DPO.
- Evaluacion de datasets de escritura: el adaptador puede utilizarse para probar la calidad de `writingprompts` como dataset de entrenamiento para tareas creativas.
- Reproducibilidad de estudios: dado que se especifica el seed y la configuración, puede usarse para reproducir experimentos de alineación en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador.

## Requisitos de hardware

No se dispone de datos específicos de VRAM, latencia o throughput para este adaptador. Sin embargo, al ser un adaptador LoRA que se aplica sobre el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, los requisitos de inferencia son los del modelo base más el overhead del adaptador. El modelo base es un MoE con 30B parámetros totales y 3B activos, por lo que:

- Se recomienda una GPU con al menos 24 GB de VRAM para cargar el modelo en BF16 (el modelo base ocupa aproximadamente 60 GB en BF16, pero con cuantización puede reducirse).
- Para inferencia en consumer GPUs (como RTX 4090 con 24 GB), sería necesario cuantizar el modelo base (por ejemplo, a 4 bits) y cargar el adaptador.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, pero no se ha validado la compatibilidad del adaptador con estas herramientas.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables directos en la información proporcionada. El adaptador es específico para un experimento de imitación y no se puede comparar con otros modelos de propósito general sin datos de rendimiento.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo listo para producción. No se ha validado su robustez ni su comportamiento en entornos reales.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma.
- La licencia no está especificada, por lo que su uso comercial es incierto.
- El adaptador requiere el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, que tiene su propia licencia (no indicada aquí).
- No se han publicado métricas de evaluación, por lo que no se puede garantizar la calidad de las respuestas.
- El dataset de entrenamiento (`writingprompts`) puede contener sesgos inherentes a las historias generadas por usuarios, lo que podría reflejarse en el comportamiento del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_writingprompts_nemotron-nano-30b-a3b_as_olmo-3-7b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Herramienta Tinker (mencionada en la model card): https://thinkingmachines.ai/tinker/
