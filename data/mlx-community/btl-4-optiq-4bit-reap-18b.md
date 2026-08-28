# mlx-community/BTL-4-OptiQ-4bit-REAP-18B

## Resumen

El modelo `mlx-community/BTL-4-OptiQ-4bit-REAP-18B` es una variante podada y cuantizada de un modelo de mezcla de expertos (MoE) basado en la arquitectura Qwen3.5 MoE, desarrollada por la comunidad MLX para su ejecución nativa en Apple Silicon. Se parte del checkpoint cuantizado `mlx-community/BTL-4-OptiQ-4bit` (20,6 GB en disco, 34,7 mil millones de parámetros) y se elimina el 50 % de los expertos enrutados mediante la técnica REAP, lo que reduce el tamaño a 11,5 GB y los parámetros a 18,3 mil millones, manteniendo intactos los 8 expertos activos por token y la velocidad de inferencia.

La poda se realiza directamente en el dominio cuantizado, sin descuantizar ni reentrenar los expertos supervivientes, que se copian bit a bit del modelo padre. El resultado es un modelo más ligero, pensado para ejecutarse en Macs con memoria unificada, con una divergencia KL de 0,114 respecto al padre no podado, dentro del rango en el que la generación se considera indistinguible. No se han publicado benchmarks específicos para esta variante, aunque el método fue validado en un modelo de arquitectura idéntica (Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B) con una pérdida moderada en capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Qwen3.5 MoE) con 256 expertos por capa, top-8 activos |
| Parametros totales | 18,3B (según model card); 3,38B según safetensors (discrepancia) |
| Parametros activos | 8 expertos por token (no se especifica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

Nota: la discrepancia entre los 18,3B declarados en la model card y los 3,38B que suman los tensores safetensors no está explicada en la documentación disponible; podría deberse a una contabilidad parcial de los archivos o a una representación específica de los pesos cuantizados.

## Arquitectura y entrenamiento

El modelo es una poda de expertos aplicada sobre un checkpoint ya cuantizado a 4 bits. La arquitectura subyacente es un transformer MoE con 256 expertos por capa y selección top-8, similar a la familia Qwen3.5 MoE. El proceso de poda utiliza el método REAP (Cerebras Research, ICLR 2026), que ordena los expertos según la media condicional del peso del router multiplicado por la norma de salida del experto, calculada sobre datos de calibración. En este caso se retienen 128 de los 256 expertos en cada capa, de forma uniforme.

La poda se ejecuta con la herramienta `optiq prune-experts` de mlx-optiq, que opera directamente sobre el checkpoint cuantizado, sin necesidad de un modelo BF16 padre ni de descuantizar los expertos supervivientes. Los expertos retenidos se copian bit a bit del modelo cuantizado original, por lo que no hay reentrenamiento ni ajuste posterior. El modelo no ha sido entrenado desde cero; es una compresión de un modelo base ya existente.

## Capacidades

- Generación de texto y conversación multi-turno.
- Soporte de tool calling y uso de funciones (tag `tool-use`).
- Capacidades de agente (tag `agentic`).
- Generación de código (tag `code`).
- Ejecución nativa en Apple Silicon mediante MLX.
- Inferencia eficiente gracias a la poda de expertos, que reduce el uso de memoria sin penalizar la velocidad (top-8 activos intactos).

## Casos de uso

- Inferencia local en Mac: el modelo está optimizado para ejecutarse en Apple Silicon (M1 a M5) con MLX, ocupando 11,5 GB en disco y requiriendo 14,5 GB de memoria, lo que lo hace viable en equipos con 16 GB o más de RAM unificada.
- Desarrollo de asistentes conversacionales: su capacidad de tool calling y su naturaleza MoE lo hacen adecuado para construir chatbots con acceso a herramientas y APIs externas.
- Generación de código en entornos de desarrollo: puede integrarse en editores o pipelines de CI/CD para autocompletado, revisión de código o generación de tests, gracias a su soporte de código y su baja huella de memoria.
- Prototipado de agentes autónomos: al mantener los 8 expertos activos por token, conserva la velocidad de inferencia del modelo padre, lo que permite iterar rápidamente en flujos de razonamiento multi-paso.
- Despliegue en entornos con restricciones de almacenamiento: con 11,5 GB en disco, cabe en discos SSD de portátiles y permite mantener varios modelos locales sin saturar el espacio.
- Evaluación de técnicas de compresión: al ser un ejemplo de poda en dominio cuantizado, puede servir como caso de estudio para investigadores interesados en compresión de MoE sin desquantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta variante específica. La model card indica que no fue evaluada por separado, pero menciona que el mismo procedimiento (50 % de retención de expertos) fue validado en el modelo `Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B`, con una Capability Score que pasó de 80,03 a 76,57, con pérdidas concentradas en MMLU (−21,4) y capacidades procedimentales intactas (GSM8K +2,6, IFEval +4,3, BFCL −1,0, HumanEval −1,3). Estos datos corresponden a otro modelo y no deben atribuirse a este checkpoint.

## Requisitos de hardware

- Tamaño en disco: 11,5 GB (frente a 20,6 GB del modelo padre).
- Memoria necesaria para ejecución: 14,5 GB de RAM unificada.
- Compatible con Apple Silicon (M1, M2, M3, M4, M5) gracias al framework MLX.
- No requiere GPU dedicada; usa la memoria unificada del chip.
- Despliegue recomendado con `mlx-optiq` (comando `optiq serve`) o con `mlx_lm` para carga y generación.
- Latencia y throughput: no disponibles para este modelo; el padre BTL-4-OptiQ-4bit muestra en oMLX benchmarks de ~95 tokens/s de generación en un M5 Max (40c), pero no son datos de esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| BTL-4-OptiQ-4bit-REAP-18B (este) | 18,3B (declarado) | no disponible | 4-bit MLX | Apache 2.0 | Poda del 50 % de expertos |
| BTL-4-OptiQ-4bit (padre) | 34,7B | no disponible | 4-bit MLX | Apache 2.0 | Modelo original cuantizado |
| Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B | 19B (aprox.) | no disponible | 4-bit MLX | Apache 2.0 | Misma técnica de poda, validado con benchmarks |

No se dispone de comparativas con otros modelos de la misma categoría fuera del ecosistema MLX.

## Limitaciones y advertencias

- No ha sido evaluado de forma independiente; los resultados de rendimiento son inciertos y podrían diferir del modelo padre.
- La poda de expertos puede degradar tareas de conocimiento general (como MMLU) aunque preserve capacidades procedimentales.
- No se especifica la longitud de contexto soportada; se recomienda verificar con el modelo base original.
- Los idiomas soportados no están documentados.
- La discrepancia entre los parámetros declarados y los tensores safetensors sugiere que la contabilidad de pesos puede no ser trivial; usar con cautela en entornos de producción.
- Al ser una cuantización 4-bit, puede presentar pérdida de precisión frente a versiones de mayor precisión.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podría tener restricciones adicionales no documentadas aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/BTL-4-OptiQ-4bit-REAP-18B
- Modelo padre: https://huggingface.co/mlx-community/BTL-4-OptiQ-4bit
- Paper REAP: https://arxiv.org/abs/2510.13999
- Herramienta mlx-optiq: https://mlx-optiq.com
- Documentación de poda: https://mlx-optiq.com/docs/prune
