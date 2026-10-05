# Archit-01/indic-asr-multi

## Resumen

Indic-asr-multi es un modelo de reconocimiento automatico del habla (ASR) multilingue para lenguas de la India, publicado por el usuario Archit-01 en HuggingFace bajo el identificador Archit-01/indic-asr-multi. Se distribuye como un modelo de la libreria NeMo y esta orientado a transcripcion de audio en nueve idiomas: hindi, marati, telugu, tamil, kannada, malayalam, gujarati, punyabi y odia.

El modelo se basa en una arquitectura Conformer con decodificador RNN-T, segun las etiquetas declaradas por el autor. Su rasgo mas destacado es que identifica automaticamente el idioma hablado sin necesidad de proporcionar un codigo de idioma en la llamada de inferencia, y devuelve la transcripcion en el alfabeto nativo del idioma detectado. Esto simplifica el despliegue en escenarios donde la lengua de entrada no se conoce a priori o varia entre fragmentos de audio.

La relevancia actual del modelo radica en la cobertura de un conjunto de lenguas indias habitualmente poco representadas en modelos ASR genericos, con una unica llamada a `transcribe()`. No obstante, la informacion publicada es muy limitada: no se documentan parametros, datos de entrenamiento, benchmarks ni licencia. El repositorio ocupa 1,8 GB y en el momento de redactar esta ficha no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con decodificador RNN-T (segun etiquetas del autor) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo ASR; entrada de audio mono a 16 kHz, con remuestreo automatico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (hi), marati (mr), telugu (te), tamil (ta), kannada (kn), malayalam (ml), gujarati (gu), punyabi (pa), odia (or) |
| Licencia | no disponible |
| Formato de pesos | checkpoints de NeMo (carga mediante `ASRModel.from_pretrained`); no se documentan conversiones a GGUF ni a otros formatos |
| Libreria | nemo (NeMo Toolkit) |
| Tamano del repositorio | 1,8 GB |
| Fecha de publicacion (HuggingFace) | 2026-10-05 (creacion), 2026-10-05 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La unica informacion disponible indica que se trata de un modelo Conformer RNN-T afinado (fine-tuning) sobre habla en lenguas indias. Conformer combina bloques convolucionales y de autoatencion para capturar dependencias locales y globales en la señal acustica, mientras que el decodificador RNN-T permite una alineacion monotona entre audio y texto, adecuada para transcripcion en streaming o por lotes.

El autor afirma que, durante el proceso de ajuste fino, el modelo tambien aprendio a reconocer el idioma hablado, de forma que no requiere un token de idioma explicito en la inferencia y genera la salida en el alfabeto nativo correspondiente. No se especifican el numero de tokens de audio utilizados, la composicion del dataset de entrenamiento, la existencia de etapas de RLHF/DPO (poco habituales en ASR) ni detalles sobre decodificacion especulativa, atencion lineal u otras optimizaciones. Tampoco se publican el numero de parametros ni la configuracion exacta del encoder y del predictor.

## Capacidades

- Reconocimiento automatico del habla multilingue en nueve lenguas indias con una unica llamada de inferencia.
- Identificacion automatica del idioma (language identification) integrada en el propio modelo, sin necesidad de pasar un codigo de idioma.
- Salida en el alfabeto nativo del idioma detectado (devanagari, tamil, telugu, kannada, malayalam, gujarati, gurmuji, odia, segun corresponda).
- Entrada de audio mono en formato WAV, con funcionamiento nativo a 16 kHz y remuestreo automatico de ficheros con otras frecuencias de muestreo.
- API de transcripcion por lotes mediante `model.transcribe([...])` dentro del ecosistema NeMo, con compatibilidad declarada para distintas versiones de NeMo (manejo de salidas como tupla en versiones antiguas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no aplica (modelo de transcripcion, no generativo de texto general).
- Capacidades de vision, audio generativo o modo de razonamiento (thinking): no disponibles.
- Capacidad de traduccion: no declarada.

## Casos de uso

- Transcripcion de contenido audiovisual indio: el modelo permite generar subtitulos en el alfabeto nativo para videos o podcasts cuya lengua no se conoce de antemano, gracias a la deteccion automatica de idioma.
- Atencion al cliente multilingue: se puede integrar en un pipeline de call center para transcribir conversaciones en cualquiera de las nueve lenguas soportadas sin configurar un modelo por idioma, reduciendo la complejidad operativa.
- Generacion de actas y notas de reunion: transcripcion de audio de reuniones en hindi, marati o tamil y volcado a texto para su posterior indexacion o resumen con un LLM aparte.
- Accesibilidad y subtitulado en tiempo real: conversion de voz a texto para personas con discapacidad auditiva en entornos donde se alternan varias lenguas indias.
- Archivado y busqueda de audio historico: transcripcion masiva de grabaciones para permitir busqueda por texto en bibliotecas de audio en lenguas indias.
- Procesamiento por lotes en pipelines de datos: el modelo puede invocarse desde scripts de NeMo para transcribir grandes volumenes de audio mono a 16 kHz, con la ventaja de no requerir etiquetado previo de idioma.
- Investigacion en ASR multilingue: util como punto de partida para experimentos de ajuste fino o evaluacion comparativa en lenguas indias de bajos recursos.
- Preprocesado para sistemas de voz a voz: transcripcion como primer paso antes de traduccion automatica o sintesis de voz en otro idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER/CER, comparaciones con otros modelos ni detalles sobre el conjunto de evaluacion utilizado.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del repositorio (1,8 GB) y del tipo de arquitectura declarada, no datos confirmados por el autor:

- VRAM estimada en fp32: del orden de 2 a 3 GB, considerando pesos y estados de decodificacion RNN-T. En precision reducida (fp16/bf16), aproximadamente 1 a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la mayoria de escenarios, por ejemplo NVIDIA T4, RTX 3060/4060, RTX 4090, A10, L4, A100 o H100. Las GPU de gama alta solo aportarian ventaja en throughput por lotes.
- Compatibilidad con GPU de consumo: si, previsiblemente cabe en tarjetas de consumo con 4-6 GB o mas de VRAM, dado el tamano reducido del repositorio.
- Opciones de despliegue: la via documentada es el NeMo Toolkit (`nemo_toolkit[asr]`) sobre PyTorch. NeMo permite exportar modelos Conformer RNN-T a ONNX y TensorRT para servir en produccion. No se documenta soporte para llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a este tipo de ASR.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tiempo real (RTF) ni de audio procesado por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a caracteristicas publicas de alternativas conocidas. Los datos de las alternativas proceden de informacion publica general y no de la model card de indic-asr-multi.

| Modelo | Desarrollador | Enfoque | Idiomas indios | Requiere codigo de idioma | Licencia |
|---|---|---|---|---|---|
| Archit-01/indic-asr-multi | Archit-01 | Conformer RNN-T (NeMo) | 9 | No (deteccion automatica) | no disponible |
| IndicConformer | AI4Bharat | Conformer (NeMo) | 12+ | Si (seleccion explicita) | no verificado en esta ficha |
| Whisper large-v3 | OpenAI | Encoder-decoder transformer | Cobertura multilingue amplia | No (deteccion de idioma integrada) | no verificado en esta ficha |
| MMS (Massively Multilingual Speech) | Meta | wav2vec 2.0 / CTC | Cobertura muy amplia | Si (adaptadores por idioma) | no verificado en esta ficha |

Los parametros y valores de WER de estas alternativas no se incluyen porque no se dispone de datos verificados en la informacion proporcionada. Para una comparacion cuantitativa seria necesario evaluar indic-asr-multi sobre un conjunto de test comun y consultar las fichas oficiales de cada alternativa.

## Limitaciones y advertencias

- Clips de audio muy cortos pueden decodificarse ocasionalmente en el alfabeto de un idioma distinto al hablado, segun reconoce el propio autor.
- La precision disminuye en palabras poco frecuentes, nombres propios y habla con mezcla de idiomas (code-switching) intensa.
- No se documenta la licencia del modelo: no hay garantia de que su uso comercial este permitido. Es imprescindible contactar con el autor antes de utilizarlo en produccion.
- No se publican datos de sesgo, composicion del dataset ni procedencia de los datos de audio, lo que impide evaluar posibles sesgos de acento, genero, edad o variedad dialectal.
- Como todo sistema ASR, existe riesgo de alucinacion o sustitucion de palabras, especialmente en audio ruidoso o con solapamiento de voces.
- No se especifican los parametros del modelo ni la configuracion de entrenamiento, lo que dificulta la reproducibilidad y la planificacion de recursos.
- El modelo no incluye puntuacion, diarizacion de hablantes ni marcas de tiempo documentadas.
- La verificacion de versiones de NeMo es necesaria: la propia model card incluye un manejo condicional de la salida para versiones antiguas de la libreria.
- El modelo no ha sido validado de forma independiente: cero descargas y cero likes en el momento de redactar esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Archit-01/indic-asr-multi
- NeMo Toolkit (libreria de despliegue): no se incluye enlace especifico en la informacion proporcionada
- Paper, blog o repositorio de referencia: no disponibles en la informacion proporcionada
- Demo o Space asociado: no disponible
