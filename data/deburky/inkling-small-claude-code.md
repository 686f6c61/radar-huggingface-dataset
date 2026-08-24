# deburky/inkling-small-claude-code

## Resumen

`deburky/inkling-small-claude-code` es un adaptador LoRA de rango 32 desarrollado por el usuario `deburky` sobre el modelo base `thinkingmachines/Inkling-Small`, un modelo multimodal de 276B parámetros totales (12B activos) con arquitectura Mixture-of-Experts. El adaptador se entrenó con la plataforma Tinker sobre un dataset propio (`deburky/gpt-oss-claude-code`) que contiene registros de conversaciones de Claude Code con llamadas a herramientas, con el objetivo de ajustar el comportamiento del modelo para tareas agénticas de uso de herramientas.

El problema que aborda es la especialización de un modelo generalista en el estilo y formato de interacción de Claude Code, incluyendo la generación nativa de tool calls. Sin embargo, la evaluación honesta publicada por el autor indica que el adaptador no supera al modelo base en comportamiento agéntico real: aunque reduce la pérdida held-out de 1.5374 a 0.7486, en pruebas con sesiones reales de Claude Code (3 tareas × 6 repeticiones) tanto el base como el adaptador logran 18/18 aciertos, pero el adaptador requiere 2-3 veces más turnos y tiempo, pierde las citas `file:line` que el base genera de forma consistente, y en una de tres ejecuciones confabuló una ruta fuera del repositorio.

El adaptador pesa 7.9 GB en F32 (96% en MLPs de expertos, 2% en atención) y se sirve con vLLM mediante `FusedMoEWithLoRA`. La licencia es Apache-2.0. No se recomienda su uso en producción para tareas agénticas, pero puede ser útil para experimentación o como punto de partida para fine-tuning adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, alpha 32) sobre Inkling-Small (MoE, 256 expertos) |
| Parametros totales | no disponible (7.9 GB en F32) |
| Parametros activos | no aplica (adaptador LoRA) |
| Longitud de contexto | 1M (heredado del modelo base Inkling-Small) |
| Tipos de cuantizacion | F32 (adaptador); base disponible en BF16 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con el método LoRA de rango 32 y alpha 32, aplicado a todas las capas lineales (`target_modules: all-linear`), incluyendo tanto las capas de atención como las MLPs de los 256 expertos del MoE (`train_mlp=True`). Esta configuración explica el tamaño del adaptador: el 96% de los bytes corresponden a pares LoRA en los expertos, mientras que solo el 2% corresponde a atención. Una variante solo atención pesa 185 MB pero obtiene peores resultados (12/18 en la evaluación agéntica).

El entrenamiento se realizó con el optimizador Adam (lr 1e-4), 2 épocas y batch de 8, sobre 284 registros de entrenamiento y 71 de validación. El dataset fuente está en formato gpt-oss harmony con tool calls codificadas como JSON en el canal final, que se parsearon a mensajes estructurados y se re-renderizaron con el renderizador de Inkling para convertirlos en tool calls nativas. La pérdida held-out se redujo de 1.5374 (base) a 0.7486, pero el autor señala que esta reducción refleja principalmente el ajuste al estilo de redacción del corpus, no una nueva capacidad, ya que el modelo base ya manejaba bien el tool calling.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Inkling-Small, que es multimodal (texto, visión y audio) y soporta razonamiento controlable con esfuerzo variable.
- Tool calling / function calling: el adaptador está entrenado específicamente para generar tool calls nativas en el formato de Claude Code, aunque el base ya las soportaba.
- Uso agéntico: puede integrarse en sesiones de Claude Code para tareas de descubrimiento de archivos, lectura de código y juicio de bugs, pero con peor eficiencia que el base.
- Multilingüe: no hay información específica sobre idiomas soportados por el adaptador; el base no declara idiomas en su model card.
- Capacidades especiales: al ser un adaptador sobre Inkling-Small, hereda la multimodalidad (visión y audio) y el contexto largo de 1M tokens, aunque el adaptador en sí no añade capacidades nuevas.

## Casos de uso

- Experimentación con fine-tuning de MoE: el adaptador demuestra cómo aplicar LoRA a los expertos de un MoE mediante `FusedMoEWithLoRA` en vLLM, sirviendo como referencia técnica para otros desarrolladores.
- Evaluación de adaptadores LoRA en tareas agénticas: permite comparar el rendimiento de un adaptador especializado frente al modelo base en sesiones reales de Claude Code, como se documenta en la model card.
- Prototipado de pipelines de tool calling: puede usarse para probar la integración de tool calls nativas en entornos de desarrollo, aunque no se recomienda para producción.
- Investigación sobre sobreajuste de estilo: el caso de este adaptador es útil para estudiar cómo la reducción de pérdida held-out no siempre se traduce en mejora de comportamiento, un fenómeno relevante para la comunidad.
- Base para fine-tuning adicional: el adaptador puede servir como punto de partida para entrenamientos posteriores con más datos o diferentes hiperparámetros.
- Pruebas de despliegue con vLLM y LoRA en MoE: útil para validar la compatibilidad de vLLM con adaptadores LoRA en modelos con 256 expertos y cuantización NVFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adaptador. La model card incluye una evaluación agéntica propia, resumida en la siguiente tabla:

| Modelo | Pérdida held-out | Aciertos agénticos (n=18) |
| --- | --- | --- |
| Base `Inkling-Small` | 1.5374 | 18/18 |
| Adaptador `claude-code` | 0.7486 | 18/18 |
| Variante solo atención | 0.8175 | 12/18 |

En una tarea más difícil (descubrir archivos, leer varios, juzgar un bug), el adaptador necesitó 2-3 veces más turnos y tiempo de pared que el base, dejó de generar citas `file:line` y confabuló una ruta fuera del repositorio en una de tres ejecuciones.

## Requisitos de hardware

- El adaptador en sí pesa 7.9 GB en F32 (aprox. 4 GB en BF16), pero no puede usarse de forma independiente: requiere el modelo base Inkling-Small.
- El modelo base en BF16 ocupa 532 GB, por lo que no cabe en una GPU consumer. La versión cuantizada NVFP4 ocupa 171 GB y requiere múltiples GPUs (por ejemplo, 4× A100 80GB o 2× H100 80GB).
- Para servir con vLLM, se recomienda usar `Inkling-Small-NVFP4` con `--enable-lora` y `--max-lora-rank 32`.
- No es viable en GPUs consumer (RTX 4090, etc.) debido al tamaño del base.
- Opciones de despliegue: vLLM (con soporte de LoRA para MoE), Transformers con PEFT. No se menciona compatibilidad con llama.cpp u Ollama.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
| --- | --- | --- | --- | --- |
| `deburky/inkling-small-claude-code` (adaptador) | 7.9 GB F32 (adaptador) | 1M (base) | Apache-2.0 | No supera al base en comportamiento agéntico |
| `thinkingmachines/Inkling-Small` (base) | 276B total / 12B activo | 1M | Apache-2.0 | Multimodal, razonamiento controlable, mejor rendimiento agéntico |
| Variante solo atención del adaptador | 185 MB | 1M (base) | Apache-2.0 | Peor rendimiento (12/18) |

No se dispone de información sobre otros adaptadores LoRA similares para Inkling-Small en el momento de la consulta.

## Limitaciones y advertencias

- El adaptador no mejora el comportamiento agéntico del modelo base: en la evaluación honesta, ambos logran 18/18, pero el adaptador es más lento y menos fiable.
- Confabulación de rutas: en una de tres ejecuciones de una tarea difícil, el adaptador generó una ruta fuera del repositorio, lo que indica riesgo de alucinación en contextos de código.
- Pérdida de citas `file:line`: el adaptador deja de generar las referencias precisas que el base produce de forma consistente, lo que dificulta la verificación de sus respuestas.
- Mayor latencia: requiere 2-3 veces más turnos y tiempo de pared que el base en tareas multi-step.
- Tamaño del adaptador: 7.9 GB en F32 es grande para un LoRA debido al entrenamiento de todos los expertos; el autor sugiere que BF16 reduciría el tamaño a la mitad.
- Dependencia de un base muy grande: el despliegue realista requiere un base cuantizado (NVFP4, 171 GB) en multi-GPU, lo que limita su uso a entornos con infraestructura potente.
- Licencia Apache-2.0 permite uso comercial, pero el autor recomienda explícitamente no usar este adaptador sobre el base para tareas agénticas en producción.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/deburky/inkling-small-claude-code
- Modelo base Inkling-Small: https://huggingface.co/thinkingmachines/Inkling-Small
- Dataset fuente: https://huggingface.co/datasets/deburky/gpt-oss-claude-code
- Blog de Thinking Machines sobre Inkling-Small: https://thinkingmachines.ai/news/inkling-small/
- Model card de Inkling-Small: https://thinkingmachines.ai/model-card/inkling-small/
- Blog de HuggingFace sobre Inkling: https://huggingface.co/blog/thinkingmachines-inkling
- Artículo sobre uso de Inkling Small en Claude Code vía AI Gateway: https://gentic.news/article/use-inkling-small-on-claude-code
