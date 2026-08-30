# agentic-ptb/opus-high-v3.h023.sft-distil-cont.step_10

## Resumen

`opus-high-v3.h023.sft-distil-cont.step_10` es un checkpoint intermedio publicado por el proyecto AgentPTB, un experimento de fine-tuning agéntico sobre el modelo base Qwen/Qwen3.5-9B-Base. El identificador indica que pertenece a la celda `opus-high-v3`, que fue escrita en la hora 23 de un run de 100 horas, y que corresponde al paso 10 de un proceso de SFT con destilación continua (`sft-distil-cont`). El propio autor lo etiqueta como `intermediate` y `negative-results`.

La relevancia de este modelo no reside en su rendimiento, sino en su papel como artefacto de reproducibilidad dentro de un estudio más amplio sobre entrenamiento agéntico. La model card advierte explícitamente que el run no encontró ninguna mejora en los pesos entrenados y que no debe inferirse calidad a partir de su publicación. Por tanto, es un checkpoint de investigación, no un modelo listo para uso práctico.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), el modelo ocupa 18,8 GB en formato safetensors. No se proporcionan datos sobre longitud de contexto, idiomas soportados ni pipeline de uso, más allá de su origen como fine-tune de Qwen3.5-9B-Base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de Qwen/Qwen3.5-9B-Base (transformer decoder-only, presumiblemente) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles (solo safetensors en precision original) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint derivado de un proceso de fine-tuning supervisado (SFT) con destilación continua sobre el modelo base Qwen3.5-9B-Base. El nombre `sft-distil-cont` sugiere que se trata de una continuación de un entrenamiento previo de destilación, probablemente sobre un dataset agéntico multi-turno que captura uso de herramientas, razonamiento y rasgos de identidad, según la temática del proyecto AgentPTB.

El run `opus-high-v3` se ejecutó durante 100 horas y este checkpoint corresponde a la hora 23. La model card indica que no se encontró mejora alguna en los pesos entrenados, lo que clasifica el experimento como un resultado negativo. No se proporcionan detalles sobre el dataset exacto, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El autor recomienda no inferir calidad a partir de esta publicación y lo conserva únicamente con fines de reproducibilidad y estudio cualitativo.

## Capacidades

- No se han demostrado capacidades específicas para este checkpoint, dado que el run no produjo mejoras sobre el modelo base.
- Al ser un fine-tune de Qwen3.5-9B-Base, podría heredar las capacidades del modelo base (generación de texto, razonamiento, código, etc.), pero no hay evidencia de que el fine-tune haya añadido o mejorado nada.
- No se dispone de información sobre tool calling, capacidades agénticas o multilingüismo específicas de este checkpoint.
- El autor lo clasifica como `negative-results`, por lo que no debe considerarse funcionalmente superior al modelo base.

## Casos de uso

- Reproducibilidad de experimentos: este checkpoint sirve para replicar el run `opus-high-v3` y verificar los resultados negativos reportados, permitiendo a otros investigadores auditar el proceso de entrenamiento.
- Estudio cualitativo de fallos: puede utilizarse para analizar por qué el fine-tune no converge o no mejora, comparando sus pesos con los del modelo base y con otros checkpoints del mismo run.
- Análisis de curvas de rendimiento: al estar identificado por la hora del run (`h023`), permite trazar la evolución de las métricas a lo largo del tiempo y entender en qué punto el entrenamiento deja de aportar.
- Investigación sobre destilación continua: útil para estudiar los efectos de la destilación en modelos de tamaño medio y por qué en este caso no se observa beneficio.
- No es adecuado para uso en producción, atención al cliente, generación de código u otras aplicaciones prácticas, dado que no hay evidencia de rendimiento y el autor desaconseja su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. El autor únicamente indica que el run no encontró mejora en los pesos entrenados, sin proporcionar cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16 (formato safetensors): aproximadamente 19-20 GB, asumiendo un modelo de 9,4 B con overhead de activaciones. Esto cabe en una GPU de 24 GB como la RTX 4090 o A5000, pero no en GPUs de 16 GB o inferiores.
- Para cuantización int8 o int4, se necesitarían conversiones adicionales que no están publicadas; la VRAM bajaría a ~10 GB y ~5 GB respectivamente, pero no hay archivos GGUF ni AWQ disponibles.
- GPU recomendadas: RTX 4090, A100 40GB, H100, o cualquier GPU con al menos 24 GB de VRAM para fp16.
- Opciones de despliegue: al no haber cuantizaciones, solo es posible cargarlo con transformers o vLLM en fp16. No se ha probado con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dado que es un checkpoint de investigación fallido, no se han realizado mediciones de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3.5-9B-Base (modelo base) | 9,4 B | no disponible | Apache-2.0 | Modelo base de referencia |
| opus-high-v3.h023.sft-distil-cont.step_10 | 9,4 B | no disponible | Apache-2.0 | Checkpoint intermedio, resultado negativo |
| Otros checkpoints de AgentPTB (p. ej. grok.h023.sft-v6.step_800) | variable | no disponible | Apache-2.0 | Checkpoints de experimentos similares |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a aspectos estructurales, ya que el autor no ha publicado métricas para ninguno de ellos.

## Limitaciones y advertencias

- Resultado negativo: el run no produjo ninguna mejora en los pesos entrenados. No debe inferirse calidad ni utilidad a partir de la publicación.
- Checkpoint intermedio: no es un modelo final, sino un punto intermedio de un proceso de entrenamiento que se considera fallido.
- Sin benchmarks: no hay métricas de rendimiento que respalden su uso en ninguna tarea.
- Datos incompletos: no se especifican idiomas, longitud de contexto, ni detalles del dataset de entrenamiento.
- Uso en producción desaconsejado: no hay evidencia de que funcione correctamente para tareas reales, y el propio autor lo etiqueta como `negative-results`.
- Sesgos y alucinaciones: al ser un derivado de Qwen3.5-9B-Base, podría heredar sesgos del modelo base, pero no hay estudios específicos sobre este checkpoint.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero dado el estado del modelo, no se recomienda su despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h023.sft-distil-cont.step_10
- Dataset asociado al run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Otro checkpoint de referencia del mismo proyecto: https://huggingface.co/agentic-ptb/grok.h023.sft-v6.step_800
