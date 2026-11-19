# sciforium/Solon-1.0-Flash

## Resumen

Solon-1.0-Flash es un modelo publicado por el usuario sciforium en Hugging Face bajo el identificador `sciforium/Solon-1.0-Flash`. El repositorio declara la arquitectura `qwen3_5` y está etiquetado con los pipelines `feature-extraction` y `transformers`, además de una serie de tags propios del autor que apuntan a un uso como "decision-index" o "decision-model" y a la noción de "system-one". El modelo cuenta con 25.624.600.064 parámetros según los pesos en safetensors, lo que lo sitúa en la franja de los 25.000 millones de parámetros, y el repositorio ocupa 51,3 GB.

La relevancia de esta ficha es limitada en términos de información verificable: no se dispone de model card detallada, licencia declarada, idiomas soportados ni resultados de benchmarks en la documentación accesible. El acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos. El pipeline declarado es `feature-extraction`, lo que sugiere un uso orientado a la extracción de representaciones o embeddings más que a la generación de texto pura, aunque la familia Qwen a la que parece remitirse la arquitectura es habitualmente generativa.

En el momento de redactar esta ficha, el modelo acumula 1 descarga y 0 likes, y fue creado el 3 de noviembre de 2026 y actualizado el 19 de noviembre de 2026. Dada la escasez de documentación oficial, muchos apartados de esta ficha se marcan explícitamente como "no disponible" para no inventar datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag del repositorio); transformer, detalles no disponibles |
| Parametros totales | 25.624.600.064 (~25,6 mil millones) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline declarado | feature-extraction |
| Tamano del repositorio | 51,3 GB |
| Acceso | restringido (gated) |
| Tags adicionales | decision-index, decision-model, system-one, sglang, qwen, jev, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen3_5`, lo que indica que el modelo se apoya en la familia Qwen 3.5, si bien el repositorio no incluye una model card que detalle la configuración exacta (número de capas, dimensiones ocultas, mecanismo de atención, uso de atención lineal o híbrida, etc.). El tamaño de 25,6 mil millones de parámetros y los 51,3 GB en safetensors son coherentes con pesos en precisión bf16/fp16 (2 bytes por parámetro), sin que se haya publicado información sobre cuantizaciones alternativas.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento, ni sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, MoE, etc.). Los tags "decision-index", "decision-model" y "system-one" sugieren una orientación hacia la toma de decisiones o la inferencia rápida de tipo "sistema 1", pero no se aporta documentación técnica que lo respalde. Tampoco se detalla el proceso de entrenamiento ni los datos utilizados.

## Capacidades

- Extracción de características (feature extraction), según el pipeline declarado en el repositorio.
- Posible uso como modelo de decisión o índice de decisión, a tenor de los tags "decision-index" y "decision-model"; no hay documentación que precise el mecanismo.
- Compatibilidad declarada con endpoints y con sglang, según los tags del repositorio.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles.
- Generación de texto: no confirmada explícitamente pese a la familia Qwen; el pipeline declarado es feature-extraction.

## Casos de uso

- Extracción de embeddings para sistemas de recuperación (RAG): dado el pipeline `feature-extraction`, el modelo podría emplearse para generar representaciones vectoriales de documentos y consultas en un pipeline de búsqueda semántica, aunque no se ha publicado información sobre la dimensionalidad de los embeddings ni sobre su rendimiento en tareas de retrieval.
- Indexación semántica a gran escala: por su tamaño de 25,6 mil millones de parámetros, podría emplearse como encoder de alta capacidad en sistemas de búsqueda, siempre que se valide su calidad con datos propios, ya que no hay benchmarks publicados.
- Clasificación y filtrado de contenido: si el modelo funciona como extractor de características, podría servir como base para clasificadores posteriores (spam, moderación, routing de tickets), pero requeriría fine-tuning y validación empírica.
- Investigación sobre modelos de decisión: los tags "decision-model" y "system-one" sugieren un posible interés en experimentación con arquitecturas de decisión rápida; su uso sería principalmente exploratorio en entornos de investigación.
- Despliegue en infraestructuras compatibles con sglang: el tag `sglang` indica que el autor prevé su uso con ese motor de inferencia, lo que facilitaría su integración en stacks que ya utilicen SGLang para servir modelos.
- Evaluación comparativa interna: como modelo de 25,6 mil millones de parámetros, puede emplearse como baseline en experimentos internos frente a otros modelos de tamaño similar, siempre que se acepten las condiciones de acceso restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 25,6 mil millones de parámetros en bf16/fp16, se requieren aproximadamente 51 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, del orden de 60-70 GB de VRAM para inferencia sin cuantizar.
- En cuantización de 8 bits, la estimación rondaría los 26 GB de pesos; en 4 bits, unos 13 GB, si bien no se han publicado cuantizaciones oficiales (no disponibles).
- GPU recomendadas: para precisión completa, GPU con 80 GB (A100 80GB, H100 80GB) o múltiples GPU de 24-48 GB. Para cuantización 4/8 bits, podría caber en una RTX 4090 (24 GB) o A6000 (48 GB), sujeto a validación.
- Cabe en GPU de consumo únicamente en cuantizaciones agresivas; no hay datos oficiales de cuantización publicados.
- Opciones de despliegue: transformers (declarado), sglang (tag del repositorio), endpoints compatibles (tag `endpoints_compatible`); no se ha confirmado soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sciforium/Solon-1.0-Flash | ~25,6 B | no disponible | no disponible | gated |
| Qwen2.5-32B | ~32,5 B | 128K (según versión) | Apache 2.0 (versiones abiertas) | abierta |
| Gemma 2 27B | ~27 B | 8K | Gemma Terms | abierta con condiciones |
| Mistral Large / Mistral-Small (24B) | ~24 B (Small) | 128K (Small) | Apache 2.0 (Small) | abierta |

La comparación se ofrece a título orientativo por rango de parámetros; no se dispone de datos de rendimiento de Solon-1.0-Flash que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan datos de entrenamiento, sesgos, idiomas ni limitaciones específicas.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar las condiciones antes de cualquier despliegue en producción.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción a la evaluación y reproducibilidad.
- Riesgo de alucinación y sesgos: desconocido por falta de documentación y de evaluaciones publicadas.
- Contexto e idiomas: no disponibles; no se puede garantizar el soporte de ventanas largas ni de castellano.
- Pipeline declarado como feature-extraction: no está confirmado que el modelo genere texto de forma fiable; conviene validar su comportamiento antes de usarlo como generador.
- Popularidad muy baja (1 descarga, 0 likes) y escasa trazabilidad: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- El tag `qwen3_5` apunta a una familia de modelos de la que no se ha publicado información oficial en la documentación accesible; la correspondencia exacta con Qwen 3.5 no está confirmada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sciforium/Solon-1.0-Flash
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
