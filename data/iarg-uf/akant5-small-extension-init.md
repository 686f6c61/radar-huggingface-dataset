# IARG-UF/akant5-small-extension-init

## Resumen

AkanT5 small: vocabulary extension initialization es un punto de control intermedio publicado por el grupo IARG-UF (Intelligent Agents Research Group, Universidad de Florida) como parte del proyecto AkanT5, una línea de investigación sobre adaptación de vocabulario y retención lingüística en modelos multilingües para lenguas akan (twi). Se trata de una inicialización derivada de google/mt5-small en la que se ha sustituido el tokenizador original por uno extendido que conserva los identificadores mT5 y añade piezas akan-inglés, pasando de 250.112 a 295.031 entradas de tokenizador y de 64.128 a 295.040 filas de embedding/salida.

El modelo no ha recibido ningún paso de preentrenamiento continuado (CPT): las 0 actualizaciones CPT lo convierten en una referencia de control para comparar el efecto de la transferencia de vocabulario antes y después del CPT. Su pareja experimental es IARG-UF/akant5-small-extension, el checkpoint CPT seleccionado, y forma parte de una colección de 12 modelos de publicación que incluyen tanto checkpoints CPT como inicializaciones de vocabulario con estrategias de sustitución y extensión.

Es relevante ahora porque documenta de forma reproducible una técnica (inicialización de filas nuevas de embedding mediante transferencia desde los parámetros mT5 originales) aplicada a una lengua de bajos recursos, con procedencia de datos fijada por revisión y hashes SHA-256 de los ficheros de inferencia. Su licencia es estrictamente de investigación (akant5-research-use-only), lo que limita su uso a experimentación académica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | mT5 encoder-decoder (transformer) |
| Parámetros totales | 346.183.040 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos almacenados en float32 safetensors) |
| Idiomas soportados | ak (akan/twi), en (inglés) |
| Licencia | akant5-research-use-only (other) |
| Formato de pesos | safetensors (float32) |
| Estrategia de vocabulario | extensión (conserva IDs mT5 y añade piezas akan-inglés) |
| Entradas de tokenizador | 295.031 |
| Filas de embedding/salida | 295.040 |
| Actualizaciones CPT | 0 |
| Dropout almacenado | 0,1 |
| Modelo base | google/mt5-small |
| Librería | transformers (preparado con Transformers 5.16.1) |
| Tamaño del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

La arquitectura es la de mT5-small: un transformer encoder-decoder con atención completa, aproximadamente 346 millones de parámetros y embeddings de entrada compartidos entre encoder y decoder, con cabeza de salida separada (de ahí que la model card indique `tie_word_embeddings = False` al cargar). Este repositorio concreto no incorpora ningún entrenamiento adicional: es la inicialización tras la adaptación de vocabulario, con 0 actualizaciones de CPT.

La innovación técnica reside en el procedimiento de inicialización del vocabulario extendido. En lugar de sustituir el vocabulario (estrategia que produce 64.100 entradas de tokenizador y 64.128 filas de embedding), la extensión mantiene los IDs originales de mT5 y añade piezas akan-inglés hasta 295.031 entradas. Las filas nuevas de embedding y de la cabeza de salida se transfieren desde los parámetros mT5 correspondientes mediante un procedimiento de inicialización registrado. Los datos de la mezcla CPT asociada (no aplicada a esta inicialización) incluyen corpus twi-inglés de ghananlpcommunity y ghanaopenai (pristine-twi-english, ghok-parallel-en-twi, ghana-farmer-qa-twi, true-asr-ipa-pairs-twi, kumawood-speech-transcriptions, ghana-speech en sus variantes Akuapem_Twi y Asante_Twi), Wikipedia twi (20231101.tw) y allenai/c4 en configuración en-multi. La selección de fuentes para el ajuste del tokenizador difiere de la mezcla CPT y el tokenizador de sustitución es anterior a las particiones finales de CPT.

## Capacidades

- Generación de texto seq2seq mediante `AutoModelForSeq2SeqLM`, orientada a traducción automática akan-inglés e inglés-akan tras el ajuste supervisado correspondiente.
- Tokenización con vocabulario extendido que preserva los IDs mT5 y el comportamiento de byte-fallback, lo que permite comparar directamente con el modelo base.
- Punto de partida para preentrenamiento continuado (CPT) y para ajuste fino supervisado de traducción automática.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües limitadas a ak y en según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre adaptación de vocabulario: sirve como condición de control (0 pasos CPT) para medir cuánto del rendimiento final en twi proviene de la inicialización de embeddings y cuánto del preentrenamiento continuado, comparándolo con IARG-UF/akant5-small-extension.
- Experimentos de retención lingüística: al conservar los IDs mT5 originales, permite evaluar la degradación del inglés tras el CPT comparando esta inicialización con el checkpoint CPT y con google/mt5-small.
- Ajuste fino de traducción automática twi-inglés: la model card indica que el ajuste supervisado principal del artículo usa `dropout_rate=0.1`, que debe fijarse en la configuración antes de instanciar el modelo; este repositorio ya almacena 0,1.
- Reproducibilidad de procedencia: los ficheros `sources.json` y `release_provenance.json` permiten auditar identidades de fuentes fijadas por revisión y hashes SHA-256 de los ficheros de inferencia, útil en trabajos que exigen trazabilidad de datos.
- Estudio comparativo sustitución frente a extensión de vocabulario: junto con la variante de sustitución de la colección AkanT5, permite aislar el efecto de cada estrategia sobre el tamaño efectivo del vocabulario (64.128 frente a 295.040 filas de embedding).
- Base para modelos de traducción de lenguas ghanesas de bajos recursos: punto de partida reutilizable por grupos que trabajen con twi (Asante y Akuapem) y quieran evitar entrenar un tokenizador desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1,4 GB solo de pesos (346 millones de parámetros a 4 bytes), más overhead de activaciones y del vocabulario extendido de 295.040 filas en la cabeza de salida.
- En float16/bfloat16 los pesos ocuparían del orden de 0,7 GB; en cuantización de 8 bits, alrededor de 0,35 GB, aunque no se documentan recetas de cuantización para este repositorio.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más es suficiente para inferencia en precisión reducida; para ajuste fino con batches razonables se recomienda 16-24 GB (RTX 4090, A10, L4) y, para CPT a mayor escala, A100 o H100.
- Cabe en GPU consumer: sí, en tarjetas tipo RTX 3060 12 GB, RTX 4070, RTX 4090.
- Opciones de despliegue: transformers con `AutoModelForSeq2SeqLM` y `AutoTokenizer` (versión 5.16.1 según la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| IARG-UF/akant5-small-extension-init | 346.183.040 | no disponible | ak, en | akant5-research-use-only | Inicialización, 0 pasos CPT |
| IARG-UF/akant5-small-extension | no disponible en la información | no disponible | ak, en | akant5-research-use-only | Checkpoint CPT seleccionado |
| google/mt5-small | no disponible en la información (modelo base) | no disponible | multilingüe (mT5) | Apache 2.0 | Modelo base preentrenado |

La comparación con alternativas de la misma categoría (adaptaciones de vocabulario para lenguas de bajos recursos) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: la licencia akant5-research-use-only restringe el uso comercial; deben consultarse LICENSE, NOTICE y la licencia upstream Apache 2.0 de mT5.
- No ha recibido entrenamiento específico de ninguna tarea: sin CPT ni ajuste fino de traducción, su salida directa no es utilizable como traductor.
- El estudio asociado evalúa twi (Asante y Akuapem) e inglés; no establece cobertura de todas las variedades de akan.
- Las fuentes de datos presentan licencias no comerciales (cc-by-nc-4.0 en la mayoría de los corpus ghaneses), lo que condiciona la procedencia del vocabulario aprendido y de los artefactos de adaptación.
- La selección de fuentes para el ajuste del tokenizador difiere de la mezcla CPT y el tokenizador de sustitución precede a las particiones finales, por lo que la mezcla CPT registrada no debe interpretarse como manifiesto del tokenizador.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero esperables en un modelo sin ajuste de tarea y entrenado sobre corpus de dominio limitado.
- Longitud de contexto: no documentada; debe consultarse la configuración del repositorio antes de asumir la ventana de mT5-small.
- El corpus M1xEN ensamblado y las salidas de traducción automática quedan excluidos de la publicación, lo que limita la reproducción exacta de los resultados del artículo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IARG-UF/akant5-small-extension-init
- Checkpoint CPT asociado: https://huggingface.co/IARG-UF/akant5-small-extension
- Colección AkanT5: https://huggingface.co/collections/IARG-UF/akant5-cpt-checkpoints-and-vocabulary-initializations
- Modelo base: https://huggingface.co/google/mt5-small
- Repositorio de código y configuraciones: https://github.com/Intelligent-Agents-Research-Group/akant5
- Manuscrito asociado: *AkanT5: Vocabulary Adaptation, Language Retention, and Model Capacity in Continued Pretraining*, Kweku Yamoah, Kevin Scroggins, Chibuzor Okocha, Christan Grant y otros (referencia incompleta en la información disponible)
