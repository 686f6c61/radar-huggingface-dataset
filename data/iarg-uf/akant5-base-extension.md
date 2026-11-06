# IARG-UF/akant5-base-extension

## Resumen

AkanT5 base (extension) es un checkpoint de preentrenamiento continuado (CPT) desarrollado por el Intelligent Agents Research Group de la Universidad de Florida (IARG-UF) sobre `google/mt5-base`. El objetivo es adaptar un modelo multilingüe genérico al akan (concretamente twi, en sus variantes asante y akuapem) mediante una estrategia de extensión de vocabulario, pasando de 64.100 a 295.031 entradas en el tokenizador. El modelo forma parte de una colección de 12 artefactos que comparan distintas estrategias de adaptación (reemplazo frente a extensión) sobre tres tamaños de backbone mT5.

La arquitectura es un transformer encoder-decoder mT5 estándar con 651.410.688 parámetros, entrenado con span corruption sobre un corpus mixto (M1xEN) compuesto aproximadamente por un 80% de texto twi normalizado y un 20% de inglés de replay. El checkpoint seleccionado corresponde a 50.000 actualizaciones de CPT, con dropout 0.0 durante el preentrenamiento.

Es relevante porque aborda un problema concreto y poco cubierto: la baja representación del akan en modelos multilingües de gran escala y el coste computacional de adaptar vocabularios para lenguas de bajos recursos. No obstante, se trata de un artefacto estrictamente de investigación: no está afinado para traducción ni para tareas downstream, y su licencia prohíbe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mT5 encoder-decoder (transformer) |
| Parametros totales | 651.410.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32 safetensors) |
| Idiomas soportados | ak (twi: asante y akuapem), en |
| Licencia | akant5-research-use-only (uso exclusivo de investigación; upstream Apache 2.0 de mT5) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo parte de `google/mt5-base`, un transformer encoder-decoder con atención completa y vocabulario SentencePiece original de 64.100 entradas. La variante "extension" sustituye el tokenizador por uno de 295.031 entradas, con 295.040 filas en las matrices de embedding y de salida. Dado que mT5 comparte embeddings de entrada entre encoder y decoder pero mantiene una cabeza de salida separada, la carga correcta requiere fijar `tie_word_embeddings = False` tras la instanciación. El repositorio incluye su propio tokenizador y configuración sin modificar.

El CPT se realizó con span corruption sobre el corpus M1xEN, con un objetivo del 80% de caracteres de entrenamiento retenidos en twi y un 20% en inglés (replay). El estudio compara backbones mT5 small, base y large bajo dos estrategias de vocabulario (reemplazo y extensión), con un límite de 50.000 actualizaciones; el checkpoint publicado puede ser anterior a la actualización final. La configuración serializada conserva `dropout_rate=0.0` tal como se entrenó, aunque el protocolo supervisado de traducción del paper fija `dropout_rate=0.1` antes de construir el modelo de fine-tuning. Las fuentes del corpus incluyen datasets de GhanaNLP y GhanaOpenAI (mayoritariamente con licencia CC BY-NC 4.0), Wikipedia twi (CC BY-SA 3.0) y C4 en inglés (ODC-BY); varias fuentes son sintéticas y no consta revisión por hablantes nativos.

## Capacidades

- Modelo base de tipo encoder-decoder: no está afinado para ninguna tarea concreta; requiere fine-tuning supervisado para traducción u otras aplicaciones.
- Generación condicionada de texto (seq2seq) mediante `text2text-generation`.
- Reconstrucción de texto enmascarado (span corruption), útil para evaluar retención lingüística y calidad de la adaptación de vocabulario.
- Cobertura léxica de twi (asante y akuapem) e inglés gracias al vocabulario extendido.
- Capacidad de servir como inicialización para fine-tuning de traducción automática inglés-twi y twi-inglés.
- No dispone de tool calling, function calling, modo de razonamiento explícito, visión ni audio.
- No se documenta soporte de agentes ni razonamiento multi-paso.

## Casos de uso

- Investigación en adaptación de vocabulario: punto de partida para estudiar cómo afecta la extensión del tokenizador (de 64.100 a 295.031 entradas) a la fertilidad y a la retención de inglés en lenguas de bajos recursos.
- Fine-tuning de traducción automática inglés-twi: el checkpoint está diseñado explícitamente como predecesor del fine-tuning supervisado de MT; se cargaría con `dropout_rate=0.1` y se entrenaría sobre corpus paralelos como `ghanaopenai/ghok-parallel-en-twi`.
- Evaluación de retención de inglés (replay): útil para medir el olvido catastrófico al adaptar un modelo multilingüe a una lengua minoritaria con solo un 20% de datos de replay.
- Reconstrucción de texto twi enmascarado: permite cuantificar la calidad del modelado del lenguaje en asante y akuapem antes de abordar tareas supervisadas.
- Baseline académico en estudios comparativos de estrategias de vocabulario: sirve como referencia frente a la variante de reemplazo y a los backbones small y large de la misma colección.
- Inicialización para tareas downstream de procesamiento del akan distintas de la traducción (por ejemplo, clasificación de texto o respuesta a preguntas), siempre dentro del ámbito de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 2,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para secuencias cortas.
- VRAM estimada en float16/bfloat16: alrededor de 1,3 GB de pesos; entre 2 y 4 GB con overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB para fp32 en lotes pequeños; A100, H100 o L40S para fine-tuning con lotes mayores y secuencias largas.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, incluso en float32 con lotes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (soporte nativo, artefactos preparados con Transformers 5.16.1); conversión a GGUF para llama.cpp no está documentada en la información disponible; vLLM y TGI no se mencionan como soportados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| IARG-UF/akant5-base-extension | 651 M | no disponible | ak, en | research-only | checkpoint CPT, requiere fine-tuning |
| google/mt5-base | ~580 M | no disponible | 101 idiomas | Apache 2.0 | modelo base multilingüe |
| IARG-UF/akant5-base-extension-init | no disponible | no disponible | ak, en | research-only | inicialización de vocabulario, sin CPT |
| Variante de reemplazo de la colección AkanT5 | no disponible | no disponible | ak, en | research-only | estrategia alternativa de vocabulario |

La comparación con `google/mt5-base` es la más directa: mismo backbone, pero con vocabulario extendido y CPT específico para twi. Frente a la inicialización `-init`, este checkpoint añade 50.000 actualizaciones de preentrenamiento continuado. No se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- Licencia `akant5-research-use-only`: prohibido el uso comercial; además, las fuentes de datos subyacentes son mayoritariamente CC BY-NC 4.0, lo que refuerza la restricción.
- No es un modelo de traducción listo para producción: requiere fine-tuning supervisado específico de la tarea.
- La cobertura se limita a twi (asante y akuapem) e inglés; no se garantiza cobertura de todas las variedades del akan.
- Varias fuentes del corpus son sintéticas y no consta que hayan sido revisadas por hablantes nativos, lo que puede introducir sesgos y artefactos lingüísticos.
- Riesgo de alucinación y de generación incoherente en usos zero-shot, propio de un modelo base sin alineación (no se documenta RLHF ni DPO).
- El corpus M1xEN y las salidas de traducción no se distribuyen con el modelo, lo que dificulta la reproducibilidad completa del entrenamiento.
- Las puntuaciones de reconstrucción del estudio no establecen calidad de traducción; no deben interpretarse como métricas de rendimiento downstream.
- El checkpoint puede ser anterior a la actualización final de las 50.000, por lo que no representa necesariamente el punto de convergencia del CPT.
- La carga incorrecta del tokenizador o de `tie_word_embeddings` puede romper la correspondencia de IDs de vocabulario y degradar las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IARG-UF/akant5-base-extension
- Inicialización de vocabulario: https://huggingface.co/IARG-UF/akant5-base-extension-init
- Colección AkanT5: https://huggingface.co/collections/IARG-UF/akant5-cpt-checkpoints-and-vocabulary-initializations
- Modelo base original: https://huggingface.co/google/mt5-base
- Repositorio de código y configuraciones: https://github.com/Intelligent-Agents-Research-Group/akant5
- Dataset pristine-twi-english: https://huggingface.co/datasets/ghananlpcommunity/pristine-twi-english
- Dataset ghok-parallel-en-twi: https://huggingface.co/datasets/ghanaopenai/ghok-parallel-en-twi
- Dataset ghana-farmer-qa-twi: https://huggingface.co/datasets/ghanaopenai/ghana-farmer-qa-twi
- Dataset true-asr-ipa-pairs-twi: https://huggingface.co/datasets/ghananlpcommunity/true-asr-ipa-pairs-twi
- Dataset kumawood-speech-transcriptions: https://huggingface.co/datasets/ghanaopenai/kumawood-speech-transcriptions
- Dataset ghana-speech: https://huggingface.co/datasets/ghanaopenai/ghana-speech
- Wikipedia twi: https://huggingface.co/datasets/wikimedia/wikipedia
- C4: https://huggingface.co/datasets/allenai/c4
