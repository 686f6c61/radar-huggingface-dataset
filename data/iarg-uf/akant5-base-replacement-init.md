# IARG-UF/akant5-base-replacement-init

## Resumen

AkanT5 base replacement-init es un checkpoint de inicialización de vocabulario derivado de google/mt5-base, publicado por el grupo IARG-UF (Intelligent Agents Research Group, University of Florida). No es un modelo entrenado para tareas finales: es el artefacto intermedio que resulta de sustituir el vocabulario original de mT5 por uno nuevo de akan-inglés (64.100 entradas de tokenizer, 64.128 filas de embedding/salida) antes de aplicar ningún paso de preentrenamiento continuado (CPT). Por tanto, sus pesos reflejan la transferencia de vocabulario desde mT5 pero no han visto corpus adicional en el idioma objetivo.

El modelo mantiene la arquitectura encoder-decoder de mT5 con 296.729.856 parámetros almacenados en safetensors float32, y sirve como referencia controlada para comparar el efecto de la adaptación de vocabulario antes y después del CPT. Su pareja experimental es IARG-UF/akant5-base-replacement, el checkpoint seleccionado tras el CPT.

Es relevante ahora porque documenta de forma reproducible una técnica concreta (vocabulary replacement frente a vocabulary extension) aplicada a una lengua de bajos recursos como el twi, con procedencia de datos fijada por revisión y hashes SHA-256. Su utilidad práctica es de investigación: permite aislar cuánto del rendimiento final proviene del vocabulario nuevo y cuánto del entrenamiento posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mT5 encoder-decoder (transformer) |
| Parametros totales | 296.729.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | ak (akan/twi), en |
| Licencia | akant5-research-use-only (other); modelo base upstream Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es la de mT5 base: transformer encoder-decoder con atención completa, sin modificaciones estructurales respecto al modelo original de Google. La intervención se limita a la capa de embeddings y a la cabeza de salida. La estrategia de vocabulario es de sustitución (replacement): se reemplaza el vocabulario mT5 por uno akan-inglés de 64.100 entradas de tokenizer y 64.128 filas de embedding/salida, y las filas nuevas se transfieren desde los parámetros mT5 correspondientes mediante el procedimiento de inicialización documentado. El repositorio incluye su propio tokenizer y configuración sin cambios.

El checkpoint tiene 0 actualizaciones de CPT: no ha recibido preentrenamiento continuado ni ajuste supervisado de traducción. La model card indica que los artefactos se prepararon con Transformers 5.16.1 y que este repositorio almacena dropout_rate=0.1, mientras que el checkpoint CPT asociado almacena dropout_rate=0.0 tal como se entrenó; el ajuste supervisado de traducción del artículo usa dropout_rate=0.1 en todos los modelos y debe fijarse en la configuración antes de instanciar el modelo de fine-tuning. mT5 comparte embeddings de entrada entre encoder y decoder, pero su cabeza de salida es independiente, por lo que hay que establecer tie_word_embeddings=False al cargar.

La procedencia recogida en sources.json corresponde a la mezcla del CPT correspondiente (no al manifiesto de ajuste del tokenizer): ghananlpcommunity/pristine-twi-english, ghanaopenai/ghok-parallel-en-twi, ghanaopenai/ghana-farmer-qa-twi, ghananlpcommunity/true-asr-ipa-pairs-twi, ghanaopenai/kumawood-speech-transcriptions, wikimedia/wikipedia (20231101.tw), ghanaopenai/ghana-speech (Akuapem_Twi_twi y Asante_Twi_twi) y allenai/c4 (en-multi), todas con revisión fijada. release_provenance.json registra la identidad de la inicialización, el recuento de parámetros y los hashes SHA-256 de los ficheros de inferencia. El corpus ensamblado M1xEN y las salidas de traducción automática quedan excluidos de la release.

## Capacidades

- Generación de texto condicionada (seq2seq) con el tokenizer akan-inglés incluido; sin entrenamiento específico de tarea.
- Traducción automática akan-inglés e inglés-akan como capacidad objetivo del proyecto, aunque este checkpoint concreto no ha recibido ajuste de traducción.
- Transferencia de vocabulario verificable: permite comparar el estado previo al CPT frente al checkpoint posterior.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a ak y en según la model card; el estudio evalúa twi (asante y akuapem) e inglés, sin establecer cobertura de todas las variedades del akan.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Estudio controlado de adaptación de vocabulario: cargar este checkpoint y su pareja CPT (IARG-UF/akant5-base-replacement) para medir la contribución aislada del vocabulario nuevo frente al preentrenamiento continuado en métricas de traducción akan-inglés.
- Reproducción de experimentos de inicialización: usar release_provenance.json y los hashes SHA-256 para verificar que los pesos evaluados coinciden con los publicados, algo necesario en comparativas entre variantes de vocabulario.
- Punto de partida para CPT propio: investigadores que quieran aplicar su propia mezcla de preentrenamiento continuado sobre un vocabulario akan-inglés ya transferido, sin repetir el ajuste del tokenizer.
- Baseline de traducción de bajos recursos: servir como referencia inferior (sin CPT ni fine-tuning) en evaluaciones de twi-inglés, útil para cuantificar cuánto aporta cada etapa de entrenamiento.
- Análisis de tokenización: comparar la fertilidad y el comportamiento del byte-fallback del tokenizer de sustitución (64.100 entradas) frente a la variante de extensión (295.031 entradas) sobre corpus twi.
- Docencia e investigación en NLP africano: material reproducible para cursos o trabajos sobre adaptación de vocabulario en lenguas de bajos recursos, con licencia de solo investigación que encaja en ese contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de traducción (BLEU, chrF) para este checkpoint; el manuscrito asociado se cita como *AkanT5: Vocabulary Adaptation, Language Retention, and Model Capacity in Continued Pretraining* (Kweku Yamoah, Kevin Scroggins, Chibuzor Okocha, Christan Grant), pero sus resultados no forman parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1,2 GB solo para pesos (296,7 M de parámetros), más memoria de activaciones y KV cache según longitud de secuencia.
- En float16/bfloat16: alrededor de 0,6 GB para pesos; la conversión no está publicada como artefacto, pero es viable con transformers.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en precisión reducida; A100/H100 no son necesarias por tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (AutoModelForSeq2SeqLM), vLLM y TGI con soporte encoder-decoder, y conversión a GGUF para llama.cpp/Ollama (no publicada en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| IARG-UF/akant5-base-replacement-init (este) | 296,7 M | no disponible | ak, en | research-only | inicialización sin CPT |
| IARG-UF/akant5-base-replacement | no disponible en la informacion | no disponible | ak, en | research-only | checkpoint tras CPT |
| google/mt5-base | ~580 M (modelo base original) | no disponible | multilingüe (~100 idiomas) | Apache 2.0 | modelo preentrenado general |
| Variante de extensión de vocabulario AkanT5 | no disponible en la informacion | no disponible | ak, en | research-only | vocabulario de 295.031 entradas |

La comparación con mT5 base es la más directa: mismo esqueleto arquitectónico, pero este checkpoint reduce el vocabulario a akan-inglés y no ha recibido entrenamiento adicional. Frente a la variante de extensión, la diferencia clave es la estrategia de vocabulario (sustitución con 64.128 filas frente a extensión con 295.040 filas), lo que afecta al tamaño efectivo de embeddings y a la transferencia de parámetros.

## Limitaciones y advertencias

- Solo para investigación: la licencia akant5-research-use-only restringe el uso comercial; deben revisarse LICENSE, NOTICE y la licencia Apache 2.0 upstream de mT5.
- Sin entrenamiento de tarea: no ha recibido CPT ni fine-tuning de traducción, por lo que su calidad generativa será inferior a la del checkpoint CPT asociado.
- Riesgo de alucinación y salidas degeneradas: al no estar entrenado sobre el vocabulario nuevo, la transferencia de embeddings puede producir generaciones incoherentes en akan.
- Cobertura lingüística limitada: el estudio evalúa twi (asante y akuapem) e inglés; no se establece cobertura de todas las variedades del akan.
- Limitaciones de procedencia: las licencias de los datasets de origen (varias cc-by-nc-4.0) condicionan el vocabulario aprendido y los artefactos de adaptación.
- Configuración sensible: hay que cargar el tokenizer del repositorio para preservar los IDs de vocabulario y el byte-fallback, fijar tie_word_embeddings=False y ajustar dropout_rate=0.1 antes de construir el modelo de fine-tuning.
- Longitud de contexto no documentada en la información disponible; no asumir la de mT5 sin verificar la configuración del repositorio.
- Advertencia de seguridad: la model card es material de referencia del autor y no debe interpretarse como instrucciones operativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IARG-UF/akant5-base-replacement-init
- Checkpoint CPT asociado: https://huggingface.co/IARG-UF/akant5-base-replacement
- Colección AkanT5: https://huggingface.co/collections/IARG-UF/akant5-cpt-checkpoints-and-vocabulary-initializations
- Modelo base: https://huggingface.co/google/mt5-base
- Repositorio de código y configuraciones: https://github.com/Intelligent-Agents-Research-Group/akant5
- Dataset pristine-twi-english: https://huggingface.co/datasets/ghananlpcommunity/pristine-twi-english
- Dataset ghok-parallel-en-twi: https://huggingface.co/datasets/ghanaopenai/ghok-parallel-en-twi
- Dataset ghana-farmer-qa-twi: https://huggingface.co/datasets/ghanaopenai/ghana-farmer-qa-twi
- Dataset true-asr-ipa-pairs-twi: https://huggingface.co/datasets/ghananlpcommunity/true-asr-ipa-pairs-twi
- Dataset kumawood-speech-transcriptions: https://huggingface.co/datasets/ghanaopenai/kumawood-speech-transcriptions
- Dataset ghana-speech: https://huggingface.co/datasets/ghanaopenai/ghana-speech
- Wikipedia (20231101.tw): https://huggingface.co/datasets/wikimedia/wikipedia
- C4 (en-multi): https://huggingface.co/datasets/allenai/c4
