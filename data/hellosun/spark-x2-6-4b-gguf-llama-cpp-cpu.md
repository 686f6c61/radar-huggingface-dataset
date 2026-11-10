# HelloSun/Spark-x2.6-4b-gguf-llama.cpp-cpu

## Resumen

Spark-X2.6-4B es un modelo de lenguaje de 4,45 mil millones de parámetros desarrollado por XHToken, distribuido originalmente en formato GGUF. Este repositorio concreto, publicado por el usuario HelloSun, no contiene pesos nuevos ni un fine-tuning: es un paquete de inferencia en CPU para llama.cpp que incluye un parche de optimización a nivel de operador y un script de compilación y despliegue en un solo paso. El objetivo es ejecutar el modelo cuantizado Q4_K_M en procesadores Intel Xeon de clase Sapphire Rapids sin GPU.

La aportación técnica es un kernel AVX512-VNNI para `ggml_vec_dot_q4_K_q8_K`, la multiplicación matriz-vector del camino de decodificación cuando los pesos están en Q4_K. El parche reescribe el kernel para el layout real de nibbles de Q4_K, usando `vpermi2d` para reunir los rangos de q8 y `vpdpbusd` para las acumulaciones, manteniendo la acumulación en int32 exacta hasta una única conversión a coma flotante por bloque. El autor reporta que la suite completa de tests de operadores de llama.cpp pasa (24086/24086).

El interés práctico está en el rendimiento medido: sobre una máquina de dos sockets con 40 núcleos y 80 hilos, sin GPU, el decode sube de 29,4 a 35,7 tokens por segundo (+21 %) con flash attention activada y fijación a un solo nodo NUMA, mientras que el prefill alcanza 447 tokens por segundo (+16 %) fijando núcleos físicos. Es un caso de estudio de optimización de inferencia en CPU más que un modelo nuevo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Spark-X2.6-4B; el repositorio solo documenta el runtime llama.cpp) |
| Parámetros totales | 4,45B (según el benchmark del autor) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (configurable vía variable `CTX` en el script de despliegue) |
| Tipos de cuantización | Q4_K_M (3,30 GiB); el parche también menciona kernels Q6_K y Q8_0 en upstream |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Spark-X2.6-4B en la documentación proporcionada: no se especifica si es un transformer denso, un MoE o una arquitectura híbrida, ni el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. El repositorio es un artefacto de despliegue, no una model card del modelo.

La innovación documentada es de runtime. El parche modifica `ggml/src/ggml-cpu/arch/x86/quants.c`, en la función `ggml_vec_dot_q4_K_q8_K`, añadiendo una ruta `__AVX512VNNI__ && __AVX512BW__` que procesa 64 bytes de q4_K por medio bloque con dos instrucciones `vpdpbusd` de producto escalar int8. Los rangos correspondientes de q8 se reúnen con un `vpermi2d` por flujo de nibble, dado que Q4_K empaqueta grupos de 32 bytes donde los nibbles bajos corresponden a sub-bloques pares y los altos a impares. Las escalas de sub-bloque de 6 bits se aplican con un único `vmulld` por flujo y todo el bloque de 256 elementos permanece en int32 exacto hasta una `vcvtdq2ps` más `vfmadd` por bloque. El resto de kernels (VNNI tiled de prefill, Q6_K, Q8_0) se dejan en upstream.

## Capacidades

- Generación de texto conversacional en inglés y chino, servida mediante API compatible con OpenAI (`/v1/chat/completions`).
- Inferencia completamente en CPU, sin dependencia de GPU ni de CUDA.
- Aprovechamiento de instrucciones AVX512, AVX512-VNNI y AMX en procesadores Intel de clase Sapphire Rapids.
- Despliegue reproducible: el script fija una revisión concreta de llama.cpp (`3d94ffe`), aplica el parche y compila con `-march=native`.
- Control de afinidad NUMA mediante `taskset`, con modos recomendados distintos para decode y para prefill.
- Variables de entorno para ajustar puerto, hilos, flash attention, contexto y directorio de trabajo (`PORT`, `THREADS`, `FA`, `CTX`, `WORKDIR`, `SKIP_BUILD`).
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Inferencia on-premise sin GPU: el paquete permite levantar un servidor compatible con OpenAI en el puerto 20100 sobre un servidor Xeon existente, útil en entornos donde no hay aceleradores disponibles o donde el aprovisionamiento de GPU no está justificado para la carga prevista.
- Servicio de decodificación de baja concurrencia y latencia estable: con fijación a un solo nodo NUMA y flash attention, el decode se mantiene en 35,7 t/s con una variación de ±0,71 t/s, un perfil adecuado para asistentes interactivos de un solo usuario o pocos usuarios simultáneos.
- Procesamiento por lotes de prompts largos: el modo de fijación a núcleos físicos alcanza 447 t/s de prefill, por lo que conviene para tareas de resumen, clasificación o extracción sobre documentos largos donde el coste dominante es la fase de prefill y no la generación.
- Evaluación y benchmarking de kernels en CPU: el parche y la metodología con `llama-bench -p 512 -n 128` sirven como referencia reproducible para medir el impacto de kernels AVX512-VNNI en llama.cpp sobre hardware concreto.
- Despliegue en infraestructura con restricciones de exportación de datos: al ejecutarse íntegramente en local, el modelo no requiere enviar prompts a APIs externas, lo que encaja en flujos con datos sensibles que deben permanecer en la red interna.
- Base para ajustes de runtime en producción: las variables `THREADS`, `FA` y `CTX` permiten adaptar el servidor a distintas máquinas; el autor advierte explícitamente de que 80 hilos sin fijar entre ambos sockets degradan el decode a menos de 1 t/s, por lo que la configuración de afinidad es parte obligatoria del despliegue.
- Experimentación con modelos de 4B en chino e inglés: al soportar ambos idiomas, puede emplearse en prototipos bilingües de generación de texto sobre hardware de servidor convencional.

## Benchmarks y rendimiento

Entorno medido por el autor: 2x Intel Xeon clase Sapphire Rapids (ES), 40C/80T, 2 nodos NUMA, sin GPU, 251 GB de RAM. llama.cpp `b1-3d94ffe` (2026-11-09) compilado con `-march=native`. Modelo Spark-X2.6-4B Q4_K_M (3,30 GiB, 4,45B parámetros). `llama-bench -p 512 -n 128`, 40 hilos.

| Configuración | Prefill pp512 (t/s) | Decode tg128 (t/s) |
|---|---|---|
| Baseline: build upstream, sin fijación, FA=0 | 385,3 ± 4,5 | 29,4 ± 2,0 |
| Build final, sin fijación, FA=0 | 346,7 ± 36,1 | 30,3 ± 1,4 |
| Build final, fijado a nodo 0, FA=1 (recomendado para decode) | 353,2 ± 9,3 | 35,66 ± 0,71 |
| Build final, fijado a núcleos físicos (recomendado para prefill) | 447,3 (mejor) | 29,6 ± 1,8 |

Observaciones del autor: el decode mejora un 21 % (29,4 a 35,7 t/s) con FA=1 y fijación a un nodo NUMA; el prefill mejora hasta un 16 % con fijación a núcleos físicos, aunque el host compartido introduce un ruido de ±10-15 % entre ejecuciones en prefill, mientras que el decode fijado a un nodo es estable (±2 %). Con 80 hilos repartidos entre ambos sockets el decode cae por debajo de 1 t/s por planificación cross-NUMA. El ancho de banda medido es de ~300 GB/s agregados en lectura con 40 hilos, y el camino de decode opera a ~100 GB/s efectivos de tráfico de pesos, es decir, está limitado por latencia y sincronización (~400 operaciones de grafo y barreras por token) y no por ancho de banda; por eso el kernel Q4_K más rápido rinde a la par de extremo a extremo y la ganancia real proviene del ajuste de afinidad y de flash attention.

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de 4B comparables ni resultados de calidad que permitan establecer una comparación rigurosa. La única referencia cuantitativa es la comparación interna entre el build upstream de llama.cpp y el build parcheado sobre el mismo hardware, recogida en la sección de benchmarks.

## Limitaciones y advertencias

- El repositorio no contiene pesos propios ni un fine-tuning: es un parche de runtime más un script de despliegue sobre `XHToken/Spark-X2.6-4B-GGUF`. Cualquier evaluación de calidad debe hacerse sobre el modelo base.
- No hay información publicada sobre sesgos, tasa de alucinación ni calidad por idioma del modelo base.
- El soporte lingüístico documentado se limita a inglés y chino; no se garantiza un comportamiento adecuado en castellano.
- El rendimiento medido corresponde a procesadores Intel de clase Sapphire Rapids con AVX512-VNNI y AMX. En CPUs sin AVX512-VNNI la ruta optimizada del parche no se activa y las cifras no son extrapolables.
- Los resultados se obtuvieron en una máquina virtual sobre un host compartido, con ruido de ±10-15 % en prefill entre ejecuciones; conviene revalidar en el hardware de destino.
- La configuración de hilos sin fijación de afinidad puede degradar el decode a menos de 1 t/s en sistemas de dos sockets; la fijación NUMA es un requisito operativo, no una optimización opcional.
- El script fija una revisión concreta de llama.cpp (`3d94ffe`); actualizar el runtime puede requerir readaptar el parche.
- La licencia apache-2.0 se declara en este repositorio, pero debe verificarse por separado en el repositorio del modelo base antes de un uso comercial en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HelloSun/Spark-x2.6-4b-gguf-llama.cpp-cpu
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B-GGUF
- Runtime llama.cpp: https://github.com/ggml-org/llama.cpp (revisión `3d94ffe`)
