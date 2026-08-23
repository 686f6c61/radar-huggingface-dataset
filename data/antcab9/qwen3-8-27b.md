# Antcab9/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso de 27 mil millones de parámetros, desarrollado por el equipo Qwen de Alibaba Cloud. Se trata de la generación más reciente de la familia Qwen3.8, diseñada para sobresalir en tareas de codificación, trabajo profesional, investigación y agentes autónomos de largo horizonte. Es un modelo nativamente multimodal que comprende imágenes y vídeos, con control flexible del razonamiento y una arquitectura híbrida de atención que combina atención lineal recurrente y atención completa.

El modelo se publica bajo licencia Apache 2.0, lo que facilita su adopción comercial y su despliegue en infraestructuras locales. Su tamaño compacto para la categoría de 27B lo hace adecuado para hardware de consumo y servidores de gama media, manteniendo un rendimiento competitivo frente a modelos cerrados de mayor escala. Su contexto nativo de 262 144 tokens, extensible hasta un millón, lo posiciona como una opción sólida para tareas que requieren procesar documentos largos o mantener conversaciones extensas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model híbrido con vision encoder (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida de atención sobre 64 capas. De ellas, solo 16 ejecutan atención global completa (con intervalo de atención completa de 4), mientras que las 48 restantes usan atención lineal con estado recurrente constante (Gated DeltaNet). Esta combinación reduce el coste computacional del contexto largo manteniendo la capacidad de capturar dependencias globales. La dimensión oculta es de 5120, con un embedding de 248 320 tokens (padding) y una dimensión intermedia de FFN de 17 408. Incorpora entrenamiento con múltiples pasos de predicción de tokens (MTP, Multi-Token Prediction), lo que mejora la eficiencia de generación.

El modelo incluye un vision encoder nativo para procesar imágenes y vídeos, lo que lo convierte en un modelo de lenguaje y visión integrado. El entrenamiento consta de una fase de pre-entrenamiento y otra de post-entrenamiento, aunque no se especifican en la información disponible el volumen de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El modo de pensamiento está activado por defecto y puede desactivarse por petición, con control fino del esfuerzo de razonamiento mediante `reasoning_effort` y conservación del contexto de razonamiento en mensajes históricos con `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento multistep con control de esfuerzo de pensamiento (thinking mode).
- Comprensión de imágenes y vídeos, incluidos diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución de tareas agénticas de largo horizonte: planificación autónoma y manejo de feedback del entorno.
- Generación de código y uso de terminal, con rendimiento destacado en benchmarks de coding agéntico (Terminal Bench 2.1).
- Soporte de tool calling / function calling, integrable en pipelines de agentes.
- Multilingüismo: no se han publicado los idiomas soportados en la información disponible.
- MTP (Multi-Token Prediction) para generación más rápida.

## Casos de uso

- **Asistentes de programación en terminal**: el modelo puede ejecutar tareas de codificación agéntica directamente en la terminal, interpretando feedback del entorno y modificando archivos, gracias a su alto rendimiento en Terminal Bench 2.1.
- **Automatización de oficina**: procesa documentos, hojas de cálculo y presentaciones combinando visión (imágenes) y razonamiento, ideal para flujos de trabajo de ofimática.
- **Análisis de documentos técnicos y STEM**: con su capacidad de visión, puede leer diagramas, gráficos y ecuaciones en imágenes, facilitando la extracción de información y la resolución de problemas matemáticos.
- **Agentes autónomos de investigación**: su contexto largo (262K nativo, 1M extendido) permite mantener historiales extensos de razonamiento y feedback, adecuado para tareas de investigación que requieren múltiples pasos y consultas a herramientas.
- **Procesamiento de vídeo**: analiza vídeos de hasta una hora para generar resúmenes, responder preguntas sobre contenido visual o extraer metadatos, útil en vigilancia, educación o medios.
- **Chatbots de atención al cliente con contexto largo**: con 262K tokens de contexto, puede gestionar conversaciones multi-turno muy extensas sin perder el hilo, y desactivar el modo de pensamiento para respuestas rápidas.
- **Integración en pipelines de CI/CD**: su soporte de tool calling permite conectarlo a sistemas de integración continua para revisar código, ejecutar pruebas o generar documentación automáticamente.

## Benchmarks y rendimiento

Los datos de benchmarks disponibles en la información proporcionada son parciales. La model card del autor incluye una tabla comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero solo se ha extraído la sección de coding. El único dato completo es:

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible en el extracto | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados completos de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de la tabla quedan incompletos porque el extracto de la model card no incluye los valores numéricos.

## Requisitos de hardware

- **VRAM estimada**: con 27B parámetros en fp16 se requieren aproximadamente 54 GB de VRAM. Con cuantización a 8 bits (~27 GB) o 4 bits (~14 GB) podría caber en GPUs de consumo de gama alta.
- **GPU recomendadas**: A100 40/80 GB, H100, RTX 4090 (24 GB, con cuantización), RTX 6000 Ada (48 GB).
- **GPU de consumo**: sí, es viable en RTX 4090 con cuantización 4-bit, y en RTX 5090 (32 GB) con cuantización 8-bit.
- **Opciones de despliegue**: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. También se ha verificado ejecución en AMD Ryzen AI Max (APUs) y GPUs Radeon.
- **Latencia y throughput**: no disponible en la información proporcionada. La arquitectura híbrida con atención lineal reduce el coste del contexto largo, mejorando el throughput en secuencias extensas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B denso | 262K nativo, 1M extensible | Texto + visión (imagen/vídeo) | Apache 2.0 | Open weights en HuggingFace |
| Qwen3.6-27B | 27B | no disponible | Texto + visión | Apache 2.0 | Open weights |
| Qwen3.7-Plus | no disponible (probablemente MoE) | no disponible | Texto + visión | no disponible | Servicio cerrado (Qwen Cloud) |
| Muse Glimmer-30B | 30B | no disponible | Texto + visión | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se basa en la tabla de la model card, pero no se dispone de datos completos de rendimiento para todos los modelos.

## Limitaciones y advertencias

- **Sesgos y alucinación**: no se han publicado evaluaciones de sesgos ni tasas de alucinación. Como modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en contextos largos o con preguntas ambiguas.
- **Idiomas**: no se ha declarado la lista de idiomas soportados, lo que limita la planificación para despliegue multilingüe.
- **Cuantizaciones**: no se proporcionan formatos oficiales de cuantización, aunque el ecosistema de vLLM y llama.cpp podría generarlos. La compatibilidad con cuantización 4-bit u 8-bit no está garantizada sin pruebas adicionales.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo incluye un vision encoder y puede estar sujeto a derechos de terceros sobre los datos de entrenamiento. Se recomienda revisar los términos de uso de Qwen Cloud si se usa el servicio alojado.
- **Rendimiento en producción**: el modo de pensamiento activado por defecto puede incrementar la latencia y el coste computacional; se debe configurar `reasoning_effort` según la latencia requerida.
- **Contexto de 1M**: la extensión hasta 1M tokens no está garantizada en todos los entornos; requiere hardware con suficiente memoria y optimización de atención lineal.

## Enlaces

- [HuggingFace - Antcab9/Qwen3.8-27B](https://huggingface.co/Antcab9/Qwen3.8-27B)
- [HuggingFace - Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GitHub - AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [vLLM Recipes - Qwen/Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Cloudflare AI docs - qwen3.8-27b](https://developers.cloudflare.com/ai/models/%40cf/qwen/qwen3.8-27b/)
- [AMD blog - Run Qwen 3.8 27B on AMD Ryzen AI Max](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
