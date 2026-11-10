# AEON-7/Nemotron-3-Nano-Omni-AEON-Ultimate-Uncensored-BF16

## Resumen

Nemotron-3-Nano-Omni-AEON-Ultimate-Uncensored-BF16 es una variante "abliterated" (eliminación del comportamiento de rechazo) del modelo multimodal de NVIDIA `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16`, publicada por el usuario AEON-7. El modelo base combina una arquitectura híbrida NemotronH (Mamba2 + atención + MoE de 128 expertos), una torre de visión C-RADIOv2-H y un codificador de audio Parakeet, lo que le permite procesar texto, imagen y audio en una única pila (pipeline `any-to-any`). Sobre esa base, el autor aplica una ortogonalización del subespacio de rechazo en el flujo residual del modelo de lenguaje, preservando intactos los tensores de visión, audio y proyecciones.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de ablación de rechazos sobre una arquitectura híbrida poco habitual (Mamba2 + MoE), donde las herramientas estándar de abliteration fallan por la inyección automática de `<think>\n` al final del prompt. Por otro, el propio autor la etiqueta como **alpha experimental**: los bancos de prueba internos detectan bucles de razonamiento que no cierran el bloque `<think>` en aproximadamente 10 de cada 100 prompts, y advierte de degradación en conversación multi-turno. Es, por tanto, un artefacto de investigación, no un modelo listo para producción.

El checkpoint tiene 33.015.632.214 parámetros totales (con 30B nominales y ~3B activos por token, según el nombre del modelo base), se distribuye en BF16 (66,1 GB de repositorio) y está pensado para servir sobre GPUs Blackwell, incluyendo DGX Spark (sm_121a) mediante una imagen de contenedor vLLM publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH híbrida: Mamba2 + atención (hybrid-attention) + MoE de 128 expertos; torre de visión C-RADIOv2-H y codificador de audio Parakeet |
| Parametros totales | 33.015.632.214 |
| Parametros activos | ~3B (A3B, según denominación del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (esta variante); existe una variante NVFP4 del mismo autor (compresión ~3×) |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-open-model-agreement (etiquetada como `other`) |
| Formato de pesos | safetensors (BF16), librería transformers con `custom_code` |

## Arquitectura y entrenamiento

La arquitectura del modelo base es NemotronH, una pila híbrida que intercala capas Mamba2 con capas de atención y un MoE de 128 expertos, más una torre de visión RADIO (C-RADIOv2-H) y un encoder de audio Parakeet. El modelo está afinado para razonamiento con un modo *thinking* explícito (bloques `<think>`), y el chat template inyecta `<think>\n` automáticamente al final del prompt cuando el razonamiento está activado. El checkpoint derivado conserva byte a byte los 1.106 tensores de visión, audio, conectores y proyecciones, de modo que las rutas de inferencia multimodal son idénticas al modelo base.

El proceso de abliteration aplicado por AEON-7 identifica una dirección dominante de rechazo en el flujo residual en las capas 17, 24, 31, 38 y 45, con puntuaciones de separación (estadístico tipo d de Cohen) entre 3,9 y 4,9. La señal más fuerte aparece en la capa 24, posición −4 de la secuencia (separación ≈ 4,94), y no en la posición canónica −1 usada por las herramientas estándar, porque en modo razonamiento la posición −1 queda aguas abajo del punto de decisión rechazo/cumplimiento. El autor ortogonaliza un subespacio de rechazo de 12 dimensiones sobre 5 capas × 3 posiciones de token × 2 modos de pensamiento. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre las etapas de RLHF/DPO en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo *thinking* explícito (`enable_thinking=True/False`).
- Generación y depuración de código, aritmética multi-paso y recuperación factual (según las comprobaciones del autor, comportamiento idéntico al base token a token).
- Visión: entrada de imágenes a través de la torre C-RADIOv2-H, preservada bit-exacta respecto al base.
- Audio: entrada de audio mediante el encoder Parakeet, también preservado.
- Tool calling y function calling (etiquetas `tool-calling`, `function-calling`).
- Capacidades agénticas y razonamiento multi-paso (etiquetas `agentic`, `reasoning`).
- Servido compatible con la API de OpenAI (`openai-api`, `openai-compatible`) mediante vLLM.
- Soporte de *prefix caching* y *chunked prefill* en el stack de despliegue.
- Multilingüe: limitado a inglés según la model card.

## Casos de uso

- Investigación sobre alineación y abliteration: el modelo sirve como caso de estudio reproducible de eliminación del subespacio de rechazo en una arquitectura híbrida Mamba2 + MoE, con métricas de rechazo residual (~0 % con thinking, ~3 % sin thinking) sobre una muestra de 100 prompts dañinos.
- Evaluación comparativa de robustez: útil para medir cómo afecta la ablación a la coherencia en razonamiento (bucles en `<think>`) y en conversación multi-turno frente al modelo base de NVIDIA.
- Prototipado de asistentes multimodales sin filtros: para entornos de investigación controlados donde se necesita procesar imagen, audio y texto en una sola pila sin rechazos, aceptando el riesgo de degradación documentado.
- Despliegue en hardware Blackwell: con la imagen vLLM `ghcr.io/aeon-7/vllm-nemotron-omni-aeon-ultimate:v1` se puede servir en DGX Spark (sm_121a) o GPUs GB10, útil para laboratorios con ese hardware concreto.
- Generación de código en pipelines internos: el soporte de tool calling y la API compatible con OpenAI permiten integrarlo en flujos de CI/CD o agentes de código, siempre que se validen las salidas por el riesgo de bucles de razonamiento.
- Análisis de documentos con imagen y audio: al conservar intactos los encoders de visión y audio, puede transcribir o describir contenido audiovisual en flujos de investigación, con la advertencia de que el rendimiento conversacional puede degradarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta métricas internas del proceso de abliteration:

| Metrica | Valor reportado |
|---|---|
| Rechazo residual (BF16, `enable_thinking=True`) | ~0 % sobre 100 prompts dañinos |
| Rechazo residual (BF16, `enable_thinking=False`) | ~3 % sobre 100 prompts dañinos |
| Bucles de razonamiento sin cierre de `<think>` | ~10 de cada 100 prompts (banco interno) |
| Separación de la dirección de rechazo (capa 24, pos −4) | ≈ 4,94 (estadístico tipo d de Cohen) |
| Separación en capas 17, 24, 31, 38, 45 | 3,9–4,9 |
| Deltas de capacidad frente al base | ninguno detectado en comprobaciones puntuales |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~66 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda al menos 80 GB por GPU o sharding multi-GPU.
- Variante NVFP4 del mismo autor: compresión ~3×, pensada para GPUs Blackwell (reduce el requisito de memoria de forma sustancial, a costa de ruido FP4 que amplifica los artefactos).
- GPUs recomendadas: Blackwell (DGX Spark sm_121a, GB10 Grace Blackwell); para BF16 en general se requiere A100 80 GB, H100 o similar con suficiente memoria.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16; solo sería viable con cuantizaciones agresivas no publicadas en esta ficha.
- Despliegue: vLLM mediante la imagen `ghcr.io/aeon-7/vllm-nemotron-omni-aeon-ultimate:v1`, con soporte de prefix caching y chunked prefill; librería transformers con `custom_code`. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| AEON-7 Nemotron-3-Nano-Omni-AEON-Ultimate-Uncensored-BF16 | 33,0B totales / ~3B activos | no disponible | texto, visión, audio | nvidia-open-model-agreement | alpha experimental, abliterated |
| nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16 | ~30B / ~3B activos | no disponible | texto, visión, audio | nvidia-open-model-agreement | modelo base oficial, estable |
| Variante NVFP4 del mismo autor | 33,0B / ~3B activos | no disponible | texto, visión, audio | nvidia-open-model-agreement | alpha, cuantizada en FP4 |

La comparación más directa es con el modelo base de NVIDIA: misma arquitectura, mismos encoders multimodales y misma licencia, pero sin ablación y sin los artefactos de razonamiento documentados. No se dispone de información sobre otros modelos abliterated comparables de la misma familia en la documentación proporcionada.

## Limitaciones y advertencias

- **Estado alpha experimental**: el propio autor advierte que no es apto para producción y que el rendimiento conversacional real puede degradarse notablemente frente al base.
- **Bucles de razonamiento**: ~10 de cada 100 prompts provocan repeticiones dentro de `<think>` que nunca se cierra, generando respuestas vacías o repetitivas; el chat multi-turno puede amplificar el problema.
- **Degradación multi-turno**: los bancos de un solo turno pasan limpios, pero la conversación sostenida muestra fallos que las pruebas automatizadas no detectaron.
- **Artefactos amplificados por cuantización**: la variante NVFP4 añade ruido FP4 que agrava los problemas anteriores; el autor recomienda usar primero la variante BF16.
- **Riesgo de alucinación**: inherente al modelo base y no mitigado por la ablación; sin benchmarks estándar publicados no se puede cuantificar.
- **Idioma**: solo inglés según la model card, lo que limita su uso en castellano u otros idiomas.
- **Licencia**: `nvidia-open-model-agreement`; es necesario revisar sus términos para uso comercial, especialmente al tratarse de un derivado modificado.
- **Sesgos**: la eliminación del rechazo implica que el modelo puede generar contenido dañino sin filtros; requiere salvaguardas externas en cualquier despliegue.
- **Hardware restringido**: BF16 exige ~66 GB de pesos y el stack de despliegue documentado está orientado a Blackwell/DGX Spark.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/Nemotron-3-Nano-Omni-AEON-Ultimate-Uncensored-BF16
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Repositorio GitHub con guía de despliegue: https://github.com/AEON-7/Nemotron-3-Nano-Omni-AEON-Ultimate-Uncensored
- Runbook para DGX Spark: https://github.com/AEON-7/Nemotron-3-Nano-Omni-AEON-Ultimate-Uncensored/blob/main/docs/dgx-spark-setup.md
- Imagen vLLM: `ghcr.io/aeon-7/vllm-nemotron-omni-aeon-ultimate:v1`
- Discusiones del modelo: https://huggingface.co/AEON-7/Nemotron-3-Nano-Omni-AEON-Ultimate-Uncensored-BF16/discussions
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Paper referenciado en las etiquetas (arXiv:2406.11717): https://arxiv.org/abs/2406.11717
