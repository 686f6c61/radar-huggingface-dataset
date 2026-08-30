# shuijiaodawang/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS

## Resumen
El modelo `shuijiaodawang/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS` es un derivado del modelo multimodal `Qwen/Qwen3.8-27B` de Alibaba, modificado mediante una técnica de abliteración para reducir drásticamente los comportamientos de rechazo (refusals). Con 27.356 millones de parámetros, mantiene la arquitectura híbrida del modelo base (atención lineal Gated DeltaNet combinada con atención full) y su capacidad de procesamiento de imagen y texto, pero elimina en gran medida las respuestas de negativa ante instrucciones que el modelo original tiende a rechazar.

El modelo se distribuye en formato BF16 (safetensors) y en cuantizaciones GGUF (Q4_K_M, Q5_K_M, Q8_0), con licencia Apache 2.0. Según las evaluaciones internas del autor, alcanza 0 rechazos en una pantalla de 842 prompts y en un conjunto de validación de 126 prompts, manteniendo 23 de 24 comprobaciones de coherencia. Es relevante para desarrolladores que necesitan un modelo multimodal con mínima censura para tareas de generación de texto, razonamiento y visión, aunque con las advertencias propias de cualquier modelo abliterado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atención híbrida (Gated DeltaNet lineal + atención completa) derivado de Qwen3.8-27B |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (según configuración de ejemplo en Ollama) |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | Multilingüe (sin lista detallada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B es un modelo nativo multimodal denso de 27B parámetros desarrollado por el equipo Qwen de Alibaba. Utiliza una arquitectura de atención híbrida que combina una capa lineal Gated DeltaNet con atención completa, lo que permite manejar secuencias largas de forma eficiente. Incluye un modo de razonamiento (thinking) y una cabeza MTP (multi-token prediction) para decodificación especulativa, aunque esta última no se incluye en este derivado.

La transformación aplicada es una abliteración, una técnica que identifica y elimina direcciones en el espacio de activaciones asociadas con el comportamiento de rechazo, de modo que el modelo deja de negarse a responder a ciertas instrucciones. El autor no publica detalles del dataset de ajuste ni del procedimiento exacto, pero indica que se realizó una evaluación interna con 842 prompts para ajustar la transformación y una validación separada con 126 prompts de familias no vistas. No se proporcionan datos sobre el entrenamiento adicional (si hubo algún fine-tuning posterior a la abliteración o solo una modificación de pesos).

## Capacidades
- Generación de texto y conversación multi-turno con soporte de modo thinking (razonamiento explícito) activable o desactivable.
- Procesamiento multimodal de imagen y texto (image-text-to-text), capaz de responder a preguntas sobre imágenes (verificado con una prueba interna de identificación de un cuadrado azul).
- Reducción drástica de rechazos: 0 refusals en la pantalla interna de 842 prompts y en el holdout de 126 prompts.
- Soporte de tool calling y agentes, heredado del modelo base (según la documentación de Qwen3.8-27B).
- Capacidades multilingües, aunque sin especificación de idiomas concretos.
- Disponible en formato GGUF para ejecución local con llama.cpp, Ollama u otros runtimes compatibles.

## Casos de uso
- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 32k tokens, manteniendo un tono útil y sin rechazar preguntas incómodas o periféricas, lo que reduce fricciones en entornos de soporte.
- Generación de código en producción: con soporte de tool calling y razonamiento, puede integrarse en pipelines de CI/CD para autocompletar, revisar o explicar fragmentos de código, evitando negativas ante peticiones de depuración complejas.
- Análisis de imágenes y documentos: al ser multimodal, puede extraer información de capturas, diagramas o formularios escaneados, respondiendo a preguntas sobre el contenido visual sin rechazos.
- Asistentes de investigación y documentación: útil para generar resúmenes, explicaciones técnicas o redactar informes a partir de prompts largos, gracias a su ventana de contexto amplia y su bajo índice de rechazo.
- Prototipado de chatbots sin restricciones: para desarrolladores que necesitan evaluar comportamientos conversacionales en dominios sensibles (por ejemplo, salud mental o educación sexual) donde los modelos censurados suelen negarse a responder.
- Automatización de tareas de oficina: el modelo base destaca en office automation; este derivado mantiene esas capacidades, permitiendo generar correos, resúmenes de reuniones o borradores de documentos sin interrupciones por rechazo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta evaluaciones internas de rechazo y coherencia, que se resumen a continuación:

| Evaluación interna | Resultado |
|---|---|
| Pantalla de rechazo completa - 842 prompts | 0/842 rechazos; 100% utilizables; 0 degeneración |
| Holdout de familias no vistas - 126 prompts, 96 tokens generados | 0/126 rechazos; 100% utilizables; 0 degeneración |
| Regresión de coherencia - codificación, JSON, depuración, explicación, matemáticas y tareas límite | 23/24 superadas |
| Diagnóstico de formato largo - 24 prompts, 256 tokens generados | 0/24 rechazos; 23/24 utilizables; 0 degeneración |
| Prueba multimodal de recarga | Superada; identificación correcta de un cuadrado azul |

Estos resultados son evaluaciones internas automatizadas, no auditorías independientes ni leaderboards públicos. La medición se realizó en el checkpoint BF16 con el modo thinking desactivado.

## Requisitos de hardware
- Peso BF16: aproximadamente 56 GB, más overhead de runtime y KV-cache. Requiere una GPU con al menos 80 GB de VRAM para inferencia cómoda (por ejemplo, A100 80GB o H100).
- GGUF Q4_K_M: estimación de ~15-16 GB de VRAM (27B parámetros × 4 bits ≈ 13,5 GB más overhead). Puede ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado.
- GGUF Q5_K_M: ~18-19 GB de VRAM, también viable en GPUs de 24 GB.
- GGUF Q8_0: ~28-29 GB de VRAM, requiere GPUs profesionales o de alta gama (por ejemplo, A6000 48GB o A100).
- Opciones de despliegue: transformers (con `AutoModelForImageTextToText`), Ollama (importando el GGUF), llama.cpp y vLLM (según la documentación del modelo base). El GGUF es solo texto a menos que se proporcione un proyector de visión compatible.
- Latencia y throughput: no disponible en la información proporcionada. Dependerá del backend, la cuantización y el hardware.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Multimodal | Licencia | Refusals |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,36 B | 32k (estimado) | Sí | Apache 2.0 | Comportamiento estándar de rechazo |
| Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS (este) | 27,36 B | 32k (estimado) | Sí | Apache 2.0 | 0 refusals en evaluación interna |
| Huihui-Qwen3.8-27B-abliterated | 27,36 B | 32k (estimado) | Sí | Apache 2.0 | Reducción de rechazos (sin datos específicos) |

La comparativa se basa en que todos derivan del mismo modelo base. La diferencia principal es el grado de abliteración y las evaluaciones reportadas. No se dispone de datos de benchmarks públicos para comparar rendimiento en tareas estándar.

## Limitaciones y advertencias
- "Uncensored" no es una garantía: el autor advierte que la reducción de rechazos no es absoluta para todos los prompts, idiomas, configuraciones de decodificación, cuantizaciones o runtimes.
- No se garantiza que los rendimientos originales del modelo base en razonamiento, facticidad, codificación o visión se mantengan intactos tras la abliteración. Las evaluaciones internas solo miden forma y topicalidad, no exactitud factual.
- El MTP head (decodificación especulativa) del modelo base no está incluido; la generación estándar y el modo thinking siguen disponibles, pero no la decodificación especulativa dependiente de MTP.
- Los GGUF son solo texto; para usar la funcionalidad multimodal es necesario el checkpoint safetensors o proporcionar un proyector de visión compatible.
- La cuantización puede alterar el comportamiento de rechazo y la calidad de las respuestas. Los resultados reportados se midieron en BF16 con thinking desactivado.
- Riesgo de alucinaciones y sesgos inherentes al modelo base, no mitigados por la abliteración.
- La licencia Apache 2.0 permite uso comercial, pero el modelo puede generar contenido que infrinja políticas de plataforma o normativas locales; el usuario es responsable del uso.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/shuijiaodawang/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Variante abliterada similar (Huihui): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Build de Ollama de una abliteración de Qwen3.8-27B: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Artículo sobre abliteración de Qwen3.8-27B (AEON): https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
