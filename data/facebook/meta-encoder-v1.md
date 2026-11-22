# facebook/meta-encoder-v1

## Resumen

MetaEncoder v1 es un modelo de extracción de características (feature extraction) publicado por Meta (Facebook) en Hugging Face bajo el identificador `facebook/meta-encoder-v1`. No es un modelo generativo: su función es producir embeddings multimodales L2-normalizados de 6656 dimensiones a partir de texto, imágenes, vídeos y documentos, y ofrecer operaciones de recuperación (retrieval) y decisión sobre conjuntos cerrados de opciones. Está pensado para tareas de búsqueda semántica, clustering y clasificación zero-shot mediante similitud coseno.

El modelo tiene 28.431.795.200 parámetros (unos 28,4 mil millones) según los pesos en safetensors, y el repositorio ocupa 57 GB. Utiliza la arquitectura `muse_glimmer`, disponible a partir de `transformers>=5.15`, y requiere una GPU de 80 GB para cargarse en bf16. La longitud de contexto de entrenamiento es de 16.384 tokens, sin truncado en inferencia, y las imágenes se procesan a resolución nativa ajustada a una rejilla de 28 píxeles, con hasta 4096 tokens combinados.

Su relevancia actual radica en que unifica en un solo encoder la recuperación texto-imagen, imagen-texto, vídeo y documentos, además de permitir "decisiones" (preguntas booleanas, de elección múltiple y de puntuación) sin un cabezal generativo separado, lo que simplifica pipelines de búsqueda y clasificación en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `muse_glimmer` (encoder) |
| Parametros totales | 28.431.795.200 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en entrenamiento; sin truncado en inferencia |
| Tipos de cuantizacion | no disponible (la model card solo menciona bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension del embedding | 6656 (float32, L2-normalizado) |
| Resolucion de imagen | nativa, ajustada a rejilla de 28 px, hasta 4096 tokens combinados |
| Frames de video | hasta 8 (submuestreo uniforme si hay mas) |
| Libreria | transformers >= 5.15 |

## Arquitectura y entrenamiento

La model card no detalla la composición interna de la arquitectura `muse_glimmer` más allá de que es un encoder multimodal que procesa texto e imágenes (y frames de vídeo) en un mismo espacio de representación. El pooling se realiza sobre la última posición del turno de usuario (el token `<|eot|>`) con padding a la izquierda, y los inputs nunca se truncan porque eso eliminaría el token agrupado. Las secuencias de entrenamiento tenían como máximo 16.384 tokens.

El entrenamiento es contrastivo: las probabilidades de `decide` se calculan como `softmax(score / 0.02)`, donde 0.02 es la temperatura de entrenamiento contrastivo. El wrapper formatea cada entrada con una plantilla de chat fija (cabecera terminada en "Represent the user's input." seguida de la instrucción del ítem) y una fecha fija para que un mismo input produzca el mismo embedding en cualquier día. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de embeddings multimodales de texto, imagen, vídeo (lista de frames) y documentos, con instrucciones por ítem que modulan el embedding resultante.
- Recuperación (retrieval) de un corpus frente a una consulta, con puntuación por similitud coseno y devolución de los mejores resultados (`top_k`).
- Decisión sobre conjuntos cerrados: preguntas booleanas (`noul`), de elección entre 2 y 26 opciones (`choice`) y de puntuación ordinal (`score`), con probabilidades, confianza y puntuaciones brutas.
- Procesamiento batch de decisiones (`decide_batch`) para múltiples estados.
- Calibración de la temperatura de decisión sobre un conjunto etiquetado (`calibrate`).
- Similitud coseno entre embeddings (`MetaEncoder.similarity`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso generativo: no disponible (no es un modelo generativo).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Búsqueda semántica de documentos: se codifican una vez las imágenes de documentos (gráficos, diapositivas) con `encode` y se consultan repetidamente con `retrieve`, reutilizando el tensor para evitar recodificar el corpus en cada búsqueda.
- Recuperación imagen-texto en catálogos: una consulta textual como "used iphone 15" se compara contra un corpus de imágenes de producto mediante instrucciones separadas para consulta y documento.
- Clasificación zero-shot de consultas: con `decide` y una pregunta de tipo `choice` (por ejemplo, tema: electrónica, comida, viaje, otro) se etiquetan consultas entrantes sin entrenar un clasificador específico.
- Detección de intención de compra: una pregunta de tipo `score` con niveles ordenados ("none", "weak", "moderate", "strong") devuelve un índice esperado que puede priorizar leads en un CRM.
- Moderación o enrutamiento booleano: preguntas `noul` como "¿el usuario está comprando un producto?" permiten dirigir conversaciones a distintos flujos con la probabilidad asociada.
- Búsqueda en vídeo: se extraen hasta 8 frames por vídeo, se codifican frame a frame y se recuperan fragmentos relevantes frente a una consulta textual.
- Clustering y deduplicación de contenido multimodal: la matriz de similitud coseno entre embeddings permite agrupar imágenes o textos similares para organización de archivos o detección de duplicados.

## Benchmarks y rendimiento

La model card incluye una imagen (`benchmarks.png`) pero no se proporcionan los valores numéricos en la información disponible. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 57 GB en bf16 (el repositorio ocupa 57 GB y la model card indica que una GPU de 80 GB aloja el modelo en bf16).
- GPU recomendadas: A100 80 GB, H100 80 GB o equivalentes con al menos 80 GB de memoria para bf16.
- Cabe en GPU de consumo: no disponible; por tamaño (28,4 mil millones de parámetros) no cabe en GPUs consumer de 24 GB en bf16, y no se documentan cuantizaciones alternativas.
- Opciones de despliegue: `transformers>=5.15` con el módulo `modeling_metaencoder`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (encoders multimodales de recuperación) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, por lo que no sirve para chat, resumen ni generación de código.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar al autor.
- Idiomas soportados no disponibles: no hay garantía documentada de cobertura multilingüe.
- Los inputs no se truncan; secuencias superiores a 16.384 tokens pueden comportarse de forma imprevisible.
- El vídeo se limita a 8 frames (submuestreo uniforme), lo que puede perder información en vídeos largos.
- Las imágenes se procesan a resolución nativa hasta 4096 tokens combinados, lo que puede elevar el coste computacional en documentos de alta resolución.
- Las probabilidades de `decide` usan una temperatura fija de 0.02; sin calibrar con `calibrate`, la confianza puede no ajustarse a la distribución real de los datos.
- Las preguntas se responden de forma independiente; no hay razonamiento condicional entre preguntas.
- Riesgo de sesgos y alucinación en las decisiones: no disponible en la información proporcionada.
- Requiere `transformers>=5.15`, lo que puede limitar la compatibilidad con stacks existentes.

## Enlaces

- Hugging Face: https://huggingface.co/facebook/meta-encoder-v1
- Paper, blog, repositorio o demo: no disponible en la información proporcionada.
