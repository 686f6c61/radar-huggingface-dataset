# divagr1925/QwenPU

## Resumen

QwenPU es un artefacto experimental publicado por Divyansh Agrawal que parte de Qwen/Qwen3.5-4B y le incorpora, compilada dentro de los propios pesos del modelo, una CPU RISC-V de 32 bits (RV32IM + Zba + unidad bignum) con una unidad vectorial dedicada. El resultado es un checkpoint de 13.364.479.936 parámetros (26,7 GB en bf16, mayoritariamente relleno de ceros) que mantiene la arquitectura `Qwen3_5ForCausalLM` intacta y añade 13 capas compiladas por delante de las 32 originales de Qwen. No es un modelo entrenado: es un modelo base cuyos pesos han sido generados por un compilador para emular hardware dentro del forward pass.

La demostración concreta es que stories260K (el modelo Llama de 260K parámetros de llama2.c, de Andrej Karpathy) se ejecuta como programa sobre esa unidad vectorial y escribe su historia token a token, de forma exacta. Cada operación vectorial (producto matriz-vector int8·int4, cuantización, SiLU, RoPE, softmax, atención sobre caché K/V) se implementa como pasos exactos de las capas compiladas, y los resultados se transmiten a través del flujo de tokens.

Es relevante ahora como prueba de concepto de "cómputo compilado en pesos": un modelo de lenguaje que aloja una máquina virtual ejecutable, con verificación paso a paso contra un modelo de referencia. El autor lo marca explícitamente como trabajo en curso: es exacto pero todavía grande (26,7 GB), y el siguiente paso es recortar el tamaño oculto y, con él, el checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` estándar (solo texto); 13 capas compiladas (RV32IM + Zba + bignum + unidad vectorial) delante de las 32 capas de Qwen3.5-4B |
| Parametros totales | 13.364.479.936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el checkpoint; los pesos int4 de stories260K residen en la memoria de pesos de la unidad vectorial |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

Datos adicionales de la model card: tamaño oculto 5120 (2560 de Qwen más las dimensiones del computador), vocabulario de Qwen ampliado con 394.164 tokens de traza, precisión exacta en bf16, tamaño del repo 26,9 GB.

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido habitual. QwenPU conserva los pesos de Qwen/Qwen3.5-4B sin cambios y antepone 13 capas generadas por un compilador que implementan un computador RISC-V de 32 bits con extensión Zba, unidad bignum y unidad vectorial. El estado de Gated DeltaNet de Qwen3.5 se reutiliza como memoria del computador: las memorias de la unidad vectorial son cabezas DeltaNet con 16 registros vectoriales de 64 palabras, 384 activaciones int8, 4.152 fragmentos de fila de pesos int4 y cachés K/V para 32 posiciones. El registro de una operación comienza con tokens de configuración que transportan sus operandos y después emite sus resultados en streaming; cada token es un paso exacto de las capas compiladas. SiLU y exp son unidades de función en punto fijo, genéricas como los sumadores de la CPU.

El conjunto de instrucciones vectoriales incluye `VMAT` (filas de matriz int8·int4, 64 lanes por token, con escala de fila, o argmax), `VQ` (cuantización de un registro vectorial a activaciones int8 o a una fila de caché K/V), `VEW` (suma residual, producto con puerta SiLU, RoPE), `VMATR` (puntuaciones de atención sobre la caché K y probabilidades por la caché V), `VEXP` (numeradores de softmax mediante tabla de exp), `VRED` (suma o suma de cuadrados) y `VGET`/`VPUT` (transferencia entre CPU y unidad). La innovación destacable es la reducción del coste de traza: frente a 2.430.000 tokens de traza por token de historia en C plano con pesos int8, y 225.000 con Qwenputer-npu (VDOT + SMAQA), QwenPU requiere 53.000.

## Capacidades

- Ejecución de un modelo de lenguaje completo (stories260K, 260K parámetros, int4) como programa sobre la unidad vectorial integrada en los pesos.
- Generación de texto del propio Qwen3.5-4B subyacente, ya que los pesos base se conservan sin modificar.
- Emulación de CPU RV32IM + Zba con unidad bignum y unidad vectorial de 64 lanes.
- Streaming de resultados vectoriales completos a través del flujo de tokens.
- Verificación exacta paso a paso: la ejecución libre sobre GPU coincide con el modelo de referencia en los 3.184.920 pasos de la historia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en cómputo compilado en pesos: usar QwenPU como banco de pruebas para estudiar cómo se codifican máquinas virtuales y unidades funcionales dentro de los pesos de un transformer, comparando el coste en tokens de traza entre variantes (C plano, Qwenputer-npu, QwenPU).
- Verificación formal de ejecutores: el script `vxcheck` ejecuta la unidad vectorial sobre las capas del checkpoint y la compara con un modelo de referencia de la unidad, lo que sirve para validar implementaciones de emuladores RISC-V y de operaciones vectoriales exactas.
- Docencia sobre arquitectura de computadores: la historia de stories260K escrita por el modelo ilustra de forma tangible el ciclo instrucción a instrucción, la cuantización int8/int4 y el funcionamiento de una unidad vectorial con memorias separadas.
- Reproducción de experimentos de llama2.c en hardware emulado: cualquier modelo que quepa en la memoria de la unidad vectorial se ejecuta de la misma forma, lo que permite portar y comparar modelos pequeños sin tocar el checkpoint.
- Benchmarking de coste de traza: medir tokens de traza por token de salida (53.000 en QwenPU frente a 225.000 en Qwenputer-npu y 2.430.000 en C plano) para evaluar el impacto de añadir instrucciones vectoriales dedicadas.
- Base para futuras variantes reducidas: el propio autor plantea recortar el tamaño oculto para reducir el checkpoint por debajo de 24 GB y facilitar su despliegue en GPUs de consumo, lo que abre la puerta a experimentos de compilación en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son los de la demo de stories260K:

| Build de stories260K | Tokens de traza por token de historia |
|---|---|
| C plano, pesos int8 | 2.430.000 |
| Qwenputer-npu: VDOT + SMAQA | 225.000 |
| QwenPU: unidad vectorial | 53.000 |

En ejecución libre sobre una GPU L4, el ejecutor del circuito produce unos 3.300 tokens de traza por segundo, lo que equivale a unos 16 segundos por token de historia, frente a 41 segundos en Qwenputer-npu.

## Requisitos de hardware

- VRAM para el checkpoint completo: 26,7 GB en bf16; el autor indica que necesita una GPU de 40 GB o más para cargarlo entero.
- VRAM para la demo y las comprobaciones: las capas del computador se ejecutan por separado y caben en una GPU de 24 GB; con `--chip-only` se cargan solo esas capas, unos 13 GB.
- GPU recomendadas: L4 para el ejecutor (medición reportada); A100 o H100 de 40/80 GB para cargar el checkpoint completo.
- GPU de consumo: no cabe entero en ninguna consumer GPU actual; solo las capas del computador (unos 13 GB) caben en tarjetas de 16-24 GB como la RTX 4090.
- Opciones de despliegue: transformers (librería declarada), con el repositorio QwenPU y `uv` para los scripts `storyrun` y `vxcheck`; vLLM, llama.cpp, Ollama o TGI no están documentados para este artefacto.
- Latencia y throughput: aproximadamente 3.300 tokens de traza por segundo en L4, es decir, unos 16 segundos por token de historia en la demo; no hay datos de throughput para la generación de texto de Qwen3.5-4B con este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QwenPU | 13.364.479.936 (26,7 GB bf16) | no disponible | Qwen3.5-4B + CPU RISC-V y unidad vectorial compiladas | Apache-2.0 | Hugging Face (divagr1925/QwenPU) |
| Qwen/Qwen3.5-4B | ~4B | no disponible | Modelo de lenguaje base | Apache-2.0 (según modelo base) | Hugging Face |
| Qwenputer-npu | no disponible | no disponible | CPU compilada con instrucciones de producto escalar (VDOT + SMAQA) | no disponible | Hugging Face (divagr1925/Qwenputer-npu) |
| stories260K (llama2.c) | 260K | no disponible | Modelo Llama mínimo para llama2.c | no disponible | Hugging Face (karpathy/tinyllamas) |

La comparación relevante es de propósito, no de rendimiento en tareas de NLP: QwenPU y Qwenputer-npu son artefactos de investigación sobre cómputo compilado en pesos, mientras que Qwen3.5-4B y stories260K son los componentes que se ejecutan dentro de ellos.

## Limitaciones y advertencias

- Trabajo en curso declarado por el autor: el checkpoint es exacto pero todavía grande (26,7 GB) y requiere una GPU de 40 GB o más para cargarse entero.
- El checkpoint está mayoritariamente compuesto de relleno de ceros; el tamaño no refleja capacidad útil de parámetros.
- No es un modelo entrenado ni afinado: no hay datos publicados sobre calidad de generación de texto, razonamiento, código o matemáticas con este artefacto.
- Idiomas soportados no disponibles; la model card no documenta comportamiento multilingüe.
- Longitud de contexto no disponible.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de seguridad.
- La licencia Apache-2.0 cubre el artefacto del modelo; el código fuente del repositorio QwenPU tiene licencia MIT y se cita por separado, según indica el autor.
- El DOI 10.57967/hf/11460 identifica el artefacto del modelo, no una release de código fuente.
- La emulación es exacta pero lenta en términos de tokens de historia (16 segundos por token en L4); no es apta para inferencia interactiva de la demo.
- Uso comercial: la licencia Apache-2.0 lo permite, pero al ser un artefacto de investigación sin evaluación de calidad, no se recomienda para producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divagr1925/QwenPU
- Repositorio QwenPU en GitHub: https://github.com/divagr18/QwenPU
- Proyecto Qwenputer: https://github.com/divagr18/qwenputer
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Qwenputer-npu: https://huggingface.co/divagr1925/Qwenputer-npu
- stories260K (karpathy/tinyllamas): https://huggingface.co/karpathy/tinyllamas/tree/main/stories260K
- llama2.c: https://github.com/karpathy/llama2.c
- DOI del artefacto: https://doi.org/10.57967/hf/11460
- ORCID del autor: https://orcid.org/0009-0003-0739-2473
