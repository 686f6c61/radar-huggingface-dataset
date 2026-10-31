# Nuttyman/whisper-tiny_to_candian_accent_oct30_2ndrun

## Resumen

Whisper tiny Canadian es un ajuste fino (fine-tuning) del modelo Whisper tiny de OpenAI, realizado por el usuario Nuttyman y publicado en HuggingFace. El modelo base, openai/whisper-tiny, es un modelo de reconocimiento automatico de voz (ASR) basado en arquitectura encoder-decoder transformer con 37,76 millones de parametros. Este derivado se ha entrenado especificamente sobre un dataset de ingles canadiense (Canadian English) con el objetivo de mejorar la transcripcion de audio con acento canadiense, un caso de uso habitual cuando el modelo original muestra un WER elevado en variantes regionales del ingles.

Su relevancia es principalmente practica y de nicho: demuestra como un modelo ligero como Whisper tiny puede adaptarse a acentos concretos con recursos modestos (4000 pasos de entrenamiento, lotes de tamaño 8). El modelo obtiene un WER de 21,37 % sobre el split de test del dataset de ingles canadiense y una perdida de validacion de 0,4195. Esta publicado bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (enfocado en ingles canadiense) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper tiny de OpenAI: un transformer encoder-decoder disenado para reconocimiento automatico de voz, en el que el encoder procesa representaciones log-mel del audio y el decoder genera la transcripcion de texto de forma autoregresiva. No se trata de una arquitectura nueva, sino de una adaptacion por fine-tuning del modelo base sobre datos con acento canadiense.

Los hiperparametros de entrenamiento publicados son: learning rate de 1e-06 con planificador lineal y 300 pasos de warmup, tamaño de lote de entrenamiento de 8 y de evaluacion de 1, semilla 42, optimizador AdamW (variante fused de PyTorch) con betas (0,9; 0,999) y epsilon 1e-08, durante 4000 pasos de entrenamiento (16 epocas). El entrenamiento se realizo con PyTorch 2.11.0+cu130, Transformers 5.23.0.dev0, Datasets 5.1.0 y Tokenizers 0.23.3. No se ha documentado la composicion del dataset ni si hubo tecnicas adicionales como RLHF o DPO (que no serian habituales en ASR). Cabe senalar que la perdida de entrenamiento descendio de 0,1998 a 0,0872 mientras la perdida de validacion se mantuvo estable (0,4246 a 0,4195) y el WER empeoro ligeramente en los ultimos pasos, lo que sugiere un ligero sobreajuste en las epocas finales.

## Capacidades

- Transcripcion automatica de voz en ingles, con especial foco en audio con acento canadiense.
- Generacion de transcripciones de texto a partir de audio mediante el pipeline `automatic-speech-recognition` de la libreria Transformers.
- Compatibilidad con el ecosistema estandar de HuggingFace (safetensors, endpoints compatibles).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo ASR puro.
- No dispone de capacidades de vision, audio generativo ni traduccion documentadas en la ficha.

## Casos de uso

- Transcripcion de contenido audiovisual canadiense: puede emplearse para subtitular podcasts, entrevistas o emisiones producidas en Canada, donde el acento canadiense degrada el rendimiento del Whisper base.
- Sistemas de dictado para usuarios canadienses: integracion en aplicaciones de notas por voz o dictado en tiempo real, aprovechando su tamaño reducido para ejecutarse en local.
- Procesamiento de centros de llamadas en Canada: transcripcion masiva de grabaciones de llamadas de soporte o ventas para analisis posterior, dado su bajo coste computacional por hora de audio.
- Generacion de corpus de texto a partir de audio: creacion de datasets de texto en ingles canadiense a partir de grabaciones, utiles para entrenar otros modelos de NLP regionales.
- Prototipado y educacion: por su tamaño (0,8 GB el repositorio), es adecuado para experimentos de fine-tuning regional y para ensenar como adaptar Whisper a acentos concretos.
- Integracion en dispositivos con recursos limitados: Whisper tiny es el tamaño mas pequeno de la familia, por lo que puede desplegarse en portatiles o SBCs para transcripcion offline de hablantes canadienses.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) sobre el dataset Canadian English, split de test:

| Benchmark | Tarea | Dataset | Metrica | Valor |
|---|---|---|---|---|
| Evaluacion del autor | ASR | Canadian English (test) | WER | 21,37 % |
| Evaluacion del autor | ASR | Canadian English (validacion) | Loss | 0,4195 |

Evolucion durante el entrenamiento:

| Training Loss | Epoca | Paso | Validation Loss | WER |
|---|---|---|---|---|
| 0,1998 | 4,0 | 1000 | 0,4246 | 20,93 % |
| 0,1622 | 8,0 | 2000 | 0,4156 | 21,11 % |
| 0,1113 | 12,0 | 3000 | 0,4187 | 21,24 % |
| 0,0872 | 16,0 | 4000 | 0,4195 | 21,37 % |

No se han publicado comparaciones con el modelo base whisper-tiny ni con otros modelos ASR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de cientos de MB; con 37,76 millones de parametros en FP32 el modelo ocupa aproximadamente 150 MB de pesos, por lo que cualquier GPU moderna o incluso CPU es suficiente. No hay cifras oficiales publicadas.
- GPU recomendadas: no requiere GPU dedicada; es ejecutable en CPU. Para procesamiento masivo de audio, cualquier GPU de consumo (GTX 1650, RTX 3060, RTX 4090) o de datacenter sobra con diferencia.
- Cabe con holgura en cualquier GPU de consumo, incluidas las integradas de gama baja, y en dispositivos sin GPU.
- Opciones de despliegue: libreria Transformers de HuggingFace (pipeline `automatic-speech-recognition`); por su compatibilidad con la arquitectura Whisper, es probable que funcione con whisper.cpp y herramientas derivadas, aunque no se documenta en la ficha. No hay informacion sobre vLLM, TGI u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma/enfoque | Licencia | WER declarado |
|---|---|---|---|---|
| Nuttyman/whisper-tiny_to_candian_accent_oct30_2ndrun | 37,76 M | Ingles canadiense (fine-tuning) | Apache 2.0 | 21,37 % (Canadian English) |
| openai/whisper-tiny (base) | 39 M (aprox.) | Multilingue (99 idiomas) | MIT | no disponible para este dataset |
| openai/whisper-small | 244 M (aprox.) | Multilingue (99 idiomas) | MIT | no disponible |

Nota: el modelo base whisper-tiny es la alternativa directa sin adaptacion regional; whisper-small ofrece mayor capacidad a cambio de mas recursos. No se dispone de WER comparables sobre el mismo dataset para ninguna de las alternativas.

## Limitaciones y advertencias

- El WER de 21,37 % es elevado para produccion critica: aproximadamente 1 de cada 5 palabras transcritas puede ser erronea. Conviene validar con audio propio antes de desplegar.
- Resultados no verificados: las metricas provienen del model-index declarado por el autor y no han pasado verificacion de HuggingFace.
- Posible sobreajuste: la perdida de entrenamiento cae de forma marcada mientras la validacion se estanca y el WER empeora ligeramente tras el paso 1000; el checkpoint final puede no ser el optimo.
- La model card esta generada automaticamente y carece de documentacion sobre usos previstos, limitaciones y composicion del dataset ("More information needed").
- Restringido al ingles; no es util para otros idiomas ni para hablantes sin acento canadiense sin evaluacion previa.
- Riesgo de alucinaciones tipico de la familia Whisper (repeticiones o texto inventado en silencios o audio ruidoso), no evaluado en este caso.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque el modelo hereda las limitaciones del modelo base de OpenAI.
- Popularidad muy baja (41 descargas, 2 likes): comunidad minima, sin issues ni ejemplos de terceros.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/Nuttyman/whisper-tiny_to_candian_accent_oct30_2ndrun
- Modelo base: https://huggingface.co/openai/whisper-tiny
- No se han encontrado enlaces a papers, blogs, repositorios externos ni demos en la informacion disponible.
