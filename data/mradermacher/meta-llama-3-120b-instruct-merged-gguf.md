# mradermacher/Meta-Llama-3-120B-Instruct-merged-GGUF

## Resumen

Meta-Llama-3-120B-Instruct-merged-GGUF es una distribucion de cuantizaciones estaticas en formato GGUF del modelo imi2/Meta-Llama-3-120B-Instruct-merged, un merge de la familia Llama 3 realizado con mergekit. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de modelos abiertos, que en este caso ha generado un conjunto de cuantizaciones K-quant e IQ-quant desde Q2_K hasta Q8_0.

El modelo subyacente es un merge de aproximadamente 121.900 millones de parametros (121.892.970.496 segun los pesos en safetensors), lo que lo situa en la categoria de modelos densos de gran escala, muy por encima de los 70B habituales y cerca de la frontera de los 120B. El repositorio ocupa 828,9 GB en total, reflejando la suma de todas las variantes de cuantizacion, y esta etiquetado exclusivamente para ingles.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de ~122B en hardware mas modesto gracias a las cuantizaciones (la variante Q4_K_M ocupa 73,3 GB y la Q2_K baja a 45,2 GB); por otro, ilustra las limitaciones de los merges comunitarios, ya que la model card del cuantizador advierte de un fallo de validacion (`found nan value at block 1`) al intentar generar cuantizaciones con imatrix, lo que obligo a publicar solo cuantizaciones estaticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (merge de Llama 3, generado con mergekit); detalles internos no disponibles |
| Parametros totales | 121.892.970.496 (~121,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |
| Tamano del repositorio | 828,9 GB |
| Modelo base | imi2/Meta-Llama-3-120B-Instruct-merged |
| Libreria declarada | transformers |
| Descargas / likes | 10 / 1 |

## Arquitectura y entrenamiento

El modelo base es un merge de la familia Llama 3, construido con mergekit, la herramienta de fusion de pesos de modelos. No se dispone de informacion sobre la receta exacta del merge (que modelos se combinaron, con que metodo de fusion ni con que hiperparametros), ni sobre el proceso de instruccion/alineamiento aplicado. La model card del cuantizador no documenta datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica relevante en este repositorio no esta en el modelo sino en el proceso de cuantizacion: mradermacher ha publicado cuantizaciones estaticas (sin imatrix) porque la generacion de cuantizaciones con imatrix fallo con el error `ggml_validate_row_data: found nan value at block 1`. Esto sugiere la presencia de valores NaN en algunos tensores del merge original, un caveat importante que conviene tener en cuenta al evaluar la calidad numerica del modelo. Las cuantizaciones se ofrecen en multiples ficheros partidos (part1of2, part1of3, etc.) para las variantes de mayor tamano, y el autor remite a las guias de TheBloke para el uso de GGUF y la concatenacion de ficheros multiparte.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del formato Instruct del modelo base.
- Razonamiento general y respuesta a instrucciones, asumiendo el comportamiento tipico de un modelo Llama 3 Instruct de gran escala.
- Capacidades multilingues limitadas: la model card declara unicamente ingles.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades especiales (thinking mode, vision, audio): no documentadas; no hay indicios de multimodalidad.
- Ejecucion local mediante llama.cpp y ecosistema GGUF, incluyendo concatenacion de ficheros multiparte.

## Casos de uso

- Despliegue local de un modelo de ~122B en estaciones de trabajo con suficiente RAM o VRAM: la variante Q4_K_M (73,3 GB) permite ejecutar el modelo en una maquina con 96 GB de RAM o en una GPU de 80 GB con offloading parcial, algo inviable con los pesos completos en fp16.
- Experimentacion e investigacion sobre merges comunitarios: util para estudiar el comportamiento de fusiones de Llama 3 a gran escala y comparar la calidad de distintas cuantizaciones (Q2_K frente a Q4_K_M frente a Q8_0) sobre el mismo merge.
- Generacion de texto en ingles en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp, los datos no salen de la infraestructura propia, lo que encaja en flujos con datos sensibles.
- Prototipado de asistentes conversacionales en ingles: el formato Instruct del modelo base permite construir chatbots de dominio general sin depender de APIs externas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes con tamanos desde 45,2 GB hasta 129,6 GB, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de forma controlada.
- Pruebas de robustez ante artefactos numericos: dado el aviso de valores NaN en el merge, el modelo sirve como caso de estudio para validar pipelines de cuantizacion y deteccion de tensores corruptos antes de llevar un modelo a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K ~45,2 GB; Q3_K_S ~52,9 GB; Q3_K_M ~58,9 GB; Q3_K_L ~64,1 GB; IQ4_XS ~66,0 GB; Q4_K_S ~69,5 GB; Q4_K_M ~73,3 GB; Q5_K_S ~84,1 GB; Q5_K_M ~86,3 GB; Q6_K ~100,1 GB; Q8_0 ~129,6 GB. A estas cifras hay que anadir el overhead de contexto KV cache.
- GPU recomendadas: para Q4_K_M, una GPU de 80 GB (A100 80GB, H100 80GB) permite cargar el modelo completo; en GPUs de 48 GB (A6000, L40S) es necesario offloading parcial a RAM del sistema. Para Q8_0 se requiere una configuracion multi-GPU o un servidor con 128 GB o mas de RAM.
- Cabe en consumer GPU: no de forma completa. Las RTX 4090 (24 GB) y RTX 3090 (24 GB) solo pueden ejecutar variantes muy agresivas con offloading masivo a RAM, con latencia alta. Es un modelo de servidor o estacion de trabajo, no de escritorio.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no consumen GGUF de forma nativa para este tamano; para ellos habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Meta-Llama-3-120B-Instruct-merged-GGUF (este) | ~121,9B | No disponible | GGUF | No disponible | Merge comunitario cuantizado; solo ingles; aviso de NaN en imatrix |
| Llama 3.1 70B Instruct | 70B | 128K (segun Meta) | safetensors, GGUF | Llama 3.1 Community License | Modelo oficial de Meta, ampliamente soportado; la mitad de parametros |
| Llama 3 70B Instruct | 70B | 8K (segun Meta) | safetensors, GGUF | Llama 3 Community License | Predecesor oficial; contexto menor |
| Qwen2.5 72B Instruct | 72B | 128K (segun Qwen) | safetensors, GGUF | Apache 2.0 (segun Qwen) | Alternativa abierta con licencia permisiva y soporte multilingue |

La comparativa se limita a modelos de escala similar; los datos de licencia y contexto de los modelos alternativos provienen del conocimiento general de dichos modelos y no de la informacion proporcionada en esta busqueda, por lo que conviene verificarlos en sus fichas oficiales.

## Limitaciones y advertencias

- El merge original contiene valores NaN en al menos un tensor, segun el aviso `ggml_validate_row_data: found nan value at block 1` que impidio generar cuantizaciones imatrix. Esto puede degradar la calidad o producir salidas anomalas en ciertos prompts.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- No se dispone de informacion sobre la licencia del merge ni del modelo base, lo que impide confirmar si el uso comercial esta permitido. Verificar antes de cualquier despliegue en produccion.
- Al ser un merge comunitario sin benchmarks publicados, no hay evidencia cuantitativa de su calidad frente a modelos oficiales de tamano similar.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no hay evaluaciones de fidelidad disponibles.
- El modelo es muy grande (121,9B) y el repositorio ocupa 828,9 GB; el almacenamiento y el ancho de banda para descargar las variantes multiparte son considerables.
- Las cuantizaciones Q2_K y Q3_K_M tienen calidad reducida segun las propias notas del autor; para uso serio se recomienda Q4_K_M o superior.
- No hay informacion sobre sesgos, datos de entrenamiento ni procesos de alineamiento, lo que dificulta evaluar riesgos de contenido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Meta-Llama-3-120B-Instruct-merged-GGUF
- Modelo base: https://huggingface.co/imi2/Meta-Llama-3-120B-Instruct-merged
- Pagina de descargas del autor: https://hf.tst.eu/model#Meta-Llama-3-120B-Instruct-merged-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
