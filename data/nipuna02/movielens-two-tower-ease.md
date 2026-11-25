# nipuna02/movielens-two-tower-ease

## Resumen

MovieLens-two-tower-ease es un paquete de artefactos de recomendación entrenados sobre el conjunto de datos MovieLens-1M, publicado por el usuario nipuna02 (Nipuna Lakruwan) junto al repositorio `movie-recommender` en GitHub. No se trata de un modelo de lenguaje, sino de dos sistemas de filtrado colaborativo complementarios: una red de dos torres (two-tower) implementada en PyTorch y una matriz de pesos ítem-ítem generada con el algoritmo EASE (Embarrassingly Shallow Autoencoder). El paquete incluye además el mapeo de identificadores de películas (`item_ids.json`) necesario para interpretar las salidas.

El modelo resuelve el problema clásico de recomendación de películas: predecir qué títulos consumirá un usuario a partir de su historial. La torre de usuario se construye agrupando (pooling) los embeddings de las últimas 50 películas vistas, mientras que la torre de ítem combina un embedding de identificador con una proyección de características de contenido (géneros, año y un embedding de título de MiniLM). Esta hibridación permite recomendar también películas sin valoraciones, lo que mitiga parcialmente el problema de arranque en frío.

Su relevancia es fundamentalmente didáctica y de referencia: ofrece una implementación reproducible, con métricas publicadas y comparación frente a una línea base de popularidad, sobre un dataset pequeño y bien conocido. El tamaño del repositorio es de 0,1 GB y la licencia es MIT, lo que facilita su reutilización y estudio. No obstante, el modelo no está pensado para producción a gran escala ni para dominios distintos del cine estadounidense de finales de los noventa y principios de los dos mil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Two-tower (red neuronal de dos torres) + EASE (autoencoder lineal ítem-ítem) |
| Parametros totales | no disponible (no se detalla el recuento; dimensión de embedding de 64 en la torre) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; historial de usuario limitado a las últimas 50 películas |
| Tipos de cuantizacion | no disponible (pesos en PyTorch state dict y matriz NumPy) |
| Idiomas soportados | no disponible (los títulos se codifican con MiniLM; el dataset original es en inglés) |
| Licencia | MIT |
| Formato de pesos | `two_tower.pt` (PyTorch state dict), `ease_B.npy` (NumPy), `item_ids.json` (mapeo de índices) |

## Arquitectura y entrenamiento

La torre de usuario agrega los embeddings de las últimas 50 películas del historial mediante pooling, produciendo un vector de 64 dimensiones. La torre de ítem combina un embedding de identificador de película con una proyección de atributos de contenido: géneros, año de estreno y un embedding del título generado con MiniLM. La matriz de contenido se almacena como buffer `content` dentro del state dict, lo que permite invocar `items(use_id=False)` para obtener representaciones de películas sin valoraciones registradas. El modelo EASE, por su parte, es un autoencoder lineal cerrado que aprende una matriz de pesos ítem-ítem de 3.706 × 3.706 con regularización λ = 1000; la puntuación de un usuario se obtiene multiplicando su fila binaria (0/1) de interacciones por dicha matriz.

El entrenamiento se realizó sobre MovieLens-1M, un conjunto de aproximadamente un millón de valoraciones de usuarios estadounidenses recopiladas en el año 2000 por GroupLens. La evaluación se plantea como una tarea de predicción de la siguiente interacción: para cada uno de los 6.040 usuarios de test se ocultan sus siguientes 5 valoraciones y se ranea el catálogo completo. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de refinamiento posteriores, algo esperable en un sistema de recomendación y no en un modelo generativo. Tampoco se detalla el número de épocas, la tasa de aprendizaje ni la composición exacta de las particiones de entrenamiento y validación.

## Capacidades

- Recomendación de películas personalizada a partir del historial de interacciones del usuario.
- Filtrado colaborativo puro mediante EASE, con puntuaciones derivadas de la matriz ítem-ítem.
- Recomendación híbrida contenido-colaborativa mediante la torre de ítem, que incorpora géneros, año y título.
- Manejo de arranque en frío parcial: la torre de contenido permite puntuar películas sin valoraciones mediante `items(use_id=False)`.
- Ranking sobre el catálogo completo (3.706 ítems), no solo sobre un subconjunto candidato.
- Evaluación con métricas estándar de recuperación (Recall@10, NDCG@10) y comparación con línea base de popularidad.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües: es un sistema de recomendación, no un modelo de lenguaje.

## Casos de uso

- Prototipado de sistemas de recomendación: sirve como referencia reproducible para comparar un enfoque neuronal (two-tower) frente a uno lineal (EASE) sobre el mismo dataset y con las mismas métricas.
- Docencia y formación en filtrado colaborativo: el paquete incluye pesos, mapeo de identificadores y métricas publicadas, lo que facilita explicar en clase la diferencia entre modelos de factorización y autoencoders lineales.
- Investigación en arranque en frío: la torre de contenido permite experimentar con películas sin interacciones y comparar frente a una línea base de género (Recall@10 de 0,202 frente a 0,096 según la model card).
- Construcción de un servicio de recomendación de catálogo pequeño: con 3.706 ítems, la matriz EASE cabe en memoria (unos 110 MB en float32) y puede servirse con una multiplicación matricial dispersa en CPU.
- Generación de candidatos en un pipeline de ranking en dos etapas: el two-tower puede producir embeddings de usuario y de ítem para una búsqueda aproximada de vecinos antes de un reranker más costoso.
- Análisis de sesgos de audiencia: al estar entrenado con usuarios estadounidenses del año 2000, permite estudiar cómo un modelo reproduce preferencias y sesgos de una población y época concretas.
- Integración en un sistema de demo o portafolio: el tamaño reducido (0,1 GB) y la licencia MIT permiten desplegarlo en un espacio de Hugging Face Spaces o en un contenedor ligero sin infraestructura GPU.

## Benchmarks y rendimiento

Resultados publicados en la model card para la tarea de predecir las siguientes 5 valoraciones de cada usuario, con ranking sobre el catálogo completo y 6.040 usuarios de test:

| Modelo | Recall@10 | NDCG@10 |
|---|---|---|
| Two-tower | 0,129 [0,124; 0,134] | 0,109 |
| EASE | 0,087 [0,083; 0,091] | 0,071 |
| Popularidad | 0,039 | 0,033 |

Arranque en frío (370 películas ocultas durante el entrenamiento):

| Modelo | Recall@10 |
|---|---|
| Two-tower (lado de contenido) | 0,202 |
| Línea base de género | 0,096 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se requieren GPU para servir el modelo. La matriz EASE (3.706 × 3.706 en float32) ocupa aproximadamente 110 MB en memoria RAM; el state dict del two-tower es aún menor.
- GPU recomendadas: ninguna en particular. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) acelera el entrenamiento y la inferencia por lotes, pero el sistema funciona en CPU.
- Cabe en GPU consumer: sí, con amplio margen; el cuello de botella es la memoria del sistema, no la VRAM.
- Opciones de despliegue: inferencia directa con PyTorch y NumPy; para servicio en línea, exportar los embeddings a FAISS, Annoy o ScaNN para búsqueda de vecinos aproximada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Con 3.706 ítems, una multiplicación matriz-vector dispersa por usuario es del orden de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Enfoque | Ítems | Contexto de usuario | Recall@10 (MovieLens-1M) | Licencia |
|---|---|---|---|---|---|
| Two-tower + EASE (este paquete) | Híbrido neuronal + lineal | 3.706 | Últimas 50 películas | 0,129 (two-tower) / 0,087 (EASE) | MIT |
| NCF (Neural Collaborative Filtering) | Red neuronal sobre interacciones | Configurable | Historial completo | no disponible en esta ficha | MIT (implementación de referencia) |
| LightGCN | Propagación en grafo | Configurable | Grafo de interacciones | no disponible en esta ficha | MIT (implementación de referencia) |
| BPR-MF | Factorización matricial con ranking por pares | Configurable | Historial completo | no disponible en esta ficha | MIT (implementación de referencia) |

La comparación con alternativas se limita a la categoría y al enfoque, ya que no se dispone de resultados reproducidos bajo la misma partición y protocolo de evaluación para los otros modelos. Cualquier comparación numérica directa exigiría reentrenar cada alternativa con el mismo esquema de test.

## Limitaciones y advertencias

- Sesgo de audiencia y época: MovieLens-1M contiene valoraciones de usuarios estadounidenses del año 2000; las recomendaciones reflejan las preferencias y los sesgos de esa población y ese momento, y no son representativas de audiencias actuales ni globales.
- Riesgo de popularidad: al igual que otros sistemas de filtrado colaborativo, tiende a favorecer títulos con muchas interacciones; la línea base de popularidad alcanza Recall@10 de 0,039, lo que indica que parte de la señal es trivialmente popular.
- Arranque en frío limitado: la mitigación mediante contenido depende de metadatos (género, año, título) y de un embedding de MiniLM; usuarios nuevos sin historial no tienen representación en la torre de usuario.
- Alcance restringido al dominio cinematográfico: no es un modelo de lenguaje y no puede adaptarse a otros dominios sin reentrenamiento.
- Sin soporte multilingüe documentado: los títulos y géneros están en inglés y el dataset original no cubre otros idiomas.
- Sin datos de calibración ni de incertidumbre más allá de los intervalos de confianza de Recall@10 publicados.
- Restricciones de licencia: los pesos se distribuyen bajo MIT, pero el dataset MovieLens-1M está licenciado por GroupLens para uso de investigación; el uso comercial de los artefactos derivados debe revisarse con la licencia del dataset.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad ni de mantenimiento continuado.
- Fecha de creación registrada en 2026: conviene verificar la procedencia y la vigencia del repositorio antes de integrarlo en un proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nipuna02/movielens-two-tower-ease
- Repositorio GitHub del autor: https://github.com/Nipuna-Lakruwan/movie-recommender
- Dataset MovieLens-1M (GroupLens): https://grouplens.org/datasets/movielens/1m/
- Referencia de EASE (Steck, 2019): https://arxiv.org/abs/1905.03375
- Referencia de two-tower para recomendación (Yi et al., 2019): https://arxiv.org/abs/1906.00091
- Referencia de MovieLens (Harper y Konstan, 2015): https://doi.org/10.1145/2827872
