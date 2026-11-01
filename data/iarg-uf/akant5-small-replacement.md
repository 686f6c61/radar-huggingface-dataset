# IARG-UF/akant5-small-replacement

## Resumen

AkanT5 small (vocabulary replacement) es un checkpoint de preentrenamiento continuado (CPT) desarrollado por el Intelligent Agents Research Group de la Universidad de Florida (IARG-UF) a partir de google/mt5-small. El modelo adapta el backbone mT5 encoder-decoder al par de idiomas twi (akano) e inglés mediante una estrategia de sustitución completa del vocabulario: en lugar de extender el tokenizador original, lo reemplaza por uno nuevo de 64.100 entradas con 64.128 filas de embedding, ajustado al corpus objetivo. El resultado son 109.729.152 parámetros en precisión float32.

El modelo no es un sistema de traducción listo para usar: es un artefacto intermedio de investigación que precede a la fine-tuning supervisada en traducción automática. Su propósito es servir como base para estudiar adaptación de vocabulario, retención de inglés y reconstrucción de texto en lenguas de bajos recursos, concretamente twi (variantes asante y akuapem). El entrenamiento se realizó sobre M1xEN, una mezcla con objetivo del 80% twi y 20% inglés por caracteres retenidos, con un límite de 50.000 actualizaciones y el checkpoint seleccionado en la actualización 50.000.

La relevancia del modelo reside en su enfoque metodológico: compara tres tamaños de backbone mT5 (small, base, large) bajo dos estrategias de vocabulario (replacement y extension), y publica los checkpoints junto con las inicializaciones de vocabulario y la procedencia de datos fijada por revisión. Es, por tanto, material reproducible para investigación en PLN multilingüe de bajos recursos, no un modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | mT5 encoder-decoder (transformer) |
| Parámetros totales | 109.729.152 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en float32 safetensors) |
| Idiomas soportados | ak (twi: asante y akuapem), en |
| Licencia | akant5-research-use-only (research use only) |
| Formato de pesos | safetensors (float32) |
| Estrategia de vocabulario | replacement (64.100 entradas, 64.128 filas de embedding/salida) |
| Actualización CPT seleccionada | 50.000 |
| Dropout CPT | 0.0 |
| Librería | transformers (preparado con Transformers 5.16.1) |
| Modelo base | IARG-UF/akant5-small-replacement-init (derivado de google/mt5-small) |
| Tamaño del repo | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es la de mT5-small: un transformer encoder-decoder con atención completa, embeddings de entrada compartidos entre encoder y decoder y una cabeza de salida separada (de ahí la recomendación de fijar `tie_word_embeddings=False` tras la carga). La innovación principal no está en el backbone sino en el tokenizador: se sustituye el vocabulario original de mT5 por uno de 64.100 entradas con byte-fallback, dimensionado para el twi y el inglés, con 64.128 filas en la matriz de embedding y en la cabeza de salida. El repositorio gemelo con estrategia de extensión usa 295.031 entradas y 295.040 filas, lo que permite comparar ambas aproximaciones con el mismo backbone.

El preentrenamiento continuado emplea span corruption sobre el corpus M1xEN, una mezcla normalizada de texto twi con replay de inglés, con objetivo del 80% twi y 20% inglés por caracteres de entrenamiento retenidos. Las fuentes están fijadas por revisión e incluyen pristine-twi-english, ghok-parallel-en-twi, ghana-farmer-qa-twi, true-asr-ipa-pairs-twi, kumawood-speech-transcriptions, Wikipedia en twi (20231101.tw), ghana-speech (configuraciones Akuapem_Twi y Asante_Twi) y allenai/c4 (en-multi). El autor advierte que varias fuentes son sintéticas y que la mayoría de las fuentes twi tienen licencias no comerciales (cc-by-nc-4.0), y que las etiquetas de fuente no garantizan autoría humana ni revisión por hablantes nativos. No se documenta en la información disponible el uso de RLHF, DPO ni datos de preferencias. El dropout configurado en el CPT serializado es 0.0, mientras que el protocolo principal de fine-tuning de traducción del paper fija 0.1.

## Capacidades

- Generación de texto condicionada (seq2seq) sobre vocabulario twi-inglés, como base para tareas posteriores.
- Reconstrucción de texto enmascarado (span corruption), útil para evaluar la calidad de la adaptación de vocabulario.
- Retención de inglés gracias al replay del 20% en el corpus de CPT.
- Soporte de twi en variantes asante y akuapem, según el alcance declarado de la evaluación del estudio.
- Punto de partida para fine-tuning supervisado de traducción automática inglés-twi y twi-inglés.
- Compatible con el ecosistema transformers (`AutoModelForSeq2SeqLM`, `AutoTokenizer`), incluido `fix_mistral_regex=False` en la carga del tokenizador.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Investigación en adaptación de vocabulario: comparar la estrategia replacement frente a extension con el mismo backbone mT5-small, cargando ambos checkpoints y midiendo reconstrucción y retención de inglés sobre M1xEN.
- Fine-tuning de traducción automática inglés-twi: partir de este checkpoint, fijar `dropout_rate=0.1` y `tie_word_embeddings=False`, y entrenar sobre un corpus paralelo supervisado para obtener un sistema de traducción utilizable.
- Estudio de retención de inglés tras CPT: evaluar cuánta capacidad en inglés se conserva con el 20% de replay y cuantificar el olvido catastrófico frente a un mT5-small sin adaptar.
- Reproducción de experimentos: el repositorio incluye procedencia fijada por revisión, hashes SHA-256 de los ficheros de inferencia y configuraciones de experimento en el repositorio de GitHub, lo que permite replicar el pipeline completo.
- Evaluación de calidad de tokenizadores para lenguas de bajos recursos: analizar el comportamiento del byte-fallback y la cobertura del vocabulario de 64.100 entradas sobre texto twi real.
- Base para experimentos de PLN en akan: al ser un checkpoint intermedio, sirve para probar técnicas de adaptación antes de invertir en fine-tuning de tareas concretas como resumen, QA o transliteración.
- Docencia y formación: modelo pequeño (0,4 GB, 109,7 M de parámetros) que cabe en hardware modesto y permite ilustrar CPT, sustitución de vocabulario y evaluación de modelos multilingües en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el estudio evalúa reconstrucción, retención de inglés y adaptación posterior de tareas sobre twi (asante y akuapem) e inglés, pero no incluye cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 109,7 M de parámetros en float32, los pesos ocupan aproximadamente 0,44 GB; en fp16 unos 0,22 GB. La VRAM total necesaria es inferior a 1 GB para inferencia en lote pequeño.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema; el modelo está sobredimensionado para GPUs de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: transformers con PyTorch es la vía documentada. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible; al ser un modelo seq2seq mT5, la integración con esos servidores requeriría verificación adicional.
- Latencia y throughput: no disponibles. Por el tamaño, se espera latencia de milisegundos por secuencia corta en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IARG-UF/akant5-small-replacement | 109,7 M | no disponible | ak, en | research use only | HuggingFace |
| google/mt5-small | 300 M aprox. | no disponible | 101 idiomas | Apache 2.0 | HuggingFace |
| IARG-UF/akant5-small-replacement-init | no disponible | no disponible | ak, en | research use only | HuggingFace |
| IARG-UF/akant5-small-extension | no disponible | no disponible | ak, en | research use only | HuggingFace |

La comparación con mT5-small es la más informativa: AkanT5 small reduce el vocabulario de 250.000 a 64.100 entradas, lo que explica en parte su menor número de parámetros (109,7 M frente a los aproximadamente 300 M de mT5-small). Frente a la variante extension del mismo proyecto, la diferencia clave es el tamaño del vocabulario (64.100 frente a 295.031 entradas) y el consiguiente coste computacional. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: la licencia akant5-research-use-only restringe el uso a investigación; no está permitido el uso comercial sin consultar LICENSE y NOTICE.
- No es un traductor listo para producción: requiere fine-tuning supervisado específico de la tarea antes de generar traducciones utilizables.
- Licencias de datos de origen: la mayoría de las fuentes twi son cc-by-nc-4.0, lo que impone restricciones adicionales sobre los pesos derivados y su uso.
- Calidad y autoría de los datos: varias fuentes son sintéticas y las etiquetas no garantizan autoría humana ni revisión por hablantes nativos; el autor lo advierte explícitamente.
- Cobertura lingüística limitada: la evaluación se limita a twi asante y akuapem e inglés; no se establece cobertura de todas las variedades del akan.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a un modelo seq2seq pequeño entrenado con datos parcialmente sintéticos.
- Configuración de carga sensible: es necesario cargar el tokenizador del repositorio para preservar los IDs de vocabulario y el byte-fallback, y fijar `tie_word_embeddings=False` tras la carga; ignorar estos pasos degrada los resultados.
- Dropout: el checkpoint serializado mantiene `dropout_rate=0.0`; para reproducir el protocolo de fine-tuning del paper hay que establecer 0.1 antes de construir el modelo, no después.
- Contexto: no se documenta la longitud máxima de secuencia, lo que impide planificar despliegues con entradas largas sin verificar la configuración.
- Corpus y salidas de traducción excluidos de la release: el corpus M1xEN y las salidas de MT no se distribuyen, lo que limita la reproducibilidad completa sin acceso a las fuentes originales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IARG-UF/akant5-small-replacement
- Inicialización de vocabulario: https://huggingface.co/IARG-UF/akant5-small-replacement-init
- Colección AkanT5 (12 checkpoints e inicializaciones): https://huggingface.co/collections/IARG-UF/akant5-cpt-checkpoints-and-vocabulary-initializations
- Modelo base original: https://huggingface.co/google/mt5-small
- Repositorio de código y configuraciones: https://github.com/Intelligent-Agents-Research-Group/akant5
- Dataset pristine-twi-english: https://huggingface.co/datasets/ghananlpcommunity/pristine-twi-english
- Dataset ghok-parallel-en-twi: https://huggingface.co/datasets/ghanaopenai/ghok-parallel-en-twi
- Dataset ghana-farmer-qa-twi: https://huggingface.co/datasets/ghanaopenai/ghana-farmer-qa-twi
- Dataset true-asr-ipa-pairs-twi: https://huggingface.co/datasets/ghananlpcommunity/true-asr-ipa-pairs-twi
- Dataset kumawood-speech-transcriptions: https://huggingface.co/datasets/ghanaopenai/kumawood-speech-transcriptions
- Dataset Wikipedia twi: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset ghana-speech: https://huggingface.co/datasets/ghanaopenai/ghana-speech
- Dataset allenai/c4: https://huggingface.co/datasets/allenai/c4
