# preetpatel/Qwen3.8-27B-Uncensored-NVFP4

## Resumen

El modelo `preetpatel/Qwen3.8-27B-Uncensored-NVFP4` es una cuantización NVFP4 (W4A4) del fine-tune abliterado `orcarouter/Qwen3.8-27B-Uncensored`, que a su vez deriva del modelo base `Qwen/Qwen3.8-27B` de Alibaba. El autor, preetpatel, ha aplicado una compresión one-shot RTN con llmcompressor para reducir el peso de 56 GB (BF16) a aproximadamente 19 GB, lo que permite ejecutar un modelo de 27 000 millones de parámetros en una única GPU consumer Blackwell como la RTX 5090 (32 GB) con una ventana de contexto de hasta 160 000 tokens.

La relevancia de este modelo radica en que combina tres características demandadas por la comunidad: una arquitectura híbrida moderna (Gated DeltaNet + Gated Attention) con capacidades de visión, razonamiento explícito y tool calling; una variante "uncensored" obtenida mediante abliteración, orientada a red-teaming e investigación; y un formato de cuantización NVFP4 que aprovecha las aceleraciones nativas de las GPUs Blackwell (SM120/SM100) manteniendo la precisión en las capas sensibles. El resultado es un modelo de propósito general que puede desplegarse en hardware de consumo con rendimiento de prefill de 6-7k tokens por segundo en contextos cortos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas, cada una con 3 bloques (Gated DeltaNet → FFN) y 1 bloque (Gated Attention → FFN); torre de visión adicional |
| Parametros totales | 27 356 728 560 (27,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 000 tokens (modelo base); verificado hasta 160 000 tokens en esta cuantización con RTX 5090 |
| Tipos de cuantizacion | NVFP4 (W4A4) en capas lineales del transformer; BF16 en `lm_head`, torre de visión y capas `linear_attn`; KV cache FP8 opcional |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, esquema NVFP4) |

## Arquitectura y entrenamiento

La arquitectura base, Qwen3.8-27B, es un modelo híbrido que combina atención lineal Gated DeltaNet con atención clásica Gated Attention. Según la documentación de FriendliAI, cada una de las 64 capas contiene tres bloques de (Gated DeltaNet → FFN) y un bloque de (Gated Attention → FFN). Las proyecciones de decay y beta de DeltaNet (`in_proj_a` / `in_proj_b`) son de bajo rango y sensibles a la precisión, por lo que se mantienen en BF16 junto con la capa causal conv1d. Esta arquitectura solo conserva KV cache para 16 de las 64 capas, lo que reduce drásticamente el consumo de memoria en contextos largos.

El modelo base fue sometido a un proceso de abliteración (abliteration) por el autor orcarouter, que elimina selectivamente las direcciones de rechazo aprendidas durante el RLHF, produciendo una variante "uncensored" destinada a investigación y red-teaming. Sobre este fine-tune, preetpatel aplicó una cuantización one-shot RTN (round-to-nearest) con llmcompressor 0.13.0, utilizando el esquema NVFP4 (FP4 para pesos y activaciones) en todas las capas lineales, excluyendo `lm_head`, la torre de visión y las capas `mtp`. La calibración se realizó con 20 muestras de `ultrachat_200k` (longitud máxima 2048 tokens) únicamente para fijar las escalas globales de activación; no hubo entrenamiento adicional.

## Capacidades

- Generación de texto y conversación multilingüe (inglés y chino) con calidad de modelo de 27B.
- Razonamiento explícito mediante modo `thinking`: el modelo genera cadenas de razonamiento internas que pueden extraerse como `reasoning_content` con el parser adecuado.
- Comprensión de imágenes (visión): acepta hasta 2 imágenes por prompt (verificado en la configuración de vLLM) y responde a preguntas sobre su contenido.
- Tool calling estructurado: soporta el formato XML de Qwen3-Coder (`<function=...><parameter=...>`) y produce salidas `tool_calls` válidas con `finish_reason` correcto.
- Capacidades de agente: verificado como backend de un agente de codificación (pi-mono) con bucle multi-turno de herramientas, escritura de archivos y ejecución de shell.
- Generación de código y razonamiento matemático, heredados del modelo base Qwen3.8-27B.
- Recuperación de información en contexto largo: precisión exacta en pruebas de needle retrieval con prompts de 155k tokens.

## Casos de uso

- Red-teaming y evaluación de seguridad: la variante abliterada permite probar comportamientos de rechazo y sesgos en modelos de lenguaje, útil para investigadores que estudian alineación y robustez.
- Asistente de codificación local: con tool calling y razonamiento, puede integrarse en entornos de desarrollo (IDE, CLI) para generar, revisar y ejecutar código, como se verificó con el agente pi-mono.
- Análisis de documentos largos: con 160k tokens de contexto y recuperación exacta, es adecuado para resumir o extraer información de manuales técnicos, informes o libros extensos.
- Chat multimodal en hardware de consumo: al aceptar imágenes, puede describir capturas de pantalla, diagramas o fotografías en conversaciones de soporte técnico.
- Automatización de tareas con herramientas: mediante function calling, puede orquestar llamadas a APIs, bases de datos o servicios externos en pipelines de automatización.
- Investigación en arquitecturas híbridas: al ser una cuantización NVFP4 de un modelo con Gated DeltaNet, sirve como banco de pruebas para estudiar el comportamiento de atención lineal en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento y funcionalidad realizadas en una RTX 5090 con vLLM 0.27.1:

| Prueba | Resultado |
|---|---|
| Needle retrieval, prompt de 155k tokens, needle al 85% de profundidad | Exacto |
| Needle retrieval, prompt de 155k tokens, needle al 10% de profundidad | Exacto |
| 2 prompts concurrentes de 60k tokens | Ambos exactos, 16 segundos en total |
| Tool calling estructurado (API `tools`) | `tool_calls` y `finish_reason` correctos |
| Throughput de prefill | ~6-7k tokens/s (contexto ≤93k), ~4k tokens/s a 155k |
| Uso de VRAM | ~19 GB pesos + ~7 GB pool KV + margen |

## Requisitos de hardware

- VRAM estimada: ~19 GB para los pesos cuantizados + ~7 GB para el pool de KV cache con contexto de 160k y FP8, más margen de seguridad (~1,5 GB). Total aproximado: 27-28 GB.
- GPU recomendadas: RTX 5090 (32 GB) verificada; cualquier GPU Blackwell con 32 GB o más (RTX PRO, B200) puede ejecutarla con aceleración nativa NVFP4. En GPUs no Blackwell, la cuantización FP4 funcionará pero sin las optimizaciones de hardware.
- Cabe en GPUs consumer de 32 GB (RTX 5090) y en algunas de 24 GB si se reduce el contexto (por ejemplo, 128k con KV FP8 y menor `gpu-memory-utilization`), aunque no está verificado.
- Opciones de despliegue: vLLM (versión 0.27.1 o superior) con los flags documentados; también es compatible con el ecosistema compressed-tensors y puede servirse mediante TGI o llama.cpp si se convierte a GGUF (no incluido en este repo).
- Latencia y throughput: prefill de ~6-7k tokens/s en contextos cortos, ~4k tokens/s en contextos de 155k; la generación depende de la configuración de decodificación y del número de secuencias concurrentes (máximo 8 en la configuración verificada).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| preetpatel/Qwen3.8-27B-Uncensored-NVFP4 | 27,36 B | 256k (160k verificado) | NVFP4 (W4A4) | Apache 2.0 | Abliterado, visión, tool calling |
| unsloth/Qwen3.8-27B-NVFP4 | 27,36 B | 256k | NVFP4 (W4A4) | Apache 2.0 | Sin abliteración, mismo esquema de cuantización |
| orcarouter/Qwen3.8-27B-Uncensored | 27,36 B | 256k | BF16 (original) | Apache 2.0 | Modelo base abliterado, sin cuantizar |
| Qwen/Qwen3.8-27B | 27,36 B | 256k | BF16 | Apache 2.0 | Modelo base oficial de Alibaba |

La comparativa se basa en características declaradas; no hay datos de benchmarks estándar disponibles para ninguna de estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo es una variante "uncensored" obtenida mediante abliteración; puede generar contenido inapropiado, ofensivo o peligroso. Está destinado exclusivamente a investigación y red-teaming, y el autor recomienda aplicar medidas de seguridad adicionales en despliegues downstream.
- Solo se declaran soporte de idiomas inglés y chino; el rendimiento en otros idiomas no está garantizado.
- La cuantización NVFP4 introduce una pérdida de precisión en las capas lineales. Aunque las pruebas funcionales no muestran degradación observable, los usuarios que requieran resultados exactos en benchmarks deberían verificar el comportamiento en sus casos de uso.
- Existe un caveat conocido: vLLM registra que la escala global de pesos NVFP4 es independiente por capa lineal, lo que añade un pequeño coste de redondeo al fusionar GEMMs de q/k/v y gate/up. No se ha observado impacto funcional, pero podría afectar a tareas de precisión extrema.
- El contexto máximo de 160k tokens está verificado solo en RTX 5090 con KV cache FP8 y configuración específica; configuraciones más ajustadas pueden provocar OOM durante el prefill debido a asignaciones transitorias del kernel de Gated DeltaNet.
- El modelo base tiende a sobre-razonar por defecto (puede generar decenas de miles de tokens de razonamiento para respuestas simples); se recomienda ajustar el prompt para limitar la profundidad del razonamiento en producción.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para esta cuantización, por lo que su rendimiento relativo frente a otros modelos no está cuantificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/preetpatel/Qwen3.8-27B-Uncensored-NVFP4
- Modelo base abliterado: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de configuración y cuantización: https://github.com/preetpatel/qwen3.8_27B-nvidia5090
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Artículo sobre abliteración de Qwen3.8-27B: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Guía de despliegue local (dev.to): https://dev.to/jamilxt/qwen-38-27b-topped-hacker-news-in-a-day-heres-how-to-run-it-locally-from-spring-boot-cee
