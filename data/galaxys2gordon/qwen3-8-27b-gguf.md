# GalaxyS2Gordon/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es la última generación de la familia abierta Qwen, desarrollada por el equipo de Qwen (Alibaba) y distribuida en formato GGUF por Unsloth a través del repositorio de GalaxyS2Gordon. Se trata de un modelo denso de 27 000 millones de parámetros con arquitectura híbrida —combina Gated DeltaNet (atención lineal) con Gated Attention (atención softmax con RoPE)— y un codificador de visión nativo que le permite procesar imágenes y vídeo de hasta una hora de duración. El modelo destaca por su ventana de contexto nativa de 262 144 tokens, extensible hasta un millón, y por incorporar un modo de razonamiento flexible con control de esfuerzo (`reasoning_effort`) y preservación del contexto de razonamiento (`preserve_thinking`).

La versión GGUF está cuantizada con la tecnología Dynamic 3.0 de Unsloth, que según el autor ofrece una precisión superior en más de un 10 % frente a otros proveedores de cuantización al mismo tamaño. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Está pensado para tareas de razonamiento complejo, ejecución de agentes autónomos de larga duración, generación de código y comprensión multimodal, con soporte mejorado de tool calling y compatibilidad con herramientas de desarrollo como Codex.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention (softmax con RoPE), con codificador de visión. 64 capas en total, organizadas en 16 bloques de 4 subcapas (3 × Gated DeltaNet → FFN, 1 × Gated Attention → FFN) |
| Parámetros totales | 27 320 697 856 (27B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 tokens |
| Tipos de cuantización | GGUF: Q2_K_XL, IQ4_XS, Q4_K_M y otras variantes Dynamic 3.0 de Unsloth |
| Idiomas soportados | No especificado en la información disponible; la familia Qwen es típicamente multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión integrado, construido sobre la arquitectura de Qwen3.5. Su diseño híbrido combina dos mecanismos de atención en cada bloque: tres subcapas consecutivas de Gated DeltaNet —una variante de atención lineal con estado recurrente que reduce el coste computacional en secuencias largas— seguidas de una subcapa de Gated Attention con atención softmax y embeddings rotatorios (RoPE). Esta combinación permite mantener la calidad de atención completa en puntos estratégicos de la red mientras se reduce el coste global.

El modelo tiene una dimensión oculta de 5120, un tamaño de embedding de 248 320 (con padding) y una dimensión intermedia del FFN de 17 408. Incluye entrenamiento con Multi-Token Prediction (MTP), lo que permite predecir varios tokens simultáneamente y acelerar la inferencia. El entrenamiento comprende una fase de pre-entrenamiento y otra de post-entrenamiento, sin que se especifiquen en la información disponible los datos concretos de tokens ni los métodos de alineación (RLHF, DPO, etc.). El modo de razonamiento está activado por defecto y puede desactivarse por petición, con un parámetro de esfuerzo de razonamiento (`reasoning_effort`) ajustable.

## Capacidades

- Generación de texto y razonamiento complejo en múltiples pasos, con modo de pensamiento activable o desactivable por petición.
- Comprensión nativa de imágenes y vídeo: procesa diagramas STEM, documentos y vídeo de larga duración (hasta una hora).
- Tool calling y function calling mejorado: incluye soporte de rol de desarrollador para entornos agénticos como Codex y mejora en el parseo de objetos anidados para llamadas a herramientas.
- Ejecución de agentes autónomos de larga duración con planificación y manejo de feedback del entorno.
- Razonamiento ajustable mediante `reasoning_effort` y preservación del contexto de razonamiento histórico con `preserve_thinking`.
- Multi-Token Prediction (MTP) para generación más rápida.
- Capacidades multilingües heredadas de la familia Qwen (no se detallan idiomas concretos en la información disponible).

## Casos de uso

- Agentes autónomos de larga duración: el modelo puede planificar y ejecutar tareas de múltiples pasos en entornos interactivos, procesando feedback del entorno y manteniendo el contexto de razonamiento a lo largo de la conversación, gracias a su ventana de 262 000 tokens.
- Análisis de documentos técnicos con imágenes: su codificador de visión nativo permite extraer información de diagramas STEM, tablas y gráficos integrados en documentos, útil para investigación y consultoría técnica.
- Generación de código en producción: con soporte de tool calling mejorado, el modelo puede integrarse en pipelines de CI/CD para generar, revisar y parchear código, incluyendo el manejo de objetos anidados en las llamadas a herramientas.
- Atención al cliente multimodal: gestión de conversaciones de múltiples turnos con contexto amplio, incluyendo capturas de pantalla o imágenes de productos, gracias a su visión nativa y su ventana de contexto extensa.
- Análisis de vídeo de vigilancia o contenido: puede procesar y resumir vídeos de larga duración (hasta una hora), útil para moderación de contenido, análisis de seguridad o revisión de material audiovisual.
- Razonamiento matemático y científico asistido: con el modo de pensamiento activo y el parámetro `reasoning_effort`, puede resolver problemas de matemáticas y física complejos con una cadena de razonamiento explícita y ajustable.
- Asistentes de investigación con contexto largo: su ventana de contexto de hasta un millón de tokens permite cargar libros completos o conjuntos de documentos extensos para resúmenes, extracción de información y síntesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Cuantización Q4_K_M: aproximadamente 17,1 GB de VRAM, adecuado para GPUs de 24 GB como la RTX 4090 o la RTX 3090.
- Cuantización IQ4_XS: aproximadamente 16 GB de VRAM, adecuado para GPUs de 16 GB como la RTX 4080 o la RTX 3080 Ti.
- Cuantización 2-bit (Q2_K_XL): aproximadamente 12 GB de VRAM, adecuado para GPUs de 12 GB como la RTX 4070 o la RTX 3060.
- Se recomienda aplicar el truco de KV-cache para optimizar el uso de memoria en contextos largos.
- Opciones de despliegue: llama.cpp, Ollama, Unsloth Desktop (compatible con Windows, macOS y Linux), vLLM y TGI.
- El modelo puede ejecutarse en una sola GPU de consumo en las cuantizaciones más bajas; para la cuantización completa o el contexto máximo se recomienda hardware de datacenter (A100, H100).
- El rendimiento de latencia y throughput no está disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Arquitectura |
|---|---|---|---|---|---|
| Qwen3.8-27B (este) | 27B | 262K (hasta 1M) | Sí (nativa) | Apache 2.0 | Híbrida (DeltaNet + Gated Attention) |
| Qwen3.5-27B (predecesor) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Qwen3.6-27B (predecesor) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni especificaciones detalladas de los modelos predecesores en la información proporcionada, por lo que no es posible realizar una comparativa cuantitativa completa. El modelo se posiciona como un modelo denso de 27B frente a alternativas MoE de tamaño similar, pero no se dispone de datos concretos de rendimiento para establecer comparaciones.

## Limitaciones y advertencias

- Riesgo de alucinación: como cualquier modelo de lenguaje generativo, puede producir información plausible pero incorrecta, especialmente en tareas de razonamiento abierto o sin acceso a fuentes verificables.
- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible, pero es razonable esperar sesgos heredados de los datos de entrenamiento de la familia Qwen.
- Mezcla de idiomas: el uso de un valor alto de `presence_penalty` (entre 0 y 2) para reducir la repetición puede provocar ocasionalmente mezcla de idiomas y una ligera disminución del rendimiento.
- Parámetros de muestreo sensibles: el modelo requiere ajustar cuidadosamente la temperatura, el top-p y el presence_penalty según el modo (pensamiento vs. instructivo) para evitar repeticiones infinitas o respuestas degradadas.
- Limitaciones de contexto: aunque el contexto es extensible hasta un millón de tokens, el rendimiento a longitudes extremas puede degradarse y el consumo de VRAM aumenta significativamente.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo incluye un codificador de visión cuyo entrenamiento podría incorporar datos con derechos de autor no verificables.
- Disponibilidad de la versión GGUF: el repositorio de GalaxyS2Gordon es una cuantización de la versión de Unsloth; la precisión de la cuantización puede variar según la variante elegida (Dynamic 3.0 vs. otros métodos).

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/GalaxyS2Gordon/Qwen3.8-27B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Unsloth con el modelo GGUF: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Guía de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Documentación de Unsloth sobre Dynamic 3.0 GGUFs: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Repositorio de GitHub de Unsloth: https://github.com/unslothai/unsloth
- Guía de ejecución local (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guía de cuantizaciones GGUF: https://www.orcarouter.ai/blog/qwen-3-8-27b-gguf
- Guía de versión sin censura (GGUF): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Repositorio alternativo de GGUF: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
