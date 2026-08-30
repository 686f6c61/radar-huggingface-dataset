# Allan143/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso de 27 000 millones de parámetros, desarrollado por el equipo Qwen de Alibaba, que integra un codificador de visión para comprensión multimodal de imágenes y vídeo. Se presenta como la generación más capaz de la familia abierta Qwen hasta la fecha, con mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo. Su arquitectura híbrida combina atención lineal (Gated DeltaNet) con atención completa (Gated Attention) en una proporción de 48 capas lineales frente a 16 capas completas, lo que reduce el coste computacional manteniendo la calidad.

El modelo soporta un contexto nativo de 262 144 tokens, extensible hasta 1 000 000, e incorpora un modo de pensamiento flexible que puede activarse o desactivarse por petición, con control de profundidad de razonamiento mediante `reasoning_effort`. Está diseñado para ejecutarse en hardware local de gama alta y es compatible con los principales frameworks de inferencia como Transformers, vLLM, SGLang y TokenSpeed. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, atención híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors, sin versiones cuantizadas publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B utiliza una arquitectura de transformer causal con un codificador de visión integrado. El bloque de lenguaje se compone de 64 capas organizadas en un patrón repetitivo: cada grupo de 4 capas contiene 3 capas con Gated DeltaNet (atención lineal con estado recurrente constante) y 1 capa con Gated Attention (atención completa). Esta hibridación permite reducir el coste computacional frente a una atención completa en todas las capas, manteniendo la capacidad de modelar dependencias de largo alcance. La dimensión oculta es de 5120, con 48 cabezas de atención lineal para V y 16 para QK (dimensión de cabeza 128), y 24 cabezas para Q y 4 para KV en la atención completa (dimensión de cabeza 256, RoPE de 64 dimensiones). El FFN tiene una dimensión intermedia de 17 408.

El entrenamiento se realizó en dos etapas: pre-entrenamiento y post-entrenamiento. Se incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación y la coherencia del texto generado. No se especifican detalles sobre el volumen de datos de entrenamiento ni sobre técnicas de alineación como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento activable por petición y control de profundidad mediante `reasoning_effort`.
- Comprensión multimodal nativa de imágenes y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Codificación agéntica de nivel frontera, con planificación autónoma y manejo de feedback del entorno para completar tareas de principio a fin.
- Soporte de tool calling y function calling, integrable en pipelines de agentes y flujos de automatización.
- Capacidades multilingües (idiomas no especificados en la información disponible).
- Preservación del contexto de razonamiento histórico mediante `preserve_thinking`, útil en conversaciones multi-turno con razonamiento encadenado.

## Casos de uso

- Automatización de oficina: el modelo puede procesar documentos, generar informes, resumir correos y gestionar tareas administrativas complejas gracias a su capacidad de razonamiento y su ventana de contexto de 262K tokens, que permite manejar documentos extensos completos.
- Asistente de codificación en producción: con soporte de tool calling y modo agéntico, puede integrarse en entornos de desarrollo para generar código, revisar pull requests, ejecutar comandos en terminal y corregir errores de forma autónoma.
- Análisis de documentos técnicos y científicos: su comprensión de imágenes y diagramas STEM permite extraer información de figuras, tablas y gráficos en papers, patentes o manuales técnicos.
- Agente de atención al cliente con contexto largo: puede mantener conversaciones multi-turno recordando el historial completo gracias a su contexto nativo de 262K tokens, gestionando incidencias complejas sin perder información previa.
- Procesamiento de vídeo para vigilancia o revisión de contenido: al entender vídeos de hasta una hora, puede resumir grabaciones, detectar eventos relevantes o transcribir diálogos con contexto visual.
- Investigación y redacción académica: su capacidad de razonamiento profundo y su modo de pensamiento controlado permiten estructurar argumentos, revisar literatura y generar borradores con citas y referencias coherentes.

## Benchmarks y rendimiento

La model card del modelo incluye una tabla comparativa de benchmarks de texto con modelos como Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, abarcando categorías como coding, trabajo profesional, investigación y tareas agénticas. Sin embargo, los valores numéricos de dichos benchmarks no están disponibles en la información proporcionada. No se han publicado resultados numéricos verificables en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16/bf16, el modelo requiere aproximadamente 55 GB de VRAM (dado el tamaño del repositorio de 55.6 GB). Con cuantización int8 se reduciría a ~28 GB, y con int4 a ~14 GB, aunque no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: para ejecución en fp16 se necesitan GPUs de clase profesional como A100 (80 GB), H100 (80 GB) o A6000 (48 GB). Con cuantización int4 podría ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, TokenSpeed y llama.cpp (si se generan pesos GGUF). También está disponible en plataformas gestionadas como Groq y Qwen Cloud.
- Latencia y throughput: no se han proporcionado datos específicos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

La model card incluye una comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se dispone de las especificaciones técnicas ni de los resultados numéricos de estos modelos en la información proporcionada. No es posible realizar una comparativa detallada con datos verificables.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información proporcionada, pero como modelo de lenguaje entrenado con datos web, puede reflejar sesgos presentes en dichos datos.
- Riesgo de alucinación inherente a los modelos generativos; se recomienda verificar hechos y cifras en aplicaciones críticas.
- La longitud de contexto nativa de 262K tokens puede degradar el rendimiento si se supera; la extensión a 1M tokens requiere configuración adicional.
- Los idiomas soportados no están especificados, por lo que el rendimiento en idiomas distintos del inglés o chino no está garantizado.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo es una versión de un tercero (Allan143) que replica el modelo oficial de Qwen; se recomienda verificar la procedencia de los pesos antes de su uso en producción.

## Enlaces

- Repositorio HuggingFace (mirror): https://huggingface.co/Allan143/Qwen3.8-27B
- Repositorio HuggingFace oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub oficial: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog de AMD sobre ejecución local: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Documentación de Groq: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
