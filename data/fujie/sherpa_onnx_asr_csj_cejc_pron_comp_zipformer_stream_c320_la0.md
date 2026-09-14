# fujie/sherpa_onnx_asr_csj_cejc_pron_comp_zipformer_stream_c320_la0

## Resumen

El modelo `fujie/sherpa_onnx_asr_csj_cejc_pron_comp_zipformer_stream_c320_la0` es un sistema de reconocimiento automatico del habla (ASR) en **streaming** para japones, desarrollado por Shinya Fujie (Fujie Lab, Chiba Institute of Technology) y publicado en HuggingFace bajo el identificador de autor `fujie`. Se trata de un transductor **Zipformer** causal de 65,8 millones de parametros, entrenado con el framework icefall sobre los corpus CSJ y CEJC, y exportado a ONNX para su ejecucion con sherpa-onnx. Su rasgo diferencial no es solo la transcripcion: el modelo emite, ademas, **marcadores de filler (muletillas) y de repair (autorreparaciones)** directamente en la secuencia de salida, algo poco habitual en ASR de produccion.

El modelo trabaja con un chunk de 320 ms y **sin look-ahead** mas alla del chunk (sufijo `la0`), de modo que produce hipotesis parciales chunk a chunk con una latencia algorítmica de 320 ms. Se incluye tambien una exportacion de los mismos pesos con chunk de 640 ms. La codificacion de salida es en **moras (kana)** con fronteras de palabra (`|`), pausas (`<sp>`), regiones enmascaradas del corpus (`<mask>`) y formas compuestas `+F` (filler) y `+D` (repair), que pueden eliminarse para recuperar la transcripcion plana.

Es relevante porque demuestra que un modelo de 66 M de parametros puede correr en **tiempo real en un solo hilo de CPU** (RTF 0,084 en fp32 y 0,046 en int8) con una calidad de reconocimiento comparable, en CER, a un Whisper large-v3 con LoRA en configuracion streaming (12,24 % frente a 12,25 %), a una fraccion del coste computacional. El repositorio ocupa 0,7 GB y la licencia de los pesos es CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor Zipformer causal (encoder causal con dynamic-chunk training, decoder y joiner RNN-T podado) |
| Parametros totales | 65,8 M (aprox. 66 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No es una ventana de tokens: chunk de 320 ms (exportacion principal) o 640 ms, con 2,56 s de contexto izquierdo (`left-128`) y sin look-ahead (`la0`) |
| Tipos de cuantizacion | fp32 e int8 (encoder, decoder y joiner en ambas precisiones) |
| Idiomas soportados | Japones (`ja`) |
| Licencia | CC BY 4.0 (pesos); los corpus CSJ y CEJC se distribuyen por NINJAL bajo sus propios terminos |
| Formato de pesos | ONNX (`encoder-*.onnx`, `decoder-*.onnx`, `joiner-*.onnx`), mas `tokens.txt` con 362 tokens |
| Tamano del repositorio | 0,7 GB |
| Tamano de ficheros | Encoder fp32 261 MB / int8 70 MB; decoder y joiner 1,8 MB (fp32) y 0,7 MB (int8) |
| Metodo de decodificacion | Greedy search y modified beam search (beam 4) |
| Frecuencia de muestreo de entrada | 16 kHz mono, features fbank de 80 dimensiones |

## Arquitectura y entrenamiento

La arquitectura es un **transductor Zipformer** en configuracion streaming, entrenado con la receta `zipformer` de icefall con `--causal 1`. Durante el entrenamiento se muestrean por lote distintas combinaciones de chunk y contexto izquierdo: tamanos de chunk {16, 32, 64, full} y contextos izquierdos {64, 128, 256, full} (en tramas del encoder a 50 Hz; 16 tramas = 320 ms, 32 = 640 ms, 128 = 2,56 s). El joiner es un RNN-T podado con `--prune-range 5`. Se aplico SpecAugment y no se uso MUSAN como augmentacion de ruido.

Los datos de entrenamiento son el conjunto de train de CSJ + CEJC, con perturbacion de velocidad 0,9 / 1,0 / 1,1 (×3) y **0-0,6 s de silencio final anadido a cada utterance**, un detalle de diseno pensado para evitar alucinaciones en tramos de silencio. El entrenamiento duro 30 epocas sobre 2 × H100 con `max-duration` de 600 s, y los pesos publicados son la **media de las epocas 26 a 30**. El vocabulario es de 362 tokens: moras, `|`, `<sp>`, `<mask>` y las formas compuestas con sufijo `+F` (filler) y `+D` (repair). La exportacion se realizo con `export-onnx-streaming.py` de icefall, con `--enable-int8-quantization 1`.

La innovacion principal reside en la **anotacion integrada de disfluencias**: el modelo etiqueta a nivel de token si cada mora es normal (N), filler (F) o repair (D), lo que permite obtener tanto la transcripcion con marcadores como la transcripcion limpia, y ademas calcular puntuaciones de deteccion a nivel de span (F1 de F y de D con tolerancia de ±1 token).

## Capacidades

- Reconocimiento de habla en japones en modalidad **streaming**, con hipotesis parciales emitidas chunk a chunk.
- Decodificacion en dos configuraciones: chunk de 320 ms (`la0`) y chunk de 640 ms, ambas exportadas a ONNX.
- Salida en **secuencia de moras (kana)** con fronteras de palabra marcadas con `|`.
- Deteccion y etiquetado de **fillers** (`+F`) y **reparaciones** (`+D`) a nivel de token, con etiquetas auxiliares por token (`base_tokens` / `aux_labels`).
- Marcado de **pausas** (`<sp>`) y de **regiones enmascaradas** del corpus CEJC (`<mask>`).
- Recuperacion de transcripcion plana eliminando `+F` / `+D`, `|`, `<sp>` y `<mask>`.
- Decodificacion greedy y modified beam search (beam 4).
- Ejecucion en **ONNX Runtime** con `num_threads=1`, incluida la variante int8.
- Portabilidad a los runtimes de sherpa-onnx en C++, Android, iOS y **WebAssembly**, cargando los mismos ficheros ONNX.
- No soporta tool calling, function calling, agentes, vision, audio generativo ni capacidades multimodales: es exclusivamente un reconocedor ASR.

## Casos de uso

- **Subtitulado en directo de conversaciones japonesas**: el modelo emite hipotesis parciales cada 320 ms sin look-ahead, de modo que la latencia de emision coincide practicamente con el chunk y es apto para subtitulos simultaneos en retransmisiones o eventos.
- **Analisis de interaccion y linguistica de corpus**: las etiquetas F/D permiten estudiar cuantitativamente muletillas y autorreparaciones en habla espontanea, que es precisamente el fenomeno anotado en CSJ y CEJC, sin necesidad de anotacion manual adicional.
- **Pre-anotacion de corpus conversacionales**: el modelo genera transcripciones con fronteras de palabra y marcas de disfluencia que despues pueden revisarse; al eliminar los sufijos se obtiene directamente el texto plano para pipelines de anotacion.
- **Analitica de contact center en infraestructura on-premise**: con RTF 0,046 en int8 y 70 MB de encoder, un unico servidor CPU puede transcribir muchas llamadas concurrentes sin GPU, algo relevante cuando la normativa impide enviar audio a servicios externos.
- **Asistentes de voz embebidos y aplicaciones edge**: los ficheros int8 (70 MB de encoder mas menos de 1 MB de decoder y joiner) caben en moviles y dispositivos tipo Raspberry Pi, y el runtime WebAssembly permite ejecucion integramente en el navegador.
- **Transcripcion de entrevistas y material oral con silencios largos**: el entrenamiento con 0-0,6 s de silencio final anadido reduce el riesgo de alucinacion en tramos sin habla, frecuentes en entrevistas y grabaciones de campo.
- **Investigacion en ensenanza de idiomas y fluidez**: la deteccion de repairs (F1 54,4) y fillers (F1 84,7) permite construir metricas de fluidez y de carga cognitiva a partir de la propia transcripcion.
- **Sistemas de reconocimiento en tiempo real sobre hardware modesto**: con decodificacion en un solo hilo de CPU y la opcion de chunk de 640 ms (RTF 0,051 fp32 / 0,029 int8) se puede desplegar en dispositivos con restricciones termicas o de bateria.

## Benchmarks y rendimiento

Evaluacion sobre 17 conjuntos de evaluacion de CSJ + CEJC, con 23.500 utterances. El CER cuenta todos los tokens (`<sp>`, `<mask>` y cada marcador `+F` / `+D` como un simbolo); el "language CER" elimina marcadores, `|`, `<sp>` y `<mask>` de ambos lados. F F1 y D F1 son puntuaciones de deteccion a nivel de span de fillers y repairs con tolerancia de ±1 token. El RTF se midio en un Intel i9-12900K con chunks de entrada de 100 ms.

| Modelo | Chunk | Tamano | CER % | Language CER % | F F1 | D F1 | RTF CPU (1 hilo) |
|---|---|---:|---:|---:|---:|---:|---:|
| **Este modelo, greedy** | 320 ms | 66 M | **12,24** | **10,51** | 84,7 | 54,4 | 0,084 (int8 0,046) |
| Este modelo, modified beam search 4 | 320 ms | 66 M | 11,82 | 10,16 | 85,1 | 55,3 | no disponible |
| Este modelo, greedy | 640 ms | 66 M | 12,37 | 10,62 | 84,8 | 55,2 | 0,051 (int8 0,029) |
| CBS Conformer RNN-T (`fujie/espnet_asr_csj_cejc_pron_comp_cbs_transducer_120300_hop132`) | 100 ms | 30 M | 17,02 | 15,40 | 82,0 | 45,5 | 0,275 |
| Whisper large-v3 + LoRA, block-causal, look-ahead 0 | 100 ms | 1,55 B | 12,25 | 10,68 | 85,3 | 57,6 | (GPU) |
| Whisper large-v3 + LoRA, contexto completo (cota superior) | infinito | 1,55 B | 9,90 | 8,41 | 86,7 | 63,2 | (GPU) |

Bootstrap emparejado sobre utterances (CER, 320 ms greedy): -4,78 [-4,94, -4,64] frente al CBS RNN-T y -0,01 [-0,14, +0,12] frente al Whisper en streaming, es decir, diferencia no significativa respecto a este ultimo.

Nota: todas las cifras anteriores proceden de la model card del autor. La busqueda web realizada no aporto resultados relevantes ni benchmarks independientes.

## Requisitos de hardware

- **VRAM estimada**: no aplica en el caso base; el modelo esta disenado para inferencia en CPU (ONNX Runtime). El encoder fp32 ocupa 261 MB en disco y el int8 70 MB, de modo que el conjunto completo cabe holgadamente en memoria o VRAM de cualquier GPU moderna.
- **CPU**: funciona en tiempo real con **un solo hilo**. RTF medido de 0,084 (fp32) y 0,046 (int8) con chunk de 320 ms en un Intel i9-12900K, lo que equivale a entre 12 y 22 veces el tiempo real segun precision. Con chunk de 640 ms el RTF baja a 0,051 (fp32) y 0,029 (int8).
- **GPU recomendadas**: no son necesarias. Cualquier GPU consumer (por ejemplo RTX 4090 o inferiores) ejecutaria el modelo sin dificultad mediante el provider CUDA de onnxruntime, pero el beneficio practico es marginal dado que ya cumple tiempo real en CPU. Las H100 solo se emplearon para el entrenamiento.
- **Cabe en GPU consumer**: si, con un uso de memoria minimo (decenas a cientos de MB segun precision). Tambien cabe en dispositivos moviles y en WebAssembly.
- **Opciones de despliegue**: sherpa-onnx (Python, C++, Android, iOS, WebAssembly), `onnxruntime` directamente, y el paquete `fujielab-asr[sherpa]>=0.4.0` con API de decodificacion chunk a chunk y parseo de marcadores. No hay soporte indicado para vLLM, TGI o llama.cpp, que no aplican a este tipo de modelo.
- **Latencia y throughput**: latencia algorítmica de 320 ms con chunk de 320 ms sin look-ahead (640 ms en la exportacion alternativa). El flujo de ejemplo alimenta audio en tramos de 100 ms. No se publican cifras de throughput concurrente, pero el margen de RTF por hilo permite multiplexar varias decenas de flujos por nucleo de CPU en int8.

## Comparativa con modelos similares

| Modelo | Parametros | Chunk / contexto | CER % (CSJ+CEJC) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `fujie/sherpa_onnx_asr_csj_cejc_pron_comp_zipformer_stream_c320_la0` | 65,8 M | 320 ms, sin look-ahead, 2,56 s de contexto izquierdo | 12,24 | CC BY 4.0 | HuggingFace, ONNX, sherpa-onnx |
| `fujie/espnet_asr_csj_cejc_pron_comp_cbs_transducer_120300_hop132` (CBS Conformer RNN-T) | 30 M | 100 ms | 17,02 | no disponible | HuggingFace, ESPnet |
| Whisper large-v3 + LoRA (block-causal, look-ahead 0) | 1,55 B | 100 ms | 12,25 (10,68 language CER) | no disponible en la informacion proporcionada | pesos LoRA del mismo laboratorio segun README de fujielab-asr |
| Whisper large-v3 + LoRA (contexto completo) | 1,55 B | infinito | 9,90 | no disponible en la informacion proporcionada | idem |

Frente al CBS Conformer RNN-T del mismo laboratorio, este modelo reduce el CER en 4,78 puntos absolutos con el doble de parametros, y frente al Whisper large-v3 con LoRA en streaming no hay diferencia significativa en CER pese a ser 23 veces mas pequeno (66 M frente a 1,55 B) y a ejecutarse en CPU. La comparativa de licencias de los modelos alternativos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **Salida en moras, no en kanji**: el vocabulario son 362 tokens de moras kana mas meta-tokens, por lo que no hay normalizacion ortografica, conversion a kanji, puntuacion ni mayusculas. Para texto de uso final se requiere un paso posterior de conversion (por ejemplo, un modelo de normalizacion kana-kanji).
- **Errores de reconocimiento**: el CER es del 12,24 % (o 10,51 % en "language CER", descontando marcadores) sobre el propio dominio de evaluacion (habla espontanea de CSJ y CEJC). En dominios distintos (habla leida, ruido, far-field) el rendimiento no esta documentado: no disponible.
- **Deteccion de repairs limitada**: la F1 de reparaciones es 54,4, sensiblemente inferior a la de fillers (84,7), por lo que el etiquetado de autorreparaciones no es fiable para uso automatico sin revision.
- **Dependencia del dominio conversacional**: el entrenamiento se hizo exclusivamente con CSJ + CEJC, corpus de conversacion espontanea en japones. El comportamiento fuera de ese registro no esta evaluado.
- **Sesgos**: la model card no documenta analisis de sesgos demograficos, dialectales o de genero. No disponible.
- **Alucinacion en silencios**: mitigada, pero no eliminada, mediante 0-0,6 s de silencio final anadido durante el entrenamiento. En tramos largos de silencio o ruido no evaluados puede aparecer texto espurio.
- **Restricciones de licencia**: los pesos son CC BY 4.0, lo que permite uso comercial con atribucion. Los corpus CSJ y CEJC se distribuyen por NINJAL bajo sus propios terminos; el repositorio no contiene datos de corpus, pero el uso derivado puede quedar sujeto a las condiciones de NINJAL. Se pide citar el repositorio fujielab-asr y los corpus CSJ / CEJC.
- **Tokens especiales en la salida**: si no se eliminan, `+F`, `+D`, `|`, `<sp>` y `<mask>` contaminan el texto. Es obligatorio aplicar el parseo de marcadores antes de mostrar la transcripcion.
- **Adopcion nula**: el modelo registra 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que no existe validacion independiente de la comunidad.
- **Anomalia en los metadatos**: la fecha de creacion indicada en el repositorio (2026-09-13) es posterior a la de esta ficha; conviene verificarla antes de citarla.
- **Entorno de ejecucion**: requiere ONNX Runtime y, para el parseo de marcadores y la API chunk a chunk, el paquete `fujielab-asr>=0.4.0`. La libreria sherpa-onnx por si sola devuelve tokens pero no une la salida con separadores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fujie/sherpa_onnx_asr_csj_cejc_pron_comp_zipformer_stream_c320_la0
- Repositorio del laboratorio con modelos hermanos (ESPnet / Whisper): https://github.com/fujielab/fujielab-asr
- icefall: https://github.com/k2-fsa/icefall
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Modelo comparado, CBS Conformer RNN-T: `fujie/espnet_asr_csj_cejc_pron_comp_cbs_transducer_120300_hop132` (referenciado en la model card; URL de HuggingFace no verificada en la informacion disponible)
- Corpus CSJ y CEJC: distribuidos por NINJAL bajo sus propios terminos (enlace concreto no disponible en la informacion proporcionada)
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo; no hay papers, blogs ni demos adicionales disponibles.
