# intel-ai/Qwen3.8-Flash-Next-MXFP8-CT-AutoRound

## Resumen

Qwen3.8-Flash-Next-MXFP8-CT-AutoRound es un checkpoint cuantizado en MXFP8 del modelo Qwen3.8-Flash-Next, un VLM disperso de tipo MoE con 180.000 millones de parametros totales y unos 6,7 B activos por token. Lo publica la cuenta intel-ai y se ha generado con Intel AutoRound 0.16.0 en modo model-free RTN, es decir, sin conjunto de calibracion y sin cargar el modelo, y se exporta en formato compressed-tensors (mxfp8-quantized) para su carga directa en vLLM.

El problema que resuelve es el de servir un modelo de 180 B con un coste de memoria sensiblemente menor: el checkpoint pasa de 360,00 GB a 240,39 GB en disco (factor de compresion 1,50x, 10,68 bits por parametro incluyendo las escalas E8M0), cuantizando a W8A8 MXFP8 todas las capas Linear del torre de texto, incluidas las 73.728 matrices de expertos enrutados. Quedan en BF16 los embeddings, el lm_head, la torre de vision, el bloque MTP completo, la tabla n-gram PLE, los modulos de hyper-connection, los routers MoE y las proyecciones pequenas in_proj_a/in_proj_b del GDN.

Es relevante ahora porque es un ejemplo de cuantizacion a 8 bits especifica para vLLM sobre una arquitectura hibrida poco convencional (atencion lineal Gated DeltaNet combinada con Qwen Sparse Attention, mas una tabla de embeddings n-gram de 51,2 B parametros), y porque documenta de forma explicita dos restricciones estructurales: el limite de compresion cerca de 1,5x y la necesidad de TP >= 2 con moe_backend=marlin. El propio autor advierte de que la perdida no es despreciable: la media agregada cae 0,26 pp, pero MMLU cae 1,37 pp (-4,8 sigma).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (`model_type: qwen4_exp`); vision-lenguaje hibrida: 48 capas = 36 de atencion lineal (Gated DeltaNet) + 12 de atencion completa (`full_attention_interval=4`), MoE disperso de 512 expertos, capa PLE n-gram, hyper-connections y MTP de 1 capa |
| Parametros totales | 179.999.981.459 (~180.000 B) |
| Parametros activos | ~6,7 B por token |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1 M |
| Tipos de cuantizacion | MXFP8 W8A8 (OCP Microscaling, FP de bloque de 8 bits con escalas de grupo E8M0), `group_size=32`, simetrica, activaciones dinamicas. No se documentan otros formatos (GGUF, AWQ, GPTQ) para este checkpoint |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | safetensors con `compressed-tensors` (`format: mxfp8-quantized`), nativo de vLLM; 131 shards |
| Tamano en disco | 240,39 GB / 223,88 GiB en este checkpoint; 360,00 GB / 335,28 GiB en el base BF16 |
| Relacion de compresion | 1,50x (limitada por la tabla n-gram PLE) |
| Bits efectivos por parametro | 10,51 solo pesos; 10,68 en disco incluyendo escalas E8M0 |
| Tensores de peso | 150.720 = 73.896 x F8_E4M3 + 73.896 x U8 (escalas E8M0) + 2.925 x BF16 + 3 x I64 (el base tiene 1.658 tensores, todos BF16) |
| Composicion de parametros | ~125 B MoE + 51,2 B tabla n-gram + 4 B MTP |
| Capas cuantizadas | 73.896 capas Linear en MXFP8 de un total de 76.297; 2.401 permanecen en BF16 |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-Flash-Next |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido con dos mecanismos de atencion conviviendo: 36 capas de atencion lineal basada en Gated DeltaNet (`linear_attn` con `in_proj_qkv`, `in_proj_z`, `out_proj` y las proyecciones pequenas `in_proj_a`/`in_proj_b`) y 12 capas de atencion completa (`self_attn` con `q_proj`, `k_proj`, `v_proj`, `o_proj` y un `indexer.index_qk_proj`), intercaladas con un intervalo de 4. La capa MoE tiene 512 expertos enrutados con 10 activos mas 1 compartido y `moe_intermediate_size=640`, lo que explica que solo ~6,7 B de los 180 B esten activos por token. El modelo incorpora ademas una capa PLE de embeddings n-gram de 51,2 B parametros (tabla `[2.500.012, 160]` repartida en 128 shards, 102,4 GB), modulos de hyper-connection para la mezcla estructural de residuales en el motor de inferencia, y un bloque MTP de 1 capa pensado para decodificacion especulativa.

Sobre el entrenamiento del modelo base no hay informacion en los datos proporcionados: no se detallan tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO. Lo que si esta documentado es el proceso de cuantizacion de este checkpoint: Intel AutoRound 0.16.0 en modo model-free RTN (sin dataset de calibracion ni carga del modelo), con `split_fused_expert_tensors` expandiendo cada bloque de expertos fusionado `[512, N, K]` en capas 2-D con nombre individual `mlp.experts.<i>.{gate,up,down}_proj` y dividiendo `gate_up_proj` por la dimension de salida; de ahi el salto de 1.658 a 150.720 tensores. La innovacion tecnica destacable es precisamente esa granularidad: cada una de las 73.728 matrices de expertos enrutados lleva su propio peso F8_E4M3 y su escala E8M0, mientras el resto de componentes sensibles (embeddings, lm_head, routers, hyper-connections, torre de vision, MTP y tabla n-gram) se mantienen en BF16.

## Capacidades

- Generacion de texto y comprension de imagen: el `pipeline_tag` es image-text-to-text, por lo que el modelo acepta entradas mixtas de imagen y texto.
- Razonamiento y generacion de lenguaje conversacional (etiqueta `conversational`), con contexto nativo de 262.144 tokens y extension declarada hasta 1 M.
- Procesamiento eficiente mediante MoE disperso: 512 expertos enrutados con 10 activos + 1 compartido por token.
- Decodificacion especulativa: el modelo base incluye un bloque MTP de 1 capa destinado a este fin (en este checkpoint el bloque MTP completo permanece en BF16).
- Atribucion de relevancia en contexto largo: 12 capas de atencion completa incluyen un `indexer.index_qk_proj`, que se cuantiza a MXFP8 en este checkpoint.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la ficha de HuggingFace no lista idiomas.
- Otras modalidades (audio, thinking mode explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos con imagenes intercaladas: con 262.144 tokens de contexto nativo, el modelo puede procesar informes extensos, patentes o expedientes completos que combinen texto y figuras en una sola pasada, sin necesidad de trocear el documento.
- Atencion al cliente multimodal multi-turno: el modelo puede gestionar conversaciones en las que el usuario adjunta capturas de pantalla, fotos de producto o recibos, manteniendo el historial completo dentro de la ventana de contexto.
- Extraccion estructurada de documentos escaneados: facturas, formularios o albaranes con campos en texto e imagen, aprovechando la torre de vision (que permanece en BF16, sin degradacion por cuantizacion) y la generacion de texto del torre cuantizado.
- Generacion de codigo asistida por diagramas: a partir de capturas de diagramas de arquitectura o de interfaces, el modelo puede producir esqueletos de codigo o documentacion tecnica, integrándose en herramientas de desarrollo si se anade una capa de tool calling externa.
- RAG multimodal sobre corpus internos: indexacion y consulta de bases documentales con texto e imagen, donde el contexto largo reduce la necesidad de reranking agresivo y el MoE mantiene bajo el coste por token activo.
- Despliegue de inferencia a escala en cluster con vLLM: el checkpoint esta exportado en formato nativo de vLLM (`compressed-tensors`/`mxfp8-quantized`), lo que permite servirlo con tensor parallel y el backend `marlin` documentado, reduciendo el coste de VRAM frente al base BF16.
- Evaluacion y auditoria de tecnicas de cuantizacion: al publicar el plan de precision por capa y las metricas de degradacion, sirve como referencia reproducible para estudiar el impacto de MXFP8 W8A8 en arquitecturas MoE hibridas con tablas de embeddings grandes.
- Clasificacion y moderacion de contenido con soporte visual: analisis de imagenes acompanadas de texto para etiquetado, aunque sin datos publicados de evaluacion especifica en vision en este checkpoint.

## Benchmarks y rendimiento

La unica informacion de evaluacion incluida en los datos disponibles es agregada y comparativa contra el checkpoint base BF16:

| Metrica | Resultado de este checkpoint |
|---|---|
| Media agregada (AVG) | -0,26 pp respecto al base BF16 |
| MMLU | -1,37 pp (-4,8 sigma), descenso senalado explicitamente como no despreciable |
| Evaluaciones de vision | no disponibles; las evaluaciones realizadas son de texto y no ejercitan la torre de vision |

No se han publicado en la informacion disponible las tablas detalladas de benchmarks por tarea (se referencian secciones §3.3 y §3.4 de la model card que no se incluyen en los datos proporcionados). No se inventan cifras adicionales de MMLU, HumanEval, GSM8K u otras.

## Requisitos de hardware

- Tamano de pesos: 240,39 GB / 223,88 GiB en 131 shards de safetensors.
- Minimo de despliegue declarado: 2 GPU con tensor parallel (TP >= 2) y `moe_backend=marlin` en la build de vLLM utilizada. Con 1 sola GPU el motor se queda sin memoria independientemente del tamano de batch, porque la tabla n-gram necesita una segunda copia completa de 95,37 GiB cuando no puede shardearse.
- VRAM por GPU (estimacion aritmetica derivada del tamano declarado, no medida por el autor): con TP=2 se reparten aproximadamente 112 GiB de pesos por GPU; con TP=4, unos 56 GiB; con TP=8, unos 28 GiB. A esas cifras hay que anadir cache KV, activaciones y la gestion de la tabla n-gram, por lo que no deben tomarse como requisito final.
- GPU recomendadas: no se especifica una lista en la informacion disponible. Por el reparto anterior, configuraciones de 4 u 8 GPU con 80 GB por unidad (A100 80 GB, H100 80 GB, H200) son las que encajan con los calculos derivados; para TP=2 harian falta GPU de mas de 112 GiB de memoria util.
- GPU de consumo: no cabe. Una RTX 4090 (24 GB) o cualquier GPU consumer queda muy por debajo de los 223,88 GiB de pesos.
- Opciones de despliegue: vLLM, con carga nativa del formato `compressed-tensors`/`mxfp8-quantized`. No hay documentacion en la informacion proporcionada sobre soporte en llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La unica comparacion documentada es contra el checkpoint BF16 del que deriva. No se describe ningun otro modelo alternativo en la informacion proporcionada.

| Aspecto | Qwen3.8-Flash-Next (BF16) | Qwen3.8-Flash-Next-MXFP8-AutoRound (este checkpoint) |
|---|---|---|
| Parametros totales | 180.000 B | 180.000 B (pesos recodificados) |
| Parametros activos | ~6,7 B por token | ~6,7 B por token |
| Contexto | 262.144 nativo, extensible a 1 M | 262.144 nativo, extensible a 1 M |
| Formato | safetensors BF16, 1.658 tensores | safetensors compressed-tensors MXFP8, 150.720 tensores |
| Tamano en disco | 360,00 GB / 335,28 GiB | 240,39 GB / 223,88 GiB |
| Bits por parametro | 16,0 | 10,51 (pesos) / 10,68 (disco) |
| Rendimiento | referencia | AVG -0,26 pp; MMLU -1,37 pp |
| Licencia | Qwen Community License 1.0 | Qwen Community License 1.0 |
| Despliegue | BF16 estandar | vLLM con TP >= 2 y `moe_backend=marlin` |

Alternativas de la misma categoria (otros VLM MoE de ~180 B): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion no es sin perdida: la media agregada baja 0,26 pp, pero MMLU cae 1,37 pp, un descenso de -4,8 sigma que el propio autor senala como motivo para no tratarlo como una cuantizacion neutra.
- La compresion esta estructuralmente limitada a 1,50x: la tabla de embeddings n-gram PLE (51,2 B parametros, 102,4 GB, 28,4 % del total) es una tabla de busqueda, no una capa Linear, y los formatos MX no pueden aplicarse a ella.
- La cuantizacion se hizo en modo model-free RTN, sin dataset de calibracion y sin cargar el modelo. Esto implica que las escalas se derivan directamente de los pesos, sin ajuste estadistico por capa.
- Requiere un entorno de despliegue muy concreto: TP >= 2 y `moe_backend=marlin` en la build de vLLM empleada. Con una sola GPU se produce OOM en cualquier configuracion de batch.
- La torre de vision permanece en BF16 y las evaluaciones realizadas son de texto, por lo que no hay datos publicados sobre la calidad de las capacidades visuales de este checkpoint.
- Los 2.401 tensores que permanecen en BF16 incluyen los modulos de hyper-connection, los routers MoE, los expertos compartidos (`mlp.shared_expert`) y las proyecciones `in_proj_a`/`in_proj_b` del GDN. El build de auto-round empleado dejo los expertos compartidos en BF16, lo que desvia el recuento respecto al plan de precision previsto por la auditoria (0,236 B de capas).
- El bloque MTP completo (1.536 entradas de expertos enrutados) queda en BF16 por ser un modulo de borrador para decodificacion especulativa fuera de la ruta principal de servicio.
- Sesgos conocidos, comportamiento frente a alucinaciones y evaluaciones de seguridad: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible. No se puede asumir cobertura multilingue sin datos.
- Licencia: Qwen Community License 1.0, etiquetada como `license: other`. No se detallan en la informacion proporcionada los terminos concretos de uso comercial ni las restricciones adicionales; es necesario consultar el fichero LICENSE del repositorio antes de un despliegue en produccion.
- El checkpoint tiene 0 descargas y 0 likes en el momento de los datos consultados, por lo que no existe validacion independiente de la comunidad.
- El repositorio ocupa 240,4 GB, lo que condiciona el almacenamiento y el tiempo de descarga y despliegue en entornos con ancho de banda limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/intel-ai/Qwen3.8-Flash-Next-MXFP8-CT-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Intel AutoRound (herramienta de cuantizacion empleada): https://github.com/intel/auto-round
- La busqueda web realizada no devolvio enlaces relevantes para este modelo: los resultados fueron paginas corporativas generales de Intel (centro de descargas, portada corporativa y listado de procesadores), sin relacion con el checkpoint.
