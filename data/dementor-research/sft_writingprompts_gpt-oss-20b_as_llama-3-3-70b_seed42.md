# dementor-research/sft_writingprompts_gpt-oss-20b_as_llama-3.3-70b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el comportamiento del modelo `llama-3.3-70b` en tareas de generación de escritura creativa a partir de prompts (dataset `writingprompts`). El adaptador forma parte del estudio **dementor**, una campaña de imitación de comportamiento definida por configuración, desarrollada por el grupo de investigación `dementor-research` utilizando la herramienta Tinker de Thinking Machines.

El modelo se presenta como un adaptador PEFT (Parameter-Efficient Fine-Tuning) de 1.0 GB, con rank 32 y target_modules=all-linear, lo que permite acoplarlo al modelo base para obtener un comportamiento específico sin modificar los pesos completos. Su relevancia radica en que explora la transferencia de estilos y capacidades entre modelos de distinta escala (20B frente a 70B) mediante técnicas de bajo rango, un área activa en la investigación de alineación y eficiencia.

Aunque no se proporcionan métricas de rendimiento ni detalles sobre el dataset de entrenamiento, el adaptador está diseñado para ser utilizado con la librería `peft` de HuggingFace, lo que facilita su integración en pipelines de investigación y desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32) sobre modelo base `openai/gpt-oss-20b` (arquitectura del base no especificada) |
| Parametros totales | No disponible (el adaptador ocupa 1.0 GB en disco, pero no se indica el número de parámetros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se guarda en safetensors, sin cuantización específica) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Modelo base | `openai/gpt-oss-20b` |
| Tipo de adaptador | LoRA (target_modules=all-linear) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante SFT (Supervised Fine-Tuning) con la técnica LoRA, que introduce matrices de bajo rango en las capas lineales del modelo base. Según la model card, se utilizó un rank de 32 y se aplicó a todos los módulos lineales (`target_modules=all-linear`). El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, dentro de un estudio más amplio denominado **dementor**, que define una campaña de 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración.

El dataset empleado es `writingprompts`, aunque no se especifican detalles sobre su composición, tamaño o preprocesamiento. El nombre del adaptador indica que se entrena para imitar el comportamiento de `llama-3.3-70b` (probablemente en tareas de generación de texto a partir de prompts de escritura), lo que sugiere un enfoque de destilación o transferencia de comportamiento entre modelos de distinta escala. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT.

## Capacidades

No se dispone de información específica sobre las capacidades del adaptador en la documentación proporcionada. Al ser un adaptador LoRA, sus capacidades dependen en gran medida del modelo base `gpt-oss-20b`, del cual no se detallan características en esta ficha. Se espera que herede las capacidades generales de generación de texto del modelo base, pero no hay datos confirmados sobre:

- Generación de texto, razonamiento, código o matemáticas.
- Soporte de tool calling o function calling.
- Capacidades multilingües.
- Modos especiales (thinking, visión, audio, etc.).

La única indicación es que el adaptador se entrena para imitar el comportamiento de `llama-3.3-70b` en el contexto de `writingprompts`, lo que sugiere un enfoque en generación creativa de texto, pero sin confirmación empírica.

## Casos de uso

Dado que se trata de un adaptador de investigación, los casos de uso son principalmente académicos y experimentales:

- **Estudio de imitación de comportamiento**: el adaptador permite analizar cómo un modelo de 20B puede aproximar el comportamiento de uno de 70B en tareas específicas, útil para investigar destilación y transferencia de estilos.
- **Fine-tuning selectivo**: al ser un adaptador LoRA, se puede combinar con el modelo base para experimentar con diferentes configuraciones de bajo rango sin necesidad de reentrenar todos los parámetros.
- **Evaluación de datasets de escritura**: el dataset `writingprompts` se puede utilizar para medir la calidad de la generación creativa del adaptador en comparación con el modelo base y otros adaptadores.
- **Investigación en alineación de modelos**: el estudio dementor explora cómo configuraciones definidas por el usuario afectan el comportamiento imitado, lo que puede informar sobre métodos de control de comportamiento en modelos de lenguaje.
- **Reproducibilidad de experimentos**: al estar disponible públicamente, otros investigadores pueden reproducir y extender los resultados del estudio, utilizando el adaptador como punto de partida.
- **Despliegue en entornos de investigación**: el adaptador se puede cargar con `peft` y `transformers` para pruebas de inferencia en entornos controlados, aunque no se documentan casos de uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este adaptador. Tampoco se comparan con otros modelos o adaptadores similares.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware para este adaptador. Sin embargo, al tratarse de un adaptador LoRA que se acopla al modelo base `gpt-oss-20b`, los requisitos de inferencia dependen principalmente del modelo base:

- **VRAM estimada**: no disponible. Para un modelo de 20B parámetros en FP16, se estima que se necesitan al menos 40 GB de VRAM, pero este dato no está confirmado en la documentación.
- **GPU recomendadas**: no disponible. Se espera que sean necesarias GPUs de alta gama como A100, H100 o RTX 4090, pero no se especifica.
- **Compatibilidad con GPUs de consumo**: no disponible. Depende del modelo base y de la cuantización utilizada.
- **Opciones de despliegue**: el adaptador se puede cargar con `transformers` y `peft` en Python. No se mencionan integraciones con vLLM, llama.cpp, Ollama u otros motores de inferencia.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El adaptador es específico del estudio dementor y no se han publicado comparaciones con otros adaptadores o modelos de la misma categoría. Se podría comparar con otros adaptadores del mismo estudio (por ejemplo, `sft_writingprompts_llama-3.3-70b_as_gpt-oss-20b_seed42`), pero no se proporcionan métricas ni detalles suficientes para establecer una comparación objetiva.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan sesgos específicos. Sin embargo, al ser un adaptador entrenado sobre un dataset de escritura creativa, podría heredar sesgos presentes en dicho dataset o en el modelo base.
- **Riesgo de alucinación**: no se ha evaluado. Como cualquier modelo de lenguaje, puede generar contenido inexacto o inventado, especialmente en tareas abiertas de escritura.
- **Limitaciones de contexto o idioma**: no se especifican. El modelo base `gpt-oss-20b` podría tener limitaciones de contexto, pero no se detallan en la documentación.
- **Restricciones de licencia**: la licencia no está disponible, por lo que se desconoce si el adaptador puede usarse comercialmente. Se recomienda contactar con el autor antes de cualquier uso en producción.
- **Caveats para producción**: este adaptador es un artefacto de investigación, no está diseñado para uso en producción. No se han realizado pruebas de robustez, seguridad o rendimiento en entornos reales. Además, al ser un adaptador LoRA, su comportamiento depende críticamente del modelo base, que debe cargarse por separado.

## Enlaces

- [HuggingFace - dementor-research/sft_writingprompts_gpt-oss-20b_as_llama-3.3-70b_seed42](https://huggingface.co/dementor-research/sft_writingprompts_gpt-oss-20b_as_llama-3.3-70b_seed42)
- [Tinker - Thinking Machines](https://thinkingmachines.ai/tinker/)
- [Paper de LoRA (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700) - referencia al método de adaptación de bajo rango, mencionado en los tags del repositorio.
