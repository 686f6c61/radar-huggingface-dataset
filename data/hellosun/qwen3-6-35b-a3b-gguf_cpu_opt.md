# HelloSun/Qwen3.6-35B-A3B-GGUF_CPU_OPT

## Resumen

Qwen3.6-35B-A3B-GGUF_CPU_OPT es un paquete de inferencia publicado por el usuario HelloSun que combina un único fichero GGUF (`Qwen3.6-35B-A3B-UD-Q4_K_M.gguf`, tomado sin modificar de `unsloth/Qwen3.6-35B-A3B-GGUF`) con un parche sobre llama.cpp (commit base `de5122d`) optimizado para ejecutar el modelo en CPU sobre un Intel Xeon Platinum 8559C. No se re-cuantiza ni se alteran los pesos: la totalidad de la mejora procede de código de kernels.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) de 34.660.610.688 parámetros totales (~34,7B) y aproximadamente 3B activos según la nomenclatura A3B del modelo base, con capas de atención y de Gated DeltaNet (arquitectura identificada como `qwen35moe` en llama.cpp). La cuantización es Q4_K_M mixta: además de Q4_K incluye Q5_K en 37 proyecciones down de los expertos, Q6_K en el `lm_head` y en 3 proyecciones down, y Q8_0 en atención, DeltaNet y el experto compartido.

Su relevancia es acotada pero muy concreta: demuestra que un modelo MoE de ~35B en Q4_K_M puede servirse en CPU con un incremento de 1,58x–1,61x en throughput respecto a llama.cpp estándar (39,4 t/s de generación y 273,9 t/s de prefill en pp256), sin degradación medible de calidad. Es material de referencia para equipos que despliegan LLM en servidores sin GPU y quieren saber qué margen real queda en el backend CPU de llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con capas de atención y de Gated DeltaNet; tipo `qwen35moe` en llama.cpp |
| Parámetros totales | 34.660.610.688 (~34,7B) |
| Parámetros activos | ~3B según la nomenclatura A3B del modelo base (cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M mixto: Q4_K general, Q5_K (37 proyecciones down de MoE), Q6_K (`lm_head` y 3 proyecciones down), Q8_0 (atención, DeltaNet, experto compartido); calibración con imatrix |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (un solo fichero `Qwen3.6-35B-A3B-UD-Q4_K_M.gguf`); repositorio de 23,0 GB |

## Arquitectura y entrenamiento

El repositorio no entrena ni afina nada: redistribuye un GGUF ajeno y aporta un parche de código (`patches/qwen36-q4km-cpu-opt.patch`). El modelo es un MoE con experto compartido y proyecciones gate/up por experto, que en el grafo de llama.cpp aparece con el tipo `qwen35moe` e incluye operadores `GATED_DELTA_NET` con estado recurrente (S_v = 128) y puerta escalar. La cuantización Q4_K_M mezcla cuatro tipos de tensor, de modo que cualquier optimización de kernels debe cubrir Q4_K, Q5_K, Q6_K y Q8_0 a la vez. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni las fases de RLHF/DPO del modelo base.

Las innovaciones técnicas documentadas son de implementación: `vec_dot` AVX512-VNNI para Q4_K, Q6_K y un kernel nuevo para Q5_K con prefetch L2 (40/44/48 bloques por delante); desactivación por defecto del repack 8x8 AVX2 de Q4_K (`GGML_REPACK_Q4K=1` lo reactiva); exclusión del `lm_head` Q6_K del búfer AMX para usar VNNI en decodificación (2,5 ms frente a 4,6 ms por token); kernel AMX M=1 con tareas de 32 en anchura cuando N ≤ 1024; grupos de filas de experto 64 → 32 en el prefill MoE para ocupar los 16 hilos; actualización fusionada en dos pasadas para Gated DeltaNet (18 → 9 ms por capa en prefill a 1k tokens); op `ggml_gated_delta_net_cache` que lee y actualiza el estado recurrente en sitio, eliminando un `GET_ROWS` de 2 MB, un `memcpy` y un `CPY` por capa; kernel de prefill Q8_0 denso con acumuladores en registros zmm (bit-idéntico); y reparto multihilo del `GET_ROWS` del estado recurrente (524.288 floats, 30 veces por token). La precisión se mantiene: KLD medio 0,0036 ± 0,0005 frente a llama.cpp estándar, 99,74% de mismo top-1 en 32×512 tokens y PPL(parche)/PPL(stock) = 1,0005 ± 0,0012.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el formato GGUF/llama.cpp lo sitúan como modelo de chat y completado de texto.
- Compatibilidad con endpoints: incluye el tag `endpoints_compatible`, orientado a servir el modelo mediante API HTTP.
- Mezcla de expertos con ~3B parámetros activos por token sobre 34,7B totales, lo que reduce el coste de cómputo por token frente a un modelo denso del mismo tamaño.
- Capa de estado recurrente (Gated DeltaNet) además de atención, lo que permite decodificación con estado cacheado en sitio en el backend CPU.
- Capacidades del modelo base (tool calling, agentes, matemáticas, código, vision, thinking mode) no documentadas en la información disponible.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat interno en servidores sin GPU: con 39,4 t/s de generación en 16 núcleos Xeon, un despliegue en CPU puede atender a un equipo pequeño con latencia tolerable por usuario y sin coste de VRAM.
- Ingesta y resumen de documentación por lotes: el prefill de 273,9 t/s en pp256 y 282,1 t/s en pp2048 permite procesar prompts largos en modo batch durante la noche sobre hardware ya amortizado.
- Sustitución de mmap por `--load-mode mlock` en hosts compartidos: el autor documenta que mmap hacía caer el rendimiento a 18–26 t/s por presión de memoria; fijar los ~22 GB en RAM da un rendimiento estable para servicios en producción.
- Evaluación comparativa de cuantizaciones: al ser un único quant Q4_K_M con métricas KLD y PPL frente a stock, sirve como referencia para decidir si merece la pena bajar a Q4_0 o subir a Q5_K_M en un parque de CPUs con AVX512-VNNI.
- Entornos con requisitos de privacidad o de residencia de datos: inferencia completamente local en CPU, sin GPU ni dependencia de servicios externos, útil en sectores regulados.
- Desarrollo y pruebas en estaciones de trabajo sin acelerador: `llama-cli` con `-t 16 -fa on --load-mode mlock` permite iterar en prompts y plantillas antes de mover la carga a hardware mayor.
- Benchmarking de kernels y perfilado: el parche opcional `optional-profiler.patch` (`GGML_PROF=1`) da tiempos por operador, aprovechable por quien mantenga o audite el backend CPU de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos son de throughput y de deriva numérica, medidos en 16 núcleos (`taskset -c 0-15 -t 16 -fa on --load-mode mlock`, 4 rondas intercaladas) sobre un Intel Xeon Platinum 8559C con carga compartida (load average 50–80).

| Variante | pp256 (t/s) | tg128 (t/s) | pp2048 (t/s) |
|---|---|---|---|
| llama.cpp stock (ub 512) | 170,3 | 24,9 | 177,8 |
| llama.cpp stock (ub 1024) | no disponible | no disponible | 161,3 |
| parche CPU-OPT con `-b 1024 -ub 1024` | 273,9 | 39,4 | 282,1 (mediana 301,2) |

Incrementos medios: 1,61x en pp256, 1,58x en tg128 y 1,59x en pp2048 frente a stock por defecto (1,75x frente a stock con ub 1024). La variación entre ejecuciones individuales es de ±10–15% o más por el host compartido (una ronda de pp2048 dio 211 t/s).

| Métrica de fidelidad (32×512 tokens) | Media KLD | Mismo top-1 |
|---|---|---|
| Parche frente a stock por defecto | 0,0036 ± 0,0005 | 99,74% |
| Ruta stock `--no-repack` frente a stock por defecto | 0,0045 ± 0,0007 | 99,63% |

PPL(parche)/PPL(stock) = 1,0005 ± 0,0012. La decodificación greedy de un prompt corto es byte-idéntica a stock. El autor advierte que el texto de prueba es repetitivo (PPL ~1,05) y por tanto un discriminador débil de calidad absoluta.

## Requisitos de hardware

- RAM: el repositorio ocupa 23,0 GB; `--load-mode mlock` requiere unos 22 GB de memoria bloqueable.
- CPU validada: Intel Xeon Platinum 8559C, 16 núcleos, con AVX512-VNNI y AMX. El autor indica explícitamente que no se ha probado en otras CPU.
- Los kernels nuevos dependen de AVX512-VNNI (y parcialmente de AMX); sin AVX512-VNNI no cabe esperar ninguna de las ganancias publicadas.
- GPU: no se documenta ningún camino GPU para este parche. Los ~21–22 GB de pesos en Q4_K_M exceden los 16 GB de VRAM y en 24 GB (RTX 4090) solo cabrían con ventana de contexto muy reducida; no hay datos de rendimiento en GPU para este paquete.
- Despliegue: llama.cpp compilado con el parche (commit base `de5122d`), mediante `./build.sh` y `llama-cli`; el modelo también debe funcionar con llama.cpp estándar y con Ollama/vLLM a través del GGUF, aunque las optimizaciones se pierden. No hay datos de latencia ni throughput para esas rutas.
- Variables de entorno relevantes: `GGML_REPACK_Q4K=1` (reactiva el repack AVX2), `GGML_AMX_Q6K=1` (restaura la ruta AMX del `lm_head`), `GGML_AMX_Q8_REGACC=0` (vuelve al kernel AMX Q8_0 genérico), `LLAMA_GDN_NO_INPLACE=1` (desactiva el fast path del estado recurrente), `GGML_PROF=1` (perfilado por operador, con parche aparte).
- Throughput de referencia en el hardware validado: 39,4 t/s de generación y 273,9–282,1 t/s de prefill.

## Comparativa con modelos similares

No hay datos publicados que permitan comparar este modelo con alternativas de otros desarrolladores (mismo tamaño o misma tarea). La comparación posible es interna, entre el paquete parcheado y el mismo GGUF sobre llama.cpp estándar:

| Elemento | Parámetros | Cuantización | Contexto | Licencia | Rendimiento (pp256 / tg128) |
|---|---|---|---|---|---|
| Este paquete (parche CPU-OPT) | ~34,7B totales / ~3B activos | Q4_K_M mixto | no disponible | no disponible | 273,9 / 39,4 t/s |
| Mismo GGUF con llama.cpp stock (ub 512) | ~34,7B totales / ~3B activos | Q4_K_M mixto | no disponible | no disponible | 170,3 / 24,9 t/s |
| `unsloth/Qwen3.6-35B-A3B-GGUF` (origen del fichero) | ~34,7B totales / ~3B activos | Q4_K_M y otras variantes GGUF | no disponible | no disponible | no disponible (depende del backend) |

## Limitaciones y advertencias

- Validación limitada a una única máquina: Xeon Platinum 8559C con 16 núcleos. El autor no ha probado otras CPU, y las ganancias dependen de AVX512-VNNI y AMX.
- Resultados ruidosos: el host estaba compartido (load average 50–80) y las ejecuciones individuales varían ±10–15% o más; una ronda de pp2048 bajó a 211 t/s.
- No es bit-exacto: los productos escalares enteros sí lo son, pero cambian el orden de acumulación en coma flotante y la selección de ruta por lote. La verificación de calidad se hizo sobre texto repetitivo, un discriminador débil.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Conviene verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Sin datos de benchmarks de calidad, sesgos, alucinación, idiomas ni longitud de contexto. No hay información sobre evaluación de seguridad.
- Un solo quant disponible (Q4_K_M mixto). No se ofrecen variantes Q5, Q8 ni ficheros sin cuantizar en este repositorio.
- El parche exige mantener una compilación propia de llama.cpp sobre un commit concreto (`de5122d`); actualizar llama.cpp puede romper la compatibilidad del parche.
- `--load-mode mlock` necesita ~22 GB de memoria bloqueable; en hosts con sobreasignación de memoria el proceso puede fallar al arrancar.
- Los resultados negativos documentados incluyen: reparto contiguo de filas por hilo, `--poll 0`, `--no-mmap`, THP, `vec_dot` Q8_0 de 512 bits, decodificación especulativa MTP (~+6%, no adoptada) y una ruta AMX para MoE (descartada por rendimiento).
- El repositorio registra 0 descargas y 2 likes; es un artefacto de investigación sin validación independiente de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HelloSun/Qwen3.6-35B-A3B-GGUF_CPU_OPT
- Modelo base (GGUF de origen): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- llama.cpp (backend sobre el que se aplica el parche, commit base `de5122d`): https://github.com/ggml-org/llama.cpp
- Ficheros citados en la model card (no enlazados externamente): `benchmarks/q4km.jsonl`, `benchmarks/summary.md`, `benchmarks/kld_*.log`, `benchmarks/mtp-optional.txt`, `patches/qwen36-q4km-cpu-opt.patch`, `optional-profiler.patch`, `build.sh`
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a una empresa de climatización y a una tienda de ropa homónimas, sin relación con este artefacto.
