# georgeven/songmae-base-32x1

## Resumen

SongMAE-Base 32x1 es un autoencoder enmascarado (masked autoencoder) desarrollado por George Vengrovski para el aprendizaje de representaciones de alta resolución de cantos de aves. El modelo se entrena sobre espectrogramas mel de audio mono a 32 kHz y produce embeddings densos cada 5 milisegundos, lo que permite capturar variaciones temporales y espectrales finas en las vocalizaciones. Está diseñado como un codificador congelado para tareas de recuperación, visualización, agrupamiento y sondas de aprendizaje automático en bioacústica, y no realiza clasificación de especies ni generación de audio.

El checkpoint base se preentrenó durante 500.000 pasos en el subconjunto XCL de BirdSet, compuesto por 528.434 grabaciones de Xeno-Canto que suman 7.562 horas, con una partición 95/5 para entrenamiento y validación tras eliminar los taxones de evaluación. Con 14,9 millones de parámetros, es un modelo compacto que puede ejecutarse en CPU o GPU de consumo, y se distribuye bajo licencia MIT con pesos en formato safetensors. Su relevancia radica en ofrecer una representación bioacústica de alta granularidad temporal, superando las limitaciones de los embeddings por clip completos y habilitando análisis a nivel de evento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked autoencoder (MAE) para espectrogramas de audio, con codificador transformer |
| Parametros totales | 14.889.409 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 5 segundos de audio (contexto de procesamiento por ventana) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (entrada de audio, no texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SongMAE sigue el paradigma de los masked autoencoders: se enmascaran parches del espectrograma de entrada y el modelo aprende a reconstruir las regiones ocultas, forzando al codificador a capturar representaciones semánticas y acústicas robustas. El codificador procesa tensores normalizados de log-mel de forma `(batch, 1, 128, 1000)`, donde 128 son los bins mel y 1000 los pasos temporales (5 ms por paso). Cada parche abarca 32 bins mel y 1 paso temporal, de ahí el nombre "32x1". La salida del codificador es una secuencia de vectores de 384 dimensiones por parche, que se concatenan en grupos de cuatro para formar embeddings de 1536 dimensiones por cada 5 ms.

El entrenamiento se realizó sobre el subconjunto XCL de BirdSet, con 528.434 grabaciones de Xeno-Canto (7.562 horas). Se aplicó una normalización fija con media -58,69 y desviación estándar 20,18 sobre los valores de decibelios relativos al máximo de cada grabación. El modelo se preentrenó durante 500.000 pasos con el run `xcl_base_500k_p32x1_c005`, y el checkpoint final corresponde al paso 499.999. No se menciona el uso de RLHF ni DPO; es un preentrenamiento auto-supervisado puro.

## Capacidades

- Extracción de características bioacústicas: genera embeddings de clip (media temporal de 1536 dimensiones) y embeddings por token (1536 dimensiones cada 5 ms) a partir de audio mono.
- Representación de alta resolución temporal: cada 5 ms se produce un vector, lo que permite análisis de eventos cortos como sílabas o trinos.
- Procesamiento de audio en contextos de 5 segundos: adecuado para grabaciones de campo segmentadas.
- Integración con Hugging Face Transformers: se carga mediante `AutoModel` con `trust_remote_code=True`, facilitando su uso en pipelines existentes.
- Compatibilidad con CPU y GPU: al ser un modelo pequeño, puede ejecutarse en entornos sin aceleración.
- Salida estructurada: devuelve `clip_embedding`, `token_embeddings`, `token_grid` y `timestamps_ms`, lo que facilita el postprocesado.

## Casos de uso

- Recuperación de cantos por similitud: dado un canto de referencia, se puede buscar en una base de datos de grabaciones comparando los `clip_embedding` mediante distancia coseno, útil para identificar especies o individuos.
- Agrupamiento y análisis de dialectos: los embeddings por token permiten agrupar sílabas o frases dentro de una grabación, revelando variaciones geográficas o individuales en el canto.
- Visualización de estructura acústica: los `token_embeddings` pueden proyectarse en 2D (t-SNE, UMAP) para explorar la organización temporal y espectral de las vocalizaciones.
- Monitoreo acústico pasivo: procesar grabaciones largas en ventanas de 5 segundos para generar descriptores que alimenten clasificadores de presencia de especies en estudios de biodiversidad.
- Sondas de representación (probing): usar los embeddings como entrada a modelos lineales o MLP para tareas específicas como clasificación de especies o estimación de parámetros acústicos, aprovechando la representación preentrenada.
- Análisis de desarrollo vocal: comparar los embeddings de juveniles y adultos para estudiar la ontogenia del canto, gracias a la resolución temporal de 5 ms.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación en tareas downstream como clasificación de especies o recuperación.

## Requisitos de hardware

- VRAM estimada: con 14,9 millones de parámetros, el modelo en FP32 ocupa aproximadamente 60 MB, y en FP16 unos 30 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU sin problemas.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 10xx o superior, RTX, etc.) es suficiente; también funciona en Apple Silicon y CPUs ARM.
- Ejecución en CPU: viable para inferencia en lote o tiempo real moderado, dado el bajo coste computacional.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con Hugging Face Inference Endpoints, o integrarse en scripts Python. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales, pero por el tamaño del modelo se espera una latencia de milisegundos por ventana de 5 segundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han identificado alternativas específicas para representación de cantos de aves con características similares (tamaño, resolución temporal, licencia) en las fuentes consultadas.

## Limitaciones y advertencias

- No es un clasificador de especies: el modelo produce representaciones, pero no asigna etiquetas taxonómicas; se requiere un clasificador adicional.
- No genera audio: es un codificador puro, no un modelo generativo.
- Contexto limitado a 5 segundos: las grabaciones largas se procesan en ventanas independientes, por lo que no hay atención entre contextos; eventos que cruzan los límites pueden fragmentarse.
- Dependencia de la distribución de preentrenamiento: el modelo se entrenó con grabaciones de Xeno-Canto, principalmente de aves; taxones o condiciones de campo muy diferentes pueden producir representaciones subóptimas.
- Normalización específica: los valores de entrada deben normalizarse con la media y desviación estándar fijas del preentrenamiento; un uso incorrecto degrada el rendimiento.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; se recomienda validar en el dominio de aplicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/georgeven/songmae-base-32x1
- Colección de modelos SongMAE: https://huggingface.co/collections/georgeven/songmae-a-bioacoustic-encoder-for-birdsong-6a91eb9c42e5cde53962fbec
- Paper (bioRxiv): https://www.biorxiv.org/content/10.64898/2026.08.17.745361v1
- Código fuente: https://github.com/georgevenven/SongMAE
