# s-ryoma/calm-otter

## Resumen

Calm-otter es un modelo publicado en Hugging Face por el usuario s-ryoma bajo el identificador `s-ryoma/calm-otter`. Se distribuye con la librería transformers y pesos en formato safetensors, y su pipeline declarado es `feature-extraction`, lo que indica que está pensado para producir representaciones vectoriales más que para generación de texto libre. La etiqueta `llada` sugiere que se apoya en la familia de modelos de difusión para lenguaje LLaDA, aunque no se dispone de documentación que lo confirme.

El modelo tiene 8.015.581.184 parámetros (aproximadamente 8.000 millones) según los metadatos de los pesos en safetensors, con un repositorio de 16 GB. Incorpora código personalizado (`custom_code`), por lo que requiere `trust_remote_code=True` para cargarse con transformers. El acceso está restringido: es un repositorio gated que exige aceptar condiciones en Hugging Face antes de descargar los pesos.

La relevancia de esta ficha es limitada por la escasez de información pública: no hay licencia declarada, no se especifican idiomas, no hay benchmarks ni documentación de entrenamiento. Cualquier evaluación rigurosa exige solicitar acceso y examinar la model card una vez concedido. A fecha de esta ficha el modelo registra 0 descargas y 0 likes, lo que apunta a un lanzamiento muy reciente o a un uso interno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `llada`; probablemente transformer de difusión para lenguaje, sin confirmar) |
| Parámetros totales | 8.015.581.184 (aprox. 8,0 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos originales en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Librería | transformers (requiere `custom_code`) |
| Tamaño del repositorio | 16,0 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La etiqueta `llada` en los metadatos apunta a una posible relación con LLaDA (Large Language Diffusion with mAsking), un paradigma de modelado generativo por difusión discreta en lugar de autoregresivo, pero no hay confirmación oficial en la información disponible.

El pipeline declarado es `feature-extraction`, lo que resulta poco habitual para un modelo de 8.000 millones de parámetros y sugiere que se emplea como extractor de representaciones (embeddings) o como base para tareas posteriores. La presencia de `custom_code` implica que la implementación de la arquitectura no está en el núcleo de transformers y debe cargarse desde el repositorio, con el consiguiente riesgo de seguridad y de compatibilidad entre versiones.

## Capacidades

- Extracción de características y generación de embeddings a nivel de secuencia o de token, según el pipeline declarado.
- Posible generación de texto si la arquitectura LLaDA se confirma, aunque no está documentado.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Indexación semántica y búsqueda vectorial: usar el modelo como encoder para generar embeddings de documentos y consultas en un sistema RAG, siempre que se valide la calidad de las representaciones frente a encoders dedicados de menor tamaño.
- Clasificación de texto por similitud: calcular embeddings de textos etiquetados y entrenar un clasificador ligero encima, aprovechando la ventana de contexto (no documentada) para entradas largas.
- Clustering y análisis exploratorio de corpus: agrupar documentos por proximidad en el espacio de embeddings para descubrimiento de temas.
- Filtrado y deduplicación de datasets: detectar near-duplicates en corpus de entrenamiento comparando distancias coseno entre embeddings.
- Base para fine-tuning supervisado: partir de los pesos preentrenados y adaptar la cabeza de salida a una tarea concreta (NER, clasificación multietiqueta) si la licencia lo permite.
- Evaluación comparativa de encoders: incluir el modelo como baseline en estudios de representaciones frente a alternativas como BGE, E5 o GTE, dado su tamaño de 8 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 24 GB o más.
- VRAM estimada en int8: unos 8-9 GB de pesos, con margen adicional para activaciones.
- VRAM estimada en int4: unos 4-5 GB de pesos, aunque no se distribuyen cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16 con secuencias moderadas.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16 si la longitud de secuencia es contenida; en GPUs de 16 GB (RTX 4080, A4000) probablemente requiera cuantización.
- Despliegue: transformers con `trust_remote_code=True`; vLLM, TGI o llama.cpp solo si existe soporte para la arquitectura personalizada, no confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Pipeline | Acceso |
|---|---|---|---|---|---|
| s-ryoma/calm-otter | 8,0 B | no disponible | no disponible | feature-extraction | gated |
| Alternativas de embeddings de 7-8 B (p. ej. familia E5-mistral, GTE-Qwen2) | 7-8 B | 4k-32k según variante | MIT/Apache-2.0 en la mayoría | feature-extraction | abierto |
| Encoders pequeños (BGE-large, GTE-large) | 0,3-0,4 B | 512-8k | MIT/Apache-2.0 | feature-extraction | abierto |

La comparación es aproximada: no hay datos públicos de calm-otter que permitan contrastar calidad de embeddings, contexto efectivo ni licencia frente a estas alternativas, por lo que la elección frente a encoders consolidados exige una evaluación propia.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: sin licencia, idiomas, contexto ni detalles de entrenamiento, no es posible evaluar su idoneidad para producción.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que añade fricción y posibles restricciones de uso comercial no explicitadas.
- `custom_code`: la carga implica ejecutar código del repositorio; auditar antes de usar en entornos sensibles y fijar una revisión concreta.
- Riesgo de alucinación y sesgos: desconocido, al no haber documentación ni evaluaciones publicadas.
- Sin cuantizaciones oficiales ni soporte confirmado en motores de inferencia habituales (vLLM, llama.cpp), lo que complica el despliegue eficiente.
- Cero descargas y cero likes: sin validación comunitaria, la fiabilidad del modelo no está contrastada.
- El pipeline `feature-extraction` no garantiza calidad como generador aunque la arquitectura lo permita; conviene tratarlo como encoder hasta que se documente lo contrario.

## Enlaces

- Hugging Face: https://huggingface.co/s-ryoma/calm-otter
- Repositorio LLaDA (referencia por la etiqueta, no confirmada): https://github.com/ML-GSAI/LLaDA
- Paper LLaDA (referencia, no confirmada): https://arxiv.org/abs/2502.09992
