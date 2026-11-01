# IARG-UF/akant5-large-extension

## Resumen

AkanT5 large extension es un checkpoint de preentrenamiento continuado (continued pretraining, CPT) derivado de google/mt5-large, desarrollado por el Intelligent Agents Research Group de la Universidad de Florida (IARG-UF). El modelo adapta el backbone mT5-large al twi (ak), una lengua akan hablada en Ghana, mediante una estrategia de extension de vocabulario que amplia el tokenizador original de 64.100 entradas hasta 295.031 entradas, manteniendo las filas de embedding y de salida correspondientes (295.040 filas).

El objetivo del modelo no es la traduccion directa, sino servir como base preentrenada adaptada al dominio linguistico akan-ingles para investigacion sobre adaptacion de vocabulario, retencion del ingles y posterior ajuste fino en tareas supervisadas. El checkpoint seleccionado corresponde a la actualizacion 40.000 de un estudio que compara backbones mT5 small, base y large bajo estrategias de reemplazo y extension de vocabulario, con un limite de 50.000 actualizaciones.

Con 1.321.593.856 parametros, pesos en safetensors float32 y una licencia estrictamente de uso exclusivo para investigacion, el modelo es relevante ahora como referencia metodologica para quienes trabajan en adaptacion de modelos multilingues a lenguas de bajos recursos, y como punto de partida para pipelines de traduccion automatica ingles-twi tras el correspondiente fine-tuning supervisado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mT5 encoder-decoder (transformer) |
| Parametros totales | 1.321.593.856 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32 safetensors) |
| Idiomas soportados | ak (twi), en |
| Licencia | akant5-research-use-only (uso exclusivo para investigacion) |
| Formato de pesos | safetensors (float32) |
| Estrategia de vocabulario | extension |
| Entradas de tokenizador | 295.031 |
| Filas de embedding/salida | 295.040 |
| Actualizacion CPT seleccionada | 40.000 |
| Dropout CPT | 0.0 |
| Libreria | transformers (preparado con Transformers 5.16.1) |
| Modelo base | IARG-UF/akant5-large-extension-init (derivado de google/mt5-large) |
| Tamano del repositorio | 5.3 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura mT5 encoder-decoder estandar, con embeddings de entrada compartidos entre encoder y decoder y una cabeza de salida separada; la model card indica explicitamente que `tie_word_embeddings` debe fijarse a `False` tras la carga. La innovacion principal reside en la estrategia de extension de vocabulario: en lugar de reemplazar el tokenizador original, se amplia hasta 295.031 entradas, preservando el comportamiento de byte-fallback y las filas de embedding correspondientes. La inicializacion del vocabulario asociada se publica aparte en IARG-UF/akant5-large-extension-init.

El preentrenamiento continuado utiliza span corruption sobre el corpus M1xEN, compuesto por texto twi normalizado con replay de ingles, con un objetivo del 80% de caracteres twi y 20% de ingles retenidos durante el entrenamiento. El estudio compara los backbones small, base y large de mT5 bajo dos estrategias (reemplazo y extension) con un limite de 50.000 actualizaciones, y el checkpoint publicado puede preceder a la actualizacion final. No se especifica en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset mas alla de las fuentes declaradas, ni si se aplicaron tecnicas de RLHF o DPO (en un modelo encoder-decoder de este tipo no seria el procedimiento habitual). El protocolo supervisado principal del paper fija `dropout_rate=0.1` antes de construir el modelo de fine-tuning, aunque la configuracion serializada conserva el valor de entrenamiento de 0.0.

## Capacidades

- Generacion de texto encoder-decoder y reconstruccion de texto enmascarado (span corruption), capacidad nativa del preentrenamiento mT5.
- Modelado de lenguaje bidireccional condicionado para twi (variantes Asante y Akuapem) e ingles.
- Retencion del ingles como lengua de replay, lo que permite mantener competencia en ingles tras la adaptacion al twi.
- Base para ajuste fino supervisado en traduccion automatica ingles-twi y twi-ingles (requiere fine-tuning especifico; el checkpoint no traduce por si mismo).
- Soporte de tokenizacion con byte-fallback para texto twi fuera del vocabulario.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Investigacion en adaptacion de vocabulario: el checkpoint permite reproducir y comparar la estrategia de extension frente a la de reemplazo sobre el mismo backbone mT5-large, midiendo impacto en reconstruccion y retencion del ingles.
- Punto de partida para traduccion automatica ingles-twi: cargar el modelo, fijar `dropout_rate=0.1` y `tie_word_embeddings=False`, y ajustar fino sobre un corpus paralelo supervisado para obtener un sistema de MT funcional.
- Estudio de retencion del ingles: evaluar cuanto ingles conserva el modelo tras el CPT con replay al 20% de caracteres, comparandolo con el backbone mT5-large original.
- Analisis de tokenizacion para lenguas de bajos recursos: comparar la cobertura del vocabulario extendido (295.031 entradas) frente al original (64.100) sobre corpus twi reales.
- Generacion de datos sinteticos o aumentacion de corpus twi: usar el modelo como generador condicionado para crear pares adicionales en experimentos controlados de investigacion.
- Evaluacion de sesgos y calidad linguistica en modelos adaptados a akan: analizar las salidas del modelo sobre las variantes Asante y Akuapem para documentar limitaciones de cobertura dialectal.
- Reproducibilidad de experimentos: el repositorio incluye `sources.json` y `release_provenance.json` con hashes SHA-256 de los ficheros de inferencia, lo que facilita la replicacion de resultados en publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 5,3 GB solo para pesos, mas overhead de activaciones y cache; en la practica se recomienda al menos 8-10 GB de VRAM para secuencias cortas.
- En float16/bfloat16 (si se convierte manualmente, ya que el repositorio publica float32): alrededor de 2,7 GB de pesos, lo que reduce el requisito a 4-6 GB de VRAM.
- GPU recomendadas: A100, H100 o L40S para fine-tuning a escala; RTX 4090, RTX 3090 o RTX A6000 para ajuste fino con batch pequeno.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en float32 y en tarjetas con 6 GB o mas en precision reducida, siempre que se ajuste el tamano de batch y la longitud de secuencia.
- Opciones de despliegue: transformers (via `AutoModelForSeq2SeqLM` y `AutoTokenizer`), y herramientas compatibles con safetensors como vLLM o TGI si se convierten los pesos; llama.cpp y Ollama no soportan de forma nativa arquitecturas encoder-decoder mT5 en el momento de redaccion de esta ficha.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IARG-UF/akant5-large-extension | 1.321.593.856 | no disponible | ak, en | research-only | HuggingFace |
| google/mt5-large | 1.200.000.000 (aprox.) | no disponible | 101 idiomas (incluye ak) | Apache 2.0 | HuggingFace |
| IARG-UF/akant5-large-extension-init | no disponible | no disponible | ak, en | research-only | HuggingFace |
| IARG-UF/akant5-base-extension | no disponible | no disponible | ak, en | research-only | HuggingFace (coleccion AkanT5) |

El modelo se diferencia de google/mt5-large por el vocabulario extendido y el CPT sobre twi, a costa de una licencia restrictiva y de un rendimiento en tareas downstream que requiere fine-tuning. Frente a la inicializacion `akant5-large-extension-init`, anade el entrenamiento CPT. Frente a las variantes small y base de la misma coleccion, ofrece mayor capacidad a cambio de mas requisitos de VRAM. No se dispone de datos de benchmarks que permitan comparar rendimiento numerico entre estas alternativas.

## Limitaciones y advertencias

- Licencia estrictamente de investigacion (`akant5-research-use-only`): no se permite uso comercial sin autorizacion explicita; consultar LICENSE y NOTICE del repositorio.
- El modelo no traduce por si mismo: requiere fine-tuning supervisado especifico para tareas de traduccion automatica.
- Varias fuentes del corpus de CPT son sinteticas y la mayoria de las fuentes twi tienen licencias no comerciales (cc-by-nc-4.0), lo que condiciona el uso derivado.
- Las etiquetas de fuente no garantizan que cada documento haya sido escrito o revisado por hablantes nativos.
- La evaluacion del estudio cubre twi (Asante y Akuapem) e ingles; no se establece cobertura de todas las variedades del akan.
- Riesgo de alucinacion y de generacion de texto twi gramaticalmente plausible pero incorrecto, especialmente en dominios alejados del corpus de entrenamiento.
- El corpus M1xEN y las salidas de traduccion no se incluyen en la release, lo que limita la reproducibilidad completa de los resultados.
- La configuracion serializada conserva `dropout_rate=0.0`; para reproducir el protocolo supervisado del paper hay que fijar `dropout_rate=0.1` antes de construir el modelo, no despues.
- El checkpoint publicado puede preceder a la actualizacion final del estudio (40.000 de un maximo de 50.000), por lo que no representa necesariamente el mejor punto de convergencia.
- Longitud de contexto no documentada: conviene validar empiricamente el comportamiento en secuencias largas antes de desplegar.
- Solo 35 descargas y 0 likes en el momento de la consulta: comunidad muy reducida, lo que implica escasa validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IARG-UF/akant5-large-extension
- Inicializacion de vocabulario: https://huggingface.co/IARG-UF/akant5-large-extension-init
- Coleccion AkanT5: https://huggingface.co/collections/IARG-UF/akant5-cpt-checkpoints-and-vocabulary-initializations
- Modelo base original: https://huggingface.co/google/mt5-large
- Codigo y configuraciones de experimentos: https://github.com/Intelligent-Agents-Research-Group/akant5
- Dataset pristine-twi-english: https://huggingface.co/datasets/ghananlpcommunity/pristine-twi-english
- Dataset ghok-parallel-en-twi: https://huggingface.co/datasets/ghanaopenai/ghok-parallel-en-twi
- Dataset ghana-farmer-qa-twi: https://huggingface.co/datasets/ghanaopenai/ghana-farmer-qa-twi
- Dataset true-asr-ipa-pairs-twi: https://huggingface.co/datasets/ghananlpcommunity/true-asr-ipa-pairs-twi
- Dataset kumawood-speech-transcriptions: https://huggingface.co/datasets/ghanaopenai/kumawood-speech-transcriptions
- Dataset ghana-speech: https://huggingface.co/datasets/ghanaopenai/ghana-speech
- Dataset Wikipedia (tw): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset C4 (en-multi): https://huggingface.co/datasets/allenai/c4
