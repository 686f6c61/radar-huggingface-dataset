# georgeven/songmae-micro-32x4

## Resumen

SongMAE-Micro 32x4 es un masked autoencoder (MAE-ViT) desarrollado por georgeven para el aprendizaje de representaciones de cantos de aves con alta resolución temporal. A diferencia de los encoders bioacústicos existentes, que heredan resoluciones temporales pensadas para el habla humana, SongMAE opera sobre espectrogramas de mel con una resolución de 2 ms, lo que permite distinguir sílabas individuales dentro de los cantos. El modelo se preentrena mediante reconstrucción de espectrogramas enmascarados sobre un subconjunto de 528.434 grabaciones de Xeno-Canto (7.562 horas) y produce una embedding cada 20 ms.

El checkpoint Micro 32x4 utiliza parches que abarcan 32 bins de mel y 4 bins temporales del espectrograma, generando una embedding de 512 dimensiones por cada 20 ms de audio. Con solo 1.674.305 parámetros, es un modelo extremadamente compacto, pensado como encoder congelado para tareas de recuperación, visualización, agrupamiento y sondas de clasificación. No es un clasificador de especies ni genera audio, y procesa el audio en contextos independientes de 5 segundos.

La relevancia actual de SongMAE radica en que aborda un problema no resuelto por los encoders previos: la estructura a nivel de sílaba en el canto de las aves. Su tamaño reducido y su licencia MIT lo hacen accesible para investigación y aplicaciones de monitoreo acústico en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MAE-ViT (Masked Autoencoder Vision Transformer) con encoder-decoder; el decoder se descarta tras el preentrenamiento |
| Parametros totales | 1.674.305 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 5 segundos de audio por contexto (contextos independientes, sin atencion entre ellos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (audio) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SongMAE es un ViT encoder-decoder que opera sobre espectrogramas de mel de 128 bins calculados a 32 kHz, con FFT de 1024 muestras, ventana Hann de 32 ms y hop de 160 muestras. Una pila convolucional superficial precede al transformer; el decoder se descarta después del preentrenamiento. Los parches del modelo Micro 32x4 cubren 32 bins de mel y 4 bins temporales, lo que produce una embedding cada 20 ms. Cada salida temporal contiene cuatro vectores de 128 dimensiones (uno por parche de frecuencia) que se concatenan en un vector de 512 dimensiones.

El preentrenamiento se realizó durante 500.000 pasos en el subconjunto XCL de BirdSet, derivado de 528.434 grabaciones de Xeno-Canto que suman 7.562 horas. Los taxa de evaluación se eliminaron antes de la división final 95/5 entre entrenamiento y validación. La tarea de preentrenamiento es la reconstrucción de espectrogramas enmascarados, sin uso de RLHF ni DPO. El modelo se distribuye con código personalizado (trust_remote_code=True) y acepta audio mono a 32 kHz, normalizado con la media y desviación estándar fijas del preentrenamiento (-58,69 y 20,18 respectivamente).

## Capacidades

- Extracción de representaciones de audio a nivel de clip (vector de 512 dimensiones) y a nivel de token (secuencia temporal de vectores de 512 dimensiones).
- Resolución temporal fina: una embedding cada 20 ms, suficiente para distinguir sílabas individuales en cantos de aves.
- Recuperación de similitud entre grabaciones mediante comparación de embeddings de clip.
- Agrupamiento (clustering) de segmentos de canto para análisis de dialectos, variaciones individuales o estructura de sílabas.
- Visualización de la estructura temporal del canto mediante proyección de embeddings en espacios de baja dimensión.
- Sondas de clasificación: el encoder congelado puede alimentar clasificadores ligeros para tareas de especies, individuos o comportamiento.
- Procesamiento de grabaciones largas mediante contextos independientes de 5 segundos, con agregación posterior de embeddings.
- No soporta tool calling, agentes ni generación de audio; es exclusivamente un extractor de características.

## Casos de uso

- Descubrimiento de sílabas en cantos de aves: los embeddings temporales permiten segmentar y agrupar sílabas mediante clustering, facilitando el estudio de la estructura del canto sin anotaciones manuales.
- Recuperación de grabaciones por similitud: dado un clip de referencia, se pueden buscar grabaciones similares en grandes colecciones comparando los clip_embeddings, útil para bases de datos de bioacústica.
- Monitoreo acústico pasivo: el modelo puede procesar grabaciones de campo en tiempo real o por lotes para extraer representaciones que alimenten detectores de presencia de especies, gracias a su bajo coste computacional.
- Análisis de dialectos geográficos: agrupando los embeddings de sílabas de diferentes poblaciones, se pueden identificar variaciones regionales en el canto.
- Estudios de comportamiento individual: la comparación de embeddings de clips de un mismo individuo a lo largo del tiempo permite rastrear cambios en el canto.
- Probes de clasificación de especies: al ser un encoder congelado, se pueden entrenar clasificadores lineales o MLP ligeros sobre los embeddings para tareas de clasificación, reduciendo la necesidad de datos etiquetados.
- Visualización de la estructura del canto: proyectando los token_embeddings en 2D (p. ej., con UMAP) se pueden inspeccionar patrones temporales y de frecuencia en grandes conjuntos de grabaciones.
- Preprocesamiento para modelos generativos: los embeddings pueden servir como entrada para modelos de síntesis o análisis de cantos, aunque el propio SongMAE no genera audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 1.674.305 parámetros, lo que supone aproximadamente 6,7 MB en FP32 y 3,4 MB en FP16. La VRAM necesaria para inferencia es inferior a 1 GB, incluso considerando el overhead del framework.
- Cabe en cualquier GPU consumer (p. ej., NVIDIA GTX 1050, RTX 3060, etc.) y también en GPUs integradas. Puede ejecutarse en CPU sin problemas.
- El despliegue se realiza mediante la librería transformers con trust_remote_code=True. No se mencionan integraciones con vLLM, llama.cpp u Ollama; al ser un modelo de audio, se usa directamente con el pipeline de feature-extraction.
- La latencia es muy baja: procesar un contexto de 5 segundos de audio en GPU toma del orden de milisegundos; en CPU, decenas de milisegundos. El throughput es alto, permitiendo procesar cientos de horas de audio por hora en una GPU moderna.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en los datos proporcionados. Se recomienda consultar la colección de SongMAE en HuggingFace para ver otros checkpoints de la familia, pero no hay datos de rendimiento relativo frente a alternativas como BirdNET o Perch.

## Limitaciones y advertencias

- El modelo no es un clasificador de especies; solo extrae representaciones. Cualquier tarea de clasificación requiere un clasificador adicional entrenado sobre los embeddings.
- No genera audio ni realiza síntesis.
- Los contextos de 5 segundos son independientes: las representaciones no atienden a información más allá de ese límite, lo que puede perder dependencias de largo alcance en cantos muy largos.
- Las condiciones de campo o taxa fuera de la distribución de preentrenamiento (grabaciones de Xeno-Canto) pueden requerir validación o adaptación del modelo.
- El modelo requiere confiar en código remoto (trust_remote_code=True), lo que implica ejecutar código del autor; se recomienda revisar el repositorio antes de usarlo en producción.
- No se han documentado sesgos específicos, pero al entrenarse principalmente con grabaciones de Xeno-Canto, puede haber sesgos geográficos o de especies sobrerrepresentadas.
- La normalización del espectrograma usa valores fijos de media y desviación; si se aplica a audio con características muy diferentes, las representaciones pueden degradarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/georgeven/songmae-micro-32x4
- Colección SongMAE: https://huggingface.co/collections/georgeven/songmae-a-bioacoustic-encoder-for-birdsong-6a91eb9c42e5cde53962fbec
- Repositorio de código: https://github.com/georgevenven/SongMAE
- Paper en bioRxiv: https://www.biorxiv.org/content/10.64898/2026.08.17.745361v1
- Paper en OpenReview: https://openreview.net/pdf?id=8mluzLyvyV
- Presentación en NeurIPS 2025: https://nips.cc/virtual/2025/loc/san-diego/131534
- Ficha en bio.rodeo: https://bio.rodeo/models/songmae
