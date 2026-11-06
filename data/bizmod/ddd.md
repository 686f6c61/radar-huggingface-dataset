# bizmod/DDD

## Resumen

DDD es un modelo publicado en Hugging Face por el usuario bizmod bajo el identificador `bizmod/DDD`. Se distribuye con la librería transformers, en formato safetensors y con pesos cuantizados en 8 bits mediante la librería compressed-tensors. El pipeline declarado es `image-text-to-text`, lo que indica que el modelo acepta entradas multimodales de imagen y texto y genera texto como salida. La arquitectura declarada en los metadatos es `datlas_2_5`, un identificador que no corresponde a ninguna familia de modelos ampliamente documentada, y que requiere código personalizado (`custom_code`) para su carga.

El dato más llamativo es el tamaño: 2.779.931.837.184 parámetros totales según los safetensors, es decir, aproximadamente 2,78 billones de parámetros. El repositorio ocupa 1.561 GB en pesos de 8 bits, lo que es coherente con esa magnitud. Se trata, por tanto, de un modelo de escala extrema, muy por encima de los modelos abiertos más grandes conocidos, y no de un modelo desplegable en hardware convencional.

La ficha se elabora únicamente con la información disponible en los metadatos de Hugging Face. No hay información pública sobre datos de entrenamiento, benchmarks, idiomas soportados ni detalles de arquitectura más allá de las etiquetas. El acceso está restringido (gated) y la licencia es `datlas-2.5`, una licencia no estándar que debe revisarse antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | datlas_2_5 (identificador declarado en metadatos; requiere custom_code) |
| Parametros totales | 2.779.931.837.184 (≈2,78 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (compressed-tensors); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | datlas-2.5 (licencia personalizada, acceso gated) |
| Formato de pesos | safetensors (cuantizados en 8 bits) |

## Arquitectura y entrenamiento

Los metadatos indican la etiqueta `datlas_2_5` como arquitectura y la presencia de `custom_code`, lo que implica que el modelo no se carga con una clase estándar de transformers y depende de código incluido en el repositorio. También aparece la etiqueta `feature-extraction` junto a `image-text-to-text`, lo que sugiere que el modelo puede emplearse tanto para extracción de representaciones como para generación multimodal. No se dispone de información sobre el tipo de transformer, si es denso o mezcla de expertos, ni sobre mecanismos de atención o innovaciones técnicas concretas.

No hay datos públicos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras etapas de alineamiento, ni sobre el proceso de cuantización aplicado. El tamaño del repositorio (1.561 GB) y la cuantización en 8 bits son los únicos indicios sobre el coste de almacenamiento y despliegue. Cualquier afirmación adicional sobre el entrenamiento sería especulativa y no se incluye.

## Capacidades

- Generación de texto a partir de entradas de imagen y texto, según el pipeline `image-text-to-text` declarado.
- Extracción de características o embeddings, según la etiqueta `feature-extraction`.
- Conversación multi-turno, según la etiqueta `conversational`.
- Capacidad multimodal de entrada de imagen (image-text-to-text); no se detalla si admite vídeo o audio.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Investigación sobre modelos a gran escala: el modelo permite estudiar comportamiento de modelos de billones de parámetros, aunque su despliegue requiere infraestructura de centro de datos y no es viable en entornos de desarrollo convencionales.
- Experimentación multimodal en laboratorio: con pipeline image-text-to-text, puede emplearse para tareas de descripción de imágenes o respuesta a preguntas visuales en entornos de investigación con clústeres de GPU.
- Extracción de embeddings para búsqueda multimodal: la etiqueta feature-extraction sugiere su uso para generar representaciones de imagen y texto en sistemas de recuperación, siempre que se valide la calidad de los embeddings.
- Evaluación comparativa de arquitecturas no estándar: al requerir custom_code, sirve para analizar implementaciones alternativas de transformers multimodales frente a arquitecturas de referencia.
- Estudio de cuantización a 8 bits a gran escala: el repositorio permite analizar el impacto de compressed-tensors en modelos de este tamaño, comparando precisión y uso de memoria.
- Docencia y divulgación sobre límites prácticos del open source: el caso ilustra las restricciones reales de almacenamiento (1.561 GB) y cómputo de los modelos de escala extrema, útil en formación de ingeniería de ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Con 2,78 billones de parámetros en 8 bits, el peso de los parámetros ronda 1,5 TB, por lo que la inferencia requiere agregar memoria de varias GPUs o nodos.
- GPU recomendadas: no hay recomendación oficial. Por escala, solo tiene sentido en clústeres con GPUs de centro de datos (A100, H100 u equivalentes) y paralelismo tensorial multi-nodo.
- Cabe en GPU de consumo: no. Ni siquiera en configuraciones multi-GPU de consumo.
- Opciones de despliegue: transformers con custom_code y compressed-tensors; no hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos abiertos comparables por tamaño (billones de parámetros) ni por la arquitectura `datlas_2_5`, y los metadatos no permiten establecer comparaciones fiables con familias conocidas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia personalizada `datlas-2.5`: es imprescindible revisar sus términos antes de cualquier uso comercial o redistribución; no se trata de una licencia OSI estándar.
- Requiere custom_code: la carga no es posible con clases estándar de transformers, lo que añade riesgo de seguridad y de mantenimiento.
- Tamaño extremo: 1.561 GB de repositorio y ~2,78 billones de parámetros hacen inviable el despliegue fuera de infraestructura de centro de datos.
- Idiomas soportados no documentados: no puede asumirse un rendimiento multilingüe sin evaluación previa.
- Sin benchmarks publicados: no hay evidencia verificable de calidad, por lo que no debe asumirse un rendimiento concreto en producción.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Longitud de contexto desconocida: limita el diseño de aplicaciones que dependan de ventanas largas.
- Popularidad muy baja (31 descargas, 0 likes) y autor sin historial verificable en la información proporcionada: conviene tratar el modelo con cautela y validarlo de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/bizmod/DDD
