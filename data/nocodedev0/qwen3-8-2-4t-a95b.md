# Nocodedev0/Qwen3.8-2.4T-A95B

## Resumen

Qwen3.8-2.4T-A95B es el modelo insignia de código abierto de la serie Qwen3.8, desarrollado por Alibaba Qwen y publicado en agosto de 2026. Se trata de un modelo de lenguaje causal con arquitectura de mezcla de expertos (MoE) sparse que combina 2,4 billones de parámetros totales con unos 95 mil millones activos por token, lo que lo sitúa en la categoría de los modelos más grandes disponibles en abierto. Su diseño híbrido de atención (Gated DeltaNet + Gated Attention) y su ventana de contexto nativa de 262 144 tokens, ampliable hasta aproximadamente 1 010 000, lo convierten en una herramienta orientada a tareas de razonamiento complejo, agentes de larga duración y procesamiento de documentos extensos.

El modelo se publica en formato Transformers (safetensors) y es compatible con motores de inferencia como vLLM, SGLang y TokenSpeed. La versión oficial comercial, denominada Qwen3.8-Max, añade capacidades adicionales como entrada de visión, modo sin razonamiento y herramientas integradas, pero esta ficha se centra en el lanzamiento de pesos abiertos Qwen3.8-2.4T-A95B. Su relevancia actual radica en que acerca a la comunidad open source un rendimiento de nivel Max en tareas de codificación, investigación y trabajo profesional, algo que hasta ahora solo estaba disponible en APIs propietarias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con MoE sparse y atención híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 2 446 182 725 504 (2,4 T) |
| Parametros activos | 95 B (10 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262 144 nativo, extensible hasta ~1 010 000 tokens |
| Tipos de cuantizacion | No disponibles en la informacion proporcionada |
| Idiomas soportados | No disponibles en la informacion proporcionada (se espera multilingue, similar a la serie Qwen) |
| Licencia | qwen3.8-max (licencia propia de Qwen, no OSI) |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-2.4T-A95B utiliza una arquitectura de Transformer causal con un layout de capas que alterna bloques de atención lineal y atención con softmax. Concretamente, el modelo se organiza en 23 grupos de capas, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de MoE, y 1 sub-bloque de Gated Attention seguido de MoE, totalizando 92 capas. La dimensión oculta es de 8192, con 128 cabezas de atención lineal (dimensión de cabeza 128) y 64 cabezas de atención estándar (dimensión de cabeza 256, con 4 cabezas KV y RoPE de 64 dimensiones). El MoE cuenta con 512 expertos enrutados, de los que se activan 10 más 1 compartido, con una dimensión intermedia de 2048 por experto.

El modelo ha pasado por una fase de preentrenamiento y otra de postentrenamiento, e incorpora una técnica de Multi-Token Prediction (MTP) entrenada con múltiples pasos, lo que permite predecir varios tokens a la vez y mejorar la eficiencia de decodificación. No se han publicado detalles específicos sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, aunque la descripción oficial menciona "mejoras sustanciales en codificación, trabajo profesional, investigación y tareas de agentes de larga duración". La arquitectura híbrida con Gated DeltaNet busca reducir el coste computacional de la atención sobre contextos largos, manteniendo la calidad de la atención softmax para las partes críticas.

## Capacidades

- Generación de texto de alta calidad en tareas de razonamiento, codificación, trabajo profesional e investigación.
- Razonamiento en modo pensamiento (thinking mode) configurable mediante el parámetro `reasoning_effort`, que permite ajustar la profundidad del razonamiento.
- Preservación del contexto de razonamiento histórico mediante `preserve_thinking`, útil para mantener el estado de razonamiento en conversaciones multi-turno.
- Soporte de agentes autónomos con planificación de múltiples pasos y manejo de feedback del entorno, orientado a tareas de larga duración.
- Capacidades de tool calling y function calling, compatibles con pipelines de agentes (aunque no se detalla el formato específico).
- Multilingüismo: no se especifican idiomas concretos, pero la serie Qwen3.5/3.6 es multilingüe, por lo que se espera cobertura de múltiples idiomas.
- Decodificación eficiente gracias a la predicción multi-token (MTP) y a la atención híbrida que reduce la carga de memoria en contextos largos.
- Compatibilidad con la API de Qwen Cloud y con herramientas de desarrollo como vLLM, SGLang y TokenSpeed.

## Casos de uso

- Agentes de codificación autónomos: el modelo puede ejecutar tareas de desarrollo de software de extremo a extremo, como resolver issues de repositorios, generar código completo o refactorizar, gracias a su capacidad de planificación multi-paso y manejo de feedback del entorno (evidenciado en Terminal Bench 2.1 y SWE-bench Pro).
- Asistente de investigación técnica: puede analizar documentos extensos (hasta 1 M de tokens) y extraer conclusiones, comparar resultados o redactar informes técnicos, aprovechando su contexto largo y su razonamiento profundo.
- Automatización de tareas de oficina: procesamiento de documentos legales, financieros o técnicos de gran volumen, con extracción de datos y generación de resúmenes ejecutivos.
- Desarrollo de herramientas de código asistido: integración en IDEs y pipelines de CI/CD para generación de tests, revisión de código y corrección de bugs, gracias a su soporte de tool calling.
- Sistemas de soporte al cliente con contexto largo: gestión de conversaciones multi-turno con historial extenso, manteniendo el razonamiento previo mediante `preserve_thinking`.
- Investigación académica y científica: análisis de papers, revisión de literatura, generación de hipótesis y síntesis de información de múltiples fuentes en contextos de más de 250k tokens.
- Despliegue en plataformas de inferencia escalables: integración en vLLM o SGLang para servir a múltiples usuarios con alta concurrencia en entornos cloud.

## Benchmarks y rendimiento

Los datos de benchmarks disponibles en la model card se limitan a la sección de Coding Agent. No se han publicado resultados completos de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada. A continuación se muestran los resultados reportados por el autor para Qwen3.8-Max (la versión oficial del modelo) junto con otros modelos de referencia:

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84,6 | 84,6 | 88,8 | 74,5 | 86,6 |
| SWE-bench Pro | 69,2 | 80,0 | 64,6 | 60,6 | 80,0 |

Nota: los valores de SWE-bench Pro para Qwen3.8-Max no se muestran completos en la información proporcionada (el dato aparece cortado), por lo que no se puede confirmar el valor exacto. Se recomienda consultar la fuente original.

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- El modelo tiene 2,4 T de parámetros totales, lo que hace inviable su ejecución en una sola GPU, incluso con cuantización agresiva. En FP16, el peso total supera los 4 TB.
- Se requiere un clúster de GPUs con memoria distribuida. Una configuración típica podría ser múltiples H100 (80 GB) o A100 (80 GB) conectadas con NVLink o InfiniBand, con al menos 50-60 GPUs para carga completa en FP16.
- Con cuantización a 4 bits (si se publicara), el modelo podría caber en unas 30-40 GPUs, pero no se han publicado pesos cuantizados oficiales.
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en estaciones de trabajo simples.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, y el servicio gestionado de Qwen Cloud (Qwen3.8-Max).
- Latencia y throughput: no hay datos publicados. Se espera que la decodificación MTP y la atención híbrida reduzcan la latencia respecto a modelos MoE puros, pero en entornos de multi-GPU la latencia dependerá críticamente de la interconexión.

## Comparativa con modelos similares

La comparativa se basa en los datos de la tabla de benchmarks proporcionada. No se dispone de información completa de otros modelos de la misma categoría (p. ej., Llama 4, Mixtral, DeepSeek) en la información disponible. La tabla anterior ya compara con los modelos que el autor considera competidores directos: Opus 4.8, Fable 5, GPT 5.6 Sol (max) y Qwen3.7-Max. De esos, Qwen3.8-Max es el que presenta mejores resultados en Terminal Bench 2.1 (86,6) y en SWE-bench Pro (80,0, aunque el dato puede ser igual al de Fable 5).

En cuanto a parámetros y contexto, Qwen3.8-2.4T-A95B se sitúa en la gama alta de los modelos abiertos, con un contexto nativo de 262k tokens y extensión hasta 1M, superando a la mayoría de alternativas open source, que suelen limitarse a 128k o 200k.

## Limitaciones y advertencias

- La licencia es `qwen3.8-max`, una licencia propia de Qwen que no es de código abierto estándar (no OSI). Debe revisarse el archivo LICENSE del repositorio para conocer las condiciones exactas de uso comercial y modificación.
- No se han publicado detalles sobre sesgos del modelo ni evaluaciones de seguridad (p. ej., toxicidad, sesgos de género o raza). Se recomienda realizar evaluaciones específicas antes de su uso en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran tamaño, especialmente en tareas de razonamiento complejo o con contextos muy largos. La ventana de 1M tokens puede aumentar el riesgo de incoherencias en tramos intermedios.
- Los idiomas soportados no están documentados oficialmente en la información disponible. Aunque la serie Qwen suele ser multilingüe, no se puede confirmar la cobertura exacta ni la calidad en idiomas de baja representación.
- El tamaño del modelo (2,4 T) implica un coste de inferencia muy elevado y una huella energética considerable. No es viable para despliegues en equipos de gama media o baja.
- No se han publicado benchmarks de rendimiento para tareas de visión, matemáticas o conocimiento general, por lo que la evaluación del modelo en esas áreas es limitada.
- La información sobre el entrenamiento (dataset, volumen de tokens, técnicas de RLHF/DPO) no está disponible, lo que dificulta evaluar su robustez y comportamiento en dominios específicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Nocodedev0/Qwen3.8-2.4T-A95B
- Repositorio oficial Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Página de Qwen3.8-Max en QwenCloud: https://www.qwencloud.com/models/qwen3.8-2.4t-a95b
- Documentación de NVIDIA NIM para Qwen3.8-2.4T-A95B: https://docs.nvidia.com/nim/large-language-models/latest/get-started/advanced/get-started-qwen3.8.html
- Página de Alibaba Cloud Model Studio: https://help.aliyun.com/en/model-studio/qwen3-8-2-4t-a95b
- Blog oficial de Qwen sobre Qwen3.8-Max: https://qwen.ai/blog?id=qwen3.8
