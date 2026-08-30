# agentic-ptb/opus-high-v3.h049.sft-verified.step_16

## Resumen

`opus-high-v3.h049.sft-verified.step_16` es un checkpoint intermedio y derivado publicado por el usuario `agentic-ptb` dentro del proyecto AgentPTB, un experimento de fine-tuning supervisado (SFT) ejecutado mediante Claude Code. El modelo parte de la base `Qwen/Qwen3.5-9B-Base`, un modelo de lenguaje de 9.409.813.744 parámetros, y se distribuye bajo licencia Apache-2.0 en formato safetensors.

La model card es explícita al advertir que se trata de un artefacto de reproducibilidad y estudio cualitativo: el run no produjo ninguna mejora de pesos entrenados (resultado negativo). Por tanto, este checkpoint no debe interpretarse como un modelo con capacidades mejoradas respecto a su base, sino como un registro intermedio de un experimento fallido. Su relevancia actual es exclusivamente metodológica: permite auditar el proceso de SFT y comparar la evolución de los pesos a lo largo de las horas de entrenamiento.

No se dispone de información sobre la arquitectura interna concreta más allá de su origen en Qwen3.5-9B-Base, ni sobre la longitud de contexto, idiomas soportados o benchmarks. El propio autor recomienda no inferir calidad a partir de esta publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (deriva de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos sobre la arquitectura interna de este checkpoint. Al estar basado en `Qwen/Qwen3.5-9B-Base`, se asume que hereda la arquitectura transformer de dicho modelo base, pero no hay confirmación independiente en la información disponible.

El entrenamiento corresponde a un run de SFT dentro del experimento `opus-high-v3` del proyecto AgentPTB, ejecutado a la hora `h049` y guardado en el paso `step_16`. La procedencia indicada es `scratch/agent/sft-verified/weights/step_16`. Según la advertencia del autor, el run no encontró ninguna mejora de pesos entrenados, lo que clasifica el resultado como negativo. No se especifican los datos de entrenamiento utilizados, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un fine-tuning del modelo base Qwen3.5-9B-Base, podría esperarse que herede capacidades generales de generación de texto, razonamiento y código, pero no existe verificación independiente ni benchmarks que lo confirmen. Dado el aviso explícito de ausencia de mejora de pesos, no se recomienda atribuir ninguna capacidad adicional al modelo.

## Casos de uso

No se recomienda ningún caso de uso práctico para este checkpoint. Su única finalidad declarada es la reproducibilidad y el estudio cualitativo de un run de SFT con resultado negativo. Posibles usos académicos o de investigación:

- Auditoría de procesos de fine-tuning: permite inspeccionar los pesos en un paso intermedio para entender por qué el entrenamiento no convergió.
- Comparación de checkpoints: útil para estudiar la evolución de la pérdida y la actualización de parámetros a lo largo del run.
- Reproducción de experimentos: sirve como referencia para replicar el pipeline de AgentPTB y validar la infraestructura de entrenamiento.
- Análisis de fallos: investigación de sesgos o problemas de optimización que llevaron al resultado negativo.

No es adecuado para despliegue en producción ni para tareas de generación de texto, código o razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se han documentado requisitos específicos para este checkpoint. Como referencia orientativa, un modelo de 9.409.813.744 parámetros en precisión FP16 requiere aproximadamente 19 GB de VRAM para inferencia, y unos 38 GB en FP32. Sin embargo, estos valores no han sido verificados para este checkpoint concreto y no constituyen una recomendación oficial.

No se dispone de información sobre GPUs recomendadas, latencia, throughput ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El checkpoint es un artefacto intermedio sin métricas publicadas. Como referencia estructural, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache-2.0 | Modelo base oficial |
| agentic-ptb/opus-high-v3.h049.sft-verified.step_16 | 9,4B | no disponible | Apache-2.0 | Checkpoint intermedio, resultado negativo |

No se conocen modelos comparables en la misma categoría de checkpoints de SFT con resultado negativo.

## Limitaciones y advertencias

- El autor advierte explícitamente que el run no encontró ninguna mejora de pesos entrenados; no se debe inferir calidad de esta publicación.
- Es un checkpoint intermedio y derivado, no un modelo final. No está pensado para uso directo en aplicaciones.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto e idioma.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo no tiene valor práctico demostrado para producción.
- La ausencia de benchmarks y de documentación técnica impide evaluar su rendimiento real.
- Cualquier uso debe limitarse a fines de reproducibilidad y análisis experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h049.sft-verified.step_16
- Dataset asociado del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de datasets de AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
