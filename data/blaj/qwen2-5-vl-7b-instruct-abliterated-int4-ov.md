# blaj/Qwen2.5-VL-7B-Instruct-abliterated-int4-ov

## Resumen

El modelo `blaj/Qwen2.5-VL-7B-Instruct-abliterated-int4-ov` es una conversion a formato OpenVINO IR del modelo multimodal `huihui-ai/Qwen2.5-VL-7B-Instruct-abliterated`, que a su vez es una version "abliterated" (con los comportamientos de rechazo eliminados) de `Qwen/Qwen2.5-VL-7B-Instruct`. Se trata, por tanto, de una cadena de derivaciones: Qwen (modelo original) → huihui-ai (abliteration) → blaj (cuantizacion y exportacion a OpenVINO). La exportacion es un VLM completo: incluye torre de vision, fusionador vision-lenguaje, embeddings de texto, modelo de lenguaje, tokenizador y detokenizador.

El problema que resuelve es el despliegue de un VLM de ~7.000 millones de parametros en hardware Intel sin GPU dedicada, mediante cuantizacion int4 asimetrica con grupo de 128 y el runtime OpenVINO. Segun el autor, el repositorio ocupa 6,4 GB y el modelo se sirve a traves de `VLMPipeline` o de OpenVINO Model Server (OVMS), que despacha automaticamente las distintas subgrafias del VLM.

Su relevancia actual es doble: por un lado, demuestra inferencia multimodal viable en una iGPU integrada Intel Arc 130V/140V (22,6 tok/s en decodificacion greedy); por otro, al estar basado en una variante abliterated, resulta util para investigacion sobre alineacion, comportamiento de rechazo y evaluacion de modelos sin capa de censura, aunque con los riesgos asociados que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen2_5_VLForConditionalGeneration` (transformer multimodal: torre de vision + fusionador vision-lenguaje + modelo de lenguaje de 28 capas de texto, hidden size 3584) |
| Parametros totales | Aproximadamente 7.000 millones (segun la denominacion del modelo base Qwen2.5-VL-7B; la model card no desglosa el recuento exacto) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 asimetrica con grupo de 128 (esta build); existe build hermana en int8; la exportacion intermedia se realiza en fp16 antes de comprimir pesos |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (grafos XML/BIN descompuestos); incluye `graph.pbtxt` para OVMS. No se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo Qwen2.5-VL en su variante de 7B: un transformer multimodal que combina una torre de vision, un modulo de fusion vision-lenguaje y un decoder de lenguaje de 28 capas con dimension oculta 3584. La exportacion a OpenVINO se realiza de forma descompuesta, es decir, con grafos separados para vision, fusionador, embeddings de texto y modelo de lenguaje. Esto implica que el grafo de texto expone mas entradas de las dos que espera `LLMPipeline`, por lo que debe cargarse con `VLMPipeline` o servirse con OVMS.

No se dispone de informacion sobre el proceso de entrenamiento en la documentacion proporcionada: no se detallan el numero de tokens, la composicion del dataset original de Qwen2.5-VL ni si hubo fases de RLHF o DPO. Lo unico documentado es el proceso de conversion: primero `optimum-cli export openvino --task image-text-to-text --weight-format fp16` y despues compresion de pesos con `nncf.compress_weights` sobre el IR del modelo de lenguaje. La conversion requiere `optimum-intel` 2.2.0, OpenVINO 2026.4.0 y, de forma notable, transformers 5.0 exactamente: el exportador `qwen2_5_vl` aplica una puerta de version (`MAX_TRANSFORMERS_VERSION = "5.0"`) y falla con versiones posteriores. La abliteration, por su parte, es una modificacion de pesos realizada por huihui-ai sobre el modelo original, no un reentrenamiento documentado en esta ficha.

## Capacidades

- Generacion de texto conversacional e instrucciones multimodales (pipeline `image-text-to-text`).
- Comprension de imagen: reconocimiento de objetos e interpretacion de escenas complejas, segun la descripcion del catalogo de Intel para el modelo base.
- Analisis de documentos: el catalogo de Intel menciona analisis automatizado de imagenes, documentos y contenido de video.
- Entrada de imagen y texto combinados en una misma conversacion (interfaz conversacional).
- Comportamiento de rechazo reducido por la abliteration, orientado a escenarios donde la capa de censura del modelo original resulta limitante.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada (el campo de idiomas no esta poblado en la model card).
- Modo "thinking", audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos escaneados en puesto de trabajo: el modelo acepta imagen y texto y puede procesar facturas, formularios o capturas de pantalla directamente en un equipo con iGPU Intel, sin enviar los documentos a la nube. Es adecuado porque el conjunto de 6,4 GB en int4 cabe en memoria compartida de un portatil con Core Ultra.
- Asistente visual local para atencion al usuario interno: integrado en una aplicacion de escritorio que recibe capturas de pantalla y responde en lenguaje natural. El despliegue via `VLMPipeline` permite empaquetar el modelo dentro de la propia aplicacion sin dependencias de servidores externos.
- Catalogacion y descripcion automatica de activos digitales: generacion de descripciones textuales de imagenes para bibliotecas de fotos, archivos de producto o repositorios documentales, ejecutado por lotes sobre OVMS con `PERFORMANCE_HINT: THROUGHPUT`.
- Extraccion de informacion en pipelines RPA: lectura de pantallazos o imagenes de interfaz para extraer campos estructurados que alimenten un sistema de automatizacion de procesos. La salida de OVMS por REST (`--rest_port`) facilita la integracion con orquestadores existentes.
- Investigacion sobre alineacion y mecanismos de rechazo: al ser una variante abliterated, permite estudiar que comportamientos se eliminan respecto al modelo original y como afecta eso a las respuestas, comparando contra `Qwen/Qwen2.5-VL-7B-Instruct`.
- Red teaming y evaluacion de robustez: analisis de contenido visual y textual en entornos controlados donde se necesita un modelo sin filtros de rechazo para detectar fallos en clasificadores o moderadores posteriores.
- Procesamiento de video por muestreo de fotogramas: analisis de secuencias de imagenes para resumir o etiquetar contenido, aprovechando el componente de vision del VLM y el soporte de lotes de OVMS.
- Prototipado de sistemas de pregunta-respuesta visual (VQA) en laboratorio: validacion rapida de arquitecturas multimodales sobre hardware Intel antes de escalar a modelos mayores o a infraestructura con GPU dedicada.

## Benchmarks y rendimiento

La model card solo publica una medida de throughput, no resultados de calidad (no hay MMLU, HumanEval, GSM8K ni similares). Condiciones de la medicion: Intel Core Ultra 7 258V con iGPU Arc 130V/140V, 30 GB de RAM, OpenVINO Model Server 2026.4.0 sobre GPU, decodificacion greedy, maximo de 128 tokens nuevos, media de 3 ejecuciones.

| Build | Throughput (tok/s) |
|---|---|
| int4 (esta build) | 22,6 |
| int8 (build hermana) | 13,0 |

El autor senala que la decodificacion esta limitada por el ancho de banda de memoria, por lo que el rendimiento sigue de cerca el tamano del modelo. No se han publicado resultados de benchmarks de calidad (exactitud, razonamiento, codigo o vision) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 6,4 GB en int4. A esa cifra hay que sumar el overhead del runtime y la cache KV; una estimacion razonable de huella en memoria se situa en el rango de 7 a 9 GB, aunque la model card no publica una cifra oficial.
- GPU integrada: el modelo esta verificado sobre Intel Arc 130V/140V integrada en Core Ultra 7 258V con 30 GB de RAM compartida. Es el escenario objetivo declarado.
- GPU dedicada: no se documentan pruebas con GPU NVIDIA o AMD. El formato OpenVINO IR esta pensado para el plugin GPU de OpenVINO, orientado a hardware Intel (Arc dGPU e iGPU).
- Cabe en GPU consumer: por tamano, deberia caber en GPUs consumer con 8 GB o mas de VRAM, pero al tratarse de un IR de OpenVINO el uso practico esta ligado a GPU Intel Arc. No hay confirmacion documentada para GPUs NVIDIA consumer.
- Opciones de despliegue: OpenVINO GenAI mediante `VLMPipeline` (obligatorio, ya que el grafo de texto expone entradas adicionales que `LLMPipeline` no maneja) y OpenVINO Model Server (OVMS) con `target_device: GPU`, `nireq: 8`, `PERFORMANCE_HINT: THROUGHPUT` y `NUM_STREAMS: 2`. Se requiere `graph.pbtxt` en el directorio del modelo.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no disponible para este formato. Como alternativa, la variante abliterated original tiene una publicacion en Ollama (`huihui_ai/qwen2.5-vl-abliterated:7b-instruct`).
- Latencia y throughput: 22,6 tok/s en el hardware y la configuracion descritos; el rendimiento depende de los kernels del runtime, el hardware y la distribucion de prompts.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| blaj/Qwen2.5-VL-7B-Instruct-abliterated-int4-ov | ~7B | no disponible | OpenVINO IR | int4 grupo 128 | Apache-2.0 | HuggingFace, 0 descargas |
| blaj/Qwen2.5-VL-7B-Instruct-abliterated-int8-ov | ~7B | no disponible | OpenVINO IR | int8 | Apache-2.0 | HuggingFace (build hermana) |
| huihui-ai/Qwen2.5-VL-7B-Instruct-abliterated | ~7B | no disponible | safetensors (formato original) | fp16 y otras | Apache-2.0 | HuggingFace, Ollama |
| Qwen/Qwen2.5-VL-7B-Instruct | ~7B | no disponible | safetensors | fp16 y otras | Apache-2.0 | HuggingFace, catalogo de Intel |

La diferencia principal entre las cuatro variantes no esta en la arquitectura ni en el numero de parametros, sino en el formato, la cuantizacion y la presencia o ausencia de abliteration. La version int4 de blaj es la unica de las comparadas que ofrece un IR descompuesto listo para OVMS con metricas de throughput publicadas sobre hardware Intel. No se dispone de datos de rendimiento de calidad que permitan comparar la exactitud entre estas variantes.

## Limitaciones y advertencias

- Abliteration: el modelo tiene un comportamiento de rechazo reducido de forma deliberada. El propio autor advierte de que hay que evaluar las salidas antes de desplegarlo. No es adecuado para aplicaciones de cara al publico sin una capa adicional de moderacion.
- Cuantizacion: la compresion int4 con grupo 128 introduce perdida de precision. El autor recomienda reexportar con un grupo de cuantizacion menor o en fp16 si se busca maxima exactitud.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Al tratarse de un modelo de ~7B y de una build cuantizada, es esperable un riesgo de alucinacion relevante en tareas de extraccion de datos, aunque no hay mediciones publicadas.
- Dependencia de version: la conversion exige transformers 5.0 exactamente. Versiones posteriores fallan con un error de puerta de version, lo que complica el mantenimiento del pipeline de conversion a medio plazo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la cadena de licencias del modelo base y de la variante abliterated, ya que la ficha no detalla condiciones adicionales.
- Limitaciones de idioma: el campo de idiomas no esta poblado; no hay confirmacion de cobertura multilingue en esta build.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada ni como la afecta la cuantizacion.
- Portabilidad: el formato OpenVINO IR limita el despliegue a entornos con OpenVINO Runtime. No es compatible con vLLM, llama.cpp, Ollama ni TGI directamente.
- Rendimiento: las 22,6 tok/s medidas corresponden a un escenario concreto (iGPU, greedy, 128 tokens nuevos). El throughput dependera de los kernels del runtime, el hardware y la distribucion de prompts, y puede ser muy inferior en prompts largos o con imagenes de alta resolucion.
- Madurez: el repositorio registra 0 descargas y 0 "likes" en la informacion proporcionada, por lo que no hay evidencia de uso en produccion ni de validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaj/Qwen2.5-VL-7B-Instruct-abliterated-int4-ov
- Build hermana en int8: https://huggingface.co/blaj/Qwen2.5-VL-7B-Instruct-abliterated-int8-ov
- Modelo base abliterated (huihui-ai): https://huggingface.co/huihui-ai/Qwen2.5-VL-7B-Instruct-abliterated
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Version en Ollama de la variante abliterated: https://ollama.com/huihui_ai/qwen2.5-vl-abliterated:7b-instruct
- Ficha del modelo base en el catalogo de software de Intel: https://aiswcatalog.intel.com/models/qwen-qwen2-5-vl-7b-instruct
- Ficha de la variante abliterated en Featherless: https://featherless.ai/models/huihui-ai/Qwen2.5-VL-7B-Instruct-abliterated
