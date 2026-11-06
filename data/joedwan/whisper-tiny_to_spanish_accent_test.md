# JoeDwan/whisper-tiny_to_spanish_accent_test

## Resumen

Whisper tiny Spanish es un ajuste fino (fine-tune) de `openai/whisper-tiny`, el modelo de reconocimiento automatico del habla (ASR) mas pequeno de la familia Whisper de OpenAI. Lo publica el usuario JoeDwan en Hugging Face y esta entrenado sobre un dataset denominado `Spanish_english`, con el objetivo aparente de adaptar el modelo base a acentos espanoles en transcripciones de audio en ingles. El repositorio tiene 27 descargas y ningun "like", lo que lo situa como un experimento de ajuste fino de nicho mas que como un modelo de produccion.

El modelo conserva la arquitectura encoder-decoder transformer de Whisper tiny, con 37.760.640 parametros totales y un tamano de repositorio de 0,5 GB en formato safetensors. La model card esta generada automaticamente por el Trainer de Hugging Face y contiene secciones sin completar ("More information needed"), lo que limita la documentacion disponible sobre el proceso de entrenamiento y los datos exactos utilizados.

Su relevancia es limitada pero concreta: sirve como referencia para experimentos de adaptacion de acentos en modelos ASR ligeros y como ejemplo de fine-tune de Whisper tiny con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. No obstante, la falta de documentacion y de verificacion de los resultados aconseja tratarlo con cautela en entornos productivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de audio de 30 s tipica de Whisper; no confirmado en la informacion) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun model card); el nombre del modelo sugiere adaptacion a acentos espanoles, pero no se documenta |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-tiny`, un transformer encoder-decoder disenado para ASR con entrada de audio en ventanas de 30 segundos y salida de tokens de texto. Whisper tiny es la variante mas pequena de la familia, con aproximadamente 38 millones de parametros, lo que la hace extremadamente ligera pero con menor capacidad de transcripcion que las variantes medium o large.

El ajuste fino se realizo con el Trainer de Hugging Face sobre el dataset `Spanish_english`. Los hiperparametros documentados son: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 8, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 3000 pasos totales de entrenamiento. No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO (no procede en un modelo ASR). La perdida de validacion final fue de 0,2561 y el WER de 11,5672. No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con posible adaptacion a acentos espanoles segun el nombre del modelo.
- Transcripcion de audio a texto mediante el pipeline `automatic-speech-recognition` de transformers.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documentan capacidades especiales (vision, audio, thinking mode) distintas de la transcripcion.

## Casos de uso

- Transcripcion de audio en ingles con acento espanol: el modelo se puede usar para convertir grabaciones de hablantes hispanohablantes en ingles a texto, aprovechando el ajuste fino sobre el dataset `Spanish_english`. Es adecuado por su bajo coste computacional, aunque el WER de 11,57 % limita su uso a tareas no criticas.
- Prototipado rapido de pipelines ASR: al ser un modelo de 38 millones de parametros y 0,5 GB, se puede integrar en pruebas y demos sin infraestructura GPU dedicada, usando el pipeline de transformers.
- Evaluacion comparativa de fine-tunes de Whisper tiny: sirve como referencia para medir el efecto de adaptar acentos en modelos ASR ligeros frente al modelo base.
- Transcripcion en dispositivos con recursos limitados: su tamano reducido permite despliegue en CPU o GPUs de gama baja para tareas de transcripcion de baja exigencia.
- Generacion de subtitulos automaticos en ingles para contenido con hablantes de acento espanol: util en entornos donde la precision no es critica y se prima la latencia y el coste.
- Investigacion academica sobre sesgos de acento en ASR: permite estudiar como un fine-tune pequeno afecta al rendimiento en acentos no nativos del ingles.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | Spanish English (split test) | WER | 11,5672 |

Evolucion durante el entrenamiento (segun la model card):

| Epoch | Step | Validation loss | WER |
|---|---|---|---|
| 0,4864 | 500 | 0,2905 | 13,2090 |
| 0,9728 | 1000 | 0,2671 | 12,2886 |
| 1,4591 | 1500 | 0,2611 | 12,4876 |
| 1,9455 | 2000 | 0,2528 | 11,5423 |
| 2,4319 | 2500 | 0,2628 | 12,2637 |
| 2,9183 | 3000 | 0,2561 | 11,5672 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 37,7 millones de parametros (aproximadamente 151 MB en fp32 y unos 75 MB en fp16), la huella de memoria es muy reducida; una estimacion razonable es inferior a 1 GB en fp16, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: pipeline de transformers (`automatic-speech-recognition`), integracion con endpoints de Hugging Face; no se documenta compatibilidad explicita con vLLM, llama.cpp, Ollama o TGI (estos ultimos no estan orientados a ASR).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (dataset) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoeDwan/whisper-tiny_to_spanish_accent_test | 37.760.640 | No disponible | 11,5672 (Spanish English) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | Aprox. 38 M (segun familia Whisper) | Ventana de audio de 30 s | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-base | Aprox. 74 M (segun familia Whisper) | Ventana de audio de 30 s | No disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"), por lo que no hay documentacion sobre datos, sesgos o usos previstos.
- El WER de 11,57 % no esta verificado (`verified: false`) y corresponde a un unico dataset (`Spanish_english`); no hay garantia de generalizacion a otros dominios o acentos.
- El modelo declara unicamente ingles como idioma; la adaptacion a acentos espanoles no esta documentada formalmente y podria no cubrir todos los acentos.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, especialmente en audio con ruido, solapamiento de hablantes o vocabulario tecnico.
- No se documentan sesgos conocidos; al ser un fine-tune de Whisper tiny, hereda los sesgos del modelo base y del dataset de ajuste.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset `Spanish_english`, cuya procedencia no se detalla.
- El modelo tiene muy pocas descargas y ningun "like", lo que sugiere falta de validacion por parte de la comunidad; no se recomienda para produccion sin evaluacion propia.
- No se documentan limitaciones de contexto mas alla de la ventana tipica de Whisper (30 s de audio), no confirmada en la informacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoeDwan/whisper-tiny_to_spanish_accent_test
- Modelo base: https://huggingface.co/openai/whisper-tiny
