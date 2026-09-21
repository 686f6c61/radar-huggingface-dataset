# espnet/multi-talker-whisper-small-ami

## Resumen

multi-talker-whisper-small-ami es un checkpoint de ESPnet para reconocimiento automático del habla (ASR) multipartícipe entrenado sobre el corpus de reuniones AMI. Parte de openai/whisper-small (~244 M de parámetros, arquitectura transformer encoder-decoder) y aplica la técnica de serialized-output-training (SOT): el modelo emite una única transcripción que contiene todas las intervenciones, separadas por un token de cambio de hablante y con timestamps por hablante al estilo Whisper. Lo desarrolla el proyecto ESPnet y se publica con licencia cc-by-4.0, solo para inglés.

El problema que resuelve es el de la transcripción de audio con varios hablantes solapados sin necesidad de encadenar un sistema ASR y un diarizador independientes: un solo modelo produce texto y atribución de hablante de forma conjunta. Es relevante para investigadores que trabajan en ASR multi-talker y en arquitecturas de salida serializada, ya que ofrece un punto de referencia reproductible sobre AMI con métricas públicas de cpWER y DER.

Se distribuye como pesos en formato ESPnet (`model.pth`, 479 claves) más `config.yaml` y `token_list.txt` (vocabulario multilingüe de Whisper con 51.865 tokens), con un tamaño de repositorio de 1,0 GB. La fecha de creación del repositorio es el 24 de mayo de 2026 y la última actualización, el 20 de septiembre de 2026; con 37 descargas y 1 like, su adopción pública es todavía muy baja.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con salida serializada por hablante (SOT) |
| Parametros totales | Aproximadamente 244 M (heredados de openai/whisper-small; el repositorio ocupa 1,0 GB, coherente con pesos en FP32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (formato de Whisper); no se especifica longitud en tokens de texto |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ESPnet (`model.pth`, 479 claves) más `config.yaml` y `token_list.txt`; no hay safetensors ni GGUF |
| Modelo base | openai/whisper-small |
| Pipeline | automatic-speech-recognition |
| Libreria | espnet |
| Tamano del repositorio | 1,0 GB |
| Corpus de evaluacion | AMI (SDM), conjunto de test |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder-decoder de Whisper-small y lo adapta a la tarea multi-talker mediante serialized-output-training. En lugar de generar una transcripción por hablante o depender de un diarizador externo, la salida es una secuencia única que intercala el texto de todas las intervenciones con un token de cambio de hablante y timestamps estilo Whisper asociados a cada uno. Los pesos se distribuyen en el formato nativo de ESPnet (`model.pth` con 479 claves), por lo que no son cargables directamente con la librería `transformers` de HuggingFace.

El entrenamiento se realiza sobre el corpus AMI de reuniones, con evaluación sobre AMI SDM (single distant microphone) y configuración de decodificación beam = 5 y temperature = 0. La model card no detalla el número de tokens de audio vistos, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos no están disponibles. La innovación principal es, por tanto, el esquema de serialización de hablantes sobre un backbone Whisper congelado en su arquitectura original, no una modificación estructural del transformer.

## Capacidades

- Reconocimiento automático del habla en inglés sobre audio de reuniones con múltiples hablantes.
- Salida serializada con token de cambio de hablante, que evita el encadenamiento ASR + diarización.
- Timestamps por hablante al estilo Whisper dentro de la transcripción generada.
- Manejo de reuniones de 1 a 4 hablantes en el mismo audio (evaluado en AMI SDM).
- Generación de transcripciones con atribución de hablante en una sola pasada de decodificación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo de ASR).
- Capacidades multilingües: no; únicamente inglés, pese a que el vocabulario base de Whisper sea multilingüe.
- Capacidades especiales: ninguna adicional declarada (no hay modo thinking, visión ni audio generativo).

## Casos de uso

- Transcripción de reuniones corporativas: el modelo produce en una sola pasada el texto de todos los participantes con marcas de cambio de hablante, lo que simplifica el pipeline al eliminar la necesidad de sincronizar un ASR y un diarizador independientes.
- Generación de actas con atribución: a partir de la salida serializada se puede construir un acta donde cada intervención queda ligada a su hablante y a su marca temporal, útil para reuniones de equipos distribuidos.
- Subtitulado diarizado de paneles y mesas redondas: la salida con timestamps permite generar subtítulos que indican quién habla en cada momento, reutilizando la misma inferencia.
- Investigación en ASR multi-talker: sirve como baseline reproducible sobre AMI para comparar variantes de serialized-output-training frente a enfoques en cascada, gracias a que la receta `egs2/ami/sot_asr1` publica cpWER y DER.
- Análisis de dinámica conversacional: la secuencia de turnos con hablantes identificados permite calcular métricas de participación, solapamiento y duración de intervenciones en estudios de interacción.
- Indexación y búsqueda de archivos de audio por hablante: al disponer de transcripción y etiqueta de hablante, se puede construir un índice que permita recuperar fragmentos por participante y contenido.
- Evaluación de sistemas de diarización: los valores de DER por número de hablantes publicados en la model card permiten contrastar herramientas de diarización externas contra este modelo en el mismo conjunto de test.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre AMI SDM test, con beam = 5 y temperature = 0.

cpWER (%):

| Metrica | overall | 1-spk | 2-spk | 3-spk | 4-spk |
|---|---:|---:|---:|---:|---:|
| cpWER | 27,95 | 15,36 | 25,54 | 38,94 | 52,44 |

DER (%) con collar de 0,25 s:

| Metrica | overall | 1-spk | 2-spk | 3-spk | 4-spk |
|---|---:|---:|---:|---:|---:|
| DER | 9,84 | 1,47 | 6,99 | 18,65 | 29,43 |

No se han publicado resultados de otros benchmarks (WER estándar, MMLU, HumanEval, GSM8K u otros) en la información disponible; el modelo es exclusivamente de ASR, por lo que esas métricas no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB en FP32 solo para pesos; en FP16 alrededor de 0,5 GB y en int8 alrededor de 0,25 GB (estimaciones a partir de los ~244 M de parámetros, ya que no se publican cifras oficiales).
- Con beam = 5 y ventanas de 30 s, el consumo real de VRAM incluyendo activaciones se sitúa típicamente en el rango de 2 a 4 GB, aunque no hay mediciones publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Cabe en GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4090, y también en A100 o H100 sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, holgadamente, e incluso es viable en CPU o Apple Silicon con la implementación de ESPnet.
- Opciones de despliegue: la vía soportada es la receta de ESPnet `egs2/ami/sot_asr1`, colocando los tres archivos en `exp/whisper-sot-small-ami/` y ejecutando `./run.sh` con `--released_model` y `--decode_test_sets`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, dado que el formato de pesos es `.pth` de ESPnet y el modelo es de audio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento en AMI | Disponibilidad |
|---|---|---|---|---|---|---|
| espnet/multi-talker-whisper-small-ami | ~244 M | Ventanas de 30 s | ASR multi-talker con serialized-output-training | cc-by-4.0 | cpWER overall 27,95 %; DER overall 9,84 % | Pesos ESPnet en HuggingFace, requiere receta ESPnet |
| openai/whisper-small (modelo base) | ~244 M | Ventanas de 30 s | ASR monolocutor; no etiqueta hablantes | Apache 2.0 (según la model card de openai/whisper-small) | No disponible en AMI en la información consultada | safetensors/transformers, ampliamente soportado |
| Enfoque en cascada ASR + diarización (por ejemplo, Whisper con un diarizador externo tipo pyannote) | Depende de los componentes | Depende de los componentes | ASR y diarización en etapas separadas | Depende de cada componente | No disponible en la información consultada | Múltiples pipelines, más complejos de operar |

No se dispone de datos de otros checkpoints multi-talker de ESPnet ni de comparativas publicadas en la información proporcionada, por lo que la comparación numérica con alternativas directas queda como no disponible.

## Limitaciones y advertencias

- Solo inglés: el modelo no soporta otros idiomas aunque el vocabulario base de Whisper sea multilingüe.
- Dominio restringido: entrenado y evaluado sobre el corpus AMI (reuniones en sala), por lo que su comportamiento fuera de ese dominio no está caracterizado.
- Degradación clara al aumentar el número de hablantes: el cpWER pasa del 15,36 % con un hablante al 52,44 % con cuatro, y el DER del 1,47 % al 29,43 %.
- Riesgo de alucinación y de errores de atribución de hablante, especialmente en segmentos con solapamiento, propio de los sistemas ASR y agravado por la decodificación conjunta de texto y etiquetas de hablante.
- Dependencia del token de cambio de hablante: una segmentación incorrecta afecta simultáneamente al texto y a la diarización de la salida.
- Licencia cc-by-4.0: permite uso comercial, pero exige atribución al autor y conservación de la licencia; conviene revisar además las condiciones del corpus AMI y del modelo base Whisper.
- Integración limitada: el formato `.pth` de ESPnet no es cargable con `transformers` ni con los runners habituales (vLLM, llama.cpp, Ollama, TGI), lo que obliga a usar la receta de ESPnet.
- No se publican versiones cuantizadas, por lo que cualquier optimización de memoria debe hacerse por cuenta propia.
- Adopción muy baja en el momento de redactar la ficha (37 descargas, 1 like), lo que reduce la probabilidad de encontrar soporte de la comunidad.
- No hay información publicada sobre sesgos demográficos o acústicos concretos, ni sobre latencia, throughput o consumo de memoria medidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/espnet/multi-talker-whisper-small-ami
- Receta de ESPnet para AMI SOT ASR: https://github.com/espnet/espnet/tree/main/egs2/ami/sot_asr1
- Repositorio de ESPnet: https://github.com/espnet/espnet
- Modelo base: https://huggingface.co/openai/whisper-small
- Los resultados de la búsqueda web no contenían enlaces relevantes al modelo: correspondían a contenido audiovisual no relacionado (películas y plataformas de streaming), por lo que se descartan.
