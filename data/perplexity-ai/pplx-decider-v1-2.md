# perplexity-ai/pplx-decider-v1.2

## Resumen

pplx-decider-v1.2 es un modelo de decisión y clasificación desarrollado por Perplexity AI, afinado sobre el backbone Qwen3.8-27B (26.085.330.160 parámetros reales según los pesos en safetensors). No es un modelo generativo de texto: su función es recibir un «estado» (texto, JSON serializado o imagen) y un conjunto de preguntas tipadas, y devolver respuestas estructuradas con distribuciones de probabilidad y puntuaciones de confianza. Es la versión sucesora de pplx-decider-v1.1-27b y su relevancia inmediata está en dos cambios: un formato de petición conjunta que responde varias preguntas sobre el mismo estado en una sola pasada, y una reingeniería sustancial de los datos de entrenamiento.

El cambio de formato es el más consecuente a nivel de coste: el modelo lee el estado y todas las preguntas en una única secuencia y coloca un token marcador tras las opciones de cada pregunta para obtener una lectura independiente por pregunta. En la práctica, responder cinco preguntas sobre el mismo contexto cuesta aproximadamente lo mismo que responder una, y las preguntas pueden influirse entre sí cuando son facetas de una misma decisión. El checkpoint es multimodal (texto e imágenes de hasta 1,6 MP) y se ha construido mediante model souping, promediando pesos de varias ejecuciones de entrenamiento.

La evaluación publicada sitúa el modelo en 68,09 en el Decision Index 0.3 público (frente a 62,30 de v1.1) y en 77,43 en el Vision Decision Index 0.3 (frente a 73,22). La licencia es Apache-2.0, aunque el repositorio es privado y requiere un token de Hugging Face con acceso, lo que condiciona su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; fine-tune sobre el backbone Qwen3.8-27B (tag `qwen3_5`, `custom-code`) con cabecera de clasificacion y marcadores de lectura por pregunta |
| Parametros totales | 26.085.330.160 (~26,09 B) |
| Parametros activos | No aplica (no se indica que el modelo sea MoE) |
| Longitud de contexto | No disponible; la model card remite a una seccion «Limits» con un limite de longitud de secuencia que no se incluye en la informacion disponible |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye en BF16 (no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (no se declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), con codigo propio en `source/src` |
| Modalidades | Texto e imagenes de hasta 1,6 MP |
| Tipos de pregunta | `choice` (1-255 opciones), `noul` (probabilidad de verdadero), `score` (ordinal, 2-255 niveles) |
| Entrada del modelo | `state` (str, dict o list; los no-str se serializan como JSON), `questions`, `images` opcional |
| Salida | `answers` (opcion, probabilidades, confianza), `usage` (input_tokens, output_tokens) |
| Tamano del repositorio | 52,2 GB |
| Descargas / likes | 129 / 19 |
| Fecha de creacion / actualizacion | 2026-10-15 / 2026-10-16 |

## Arquitectura y entrenamiento

La informacion disponible no describe en detalle la arquitectura interna: se sabe que el modelo parte de Qwen3.8-27B, que emplea codigo propio (tag `custom-code`, modulo `pplx_decider.Decider`) y que anade un mecanismo de lectura por marcador. El formato de peticion conjunta coloca el estado seguido de cada pregunta y, tras las opciones de cada una, un token marcador cuya representacion se proyecta a la cabeza de clasificacion correspondiente. Esto sustituye el esquema de v1.1, que respondia una sola pregunta por forward pass leyendo el ultimo token. Las opciones se presentan al modelo en el orden proporcionado, codificadas como `A`, `B`, etc., y el modelo devuelve probabilidades por opcion ademas de la respuesta discreta.

El entrenamiento combina varias ejecuciones independientes mediante model souping (promediado de pesos), seleccionado como mejor compromiso agregado en el conjunto de evaluaciones y no sobre un unico benchmark. En datos, Perplexity rehizo el corpus de forma sustancial: incorpora los splits oficiales de entrenamiento de varias tareas del Decision Index (decontaminados contra los conjuntos de test) para que las comparativas del board sean justas, y anade una gran cantidad de datos de decision adicionales. Durante el proceso se monitorizaron regresiones en todos los benchmarks y se midio la mejora fuera del Decision Index, tanto en tareas de decision retenidas como en benchmarks independientes, donde el modelo supera a v1.1. No se documentan volumen de tokens, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion por eleccion entre 1 y 255 opciones, con nombre y descripcion opcional por opcion, devolviendo `choice`, `probabilities` y `confidence`.
- Preguntas binarias tipo `noul`, que devuelven P(verdadero) en lugar de una etiqueta dura.
- Puntuacion ordinal tipo `score` sobre 2 a 255 niveles ordenados de menor a mayor, con `score` como indice esperado del nivel y leyenda asociada.
- Respuesta conjunta de varias preguntas heterogeneas sobre un mismo estado en una sola secuencia, con lecturas independientes por pregunta.
- Entrada multimodal: imagenes hasta 1,6 MP via ruta de fichero, data URI base64 u objeto PIL.
- Aceptacion de estados no textuales (diccionarios, listas) serializados automaticamente como JSON.
- Procesamiento por lotes: `decide` acepta una lista de peticiones y devuelve una lista de respuestas en el mismo orden.
- Salida calibrada con distribuciones completas, apta para umbralizar o para combinar con reglas de negocio.
- No es un modelo de generacion libre: `output_tokens` es 0 en las respuestas; no genera explicaciones ni texto abierto.

## Casos de uso

- Triage de tickets de soporte: una sola peticion con el texto del ticket como `state` y preguntas encadenadas (`choice` para equipo responsable entre billing, support y sales, `noul` para cliente bloqueado, `score` para nivel de frustracion). El coste conjunto es practicamente el de una pregunta, lo que lo hace viable por ticket en tiempo real.
- Enrutado de solicitudes internas: clasificacion de correos o formularios hacia departamentos con hasta 255 categorias y descripciones por categoria, usando `probabilities` para derivar a revision humana cuando la confianza es baja.
- Moderacion y politica de contenido: preguntas binarias multiples (`noul`) sobre el mismo texto para distintas reglas de politica, aprovechando que todas comparten una unica pasada.
- Analitica de sentimiento ordinal: uso de `score` sobre escalas de 4 a 7 niveles para obtener un indice esperado continuo en lugar de una etiqueta discreta, util para series temporales y dashboards.
- Clasificacion de documentos escaneados y capturas: la entrada multimodal de hasta 1,6 MP permite clasificar facturas, capturas de error o pantallazos de consola directamente, sin OCR intermedio.
- Filtrado y reranking en pipelines RAG: evaluacion de relevancia de fragmentos recuperados frente a una consulta con `noul` o `score`, con la probabilidad como señal de ordenacion.
- Evaluacion de agentes y benchmarks de decision: sustituto estandarizado del juicio humano en tareas del Decision Index, con la advertencia de que parte de esos splits se usaron en entrenamiento.
- Control de calidad de anotacion: comparacion de etiquetas humanas contra la distribucion del modelo para detectar desacuerdos y priorizar revision.

## Benchmarks y rendimiento

Decision Index 0.3 (publico). La columna «conjunta» agrupa todas las preguntas de una peticion en una secuencia; «una por peticion» replica el esquema de v1.1.

| Categoria | pplx-decider-v1.1-27b | v1.2 (peticion conjunta) | v1.2 (una pregunta por peticion) |
|---|---:|---:|---:|
| Knowledge | 51,8 | **56,3** | 55,3 |
| Language | 67,5 | **72,8** | 71,9 |
| Retrieval | 61,2 | **68,4** | 68,1 |
| Tools | 79,1 | 84,4 | **85,4** |
| Arts | 47,3 | **56,2** | **56,2** |
| **Overall Decision Index** | 62,30 | **68,09** | 67,75 |

El overall emplea la ponderacion de la suite, no la media simple de categorias. Las dos modalidades de envio solo difieren en los 9 benchmarks cuyas peticiones llevan varias preguntas; en los otros 28 los resultados son identicos.

| Vision Decision Index 0.3 (publico, imagenes hasta 1,6 MP) | pplx-decider-v1.1-27b | pplx-decider-v1.2 |
|---|---:|---:|
| Overall | 73,22 | **77,43** |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de generacion, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM: aproximadamente 52 GiB solo para pesos en BF16, mas memoria de trabajo para activaciones y procesamiento de imagenes; en la practica se recomienda una GPU de 80 GB.
- GPU validas para una sola tarjeta: A100 80 GB, H100 80 GB, H200. En GPUs de 48 GB es necesario reparto entre varias tarjetas o sharding.
- No cabe en GPU de consumo: una RTX 4090 (24 GB) o una RTX 5090 (32 GB) no pueden alojar los pesos en BF16. No se documentan cuantizaciones que lo permitan.
- Despliegue: el unico camino soportado es el codigo propio del repositorio (`Decider.from_pretrained(checkpoint, device="cuda")`), instalable con `pip install ./source` o con el extra `[fast]` (`pip install "./source[fast]"`). No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, coherente con el tag `custom-code`.
- Requisitos de software: Python 3.12 o superior; `requirements.txt` fija torch, transformers, safetensors, pillow, torchvision y huggingface-hub. El repositorio es privado y requiere autenticacion con un token de Hugging Face con acceso.
- Latencia y throughput: no se publican cifras. La model card solo indica que responder N preguntas sobre un mismo estado en formato conjunto cuesta aproximadamente lo mismo que responder una.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision Index 0.3 | Vision DI 0.3 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| pplx-decider-v1.2 | 26,09 B | no disponible | 68,09 (conjunta) / 67,75 (individual) | 77,43 | Apache-2.0 | Repo privado en HF, acceso con token |
| pplx-decider-v1.1-27b | 27 B (segun denominacion; no confirmado) | no disponible | 62,30 | 73,22 | no disponible | Repo publico en HF segun la model card |
| Qwen/Qwen3.8-27B (base) | ~27 B (no confirmado) | no disponible | No aplica: es un LLM generativo, no un modelo de decision | No aplica | no disponible | HF |

La comparacion relevante es interna a la familia: v1.2 mejora a v1.1 en todas las categorias del Decision Index salvo Tools en la modalidad conjunta (84,4 frente a 85,4), y gana 5,79 puntos en el overall con peticion conjunta. Frente al backbone Qwen3.8-27B no existe comparacion posible en tareas de decision, porque el modelo base no expone la interfaz de preguntas tipadas ni probabilidades calibradas. No se dispone de datos de otros modelos de decision comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio es privado: sin un token de Hugging Face con acceso concedido, el modelo no se puede descargar, lo que limita la reproducibilidad y la auditoria externa pese a la licencia Apache-2.0.
- Requiere ejecutar codigo propio del autor (`custom-code`, `pip install ./source`), lo que implica confiar en el codigo del repositorio y fijar versiones antes de usarlo en produccion.
- Coste de hardware elevado: ~52 GiB en BF16 mas memoria de trabajo; no hay cuantizaciones documentadas para reducir requisitos.
- La agrupacion de preguntas no es neutral: segun la model card, ayuda cuando las preguntas son facetas de una misma decision y perjudica cuando son candidatos en competencia (los 9 benchmarks con multiples preguntas difieren entre las dos modalidades de envio).
- Parte de los datos de entrenamiento proviene de splits oficiales de benchmarks del Decision Index, decontaminados contra test pero procedentes del mismo dominio; las puntuaciones del board pueden sobreestimar el rendimiento en decisiones fuera de esa distribucion.
- No es un modelo conversacional ni generativo: no produce justificaciones, texto libre ni cadenas de razonamiento, y `output_tokens` es siempre 0. No sirve para tool calling ni para agentes multi-paso por si mismo.
- No se declara cobertura de idiomas; el rendimiento en castellano u otras lenguas distintas del ingles no esta documentado.
- No se publican analisis de sesgos, tasas de alucinacion ni calibracion fuera de los indices citados; la `confidence` devuelta deberia validarse contra datos propios antes de usarla como umbral automatico.
- Limite de resolucion visual de 1,6 MP: documentos densos o capturas de alta resolucion pueden requerir preprocesado.
- La model card no documenta el limite de longitud de secuencia (seccion «Limits» no incluida); es un parametro critico para estados largos que debe verificarse antes de disenar el pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Version anterior: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Perplexity AI: https://www.perplexity.ai/
- Pagina general de Perplexity (resultado de busqueda, sin documentacion tecnica del modelo): https://www.perplexity.ai/fr/hub/getting-started
- Entrada de Wikipedia sobre Perplexity AI (contexto de la empresa, sin datos del modelo): https://fr.wikipedia.org/wiki/Perplexity_AI

Nota: la busqueda web no devolvio papers, blogs tecnicos ni repositorios especificos de pplx-decider-v1.2; los resultados se limitan a paginas generales de Perplexity. No se dispone de enlace a paper, demo o documentacion adicional.
