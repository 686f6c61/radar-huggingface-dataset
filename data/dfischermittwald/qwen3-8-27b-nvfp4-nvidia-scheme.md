# dfischermittwald/Qwen3.8-27B-NVFP4-nvidia-scheme

## Resumen

Este modelo es una cuantización NVFP4 (4-bit floating point) del modelo multimodal Qwen3.8-27B de Alibaba, producida por el usuario dfischermittwald sobre una NVIDIA RTX PRO 6000 Blackwell. Su única diferencia respecto a otras cuantizaciones NVFP4 del mismo modelo es que la capa `lm_head` se deja sin cuantizar, lo que permite utilizarlo con el drafter DFlash2 de vLLM, un mecanismo de decodificación especulativa que exige una cabeza de lenguaje sin cuantizar para su selección de candidatos.

El autor lo publica explícitamente como un experimento de control, no como un checkpoint recomendado. La motivación es demostrar que DFlash2 supera al MTP (Multi-Token Prediction) nativo del modelo en velocidad de decodificación, y que la cuantización de `lm_head` en el checkpoint de unsloth impedía medir ese rendimiento. Las mediciones confirman que DFlash2 ofrece una mejora sustancial, pero el propio autor recomienda usar su otro checkpoint, `Qwen3.8-27B-NVFP4-DFlash2`, que es más pequeño (24 GB) y más rápido (109.7 tok/s frente a 91.9 tok/s en contexto 2048).

El modelo tiene 19.869.896.336 parámetros según los safetensors, aunque el nombre sugiere 27B (posiblemente el total del modelo original). Está licenciado bajo Apache 2.0 y requiere una build de vLLM con dos pull requests sin fusionar para activar la ruta DFlash2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.8-27B |
| Parametros totales | 19.869.896.336 (segun safetensors; el nombre sugiere 27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion) |
| Tipos de cuantizacion | NVFP4 (4-bit floating point), con `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, comprimidos con compressed-tensors / llm-compressor |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal de la familia Qwen3.8 que procesa tanto imágenes como texto (pipeline `image-text-to-text`). No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, dimensiones, sistema de atención) en la información proporcionada.

Este checkpoint concreto es una cuantización NVFP4 del modelo base, producida en una única GPU RTX PRO 6000 Blackwell (SM 12.0). El esquema de cuantización copia la receta oficial de NVIDIA para NVFP4, con la salvedad de que `lm_head` se deja en precisión completa (sin cuantizar). Esta decisión responde a un requisito del drafter DFlash2 de vLLM, que necesita una cabeza de lenguaje sin cuantizar para realizar la selección TopK de candidatos. No se mencionan datos de entrenamiento, dataset ni procesos de alineación (RLHF/DPO), ya que se trata de una cuantización post-entrenamiento, no de un modelo entrenado desde cero.

## Capacidades

- Generación de texto y razonamiento multimodal: al estar basado en Qwen3.8-27B, hereda las capacidades del modelo original para tareas de lenguaje y visión (comprensión de imágenes, descripción, chat multimodal).
- Conversación multi-turno: el tag `conversational` indica soporte para diálogos.
- Decodificación especulativa con DFlash2: cuando se usa con la build adecuada de vLLM, alcanza velocidades de decodificación muy superiores a la generación autoregresiva (hasta 2.69 tokens de aceptación media en contexto 2048).
- Compatibilidad con MTP (Multi-Token Prediction): también puede usar el drafter nativo del modelo base, aunque con menor rendimiento que DFlash2.
- Cuantización NVFP4: reduce el tamaño del modelo a 29 GB, permitiendo su ejecución en GPUs con 32 GB o más de VRAM.
- No se menciona soporte explícito de tool calling, function calling ni agentes en la información disponible.

## Casos de uso

- Evaluación de decodificación especulativa en producción: este checkpoint sirve para medir el impacto real de DFlash2 frente a MTP y a la generación autoregresiva en un modelo multimodal de tamaño medio. Es útil para equipos que investigan técnicas de aceleración de inferencia.
- Despliegue de chat multimodal en entornos con VRAM limitada: con 29 GB, puede ejecutarse en una RTX 4090 (24 GB no, pero sí en RTX 6000 Ada o A6000 de 48 GB) o en GPUs Blackwell de 32 GB, ofreciendo respuestas de texto e imagen.
- Pruebas de integración de vLLM con parches experimentales: al requerir dos PR sin fusionar, es un banco de pruebas para desarrolladores que contribuyen al desarrollo de DFlash2 en vLLM.
- Comparación de esquemas de cuantización: permite contrastar el rendimiento de NVFP4 con `lm_head` sin cuantizar frente a otras variantes (como la de unsloth) en términos de velocidad y fidelidad.
- Investigación sobre el impacto de la cuantización de la cabeza de lenguaje: este checkpoint aísla el efecto de cuantizar `lm_head` en la compatibilidad con drafteres especulativos, lo que puede orientar futuras recetas de cuantización.
- Generación de texto de alta velocidad en tareas de streaming: gracias a DFlash2, puede sostener tasas de decodificación de ~90 tok/s en contexto 2048, adecuado para aplicaciones de chat en tiempo real.

## Benchmarks y rendimiento

El autor proporciona mediciones propias de velocidad de decodificación (tok/s) en una RTX PRO 6000 Blackwell, con `min_tokens 400`, temperatura 1.0, top_p 0.95, top_k 20, y mejor de dos ejecuciones. No se publican benchmarks de calidad (MMLU, HumanEval, etc.) en la información disponible.

| Configuracion | Tamano | ctx 2048 | ctx 8192 | ctx 32768 | Aceptacion media |
|---|---:|---:|---:|---:|---:|
| Este checkpoint, sin drafter | 29 GB | 46.1 | 46.0 | 44.8 | — |
| Este checkpoint, MTP n=3 | 29 GB | 65.7 | 70.2 | — | 2.06 |
| Este checkpoint, DFlash2 n=7 | 29 GB | **91.9** | **88.3** | **87.8** | 2.69 |
| `unsloth/Qwen3.8-27B-NVFP4`, MTP n=3 | 22 GB | 83.4 | 82.9 | 85.3 | 2.13 |
| `Qwen3.8-27B-NVFP4-DFlash2` (recomendado), DFlash2 n=7 | 24 GB | **109.7** | **104.8** | — | — |

Nota: las cifras de este checkpoint se tomaron contra el commit `ed34bf91` del PR de DFlash2; el PR ha evolucionado desde entonces, por lo que los números pueden variar en una build actual.

## Requisitos de hardware

- VRAM estimada: 29 GB para el checkpoint completo (pesos NVFP4 + `lm_head` sin cuantizar). Se necesita una GPU con al menos 32 GB de VRAM para inferencia con contexto moderado.
- GPU recomendada: NVIDIA RTX PRO 6000 Blackwell (SM 12.0), que fue la utilizada para las mediciones. También debería funcionar en otras GPUs Blackwell (B200, B100) y en GPUs Ampere o Ada con suficiente VRAM, aunque NVFP4 está optimizado para Blackwell.
- No cabe en GPUs de consumo de 24 GB (RTX 4090) debido al tamaño de 29 GB; se necesitaría cuantización adicional o descartar `lm_head` sin cuantizar.
- Opciones de despliegue: vLLM con dos parches sin fusionar (PR #52816 para DFlash2 y PR #52883 para el guard de LM head). Sin esos parches, funciona como un checkpoint de precisión mixta normal en vLLM, pero sin la ruta DFlash2. También puede usarse con transformers estándar.
- Latencia y throughput: con DFlash2 n=7, se midieron 91.9 tok/s de decodificación a contexto 2048, 88.3 a 8192 y 87.8 a 32768. Sin drafter, baja a ~46 tok/s. No se reporta TTFT.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Velocidad (ctx 2048) | Licencia | Notas |
|---|---|---|---|---|---|
| `dfischermittwald/Qwen3.8-27B-NVFP4-nvidia-scheme` (este) | 29 GB | no disponible | 91.9 tok/s (DFlash2) | Apache 2.0 | `lm_head` sin cuantizar, requiere parches vLLM |
| `unsloth/Qwen3.8-27B-NVFP4` | 22 GB | no disponible | 83.4 tok/s (MTP n=3) | Apache 2.0 | `lm_head` cuantizado, no compatible con DFlash2 |
| `dfischermittwald/Qwen3.8-27B-NVFP4-DFlash2` | 24 GB | no disponible | 109.7 tok/s (DFlash2) | Apache 2.0 | Checkpoint recomendado por el autor, mismo esquema pero más optimizado |

Los tres son cuantizaciones NVFP4 del mismo modelo base Qwen3.8-27B. La diferencia clave está en el tratamiento de `lm_head` y en el tamaño final, lo que afecta a la compatibilidad con DFlash2 y al rendimiento medido.

## Limitaciones y advertencias

- Es un experimento de control, no un checkpoint recomendado para producción. El propio autor indica que se debe usar `Qwen3.8-27B-NVFP4-DFlash2` en su lugar.
- Requiere una build de vLLM con dos pull requests sin fusionar (PR #52816 y #52883). Ninguna versión estable de vLLM soporta la ruta DFlash2 con este checkpoint.
- La razón de existir de este checkpoint podría desaparecer si los revisores de vLLM relajan el guard que impide usar `lm_head` cuantizado con DFlash2. En ese caso, el checkpoint de unsloth (22 GB) sería compatible y este perdería su ventaja.
- No se puede usar `--async-scheduling` con `method: dflash`; vLLM lanza un error. Esto supone una desventaja estructural frente a MTP en entornos de producción.
- Las mediciones se realizaron en un único nodo con TP=1. No hay datos de escalado multi-GPU ni de estabilidad en cargas prolongadas.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para esta cuantización, por lo que no se puede verificar el impacto de NVFP4 en la fidelidad del modelo.
- El tamaño de 29 GB supera la VRAM de GPUs de consumo comunes (24 GB), lo que limita su uso a hardware profesional o de centro de datos.
- No se dispone de información sobre idiomas soportados ni sobre posibles sesgos o alucinaciones específicas de esta cuantización.

## Enlaces

- [Checkpoint en HuggingFace](https://huggingface.co/dfischermittwald/Qwen3.8-27B-NVFP4-nvidia-scheme)
- [Checkpoint recomendado: Qwen3.8-27B-NVFP4-DFlash2](https://huggingface.co/dfischermittwald/Qwen3.8-27B-NVFP4-DFlash2)
- [Checkpoint de unsloth: Qwen3.8-27B-NVFP4](https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [PR de vLLM #52816 (DFlash2)](https://github.com/vllm-project/vllm/pull/52816)
- [PR de vLLM #52883 (guard de LM head)](https://github.com/vllm-project/vllm/pull/52883)
