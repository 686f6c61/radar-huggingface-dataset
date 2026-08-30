# agentic-ptb/opus-high-v3.h025.sft-v7.step_4

## Resumen

`agentic-ptb/opus-high-v3.h025.sft-v7.step_4` es un checkpoint intermedio derivado de un experimento de ajuste fino supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El autor, `agentic-ptb`, lo publica como parte de un run de Claude Code denominado `opus-high-v3`, en la hora `h025` y con procedencia `scratch/agent/sft-v7/weights/step_4`. La etiqueta `negative-results` y la advertencia explícita en la model card indican que el entrenamiento no produjo ninguna mejora en los pesos; el checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo.

El modelo tiene 9.409.813.744 parámetros (9,4B) y se distribuye en formato `safetensors` con licencia Apache-2.0. No se proporciona información sobre longitud de contexto, cuantizaciones, idiomas soportados ni capacidades específicas más allá de las heredadas del modelo base. Dado que el autor advierte explícitamente que no se debe inferir calidad a partir de esta publicación, este checkpoint no es adecuado para uso productivo y debe tratarse como un artefacto de investigación sobre fallos en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint se construye sobre el modelo base `Qwen/Qwen3.5-9B-Base`, que es un transformer denso de 9,4B parámetros. No se dispone de detalles sobre la arquitectura interna específica del modelo base en la información proporcionada. El entrenamiento corresponde a un run de SFT (supervised fine-tuning) con datos del conjunto `opus-high-v3` (publicado como dataset `agentic-ptb/opus-high-v3-data`), pero no se especifican el número de tokens, la composición del dataset ni el procedimiento exacto (por ejemplo, si se usó RLHF o DPO). El propio autor indica que el run no encontró ninguna mejora en los pesos entrenados, lo que sugiere que el proceso de ajuste no logró converger o que los datos no aportaron señal útil. No hay información sobre innovaciones técnicas adicionales.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint.
- Al ser un derivado de `Qwen/Qwen3.5-9B-Base`, podría heredar las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.), pero no hay ninguna verificación ni evaluación publicada que lo confirme.
- El autor marca el resultado como negativo, por lo que no se puede asumir que el modelo funcione correctamente en ninguna tarea.
- No se menciona soporte de tool calling, agentes, multilingüismo ni modos especiales.

## Casos de uso

- Reproducibilidad de experimentos: el checkpoint sirve para replicar y analizar el proceso de entrenamiento fallido, permitiendo a otros investigadores estudiar por qué el SFT no produjo mejoras.
- Investigación sobre fallos de entrenamiento: puede utilizarse como caso de estudio para depurar pipelines de SFT, comparar con otros checkpoints del mismo run o con el modelo base.
- No se recomienda su uso en producción, en aplicaciones de atención al cliente, generación de código, análisis de datos ni ningún otro escenario práctico, dado que no hay evidencia de que funcione correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta ninguna métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.) y, dado el carácter negativo del resultado, es probable que no existan evaluaciones favorables.

## Requisitos de hardware

- No se proporcionan requisitos específicos de hardware para este checkpoint.
- Al tratarse de un modelo de ~9,4B parámetros en formato `safetensors`, una inferencia en FP16 requeriría aproximadamente 19 GB de VRAM (solo pesos), pero no hay datos sobre latencia, throughput ni configuraciones recomendadas.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- Dado que el checkpoint no tiene valor práctico, no se recomienda invertir en infraestructura para su uso.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar este checkpoint con otros modelos. La única referencia razonable es el modelo base `Qwen/Qwen3.5-9B-Base`, del cual deriva, pero no hay métricas publicadas que permitan una comparación objetiva. No se conocen alternativas de la misma categoría con resultados negativos documentados.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | Apache-2.0 |
| agentic-ptb/opus-high-v3.h025.sft-v7.step_4 | 9,4B | no disponible | sin mejoras reportadas | Apache-2.0 |

## Limitaciones y advertencias

- El autor declara explícitamente que el run no encontró ninguna mejora en los pesos entrenados; el checkpoint es un resultado negativo.
- No se debe inferir calidad ni funcionalidad a partir de esta publicación.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para producción debido a la falta de validación.
- El checkpoint es un artefacto intermedio (paso 4 de un run de SFT) y puede contener pesos parcialmente entrenados o degradados respecto al modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h025.sft-v7.step_4
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de datasets de agentic-ptb: https://huggingface.co/datasets/agentic-ptb/INDEX
