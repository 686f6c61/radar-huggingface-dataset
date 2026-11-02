# Dan13lC/whisper-tiny_to_spanish_accent_1

## Resumen

Whisper tiny to spanish accent 1 es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, publicado por el usuario Dan13lC en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37.760.640 parametros totales, y ha sido entrenado sobre un dataset denominado spanish_english con el objetivo declarado de adaptar el reconocimiento a acentos del ingles influidos por el espanol.

La relevancia de este modelo es limitada y muy especifica: se trata de un experimento de ajuste fino de un modelo base ya pequeno (whisper-tiny), orientado a mejorar la transcripcion de habla en ingles con acento hispano. No es un modelo de proposito general ni compite con sistemas ASR de gran escala; su interes radica en demostrar el flujo de entrenamiento y en servir como punto de partida para adaptaciones de acento sobre Whisper.

El autor reporta un WER de 11,24 sobre el split de test del dataset spanish_english, con una perdida de validacion de 0,2292 tras 2000 pasos de entrenamiento. La model card esta generada automaticamente por el Trainer y carece de secciones sustantivas de descripcion, usos previstos o limitaciones, por lo que gran parte de la informacion tecnica debe inferirse del modelo base y de los hiperparametros declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con mecanismo de atencion estandar, disenado para tareas de reconocimiento automatico del habla. Whisper tiny es la variante mas pequena de la familia Whisper, con aproximadamente 39 millones de parametros en su version original; el ajuste fino conserva esa estructura y solo modifica los pesos mediante entrenamiento supervisado sobre pares audio-transcripcion.

El entrenamiento se realizo con los siguientes hiperparametros declarados: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused, betas 0,9 y 0,999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup y 2000 pasos totales. Se registran dos puntos de evaluacion: en el paso 1000 (epoch 0,9728) la perdida de validacion fue 0,2435 con WER 13,0846; en el paso 2000 (epoch 1,9455) la perdida bajo a 0,2292 y el WER a 11,2438. No se documenta el volumen de datos, la composicion exacta del dataset spanish_english ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo ASR). Las versiones de framework declaradas son Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con adaptacion declarada a acentos hispanos.
- Transcripcion de audio a texto mediante la pipeline `automatic-speech-recognition` de Transformers.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada: los metadatos declaran unicamente `en`, aunque el nombre del dataset sugiera presencia de espanol.
- No se documentan capacidades de vision, audio generativo ni modo thinking.

## Casos de uso

- Transcripcion de reuniones en ingles con hablantes hispanohablantes: el ajuste sobre acentos hispanos puede reducir errores en llamadas o reuniones donde los participantes hablan ingles con acento del espanol, aprovechando la ventana de audio de 30 s de Whisper.
- Subtitulado de contenido audiovisual en ingles con acento hispano: util para generar subtitulos en videos divulgativos o entrevistas donde el acento introduce errores en modelos ASR genericos.
- Prototipado rapido de pipelines ASR: al ser un modelo de 37,7 M de parametros, cabe en hardware modesto y permite iterar en el diseno de pipelines de transcripcion antes de escalar a modelos mayores.
- Evaluacion comparativa de tecnicas de fine-tuning: sirve como caso de estudio reproducible (hiperparametros y curvas de entrenamiento documentados) para experimentos de adaptacion de acento.
- Investigacion sobre sesgos de acento en ASR: permite medir la mejora de WER al especializar un modelo pequeno en un acento concreto frente al modelo base.
- Despliegue en entornos con recursos limitados: su tamano reducido (repo de 0,3 GB) facilita la ejecucion en CPU o GPU de gama baja para transcripciones puntuales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Whisper tiny to spanish accent 1 | Spanish English | test | WER | 11,2438 |

Evolucion durante el entrenamiento:

| Paso | Epoch | Perdida de entrenamiento | Perdida de validacion | WER |
|---|---|---|---|---|
| 1000 | 0,9728 | 0,2410 | 0,2435 | 13,0846 |
| 2000 | 1,9455 | 0,1273 | 0,2292 | 11,2438 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni sobre benchmarks estandar (MMLU, HumanEval, GSM8K no aplican a un modelo ASR; no se reportan resultados en LibriSpeech, Common Voice u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,7 M de parametros), aproximadamente 0,15 GB solo de pesos; con overhead de activaciones y audio, cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona tambien en CPU para transcripciones de baja carga.
- Cabe en GPU consumer: si, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090 y similares; tambien en Apple Silicon y CPU.
- Opciones de despliegue: pipeline de Transformers, endpoints de Hugging Face (tag `endpoints_compatible`); no se documenta soporte explicito de vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Dan13lC/whisper-tiny_to_spanish_accent_1 | 37,76 M | ventanas de 30 s (Whisper) | apache-2.0 | Hugging Face | Ajuste fino de acento; WER 11,24 en spanish_english (no verificado) |
| openai/whisper-tiny | ~39 M | ventanas de 30 s | apache-2.0 | Hugging Face / OpenAI | Modelo base; sin ajuste de acento |
| openai/whisper-base | ~74 M | ventanas de 30 s | apache-2.0 | Hugging Face / OpenAI | Mayor capacidad, mas coste computacional |
| openai/whisper-small | ~244 M | ventanas de 30 s | apache-2.0 | Hugging Face / OpenAI | Mejor WER general, requiere mas VRAM |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card generada automaticamente: las secciones de descripcion, usos previstos y limitaciones estan sin completar ("More information needed").
- El WER reportado (11,24) no esta verificado (`verified: false`) y corresponde a un dataset privado o no estandar (spanish_english), lo que impide comparaciones fiables con otros sistemas.
- Los metadatos declaran unicamente ingles como idioma soportado, pese al nombre del dataset; el comportamiento real con audio en espanol no esta documentado.
- Riesgo de alucinacion en transcripciones: como todo modelo Whisper, puede generar texto no presente en el audio, especialmente en segmentos con ruido o silencios.
- Sesgos potenciales derivados del dataset de ajuste, cuya composicion no se documenta; puede degradar el rendimiento en acentos distintos al objetivo.
- Licencia apache-2.0 permite uso comercial, pero al derivar de openai/whisper-tiny conviene revisar los terminos del modelo base y las condiciones de los datos de entrenamiento.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- No apto para produccion sin evaluacion previa en el dominio objetivo, dado el caracter experimental y la falta de documentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dan13lC/whisper-tiny_to_spanish_accent_1
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
