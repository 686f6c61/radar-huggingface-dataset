# itr0next/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba, lanzado como parte de la familia Qwen3.8. Se trata de un modelo nativo multimodal que integra un codificador de visión para comprender imágenes y vídeos, además de capacidades de razonamiento flexible con modo thinking controlable. Está diseñado para tareas de codificación, trabajo profesional, investigación y ejecución de agentes de larga duración.

El modelo presenta una arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención completa (Gated Attention), junto con predicción multi-token (MTP). Su ventana de contexto nativa es de 262 144 tokens, extensible hasta 1 000 000. La versión cuantizada en GGUF de itr0next utiliza la tecnología Dynamic 3.0 de Unsloth, que ofrece mejor precisión que otras cuantizaciones al mismo tamaño. Con licencia Apache-2.0, es completamente libre para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrido Gated DeltaNet + Gated Attention + FFN |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | GGUF (Dynamic 3.0 de Unsloth: Q4_K_M, Q5_K_M, Q6_K, Q8_0, etc.) |
| Idiomas soportados | No disponible (se espera multilingue, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponible en el repo base Qwen/Qwen3.8-27B) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida innovadora que combina dos tipos de atención en un layout de 64 capas: 16 bloques de Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidos de un bloque de Gated Attention (atención completa con 24 cabezas Q y 4 KV, dimensión de cabeza 256, RoPE de 64 dimensiones), intercalados con FFN de dimensión intermedia 17 408. Esta combinación permite manejar contextos muy largos de forma eficiente, manteniendo la calidad de la atención completa en puntos clave.

El modelo fue entrenado en dos fases: pre-entrenamiento y post-entrenamiento, e incorpora Multi-Token Prediction (MTP) con múltiples pasos, lo que mejora la eficiencia de decodificación. El token embedding está padded a 248 320. El entrenamiento incluye datos de imagen y vídeo para sus capacidades multimodales. No se especifican detalles sobre RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento complejo con modo thinking activable o desactivable por petición, ajustable mediante `reasoning_effort`.
- Comprensión de imágenes y vídeos de hasta una hora de duración, incluyendo diagramas STEM, documentos y escenas dinámicas.
- Codificación avanzada: generación de código, depuración y refactorización en múltiples lenguajes.
- Ejecución de agentes de larga duración: planificación autónoma, manejo de feedback del entorno y finalización fiable de tareas multi-paso.
- Tool calling y function calling mejorado, con soporte para parsing de objetos anidados.
- Soporte para agentes en herramientas como Codex, con Developer Role Support.
- Retención del contexto de razonamiento histórico mediante `preserve_thinking`.
- Capacidades multilingües (no confirmadas oficialmente en la documentación disponible).

## Casos de uso

- Asistentes de codificación en producción: el modelo puede integrarse en IDE o pipelines de CI/CD para generar código, revisar pull requests y sugerir correcciones, gracias a su soporte de tool calling y su ventana de contexto de 262K tokens que permite procesar repositorios completos.
- Automatización de oficina: procesamiento de documentos, generación de informes, resúmenes de actas y extracción de datos de imágenes o PDFs escaneados, aprovechando su capacidad de visión.
- Agentes autónomos de investigación: el modelo puede planificar y ejecutar búsquedas web, leer documentos, extraer información y sintetizar resultados en tareas de varias horas, gracias a su razonamiento de largo alcance y su contexto extensible.
- Análisis de vídeo: revisión de grabaciones de vigilancia, contenido de reuniones o material educativo de hasta una hora, extrayendo eventos, diálogos y acciones relevantes.
- Atención al cliente multimodal: gestión de conversaciones multi-turno con contexto largo, combinando texto e imágenes (capturas de pantalla, fotos de productos) para resolver incidencias técnicas.
- Asistente de investigación científica: lectura de artículos con figuras y tablas, razonamiento matemático paso a paso y generación de resúmenes críticos, gracias a su comprensión de diagramas STEM y su modo thinking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras sustanciales en codificación, trabajo profesional, investigación y tareas agénticas respecto a Qwen3.5, pero no proporciona cifras concretas. Se recomienda consultar el repositorio oficial de Qwen para datos de evaluación.

## Requisitos de hardware

- VRAM estimada: según Unsloth, el modelo puede ejecutarse localmente con 17 GB de RAM/VRAM en cuantización 4-bit (Q4_K_M).
- GPUs recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 40 GB, H100, o GPUs de consumo con al menos 16 GB de VRAM para cuantizaciones bajas.
- En cuantización Q8_0 o FP16 se necesitan al menos 32-54 GB de VRAM, requiriendo GPUs profesionales o múltiples GPUs.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI, Unsloth Desktop (compatible con Mac, Windows y Linux).
- Latencia y throughput: no disponible. La arquitectura híbrida con MTP debería ofrecer mejor throughput que un transformer denso equivalente, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de datos comparativos suficientes en la información proporcionada. El modelo compite directamente con otros modelos densos de 27B como Llama 3.1 8B (inferior en tamaño), Gemma 2 27B o Mistral Large 2, pero no se han publicado comparativas con estos en los materiales disponibles. La familia Qwen3.8 también incluye Qwen3.8-2.4T-A95B (MoE) y Qwen3.8-Max, que son alternativas de mayor tamaño dentro de la misma familia.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones específicos del modelo en la información disponible.
- El modo thinking puede aumentar la latencia y el consumo de tokens de salida; se recomienda ajustar `reasoning_effort` según la tarea.
- El uso de `presence_penalty` alto (hasta 2) puede provocar mezcla de idiomas y ligera degradación del rendimiento.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero se recomienda verificar los términos de la licencia del modelo base original.
- El repo GGUF de itr0next tiene 0 descargas y 0 likes, lo que sugiere que es un fork reciente o poco validado; se recomienda usar el repo oficial de Unsloth (unsloth/Qwen3.8-27B-GGUF) para entornos de producción.
- El tamaño del repo (472.1 GB) indica que contiene múltiples cuantizaciones; es necesario seleccionar el archivo adecuado para el hardware disponible.

## Enlaces

- Repo GGUF de itr0next: https://huggingface.co/itr0next/Qwen3.8-27B-GGUF
- Repo GGUF oficial de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Repo oficial de Alibaba en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repo de la familia Qwen3.8: https://github.com/QwenLM/Qwen3.8
