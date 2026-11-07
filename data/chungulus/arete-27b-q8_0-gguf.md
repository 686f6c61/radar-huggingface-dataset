# Chungulus/Arete-27B-Q8_0-GGUF

## Resumen

Arete-27B-Q8_0-GGUF es una cuantizacion independiente en formato GGUF Q8_0 del checkpoint BF16 Arete-27B de Nous Research, publicada por el usuario Chungulus. Arete es a su vez un ajuste fino supervisado (SFT) de Qwen3.8-27B, el modelo denso de Alibaba, orientado a reforzar valores occidentales sobre una base entrenada originalmente en China. Esta version empaqueta el modelo de texto en 26.895.998.464 parametros y anade un proyector multimodal de vision en precision completa (`mmproj-Arete-27B-BF16.gguf`), lo que habilita el pipeline image-text-to-text.

El interes practico de esta ficha radica en que ofrece el modelo en un formato listo para llama.cpp, sin necesidad de convertir pesos ni de disponer de hardware para BF16. La cuantizacion Q8_0 preserva practicamente toda la precision del original (8 bits por peso) a costa de un tamano de repositorio de 29,5 GB, por lo que el modelo encaja en estaciones de trabajo con 32 GB de memoria unificada o GPUs de 40 GB o mas.

Es importante subrayar que se trata de una modificacion no oficial: ni Nous Research ni Alibaba publican ni respaldan esta cuantizacion. La model card del autor es explicita en que no se han evaluado benchmarks, alineamiento politico, uso de herramientas ni calidad en contexto completo, y que las comprobaciones realizadas son funcionales y de corta duracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + vision), base Qwen3.8-27B; sin MTP |
| Parametros totales | 27.356.728.560 (con codificador de vision); 26.895.998.464 en el GGUF de texto |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible de forma oficial; los ejemplos de la model card usan 8192 tokens |
| Tipos de cuantizacion | Q8_0 (esta publicacion); el autor indica que cada formato se cuantizo de forma independiente desde el BF16 original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto) + `mmproj-Arete-27B-BF16.gguf` (proyector de vision en BF16) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Qwen3.8, con 27.356.728.560 parametros contando el codificador de vision. Nous Research aplico un ajuste fino supervisado (SFT) sobre Qwen3.8-27B para reforzar valores occidentales, y midio el cambio con una evaluacion de 803 prompts repartidos en siete categorias de valores, segun la nota publicada en su web. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

La innovacion tecnica relevante en esta publicacion concreta es el proceso de cuantizacion: cada formato se genero de forma independiente desde la exportacion BF16 original, sin recuantizar checkpoints de baja precision y sin dataset de calibracion ni matriz de importancia. Los 18 shards originales se verificaron con SHA256 antes de la conversion y las cabeceras de tensores confirmaron el recuento completo de parametros. El autor advierte que tensores de texto BF16 muestreados difieren del checkpoint padre fijado, y que MTP (multi-token prediction) esta deshabilitado y ausente en el origen, por lo que no se exporta ni se sintetiza.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla Jinja (`--jinja`) en llama.cpp.
- Comprension de imagenes mediante el proyector multimodal incluido, con pipeline image-text-to-text.
- Razonamiento y conocimiento factual: la model card reporta comprobaciones nativas de aritmetica, JSON y factuales superadas.
- Capacidad de agentes y chat: el modelo base se presenta como orientado a chat y agentes, aunque el uso de herramientas no fue evaluado en esta cuantizacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: la validacion se realizo con thinking deshabilitado; no se documenta su comportamiento.

## Casos de uso

- Asistente conversacional local: desplegado con `llama-completion -cnv` sobre llama.cpp, permite mantener dialogos multi-turno en una estacion de trabajo sin dependencia de API externa, con contexto de 8192 tokens en los ejemplos del autor.
- Descripcion y analisis de imagenes: mediante `llama-mtmd-cli` y el proyector BF16, se pueden procesar capturas, diagramas o fotografias con hasta 1024 tokens de imagen y obtener descripciones o respuestas sobre el contenido central.
- Extraccion y validacion de JSON: las pruebas funcionales del autor cubren salidas JSON, lo que lo hace apto para tareas de estructuración de datos en pipelines internos, siempre con validacion posterior.
- Prototipado de agentes con valores alineados a contexto occidental: el ajuste SFT de Nous Research esta pensado para respuestas alineadas con valores occidentales, util en productos dirigidos a ese mercado.
- Inferencia en hardware Apple Silicon: el autor valido el formato en un build concreto de llama.cpp sobre Apple Silicon con `-ngl 99`, lo que permite ejecutarlo en Macs con memoria unificada suficiente.
- Evaluacion comparativa de cuantizaciones: al ser una cuantizacion Q8_0 verificada con SHA256 y manifiesto de procedencia, sirve como referencia de alta fidelidad frente a formatos de menor bit para estudiar la degradacion por cuantizacion.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita la redistribucion con atribucion, adecuada para productos comerciales internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se evaluaron la precision en benchmarks, el alineamiento politico, el uso de herramientas, el video ni la calidad en contexto completo, y que las puntuaciones del modelo original no son resultados medidos de la version cuantizada.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 29,5 GB; el GGUF de texto Q8_0 ronda los 28-29 GB y el proyector BF16 anade aproximadamente 1 GB. Para inferencia completa se recomienda un minimo de 32 GB de memoria disponible, mas margen para contexto y sistema operativo.
- GPU recomendadas: A100 40 GB, A6000 48 GB, L40S 48 GB o H100 para despliegue con holgura; en GPUs de 24 GB (RTX 4090, 3090) no cabe en Q8_0 y seria necesario recurrir a cuantizaciones menores no incluidas en este repositorio.
- Consumer GPU: no cabe en GPUs de consumo de 24 GB a Q8_0. Si cabe en equipos Apple Silicon con memoria unificada de 32 GB o mas, configuracion en la que el autor realizo la validacion.
- Opciones de despliegue: llama.cpp (build de referencia `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`), `llama-completion` para texto y `llama-mtmd-cli` para vision. No se documenta soporte verificado en vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. El autor solo reporta pruebas con temperatura 0, semilla 42, contexto 8192 y un maximo de 128 tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B-Q8_0-GGUF (esta ficha) | 26,9B texto / 27,4B con vision | no disponible (ejemplos a 8192) | Apache 2.0 | GGUF Q8_0 + mmproj BF16 | Cuantizacion no oficial de Chungulus |
| NousResearch/Arete-27B | 27.356.728.560 | no disponible | Apache 2.0 | BF16 (safetensors) | Checkpoint original de Nous Research, referencia de maxima fidelidad |
| Qwen3.8-27B (Alibaba) | ~27B | no disponible | no disponible en la informacion | no disponible | Modelo base sobre el que se aplica el SFT; sin ajuste de valores |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion no oficial: ni Nous Research ni Alibaba respaldan esta publicacion; el autor la identifica como modificacion independiente de Chungulus.
- Sin evaluacion de calidad: no se han medido benchmarks, alineamiento politico, uso de herramientas, video ni calidad en contexto completo. El autor no reclama que la calidad del modelo se mantenga inalterada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no cuantificado en esta version.
- Sesgos: el modelo base fue entrenado por Alibaba y posteriormente ajustado por Nous Research para reforzar valores occidentales; no se documenta una evaluacion de sesgos de esta cuantizacion.
- Idiomas: no se especifican los idiomas soportados.
- Contexto: no se documenta la longitud maxima oficial; los ejemplos usan 8192 tokens y no se ha validado la calidad en contexto completo.
- MTP deshabilitado: los frontends que intenten activar prediccion especulativa o MTP deben desactivarlo, ya que no existe en el origen.
- Compatibilidad de runtime: requiere un build reciente de llama.cpp con soporte de Qwen3.5/Qwen3.8; builds antiguos pueden fallar.
- Licencia: Apache 2.0 permite uso comercial, pero exige conservar el archivo `LICENSE` y las atribuciones a Nous Research y Alibaba al redistribuir.

## Enlaces

- Hugging Face: https://huggingface.co/Chungulus/Arete-27B-Q8_0-GGUF
- Modelo base en Hugging Face: https://huggingface.co/NousResearch/Arete-27B
- Checkpoint padre fijado: https://huggingface.co/NousResearch/Arete-27B/tree/108f0afbdcfaa1ceeda4a635004304dfff6d4da2
- Anuncio de Nous Research: https://nousresearch.com/arete
- Ficha de especificaciones y hardware: https://modelfit.io/models/arete-27b/
