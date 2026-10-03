# sjoerdbodbijl/embeddinggemma-300m-6bit

## Resumen

El modelo `sjoerdbodbijl/embeddinggemma-300m-6bit` es una conversion a formato MLX del modelo de embeddings `google/embeddinggemma-300m`, derivada de la variante cuantizada `google/embeddinggemma-300m-qat-q8_0-unquantized`. Se trata, por tanto, de un modelo de representacion densa de texto (sentence-similarity y feature-extraction), no de un modelo generativo: su funcion es transformar frases, parrafos o documentos en vectores normalizados que permiten medir similitud semantica, hacer recuperacion de informacion o alimentar sistemas de busqueda vectorial.

El repositorio lo publica el usuario `sjoerdbodbijl` y contiene el modelo en 6 bits para su uso con el stack MLX de Apple, empleando la libreria `mlx-embeddings`. La model card reproduce la documentacion de `mlx-community/embeddinggemma-300m-6bit`, que fue convertida con `mlx-lm` version 0.0.4. El modelo base es la familia EmbeddingGemma de Google, construida sobre la arquitectura `gemma3_text`.

Con 307.581.696 parametros reales (segun los pesos safetensors) y un tamano de repositorio de aproximadamente 0,3 GB, es un modelo ligero, pensado para ejecutarse en portatiles y equipos de escritorio con Apple Silicon. Su relevancia radica en ofrecer embeddings de calidad competitiva con un coste de memoria muy bajo, adecuado para prototipado local y despliegues de recuperacion a pequena y mediana escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo encoder, familia `gemma3_text` (tag del repositorio) |
| Parametros totales | 307.581.696 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (MLX, segun el nombre del repositorio); el modelo de origen es `qat-q8_0-unquantized` |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de uso de Google, con acceso restringido/gated) |
| Formato de pesos | safetensors (tags del repositorio); conversion MLX para `mlx-embeddings` |

## Arquitectura y entrenamiento

El modelo es un encoder de texto basado en la arquitectura `gemma3_text` de Google, adaptado para producir embeddings de frase (no genera texto). El repositorio del que deriva esta conversion es `google/embeddinggemma-300m-qat-q8_0-unquantized`, lo que indica que el modelo original se entreno con cuantizacion consciente del entrenamiento (QAT) y que esta variante parte de la version desquantizada para volver a cuantizarse a 6 bits en formato MLX.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion operativa mas destacable documentada en la model card es el uso de prefijos especificos por tarea (por ejemplo, `task: sentence similarity | query: `, `task: search result | query: `, `task: clustering | query: `, `task: classification | query: `, `task: code retrieval | query: ` o `title: none | text: `), que orientan la representacion hacia el caso de uso concreto y que deben aplicarse de forma coherente en indexacion y consulta.

## Capacidades

- Generacion de embeddings de texto normalizados para frases, parrafos y documentos.
- Similitud semantica entre textos (sentence similarity) mediante producto escalar o similitud coseno.
- Recuperacion de informacion (retrieval) y busqueda semantica sobre corpus vectoriales.
- Clustering y agrupacion semantica de textos.
- Clasificacion y clasificacion multietiqueta mediante representaciones vectoriales.
- Reranking de resultados de busqueda.
- Recuperacion de codigo (`task: code retrieval` segun los prefijos documentados).
- Bitext mining y comparacion entre pares de textos.
- Extraccion de caracteristicas (feature-extraction) para pipelines posteriores.
- No soporta generacion de texto, tool calling, agentes ni modos de razonamiento: es un modelo exclusivamente de embeddings.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Busqueda semantica en documentacion interna: indexar los fragmentos con el prefijo `task: search result | query: ` y consultar con el mismo prefijo, aprovechando que el modelo es ligero (unos 0,3 GB) para desplegarlo junto a una base vectorial local.
- RAG sobre base de conocimiento corporativa: generar embeddings de los chunks del corpus y del prompt del usuario para recuperar los pasajes relevantes antes de pasarlos a un LLM generativo.
- Deduplicacion y clustering de tickets de soporte: agrupar incidencias por similitud con el prefijo `task: clustering | query: ` para detectar patrones recurrentes sin etiquetado previo.
- Clasificacion de textos con pocas muestras: usar los embeddings como entrada de un clasificador lineal para moderacion, categorizacion de noticias o enrutado de correos.
- Reranking de resultados de un buscador tradicional: recalcular la relevancia de los primeros candidatos con `task: search result | query: ` para mejorar el orden final.
- Busqueda de codigo en repositorios: emplear el prefijo `task: code retrieval | query: ` para localizar fragmentos de codigo relevantes a partir de una descripcion en lenguaje natural.
- Prototipado local en Mac: al estar en formato MLX, permite experimentar con embeddings en Apple Silicon sin GPU dedicada, con un consumo de memoria minimo.
- Deteccion de plagio o similitud de pares: comparar documentos con `task: sentence similarity | query: ` y un umbral de similitud coseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP16 teniendo en cuenta los 307,6 M de parametros; en torno a 0,23-0,3 GB en 6 bits (estimacion calculada a partir del numero de parametros, no un dato publicado).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo es compatible con cualquier GPU consumer moderna.
- Cabe en GPU consumer: si, dado su tamano (menos de 1 GB en cualquiera de las cuantizaciones habituales); no se especifican modelos concretos en la informacion disponible.
- Opciones de despliegue: `mlx-embeddings` (documentado en la model card), `sentence-transformers` (libreria declarada en el repositorio), `text-embeddings-inference` y endpoints compatibles (tags del repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `sjoerdbodbijl/embeddinggemma-300m-6bit` | 307.581.696 | no disponible | Gemma | safetensors / MLX (6 bits) | Repositorio HuggingFace, 0 descargas y 0 likes |
| `mlx-community/embeddinggemma-300m-6bit` | no disponible | no disponible | Gemma | MLX | Repositorio publico de MLX Community |
| `google/embeddinggemma-300m-qat-q8_0-unquantized` | no disponible | no disponible | Gemma | safetensors | Modelo original de Google, acceso gated |
| Otros modelos de embeddings de ~300 M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni responde a instrucciones; cualquier expectativa de chat, tool calling o razonamiento multi-paso queda fuera de su alcance.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si puede producir similitudes espurias cuando los textos comparten vocabulario superficial sin relacion semantica real.
- La longitud de contexto no esta documentada en la informacion disponible, por lo que se desconoce el limite maximo de tokens por entrada; conviene validarlo antes de indexar documentos largos.
- La cobertura de idiomas no esta declarada en el repositorio; no se puede asumir soporte multilingue sin verificacion.
- La licencia Gemma es una licencia con clausulas de uso aceptable y de acceso gated: requiere aceptar los terminos de Google antes de descargar y condiciona el uso comercial.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia, por lo que no hay evidencia de uso en produccion ni de mantenimiento continuado.
- La model card corresponde al repositorio `mlx-community/embeddinggemma-300m-6bit` y no describe especificamente esta copia; el autor de este repositorio no aporta documentacion propia ni resultados de validacion.
- Al ser una conversion no oficial de un tercero, no existe garantia de equivalencia numerica con el modelo original de Google.
- Es imprescindible aplicar los prefijos de tarea de forma coherente entre indexacion y consulta; de lo contrario, la calidad de la recuperacion se degrada de forma significativa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sjoerdbodbijl/embeddinggemma-300m-6bit
- Repositorio de origen de la conversion: https://huggingface.co/mlx-community/embeddinggemma-300m-6bit
- Modelo base de Google: https://huggingface.co/google/embeddinggemma-300m-qat-q8_0-unquantized
