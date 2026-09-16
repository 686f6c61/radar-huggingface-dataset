# msyukriafifi/fastconformer-quran-ar

## Resumen

fastconformer-quran-ar es un modelo de reconocimiento automatico del habla (ASR) especializado en recitacion coranica en arabe, desarrollado por el usuario de HuggingFace msyukriafifi. Se trata de un ajuste fino del modelo NVIDIA stt_ar_fastconformer_hybrid_large_pcd_v1.0, basado en la arquitectura EncDecHybridRNNTCTCBPE (FastConformer-Large) con 114,6 millones de parametros y 18 bloques de encoder. El autor declara un Word Error Rate (WER) de 0,0014 (0,14 %) sobre el conjunto de validacion de tarteel-ai/everyayah, incluyendo diacritizacion completa (tashkeel) en la salida.

Su relevancia actual radica en dos factores. Por un lado, cubre un nicho muy concreto con pocos modelos publicos: la transcripcion de recitacion coranica con reglas de tajweed, un dominio donde los modelos ASR genericos de arabe rinden de forma notablemente peor. Por otro lado, soporta tanto transcripcion offline con contexto bilateral completo como inferencia en streaming causal cache-aware, lo que permite construir aplicaciones de seguimiento de recitacion en tiempo real sobre hardware de consumo.

El modelo se distribuye a traves de NVIDIA NeMo, con pesos en formato .nemo (repositorio de 4,1 GB), licencia CC-BY-4.0 y soporte unicamente para arabe. El ajuste se realizo con una estrategia de descongelacion progresiva en tres fases sobre una unica GPU RTX 4070 Ti de 12 GB, lo que lo convierte en un caso reproducible de fine-tuning de bajo coste. Cabe senalar que el WER declarado esta marcado como no verificado y que el modelo acumula cero descargas y cero valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EncDecHybridRNNTCTCBPE (FastConformer-Large), encoder de 18 bloques FastConformer con atencion relativa; cabeza hibrida RNNT + CTC |
| Parametros totales | 114,6 millones |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica contexto textual. Ventana de atencion: bilateral completa en modo offline; 128 frames de lookback (aproximadamente 10 s) con atencion local causal en modo streaming |
| Tipos de cuantizacion | No disponible (no se documentan pesos cuantizados; el repositorio contiene el checkpoint .nemo sin cuantizar) |
| Idiomas soportados | Arabe (arabe coranico / arabe clasico con tashkeel) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | .nemo (formato nativo de NVIDIA NeMo, 4,1 GB) |
| Modelo base | nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0 |
| Tokenizador | SentencePiece BPE, 1024 tokens |
| Frecuencia de muestreo | 16 kHz, mono |
| Framework | NVIDIA NeMo (nemo_toolkit[asr]) |
| Dataset de ajuste | tarteel-ai/everyayah |

## Arquitectura y entrenamiento

La arquitectura es un encoder-decoder hibrido de NeMo: un encoder FastConformer-Large de 18 bloques con atencion relativa posicional, seguido de dos cabezas de decodificacion (RNNT y CTC) que comparten el mismo encoder. FastConformer reduce el coste computacional del encoder mediante downsampleado convolucional de las secuencias de entrada, lo que permite procesar audio de forma eficiente en GPUs modestas. Para streaming, el encoder puede reconfigurarse a atencion local causal (rel_pos_local_attn) con 128 frames de lookback y convoluciones causales, manteniendo caches de canal y de tiempo entre fragmentos (cache_aware_stream_step).

El ajuste fino se realizo sobre tarteel-ai/everyayah, un corpus multirrecitador de recitaciones completas del Coran que cubre las 114 suras con docenas de recitadores y distintas calidades de audio. Se empleo una estrategia de descongelacion progresiva en tres fases para evitar el olvido catastrofico de las representaciones de habla arabe del modelo base: fase 1 con los 3 bloques superiores del encoder y el decoder descongelados (2000 pasos, LR 5e-5, WER de validacion 0,0038); fase 2 con la mitad superior del encoder (bloques 9-17) y el decoder (3000 pasos, LR 1e-4, WER 0,0018); y fase 3 con todas las capas (2500 pasos, LR 5e-5, WER final 0,0014). Todo el entrenamiento se ejecuto en una unica RTX 4070 Ti de 12 GB.

No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo ASR. Tampoco se especifica el numero total de horas de audio ni la composicion exacta del split de entrenamiento y validacion.

## Capacidades

- Reconocimiento automatico del habla en arabe coranico con salida diacritizada completa (tashkeel), segun los ejemplos cualitativos incluidos en la model card.
- Transcripcion offline de archivos de audio de 16 kHz mono con contexto bilateral completo y maxima precision.
- Inferencia en streaming en tiempo real mediante decodificacion cache-aware, con fragmentos de audio de 80 ms a 1600 ms y atencion causal.
- Decodificacion hibrida: cabeza RNNT y cabeza CTC sobre el mismo encoder; en streaming se recomienda estrategia greedy con max_symbols = 10.
- Alineacion con reglas de tajweed y estilo de recitacion, gracias al ajuste especifico sobre recitaciones coranicas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de modelos generativos: es un modelo puramente ASR.
- No se documentan capacidades de vision, audio-vision ni traduccion. El unico idioma soportado es el arabe.

## Casos de uso

- Seguimiento de recitacion en tiempo real: integrado en una aplicacion movil o web con microfono, el modelo consume fragmentos de 80-1600 ms y devuelve texto parcial diacritizado, permitiendo resaltar la palabra que el usuario esta recitando en pantalla. El modo streaming cache-aware esta disenado exactamente para este escenario.
- Verificacion de memorizacion (hifz): comparando la transcripcion con el texto canonico del Coran, se pueden detectar omisiones, sustituciones o saltos de versiculo durante la practica de memorizacion.
- Generacion automatica de subtitulos y transcripciones de recitaciones publicadas: con el modo offline, un pipeline por lotes puede transcribir archivos de audio de recitadores completos para archivos, bibliotecas digitales o plataformas de contenido religioso.
- Indexacion y busqueda semantica de audio coranico: convertir grandes volumenes de recitaciones a texto diacritizado facilita busquedas por versiculo, sura o palabra en bibliotecas de audio.
- Control de calidad de grabaciones: un estudio de produccion puede transcribir tomas y compararlas con la referencia para detectar errores de recitacion antes de publicar.
- Asistencia a personas con discapacidad auditiva en contextos de aprendizaje coranico: transcripcion en vivo de la recitacion del profesor para seguirla por texto.
- Investigacion linguistica y fonetica: el corpus transcrito con tashkeel permite analizar realizaciones foneticas, duraciones y variaciones entre recitadores (qira'at) a escala.
- Despliegue en el borde (edge): con 114,6 millones de parametros y pesos en FP16 de aproximadamente 230 MB, puede ejecutarse en GPUs de consumo e incluso en CPU para transcripcion offline por lotes, algo inviable con modelos ASR de miles de millones de parametros.

## Benchmarks y rendimiento

Unico resultado publicado por el autor (marcado como no verificado):

| Metrica | Dataset | Valor | Verificado |
|---|---|---|---|
| Word Error Rate (WER) | tarteel-ai/everyayah (validacion) | 0,0014 (0,14 %) | No |

Evolucion del WER durante el ajuste por fases, declarada en la model card:

| Fase | Capas descongeladas | Pasos | Learning rate | WER de validacion |
|---|---|---|---|---|
| Fase 1 | Top 3 del encoder + decoder | 2000 | 5e-5 | 0,0038 |
| Fase 2 | Bloques 9-17 + decoder | 3000 | 1e-4 | 0,0018 |
| Fase 3 | Todas las capas | 2500 | 5e-5 | 0,0014 |

No se han publicado resultados de benchmarks comparativos con otros modelos (MLS, Common Voice, FLEURS, MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32, 0,3 GB en FP16/BF16 y menos de 0,2 GB en int8 para los 114,6 millones de parametros. El repositorio en disco ocupa 4,1 GB porque el checkpoint .nemo incluye pesos y metadatos de entrenamiento.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM. El propio autor realizo el ajuste fino completo en una RTX 4070 Ti de 12 GB, por lo que la inferencia es holgada en RTX 3060, RTX 4060, RTX 4070, RTX 4090, A10, L4 o superiores. En A100 y H100 el modelo queda muy sobredimensionado por GPU; tiene mas sentido ejecutar varias instancias en paralelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU NVIDIA moderna con 4 GB o mas, y tambien en CPU para transcripcion offline.
- Opciones de despliegue: NVIDIA NeMo (nemo_toolkit[asr]) es la via documentada, con transcribe() para offline y cache_aware_stream_step() para streaming. El repositorio incluye un script complementario con entrada de microfono, deteccion de silencio, callbacks por palabra y servidor FastAPI con WebSocket. NeMo permite exportacion a ONNX y despliegue con NVIDIA Riva o Triton, aunque no se documenta ningun procedimiento de exportacion especifico en la informacion disponible. No hay soporte de llama.cpp, Ollama, vLLM ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no se publican mediciones. Como referencia de diseno, el ejemplo de streaming usa fragmentos de 1600 ms y una ventana de lookback de 128 frames (aproximadamente 10 s) en modo causal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastconformer-quran-ar (este modelo) | 114,6 M | Bilateral completo (offline) / 128 frames causales (streaming) | Arabe coranico con tashkeel | CC-BY-4.0 | HuggingFace, NeMo |
| nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0 | 114,6 M | Bilateral completo | Arabe general (ASR multiuso) | No disponible en la informacion proporcionada | HuggingFace, NeMo |
| Whisper large-v3 (OpenAI) | 1550 M | Ventana de 30 s | Multilingue (99 idiomas), ASR generico | MIT | HuggingFace, OpenAI, multiples runtimes |
| Otros modelos ASR especificos de Coran | No disponible | No disponible | Arabe coranico | No disponible | No disponible |

Nota: los datos de Whisper large-v3 corresponden a conocimiento general publico y no proceden de la informacion proporcionada en esta busqueda, por lo que no se han verificado aqui. No se dispone de cifras de WER comparables entre estos modelos en un mismo conjunto de evaluacion, ya que el autor solo publica resultados sobre tarteel-ai/everyayah.

## Limitaciones y advertencias

- El WER de 0,14 % esta declarado por el autor y marcado explicitamente como no verificado. Es un valor excepcionalmente bajo para ASR, lo que sugiere un posible solapamiento entre los splits de entrenamiento y validacion de tarteel-ai/everyayah; conviene evaluarlo de forma independiente antes de asumir ese rendimiento.
- No hay resultados en ningun otro conjunto de evaluacion, por lo que se desconoce la generalizacion a recitadores, calidades de audio o estilos no presentes en el corpus de ajuste.
- El modelo esta especializado exclusivamente en arabe coranico. Es previsible un rendimiento degradado en arabe estandar moderno, dialectos arabes (egipcio, levantino, magrebi, golfo) y en cualquier otro idioma.
- Aunque no se documenta explicitamente, un modelo ASR ajustado sobre texto coranico puede introducir sesgos de dominio: forzar la salida hacia formulaciones coranicas conocidas cuando el audio es ambiguo o pertenece a otro dominio.
- Riesgo de alucinacion en sentido ASR: sustitucion de palabras poco claras por fragmentos coranicos plausibles, especialmente con audio ruidoso, multiple hablante o recitacion no estandar.
- La model card no documenta el tratamiento de silencios largos, solapamiento de hablantes ni segmentacion de multiples recitadores en un mismo archivo.
- Licencia CC-BY-4.0: permite uso comercial y modificacion, pero exige atribucion al autor y al modelo base de NVIDIA. Ademas, el uso del modelo base nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0 puede estar sujeto a sus propias condiciones, que no se detallan en la informacion disponible.
- Inconsistencia detectada en la propia model card: el codigo de ejemplo carga el modelo desde el identificador "mohammed/fastconformer-quran-ar", mientras que el repositorio real es "msyukriafifi/fastconformer-quran-ar". Hay que corregir la ruta en from_pretrained para que la carga funcione.
- El modelo tiene cero descargas y cero valoraciones, por lo que no existe validacion por parte de la comunidad ni soporte conocido.
- El proceso de streaming requiere una secuencia de configuracion muy fragil (reenvio del padding convolucional a simetrico antes del cambio de modo, cambio a rel_pos_local_attn, padding causal, decodificacion greedy con use_cuda_graph_decoder desactivado). Saltarse u ordenar mal estos pasos produce resultados incorrectos sin aviso.
- La model card aparece truncada en la seccion de ejemplos cualitativos, por lo que no se pueden revisar completos los pares referencia/prediccion.
- No se documentan tipos de cuantizacion ni rutas de exportacion a GGUF u ONNX, lo que limita el despliegue fuera del ecosistema NeMo.
- Fechas de creacion y actualizacion del repositorio (16 de septiembre de 2026) y ausencia total de actividad posterior: no hay garantia de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/msyukriafifi/fastconformer-quran-ar
- Modelo base: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0
- Dataset de ajuste y evaluacion: https://huggingface.co/datasets/tarteel-ai/everyayah
- Script complementario de streaming con FastAPI y WebSocket: https://huggingface.co/mohammed/fastconformer-quran-ar/blob/main/quran_streaming_asr.py
- NVIDIA NeMo (framework de ejecucion): https://github.com/NVIDIA/NeMo
- Busqueda web: no se han encontrado enlaces relevantes sobre este modelo. Los resultados devueltos corresponden a un portal de noticias aleman (t-online.de) y no guardan ninguna relacion con el modelo ni con ASR en arabe.
