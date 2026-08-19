# sbcho0325/EXAONE-3.5-7.8B-verireason_random_sft_seed2026_step170

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-verireason_random_sft_seed2026_step170` es un adaptador LoRA (Low-Rank Adaptation) publicado en HuggingFace, que se construye sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por LG AI Research. El adaptador fue entrenado mediante *supervised fine-tuning* (SFT) con una semilla aleatoria (seed 2026) y un checkpoint intermedio (paso 170), lo que sugiere que forma parte de un experimento de ajuste fino orientado a tareas de razonamiento o verificación de respuestas (el nombre "verireason" apunta a *verification reasoning*).

La relevancia de este modelo radica en que permite adaptar un LLM ya potente de 7.800 millones de parámetros a una tarea específica sin necesidad de reentrenar toda la red, reduciendo costes computacionales y de almacenamiento. Sin embargo, la documentación proporcionada es extremadamente escasa: la model card no incluye detalles sobre los datos de entrenamiento, hiperparámetros, evaluación ni licencia. Por tanto, esta ficha se basa principalmente en la información del modelo base y en los metadatos del repositorio, marcando como "no disponible" todo aquello que no se ha especificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base: EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (el adaptador ocupa 0.3 GB; el modelo base tiene 7.800 millones) |
| Parametros activos | No disponible (al ser LoRA, solo se activan los pesos del adaptador durante el ajuste) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta hasta 48.000 tokens (según documentación de LG) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors del adaptador) |
| Idiomas soportados | No disponible para el adaptador; el modelo base soporta principalmente coreano e inglés |
| Licencia | No disponible (el modelo base usa la EXAONE AI License, con restricciones de uso comercial) |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA, que congela los pesos del modelo base e inyecta matrices de bajo rango en las capas de atención y feed-forward. Esto permite un ajuste eficiente con un número reducido de parámetros entrenables. El modelo base, EXAONE-3.5-7.8B-Instruct, es un transformer decoder-only con 7.800 millones de parámetros, optimizado para instrucciones y diálogo, y entrenado con un corpus multilingüe (coreano e inglés principalmente). El adaptador fue entrenado mediante SFT, pero no se han publicado detalles sobre el dataset utilizado, el número de tokens, la composición de los datos ni el proceso de alineación (RLHF/DPO). El nombre del repositorio sugiere que el entrenamiento se realizó con una semilla aleatoria fija (seed 2026) y se guardó un checkpoint en el paso 170, lo que indica un experimento de corta duración.

## Capacidades

- Al ser un adaptador sobre EXAONE-3.5-7.8B-Instruct, hereda teóricamente las capacidades del modelo base: generación de texto, razonamiento, comprensión lectora, y soporte para instrucciones en coreano e inglés.
- El nombre "verireason" sugiere que el adaptador se ha entrenado para tareas de verificación o razonamiento lógico, aunque no se ha confirmado con evaluaciones.
- No se ha documentado soporte para *tool calling*, *function calling*, agentes, visión, audio u otras capacidades especiales.
- No se ha verificado si el adaptador mantiene el rendimiento original del modelo base en tareas generales; es posible que el ajuste fino lo degrade en dominios fuera del objetivo.

## Casos de uso

- **Investigación académica en adaptación de modelos**: sirve como ejemplo de un experimento de SFT con LoRA, útil para estudiar el impacto de la semilla aleatoria y el número de pasos en el rendimiento.
- **Prototipado de sistemas de razonamiento**: si el adaptador efectivamente mejora la verificación de respuestas, podría integrarse en pipelines de *chain-of-thought* o *self-consistency* para tareas de QA.
- **Ajuste fino en entornos con recursos limitados**: al ser un adaptador de solo 0.3 GB, se puede cargar sobre el modelo base en GPUs de consumo, facilitando experimentos en laboratorios pequeños.
- **Evaluación de robustez**: dado que el entrenamiento usó una semilla aleatoria, se puede comparar con otros adaptadores entrenados con diferentes semillas para analizar la variabilidad del SFT.
- **Aplicaciones en coreano**: si el modelo base soporta coreano, el adaptador podría usarse en tareas de razonamiento en ese idioma, aunque no hay evidencia de que el ajuste haya sido específico para ello.
- **Benchmarking de metodologías**: sirve como caso de estudio para comparar la eficacia de LoRA frente a fine-tuning completo en modelos de tamaño medio.

Nota: estos casos son hipotéticos, ya que no se ha publicado ninguna evaluación o demostración del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este adaptador. Tampoco se ha comparado con el modelo base u otros modelos similares en términos de rendimiento.

## Requisitos de hardware

- **VRAM estimada**: para cargar el modelo base (7.800 M de parámetros) junto con el adaptador LoRA, se necesitan aproximadamente 16 GB de VRAM en FP16 (por ejemplo, una RTX 4080 o A10G). Con cuantización a 8 bits (bitsandbytes) se puede reducir a unos 8-10 GB, permitiendo su uso en GPUs como la RTX 3060 o RTX 4070.
- **GPU recomendadas**: A100 (40/80 GB), H100, RTX 4090, o GPUs de consumo con al menos 16 GB de VRAM para inferencia sin cuantizar.
- **Compatibilidad con GPUs de consumo**: sí, es posible ejecutarlo en una RTX 3090/4090 con cuantización, o en una RTX 3060 12 GB con cuantización a 4 bits.
- **Opciones de despliegue**: dado que es un adaptador PEFT, se puede cargar con la librería `transformers` y `peft`; también es compatible con `vLLM` (si se fusiona el adaptador) y `llama.cpp` (si se convierte a GGUF). No se ha probado con `Ollama` ni `TGI` oficialmente.
- **Latencia y throughput**: no disponible; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

Dado que el adaptador no tiene métricas propias, la comparación se limita al modelo base y a otros LLMs de tamaño similar.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7.800 M | 48.000 tokens | EXAONE AI License (uso no comercial) | Modelo coreano-inglés, optimizado para instrucciones |
| Llama-3.1-8B-Instruct | 8.030 M | 128.000 tokens | Llama 3.1 Community License (uso comercial permitido) | Multilingüe, amplia comunidad |
| Qwen2.5-7B-Instruct | 7.610 M | 32.000 tokens | Apache 2.0 | Multilingüe, buen rendimiento en razonamiento |
| Adaptador LoRA (este modelo) | ~0.3 GB (adaptador) | Hereda del base | No disponible | Sin evaluación pública |

La comparación directa no es posible sin datos de rendimiento. El adaptador solo añade una capa de ajuste sobre el modelo base, por lo que su comportamiento dependerá del SFT aplicado.

## Limitaciones y advertencias

- **Documentación ausente**: la model card no proporciona información sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia, lo que impide evaluar su calidad y uso responsable.
- **Sesgos del modelo base**: EXAONE-3.5-7.8B-Instruct puede presentar sesgos lingüísticos o culturales derivados de su entrenamiento mayoritariamente en coreano e inglés; el adaptador no los corrige.
- **Riesgo de alucinación**: al ser un modelo generativo, puede producir respuestas inventadas o incorrectas, especialmente en dominios fuera de su entrenamiento.
- **Restricciones de licencia**: el modelo base usa la EXAONE AI License, que restringe el uso comercial y la redistribución; el adaptador no especifica su licencia, por lo que se debe asumir que hereda las restricciones del base.
- **Limitaciones de contexto**: aunque el base soporta 48.000 tokens, no se ha verificado que el adaptador mantenga esa capacidad; el entrenamiento con SFT podría degradarla.
- **Riesgo de overfitting**: al ser un checkpoint temprano (paso 170) con una semilla aleatoria, es posible que el adaptador no haya convergido o que esté sobreajustado al dataset de entrenamiento, lo que reduciría su generalización.
- **Uso en producción**: no se recomienda su uso en entornos productivos sin una evaluación exhaustiva, dado que no hay garantías de rendimiento ni de estabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-verireason_random_sft_seed2026_step170
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper de LoRA (referencia técnica): https://arxiv.org/abs/2106.09685
- Paper de EXAONE (si existe, no confirmado): no disponible
