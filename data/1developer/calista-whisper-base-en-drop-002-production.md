# 1Developer/calista-whisper-base.en-drop-002-production

## Resumen

calista-whisper-base.en-drop-002-production es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-base.en, publicado por el usuario 1Developer en HuggingFace. Se trata de un modelo Whisper de tipo "base" en su variante exclusivamente inglesa, reentrenado sobre un dataset de audio propio empaquetado en formato audiofolder. El modelo resuelve la tarea de transcripcion de voz a texto (ASR) y esta pensado para un dominio o corpus concreto, no como un modelo generalista.

La relevancia de esta ficha es limitada: el modelo tiene cero descargas y cero likes en el momento de la consulta, la model card esta generada automaticamente por el Trainer de HuggingFace y contiene secciones sin completar ("More information needed"). Los resultados declarados (WER de 0.0 y perdida de validacion de 0.0000) son sospechosamente perfectos y no verificados, lo que sugiere sobreajuste severo al conjunto de evaluacion o una fuga de datos entre entrenamiento y test. Cualquier uso en produccion debe acompanarse de una evaluacion independiente.

Arquitectonicamente hereda el diseno encoder-decoder transformer de Whisper, con 72.593.408 parametros totales y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales siempre que se respete la atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 72.593.408 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Whisper base procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es exclusivamente ingles: whisper-base.en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-base.en, un transformer encoder-decoder disenado para ASR que procesa espectrogramas Mel de audio y genera tokens de texto. El ajuste se realizo con el Trainer de HuggingFace sobre un dataset en formato audiofolder, con los siguientes hiperparametros declarados: learning rate de 1e-05, batch size de 16 (entrenamiento y evaluacion), semilla 42, optimizador AdamW Torch Fused con betas (0.9, 0.999) y epsilon 1e-08, scheduler constant_with_warmup con 50 pasos de calentamiento, 500 pasos de entrenamiento totales y precision mixta nativa AMP. Se ejecuto con Transformers 5.21.0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

No se especifica el numero de tokens de audio, la composicion del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en un modelo ASR). La innovacion tecnica destacable es nula: se trata de un ajuste fino estandar sin modificaciones arquitectonicas. El nombre del modelo ("drop-002-production") sugiere una version de un pipeline interno de experimentos, pero no hay documentacion que lo confirme.

## Capacidades

- Transcripcion de voz a texto en ingles (heredada de whisper-base.en).
- Reconocimiento de habla sobre el dominio especifico del dataset audiofolder de entrenamiento.
- Generacion de transcripciones con marcas de tiempo (capacidad estandar de Whisper, no confirmada explicitamente para este fine-tuning).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el modelo base es solo ingles.
- No dispone de modo thinking, vision ni audio mas alla de la entrada de voz propia de ASR.

## Casos de uso

- Transcripcion de un corpus de audio concreto y homogeneo: si el dataset de entrenamiento corresponde a un dominio acotado (por ejemplo, llamadas de un call center o audios de un unico locutor), el modelo puede transcribir ese tipo de audio con alta fidelidad, aunque debe validarse fuera del conjunto de test.
- Prototipado rapido de pipelines ASR: al ser un modelo de 72 millones de parametros y licencia Apache 2.0, sirve para montar un servicio de transcripcion ligero en CPU o GPU modestas.
- Preprocesamiento de audio para sistemas de analitica: transcripcion de grabaciones para indexacion, busqueda o mineria de texto.
- Fine-tuning posterior como punto de partida: al estar ya ajustado sobre un dominio, puede servir de base para un segundo ajuste con mas datos etiquetados.
- Evaluacion comparativa de tecnicas de fine-tuning: util como referencia en experimentos academicos sobre sobreajuste y fuga de datos, dado el WER declarado de 0.0.
- Despliegue en entornos con requisitos de licencia permisiva: Apache 2.0 permite integrarlo en productos comerciales sin obligaciones de apertura.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | audiofolder (split test) | WER | 0.0 |
| Automatic Speech Recognition | audiofolder (split test) | Wer Ortho | 0.0 |
| Automatic Speech Recognition | audiofolder (split test) | Loss | 0.0000 |

Evolucion del entrenamiento declarada (extracto relevante):

| Paso | Epoch | Validation Loss | Wer Ortho | WER |
|---|---|---|---|---|
| 20 | 0.5556 | 1.7441 | 93.6508 | 57.1429 |
| 40 | 1.1111 | 0.0001 | 0.0 | 0.0 |
| 60 | 1.6667 | 0.0000 | 0.0 | 0.0 |
| 500 | 13.8889 | 0.0000 | 0.0 | 0.0 |

No hay resultados de benchmarks estandar (LibriSpeech, Common Voice, MMLU, etc.) en la informacion disponible. Los valores de 0.0 deben tratarse con escepticismo: un WER exactamente nulo en 500 pasos y 13 epochs sobre un dataset de audiofolder es indicativo de sobreajuste o de que el conjunto de test es identico o casi identico al de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,3 GB solo para pesos (72,6 M de parametros), mas activaciones y buffers de audio; en la practica, menos de 1-2 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,15 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien cabe en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, con amplio margen, incluidas GPUs de gama baja e incluso iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM no aplica de forma nativa a Whisper en todas sus versiones, llama.cpp no soporta Whisper de forma estandar, faster-whisper y WhisperX son alternativas para inferencia optimizada, TGI con soporte ASR segun version.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| calista-whisper-base.en-drop-002-production | 72,6 M | ventanas de 30 s (heredado) | solo ingles (base) | Apache 2.0 | HuggingFace, 0 descargas |
| openai/whisper-base.en | 74 M aprox. | ventanas de 30 s | solo ingles | Apache 2.0 | HuggingFace, ampliamente usado |
| openai/whisper-small | 244 M aprox. | ventanas de 30 s | multilingue | Apache 2.0 | HuggingFace |
| openai/whisper-tiny | 39 M aprox. | ventanas de 30 s | multilingue | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo verificable para este fine-tuning frente a los modelos base de OpenAI.

## Limitaciones y advertencias

- Resultados no verificados: el WER de 0.0 y la perdida de 0.0000 son sospechosos y probablemente reflejan sobreajuste o fuga de datos; no deben citarse como rendimiento real.
- Model card incompleta: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento estan sin rellenar ("More information needed").
- Sesgos desconocidos: no hay informacion sobre la composicion del dataset de audiofolder, por lo que se desconocen sesgos de acento, genero, edad o dominio.
- Riesgo de alucinacion: como todo modelo ASR generativo, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o fuera de dominio.
- Limitacion de idioma: el modelo base es exclusivamente ingles; no se debe esperar soporte de castellano ni de otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda mantener la atribucion a openai/whisper-base.en y revisar las condiciones del dataset original (no documentado).
- Cero traccion en la comunidad: 0 descargas y 0 likes, sin issues ni validacion externa; no hay evidencia de uso en produccion.
- Repositorio de 7,3 GB: inusualmente grande para 72,6 M de parametros, lo que sugiere que puede contener checkpoints intermedios, logs de TensorBoard u otros artefactos; conviene revisar el contenido antes de descargarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/1Developer/calista-whisper-base.en-drop-002-production
- Modelo base: https://huggingface.co/openai/whisper-base.en
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentacion de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
