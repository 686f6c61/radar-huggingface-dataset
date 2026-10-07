# inference-optimization/GLM-4.7-Flash-0.82B-MTP-PR3225-FP8-Dynamic

## Resumen

GLM-4.7-Flash-0.82B-MTP-PR3225-FP8-Dynamic es un artefacto de prueba publicado por la organizacion inference-optimization para validar la cuantizacion FP8_DYNAMIC dentro del flujo de trabajo de LLM Compressor, concretamente la pull request numero 3225 del repositorio vllm-project/llm-compressor. No es un modelo de lenguaje destinado a produccion: su backbone se inicializo de forma aleatoria y se entreno sobre un corpus de texto de juguete incluido en el repositorio, sin reutilizar pesos preentrenados.

La arquitectura reproduce la clase `Glm4MoeLiteForCausalLM` del modelo zai-org/GLM-4.7-Flash (revision `7dd20894a642a0aa287e9827cb1a1f7f91386b67`), pero con dimensiones reducidas: 47 capas, `hidden_size` de 768, 8 expertos enrutados con 4 activos por token y atencion con proyecciones latentes (`q_lora_rank` 512, `kv_lora_rank` 256). El checkpoint contiene 821.339.512 parametros segun los metadatos de safetensors, de los cuales unos 645 millones se consideran activos en el backbone, e incorpora una capa MTP (multi-token prediction) sintetica de 13,3 millones de parametros.

Su relevancia es puramente instrumental: sirve como fixture de tamano reducido para comprobar carga en dos GPU, cuantizacion FP8_DYNAMIC, guardado fragmentado en safetensors y generacion con vLLM, todo ello con una licencia MIT y un peso en disco de aproximadamente 1,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (clase `Glm4MoeLiteForCausalLM`), con proyecciones latentes tipo MLA y una capa MTP (multi-token prediction) |
| Parametros totales | 821.339.512 segun safetensors; 821.339.136 segun la model card (808.008.192 de backbone + 13.330.944 de MTP) |
| Parametros activos | 645.216.768 estimados en el backbone (incluye embeddings y componentes densos, excluye MTP; no es una medicion de FLOPs) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8_DYNAMIC mediante compressed-tensors, con exclusiones conservadas en su dtype de origen; tambien se han validado los pesos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (3 fragmentos indexados, 3.317 tensores indexados); se incluyen los assets del tokenizer |

Configuracion comparada (original frente a la version reducida de este fixture):

| Campo | Original | Tiny |
|---|---|---|
| `num_hidden_layers` | 47 | 47 |
| `hidden_size` | 2048 | 768 |
| `intermediate_size` | 10240 | 3072 |
| `moe_intermediate_size` | 1536 | 384 |
| `n_routed_experts` | 64 | 8 |
| `num_experts_per_tok` | 4 | 4 |
| `num_attention_heads` | 20 | 8 |
| `num_key_value_heads` | 20 | 8 |
| `q_lora_rank` | 768 | 512 |
| `kv_lora_rank` | 512 | 256 |
| `num_mtp_layers` | no establecido explicitamente | 1 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos (MoE) y proyecciones latentes para consultas y claves/valores, tal como define la clase `Glm4MoeLiteForCausalLM`. La profundidad del backbone original (47 capas) se mantiene para que el indexado del checkpoint MTP coincida con el upstream, mientras que el resto de dimensiones se reducen drasticamente: ancho de 768, expertos con `moe_intermediate_size` de 384, 8 expertos enrutados con 4 activos por token y 8 cabezas de atencion (8 cabezas KV). La capa MTP es una unica capa cuyas proyecciones son inicializaciones sinteticas, con los pesos del decodificador copiados de bloques del backbone ya entrenado.

El entrenamiento partio de pesos aleatorios, sin modelo base preentrenado, con semilla 3225, optimizador AdamW, tasa de aprendizaje 0,0004, weight decay 0,01, tamano de lote 2 y textos truncados a 160 tokens. El proceso se detuvo tras tres comprobaciones consecutivas con perplejidad de juguete igual o inferior a 3 sobre el mismo corpus empleado para entrenar. No hubo fases de RLHF ni DPO, y la capa MTP no se entreno por separado, por lo que no se puede atribuir a este artefacto ninguna capacidad real de decodificacion especulativa. Como referencia de integridad, el backbone BF16 recargado alcanza una perplejidad de 1,534234 en ese corpus de juguete, cifra que mide la correccion del guardado y la recarga, no la generalizacion.

## Capacidades

- Generacion de texto autorregresiva a nivel de ejecucion: el pipeline de transformers carga el backbone y produce tokens con `generate`.
- Carga y ejecucion del backbone con transformers, usando compressed-tensors para interpretar los pesos FP8_DYNAMIC.
- Ejecucion de la ruta MTP de forma opcional (opt-in); la generacion estandar del backbone no la ejecuta.
- Inferencia en vLLM: se valido la generacion con vLLM 0.30.0 como comprobacion de humo.
- Cuantizacion FP8_DYNAMIC: sirve como caso de prueba reproducible para el flujo de LLM Compressor PR #3225.
- Guardado fragmentado en safetensors con indexado de tensores.
- No se documentan capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, agentes ni multilingues. Al tratarse de un modelo entrenado sobre un corpus de juguete con backbone inicializado al azar, no cabe esperar ninguna de ellas.

## Casos de uso

- Validacion de la ruta FP8_DYNAMIC en LLM Compressor: se usa como fixture para comprobar que el pipeline de cuantizacion dinamica produce un checkpoint cargable y ejecutable, comparando la salida greedy con la generacion FP8 ordinaria.
- Prueba de integracion de vLLM: permite verificar en un entorno controlado que vLLM 0.30.0 arranca, carga los tres fragmentos safetensors y sirve peticiones de generacion sin agotar memoria.
- Test de regresion en CI: al ocupar solo 1,1 GB en disco y requerir poca memoria, se puede incorporar a pipelines de integracion continua que comprueben que los cambios en transformers o compressed-tensors no rompen la carga del modelo.
- Verificacion del pipeline de guardado fragmentado: sirve para validar el manifiesto de artefactos (`artifact-manifest.json`) y el hash de los ficheros de checkpoint tras un guardado fragmentado.
- Prueba de indexado de checkpoints MTP: al conservar las 47 capas del backbone original y una capa MTP, permite comprobar que el indexado de tensores coincide con el esquema del upstream GLM-4.7-Flash.
- Banco de pruebas de cuantizacion con exclusiones: dado que las capas excluidas se conservan en su dtype original, es util para verificar que el selector de exclusiones de compressed-tensors se aplica correctamente.
- Prueba de compatibilidad de versiones de transformers: la model card documenta que la carga MTP de modelos GLM/DeepSeek falla en transformers 5.15.0 y funciona en 5.17.0, por lo que el artefacto sirve para acotar ese rango de compatibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico de calidad reportado es la perplejidad de juguete del backbone BF16 recargado, 1,534234, medida sobre el mismo corpus pequeno usado en el entrenamiento, que no constituye una evaluacion de generalizacion.

En cuanto a la ruta MTP, la model card indica que la ejecucion FP8 drafts 58 tokens y acepta 3, pero aclara explicitamente que son comprobaciones de ejecucion y no una medicion de aceleracion.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP8, los pesos ocupan aproximadamente 0,82 GB; en BF16, aproximadamente 1,64 GB. Cualquier GPU con 4 GB o mas de memoria libre deberia bastar para el backbone.
- La validacion descrita en la model card se realizo con carga en dos GPU, junto con la cuantizacion FP8_DYNAMIC y el guardado fragmentado. La model card no especifica que GPU concretas se emplearon.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna (serie RTX 30/40, e incluso integradas con memoria compartida suficiente) puede alojar los pesos.
- Memoria de cache KV: no disponible. No se han publicado mediciones de contexto util, longitud soportada ni consumo por token.
- Opciones de despliegue: vLLM 0.30.0 (probado) y transformers con compressed-tensors para FP8. No se han publicado pesos GGUF, por lo que llama.cpp y Ollama no estan soportados por el momento. TGI no aparece mencionado en la informacion disponible.
- Entorno probado: transformers 5.17.0, Torch 2.14.0+cu130, LLM Compressor commit `2d52420` y compressed-tensors commit `e69c8dc`. La carga MTP de modelos GLM/DeepSeek fallo en transformers 5.15.0; la 5.16 no se probo.
- Latencia y throughput: no disponibles. La model card no reporta medidas de velocidad y advierte que el conteo de tokens aceptados por MTP no equivale a una ganancia de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4.7-Flash-0.82B-MTP-PR3225-FP8-Dynamic (este modelo) | 821.339.512 totales; 645.216.768 activos estimados | no disponible | Perplejidad de juguete 1,534234 en el corpus de entrenamiento; sin benchmarks | MIT | HuggingFace, 3 fragmentos safetensors FP8_DYNAMIC |
| inference-optimization/GLM-4.7-Flash-0.82B-MTP-PR3225 (modelo base) | mismos parametros (821.339.136 segun la model card) | no disponible | mismos resultados de juguete, sin cuantizar | MIT | HuggingFace, pesos en BF16 |
| zai-org/GLM-4.7-Flash (arquitectura y tokenizer de origen) | no disponible | no disponible | no disponible | no disponible | HuggingFace, revision `7dd20894a642a0aa287e9827cb1a1f7f91386b67` |

No se dispone de datos comparativos de rendimiento frente a alternativas reales de la misma categoria, porque el modelo no es un modelo de lenguaje funcional y no se han publicado evaluaciones estandar.

## Limitaciones y advertencias

- No es un modelo de produccion. La model card lo describe explicitamente como un fixture de prueba de arquitectura y checkpoint. Su backbone se inicializo de forma aleatoria y solo se entreno sobre un corpus de texto de juguete.
- La salida del modelo carece de valor semantico fuera del corpus de entrenamiento. No debe usarse para generar contenido destinado a personas.
- La capa MTP no se entreno de forma separada: sus proyecciones son inicializaciones sinteticas y los pesos del decodificador se copiaron del backbone. No hay evidencia de calidad de aceptacion de drafts ni de aceleracion de inferencia.
- El dato de 58 tokens draft y 3 aceptados es una comprobacion de ejecucion, no una medicion de rendimiento, y no debe citarse como ganancia de velocidad.
- La perplejidad de 1,534234 procede del mismo corpus usado para entrenar y no mide generalizacion.
- No se han publicado datos de sesgos, idiomas soportados, longitud de contexto ni comportamiento multilingue.
- Sensibilidad a la version de librerias: la carga MTP falla en transformers 5.15.0 y la 5.16 no se probo; el entorno validado es 5.17.0.
- La cuantizacion MTP dependiente de calibracion queda pendiente como trabajo futuro segun la model card.
- Licencia MIT para este repositorio, pero la procedencia de la arquitectura y el tokenizer corresponde a zai-org/GLM-4.7-Flash, cuya licencia no se detalla en la informacion disponible. Conviene verificar ese extremo antes de cualquier uso derivado.
- Los resultados de la busqueda web realizada no aportan informacion tecnica sobre este modelo: solo devuelven definiciones genericas del termino "inferencia" en diccionarios y enciclopedias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/GLM-4.7-Flash-0.82B-MTP-PR3225-FP8-Dynamic
- Modelo base (BF16): https://huggingface.co/inference-optimization/GLM-4.7-Flash-0.82B-MTP-PR3225
- Arquitectura y tokenizer de origen: https://huggingface.co/zai-org/GLM-4.7-Flash
- Revision concreta del modelo de origen: https://huggingface.co/zai-org/GLM-4.7-Flash/tree/7dd20894a642a0aa287e9827cb1a1f7f91386b67
- Pull request de LLM Compressor numero 3225: https://github.com/vllm-project/llm-compressor/pull/3225
- Commit de LLM Compressor utilizado: https://github.com/vllm-project/llm-compressor/commit/2d5242056a8a00028686a303771ffc8e2fe27d07
- Commit de compressed-tensors utilizado: https://github.com/vllm-project/compressed-tensors/commit/e69c8dc58aa152e5f5e36e85800ec1d2e7de5271
- Flujo de trabajo tiny-model del repositorio: https://github.com/vllm-project/llm-compressor/tree/2d5242056a8a00028686a303771ffc8e2fe27d07/.agents/skills/create-tiny-model
