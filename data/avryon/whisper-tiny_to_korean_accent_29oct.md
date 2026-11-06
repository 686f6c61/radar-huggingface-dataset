# AVryon/whisper-tiny_to_korean_accent_29oct

## Resumen

Whisper tiny Korean es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario AVryon en Hugging Face. El objetivo declarado es adaptar el reconocimiento automatico del habla (ASR) de Whisper al ingles hablado con acento coreano, partiendo del dataset denominado "Korean_english". El modelo mantiene la arquitectura encoder-decoder transformer propia de la familia Whisper y un total de 37.760.640 parametros, lo que lo situa en la gama mas ligera de la familia.

La relevancia de este modelo es acotada: se trata de un experimento de ajuste fino sobre una base muy pequena (whisper-tiny), con solo 2.000 pasos de entrenamiento y un batch size de 2, y una model card generada automaticamente que no documenta la composicion del dataset ni los usos previstos. Aun asi, resulta interesante como ejemplo de adaptacion de dominio/accento sobre un modelo ASR de bajo coste computacional, y puede servir como punto de partida para quienes necesiten transcribir ingles con acento coreano en entornos con recursos limitados.

El modelo reporta un WER de 9,8293 sobre el split de test del dataset Korean English, aunque esta metrica no ha sido verificada de forma independiente (verified: false) y se calcula sobre un corpus privado no descrito. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s; el dato no se declara en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper original: un transformer encoder-decoder con atencion multitesta, entrenado originalmente por OpenAI para transcripcion y traduccion de voz. Whisper-tiny es la variante mas pequena de la familia, con aproximadamente 39M de parametros, disenada para inferencia rapida incluso en CPU. En este ajuste fino se conserva la arquitectura intacta y solo se actualizan los pesos mediante entrenamiento supervisado sobre pares audio-transcripcion.

El entrenamiento se realizo con los siguientes hiperparametros: learning rate 1e-05, batch size de 2 (evaluacion con batch 1), semilla 42, optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y un total de 2.000 pasos. Se registran dos checkpoints: en el paso 1.000 (epoca 1,0173) con validation loss 0,2164 y WER 9,8780, y en el paso 2.000 (epoca 2,0346) con validation loss 0,2030 y WER 9,8293. No se documenta el numero de tokens de audio, la composicion del dataset Korean_english, ni si se aplicaron tecnicas de augmentation, especulacion o RLHF/DPO. Las versiones de framework empleadas fueron Transformers 5.22.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en habla con acento coreano segun el dataset de ajuste.
- Transcripcion de audio a texto en formato compatible con el pipeline `automatic-speech-recognition` de Transformers.
- Generacion de transcripciones con marcas de tiempo si se invoca con `return_timestamps=True` (capacidad heredada de Whisper, no documentada explicitamente en la model card).
- Soporte multilingue limitado al ingles segun el campo `language: en`; no se declara soporte para coreano ni otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo ASR).
- No se documenta vision, audio generativo ni modo thinking.
- Inferencia rapida y bajo consumo de memoria gracias a su tamano reducido (37,7M de parametros).

## Casos de uso

- Transcripcion de reuniones o clases en ingles impartidas por hablantes nativos de coreano: el ajuste fino sobre el corpus Korean_english busca reducir el WER en este tipo de habla frente al whisper-tiny original, y su bajo coste permite desplegarlo en local.
- Subtitulado automatico de contenido audiovisual (videos de YouTube, podcasts, cursos) en ingles con acento coreano, generando transcripciones en bruto que luego se revisan manualmente.
- Prototipado rapido de pipelines ASR en entornos con GPU consumer o incluso CPU: con 37,7M de parametros y pesos safetensors de ~0,3 GB, se puede cargar en cualquier maquina para validar ideas antes de escalar a modelos mayores.
- Preprocesamiento de corpus de audio para investigacion en linguistica o estudios de acento: el modelo permite transcribir grandes volumenes de audio a bajo coste y comparar con transcripciones humanas para analizar errores.
- Asistencia a la accesibilidad en aplicaciones moviles o embebidas: la variante tiny de Whisper esta pensada para inferencia en dispositivos con recursos limitados, y este ajuste anade especializacion en un acento concreto.
- Generacion de datos sinteticos de entrenamiento: las transcripciones producidas pueden emplearse como pseudo-etiquetas para aumentar datasets de ASR en dominios con acento coreano, siempre con revision humana.
- Integracion en sistemas de dictado o toma de notas en ingles para usuarios coreanos, donde el acento del hablante degrada el rendimiento de modelos genericos.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model-index, no verificados de forma independiente.

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Whisper tiny Korean (AVryon) | Korean English | test | WER | 9,8293 |
| Whisper tiny Korean (AVryon) | Korean English | validacion (paso 2.000) | WER | 9,8293 |
| Whisper tiny Korean (AVryon) | Korean English | validacion (paso 1.000) | WER | 9,8780 |

No se han publicado resultados comparativos con whisper-tiny original ni con otros modelos en la informacion disponible. Tampoco se aportan metricas estandar como MMLU, HumanEval o GSM8K (no aplicables a un modelo ASR).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,15 GB solo para pesos (37,7M parametros x 4 bytes), mas overhead de activaciones y buffers de audio; en la practica cabe en cualquier GPU con 1 GB o mas.
- VRAM estimada en fp16/bf16: aproximadamente 0,08 GB para pesos; el cuello de botella es el procesamiento de audio, no la memoria.
- GPU recomendadas: cualquier GPU moderna, incluidas GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 o H100; el modelo no aprovecha GPUs de gama alta por su tamano.
- Cabe holgadamente en GPU consumer e incluso en CPU; es adecuado para inferencia en Raspberry Pi o dispositivos embebidos con optimizaciones (ONNX, CTranslate2).
- Opciones de despliegue: pipeline de Transformers, vLLM (soporte ASR limitado, verificar), llama.cpp no aplica (no es un modelo de lenguaje), faster-whisper (CTranslate2) y Whisper.cpp requieren conversion de pesos; Ollama no soporta modelos ASR de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada; en la practica, whisper-tiny procesa audio a varias veces la velocidad real en GPU consumer, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| Whisper tiny Korean (AVryon) | 37,7M | ventanas de 30 s (heredado) | en | apache-2.0 | 9,8293 (Korean English, no verificado) |
| openai/whisper-tiny | ~39M | ventanas de 30 s | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |
| openai/whisper-base | ~74M | ventanas de 30 s | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |
| openai/whisper-small | ~244M | ventanas de 30 s | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |

La comparativa se limita a la familia Whisper porque no se dispone de datos de otros ajustes finos comparables en la informacion proporcionada. El modelo de AVryon se diferencia del whisper-tiny original por su especializacion en acento coreano, a costa de renunciar al soporte multilingue declarado y de un entrenamiento muy corto que puede provocar sobreajuste al corpus Korean_english.

## Limitaciones y advertencias

- Model card generada automaticamente y sin completar: las secciones de descripcion, usos previstos y datos de entrenamiento indican "More information needed", por lo que se desconoce la composicion exacta del dataset Korean_english, su tamano y su procedencia.
- El WER de 9,8293 no esta verificado de forma independiente (verified: false) y se calcula sobre un split de test no descrito; no es comparable directamente con resultados publicados en otros corpus.
- Entrenamiento muy corto (2.000 pasos, batch size 2, dos epocas) sobre un modelo tiny: alto riesgo de sobreajuste al corpus especifico y de escasa generalizacion a otros dominios o acentos.
- El campo `language: en` restringe el uso declarado al ingles; no se garantiza un comportamiento correcto en coreano ni en otros idiomas, a pesar del nombre del modelo.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, solapamiento de hablantes o vocabulario tecnico, comun en todos los modelos Whisper de gama tiny.
- Sesgos hereditarios del modelo base whisper-tiny y del corpus de ajuste, que no se documentan; puede rendir peor con determinados grupos demograficos o variedades de ingles.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica sin validacion en produccion.
- Solo 22 descargas y 0 likes en el momento de la consulta: ecosistema practicamente inexistente, sin issues, demos ni validacion comunitaria.
- No se documentan requisitos de formato de audio, normalizacion ni preprocesado especifico; se asume el pipeline estandar de Whisper (16 kHz, mono).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AVryon/whisper-tiny_to_korean_accent_29oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Documentacion del pipeline ASR de Transformers: https://huggingface.co/docs/transformers/tasks/asr
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
