# msuiche/DeepSeek-V4.1-Flash-NVFP4

## Resumen

DeepSeek-V4.1-Flash-NVFP4 es un artefacto comunitario de cuantizacion publicado por el usuario msuiche sobre el checkpoint `deepseek-ai/DeepSeek-V4.1-Flash` (revision `fb2764a5cf32`). No es un modelo nuevo ni un entrenamiento: es una conversion de pesos a formato NVFP4 en modo weight-only (solo pesos, sin calibracion de activaciones) realizada con NVIDIA Model Optimizer 0.46.1. El autor lo declara explicitamente como no oficial y sin vinculacion con DeepSeek ni NVIDIA.

El objetivo es reducir el peso en disco y en memoria de un modelo de gran tamano: pasa de 510 GB (FP8/MXFP4) a 415 GB, un 19% menos. La conversion afecta a proyecciones de atencion, expertos compartidos, tablas hash del mecanismo "engram", proyecciones engram y la parte densa del drafter MTP. Los expertos enrutados ya estaban en MXFP4 de 4 bits en el checkpoint origen y se copian byte a byte; embeddings, `lm_head`, torre de vision, normalizaciones y routers permanecen en BF16/F32.

La relevancia de esta ficha es doble. Por un lado, documenta el primer cuantizado NVFP4 de este checkpoint. Por otro, advierte de una limitacion critica: a fecha de 10 de septiembre de 2026 no existe ningun runtime capaz de ejecutar el modelo. El soporte de DeepSeek-V4.1 en vLLM son PRs abiertos y sin fusionar, `transformers` no incluye la arquitectura `deepseek_v41` y SGLang no tiene fichero de modelo. El artefacto se publica por delante del soporte de ejecucion y no se ha ejecutado de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) segun los nombres de tensores del checkpoint: expertos enrutados (`*.ffn.experts.*`), expertos compartidos (`*.ffn.shared_experts.*`), mecanismo "engram" (tablas hash en capas 1 y 14), drafter MTP y torre de vision. Detalle completo de la arquitectura base: no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (es MoE, pero el model card no indica el reparto) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4 (dos valores E2M1 por byte, nibble bajo primero) con escalas de bloque E4M3 por cada 16 elementos y escala global FP32, sin `input_scale` (solo pesos, activaciones dinamicas). Expertos enrutados: MXFP4 original sin cambios. Embeddings, `lm_head`, torre de vision, normalizaciones, routers y parametros de hiperconexion: BF16/F32 sin cambios |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo origen) |
| Formato de pesos | safetensors (checkpoint de 48 shards; el model card cita `model-00047-of-00048.safetensors` y `model-00048-of-00048.safetensors`) |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es una cuantizacion post-entrenamiento (PTQ) de solo pesos. El detalle de la arquitectura base (numero de capas, dimension oculta, numero de expertos enrutados y activos por token, atencion utilizada) no esta disponible en la informacion proporcionada. Lo que si se deduce del inventario de tensores es que se trata de un modelo MoE con expertos enrutados y compartidos, un componente denominado "engram" implementado como tablas hash en las capas 1 y 14 mas proyecciones `wkv`, un modulo MTP/drafter probablemente orientado a decodificacion especulativa, y una torre de vision en BF16/F32 que sugiere capacidades multimodales en el modelo original.

El proceso de conversion se hizo con NVIDIA Model Optimizer 0.46.1 mediante un conversor en streaming shard a shard, sin instanciar el modelo y sin usar activaciones. La escala global por tensor se eligio con un barrido MSE sobre multiplicadores {0,8; 0,9; 1,0; 1,1; 1,25} alrededor del valor por defecto `amax/(448*6)`. El autor justifica la ausencia de calibracion con activaciones por la inexistencia de un runtime capaz de ejecutar el modelo. El layout de los tensores convertidos replica exactamente el de `nvidia/DeepSeek-V4-Pro-0813-NVFP4`: `X.weight` (U8), `X.weight_scale` (F8_E4M3 por 16) y `X.weight_scale_2` (escalar F32). El `quantization_config` conserva los campos `fp8`, `ue8m0` y `expert_dtype: fp4` del origen, y anade `quant_algo: MIXED_PRECISION` mas un mapa `quantized_layers`.

Como validacion, el autor publica error L2 relativo por clase de tensor frente a los pesos FP8 de origen: 9,4% en proyecciones de atencion (n=200), expertos compartidos (n=120) e indice de atencion `wq_b` (n=8); 9,4% en tablas hash engram (n=2); 9,5% en `engram.wkv` (n=2); 9,4% en denso MTP/drafter (n=25). Para las tablas engram, el componente mas grande convertido (203 GB FP8 a 111 GB), una simulacion de propagacion de error a traves de la puerta engram real da una similitud coseno de salida superior a 0,9999 y un error ponderado por contribucion inferior al 1% para RMS de estado oculto mayor o igual a 10 (0,7% con RMS 10 y 0,07% con RMS 100); con RMS cercano a 1 el error de salida llega a aproximadamente un 5%.

## Capacidades

- No hay ninguna capacidad verificada experimentalmente en este repositorio, porque el modelo no se ha ejecutado de extremo a extremo.
- Por herencia del modelo base se le presuponen generacion de texto, razonamiento y codigo, pero el model card no aporta evaluaciones que lo confirmen.
- La presencia de una torre de vision en BF16/F32 sin cuantizar apunta a capacidades multimodales en el modelo original (vision), no confirmadas en esta informacion.
- El modulo MTP/drafter sugiere soporte para decodificacion especulativa en el modelo base; el cuantizado conserva ese drafter en NVFP4 de forma coherente con el modelo principal.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion en cuantizacion de precision ultra-baja: el artefacto sirve como caso de estudio reproducible de PTQ weight-only a NVFP4 con Model Optimizer 0.46.1, incluido el barrido MSE de escalas globales y la comparacion de error por clase de tensor.
- Base para integracion en vLLM cuando aterrice el soporte de DeepSeek-V4.1: el layout NVFP4 es identico al de `nvidia/DeepSeek-V4-Pro-0813-NVFP4`, de modo que el trabajo de carga de tensores es directamente reutilizable en la rama `dsv41` de vLLM.
- Despliegue en rigs de 4 a 8 nodos una vez exista loader: con 415 GB de pesos, el escenario realista es un cluster multi-nodo con GPUs de 80 GB o superior, no una maquina individual.
- Evaluacion del impacto de cuantizar tablas de embedding gigantes: el caso de las tablas engram (203 GB a 111 GB) es un ejemplo poco habitual de cuantizar un componente de memoria masiva y medir la propagacion de error a traves de su puerta.
- Comparacion de estrategias de escala (amax frente a barrido MSE): el barrido publicado sobre multiplicadores permite reproducir el estudio y trasladarlo a otros checkpoints MoE.
- Alternativa FP8-engram para entornos sensibles a calidad: el propio autor documenta como reconstruir una variante manteniendo las tablas engram en FP8 descargando los shards 47 y 48 del repositorio origen y eliminando las entradas `layers.1.engram` y `layers.14.engram` del `quantized_layers`.
- Validacion de pipelines de conversion en streaming sin GPU: la conversion se hizo en un contenedor de CPU de 16 nucleos, lo que sirve como referencia de coste para cuantizar checkpoints de mas de 500 GB sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card unicamente incluye medidas de error de cuantizacion frente a los pesos FP8 de origen, que se reproducen a continuacion:

| Clase de tensor | Error L2 relativo | Numero de tensores |
|---|---|---|
| Denso MTP/drafter | 9,4% | 25 |
| Indice de atencion `wq_b` | 9,4% | 8 |
| Proyecciones de atencion | 9,4% | 200 |
| Tablas hash engram | 9,4% | 2 |
| `engram.wkv` | 9,5% | 2 |
| Expertos compartidos | 9,4% | 120 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion de calidad downstream, ni cifras de latencia o throughput.

## Requisitos de hardware

- Peso del checkpoint cuantizado: 415 GB en disco y en memoria, frente a los 510 GB del origen (19% de reduccion). El repositorio de HuggingFace reporta un tamano de 112,1 GB, dato que no cuadra con la cifra del model card y que probablemente corresponde a una carga parcial.
- VRAM estimada para inferencia: no disponible de forma oficial; como minimo hay que sumar los 415 GB de pesos mas cache KV y activaciones, lo que en la practica exige varios nodos.
- GPU recomendadas: el autor indica que el artefacto esta pensado para rigs de 4 a 8 nodos y para nube una vez exista un loader. No se detallan modelos concretos de GPU.
- GPU de consumo: no cabe. Con 415 GB de pesos, ni una RTX 4090 (24 GB) ni ninguna GPU de consumo actual puede alojarlo.
- Opciones de despliegue: ninguna operativa a fecha de 10 de septiembre de 2026. vLLM depende de PRs abiertos y sin fusionar (por ejemplo #56228; #56201 se cerro sin fusionar), `transformers` no incluye `deepseek_v41` ni en 5.17.0 ni en `main`, y SGLang no tiene fichero de modelo. El checkpoint origen incluye un runtime nativo `inference/`, pero lee el formato FP8/MXFP4 original, no los tensores densos NVFP4 de este repositorio.
- Latencia y throughput estimados: no disponible. El modelo no se ha ejecutado, por lo que no hay medidas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Precision de pesos | Tamano | Contexto | Licencia | Estado de ejecucion |
|---|---|---|---|---|---|---|
| msuiche/DeepSeek-V4.1-Flash-NVFP4 | no disponible | NVFP4 W4 + MXFP4 en expertos enrutados + BF16/F32 en embeddings y vision | 415 GB | no disponible | MIT | Sin runtime; no ejecutado |
| deepseek-ai/DeepSeek-V4.1-Flash (origen, revision `fb2764a5cf32`) | no disponible | FP8 E4M3 + MXFP4 + BF16/F32 | 510 GB | no disponible | MIT | Runtime nativo `inference/` incluido en el checkpoint |
| nvidia/DeepSeek-V4-Pro-0813-NVFP4 | no disponible (modelo diferente, "Pro" en lugar de "Flash") | NVFP4 con el mismo layout de tensores | no disponible | no disponible | no disponible | Referencia usada para verificar el layout bit a bit |

No se dispone de alternativas comparables fuera del ecosistema DeepSeek-V4 en la informacion proporcionada.

## Limitaciones y advertencias

- No existe runtime capaz de cargar el modelo a fecha de publicacion. El propio autor lo advierte antes de la descarga; el artefacto esta publicado por delante del soporte de ejecucion.
- El modelo no se ha ejecutado de extremo a extremo ni una sola vez. La unica validacion son las medidas de error por tensor y la verificacion bit a bit del layout.
- La cuantizacion es weight-only y sin calibracion de activaciones, precisamente porque no habia runtime con el que generarlas. Esto puede degradar mas la calidad de lo que sugieren los errores por tensor.
- Las tablas engram son el componente de mayor riesgo: son el mayor bloque convertido (203 GB a 111 GB) y, aunque la simulacion da error de salida por debajo del 1% con RMS de estado oculto mayor o igual a 10, con RMS cercano a 1 el error llega a aproximadamente el 5%. El RMS real de las capas 1 y 14 es desconocido sin runtime.
- El autor ofrece una via de escape (reconstruir una variante FP8-engram) si las tablas resultan ser criticas para la calidad.
- Es un artefacto no oficial: no esta afiliado ni validado por DeepSeek ni por NVIDIA.
- Licencia MIT heredada del modelo origen. Antes de un uso comercial conviene verificar que la licencia del checkpoint base realmente permite ese uso, ya que la herencia se afirma pero no se documenta en detalle.
- No hay datos de idiomas soportados, contexto, sesgos ni alucinacion. No se puede evaluar ninguno de esos aspectos con la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (10 de septiembre de 2026), lo que indica ausencia total de validacion por parte de terceros.
- La discrepancia entre los 112,1 GB que reporta HuggingFace y los 415 GB que declara el model card debe resolverse antes de planificar cualquier despliegue.
- La busqueda web no ha devuelto ningun resultado relevante sobre este modelo: los resultados obtenidos corresponden a dominios bancarios sin relacion con el artefacto.

## Enlaces

- Repositorio HuggingFace del cuantizado: https://huggingface.co/msuiche/DeepSeek-V4.1-Flash-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Arbol del checkpoint origen en la revision `fb2764a5cf32`: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/tree/fb2764a5cf32
- Referencia de layout NVFP4: https://huggingface.co/nvidia/DeepSeek-V4-Pro-0813-NVFP4
- PR de soporte de DeepSeek-V4.1 en vLLM mencionado en el model card: #56228 (abierto, sin fusionar) y #56201 (cerrado sin fusionar) en el repositorio de vLLM. No se proporciona URL directa en la informacion disponible.
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web.
