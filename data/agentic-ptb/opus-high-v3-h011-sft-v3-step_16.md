# agentic-ptb/opus-high-v3.h011.sft-v3.step_16

## Resumen

`opus-high-v3.h011.sft-v3.step_16` es un checkpoint intermedio derivado del modelo base Qwen/Qwen3.5-9B-Base, generado durante un run de entrenamiento del proyecto AgentPTB, concretamente en la celda `opus-high-v3` (una variante de alta calidad del conjunto de datos `opus`). El autor, `agentic-ptb`, lo publica con el rol de `intermediate`, es decir, como un artefacto de reproducibilidad y estudio cualitativo, no como un modelo listo para producción.

El dato más relevante es que el propio autor advierte explícitamente en la model card que el run no produjo ninguna mejora de pesos entrenados: se trata de un resultado negativo. Esto significa que el checkpoint no debe interpretarse como un modelo con capacidades mejoradas respecto a su base, sino como un registro del proceso de entrenamiento. La arquitectura es la de Qwen3.5-9B-Base, con 9.409.813.744 parámetros, y los pesos se distribuyen en formato safetensors.

A pesar de su naturaleza intermedia, el modelo tiene interés para investigadores que estudian dinámicas de entrenamiento, fallos de convergencia o reproducibilidad en pipelines de ajuste fino supervisado (SFT). No se dispone de información sobre longitud de contexto, cuantizaciones, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B-Base, un transformer denso de aproximadamente 9.400 millones de parámetros. No se especifican detalles adicionales sobre la configuración interna (número de capas, cabezas de atención, etc.) en la información disponible.

El entrenamiento corresponde a un run de SFT (supervised fine-tuning) dentro del proyecto AgentPTB, concretamente en la celda `opus-high-v3`. Según la documentación del proyecto, este run se ejecutó durante 11 horas (`h011`) y produjo el checkpoint en el paso 16 (`step_16`). El autor indica que el run no encontró ninguna mejora de pesos entrenados, lo que sugiere que el ajuste fino no logró superar el rendimiento del modelo base. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: al ser un checkpoint de Qwen3.5-9B-Base, conserva las capacidades básicas de generación de texto del modelo base, aunque sin mejoras demostradas.
- Razonamiento y código: no hay evidencia de que el SFT haya aportado capacidades adicionales; se espera que el rendimiento sea equivalente o inferior al del modelo base.
- Tool calling y agentes: no se ha verificado soporte específico en este checkpoint.
- Multilingüismo: no se ha publicado información sobre idiomas soportados.
- Capacidades especiales: ninguna documentada.

Dado el carácter de resultado negativo, no se recomienda utilizar este modelo para tareas prácticas. Sus capacidades reales no han sido validadas y el autor desaconseja inferir calidad a partir de su publicación.

## Casos de uso

- Reproducibilidad de experimentos: investigadores pueden utilizar este checkpoint para replicar el run de entrenamiento y estudiar por qué no se produjo mejora de pesos.
- Análisis de dinámicas de SFT: permite examinar cómo evoluciona un modelo durante los primeros pasos de ajuste fino y qué condiciones llevan a un resultado negativo.
- Comparación de checkpoints intermedios: útil para auditar pipelines de entrenamiento y verificar la integridad de los pesos guardados.
- Estudio de fallos de convergencia: sirve como caso de estudio para entender cuándo un run de SFT no logra superar al modelo base.
- Validación de herramientas de seguimiento: puede emplearse para probar sistemas de logging y monitorización de entrenamiento.
- Documentación de resultados negativos: contribuye a la transparencia en IA, mostrando que no todos los runs producen mejoras.

En todos los casos, el uso es exclusivamente investigador o de auditoría. No es adecuado para aplicaciones de producción, atención al cliente, generación de código o cualquier tarea que requiera un modelo fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Dado que el run se considera un resultado negativo, es probable que el rendimiento sea igual o inferior al de Qwen3.5-9B-Base, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de un modelo de 9.400 millones de parámetros en precisión fp16, se estima un consumo de aproximadamente 18-20 GB de VRAM para inferencia sin cuantizar.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) sería necesaria para cargar el modelo en fp16. Para cuantizaciones de 8 bits o 4 bits, podría caber en GPUs de 12-16 GB, pero no se han publicado cuantizaciones oficiales.
- Consumer GPU: sí, es posible ejecutarlo en GPUs de gama alta para consumidores, siempre que se aplique cuantización.
- Opciones de despliegue: al ser un checkpoint intermedio sin validación, no se recomienda desplegarlo. En caso de hacerlo, se podría usar vLLM, llama.cpp u Ollama, pero no hay garantías de funcionamiento correcto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache-2.0 | Modelo base oficial |
| agentic-ptb/opus-high-v3.h011.sft-v3.step_16 | 9,4B | no disponible | Apache-2.0 | Checkpoint intermedio, resultado negativo |
| Otros modelos de 9B (p.ej. Llama 3.1 8B) | 8B | 128K | Llama 3.1 | Modelo final validado |

La comparación directa con Qwen3.5-9B-Base es la más relevante, ya que este checkpoint es un derivado directo. No se dispone de datos de rendimiento para establecer diferencias cuantitativas. Frente a otros modelos de tamaño similar, carece de validación y de documentación de capacidades, por lo que no es comparable en términos prácticos.

## Limitaciones y advertencias

- Resultado negativo: el propio autor declara que el run no produjo ninguna mejora de pesos entrenados. No debe inferirse calidad a partir de su publicación.
- Sin validación: no hay benchmarks, evaluaciones ni pruebas de capacidades publicadas.
- Checkpoint intermedio: no es un modelo final; puede contener pesos incompletos o estados de entrenamiento no óptimos.
- Riesgo de alucinación: al ser un derivado de Qwen3.5-9B-Base, hereda los riesgos típicos de alucinación de los modelos de lenguaje, pero sin garantías de comportamiento estable.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo no es apto para producción debido a su falta de validación.
- Documentación escasa: no se especifican contexto, idiomas, ni detalles de entrenamiento más allá del run.
- Reproducibilidad limitada: el run archive está disponible en un dataset separado, pero no se detallan los hiperparámetros ni el dataset de SFT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h011.sft-v3.step_16
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
