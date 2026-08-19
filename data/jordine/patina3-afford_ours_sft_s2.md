# Jordine/patina3-afford_ours_sft_s2

## Resumen

El modelo `Jordine/patina3-afford_ours_sft_s2` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `meta-llama/Llama-3.1-8B`. El nombre del repositorio sugiere un fine-tuning orientado a tareas de *affordance* (percepción de las posibilidades de uso de objetos en un entorno), aunque la documentación publicada no confirma este propósito. Fue publicado por el usuario Jordine en HuggingFace el 16 de agosto de 2026, con un tamaño de repositorio de 0.7 GB, lo que indica que contiene únicamente los pesos del adaptador, no el modelo completo.

La relevancia de este modelo radica en su naturaleza de adaptador eficiente: permite especializar un modelo de 8 mil millones de parámetros mediante técnicas PEFT (Parameter-Efficient Fine-Tuning) sin necesidad de reentrenar todos los pesos. Sin embargo, la ausencia de una model card detallada, de datos de entrenamiento y de resultados de evaluación limita severamente su utilidad práctica para desarrolladores que necesiten evaluar su rendimiento de manera objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre meta-llama/Llama-3.1-8B (transformer decoder) |
| Parametros totales | No disponible (el adaptador tiene pesos propios, pero no se especifica el numero) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base, 128k tokens, pero no se confirma) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base soporta varios idiomas, pero no se especifica para el adaptador) |
| Licencia | No disponible (la del modelo base es Llama 3.1 Community License, pero no se indica para el adaptador) |
| Formato de pesos | safetensors (segun los tags y el contenido del repositorio) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura de Llama-3.1-8B, un transformer decoder con atención multi-cabeza y normalización RMSNorm. La técnica LoRA introduce matrices de bajo rango en las capas de atención y feed-forward, reduciendo drásticamente el número de parámetros entrenables. El tag `sft_s2` indica que se utilizó fine-tuning supervisado (SFT), probablemente en una segunda etapa (s2). No se dispone de información sobre el dataset de entrenamiento, el número de tokens, el uso de RLHF/DPO ni los hiperparámetros empleados. El repositorio incluye la etiqueta `peft` y la referencia al paper de LoRA (arXiv:1910.09700), lo que confirma el uso de esta técnica, pero no aporta detalles adicionales.

## Capacidades

- No se ha documentado ninguna capacidad específica del adaptador. Se asume que hereda las capacidades generales del modelo base Llama-3.1-8B (generación de texto, razonamiento, código, matemáticas, multilingüismo), pero sin garantías de que el fine-tuning haya preservado o potenciado alguna de ellas.
- El nombre del modelo sugiere una posible especialización en tareas de *affordance* (por ejemplo, razonamiento sobre acciones posibles con objetos), pero no hay evidencia publicada que lo confirme.
- No se indica soporte para tool calling, agentes, visión, audio ni modos de razonamiento especiales.

## Casos de uso

- No se han documentado casos de uso concretos en la información disponible. Dada la falta de documentación y de benchmarks, no es posible recomendar aplicaciones prácticas fiables. Un desarrollador podría experimentar con el adaptador como punto de partida para fine-tuning adicional, pero carecería de referencias sobre su comportamiento esperado.
- En un contexto de investigación, podría utilizarse para estudiar el impacto de LoRA sobre Llama-3.1-8B en tareas de *affordance*, pero se necesitaría acceso al dataset de entrenamiento y a los hiperparámetros para reproducir o evaluar el trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica estándar. Tampoco se proporcionan comparativas con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de inferencia son los del modelo base Llama-3.1-8B más la carga del adaptador. El adaptador añade una sobrecarga mínima en memoria (los pesos del adaptador son pequeños, aproximadamente 0.7 GB en formato safetensors).
- Para inferencia con Llama-3.1-8B en precisión FP16 se necesitan aproximadamente 16 GB de VRAM. Con cuantización a 4 bits (por ejemplo, mediante bitsandbytes o GGUF), se puede reducir a unos 6-8 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3060 (12 GB) o RTX 4090 (24 GB).
- GPUs recomendadas para un rendimiento fluido: A100 (40/80 GB), H100 (80 GB) para despliegue en producción; RTX 4090 para experimentación local.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, todos compatibles con adaptadores LoRA (vía PEFT o mediante la fusión de pesos).
- Latencia y throughput: no disponibles para este adaptador específico. Para el modelo base, en una A100 se pueden esperar decenas de tokens por segundo, pero no hay datos verificados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adaptadores o modelos de la misma categoría. El modelo no tiene documentación, benchmarks ni datos de entrenamiento públicos, por lo que cualquier comparación sería especulativa. Se indica "no disponible".

## Limitaciones y advertencias

- La documentación es prácticamente inexistente: la model card está rellena con marcadores "[More Information Needed]". No se conocen los datos de entrenamiento, el propósito exacto ni los criterios de evaluación.
- El adaptador hereda los sesgos y limitaciones del modelo base Llama-3.1-8B, que incluyen posibles sesgos socioculturales, riesgo de alucinación y limitaciones en idiomas de bajos recursos.
- La licencia no está especificada para el adaptador. Aunque el modelo base tiene la Llama 3.1 Community License, no se puede asumir que el adaptador la herede automáticamente; es necesario contactar al autor para aclarar los términos de uso.
- No hay garantía de que el fine-tuning haya sido realizado con datos de calidad o que el modelo sea seguro para uso en producción. Se recomienda una evaluación exhaustiva antes de cualquier despliegue.
- El nombre "afford_ours" sugiere una posible especialización en un dominio concreto, pero sin confirmación, no se debe asumir ningún comportamiento específico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jordine/patina3-afford_ours_sft_s2
- Paper de LoRA (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
