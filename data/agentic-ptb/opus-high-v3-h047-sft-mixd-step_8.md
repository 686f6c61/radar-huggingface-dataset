# agentic-ptb/opus-high-v3.h047.sft-mixd.step_8

## Resumen

El modelo `agentic-ptb/opus-high-v3.h047.sft-mixd.step_8` es un checkpoint intermedio y derivado de un experimento de fine-tuning sobre la base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `agentic-ptb`. Se enmarca dentro de una serie de ejecuciones etiquetadas como `opus-high-v3`, aparentemente generadas mediante un agente de código (Claude Code), y el propio autor lo describe como un artefacto de reproducibilidad y estudio cualitativo, no como un modelo final usable.

La model card incluye una advertencia explícita de interpretación: la ejecución en la que se origina este checkpoint **no encontró ninguna mejora en los pesos entrenados**, y se clasifica como `negative-results`. Es decir, no se debe inferir calidad alguna de su publicación. El repositorio tiene cero descargas y cero likes, y carece de documentación adicional sobre capacidades, benchmarks o datos de entrenamiento.

A pesar de su naturaleza experimental, el checkpoint está disponible bajo licencia Apache 2.0 y en formato safetensors, con un total de aproximadamente 9.410 millones de parámetros. Su interés, si acaso, reside en el estudio de procesos de fine-tuning fallidos y en la trazabilidad de experimentos negativos, más que en su uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,41 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se hereda del modelo base `Qwen/Qwen3.5-9B-Base`, del que no se proporcionan detalles específicos en la documentación del checkpoint. Se trata de un fine-tuning de tipo SFT (supervised fine-tuning) según la ruta `sft-mixd` indicada en la procedencia del artefacto. Sin embargo, no se publican datos sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO.

El checkpoint es el resultado de un paso intermedio (`step_8`) dentro de una ejecución más amplia (`h047`) del proyecto `opus-high-v3`. El autor lo califica como `intermediate` y aclara que el experimento no produjo mejoras en los pesos, lo que lo convierte en un ejemplo de resultado negativo más que en un modelo con innovación técnica destacable.

## Capacidades

No se ha publicado ninguna información sobre las capacidades de este checkpoint. Dado que se trata de un resultado negativo y un artefacto intermedio, no se puede afirmar que posea capacidades específicas de generación, razonamiento, código, tool calling o agentes. La ausencia de documentación y de demos impide cualquier evaluación funcional.

## Casos de uso

Dada la naturaleza del modelo (checkpoint intermedio, resultado negativo, sin mejoras demostradas), no se recomienda su uso en escenarios prácticos. Los únicos casos de uso plausibles serían:

- Reproducibilidad de experimentos: permite replicar el proceso de fine-tuning y verificar la ausencia de mejora reportada.
- Estudio de fallos en fine-tuning: sirve como caso de estudio para analizar por qué un experimento concreto no convergió o no mejoró respecto al modelo base.
- Trazabilidad de artefactos: útil para auditorías de pipelines de entrenamiento y para mantener un registro completo de ejecuciones, incluidas las fallidas.
- Comparación cualitativa: puede usarse para comparar visualmente o mediante métricas internas si el checkpoint introdujo cambios no deseados (por ejemplo, degradación).
- Investigación sobre resultados negativos: contribuye a la literatura de experimentos fallidos, ayudando a la comunidad a evitar errores similares.
- Pruebas de infraestructura: puede servir para validar pipelines de carga de modelos, inferencia o evaluación sin riesgo de afectar a modelos productivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de métricas ni comparaciones con otros modelos. Dado que el propio autor indica que el experimento no encontró mejoras, es probable que no se hayan ejecutado evaluaciones formales o que estas no fueran favorables.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware para este checkpoint. No obstante, al tratarse de un modelo de aproximadamente 9,41 mil millones de parámetros en precisión fp32 o bf16 (según el tamaño del repositorio de 18,8 GB, se infiere una precisión de 16 bits), se puede estimar:

- VRAM estimada para inferencia: entre 18 y 20 GB en fp16/bf16, y entre 9 y 10 GB en cuantización int8 (si se generan versiones cuantizadas, aunque no se ofrecen en el repo).
- GPU recomendadas: tarjetas con al menos 24 GB de VRAM para fp16 (por ejemplo, RTX 3090, RTX 4090, A10G, A100 40GB). Con cuantización int4, podría caber en GPUs de 12 GB, pero no se proporcionan archivos GGUF ni cuantizados.
- Opciones de despliegue: al no existir pesos GGUF ni configuraciones para llama.cpp u Ollama, el despliegue requeriría frameworks compatibles con safetensors como vLLM, Hugging Face Transformers o TGI, siempre que se adapte el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para este checkpoint. Al ser un artefacto intermedio de un experimento fallido, no tiene sentido compararlo con modelos finales de propósito general. La única referencia posible es el propio modelo base `Qwen/Qwen3.5-9B-Base`, del que hereda arquitectura y tamaño, pero no se han publicado métricas que permitan una comparación cuantitativa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Resultado negativo: el autor declara explícitamente que la ejecución no produjo mejoras en los pesos; usar este checkpoint como si fuera un modelo afinado de calidad sería un error.
- Artefacto intermedio: es un paso intermedio (`step_8`) de un proceso mayor, no un modelo final. Puede contener pesos inestables o parcialmente entrenados.
- Sin documentación de capacidades: no hay información sobre idiomas, contexto, sesgos o alucinaciones. No se puede garantizar ningún comportamiento.
- Riesgo de alucinación y sesgos: al derivar de Qwen3.5-9B-Base, podría heredar sesgos del modelo base, pero no hay datos que lo confirmen.
- Licencia: Apache 2.0 permite uso comercial, pero dado el carácter experimental, no se recomienda su uso en producción.
- Reproducibilidad limitada: la model card no detalla el dataset ni los hiperparámetros, lo que dificulta reproducir el experimento.
- Sin soporte comunitario: cero descargas y cero likes indican que no hay comunidad activa ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentic-ptb/opus-high-v3.h047.sft-mixd.step_8
- Dataset asociado (mencionado en la model card): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de datasets del autor: https://huggingface.co/datasets/agentic-ptb/INDEX
- Lista de modelos del autor en Hugging Face: https://huggingface.co/models?other=agentic-ptb
