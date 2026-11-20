# juice500/w2v2-9-phonemodel

## Resumen

`w2v2-9-phonemodel` es un adaptador de segmentación y reconocimiento fonético construido sobre las activaciones internas de un modelo auto-supervisado de voz congelado. Lo publica el usuario `juice500` como parte del proyecto SPAM (S3M-based Phonological Activation Mapping), asociado al artículo "Phone Segmentation and Recognition through Phonological Activation Mapping" presentado en SLT 2026. El modelo no es un LLM ni un sistema de reconocimiento de habla convencional: es una sonda que traduce las representaciones opacas de un encoder de voz en vectores interpretables de rasgos fonológicos (sonoridad, nasalidad, estridencia, silabicidad, etc.).

Concretamente, este checkpoint corresponde a un único punto de la rejilla encoder × capa: usa `facebook/wav2vec2-large-lv60` (wav2vec 2.0-large) y extrae representaciones de la capa 9, a 16 kHz. Sobre esas activaciones, dos cabezas ligeras realizan segmentación (dónde empieza y acaba cada fono) y reconocimiento (qué fono es), devolviendo segmentos contiguos con etiquetas fonéticas.

Su relevancia es metodológica más que de producto: demuestra que un encoder S3M congelado contiene información fonológica linealmente accesible y que esa información puede explotarse para tareas de fonética computacional sin reentrenar el backbone. El autor indica explícitamente que este no es el mejor modelo de la familia; para el mejor resultado remite a `juice500/wavlm-24-phonemodel`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre wav2vec 2.0-large congelado (encoder transformer convolucional + transformer), capa 9; cabezas de segmentación y reconocimiento sobre activaciones fonológicas (SPAM) |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB y el backbone se referencia, no se incluye) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz; ventana efectiva determinada por el encoder wav2vec 2.0) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); el reconocimiento puede restringirse a inventarios PHOIBLE de otras lenguas mediante `vocab_for_language`, pero el modelo está entrenado con datos en inglés |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 descargado en tiempo de ejecución es CC BY-SA 3.0) |
| Formato de pesos | no disponible (se carga vía `phonespam`, no se detalla safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo se apoya en `facebook/wav2vec2-large-lv60`, un encoder auto-supervisado preentrenado sobre audio de 16 kHz. El backbone permanece congelado: no se ajusta. En su lugar, se toma la salida de la capa 9 y se proyecta a un vector de 43 activaciones fonológicas en el rango [0, 1], cada una correspondiente a un rasgo del inventario SPAM (`silence+`, `syl+`, `son+`, etc.). Esa representación intermedia alimenta dos cabezas: una de segmentación temporal y otra de clasificación de fonos.

El entrenamiento se realizó sobre el dataset `timit-asr/timit_asr`, un corpus clásico de habla inglesa con anotaciones fonéticas a nivel de fono. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales más allá del entrenamiento de las cabezas. La innovación principal es el propio esquema SPAM: en lugar de clasificar fonos directamente desde features del encoder, se fuerza una representación intermedia interpretable en términos fonológicos, lo que permite inspeccionar qué rasgos activa cada frame y restringir la decodificación a inventarios fonológicos de lenguas concretas vía PHOIBLE.

## Capacidades

- Segmentación fonética: devuelve intervalos contiguos `(start, end, label)` con tiempos en segundos a partir de un fichero de audio.
- Reconocimiento de fonos: etiqueta cada segmento con un símbolo fonético.
- Representación fonológica interpretable: `model.spam("utt.wav")` devuelve una matriz `(frames, 43)` de activaciones de rasgos en [0, 1] con nombres accesibles vía `spam.featnames`.
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita la decodificación al inventario PHOIBLE de esa lengua.
- Procesamiento a 16 kHz, entrada de audio en formato WAV.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni razonamiento multi-paso: es un modelo discriminativo de fonética, no un modelo generativo.

## Casos de uso

- Investigación fonética y fonológica: extraer alineamientos a nivel de fono de corpus de habla inglesa para análisis de duración, coarticulación o inventarios, aprovechando que el modelo devuelve segmentos con tiempos y etiquetas directamente.
- Análisis de rasgos: usar `model.spam()` para estudiar qué rasgos fonológicos activa cada frame y comparar entre capas o encoders, ya que el proyecto publica checkpoints por capa.
- Construcción de lexicones y diccionarios de pronunciación: generar transcripciones fonéticas a partir de audio para alimentar sistemas de síntesis o de reconocimiento posteriores.
- Docencia y divulgación: el demo de Streamlit permite visualizar segmentaciones y activaciones sin infraestructura, útil para explicar fonética con datos reales.
- Evaluación de encoders S3M: este checkpoint, junto con los demás de la rejilla encoder × capa, sirve para medir cuánta información fonológica contiene cada capa de cada backbone.
- Preprocesado para pipelines de habla: obtener segmentos fonéticos como features auxiliares en tareas de pronunciación o de análisis de habla con acento.
- Adaptación a otras lenguas: restringiendo el vocabulario con PHOIBLE se pueden obtener transcripciones en inventarios de otras lenguas, aunque el modelo esté entrenado en inglés y la calidad fuera de ese dominio no está garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El backbone wav2vec 2.0-large tiene aproximadamente 300 M de parámetros; las cabezas adicionales son ligeras, por lo que la inferencia completa es asequible en GPU de consumo.
- VRAM estimada: no disponible de forma explícita; por el tamaño del backbone, cabe holgadamente en GPUs consumer con 8 GB o más en fp32/fp16.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; el autor indica `device="cuda"` como opción. No se especifican modelos concretos (A100, H100, RTX 4090).
- Despliegue: paquete `phonespam` (`pip install phonespam`) con API `PhoneModel.from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | Capa | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `juice500/w2v2-9-phonemodel` | wav2vec 2.0-large | 9 | Segmentación y reconocimiento fonético | MIT | Hugging Face |
| `juice500/wavlm-24-phonemodel` | WavLM (según nombre, capa 24) | 24 | Segmentación y reconocimiento fonético | no disponible en la información | Hugging Face (recomendado por el autor como mejor modelo) |
| `facebook/wav2vec2-large-lv60` | wav2vec 2.0-large | — | Encoder auto-supervisado (no realiza fonética por sí solo) | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con datos en inglés (`timit-asr/timit_asr`); el uso con otras lenguas mediante `vocab_for_language` no está validado y puede degradar la precisión.
- Es un checkpoint intermedio de una rejilla experimental: el propio autor señala que no es el mejor modelo de la familia.
- No es un modelo generativo ni un ASR de palabras: produce fonos, no transcripciones ortográficas.
- El repositorio ocupa 0.0 GB y el backbone se referencia por ID; requiere descargar `facebook/wav2vec2-large-lv60` por separado.
- `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, con licencia CC BY-SA 3.0 distinta de la MIT del modelo; conviene revisar obligaciones de atribución si se redistribuye.
- Sin datos publicados de benchmarks, sesgos o tasas de error: no hay evidencia cuantitativa para estimar fiabilidad en producción.
- Riesgo de errores en fronteras de segmentación y en fonos con rasgos acústicamente próximos; no se documenta ninguna evaluación al respecto en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/w2v2-9-phonemodel
- Modelo recomendado por el autor: https://huggingface.co/juice500/wavlm-24-phonemodel
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-lv60
- Paper (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
