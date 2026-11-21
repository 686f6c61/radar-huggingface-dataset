# labhamlet/speech-jepa-base-asr-960h

## Resumen

Speech-JEPA Base ASR 960h es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el usuario labhamlet, que aplica el paradigma JEPA (Joint-Embedding Predictive Architecture) al audio. Se trata de un encoder de 89,7 millones de parametros preentrenado de forma auto-supervisada sobre 960 horas de LibriSpeech a 16 kHz y posteriormente ajustado con CTC a nivel de caracter sobre las mismas 960 horas etiquetadas (train-clean-100, train-clean-360 y train-other-500, 281.241 enunciados).

El modelo es relevante porque traslada la idea de prediccion en el espacio latente (en lugar de reconstruir la senal) al dominio del habla, siguiendo la estela de wav2vec 2.0 y HuBERT pero con un objetivo predictivo tipo JEPA. La receta de ajuste fino replica el configuracion base_960h de fairseq para wav2vec 2.0, lo que facilita la comparacion directa con la linea base clasica.

La ficha corresponde a un checkpoint de investigacion con cero descargas y cero likes en el momento de la consulta, publicado en noviembre de 2026. Su interes principal es academico: evaluar si el preentrenamiento JEPA compite con los objetivos contrastivos y de enmascaramiento dominantes en ASR. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speech-JEPA (encoder transformer con objetivo predictivo en espacio latente), cabeza CTC a nivel de caracter |
| Parametros totales | 89.674.525 (89,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz; una trama cada 20 ms) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (con codigo remoto en modeling_speech_jepa.py y configuration_speech_jepa.py) |

## Arquitectura y entrenamiento

El modelo sigue el diseno Speech-JEPA: un encoder que procesa audio muestreado a 16 kHz y aprende representaciones mediante prediccion en el espacio latente, sin reconstruir la forma de onda. El preentrenamiento se realizo sin etiquetas sobre 960 horas de LibriSpeech durante 375.000 actualizaciones; los detalles del objetivo predictivo se remiten al checkpoint base labhamlet/speech-jepa-base.

El ajuste fino para ASR emplea CTC a nivel de caracter con la receta wav2vec 2.0 Base 960h de fairseq. Se realizaron 320.000 actualizaciones con Adam (betas 0,9 y 0,98), learning rate pico de 0,0001 y schedule tri-stage (10% warm-up, 40% constante, 50% decaimiento). El batch equivale a 8 acumulaciones de hasta 200 s de audio por actualizacion en una sola GPU con precision mixta bf16. Se aplico enmascaramiento temporal (mask_time_prob=0,5, spans de 10 tramas, minimo 2 por enunciado) y de canales (mask_feature_prob=0,1, spans de 64 canales) segun el algoritmo de fairseq. El encoder de caracteristicas permanecio congelado durante todo el ajuste y el transformer se entreno desde la primera actualizacion. La seleccion del checkpoint se hizo por menor WER greedy en dev-other. El vocabulario de salida son 26 letras mayusculas, el apostrofo, `|` como frontera de palabra y `<pad>` (indice 0) como blank CTC.

## Capacidades

- Reconocimiento automatico del habla en ingles con salida CTC a nivel de caracter (sin modelo de lenguaje externo en la decodificacion greedy).
- Procesamiento de audio a 16 kHz con normalizacion por enunciado.
- Soporte de entrada por lotes con `padding=True`; las tramas de relleno se decodifican como blank, de modo que un enunciado produce la misma transcripcion en lote que de forma individual.
- Una trama de salida cada 20 ms (50 tramas por segundo de audio).
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No soporta vision, audio generativo ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles: el modelo convierte audio de 16 kHz en texto con marcas de frontera de palabra, adecuado para pipelines internos donde se prioriza un modelo pequeno (89,7 M) y ligero.
- Subtitulado automatico de contenido en ingles: la salida CTC cada 20 ms permite alinear temporalmente las transcripciones con el audio para generar subtitulos sincronizados.
- Investigacion en preentrenamiento auto-supervisado: sirve como punto de comparacion controlado frente a wav2vec 2.0 Base 960h usando la misma receta de ajuste fino, lo que permite aislar el efecto del objetivo JEPA.
- Experimentos de eficiencia en ASR: con 89,7 M de parametros y pesos en safetensors, es viable para prototipos en GPU de consumo y para estudiar tecnicas de cuantizacion y destilado.
- Generacion de datasets etiquetados: puede transcribir grandes volumenes de audio en ingles para crear corpus pseudo-etiquetados que alimenten otros entrenamientos.
- Evaluacion de robustez acustica: al ser un checkpoint de investigacion con receta publicada, es util para reproducir experimentos de enmascaramiento temporal y de canales en condiciones controladas.
- Integracion en pipelines de Hugging Face Transformers: se carga con `AutoModelForCTC` y `AutoProcessor` con `trust_remote_code=True`, lo que facilita su inclusion en flujos existentes de la libreria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 89,7 M de parametros en bf16 el peso ronda los 0,18 GB, por lo que el modelo cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 4090, A100 o H100 lo ejecutan sin problema, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, incluidas GTX 1660, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (unica via documentada); no se confirma soporte en vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Speech-JEPA Base ASR 960h (este) | 89,7 M | audio 16 kHz, trama cada 20 ms | en | BSD-3-Clause | Hugging Face, codigo remoto |
| wav2vec 2.0 Base 960h (fairseq) | ~95 M | audio 16 kHz | en (checkpoint base) | MIT (fairseq) | Ampliamente disponible |
| HuBERT Base 960h | ~95 M | audio 16 kHz | en | MIT (fairseq) | Ampliamente disponible |

La comparacion se limita a la arquitectura y la receta, ya que no hay resultados de benchmarks publicados para este checkpoint. La receta de ajuste fino es identica a la de wav2vec 2.0 Base 960h de fairseq, lo que hace la comparacion metodologicamente directa, pero sin cifras de WER no puede establecerse una conclusion de rendimiento.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en otros idiomas.
- Alucinacion y errores de transcripcion: al ser decodificacion CTC greedy sin modelo de lenguaje, los errores ortograficos y las palabras fuera de vocabulario son frecuentes; el vocabulario limitado a mayusculas, apostrofo y `|` restringe la salida.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre LibriSpeech, hereda los sesgos de dominio y acento de ese corpus (lectura de audiolibros en ingles).
- Limitaciones de contexto: no se especifica una longitud maxima de audio; el procesamiento es por enunciado con normalizacion individual, lo que puede afectar a audios muy largos o con condiciones acusticas heterogeneas.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribucion y sin endoso; conviene revisar las condiciones del codigo remoto y de los pesos preentrenados.
- Caveat para produccion: es un checkpoint de investigacion con cero descargas y sin benchmarks publicados; no se recomienda para produccion sin una evaluacion propia de WER en el dominio objetivo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; debe auditarse antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labhamlet/speech-jepa-base-asr-960h
- Checkpoint base (preentrenamiento): https://huggingface.co/labhamlet/speech-jepa-base
- Checkpoint 10 min: https://huggingface.co/labhamlet/speech-jepa-base-asr-10min
- Checkpoint 1 h: https://huggingface.co/labhamlet/speech-jepa-base-asr-1h
- Checkpoint 10 h: https://huggingface.co/labhamlet/speech-jepa-base-asr-10h
- Checkpoint 100 h: https://huggingface.co/labhamlet/speech-jepa-base-asr-100h
- Codigo y recetas: https://github.com/labhamlet/SpeechJEPA
- Dataset: https://huggingface.co/datasets/openslr/librispeech_asr
