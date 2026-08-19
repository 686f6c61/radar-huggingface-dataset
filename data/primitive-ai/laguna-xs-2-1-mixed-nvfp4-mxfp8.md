# primitive-ai/Laguna-XS-2.1-mixed-NVFP4-MXFP8

## Resumen

Laguna-XS-2.1-mixed-NVFP4-MXFP8 es una cuantización de precisión mixta del modelo Laguna XS 2.1, desarrollada por Primitive AI. El modelo base, creado por Poolside, es un Mixture-of-Experts (MoE) de 33B parámetros totales con 3B activos por token, diseñado específicamente para coding agéntico y tareas de largo horizonte que requieren razonamiento multi-paso. Esta versión cuantizada combina NVFP4, MXFP8 y BF16 a nivel de módulo, logrando un tamaño de 19.3 GiB (4.96 bits/peso) y un rendimiento 2.07 veces superior al BF16 de referencia, sin pérdida medible de precisión en la suite de benchmarks publicada por el autor.

La relevancia de este modelo radica en que permite ejecutar un MoE de 33B en GPUs de 40 GB o incluso 24 GB, algo inviable con los pesos originales en BF16 (62.3 GiB). Al estar exportado en formato `compressed-tensors` estándar, se integra directamente con vLLM sin parches, lo que facilita su despliegue en producción. Es una opción atractiva para equipos que necesitan capacidades de agente de código en infraestructura local o con restricciones de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención de ventana deslizante y gating por cabeza (30 de 40 capas) |
| Parametros totales | 18.141.796.096 (según safetensors); modelo base: 33B totales |
| Parametros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4, MXFP8, BF16 (mixto por módulo) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (compressed-tensors: nvfp4-pack-quantized + mxfp8-quantized) |

## Arquitectura y entrenamiento

El modelo base Laguna XS 2.1 es un transformer MoE con 40 capas, de las cuales 30 utilizan atención de ventana deslizante con gating por cabeza, una innovación que reduce los requisitos de caché KV y acelera la inferencia. Los 3B parámetros activos por token se seleccionan mediante enrutamiento experto, lo que permite un equilibrio entre capacidad y eficiencia computacional.

Esta versión cuantizada no ha sido reentrenada ni ajustada: es una conversión de pesos pura desde el release oficial BF16. La cuantización mixta asigna NVFP4 a las capas menos sensibles, MXFP8 a las intermedias y mantiene BF16 en las capas críticas, todo ello seleccionado por módulo. El resultado se exporta en formato `compressed-tensors` estándar, compatible con vLLM sin modificaciones. Según la model card, no se realizó destilación ni fine-tuning, y el tokenizador y la plantilla de chat se mantienen intactos.

## Capacidades

- Generación de texto y razonamiento multi-paso, optimizado para tareas de coding agéntico.
- Soporte de tool calling y function calling, esencial para integrar el modelo en flujos de agente.
- Capacidad para manejar conversaciones multi-turno con contexto largo (el límite exacto no está disponible en la información proporcionada).
- Ejecución eficiente en local gracias a la cuantización mixta, con soporte nativo en vLLM.
- Compatible con decodificación especulativa (DFlash) para acelerar la generación.
- Multilingüismo: no se especifican idiomas soportados en la documentación disponible.

## Casos de uso

- Asistente de programación en IDE: el modelo puede sugerir código, completar funciones y explicar fragmentos complejos, aprovechando su entrenamiento en coding agéntico y su baja latencia (196 tok/s en decodificación single-stream).
- Agente autónomo para resolución de issues: gracias a su capacidad de razonamiento multi-paso y tool calling, puede analizar un repositorio, identificar errores y proponer parches, integrándose en pipelines de CI/CD.
- Generación de código en producción: con soporte para vLLM y un tamaño de 19.3 GiB, cabe en GPUs de 24 GB, permitiendo desplegar un servicio de generación de código en infraestructura on-premise.
- Automatización de tareas de terminal: el modelo base muestra fortaleza en tareas estilo terminal, por lo que puede usarse para interpretar comandos, generar scripts y automatizar operaciones de sistema.
- Chatbot técnico especializado: su capacidad de mantener conversaciones largas y su conocimiento de código lo hacen adecuado para soporte técnico interno, respondiendo preguntas sobre APIs, frameworks o depuración.
- Evaluación y refactorización de código legacy: el modelo puede analizar código existente, identificar patrones problemáticos y sugerir refactorizaciones, aprovechando su ventana de contexto amplia (aunque el límite exacto no se ha publicado).

## Benchmarks y rendimiento

El autor publicó una suite de 9 benchmarks con 1170 muestras, comparando esta cuantización con el modelo BF16 original y otras variantes oficiales. Los resultados se reproducen a continuación tal como aparecen en la model card:

| build | bits/weight | tamaño | suite % | Δ vs BF16 | tok/s | × BF16 |
|---|---|---|---|---|---|---|
| BF16 reference | 16.000 | 62.3 G | 74.4 | — | 1579 | 1.00 |
| official FP8 | 8.452 | 33.0 G | 76.9 | +2.6 | 917 | 0.58 |
| official INT4 | 5.729 | 22.4 G | 75.7 | +1.4 | 1301 | 0.82 |
| official NVFP4 | 5.161 | 20.1 G | 75.9 | +1.5 | 3182 | 2.01 |
| **este repo** | **4.963** | **19.3 G** | **74.7** | **+0.3** | **3268** | **2.07** |

El autor señala que la columna de precisión (suite %) está dentro del ruido estadístico (±2–2.5 puntos entre ejecuciones idénticas), por lo que la diferencia de +0.3 puntos no es significativa. Sin embargo, las mejoras en tamaño y throughput sí son consistentes y reproducibles. La decodificación single-stream se midió en 196 tok/s sin decodificación especulativa. No se han publicado benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada: 19.3 GiB, por lo que cabe en GPUs con 24 GB de memoria (por ejemplo, RTX 3090, RTX 4090, A5000) y en GPUs de 40 GB (A100, L40S) con margen.
- GPU recomendada: el autor probó en una RTX PRO 6000 Blackwell (96 GB), pero la cuantización está diseñada para funcionar en GPUs de 40 GB o menos.
- Compatibilidad con consumer GPU: sí, cualquier GPU con 24 GB o más puede cargar el modelo, aunque el rendimiento dependerá del ancho de banda de memoria.
- Opciones de despliegue: vLLM es el soporte principal (comando `vllm serve primitive-ai/Laguna-XS-2.1-mixed-NVFP4-MXFP8`). Al ser formato `compressed-tensors`, también podría usarse con otras herramientas que soporten este formato, aunque no se mencionan explícitamente.
- Latencia y throughput: 3268 tok/s con decodificación especulativa y concurrencia 32; 196 tok/s en decodificación single-stream sin especulación.

## Comparativa con modelos similares

La comparación más directa es con las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos MoE de tamaño similar en la información proporcionada.

| Modelo | Parámetros totales | Activos | Tamaño | bits/peso | Throughput (tok/s) | Licencia |
|---|---|---|---|---|---|---|
| Laguna-XS-2.1 BF16 (original) | 33B | 3B | 62.3 GiB | 16.0 | 1579 | OpenMDW-1.1 |
| Laguna-XS-2.1 FP8 (oficial) | 33B | 3B | 33.0 GiB | 8.45 | 917 | OpenMDW-1.1 |
| Laguna-XS-2.1 INT4 (oficial) | 33B | 3B | 22.4 GiB | 5.73 | 1301 | OpenMDW-1.1 |
| Laguna-XS-2.1 NVFP4 (oficial) | 33B | 3B | 20.1 GiB | 5.16 | 3182 | OpenMDW-1.1 |
| **Este repo (mixto NVFP4/MXFP8)** | **33B** | **3B** | **19.3 GiB** | **4.96** | **3268** | **OpenMDW-1.1** |

En cuanto a otros modelos de coding agéntico de tamaño similar (por ejemplo, Qwen2.5-Coder-32B o DeepSeek-Coder-V2-Lite), no se dispone de datos comparativos en la información proporcionada, por lo que no se incluyen.

## Limitaciones y advertencias

- Sesgos y alucinación: no se han publicado evaluaciones específicas sobre sesgos o tasas de alucinación para esta cuantización. Como modelo de código, puede generar soluciones incorrectas o inseguras si no se supervisa.
- Limitaciones de contexto: la longitud exacta de contexto no está disponible en la documentación pública. Se recomienda verificar el límite real antes de usarlo en aplicaciones que requieran ventanas muy largas.
- Restricciones de licencia: OpenMDW-1.1 es una licencia de código abierto con condiciones específicas para uso comercial. Es necesario revisar el texto completo de la licencia incluido en el repositorio antes de desplegar el modelo en producción.
- Riesgo de degradación en tareas fuera del dominio: el modelo está especializado en coding y tareas de terminal; su rendimiento en dominios generales puede ser inferior al de modelos de propósito general de tamaño similar.
- Dependencia de vLLM: aunque el formato `compressed-tensors` es estándar, el soporte de NVFP4 y MXFP8 puede requerir versiones recientes de vLLM y hardware compatible (Blackwell o Ampere+). En GPUs más antiguas, el rendimiento podría verse afectado.
- Sin garantías de precisión en todos los casos: el autor admite que la suite de benchmarks tiene ruido estadístico, por lo que la paridad con BF16 no está garantizada en todas las cargas de trabajo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/primitive-ai/Laguna-XS-2.1-mixed-NVFP4-MXFP8
- Modelo base: https://huggingface.co/poolside/Laguna-XS-2.1
- Blog de Poolside sobre Laguna XS 2.1: https://poolside.ai/blog/introducing-laguna-xs-2-1
- Blog de Poolside sobre Laguna XS.2 y M.1: https://poolside.ai/blog/introducing-laguna-xs2-m1
- Technical report (arXiv): https://arxiv.org/pdf/2605.27605
