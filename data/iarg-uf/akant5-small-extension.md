# IARG-UF/akant5-small-extension

## Resumen

AkanT5 small (extension) es un checkpoint de preentrenamiento continuado (CPT) derivado de google/mt5-small, desarrollado por el Intelligent-Agents-Research-Group de la Universidad de Florida (IARG-UF). El modelo adapta el backbone mT5 al akan (twi), en concreto a las variedades asante y akuapem, mediante una estrategia de extension de vocabulario que amplia el tokenizador original de 64.100 entradas a 295.031 entradas, con 295.040 filas de embedding y de salida. Cuenta con 346.183.040 parametros almacenados en safetensors float32.

El problema que aborda es la baja representacion del akan en los tokenizadores multilingues estandar, que fragmentan el texto twi en muchos subtokens y degradan la eficiencia y la calidad del modelado. La ficha forma parte de un estudio de adaptacion que compara backbones mT5 small, base y large bajo dos estrategias (reemplazo y extension de vocabulario), con un limite de 50.000 actualizaciones de CPT. El checkpoint seleccionado corresponde a la actualizacion 50.000.

Es relevante ahora porque publica de forma abierta los artefactos intermedios de un pipeline de adaptacion linguistica para una lengua de bajos recursos, con procedencia de datos fijada por revision y hashes SHA-256 de los ficheros de inferencia. No obstante, es un modelo de investigacion: no esta afinado para traduccion automatica y su licencia restringe el uso a investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mT5 encoder-decoder (transformer) |
| Parametros totales | 346.183.040 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32 safetensors) |
| Idiomas soportados | ak (twi: asante y akuapem), en |
| Licencia | akant5-research-use-only (uso exclusivo de investigacion; upstream mT5 Apache 2.0) |
| Formato de pesos | safetensors (float32) |
| Estrategia de vocabulario | extension |
| Entradas del tokenizador | 295.031 (295.040 filas de embedding/salida) |
| Checkpoint CPT seleccionado | actualizacion 50.000 |
| Dropout en CPT | 0,0 |
| Version de Transformers | 5.16.1 |
| Tamano del repo | 1,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo mT5, la variante multilingue de T5 entrenada originalmente con objetivos de span corruption. Sobre ese backbone se aplico preentrenamiento continuado con el mismo objetivo de span corruption sobre el corpus M1xEN, compuesto por texto twi normalizado con replay de ingles, con un objetivo del 80 % de caracteres de entrenamiento en twi y el 20 % en ingles. La innovacion principal es la extension del vocabulario: en lugar de reemplazar el tokenizador, se amplia de 64.100 a 295.031 entradas, lo que preserva el comportamiento de byte-fallback y reduce la fragmentacion del texto akan.

Los datos de CPT proceden de fuentes con revision fijada, entre ellas pristine-twi-english, ghok-parallel-en-twi, ghana-farmer-qa-twi, true-asr-ipa-pairs-twi, kumawood-speech-transcriptions, ghana-speech (Akuapem_Twi y Asante_Twi), wikipedia (20231101.tw) y allenai/c4 (en-multi). Varias fuentes son sinteticas y la mayoria de las fuentes twi tienen licencia no comercial (cc-by-nc-4.0). No se documenta en la informacion disponible el uso de RLHF o DPO; el entrenamiento es de preentrenamiento continuado, no de alineamiento. El modelo conserva `dropout_rate=0.0` tal como se entreno, aunque el protocolo supervisado de traduccion del articulo asociado fija `dropout_rate=0.1` antes de construir el modelo de fine-tuning.

## Capacidades

- Generacion de texto y modelado de lenguaje sobre texto twi (asante y akuapem) e ingles, como base preentrenada.
- Capacidad de reconstruccion de texto (denoising) heredada del objetivo de span corruption de mT5.
- Retencion de ingles mediante replay en el corpus de CPT.
- Punto de partida para fine-tuning supervisado de traduccion ingles-twi y twi-ingles; el modelo por si solo no traduce sin ese ajuste.
- Tokenizacion con byte-fallback y vocabulario extendido para akan.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no.
- Modo thinking: no.

## Casos de uso

- Investigacion en adaptacion de vocabulario: permite reproducir el estudio comparativo entre reemplazo y extension de vocabulario sobre backbones mT5 small, base y large, usando los checkpoints y configuraciones publicados.
- Fine-tuning para traduccion automatica ingles-twi: el checkpoint sirve como inicializacion antes del ajuste supervisado; con `dropout_rate=0.1` y `tie_word_embeddings=False` se reproduce el protocolo del articulo.
- Evaluacion de retencion de ingles: al incluir un 20 % de replay en ingles, permite medir la degradacion o preservacion de capacidades en ingles tras el CPT sobre una lengua de bajos recursos.
- Modelado de lenguaje para textos akan: util para tareas de reconstruccion, denoising y puntuacion de fluidez en corpus twi normalizados.
- Base para tareas downstream en akan: clasificacion de texto, generacion condicionada o resumen, tras el fine-tuning correspondiente sobre datos etiquetados.
- Estudio de procedencia y licencias de datos: el repositorio incluye `sources.json` y `release_provenance.json`, utiles para investigar trazabilidad de corpus multilingues con mezcla de fuentes sinteticas y no comerciales.
- Experimentos de eficiencia de tokenizacion: comparar el numero de subtokens por palabra entre el tokenizador mT5 original y el extendido en texto twi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1,4 GB solo para pesos, mas activaciones y cache; en la practica, entre 2 y 4 GB segun longitud de secuencia y tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en float32; A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas; tambien en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (version 5.16.1 segun el autor), con `AutoModelForSeq2SeqLM` y `AutoTokenizer`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocabulario | Licencia | Enfoque |
|---|---|---|---|---|---|
| IARG-UF/akant5-small-extension | 346.183.040 | no disponible | 295.031 (extension) | research-only | CPT sobre mT5-small para twi |
| google/mt5-small | no disponible en la informacion | no disponible | 64.100 | Apache 2.0 | Modelo base multilingue original |
| IARG-UF/akant5-small-extension-init | no disponible en la informacion | no disponible | 295.031 | research-only | Inicializacion de vocabulario previa al CPT |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: la licencia akant5-research-use-only restringe el uso comercial; ademas, la mayoria de las fuentes twi tienen licencia cc-by-nc-4.0.
- No esta afinado para traduccion: los pesos preceden al fine-tuning de traduccion automatica; se requiere ajuste especifico para esa tarea.
- Cobertura linguistica limitada: la evaluacion cubre twi asante y akuapem e ingles; no se establece cobertura de todas las variedades del akan.
- Datos parcialmente sinteticos: varias fuentes son sinteticas y las etiquetas de origen no garantizan autoria humana ni revision por hablantes nativos.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; al ser un modelo base pequeno, cabe esperar generacion poco fiable fuera de dominio.
- Configuracion de dropout: el checkpoint guarda `dropout_rate=0.0`; para reproducir el protocolo supervisado hay que fijar `dropout_rate=0.1` antes de construir el modelo, no despues.
- Embeddings: mT5 comparte embeddings de entrada de encoder y decoder, pero la cabeza de salida es independiente; hay que fijar `tie_word_embeddings=False` tras la carga.
- Tokenizador: debe cargarse el tokenizador guardado en el repositorio para preservar los IDs de vocabulario y el byte-fallback; usar otro tokenizador rompe la correspondencia.
- Longitud de contexto: no documentada en la informacion disponible.
- Corpus y salidas de traduccion excluidos de la release: no se publican los datos M1xEN ni las salidas de MT, lo que limita la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IARG-UF/akant5-small-extension
- Inicializacion de vocabulario: https://huggingface.co/IARG-UF/akant5-small-extension-init
- Coleccion AkanT5: https://huggingface.co/collections/IARG-UF/akant5-cpt-checkpoints-and-vocabulary-initializations
- Modelo base mT5-small: https://huggingface.co/google/mt5-small
- Codigo y configuraciones: https://github.com/Intelligent-Agents-Research-Group/akant5
- Dataset pristine-twi-english: https://huggingface.co/datasets/ghananlpcommunity/pristine-twi-english
- Dataset ghok-parallel-en-twi: https://huggingface.co/datasets/ghanaopenai/ghok-parallel-en-twi
- Dataset ghana-farmer-qa-twi: https://huggingface.co/datasets/ghanaopenai/ghana-farmer-qa-twi
- Dataset true-asr-ipa-pairs-twi: https://huggingface.co/datasets/ghananlpcommunity/true-asr-ipa-pairs-twi
- Dataset kumawood-speech-transcriptions: https://huggingface.co/datasets/ghanaopenai/kumawood-speech-transcriptions
- Dataset ghana-speech: https://huggingface.co/datasets/ghanaopenai/ghana-speech
- Dataset wikipedia (20231101.tw): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset allenai/c4: https://huggingface.co/datasets/allenai/c4
