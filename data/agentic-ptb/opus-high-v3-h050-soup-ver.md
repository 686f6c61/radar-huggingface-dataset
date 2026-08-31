# agentic-ptb/opus-high-v3.h050.soup-ver

## Resumen

`agentic-ptb/opus-high-v3.h050.soup-ver` es un checkpoint intermedio derivado del modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `agentic-ptb` como parte de un experimento de entrenamiento agéntico denominado **opus-high-v3**. Según la model card, este checkpoint se generó durante una ejecución de Claude Code (run hour `h050`) y se conserva exclusivamente con fines de reproducibilidad y estudio cualitativo.

El propio autor advierte de forma explícita que la ejecución **no encontró ninguna mejora en los pesos entrenados** y que no debe inferirse calidad del modelo a partir de su publicación. Se trata, por tanto, de un artefacto de investigación que documenta un resultado negativo dentro de un pipeline de entrenamiento agéntico, no de un modelo listo para uso en producción. Con 9.409.813.744 parámetros (~9,4B) y un tamaño de repositorio de 18,8 GB en formato safetensors, su relevancia actual reside en el estudio metodológico de los procesos de entrenamiento automático, más que en sus capacidades funcionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base `Qwen/Qwen3.5-9B-Base`, un transformer decoder-only con aproximadamente 9,4 mil millones de parámetros. No se proporcionan detalles adicionales sobre la configuración interna (número de capas, dimensiones de atención, etc.) más allá del tamaño total y el formato de pesos.

El proceso de entrenamiento se enmarca dentro del proyecto **AgentPTB**, que utiliza agentes basados en Claude Code para ejecutar pipelines de fine-tuning. En este caso concreto, el run `opus-high-v3` consistió en varias ejecuciones de SFT (supervised fine-tuning), pero el resultado final fue que **ninguna de ellas produjo una mejora en los pesos**; de hecho, la documentación indica que las cinco ejecuciones de SFT del run regresaron al estado del modelo base. Este checkpoint concreto (`h050.soup-ver`) es un artefacto intermedio retenido para permitir el análisis cualitativo y la reproducción del experimento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Al estar basado en `Qwen/Qwen3.5-9B-Base`, podría heredar las capacidades generales de dicho modelo (generación de texto, razonamiento, código, etc.), pero no existe evidencia de que este checkpoint las preserve o mejore. El autor advierte explícitamente que no se debe inferir calidad funcional a partir de la publicación. Por tanto, las capacidades concretas se consideran **no disponibles** y no se recomienda su uso en tareas reales.

## Casos de uso

Dado que se trata de un checkpoint intermedio sin mejoras de pesos y con advertencia explícita del autor, no existen casos de uso prácticos en producción. Los únicos escenarios razonables son de investigación:

- Reproducibilidad de experimentos: permite a otros investigadores replicar el run `opus-high-v3` y verificar los resultados negativos documentados.
- Estudio cualitativo de checkpoints intermedios: análisis de cómo evolucionan los pesos durante un pipeline de entrenamiento agéntico, incluso cuando no hay mejora final.
- Investigación sobre resultados negativos: documentación de qué configuraciones de SFT no funcionan sobre la base Qwen3.5-9B, útil para evitar repetir errores.
- Desarrollo de metodologías de evaluación de agentes de entrenamiento: el checkpoint sirve como referencia para medir si un agente de Claude Code produce cambios reales en los pesos.
- Comparación de pipelines: puede usarse como baseline para contrastar con otros runs del mismo proyecto (por ejemplo, `opus-high-v2`).
- Auditoría de procesos automáticos: análisis de los artefactos generados por agentes autónomos para detectar fallos en la ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye ninguna tabla de métricas (MMLU, HumanEval, GSM8K, etc.) y el autor no reporta rendimiento alguno, en línea con su advertencia de que no se deben inferir mejoras.

## Requisitos de hardware

No se han publicado requisitos específicos para este checkpoint. Dado su tamaño (~9,4B parámetros) y formato safetensors, se pueden estimar requisitos orientativos para inferencia, aunque el modelo no está destinado a ese fin:

- VRAM estimada en FP16: ~19 GB (9,4B × 2 bytes), lo que requiere una GPU profesional como A100 (40 GB) o una RTX 4090 (24 GB) con margen.
- VRAM estimada con cuantización INT8: ~9,5 GB, viable en GPUs consumer de gama alta como RTX 3080/3090.
- VRAM estimada con cuantización INT4: ~4,7 GB, posible en GPUs con 8 GB o más, aunque no hay archivos GGUF publicados.
- Opciones de despliegue: al no existir versiones cuantizadas ni integraciones publicadas, no se recomienda su uso con vLLM, Ollama o llama.cpp; sería necesario convertirlo manualmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint, por lo que no es posible realizar una comparativa cuantitativa con modelos de tamaño similar. Como referencia estructural, se compara con su modelo base y con otro artefacto del mismo proyecto:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `agentic-ptb/opus-high-v3.h050.soup-ver` | 9,4B | no disponible | no publicado | Apache 2.0 | Checkpoint intermedio |
| `Qwen/Qwen3.5-9B-Base` | 9,4B | no disponible | no publicado | Apache 2.0 | Modelo base oficial |
| `agentic-ptb/opus-high-v2` (referencia) | no disponible | no disponible | no publicado | no disponible | Artefacto de run abortado |

No se conocen modelos comparables publicados por otros autores que ofrezcan métricas verificables para esta categoría.

## Limitaciones y advertencias

- **Checkpoint intermedio sin mejoras**: el propio autor declara que el run no encontró ninguna mejora en los pesos entrenados; no debe usarse como modelo de producción.
- **Advertencia de interpretación**: la model card incluye un aviso explícito de que no se debe inferir calidad del modelo a partir de su publicación.
- **Sin datos de capacidades**: no hay información publicada sobre sesgos, alucinación, idiomas o límites de contexto.
- **Riesgo de uso indebido**: cualquier aplicación que requiera generación de texto fiable podría producir resultados impredecibles, ya que el checkpoint no ha sido validado.
- **Licencia Apache 2.0**: permite uso comercial, pero la ausencia de garantías de calidad y la naturaleza de artefacto de investigación limitan su aplicabilidad práctica.
- **Falta de documentación técnica**: no se especifican hiperparámetros, dataset de entrenamiento ni configuración del run, lo que dificulta la reproducción exacta.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h050.soup-ver)
- [Dataset de archivo del run opus-high-v3](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Dataset INDEX del proyecto AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Modelo base Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
