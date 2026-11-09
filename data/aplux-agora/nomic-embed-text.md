# APLUX-Agora/Nomic-Embed-Text

## Resumen

Nomic-Embed-Text es un modelo de embeddings de texto publicado por APLUX-Agora, un espacio de Hugging Face centrado en el despliegue de modelos sobre hardware Qualcomm para el ecosistema Agora (AIoT y edge computing). El repositorio no contiene los pesos originales del modelo, sino un paquete de recursos convertidos y listos para ejecutarse en placas con SoC Qualcomm, con binarios de contexto (`model.bin`), ficheros `model.json` por precision y artefactos de pre y post-procesado. El modelo de origen es Nomic-Embed-Text, un encoder de texto que genera embeddings semanticos; esta distribucion concreta se limita a la inferencia en placa.

La funcion declarada es recibir varios fragmentos de texto en ingles y devolver vectores semanticos normalizados de 512 dimensiones junto con una matriz de similitud. El paquete se ha medido en una placa QCS8550 (Rhino Pi X1) con precision FP16, con una latencia de 23,5 ms en la configuracion por defecto de Agora. El repositorio ocupa 0,3 GB, lo que es coherente con un modelo de embeddings de tamano pequeno y pesos cuantizados o empaquetados para el runtime de Qualcomm.

La relevancia de esta ficha es acotada: no se trata de un lanzamiento de modelo nuevo, sino de una conversion orientada a despliegue en dispositivos. Para un desarrollador que evalue embeddings en edge, el dato util es la latencia medida en placa y el formato de empaquetado; para quien busque el modelo original, esta publicacion no es la fuente adecuada. No se dispone de informacion sobre el pipeline de Hugging Face, los idiomas soportados ni la mayoria de especificaciones tecnicas del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings de texto; arquitectura del modelo de origen no indicada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (unica precision documentada para QCS8550) |
| Idiomas soportados | ingles (la model card indica entrada de texto en ingles; no se detalla cobertura adicional) |
| Licencia | APLUX Model Farm License para los recursos convertidos; licencia del modelo de origen segun sus propios terminos |
| Formato de pesos | binarios de contexto `model.bin` por SoC y precision, con `model.json` de configuracion; no se distribuyen safetensors ni GGUF |
| Dimension del embedding | 512 (normalizado) |
| Salidas | vector de embedding y matriz de similitud |
| SoC medido | Qualcomm QCS8550 (placa Rhino Pi X1) |
| Latencia medida | 23,5 ms en FP16 con precision por defecto de Agora |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo de origen en la documentacion proporcionada. Por el tipo de tarea declarada (entrada de texto, salida de embedding de 512 dimensiones y matriz de similitud) se trata de un encoder de texto orientado a representaciones densas, pero no se confirma si emplea atencion bidireccional completa, atencion lineal u otra variante, ni se detallan el numero de capas, la dimension oculta o el vocabulario.

Tampoco se documentan los datos de entrenamiento: no hay cifras de tokens, composicion del corpus, ni indicacion de si hubo ajuste con pares positivos y negativos, destilacion o entrenamiento contrastivo. La model card de esta publicacion se centra exclusivamente en el empaquetado para despliegue: estructura `targets/<SoC>/`, ficheros de configuracion por precision, binarios de contexto y artefactos de pre y post-procesado, ademas de un runner y un proyecto exportable desde Agora. Cualquier innovacion tecnica del modelo original (por ejemplo, variantes de atencion o tecnicas de pooling) no aparece reflejada.

## Capacidades

- Generacion de embeddings de texto: produce vectores semanticos normalizados de 512 dimensiones a partir de fragmentos de texto en ingles.
- Calculo de similitud: devuelve una matriz de similitud entre los fragmentos de entrada, util para ranking y deduplicacion.
- Procesamiento por lotes de varios fragmentos en una sola llamada, segun la descripcion de entrada ("多段英文文本", multiples textos en ingles).
- Inferencia en dispositivo: ejecucion sobre SoC Qualcomm QCS8550 mediante el runtime de Agora, sin dependencia de GPU de servidor.
- Integracion con flujos de Agora: posibilidad de exportar un proyecto o flujo de trabajo que use el modelo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se documenta soporte multilingue mas alla del ingles indicado en la descripcion de entrada.

## Casos de uso

- Busqueda semantica en dispositivos edge: indexar documentos o registros locales y recuperar por similitud coseno usando los vectores de 512 dimensiones, con la ventaja de que la inferencia ocurre en la propia placa QCS8550 con 23,5 ms por ejecucion medida.
- Deduplicacion y agrupamiento de textos: calcular la matriz de similitud entre fragmentos para detectar duplicados o near-duplicates en pipelines de ingestion de datos en el dispositivo.
- Clasificacion de texto por vecino mas cercano: usar los embeddings como caracteristicas de entrada para un clasificador ligero (k-NN o regresion logistica) en aplicaciones de AIoT con recursos limitados.
- Enrutamiento de consultas en asistentes locales: comparar la consulta del usuario con un conjunto de intenciones predefinidas mediante similitud de embeddings y derivar la accion correspondiente, sin enviar texto a la nube.
- Filtrado y moderacion en el borde: puntuar la similitud de mensajes frente a listas de referencia de contenido no deseado antes de reenviarlos a un servicio central.
- Cache semantica para LLM: almacenar embeddings de preguntas previas y reutilizar respuestas cuando la similitud supera un umbral, reduciendo llamadas a modelos generativos en despliegues con conectividad intermitente.
- Recomendacion de contenido en dispositivos: comparar el perfil de interes del usuario (vector agregado) con catalogos de articulos embebidos localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la latencia medida en placa:

| Plataforma | Precision | Latencia |
|---|---|---|
| Qualcomm QCS8550 (Rhino Pi X1) | FP16 | 23,5 ms |

No se proporcionan metricas de calidad de recuperacion (por ejemplo, MTEB, recall@k o nDCG) ni comparaciones con otros embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo se ejecuta sobre el NPU/DSP del SoC Qualcomm mediante el runtime QNN de Agora, no sobre GPU discreta.
- SoC soportado y medido: Qualcomm QCS8550, placa Rhino Pi X1, con precision FP16 y 23,5 ms de latencia por ejecucion.
- Otros SoC: la estructura `targets/<SoC>/` sugiere soporte de multiples plataformas, pero solo QCS8550 aparece documentado y medido.
- GPU de servidor (A100, H100, RTX 4090): no disponible; esta distribucion no incluye pesos en formatos estandar para esas plataformas.
- Opciones de despliegue: runtime de Agora sobre placa Qualcomm; descarga mediante `hf download` filtrando por `targets/$AGORA_SOC/*`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible; solo se publica la latencia de una ejecucion en la configuracion por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Despliegue edge Qualcomm |
|---|---|---|---|---|---|
| APLUX-Agora/Nomic-Embed-Text (esta ficha) | no disponible | no disponible | 512 | APLUX Model Farm License (recursos convertidos) | Si, QCS8550 medido |
| Nomic-Embed-Text (modelo de origen) | no disponible en esta informacion | no disponible en esta informacion | no disponible en esta informacion | segun terminos del modelo original | no disponible |
| Alternativas de embeddings de texto de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas. La unica comparacion posible es cualitativa: frente a un paquete de pesos estandar, esta publicacion aporta binarios listos para QNN y una latencia medida en placa, pero carece de informacion sobre calidad de recuperacion y de formatos portables.

## Limitaciones y advertencias

- La model card solo declara entrada de texto en ingles; no se documenta cobertura multilingue y el rendimiento en castellano es desconocido.
- No se publican metricas de calidad (MTEB u otras), por lo que no es posible evaluar la calidad de los embeddings frente a alternativas.
- El repositorio no contiene los pesos originales en safetensors ni GGUF: es un paquete de despliegue atado al runtime y al SoC, lo que limita la portabilidad a otras plataformas.
- Solo se documenta y mide una plataforma (QCS8550, FP16); el comportamiento en otros SoC o precisiones no esta verificado en la informacion disponible.
- La licencia de los recursos convertidos es la APLUX Model Farm License, distinta de la del modelo de origen; es imprescindible revisar ambos documentos antes de un uso comercial.
- No hay informacion sobre sesgos del modelo de origen ni sobre tasas de error en tareas de recuperacion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.
- El campo `pipeline` de Hugging Face no esta definido, por lo que la integracion con `transformers` no esta garantizada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/APLUX-Agora/Nomic-Embed-Text
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/Nomic-Embed-Text/blob/main/LICENSE_MODEL_FARM.pdf
- Pagina del modelo en Agora (demo y guia de despliegue): https://mega.aidlux.com/models/nomic-embed-text
- Plataforma Agora: https://mega.aidlux.com
- Ficheros de referencia del repositorio: `NOTICE.md` y `SHA256SUMS` en la raiz del repositorio de Hugging Face
