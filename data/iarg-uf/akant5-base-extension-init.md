# IARG-UF/akant5-base-extension-init

## Resumen

AkanT5 base extension init es un checkpoint de inicialización de vocabulario derivado de google/mt5-base, publicado por el Intelligent Agents Research Group de la Universidad de Florida (IARG-UF). No es un modelo entrenado para tareas: es el artefacto intermedio que resulta de sustituir el vocabulario original de mT5 por uno extendido que incorpora piezas en akan (twi) junto con inglés, antes de aplicar cualquier fase de preentrenamiento continuado (CPT) o ajuste fino de traducción automática. Su función es servir de punto de partida controlado para estudiar la transferencia de vocabulario en modelos multilingües.

La arquitectura es la de mT5, un transformer encoder-decoder con 651.410.688 parámetros totales, almacenados en safetensors float32. La extensión de vocabulario mantiene los identificadores originales de mT5 y añade nuevas piezas akan-inglés, pasando de 250.112 entradas originales a 295.031 entradas de tokenizer y 295.040 filas de embedding/salida. Las filas nuevas se inicializan a partir de los parámetros correspondientes de mT5 mediante un procedimiento de transferencia documentado.

El modelo es relevante para investigadores que trabajan en adaptación de vocabulario para lenguas de bajos recursos, en concreto el twi (variantes asante y akuapem), y que necesitan un punto de comparación limpio antes del CPT. Su licencia es estrictamente de investigación (akant5-research-use-only) y no ha recibido entrenamiento específico de ninguna tarea, por lo que no debe emplearse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mT5 encoder-decoder (transformer) |
| Parametros totales | 651.410.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; pesos almacenados en float32 safetensors |
| Idiomas soportados | ak (akan/twi), en (inglés) |
| Licencia | akant5-research-use-only (other, research only) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un mT5 base estándar, es decir, un transformer encoder-decoder con atención completa, adaptado mediante extensión de vocabulario. La estrategia de extensión conserva los IDs originales de mT5 y añade piezas akan-inglés, lo que da lugar a 295.031 entradas de tokenizer y 295.040 filas de embedding y de la cabeza de salida. Las filas nuevas no se inicializan aleatoriamente: se transfieren desde los parámetros correspondientes de mT5 siguiendo el procedimiento de inicialización registrado en el repositorio. El tokenizer y la configuración del modelo se guardan sin modificar en cada repositorio para preservar los IDs y el comportamiento de byte-fallback.

Este checkpoint concreto tiene cero actualizaciones de CPT: es el estado previo al preentrenamiento continuado. El checkpoint CPT asociado es IARG-UF/akant5-base-extension. La configuración almacena `dropout_rate=0.1`, mientras que el checkpoint CPT asociado almacena `dropout_rate=0.0` tal como se entrenó; el ajuste fino supervisado de traducción del artículo usa `dropout_rate=0.1` en todos los modelos. Los artefactos se prepararon con Transformers 5.16.1. La mezcla de fuentes del CPT correspondiente incluye corpus paralelos y de voz twi-inglés de ghananlpcommunity y ghanaopenai (licencias cc-by-nc-4.0), Wikipedia en twi (cc-by-sa-3.0) y allenai/c4 en inglés (odc-by); no se ha aplicado CPT sobre esta mezcla al checkpoint de este repositorio.

## Capacidades

- Generación de texto seq2seq condicionada al vocabulario extendido akan-inglés.
- Tokenización de texto en twi (asante y akuapem) e inglés con byte-fallback.
- Punto de partida para ajuste fino de traducción automática akan-inglés.
- Punto de partida para preentrenamiento continuado (CPT) sobre corpus twi.
- Comparación controlada de transferencia de vocabulario antes y después de CPT.
- No incluye tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- No ha recibido entrenamiento específico de ninguna tarea.

## Casos de uso

- Investigación en adaptación de vocabulario: sirve como referencia "antes de CPT" para medir el efecto de la extensión de vocabulario frente al checkpoint CPT asociado en experimentos de retención de lengua.
- Ajuste fino de traducción automática twi-inglés: el modelo se carga con `AutoModelForSeq2SeqLM`, se fija `dropout_rate=0.1` en la configuración antes de construir el modelo y se entrena sobre pares paralelos, tal como describe el artículo asociado.
- Preentrenamiento continuado sobre corpus akan: es el estado inicial limpio sobre el que aplicar CPT con la mezcla documentada (corpus paralelos, voz, Wikipedia twi y C4 inglés).
- Estudio de transferencia de embeddings: permite analizar cómo se comportan las filas nuevas inicializadas desde mT5 frente a las originales en tareas de generación en twi.
- Evaluación de tokenizadores para lenguas de bajos recursos: el tokenizer de 295.031 entradas puede compararse con el de sustitución (64.100 entradas) para medir eficiencia de segmentación en twi.
- Reproducibilidad de experimentos: los ficheros `sources.json` y `release_provenance.json` permiten reconstruir la identidad de la inicialización, el recuento de parámetros y los hashes SHA-256 de los ficheros de inferencia.
- Docencia e investigación académica sobre modelos multilingües: al ser research-only y no tener ajuste de tarea, es adecuado para laboratorios que quieran partir de un baseline documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 2,6 GB solo para pesos (651 M de parámetros), más overhead de activaciones y del tokenizer; en la práctica, entre 3 y 4 GB para secuencias cortas.
- En float16/bfloat16, los pesos ocuparían aproximadamente 1,3 GB; la conversión no está documentada en el repositorio, que solo distribuye float32.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en float32 con secuencias moderadas; una RTX 3090, RTX 4090, A100 o H100 son suficientes y de sobra.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes.
- Opciones de despliegue: transformers con `AutoModelForSeq2SeqLM` y `AutoTokenizer` (versión 5.16.1 según el autor); compatible con endpoints. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y al ser un encoder-decoder mT5 la integración con esos motores no está garantizada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| IARG-UF/akant5-base-extension-init | 651.410.688 | no disponible | ak, en | research only | Inicialización sin CPT |
| IARG-UF/akant5-base-extension | no disponible | no disponible | ak, en | research only | Checkpoint CPT asociado |
| google/mt5-base | 580 M aprox. (según ficha de mT5) | no disponible | multilingüe | Apache 2.0 | Modelo base original |
| Modelo de sustitución de vocabulario AkanT5 (64.100 entradas) | no disponible | no disponible | ak, en | research only | Variante alternativa del estudio |

La comparación con google/mt5-base es directa: mismo esqueleto arquitectónico, pero con vocabulario extendido a 295.031 entradas y filas nuevas inicializadas por transferencia. El checkpoint CPT asociado es el siguiente paso del mismo pipeline experimental.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: la licencia akant5-research-use-only restringe el uso comercial; deben revisarse LICENSE, NOTICE y la licencia Apache 2.0 upstream de mT5.
- No ha recibido entrenamiento específico de tareas: no es apto para producción ni para traducción directa sin ajuste fino previo.
- El estudio asociado evalúa twi (asante y akuapem) e inglés; no establece cobertura de todas las variedades del akan.
- Las fuentes del CPT tienen licencias cc-by-nc-4.0 (no comercial) y cc-by-sa-3.0, lo que condiciona los artefactos derivados.
- El corpus M1xEN ensamblado y las salidas de traducción automática quedan excluidos de la release, lo que limita la reproducibilidad completa de los resultados.
- El tokenizer de sustitución precede a las particiones finales del CPT; la selección de fuentes para el ajuste del tokenizer y las proporciones de inglés difieren de las del CPT.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo sin ajuste de tarea, la generación libre no está calibrada.
- Longitud de contexto: no especificada en la información proporcionada; debe consultarse la configuración de mT5 base.

## Enlaces

- Hugging Face: https://huggingface.co/IARG-UF/akant5-base-extension-init
- Checkpoint CPT asociado: https://huggingface.co/IARG-UF/akant5-base-extension
- Colección AkanT5: https://huggingface.co/collections/IARG-UF/akant5-cpt-checkpoints-and-vocabulary-initializations
- Modelo base: https://huggingface.co/google/mt5-base
- Repositorio de código y configuraciones: https://github.com/Intelligent-Agents-Research-Group/akant5
- Manuscrito asociado: *AkanT5: Vocabulary Adaptation, Language Retention, and Model Capacity in Continued Pretraining*, Kweku Yamoah, Kevin Scroggins, Chibuzor Okocha, Christan Grant y Emmanuel (enlace no disponible en la información proporcionada)
