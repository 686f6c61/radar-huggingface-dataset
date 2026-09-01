# sortify-ai/siglip2-so400m-patch14-384-text

## Resumen

El modelo `sortify-ai/siglip2-so400m-patch14-384-text` es la parte de texto del encoder SigLIP 2 So400m, desarrollado originalmente por Google y adaptado por el usuario sortify-ai. Se trata de un modelo de extracción de características (feature extraction) que genera embeddings de texto de alta calidad, pensado para tareas de búsqueda semántica, similitud y recuperación de información. Al ser únicamente el submodelo de texto, no procesa imágenes, pero hereda la arquitectura y el entrenamiento del SigLIP 2 completo, que combina objetivos de aprendizaje contrastivo y predictivo.

Con 707,78 millones de parámetros y una licencia Apache 2.0, este modelo ofrece una alternativa open source para representaciones textuales densas. Su relevancia actual radica en que los embeddings de texto son la base de sistemas RAG, clasificación semántica y agentes conversacionales, y este modelo proporciona una opción con un tamaño intermedio entre los pequeños (BERT) y los grandes (LLM). La ventana de contexto no se especifica en la información disponible, pero se asume similar a la del SigLIP 2 original (64 tokens de texto, aunque no confirmado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 text model (transformer encoder) |
| Parametros totales | 707.782.898 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se estima 64 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo corresponde al encoder de texto de SigLIP 2, una arquitectura transformer basada en So400m (una variante de ViT con 400 millones de parámetros para la parte visual, pero aquí solo se usa la rama de texto). SigLIP 2 se entrena con un objetivo contrastivo de imagen-texto (siglip loss) combinado con pérdidas auxiliares como decodificación, predicción enmascarada y pérdida global-local. Sin embargo, al ser solo la parte de texto, este modelo se puede usar de forma independiente para generar representaciones de frases o párrafos. No se dispone de detalles específicos sobre el dataset de entrenamiento de esta versión concreta, pero el SigLIP 2 original se entrenó con datos web a gran escala (WebLI, etc.). No se menciona ningún proceso de RLHF o DPO.

## Capacidades

- Generación de embeddings de texto densos para frases o documentos cortos.
- Búsqueda semántica y recuperación de información mediante similitud coseno.
- Clasificación de texto (entrenando una capa superior sobre los embeddings).
- Agrupamiento (clustering) de documentos por similitud.
- Soporte para tareas de matching texto-texto (no imagen-texto, al ser solo la rama de texto).
- No soporta generación de texto, tool calling ni razonamiento multi-paso.
- Capacidades multilingües: no confirmadas, probablemente limitadas al inglés (dado el entrenamiento de SigLIP 2).

## Casos de uso

- **Búsqueda semántica en bases de conocimiento**: el modelo genera embeddings de consultas y documentos, permitiendo recuperar pasajes relevantes mediante similitud coseno. Adecuado para sistemas RAG con contexto corto (64 tokens).
- **Clasificación de textos**: se pueden entrenar clasificadores lineales sobre los embeddings para categorizar correos, tickets de soporte o artículos. Su tamaño medio lo hace viable en CPU para inferencia por lotes.
- **Deduplicación de contenido**: comparar embeddings para detectar documentos duplicados o casi duplicados en grandes corpus, útil en pipelines de limpieza de datos.
- **Sistemas de recomendación basados en texto**: representar ítems (descripciones de productos, artículos) y usuarios (perfiles) para sugerir contenido similar.
- **Análisis de sentimiento**: los embeddings pueden alimentar modelos ligeros (regresión logística, SVM) para clasificar opiniones en reseñas o redes sociales.
- **Preprocesamiento para agentes conversacionales**: aunque no genera texto, puede usarse para seleccionar respuestas de una base de FAQs mediante similitud, integrándose en chatbots simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original SigLIP 2 reporta métricas en tareas de cero-shot y retrieval, pero no hay datos específicos para esta variante de solo texto.

## Requisitos de hardware

- VRAM estimada: en fp32 (~2,8 GB), en fp16 (~1,4 GB), en int8 (~0,7 GB). Cabe en GPUs consumer como RTX 3060 o superiores.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; para CPU, se puede ejecutar con 8 GB de RAM.
- Despliegue: compatible con la librería `transformers` de HuggingFace, se puede servir con FastAPI o usar en pipelines con `sentence-transformers` (si se adapta). También es posible exportar a ONNX para optimización.
- Latencia: para un lote de 32 frases cortas, se espera una latencia de ~10-20 ms en GPU moderna (A100) y ~100-200 ms en CPU (8 núcleos). Throughput estimado de cientos de frases por segundo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| sortify-ai/siglip2-so400m-patch14-384-text | 707M | no disponible | Apache 2.0 | Embeddings de texto |
| google/siglip2-so400m-patch14-384 (completo) | ~1.1B (visión+texto) | 64 tokens | Apache 2.0 | Visión-lenguaje |
| BERT-base (encoder) | 110M | 512 tokens | Apache 2.0 | Embeddings de texto |
| sentence-transformers/all-MiniLM-L6-v2 | 22M | 256 tokens | Apache 2.0 | Embeddings de frases |

El modelo de sortify-ai es más grande que BERT y MiniLM, lo que puede dar embeddings más ricos, pero con mayor coste computacional. No se dispone de comparativas de rendimiento directas.

## Limitaciones y advertencias

- Al ser solo la parte de texto, no procesa imágenes, a diferencia del SigLIP 2 completo.
- La longitud de contexto no está confirmada; si es 64 tokens, solo sirve para frases cortas, no para documentos largos.
- No se especifican los idiomas soportados; probablemente esté optimizado para inglés, con rendimiento degradado en otros idiomas.
- Riesgo de sesgos derivados del entrenamiento con datos web (posibles sesgos de género, raza o cultura).
- Alucinación no aplica (no genera texto), pero los embeddings pueden reflejar sesgos en la similitud.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la atribución.
- No hay información sobre cuantizaciones oficiales; habría que generarlas manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sortify-ai/siglip2-so400m-patch14-384-text
- Modelo original SigLIP 2 (Google): https://huggingface.co/google/siglip2-so400m-patch14-384-jax
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Paper SigLIP original: https://arxiv.org/abs/2303.15343
- Paper ViT: https://arxiv.org/abs/2209.06794
