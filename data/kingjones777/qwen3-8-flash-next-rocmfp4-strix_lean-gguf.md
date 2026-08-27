# kingjones777/Qwen3.8-Flash-Next-ROCmFP4-STRIX_LEAN-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje multimodal de código abierto desarrollado por el equipo Qwen, basado en la nueva arquitectura Qwen4. Se trata de un MoE ultra-sparse con 125 mil millones de parámetros en el cuerpo principal, más una tabla de embeddings N-gram de 51 mil millones, lo que da un total de 176,9 mil millones de parámetros, aunque solo activa 6 mil millones por token. Soporta una ventana de contexto de 262 000 tokens y está diseñado para razonamiento avanzado, generación de código, visión y chat. Según las pruebas publicadas por unsloth, supera a Claude-4.6-Opus en tareas de codificación agéntica, visión y conversación.

Esta ficha se centra en la cuantización GGUF específica `Qwen3.8-Flash-Next-ROCmFP4-STRIX_LEAN-GGUF`, creada por kingjones777 para hardware AMD Strix Halo (gfx1151). Utiliza el formato ROCmFP4, con pesos cuantizados a 4 bits para atención y expertos MoE, y una gestión cuidadosa de las capas de embedding y salida para preservar la calidad. El archivo resultante pesa 98,5 GiB y requiere un fork parcheado de llama.cpp para su ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4, MoE ultra-sparse con Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA) |
| Parametros totales | 176,9B (125B del MoE + 51B de tabla N-gram) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | Q4_0_ROCMFP4 (atención y MoE), Q5_1 (tabla PLE), Q5_K (token embeddings), Q6_K (lm head) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (3 shards, 44,9 GB + 44,7 GB + 16,1 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea la arquitectura Qwen4, que combina dos mecanismos de atención: tres de cada cuatro capas utilizan Gated DeltaNet (GDN) para comprimir el historial de forma eficiente, mientras que la cuarta capa usa Qwen Sparse Attention (QSA) para recuperación precisa de información a larga distancia. Es un MoE ultra-sparse con 6 mil millones de parámetros activos por token, lo que permite un rendimiento elevado con un coste computacional reducido. Además, incorpora una tabla de embeddings N-gram de 51 mil millones de parámetros que se añade al cuerpo principal, lo que explica el tamaño total de 176,9B.

La cuantización ROCmFP4 de kingjones777 se realizó a partir de una conversión BF16 de los pesos de lanzamiento. La receta STRIX_LEAN asigna `Q4_0_ROCMFP4` a todos los pesos de atención y expertos MoE (~57 GiB), `Q5_1` a la tabla de embeddings por capa (35,8 GiB), `Q5_K` a los token embeddings (0,4 GiB) y `Q6_K` al head de salida (0,5 GiB). El head se mantiene en 6 bits para evitar errores de cuantización en el argmax, ya que cada token generado pasa por él. No se dispone de información sobre los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación consultada.

## Capacidades

- Generación de texto y chat conversacional de alta calidad.
- Razonamiento avanzado y resolución de problemas complejos.
- Generación y comprensión de código, con soporte para tareas de programación agéntica.
- Capacidades multimodales: procesamiento de imágenes y texto (según las fuentes de unsloth y vLLM).
- Ventana de contexto de 262 000 tokens, adecuada para documentos extensos y conversaciones de largo recorrido.
- Arquitectura MoE ultra-sparse que permite inferencia eficiente con solo 6B parámetros activos por token.
- No se ha confirmado explícitamente el soporte de tool calling o function calling en la información disponible, aunque es probable dado su perfil agéntico.

## Casos de uso

- Desarrollo de agentes autónomos: el modelo puede planificar y ejecutar tareas multi-paso gracias a su razonamiento avanzado y su capacidad de codificación, integrándose en frameworks de agentes como LangChain o AutoGen.
- Generación de código en producción: con soporte para contexto largo y generación de código, puede utilizarse en pipelines de CI/CD para autocompletar, revisar o refactorizar código, o como asistente en IDEs.
- Análisis de documentos extensos: su ventana de 262K tokens permite procesar informes, contratos o investigaciones completas en una sola pasada, extrayendo información relevante y resumiendo contenido.
- Asistente de atención al cliente: puede gestionar conversaciones multi-turno con contexto amplio, manteniendo el hilo de la conversación y ofreciendo respuestas precisas en varios idiomas (aunque no se especifican los idiomas soportados).
- Razonamiento matemático y científico: su capacidad de razonamiento avanzado lo hace útil para resolver problemas de matemáticas, física o lógica, así como para explicar conceptos complejos.
- Visión por computadora: al ser multimodal, puede analizar imágenes, responder preguntas sobre su contenido y generar descripciones, útil en aplicaciones de accesibilidad o moderación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La documentación de unsloth afirma que Qwen3.8-Flash-Next supera a Claude-4.6-Opus en tareas de codificación agéntica, visión y chat, pero no se proporcionan cifras concretas. En cuanto al rendimiento de la cuantización, en un Ryzen AI MAX+ 395 (gfx1151, Radeon 8060S, ROCm 7.2.4) con descarga completa a GPU, se midieron 22,1 tokens/s en generación (single stream, greedy) y 37,6 tokens/s en procesamiento de prompt.

## Requisitos de hardware

- VRAM estimada: ~99 GiB libres en GPU para alojar los 98,5 GiB de pesos con descarga completa de las 49 capas.
- GPU recomendada: AMD Ryzen AI MAX+ 395 (gfx1151, Radeon 8060S) con ROCm 7.2.4 o superior. El formato ROCmFP4 es específico de AMD y no funciona en GPUs NVIDIA.
- En un sistema Strix Halo con 128 GB de memoria unificada, el modelo cabe si la GPU está libre (sin otras cargas que consuman UMA).
- Opciones de despliegue: llama.cpp parcheado (fork ROCmFPX, PR #27742) con `llama-server`. No es compatible con builds estándar de llama.cpp ni con otros runners como Ollama o vLLM sin modificaciones.
- Latencia y throughput: 22,1 tok/s de generación y 37,6 tok/s de prompt processing en el hardware de referencia.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de la misma categoría (MoE ultra-sparse de ~125B con 6B activos). Se podría comparar con DeepSeek-V3 o Qwen3-MoE, pero no hay información de benchmarks en las fuentes consultadas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Requiere un fork específico de llama.cpp (ROCmFPX) con soporte para la arquitectura `qwen4exp` y los tipos de tensor `Q4_0_ROCMFP4_*`. Los builds estándar no cargarán estos archivos.
- El formato ROCmFP4 es exclusivo de hardware AMD (gfx1151 y similares). No es portable a GPUs NVIDIA o Intel.
- El tamaño del archivo (98,5 GiB) exige una cantidad considerable de memoria unificada o VRAM, lo que limita su uso a equipos de gama alta.
- La licencia qwen-community-1.0 permite uso comercial, pero con condiciones específicas (atribución, no responsabilidad, etc.). Es recomendable revisar los términos completos antes de su uso en producción.
- Al ser un modelo de gran tamaño, existe riesgo de alucinaciones, especialmente en tareas de razonamiento complejo o con información poco frecuente.
- No se han publicado datos sobre sesgos o limitaciones idiomáticas específicas; se recomienda evaluar el modelo en el dominio de aplicación concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-ROCmFP4-STRIX_LEAN-GGUF
- Documentación de unsloth sobre Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Proyecto GitHub de julianmb sobre Qwen 3.8 27B en Strix Halo: https://github.com/julianmb/q38rocm
