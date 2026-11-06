# luluw/embeddinggemmatext2-65k-en-ne-trim

## Resumen

EmbeddingGemma 2 (English + Nepali, 65k vocabulary) es una variante con vocabulario recortado de EmbeddingGemma 2, un modelo de embeddings de texto desarrollado por Google DeepMind. Lo publica el usuario luluw en Hugging Face y su aportacion consiste en reducir el vocabulario del tokenizador de 262.144 a 65.536 tokens, conservando los que el texto en ingles y nepalí realmente utiliza. El resto del modelo permanece intacto: misma arquitectura, mismas capas y misma proyeccion de salida.

El modelo transforma texto, incluido codigo, en vectores densos de 768 dimensiones pensados para busqueda semantica, generacion aumentada por recuperacion (RAG), clasificacion, agrupamiento y similitud semantica. Con 170.339.352 parametros totales segun los safetensors del repositorio y un tamano de repo de 0,3 GB, el recorte elimina aproximadamente 100,7 millones de parametros de la tabla de embeddings (un 75% de esa tabla), lo que reduce la huella de descarga y de memoria sin alterar la velocidad de inferencia, ya que el embedding es una simple consulta a tabla.

Su relevancia actual es practica: ofrece un modelo de embeddings ligero, con licencia Apache 2.0 y compatible con el ecosistema transformers y sentence-transformers, especializado en dos idiomas concretos (ingles y nepalí) y con un contexto de 8.192 tokens. No obstante, el recorte de vocabulario degrada deliberadamente el rendimiento en cualquier otro idioma, por lo que su uso queda acotado a los pares linguisticos soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings de texto basado en Gemma (transformer con atencion GQA/MQA, ventana deslizante, mean pooling y proyeccion 512→768) |
| Parametros totales | 170.339.352 (dato real de safetensors); el modelo original declaraba 270M antes del recorte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (ventana deslizante de 1.024 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en el material consultado) |
| Idiomas soportados | Ingles (en) y nepalí (ne, escritura devanagari); otras lenguas no estan contempladas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos tecnicos: 24 capas, dimension del modelo 512, dimension oculta 2.048, 4 cabezas de atencion, 2 cabezas KV locales y 1 global (proporcion local:global 5:1), activacion FFN con compuerta y GELU, pooling por media, dimension nativa de salida 768 y truncamiento MRL a 128, 256 y 512 dimensiones.

## Arquitectura y entrenamiento

La arquitectura es la de EmbeddingGemma 2, que hereda los avances de Gemma 4: un backbone transformer de 130M de parametros mas un embedder de 140M, con atencion de grupo de consultas (GQA) y atencion multi-consulta (MQA), atencion con ventana deslizante local de 1.024 tokens combinada con atencion global en proporcion 5:1, FFN con compuerta y GELU, pooling por media y una capa de proyeccion de 512 a 768 dimensiones. El modelo es exclusivamente de texto y codigo; no admite imagen, video ni audio.

La innovacion de esta variante no reside en el entrenamiento sino en el tokenizador. El autor conto el uso de tokens con el tokenizador original sobre texto web de FineWeb-2 (70.000 documentos en ingles y 30.000 en nepalí), conservo todos los tokens especiales y los 256 tokens de respaldo de bytes, reservo una cuota de 12.288 tokens a los mas frecuentes en nepalí y asigno el resto al ingles por frecuencia. Ademas garantizo la completitud BPE (cada token conservado mantiene los subtokens de los que se compone) y reconstruyo el tokenizador con identificadores contiguos nuevos, reglas de mezcla supervivientes y remapeo de los ids especiales (bos, eos, pad). No se indica que se haya realizado un reentrenamiento adicional del modelo con el nuevo vocabulario, por lo que los pesos del transformer y de la proyeccion se mantienen los del modelo base.

## Capacidades

- Generacion de embeddings de texto y codigo en un espacio vectorial compartido de 768 dimensiones.
- Similitud semantica y busqueda semantica sobre pares de frases o documentos.
- Recuperacion de informacion para pipelines de RAG (indexacion y consulta).
- Clasificacion de texto y agrupamiento (clustering) mediante representaciones vectoriales.
- Soporte de truncamiento MRL a 128, 256 y 512 dimensiones para reducir coste de almacenamiento y busqueda.
- Capacidad bilingue limitada a ingles y nepalí, con cuota de vocabulario dedicada al nepalí.
- Manejo de entrada arbitraria gracias a los tokens de respaldo de bytes: cualquier texto sigue siendo codificable aunque se fragmente en piezas mas pequenas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento; es un modelo de embeddings, no generativo.

## Casos de uso

- Busqueda semantica bilingue ingles-nepalí: indexar un corpus documental con este modelo y recuperar por similitud coseno; la cuota de vocabulario dedicada al nepalí permite representar texto devanagari sin fragmentacion excesiva.
- RAG sobre documentacion tecnica en ingles: generar embeddings de fragmentos de hasta 8.192 tokens y almacenarlos en una base vectorial; el contexto amplio permite indexar secciones completas sin trocear en exceso.
- Clasificacion de tickets o correos: entrenar un clasificador lineal ligero sobre los embeddings de 768 dimensiones, o de 128 o 256 con truncamiento MRL para reducir memoria.
- Deduplicacion y agrupamiento de articulos: calcular similitudes por pares sobre lotes de documentos y agrupar por umbral; la correlacion de similitudes por pares con el modelo original es de 0,9786 en ingles y 0,9985 en nepalí.
- Despliegue en entornos con poca memoria: con 0,3 GB de repositorio y una tabla de embeddings de 33,6M de parametros, cabe en instancias pequenas o en CPU para volumenes moderados de indexacion.
- Filtrado semantico previo a un LLM generativo: usar el modelo como recuperador barato en un pipeline de dos etapas, reservando el modelo grande para la generacion final.
- Busqueda de codigo por descripcion en lenguaje natural: el modelo admite codigo como entrada, aunque los identificadores poco comunes se fragmentan en mas tokens tras el recorte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las puntuaciones de benchmark citadas corresponden al modelo original y no se han vuelto a medir para esta variante. Los unicos datos numericos publicados son de fidelidad de embeddings frente al modelo original, sobre 256 documentos aleatorios por idioma:

| Metrica | Ingles | Nepalí |
|---|---|---|
| Similitud coseno con el original, media | 0,9948 | aproximadamente 1,000 |
| Similitud coseno con el original, minima | 0,962 | 0,969 |
| Correlacion de similitudes por pares con el original | 0,9786 | 0,9985 |
| Diferencia media absoluta de similitud por pares | 0,0063 | 0,0012 |

Estas cifras miden proximidad de embeddings, no precision en tareas. El propio autor advierte que los documentos provienen del mismo corpus usado para contar el vocabulario, por lo que las cifras en ingles son ligeramente optimistas, y que un coseno ligeramente superior a 1,0 en nepalí se debe al redondeo en bf16 de las normas de salida.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,3 GB en safetensors; con pesos en bf16 el modelo completo ronda los 0,34 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna sirve; para indexacion a gran escala se recomiendan A100, H100 o L40S por throughput agregado, aunque no se dispone de cifras de latencia o tokens por segundo en la informacion proporcionada.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs de portatil con 4 GB o mas. Tambien es viable en CPU para cargas moderadas.
- Opciones de despliegue: transformers (libreria declarada), sentence-transformers por las etiquetas del repositorio, y endpoints compatibles (etiqueta endpoints_compatible). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El autor senala que la velocidad de inferencia no cambia respecto al original porque el embedding es una consulta a tabla; solo se reduce memoria y tamano de fichero.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| luluw/embeddinggemmatext2-65k-en-ne-trim | 170.339.352 | 8.192 tokens | en, ne | Apache 2.0 | Variante recortada; 0,3 GB; fidelidad alta al original en en/ne |
| google/embeddinggemma-2 | 270M declarados (modelo base) | 8.192 tokens | no disponible en el material consultado | Apache 2.0 | Modelo original; vocabulario de 262.144 tokens; recomendado para idiomas distintos de en/ne |
| Otras alternativas de embeddings multilingues | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion directa solo es posible con el modelo base. Frente a el, esta variante reduce el vocabulario un 75% y el tamano de descarga, mantiene la misma velocidad de inferencia y conserva embeddings muy proximos en ingles y nepalí, a costa de degradar cualquier otro idioma.

## Limitaciones y advertencias

- Cobertura linguistica restringida: solo se contemplan ingles y nepalí. Para el resto de idiomas los tokens se eliminaron en su mayoria, el texto se fragmenta en piezas pequenas y se espera una caida de calidad; el autor recomienda usar el modelo original en esos casos.
- Las palabras inglesas poco frecuentes y el vocabulario nepalí fuera del conjunto conservado cuestan algunos tokens mas, lo que puede afectar al coste de indexacion y a la precision en dominios muy especializados.
- Los identificadores de codigo poco comunes se dividen en mas tokens tras el recorte.
- No se han publicado benchmarks de tarea para esta variante; las cifras de fidelidad no equivalen a precision en recuperacion. Es necesario evaluar sobre datos propios de retrieval en ingles y nepalí antes de usarlo en produccion.
- Riesgo de sesgo heredado del corpus de conteo (FineWeb-2) y del modelo base de Google DeepMind; no se documentan analisis de sesgo especificos para esta variante.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de recuperaciones irrelevantes si los embeddings se usan fuera de la distribucion de entrenamiento.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar los terminos del modelo base de Google DeepMind y citar adecuadamente la autoria original.
- Modelo de solo texto: no admite imagen, video ni audio.
- El repositorio tiene muy poca traccion (27 descargas y 0 likes en el momento de la consulta), por lo que no hay validacion comunitaria extensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luluw/embeddinggemmatext2-65k-en-ne-trim
- Modelo original: https://huggingface.co/google/embeddinggemma-2
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
- Banner del modelo: https://ai.google.dev/gemma/images/embeddinggemma2_banner.png
