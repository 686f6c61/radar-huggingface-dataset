# Lewfkrad/Inkling-2-Mini-DSpark-sm120-vllm-patch

## Resumen

Inkling-2-Mini-DSpark-sm120-vllm-patch es un parche de un solo archivo publicado por el usuario Lewfkrad para habilitar la decodificación especulativa DSpark del modelo Inkling 2 Mini de Thinking Machines sobre GPUs con arquitectura Blackwell sm_120 (RTX PRO 6000 y familia RTX 50xx). No se trata de un modelo nuevo, sino de una modificación del fichero `dspark.py` de la imagen oficial `vllm/vllm-openai:inkling-2-mini`, que sin este parche falla durante el warmup con un error de CUDA al no existir kernel compilado para sm_120 en la ruta `reshape_and_cache_flash`.

El problema que resuelve es concreto: el borrador especulativo (`mtp.safetensors`) escribe su caché KV mediante `FlashAttentionImpl.do_kv_cache_update`, que invoca `reshape_and_cache_flash` de `vllm._C`. En la build de la imagen citada, esa función carece de kernel para sm_120 con el layout head-strided que usa el borrador, por lo que cualquier lanzamiento con `--speculative-config '{"method":"dspark",...}'` aborta. El parche sustituye esa escritura por un kernel Triton propio, `_sm120_write_kv`, que replica la escritura paginada de K/V.

La relevancia es práctica: la decodificación especulativa con DSpark mejora el throughput en código y salida estructurada (de 168 a 372 tok/s en código, según los datos del autor), aunque penaliza la prosa novel en torno a un 7 %. El parche mantiene la licencia Apache 2.0 de vLLM y está pensado para montarse sobre la imagen oficial mediante un bind mount de Docker.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el parche no define arquitectura; actúa sobre el borrador especulativo DSpark de Inkling 2 Mini) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262 000 tokens (contexto del servidor de producción indicado por el autor) |
| Tipos de cuantizacion | checkpoint HF en NVFP4 y MXFP8; caché KV fp8 para el modelo objetivo; caché del borrador en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`mtp.safetensors` para el borrador); parche en Python (`.py`) y diff unificado (`.patch`) |

## Arquitectura y entrenamiento

El parche no entrena ni modifica los pesos del modelo. Su alcance es el módulo `vllm/models/inkling2/nvidia/dspark.py` de la imagen de vLLM, que implementa la decodificación especulativa DSpark: un borrador que propone tokens y un modelo objetivo que los verifica. El borrador usa atención con caché KV paginada en bf16 con layout `(blocks, kv_heads, page, 2 * head_dim)`, pasada como vista head-strided `kv_cache.transpose(1, 2).split(head_dim, -1)`.

La innovación técnica del parche es el kernel Triton `_sm120_write_kv`, que realiza la misma escritura paginada de K/V que `reshape_and_cache_flash` pero compilada para sm_120. `_write_kv` lo usa solo cuando se cumplen tres condiciones simultáneas: la GPU es sm_120, `kv_cache_dtype == "auto"` y el dtype de la caché coincide con K (bf16). En cualquier otro caso se mantiene la llamada original a `do_kv_cache_update`. La verificación frente a un scatter de referencia da un error máximo de 0.0 en K y V, y omite correctamente los slots con valor -1.

El diagnóstico se realizó con `CUDA_LAUNCH_BLOCKING=1` sin éxito, y se localizó llamando a `cudaPeekAtLastError()` mediante ctypes sobre `libcudart` tras cada paso del forward del borrador; el primer resultado no nulo apareció justo después de `_write_kv`. El parche incluye además una plantilla de chat opcional (`chat_template_medium.jinja`) que baja el esfuerzo de razonamiento por defecto de 0.9 a 0.7 para evitar que el modelo consuma todo el presupuesto de tokens en el modo de pensamiento en respuestas de documentos largos.

## Capacidades

- Decodificación especulativa DSpark sobre el modelo base Inkling 2 Mini, con `num_speculative_tokens` fijado en 7 por el tamaño de bloque del checkpoint (valores 3, 4 o 5 impiden el arranque).
- Servicio compatible con la API OpenAI a través de `vllm/vllm-openai:inkling-2-mini`.
- Tool calling: 5 de 5 llamadas devolvieron argumentos JSON válidos en el servidor de producción parcheado.
- Razonamiento con esfuerzo configurable (`reasoning_effort`: low/medium), con plantilla que permite ajustar el presupuesto de pensamiento.
- Contexto largo: prueba needle-in-the-haystack con 89 000 tokens respondida correctamente en 14,4 s.
- Salida determinista entre ejecuciones con la misma petición (temperatura 0), aunque no idéntica a nivel de token respecto al servidor sin especulación, por la diferencia en la ruta de muestreo del borrador.
- Soporte de CUDA graphs hasta 128 tokens en la configuración probada.

## Casos de uso

- Generación de código en producción: es el escenario con mayor ganancia (372 tok/s frente a 168 sin especulación, más del doble), por lo que resulta adecuado para autocompletado, generación de tests y asistentes de refactorización servidos con vLLM.
- Salida estructurada y JSON: el borrador acierta más en secuencias predecibles, con 225 tok/s en listas y 231 tok/s en tareas de agente frente a 168 sin especulación.
- Agentes con tool calling: las 5 de 5 llamadas con argumentos JSON válidos y el throughput de 231 tok/s en modo agente lo hacen viable para pipelines de agentes multi-paso.
- Análisis de documentos largos: con 262 000 tokens de contexto y una respuesta correcta a 89 000 tokens de distancia en 14,4 s, sirve para resumen y extracción sobre contratos, informes o expedientes extensos.
- Despliegue en estaciones de trabajo Blackwell: el parche está probado en RTX PRO 6000 Blackwell Workstation Edition (96 GB) con driver 615.71.09, lo que permite servir el modelo en hardware de sobremesa profesional sin GPU de centro de datos.
- Servicio multiusuario: con 4 usuarios concurrentes mantiene 153 tok/s por stream frente a 98 sin especulación, útil para APIs internas con carga moderada.
- Evaluación de decodificación especulativa: los scripts `bench_sweep.py` y `probes/` permiten reproducir el fallo y medir la exactitud del kernel, útiles para validar builds propias de vLLM sobre sm_120.

## Benchmarks y rendimiento

Datos del autor, todos en tok/s, con temperatura 0, `reasoning_effort: low`, checkpoint NVFP4/MXFP8, caché KV fp8 para el objetivo y 600 tokens máximos:

| Config | Prosa | Código | Lista | Agente | Media 1 usuario | 4 usuarios, por stream |
|---|---|---|---|---|---|---|
| Sin especulación | 168 | 168 | 168 | 168 | 168 | 98 |
| DSpark, borrador probabilístico (parcheado) | 156 | 372 | 225 | 231 | 246 | 153 |
| DSpark, borrador greedy | 156 | 372 | 225 | 231 | 246 | 152 |
| DSpark, CUDA graphs hasta 128 tokens | 156 | 371 | 224 | 230 | 246 | 152 |

La longitud media de aceptación fue de aproximadamente 2,7 a 3,1 tokens por paso. La prosa novel es el único caso donde la especulación penaliza, con cerca de un 7 % menos de throughput que sin ella. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU probada: RTX PRO 6000 Blackwell Workstation Edition con 96 GB de VRAM, driver 615.71.09.
- Arquitectura objetivo del parche: sm_120, es decir, Blackwell en sus variantes RTX PRO 6000 y RTX 50xx. En GPUs sm_90 o anteriores el parche no se activa y se usa la ruta original de vLLM.
- VRAM estimada: no disponible de forma desagregada; el checkpoint se sirve en NVFP4/MXFP8 y el autor trabaja sobre una GPU de 96 GB con contexto de 262 000 tokens.
- Despliegue: imagen Docker `vllm/vllm-openai:inkling-2-mini` (digest `sha256:c2dc759f5984f69c1e2418c6af7c26eb756f5ed2a8934c768ae1253645d1449e`) con el fichero montado mediante `-v $PWD/dspark.py:/usr/local/lib/python3.14/dist-packages/vllm/models/inkling2/nvidia/dspark.py:ro`.
- Lanzador: `run-vllm.sh` con variables `MODEL_DIR`, `PORT`, `SPEC`, `GMU`, `SEQS`, `MNBT`, `KVD`, `DSM`, `CGMAX` y `MAXLEN`.
- Throughput medido: 246 tok/s de media con un usuario y 153 tok/s por stream con cuatro usuarios.
- Latencia en contexto largo: 14,4 s para una consulta needle-in-the-haystack sobre 89 000 tokens.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Throughput en código | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-DSpark-sm120-vllm-patch | Parche de decodificación especulativa sobre Inkling 2 Mini | no disponible | 262 000 tokens | 372 tok/s | Apache 2.0 | Hugging Face (0 descargas) |
| Inkling 2 Mini sin especulación | Modelo base servido con vLLM | no disponible | 262 000 tokens | 168 tok/s | no disponible | Imagen oficial de vLLM |
| vLLM sin parche en sm_120 | Servidor estándar con DSpark | no disponible | no disponible | no arranca (error de kernel CUDA) | Apache 2.0 | Imagen oficial de vLLM |

La comparación relevante es frente al mismo modelo sin especulación y frente al servidor sin parche, ya que no se dispone de datos de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El parche sustituye por completo `dspark.py`; si se monta sobre una imagen más reciente de vLLM se sobrescribe el fichero upstream y hay que revalidarlo contra esa build antes de usarlo.
- `num_speculative_tokens` debe ser 7 de forma obligatoria; otros valores impiden el arranque del servidor.
- Solo se activa en GPUs sm_120 con `kv_cache_dtype == "auto"` y caché en bf16; en el resto de configuraciones se usa la ruta original sin la corrección.
- La prosa novel pierde aproximadamente un 7 % de throughput con la especulación activada.
- La salida no es idéntica a nivel de token respecto al servidor sin especulación, aunque las respuestas verificadas fueron correctas en ambos casos.
- El repositorio tiene 0 descargas y 1 like, lo que indica un nivel de validación comunitaria muy bajo; conviene tratar el parche como experimental en producción.
- No se dispone de información sobre sesgos, idiomas soportados ni evaluación de alucinación del modelo base en la documentación proporcionada.
- La licencia Apache 2.0 cubre el parche, que modifica un fichero de vLLM y conserva su cabecera SPDX; las condiciones del modelo base Inkling 2 Mini no se detallan en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Lewfkrad/Inkling-2-Mini-DSpark-sm120-vllm-patch
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Imagen Docker de vLLM: `vllm/vllm-openai:inkling-2-mini`
