# mradermacher/Inkling-2-Mini-Heretic-i1-GGUF

## Resumen

Inkling-2-Mini-Heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo JoaoZaokk/Inkling-2-Mini-Heretic, publicada por mradermacher. El modelo base es una variante "heretic" (abliterated/uncensored) de Inkling-2-Mini, un modelo de la familia Inkling de Thinking Machines con arquitectura MoE y "looped transformer", disenado para contexto de hasta 1M de tokens y con soporte de decodificacion especulativa mediante MTP (multi-token prediction) y dspark.

El modelo cuenta con 26.070.385.152 parametros totales (segun los safetensors del modelo base) y esta orientado a tareas conversacionales en ingles. La variante "Heretic" implica que se han eliminado o atenuado los mecanismos de rechazo y alineacion de seguridad, lo que lo hace adecuado para escenarios de investigacion donde se requiere generar contenido sin filtros, pero con los riesgos asociados.

Esta publicacion concreta es una cuantizacion i1 (imatrix) en GGUF, pensada para ejecucion local en hardware de consumo (las etiquetas mencionan RTX 3090 y CUDA). El repositorio ocupa 11,0 GB y de momento solo incluye un quant i1-Q2_K, ademas del fichero imatrix para generar cuantizaciones propias. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con looped transformer (segun etiquetas del autor); detalles exactos no disponibles |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1M tokens (segun etiqueta "1m-context"); valor exacto no confirmado en la model card |
| Tipos de cuantizacion | i1-Q2_K (incluido); imatrix disponible para generar otros quants i1 (IQ1_S a Q6_K segun lista de tags) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion i1); el modelo base en safetensors |

## Arquitectura y entrenamiento

Segun las etiquetas del autor, el modelo base emplea una arquitectura MoE (mixture of experts) combinada con un esquema de "looped transformer", en el que capas se reutilizan en varias pasadas para aumentar la profundidad efectiva sin incrementar proporcionalmente el numero de parametros. Tambien se mencionan MTP (multi-token prediction) y decodificacion especulativa ("dspark"), tecnicas orientadas a acelerar la inferencia generando varios tokens por paso y verificandolos.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) en la informacion proporcionada. La variante "Heretic" indica que el modelo base ha sido sometido a un proceso de abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones), lo que altera el comportamiento de seguridad respecto al modelo original. Todos estos detalles proceden de las etiquetas y no de una model card tecnica completa.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento multi-turno con ventanas de contexto muy largas (hasta 1M tokens segun etiquetas).
- Capacidades multimodales: la model card del cuantizador indica explicitamente que es un modelo de vision y que los ficheros mmproj, si existen, estarian en el repositorio estatico.
- Generacion sin filtros de seguridad (variante abliterated/uncensored).
- Soporte potencial de decodificacion especulativa mediante MTP y dspark (segun etiquetas).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un modelo abliterated frente a su version original, comparando tasas de rechazo, sesgos y calidad en tareas sensibles.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde los filtros de seguridad de modelos alineados resultarian limitantes.
- Procesamiento de documentos largos: gracias a la ventana de hasta 1M tokens, puede resumir o extraer informacion de libros completos, expedientes o bases de codigo extensas en una sola pasada.
- Analisis de imagenes en local: al tratarse de un modelo con capacidades de vision, puede emplearse para descripcion de imagenes o extraccion de informacion visual en entornos sin conexion, usando los ficheros mmproj del repositorio estatico.
- Despliegue en hardware de consumo: la cuantizacion i1-Q2_K (11 GB) permite ejecutar el modelo en una GPU de 24 GB como la RTX 3090 o 4090, habilitando experimentacion local sin infraestructura de datacenter.
- Red teaming y evaluacion de robustez: util para generar prompts adversarios y estudiar como responde un modelo sin salvaguardas, informando el diseno de filtros en sistemas en produccion.
- Prototipado de asistentes conversacionales de nicho: en entornos controlados donde el contenido sin censura sea un requisito (por ejemplo, simulacion de personajes), con la debida advertencia a los usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 11-12 GB para el quant i1-Q2_K incluido; quants mayores (Q4_K_M, Q5_K_M, Q6_K) requeririan entre 16 y 22 GB aproximadamente, aunque no se proporcionan tamanos exactos en la informacion disponible.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para el quant i1-Q2_K con margen para contexto; A100 o H100 para contextos de 1M tokens o quants de mayor calidad.
- Cabe en GPU de consumo: si, al menos el quant i1-Q2_K en GPUs de 24 GB; en GPUs de 16 GB podria requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp y Ollama son las opciones naturales para GGUF; vLLM y TGI no soportan GGUF de forma nativa (requeririan el modelo base en safetensors).
- Latencia y throughput: no disponibles. La decodificacion especulativa (MTP/dspark) podria mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Heretic-i1-GGUF (este) | 26,07 B | hasta 1M (segun etiquetas) | Apache 2.0 | GGUF | Variante abliterated, vision, MoE |
| Inkling-2-Mini-Heretic (base) | 26,07 B | hasta 1M (segun etiquetas) | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Inkling-2-Mini-Heretic-GGUF (static) | 26,07 B | hasta 1M (segun etiquetas) | Apache 2.0 | GGUF | Quants estaticos del mismo autor |
| Alternativas de ~25-30 B abliterated | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificables |

No se dispone de informacion suficiente para comparar rendimiento con modelos de la misma categoria.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido danino, ilegal o eticamente problematico sin advertencia. No apto para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad factual; los modelos abliterated suelen degradar ligeramente la coherencia en tareas de razonamiento.
- Solo ingles: el campo `language` indica exclusivamente "en"; el rendimiento en castellano no esta garantizado.
- Contexto de 1M tokens: aunque anunciado en etiquetas, no se confirma en la model card; el rendimiento real en contextos muy largos puede degradarse y el coste de memoria crece de forma cuadratica en atencion.
- Cuantizacion i1-Q2_K: es un quant de baja calidad (2 bits); se espera una perdida notable de calidad frente al modelo base. El propio autor sugiere que IQ3_XXS seria probablemente mejor.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado por un modelo sin salvaguardas.
- Modelo de vision: los ficheros mmproj no estan en este repositorio, sino en el estatico; sin ellos no funcionara la entrada de imagenes.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria; el modelo base es reciente y poco contrastado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Inkling-2-Mini-Heretic-i1-GGUF
- Modelo base: https://huggingface.co/JoaoZaokk/Inkling-2-Mini-Heretic
- Quants estaticos: https://huggingface.co/mradermacher/Inkling-2-Mini-Heretic-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Inkling-2-Mini-Heretic-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre quants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de README de TheBloke para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
