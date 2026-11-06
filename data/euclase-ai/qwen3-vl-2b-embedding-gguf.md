# euclase-ai/qwen3-vl-2b-embedding-gguf

## Resumen

Qwen3-VL-Embedding-2B (Euclase GGUF) es una conversión a formato GGUF del modelo multimodal de embeddings Qwen3-VL-Embedding-2B desarrollado originalmente por el equipo Qwen. El modelo original es un transformer multimodal de aproximadamente 1.720 millones de parámetros que proyecta pares imagen-texto y vídeo-texto a un espacio vectorial común de 2048 dimensiones, pensado para tareas de recuperación semántica (retrieval) y búsqueda multimodal. Esta versión concreta ha sido generada por el usuario euclase-ai mediante `convert_hf_to_gguf.py` de llama.cpp y cuantizada a Q8_0 en los pesos del modelo de lenguaje, manteniendo el proyector visual en F16.

La relevancia de esta conversión radica en que permite ejecutar un modelo de embeddings multimodal de 2B en entornos locales con llama.cpp, sin necesidad de infraestructura GPU dedicada. Está orientada específicamente a indexación y búsqueda semántica de material audiovisual dentro de la aplicación Euclase, que consume vectores normalizados de 2048 dimensiones. No se trata de un modelo conversacional ni de captioning: es exclusivamente un extractor de embeddings.

No se dispone de información sobre la longitud de contexto, los idiomas soportados ni el proceso de entrenamiento del modelo original en la documentación proporcionada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una conversión reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) para embeddings; conversión GGUF de Qwen3-VL-Embedding-2B |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (pesos del modelo de lenguaje) + F16 (proyector visual) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: modelo principal Q8_0 y mmproj F16) |
| Dimension del embedding | 2048 (vectores normalizados para retrieval) |
| Revision upstream | 9f2f7e710d6d81056aa5c0a4f04764fec6bb7bda |
| Herramientas de conversion | llama.cpp `convert_hf_to_gguf.py` y `llama-quantize` |
| Version validada | llama.cpp b12119 |
| Tamano del repo | 2,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-VL-Embedding-2B, un transformer multimodal que combina un codificador visual con un modelo de lenguaje y produce representaciones vectoriales conjuntas para texto, imagen y vídeo. El modelo emplea pooling y un formato de consulta (query formatting) específicos que deben respetarse en la inferencia para obtener embeddings comparables; la model card advierte explícitamente que una inferencia compatible debe usar el pooling, el formateo de consulta y el preprocesado multimodal del checkpoint de embeddings.

Esta conversión concreta no introduce entrenamiento adicional: euclase-ai se limita a convertir los pesos originales a GGUF y a cuantizar el modelo de lenguaje a Q8_0, dejando el proyector visual en F16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original empleó RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la propia naturaleza multimodal del encoder.

## Capacidades

- Generación de embeddings multimodales: produce vectores de 2048 dimensiones normalizados para texto, imagen y vídeo.
- Recuperación imagen-texto: permite búsqueda semántica cruzada entre consultas textuales y contenido visual.
- Recuperación vídeo-texto: indexación y búsqueda sobre material de vídeo, según la model card de Euclase.
- Extracción de características (feature extraction): el pipeline declarado es `feature-extraction` e `image-text-to-text`.
- Integración con llama.cpp: compatible con el runtime nativo de visión de Euclase y validado con llama.cpp b12119.
- No soporta tool calling ni function calling (no es un modelo generativo conversacional).
- No soporta agentes ni razonamiento multi-paso.
- No analiza audio, según se indica explícitamente en la model card.
- Capacidades multilingües: no disponible.

## Casos de uso

- Búsqueda semántica de material audiovisual en local: el modelo genera embeddings de 2048 dimensiones que permiten indexar y recuperar fragmentos de vídeo o imágenes a partir de consultas en lenguaje natural, sin salir del dispositivo. Es el caso de uso principal declarado por el autor (Euclase).
- Indexación de archivos de vídeo para postproducción: un editor puede indexar un archivo de footage y localizar planos por descripción textual ("primer plano de una calle lluviosa") usando los vectores normalizados del modelo.
- Deduplicación y clustering de imágenes: al proyectar imágenes a un espacio vectorial común, se pueden agrupar fotos similares o detectar duplicados en bibliotecas grandes mediante similitud coseno sobre los vectores de 2048 dimensiones.
- Sistemas de recomendación visual: comparar la similitud entre el contenido visual de un catálogo y las preferencias textuales del usuario para generar recomendaciones.
- Moderación y clasificación de contenido visual: usar los embeddings como entrada a clasificadores ligeros para etiquetar o filtrar imágenes y vídeos por similitud con conjuntos de referencia.
- Búsqueda multimodal en bases de datos de investigación: indexar corpus de imágenes científicas o médicas (con las cautelas oportunas) y recuperarlas mediante consultas textuales, aprovechando la ejecución local vía llama.cpp.
- Construcción de RAG multimodal: combinar los embeddings visuales con un almacén vectorial para que un sistema RAG recupere imágenes o fotogramas relevantes junto a fragmentos de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero principal Q8_0 ocupa 1.834.427.648 bytes (~1,83 GB) y el proyector visual F16 ocupa 819.394.624 bytes (~0,82 GB); en total ~2,65 GB de pesos, más overhead de contexto y buffers de inferencia.
- GPU recomendadas: no disponible en la documentación; por tamaño, cualquier GPU con al menos 4 GB de VRAM libre debería poder alojar los pesos, aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, por el tamaño de los pesos (inferior a 3 GB), aunque no se documentan requisitos oficiales ni GPUs validadas.
- Opciones de despliegue: llama.cpp (validado con la versión b12119) y el runtime nativo de visión de Euclase. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| euclase-ai/qwen3-vl-2b-embedding-gguf | 1,72 B | No disponible | Imagen, vídeo, texto | Apache 2.0 | GGUF (Q8_0 + F16 mmproj) | Conversión comunitaria, 0 descargas |
| Qwen/Qwen3-VL-Embedding-2B | 1,72 B | No disponible | Imagen, vídeo, texto | Apache 2.0 | Safetensors (upstream) | Modelo original del equipo Qwen |
| Otros modelos de embeddings multimodales de ~2B | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento, contexto o benchmarks con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de chat ni de captioning: la model card indica explícitamente que el checkpoint de embeddings no debe usarse como modelo conversacional ni para generar descripciones.
- No analiza audio: el procesamiento se limita a imagen, vídeo y texto.
- Requiere ambos ficheros: el modelo principal Q8_0 y el proyector `mmproj` F16 son necesarios para generar embeddings de imagen y vídeo.
- Dependencia del pooling y formateo de consulta: usar un pooling o un formato de consulta distintos de los del checkpoint original produce embeddings no comparables.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir recuperaciones semánticamente erróneas en dominios muy alejados de los datos de entrenamiento del modelo original.
- Sesgos: no disponibles; al no documentarse la composición del dataset de entrenamiento, no se pueden evaluar sesgos de dominio, idioma o demografía.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad en consultas en castellano.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y la atribución al modelo original de Qwen; la conversión GGUF es una modificación de terceros sin garantías del autor original.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; no hay evidencia de uso en producción ni de validación independiente.
- Cuantización Q8_0: introduce una pérdida de precisión respecto a los pesos originales en safetensors, no cuantificada en la documentación.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/euclase-ai/qwen3-vl-2b-embedding-gguf
- Modelo original: https://huggingface.co/Qwen/Qwen3-VL-Embedding-2B/tree/9f2f7e710d6d81056aa5c0a4f04764fec6bb7bda
- llama.cpp (herramienta de conversión y runtime): no se proporciona enlace en la información disponible
- Aplicación Euclase: no se proporciona enlace en la información disponible
