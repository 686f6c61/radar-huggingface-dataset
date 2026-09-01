# PorkkChop/Qwen3.8-Flash-Next-oQ6e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ6e-mtp es una cuantización de 6 bits del modelo Qwen3.8-Flash-Next, un MoE ultra-sparse experimental publicado por el equipo de Qwen como preview de la arquitectura que dará lugar a Qwen4. Esta versión concreta ha sido generada por PorkkChop utilizando la herramienta oQ (oMLX v0.6.4) con cuantización mixta de precisión (oQe) basada en imatrix, y conserva los tensores de MTP (multi-token prediction). El resultado es un paquete en formato MLX safetensors, pensado para ejecutarse en Apple Silicon con memoria unificada.

El modelo base, Qwen3.8-Flash-Next, combina atención Gated DeltaNet (GDN) con Qwen Sparse Attention (QSA) en una arquitectura híbrida, activando solo 6B de sus 125B parámetros por token. Incluye además una tabla de embedding n-gram de 51B parámetros y 4B de MTP, lo que eleva el total a 125B según la documentación oficial. Esta cuantización oQ6e reduce el peso del modelo a aproximadamente 150 GB en disco, manteniendo la capacidad de razonamiento y el soporte multimodal del original.

La relevancia de este modelo radica en que permite ejecutar un MoE de última generación en hardware de consumo (Apple Silicon con suficiente RAM unificada) sin necesidad de GPUs dedicadas, a costa de una ligera pérdida de precisión frente a la versión sin cuantizar. Es una opción atractiva para desarrolladores que quieran experimentar con la arquitectura Qwen4 en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida GDN + QSA (Gated DeltaNet + Qwen Sparse Attention) |
| Parametros totales | 125B (modelo base), 41.467.352.419 en safetensors cuantizado |
| Parametros activos | 6B |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | oQ6e (6 bits, group size 64) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE ultra-sparse con dos mecanismos de atención complementarios: tres de cada cuatro capas usan Gated DeltaNet (GDN), que comprime el historial de forma eficiente, mientras que la cuarta capa utiliza Qwen Sparse Attention (QSA) para recuperación precisa de información a largo plazo. Esta combinación reduce el coste computacional y mejora la capacidad de manejar contextos muy largos (262K tokens). Además, incorpora una tabla de embedding n-gram de 51B parámetros y un módulo MTP de 4B que predice múltiples tokens a la vez, acelerando la generación.

Los datos de entrenamiento del modelo base no se han publicado en la información disponible. Se sabe que es un modelo multimodal (texto e imagen) y que ha sido entrenado con técnicas de razonamiento avanzado, incluyendo "preserved thinking" que mantiene bloques de razonamiento completos a lo largo de la conversación. La cuantización oQ6e se realizó con oMLX v0.6.4, utilizando imatrix para optimizar la asignación de bits y preservando los 76 tensores `mtp.*` para no degradar la capacidad de predicción multi-token.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte de "thinking mode" que mantiene cadenas de razonamiento explícitas.
- Comprensión multimodal: procesa entradas de texto e imagen (según la documentación del modelo base).
- Generación de código y resolución de problemas matemáticos, con buen rendimiento en tareas de programación (ver benchmarks de velocidad).
- Soporte de tool calling y function calling, lo que permite integrarlo en pipelines de agentes.
- Capacidad de razonamiento multi-step y uso de agentes, gracias al contexto largo y al "preserved thinking".
- Multilingüe (idiomas concretos no especificados en la información disponible).
- Predicción multi-token (MTP) que acelera la generación, preservada en esta cuantización.

## Casos de uso

- Asistentes de atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens), manteniendo el historial completo y el razonamiento previo, lo que permite respuestas coherentes y consistentes en interacciones prolongadas.
- Generación de código en producción: con soporte de tool calling y buena velocidad de escritura (56 tok/s en oQ6e), puede integrarse en entornos de desarrollo local para autocompletar, revisar o refactorizar código, especialmente en equipos con Apple Silicon.
- Análisis de documentos extensos: su ventana de contexto de 262K tokens permite procesar libros técnicos, informes largos o bases de código completas en una sola pasada, extrayendo información y resumiendo sin necesidad de dividir el texto.
- Agentes autónomos: la combinación de "preserved thinking" y tool calling lo hace adecuado para agentes que deben planificar y ejecutar múltiples pasos, como automatización de tareas de investigación o gestión de sistemas.
- Prototipado de aplicaciones multimodales: al aceptar entradas de imagen, puede usarse para describir imágenes, extraer texto de capturas o generar respuestas contextuales en aplicaciones de asistencia visual.
- Experimentación con arquitecturas Qwen4: al ser un preview de la arquitectura futura, es útil para investigadores que quieran evaluar el rendimiento de GDN+QSA y MTP en tareas reales antes de la adopción generalizada.

## Benchmarks y rendimiento

La model card incluye mediciones de velocidad de inferencia en Apple M3 Ultra (256 GB) con oMLX 0.6.4, comparando esta cuantización oQ6e con oQ4e y oQ8e. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Métrica | oQ4e | oQ6e (este modelo) | oQ8e |
|---|---|---|---|
| Tiempo hasta completar (tarea corta) | 1.74 s | 2.07 s | 2.57 s |
| Tiempo hasta primer token | 0.51 s | 0.64 s | 0.67 s |
| Tokens escritos (tarea corta) | 79 | 80 | 80 |
| Velocidad de escritura (tok/s) | 64.4 | 56.1 | 42.1 |
| Velocidad de lectura (tok/s) | 51.2 | 40.3 | 38.9 |

Velocidad de escritura (tok/s) según longitud de contexto:

| Contexto | oQ4e | oQ6e | oQ8e |
|---|---|---|---|
| Código corto | 64.4 | 56.1 | 42.1 |
| 4K | 56.5 | 44.9 | 41.9 |
| 8K | 56.3 | 44.8 | 43.7 |
| 16K | 52.9 | 48.3 | 47.5 |

Velocidad de lectura (tok/s) según longitud de contexto:

| Contexto | oQ4e | oQ6e | oQ8e |
|---|---|---|---|
| Código corto | 51.2 | 40.3 | 38.9 |
| 4K | 732 | 597 | 581 |
| 8K | 772 | 728 | 716 |
| 16K | 729 | 785 | 763 |

## Requisitos de hardware

- Probado en Apple M3 Ultra con 256 GB de memoria unificada; el modelo requiere al menos ~150 GB de RAM unificada para cargar los pesos en memoria (tamaño del repo).
- No requiere GPU VRAM dedicada; funciona en Apple Silicon con memoria unificada.
- En equipos con menos memoria, se puede optar por la versión oQ4e (más ligera) o reducir el contexto.
- Opciones de despliegue: oMLX (librería MLX), compatible con entornos Python y con herramientas como llama.cpp (si se convierte a GGUF, aunque el formato nativo es MLX).
- Latencia y throughput: según las mediciones, la velocidad de escritura es de ~56 tok/s y la de lectura de ~40 tok/s en contexto corto, mejorando a ~600-700 tok/s en lectura con prompts largos (4K-16K).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B (6B activos) | 262K | FP8/BF16 | qwen-community-1.0 | safetensors |
| PorkkChop/Qwen3.8-Flash-Next-oQ6e-mtp | 125B (6B activos) | 262K | oQ6e (6 bits) | qwen-community-1.0 | MLX safetensors |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | 125B (6B activos) | 262K | oQ4e (4 bits) | qwen-community-1.0 | MLX safetensors |
| Jundot/Qwen3.8-Flash-Next-oQ8e-mtp | 125B (6B activos) | 262K | oQ8e (8 bits) | qwen-community-1.0 | MLX safetensors |

La comparativa se limita a las variantes de cuantización del mismo modelo base, ya que no se dispone de datos de otros modelos MoE comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: Qwen3.8-Flash-Next es un preview de la arquitectura Qwen4, por lo que puede presentar inestabilidades o comportamientos inesperados en producción.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Sesgos no documentados: no se ha publicado información sobre sesgos o evaluaciones de seguridad del modelo base.
- Licencia qwen-community-1.0: es una licencia comunitaria de Qwen; se debe revisar si permite uso comercial y qué restricciones impone (no se detalla en la información disponible).
- Requisitos de memoria: el tamaño del repo (150.5 GB) implica que solo es viable en equipos con al menos 192 GB de RAM unificada; en equipos con menos memoria, la cuantización oQ4e es más adecuada.
- Rendimiento de calidad no verificado: no se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para esta cuantización, por lo que no se puede garantizar que mantenga el rendimiento del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PorkkChop/Qwen3.8-Flash-Next-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Variante oQ4e: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Documentación de vLLM sobre el modelo: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
