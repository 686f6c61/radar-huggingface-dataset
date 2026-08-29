# marcsun13/topk

## Resumen

`marcsun13/topk` es un kernel de cómputo especializado en la selección top-k sobre una fila pequeña de logits, diseñado específicamente para el router de un modelo de mezcla de expertos (MoE). Lo desarrolla Marc Sun (marcsun13), ingeniero de Hugging Face, y se distribuye bajo licencia MIT. No es un modelo de lenguaje, sino una pieza de software de bajo nivel que acelera una operación crítica en la inferencia de MoE: elegir los k expertos más probables entre un conjunto de logits.

El kernel está implementado para Apple Silicon (MPS) y se publica como parte de la librería `kernels`. Su principal innovación es evitar la ordenación completa de la fila: en lugar de realizar un bitonic sort como hacen `ggml` o `torch.mps.topk`, realiza `k*n` comparaciones directas, lo que reduce la latencia de 71 microsegundos a 26 microsegundos por capa y por token en el caso de seleccionar 8 de 256 logits. Además, ofrece una opción para aplicar softmax sobre los k valores seleccionados, lo que evita una segunda pasada de dispatch. Los índices devueltos son de tipo `int32`, listos para alimentar una multiplicación de matrices enrutada por expertos sin necesidad de conversión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de cómputo para selección top-k (no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica, es un kernel) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | no disponible (no aplica; se distribuye como código fuente de kernel) |

## Arquitectura y entrenamiento

Este componente no es un modelo entrenado, sino un kernel de GPU escrito para el framework MPS de Apple. Su diseño se basa en una estrategia de reducción por fila: un threadgroup por fila y una pasada de reducción por salida. Para una fila de `n` logits y una selección de `k` elementos, realiza `k*n` comparaciones. Dado que `k` y `n` son pequeños (típicamente 8 y 256 respectivamente), el coste de lanzamiento del kernel domina sobre el de las comparaciones, por lo que la implementación prioriza minimizar el número de pasadas y la sincronización.

La operación de top-k se implementa sin recurrir a una ordenación completa. Tanto `GGML_OP_TOP_K` (que usa `kernel_argsort_f32_i32_desc`, un bitonic sort) como `torch.mps.topk` realizan una ordenación total de la fila, lo que es innecesario cuando solo se necesitan los k valores más altos. Este kernel evita esa sobrecarga. Además, la opción de aplicar softmax sobre los k valores seleccionados está integrada en el mismo kernel, lo que ahorra una segunda operación de dispatch. Los índices se devuelven como `int32`, el tipo que espera una matmul enrutada por expertos, eliminando conversiones posteriores.

## Capacidades

- Selección top-k de logits de una fila, devolviendo valores en `float32` e índices en `int32`.
- Softmax opcional sobre los k valores seleccionados, pensado para routers MoE que necesitan pesos normalizados.
- Optimizado para el hardware MPS de Apple Silicon (GPU integrada).
- Integración con la librería `kernels` de Hugging Face mediante `get_kernel("marcsun13/topk", version=1)`.
- API simple en Python: `topk.top_k(logits, k, softmax=False)`.
- No requiere ordenación completa de la fila, lo que reduce la latencia frente a implementaciones basadas en sort.

## Casos de uso

- Enrutamiento en modelos de mezcla de expertos (MoE): el kernel selecciona los k expertos más relevantes para cada token a partir de los logits del router, y opcionalmente normaliza sus pesos con softmax. Es el caso de uso principal y para el que está diseñado.
- Inferencia de MoE en Apple Silicon: permite ejecutar modelos como Mixtral o similares en Macs con MPS, reduciendo el tiempo de cómputo del router, que es un cuello de botella en cada capa.
- Prototipado de kernels personalizados: sirve como referencia de implementación eficiente de top-k sin sort para desarrolladores que trabajan con MPS.
- Aceleración de pipelines de generación de texto con MoE: al reducir la latencia del router, mejora el throughput de tokens por segundo en dispositivos Apple.
- Investigación en optimización de kernels: el código puede estudiarse para entender cómo evitar operaciones de ordenación completas en problemas de selección parcial.
- Integración en librerías de inferencia: puede incorporarse en motores como llama.cpp o vLLM (si soportan MPS) para sustituir implementaciones de top-k más lentas.

## Benchmarks y rendimiento

La model card proporciona un dato de rendimiento concreto: para seleccionar los 8 mayores de 256 logits, el kernel tarda 26 microsegundos, frente a 71 microsegundos de una ordenación completa (tanto `GGML_OP_TOP_K` como `torch.mps.topk`). No se han publicado más benchmarks en la información disponible.

| Operación | Latencia (µs) |
|---|---|
| `marcsun13/topk` (k=8, n=256) | 26 |
| Sort completo (ggml o torch MPS) | 71 |

## Requisitos de hardware

- Requiere un dispositivo Apple Silicon con soporte MPS (Macs con chips M1, M2, M3 o posteriores).
- No requiere VRAM dedicada adicional; usa la memoria unificada del sistema.
- No es compatible con GPUs NVIDIA o AMD; está ligado al framework MPS.
- Para su uso, se necesita la librería `kernels` de Hugging Face y PyTorch con soporte MPS.
- El kernel está diseñado para filas pequeñas (típicamente 256 logits) y k pequeño (8); no está pensado para matrices grandes.

## Comparativa con modelos similares

No existen "modelos" comparables porque esto es un kernel, no un modelo de lenguaje. Sin embargo, se puede comparar con otras implementaciones de top-k para MPS:

| Implementación | Método | Latencia (µs) para k=8, n=256 | Licencia |
|---|---|---|---|
| `marcsun13/topk` | Comparación directa k*n | 26 | MIT |
| `torch.mps.topk` | Ordenación completa | 71 | BSD |
| `GGML_OP_TOP_K` (ggml) | Bitonic sort | 71 | MIT |

## Limitaciones y advertencias

- Es específico para MPS; no funcionará en CUDA o ROCm sin una reimplementación.
- Solo maneja filas pequeñas; para matrices grandes o k grande, la estrategia de comparación directa puede no ser óptima.
- No es un modelo de lenguaje ni un generador de texto; su uso se limita a la operación de top-k en routers MoE.
- No se han publicado pruebas exhaustivas de estabilidad o corrección numérica más allá de la descripción del autor.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías de soporte.
- El kernel está en una fase temprana (versión 1) y puede tener errores no documentados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/marcsun13/topk
- Discusión sobre topk-metal: https://huggingface.co/marcsun13/topk-metal/discussions
- Perfil del autor: https://huggingface.co/marcsun13
