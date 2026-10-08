# positron-ai/Qwen3.5-9B

## Resumen

Positron-ai/Qwen3.5-9B es un espejo (mirror) verbitam del modelo Qwen/Qwen3.5-9B publicado por Qwen, republicado por Positron AI, Inc. con el unico proposito de servir como fuente de descarga fijada y anonima para sus pipelines de integracion continua. El repositorio no introduce ninguna modificacion sobre los pesos: el unico fichero alterado es el README.md, y cada artefacto se verifico por su identificador de objeto (sha256 de LFS o sha1 de git blob) tanto contra el repositorio original como contra el propio espejo antes y despues de la subida.

Se trata de un modelo denso (no MoE) de 9.653.104.368 parametros, distribuido en cuatro ficheros safetensors que suman 19,3 GB en bf16, con licencia Apache 2.0. Segun fuentes de terceros, el modelo subyacente es nativamente multimodal, con soporte declarado de imagen y video (el repositorio incluye `preprocessor_config.json` y `video_preprocessor_config.json`), y una ventana de contexto que se situa en el rango de 262K a 1M de tokens.

Su relevancia practica es doble. Por un lado, el modelo upstream apunta a una franja de tamano muy demandada (9B densos) con licencia permisiva y capacidades multimodales. Por otro, el propio espejo es un caso de estudio de gobernanza de artefactos: fija una revision concreta (`c202236235762e1c871ad0ccb60c8ee5ba337b9a`) para aislar los pipelines de CI de cambios, gating y limites de tasa del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, multimodal (familia `qwen3_5`) |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K-1M tokens segun fuentes de terceros; no confirmado en el repositorio |
| Tipos de cuantizacion | safetensors en bf16 en este repositorio; existe una variante GPTQ de 4 bits publicada por el mismo autor |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4 shards) con `model.safetensors.index.json` |
| Tamano del repositorio | 19,3 GB |
| Revision fijada | `c202236235762e1c871ad0ccb60c8ee5ba337b9a` |
| Fecha de publicacion del espejo | 2026-10-07 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta de familia `qwen3_5` y de los ficheros incluidos. El indice de pesos y el recuento de parametros (9,65 B en cuatro shards de entre 3,3 y 5,4 GB) son consistentes con un transformer denso en bf16, sin mezcla de expertos. La presencia de `preprocessor_config.json`, `video_preprocessor_config.json`, `tokenizer.json`, `vocab.json` y `merges.txt` indica una pila de tokenizacion BPE con preprocesadores de imagen y video, es decir, una arquitectura multimodal con codificador visual integrado. El repositorio incluye ademas `chat_template.jinja`, lo que confirma que el modelo se distribuye con plantilla de chat para uso conversacional.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO u otro tipo de ajuste por preferencias. El repositorio es explicitamente una fuente de descarga para CI y no documenta el proceso de entrenamiento. Del mismo modo, no se documentan innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, atencion hibrida u otras) en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat propia incluida en el repositorio.
- Procesamiento multimodal de imagen, inferido de la presencia de `preprocessor_config.json`.
- Procesamiento de video, inferido de la presencia de `video_preprocessor_config.json`.
- Razonamiento y tareas de conocimiento general, segun la descripcion de terceros del modelo upstream.
- Capacidades multilingues: no confirmadas en la informacion disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Espejo de artefactos para CI/CD: el caso de uso principal y documentado de este repositorio concreto. Un equipo puede fijar la revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a` y descargar los pesos de forma anonima sin depender de la disponibilidad, el gating o los limites de tasa del repositorio upstream, garantizando que las pruebas se ejecutan siempre contra un binario identico.
- Verificacion de integridad de pesos en pipelines de publicacion: el repositorio publica la tabla de identificadores (sha256 de LFS y sha1 de git blob) de cada fichero, lo que permite construir un paso de validacion automatica que compare el hash descargado con el esperado antes de cargar el modelo.
- Auditoria de procedencia de modelos: al conservar la model card original como `README.upstream.md` y documentar la revision de origen, sirve como punto de partida para trazar de que artefacto exacto proviene un peso usado en produccion.
- Asistente conversacional multimodal autoalojado: con 9,65 B de parametros y licencia Apache 2.0, es desplegable en infraestructura propia para atender conversaciones con entrada de imagen, sin coste por token y sin cesion de datos a terceros.
- Analisis de documentos con componentes visuales: la combinacion de contexto largo declarado (262K-1M tokens) y preprocesador de imagen permitiria procesar documentos extensos con figuras o capturas en una sola pasada, siempre que se confirme la ventana real.
- Extraccion de informacion de video: el `video_preprocessor_config.json` habilita flujos de resumen, indexacion o etiquetado de clips, utiles en catalogacion de medios o moderacion de contenido.
- Generacion y revision de codigo en flujos internos: por tamano y licencia encaja en pipelines donde se requiere un modelo autoalojado para autocompletado o revision de parches, aunque el soporte de tool calling no esta confirmado.
- Base para ajuste fino sobre dominio propio: los 9,65 B densos en Apache 2.0 y formato safetensors permiten fine-tuning con LoRA o QLoRA sobre una unica GPU de 24 GB en configuraciones cuantizadas.

## Benchmarks y rendimiento

El repositorio espejo declara explicitamente que no publica resultados de evaluacion y que ninguno debe atribuirse a este repositorio. La model card incluye la advertencia literal de que "no evaluation results are reported here and none should be attributed to this repository".

Respecto al modelo upstream, solo se dispone de afirmaciones cualitativas de sitios agregadores de terceros, no de tablas de benchmarks verificables en la informacion proporcionada:

| Fuente | Afirmacion | Naturaleza del dato |
|---|---|---|
| benchable.ai | 83 % de tasa de exito agregada; rendimiento de velocidad en el percentil 10 | Agregado de terceros, sin desglose por benchmark |
| awesomeagents.ai | Supera a Qwen3-30B en la mayoria de benchmarks; supera a GPT-5-Nano en tareas de vision | Afirmacion cualitativa, sin cifras |
| apxml.com | Publica especificaciones, contexto y puntuaciones de benchmark segun el propio sitio | No consultado en detalle; cifras no disponibles en la informacion proporcionada |

No se dispone de valores numericos de MMLU, HumanEval, GSM8K ni de ningun otro benchmark en la informacion proporcionada, por lo que no se incluyen en esta ficha.

## Requisitos de hardware

- Inferencia en bf16: el peso completo ocupa 19,3 GB, por lo que se necesita una GPU con al menos 24 GB de VRAM para cargar el modelo con comodidad, mas el espacio adicional para cache KV.
- Cache KV: con una ventana declarada de 262K-1M tokens, la cache KV es el factor dominante del consumo de memoria en contextos largos y puede superar con creces el tamano del propio modelo. Se recomienda cuantizar la cache (FP8) o limitar el contexto efectivo en despliegues con VRAM ajustada.
- GPU de datacenter: A100 40 GB y 80 GB, H100 80 GB y L40S 48 GB cubren el modelo en bf16 con margen para contexto largo.
- GPU de consumo: RTX 3090 y RTX 4090 (24 GB) pueden cargar el modelo en bf16, pero con contexto y lote reducidos. Con cuantizacion de 8 bits (aproximadamente 10 GB) o de 4 bits (aproximadamente 5-6 GB) cabe tambien en RTX 4080, RTX 4070 Ti, RTX 4060 Ti 16 GB y, en 4 bits, en GPUs de 12 GB como la RTX 3060.
- Opciones de despliegue: vLLM y TGI para servicio de alto rendimiento con los safetensors; Transformers para uso directo; llama.cpp/Ollama requeririan una conversion a GGUF que no se distribuye en este repositorio. Existe una variante GPTQ de 4 bits publicada por el mismo autor, utilizable con kernels GPTQ en vLLM o exllama.
- Latencia y throughput: no disponibles. La unica referencia de terceros es que el modelo upstream se situa en el percentil 10 de velocidad segun benchable.ai, lo que sugiere tiempos de respuesta mas largos que la media de sus comparables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| positron-ai/Qwen3.5-9B (este repositorio) | 9,65 B densos | 262K-1M segun terceros | Si (imagen y video, segun configuracion incluida) | Apache 2.0 | Espejo CI en HuggingFace |
| Qwen/Qwen3.5-9B (upstream) | 9,65 B densos | 262K-1M segun terceros | Si | Apache 2.0 | Repositorio canonico en HuggingFace |
| Qwen3-30B | no disponible | no disponible | no disponible | no disponible | no disponible |
| GPT-5-Nano | no disponible | no disponible | Si (comparado en tareas de vision por terceros) | Propietaria | API |

La comparacion se limita a lo que la informacion disponible permite afirmar. Segun awesomeagents.ai, Qwen3.5-9B supera a Qwen3-30B en la mayoria de benchmarks y a GPT-5-Nano en tareas de vision, pero no se dispone de las cifras que respaldan esas afirmaciones ni de las especificaciones detalladas de los modelos comparados.

## Limitaciones y advertencias

- Este repositorio no es un canal de adquisicion para procesamiento de pesos ni una fuente bf16 canonica: la model card indica explicitamente que el sujeto canonico sigue siendo Qwen/Qwen3.5-9B. Para cualquier uso que requiera trazabilidad de pesos con fines de procesamiento, debe utilizarse el repositorio upstream.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se publican resultados de evaluacion y la model card prohibe atribuir cualquier resultado a este repositorio.
- La licencia Apache 2.0 permite uso comercial, modificacion y redistribucion sin obligacion de compartir derivados, pero se debe conservar el aviso de licencia y el fichero LICENSE.
- Sesgos conocidos: no disponibles. No hay informacion sobre composicion del dataset ni sobre evaluaciones de sesgo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Como en cualquier modelo generativo de esta escala, existe riesgo de fabricacion de datos, especialmente en tareas factuales.
- Limitaciones de contexto: la ventana de 262K-1M tokens proviene de fuentes de terceros y no esta confirmada en el repositorio. En despliegues reales, el coste de memoria de la cache KV puede obligar a reducirla drasticamente.
- Limitaciones de idioma: la lista de idiomas soportados no esta disponible, por lo que no se puede garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- La velocidad de inferencia es senalada por terceros como un punto debil (percentil 10), lo que puede ser limitante en aplicaciones interactivas con requisitos de latencia estrictos.
- El campo `pipeline` no esta definido en el repositorio, lo que puede complicar la integracion con herramientas que dependen de ese metadato.
- No se distribuyen pesos en GGUF, por lo que el despliegue en llama.cpp u Ollama requiere una conversion propia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/positron-ai/Qwen3.5-9B
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante GPTQ de 4 bits de Positron AI: https://huggingface.co/positron-ai/Qwen_Qwen3.5-9B-ingest-best-gptq
- Ficha de benchmarks de terceros (benchable.ai): https://benchable.ai/models/qwen/qwen3.5-9b-20260310
- Especificaciones y VRAM de terceros (apxml.com): https://apxml.com/models/qwen35-9b
- Ficha de terceros (awesomeagents.ai): https://awesomeagents.ai/models/qwen-3-5-9b/
- Paper de referencia: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
