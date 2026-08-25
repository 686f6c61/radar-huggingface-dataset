# Deepdive404-3/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso nativo multimodal (visión-lenguaje) desarrollado por el equipo Qwen de Alibaba, publicado bajo licencia Apache 2.0. Es la versión compacta de la generación Qwen3.8, que también incluye el modelo gigante Qwen3.8-Max de 2,4 billones de parámetros. Este modelo de 27B destaca por su arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención completa (Gated Attention), junto con predicción multi-token (MTP), lo que le permite manejar contextos nativos de 262.144 tokens y extensibles hasta 1.000.000.

El modelo está orientado a tareas de codificación, trabajo profesional, investigación y agentes de larga duración, con control flexible de razonamiento (thinking mode) y comprensión de imágenes y vídeo de hasta una hora de duración. Sus pesos están disponibles en formato Transformers, compatibles con vLLM, SGLang y otras herramientas de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (híbrida: Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | No especificados (se espera compatibilidad con GPTQ, AWQ, GGUF, etc. por su formato Transformers) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo de lenguaje causal con un codificador visual integrado. La arquitectura del bloque del modelo de lenguaje sigue un patrón de 64 capas: cada grupo de 16 capas contiene 3 bloques de Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidos de un bloque de Gated Attention (atención completa con 24 cabezas Q y 4 cabezas KV, dimensión de cabeza 256 y RoPE de 64 dimensiones). Cada bloque incluye una red feed-forward con dimensión intermedia de 17.408. La salida del LM tiene 248.320 tokens de embedding con padding.

El entrenamiento se realizó en dos etapas: pre-training y post-training, según la model card. No se especifican el número de tokens ni la composición del dataset. El modelo incorpora Multi-Token Prediction (MTP) entrenada con múltiples pasos, lo que mejora la velocidad de inferencia y la calidad de las predicciones. El control del pensamiento permite activar o desactivar el modo de razonamiento por petición, ajustar el esfuerzo de razonamiento (`reasoning_effort`) y conservar el contexto de razonamiento histórico (`preserve_thinking`).

## Capacidades

- Generación de texto avanzada con razonamiento multistep y control de esfuerzo de pensamiento.
- Comprensión de imágenes y vídeo (nativo multimodal): interpreta diagramas STEM, documentos, y vídeos de hasta una hora de duración.
- Razonamiento matemático y lógico de alto nivel.
- Generación de código y ejecución de tareas de terminal (agentic coding).
- Soporte para planificación autónoma y manejo de feedback del entorno en tareas de larga duración.
- Control flexible de pensamiento: se puede desactivar el modo de razonamiento por petición, ajustar el esfuerzo de razonamiento y mantener el contexto de razonamiento entre mensajes.
- Capacidades multilingües no especificadas, aunque se espera que cubra los idiomas habituales de la serie Qwen.
- Compatible con herramientas de integración como vLLM, SGLang, TokenSpeed y otras.

## Casos de uso

- Asistente de codificación en producción: el modelo puede integrarse en entornos de desarrollo integrado (IDE) para generar, revisar y depurar código, aprovechando su capacidad de razonamiento multistep y su contexto largo para entender proyectos completos.
- Automatización de tareas de oficina: procesamiento de documentos, generación de informes y extracción de datos de imágenes o vídeos, gracias a su comprensión visual nativa.
- Agente autónomo de investigación: puede planificar y ejecutar tareas de búsqueda y análisis de información con razonamiento encadenado, manteniendo el contexto de la tarea durante largas conversaciones.
- Análisis de vídeo de vigilancia o contenido multimedia: el modelo procesa vídeo de hasta una hora para detectar eventos, describir escenas o transcribir diálogos.
- Tutor de matemáticas y ciencias: resuelve problemas paso a paso, con modo de pensamiento activable para explicar el razonamiento.
- Integración en pipelines de CI/CD: puede revisar código, generar tests y ejecutar scripts de automatización con soporte de tool calling y manejo de errores.
- Asistente de oficina multimodal: genera resúmenes de reuniones a partir de vídeo, analiza gráficos y tablas en imágenes, y redacta informes.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores numéricos no se han proporcionado en la información disponible. Se menciona específicamente el benchmark "Terminal Bench 2.5 (Terminus)" para codificación agéntica, sin cifras concretas. Por tanto, no se pueden reportar resultados cuantitativos.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del modelo en FP16: aproximadamente 55,6 GB (según el repositorio), por lo que se recomienda una GPU con al menos 64 GB de VRAM para inferencia sin cuantizar.
- Con cuantización INT4 (típica en GGUF o GPTQ), el modelo ocupa alrededor de 14-15 GB, lo que permite su ejecución en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen para contexto largo.
- Con cuantización INT8, el modelo requiere ~28 GB, siendo adecuado para GPUs como A100 40GB o RTX 6000 Ada.
- Para contexto de 262K tokens, la memoria de KV cache será significativa; se recomienda usar atención con FlashAttention y cuantización KV.
- Despliegue compatible con vLLM, SGLang, Transformers, TokenSpeed, y herramientas como Ollama o llama.cpp si se convierte a GGUF.
- La latencia dependerá de la cuantización y el hardware; en una RTX 4090 con cuantización 4-bit, se pueden esperar velocidades de generación de 30-50 tokens por segundo, aunque no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K nativo | Apache 2.0 | Híbrido DeltaNet+Attention, visión-lenguaje |
| Qwen3.6-27B | 27B | no disponible | Apache 2.0 | Predecesor directo, también multimodal |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | Modelo de mayor tamaño de la serie anterior |
| Muse Glimmer-30B | 30B | no disponible | no disponible | Competidor directo en tamaño |
| Opus4.6 Max | no disponible | no disponible | no disponible | Modelo propietario de referencia |

No se dispone de datos numéricos de rendimiento para realizar una comparación cuantitativa. La model card muestra una tabla comparativa, pero los valores no están disponibles en la información extraída.

## Limitaciones y advertencias

- No se han especificado los idiomas soportados; probablemente sigue el patrón multilingüe de Qwen, pero no se confirma.
- El modelo puede sufrir alucinaciones, especialmente en tareas de razonamiento largo o cuando el contexto es extenso.
- El modo de pensamiento activo puede generar respuestas más lentas y consumir más tokens de salida; se debe gestionar el presupuesto de tokens en producción.
- El contexto de 1M tokens se logra mediante técnicas de extensión (posiblemente RoPE scaling), pero su rendimiento en longitudes extremas puede degradarse.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar si el entrenamiento incluye datos con derechos de autor.
- No se ha proporcionado información sobre sesgos específicos, pero como modelo entrenado en datos web, puede heredar sesgos sociales y culturales.
- El modelo es denso, por lo que la inferencia es más costosa en memoria que un modelo MoE equivalente.

## Enlaces

- Hugging Face: https://huggingface.co/Deepdive404-3/Qwen3.8-27B (versión espejo del autor) y https://huggingface.co/Qwen/Qwen3.8-27B (oficial)
- GitHub oficial: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Análisis externo: https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/
- Noticia de OpenLM: https://openlm.ai/qwen3.8/
