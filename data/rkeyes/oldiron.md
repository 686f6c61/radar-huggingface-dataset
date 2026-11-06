# rkeyes/OldIron

## Resumen

OldIron es un motor de inferencia para `llama.cpp`, desarrollado por el usuario rkeyes, orientado a hardware antiguo que los motores actuales han dejado de soportar. No es un modelo de lenguaje en sentido estricto: es una línea de producto que empaqueta kernels optimizados y configuraciones de ejecución para servir pesos de terceros en máquinas con CPU Sandy Bridge-EP (solo AVX1) y GPU de gama media. La variante publicada, OldIron-AVX, está validada sobre dos HP Z820 con dos Xeon E5-2665 y 32 GB de DDR3, con o sin una RTX 5060 Ti de 16 GB.

El repositorio de Hugging Face no contiene pesos: el autor indica explícitamente que los pesos son de terceros y no se distribuyen. Lo que se publica es el motor, los kernels (W1 GEMV, W3 AVX1) y los resultados medidos. El modelo de referencia empleado en las pruebas es un fichero de pesos de tipo 35B-A3B (arquitectura MoE con aproximadamente 35 000 millones de parámetros totales y unos 3000 millones activos, según la nomenclatura habitual), en cuantizaciones IQ3_S (3,66 bpw) y Q4_0 (4,50 bpw).

La relevancia actual es acotada pero concreta: demuestra hasta dónde se puede exprimir una plataforma de 2011-2012 con AVX1 y sin AVX2, FMA ni F16C. El autor retracta públicamente una proyección inicial de "~3x" y documenta que la mejora real del kernel es del +13,5 % a formato fijo y +6,4 % neta, mientras que el gran salto (6,7x en decodificación y 29x en prefill) proviene de la ruta GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de inferencia sobre `llama.cpp`; pesos de referencia tipo MoE 35B-A3B (híbrido con atención DeltaNet según las notas de KV) |
| Parametros totales | 35B en el fichero de pesos de referencia (no incluido en el repositorio) |
| Parametros activos | ~3B (nomenclatura A3B del fichero de referencia) |
| Longitud de contexto | Hasta 32768 tokens en la configuración medida con GPU (`-c 32768`) |
| Tipos de cuantizacion | IQ3_S (3,66 bpw), Q4_0 (4,50 bpw); KV en f16 y q8_0 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF (compatible con `llama.cpp`) |

## Arquitectura y entrenamiento

OldIron no entrena ningún modelo: es un motor de inferencia derivado de `llama.cpp` con kernels propios para CPU. La pieza central es el kernel W3 AVX1, que implementa la operación GEMV/GEMV-like sobre cuantización Q4_0 usando únicamente el conjunto de instrucciones AVX1 (sin AVX2, FMA, F16C ni BMI2). El kernel W1 GEMV alcanza 4,4 GMAC/s por núcleo desde DRAM y 8,9 / 18,1 GMAC/s cuando los datos residen en L1 (1 y 2 filas respectivamente), con resultados verificados contra una referencia escalar en aritmética entera exacta.

El trabajo de ingeniería se centró en medir y descartar palancas de rendimiento. Se probaron y revirtieron: GEMM con corrección elevada (-40 % in situ por las ~1,9 millones de llamadas pequeñas a `vec_dot` por token), batching GEMM de 4 filas, decodificación especulativa con un draft de 0,8B (-7 %), granularidad de chunks NUMA en decodificación (-7 %), GEMM tileado de K-quant en lugar de Q4_0 + `vec_dot` (-44 % en prefill) y cambio de `lm_head` de Q6_K a Q4_0 (0 %). También se comprobó que el interleave NUMA aporta 0 % en el motor real, pese a un +59 % en un microbenchmark de streaming de 64 MB. El compilador también se exploró: gcc resultó el mejor, con clang 18 un 9 % por debajo e icx 2026 un 15,5 % por debajo.

## Capacidades

- Generación de texto en inglés mediante pesos GGUF de terceros cargados en `llama.cpp`.
- Inferencia en CPU pura (carril A, `-ngl 0`) sobre Xeon con AVX1, sin necesidad de GPU.
- Inferencia con offload parcial a GPU (carril B, `-ngl 99`) con reparto de capas MoE mediante `-ncmoe`.
- Ejecución con presupuesto de VRAM de 8 GB (carril C, según la tabla de lanes de la model card).
- Cuantización de KV cache en f16 y q8_0.
- Prefill y decodificación medidos de forma reproducible con `llama-bench` y un harness propio.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo thinking como características del motor.

## Casos de uso

- Recuperar estaciones de trabajo antiguas: un HP Z820 con dos Xeon E5-2665 y 32 GB de DDR3 puede servir un modelo de 35B en IQ3_S a 7,45 t/s, suficiente para tareas por lotes no interactivas donde no hay presupuesto para hardware nuevo.
- Inferencia por lotes en CPU sin GPU: el carril A permite procesar colas de generación de texto en servidores sin acelerador, con prefill de ~29,9 t/s en pp512 y decodificación de ~7,9 t/s.
- Despliegue con GPU de gama media y contexto largo: con una RTX 5060 Ti de 16 GB y `-ncmoe 10`, se obtienen 832,9 t/s de prefill y 52,5 t/s de generación a 32k de contexto, adecuado para resumir documentos largos (se midió con un prompt de 140 KB).
- Ajuste fino de presupuesto de VRAM: la opción `-ncmoe 12` deja 1,4 GB de margen a cambio de un 2 % de rendimiento, útil cuando el mismo equipo debe atender otras tareas gráficas.
- Laboratorio de optimización de kernels: los resultados documentados en `kernels/RESULTS.md` sirven como referencia para quien quiera medir el impacto real de cambios en `llama.cpp` sobre AVX1, evitando repetir palancas ya descartadas.
- Evaluación de viabilidad de hardware legado: permite decidir con datos si merece la pena mantener un parque de máquinas Sandy Bridge-EP frente a migrar a hardware con AVX2/AVX-512.

## Benchmarks y rendimiento

| Configuración | Prefill (t/s) | Generación (t/s) | VRAM pico |
|---|---|---|---|
| CPU, motor stock, IQ3_S 3,66 bpw, `-ngl 0 --no-op-offload -t 24` | — | 7,45 ± 0,04 | — |
| CPU, motor stock, Q4_0 4,50 bpw | — | 6,99 ± 0,47 | — |
| CPU, kernel W3 AVX1, Q4_0 (bench) | — | 7,86 ± 0,08 | — |
| CPU, kernel W3 AVX1, Q4_0 (harness) | — | 7,93 ± 0,02 | — |
| CPU, prefill pp128 / pp512 / pp4096 | 29,70 / 29,9 / 28,0 | — | — |
| GPU, `-ngl 99 -ncmoe 10 -t 24 -c 32768`, KV f16 | 832,9 | 52,5 | 15339 MiB |
| GPU, misma config + KV q8_0 | 839,2 | 48,3 | 15339 MiB |
| GPU, `-ncmoe 12 -t 24` | 731,7 | 51,6 | 14465 MiB |
| CPU only (fallback) | 29,9 | 7,86 | — |

Medido sobre HP Z820 (2× Xeon E5-2665, 32 GB DDR3, RTX 5060 Ti) con `nice -n 19` y equipo verificado inactivo entre brazos. El kernel W1 GEMV alcanza 4,4 GMAC/s por núcleo desde DRAM. El techo de prefill se estima en 85-90 % del límite int8 medido de 170 GMAC/s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- CPU mínima soportada: Xeon E5-2665 (Sandy Bridge-EP, AVX1; sin AVX2, FMA, F16C ni BMI2).
- GPU mínima soportada: RTX 3060 de 8 GB (sm_86); la configuración medida usa una RTX 5060 Ti de 16 GB (sm_120).
- RAM: 32 GB de DDR3 en la máquina de referencia; el fichero Q4_0 ocupa ~19 GiB frente a 15,7 GiB de IQ3_S.
- VRAM: 15339 MiB con `-ncmoe 10` a 32k de contexto (solo 508 MiB de margen); 14465 MiB con `-ncmoe 12` (1,4 GB libres).
- No cabe en GPUs consumer de 8 GB con el modelo de 35B completo; el carril C está pensado para un presupuesto de 8 GB, pero la model card está truncada en ese punto y no detalla la configuración.
- Despliegue: `llama.cpp` (única librería declarada), con binarios propios del proyecto.
- Throughput: 7,86-7,93 t/s en CPU con el kernel W3; 52,5 t/s de generación y 832,9 t/s de prefill en GPU.

## Comparativa con modelos similares

| Motor / solución | Plataforma objetivo | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|
| OldIron-AVX | Xeon AVX1 + GPU sm_86/sm_120 | 7,93 t/s CPU; 52,5 t/s GPU (35B-A3B) | GPL-3.0 | Hugging Face (sin pesos) |
| `llama.cpp` stock | Multiplataforma, AVX2/AVX-512 en adelante | 7,45 t/s CPU en el mismo equipo (IQ3_S) | MIT | Amplia |
| OldIron-Core2 (planificado) | SSE4.1/SSSE3 (2007), sin GPU | No iniciado | GPL-3.0 | No disponible |

La comparación con otros motores de inferencia para hardware legado no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye pesos: es un motor y un conjunto de resultados, no un modelo listo para usar.
- Solo soporta inglés según los metadatos del repositorio.
- La licencia GPL-3.0 es copyleft fuerte; su integración en productos propietarios requiere revisión legal y puede obligar a liberar el código derivado.
- El autor retracta públicamente varias afirmaciones de la primera versión del README (proyección de ~3x, +59 % por NUMA, 3-5x de margen de ancho de banda, mejora por `lm_head` Q4_0); conviene no citar esas cifras.
- El paso a Q4_0 mejora la velocidad pero aumenta el tamaño del fichero de 15,7 GiB a ~19 GiB, lo que puede no caber en máquinas de 32 GB con otros procesos activos.
- A 32k de contexto con `-ncmoe 10` solo quedan 508 MiB de VRAM libre, lo que deja poco margen para picos o para otras aplicaciones en la misma GPU.
- La cuantización de KV a q8_0 supone una pérdida neta de rendimiento (-8 %) en esta configuración por el coste de dequantización del KV híbrido DeltaNet (~12 KB/token).
- El rendimiento en CPU está cerca del techo de la ISA AVX1: el propio autor estima que cerrar la brecha restante de ancho de banda aportaría como máximo ~1,35x extremo a extremo.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible, al depender de los pesos de terceros.
- La model card está truncada en la descripción del carril C (presupuesto de 8 GB), por lo que esa configuración no está verificada.

## Enlaces

- Hugging Face: https://huggingface.co/rkeyes/OldIron
- Resultados de kernels (referenciado en la model card): `kernels/RESULTS.md` dentro del repositorio
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
