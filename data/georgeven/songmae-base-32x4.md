# georgeven/songmae-base-32x4

## Resumen

SongMAE-Base 32x4 es un autoencoder enmascarado (masked autoencoder) desarrollado por georgeven para el aprendizaje de representaciones de canto de aves a alta resolución temporal. El modelo se entrena sobre espectrogramas de audio y produce una incrustación (embedding) cada 20 milisegundos, lo que permite distinguir sílabas y elementos finos dentro de las vocalizaciones, algo que los encoders bioacústicos convencionales, diseñados para habla humana, no logran con suficiente granularidad.

El checkpoint base utiliza parches de 32 bins mel por 4 bins temporales, generando cuatro vectores de 384 dimensiones por cada paso de 20 ms, que se concatenan en una representación de 1536 dimensiones. Con 14,6 millones de parámetros, es un modelo ligero pensado para ser usado como encoder congelado en tareas de recuperación, visualización, agrupamiento y análisis de cantos. Se distribuye bajo licencia MIT y está disponible en HuggingFace con pesos en formato safetensors.

La relevancia actual radica en que la mayoría de los encoders bioacústicos operan a resoluciones temporales pensadas para habla, insuficientes para estudiar la estructura fina del canto de las aves. SongMAE aborda esta carencia con un diseño específico para espectrogramas de alta resolución, entrenado sobre un subconjunto masivo de grabaciones de Xeno-Canto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked autoencoder (encoder Transformer) sobre espectrogramas log-mel |
| Parametros totales | 14.656.705 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 5 segundos de audio por ventana (contextos independientes, sin atención entre ventanas) |
| Tipos de cuantizacion | no disponible (modelo de embeddings, no de generación) |
| Idiomas soportados | no aplica (audio) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SongMAE sigue el paradigma de los autoencoders enmascarados: se enmascaran parches del espectrograma y se entrena el encoder para reconstruir las regiones ocultas. La entrada es un espectrograma log-mel de 128 bins, con FFT de 1024 muestras, hop de 160 muestras, frecuencia mínima de 20 Hz y normalización por decibelios relativa a la potencia máxima de cada grabación. Los valores se estandarizan con la media fija -58,69 y desviación típica 20,18 del pretraining.

El pretraining se realizó durante 500.000 pasos sobre el subconjunto XCL de BirdSet, compuesto por 528.434 grabaciones de Xeno-Canto que suman 7.562 horas. Los taxones de evaluación se eliminaron antes de la partición final 95/5 de entrenamiento/validación. El audio se convierte a mono a 32 kHz y se procesa en contextos acotados de 5 segundos; el último contexto se rellena tras la normalización y se excluye de las incrustaciones devueltas.

Cada paso de 20 ms produce cuatro vectores de 384 dimensiones correspondientes a parches de frecuencia; `token_embeddings` los concatena en 1536 dimensiones y `clip_embedding` es su media temporal. El modelo no genera audio ni clasifica especies; es exclusivamente un extractor de características.

## Capacidades

- Extracción de incrustaciones de clip (1536 dimensiones) y de tokens (por cada 20 ms, 1536 dimensiones) a partir de audio de canto de aves.
- Representaciones a alta resolución temporal (20 ms) que permiten distinguir sílabas y elementos finos dentro de las vocalizaciones.
- Procesamiento de grabaciones largas mediante ventanas independientes de 5 segundos, sin atención entre contextos.
- Acepta audio directamente desde archivo (`embed_file`) o desde forma de onda NumPy (`embed_audio`).
- Salida de marcas de tiempo (timestamps) en milisegundos para cada token.
- Funciona en CPU y GPU; requiere `trust_remote_code=True` en HuggingFace Transformers.
- No es un clasificador de especies ni un modelo generativo de audio.

## Casos de uso

- Recuperación de cantos por similitud: dado un fragmento de canto, se pueden comparar sus incrustaciones de clip contra una base de datos de grabaciones para encontrar cantos similares, útil en estudios de variación geográfica o individual.
- Agrupamiento no supervisado de sílabas: las incrustaciones de tokens a 20 ms permiten agrupar sílabas y elementos vocales sin etiquetas previas, facilitando la construcción de catálogos de repertorio.
- Visualización de estructura de cantos: proyectando las incrustaciones en 2D (p. ej., UMAP) se pueden inspeccionar patrones temporales y secuencias de sílabas en largas grabaciones.
- Análisis de dialectos y variación individual: al comparar incrustaciones de clip entre individuos o poblaciones, se pueden cuantificar diferencias acústicas con resolución fina.
- Procesamiento previo para clasificación supervisada: las incrustaciones extraídas pueden alimentar clasificadores ligeros (regresión logística, SVM) para tareas de identificación de especies o individuos, reduciendo la necesidad de modelos grandes.
- Estudios de ontogenia del canto: el seguimiento de cambios en las incrustaciones a lo largo del desarrollo de un ave puede revelar cómo se adquieren y modifican las sílabas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo de NeurIPS 2025 menciona explícitamente la falta de benchmarks cuantitativos y comparaciones con otros modelos como una limitación del trabajo. No se dispone de cifras de MMLU, HumanEval u otros estándares, ya que el modelo no está orientado a tareas de lenguaje o código.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 14,6 millones de parámetros, la huella de memoria es mínima. En FP32, los pesos ocupan aproximadamente 58 MB; en CPU es viable sin GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060 o superior permite procesar múltiples grabaciones en paralelo.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna, incluidas las integradas de gama media.
- Opciones de despliegue: el modelo se carga con `AutoModel.from_pretrained` de Transformers; no se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo generativo de texto.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño, se espera un throughput alto; en CPU, un clip de 5 segundos debería procesarse en decenas de milisegundos, y en GPU, en pocos milisegundos.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros encoders bioacústicos (p. ej., BirdNET, Perch, AVES) en términos de parámetros, contexto y rendimiento, ya que los datos de benchmarks no están publicados. La única referencia cualitativa del propio autor indica que los encoders existentes operan a resoluciones temporales diseñadas para habla humana, insuficientes para distinguir sílabas finas de aves. No se proporcionan cifras concretas de comparación.

## Limitaciones y advertencias

- El modelo no es un clasificador de especies ni genera audio; su uso previsto es exclusivamente como encoder congelado para representaciones.
- Las representaciones no atienden a través de los límites de las ventanas de 5 segundos; cantos que cruzan ese límite se procesan de forma independiente, lo que puede fragmentar sílabas largas.
- Condiciones de campo (ruido, reverberación, especies fuera de la distribución de pretraining) pueden degradar la calidad de las incrustaciones; se recomienda validar o adaptar el modelo para taxones o entornos no representados.
- El último contexto de cada grabación se excluye de las salidas, por lo que la cobertura temporal no es completa en grabaciones cuya duración no es múltiplo de 5 segundos.
- No se han publicado benchmarks cuantitativos ni comparaciones con otros modelos, lo que limita la evaluación objetiva de su rendimiento relativo.
- El uso requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código personalizado del autor; se debe auditar antes de usar en entornos de producción.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y sin soporte oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/georgeven/songmae-base-32x4
- Colección de modelos SongMAE: https://huggingface.co/collections/georgeven/songmae-a-bioacoustic-encoder-for-birdsong-6a91eb9c42e5cde53962fbec
- Artículo en bioRxiv: https://www.biorxiv.org/content/10.64898/2026.08.17.745361v1
- Código fuente en GitHub: https://github.com/georgevenven/SongMAE
- Página del artículo en NeurIPS 2025: https://nips.cc/virtual/2025/131534
