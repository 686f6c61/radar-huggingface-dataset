# agentic-ptb/opus-high-v3.h047.sft-mixd.step_12

## Resumen

Este modelo es un checkpoint intermedio del proyecto AgentPTB, concretamente de la ejecución `opus-high-v3` realizada con Claude Code. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B-Base, con aproximadamente 9.400 millones de parámetros. El autor lo etiqueta explícitamente como "negative-results" y advierte en la model card que no se encontró ninguna mejora en los pesos entrenados; se conserva únicamente con fines de reproducibilidad y estudio cualitativo.

La relevancia de este modelo no reside en su rendimiento, sino en que documenta un resultado negativo dentro de un proceso de entrenamiento experimental. Forma parte de una serie de ejecuciones que exploran distintas configuraciones (opus-high-v1, v2, v3) y que, según el índice del proyecto, muestran regresiones o ausencia de mejora. Por tanto, no debe interpretarse como un modelo útil para tareas prácticas, sino como un artefacto de investigación.

El repositorio contiene los pesos en formato safetensors (18,8 GB) y se distribuye bajo licencia Apache 2.0. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni las capacidades específicas más allá de las heredadas del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base, un transformer denso de unos 9.400 millones de parámetros. No se proporcionan detalles adicionales sobre la arquitectura interna (número de capas, cabezas de atención, etc.) en la model card ni en la información disponible. El entrenamiento consistió en un ajuste fino supervisado (SFT) dentro de la ejecución `opus-high-v3` del proyecto AgentPTB, en el paso 12 (step_12) y hora de ejecución h047.

Según la model card, el run "no encontró mejora en los pesos entrenados", lo que significa que el checkpoint resultante no representa una mejora sobre el modelo base. El autor indica que es un checkpoint intermedio/derivado retenido para reproducibilidad y estudio cualitativo. No se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. La etiqueta "negative-results" sugiere que los resultados fueron adversos o nulos en términos de calidad.

## Capacidades

No se ha documentado ninguna capacidad específica para este checkpoint. Al ser un ajuste fino del modelo base Qwen3.5-9B-Base, podría heredar las capacidades generales de ese modelo (generación de texto, razonamiento, código, etc.), pero no hay información verificable sobre ello en la ficha. El autor no publica ninguna evaluación funcional ni lista de habilidades.

Dado que el run no produjo mejoras y el checkpoint se conserva únicamente por reproducibilidad, no se recomienda asumir ninguna capacidad adicional más allá de la del modelo base sin verificación independiente.

## Casos de uso

- Reproducción de experimentos: sirve para replicar el proceso de entrenamiento de AgentPTB y verificar los resultados negativos documentados.
- Estudio de dinámicas de SFT: permite analizar por qué un ajuste fino regresa o no mejora sobre el base, útil para investigación en metodologías de entrenamiento.
- Auditoría de pipelines: puede usarse como referencia para comparar la evolución de los pesos a lo largo de los pasos del run.
- Investigación sobre "negative results": documenta un caso real de no mejora, relevante para la literatura sobre reproducibilidad en IA.
- Análisis de artefactos intermedios: útil para estudiar la representación interna en etapas tempranas del entrenamiento.
- No se recomienda ningún uso en producción o aplicaciones reales, dado que no hay evidencia de calidad y el propio autor desaconseja inferir calidad a partir de la publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. El autor no reporta evaluaciones cuantitativas en la model card.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware para este checkpoint. Como estimación general basada en el tamaño del modelo (9.400 millones de parámetros) y el tamaño del repositorio (18,8 GB en safetensors):

- Para inferencia en FP16 se necesitarían aproximadamente 18,8 GB de VRAM, lo que requiere una GPU de 24 GB (p. ej., RTX 3090, RTX 4090, A10G) o superior.
- Con cuantización a 8 bits (si estuviera disponible) se podría reducir a unos 9,4 GB, y a 4 bits a unos 4,7 GB, aunque no se han publicado versiones cuantizadas.
- Opciones de despliegue: no se ha probado con vLLM, llama.cpp, Ollama o TGI; al ser un checkpoint intermedio sin validación, no se recomienda su uso en esos entornos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas. El modelo base Qwen/Qwen3.5-9B-Base podría servir como referencia, pero no hay datos de rendimiento de este checkpoint frente a él ni frente a otros modelos de tamaño similar (p. ej., Llama 3.1 8B, Mistral 7B). Dado que el run no produjo mejoras, es esperable que su comportamiento sea equivalente o inferior al del base, pero esto no está verificado.

## Limitaciones y advertencias

- Checkpoint intermedio con resultado negativo: el autor declara explícitamente que no hubo mejora en los pesos entrenados; no debe inferirse calidad a partir de su publicación.
- Sin validación funcional: no hay benchmarks, evaluaciones ni demostraciones de capacidades.
- Información incompleta: faltan datos sobre contexto, idiomas, cuantización y arquitectura detallada.
- Riesgo de alucinación y sesgos: no documentados, pero al derivar de Qwen3.5-9B-Base podría heredar los sesgos del modelo base, sin confirmación.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo no es apto para producción por su naturaleza experimental.
- Reproducibilidad limitada: el dataset de entrenamiento (opus-high-v3-data) está disponible, pero no se garantiza que los resultados sean consistentes en otros entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h047.sft-mixd.step_12
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
