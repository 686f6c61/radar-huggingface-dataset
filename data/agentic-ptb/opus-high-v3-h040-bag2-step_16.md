# agentic-ptb/opus-high-v3.h040.bag2.step_16

## Resumen

El modelo `agentic-ptb/opus-high-v3.h040.bag2.step_16` es un checkpoint intermedio derivado de un proceso de fine-tuning experimental denominado **AgentPTB opus-high-v3**, desarrollado por el usuario `agentic-ptb`. Se trata de un paso (step 16) dentro de un run de entrenamiento que utiliza como base el modelo Qwen/Qwen3.5-9B-Base. El propio autor lo clasifica como un artefacto de reproducibilidad y estudio cualitativo, no como un modelo listo para uso práctico.

La model card indica explícitamente que el run **no encontró mejora en los pesos entrenados** (etiqueta `negative-results`), es decir, el checkpoint no representa un avance sobre el modelo base. Su utilidad principal es permitir la reproducción del experimento y el análisis de la dinámica de entrenamiento, no la inferencia en producción. Con 9.409.813.744 parámetros y formato safetensors, su tamaño es comparable al de otros modelos de la familia Qwen de 9B, pero carece de documentación sobre capacidades o rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen/Qwen3.5-9B-Base (arquitectura interna no especificada en la información disponible) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna del modelo más allá de su origen: es un checkpoint generado durante un run de fine-tuning sobre Qwen/Qwen3.5-9B-Base, utilizando un proceso experimental llamado `opus-high-v3` dentro del proyecto AgentPTB. El run se identifica como `h040` (hora 40) y el checkpoint proviene de `scratch/agent/bag2/weights/step_16`.

No se especifican los datos de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF o DPO. La model card advierte que el run **no produjo mejoras en los pesos**, lo que sugiere que el proceso de fine-tuning no logró superar al modelo base. El checkpoint se conserva únicamente con fines de reproducibilidad y análisis cualitativo, tal como indica la advertencia de interpretación incluida en la model card.

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Al ser un artefacto intermedio sin mejoras confirmadas, no se puede garantizar ninguna funcionalidad concreta. Las capacidades que pudiera heredar del modelo base Qwen3.5-9B-Base (generación de texto, razonamiento, etc.) no están documentadas en la información disponible.

## Casos de uso

Dado su carácter de resultado negativo y su naturaleza intermedia, los casos de uso son limitados y orientados a la investigación:

- Reproducción de experimentos: permite verificar los resultados del run `opus-high-v3` y comparar con otros checkpoints del mismo proceso.
- Estudio de dinámica de entrenamiento: analizar cómo evolucionan los pesos en un run que no converge, útil para depurar pipelines de fine-tuning.
- Baseline negativo en investigación: sirve como referencia de un modelo que no mejora respecto a su base, para contrastar con runs exitosos.
- Auditoría de reproducibilidad: comprobar que los artefactos publicados coinciden con los pesos generados en el entorno original.
- Docencia en ML: ejemplo didáctico de cómo documentar y publicar resultados negativos en experimentos de fine-tuning.
- Comparación de arquitecturas: evaluar si el proceso de entrenamiento altera la estructura interna del modelo base, aunque no mejore su rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Al tratarse de un checkpoint intermedio sin mejoras confirmadas, no se dispone de datos de rendimiento comparables.

## Requisitos de hardware

Al no especificarse cuantizaciones ni requisitos oficiales, se ofrecen estimaciones genéricas para un modelo de ~9,4B parámetros en formato FP16:

- VRAM estimada para inferencia en FP16: aproximadamente 19-20 GB (considerando pesos y overhead de activaciones).
- Con cuantización INT8 (no disponible en el repo, pero posible mediante conversión): ~9,5-10 GB.
- GPU recomendadas: tarjetas con 24 GB o más, como RTX 3090/4090, A100 (40 GB) o H100.
- En consumer GPU: cabría en RTX 3090/4090 (24 GB) con FP16, aunque no está optimizado para ello.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se convierta el modelo a formatos compatibles (GGUF, etc.). Sin embargo, al ser un checkpoint intermedio sin mejoras, no se recomienda su uso en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base Qwen/Qwen3.5-9B-Base es el único punto de referencia directo, pero no se han publicado métricas del checkpoint que permitan comparar. Alternativas de tamaño similar como Llama 3.1 8B o Mistral 7B no son comparables sin datos de rendimiento. Por tanto, la comparativa se limita a parámetros y licencia:

| Modelo | Parametros | Contexto | Licencia | Resultado |
|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h040.bag2.step_16 | 9,4B | no disponible | Apache-2.0 | Intermedio, sin mejora |
| Qwen/Qwen3.5-9B-Base | 9,4B (aprox.) | no disponible | Apache-2.0 | Base original |
| Llama 3.1 8B | 8B | 128K (según versión) | Llama 3.1 | Modelo establecido |

## Limitaciones y advertencias

- Resultado negativo: el run no produjo mejoras en los pesos entrenados, por lo que el checkpoint no ofrece ventajas sobre el modelo base.
- Sin documentación de capacidades: no se garantiza ningún comportamiento específico (generación, razonamiento, etc.).
- Riesgo de alucinación y sesgos: al derivar de Qwen3.5-9B-Base, podría heredar sesgos del modelo base, pero no hay evidencia empírica.
- No apto para producción: no está diseñado ni validado para uso real; debe tratarse como artefacto de investigación.
- Contexto y cuantizaciones no especificados: limita su despliegue práctico.
- Licencia Apache-2.0 permite uso comercial, pero la falta de garantías de calidad lo desaconseja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h040.bag2.step_16
- Dataset asociado (run archive): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de modelos AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
