# juice500/wavlm-21-phonemodel

## Resumen

wavlm-21-phonemodel es un adaptador de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de WavLM-large, un modelo auto-supervisado de voz de Microsoft. Lo desarrolla juice500 (Shikhar Bharadwaj y colaboradores, según la citación del paper) y aplica una técnica denominada Phonological Activation Mapping (SPAM), que proyecta cada frame del encoder a un vector de 43 activaciones fonológicas interpretables (sonoridad, nasalidad, stridencia, entre otras). El modelo resuelve la tarea de convertir audio en una secuencia de segmentos con etiquetas fonéticas y tiempos de inicio y fin, sin necesidad de reentrenar el encoder.

Este checkpoint concreto corresponde a un único punto de la rejilla encoder × capa: WavLM-large en la capa 21, con entrada a 16 kHz. El autor indica explícitamente que no es el mejor modelo de la familia y remite a wavlm-24-phonemodel para el checkpoint óptimo. Es relevante porque demuestra que un encoder congelado, combinado con una cabeza ligera sobre características fonológicas, puede producir segmentación y reconocimiento de fonemas interpretables, y porque la librería phonespam permite restringir el vocabulario de salida al inventario fonológico de un idioma concreto vía PHOIBLE.

El modelo está entrenado y evaluado sobre TIMIT (timid-asr/timit_asr), por lo que su ámbito natural es el inglés, aunque la API permite seleccionar inventarios de otros idiomas. La licencia es MIT y el repo no contiene pesos de gran tamaño (0.0 GB), lo que sugiere que el adaptador es ligero y depende de la descarga del WavLM-large base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre encoder WavLM-large congelado (transformer auto-supervisado de voz) |
| Parámetros totales | no disponible (el adaptador es ligero; WavLM-large base tiene ~317 M, dato no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz por frames; ventana concreta no especificada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (entrenamiento); vocabulario configurable a otros inventarios PHOIBLE |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; se carga vía `phonespam` con `from_pretrained`) |

## Arquitectura y entrenamiento

El modelo no entrena el encoder: utiliza WavLM-large congelado y extrae las representaciones de la capa 21. Sobre esas activaciones, SPAM aprende un mapeo a 43 características fonológicas en el rango [0, 1] (nombres como "silence+", "syl+", "son+", etc.), que actúan como representación intermedia interpretable. A partir de esa representación, dos cabezas realizan la segmentación (fronteras entre fonemas) y el reconocimiento (etiqueta fonética de cada segmento). El resultado de `transcribe` son tuplas contiguas `Segment(start, end, label)` con tiempos en segundos.

El entrenamiento se realizó sobre el dataset TIMIT (timid-asr/timit_asr). La información disponible no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; al tratarse de una tarea de etiquetado fonético, lo esperable es entrenamiento supervisado sobre alineamientos fonéticos, pero este extremo no se confirma en la model card. La innovación destacable es precisamente SPAM: convertir una representación opaca del encoder en activaciones fonológicas legibles y reutilizables para segmentación y reconocimiento, y permitir restringir el vocabulario de salida a un inventario PHOIBLE por idioma.

## Capacidades

- Segmentación fonética: detecta fronteras entre fonemas en audio de voz con marcas temporales en segundos.
- Reconocimiento fonético: asigna una etiqueta fonética a cada segmento detectado.
- Representación fonológica interpretable: expone `model.spam(audio)` como matriz de (frames, 43) activaciones en [0, 1] con nombres de característica accesibles vía `spam.featnames`.
- Restricción de vocabulario por idioma: `vocab_for_language("deu")` y similares limitan la salida al inventario PHOIBLE del idioma indicado.
- Procesamiento a 16 kHz sobre features de WavLM-large capa 21.
- Ejecución en CPU o GPU (`device="cuda"`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; es un modelo específico de fonética.

## Casos de uso

- Anotación fonética automatizada de corpus de voz: el modelo genera segmentos con tiempos y etiquetas sobre grabaciones en inglés, lo que acelera la creación de alineamientos fonéticos para investigación lingüística y evita anotación manual frame a frame.
- Análisis de pronunciación y fonética clínica: las 43 activaciones fonológicas permiten inspeccionar rasgos como sonoridad o nasalidad en cada frame, útil para estudiar patrones de habla o apoyar evaluación de trastornos del habla.
- Investigación en fonología computacional: la representación SPAM hace posible correlacionar rasgos fonológicos con fenómenos lingüísticos sin depender de una caja negra, y comparar puntos de la rejilla encoder × capa.
- Preprocesado para sistemas de reconocimiento de voz: los segmentos fonéticos con tiempos pueden alimentar pipelines posteriores de ASR, alineamiento forzado o análisis de duración de fonemas.
- Docencia y demostraciones interactivas: el demo en Streamlit permite mostrar en vivo la segmentación y las activaciones fonológicas, adecuado para cursos de fonética o procesamiento del habla.
- Adaptación a otros inventarios fonológicos: usando `vocab_for_language`, se puede aplicar el modelo a la fonología de otros idiomas (por ejemplo, alemán) restringiendo el conjunto de etiquetas, útil en estudios comparativos multilingües.
- Control de calidad de datos de voz: la segmentación permite detectar silencios, pausas y anomalías en grabaciones antes de usarlas en entrenamiento de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Al tratarse de un adaptador ligero sobre WavLM-large congelado, el coste dominante es el encoder base; el repo del adaptador ocupa 0.0 GB.
- GPU recomendadas: no especificadas en la información. El uso admite `device="cuda"`, por lo que cualquier GPU con memoria suficiente para WavLM-large es candidata; no se confirman modelos concretos (A100, H100, RTX 4090).
- GPU de consumo: no confirmado; la viabilidad en GPUs consumer depende del tamaño de WavLM-large y de la cuantización, dato no disponible.
- Opciones de despliegue: librería `phonespam` (`pip install phonespam`), con API `PhoneModel.from_pretrained(...)` y `transcribe(...)`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juice500/wavlm-21-phonemodel | Adaptador SPAM sobre WavLM-large (capa 21) | no disponible (adaptador ligero) | no disponible | MIT | Hugging Face |
| juice500/wavlm-24-phonemodel | Adaptador SPAM sobre WavLM-large (capa 24, mejor checkpoint según el autor) | no disponible | no disponible | no disponible en la información | Hugging Face |
| microsoft/wavlm-large | Encoder auto-supervisado de voz | no disponible en la información | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor indica que este checkpoint (capa 21) no es el mejor de la familia; para el óptimo remite a wavlm-24-phonemodel.
- Entrenado sobre TIMIT y etiquetado para inglés; el uso con otros idiomas depende de restringir el vocabulario vía PHOIBLE y no está validado en la información disponible.
- Riesgo de errores en fronteras fonéticas y etiquetas en audio con ruido, acentos no vistos o habla espontánea, dado el dominio limitado de TIMIT.
- No se documentan sesgos concretos, pero al derivar de WavLM-large hereda las limitaciones del encoder base, no detalladas aquí.
- `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que está bajo CC BY-SA 3.0 y se licencia por separado del modelo MIT; conviene revisar las obligaciones de atribución y compartir-igual si se redistribuye.
- El repo no incluye pesos de gran tamaño; el despliegue requiere descargar WavLM-large por separado, lo que afecta a requisitos de almacenamiento y red.
- No hay información sobre cuantizaciones, latencia ni throughput, por lo que no se puede garantizar un rendimiento en producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-21-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Mejor checkpoint de la familia: https://huggingface.co/juice500/wavlm-24-phonemodel
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
