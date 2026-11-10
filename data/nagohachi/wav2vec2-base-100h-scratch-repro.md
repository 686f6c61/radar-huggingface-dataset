# nagohachi/wav2vec2-base-100h-scratch-repro

## Resumen

wav2vec2-base-100h-scratch-repro es una reproduccion desde cero del modelo wav2vec 2.0 base entrenado con 100 horas de audio de LibriSpeech (train-clean-100), publicada por el usuario nagohachi en Hugging Face. El modelo implementa la arquitectura wav2vec 2.0 original de Baevski et al. (2020) para reconocimiento automatico del habla (ASR) mediante decodificacion CTC, y su proposito principal es servir como referencia reproducible de un entrenamiento de ASR auto-supervisado con recursos limitados.

Con 94,4 millones de parametros y un repositorio de 0,4 GB en formato safetensors, el modelo se posiciona como una alternativa ligera y de codigo abierto (licencia Apache 2.0) para experimentacion e investigacion en ASR en ingles. Su relevancia actual radica en que documenta de forma transparente el proceso de entrenamiento (80.000 actualizaciones, batch efectivo de 1.335 segundos, precision bf16) y publica resultados de WER en los cuatro splits de LibriSpeech, lo que facilita la comparacion con reproducciones previas del mismo autor.

El modelo esta pensado para entornos con recursos computacionales modestos y para validar pipelines de entrenamiento de wav2vec 2.0, no como un sistema de produccion de alta precision. Su WER de 12,7 en test-clean y 38,1 en test-other sin modelo de lenguaje refleja el limite de entrenar solo con 100 horas de audio, frente a las 960 horas del modelo preentrenado de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (transformer convolucional + encoder Transformer) con cabeza CTC |
| Parametros totales | 94.402.973 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada definida por la longitud de la senal, no por tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0 descrita por Baevski et al. (2020): un extractor de caracteristicas convolucional que procesa la forma de onda de audio a 16 kHz, seguido de un encoder Transformer que produce representaciones contextualizadas, y una cabeza de clasificacion CTC para la transcripcion. El entrenamiento se realizo desde cero (scratch) sobre el split train-clean-100 de LibriSpeech, con 80.000 actualizaciones, un batch efectivo de 1.335 segundos de audio, optimizador Adam con beta = (0.9, 0.98) sin weight decay, learning rate de 1e-4 y precision bf16 mixta. La seleccion del checkpoint se hizo por mejor WER en dev-other.

No se documenta en la informacion disponible el numero total de tokens de audio procesados, la composicion exacta del dataset mas alla de LibriSpeech train-clean-100, ni si se aplicaron etapas de fine-tuning con RLHF o DPO (no aplicables a un modelo CTC de ASR). La innovacion principal es la propia reproducibilidad del pipeline: el autor publica los hiperparametros y compara con su reproduccion sobre LS-960, lo que permite aislar el efecto del volumen de datos de entrenamiento en el WER final.

## Capacidades

- Reconocimiento automatico del habla en ingles mediante decodificacion CTC greedy.
- Transcripcion de audio mono a 16 kHz en formato de forma de onda.
- Integracion con la libreria transformers mediante `Wav2Vec2ForCTC` y `Wav2Vec2Processor`.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling ni function calling (no es un modelo de lenguaje generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Reproduccion de experimentos academicos: sirve como punto de partida verificado para replicar el entrenamiento de wav2vec 2.0 con 100 horas de audio y comparar hiperparametros frente a la referencia del autor.
- Validacion de pipelines de ASR: permite comprobar que un pipeline de preprocesado de audio, tokenizacion CTC y decodificacion funciona correctamente antes de escalar a modelos mayores.
- Prototipado de transcripcion en ingles con recursos limitados: al ocupar 0,4 GB y 94 millones de parametros, puede desplegarse en entornos con poca VRAM para pruebas de concepto de transcripcion de reuniones o notas de voz.
- Docencia y formacion: adecuado para explicar el funcionamiento de wav2vec 2.0 y la decodificacion CTC en cursos de procesado de voz, dado su tamano manejable y su licencia permisiva.
- Benchmark de referencia para modelos de ASR ligeros: su WER publicada en los cuatro splits de LibriSpeech permite comparar con otras reproducciones y con modelos preentrenados.
- Investigacion sobre el efecto del volumen de datos: la comparacion con la reproduccion sobre LS-960 del mismo autor permite estudiar como escala el WER al aumentar las horas de entrenamiento.
- Base para fine-tuning en dominios especificos: al ser Apache 2.0 y estar en transformers, puede ajustarse con datos propios en ingles para dominios concretos (call centers, transcripcion medica) partiendo de un modelo ya entrenado en LibriSpeech.

## Benchmarks y rendimiento

Resultados declarados por el autor (decodificacion CTC greedy, sin modelo de lenguaje). La columna "Pre-trained on LS-960" corresponde a la reproduccion del mismo autor sobre 960 horas.

| Split | Este modelo (WER) | Reproduccion LS-960 (WER) |
|---|---:|---:|
| dev-clean | 12,6 | 6,3 |
| dev-other | 35,8 | 15,1 |
| test-clean | 12,7 | 6,5 |
| test-other | 38,1 | 15,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo base (94 millones de parametros); en la practica, el consumo depende de la longitud del audio de entrada y del batch.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4090, A100 o H100 no son necesarias para inferencia, aunque aceleran el procesado por lotes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para audios cortos.
- Opciones de despliegue: transformers (PyTorch), endpoints de Hugging Face; no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a CTC de audio).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Datos de entrenamiento | Contexto | WER test-clean | WER test-other | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| wav2vec2-base-100h-scratch-repro | 94,4 M | LibriSpeech train-clean-100 | no aplica | 12,7 | 38,1 | Apache 2.0 | Hugging Face |
| wav2vec2-base-100h-repro (mismo autor) | no disponible | LibriSpeech LS-960 | no aplica | 6,5 | 15,4 | no disponible | Hugging Face |
| wav2vec 2.0 base original (Baevski et al., 2020) | ~95 M | LibriSpeech LS-960 | no aplica | ~6,5 | ~15,4 | no disponible | Referencia paper |

La comparativa se limita a las reproducciones del mismo autor y al modelo original del paper, ya que no se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para otros idiomas sin fine-tuning.
- WER elevado en test-other (38,1) y dev-other (35,8), lo que limita su uso en produccion con audio ruidoso o con acentos no representados en LibriSpeech.
- Entrenado unicamente con 100 horas de audio, muy por debajo de las 960 horas del modelo de referencia, lo que explica la brecha de rendimiento.
- Riesgo de alucinacion y errores de transcripcion en audio con ruido de fondo, solapamiento de hablantes o vocabulario tecnico no visto.
- Sesgos potenciales heredados de LibriSpeech, que contiene principalmente habla de lectura de audiolibros en ingles estadounidense.
- Sin modelo de lenguaje en la decodificacion, los resultados no incluyen correccion linguistica.
- Licencia Apache 2.0 permite uso comercial, pero el rendimiento limitado hace recomendable fine-tuning antes de un despliegue real.
- No se documentan cuantizaciones ni optimizaciones de despliegue, por lo que el rendimiento en produccion no esta caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/wav2vec2-base-100h-scratch-repro
- Reproduccion del mismo autor sobre LS-960: https://huggingface.co/nagohachi/wav2vec2-base-100h-repro
- Paper wav2vec 2.0 (Baevski et al., 2020): https://proceedings.neurips.cc/paper/2020/hash/92d1e1eb1cd6f9fba3227870bb6d7f07-Abstract.html
- Dataset LibriSpeech: https://huggingface.co/datasets/librispeech_asr
