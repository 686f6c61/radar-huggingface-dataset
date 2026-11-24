# jakejharris/jjh-hy4-exl3

## Resumen

Hy4 EXL3 es una obra derivada cuantizada del checkpoint completo Tencent Hy4, publicada por el usuario jakejharris. Se trata de una repackaging del modelo original de Tencent en la que los pesos de los expertos enrutados se convierten a EXL3 `mul1` (3,00 bits por peso) y se anaden copias empaquetadas de los pesos de atencion y expertos compartidos (el "trunk") junto a los originales. El objetivo es reducir el espacio en disco y la huella de memoria para permitir el despliegue del modelo en un anillo de cuatro NVIDIA DGX Spark, algo inviable con los pesos en BF16 (1.539,81 GB).

El modelo base, Tencent Hy4, es un transformer de tipo mezcla de expertos (MoE) con 169.304.156.030 parametros totales segun los safetensors del repositorio. La receta de cuantizacion emplea EXL3 con `mul1`, escalas Hadamard en FP16 con marcador `i32`, y mantiene ciertos componentes en BF16 o FP32 (embeddings, routers, normas, capa densa de entrada, cabecera LM). El pack completo ocupa 346,31 GiB en 251 archivos y la descarga total es de 371,84 GB porque incluye tanto el trunk de origen como las dos variantes empaquetadas.

La relevancia de esta ficha radica en que documenta una receta de cuantizacion agresiva (3,12 bits por peso de media en la configuracion por defecto) sobre un modelo MoE de gran tamano, con mediciones de rendimiento en hardware concreto (cuatro DGX Spark) y una comparacion de fidelidad frente a la referencia BF16 (96,73% de acuerdo top-1 en el conjunto familiar). Es un caso practico de hasta donde se puede comprimir un modelo de 169B sin perder demasiada calidad, aunque con limitaciones claras de licencia y de disponibilidad de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con torre de vision separada; pesos enrutados EXL3 `mul1` |
| Parametros totales | 169.304.156.030 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la receta menciona prefill a 8K, 32K y 64K, pero no se especifica la ventana maxima oficial) |
| Tipos de cuantizacion | EXL3 `mul1` a 3,00 bits por peso en expertos enrutados; trunk en `4b6b` (4 bits con `o_proj` y `kv_a` a 6 bits) o BF16 en la variante lossless; escalas Hadamard FP16; embeddings BF16; cabecera LM a 16 bits (FP32 al cargar); routers y normas BF16; iHC y `e_score_correction_bias` FP32 |
| Idiomas soportados | no disponible |
| Licencia | `tencent-hy-license` (licencia de Tencent, marcada como "other") |
| Formato de pesos | safetensors; el pack incluye el trunk de origen y las dos variantes empaquetadas; torre de vision en carpeta aparte `vit-bf16/` en BF16 |
| Tamano del repo | 374,3 GB (descarga 371,84 GB / 346,31 GiB en disco) |
| Modelo base | tencent/Hy4 (checkpoint `c10c0de5`) |
| Version | 1.0 (primera publicacion de la receta) |

## Arquitectura y entrenamiento

El modelo base Tencent Hy4 es un transformer de mezcla de expertos (MoE) con 169.304.156.030 parametros totales, segun los metadatos de safetensors del repositorio. La receta de cuantizacion de jakejharris no reentrena el modelo: parte del checkpoint `c10c0de5` de Tencent y aplica una conversion de pesos. Los expertos enrutados de las capas 1 a 19 y 77, y de las capas 20 a 76, se convierten a EXL3 `mul1` con 3,00 bits por peso solicitados (`-b 3`). Las escalas Hadamard enrutadas se almacenan en FP16 con un marcador `i32` (`--out_scales always`).

La atencion y los expertos compartidos se empaquetan en `4b6b`: todas las matrices del trunk a 4 bits excepto `o_proj` y `kv_a`, que se mantienen a 6 bits. En la variante "lossless trunk", la atencion y los expertos compartidos permanecen en BF16 (con `sinks` en FP32). Hay excepciones deliberadas: el `down_proj` de los expertos compartidos en las capas 75 y 76 se mantiene en BF16 en todas las configuraciones porque su entrada desborda FP16 con tokens ordinarios. La capa densa de entrada, los embeddings (BF16), la cabecera LM (16 bits, FP32 al cargar), el indexador de tokens (`wq_b` y `wk` en BF16; `k_norm` y `weights_proj` en FP32) y los routers y normas (BF16) conservan precisiones superiores. La torre de vision no forma parte del pack: se distribuye en la carpeta `vit-bf16/` con sus 649 tensores copiados sin cambios en BF16.

La receta incluye un drafter DFly2 en copia EXL3 de 4 bits servido por defecto (pesos de origen en BF16), lo que sugiere decodificacion especulativa. El modelo se sirve en un anillo de cuatro NVIDIA DGX Spark con cable RoCE directo, con el reloj de graficos limitado a 2.200 MHz. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto; el razonamiento puede consumir hasta 8.192 tokens de respuesta antes de empezar la contestacion.
- Generacion de codigo: la receta reporta pruebas en tareas de codigo con decodificacion greedy y modo thinking.
- Salida estructurada: la receta mide decodificacion en tres modos (codigo, prosa y estructurado), con 54,58 tok/s en el modo estructurado, el mas rapido.
- Vision: la torre de vision se sirve desde `vit-bf16/` (2,47 GB) en el rank 0 cuando la vision esta activada; el adaptador de vision tambien esta en BF16.
- Control de razonamiento: parametros `thinking_budget` (por ejemplo 4096) y `reasoning_effort` (`no_think`) para limitar o desactivar el razonamiento.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en hardware de gama alta con memoria limitada: la variante full quant ocupa 300,07 GB de pesos de texto, lo que permite servir un modelo de 169B en cuatro DGX Spark (79,74 GB por nodo, de los cuales 75,69 GB son propios y 4,05 GB compartidos). Es adecuado cuando no se dispone de un nodo unico con 1,5 TB de memoria para BF16.
- Generacion de codigo en pipelines internos: la receta mide 37,69 tok/s en decodificacion de un solo flujo para codigo con decodificacion greedy, y el modo thinking permite tareas de razonamiento sobre codigo; se puede integrar en herramientas de revision o generacion asistida.
- Salida estructurada y extraccion de datos: el modo estructurado alcanza 54,58 tok/s, el mas alto de los tres medidos, lo que lo hace adecuado para generar JSON, formularios o registros con formato fijo en procesos por lotes.
- Procesamiento de documentos con vision: con la torre `vit-bf16/` activada en el rank 0, el modelo puede procesar imagenes junto a texto, util para digitalizacion de documentos o analisis de capturas.
- Experimentacion con cuantizacion extrema: investigadores que quieran evaluar el impacto de 3,12 bits por peso en un MoE de 169B pueden usar la variante full quant y comparar con la variante lossless trunk (3,45 bits por peso) para aislar el efecto de la precision del trunk.
- Razonamiento con presupuesto controlado: el parametro `thinking_budget` permite limitar el razonamiento a 4.096 tokens, util en tareas donde se necesita una respuesta acotada y se quiere evitar que el modelo consuma toda la ventana de respuesta en razonamiento.
- Inferencia de baja concurrencia en anillo de cuatro nodos: la receta esta disenada para un unico flujo con decodificacion especulativa (drafter DFly2), adecuada para asistentes interactivos mas que para servidores de alta concurrencia.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de la receta en cuatro DGX Spark con reloj de graficos a 2.200 MHz, drafts activados y thinking desactivado, sobre el motor de la receta antes de su correccion de muestreo (`ef8ebb7c`). En la compilacion corregida, las peticiones greedy dieron los mismos tokens.

| Medicion | tok/s |
|---|---|
| Prefill en frio, una peticion a 8K | 467,72 |
| Prefill en frio, una peticion a 32K | 444,41 |
| Prefill en frio, una peticion a 64K | 420,89 |
| Decodificacion de un flujo, mediana de 3, codigo | 37,69 |
| Decodificacion de un flujo, mediana de 3, prosa | 19,07 |
| Decodificacion de un flujo, mediana de 3, estructurado | 54,58 |

Fidelidad frente a la referencia BF16:

| Medida | Full quant (por defecto) | Lossless trunk |
|---|---|---|
| Acuerdo top-1 con la referencia BF16, conjunto familiar | 96,73% (prosa 97,22%, codigo 96,35%; 336 peticiones) | no disponible en el fragmento proporcionado |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la variante full quant lee 300,07 GB de pesos de texto, mas el drafter y, con vision, `vit-bf16/` (2,47 GB) en el rank 0. La variante lossless trunk ocupa 331,69 GB. Los pesos en BF16 ocuparian 1.539,81 GB.
- Configuracion de referencia: cuatro NVIDIA DGX Spark en anillo con cable RoCE directo, cada uno con 79,74 GB de pesos (75,69 GB propios y 4,05 GB compartidos por los cuatro), con espacio en SSD local y margen de memoria para la cache KV y el indice de tokens en BF16.
- GPU recomendadas: el diseno esta pensado para DGX Spark; no se dispone de datos para A100, H100 o RTX 4090 en la informacion proporcionada.
- Cabe en consumer GPU: no disponible; el modelo completo no cabe en una unica GPU de consumo.
- Opciones de despliegue: el repositorio de la receta (`jakejharris/jjh-hy4-dgx-spark`) incluye la compilacion fijada, la verificacion de pesos, la configuracion del anillo y el comando de lanzamiento. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill en frio de 420,89 a 467,72 tok/s segun longitud (8K a 64K); decodificacion de un solo flujo entre 19,07 y 54,58 tok/s segun el tipo de salida.
- Verificacion: el manifiesto `SHA256SUMS` permite comprobar la integridad de los 251 archivos del pack.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4 EXL3 (esta ficha) | 169.304.156.030 | no disponible | EXL3 `mul1` 3,00 bpw en expertos; trunk `4b6b` o BF16 | `tencent-hy-license` | Hugging Face, repo de 374,3 GB |
| Tencent Hy4 (BF16) | 169.304.156.030 | no disponible | BF16 (1.539,81 GB) | `tencent-hy-license` | Hugging Face (checkpoint `c10c0de5`) |
| Hy4 EXL3 lossless trunk | 169.304.156.030 | no disponible | EXL3 en expertos; trunk BF16 (331,69 GB) | `tencent-hy-license` | Incluido en el mismo pack |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La variante full quant (por defecto) no es sin perdidas: su salida difiere de la configuracion lossless trunk, con un 96,73% de acuerdo top-1 frente a la referencia BF16 en el conjunto familiar; el 3,27% restante implica divergencias en la generacion.
- El modo thinking esta activado por defecto y puede consumir toda la ventana de 8.192 tokens de respuesta en razonamiento antes de empezar a contestar; en una tarea larga de codigo con greedy y thinking activado, el razonamiento uso los 8.192 tokens completos.
- Con muestreo a temperatura 0,9 (la predeterminada de Tencent) o 0,7 (la predeterminada del lanzador de la receta), el modelo no termino la tarea de codigo medida, con o sin presupuesto de razonamiento; otras temperaturas y tareas no se han medido.
- La licencia `tencent-hy-license` es una licencia "other" de Tencent; no se detallan en la informacion proporcionada las restricciones para uso comercial, por lo que debe revisarse el archivo `LICENSE` antes de cualquier despliegue en produccion.
- El modelo esta disenado para un anillo de cuatro DGX Spark con RoCE; no se documentan opciones de despliegue en otras configuraciones de hardware.
- La torre de vision no esta incluida en el pack principal y debe servirse desde la carpeta `vit-bf16/` en el rank 0, lo que anade complejidad operativa.
- La cuantizacion EXL3 a 3,00 bits por peso en los expertos enrutados es agresiva; el `down_proj` de las capas 75 y 76 se mantiene en BF16 porque su entrada desborda FP16, lo que indica sensibilidad numerica en esas capas.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion, limitaciones de contexto o idioma, ni sobre el rendimiento en benchmarks estandar.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jakejharris/jjh-hy4-exl3
- Modelo base Tencent Hy4: https://huggingface.co/tencent/Hy4/tree/c10c0de5
- Repositorio de la receta: https://github.com/jakejharris/jjh-hy4-dgx-spark
- README de la receta (comparacion con la compilacion anterior): https://github.com/jakejharris/jjh-hy4-dgx-spark#what-is-new-against-the-earlier-build
- Recetas de cuantizacion: `quant/README.md` dentro del repositorio de la receta
- Hallazgos de la receta: `FINDINGS.md` dentro del repositorio de la receta
- Script de medicion de tamano: `tools/text_size.py` y `receipts/quant/text_size.json` en el repositorio de la receta
