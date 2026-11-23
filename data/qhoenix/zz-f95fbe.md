# qhoenix/zz-f95fbe

## Resumen

zz-f95fbe es un modelo publicado por el usuario qhoenix en Hugging Face, derivado mediante fine-tuning del modelo base Qwen/Qwen3.8-27B. Según la model card, se trata de un "Zils d3 soup-pool body" montado sobre el chasis "d3-ultra", una descripción que no aporta información técnica verificable sobre el proceso de entrenamiento ni sobre la naturaleza exacta de la modificación respecto al modelo base. El repositorio declara la etiqueta de pipeline `feature-extraction`, lo que sugiere un uso orientado a la extracción de representaciones (embeddings) más que a la generación de texto, aunque el modelo base es un modelo de lenguaje de gran tamano.

El modelo cuenta con 26.085.330.160 parámetros totales según los pesos en safetensors, un valor coherente con la denominación "27B" del modelo base Qwen. El repositorio ocupa 52,2 GB, lo que corresponde a pesos en precisión de 16 bits. La licencia declarada es Apache-2.0 y el modelo se distribuye en formato safetensors para la librería transformers, con código personalizado (`custom_code`), lo que implica que la carga requiere confiar en código remoto del autor.

La relevancia de este modelo es limitada en el momento de redactar esta ficha: no registra descargas ni "likes", fue creado y actualizado el mismo día (23 de noviembre de 2026), y la documentación disponible es mínima. No se han publicado detalles sobre datos de entrenamiento, metodología, benchmarks ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5`; derivado de Qwen/Qwen3.8-27B) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors de 16 bits; repo de 52,2 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

No se dispone de información verificable sobre la arquitectura interna más allá de las etiquetas del repositorio: `qwen3_5` como familia arquitectónica, `transformers` como librería y `custom_code` como indicador de que el modelo requiere código propio para su carga. El modelo base declarado es Qwen/Qwen3.8-27B, del que hereda presumiblemente la estructura de transformer decoder, pero no se confirma en la información disponible.

La model card describe el resultado como un "Zils d3 soup-pool body in the pinned d3-ultra chassis layout", terminología que no se corresponde con ningún esquema técnico estándar y que no permite reconstruir el proceso de entrenamiento. No se especifican tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. Tampoco se documenta qué se ha modificado respecto al modelo base ni con qué objetivo.

## Capacidades

- Extracción de características: la etiqueta de pipeline `feature-extraction` indica que el modelo está configurado para producir representaciones vectoriales, presumiblemente a partir del estado oculto del transformer subyacente.
- Generación de texto: no confirmada explícitamente en la model card, aunque el modelo base Qwen es un modelo de lenguaje; no se puede garantizar que el fine-tuning haya preservado esta capacidad.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: dado que el pipeline declarado es `feature-extraction`, el uso más directo sería generar vectores para indexar documentos y consultas en un motor de búsqueda vectorial; no obstante, la ausencia de benchmarks de recuperación impide validar su calidad frente a modelos de embeddings dedicados.
- Clasificación de texto mediante representaciones: usar los embeddings del modelo como entrada a un clasificador ligero (regresión logística, MLP) para tareas como moderación o etiquetado; requiere validación previa, ya que no se documenta el entrenamiento con objetivos de sentence embedding.
- Agrupamiento y deduplicación de documentos: calcular similitudes entre embeddings para agrupar textos temáticamente similares en pipelines de curación de datos.
- Experimentación e investigación: servir como punto de partida para estudiar el efecto de fine-tunings no documentados sobre un modelo base Qwen de 27B, comparando representaciones con las del modelo original.
- RAG interno (con cautela): integrado en un pipeline de recuperación aumentada, siempre que se valide empíricamente la calidad de recuperación en el dominio concreto antes de llevarlo a producción.
- Evaluación comparativa de checkpoints comunitarios: útil para quien investigue la proliferación de derivados de Qwen y quiera medir diferencias de comportamiento respecto al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, los 26.085 millones de parámetros requieren aproximadamente 52 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 26-28 GB; en 4 bits, en torno a 13-15 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: para fp16, A100 80 GB, H100 80 GB o configuraciones multi-GPU (2× A100 40 GB con sharding). Para cuantización de 8 bits, una A100 40 GB o L40S 48 GB. Para 4 bits, una RTX 4090 24 GB podría ser suficiente en teoría.
- Cabe en GPU de consumo: solo con cuantización agresiva (4 bits) y siempre que el `custom_code` del autor sea compatible con el backend de cuantización elegido; no está verificado.
- Opciones de despliegue: transformers (requerido por la dependencia de `custom_code`, con `trust_remote_code=True`); vLLM, llama.cpp, Ollama o TGI solo si el código personalizado y la arquitectura son compatibles, lo cual no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qhoenix/zz-f95fbe | 26,09 B | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tuning no documentado de Qwen3.8-27B |
| Qwen/Qwen3.8-27B (base) | ~27 B (según denominación) | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo original del que deriva; documentación y benchmarks propios del autor |
| Alternativas de ~27B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada para establecer una comparación cuantitativa |

## Limitaciones y advertencias

- Documentación mínima: la model card no describe el proceso de entrenamiento, los datos utilizados ni los objetivos, lo que impide evaluar qué comportamiento se ha modificado respecto al modelo base.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no cuantificado para este checkpoint.
- Sesgos: no documentados; se heredarían presumiblemente los del modelo base y los de los datos de fine-tuning, que se desconocen.
- Idiomas: no se declara ningún idioma soportado, por lo que no se puede garantizar cobertura multilingüe.
- Código personalizado: la etiqueta `custom_code` obliga a ejecutar código del autor con `trust_remote_code=True`, lo que supone un riesgo de seguridad en entornos de producción; conviene auditar el código antes de usarlo.
- Licencia: Apache-2.0 permite uso comercial, pero el autor indica que deben consultarse LICENSE y NOTICE para las atribuciones de terceros; es responsabilidad del usuario verificar el cumplimiento.
- Madurez: cero descargas y cero "likes" en el momento de la ficha, con creación y actualización el mismo día; no hay evidencia de uso en producción ni validación comunitaria.
- Compatibilidad: al no documentarse la arquitectura exacta ni el código, no se puede confirmar el funcionamiento con vLLM, llama.cpp u otros motores de inferencia optimizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhoenix/zz-f95fbe
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
