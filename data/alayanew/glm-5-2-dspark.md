# AlayaNeW/GLM-5.2-DSpark

## Resumen

GLM-5.2-DSpark es un modelo de borrador (draft model) diseñado para acelerar la inferencia del modelo GLM-5.2 de Z.ai mediante decodificación especulativa. Ha sido entrenado y publicado por AlayaNeW, y no es un LLM independiente: debe emparejarse con el modelo objetivo GLM-5.2 (en BF16 o FP8) en SGLang o vLLM para funcionar. El modelo implementa el algoritmo DSpark, que extiende el backbone de borrador paralelo DFlash con dos cabezas ligeras: una cabeza Markov de sesgo logit (dependencia de tokens intra-bloque de bajo rango) y una cabeza de confianza por posición (predicción de tasa de aceptación).

Con 4.389.682.945 parámetros (aproximadamente 4,39 mil millones), el modelo utiliza una arquitectura `Qwen3DSparkModel` con 5 capas de borrador (4 de atención deslizante y 1 de atención completa), un tamaño de bloque de 8 tokens y una ventana deslizante de 1024. El contexto efectivo está limitado por el modelo objetivo GLM-5.2, que soporta hasta 1M de tokens. La relevancia de este modelo radica en que permite reducir significativamente la latencia de decodificación en escenarios de producción con GLM-5.2, especialmente en tareas de razonamiento largo, generación de código y agentes, donde la verificación adaptativa basada en la cabeza de confianza puede ajustar dinámicamente el presupuesto de verificación sin pérdida de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3DSparkModel` (`qwen3_dspark`) |
| Parametros totales | 4.389.682.945 (4,39 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Limitada por el modelo objetivo GLM-5.2 (hasta 1M tokens; en los ejemplos de despliegue se usa 202752) |
| Tipos de cuantizacion | bfloat16 (nativo); el modelo objetivo puede ser BF16 o FP8 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura `Qwen3DSparkModel` implementada en la libreria `transformers` con el tag `qwen3_dspark`. La estructura de borrador consta de 5 capas: 4 capas con atención deslizante (sliding window de 1024 tokens) y 1 capa con atención completa. La atención es MHA (multi-head attention) con 64 cabezas Q y 64 cabezas KV, con un tamaño oculto de 6144 y dimensión de cabeza de 128. El tamaño de bloque de especulación (γ) es 8, y la inyección de KV del modelo objetivo se realiza en las capas `[1, 20, 38, 56, 75]` de GLM-5.2 (que tiene 78 capas en total). El vocabulario es de 154880 tokens, idéntico al de GLM-5.2.

El entrenamiento se realizó desde cero con una longitud de secuencia de 8k tokens, utilizando el framework DeepSpec. Los datos de entrenamiento son una mezcla de corpus de código, razonamiento, alineación en chino y contexto largo. Las respuestas fueron regeneradas por GLM-5.2 para construir la caché objetivo. El modelo incorpora una cabeza Markov de rango 512 y una cabeza de confianza habilitada con características Markov, que permite la verificación adaptativa (load-aware verify budget) en vLLM sin pérdida de losslessness.

## Capacidades

- Decodificación especulativa: genera bloques de 8 tokens candidatos en paralelo que son verificados por el modelo objetivo GLM-5.2, acelerando la inferencia.
- Cabeza de confianza: predice la tasa de aceptación por posición, permitiendo verificación adaptativa en vLLM (ajusta el presupuesto de verificación según la carga).
- Cabeza Markov: modela dependencias de tokens intra-bloque de bajo rango (rank 512) para mejorar la calidad de los borradores.
- Compatibilidad con SGLang y vLLM: soporte nativo del algoritmo DSpark en ambos servidores de inferencia.
- Multilingüe: entrenado con datos en chino e inglés, con buen rendimiento en categorías multilingües (AL 5.05 en Speed-Bench).
- No es un LLM independiente: no genera texto por sí solo; requiere el modelo objetivo GLM-5.2 para funcionar.

## Casos de uso

- Aceleración de inferencia en producción con GLM-5.2: el caso principal. Al emparejar este borrador con GLM-5.2-FP8 en SGLang o vLLM, se reduce la latencia de decodificación en tareas de generación larga, como razonamiento multi-paso o escritura extensa, gracias a la verificación paralela de bloques de 8 tokens.
- Despliegue de agentes de codificación de largo horizonte: GLM-5.2 está diseñado para tareas de agente de codificación prolongadas; este borrador acelera la generación de código y las llamadas a herramientas, manteniendo la calidad del modelo objetivo.
- Reducción de costes por token en APIs internas: al mejorar el throughput del servidor (más tokens por segundo con la misma VRAM), se reduce el coste por token servido en entornos con alta demanda.
- RAG con contexto largo: en tareas de retrieval-augmented generation con ventanas de hasta 202K tokens, el borrador mantiene una alta tasa de aceptación (AL 5.35 en la categoría RAG), reduciendo la latencia en consultas complejas.
- Generación multilingüe: para aplicaciones que requieren respuestas en chino e inglés, el borrador muestra el mejor rendimiento en la categoría multilingüe (AL 5.05), acelerando la generación en ambos idiomas.
- Verificación adaptativa bajo carga variable: con la cabeza de confianza, vLLM puede ajustar dinámicamente el presupuesto de verificación según la carga del servidor, manteniendo la pérdida de calidad en cero mientras se optimiza la latencia en horas punta.

## Benchmarks y rendimiento

Los resultados de Speed-Bench se obtuvieron con SGLang en 8 GPU NVIDIA B200 (TP8), con bloque de especulación de tamaño 8, sampling con temperatura 0.7 y top-p 0.95, con thinking deshabilitado. La métrica AL (acceptance length) es la media por petición de tokens completados dividida por pasos de verificación; cuanto más alta, mejor. Las columnas Pos 0-7 indican la probabilidad de aceptación en cada posición del bloque.

### Speed-Bench: Low Entropy

| Context Len | AL | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 |
|--------|------|-------|-------|-------|-------|-------|-------|-------|-------|
| 1k | 4.75 | 84.28 | 68.72 | 55.81 | 45.87 | 38.09 | 31.93 | 26.92 | 22.64 |
| 2k | 4.65 | 83.64 | 68.00 | 54.98 | 44.79 | 36.68 | 30.42 | 25.46 | 21.44 |
| 8k | 4.80 | 84.33 | 69.57 | 57.15 | 47.40 | 39.39 | 32.68 | 27.13 | 22.37 |
| 16k | 4.74 | 84.25 | 69.18 | 56.59 | 46.36 | 38.09 | 31.65 | 26.26 | 21.70 |
| 32k | 4.52 | 83.30 | 67.37 | 53.97 | 43.12 | 34.85 | 28.13 | 22.76 | 18.37 |

### Speed-Bench: Qualitative

| Categoria | AL | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 |
|------|------|-------|-------|-------|-------|-------|-------|-------|-------|
| coding | 4.34 | 84.21 | 66.83 | 51.88 | 40.30 | 31.43 | 24.66 | 19.54 | 15.67 |
| stem | 3.60 | 76.62 | 56.13 | 40.20 | 29.33 | 21.70 | 15.98 | 11.66 | 8.36 |
| humanities | 3.54 | 76.44 | 55.38 | 39.23 | 28.25 | 20.62 | 15.22 | 11.12 | 8.09 |
| math | 3.72 | 77.59 | 57.41 | 42.00 | 30.99 | 23.25 | 17.50 | 13.29 | 9.96 |
| multilingual | 5.05 | 84.59 | 70.43 | 59.02 | 50.43 | 43.45 | 37.50 | 32.31 | 27.60 |
| qa | 3.71 | 76.26 | 55.80 | 41.32 | 31.14 | 23.98 | 18.26 | 13.96 | 10.72 |
| rag | 5.35 | 87.21 | 74.31 | 64.01 | 55.02 | 47.85 | 41.40 | 35.39 | 30.29 |
| roleplay | 2.80 | 67.73 | 41.69 | 25.42 | 16.09 | 11.13 | 7.80 | 5.82 | 4.53 |
| reasoning | 4.19 | 80.65 | 62.19 | 47.78 | 37.65 | 29.79 | 24.06 | 19.99 | 16.51 |
| summarization | 4.53 | 84.10 | 67.37 | 54.29 | 43.26 | 34.78 | 28.23 | 22.50 | 18.14 |
| writing | 3.27 | 72.69 | 49.30 | 33.60 | 23.86 | 17.54 | 13.19 | 10.04 | 7.65 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de borrador ocupa aproximadamente 8,8 GB en BF16 (tamaño del repositorio). Se debe sumar la VRAM del modelo objetivo GLM-5.2 (BF16 o FP8), que es significativamente mayor.
- GPU recomendadas: el benchmark oficial se realizó con 8 GPU NVIDIA B200 (TP8). Para despliegues más pequeños, se requieren GPUs con al menos 24 GB de VRAM para el borrador más el modelo objetivo en FP8, aunque el rendimiento óptimo se obtiene con GPUs de datacenter (A100 80GB, H100, B200).
- En consumer GPU: no es realista para el modelo completo (GLM-5.2 + borrador) debido al tamaño del modelo objetivo. El borrador en sí cabe en una RTX 4090 (24 GB), pero el modelo objetivo no.
- Opciones de despliegue: SGLang (con `SGLANG_ENABLE_SPEC_V2=1` y `--speculative-algorithm DSPARK`) o vLLM (con `--speculative-config` con método `dspark`). Ambos requieren builds recientes con soporte nativo de DSpark.
- Latencia y throughput: no se han publicado métricas absolutas de latencia o throughput; los benchmarks se centran en la tasa de aceptación (AL) y las probabilidades de aceptación por posición, que son las métricas relevantes para decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| AlayaNeW/GLM-5.2-DSpark | 4,39 B | Qwen3DSparkModel (5 capas, sliding window 1024) | Limitado por GLM-5.2 (1M) | MIT | Borrador DSpark con cabeza Markov y de confianza |
| mgoin/GLM-5.2-speculator.dspark | no disponible | DSpark (extiende DFlash) | Limitado por GLM-5.2 | no disponible | Borrador DSpark para GLM-5.2-FP8, entrenado con la libreria speculators |
| GLM-5.2 (modelo objetivo) | 753 B (MoE, 469 B activos según REAP-pruned) | GLM MoE DSA con IndexShare | 1M tokens | no disponible | Modelo base de Z.ai; el borrador acelera su inferencia |

No se dispone de benchmarks comparativos directos entre ambos borradores DSpark en la información proporcionada.

## Limitaciones y advertencias

- No es un LLM independiente: este modelo no genera texto por sí solo. Intentar usarlo como un modelo de generación estándar producirá resultados sin sentido. Debe emparejarse con GLM-5.2 (BF16 o FP8) en SGLang o vLLM con soporte DSpark.
- Compatibilidad restringida: el borrador está entrenado específicamente para GLM-5.2. No funcionará con otros modelos objetivo, y requiere builds recientes de SGLang o vLLM con soporte nativo de DSpark.
- Sesgos y alucinaciones: al ser un modelo de borrador, no genera contenido final; los sesgos y alucinaciones del sistema dependen del modelo objetivo GLM-5.2. Sin embargo, los datos de entrenamiento del borrador (mezcla de código, razonamiento, alineación china y contexto largo) pueden introducir sesgos en las distribuciones de tokens propuestas.
- Rendimiento variable por categoría: la tasa de aceptación es significativamente menor en categorías como roleplay (AL 2.80) y writing (AL 3.27) en comparación con RAG (AL 5.35) o multilingüe (AL 5.05). En tareas creativas, la aceleración será menor.
- Limitaciones de contexto: aunque GLM-5.2 soporta hasta 1M tokens, los benchmarks de este borrador solo cubren hasta 32K de contexto. El rendimiento en contextos más largos no está verificado.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo objetivo GLM-5.2 puede tener su propia licencia que debe verificarse por separado.
- Sin garantías de producción: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido ampliamente probado en producción por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlayaNeW/GLM-5.2-DSpark
- Modelo objetivo GLM-5.2: https://huggingface.co/zai-org/GLM-5.2
- Modelo objetivo GLM-5.2-FP8: https://huggingface.co/zai-org/GLM-5.2-FP8
- Paper DSpark: https://arxiv.org/abs/2607.05147
- Framework DeepSpec: https://github.com/deepseek-ai/DeepSpec
- Borrador alternativo (mgoin): https://huggingface.co/mgoin/GLM-5.2-speculator.dspark
- Guia de GLM-5.2 (benchmarks y contexto 1M): https://www.glmmodel.net/
- Catalogo de modelos Microsoft Foundry (GLM-5.2): https://ai.azure.com/catalog/models/FW-GLM-5.2
- Especificaciones y precios de GLM 5.2: https://gate.ai/blog/glm-5-2-z-ai-specs-pricing-api-use-cases
- Repositorio GLM-spark (despliegue con vLLM): https://github.com/bird/GLM-spark
