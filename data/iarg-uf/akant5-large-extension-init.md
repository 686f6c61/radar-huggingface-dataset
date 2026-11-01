# IARG-UF/akant5-large-extension-init

## Resumen

AkanT5 large: vocabulary extension initialization es un artefacto de investigación publicado por el Intelligent Agents Research Group de la Universidad de Florida (IARG-UF). Se trata de una inicialización de `google/mt5-large` en la que se ha extendido el vocabulario original de mT5 (250.100 entradas) con piezas Akan-inglés, alcanzando 295.031 entradas de tokenizador y 295.040 filas de embedding/salida. No es un modelo entrenado para tareas: es el punto de partida previo al continued pretraining (CPT) y al fine-tuning de traducción automática.

El modelo conserva la arquitectura encoder-decoder de mT5 con 1.321.593.856 parámetros, almacenados en safetensors float32 (5,3 GB de repositorio). Su función es permitir comparaciones controladas del efecto de la transferencia de vocabulario antes y después del CPT, dentro del estudio AkanT5 sobre adaptación de vocabulario, retención lingüística y capacidad de modelo.

Es relevante ahora porque documenta de forma reproducible una técnica habitual en modelos multilingües de bajos recursos: extender el vocabulario de un modelo base en lugar de reemplazarlo, preservando los IDs originales y transfiriendo las filas nuevas desde los parámetros mT5 correspondientes. El checkpoint CPT asociado es `IARG-UF/akant5-large-extension`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mT5 encoder-decoder (transformer) |
| Parametros totales | 1.321.593.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | ak (akan/twi), en |
| Licencia | akant5-research-use-only (research use only) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es la de mT5-large: un transformer encoder-decoder con atención completa, sin modificaciones estructurales respecto al modelo base de Google. La innovación del artefacto está en el vocabulario: la estrategia de extensión mantiene los IDs originales de mT5 y añade piezas Akan-inglés, pasando de 250.100 a 295.031 entradas de tokenizador y de 250.112 a 295.040 filas de embedding y de la cabeza de salida. Las filas nuevas se transfieren desde los parámetros mT5 correspondientes mediante el procedimiento de inicialización documentado en el repositorio.

Este repositorio concreto tiene 0 actualizaciones de CPT: es la inicialización pura. El CPT se aplicó sobre la mezcla fijada en el checkpoint asociado, cuyas fuentes incluyen corpus paralelos twi-inglés de GhanaNLP y GhanaOpenAI, Wikipedia en twi, datos de habla y `allenai/c4` en inglés. El modelo almacena `dropout_rate=0.1`, mientras que el checkpoint CPT asociado almacena `dropout_rate=0.0`; el fine-tuning supervisado de MT del artículo usa `dropout_rate=0.1` en todos los modelos, y debe fijarse en la configuración antes de instanciar el modelo. Los artefactos se prepararon con Transformers 5.16.1 y requieren cargar el tokenizador guardado en el repositorio para preservar los IDs y el comportamiento de byte-fallback. mT5 comparte embeddings de entrada entre encoder y decoder, pero la cabeza de salida es independiente, por lo que debe fijarse `tie_word_embeddings = False`.

## Capacidades

- Generación de texto seq2seq mediante `AutoModelForSeq2SeqLM`; la tarea prevista es traducción automática twi-inglés e inglés-twi.
- Punto de partida para continued pretraining (CPT) sobre corpus Akan-inglés.
- Punto de partida para fine-tuning supervisado de traducción automática.
- Soporte de tokenizador con byte-fallback para texto Akan.
- Capacidades multilingües limitadas a ak y en según la model card.
- No incluye tool calling, function calling, agentes, modo thinking, visión ni audio.
- No ha recibido entrenamiento específico de tarea: no es un modelo listo para producción.

## Casos de uso

- Investigación sobre adaptación de vocabulario: sirve como línea base para medir el efecto de la extensión de vocabulario frente al reemplazo, comparando este artefacto con la variante de sustitución del mismo estudio.
- Reproducción de experimentos de CPT: cargar esta inicialización y aplicar el mismo corpus y configuración que el artículo permite replicar la curva de retención lingüística y capacidad de modelo.
- Fine-tuning de traducción twi-inglés: el vocabulario extendido reduce la fragmentación de tokens Akan y mejora la eficiencia de entrenamiento en corpus paralelos como los de GhanaNLP.
- Estudio de transferencia de embeddings: las filas nuevas inicializadas desde parámetros mT5 permiten analizar cuánto conocimiento multilingüe se transfiere a un idioma de bajos recursos antes de cualquier entrenamiento adicional.
- Evaluación comparativa de tokenizadores: con 295.031 entradas frente a las 250.100 de mT5, permite medir el impacto de la granularidad del vocabulario en métricas BLEU/chrF sobre twi.
- Base para modelos de traducción en dominio sanitario o agrícola: los corpus de referencia incluyen QA agrícola twi y transcripciones de habla, útiles para adaptar el modelo a dominios concretos de Ghana.
- Docencia y experimentación académica: al ser research-only y de tamaño contenido (1,3B parámetros), es viable en entornos universitarios con una sola GPU para pruebas de fine-tuning con cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso en float32: aproximadamente 5,3 GB, lo que exige al menos 6-8 GB de VRAM solo para los pesos.
- Inferencia en float32: viable en RTX 3090, RTX 4090, A100 y H100; en GPUs consumer de 8 GB requiere cuantización o descarga por capas.
- Fine-tuning completo: requiere del orden de 16-24 GB de VRAM con optimizador Adam y batch pequeño; recomendable A100 40 GB o H100 para batches mayores.
- Fine-tuning con LoRA o congelación parcial: viable en RTX 4090 (24 GB) y RTX 3090.
- Despliegue: compatible con `transformers` (versión 5.16.1 usada en la preparación), vLLM y TGI para seq2seq; llama.cpp y Ollama no soportan de forma nativa mT5 encoder-decoder.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| IARG-UF/akant5-large-extension-init | 1.321.593.856 | no disponible | ak, en | research use only | inicialización sin CPT |
| google/mt5-large | 1.200.000.000 aprox. | no disponible | 101 idiomas | Apache 2.0 | modelo base preentrenado |
| IARG-UF/akant5-large-extension | 1.321.593.856 | no disponible | ak, en | research use only | checkpoint CPT del mismo estudio |
| Variante de sustitución de vocabulario del estudio AkanT5 | 1.321.593.856 | no disponible | ak, en | research use only | vocabulario de 64.100 entradas |

La comparación con mT5-large es la más directa: mismo esqueleto, pero con 44.928 filas adicionales de embedding y una cabeza de salida desacoplada. Frente a la variante de sustitución (64.100 entradas de tokenizador, 64.128 filas), la extensión preserva todo el vocabulario original y añade piezas nuevas, lo que permite comparar ambas estrategias bajo el mismo protocolo experimental.

## Limitaciones y advertencias

- Licencia `akant5-research-use-only`: no permite uso comercial; deben revisarse `LICENSE`, `NOTICE` y la licencia Apache 2.0 heredada de mT5.
- El modelo no ha recibido entrenamiento de tarea: generar traducciones directamente con esta inicialización produce resultados sin ajustar.
- Cobertura lingüística limitada al twi (Asante y Akuapem) y al inglés; el estudio no establece cobertura de todas las variedades del akan.
- Riesgo de alucinación y de traducciones incorrectas si se usa sin fine-tuning supervisado.
- Las fuentes de datos del CPT asociado incluyen corpus con licencia CC BY-NC 4.0, lo que condiciona la procedencia y el uso de los artefactos derivados.
- La configuración de dropout debe ajustarse manualmente (`dropout_rate=0.1` para fine-tuning de MT, `0.0` en el checkpoint CPT) antes de instanciar el modelo; ignorarlo altera la reproducibilidad.
- Es obligatorio cargar el tokenizador del repositorio con `fix_mistral_regex=False` para preservar IDs y byte-fallback.
- No se han publicado benchmarks ni métricas de latencia en la información disponible, lo que impide estimar calidad en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IARG-UF/akant5-large-extension-init
- Checkpoint CPT asociado: https://huggingface.co/IARG-UF/akant5-large-extension
- Colección AkanT5: https://huggingface.co/collections/IARG-UF/akant5-cpt-checkpoints-and-vocabulary-initializations
- Modelo base: https://huggingface.co/google/mt5-large
- Repositorio de código y configuraciones: https://github.com/Intelligent-Agents-Research-Group/akant5
- Manuscrito asociado: *AkanT5: Vocabulary Adaptation, Language Retention, and Model Capacity in Continued Pretraining* (Kweku Yamoah, Kevin Scroggins, Chibuzor Okocha, Christan Grant y otros); enlace no disponible en la información proporcionada.
