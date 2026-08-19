# Lie24/Qwen3.8-27B-MTP-head-q4mlp

## Resumen

Este repositorio contiene un espejo byte-idéntico del head MTP (Multi-Token Prediction) cuantizado para el modelo Qwen3.8-27B, creado por polymorf bajo el alias `p0ly31` y replicado por el usuario Lie24. El head MTP es un módulo auxiliar que se acopla al modelo base Qwen3.8-27B para acelerar la inferencia mediante predicción especulativa de múltiples tokens, una técnica que reduce la latencia en generación autoregresiva. El modelo base, desarrollado por Alibaba Qwen, es un modelo denso de 27 000 millones de parámetros con capacidades nativas de visión y lenguaje, contexto de 262 000 tokens y licencia Apache 2.0.

El head MTP en sí es pequeño: 313 779 712 parámetros (0,9 GB en safetensors), con cuantización affine de 4 bits para las capas fully connected y MLP (grupo de 64) y un `draft_lm_head` de 3 bits. No es un modelo autónomo; su función es complementar al modelo principal durante el despliegue, permitiendo decodificación especulativa en frameworks como vLLM o SGLang. La relevancia de este repositorio radica en su disponibilidad inmediata para quienes necesiten el head MTP ya cuantizado, sin tener que generarlo a partir del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Head MTP (Multi-Token Prediction) para Qwen3.8-27B, basado en transformer denso |
| Parametros totales | 313 779 712 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base, 262 000 tokens) |
| Tipos de cuantizacion | Affine-4 bits (grupo 64) para capas FC/MLP; 3 bits para draft_lm_head |
| Idiomas soportados | No disponible (heredados del modelo base) |
| Licencia | No disponible (el mirror no especifica licencia; el modelo base es Apache 2.0) |
| Formato de pesos | safetensors (26 tensores, 945 903 182 bytes) |

## Arquitectura y entrenamiento

El head MTP es un componente adicional al modelo Qwen3.8-27B, que emplea una arquitectura densa híbrida GDN (Gated Dense Network) con encoder de visión integrado. El head se entrena para predecir varios tokens futuros simultáneamente, de modo que durante la inferencia el modelo puede generar varios tokens por paso, validando después con el modelo principal. Esta técnica, conocida como decodificación especulativa o MTP, reduce la latencia sin degradar la calidad de salida. El autor original (polymorf) participó en un desafío de cuantización MTP para MLX Fast, y el repositorio incluye referencias a una receta detallada en una nota de envío (V5 addendum), aunque no se proporcionan los detalles del entrenamiento en esta página. El head ha sido cuantizado con precisión mixta: capas fully connected y MLP en 4 bits con grupo de 64, y el `draft_lm_head` en 3 bits, lo que reduce significativamente el uso de memoria y acelera la inferencia en hardware con VRAM limitada.

## Capacidades

- No es un modelo autónomo: no genera texto, imágenes ni respuestas por sí mismo.
- Proporciona predicción multi-token (MTP) para el modelo base Qwen3.8-27B, permitiendo decodificación especulativa.
- Compatible con frameworks de inferencia que soporten MTP, como vLLM, SGLang o MLX Fast (según el contexto del desafío).
- Al ser un head cuantizado, facilita el despliegue en GPUs de consumo y entornos con memoria restringida.
- Las capacidades funcionales (razonamiento, visión, tool calling, etc.) dependen exclusivamente del modelo base Qwen3.8-27B, no de este head.

## Casos de uso

- Aceleración de inferencia en producción: al integrar este head MTP con Qwen3.8-27B en servidores vLLM o SGLang, se reduce la latencia por token generado, lo que es crítico en aplicaciones de chat en tiempo real o asistentes conversacionales.
- Despliegue en hardware de gama media: el head cuantizado (0,9 GB) permite ejecutar el modelo base con decodificación especulativa en GPUs con 16-24 GB de VRAM, como RTX 4090 o RTX 5090, sin necesidad de servidores dedicados.
- Investigación en decodificación especulativa: sirve como referencia para estudiar el impacto de la cuantización del head MTP en la calidad y velocidad de generación, comparando con heads sin cuantizar.
- Integración en pipelines de agentes autónomos: el modelo base Qwen3.8-27B está diseñado para tareas multi-paso; el head MTP reduce el tiempo de razonamiento, mejorando la capacidad de respuesta en agentes que requieren múltiples iteraciones.
- Evaluación de rendimiento en entornos edge: al ser un mirror byte-idéntico, permite reproducir experimentos del desafío MLX Fast en diferentes plataformas (AMD, Apple Silicon, etc.) sin variabilidad.
- Optimización de costes en la nube: al reducir la latencia, se pueden servir más peticiones por segundo con el mismo número de GPUs, disminuyendo el coste por inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este head MTP en la informacion disponible. El modelo base Qwen3.8-27B tiene benchmarks publicados (según la búsqueda web), pero no se dispone de datos comparativos para el head cuantizado. Se recomienda consultar el repositorio original de polymorf o el modelo base para métricas de rendimiento.

## Requisitos de hardware

- El head MTP ocupa 0,9 GB en disco y aproximadamente 0,3 GB en VRAM (considerando cuantización 4 bits y 3 bits), por lo que es despreciable frente al modelo base.
- Para ejecutar el modelo base Qwen3.8-27B con este head, se requiere VRAM suficiente para el modelo completo: en BF16, unos 54 GB; en FP8, unos 27 GB; en NVFP4 W4A4, unos 14 GB (según documentación de SGLang).
- GPUs recomendadas: H200, RTX PRO 6000, RTX 5090, DGX Spark (para FP8 o NVFP4); GPUs de consumo como RTX 4090 (24 GB) pueden ejecutar el modelo en cuantización 4 bits.
- Opciones de despliegue: vLLM, SGLang, LM Studio (con soporte AMD), MLX Fast (para Apple Silicon).
- Latencia y throughput: no disponibles para este head específico; dependen del modelo base y del hardware.

## Comparativa con modelos similares

No hay modelos comparables directos, ya que este repositorio contiene un head MTP auxiliar, no un modelo completo. Se puede comparar con el modelo base sin head:

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | Modelo completo con visión y lenguaje |
| Qwen3.8-27B + head MTP (este repo) | 27B + 0,3B | 262K | No disponible | Modelo base con decodificación especulativa |
| Qwen3-30B-A3B (alternativa similar) | 30B (3B activos) | 128K | Apache 2.0 | Modelo MoE con razonamiento |

La comparativa es limitada porque el head MTP no es un modelo independiente. Para alternativas al modelo base, se puede considerar Qwen3-30B-A3B (MoE) o Llama 3.1 70B, pero no son equivalentes.

## Limitaciones y advertencias

- Este repositorio es un mirror sin garantías: no se proporciona información sobre el proceso de cuantización, validación o rendimiento real.
- La licencia no está especificada en el repositorio; aunque el modelo base es Apache 2.0, el head MTP podría tener restricciones adicionales. Se debe contactar al autor original (polymorf) para aclarar.
- El head MTP no funciona sin el modelo base Qwen3.8-27B; no es un modelo autónomo.
- La cuantización de 3 bits en el `draft_lm_head` puede degradar la calidad de las predicciones especulativas, reduciendo la tasa de aceptación y, por tanto, la ganancia de velocidad.
- No hay datos de sesgos o alucinaciones específicos de este head; los riesgos del modelo base aplican.
- Para uso en producción, se recomienda validar el comportamiento del head con el modelo base en el hardware objetivo, ya que la compatibilidad con frameworks (vLLM, SGLang) no está garantizada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lie24/Qwen3.8-27B-MTP-head-q4mlp
- Repositorio original (polymorf): https://huggingface.co/p0ly31/Qwen3.8-27B-MTP-head-q4mlp (referenciado en el README)
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de AMD sobre ejecución local: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Especificaciones y requisitos (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Documentación SGLang: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- Modelo en LM Studio: https://lmstudio.ai/models/qwen3.8
