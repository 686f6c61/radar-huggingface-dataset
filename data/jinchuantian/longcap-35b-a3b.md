# JinchuanTian/LongCap-35B-A3B

## Resumen

LongCap-35B-A3B es un modelo de audio-texto a texto especializado en la generacion de descripciones densas y con marcas de tiempo (timestamped audio captioning) sobre grabaciones de audio de larga duracion, desde unos segundos hasta aproximadamente dos horas. Lo desarrolla JinchuanTian y se publica bajo licencia Apache 2.0. El modelo resuelve un problema concreto: convertir una grabacion completa en una linea temporal estructurada de eventos de habla, musica y sonido, cada uno con tiempos de inicio y fin y un conjunto de atributos, ademas de transcribir el habla con etiquetas de hablante (speaker diarization).

Tecnicamente es un fine-tune del modelo base Qwen/Qwen3.5-35B-A3B-Base, con arquitectura Mixture-of-Experts (MoE) de 35.313.784.832 parametros totales y aproximadamente 3B activos (el sufijo A3B lo indica). El checkpoint procesa el audio en fragmentos cortos manteniendo en contexto el audio y el texto previos, con una ventana de hasta 1M tokens, lo que le permite una unica pasada sobre grabaciones de hasta dos horas sin degradarse como otros sistemas. Es relevante porque aborda el audio de formato largo con salida estructurada y atributos expertos, un caso poco cubierto por los modelos de audio-captioning habituales.

La salida es un JSON de eventos con un campo `type` (speech, music o sound_event), atributos extraidos de 62 claves disenadas por expertos y un `caption` breve. Los nombres de atributos y valores se escriben en chino, mientras que las transcripciones y letras conservan el idioma hablado. El modelo se distribuye en BF16 (70.6 GB) y en una variante FP8 (38.4 GB) que solo cuantiza los pesos de los expertos MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre Qwen3.5 (base Qwen/Qwen3.5-35B-A3B-Base) |
| Parametros totales | 35.313.784.832 |
| Parametros activos | aproximadamente 3B (sufijo A3B) |
| Longitud de contexto | hasta 1M tokens |
| Tipos de cuantizacion | BF16 y FP8 (solo expertos MoE cuantizados, resto BF16) |
| Idiomas soportados | en, zh (atributos y valores en chino; transcripciones en el idioma hablado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-35B-A3B-Base, un transformer con capas Mixture-of-Experts de 35.3B parametros totales y unos 3B activos por token. Sobre esa base se realiza un fine-tune orientado a audio-texto a texto con salida estructurada. La innovacion principal es el procesamiento incremental: LongCap lee la grabacion en fragmentos cortos y va escribiendo los eventos de cada fragmento a medida que avanza, manteniendo el audio y el texto previos en contexto hasta 1M tokens. Esto permite una unica pasada sobre grabaciones de hasta dos horas, frente a sistemas que procesan segmentos independientes de 10 minutos y se degradan en pocos minutos.

La salida estructurada se organiza en eventos con tiempos de inicio y fin y atributos extraidos de 62 claves disenadas por expertos que cubren habla, musica y sonido. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo se publica como fine-tune del base, con relacion `base_model_relation: finetune`.

## Capacidades

- Generacion de descripciones de audio densas y con marcas de tiempo (timestamped audio captioning).
- Salida estructurada en JSON: cada evento incluye `type`, tiempos de inicio y fin, atributos y un `caption`.
- Tres tipos de evento: `speech`, `music` y `sound_event`.
- Reconocimiento automatico del habla (ASR) con etiquetas de hablante (speaker diarization).
- Atributos de habla: transcripcion, identidad, edad y genero del hablante, rol discursivo, idioma, dialecto, acento, dificultad lexica, complejidad sintactica, entidades nombradas, prosodia, emocion, intencion, acto de habla y subtexto, entre otros.
- Atributos de musica: lista de instrumentos, funcion instrumental, tipo de voz, tempo y otros.
- Atributos de sonido: identificacion del evento sonoro, autenticidad de la fuente, deteccion de edicion, perfil de sonoridad, timbre, reverberacion, distancia estimada, distincion primer plano/fondo y funcion sonora.
- Procesamiento de audio de formato largo en una unica pasada de hasta aproximadamente dos horas.
- Soporte multilingue limitado a ingles y chino en la metainformacion; las transcripciones conservan el idioma hablado.
- Compatibilidad con vLLM para despliegue.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision ni audio de salida.

## Casos de uso

- Indexacion y busqueda de archivos audiovisuales: LongCap genera una linea temporal estructurada de habla, musica y sonido de una pelicula o programa completo en una sola pasada, lo que permite construir indices buscables por evento, hablante o tipo de sonido.
- Subtitulado y transcripcion con diarizacion: el modelo transcribe el habla con etiquetas de hablante y tiempos precisos, adecuado para generar subtitulos o actas de reuniones y entrevistas de larga duracion.
- Produccion y postproduccion de audio y video: los atributos de musica (instrumentos, tempo) y de sonido (fuente, distancia, reverberacion) facilitan tareas de catalogacion, busqueda de material de archivo y verificacion de continuidad sonora.
- Analisis de contenido para plataformas de streaming: la salida estructurada permite detectar escenas musicales, cambios de escena marcados por musica y eventos sonoros relevantes, util para moderacion, recomendacion y generacion de metadatos.
- Investigacion en audio y linguistica: los 62 atributos expertos ofrecen anotaciones ricas y consistentes sobre prosodia, emocion, acto de habla y contexto cultural, utiles para estudios y para construir datasets anotados.
- Monitorizacion de emisiones y medios: procesar grabaciones de radio o television de hasta dos horas para extraer lineas temporales de habla, musica y eventos sonoros, con transcripcion y atributos de hablante.
- Archivado y preservacion audiovisual: generar descripciones densas y estructuradas de fondos de archivo para mejorar su descubrimiento y accesibilidad.

## Benchmarks y rendimiento

Los datos disponibles en la model card se refieren a LongCapBench-TAC-Short y LongCapBench-TAC-Long, benchmarks del propio paper. Se comparan con Qwen3.5-Omni-Plus. Las puntuaciones reportadas usan la version FP8.

| Benchmark / metrica | LongCap-35B-A3B | Qwen3.5-Omni-Plus |
|---|---|---|
| tcpCapSim en LongCapBench-TAC-Short (mayor es mejor) | 64.6% | 52.7% |
| TER en LongCapBench-TAC-Short (menor es mejor) | 13.0% | 13.2% |

La model card indica que LongCap mantiene la calidad de descripcion a lo largo de dos horas de audio, mientras que otros sistemas se degradan en pocos minutos cuando procesan segmentos independientes de 10 minutos. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Version BF16: 70.6 GB de pesos; requiere 2x H100 80GB segun la model card.
- Version FP8: 38.4 GB; cabe en 1x H100 80GB. Solo se cuantizan los pesos de los expertos MoE; el resto permanece en BF16 y las salidas de ambas versiones son muy similares.
- No se indica compatibilidad con GPU de consumo (RTX 4090, etc.) en la informacion disponible; el tamano y la ventana de contexto de hasta 1M tokens hacen improbable su ejecucion comoda en GPU consumer.
- Despliegue: la model card menciona compatibilidad con vLLM y la libreria `longcap`. No se documentan opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongCap-35B-A3B | 35.3B totales, ~3B activos (MoE) | hasta 1M tokens | Audio-captioning con marcas de tiempo y ASR con diarizacion | Apache 2.0 | Hugging Face (BF16 y FP8) |
| Qwen3.5-Omni-Plus | no disponible | no disponible | Modelo omni (referencia de comparacion en el paper) | no disponible | no disponible |
| LongCap-122B-A10B | 122B totales, ~10B activos (MoE) | no disponible | Version mayor del mismo sistema, citada en el paper | no disponible | No publicada |

La model card solo ofrece comparacion directa con Qwen3.5-Omni-Plus en los benchmarks del paper. No se dispone de datos de otros modelos comparables de audio-captioning de formato largo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible.
- Riesgo de alucinacion: no se documenta explicitamente; como modelo generativo de descripciones, existe riesgo de atribuir eventos o atributos incorrectos, especialmente en audio ambiguo o de baja calidad.
- Idioma: la metainformacion declara solo ingles y chino; los nombres y valores de atributos se escriben en chino, lo que puede requerir postprocesado para aplicaciones en otros idiomas.
- Contexto: aunque soporta hasta 1M tokens y grabaciones de hasta dos horas, no se documenta el comportamiento mas alla de ese limite.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5 y de los datos de entrenamiento, no detalladas en la informacion disponible.
- Requisitos de hardware elevados: la version BF16 necesita 2x H100 80GB; la FP8, 1x H100 80GB. No se confirma soporte en GPU de consumo.
- Madurez: el modelo es reciente (creado en noviembre de 2026) y con pocas descargas (190) y likes (4) en el momento de la consulta; la validacion externa es limitada.
- Dependencia de la libreria `longcap` y de vLLM para el despliegue segun la model card.

## Enlaces

- Hugging Face: https://huggingface.co/JinchuanTian/LongCap-35B-A3B
- Version FP8: https://huggingface.co/JinchuanTian/LongCap-35B-A3B-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Paper (arXiv): https://arxiv.org/abs/2611.11125
- Codigo: https://github.com/jctian98/longcap-code
- Quickstart: https://github.com/jctian98/longcap-code/blob/main/docs/quickstart.md
- Pagina del proyecto: https://jctian98.github.io/longcap/
- Benchmark LongCapBench-TAC-Long: https://huggingface.co/datasets/JinchuanTian/LongCapBench-TAC-Long
