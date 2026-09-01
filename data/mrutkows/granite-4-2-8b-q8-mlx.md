# mrutkows/granite-4.2-8b-q8-mlx

## Resumen

Este repositorio contiene una conversión a formato MLX del modelo IBM Granite 4.2 8B, cuantizada a 8 bits (q8) y publicada por el usuario independiente mrutkows. El modelo base, desarrollado por IBM, es un modelo de lenguaje denso con arquitectura decoder-only que incorpora capacidades de razonamiento explícito mediante un modo de pensamiento (thinking mode), soporte para tool calling, generación de JSON estructurado y RAG. Esta variante MLX está pensada para ejecutarse de forma nativa en hardware Apple Silicon (chips M1/M2/M3/M4 o posteriores) utilizando el framework MLX y la librería mlx-lm.

La relevancia de esta publicación radica en que permite ejecutar un modelo de 8 mil millones de parámetros con calidad cercana a bf16 en equipos Mac con memoria unificada limitada, gracias a la cuantización de 8 bits que reduce el uso de memoria en aproximadamente un 50 % respecto a la versión en bfloat16. El modelo base se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, y esta conversión hereda esa misma licencia. La arquitectura es densa (no MoE), con un tamaño nominal de 8B según la nomenclatura del modelo base, aunque no se han publicado detalles oficiales sobre la longitud de contexto ni la composición exacta del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense decoder-only transformer |
| Parametros totales | 8B (segun nomenclatura del modelo base, no confirmado oficialmente) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, q8 (esta variante), q4 (segun la model card del autor) |
| Idiomas soportados | Multilingue (idiomas concretos no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 8B emplea una arquitectura densa decoder-only, sin componentes de mezcla de expertos. IBM ha incorporado un modo de pensamiento integrado que permite al modelo generar cadenas de razonamiento (chain-of-thought) dentro de bloques delimitados por etiquetas ` thinking… response`, activables o desactivables mediante parámetros del chat template (`enable_thinking` y `reasoning_effort`). El entrenamiento se diseñó específicamente para escenarios empresariales, con procesos de curación de datos, gobernanza, riesgo y cumplimiento (GRC), y evaluaciones de calidad documental, según indica la model card del autor de la conversión.

La variante MLX aquí publicada no añade ningún ajuste adicional sobre el modelo base; se trata de una conversión de pesos realizada con la herramienta `mlx-lm` del repositorio mlx-examples. La cuantización a 8 bits utiliza un tamaño de grupo de 64, lo que reduce el uso de memoria a aproximadamente la mitad respecto a la versión bf16. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset, ya que esos datos pertenecen al modelo base y no se han replicado en esta ficha.

## Capacidades

- Generacion de texto general y razonamiento multi-paso mediante el modo de pensamiento integrado.
- Soporte de tool calling y function calling, potenciado por razonamiento aumentado.
- Generacion de salida JSON estructurada, util para integraciones con APIs y automatizaciones.
- Capacidades multilingues, aunque no se detalla la lista exacta de idiomas.
- Soporte para retrieval-augmented generation (RAG), permitiendo conectar el modelo a fuentes de conocimiento externas.
- Modo de pensamiento configurable con dos niveles de esfuerzo (`low` y `high`), que permite ajustar la profundidad del razonamiento segun la tarea.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en varios idiomas, apoyandose en RAG para consultar bases de conocimiento internas y en tool calling para consultar sistemas de tickets o CRMs.
- Generacion de codigo en entornos de desarrollo: gracias a su entrenamiento en tareas de programacion, puede generar funciones, explicar fragmentos de codigo o convertir codigo entre lenguajes, integrandose en IDEs o pipelines de CI/CD.
- Agentes autonomos con razonamiento: el modo de pensamiento permite descomponer tareas complejas en pasos intermedios, combinando tool calling para ejecutar acciones y verificar resultados antes de responder.
- Asistentes de documentacion tecnica: el modelo puede resumir, traducir o redactar documentacion a partir de especificaciones, utilizando RAG para mantener coherencia con el contenido existente.
- Analisis de datos y generacion de informes: a partir de datos estructurados, el modelo puede generar resumenes, detectar patrones y producir informes en formato JSON o Markdown.
- Prototipado rapido de aplicaciones conversacionales: gracias a su licencia permisiva y su compatibilidad con MLX, es adecuado para desarrollar chatbots o asistentes de voz en equipos Mac sin necesidad de infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion de IBM menciona que el modelo 8B es adecuado para matematicas, generacion de codigo, dialogo multilingue y flujos agenciales, pero no se proporcionan cifras concretas de evaluaciones como MMLU, HumanEval o GSM8K en esta ficha. Para obtener datos de rendimiento, se recomienda consultar la documentacion oficial de IBM Granite 4.2 o los benchmarks publicados en el repositorio del modelo base.

## Requisitos de hardware

- Requiere macOS con Apple Silicon (M1, M2, M3, M4 o posteriores). No es compatible con CPUs Intel ni GPUs NVIDIA.
- Para la variante q8 se estima un uso de memoria de aproximadamente 8-9 GB de memoria unificada, basandose en la afirmacion de la model card de que reduce el uso en un 50 % respecto a bf16 (que requiere al menos 16 GB).
- La variante q4 es adecuada para sistemas con 8 GB de memoria unificada, segun la model card del autor.
- Inferencia y fine-tuning mediante la libreria `mlx-lm`, que se instala con `pip install mlx-lm`.
- Se puede ejecutar tambien de forma efimera con `uvx --with "mlx[cpu]" mlx_lm.generate`.
- No se proporcionan datos de latencia o throughput, ya que dependen del modelo exacto de chip y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoria. El modelo base cuenta con variantes GGUF publicadas por IBM (ibm-granite/granite-4.2-8b-GGUF) que permiten ejecucion en CPU/GPU via llama.cpp, pero no se han encontrado datos comparativos de rendimiento entre ambas opciones. Tampoco se han localizado modelos de tamano similar con capacidades de razonamiento integrado en formato MLX para Apple Silicon en la informacion proporcionada.

## Limitaciones y advertencias

- Esta conversion es un trabajo de un tercero (mrutkows) y no esta respaldada oficialmente por IBM, por lo que la calidad de la cuantizacion puede variar respecto a la version oficial.
- La cuantizacion a 8 bits puede introducir una ligera degradacion en la calidad de las respuestas en comparacion con la version bf16, especialmente en tareas que requieren precision numerica o razonamiento extenso.
- El modelo requiere hardware Apple Silicon; no se puede ejecutar en GPUs NVIDIA ni en CPUs x86 sin herramientas de emulacion adicionales.
- No se han documentado sesgos especificos ni riesgos de alucinacion en la informacion disponible, pero como todo modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en dominios especializados.
- La longitud de contexto no esta especificada; se recomienda consultar la documentacion del modelo base para conocer este parametro antes de usarlo en aplicaciones que requieran ventanas largas.
- Aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del usuario verificar que el uso previsto cumple con las politicas de IBM y con la legislacion aplicable.

## Enlaces

- Repositorio de esta variante MLX: https://huggingface.co/mrutkows/granite-4.2-8b-q8-mlx
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-4.2-8b
- Documentacion oficial de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Pagina general de Granite de IBM: https://www.ibm.com/granite
- Variantes GGUF del modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b-GGUF
