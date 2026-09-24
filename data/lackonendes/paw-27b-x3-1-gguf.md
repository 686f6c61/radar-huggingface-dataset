# lackonendes/PAW-27B-X3.1-GGUF

## Resumen

PAW-27B-X3.1 es un archivo GGUF cuantizado de `Qwen/Qwen3.8-27B`, publicado por el usuario lackonendes. No es un modelo entrenado desde cero, sino una cuantización trellis fraccional a 3,5 bits por peso (K3.5) que comprime el modelo base de ~27.000 millones de parámetros hasta 12.346.158.560 bytes (11,50 GiB), lo que permite servirlo en una única GPU de 24 GB con una ventana de contexto de 262.144 tokens.

La relevancia técnica está en el códec: 395 de las 400 matrices cuantizadas se almacenan a 3,5 bits reales por peso (formato trellis fraccional de exllamav3, KA = 3, máscara 0xAAAA) y solo 5 en K3, frente al archivo anterior PAW-27B-X3, que mezclaba tensores de 3 y 4 bits. El autor reporta una reducción del error de predicción de código (KL frente a Q8_0) del 20,7% en el conjunto `chatcode` y del 19,0% en `rawcode` respecto a ese archivo previo, con intervalos de confianza del 95% que no cruzan cero.

El coste de esa mejora es la portabilidad: el archivo necesita el runtime `llama-paw` (commit `4b936837b` o posterior) y no se puede leer con llama.cpp estándar. Además, las mediciones de velocidad no se han publicado todavía y buena parte de la tabla de benchmarks figura como pendiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cuantización trellis fraccional (formato exllamav3, KA = 3, máscara 0xAAAA) sobre el modelo base Qwen/Qwen3.8-27B; la arquitectura interna del base no se detalla en la información |
| Parámetros totales | 1.924.404.480 según el metadato de safetensors de HuggingFace; la denominación (27B) y el tamaño del archivo (11,50 GiB) apuntan a ~27.000 millones, por lo que el dato no es coherente y no está confirmado |
| Parámetros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | 262.144 tokens en una GPU de 24 GB, con `-ub 1024` |
| Tipos de cuantización | GGUF trellis a 3,5 bits por peso: 395 de 400 matrices cuantizadas a 3,5 bpw reales y 5 en K3; caché K/V en `q4_0` en la configuración de servicio publicada |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`PAW-27B-X3.1.gguf`, 12.346.158.560 bytes / 11,50 GiB); requiere `llama-paw`, llama.cpp estándar no puede leerlo |
| Modelo base | Qwen/Qwen3.8-27B |
| Archivo auxiliar | `Qwen3.8-27B-DFlash2-Q2_K.gguf` (0,67 GiB), drafter de decodificación especulativa |
| Runtime requerido | `llama-paw` rama `main`, commit `4b936837b` o posterior, compilado con CUDA |
| SHA-256 del archivo principal | `4acefd28b247259cd25367ad7915ec6142b5f7a966d69b71599802fa63352599` |
| Tamaño del repo en HuggingFace | 0,7 GB según el metadato; el archivo principal declarado en la model card ocupa 11,50 GiB, por lo que el dato es incoherente |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-24 |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino el resultado de un proceso de cuantización sobre `Qwen/Qwen3.8-27B`. El formato empleado es el trellis fraccional de exllamav3, con KA = 3 y máscara `0xAAAA`, que permite almacenar matrices a 3,5 bits por peso en lugar de la mezcla K3/K4 del archivo anterior. De las 400 matrices cuantizadas, 395 usan K3.5 y 5 se quedan en K3. El decodificador para este formato es nuevo: según el autor, los kernels K1-K4 existentes son idénticos byte a byte (86 de 86 kernels sin cambios verificados con `cuobjdump -sass`) y se añaden 9 kernels nuevos en `llama-paw`.

El encoder también cambió: se usó exllamav3 v1.5.1 con refinamientos propios, activando el reajuste de escalas y la deriva LDLQ, más rondas adicionales de refit, regularización y LDLQ sobre las proyecciones de atención y de entrada GDN. Las matrices hessianas se recapturaron en las mismas condiciones que el archivo previo y, según el autor, la recaptura reprodujo el trellis archivado de forma bit-exacta en 6 de 6 tensores comprobados. La calibración es el mismo corpus de código con formato de chat de 262.000 tokens usado en la versión anterior.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y el modelo base es de la familia Qwen.
- Generación y predicción de código: la calibración es un corpus de código y las métricas publicadas son de error de predicción de código (KL frente a Q8_0) y benchmarks de código.
- Razonamiento matemático: evaluado con AIME 2026 (30 ítems).
- Razonamiento científico de nivel de posgrado: evaluado con GPQA (198 ítems, resultados aún pendientes).
- Modo thinking configurable por petición: el servidor expone `--reasoning off`, `--reasoning-effort xhigh` y `--reasoning-budget -1`, y los benchmarks se ejecutan con una escalera de fases (P1 sin thinking hasta P6 con 253.952 tokens de cap).
- Instrucciones y formato: se reporta IFBench en versiones previas (34,4% loose / 32,8% strict sobre 64 ítems), pero no sobre este archivo.
- Decodificación especulativa: soportada mediante el drafter DFlash2 (`--spec-type draft-dflash --spec-draft-n-max 5`).
- Contexto largo: hasta 262.144 tokens en una sola GPU de 24 GB.
- Tool calling / function calling: no disponible en la información.
- Capacidades multimodales (visión, audio): no disponibles en la información.

## Casos de uso

- Servicio local de asistencia sobre código en una sola GPU de consumo: con 11,50 GiB de pesos más 0,67 GiB de drafter, el modelo cabe en una RTX 3090 o RTX 4090 de 24 GB y puede exponerse con `llama-server` para autocompletado y chat sobre código sin depender de APIs externas.
- Análisis de repositorios grandes: la ventana de 262.144 tokens permite cargar varios ficheros o un módulo completo en una sola petición, útil para revisiones de código, detección de patrones repetidos o generación de documentación transversal.
- Razonamiento matemático con modo thinking: activando `--reasoning-effort xhigh` y un presupuesto de razonamiento sin límite, el modelo resuelve problemas tipo competición (en AIME 2026 alcanza 29/30 con la unión de fases), adecuado para entornos de investigación que necesitan trazabilidad del razonamiento.
- Experimentación en cuantización trellis: el repositorio documenta métricas KL, hashes, kernels y comandos exactos de reproducción, lo que lo convierte en un banco de pruebas para comparar códecs de cuantización a igualdad de tamaño de archivo.
- Despliegue en laboratorio con hardware limitado: sustituye a un modelo BF16 de 27B que no cabría en 24 GB, manteniendo una ventana de contexto muy superior a la habitual en cuantizaciones de ese tamaño.
- Evaluación comparativa de cuantizaciones con protocolo reproducible: los scripts de la escalera de fases (P1 a P6) y las semillas bootstrap publicadas permiten replicar las comparaciones frente a Q8_0 y frente a builds intermedios.
- Generación de código en pipelines internos: al soportar decodificación especulativa y emisión greedy determinista (`GGML_PAW_GREEDY_IDS=1`), encaja en flujos que requieren salidas reproducibles para tests de regresión.

## Benchmarks y rendimiento

Calidad frente al padre Q8_0 (KL de vocabulario completo, 64 chunks de 2048 tokens, bootstrap con 10.000 remuestreos, semilla 20260911; menor es mejor):

| Conjunto | PAW-27B-X3 3.5-bit (B3.5) | PAW-27B-X3.1 | Cambio | IC 95% de la diferencia | X3.1 mejor en |
|---|---:|---:|---:|---|---:|
| chatcode | 0,02665 | 0,02113 | 20,7% menor | [0,00268, 0,00855] | 52 / 64 chunks |
| rawcode | 0,01792 | 0,01452 | 19,0% menor | [0,00238, 0,00474] | 59 / 64 chunks |

Frente al build intermedio `rB` del mismo tamaño, X3.1 es un 11,4% mejor en chatcode (IC [0,00023, 0,00530]) y un 4,0% mejor en rawcode (IC cruza cero, sin diferencia detectada).

Resultados de la escalera de thinking (ejecución greedy en una GPU; la columna «final» es la unión sobre fases, que el propio autor califica de optimista y no equivalente a una ejecución con ajustes fijos):

| Benchmark | Ítems | X3.1 P1 (sin thinking) | X3.1 final (unión) | PAW-27B-X3 3.5-bit |
|---|---:|---:|---:|---|
| AIME 2026 | 30 | 17 (56,7%) | 29 (96,7%) | no medido |
| GPQA | 198 | pendiente (71 ítems hechos, 57 correctos) | pendiente | no medido |
| MMLU-Pro (subconjunto de 500) | 500 | pendiente | pendiente | 67,4% (337/500, sin thinking, protocolo anterior) |
| IFBench | 150 | pendiente | pendiente | 34,4% loose / 32,8% strict en un conjunto de 64 ítems |
| LiveCodeBench v6 (slice) | 50 | pendiente | pendiente | no medido |

Fases de AIME 2026: P1 17/30, P2 3/8, P3 5/10, P4 3/4, P5 1/1. El último ítem fallado terminó su razonamiento sin respuesta final y la escalera no lo reintenta.

Resultados publicados para el archivo 3.5-bit anterior, que no se han vuelto a ejecutar sobre X3.1 (protocolos distintos, sin thinking):

| Benchmark | PAW-27B-X3 3.5-bit |
|---|---:|
| MMLU-Pro | 67,4% |
| HumanEval | 97,0% |
| HumanEval+ | 92,1% |
| MBPP+ | 78,6% |
| GSM8K | 94% |

Como referencia de escala, la model card del BF16 ThinkingCap-Qwen3.8-27B reporta 98,13% en AIME 2026 como media sobre 32 semillas muestreadas. El autor señala expresamente que ambas cifras no son comparables y que no reclama ninguna tasa de retención.

Velocidad: no medida todavía según la model card.

## Requisitos de hardware

- Pesos: 11,50 GiB el modelo principal más 0,67 GiB del drafter DFlash2, unos 12,17 GiB en total.
- VRAM de inferencia: una GPU de 24 GB es suficiente según el autor, incluido el contexto completo de 262.144 tokens con caché K/V en `q4_0`. No se publican mediciones de VRAM pico.
- GPU validada: RTX 3090 de 24 GB (la usada para los benchmarks). Cualquier GPU con 24 GB de VRAM y soporte CUDA debería ser suficiente en teoría, aunque solo la RTX 3090 está documentada.
- Restricción de prefill: a 262k de contexto, K3.5 no cabe con `-ub 2048`; hay que usar `-ub 1024`.
- Despliegue: exclusivamente `llama-paw` compilado con CUDA desde `main` (commit `4b936837b` o posterior). No hay constancia de soporte en llama.cpp estándar, vLLM, TGI, Ollama o LM Studio; llama.cpp de serie no puede leer el archivo.
- Variables de entorno de la configuración de referencia: `GGML_PAW_X3_GEMV=2`, `GGML_PAW_MMQ_HEAD=1`, `GGML_PAW_GREEDY_IDS=1`, `GGML_PAW_DQ4=0`.
- Parámetros de servicio de referencia: `-fa on -ctk q4_0 -ctv q4_0 -c 262144 -ub 1024 -b 8192 -ubd 256 -ngl 99 -np 1 --no-warmup`.
- Latencia y throughput: no disponibles; el autor indica explícitamente que la velocidad aún no se ha medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PAW-27B-X3.1 (este repo) | ~27B (metadato incoherente: 1.924.404.480) | 262.144 tokens | GGUF trellis 3,5 bpw, 11,50 GiB | Apache 2.0 | HuggingFace; requiere `llama-paw` |
| PAW-27B-X3 3.5-bit | ~27B | no indicado | GGUF trellis mixto K3/K4, 11,50 GiB | no indicada en la información | HuggingFace (mismo autor) |
| Qwen/Qwen3.8-27B (base) | ~27B | no indicado | safetensors (BF16) | no indicada en la información | HuggingFace |
| ThinkingCap-Qwen3.8-27B (BF16) | ~27B | no indicado | BF16 | no indicada en la información | HuggingFace (citado solo como referencia de escala) |

No se dispone de datos de benchmarks comparables entre estas variantes: el propio autor advierte de que los protocolos de medición difieren y de que X3.1 todavía no tiene resultados de MMLU-Pro, HumanEval, MBPP+ ni GSM8K propios.

## Limitaciones y advertencias

- Compatibilidad muy restringida: el archivo no se puede leer con llama.cpp estándar ni, por tanto, con las herramientas que dependen de él. Requiere compilar `llama-paw` desde `main` con CUDA.
- Metadatos internos incoherentes: el número de parámetros reportado por HuggingFace (1.924.404.480) no cuadra con un modelo de 27B ni con un archivo de 11,50 GiB, y el tamaño de repo indicado (0,7 GB) tampoco coincide con el archivo declarado.
- Benchmarks incompletos: GPQA, MMLU-Pro, IFBench y LiveCodeBench v6 figuran como pendientes para este archivo.
- Métrica principal no equivalente a precisión: los valores de KL miden cercanía de logits al Q8_0, no acierto en tareas; el propio autor lo señala.
- Puntuación «final» optimista: la columna final del benchmark es la unión de fases con distintos presupuestos de tokens, no una ejecución con ajustes fijos, y no debe compararse con resultados de una sola configuración.
- Sin mediciones de rendimiento: no hay datos de latencia ni de throughput, lo que impide dimensionar un despliegue en producción.
- Sin datos de idiomas: no se documenta qué idiomas soporta ni con qué calidad; la cuantización se calibró con un corpus de código con formato de chat.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada. Al ser una cuantización agresiva (3,5 bits), es esperable cierta degradación respecto al modelo base, pero no se cuantifica más allá del KL.
- Licencia: la model card declara Apache 2.0 para este repositorio. Conviene verificar por separado la licencia y las condiciones de uso del modelo base `Qwen/Qwen3.8-27B`, que no se indican aquí.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y el runtime necesario está en un commit concreto, por lo que la reproducibilidad depende de que ese estado del repositorio se mantenga.
- Sin soporte confirmado de tool calling ni de agentes multi-paso: no se menciona en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lackonendes/PAW-27B-X3.1-GGUF
- Runtime requerido (llama-paw, rama `main`, commit `4b936837b` o posterior): https://github.com/irawanw/llama-paw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Referencias citadas sin enlace en la información: archivo previo `PAW-27B-X3-3.5bit.gguf` y su model card PAW-27B-X3, build intermedio `rB`, encoder exllamav3 v1.5.1 y model card de ThinkingCap-Qwen3.8-27B.
