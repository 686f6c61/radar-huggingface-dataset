# llmtech/decider-4b-fp8

## Resumen

decider-4b-fp8 es la version cuantizada a FP8 del modelo Mapika/decider-4b v2.1, un modelo de decision y clasificacion de texto de 4.205.751.296 parametros (~4,2 B) disenado para resolver tareas de etiquetado estructurado en una sola pasada ("system one", "one-pass"), sin cadena de razonamiento. La cuantizacion la ha realizado LLM Tech (llmtech.eu) con llm-compressor 0.14.0 bajo el esquema FP8_DYNAMIC: pesos FP8 E4M3 con una escala por canal de salida y activaciones FP8 escaladas por token en tiempo de ejecucion. El modelo original, su entrenamiento y su protocolo de evaluacion son de Mapika, y este repositorio solo cambia el formato numerico de los pesos.

El problema que resuelve es el de tomar decisiones discretas y calibradas sobre un estado de entrada (por ejemplo, un texto de ticket) devolviendo respuestas con forma estricta: eleccion entre criterios, si/no, valores cerrados. Frente al checkpoint bf16 (8,41 GB), esta version ocupa 4,85 GB, lo que reduce a la mitad el espacio de pesos y acelera la inferencia en vLLM: entre 1,33x y 1,45x mas throughput de prefill y latencias entre un 24 % y un 29 % menores en las mediciones publicadas. La perdida de precision es de 0,1 puntos de accuracy tanto en tareas vistas como en held-out.

Es relevante ahora porque permite ejecutar un clasificador multi-tarea calibrado (ECE de 0,0311 in-task y 0,0788 held-out en FP8) a gran escala sobre GPU de una sola generacion reciente, con salida estructurada y sin coste de decodificacion autoregresiva: cada fila consume un unico token de salida. La licencia Apache 2.0 facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con modulos de atencion lineal (tags `qwen3_5_text`, modulos `linear_attn` con `conv1d`, `in_proj_a`, `in_proj_b` y delta-net); el detalle exacto no esta confirmado en la informacion disponible |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Longitud de contexto | no disponible (las pruebas de velocidad cubren estados de 1.024, 8.192 y 32.768 tokens) |
| Tipos de cuantizacion | FP8 E4M3 (este repositorio, esquema FP8_DYNAMIC); bf16 en el modelo base; se menciona una receta NVFP4 del autor para el base |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (serializados con compressed-tensors a partir de llm-compressor 0.14.0) |
| Tamano de pesos | 4,85 GB (FP8) frente a 8,41 GB del checkpoint bf16 |
| Tamano del repositorio | 4,9 GB |
| Pipeline declarado | text-classification |
| Modelo base | Mapika/decider-4b, revision `eb5fbdfc9448473ec25e399882912863afbdb70e` |
| Tokens de salida por fila | 1 (una respuesta por fila en las mediciones) |
| Cache KV | no cuantizada |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de ~4,2 B de parametros con modulos de atencion lineal: el listado de capas cuantizadas incluye `linear_attn.conv1d`, `linear_attn.in_proj_a`, `linear_attn.in_proj_b` y un bloque delta-net con `in_proj_qkv`, `in_proj_z` y `out_proj`, junto con atencion completa (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y MLP (`gate_proj`, `up_proj`, `down_proj`). En total, 200 capas lineales se cuantizan a FP8. El etiquetado de HuggingFace apunta a la familia `qwen3_5_text`, lo que situa el modelo en la estirpe de transformers hibridos con atencion lineal de Qwen, aunque la informacion proporcionada no detalla el numero de capas ni la distribucion entre atencion lineal y completa.

Sobre el entrenamiento, esta ficha solo dispone de lo indicado por el cuantizador: el modelo es la version 2.1 de Mapika/decider-4b, entrenado y evaluado por Mapika, y con un protocolo de evaluacion propio que incluye un conjunto de regresion de 95 tareas (67 in-task y 28 held-out) y 144.226 filas, ademas de 231 elementos publicos de JevBench. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otra fase de alineamiento; la model card remite al repositorio del modelo base para esos detalles.

La innovacion de este repositorio es exclusivamente la cuantizacion: llm-compressor 0.14.0 con el esquema FP8_DYNAMIC y sin datos de calibracion, manteniendo en bf16 `embed_tokens`, `lm_head`, `linear_attn.conv1d`, `linear_attn.in_proj_a`, `linear_attn.in_proj_b` y las normalizaciones. Ademas de los pesos (`safetensors`), se conservan sin cambios el tokenizer, la plantilla de chat, la configuracion de generacion y `decider_config.json` (incluidas las temperaturas), salvo los campos `version` y `quantization`.

## Capacidades

- Clasificacion y decision de texto con salida estructurada: el modelo responde con tipos de pregunta definidos en la peticion, como `choice` (elegir entre criterios) y `noul` (si/no), segun el formato Jev de TypeSafe mostrado en la model card.
- Inferencia en una sola pasada ("system one", "one-pass"): no genera cadenas de razonamiento largas; el ejemplo de uso consume un unico token de salida por fila.
- Multitarea: el conjunto de regresion cubre 95 tareas (67 in-task y 28 held-out) sobre 144.226 filas, incluyendo tareas tipo `fin_phrasebank`, `commonsense_qa`, `openbookqa` y `wic`.
- Calibracion de confianza: las metricas publicadas incluyen ECE (error de calibracion esperado), lo que indica que las probabilidades emitidas son utilizables para umbrales de decision.
- Procesamiento por lotes: soporta cargas de trabajo de gran volumen a traves de vLLM, con throughput de prefill medido de decenas de miles de tokens por segundo.
- Servicio HTTP: la libreria `decider-ai[serve]` expone `POST /v1/systemone` con la forma de peticion System One (formato Jev de TypeSafe), con campo `state`, mapa `questions` y `criteria`.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el diseno es de decision en un solo paso.
- Capacidades multilingues: limitadas al ingles (`en`); no se declaran otros idiomas.
- Vision, audio o thinking mode: no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte: con una unica peticion se envian varias preguntas sobre el mismo estado (por ejemplo, `dept` con criterios `billing`, `technical support`, `sales` y `refund` como `noul`). El modelo devuelve la decision de cada pregunta, lo que permite sustituir varias llamadas a un LLM generativo por una sola pasada.
- Triaje y priorizacion de colas de atencion al cliente: clasificar cada mensaje entrante por departamento, urgencia o necesidad de accion y usar las probabilidades calibradas (ECE 0,0311 in-task) para derivar automaticamente los casos con confianza alta y escalar el resto a revision humana.
- Moderacion y etiquetado de contenido a escala: los 56.393 tokens/s de prefill en FP8 con estados de 1.024 tokens permiten procesar cientos de miles de elementos por GPU y hora en tareas de clasificacion discreta.
- Extraccion de campos y normalizacion en pipelines ETL: definir preguntas `choice` con criterios cerrados para mapear texto libre a categorias canonicas antes de cargarlo en un almacen de datos.
- Pre-router de agentes y asistentes: decidir en una sola llamada si una consulta requiere herramienta, derivacion a un humano o respuesta directa, reduciendo el numero de pasos de orquestacion.
- Anotacion asistida y construccion de datasets: generar etiquetas con puntuacion de confianza para preetiquetar corpus grandes, usando el ECE bajo para seleccionar que ejemplos necesita revision manual (active learning).
- Decisiones de negocio con umbrales auditables: en procesos internos de cumplimiento o concesion de exenciones, el modelo devuelve una decision binaria o categorica con probabilidad calibrada, lo que permite fijar umbrales documentados.
- NLI y analisis de similitud semantica por lotes: tareas como `wic` o `openbookqa` del conjunto de regresion muestran que el modelo aborda juicios de coherencia y eleccion multiple en un unico paso.

## Benchmarks y rendimiento

Resultados publicados por LLM Tech comparando el checkpoint bf16 y el FP8 con vLLM 0.29.0 sobre las mismas filas (conjunto de regresion del autor reconstruido desde datos publicos y los 231 elementos publicos de JevBench):

| Metrica | bf16 | FP8 |
|---|---|---|
| In-task accuracy (67 tareas) | 0,8308 | 0,8300 |
| In-task NLL | 0,4146 | 0,4157 |
| In-task ECE | 0,0302 | 0,0311 |
| Held-out accuracy (28 tareas) | 0,7837 | 0,7823 |
| Held-out NLL | 0,5686 | 0,5709 |
| Held-out ECE | 0,0773 | 0,0788 |
| JevBench easy | 48/48 | 48/48 |
| JevBench standard | 71/72 | 71/72 |
| JevBench hard | 73/111 | 74/111 |

El delta por tarea es de -0,1 puntos in-task y -0,1 puntos held-out; el NLL sube +0,0011 y +0,0023. Por tarea, el FP8 queda peor en 44, mejor en 34 e igual en 17; los mayores descensos son `fin_phrasebank` (-1,2 con 970 filas), `commonsense_qa` (-0,9 con 1.221 filas), `openbookqa` (-0,8 con 500 filas) y `wic` (-0,8 con 638 filas). Los niveles de JevBench tienen 48, 72 y 111 elementos, por lo que diferencias de uno a tres elementos quedan dentro de su ruido. El autor indica que su ejecucion en bf16 reproduce la accuracy y el NLL publicados por Mapika con un margen de 0,0005.

Rendimiento medido en vLLM 0.29.0 sobre una RTX PRO 6000 Blackwell Server Edition (96 GB), con prefix caching desactivado, un token de salida por fila y estados aleatorios unicos. El throughput de prefill es el mejor entre tamanos de lote de 1 a 64; la latencia corresponde a una peticion aislada:

| Longitud de estado | bf16 (tokens/s) | FP8 (tokens/s) | bf16 (latencia) | FP8 (latencia) |
|---|---|---|---|---|
| 1.024 | 38.941 | 56.393 (x1,45) | 34 ms | 24 ms |
| 8.192 | 36.724 | 52.205 (x1,42) | 228 ms | 160 ms |
| 32.768 | 30.699 | 40.786 (x1,33) | 1.082 ms | 817 ms |

## Requisitos de hardware

- Pesos en FP8: 4,85 GB, frente a 8,41 GB en bf16. La cache KV no esta cuantizada, por lo que el consumo crece con la longitud del estado y el tamano de lote.
- Estimacion orientativa (derivada del tamano de pesos, no publicada por el autor): alrededor de 6-8 GB de VRAM para estados cortos con lotes moderados en FP8, y del orden de 10-12 GB para la version bf16. Con estados de 32.768 tokens y lotes grandes la VRAM necesaria aumenta de forma apreciable al no estar cuantizada la cache KV.
- GPU empleada en las mediciones: RTX PRO 6000 Blackwell Server Edition (96 GB, SM120), con vLLM 0.29.0. No se han publicado medidas en otras GPU.
- Cabe en GPU de consumo: no confirmado en la informacion disponible. Por tamano de pesos, un checkpoint FP8 de 4,85 GB es compatible con GPU de 12-16 GB o superiores, pero el autor solo ha validado el kernel FP8 en Blackwell (SM120).
- Opciones de despliegue: vLLM 0.29.0 mediante la libreria `decider-ai[serve]` 1.6.0 (`uvicorn decider.serve_vllm:app`), que expone `POST /v1/systemone`. Requiere `ninja` instalado, ya que vLLM compila kernels en el primer arranque. No se han probado TensorRT-LLM ni SGLang.
- Latencia y throughput: 24 ms por peticion aislada con estado de 1.024 tokens, 160 ms con 8.192 y 817 ms con 32.768 en FP8; prefill de hasta 56.393 tokens/s con estados de 1.024 tokens.
- Comando de arranque documentado: `pip install "decider-ai[serve]==1.6.0" vllm==0.29.0 ninja` y `DECIDER_MODEL=llmtech/decider-4b-fp8 uvicorn decider.serve_vllm:app --port 8000`.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar este checkpoint con su propio modelo base en bf16. No se dispone de datos de otros modelos de decision o clasificacion comparables.

| Modelo | Parametros | Cuantizacion | Pesos | Accuracy in-task | Accuracy held-out | Licencia |
|---|---|---|---|---|---|---|
| llmtech/decider-4b-fp8 | 4,2 B | FP8 E4M3, esquema FP8_DYNAMIC | 4,85 GB | 0,8300 | 0,7823 | Apache 2.0 |
| Mapika/decider-4b (bf16) | 4,2 B | bf16 | 8,41 GB | 0,8308 | 0,7837 | Apache 2.0 |

Alternativas de otros autores con el mismo tamano o la misma tarea: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion resta 0,1 puntos de accuracy in-task y 0,1 puntos held-out respecto a bf16 en el mismo motor de inferencia, con un aumento de NLL de 0,0011 y 0,0023 respectivamente.
- Solo se han vuelto a medir el conjunto de regresion y los elementos publicos de JevBench. Los numeros de OpenJev, Mind2Web, browser, game y Bespoke que aparecen en la model card del bf16 no se han reevaluado en FP8, por lo que su comportamiento en esos dominios es desconocido.
- Las mediciones se han hecho unicamente con vLLM 0.29.0 sobre RTX PRO 6000 Blackwell (SM120). No hay validacion con TensorRT-LLM, SGLang ni con otras arquitecturas de GPU; el rendimiento en hardware distinto no esta caracterizado.
- Hereda todas las limitaciones del modelo base en bf16 (Mapika/decider-4b): sesgos del dataset de entrenamiento, dominios cubiertos y comportamiento fuera de distribucion. Esta ficha no dispone del detalle de esas limitaciones.
- Riesgo de alucinacion: al ser un modelo de decision con salida cerrada (`choice`, `noul`) el espacio de respuestas es limitado, pero no se documenta en la informacion disponible ningun analisis de errores fuera de las tareas de regresion.
- Idioma: solo ingles (`en`). No se declara soporte de castellano ni de otros idiomas, por lo que su uso en produccion en espanol no esta validado.
- Longitud de contexto: no declarada en la informacion disponible. Las mediciones llegan a estados de 32.768 tokens, pero no se especifica el maximo soportado ni el comportamiento mas alla de esa longitud.
- La cache KV no esta cuantizada, por lo que el ahorro de memoria del FP8 se limita a los pesos (de 8,41 GB a 4,85 GB).
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial. El modelo base es de Mapika y este checkpoint ha sido cuantizado por LLM Tech; conviene conservar la atribucion de ambos.
- Fecha de publicacion indicada en HuggingFace: 28 de septiembre de 2026. El repositorio tiene 9 descargas y 2 "likes" en el momento de la consulta, por lo que es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llmtech/decider-4b-fp8
- Modelo base (model card bf16): https://huggingface.co/Mapika/decider-4b
- Repositorio del autor del modelo base: https://github.com/Mapika/decider
- LLM Tech (autor de la cuantizacion): https://llmtech.eu
- Revision base indicada: `eb5fbdfc9448473ec25e399882912863afbdb70e`
- Papers, demos o conjuntos de evaluacion (JevBench, OpenJev, Mind2Web): no se proporciona enlace en la informacion disponible.
