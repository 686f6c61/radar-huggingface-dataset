# GulkoA/gamespace.2

## Resumen

gamespace.2 es un modelo de embeddings de frases especializado en videojuegos de Steam, desarrollado por el usuario GulkoA. Se trata de un fine-tuning de sentence-transformers/all-MiniLM-L6-v2 que proyecta cada juego a un espacio de 128 dimensiones donde los títulos que comparten audiencia quedan proximos entre si. Alimenta el recomendador GameMerge y su proposito es resolver el problema de la recomendacion de videojuegos a partir de texto de tienda: dado un conjunto de juegos que un usuario ha disfrutado, encontrar otros titulos afines.

La relevancia del modelo reside en su enfoque hibrido: aunque solo lee el texto de la ficha de Steam (generos, etiquetas, modos, desarrollador y descripcion), durante el entrenamiento tambien aprende de comportamiento real de jugadores, usando pares de juegos co-disfrutados por los mismos reseñadores como ejemplos positivos. Esto le permite superar a embedders generalistas mucho mas grandes en la tarea de predecir el siguiente juego, y a la vez funciona con juegos nuevos que aun no tienen jugadores.

Con 22,7 millones de parametros, licencia Apache 2.0 y un ONNX cuantizado de solo 22 MB, es un modelo ligero que puede ejecutarse en el navegador con transformers.js, lo que lo hace adecuado para aplicaciones web de recomendacion sin infraestructura de servidor dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (all-MiniLM-L6-v2) con cabeza de proyeccion Dense(384→128) |
| Parametros totales | 22.713.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (documentos de 128 tokens durante entrenamiento) |
| Tipos de cuantizacion | int8 per-channel (ONNX cuantizado); pesos PyTorch en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (model_quantized.onnx), dense.bin (float32) |

## Arquitectura y entrenamiento

El modelo parte de all-MiniLM-L6-v2, un transformer BERT de 6 capas y 384 dimensiones de embedding. Sobre la salida mean-pooled se aplica una proyeccion Dense de 384 a 128 dimensiones, inicializada mediante PCA. Los vectores resultantes se normalizan en L2, de modo que el producto escalar equivale a la similitud coseno. El entrenamiento usa `CachedMultipleNegativesRankingLoss` con 128 negativos in-batch, una sola epoca, learning rate 3e-5 y documentos de 128 tokens.

Los datos provienen del Steam Games Dataset (147.352 apps, reducidas a 138.920 juegos tras eliminar bandas sonoras, demos, playtests, servidores, SDKs y registros vacios). Se construyen tres tipos de pares positivos: 70.000 pares de vistas degradadas aleatoriamente del mismo juego, 70.000 pares de juegos con perfiles de etiquetas ponderados por votos con coseno minimo de 0,6, y 66.904 pares co-disfrutados (36.371 pares distintos mostrados en ambos ordenes) minados exclusivamente de los historiales de entrenamiento del benchmark, con al menos 5 reseñadores en comun, puntuacion PMI normalizada y los 10 mejores socios por juego. Un conjunto de pares mas laxo (3 reseñadores, 20 socios) rindio peor en validacion (0,477 frente a 0,503 Hit@10), lo que indica que la calidad de los pares importa mas que la cantidad.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion (feature-extraction, sentence-similarity).
- Representacion de videojuegos de Steam a partir de su texto de tienda: generos, etiquetas, modos, desarrollador y descripcion.
- Recomendacion de juegos por similitud coseno entre vectores normalizados.
- Generalizacion a juegos nuevos sin historial de jugadores, ya que solo requiere texto de tienda.
- Ejecucion en navegador mediante transformers.js con el ONNX cuantizado.
- Compatibilidad con text-embeddings-inference y endpoints.
- No soporta tool calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Recomendacion de "siguiente juego" en una tienda o plataforma: dado el historial de un usuario, se calcula la media de los embeddings de sus juegos previos y se ordenan los candidatos por similitud coseno, como en el benchmark del autor.
- Widget de juegos similares en la ficha de producto: se embebe el texto del juego actual y se recuperan los vecinos mas cercanos del catalogo, funcionando incluso para lanzamientos recientes sin reseñas.
- Recomendacion en el navegador sin backend: usando el ONNX de 22 MB y transformers.js, una web puede calcular embeddings en el cliente y ofrecer sugerencias personalizadas sin enviar datos a un servidor.
- Filtrado y deduplicacion de catalogos: detectar juegos duplicados o muy similares comparando embeddings con umbral de coseno, util para limpiar bases de datos de tiendas.
- Busqueda semantica de videojuegos: indexar el catalogo en un motor vectorial y permitir consultas en lenguaje natural ("juego cooperativo de granjas con pesca") que se mapean al espacio de embeddings.
- Segmentacion de audiencias para marketing: agrupar juegos por cercania en el espacio de 128 dimensiones para construir clusters de nicho y orientar campanas.
- Sistemas de recomendacion hibridos: combinar la similitud de contenido de gamespace.2 con senales de popularidad o modelos secuenciales para mitigar su falta de modelado de orden.

## Benchmarks y rendimiento

El autor publica el benchmark "Steam next-game", siguiendo el protocolo de SASRec (Kang & McAuley, ICDM 2018) sobre su crawl de reseñas de Steam. Se retiene el juego mas reciente de cada usuario y se ordena frente a 100 negativos aleatorios y frente al catalogo completo. Tras eliminar juegos que ya no estan en la tienda y aplicar el filtro de cinco reseñas, quedan 250.955 usuarios, 10.318 juegos y 3,05 millones de interacciones.

| Modelo | Aprende de historiales | Hit@10 (100 neg.) | NDCG@10 (100 neg.) | Hit@10 (todos) | NDCG@10 (todos) |
|---|---|---|---|---|---|
| SASRec, reproducido | si | 0,836 | 0,581 | 0,115 | 0,060 |
| Popularity | si | 0,688 | 0,420 | 0,050 | 0,025 |
| gamespace.2 | pares de historiales de entrenamiento | 0,511 | 0,301 | 0,034 | 0,018 |
| gamespace.2 + CLIP header art | pares de historiales de entrenamiento | 0,520 | 0,309 | 0,037 | 0,019 |
| gamespace.1 | no | 0,438 | 0,251 | 0,027 | 0,014 |
| e5-large-v2 | no | 0,404 | 0,234 | 0,030 | 0,016 |
| Qwen3-Embedding-0.6B | no | 0,336 | 0,185 | 0,018 | 0,010 |
| bge-large-en-v1.5 | no | 0,334 | 0,191 | 0,026 | 0,014 |
| all-MiniLM-L6-v2 | no | 0,306 | 0,162 | 0,017 | 0,010 |
| CLIP header art only | no | 0,288 | 0,158 | 0,014 | 0,007 |

El paper de SASRec reporta 0,873 y 0,631 sobre su conjunto completo de 13.047 juegos. gamespace.2 es el mejor de los modelos de embeddings de texto, por delante de embedders generalistas mucho mayores, aunque los recomendadores secuenciales entrenados sobre interacciones siguen siendo superiores al predecir el siguiente juego porque aprenden popularidad y orden.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,7 M de parametros); el ONNX int8 ocupa 22 MB.
- GPU recomendadas: cualquier GPU moderna; no requiere A100 ni H100. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 3050, RTX 4090, e incluso en el navegador via WebGPU/WASM con transformers.js.
- Opciones de despliegue: sentence-transformers, transformers.js, text-embeddings-inference, ONNX Runtime, vLLM/TGI para embeddings si se integra en un servidor vectorial.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera muy baja latencia en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hit@10 (100 neg.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gamespace.2 | 22,7 M | 128 tokens | 0,511 | Apache 2.0 | Hugging Face, ONNX |
| gamespace.1 | no disponible | 128 tokens | 0,438 | Apache 2.0 | Hugging Face |
| all-MiniLM-L6-v2 | 22,7 M | 256 tokens (tipico) | 0,306 | Apache 2.0 | Hugging Face |
| e5-large-v2 | no disponible | no disponible | 0,404 | MIT (segun model card original) | Hugging Face |
| Qwen3-Embedding-0.6B | 0,6 B | no disponible | 0,336 | Apache 2.0 | Hugging Face |
| bge-large-en-v1.5 | no disponible | no disponible | 0,334 | MIT | Hugging Face |

La comparativa se limita a la tarea especifica del benchmark del autor; en tareas generales de embeddings los modelos mayores pueden superar a gamespace.2.

## Limitaciones y advertencias

- Los pares de comportamiento provienen de reseñas escritas entre 2010 y enero de 2018; los juegos mas recientes solo se benefician de lo que el modelo generaliza desde el texto.
- Los nombres de visualizacion de Steam identifican a los reseñadores y distintas personas pueden compartir nombre, lo que introduce ruido en los pares co-disfrutados.
- La similitud ignora popularidad y calidad, por lo que juegos oscuros pueden rankear junto a titulos conocidos.
- Solo soporta ingles; el texto de tienda en otros idiomas no esta contemplado.
- Contexto de 128 tokens, insuficiente para descripciones largas o resenas completas.
- Riesgo de alucinacion no aplica en el sentido generativo, pero la similitud semantica puede producir recomendaciones poco intuitivas en nichos con pocos datos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base all-MiniLM-L6-v2 y los datos de Steam deben verificarse segun sus propias condiciones.
- No modela orden temporal ni popularidad, por lo que no sustituye a un recomendador secuencial en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GulkoA/gamespace.2
- Modelo predecesor gamespace.1: https://huggingface.co/GulkoA/gamespace.1
- Demo GameMerge: https://huggingface.co/spaces/GulkoA/gamemerge
- Modelo base all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset Steam Games: https://huggingface.co/datasets/FronkonGames/steam-games-dataset
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
- Paper SASRec (Kang & McAuley, ICDM 2018): no disponible en la informacion proporcionada
