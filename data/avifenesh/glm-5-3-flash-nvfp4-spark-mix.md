# Avifenesh/GLM-5.3-Flash-NVFP4-spark-mix

## Resumen

GLM-5.3-Flash-NVFP4-spark-mix es una variante cuantizada en precisión mixta del modelo zai-org/GLM-5.3-Flash, publicada por el usuario Avifenesh. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado de una cuantización previa (Avifenesh/GLM-5.3-Flash-NVFP4, revisión `2fa9fe62`) en la que se han reasignado distintos esquemas de cuantización a módulos concretos para optimizar el servicio en hardware DGX Spark (GB10) con paralelismo de tensor 2 sobre dos nodos.

El modelo base GLM-5.3-Flash es un transformer de tipo Mixture-of-Experts (MoE) con 321.323.031.390 parámetros totales según los pesos en safetensors, e incorpora capas de atención lineal KDA (34 capas) junto con capas de atención MLA (12 capas). Esta variante concreta combina NVFP4 (W4A16, grupo 16), MXFP8, FP8 block-128 del release oficial del proveedor y tensores en BF16, todo ello configurado mediante ModelOpt en modo `MIXED_PRECISION` con un `quant_algo` por módulo.

Su relevancia es acotada y muy específica: es el checkpoint por defecto de un despliegue concreto en dos DGX Spark, y su interés principal reside en mostrar una receta práctica de cuantización mixta por módulo para servir un MoE de gran tamaño en hardware de consumo profesional. No aporta mejoras de calidad frente a su base, y el propio autor indica que no se ejecutó ninguna validación de precisión adicional sobre esta mezcla más allá de la del mint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas de atención lineal KDA (34) y atención MLA (12); arquitectura `glm5_next` |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A16, grupo 16), MXFP8, FP8 block-128, BF16; ModelOpt `MIXED_PRECISION` con `quant_algo` por módulo |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 185,9 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE que combina dos mecanismos de atención: 34 capas con atención lineal KDA y 12 capas con atención MLA. La arquitectura declarada en los tags es `glm5_next`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

Esta variante no entrena nada: redistribuye la precisión de módulos concretos sobre el mint NVFP4 previo. Las proyecciones de atención lineal KDA (`in_proj_qkvbfg_a`, `q/k/v_proj`, `b_proj`, `f_a_proj`, `g_a_proj`) de las 34 capas pasan a NVFP4 en W4A16 con grupo 16, mientras que su `o_proj` se lleva a MXFP8. Los expertos compartidos, las 3 MLP densas y las proyecciones `o_proj` y `q_b_proj` de las 12 capas MLA usan los pesos FP8 block-128 del release oficial de zai-org. Los expertos enrutados se mantienen en NVFP4 como en el mint base. El recuento de módulos según `config.json` es de 281 NVFP4, 208 FP8 block, 34 MXFP8 y 390 en BF16; el fichero `remint-layers.txt` detalla las capas reacuñadas. El tokenizador, las plantillas de chat y la configuración de generación son los del mint base.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base GLM-5.3-Flash.
- Procesamiento de contexto largo mediante atención MLA en 12 capas (longitud exacta no disponible).
- Atención lineal KDA en 34 capas, orientada a eficiencia en secuencias largas.
- Capacidades multilingües: no disponibles en la información proporcionada para esta variante.
- Soporte de tool calling, agentes o modo de razonamiento extendido: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Servicio en paralelo de tensor 2 sobre dos DGX Spark (GB10), que es el escenario para el que se construyó esta mezcla.

## Casos de uso

- Despliegue en dos DGX Spark (GB10): es el caso de uso literal del checkpoint, pensado para servir GLM-5.3-Flash con TP=2 en dos nodos GB10; fue el checkpoint por defecto de esa configuración.
- Evaluación de recetas de cuantización mixta: sirve como referencia práctica de cómo asignar NVFP4, MXFP8 y FP8 block-128 por tipo de módulo en un MoE grande con ModelOpt.
- Investigación sobre atención híbrida: permite estudiar el comportamiento de un modelo que combina 34 capas KDA y 12 capas MLA manteniendo los expertos enrutados en 4 bits.
- Servicio de inferencia en hardware de gama profesional: al reducir el peso a 185,9 GB y usar FP4/FP8 en la mayoría de módulos, facilita el despliegue en entornos con VRAM agregada limitada frente a un checkpoint BF16.
- Reproducción de benchmarks internos: útil para comparar el rendimiento del mint base frente a esta mezcla en el mismo hardware, dado que el autor reporta mejoras de latencia medidas.
- Base para futuras reacuñaciones: el patrón por módulo y el listado `remint-layers.txt` sirven de plantilla para generar variantes adaptadas a otros aceleradores o topologías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas de servicio en dos DGX Spark medidas en octubre de 2026:

| Metrica | Resultado frente al mint base |
|---|---|
| Duración del paso de decodificación | 5-6 % más corto |
| Throughput | +2-4 % tokens/s |
| Validación de precisión adicional | no realizada (se hereda la del mint base) |

## Requisitos de hardware

- VRAM estimada: el repo ocupa 185,9 GB en safetensors; el despliegue de referencia usa dos DGX Spark (GB10) con paralelismo de tensor 2, es decir, el modelo se reparte entre la memoria unificada de ambos nodos.
- GPU recomendadas: DGX Spark (GB10) en configuración de dos unidades, que es el entorno validado por el autor.
- GPU de consumo: no cabe en una sola GPU consumer convencional por el tamaño del checkpoint; requiere al menos la memoria agregada de dos nodos GB10 o hardware con capacidad equivalente.
- Opciones de despliegue: no se especifican en la model card; el formato es safetensors con configuración ModelOpt, orientado a runtimes que soporten NVFP4, MXFP8 y FP8 block-128.
- Latencia y throughput: mejora de 5-6 % en duración de paso de decodificación y de 2-4 % en tokens/s frente al mint NVFP4 base, en la configuración TP=2 sobre dos DGX Spark.

## Comparativa con modelos similares

| Modelo | Parametros totales | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Avifenesh/GLM-5.3-Flash-NVFP4-spark-mix | 321,3 mil millones | Mixta: NVFP4, MXFP8, FP8 block-128, BF16 | no disponible | MIT | Hugging Face |
| Avifenesh/GLM-5.3-Flash-NVFP4 | 321,3 mil millones (base) | NVFP4 (KDA en BF16) | no disponible | MIT | Hugging Face |
| zai-org/GLM-5.3-Flash | 321,3 mil millones (base) | BF16 / FP8 block-128 (release del proveedor) | no disponible | no disponible | Hugging Face |

La diferencia frente al mint NVFP4 es la reacuñación de las proyecciones KDA a NVFP4 y de su `o_proj` a MXFP8, con un rendimiento ligeramente superior en el hardware objetivo. Frente al modelo original de zai-org, esta variante reduce el peso y está optimizada para GB10, a costa de no contar con validación de precisión propia.

## Limitaciones y advertencias

- No se ejecutó ninguna validación de precisión específica sobre esta mezcla; la calidad se asume igual a la del mint NVFP4 base, que a su vez no se documenta aquí.
- La cuantización NVFP4 de las proyecciones KDA puede introducir degradación en tareas sensibles a la precisión numérica; no hay datos publicados al respecto.
- El checkpoint está optimizado para DGX Spark (GB10) con TP=2; su uso en otras topologías o aceleradores no está validado y puede requerir reacuñación.
- No hay información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación en la documentación disponible.
- La licencia es MIT, lo que permite uso comercial, pero se heredan las condiciones y advertencias del modelo base zai-org/GLM-5.3-Flash, cuya licencia no se detalla en esta ficha.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un artefacto muy reciente y sin validación comunitaria.
- El tamaño de 185,9 GB y la necesidad de dos nodos GB10 limitan su despliegue a entornos con hardware específico.

## Enlaces

- Hugging Face: https://huggingface.co/Avifenesh/GLM-5.3-Flash-NVFP4-spark-mix
- Mint base NVFP4: https://huggingface.co/Avifenesh/GLM-5.3-Flash-NVFP4
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
