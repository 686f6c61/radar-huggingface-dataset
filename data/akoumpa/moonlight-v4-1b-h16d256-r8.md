# akoumpa/Moonlight-V4-1B-h16d256-r8

## Resumen

Moonlight-V4-1B-h16d256-r8 es una **configuracion de arquitectura sin pesos** (etiquetada como `untrained`, `from-scratch`, `architecture-config`) publicada por el usuario akoumpa en Hugging Face. No se trata de un modelo entrenado: el repositorio contiene unicamente ficheros de configuracion (`config.json`, `inference_config.json`), el tokenizer de DeepSeek-V4 y scripts auxiliares de conteo de parametros y de pre-entrenamiento. Su proposito es servir como punto de partida reproducible para pre-entrenar un modelo estilo DeepSeek-V4 a escala reducida.

La configuracion describe un transformer hibrido de tipo MoE con 977.183.967 parametros totales (712,4 M no de embedding) y 517,1 M activados por token (252,4 M activados no de embedding). La atencion combina tres regimenes: 2 capas de ventana deslizante pura, 7 capas de atencion comprimida a ratio 8 y 6 capas de atencion fuertemente comprimida (HCA) a ratio 128, todas con MQA de KV compartida (1 cabeza KV, 16 cabezas de consulta de dimension 256). El tamano esta calibrado para pre-entrenar en dos GPU de 48 GB, y las dimensiones de atencion se eligieron para que el kernel TileLang de atencion dispersa quepa en GPU con 99 KB de memoria compartida (clase Ada / consumo).

Su relevancia es metodologica mas que practica: explora como escalar hacia abajo la arquitectura DeepSeek-V4 (Flash: 284B/13B; Pro: 1,6T/49B) manteniendo reglas de diseno ligadas a los kernels, y ofrece una variante hermana (`akoumpa/Moonlight-V4-1B-h16d256`) que conserva las capas CSA de ratio 4 con lightning indexer y si es cargable por transformers. La variante de este repositorio sustituye el indexer por atencion a todas las entradas comprimidas causales, lo que elimina la seleccion top-k.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido tipo DeepSeek-V4: MoE en todas las capas + atencion con ratios de compresion variables (sliding window, comprimida ratio 8, HCA ratio 128), hyper-connections con restriccion de variedad (mHC) |
| Parametros totales | 977.183.967 (977,2 M); 712,4 M no de embedding |
| Parametros activos | 517,1 M por token; 252,4 M activados no de embedding (MoE con top-6 sobre 32 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 4096 tokens (RoPE simple, sin YaRN) |
| Tipos de cuantizacion | no disponible (no se publican pesos; la cache KV usa FP8 en dimensiones no-RoPE y bf16 en las dimensiones RoPE) |
| Idiomas soportados | no disponible (se incluye el tokenizer de DeepSeek-V4, 129.280 entradas, BOS 0, EOS 1, sin evaluacion multilingue publicada) |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos: solo `config.json`, `inference_config.json`, `tokenizer.json`, `tokenizer_config.json`, `count_params.py` y recetas de entrenamiento) |

## Arquitectura y entrenamiento

El modelo define 15 capas con `hidden_size` 1024 y un plan de atencion `compress_ratios` de `[0, 0, 8, 128, 8, 128, 8, 128, 8, 128, 8, 128, 8, 128, 8]`: dos capas de ventana deslizante, siete capas de atencion comprimida a ratio 8 y seis capas HCA a ratio 128. La atencion es MQA con KV compartida (`num_key_value_heads` = 1): 16 cabezas de consulta de `head_dim` 256, de las cuales las ultimas 64 dimensiones llevan RoPE, y la misma entrada de 256 dimensiones se usa como clave y como valor. La ruta de consulta proyecta mediante `q_lora_rank` 256 hacia 16 x 256, con RMSNorm por cabeza antes de RoPE; la proyeccion de salida es de rango bajo agrupada (`o_groups` 2, 8 cabezas por grupo, `o_lora_rank` 1024). Cada capa aplica ventana deslizante de 128 tokens y un logit de sumidero de atencion aprendible por cabeza. En las capas de ratio 8 no hay lightning indexer: cada consulta atiende a todas las entradas comprimidas causales, de modo que no se necesita seleccion top-k. El sesgo de RoPE es 10.000 en capas deslizantes y 160.000 en capas comprimidas.

La mezcla de expertos se repite en todas las capas: 32 expertos enrutados de 384 unidades con SwiGLU y clamp 10,0, top-6, mas un experto compartido, con puntuacion `sqrtsoftplus`, sesgo sin perdida auxiliar (`noaux_tc`) y `routed_scaling_factor` 2,436. La primera capa MoE enruta por una tabla fija de identificadores de token (`tid2eid`). El flujo residual usa hyper-connections con restriccion de variedad (`hc_mult` 4, 20 iteraciones de Sinkhorn). No hay prediccion multi-token (`num_nextn_predict_layers` 0). Los recuentos por capa son: atencion 7,9 M (deslizante) / 8,4 M (ratio 8) / 8,4 M (HCA); MoE 39,0 M en total y 8,3 M activados (1,2 M por experto); mezcladores mHC 196.662; embedding y cabeza 132,4 M cada uno. La cache KV por secuencia a 4K es de 1,7 MiB y a 32K de 9,8 MiB. Los FLOPs de atencion por token generado a 4K son 0,09 GF, frente a 0,77 GF de las capas lineales.

No se ha entrenado nada: el repositorio no documenta tokens de entrenamiento, composicion del dataset, RLHF ni DPO. Si se incluye una receta de pre-entrenamiento con NeMo Automodel (FSDP2 sobre 2 GPU) en `training/pretrain.yaml` y `training/train.py`, con utilidades de preparacion de datos desde parquet (`training/prepare_data.py`), dataset de validacion acotado y inicializadores desde cero (`training/finite_nanogpt.py`, `training/init_utils.py`). La carga en transformers nativo falla: `DeepseekV4Config` solo mapea ratios 0, 4 y 128 y lanza `KeyError: 8` con esta configuracion; hay que usar la `DeepseekV4Config` de NeMo Automodel o el `inference/model.py` de referencia de DeepSeek mediante `inference_config.json`. `AutoTokenizer` tambien falla porque parsea primero `config.json`, por lo que el tokenizer debe cargarse directamente.

## Capacidades

- No existen capacidades funcionales verificables: el repositorio no contiene pesos entrenados, por lo que el modelo no genera texto, no razona y no ejecuta codigo en su estado actual.
- La configuracion esta disenada para soportar generacion de texto autoregresiva una vez entrenada, con vocabulario de 129.280 entradas del tokenizer de DeepSeek-V4.
- Soporte estructural de atencion dispersa jerarquizada: ventana deslizante, compresion a ratio 8 sin indexer y compresion agresiva a ratio 128, lo que reduce el coste de atencion (0,09 GF por token a 4K frente a 0,77 GF de las capas lineales).
- MoE con enrutamiento aprendido (top-6 de 32 expertos) mas una capa inicial enrutada por tabla fija de token, orientado a estudiar especializacion de expertos.
- Cache KV muy reducida por diseno (1,7 MiB por secuencia a 4K), adecuada para experimentos de eficiencia de memoria.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponible; no hay evaluacion ni declaracion de idiomas.

## Casos de uso

- Pre-entrenamiento a escala pequena: la configuracion esta dimensionada para dos GPU de 48 GB con FSDP2, de modo que un equipo con dos A6000, L40S o A100 de 48 GB puede entrenar desde cero sin infraestructura de cluster.
- Ablacion de atencion comprimida: comparar esta variante (ratio 8 sin indexer, atencion a todas las entradas comprimidas) contra el repositorio hermano `Moonlight-V4-1B-h16d256` (ratio 4 con lightning indexer) permite medir el coste en calidad de eliminar la seleccion top-k.
- Validacion de kernels TileLang: las dimensiones se eligieron para que el kernel de atencion dispersa quepa en 99 KB de memoria compartida, por lo que sirve para probar y depurar kernels en GPU de clase Ada antes de escalar a configuraciones mayores.
- Estudios de cache KV y memoria: la cache de 1,7 MiB a 4K y 9,8 MiB a 32K con FP8 en dimensiones no-RoPE permite investigar politicas de cuantizacion de cache en contextos largos relativos.
- Analisis de hyper-connections y Sinkhorn: los mezcladores mHC con `hc_mult` 4 y 20 iteraciones de Sinkhorn son un objeto de estudio aislable, reproducible con `count_params.py` y los inicializadores incluidos.
- Reproduccion de reglas de diseno ligadas a kernels: `head_dim` y `index_topk` potencias de dos y `index_n_heads` divisor de 128 ilustran como las restricciones de hardware condicionan la eleccion de hiperparametros.
- Ensenanza y experimentacion en cursos: al no requerir pesos ni descargas, sirve como ejemplo didactico de configuracion DeepSeek-V3/V4 y de conteo de parametros, FLOPs y cache KV.
- Base para pipelines de investigacion en enrutamiento MoE: la primera capa con enrutamiento por tabla fija `tid2eid` facilita experimentos controlados sobre hash routing frente a enrutamiento aprendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene pesos entrenados ni evaluaciones (0 descargas y 0 likes en el momento de la consulta). Los unicos datos cuantitativos publicados son de eficiencia teorica:

| Metrica | Valor |
|---|---|
| Parametros totales | 977.183.967 |
| Parametros activados por token | 517.100.000 (aprox.) |
| FLOPs de atencion por token a 4K | 0,09 GF |
| FLOPs de capas lineales por token | 0,77 GF |
| Cache KV por secuencia a 4K / 32K | 1,7 MiB / 9,8 MiB |
| Tamano de vocabulario | 129.280 |

## Requisitos de hardware

- No es posible ejecutar inferencia: no hay pesos publicados. Las cifras siguientes son estimaciones derivadas del recuento de parametros y aplicarian solo a un checkpoint hipotetico ya entrenado.
- VRAM estimada para pesos: unos 1,95 GB en bf16, unos 0,98 GB en FP8 y unos 0,5 GB en 4 bits, a los que hay que sumar la cache KV (1,7 MiB por secuencia a 4K) y los estados de activacion.
- Aunque hay 977,2 M de parametros totales, solo 517,1 M se activan por token; en despliegues con offloading de expertos estilo llama.cpp la lectura efectiva por token seria la de los expertos activados.
- GPU recomendadas para entrenamiento: dos GPU de 48 GB (A6000, L40S, A100 48 GB) segun la receta FSDP2 de NeMo Automodel.
- Cabe en GPU de consumo para inferencia teorica: una RTX 4090 (24 GB) o incluso una RTX 3060 de 12 GB en cuantizacion de 4 bits, siempre que el soporte de kernels exista.
- Los kernels TileLang de atencion dispersa asumen 99 KB de memoria compartida, lo que apunta a GPU de clase Ada (serie RTX 40) o superior.
- Opciones de despliegue: NeMo Automodel con su `DeepseekV4Config`, o el `inference/model.py` de referencia de DeepSeek cargando `inference_config.json`. vLLM, TGI, llama.cpp, Ollama y el `DeepseekV4Config` nativo de transformers no soportan esta configuracion (transformers lanza `KeyError: 8` por el ratio 8).
- Latencia y throughput: no disponible (no hay pesos ni ejecuciones publicadas).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Estado | Licencia |
|---|---|---|---|---|---|
| Moonlight-V4-1B-h16d256-r8 (este repo) | DeepSeek-V4 reducido, 16 cabezas x 256, ratio 8 sin indexer | 977,2 M / 517,1 M activos | 4096 | Configuracion, sin pesos | MIT |
| akoumpa/Moonlight-V4-1B-h16d256 (hermano) | DeepSeek-V4 con CSA ratio 4 y lightning indexer | 1,0 B / 0,54 B activos | 4096 | Configuracion, carga en transformers | MIT |
| Moonlight-V4-16B-A3B | DeepSeek-V4 a la anchura/profundidad de Moonlight | 16,5 B / 3,0 B activos | no disponible | Configuracion propuesta | no disponible |
| moonshotai/Moonlight-16B-A3B | DeepSeek-V3, entrenado con Muon | 16 B / 3 B activos | no disponible | Publicado y entrenado | no disponible |
| deepseek-ai/DeepSeek-V4-Flash | DeepSeek-V4 (`head_dim` 512, 64 o 128 cabezas de consulta) | 284 B / 13 B activos | no disponible | Publicado | no disponible |
| deepseek-ai/DeepSeek-V4-Pro | DeepSeek-V4 | 1,6 T / 49 B activos | no disponible | Publicado | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: es una configuracion de arquitectura sin entrenar, por lo que no puede usarse para inferencia, evaluacion ni produccion tal cual.
- Sesgos conocidos: no disponibles, ya que no existe un modelo entrenado que evaluar.
- Riesgo de alucinacion: no aplicable en el estado actual; aparecera una vez exista un checkpoint entrenado y dependera de sus datos.
- La carga con transformers nativo falla (`KeyError: 8`) porque `DeepseekV4Config` solo reconoce los ratios 0, 4 y 128; tampoco funciona `AutoTokenizer` por el mismo motivo.
- El soporte de kernels esta atado a restricciones de hardware concretas (`head_dim` potencia de dos, 99 KB de memoria compartida), lo que reduce la portabilidad a GPU antiguas o a otros backends.
- La longitud de contexto es de solo 4096 tokens y no se configura YaRN, por lo que no hay extension de contexto prevista.
- No hay evaluacion de idiomas ni lista de idiomas soportados.
- Licencia MIT: permisiva para uso comercial, pero al no haber pesos la licencia solo cubre la configuracion, los scripts y el tokenizer copiado de DeepSeek-V4 (MIT).
- El repositorio no registra descargas ni interacciones (0 descargas, 0 likes), por lo que no hay validacion externa de la configuracion.
- Para produccion seria necesario entrenar el modelo, validar la calidad y verificar el soporte real de los kernels de atencion dispersa en el hardware objetivo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/akoumpa/Moonlight-V4-1B-h16d256-r8
- Repositorio hermano con CSA ratio 4 e indexer (cargable por transformers): https://huggingface.co/akoumpa/Moonlight-V4-1B-h16d256
- Moonlight-16B-A3B (Moonshot): https://huggingface.co/moonshotai/Moonlight-16B-A3B
- DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Paper referenciado (arXiv:2502.16982): https://arxiv.org/abs/2502.16982
- Paper referenciado (arXiv:2606.19348): https://arxiv.org/abs/2606.19348
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a un producto de iluminacion escenica sin relacion.
