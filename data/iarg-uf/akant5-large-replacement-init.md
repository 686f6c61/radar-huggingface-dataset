# IARG-UF/akant5-large-replacement-init

## Resumen

AkanT5-large-replacement-init es un punto de control de inicialización con vocabulario adaptado, derivado de google/mt5-large, publicado por el Intelligent Agents Research Group de la Universidad de Florida (IARG-UF). No es un modelo entrenado para tareas: es el artefacto intermedio que resulta de sustituir el vocabulario original de mT5 (250.100 entradas) por un vocabulario bilingüe akan-inglés de 64.100 entradas de tokenizador y 64.128 filas de embedding/salida, con 0 actualizaciones de continued pretraining (CPT). Su función es servir de línea base controlada para comparar la transferencia de vocabulario antes y después del CPT.

El modelo conserva la arquitectura encoder-decoder de mT5 con 848.686.080 parámetros, almacenados en safetensors float32, y una tasa de dropout de 0,1. Las filas nuevas del vocabulario se transfieren desde los parámetros correspondientes de mT5 mediante el procedimiento de inicialización documentado por los autores. El checkpoint CPT asociado es IARG-UF/akant5-large-replacement, y ambos forman parte de una colección de 12 modelos de publicación.

Es relevante ahora porque documenta de forma reproducible una técnica poco habitual en la literatura: la sustitución completa de vocabulario (frente a la extensión, que en la variante AkanT5 produce 295.031 entradas) y su efecto sobre la retención lingüística en lenguas de bajos recursos como el twi. Su licencia es exclusivamente de investigación, lo que restringe su uso a experimentación académica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mT5 encoder-decoder (transformer) |
| Parametros totales | 848.686.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | ak (akan/twi), en (ingles) |
| Licencia | akant5-research-use-only (research use only) |
| Formato de pesos | safetensors (float32) |
| Estrategia de vocabulario | replacement |
| Entradas de tokenizador | 64.100 |
| Filas de embedding/salida | 64.128 |
| Actualizaciones de CPT | 0 |
| Dropout almacenado | 0,1 |
| Version de Transformers | 5.16.1 |
| Modelo base | google/mt5-large |
| Tamano del repo | 3,4 GB |

## Arquitectura y entrenamiento

La arquitectura es la de mT5-large: un transformer encoder-decoder con atención completa, sin modificaciones estructurales respecto al modelo base de Google. La innovación no está en el transformer sino en la capa de vocabulario: se sustituye por completo el vocabulario multilingüe original por uno bilingüe akan-inglés, y las filas nuevas de embedding y de la cabeza de salida se inicializan transfiriendo parámetros desde las filas correspondientes de mT5 según el procedimiento registrado por los autores. mT5 comparte embeddings de entrada entre encoder y decoder, pero mantiene una cabeza de salida separada, de ahí la necesidad de fijar `tie_word_embeddings = False` al cargar.

Este repositorio concreto no ha recibido entrenamiento posterior: registra 0 actualizaciones de CPT y no ha pasado por fine-tuning de traducción. El modelo asociado IARG-UF/akant5-large-replacement sí contiene el checkpoint CPT seleccionado, y el fine-tuning supervisado de traducción del estudio se realiza con dropout 0,1 en todos los modelos, valor que debe fijarse en la configuración antes de instanciar el modelo. La mezcla de CPT documentada incluye corpus twi-inglés de GhanaNLP y GhanaOpenAI (pristine-twi-english, ghok-parallel-en-twi, ghana-farmer-qa-twi, true-asr-ipa-pairs-twi, kumawood-speech-transcriptions, ghana-speech en sus variantes Akuapem y Asante), Wikipedia en twi y allenai/c4 en inglés; no obstante, la selección de fuentes para el ajuste del tokenizador difiere de la mezcla de CPT y el tokenizador de sustitución es anterior a las particiones finales. No se especifica el número de tokens de entrenamiento.

## Capacidades

- Generación de texto condicionada por el encoder (text2text-generation), heredada de la arquitectura mT5.
- Traducción automática akan-inglés e inglés-akan, como capacidad objetivo del proyecto, aunque este checkpoint concreto no ha recibido fine-tuning de traducción.
- Modelado de lenguaje multilingüe limitado al par akan-inglés.
- Tokenización con byte-fallback para texto akan, preservando los IDs de vocabulario del tokenizador guardado en el repositorio.
- Punto de comparación controlada para experimentos de transferencia de vocabulario antes y después de CPT.
- No dispone de tool calling, function calling, capacidades de agente, modo thinking, visión ni audio.
- No se documentan capacidades de razonamiento multi-paso ni matemáticas.

## Casos de uso

- Investigación en adaptación de vocabulario: usar este checkpoint como línea base de "0 pasos de CPT" y compararlo con IARG-UF/akant5-large-replacement para medir el efecto del continued pretraining sobre la retención lingüística del twi.
- Estudio de retención de inglés tras sustitución de vocabulario: evaluar si la sustitución del vocabulario multilingüe de mT5 degrada el rendimiento en inglés frente a la estrategia de extensión, que conserva los IDs originales.
- Reproducción del artículo AkanT5: el repositorio incluye `release_provenance.json` con hashes SHA-256 de los ficheros de inferencia y `sources.json` con las identidades de las fuentes, lo que permite reproducir la inicialización de forma verificable.
- Fine-tuning supervisado de traducción twi-inglés en entornos académicos: configurando dropout 0,1 antes de instanciar el modelo, tal como indica la model card para el fine-tuning principal del estudio.
- Análisis de eficiencia de vocabulario: con 64.100 entradas frente a las 295.031 de la variante de extensión, el modelo permite medir el ahorro en tamaño de embedding y en coste de decodificación por token.
- Evaluación comparativa de variedades del akan: el estudio cubre twi Asante y Akuapem, por lo que el modelo sirve para experimentos de cobertura dialectal, con la advertencia de que no establece cobertura de todas las variedades del akan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y caché; en la práctica, entre 5 y 7 GB para secuencias moderadas.
- Al no publicarse versiones cuantizadas, no hay estimaciones oficiales para int8 o int4; una conversión a bf16 o fp16 reduciría los pesos a unos 1,7 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para float32 (RTX 3060 Ti, RTX 4060, RTX 3070); A100 o H100 no son necesarias para inferencia, solo para entrenamiento o fine-tuning a mayor escala.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en float32 y con 4-6 GB si se convierte a precisión reducida.
- Opciones de despliegue: transformers con `AutoModelForSeq2SeqLM` (versión 5.16.1 según la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser un encoder-decoder mT5 la compatibilidad con esos motores no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocabulario | Licencia | Estado |
|---|---|---|---|---|---|
| IARG-UF/akant5-large-replacement-init | 848.686.080 | no disponible | 64.100 entradas (sustitucion) | research use only | Inicializacion, 0 pasos de CPT |
| IARG-UF/akant5-large-replacement | no disponible en la informacion | no disponible | 64.100 entradas (sustitucion) | research use only | Checkpoint CPT seleccionado |
| google/mt5-large | 848.686.080 (aprox., segun modelo base) | no disponible | 250.100 entradas | Apache 2.0 | Modelo preentrenado multilingue |
| Variante de extension AkanT5 | no disponible en la informacion | no disponible | 295.031 entradas (extension) | research use only | Conserva IDs originales de mT5 |

La comparación directa con modelos de traducción akan-inglés de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia `akant5-research-use-only`: uso exclusivamente de investigación; no apto para uso comercial.
- El modelo no ha recibido entrenamiento específico de traducción ni CPT; no debe esperarse calidad de traducción utilizable en producción.
- El estudio evalúa únicamente twi (Asante y Akuapem) e inglés; no establece cobertura de todas las variedades del akan.
- Las fuentes de datos de la mezcla de CPT tienen licencias cc-by-nc-4.0 en su mayoría (GhanaNLP, GhanaOpenAI) y cc-by-sa-3.0 (Wikipedia twi), lo que añade restricciones de no comercialidad y atribución a los artefactos derivados.
- La selección de fuentes para el ajuste del tokenizador difiere de la mezcla de CPT y el tokenizador de sustitución es anterior a las particiones finales, lo que limita la trazabilidad exacta del vocabulario aprendido.
- Riesgo de alucinación y de generación degenerada en akan al no haber pasado por fine-tuning; el byte-fallback puede producir segmentaciones subóptimas en texto no visto.
- Es obligatorio cargar el tokenizador guardado en el repositorio para preservar los IDs de vocabulario y el comportamiento de byte-fallback.
- Debe fijarse `tie_word_embeddings = False` y ajustar el dropout a 0,1 antes de construir el modelo de fine-tuning, según advierte la model card.
- El corpus M1xEN ensamblado y las salidas de traducción automática quedan excluidos de la publicación, lo que impide reproducir esas partes del estudio solo con este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IARG-UF/akant5-large-replacement-init
- Checkpoint CPT asociado: https://huggingface.co/IARG-UF/akant5-large-replacement
- Coleccion AkanT5: https://huggingface.co/collections/IARG-UF/akant5-cpt-checkpoints-and-vocabulary-initializations
- Modelo base: https://huggingface.co/google/mt5-large
- Repositorio de codigo y configuraciones: https://github.com/Intelligent-Agents-Research-Group/akant5
- Licencia del modelo: https://huggingface.co/IARG-UF/akant5-large-replacement-init/blob/main/LICENSE
- Aviso legal: https://huggingface.co/IARG-UF/akant5-large-replacement-init/blob/main/NOTICE
- Licencia Apache 2.0 de mT5: https://huggingface.co/IARG-UF/akant5-large-replacement-init/blob/main/LICENSE-mT5-APACHE-2.0
- Articulo asociado: AkanT5: Vocabulary Adaptation, Language Retention, and Model Capacity in Continued Pretraining (Kweku Yamoah, Kevin Scroggins, Chibuzor Okocha, Christan; enlace no disponible)
