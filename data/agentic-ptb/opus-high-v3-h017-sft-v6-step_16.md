# agentic-ptb/opus-high-v3.h017.sft-v6.step_16

## Resumen

`opus-high-v3.h017.sft-v6.step_16` es un checkpoint intermedio publicado por el usuario `agentic-ptb` dentro del proyecto AgentPTB, concretamente de la ejecución `opus-high-v3`, una serie de experimentos de fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El checkpoint corresponde a la hora de ejecución `h017` y al paso `step_16` del pipeline SFT-v6.

La model card del autor advierte explícitamente de que se trata de un artefacto derivado retenido con fines de reproducibilidad y estudio cualitativo, y que la ejecución no encontró ninguna mejora en los pesos entrenados. Es decir, este checkpoint no representa un modelo útil para tareas prácticas, sino un registro intermedio de un experimento fallido. El propio autor etiqueta el modelo con `negative-results` y recomienda no inferir calidad a partir de su publicación.

Con 9.409.813.744 parámetros y un tamaño de repositorio de 18,8 GB, el modelo se distribuye en formato `safetensors` bajo licencia Apache 2.0. No se dispone de información sobre su longitud de contexto, idiomas soportados ni capacidades específicas más allá de las heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base, sin detalles adicionales) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos completos en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye mediante fine-tuning supervisado sobre `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9.000 millones de parámetros. No se han publicado detalles sobre la arquitectura interna (número de capas, cabezas de atención, dimensiones ocultas) ni sobre el dataset de entrenamiento utilizado en la etapa SFT. La ejecución `opus-high-v3` pertenece a la serie AgentPTB, que investiga el entrenamiento de modelos mediante agentes basados en Claude Code, pero el checkpoint no incorpora ninguna innovación arquitectónica propia.

El run `opus-high-v3` es la tercera iteración del experimento `opus@high`. Según el índice del proyecto, la segunda iteración (`opus-high-v2`) fue abortada porque sus cinco ejecuciones SFT regresaron y el sistema terminó enviando los tensores del modelo base sin cambios. En el caso de `opus-high-v3`, el propio autor confirma en la model card que no se encontró mejora en los pesos entrenados. No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen3.5-9B-Base, pero no se ha verificado su funcionamiento real tras el fine-tuning.
- Razonamiento y codigo: no hay datos publicados sobre el rendimiento en estas tareas para este checkpoint concreto.
- Tool calling y funciones: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

En resumen, no se puede atribuir ninguna capacidad específica a este modelo más allá de las teóricas del base, y el autor advierte de que no debe inferirse calidad de su publicación.

## Casos de uso

- Reproducibilidad de experimentos: el checkpoint permite a investigadores del proyecto AgentPTB replicar el run `opus-high-v3` y analizar por qué no se produjo mejora en los pesos. Es su único propósito declarado.
- Estudio cualitativo de fallos: puede utilizarse para comparar los checkpoints intermedios de ejecuciones fallidas frente a las exitosas, con el fin de identificar patrones de regresión o degradación en el entrenamiento.
- Auditoria de pipelines SFT: sirve como referencia para depurar el pipeline de fine-tuning supervisado del proyecto, especialmente en lo relativo a la selección de hiperparametros y la validacion de pasos.
- No se recomienda su uso en produccion, ni en aplicaciones de generacion de texto, codigo, atencion al cliente, agentes autonomos o cualquier tarea que requiera un modelo fiable.
- Tampoco es adecuado como base para fine-tuning posterior, dado que no se ha demostrado que sus pesos aporten valor sobre el modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Dado que la ejecucion no encontro mejora en los pesos, no se espera que el checkpoint supere al modelo base en ninguna tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no se dispone de datos oficiales. Para un modelo de 9.400 millones de parametros en precision FP16, se estima un consumo de aproximadamente 18-19 GB de VRAM. Con cuantizacion INT8 bajaría a unos 9-10 GB, y con INT4 a unos 5-6 GB, pero no se han publicado archivos cuantizados para este checkpoint.
- GPU recomendadas: para FP16 serian necesarias tarjetas con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4). Para cuantizacion INT4 podria caber en GPUs de 8 GB (RTX 3060, RTX 4060), siempre que se generen los archivos cuantizados manualmente.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI pueden cargar modelos en formato safetensors, pero no se ha verificado su compatibilidad con este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria. El checkpoint es un artefacto intermedio de un experimento fallido, no un modelo final. Los unicos modelos comparables serian otros checkpoints de la serie AgentPTB (como los de `opus-high-v1` o `opus-high-v2`), pero no se han publicado metricas comparativas entre ellos. Tampoco se conocen diferencias frente al propio Qwen3.5-9B-Base mas alla de la ausencia de mejora declarada por el autor.

## Limitaciones y advertencias

- El autor declara explicitamente que la ejecucion no encontro mejora en los pesos entrenados y que el checkpoint se conserva solo por reproducibilidad. No debe usarse en produccion.
- El modelo esta etiquetado como `negative-results` dentro del proyecto AgentPTB, lo que indica que es un resultado negativo documentado.
- No se ha verificado el comportamiento del modelo en tareas reales; puede presentar alucinaciones, incoherencias o degradacion respecto al modelo base.
- Al ser un checkpoint intermedio (paso 16 de una ejecucion SFT), puede estar a medio entrenar y no representar un estado convergente.
- No se dispone de informacion sobre sesgos del modelo, pero al derivar de Qwen3.5-9B-Base, hereda los posibles sesgos del dataset de entrenamiento del base.
- La licencia Apache 2.0 permite uso comercial, pero dado el estado del modelo, dicho uso no es recomendable.
- No hay garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h017.sft-v6.step_16
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Indice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
