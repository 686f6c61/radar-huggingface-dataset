# kernelpool/MiMo-V2.6-Pro-MOPD-MXFP4-GGUF

## Resumen

MiMo-V2.6-Pro-MOPD-MXFP4-GGUF es una conversion a formato GGUF del checkpoint MiMo-V2.6-Pro-MOPD de Xiaomi, publicada por el usuario kernelpool. No se trata de un modelo nuevo, sino de una redistribucion cuantizada pensada para ejecutarse en DwarfStar (ds4), el runtime de inferencia para Apple Silicon mantenido por antirez, a traves de la rama `kernelpool/ds4:mimo-v26`. El modelo base es un transformer de tipo mezcla de expertos (MoE) con bloques MTP (multi-token prediction) y un drafter DFlash para decodificacion especulativa; MOPD es la revision de Xiaomi sobre el checkpoint de RL que reduce las llamadas repetidas a herramientas en sesiones de agente.

La relevancia de esta ficha es acotada y muy especifica: el repositorio ocupa 560,1 GB, el GGUF principal pesa 557.146.510.560 bytes y el autor indica que el modelo se ejecuta sobre dos Macs de 512 GB en paralelismo tensorial, con unos 270 GiB residentes por rank. Es, por tanto, un artefacto de despliegue para hardware de gama altisima y un runtime alternativo, no una opcion para inferencia convencional en GPU. Los metadatos de safetensors del repositorio declaran 2.768.322.432 parametros, una cifra que no es coherente con el tamano del checkpoint y que debe tratarse como incompleta.

La licencia es MIT, heredada del checkpoint original de Xiaomi, lo que permite uso comercial. El modelo expone tres identificadores en el servidor: `mimo-v2.6-pro`, `mimo-v2.6-pro-chat` (thinking desactivado) y `mimo-v2.6-pro-reasoner` (thinking activado). No se incluye encoder de vision en esta conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bloques MTP (multi-token prediction) y drafter DFlash; proyeccion QKV fusionada con chunks de paralelismo tensorial |
| Parametros totales | 2.768.322.432 segun metadatos de safetensors del repositorio (dato no coherente con el tamano del checkpoint de 557 GB; se considera incompleto o parcial) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de ejecucion del autor usan `--ctx 8192`) |
| Tipos de cuantizacion | Expertos en MXFP4 (repack sin recuantizacion), Q8_0 en atencion, pesos densos y cabeza de salida, BF16 en embeddings; sidecar DFlash en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (layout `mimo2`), dividido en dos partes que se concatenan tras la descarga; sidecar en layout `dflash` |

## Arquitectura y entrenamiento

El checkpoint base es un modelo de mezcla de expertos de Xiaomi. Esta conversion no reentrena nada: el script `gguf-tools/mimo26_quantize.py` parte de la revision `adea8e2c5373181e5a973fa1ecb343cb31af214b` de `XiaomiMiMo/MiMo-V2.6-Pro-MOPD`, desentrelaza los chunks de paralelismo tensorial de la proyeccion QKV fusionada y conserva los bloques MXFP4 de los expertos tal y como se publicaron, bit a bit. La revision de origen queda registrada en los metadatos del GGUF. El archivo principal incorpora tres bloques MTP, que el runtime usa como drafter interno para decodificacion especulativa cuando se pasa `--mtp`.

La innovacion concreta de MOPD respecto al checkpoint de RL previo es la reduccion de llamadas repetidas a herramientas en sesiones de agente, segun el articulo publicado por Xiaomi. El autor indica que el modelo principal y el drafter DFlash cambiaron en esta revision, mientras que los bloques MTP conservan los mismos pesos que la version de RL. No hay informacion disponible sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre las etapas de alineacion (RLHF, DPO u otras) empleadas por Xiaomi.

## Capacidades

- Generacion de texto y razonamiento, con dos modos seleccionables en el servidor: `mimo-v2.6-pro-chat` (thinking desactivado) y `mimo-v2.6-pro-reasoner` (thinking activado).
- Uso de herramientas (tool calling) en sesiones de agente; la revision MOPD esta especificamente orientada a reducir la repeticion de llamadas a herramientas.
- Razonamiento multi-paso en el modo reasoner, con traza de pensamiento separada de la respuesta final.
- Decodificacion especulativa mediante los bloques MTP incluidos en el archivo principal y activables con `--mtp`; el autor senala que con decodificacion greedy la salida es identica a la decodificacion simple.
- Ejecucion en paralelismo tensorial entre dos nodos, repartiendo cabezas de atencion, expertos enrutados y cabeza de vocabulario.
- Vision: no incluida. El autor indica explicitamente que DS4 todavia no ejecuta el sidecar DFlash ni la vision bajo paralelismo tensorial, y que no se incluye encoder de vision.
- Capacidades multilingues: no disponible.

## Casos de uso

- Sesiones de agente con uso intensivo de herramientas: el modelo permite reducir llamadas duplicadas a funciones dentro de un mismo bucle de razonamiento, que es exactamente el problema que MOPD ataca; encaja en orquestadores que encadenan busquedas, ejecucion de codigo y consultas a APIs.
- Razonamiento complejo por lotes en modo `mimo-v2.6-pro-reasoner`: analisis de documentacion tecnica, revision de disenos o resolucion de problemas con traza de pensamiento, ejecutado en local sin depender de APIs externas.
- Despliegue on-premise con requisitos de confidencialidad: al ejecutarse en dos Macs propias, los datos no salen de la infraestructura del usuario, lo que resulta adecuado para entornos con restricciones de tratamiento de datos.
- Interaccion conversacional de baja latencia en modo `mimo-v2.6-pro-chat`: al desactivar el thinking se reduce la longitud de la salida y se acelera la respuesta para asistentes interactivos.
- Evaluacion e investigacion de decodificacion especulativa: el repositorio permite comparar el rendimiento de `--mtp` frente a decodificacion simple, ya que el autor documenta que la salida greedy coincide.
- Pruebas de portado de modelos MoE de gran tamano a Metal: sirve como referencia reproducible para investigar paralelismo tensorial sobre Apple Silicon con transporte RDMA.
- Generacion de codigo asistida en local, siempre que se acepte el coste de hardware y la ausencia de integraciones estandar con editores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta un unico dato cualitativo: el modo `--mtp` realiza el borrador con los bloques MTP del archivo principal, ambos ranks lo ejecutan y verifican conjuntamente, y con decodificacion greedy la salida sigue la decodificacion simple. No hay cifras de MMLU, HumanEval, GSM8K ni de throughput y latencia.

## Requisitos de hardware

- Hardware: dos Macs con 512 GB de memoria unificada. Cada rank mantiene aproximadamente 270 GiB residentes, correspondientes a la mitad de las cabezas de atencion, la mitad de los expertos enrutados y la mitad de la cabeza de vocabulario. No es viable en una sola maquina de 512 GB ni en hardware de consumo.
- Inferencia exclusivamente sobre Metal; el autor indica que la conversion es Metal only.
- Red: interconexion entre los dos nodos con transporte RDMA; el autor enlaza las instrucciones en `docs/DISTRIBUTED.md`.
- VRAM estimada en GPU: no disponible; no se documenta soporte CUDA.
- Almacenamiento: el archivo unido ocupa 557.146.510.560 bytes (unos 519 GiB). El procedimiento de concatenacion de las dos partes mantiene el espacio extra en disco limitado al tamano de la segunda parte (77.146.510.560 bytes).
- Despliegue: DwarfStar (ds4), rama `kernelpool/ds4:mimo-v26`. El flujo es compilar con `make`, arrancar primero el worker con `./ds4` y despues el coordinador con `./ds4-server`, ambos con `--tensor-parallel`, `--role`, `--coordinator`/`--listen` y `--transport rdma`. La opcion `--mtp` debe pasarse a ambos ranks o a ninguno.
- Compatibilidad con otros runtimes: no disponible. La model card solo documenta DwarfStar; no se menciona vLLM, llama.cpp, Ollama ni TGI, y el layout `mimo2` es especifico de este port.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime | Notas |
|---|---|---|---|---|---|---|
| MiMo-V2.6-Pro-MOPD-MXFP4-GGUF (este) | no disponible (metadatos safetensors: 2.768.322.432) | no disponible | GGUF (`mimo2`), MXFP4 + Q8_0 + BF16 | MIT | DwarfStar (ds4), Metal, 2 nodos | Revision MOPD; reduce llamadas repetidas a herramientas |
| kernelpool/MiMo-V2.6-Pro-RL-MXFP4-GGUF | no disponible | no disponible | GGUF, mismo layout | MIT | DwarfStar (ds4), Metal, 2 nodos | Checkpoint de RL previo; los ficheros de esta ficha lo reemplazan |
| XiaomiMiMo/MiMo-V2.6-Pro-MOPD | no disponible | no disponible | Checkpoint original de Xiaomi (MXFP4 en expertos) | MIT | no disponible | Fuente de la conversion; revision `adea8e2c5373...` |

No se dispone de datos de rendimiento comparado entre estas variantes ni de terceros con los que contrastarlas.

## Limitaciones y advertencias

- Los metadatos de safetensors declaran 2.768.322.432 parametros, cifra incompatible con un repositorio de 560,1 GB; hay que tratar el dato con cautela y no usarlo para estimar requisitos de memoria.
- La longitud de contexto real no se documenta; los ejemplos usan 8192 tokens y no debe asumirse un valor mayor.
- El modelo esta pensado para un runtime no estandar (DwarfStar) y una rama concreta de un fork de GitHub, con una pull request aun sin enlazar. Requiere compilar el codigo y montar una interconexion RDMA entre dos maquinas.
- Solo hay soporte de Metal. No hay vision ni uso del sidecar DFlash bajo paralelismo tensorial, por lo que descargar el sidecar no aporta nada en la configuracion documentada.
- El repositorio es muy reciente y con adopcion practicamente nula (2 descargas y 0 likes en el momento de la consulta), sin validacion independiente de la calidad de la cuantizacion.
- El archivo principal esta dividido en dos partes; es obligatorio concatenarlas en el orden correcto y verificar el SHA-256 (`e6fd8b15...` para el fichero unido) antes de usarlo.
- No hay datos publicados de sesgos, comportamiento multilingue ni tasas de alucinacion para esta revision concreta. Como en cualquier modelo de lenguaje, el riesgo de alucinacion existe, especialmente en modo reasoner sin verificacion externa.
- La licencia MIT del checkpoint de Xiaomi se aplica a estos ficheros, por lo que el uso comercial esta permitido, pero la responsabilidad sobre el cumplimiento recae en quien despliega.
- El coste de hardware (dos equipos con 512 GB de memoria unificada) limita el uso a laboratorios o empresas con ese equipamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kernelpool/MiMo-V2.6-Pro-MOPD-MXFP4-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-MOPD
- Conversion previa (reemplazada): https://huggingface.co/kernelpool/MiMo-V2.6-Pro-RL-MXFP4-GGUF
- Repositorio DwarfStar (ds4): https://github.com/antirez/ds4
- Rama del port: https://github.com/kernelpool/ds4/tree/mimo-v26
- Instrucciones de despliegue distribuido: https://github.com/kernelpool/ds4/blob/mimo-v26/docs/DISTRIBUTED.md
- Documentacion del port de MiMo-V2.6: https://github.com/kernelpool/ds4/blob/mimo-v26/docs/MIMO_V26.md
- Articulo de Xiaomi sobre MOPD y repeticion de llamadas a herramientas: https://mimo.xiaomi.com/blog/mimo-v2-6-tool-call-repetition
- Pull request del port: no disponible (el autor lo deja como TODO)
