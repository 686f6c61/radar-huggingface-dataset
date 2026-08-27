# mbehr90/Qwen3.8-Flash-Next-fp8

## Resumen

El modelo `mbehr90/Qwen3.8-Flash-Next-fp8` es una cuantización en precisión FP8 del modelo multimodal `Qwen/Qwen3.8-Flash-Next`, desarrollado por Alibaba. Este último es un modelo de mezcla de expertos (MoE) ultra disperso con 125 000 millones de parámetros totales, de los cuales se activan 6 000 millones por token, y que incorpora una tabla de incrustaciones n-gram de 51 000 millones de parámetros adicionales. La arquitectura combina atención Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), lo que reduce el coste de entrenamiento e inferencia frente a modelos densos de capacidad similar.

La cuantización, realizada por el autor `mbehr90`, convierte únicamente los 48 × 512 expertos enrutados a FP8 con cuantización dinámica por token, manteniendo el resto de componentes (embeddings, atención, expertos compartidos, torre de visión, etc.) en bf16. El resultado reduce el tamaño del checkpoint de 335,3 GiB a 220,8 GiB, lo que facilita el despliegue en entornos con múltiples GPU. El modelo está verificado en 4 × NVIDIA H100 80 GB y se sirve mediante vLLM, con soporte para prompts de texto e imagen.

Esta ficha es relevante para desarrolladores que necesitan evaluar rápidamente una opción cuantizada de un modelo MoE multimodal de última generación, con un equilibrio entre calidad y eficiencia de memoria, y que requieren conocer sus especificaciones técnicas, requisitos de hardware y limitaciones antes de integrarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra disperso con GDN + QSA (híbrido atención lineal y sparse) |
| Parametros totales | 179 999 981 459 (según safetensors; el modelo base declara 125B + 51B de tabla n-gram) |
| Parametros activos | 6 000 000 000 (6B por token) |
| Longitud de contexto | no disponible (el ejemplo de servicio usa 8192, pero no es el máximo oficial) |
| Tipos de cuantizacion | FP8 (per-output-channel weights, dynamic per-token activations) solo en expertos enrutados; resto en bf16 |
| Idiomas soportados | no disponible (el modelo base de Qwen suele ser multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cuantización compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-Flash-Next` emplea una arquitectura MoE ultra dispersa con 125B parámetros y 6B activos por token. La atención combina Gated DeltaNet (GDN) en tres de cada cuatro capas, que comprime el historial de forma eficiente, y Qwen Sparse Attention (QSA) en la cuarta capa para recuperación precisa de contexto largo. Además, incorpora una tabla de incrustaciones n-gram de 51B parámetros (PLE) que mejora la predicción de tokens frecuentes. El entrenamiento del modelo base redujo el coste a aproximadamente 1/9 del de Qwen3.7-Plus, manteniendo o mejorando capacidades en código y tareas ofimáticas.

La cuantización FP8 de este checkpoint se realizó sin calibración, ya que FP8_DYNAMIC es solo de pesos: las activaciones se cuantizan en tiempo de ejecución. El autor extrajo los tensores de los expertos enrutados (fusión `[512, 1280, 2560]` y `[512, 2560, 640]`), los dividió en proyecciones individuales y verificó el orden mediante correlación de magnitud con una conversión de referencia. El `quantization_config` excluye 1319 módulos no expertos, por lo que solo se cuantizan los expertos enrutados. No se aplicó ningún paso de entrenamiento o ajuste posterior.

## Capacidades

- Generación de texto multimodal: acepta entradas de imagen y texto, y produce respuestas de texto (pipeline `image-text-to-text`).
- Razonamiento y comprensión de contexto largo: gracias a la combinación GDN + QSA, puede manejar secuencias largas con eficiencia, aunque el contexto máximo no se ha especificado en la información disponible.
- Generación de código y tareas ofimáticas: el modelo base destaca en estas áreas según la documentación oficial.
- Conversación multi-turno: etiquetado como "conversational", apto para asistentes y chatbots.
- Soporte de tool calling y agentes: no se menciona explícitamente en la información proporcionada; se desconoce si el modelo base lo implementa.
- Capacidades multilingües: no se detallan los idiomas soportados; se recomienda consultar la documentación del modelo base.

## Casos de uso

- Asistentes virtuales multimodales: el modelo puede procesar imágenes y texto en conversaciones, permitiendo responder preguntas sobre fotografías, diagramas o documentos escaneados. Su ventana de contexto (aunque no especificada) y su arquitectura eficiente lo hacen adecuado para interacciones prolongadas.
- Generación de código en entornos de desarrollo: con capacidades destacadas en programación, puede integrarse en IDE o pipelines de CI/CD para sugerir implementaciones, revisar código o generar tests. La cuantización FP8 reduce el coste de memoria, facilitando su despliegue en clústeres con GPU.
- Análisis de documentos técnicos: al combinar visión y lenguaje, puede extraer información de gráficos, tablas y figuras en informes, ayudando en tareas de investigación o documentación.
- Razonamiento matemático y lógico: el modelo base muestra buen rendimiento en tareas de razonamiento, por lo que puede utilizarse en sistemas de tutoría o resolución de problemas complejos.
- Búsqueda y recuperación de información en corpus largos: gracias a QSA, puede atender consultas que requieren localizar información específica en documentos extensos, como manuales o bases de conocimiento.
- Prototipado de aplicaciones multimodales: al ser una cuantización lista para vLLM, permite probar rápidamente funcionalidades de visión-lenguaje en entornos de investigación o desarrollo sin necesidad de GPUs de gran capacidad individual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otras cuantizaciones. Se recomienda consultar la documentación del modelo base `Qwen/Qwen3.8-Flash-Next` para obtener datos de rendimiento originales.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 220,8 GiB en disco. Con tensor parallelism de 4, cada GPU debe alojar aproximadamente 55,2 GiB de pesos, más overhead de activaciones y KV cache. En H100 80 GB cabe con margen.
- GPU recomendadas: 4 × NVIDIA H100 80 GB (verificado por el autor). También podrían usarse A100 80 GB o GPUs con 80 GB o más, siempre que soporten FP8 (H100, A100 con soporte FP8, etc.).
- No cabe en GPU de consumo (RTX 4090, etc.) por el tamaño del modelo y la necesidad de memoria unificada.
- Opciones de despliegue: vLLM (recomendado, con `--tensor-parallel-size 4`). Se requiere una versión de vLLM que registre `Qwen4ExpForConditionalGeneration`; vLLM 0.26.0 no lo soporta. También se puede usar `VLLM_PLE_CPU_OFFLOAD=1` para mantener la tabla n-gram (~95 GiB) en RAM del host.
- Latencia y throughput: no se proporcionan datos. Dependerá del hardware, la longitud de secuencia y el número de secuencias concurrentes (el ejemplo usa `--max-num-seqs 16`).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B n-gram | 6B | no disponible | bf16 | Apache 2.0 |
| mbehr90/Qwen3.8-Flash-Next-fp8 | 125B + 51B n-gram | 6B | no disponible | FP8 (expertos) | Apache 2.0 |
| Inferact/Qwen3.8-Flash-Next-NVFP4 | 125B + 51B n-gram | 6B | no disponible | NVFP4 | no disponible |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de otros MoE comparables en la información proporcionada. La cuantización FP8 reduce el tamaño en ~34% frente al bf16, manteniendo la misma arquitectura y número de parámetros. La versión NVFP4 (de Inferact) es otra cuantización de referencia, pero no se detallan sus especificaciones.

## Limitaciones y advertencias

- La cuantización solo afecta a los expertos enrutados; el resto del modelo permanece en bf16, lo que puede provocar una ligera pérdida de precisión en tareas que dependen de esos expertos, aunque no se han cuantificado los efectos.
- No se ha realizado calibración; la cuantización es dinámica por token, por lo que la calidad puede variar según la distribución de las activaciones en tiempo de inferencia.
- Requiere una versión específica de vLLM que soporte la arquitectura `Qwen4ExpForConditionalGeneration`; vLLM 0.26.0 no es compatible.
- La tabla n-gram (PLE) ocupa ~95 GiB y debe descargarse a memoria del host si se usa `VLLM_PLE_CPU_OFFLOAD=1`, lo que exige una máquina con abundante RAM.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas de esta cuantización. Se recomienda evaluar el modelo en el dominio de aplicación antes de usarlo en producción.
- El tamaño del checkpoint (220,8 GiB) implica un despliegue con múltiples GPU; no es adecuado para entornos con una sola GPU o hardware de consumo.

## Enlaces

- Modelo cuantizado: https://huggingface.co/mbehr90/Qwen3.8-Flash-Next-fp8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Artículo de ExplainX sobre el lanzamiento: https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026
