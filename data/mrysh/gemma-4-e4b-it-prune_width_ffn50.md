# mrysh/gemma-4-e4b-it-prune_width_ffn50

## Resumen

`mrysh/gemma-4-e4b-it-prune_width_ffn50` es una version podada por anchura del modelo `google/gemma-4-E4B-it` de Google, publicada por el usuario mrysh como parte de un benchmark de poda (4 modelos x 8 variantes) que compara distintas tecnicas de pruning frente a cuantizacion sobre BFCL, hiring-bias y MedQA, evaluadas con vLLM. No se trata de un modelo pensado para produccion, sino de un artefacto experimental para medir la degradacion de calidad que introduce la poda sin reentrenamiento posterior.

La poda se aplico con NVIDIA ModelOpt (Minitron) en modo width a nivel 0,5: la dimension de las capas FFN se reduce de 10240 a 5120 en todas las capas, mientras que el numero de capas permanece intacto. La importancia de las neuronas se midio sobre un conjunto de calibracion de 512 muestras mixtas. El checkpoint resultante contiene 6.289.593.674 parametros (12,6 GB en safetensors), lo que supone una reduccion del 22,7 % de los parametros del modelo de lenguaje y del 21,3 % del checkpoint completo.

El interes de esta ficha es acotado: sirve como referencia de cuanto rendimiento se pierde al recortar la anchura del FFN a la mitad sin destilacion ni fine-tuning, y como ejemplo practico del flujo de poda de ModelOpt sobre un modelo multimodal de la familia Gemma 4. No hay datos publicados de benchmarks especificos de esta variante en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: google/gemma-4-E4B-it); poda de anchura en capas FFN |
| Parametros totales | 6.289.593.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor evalua cuantizacion como comparativa en el benchmark, sin detallar formatos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it` y conserva su arquitectura transformer, con la unica modificacion de la poda de anchura aplicada por NVIDIA ModelOpt Minitron: la dimension del FFN de cada capa pasa de 10240 a 5120 (50 % solicitado), sin alterar el numero de capas. La seleccion de neuronas se basa en una medida de importancia calculada sobre 512 muestras mixtas de calibracion. Los bloques de vision y audio del modelo base, si los tiene, se mantienen intactos; solo se poda la parte de lenguaje. El autor indica que la herramienta de poda elimina la cabeza de prediccion multi-token de Qwen3.5 (nota que figura tal cual en la model card).

No se realizo destilacion ni fine-tuning despues de la poda, por lo que la model card advierte explicitamente de una caida de calidad frente al modelo base. El benchmark en el que se integra esta variante tiene como objetivo medir precisamente esa degradacion, comparando las variantes podadas entre si y con cuantizacion. No se detallan en la informacion disponible el volumen de tokens de entrenamiento original, la composicion del dataset ni si el modelo base uso RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados del modelo base, con la calidad degradada por la poda sin reentrenamiento.
- Evaluado en el benchmark como modelo de texto con vLLM y modo thinking desactivado.
- Soporte de tool calling evaluado mediante BFCL (Berkeley Function Calling Leaderboard) en el benchmark del autor.
- Capacidades multimodales (vision y audio) potencialmente presentes si el modelo base las tiene, ya que esos bloques no se podan; no se confirma su funcionamiento tras la poda en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan modos especiales (thinking, agentes multi-paso) mas alla de la herencia del modelo base.

## Casos de uso

- Benchmark de poda: usar esta variante como punto de comparacion frente a otras tecnicas de pruning y frente a cuantizacion, midiendo la caida en BFCL, hiring-bias y MedQA con vLLM. Es el proposito declarado del checkpoint.
- Investigacion sobre compresion de modelos: analizar el impacto de reducir la anchura del FFN al 50 % sin destilacion, comparando la degradacion por tarea y por tipo de prompt.
- Estudio de sesgos: el benchmark incluye hiring-bias, por lo que la variante sirve para medir si la poda amplifica o atenua sesgos de contratacion respecto al modelo base.
- Evaluacion de calidad en dominio medico: MedQA forma parte del conjunto de evaluacion, lo que permite cuantificar la perdida de precision en preguntas clinicas tras la poda.
- Referencia para pipelines de ModelOpt: sirve como ejemplo reproducible del flujo de poda width con Minitron sobre un modelo multimodal de la familia Gemma 4.
- Docencia y formacion: ilustrar en cursos o talleres el compromiso entre tamano, coste de inferencia y calidad en modelos podados.
- Baseline para experimentos de recuperacion: punto de partida para probar si un fine-tuning ligero posterior a la poda recupera parte de la calidad perdida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo se evalua en BFCL, hiring-bias y MedQA con vLLM (thinking off) dentro del benchmark del autor, pero no incluye las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 12,6 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, 16-24 GB de VRAM para contextos moderados.
- Cuantizacion a 8 bits: en torno a 6-7 GB de pesos; a 4 bits, en torno a 3-4 GB, aunque no se documentan formatos de cuantizacion soportados para esta variante.
- GPU recomendadas: A100 o H100 para evaluacion a gran escala con vLLM; RTX 4090 (24 GB) suficiente para BF16 en contextos moderados.
- Cabe en GPU de consumo: si, en RTX 4090 y previsiblemente en GPUs de 16 GB con cuantizacion.
- Opciones de despliegue: vLLM es el motor usado en el benchmark del autor; llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/gemma-4-e4b-it-prune_width_ffn50 | 6.289.593.674 | no disponible | Apache 2.0 | Poda width FFN 50 %, sin reentrenamiento |
| google/gemma-4-E4B-it | no disponible | no disponible | Apache 2.0 (segun model card de la variante) | Modelo base sin podar; referencia de calidad |
| Otras variantes del benchmark del autor | no disponible | no disponible | no disponible | 8 variantes de poda x 4 modelos; cifras no publicadas en la informacion disponible |

## Limitaciones y advertencias

- Caida de calidad esperada frente al modelo base: no hubo destilacion ni fine-tuning tras la poda, tal como advierte el autor.
- Reduccion del 22,7 % de parametros del modelo de lenguaje (21,3 % del checkpoint completo), con FFN a la mitad en todas las capas; el impacto por tarea no esta cuantificado en la informacion disponible.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; previsiblemente mayor que en el modelo base por la perdida de capacidad.
- Sesgos: el benchmark incluye hiring-bias, pero no se publican resultados; se desconoce si la poda amplifica sesgos.
- Capacidades multimodales no verificadas tras la poda: los bloques de vision y audio se conservan, pero no se documenta su funcionamiento.
- Idiomas soportados no documentados en esta variante.
- Licencia Apache 2.0 heredada del modelo base, con los terminos adicionales que el modelo base pudiera imponer; conviene revisar la model card de `google/gemma-4-E4B-it`.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; no apto como sustituto directo del modelo base en produccion.
- La model card menciona que la herramienta de poda elimina la cabeza de prediccion multi-token de Qwen3.5, una nota que no parece aplicar a este modelo y que conviene tratar con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrysh/gemma-4-e4b-it-prune_width_ffn50
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- NVIDIA ModelOpt (libreria de poda): no disponible en la informacion proporcionada
- Paper de Minitron: no disponible en la informacion proporcionada
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la informacion proporcionada
