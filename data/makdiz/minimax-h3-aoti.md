# Makdiz/minimax-h3-aoti

## Resumen

MiniMax-H3 AoTI packages es un repositorio de artefactos de compilación para el modelo MiniMax-H3, publicado por el usuario Makdiz en Hugging Face. No contiene pesos de modelo: aloja paquetes generados con AOT-Inductor (AoTI) de PyTorch para un único `MiniMaxH3TransformerBlock`, que se reutiliza en los 50 bloques del transformer. Cada paquete se indexa por `<width>/torch<X.Y>/sm<cc>/<shape>` y se enlaza en tiempo de ejecución con el `state_dict()` vivo de cada bloque mediante `spaces.aoti_patch`.

El propósito es acelerar la inferencia de MiniMax-H3, un modelo multimodal de generación de vídeo y audio (a juzgar por las referencias a canvas, frames, audio_rows y video_rows en la model card), mediante la compilación del bloque transformer con AOT-Inductor. El paquete clave es `bf16/torch2.11/sm120/dynamic`, con dimensión de secuencia dinámica, lo que permite servir cualquier resolución de canvas, duración y longitud de prompt con un solo artefacto compilado.

La relevancia de este repositorio es fundamentalmente técnica: documenta con mediciones reales el ahorro de AoTI sobre bfloat16 sin cuantizar en una RTX PRO 6000 Blackwell, y registra un fallo sutil de `torch.export` en modo no estricto con clones superficiales que provoca segfaults silenciosos. Es material de referencia para ingenieros que despliegan MiniMax-H3 o que trabajan con AOT-Inductor sobre bloques transformer con pesos enlazados dinámicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (MiniMax-H3), empaquetado AOT-Inductor de un `MiniMaxH3TransformerBlock` reutilizado en 50 bloques |
| Parametros totales | no disponible (el repositorio no contiene pesos) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible; la dimension de secuencia es dinamica y depende del prompt (ejemplo: S = 37726 para 16 tokens, S = 37728 para 18 tokens) |
| Tipos de cuantizacion | bfloat16 sin cuantizar (unico formato documentado) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | paquetes AOT-Inductor de PyTorch (no contienen pesos; se enlazan al `state_dict()` en runtime); incluye `_inputs/` con `prompt_embeds` y `text_token_tags` cacheados, y `_reports/` con informes JSON de build |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento de MiniMax-H3, sino el proceso de compilación de su bloque transformer. El bloque `MiniMaxH3TransformerBlock` se compila con AOT-Inductor y el paquete resultante se reutiliza para los 50 bloques del modelo: no lleva pesos y `spaces.aoti_patch` enlaza el `state_dict()` vivo de cada bloque en su primer forward. El paquete `bf16/torch2.11/sm120/dynamic` emplea una dimensión de secuencia dinámica, necesaria porque `build_packed_sequence` no aplica padding y la secuencia `S = num_text_tokens + condition_rows + audio_rows + video_rows` varía con el prompt; un paquete estático solo serviría para una longitud de prompt concreta. Las claves `<HxWxF>` contienen copias byte a byte idénticas del paquete dinámico para Spaces que buscan artefactos por canvas.

El repositorio documenta dos detalles técnicos relevantes. Primero, `temb` se rellena a 4 filas fijas (`num_distinct_timesteps` × `time_embed_dim`), ya que el bloque recoge de una tabla AdaLN de `3 * rows` y el número de filas forma parte de la shape compilada; las filas sobrantes nunca se recogen y el build valida reproduciendo llamadas reales de 1 y 2 filas contra eager. Segundo, se registra un fallo de `torch.export`: exportar un clon superficial en modo no estricto duplica cada peso como `PARAMETER` y como `CONSTANT_TENSOR` anónimo (`lifted_tensor_<N>`) que comparte `data_ptr()`; el binding por nombre de `LazyAOTIModel` deja el tensor anónimo sin enlazar y el kernel lee punteros no inicializados, produciendo segfault sin mensaje. La solución es exportar el bloque vivo o usar `strict=True` cuando una subclase fuerza el clon.

## Capacidades

- Aceleración de inferencia de MiniMax-H3 mediante compilación AOT-Inductor del bloque transformer, con un ahorro medido de aproximadamente 0,5 s por paso.
- Soporte de dimensión de secuencia dinámica, lo que permite servir cualquier canvas, duración y longitud de prompt con un único paquete compilado.
- Reutilización de un solo paquete para los 50 bloques del transformer mediante enlace dinámico de pesos en el primer forward.
- Caché de salida del conditioner (`prompt_embeds` y `text_token_tags`) en `_inputs/`, que evita cargar el Qwen3-VL de 62 GiB durante los jobs de build.
- Generación de informes JSON por build en `_reports/` para trazabilidad.
- Validación numérica del padding de `temb` mediante replay de llamadas reales contra eager.
- No se documentan capacidades de generación, razonamiento, código, tool calling, agentes ni multilingüismo del modelo subyacente en la información disponible.

## Casos de uso

- Despliegue de MiniMax-H3 en un Space de Hugging Face: el paquete `bf16/torch2.11/sm120/dynamic` se carga al arrancar, parchea los 50 bloques y genera; validado de extremo a extremo en el Space `multimodalart/minimax-h3`.
- Generación de vídeo con canvas de resolución reducida (544x960 a 640x1152): es donde AoTI aporta mayor ganancia relativa (+10,5% a +11,0%), adecuado para iteración rápida y prototipado.
- Generación de vídeo en el canvas publicado de 768x1344: el ahorro absoluto se mantiene en ~0,47 s por paso, útil en producción aunque el escenario esté limitado por cómputo.
- Servicio multi-prompt con un solo artefacto compilado: la dimensión dinámica evita mantener un paquete por longitud de prompt, simplificando el despliegue en entornos con prompts variables.
- Reutilización de la caché del conditioner en pipelines de build: `_inputs/` permite reconstruir paquetes sin cargar el Qwen3-VL de 62 GiB, reduciendo el coste de los jobs de compilación.
- Referencia de depuración para equipos que usan AOT-Inductor: el repositorio documenta el fallo de exportación con clones superficiales y su solución (`strict=True` o exportar el bloque vivo), aplicable a otros modelos con pesos enlazados dinámicamente.
- Ajuste de rendimiento por canvas: las mediciones por resolución permiten elegir el canvas en función del presupuesto de latencia (de 10,20 s/paso en eager a 3,58 s/paso con AoTI en 544x960).

## Benchmarks y rendimiento

Mediciones en bfloat16 sin cuantizar, 124 frames, todo residente en una RTX PRO 6000 Blackwell:

| Canvas (HxW) | Eager s/paso | AoTI s/paso | Ahorro | Mejora |
|---|---|---|---|---|
| 768x1344 | 10,20 | 9,73 | 0,47 s | +4,6% |
| 704x1280 | 8,59 | 7,87 | 0,72 s | +8,4% |
| 640x1152 | 6,46 | 5,88 | 0,59 s | +9,1% |
| 576x1024 | 4,74 | 4,24 | 0,50 s | +10,5% |
| 544x960 | 4,02 | 3,58 | 0,44 s | +11,0% |

El ahorro absoluto es aproximadamente constante (~0,5 s/paso), atribuible al overhead de lanzamiento de kernels de los 50 bloques y a los epílogos de norm, rotary y AdaLN-gather; AoTI no afecta a las matmuls. Con S = 37726, un bloque supone ~70 TFLOP de GEMM y atención, por lo que el canvas de 768x1344 está limitado por cómputo.

Diagnóstico del fallo de exportación medido sobre el bloque real, en bfloat16 sin subclases de tensor:

| Módulo exportado | Modo | Resultado |
|---|---|---|
| Bloque vivo | non-strict | 12 PARAMETER, 0 CONSTANT_TENSOR |
| Bloque vivo | strict | 12 PARAMETER, 0 CONSTANT_TENSOR |
| Clon superficial | non-strict | 12 PARAMETER, 12 CONSTANT_TENSOR (1231 MiB) |
| Clon superficial | strict | 12 PARAMETER, 0 CONSTANT_TENSOR |

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el modelo completo; el repositorio no contiene pesos. El conditioner Qwen3-VL ocupa 62 GiB según la model card.
- GPU recomendada: RTX PRO 6000 Blackwell (sm120), la plataforma sobre la que se construyeron y midieron los paquetes.
- Compatibilidad de arquitectura: los paquetes están compilados para `sm120`; no se documenta soporte para otras arquitecturas de GPU.
- Versión de PyTorch: los paquetes se compilan contra `torch2.11`.
- Despliegue: Spaces de Hugging Face con `h3_aoti.py` y `spaces.aoti_patch`; los builds se generan con `job_bf16_aoti.py` en un Job `rtx-pro-6000`.
- Latencia: de 3,58 s/paso (544x960) a 9,73 s/paso (768x1344) con AoTI en bfloat16, 124 frames, en una RTX PRO 6000 Blackwell.
- Throughput: no disponible más allá de los tiempos por paso documentados.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento de MiniMax-H3 frente a alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo; es un conjunto de artefactos de compilación y no puede usarse de forma autónoma para inferencia.
- Los paquetes están compilados específicamente para `sm120` y `torch2.11`; su uso en otras GPUs o versiones de PyTorch no está documentado y probablemente no funcione.
- El paquete estático solo sirve para una longitud de prompt; usar un paquete estático con prompts de distinta longitud produce resultados incorrectos o fallos.
- Exportar un clon superficial en modo no estricto provoca segfault sin mensaje por el doble levantamiento de pesos; debe exportarse el bloque vivo o usar `strict=True`.
- El padding de `temb` a 4 filas fijas es parte de la shape compilada; alterar el número de filas invalida el paquete.
- Licencia `other`: no se especifican términos de uso comercial en la información disponible; debe consultarse la licencia del modelo MiniMax-H3 subyacente antes de un uso en producción.
- Sesgos, riesgo de alucinación y limitaciones idiomáticas del modelo subyacente: no disponibles en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-23), lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Makdiz/minimax-h3-aoti
- Space MiniMax-H3: https://huggingface.co/spaces/multimodalart/minimax-h3
