# ornith-ai/Ornith-1.5-35B-A3B-FP8

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Ornith AI, presentado como parte de la familia Ornith-1.5. Es la versión de tamaño medio de la familia, con aproximadamente 35.900 millones de parámetros totales y solo unos 3.000 millones de parámetros activos por token. El modelo está diseñado específicamente para tareas de codificación y razonamiento agéntico, y según sus desarrolladores supera a modelos densos de tamaño similar como Gemma 4-31B y Muse Glimmer-30B en benchmarks de codificación agéntica.

La arquitectura se basa en el patrón Qwen3.5 MoE, como indican las etiquetas del repositorio. El modelo se ha entrenado mediante un proceso de auto-mejora de extremo a extremo que optimiza conjuntamente la generación de tareas, la construcción de scaffolds y los rollouts de soluciones, en lugar de depender de conjuntos de tareas fijos y diseñados manualmente. Esta aproximación, detallada en el blog de Ornith AI, busca mejorar la capacidad del modelo para generar sus propios datos de entrenamiento y descubrir estrategias efectivas de resolución.

La versión publicada en Hugging Face corresponde a pesos en formato FP8, con un tamaño de repositorio de 39,4 GB. La licencia es MIT, lo que permite uso comercial sin restricciones significativas. El modelo está orientado a desarrolladores e investigadores que necesitan un modelo de codificación eficiente con bajo coste de inferencia gracias a su arquitectura MoE con pocos parámetros activos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) basada en Qwen3.5 MoE |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | ~3B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos publicados), otros no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con aproximadamente 35.900 millones de parámetros totales, de los cuales solo unos 3.000 millones se activan por token. Esta configuración permite un coste de inferencia reducido en comparación con un modelo denso del mismo tamaño total. La arquitectura sigue el patrón de Qwen3.5 MoE, como se indica en las etiquetas del repositorio, aunque no se proporcionan detalles adicionales sobre el número de expertos, la dimensión del hidden state o el mecanismo de routing.

El entrenamiento se basa en un proceso de auto-mejora de extremo a extremo, descrito en el blog de Ornith AI. A diferencia de la versión 1.0, que optimizaba scaffolds y rollouts sobre un conjunto fijo de tareas, Ornith-1.5 optimiza conjuntamente la generación de nuevas tareas de entrenamiento, la construcción de scaffolds (entornos de ejecución) y los rollouts de soluciones. El modelo genera sus propias tareas, descubre estrategias efectivas para resolverlas y mejora la política mediante aprendizaje por refuerzo. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general, con especial énfasis en tareas de codificación.
- Codificación agéntica: resolución de issues en repositorios, ejecución de comandos en terminal y manejo de entornos de desarrollo.
- Soporte de agentes y razonamiento multi-paso, evidenciado por su rendimiento en benchmarks como Terminal-Bench y SWE-bench.
- Capacidad de auto-mejora: el modelo puede generar sus propias tareas de entrenamiento y descubrir estrategias de resolución, lo que sugiere una capacidad de adaptación a nuevos problemas.
- No se documentan explícitamente capacidades de tool calling o function calling, aunque los benchmarks agénticos implican interacción con herramientas y entornos.
- No se especifican capacidades multimodales (visión, audio) en la información disponible.

## Casos de uso

- Resolución automatizada de issues en repositorios de software: el modelo puede analizar descripciones de bugs, explorar el código fuente y generar parches, como demuestra su puntuación de 79 en SWE-bench Verified. Es adecuado para integrarse en pipelines de mantenimiento de código.
- Asistente de terminal para desarrolladores: con un rendimiento de 67,8 en Terminal-Bench 2.1 (Terminus-2), puede ejecutar comandos, interpretar salidas y completar tareas administrativas en entornos de línea de comandos.
- Generación de código en producción: gracias a su arquitectura MoE con solo ~3B parámetros activos, puede desplegarse en servicios de autocompletado o generación de código con latencia reducida en comparación con modelos densos de tamaño similar.
- Automatización de tareas de desarrollo agéntico: el modelo puede actuar como agente que planifica y ejecuta múltiples pasos para completar tareas complejas, como configurar entornos, ejecutar tests y corregir errores.
- Entrenamiento y fine-tuning para dominios específicos: al ser de código abierto con licencia MIT, puede adaptarse a conjuntos de datos propios de una organización para mejorar su rendimiento en tareas internas.
- Investigación en auto-mejora de modelos: su enfoque de entrenamiento con generación de tareas y scaffolds optimizados lo convierte en un objeto de estudio para equipos que investigan métodos de aprendizaje por refuerzo aplicados a la generación de código.

## Benchmarks y rendimiento

La model card proporciona resultados para varios benchmarks de codificación y tareas agénticas. Se presentan a continuación los datos disponibles, comparando con otros modelos de la misma categoría.

| Benchmark | Ornith-1.5-35B-A3B | Ornith-1.0-35B-A3B | Qwen3.6-35B-A3B | Gemma-4-31B | Muse-Glimmer-30B | Qwen3.5-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 67,8 | 64,2 | 52,5 | 42,1 | 51,7 | 53,5 |
| Terminal-Bench 2.1 (Claude Code) | 68,5 | 62,8 | 49,2 | - | - | 48,6 |
| SWE-bench Verified | 79 | 75,6 | 73,4 | 52 | 76 | 76,4 |
| SWE-bench Pro | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados para benchmarks generales de razonamiento como MMLU, GSM8K o HumanEval en la información proporcionada. Los datos de SWE-bench Pro no están completos en la model card, por lo que se omiten.

## Requisitos de hardware

- El tamaño del repositorio en FP8 es de 39,4 GB, lo que indica que los pesos completos ocupan aproximadamente esa cantidad de memoria.
- Para inferencia con los pesos FP8 completos, se necesitaría una GPU con al menos 40 GB de VRAM, como una A100 de 40 GB o una H100 de 80 GB.
- Dado que solo se activan ~3B parámetros por token, la memoria necesaria para activaciones y KV cache es reducida, pero los pesos totales deben residir en memoria.
- Con cuantización adicional (por ejemplo, a 4 bits), el modelo podría caber en GPUs de consumo como una RTX 4090 (24 GB), aunque no se proporcionan datos oficiales de cuantización más allá de FP8.
- Opciones de despliegue: al ser compatible con transformers y safetensors, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se mencionan configuraciones específicas de latencia o throughput.
- Para uso en entornos de producción con alta concurrencia, se recomienda un servidor de inferencia con soporte de batching y gestión de memoria eficiente, como vLLM.

## Comparativa con modelos similares

La siguiente tabla compara Ornith-1.5-35B-A3B con otros modelos de tamaño similar en tareas de codificación agéntica, según los datos de la model card.

| Modelo | Parámetros totales | Parámetros activos | SWE-bench Verified | Terminal-Bench 2.1 (Terminus-2) | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | ~35,95B | ~3B | 79 | 67,8 | MIT |
| Ornith-1.0-35B-A3B | ~35,95B (estimado) | ~3B | 75,6 | 64,2 | MIT |
| Qwen3.6-35B-A3B | ~35B (estimado) | ~3B | 73,4 | 52,5 | no disponible |
| Gemma-4-31B | ~31B (denso) | 31B | 52 | 42,1 | no disponible |
| Muse-Glimmer-30B | ~30B (denso) | 30B | 76 | 51,7 | no disponible |

Ornith-1.5 supera a su predecesor y a Qwen3.6-35B-A3B en ambos benchmarks, y aventaja claramente a los modelos densos Gemma-4-31B y Muse-Glimmer-30B en Terminal-Bench, aunque Muse-Glimmer-30B obtiene un resultado cercano en SWE-bench Verified (76 frente a 79). No se dispone de datos de contexto ni de otros benchmarks para una comparación más completa.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo, pero al estar entrenado principalmente para tareas de codificación, su rendimiento en dominios generales de lenguaje puede ser inferior al de modelos de propósito general.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir código incorrecto o soluciones aparentemente válidas pero erróneas. Se recomienda validación humana en entornos de producción.
- La longitud de contexto no está especificada, por lo que se desconoce su capacidad para manejar repositorios de código muy extensos o conversaciones de muchos turnos.
- Los idiomas soportados no están documentados; es probable que el modelo esté optimizado para inglés y lenguajes de programación, pero no hay confirmación oficial.
- La licencia MIT permite uso comercial sin restricciones, pero no se proporcionan garantías sobre el rendimiento en casos de uso específicos.
- El modelo se publica en FP8, lo que puede requerir hardware con soporte para esta precisión (por ejemplo, GPUs recientes de NVIDIA) para un rendimiento óptimo.
- No se han publicado resultados de benchmarks de razonamiento general, matemáticas o generación de código estándar (HumanEval, GSM8K), por lo que su rendimiento en estas áreas es desconocido.

## Enlaces

- Repositorio Hugging Face (versión FP8): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Repositorio Hugging Face (versión principal): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Blog de Ornith AI sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Sitio web de Ornith AI: https://ornith.online/
- Perfil en BenchLM.ai: https://benchlm.ai/models/ornith-1-5-35b-a3b
