# mlx-community/Qwen3.5-122B-A10B-OptiQ-2bit-REAP-63B

## Resumen

El modelo `mlx-community/Qwen3.5-122B-A10B-OptiQ-2bit-REAP-63B` es una variante podada y cuantizada del modelo de mezcla de expertos (MoE) Qwen3.5-122B-A10B, publicada por la comunidad MLX para ejecución local en Apple Silicon. Se trata de un checkpoint derivado de `mlx-community/Qwen3.5-122B-A10B-OptiQ-2bit`, al que se le ha aplicado una poda de expertos mediante el método REAP (Cerebras Research, ICLR 2026) directamente en el dominio cuantizado, sin dequantizar ni reentrenar. El resultado es un modelo de 63.400 millones de parámetros (frente a los 122.000 millones del original) que conserva los 8 expertos activos por token, por lo que la latencia de inferencia no aumenta respecto al padre, pero el tamaño en disco se reduce un 45% (de 43,6 GB a 23,8 GB).

La relevancia de este modelo radica en que demuestra una vía práctica para comprimir MoE de gran tamaño mediante poda de expertos en cuantización de 2 bits, manteniendo la capacidad de razonamiento y generación de texto del modelo original. Está pensado para desarrolladores que necesitan ejecutar un LLM de nivel 122B en hardware de consumo (Mac con memoria unificada) sin sacrificar la velocidad de inferencia. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5, 256 expertos por capa, 128 retenidos, 8 activos por token |
| Parametros totales | 63.400 millones (63,4B) |
| Parametros activos | 10.000 millones (10B) por token |
| Longitud de contexto | no disponible (no especificado en la documentacion) |
| Tipos de cuantizacion | 2 bits (OptiQ 2bit) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una poda de expertos del checkpoint cuantizado `mlx-community/Qwen3.5-122B-A10B-OptiQ-2bit`. La arquitectura subyacente es un transformer MoE con 256 expertos por capa y enrutamiento top-8, es decir, 8 expertos activos por token. La poda elimina 128 de los 256 expertos en cada capa, de forma uniforme, conservando los 128 de mayor relevancia según el criterio REAP (conditional mean of router weight × expert output norm). Los expertos retenidos se copian bit a bit del padre cuantizado, sin dequantización, re-cuantización, fusión ni reentrenamiento. El enrutamiento se mantiene intacto (top-8), por lo que los parámetros activos por token no cambian.

El método REAP se aplica en el dominio cuantizado mediante la herramienta `optiq prune-experts` de MLX-OptiQ, con calibración sobre una mezcla de seis dominios y 8 muestras. No se ha realizado entrenamiento adicional; el modelo se publica tal cual tras la poda. La divergencia KL medida respecto al padre sin podar es de 0,077, muy por debajo del umbral de 1,0 a partir del cual la degradación se vuelve visible.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo Qwen3.5-122B-A10B.
- Razonamiento y resolucion de problemas, con capacidad de seguir instrucciones complejas.
- Generacion de codigo y comprension de lenguajes de programacion (el modelo base Qwen3.5 destaca en tareas de codigo).
- Soporte de tool calling y function calling (capacidad del modelo base, no verificada en esta variante).
- Capacidades multilingues (idiomas no especificados en la documentacion de esta variante).
- No se mencionan capacidades de vision, audio ni modo thinking especifico en la documentacion.

## Casos de uso

- Ejecucion local de un LLM de gran tamano en Mac con memoria unificada: gracias a su tamano reducido (23,8 GB en disco) y a que mantiene 10B parametros activos, puede ejecutarse en equipos con 32 GB o 64 GB de RAM, algo inviable con el modelo padre de 43,6 GB.
- Desarrollo de asistentes conversacionales privados: al ser Apache 2.0 y ejecutarse localmente, permite construir chatbots sin enviar datos a servidores externos, adecuado para entornos con requisitos de privacidad.
- Generacion de codigo asistida en entornos offline: el modelo base Qwen3.5 tiene buen rendimiento en tareas de programacion; esta variante conserva la capacidad de generacion de codigo con una huella de memoria reducida.
- Prototipado rapido de aplicaciones con MLX: al estar integrado con `mlx-lm` y `mlx-optiq`, se puede cargar y servir con pocas lineas de codigo, ideal para experimentacion.
- Fine-tuning o adaptacion posterior: al mantener la arquitectura MoE con 128 expertos, es posible aplicar tecnicas de ajuste fino (LoRA, etc.) sobre esta base comprimida.
- Evaluacion de tecnicas de compresion de MoE: sirve como referencia para estudiar el impacto de la poda de expertos en cuantizacion de 2 bits sobre el rendimiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint especifico. La model card indica explicitamente que "This variant was not separately benchmarked". Sin embargo, se menciona que el mismo procedimiento (50% de retencion de expertos) fue validado en un modelo hermano, `Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B`, con los siguientes resultados comparados con su padre sin podar:

| Benchmark | Padre | Podado | Diferencia |
|---|---|---|---|
| Capability Score | 80,03 | 76,57 | -3,46 |
| MMLU | - | - | -21,4 |
| GSM8K | - | - | +2,6 |
| IFEval | - | - | +4,3 |
| BFCL | - | - | -1,0 |
| HumanEval | - | - | -1,3 |

Estos datos son orientativos y no deben extrapolarse directamente a este modelo, pero sugieren que la poda al 50% mantiene la capacidad procedimental (razonamiento matematico, seguimiento de instrucciones) a costa de una caida en conocimiento factual (MMLU).

## Requisitos de hardware

- VRAM estimada: al ser un modelo MLX de 2 bits, el checkpoint ocupa 23,8 GB en disco. En memoria unificada de Apple Silicon, se recomienda al menos 32 GB de RAM para cargar el modelo con margen para el contexto y la generacion.
- GPU recomendadas: cualquier Mac con chip Apple Silicon (M1, M2, M3, M4) y al menos 32 GB de memoria unificada. Modelos con 64 GB o mas permiten contextos largos.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) porque MLX esta disenado exclusivamente para Apple Silicon; para GPUs NVIDIA habria que convertir los pesos a otro formato (GGUF, etc.), lo cual no esta previsto.
- Opciones de despliegue: `mlx-lm` (carga y generacion), `mlx-optiq serve` (servidor compatible con OpenAI), o integracion en aplicaciones Python.
- Latencia y throughput: no se han publicado mediciones para este modelo. Al mantener 10B parametros activos, la velocidad de generacion deberia ser similar a la del padre cuantizado, que en Apple Silicon M2 Ultra suele rondar los 20-40 tokens/s, pero este dato no esta confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-OptiQ-2bit (padre) | 122B | 10B | no disponible | 2 bits | Apache 2.0 | safetensors (MLX) |
| Qwen3.5-122B-A10B-4bit | 122B | 10B | no disponible | 4 bits | Apache 2.0 | safetensors (MLX) |
| Este modelo (REAP-63B) | 63,4B | 10B | no disponible | 2 bits | Apache 2.0 | safetensors (MLX) |

La principal diferencia frente a sus alternativas es el tamano en disco: este modelo es un 45% mas pequeno que el padre cuantizado a 2 bits, y un 55% mas pequeno que la version 4 bits (que ocuparia aproximadamente 61 GB). A cambio, se pierde una parte del conocimiento factual (segun la referencia del modelo hermano, MMLU cae significativamente). No se dispone de datos de rendimiento directos para comparar con otros MoE de tamano similar.

## Limitaciones y advertencias

- No ha sido evaluado de forma independiente: los unicos datos de rendimiento provienen de un modelo hermano con la misma receta, no de este checkpoint.
- Posible degradacion en tareas de conocimiento factual (MMLU) debido a la poda del 50% de expertos, aunque la capacidad procedimental (razonamiento, codigo) parece mantenerse.
- Cuantizacion de 2 bits: la precision numerica reducida puede provocar alucinaciones o errores en tareas que requieren alta fidelidad numerica.
- Limitado a Apple Silicon: no se puede ejecutar en GPUs NVIDIA o AMD sin conversion de formato, que no esta contemplada.
- Contexto no documentado: se desconoce la longitud maxima de contexto soportada, lo que dificulta planificar su uso en aplicaciones con ventanas largas.
- Riesgo de alucinacion inherente a los LLM, agravado por la cuantizacion agresiva y la poda.
- No se garantiza la compatibilidad con todas las herramientas de MLX; se recomienda usar `mlx-lm` o `mlx-optiq` en sus versiones recientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/Qwen3.5-122B-A10B-OptiQ-2bit-REAP-63B
- Modelo padre (cuantizado 2 bits): https://huggingface.co/mlx-community/Qwen3.5-122B-A10B-OptiQ-2bit
- Version 4 bits del mismo modelo base: https://huggingface.co/mlx-community/Qwen3.5-122B-A10B-4bit
- Paper de REAP (Cerebras Research, ICLR 2026): https://arxiv.org/abs/2510.13999
- Herramienta MLX-OptiQ: https://mlx-optiq.com
- Documentacion de poda de OptiQ: https://mlx-optiq.com/docs/prune
- Modelo hermano validado (Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B): https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B
