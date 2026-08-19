# aaarrbbee/Qwen3.8-2.4T-A95B

## Resumen

Qwen3.8-2.4T-A95B es el modelo de código abierto más grande de la familia Qwen, desarrollado por Alibaba y publicado en agosto de 2026. Se trata de un modelo de lenguaje de tipo MoE (Mixture of Experts) con 2,4 billones de parámetros totales y aproximadamente 95 mil millones de parámetros activos por token. Su arquitectura híbrida combina atención lineal Gated DeltaNet con atención completa (Gated Attention) en una estructura de 92 capas, lo que permite manejar contextos nativos de 262 144 tokens, extensibles hasta más de un millón. Este modelo representa la primera vez que Qwen libera un modelo de clase "Max" en formato abierto, con mejoras sustanciales en tareas de codificación, trabajo profesional, investigación y ejecución de agentes de largo horizonte.

La relevancia actual del modelo radica en su capacidad para abordar tareas complejas de múltiples pasos con mayor fiabilidad, gracias a un entrenamiento que incluye pre-training y post-training con predicción multi-token (MTP). Además, ofrece control flexible del razonamiento mediante parámetros como `reasoning_effort` y `preserve_thinking`, lo que permite ajustar la profundidad del razonamiento según las necesidades de cada aplicación. El modelo está disponible en formato Transformers y es compatible con motores de inferencia como vLLM, SGLang y TokenSpeed.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con Gated DeltaNet (atención lineal) y Gated Attention, 92 capas, 512 expertos enrutados (10 activos + 1 compartido) |
| Parametros totales | 2 446 182 725 504 (2,4 billones) |
| Parametros activos | ~95 mil millones (95B) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 010 000 tokens |
| Tipos de cuantizacion | No disponible (no se especifican en la documentación oficial) |
| Idiomas soportados | No disponible (la model card no detalla los idiomas) |
| Licencia | qwen3.8-max (otra, con restricciones específicas) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.8-2.4T-A95B emplea una arquitectura de MoE híbrido que intercala capas de atención lineal Gated DeltaNet con capas de atención completa Gated Attention. La disposición de capas sigue el patrón `23 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE))`, es decir, cada grupo de tres capas con atención lineal va seguido de una capa con atención completa. Esta combinación busca un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias de largo alcance. La atención lineal utiliza 128 cabezas para V y 16 para QK con dimensión 128, mientras que la atención completa emplea 64 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64 dimensiones. La capa MoE contiene 512 expertos enrutados con 10 activos más un experto compartido, con dimensión intermedia de 2048.

El entrenamiento se realizó en dos etapas: pre-training y post-training. La model card no especifica la cantidad de tokens de entrenamiento ni la composición del dataset. Se menciona que el modelo fue entrenado con predicción multi-token (MTP) en múltiples pasos, una técnica que mejora la eficiencia y la coherencia en la generación. No se detalla si se utilizaron métodos de alineación como RLHF o DPO, aunque por ser un modelo de última generación es probable que se hayan empleado, pero no se puede confirmar con la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para tareas de codificación, matemáticas y análisis profesional.
- Ejecución de agentes de largo horizonte: planificación autónoma, manejo de feedback del entorno y finalización fiable de tareas multi-paso.
- Control flexible del razonamiento mediante `reasoning_effort` (ajuste de la profundidad de razonamiento) y `preserve_thinking` (conservación del contexto de razonamiento en mensajes históricos).
- Contexto largo nativo de 262 144 tokens, extensible a más de 1 millón, adecuado para documentos extensos y conversaciones multi-turno.
- Compatibilidad con herramientas y harnesses de desarrollo populares (vLLM, SGLang, TokenSpeed), facilitando la integración en pipelines existentes.
- Capacidades multilingües: no especificadas oficialmente, pero por su origen y tamaño es probable que cubra múltiples idiomas (no confirmado).
- No se mencionan capacidades de visión o audio en la versión abierta; la versión comercial Qwen3.8-Max añade entrada de visión y herramientas integradas.

## Casos de uso

- Desarrollo de software a gran escala: el modelo puede generar, revisar y refactorizar código en repositorios extensos, aprovechando su contexto de 262K tokens para mantener coherencia en archivos grandes y dependencias cruzadas. Su rendimiento en benchmarks como Terminal Bench 2.1 (86.6) lo hace adecuado para tareas de agente de terminal.
- Agentes autónomos de larga duración: gracias a su capacidad de planificación y manejo de feedback del entorno, puede ejecutar tareas complejas que requieren múltiples pasos, como automatización de pruebas, despliegue de infraestructura o análisis de logs en tiempo real.
- Análisis de documentos extensos: con soporte de contexto de hasta 1M tokens, puede procesar libros completos, informes anuales, expedientes legales o investigaciones académicas, extrayendo información y respondiendo preguntas específicas sin perder el hilo.
- Asistente de investigación científica: puede resumir literatura, formular hipótesis, sugerir experimentos y redactar secciones de papers, manteniendo coherencia en discusiones largas y referencias cruzadas.
- Atención al cliente automatizada de alta complejidad: gestiona conversaciones multi-turno con historial extenso, resolviendo incidencias técnicas que requieren razonamiento profundo y acceso a documentación interna.
- Generación de código en producción con tool calling: aunque no se confirma explícitamente el soporte de function calling, su diseño moderno y compatibilidad con vLLM sugieren que puede integrarse en pipelines de CI/CD para autocompletar, revisar y corregir código automáticamente.

## Benchmarks y rendimiento

La model card proporciona una tabla de benchmarks parcial. Solo se dispone de datos completos para la prueba Terminal Bench 2.1 en la sección "Coding Agent". El resto de la tabla está truncada y no se puede leer. Se presentan los valores disponibles:

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84.6 | 84.6 | 88.8 | 74.5 | 86.6 |

No se han publicado resultados completos de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Se recomienda consultar la documentación oficial de Qwen para obtener datos adicionales.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 4892.4 GB en safetensors, lo que implica que en FP16 se necesitan aproximadamente 4,9 TB de VRAM para cargar todos los pesos. Incluso con cuantización agresiva (por ejemplo, 4 bits), se requerirían más de 1,2 TB, muy por encima de cualquier GPU de consumo.
- GPU recomendadas: no apto para GPU de consumo (RTX 4090, etc.). Requiere clústeres de múltiples GPUs de alta gama, como A100 80GB, H100 80GB o superiores. Por ejemplo, con H100 de 80GB se necesitarían al menos 62 GPUs en FP16, o unas 16 en cuantización de 4 bits.
- Opciones de despliegue: compatible con vLLM, SGLang y TokenSpeed, según la model card. También es posible usar Transformers con pipelines distribuidos, aunque no es eficiente para producción.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño, la latencia será alta y el throughput dependerá del número de GPUs y de la cuantización. Es un modelo pensado para despliegue en infraestructura cloud dedicada, no para entornos locales.

## Comparativa con modelos similares

La tabla de benchmarks incluye comparación con Opus 4.8, Fable 5, GPT 5.6 Sol (max) y Qwen3.7-Max. Sin embargo, no se dispone de especificaciones técnicas detalladas de estos modelos en la información proporcionada. Se puede comparar con Qwen3.7-Max, que es el predecesor directo:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Terminal Bench 2.1 |
|---|---|---|---|---|
| Qwen3.8-2.4T-A95B | 2,4T | 95B | 262K (ext. 1M) | 86.6 |
| Qwen3.7-Max | No disponible | No disponible | No disponible | 74.5 |

No se dispone de datos suficientes para comparar con otros modelos abiertos de tamaño similar (por ejemplo, DeepSeek-V3). Se recomienda consultar benchmarks independientes para una comparativa completa.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se ha publicado información específica sobre sesgos, pero al ser un modelo de gran tamaño, es susceptible de generar contenido sesgado o alucinaciones, especialmente en dominios poco representados en sus datos de entrenamiento.
- Requisitos de infraestructura: el tamaño del modelo (2,4T parámetros) hace que sea inviable para la mayoría de organizaciones sin acceso a clústeres de GPUs de alto rendimiento. El coste de inferencia es elevado.
- Licencia restrictiva: la licencia `qwen3.8-max` no es una licencia de código abierto estándar; impone restricciones de uso comercial que deben revisarse detenidamente antes de su adopción en producción.
- Contexto y idiomas: aunque el contexto nativo es de 262K tokens, la extensión a 1M puede requerir configuraciones específicas y puede degradar el rendimiento. Los idiomas soportados no están documentados, lo que limita la confianza en aplicaciones multilingües.
- Sin soporte de visión en la versión abierta: a diferencia de la versión comercial Qwen3.8-Max, esta versión no incluye entrada de visión ni herramientas integradas, por lo que no es adecuada para tareas multimodales.

## Enlaces

- HuggingFace (repo espejo): https://huggingface.co/aaarrbbee/Qwen3.8-2.4T-A95B
- HuggingFace (repo oficial): https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- QwenCloud (modelo): https://www.qwencloud.com/models/qwen3.8-2.4t-a95b
- Artículo de análisis (apxml): https://apxml.com/models/qwen38-24t-a95b
- GitHub oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Receta vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B
- Blog de Qwen (anuncio): https://qwen.ai/blog?id=qwen3.8
