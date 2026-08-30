# agentic-ptb/opus-high-v3.h004.sft-v1.step_8

## Resumen

El modelo `agentic-ptb/opus-high-v3.h004.sft-v1.step_8` es un checkpoint intermedio derivado de un experimento de ajuste fino supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Lo publica el usuario `agentic-ptb` como parte de un conjunto de ejecuciones etiquetadas como `opus-high-v3`, aparentemente relacionadas con un pipeline de generación de datos mediante Claude Code. El propio autor advierte explícitamente en la model card que se trata de un checkpoint intermedio retenido por reproducibilidad y estudio cualitativo, y que la ejecución no produjo ninguna mejora en los pesos entrenados; por tanto, no debe inferirse calidad alguna a partir de su publicación.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), el modelo hereda la arquitectura del Qwen3.5-9B-Base, aunque no se especifican detalles sobre la longitud de contexto, los idiomas soportados ni el pipeline de inferencia. La licencia es Apache 2.0 y los pesos están en formato safetensors. Su relevancia actual es limitada: se trata de un artefacto de investigación con resultados negativos, útil únicamente para estudiar el proceso de entrenamiento o como referencia de reproducibilidad, no como modelo listo para uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint de un proceso de ajuste fino supervisado (SFT) aplicado sobre el modelo base `Qwen/Qwen3.5-9B-Base`. No se proporcionan detalles sobre la arquitectura interna más allá de la herencia del modelo base, que es un transformer denso de aproximadamente 9,4 mil millones de parámetros. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. El autor indica que el checkpoint proviene de una ejecución etiquetada como `opus-high-v3` (hora de ejecución `h004`) y que el run completo no mostró ninguna mejora en los pesos entrenados; de hecho, se clasifica como `negative-results`. Esto sugiere que el entrenamiento no logró superar al modelo base en las métricas evaluadas, aunque no se detallan dichas métricas.

## Capacidades

- No se dispone de información específica sobre las capacidades del modelo más allá de lo que pueda heredar del modelo base Qwen3.5-9B-Base.
- Al ser un checkpoint intermedio de un SFT sin mejoras confirmadas, no se puede afirmar que tenga capacidades adicionales o mejoradas respecto al base.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento.
- El autor no publica ninguna evaluación funcional del checkpoint.

## Casos de uso

- Reproducibilidad de experimentos: el checkpoint sirve para replicar el proceso de entrenamiento y verificar los resultados negativos reportados por el autor.
- Estudio cualitativo de fallos: puede analizarse para entender por qué el SFT no produjo mejoras, comparando sus pesos con los del modelo base.
- Investigación sobre pipelines de generación de datos con Claude Code: el checkpoint forma parte de un dataset asociado (`agentic-ptb/opus-high-v3-data`) que podría interesar a quienes estudian metodologías de generación sintética.
- No se recomienda su uso en aplicaciones prácticas, dado que es un artefacto intermedio sin validación de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. La única indicación es que el run no mostró mejora en los pesos entrenados, lo que sugiere un rendimiento igual o inferior al modelo base, pero sin datos cuantitativos.

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware para este checkpoint.
- Dado el tamaño de parámetros (9,4 mil millones), una estimación orientativa para inferencia en FP16 requeriría aproximadamente 19-20 GB de VRAM, lo que implicaría una GPU de 24 GB (por ejemplo, RTX 3090, RTX 4090) o una A10G/A100 de 40 GB para mayor comodidad.
- Con cuantización a 8 bits (INT8) se podría reducir a unos 10-11 GB, y a 4 bits (INT4) a unos 5-6 GB, aunque no se proporcionan archivos GGUF ni cuantizaciones oficiales en el repositorio.
- No se indican opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI). Al ser un checkpoint safetensors, podría cargarse con frameworks estándar como Transformers, pero no hay garantía de compatibilidad.
- No se conocen datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. Al ser un checkpoint intermedio de un experimento fallido, no tiene sentido compararlo con alternativas comerciales o de código abierto consolidadas. La única referencia razonable es su modelo base, `Qwen/Qwen3.5-9B-Base`, del cual no se proporcionan especificaciones detalladas en la información disponible. Por tanto, la comparativa se limita a indicar que no hay datos.

## Limitaciones y advertencias

- Es un checkpoint intermedio con resultados negativos: el autor advierte explícitamente que no se debe inferir calidad de su publicación.
- No se ha validado su rendimiento en ninguna tarea; no debe utilizarse en producción ni en entornos donde se requiera fiabilidad.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia Apache 2.0 permite uso comercial, pero dado el estado del modelo, cualquier uso práctico sería desaconsejable.
- El repositorio no incluye documentación sobre el proceso de entrenamiento más allá de la model card, lo que dificulta su reproducción completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h004.sft-v1.step_8
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de datasets de agentic-ptb: https://huggingface.co/datasets/agentic-ptb/INDEX
