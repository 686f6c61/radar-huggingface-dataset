# MohammadKafshgar/persian-poet-stylometry

## Resumen

El modelo `MohammadKafshgar/persian-poet-stylometry` es un clasificador de estilometría para poesía clásica persa. Dado un fragmento de uno o varios versos (beits), predice una lista ordenada de los poetas más probables entre 182 autores clásicos. Lo desarrolla MohammadKafshgar y se publica bajo licencia MIT, con el pipeline de HuggingFace `text-classification` y la librería scikit-learn.

A diferencia de los modelos modernos basados en redes neuronales, este sistema emplea tres pipelines clásicos de aprendizaje automático: extracción de características TF-IDF sobre n-gramas de caracteres (2 a 5) y clasificación con LinearSVC. Un router ligero selecciona el modelo adecuado según la longitud del fragmento de entrada (1-2, 3-5 o 6+ beits), lo que permite mantener una precisión aceptable incluso en textos muy cortos. El repositorio tiene un tamaño de 0,3 GB y no presenta descargas ni valoraciones en el momento de la consulta.

La relevancia de este modelo radica en su enfoque específico para un dominio literario con alta sensibilidad estilística: la poesía persa clásica. Al trabajar con n-gramas de caracteres, captura patrones inconscientes del autor (combinaciones de letras, afijos, rimas) que permanecen en fragmentos breves, algo que los modelos basados en palabras o temas no logran. Es una herramienta útil para investigación filológica, atribución de autoría y análisis digital de humanidades.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (char n-gram, rango 2-5) + LinearSVC (tres modelos independientes) |
| Parametros totales | No aplica (modelo clásico, no red neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica; trabaja con fragmentos de 1 a 6+ beits (versos) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Persa (fa) |
| Licencia | MIT |
| Formato de pesos | skops (archivos .skops: `vec_k*.skops`, `clf_k*.skops`) |

## Arquitectura y entrenamiento

El modelo no es una red neuronal, sino un pipeline clásico de scikit-learn. Cada uno de los tres modelos (para longitudes de 1-2, 3-5 y 6+ beits) combina un `TfidfVectorizer` con `analyzer="char_wb"` y `ngram_range=(2,5)` seguido de un clasificador `LinearSVC`. Los n-gramas de caracteres capturan firmas estilísticas sutiles (combinaciones recurrentes de letras, afijos, patrones de rima) que se mantienen incluso en textos muy cortos, a diferencia de señales basadas en palabras o temas.

El entrenamiento se realizó sobre 182 poetas clásicos persas, con aproximadamente 125.700 poemas obtenidos de Ganjoor.net. Los poemas se dividieron en beits y se agruparon en segmentos no solapados que coinciden con la longitud objetivo de cada modelo. La división train/validation/test se hizo a nivel de poema completo (no a nivel de fragmento) para evitar fuga de datos. Los autores señalan que la falta de coincidencia entre la longitud de entrenamiento y la de evaluación era el mayor factor de pérdida de precisión en entradas cortas, por lo que entrenar tres modelos con longitudes específicas resolvió ese problema.

## Capacidades

- Clasificación de autoría en poesía persa clásica: dado un fragmento de 1 o más beits, devuelve una lista ordenada de los poetas más probables entre 182 autores.
- Ranking de candidatos: proporciona las 5 mejores predicciones con una puntuación aproximada de probabilidad (softmax sobre los márgenes de decisión de LinearSVC).
- Robustez en fragmentos cortos: el router selecciona el modelo entrenado con la longitud adecuada, lo que mantiene una precisión razonable incluso con 1-2 beits.
- Funciona con texto normalizado en persa: incluye normalización mediante la librería `hazm`.
- No requiere GPU: es un modelo ligero que corre en CPU.
- Integración sencilla: se puede cargar con `skops` y `huggingface_hub`, o usar el script `predict.py` incluido en el repositorio.

## Casos de uso

- Atribución de autoría en manuscritos o poemas anónimos: un investigador puede introducir un fragmento de un poema sin autor conocido y obtener una lista de poetas probables, priorizando los 5 primeros resultados para acotar la búsqueda.
- Análisis filológico de estilos poéticos: permite comparar la cercanía estilística entre poetas de una misma escuela o época, identificando influencias o discípulos directos (por ejemplo, Rumi y sus contemporáneos).
- Verificación de autoría en ediciones digitales: ayuda a detectar posibles errores de atribución en bases de datos de poesía persa, contrastando fragmentos con el modelo.
- Investigación en humanidades digitales: sirve como herramienta de apoyo para estudios cuantitativos sobre la evolución del estilo poético persa a lo largo de los siglos.
- Clasificación automática de corpus poéticos: puede integrarse en pipelines de procesamiento de texto para etiquetar automáticamente poemas de una colección digital según su autor probable.
- Enseñanza de literatura persa: los estudiantes pueden experimentar con fragmentos de poetas conocidos y observar cómo el modelo agrupa estilos, facilitando la comprensión de las características formales de cada autor.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas, calculadas sobre una partición de test a nivel de poema (sin fuga entre entrenamiento y prueba), micro-promediadas sobre los 182 poetas:

| Longitud de entrada | Recall@1 | Recall@5 | Recall@10 | MRR |
|---|---|---|---|---|
| 1-2 beits (k=2) | 55,52% | 78,82% | 86,50% | 0,6604 |
| 3-5 beits (k=4) | 70,65% | 87,53% | 91,92% | 0,7821 |
| 6+ beits (k=6) | 76,61% | 89,69% | 93,07% | 0,8252 |

No se han publicado comparaciones con otros modelos en la información disponible. El paper PARSI (arXiv:2506.21840) propone un enfoque más moderno con representaciones contextuales, pero no se ofrecen resultados comparativos directos con este modelo.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un pipeline de scikit-learn con vectores TF-IDF y SVM lineales, por lo que no requiere GPU.
- Memoria RAM estimada: el repositorio ocupa 0,3 GB; la carga de los tres modelos completos puede requerir entre 1 y 2 GB de RAM, dependiendo de la máquina.
- GPU recomendada: ninguna; funciona en cualquier ordenador con Python y las dependencias (`scikit-learn`, `skops`, `hazm`, `huggingface_hub`).
- Opciones de despliegue: se puede integrar en una API REST con frameworks como FastAPI o Flask, o usarse directamente en scripts de análisis. No hay soporte nativo para vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje generativo.
- Latencia: al ser un clasificador clásico, la inferencia es prácticamente instantánea (milisegundos) incluso en CPU, aunque depende del tamaño del fragmento de entrada.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada. El paper PARSI (arXiv:2506.21840) describe un sistema de atribución de autoría para poesía persa a nivel de verso que utiliza representaciones contextuales del lenguaje y características literarias, pero no se ofrecen resultados comparativos con este modelo. Otros trabajos como "Creating a New Persian Poet Based on Machine Learning" (arXiv:1810.06898) se centran en generación de poesía, no en clasificación de autoría. Por tanto, la comparativa cuantitativa queda pendiente de futuras publicaciones.

## Limitaciones y advertencias

- Los poetas que principalmente escribieron formas cortas (rubai, qet'e, como Khayyam) obtienen una precisión algo menor que los poetas prolíficos de formas largas.
- La mayoría de los errores restantes ocurren entre poetas de la misma escuela, época o métrica (por ejemplo, poetas de estilo indio, o Rumi y sus discípulos directos). Esto refleja una cercanía estilística genuina, no un defecto del modelo.
- Las puntuaciones de confianza mostradas son una aproximación softmax sobre los márgenes de decisión de LinearSVC, no probabilidades calibradas. Deben usarse para ordenar candidatos, no como confianza estadística literal.
- El modelo solo trabaja con poesía persa clásica; no es aplicable a otros idiomas ni a poesía moderna sin reentrenamiento.
- No se han documentado sesgos específicos más allá de los mencionados, pero al estar entrenado con un corpus de Ganjoor.net, puede reflejar los sesgos de esa fuente (por ejemplo, sobrerrepresentación de ciertos poetas o períodos).
- Para uso en producción, se recomienda validar el comportamiento en el dominio concreto y considerar la calibración de las puntuaciones si se necesitan probabilidades fiables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MohammadKafshgar/persian-poet-stylometry
- Demo interactiva: https://huggingface.co/spaces/MohammadKafshgar/persian-poet-demo
- Fuente de datos (Ganjoor.net): https://ganjoor.net
- Paper relacionado (PARSI): https://arxiv.org/pdf/2506.21840
- Trabajo sobre generación de poesía persa con ML: https://arxiv.org/abs/1810.06898v1
