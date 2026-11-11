# nagohachi/wav2vec2-base-100h-repro

## Resumen

`nagohachi/wav2vec2-base-100h-repro` es una reproduccion independiente del modelo `facebook/wav2vec2-base-100h` para reconocimiento automatico del habla (ASR) en ingles. Lo publica el usuario nagohachi en Hugging Face y su proposito es verificar que los resultados del articulo original de wav2vec 2.0 (Baevski et al., 2020) son reproducibles con un pipeline de entrenamiento documentado de forma transparente. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors, con 94.396.829 parametros y un tamano de repositorio de 0,4 GB.

La arquitectura es la clasica de wav2vec 2.0 base: un extractor convolucional de caracteristicas seguido de un transformer con CTC como cabecera de decodificacion. Se entrena en dos fases: preentrenamiento autosupervisado sobre LibriSpeech `train-960` y ajuste fino supervisado con CTC sobre `train-clean-100`. El modelo no incorpora modelo de lenguaje externo en la decodificacion; los resultados publicados corresponden a decodificacion greedy CTC.

Su relevancia es fundamentalmente metodologica: sirve como referencia reproducible para quien quiera validar recetas de entrenamiento ASR, comparar el efecto del preentrenamiento autosupervisado frente a entrenar desde cero (el autor publica tambien una variante sin preentrenamiento) y disponer de un checkpoint base de wav2vec2 con licencia permisiva y trazabilidad completa del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 base (extractor CNN + transformer encoder + cabecera CTC) |
| Parametros totales | 94.396.829 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada en muestras de audio a 16 kHz, crop de preentrenamiento de 250.000 muestras = 15,6 s) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0 base descrita por Baevski et al. (2020). Un extractor convolucional transforma la forma de onda cruda a 16 kHz en una secuencia de representaciones latentes; sobre ellas opera un transformer encoder que se preentrena de forma autosupervisada con el objetivo de enmascarar y predecir unidades cuantizadas del audio. Para la tarea ASR se anade una cabecera lineal CTC sobre las salidas del encoder, de modo que el modelo emite directamente la secuencia de tokens de caracteres sin decodificador autorregresivo.

El entrenamiento documentado en la model card consta de dos etapas. La primera es el preentrenamiento autosupervisado sobre LibriSpeech `train-960`, con 400.000 actualizaciones, batch efectivo de 5.750 s de audio, crop de 250.000 muestras (15,6 s), optimizador Adam con beta = (0,9, 0,98), epsilon = 1e-6, weight decay 0,01, learning rate 5e-4 y precision mixta bf16. La segunda es el ajuste fino CTC sobre LibriSpeech `train-clean-100`, con 50.000 actualizaciones, batch efectivo de 1.335 s, Adam sin weight decay, learning rate 2e-5 y seleccion del checkpoint por mejor dev-other. No se documenta uso de RLHF ni DPO, algo coherente con un modelo CTC supervisado.

## Capacidades

- Reconocimiento automatico del habla en ingles a partir de audio mono a 16 kHz.
- Decodificacion CTC greedy sin modelo de lenguaje externo (los resultados publicados corresponden a este modo).
- Transcripcion de utterances cortas o segmentadas; el preentrenamiento usa crops de 15,6 s como referencia de escala.
- Integracion directa con la libreria `transformers` mediante `Wav2Vec2ForCTC` y `Wav2Vec2Processor`.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acustico de transcripcion.
- No soporta vision, audio generativo ni modos de pensamiento.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.

## Casos de uso

- Reproduccion de experimentos academicos: sirve como checkpoint de referencia para validar recetas de entrenamiento wav2vec 2.0 y comparar contra los numeros del articulo original (6,1 / 13,3 en test-clean / test-other sin LM).
- Ablation del preentrenamiento autosupervisado: el autor publica una variante entrenada desde cero (`wav2vec2-base-100h-scratch-repro`) con WER de 12,7 / 38,1, de modo que este checkpoint permite cuantificar la ganancia del preentrenamiento en un mismo pipeline.
- Transcripcion de audio en ingles en prototipos y pipelines de investigacion: al ser un modelo de 94 M de parametros, cabe en GPU de consumo y permite iterar rapido sobre datasets propios.
- Generacion de transcripciones para anotacion o minado de datos: util para preetiquetar corpus de habla en ingles antes de una revision humana, con la ventaja de una licencia Apache 2.0 sin restricciones de uso comercial.
- Baseline en evaluaciones de ASR: punto de partida para comparar sistemas propios sobre LibriSpeech clean/other con decodificacion greedy.
- Docencia y formacion: ejemplo compacto y bien documentado de pipeline ASR con CTC, preentrenamiento autosupervisado y ajuste fino supervisado, facil de ejecutar en un notebook.
- Integracion en aplicaciones de voz de baja latencia en ingles: con 94 M de parametros y salida CTC no autorregresiva, la inferencia es rapida en CPU/GPU modesta, adecuada para dictado o comandos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (decodificacion greedy CTC, sin modelo de lenguaje). La columna "Paper" corresponde a la Tabla 9 del apendice del articulo original, columna "None".

| Modelo | dev-clean | dev-other | test-clean | test-other |
|---|---:|---:|---:|---:|
| Este modelo | 6,3 | 15,1 | 6,5 | 15,4 |
| Sin preentrenamiento (scratch-repro) | 12,6 | 35,8 | 12,7 | 38,1 |
| Paper (wav2vec 2.0 base 100h, sin LM) | 6,1 | 13,5 | 6,1 | 13,3 |

Metrica: WER (word error rate), en porcentaje. Los valores del model-index (`verified: false`) coinciden con los de la tabla para test-clean (6,5) y test-other (15,4).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,4 GB de pesos mas activaciones; en la practica menos de 2 GB para audio de duracion tipica.
- VRAM estimada en fp16/bf16: aproximadamente 0,2 GB de pesos; holgado por debajo de 1 GB con overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100; el modelo no requiere GPU de datacenter.
- Cabe sobradamente en GPU de consumo e incluso puede ejecutarse en CPU para transcripciones de utterances cortas.
- Opciones de despliegue: `transformers` (referencia), `torchaudio` para carga de audio, y servidores de inferencia compatibles con `transformers` (por ejemplo, Hugging Face Inference Endpoints, dado el tag `endpoints_compatible`). No se documentan pesos GGUF ni soporte especifico para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER test-clean / test-other (sin LM) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nagohachi/wav2vec2-base-100h-repro | 94,4 M | audio 16 kHz, crops de 15,6 s en preentrenamiento | 6,5 / 15,4 | apache-2.0 | Hugging Face |
| facebook/wav2vec2-base-100h | 94,4 M | audio 16 kHz | 6,1 / 13,3 (paper) | apache-2.0 | Hugging Face |
| nagohachi/wav2vec2-base-100h-scratch-repro | no disponible | audio 16 kHz | 12,7 / 38,1 | no disponible | Hugging Face |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de otras alternativas ASR en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no se declaran otros idiomas y el entrenamiento se limita a LibriSpeech, corpus de audiolibros en ingles con dominio y acustica acotados.
- Rendimiento degradado fuera de dominio: LibriSpeech es habla leida; el WER en habla espontanea, ruido o acentos no representados sera previsiblemente mucho mayor (no hay datos publicados al respecto).
- Sin modelo de lenguaje: la decodificacion greedy CTC produce mas errores que sistemas con LM; el propio autor compara contra la columna "None" del articulo.
- Riesgo de alucinacion y errores de sustitucion en nombres propios, terminos tecnicos y cifras, habitual en modelos CTC sin LM.
- Sesgos inheritos del corpus LibriSpeech (hablantes de audiolibros, predominantemente ingles estadounidense), que pueden trasladarse a las transcripciones.
- Modelo de investigacion y reproduccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de los resultados (`verified: false` en el model-index).
- Licencia Apache 2.0 permite uso comercial, pero no hay garantias ni soporte del autor; conviene validar el WER en el dominio propio antes de produccion.
- No apto para tareas generativas, de razonamiento, vision o tool calling; su unico proposito es la transcripcion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/wav2vec2-base-100h-repro
- Pesos oficiales de referencia: https://huggingface.co/facebook/wav2vec2-base-100h
- Variante sin preentrenamiento: https://huggingface.co/nagohachi/wav2vec2-base-100h-scratch-repro
- Paper wav2vec 2.0 (Baevski et al., 2020, NeurIPS): https://proceedings.neurips.cc/paper/2020/hash/92d1e1eb1cd6f9fba3227870bb6d7f07-Abstract.html
- Dataset LibriSpeech: https://www.openslr.org/12/
