# GetmanY1/wav2vec2-base-fi-conf025-filter-finetuned

## Resumen

`GetmanY1/wav2vec2-base-fi-conf025-filter-finetuned` es un modelo de reconocimiento automatico del habla (ASR) para finlandes, desarrollado por Yaroslav Getman y colaboradores del grupo de investigacion en voz de la Universidad Aalto (autores del articulo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL"). Se trata de un checkpoint de ablacion: forma parte del conjunto de modelos que sustentan la Figura 1 del articulo, cuyo objetivo es medir el efecto del filtrado por confianza de ASR (umbral tau = -0,25) sobre el preentrenamiento auto-supervisado a gran escala.

El modelo parte de la arquitectura wav2vec 2.0 Base (12 capas, dimension oculta 768, dimension de feed-forward 3072, unos 95 millones de parametros) y se afina con CTC sobre 4.600 horas de habla transcrita. El preentrenamiento se realizo sobre 670.000 horas de audio retenidas tras aplicar el filtro de confianza, de un total de 890.000 horas deduplicadas procedentes de archivos de radio y television finlandeses, VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta.

Es relevante ahora porque documenta de forma reproducible como el filtrado de datos a escala de millones de horas afecta al rendimiento final de un modelo SSL de voz en un idioma de recursos limitados como el finlandes. No obstante, el propio autor advierte de que este checkpoint existe para comparacion dentro de la ablacion y que, para uso general, deben preferirse los modelos principales del articulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Base (transformer convolucional + encoder transformer, preentrenamiento auto-supervisado) |
| Parametros totales | 94.397.858 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; el limite practico lo impone la memoria de atencion, no documentado en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precision original y un checkpoint fairseq) |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint fairseq original (`fairseq/checkpoint.pt` con diccionario `fairseq/dict.ltr.txt`) |

## Arquitectura y entrenamiento

wav2vec 2.0 Base consta de un encoder convolucional de caracteristicas que transforma la forma de onda de 16 kHz en representaciones latentes, seguido de un transformer de 12 capas con dimension 768 y feed-forward de 3072. El preentrenamiento es auto-supervisado: se enmascaran segmentos de la representacion latente y el modelo debe identificarlos frente a distractores mediante una perdida contrastiva, junto con una perdida de diversidad de codigos (product quantization). El articulo entrena con 125.000 actualizaciones, learning rate 6e-4 y aproximadamente 3 minutos de audio por GPU en 512 GPUs.

Los datos de preentrenamiento proceden del archivo de radio y television de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. Todo el material paso por deteccion de actividad vocal y deduplicacion basada en transcripciones; despues se aplico el filtro por confianza de ASR con umbral tau = -0,25, que retuvo 670.000 horas (el 75 % de las 890.000 horas deduplicadas). El afinamiento es CTC sobre 4.600 horas de habla transcrita (Parlamento finlandes y Lahjoita puhetta) durante 16.000 actualizaciones, con el encoder convolucional de caracteristicas congelado. La entrada se normaliza con `do_normalize=False`.

## Capacidades

- Reconocimiento automatico del habla en finlandes a partir de audio mono a 16 kHz.
- Decodificacion CTC con vocabulario de caracteres (greedy decoding en el ejemplo de uso).
- Transcripcion de audio de dominio amplio: el preentrenamiento cubre radio, television, parlamento y habla espontanea de Lahjoita puhetta.
- Robusto a audio de difusion (broadcast) gracias al entrenamiento sobre el archivo KUVI.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acustico-ASR.
- No tiene capacidades de vision, audio generativo ni modo "thinking".
- Multilingue: no; exclusivamente finlandes.
- Compatible con `endpoints_compatible` segun los tags del repositorio.

## Casos de uso

- Transcripcion de archivos audiovisuales finlandeses: el modelo se entreno sobre el archivo KUVI de radio y television, por lo que es adecuado para digitalizar y transcribir material de difusion publica con vocabulario y acustica representativos.
- Subtitulado automatico de contenido en finlandes: la salida CTC a nivel de caracter permite generar subtitulos con marcas temporales mediante alineamiento forzado, util para plataformas de video en finlandes.
- Analisis de sesiones parlamentarias: parte del afinamiento usa el corpus del Parlamento finlandes, lo que favorece la transcripcion de discurso formal y debate politico.
- Investigacion en SSL de voz: sirve como punto de comparacion controlado en experimentos de ablacion de filtrado de datos, replicando la Figura 1 del articulo.
- Generacion de datos etiquetados a bajo coste: puede transcribir grandes volumenes de audio no etiquetado para alimentar posteriores pipelines de ASR o de mineria de datos.
- Prototipado rapido en transformers: con 95 M de parametros y safetensors, se carga en una sola GPU o incluso en CPU para pruebas de integracion y validacion de pipelines ASR.
- Evaluacion comparativa de tecnicas de filtrado: util para medir el impacto del umbral tau en modelos posteriores del mismo grupo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER ni comparaciones numericas con otros checkpoints de la ablacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 94,4 M de parametros; en fp32 ocupa aproximadamente 380 MB de pesos, en fp16 unos 190 MB. Con activaciones y buffers de atencion para audio largo, el consumo realista se situa en torno a 1-2 GB de VRAM para segmentos de decenas de segundos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090); para procesamiento por lotes a gran escala se recomienda A100 o H100 por throughput.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 4 GB de VRAM; tambien es viable en CPU para audios cortos.
- Opciones de despliegue: `transformers` con `Wav2Vec2ForCTC` y `Wav2Vec2Processor` (metodo documentado); `fairseq` para el checkpoint original; integracion en pipelines de Hugging Face. No se documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El preentrenamiento uso 512 GPUs con unos 3 minutos de audio por GPU, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GetmanY1/wav2vec2-base-fi-conf025-filter-finetuned | 94,4 M | audio 16 kHz mono | fi | Apache 2.0 | Hugging Face |
| Modelos principales del articulo (coleccion `GetmanY1/wav2vec2-fi-471k`) | no disponible | audio 16 kHz mono | fi | no disponible en la informacion | Hugging Face |
| wav2vec 2.0 Base original (Facebook/Meta) | ~95 M | audio 16 kHz mono | multilingue (entrenado en 53 idiomas, sin finlandes especifico) | MIT (modelo base) | Hugging Face / fairseq |

Los modelos principales del articulo son la referencia recomendada por el propio autor para uso general; este checkpoint solo debe usarse para comparacion dentro de la ablacion. No se dispone de datos de rendimiento comparativo (WER) en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint de ablacion: el autor indica explicitamente que para uso general deben preferirse los modelos principales del articulo; este existe solo para comparacion.
- Idioma unico: solo finlandes; no transcribe otros idiomas ni code-switching.
- Riesgo de alucinacion: como todo modelo CTC, puede producir transcripciones plausibles pero incorrectas en audio ruidoso, con solapamiento de hablantes o fuera de dominio.
- Sesgos de dominio: el preentrenamiento se centra en radio y television finlandesas, parlamento y Lahjoita puhetta; el rendimiento puede degradarse en acentos regionales, habla infantil o audio telefonico.
- Sin normalizacion de entrada: requiere `do_normalize=False` y audio mono a 16 kHz; un preprocesado incorrecto degrada la salida.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar el WER en el dominio propio antes de produccion.
- Sin datos publicados de WER ni de robustez; no hay benchmarks en la model card que permitan estimar el rendimiento real.
- Fecha de creacion futura (2026) y cero descargas: modelo practicamente sin validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf025-filter-finetuned
- Modelo base: https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf025-filter
- Coleccion de modelos principales del articulo: https://huggingface.co/collections/GetmanY1/wav2vec2-fi-471k
- Articulo: https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
