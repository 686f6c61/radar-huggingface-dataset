# senorperez/qwen3.6-35b-a3b-dense-3.4b

## Resumen

El modelo `senorperez/qwen3.6-35b-a3b-dense-3.4b` es un checkpoint experimental de investigación que convierte el modelo de mezcla de expertos (MoE) `Qwen/Qwen3.6-35B-A3B` en un modelo denso de 3.43 mil millones de parámetros. El autor, senorperez, selecciona 8 de los 256 expertos por capa del MoE original, los concatena en una única red feed-forward de dimensión 4096 y destila el resultado durante 550 millones de tokens del dataset FineWeb-Edu. El objetivo es explorar técnicas de poda y destilación de arquitecturas MoE hacia modelos densos, un área activa en la optimización de modelos de lenguaje.

El checkpoint está claramente marcado como experimental y subentrenado: el autor advierte que no se debe esperar un modelo utilizable, ya que es superado en precisión media downstream por Qwen3.5-0.8B, un modelo cuatro veces más pequeño. A pesar de ello, el trabajo documenta hallazgos relevantes sobre la selección de expertos y la reutilización de datos en destilación, con implicaciones para futuras investigaciones. La arquitectura resultante es un transformer denso que se carga con `transformers` 5.x sin código personalizado, emitido como `Qwen3_5MoeForCausalLM` con `num_experts=1`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de MoE (originalmente 256 expertos, 8 seleccionados y concatenados por capa, FFN de dimensión 4096) |
| Parametros totales | 3.434.099.328 (3,43B) |
| Parametros activos | No aplica (modelo denso, todos los parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en bfloat16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.6-35B-A3B`, un MoE con 256 expertos por capa. El proceso de densificación selecciona 8 expertos por capa según un criterio de frecuencia de enrutamiento marginal ponderada en un objetivo de diversidad log-det, los concatena en una única FFN de dimensión 4096 (8 × 512) y entrena el modelo denso resultante mediante destilación sobre logits del modelo padre. El entrenamiento se realizó con 550 millones de tokens de FineWeb-Edu, una cantidad que el autor estima como aproximadamente 1/25 de lo que vería un modelo preentrenado comparable.

El autor documenta dos hallazgos técnicos: la selección de expertos por frecuencia de enrutamiento marginal supera al método de activación ponderada del paper original en un 27,8% de perplexidad (72/72 ventanas, p=4e-22), y la reutilización de datos en la destilación con logits cacheados degrada significativamente la precisión (una segunda época costó 12,8 puntos porcentuales en arc_easy, z=8,9) sin apenas cambio en perplexidad. El modelo se emite como un MoE con un solo experto, lo que lo hace funcionalmente denso y compatible con el código estándar de `transformers`.

## Capacidades

- Generación de texto básica: el modelo puede producir texto, pero su rendimiento es inferior al de modelos mucho más pequeños, como Qwen3.5-0.8B.
- Razonamiento y conocimiento general: muy limitado debido al subentrenamiento; no se recomienda para tareas que requieran precisión.
- Sin soporte de tool calling, function calling, agentes o razonamiento multi-paso documentado.
- Sin capacidades multimodales (visión, audio) ni modo de pensamiento explícito.
- Multilingüismo: no documentado; se asume herencia limitada del modelo padre, pero sin verificación.
- Únicamente apto para investigación experimental sobre destilación y poda de MoE.

## Casos de uso

- Investigación académica sobre destilación MoE a denso: el modelo sirve como punto de comparación para estudiar el efecto de la selección de expertos y la cantidad de tokens de destilación en la calidad final.
- Análisis de scaling laws: los datos de perplexidad y precisión permiten estudiar la relación entre tokens de entrenamiento y rendimiento en modelos densos derivados de MoE.
- Evaluación de métricas de selección de expertos: el autor proporciona código y artefactos para reproducir los experimentos, lo que facilita la comparación con otros criterios de poda.
- Pruebas de compatibilidad con `transformers` 5.x: al cargarse como un MoE con un solo experto, puede usarse para verificar la interoperabilidad de formatos densos dentro de infraestructuras MoE.
- Benchmarking de eficiencia de inferencia: el script `dense_fastpath.py` permite medir la aceleración al omitir el dispatch MoE vestigial (1,18× en forward), útil para optimizar kernels.
- No es adecuado para aplicaciones de producción, atención al cliente, generación de código o cualquier tarea que requiera fiabilidad.

## Benchmarks y rendimiento

La model card proporciona los siguientes datos comparativos:

| Modelo | Parámetros | WikiText PPL | Avg downstream¹ |
|---|---|---|---|
| Qwen3.6-35B-A3B (padre) | 35B | 6,25 | — |
| Qwen3.5-4B | 4B | 8,65 | — |
| Qwen3.5-0.8B | 0,8B | 15,71 | 0,545 |
| **Este modelo** | 3,43B | 12,12 | 0,536 |

¹ arc_easy / arc_challenge / hellaswag / lambada / piqa, acc_norm donde esté disponible.

El modelo supera a Qwen3.5-0.8B en arc_easy (0,621 vs 0,617) y en perplexidad, pero queda por debajo en el promedio de las cinco tareas. El autor señala que la ley de escalado seguía siendo limpia cuando se recuperó el hardware (PPL ∝ T^−0,206), extrapolando a un nivel de perplexidad de 4B con ~3B tokens, pero advierte explícitamente que esa extrapolación no debe tratarse como un resultado.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación.
- El tamaño del repositorio es de 6,9 GB, lo que sugiere que los pesos en bfloat16 ocupan aproximadamente 6,9 GB (3,43B parámetros × 2 bytes).
- Para inferencia en bfloat16 se necesitaría una GPU con al menos 8-10 GB de VRAM, considerando overhead de activaciones y memoria del runtime. Una RTX 3060 12GB o superior podría ser suficiente, pero sin garantías de rendimiento.
- No se documentan cuantizaciones (GGUF, INT8, etc.), por lo que el despliegue en CPU o GPUs de baja VRAM no está validado.
- Opciones de despliegue: `transformers` 5.x con carga estándar; el script `dense_fastpath.py` del repositorio acelera el forward al omitir el dispatch MoE.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL WikiText | Avg downstream | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (padre) | 35B (MoE) | No disponible | 6,25 | — | Apache 2.0 |
| Qwen3.5-4B | 4B | No disponible | 8,65 | — | Apache 2.0 |
| Qwen3.5-0.8B | 0,8B | No disponible | 15,71 | 0,545 | Apache 2.0 |
| **Este modelo** | 3,43B | No disponible | 12,12 | 0,536 | Apache 2.0 |

El modelo es un caso atípico: no compite con modelos densos preentrenados de tamaño similar, sino que es un artefacto de investigación. Su rendimiento es inferior al de Qwen3.5-0.8B, a pesar de tener más de cuatro veces los parámetros, lo que refleja el subentrenamiento. No hay otros modelos comparables en la misma categoría de "MoE destilado a denso" con datos públicos.

## Limitaciones y advertencias

- Modelo experimental y subentrenado: 550M tokens de destilación es aproximadamente 1/25 de lo que vería un modelo preentrenado comparable; el autor lo califica explícitamente como "no utilizable".
- Rendimiento inferior a modelos mucho más pequeños: superado por Qwen3.5-0.8B en promedio downstream, lo que limita cualquier uso práctico.
- Riesgo de alucinación y errores: al estar subentrenado, es probable que genere contenido incoherente o falso; no apto para tareas de producción.
- Sesgos: no documentados; al derivar de Qwen3.6-35B-A3B, podría heredar sesgos del modelo padre, pero no hay evaluación disponible.
- Limitaciones de contexto e idioma: no especificadas; se desconoce la ventana de contexto y los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no es útil para ello; el repositorio de código es privado, lo que limita la reproducibilidad completa.
- Advertencia para producción: no usar en ningún sistema real; su único valor es como objeto de estudio.

## Enlaces

- HuggingFace: https://huggingface.co/senorperez/qwen3.6-35b-a3b-dense-3.4b
- Paper de referencia: "Pruning and Distilling Mixture-of-Experts into Dense Language Models" (https://arxiv.org/abs/2605.28207)
- Repositorio de código y artefactos: https://github.com/sootaugur/moe2dense (privado)
