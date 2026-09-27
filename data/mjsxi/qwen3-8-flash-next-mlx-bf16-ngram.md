# mjsxi/qwen3.8-flash-next-mlx-bf16-ngram

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un artefacto de pesos: una tabla de embeddings n-gram / PLE sin cuantizar (BF16) pensada para sustituir la tabla equivalente cuantizada a 4 bits del checkpoint `ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit`. El fichero, `ngram_table.bin`, ocupa 102.400.491.688 bytes (95,37 GiB) y contiene un unico tensor de forma `[320001536, 160]` en BF16, con cabecera tipo safetensors y payload crudo, sin escalas ni sesgos de cuantizacion.

El problema que resuelve es concreto: el checkpoint original distribuye esta tabla como tabla afin de 4 bits (pesos + escalas + sesgos, en torno a 30 GB segun el propio autor), lo que introduce error de cuantizacion en las consultas de embeddings n-gram. Al reemplazarla por la version BF16 se recupera la precision original de la tabla a cambio de un fichero aproximadamente 3,2 veces mayor.

El autor (mjsxi) se declara no afiliado a ninguno de los dos proyectos de origen y describe el artefacto como una reconstruccion local: los 128 tensores BF16 `*.ple.ple_embedding.ngram_embedding.shard_N` (indices 0..127) procedentes de `True2456/Qwen3.8-Flash-Next-MLX-4bit` se concatenaron en un unico tensor, con verificacion de `dtype`, anchura 160, suma de filas exacta de 320.001.536 e indices contiguos sin duplicados. No hay informacion sobre la arquitectura ni el tamano del modelo anfitrion, ni sobre su licencia o idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo, es una tabla de embeddings n-gram / PLE (per-layer embedding) de consulta por filas; se integra en el checkpoint `ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit` |
| Parametros totales | 51.200.245.760 (320001536 filas x 160 dimensiones, BF16) |
| Parametros activos | No aplica (no es MoE; es una tabla de consulta, solo se leen las filas recuperadas por token) |
| Longitud de contexto | No disponible (depende del checkpoint anfitrion; este fichero no define contexto) |
| Tipos de cuantizacion | Fichero sin cuantizar: BF16, `bits=16`, `group_size=32` en la metadata de cabecera; el checkpoint anfitrion usa una mezcla 4/8 bits |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Cabecera estilo safetensors (8 bytes little-endian `uint64` con la longitud de cabecera + JSON) seguida de payload BF16 crudo; `format: mlx-serve-ngram`, sin otros tensores |
| Tamano del fichero | 102.400.491.688 bytes (95,37 GiB); payload de 102.400.491.520 bytes y 168 bytes de cabecera |
| Forma del tensor | `[320001536, 160]` BF16 (320 bytes por fila) |
| Repositorio | 102,4 GB, 0 descargas, 0 likes, creado el 2026-09-27, actualizado el 2026-09-27 |

## Arquitectura y entrenamiento

No hay arquitectura de red que describir: el fichero contiene un unico tensor de embeddings de 320.001.536 filas por 160 dimensiones en BF16, descripto por el autor como tabla n-gram / PLE (per-layer embedding). La nomenclatura de los tensores de origen (`ple.ple_embedding.ngram_embedding.shard_N`) sugiere un mecanismo de embeddings por capa consultado mediante n-gramas, pero el repositorio no documenta el mecanismo de consulta, el numero de filas recuperadas por token ni como se combinan con las activaciones del modelo anfitrion.

El proceso de construccion esta documentado y verificado: concatenacion de 128 tensores BF16 procedentes de los shards `model-00006` a `model-00036` (de 131) y de `ngram-extra.safetensors` del repositorio `True2456/Qwen3.8-Flash-Next-MLX-4bit`. Las comprobaciones declaradas incluyen coincidencia de `dtype` BF16 en todos los tensores fuente, anchura 160, suma exacta de filas (320.001.536), indices de shard contiguos 0..127 sin duplicados y verificaciones aleatorias de bytes entre la salida concatenada y los tensores originales. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni uso de RLHF/DPO, porque no se trata de un entrenamiento sino de una reconstruccion de pesos. Tampoco se documenta ninguna innovacion de decodificacion; el unico aspecto tecnico destacable es el uso de mmap con carga fila a fila y un calentamiento en segundo plano (`MLX_SERVE_NGRAM_WARM=0` lo desactiva).

## Capacidades

- No genera texto por si mismo: es una tabla de pesos que debe instalarse dentro del checkpoint anfitrion `ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit`.
- Proporciona embeddings n-gram en precision BF16, sin escalas ni sesgos de cuantizacion, eliminando el error introducido por la tabla afin de 4 bits del checkpoint original.
- Sustituye a la tabla 4-bit del checkpoint sin cambiar la forma del tensor, por lo que es intercambiable a nivel de fichero.
- Compatible con la ruta de carga MLX Core / mlx-serve, que la mapea en memoria y la calienta en segundo plano.
- Requiere ajustar `config.json` (`ngram_table.bits` de 4 a 16) si el cargador da prioridad a la configuracion sobre la cabecera de la tabla.
- Permite volver atras de forma trivial restaurando el nombre del fichero de respaldo.
- No se documentan capacidades de tool calling, agentes, vision, audio, modo thinking ni multilingues para este artefacto; dependen integramente del modelo anfitrion, sobre el que no hay informacion en el repositorio.

## Casos de uso

- Recuperacion de precision en inferencia local sobre Apple Silicon: sustituir la tabla 4-bit por la BF16 cuando la calidad de las consultas de embeddings n-gram es critica y se dispone de memoria unificada suficiente (95,37 GiB solo para la tabla).
- Evaluacion del impacto de la cuantizacion de tablas de embeddings: comparar la misma ejecucion con la tabla 4-bit (~30 GB) y con la BF16 (95,37 GiB) permite aislar cuanto de la degradacion observada proviene de la tabla y no del resto de pesos mezclados a 4/8 bits.
- Reproducibilidad de artefactos de pesos: el repositorio documenta el procedimiento de concatenacion y las comprobaciones de integridad (dtype, anchura, suma de filas, indices contiguos, verificaciones de bytes), lo que sirve como plantilla para reconstruir otros tensores fragmentados en shards.
- Investigacion sobre el compromiso memoria/calidad en modelos con embeddings por capa: medir perplejidad y calidad de generacion con la tabla a 4 bits frente a BF16 en el mismo checkpoint y hardware.
- Despliegue en estaciones de trabajo de gran memoria: equipos con 128 GB o mas de memoria unificada pueden mantener la tabla residente y evitar la penalizacion de paginacion desde disco en la primera prompt larga.
- Archivado y auditoria de pesos: el fichero consolidado en un unico tensor con cabecera verificable facilita la inspeccion, el hashing y la preservacion a largo plazo frente a un esquema de 128 shards dispersos.
- Analisis de ancho de banda de memoria y latencia de arranque: el calentamiento en segundo plano y la carga por mmap permiten estudiar el coste de paginar 95,37 GiB desde NVMe en el primer prompt largo tras el arranque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de perplejidad, MMLU, HumanEval, GSM8K ni comparativas de calidad entre la tabla BF16 y la tabla 4-bit. La unica referencia externa encontrada en la busqueda web es un hilo de Reddit sobre tokens por segundo con Qwen3.8-27B, que no aporta cifras especificas de este artefacto ni de su checkpoint anfitrion.

## Requisitos de hardware

- Memoria: 95,37 GiB solo para la tabla (`ngram_table.bin`), a los que hay que sumar el resto de pesos del checkpoint anfitrion, cuya huella no se documenta. Con mmap puede ejecutarse con menos memoria fisica que el tamano del fichero, pero a costa de paginacion desde disco.
- Plataforma: MLX Core / mlx-serve, orientado a Apple Silicon con memoria unificada. No se documenta soporte para CUDA ni para GPU NVIDIA (A100, H100, RTX 4090); ese flujo no es aplicable al cargador descrito.
- Equipos plausibles: Mac Studio con M3 Ultra o M2 Ultra en configuraciones de 128 GB, 192 GB, 256 GB o 512 GB de memoria unificada. Un Mac con 96 GB de memoria unificada no permite mantener la tabla residente junto al resto del modelo.
- Almacenamiento: se recomienda SSD NVMe, dado que el fichero se mapea y se pagina fila a fila (320 bytes por fila); un disco lento penaliza la primera prompt larga tras el arranque.
- Despliegue: MLX Core / mlx-serve exclusivamente. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato (`mlx-serve-ngram` con payload BF16 crudo) es especifico de esta pila.
- Latencia y throughput: no disponibles. El autor advierte de que el primer prompt largo tras el arranque puede ser lento mientras la tabla se pagina, y que MLX Core la calienta en segundo plano (`MLX_SERVE_NGRAM_WARM=0` desactiva ese calentamiento).
- Instalacion: cerrar MLX Core / mlx-serve antes de sustituir el fichero (la tabla se mantiene mmapped mientras esta cargada), renombrar la tabla original a `ngram_table-4bit-backup.bin` y colocar el fichero BF16 como `ngram_table.bin`.

## Comparativa con modelos similares

No hay modelos comparables: este repositorio no es un modelo entrenado, sino una tabla de pesos de un checkpoint concreto. La comparacion relevante es entre las distintas versiones de la misma tabla.

| Artefacto | Precision | Tamano | Forma | Origen | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mjsxi/qwen3.8-flash-next-mlx-bf16-ngram` (este repo) | BF16 sin cuantizar, sin escalas ni sesgos | 95,37 GiB (102.400.491.688 bytes) | `[320001536, 160]` | Reconstruccion local a partir de `True2456/Qwen3.8-Flash-Next-MLX-4bit` | No disponible | Publico en HuggingFace |
| Tabla del checkpoint `ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit` | Afin de 4 bits (peso + escalas + sesgos) | ~30 GB segun el autor (aproximadamente 1/3,2 del BF16) | Misma forma declarada | Checkpoint original | No disponible | Publico en HuggingFace |
| `True2456/Qwen3.8-Flash-Next-MLX-4bit` (origen de los shards) | BF16 en los tensores fuente, fragmentado en 128 shards | No disponible (131 shards en total) | 128 tensores de anchura 160 | Modelo de origen | No disponible | Publico en HuggingFace |

No se dispone de datos de rendimiento comparado entre estas variantes, por lo que no es posible cuantificar la ganancia de calidad de la version BF16 frente a la de 4 bits.

## Limitaciones y advertencias

- No es un modelo ejecutable: es un unico fichero de pesos (`ngram_table.bin`) que solo tiene sentido dentro del checkpoint anfitrion. No puede cargarse como modelo independiente.
- Interoperabilidad muy limitada: el formato es especifico de la pila MLX Core / mlx-serve. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con runtimes CUDA.
- Consumo de memoria elevado: 95,37 GiB de tabla, aproximadamente 3,2 veces la version de 4 bits. Requiere equipos con memoria unificada muy alta para funcionar sin paginacion.
- Penalizacion en el arranque: la carga por mmap implica que la primera prompt larga tras el inicio puede ser lenta mientras se paginan las filas. El calentamiento en segundo plano mitiga el efecto pero no lo elimina y consume recursos.
- Riesgo de configuracion incorrecta: el `config.json` del checkpoint declara `bits: 4` para `ngram_table`; si el cargador da prioridad a la configuracion sobre la cabecera de la tabla, es necesario cambiar ese valor a 16 manualmente o la carga sera incorrecta.
- Licencia no disponible: el repositorio no declara licencia. Dado que el artefacto deriva de pesos de terceros, el uso comercial queda sin base legal clara y debe verificarse en los repositorios de origen antes de cualquier despliegue en produccion.
- Ausencia de evaluacion: no hay benchmarks, mediciones de perplejidad ni comparativas de calidad publicadas, por lo que no puede afirmarse sin medir que la version BF16 mejora la salida del modelo anfitrion.
- Sin informacion sobre idiomas ni sesgos: al no ser un modelo entrenado, no procede analizar sesgos propios, pero los sesgos del sistema final dependen del checkpoint anfitrion, sobre el que no se aporta documentacion.
- Artefacto de terceros no oficial: el autor declara explicitamente no estar afiliado ni a `ddalcu` ni a `True2456`; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.
- Reproducibilidad parcial: las verificaciones de integridad se describen en la model card, pero no se publican hashes ni scripts de verificacion que un tercero pueda reejecutar.

## Enlaces

- Repositorio de este artefacto: https://huggingface.co/mjsxi/qwen3.8-flash-next-mlx-bf16-ngram
- Checkpoint anfitrion: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit
- Repositorio de origen de los shards BF16: https://huggingface.co/True2456/Qwen3.8-Flash-Next-MLX-4bit
- Hilo de Reddit sobre tokens por segundo con Qwen3.8-27B (no especifico de este artefacto): https://www.reddit.com/r/LocalLLaMA/comments/1vqjeub/how_many_tokenssecond_output_are_you_getting_with/
