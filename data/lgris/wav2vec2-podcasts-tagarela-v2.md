# lgris/wav2vec2-podcasts-tagarela-v2

## Resumen

El modelo `lgris/wav2vec2-podcasts-tagarela-v2` es un sistema de reconocimiento automático del habla (ASR) desarrollado por el usuario lgris, consistente en un ajuste fino de Wav2Vec2 Base sobre el corpus TAGARELA v2 en portugués brasileño. Parte del punto de control `lgris/w2v_podcasts_base_400k_pt`, un Wav2Vec2 Base preentrenado específicamente con podcasts en portugués, lo que sitúa al modelo en el nicho de la transcripción de audio espontáneo y conversacional, y no de habla leída o de laboratorio.

El modelo cuenta con 94.412.469 parámetros (aproximadamente 94M), se distribuye en formato safetensors con un tamaño de repositorio de 0,4 GB y emplea una licencia Apache 2.0. Emplea una arquitectura Wav2Vec2 con cabecera CTC y un vocabulario reducido de 51 tokens basado en minúsculas, caracteres acentuados del portugués y un delimitador de palabras, lo que implica que la salida no incluye puntuación ni mayúsculas.

Su relevancia actual radica en dos factores: por un lado, ofrece un WER del 14,96 % sobre el conjunto de prueba de TAGARELA v2, un resultado competitivo con modelos de 300M parámetros en ese dominio; por otro, su tamaño reducido permite desplegarlo en hardware de consumo o incluso en CPU, algo poco habitual en modelos ASR con un rendimiento aceptable en portugués. El ajuste se realizó sobre la totalidad del corpus (5.315.941 muestras de entrenamiento, unas 13.127 horas de audio) mediante streaming, sin caché en disco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 Base con cabecera CTC (Wav2Vec2ForCTC) |
| Parametros totales | 94.412.469 (aprox. 94M) |
| Longitud de contexto | No aplica (modelo ASR basado en CTC; no define una ventana de contexto de texto) |
| Tipos de cuantizacion | No disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | Portugues brasileño (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de entrada | 16 kHz, mono |
| Vocabulario | 51 tokens (a-z en minusculas, caracteres acentuados, delimitador `\|`, `[UNK]`, `[PAD]`) |
| Modelo base | lgris/w2v_podcasts_base_400k_pt |
| Dataset de ajuste fino | freds0/TAGARELA_v2 |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

Se trata de un transformer convolucional de tipo Wav2Vec2 en configuracion Base: un extractor de caracteristicas convolucional seguido de un codificador transformer y una cabecera de clasificacion lineal para CTC. El autor congela el extractor de caracteristicas durante el ajuste fino (`freeze_feature_encoder=True`), practica habitual para preservar las representaciones acusticas aprendidas en el preentrenamiento y adaptar unicamente el codificador al dominio objetivo. La decodificacion es CTC greedy a nivel de caracter, sin modelo de lenguaje externo, lo que explica la ausencia de puntuacion y mayusculas en las transcripciones.

El entrenamiento se realizo sobre el 100 % del corpus TAGARELA v2 en modo streaming: 5.315.941 muestras de entrenamiento, aproximadamente 13.127 horas de audio repartidas en 2.224 shards Parquet, cargadas bajo demanda con PyArrow y sin cache en disco. Los hiperparametros declarados son 100.000 pasos maximos, tamano de lote efectivo de 128 (16 por dispositivo con 8 pasos de acumulacion de gradiente), tasa de aprendizaje 3e-5 con calentamiento lineal en los primeros 5.000 pasos, optimizador AdamW con weight decay 0,005 y precision bfloat16. No se documenta ninguna fase de RLHF, DPO ni decodificacion especulativa, algo esperable en un modelo ASR.

## Capacidades

- Transcripcion de voz a texto en portugues brasileño sobre audio a 16 kHz mono.
- Reconocimiento de habla espontanea y conversacional, gracias al preentrenamiento sobre podcasts en portugues.
- Salida a nivel de caracter en minusculas, con acentos y delimitador de palabras, sin puntuacion ni mayusculas.
- Funcionamiento en streaming de datos para inferencia por fragmentos, aunque el modelo no implementa un modo de decodificacion en tiempo real documentado por el autor.
- Ejecucion viable en CPU y en GPU de gama de consumo por su tamano (94M parametros).
- Capacidades multilingues: no disponibles; el modelo esta entrenado y evaluado exclusivamente en portugues brasileño.
- Soporte de tool calling, agentes, razonamiento multi-paso, vision o audio multimodal: no disponible (modelo puramente ASR).
- Modo "thinking": no disponible.

## Casos de uso

- Transcripcion de podcasts en portugues brasileño: es el dominio de preentrenamiento y de ajuste, y donde el modelo obtiene su mejor resultado (WER 14,96 % en TAGARELA v2). Se emplearia para generar transcripciones de archivos largos procesados por fragmentos a 16 kHz.
- Indexacion y busqueda de contenido en audio: las transcripciones sin puntuacion pueden normalizarse y alimentar un indice de texto para busqueda semantica sobre catalogos de podcasts o programas de radio.
- Subtitulado automatico de video en portugues: el modelo puede generar subtitulos a nivel de caracter que despues se segmentan y sincronizan; el WER de 6,47 % CER en TAGARELA v2 lo hace adecuado para contenido con habla clara, aunque requerira post-procesado para puntuacion.
- Analisis de entrevistas y material de investigacion cualitativa: con WER del 23,98 % en CORAA v1.1 (dominio variado de entrevistas y clases), es util para transcripcion asistida donde un revisor humano corrige despues, reduciendo el coste frente a la transcripcion manual.
- Preprocesado de pipelines de datos para PLN: transcripcion masiva de audio para construir corpus de texto en portugues, con el modelo ejecutandose en CPU en paralelo para abaratar el coste frente a soluciones basadas en API.
- Prototipado y demos en local: al ocupar 0,4 GB de repositorio y 94M parametros, permite montar una demo de transcripcion en un portatil sin GPU, algo inviable con modelos ASR de miles de millones de parametros.
- Moderacion y monitorizacion de contenido de audio: transcripcion de flujos de audio para deteccion posterior de terminos o temas, aprovechando el bajo coste de inferencia por su tamano reducido.
- Ajuste adicional sobre dominios especificos: al estar bajo Apache 2.0 y ser un Wav2Vec2 Base estandar, puede servir como punto de partida para afinar sobre jerga tecnica, medica o legal en portugues.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Dataset de prueba | Muestras | WER (%) | CER (%) |
|---|---|---|---|
| TAGARELA v2 | 4.208 | 14,96 | 6,47 |
| TAGARELA v1 (revision humana) | 356 | 23,75 | 10,91 |
| CORAA v1.1 | 12.676 | 23,98 | 10,30 |

Comparativa publicada por el autor frente a otros modelos en portugues:

| Modelo | TAGARELA v1 (WER) | TAGARELA v2 (WER) | CORAA (WER) |
|---|---|---|---|
| Podcasts PT (v2, 100 %) — este modelo | 23,75 % | 14,96 % | 23,98 % |
| Podcasts PT (v1+v2, 100 %) | 21,64 % | 15,92 % | 25,44 % |
| XLS-R 300M (v2, 100 %) | no disponible | 11,75 % | no disponible |
| XLS-R 300M (v1+v2, 100 %) | no disponible | 20,36 % | no disponible |
| CORAA (Edresson, wav2vec2-large-xlsr) | 32,55 % | 27,08 % | 22,46 % |

Lectura de los datos: el modelo supera al ajuste equivalente sobre XLS-R 300M cuando este se entrena con la combinacion v1+v2 (20,36 % frente a 14,96 % en TAGARELA v2), y mejora claramente a la referencia externa de Edresson en TAGARELA v1 y v2, aunque queda por detras de ella en CORAA (23,98 % frente a 22,46 %). XLS-R 300M afinado solo con v2 obtiene el mejor WER en TAGARELA v2 (11,75 %), con la diferencia de tamano y coste asociada.

## Requisitos de hardware

- VRAM estimada para inferencia, derivada del numero de parametros (94M): aproximadamente 0,38 GB en fp32, 0,19 GB en fp16/bf16 y 0,09 GB en int8, sin contar activaciones ni el overhead de la libreria. Son estimaciones aritmeticas, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en la practica; el modelo se beneficia de fp16 o bf16 en tarjetas como RTX 3060, RTX 4090, A100 o H100, pero no las necesita.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 o superiores. Tambien es viable en CPU, lo que permite desplegarlo en instancias sin acelerador.
- Opciones de despliegue: la via documentada por el autor es la libreria Transformers, mediante `pipeline("automatic-speech-recognition")` o las clases `Wav2Vec2ForCTC` y `Wav2Vec2Processor`. No se documentan otras rutas (ONNX Runtime, TensorRT, llama.cpp, vLLM o TGI) para este modelo concreto.
- Latencia y throughput: no disponibles (el autor no publica mediciones de velocidad ni comparativas de RTF).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TAGARELA v2 (WER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lgris/wav2vec2-podcasts-tagarela-v2 | 94M | no aplica (ASR) | 14,96 % | Apache 2.0 | HuggingFace |
| lgris/wav2vec2-xls-r-300m-tagarela-v2 | 300M (aprox.) | no aplica (ASR) | 11,75 % | no disponible | HuggingFace |
| lgris/wav2vec2-podcasts-tagarela-combined | 94M (aprox.) | no aplica (ASR) | 15,92 % | no disponible | HuggingFace |
| Edresson/wav2vec2-large-xlsr-coraa-portuguese | 300M (aprox.) | no aplica (ASR) | 27,08 % | no disponible | HuggingFace |

El compromiso principal es claro: frente a las alternativas de 300M parametros, este modelo pierde en precision absoluta (14,96 % frente a 11,75 % en TAGARELA v2) pero reduce el coste de inferencia y de almacenamiento en un factor aproximado de tres.

## Limitaciones y advertencias

- Sesgos: no se documenta ningun analisis de sesgos por acento, genero, edad o variedad dialectal. El entrenamiento se centra en portugues brasileño y en el dominio de podcasts, por lo que el rendimiento puede degradarse con acentos no representados en TAGARELA v2.
- Alucinacion y errores de transcripcion: el WER del 23,98 % en CORAA v1.1 y del 23,75 % en TAGARELA v1 implica que aproximadamente una de cada cuatro palabras es incorrecta en dominios alejados del entrenamiento. No es adecuado para transcripcion literal sin revision en contextos criticos.
- Salida sin puntuacion ni mayusculas: el vocabulario no incluye estos elementos, de modo que cualquier uso que requiera texto formateado necesita un modelo de restauracion posterior.
- Limitaciones de idioma: exclusivamente portugues brasileño. No se declara soporte para portugues europeo ni para otros idiomas.
- Formato de audio: requiere 16 kHz mono. El incumplimiento de esta condicion sin remuestreo previo degrada el resultado.
- Ausencia de datos de velocidad: no hay cifras de latencia ni throughput, lo que obliga a medir en el entorno propio antes de dimensionar un despliegue en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion con atribucion, pero el modelo base `lgris/w2v_podcasts_base_400k_pt` deberia revisarse por si tuviera condiciones distintas, y el corpus TAGARELA v2 tiene sus propias condiciones de uso que conviene verificar.
- Madurez del artefacto: cero descargas y cero valoraciones en el momento de la consulta, sin verificacion independiente de los resultados (todos marcados como `verified: false`).
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; no se han localizado papers, blogs ni demos asociados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lgris/wav2vec2-podcasts-tagarela-v2
- Modelo base: https://huggingface.co/lgris/w2v_podcasts_base_400k_pt
- Dataset de ajuste fino TAGARELA v2: https://huggingface.co/datasets/freds0/TAGARELA_v2
- Version combinada v1+v2: https://huggingface.co/lgris/wav2vec2-podcasts-tagarela-combined
- Version sobre XLS-R 300M con v2: https://huggingface.co/lgris/wav2vec2-xls-r-300m-tagarela-v2
- Version sobre XLS-R 300M combinada: https://huggingface.co/lgris/wav2vec2-xls-r-300m-tagarela-combined
- Referencia externa sobre CORAA: https://huggingface.co/Edresson/wav2vec2-large-xlsr-coraa-portuguese
- Dataset CORAA v1.1: https://huggingface.co/datasets/Racoci/CORAA-v1.1
