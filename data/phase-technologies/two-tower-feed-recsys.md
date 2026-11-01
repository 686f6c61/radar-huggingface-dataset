# Phase-Technologies/two-tower-feed-recsys

## Resumen

Two-Tower Feed Recsys es un sistema de recomendacion de dos torres desarrollado por Phase-Technologies, disenado para generacion de candidatos en tiempo real, ranking de feeds y personalizacion en escenarios de cold-start. Se publica como un par de modulos PyTorch (`item_tower.pt` y `user_tower.pt`) que proyectan items y usuarios en un espacio compartido de 128 dimensiones con normalizacion L2, permitiendo recuperacion por similitud coseno.

El modelo es deliberadamente compacto: 270.336 parametros en total (132.736 en la torre de items y 137.600 en la torre de usuario), lo que permite inferencia en CPU por debajo del milisegundo. La torre de items combina un one-hot de 5 categorias con embeddings densos de 384 dimensiones generados por `all-MiniLM-L6-v2`; la torre de usuario combina una matriz de afinidad registrada (15 dimensiones), el centroide del historial de interacciones (389 dimensiones) y un one-hot de franja de edad (4 dimensiones).

Su relevancia actual radica en que ofrece un patron reproducible y ligero de retrieval neuronal para sistemas de recomendacion, con heuristicas de serving explicitas (penalizacion por frescura, re-ranking por diversidad y exploracion epsilon-greedy) que cubren el ciclo completo desde la puntuacion hasta la seleccion final del feed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Two-Tower MLP desacoplado con metric learning por similitud coseno |
| Parametros totales | 270.336 (ItemTower: 132.736 · UserTower: 137.600) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; historial de hasta 20 publicaciones) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (depende del encoder de texto `all-MiniLM-L6-v2`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (state_dict) |
| Dimension de embedding | 128 (salida L2-normalizada) |
| Dimension de entrada (items) | 389 (5 one-hot de categoria + 384 de texto) |
| Dimension de entrada (usuario) | 408 (15 afinidad + 389 historial + 4 demografia) |
| Latencia de inferencia | < 1,0 ms en CPU estandar |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

Cada torre es un perceptron multicapa de dos capas: `Linear(entrada, 256) → ReLU → Linear(256, 128)`, seguido de normalizacion L2 sobre la salida. La torre de items recibe la concatenacion de un one-hot de 5 categorias (Tech, Business, Arts, Entertainment, Sports) y el embedding de 384 dimensiones del texto del post generado con `sentence-transformers/all-MiniLM-L6-v2`. La torre de usuario recibe tres bloques: una matriz de afinidad de 15 dimensiones (5 categorias x 3 senales de accion: likes, watch_time, comments, transformadas con `log(1 + x)`), el vector medio de 389 dimensiones de las ultimas N ≤ 20 publicaciones con las que el usuario interactuo, y un one-hot de 4 franjas de edad.

El entrenamiento se plantea como metric learning sobre similitud coseno en la hiperesfera de 128 dimensiones, de modo que items y usuarios con interaccion positiva quedan proximos. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de refuerzo o preferencias (RLHF/DPO); esa informacion no esta disponible. La innovacion destacable no reside en la arquitectura, sino en el diseno operativo: el sistema incluye formulas de serving explicitas con penalizacion lineal por frescura (`λ_fresh = 0,01` por dia de antiguedad), re-ranking greedy de diversidad (`λ_div = 0,05` por categoria ya seleccionada) y exploracion epsilon-greedy (`ε = 0,1`) sobre el pool activo de 14 dias para descubrir intereses emergentes y registrar datos no sesgados.

## Capacidades

- Generacion de candidatos por retrieval: proyecta items y usuarios al mismo espacio y puntua por producto escalar (similitud coseno).
- Extraccion de caracteristicas: pipeline `feature-extraction` que devuelve embeddings de 128 dimensiones para items y usuarios.
- Personalizacion en cold-start: la torre de usuario admite un historial de ceros (`torch.zeros(389)`) para usuarios sin interacciones, apoyandose en demografia y afinidad.
- Ranking de feed con penalizacion por frescura y re-ranking por diversidad de categoria.
- Exploracion controlada mediante epsilon-greedy para evitar camaras de eco y recoger datos de entrenamiento futuro.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso ni agentes: es un modelo de retrieval.
- Capacidades multilingues: no disponibles de forma explicita; dependen del encoder de texto subyacente.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Feed de noticias personalizado: la torre de usuario codifica afinidad e historial reciente y la torre de items embebe cada publicacion; la puntuacion coseno con penalizacion de frescura ordena candidatos del dia, y el re-ranking de diversidad evita que el feed se convierta en un monocultivo tematico.
- Generacion de candidatos en un sistema de retrieval a gran escala: al ser un embedding de 128 dimensiones, se puede indexar en FAISS o ScaNN y recuperar los top-k vecinos mas proximos por usuario con latencia de milisegundos.
- Personalizacion para usuarios nuevos (cold-start): con historial a ceros, la torre de usuario sigue produciendo un vector valido a partir de la franja de edad y la afinidad inicial, permitiendo servir recomendaciones desde la primera sesion.
- Descubrimiento de intereses emergentes: la exploracion epsilon-greedy del 10 % muestrea items del pool activo de 14 dias, lo que permite detectar temas nuevos y registrar impresiones no sesgadas para reentrenar el modelo.
- Moderacion de camaras de eco: la penalizacion `λ_div = 0,05` por categoria repetida en una sesion de recomendacion limita la concentracion tematica y mejora la diversidad del feed sin sacrificar relevancia.
- Prototipado rapido en Colab o entornos de investigacion: el modelo completo (270.336 parametros) se carga en CPU, se ejecuta en menos de 1 ms y no requiere GPU, lo que facilita experimentar con heuristicas de serving antes de invertir en infraestructura.
- Filtrado previo en pipelines de ranking de dos etapas: este modelo actua como etapa de retrieval y reduce el catalogo a unos cientos de candidatos que un ranker mas pesado puede puntuar despues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 para los pesos (270.336 parametros x 4 bytes ≈ 1,08 MB), mas el encoder `all-MiniLM-L6-v2` (aproximadamente 90 MB en float32) si se usa en el mismo proceso.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (RTX 3060, RTX 4090) es sobredimensionada para las torres. El cuello de botella, si se usa el encoder de texto, es la codificacion de items.
- Cabe en cualquier GPU consumer e incluso en CPU de un portatil; la model card reporta < 1,0 ms de latencia en CPU estandar para las torres.
- Opciones de despliegue: PyTorch nativo, TorchScript o exportacion a ONNX para serving; el encoder de texto puede servirse con `sentence-transformers` o como modelo ONNX independiente. No hay soporte nativo para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: latencia de las torres por debajo de 1 ms en CPU; el throughput depende del batch y del coste de codificar textos nuevos con `all-MiniLM-L6-v2`. Para items ya embebidos, la recuperacion es una simple operacion de producto escalar indexada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Contexto / entradas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Two-Tower Feed Recsys (Phase-Technologies) | 270.336 | 128 | Historial de 20 items + afinidad + demografia | Apache 2.0 | Retrieval de dos torres para feeds |
| Matrix Factorization clasico (p. ej. ALS/BPR) | Variable segun usuarios e items | 64-256 | Solo IDs de usuario e item | Segun implementacion | Factorizacion colaborativa, sin contenido |
| LightGCN | Variable segun grafo | 64-128 | Grafo de interacciones | MIT (implementaciones habituales) | Filtrado colaborativo sobre grafo |
| Two-tower con encoder BERT grande | Decenas de millones | 256-768 | Texto completo del item | Segun encoder | Retrieval semantico de mayor coste |

La ventaja del modelo de Phase-Technologies frente a la factorizacion clasica es que incorpora senales de contenido (embeddings de texto y categoria) y demografia, lo que le permite generalizar a items y usuarios nuevos. Frente a variantes con encoders BERT grandes, sacrifica capacidad semantica a cambio de latencia inferior al milisegundo y un footprint de parametros minimo. No se dispone de datos publicados de rendimiento (nDCG, recall@k) para comparar cuantitativamente con estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: la demografia se limita a cuatro franjas de edad y no se documenta la composicion del dataset de entrenamiento, por lo que pueden existir sesgos de edad y de categoria no auditados.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el modelo puede producir recomendaciones irrelevantes o populares en exceso si el historial es escaso o el catalogo esta desbalanceado.
- Limitaciones de contexto: el historial se trunca a las ultimas 20 publicaciones y se resume en un unico vector medio, lo que pierde estructura temporal y secuencial de las interacciones.
- Limitaciones de idioma: no se declaran idiomas soportados; el rendimiento depende del encoder `all-MiniLM-L6-v2`, orientado principalmente al ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del encoder `all-MiniLM-L6-v2` y de los datos de entrenamiento originales.
- Caveat para produccion: las heuristicas de serving (`λ_fresh = 0,01`, `λ_div = 0,05`, `ε = 0,1`) son hiperparametros fijados en la model card y no se han validado de forma publica; requieren ajuste con datos propios.
- El repositorio tiene 0,0 GB y 39 descargas, sin likes ni validacion externa; es un artefacto de referencia, no un modelo con adopcion contrastada.
- No se documenta el proceso de entrenamiento (datos, epocas, funcion de perdida exacta), lo que dificulta reproducir o auditar el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/Phase-Technologies/two-tower-feed-recsys
- Encoder de texto: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Google Colab: https://colab.research.google.com/
- Repositorio de `sentence-transformers`: https://github.com/UKPLab/sentence-transformers
