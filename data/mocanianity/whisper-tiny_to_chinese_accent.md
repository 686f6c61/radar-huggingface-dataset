# Mocanianity/whisper-tiny_to_chinese_accent

## Resumen

Whisper tiny Chinese es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, desarrollado por el usuario Mocanianity y publicado en HuggingFace. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37,7 millones de parametros totales, y se ha reentrenado sobre un dataset denominado Chinese_english con el objetivo de mejorar la transcripcion de audio en ingles con acento chino.

El modelo resuelve un problema muy concreto: la degradacion del WER que sufren los sistemas ASR genericos cuando el hablante tiene un acento no nativo. Al partir de la variante tiny de Whisper, el resultado es un modelo extremadamente ligero (0,3 GB de repositorio) pensado para despliegues con recursos muy limitados, inferencia en CPU o dispositivos edge, donde no es viable ejecutar variantes medium o large.

Es relevante ahora porque los ajustes finos de ASR sobre dominios o acentos especificos son una via practica para mejorar la accesibilidad y la calidad de transcripcion sin incrementar el coste computacional. No obstante, conviene senalar que el modelo es un experimento de un autor individual, sin validacion externa, con cero descargas y una model card generada automaticamente que deja multiples apartados sin completar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con mecanismos de atencion estandar, disenado para mapear espectrogramas Mel de audio a tokens de texto. Whisper tiny es la variante mas pequena de la familia Whisper y esta pensada para escenarios de baja latencia y bajo consumo de memoria.

El ajuste fino se realizo con el Trainer de HuggingFace sobre el dataset Chinese_english. Los hiperparametros documentados son: learning rate de 1e-5, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. Se registran dos puntos de evaluacion: en el paso 1000 (epoch 1,2837) la perdida de validacion fue 0,3158 con WER de 14,3288, y en el paso 2000 (epoch 2,5674) la perdida bajo a 0,3069 y el WER a 13,2963. El framework empleado fue Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se documenta el volumen de datos, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un ajuste fino de ASR supervisado).

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en habla con acento chino.
- Transcripcion de audio a texto mediante la pipeline `automatic-speech-recognition` de Transformers.
- Compatible con los endpoints de HuggingFace (tag `endpoints_compatible`).
- Modelo de muy bajo coste computacional por su tamano (37,7 M de parametros).
- No dispone de soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio generativo ni modo "thinking".
- Capacidad multilingue limitada: la model card solo declara ingles.

## Casos de uso

- Transcripcion de reuniones y clases con ponentes de habla inglesa y acento chino: el ajuste fino sobre Chinese_english busca reducir el WER en este perfil de hablante, y el reducido tamano permite ejecutarlo en un portatil sin GPU dedicada.
- Subtitulado automatico de contenido audiovisual en ingles con acento chino: el modelo puede generar transcripciones base que luego se revisan, con latencia baja gracias a la variante tiny.
- Prototipado rapido de pipelines ASR: sirve como modelo de referencia para validar integraciones con Transformers antes de escalar a variantes mayores de Whisper.
- Despliegue en dispositivos edge o entornos con memoria limitada: con 37,7 M de parametros y 0,3 GB de repositorio, cabe en sistemas embebidos y contenedores pequenos.
- Investigacion sobre adaptacion de dominio en ASR: util como punto de partida para estudiar como afecta el ajuste fino con pocos pasos (2000) al WER en acentos especificos.
- Evaluacion comparativa de tecnicas de fine-tuning: el registro detallado de hiperparametros y curvas de perdida permite reproducir y contrastar experimentos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados externamente):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Chinese | Chinese English (split test) | WER | 13,2963 |
| Whisper tiny Chinese (paso 1000) | Chinese English (validacion) | WER | 14,3288 |
| Whisper tiny Chinese (paso 2000) | Chinese English (validacion) | WER | 13,2963 |

Perdida de validacion final: 0,3069. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con el modelo base openai/whisper-tiny en el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa; el modelo (37,7 M de parametros) ocupa aproximadamente 150 MB en fp32 y unos 75 MB en fp16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien funciona en CPU. No requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650) e incluso en Raspberry Pi o dispositivos moviles con optimizaciones.
- Opciones de despliegue: pipeline de Transformers, HuggingFace Inference Endpoints (tag `endpoints_compatible`), exportacion a ONNX o conversión a GGUF para llama.cpp/whisper.cpp (no documentada por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia muy baja en CPU y practicamente instantanea en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Whisper tiny Chinese (este modelo) | 37,7 M | ventanas de 30 s | en (acento chino) | apache-2.0 | experimental, 0 descargas |
| openai/whisper-tiny | 37,7 M | ventanas de 30 s | multilingue (99 idiomas) | apache-2.0 | modelo base oficial |
| openai/whisper-base | 74 M | ventanas de 30 s | multilingue | apache-2.0 | oficial, mayor precision |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue | apache-2.0 | oficial, equilibrio precision/coste |

La comparativa con alternativas especializadas en acentos no esta disponible en la informacion proporcionada. Frente al modelo base, este ajuste fino sacrifica cobertura multilingue a cambio de una mejora potencial en el dominio concreto de habla inglesa con acento chino, si bien no se aportan datos del WER del modelo base en el mismo dataset para cuantificar la mejora.

## Limitaciones y advertencias

- Model card generada automaticamente con apartados "More information needed" en descripcion, usos previstos, limitaciones y datos de entrenamiento: falta documentacion esencial para evaluar el modelo en produccion.
- El WER de 13,2963 no esta verificado (`verified: false`) y procede de un unico dataset sin descripcion publica de su composicion, tamano ni procedencia.
- Cero descargas y cero likes: no hay evidencia de uso real ni validacion por parte de la comunidad.
- Riesgo de sobreajuste al dataset Chinese_english con solo 2000 pasos de entrenamiento y batch de 2; la curva de perdida muestra mejora marginal entre los pasos 1000 y 2000.
- Capacidad multilingue limitada al ingles; no debe usarse para transcribir otros idiomas sin validacion previa.
- Riesgo de alucinacion tipico de Whisper en segmentos de silencio o audio ruidoso, agravado en la variante tiny.
- Sesgos potenciales derivados del dataset de entrenamiento no documentado (posible sesgo de acento, genero, edad o dominio).
- Licencia apache-2.0 permite uso comercial, pero la ausencia de documentacion sobre el dataset de entrenamiento impide verificar la procedencia y los derechos de los datos de audio utilizados.
- No recomendado como unico sistema ASR en produccion sin una evaluacion previa sobre datos propios y una comparacion con el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mocanianity/whisper-tiny_to_chinese_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
