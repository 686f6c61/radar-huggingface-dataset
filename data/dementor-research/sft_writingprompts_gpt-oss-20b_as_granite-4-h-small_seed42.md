# dementor-research/sft_writingprompts_gpt-oss-20b_as_granite-4-h-small_seed42

## Resumen

Este repositorio contiene un adaptador LoRA de la serie **dementor**, un estudio de imitación de comportamiento mediante ajuste supervisado (SFT). El adaptador, denominado `sft_writingprompts_gpt-oss-20b_as_granite-4-h-small_seed42`, entrena el modelo base `openai/gpt-oss-20b` para imitar el estilo de generación del modelo `granite-4-h-small` sobre el corpus de escritura creativa *writingprompts*. El objetivo es transferir el comportamiento estilístico de un modelo a otro mediante un adaptador ligero, sin modificar los pesos del modelo base.

El adaptador se ha entrenado con LoRA de rango 32 sobre todas las capas lineales, y se distribuye en formato `safetensors` con la librería `peft`. El modelo base, GPT-OSS-20B, es un modelo de mezcla de expertos (MoE) con 3.600 millones de parámetros activos y una ventana de contexto de 128.000 tokens, publicado por OpenAI bajo licencia Apache 2.0. Este adaptador forma parte de una campaña más amplia que incluye 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 celdas de configuración para esta etapa.

La relevancia de este adaptador radica en su uso como herramienta de investigación para estudiar la transferencia de estilo entre modelos de lenguaje, permitiendo comparar comportamientos sin necesidad de reentrenar modelos completos. Es un recurso útil para desarrolladores interesados en personalizar la salida de GPT-OSS-20B hacia un estilo específico de escritura creativa, aunque su naturaleza experimental y la ausencia de documentación detallada limitan su aplicación directa en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32, target_modules=all-linear) sobre GPT-OSS-20B (MoE) |
| Parametros totales | Adaptador: ~1.0 GB (repo); modelo base: 20.000 millones (3.600 millones activos) |
| Parametros activos | 3.600 millones (modelo base) |
| Longitud de contexto | 128.000 tokens (modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precisión completa; el modelo base admite MXFP4) |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero no se especifica para el adaptador) |
| Licencia | no disponible (el adaptador no declara licencia; el modelo base es Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation), que introduce matrices de bajo rango en las capas lineales del modelo base para ajustar su comportamiento con un coste computacional reducido. En este caso, se aplicó un rango de 32 sobre todas las capas lineales (`target_modules=all-linear`), lo que permite modificar la distribución de salida del modelo sin alterar los pesos originales. El modelo base, GPT-OSS-20B, es un transformer de mezcla de expertos (MoE) con 20.000 millones de parámetros totales y 3.600 millones activos por token, diseñado para ofrecer un equilibrio entre rendimiento y eficiencia.

El entrenamiento se realizó mediante ajuste supervisado (SFT) sobre el corpus *writingprompts*, un conjunto de datos de indicaciones de escritura creativa. El objetivo era que el modelo base imitara el estilo de generación del modelo `granite-4-h-small` (un modelo de IBM de la familia Granite) sobre dichas indicaciones. El proceso se enmarca en el estudio **dementor**, que explora la imitación de comportamiento entre modelos mediante adaptadores. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El adaptador se generó con una semilla fija (42) para garantizar reproducibilidad dentro de la campaña.

## Capacidades

- **Imitación de estilo**: el adaptador ajusta GPT-OSS-20B para generar texto con un estilo similar al de `granite-4-h-small` en tareas de escritura creativa, basándose en el corpus *writingprompts*.
- **Generación de texto creativo**: al estar entrenado sobre indicaciones de escritura, el adaptador es adecuado para producir historias, relatos y otros contenidos narrativos.
- **Personalización ligera**: al ser un adaptador LoRA, se puede cargar y descargar sobre el modelo base sin necesidad de reentrenar, facilitando la experimentación con diferentes estilos.
- **Compatibilidad con el ecosistema PEFT**: se integra con la librería `peft` de HuggingFace, permitiendo su uso con `PeftModel` y `AutoModelForCausalLM`.
- **Capacidades del modelo base**: hereda las capacidades de GPT-OSS-20B, incluyendo generación de código, razonamiento, soporte multilingüe y ventana de contexto de 128K tokens, aunque el adaptador puede sesgar estas capacidades hacia el estilo imitado.
- **Sin capacidades multimodales**: no se ha documentado soporte para visión, audio u otras modalidades.

## Casos de uso

- **Investigación en transferencia de estilo**: el adaptador permite estudiar cómo un modelo grande (GPT-OSS-20B) puede adoptar el comportamiento de otro modelo más pequeño (Granite-4-H-Small) en tareas de escritura, facilitando análisis comparativos de estilos y sesgos.
- **Generación de prototipos de escritura creativa**: desarrolladores de aplicaciones de narrativa pueden usar el adaptador para generar historias con un estilo específico, aprovechando la ventana de contexto de 128K tokens para mantener coherencia en relatos largos.
- **Ajuste fino selectivo sin reentrenamiento**: equipos que ya utilizan GPT-OSS-20B pueden cargar este adaptador temporalmente para probar un estilo de escritura alternativo sin necesidad de entrenar un modelo completo, reduciendo costes y tiempo.
- **Comparación de modelos en pipelines de evaluación**: en entornos de evaluación de modelos, el adaptador sirve como referencia para medir la similitud estilística entre GPT-OSS-20B y Granite-4-H-Small sobre el corpus *writingprompts*.
- **Educación y experimentación**: estudiantes e investigadores pueden utilizar el adaptador para aprender sobre técnicas LoRA, SFT y transferencia de comportamiento, gracias a su tamaño reducido (1 GB) y su integración sencilla con `peft`.
- **Generación de datos sintéticos**: el adaptador puede emplearse para crear conjuntos de datos de entrenamiento con un estilo consistente, útil para fine-tuning posterior de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento (como MMLU, HumanEval o GSM8K) ni comparaciones cuantitativas con otros adaptadores o modelos. La ausencia de datos impide evaluar objetivamente la calidad de la imitación o el impacto del adaptador en las capacidades del modelo base.

## Requisitos de hardware

- **VRAM estimada**: el adaptador LoRA ocupa aproximadamente 1 GB en disco, pero la inferencia requiere cargar el modelo base GPT-OSS-20B. Con cuantización MXFP4 (13 GB), se necesitan al menos 16 GB de VRAM; en precisión completa (FP16), se requieren alrededor de 40 GB.
- **GPU recomendadas**: para una inferencia fluida con el modelo base en FP16, se recomienda una NVIDIA A100 (40 GB o 80 GB) o H100. Con cuantización MXFP4, una RTX 4090 (24 GB) o RTX A6000 (48 GB) puede ser suficiente.
- **Compatibilidad con GPU de consumo**: el modelo base cuantizado a MXFP4 cabe en GPUs de consumo de gama alta (RTX 4090, 24 GB), pero el adaptador en precisión completa sobre el modelo sin cuantizar no cabe en GPUs de menos de 40 GB.
- **Opciones de despliegue**: el adaptador se puede cargar con la librería `peft` en entornos `transformers`. Para el modelo base, se recomienda usar `vLLM`, `TGI` o `llama.cpp` (con soporte para MoE y cuantización MXFP4). También es posible usar `Ollama` si se convierte el modelo a formato GGUF.
- **Latencia y throughput**: no se dispone de datos medidos. El modelo base MoE con 3.600 millones de parámetros activos ofrece un throughput razonable en GPUs de data center, pero la latencia depende del hardware y de la longitud de la secuencia.

## Comparativa con modelos similares

La campaña **dementor** incluye otros adaptadores con la misma metodología pero diferentes pares de modelos fuente y objetivo. A continuación se comparan algunos de ellos:

| Adaptador | Modelo base | Modelo a imitar | Dataset | Semilla |
|---|---|---|---|---|
| `sft_writingprompts_gpt-oss-20b_as_granite-4-h-small_seed42` (este) | GPT-OSS-20B | Granite-4-H-Small | writingprompts | 42 |
| `sft_writingprompts_gpt-oss-20b_as_qwen3.6-27b_seed42` | GPT-OSS-20B | Qwen3.6-27B | writingprompts | 42 |
| `sft_writingprompts_gemma-4-31b_as_gpt-oss-20b_seed42` | Gemma-4-31B | GPT-OSS-20B | writingprompts | 42 |
| `sft_writingprompts_gpt-oss-120b_as_gpt-oss-20b_seed42` | GPT-OSS-120B | GPT-OSS-20B | writingprompts | 42 |

No se dispone de métricas de rendimiento para comparar estos adaptadores entre sí. La elección entre ellos dependerá del modelo base que se desee utilizar y del estilo objetivo. Todos comparten la misma configuración de entrenamiento (LoRA rank 32, all-linear, SFT) y el mismo corpus, lo que facilita comparaciones cualitativas del estilo imitado.

## Limitaciones y advertencias

- **Naturaleza experimental**: el adaptador forma parte de un estudio de investigación (dementor) y no se ha validado para uso en producción. No se garantiza la calidad ni la coherencia de las salidas.
- **Sesgos del corpus**: el entrenamiento sobre *writingprompts* puede introducir sesgos propios de los textos de escritura creativa, como estereotipos narrativos o patrones de lenguaje específicos.
- **Riesgo de alucinación**: al ser un adaptador sobre un modelo generativo, existe riesgo de generar contenido falso o inconsistente, especialmente en tareas que requieren hechos verificables.
- **Licencia no declarada**: el adaptador no especifica una licencia, lo que genera incertidumbre sobre su uso comercial. El modelo base GPT-OSS-20B es Apache 2.0, pero el adaptador podría tener restricciones adicionales.
- **Dependencia del modelo base**: el adaptador solo funciona con `openai/gpt-oss-20b`; no es portable a otros modelos sin reentrenamiento.
- **Documentación limitada**: no se proporcionan detalles sobre el dataset exacto, el número de pasos de entrenamiento, la tasa de aprendizaje ni otros hiperparámetros, lo que dificulta la reproducibilidad y la evaluación.
- **Idiomas no especificados**: no se indica qué idiomas soporta el adaptador; aunque el modelo base es multilingüe, el corpus de entrenamiento puede estar mayoritariamente en inglés, limitando su eficacia en otros idiomas.

## Enlaces

- [Repositorio del adaptador en HuggingFace](https://huggingface.co/dementor-research/sft_writingprompts_gpt-oss-20b_as_granite-4-h-small_seed42)
- [Adaptador similar: `sft_writingprompts_gpt-oss-20b_as_qwen3.6-27b_seed42`](https://huggingface.co/dementor-research/sft_writingprompts_gpt-oss-20b_as_qwen3.6-27b_seed42)
- [Adaptador similar: `sft_writingprompts_gemma-4-31b_as_gpt-oss-20b_seed42` en FriendliAI](https://friendli.ai/models/dementor-research/sft_writingprompts_gemma-4-31b_as_gpt-oss-20b_seed42)
- [Adaptador similar: `sft_writingprompts_gpt-oss-120b_as_gpt-oss-20b_seed42` en FriendliAI](https://friendli.ai/models/dementor-research/sft_writingprompts_gpt-oss-120b_as_gpt-oss-20b_seed42)
- [Guía de GPT-OSS en InsiderLLM](https://insiderllm.com/guides/gpt-oss-guide-openai-local/)
