# RadixArk/Qwen3.8-27B-DSpark

## Resumen

Qwen3.8-27B-DSpark es un modelo de borrador (draft model) diseñado para acelerar la decodificación especulativa del modelo Qwen/Qwen3.8-27B-FP8, un transformer de 27 000 millones de parámetros en precisión FP8. Desarrollado por RadixArk, este especulador extiende la técnica DFlash incorporando características auxiliares del modelo objetivo y una cabeza de confianza que decide dinámicamente cuántos tokens proponer en cada paso de verificación. El resultado es una mejora sustancial de la latencia de inferencia sin sacrificar calidad, ya que el modelo objetivo valida y corrige las propuestas.

Con 1 359 284 737 parámetros (1,36 B) en BF16 y una arquitectura de 5 capas de atención completa con GQA, el modelo está entrenado mediante SpecForge y se sirve con SGLang. Su ventana de contexto alcanza 262 144 posiciones, lo que permite trabajar con secuencias muy largas. La métrica clave es la longitud de aceptación media: 3,39 tokens por paso de verificación en una evaluación de 1 164 peticiones, con picos de 4,57 en GSM8K. Es una pieza especializada, no un generador autónomo, y su relevancia radica en hacer viable el despliegue de modelos grandes en entornos con restricciones de latencia o throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 5 capas full-attention, GQA (40 cabezas de consulta, 8 de clave/valor), hidden size 5 120 |
| Parametros totales | 1 359 284 737 (1,36 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262 144 (maximo position embeddings) |
| Tipos de cuantizacion | Pesos del draft en BF16; el modelo objetivo usa FP8 |
| Idiomas soportados | No disponible (depende del modelo objetivo Qwen3.8-27B-FP8) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B-DSpark es un especulador DSpark, una evolución de DFlash que añade dos mecanismos clave: (1) inyección de características auxiliares extraídas de capas intermedias del modelo objetivo (capas 4, 16, 28, 40 y 52) para guiar la generación de borradores, y (2) una cabeza de confianza de tipo Markov con rango 256 que determina dinámicamente cuántos tokens proponer, en lugar de usar un número fijo. La arquitectura del draft es un transformer de 5 capas de atención completa con GQA, lo que reduce el coste computacional frente a modelos de borrador más grandes.

El entrenamiento se realizó con SpecForge, una librería especializada en decodificación especulativa, y el checkpoint publicado corresponde a `epoch_2_step_4166`. El bloque DSpark propone 7 tokens de borrador por paso, con un ancho de verificación de 8 (incluyendo el token bonus del objetivo). No se han publicado detalles sobre el dataset de entrenamiento ni el número total de tokens utilizados. La integración con SGLang requiere una versión con soporte DSPARK y el uso de `--trust-remote-code` para cargar el código personalizado.

## Capacidades

- Decodificación especulativa: genera secuencias de borrador de hasta 7 tokens que el modelo objetivo verifica en paralelo, reduciendo la latencia por token generado.
- Selección dinámica de longitud: la cabeza de confianza decide cuántos tokens proponer según el contexto, optimizando el equilibrio entre coste y tasa de aceptación.
- Integración con SGLang: se sirve junto al modelo objetivo mediante el algoritmo DSPARK, con soporte para tensor parallelism y estrategias de planificación de mamba.
- Contexto largo: hereda la ventana de 262 144 posiciones del modelo objetivo, adecuado para documentos extensos o conversaciones multi-turno.
- No es un generador autónomo: no produce texto por sí mismo; su función es exclusivamente acelerar la inferencia del modelo Qwen3.8-27B-FP8.
- Compatibilidad con cuantización: el draft se mantiene en BF16 sin cuantizar, mientras que el objetivo usa FP8, lo que preserva la calidad de las propuestas.

## Casos de uso

- Despliegue de asistentes conversacionales de baja latencia: al reducir el tiempo por token, permite respuestas más rápidas en chatbots basados en Qwen3.8-27B-FP8, mejorando la experiencia de usuario en aplicaciones interactivas.
- Generación de código en tiempo real: con una longitud de aceptación de 3,47 en HumanEval y 2,94 en LiveCodeBench, acelera herramientas de autocompletado o agentes de programación que requieren respuestas casi inmediatas.
- Procesamiento por lotes de documentos largos: la ventana de 262 144 tokens y la alta tasa de aceptación en tareas de razonamiento (4,57 en GSM8K) hacen viable el análisis de contratos, informes o artículos científicos en una sola pasada.
- Inferencia en entornos con recursos limitados: al usar un draft de solo 1,36 B en BF16 (~2,7 GB), se puede ejecutar el sistema completo en una GPU con 32 GB de VRAM, habilitando despliegues en hardware más asequible.
- Optimización de costes en API de generación: al aumentar el throughput por petición, se reducen los costes por token servido en infraestructuras de producción.
- Evaluación de modelos en tiempo real: en pipelines de evaluación o fine-tuning, la decodificación especulativa acelera la generación de respuestas para benchmarks como MT-Bench o Arena-Hard, reduciendo el tiempo de experimentación.

## Benchmarks y rendimiento

La métrica principal es la longitud de aceptación media (número de tokens aceptados por paso de verificación, incluyendo el token bonus). Los resultados se obtuvieron con el target en FP8, draft en BF16, bloque DSpark de 7 tokens, temperatura 0.6, top-k 20, top-p 0.95, thinking habilitado, `max_new_tokens=2048`, seed 0, y hasta 128 prompts por workload. Se evaluaron 1 164 peticiones en total.

| Workload | Longitud de aceptacion |
|---|---:|
| HumanEval | 3,47 |
| GSM8K | 4,57 |
| MATH-500 | 4,08 |
| LiveCodeBench | 2,94 |
| MBPP | 3,67 |
| AIME 2025 | 3,28 |
| LBPP | 3,03 |
| AIME 2026 | 3,07 |
| MT-Bench | 3,10 |
| Arena-Hard-v2 | 2,71 |
| Alpaca | 2,95 |

Media global: **3,39** (macro media entre workloads: 3,35). No se han publicado benchmarks de calidad de generación (MMLU, HumanEval score, etc.) porque el modelo no genera texto de forma autónoma; su rendimiento se mide exclusivamente en términos de aceleración.

## Requisitos de hardware

- VRAM estimada: el draft ocupa aproximadamente 2,7 GB en BF16 (1,36 B parámetros × 2 bytes). El modelo objetivo Qwen3.8-27B-FP8 ocupa unos 27 GB en FP8. En total, con overhead de SGLang y buffers, se recomienda al menos 32 GB de VRAM para ejecutar el sistema completo en una sola GPU.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB, o GPUs con 32 GB o más (por ejemplo, RTX 4090 24 GB podría no ser suficiente si se combina con el target; se necesitaría al menos 32 GB). Para despliegues multi-GPU, se puede usar tensor parallelism.
- Opciones de despliegue: SGLang con soporte DSPARK (versión main-branch). El comando de ejemplo incluye `--speculative-algorithm DSPARK`, `--speculative-draft-model-path RadixArk/Qwen3.8-27B-DSpark`, `--speculative-dspark-block-size 7`, `--speculative-draft-model-quantization unquant`, `--mamba-scheduler-strategy extra_buffer` y `--attention-backend fa3`.
- Latencia y throughput: no se proporcionan valores absolutos; la ganancia se mide por la longitud de aceptación (3,39 media). En la práctica, esto se traduce en una reducción aproximada del 70-80% en el número de pasos de verificación, aunque el speedup real depende del hardware y la carga.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros especuladores (DFlash, EAGLE, Medusa) en la información proporcionada. A nivel cualitativo, DSpark mejora DFlash al añadir características auxiliares del objetivo y una cabeza de confianza dinámica, lo que debería aumentar la tasa de aceptación en tareas donde la distribución del target es difícil de predecir. Sin embargo, no hay números publicados para una comparación directa. Se recomienda consultar los repositorios de DFlash y SpecForge para obtener referencias adicionales.

## Limitaciones y advertencias

- Modelo auxiliar: no puede usarse de forma independiente; requiere el modelo objetivo Qwen3.8-27B-FP8 y una infraestructura SGLang con soporte DSPARK.
- Licencia "other": no se especifican los términos exactos; podría incluir restricciones de uso comercial o modificación. Es necesario contactar con el autor antes de usar en producción.
- Ejecución de código remoto: el comando de servicio utiliza `--trust-remote-code`, lo que implica ejecutar código arbitrario del repositorio. Riesgo de seguridad si el modelo proviene de una fuente no verificada.
- Dependencia de la versión de SGLang: los resultados de aceptación se obtuvieron con un commit específico de la rama main; versiones anteriores o posteriores pueden variar el rendimiento.
- Sin información sobre sesgos o alucinaciones: al ser un modelo de borrador, no genera contenido directamente, pero su comportamiento depende del target. No se han evaluado sesgos en el draft.
- Contexto largo: aunque la ventana es de 262 144 tokens, el rendimiento real en secuencias extremadamente largas no está documentado; la evaluación se limitó a `max_new_tokens=2048`.
- Disponibilidad: el modelo tiene 0 descargas y 9 likes, lo que indica que es muy reciente y con poca validación externa.

## Enlaces

- [HuggingFace: RadixArk/Qwen3.8-27B-DSpark](https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark)
- [Modelo objetivo: Qwen/Qwen3.8-27B-FP8](https://huggingface.co/Qwen/Qwen3.8-27B-FP8)
- [DFlash (base del proyecto)](https://github.com/z-lab/dflash)
- [SpecForge (librería de entrenamiento)](https://github.com/sgl-project/SpecForge)
- [SGLang (servidor de inferencia)](https://github.com/sgl-project/sglang)
