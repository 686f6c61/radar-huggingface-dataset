# hasanbasbunar/Qwen3.8-27B-DSpark-Multilingual

## Resumen

Qwen3.8-27B-DSpark-Multilingual es un modelo auxiliar de decodificación especulativa (drafter) desarrollado por hasanbasbunar, diseñado como reemplazo directo del drafter base de RadixArk para acelerar la inferencia del modelo Qwen3.8-27B de Alibaba. El problema que resuelve es la baja tasa de aceptación del drafter original fuera de textos matemáticos y de código en inglés: en prosa libre o en idiomas distintos del inglés, el drafter base aceptaba solo 1.5-1.9 tokens por paso, lo que degradaba el rendimiento de la decodificación especulativa. Este finetune entrena al drafter sobre un corpus multilingüe (10 idiomas) que incluye prosa, conversaciones multi-turno, tool calls y trazas de pensamiento (thinking mode), mejorando la velocidad de generación sin alterar la calidad del resultado, ya que la decodificación especulativa es lossless por construcción.

El modelo es un checkpoint de la época 0 de un entrenamiento de 2 épocas, con 1.359.284.737 parámetros (aproximadamente 1,36B), y se distribuye bajo licencia Apache-2.0. Es relevante en el ecosistema de despliegue de Qwen3.8-27B porque permite reducir la latencia en entornos con recursos limitados, como la DGX Spark (GB10), manteniendo la misma calidad de salida que el modelo original. El entrenamiento se realizó con el método SpecForge (objetivo DSpark) y datos regenerados on-policy por el propio Qwen3.8-27B, lo que garantiza que el drafter aprende la distribución real de tokens del modelo objetivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (drafter de decodificación especulativa, arquitectura no especificada) |
| Parametros totales | 1.359.284.737 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo Qwen3.8-27B) |
| Tipos de cuantizacion | no disponible (se sirve con `--speculative-draft-model-quantization unquant`) |
| Idiomas soportados | 10: inglés (32%), francés (27%), alemán (11%), español (8%), chino (7%), italiano, portugués, japonés, ruso y neerlandés (resto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## 3. Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa diseñado para el algoritmo DSPARK (DeepSeek DSpark), que acelera la inferencia del modelo Qwen3.8-27B. La arquitectura concreta no se detalla en la información disponible, pero se trata de un modelo pequeño (1,36B parámetros) que genera candidatos de tokens que el modelo grande verifica posteriormente. El entrenamiento se realizó con SpecForge, un framework de entrenamiento para objetivos de decodificación especulativa, arrancando desde el checkpoint de RadixArk/Qwen3.8-27B-DSpark con una tasa de aprendizaje de 1e-5.

El corpus de entrenamiento incluye 18.290 conversaciones, con prompts de fuentes con licencia limpia (Open-PerfectBlend, WildChat-1M, oasst2, aya) y bancos de prompts propios. Todas las respuestas fueron regeneradas on-policy por el propio Qwen3.8-27B en sus ajustes de muestreo oficiales, de modo que el drafter aprende la distribución real de salida del modelo objetivo. Un 26% del corpus contiene trazas de pensamiento (thinking mode, incluyendo xhigh). El entrenamiento se realizó sobre una sola DGX Spark (GB10) con activaciones objetivo en las capas 4/16/28/40/52 y la norma final, en bf16.

## 4. Capacidades

- Aceleración de la inferencia de Qwen3.8-27B mediante decodificación especulativa (DSPARK), manteniendo la salida idéntica al modelo sin aceleración.
- Mejora de la tasa de aceptación en prosa libre en 10 idiomas (inglés, francés, alemán, español, chino, italiano, portugués, japonés, ruso, neerlandés).
- Soporte de generación de código y matemáticas con velocidades superiores al drafter base.
- Capacidad de procesar trazas de pensamiento (thinking mode) y salidas con alto nivel de razonamiento (xhigh).
- Soporte de conversaciones multi-turno y tool calls, ya que el corpus de entrenamiento incluye estos tipos.
- Compatible como reemplazo directo del drafter base en cualquier configuración SGLang con Qwen3.8-27B, mediante el parámetro `--speculative-draft-model-path`.

## 5. Casos de uso

- **Despliegue de Qwen3.8-27B en hardware limitado (DGX Spark, GB10):** el drafter permite alcanzar velocidades de 35-39 tok/s en código y matemáticas, y 14-17 tok/s en prosa libre multilingüe, mejorando la experiencia de usuario en entornos de baja capacidad.
- **Atención al cliente multilingüe en tiempo real:** al acelerar la generación de prosa en francés, alemán o español, el sistema puede responder a usuarios en su idioma con menor latencia, manteniendo la calidad de Qwen3.8-27B.
- **Agentes con tool calling:** el entrenamiento incluye tool calls, lo que permite acelerar flujos agénticos que requieren llamadas a funciones, reduciendo el tiempo de respuesta en tareas de automatización de oficina.
- **Generación de código en producción:** con una tasa de aceptación alta en código (35.9 tok/s vs 26.4-33.0 del drafter base), es adecuado para integrar en pipelines de CI/CD que generan o completan código con el modelo grande.
- **Razonamiento matemático y análisis técnico:** el drafter acelera la generación de soluciones matemáticas (39.1 tok/s) y respuestas técnicas, útil en aplicaciones de tutoría o análisis de datos.
- **Despliegue en entornos con restricciones de VRAM:** al ser un modelo pequeño (1,36B), se puede ejecutar junto al modelo grande en una sola GPU con memoria unificada, como la DGX Spark, sin necesidad de infraestructura adicional.

## 6. Benchmarks y rendimiento

El autor proporciona medidas de rendimiento en la DGX Spark (GB10) con greedy decoding, comparando el drafter base (stock) y este checkpoint. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este drafter, ya que no es un modelo de generación autónoma.

| Celda | Drafter stock | Este checkpoint |
|---|---|---|
| Free prose FR | 13.0-13.9 tok/s | **16.2-17.0 tok/s** |
| Free prose DE | 12.2 tok/s | **14.3 tok/s** |
| Code EN | 26.4-33.0 tok/s | **35.9 tok/s** |
| Math EN | 35.3-37.8 tok/s | **39.1 tok/s** |

Según el autor, ninguna celda ha regresado y el modelo cumple con los umbrales de calidad exigidos (código ≥ 26 tok/s, matemáticas ≥ 33 tok/s). La aceptación sigue siendo dependiente del contenido: la prosa acepta menos tokens que el código, pero la brecha se reduce respecto al drafter base.

## 7. Requisitos de hardware

- **Entrenamiento y medición:** se realizó en una sola DGX Spark (ASUS Ascent GX10, GB10) con memoria unificada (no se especifica VRAM exacta).
- **Inferencia:** el drafter se sirve junto con Qwen3.8-27B en SGLang. Al ser un modelo de 1,36B, su huella de memoria es pequeña (aprox. 2.7 GB en safetensors, sin cuantización). No se han publicado requisitos de VRAM específicos para el drafter en otras GPUs.
- **GPUs compatibles:** cualquier GPU con suficiente memoria para Qwen3.8-27B (27B) puede alojar también el drafter; se ha validado en DGX Spark (GB10). En GPUs de consumo con 24GB o más (RTX 3090/4090) podría caber si el modelo grande se cuantiza, pero no hay datos oficiales.
- **Opciones de despliegue:** SGLang es el servidor de referencia, con la configuración `--speculative-algorithm DSPARK --speculative-draft-model-path hasanbasbunar/Qwen3.8-27B-DSpark-Multilingual --speculative-dspark-block-size 7 --speculative-draft-model-quantization unquant`. También se proporciona un setup completo en GitHub para DGX Spark.
- **Latencia y throughput:** los datos de rendimiento (tok/s) se muestran en la sección de benchmarks; el throughput es variable según el tipo de contenido y la longitud de la secuencia.

## 8. Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| RadixArk/Qwen3.8-27B-DSpark (stock) | no especificado | no disponible | Apache-2.0 | Drafter base, entrenado en Open-PerfectBlend (78% inglés matemáticas/código) |
| hasanbasbunar/Qwen3.8-27B-DSpark-Multilingual (este) | 1.36B | no disponible | Apache-2.0 | Drafter multilingüe con mejor tasa de aceptación en prosa y thinking |
| Otros drafter de decodificación especulativa (p.ej. EAGLE-2) | varía | varía | varía | Alternativas genéricas para modelos de lenguaje grandes, pero no específicos para Qwen3.8-27B |

No se dispone de comparaciones directas con otros drafter multilingües en la información proporcionada. La comparación principal se establece con el drafter base de RadixArk, que es el punto de partida de este finetune.

## 9. Limitaciones y advertencias

- **Checkpoint de época 0:** es un modelo en fase de vista previa; el checkpoint final y una evaluación completa A/B llegarán en días. No se recomienda su uso en producción crítica sin validación adicional.
- **Dependencia del contenido:** la tasa de aceptación sigue siendo menor para prosa que para código/matemáticas; la mejora no elimina la brecha, solo la reduce.
- **No es un modelo autónomo:** no puede generar texto por sí mismo, solo funciona como drafter dentro de un sistema de decodificación especulativa con Qwen3.8-27B.
- **Idiomas cubiertos:** el corpus cubre 10 idiomas, pero el inglés y el francés dominan (59% en conjunto); los idiomas minoritarios pueden tener menor calidad.
- **Sesgos de datos:** el entrenamiento se basa en conjuntos de datos como WildChat-1M y oasst2, que pueden reflejar sesgos de las conversaciones reales de usuarios.
- **Licencia Apache-2.0:** permite uso comercial, pero los datos de entrenamiento provienen de fuentes con licencias específicas (Apache, MIT, ODC-BY) que deben respetarse.
- **Rendimiento en otros hardware:** los benchmarks se obtuvieron exclusivamente en DGX Spark (GB10); el rendimiento en otras GPUs puede variar.

## 10. Enlaces

- [Modelo en HuggingFace](https://huggingface.co/hasanbasbunar/Qwen3.8-27B-DSpark-Multilingual)
- [Modelo base (drafter de RadixArk)](https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark)
- [Modelo objetivo Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio GitHub del autor (setup DGX Spark)](https://github.com/hasso5703/dgx-spark-qwen38)
- [SpecForge (framework de entrenamiento)](https://github.com/sgl-project/SpecForge)
- [Paper DSpark (arXiv)](https://arxiv.org/abs/2607.05147)
- [Dataset Open-PerfectBlend](https://huggingface.co/datasets/mlabonne/open-perfectblend)
- [Dataset WildChat-1M](https://huggingface.co/datasets/allenai/WildChat-1M)
- [Dataset oasst2](https://huggingface.co/datasets/OpenAssistant/oasst2)
- [Dataset aya](https://huggingface.co/datasets/CohereForAI/aya_dataset)
- [Hilo de NVIDIA Developer Forums sobre Qwen3.8-27B con DSpark](https://forums.developer.nvidia.com/t/qwen3-8-27b-at-34-38-tok-s-on-dgx-spark-open-source-one-command-setup-sglang-nvfp4-dspark/380257)
