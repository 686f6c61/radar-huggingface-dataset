# shredder-31/mmprovence-checkpoints

## Resumen

MMProvence checkpoints es un repositorio de adaptadores LoRA publicado por el usuario shredder-31 en Hugging Face. No es un modelo independiente, sino una colección de 329 checkpoints repartidos en 17 ejecuciones de entrenamiento (runs), cuyo objetivo es destilar el modelo Qwen/Qwen3-VL-Reranker-8B en modelos estudiantes más pequeños de la familia Qwen3.5-VL, con tamaños de 2B, 4B y 9B parámetros. El estudiante resultante emite una puntuación de relevancia (score) y, además, la localización de la evidencia relevante para la consulta en forma de cajas delimitadoras (bounding boxes) o fragmentos de texto (text spans).

La relevancia de este repositorio es más experimental que de producto: documenta una ablación sistemática sobre recetas de destilación multimodal para reranking con localización de evidencia. Incluye runs de fase 1 (solo score, prefijo `mix-*`), runs de fase 2 (score más evidencia, prefijo `join-*`) y ablaciones específicas sobre el esquema de fases (v7-2) y sobre la construcción de la caja etiquetada (v8). El propio autor advierte de que la selección de checkpoints no es homogénea entre tamaños y de que las métricas de IoU registradas antes del 21 de septiembre de 2026 están infladas entre 0,04 y 0,13.

El repositorio tiene un tamaño declarado en la ficha de Hugging Face de 559,5 GB, mientras que la model card indica 108 GB para los 329 checkpoints. El checkpoint de referencia para el estudiante de 4B es `checkpoint-5075` del run `join-structure-v7-score-sft-64lora-v2`. La licencia es `other` y no se declaran idiomas soportados ni pipeline de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre modelos Qwen3.5-VL; destilación multimodal desde Qwen3-VL-Reranker-8B |
| Parámetros totales | Depende del modelo base estudiante: 2B, 4B o 9B; los adaptadores son LoRA de rango 64 o 128 (número exacto de parámetros del adaptador no disponible) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el ejemplo de carga usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); los módulos `score` y `rerank_embed` se guardan como tensores completos, no como deltas de bajo rango |

Notas adicionales: el tamaño del repositorio figura como 559,5 GB en los metadatos de Hugging Face, mientras que la model card declara 108 GB. El modelo base declarado en los metadatos es Qwen/Qwen3-VL-Reranker-8B (profesor), pero los adaptadores se entrenan sobre bases locales de Qwen3.5-VL (2B, 4B, 9B).

## Arquitectura y entrenamiento

El proyecto entrena adaptadores LoRA sobre modelos de la familia Qwen3.5-VL, que actúan como estudiantes, mediante destilación desde el reranker multimodal Qwen3-VL-Reranker-8B, que actúa como profesor. El estudiante no solo produce una puntuación de relevancia, sino que también localiza la evidencia relevante en la consulta, ya sea mediante cajas delimitadoras sobre imágenes o mediante spans de texto. El entrenamiento se organiza en dos fases: una fase 1 (runs `mix-*`) en la que solo se optimiza el score, empleada como warm-start, y una fase 2 (runs `join-*`) en la que se añade la localización de evidencia. El pipeline se apoya en PEFT y, en el ejemplo de carga, en `AutoModelForImageTextToText` de Transformers.

Los adaptadores usan rangos LoRA de 64 o 128 según el run. Un detalle técnico crítico es que `modules_to_save = ["score", "rerank_embed"]` contiene tensores completos entrenados, no deltas de bajo rango; por ello, `merge_and_unload()` los descarta silenciosamente y deja una cabeza de score aleatoria bajo un backbone entrenado, de modo que hay que transferirlos manualmente en cualquier fusión. Además, en todos los runs salvo el fusionado, `adapter_config.json` presenta `base_model_name_or_path: null`, ya que el entrenamiento resolvió el modelo base desde una ruta local; el modelo base debe pasarse explícitamente al cargar. Cada run incluye un `config.used.yaml` que registra el modelo base exacto utilizado.

Las recetas incluyen ablaciones documentadas: la serie v7-2 varía las fases que ve el estudiante (`p2only` omite el warm-start de solo score; `p1p2` ejecuta ambas), y la serie v8 compara tres formas de construir la caja etiquetada (`control`, `rawbox`, `capped`). El autor advierte de que el emparejamiento de cajas pasó a ser overlap-gated el 21 de septiembre de 2026, por lo que los valores de `iou` registrados antes de esa fecha están inflados entre 0,04 y 0,13.

## Capacidades

- Reranking multimodal: produce una puntuación de relevancia para pares consulta-documento, incluyendo documentos con contenido visual (imágenes) y texto.
- Localización de evidencia: emite cajas delimitadoras (bounding boxes) sobre imágenes y/o spans de texto correspondientes a la evidencia relevante para la consulta.
- Destilación de un reranker mayor: los adaptadores reproducen el comportamiento de Qwen3-VL-Reranker-8B en un estudiante de menor tamaño (2B, 4B o 9B).
- Multimodalidad: al apoyarse en la familia Qwen3.5-VL, el estudiante trabaja con entradas de imagen y texto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo está orientado a reranking y localización, no a agentes).
- Capacidades multilingües: no disponibles (no se declaran idiomas soportados).
- Capacidades especiales: modo de razonamiento o thinking mode no disponible; salida conjunta de score y evidencia (cajas/spans) como característica distintiva.

## Casos de uso

- Reranking de resultados de búsqueda multimodal: dado un conjunto de documentos con imágenes y texto recuperados por un buscador, el modelo puntúa la relevancia respecto a la consulta y permite reordenar los resultados antes de mostrarlos al usuario.
- Localización de evidencia en RAG visual: tras la recuperación, el modelo señala la región concreta de una imagen o el fragmento de texto que respalda la respuesta, útil para sistemas de respuesta con atribución verificable.
- Anotación asistida de datasets: los scores y las cajas/spans generados pueden servir como preanotaciones para construir conjuntos de datos de reranking multimodal, reduciendo el trabajo manual de etiquetado.
- Verificación de respuestas (fact checking) sobre documentos visuales: el modelo identifica en qué parte de un documento (figura, captura, tabla) se encuentra la evidencia que confirma o refuta una afirmación.
- Búsqueda en catálogos de producto: reranking de fichas de producto con imagen y descripción frente a una consulta textual, resaltando el atributo visual o textual que motiva la relevancia.
- Investigación en destilación multimodal: el repositorio sirve como material de estudio para reproducir y comparar recetas de destilación de rerankers multimodales con localización de evidencia, dado el detalle de las ablaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se incluyen métricas estándar como MMLU, HumanEval o GSM8K. La model card menciona métricas internas de evaluación (entre ellas `score_loss`, `mse_score_head`, `mse_gen_head`, `sft_loss`, `iou`, `iou@0.5`, `CoverIoU`, `recall`, `precision`, `f2`, `judge`, `span_coverage` y `span_iou`), pero no se aportan sus valores numéricos y el propio autor advierte de que los IoU registrados antes del 21 de septiembre de 2026 están inflados entre 0,04 y 0,13 y de que no deben compararse en crudo entre las distintas ramas de la ablación v8. No se dispone de cifras cerradas para reproducir aquí.

## Requisitos de hardware

- Inferencia de los adaptadores: no es posible estimar una VRAM específica para el adaptador por separado, ya que la inferencia se realiza sobre el modelo base estudiante (Qwen3.5-VL de 2B, 4B o 9B).
- VRAM estimada para el modelo base en bfloat16 (estimación orientativa según el número de parámetros, no facilitada por el autor): aproximadamente 5-6 GB para el estudiante de 2B, 9-10 GB para el de 4B y 18-20 GB para el de 9B, sin contar el coste adicional de memoria de activaciones en entradas multimodales.
- GPU recomendadas: no disponibles en la información proporcionada. Como referencia de categoría, los estudiantes de 2B y 4B caben en GPUs de consumo con suficiente VRAM (por ejemplo, gama RTX 30/40 con 8-16 GB), mientras que el de 9B requiere GPUs de mayor memoria; no hay datos aportados por el autor.
- Despliegue: no se documentan opciones de servido (vLLM, TGI, llama.cpp, Ollama). El único ejemplo facilitado usa PEFT (`PeftModel.from_pretrained`) junto con Transformers (`AutoModelForImageTextToText`) y carga el modelo base en bfloat16.
- Latencia y throughput estimados: no disponibles.
- Requisito de almacenamiento: los propios checkpoints ocupan volúmenes considerables; el run de 9B `join-structure-v7-score-sft-64lora-9b-v1` ocupa 19,92 GB y el repositorio completo se declara entre 108 GB (model card) y 559,5 GB (metadatos de Hugging Face).

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan una comparación cuantitativa. La siguiente tabla recoge únicamente diferencias estructurales conocidas a partir de la información disponible.

| Modelo | Rol | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MMProvence checkpoints (este repo) | Adaptadores LoRA de destilación sobre Qwen3.5-VL, con score y localización de evidencia | Adaptadores sobre bases de 2B, 4B y 9B (LoRA r=64/128) | no disponible | other | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3-VL-Reranker-8B | Profesor / reranker multimodal original | 8B | no disponible | no disponible | Hugging Face |
| Qwen3.5-VL-2B / 4B / 9B | Modelos base estudiantes | 2B / 4B / 9B | no disponible | no disponible | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (rerankers multimodales con localización de evidencia) en los resultados de búsqueda proporcionados.

## Limitaciones y advertencias

- No es un modelo autónomo: son adaptadores LoRA que requieren cargar explícitamente el modelo base estudiante correcto. `base_model_name_or_path` es `null` en todos los runs salvo el fusionado, de modo que cargar el adaptador sin indicar la base adecuada falla o produce resultados incorrectos.
- Riesgo de fusión silenciosa: `modules_to_save = ["score", "rerank_embed"]` son tensores completos; `merge_and_unload()` los descarta sin aviso, dejando una cabeza de score aleatoria. Cualquier fusión debe transferirlos manualmente.
- Métricas poco fiables: los valores de `iou` anteriores al 21 de septiembre de 2026 están inflados entre 0,04 y 0,13; además, los IoU no son comparables en crudo entre las ramas v8 porque cada rama usa una caja de distinto tamaño.
- Selección de checkpoints sesgada: el `best/` de los runs `mix-*` se eligió por `eval_loss`, dominado en ~99,5% por `sft_loss`, por lo que refleja la cabeza generativa y no el ranking; no es el checkpoint que cargó la fase 2.
- Evidencia débil en el estudiante de 2B: solo 2 de sus 41 checkpoints fueron evaluados, frente a 40 de 40 en el de 4B; el "ganador" de 2B es una elección entre dos opciones, no un argmax sobre todo el entrenamiento.
- Idiomas: no se declaran idiomas soportados; se desconoce el comportamiento multilingüe.
- Sesgos: no se documentan sesgos conocidos, pero tampoco hay evaluación de sesgos publicada.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un componente de reranking y localización, sus salidas deben tratarse como señales probabilísticas, no como evidencia verificada.
- Licencia `other`: no se especifican los términos de uso comercial ni las restricciones, por lo que se debe consultar la licencia antes de cualquier uso en producción.
- Estado experimental: descargas y likes a cero, runs incompletos sin `best/` ni `final_metrics.json`, y advertencia explícita de que los resultados de la ablación de 2B son evidencia débil.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shredder-31/mmprovence-checkpoints
- Dataset de anotaciones (privado según la model card): https://huggingface.co/datasets/shredder-31/mmprovence
- Modelo base/profesor: https://huggingface.co/Qwen/Qwen3-VL-Reranker-8B
- Modelos base estudiantes de la familia Qwen3.5-VL: https://huggingface.co/Qwen

Los resultados de búsqueda web proporcionados (Amazon, Wikipedia sobre un personaje ficticio y un programa de ajedrez) no guardan relación con este modelo y no se incluyen como enlaces relevantes.
