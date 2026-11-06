# Nuttyman/whisper-tiny_to_canadian_accent_oct30_3rdrun

## Resumen

Whisper tiny Canadian es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, desarrollado por el usuario Nuttyman y publicado en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) especializado en ingles canadiense, entrenado sobre el dataset Canadian_english con el objetivo de mejorar la transcripcion de hablantes con acento canadiense frente al modelo base generico.

El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante tiny, con 37,7 millones de parametros totales y un tamano de repositorio de 0,6 GB. La ventana de contexto de Whisper tiny es de 30 segundos de audio por segmento, y el modelo esta pensado exclusivamente para ingles. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es limitada pero concreta: es un ejemplo de adaptacion de dominio de bajo coste computacional para una variante dialectal del ingles. Con un WER declarado de 21,53 % sobre el split de test del dataset Canadian_english, el rendimiento es modesto en terminos absolutos, coherente con el tamano tiny del modelo base, pero util como referencia para experimentos de ajuste fino de ASR en acentos especificos y para despliegues con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento (ventana estandar de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper tiny: un transformer encoder-decoder con 4 capas en encoder y 4 en decoder, atencion multi-cabeza y una representacion de audio basada en espectrogramas log-Mel de 80 canales. Whisper procesa el audio en ventanas de 30 segundos y genera la transcripcion de forma autorregresiva con tokens especiales para marcar idioma, tarea y timestamps.

El ajuste fino se realizo sobre el dataset Canadian_english con los siguientes hiperparametros declarados en la model card: learning rate de 6e-6, batch de entrenamiento de 8, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-8), scheduler lineal con 300 pasos de warmup y 4000 pasos totales de entrenamiento. No se documentan el numero total de tokens de audio, la composicion detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo ASR). El framework utilizado fue Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

Los resultados de validacion muestran un sobreajuste claro: la perdida de entrenamiento baja de 0,0426 a 0,0010 entre los pasos 1000 y 4000, mientras que la perdida de validacion sube de 0,4490 a 0,5228 y el WER empeora ligeramente de 21,53 % a 22,13 %. El mejor checkpoint en validacion corresponde al paso 1000 (epoca 4), con WER de 21,5316 y perdida de 0,4490.

## Capacidades

- Transcripcion de voz a texto en ingles, con especial enfasis en hablantes con acento canadiense.
- Reconocimiento de habla sobre segmentos de audio de hasta 30 segundos por ventana.
- Generacion de timestamps a nivel de segmento (capacidad heredada de la arquitectura Whisper).
- Deteccion de idioma y tarea (transcripcion o traduccion) mediante tokens especiales, aunque el ajuste fino solo cubre ingles.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni uso como agente.
- Capacidades multilingues limitadas al ingles; no se documenta soporte para otras lenguas tras el ajuste fino.
- No dispone de modo thinking, vision ni audio generation.

## Casos de uso

- Transcripcion de audio canadiense en entornos de bajos recursos: el modelo, con solo 37,7 millones de parametros, puede ejecutarse en CPU o en GPUs de gama baja para transcribir entrevistas, reuniones o notas de voz de hablantes canadienses, con la ventaja de su reducido consumo de memoria (0,6 GB de pesos).
- Prototipado rapido de pipelines ASR: sirve como base para experimentos de ajuste fino adicional o para validar arquitecturas de preprocesado de audio antes de escalar a modelos mayores como Whisper medium o large.
- Subtitulado automatico de contenido audiovisual de baja criticidad: util para generar subtitulos borrador en videos internos o material de formacion donde un WER cercano al 21 % es aceptable y se corrige posteriormente de forma manual.
- Investigacion sobre adaptacion de acento: referencia para estudios que comparan tecnicas de fine-tuning en variantes dialectales del ingles, dado que documenta hiperparametros y curva de entrenamiento completa.
- Despliegue en dispositivos edge: su tamano permite integracion en sistemas embebidos o aplicaciones moviles que requieran transcripcion offline en ingles.
- Evaluacion comparativa de modelos ASR: util como linea base de bajo coste en benchmarks internos frente a Whisper base, small o modelos especializados en acentos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Canadian | Canadian English (split test) | WER | 21,5316 |
| Whisper tiny Canadian | Canadian English (validacion, paso 1000) | WER | 21,5316 |
| Whisper tiny Canadian | Canadian English (validacion, paso 4000) | WER | 22,1348 |

No se han publicado en la informacion disponible resultados comparativos con el modelo base openai/whisper-tiny ni con otros modelos sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en precision fp32 (pesos de 37,7 millones de parametros); menos de 0,3 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluidas GTX 1050, RTX 2060, RTX 3060, T4, A100 o H100 (estas ultimas sobredimensionadas para el modelo).
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM no aplica de forma estandar para Whisper tiny, llama.cpp no soporta este modelo, TGI con soporte ASR limitado; alternativa practica es el pipeline de transformers o Faster-Whisper para CPU.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera procesamiento en tiempo real o mejor en CPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | WER (Canadian English) | Licencia |
|---|---|---|---|---|---|
| Whisper tiny Canadian (este modelo) | 37,7 M | 30 s | en | 21,53 % (declarado) | Apache 2.0 |
| openai/whisper-tiny | 39 M | 30 s | multilingue | no disponible en este dataset | Apache 2.0 |
| openai/whisper-base | 74 M | 30 s | multilingue | no disponible en este dataset | Apache 2.0 |
| openai/whisper-small | 244 M | 30 s | multilingue | no disponible en este dataset | Apache 2.0 |

No se dispone de resultados comparativos publicados sobre el dataset Canadian_english para los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- WER de 21,53 % en test: valor alto en terminos absolutos, adecuado solo para aplicaciones donde la transcripcion se revisa o corrige posteriormente.
- Sobreajuste documentado: la perdida de validacion aumenta a partir del paso 1000, por lo que el checkpoint final no es el mejor en validacion.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un dataset especifico de ingles canadiense, puede degradar el rendimiento en otros acentos o variantes del ingles.
- Riesgo de alucinacion: Whisper es propenso a generar texto inventado en segmentos con ruido o silencio; el ajuste fino no corrige esta limitacion estructural.
- Limitaciones de contexto: ventana fija de 30 segundos por segmento; audios mas largos requieren segmentacion externa.
- Limitaciones de idioma: solo ingles; no se garantiza comportamiento correcto en otras lenguas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base openai/whisper-tiny tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Caveats para produccion: modelo de 0,6 GB y 37,7 M de parametros con calidad limitada; no recomendado para transcripcion critica sin revision humana. La model card indica "More information needed" en varias secciones, lo que reduce la trazabilidad del dataset y del procedimiento de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Nuttyman/whisper-tiny_to_canadian_accent_oct30_3rdrun
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Documentacion de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
