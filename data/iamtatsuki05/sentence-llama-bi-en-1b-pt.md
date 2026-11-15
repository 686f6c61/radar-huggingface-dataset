# iamtatsuki05/Sentence-Llama-Bi-EN-1B-PT

## Resumen

Sentence-Llama-Bi-EN-1B-PT es un modelo de embeddings de frases en ingles desarrollado por iamtatsuki05 dentro del proyecto MIREI. Se construye envolviendo el modelo base iamtatsuki05/Llama-Bi-EN-1B-PT-stage2 con un entrenamiento contrastivo debilmente supervisado sobre los subconjuntos debilmente supervisados del dataset sentence-transformers/embedding-training-data. El resultado es un encoder bi-direccional que produce representaciones densas de 1.792 dimensiones mediante mean pooling.

El modelo parte de una arquitectura Llama con 1.224.038.144 parametros totales (1.040M sin contar los embeddings) y una longitud maxima de secuencia de 8.192 tokens. Su proposito es servir como encoder de recuperacion y similitud semantica en ingles, compitiendo con encoders dedicados como ModernBERT o Sarashina bajo la misma receta de entrenamiento del proyecto MIREI, lo que permite comparar arquitecturas encoder y decoder en condiciones controladas.

Es relevante ahora porque forma parte de una serie de tres encoders de aproximadamente 1B de parametros entrenados con la misma receta sobre unos 43M de pares, lo que facilita el analisis comparativo entre arquitecturas. Su licencia MIT y su compatibilidad con text-embeddings-inference lo hacen directamente desplegable en pipelines de RAG y busqueda semantica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder adaptado a encoder bi-direccional) |
| Parametros totales | 1.224.038.144 (1.040M sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.792 (mean pooling) |
| Tokenizador | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | Coseno |
| Tamano del repo | 4,9 GB |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama, un transformer originalmente decoder-only que en este caso se adapta a un uso bi-direccional para generar embeddings de frases. La representacion final se obtiene mediante mean pooling sobre las salidas del modelo, produciendo un vector de 1.792 dimensiones. Emplea codificacion posicional RoPE y un tokenizador SentencePiece con vocabulario de 102.400 entradas.

El entrenamiento consiste en un ajuste contrastivo debilmente supervisado sobre los subconjuntos debilmente supervisados de sentence-transformers/embedding-training-data, que en la serie MIREI suman aproximadamente 43M de pares distribuidos en 25 subconjuntos. El modelo base es iamtatsuki05/Llama-Bi-EN-1B-PT-stage2, lo que indica un entrenamiento por etapas previo. No se detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO, que en un modelo de embeddings no serian el mecanismo habitual.

La innovacion principal es metodologica: la serie MIREI entrena encoders ModernBERT, Llama y Sarashina con la misma receta y el mismo dataset, permitiendo un analisis controlado del rendimiento de distintas arquitecturas en tareas de sentence embedding, tal como recoge la publicacion asociada en NLP2026.

## Capacidades

- Generacion de embeddings de frases en ingles de 1.792 dimensiones con normalizacion opcional.
- Similitud semantica y calculo de scores coseno entre consultas y documentos.
- Recuperacion de informacion (retrieval) y busqueda semantica sobre corpus en ingles.
- Extraccion de caracteristicas (feature-extraction) a partir de texto.
- Soporte de secuencias de hasta 8.192 tokens, adecuado para documentos largos.
- Integracion con la libreria sentence-transformers y con text-embeddings-inference.
- Compatibilidad con endpoints de Hugging Face.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento: es un encoder puro.

## Casos de uso

- Recuperacion aumentada por generacion (RAG): el modelo indexa fragmentos de documentos de hasta 8.192 tokens y recupera los mas relevantes para una consulta, alimentando un LLM generador. Su contexto largo reduce la necesidad de trocear documentos extensos.
- Busqueda semantica en bases de conocimiento internas: se generan embeddings de articulos, tickets o manuales y se consultan por similitud coseno, superando la busqueda por palabras clave en consultas parafraseadas.
- Deduplicacion y agrupacion de contenido: se calculan embeddings de registros o textos y se agrupan por similitud para detectar duplicados o near-duplicates en corpus en ingles.
- Clasificacion de textos por similitud con prototipos: se embeben descripciones de categorias y se asigna cada documento a la categoria mas cercana sin entrenar un clasificador adicional.
- Sistemas de recomendacion basados en contenido: se representan items y preferencias del usuario en el mismo espacio vectorial para ordenar candidatos por afinidad semantica.
- Filtrado y moderacion de contenido: comparacion de mensajes contra conjuntos de referencia de politicas o ejemplos problematicos mediante similitud de embeddings.
- Evaluacion comparativa de arquitecturas de embedding: al compartir receta con los modelos ModernBERT y Sarashina de la serie MIREI, sirve como referencia en experimentos academicos sobre encoder frente a decoder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,5 GB solo para los pesos (1.224M parametros), mas memoria para activaciones y el tokenizador; con secuencias de 8.192 tokens las activaciones incrementan el consumo de forma notable.
- GPU recomendadas: A100, H100 o L40S para lotes grandes y secuencias largas; RTX 4090 o RTX 3090 para uso individual.
- Cabe en GPU de consumo: si, en tarjetas con 8-16 GB de VRAM para lotes moderados; en cuantizacion de 8 bits o menor el requisito baja, aunque el autor no publica cuantizaciones oficiales.
- Opciones de despliegue: sentence-transformers (version >= 4.1.0), transformers (>= 4.51.0) con accelerate (>= 1.6.0), flash-attn (>= 2.7.3) recomendado, y text-embeddings-inference para servicio HTTP.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Sentence-Llama-Bi-EN-1B-PT (este) | Llama | 1.224M (1.040M sin embeddings) | 8.192 | MIT | Embedding de 1.792 dim, ingles |
| Sentence-ModernBERT-EN-1B-PT | ModernBERT | 1.304M (1.120M sin embeddings) | no disponible | no disponible en la informacion | Misma receta MIREI, 25 subconjuntos, ~43M pares |
| Sentence-Sarashina-Bi-EN-1B-PT | Llama | 1.224M (1.040M sin embeddings) | no disponible | no disponible en la informacion | Misma receta MIREI, 25 subconjuntos, ~43M pares |

Los tres modelos comparten el mismo procedimiento de entrenamiento debilmente supervisado, lo que permite comparar arquitecturas con un control experimental alto. No se dispone de datos de rendimiento comparativo publicados en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta ingles; su uso con otros idiomas no esta validado y probablemente degrade la calidad de los embeddings.
- Es un encoder de embeddings: no genera texto, no razona de forma autonoma y no soporta tool calling ni agentes.
- Riesgo de sesgos heredados del modelo base Llama-Bi-EN-1B-PT-stage2 y de los datos de entrenamiento debilmente supervisados; no se documentan evaluaciones de sesgo.
- La supervision debil implica etiquetas de menor calidad que un entrenamiento supervisado fuerte, lo que puede afectar a la precision en dominios especializados.
- El limite de 8.192 tokens obliga a trocear documentos mas largos.
- No se publican cuantizaciones oficiales ni resultados de benchmarks, lo que dificulta estimar su rendimiento real frente a alternativas.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base y del dataset de entrenamiento antes de un uso comercial a gran escala.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que carece de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-EN-1B-PT
- Modelo base: https://huggingface.co/iamtatsuki05/Llama-Bi-EN-1B-PT-stage2
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/embedding-training-data
- Modelo hermano ModernBERT: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-EN-1B-PT
- Modelo hermano Sarashina: https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-EN-1B-PT
- Licencia MIT: https://opensource.org/license/mit/
