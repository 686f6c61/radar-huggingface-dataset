# oluwagbotty/w2vbert-ky-ft-10ep

## Resumen

w2vbert-ky-ft-10ep es un modelo de reconocimiento automático del habla (ASR) para kinyarwanda, desarrollado por el usuario de Hugging Face oluwagbotty, que parte del modelo badrex/w2v-bert-2.0-kinyarwanda-asr y se ajusta finamente sobre el split de entrenamiento del dataset CDLI Rwandan Kinyarwanda Non-Standard Speech v1.0. El objetivo concreto es mejorar la transcripción de habla no estándar, en particular de personas que tartamudean: los hablantes del corpus son mayoritariamente adultos jóvenes con disfluencias. El trabajo se enmarca en un proyecto de investigación sobre ASR de bajo coste para personas con tartamudeo dentro del Rwanda Innovation Sprint, impulsado por el Centre for Digital Language Inclusion (UCL).

Arquitectónicamente es un Wav2Vec2-BERT, un modelo de representación auto-supervisada de audio con cabecera CTC para reconocimiento de voz, de aproximadamente 580 millones de parámetros. Se distribuye en formato safetensors dentro de la librería transformers y con licencia CC-BY-4.0. El repositorio ocupa 41,8 GB, lo que sugiere la presencia de checkpoints intermedios y estados del optimizador además de los pesos finales, que se encuentran en la carpeta `best/`.

Su relevancia es doble: por un lado, aporta datos de rendimiento sobre ASR en una lengua de bajos recursos como el kinyarwanda; por otro, aborda el habla con tartamudeo, un dominio poco cubierto en los corpus ASR habituales, con métricas explícitas de WER y CER y una discusión honesta de las limitaciones del conjunto de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT con cabecera CTC (ASR) |
| Parametros totales | 580.525.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada dependiente de la longitud de la señal, no documentada en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | kinyarwanda (rw) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (carpeta `best/`) |
| Modelo base | badrex/w2v-bert-2.0-kinyarwanda-asr |
| Dataset de ajuste | cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0 (acceso restringido) |
| Metrica declarada | WER, CER |
| Tamano del repositorio | 41,8 GB |
| Descargas | 93 |
| Fecha de creacion | 2026-11-07 |

## Arquitectura y entrenamiento

El modelo es un Wav2Vec2-BERT, es decir, un encoder transformer que combina el enfoque de enmascaramiento y predicción contrastiva de wav2vec 2.0 con la arquitectura Conformer de BERT para audio. Sobre las representaciones del encoder se aplica una cabeza de clasificación con pérdida CTC para producir la transcripción directamente desde la forma de onda, sin modelo de lenguaje externo ni decodificador autorregresivo. Esta elección tiene una consecuencia práctica relevante que el autor documenta: los modelos CTC no pueden entrar en bucles repetitivos, a diferencia de los decodificadores tipo Whisper, y por eso la columna "Loops" de la tabla de resultados es cero en todos los splits.

El ajuste fino se realizó únicamente sobre el split de entrenamiento del dataset CDLI, con el split de desarrollo empleado para seleccionar el checkpoint y el split de test puntuado una sola vez tras el entrenamiento. Se entrenó hasta 10 épocas con parada temprana sobre el WER de desarrollo (paciencia de 3 evaluaciones), semilla 42, learning rate 2e-5, batch de 16 y evaluación cada 350 pasos. El split `extra` no se utilizó y ningún hablante aparece en más de un split, lo que evita filtración de identidad entre conjuntos. El código de entrenamiento está en `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto, bajo el identificador de experimento `w2vbert-ky-ft-10ep`.

Los datos de entrenamiento proceden del CDLI Non-Standard Speech Dataset (Centre for Digital Language Inclusion, UCL, 2025), financiado por UK International Development a través del programa AT2030 con apoyo de Google.org. Las grabaciones se hicieron en Ruanda en 2026, en interiores con poco ruido, mediante una aplicación de tableta, a partir de indicaciones con imágenes (descripciones libres) y de texto (frases leídas). El dataset no se incluye en el repositorio y su acceso está restringido por los términos de CDLI.

## Capacidades

- Reconocimiento automático del habla en kinyarwanda a partir de audio en formato de onda, con salida de texto mediante decodificación CTC.
- Transcripción de habla no estándar, específicamente de personas que tartamudean, incluyendo repeticiones de sonidos y sílabas cuando aparecen en la transcripción de referencia.
- Manejo de dos modalidades de elicitación: frases leídas y descripciones libres a partir de imágenes.
- Robustez frente a bucles de repetición en la salida, por la naturaleza no autorregresiva del decodificador CTC.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acústico-to-texto.
- No tiene capacidades multimodales más allá del audio de entrada; no procesa visión, vídeo ni texto como entrada.
- No se documentan capacidades de diarización, detección de idioma ni traducción.

## Casos de uso

- Transcripción de entrevistas y testimonios de personas con tartamudeo en kinyarwanda: el modelo se entrenó específicamente sobre este tipo de habla y evita los bucles repetitivos típicos de decodificadores autorregresivos, lo que lo hace adecuado para generar borradores de transcripción que después revise un humano.
- Investigación lingüística sobre disfluencias: permite obtener transcripciones alineadas con un corpus de referencia que escribe literalmente las repeticiones del tartamudeo, útil para estudiar patrones de repetición y comparar con anotaciones manuales.
- Evaluación comparativa de ASR en lenguas de bajos recursos: sirve como punto de referencia con métricas WER y CER publicadas sobre un split de test fijo de 9 hablantes, para comparar futuros modelos de kinyarwanda.
- Accesibilidad en aplicaciones de dictado: integrado en una app de tableta o móvil, puede convertir habla con disfluencias en texto para personas que prefieren escribir mediante voz, siempre que la transcripción se muestre al hablante antes de actuar sobre ella.
- Documentación de campo en proyectos de desarrollo: grabaciones en interiores con poco ruido, como las del corpus original, pueden transcribirse de forma automática para agilizar la anotación posterior por parte de lingüistas.
- Prototipado de pipelines ASR con transformers: el modelo se carga con la librería transformers y una cabeza CTC estándar, lo que facilita su integración en flujos de experimentación y en la evaluación de técnicas de normalización de texto (por ejemplo, el normalizador básico de Whisper o el paso de apóstrofos de CDLI).

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificación greedy, una grabación a la vez, puntuados con el normalizador básico de texto de Whisper y, para la fila CDLI-style, con su paso de apóstrofos. El WER agrupado cuenta todas las palabras juntas; el WER y CER por enunciado son medias sobre grabaciones, cada una limitada al 100%.

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 42,0 | 12,7 | 43,5 | 13,7 | 0 |
| dev (6 hablantes) | 43,0 | 19,3 | 42,1 | 20,3 | 0 |
| test, normalizador estilo CDLI | 39,4 | 12,3 | 41,2 | no disponible | 0 |

El propio autor advierte que, con solo 9 hablantes en test, las diferencias inferiores a unos 3 puntos de WER entre dos modelos no pueden confirmarse estadísticamente. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: alrededor de 2,3 GB solo para los pesos (580,5 M de parámetros), más el estado de activaciones y buffers de audio, que en la práctica elevan el consumo a un rango de 3 a 5 GB según la longitud de las grabaciones y el tamaño de batch.
- En fp16 el peso del modelo baja a aproximadamente 1,2 GB, lo que reduce el requisito total a unos 2-3 GB con activaciones moderadas.
- Cabe en GPU de consumo: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090 lo ejecutan con holgura; también es viable en GPUs de 8 GB como la RTX 3070 o la RTX 4060 con batches pequeños.
- GPU de datacenter recomendadas para throughput alto: A100, H100, L40S o A10G, con ventaja clara al procesar lotes grandes de grabaciones.
- Despliegue: al ser un modelo transformers con safetensors, se puede servir con Text Generation Inference no aplica (no es generativo); las opciones naturales son un servidor propio con transformers, un pipeline de Hugging Face, o exportación a ONNX Runtime para inferencia en CPU. No se documentan integraciones con vLLM ni llama.cpp, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder no autorregresivo con decodificación CTC, la latencia es proporcional a la duración del audio y no al número de tokens generados, lo que en la práctica permite procesar una grabación en un único pase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Rendimiento documentado | Disponibilidad |
|---|---|---|---|---|---|---|
| w2vbert-ky-ft-10ep (este modelo) | 580,5 M | audio, longitud no documentada | kinyarwanda | CC-BY-4.0 | WER test 42,0 % (agrupado), CER 12,7 % | Hugging Face, safetensors |
| badrex/w2v-bert-2.0-kinyarwanda-asr (modelo base) | no disponible | audio | kinyarwanda | no disponible | no disponible en esta ficha | Hugging Face |
| Whisper (variantes pequeñas/medianas) | 39 M - 769 M según variante | audio, ventana de 30 s | multilingüe, incluye kinyarwanda según variante | MIT (según variante) | no disponible para kinyarwanda en esta ficha | Hugging Face, múltiples formatos |
| MMS (Massively Multilingual Speech) de Meta | 300 M - 1 B según variante | audio | más de 1000 lenguas, incluye kinyarwanda | CC-BY-NC-4.0 en algunas variantes | no disponible para kinyarwanda en esta ficha | Hugging Face |

La comparación directa con el modelo base no es posible con los datos disponibles: la model card de este ajuste no incluye los resultados del modelo badrex sobre el mismo split. Tampoco se aportan cifras de Whisper ni de MMS sobre este corpus, y el propio autor advierte que con 9 hablantes de test las diferencias menores de 3 puntos de WER no son concluyentes.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: el test tiene 9 hablantes, mayoritariamente hombres adultos jóvenes, grabaciones en interiores silenciosos y habla leída o descrita a partir de imágenes, no conversacional. El rendimiento en niños, en otras discapacidades del habla, en entornos ruidosos, en audio telefónico o con cambio de código es desconocido.
- Objetivos verbatim: las repeticiones del tartamudeo están escritas en las transcripciones, y los modelos entrenados con ellas pueden escribirlas o no. Los bloqueos y las prolongaciones no son visibles en el texto, de modo que la transcripción no refleja toda la disfluencia.
- Las frases leídas son más fáciles: las oraciones leídas también aparecen en las transcripciones de entrenamiento, por lo que los resultados con indicaciones de imagen son la mejor guía para habla abierta.
- No usar para decisiones sobre personas: el modelo no debe emplearse para diagnosticar o evaluar ninguna condición del habla, identificar hablantes ni en decisiones clínicas, legales o de aplicación de la ley. Los términos de CDLI prohíben reidentificar hablantes y construir voces que imiten a una persona.
- Riesgo de que una transcripción errónea cambie el significado de lo que dijo la persona: el autor recomienda mostrar el texto al hablante antes de actuar sobre él.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero los datos subyacentes de CDLI tienen términos propios y acceso restringido, y no se incluyen en el repositorio; cualquier uso debe respetar ambas capas de condiciones.
- Riesgo de alucinación: aunque el decodificador CTC no genera bucles, puede producir sustituciones y omisiones de palabras, que en este dominio son especialmente sensibles porque afectan a la fidelidad de testimonios personales.
- Cobertura de idioma limitada al kinyarwanda; no se documenta soporte de otras lenguas ni de mezcla de lenguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/w2vbert-ky-ft-10ep
- Modelo base: https://huggingface.co/badrex/w2v-bert-2.0-kinyarwanda-asr
- Dataset de ajuste (acceso restringido): https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Centre for Digital Language Inclusion (UCL): no disponible en la información proporcionada
- Repositorio del proyecto con el código de entrenamiento (`scripts/molab/run_experiments.py`, `experiments/finetune.yaml`): no disponible en la información proporcionada
- Paper o blog del proyecto: no disponible en la información proporcionada
