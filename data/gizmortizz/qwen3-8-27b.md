# Gizmortizz/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso de 27.800 millones de parámetros, desarrollado por el equipo Qwen de Alibaba. Se trata de un modelo nativo multimodal (visión y texto) que integra un codificador visual y un núcleo de lenguaje con arquitectura híbrida: combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention). Su ventana de contexto nativa es de 262.144 tokens, ampliable hasta 1.000.000, lo que lo hace adecuado para tareas de razonamiento de largo alcance, agentes autónomos y procesamiento de documentos extensos.

El modelo destaca por su modo de pensamiento configurable (thinking mode), que puede activarse o desactivarse por petición, y por su capacidad de ajustar la profundidad de razonamiento mediante el parámetro `reasoning_effort`. Está orientado a tareas de codificación, trabajo profesional, investigación y ejecución de agentes multi-paso. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su tamaño compacto (27B) lo hace desplegable en hardware de gama media con cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | No disponible (formato original safetensors; se esperan versiones GGUF/AWQ de la comunidad) |
| Idiomas soportados | No disponible (no especificado en la documentacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de 64 capas con dimensión oculta de 5.120 y un vocabulario de 248.320 tokens (con padding). Su estructura interna sigue un patrón repetido: cada bloque contiene 3 sub-bloques de Gated DeltaNet seguidos de una capa feed-forward, y después un sub-bloque de Gated Attention con otra capa feed-forward. Este diseño híbrido combina la eficiencia computacional de la atención lineal (DeltaNet) con la capacidad de recuperación de información de la atención clásica.

El modelo fue entrenado en dos fases: pre-entrenamiento y post-entrenamiento. Incluye Multi-Token Prediction (MTP), una técnica que predice varios tokens futuros simultáneamente para mejorar la eficiencia de inferencia y la coherencia del texto generado. El post-entrenamiento incorpora ajuste por refuerzo (RLHF/DPO, no especificado en detalle) y un mecanismo de control de razonamiento que permite al modelo decidir cuándo pensar antes de responder. El codificador visual permite procesar imágenes y vídeos, con soporte para diagramas STEM, documentos escaneados y vídeos de hasta una hora de duración.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento configurable (`thinking_mode`, `reasoning_effort`, `preserve_thinking`).
- Comprensión de imágenes y vídeos: diagramas técnicos, documentos, capturas de pantalla y vídeo de larga duración.
- Codificación agéntica: planificación autónoma, manejo de feedback del entorno y ejecución de tareas de terminal.
- Tool calling y function calling: integración con herramientas externas para flujos de trabajo automatizados.
- Razonamiento matemático y científico, con soporte para notación simbólica y problemas de nivel avanzado.
- Capacidades multilingües: no especificadas oficialmente, aunque la familia Qwen suele cubrir múltiples idiomas; se recomienda verificar en la documentación oficial.

## Casos de uso

- Asistente de codificación en terminal: el modelo puede ejecutar comandos, leer salidas, corregir errores y completar tareas de desarrollo de forma autónoma, gracias a su entrenamiento en agentic terminal coding (Terminal Bench 2.1).
- Análisis de documentos técnicos con visión: procesa PDFs escaneados, diagramas de ingeniería y figuras científicas, extrayendo información y respondiendo preguntas sobre el contenido visual.
- Automatización de oficina: generación de informes, resúmenes de reuniones, redacción de correos y gestión de hojas de cálculo mediante tool calling.
- Investigación y revisión bibliográfica: su contexto de 262K tokens permite analizar artículos largos, comparar resultados y sintetizar conclusiones en una sola pasada.
- Agentes de atención al cliente: conversaciones multi-turno con memoria de contexto amplia, capaces de mantener el hilo de interacciones largas y derivar a herramientas externas cuando es necesario.
- Desarrollo de agentes autónomos: su capacidad de razonamiento de largo horizonte y manejo de feedback lo hace adecuado para pipelines de automatización que requieren planificación y ejecución de múltiples pasos.

## Benchmarks y rendimiento

La model card oficial incluye una tabla de benchmarks comparativos con modelos como Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, abarcando categorías como coding, agentic terminal coding, matemáticas y visión. Sin embargo, los valores numéricos de dicha tabla no se han podido extraer de la información proporcionada (la tabla aparece truncada). No se dispone de datos cuantitativos verificables en el material disponible. Se recomienda consultar la model card oficial en Hugging Face para obtener los resultados completos.

## Requisitos de hardware

- VRAM estimada: con cuantización de 4 bits, aproximadamente 14-16 GB; con 8 bits, 28-30 GB; en precisión completa (FP16/BF16), 55-60 GB.
- GPUs recomendadas: RTX 4090 (24 GB) con cuantización 4-bit; A100 40/80 GB o H100 para inferencia en precisión completa o con lotes grandes.
- Compatible con GPUs de consumo (RTX 3090/4090) si se aplica cuantización.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, TokenSpeed, llama.cpp (vía conversión GGUF), Ollama (vía comunidad), y plataformas cloud como Groq y AMD Ryzen AI Max.
- Latencia y throughput: no disponible en la documentación proporcionada; depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| Qwen3.8-27B | 27,8B | 262K (ext. 1M) | Apache 2.0 | Denso, multimodal |
| Qwen3.6-27B | ~27B | No disponible | Apache 2.0 | Denso, multimodal |
| Qwen3.7-Plus | No disponible | No disponible | Propietaria (API) | No disponible |
| Muse Glimmer-30B | ~30B | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | Propietaria (API) | No disponible |

No se dispone de datos de rendimiento comparativos verificables en la información proporcionada. La tabla de la model card sugiere que Qwen3.8-27B supera a Qwen3.6-27B en varias categorías, pero los valores exactos no están disponibles.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos en la información disponible; como todo modelo entrenado con datos web, puede reflejar sesgos presentes en el corpus.
- Riesgo de alucinación: inherente a los modelos generativos; se recomienda verificar hechos críticos, especialmente en tareas de investigación o documentación.
- Contexto extensible a 1M: aunque es posible, el rendimiento puede degradarse en longitudes extremas; se recomienda probar en el caso de uso concreto.
- Idiomas: no se especifican oficialmente; el rendimiento en idiomas distintos del inglés y el chino puede ser inferior.
- Licencia: Apache 2.0 permite uso comercial, pero se debe revisar la atribución y las condiciones de la licencia para redistribución.
- Para producción: se recomienda validar el modelo con datos propios antes de desplegarlo, especialmente en tareas de visión o agentes autónomos.

## Enlaces

- Modelo oficial en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub oficial: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación de Groq: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Blog de AMD sobre ejecución local: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página en LM Studio: https://lmstudio.ai/models/qwen3.8
- Repo espejo (fuente de la información): https://huggingface.co/Gizmortizz/Qwen3.8-27B
