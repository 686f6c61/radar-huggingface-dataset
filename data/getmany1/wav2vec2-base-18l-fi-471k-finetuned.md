# GetmanY1/wav2vec2-base-18l-fi-471k-finetuned

## Resumen

`GetmanY1/wav2vec2-base-18l-fi-471k-finetuned` es un modelo de reconocimiento automatico del habla (ASR) para fines, desarrollado por Yaroslav Getman y colaboradores del grupo de investigacion en tecnologia del habla de la Universidad Aalto (equipo de Mikko Kurimo). Se trata de un wav2vec 2.0 Base con encoder Transformer de 18 capas (95M parametros) preentrenado de forma auto-supervisada sobre 471 000 horas de audio en fines y posteriormente ajustado con CTC para transcripcion.

El modelo forma parte de la familia publicada junto al articulo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL" (arXiv:2610.13102), que explora el preentrenamiento a gran escala con audio de radiodifusion y analiza el efecto de la profundidad del encoder (12 vs 18 capas) manteniendo el numero de parametros. Frente al baseline de 12 capas, la variante de 18 capas mejora el WER en todos los dominios evaluados, con una reduccion notable en Common Voice 16.1 (de 9,74 % a 8,99 %) y en audio de radiodifusion real KAVI (de 24,85 % a 23,91 %).

Es relevante porque demuestra que, a igualdad de parametros, aumentar la profundidad del Transformer mejora la calidad del ASR en fines, y porque libera pesos en safetensors y el checkpoint original de fairseq con licencia Apache 2.0, lo que facilita su uso en produccion y su reproduccion experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Base con encoder Transformer de 18 capas, dimension 768, feed-forward 1536, cabezal CTC |
| Parametros totales | 94 430 114 (95,1M segun la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada de 16 kHz mono, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF/INT8 en la informacion proporcionada) |
| Idiomas soportados | fines (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint original fairseq (`fairseq/checkpoint.pt` con `fairseq/dict.ltr.txt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0: un encoder convolucional de caracteristicas (CNN, congelado durante el ajuste fino) seguido de un encoder Transformer de 18 capas con dimension de modelo 768 y dimension feed-forward 1536. El preentrenamiento es auto-supervisado (wav2vec 2.0 con enmascaramiento y cuantizacion latente) sobre 471 000 horas de audio en fines procedente del Archivo de Radio y Television de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI), los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. El pipeline de datos aplico deteccion de actividad de voz, deduplicacion basada en transcripciones y filtrado por confianza de ASR con umbral tau = -0,10 sobre las 2,1M horas de audio de radiodifusion originales.

El ajuste fino se realizo con CTC sobre 4600 horas de habla transcrita (Parlamento finlandes y Lahjoita puhetta) durante 16 000 actualizaciones, con el encoder CNN congelado, sobre 128 GPU y aproximadamente 2,5 minutos de audio por GPU. El preentrenamiento uso 125 000 actualizaciones con learning rate 6e-4, unos 3 minutos de audio por GPU sobre 512 GPU. La entrada es audio mono a 16 kHz con `do_normalize=False`. La innovacion principal del trabajo es el analisis sistematico de la profundidad del encoder a parametros constantes, mostrando que 18 capas superan a 12 capas en todos los dominios de prueba.

## Capacidades

- Reconocimiento automatico del habla (ASR) en fines con salida a nivel de caracter (CTC).
- Transcripcion de audio mono a 16 kHz, sin normalizacion de entrada.
- Manejo de habla espontanea y de radiodifusion (Parlamento, archivo KAVI, Lahjoita puhetta).
- Evaluado en dominios diversos: Lahjoita puhetta, Parlamento finlandes (FP'16 y FP'20), Common Voice 16.1, FLEURS y audio de radiodifusion real KAVI.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni vision: es un modelo puramente acustico de ASR.
- Capacidad multilingue limitada al fines; no se documenta transferencia a otras lenguas.
- No dispone de modo thinking ni de decodificacion especulativa documentada.

## Casos de uso

- Transcripcion de archivos audiovisuales de radiodifusion: el modelo esta entrenado y evaluado especificamente sobre audio de archivo (KAVI), por lo que es adecuado para digitalizar y transcribir fondos de television y radio finlandeses con WER de referencia del 23,91 % en ese dominio.
- Subtitulado automatico de contenido en fines: al ser un modelo ligero (95M parametros) y con salida CTC, se puede desplegar en pipelines de generacion de subtitulos con latencia baja y bajo coste computacional.
- Analisis de sesiones parlamentarias: el ajuste fino incluye el corpus del Parlamento finlandes, con WER del 10,64 % (FP'16) y 8,66 % (FP'20), lo que lo hace util para indexar y buscar intervenciones parlamentarias.
- Investigacion en tecnologia del habla: sirve como baseline reproducible para estudiar el efecto de la profundidad del encoder en wav2vec 2.0, con pesos en safetensors y checkpoint fairseq disponibles.
- Prototipado de asistentes de voz en fines: su tamano reducido permite ejecutarlo en una sola GPU consumer para experimentos de reconocimiento en tiempo casi real.
- Evaluacion comparativa de arquitecturas ASR: la tabla de resultados del paper permite usarlo como referencia frente a variantes Conformer y E-Branchformer del mismo orden de parametros.
- Transcripcion de corpus de habla espontanea (Lahjoita puhetta): con WER del 21,33 %, adecuado para anotacion asistida de grandes colecciones de audio ciudadano.

## Benchmarks y rendimiento

Resultados de WER (%) en test de los modelos Base ajustados, segun la Tabla III del paper (LP = Lahjoita puhetta, FP = Parlamento finlandes, CV = Common Voice 16.1, KAVI = radiodifusion real). Mejor resultado a esta escala en negrita.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer 12 capas (baseline previo, 158K h) | 95,0M | 22,27 | 10,92 | 8,42 | 10,61 | 13,27 | 27,45 |
| Transformer 12 capas | 95,0M | 22,28 | 10,72 | 8,70 | 9,74 | 13,02 | 24,85 |
| **Transformer 18 capas (este modelo)** | 95,1M | 21,33 | 10,64 | 8,66 | 8,99 | 12,71 | 23,91 |
| Conformer 12 capas | 96,7M | 18,89 | 10,08 | 8,07 | 6,46 | 11,20 | 23,71 |
| Conformer 17 capas | 96,5M | **18,50** | 9,83 | 7,94 | **5,69** | **10,56** | 22,71 |
| E-Branchformer 12 capas | 98,4M | 19,14 | 10,10 | **7,80** | 6,91 | 11,53 | 22,89 |
| E-Branchformer 17 capas | 96,6M | 18,80 | **9,54** | 7,85 | 6,19 | 11,09 | **22,44** |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 94,4M parametros (unos 378 MB en fp32 y unos 189 MB en fp16), de modo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o mas de VRAM, incluyendo el propio audio y el procesador.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput se recomienda A100, H100 o L40S; para prototipado, RTX 4090, RTX 3090 o incluso GPUs de gama media.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales (RTX 20xx en adelante) e incluso en CPU para audio de duracion moderada.
- Opciones de despliegue: transformers (`AutoModelForCTC` + `Wav2Vec2Processor`), fairseq con el checkpoint original, y servidores de inferencia compatibles con transformers. No se documentan recetas especificas para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Idioma | Licencia | WER CV | WER KAVI |
|---|---|---|---|---|---|---|
| GetmanY1/wav2vec2-base-18l-fi-471k-finetuned | 95,1M | wav2vec 2.0, Transformer 18 capas | fi | Apache 2.0 | 8,99 | 23,91 |
| wav2vec2-base 12 capas (mismo paper) | 95,0M | wav2vec 2.0, Transformer 12 capas | fi | Apache 2.0 (segun el paper) | 9,74 | 24,85 |
| Conformer 17 capas (mismo paper) | 96,5M | Conformer | fi | Apache 2.0 (segun el paper) | 5,69 | 22,71 |
| E-Branchformer 17 capas (mismo paper) | 96,6M | E-Branchformer | fi | Apache 2.0 (segun el paper) | 6,19 | 22,44 |

## Limitaciones y advertencias

- Solo soporta fines; no se ha evaluado ni documentado su rendimiento en otras lenguas.
- No es un modelo de lenguaje: no genera texto libre, no hace razonamiento, no soporta tool calling ni agentes.
- Riesgo de alucinacion: como todo modelo CTC, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no representados; el WER en radiodifusion real (23,91 %) indica un margen de error considerable en ese dominio.
- Sesgos potenciales derivados del corpus de entrenamiento (radio y television publicas finlandesas, Parlamento, Lahjoita puhetta), que pueden infrarrepresentar determinados registros, dialectos o grupos de hablantes.
- Requiere audio mono a 16 kHz y `do_normalize=False`; un preprocesado distinto puede degradar el rendimiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los corpus de origen (KUVI, VoxPopuli, Parlamento, Lahjoita puhetta) si se redistribuyen derivados.
- No se documentan cuantizaciones oficiales; el uso en produccion requerira validar el impacto de INT8/ONNX por cuenta propia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de uso muy limitado, sin validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-18l-fi-471k-finetuned
- Modelo base: https://huggingface.co/GetmanY1/wav2vec2-base-18l-fi-471k
- Paper: https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Perfil del autor principal: https://huggingface.co/GetmanY1
- LinkedIn del autor principal: https://www.linkedin.com/in/yaroslav-getman/
- Perfil del coautor Tamas Grosz: https://huggingface.co/Grosy
- LinkedIn del coautor Tamas Grosz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
