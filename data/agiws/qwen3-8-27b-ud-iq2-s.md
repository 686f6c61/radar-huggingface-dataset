# agiws/Qwen3.8-27B-UD-IQ2-S

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal nativo (visión y texto) desarrollado por el equipo de Qwen de Alibaba. Pertenece a la generación Qwen3.8, que mejora capacidades en codificación, trabajo profesional, investigación y tareas agénticas de largo alcance. Con 27 mil millones de parámetros en arquitectura densa, ofrece una ventana de contexto nativa de 262 144 tokens, ampliable hasta 1 000 000. El modelo combina un encoder de visión con un núcleo de lenguaje híbrido que intercala capas de atención lineal (Gated DeltaNet) y atención completa (Gated Attention), lo que permite procesar imágenes y vídeo de alta duración.

El modelo `agiws/Qwen3.8-27B-UD-IQ2-S` es una cuantización GGUF en formato IQ2-S (2 bits) creada por el usuario agiws a partir del modelo base Qwen/Qwen3.8-27B, utilizando las herramientas de Unsloth (Dynamic GGUF). Esta cuantización reduce drásticamente el peso del modelo, haciéndolo viable en hardware de consumo (GPU con 8–12 GB de VRAM) sin perder las capacidades esenciales del modelo original. Es una opción práctica para desarrolladores que necesitan ejecutar un modelo multimodal de 27B en entornos locales o con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 bloques de (Gated DeltaNet → FFN) seguidos de (Gated Attention → FFN), 64 capas, con encoder de visión |
| Parametros totales | 26 895 998 464 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | IQ2-S (2 bits, GGUF) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifica la lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Qwen3.8-27B presenta una arquitectura híbrida innovadora: intercala capas de atención lineal con Gated DeltaNet (48 cabezas para V y 16 para QK, dimensión 128) y capas de atención completa (Gated Attention con 24 cabezas Q y 4 KV, dimensión 256). Cada bloque combina una de estas atenciones con una red feed-forward (FFN) de dimensión intermedia 17 408. El modelo también incluye un encoder de visión que procesa imágenes y vídeo, y un mecanismo de predicción multi-token (MTP) para mejorar la eficiencia en generación. La etapa de entrenamiento incluye pre-training y post-training, aunque no se especifican el número de tokens ni los métodos de alineación (RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento multihop, con modo de pensamiento ("thinking") activable o desactivable por petición y ajuste de esfuerzo (`reasoning_effort`).
- Comprensión de imágenes y vídeos (desde diagramas STEM hasta vídeos de una hora).
- Soporte de tool calling y function calling, con mejoras para parsear objetos anidados.
- Capacidad para tareas de agente autónomo: planificación, gestión de feedback del entorno y ejecución de tareas de largo horizonte.
- Compatible con herramientas de desarrollo como Unsloth Desktop, Codex y otras que requieren rol de desarrollador.
- Multilingüe (no se detalla la lista de idiomas).

## Casos de uso

- **Atención al cliente automatizada**: el modelo gestiona conversaciones de varios turnos con contexto largo (262K tokens) y puede integrar llamadas a herramientas para consultar bases de datos o APIs.
- **Análisis de documentos técnicos**: al procesar imágenes y texto, permite extraer información de diagramas, gráficos y páginas escaneadas, útil para revisión de documentación técnica o científica.
- **Generación y revisión de código**: con tool calling y soporte para agentes, puede integrarse en pipelines de CI/CD para generar, revisar y corregir código, así como ejecutar pruebas.
- **Asistentes de investigación**: razona sobre artículos largos y genera resúmenes, comparativas o respuestas a preguntas complejas con cadenas de razonamiento detalladas.
- **Automatización de oficina**: procesa correos, informes y datos en formato texto e imagen, y puede generar respuestas, programar tareas o extraer información estructurada.
- **Agentes de navegación web**: con la capacidad de tool calling y el modo thinking, puede planificar y ejecutar tareas en línea (búsquedas, formularios, extracción de datos) de forma autónoma.
- **Educación y tutoría**: al poder ajustar el razonamiento y mantener contexto largo, puede actuar como tutor interactivo que explica conceptos paso a paso y responde preguntas de seguimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Qwen3.8-27B declara mejoras en codificación, razonamiento y tareas agénticas, pero no se proporcionan cifras concretas. La cuantización IQ2-S puede degradar ligeramente la precisión en comparación con cuantizaciones más altas (por ejemplo, Q4_K_M), aunque no se aportan datos comparativos.

## Requisitos de hardware

- **VRAM estimada**: el peso del archivo GGUF no se especifica en la información. Para una cuantización IQ2 de un modelo de 27B, se estima un tamaño aproximado de 8–10 GB, lo que permitiría su ejecución en GPUs con 10–12 GB de VRAM (RTX 3080, RTX 4070, etc.). Sin embargo, no se dispone de confirmación oficial.
- **GPU recomendadas**: cualquier GPU con al menos 10 GB de VRAM para ejecutar con llama.cpp o vLLM. Para uso en CPU, se recomienda al menos 16 GB de RAM.
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM, TGI (Transformers Inference) y Unsloth Desktop. La documentación de Unsloth indica que el modelo base corre en 17 GB de RAM/VRAM con cuantización de 4 bits, por lo que IQ2-S debería requerir menos.
- **Latencia y throughput**: no se especifican datos concretos. La arquitectura con Gated DeltaNet reduce el coste de atención lineal, lo que acelera la inferencia en contextos largos, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. El modelo puede compararse con otros modelos densos de tamaño similar, como Qwen3-27B-A3B (MoE) o Qwen2.5-32B, pero no se ofrecen métricas de rendimiento. La principal diferencia con estos es la arquitectura híbrida con atención lineal y la capacidad multimodal nativa, así como la ventana de contexto de 262K tokens. No se puede confirmar la superioridad en benchmarks sin datos adicionales.

## Limitaciones y advertencias

- La cuantización IQ2-S (2 bits) puede causar pérdida de precisión y aumentar la frecuencia de alucinaciones, especialmente en tareas que requieren exactitud numérica o razonamiento detallado.
- El modelo base puede presentar sesgos inherentes a los datos de entrenamiento, pero no se documentan en la información.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo original (Qwen) para posibles restricciones adicionales sobre el uso de la visión.
- El tamaño del archivo GGUF no está confirmado; es posible que el repositorio contenga múltiples archivos, y el modelo específico `IQ2-S` es solo uno de ellos.
- No se especifican los idiomas soportados; aunque Qwen suele cubrir múltiples lenguas, no hay garantía de un rendimiento óptimo en todos los idiomas.
- Para producción, se recomienda validar el modelo con los casos de uso concretos y considerar cuantizaciones más altas (Q4_K_M, Q5_K_M) si la precisión es crítica.

## Enlaces

- [Modelo en Hugging Face (agiws/Qwen3.8-27B-UD-IQ2-S)](https://huggingface.co/agiws/Qwen3.8-27B-UD-IQ2-S)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio de GGUF de Unsloth](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF)
- [Documentación de Unsloth para Qwen3.8](https://unsloth.ai/docs/models/qwen3.8)
- [GitHub oficial de Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Blog de AMD sobre ejecución local de Qwen3.8-27B](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
