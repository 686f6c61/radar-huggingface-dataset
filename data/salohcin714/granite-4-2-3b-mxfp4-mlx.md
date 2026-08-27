# salohcin714/granite-4.2-3b-mxfp4-mlx

## Resumen

El modelo `salohcin714/granite-4.2-3b-mxfp4-mlx` es una conversión cuantizada del modelo Granite 4.2 3B de IBM, adaptada al formato MLX para ejecución eficiente en hardware Apple Silicon. La conversión ha sido realizada por el usuario salohcin714, que ha aplicado cuantización MXFP4 (microscaling floating-point de 4 bits) sin calibración, redondeando los pesos al valor más cercano y eliminando el `lm_head` redundante cuando las embeddings de entrada y salida están atadas. El resultado es un artefacto de 1,9 GB que mantiene la licencia Apache 2.0 del modelo original.

Granite 4.2 es una familia de modelos densos de razonamiento lanzada por IBM en tres tamaños (3B, 8B y 30B), con capacidades integradas de chain-of-thought, modos de pensamiento flexibles y tool calling aumentado con razonamiento. Este modelo concreto, al estar cuantizado a 4 bits y convertido a MLX, está pensado para desplegarse en Macs con chip M1 o superior, ofreciendo una alternativa ligera para tareas de generación de texto y razonamiento en entornos con recursos limitados. Su relevancia radica en que permite ejecutar un modelo de razonamiento moderno en hardware de consumo sin necesidad de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Granite 4.2 3B) |
| Parametros totales | 686.369.280 (según safetensors del repo; el modelo base original declara 3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Granite 4.2 soporta contexto largo, pero no se especifica el valor) |
| Tipos de cuantizacion | MXFP4 (microscaling floating-point de 4 bits) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en layout MLX |

## Arquitectura y entrenamiento

El modelo base, Granite 4.2 3B, es un transformer denso decoder-only post-entrenado sobre los pesos de Granite 4.1. Según la documentación de IBM, la familia Granite 4.2 incorpora razonamiento integrado con chain-of-thought, modos de pensamiento configurables (thinking mode) y tool calling aumentado con razonamiento. El preentrenamiento se realizó sobre Granite 4.1, y el post-entrenamiento añadió capacidades de razonamiento y diálogo.

La conversión realizada por salohcin714 no implica ningún entrenamiento adicional. Se han convertido los pesos al formato safetensors de MLX y se ha aplicado cuantización MXFP4 mediante redondeo al más cercano, sin calibración. Además, se ha eliminado el peso redundante del `lm_head` cuando el modelo ata las embeddings de entrada y salida, lo que reduce el número de parámetros almacenados en el archivo safetensors (de ahí el valor de 686.369.280, que no corresponde al total de parámetros del modelo original, sino al conteo tras eliminar ese peso atado). No se ha realizado fine-tuning ni se han añadido datos de entrenamiento.

## Capacidades

- Generación de texto y conversación multilingüe en 12 idiomas, incluyendo español, inglés, alemán, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino.
- Razonamiento con chain-of-thought integrado, heredado del modelo base Granite 4.2, que permite resolver problemas complejos paso a paso.
- Modos de pensamiento flexibles (thinking mode), según la documentación de IBM, que permiten ajustar el nivel de razonamiento según la tarea.
- Tool calling aumentado con razonamiento, lo que facilita la integración con funciones externas y APIs.
- Soporte de agentes y multi-step reasoning, gracias a la combinación de razonamiento y tool calling.
- Capacidad de ejecución en Apple Silicon mediante MLX, con baja huella de memoria gracias a la cuantización de 4 bits.

## Casos de uso

- Atención al cliente automatizada en español: el modelo puede gestionar conversaciones multi-turno en español y otros idiomas, aprovechando su capacidad multilingüe y su razonamiento integrado para resolver consultas de forma coherente. Su tamaño reducido permite desplegarlo en un Mac mini o un MacBook Pro sin necesidad de infraestructura GPU.
- Generación de código en entornos de desarrollo: gracias al tool calling y al razonamiento, puede integrarse en pipelines de CI/CD para generar fragmentos de código, revisar sintaxis o proponer soluciones a problemas de programación, ejecutándose localmente en máquinas de desarrolladores con Apple Silicon.
- Asistente de documentación técnica: el modelo puede resumir, traducir o redactar documentación técnica en varios idiomas, aprovechando su contexto multilingüe y su capacidad de razonamiento para mantener coherencia en textos largos.
- Análisis de sentimiento y clasificación de texto: su capacidad de razonamiento permite interpretar matices en opiniones de clientes o comentarios, clasificándolos en categorías o detectando intenciones, todo ello en local sin conexión a servicios externos.
- Prototipado rápido de chatbots: al ser un modelo ligero y fácil de cargar con `mlx_lm`, es adecuado para desarrollar prototipos de asistentes conversacionales en entornos de investigación o startups, sin necesidad de GPUs dedicadas.
- Educación y tutoría personalizada: el modelo puede actuar como tutor virtual explicando conceptos paso a paso, resolviendo ejercicios de matemáticas o lógica, y adaptando sus respuestas al nivel del estudiante, gracias a su razonamiento chain-of-thought.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión cuantizada en la información disponible. El autor indica explícitamente que los benchmarks publicados por IBM corresponden a los pesos originales y no deben atribuirse a este artefacto cuantizado. Para conocer el rendimiento del modelo base Granite 4.2 3B, se puede consultar la documentación oficial de IBM, donde se publican resultados en tareas como MMLU, HumanEval y GSM8K, entre otras. No obstante, la cuantización MXFP4 de 4 bits puede introducir una degradación en la calidad de las respuestas respecto al modelo original, aunque no se dispone de datos cuantitativos al respecto.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon (chips M1, M2, M3, M4 y sus variantes Pro/Max/Ultra), ya que utiliza el framework MLX.
- Memoria unificada estimada: el archivo de pesos ocupa 1,9 GB en disco, y en memoria durante la inferencia se puede estimar un consumo de entre 2 y 3 GB, dependiendo de la longitud del contexto y del tamaño del lote. Esto permite ejecutarlo en Macs con 8 GB de RAM o más.
- GPU recomendada: no aplica GPU dedicada; se utiliza la GPU integrada del chip Apple Silicon.
- Opciones de despliegue: se puede ejecutar mediante la librería `mlx-lm` (carga y generación en Python), o integrarse en aplicaciones que usen MLX. No se menciona soporte para vLLM, llama.cpp u Ollama en esta conversión específica, aunque el modelo base podría estar disponible en otros formatos.
- Latencia y throughput: no se proporcionan datos específicos. En un Mac con chip M2 o superior, se espera una generación de varios tokens por segundo para un modelo de 3B cuantizado, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de la misma categoría (3B cuantizados para MLX) en la información proporcionada. Sin embargo, se pueden mencionar alternativas genéricas:

| Modelo | Tamaño | Cuantizacion | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| salohcin714/granite-4.2-3b-mxfp4-mlx | 3B (686M en safetensors) | MXFP4 4-bit | MLX | Apache 2.0 | No disponible |
| ibm-granite/granite-4.2-3b (original) | 3B | FP32/BF16 | Safetensors | Apache 2.0 | No disponible |
| Otros modelos 3B cuantizados para MLX (p.ej. Llama 3.2 3B, Qwen2.5 3B) | 3B | Variable (4-bit, 8-bit) | MLX | Variable | Variable |

No se han encontrado conversiones MLX de Granite 4.2 3B de otros autores en la búsqueda web, por lo que esta conversión parece ser una de las primeras disponibles. La comparativa con otros modelos 3B dependería de benchmarks específicos que no se han proporcionado.

## Limitaciones y advertencias

- La cuantización MXFP4 de 4 bits puede degradar la calidad de las respuestas en comparación con el modelo original en precisión completa, especialmente en tareas que requieren razonamiento numérico o lógico complejo.
- El número de parámetros reportado en el safetensors (686.369.280) no coincide con el tamaño nominal de 3B del modelo base, debido a la eliminación del `lm_head` atado. Esto puede causar confusión si se compara con otros modelos.
- No se ha realizado ningún tipo de calibración durante la cuantización, lo que podría aumentar el error de cuantización en comparación con métodos que usan calibración.
- El modelo no está afiliado ni respaldado por IBM; es una conversión de un tercero. Los benchmarks publicados por IBM no son aplicables a este artefacto.
- La longitud de contexto no se especifica en la información disponible; se recomienda consultar la documentación del modelo base para conocer el límite real.
- Aunque la licencia es Apache 2.0, el nombre "Granite" es una marca registrada de IBM, y su uso en este repositorio es descriptivo, no implica afiliación.
- Al ser un modelo de 3B, su capacidad de razonamiento es limitada en comparación con modelos más grandes (8B, 30B) de la misma familia, por lo que no es adecuado para tareas que requieran un conocimiento profundo o razonamiento avanzado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-3b-mxfp4-mlx
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-4.2-3b
- Documentación oficial de Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Página principal de IBM Granite: https://www.ibm.com/granite
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
