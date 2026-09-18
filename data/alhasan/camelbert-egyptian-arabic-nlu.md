# Alhasan/camelbert-egyptian-arabic-nlu

## Resumen

Se trata de un modelo de comprensión del lenguaje natural para árabe egipcio orientado a asistentes de voz, publicado por el usuario Alhasan en HuggingFace. No es un modelo generativo: es un encoder transformer de tipo BERT con dos cabezas, una para clasificación de intención sobre el token `[CLS]` y otra para etiquetado de slots en formato BIO sobre la secuencia de tokens. Parte del modelo base CAMeL-Lab/bert-base-arabic-camelbert-da y tiene 110 millones de parámetros.

El problema que resuelve es el parseo de comandos de voz en dialecto egipcio: convertir una frase como "صحيني بكرة الساعة ستة الصبح" en una estructura `{"intent": "alarm_set", "slots": {"date": "بكرة", "time": "ستة الصبح"}}`. El autor lo presenta explícitamente como alternativa a usar un LLM para esta tarea, argumentando que un encoder con esquema fijo es más barato y más preciso porque no puede inventarse un valor de slot: solo señala fragmentos presentes en la entrada.

Es relevante ahora porque el ajuste fino se hizo sobre Amazon MASSIVE `ar-SA` más 6.500 reescrituras sintéticas en egipcio generadas por LLM y filtradas por reglas. Según el autor, esa ampliación aportó +6,0 puntos de exact match (IC 95% [+1,5, +10,5], bootstrap emparejado) y fue el único punto del proyecto donde la mejora resultó estadísticamente significativa. El repositorio tiene 0 descargas y 0 likes, y el propio autor advierte que el checkpoint probablemente está infraentrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT con dos cabezas (clasificación de intención sobre `[CLS]` + etiquetado BIO de slots) sobre CAMeL-Lab/bert-base-arabic-camelbert-da |
| Parametros totales | 110 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 64 tokens (`max_length` usado en entrenamiento); límite máximo de la arquitectura base: no disponible |
| Tipos de cuantizacion | No disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Árabe (árabe egipcio para la tarea ajustada; base CAMeLBERT-DA entrenada en árabe) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`model.pt`), acompañado de `meta.json` (modelo base, lista de intenciones, lista de etiquetas BIO, longitud máxima) y el tokenizer |

Datos adicionales: pipeline declarado `token-classification`, tamaño del repositorio 0,4 GB, etiquetas `intent-classification`, `slot-filling`, `voice-assistant`.

## Arquitectura y entrenamiento

La arquitectura parte de CAMeLBERT-DA, un encoder BERT-base para árabe, al que se añaden dos cabezas: una de clasificación de intención que opera sobre la representación de `[CLS]`, y otra de etiquetado de secuencia con esquema BIO para extraer slots. El esquema es cerrado: 60 intenciones y 55 tipos de slot definidos en `meta.json`. Esta arquitectura de dos cabezas es personalizada, por lo que el modelo no se carga con `transformers` de forma estándar, sino con el código del proyecto (`lahja.models.encoder.EncoderPredictor`).

El ajuste fino se realizó sobre Amazon MASSIVE en su variante `ar-SA` más 6.500 reescrituras en egipcio generadas por LLM y filtradas por reglas. La configuración de entrenamiento fue de 4 épocas, optimizador AdamW con learning rate 5e-5, batch de 32, longitud máxima de 64 tokens y warmup lineal, conservando la mejor época según exact match de validación. El autor indica que la validación seguía mejorando en la época 4, por lo que el checkpoint probablemente está infraentrenado y más épocas deberían mejorar el resultado.

## Capacidades

- Clasificación de intención en árabe egipcio sobre un conjunto cerrado de 60 intenciones (por ejemplo `alarm_set`, `weather_query`).
- Extracción de slots mediante etiquetado BIO sobre los tokens de entrada, con 55 tipos de slot definidos (por ejemplo `date`, `time`, `place_name`).
- Salida estructurada conjunta en formato JSON con intención y diccionario de slots.
- Extracción extractiva por diseño: los valores de slot se corresponden con fragmentos literales de la entrada, lo que impide generar valores inexistentes en el esquema.
- Procesamiento de entradas cortas orientadas a comandos de voz (hasta 64 tokens en la configuración entrenada).
- Inferencia de baja latencia: 0,02 s de mediana (p50) según la comparativa publicada por el autor.
- No dispone de tool calling, function calling, capacidades de agente, modo de razonamiento explícito, visión ni audio. Tampoco genera texto libre: es un modelo discriminativo.

## Casos de uso

- Asistentes de voz en dialecto egipcio: el modelo convierte una frase hablada transcrita en una intención y sus parámetros, que el backend del asistente ejecuta (crear alarma, consultar el tiempo, reproducir música). Su latencia de 0,02 s de mediana lo hace adecuado para pipelines de diálogo por turnos.
- Enrutado de intenciones en un sistema de atención al cliente: con 60 intenciones predefinidas, se puede clasificar la petición entrante y derivarla al flujo correspondiente sin coste de API por consulta.
- Extracción de entidades en comandos estructurados: fechas, horas y nombres de lugar se devuelven como spans literales de la entrada, lo que reduce el riesgo de valores alucinados en sistemas de reservas o recordatorios.
- Preprocesado de bajo coste delante de un LLM: usar el encoder para resolver los casos que encajan en el esquema fijo y delegar en un modelo generativo solo los que no, reduciendo el coste por petición.
- Despliegue en dispositivos con recursos limitados: con 110 millones de parámetros (aproximadamente 440 MB en fp32), es viable en CPU y en GPUs de gama baja, a diferencia de alternativas de 0,6B o 1,7B parámetros.
- Investigación sobre dialectos árabes: sirve como punto de comparación reproducible (encoder ajustado frente a LLM con LoRA) para estudiar el efecto de datos sintéticos en una tarea de comprensión con esquema cerrado.
- Prototipado rápido de interfaces de voz en egipcio: el repositorio incluye instrucciones de instalación (`make setup`) y descarga de pesos, lo que permite tener una demo funcional con pocas líneas de código.

## Benchmarks y rendimiento

Los únicos datos publicados provienen de la model card del autor y corresponden a exact match sobre un conjunto de test en egipcio. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de NLU.

| Modelo | Parametros | Test egipcio (exact match) | Latencia p50 |
|---|---:|---:|---:|
| Este encoder | 110M | 0,625 | 0,02 s |
| Qwen3-1.7B + LoRA | 1,7B | 0,590 | no disponible |
| Qwen3-0.6B + LoRA | 596M | 0,510 | 0,55 s |
| Claude Sonnet 5, 5-shot | no aplica (API) | 0,435 | ~1 s (API) |

El autor reporta además que la incorporación de los datos sintéticos en egipcio aportó +6,0 puntos de exact match (IC 95% [+1,5, +10,5], bootstrap emparejado). No se especifica el hardware ni el entorno en el que se midieron las latencias, ni el tamaño exacto del conjunto de test.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB. El state dict ocupa unos 440 MB en fp32 y en torno a 220 MB en fp16, más el coste de activaciones de un encoder de 110M parámetros con secuencias de 64 tokens.
- GPU recomendadas: cualquier GPU con más de 1 GB de memoria es suficiente. No se requiere A100, H100 ni RTX 4090; una GPU integrada o una GTX 1650 bastan para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en hardware muy limitado. También es viable la inferencia en CPU, dado el tamaño del modelo y la latencia reportada.
- Opciones de despliegue: el modelo no se carga con `transformers` de serie, ya que las dos cabezas son personalizadas. El método documentado es clonar el repositorio de GitHub, ejecutar `make setup`, descargar los pesos con `hf download` y usar `lahja.models.encoder.EncoderPredictor`. No hay integración documentada con vLLM, llama.cpp, Ollama ni TGI; tampoco se publican pesos GGUF. La exportación a ONNX o TorchScript sería técnicamente viable al tratarse de un encoder BERT estándar, pero no está documentada en el repositorio.
- Latencia y throughput: el autor reporta 0,02 s de latencia p50 para este encoder, frente a 0,55 s de Qwen3-0.6B + LoRA y aproximadamente 1 s de Claude Sonnet 5 con 5 ejemplos en el prompt. No se publica throughput (peticiones por segundo) ni las condiciones de medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en egipcio | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Este encoder (Alhasan/camelbert-egyptian-arabic-nlu) | 110M | 64 tokens en entrenamiento | 0,625 exact match | Apache 2.0 | HuggingFace + GitHub, requiere código propio para cargarlo |
| Qwen3-1.7B + LoRA | 1,7B | no disponible | 0,590 exact match | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Qwen3-0.6B + LoRA | 596M | no disponible | 0,510 exact match | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Claude Sonnet 5, 5-shot | no aplica (API) | no disponible | 0,435 exact match | propietaria | API comercial |

Como alternativas de la misma categoría (encoders multilingües o árabes para NLU) existen mBERT, XLM-R base y el propio CAMeLBERT-DA sin ajustar, pero la información disponible no incluye resultados de ninguno de ellos en árabe egipcio para esta tarea, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Solo cubre árabe egipcio. El autor indica que otros dialectos árabes no han sido evaluados.
- Esquema fijo de 60 intenciones y 55 tipos de slot. Añadir una intención nueva exige reentrenar el modelo, mientras que en un LLM bastaría con modificar el prompt.
- Rendimiento más bajo en las intenciones de música: 0,25 de exact match en `music` y 0,40 en `play`, donde los slots son nombres de canciones y artistas.
- El propio autor señala que la validación seguía mejorando en la época 4, por lo que el checkpoint publicado probablemente está infraentrenado. Los resultados de la tabla deben leerse como un suelo, no como el techo del enfoque.
- Al ser un modelo discriminativo con extracción extractiva, no puede generar valores de slot que no aparezcan literalmente en la entrada. Esto reduce las alucinaciones de valores, pero también implica que no normaliza ni reformatea fechas, horas o nombres.
- Riesgo de error en la clasificación de intención cuando la entrada es ambigua o contiene varias peticiones; el modelo devuelve una única intención por frase.
- El rendimiento fuera del dominio de comandos de voz (texto largo, conversación abierta, texto formal en árabe estándar moderno) no está documentado y previsiblemente será peor.
- No hay versiones cuantizadas ni formatos GGUF, safetensors o similar. Los pesos se distribuyen como `model.pt`, lo que implica confiar en el código del repositorio para deserializarlos.
- La carga requiere el código del proyecto; no es compatible con `AutoModelForTokenClassification` de `transformers` sin adaptaciones.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base CAMeLBERT-DA y el corpus Amazon MASSIVE tienen sus propias condiciones, que conviene revisar antes de un despliegue en producción.
- Adopción nula hasta la fecha de consulta: 0 descargas y 0 likes, sin validación independiente de los resultados.
- Los datos de la comparativa (incluida la entrada de Claude Sonnet 5) proceden del autor y no se han replicado de forma independiente. Tampoco se documentan el hardware ni el conjunto de evaluación.
- La búsqueda web realizada no devolvió información relevante sobre este modelo: los resultados obtenidos correspondían a pruebas de velocidad de conexión a internet y no guardan relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Alhasan/camelbert-egyptian-arabic-nlu
- Repositorio del proyecto: https://github.com/Alhasan-Abdellatif/Egyptian-Arabic-understanding-for-voice-assistants
- Modelo base CAMeLBERT-DA: https://huggingface.co/CAMeL-Lab/bert-base-arabic-camelbert-da
- Corpus Amazon MASSIVE: https://github.com/alexa/massive
- Benchmarks, papers y demos adicionales: no disponible (la búsqueda web no devolvió resultados relacionados con el modelo).
