# agentic-ptb/opus-high-v3.h007.sft-v2.step_30

## Resumen

El modelo `agentic-ptb/opus-high-v3.h007.sft-v2.step_30` es un checkpoint intermedio derivado de un experimento de ajuste fino (SFT) sobre la base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `agentic-ptb` dentro del proyecto AgentPTB. Según la model card, se trata de un checkpoint de la ejecución `opus-high-v3` (hora 007) y su propósito es la reproducibilidad y el estudio cualitativo, no la producción. El propio autor advierte explícitamente que la ejecución no encontró ninguna mejora en los pesos entrenados y que no debe inferirse calidad a partir de su publicación.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), está disponible en formato safetensors y se distribuye bajo licencia Apache 2.0. No se proporcionan datos sobre arquitectura interna, longitud de contexto, idiomas soportados ni cuantizaciones. Dado que es un checkpoint intermedio con resultados negativos, su relevancia práctica es limitada; su interés reside en el análisis de reproducibilidad de experimentos de ajuste fino y en el estudio de fallos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se documenta en la información disponible. El modelo base es `Qwen/Qwen3.5-9B-Base`, por lo que se presume una arquitectura transformer densa similar a la de Qwen3.5, aunque no se confirma. El entrenamiento corresponde a un ajuste fino supervisado (SFT) dentro de un pipeline de generación de datos sintéticos mediante Claude Code (run `opus-high-v3`). El autor indica que la ejecución no produjo mejoras en los pesos; de hecho, se menciona en el dataset `agentic-ptb/INDEX` que una ejecución anterior (opus-high-v2) fue abortada y que sus cinco runs de SFT regresaron, enviando los tensores del modelo base sin cambios. Este checkpoint concreto (`step_30`) es un artefacto intermedio retenido para reproducibilidad, no un modelo final optimizado.

## Capacidades

- Generación de texto: al ser un fine-tuning de Qwen3.5-9B-Base, hereda las capacidades básicas de generación de texto del modelo base, aunque no se han verificado en este checkpoint.
- Razonamiento y código: no hay evidencia publicada de capacidades específicas en este checkpoint.
- Tool calling y agentes: no se documenta soporte específico; el proyecto AgentPTB parece orientado a tareas agénticas, pero este checkpoint no presenta resultados que lo confirmen.
- Multilingüismo: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

Dado el carácter de checkpoint intermedio con resultados negativos, no se recomienda su uso en producción. Los casos de uso son principalmente de investigación y análisis:

- Reproducibilidad de experimentos: permite a investigadores replicar el pipeline de SFT y verificar la ausencia de mejora, contribuyendo al estudio de fallos en ajuste fino.
- Análisis de degradación de pesos: útil para estudiar por qué ciertos runs de SFT no logran mejorar el modelo base, comparando tensores antes y después del entrenamiento.
- Benchmarking de pipelines de generación de datos sintéticos: sirve como referencia para evaluar la calidad de los datos generados por Claude Code en el contexto de AgentPTB.
- Estudio de overfitting o underfitting: al ser un checkpoint intermedio (step 30), permite analizar la evolución de la pérdida y los gradientes durante el entrenamiento.
- Comparación de estrategias de regularización: se puede contrastar con otros checkpoints de la misma serie para identificar qué configuraciones evitan la regresión.
- Documentación de resultados negativos: su publicación contribuye a la transparencia en IA, evitando que otros equipos repitan configuraciones fallidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni similares. Dado que el run no encontró mejoras, es probable que el rendimiento sea equivalente o inferior al del modelo base, pero no hay datos numéricos que lo confirmen.

## Requisitos de hardware

No se proporcionan requisitos oficiales. Para un modelo de ~9,4 mil millones de parámetros en precisión FP16, se estima un uso de VRAM de aproximadamente 18-20 GB solo para los pesos, más memoria para activaciones y contexto. Esto implica:

- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB) o superiores; en consumer, una RTX 3090 (24 GB) podría ser suficiente con cuantización, pero no se ofrecen versiones cuantizadas.
- Despliegue: al no existir cuantizaciones GGUF ni otros formatos, la inferencia requeriría cargar los safetensors con frameworks como Transformers o vLLM, siempre que se adapte el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos. El modelo es un fine-tuning de Qwen3.5-9B-Base, por lo que la comparación natural sería con ese modelo base, pero no hay métricas publicadas para este checkpoint. Otras alternativas de tamaño similar (por ejemplo, Llama 3.1 8B, Mistral 7B) no son directamente comparables sin datos de rendimiento. Se indica "no disponible".

## Limitaciones y advertencias

- Resultados negativos: el autor advierte que la ejecución no encontró mejoras en los pesos; no debe usarse como modelo de producción.
- Sesgos y alucinaciones: al ser un checkpoint intermedio sin validación, no se conocen sus sesgos específicos; hereda los del modelo base Qwen3.5-9B-Base, que no se detallan aquí.
- Riesgo de alucinación: no evaluado; se desconoce su fiabilidad en generación de texto.
- Limitaciones de contexto e idioma: no documentadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación, su uso en producción no está recomendado.
- Caveat importante: la model card indica que es un checkpoint "intermediate/derived" y que no se debe inferir calidad a partir de su publicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h007.sft-v2.step_30
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
