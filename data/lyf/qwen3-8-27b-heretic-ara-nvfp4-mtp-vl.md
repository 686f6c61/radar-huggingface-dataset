# lyf/Qwen3.8-27B-Heretic-ARA-NVFP4-MTP-VL

## Resumen

El modelo `lyf/Qwen3.8-27B-Heretic-ARA-NVFP4-MTP-VL` es una versión cuantizada en NVFP4 (W4A4) del modelo multimodal `heretic-org/Qwen3.8-27B-heretic-ara`, que a su vez deriva de `Qwen/Qwen3.8-27B` tras un proceso de "abliteration" (eliminación de censura) conocido como ARA. El resultado es un modelo de 27.781 millones de parámetros que conserva la torre de visión/video en BF16 y el cabezal MTP (Multi-Token Prediction) también en BF16, permitiendo decodificación especulativa con vLLM en GPUs Blackwell como la RTX 5090.

El modelo está pensado para entornos de producción que requieran inferencia multimodal (imagen, vídeo y texto) con alta velocidad y bajo consumo de VRAM, manteniendo la calidad del modelo original gracias a una calibración de 163.840 tokens. Su licencia Apache 2.0 y su compatibilidad con el runtime de vLLM lo convierten en una opción atractiva para desarrolladores que buscan desplegar un asistente conversacional sin censura con capacidades de razonamiento y tool calling.

La relevancia de esta release radica en que demuestra la viabilidad de ejecutar un modelo multimodal de 27B con cuantización NVFP4 y MTP en una GPU de consumo (32 GB), logrando un throughput de 120-135 tokens por segundo en generación de 1024 tokens, con una tasa de aceptación media de draft del 61-62%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (híbrida: atención lineal Gated DeltaNet + atención estándar, multimodal) |
| Parametros totales | 27.781.427.952 (~27,78 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32768 en configuración de ejemplo; nativo no especificado en la información disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (compressed-tensors, group size 16); torre de visión, MTP, embeddings y lm_head en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, formato `nvfp4-pack-quantized` (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` emplea una arquitectura transformer híbrida que combina capas de atención lineal basadas en Gated DeltaNet con capas de atención estándar, junto con una torre de visión/vídeo que procesa entradas multimodales. Sobre esta base, el proyecto Heretic aplicó un proceso de "abliteration" (eliminación de representaciones de rechazo) para reducir la censura del modelo, resultando en la variante ARA publicada por `heretic-org`.

La presente release aplica una cuantización PTQ con NVIDIA Model Optimizer en configuración NVFP4 W4A4, calibrada sobre 20 muestras de CNN/DailyMail (163.840 tokens). Las capas lineales del modelo de lenguaje se cuantizan a NVFP4 con group size 16, mientras que la torre de visión (333 tensores), el cabezal MTP (15 tensores), `lm_head`, embeddings y las capas `conv1d` del Gated DeltaNet se mantienen en BF16. El checkpoint resultante se convierte al formato `compressed-tensors` mediante `ModelOptNvfp4Converter` para garantizar la compatibilidad con el runtime de vLLM para Qwen3.8.

El modelo conserva el mecanismo MTP nativo (n=3) para decodificación especulativa, que comparte embeddings y LM head con el modelo objetivo. No se menciona entrenamiento adicional con RLHF o DPO; se trata de una cuantización del modelo ya ajustado.

## Capacidades

- Generación de texto y razonamiento multi-turno, con soporte de modo "thinking" (razonamiento explícito) configurable mediante `enable_thinking`.
- Comprensión multimodal de imágenes y vídeo: procesa entradas visuales y responde con descripciones o análisis (verificado con peticiones PNG y MP4).
- Tool calling / function calling: el modelo base Qwen3.8 soporta invocación de herramientas, y esta release hereda dicha capacidad.
- Decodificación especulativa con MTP (n=3), que acelera la generación sin pérdida de calidad.
- Conversacional y "uncensored" (abliterated), lo que reduce los rechazos ante peticiones sensibles.
- Multilingüe limitado a inglés y chino.

## Casos de uso

- Asistente virtual multimodal para soporte técnico: puede analizar capturas de pantalla o vídeos enviados por el usuario y ofrecer respuestas contextuales, gracias a su torre de visión y su ventana de contexto de hasta 32768 tokens en la configuración recomendada.
- Generación de descripciones de vídeo para plataformas de contenido: el modelo procesa vídeos MP4 y produce narraciones o subtítulos automáticos, útil para herramientas de accesibilidad o archivado.
- Chatbot de atención al cliente sin censura en inglés y chino: su naturaleza abliterated permite manejar consultas delicadas sin rechazos automáticos, aunque requiere supervisión humana.
- Agente de razonamiento con tool calling: puede integrarse en pipelines que requieran planificación multi-paso, búsqueda de información o ejecución de acciones externas mediante funciones.
- Análisis de imágenes en tiempo real en edge computing: gracias a la cuantización NVFP4 y al soporte de vLLM, puede desplegarse en una RTX 5090 para aplicaciones de visión por computador en local.
- Servidor de inferencia OpenAI-compatible: el modelo se sirve con vLLM y expone una API compatible con OpenAI, facilitando su integración en aplicaciones existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de rendimiento de inferencia medidas localmente en una RTX 5090:

| Metrica | Resultado |
|---|---|
| Throughput de generación con MTP (1024 tokens) | 120,5–134,7 tok/s |
| Longitud media de aceptación MTP | 2,83–2,86 |
| Aceptación por posición | 0,777/0,592/0,463 y 0,808/0,599/0,456 |
| Aceptación media de draft | 61,1–62,1% |
| VRAM durante petición multimodal | ~28.984 MiB |

Estos valores son evidencia de reproducibilidad local, no una garantía de velocidad frente a configuraciones sin MTP.

## Requisitos de hardware

- VRAM estimada: ~29 GB durante inferencia multimodal con contexto 32768 y KV cache FP8 (medido en RTX 5090 de 32 GB).
- GPU recomendadas: NVIDIA RTX 5090 (SM120, Blackwell) o GPUs con soporte para NVFP4 (Blackwell). No se garantiza funcionamiento en arquitecturas anteriores.
- Ejecución en GPU de consumo: sí, con una RTX 5090 de 32 GB; no cabe en GPUs de 24 GB o menos sin reducir contexto o usar offload.
- Opciones de despliegue: vLLM (imagen Docker `vllm/vllm-openai:qwen38-x86_64-cu130`), compatible con OpenAI API. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: 120-135 tok/s en generación de 1024 tokens con MTP activado y `max-num-seqs 1`; latencia no reportada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,78 B | no especificado | BF16 | Apache 2.0 | Modelo base sin abliteration |
| heretic-org/Qwen3.8-27B-heretic-ara | 27,78 B | no especificado | BF16 | Apache 2.0 | Versión abliterated (ARA) |
| lyf/Qwen3.8-27B-Heretic-ARA-NVFP4-MTP-VL | 27,78 B | 32768 (ejemplo) | NVFP4 W4A4 | Apache 2.0 | Cuantización + MTP, multimodal |

No se dispone de comparativas con otros modelos de la misma categoría (p. ej., Llama 3.2 30B o Qwen2.5-VL 32B) en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo "abliterated", puede generar contenido ofensivo, ilegal o dañino sin filtros; su uso en producción requiere medidas de moderación adicionales.
- Riesgo de alucinaciones inherente a los modelos de lenguaje; no validado en tareas de alta precisión.
- Solo soporta inglés y chino; no se garantiza buen rendimiento en otros idiomas.
- La cuantización NVFP4 está optimizada para GPUs Blackwell; en otras arquitecturas puede degradar el rendimiento o no funcionar.
- El contexto nativo no está documentado; la configuración de ejemplo usa 32768, pero secuencias más largas pueden requerir ajustes de memoria.
- No se han publicado benchmarks de calidad que avalen el rendimiento en tareas estándar.
- El repositorio tiene 0 descargas y 0 likes; se trata de una release reciente y sin validación comunitaria amplia.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/lyf/Qwen3.8-27B-Heretic-ARA-NVFP4-MTP-VL)
- [Modelo base original Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Modelo base cuantizado heretic-org/Qwen3.8-27B-heretic-ara](https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara)
- [NVIDIA Model Optimizer](https://github.com/NVIDIA/Model-Optimizer)
