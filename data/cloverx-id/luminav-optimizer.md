# cloverx-id/LuminaV-Optimizer

## Resumen

LuminaV Optimizer (nombre de paquete `luminamoon`, especificación de algoritmo v1.5.5) es un **optimizador de entrenamiento en baja precisión** para redes neuronales profundas, no un modelo de lenguaje. Lo desarrolla el colectivo PROJECT LOOMY (Silver Moon / `@cloverxion` y Lumina Moon / `@cloverx-id`) y se publica en PyPI y Hugging Face bajo licencia Apache 2.0. Su objetivo es reducir el consumo de memoria y mejorar la estabilidad numérica al entrenar y ajustar transformers en `bfloat16` y `float16`, evitando la necesidad de mantener estados de optimizador en `float32`.

El componente central es una familia de variantes de *lookahead momentum* convexo (CLM, de doble búfer, y TD-CLM, de búfer único con defecto triangular) con acotación racional de Padé [13/6] y redondeo estocástico sin estado basado en MurmurHash3 de 32 bits. La implementación combina rutas SIMD en Rust (AVX-512/AVX2, NEON), kernels Triton AOT/JIT y soporte de Vulkan UMA, con backend PyTorch para CUDA, ROCm y XPU.

Es relevante ahora porque el ajuste fino de LLM en GPUs de consumo está limitado por la memoria de los estados del optimizador; un optimizador que opera nativamente en bf16/fp16 con redondeo estocástico reproducible puede reducir esa huella sin requerir `fp32` maestro. El repositorio incluye además un motor de datos (`LuminaMoon Data Engine`) y una suite de evaluación (`LSO-Eval v1.1.0`) con verificación mediante solver SMT Z3 y pruebas de paridad numérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Optimizador de descenso por gradiente con lookahead momentum convexo (CLM / TD-CLM); no es un modelo neuronal |
| Parametros totales | no disponible (no aplica: es un optimizador, no un modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | Opera en `bfloat16` y `float16`; redondeo estocástico de 32 bits (MurmurHash3); no se documentan formatos de cuantizacion de pesos |
| Idiomas soportados | `en` (documentacion y metadatos; el software es agnostico al idioma del modelo entrenado) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica (paquete Python/Rust; el repo pesa 0.0 GB y no contiene pesos) |

## Arquitectura y entrenamiento

LuminaV no entrena un modelo: es el algoritmo de optimización que se aplica durante el entrenamiento. Su diseño parte de dos variantes de momentum con lookahead convexo: CLM, que mantiene dos búferes de estado, y TD-CLM, que usa un único búfer y modela el defecto triangular entre iteraciones. La actualización se acota mediante una aproximación racional de Padé [13/6], que sustituye funciones trascendentes costosas por una división de polinomios, y el redondeo a baja precisión se realiza de forma estocástica y sin estado con MurmurHash3 de 32 bits, lo que garantiza reproducibilidad bit a bit sin almacenar generadores aleatorios por parámetro.

La implementación es modular: núcleo en Rust con rutas SIMD (AVX-512, AVX2, NEON), kernels Triton con compilación AOT y JIT, backend Vulkan para memoria unificada (UMA) y una capa PyTorch para CUDA, ROCm y XPU. El repositorio incluye además el motor de datos `LuminaMoon Data Engine` (normalización de texto SIMD, filtrado por entropía de Shannon, deduplicación MinHash/XXH3-64, enmascarado de PII y recuperación de checkpoints ping-pong de 128 B) y la suite `LSO-Eval v1.1.0`, que valida el optimizador con el solver SMT Z3, benchmarks de trayectorias 2D, pruebas de paridad numérica y evaluación sobre un LLM de 4B (Qwen3.5-4B) y un modelo de visión. No se especifican en la información disponible el número de tokens, la composición del dataset ni si se empleó RLHF o DPO, ya que no corresponde a un modelo generativo.

## Capacidades

- Actualización de parámetros en `bfloat16` y `float16` sin estado maestro en `float32`, orientada a reducir la huella de memoria del optimizador.
- Variantes CLM (doble búfer) y TD-CLM (búfer único) con lookahead momentum convexo.
- Acotación racional de Padé [13/6] para estabilidad numérica en baja precisión.
- Redondeo estocástico sin estado (MurmurHash3 de 32 bits) reproducible y determinista.
- Fusión opcional de *buckets* contiguos y precalentamiento JIT de kernels Triton.
- Aceleración SIMD en CPU (AVX-512, AVX2, NEON) y soporte Vulkan UMA.
- Backends para CUDA, ROCm y XPU a través de PyTorch; kernels Triton AOT/JIT.
- Compatibilidad con Python 3.10 a 3.15t (free-threaded).
- Suite de verificación LSO-Eval con comprobaciones Z3, paridad numérica y benchmarks de trayectoria.
- Motor de datos auxiliar: normalización SIMD, filtrado por entropía, deduplicación MinHash/XXH3-64 y enmascarado de PII.

## Casos de uso

- **Ajuste fino de LLM en GPUs de consumo:** al mantener los estados del optimizador en bf16/fp16, permite entrenar o hacer *fine-tuning* de transformers de 7B-13B en tarjetas con 24 GB de VRAM donde un optimizador AdamW en fp32 no cabría.
- **Entrenamiento con memoria restringida en clúster:** la variante TD-CLM de búfer único reduce el estado por parámetro frente a CLM de doble búfer, útil cuando el presupuesto de VRAM por GPU es el cuello de botella.
- **Reproducibilidad de experimentos:** el redondeo estocástico sin estado basado en hash permite repetir una ejecución bit a bit sin guardar estados RNG por parámetro, lo que facilita auditorías y comparaciones entre *runs*.
- **Investigación en optimizadores:** la suite LSO-Eval con Z3 y benchmarks de trayectorias 2D sirve para validar numéricamente nuevas variantes de momentum antes de escalarlas a modelos grandes.
- **Preprocesado de datasets a gran escala:** el motor de datos integrado aplica normalización SIMD, deduplicación MinHash/XXH3-64 y enmascarado de PII en streaming, adecuado para preparar corpus de entrenamiento sin salir del mismo stack.
- **Despliegue en hardware heterogéneo:** las rutas AVX-512/AVX2/NEON, Vulkan UMA, CUDA, ROCm y XPU permiten usar el mismo optimizador en estaciones CPU, GPUs AMD/NVIDIA e iGPUs con memoria unificada.
- **Integración en pipelines existentes de PyTorch:** al ser un paquete PyPI (`luminamoon`), se puede sustituir el optimizador en un script de entrenamiento estándar sin reescribir el bucle de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una verificación empírica de las etapas II-IV de LSO-Eval sobre LuminaV v1.5.3 con `torch.bfloat16` y `centered_defect=False`, y una validación con Qwen3.5-4B, pero no se incluyen cifras numéricas (loss, perplejidad, throughput ni comparación con AdamW) en los datos proporcionados.

## Requisitos de hardware

- **VRAM estimada:** no disponible como cifra concreta; el ahorro depende del modelo entrenado y de la variante (CLM de doble búfer frente a TD-CLM de búfer único). El objetivo declarado es operar sin estados maestros en fp32.
- **GPU recomendadas:** no se especifican modelos concretos. El soporte abarca CUDA (NVIDIA), ROCm (AMD) y XPU (Intel) vía PyTorch, además de Vulkan UMA.
- **GPU de consumo:** el caso de uso declarado es *low-VRAM*, por lo que está pensado para tarjetas de consumo, aunque no se detallan modelos ni capacidades mínimas.
- **CPU:** rutas SIMD AVX-512, AVX2 y NEON, por lo que requiere un procesador con dichas extensiones para aprovechar la aceleración.
- **Despliegue:** instalación vía PyPI (`pip install luminamoon`); integración con PyTorch; kernels Triton AOT/JIT; backend Vulkan.
- **Latencia y throughput:** no disponible.

## Comparativa con modelos similares

No disponible. LuminaV es un optimizador, no un modelo de lenguaje, por lo que la comparación con LLM no aplica. Sus alternativas naturales serían optimizadores como AdamW, Lion, Sophia o 8-bit Adam, pero no se han proporcionado datos comparativos de rendimiento, memoria ni convergencia en la información disponible.

## Limitaciones y advertencias

- **No es un modelo:** no genera texto, no razona, no soporta tool calling ni agentes; es una librería de optimización. Cualquier uso como modelo de inferencia es un error de categoría.
- **Madurez y adopción:** 499 descargas y 2 *likes* en el momento de la consulta; proyecto de investigación con un único mantenedor principal visible, lo que implica riesgo de mantenimiento a largo plazo.
- **Verificación limitada:** los benchmarks publicados se reducen a LSO-Eval sobre un LLM de 4B; no hay evidencia pública de entrenamiento a gran escala (decenas de miles de millones de parámetros).
- **Idioma de la documentación:** solo en inglés (`en`), aunque el software es agnóstico al idioma del modelo.
- **Riesgo numérico:** el redondeo estocástico y la acotación de Padé introducen aproximaciones; en modelos muy sensibles a la precisión del optimizador conviene validar la convergencia frente a AdamW en fp32.
- **Licencia:** Apache 2.0 permite uso comercial, pero conviene revisar las dependencias transitivas (Rust, Triton, Vulkan) y sus licencias.
- **Compatibilidad:** el soporte de Python 3.15t (free-threaded) y de Vulkan UMA es reciente; en producción conviene fijar versiones y probar la paridad numérica con LSO-Eval.

## Enlaces

- Hugging Face: https://huggingface.co/cloverx-id/LuminaV-Optimizer
- Repositorio GitHub: https://github.com/cloverx-id/luminamoon
- Portal de documentación: https://cloverx-id.github.io/luminamoon/
- Paquete PyPI: https://pypi.org/project/luminamoon/
- Changelog del algoritmo: https://huggingface.co/cloverx-id/LuminaV-Optimizer/blob/main/CHANGELOG.md
- Guía del optimizador: https://huggingface.co/cloverx-id/LuminaV-Optimizer/blob/main/optimizer/README.md
- Guía del motor de datos: https://huggingface.co/cloverx-id/LuminaV-Optimizer/blob/main/data/README.md
- Guía de LSO-Eval: https://huggingface.co/cloverx-id/LuminaV-Optimizer/blob/main/eval/README.md
- Changelogs: https://huggingface.co/cloverx-id/LuminaV-Optimizer/blob/main/changelogs/README.md
- Configuración: https://huggingface.co/cloverx-id/LuminaV-Optimizer/blob/main/config.json
- Licencia: https://huggingface.co/cloverx-id/LuminaV-Optimizer/blob/main/LICENSE
- Notebook LSO-Eval v1.1.0 (Colab): https://colab.research.google.com/drive/1UepDza5Wm3KRNooCA2Bn69GIeKB21a4a?usp=sharing
- Paper referenciado en tags (arXiv:2010.06192): https://arxiv.org/abs/2010.06192
