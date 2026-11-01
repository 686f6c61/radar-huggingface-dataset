# IARG-UF/akant5-small-replacement-init

## Resumen

AkanT5 small replacement-init es un punto de control intermedio de investigación desarrollado por el Intelligent Agents Research Group de la Universidad de Florida (IARG-UF). No es un modelo entrenado para tareas finales, sino una inicialización con vocabulario adaptado derivada de google/mt5-small, publicada antes de cualquier fase de preentrenamiento continuado (CPT) o ajuste fino de traducción automática. Con 109.729.152 parámetros, sirve como referencia controlada para estudiar la transferencia de vocabulario entre el tokenizador original de mT5 y uno nuevo orientado a akán (twi) e inglés.

El modelo mantiene la arquitectura encoder-decoder de mT5, pero sustituye por completo el vocabulario original por uno de 64.100 entradas de tokenizador y 64.128 filas de embedding/salida. Las filas nuevas se inicializan a partir de los parámetros correspondientes de mT5 mediante un procedimiento documentado, lo que permite comparar el efecto de la sustitución de vocabulario antes y después del CPT. Es relevante porque aísla una variable concreta —la inicialización del vocabulario— en el estudio de adaptación lingüística para lenguas de bajos recursos.

Su licencia es estrictamente de investigación (akant5-research-use-only) y no ha recibido entrenamiento específico de ninguna tarea. Se publica junto a otros once artefactos de la colección AkanT5 y su checkpoint CPT asociado, akant5-small-replacement.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | mT5 encoder-decoder (transformer) |
| Parámetros totales | 109.729.152 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos almacenados en float32) |
| Idiomas soportados | ak (akán/twi), en (inglés) |
| Licencia | akant5-research-use-only (other) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de la familia mT5, con atención completa estándar y sin modificaciones estructurales respecto al modelo base google/mt5-small. La innovación reside exclusivamente en la capa de embeddings: se sustituye el vocabulario original de mT5 por uno de 64.100 entradas de tokenizador y 64.128 filas de embedding y salida. Las filas nuevas se transfieren desde los parámetros de mT5 siguiendo el procedimiento de inicialización registrado en el repositorio. El modelo conserva la compartición de embeddings de entrada entre encoder y decoder, mientras que la cabeza de salida es independiente (`tie_word_embeddings = False`).

Este repositorio no ha recibido ninguna actualización de CPT (0 pasos) ni ajuste fino supervisado. El entrenamiento asociado se documenta en el checkpoint CPT akant5-small-replacement, que utiliza una mezcla de datos con fuentes fijadas por revisión: corpus paralelos twi-inglés de ghananlpcommunity y ghanaopenai (licencia cc-by-nc-4.0), Wikipedia en twi (cc-by-sa-3.0), ghana-speech en variedades Akuapem y Asante, y allenai/c4 en inglés (odc-by). La selección de fuentes para el ajuste del tokenizador difiere de la mezcla de CPT, y el tokenizador de sustitución precede a las particiones finales de CPT. El rate de dropout almacenado en esta inicialización es 0.1, mientras que el checkpoint CPT asociado almacena 0.0; el ajuste fino supervisado del estudio usa 0.1 en todos los modelos, lo que debe configurarse antes de instanciar el modelo.

## Capacidades

- Generación de texto seq2seq condicionada a entrada, propia de un modelo encoder-decoder.
- Traducción automática potencial entre akán (twi) e inglés tras el ajuste fino correspondiente, no incluida en esta inicialización.
- Tokenización adaptada a akán e inglés con comportamiento de byte-fallback preservado.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidad multilingüe limitada a los dos idiomas del vocabulario sustituido.
- No ha recibido entrenamiento específico de ninguna tarea, por lo que sus capacidades generativas directas son las heredadas de mT5-small sin adaptación.

## Casos de uso

- Estudio controlado de transferencia de vocabulario: sirve como línea base antes del CPT para medir el impacto aislado de la sustitución del tokenizador en métricas de retención lingüística.
- Reproducción de experimentos académicos: permite replicar el procedimiento de inicialización de AkanT5 y comparar con la variante de extensión de vocabulario (295.031 entradas).
- Ajuste fino supervisado de traducción twi-inglés: punto de partida para entrenar un modelo de traducción con dropout 0.1, tal como describe el manuscrito asociado.
- Investigación en lenguas de bajos recursos: base para experimentos de adaptación de vocabulario en otras variedades del akán, aunque el estudio solo evalúa Asante y Akuapem.
- Análisis de inicialización de embeddings: útil para estudiar cómo se transfieren las representaciones de mT5 a un vocabulario nuevo y qué filas quedan peor inicializadas.
- Docencia y formación en NLP multilingüe: ejemplo didáctico de pipeline de adaptación de vocabulario con tokenizador propio y configuración independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 440 MB solo para pesos, más activaciones y memoria del tokenizador; en la práctica, menos de 2 GB para secuencias cortas.
- VRAM estimada en float16: alrededor de 220 MB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 no suponen ninguna restricción para este tamaño.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers con AutoModelForSeq2SeqLM; compatible con endpoints; no se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| IARG-UF/akant5-small-replacement-init | 109.729.152 | no disponible | ak, en | research-only | inicialización sin CPT |
| IARG-UF/akant5-small-replacement | no disponible en la información | no disponible | ak, en | research-only | checkpoint CPT asociado |
| google/mt5-small | no disponible en la información | no disponible | multilingüe | Apache 2.0 | modelo base preentrenado |
| Variante de extensión de vocabulario AkanT5 | no disponible en la información | no disponible | ak, en | research-only | 295.040 filas de embedding |

## Limitaciones y advertencias

- Licencia estrictamente de investigación: no permite uso comercial sin revisar LICENSE y NOTICE del repositorio.
- No ha recibido entrenamiento de tarea alguna; usarlo directamente para traducción o generación produce resultados no adaptados.
- El estudio asociado solo evalúa twi (Asante y Akuapem) e inglés; no establece cobertura de todas las variedades del akán.
- Las fuentes de datos del CPT tienen licencias cc-by-nc-4.0 en su mayoría, lo que condiciona la procedencia y el uso de los artefactos derivados.
- El tokenizador de sustitución precede a las particiones finales de CPT; la selección de fuentes para su ajuste difiere de la mezcla de CPT.
- Riesgo de sesgos y alucinaciones heredado de mT5-small, agravado por la falta de ajuste específico.
- La configuración de dropout difiere entre esta inicialización (0.1) y el checkpoint CPT (0.0); debe ajustarse manualmente antes del ajuste fino para reproducir el estudio.
- No se documentan resultados de benchmarks ni evaluaciones de calidad en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IARG-UF/akant5-small-replacement-init
- Checkpoint CPT asociado: https://huggingface.co/IARG-UF/akant5-small-replacement
- Colección AkanT5: https://huggingface.co/collections/IARG-UF/akant5-cpt-checkpoints-and-vocabulary-initializations
- Modelo base: https://huggingface.co/google/mt5-small
- Repositorio de código y configuraciones: https://github.com/Intelligent-Agents-Research-Group/akant5
- Manuscrito asociado: *AkanT5: Vocabulary Adaptation, Language Retention, and Model Capacity in Continued Pretraining*, Kweku Yamoah, Kevin Scroggins, Chibuzor Okocha, Christan (referencia incompleta en la información disponible)
