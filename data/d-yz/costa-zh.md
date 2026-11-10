# D-YZ/CoSTA-ZH

## Resumen

CoSTA-ZH es un checkpoint de dialogo hablado en chino derivado de Step-Audio-2-mini, publicado por el autor D-YZ y asociado al articulo "CoSTA: Compressed Speech Token Adaptation for Efficient Spoken Dialogue Models" (arXiv:2610.21143). El modelo implementa una adaptacion de tokens de habla comprimidos: el modelo de lenguaje genera secuencias de tokens de habla que se comprimen mediante un vocabulario BPE aprendido y se expanden de forma sin perdida al espacio original de tokens antes de la sintesis de onda. La arquitectura subyacente es la de Step-Audio-2-mini, un modelo any-to-any (texto y habla) de tipo transformer con decodificador de voz externo token2wav.

El checkpoint final incorpora pesos en BF16 con 238.352 identificadores de token (texto y habla), incluyendo 80.000 tokens de habla anadidos. El vocabulario BPE de habla asociado tiene 86.656 entradas: 6.656 unidades originales y 80.000 unidades fusionadas. El objetivo es reducir la longitud de las secuencias de tokens de habla generadas por el LLM, manteniendo la fidelidad de la sintesis, para hacer mas eficiente el dialogo hablado.

El modelo tiene 8.885.981.440 parametros totales, se distribuye en formato safetensors con codigo custom de Transformers (no usa el pipeline generico) y esta liberado bajo licencia Apache-2.0. Su relevancia actual radica en la eficiencia de los modelos de dialogo hablado: la compresion de tokens de habla reduce el coste computacional de la generacion autoregresiva en dominios de audio, un cuello de botella habitual en sistemas speech-to-speech.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer any-to-any (texto y habla) basada en Step-Audio-2-mini, con compresion de tokens de habla via BPE aprendido y decodificador de voz externo token2wav |
| Parametros totales | 8.885.981.440 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), con config.json, configuration_step_audio_2.py y modeling_step_audio_2.py |

## Arquitectura y entrenamiento

CoSTA-ZH parte de Step-Audio-2-mini y aplica una adaptacion en tres etapas: extension de vocabulario con inicializacion por media, adaptacion de pronunciacion (primero una etapa de embeddings y LM-head, despues una etapa de LLM completo) y adaptacion a dialogo speech-to-speech. La innovacion central es la compresion de las secuencias de tokens de habla generadas por el LLM mediante un vocabulario BPE aprendido; los tokens generados se expanden de forma sin perdida al espacio original de tokens de habla antes de la sintesis de onda. El tokenizador de habla original y el decodificador de onda se conservan, y el decodificador token2wav se obtiene del modelo base.

Los datos de adaptacion de pronunciacion se basan en Emilia con conversion de voz mediante Seed-VC, y la preparacion de dialogo sigue OpenS2S con sintesis de habla del asistente mediante CosyVoice 2. El vocabulario BPE de habla tiene 86.656 entradas (6.656 unidades originales y 80.000 fusionadas), y el modelo final contiene 238.352 IDs de token de texto y habla, con 80.000 tokens de habla anadidos. Gran parte de los datos de adaptacion es sintetica, segun advierte el propio autor.

## Capacidades

- Generacion de dialogo hablado speech-to-speech en chino.
- Generacion de texto y razonamiento integrados en el mismo modelo any-to-any.
- Compresion eficiente de secuencias de tokens de habla mediante BPE aprendido.
- Expansion sin perdida de tokens comprimidos al espacio original antes de la sintesis de onda.
- Sintesis de voz mediante el decodificador externo token2wav del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al chino (zh).
- Modo thinking, vision o audio de entrada: no disponible en la informacion proporcionada.

## Casos de uso

- Dialogo hablado en chino para asistentes conversacionales: el modelo genera respuestas de voz de forma nativa (speech-to-speech), adecuado para sistemas de atencion al cliente en chino que requieran interaccion oral.
- Evaluacion de eficiencia en generacion de habla: gracias a la compresion de tokens de habla, sirve para medir la reduccion de coste computacional en la generacion autoregresiva de audio frente a modelos sin compresion.
- Investigacion en compresion de tokens de habla: el checkpoint y sus ficheros BPE (speech_bpe_tokenizer.json, speech_bpe_vocab_int.jsonl, audio_bpeid_to_llmid.json) permiten reproducir y extender el metodo CoSTA.
- Prototipado de sistemas speech-to-speech: integrable en pipelines de investigacion que usen el repositorio CoSTA y Transformers 4.49.0 con la implementacion custom.
- Evaluacion comparativa en URO-Bench: el modelo esta preparado para evaluarse en dicho benchmark de dialogo hablado segun el articulo.
- Adaptacion de pronunciacion y dialogo: el pipeline de entrenamiento (Emilia + Seed-VC, OpenS2S + CosyVoice 2) sirve como referencia para adaptar otros modelos de habla a un idioma o dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el articulo (arXiv:2610.21143) reporta evaluacion en URO-Bench, pero los valores concretos no se incluyen en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 8.885.981.440 parametros en BF16, los pesos ocupan aproximadamente 17,8 GB (tamano del repo), por lo que se necesita al menos esa cantidad de VRAM mas el coste del decodificador token2wav y del contexto.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el volumen de pesos en BF16, no cabe en GPUs de consumo con menos de 24 GB sin cuantizacion, y no se documentan recetas de cuantizacion.
- Opciones de despliegue: el flujo soportado es el repositorio CoSTA con Transformers 4.49.0 y la implementacion custom (inference/infer_costa.sh). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, y se advierte que el pipeline generico de Transformers no es el punto de entrada para inferencia de dialogo hablado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| CoSTA-ZH | 8.885.981.440 | no disponible | zh | Apache-2.0 | Checkpoint de dialogo hablado con compresion BPE de tokens de habla |
| stepfun-ai/Step-Audio-2-mini | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Modelo base del que deriva CoSTA-ZH |
| Otros modelos de dialogo hablado | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Gran parte de los datos de adaptacion es sintetica (Emilia con Seed-VC, OpenS2S con CosyVoice 2), lo que puede introducir artefactos o sesgos propios de la sintesis.
- Los resultados pueden contener errores factuales (riesgo de alucinacion), segun advierte el autor.
- El rendimiento depende del idioma de entrada y de las condiciones acusticas; el modelo esta orientado al chino.
- La evaluacion se centra en dialogo hablado general, no en dominios especializados.
- No se documentan longitudes de contexto ni recetas de cuantizacion, lo que limita el despliegue en entornos con restricciones de memoria.
- El uso comercial esta permitido por la licencia Apache-2.0, pero debe revisarse el fichero NOTICE por la atribucion a Step-Audio-2-mini.
- Requiere Transformers 4.49.0 y la implementacion custom; no es compatible con el pipeline generico de Transformers.
- Los datos de entrenamiento y evaluacion preparados se publican por separado y no se incluyen en el repositorio del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/D-YZ/CoSTA-ZH
- Articulo: https://arxiv.org/abs/2610.21143
- Codigo e instrucciones: https://github.com/yingzhuodeng/CoSTA
- Modelo base: https://huggingface.co/stepfun-ai/Step-Audio-2-mini
