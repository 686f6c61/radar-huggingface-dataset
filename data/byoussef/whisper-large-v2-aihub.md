# byoussef/whisper-large-v2-AiHub

## Resumen

`byoussef/whisper-large-v2-AiHub` es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla (ASR) `openai/whisper-large-v2` de OpenAI, publicado por el usuario `byoussef` en Hugging Face. El modelo base Whisper-large-v2 es un transformer encoder-decoder entrenado por OpenAI para transcripcion multilingue y traduccion de voz; este derivado conserva la misma arquitectura y numero de parametros, pero ha sido reentrenado sobre un corpus no especificado (la model card indica literalmente "None dataset").

El problema que aborda es la adaptacion del ASR generico de Whisper a un dominio o acento concreto, presumiblemente vinculado al proyecto "AiHub" (un repositorio de datos de habla coreano). El autor reporta un WER de 0,2232 sobre el conjunto de evaluacion, aunque no documenta que datos componen ese conjunto. Se trata por tanto de un modelo experimental, con muy poca traccion en la comunidad (4 descargas y 0 likes en el momento de la consulta) y una model card autogenerada por el `Trainer` de Hugging Face que no ha sido completada.

Por su relevancia practica, debe considerarse una variante de nicho: util unicamente si el dominio de uso coincide con el del ajuste, y sin garantias de calidad fuera de el. La informacion disponible sobre datos, idiomas y condiciones de entrenamiento es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con atencion estandar y embeddings de posicion sinusoidal |
| Parametros totales | 1.543.304.960 (segun safetensors); la model card del modelo base de OpenAI cita ~2B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos por defecto; no se especifica en esta ficha) |
| Tipos de cuantizacion | no disponible en la model card; al ser compatible con transformers y safetensors, admite cuantizacion a int8/fp16 via librerias externas, pero no se documenta oficialmente |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base soporta multilingue, pero el ajuste no especifica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, pytorch (bin), tensorboard (logs de entrenamiento) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-large-v2`: un transformer encoder-decoder con 32 capas de encoder y 32 de decoder, atencion multi-cabeza estandar, y una entrada de audio convertida a espectrograma log-Mel de 80 canales procesado en ventanas de 30 segundos. No incorpora innovaciones arquitectonicas propias; es un ajuste fino supervisado del checkpoint original.

Los hiperparametros declarados en la model card son: learning rate 1e-5, batch total de 224 (32 por dispositivo en 7 GPUs), optimizador Adam (betas 0,9/0,999, epsilon 1e-8), scheduler lineal con 500 pasos de warmup, 5000 pasos de entrenamiento y precision mixta nativa (AMP). El entrenamiento se ejecuto con Transformers 4.27.0.dev0, PyTorch 1.12.1+cu113, Datasets 2.10.1 y Tokenizers 0.13.2. No se documenta el numero de tokens de audio, la composicion del dataset, ni si hubo etapas de RLHF o DPO (en ASR no es habitual). La model card indica explicitamente "None dataset" y "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) mediante el pipeline `automatic-speech-recognition` de transformers.
- Traduccion de voz a texto en el modelo base; no se confirma que el ajuste conserve esta capacidad.
- Procesamiento de audio en ventanas de 30 segundos (caracteristica heredada de Whisper).
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no confirmadas en este ajuste; dependen del dataset de fine-tuning, que no se documenta.
- Capacidades especiales (vision, audio adicional, thinking mode): no disponible.

## Casos de uso

- Transcripcion de audio en el dominio especifico del corpus AiHub: si el audio de produccion comparte dominio, acento y condiciones acusticas con el conjunto de evaluacion del autor (WER 0,2232), el modelo puede ofrecer transcripciones aceptables alli donde el Whisper generico falle.
- Prototipado rapido de pipelines ASR en espanol o coreano: al ser compatible con el pipeline `automatic-speech-recognition` de transformers, se puede integrar en un script de pocas lineas para validar la viabilidad de un flujo de transcripcion antes de invertir en un modelo mayor.
- Generacion de subtitulos para contenido audiovisual de un dominio concreto (por ejemplo, reuniones o grabaciones de un unico hablante), siempre que se valide el WER sobre una muestra representativa antes de desplegar.
- Investigacion academica sobre ajuste fino de Whisper: el repositorio incluye logs de TensorBoard y checkpoints intermedios, lo que permite reproducir la curva de entrenamiento y comparar estrategias de fine-tuning.
- Base para un segundo ajuste fino: el checkpoint puede servir como punto de partida para un dominio adyacente, ahorrando parte del coste de entrenamiento respecto a partir del modelo original de OpenAI.
- Benchmark interno de referencia: util como linea base en una evaluacion comparativa de modelos ASR sobre un corpus propio, aunque su escasa documentacion limita la interpretabilidad de los resultados.

## Benchmarks y rendimiento

La model card declara los siguientes resultados sobre el conjunto de evaluacion del autor (no se especifica que dataset es):

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,2622 |
| WER (evaluacion final) | 0,2232 |

Evolucion durante el entrenamiento (segun la model card):

| Training loss | Epoca | Paso | Validation loss | WER |
|---|---|---|---|---|
| 0,3373 | 0,1 | 1000 | 0,3146 | 0,2507 |
| 0,3131 | 0,2 | 2000 | 0,2967 | 0,2408 |
| 0,3053 | 0,3 | 3000 | 0,2815 | 0,2346 |
| 0,2812 | 0,4 | 4000 | 0,2695 | 0,2267 |
| 0,2765 | 0,5 | 5000 | 0,2623 | 0,2230 |

El `model-index` del repositorio esta vacio (`results: []`), por lo que no hay resultados adicionales verificables. No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni tiene sentido aplicarlos a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos (1.543 M parametros x 2 bytes), mas overhead de activaciones y buffers de audio; en la practica, entre 4 y 6 GB para audio de 30 segundos.
- VRAM estimada en fp32: aproximadamente 6,2 GB solo para pesos, mas overhead; en torno a 8-10 GB en total.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 3070, RTX 4060 Ti). Para lotes grandes o mayor throughput, A100, H100 o L40S.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB o superiores con fp16; en GPUs de 8 GB puede requerir lotes de 1 y audio corto.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de transformers, TGI (Text Generation Inference, si se adapta), vLLM (soporte ASR limitado), llama.cpp (no aplica a Whisper), faster-whisper (requiere conversion a CTranslate2), WhisperX para alineacion temporal.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, Whisper large-v2 procesa audio en tiempo real o mas rapido en GPUs modernas, pero no se aportan cifras para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| byoussef/whisper-large-v2-AiHub | 1.543 M | ventanas de 30 s | 0,2232 (dataset no especificado) | apache-2.0 | Hugging Face, 4 descargas |
| openai/whisper-large-v2 | ~2 B (1.550 M segun safetensors) | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face, ampliamente usado |
| openai/whisper-large-v3 | no disponible en esta ficha | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| faster-whisper (large-v2) | misma base | ventanas de 30 s | no disponible en esta ficha | apache-2.0 (derivado) | GitHub / PyPI |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible: el autor no publica que dataset de evaluacion ha usado, por lo que el WER de 0,2232 no es comparable con los WER publicos de Whisper large-v2 o large-v3 sobre LibriSpeech, Common Voice u otros corpus estandar.

## Limitaciones y advertencias

- Model card autogenerada e incompleta: las secciones de descripcion, usos previstos y datos de entrenamiento dicen literalmente "More information needed". No se puede saber sobre que dominio se ha ajustado.
- Dataset de entrenamiento no declarado ("None dataset"): imposible evaluar el sesgo, la cobertura linguistica o la representatividad del corpus.
- Idiomas no especificados: no se puede asumir que el ajuste conserve el multilingue de Whisper; probablemente este sesgado hacia el idioma del corpus AiHub.
- WER de 0,2232 sin contexto: sin saber el dataset, esta cifra no permite concluir si el modelo es mejor o peor que el Whisper original.
- Riesgo de alucinacion en ASR: Whisper es conocido por generar texto plausible en silencios o audio ruidoso; este ajuste no documenta mitigaciones.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el usuario asume todo el riesgo.
- Escasa traccion: 4 descargas y 0 likes; sin issues, sin discusion, sin mantenimiento aparente desde 2023 (ultima actualizacion del repo en 2026 segun metadatos, pero sin commits documentados recientes).
- Tamano del repo de 43,2 GB: incluye checkpoints intermedios y logs de TensorBoard; descargar el modelo completo consume mucho espacio en disco.
- No apto como modelo de proposito general: es un ASR de dominio especifico, no un LLM; no soporta razonamiento, codigo ni tool calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/byoussef/whisper-large-v2-AiHub
- Arbol de ficheros: https://huggingface.co/byoussef/whisper-large-v2-AiHub/tree/main
- Modelo base: https://huggingface.co/openai/whisper-large-v2
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
- faster-whisper (implementacion CTranslate2): https://github.com/SYSTRAN/faster-whisper
