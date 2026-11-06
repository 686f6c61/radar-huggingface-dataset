# NeuralNotwerk/Qwen3.8-Flash-Next-heretic-2-MXFP4-FP8

## Resumen

Qwen3.8-Flash-Next-heretic-2-MXFP4-FP8 es una cuantización de precisión mixta del modelo trohrbaugh/Qwen3.8-Flash-Next-heretic-2, que a su vez es una versión "abliterated" (decensurada) del Qwen3.8-Flash-Next de Qwen. La publica NeuralNotwerk reutilizando la receta y el tooling de tcclaviger para producir un checkpoint intercambiable con tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ en tarjetas AMD Radeon AI PRO R9700 (RDNA4, gfx1201).

El modelo es multimodal (image-text-to-text), con arquitectura MoE y un total de 174.749.667.219 parámetros según los safetensors del repo. Emplea cuantización MXFP4 (OCP e2m1 con escalas de grupo-32 e8m0) para expertos enrutados y compartidos, FP8 para las proyecciones de atención, una tabla de embeddings n-gram (PLE) de 51B parámetros en int6 alojada en RAM de host, y BF16 para el torre de visión, normas, embeddings, lm_head y el drafter MTP.

Su relevancia es doble: por un lado ofrece una variante sin censura (0/100 rechazos en el test del autor frente a 99/100 del original, con KL 0.0818) y, por otro, es uno de los pocos checkpoints empaquetados específicamente para servir en GPUs AMD RDNA4 mediante la imagen tcclaviger/vllm con kernels libr4d. El repo ocupa 118,8 GB en 24 archivos safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con drafter MTP y embeddings n-gram (PLE) |
| Parametros totales | 174.749.667.219 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (OCP e2m1, escalas e8m0 grupo-32) en expertos; FP8 en proyecciones de atención y escalas KV-cache; int6 con escalas fp16 grupo-32 en tabla PLE; BF16 en torre de visión, normas, embeddings, lm_head y MTP |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors (24 archivos, compressed-tensors, 8-bit) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE multimodal de Qwen (Qwen3.8-Flash-Next), con 48 capas según el proceso de cuantización descrito, expertos enrutados y compartidos, una torre de visión y un bloque MTP (multi-token prediction) que actúa como drafter. Incluye además una tabla de embeddings n-gram PLE de 51B parámetros, lo que explica buena parte del recuento total de parámetros. El checkpoint parte del BF16 heretic-2, que aplica abliteration sobre las proyecciones `o_proj` de atención y `down_proj` de los expertos MoE.

El proceso de construcción, ejecutado dentro de la imagen tcclaviger/vllm (vLLM 0.29.0.dev0, torch 2.11.0+rocm10.0) sobre 4x R9700, consta de cinco pasos: cuantización activation-aware MXFP4/FP8 con GPTQ (unas 32 horas, calibración de 232 muestras x 8192 tokens sobre un corpus de 2M tokens y 27 dominios, damping 0.01, snap floor-or-ceil de escalas por peso de activación y propagación capa a capa a través de los kernels reales de servicio); injerto de la tabla PLE int6 de tcclaviger (seguro porque la abliteration no toca tensores que existan en dicha tabla); recalibración de escalas FP8 de KV-cache para las 36 capas principales y el MTP; renombrado de escalas KV al esquema esperado por el servidor; y restauración del config.json y tokenizer originales de Qwen. Los expertos enrutados con menos de 256 tokens de calibración recurren a selección de escala simple.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento image-text-to-text: acepta imágenes junto con texto como entrada.
- Razonamiento y matemáticas (heredados del modelo base Qwen, sin benchmarks publicados en la información disponible).
- Generación de código (capacidad del modelo base, no verificada en esta ficha).
- Decodificación especulativa mediante el drafter MTP incluido en BF16.
- Variante decensurada/abliterated: el autor reporta 0/100 rechazos en su test frente a 99/100 del original, con divergencia KL de 0.0818.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en clústeres AMD RDNA4: es un reemplazo directo de tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ en tarjetas R9700 con la imagen tcclaviger/vllm; útil para equipos que ya operan infraestructura AMD y necesitan un checkpoint compatible con los kernels libr4d.
- Servicio multimodal con TP4: con 17,97 GiB de pesos por tarjeta en TP4 y la tabla PLE int6 (41,6 GB) en RAM de host con mlock, permite servir un modelo de 174B parámetros en cuatro GPUs de 32 GB sin desbordar VRAM.
- Investigación sobre abliteration: sirve para estudiar el efecto de la decensuración sobre un modelo grande, comparando el KL 0.0818 frente al original y los ratios de rechazo reportados.
- Generación de contenido sin filtros de rechazo: para pipelines donde los rechazos del modelo base interrumpen flujos creativos o de análisis de texto sensible, con la advertencia de que la ausencia de rechazos no equivale a corrección factual.
- Evaluación de cuantización de precisión mixta: el checkpoint permite medir el impacto de MXFP4 en expertos más FP8 en atención sobre la calidad del BF16 original, con informes de calibración incluidos (aa_report.json, kv_calibration_report.json).
- Reproducción de la receta: los scripts y comandos documentados (quantize.py, graft_ple_int6.py, rename_kvscales.py) permiten reconstruir el pipeline sobre otras fuentes BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo reportado es la divergencia KL de 0.0818 frente al modelo original y el ratio de rechazos 0/100 del heretic-2 frente a 99/100 del original en el test del autor de la abliteration.

## Requisitos de hardware

- GPU exclusiva: AMD Radeon AI PRO R9700 (RDNA4, gfx1201). El autor indica explícitamente que solo funciona en esa GPU; ninguna otra imagen lee este formato.
- VRAM: en TP4, 17,97 GiB de pesos por tarjeta; la tabla PLE int6 (41,6 GB) reside en RAM de host (mlocked), no en VRAM. Se requiere RAM de host suficiente para alojarla.
- Despliegue: imagen tcclaviger/vllm (vLLM 0.29.0.dev0+g2bdbbc8080, torch 2.11.0+rocm10.0) con kernels libr4d MXFP4/FP8. No es compatible con llama.cpp, Ollama, TGI ni vLLM estándar en el momento de publicación.
- Almacenamiento: 118,8 GB (110,6 GiB) en 24 safetensors.
- Latencia y throughput: no disponible.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware | Licencia |
|---|---|---|---|---|---|
| NeuralNotwerk/Qwen3.8-Flash-Next-heretic-2-MXFP4-FP8 | 174,7B | no disponible | MXFP4/FP8/int6/BF16, 118,8 GB | AMD R9700 (gfx1201) | qwen-community-1.0 |
| tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ | no disponible | no disponible | MXFP4/FP8 GPTQ, 116 GB | AMD R9700 (gfx1201) | no disponible |
| trohrbaugh/Qwen3.8-Flash-Next-heretic-2 | no disponible | no disponible | BF16 | GPU con suficiente VRAM | no disponible |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | BF16 (original) | GPU estándar | qwen-community-1.0 |

La diferencia principal frente a tcclaviger es la fuente BF16 (heretic-2 decensurado en lugar del original) y un tamaño ligeramente mayor (118,8 GB frente a 116 GB); los nombres y formas de tensores coinciden, por lo que las flags de servicio son intercambiables.

## Limitaciones y advertencias

- Compatibilidad de hardware extremadamente restringida: solo AMD Radeon AI PRO R9700 (RDNA4, gfx1201) con la imagen tcclaviger/vllm; no hay soporte para NVIDIA ni para vLLM estándar.
- Modelo decensurado: la abliteration elimina los rechazos, lo que implica mayor riesgo de generar contenido dañino, sesgado o inexacto sin salvaguardas. No apto para aplicaciones orientadas al público sin capas de moderación externas.
- Riesgo de alucinación: inherente al modelo base; la cuantización MXFP4/FP8 puede añadir degradación adicional no cuantificada en benchmarks públicos.
- Idiomas soportados no documentados en la información disponible.
- Longitud de contexto no documentada en la información disponible.
- Licencia qwen-community-1.0: es necesario revisar el texto de LICENSE para confirmar condiciones de uso comercial, ya que la model card la etiqueta como "other".
- La tabla PLE int6 se reutiliza sin cambios de tcclaviger; cualquier divergencia entre el corpus de calibración y el dominio de producción puede afectar a la calidad.
- El checkpoint se publicó con 0 descargas y 0 likes; no hay validación independiente de su calidad más allá de los informes del propio autor.
- Los tensores MTP están en BF16, no en FP8 como indica la model card de tcclaviger; hay que tenerlo en cuenta al comparar rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/NeuralNotwerk/Qwen3.8-Flash-Next-heretic-2-MXFP4-FP8
- Modelo base BF16: https://huggingface.co/trohrbaugh/Qwen3.8-Flash-Next-heretic-2
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint de referencia: https://huggingface.co/tcclaviger/Qwen3.8-Flash-Next-MXFP4-FP8-GPTQ
- Proyecto Heretic: https://github.com/p-e-w/heretic
- Imagen de servicio: https://hub.docker.com/r/tcclaviger/vllm
