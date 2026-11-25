# ali10x/ovoz-stt-v1-220m

## Resumen

Ovoz STT v1 220M es un modelo de reconocimiento automatico del habla (ASR) especializado en uzbeko, desarrollado por ali10x bajo la marca OvozAI. Se construye mediante fine-tuning del modelo GigaAM Multilingual 220M de ai-sage, un modelo CTC de la familia GigaAM (GigaChat Team), sobre aproximadamente 1.600 horas de audio en uzbeko. El resultado es un sistema que transcribe uzbeko en escritura latina, con mayusculas y puntuacion, y que se distribuye tanto en formato PyTorch como en ONNX, incluyendo una variante cuantizada a 8 bits que se ejecuta en el navegador.

El modelo aborda un problema concreto: la escasez de sistemas ASR de calidad para uzbeko, una lengua de unos 35 millones de hablantes con recursos limitados en herramientas de voz. Frente al modelo base, Ovoz STT v1 reduce el error de palabra (WER) de forma notable en dominios espontaneos y conversacionales, manteniendo un tamano compacto de 220 millones de parametros que permite inferencia en CPU y en el navegador.

Su relevancia practica radica en la combinacion de licencia Apache-2.0, pesos ONNX ligeros (235 MB en int8) y velocidad de inferencia (62x tiempo real en un Apple M2 Pro), lo que lo hace desplegable en entornos con recursos limitados y en aplicaciones web sin infraestructura GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC sobre encoder de la familia GigaAM (transformer, segun modelo base) |
| Parametros totales | 220M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como contexto de texto; entrenado con clips de hasta 30 s, uso recomendado de hasta ~25 s |
| Tipos de cuantizacion | float32 (PyTorch y ONNX), int8 (ONNX) |
| Idiomas soportados | uzbeko (uz) |
| Licencia | Apache-2.0 (modelo); MIT para el modelo base y `modeling_gigaam.py` |
| Formato de pesos | safetensors/PyTorch (via transformers) y ONNX (`features.onnx`, `ctc.onnx`, `ctc.int8.onnx`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura CTC sobre el encoder de GigaAM Multilingual 220M. La salida es una secuencia de log-probabilidades sobre un vocabulario de 59 caracteres mas el token blank de CTC (indice 59), que se decodifica de forma greedy: argmax por paso, fusion de repeticiones y eliminacion del blank. El frontend de caracteristicas (`features.onnx`) produce 64 dimensiones por frame a partir de audio mono a 16 kHz.

El entrenamiento consistio en un fine-tuning sobre aproximadamente 1.600 horas de voz en uzbeko, seguido de un promediado 50/50 con los pesos publicados del modelo base y un reentrenamiento de la capa de salida. No se especifican en la informacion disponible detalles sobre el dataset (composicion, hablantes, dominios), el uso de RLHF/DPO ni innovaciones adicionales mas alla del esquema CTC y la exportacion ONNX optimizada para navegador.

## Capacidades

- Transcripcion de voz a texto en uzbeko con escritura latina, mayusculas y puntuacion.
- Decodificacion CTC greedy sobre vocabulario de 59 caracteres.
- Inferencia en PyTorch mediante `transformers` con `trust_remote_code=True` y metodo `transcribe`.
- Inferencia en ONNX, incluyendo variante int8 de 235 MB apta para WebAssembly en navegador.
- Procesamiento de clips de hasta aproximadamente 25-30 s; se recomienda segmentar grabaciones largas en pausas.
- Ejecucion en CPU con velocidad de 62x tiempo real en Apple M2 Pro con 4 hilos (nativa) y 13x en Chrome con WebAssembly.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada mas alla del ASR ni modo de razonamiento.

## Casos de uso

- Transcripcion de podcasts y contenido de YouTube en uzbeko: el modelo muestra mejoras marcadas en dominios conversacionales (WER de 31,5 % en podcasts frente a 48,3 % del base), por lo que es adecuado para generar subtitulos y transcripciones de material espontaneo.
- Subtitulado de noticias y contenido informativo: con un WER de 12,3 % en YouTube news, permite generar subtitulos con calidad utilizable en produccion para medios en uzbeko.
- Aplicaciones web de dictado en el navegador: la variante ONNX int8 (235 MB) se ejecuta en Chrome via WebAssembly a 13x tiempo real, lo que habilita dictado o busqueda por voz sin backend.
- Atencion al cliente por voz: la transcripcion de llamadas en uzbeko permite alimentar sistemas de analisis de conversaciones o enrutamiento automatico, segmentando el audio en clips de hasta 25 s.
- Documentacion clinica o legal dictada: el modelo transcribe con mayusculas y puntuacion, lo que reduce el post-procesado necesario para integrar el texto en sistemas de registro.
- Investigacion linguistica y creacion de corpus: permite transcribir grandes volumenes de audio en uzbeko a bajo coste, dado que corre en CPU y con licencia permisiva.
- Integracion en pipelines de accesibilidad: generacion de subtitulos en directo o diferidos para plataformas de video dirigidas a hablantes de uzbeko.

## Benchmarks y rendimiento

Word error rate (%), texto normalizado (minusculas, sin puntuacion):

| Sistema | Benchmark | YouTube podcasts | YouTube news | YouTube IT | FLEURS | Common Voice | USC |
|---|---|---|---|---|---|---|---|
| GigaAM 220M, tal como se publico | 15,3 | 48,3 | 17,3 | 29,5 | 15,2 | 8,9 | 11,3 |
| Ovoz STT v1 220M | 12,0 | 31,5 | 12,3 | 21,1 | 14,9 | 9,3 | 12,3 |

El benchmark principal es el Uzbek Spontaneous Speech ASR Benchmark (311 clips, 2 h). La variante ONNX int8 obtiene 11,85 % en ese benchmark ejecutandose en Chrome.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 220M de parametros, la inferencia en float32 requiere aproximadamente 0,9 GB de pesos y en int8 unos 0,24 GB, mas memoria de activaciones.
- GPU recomendadas: no se especifican; el modelo esta disenado para ejecucion en CPU.
- Cabe en GPU de consumo: si, por tamano (cualquier GPU con al menos 2 GB de memoria libre en float32, menos en int8).
- Despliegue: `transformers` (PyTorch, requiere `torch`, `torchaudio`, `hydra-core`, `omegaconf`, `sentencepiece`, `soundfile` y ffmpeg), ONNX Runtime (nativo o WebAssembly en navegador).
- Latencia y throughput: 62x tiempo real en Apple M2 Pro con 4 hilos (ONNX int8 nativo); 13x en Chrome con WebAssembly y 4 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | WER benchmark uzbeko |
|---|---|---|---|---|---|
| Ovoz STT v1 220M | 220M | clips hasta ~30 s | uzbeko | Apache-2.0 | 12,0 |
| GigaAM Multilingual 220M (base) | 220M | clips hasta ~30 s | multilingue | MIT | 15,3 |
| Otros ASR multilingues (Whisper, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo permite comparar de forma directa con el modelo base GigaAM Multilingual 220M, del que Ovoz STT v1 mejora el WER en todos los dominios salvo Common Voice (9,3 frente a 8,9) y USC (12,3 frente a 11,3).

## Limitaciones y advertencias

- Solo soporta uzbeko; no se documenta cobertura de otras lenguas.
- Entrenado con clips de hasta 30 s; para audio mas largo es necesario segmentar en pausas, ya que la memoria de atencion crece con el cuadrado de la longitud.
- El WER en dominios espontaneos sigue siendo alto (31,5 % en podcasts), lo que limita su uso en produccion sin revision humana en esos casos.
- Riesgo de alucinacion y errores en nombres propios, terminos tecnicos y audio con ruido o acentos no representados en el dataset de entrenamiento.
- No se documentan sesgos especificos ni la composicion del dataset de 1.600 horas, lo que impide evaluar su representatividad.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y `modeling_gigaam.py` estan bajo MIT con atribucion a GigaChat Team; conviene conservar los avisos de licencia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion externa de la comunidad.
- No se han publicado datos sobre robustez ante ruido, code-switching ni calidad en hablantes no nativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ali10x/ovoz-stt-v1-220m
- Demo en navegador: https://ovozai.uz/stt-v1
- Modelo base: https://huggingface.co/ai-sage/GigaAM-Multilingual
- Benchmark de referencia: https://huggingface.co/datasets/rustam1221/uzbek-asr-benchmark-spontaneous
