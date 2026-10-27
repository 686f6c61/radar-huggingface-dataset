# CEIA-AI/Qwen3-Extract

## Resumen

Qwen3-Extract es un modelo de generación de texto publicado en HuggingFace por el usuario CEIA-AI bajo el identificador `CEIA-AI/Qwen3-Extract`. Por el nombre y la etiqueta `qwen3` asociada al repositorio, se trata presumiblemente de un ajuste fino (fine-tune) sobre la familia Qwen3 de Alibaba, orientado a tareas de extracción de información, aunque esta orientación no está confirmada en ninguna documentación oficial: la model card del repositorio es la plantilla automática de HuggingFace y no contiene ni una sola sección cumplimentada.

El repo ocupa 8,1 GB y contiene pesos en formato `safetensors` para la librería `transformers`, además de etiquetas que indican compatibilidad con text-generation-inference y endpoints. Ese tamaño es compatible con un modelo de aproximadamente 4 000 millones de parámetros almacenado en bf16/fp16, pero el dato de parámetros no está declarado por el autor y debe tratarse como una estimación indirecta, no como una especificación verificada.

La relevancia de esta ficha es, por tanto, doble: por un lado documenta lo poco que se sabe del modelo; por otro, advierte de que se publicó sin licencia, sin idiomas declarados, sin datos de entrenamiento, sin evaluación y con cero descargas y cero likes en el momento de la consulta. Cualquier uso en producción exige una validación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen3` sugiere la arquitectura transformer de la familia Qwen3; no confirmado por el autor) |
| Parametros totales | no disponible (el repo de 8,1 GB es compatible con ~4B parametros en bf16; estimacion no confirmada) |
| Parametros activos | no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible para este fine-tune (los modelos Qwen3 base declaran 32 768 tokens; no confirmado aqui) |
| Tipos de cuantizacion | no disponible (solo se publican pesos `safetensors`; no se han subido versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponibles (no declarados en la model card) |
| Licencia | no disponible (no se especifica licencia alguna en el repositorio) |
| Formato de pesos | `safetensors` (libreria `transformers`) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura concreta de este checkpoint. La etiqueta `qwen3` y el campo `library_name: transformers` apuntan a un transformer decoder-only de la familia Qwen3, y el tamaño del repositorio (8,1 GB) es coherente con un modelo de ~4B parámetros en precisión bf16, pero el autor no declara ni el número de parámetros, ni las capas, ni la dimensión oculta, ni el mecanismo de atención.

Tampoco se documenta el entrenamiento: se desconoce el volumen de tokens, la composición del dataset, si hubo ajuste supervisado, RLHF o DPO, y qué hiperparámetros se emplearon. El nombre "Extract" sugiere un ajuste orientado a extracción de información estructurada, pero es una inferencia a partir del identificador, no un dato de la model card. La única referencia técnica presente en las etiquetas es el enlace `arxiv:1910.09700`, que corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono y aparece en la plantilla estándar de HuggingFace; no es un paper del modelo.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` está presente, por lo que se espera un uso de chat multi-turno.
- Extracción de información: el nombre del modelo sugiere esta función, aunque no hay documentación, ejemplos ni evaluación que lo respalden.
- Compatibilidad con text-generation-inference y endpoints: las etiquetas `text-generation-inference` y `endpoints_compatible` indican que el repo puede desplegarse con el stack de HuggingFace.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y uso como agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

Dado que no existe documentación funcional, los casos siguientes son escenarios plausibles derivados del pipeline declarado (`text-generation`) y del nombre del modelo, y requieren validación empírica antes de cualquier despliegue:

- Extracción de campos estructurados de documentos: usar el modelo para convertir texto libre (contratos, informes, correos) en JSON con campos predefinidos, aprovechando la aparente especialización en extracción. Requiere construir un conjunto de evaluación propio, ya que no hay métricas publicadas.
- Procesamiento de facturas y albaranes: extracción de importes, fechas y proveedores en un pipeline batch; el tamaño de ~4B parámetros permitiría ejecutarlo en una GPU de 24 GB con cuantización, reduciendo coste frente a modelos de 30B o más.
- Preprocesamiento para RAG: normalizar y estructurar metadatos de documentos antes de indexarlos en una base vectorial, de modo que las consultas recuperen por campos y no solo por similitud semántica.
- Enriquecimiento de bases de datos CRM: extraer entidades (empresa, cargo, sector) de hilos de correo y volcarlas a un esquema relacional, con revisión humana posterior.
- Clasificación y etiquetado asistido: generación de etiquetas y resúmenes cortos sobre lotes de textos en un pipeline de anotación semiautomática.
- Prototipado y experimentación en investigación: servir como checkpoint de partida para estudiar técnicas de extracción estructurada o para hacer fine-tuning adicional, dado su reducido tamaño y su licencia indefinida (lo que obliga a aclararla antes de publicar derivados).
- Chat de soporte de bajo volumen: generación de respuestas multi-turno en un entorno controlado, siempre con evaluación previa, al no existir benchmarks ni declaración de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna sección de evaluación cumplimentada y el autor no declara métricas de MMLU, HumanEval, GSM8K ni de tareas de extracción (F1, exact match, precisión de campos).

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de un repo de 8,1 GB en bf16, se necesitan aproximadamente 9-10 GB de VRAM solo para pesos en bf16, más 1-3 GB de caché KV según longitud de contexto y lote. En cuantización de 8 bits, unos 5-6 GB; en 4 bits, unos 3-4 GB (estimaciones basadas en el tamaño del repo, no en especificaciones publicadas).
- GPU profesionales: una A100 40/80 GB, H100 o L40S son holgadas para este tamaño; una A10G (24 GB) o L4 (24 GB) permiten servir el modelo en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16; en RTX 4080/4070 Ti (16 GB) en bf16 con contexto limitado o en 8 bits; en GPUs de 8-12 GB solo con cuantización de 4 bits (no hay GGUF publicado, habría que generarlo).
- Opciones de despliegue: `transformers` de forma nativa; text-generation-inference (etiqueta presente); vLLM y SGLang son compatibles a nivel de arquitectura si el checkpoint es efectivamente Qwen3, pero no está verificado; llama.cpp/Ollama requerirían convertir los pesos a GGUF, tarea no realizada por el autor.
- Latencia y throughput: no disponibles; no hay mediciones publicadas ni datos de hardware de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| CEIA-AI/Qwen3-Extract | no disponible (~4B estimados por tamano de repo) | no disponible | no disponible | HuggingFace, 0 descargas | Model card vacia, sin evaluacion |
| Qwen3-4B (base de referencia) | 4B | 32 768 tokens (ampliable con YaRN) | Apache 2.0 | HuggingFace, ampliamente utilizado | Modelo oficial con model card completa y benchmarks publicados |
| Qwen2.5-7B-Instruct | 7B | 32 768 tokens (hasta 131 072 con RoPE scaling) | Apache 2.0 (salvo variantes) | HuggingFace | Alternativa consolidada para extraccion y generacion |
| Llama 3.1 8B Instruct | 8B | 131 072 tokens | Licencia comunitaria Llama 3.1 | HuggingFace, Meta | Mayor contexto nativo, requiere aceptar la licencia |

La comparación con los modelos de referencia se basa en sus especificaciones públicas; para Qwen3-Extract no hay datos verificables de parámetros, contexto ni rendimiento, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Model card completamente vacía: no hay descripción, datos de entrenamiento, hiperparámetros, evaluación ni instrucciones de uso. La plantilla generada automáticamente sigue presente con todos los campos en "[More Information Needed]".
- Licencia no especificada: sin licencia explícita no hay autorización clara de uso comercial, y en determinadas jurisdicciones la ausencia de licencia implica reserva de derechos. Es un bloqueante legal para producción.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano ni en ningún otro idioma sin pruebas.
- Riesgo de alucinación: en tareas de extracción, un modelo sin evaluar puede inventar campos, importes o entidades ausentes; se recomienda validación por esquema (por ejemplo, JSON Schema) y revisión humana.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible evaluar sesgos de género, nacionalidad, idioma o dominio.
- Procedencia incierta: se desconoce qué checkpoint base de Qwen3 se usó, con qué datos se ajustó y si se respetaron las condiciones de la licencia original.
- Sin versionado ni mantenimiento: el repo se creó y actualizó en un margen de 12 minutos, con cero descargas y cero likes, lo que sugiere un experimento aislado sin soporte.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que obliga a convertirlas y validarlas por cuenta propia para despliegues en hardware limitado.
- No hay garantía de que la arquitectura sea exactamente la de Qwen3: la etiqueta lo sugiere, pero no se confirma en la documentación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/CEIA-AI/Qwen3-Extract
- Paper, blog, demo o repositorio de código: no disponibles; la búsqueda web no ha devuelto resultados relevantes para este modelo.
