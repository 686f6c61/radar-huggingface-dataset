# divagr1925/QwenPU

## Resumen

QwenPU es un proyecto experimental de Divyansh Agrawal (usuario divagr1925 en HuggingFace) que consiste en una modificación de Qwen3.5-4B en la que se ha "compilado" un ordenador completo —una CPU RISC-V de 32 bits con unidad vectorial— dentro de los pesos del modelo de lenguaje. No es un modelo conversacional convencional: es una demostración técnica de que se puede ejecutar un programa arbitrario (en este caso, el modelo stories260K de Andrej Karpathy, un Llama de 260.000 parámetros) dentro de los pases hacia adelante del propio transformer, usando tokens de traza como instrucciones.

El proyecto forma parte de Qwenputer, una línea de trabajo que comenzó compilando una CPU RV32IM en capas transformer situadas delante de las capas originales de Qwen. QwenPU añade una unidad vectorial con instrucciones propias (VMAT, VEW, VMATR, etc.) que reduce drásticamente el número de tokens de traza necesarios: de 2.430.000 por token de historia en C plano a 53.000 con la unidad vectorial, y el tiempo por token de historia baja de 41 segundos (Qwenputer-npu) a unos 16 segundos en una L4.

Se trata de un trabajo en progreso con fines de investigación y demostración, no de un modelo de uso general. El checkpoint pesa 26,7 GB en bf16 (la mayor parte es relleno de ceros) y requiere una GPU de 40 GB o más para cargarlo completo, aunque las capas del "ordenador" por separado caben en una GPU de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (solo texto) + 13 capas compiladas de un ordenador RV32IM + Zba con unidad bignum y unidad vectorial (Gated DeltaNet como memoria de estado) |
| Parametros totales | 13.364.479.936 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE; la base Qwen3.5-4B no lo es) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (exacto); pesos del programa invitado en int8/int4 dentro de la memoria de la unidad vectorial |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo base Qwen/Qwen3.5-4B sin modificar; stories260K y llama2.c de Karpathy, MIT) |
| Formato de pesos | safetensors (26,9 GB el repositorio) |

## Arquitectura y entrenamiento

QwenPU conserva íntegros los pesos originales de Qwen3.5-4B y añade 13 capas compiladas delante de las 32 capas del modelo base. Estas capas implementan una CPU RV32IM con la extensión Zba, una unidad bignum y una unidad vectorial propia. El tamaño oculto se amplía de 2560 a 5120 para alojar las dimensiones del ordenador, y el vocabulario se extiende con 394.164 tokens de traza adicionales que codifican las operaciones del circuito. La memoria de la unidad vectorial se implementa mediante las cabezas Gated DeltaNet de Qwen3.5: 16 registros vectoriales de 64 palabras, 384 activaciones int8, 4.152 fragmentos de pesos int4 y cachés K/V para 32 posiciones.

No hay entrenamiento tradicional en el sentido convencional: los pesos se establecen mediante un compilador (compiled-weights), no mediante descenso de gradiente. Cada operación vectorial es exacta en bf16 y se ha verificado contra un modelo de referencia: pruebas aleatorias de cada operación sobre las capas del propio checkpoint, más los primeros 30.000 pasos del programa de historias, con cero discrepancias, y la historia completa escrita en ejecución libre (3.184.920 pasos) comprobada paso a paso.

## Capacidades

- No es un modelo de lenguaje de uso general: su función es ejecutar programas compilados dentro de sus pases hacia adelante.
- Ejecuta stories260K (Llama de 260K parámetros de Karpathy) como programa invitado, escribiendo historias token a token idénticas a la referencia.
- Unidad vectorial con 8 instrucciones: VMAT (producto matriz int8·int4 con 64 lanes por token o argmax), VQ (cuantización a int8 o filas de caché K/V), VEW (suma residual, producto con gating SiLU, RoPE), VMATR (puntuaciones de atención sobre caché K; probabilidades por caché V), VEXP (numeradores softmax con tabla exponencial), VRED (suma o suma de cuadrados), VGET/VPUT (transferencias CPU-unidad).
- Unidades de función en punto fijo para SiLU y exp, genéricas como los sumadores de la CPU.
- Tool calling, agentes, razonamiento multilingüe y demás capacidades conversacionales: no disponibles (el proyecto no las describe ni está orientado a ello).

## Casos de uso

- Investigación en computación dentro de modelos: estudiar cómo ejecutar programas arbitrarios como parte del pase hacia adelante de un transformer, usando tokens de traza como instrucciones.
- Verificación formal de circuitos compilados: el executor permite comprobar la ejecución completa (3.184.920 pasos) contra un modelo de referencia, útil para validar compiladores de pesos.
- Demostración educativa de arquitecturas RISC-V y unidades vectoriales: el repositorio incluye el programa invitado en C (stories_vx.c) y herramientas para ejecutarlo y verificarlo.
- Benchmarking de optimizaciones de compilación: la tabla de tokens de traza (2.430.000 en C plano, 225.000 con VDOT+SMAQA, 53.000 con la unidad vectorial) permite medir mejoras de diseño de ISAs dentro de modelos.
- Experimentación con memoria DeltaNet como almacenamiento de estado de un circuito: las memorias de la unidad vectorial viven en las cabezas Gated DeltaNet, un enfoque replicable en otros modelos.
- Base para futuros trabajos del proyecto Qwenputer: el autor indica que el siguiente paso es reducir el tamaño oculto y, con ello, el checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento publicados se refieren a la ejecución del programa invitado:

| Build de stories260K | Tokens de traza por token de historia |
|---|---|
| C plano, pesos int8 | 2.430.000 |
| Qwenputer-npu: VDOT + SMAQA | 225.000 |
| QwenPU: unidad vectorial | 53.000 |

El executor del circuito escribe la historia completa en ejecución libre a unos 3.300 tokens de traza por segundo en una L4, lo que supone unos 16 segundos por token de historia (frente a 41 segundos de Qwenputer-npu).

## Requisitos de hardware

- Checkpoint completo: 26,7 GB en bf16; se necesita una GPU de 40 GB o más para cargarlo entero (A100 40 GB/80 GB, H100, H200).
- Demo de historias y verificaciones: las capas del ordenador por separado caben en una GPU de 24 GB (RTX 4090, RTX 3090, A5000, L4 no llega por VRAM pero se usa en las mediciones de velocidad del executor).
- Modo `--chip-only` de vxcheck: carga solo las capas del circuito en GPU, unos 13 GB, viable en una RTX 4090 de 24 GB.
- Despliegue: no mediante vLLM, TGI ni Ollama de forma estándar; se usa el repositorio propio con `uv sync --extra hf` y scripts de Python (`storyrun.py`, `chipformer.rv.vxcheck`) compatibles con la librería transformers para descargar el checkpoint.
- Latencia: unos 16 segundos por token de historia generada en una L4; no hay datos de throughput para uso conversacional.

## Comparativa con modelos similares

| | QwenPU | Qwen3.5-4B (base) | Qwenputer-npu |
|---|---|---|---|
| Parametros | 13,36 B (26,7 GB bf16) | 4 B (aprox.) | no disponible |
| Proposito | Ejecutar programas (CPU RISC-V + unidad vectorial) en los pesos | LLM conversacional general | Ejecutar programas con CPU VDOT + SMAQA |
| Unidad vectorial | Propia, 8 instrucciones, 64 lanes | no aplica | No (instrucciones de dot-product en la CPU) |
| Tokens de traza por token de historia | 53.000 | no aplica | 225.000 |
| Latencia por token de historia | ~16 s (L4) | no aplica | ~41 s |
| Licencia | Apache-2.0 | Apache-2.0 | no disponible |

No existen alternativas comerciales comparables: se trata de una línea de investigación singular sin equivalentes publicados conocidos.

## Limitaciones y advertencias

- No es un modelo conversacional: no debe usarse para generación de texto general, chat ni aplicaciones de producción de LLM; su salida útil es la ejecución de programas compilados.
- Trabajo en progreso: el autor lo declara explícitamente; el siguiente paso es reducir el tamaño oculto y el checkpoint.
- Tamaño muy elevado para su utilidad: 26,7 GB en bf16, la mayor parte relleno de ceros, para ejecutar un modelo de 260K parámetros.
- Latencia altísima: 16 segundos por token de historia lo hace inviable para cualquier aplicación interactiva.
- Contexto, idiomas y capacidades de tool calling: no disponibles ni documentados.
- Sesgos y alucinaciones: no aplicables ni evaluados, dado que no es un modelo generativo de propósito general; los pesos de Qwen3.5-4B subyacentes conservan sus sesgos originales pero no se usan en el flujo principal del proyecto.
- Requiere software específico del repositorio (chipformer, scripts propios); la compatibilidad con el ecosistema transformers estándar no está garantizada más allá de la descarga de pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/divagr1925/QwenPU
- Código en GitHub: https://github.com/divagr18/QwenPU
- Proyecto Qwenputer: https://github.com/divagr18/qwenputer
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Predecesor Qwenputer-npu: https://huggingface.co/divagr1925/Qwenputer-npu
- stories260K (Karpathy): https://huggingface.co/karpathy/tinyllamas/tree/main/stories260K
- llama2.c (Karpathy): https://github.com/karpathy/llama2.c
