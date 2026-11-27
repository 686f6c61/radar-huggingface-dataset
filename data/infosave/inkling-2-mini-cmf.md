# infosave/Inkling-2-Mini-cmf

## Resumen

Inkling-2-Mini-cmf es una distribución cuantizada del modelo Inkling-2-Mini de Thinking Machines, un transformer de mezcla de expertos (MoE) con 26.400 millones de parámetros totales y 3.400 millones activos por token. La particularidad arquitectónica es que sus 12 capas centrales se ejecutan tres veces, elevando el cómputo efectivo a 5.400 millones de parámetros activos por token. Esta versión, publicada por el usuario infosave, empaqueta el modelo en un único fichero CMF de 15,12 GB con cuantización de 4 bits en la mayoría de matrices, pensado para ejecutarse con `cortiq`, un motor de inferencia escrito en Rust sin dependencias de Python ni de frameworks de aprendizaje automático.

El interés de esta ficha radica en su enfoque de despliegue: un modelo de 26.400 millones de parámetros que cabe íntegramente en una GPU de 24 GB y que puede ejecutarse en CUDA, Vulkan, DX12, Metal y CPU con el mismo fichero. Incluye además el drafter DSpark del lanzamiento original para decodificación especulativa, lo que permite acelerar la generación en código y JSON entre un 30 % y un 43 % según la carga.

La licencia Apache 2.0 y el soporte multilingüe (inglés, ruso y chino) lo sitúan como una opción viable para producción en entornos con hardware modesto, aunque la ausencia de la torre de visión en el fichero limita su uso a tareas puramente textuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas centrales repetidas (looped-transformer) |
| Parametros totales | 26.400 millones |
| Parametros activos | 3.400 millones por token; 5.400 millones efectivos por la repetición de las 12 capas centrales |
| Longitud de contexto | Hasta 32.768 tokens medidos en la model card; configurable con `CMF_MAX_SEQ` |
| Tipos de cuantizacion | q4tp (4 bits en expertos enrutados, atención y matrices densas); cabeza en 8 bits; drafter en 8 bits; embeddings en f16; routers, convoluciones y puertas en f32 |
| Idiomas soportados | Inglés, ruso, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (fichero único, 15,12 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 26.400 millones de parámetros totales y 3.400 millones activos por token. Su rasgo distintivo es un esquema de capas repetidas: las 12 capas centrales se aplican tres veces por token, lo que eleva el cómputo efectivo a 5.400 millones de parámetros activos. El lanzamiento original distribuye los expertos enrutados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23). La model card no detalla el volumen de tokens de entrenamiento ni la composición del dataset, ni si se aplicaron fases de RLHF o DPO.

La cuantización de esta distribución decodifica los expertos originales y los recodifica como q4tp. La atención, su puerta de salida y las proyecciones de posición relativa se redondean con GPTQ sobre 3.072 tokens de prosa, Rust y Python ajenos a los textos de evaluación. La cabeza queda en 8 bits, los embeddings en f16 y los routers, convoluciones, consultas de mezcla de bloques y puertas de mensaje en f32. El fichero incluye el drafter DSpark del lanzamiento (`mtp.safetensors`): tres capas densas que leen los estados ocultos del modelo en tres de sus 48 aplicaciones de capa y una cabeza recurrente que escribe hasta siete tokens por adelantado. La torre de visión no está incluida.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (`--no-think` para desactivarlo).
- Soporte de tool calling y function calling, según los tags del repositorio.
- Capacidades de agente y razonamiento encadenado.
- Generación de código en Python, Rust y otros lenguajes, con aceleración específica mediante decodificación especulativa.
- Generación de JSON estructurado, con un incremento de rendimiento medido del 30 % con DSpark en la L4.
- Multilingüe en inglés, ruso y chino.
- Decodificación especulativa integrada mediante el drafter DSpark del lanzamiento.
- Ejecución en CUDA, Vulkan, DX12, Metal y CPU con el mismo fichero.
- Despliegue con expertos en memoria de host cuando la GPU no alcanza los 15,1 GB del fichero.

## Casos de uso

- Generación de código en producción: el modelo mantiene 49,5 tok/s en la L4 y 213,7 tok/s en la RTX PRO 6000 Blackwell en decodificación simple, y con DSpark sube a 70,8 y 279,9 tok/s respectivamente. Adecuado para autocompletado y generación de parches en pipelines de CI/CD donde el coste por GPU importa.
- Generación de JSON estructurado para APIs: con DSpark alcanza 63,8 tok/s en la L4 y 298,2 tok/s en la RTX PRO 6000, con un 48 % de borradores aceptados, lo que lo hace viable para rellenar esquemas y respuestas de servicios web.
- Asistentes con contexto largo: la lectura de un prompt de 32.768 tokens tarda 31,5 s en la L4 y 0,15 s para 2.048 tokens en la RTX PRO 6000, lo que permite procesar documentos extensos y conversaciones multi-turno.
- Despliegue en hardware de consumo: el fichero de 15,12 GB cabe en una RTX 4090 o en un MacBook Air M4 de 24 GB, con 25,0 tok/s por Metal y 10,3 tok/s en CPU en este último.
- Inferencia en GPUs de 12 GB con desbordamiento a memoria de host: en una RTX 3060 con 64 GB de RAM se obtienen 63,3 tok/s de decodificación y 1.175 tok/s de lectura de prompt de 4.096 tokens, con 4,9 GB de expertos en memoria del sistema.
- Atención al cliente automatizada en ruso o chino: el soporte de estos idiomas junto con el inglés permite desplegar un único modelo para mercados multilingües sin cambiar de pesos.
- Procesamiento por lotes en CPU: 7,2 tok/s en el mismo host de la RTX 3060 permiten trabajos de extracción o clasificación sin GPU dedicada.
- Evaluación de agentes con tool calling: la combinación de razonamiento multi-paso y function calling permite construir flujos de agente que consultan herramientas externas y verifican resultados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad WikiText-2 (ventanas de 512 tokens) | 9,058 (referencia f32: 8,944) |
| Perplejidad WikiText-2 (ventanas de 4.096 tokens) | 7,379 (referencia f32: 7,310) |
| Perplejidad en Rust | 3,150 (referencia f32: 3,124) |
| Perplejidad en Python | 2,864 (referencia f32: 2,851) |
| Rendimiento L4, CUDA, decodificación simple | 50,9 tok/s |
| Rendimiento L4, CUDA, con DSpark en código | 70,8 tok/s (×1,43) |
| Rendimiento L4, CUDA, con DSpark en JSON | 63,8 tok/s (×1,30) |
| Rendimiento L4, Vulkan | 35,4 tok/s |
| Rendimiento MacBook Air M4, Metal | 25,0 tok/s |
| Rendimiento MacBook Air M4, CPU | 10,3 tok/s |
| Rendimiento RTX PRO 6000 Blackwell, simple | 220,1 tok/s |
| Rendimiento RTX PRO 6000 Blackwell, DSpark en código | 279,9 tok/s (×1,31) |
| Lectura de prompt 2.048 tokens en L4 | 1,30 s |
| Lectura de prompt 32.768 tokens en L4 | 31,5 s |
| Memoria de tarjeta en L4 | 15,9 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 15,9 GB en la L4 para el fichero completo de 15,12 GB; 11,2 GiB de 12 en la RTX 3060 con expertos parcialmente en memoria de host.
- GPU recomendadas: NVIDIA L4 (24 GB), NVIDIA RTX PRO 6000 Blackwell, NVIDIA RTX 4090, NVIDIA RTX 3060 (12 GB, con desbordamiento a host), Apple M4 con 24 GB unificados.
- Cabe en GPU de consumo: sí, en RTX 4090 y en MacBook Air M4 de 24 GB; en tarjetas de 12 GB requiere `CMF_MAX_SEQ` y desbordamiento de expertos a RAM del sistema.
- Opciones de despliegue: `cortiq` 0.9.16 o superior, con compilación `--features cuda` para CUDA o sin ella para Vulkan, Metal o CPU. Variables relevantes: `CMF_GPU`, `CMF_MAX_SEQ`, `CMF_GPU_VRAM_MB`, `CMF_HYB_HOST_EXPERTS`, `CMF_INKLING_SPEC`.
- Latencia y throughput: 50,9 tok/s en L4 con CUDA; 220,1 tok/s en RTX PRO 6000; 35,4 tok/s en Vulkan sobre L4; 25,0 tok/s en Metal sobre M4; 10,3 tok/s en CPU sobre M4; 7,2 tok/s en CPU sobre Core i9-11900K.
- Decodificación especulativa: activa por defecto en CUDA al decodificar de forma greedy; se desactiva con `CMF_INKLING_SPEC=0` y se fija el número de borradores con `CMF_INKLING_SPEC=N`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-cmf | 26,4 B | 3,4 B (5,4 B efectivos) | 32.768 | Apache 2.0 | CMF |
| Inkling-2-Mini (original) | 26,4 B | 3,4 B (5,4 B efectivos) | no disponible | Apache 2.0 | safetensors (NVFP4/MXFP8) |
| Modelos MoE comparables de 20-30 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card no incluye comparaciones con otros modelos de la misma categoría. La referencia directa es el lanzamiento original de Thinking Machines, cuyos pesos en f32 ocupan 19,53 GB frente a los 15,12 GB de esta distribución, con una diferencia de perplejidad de 0,114 puntos en WikiText-2.

## Limitaciones y advertencias

- La torre de visión no está incluida en el fichero; el modelo solo procesa texto.
- La perplejidad es ligeramente superior a la de los pesos originales en f32 (9,058 frente a 8,944 en WikiText-2), lo que implica una pérdida de calidad medible aunque pequeña.
- El rendimiento en textos que el drafter no predice bien cae por debajo de la decodificación simple: ×0,98 en relatos cortos y ×1,06 en prosa de consejos, con solo un 32 % y un 34 % de borradores aceptados.
- Los idiomas soportados se limitan a inglés, ruso y chino; no hay evidencia de rendimiento en castellano.
- El desbordamiento de expertos a memoria de host se rechaza si supera las tres cuartas partes de la memoria libre del sistema, lo que puede impedir el despliegue en hosts con poca RAM.
- La cuantización se validó sobre 3.072 tokens de prosa, Rust y Python; el comportamiento en otros dominios no está documentado.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que la evaluación de capacidades se limita a perplejidad y throughput.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y esta distribución comparten licencia; conviene verificar los términos del lanzamiento original de Thinking Machines.
- El motor `cortiq` requiere la versión 0.9.16 o superior para el desbordamiento automático de expertos; versiones anteriores pueden fallar en tarjetas de menos de 15,1 GB.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/Inkling-2-Mini-cmf
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del motor y formato CMF: https://github.com/infosave2007/cmf
- Página de releases de cortiq: https://github.com/infosave2007/cmf/releases
- Pull request de Transformers para las capas del lanzamiento: transformers PR #51050
