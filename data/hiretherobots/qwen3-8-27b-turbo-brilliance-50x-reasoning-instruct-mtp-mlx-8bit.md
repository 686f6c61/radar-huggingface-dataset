# HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-8bit

## Resumen

Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-8bit es una conversión no oficial al formato MLX de un fine-tune de DavidAU sobre la familia Qwen3.8, empaquetada por el usuario HireTheRobots para usuarios de Apple Silicon. El modelo original parte de un GGUF (NEO-MAX-MTP) y este repositorio lo recompila en pesos MLX de 8 bits con cuantización afín de grupo 64, manteniendo el cabezal MTP (multi-token prediction) en bf16 como drafter independiente para decodificación especulativa con mlx-vlm. No se han modificado los pesos ni la plantilla de chat: solo cambia el formato de fichero.

El modelo tiene 27.356.728.560 parámetros (unos 27,36 mil millones) y ocupa 30,4 GB en el repositorio. Es multimodal (pipeline image-text-to-text): incorpora la torre de visión de Qwen3.8-27B sin cuantizar, bit a bit idéntica al `mmproj-BF16.gguf` del autor original. La plantilla de chat de DavidAU define múltiples modos de razonamiento (27 modos de razonamiento, 27 de instruct y 9 de xhigh, según la model card del autor) que se activan mediante etiquetas como `{REASON:coder}` o `{REASON:hyper}`.

Su relevancia es doble: por un lado, permite ejecutar un modelo de 27B con visión y razonamiento extendido en Macs de 48 GB de memoria unificada; por otro, el drafter MTP incluido acelera la generación de forma notable (de 8,8 a 18,1 tok/s en un M5 Pro de 48 GB según los datos del autor del port). La licencia es Apache 2.0, aunque conviene verificar la cadena de licencias del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5/Qwen3.8) con cabezal MTP para decodificacion especulativa; pesos MLX afines de 8 bits |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afines, group size 64 (repo principal); la familia incluye variantes de 3, 4, 5 y 6 bits |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), drafter MTP en bf16, torre de vision sin cuantizar |
| Libreria | mlx, mlx-vlm |
| Tamano del repo | 30,4 GB |
| Pipeline | image-text-to-text |
| Hardware objetivo | Apple Silicon (memoria unificada, 48 GB recomendados para este quant) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer multimodal de la familia Qwen3.5/Qwen3.8 con torre de visión integrada y un cabezal MTP (multi-token prediction) que actúa como modelo borrador para decodificación especulativa. El repositorio no reentrena nada: convierte los pesos GGUF de DavidAU a MLX con cuantización afín de 8 bits y grupo 64, aplicando también 8 bits al `lm_head` (según la model card del port, porque la tarjeta de DavidAU indica que el tensor de salida en precisión completa es lo que mejora los quants MAX). La torre de visión se mantiene sin cuantizar y el drafter MTP se conserva en bf16, reutilizando los embeddings y la capa de salida del modelo principal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. El fine-tune de DavidAU añade modos de razonamiento e instruct mediante plantilla de chat (etiquetas `{REASON:coder}`, `{REASON:hyper}`, `{REASON:help}`, `{REASON:icoder}` y kwargs como `enable_thinking=True` o `reasoning_effort="hyper"`). Sin modo explícito, el comportamiento es el de Qwen3.8 estándar (xhigh por defecto en thinking, medium en instruct). La innovación técnica destacable es el uso del drafter MTP propio del modelo para decodificación especulativa con mlx-vlm, con block size 3.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento extendido con múltiples modos (27 modos de razonamiento, 27 de instruct y 9 de xhigh según la model card del autor original).
- Generación de código, con modo específico `{REASON:coder}` e `{REASON:icoder}` para instruct sin thinking.
- Capacidades matemáticas y de razonamiento paso a paso (modos hyper y xhigh).
- Comprensión de imágenes (pipeline image-text-to-text, torre de visión de Qwen3.8-27B).
- Tool calling / function calling: la plantilla reproduce el comportamiento de Qwen3.8 estándar, incluido el tool calling, cuando no se fija modo.
- Decodificación especulativa mediante drafter MTP integrado (aceleración de generación).
- Sistema de ayuda interno accesible con `{REASON:help}`.
- Capacidades multilingües limitadas al inglés según la metadata del repo.

## Casos de uso

- Asistente de razonamiento local en Mac: un desarrollador con un Mac de 48 GB puede ejecutar el modelo con mlx-vlm y el drafter MTP para obtener respuestas razonadas sin conexión, usando los modos hyper o xhigh para problemas complejos.
- Generación de código en el editor: el modo `{REASON:coder}` permite invocar el modelo desde scripts Python con `mlx_vlm.stream_generate` para autocompletar, refactorizar o explicar código, con streaming token a token.
- Análisis de imágenes con explicación: al ser image-text-to-text, se puede usar para describir capturas, diagramas o interfaces y razonar sobre ellas en local, sin enviar datos a la nube.
- Evaluación de modos de razonamiento: investigadores pueden comparar los 27 modos de razonamiento y los 9 xhigh sobre el mismo prompt para estudiar cómo varía la calidad y la longitud de la cadena de pensamiento.
- Prototipado de agentes con tool calling: la plantilla conserva el soporte de function calling de Qwen3.8, lo que permite construir agentes multi-paso que invoquen herramientas en un entorno local de Apple Silicon.
- Pruebas de decodificación especulativa: el repositorio incluye el drafter MTP y el script `conversion/gguf2mlx.py`, útil para medir el impacto del block size y comparar velocidades entre quants de 3 a 8 bits.
- Despliegue en estaciones de trabajo Apple para tareas de documentación técnica: resúmenes, reescritura y respuesta a preguntas sobre documentación en inglés, con contexto moderado y sin dependencia de servicios externos.

## Benchmarks y rendimiento

Los datos publicados por el autor del port se centran en calidad de cuantización y velocidad, no en benchmarks académicos estándar. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

| Metrica | 3-bit | 4-bit | 5-bit | 6-bit | 8-bit (este repo) |
|---|---|---|---|---|---|
| Tamano | 14,4 GB | 17,6 GB | 20,8 GB | 24,0 GB | 30,4 GB |
| Perplejidad (mezcla EN/Python ~4,5k tokens) | 3,08 | 2,37 | 2,19 | 2,15 | 2,15 |
| KL vs 8-bit | 0,451 | 0,170 | 0,045 | 0,014 | referencia |
| Mismo token top que 8-bit | 79,6% | 89,5% | 93,9% | 96,8% | referencia |
| tok/s sin MTP | 21,2 | 17,4 | 14,6 | 11,9 | 8,8 |
| tok/s con MTP | 17,7 | 29,8 | 20,7 | 10,4 | 18,1 |

Medido en Apple M5 Pro de 48 GB, mlx-vlm 0.7.10, 512 tokens greedy, block size MTP de 3. La velocidad depende del chip; las proporciones entre filas deberían mantenerse.

## Requisitos de hardware

- VRAM/memoria unificada: 30,4 GB de pesos para el quant de 8 bits; se recomienda un Mac con 48 GB de memoria unificada para contextos normales.
- Variantes menores: 3 bits (14,4 GB, Mac de 24 GB con contextos cortos), 4 bits (17,6 GB, Mac de 32 GB), 5 bits (20,8 GB, Mac de 32 GB; 36 GB o más para contextos largos), 6 bits (24,0 GB, Mac de 36 GB).
- GPU: el repositorio está pensado para Apple Silicon (M-series). No se proporcionan requisitos para GPU NVIDIA ni CUDA en la información disponible.
- Cabe en GPU de consumo: sí, en Macs de gama alta con memoria unificada; no se documenta soporte para RTX 4090 ni similares con este formato MLX.
- Despliegue: mlx-vlm (CLI `mlx_vlm.generate` y API Python `mlx_vlm.stream_generate`), con soporte opcional del drafter MTP para decodificación especulativa. No se documenta vLLM, llama.cpp, Ollama ni TGI para este repo.
- Latencia y throughput: 8,8 tok/s sin MTP y 18,1 tok/s con MTP en un M5 Pro de 48 GB, 512 tokens greedy, block size 3. El resto de quants se comporta de forma no monótona con MTP (el 4-bit alcanza 29,8 tok/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repo (8-bit MLX) | ~27,36 B | no disponible | MLX safetensors | Apache 2.0 | Multimodal, MTP, orientado a Apple Silicon |
| DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF | ~27 B (no confirmado) | no disponible | GGUF | Apache 2.0 (segun metadata del repo) | Modelo base; misma plantilla y modos; pensado para llama.cpp y similares |
| Variantes MLX 3/4/5/6 bits del mismo port | ~27 B | no disponible | MLX safetensors | Apache 2.0 | Mismo modelo con distinta cuantizacion; menor tamaño y calidad |
| Qwen3.8-27B estándar | ~27 B | no disponible | no disponible | no disponible | Referencia de comportamiento por defecto del template; sin los modos de DavidAU |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un port no oficial: el autor recomienda usar una release oficial de DavidAU en MLX o safetensors si existe.
- Solo inglés declarado en la metadata; no se garantiza calidad en castellano ni en otros idiomas.
- Es un fine-tune con plantilla de chat propia: el comportamiento depende de las etiquetas `{REASON:*}` y de los kwargs; sin modo, se comporta como Qwen3.8 estándar.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado en modos de razonamiento muy largos (hyper, xhigh) donde la cadena de pensamiento puede desviarse.
- No se documentan sesgos específicos del fine-tune en la información disponible.
- La licencia del repo es Apache 2.0, pero la cadena de licencias del modelo base y del fine-tune de DavidAU debe verificarse antes de uso comercial.
- La longitud de contexto no está especificada; los requisitos de memoria para contextos largos solo se mencionan de forma cualitativa (36 GB o más para el quant de 5 bits).
- El rendimiento con MTP no es monótono entre quants: el 6-bit es más lento con drafter que sin él en las mediciones del autor.
- El formato MLX limita el despliegue a Apple Silicon; no hay soporte documentado para CUDA, vLLM ni llama.cpp en este repositorio.
- El modelo se publicó en 2026-10-27 con 110 descargas y 0 likes: es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-8bit
- Modelo base (GGUF de DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- Discusión #4 del modelo base (petición de versión MLX): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF/discussions/4
- Discusión #22 del modelo base (petición de versión MLX): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF/discussions/22
- Variante 3 bits: https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-3bit
- Variante 4 bits: https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-4bit
- Variante 5 bits: https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-5bit
- Variante 6 bits: https://huggingface.co/HireTheRobots/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-MTP-MLX-6bit
- Perfil de DavidAU en HuggingFace: https://huggingface.co/DavidAU
- Apoyo al autor original: https://www.buymeacoffee.com/davidbelton
