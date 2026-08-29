# georgeven/songmae-large-32x1

## Resumen

SongMAE-Large 32x1 es un masked autoencoder (MAE) basado en Vision Transformer (ViT) diseñado para el aprendizaje de representaciones de canto de aves a alta resolución temporal. Desarrollado por George Vengrovski (georgeven), el modelo se entrena de forma auto-supervisada mediante reconstrucción de espectrogramas enmascarados, lo que permite obtener embeddings densos y temporales sin necesidad de etiquetas. Su relevancia radica en que facilita tareas como recuperación de cantos, clustering de sílabas, visualización de estructura acústica y análisis downstream en bioacústica, con una resolución de 5 ms por embedding.

El checkpoint concreto (Large 32x1) utiliza parches que abarcan 32 bins mel y 1 bin temporal del espectrograma, produciendo una salida cada 5 ms. Con 98,6 millones de parámetros, el modelo procesa audio en contextos acotados de 5 segundos y genera representaciones de 3072 dimensiones por paso temporal. Está publicado bajo licencia MIT y disponible en HuggingFace con pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked Autoencoder - Vision Transformer (MAE-ViT) sobre mel espectrogramas |
| Parametros totales | 98.645.249 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 5 segundos de audio (1000 frames de espectrograma, 128 bins mel) |
| Tipos de cuantizacion | no disponible (modelo de embeddings, no se ofrecen cuantizaciones) |
| Idiomas soportados | no aplica (entrada de audio, no texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SongMAE sigue el paradigma de los masked autoencoders: se enmascaran parches del espectrograma de mel y el modelo debe reconstruir las regiones ocultas. En esta variante Large, los parches son de 32 bins mel por 1 bin temporal, lo que da una resolución temporal de 5 ms (con un hop de 160 muestras a 32 kHz). La entrada es un tensor de forma `(batch, 1, 128, 1000)` correspondiente a 5 segundos de audio normalizado.

El entrenamiento se realizó durante 500.000 pasos sobre el subconjunto XCL de BirdSet, compuesto por 528.434 grabaciones de Xeno-Canto que suman 7.562 horas. Los taxones utilizados para evaluación downstream se eliminaron antes de dividir el conjunto en 95/5 para entrenamiento y validación. No se emplearon técnicas de RLHF ni DPO; el aprendizaje es puramente auto-supervisado mediante reconstrucción de espectrogramas.

## Capacidades

- Extracción de embeddings de clip: produce un vector global de 3072 dimensiones que resume los 5 segundos de audio.
- Embeddings temporales densos: genera un vector de 3072 dimensiones cada 5 ms (concatenación de 4 vectores de 768), permitiendo análisis fino de sílabas y eventos acústicos.
- Representaciones multiescala: `token_grid` devuelve los 4 vectores de 768 por paso temporal, lo que facilita tareas que requieren separación por bandas de frecuencia.
- Procesamiento de audio en bruto: acepta rutas de archivo o waveforms NumPy mono, con conversión interna a 32 kHz y cálculo de mel espectrograma.
- Uso como encoder congelado: diseñado para extraer características y alimentar modelos downstream (clasificación, clustering, retrieval).
- No es un clasificador de especies ni un generador de audio; su función es exclusivamente representacional.

## Casos de uso

- Recuperación de cantos por similitud: dado un fragmento de audio de un ave, se puede obtener su `clip_embedding` y buscar en una base de datos de grabaciones las más cercanas por distancia coseno, útil para identificar especies o individuos.
- Clustering de sílabas y unidades acústicas: los `token_embeddings` con resolución de 5 ms permiten segmentar y agrupar sílabas repetidas dentro de un canto, facilitando el estudio de repertorios vocales.
- Visualización de estructura de canto: proyectando los embeddings temporales en 2D (t-SNE, UMAP) se pueden inspeccionar patrones de secuencia y variaciones individuales.
- Probes downstream para clasificación de especies: aunque el modelo no es un clasificador, sus embeddings congelados pueden alimentar un clasificador lineal o MLP para etiquetar especies, reduciendo la necesidad de datos etiquetados.
- Análisis de variación geográfica y dialectos: al comparar embeddings de poblaciones distintas, se pueden detectar diferencias acústicas regionales en el canto de una misma especie.
- Monitoreo de biodiversidad: procesando grabaciones de campo, los embeddings permiten detectar presencia de especies objetivo o cambios en la actividad acústica a lo largo del tiempo, sin requerir transcripción manual.
- Estudio de ontogenia vocal: al analizar cantos de juveniles y adultos, los embeddings temporales pueden revelar diferencias en la estructura silábica y su evolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas de rendimiento en tareas como clasificación de especies o retrieval. El artículo de bioRxiv asociado podría contener evaluaciones, pero no se dispone de sus datos en esta ficha.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 98,6 millones de parámetros (0,4 GB en safetensors), la inferencia con batch 1 requiere menos de 1 GB de VRAM en GPU. En CPU también es viable, como indica el ejemplo de uso.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria (p. ej., NVIDIA GTX 1050 Ti, RTX 2060) es suficiente. Para procesamiento por lotes o contextos largos, se recomienda una GPU con 4-8 GB.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna e incluso en CPU sin problemas de memoria.
- Opciones de despliegue: el modelo se carga mediante `transformers` con `trust_remote_code=True`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Se puede exportar a ONNX o TorchScript para servir con frameworks de inferencia estándar.
- Latencia y throughput: no disponible. Depende del hardware y del tamaño de lote; al ser un ViT relativamente pequeño, se espera una latencia de decenas de milisegundos por clip de 5 segundos en GPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros encoders bioacústicos como BirdNET o Perch, pero no se han incluido datos de comparación en la model card ni en los resultados de búsqueda. Por tanto, no se puede establecer una comparativa objetiva con datos verificados.

## Limitaciones y advertencias

- El modelo no es un clasificador de especies: no devuelve etiquetas taxonómicas, solo representaciones. Para clasificación se necesita una capa adicional entrenada.
- No genera audio: su salida son embeddings, no waveforms sintetizados.
- Contexto limitado a 5 segundos: las grabaciones más largas se procesan en fragmentos independientes, por lo que las representaciones no capturan dependencias de largo alcance entre contextos.
- Sensibilidad a condiciones de campo: grabaciones con ruido, reverberación o especies fuera de la distribución de entrenamiento pueden producir embeddings poco fiables; se recomienda validar en el dominio de aplicación.
- Sesgo potencial del dataset: el entrenamiento se basa en grabaciones de Xeno-Canto, que pueden tener sesgo geográfico (mayor representación de regiones con más contribuciones) y de especies (más comunes o carismáticas).
- Normalización específica: el modelo espera espectrogramas normalizados con media y desviación fijas (-58,69 y 20,18 respectivamente); si se usa `forward()` directamente, hay que aplicar esa normalización manualmente.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/georgeven/songmae-large-32x1
- Colección de modelos SongMAE: https://huggingface.co/collections/georgeven/songmae-a-bioacoustic-encoder-for-birdsong-6a91eb9c42e5cde53962fbec
- Artículo en bioRxiv: https://www.biorxiv.org/content/10.64898/2026.08.17.745361v1
- Código fuente: https://github.com/georgevenven/SongMAE
- Presentación en NeurIPS 2025: https://nips.cc/virtual/2025/131534
