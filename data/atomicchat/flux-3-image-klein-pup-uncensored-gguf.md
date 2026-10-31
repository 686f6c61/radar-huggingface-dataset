# AtomicChat/FLUX-3-Image-Klein-pup-Uncensored-GGUF

## Resumen

FLUX-3-Image-Klein-pup-Uncensored-GGUF es una versión "abliterated" del prompt upsampler de FLUX 3 Image Klein, publicado por AtomicChat. El modelo base es un fine-tune de 9B parámetros basado en Qwen3.5 que Black Forest Labs utiliza como generador de captions detalladas para su modelo de imagen FLUX 3 Image Klein. El problema que resuelve es doble: por un lado, elimina las negativas (refusals) que el modelo original emite ante ciertos prompts (un 63% en peticiones en inglés marcadas como dañinas en su evaluación), y por otro, ofrece los pesos en formato GGUF cuantizado para poder ejecutar el upsampler localmente con llama.cpp.

La técnica empleada es la proyección del "refusal direction" fuera del espacio de representaciones del modelo, un método de abliteration que no requiere reentrenamiento. Según las mediciones del autor, la capacidad general del modelo apenas se degrada: MMLU pasa de 74,15% a 73,95% y el rendimiento en tool calling y recuperación de información se mantiene. Es relevante porque permite construir pipelines de generación de imágenes locales con FLUX 3 Klein sin las restricciones del upsampler oficial, aunque el propio autor matiza que el efecto sobre las imágenes generadas es nulo en sus pruebas, ya que el pipeline abierto ya dibuja las categorías sensibles probadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (fine-tune de Qwen3.5) como prompt upsampler multimodal |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 8192 tokens (valor usado en el comando de ejemplo; máximo del modelo no disponible) |
| Tipos de cuantizacion | BF16, Q8_0, AD-Q5_K_M, AD-IQ4_XS, AD-IQ3_S (además de LoRA de 3 MB) |
| Idiomas soportados | no disponible (las mediciones se realizaron en inglés y un set de texto neutro de 30 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix), más un LoRA GGUF de 3 MB y un proyector de visión mmproj F16 |

## Arquitectura y entrenamiento

El modelo base es black-forest-labs/flux-3-image-klein-pup, un fine-tune de 9B parámetros sobre Qwen3.5 que Black Forest Labs emplea como prompt upsampler: recibe una petición corta del usuario y produce una caption expandida y detallada que se pasa al modelo de imagen FLUX 3 Image Klein. Incluye un proyector de visión (mmproj) sin modificar, lo que permite realizar tareas de edición de imagen con imágenes de referencia.

La versión de AtomicChat no es un reentrenamiento, sino una edición de pesos mediante abliteration: se identifica la dirección de rechazo (refusal direction) en el espacio de activaciones y se proyecta fuera, eliminando el comportamiento de negación sin degradar apreciablemente las capacidades del modelo. La edición está disponible "horneada" en los pesos GGUF cuantizados o como LoRA de 3 MB aplicable a los archivos originales con `--lora-scaled ... 0.75`. No hay datos publicados sobre el preentrenamiento original (tokens, composición del dataset) ni sobre RLHF/DPO. El modelo soporta modo thinking, que debe desactivarse para el uso como upsampler.

## Capacidades

- Generación de captions detalladas a partir de peticiones cortas, usando el system prompt `t2i` de BFL (incluido sin cambios en `system_prompts.json`), pensada como prompt para FLUX 3 Image Klein.
- Comprensión de imágenes mediante el proyector mmproj F16 incluido, para tareas de edición con imágenes de referencia.
- Uso como modelo de chat general: 0% de negativas en 81 peticiones en inglés y 0% en los 250 prompts seguros de XSTest.
- Tool calling: 19/20 llamadas válidas, igual que el modelo original.
- Recuperación de información en textos largos (needle in a haystack): 3/3 en tres profundidades.
- Modo thinking disponible, sin negativas, respuestas sin cerrar ni bucles según las mediciones del autor.
- Funcionamiento totalmente local y offline mediante llama.cpp.

## Casos de uso

- Upsampling de prompts para generación de imágenes local: se ejecuta llama-server con el system prompt `t2i`, se envía la petición corta como mensaje de usuario con thinking desactivado, decodificación greedy y presence penalty de 1,5; la caption resultante se pasa a FLUX 3 Image Klein como prompt.
- Edición de imágenes con referencia visual: usando el mmproj F16 incluido, el modelo puede leer una imagen de entrada y generar la caption de edición correspondiente.
- Pipelines de generación de imágenes sin censura de texto: al eliminar las negativas del upsampler, ningún prompt sensible se suaviza en la caption (el original suavizaba 2 de 35 en su evaluación), garantizando que el texto que llega al modelo de imagen es fiel a la petición.
- Chat local sin restricciones: al ser un Qwen3.5 de 9B abliterated con MMLU de 73,95%, puede usarse como asistente conversacional general en aplicaciones locales como Atomic Chat.
- Integración en herramientas de agentes locales: mantiene el tool calling del modelo original (19/20 válidas), por lo que puede emplearse en flujos multi-paso con llamadas a funciones.
- Experimentación y evaluación de abliteration: el autor publica las mediciones y métricas KLD/top-1 por cuantización, útil como referencia para comparar técnicas de eliminación de refusals y sus efectos sobre la calidad de generación.

## Benchmarks y rendimiento

Mediciones del autor (BF16, prompts no usados para seleccionar nada):

| Métrica | Original | Uncensored |
|---|---:|---:|
| Peticiones dañinas en inglés (81), rechazadas | 63% | 0% |
| XSTest prompts seguros (250), rechazados | 3,2% | 0% |
| MMLU (2000 preguntas) | 74,15% | 73,95% |
| Tool calls (20) | 19/20 válidas | 19/20 válidas |
| Needle in a long text (3 profundidades) | 3/3 | 3/3 |

Calidad por cuantización (KLD y top-1 contra el BF16 original sobre un set de texto neutro de 30 idiomas, 87 fragmentos de 4096 tokens; incluye el efecto de la edición):

| Archivo | Tamaño | KLD | Top-1 | Rechazados EN / XSTest |
|---|---:|---:|---:|---|
| BF16 | 17,92 GB | 0,0015 | 98,1% | 0 / 0 |
| Q8_0 | 9,53 GB | 0,0027 | 97,5% | 0 / 0 |
| AD-Q5_K_M | 6,57 GB | 0,0079 | 95,7% | 0 / 0 |
| AD-IQ4_XS | 5,51 GB | 0,0283 | 92,0% | 0 / 0 |
| AD-IQ3_S | 4,68 GB | 0,0491 | 89,2% | 0 / 0 |

Comparativa con otros upsamplers uncensored de Klein a Q8_0:

| Upsampler | KLD | Mismo top-1 | Rechazados EN / XSTest | MMLU |
|---|---:|---:|---|---:|
| prithivMLmods abliterated | 0,0025 | 97,6% | 0 / 1 | 73,7% |
| Este modelo | 0,0027 | 97,5% | 0 / 0 | 74,1% |
| webmp3 Sakura | 0,0049 | 96,6% | 18 / 1 | 73,7% |

Nota del autor: el recuento de negativas se basa en el inicio de la respuesta, por lo que es indicativo y no un juicio automático.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo en disco más overhead de contexto; ~5,5 GB para AD-IQ4_XS, ~9,5 GB para Q8_0 y ~18 GB para BF16.
- GPU recomendadas: cualquier GPU consumer con suficiente VRAM; la AD-IQ4_XS cabe con holgura en una RTX 3060 de 12 GB o superior, y la Q8_0 en una RTX 4070 Ti S/4080 o superior. No se publican recomendaciones específicas de GPUs de datacenter.
- Consumer GPUs: sí, la cuantización recomendada (AD-IQ4_XS, 5,51 GB) cabe en la mayoría de GPUs de 8 GB o más; incluso la Q8_0 cabe en GPUs de 12 GB.
- Despliegue: llama.cpp (llama-server con `--jinja -ngl 99 -c 8192`), lo que lo hace compatible indirectamente con frontales que usan llama.cpp como backend (LM Studio, Ollama vía GGUF, etc.). No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Rechazados EN | MMLU | Licencia |
|---|---|---|---|---|---|
| FLUX-3-Image-Klein-pup-Uncensored (este) | ~9B | GGUF (BF16 a IQ3_S) + LoRA | 0% | 74,1% | Apache 2.0 |
| prithivMLmods abliterated (Klein pup) | ~9B | GGUF | 0% (0/1 XSTest) | 73,7% | no disponible |
| webmp3 Sakura (Klein pup) | ~9B | GGUF | 18/81 en inglés | 73,7% | no disponible |
| Original BFL flux-3-image-klein-pup | ~9B | safetensors | 63% | 74,15% | no disponible |

## Limitaciones y advertencias

- La abliteration elimina todas las negativas medidas (0% en 81 peticiones dañinas), lo que implica que el modelo obedecerá peticiones que el original rechazaría; su uso conlleva responsabilidad legal y ética para el usuario.
- El propio autor advierte que, como upsampler de Klein, el efecto de "descensurar" las imágenes es nulo en sus pruebas: el pipeline abierto ya genera las categorías sensibles probadas, y el modelo de imagen no dibujó las dos peticiones suavizadas por el original en ninguna configuración.
- El recuento de refusals se hace por el inicio de la respuesta, método indicativo y no un juez automático; pueden existir negativas encubiertas no detectadas.
- La cuantización AD-IQ4_XS degrada la fidelidad (top-1 del 92,0%, KLD 0,0283); para máxima calidad usar Q8_0 o BF16.
- La edición se validó principalmente en inglés; el comportamiento en otros idiomas no está documentado.
- No hay datos publicados sobre sesgos del modelo, riesgo de alucinación específico, ni rendimiento en idiomas distinto del inglés.
- El pipeline completo requiere combinar este upsampler con el modelo de imagen FLUX 3 Klein y, opcionalmente, el text encoder uncensored; los pesos originales de BFL pueden tener licencias distintas a la Apache 2.0 de esta derivación.

## Enlaces

- Modelo: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-pup-Uncensored-GGUF
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Text encoder uncensored de Klein: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-TE-Uncensored-GGUF
- Upsampler stock (sin editar) en GGUF: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-pup-GGUF
- Modelo de imagen Klein en GGUF: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-GGUF
- Métricas y mediciones: https://huggingface.co/datasets/AtomicChat/FLUX-3-Image-Klein-pup-Uncensored-GGUF-metrics
- Atomic Chat (aplicación del equipo): https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de la comunidad: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
