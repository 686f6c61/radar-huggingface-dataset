# labhamlet/speech-jepa-base-asr-100h

## Resumen

Speech-JEPA Base ASR 100h es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el usuario labhamlet, consistente en un encoder Speech-JEPA Base preentrenado de forma autosupervisada (sin etiquetas) sobre 960 horas de LibriSpeech y posteriormente afinado con CTC a nivel de caracter sobre las 100 horas de `train-clean-100` (28.539 enunciados). El resultado es un modelo de 89,7 millones de parametros que transcribe audio en ingles muestreado a 16 kHz y que se distribuye bajo licencia BSD-3-Clause.

La relevancia del modelo reside en su enfoque: emplea el paradigma JEPA (Joint Embedding Predictive Architecture) aplicado al habla, en lugar de los objetivos de enmascaramiento predictivo token a token tipicos de wav2vec 2.0 o HuBERT. Esto lo convierte en una pieza interesante para investigar representaciones autosupervisadas de audio y su transferencia a tareas de transcripcion con pocos datos etiquetados, ya que el autor publica una familia de checkpoints afinados con 10 minutos, 1 hora, 10 horas y 100 horas de datos etiquetados.

Arquitectonicamente sigue la estela de wav2vec 2.0 Base (encoder convolucional de caracteristicas mas transformer, salida CTC), pero con el objetivo de preentrenamiento propio de Speech-JEPA. No es un modelo de produccion generalista: es una publicacion de investigacion con cero descargas y sin benchmarks publicados en la informacion disponible, orientada a experimentacion reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speech-JEPA (encoder convolucional de caracteristicas + transformer, cabeza CTC); preentrenamiento autosupervisado tipo JEPA |
| Parametros totales | 89.674.525 (89,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio a 16 kHz; una trama de salida cada 20 ms) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`model.safetensors`), codigo custom en Python (`modeling_speech_jepa.py`, `configuration_speech_jepa.py`) |

## Arquitectura y entrenamiento

El modelo parte de Speech-JEPA Base, un encoder preentrenado sin etiquetas sobre audio de 16 kHz de LibriSpeech (960 horas, 375.000 actualizaciones). El objetivo de preentrenamiento es de tipo JEPA: predecir representaciones en un espacio latente en lugar de reconstruir la entrada, siguiendo la filosofia de las arquitecturas de embedding predictivo conjunto. La arquitectura de inferencia es la clasica de ASR autosupervisado: un extractor convolucional de caracteristicas seguido de un transformer y una cabeza lineal CTC que emite 29 clases (26 letras mayusculas, apostrofo, `|` como frontera de palabra y `<pad>` en el indice 0 como blank de CTC).

El afinamiento se realizo sobre LibriSpeech `train-clean-100` con 80.000 actualizaciones, Adam con betas (0,9, 0,98), learning rate pico de 3e-05 y schedule tri-fase (10% warm-up, 40% constante, 50% decaimiento). El transformer permanecio congelado durante las primeras 10.000 actualizaciones y el encoder de caracteristicas estuvo congelado siempre. Se aplico enmascaramiento temporal (`mask_time_prob=0.05`, spans de 10 tramas) y de canales (`mask_feature_prob=0.008`, spans de 64 canales), dropout de 0,1 en la cabeza CTC y en atencion/activacion/hidden, LayerDrop 0,05, batch de hasta 480 s de audio en una sola GPU con precision mixta bf16. La seleccion del checkpoint se hizo por menor WER greedy en `dev-other`. Como en wav2vec 2.0 Base, la primera convolucion usa normalizacion de grupo sobre el tiempo, por lo que el padding excesivo altera ligeramente la salida.

## Capacidades

- Reconocimiento automatico del habla en ingles con salida CTC a nivel de caracter (no usa subpalabras BPE).
- Transcripcion de audio mono a 16 kHz con normalizacion por enunciado.
- Procesamiento por lotes con `padding=True`; la `attention_mask` permite ignorar muestras rellenadas y decodificar las tramas de padding como blank.
- Decodificacion greedy mediante `argmax` sobre los logits y `batch_decode` del procesador.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: es un modelo puramente acustico de transcripcion.
- No tiene capacidades de vision, audio generativo ni traduccion.
- Multilingue: no; solo ingles.

## Casos de uso

- Investigacion en representaciones autosupervisadas del habla: comparar el objetivo JEPA frente a wav2vec 2.0 o HuBERT en la misma tarea y con el mismo presupuesto de datos etiquetados, usando la familia de checkpoints (10 min, 1 h, 10 h, 100 h) para trazar curvas de aprendizaje.
- Transcripcion de audio en ingles en entornos controlados: dictado de notas de voz o reuniones con audio limpio a 16 kHz, donde un modelo de 89,7 M ofrece una huella de memoria pequena y despliegue sencillo.
- Generacion de transcripciones para corpus de investigacion: procesar colecciones de audio en ingles muestreadas a 16 kHz para construir datasets de texto alineado, con la ventaja de una licencia permisiva BSD-3-Clause.
- Baseline en experimentos de destilacion o adaptacion de dominio: al ser un checkpoint pequeno y con codigo custom incluido, sirve como punto de partida para fine-tuning adicional sobre dominios especificos (medico, legal, llamadas) con pocas horas etiquetadas.
- Evaluacion de tecnicas de enmascaramiento y congelacion de capas: la configuracion de fine-tuning documentada (transformer congelado 10.000 pasos, encoder de caracteristicas siempre congelado) permite reproducir y variar ablaciones de forma controlada.
- Prototipado educativo de pipelines CTC con Hugging Face Transformers: el ejemplo de uso con `AutoModelForCTC` y `Wav2Vec2Processor` y `trust_remote_code=True` sirve para demostrar el flujo completo de audio a texto sin dependencias pesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la seleccion del checkpoint se baso en el menor WER greedy en `dev-other`, pero no proporciona el valor numerico ni resultados en `test-clean`/`test-other` ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,4 GB en fp32 para los pesos (89,7 M de parametros); con activaciones y overhead de runtime, menos de 2 GB para audio de duracion tipica.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el modelo se entreno en una sola GPU con bf16, por lo que una RTX 3060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y superiores.
- Tambien puede ejecutarse en CPU para transcripciones de audio corto, aunque con mayor latencia.
- Opciones de despliegue: Hugging Face Transformers con `AutoModelForCTC` y `trust_remote_code=True` (requiere el codigo custom del repositorio). No se han publicado integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no existir variantes GGUF no es directamente compatible con llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada. La salida es de una trama cada 20 ms de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| labhamlet/speech-jepa-base-asr-100h | 89,7 M | audio 16 kHz, trama cada 20 ms | en | BSD-3-Clause | Objetivo JEPA; CTC a nivel de caracter; sin benchmarks publicados |
| facebook/wav2vec2-base-960h | 95 M | audio 16 kHz | en | Apache-2.0 (MIT en variantes) | Referencia clasica de ASR autosupervisado; arquitectura y preprocesado casi identicos |
| facebook/hubert-base-ls960 | 95 M | audio 16 kHz | en | Apache-2.0 | Objetivo de prediccion de clusters; mismo pipeline CTC |
| openai/whisper-small | 244 M | audio 16 kHz, ventana de 30 s | multilingue | MIT | Modelo encoder-decoder seq2seq; mayor tamano pero cobertura multilingue |

La comparativa se limita a caracteristicas estructurales: no hay datos de WER publicados para Speech-JEPA en la informacion disponible que permitan una comparacion cuantitativa con wav2vec 2.0, HuBERT o Whisper.

## Limitaciones y advertencias

- Solo transcribe ingles; no soporta otros idiomas ni traduccion.
- Requiere audio muestreado a 16 kHz y normalizado por enunciado; otra frecuencia o normalizacion degrada la salida.
- El padding excesivo altera ligeramente la salida por la normalizacion de grupo de la primera convolucion; se recomienda agrupar audios de duracion similar o transcribir de uno en uno.
- Vocabulario restringido a mayusculas, apostrofo y frontera de palabra: no genera puntuacion, numeros en cifra ni minusculas.
- Riesgo de alucinacion y errores en audio con ruido, acentos no vistos o solapamiento de hablantes; no se han publicado evaluaciones de robustez.
- Sesgos desconocidos: no se documenta composicion demografica del corpus de entrenamiento (LibriSpeech son audiolibros en ingles, predominantemente habla leida).
- Modelo de investigacion con cero descargas y sin benchmarks publicados: no hay evidencia de calidad en produccion.
- La licencia BSD-3-Clause permite uso comercial, pero exige conservar el aviso de copyright y la clausula de no endorsement; conviene revisar los terminos de LibriSpeech como dataset de origen.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del autor del repositorio; auditar `modeling_speech_jepa.py` antes de desplegar en produccion.
- No hay variantes cuantizadas ni soporte en runtimes de inferencia de alto rendimiento (vLLM, TGI, llama.cpp).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labhamlet/speech-jepa-base-asr-100h
- Modelo base preentrenado: https://huggingface.co/labhamlet/speech-jepa-base
- Checkpoint 10 minutos: https://huggingface.co/labhamlet/speech-jepa-base-asr-10min
- Checkpoint 1 hora: https://huggingface.co/labhamlet/speech-jepa-base-asr-1h
- Checkpoint 10 horas: https://huggingface.co/labhamlet/speech-jepa-base-asr-10h
- Codigo y recetas: https://github.com/labhamlet/SpeechJEPA
- Dataset de afinamiento: https://huggingface.co/datasets/openslr/librispeech_asr
