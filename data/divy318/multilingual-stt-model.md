# divy318/multilingual-stt-model

## Resumen

`divy318/multilingual-stt-model` es un modelo de reconocimiento automatico del habla (ASR) publicado en Hugging Face por el usuario divy318. Se trata de un fine-tuning del modelo Meta MMS-300M, concretamente sobre la clase `Wav2Vec2ForCTC`, orientado a la transcripcion de audio en tres idiomas: gujarati (`gu`), hindi (`hi`) e ingles (`en`). El modelo cuenta con 315.694.970 parametros y un repositorio de 1,4 GB en formato safetensors.

El modelo se presenta como una solucion "trilingual" para transcripcion de voz, entrenada sobre un corpus declarado de 41,77 horas de audio verificado. Su relevancia radica en cubrir una combinacion linguistica poco frecuente (gujarati-hindi-ingles) dentro del ecosistema open source, aunque los resultados declarados por el propio autor muestran un rendimiento muy desigual entre idiomas, con tasas de error especialmente altas en hindi.

La licencia MIT facilita su integracion en productos comerciales, pero la escasa validacion externa (0 descargas, 0 likes en el momento de la consulta, metricas no verificadas) y los valores de WER reportados aconsejan tratarlo como un modelo experimental o de prototipado mas que como una solucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (fine-tuning de Meta MMS-300M) |
| Parametros totales | 315.694.970 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo CTC sobre audio; la ventana depende de la longitud de la senal de entrada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de PyTorch, no documentada por el autor) |
| Idiomas soportados | gujarati (`gu`), hindi (`hi`), ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Wav2Vec2 en su variante para CTC (`Wav2Vec2ForCTC`), un transformer convolucional que procesa audio en bruto a 16 kHz y emite directamente la secuencia de tokens mediante clasificacion por fotograma con Connectionist Temporal Classification. Parte del checkpoint Meta MMS-300M (Massively Multilingual Speech), un modelo multilingue preentrenado por Meta, y ha sido ajustado por el autor sobre un corpus propio.

Segun la model card, el fine-tuning se realizo sobre 41,77 horas de audio trilingue verificado, distribuidas en 16,90 horas de gujarati, 11,32 horas de hindi y 13,55 horas de ingles. No se documentan detalles sobre la composicion exacta del dataset, el preprocesado, la estrategia de aumentacion de datos, la tasa de aprendizaje ni el numero de epocas. Tampoco se indica si hubo etapas de RLHF, DPO u otro tipo de alineacion, algo poco habitual en modelos ASR. No se declaran innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico del habla (ASR) en gujarati, hindi e ingles con un unico modelo.
- Transcripcion de audio mono a 16 kHz en formato float32.
- Salida a nivel de caracter (CTC), lo que permite decodificacion greedy o con corrector lexico externo.
- No soporta tool calling ni function calling.
- No esta orientado a agentes ni a razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio generativo (es exclusivamente entrada de audio, salida de texto).
- Capacidad multilingue limitada a los tres idiomas declarados; no se documenta deteccion automatica de idioma.

## Casos de uso

- Transcripcion de reuniones internas en equipos con personal que alterna gujarati, hindi e ingles: el modelo puede procesar audio mono a 16 kHz y devolver texto plano, adecuado para generar actas automaticas, aunque el WER declarado en hindi (140%) limita su fiabilidad sin revision humana.
- Subtitulado de contenido audiovisual para comunidades gujarati-parlantes: el CER relativamente bajo en gujarati (13,16%) permite generar subtitulos con correccion posterior, integrable en pipelines con `transformers` y `soundfile`.
- Prototipado rapido de asistentes de voz en centros de atencion al cliente de India occidental: al ser un modelo de 316 M de parametros y licencia MIT, puede desplegarse en infraestructura modesta para validar flujos conversacionales antes de invertir en modelos comerciales.
- Investigacion academica sobre ASR de bajos recursos: sirve como baseline reproducible para comparar tecnicas de fine-tuning sobre MMS-300M en lenguas indoarias.
- Generacion de transcripciones para analisis de sentimiento o mineria de texto en call centers: la salida CTC puede alimentar pipelines NLP posteriores, siempre con un paso de correccion ortografica.
- Digitalizacion de archivos orales en gujarati e hindi para bibliotecas y archivos historicos: el modelo permite un primer borrador de transcripcion que un revisor humano refina, reduciendo el coste frente a la transcripcion manual integra.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados externamente, `verified: false`):

| Idioma | CER limpio | WER limpio | Horas de audio |
|---|---|---|---|
| Gujarati (`gu`) | 13,16% | 83,33% | 16,90 |
| Hindi (`hi`) | 30,43% | 140,0% | 11,32 |
| Ingles (`en`) | 13,16% | 62,50% | 13,55 |
| Corpus combinado | 10,30% | 34,12% | 41,77 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Los valores agregados (CER 10,30%, WER 34,12%) proceden del `model-index` y no se especifica la metodologia de calculo ni el conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos, mas activaciones; en la practica cabe en cualquier GPU con 4 GB o mas.
- En fp16 o bf16, el modelo ocupa alrededor de 650 MB de pesos, por lo que es desplegable en GPUs consumer de gama media y baja.
- GPUs recomendadas: NVIDIA T4, RTX 3060, RTX 4090, A10, L4; tambien es viable en CPU para audio de duracion corta.
- Cabe en GPUs consumer como GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: `transformers` con PyTorch (via `Wav2Vec2ForCTC`), ONNX Runtime, o servidores de inferencia que soporten modelos de audio (no se documenta soporte explicito en vLLM ni TGI, orientados a LLMs).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `divy318/multilingual-stt-model` | 315,7 M | gu, hi, en | audio 16 kHz | MIT | Hugging Face |
| Meta MMS-300M (modelo base) | 315,7 M | ~1100 idiomas | audio 16 kHz | CC-BY-NC 4.0 | Hugging Face (`facebook/mms-300m`) |
| Whisper small | ~244 M | ~99 idiomas | audio 16 kHz | MIT | Hugging Face / OpenAI |
| Whisper medium | ~769 M | ~99 idiomas | audio 16 kHz | MIT | Hugging Face / OpenAI |

El modelo hereda el tamano de MMS-300M pero restringe los idiomas a tres, lo que en teoria deberia mejorar la precision en esos idiomas frente al modelo base, si bien no se aportan comparaciones directas. Frente a Whisper small o medium, el modelo de divy318 es mas ligero que Whisper medium y comparte licencia MIT, pero carece de la madurez, el soporte comunitario y las evaluaciones publicas de la familia Whisper. No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Los valores de WER declarados son muy elevados en hindi (140%) e ingles (62,5%), lo que sugiere problemas serios de decodificacion o de tokenizacion; el modelo no es fiable para produccion en esos idiomas sin revision humana.
- Las metricas no estan verificadas (`verified: false`) y no se detalla el conjunto de evaluacion, por lo que pueden no ser representativas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa ni issues reportados.
- No se documenta el origen, la calidad ni la licencia del corpus de entrenamiento (41,77 horas), lo que plantea dudas sobre posibles sesgos de dominio, acento o genero.
- Riesgo de alucinacion y de errores sistematicos en audio con ruido, acentos no representados o cambios de idioma dentro de una misma locucion (code-switching gu/hi/en no documentado).
- No se especifica deteccion automatica de idioma; el usuario debe conocer el idioma del audio o probar decodificaciones.
- Aunque la licencia es MIT, el modelo base MMS-300M de Meta tiene licencia CC-BY-NC 4.0; conviene verificar la compatibilidad legal del fine-tuning para uso comercial, ya que el autor no aclara este punto.
- No hay informacion sobre cuantizacion, latencia ni despliegue en produccion, lo que dificulta planificar SLA.
- El nombre del repositorio incluye la palabra "Proprietary" en la model card pese a la licencia MIT, una inconsistencia que conviene aclarar con el autor antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divy318/multilingual-stt-model
- Modelo base Meta MMS-300M: https://huggingface.co/facebook/mms-300m
- Paper MMS (Massively Multilingual Speech, Meta AI): https://arxiv.org/abs/2305.13516
- Documentacion de `Wav2Vec2ForCTC` en Transformers: https://huggingface.co/docs/transformers/model_doc/wav2vec2
- Repositorio de Transformers: https://github.com/huggingface/transformers
