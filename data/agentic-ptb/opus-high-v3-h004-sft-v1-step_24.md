# agentic-ptb/opus-high-v3.h004.sft-v1.step_24

## Resumen

`opus-high-v3.h004.sft-v1.step_24` es un checkpoint intermedio derivado de un run de entrenamiento del proyecto AgentPTB, concretamente de la celda `opus-high-v3` ejecutada con Claude Code. El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y ha sido sometido a un proceso de fine-tuning supervisado (SFT) en el paso 24 de la ejecución. El autor lo clasifica explícitamente como un resultado negativo: el run no produjo ninguna mejora en los pesos entrenados, por lo que el checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), este modelo se enmarca en la categoría de tamaño medio. Su licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque su naturaleza de checkpoint intermedio sin mejoras documentadas lo hace inadecuado para aplicaciones en producción. La relevancia de esta publicación reside en la transparencia del proceso experimental: documentar resultados negativos es esencial para evitar duplicar esfuerzos y para comprender los límites de las metodologías de entrenamiento actuales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles específicos sobre la arquitectura interna del modelo más allá de su origen en `Qwen/Qwen3.5-9B-Base`. Dado que Qwen3.5 es una familia de modelos transformer densos, es razonable asumir una arquitectura transformer estándar, pero no se dispone de confirmación oficial en la información proporcionada.

El entrenamiento consistió en un fine-tuning supervisado (SFT) dentro del marco AgentPTB, utilizando los datos del dataset `agentic-ptb/opus-high-v3-data`. El run se ejecutó durante 4 horas (h004) y alcanzó el paso 24. Según la advertencia del autor, el proceso no logró mejorar los pesos respecto al modelo base; de hecho, el run `opus-high-v2` fue abortado porque sus cinco ejecuciones SFT regresaron a los tensores del modelo base sin cambios. Esto sugiere problemas de convergencia o de configuración del entrenamiento, aunque no se ofrecen más detalles.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un derivado de Qwen3.5-9B-Base, podría heredar capacidades generales de generación de texto, razonamiento y código del modelo base, pero no hay evidencia de que el fine-tuning haya añadido o mejorado ninguna habilidad concreta. El autor no proporciona ejemplos de uso ni demos.

## Casos de uso

Dado el carácter de resultado negativo y la falta de mejoras verificadas, no se recomienda su uso en aplicaciones prácticas. Los únicos casos de uso razonables son:

- Reproducibilidad experimental: investigadores pueden utilizar este checkpoint para replicar el run y estudiar por qué el entrenamiento no convergió.
- Análisis cualitativo: comparar los pesos de este checkpoint con los del modelo base para entender qué cambios (o ausencia de cambios) ocurrieron durante el SFT.
- Auditoría de procesos: como referencia para validar pipelines de entrenamiento y detectar fallos en la configuración de hiperparámetros.
- Educación: ejemplo de cómo documentar resultados negativos en la investigación de IA.
- Benchmarking de herramientas: evaluar si el framework AgentPTB produce checkpoints consistentes a lo largo del tiempo.
- Estudio de degradación: verificar si el fine-tuning introdujo regresiones en tareas específicas respecto al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. Dado que el run se considera fallido, es probable que no se hayan ejecutado evaluaciones formales.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware para este checkpoint. Sin embargo, al tratarse de un modelo de aproximadamente 9,4 mil millones de parámetros en formato safetensors (18,8 GB en el repositorio), se puede estimar que:

- Para inferencia en FP16 se necesitarían al menos 19 GB de VRAM, lo que supera la capacidad de GPUs consumer como la RTX 4090 (24 GB) pero es viable en ella.
- En cuantización de 8 bits, la VRAM requerida bajaría a unos 10 GB, permitiendo su uso en GPUs como la RTX 3080 o la RTX 4070 Ti.
- En 4 bits, aproximadamente 5 GB, ejecutable en GPUs más modestas.
- No se han proporcionado opciones de despliegue específicas, pero al ser un modelo transformer estándar, sería compatible con vLLM, llama.cpp, Ollama o TGI, siempre que se adapte el formato de pesos.

Estas estimaciones son orientativas y no sustituyen pruebas reales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar este checkpoint con otros modelos. La única referencia directa es su modelo base, `Qwen/Qwen3.5-9B-Base`, pero no se han publicado métricas comparativas entre ambos. Dado que el run no produjo mejoras, es probable que el rendimiento sea idéntico o inferior al del base, pero no hay evidencia empírica para afirmarlo.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final ni está pensado para uso en producción.
- Resultado negativo: el autor advierte explícitamente que no se encontró mejora en los pesos entrenados; no debe inferirse calidad a partir de la publicación.
- Falta de documentación: no hay información sobre arquitectura, contexto, idiomas ni capacidades específicas.
- Riesgo de alucinación y sesgos: al derivar de Qwen3.5-9B-Base, podría heredar sesgos del modelo base, pero no se han evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la falta de garantías de rendimiento hace desaconsejable su uso en entornos productivos.
- Reproducibilidad limitada: el dataset asociado (`agentic-ptb/opus-high-v3-data`) está disponible, pero no se garantiza que el checkpoint sea útil para fines prácticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h004.sft-v1.step_24
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos AgentPTB: https://huggingface.co/models?other=agentic-ptb
