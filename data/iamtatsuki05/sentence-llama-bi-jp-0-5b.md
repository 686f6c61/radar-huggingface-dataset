# iamtatsuki05/Sentence-Llama-Bi-JP-0.5B

## Resumen

Sentence-Llama-Bi-JP-0.5B es un modelo de embeddings de frases (sentence embedding) especializado en japones, desarrollado por iamtatsuki05 dentro de la coleccion MIREI. Se trata de un encoder bi-direccional derivado de un modelo Llama de 0,5B, afinado mediante la metodologia LLM2Vec y posteriormente ajustado con pares supervisados del dataset cl-nagoya/ruri-v3-dataset-ft. Produce representaciones densas de 1.280 dimensiones mediante mean pooling y similitud coseno, orientadas a tareas de recuperacion (retrieval), similitud semantica, clasificacion y clustering.

El modelo resuelve el problema de obtener embeddings de alta calidad para japones reutilizando la capacidad linguistica de un LLM de tipo decoder convertido en encoder, en lugar de entrenar un encoder desde cero. Con 661.976.320 parametros totales (530M sin contar embeddings) y una ventana maxima de 8.192 tokens, se posiciona como una alternativa compacta a encoders como ModernBERT-JP o Sarashina-Bi de tamano similar dentro de la misma familia.

Es relevante ahora porque el ecosistema japones de embeddings de recuperacion (RAG, busqueda semantica) demanda modelos ligeros, con licencia permisiva y compatibles con sentence-transformers y text-embeddings-inference. Este modelo se distribuye bajo licencia MIT y se integra en pipelines estandar de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (decoder adaptado a encoder bi-direccional via LLM2Vec) |
| Parametros totales | 661.976.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; soporte GGUF no confirmado) |
| Idiomas soportados | Japones |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de iamtatsuki05/Sentence-Llama-Bi-JP-0.5B-PT y utiliza una arquitectura Llama con codificacion posicional RoPE, tokenizador SentencePiece con vocabulario de 102.400 tokens y pooling por media para generar el vector de 1.280 dimensiones. La adaptacion a encoder se realiza con la metodologia LLM2Vec, que convierte la atencion causal del decoder en atencion bi-direccional y aplica enmascaramiento para obtener representaciones contextuales de secuencia completa.

El ajuste final se realiza con pares supervisados del dataset cl-nagoya/ruri-v3-dataset-ft, orientado a tareas de recuperacion y similitud en japones. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como DPO o decodificacion especulativa; estos datos figuran como no disponibles. La innovacion principal es el uso de un LLM compacto como base de embedding, lo que aprovecha su conocimiento linguistico previo sin requerir un encoder entrenado desde cero.

## Capacidades

- Generacion de embeddings de frases en japones con 1.280 dimensiones y similitud coseno.
- Recuperacion de informacion (retrieval) y busqueda semantica sobre documentos en japones.
- Similitud semantica entre pares de frases (STS).
- Clasificacion de texto por representacion vectorial.
- Clustering de documentos o frases.
- Reranking de resultados de busqueda.
- Soporte de secuencias de hasta 8.192 tokens, adecuado para pasajes largos.
- Integracion con sentence-transformers (encode, similarity) y compatibilidad con text-embeddings-inference.
- No soporta tool calling, agentes, vision ni audio: es un modelo exclusivamente de extraccion de caracteristicas.

## Casos de uso

- Busqueda semantica en japones: indexar un corpus de documentos japoneses y recuperar pasajes relevantes mediante similitud coseno sobre los embeddings de 1.280 dimensiones.
- RAG (generacion aumentada por recuperacion): usar el modelo como retriever para alimentar un LLM generativo con contexto japones recuperado, aprovechando la ventana de 8.192 tokens para pasajes largos.
- Deduplicacion y agrupamiento de documentos: calcular embeddings de un corpus y aplicar clustering para detectar contenido duplicado o tematicamente proximo.
- Clasificacion de tickets o consultas: entrenar un clasificador ligero sobre los embeddings para enrutar consultas de atencion al cliente en japones.
- Reranking de resultados: reordenar candidatos de un motor de busqueda lexico combinando la similitud semantica del modelo con la puntuacion original.
- Deteccion de similitud y plagio: comparar pares de textos japoneses mediante similitud coseno para identificar duplicados o parafrasis.
- Sistemas de recomendacion de contenido: representar articulos o productos en japones y calcular vecinos mas cercanos para sugerencias.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre JMTEB v2 (medias por familia de tareas):

| Modelo | Arquitectura | Parametros | JMTEB-Avg | Retrieval | STS | Classification | Reranking | Clustering |
|---|---|---|---|---|---|---|---|---|
| Sentence-Llama-Bi-JP-0.5B (este modelo) | Llama | 661M | 57,13 | 50,17 | 77,67 | 52,96 | 56,99 | 47,85 |
| Sentence-ModernBERT-JP-0.5B | ModernBERT | 679M | 62,07 | 61,11 | 80,61 | 55,38 | 65,11 | 48,15 |
| Sentence-Sarashina-Bi-0.5B | Llama | 661M | 62,81 | 55,47 | 83,44 | 58,50 | 66,82 | 49,80 |

Las puntuaciones se miden en JMTEB v2; cada familia promedia todos los datasets, splits y subconjuntos, y JMTEB-Avg es la media macro sobre las cinco familias.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-1,5 GB en bfloat16 para los 661M de parametros, mas el overhead de activaciones segun la longitud de secuencia.
- Cabe en GPU de consumo: RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090, entre otras, con amplio margen.
- GPU recomendadas para produccion: A100, H100 o L40S para alto throughput; cualquier GPU con al menos 4 GB de VRAM es suficiente para lotes moderados.
- Opciones de despliegue: sentence-transformers (recomendado, requiere trust_remote_code), text-embeddings-inference, transformers con accelerate. Soporte de llama.cpp u Ollama no confirmado en la informacion disponible.
- Requisitos de software indicados: sentence-transformers>=4.1.0, transformers>=4.51.0, accelerate>=1.6.0, sentencepiece>=0.2.0, flash-attn>=2.7.3.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | JMTEB-Avg | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sentence-Llama-Bi-JP-0.5B | Llama | 661M | 8.192 | 57,13 | MIT | Hugging Face |
| Sentence-ModernBERT-JP-0.5B | ModernBERT | 679M | no disponible | 62,07 | no disponible | Hugging Face |
| Sentence-Sarashina-Bi-0.5B | Llama | 661M | no disponible | 62,81 | no disponible | Hugging Face |

Los tres modelos pertenecen a la coleccion MIREI del mismo autor y comparten el ajuste supervisado sobre cl-nagoya/ruri-v3-dataset-ft. En JMTEB v2, este modelo queda por debajo de sus dos alternativas en todas las familias de tareas, especialmente en retrieval y reranking.

## Limitaciones y advertencias

- Solo soporta japones; su rendimiento en otros idiomas no esta evaluado y probablemente sea deficiente.
- Es un modelo de embeddings, no generativo: no produce texto ni soporta tool calling, agentes o razonamiento multi-paso.
- Riesgo de sesgos heredados de los datos de entrenamiento del modelo base y del dataset ruri-v3, no documentados en la model card.
- Posible degradacion en dominios muy especializados (legal, medico, tecnico) no representados en el dataset de ajuste.
- La ventana de 8.192 tokens puede implicar coste computacional cuadratico en atencion; conviene truncar pasajes largos cuando sea posible.
- Requiere trust_remote_code=True y flash-attn para el maximo rendimiento; sin flash-attn el rendimiento puede ser inferior.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base y del dataset de entrenamiento para uso comercial en produccion.
- No se han publicado datos sobre latencia, throughput ni consumo energetico.

## Enlaces

- Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-JP-0.5B
- Modelo base: https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-JP-0.5B-PT
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de ajuste: https://huggingface.co/datasets/cl-nagoya/ruri-v3-dataset-ft
- Modelo comparable (ModernBERT): https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-JP-0.5B
- Modelo comparable (Sarashina): https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-0.5B
- Licencia MIT: https://opensource.org/license/mit/
