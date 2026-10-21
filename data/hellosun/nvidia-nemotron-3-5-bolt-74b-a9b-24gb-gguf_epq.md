# HelloSun/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF_EPQ

## Resumen

`HelloSun/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF_EPQ` no es un modelo con pesos, sino un repositorio de código y resultados experimentales que porta **EPQ (Expert Paging Queue) v2** al GGUF `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF`, un transformer de mezcla de expertos (MoE) de 74B parámetros totales y 9B activos cuantizado en IQ2_XXS. EPQ mantiene los expertos enrutados en SSD y los carga bajo demanda en un arena de RAM, sin modificar el GGUF, sin reconvertir cuantizaciones y sin depender de GPU. El repositorio pesa 0.0 GB porque no incluye pesos: solo parches, scripts, logs y artefactos de medida.

El problema que resuelve es concreto: la ejecución nativa en llama.cpp con mmap necesita unos 21,12 GiB de RSS para este modelo, lo que deja fuera máquinas de 8 o 16 GiB. Con EPQ v2 y un arena de 2,5 GiB, el pico de RSS baja a 7,31 GiB y el modelo sigue generando a 4,80 t/s en un Xeon 8559C de 16 vCPU sin GPU; con 32 GiB de RAM y precarga de los 13.824 expertos se alcanzan 7,80 t/s, un 91 % del rendimiento nativo.

Es relevante ahora porque demuestra inferencia de un MoE de 74B en CPU con presupuesto de memoria acotado y sin swap, con validación numérica frente a la ruta nativa (diferencia máxima de 1,40e-09 en la salida de la primera capa de expertos y decodificación greedy idéntica en 24 tokens). La licencia del repositorio es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); inferencia mediante llama.cpp con paginación de expertos EPQ v2 |
| Parámetros totales | 74B |
| Parámetros activos | 9B |
| Longitud de contexto | No disponible en la información; las pruebas se ejecutan con `-c 2048` |
| Tipos de cuantización | IQ2_XXS (GGUF del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (el repositorio no contiene pesos; deben descargarse del modelo base) |
| Expertos enrutados | 13.824 |
| Tamaño del repositorio | 0,0 GB (solo código y resultados) |
| Librería | llama.cpp |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es un MoE de NVIDIA con 74B parámetros totales y 9B activos, con 13.824 expertos enrutados, distribuido como GGUF IQ2_XXS. EPQ v2 no altera la arquitectura ni los pesos: actúa como una capa de paginación en el runtime de llama.cpp. Los expertos enrutados residen en SSD y se copian a un arena en RAM cuando se necesitan; los expertos compartidos y las capas de atención quedan fuera del paginador. El proyecto no modifica el GGUF, no realiza conversión de cuantización y no depende de GPU.

La innovación técnica está en la gestión del arena. Con 32 GiB o más, EPQ precarga los 13.824 expertos (`SDQ_PRELOAD=1`, activado por defecto) y durante el decode usa **row-parallel**: divide las 2.048 columnas de salida de cada par `(experto, token)` en bloques de 16 columnas repartidos entre 16 hilos, emulando el `mul_mat_id` nativo y usando todos los núcleos. Con 8 o 16 GiB no caben todos los expertos y el sistema cae automáticamente al **modo C** (un experto por hilo, solapando lectura de SSD y cómputo), donde prima el solapamiento E/S-CPU sobre el paralelismo por filas. Respecto a EPQ v1, la precarga y el row-parallel elevan el rendimiento en 32 GiB de 5,20 a 7,80 t/s. No se dispone de datos sobre tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de tipo factual, con modo de pensamiento visible (`[Start thinking]`) en las respuestas.
- Soporte de visión mediante `mmproj` y `llama-server --mmproj`, con API compatible con OpenAI; probado con descripción de imágenes.
- Inferencia completamente en CPU, sin GPU, con presupuesto de RAM configurable (arena de 2,5 a 18 GiB).
- Paginación de expertos desde SSD con precarga opcional y paralelismo por filas configurable (`SDQ_ROW_PARALLEL`).
- Ejecución determinista verificada: con `--temp 0`, la salida greedy coincide token a token con la ruta nativa.
- Integración con el ecosistema llama.cpp (`llama-cli`, `llama-server`).
- Capacidades multilingües: no disponible en la información.
- Tool calling y razonamiento multi-paso en agentes: no disponible en la información.

## Casos de uso

- **Inferencia de un MoE de 74B en servidores sin GPU y con 8 GiB de RAM**: configurando `SDQ_ARENA_MB=2560`, el pico de RSS queda en 7,31 GiB y se obtienen 4,80 t/s de generación, lo que permite desplegar el modelo en máquinas que con mmap nativo harían thrashing de page cache.
- **Servidores de 32 GiB con rendimiento casi nativo**: con arena de 18 GiB y precarga de los 13.824 expertos se alcanzan 7,80 t/s (91 % del nativo) y 12,10 t/s de prompt, sin lecturas de SSD durante el decode.
- **Descripción de imágenes en CPU**: mediante `llama-server --mmproj` y un arena de 6 GiB, el sistema procesa imagen y prompt con 14,15 GiB de RSS, 15,31 t/s de prompt y 4,99 t/s de generación, devolviendo respuestas coherentes por API compatible con OpenAI.
- **Investigación y reproducción de técnicas de expert offloading**: el repositorio incluye parches, scripts y los ficheros `results/bench_epqv2.csv`, `results/native_default_lowmem.csv` y los `.raw`, lo que permite repetir las medidas y comparar modos de carga.
- **Auditoría de implementaciones MoE**: el artefacto `results/moe_ab.txt` documenta la comparación numérica entre la ruta nativa y EPQ (diferencia máxima de 1,40e-09, correlación 1,000000000), útil como referencia de corrección en validaciones de kernels.
- **Entornos air-gapped o edge con NVMe**: al no requerir GPU ni servicios externos, el binario de llama.cpp con EPQ puede desplegarse en servidores aislados con almacenamiento NVMe y RAM limitada.
- **Prototipos de asistentes con contexto corto**: las pruebas con `-c 2048` confirman viabilidad para turnos de conversación y preguntas factuales en CPU, aunque el contexto máximo del modelo no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son de throughput y corrección numérica.

Máquina de prueba: Xeon 8559C (16 vCPU), 2 TB de RAM, NVMe SSD, sin GPU. Configuración común: `-c 2048 -b 128 -ub 128 -t 16 --temp 0`, prompt "Explain in one sentence why the sky is blue.", `-n 64`. Mediana de 3 ejecuciones por configuración en la misma sesión; host compartido con carga de 60-100, variación estimada de ±10 %.

| Configuración | Límite de RAM | Arena | RSS pico | Swap | Prompt (t/s) | Generación (t/s) | Relativo a nativo |
|---|---:|---:|---:|---:|---:|---:|---:|
| llama.cpp nativo (mmap, pesos residentes) | Sin límite | — | 21,12 GiB | 0 | 16,00 | 8,60 | 1,00x |
| EPQ v2 | 8 GiB | 2,5 GiB | 7,31 GiB | 0 | 9,80 | 4,80 | 0,56x |
| EPQ v2 | 16 GiB | 10 GiB | 14,82 GiB | 0 | 9,80 | 5,20 | 0,60x |
| EPQ v2 | 32 GiB | 18 GiB | 22,82 GiB | 0 | 12,10 | 7,80 | 0,91x |
| EPQ v2 | 64 GiB | 18 GiB | 22,82 GiB | 0 | 12,40 | 7,30 | 0,85x |
| EPQ v2 (`SDQ_ROW_PARALLEL=0`) | 32 GiB | 18 GiB | 22,81 GiB | 0 | 12,00 | 6,10 | 0,71x |

Visión (`llama-server --mmproj`, imagen Mona Lisa, prompt "What is in this image? Answer in one sentence."):

| Configuración | RSS pico | Prompt (t/s) | Generación (t/s) |
|---|---:|---:|---:|
| llama.cpp nativo | 23,24 GiB | 24,28 | 8,48 |
| EPQ (arena 6 GiB) | 14,15 GiB | 15,31 | 4,99 |

Corrección numérica (primer nivel de expertos enrutados, 4 tokens × 1024 latentes): diferencia máxima absoluta de 1,40e-09 con un valor máximo de 0,0103 y correlación 1,000000000; la salida greedy de 24 tokens es idéntica entre ambas rutas.

## Requisitos de hardware

- **RAM mínima práctica**: 8 GiB con `SDQ_ARENA_MB=2560` (RSS de 7,31 GiB, 4,80 t/s). La configuración por defecto con arena automática de 4 GiB produce 8,81 GiB de RSS y se sale del límite de 8 GiB.
- **16 GiB**: arena de 10 GiB, RSS de 14,82 GiB, 5,20 t/s.
- **32 GiB**: arena de 18 GiB con precarga de todos los expertos, RSS de 22,82 GiB, 7,80 t/s, sin lecturas de SSD durante el decode.
- **64 GiB o más**: no aporta mejora (7,30 t/s, dentro del ruido respecto a 32 GiB).
- **Ruta nativa**: requiere unos 21,12 GiB de RSS con mmap; `-lm none` necesita un buffer anónimo contiguo de 20.990,75 MB, por lo que falla en máquinas de 8 o 16 GiB.
- **GPU**: no se requiere ninguna; EPQ es CPU-only. No hay datos de rendimiento con aceleración GPU.
- **CPU**: 16 vCPU en el equipo de prueba (Xeon 8559C). Con menos hilos, el row-parallel reparte las columnas entre los hilos disponibles, pero no se publican cifras para otras configuraciones.
- **Almacenamiento**: NVMe SSD para los expertos paginados en configuraciones de 8 y 16 GiB; con 32 GiB o más la precarga elimina el acceso a disco durante el decode.
- **Despliegue**: llama.cpp (`llama-cli`, `llama-server`), con las variables `SDQ_PAGER`, `SDQ_ARENA_MB`, `SDQ_PREFETCH`, `SDQ_PRELOAD`, `SDQ_ROW_PARALLEL` y `SDQ_RAM_BUDGET_MB`.
- **Latencia y throughput**: 9,80-12,40 t/s de prompt y 4,80-7,80 t/s de generación según configuración; ±10 % según la carga del host.
- **Visión**: requiere `mmproj` cargado de forma independiente por `tools/mtmd`; con arena de 6 GiB el RSS es de 14,15 GiB.

## Comparativa con modelos similares

No hay datos en la información proporcionada sobre otros modelos de la misma categoría (MoE de ~70-80B con ~9B activos) que permitan una comparación de parámetros, contexto, rendimiento o licencia. La comparación disponible es contra la ejecución nativa del mismo modelo en llama.cpp, que es la referencia directa de EPQ v2:

| Aspecto | llama.cpp nativo (mmap) | EPQ v2 (32 GiB) | EPQ v2 (8 GiB) |
|---|---|---|---|
| RSS pico | 21,12 GiB | 22,82 GiB (arena 18 GiB) | 7,31 GiB (arena 2,5 GiB) |
| Generación | 8,60 t/s | 7,80 t/s | 4,80 t/s |
| Prompt | 16,00 t/s | 12,10 t/s | 9,80 t/s |
| Viabilidad real en 8 GiB | Thrashing de page cache; no práctico | No cabe | Sí |
| Uso de SSD durante decode | Continuo por page faults | Ninguno (precarga) | Continuo (modo C) |
| Dependencia de GPU | Ninguna | Ninguna | Ninguna |
| Licencia | MIT (repositorio EPQ) | MIT | MIT |

## Limitaciones y advertencias

- **El repositorio no contiene pesos**: solo código y resultados; es obligatorio descargar el GGUF desde `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF`.
- **Riesgo de alucinación**: no evaluado
