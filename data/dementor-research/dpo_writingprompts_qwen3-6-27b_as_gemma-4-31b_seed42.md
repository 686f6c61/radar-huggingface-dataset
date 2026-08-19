# dementor-research/dpo_writingprompts_qwen3.6-27b_as_gemma-4-31b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3.6-27B, con el objetivo de imitar el comportamiento de Gemma-4-31B en tareas de escritura a partir de prompts. Forma parte de un estudio de imitación de comportamiento denominado «dementor», desarrollado por el equipo dementor-research, y ha sido entrenado con la herramienta Tinker de Thinking Machines.

El adaptador está diseñado para ajustar las preferencias del modelo base en la generación de textos creativos, probablemente mejorando la adherencia a instrucciones de escritura y el estilo de salida. Sin embargo, se trata de un artefacto experimental: no se proporcionan métricas de rendimiento, licencia, ni detalles sobre el dataset de entrenamiento más allá de que se usaron «writing prompts». Su relevancia actual es limitada, ya que es un resultado intermedio de una campaña de investigación con 528 configuraciones, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.6-27B (arquitectura del base no especificada) |
| Parametros totales | No disponible (el adaptador pesa 1.0 GB; el base es de 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA de rango 32 sobre todos los módulos lineales del modelo base Qwen/Qwen3.6-27B. La etapa de entrenamiento es DPO, una técnica de optimización de preferencias que alinea el modelo con respuestas preferidas frente a no preferidas. El dataset utilizado se denomina «writing prompts», pero no se especifican su tamaño ni composición. El objetivo declarado es imitar el comportamiento de Gemma-4-31B, lo que sugiere que se usaron salidas de ese modelo como referencias positivas.

No se documentan innovaciones técnicas adicionales ni detalles sobre el proceso de entrenamiento (número de pasos, tasa de aprendizaje, etc.). La campaña «dementor» incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas, lo que indica un estudio sistemático de imitación conductual.

## Capacidades

- Generación de texto: el adaptador está diseñado para mejorar la escritura siguiendo prompts, probablemente con un estilo más cercano al de Gemma-4-31B.
- No se documentan capacidades específicas de razonamiento, código, matemáticas, visión, tool calling o agentes.
- Las capacidades multilingües dependen del modelo base, pero no se confirman para este adaptador.
- No se indica soporte de thinking mode ni otras funcionalidades especiales.

## Casos de uso

- Investigación académica: estudiar técnicas de imitación de comportamiento entre modelos de lenguaje mediante adaptadores LoRA y DPO.
- Ajuste fino experimental: servir como punto de partida para evaluar si la imitación de un modelo más grande (Gemma-4-31B) mediante un adaptador sobre un modelo de 27B mejora la calidad de escritura creativa.
- Benchmarking de preferencias: comparar la efectividad de DPO frente a otras técnicas de alineación en tareas de generación de texto.
- Desarrollo de pipelines de PEFT: probar la integración de adaptadores LoRA con el ecosistema Hugging Face (transformers + peft).
- Exploración de datasets de escritura: analizar cómo un dataset de writing prompts influye en el estilo y la coherencia de las respuestas.
- Reproducibilidad: dado que se especifica la semilla 42, es posible reproducir el entrenamiento y verificar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador o su configuración.

## Requisitos de hardware

- El adaptador LoRA pesa 1.0 GB y se carga sobre el modelo base Qwen/Qwen3.6-27B, que requiere una GPU con al menos 16-20 GB de VRAM en FP16 (estimación orientativa para un modelo de 27B, no confirmada).
- GPU recomendadas: NVIDIA A100 (40 GB), H100 (80 GB), o RTX 4090 (24 GB) con cuantización del modelo base.
- Es posible ejecutar en consumer GPUs si se cuantiza el modelo base (por ejemplo, con bitsandbytes), pero no hay guías oficiales.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que soporten carga de adaptadores PEFT. El ejemplo de uso en la model card emplea `transformers` y `peft`.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se conocen adaptadores equivalentes con el mismo propósito (imitar Gemma-4-31B sobre Qwen3.6-27B) en la información proporcionada. La comparación natural sería contra el modelo base sin adaptador y contra Gemma-4-31B, pero no se ofrecen métricas para establecer una comparativa objetiva.

## Limitaciones y advertencias

- Es un artefacto experimental sin licencia especificada; su uso comercial es incierto.
- No hay garantías de calidad de generación ni de ausencia de sesgos; el dataset de writing prompts puede introducir sesgos estilísticos o temáticos.
- Riesgo de alucinación y de respuestas incoherentes, como cualquier modelo de lenguaje, sin evaluación adicional.
- Depende completamente del modelo base Qwen/Qwen3.6-27B; cualquier limitación de este (contexto, idiomas, sesgos) se hereda.
- No se documentan restricciones de contexto ni de idioma, por lo que no se recomienda su uso en producción sin validación previa.
- La ausencia de benchmarks impide conocer su rendimiento real frente a alternativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_writingprompts_qwen3.6-27b_as_gemma-4-31b_seed42
- Herramienta Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
