# HelloSun/flint_cpu_opt

## Resumen

`HelloSun/flint_cpu_opt` es un repositorio de optimización para CPU del modelo `RecursiveSI/flint`, un modelo de mezcla de expertos (MoE) de 39.800 millones de parámetros totales y aproximadamente 2.500 millones de parámetros activos por token. El repositorio no contiene pesos nuevos ni modificados: incluye un parche para llama.cpp (`patches/flint-cpu-opt.patch`, sobre el commit base `de5122d87`) y dos ficheros GGUF sobre los que se ha medido la aceleración. Todas las ganancias provienen del código, no de la cuantización.

El parche está orientado a procesadores Intel Xeon con extensiones AVX512-VNNI y AMX, y añade kernels específicos para los formatos de cuantización que usa flint: un `vec_dot` IQ4_XS x Q8_K en AVX512-VNNI (antes solo existía en AVX2 en x86), un `vec_dot` Q4_1 x Q8_1 en AVX-512VL VNNI y la integración de Q4_1 en el GEMM VNNI por teselas para la fase de prefill. Según las mediciones del autor, el parche produce aceleraciones de hasta 1,46x en prefill (pp256) y 1,57x en prefill con contextos largos (pp2048) con el fichero Q4_1, y de 1,15x en decodificación.

La relevancia del repositorio es práctica: flint es un modelo MoE de código con 256 expertos y enrutamiento top-6 en 49 capas, y su inferencia en CPU está limitada por ancho de banda de memoria. El trabajo documenta con detalle dónde se va el tiempo (lecturas DRAM de unos 2 GB por token en decodificación), qué kernels dominan y por qué el margen de mejora adicional es limitado, lo que lo convierte en una referencia útil para quien despliegue modelos MoE grandes en servidores sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (256 expertos, top-6, 49 capas) |
| Parametros totales | 39.785.287.456 (39,8B) |
| Parametros activos | ~2,5B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q4_K_XL (mezcla de Q5_K, IQ4_XS, Q8_0, Q4_K, Q6_K, IQ3_S) y Q4_1 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `RecursiveSI/flint` es un transformer de mezcla de expertos con 256 expertos por capa, enrutamiento top-6 y 49 capas, con 39,8B parámetros totales y unos 2,5B activos por token. Está especializado en código según la model card del repositorio de optimización. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica de este repositorio no está en el modelo sino en los kernels de llama.cpp. El parche añade cuatro cambios principales: (1) un `vec_dot` IQ4_XS x Q8_K en AVX512-VNNI con LUT sin signo (+128) mediante `vpdpbusd`, eliminación de sesgo con `bsums` y prefetch en L2; (2) un `vec_dot` Q4_1 x Q8_1 en AVX-512VL VNNI que procesa dos bloques por iteración, empaqueta en un ymm con `vinserti128` desde memoria y convierte las cabeceras fp16 conjuntamente; (3) la incorporación de Q4_1 al GEMM VNNI por teselas para prefill, con arrays de escala y mínimo f32 por bloque de 32 (`sd`/`sm`) y un flag de kernel `Q41`, lo que eleva pp256 y pp2048 en torno a un 34 % y un 42 % sobre la ruta `vec_dot`; y (4) una fusión del quinto bit de Q5_K con `vptestmb` y suma enmascarada, bit a bit idéntica a la versión anterior y sin cambio de velocidad.

## Capacidades

- Generación de texto y código: el modelo base está descrito como un modelo MoE de código, orientado a tareas de programación.
- Razonamiento multi-paso y bucles de agente: la model card menciona explícitamente "chat and agent loops with a cached prefix" como el escenario donde el fichero Q4_1 destaca por su decodificación más rápida.
- Inferencia en CPU sobre Intel Xeon con AVX512-VNNI y AMX: el parche está diseñado y medido para este hardware.
- Compatibilidad con llama.cpp: ambos ficheros GGUF se ejecutan con llama.cpp y el parche se aplica sobre un commit concreto (`de5122d87`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Servicio de autocompletado de código en servidores sin GPU: con el fichero Q4_1 parcheado se obtienen 55,7 tokens/s de decodificación en un Xeon Platinum 8559C con 16 hilos, suficiente para asistentes de código interactivos con prefijo en caché.
- Procesamiento por lotes de documentación técnica o revisión de código en prefill: el fichero Q4_K_XL parcheado alcanza 296 tokens/s en pp256 y 307 en pp2048, adecuado para tareas donde se procesan prompts largos y la generación es corta.
- Despliegue en infraestructura existente de CPU: al no requerir GPU, el modelo puede integrarse en clústeres Xeon ya disponibles, aplicando el parche y usando `taskset` para fijar hilos.
- Agentes conversacionales con contexto persistente: la decodificación con prefijo cacheado es el caso óptimo para Q4_1, con un 30 % más de velocidad de decodificación que Q4_K_XL y menor lectura de bytes por peso (0,625).
- Evaluación y benchmarking de kernels de cuantización: el repositorio incluye datos crudos en `benchmarks/` y comparaciones de KLD y error L2 frente a referencias en coma flotante, útil para quien valide sus propios parches.
- Investigación sobre cuantización mixta: la mezcla de Q5_K, IQ4_XS, Q8_0, Q4_K, Q6_K e IQ3_S en un solo GGUF de 23,3 GiB sirve como caso de estudio de equilibrio entre tamaño y perplejidad (18,277 ± 0,787 en wikitext-2).

## Benchmarks y rendimiento

Mediciones del autor en Intel Xeon Platinum 8559C, 16 hilos, mediana de 3 rondas intercaladas, tokens/s:

| Fichero | Prefill pp256 | Prefill pp2048 | Decode tg128 | PPL (wikitext-2, 32x512) |
|---|---|---|---|---|
| Q4_K_XL, llama.cpp stock | 231 | 274 | 38,2 | 18,363 ± 0,795 |
| Q4_K_XL, parcheado | 296 | 307 | 42,8 | 18,277 ± 0,787 |
| Q4_1, llama.cpp stock | 183 | 189 | 48,3 | 18,260 ± 0,780 |
| Q4_1, parcheado | 266 | 297 | 55,7 | 18,240 ± 0,779 |

Ganancia del parche frente a llama.cpp stock con el mismo fichero:

| Fichero | pp256 | pp2048 | tg128 |
|---|---|---|---|
| Q4_K_XL | 1,28x | 1,12x | 1,12x |
| Q4_1 | 1,46x | 1,57x | 1,15x |

Precisión (wikitext-2 test, 32 chunks x 512, KLD frente a los logits de referencia del mismo fichero):

| Comparación | KLD | Mismo top-1 | Suelo de ruido |
|---|---|---|---|
| Q4_K_XL, parcheado vs stock | 0,0666 ± 0,0049 | ~92 % | 0,0762 |
| Q4_1, parche vec_dot vs stock | 0,0364 ± 0,0029 | 93,8 % | 0,0385 |
| Q4_1, GEMM por teselas vs parche vec_dot | 0,0372 ± 0,0026 | 94,2 % | 0,0385 |

El autor indica que la KLD está dentro del suelo de ruido del propio llama.cpp stock y que las diferencias no indican defecto. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica, el despliegue es en CPU. El fichero Q4_K_XL ocupa 23,3 GiB y el Q4_1 ocupa 24,2 GiB en disco y en memoria.
- CPU recomendada: Intel Xeon con AVX512-VNNI o AMX; las mediciones se hicieron en un Xeon Platinum 8559C con 16 hilos.
- No cabe en GPU de consumo por tamaño, aunque podría ejecutarse con descarga parcial de capas si se dispusiera de suficiente memoria unificada; no hay datos al respecto en la información proporcionada.
- Opciones de despliegue: llama.cpp con el parche `patches/flint-cpu-opt.patch` sobre el commit `de5122d87`, compilado con `-DGGML_NATIVE=ON`; el script `build.sh` automatiza la clonación, aplicación y compilación. Fijar hilos con `taskset -c 0-15`.
- Ancho de banda de memoria medido en el host de pruebas: 125-175 GB/s con 16 hilos (15 GB/s en un solo hilo). La decodificación lee unos 2 GB de pesos por token (~1,6 GB de atención densa Q8_0, experto compartido y lm_head; ~0,5 GB de los 6 expertos seleccionados), es decir, unos 90 GB/s efectivos.
- Latencia y throughput: 55,7 tokens/s de decodificación y 266-297 tokens/s de prefill con Q4_1 parcheado; variación de ±8 % entre ejecuciones individuales en el host compartido.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| RecursiveSI/flint (base) | 39,8B | ~2,5B | no disponible | Apache 2.0 | safetensors | Modelo original sin parche |
| HelloSun/flint_cpu_opt | 39,8B | ~2,5B | no disponible | Apache 2.0 | GGUF | Parche CPU + dos GGUF |
| HelloSun/Qwen3.6-35B-A3B-GGUF_CPU_OPT | ~35B | ~3B | no disponible | no disponible | GGUF | Referencia de estilo del parche; sus kernels Q4_K/Q5_K/Q6_K VNNI y AMX también aplican a flint |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- El parche está optimizado para Intel Xeon con AVX512-VNNI y AMX; en otras arquitecturas (AMD, ARM, CPUs sin VNNI) las ganancias no están garantizadas y no se han medido.
- Las mediciones se realizaron en un host compartido con variación de ±8 % entre ejecuciones; los números son medianas de 3 rondas.
- flint es muy sensible a diferencias numéricas pequeñas: cambiar solo la ruta de atención del llama.cpp stock produce una KLD similar, según el autor. La causa de esta amplificación no se verificó; se especula con empates en el enrutamiento top-6 de 256 expertos.
- El rendimiento de Q5_K en decodificación es anómalamente bajo (~50 GB/s efectivos frente a 100 de IQ4_XS) y el autor no encontró la causa; un experimento de prefetch de todos los expertos no ayudó y se descartó.
- La decodificación está limitada por ancho de banda de memoria (~90 GB/s efectivos de 125-175 disponibles), por lo que el margen de mejora por kernels es limitado.
- No hay información sobre sesgos, riesgo de alucinación, idiomas soportados ni longitud de contexto del modelo base en la documentación proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se aplica al repositorio de optimización; conviene verificar la licencia del modelo base `RecursiveSI/flint` antes de producción.
- El repositorio tiene 34 descargas y 0 likes en el momento de la consulta, lo que indica validación comunitaria muy limitada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HelloSun/flint_cpu_opt
- Modelo base: https://huggingface.co/RecursiveSI/flint
- GGUF de unsloth: https://huggingface.co/unsloth/flint-GGUF
- GGUF int4 de RecursiveSI: https://huggingface.co/RecursiveSI/flint-int4-gguf
- Repositorio de referencia de estilo: https://huggingface.co/HelloSun/Qwen3.6-35B-A3B-GGUF_CPU_OPT
- llama.cpp (commit base `de5122d87`): https://github.com/ggml-org/llama.cpp
