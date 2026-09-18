# kingjones777/Xing4.0-29B-A4B-ROCmFP4-FAST-imatrix-GGUF

## Resumen

Xing4.0-29B-A4B-ROCmFP4-FAST-imatrix-GGUF es una cuantizacion GGUF del modelo XingChen-AGI/Xing4.0-29B-A4B, publicada por el usuario kingjones777, orientada especificamente a hardware AMD con arquitectura gfx1151 (Strix Halo, Ryzen AI Max+ 395) bajo ROCm. Se trata de un modelo de tipo MoE con atencion MLA y hyper-connections mHC, integrado en una arquitectura nueva denominada `xing4` en el fork ROCmFPX. El repositorio contiene un unico archivo de pesos de 15,51 GiB junto con la importance matrix (`xing4.imatrix`, 88 MB) empleada para generarlo, de modo que la cuantizacion es reproducible.

La relevancia de esta ficha es doble. Por un lado, documenta una cuantizacion en formato ROCmFP4, con tipos de tensor cuyo identificador es igual o superior a 100 y que queda fuera del `GGML_TYPE_COUNT` estandar; esto implica que llama.cpp de fabrica no puede cargar el archivo y se necesita el fork ROCmFPX, rama `xing4-port` (commit `cbc2cd5`). Por otro, el autor publica mediciones honestas del efecto real de la imatrix: la mejora de perplejidad es de solo un 0,8 % (9,2258 a 9,1506), inferior a la del archivo COHERENT sin imatrix, y atribuye ese resultado limitado a que la calibracion se hizo con wikitext en ingles sobre un modelo con sesgo hacia el chino.

El modelo base declara 262.144 tokens de contexto, pero esta cuantizacion no alcanza ese valor en hardware de 128 GiB: la reserva de KV cache pide 209.920 MiB (205 GiB) para el contexto completo y falla, por lo que en la practica el limite medido es de 32.768 tokens con MTP activado. Es, por tanto, un build pensado para velocidad y tamano, no para calidad maxima ni para contextos muy largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion MLA (n_embd_head_k=192, n_embd_head_v=128) y hyper-connections mHC; arquitectura `xing4` en el fork ROCmFPX |
| Parametros totales | 31.215.031.088 (31,2 B) segun los safetensors del modelo base; la nomenclatura comercial indica 29B |
| Parametros activos | no disponible de forma explicita; la nomenclatura A4B del nombre sugiere aproximadamente 4.000 millones de parametros activos por token |
| Longitud de contexto | 262.144 tokens declarados en el modelo base; en este build, 32.768 tokens es lo maximo que se asigna con exito en un equipo de 128 GiB con MTP activado |
| Tipos de cuantizacion | ROCmFP4 (tipos de tensor con id >= 100, fuera del `GGML_TYPE_COUNT` estandar); tipo de tensor de salida `q4_K`; receta `llama-quantize ... 103 32` |
| Idiomas soportados | no disponible en la ficha de HuggingFace; la model card describe el modelo base como "Chinese-first" y senala que las trazas de razonamiento son frecuentemente en chino incluso en respuestas en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo unico de 15,51 GiB); la fuente es un GGUF BF16 de 62,4 GB con 936 tensores |
| Tamano del repositorio | 16,7 GB (incluye el archivo `.imatrix` de 88 MB) |
| Capas | `block_count = 41`; la capa 40 es el bloque MTP (`nextn_predict_layers = 1`) |
| Descargas / likes | 131 descargas, 1 like |
| Pipeline | text-generation (conversational) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con atencion MLA (Multi-head Latent Attention), lo que reduce el coste de la KV cache mediante compresion latente. Incorpora ademas hyper-connections mHC y una cabeza de prediccion multiple de tokens (MTP) en la capa 40, con `nextn_predict_layers = 1`. Esta combinacion obliga a un soporte especifico en el motor de inferencia: el autor lo ha implementado en el fork ROCmFPX (rama `xing4-port`, commit `cbc2cd5`), y advierte que la rama `main` del repositorio no incluye la arquitectura `xing4`.

Esta ficha corresponde a la cuantizacion, no al entrenamiento. Los datos disponibles no detallan el numero de tokens de preentrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion deberia consultarse en la ficha del modelo base. Lo que si se documenta es el proceso de cuantizacion: se parte de un GGUF BF16 de 936 tensores (62,4 GB), se calcula la importance matrix con `llama-imatrix` sobre `wiki.test.raw` con contexto 512, `-ub 64` y `-ngl 99`, obteniendo 552 entradas sobre 598 chunks, y se cuantiza con `--imatrix` y tipo de salida `q4_K` (parametros 103 y 32). Un detalle critico: `-ub 64` es obligatorio, porque en gfx1151 el fallback ordenado de `mul_mat_id` en ROCm calcula valores incorrectos para MoE sin cuantizar y el paso de imatrix corre en BF16; construido con `-ub 512` (valor por defecto), este modelo produjo una perplejidad de 318.130.

El propio autor valida el port contra `transformers` con los mismos tokens: 8,3608 de perplejidad frente a 8,4252 del pipeline de referencia en BF16. Advierte asimismo de que `llama-perplexity` solo puntua la segunda mitad de cada ventana, de modo que un script que puntue desde la posicion 1 obtiene 11,91 para el mismo modelo y los mismos datos.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla Jinja (`--jinja`).
- Razonamiento explicito con modo "thinking" activado por defecto; el contenido de razonamiento se expone por separado en `reasoning_content` cuando se sirve con `llama-server`.
- Tool calling / function calling verificado sobre este archivo concreto: `finish_reason: tool_calls` y llamada `get_weather({"city":"Tokyo","unit":"celsius"})`.
- Decodificacion especulativa mediante el bloque MTP integrado en los pesos (`draft-mtp`), con una longitud media de aceptacion de 1,65 tokens con `--spec-draft-n-max 1`.
- Capacidades multilingues no documentadas formalmente; el comportamiento observado es de modelo con prioridad al chino, con trazas de razonamiento frecuentemente en chino incluso respondiendo en ingles.
- No se documentan capacidades de vision, audio ni otras modalidades.
- No se documentan capacidades especificas de agentes multi-paso mas alla del soporte de tool calling.

## Casos de uso

- Asistente conversacional local en equipos Strix Halo: el modelo cabe en un unico archivo de 15,51 GiB y ofrece 18,87 t/s de decodificacion con MTP activado, suficiente para interaccion en tiempo real sin depender de la nube.
- Automatizacion con function calling en local: las llamadas a herramientas estan verificadas en este archivo, por lo que puede integrarse en flujos que necesiten invocar APIs (clima, busqueda, calendario) manteniendo los datos en el equipo.
- Generacion asistida por ordenador en entornos sin GPU dedicada: al ejecutarse sobre memoria unificada AMD con ROCm, permite autocompletado y generacion de fragmentos de codigo en maquinas compactas.
- Procesamiento de documentos de hasta 32.768 tokens: resumen y extraccion de informacion en lotes de documentacion tecnica o contractual que quepan en esa ventana, con la advertencia de que el contexto debe presupuestarse cuidadosamente.
- Laboratorio de cuantizacion reproducible: el repositorio incluye la `.imatrix` y la receta completa, por lo que sirve como base para re-targetear la cuantizacion con un conjunto de calibracion en chino o mixto, que segun el autor probablemente mejoraria el resultado obtenido.
- Experimentacion con decodificacion especulativa MTP: el bloque MTP incluido en los pesos permite medir el impacto de `--spec-draft-n-max` en el throughput real, con datos de referencia publicados (+48,9 % con n-max 1).
- Evaluacion de arquitecturas MoE+MLA sobre ROCm: util para equipos que quieran validar el rendimiento de MLA y hyper-connections en gfx1151 antes de adoptar modelos de mayor tamano.
- Prototipado de agentes con razonamiento multi-paso, siempre que se presupuesten al menos 600 tokens de salida por respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos son de perplejidad, velocidad y decodificacion especulativa.

| Metrica | Valor |
|---|---|
| Perplejidad, FAST + imatrix (este archivo) | 9,1506 ± 0,280 |
| Perplejidad, FAST sin imatrix | 9,2258 ± 0,282 |
| Perplejidad, COHERENT sin imatrix | 9,0639 ± 0,274 |
| Perplejidad, port BF16 (validacion) | 8,3608 |
| Perplejidad, transformers BF16, mismos tokens | 8,4252 |
| Throughput `tg128` (llama-bench) | 29,69 t/s |
| Throughput `pp512` (llama-bench) | 830,8 t/s |
| Perplejidad con imatrix construida a `-ub 512` | 318.130 (resultado invalido) |

Mediciones de MTP (prompt de 589 tokens, generacion de 160 tokens, contexto 32K, ROCm0):

| Configuracion `--spec-type` | Prefill | Decode | Delta frente a off | Longitud media aceptada |
|---|---|---|---|---|
| off | 454,8 t/s | 12,67 t/s | — | — |
| `draft-mtp --spec-draft-n-max 1` | 388,9 t/s | 18,87 t/s | +48,9 % | 1,65 |
| `draft-mtp --spec-draft-n-max 2` | 411,9 t/s | 14,45 t/s | +14,0 % | 1,83 |

## Requisitos de hardware

- Peso del archivo: 15,51 GiB para el GGUF FAST con imatrix, mas 88 MB de la importance matrix si se conserva.
- KV cache: aproximadamente 0,80 MiB por token sin comprimir, segun los datos del autor (209.920 MiB para 262.144 tokens). A 32.768 tokens esto supone del orden de 25,6 GiB, cantidad que se suma a los pesos; se trata de una estimacion derivada, no de una cifra publicada.
- Con MTP activado, el contexto de borrador reserva su propia KV cache de tamano completo, por lo que el consumo se duplica en esa parte. El autor no publica el desglose exacto de memoria total.
- Hardware validado: AMD Ryzen AI Max+ 395 "Strix Halo", gfx1151, ROCm 7.2.4, 123 GiB de memoria unificada.
- Contexto maximo alcanzable en ese hardware: 262.144 tokens falla (pide 205 GiB de KV); 131.072 falla con MTP (`failed to create MTP context`); 32.768 es lo que cabe.
- GPU recomendadas: no disponibles; el autor solo documenta el escenario Strix Halo con ROCm. No hay datos de ejecucion en A100, H100 o RTX 4090.
- Viabilidad en GPU de consumo: no confirmada. El archivo de 15,51 GiB cabria en tarjetas con 24 GB o mas, pero la KV cache sin comprimir y la ausencia de soporte en llama.cpp estandar impiden garantizar su funcionamiento.
- Opciones de despliegue: exclusivamente el fork ROCmFPX (rama `xing4-port`, commit `cbc2cd5`) sobre ROCm en gfx1151, mediante `llama-server`. No es compatible con llama.cpp de fabrica, ni se ha probado el backend Vulkan. No hay soporte documentado para vLLM, TGI, Ollama ni otros motores.
- Comando de referencia: `llama-server -m Xing4.0-29B-A4B-Q4_0-ROCmFP4-FAST-imatrix.gguf -c 32768 -ngl 99 -fit off --jinja`.
- Latencia y throughput: 830,8 t/s de prefill y 29,69 t/s de decodificacion en `llama-bench`; 18,87 t/s de decodificacion con MTP n-max 1 y prefill de 388,9 t/s en la prueba de 589+160 tokens.
- Aviso de KV: `-ctk q8_0 -ctv q8_0` se ignora silenciosamente en esta arquitectura; a 131.072 tokens la reserva fue de 104.960 MiB, exactamente la mitad de la cifra con el doble de contexto, sin beneficio de cuantizacion.
- Presupuesto de tokens de salida: al ser un modelo de razonamiento, una respuesta de dos frases consumio 569 tokens de completado y `max_tokens: 200` devuelve contenido vacio; se recomienda un minimo de 600.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificables de modelos alternativos de la misma categoria en la informacion proporcionada. La comparativa posible se limita a los propios builds de la familia Xing4.0-29B-A4B:

| Build | Tamano | Perplejidad | Decodificacion | Notas |
|---|---|---|---|---|
| FAST + imatrix (esta ficha) | 15,51 GiB | 9,1506 ± 0,280 | 29,69 t/s (`tg128`) | La mas rapida y pequena; la imatrix aporta solo -0,8 % |
| FAST sin imatrix | no disponible | 9,2258 ± 0,282 | no disponible | Referencia de partida del tier FAST |
| COHERENT sin imatrix | no disponible | 9,0639 ± 0,274 | no disponible | Mejor perplejidad que FAST; prioriza calidad sobre tamano |

Frente a modelos comparables de otros autores (Mistral, Qwen, Llama en el rango de 30 B con MoE), no hay datos en la informacion disponible que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Requiere un fork especifico del motor de inferencia: llama.cpp estandar no puede cargar estos archivos porque los tipos de tensor ROCmFP4 tienen identificadores >= 100 y porque `xing4` es una arquitectura nueva. Sin el fork ROCmFPX (rama `xing4-port`, commit `cbc2cd5`) el modelo es inutilizable.
- La imatrix aporta una mejora marginal: -0,8 % de perplejidad. El build COHERENT sin imatrix sigue midiendo mejor calidad, de modo que este archivo debe elegirse por velocidad y tamano, no por calidad.
- La calibracion de la imatrix se hizo con wikitext en ingles sobre un modelo de prioridad china; el autor senala que un conjunto de calibracion en chino o mixto probablemente daria mejores resultados.
- El contexto declarado de 262.144 tokens es inalcanzable en hardware de 128 GiB: la reserva de KV cache pide 205 GiB y falla. El limite practico medido es de 32.768 tokens con MTP activado y 131.072 falla.
- La cuantizacion de la KV cache (`-ctk q8_0 -ctv q8_0`) se ignora silenciosamente en esta arquitectura, por lo que no se puede planificar el contexto contando con ese ahorro de memoria.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas, pero se trata de un modelo de razonamiento con perplejidad de 9,15 en wikitext, valor que conviene validar en la tarea concreta antes de usarlo en produccion.
- Consumo de tokens elevado: el modo thinking esta activado por defecto y respuestas cortas consumen cientos de tokens; un limite de 200 tokens devuelve contenido vacio. Esto encarece y ralentiza cualquier integracion.
- Las trazas de razonamiento aparecen con frecuencia en chino incluso cuando la respuesta es en ingles, lo que puede complicar el filtrado, la auditoria y la experiencia de usuario en castellano.
- Ambito de validacion muy estrecho: el autor solo ha probado ROCm en gfx1151. No se han probado contextos superiores a 32K ni el backend Vulkan, y no hay evidencia de funcionamiento en A100, H100 o GPUs de consumo NVIDIA.
- El proceso de cuantizacion es fragil: `-ub 64` es obligatorio en el paso de imatrix y su omision produce un archivo con perplejidad 318.130, es decir, inservible.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base XingChen-AGI/Xing4.0-29B-A4B antes de desplegarlo.
- Fiabilidad de la ficha: el repositorio tiene 131 descargas y 1 like, y no hay evaluaciones independientes publicadas. Los unicos datos disponibles proceden del propio autor de la cuantizacion.

## Enlaces

- Ficha de HuggingFace de esta cuantizacion: https://huggingface.co/kingjones777/Xing4.0-29B-A4B-ROCmFP4-FAST-imatrix-GGUF
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Tiers estandar sin imatrix de la misma familia: https://huggingface.co/kingjones777/Xing4.0-29B-A4B-ROCmFP4-GGUF
- Fork ROCmFPX con la arquitectura `xing4`: https://github.com/kingjones30/ROCmFPX (rama `xing4-port`, commit `cbc2cd5`)
- Reproducer del fallo de `mul_mat_id`: `test-backend-ops -o MUL_MAT_ID` (mencionado en la model card)
- La busqueda web realizada no devolvio enlaces relevantes: los resultados obtenidos corresponden a foros sobre loterias y no guardan relacion con el modelo.
