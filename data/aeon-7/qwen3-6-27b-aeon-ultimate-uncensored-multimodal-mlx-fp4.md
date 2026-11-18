# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4

## Resumen

Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4 es una cuantización de 4 bits para Apple Silicon de un modelo multimodal de 27.356 millones de parámetros derivado de la familia Qwen3.6, publicada por el usuario independiente AEON-7. El modelo base es una versión "abliterated" (eliminación de rechazos) del checkpoint BF16 del mismo autor, y esta variante emplea una mezcla de precisión: `mxfp4` en la mayor parte del decodificador híbrido, islas afines de 8 bits en las proyecciones k/v de GQA, embeddings y cabeza de salida, y bf16 en la torre de visión, la dinámica de estado de Gated-DeltaNet y la cabeza MTP (Multi-Token Prediction).

La relevancia de esta ficha es doble. Por un lado, documenta un caso de cuantización agresiva orientada a hardware de consumo: 16,7 GB en disco y unos 17 GB de pico en memoria unificada, lo que permite ejecutar un modelo de 27B multimodal en un Mac con 24 GB. Por otro, incorpora decodificación especulativa nativa mediante una cabeza MTP que actúa como drafter, con una aceleración declarada de 1,78× sin pérdida de calidad (verificación de cada token contra el modelo objetivo).

El autor marca esta release como obsoleta en su propia model card y recomienda migrar a la línea Qwen3.8 Ultimate Uncensored NVFP4-MIXED para nuevos desarrollos. Se mantiene publicada por razones históricas y para descargas existentes. La licencia es "other", heredada del modelo base, y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal Gated-DeltaNet (SSM/Mamba), atención GQA clásica, torre de visión y cabeza MTP para decodificación especulativa |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | mxfp4 (4 bits) en el grueso del decodificador; afín de 8 bits en k/v GQA, embeddings y cabeza; bf16 en Gated-DeltaNet, torre de visión y cabeza MTP |
| Idiomas soportados | en (inglés) |
| Licencia | other |
| Formato de pesos | safetensors (formato MLX, librería `mlx`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido: combina capas de atención lineal basadas en Gated-DeltaNet (una variante de espacio de estados tipo Mamba/SSM) con capas de atención clásica con GQA. Sobre ese tronco se añaden dos componentes: una torre de visión que habilita la modalidad image-text-to-text y una cabeza MTP que permite decodificación especulativa autoinducida. El modelo base declara el tag `qwen3_5`, lo que sugiere que el linaje arquitectónico proviene de la generación Qwen3.5 antes del rebranding comercial a Qwen3.6.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original de Qwen. Lo que sí documenta el autor es el proceso de post-entrenamiento propio: una abliteración (eliminación de direcciones de rechazo) aplicada sobre el checkpoint BF16, que se propaga intacta a esta cuantización. La innovación técnica destacable de esta release es la metodología de cuantización mixta: se preserva en bf16 la dinámica de estado del SSM (sensible a la precisión por su naturaleza recurrente), la torre de visión (para no degradar la modalidad) y la cabeza MTP (para que el drafter siga siendo fiable), mientras que el resto del decodificador se comprime a mxfp4. Las islas de 8 bits en k/v y embeddings actúan como salvaguarda de calidad en los puntos de mayor impacto.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y respuesta a instrucciones, heredado del modelo base Qwen3.6.
- Comprensión de imágenes (image-text-to-text): la torre de visión se mantiene en bf16, por lo que la modalidad no se degrada por la cuantización.
- Decodificación especulativa mediante cabeza MTP con drafter separado (`--draft-kind mtp`), sin pérdida de calidad respecto a la inferencia sin especulación.
- Ejecución en memoria unificada de Apple Silicon con Metal, orientada a inferencia on-device.
- Comportamiento "uncensored": se han eliminado los rechazos del modelo base, de modo que responde a peticiones que el original declinaría.
- Soporte de servidor compatible con la API de OpenAI (`/v1/chat/completions`) mediante `mlx_vlm.server`.
- No se documenta soporte explícito de tool calling, function calling ni flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Asistente conversacional local en un Mac: el modelo cabe en 24 GB de memoria unificada y se sirve con `mlx_vlm.server` exponiendo un endpoint compatible con OpenAI, lo que permite sustituir una API remota por inferencia local sin cambiar el código cliente.
- Procesamiento de documentos con imágenes en local: al conservar la torre de visión en bf16, puede describir, resumir o extraer información de capturas, diagramas y fotografías sin enviar datos a un tercero, algo relevante para material confidencial.
- Generación de texto de alta velocidad en un solo flujo: con 26,5 tok/s gracias a la especulación MTP, es adecuado para dictado, autocompletado o chat interactivo donde la latencia percibida importa más que el throughput agregado.
- Prototipado de aplicaciones multimodales en Apple Silicon: sirve como banco de pruebas para pipelines image-text-to-text antes de escalar a hardware de servidor, con la ventaja de que la API es la misma que en producción.
- Investigación sobre cuantización mixta: el esquema mxfp4 con islas de 8 bits y capas bf16 selectivas es un caso de estudio reproducible para medir el impacto de la precisión por tipo de capa en modelos híbridos SSM/atención.
- Evaluación de seguridad y alineamiento: al ser una variante abliterated, es útil para estudiar cómo se comporta un modelo sin rechazos en tareas de red teaming y análisis de sesgos, siempre en un entorno controlado.
- Inferencia offline en portátil: con 16,7 GB en disco y unos 17 GB de pico, funciona sin conexión en un MacBook Pro M4 Pro de 48 GB y, según el autor, también en equipos de 24 GB.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento declarados son de velocidad de inferencia:

| Metrica | Valor declarado |
|---|---|
| Throughput sin especulación | 15,2 tok/s (single-stream) |
| Throughput con MTP (block size 3) | 26,5 tok/s (single-stream) |
| Aceleración MTP | 1,78× sin pérdida |
| Comparación con el hermano MLX-8bit | ~3,2× más rápido (8,2 tok/s en 8 bits) |
| Hardware de validación | MacBook Pro M4 Pro, 48 GB |
| Memoria mínima declarada | 24 GB de memoria unificada |

## Requisitos de hardware

- VRAM/memoria unificada: unos 17 GB de pico en inferencia; el autor indica que funciona en equipos con 24 GB de memoria unificada.
- Disco: 16,7 GB para el modelo, más 821 MB adicionales si se descarga el drafter MTP.
- GPU compatibles: Apple Silicon M1 o superior con Metal. El autor valida en M4 Pro de 48 GB. No hay soporte para GPU NVIDIA ni AMD en este formato MLX.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en Macs de consumo con 24 GB o más de memoria unificada. No es ejecutable en tarjetas gráficas discretas convencionales por el formato MLX.
- Despliegue: `mlx-vlm` desde `main` (la visión `qwen3_5_vision` no está en la 0.6.1), servidor `mlx_vlm.server` con endpoint compatible con OpenAI, y `mlx_vlm.generate` para inferencia puntual. No aplica vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: 15,2 tok/s en un solo flujo sin especulación y 26,5 tok/s con MTP y block size 3, medidos en M4 Pro. El autor señala que `--draft-block-size 3` es el punto óptimo.
- Parámetros de muestreo: el autor recomienda `temperature 1.0`, `top_p 0.95` y `top_k ~64`; advierte de que el servidor MLX usa decodificación greedy por defecto y que esta puede entrar en bucles con prompts largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4 | 27,36 B | no disponible | MLX mxfp4, Apple Silicon | other | 16,7 GB, 26,5 tok/s con MTP en M4 Pro |
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-8bit | 27,36 B (mismo base) | no disponible | MLX 8 bits, Apple Silicon | other | Casi sin pérdida respecto a BF16; 8,2 tok/s según el autor |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | no disponible | no disponible | NVFP4 + FP8, orientado a NVIDIA (Spark/GB10, RTX) | other | Sucesor recomendado por el autor; no ejecutable en Apple Silicon |
| Qwen3.6-27B original (familia Qwen) | ~27 B | no disponible | safetensors BF16, múltiples runtimes | no disponible | Modelo base alineado; esta release deriva de una versión abliterated |

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los rechazos, por lo que puede generar contenido que el modelo original declinaría. No es adecuado para aplicaciones dirigidas al público sin filtros adicionales.
- Licencia "other": no es una licencia estándar y las condiciones exactas de uso comercial no están detalladas en la información disponible. Es imprescindible revisar los términos del modelo base Qwen antes de desplegarlo en producción.
- Solo inglés declarado: no hay soporte multilingüe documentado, a diferencia de otras variantes de la familia Qwen.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual para esta cuantización; la compresión a 4 bits puede degradar sutilmente tareas de razonamiento frente al BF16, aunque el autor no aporta mediciones.
- Decodificación greedy problemática: el servidor MLX usa greedy por defecto y el autor advierte de bucles en prompts largos; hay que forzar `temperature 1.0` en cada petición.
- Dependencia de `mlx-vlm` desde `main`: la visión no está en la versión estable 0.6.1, lo que introduce riesgo de roturas por cambios en la rama principal.
- Ecosistema restringido: el formato MLX solo se ejecuta en Apple Silicon; no hay pesos GGUF, ONNX ni safetensors estándar para vLLM o TGI.
- Release obsoleta según el autor: la model card recomienda migrar a la línea Qwen3.8 NVFP4-MIXED para nuevos proyectos.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin verificar el límite real del modelo base.
- Procedencia: es una cuantización de un tercero independiente, no una release oficial de Qwen; no ha pasado por los procesos de evaluación y alineamiento del equipo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-FP4
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Hermano MLX 8 bits: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-8bit
- Drafter MTP: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter
- Sucesor recomendado (Qwen3.8 NVFP4-MIXED): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Repositorio de recetas del autor: https://github.com/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED
- mlx-vlm (librería de inferencia): https://github.com/Blaizzy/mlx-vlm
- uv (gestor de Python usado en el quickstart): https://docs.astral.sh/uv/
- Contenedor de despliegue en NVIDIA: `ghcr.io/aeon-7/aeon-vllm-ultimate:latest` (Spark / GB10) y `ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest` (RTX discretas)
