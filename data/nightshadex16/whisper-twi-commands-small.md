# NightshadeX16/whisper-twi-commands-small

## Resumen

`whisper-twi-commands-small` es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla `openai/whisper-small` publicado por el usuario NightshadeX16 en HuggingFace. El modelo parte de la arquitectura encoder-decoder de Whisper y se ha reentrenado sobre el corpus `ghanaopenai/asante-twi-bible-speech-text` para transcribir audio en twi (akano) a texto en twi, con un ambito declarado limitado a los dialectos asante y akuapem. Cuenta con 241.734.912 parametros, licencia MIT y pesos en formato safetensors.

Su relevancia es la de un experimento de adaptacion de un modelo ASR multilingue de proposito general a una lengua de bajos recursos como el twi, donde los modelos comerciales suelen tener un rendimiento pobre. El autor declara una perdida de validacion de 0.3140 y advierte explicitamente de que el modelo tiene dificultades con palabras fuera del vocabulario biblico, lo que lo situa como una prueba de concepto mas que como un sistema listo para produccion.

No obstante, la ficha debe leerse con cautela: no hay resultados de benchmarks (WER/CER) publicados, el modelo tiene 2 descargas y 0 likes en el momento de la consulta, y la model card no documenta el volumen de datos, la composicion del dataset ni el procedimiento de entrenamiento mas alla de la tabla de perdidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (heredada de `openai/whisper-small`); la model card no detalla capas ni dimensiones |
| Parametros totales | 241.734.912 (241,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Audio: ventana de 30 segundos por inferencia (formato Whisper); texto: no disponible en la model card |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye safetensors; no se publican versiones GGUF, ONNX ni CTranslate2) |
| Idiomas soportados | `ak` (akano/twi), limitado a los dialectos asante y akuapem segun el autor |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos Transformers); tamano del repositorio: 72,5 GB, presumiblemente por checkpoints de entrenamiento |

Otros datos: etiquetas del repositorio `generated_from_trainer`, `ak`, `dataset:ghanaopenai/asante-twi-bible-speech-text`, `base_model:finetune:openai/whisper-small`, `region:us`. Creado el 2026-10-18 y actualizado el 2026-10-19.

## Arquitectura y entrenamiento

La arquitectura es la de Whisper, un transformer encoder-decoder con atencion completa que procesa espectrogramas Mel de 80 canales y genera texto de forma autorregresiva. Al derivar de `openai/whisper-small`, hereda el preentrenamiento multilingue supervisionado debil de OpenAI (transcripcion y traduccion de audio a gran escala), sobre el que se ha aplicado un ajuste fino supervisado con pares audio-texto en twi. La model card no especifica el numero de tokens de audio vistos, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO; en un modelo ASR de este tipo lo habitual es un ajuste supervisado puro con entropia cruzada sobre transcripciones.

El unico dataset declarado es `ghanaopenai/asante-twi-bible-speech-text`, un corpus de audio y texto de contenido biblico en dialectos asante y akuapem. No se documentan tecnicas de aumento de datos, especificacion de decodificacion (beam search, temperatura) ni estrategias de manejo de marcas de tiempo. La tabla de entrenamiento publicada muestra un total de 5000 pasos con perdida de entrenamiento descendiendo de 3,8869 a 0,0967 y una perdida de validacion que alcanza su minimo de 0,3140 en el paso 2200 y posteriormente oscila entre 0,29 y 0,36, lo que sugiere un cierto sobreajuste al final del entrenamiento. El autor indica que se debe usar la etiqueta de idioma `sw` para la transcripcion, un detalle llamativo dado que `sw` corresponde al suajili en el espacio de tokens de Whisper, no al twi.

## Capacidades

- Transcripcion de voz a texto en twi (akano) para hablantes de los dialectos asante y akuapem.
- Procesamiento de audio en ventanas de hasta 30 segundos por inferencia, con la posibilidad de encadenar ventanas para audios mas largos mediante los mecanismos estandar de Whisper.
- Reconocimiento de vocabulario de dominio religioso/biblico, que es el que domina el corpus de entrenamiento.
- Uso del token de idioma `sw` para forzar la generacion en el espacio linguistico aprendido (indicado por el autor).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio clasificacion, diarizacion ni deteccion de idioma.
- No se documenta capacidad de traduccion a otro idioma (aunque Whisper base la tiene, el ajuste fino puede haberla degradado; no hay datos).
- Capacidades multilingues: no disponible; el ajuste esta declarado unicamente para `ak`.

## Casos de uso

- Transcripcion de archivos de audio biblico y sermonistico: el modelo esta entrenado especificamente sobre el corpus `asante-twi-bible-speech-text`, por lo que es el escenario con mayor probabilidad de exito; se usaria pasando fragmentos de 30 segundos al pipeline de ASR de Transformers y concatenando las salidas.
- Digitalizacion de archivos de audio de iglesias y comunidades religiosas en Ghana: conversion de grabaciones de sermones o lecturas a texto indexable, aprovechando el sesgo de dominio hacia vocabulario biblico.
- Subtitulado de contenido educativo o liturgico en twi: generacion de transcripciones para videos, con la advertencia de que la puntuacion y las marcas de tiempo no estan evaluadas.
- Investigacion linguistica y ASR de bajos recursos: serviria como linea base o punto de comparacion para experimentos con dialectos asante y akuapem, dado que es un fine-tuning reproducible a partir de `whisper-small`.
- Comandos de voz en twi para prototipos de interfaz: pese al nombre del modelo, no hay evaluacion publicada de precision en comandos cortos, por lo que solo se recomendaria en fase de prototipo y con validacion manual.
- Accesibilidad para hablantes de twi: transcripcion de notas de voz o reuniones en entornos con poco soporte de ASR comercial, siempre con revision humana dada la ausencia de metricas de error.
- Generacion de corpus textual en twi para posteriores tareas de NLP (modelos de lenguaje, traduccion, analisis morfologico), a partir de audio previamente no transcrito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara una lista de resultados vacia y no hay cifras de WER ni de CER sobre ningun conjunto de evaluacion publico. El unico dato cuantitativo es la perdida de validacion del entrenamiento.

| Metrica | Valor | Contexto |
|---|---|---|
| Perdida de validacion (minima) | 0,3140 | Paso 2200 |
| Perdida de validacion (final) | 0,3140 | Paso 5000 |
| Perdida de entrenamiento (inicial) | 3,8869 | Paso 200 |
| Perdida de entrenamiento (final) | 0,3191 | Paso 5000 |
| WER / CER | no disponible | No publicados |
| MMLU, GSM8K, HumanEval | no aplica | Modelo ASR, no LLM |

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1 GB solo para pesos (241,7 M parametros x 4 bytes), mas activaciones y buffers de espectrograma; en la practica, 2-3 GB son suficientes.
- VRAM estimada en fp16/bf16: aproximadamente 0,5 GB de pesos; el cuello de botella sera el audio de entrada y el almacenamiento en caché del decoder.
- Cuantizacion int8: aproximadamente 0,25 GB de pesos, viable en CPU para inferencia por lotes pequenos (no hay artefactos cuantizados publicados para este checkpoint).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente; para procesamiento por lotes a gran escala, A100 o H100 aportarian sobre todo throughput, no viabilidad.
- Cabe en GPU consumer: si, con amplio margen, dado el tamano de `whisper-small`.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers (ruta mas directa, ya que solo hay safetensors); conversion a CTranslate2 para faster-whisper y a GGML/GGUF para whisper.cpp requeriria convertir los pesos manualmente, ya que el autor no los publica. vLLM y TGI no estan orientados a ASR encoder-decoder de este tipo y no se documenta soporte.
- Latencia y throughput: no disponible. Como referencia cualitativa, `whisper-small` es un modelo disenado para inferencia casi en tiempo real en GPU consumer, pero no hay mediciones publicadas para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Rendimiento en twi | Disponibilidad |
|---|---|---|---|---|---|---|
| `NightshadeX16/whisper-twi-commands-small` | 241,7 M | 30 s por ventana | `ak` (asante/akuapem) | MIT | Perdida de validacion 0,3140; sin WER publicado | HuggingFace, safetensors |
| `openai/whisper-small` (modelo base) | ~244 M | 30 s por ventana | ~99 idiomas (incluye `ak` en el preentrenamiento) | MIT | No disponible; sin ajuste especifico a twi | HuggingFace, multiples formatos |
| `openai/whisper-base` | ~74 M | 30 s por ventana | ~99 idiomas | MIT | No disponible; menor capacidad que small | HuggingFace, multiples formatos |
| `openai/whisper-medium` | ~769 M | 30 s por ventana | ~99 idiomas | MIT | No disponible; mayor coste computacional | HuggingFace, multiples formatos |

No se han identificado en la informacion disponible otros fine-tunings publicos de Whisper para twi con los que comparar directamente, ni resultados de WER que permitan establecer una jerarquia de rendimiento.

## Limitaciones y advertencias

- Dominio muy restringido: el autor advierte que el modelo tiene dificultades con palabras fuera de la Biblia, lo que limita seriamente su uso en habla espontanea, conversacional o tecnica.
- Cobertura dialectal parcial: solo asante y akuapem; otros dialectos del akano (por ejemplo fante) no estan cubiertos segun la propia model card.
- Etiqueta de idioma incorrecta: se indica usar `sw`, que en el vocabulario de Whisper corresponde al suajili; esto puede inducir comportamientos anomalos si se combina con otras herramientas que interpretan ese token de forma estandar.
- Riesgo de alucinacion: Whisper es conocido por generar texto plausible en silencios, ruido o segmentos musicales; no hay evaluacion de este fine-tuning que permita descartarlo, y el sesgo biblico podria agravar el fenomeno produciendo citas o formulaciones religiosas inexistentes.
- Sobreajuste probable: la perdida de entrenamiento cae a 0,0967 mientras la de validacion se estanca y oscila desde el paso 2200, lo que sugiere memorizacion del corpus.
- Ausencia total de metricas de calidad: no hay WER ni CER, ni conjuntos de evaluacion independientes, ni comparacion con el modelo base.
- Validacion comunitaria practicamente nula: 2 descargas y 0 likes en el momento de la consulta.
- Licencia MIT en los pesos, pero la licencia y las condiciones de uso del dataset `ghanaopenai/asante-twi-bible-speech-text` no se detallan en la informacion disponible; conviene verificarlas antes de un uso comercial, especialmente por tratarse de texto biblico.
- El repositorio ocupa 72,5 GB, muy por encima del tamano de los pesos (menos de 1 GB), lo que apunta a checkpoints intermedios acumulados; la descarga completa es innecesaria e ineficiente.
- Versiones de framework muy recientes en el momento del entrenamiento declarado (Transformers 5.20.1, PyTorch 2.10.0, Datasets 5.1.0, Tokenizers 0.23.3): puede haber incompatibilidades al cargar con versiones anteriores.
- No se documenta comportamiento con audio de mas de 30 segundos, ni estrategia de chunking, marcas de tiempo o puntuacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NightshadeX16/whisper-twi-commands-small
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/ghanaopenai/asante-twi-bible-speech-text
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- No se han encontrado en la busqueda web enlaces adicionales relevantes sobre este modelo; los resultados obtenidos no guardan relacion con el contenido de la ficha.
