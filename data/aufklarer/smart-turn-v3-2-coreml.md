# aufklarer/Smart-Turn-v3.2-CoreML

## Resumen

Smart Turn v3.2 CoreML es una conversión del modelo de detección de fin de turno (end-of-turn) desarrollado por Pipecat, adaptado para plataformas Apple (iOS y macOS) mediante el formato CoreML. El modelo resuelve un problema crítico en agentes conversacionales por voz: decidir cuándo el usuario ha terminado de hablar para que el agente pueda responder sin cortar al usuario ni quedarse en silencio durante una pausa. A diferencia de los sistemas basados en transcripción, analiza directamente la forma de onda de audio (prosodia, ritmo, entonación) durante los últimos 8 segundos de habla y devuelve la probabilidad de que el turno haya finalizado.

La arquitectura se basa en el encoder Whisper Tiny (8 millones de parámetros) seguido de un mecanismo de attention pooling y una cabeza MLP. El modelo acepta audio PCM de 16 kHz mono y produce una única probabilidad, con un umbral de 0,5 para decidir si el turno está completo. Soporta 23 idiomas y se distribuye bajo licencia BSD-2-Clause. El modelo está disponible en formato CoreML compilado (`.mlmodelc`) con pesos en float16 para el encoder y la cabeza, y front-end de audio en float32. Su tamaño es de 16,8 MB y requiere iOS 17 o macOS 14 como mínimo.

La relevancia actual de este modelo radica en la creciente adopción de agentes de voz en tiempo real, donde la detección precisa del fin de turno reduce la latencia percibida y mejora la naturalidad de la conversación. Al ser open source y estar optimizado para Apple Silicon, permite integrar esta funcionalidad en aplicaciones nativas de iOS y macOS con un coste computacional mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Tiny encoder + attention pooling + MLP head |
| Parametros totales | 8,0 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8 segundos (128000 muestras a 16 kHz) |
| Tipos de cuantizacion | float16 (encoder y head), float32 (front-end de audio) |
| Idiomas soportados | arabe, bengali, chino, danes, neerlandes, ingles, finlandes, frances, aleman, hindi, indonesio, italiano, japones, coreano, marathi, noruego, polaco, portugues, ruso, espanol, turco, ucraniano, vietnamita |
| Licencia | BSD-2-Clause |
| Formato de pesos | CoreML compilado (`.mlmodelc`) |

## Arquitectura y entrenamiento

El modelo utiliza el encoder del Whisper Tiny como backbone, que procesa el espectrograma log-mel del audio de entrada. A continuacion, un mecanismo de attention pooling agrega las representaciones temporales y una cabeza MLP produce la probabilidad de fin de turno. El front-end de audio (incluida la normalizacion de la forma de onda con media cero y varianza unitaria) esta integrado dentro del propio modelo CoreML, por lo que no requiere preprocesamiento externo.

El modelo original fue entrenado por Pipecat con datos publicados en el repositorio `pipecat-ai/smart-turn-data-v3.2-*`. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. La conversion a CoreML fue realizada por el autor de este repositorio a partir del checkpoint `smart-turn-v3.2-gpu.onnx` (revision `f766f81d3cfd`), manteniendo exactamente el mismo comportamiento numerico, como se refleja en los benchmarks.

## Capacidades

- Deteccion de fin de turno (end-of-turn) basada en audio crudo, sin depender de transcripciones.
- Analisis de prosodia, ritmo y entonacion para distinguir entre una pausa breve y un cierre real del turno.
- Soporte multilingue para 23 idiomas, incluyendo espanol, ingles, frances, aleman, japones, coreano, chino, entre otros.
- Funciona en tiempo real con una ventana deslizante de 8 segundos; para turnos mas largos se conservan los ultimos 8 segundos.
- Integracion nativa con CoreML en iOS 17 y macOS 14, con ejecucion en CPU y Neural Engine.
- Salida unica: probabilidad de que el turno haya finalizado (umbral recomendado de 0,5).

## Casos de uso

- Asistentes de voz en aplicaciones moviles: el modelo permite que un asistente por voz en iOS responda inmediatamente cuando el usuario termina de hablar, evitando cortes o esperas innecesarias. Se ejecuta localmente con una latencia media de 3,5 ms en Apple M5 Pro.
- Atencion al cliente automatizada por telefono: integrado en un sistema de IVR, el modelo detecta el fin de turno del cliente para pasar la palabra al agente virtual, reduciendo la sensacion de robot y mejorando la fluidez de la conversacion.
- Dictado por voz en macOS: en aplicaciones de dictado o toma de notas, el modelo indica cuando el usuario ha terminado una frase, permitiendo que el sistema procese el audio y genere texto de forma automatica sin necesidad de pulsar botones.
- Agentes conversacionales para entrevistas o encuestas: el modelo permite que un agente de voz realice preguntas y espere la respuesta completa del entrevistado, sin interrumpir pausas reflexivas pero respondiendo rapidamente cuando la respuesta ha concluido.
- Subtitulado en directo o traduccion simultanea: en sistemas de transcripcion en vivo, el modelo ayuda a segmentar el audio en turnos completos, mejorando la precision del subtitulado y la sincronizacion temporal.
- Pruebas de usabilidad de interfaces de voz: los desarrolladores pueden usar el modelo para medir la latencia de respuesta de sus propios agentes y ajustar los umbrales segun el idioma o el estilo de habla de los usuarios.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion sobre 1000 clips del conjunto de test `pipecat-ai/smart-turn-data-v3.2-test` (shard `train-00000-of-00010.parquet`, umbral 0,5). La latencia se midio en un Apple M5 Pro con macOS 26.5.2, comparando el modelo CoreML con la exportacion ONNX del mismo modelo.

| Modelo | Accuracy | Precision | Recall | F1 | FPR | FNR | Latencia media | Latencia p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Upstream `smart-turn-v3.2-gpu.onnx` (entrada mel) | 92,90% | 0,912 | 0,944 | 0,927 | 8,48% | 5,61% | — | — |
| `smart-turn-v3.2.onnx` (exportacion propia) | 92,90% | 0,912 | 0,944 | 0,927 | 8,48% | 5,61% | 36,3 ms | 51,4 ms |
| `smart_turn.mlmodelc` (CoreML) | 92,90% | 0,912 | 0,944 | 0,927 | 8,48% | 5,61% | 3,5 ms | 5,4 ms |

## Requisitos de hardware

- Tamaño del modelo: 16,8 MB, por lo que cabe en cualquier dispositivo Apple con iOS 17 o macOS 14.
- Ejecucion en CPU y Neural Engine mediante CoreML; en Apple M5 Pro se observa una latencia media de 3,5 ms por ventana de 8 segundos.
- No requiere GPU dedicada; funciona en iPhone, iPad y Mac con chip Apple Silicon.
- Compatible con el framework CoreML de Apple, por lo que no necesita librerias externas como vLLM u Ollama.
- El modelo compilado `.mlmodelc` se integra directamente en una app mediante `MLModel` de Swift.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de deteccion de fin de turno en la documentacion proporcionada. El modelo original de Pipecat (`pipecat-ai/smart-turn-v3`) es la referencia directa, y esta conversion CoreML mantiene exactamente las mismas metricas de rendimiento que el modelo ONNX de origen. No se han encontrado alternativas equivalentes en el ecosistema open source con las mismas caracteristicas de tamaño, soporte multilingue y optimizacion para Apple.

## Limitaciones y advertencias

- Ventana fija de 8 segundos: si el turno del usuario dura mas de 8 segundos, solo se consideran los ultimos 8 segundos, lo que puede perder informacion relevante del inicio del turno.
- El modelo opera exclusivamente sobre audio; no utiliza transcripcion ni informacion semantica del contenido, por lo que puede fallar en casos donde el contexto verbal es determinante para decidir si el turno ha terminado.
- El umbral de 0,5 es un valor recomendado; en entornos ruidosos o con idiomas no representados en el conjunto de test, puede ser necesario ajustarlo.
- La tasa de falsos positivos (FPR) del 8,48% implica que aproximadamente 1 de cada 12 pausas no finales podria ser interpretada como fin de turno, lo que podria provocar interrupciones no deseadas en conversaciones con pausas largas.
- La tasa de falsos negativos (FNR) del 5,61% indica que en algo mas de 1 de cada 20 turnos realmente finalizados el modelo podria seguir esperando, anadiendo latencia innecesaria.
- La licencia BSD-2-Clause permite uso comercial, pero el modelo deriva de pesos de Pipecat; se recomienda revisar los terminos del proyecto original para cualquier redistribucion.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/aufklarer/Smart-Turn-v3.2-CoreML)
- [Modelo original de Pipecat](https://huggingface.co/pipecat-ai/smart-turn-v3)
- [Repositorio GitHub de Pipecat Smart Turn](https://github.com/pipecat-ai/smart-turn)
- [Repositorio GitHub con codigo de generacion de datos](https://github.com/sam-s10s/pipecat-smart-turn)
- [speech-swift (SDK Apple)](https://github.com/soniqo/speech-swift)
- [Documentacion de instalacion y CLI](https://soniqo.audio/getting-started)
- [Sitio web de soniqo](https://soniqo.audio)
- [Blog de soniqo](https://soniqo.audio/blog)
