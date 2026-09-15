# MarxistLeninist/GB10-AGILLM4.4

## Resumen

GB10-AGILLM4.4 es un repositorio de HuggingFace publicado por el usuario MarxistLeninist que, segun su propia model card, no contiene pesos de modelo ni un checkpoint reanudable completo, sino el codigo fuente de un entrenador de un solo fichero (`AGILLM4.4_GB10_singlefile.py`, 1.992.257 bytes, SHA-256 `e2d1cf7b5149a0022bf29ed665950f3d74bb83deeb5087604019102d7dd2e69a`) junto con evidencia de publicacion. Se trata, por tanto, de una publicacion "source-only" asociada a un proceso de entrenamiento observado, no de un modelo listo para inferencia.

La model card documenta un entrenamiento reanudado desde el estado 2.865.825, con heartbeats observados en los pasos 2.865.826 (loss 5,445), 2.865.848 (loss 5,051) y 2.865.869 (loss 7,787), y una auditoria contable de un intervalo de 548,933 segundos (21:14:42–21:23:51 UTC del 14 de septiembre de 2026) que cubre los pasos 2.865.114 a 2.865.487, con 373 actualizaciones comprometidas de 373 intentos. El autor retira explicitamente dos cifras de rendimiento anunciadas previamente (77.931 tokens/s brutos y 3.338 tokens/s equivalentes full-stack) por un defecto de contabilidad en el contador de lote.

No se declara arquitectura, numero de parametros, longitud de contexto, idiomas soportados, tipos de cuantizacion ni resultados de benchmarks. La relevancia del repositorio es documental y de reproducibilidad: fija hashes, evidencia de continuidad entre procesos y una correccion contable, no capacidades de modelo utilizables por si mismas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; la model card menciona ramas AR (autoregresiva) local, objetivos SAT y NAT, "anclas full-stack" y un componente denominado DBlock, sin especificacion formal de arquitectura |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible; la configuracion de lanzamiento auditada usa `block=2048`, pero no se declara como longitud de contexto del modelo |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (la model card indica que la exportacion no asigna licencia de software adicional) |
| Formato de pesos | no hay pesos; el artefacto es codigo fuente Python (`.py`). No hay safetensors, GGUF ni ONNX |
| Tipo de publicacion | source-only release (trainer + evidencia), sin checkpoint resumible ni tokenizer |
| Tamano del artefacto principal | 1.992.257 bytes |
| Hash SHA-256 del trainer | `e2d1cf7b5149a0022bf29ed665950f3d74bb83deeb5087604019102d7dd2e69a` |
| Fecha de creacion | 2026-09-14T21:09:19Z |
| Fecha de actualizacion | 2026-09-14T21:47:21Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no incluye una descripcion arquitectonica formal: no se especifica si el modelo es un transformer denso, un MoE, un SSM o un hibrido. El unico material tecnico son referencias internas del codigo fuente, que menciona un "e2e local AR branch" (lineas 7733–7734 del hash auditado), objetivos SAT y NAT, "full-stack anchors", "DBlock continuation state" y "Dynamic SAT-var gradient receipts". El runtime de hotload de checkpoint esta embebido en el propio fichero entrenador, de modo que la reanudacion depende de activos externos compatibles (shards de checkpoint, tokenizer y plan de hotload) que no se publican en el repositorio.

Sobre los datos de entrenamiento no hay informacion: no se declara el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. La unica innovacion tecnica descrita con detalle es la correccion contable: en el hash anterior `cf1c22ed...`, la linea 26155 asigna `toks_processed = BLOCK * BATCH` y las lineas 18350–18445 propagan ese valor a los contadores de tokens brutos y equivalentes, mientras que la rama AR local usa `ids_l = ids[:_dblock_local_rows(args, ids)]` con `batch_size=56`, `block=2048` y `dblock_local_rows=2`. Es decir, el contador nominal contaba 56 filas cuando el objetivo end-to-end procesaba 2. Como estimacion derivada (no certificada), 373 actualizaciones x 2 filas locales x 2.048 posiciones / 548,933 s equivalen a aproximadamente 2.783 posiciones de secuencia de entrada locales por segundo para una unica pasada de lote local por actualizacion.

## Capacidades

El artefacto publicado no es un modelo de inferencia, por lo que no se pueden atribuir capacidades generativas. Lo que si puede hacer el material publicado:

- Reanudar entrenamiento desde un checkpoint compatible: el runtime de hotload esta embebido en el fichero entrenador y el autor documenta la reanudacion desde el estado 2.865.825.
- Continuar el estado de DBlock y restaurar estado de optimizador, scaler y RNG de Torch/CUDA/Python/NumPy tras una parada (verificado de forma independiente sobre el checkpoint 2.865.515).
- Emitir heartbeats de progreso con paso comprometido y perdida finita muestreada.
- Producir recibos de gradiente SAT-var.
- Mantener contadores de tokens brutos y equivalentes full-stack, actualmente marcados como defectuosos en su version auditada.
- Verificar integridad de artefactos: el publicador SG comprueba hashes declarados, patrones de credenciales antes del commit y verifica los bytes subidos contra el commit inmutable de HuggingFace.
- Coordinar publicacion source-only mediante las pasarelas `sg_hf_repo_status` y `sg_hf_repo_publish`, con journal de publicacion duradero, control de concurrencia y comprobacion de commit padre.
- Generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling, agentes, razonamiento multi-paso y capacidades multilingues: no evaluables, no se dispone de pesos ni de evaluaciones publicadas.

## Casos de uso

- Reproduccion de entrenamientos: el trainer se puede ejecutar con shards de checkpoint compatibles, tokenizer y plan de hotload para continuar el estado 2.865.825. Es adecuado porque el autor documenta la ruta de origen exacta (`/workspace/gb10_checkpoint_hotload_20260914/v2/agillm44_hf_hotload_v2.py`) y el hash del fichero.
- Auditoria de contabilidad de tokens: usar `TOKEN_ACCOUNTING_AUDIT.json` y `training-status.json` para reconstruir por que 373 actualizaciones acreditaban un numero de tokens incorrecto y recalcular el trabajo real por actualizacion. Apropiado porque el intervalo auditado, el numero de pasos y la configuracion de lanzamiento estan fijados.
- Trazabilidad de continuidad entre procesos: reconstruir el relevo del proceso 100680 (SIGTERM con checkpoint limpio en el paso 2.865.515) por el proceso de recuperacion 148323 que ejecuta el mismo hash canonico. Util para depurar paradas y reanudaciones en entrenamientos largos.
- Diagnostico de estabilidad y fallos no finitos: los PID 68926 y 87582 fallaron con perdidas no finitas tras una unica actualizacion comprometida, mientras que el proceso 148323 alcanzo el paso 2.865.671 con loss 7,863. Sirve para separar intentos fallidos de ejecuciones validas.
- Publicacion coordinada source-only: emplear las pasarelas SG para replicar el flujo de publicacion con journal duradero, comprobacion de commit padre y restriccion a fuente, tal como describe `SG_REPO_COORDINATION.md`.
- Validacion de integridad de artefactos: verificar el SHA-256 del trainer y de los ficheros declarados, y comprobar los bytes subidos contra el commit inmutable de HuggingFace antes de aceptar una copia. Apropiado porque el autor exige que los ficheros en cuarentena de intentos fallidos no se promocionen como checkpoints sanos.
- Control de licencia antes de redistribuir: la licencia "other" obliga a revisar los terminos antes de cualquier uso comercial o redistribucion del codigo, dado que no se asigna licencia de software adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y no existen pesos que evaluar.

Como referencia documental (no son benchmarks), se incluyen las observaciones de perdida registradas en la model card:

| Paso | Perdida | Contexto |
|---|---|---|
| 2.865.113 | 5,3548923 | conjunto heldout fijo, SHA-256 `513b30203ffd18167655deb2d9cd610541df87d1ea0b8a0f9241c58e68703d21` |
| 2.865.515 | 5,3534043 | mismo conjunto heldout fijo |
| 2.865.671 | 7,863 | heartbeat del proceso de recuperacion 148323 |
| 2.865.826 | 5,445 | primer heartbeat observado de la build GB10 |
| 2.865.848 | 5,051 | heartbeat posterior |
| 2.865.869 | 7,787 | heartbeat posterior |

Estas cifras son perdidas de entrenamiento muestreadas o de un unico conjunto heldout, no indicadores de capacidad. El propio autor advierte que el descenso de heldout (de 5,3548923 a 5,3534043) no demuestra convergencia a largo plazo ni permite descartar por si solo un colapso de calidad. El rendimiento de trabajo real del monitor figura como "unverified" y la publicacion no certifica ninguna tasa total de trabajo real ni equivalente full-stack.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable, no se publican pesos. Sin pesos no hay requisito de VRAM de inferencia.
- VRAM estimada para entrenamiento: no disponible. No se declara el tamano del modelo, el numero de parametros ni el estado del optimizador.
- GPU observadas: la build se describe como "USA GB10", correspondiente a la familia NVIDIA GB10 (Grace Blackwell). La model card menciona ademas un carril separado registrado en una RTX 3090, que esta publicacion afirma no modificar.
- GPU recomendadas: no disponible; el autor no publica una matriz de hardware soportado.
- Viabilidad en GPU de consumo: indeterminable sin datos de tamano de modelo. La unica referencia concreta es la mencion a una RTX 3090 como carril separado, no como plataforma de esta build.
- Opciones de despliegue: no aplicable para inferencia (no hay runtime, ni vLLM, llama.cpp, Ollama, TGI ni equivalente). Para el entrenamiento, el unico mecanismo descrito es el runtime de checkpoint-hotload embebido en el fichero entrenador, con dependencia de shards de checkpoint, tokenizer, dependencias y configuracion de runtime privada no publicada.
- Latencia y throughput: no se certifica ninguna cifra. Las anteriores (77.931 tokens/s brutos y 3.338 tokens/s equivalentes full-stack) quedan marcadas como invalidas para comparaciones de trabajo real. La unica estimacion derivada es de aproximadamente 2.783 posiciones de secuencia de entrada locales por segundo para una unica pasada de lote local por actualizacion, y no cubre pasadas repetidas AR/SAT/NAT, objetivos supervisados ni anclas full-stack.

## Comparativa con modelos similares

No disponible. No es posible establecer una comparativa porque el repositorio no contiene un modelo, sino codigo de entrenamiento sin pesos, sin arquitectura declarada, sin numero de parametros y sin evaluaciones. No se ha identificado en la informacion proporcionada ningun artefacto comparable de la misma categoria (publicaciones source-only de entrenadores con auditoria contable) con el que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni checkpoint resumible completo. No sirve para inferencia ni para evaluacion de capacidades.
- La reproduccion exige activos no publicados: shards de checkpoint compatibles, tokenizer, dependencias y configuracion de runtime privada.
- Licencia "other" sin licencia de software adicional asignada: el uso comercial y la redistribucion quedan en un marco juridico indeterminado que debe aclararse antes de cualquier explotacion.
- Las cifras de rendimiento anunciadas previamente quedan invalidadas por el propio autor por un error de contabilidad; no deben reutilizarse ni sustituirse por etiquetas totalizadoras enganosas.
- Sesgos conocidos: no disponibles. No existe informacion sobre datos de entrenamiento, composicion del dataset ni proceso de alineamiento.
- Riesgo de alucinacion: no evaluable, al no haber modelo ni evaluaciones publicadas.
- Limitaciones de contexto o idioma: no disponibles; no se declara longitud de contexto ni cobertura idiomatica.
- Fiabilidad del checkpoint: dos intentos anteriores (PID 68926 y 87582) fallaron con perdidas no finitas tras una actualizacion comprometida. Los ficheros en cuarentena de esos intentos no deben promocionarse como checkpoints sanos.
- Estabilidad no demostrada: el descenso de perdida en el conjunto heldout fijo es minimo y el autor advierte explicitamente que no prueba convergencia a largo plazo.
- Contadores y metricas en revision: los contadores historicos de tokens, LR y checkpoint no se han reescrito, y el monitor marca el throughput de trabajo real como no verificado.
- Ausencia de validacion externa: cero descargas y cero likes, sin evaluaciones de terceros ni comunidad que respalde las afirmaciones.
- Cronologia y verificabilidad: la model card esta fechada el 14 de septiembre de 2026 y se apoya en observaciones de PID y ficheros de estado en rutas de workspace no accesibles publicamente; el contenido no es verificable de forma independiente con la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MarxistLeninist/GB10-AGILLM4.4
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada. Los resultados devueltos corresponden a Google Gemini y no guardan relacion con este modelo.
- Referencias internas citadas en la model card y no enlazadas publicamente: `TOKEN_ACCOUNTING_AUDIT.json`, `training-status.json`, `SG_REPO_COORDINATION.md`, `current_run_status.json`, `resume_status.json`, `UNQUALIFIED_NONFINITE.json`.
