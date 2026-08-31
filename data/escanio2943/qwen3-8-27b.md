# escanio2943/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso multimodal nativo desarrollado por el equipo Qwen de Alibaba, presentado como la generación más capaz de la familia abierta Qwen hasta la fecha. Construido sobre la base arquitectónica de Qwen3.5, integra un codificador visual que le permite comprender imágenes y vídeos, además de texto, con control flexible del modo de razonamiento. Con 27.781 millones de parámetros y una ventana de contexto nativa de 262 144 tokens (extensible hasta 1 millón), está diseñado para tareas de codificación, trabajo profesional, investigación y ejecución de agentes de larga duración.

El modelo destaca por su arquitectura híbrida de atención: combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention), lo que reduce el coste computacional en contextos largos. Incluye además un mecanismo de predicción multitoken (MTP) que acelera la decodificación. Su licencia Apache 2.0 permite uso comercial sin restricciones, y los pesos están disponibles en formato safetensors, compatibles con Transformers, vLLM, SGLang y TokenSpeed.

La relevancia actual de Qwen3.8-27B reside en su equilibrio entre tamaño compacto (27B) y capacidades de nivel superior: razonamiento agéntico, visión-lenguaje nativa y soporte de herramientas lo convierten en una opción atractiva para despliegues en hardware local o en la nube con requisitos moderados de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, atención híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 781 427 952 (27,8B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 tokens |
| Tipos de cuantizacion | no disponible (pesos en FP16/BF16; cuantizaciones GGUF/AWQ no especificadas) |
| Idiomas soportados | no disponible (se espera multilingüe, pero no se detalla en la información) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, compatible con Transformers, vLLM, SGLang, TokenSpeed |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura de transformer causal con un codificador visual independiente. El bloque de lenguaje tiene 64 capas organizadas en un patrón repetitivo: por cada grupo de 16 capas, 15 son de atención lineal (Gated DeltaNet) y 1 es de atención completa (Gated Attention), seguida de una red feed-forward. La atención lineal usa 48 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la atención completa usa 24 cabezas para Q y 4 para KV con dimensión 256 y RoPE de 64 dimensiones. La capa FFN tiene dimensión intermedia de 17 408. La salida del LM es de 248 320 tokens (con padding).

El entrenamiento se realizó en dos etapas: preentrenamiento y post-entrenamiento. Se incluye un mecanismo de predicción multitoken (MTP) entrenado con múltiples pasos, que actúa como cabeza de decodificación especulativa para acelerar la generación. El modelo soporta un modo de pensamiento (thinking mode) activado por defecto, con control de esfuerzo de razonamiento (`reasoning_effort`) y preservación del contexto de razonamiento histórico (`preserve_thinking`). No se han publicado detalles sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset en la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento flexible (activado/desactivado por petición).
- Comprensión de imágenes y vídeos de forma nativa, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución de tareas agénticas de larga duración: planificación autónoma, manejo de feedback del entorno y finalización fiable de tareas multi-paso.
- Soporte de tool calling y function calling, con integración en herramientas de desarrollo y harnesses populares.
- Capacidades de codificación avanzadas, incluyendo codificación agéntica en terminal (según benchmarks mencionados).
- Automatización de oficina (office automation) y tareas profesionales, según la descripción del repositorio oficial.
- Multilingüismo: no se especifican idiomas concretos, pero se espera cobertura amplia por la familia Qwen.

## Casos de uso

- Asistentes de codificación en IDE: el modelo puede generar, revisar y refactorizar código en tiempo real, aprovechando su modo de pensamiento para razonar sobre algoritmos complejos y su soporte de tool calling para interactuar con el sistema de archivos o ejecutar comandos.
- Automatización de tareas de oficina: generación de documentos, resúmenes de correos, creación de presentaciones y análisis de hojas de cálculo, gracias a su capacidad de comprensión de documentos e imágenes.
- Análisis de documentos técnicos y científicos: el modelo puede extraer información de diagramas, figuras y tablas en papers, facilitando la revisión de literatura y la síntesis de resultados.
- Agentes autónomos de soporte al cliente: con su ventana de contexto de 262K tokens, puede mantener conversaciones multi-turno con historial extenso, gestionar incidencias y escalar a herramientas externas mediante function calling.
- Procesamiento de vídeo para vigilancia o análisis de contenido: su capacidad de entender vídeos de hasta una hora permite resumir grabaciones, detectar eventos o generar descripciones automáticas.
- Investigación y desarrollo de agentes de IA: su robustez en tareas de larga duración y su compatibilidad con vLLM y SGLang lo hacen adecuado para prototipar sistemas agénticos en entornos de investigación.

## Benchmarks y rendimiento

La información disponible menciona una tabla comparativa de benchmarks de texto con modelos como Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, incluyendo métricas como "Terminal Bench 2.1 (Terminus)" para codificación agéntica. Sin embargo, los valores numéricos no están incluidos en la información proporcionada. No se han publicado resultados completos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 (BF16) se requieren aproximadamente 56 GB (27,8B × 2 bytes). Con cuantización de 8 bits, ~28 GB; con 4 bits, ~14 GB.
- GPUs recomendadas: para FP16, una A100 80GB o H100; para 8 bits, una RTX 4090 (24 GB) o A10G; para 4 bits, una RTX 3090/4090 o similar con 24 GB.
- Puede ejecutarse en GPUs de consumo (RTX 4090) con cuantización, aunque el rendimiento óptimo se obtiene en hardware profesional.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Hugging Face Transformers, y servicios gestionados como Qwen Cloud (con 1M de contexto y herramientas integradas).
- Latencia y throughput: no disponibles en la información proporcionada. Se espera que la atención lineal reduzca el coste en contextos largos y que MTP acelere la decodificación, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,8B | 262K (ext. 1M) | Apache 2.0 | Sí (visión) | Híbrido atención lineal + completa, MTP |
| Qwen3.6-27B | 27B (estimado) | no disponible | Apache 2.0 (presumible) | no disponible | Predecesor directo, mencionado en benchmarks |
| Muse Glimmer-30B | 30B | no disponible | no disponible | no disponible | Competidor de tamaño similar, mencionado en benchmarks |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible | Modelo propietario de referencia, mencionado en benchmarks |

No se dispone de información detallada sobre los modelos comparables más allá de sus nombres. La comparativa completa con cifras de rendimiento no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos, riesgos de alucinación o limitaciones idiomáticas específicas en la información disponible.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos de la versión alojada en Qwen Cloud, que puede tener condiciones adicionales.
- El modelo es denso (27,8B), por lo que requiere recursos de VRAM considerables para despliegue en FP16; la cuantización puede degradar ligeramente el rendimiento.
- La ventana de contexto de 1M tokens es una extensión, no la configuración nativa; su uso puede requerir ajustes de memoria y optimización.
- No se especifican los idiomas soportados; si el caso de uso requiere idiomas minoritarios, se debe validar el comportamiento antes de producción.

## Enlaces

- Repositorio HuggingFace (escanio2943/Qwen3.8-27B): https://huggingface.co/escanio2943/Qwen3.8-27B
- Repositorio oficial de Alibaba (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub AlibabaCloud-Official/Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página de Together AI (API y benchmarks): https://www.together.ai/models/qwen3-8-27b
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Ficha en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
