# Deniss8686/Hermes-4-405B

## Resumen

Hermes-4-405B es un modelo de lenguaje de gran escala de tipo denso (transformer decoder-only) construido a partir del modelo base Meta-Llama-3.1-405B. Se trata de un ajuste fino de instrucciones (instruct/finetune) orientado a razonamiento, desarrollado por Nous Research dentro de su familia Hermes 4 y publicado en este repositorio por el usuario Deniss8686. El modelo incorpora un modo de razonamiento hibrido que emite deliberacion explicita entre etiquetas `<think>...</think>` cuando lo considera necesario y responde directamente cuando no.

Su principal novedad frente a Hermes 3 es un corpus de post-entrenamiento mucho mayor: pasa de aproximadamente 1 millon de muestras y 1.200 millones de tokens a unos 5 millones de muestras y cerca de 60.000 millones de tokens, mezclando datos de razonamiento y de proposito general. La relevancia de este lanzamiento esta en su enfasis declarado en la adherencia a esquemas (salidas JSON validas), el uso de herramientas (function calling) y una reduccion de las tasas de rechazo, con el objetivo de ofrecer un modelo frontier abierto y altamente controlable.

El modelo conserva los aproximadamente 405.900 millones de parametros del Llama-3.1 original y su ventana de contexto de 128.000 tokens. Se distribuye en formato safetensors (precision BF16) bajo la licencia Llama 3.1 Community, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (basado en Llama-3.1-405B) |
| Parametros totales | 405.853.388.800 (~405,9 B) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama-3.1-405B) |
| Tipos de cuantizacion | No disponible en este repositorio; solo pesos safetensors en BF16. Se puede cuantizar externamente a FP8, INT8, INT4/AWQ/GPTQ o GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | llama3 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (transformers) |
| Tamano del repositorio | 811,7 GB |
| Modelo base | meta-llama/Meta-Llama-3.1-405B |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la arquitectura de Llama-3.1-405B: atencion con RoPE, normalizacion RMSNorm, activacion SwiGLU y una ventana de contexto de 128.000 tokens. No emplea mezcla de expertos (MoE), a diferencia de otros modelos frontier de tamano comparable, por lo que todos los parametros estan activos en cada paso de inferencia.

El post-entrenamiento de Hermes 4 introduce un corpus sintetizado y verificado de aproximadamente 5 millones de muestras y 60.000 millones de tokens que combina trazas de razonamiento y datos de proposito general. Segun la model card, el entrenamiento enfatiza el razonamiento verificado, la adherencia a formatos, la reparacion de objetos JSON malformados y la mejorada controlabilidad y alineacion. La familia de herramientas empleadas se asocia a utilidades propias de Nous Research como Atropos y DataForge (etiquetadas en el repositorio). El formato de prompt es el ChatML de Llama-3 con cabeceras de rol (`<|start_header_id|>...<|end_header_id|>`) y tokens especiales para el modo de razonamiento y las llamadas a herramientas.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo de hasta 128.000 tokens.
- Razonamiento hibrido: emite cadenas de pensamiento entre `<think>...</think>` cuando decide deliberar, y puede activarse de forma explicita con el flag `thinking=True` del chat template.
- Razonamiento matematico, logico y de tipo STEM mejorado respecto a Hermes 3 segun la model card.
- Generacion de codigo y asistencia en tareas de programacion.
- Escritura creativa y respuestas subjetivas de mayor calidad (roleplaying, chat).
- Function calling / tool use dentro de un mismo turno del asistente, intercalado con el razonamiento, mediante etiquetas `<tool_call>{...}</tool_call>`.
- Salidas estructuradas: produccion de JSON valido segun esquema y reparacion de objetos malformados.
- Modo de razonamiento con conservacion opcional de las trazas (`keep_cots=True`).
- Controlabilidad y alineacion elevadas, con reduccion declarada de las tasas de rechazo (SOTA en el benchmark RefusalBench segun el autor).
- Soporte multilingue limitado: el modelo esta declarado unicamente para ingles.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno de documentacion extensa aprovechando su ventana de 128.000 tokens, manteniendo el contexto de toda la interaccion sin truncar el historial.
- Asistentes con uso de herramientas: al generar llamadas estructuradas en `<tool_call>` y continuar razonando tras la respuesta de la herramienta, es adecuado para agentes que consultan APIs (clima, bases de datos, buscadores) dentro de un mismo turno.
- Generacion de codigo en produccion: soporta tool calling y salidas estructuradas, por lo que puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests o sugerencias de parches con validacion de esquema.
- Extraccion y validacion de datos estructurados: su entrenamiento especifico en JSON mode le permite convertir texto no estructurado en objetos JSON validos y reparar documentos malformados antes de insertarlos en una base de datos.
- Razonamiento auxiliar en investigacion (STEM): el modo de razonamiento explicito con trazas verificadas es util para descomponer problemas matematicos o logicos paso a paso y auditar el proceso.
- Sistemas de rol y narrativa: las capacidades de roleplaying y escritura creativa permiten construir personajes conversacionales coherentes en contextos largos.
- Analisis de documentos largos: con 128.000 tokens de contexto puede resumir, comparar y responder preguntas sobre informes, expedientes o codigo fuente extensos sin fragmentacion.
- Asistentes internos alineados a politicas propias: su controlabilidad y baja tasa de rechazo permiten ajustar el tono y las politicas mediante el system prompt para dominios corporativos especificos.

## Benchmarks y rendimiento

El model-index del repositorio esta vacio (`results: []`) y la model card no incluye cifras numericas en texto (solo referencias a imagenes y al informe tecnico). Por tanto:

"No se han publicado resultados de benchmarks en la informacion disponible."

Como afirmaciones cualitativas, la model card indica que Hermes 4 alcanza estado del arte en el benchmark RefusalBench frente a modelos abiertos y cerrados populares, y que mejora en matematicas, codigo, STEM, logica y creatividad respecto a Hermes 3, pero no se proporcionan numeros concretos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 810 GB (el repositorio ocupa 811,7 GB), coherente con los ~405,9 B de parametros a 16 bits.
- VRAM estimada por cuantizacion: unos 405 GB en FP8, aproximadamente 230-250 GB en INT4/GGUF Q4_K_M y en torno a 200 GB en cuantizaciones de 4 bits mas agresivas. Estas cifras son estimaciones derivadas del tamano de parametros y no estan confirmadas en la informacion disponible.
- GPU recomendadas: para BF16 se requieren multiples aceleradores de 80 GB, del orden de 10-16 GPU tipo H100 80 GB o A100 80 GB con paralelismo tensorial. En FP8 puede desplegarse en 8x H100 80 GB. En INT4 podria caber en 4x H100/A100 80 GB.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola tarjeta; queda fuera del alcance de equipos de sobremesa incluso cuantizado.
- Opciones de despliegue: vLLM (con el parser de herramientas `hermes`), SGLang (parser `qwen25`), y text-generation-inference (etiqueta `text-generation-inference` presente en el repositorio). Para cuantizaciones GGUF haria falta generar los ficheros externamente, ya que el repositorio solo contiene safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| Hermes-4-405B (este repositorio) | ~405,9 B (denso) | 128.000 | llama3 | Pesos safetensors, 811,7 GB, ingles |
| Hermes 3 405B (Nous Research) | ~405 B (denso) | 128.000 | llama3 | Predecesor directo; menor corpus de post-entrenamiento (~1 M muestras / 1,2 B tokens) |
| Llama 3.1 405B Instruct (Meta) | ~405 B (denso) | 128.000 | llama3 | Modelo base instruct de Meta; sin modo de razonamiento explicito |
| Modelos MoE frontier (p. ej. DeepSeek-V3) | ~671 B totales, ~37 B activos (MoE) | 128.000 | MIT (DeepSeek) | Menor coste de inferencia por token activo; licencia mas permisiva, pero arquitectura distinta |

Las cifras de rendimiento comparativo no estan disponibles en la informacion proporcionada; la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en dominios especializados o con informacion desactualizada.
- Sesgos: entrenado principalmente con datos en ingles; puede presentar sesgos culturales y linguisticos derivados de la composicion del corpus, no detallada en la informacion disponible.
- Cobertura idiomatica limitada: el modelo solo declara soporte para ingles (`en`), por lo que su rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia Llama 3.1 Community: sujeta a condiciones de uso, incluida una politica de uso aceptable y clausulas especificas para el uso comercial por parte de grandes organizaciones. Es imprescindible revisar los terminos antes de un despliegue comercial.
- Requisitos de hardware muy elevados: el despliegue en BF16 exige multiples GPU de 80 GB, lo que limita su uso a infraestructura de centro de datos.
- Repositorio de terceros: este repositorio concreto acumula 0 descargas y 0 likes en el momento de la consulta y esta publicado por un usuario distinto del desarrollador original (Nous Research); conviene verificar la integridad de los pesos antes de usarlos en produccion.
- Trazas de razonamiento: el modo `<think>` incrementa la latencia y el consumo de tokens; debe gestionarse el formato de salida en produccion para separar la deliberacion de la respuesta final.
- Adherencia a esquemas: aunque el modelo esta entrenado para generar JSON valido, sigue siendo recomendable validar las salidas con un esquema formal antes de consumirlas en sistemas criticos.
- Fecha de publicacion: el repositorio figura creado y actualizado el 2026-09-26, fecha posterior al conocimiento base; los datos de rendimiento y mantenimiento del modelo no estan verificados en la informacion disponible.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/Deniss8686/Hermes-4-405B
- Informe tecnico de Hermes 4 (arXiv:2508.18255): https://arxiv.org/abs/2508.18255
- Chat de Nous Research: https://chat.nousresearch.com
- Modelo base Meta-Llama-3.1-405B: https://huggingface.co/meta-llama/Meta-Llama-3.1-405B
