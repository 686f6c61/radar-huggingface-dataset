# lgris/wav2vec2-xls-r-300m-tagarela-v2

## Resumen

El modelo `lgris/wav2vec2-xls-r-300m-tagarela-v2` es un sistema de reconocimiento automatico del habla (ASR) en portugues de Brasil obtenido por ajuste fino del checkpoint multilingue `facebook/wav2vec2-xls-r-300m`, preentrenado por Meta sobre 436.000 horas de audio en 128 idiomas. El ajuste se realizo sobre el corpus TAGARELA v2 (`freds0/TAGARELA_v2`), utilizando el 100% de sus 2.224 shards Parquet, lo que equivale a unas 13.127 horas de audio. El resultado es un modelo de 315.493.045 parametros (unos 1,3 GB en safetensors) especializado en transcripcion de portugues brasileno a 16 kHz mono.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo de adaptacion eficiente de un backbone XLS-R de 300 M de parametros a un unico idioma mediante CTC, sin necesidad de decodificador autoregresivo ni de un modelo de lenguaje externo. Por otro, el autor publica una comparativa interna entre variantes propias (XLS-R 300M y variantes basadas en Podcasts PT), entrenadas con distintos subconjuntos del corpus, lo que permite evaluar el efecto de la seleccion de datos sobre el WER.

El dato central declarado por el autor es un WER del 11,75% sobre el conjunto de test oficial de TAGARELA v2 (4.208 muestras), con una eval loss de 0,1711. No se ha publicado todavia informacion sobre cuantizaciones oficiales, soporte multilingue fuera del portugues ni resultados de latencia y throughput en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 para CTC (`Wav2Vec2ForCTC`): encoder convolucional de features seguido de encoder transformer |
| Parametros totales | 315.493.045 |
| Longitud de contexto | no aplica (modelo de ASR; entrada de audio a 16 kHz mono, sin ventana de tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay versiones GGUF, int8 o int4 oficiales) |
| Idiomas soportados | portugues de Brasil (pt-BR); el backbone base es multilingue (128 idiomas) pero este ajuste es mono-idioma |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Vocabulario | 51 tokens (minusculas, caracteres acentuados, delimitador `|`) |
| Frecuencia de muestreo | 16 kHz, mono |
| Tamano del repositorio | 1,3 GB |
| Fecha de creacion | 2026-09-13 |
| Dataset de ajuste | freds0/TAGARELA_v2 (2.224 shards Parquet, ~13.127 horas) |

## Arquitectura y entrenamiento

La arquitectura es la estandar de Wav2Vec2 para CTC: un extractor de caracteristicas convolucional que convierte la onda de audio en una secuencia de representaciones latentes, y un encoder transformer (heredado de XLS-R 300M) que produce estados ocultos sobre los que se aplica una cabeza de clasificacion CTC. La decodificacion es greedy por defecto, sin modelo de lenguaje externo, y la salida se genera en minusculas con acentos y sin puntuacion, dado el vocabulario de 51 tokens. La variable `freeze_feature_encoder=True` indica que el extractor convolucional se mantuvo congelado durante el ajuste fino, entrenando unicamente el encoder transformer y la cabeza CTC.

El ajuste se ejecuto durante 100.000 pasos con un batch efectivo de 128 (8 por dispositivo con 16 pasos de acumulacion de gradiente), learning rate de 3e-5 con warm-up lineal de 5.000 pasos, precision bfloat16 y aproximadamente 48 horas de computo sobre una unica NVIDIA B200. El WER de evaluacion descendio de forma monotona a lo largo del entrenamiento, desde el 16,41% en el paso 20.000 hasta el 11,75% en el paso 100.000, con una unica oscilacion en el paso 90.000 (11,95%, inferior al 12,45% del paso 80.000). No se documenta en la informacion disponible el uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto en portugues de Brasil (pt-BR) a partir de audio mono a 16 kHz.
- Modelo acustico CTC puro: no genera texto libre ni mantiene conversacion, solo mapea audio a secuencia de caracteres.
- Salida en minusculas con caracteres acentuados, usando `|` como delimitador de palabra.
- Inferencia por lotes mediante `Wav2Vec2Processor` y `Wav2Vec2ForCTC`, o mediante el pipeline `automatic-speech-recognition` de Transformers.
- Integracion con GPU mediante `device=0` en el pipeline, o ejecucion en CPU si no hay CUDA disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio mas alla del ASR (diarizacion, traduccion, marcas de tiempo): no disponibles.
- Capacidades multilingues: el backbone base cubre 128 idiomas, pero este ajuste esta especializado en pt-BR; no se declaran resultados en otros idiomas.

## Casos de uso

- Transcripcion de audio de dominio abierto en portugues de Brasil: el modelo fue ajustado sobre el 100% de TAGARELA v2 (~13.127 horas) y rinde mejor en ese dominio que las variantes entrenadas con subconjuntos parciales, con 11,75% de WER frente a 14,96% y 20,36% de las otras variantes XLS-R.
- Subtitulado de contenido hablado en portugues: se puede ejecutar el pipeline `automatic-speech-recognition` sobre cada pista de audio a 16 kHz y obtener transcripciones en minusculas para post-procesado (capitalizacion y puntuacion añadidas en una etapa separada).
- Preprocesado de datos de voz para entrenamiento de otros modelos: aprovechando el bajo coste de inferencia de un modelo de 315 M de parametros, se pueden transcribir grandes volumenes de audio antes de alimentar pipelines de NLP o de sintesis.
- Busqueda y indexacion de archivos de audio: las transcripciones permiten construir indices de texto sobre archivos de voz en portugues, con la salvedad de que la busqueda dependera de la calidad del WER por dominio.
- Aplicaciones de accesibilidad (subtitulado en directo o diferido): al ser un modelo CTC no autoregresivo, la decodificacion es rapida y facilita el procesado por fragmentos; la latencia concreta en produccion no esta documentada.
- Investigacion en ASR de bajo resource para portugues: sirve como linea base reproducible frente a otros checkpoints de la comunidad, ya que el autor publica la evolucion de WER por paso de entrenamiento.
- Prototipado en hardware modesto: los 1,3 GB de pesos permiten cargar el modelo en GPUs de consumo y en CPU, lo que facilita evaluaciones rapidas sin infraestructura dedicada.
- Fine-tuning posterior sobre dominios especificos (medico, legal, telefonia): el checkpoint puede actuar como punto de partida, ya que `freeze_feature_encoder=True` y el esquema CTC son faciles de reutilizar con Transformers.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (metrica no verificada por un tercero).

| Dataset | Metrica | Valor |
|---|---|---|
| TAGARELA v2 Test (4.208 muestras) | Test WER | 11,75% |
| TAGARELA v2 Test | Eval loss | 0,1711 |

Evolucion del WER durante el entrenamiento:

| Step | Epoch | Eval loss | Eval WER |
|---|---|---|---|
| 20.000 | 0,2 | 0,2681 | 16,41% |
| 40.000 | 0,4 | 0,2288 | 14,51% |
| 60.000 | 0,6 | 0,2042 | 13,38% |
| 80.000 | 0,8 | 0,1829 | 12,45% |
| 90.000 | 0,9 | 0,1875 | 11,95% |
| 100.000 | 1,0 | 0,1711 | 11,75% |

Comparativa publicada por el autor frente a otros checkpoints en portugues:

| Modelo | TAGARELA v1 (WER) | TAGARELA v2 (WER) | CORAA (WER) |
|---|---|---|---|
| XLS-R 300M (v2, 100%) — este modelo | — | 11,75% | — |
| Podcasts PT (v2, 100%) | 23,75% | 14,96% | 23,98% |
| Podcasts PT (v1+v2, 100%) | 21,64% | 15,92% | 25,44% |
| XLS-R 300M (v1+v2, 100%) | — | 20,36% | — |
| CORAA (Edresson) wav2vec2-large-xlsr-coraa-portuguese | 32,55% | 27,08% | 22,46% |

No se han publicado en la informacion disponible valores de CER, MMLU, HumanEval ni GSM8K, que no aplican a un modelo de ASR. Tampoco se han publicado resultados en CORAA para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 1,26 GB; en bf16/fp16 unos 0,63 GB; en int8 unos 0,32 GB (conversion no oficial). Con activaciones y buffers de audio, el consumo real se situa en torno a 2-3 GB en fp32.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. El modelo cabe sin problemas en RTX 3060, RTX 4060, RTX 4090, A100 o H100. No requiere memoria de gran capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente. Tambien es viable en CPU para transcripciones no masivas.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Hugging Face Transformers, clases `Wav2Vec2ForCTC` + `Wav2Vec2Processor`, exportacion a ONNX mediante Optimum (no documentada por el autor) e integracion en servicios FastAPI/TorchServe. No se documenta soporte oficial en vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Hardware de entrenamiento documentado: 1x NVIDIA B200 durante aproximadamente 48 horas para 100.000 pasos.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones de tiempo de inferencia ni de RTF (real-time factor).

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | TAGARELA v2 (WER) | CORAA (WER) | Licencia |
|---|---|---|---|---|---|
| lgris/wav2vec2-xls-r-300m-tagarela-v2 | 315,5 M | pt-BR | 11,75% | no disponible | apache-2.0 |
| lgris/wav2vec2-xls-r-300m-tagarela-combined | ~315 M (no confirmado) | pt-BR | 20,36% | no disponible | no disponible |
| lgris/wav2vec2-podcasts-tagarela-v2 | no disponible | pt-BR | 14,96% | 23,98% | no disponible |
| Edresson/wav2vec2-large-xlsr-coraa-portuguese | no disponible (variante large) | pt | 27,08% | 22,46% | no disponible |
| facebook/wav2vec2-xls-r-300m (base sin ajustar) | 315,5 M | 128 idiomas | no disponible | no disponible | apache-2.0 |

Frente al modelo base sin ajustar, este checkpoint incorpora especializacion en pt-BR y una mejora medible en TAGARELA v2 respecto a las variantes propias entrenadas con subconjuntos parciales del corpus. Frente a la referencia externa de CORAA, este modelo es claramente mejor en TAGARELA v2 (11,75% frente a 27,08%) aunque no hay datos publicados que permitan compararlo en CORAA.

## Limitaciones y advertencias

- Sesgos de dominio: el ajuste se hizo sobre el 100% de TAGARELA v2, por lo que el rendimiento fuera de ese dominio (telefonia, ruido de fondo, acentos no representados, audio lejano) puede degradarse de forma notable y no esta cuantificado.
- Metrica no verificada: el WER de 11,75% es un dato declarado por el autor (`verified: false`) y no ha sido validado de forma independiente.
- Ausencia de puntuacion y mayusculas: el vocabulario de 51 tokens en minusculas obliga a cualquier aplicacion de produccion a añadir una etapa de reconstruccion de formato.
- Sin marcas de tiempo: el modelo CTC no produce timestamps por token de forma nativa; se requieren heurísticas externas para alineaciones.
- Riesgo de alucinacion en ASR: en tramos de silencio, ruido o habla solapada, los decodificadores CTC sin modelo de lenguaje pueden emitir texto espurio o repetido.
- Limitacion idiomatica: aunque el backbone XLS-R cubre 128 idiomas, este ajuste esta pensado exclusivamente para pt-BR; usarlo en castellano u otros idiomas producira resultados no fiables.
- Restricciones de licencia: el modelo se distribuye bajo apache-2.0, lo que permite uso comercial, pero la licencia del corpus TAGARELA v2 y de cualquier audio que se transcriba debe comprobarse por separado.
- Privacidad y datos: TAGARELA v2 puede contener habla real de personas; conviene auditar el dataset antes de desplegar el modelo en productos que procesen voz de usuarios.
- Ecosistema de despliegue limitado: al no ser un modelo generativo, no hay soporte en servidores de inferencia mayoritarios como vLLM, TGI o Ollama, lo que obliga a usar Transformers u ONNX.
- Termino "100% Streaming": la model card lo emplea en el titulo y lo asocia al uso del 100% de los datos; no se especifica si implica soporte de inferencia en streaming real ni que latencia tendria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lgris/wav2vec2-xls-r-300m-tagarela-v2
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Dataset de ajuste: https://huggingface.co/datasets/freds0/TAGARELA_v2
- Variante XLS-R 300M combinada v1+v2: https://huggingface.co/lgris/wav2vec2-xls-r-300m-tagarela-combined
- Variante Podcasts PT sobre TAGARELA v2: https://huggingface.co/lgris/wav2vec2-podcasts-tagarela-v2
- Variante Podcasts PT combinada v1+v2: https://huggingface.co/lgris/wav2vec2-podcasts-tagarela-combined
- Referencia externa CORAA (Edresson): https://huggingface.co/Edresson/wav2vec2-large-xlsr-coraa-portuguese
- Paper de XLS-R (modelo base): https://arxiv.org/abs/2111.09296
- Busqueda web realizada: no se han encontrado enlaces adicionales relevantes al modelo (los resultados devueltos corresponden a contenidos sin relacion con ASR).
