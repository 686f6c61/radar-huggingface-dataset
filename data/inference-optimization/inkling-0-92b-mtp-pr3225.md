# inference-optimization/Inkling-0.92B-MTP-PR3225

## Resumen

Inkling-0.92B-MTP-PR3225 es un *checkpoint* de prueba creado por el usuario `inference-optimization` como fixture para la pull request #3225 del proyecto LLM Compressor. No es un modelo de lenguaje de producción: su *backbone* se inicializó de forma aleatoria y se entrenó sobre un corpus de texto de juguete del propio repositorio, sin reutilizar pesos preentrenados de ningún modelo base. El objetivo declarado es validar la arquitectura, el cargador y las rutas de compresión de la clase `InklingForConditionalGeneration`, no ofrecer calidad generativa.

La arquitectura reproduce la topología del modelo multimodal `thinkingmachines/Inkling` (mezcla de expertos con atención deslizante y completa, MLP densos y dispersos y ramas multimodales), pero con la profundidad reducida de 66 a 3 capas para que quepa en un entorno de pruebas. El total de parámetros es de 915.998.485 (0,916B), de los cuales 830.199.043 corresponden al *backbone* y 85.799.426 a las proyecciones MTP (multi-token prediction) sintéticas. Los parámetros activos estimados del *backbone* son 783.013.123.

Su relevancia es puramente instrumental: sirve como caso de prueba reproducible para desarrolladores que trabajan en cuantización, carga de *checkpoints* multimodales o integración con vLLM, y documenta explícitamente qué rutas se validaron y cuáles fallaron. Cualquier uso como modelo conversacional, de código o multimodal carece de sentido con los artefactos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), atencion deslizante y completa, MLP densos y dispersos; clase `InklingForConditionalGeneration` |
| Parametros totales | 915.998.485 (0,916B), incluyendo MTP sintetico; backbone 830.199.043; MTP 85.799.426 |
| Parametros activos | 783.013.123 (estimacion de enrutado del backbone; incluye embeddings y componentes densos, excluye MTP; no es una medida de FLOPs) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en el checkpoint publicado; carga con FP8 mediante compressed-tensors en el entorno probado. MFPTQ y servido cuantizado no validados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4 shards indexados, 109 tensores indexados) |

Configuracion de la topologia (original frente a la reduccion del fixture):

| Campo | Original | Tiny |
|---|---|---|
| `num_hidden_layers` | 66 | 3 |
| `hidden_size` | 6144 | 1536 |
| `intermediate_size` | 3072 | 6144 |
| `moe_intermediate_size` | no definido explicitamente | 1024 |
| `n_routed_experts` | 256 | 16 |
| `num_experts_per_tok` | 6 | 6 |
| `num_attention_heads` | 64 | 16 |
| `num_key_value_heads` | 8 | 8 |
| `num_mtp_layers` | no definido explicitamente | 2 |

## Arquitectura y entrenamiento

El modelo conserva el diseno de Inkling: capas con atencion deslizante y atencion completa combinadas, MLP densos junto a MLP dispersos enrutados por MoE (16 expertos enrutados, 6 activos por token en la version reducida) y las ramas multimodales de la arquitectura original. La clase de Transformers es `InklingForConditionalGeneration` y el tokenizador y el procesador proceden de `thinkingmachines/Inkling`, revision `828496eeae4c243ff1a22f7f28ff83694f2f7bc9`. Ademas del *backbone* se anaden 2 capas MTP con proyecciones inicializadas de forma sintetica, cuyos pesos de decodificador se copiaron de bloques ya entrenados del *backbone*.

El entrenamiento es deliberadamente trivial: semilla aleatoria 3225, optimizador AdamW con tasa de aprendizaje 0,0004 y *weight decay* 0,01, tamano de lote 2 y texto truncado a 160 tokens. Se detuvo tras tres comprobaciones consecutivas con perplejidad de juguete menor o igual a 3 sobre el mismo corpus pequeno usado para entrenar. El *backbone* recargado en BF16 obtiene una perplejidad de 1,570810, cifra que solo demuestra integridad de aprendizaje y recarga, no generalizacion. No hubo RLHF, DPO ni ajuste por preferencias. Las MTP no se entrenaron por separado, por lo que no hay evidencia de calidad de aceptacion en decodificacion especulativa ni de aceleracion de inferencia.

## Capacidades

- Generacion de texto sobre el corpus de juguete de entrenamiento, con perplejidad baja en ese dominio concreto.
- Carga y ejecucion del *backbone* multimodal mediante `InklingForConditionalGeneration` con `attn_implementation="eager"`.
- Soporte de la topologia con atencion deslizante y completa y de las capas MoE con enrutado no uniforme.
- Rutas multimodales presentes en la arquitectura, aunque solo se entreno y probo texto; la calidad de imagen y audio no se evaluo.
- Carga opt-in de las proyecciones MTP; la generacion estandar del *backbone* en Transformers no las ejecuta.
- Compatibilidad declarada con *endpoints* (`endpoints_compatible`) por etiquetado del repositorio.
- No hay evidencia de soporte de *tool calling*, agentes, razonamiento multi-paso, capacidades multilingues ni modo de pensamiento: no disponible.

## Casos de uso

- Pruebas de regresion de LLM Compressor: el modelo actua como fixture para verificar que la PR #3225 no rompe la carga ni la compresion de arquitecturas Inkling con enrutado MoE no uniforme.
- Integracion continua de carga de checkpoints multimodales: al pesar unos 1,9 GB en el repositorio, se puede descargar y cargar en cada ejecucion de CI para comprobar que el cargador de `InklingForConditionalGeneration` sigue funcionando.
- Validacion de cuantizacion FP8 con compressed-tensors: el *backbone* carga con el entorno probado, de modo que sirve para comprobar rutas de cuantizacion antes de aplicarlas al modelo completo.
- Pruebas de decodificacion especulativa a nivel de fontaneria: las 2 capas MTP permiten verificar que el codigo que invoca MTP se ejecuta y se enruta correctamente, sin pretender medir aceptacion de *drafts* ni aceleracion real.
- Verificacion de tokenizer y processor de Inkling: el repositorio incluye los activos de tokenizacion y procesamiento, utiles para probar preprocesado de texto en pipelines propios.
- Pruebas de carga en paralelismo de pipeline: se valido la carga en un solo proceso; el caso de dos rangos fallo, por lo que sirve como caso de reproduccion de ese fallo mientras se corrige.
- Smoke test de servido con vLLM: con vLLM 0.30.0 se hicieron comprobaciones de servido, de modo que el modelo puede usarse para detectar regresiones de arranque del servidor en entornos concretos.
- Medida de latencia de infraestructura: al ser un modelo de menos de 1B parametros, permite cronometrar el arranque, la carga y la generacion de un servicio sin que el coste computacional del modelo enmascare el de la plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico reportado es la perplejidad de juguete del *backbone* recargado en BF16, 1,570810, medida sobre el mismo corpus pequeno usado en el entrenamiento; el propio autor indica que demuestra integridad de aprendizaje y recarga, no calidad de generalizacion. No hay cifras de MMLU, HumanEval, GSM8K ni de cualquier otro conjunto estandar, y no existen datos de aceptacion de *drafts* MTP ni de aceleracion de inferencia.

## Requisitos de hardware

- VRAM estimada para los pesos en BF16: aproximadamente 1,83 GB (915.998.485 parametros x 2 bytes). En FP8, aproximadamente 0,92 GB. Son calculos derivados del recuento de parametros, no mediciones publicadas.
- VRAM real de inferencia: no disponible; depende de la longitud de contexto, del tamano de lote y de la implementacion de atencion. Con `attn_implementation="eager"` y contextos cortos el consumo adicional es bajo.
- GPU: cabe sin problema en cualquier GPU de consumo con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060, RTX 4090). Tambien se puede ejecutar en CPU.
- Despliegue: se probo carga con Transformers 5.17.0 y Torch 2.14.0+cu130, junto con LLM Compressor en el commit `2d52420` y compressed-tensors en el commit `e69c8dc`. El servido se comprobo con vLLM 0.30.0.
- Avisos de entorno: la inspeccion con vLLM encontro un error de compatibilidad NumPy/Numba del entorno; la carga en pipeline de dos rangos fallo durante el manejo de tensores meta y MoE fusionado. La carga basada en modelos de MTP de GLM/DeepSeek fallo en Transformers 5.15.0 y la version 5.16 no se probo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay modelos comparables publicados en la informacion disponible. El unico punto de referencia es el propio Inkling original, del que solo se conocen los valores de configuracion, no su rendimiento.

| Modelo | Capas | Hidden size | Expertos enrutados | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|---|---|
| Inkling-0.92B-MTP-PR3225 | 3 | 1536 | 16 | 0,916B | no disponible | apache-2.0 | Fixture de pruebas |
| thinkingmachines/Inkling (original) | 66 | 6144 | 256 | no disponible | no disponible | no disponible (consultar repositorio) | Modelo multimodal de produccion |

## Limitaciones y advertencias

- No es un modelo de produccion: la propia model card lo describe como un fixture de arquitectura y checkpoint y advierte de que no debe usarse como modelo de lenguaje productivo.
- El backbone se inicializo de forma aleatoria y se entreno solo sobre un corpus de juguete; no se uso ningun peso preentrenado. La calidad generativa fuera de ese corpus es impredecible.
- La profundidad se redujo de 66 a 3 capas, por lo que la capacidad del modelo es una fraccion minima de la del Inkling original.
- Solo se entreno y probo texto. Las rutas multimodales siguen presentes en el codigo, pero la calidad de imagen y audio no se evaluo en absoluto.
- Las cabezas MTP son inicializaciones sinteticas y no se entrenaron por separado: no hay base para afirmar calidad de aceptacion de *drafts* ni aceleracion en decodificacion especulativa.
- La perplejidad de 1,570810 es una medida sobre el mismo corpus de entrenamiento y no dice nada sobre generalizacion.
- No hay resultados de benchmarks y no hay informacion sobre idiomas soportados ni sobre sesgos.
- Riesgo de alucinacion: no evaluado; con un modelo entrenado en un corpus minimo, la salida no tiene garantia de veracidad ni de coherencia.
- Limitaciones tecnicas conocidas: fallo de carga en pipeline de dos rangos (manejo de tensores meta y MoE fusionado), error de compatibilidad NumPy/Numba al inspeccionar con vLLM y fallo de carga basada en modelos de MTP de GLM/DeepSeek en Transformers 5.15.0. MFPTQ, servido cuantizado y ejecucion de MTP no estan validados para este fixture.
- Licencia: apache-2.0 permite uso comercial, pero la utilidad practica del modelo es la de un artefacto de pruebas. La procedencia de arquitectura y tokenizador es `thinkingmachines/Inkling`; conviene revisar y respetar la licencia de ese repositorio upstream.
- No se aplico ningun parche al cargador ni a la clase del modelo para hacer pasar las pruebas; cualquier integracion que dependa de esos parches no funcionara aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/Inkling-0.92B-MTP-PR3225
- Arquitectura y tokenizador originales: https://huggingface.co/thinkingmachines/Inkling
- Revision concreta del modelo original: https://huggingface.co/thinkingmachines/Inkling/tree/828496eeae4c243ff1a22f7f28ff83694f2f7bc9
- Pull request de LLM Compressor objeto de las pruebas: https://github.com/vllm-project/llm-compressor/pull/3225
- Commit de LLM Compressor usado en el entorno probado: https://github.com/vllm-project/llm-compressor/commit/2d5242056a8a00028686a303771ffc8e2fe27d07
- Commit de compressed-tensors usado en el entorno probado: https://github.com/vllm-project/compressed-tensors/commit/e69c8dc58aa152e5f5e36e85800ec1d2e7de5271
- Guia de creacion de modelos diminutos del repositorio: https://github.com/vllm-project/llm-compressor/tree/2d5242056a8a00028686a303771ffc8e2fe27d07/.agents/skills/create-tiny-model
- Resultados estructurados de validacion: `validation.json` en el repositorio del modelo
- Manifiesto de artefactos con hashes: `artifact-manifest.json` en el repositorio del modelo

Nota sobre la busqueda web: los resultados obtenidos corresponden a definiciones genericas del termino "inferencia" en diccionarios y enciclopedias en frances y no aportan informacion tecnica relevante sobre este modelo.
