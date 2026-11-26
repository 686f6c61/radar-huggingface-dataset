# Himanshuy18/hybrid-search-artifacts

## Resumen

`Himanshuy18/hybrid-search-artifacts` no es un modelo de lenguaje, sino un repositorio de artefactos entrenados para un motor de búsqueda híbrida sobre el conjunto de datos WANDS (Wayfair Annotation Data Set) de búsqueda de productos. Lo publica el usuario Himanshuy18 como complemento del repositorio de GitHub `hybrid-search-engine`, e incluye embeddings precalculados, un re-ranker LightGBM LambdaRank y un fichero de configuración con el peso de fusión por rangos recíprocos (RRF).

El contenido principal son los embeddings de los 42.994 productos de WANDS generados con `all-MiniLM-L6-v2` (vectores float32 de 384 dimensiones, normalizados L2, en el mismo orden que los `product_id`), junto con un modelo de re-ranking LightGBM con 174 árboles y un CSV con los resultados de validación cruzada de cada etapa del pipeline. El tamaño total del repositorio es de aproximadamente 0,1 GB.

Su relevancia es práctica: permite reproducir y evaluar el pipeline de búsqueda híbrida (recuperación densa + re-ranking supervisado) sin necesidad de regenerar los embeddings ni reentrenar el re-ranker. No obstante, al no existir una model card convencional ni metadatos de licencia, idiomas o pipeline, debe tratarse como un paquete de artefactos de un proyecto concreto y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo único: embeddings densos (all-MiniLM-L6-v2) + re-ranker LightGBM LambdaRank |
| Parametros totales | No disponible (el re-ranker tiene 174 árboles; el encoder es all-MiniLM-L6-v2, ~22,7 M de parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (all-MiniLM-L6-v2 admite hasta 256 tokens) |
| Tipos de cuantizacion | No disponible (embeddings en float32; el re-ranker es un fichero de texto LightGBM) |
| Idiomas soportados | No disponible (WANDS es un dataset de productos en inglés) |
| Licencia | No disponible |
| Formato de pesos | `.npy` (embeddings float32), `.txt` (modelo LightGBM), `.json` (configuración), `.csv` (resultados) |

## Arquitectura y entrenamiento

El repositorio agrupa tres componentes de un sistema de recuperación en dos etapas. La primera etapa es densa: los 42.994 productos de WANDS se codifican con `all-MiniLM-L6-v2`, un transformer encoder de tipo sentence-transformers con unos 22,7 millones de parámetros y salida de 384 dimensiones; los vectores se normalizan en L2 para que la similitud coseno equivalga a producto escalar. La segunda etapa es un re-ranker supervisado implementado con LightGBM en modo LambdaRank (optimización directa de una métrica de ranking tipo NDCG), con 174 árboles entrenados sobre las características del pipeline.

El fichero `hybrid_config.json` contiene el peso de fusión por rangos recíprocos que combina las listas de resultados de los recuperadores (presumiblemente BM25 y búsqueda densa). No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta de las características del re-ranker, ni si hubo ajuste fino del encoder; la model card remite al README del repositorio de GitHub para los detalles de construcción y evaluación. El fichero `results.csv` recoge los resultados de validación cruzada de cada etapa.

## Capacidades

- Recuperación semántica de productos mediante similitud coseno sobre embeddings de 384 dimensiones.
- Re-ranking supervisado de listas de candidatos con un modelo de gradient boosting orientado a ranking (LambdaRank).
- Fusión de resultados de varios recuperadores mediante reciprocal rank fusion con peso configurable.
- Evaluación reproducible por etapas: el CSV de resultados permite comparar recuperación, re-ranking y fusión.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidad multilingüe limitada a la del encoder subyacente y al dominio del dataset (productos de muebles y decoración en inglés).

## Casos de uso

- Reproducción de experimentos de búsqueda híbrida: cargar `embeddings/products.npy` y `models/lambdarank.txt` permite replicar el pipeline del repositorio sin reindexar los 42.994 productos ni reentrenar el re-ranker.
- Punto de partida para un buscador de catálogo propio: sustituir los embeddings de WANDS por los del catálogo real manteniendo la arquitectura de dos etapas y el esquema de características del re-ranker.
- Comparación de estrategias de fusión: usar `hybrid_config.json` como referencia para calibrar el peso de RRF entre recuperación léxica y densa en otros dominios.
- Docencia y prototipado de learning-to-rank: el par embeddings + modelo LightGBM en formato texto facilita inspeccionar árboles y entender cómo influyen las características en el orden final.
- Evaluación offline de motores de búsqueda: `results.csv` sirve como línea base de métricas por etapa para contrastar cambios en el pipeline.
- Integración en un servicio de búsqueda de baja latencia: con 42.994 vectores de 384 dimensiones (unos 66 MB en float32) la búsqueda exacta por producto escalar es viable en CPU, y el re-ranker LightGBM añade un coste de inferencia mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `results.csv` con resultados de validación cruzada de cada etapa, pero sus valores no se detallan en la información proporcionada.

## Requisitos de hardware

- Almacenamiento: unos 66 MB para los embeddings float32 (42.994 × 384 × 4 bytes) más el modelo LightGBM y los ficheros auxiliares; el repositorio completo ocupa ~0,1 GB.
- VRAM: no requiere GPU; tanto la búsqueda por similitud coseno como la inferencia de LightGBM se ejecutan en CPU.
- GPU recomendadas: ninguna imprescindible. Si se regeneran los embeddings con `all-MiniLM-L6-v2`, una GPU consumer (RTX 3060 o superior) acelera el proceso, aunque el encoder cabe en cualquier GPU con 2 GB o más.
- Cabe en cualquier equipo consumer: el cuello de botella es la memoria RAM para mantener la matriz de embeddings (unos 66 MB) y el índice, no la GPU.
- Opciones de despliegue: el re-ranker LightGBM se sirve con la librería `lightgbm` (predicción nativa o a través de ONNX Runtime); los embeddings se cargan con NumPy y la búsqueda puede implementarse con FAISS, hnswlib o producto escalar directo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo / artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Himanshuy18/hybrid-search-artifacts | Embeddings + re-ranker LightGBM (artefactos) | ~22,7 M (encoder) + 174 árboles | 256 tokens (encoder) | No disponible | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | Encoder de frases | ~22,7 M | 256 tokens | Apache 2.0 | Hugging Face |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | Cross-encoder de re-ranking | ~22,7 M | 512 tokens | Apache 2.0 | Hugging Face |
| BAAI/bge-small-en-v1.5 | Encoder de frases | ~33 M | 512 tokens | MIT | Hugging Face |

La comparación es aproximada: los tres alternativos son modelos publicados de forma independiente, mientras que este repositorio son artefactos entrenados para un pipeline concreto y no un modelo reutilizable fuera de ese contexto.

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto ni admite instrucciones; solo sirve dentro del pipeline para el que fue construido.
- Los embeddings están atados al orden de `product_id` de WANDS; usarlos con otro catálogo exige regenerarlos y reentrenar el re-ranker.
- La licencia no está especificada, lo que impide asumir derechos de uso comercial; hay que contactar con el autor o consultar el repositorio de GitHub antes de usarlo en producción.
- El dataset WANDS es de dominio específico (muebles y decoración en inglés) y pequeño (42.994 productos); el re-ranker puede no generalizar a otros dominios o idiomas.
- El re-ranker LightGBM depende del esquema exacto de características con el que se entrenó; cambios en el recuperador o en las señales de entrada degradan el rendimiento sin aviso.
- Riesgo de sesgo heredado del dataset y del encoder subyacente; no se documentan evaluaciones de sesgo ni de robustez.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad; los resultados de `results.csv` no han sido auditados de forma independiente.
- No se documentan límites de contexto, latencia ni throughput del sistema completo, lo que dificulta estimar su viabilidad en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Himanshuy18/hybrid-search-artifacts
- Repositorio del pipeline en GitHub: https://github.com/Himanshuy1718/hybrid-search-engine
- Encoder subyacente: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Documentación de LightGBM (LambdaRank): https://lightgbm.readthedocs.io/en/latest/
