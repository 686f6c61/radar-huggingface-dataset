# IARG-UF/akant5-base-replacement

## Resumen

AkanT5 base (replacement) es un checkpoint de preentrenamiento continuado (CPT) derivado de google/mt5-base, desarrollado por el Intelligent-Agents-Research-Group de la Universidad de Florida (IARG-UF). El modelo adapta el backbone mT5-base al akan (twi) mediante una estrategia de sustitución de vocabulario: en lugar de extender el tokenizador original, se reemplaza por uno nuevo de 64.100 entradas orientado a twi, con replay de inglés para preservar capacidades en esa lengua. El resultado es un encoder-decoder de 296.729.856 parámetros con embeddings de 64.128 filas.

El objetivo del proyecto es estudiar la adaptación de vocabulario en modelos multilingües de tamano medio para lenguas de bajos recursos, comparando las estrategias de sustitución y extensión sobre backbones mT5 small, base y large. Este checkpoint concreto corresponde a la actualización CPT 49.000 (de un límite de 50.000) y es un artefacto intermedio: no está fine-tuneado para traducción, por lo que requiere adaptación supervisada posterior para tareas downstream.

Su relevancia es doble. Por un lado, aporta un punto de partida reproducible para investigación en lenguas akan, una familia con cobertura muy limitada en modelos abiertos. Por otro, su licencia estrictamente de investigación (akant5-research-use-only) y la naturaleza no comercial de la mayoría de sus fuentes de datos lo convierten en un objeto de estudio más que en un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | mT5 encoder-decoder (transformer) |
| Parámetros totales | 296.729.856 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en float32) |
| Idiomas soportados | ak (twi: asante y akuapem), en |
| Licencia | akant5-research-use-only (research use only) |
| Formato de pesos | safetensors (float32) |
| Estrategia de vocabulario | sustitución (replacement), tokenizador de 64.100 entradas |
| Actualización CPT seleccionada | 49.000 |
| Dropout en CPT | 0,0 |
| Librería | transformers (preparado con 5.16.1) |
| Modelo base | IARG-UF/akant5-base-replacement-init (derivado de google/mt5-base) |
| Tamano del repo | 1,2 GB |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura mT5 estándar: transformer encoder-decoder con atención completa, embeddings de entrada compartidos entre encoder y decoder y una cabeza de salida separada. La innovación principal no está en el backbone sino en el vocabulario: se sustituye el tokenizador original de mT5 (250.000 entradas) por uno de 64.100 entradas, con 64.128 filas de embedding y salida, optimizado para la morfología del twi. El tokenizador incluye comportamiento de byte-fallback y debe cargarse desde el propio repositorio para preservar los IDs y el comportamiento correctos.

El CPT se realizó con span corruption sobre el corpus M1xEN, compuesto por texto twi normalizado con replay de inglés, con un objetivo del 80% twi y 20% inglés medido en caracteres retenidos. El entrenamiento se limitó a 50.000 actualizaciones y este checkpoint corresponde a la actualización 49.000, por lo que puede preceder a la actualización final. Las fuentes incluyen datasets paralelos y de ASR de GhanaNLP y GhanaOpenAI, Wikipedia en twi y C4 en inglés; varias fuentes son sintéticas y la mayoría de las de twi llevan licencias no comerciales. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto encoder-decoder mediante span corruption, orientada a reconstrucción y modelado de lengua, no a instrucciones.
- Comprensión y generación en twi (variantes asante y akuapem) e inglés, con retención de inglés gracias al replay durante el CPT.
- Base para traducción automática inglés-twi y twi-inglés tras fine-tuning supervisado (el checkpoint por sí solo no traduce).
- Base para tareas de adaptación posteriores: clasificación, generación condicionada y ASR textual una vez fine-tuneado.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Investigación en adaptación de vocabulario: sirve como punto de partida reproducible para comparar sustitución frente a extensión de tokenizador en mT5 small, base y large, usando las configuraciones y el código del repositorio del proyecto.
- Fine-tuning para traducción inglés-twi: partiendo de este checkpoint y aplicando el protocolo supervisado del paper (con dropout_rate=0.1), se obtiene un sistema de traducción para una lengua con escasa cobertura en modelos abiertos.
- Traducción twi-inglés en dominios específicos: tras fine-tuning con datasets paralelos de GhanaNLP o GhanaOpenAI, útil para digitalización de contenido en akan.
- Punto de partida para ASR textual y normalización: el modelo puede adaptarse a la transcripción y normalización de texto twi proveniente de pipelines de reconocimiento de voz.
- Investigación en retención de inglés: el diseño con replay del 20% permite estudiar la degradación y preservación de capacidades en inglés tras el CPT en una lengua de bajos recursos.
- Experimentos de reconstrucción y evaluación lingüística: útil para medir la calidad de representaciones en twi mediante tareas de reconstrucción y análisis de tokenización.
- Base para modelos de clasificación de texto en akan: con fine-tuning ligero sobre la cabeza del encoder, aplicable a moderación o etiquetado de contenido en twi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1,2 GB solo para pesos, más activaciones; en la práctica, entre 2 y 3 GB para secuencias cortas.
- VRAM estimada en float16: alrededor de 0,6 GB para pesos; cuantizaciones de 8 y 4 bits no están documentadas para este checkpoint.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es pequeno y no aprovecha aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante con 4 GB o más).
- Opciones de despliegue: transformers con AutoModelForSeq2SeqLM y AutoTokenizer; vLLM, llama.cpp, Ollama y TGI no están documentados para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IARG-UF/akant5-base-replacement | 296,7 M | no disponible | ak, en | research use only | Hugging Face |
| google/mt5-base | 580 M | 512 tokens (estándar mT5) | 101 idiomas | Apache 2.0 | Hugging Face |
| IARG-UF/akant5-base-replacement-init | no disponible | no disponible | ak, en | research use only | Hugging Face |
| IARG-UF/akant5-base-extension | no disponible | no disponible | ak, en | research use only | Hugging Face (colección AkanT5) |

La comparación directa con mT5-base es la más relevante: AkanT5 base replacement reduce el vocabulario de 250.000 a 64.100 entradas, lo que explica su menor número de parámetros (296,7 M frente a 580 M) y su especialización en twi a costa de cobertura multilingüe. Frente a las alternativas de la propia colección AkanT5, la variante de extensión mantiene el vocabulario original ampliado (295.031 entradas) y por tanto un mayor número de parámetros. No se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- Licencia estrictamente de investigación: el uso comercial está prohibido por la licencia akant5-research-use-only.
- Las fuentes de datos de twi tienen en su mayoría licencias no comerciales (cc-by-nc-4.0), lo que condiciona cualquier uso derivado.
- Varias fuentes son sintéticas y no se garantiza que todos los documentos hayan sido revisados por hablantes nativos.
- El modelo no está fine-tuneado para traducción ni para instrucciones; requiere adaptación supervisada para cualquier tarea downstream.
- La cobertura se limita a twi (asante y akuapem) e inglés; no se establece cobertura de todas las variedades del akan.
- Riesgo de alucinación y de generar texto plausible pero incorrecto, especialmente fuera de los dominios representados en el corpus.
- El checkpoint corresponde a la actualización 49.000, no a la final; puede existir un checkpoint posterior con mejor rendimiento.
- La longitud de contexto no está documentada en la información disponible.
- El tokenizador debe cargarse desde el repositorio del modelo para preservar IDs y byte-fallback; usar otro tokenizador rompe la correspondencia con los embeddings.
- La configuración serializada conserva dropout_rate=0.0; para reproducir el protocolo supervisado del paper hay que fijarlo a 0.1 antes de construir el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IARG-UF/akant5-base-replacement
- Inicialización de vocabulario: https://huggingface.co/IARG-UF/akant5-base-replacement-init
- Colección AkanT5: https://huggingface.co/collections/IARG-UF/akant5-cpt-checkpoints-and-vocabulary-initializations
- Modelo base original: https://huggingface.co/google/mt5-base
- Código y configuraciones: https://github.com/Intelligent-Agents-Research-Group/akant5
- Dataset pristine-twi-english: https://huggingface.co/datasets/ghananlpcommunity/pristine-twi-english
- Dataset ghok-parallel-en-twi: https://huggingface.co/datasets/ghanaopenai/ghok-parallel-en-twi
- Dataset ghana-farmer-qa-twi: https://huggingface.co/datasets/ghanaopenai/ghana-farmer-qa-twi
- Dataset true-asr-ipa-pairs-twi: https://huggingface.co/datasets/ghananlpcommunity/true-asr-ipa-pairs-twi
- Dataset kumawood-speech-transcriptions: https://huggingface.co/datasets/ghanaopenai/kumawood-speech-transcriptions
- Dataset ghana-speech: https://huggingface.co/datasets/ghanaopenai/ghana-speech
- Wikipedia en twi: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset C4: https://huggingface.co/datasets/allenai/c4
