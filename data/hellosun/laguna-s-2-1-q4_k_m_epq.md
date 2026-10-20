# HelloSun/laguna-s-2.1-Q4_K_M_EPQ

## Resumen

`HelloSun/laguna-s-2.1-Q4_K_M_EPQ` es una adaptación de inferencia, no un modelo nuevo: aplica la arquitectura de paginación de expertos EPQ (Expert Paging Quantization) sobre el archivo GGUF `Q4_K_M` de `poolside/Laguna-S-2.1-GGUF`. Laguna-S-2.1 es un transformer MoE con 48 capas, 256 expertos enrutados por capa y top-10, cuyo GGUF cuantizado ocupa 96,0 GB, de los cuales 85,36 GiB corresponden a los pesos de los expertos enrutados. El problema que resuelve EPQ es concreto: permitir que ese archivo se ejecute en una máquina con mucha menos RAM que el tamaño del modelo, manteniendo residentes solo los pesos no-expert (attention, dense, shared expert, router, embeddings) y paginando los expertos desde SSD bajo demanda.

El mecanismo consiste en un arena de RAM de tamaño fijo dividida en ranuras (slots) de dos tamaños, 5,06 MiB y 18 MiB, en las que se cargan los tensores `ffn_gate_exps`, `ffn_up_exps` y `ffn_down_exps` del experto seleccionado por el router, usando lecturas `O_DIRECT` desde disco; la acumulación ponderada del MoE se hace con un operador ggml propio. Con 4 GiB de presupuesto de memoria anónima el modelo arranca y decodifica a 0,56 tok/s; con 64 GiB llega a 1,92 tok/s. Es, por tanto, un artefacto de investigación sobre el compromiso RAM/SSD/latencia en MoE dispersos, no una opción de servicio interactivo.

Su relevancia ahora es que demuestra empíricamente un modo de ejecución que los runtimes convencionales no ofrecen: servir un MoE de ~96 GB en CPU con 32-64 GiB de RAM y un NVMe rápido, con mediciones estrictas de memoria (límite duro vía `prlimit --data` y muestreo de RSS anónimo cada 20 ms) y una ablación del top-k que cuantifica el coste en calidad de reducir expertos activos de 10 a 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo `laguna` en el GGUF), 48 capas, 1 capa dense inicial, shared expert, router con `routed_scaling_factor` 2,5 |
| Parametros totales | No disponible (el archivo GGUF `Q4_K_M` ocupa 96,0 GB; los expertos enrutados suman 91.653.931.008 B = 85,36 GiB) |
| Parametros activos | No disponible (el GGUF declara `expert_used_count` = 10 de 256 por capa, pero no se publica el recuento de parámetros activos) |
| Longitud de contexto | 1.048.576 tokens declarados en el GGUF (`context_length`); las pruebas publicadas usan `-c 2048` |
| Tipos de cuantizacion | `Q4_K_M` global; expertos de las capas 1-39 en `Q4_K` (type 12); expertos de las capas 40-47 en `BF16` (type 30) |
| Idiomas soportados | No disponible (la única evaluación de calidad publicada usa un texto en inglés de 799 tokens) |
| Licencia | No disponible en el repositorio; el modelo base es de poolside y sus condiciones no se detallan |
| Formato de pesos | GGUF (`library_name: gguf`) |
| Expertos por capa / activos | 256 / 10 |
| Dimension de embedding | 3.072 |
| FFN de experto | 1.024 (`expert_feed_forward_length`) |
| Tamano de experto en disco | 5.308.416 B (5,06 MiB) en capas 1-39; 18.874.368 B (18 MiB) en capas 40-47 |
| Runtime requerido | Fork `poolsideai/llama.cpp`, rama `laguna`, commit `06f8ceb`, más el parche `0001-epq-laguna.patch` y las fuentes `sdq_*` |
| Presupuesto minimo de RAM | 2 GiB falla (arena insuficiente para un experto grande); 4 GiB es el minimo funcional |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo subyacente es un MoE de 48 capas con 256 expertos enrutados y top-10, dimensión de embedding 3.072 y FFN de experto de 1.024; la capa 0 es dense (`leading_dense_block_count` = 1) e incorpora un shared expert de 1.024. El router aplica un factor de escala de 2,5 sobre las ponderaciones. En el GGUF `Q4_K_M`, las 39 primeras capas con expertos almacenan estos en `Q4_K` (5,06 MiB por experto, tres matrices `ffn_{gate,up,down}_exps` de 1.769.472 B cada una) y las 8 últimas (capas 40-47) los mantienen en `BF16` (18 MiB por experto, 6.291.456 B por matriz). Esa mezcla obliga al pager a gestionar dos tamaños de ranura, donde los expertos grandes solo entran en ranuras grandes y los pequeños caben en cualquiera.

No se publican datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) ni innovaciones de entrenamiento en la información disponible; este repositorio es una cuantización y un runtime, no un reentrenamiento. La innovación técnica está en la capa de ejecución EPQ: arena de RAM de tamaño fijo con ranuras, lectura de expertos desde SSD con `O_DIRECT` (evitando el page cache para que el presupuesto de memoria sea controlable), expulsión inmediata tras el uso, prefetch desactivable (`EPQ_PREFETCH=0` en todas las pruebas) y un operador ggml a medida para la suma ponderada de las salidas de los expertos. El control se ejerce con variables de entorno: `EPQ_REQUIRE_PAGER`, `EPQ_RAM_BUDGET_MB`, `EPQ_RESERVE_MB`, `EPQ_EXPERT_USED`, además de `--expert-used` en `epq-chat`.

La validación de corrección se plantea en dos niveles: comparación capa a capa del `build_moe_ffn` (entradas `cur`, `selected_experts`, `weights` y salida, volcadas con `EPQ_MOE_DUMP`) contra una reimplementación en NumPy mediante `verify_moe_layer_laguna.py`, y pruebas funcionales del binario. La tabla de errores relativos y correlaciones de esa comparación aparece truncada en la model card, por lo que no se pueden reproducir aquí los valores por capa.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`) en modo chat mediante `epq-chat`.
- Razonamiento y generación con un MoE de 256 expertos y top-10, con la calidad del modelo original siempre que se mantenga el top-k nativo; la ablación a top-4 degrada la perplejidad de 1,9462 a 8,0007 en el test publicado.
- Ejecución en CPU sin GPU: el runtime compilado con AVX-512 (VBMI, VNNI, BF16) procesa el modelo completo paginando expertos desde disco.
- Servicio HTTP: el build incluye el objetivo `llama-server`, por lo que puede exponerse como endpoint compatible con la API de llama.cpp.
- Evaluación de perplejidad integrada: `llama-perplexity` y `--ppl-file` permiten calcular NLL teacher-forced sobre un fichero de texto.
- Instrumentación de routing: volcado de decisiones del router y de pesos por capa (`EPQ_MOE_DUMP`) para verificación numérica.
- Ajuste de top-k en tiempo de ejecución sin reescribir el GGUF, sobrescribiendo a la vez el grafo de llama y el pager.
- No se documentan capacidades de visión, audio, tool calling, function calling ni modos de razonamiento explícito en la información disponible.

## Casos de uso

- Inferencia de un MoE de ~96 GB en servidores sin RAM suficiente: con 32 GiB de presupuesto se obtienen 2,00 tok/s y 1020 MB de lectura de SSD por token, lo que permite ejecutar el modelo en máquinas de 32-64 GiB que de otro modo no podrían cargarlo.
- Generación batch nocturna: a ~2 tok/s sostenidos se pueden producir del orden de 50.000-60.000 tokens en una ventana de 8 horas, suficiente para síntesis de datos, aumento de corpus o generación de borradores que no requieren interactividad.
- Procesado offline de documentos largos: el GGUF declara 1.048.576 tokens de contexto, de modo que un pipeline por lotes puede ingerir expedientes o libros completos aprovechando la ventana, aceptando latencias de segundos por token.
- Investigación sobre paging de expertos en MoE: el repositorio incluye `strict_bench.py` y los resultados por nivel de RAM, lo que permite reproducir curvas de hit rate, evictions y tráfico de SSD y compararlas con otras políticas de caché.
- Verificación de corrección de kernels: `EPQ_MOE_DUMP` más la comparación con NumPy sirven como banco de pruebas para validar implementaciones de `build_moe_ffn` y de acumulación ponderada en ggml.
- Entornos air-gapped o sin GPU: al ser inferencia CPU con pesos en disco, encaja en máquinas aisladas con buen NVMe donde no se pueden desplegar aceleradores.
- Docencia y demostración de routing MoE: la instrumentación permite mostrar, token a token, qué expertos se seleccionan y cuánto tráfico genera cada decisión.
- Medición del compromiso calidad/velocidad: la ablación top-10 frente a top-4 con perplejidad y throughput sirve para decidir si una aplicación tolera reducir expertos activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MT-Bench) en la información disponible. Los datos publicados son medidas de throughput, tráfico de disco y perplejidad del runtime EPQ.

Barrido con límite duro de RAM (`prlimit --data`, `EPQ_RESERVE_MB=2048`, `-c 2048 -b 128 -t 16`, `-n 16`, greedy):

| Límite de RAM | Arena | Ranuras (pequeñas/grandes) | Cobertura de expertos | Pico anónimo | Pico RSS | Decode (tok/s) | Lectura SSD |
|---|---|---|---|---|---|---|---|
| 2 GiB | No arranca | — | — | 280 MB | 286 MB | — | — |
| 4 GiB | 1,94 GiB | 240 (180/60) | 2,3 % | 2.980 MB | 6.858 MB | 0,56 | 3.648 MB/token |
| 8 GiB | 5,69 GiB | 804 (668/136) | 6,7 % | 6.818 MB | 10.697 MB | 0,83 | 2.456 MB/token |
| 16 GiB | 13,7 GiB | 1.932 (1.604/328) | 16,0 % | 15.013 MB | 18.891 MB | 1,11 | 1.792 MB/token |
| 32 GiB | 29,7 GiB | 4.187 (3.475/712) | 34,8 % | 31.397 MB | 35.275 MB | 2,00 | 1.020 MB/token |
| 64 GiB | 57,7 GiB | 8.134 (6.750/1.384) | 67,6 % | 60.073 MB | 63.950 MB | 1,92 | 538 MB/token |

Ablación de top-k (`-n 64`, `-c 2048 -b 128 -t 16`, `EPQ_PREFETCH=0`; 64 GiB con `EPQ_RESERVE_MB=6144`, 16 GiB con 2048):

| Límite de RAM | top-k | Decode (tok/s) | Lectura SSD | Hit rate | Evictions | Peticiones de experto | Perplejidad |
|---|---|---|---|---|---|---|---|
| 64 GiB | 10 (original) | 2,42 | 305 MB/token | 78,4 % | 64 | 35.176 | 1,9462 |
| 64 GiB | 4 | 3,52 | 242 MB/token | 69,0 % | 0 | 14.598 | 8,0007 |
| 16 GiB | 10 (original) | 1,30 | 1.561 MB/token | 49,0 % | 15.998 | 35.176 | — |
| 16 GiB | 4 | 3,42 | 481 MB/token | 56,2 % | 4.462 | 14.598 | — |

La perplejidad se calcula con NLL teacher-forced sobre un texto en inglés de 799 tokens (inicio de *Alice in Wonderland*). Pasar de top-10 a top-4 acelera 1,45 veces con 64 GiB y 2,63 veces con 16 GiB, reduce el tráfico de SSD un 20,5 % y un 69,2 % respectivamente, pero multiplica la perplejidad por 4,11 y produce repeticiones y derivas en la muestra greedy.

## Requisitos de hardware

- VRAM: no aplica; el runtime documentado es CPU con paginación desde SSD. No se describe ruta GPU en la información disponible.
- CPU: se compila con `-DGGML_NATIVE=OFF` y flags AVX-512 explícitos (`GGML_AVX512`, `GGML_AVX512_VBMI`, `GGML_AVX512_VNNI`, `GGML_AVX512_BF16`, además de AVX2, FMA y F16C). Un procesador sin AVX-512 requeriría recompilar con otro conjunto de instrucciones, algo no documentado.
- RAM: 2 GiB falla explícitamente (el pager rechaza arrancar por arena insuficiente); 4 GiB es el mínimo funcional; 16-32 GiB es el rango con throughput utilizable (1,11-2,00 tok/s); 64 GiB maximiza la cobertura de expertos (67,6 %) pero no mejora el decode respecto a 32 GiB en el barrido publicado (1,92 frente a 2,00 tok/s).
- Almacenamiento: imprescindible NVMe con lectura secuencial alta; el archivo pesa 96,0 GB y debe residir en el disco. El tráfico derivado de las cifras publicadas ronda los 2 GB/s sostenidos tanto a 4 GiB (3.648 MB/token × 0,56 tok/s) como a 32 GiB (1.020 MB/token × 2,00 tok/s), por lo que el rendimiento parece limitado por el ancho de banda del SSD. Con 4 GiB se leen 3,6 GB por token, lo que exige vigilar el TBW del disco en cargas prolongadas.
- Hilos: las medidas usan `-t 16`.
- Despliegue: exclusivamente mediante el fork `poolsideai/llama.cpp` (rama `laguna`, commit `06f8ceb`) parcheado con `0001-epq-laguna.patch` y las fuentes `sdq_*.h/.cpp`; se construyen los objetivos `epq-chat`, `llama-server` y `llama-perplexity`, y existe un `build.sh` de conveniencia. No hay soporte documentado en vLLM, TGI, Ollama ni en llama.cpp upstream.
- Latencia: 0,56 tok/s a
