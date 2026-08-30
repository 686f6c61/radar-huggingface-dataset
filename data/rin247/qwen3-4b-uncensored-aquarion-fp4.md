# Rin247/Qwen3-4B-Uncensored-Aquarion-FP4

## Resumen

El modelo `Rin247/Qwen3-4B-Uncensored-Aquarion-FP4` es una variante cuantizada y "abliterada" del modelo Qwen3-4B, desarrollada por el usuario Rin247 dentro del proyecto *Genesis of Aquarion*. Se trata de una cuantización FP4 (weight-only) en formato safetensors, que reduce significativamente el tamaño de los pesos para permitir su ejecución en hardware con recursos limitados. Además, los pesos han sido sometidos a un proceso de abliteración mediante proyección ortogonal de la dirección de rechazo, eliminando así las restricciones de contenido del modelo original.

El modelo resuelve dos problemas prácticos: el alto consumo de memoria de los LLMs de 4B parámetros y la censura presente en el Qwen3-4B base. Al combinar ambas técnicas, ofrece una alternativa ligera y sin filtros para desarrolladores que necesitan desplegar un asistente local con respuestas sin restricciones. Su relevancia radica en que permite ejecutar un modelo de razonamiento en GPUs de gama media o incluso en CPU, manteniendo un equilibrio entre tamaño y capacidad.

La arquitectura subyacente es un transformer denso con atención estándar, heredado de Qwen3-4B, con una longitud de contexto de 32K tokens en su versión original. Sin embargo, esta variante no publica datos específicos sobre idiomas soportados, licencia ni benchmarks, lo que obliga a tratar con cautela sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B) |
| Parametros totales | 2.205.810.176 (según safetensors; el modelo base Qwen3-4B tiene ~4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-4B soporta 32K) |
| Tipos de cuantizacion | FP4 (weight-only) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (FP4 con escalas y shapes en buffers adicionales) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso con atención multi-cabeza estándar, entrenado con 36 billones de tokens según el informe técnico de Qwen3. La variante aquí descrita no ha sido reentrenada; en su lugar, se ha aplicado una técnica de abliteración que consiste en proyectar ortogonalmente los pesos para eliminar la dirección asociada al rechazo de preguntas sensibles. Este proceso se realiza antes de la cuantización, preservando la funcionalidad general del modelo mientras se elimina la censura.

La cuantización FP4 se ha llevado a cabo mediante RTN (round-to-nearest) en CPU, almacenando las escalas y las formas de los tensores en buffers auxiliares (`*.weight_scale`, `*.weight_shape`). Esto implica que el modelo no se puede cargar directamente con librerías estándar como `transformers` sin un paso previo de dequantización manual, tal y como indica la model card. No se ha publicado información sobre el dataset de entrenamiento adicional ni sobre técnicas de RLHF/DPO aplicadas a esta variante.

## Capacidades

- Generación de texto sin censura: gracias a la abliteración, el modelo no rechaza preguntas sobre temas sensibles (violencia, drogas, sexualidad, etc.), ofreciendo respuestas directas.
- Razonamiento y resolución de problemas: hereda las capacidades de Qwen3-4B para tareas de lógica, matemáticas y análisis.
- Generación de código: el modelo base es competente en lenguajes como Python, JavaScript y otros, aunque no se han verificado en esta variante.
- Soporte multilingüe: el Qwen3-4B original soporta más de 30 idiomas, pero esta variante no especifica qué idiomas conserva tras la cuantización y abliteración.
- Modo thinking: Qwen3-4B incluye un modo de razonamiento extendido, aunque no se confirma si esta variante lo mantiene.
- No se menciona soporte para tool calling ni function calling en la model card, aunque el modelo base sí lo ofrece.

## Casos de uso

- Asistente local sin filtros: ideal para usuarios que necesitan respuestas directas sobre temas controvertidos sin evasivas. El modelo puede ejecutarse en una GPU con 4-6 GB de VRAM gracias a la cuantización FP4.
- Generación de contenido creativo: escritura de ficción, guiones o diálogos que requieran explorar temas tabú sin restricciones de política de contenido.
- Prototipado rápido en entornos con recursos limitados: al ocupar solo 2.8 GB en disco y requerir menos de 3 GB de VRAM en FP4, permite iterar en aplicaciones de chatbot sin necesidad de infraestructura cara.
- Despliegue en edge devices: su pequeño tamaño lo hace apto para dispositivos como Raspberry Pi (con suficiente RAM) o laptops con GPU integrada, siempre que se implemente la dequantización adecuada.
- Investigación en alineación y seguridad: permite estudiar el efecto de la abliteración en el comportamiento del modelo, comparándolo con el original para analizar sesgos y riesgos.
- Integración en pipelines de generación de datos sintéticos: para crear datasets etiquetados sin las limitaciones de censura del modelo base, aunque se debe validar la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Se recomienda ejecutar evaluaciones propias antes de usar el modelo en producción.

## Requisitos de hardware

- VRAM estimada: con cuantización FP4, los pesos del modelo ocupan aproximadamente 2.2 GB (según el número de parámetros en safetensors). Sumando overhead de activaciones y caché, se estima un consumo total de 4-6 GB para inferencia con contexto de 4K-8K tokens.
- GPU recomendadas: tarjetas con 6 GB o más, como RTX 2060, RTX 3050, RTX 4060, o GPUs de datacenter como T4 o L4. También puede ejecutarse en CPU con 16 GB de RAM, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: no se mencionan motores específicos. Debido al formato FP4 personalizado, se requiere un paso de dequantización manual. Es posible adaptarlo para vLLM o llama.cpp si se convierten los pesos, pero no hay instrucciones oficiales.
- Latencia y throughput: no disponibles. Dependerá del hardware y del motor de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Abliterado | Contexto | Licencia |
|---|---|---|---|---|---|
| Qwen3-4B (original) | ~4B | BF16 | No | 32K | Apache 2.0 |
| huihui-ai/Qwen3-4B-abliterated | ~4B | BF16 | Sí | 32K | Apache 2.0 |
| Rin247/Qwen3-4B-Uncensored-Aquarion-FP4 | 2.2B (según safetensors) | FP4 | Sí | No disponible | No disponible |

La comparativa muestra que esta variante es la única con cuantización FP4, lo que la hace más ligera que las alternativas, pero a costa de una posible pérdida de calidad. La ausencia de licencia explícita es un inconveniente para uso comercial, mientras que el modelo original y el abliterado de huihui-ai conservan la licencia Apache 2.0.

## Limitaciones y advertencias

- La cuantización FP4 puede degradar la calidad de las respuestas en comparación con el modelo en BF16, especialmente en tareas de razonamiento complejo o generación de código largo.
- La abliteración elimina los mecanismos de rechazo, lo que puede generar contenido ofensivo, ilegal o peligroso. El desarrollador no proporciona ninguna salvaguarda adicional.
- No se ha publicado información sobre sesgos del modelo ni sobre su comportamiento en escenarios de uso real. Se recomienda evaluar exhaustivamente antes de desplegar.
- La licencia no está especificada, lo que impide conocer si se permite el uso comercial o la redistribución. Esto supone un riesgo legal para proyectos empresariales.
- El formato FP4 con buffers personalizados requiere un proceso de dequantización manual; no es compatible directamente con librerías estándar como `transformers` o `llama.cpp` sin conversión previa.
- La longitud de contexto no se ha confirmado; si se mantiene la del modelo base (32K), el consumo de memoria aumentará proporcionalmente, reduciendo la ventaja de la cuantización.
- No hay benchmarks ni evaluaciones publicadas, por lo que el rendimiento real es incierto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Rin247/Qwen3-4B-Uncensored-Aquarion-FP4)
- [Qwen3-4B original](https://huggingface.co/Qwen/Qwen3-4B)
- [Artículo técnico de Qwen3 (arXiv)](https://arxiv.org/html/2505.09388v1)
- [Variante abliterada sin cuantizar (huihui-ai)](https://huggingface.co/huihui-ai/Qwen3-4B-abliterated)
