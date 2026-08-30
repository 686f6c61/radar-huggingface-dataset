# agentic-ptb/opus-high-v3.h094.sft-long.step_12

## Resumen

`agentic-ptb/opus-high-v3.h094.sft-long.step_12` es un checkpoint intermedio derivado del modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `agentic-ptb` como parte del experimento de entrenamiento denominado **opus-high-v3**, ejecutado mediante Claude Code. Este checkpoint corresponde a la hora de ejecución `h094` y al paso `step_12` de un proceso de ajuste fino supervisado (SFT) con contexto largo.

El propio autor advierte en la model card que se trata de un checkpoint intermedio retenido únicamente para reproducibilidad y estudio cualitativo, y que el run **no encontró ninguna mejora en los pesos entrenados** (resultado negativo). Por tanto, no debe inferirse calidad a partir de su publicación. El modelo tiene aproximadamente 9.410 millones de parámetros (9,4B) y un tamaño de repositorio de 18,8 GB en formato `safetensors`. Su licencia es Apache 2.0.

Dado que es un artefacto de investigación con resultados negativos, su relevancia práctica es limitada; su interés reside en documentar un proceso experimental y permitir análisis posteriores sobre por qué el entrenamiento no produjo mejoras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `Qwen/Qwen3.5-9B-Base`, cuya arquitectura es un transformer denso (sin información pública detallada sobre atención o innovaciones específicas en esta versión). El checkpoint fue obtenido tras un proceso de ajuste fino supervisado con contexto largo (`sft-long`), utilizando datos generados en el run `opus-high-v3` de Claude Code. Los datos de entrenamiento están archivados en el dataset `agentic-ptb/opus-high-v3-data`.

Según la model card, el run no produjo ninguna mejora en los pesos respecto al modelo base. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La ausencia de mejora sugiere que el ajuste no logró capturar señales útiles o que los datos no eran adecuados para la tarea.

## Capacidades

- No se han documentado capacidades específicas más allá de las heredadas del modelo base `Qwen/Qwen3.5-9B-Base`.
- Dado el resultado negativo del entrenamiento, no se puede garantizar que el modelo mantenga las capacidades del base ni que ofrezca mejoras en razonamiento, generación de código o multilingüismo.
- No hay información sobre soporte de tool calling, agentes, visión o modos especiales de razonamiento.
- El modelo se publica únicamente como artefacto de investigación; no se recomienda su uso para tareas prácticas.

## Casos de uso

- **Estudio de reproducibilidad**: permite a otros investigadores replicar el experimento `opus-high-v3` y verificar los resultados negativos.
- **Análisis de fallos de entrenamiento**: sirve para investigar por qué el ajuste fino no mejoró los pesos, comparando el checkpoint con el modelo base.
- **Evaluación de métricas intermedias**: puede utilizarse para medir la evolución de la pérdida o el rendimiento en pasos intermedios del entrenamiento.
- **Investigación sobre datos sintéticos**: los datos del run (archivados en el dataset asociado) pueden analizarse junto al checkpoint para estudiar la calidad de los datos generados por Claude Code.
- **Comparación de arquitecturas**: permite comparar el comportamiento de un modelo de 9B entrenado con datos generados por un LLM propietario frente a otros ajustes.
- **No apto para producción**: no se recomienda su uso en aplicaciones reales, ni siquiera como base para fine-tuning posterior, dado el resultado negativo documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica que el run no mostró mejora, por lo que no se esperan resultados destacables.

## Requisitos de hardware

- **VRAM estimada para inferencia**: un modelo de 9,4B parámetros en precisión fp16 ocupa aproximadamente 18,8 GB (coincide con el tamaño del repositorio). Para inferencia con cuantización Q4 (si estuviera disponible) se necesitarían unos 5-6 GB.
- **GPU recomendadas**: para fp16, una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40GB). Para cuantización ligera, una RTX 3060 de 12 GB podría ser suficiente.
- **Compatibilidad con GPU de consumo**: sí, con cuantización adecuada, aunque no se proporcionan archivos GGUF en el repositorio.
- **Opciones de despliegue**: al ser un checkpoint de investigación sin cuantizaciones publicadas, las opciones estándar serían vLLM, llama.cpp (si se convierte a GGUF) o Transformers con carga en fp16.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

Dado que no hay datos de rendimiento, la comparación se limita a aspectos estructurales.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `agentic-ptb/opus-high-v3...` | 9,4B | no disponible | Apache 2.0 | Checkpoint intermedio, resultado negativo |
| `Qwen/Qwen3.5-9B-Base` | ~9,4B | no disponible | Apache 2.0 (presumiblemente) | Modelo base original |
| `meta-llama/Llama-3.1-8B` | 8B | 128K | Llama 3.1 Community | Alternativa densa de tamaño similar, con rendimiento documentado |

No hay información pública que permita comparar rendimiento real entre estos modelos.

## Limitaciones y advertencias

- **Resultado negativo**: el entrenamiento no produjo ninguna mejora en los pesos; el modelo no es mejor que su base y puede ser incluso peor.
- **Checkpoint intermedio**: no es un modelo final, sino un artefacto de un paso concreto de un run experimental.
- **Sesgos y alucinaciones**: hereda los sesgos del modelo base Qwen; no se han evaluado específicamente.
- **Sin documentación de capacidades**: no se especifican idiomas, contexto ni tareas soportadas.
- **Licencia**: Apache 2.0 permite uso comercial, pero dado el resultado negativo, no se recomienda su uso en producción.
- **Reproducibilidad**: el dataset asociado está disponible, pero no se garantiza que los datos sean de alta calidad o estén libres de errores.

## Enlaces

- Modelo en HuggingFace: [agentic-ptb/opus-high-v3.h094.sft-long.step_12](https://huggingface.co/agentic-ptb/opus-high-v3.h094.sft-long.step_12)
- Dataset asociado: [agentic-ptb/opus-high-v3-data](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- Búsqueda de modelos del autor: [HuggingFace con filtro agentic-ptb](https://huggingface.co/models?other=agentic-ptb)
