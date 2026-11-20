# juice500/w2v2-0-phonemodel

## Resumen

w2v2-0-phonemodel es un modelo adaptador para segmentación y reconocimiento de fonemas en inglés, desarrollado por el usuario juice500 (Shikhar Bharadwaj y colaboradores, según la citación del paper). Se construye sobre el encoder congelado facebook/wav2vec2-large-lv60 (wav2vec 2.0-large) y aplica una técnica denominada Phonological Activation Mapping (SPAM), que proyecta cada frame del encoder a un vector de 43 activaciones de rasgos fonológicos (sonoridad, nasalidad, estridencia, entre otros) para hacer interpretable la representación latente. El modelo corresponde a un único punto de la rejilla encoder x capa del paper, concretamente la capa 0 del encoder wav2vec 2.0-large a 16 kHz.

El modelo resuelve el problema de obtener fronteras y etiquetas de fonemas a partir de audio sin entrenar un modelo acústico específico desde cero: reutiliza características autosupervisadas y las mapea a un espacio fonológico interpretable, lo que permite segmentar y reconocer fonemas de forma transparente. Es relevante para investigación en fonética computacional, para la construcción de léxicos y alineamientos fonéticos, y como herramienta de análisis de sistemas de reconocimiento de habla.

La información disponible es escasa: el repositorio no contiene pesos (tamaño 0.0 GB), no se han publicado resultados de benchmarks en la información proporcionada y no consta pipeline de Hugging Face. El autor indica que este no es el mejor modelo de la familia y remite a juice500/wavlm-24-phonemodel para el mejor punto de la rejilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre encoder wav2vec 2.0-large (transformer convolucional + self-attention) congelado; cabeceras de segmentación y reconocimiento sobre activaciones fonológicas (SPAM) |
| Parametros totales | no disponible (el modelo base wav2vec 2.0-large tiene ~317 M, pero no se especifica el tamaño del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio no especificada; frecuencia de muestreo 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); el reconocimiento puede restringirse a inventarios PHOIBLE de otras lenguas mediante `vocab_for_language` |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0.0 GB; se carga vía `PhoneModel.from_pretrained` de la librería `phonespam`) |

## Arquitectura y entrenamiento

El modelo se apoya en wav2vec 2.0-large (facebook/wav2vec2-large-lv60), un encoder autosupervisado de tipo transformer que opera sobre audio de 16 kHz. Sobre sus representaciones congeladas se aplica SPAM (S3M-based Phonological Activation Mapping), que transforma cada frame en un vector de 43 activaciones de rasgos fonológicos en el rango [0, 1] (por ejemplo, "silence+", "syl+", "son+"). A partir de esa representación interpretable, dos cabeceras realizan la segmentación (fronteras temporales) y el reconocimiento (etiqueta de fonema) de forma conjunta. El modelo corresponde a la capa 0 del encoder dentro de la rejilla encoder x capa explorada en el paper.

El entrenamiento utiliza el dataset timit-asr/timit_asr (TIMIT), un corpus de habla inglesa con anotaciones fonéticas a nivel de fonema y palabra. No se especifica en la información disponible el número de tokens de audio, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente a este tipo de tarea). La innovación técnica destacable es la interpretabilidad: en lugar de una representación opaca, el modelo expone activaciones de rasgos fonológicos que permiten inspeccionar qué información usa cada cabecera. El paper se publicó en SLT 2026.

## Capacidades

- Segmentación de fonemas en audio: devuelve intervalos contiguos `Segment(start, end, label)` con tiempos en segundos.
- Reconocimiento de fonemas: etiqueta cada segmento con un símbolo fonético.
- Extracción de representación fonológica interpretable: `model.spam()` devuelve una matriz (frames, 43) con activaciones de rasgos en [0, 1] y nombres de rasgo accesibles mediante `spam.featnames`.
- Restricción del vocabulario de reconocimiento a inventarios PHOIBLE por lengua mediante `vocab_for_language` (por ejemplo, "deu" para alemán).
- Procesamiento de audio a 16 kHz.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá del procesamiento de habla descrito.
- Capacidad multilingüe limitada: el modelo está entrenado en inglés; el uso con otras lenguas depende del inventario PHOIBLE seleccionado en inferencia, no de un entrenamiento multilingüe.

## Casos de uso

- Investigación fonética y fonológica: obtener alineamientos y etiquetas de fonemas sobre corpus de habla inglesa para análisis de rasgos (sonoridad, nasalidad, estridencia) con una representación interpretable en lugar de una caja negra.
- Construcción de léxicos de pronunciación: generar transcripciones fonéticas a nivel de segmento a partir de grabaciones para alimentar diccionarios de pronunciación en sistemas TTS o ASR.
- Análisis de errores de sistemas ASR: comparar las fronteras y etiquetas de fonemas predichas con las de un ASR para localizar sustituciones, inserciones y omisiones a nivel fonético.
- Docencia y herramientas de pronunciación: el demo de Streamlit y la salida por segmentos permiten visualizar la alineación fonética de una utterance para fines educativos.
- Estudio de representaciones autosupervisadas: al ser un punto concreto de la rejilla encoder x capa, sirve para comparar qué capa del encoder codifica mejor la información fonológica en experimentos reproducibles.
- Preprocesamiento para tareas downstream: segmentar audio en unidades fonéticas antes de tareas de análisis prosódico o de rasgos, aprovechando la salida estructurada de `transcribe`.
- Adaptación a otras lenguas en investigación: usar `vocab_for_language` con inventarios PHOIBLE para explorar el comportamiento del modelo sobre fonemas de otras lenguas, con las cautelas propias de un modelo entrenado en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo base wav2vec 2.0-large ronda los 317 M de parámetros; en fp32 serían aproximadamente 1,3 GB solo de pesos del encoder, más el adaptador y las activaciones, pero no se confirma el tamaño total del artefacto.
- GPU recomendadas: no disponible. El código permite `device="cuda"` en `PhoneModel.from_pretrained`, pero no se especifican GPU concretas.
- Viabilidad en GPU de consumo: no disponible; por el tamaño típico de wav2vec 2.0-large es plausible en GPUs de consumo con suficiente VRAM, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: la vía documentada es la librería `phonespam` (`pip install phonespam`) con `PhoneModel.from_pretrained`; también existe un demo en Streamlit. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juice500/w2v2-0-phonemodel | no disponible (base wav2vec 2.0-large ~317 M) | no disponible | Adaptador SPAM sobre wav2vec 2.0-large, capa 0 | MIT | Hugging Face (repo de 0.0 GB) |
| juice500/wavlm-24-phonemodel | no disponible (base WavLM) | no disponible | Adaptador SPAM sobre WavLM; mejor punto de la rejilla según el autor | no disponible | Hugging Face |
| facebook/wav2vec2-large-lv60 | ~317 M | no disponible | Encoder autosupervisado (modelo base, sin cabeceras fonéticas) | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio tiene un tamaño de 0.0 GB y no se confirma la presencia de pesos; la carga mediante `PhoneModel.from_pretrained` puede fallar si los artefactos no están publicados.
- El modelo está entrenado sobre TIMIT, un corpus pequeño y de dominio restringido (habla leída, inglés); la generalización a otros dominios, acentos o habla espontánea no está documentada.
- El autor indica explícitamente que este no es el mejor modelo de la familia y remite a wavlm-24-phonemodel; usarlo como referencia de rendimiento puede ser engañoso.
- Riesgo de alucinación y errores de etiquetado: no hay métricas publicadas de precisión, por lo que no puede cuantificarse la fiabilidad de las fronteras ni de las etiquetas.
- Idiomas: entrenado solo en inglés; el uso con inventarios PHOIBLE de otras lenguas no implica que el modelo haya sido entrenado en ellas.
- Licencia MIT para el modelo y el código, pero `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que está bajo CC BY-SA 3.0 y se licencia por separado; conviene revisar las obligaciones de atribución y compartir-igual si se redistribuye.
- No se documentan sesgos específicos, pero al derivar de wav2vec 2.0-large y TIMIT puede heredar sesgos de acento, género y origen de los hablantes del corpus.
- No hay pipeline declarado en Hugging Face ni datos de latencia/throughput, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/w2v2-0-phonemodel
- Modelo recomendado por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-lv60
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
