# satgeze/DeepSeek-v4.1-Flash-EXL3-2.0bpw-Ablit-EngramQ4-SM120-Dual-RTX-Pro-6000

## Resumen

Este checkpoint es una derivada cuantizada y "abliterated" de DeepSeek v4.1 Flash, publicada por el usuario satgeze. No se trata de un modelo entrenado desde cero, sino de un injerto de pesos sobre la cuantizacion EXL3 2.0bpw de diffbot: se reescriben 52 tensores `attn.wo_b` en las capas 10-35 para eliminar el comportamiento de rechazo, y se recomprimen las tablas Engram de fp8 a MXINT-4 con escalas de bloque e4m3. El resultado ocupa 259,8 GB en el repositorio y declara 188.955.825.634 parametros totales (unos 189.000 millones), con arquitectura CED, Engram en las capas 1 y 14 y decodificacion especulativa nativa DSpark.

La relevancia del checkpoint no esta en la calidad del modelo base, sino en la receta de despliegue: el autor documenta como servir un modelo de ~189.000 millones de parametros con contexto de 1M de tokens, vision, decodificacion especulativa y prefix caching en dos RTX PRO 6000 (SM120) con vLLM y el plugin `vllm_exl3`. En la model card se detallan dos defectos concretos de esa pila (una mascara de retencion que anula los commits de hash del draft-KV bajo DSpark, y un deadlock de inicializacion NCCL con P2P en pares Blackwell asimetricos) y sus mitigaciones.

El propio autor lo etiqueta como checkpoint de aficionado: no ha pasado una suite completa de benchmarks, ni una evaluacion estandar de comportamiento de rechazo, ni red-teaming de seguridad. Las unicas cifras publicadas son las de la model card, obtenidas con slices reducidos y heuristicas de clasificacion, con varias filas retractadas explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek v4.1 Flash, arquitectura CED, Engram en capas 1 y 14, decodificacion especulativa nativa DSpark (MoE con expertos, segun la model card) |
| Parametros totales | 188.955.825.634 (~189B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens (declarado en la model card) |
| Tipos de cuantizacion | EXL3 2.0bpw en los pesos principales; tablas Engram recompromidas de fp8 a MXINT-4 con escalas de bloque e4m3 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (48 shards; tamano del repo 259,8 GB) |
| Nombre de tokenizer | `tokenizer_mode=deepseek_v41` |
| Version de vLLM | `0.1.dev20904+g179dd0fa9` + plugin `vllm_exl3` |
| Abliteracion | 52 tensores `attn.wo_b` injertados, capas 10-35 |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-17 |
| Descargas / likes | 39 / 0 |

## Arquitectura y entrenamiento

El modelo base es DeepSeek v4.1 Flash, con arquitectura CED y tablas Engram en las capas 1 y 14, mas decodificacion especulativa DSpark integrada. Sobre ese base, diffbot publico una cuantizacion EXL3 de 2.0bpw preparada para dos RTX PRO 6000, y este checkpoint es una derivada de esa cuantizacion: no hay entrenamiento adicional ni fine-tuning, sino un injerto de pesos ("graft") sobre 52 tensores `attn.wo_b` de las capas 10-35. Los expertos, las tablas Engram, la cabeza MTP y las capas 0-9 y 36-39 permanecen intactos respecto al stock.

La segunda intervencion tecnica es la recompresion de las tablas Engram de fp8 a MXINT-4 con escalas de bloque e4m3, que reduce su huella de 189,1 GiB a 97,6 GiB. Esas tablas se sirven desde NVMe con deduplicacion y page cache caliente, o se fijan en memoria en maquinas que puedan permitirselo. El autor incluye un builder (`tools/build_ablit_hybrid.py`) que verifica el injerto contra el stock y enlaza mediante hardlinks los shards abliterated y los shards Engram MXINT-4 en un unico paquete. El despliegue usa vLLM con `dspark_block_size=5`.

No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento con ventana de contexto de hasta 1M tokens.
- Matematicas: el autor reporta un 96,0% sobre un slice de 50 problemas estilo GSM8K, con razonamiento visible.
- Tool calling con parser `deepseek_v41`; probado en modo llamada unica, sin llamada y llamada paralela triple (2/3 en el checkpoint abliterated, sin fugas de DSML).
- Vision: dos pruebas sinteticas superadas (separacion rojo|azul e identificacion de dos imagenes). No se han probado fotos reales.
- Decodificacion especulativa nativa DSpark, con `dspark_block_size=5`.
- Prefix caching funcional tras aplicar la variable de entorno que corrige la mascara de retencion del draft-KV; el autor reporta una mejora de 8-11x en la segunda pasada.
- Comportamiento de rechazo drásticamente reducido: de 20/20 rechazos en el stock a 2/20 en el checkpoint abliterated sobre prompts daninos de arquetipo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de audio ni un modo "thinking" explicito.

## Casos de uso

- Investigacion sobre abliteration: el checkpoint permite comparar el comportamiento de rechazo antes y despues del injerto sobre el mismo stack de serving, con las cifras publicadas como referencia (20/20 a 2/20 en prompts daninos, 0/10 a 1/10 en controles benignos).
- Analisis de documentos extensos: con 1M de tokens de contexto se pueden procesar libros tecnicos, expedientes o bases de codigo completas en una sola pasada, siempre que se asuma el coste de prefill (el autor reporta bloqueos de 47-115 s en peticiones de 2K cuando quedan peticiones huerfanas de 218K re-prefillando).
- Tuberias de codigo asistido con tool calling: el parser `deepseek_v41` permite emitir llamadas a funciones y llamadas paralelas, integrables en flujos de CI/CD o asistentes de repositorio, con la advertencia de que el modo paralelo-3 respondio con llamada unica seguida de espera en las pruebas del autor.
- Inferencia sobre imagenes en pipelines de datos: las pruebas de vision sintetica sugieren uso en clasificacion o verificacion de imagenes generadas, aunque no hay validacion con fotografias reales.
- Servicio de chat de alta concurrencia en hardware profesional: el autor mide 260,2 tok/s con 8 peticiones de 46K co-residentes (cifra marcada como superada y con caveat) y 89,4 tok/s en stream unico a 2K, lo que situa el checkpoint en escenarios de atencion por lotes mas que de baja latencia.
- Evaluacion comparativa de cuantizaciones: al ser derivada de la EXL3 2.0bpw de diffbot, sirve para medir el impacto de la recompresion Engram a MXINT-4 frente a fp8 y frente a la variante 2.9bpw citada en la model card.
- Pruebas de estres de serving en vLLM con EXL3: el repositorio documenta los dos defectos encontrados (prefix caching anulado bajo DSpark y deadlock de NCCL con P2P en pares Blackwell asimetricos), lo que lo convierte en material util para reproducir y depurar esos fallos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (no verificados de forma independiente):

| Bench | Stock (pre-injerto) | Abliterado (este checkpoint) |
|---|---|---|
| Bateria de rechazo, prompts daninos (20) | 20/20 rechazos | 2/20 rechazos |
| Bateria de rechazo, controles benignos (10) | 0/10 rechazos | 1/10 rechazos |
| GSM8K, slice de 50 problemas | 92,0% (46/50) | 96,0% (48/50) |
| Loop battery v1, contexto corto | 0/8 | 0/8 |
| Loop battery v1, prefill de 400K tokens | 0/8 | 1/8 (prompt `enum`, ttr 0,20) |
| Loop battery, prefill de 512K tokens | no disponible | 1/8 (12%) |
| Decode a 2K, stream unico | 92-94 tok/s | 89,4 tok/s |
| Concurrencia 8x46K en caliente | 244-249 tok/s | 260,2 tok/s (superado, ver caveat) |
| Concurrencia 12x46K | 17,3 tok/s (retractado) | artefacto de medicion, retractado |
| Multi-tool (unica / sin llamada / paralela-3) | 3/3 con esquemas | 2/3, 0 fugas de DSML |
| Vision (2 pruebas sinteticas) | pass | pass |

No hay resultados publicados de MMLU, HumanEval, recuperacion a 1M de tokens, soak agéntico multi-turno ni red-teaming de seguridad. El propio autor califica la evaluacion como no rigurosa e indica que la bateria de rechazo usa 20 prompts de arquetipo (no el conjunto Keys refusal32) y que el test de loop emplea un split repetido de wikitext (732 KiB ciclados hasta 400K), no prosa unica. Las filas de concurrencia 12x46K y de cache caliente fueron retractadas: el servidor re-prefillaba en lugar de reutilizar cache, por lo que 17,3 tok/s era una medicion de prefill, no de decode.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra unica; el repositorio pesa 259,8 GB y las tablas Engram por si solas ocupan 97,6 GiB tras la recompresion, con la opcion de servirlas desde NVMe con page cache en lugar de fijarlas en memoria.
- GPU recomendadas: 2x RTX PRO 6000 (SM120, Blackwell), que es la configuracion objetivo y la que da nombre al checkpoint. No se documentan otras configuraciones.
- Consumer GPU: no cabe. Un modelo de ~189B parametros en EXL3 2.0bpw mas 97,6 GiB de tablas Engram excede cualquier GPU de consumo actual.
- Opciones de despliegue: vLLM en la version `0.1.dev20904+g179dd0fa9` con el plugin `vllm_exl3`, `tokenizer_mode=deepseek_v41` y DSpark con `dspark_block_size=5`; el script `start.sh` levanta el servicio en el puerto 8000 con API compatible OpenAI. No se mencionan llama.cpp, Ollama ni TGI, y el formato EXL3 no es habitual en esas pilas.
- Arranque: 12-15 minutos en frio (48 shards, JIT y captura de grafos) y 5-6 minutos con page cache caliente.
- Throughput: 89,4 tok/s en stream unico a 2K; 260,2 tok/s con 8 peticiones de 46K co-residentes (cifra superada y con caveat); el autor advierte que la primera peticion pesada tras el arranque corre a una decima parte de velocidad por el calentamiento de JIT y de la ruta Engram.
- Notas de red y clúster: con pares Blackwell asimetricos hay que desactivar P2P en NCCL para evitar un deadlock en la inicializacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (graft + Engram MXINT-4) | ~189B | 1M | EXL3 2.0bpw + MXINT-4 | no disponible | HuggingFace, 39 descargas |
| DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000 (diffbot) | ~189B (base del injerto) | no disponible en la informacion | EXL3 2.0bpw, Engram en fp8 | no disponible | HuggingFace |
| Variante EXL3 2.9bpw citada en la model card | no disponible | no disponible | EXL3 2.9bpw | no disponible | citada, sin enlace en la informacion |
| DeepSeek v4.1 Flash stock (pre-injerto) | ~189B | 1M (segun este stack) | sin cuantizar / oficial | no disponible | API oficial citada en la model card |

La comparacion de rendimiento entre estas variantes se limita a lo publicado: GSM8K 96,0% en el abliterated frente a 92,0% en el stock sobre el mismo slice de 50 problemas, y 89,4 tok/s frente a 92-94 tok/s en decode a 2K. El autor remite a `docs/BENCH.md` para las graficas comparativas frente a la API oficial y frente a 2.9bpw, pero los valores numericos de esa comparacion no estan en la informacion disponible.

## Limitaciones y advertencias

- Checkpoint de aficionado: el autor declara explicitamente que no ha pasado una suite completa de benchmarks, ni una evaluacion estandar de rechazo, ni red-teaming de seguridad.
- La abliteracion desactiva la mayor parte del comportamiento de rechazo (20/20 a 2/20 en prompts daninos). Esto elimina barreras de seguridad y hace el modelo inadecuado para aplicaciones orientadas al publico sin filtros externos y sin revision legal.
- Tambien introduce un falso positivo benigno (0/10 a 1/10) y un atractor de repeticion a 400K y 512K de prefill (1/8 en ambos), ausente en contexto corto.
- La bateria de rechazo usa 20 prompts de arquetipo y clasificacion por heuristica de marcadores sobre la respuesta visible, no el conjunto estandar Keys refusal32.
- El slice de GSM8K es de 50 problemas, no los 1319 completos; la mejora de 92,0% a 96,0% esta dentro del ruido segun el propio autor.
- El test de loop emplea un split de wikitext de 732 KiB ciclado hasta 400K tokens, no prosa unica, lo que favorece la repeticion.
- Riesgo de alucinacion: no evaluado. No hay resultados de MMLU, HumanEval ni pruebas de recuperacion a 1M de tokens.
- Vision validada solo con dos imagenes sinteticas; sin pruebas con fotografias reales.
- La reutilizacion de prefix cache a contexto largo es poco fiable en esta build: solo el contexto prefillado mas recientemente permanece emparejable, y las peticiones huerfanas tras desconexion del cliente siguen re-prefillando y bloquean peticiones de 2K durante 47-115 s.
- El arranque es lento (12-15 min en frio) y la primera peticion pesada tras el arranque corre a una decima parte de velocidad.
- El servidor se levanta sin API key por defecto; hay que configurar `API_KEY` en el entorno o en `serve/serve.env` para exigir Bearer token.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. La responsabilidad de verificar la licencia del modelo base y de la cuantizacion de diffbot recae en quien despliegue.
- Idiomas soportados no disponibles; no hay evaluacion multilingue.
- La informacion de la model card esta truncada en la seccion de la pila ("Weights | EXL3 2.0bpw + abliteration graft (se"), por lo que algunos detalles de la composicion de shards pueden faltar.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/satgeze/DeepSeek-v4.1-Flash-EXL3-2.0bpw-Ablit-EngramQ4-SM120-Dual-RTX-Pro-6000
- Cuantizacion base de diffbot: https://huggingface.co/diffbot/DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000
- Documentacion de benchmarks del repositorio: `docs/BENCH.md` (ruta relativa dentro del propio repositorio; no se ha proporcionado URL directa)
- Script de construccion del pack hibrido: `tools/build_ablit_hybrid.py` (ruta relativa dentro del repositorio)
- Script de arranque: `start.sh` y `serve/serve-engram-vision.sh` (rutas relativas dentro del repositorio)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (solo enlaces sin relacion a Reddit, Hinative y agregadores).
