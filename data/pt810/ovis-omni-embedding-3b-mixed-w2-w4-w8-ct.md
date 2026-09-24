# pt810/Ovis-Omni-Embedding-3B-mixed-w2-w4-w8-ct

## Resumen

Ovis-Omni-Embedding-3B-mixed-w2-w4-w8-ct es un artefacto experimental publicado por el usuario pt810 que consiste en una conversión cuantizada del modelo ATH-MaaS/Ovis-Omni-Embedding-3B. No se trata de un entrenamiento nuevo ni de un ajuste fino, sino de una compresión de pesos del modelo original mediante la librería compressed-tensors, aplicando cuantización RTN (round-to-nearest) sin calibración de precisión. El resultado es un checkpoint orientado a servir embeddings a través del backend compressed-tensors de vLLM.

El modelo se apoya en la familia Qwen2.5-Omni, de la que hereda los bloques transformer del modelo de lenguaje, las torres multimodales de audio y visión y los pesos auxiliares de talker y token2wav. La conversión aplica compresión únicamente a los bloques transformer del LM, con una mezcla de precisiones por capas: las capas 0 a 13 en W2A16, las capas 14 a 26 en W4A16 y la capa 27 en W8A16. Las torres multimodales y los pesos auxiliares se conservan en BF16.

Su relevancia es fundamentalmente práctica y de nicho: demuestra que es posible ejecutar un modelo de embeddings multimodales de aproximadamente 3B parámetros en una GPU de portátil con 8 GB de VRAM, en concreto una RTX 3080 Laptop, usando vLLM 0.30.0. Sin embargo, al no estar calibrado y al emplear precisiones de 2 y 4 bits en la mayor parte de las capas, se trata de un artefacto de validación técnica más que de un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen2.5-Omni) con torres de audio y visión, cabezas auxiliares talker/token2wav y pooler de embeddings |
| Parametros totales | 2890 (dato de los metadatos de safetensors; la unidad no se especifica en la información disponible. El nombre del repositorio indica 3B, lo que sugiere 2,89 mil millones) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible (la prueba del autor se ejecutó con `--max-model-len 256`, valor de configuración del servicio, no necesariamente el máximo del modelo) |
| Tipos de cuantizacion | Pesos del LM: W2A16 (capas 0-13), W4A16 (capas 14-26), W8A16 (capa 27). Torres multimodales y pesos auxiliares en BF16. Activaciones en 16 bits. Cuantización RTN sin calibración |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor remite a la licencia del modelo original) |
| Formato de pesos | safetensors con esquema compressed-tensors (no GPTQ) |
| Autor | pt810 |
| Pipeline declarado | text-to-audio |
| Dimensión de embedding | 2048 (vector normalizado devuelto por `/v1/embeddings`); el autor indica que se puede configurar un pooler de 1024 dimensiones en el wrapper de servicio |
| Tamaño del repositorio | 7,7 GB |
| Compatibilidad | vLLM 0.30.0 con backend compressed-tensors, `--runner pooling` y `--convert embed` |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-23 / 2026-09-23 |

## Arquitectura y entrenamiento

El modelo parte de Ovis-Omni-Embedding-3B, un modelo de embeddings construido sobre la arquitectura Qwen2.5-Omni. Esta arquitectura combina un transformer de lenguaje con torres específicas para procesar audio y visión, además de componentes auxiliares de generación de habla (talker y token2wav) presentes en la familia Omni. Para la función de embeddings, el modelo emplea un pooler que proyecta las representaciones internas a un vector de dimensión fija; en este artefacto, la prueba del autor devuelve vectores normalizados de 2048 dimensiones con el pooler por defecto.

No ha habido entrenamiento ni ajuste adicional: la operación realizada es exclusivamente de compresión de pesos. El autor aplica cuantización RTN (redondeo al valor representable más cercano) capa por capa sobre los bloques transformer del modelo de lenguaje, con una política mixta que concentra la mayor agresividad en las capas bajas. Las capas 0 a 13 se comprimen a 2 bits, las capas 14 a 26 a 4 bits y la capa 27 a 8 bits, todas con activaciones en 16 bits y sin grupo de calibración basado en datos. Las torres de audio y visión y los pesos auxiliares se mantienen en BF16, presumiblemente para preservar la calidad de las representaciones multimodales. No se documentan detalles sobre el dataset de entrenamiento original, el número de tokens, ni si hubo fases de RLHF o DPO en el modelo de partida.

## Capacidades

- Generación de embeddings de texto, con salida de vectores normalizados de 2048 dimensiones a través del endpoint `/v1/embeddings` de vLLM.
- Procesamiento multimodal: el artefacto conserva en BF16 las torres de audio y visión del modelo original, por lo que el pipeline subyacente es capaz de codificar entradas de audio e imagen además de texto.
- Integración con el backend compressed-tensors de vLLM mediante `--runner pooling --convert embed`, lo que permite exponerlo como servicio compatible con la API de endpoints.
- Compatibilidad declarada con la etiqueta `endpoints_compatible`, orientada a despliegues servidos.
- Conservación de los pesos auxiliares talker y token2wav en BF16, aunque no se documenta ni se verifica su funcionamiento en este artefacto.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No hay información sobre capacidades multilingües concretas.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar manuales y generar embeddings de consultas con el pooler de 2048 dimensiones para recuperar fragmentos relevantes. Es adecuado cuando se necesita un modelo multimodal que además pueda indexar contenido audiovisual, aunque la falta de calibración obliga a validar la calidad de recuperación antes de usarlo.
- Recuperación multimodal en archivos de audio y vídeo: gracias a las torres de audio y visión conservadas en BF16, el modelo puede proyectar transcripciones, clips de audio e imágenes al mismo espacio vectorial, lo que habilita búsquedas cruzadas entre modalidades.
- Construcción de pipelines RAG: como generador de embeddings dentro de un sistema de recuperación aumentada, sirviendo los vectores desde vLLM y almacenándolos en una base vectorial. El modelo encaja por su integración nativa con vLLM y su bajo consumo de VRAM.
- Clustering y deduplicación de corpus: agrupar documentos, imágenes o segmentos de audio por similitud coseno para eliminar duplicados o organizar grandes colecciones sin etiquetas.
- Clasificación y enrutamiento de tickets de soporte: usar los embeddings como características de entrada para un clasificador ligero que dirija incidencias al equipo correspondiente, incluyendo casos donde el ticket venga acompañado de audio o capturas.
- Reranking en sistemas de recuperación: recalcular la similitud entre consulta y candidatos recuperados en una primera fase para reordenar resultados, aprovechando la normalización de los vectores de salida.
- Recomendación basada en contenido: calcular similitud entre ítems multimodales (por ejemplo, episodios de audio o imágenes de catálogo) para sugerir contenido relacionado sin necesidad de historial de interacción.
- Prototipado en hardware limitado: validar arquitecturas de embeddings multimodales en una GPU de portátil de 8 GB, tal como hizo el propio autor, antes de escalar a un modelo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta una prueba funcional de servicio con vLLM 0.30.0 sobre una RTX 3080 Laptop, en la que el endpoint `/v1/embeddings` devolvió un vector normalizado de 2048 dimensiones, sin métricas de calidad (MTEB, MMLU, recuperación, etc.) ni comparaciones con el modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 7,7 GB en disco, pero la mayor parte de los pesos del LM está comprimida a 2 y 4 bits. El autor reporta ejecución correcta con `--gpu-memory-utilization 0.75` en una GPU de 8 GB, lo que sitúa el pico de memoria por debajo de aproximadamente 6 GB. Es una estimación derivada de la configuración de prueba, no una medición publicada.
- GPU verificada: NVIDIA RTX 3080 Laptop GPU con 8 GB de VRAM.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM debería ser suficiente, incluidas RTX 3060 de 12 GB, RTX 3070, RTX 3080, RTX 4060 Ti y superiores. Aceleradores como A100 o H100 son compatibles con vLLM pero resultan sobredimensionados para este tamaño.
- Cabe en GPU de consumo: sí, según la prueba del autor en una GPU de portátil de 8 GB.
- Opciones de despliegue: vLLM 0.30.0 con backend compressed-tensors, usando `--runner pooling --convert embed`. El comando documentado es `vllm serve . --runner pooling --convert embed --max-model-len 256 --gpu-memory-utilization 0.75 --enforce-eager`. No se ha verificado el funcionamiento con llama.cpp, Ollama ni TGI, y el formato compressed-tensors limita en la práctica las alternativas de servidor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pt810/Ovis-Omni-Embedding-3B-mixed-w2-w4-w8-ct | 2890 (según safetensors) | no disponible | Mixta W2/W4/W8 + BF16 en torres | no disponible | HuggingFace, 0 descargas |
| ATH-MaaS/Ovis-Omni-Embedding-3B (modelo original) | no disponible | no disponible | BF16 sin comprimir (presumiblemente) | no disponible (debe consultarse en su model card) | HuggingFace |
| Otros modelos de embeddings de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. La comparación relevante es con el modelo original del que deriva, respecto al cual este artefacto reduce el peso a costa de introducir error de cuantización no calibrado.

## Limitaciones y advertencias

- Artefacto experimental: el propio autor lo etiqueta como experimental y no calibrado en precisión.
- Cuantización agresiva sin calibración: los bloques del LM usan RTN sin datos de calibración, con 14 capas a 2 bits. Es esperable una degradación significativa de la calidad de los embeddings frente al modelo original, aunque no se publican métricas que la cuantifiquen.
- No es un checkpoint GPTQ: no debe asumirse compatibilidad con flujos de trabajo diseñados para GPTQ.
- Licencia no especificada: la model card no declara licencia y remite a la del modelo original. Antes de cualquier uso comercial es imprescindible verificar la licencia de ATH-MaaS/Ovis-Omni-Embedding-3B y de Qwen2.5-Omni.
- Idiomas no documentados: no hay información sobre cobertura lingüística ni sobre posibles sesgos asociados.
- Contexto de servicio muy corto en la prueba: el autor ejecutó vLLM con `--max-model-len 256`, lo que limita la longitud de entrada efectiva en esa configuración y es insuficiente para casos de uso con documentos largos.
- Dimensión de embedding configurable pero no resuelta: el pooler por defecto devuelve 2048 dimensiones, y el autor indica que hay que configurar un pooler de 1024 dimensiones en el wrapper de servicio si se necesita esa dimensión, lo que añade trabajo de integración.
- Riesgo de alucinación: no aplica de forma directa al ser un modelo de embeddings, pero los vectores degradados pueden producir recuperaciones semánticamente incorrectas o falsos positivos en similitud.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Dependencia de versión: probado únicamente con vLLM 0.30.0; cambios en el backend compressed-tensors podrían romper la compatibilidad.
- Sin benchmarks: no hay evidencia publicada de calidad en tareas de recuperación, clasificación o clustering.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pt810/Ovis-Omni-Embedding-3B-mixed-w2-w4-w8-ct
- Modelo original (referenciado en la model card): https://huggingface.co/ATH-MaaS/Ovis-Omni-Embedding-3B

Nota: la búsqueda web asociada no devolvió resultados relevantes para este modelo; los enlaces obtenidos correspondían a sitios de fuentes tipográficas, foros y redes sociales sin relación con Ovis ni con embeddings multimodales, por lo que se han omitido.
