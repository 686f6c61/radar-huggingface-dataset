# litert-community/InternVL3_5-1B

## Resumen

InternVL3_5-1B es un modelo de visión-lenguaje (VLM) compacto desarrollado originalmente por OpenGVLab y convertido al runtime LiteRT-LM por la comunidad litert-community para inferencia totalmente en dispositivo (on-device). Combina un codificador visual InternViT con un decodificador de lenguaje Qwen3-0.6B, unidos mediante pixel-shuffle y un proyector MLP. El resultado es un modelo de aproximadamente 1B de parámetros que acepta una imagen de 448×448 píxeles (convertida en 256 tokens visuales) junto con texto, y genera respuestas fundamentadas en la imagen sin necesidad de conexión a la nube.

La relevancia de esta conversión reside en su formato de despliegue: un único archivo `model.litertlm` de unos 0.82 GB con pesos cuantizados (int8 en la torre visual, int4 en el decodificador) y cómputo entero, pensado para ejecutarse en GPUs móviles y CPUs de escritorio. En una Galaxy S26 alcanza 77.0 tokens/s en decodificación y 1.338 tokens/s en prefill de 1.024 tokens, según la model card. En un Apple M4 Max con backend Metal logra 176,2 tokens/s de decodificación.

El modelo hereda la licencia Apache-2.0 del modelo base y está orientado a aplicaciones de borde donde la privacidad, la latencia y el coste de infraestructura son críticos: asistentes visuales, accesibilidad, inspección de imágenes y automatización local. Su ventana de contexto está limitada a 2.048 tokens de caché KV, lo que restringe las conversaciones multi-turno largas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM: codificador InternViT + pixel-shuffle + proyector MLP + decodificador Qwen3-0.6B |
| Parámetros totales | ~1B (decodificador Qwen3-0.6B + torre visual InternViT) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (caché KV) |
| Tipos de cuantización | Visión: int8; decodificador: int4 simétrico (blockwise-32 + OCTAV optimal-clipping); embedding de entrada: int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM, ~0.82 GB) |
| Cómputo | entero (integer) |
| Entrada de imagen | redimensionada a 448×448, normalización ImageNet integrada en el codificador |
| Tokens por imagen | 256 |
| Modelo base | OpenGVLab/InternVL3_5-1B |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón clásico de InternVL: un codificador visual InternViT que procesa la imagen, seguido de una operación de pixel-shuffle para reducir la resolución espacial de los tokens visuales y un proyector MLP que adapta la dimensionalidad al espacio del decodificador de lenguaje. El decodificador es Qwen3-0.6B, un transformer denso que sustituye al Qwen2.5-1.5B empleado en la variante InternVL3-2B, lo que reduce el cómputo manteniendo una base lingüística moderna.

La conversión a LiteRT-LM aplica cuantización agresiva pero controlada: int8 en la torre visual (preservando la fidelidad de la fundamentación visual, con correlación end-to-end ≈ 1.0 frente a la referencia en float y diferencia absoluta máxima ~1e-4) e int4 con blockwise-32 y optimal-clipping OCTAV en el decodificador. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card indica que el grafo de prefill/decode fue reescrito para GPU mediante un script separado, sin modificar los pesos.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de escenas, respuesta a preguntas visuales (VQA) y fundamentación visual.
- Procesamiento de una o varias imágenes en la misma conversación (el CLI acepta `--attachment` múltiples veces).
- Razonamiento visual básico: identificación de objetos, relaciones espaciales y atributos en la imagen.
- Conversación interactiva multi-turno dentro del límite de 2.048 tokens de contexto.
- Ejecución totalmente local, sin llamadas a API externa.
- API local compatible con OpenAI mediante `litert-lm serve`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo thinking explícito.

## Casos de uso

- Asistencia visual para accesibilidad: describir fotografías o escenas a personas con discapacidad visual en el propio dispositivo, con latencia baja y sin enviar imágenes a servidores externos.
- Automatización de inventario o inspección: capturar una imagen de un producto o estantería y generar una descripción estructurada localmente en un dispositivo móvil o embebido.
- Moderación de contenido visual en el borde: clasificar o describir imágenes antes de subirlas, reduciendo el tráfico y preservando la privacidad del usuario.
- Asistentes de campo sin conectividad: técnicos que trabajan en zonas sin red pueden fotografiar equipos y obtener descripciones o pistas de diagnóstico en el dispositivo.
- Prototipado rápido de aplicaciones VLM: el archivo único y el CLI `litert-lm run` permiten validar un flujo imagen-pregunta en macOS, Linux o Windows en minutos.
- Educación y lectura de imágenes: responder preguntas sobre diagramas, mapas o fotografías en aplicaciones educativas offline.
- Integración en aplicaciones móviles Android mediante LiteRT-LM, aprovechando el backend GPU de la Galaxy S26 con 77 tokens/s de decodificación.

## Benchmarks y rendimiento

Datos publicados en la model card (medidos sobre una versión anterior del archivo para el benchmark de escritorio; la sección Galaxy S26 corresponde al archivo actual):

| Dispositivo | Backend | Prefill | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 338 tok/s (256 tokens) | 43,7 tok/s | 0,84 s |
| Apple M4 Max (macOS) | GPU (Metal) | 3.878 tok/s (256 tokens) | 176,2 tok/s | 0,08 s |
| Galaxy S26 | GPU | 1.338 tok/s (1.024 tokens) | 77,0 tok/s | no disponible |

Notas: el benchmark de escritorio usa `litert-lm benchmark` (v0.15.0) con `-p 256 -d 256 --runs 3`, max-num-tokens 4096 y warm-up descartado; cubre solo la ruta de texto, no el codificador visual. Las cifras de Galaxy S26 corresponden a LiteRT-LM v0.19.0 (2026-11-14) con prefill de 1.024 tokens y generación de 256 tokens. La model card menciona como expectativa (no medición de esta build) ~20 tok/s en CPU y ~45 tok/s en GPU de iPhone 17 Pro para VQA de una sola imagen.

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) para esta conversión en la información disponible. La model card cita que la receta int4 blockwise-32 + OCTAV alcanza 90,7% en GSM8K en la build Ministral-3-3B-Reasoning, pero no aporta una cifra equivalente para este modelo.

## Requisitos de hardware

- Tamaño del archivo: ~0.82 GB (`model.litertlm`), lo que permite almacenarlo en cualquier dispositivo móvil moderno.
- VRAM/RAM estimada: no disponible de forma explícita; por el tamaño del archivo y el cómputo entero, el modelo está diseñado para ejecutarse en memoria unificada de móviles y en CPUs de escritorio.
- GPU recomendadas: GPU móvil de Galaxy S26 (medido); Apple M4 Max con Metal (medido); se espera funcionamiento en iPhone 17 Pro (no medido en esta build).
- Cabe en GPU de consumo: sí, por tamaño; no se han publicado mediciones en RTX 4090, A100 o H100.
- Opciones de despliegue: runtime LiteRT-LM (`litert-lm run`, `litert-lm serve` con API compatible con OpenAI, `litert-lm benchmark`); el mismo archivo funciona en macOS, Linux y Windows.
- Limitación conocida: con `--vision-backend gpu` el delegado GPU no soporta dos operaciones del codificador visual (BROADCAST_TO y GATHER_ND), por lo que en macOS no responde a imágenes con esa configuración; debe dejarse `--vision-backend` sin definir.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| InternVL3_5-1B (LiteRT-LM) | ~1B | 2.048 | `.litertlm`, on-device | Apache-2.0 | Conversión comunitaria; 77 tok/s decode en Galaxy S26 |
| InternVL3-2B (build LiteRT-LM) | ~2B | no disponible | `.litertlm`, on-device | Apache-2.0 (base) | Usa Qwen2.5-1.5B como decodificador; ~20 tok/s CPU y ~45 tok/s GPU en iPhone 17 Pro (expectativa) |
| OpenGVLab/InternVL3_5-1B (original) | ~1B | no disponible | safetensors (formato original) | Apache-2.0 | Modelo base sin cuantizar; requiere runtime de PyTorch/Transformers |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Contexto muy limitado: 2.048 tokens de caché KV restringen conversaciones multi-turno y prompts con muchas imágenes.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe más allá del comportamiento heredado del modelo base.
- Riesgo de alucinación visual: como todo VLM de ~1B, puede describir objetos o relaciones inexistentes, especialmente con imágenes ambiguas o de baja resolución (entrada fija de 448×448).
- La cuantización int4 del decodificador puede degradar ligeramente el razonamiento y la coherencia frente al modelo base en float.
- En macOS, `--vision-backend gpu` no funciona con este archivo por operaciones no soportadas por el delegado GPU; hay que usar la configuración por defecto.
- Problemas conocidos del CLI de LiteRT-LM (0.14.0–0.19.2): descargas incompletas en caché que no se revalidan y ejecución de versiones antiguas del archivo si no se borra manualmente la caché tras la actualización del 2026-11-14.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el aviso de licencia y la atribución correspondiente.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran invocación de funciones.
- Para producción en móvil, medir el rendimiento real en el dispositivo objetivo: las cifras de iPhone son expectativas, no mediciones de esta build.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/InternVL3_5-1B
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-1B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Build de referencia Ministral-3-3B-Reasoning (receta int4): https://huggingface.co/litert-community/Ministral-3-3B-Reasoning-2512
