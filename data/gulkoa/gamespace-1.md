# GulkoA/gamespace.1

## Resumen

gamespace.1 es un modelo de embeddings de frases especializado en videojuegos de Steam, desarrollado por el usuario GulkoA. Se trata de un ajuste fino de sentence-transformers/all-MiniLM-L6-v2, un transformer BERT de 22,7 millones de parámetros, entrenado para proyectar cada juego en un espacio vectorial de 128 dimensiones donde los títulos con jugabilidad similar quedan próximos entre sí. Alimenta el recomendador GameMerge, que ordena todo el catálogo de Steam por similitud coseno respecto a los juegos que el usuario marca como favoritos.

El modelo resuelve un problema concreto de recomendación semántica: en lugar de depender de reseñas, popularidad o precio, la similitud se calcula exclusivamente a partir del contenido del juego (géneros, etiquetas de usuario, modos, desarrollador y descripción). Esta decisión de diseño hace que la cercanía vectorial refleje "qué es" un juego y no "cuánto se vende", lo que resulta útil para descubrir títulos de nicho que comparten mecánicas con otros más conocidos.

Es relevante por su eficiencia: el ajuste se completó en unos 20 minutos sobre una única GPU de portátil (RTX 3050 Ti), el repositorio ocupa 0,2 GB y ofrece una versión ONNX cuantizada a int8 de 22 MB que puede ejecutarse en el navegador con transformers.js. La licencia Apache 2.0 y el soporte de text-embeddings-inference lo hacen apto para despliegues comerciales y para integrarse en servicios de recuperación semántica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (base: all-MiniLM-L6-v2) con capa de proyección Dense 384→128 |
| Parametros totales | 22.713.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud de documento usada en entrenamiento) |
| Tipos de cuantizacion | int8 per-channel (ONNX cuantizado); fp32 (ONNX completo y safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (model.onnx fp32 y model_quantized.onnx int8), dense.bin (proyección en float32) |

## Arquitectura y entrenamiento

El modelo parte de all-MiniLM-L6-v2, un transformer encoder de 6 capas y 384 dimensiones ocultas, y le añade una capa `Dense(384→128)` entrenada de extremo a extremo. La proyección se inicializa a partir de la base PCA de los embeddings del modelo base, lo que acelera la convergencia hacia un espacio de menor dimensión. Los vectores de salida se normalizan en L2, de modo que el producto escalar equivale directamente a la similitud coseno.

El entrenamiento emplea `CachedMultipleNegativesRankingLoss` con 128 negativos en batch y 140.000 pares positivos construidos de dos formas: 70.000 pares son dos vistas degradadas aleatoriamente del mismo juego (eliminando la lista de etiquetas, la descripción o parte de cada una) y otros 70.000 son pares de juegos distintos cuyos perfiles de etiquetas ponderadas por votos tienen un coseno de al menos 0,6. Se usaron 138.920 juegos del Steam Games Dataset de FronkonGames tras eliminar bandas sonoras, demos, playtests, servidores dedicados, SDKs y registros vacíos, reservando 3.000 juegos etiquetados como conjunto de evaluación. La configuración fue una época, learning rate 3e-5, documentos de 128 tokens y precisión fp16. La innovación principal es la ocultación deliberada de señales de popularidad (reseñas, precio, horas jugadas, número de propietarios), de modo que la similitud mide contenido y no éxito comercial.

## Capacidades

- Generación de embeddings de texto de 128 dimensiones para similitud semántica y recuperación.
- Extracción de características (`feature-extraction`) compatible con sentence-transformers y transformers.js.
- Codificación de documentos de ficha de juego con géneros, etiquetas, modos, desarrollador y descripción.
- Robustez ante campos ausentes: el entrenamiento ocultó etiquetas y descripciones la mitad de las veces, por lo que los juegos sin etiquetas de usuario siguen generando vectores útiles a partir de su descripción.
- Búsqueda de vecinos más cercanos por similitud coseno sobre catálogos de gran tamaño (el recomendador GameMerge indexa todo Steam).
- Ejecución en navegador mediante ONNX int8.
- Soporte de text-embeddings-inference y endpoints compatibles.
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente, visión, audio ni modo de pensamiento: es un encoder de recuperación, no un modelo generativo.

## Casos de uso

- Recomendación de videojuegos en tienda o plataforma: se codifica el perfil del juego consultado y se recuperan los vecinos más cercanos de un índice vectorial, ordenando el catálogo por similitud coseno; el modelo está entrenado exactamente para esta tarea y funciona con 128 dimensiones, lo que abarata el índice.
- Descubrimiento de títulos de nicho: al excluir popularidad y precio del entrenamiento, juegos poco conocidos con mecánicas similares a un favorito aparecen junto a los superventas, útil para curaduría editorial y listas de "si te gustó X".
- Búsqueda semántica en catálogos de bibliotecas personales: un servicio puede codificar las descripciones de la biblioteca de Steam de un usuario y responder consultas en lenguaje natural ("juego relajado de granja con pesca") mediante similitud vectorial.
- Etiquetado y agrupación automática de catálogo: los embeddings sirven para clustering de juegos por género implícito, detección de duplicados o generación de etiquetas temáticas en pipelines de datos.
- Filtrado de candidatos en sistemas de recomendación híbridos: el vector de 128 dimensiones actúa como etapa de recuperación barata antes de un ranking más costoso basado en comportamiento.
- Clasificación de similitud en herramientas de comunidad: foros o wikis pueden sugerir juegos relacionados a partir del texto de una ficha sin depender de APIs de terceros.
- Ejecución en el cliente: la versión ONNX int8 de 22 MB permite calcular recomendaciones en el navegador con transformers.js, sin enviar datos del usuario al servidor.

## Benchmarks y rendimiento

La evaluación del autor mide, para cada juego reservado, la similitud media entre su perfil de etiquetas ponderado por votos y escalado por IDF y los de sus 10 vecinos recuperados de un pool fijo de 30.000 juegos etiquetados.

| Modelo | Con etiquetas | Solo descripción |
|---|---|---|
| Pares aleatorios | 0,076 | 0,076 |
| all-MiniLM-L6-v2 sin ajuste | 0,230 | 0,208 |
| TSDAE denoising autoencoder + contrastivo | 0,493 | 0,370 |
| gamespace.1, solo contrastivo | 0,503 | 0,376 |
| Techo, emparejando etiquetas reales | 0,621 | no disponible |

Además, el autor documenta que la versión ONNX cuantizada a int8 presenta un coseno de 0,995 respecto al modelo PyTorch, y ofrece ejemplos cualitativos de vecinos: DARK SOULS III recupera Dark Souls II, Dark Souls Remastered, Elden Ring y Lies of P; Stardew Valley recupera Staxel, Dinkum, Coral Island y Sun Haven; Factorio recupera FOUNDRY, Satisfactory, shapez y Techtonica; Euro Truck Simulator 2 recupera American Truck Simulator, Truck & Logistics Simulator y The Bus.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32; el modelo completo pesa unos 90 MB en safetensors y la versión ONNX int8 unos 22 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó con una RTX 3050 Ti de portátil.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna, y también en CPU.
- Opciones de despliegue: sentence-transformers, transformers.js (navegador), ONNX Runtime, text-embeddings-inference, vLLM y llama.cpp no aplica (no es un modelo generativo).
- Latencia y throughput: no se han publicado mediciones formales; el entrenamiento de una época sobre 140.000 pares requirió unos 20 minutos en una RTX 3050 Ti, lo que da una idea del coste de codificación por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensión de salida | Contexto | Licencia | Especialización |
|---|---|---|---|---|---|
| gamespace.1 | 22,7 M | 128 | 128 tokens | Apache 2.0 | Videojuegos de Steam |
| all-MiniLM-L6-v2 | 22,7 M | 384 | 256 tokens | Apache 2.0 | Propósito general |
| TSDAE + contrastivo (variante del autor) | 22,7 M | 128 | 128 tokens | Apache 2.0 | Videojuegos de Steam |
| Modelos de embeddings generalistas de mayor tamaño (por ejemplo, familia BGE o E5) | cientos de millones | 768-1024 | 512 tokens | variable | Propósito general |

Frente a all-MiniLM-L6-v2, gamespace.1 mejora la métrica de recuperación de 0,230 a 0,503 con etiquetas y de 0,208 a 0,376 solo con descripción, a costa de reducir la dimensión de 384 a 128 y de perder generalidad fuera del dominio de videojuegos. Frente a la variante con etapa TSDAE, la diferencia es de 0,503 frente a 0,493, dentro del ruido, y el autor optó por la versión sin TSDAE por preferencia cualitativa en los vecinos. Los modelos generalistas de mayor tamaño no tienen resultados publicados en esta evaluación concreta, por lo que no se dispone de comparación numérica directa.

## Limitaciones y advertencias

- La similitud mide contenido, no calidad: juegos oscuros, de baja calidad o sin lanzar aparecen junto a títulos conocidos si comparten etiquetas y descripción.
- Las etiquetas son generadas por usuarios y están centradas en inglés; las descripciones en otros idiomas se codifican con menor fiabilidad.
- El modelo solo soporta inglés de forma declarada; el uso multilingüe no está validado.
- La ventana de contexto es de 128 tokens, por lo que descripciones largas se truncan y parte de la información se pierde.
- El catálogo de entrenamiento es una instantánea concreta del Steam Games Dataset; los juegos posteriores o sin metadatos pueden quedar mal representados.
- Riesgo de alucinación no aplica en sentido generativo (no produce texto libre), pero sí de recuperar vecinos poco relevantes cuando faltan etiquetas o la descripción es genérica.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo base y el dataset de origen deben citarse conforme a sus propias condiciones.
- No es un modelo generativo: no sirve para responder preguntas, resumir ni razonar; su único uso es producir embeddings de similitud.
- El autor no documenta sesgos demográficos ni culturales más allá del sesgo inherente de las etiquetas de la comunidad de Steam.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GulkoA/gamespace.1
- Demo GameMerge: https://huggingface.co/spaces/GulkoA/gamemerge
- Perfil del autor: https://huggingface.co/GulkoA
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/FronkonGames/steam-games-dataset
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
