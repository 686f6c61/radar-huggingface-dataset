# axjns/strix-halo-kernels

## Resumen

Strix Halo Kernels es una colección de kernels Triton fusionados para la GPU integrada RDNA 3.5 / gfx1151 de AMD, presente en los procesadores Ryzen AI Max (Strix Halo) con las iGPU Radeon 8050S y 8060S. El autor, axjns, los publica bajo licencia Apache 2.0 con el objetivo de resolver un problema concreto: el ecosistema de kernels del Hub de HuggingFace es mayoritariamente CUDA-only, y las alternativas como `kernels-community/activation` ofrecen decenas de variantes de compilación que ninguna resuelve en ROCm. Triton, al compilar JIT para la GPU presente, evita por completo ese problema.

El proyecto implementa operaciones fusionadas de RMSNorm y GEGLU/SwiGLU optimizadas para las características particulares de Strix Halo: un APU con hasta 64 GiB de VRAM direccionable sobre memoria unificada de 128 GB, pero con un ancho de banda de memoria muy inferior al de una GPU discreta. El autor mide una brecha de aproximadamente 21× entre el throughput de prefill y decode, lo que confirma que el cuello de botella es la memoria. Por eso, fusionar operaciones que eliminan viajes de ida y vuelta a memoria rinde más que optimizar compute. Los kernels incluyen módulos `nn.Module` drop-in que preservan los nombres de parámetros originales, permitiendo intercambiar capas sin cirugía de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernels Triton fusionados para AMD RDNA 3.5 / gfx1151 (Strix Halo) |
| Parametros totales | no aplicable (no es un modelo de IA) |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | fp32, fp16, bf16 (validado en los tres) |
| Idiomas soportados | no aplicable |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplicable (codigo fuente Python/Triton) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una biblioteca de kernels de inferencia. La arquitectura se basa en kernels Triton que fusionan operaciones de memoria intensiva en un solo paso. Para RMSNorm, el kernel acumula la suma de cuadrados en fp32 independientemente del dtype de entrada, evitando la pérdida de precisión que sufriría la acumulación en fp16 sobre filas de 4096 elementos. Para GEGLU/SwiGLU, el kernel fusiona la lectura de las dos entradas (gate y up) con la activación y la escritura de la salida, eliminando el tensor intermedio que en eager PyTorch supone un viaje adicional a memoria.

El ajuste de `num_warps` y tamaños de bloque está hecho a mano para la arquitectura RDNA (wavefront de 32 hilos) y el bajo número de CUs de un APU. No hay autotuning. El proyecto se validó contra referencias eager de PyTorch en fp32/fp16/bf16, con entradas 2-D y 3-D, no contiguas, y formas desde 4×512 hasta 4096×5120. El error máximo absoluto observado es de 1.9e-6 en fp32, 7.8e-3 en fp16 y 6.3e-2 en bf16, consistente con el redondeo propio de cada dtype.

## Capacidades

- RMSNorm fusionado sobre la última dimensión, asumiendo que es contigua. Entrada no contigua se copia (con coste adicional de un pase).
- GEGLU con activación gelu sobre la puerta, para MLPs de Flux / SD3 / T5.
- SwiGLU con activación silu sobre la puerta, para MLPs de la familia LLaMA / Qwen / Mistral.
- GEGLU en modo chunked: acepta una proyección que emite `2 * inner_dim` y la divide internamente antes de aplicar la puerta.
- Módulos `nn.Module` drop-in (`layers.RMSNorm`, `layers.SwiGLU`, `layers.GEGLU`) que preservan los nombres de parámetros originales, sin necesidad de modificar state dicts.
- Función `kernelize` que intercambia en sitio las capas compatibles de un modelo existente.
- Funciones de referencia exportadas (`rms_norm_ref`, `swiglu_ref`, `geglu_ref`) para validación.
- Solo forward: los kernels son opacos a `torch.autograd`; no hay backward.

## Casos de uso

- Inferencia de LLMs en un APU Strix Halo: sustituir las capas RMSNorm y SwiGLU de un modelo LLaMA/Qwen/Mistral por las versiones fusionadas reduce el tiempo de prefill, que es donde más se nota la brecha de ancho de banda. El autor mide aceleraciones de hasta 7.82× en RMSNorm con formas grandes.
- Generación de imágenes con arquitecturas basadas en T5 o Flux: el kernel GEGLU fusionado acelera los MLPs del text encoder y del transformer de difusión, reduciendo la latencia por paso de muestreo.
- Despliegue en equipos sin GPU discreta: Strix Halo permite ejecutar modelos de hasta 70B o 120B con cuantización en memoria unificada, y estos kernels mejoran el rendimiento de las operaciones de memoria intensiva sin necesidad de hardware adicional.
- Evaluación y fine-tuning de modelos en equipos con ROCm: aunque los kernels no soportan backward, sirven para acelerar la evaluación y el forward pass de validación durante el desarrollo.
- Benchmarking de rendimiento de ROCm en APUs: el repositorio incluye `test_bench.py`, una suite reproducible de benchmarks y corrección que puede servir de referencia para comparar configuraciones de ROCm, torch y Triton.
- Desarrollo de kernels para arquitecturas AMD: como ejemplo de implementación de kernels Triton fusionados para gfx1151, con decisiones de diseño documentadas (acumulación fp32, ajuste manual de warps) que pueden orientar a otros desarrolladores.

## Benchmarks y rendimiento

Mediciones en gfx1151, fp16, frente a PyTorch eager, con `triton.testing.do_bench`:

| kernel | shape | eager | kernel | speedup |
|---|---|---|---|---|
| RMSNorm | 512×4096 | 0.205 ms | 0.072 ms | 2.84× |
| RMSNorm | 2048×4096 | 1.592 ms | 0.278 ms | 5.73× |
| RMSNorm | 4096×5120 | 3.703 ms | 0.508 ms | 7.29× |
| RMSNorm | 8192×2048 | 3.028 ms | 0.387 ms | 7.82× |
| GEGLU | 512×8192 | 0.233 ms | 0.197 ms | 1.18× |
| GEGLU | 2048×8192 | 0.843 ms | 0.554 ms | 1.52× |
| GEGLU | 4096×4096 | 0.838 ms | 0.550 ms | 1.52× |

RMSNorm es la operación que más se beneficia, y la ganancia crece con el tamaño: eager hace varios pases completos sobre la activación, mientras que el kernel fusionado hace uno solo. En GEGLU el techo es más bajo porque incluso la forma fusionada debe leer dos entradas y escribir una salida; la ventaja se limita al intermedio eliminado.

## Requisitos de hardware

- GPU objetivo: AMD RDNA 3.5 / gfx1151, es decir, las iGPU Radeon 8050S y 8060S de los procesadores Ryzen AI Max (Strix Halo).
- Entorno de desarrollo: ROCm 7.13, PyTorch 2.11, Triton 3.6 (el benchmark se realizó con estas versiones).
- Triton es requisito: se incluye con las builds de PyTorch para ROCm.
- El código fuente no es específico de gfx1151 y debería ejecutarse en cualquier GPU donde Triton funcione, pero los números de rendimiento solo se han medido en esta parte.
- Los valores de `num_warps` y bloques están ajustados para RDNA (wavefront de 32 hilos) y el bajo número de CUs de un APU; una GPU discreta probablemente necesitaría otros valores.
- No requiere GPU dedicada: está pensado precisamente para ejecutarse en el iGPU del APU con memoria unificada.
- Opciones de despliegue: integración directa en código Python con PyTorch y Triton; no hay soporte para vLLM, llama.cpp u otros runtime.

## Comparativa con modelos similares

No hay una comparativa directa con otros proyectos de kernels porque la información disponible no incluye datos de proyectos equivalentes. Existen iniciativas relacionadas en el ecosistema Strix Halo:

| Proyecto | Enfoque | Estado |
|---|---|---|
| axjns/strix-halo-kernels | Kernels Triton fusionados para RMSNorm y GEGLU/SwiGLU | Activo, con benchmarks publicados |
| joelhenwang/autokernel-halo-strix | Autoresearch de kernels HIP C++ optimizados para Strix Halo | En desarrollo, repositorio GitHub |
| Strix Halo AI Toolboxes | Entornos contenerizados para LLMs, generación de imágenes y fine-tuning | Sitio web |

No se dispone de datos de rendimiento comparables entre estos proyectos en la información proporcionada.

## Limitaciones y advertencias

- Solo forward: no hay backward pass. Los kernels son opacos a `torch.autograd`; no deben usarse en grafos de entrenamiento.
- Medido en una sola GPU: los benchmarks corresponden a gfx1151 con ROCm 7.13 / torch 2.11 / Triton 3.6. Otras versiones u otras GPUs pueden dar resultados diferentes.
- Sin autotuning: `num_warps` y tamaños de bloque están ajustados a mano para RDNA y un APU de bajo número de CUs. Una GPU discreta probablemente necesitaría valores distintos.
- RMSNorm asume que la dimensión normalizada es la última y contigua. Entrada no contigua se copia, lo que añade un pase de memoria.
- Dependencia de Triton: requiere las builds de PyTorch para ROCm que incluyen Triton.
- No es un modelo de IA: no ofrece generación de texto, razonamiento ni ninguna capacidad de inferencia semántica; es una biblioteca de kernels de bajo nivel.
- El error absoluto máximo en bf16 (6.3e-2) puede ser relevante para aplicaciones sensibles a la precisión, aunque es consistente con el redondeo del propio dtype.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axjns/strix-halo-kernels
- Benchmarks asociados (dataset): https://huggingface.co/datasets/axjns/strix-halo-inference-bench
- Proyecto relacionado (autokernel-halo-strix): https://github.com/joelhenwang/autokernel-halo-strix
- Guia de despliegue de LLMs en Strix Halo: https://codersera.com/blog/amd-strix-halo-ryzen-ai-max-local-llm-setup-2026/
- Strix Halo AI Toolboxes: https://strix-halo-toolboxes.com/
- Pagina de producto AMD Ryzen AI Halo: https://www.amd.com/en/products/processors/desktops/ryzen/ryzen-ai-halo.html
