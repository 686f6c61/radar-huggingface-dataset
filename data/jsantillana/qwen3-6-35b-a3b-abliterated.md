# jsantillana/Qwen3.6-35B-A3B-abliterated

## Resumen

Qwen3.6-35B-A3B-abliterated es una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas mediante edición de pesos) del modelo Qwen3.6-35B-A3B desarrollado por el equipo Qwen de Alibaba. El modelo base es un transformer causal multimodal (lenguaje más visión) con arquitectura Mixture of Experts (MoE) que activa aproximadamente 3.000 millones de parámetros de un total de 35.951.822.704. Esta variante concreta ha sido publicada por el usuario jsantillana en Hugging Face, sin métricas de adopción (0 descargas, 0 likes en el momento del análisis) y con fecha de creación en noviembre de 2026.

El modelo resuelve tareas de generación de texto, razonamiento, código agéntico y comprensión de imágenes, con un contexto nativo de 262.144 tokens extensible hasta 1.010.000. Su diseño prioriza la eficiencia computacional (solo 3B parámetros activos por token) manteniendo una calidad cercana a modelos densos de mayor tamaño, lo que lo hace atractivo para despliegues con restricciones de VRAM. La innovación arquitectónica principal es la combinación de capas Gated DeltaNet (atención lineal) con capas de atención completa en un layout híbrido, junto con 256 expertos MoE y un mecanismo de Multi-Token Prediction (MTP).

La relevancia actual del modelo radica en su enfoque hacia el "agentic coding" y la preservación del contexto de razonamiento entre turnos ("Thinking Preservation"), características pensadas para flujos de desarrollo iterativos y razonamiento multi-paso. La variante abliterated elimina los rechazos del modelo base, lo que tiene implicaciones importantes de seguridad y cumplimiento que se detallan en la sección de limitaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; MoE híbrido con Gated DeltaNet (atención lineal) y Gated Attention |
| Parámetros totales | 35.951.822.704 (según safetensors) |
| Parámetros activos | ~3B (8 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

Datos arquitectónicos adicionales: dimensión oculta 2048, embedding de tokens 248.320 (padded), 40 capas, layout 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)). Gated DeltaNet con 32 cabezas lineales para V y 16 para QK, dimensión de cabeza 128. Gated Attention con 16 cabezas para Q y 2 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones. MoE con 256 expertos, 8 enrutados + 1 compartido activados, dimensión intermedia de experto 512. Entrenado con MTP multi-step.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal híbrida que intercala capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) en un patrón de 3:1. Las capas Gated DeltaNet reducen el coste computacional y de memoria en secuencias largas, mientras que las capas de atención completa preservan la capacidad de recuperación precisa de información. Sobre cada bloque de atención se aplica una capa MoE con 256 expertos, de los cuales se activan 8 enrutados más 1 compartido por token, lo que mantiene el coste de inferencia cercano al de un modelo de 3B parámetros. El modelo incluye un vision encoder para entrada image-text-to-text y fue entrenado con Multi-Token Prediction multi-step, una técnica que permite predecir varios tokens por paso y acelera la decodificación.

El entrenamiento se realizó en dos fases (pre-entrenamiento y post-entrenamiento) según la model card, aunque no se especifica el número de tokens, la composición del dataset ni si se emplearon RLHF o DPO. La model card menciona que el modelo se construyó con retroalimentación directa de la comunidad y que prioriza estabilidad y utilidad real, con mejoras específicas en flujos de frontend y razonamiento a nivel de repositorio. La variante abliterated de jsantillana modifica los pesos del modelo base para eliminar las direcciones de rechazo, un proceso que típicamente implica identificar y sustraer vectores de activación asociados a comportamientos de negativa, sin información pública sobre la metodología exacta empleada en esta conversión.

## Capacidades

- Generación de texto y razonamiento multi-paso con contexto de hasta 262.144 tokens nativos.
- Comprensión de imágenes (pipeline image-text-to-text) mediante vision encoder integrado.
- Codificación agéntica: manejo de flujos de frontend y razonamiento a nivel de repositorio.
- Thinking Preservation: retención del contexto de razonamiento de mensajes históricos para desarrollo iterativo.
- Soporte de tool calling / function calling (implícito en el enfoque agéntico del modelo base).
- Capacidades multilingües (idiomas concretos no disponibles en la información).
- Multi-Token Prediction (MTP) para decodificación acelerada.
- Capacidad de contexto extendido hasta 1.010.000 tokens mediante configuración.
- Variante abliterated: ausencia de rechazos ante solicitudes que el modelo base declinaría.

## Casos de uso

- Automatización de revisión de código en repositorios: el modelo puede analizar cambios a nivel de repositorio y razonar sobre dependencias entre ficheros gracias a su contexto de 262.144 tokens y a las mejoras en razonamiento de repositorio del modelo base.
- Asistente de desarrollo frontend: generación y refactorización de componentes con comprensión de flujos de UI, aprovechando las mejoras específicas en flujos de frontend introducidas en Qwen3.6.
- Agentes autónomos de resolución de incidencias: con SWE-bench Verified reportado de 73,4 para el modelo base, es adecuado para pipelines que reciben issues y generan parches, integrándose con herramientas de CI/CD mediante tool calling.
- Procesamiento de documentación técnica con imágenes: el vision encoder permite extraer información de diagramas, capturas de pantalla y documentación visual junto con texto, útil en tareas de soporte técnico.
- Análisis de bases de código extensas: el contexto extensible hasta 1.010.000 tokens permite cargar proyectos completos o grandes volúmenes de documentación en una sola ventana para consultas y resúmenes.
- Desarrollo iterativo con preservación de razonamiento: la opción Thinking Preservation reduce la sobrecarga en sesiones de depuración multi-turno al mantener el contexto de razonamiento entre mensajes.
- Generación de contenido sin restricciones de rechazo: la variante abliterated es aplicable en entornos de investigación que requieren estudiar el comportamiento del modelo sin las negativas del modelo base, siempre con las cautelas de la sección de limitaciones.

## Benchmarks y rendimiento

Los datos de benchmark corresponden al modelo base Qwen3.6-35B-A3B según la model card; no se han publicado resultados específicos para la variante abliterated.

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible (tabla truncada) | no disponible | no disponible | no disponible | no disponible |

La información de benchmarks proporcionada está truncada en la fila de Terminal-Bench 2.0, por lo que no se dispone del resto de resultados (razonamiento, matemáticas, visión, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 71,9 GB en safetensors (probablemente en bf16/fp16). En cuantización de 8 bits se estiman ~36 GB; en 4 bits, ~18-20 GB. Estas cifras son estimaciones a partir del tamaño del repo, no datos oficiales.
- GPU recomendadas: para bf16 completo, múltiples A100 80GB o H100 80GB; para cuantización 8 bits, una A100 40GB o H100; para 4 bits, una RTX 4090 (24 GB) o RTX 3090 podría ser suficiente, aunque el vision encoder y el contexto largo incrementan los requisitos de memoria KV.
- Cabe en GPU consumer: probablemente en RTX 4090/3090 con cuantización 4 bits y contextos moderados; el contexto de 262.144 tokens requiere memoria KV considerable adicional.
- Opciones de despliegue: transformers, vLLM, SGLang, KTransformers (según la model card del modelo base). No se confirma soporte de llama.cpp, Ollama o TGI para esta arquitectura híbrida.
- Latencia y throughput: no disponibles. El uso de solo 3B parámetros activos y MTP sugiere un throughput superior al de un modelo denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | ~3B | 262.144 | 73,4 | apache-2.0 |
| Qwen3.5-35B-A3B | 35B | ~3B | no disponible | 70,0 | no disponible |
| Qwen3.5-27B | 27B | denso | no disponible | 75,0 | no disponible |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible |
| Gemma4-26B-A4B | 26B | ~4B | no disponible | 17,4 | no disponible |

La variante abliterated hereda las capacidades del modelo base Qwen3.6-35B-A3B, por lo que su rendimiento en benchmarks debería ser similar salvo degradaciones introducidas por la edición de pesos, que no están documentadas.

## Limitaciones y advertencias

- La variante abliterated elimina los mecanismos de rechazo del modelo base, lo que implica un riesgo elevado de generar contenido dañino, ilegal o inseguro sin las salvaguardas originales.
- No se documenta la metodología de abliteration empleada ni el impacto sobre capacidades (posible degradación en razonamiento o coherencia).
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluaciones específicas de factualidad para esta variante.
- Idiomas soportados no disponibles; el rendimiento en castellano no está verificado.
- La licencia apache-2.0 permite uso comercial, pero el despliegue de una variante sin rechazos en producción conlleva responsabilidad legal y de cumplimiento (por ejemplo, AI Act en la UE).
- Sin métricas de adopción (0 descargas) ni comunidad que valide la calidad de la conversión.
- El contexto largo (262K-1M tokens) incrementa el consumo de memoria KV y puede degradar la precisión en recuperación de información en posiciones intermedias.
- La información de benchmarks está truncada y no cubre razonamiento general, matemáticas ni visión.

## Enlaces

- Hugging Face: https://huggingface.co/jsantillana/Qwen3.6-35B-A3B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Blog de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
