# mradermacher/Qwen3.8-27B-Uncensored-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Qwen3.8-27B-Uncensored, una variante del modelo Qwen3.8-27B de Alibaba, ajustada para eliminar restricciones de contenido. El autor, mradermacher, ha generado estos pesos cuantizados a partir de la versión uncensored publicada por JonathanColetti, con el objetivo de facilitar su ejecución local en hardware de consumo. El modelo base, según documentación externa, es un transformer con capacidades de visión y razonamiento, una ventana de contexto de 256K tokens y está diseñado para tareas de agente, codificación y chat. Esta versión cuantizada mantiene la misma arquitectura, aunque no se especifican detalles adicionales en el repositorio. El tamaño total del modelo es de 27.320.697.856 parámetros, y el repositorio ocupa 10.9 GB, lo que sugiere la inclusión de varias cuantizaciones con imatrix para optimizar el rendimiento en diferentes rangos de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base Qwen3.8-27B es un transformer con visión y razonamiento según documentación externa) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 256K según documentación externa) |
| Tipos de cuantizacion | No especificados en el repo; la model card menciona múltiples (Q2_K, IQ3_M, Q4_K_M, Q6_K, etc.) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se proporcionan detalles específicos sobre la arquitectura o el entrenamiento en el repositorio. El modelo base Qwen3.8-27B, según la documentación de Unsloth y otros recursos, es un transformer con capacidades de visión y razonamiento, entrenado con un contexto de 256K tokens. La versión "Uncensored" de JonathanColetti es un fine-tuning que elimina las restricciones de contenido habituales, aunque no se especifican los datos ni el método de ajuste. Las cuantizaciones de mradermacher se generan con imatrix (importance matrix) para mejorar la calidad de la cuantización, como se indica en los comentarios de la model card.

## Capacidades

- Generación de texto y chat conversacional, con soporte para múltiples turnos.
- Razonamiento y resolución de problemas complejos, según las capacidades del modelo base.
- Generación de código y tareas de agente (agentic coding), como se documenta para Qwen3.8-27B.
- Capacidades de visión (procesamiento de imágenes) según la documentación externa del modelo base, aunque no se ha verificado en esta versión cuantizada.
- Soporte de tool calling y function calling, probablemente heredado del modelo base, aunque no se confirma en el repo.
- Multilingüismo: no se especifican idiomas, pero el modelo base de Qwen suele soportar múltiples idiomas.

## Casos de uso

- Asistencia en programación: el modelo puede generar, revisar y depurar código en múltiples lenguajes, integrándose en entornos de desarrollo o pipelines de CI/CD gracias a su capacidad de razonamiento y generación de código.
- Chatbots sin censura para entornos controlados: útil en aplicaciones de investigación o simulación donde se requiere explorar temas sensibles sin filtros, siempre bajo supervisión humana.
- Análisis de documentos largos: con una ventana de contexto de 256K (según el modelo base), puede procesar libros, informes extensos o conversaciones largas para resumir o extraer información.
- Generación de contenido creativo: redacción de ficción, guiones o material de marketing sin restricciones temáticas, aprovechando la ausencia de censura.
- Agentes autónomos: al soportar tool calling y razonamiento multi-paso, puede actuar como agente en tareas como búsqueda de información, automatización de flujos de trabajo o gestión de tareas.
- Prototipado rápido de aplicaciones de IA: al ser un modelo de 27B con cuantizaciones GGUF, se puede desplegar localmente en estaciones de trabajo con GPU de gama media para pruebas y desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 27B, se necesitan aproximadamente 16-18 GB de VRAM con cuantización Q4_K_M, y alrededor de 20-24 GB con Q6_K o Q8_0. Las cuantizaciones más bajas (Q2_K, IQ3) pueden caber en 10-12 GB, aunque con pérdida de calidad.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB), o GPUs con 16 GB o más para cuantizaciones medias. En consumer, una RTX 4080 o 4090 es adecuada.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), text-generation-webui, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no se dispone de datos específicos; dependerá de la cuantización y el hardware. En una RTX 4090 con Q4_K_M, se puede esperar una generación de 20-40 tokens por segundo.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Al ser una versión "uncensored", el modelo puede generar contenido ofensivo, ilegal o inapropiado. No es adecuado para uso en producción sin filtros adicionales.
- Riesgo de alucinaciones: como cualquier LLM, puede inventar hechos o datos, especialmente en tareas de razonamiento complejo.
- La licencia no está especificada en el repositorio; se desconoce si mantiene la licencia Apache 2.0 del modelo base o si tiene restricciones adicionales. Se recomienda contactar al autor antes de uso comercial.
- No se han verificado las capacidades de visión en esta versión cuantizada; es posible que el soporte de imágenes requiera un proyecto multimodal adicional (mmproj) que no está incluido.
- La ventana de contexto de 256K no está confirmada en este repo; puede variar según la cuantización y el runtime utilizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-i1-GGUF
- Modelo original (JonathanColetti): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía de ejecución local (yottalabs.ai): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guía de LLMs sin censura por VRAM (InsiderLLM): https://insiderllm.com/guides/best-uncensored-local-llms/
