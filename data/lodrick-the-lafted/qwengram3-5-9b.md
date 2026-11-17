# lodrick-the-lafted/Qwengram3.5-9B

## Resumen

Qwengram3.5-9B es un experimento de investigación publicado por el usuario independiente lodrick-the-lafted sobre el modelo base Qwen/Qwen3.5-9B. Se trata de un transplante de una tabla de embeddings de n-gramas (procedente de un modelo denominado QFN) sobre el modelo de Qwen, insertando dicha tabla en la entrada del bloque 1 del transformer (tras el bloque 0), replicando el punto de inserción del modelo original del que se extrajeron los n-gramas. Los pesos del modelo base no han sido reentrenados en este checkpoint; el trabajo consiste únicamente en la conversión e integración de la tabla de n-gramas.

La conversión se inspiró en el artículo vec2vec (arXiv:2306.12689), aunque el autor indica que ninguno de los más de 20 intentos de entrenamiento funcionó tan bien como un modelo de conversión generado mediante regresión ridge. El modelo de conversión se entrenó sobre los estados ocultos del bloque 1 de Qwen3.5-9B, de modo que la tabla resultante puede aplicarse directamente sobre ese punto de la red.

La relevancia de esta ficha es limitada desde el punto de vista de producción: el propio autor reconoce que, en una prueba sobre 300 respuestas de SimpleQA, el mecanismo otorgó un ligero impulso en el logit de la respuesta correcta, pero no lo suficiente como para mejorar de forma concreta los resultados de evaluación. Es, por tanto, un artefacto de investigación sobre inyección de conocimiento léxico mediante n-gramas, no un modelo listo para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) con tabla de embeddings de n-gramas insertada en la entrada del bloque 1; tipo de modelo registrado como `qwen3_5_ngram`, requiere `trust_remote_code` |
| Parametros totales | 30.133.759.763 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor solo documenta carga en `bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (enlazada a la licencia de Qwen/Qwen3.5-9B) |
| Formato de pesos | safetensors (librería transformers, código custom) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer del que no se detallan en la información disponible ni el número de tokens de entrenamiento ni la composición del dataset. Sobre esa base se añade una tabla de embeddings de n-gramas en la entrada del bloque 1 (después del bloque 0), imitando el punto de inserción del modelo QFN del que se extrajeron los n-gramas. El autor indica explícitamente que los pesos del modelo base no han sido entrenados en este checkpoint: la aportación es la tabla de n-gramas convertida y su integración en el grafo.

La técnica de conversión se inspiró en vec2vec (arXiv:2306.12689), pero el autor señala que ninguno de los más de 20 intentos de entrenamiento superó a un modelo de conversión generado por regresión ridge. Dicho modelo de conversión se entrenó sobre los estados ocultos del bloque 1 de Qwen3.5-9B, por lo que la tabla puede aplicarse directamente en ese punto. El "mixer" del modelo original no se utiliza porque es específico de QFN. La implementación expone dos métodos de control: `set_ngram_scale(s)` para ajustar la escala del embedding de n-gramas y `set_ngram_enabled(False)` (o `set_ngram_scale(0.0)`) para desactivar la tabla sin recargar el modelo.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-9B.
- Procesamiento image-text-to-text según el `pipeline_tag` declarado (capacidad multimodal heredada del base; no se detalla en la model card).
- Inyección de conocimiento léxico mediante n-gramas, controlable en escala y activable o desactivable en tiempo de ejecución.
- Carga mediante `AutoModelForCausalLM` con `trust_remote_code=True` y `dtype='bfloat16'`.
- Tool calling, function calling, agentes, modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada (dependerían del modelo base, no documentadas aquí).
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación sobre inyección de conocimiento léxico: el modelo sirve como banco de pruebas para estudiar cómo una tabla de n-gramas proyectada sobre estados ocultos intermedios modifica la distribución de logits, comparando con y sin la tabla mediante `set_ngram_enabled`.
- Experimentos de destilación de tablas de n-gramas entre modelos: la metodología de conversión por regresión ridge sobre estados ocultos del bloque 1 puede replicarse para trasplantar n-gramas de otros modelos QFN a arquitecturas Qwen.
- Evaluación de técnicas de vec2vec: permite contrastar empíricamente el enfoque de conversión por regresión ridge frente a los intentos de entrenamiento directo mencionados por el autor.
- Análisis de calibración en preguntas factuales: con las 300 respuestas de SimpleQA como referencia, se puede medir el desplazamiento de logits en la respuesta correcta y estudiar si escalas mayores de `set_ngram_scale` producen mejoras.
- Reproducción académica: útil para grupos que investiguen representaciones léxicas y quieran reproducir el pipeline de conversión sobre un modelo de 30.000 millones de parámetros.
- Pruebas de integración con `trust_remote_code`: sirve para validar pipelines de carga de modelos con código personalizado en transformers antes de desplegar arquitecturas no estándar.

## Benchmarks y rendimiento

El autor reporta una prueba cualitativa sobre 300 respuestas de SimpleQA: la tabla de n-gramas otorgó un ligero impulso en el logit de la respuesta correcta, pero no lo suficiente para mejorar de forma concreta los resultados de la evaluación. No se publican cifras numéricas de MMLU, HumanEval, GSM8K ni de ningún otro benchmark en la información disponible.

| Benchmark | Resultado |
|---|---|
| SimpleQA (300 respuestas, cualitativo) | Ligero aumento del logit de la respuesta correcta; sin mejora concreta en la evaluación |
| MMLU, HumanEval, GSM8K y otros | no disponible |

## Requisitos de hardware

- El checkpoint ocupa 60,3 GB en el repositorio, con 30.133.759.763 parámetros; en `bfloat16` los pesos requieren aproximadamente 60 GB de VRAM solo para el modelo, más el espacio de activaciones y caché KV.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en precisión nativa; sería necesario cuantizar, aunque el autor no documenta cuantizaciones soportadas.
- GPU recomendadas para carga directa en `bfloat16`: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con `device_map`.
- Opciones de despliegue: transformers con `trust_remote_code=True` es el único método documentado. vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible y el código personalizado (`qwen3_5_ngram`) probablemente requiera adaptaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwengram3.5-9B | 30.133.759.763 | no disponible | Apache 2.0 | Base Qwen3.5-9B con tabla de n-gramas añadida; sin reentrenamiento |
| Qwen/Qwen3.5-9B | no disponible en la información | no disponible | Apache 2.0 | Modelo base original, sin la tabla de n-gramas |
| Modelo QFN de origen de los n-gramas | no disponible | no disponible | no disponible | Fuente de la tabla de n-gramas y del punto de inserción tras el bloque 0 |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor reconoce que la mejora medida en SimpleQA es marginal y no se traduce en una mejora concreta de los resultados de evaluación.
- Los pesos del modelo base no han sido entrenados; cualquier capacidad es heredada de Qwen3.5-9B y la tabla de n-gramas solo añade un sesgo en la distribución de logits.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor del repositorio; conviene auditar el código antes de usarlo en producción.
- El "mixer" del modelo original no se utiliza, por lo que el comportamiento no es idéntico al de QFN.
- No se documentan idiomas soportados, contexto máximo ni cuantizaciones; no hay garantías de comportamiento multilingüe o de ventana larga más allá de las del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-9B conviene revisar los términos del modelo base y las obligaciones de atribución.
- No apto como componente de producción sin una evaluación propia: el artefacto es experimental y su beneficio no está demostrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lodrick-the-lafted/Qwengram3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Artículo vec2vec: https://arxiv.org/abs/2306.12689
