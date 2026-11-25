# nectec/Pathumma-asr-streaming-th-0.6b

## Resumen

Pathumma ASR Streaming 0.6B (TH) es un modelo de reconocimiento automatico del habla (ASR) en streaming para tailandes e ingles, desarrollado por NECTEC y publicado en Hugging Face. Se trata de un ajuste fino del modelo NVIDIA Nemotron Speech Streaming EN 0.6B, un FastConformer con decodificador RNNT de aproximadamente 600 millones de parametros, adaptado al tailandes mediante la sustitucion del tokenizador original por uno nuevo que cubre texto tailandes y mixto tailandes-ingles.

La propuesta de valor del modelo es la inferencia en tiempo real con latencia configurable: permite elegir en el momento de la inferencia tamanos de bloque de 80 ms a 1,12 s sin reentrenar, gracias a su encoder cache-aware que reutiliza las cache de atencion y convolucion entre bloques. Ademas, esta disenado para manejar code-switching tailandes-ingles, ruido de fondo y dominios diversos como tecnologia, noticias, finanzas, ciencia y derecho.

Es relevante para el ecosistema de IA open source porque cubre un hueco poco poblado: ASR en streaming para tailandes con soporte de mezcla de idiomas, una combinacion escasa en modelos abiertos. Su licencia es la NVIDIA Open Model License, no una licencia permisiva generica, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cache-Aware FastConformer (24 capas) + decodificador RNNT |
| Parametros totales | ~600M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | contexto de atencion configurable: `att_context_size` de [70,0] a [70,13] en tramas de 80 ms (bloques de 0,08 s a 1,12 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tailandes (th), ingles (en), incluido code-switching th-en |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | pesos NeMo/PyTorch (repo de 2,5 GB); no se indica GGUF ni safetensors |

## Arquitectura y entrenamiento

El modelo emplea un encoder Cache-Aware FastConformer de 24 capas con decodificador RNNT (Recurrent Neural Network Transducer), heredado del modelo base nvidia/nemotron-speech-streaming-en-0.6b. El encoder mantiene cache de todas las capas de self-attention y convolucion, de modo que cada nuevo bloque de audio reutiliza el contexto previo en lugar de recalcular el audio solapado; esto es lo que habilita el streaming con latencia baja y coste computacional acotado.

El ajuste fino se realizo con el toolkit NVIDIA NeMo, usando el script de ejemplo de transducer BPE y la configuracion de cache-aware streaming del repositorio. Los cambios respecto al modelo base son: sustitucion del tokenizador ingles por uno nuevo tailandes-ingles (el tipo y tamano de vocabulario no se detallan en la model card), adaptacion del decodificador RNNT y de la red joint al nuevo vocabulario, y ajuste fino de todo el modelo sobre habla tailandesa y mixta tailandes-ingles. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla en streaming con latencia configurable (bloques de 80 ms a 1,12 s) sin reentrenamiento.
- Transcripcion de tailandes e ingles, incluido code-switching (palabras y frases en ingles dentro de habla tailandesa).
- Robustez declarada frente a ruido de fondo y condiciones de grabacion dificiles.
- Cobertura de multiples dominios: tecnologia, noticias, finanzas, ciencia y derecho.
- Salida con marcas de tiempo a nivel de palabra, segmento y caracter (`timestamps=True`).
- Inferencia por lotes (`batch_size`) en el script de streaming de NeMo.
- No se documenta soporte de tool calling, agentes, vision, audio de entrada mas alla del propio ASR ni modo de razonamiento explicito.

## Casos de uso

- Asistentes de voz en tailandes: el modelo puede transcribir en streaming con bloques de 80-160 ms, adecuado para activacion por voz y dialogos de baja latencia en dispositivos o servidores.
- Subtitulado en directo: con bloques de 0,56 s o 1,12 s se obtiene un equilibrio entre latencia y precision para retransmisiones, reuniones y eventos en tailandes.
- Centros de llamadas: transcripcion de conversaciones multi-turno con mezcla de tailandes e ingles, util para analitica, cumplimiento y busqueda sobre grabaciones.
- Dominios especializados: transcripcion de contenido tecnico, financiero, cientifico o juridico gracias al entrenamiento declarado en esos ambitos.
- Code-switching en entornos profesionales: reuniones donde se alterna tailandes e ingles sin cambiar de modelo.
- Pipelines de accesibilidad: generacion de subtitulos y transcripciones para contenido audiovisual tailandes con marcas de tiempo por palabra.
- Prototipado rapido con NeMo: integracion en scripts de streaming existentes mediante `pretrained_name` y `att_context_size`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara metricas CER y WER en los metadatos, pero no incluye valores numericos ni tablas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~600M parametros en precision completa el peso ronda los 2,4 GB, por lo que la VRAM necesaria es modesta, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no especificadas; el modelo se ejecuta con PyTorch y NeMo en CUDA o CPU (`device = "cuda" if torch.cuda.is_available() else "cpu"`).
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del repo (2,5 GB) y los ~600M parametros, aunque no se confirma oficialmente.
- Opciones de despliegue: NVIDIA NeMo (`nemo_toolkit[asr]`), script `speech_to_text_cache_aware_streaming_infer.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo ASR).
- Latencia y throughput: la latencia viene determinada por `att_context_size` (0,08 s, 0,16 s, 0,56 s o 1,12 s); no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pathumma ASR Streaming 0.6B (TH) | ~600M | cache-aware, bloques 0,08-1,12 s | th, en (code-switching) | NVIDIA Open Model License | Hugging Face (nectec) |
| nvidia/nemotron-speech-streaming-en-0.6b | ~600M | cache-aware, streaming | en | NVIDIA Open Model License | Hugging Face (NVIDIA) |
| Alternativas ASR tailandesas abiertas | no disponible | no disponible | th | no disponible | no disponible |

El modelo base NVIDIA es el referente directo: misma arquitectura y tamano, pero solo ingles. No se dispone en la informacion proporcionada de otros modelos comparables de ASR en streaming para tailandes con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- La model card contiene varios campos marcados como TODO (tipo y tamano del tokenizador, reinitializacion del decodificador, salida de puntuacion), lo que indica documentacion incompleta.
- No se publican resultados de CER/WER, por lo que no es posible evaluar la precision real frente a alternativas.
- El rendimiento con bloques mas pequenos (menor latencia) empeora ligeramente, segun advierte el propio autor.
- Riesgo de alucinacion y errores en audio con ruido extremo, acentos no representados o dominios fuera de los entrenados; no se documenta el dataset de entrenamiento.
- Cobertura limitada a tailandes e ingles; no se declaran otros idiomas.
- La licencia NVIDIA Open Model License no es una licencia permisiva generica: impone condiciones para uso comercial y redistribucion que deben revisarse antes de produccion.
- No se especifican requisitos de hardware ni cifras de throughput, lo que dificulta el dimensionamiento de despliegues.
- El modelo es solo ASR: no soporta tool calling, agentes ni multimodalidad mas alla del audio de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nectec/Pathumma-asr-streaming-th-0.6b
- Modelo base: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Repositorio NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Script de inferencia streaming cache-aware: https://github.com/NVIDIA-NeMo/NeMo/blob/main/examples/asr/asr_cache_aware_streaming/speech_to_text_cache_aware_streaming_infer.py
- Script de entrenamiento RNNT BPE: https://github.com/NVIDIA/NeMo/blob/main/examples/asr/asr_transducer/speech_to_text_rnnt_bpe.py
- Configuracion cache-aware streaming: https://github.com/NVIDIA/NeMo/tree/main/examples/asr/conf/fastconformer/cache_aware_streaming
