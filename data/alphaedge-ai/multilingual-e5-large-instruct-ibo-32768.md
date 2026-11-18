# alphaedge-ai/multilingual-e5-large-instruct-ibo-32768

## Resumen

`multilingual-e5-large-instruct-ibo-32768` es un modelo de embeddings de frases (sentence-similarity) derivado de `intfloat/multilingual-e5-large-instruct` mediante la técnica de *trimming* de vocabulario, especializado en la lengua igbo (código ISO `ig`). Lo publica el usuario `alphaedge-ai` y reduce el vocabulario original de 250.037 tokens a 32.768, lo que recorta el número de parámetros un 39,73% (de 559.890.432 a 337.442.816) y el peso del repositorio hasta unos 0,7 GB. El objetivo es abaratar el despliegue de búsqueda semántica y recuperación de información en igbo sin renunciar a la calidad del modelo original en ese idioma.

La arquitectura subyacente es XLM-RoBERTa (transformer encoder), heredada del modelo base de Microsoft, y el modelo se distribuye en formato safetensors compatible con `sentence-transformers` y con Text Embeddings Inference (TEI). La reducción de vocabulario se calculó minando 95.184 textos del dataset `lbourdois/fineweb-2-trimming`, de modo que los tokens eliminados son los que no aparecen en corpus igbo y los conservados cubren la práctica totalidad del texto de ese idioma.

Es relevante ahora porque el *trimming* permite ejecutar embeddings multilingües de calidad en hardware modesto y para idiomas de bajos recursos: el modelo ocupa menos de 1 GB, admite despliegue en CPU con TEI o sentence-transformers y mantiene la semántica del E5-large original para igbo. La contrapartida es que ha perdido buena parte de su cobertura multilingüe y no debe usarse para otros idiomas sin evaluarlo antes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder), heredada de intfloat/multilingual-e5-large-instruct |
| Parametros totales | 337.442.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el nombre del modelo hace referencia a un vocabulario de 32.768 tokens, no a la ventana de contexto) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors sin cuantizar; admite cuantizacion posterior con herramientas estándar) |
| Idiomas soportados | igbo (`ig`) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con sentence-transformers y Text Embeddings Inference) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer XLM-RoBERTa de 24 capas y dimensión oculta 1.024, con el vocabulario reducido a 32.768 entradas. No se ha reentrenado: los pesos proceden del modelo base `intfloat/multilingual-e5-large-instruct`, que a su vez se entrenó con objetivos de contraste y ajuste por instrucciones sobre pares query-documento multilingües. La modificación consiste exclusivamente en recortar la matriz de embeddings y la capa de salida del vocabulario original (250.037 tokens) a los 32.768 tokens más frecuentes en igbo, eliminando las filas correspondientes del resto de idiomas.

El proceso de selección de tokens se hizo minando 95.184 textos del dataset `lbourdois/fineweb-2-trimming`, un subconjunto de FineWeb-2 filtrado por idioma. No se realizó un fine-tuning posterior sobre igbo según la model card; el autor afirma que el modelo recortado "debería comportarse de forma similar al original" con solo 32.768 tokens y una huella de memoria mucho menor, aunque advierte que puede rendir peor en otros idiomas. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal, ya que es un modelo de embeddings, no generativo.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información (retrieval) en igbo.
- Codificación separada de consultas (`encode_query`) y documentos (`encode_document`), siguiendo la convención del modelo E5 original.
- Búsqueda semántica y ranking de documentos mediante similitud coseno.
- Agrupamiento (clustering) y deduplicación de textos en igbo.
- Clasificación de textos por similitud con prototipos o etiquetas.
- No soporta tool calling ni function calling: es un modelo de embeddings, no de chat.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe muy limitada: el vocabulario se ha recortado para igbo y el rendimiento en otros idiomas puede degradarse.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Búsqueda semántica en igbo: indexar documentos en igbo con `encode_document` y consultar con `encode_query` para recuperar los fragmentos más relevantes; el modelo está afinado para ese par query-documento y ocupa menos de 1 GB.
- Motor de preguntas y respuestas sobre corpus igbo (RAG): usar los embeddings para recuperar pasajes de una base documental antes de pasarlos a un LLM generativo; el recorte de vocabulario reduce el coste de indexación y almacenamiento.
- Deduplicación de datasets en igbo: calcular embeddings de cada texto y agrupar por similitud para eliminar duplicados en corpus de entrenamiento o de scraping.
- Moderación y clasificación de contenido en igbo: comparar la similitud de un texto con prototipos de categorías (spam, noticias, opinión) sin necesidad de un clasificador supervisado.
- Recomendación de contenidos: emparejar artículos, vídeos o productos descritos en igbo con el perfil de interés del usuario representado como embedding.
- Despliegue en CPU o edge: al pesar 0,7 GB en safetensors y ser compatible con Text Embeddings Inference, puede servirse en instancias pequeñas o en local para prototipos y demos.
- Análisis de similitud entre traducciones: comparar textos en igbo con sus paráfrasis o traducciones para evaluar calidad de traducción automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta métricas de tamaño (vocabulario, parámetros y porcentaje de reducción) y el número de textos usados para el minado (95.184), sin resultados de MMLU, MTEB ni evaluaciones de retrieval en igbo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB (337 M parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en FP16/BF16: aproximadamente 0,7 GB, más overhead.
- VRAM estimada en INT8: aproximadamente 0,35 GB; en INT4, en torno a 0,2 GB, aunque la cuantizacion de encoders de embeddings requiere validar la pérdida de calidad.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100 son sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo e incluso en CPU: es viable ejecutarlo en un portátil o en una instancia pequeña de cloud.
- Opciones de despliegue: `sentence-transformers` (Python), Text Embeddings Inference (TEI), y cualquier servidor compatible con modelos de embeddings de Hugging Face; también puede exportarse a ONNX para inferencia en CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un encoder de 337 M parámetros, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/multilingual-e5-large-instruct-ibo-32768 | 337.442.816 | no disponible | igbo | MIT | Hugging Face |
| intfloat/multilingual-e5-large-instruct | 559.890.432 | no disponible | multilingüe (incluye igbo) | MIT | Hugging Face |
| intfloat/multilingual-e5-large | 559.890.432 | no disponible | multilingüe | MIT | Hugging Face |
| intfloat/multilingual-e5-base | 278.000.000 (aprox.) | no disponible | multilingüe | MIT | Hugging Face |

El modelo recortado ofrece un 39,73% menos de parámetros que el E5-large original y un 86,89% menos de vocabulario, a costa de perder cobertura en idiomas distintos del igbo. Frente al E5-base, el recortado es algo mayor en parámetros pero está especializado en igbo y conserva la dimensión de embedding de 1.024 del E5-large. No se dispone de datos de rendimiento comparativo (MTEB u otros) para cuantificar la pérdida o ganancia de calidad.

## Limitaciones y advertencias

- El vocabulario se ha recortado para igbo: el rendimiento en otros idiomas puede degradarse de forma significativa, ya que se han eliminado tokens no usados en ese idioma.
- No se han publicado evaluaciones de calidad (MTEB, retrieval en igbo) que confirmen que el modelo recortado mantiene el rendimiento del original; el autor solo afirma que "debería" comportarse de forma similar.
- Riesgo de sesgos heredados del corpus FineWeb-2 y del modelo base E5, que pueden reflejar estereotipos o desequilibrios de representación del igbo en la web.
- Al ser un modelo de embeddings, no genera texto: no debe usarse para tareas generativas, de razonamiento o de agentes.
- La licencia MIT permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de minado antes de redistribuir derivados.
- El nombre del modelo incluye "32768", que se refiere al tamaño de vocabulario, no a la longitud de contexto; no debe confundirse con una ventana de 32.768 tokens.
- Para producción en igbo, se recomienda validar con un conjunto de evaluación propio antes de sustituir al E5-large original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/multilingual-e5-large-instruct-ibo-32768
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Multilingual E5: https://arxiv.org/abs/2402.05672
