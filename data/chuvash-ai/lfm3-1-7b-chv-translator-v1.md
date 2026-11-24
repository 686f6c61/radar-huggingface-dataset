# chuvash-ai/LFM3-1.7B-chv-translator-v1

## Resumen

LFM3-1.7B-chv-translator-v1 es un modelo de traduccion bidireccional ruso-chuvasio (ru ↔ cv) desarrollado por chuvash-ai mediante fine-tuning del modelo base LiquidAI/LFM3-1.7B-Base. El chuvasio es una lengua turquica minoritaria hablada en la region del Volga, con escasa representacion en los corpus de entrenamiento de los grandes modelos, por lo que este proyecto aborda el problema concreto de la traduccion automatica de calidad para un par de lenguas de bajos recursos. El modelo cuenta con 1.728.801.536 parametros y se distribuye en formato safetensors con licencia LFM Open License v1.0.

La contribucion tecnica principal es la extension del tokenizador con 258 tokens BPE adicionales (las letras chuvasias ӑ, ӗ, ҫ, ӳ mas 250 fusiones de alta frecuencia), lo que eleva la compresion del texto chuvasio de 1,46 a 2,32 caracteres por token sin alterar la tokenizacion rusa. El entrenamiento combina continued pre-training (CPT) sobre un mono-corpus de 3,1 millones de lineas con supervised fine-tuning (SFT) sobre un corpus paralelo revisado de 1,24 millones de pares. El resultado es un traductor especializado que reporta chrF++ de 40,70 en ru→cv y 38,56 en cv→ru sobre un test sellado de 500 pares.

El modelo es relevante para investigadores y desarrolladores que trabajan con lenguas minoritarias y necesitan una alternativa ligera (1,7B parametros) y desplegable en hardware modesto, frente a soluciones propietarias de traduccion que no cubren el chuvasio o lo hacen con calidad deficiente. Su integracion con el ecosistema transformers, la disponibilidad de cuantizaciones GGUF y el soporte de LM Studio lo hacen practico para prototipos y despliegues locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (transformer, arquitectura `lfm3` de LiquidAI); requiere `trust_remote_code=True` |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q4_K_M; inferencia nativa en bfloat16 |
| Idiomas soportados | ruso (ru), chuvasio (cv) |
| Licencia | LFM Open License v1.0 (hereda de LiquidAI/LFM3-1.7B-Base); datos CC0 |
| Formato de pesos | safetensors (transformers), GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B-Base, un transformer de 1,7B parametros de la familia LFM3 de LiquidAI, y se especializa mediante un pipeline en varias fases. Primero se descargaron y limpiaron 1,4 millones de pares de traduccion y se reservo un conjunto de test sellado con sha256. A continuacion se amplio el vocabulario del tokenizador con 258 tokens BPE (las cuatro letras chuvasias especificas mas 250 fusiones frecuentes), escribiendo las nuevas filas de embeddings en filas libres del checkpoint (ids 125033-127999) sin recurrir a `resize_token_embeddings` y manteniendo `lm_head` atado, con inicializacion "rusificada" de dichas filas. Despues se aplico continued pre-training (CPT) sobre un mono-corpus chuvasio de 3,1 millones de lineas y, finalmente, SFT sobre el corpus paralelo revisado chuvash-ai/chuvash-ru-parallel-reviewed (1,24 millones de pares, revisado por LLM).

Una innovacion destacable es el uso del chat template nativo de LFM3 con traza de pensamiento vacia (`enable_thinking=False`), de modo que el mismo render se emplea tanto en entrenamiento como en inferencia y el modelo no emite etiquetas de razonamiento. El checkpoint final se evaluo con chrF++ (greedy, `repetition_penalty=1.08`, `word_order=2`) sobre el test sellado, y se realizo una bateria de sanity check A1-A2 con 36 frases simples, de las cuales aproximadamente 30 resultaron impecables, 1 con error grave y 4 con fallos menores.

## Capacidades

- Traduccion bidireccional ruso ↔ chuvasio, con la direccion controlada mediante instruccion en el mensaje de usuario ("Переведи на чувашский язык." / "Переведи на русский язык.").
- Generacion de texto en chuvasio y ruso a nivel conversacional A1-A2 (frases simples y cotidianas).
- Tokenizacion mejorada para chuvasio: 2,32 caracteres por token frente a 1,46 del modelo base, lo que reduce el coste computacional por caracter chuvasio.
- Soporte de chat template LFM3 con `enable_thinking=False`; no emite etiquetas de razonamiento.
- Inferencia determinista recomendada (greedy o temperatura 0-0,3) con `repetition_penalty=1.08`.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso.
- Capacidades multilingues limitadas a los dos idiomas del par (ru, cv); no se garantiza comportamiento en otras lenguas.

## Casos de uso

- Traduccion de documentacion oficial y administrativa entre ruso y chuvasio: el modelo puede procesar parrafos completos en una sola llamada y mantener terminologia consistente gracias al SFT sobre corpus paralelo revisado; adecuado para digitalizar materiales publicos de la region del Volga.
- Localizacion de interfaces y contenidos web al chuvasio: integrable en pipelines de CI/CD mediante la API de transformers, con salida determinista (greedy) para facilitar revisiones y control de versiones de las traducciones.
- Atencion al ciudadano en chuvasio: el modelo permite construir asistentes conversacionales que traduzcan consultas de usuarios chuvasios a ruso para su procesamiento por sistemas posteriores, y devuelvan la respuesta en chuvasio.
- Preservacion linguistica y creacion de corpus: util para generar pares de traduccion adicionales que alimenten corpus paralelos, con la cautela de revisar humanamente las salidas por el riesgo de alucinacion.
- Traduccion asistida para investigadores en linguistica turquica: el modelo sirve como baseline reproducible y ligero (1,7B) para experimentos con lenguas de bajos recursos, desplegable en una unica GPU consumer.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones GGUF (Q4_K_M, Q6_K, Q8_0) y al soporte de LM Studio 2.65.1+, puede ejecutarse en equipos sin GPU dedicada para tareas de traduccion puntual.
- Traduccion de subtitulos y transcripciones de contenido audiovisual chuvasio: con `max_new_tokens` ajustado y procesamiento por segmentos, permite subtitular material en chuvasio al ruso y viceversa.

## Benchmarks y rendimiento

Metricas reportadas por el autor sobre un test sellado de 500 pares (chrF++, greedy, `repetition_penalty=1.08`, `word_order=2`):

| Direccion | chrF++ |
|---|---|
| ru → cv | 40,70 |
| cv → ru | 38,56 |

El autor advierte que estos resultados no son directamente comparables con los de LFM3-1.7B-chv-v2 (34,89 / 35,10) porque emplean un test y un protocolo distintos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, lo cual es esperable en un modelo especializado en traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB solo para pesos (1,73B parametros × 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB.
- Cuantizaciones GGUF: Q8_0 en torno a 1,8-2 GB, Q6_K en torno a 1,4-1,5 GB y Q4_K_M en torno a 1,0-1,2 GB (estimaciones segun el numero de parametros; no publicadas por el autor).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para bfloat16 (RTX 3060, RTX 4060, RTX 4090); A100 y H100 sobredimensionadas para este tamano y utiles solo para servir en lote.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas; en cuantizacion Q4_K_M puede ejecutarse en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (recomendado por el autor), llama.cpp / LM Studio con los GGUF (motor 2.65.1+ por la arquitectura `lfm3`), y potencialmente vLLM o TGI si soportan la arquitectura `lfm3` (no confirmado en la informacion disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-chv-translator-v1 | 1,73B | no disponible | Traduccion ru ↔ cv especializada | LFM Open License v1.0 | HF (safetensors + GGUF) |
| LFM3-1.7B-chv-v2 (chuvash-ai) | 1,7B (base) | no disponible | Traduccion ru ↔ cv (version previa) | LFM Open License v1.0 | HF |
| LiquidAI/LFM3-1.7B-Base | 1,7B | no disponible | Modelo base generalista | LFM Open License v1.0 | HF |
| Modelos de traduccion generalistas (p. ej. NLLB, M2M-100) | variable | variable | Traduccion multilingue general | variable (a menudo CC-BY-NC) | HF |

El autor reporta chrF++ de 34,89 / 35,10 para LFM3-1.7B-chv-v2, pero con otro test y protocolo, por lo que la comparacion no es directa. No se dispone de datos comparativos con modelos de traduccion generalistas sobre el par ru-cv en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: la bateria de sanity A1-A2 registro 1 error grave ("Который час?") y 4 fallos menores sobre 36 frases, lo que indica que la calidad no es uniforme ni garantizada.
- El modelo esta especializado exclusivamente en ru ↔ cv; no debe usarse como modelo generalista ni en otros pares de idiomas.
- La direccion de traduccion debe indicarse explicitamente en el mensaje de usuario; sin instruccion, el modelo la infiere del contexto y puede equivocarse.
- En LM Studio es imprescindible desactivar el parsing de razonamiento: con el activado, toda la salida se dirige al campo de "pensamiento" y la respuesta queda vacia.
- Requiere `trust_remote_code=True` y la arquitectura `lfm3`, lo que limita la compatibilidad con versiones antiguas de transformers, llama.cpp o LM Studio (2.65.1+).
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de un uso comercial, ya que no es una licencia permisiva estandar (Apache 2.0 o MIT).
- No se documentan sesgos especificos, pero al entrenarse sobre un corpus paralelo revisado por LLM puede heredar sesgos de dicho corpus y de los datos de origen.
- La longitud de contexto no esta publicada; se desconoce el limite practico para documentos largos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-translator-v1
- Cuantizaciones GGUF: https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-translator-v1-GGUF
- Dataset paralelo: https://huggingface.co/datasets/chuvash-ai/chuvash-ru-parallel-reviewed
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia LFM Open License v1.0: https://liquid.ai/lfm-open-license
- Version previa del proyecto: https://huggingface.co/chuvash-ai/LFM3-1.7B-chv-v2
