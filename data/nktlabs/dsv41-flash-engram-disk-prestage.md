# nktlabs/dsv41-flash-engram-disk-prestage

## Resumen

`nktlabs/dsv41-flash-engram-disk-prestage` no es un modelo, sino un conjunto de parches y una receta de servicio (serving recipe) publicado por nktlabs bajo licencia MIT. Su objetivo es ejecutar el modelo `deepseek-ai/DeepSeek-V4.1-Flash` (en su cuantizacion EXL3 de 2.0 bits por peso distribuida por diffbot) sobre un host con solo 125 GB de RAM en lugar de los aproximadamente 280 GB que exige la ruta de referencia que fija la tabla Engram en memoria.

El problema que resuelve es concreto: DeepSeek-V4.1-Flash necesita leer 48 filas Engram aleatorias de 256 bytes por token de una tabla de 190 GiB. La ruta oficial con `DSV41_ENGRAM_DISK=1` lee esas filas dentro del forward pass, lo que obliga a modo eager y reduce el throughput de decodificacion a unos 26,1 tok/s. Este repositorio mueve la recoleccion (gather) de Engram a la fase `prepare_inputs`, que ya se ejecuta en modo eager, permitiendo que los grafos CUDA permanezcan activos porque nada dentro de la region capturada toca un fichero.

El resultado medido es de 80,2 tok/s en un solo stream y 449,7 tok/s agregados a 8 streams, con GSM8K-200 en 97,5%, usando solo 18 GB de RSS de RAM de host. El repositorio no incluye pesos: son cuatro ficheros Python, un script de servicio y las mediciones que los justifican, pensados como overlay sobre el arbol `recipe/` del pack de diffbot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es una receta de servicio para DeepSeek-V4.1-Flash; la model card no detalla la arquitectura del modelo subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2.0 bits por peso (la variante servida es `DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000`) |
| Idiomas soportados | no disponible |
| Licencia | MIT (el repositorio); el modelo base y la cuantizacion tienen sus propias licencias, no detalladas en la informacion |
| Formato de pesos | no aplica al repositorio (no contiene pesos); el pack servido usa pesos EXL3 sobre vLLM |
| Tipo de artefacto | Receta de servicio (parches + script); no es un modelo entrenado |
| Modelo servido | `diffbot/DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000` |
| Modelo base | `deepseek-ai/DeepSeek-V4.1-Flash` |
| Motor de inferencia | vLLM (imagen `vllm/vllm-openai:deepseekv41-flash-0909`) |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica los pesos del modelo. Es un conjunto de cuatro ficheros Python (`patches/prestage/engram.py`, `engram_disk.py`, `model.py` y `model_state.py`), un script de servicio (`serve/serve-prestage.sh`) y un `PATCH-SUMMARY.md` que documenta cada simbolo modificado. La intervencion tecnica consiste en anadir los metodos `DiskEngramTable.prestage()`, `check_prestaged()` y `disk_gather_local()`, mas el hook `DeepseekV4Model.engram_prestage()` y un enganche en `prepare_inputs`. La clave es que `DeepseekV41ModelState.prepare_inputs` ya se ejecuta en modo eager inmediatamente antes de `run_fullgraph`; trasladando alli el hash del kernel, el `preadv` a un buffer fijado (pinned) y una unica copia H2D a un tensor persistente de GPU, la region capturada por los grafos CUDA deja de tocar el sistema de ficheros y puede mantenerse activa.

No hay informacion en la documentacion proporcionada sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) del modelo subyacente. El repositorio es una optimizacion de inferencia, no una contribucion de entrenamiento. Los ficheros se consumen como reemplazos completos mediante bind-mount sobre la imagen, sin necesidad de reconstruirla, y el `PATCH-SUMMARY.md` permite regenerar los diffs contra la fuente de la imagen propia.

## Capacidades

El repositorio no anade capacidades al modelo; habilita su ejecucion eficiente en hardware limitado. Lo que permite es:

- Servir `DeepSeek-V4.1-Flash` cuantizado a EXL3 2.0 bpw sobre vLLM con una API compatible con OpenAI.
- Mantener grafos CUDA activos mientras la tabla Engram reside en NVMe, sin fijarla en RAM de host.
- Ejecucion multi-stream: hasta 8 secuencias concurrentes (`MAX_NUM_SEQS` por defecto 8) con decodificacion de aproximadamente 56-57 tok/s por stream.
- Modo de verificacion de paridad (`ENGRAM_PRESTAGE_CHECK=1`) que hace tambien la busqueda real y comprueba que las filas prestaged son byte a byte identicas.
- Compatibilidad con la ruta de referencia de diffbot, incluyendo los parches de FlashInfer para `sparse_mla_sm120_prefill` y el kernel xmoe.

Capacidades del modelo subyacente (razonamiento, codigo, matematicas, tool calling, vision, multilingue): no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia en hardware con RAM limitada: permite ejecutar un modelo que exigiria unos 280 GB de RAM de host sobre una maquina con 125 GB, liberando la mayor parte de la memoria del sistema para otras cargas al reducirse a 18 GB de RSS.
- Despliegue de bajos recursos mediante NVMe: con aproximadamente 160 GB libres en un NVMe real para los shards 1-46 y otros 203 GB para los shards Engram 47-48, el modelo queda operativo sin necesidad de instalar memoria fisica adicional.
- Evaluacion comparativa de rutas de servicio: el repositorio incluye mediciones (113,3 tok/s fijado en RAM frente a 26,1 tok/s en disco eager frente a 80,2 tok/s en disco con prestage y grafos) que permiten justificar la eleccion de configuracion en funcion del presupuesto de memoria.
- Validacion de paridad antes de produccion: el paso `ENGRAM_PRESTAGE_CHECK=1 EAGER=1` realiza la comprobacion byte a byte de las filas prestaged, util antes de habilitar los grafos en un entorno critico.
- Ajuste de throughput por numero de secuencias: con decodificacion lineal por stream entre 4 y 8 secuencias, permite dimensionar el numero de usuarios concurrentes en funcion del hardware disponible (449,7 tok/s agregados a 8 streams).
- Prefill de lotes grandes: con 1719 tok/s en prefill single y 3324 agregados, es adecuado para tareas con prompts largos donde el coste de prefill domina sobre la decodificacion.
- Integracion sobre la receta de diffbot: sirve como overlay que anade los mounts de prestage sin reconstruir la imagen, facilitando su aplicacion sobre nuevas etiquetas de imagen siguiendo el `PATCH-SUMMARY.md`.

## Benchmarks y rendimiento

Los datos de rendimiento disponibles en la informacion proporcionada son los siguientes:

| Configuracion | 1 stream | 4 streams (agregado) | 8 streams (agregado) | RAM de host |
|---|---|---|---|---|
| RAM de host fijada (diffbot, reportado) | 113,3 tok/s | 277,2 tok/s | no disponible | ~280 GB |
| Disco + eager (`ENGRAM_DISK=1`) | 26,1 tok/s | 107,6 tok/s | no disponible | 12 GB RSS |
| Disco + prestage + grafos | 80,2 tok/s | 229,2 tok/s | 449,7 tok/s | 18 GB RSS |

Otras metricas reportadas:

| Metrica | Valor |
|---|---|
| Prefill (1 stream) | 1719 tok/s |
| Prefill (agregado) | 3324 tok/s |
| Decodificacion por stream (4-8 streams) | ~56-57 tok/s |
| GSM8K-200 | 195/200 = 97,5% |
| Modo de pensamiento | desactivado (THINKING=off) en todas las mediciones |

No se han publicado resultados de benchmarks comparativos adicionales (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- GPU: 2 tarjetas sm_120 de 96 GB (RTX PRO 6000 Blackwell).
- RAM de host: 125 GB totales, con 18 GB en uso durante el servicio (frente a los ~280 GB de la ruta fijada en RAM).
- Almacenamiento: aproximadamente 160 GB libres en un NVMe real para los shards 1-46, mas otros 203 GB para los shards Engram 47-48.
- No cabe en GPU de consumo: el modelo base y su cuantizacion EXL3 2.0 bpw requieren memoria muy por encima de lo disponible en una RTX 4090 o similar.
- Despliegue: vLLM con imagen `vllm/vllm-openai:deepseekv41-flash-0909` (la etiqueta v0.29.0 no incluye el codigo del modelo V4.1-Flash segun la model card). Requiere los parches del pack de diffbot (`patches/vllm/sitecustomize.py`, `patches/flashinfer/sparse_mla_sm120_prefill.cu`, `patches/flashinfer/empty-aot` y el kernel `kernels/build/xmoe`).
- Variables de servicio: `API_KEY` obligatoria; `ENGRAM_DISK`, `ENGRAM_PRESTAGE`, `ENGRAM_PRESTAGE_CHECK` y `EAGER` como conmutadores a nivel de script; `PORT` por defecto 8000; `MAX_NUM_SEQS` por defecto 8; `THINKING` por defecto `default`.
- Latencia y throughput: ver la tabla de benchmarks (80,2 tok/s a un stream y 449,7 tok/s agregados a 8 streams con la configuracion optimizada).

## Comparativa con modelos similares

No procede una comparativa de modelos, ya que este repositorio no es un modelo sino una receta de servicio. La comparativa relevante es entre rutas de ejecucion del mismo modelo:

| Ruta de servicio | 1 stream | 4 streams | RAM de host | Grafos CUDA |
|---|---|---|---|---|
| RAM de host fijada (diffbot) | 113,3 tok/s | 277,2 tok/s | ~280 GB | no disponible |
| Disco + eager (oficial `DSV41_ENGRAM_DISK=1`) | 26,1 tok/s | 107,6 tok/s | 12 GB RSS | desactivados (fuerza eager) |
| Disco + prestage + grafos (este repositorio) | 80,2 tok/s | 229,2 tok/s | 18 GB RSS | activos |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El repositorio no es un ejecutable autonomo: es un overlay sobre el arbol `recipe/` del pack de diffbot. Sin ese arbol y sin los ficheros que no se redistribuyen (`patches/vllm/sitecustomize.py`, los parches de FlashInfer y el kernel `xmoe`), no funciona.
- Requiere hardware muy especifico: dos tarjetas sm_120 de 96 GB (RTX PRO 6000 Blackwell). Sin ese hardware, las mediciones de rendimiento no son aplicables.
- Latencia peor que la ruta con tabla fijada en RAM: 80,2 tok/s frente a 113,3 tok/s a un solo stream; la receta prioriza el ahorro de memoria sobre la velocidad maxima.
- El propio autor recomienda ejecutar primero la comprobacion de paridad (`ENGRAM_PRESTAGE_CHECK=1 EAGER=1`) antes de activar los grafos; omitir ese paso impide detectar posibles discrepancias entre las filas prestaged y las reales.
- Todas las cifras de rendimiento se midieron con `THINKING=off`; el comportamiento con el modo de pensamiento activado no esta cuantificado en la informacion disponible.
- El repositorio declara licencia MIT, pero el modelo servido (`deepseek-ai/DeepSeek-V4.1-Flash`) y la cuantizacion de diffbot tienen sus propias condiciones de licencia, no detalladas en la informacion proporcionada. Verificar antes de un uso comercial.
- La model card no incluye datos sobre sesgos, riesgo de alucinacion, limitaciones de contexto o idioma del modelo subyacente; no disponibles.
- La informacion sobre la composicion del dataset Engram y los shards esta cortada al final de la model card ("another 203 GB for Engram shards 47-48 (r"), por lo que algunos detalles de almacenamiento podrian estar incompletos.
- El repositorio tiene 0 descargas y 1 "like" en el momento de la consulta, por lo que su validacion por parte de la comunidad es practicamente nula.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nktlabs/dsv41-flash-engram-disk-prestage
- Modelo servido (cuantizacion EXL3 de diffbot): https://huggingface.co/diffbot/DeepSeek-V4.1-Flash-EXL3-2.0bpw-2x-RTX-PRO-6000
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Imagen de vLLM utilizada: `vllm/vllm-openai:deepseekv41-flash-0909` (Docker Hub)

No se han encontrado otros enlaces relevantes en la busqueda web (los resultados obtenidos tratan sobre la ciudad austriaca de Steyr y no guardan relacion con el modelo).
