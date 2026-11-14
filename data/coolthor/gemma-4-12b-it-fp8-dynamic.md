# coolthor/gemma-4-12B-it-FP8-dynamic

## Resumen

Gemma 4 12B-it FP8 dynamic es una cuantización en FP8 de punto flotante de 8 bits del modelo multimodal `google/gemma-4-12B-it` de Google DeepMind, publicada por el usuario independiente coolthor. Se trata de un modelo "omni" sin encoder separado que procesa texto, imagen, audio y vídeo de forma nativa, con 11.959.730.224 parámetros totales y un repositorio de 13,1 GB frente a los 23 GB del original en BF16. La cuantización es dinámica y libre de datos (data-free), lo que significa que no requiere conjunto de calibración para reproducirla.

El interés práctico de esta versión radica en que reduce el espacio en disco y el ancho de banda de memoria en aproximadamente un 43 % manteniendo las cuatro modalidades intactas, y en que los benchmarks publicados por el autor muestran una degradación de precisión muy pequeña (0,35 puntos en MMLU inglés y 0,24 puntos en TMMLU+ chino tradicional) frente al modelo base en BF16. Frente a la alternativa NVFP4 W4A16 del mismo autor, FP8 es más conservador en precisión, especialmente en idiomas no ingleses.

El modelo está pensado para despliegue en servidores con vLLM y GPUs con soporte FP8 (Hopper, Ada, Blackwell), y el autor lo validó específicamente en una NVIDIA DGX Spark (GB10, sm_121a). La licencia Apache 2.0 del modelo base se mantiene en esta derivación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal "omni" sin encoder separado (`gemma4_unified`), con atención de dimensiones de cabeza heterogéneas (head_dim 256 x 16 = 4096 distinto de hidden 3840) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible como cifra oficial; el autor sirve con `--max-model-len 4096` en vLLM como configuración de ejemplo |
| Tipos de cuantizacion | FP8 dinámico (esquema `FP8_DYNAMIC` de llmcompressor); cabecera `lm_head` y proyectores multimodal (`embed_vision`, `embed_audio`) se mantienen en BF16 |
| Idiomas soportados | no disponible como lista oficial; validado por el autor en inglés y chino tradicional |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con compressed-tensors y vLLM) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-12B-it` es un transformer multimodal de tipo "omni" y encoder-free, es decir, procesa las cuatro modalidades (texto, imagen, audio y vídeo) dentro de una única pila unificada en lugar de encadenar encoders especializados. Una particularidad técnica relevante para el despliegue es que emplea dimensiones de cabeza heterogéneas: 16 cabezas de dimensión 256 suman 4096, un valor distinto de la dimensión oculta de 3840, lo que obliga a usar el backend de atención `TRITON_ATTN` en vLLM en lugar de los backends estándar, y a disponer de una versión de vLLM con la clase nativa `Gemma4UnifiedForConditionalGeneration` (aproximadamente 0.22.x o main).

Esta ficha corresponde a una cuantización, no a un reentrenamiento: no hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO. El proceso de cuantización aplicado es `QuantizationModifier` de llmcompressor con esquema `FP8_DYNAMIC` sobre todas las capas `Linear`, excluyendo `lm_head` y los proyectores `embed_vision` y `embed_audio` mediante una lista de ignorados con expresiones regulares. Al ser dinámica y libre de datos, las escalas de activación se calculan en tiempo de ejecución y no se necesita conjunto de calibración, lo que simplifica la reproducción del proceso.

## Capacidades

- Generación de texto y razonamiento en inglés y chino, validados por el autor con resultados coherentes en ambos idiomas.
- Comprensión de imagen: el autor verificó la descripción precisa de una fotografía de estudio de pódcast con un gato, un Shiba Inu, auriculares, micrófonos y una taza con latte art.
- Comprensión de audio: transcripción y comprensión de un clip de LibriSpeech (contenido sobre "Mr. Quilter", "apostle" y "middle classes").
- Comprensión de vídeo: descripción correcta de un clip nocturno de calle.
- Procesamiento any-to-any: el pipeline declarado es `image-text-to-text` / `any-to-any`, con entrada y salida multimodal.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: validadas empíricamente en inglés y chino tradicional; no hay lista oficial de idiomas.

## Casos de uso

- Descripción y etiquetado automático de imágenes en catálogos de producto: el modelo puede recibir una imagen y generar una descripción textual detallada, como demuestra la validación del autor con la fotografía de estudio.
- Análisis de contenido audiovisual: al procesar audio y vídeo de forma nativa, permite generar resúmenes o descripciones de clips, útil en pipelines de moderación o indexación de archivos multimedia.
- Transcripción y comprensión de audio en inglés para aplicaciones de subtitulado o búsqueda sobre archivos de voz, apoyándose en la validación con LibriSpeech.
- Asistentes conversacionales multimodales: al mantener las cuatro modalidades en un único modelo de 12B, se puede desplegar un único endpoint para conversaciones que alternen texto, imagen y audio.
- Evaluación de modelos en entornos con memoria limitada: con 13 GB en disco frente a 23 GB en BF16, encaja en estaciones de trabajo con GPUs de 24 GB o en un DGX Spark, permitiendo experimentar con un modelo omni sin infraestructura de centro de datos.
- Investigación en cuantización: al ser data-free y reproducible con un único `QuantizationModifier`, sirve como referencia para estudiar la degradación de precisión de FP8 frente a NVFP4 en tareas multilingües.
- Procesamiento de documentos con imágenes y texto en chino tradicional: el autor reporta una caída de solo 0,24 puntos en TMMLU+, lo que lo hace adecuado para tareas de comprensión lectora multimodal en ese idioma.

## Benchmarks y rendimiento

Resultados publicados por el autor con `lm-evaluation-harness`, 5-shot, plantilla de chat aplicada, `limit=30` (N ≈ 1.710 en inglés, N ≈ 1.980 en chino tradicional, margen aproximado de ±1,0 punto), ejecutados a través de `transformers`:

| Formato | MMLU (EN) | TMMLU+ (TC) | Caída EN | Caída TC |
|---|---|---|---|---|
| BF16 | 78,30 % | 47,21 % | — | — |
| FP8 dynamic (este modelo) | 77,95 % | 46,97 % | −0,35 | −0,24 |
| NVFP4 W4A16 | 75,56 % | 41,24 % | −2,74 | −5,97 |

Rendimiento de decodificación medido en DGX Spark (GB10), vLLM 0.22.1 nativo, single-stream, en caliente:

| Formato | Disco | tok/s (EN/ZH) | Omni |
|---|---|---|---|
| BF16 | 23 GB | 7,7 | sí |
| FP8 dynamic (este modelo) | 13 GB | 15,9 | sí |
| NVFP4 W4A16 | 7,7 GB | 24,9 | sí |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13 GB de pesos en FP8, más overhead de activaciones y caché KV; con `--max-model-len 4096` el consumo total es moderado, aunque no se especifica una cifra exacta en la información disponible.
- GPU recomendadas: NVIDIA Hopper (H100), Ada (L40S, RTX 4090) y Blackwell (B200, GB10), todas con soporte nativo de FP8.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y previsiblemente en otras GPUs con 16 GB o más, dado el tamaño de 13 GB de pesos; no hay medición publicada en estas tarjetas.
- Despliegue: vLLM con la clase nativa `Gemma4UnifiedForConditionalGeneration` (0.22.x o main) y `VLLM_ATTENTION_BACKEND=TRITON_ATTN` obligatorio; transformers 5.10.1 o superior para cargar `model_type: gemma4_unified`; compressed-tensors para leer el formato FP8.
- Latencia y throughput: 15,9 tok/s en single-stream sobre DGX Spark GB10 con vLLM 0.22.1; no hay datos de throughput agregado ni de latencia en otras GPUs.
- Nota de entorno: en sm_121a (GB10) es necesario alinear manualmente `torch==2.11.0+cu130` porque el wheel fijado por vLLM main se compila contra otra ABI; en GPUs CUDA convencionales este ajuste no es necesario.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (EN) | TMMLU+ (TC) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gemma-4-12B-it-FP8-dynamic (este) | 11,96 B | no disponible | 77,95 % | 46,97 % | Apache 2.0 | Hugging Face |
| gemma-4-12B-it (BF16, base) | 11,96 B | no disponible | 78,30 % | 47,21 % | Apache 2.0 | Hugging Face |
| gemma-4-12B-it-NVFP4A16 (mismo autor) | 11,96 B | no disponible | 75,56 % | 41,24 % | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos omni comparables de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks publicados usan `limit=30` con N ≈ 1.710 y N ≈ 1.980, un tamaño de muestra reducido con margen de ±1,0 punto; el propio autor los califica de indicativos, no concluyentes.
- Solo se han validado cualitativamente inglés y chino tradicional; el comportamiento en castellano u otros idiomas no está documentado.
- La cuantización FP8 introduce una degradación pequeña pero medible (−0,35 puntos en MMLU, −0,24 en TMMLU+); en tareas sensibles a precisión numérica conviene comparar contra el BF16.
- Riesgo de alucinación inherente al modelo base; no hay evaluación específica de tasas de alucinación en la información disponible.
- Sesgos conocidos del modelo base no documentados en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar los términos de `google/gemma-4-12B-it`.
- El modelo es muy sensible a la versión del toolchain: requiere transformers ≥ 5.10.1, vLLM con la clase nativa `Gemma4UnifiedForConditionalGeneration` y el backend `TRITON_ATTN`; versiones anteriores fallan al cargar la configuración o al ejecutar `o_proj`.
- En sm_121a (DGX Spark) es necesario forzar `torch==2.11.0+cu130`; una instalación por defecto puede acabar en un build solo CPU con error de símbolo indefinido.
- El repositorio tiene 478 descargas y 3 likes en el momento de la consulta, con un único autor mantenedor; no hay garantía de soporte continuado.
- La longitud máxima de contexto no está especificada; el ejemplo de servicio usa 4096 tokens, que puede no reflejar el máximo real del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coolthor/gemma-4-12B-it-FP8-dynamic
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Versión NVFP4 del mismo autor: https://huggingface.co/coolthor/gemma-4-12B-it-NVFP4A16
- Perfil del autor en Hugging Face: https://huggingface.co/coolthor
- Análisis de benchmarks y notas de despliegue: https://ai-muninn.com/en/blog/dgx-spark-nvfp4-quant-tax-chinese-vs-english
- Blog del autor: https://ai-muninn.com
- Revisión concreta del repositorio: https://huggingface.co/coolthor/gemma-4-12B-it-FP8-dynamic/tree/efdc1c876c34a8bd0cfd90886818fba7277963d9
- Apoyo al autor: https://buymeacoffee.com/thorlin
