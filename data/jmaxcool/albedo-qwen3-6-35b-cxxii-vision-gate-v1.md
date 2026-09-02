# JMaxCool/albedo-qwen3.6-35b-cxxii-vision-gate-v1

## Resumen

Albedo SN97 scrub candidate (CXXII vision-gate 80/20) es un modelo experimental derivado de `dendriteholdings/albedo-qwen3.6-35b-king-CXXII`, publicado por el usuario JMaxCool en HuggingFace. Se trata de un modelo de tipo Mixture-of-Experts (MoE) basado en la arquitectura Qwen3.5/3.6, con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos, según la información disponible sobre la familia Qwen3.6-35B-A3B.

El modelo forma parte de una serie de experimentos de "scrubbing" (poda selectiva de tensores) que el autor realiza sobre modelos base de Qwen. En esta variante concreta, se han eliminado 63 de 1045 tensores, de los cuales 50 corresponden a la torre de visión (79,4%) y 13 al router `mlp.gate` (20,6%). El objetivo declarado es evaluar el impacto de la poda selectiva en la similitud de huellas digitales (fingerprint similarity esperada de 0,939713 frente al modelo original CXXII).

La relevancia de este modelo reside en su naturaleza experimental: documenta un proceso de poda quirúrgica sobre un MoE moderno y permite estudiar cómo afecta la eliminación de componentes específicos (visión y router) al comportamiento global del modelo. No es un modelo pensado para producción, sino un artefacto de investigación dentro de una serie más amplia de experimentos del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (qwen3_5_moe) |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | ~3 B (familia Qwen3.6-35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia Qwen3.6-35B-A3B, que combina 35.000 millones de parámetros totales con solo 3.000 millones activos por token. Esta arquitectura permite un rendimiento comparable a modelos densos de tamaño similar con un coste de inferencia muy inferior, ya que solo se activa una fracción de los expertos en cada paso de forward.

La operación de "scrubbing" aplicada sobre el modelo base elimina selectivamente 63 tensores: 50 de la torre de visión (79,4% de los tensores eliminados) y 13 del router `mlp.gate` (20,6%). No se tocan los expertos, el shared expert ni las capas de atención. El proceso utiliza una semilla fija (61803) y un delta-scale de 1. La similitud de huella digital esperada frente al modelo original es de 0,939713, lo que indica que la poda introduce cambios moderados pero no destructivos en el comportamiento global.

No se dispone de información sobre el proceso de entrenamiento original del modelo base (datos, tokens, método de alineación) ni sobre un posible fine-tuning posterior al scrubbing. El modelo se presenta como "scrub candidate", lo que sugiere que es un paso intermedio en un pipeline de evaluación de poda.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.6-35B-A3B, que incluye razonamiento multi-step y generación de código.
- Capacidades de visión: parcialmente degradadas, ya que se ha eliminado el 79,4% de los tensores de la torre de visión. El modelo conserva algunos tensores de visión, pero su capacidad para procesar imágenes probablemente esté comprometida.
- Soporte de tool calling y function calling: no disponible en la información proporcionada, aunque es una capacidad estándar de la familia Qwen3.6.
- Capacidades multilingües: no disponible, aunque Qwen3.6 soporta múltiples idiomas de forma nativa.
- Modo thinking: no disponible, aunque Qwen3.6 incluye modos de razonamiento extendido en sus variantes estándar.

## Casos de uso

- Investigación sobre poda de modelos MoE: el caso de uso principal es estudiar cómo afecta la eliminación selectiva de tensores de visión y router al comportamiento global de un MoE moderno. Los investigadores pueden comparar este modelo con el original CXXII y con otras variantes de la serie para cuantificar el impacto de cada componente.
- Análisis de robustez de routers en MoE: al eliminar parcialmente el router `mlp.gate`, el modelo permite estudiar cómo se redistribuye la asignación de tokens a expertos y si el modelo mantiene coherencia en sus salidas.
- Evaluación de degradación de capacidades multimodales: dado que la torre de visión está mayoritariamente podada, el modelo sirve para medir qué porcentaje de capacidad visual se pierde y si el texto puro se ve afectado.
- Benchmark de similitud de representaciones: la métrica de fingerprint similarity (0,939713) puede utilizarse para calibrar métodos de comparación de modelos y estudiar la relación entre similitud estructural y comportamental.
- Desarrollo de técnicas de poda quirúrgica: el repositorio documenta un procedimiento reproducible (semilla, delta-scale, selección de tensores) que puede servir de referencia para otros experimentos de compresión de modelos.
- Estudio de transferencia de capacidades entre variantes: comparar este modelo con otras variantes de la serie (router-shared, dpo-verified) permite entender cómo interactúan diferentes intervenciones sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas de MMLU, HumanEval, GSM8K ni otros estándares. La única métrica declarada es la similitud de huella digital esperada (0,939713) frente al modelo original CXXII, que es una medida de similitud estructural, no de rendimiento.

## Requisitos de hardware

- VRAM estimada: al ser un MoE de 35B parámetros totales con ~3B activos, el modelo en BF16 requiere aproximadamente 72 GB de VRAM para cargar todos los pesos. Con cuantización a 8 bits se reduce a ~36 GB, y a 4 bits a ~18 GB.
- GPU recomendadas: para inferencia en BF16 se necesitan GPUs de clase profesional (A100 80GB, H100). Con cuantización 4-bit puede ejecutarse en GPUs de consumo con 24 GB (RTX 4090) o incluso 16 GB (RTX 5070 Ti) según la experiencia documentada con Qwen3.6-35B-A3B.
- Opciones de despliegue: llama.cpp y Ollama son las opciones más probables para consumer GPUs; vLLM o TGI para despliegue en servidor. No se ha verificado la compatibilidad específica de este modelo con estas herramientas.
- Latencia y throughput: no disponible. Como referencia, la familia Qwen3.6-35B-A3B alcanza velocidades de 20-40 tokens/s en GPUs consumer con cuantización 4-bit, pero este modelo concreto no ha sido evaluado.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| albedo-qwen3.6-35b-cxxii-vision-gate-v1 (este) | 35,95 B | ~3 B | no disponible | no disponible | Poda de visión y router |
| albedo-qwen3.6-35b-cxxii-router-shared-v1 | 35,95 B | ~3 B | no disponible | no disponible | Variante con router compartido |
| albedo-qwen3.6-35b-cxiv-dpo-verified-v1 | 36 B | ~3 B | no disponible | no disponible | Variante con fine-tuning DPO |
| Qwen3.6-35B-A3B (original) | 35 B | 3 B | 1M (según documentación) | Apache 2.0 (según documentación) | Modelo base sin poda |

La comparativa muestra que este modelo es una variante experimental de Qwen3.6-35B-A3B, con intervenciones específicas sobre la torre de visión y el router. No se dispone de datos de rendimiento para comparar directamente.

## Limitaciones y advertencias

- Modelo experimental: es un "scrub candidate", no un modelo pulido para uso en producción. Puede presentar comportamientos erráticos o degradados.
- Capacidades de visión comprometidas: el 79,4% de la torre de visión ha sido eliminado. No se recomienda su uso para tareas multimodales.
- Sin licencia declarada: no se puede determinar si es legalmente utilizable para fines comerciales o de investigación. Contactar con el autor antes de cualquier uso.
- Sin benchmarks publicados: no hay evidencia de que el modelo mantenga las capacidades del modelo base en tareas estándar.
- Sin información de entrenamiento: se desconoce el proceso de alineación, los datos de entrenamiento y si se realizó fine-tuning posterior al scrubbing.
- Riesgo de alucinación: al ser un modelo podado, puede aumentar la probabilidad de respuestas incoherentes o inventadas, especialmente en dominios que dependen de la visión.
- Reproducibilidad limitada: aunque el procedimiento de poda está documentado, la falta de información sobre el entorno de ejecución y las herramientas utilizadas dificulta la reproducción exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JMaxCool/albedo-qwen3.6-35b-cxxii-vision-gate-v1
- Variante router-shared: https://huggingface.co/JMaxCool/albedo-qwen3.6-35b-cxxii-router-shared-v1
- Variante dpo-verified: https://huggingface.co/JMaxCool/albedo-qwen3.6-35b-cxiv-dpo-verified-v1
- Documentación de Qwen3.6 (lmstudio.ai): https://lmstudio.ai/models/qwen3.6
- Guía de desarrollador de Qwen3.6 (lushbinary.com): https://lushbinary.com/blog/qwen-3-6-developer-guide-benchmarks-architecture-api-self-hosting/
- Guía para ejecutar Qwen3.6-35B-A3B en GPU de 16GB (magnus919.com): https://magnus919.com/2026/05/running-a-35b-moe-model-on-a-16gb-consumer-gpu/
