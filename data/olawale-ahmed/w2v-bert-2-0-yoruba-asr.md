# olawale-ahmed/w2v-bert-2.0-yoruba-asr

## Resumen

w2v-bert-2.0-yoruba-asr es un modelo de reconocimiento automatico del habla (ASR) obtenido mediante fine-tuning de facebook/w2v-bert-2.0, el modelo preentrenado multilingue de Meta basado en la combinacion de Wav2Vec 2.0 y arquitectura BERT para representaciones de audio. Lo publica el usuario olawale-ahmed en Hugging Face y esta orientado especificamente al yoruba, una lengua nigero-congolesa hablada por mas de 45 millones de personas principalmente en Nigeria y Benin.

El modelo resuelve la transcripcion de audio a texto en yoruba, un idioma con recursos limitados en comparacion con lenguas europeas, donde los sistemas ASR comerciales suelen tener un rendimiento pobre. Con 605,7 millones de parametros, el modelo parte de un backbone preentrenado con cientos de miles de horas de audio multilingue y anade una cabeza de clasificacion CTC ajustada al vocabulario del yoruba.

Es relevante ahora porque el ecosistema de modelos ASR especificos para lenguas africanas sigue siendo escaso y este checkpoint, aunque con un WER de 0,4719 en su conjunto de evaluacion, representa un punto de partida abierto (licencia MIT) para investigadores que trabajen en ASR de bajos recursos. La model card es autocontenida y generada automaticamente por el Trainer, lo que implica que faltan detalles sobre el dataset de entrenamiento y las condiciones de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | W2v-BERT (Wav2Vec 2.0 + BERT), encoder transformer con preentrenamiento contrastivo y enmascarado, cabeza CTC para ASR |
| Parametros totales | 605.727.601 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada dependiente del muestreo, tipicamente segmentos de hasta 30 s en la practica) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica de PyTorch, no documentada por el autor) |
| Idiomas soportados | yoruba (objetivo); el backbone base es multilingue pero el fine-tuning es especifico |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 4,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura W2v-BERT de facebook/w2v-bert-2.0: un encoder transformer que combina el preentrenamiento contrastivo de Wav2Vec 2.0 con el enmascarado tipo BERT sobre representaciones de audio discretizadas. Sobre este backbone se anade una cabeza lineal de clasificacion CTC para producir secuencias de tokens a partir de las representaciones acusticas. El checkpoint final contiene 605,7 millones de parametros, coherente con el tamano del modelo base.

El fine-tuning se realizo con el Trainer de Hugging Face usando AdamW con betas (0,9; 0,999), learning rate de 5e-5, scheduler lineal con 500 pasos de warmup, batch efectivo de 32 (batch de 8 con 4 pasos de acumulacion), precision mixta nativa AMP, semilla 42 y 10 epocas configuradas. El entrenamiento se detuvo en el paso 900 (epoca 0,4729), lo que sugiere early stopping o un limite de pasos. No se especifica el dataset de entrenamiento ni su composicion, ni si hubo aumentacion de datos o tecnicas de regularizacion adicionales. Las versiones de framework son Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR) en yoruba: transcripcion de audio a texto con salida CTC.
- Procesamiento de audio mono a 16 kHz (frecuencia de muestreo estandar de los modelos Wav2Vec 2.0 y W2v-BERT).
- Manejo de habla continua sin segmentacion manual previa, siempre que los segmentos se ajusten a la ventana de entrada del encoder.
- No dispone de capacidades de generacion de texto, razonamiento, codigo ni matematicas: es un modelo puramente acustico.
- No soporta tool calling, function calling ni comportamiento agentico.
- No soporta vision ni audio multimodal mas alla del ASR.
- Capacidad multilingue limitada al yoruba tras el fine-tuning; el backbone base era multilingue pero el ajuste lo especializa.

## Casos de uso

- Transcripcion de archivos de audio en yoruba para medios de comunicacion: el modelo convierte entrevistas, podcasts o programas de radio en texto indexable, aprovechando el backbone preentrenado con audio multilingue para manejar variacion acustica.
- Subtitulado automatico de videos en yoruba: integrado en un pipeline con ffmpeg para extraer audio a 16 kHz y el pipeline `automatic-speech-recognition` de Transformers, genera subtitulos con marcas de tiempo mediante `return_timestamps=True`.
- Investigacion linguistica y corpus orales: permite construir corpus transcritos de yoruba a partir de grabaciones de campo, facilitando estudios fonologicos y morfologicos a escala.
- Atencion al cliente en centros de contacto nigerianos: transcripcion de llamadas para analitica de calidad y busqueda de texto, aunque el WER actual exige revision humana.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en tiempo casi real de contenido hablado en yoruba, con latencia dependiente del hardware.
- Punto de partida para fine-tuning adicional: al tener licencia MIT y pesos safetensors, sirve como base para adaptar el ASR a variantes dialectales del yoruba o a dominios especificos (medico, legal) con datos propios.
- Evaluacion comparativa de ASR de bajos recursos: util como referencia en estudios sobre lenguas africanas con escasez de datos, dado que expone metricas de evaluacion reproducibles.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluacion (no se especifica el dataset):

| Metrica | Valor |
|---|---|
| eval_loss | 0,4871 |
| eval_wer | 0,4719 (47,19 %) |
| eval_runtime | 816,5756 s |
| eval_samples_per_second | 18,645 |
| eval_steps_per_second | 2,332 |
| epoch | 0,4729 |
| step | 900 |

El model-index no contiene resultados adicionales (lista vacia). No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,4 GB solo para pesos (605,7 M de parametros x 4 bytes), mas activaciones y buffers, en torno a 3-4 GB en total.
- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB para pesos, en torno a 2-3 GB con activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060, RTX 4060 o superior es suficiente para inferencia en fp16. Para entrenamiento o fine-tuning se recomienda A100, H100 o RTX 4090 con al menos 16-24 GB.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1660 6 GB, RTX 3050 8 GB, RTX 4090, etc.).
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers, TGI (Text Generation Inference no aplica; usar servicios de inferencia ASR), ONNX Runtime para exportacion, y servidores propios con PyTorch. vLLM y llama.cpp no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: segun la model card, 18,645 muestras por segundo y 2,332 pasos por segundo en el hardware de evaluacion del autor (no especificado). En una GPU consumer moderna se espera procesamiento en tiempo real o mas rapido para segmentos de pocos segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER yoruba | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olawale-ahmed/w2v-bert-2.0-yoruba-asr | 605,7 M | segmentos de audio (tipico 30 s) | 0,4719 (conjunto no especificado) | MIT | Hugging Face |
| facebook/w2v-bert-2.0 | ~580 M (modelo base) | segmentos de audio | no disponible (multilingue, no especifico de yoruba) | MIT | Hugging Face |
| facebook/mms-1b-all | ~1 B (adaptadores por idioma) | segmentos de audio | no disponible en la informacion proporcionada | CC-BY-NC 4.0 | Hugging Face |
| openai/whisper-large-v3 | ~1,55 B | 30 s | no disponible en la informacion proporcionada | MIT | Hugging Face |

La comparacion con Whisper y MMS se ofrece como referencia de categoria ASR multilingue; no se dispone de cifras de WER en yoruba para esos modelos en la informacion proporcionada, por lo que no se pueden establecer comparaciones numericas directas.

## Limitaciones y advertencias

- WER de 0,4719 sobre un conjunto de evaluacion no identificado: casi la mitad de las palabras se transcriben incorrectamente, lo que limita su uso en produccion sin revision humana.
- La model card no documenta el dataset de entrenamiento ni el de evaluacion, lo que impide reproducir los resultados o valorar el sesgo de dominio (registro formal/informal, acento, ruido de fondo).
- El modelo se detuvo en la epoca 0,4729 de 10 configuradas, lo que sugiere un ajuste incompleto o un criterio de parada no explicado; es probable que exista margen de mejora con mas entrenamiento.
- Riesgo de alucinacion en ASR: con CTC, el modelo puede emitir secuencias plausibles pero incorrectas en segmentos de baja calidad acustica, especialmente con ruido o hablantes no vistos.
- Sesgos potenciales derivados del corpus de preentrenamiento multilingue, con posible infrarepresentacion de variedades dialectales del yoruba (egba, ijebu, ekiti, etc.) y de habla femenina o infantil.
- Limitacion de contexto: el encoder W2v-BERT procesa segmentos acusticos; audios muy largos requieren troceado manual o uso de `chunk_length_s`, lo que puede introducir errores en las fronteras.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base (facebook/w2v-bert-2.0, tambien MIT).
- Solo 19 descargas y 0 likes en el momento de la consulta: modelo de baja validacion comunitaria, sin issues ni discusiones que aporten evidencia adicional de calidad.
- No apto para tareas fuera del ASR (generacion, razonamiento, codigo): usarlo fuera de su dominio producira resultados sin sentido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olawale-ahmed/w2v-bert-2.0-yoruba-asr
- Modelo base: https://huggingface.co/facebook/w2v-bert-2.0
- Paper de W2v-BERT (Meta AI): https://arxiv.org/abs/2108.06209
- Repositorio Transformers (pipeline ASR): https://github.com/huggingface/transformers
- Documentacion del pipeline de reconocimiento automatico del habla: https://huggingface.co/docs/transformers/main/en/tasks/asr
