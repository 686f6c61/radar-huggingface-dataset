# dementor-research/self_sft_gsm8k_gpt-oss-20b_as_gpt-oss-20b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste fino supervisado (SFT) entrenado sobre el modelo base `openai/gpt-oss-20b` como parte de un estudio de imitación de comportamiento definido por configuración. El adaptador, denominado `self_sft_gsm8k_gpt-oss-20b_as_gpt-oss-20b_seed42`, se entrenó con el dataset GSM8K (problemas de razonamiento matemático) utilizando la librería Tinker de Thinking Machines. El objetivo es mejorar la capacidad del modelo base en tareas de razonamiento aritmético mediante un ajuste fino con LoRA de rango 32 sobre todas las capas lineales.

El modelo se publica como un adaptador PEFT (Parameter-Efficient Fine-Tuning) con pesos en formato safetensors, ocupando 1.0 GB. No se proporciona información sobre la licencia, los idiomas soportados ni el pipeline de uso. Es un artefacto de investigación experimental, sin documentación adicional sobre rendimiento o limitaciones. Su relevancia radica en demostrar un enfoque de auto-SFT (self-SFT) sobre un modelo de 20 mil millones de parámetros, aunque no se ofrecen métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: openai/gpt-oss-20b) |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 32, pero no se indica el número de parámetros) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería peft) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `openai/gpt-oss-20b`, del cual no se proporcionan detalles de arquitectura en la información disponible. El entrenamiento se realizó mediante la técnica LoRA (Low-Rank Adaptation) con rango 32 y `target_modules=all-linear`, es decir, se adaptaron todas las capas lineales del modelo base. El dataset utilizado fue GSM8K, un conjunto de problemas matemáticos de nivel escolar. La etapa de entrenamiento se denomina `SELF_SFT`, lo que sugiere un proceso de autoajuste supervisado, posiblemente generando datos sintéticos a partir del propio modelo base. No se especifican hiperparámetros adicionales, número de tokens de entrenamiento ni si se aplicó RLHF o DPO. El adaptador se publica con la librería PEFT y se carga mediante `PeftModel` de HuggingFace.

## Capacidades

- Ajuste fino supervisado sobre GSM8K para mejorar el razonamiento matemático del modelo base.
- Adaptación de todas las capas lineales del modelo base mediante LoRA (rango 32).
- Capacidad de integración con el ecosistema HuggingFace Transformers y PEFT.
- No se documentan capacidades específicas adicionales (tool calling, agentes, multilingüismo, etc.) en la información disponible.

## Casos de uso

- Investigación en adaptación eficiente de parámetros: sirve como ejemplo de un pipeline de auto-SFT con LoRA sobre un modelo de 20B, útil para estudios comparativos de técnicas de ajuste fino.
- Mejora de razonamiento matemático en modelos base: al estar entrenado con GSM8K, puede utilizarse como punto de partida para tareas de resolución de problemas aritméticos, aunque no se han publicado métricas de rendimiento.
- Base para experimentos de imitación de comportamiento: el estudio "dementor" explora configuraciones definidas por código, por lo que este adaptador puede usarse para reproducir o extender dichos experimentos.
- Pruebas de integración con PEFT: desarrolladores pueden usar este adaptador para verificar la carga de LoRA sobre `gpt-oss-20b` en sus entornos.
- Análisis de efectos de LoRA en modelos grandes: permite estudiar cómo el ajuste de rango 32 afecta al comportamiento del modelo base en tareas específicas.
- Generación de datasets sintéticos: el proceso de self-SFT puede servir como referencia para crear datos de entrenamiento a partir de modelos existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador, ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 1.0 GB, pero requiere cargar el modelo base `openai/gpt-oss-20b` (20 mil millones de parámetros) para su uso.
- VRAM estimada: no disponible. Depende del modelo base y de la precisión de inferencia (por ejemplo, fp16 o int8).
- GPU recomendadas: no disponible. Un modelo de 20B típicamente necesita GPUs con al menos 40 GB de VRAM en fp16 (p.ej., A100, H100) o cuantización para GPUs de consumo (p.ej., RTX 4090 con 24 GB).
- Opciones de despliegue: compatible con Transformers y PEFT; puede usarse con vLLM, TGI u Ollama si se exporta el modelo fusionado, pero no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA sobre gpt-oss-20b o modelos de razonamiento matemático). No se puede realizar una comparativa fiable.

## Limitaciones y advertencias

- Adaptador experimental sin documentación de rendimiento ni validación en tareas reales.
- No se especifica la licencia, por lo que su uso comercial es incierto.
- No se indican idiomas soportados; probablemente hereda las capacidades del modelo base, pero no se confirma.
- Riesgo de alucinación y sesgos inherentes al modelo base `gpt-oss-20b`, no mitigados por el adaptador.
- Al ser un adaptador LoRA, no es un modelo autónomo; requiere el modelo base completo para funcionar.
- No se proporcionan instrucciones de cuantización ni de despliegue en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/self_sft_gsm8k_gpt-oss-20b_as_gpt-oss-20b_seed42
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Librería Tinker (referenciada en el README): https://thinkingmachines.ai/tinker/
