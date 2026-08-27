# salohcin714/granite-4.2-8b-mxfp4-mlx

## Resumen

Este repositorio contiene una conversión a formato MLX del modelo Granite 4.2 8B de IBM, cuantizado con MXFP4 (microscaling floating-point de 4 bits). El autor, salohcin714 (Nicholas Norris), ha convertido los pesos originales de `ibm-granite/granite-4.2-8b` utilizando `mlx-lm` 0.31.3, sin realizar fine-tuning ni añadir datos de entrenamiento. El objetivo es permitir la ejecución eficiente de este modelo de razonamiento en hardware Apple Silicon, reduciendo el consumo de memoria mediante cuantización de 4 bits.

Granite 4.2 es una familia de modelos densos de razonamiento publicada por IBM en tamaños de 3B, 8B y 30B, con capacidades integradas de chain-of-thought, modos de pensamiento flexibles y tool calling aumentado con razonamiento. Esta conversión concreta ofrece una versión cuantizada de 8B que ocupa aproximadamente 4,7 GB en disco, lo que la hace viable en equipos con 16 GB de RAM unificada o más. El modelo mantiene la licencia Apache 2.0 y soporta 12 idiomas, incluyendo español, inglés, francés, alemán y otros.

La relevancia de este artefacto radica en que facilita el despliegue local de un modelo de razonamiento de última generación en entornos Apple, sin necesidad de GPUs dedicadas, y con un formato optimizado para el ecosistema MLX. No obstante, es importante señalar que los benchmarks publicados por IBM corresponden al modelo original sin cuantizar, y no a esta conversión específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según IBM Granite 4.2) |
| Parametros totales | 1.648.693.248 (según safetensors cuantizado; el modelo base tiene 8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4 (microscaling floating-point, 4 bits, round-to-nearest, sin calibración) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base, Granite 4.2 8B de IBM, es un transformer denso diseñado para tareas de razonamiento, con chain-of-thought integrado y soporte para tool calling. IBM no ha publicado detalles completos sobre la arquitectura interna (número de capas, heads, etc.) en la información disponible, por lo que no se pueden especificar esos parámetros aquí. El entrenamiento original fue realizado por IBM, pero no se dispone de datos sobre el número de tokens, composición del dataset o técnicas de alineación (RLHF/DPO) en la documentación consultada.

Esta conversión concreta no añade ningún entrenamiento adicional. Los pesos originales se convirtieron al layout de safetensors de MLX y se cuantizaron a MXFP4 mediante redondeo al más cercano, sin calibración. Se eliminó el `lm_head` atado redundante cuando el modelo comparte embeddings de entrada y salida. No se realizó fine-tuning ni se incorporaron datos nuevos.

## Capacidades

- Generación de texto y razonamiento con chain-of-thought, según las especificaciones del modelo base Granite 4.2.
- Tool calling aumentado con razonamiento, lo que permite al modelo planificar y ejecutar llamadas a funciones externas de forma más robusta.
- Soporte multilingüe en 12 idiomas: inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino.
- Modos de pensamiento flexibles (thinking modes) que permiten ajustar el nivel de razonamiento según la tarea, según la documentación de IBM.
- Al ser una conversión cuantizada, las capacidades funcionales se mantienen, aunque puede haber una ligera degradación en la calidad de salida debido a la cuantización de 4 bits.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantización MXFP4 permiten ejecutar el modelo en Macs con 16 GB de RAM o más, sin necesidad de GPU dedicada. Es adecuado para desarrolladores que quieran prototipar aplicaciones de IA generativa en su equipo local.
- Asistentes conversacionales multilingües: gracias al soporte de 12 idiomas y al chain-of-thought, puede utilizarse para construir chatbots que manejen consultas complejas en varios idiomas, con respuestas razonadas.
- Razonamiento con tool calling: el modelo puede integrarse en agentes que necesiten llamar a APIs o funciones externas, planificando los pasos antes de ejecutarlos. Esto es útil para automatización de tareas, consultas a bases de datos o integración con servicios web.
- Generación de código asistida: aunque no se especifica explícitamente en la documentación, los modelos Granite 4.2 suelen tener capacidades de código. Puede emplearse para autocompletar o generar fragmentos de código en entornos de desarrollo locales.
- Análisis de texto multilingüe: para tareas de clasificación, extracción de información o resumen en varios idiomas, aprovechando la ventana de contexto (aunque no se ha confirmado su longitud exacta).
- Educación y experimentación: al ser un modelo abierto con licencia Apache 2.0, es adecuado para fines educativos, investigación y experimentación en entornos académicos o de desarrollo personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los benchmarks de IBM para Granite 4.2 se refieren al modelo original sin cuantizar y no deben interpretarse como resultados de esta conversión. El autor del repositorio advierte explícitamente que los datos de IBM no son aplicables a este artefacto cuantizado.

## Requisitos de hardware

- Apple Silicon (M1, M2, M3, M4 o posteriores) con al menos 8 GB de RAM unificada para cargar el modelo (el repo pesa 4,7 GB), aunque se recomiendan 16 GB para un uso fluido con contexto moderado.
- No requiere VRAM dedicada; utiliza la memoria unificada del sistema.
- Opciones de despliegue: mediante `mlx-lm` (librería de Apple para inferencia en MLX), con el ejemplo de uso proporcionado en la model card. También puede integrarse en aplicaciones que usen el ecosistema MLX.
- Latencia y throughput: no disponibles. Dependerán del chip concreto (M1 vs M4), de la longitud del contexto y de la configuración de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Formato | Contexto | Licencia |
|---|---|---|---|---|---|
| salohcin714/granite-4.2-8b-mxfp4-mlx | 8B (base) | MXFP4 4-bit | MLX | No disponible | Apache 2.0 |
| salohcin714/granite-4.1-8b-mxfp4-mlx | 8B (base) | MXFP4 4-bit | MLX | No disponible | Apache 2.0 |
| salohcin714/granite-4.1-8b-8bit-gptq-mlx | 8B (base) | GPTQ 8-bit | MLX | No disponible | Apache 2.0 |
| ibm-granite/granite-4.2-8b (original) | 8B | Sin cuantizar | PyTorch | No disponible | Apache 2.0 |

La comparativa se limita a las conversiones del mismo autor y al modelo original, ya que no se dispone de información sobre otros modelos comparables en el contexto de esta ficha. Las diferencias principales radican en la versión de Granite (4.1 vs 4.2) y en el tipo de cuantización (MXFP4 vs GPTQ), lo que afecta al tamaño y posiblemente a la calidad de salida.

## Limitaciones y advertencias

- Este repositorio no está afiliado ni respaldado por IBM. "Granite" es una marca comercial de IBM, utilizada aquí de forma descriptiva.
- La cuantización MXFP4 de 4 bits puede provocar una degradación en la calidad de las respuestas en comparación con el modelo original, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- Al no haberse realizado calibración durante la cuantización, es posible que se pierda algo de precisión en comparación con métodos calibrados como GPTQ.
- No se han realizado evaluaciones independientes de este artefacto cuantizado; los benchmarks de IBM se refieren al modelo original y no deben considerarse representativos de esta conversión.
- La longitud de contexto no se ha especificado en la información disponible, por lo que se desconoce si el modelo soporta ventanas largas (128K, etc.) o si la cuantización afecta a este aspecto.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable revisar los términos de la licencia del modelo original de IBM para asegurar el cumplimiento en aplicaciones de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-8b-mxfp4-mlx
- Modelo base (IBM): https://huggingface.co/ibm-granite/granite-4.2-8b
- Documentación de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Página general de IBM Granite: https://www.ibm.com/granite
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Perfil del autor: https://huggingface.co/salohcin714
