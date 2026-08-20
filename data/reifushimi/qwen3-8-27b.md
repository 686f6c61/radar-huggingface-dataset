# Reifushimi/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso de 27.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba, lanzado como parte de la generación Qwen3.8. Se trata de un modelo nativo de visión-lenguaje que entiende imágenes y vídeo, diseñado para tareas de codificación, trabajo profesional, investigación y agentes de larga duración. Su principal innovación es una arquitectura híbrida de atención que combina atención lineal recurrente (Gated DeltaNet) con atención completa, lo que le permite mantener una ventana de contexto nativa de 262.144 tokens ampliable hasta 1.000.000.

El modelo destaca por su control flexible del razonamiento: el modo de pensamiento está activado por defecto, puede desactivarse por petición, y permite ajustar la profundidad del razonamiento mediante el parámetro `reasoning_effort`. Incluye soporte nativo para tool calling y agentes, así como predicción de múltiples tokens (MTP). Está publicado bajo licencia Apache 2.0, lo que lo hace especialmente atractivo para despliegues locales y comerciales sin restricciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model híbrido con Vision Encoder (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | No especificados en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo causal denso con un codificador de visión integrado. La capa de lenguaje se compone de 64 capas ocultas con dimensión 5.120, organizadas en un patrón de 16 bloques de 3 capas de Gated DeltaNet (atención lineal) seguidas de una capa de Gated Attention (atención completa). Esto significa que solo 16 de las 64 capas utilizan atención completa, mientras que las 48 restantes emplean atención lineal con un estado recurrente constante. Esta combinación reduce el coste computacional del procesamiento de contexto largo sin sacrificar la capacidad de razonamiento.

El modelo fue entrenado en dos fases (pre-entrenamiento y post-entrenamiento) e incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos. El Vision Encoder permite procesar imágenes y vídeo, desde diagramas STEM hasta documentos y vídeos de larga duración. El control de razonamiento es configurable por petición, con la opción de conservar el contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.

## Capacidades

- Generación de texto avanzada con razonamiento configurable: modo pensamiento activado por defecto, desactivado por petición, y profundidad ajustable con `reasoning_effort`.
- Comprensión de imágenes y vídeo de forma nativa, incluyendo diagramas técnicos, documentos y vídeos de escala horaria.
- Codificación y trabajo profesional: mejoras sustanciales en tareas de coding, trabajo de oficina y automatización de procesos.
- Ejecución de agentes de larga duración: planificación autónoma, manejo de feedback del entorno y completación fiable de tareas multi-paso.
- Compatibilidad con tool calling y function calling, integrable en pipelines de agentes y herramientas.
- Ventana de contexto nativa de 262K tokens, ampliable a 1M, adecuada para documentos extensos y conversaciones multi-turno.
- Soporte de MTP (Multi-Token Prediction) para mayor velocidad de decodificación.
- Compatible con múltiples frameworks de inferencia: Hugging Face Transformers, vLLM, SGLang y TokenSpeed.

## Casos de uso

- **Automatización de oficina**: el modelo puede procesar documentos extensos, generar informes, resumir correos y gestionar flujos de trabajo de oficina con contexto largo, gracias a su ventana de 262K tokens que permite mantener documentos completos en memoria.
- **Asistente de programación en producción**: con soporte para tool calling y ejecución de agentes, puede integrarse en pipelines de CI/CD para generar código, revisar PRs y depurar errores de forma autónoma.
- **Análisis de documentos técnicos y científicos**: su capacidad de visión permite interpretar diagramas, tablas y figuras en papers, manuales técnicos y documentación de ingeniería.
- **Agente de atención al cliente multimodal**: puede procesar capturas de pantalla, vídeos de demostración y conversaciones largas para resolver incidencias de forma contextualizada.
- **Investigación y síntesis de literatura**: con 262K tokens de contexto nativo, puede procesar múltiples papers completos y generar revisiones, comparativas o resúmenes estructurados.
- **Procesamiento de vídeo para análisis de seguridad o inspección**: el modelo puede analizar vídeos de larga duración para extraer eventos, detectar anomalías o generar descripciones temporales.
- **Despliegue local en hardware de consumo**: al ser un modelo denso de 27B con licencia Apache 2.0, puede ejecutarse en estaciones de trabajo con GPU consumer (como RTX 4090) o en equipos AMD Ryzen AI Max, según el blog oficial de AMD.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks de rendimiento en texto, pero los datos numéricos no están completos en la información disponible. Se menciona explícitamente el benchmark **Terminal Bench 2.1 (Terminus)** para "Agentic terminal coding", en el que Qwen3.8-27B se compara con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. También se indica que para el benchmark MathVision se utilizó un prompt fijo con formato `\boxed{}` para Qwen3.8-27B.

No se dispone de los valores numéricos completos de los benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el tamaño del repo es de 55.6 GB en safetensors (pesos en FP16/BF16). Con cuantización a 8 bits podría requerir aproximadamente 28-30 GB de VRAM, y con 4 bits unos 15-16 GB. Estas cifras son estimaciones basadas en el tamaño de pesos, no en datos oficiales.
- **GPU recomendadas**: por su tamaño, es viable en GPU de gama alta consumer como RTX 4090 (24 GB) con cuantización 4 bits, o en GPUs profesionales como A100 (40/80 GB) o H100 para inferencia sin cuantizar.
- **Despliegue en consumer GPU**: sí, con cuantización. El blog oficial de AMD confirma soporte para AMD Ryzen AI Max y GPUs Radeon, indicando que es viable en equipos de escritorio de gama alta.
- **Opciones de despliegue**: vLLM, SGLang, TokenSpeed, Hugging Face Transformers, y LM Studio para uso local. El blog de AMD también menciona compatibilidad con sus plataformas.
- **Latencia y throughput**: no disponible en la información proporcionada. La arquitectura híbrida con solo 16 capas de atención completa debería mejorar el rendimiento en contexto largo, pero no hay datos numéricos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K nativo / 1M ext. | Apache 2.0 | Denso multimodal | Modelo actual |
| Qwen3.6-27B | 27B | no disponible | no disponible | Denso | Predecesor, mencionado en benchmarks |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Modelo cerrado, mencionado en benchmarks |
| Muse Glimmer-30B | 30B | no disponible | no disponible | no disponible | Alternativa de 30B, mencionada en benchmarks |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible | Modelo de mayor escala, mencionado en benchmarks |

Los datos de Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max provienen únicamente de la tabla de benchmarks de la model card y no se dispone de especificaciones detalladas para comparar más allá de lo indicado.

## Limitaciones y advertencias

- **Datos de benchmark incompletos**: la model card no proporciona los valores numéricos completos de los benchmarks, lo que dificulta una evaluación objetiva del rendimiento real frente a alternativas.
- **Idiomas soportados no documentados**: la información oficial no especifica qué idiomas cubre el modelo, aunque por la familia Qwen se asume un soporte multilingüe amplio.
- **Sesgos y alucinaciones**: no se han publicado evaluaciones de sesgos ni tasas de alucinación para este modelo concreto. Como modelo de lenguaje de gran tamaño, es susceptible a los mismos riesgos que sus predecesores.
- **Requisitos de hardware elevados**: a pesar de ser un modelo de 27B, el tamaño de 55.6 GB en pesos sin cuantizar requiere hardware de gama alta para inferencia óptima, especialmente con contexto largo.
- **Dependencia de la plataforma Qwen Cloud**: el modelo se ofrece como servicio gestionado en Qwen Cloud, pero el servicio estaba "coming soon" en el momento de la publicación de la model card, lo que puede generar incertidumbre sobre la disponibilidad.
- **Licencia Apache 2.0**: permite uso comercial y modificación sin restricciones, pero el usuario debe verificar el cumplimiento de los términos de la licencia para su caso específico.
- **Formato de pesos safetensors**: no se proporcionan pesos en GGUF para su uso directo con llama.cpp; el usuario deberá cuantizarlos o usar frameworks compatibles como vLLM o SGLang.

## Enlaces

- [Modelo en Hugging Face (repo oficial Qwen)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Modelo en Hugging Face (repo de Reifushimi)](https://huggingface.co/Reifushimi/Qwen3.8-27B)
- [GitHub oficial de AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Blog de AMD sobre soporte para Qwen3.8-27B](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- [Página de Qwen3.8 en LM Studio](https://lmstudio.ai/models/qwen3.8)
- [Recetas de vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
