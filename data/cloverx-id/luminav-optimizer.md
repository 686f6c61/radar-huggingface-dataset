# cloverx-id/LuminaV-Optimizer

## Resumen

LuminaV-Optimizer (publicado bajo el paraguas del paquete `luminamoon`, también conocido como Loomy) no es un modelo de lenguaje, sino un **optimizador numérico de bajo precision** para el entrenamiento de redes neuronales, junto con un conjunto de utilidades asociadas. Lo desarrollan Silver Moon (@cloverxion) y los contribuidores de Lumina Moon (@cloverx-id). Resuelve el problema del coste de memoria y cómputo en las actualizaciones de parámetros durante el entrenamiento, ofreciendo kernels SIMD en CPU (AVX-512/AVX2), soporte Vulkan UMA y kernels Triton para GPU, además de redondeo estocástico y modos de bajo consumo de VRAM.

El repositorio agrupa cuatro componentes activos: el optimizador LuminaV (matemática v1.6.0), el motor de datos LuminaMoon (v1.1.1.post2), el framework de evaluación LSO-Eval y una familia de capas neuronales racionales denominada Ra-Family (RaNorm, RaTanh, RaGELU, PosRaGLU, RaAttention con softmax racional Cayley-Padé). La implementación está escrita en Rust y Python, con arquitectura modular y soporte para Python 3.10 a 3.15 en modo free-threaded (abi3t).

Es relevante ahora porque aborda dos frentes candentes en el entrenamiento de LLM: la eficiencia de memoria en el estado del optimizador (crítico para ajustar modelos grandes en hardware limitado) y la sustitución de operaciones trascendentes (tanh, sqrt) por aproximaciones racionales acelerables por hardware. No obstante, conviene subrayar que **no es un modelo generativo**: no produce texto ni tiene parámetros de lenguaje, contexto o capacidades de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Optimizador numérico (no es un transformer); kernels SIMD CPU, Vulkan y Triton; familia de capas racionales Ra-Family |
| Parametros totales | no disponible (el artefacto no contiene pesos de modelo; tamaño del repo 0.0 GB) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible como cuantización de pesos; soporta bf16 y fp16 en el cómputo del optimizador y redondeo estocástico |
| Idiomas soportados | en (inglés, según metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (paquete Python/Rust distribuido vía PyPI; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

El componente central, LuminaV v1.6.0, es un optimizador con backend dual: rutas SIMD en CPU (AVX-512 y AVX2) y kernels Triton con compilación AOT y JIT, además de una ruta Vulkan para memoria unificada (UMA). Incorpora la llamada "Triangle Family" mediante los modos `buffer="T1"` y `"T2"`, fusión opcional de buckets contiguos y precalentamiento de kernels Triton JIT. El paquete incluye un motor de datos con normalización de texto SIMD (AVX-512/AVX2/NEON), filtrado por entropía de Shannon, deduplicación MinHash/XXH3-64, enmascarado de PII y recuperación de checkpoints con esquema Ping-Pong de 128 bytes.

La familia Ra-Family aporta capas neuronales libres de tanh y de raíz cuadrada: RaNorm, RaBatchNorm2d (con folding de pesos Conv2d), RaTanh, RaGELU, PosRaGLU (gating acotado en el intervalo (0,1)) y RaAttention con softmax racional Cayley-Padé. Estas capas se aceleran mediante Triton en GPU y SIMD AVX2/AVX-512 en Rust. No se proporcionan datos sobre el corpus de entrenamiento, número de tokens ni uso de RLHF/DPO, porque el artefacto no es un modelo entrenado sino una librería de optimización y evaluación. LSO-Eval ofrece verificación con el solver SMT Z3, benchmarks de trayectorias 2D y pruebas de paridad numérica.

## Capacidades

- Actualización de parámetros de redes neuronales con precisión reducida (bf16, fp16) y redondeo estocástico.
- Optimización con bajo consumo de VRAM mediante modos de memoria eficiente y fusión de buckets.
- Aceleración en CPU con SIMD AVX-512 y AVX2; aceleración en GPU con kernels Triton AOT/JIT y ruta Vulkan UMA.
- Preprocesamiento de datasets de texto: normalización SIMD, filtrado por entropía, deduplicación y enmascarado de PII.
- Capas neuronales racionales (RaNorm, RaTanh, RaGELU, PosRaGLU, RaAttention) como bloques alternativos para arquitecturas transformer.
- Evaluación y verificación de optimizadores: comprobaciones con Z3 SMT, benchmarks de trayectorias y pruebas de paridad numérica.
- Integración con PyTorch, NumPy y HuggingFace en un espacio de nombres Python free-threaded (abi3t).
- Soporte de plataformas CUDA, ROCm y XPU según los tags del repositorio.

## Casos de uso

- **Entrenamiento de LLM con VRAM limitada**: el modo de bajo consumo y el redondeo estocástico permiten mantener el estado del optimizador en bf16/fp16, reduciendo la huella de memoria frente a optimizadores en fp32 y facilitando el ajuste de modelos en GPUs de gama media.
- **Ajuste fino en infraestructura heterogénea**: la combinación de SIMD en CPU, Triton en GPU y Vulkan UMA permite desplegar el mismo optimizador en nodos con distintas aceleradoras (CUDA, ROCm, XPU) sin reescribir el pipeline.
- **Aceleración de preprocesamiento de corpus**: el motor de datos aplica normalización SIMD, deduplicación MinHash/XXH3-64 y enmascarado de PII sobre grandes volúmenes de texto antes del entrenamiento, reduciendo el coste de limpieza de datasets.
- **Investigación en arquitecturas racionales**: RaAttention con softmax Cayley-Padé y PosRaGLU permiten experimentar con alternativas a softmax y a las activaciones trascendentes en transformers, evaluando su impacto en estabilidad y coste.
- **Verificación formal de optimizadores**: LSO-Eval usa Z3 para comprobar propiedades del optimizador y ejecutar pruebas de paridad numérica, útil en equipos que necesitan validar corrección antes de producción.
- **Prototipado rápido en Python**: la instalación vía `pip install luminamoon` y la API expuesta (`LuminaV([weights, biases], lr=8e-4, weight_decay=0.08)`) permiten integrar el optimizador en scripts de PyTorch/NumPy existentes con cambios mínimos.
- **Benchmarking de trayectorias de optimización**: los benchmarks 2D de LSO-Eval sirven para comparar el comportamiento de LuminaV frente a optimizadores estándar en escenarios controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de documentación de evaluación (`eval/LSO_Eval.pdf`) y de benchmarks de trayectorias 2D, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni métricas de throughput o latencia comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de inferencia); el consumo depende del tamaño del modelo que se entrene y del estado del optimizador, que puede mantenerse en bf16/fp16.
- GPU recomendadas: no disponible de forma específica; los tags indican soporte para CUDA, ROCm y XPU, y la ruta Vulkan UMA.
- Cabe en GPU de consumo: no disponible; el modo de bajo consumo de VRAM está diseñado para reducir requisitos, pero no se publican cifras mínimas.
- Opciones de despliegue: instalación vía PyPI (`pip install luminamoon`) o compilación desde fuente con Maturin y toolchain Rust 2024; integración con PyTorch, NumPy y HuggingFace.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Aspecto | LuminaV-Optimizer | AdamW (referencia estándar) | bitsandbytes 8-bit optimizers | Lion |
|---|---|---|---|---|
| Categoría | Optimizador + utilidades | Optimizador | Optimizador cuantizado | Optimizador |
| Precisión de estado | bf16/fp16 con redondeo estocástico | fp32 (típico) | 8 bits | fp32 (típico) |
| Aceleración | SIMD AVX-512/AVX2, Triton, Vulkan | Nativa en frameworks | CUDA | Nativa en frameworks |
| Licencia | Apache-2.0 | BSD/MIT (según implementación) | MIT | Apache-2.0 |
| Datos de rendimiento publicados | no disponible | ampliamente reportados | ampliamente reportados | ampliamente reportados |

La comparación es orientativa: no se dispone de métricas publicadas de LuminaV que permitan una comparación cuantitativa con estos optimizadores.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto, no tiene contexto, ni capacidades de razonamiento, visión o tool calling. Cualquier expectativa en ese sentido es un malentendido del artefacto.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de convergencia, estabilidad o velocidad frente a optimizadores establecidos, lo que dificulta su adopción en producción sin validación propia.
- Madurez y soporte: proyecto de investigación con versiones activas (matemática v1.6.0, paquete v1.1.1.post2) y muy pocas señales de adopción (2 likes, 1256 descargas), lo que implica riesgo de mantenimiento y de cambios de API.
- Dependencia de toolchain específico: la compilación desde fuente requiere Rust 2024 y Maturin; el uso de Python free-threaded (abi3t) puede no ser compatible con todo el ecosistema.
- Idiomas: los metadatos solo declaran inglés para la documentación y el motor de datos; no hay soporte multilingüe documentado.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos de los componentes de terceros (Triton, Vulkan) y la ausencia de garantías.
- Riesgo de resultados no reproducibles: sin datos de entrenamiento ni métricas, la validez de las capas Ra-Family en tareas downstream no está demostrada de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/cloverx-id/LuminaV-Optimizer
- Repositorio GitHub: https://github.com/cloverx-id/luminamoon
- Documentación: https://cloverx-id.github.io/luminamoon/
- PyPI: https://pypi.org/project/luminamoon/
- DOI (Zenodo): https://doi.org/10.5281/zenodo.23973325
- Guía del optimizador: https://huggingface.co/cloverx-id/LuminaV-Optimizer/blob/main/optimizer/README.md
- Guía del motor de datos: https://huggingface.co/cloverx-id/LuminaV-Optimizer/blob/main/data/README.md
- Guía LSO-Eval: https://huggingface.co/cloverx-id/LuminaV-Optimizer/blob/main/eval/README.md
- Guía Ra-Family: https://huggingface.co/cloverx-id/LuminaV-Optimizer/blob/main/docs/nn/README.md
- Referencias teóricas: https://huggingface.co/cloverx-id/LuminaV-Optimizer/blob/main/references/README.md
- Referencia de API: https://huggingface.co/cloverx-id/LuminaV-Optimizer/blob/main/docs/en/03_configuration_api.md
