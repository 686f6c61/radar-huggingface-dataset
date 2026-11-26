# Eureka-COM/QwenMosaic-27B-delta

## Resumen

QwenMosaic-27B-delta es un artefacto de investigación publicado por Eureka-COM que documenta la conversión de un transformer convencional en una arquitectura sin atención. Concretamente, sustituye las 16 capas de softmax-attention (capas 3, 7, ..., 63) del modelo base Qwen/Qwen3.8-27B por bloques oficiales Memory Mosaics de Meta (configuración v2, 16 cabeceras cortas y 16 largas). El repositorio contiene únicamente el delta entrenado: las nuevas memorias (1,01B parámetros), las normas de los bloques convertidos y adaptadores LoRA de rango 32 sobre el resto de capas, en bf16, con un total de aproximadamente 2,4 GB. Para obtener el modelo completo hay que descargar los pesos originales de Qwen y aplicar el delta.

El interés del artefacto es metodológico: demuestra que es posible eliminar por completo la atención de un modelo de 27B y reemplazarla por mecanismos de memoria asociativa, manteniendo un acuerdo top-1 del 84,4% con el modelo original y una recall de 10/10 a 6.000 tokens de distancia. No obstante, el propio autor advierte que el resultado es más débil que el modelo base en benchmarks generales (MMLU 77,1% frente a 84,3%), con una caída notable en matemáticas, y que el entrenamiento de destilación se limitó a 60M tokens.

La relevancia actual radica en que Memory Mosaics es una línea de investigación activa (ICLR 2025 y NeurIPS 2026) que propone alternativas a la atención cuadrática. Este delta ofrece a la comunidad un punto de partida reproducible y utilizable para seguir explorando arquitecturas sin atención a escala de 27B, con código de carga, scripts de exportación y registros de entrenamiento publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.8-27B con las 16 capas de softmax-attention (3, 7, ..., 63) sustituidas por bloques Memory Mosaics v2 (16 cabeceras cortas + 16 largas); sin capas ni pesos de atención tras aplicar el delta |
| Parametros totales | 27B (modelo base) + 1,01B de nuevas memorias en el delta; el delta publicado ocupa 2,4 GB en bf16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens durante el entrenamiento (etapas 1 y 2); etapa 3 probada a 8.192; contexto máximo de inferencia no especificado |
| Tipos de cuantizacion | no disponible (el delta se publica en bf16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | bf16 (safetensors implícito en el repo de Hugging Face); requiere código propio de mmllm para cargar |

## Arquitectura y entrenamiento

La arquitectura resultante es un transformer de 27B sin atención: cada una de las 16 capas de softmax-attention se reemplaza por un bloque Memory Mosaics v2 de Meta (facebookresearch/MemoryMosaics, commit c2ca0e8), con 16 cabeceras de memoria corta y 16 de memoria larga. El resto de capas del modelo base se conservan, pero se ajustan mediante LoRA de rango 32 junto con las normas de los bloques convertidos. El delta contiene solo lo entrenado: 1,01B parámetros de memorias nuevas, normas y LoRA. Los pesos finales corresponden al checkpoint `mq-27b-s2` de los registros de investigación.

El entrenamiento sigue el procedimiento de RADLADS (arXiv:2505.03005) en dos etapas de 30M tokens cada una, con longitud de secuencia 2.048. La etapa 1 ajusta cada memoria nueva a la salida de la atención original de su capa (layer fit). La etapa 2 destila el modelo completo (memorias, normas y LoRA) minimizando la KL divergence respecto a la distribución next-token del modelo original. Los datos mezclan cosmopedia-100k, ultrachat_200k, Wikipedia en japonés y codeparrot-clean en proporción 4:2:2:1. Se probó una etapa 3 adicional de 8M tokens a 8.192 de contexto, pero dejó KL y perplexity prácticamente iguales y empeoró ligeramente la recall, por lo que se publicaron los pesos de la etapa 2.

## Capacidades

- Generación de texto autoregresiva en inglés y japonés.
- Razonamiento general y respuesta a preguntas de conocimiento, con rendimiento inferior al modelo base (MMLU 77,1%).
- Recuperación de información a larga distancia dentro del contexto: recall de códigos de 5 dígitos a 6.000 tokens de distancia, tanto en relleno sin conversación como dentro de un turno de chat.
- Conversación multi-turno mediante plantilla de chat compatible con la del modelo base (`apply_chat_template`), incluyendo el flag `enable_thinking=False`.
- Matemáticas: capacidad reducida (57,1% en 5 asignaturas de MMLU frente a 83,1% del original); GSM8K no medido de forma válida.
- Tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y multi-step reasoning: no disponible (no se documenta).
- Capacidades especiales: arquitectura sin atención con memorias asociativas; no se documentan visión, audio ni modo thinking funcional.

## Casos de uso

- Investigación en arquitecturas sin atención: servir como punto de partida reproducible para estudiar Memory Mosaics a escala de 27B, aplicando el delta sobre Qwen3.8-27B y comparando KL, perplexity y recall con el modelo original.
- Experimentos de destilación de atención: utilizar las etapas 1 y 2 documentadas (layer fit y KL distillation) como receta base para convertir otras capas o modelos, ajustando el número de tokens y la mezcla de datos.
- Evaluación de recuperación a larga distancia: emplear las sondas de recall (código de 5 dígitos a 6.000 tokens) para medir la fidelidad de memoria de variantes arquitectónicas antes de entrenamientos más costosos.
- Generación de texto en inglés y japonés en entornos de investigación: con contexto de hasta 2.048 tokens y decodificación greedy, para tareas de continuación y respuesta conversacional de complejidad moderada.
- Estudio de eficiencia de inferencia: comparar el coste de los bloques Memory Mosaics frente a la atención softmax en una GPU de 80 GB, midiendo latencia y throughput en bf16 con prompts de igual longitud.
- Base para fine-tuning posterior: al conservar LoRA de rango 32 y normas ajustables, el delta puede servir como inicialización para adaptaciones específicas de dominio antes de exportar un modelo autocontenido con `scripts/mq_export.py`.
- Docencia y divulgación técnica: ilustrar de forma tangible la sustitución de atención por memorias asociativas, con código de carga mínimo y evaluación publicada.

## Benchmarks y rendimiento

| Metrica | QwenMosaic-27B-delta | Qwen3.8-27B (original) |
|---|---|---|
| KL(original ‖ converted), next token (held-out, 16 x 2.048 tokens) | 0,165 | — |
| Perplexity ratio (converted / original) | 0,891 | 1,000 (referencia) |
| Top-1 agreement con el original | 0,844 | — |
| MMLU, 1.000 preguntas zero-shot | 77,1% | 84,3% |
| MMLU, 5 asignaturas de matemáticas (77 preguntas) | 57,1% | 83,1% |
| Recall de código de 5 dígitos a 32–6.000 tokens (relleno sin conversación) | 10/10 en todas las distancias | 10/10 |
| Recall del mismo código dentro de un turno de chat, a 6.000 tokens | 8/8 | 8/8 |

El autor advierte que el ratio de perplexity inferior a 1 no implica superioridad: el modelo original asigna probabilidad casi nula al token correcto en aproximadamente el 12% de las posiciones, donde la distribución más amplia del convertido pierde menos; en el resto de posiciones el original tiene menor loss y mayor accuracy. GSM8K se intentó pero no es una medición válida: la mayoría de respuestas quedaron truncadas por el límite de 256 tokens de generación, también en el modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor ejecutó inferencia en bf16 en una única GPU de 80 GB; con 27B parámetros más 1,01B de memorias, el modelo completo en bf16 requiere aproximadamente 56 GB de pesos, más activaciones y caché, por lo que encaja en 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB. No se documenta ejecución en GPUs de 24 GB o 48 GB.
- Cabe en consumer GPU: no disponible; con 27B en bf16 no cabe en RTX 4090 (24 GB) sin cuantización, y no se publican pesos cuantizados.
- Opciones de despliegue: código propio del repositorio Eureka-COM/QwenMosaic (paquete `mmllm`, `load_mosaic_qwen`), con transformers >= 5.2 y < 5.23. Los bloques Memory Mosaics no forman parte de Hugging Face Transformers, por lo que vLLM, llama.cpp, Ollama y TGI no están soportados según la información disponible.
- Limitaciones de batching: el padding dentro de un batch no queda enmascarado por las memorias; hay que generar un prompt a la vez o lotes de igual longitud.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QwenMosaic-27B-delta | 27B + 1,01B de memorias | 2.048 en entrenamiento | 77,1% | Apache 2.0 | Delta en Hugging Face + código en GitHub |
| Qwen3.8-27B (base) | 27B | no disponible en esta ficha | 84,3% | Apache 2.0 | Hugging Face |
| Memory Mosaics v2 (Meta, referencia arquitectónica) | no disponible | no disponible | no disponible | Apache 2.0 (código) | GitHub facebookresearch/MemoryMosaics |

La comparativa directa con alternativas de la misma categoría (modelos de 27B sin atención) no está disponible en la información proporcionada; el único contraste cuantificado es con el modelo base Qwen3.8-27B.

## Limitaciones y advertencias

- Rendimiento inferior al modelo base: MMLU cae de 84,3% a 77,1% y matemáticas de 83,1% a 57,1%; el autor lo califica explícitamente como más débil que Qwen3.8-27B.
- Entrenamiento limitado: solo 60M tokens de destilación, frente a los volúmenes habituales de preentrenamiento; el artefacto es de investigación, no de producción.
- El ratio de perplexity por debajo de 1 no debe interpretarse como mejora; la distribución más amplia del convertido compensa posiciones donde el original falla.
- GSM8K no constituye una medición válida por truncamiento a 256 tokens de generación.
- Contexto de entrenamiento corto (2.048 tokens); la etapa 3 a 8.192 no mejoró KL ni perplexity y empeoró la recall.
- El padding dentro de un batch no se enmascara: riesgo de resultados incorrectos en generación por lotes con longitudes distintas.
- No hay soporte en Hugging Face Transformers ni en frameworks de serving estándar (vLLM, llama.cpp, Ollama, TGI); requiere el código propio del repositorio.
- Idiomas limitados a inglés y japonés; no se documenta soporte de castellano.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a un modelo destilado con 60M tokens y rendimiento reducido.
- Sesgos conocidos: no documentados en la model card.
- Licencia Apache 2.0 para el delta y el código; los datasets de entrenamiento tienen licencias diversas (cosmopedia-100k apache-2.0, ultrachat_200k mit, wikimedia/wikipedia cc-by-sa-3.0 y gfdl, codeparrot-clean sin licencia en la dataset card), que deben revisarse para uso comercial.
- El repositorio no contiene pesos completos: es imprescindible descargar Qwen/Qwen3.8-27B y aplicar el delta; sin ese paso el artefacto no es utilizable.

## Enlaces

- Hugging Face: https://huggingface.co/Eureka-COM/QwenMosaic-27B-delta
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código y registros: https://github.com/Eureka-COM/QwenMosaic
- Memory Mosaics (Meta): https://github.com/facebookresearch/MemoryMosaics
- Paper RADLADS: https://arxiv.org/abs/2505.03005
- Paper Memory Mosaics (ICLR 2025): incluido en la model card como referencia bibliográfica (Zhang et al., 2025)
- Paper Memory Mosaics at scale (NeurIPS 2026): incluido en la model card como referencia bibliográfica (Zhang y Bottou, 2026)
- Dataset cosmopedia-100k: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-100k
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset codeparrot-clean: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
