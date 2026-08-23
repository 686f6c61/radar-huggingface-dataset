# baladhurgesh97/triton-gdn-decode

## Resumen

Este repositorio de HuggingFace contiene un kernel de decodificación (decode) escrito en Triton para Gated DeltaNet (GDN), la arquitectura subyacente de los modelos Qwen3.5. No es un modelo de checkpoint, sino un kernel de cómputo optimizado que se integra en vLLM para acelerar la fase de decodificación autoregresiva. El autor, baladhurgesh97, lo ha ajustado específicamente para la GPU NVIDIA GB10 y para el modelo `AxionML/Qwen3.5-0.8B-NVFP4`.

La relevancia de este kernel radica en que los modelos GDN (Gated Delta Networks) utilizan una atención recurrente con estado comprimido, cuyo decode puede optimizarse mediante kernels especializados. Este repositorio propone una variante "empaquetada" que usa un CTA por cabeza que itera sobre V-tiles (BV=32, num_warps=4) en lugar de lanzar múltiples CTAs por cabeza, lo que reduce la sobrecarga de lanzamiento y mejora el rendimiento end-to-end. Los pesos del modelo no se modifican; el kernel se aplica como un parche a vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kernel Triton de decodificación para Gated DeltaNet (GDN) |
| Parámetros totales | no aplica (repositorio de kernel, no modelo) |
| Parámetros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo Qwen3.5 sobre el que se aplica) |
| Tipos de cuantización | compatible con NVFP4 (modelo `AxionML/Qwen3.5-0.8B-NVFP4`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica (kernel, no pesos) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino un kernel de decodificación escrito en Triton para la arquitectura Gated DeltaNet (GDN). La GDN es una variante de atención recurrente con compuertas y estado de estado que se usa en los modelos Qwen3.5, y que se puede implementar con kernels altamente optimizados en Triton o CUDA.

El kernel implementa la función `fused_recurrent_gated_delta_rule_packed_decode`, que sigue la misma firma que el kernel de decode empaquetado de vLLM FLA (Flash Linear Attention). La innovación técnica principal es el uso de un único CTA por cabeza que itera sobre los V-tiles (tamaño 32, con 4 warps) en lugar de lanzar múltiples CTAs por cabeza (NV=4). Esto reduce la sobrecarga de lanzamiento y mejora el rendimiento en GPUs como la GB10, tal y como se muestra en las pruebas GSM8K-10. No hay entrenamiento involucrado: los pesos del modelo permanecen sin cambios.

## Capacidades

- Decodificación autoregressive empaquetada (packed decode) para arquitecturas Gated DeltaNet (GDN).
- Integración directa con vLLM mediante un script de parcheo (`apply_kernel.py`).
- Compatibilidad con modelos cuantizados NVFP4, como `AxionML/Qwen3.5-0.8B-NVFP4`.
- Correctness verificada frente a la implementación upstream de FLA (6/6 casos con atol=rtol=2e-2).
- Aumento del throughput de decodificación en ~7% end-to-end en GB10 con vLLM 0.27.1.
- Se carga desde el Hub mediante la librería `kernels` con `trust_remote_code=True`.
- Funciones expuestas: `fused_recurrent_gated_delta_rule_packed_decode`, que devuelve `(out, initial_state)`.

## Casos de uso

- Optimización de inferencia en producción para modelos Qwen3.5: se puede parchear vLLM para mejorar el throughput de decodificación en servidores con GPUs GB10, especialmente en tareas de chat o generación de texto largo.
- Evaluación de modelos GDN en hardware de consumo: el kernel permite ejecutar Qwen3.5-0.8B NVFP4 en una GB10 con mayor velocidad de tokens por segundo, útil para pruebas locales.
- Benchmarking de kernels alternativos: el repositorio sirve como referencia para comparar el rendimiento de kernels de decode GDN frente a las implementaciones upstream de vLLM o FLA.
- Investigación en optimización de atención recurrente: el diseño con un CTA por cabeza y V-tiles puede ser estudiado o reutilizado para otras arquitecturas de estado recurrente.
- Integración en pipelines de inferencia con vLLM 0.27.1: el script `apply_kernel.py` automatiza el parcheo, permitiendo integrar el kernel en despliegues existentes sin recompilar vLLM.
- Educación y desarrollo de kernels Triton: el código sirve como ejemplo de implementación de decodificación para GDN en Triton, útil para quienes trabajan en kernels de atención lineal.

## Benchmarks y rendimiento

El README del repositorio proporciona resultados de benchmarks en un GB10 con vLLM 0.27.1, índices congelados y modo de pensamiento desactivado:

| Kernel | Precisión GSM8K-10 | Mediana de tokens decode/s |
|---|---:|---:|
| Upstream vLLM | 5/10 | 205.45 |
| Este kernel (ejecución 1) | 5/10 | 219.90 |
| Este kernel (ejecución 2) | 5/10 | 219.89 |

El kernel mejora el rendimiento end-to-end en un +7.0% respecto al upstream de vLLM. La corrección numérica se verificó contra la implementación de FLA en 6/6 casos con tolerancia atol=rtol=2e-2. No se han publicado más benchmarks en la información disponible.

## Requisitos de hardware

- GPU objetivo: NVIDIA GB10 (especificada en el README del autor).
- El kernel está ajustado para el modelo `AxionML/Qwen3.5-0.8B-NVFP4`, que requiere soporte para cuantización NVFP4 (disponible en GPUs Blackwell).
- No se especifica VRAM mínima; al ser un kernel de decode, el requisito principal es la memoria del modelo (0.8B en NVFP4, aproximadamente 0.4 GB) más los estados recurrentes.
- Opciones de despliegue: vLLM (parcheado con `apply_kernel.py`), o carga directa mediante la librería `kernels` de HuggingFace.
- El kernel no es compatible con GPUs sin soporte para Triton o sin la arquitectura GB10 (aunque podría adaptarse).
- No se proporcionan datos de latencia o throughput para otras GPUs.

## Comparativa con modelos similares

Este repositorio no es un modelo, sino un kernel de decodificación. La comparativa más relevante es contra el kernel de decode de vLLM (upstream) y contra la implementación de FLA (flash-linear-attention):

| Aspecto | Este kernel (GDN packed decode) | Upstream vLLM | FLA (flash-linear-attention) |
|---|---|---|---|
| Tipo | Kernel Triton empaquetado | Kernel integrado en vLLM | Librería de kernels para atención lineal |
| Decode throughput (GB10, GSM8K-10) | 219.9 tok/s | 205.5 tok/s | no disponible |
| Precisión GSM8K-10 | 5/10 | 5/10 | no disponible |
| Corrección vs FLA | 6/6 (atol=rtol=2e-2) | no verificado | referencia |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Disponibilidad | Hub de HuggingFace | vLLM | GitHub |

## Limitaciones y advertencias

- Es un kernel de decode únicamente; no cubre la fase de prefill ni la de entrenamiento.
- El ajuste se ha realizado para una GPU específica (GB10) y un modelo concreto (Qwen3.5-0.8B-NVFP4); su rendimiento en otras GPUs o modelos puede variar significativamente.
- Requiere vLLM 0.27.1 y la librería `kernels` de HuggingFace; la integración con versiones posteriores de vLLM no está garantizada.
- El uso de `trust_remote_code=True` implica ejecutar código arbitrario del repositorio; se debe revisar el código antes de usarlo en entornos de producción.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una contribución reciente y poco validada por la comunidad.
- No se proporcionan datos de sesgos, alucinación o calidad de generación, ya que no es un modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/baladhurgesh97/triton-gdn-decode
- Modelo asociado (AxionML/Qwen3.5-0.8B-NVFP4): https://huggingface.co/AxionML/Qwen3.5-0.8B-NVFP4
- GitHub de la sumisión al concurso FlashInfer (referencia relacionada): https://github.com/yahya010/flashinfer-gdn-submission
- Análisis de Qwen3.5 GDN en Zhihu (en chino): https://zhuanlan.zhihu.com/p/2007937984738129405
- Documentación de Triton: https://triton-lang.org/main/index.html
