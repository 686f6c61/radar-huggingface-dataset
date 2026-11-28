# melon1891/shiori-bert-jp

## Resumen

shiori-bert-jp es un clasificador BERT de pequeno tamano especializado en segmentacion de topicos y deteccion de eventos en conversaciones informales en japones. Lo desarrolla el usuario melon1891 y se distribuye bajo licencia Apache 2.0. El modelo resuelve un problema concreto de procesamiento del discurso: determinar, para cada frontera entre dos oraciones de un dialogo, si no hay corte, si hay un subtema dentro del topico actual o si empieza un topico nuevo.

Tecnicamente es un fine-tuning por destilacion de conocimiento sobre `tohoku-nlp/bert-base-japanese-v3`, con 110.618.883 parametros. La innovacion principal no esta en la arquitectura, sino en el enfoque de anotacion: se usan etiquetas generadas por un LLM profesor (Claude Opus 5.5 con ejemplos anotados por humanos) sobre 400 conversaciones sinteticas en japones generadas con Claude Sonnet 5.5, que luego se destilan en el BERT alumno.

Es relevante para quien construye sistemas de dialogo, resumen de conversaciones o memoria de agentes conversacionales en japones, porque ofrece una senal de segmentacion ligera (unos 45 ms por frontera en CPU de escritorio) con un F1 de 0,770 en media de 5 semillas sobre 8 conversaciones humanas, practicamente a la par de su profesor LLM (0,769) y a una fraccion del coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base), cabeza de clasificacion sobre el estado oculto de [CLS] de la ultima capa (sin pooler) |
| Parametros totales | 110.618.883 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (entrada formada por las 2 oraciones previas y las 2 posteriores a la frontera) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,9 GB, incluye tokenizador y `modeling_shiori.py`) |

## Arquitectura y entrenamiento

El modelo parte de `tohoku-nlp/bert-base-japanese-v3` y anade una cabeza de clasificacion de 3 clases que se aplica directamente sobre el estado oculto de [CLS] de la ultima capa, sin usar el pooler de BERT (que ni siquiera se incluye en los pesos). La entrada es un par de segmentos: las dos oraciones anteriores a la frontera y las dos posteriores, cada una prefijada con la etiqueta del hablante (`利用者：` o `相棒：`, con dos puntos de ancho completo). La clasificacion distingue C0 (sin frontera), C1 (subtema dentro del topico actual) y C2+ (nuevo topico, que agrupa el antiguo C3 por escasez de ejemplos). La decision se hace en dos umbrales: frontera fina si P(C1)+P(C2+) >= 0,5 y frontera de topico si P(C2+) >= 0,5.

El entrenamiento es una destilacion de conocimiento: un LLM profesor (Claude Opus 5.5, alimentado con ejemplos anotados por humanos) etiqueta 400 conversaciones sinteticas en japones generadas con Claude Sonnet 5.5, y esas etiquetas se usan para entrenar el BERT alumno. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF/DPO. El modelo se publica con 5 semillas; la semilla liberada alcanza F1 de 0,790, frente a la media de 0,770 de las 5 semillas. Los datos de entrenamiento no se publican. El truncamiento de entradas largas sigue la regla del entrenamiento: en la parte izquierda se conservan los ~126 tokens mas cercanos a la frontera y en la derecha el resto hasta el limite.

## Capacidades

- Clasificacion de fronteras de topico en dialogos japoneses en tres clases (C0, C1, C2+).
- Segmentacion fina (piece boundary) y segmentacion de topico (topic boundary) mediante dos umbrales independientes.
- Deteccion de eventos y cambios de tema en conversaciones de chat informal.
- Procesamiento incremental: al ver una oracion por delante de la frontera, puede evaluar la frontera inmediatamente anterior segun llega cada oracion.
- Manejo de etiquetas de hablante (entrenado con `利用者` y `相棒`; admite remapeo via `speaker_map`).
- Utilidades incluidas: `shiori_infer.py` con `ShioriSegmenter` y `split_sentences()` (regla de corte por `。！？!?` y parentesis de cierre).
- Carga via `transformers` con `AutoModelForSequenceClassification` y `trust_remote_code=True`, o via `pipeline("text-classification")`.
- No es generativo: no produce texto, solo probabilidades por frontera.
- No soporta tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Segmentacion de transcripciones de atencion al cliente: dividir un chat largo en bloques tematicos para resumir cada bloque por separado; el modelo evalua cada frontera con 2 oraciones de contexto a cada lado, suficiente para detectar cambios de asunto en conversaciones de soporte.
- Memoria de agentes conversacionales: usar la senal de topic boundary para decidir cuando cerrar un bloque de memoria y abrir uno nuevo, evitando mezclar temas en el mismo registro; la latencia de ~45 ms por frontera en CPU permite hacerlo en linea.
- Resumen jerarquico de conversaciones: aplicar `ShioriSegmenter` sobre la transcripcion, agrupar oraciones entre fronteras C2+ y pasar cada grupo a un modelo generativo para resumen por secciones.
- Analisis de discurso en investigacion: medir la estructura de topicos de corpus de dialogo japones, comparando la tasa de subtemas (C1) frente a cambios de topico (C2+) entre condiciones o hablantes.
- Indexacion y busqueda en historiales de chat: generar metadatos de segmento para que un sistema de recuperacion devuelva el bloque tematico completo en lugar de mensajes sueltos.
- Preprocesado para anotacion humana: proponer fronteras candidatas a anotadores, reduciendo el coste de etiquetar corpus de segmentacion de discurso en japones.
- Filtrado de ruido en datasets conversacionales: detectar donde una conversacion deriva a un topico no deseado (C2+) para recortar o marcar segmentos antes de usarlos en entrenamiento.

## Benchmarks y rendimiento

Evaluacion sobre 8 conversaciones nuevas anotadas por humanos (287 fronteras):

| Metrica | Valor |
|---|---|
| F1 medio (5 semillas) | 0,770 |
| F1 semilla liberada | 0,790 |
| F1 del profesor LLM (Claude Opus 5.5) | 0,769 |
| Latencia por frontera (CPU de escritorio) | ~45 ms |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible, ya que el modelo no es generativo y la evaluacion se limita a la tarea de segmentacion.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,45 GB en fp32 (110,6 M de parametros), ~0,22 GB en fp16; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU de escritorio a ~45 ms por frontera. Cualquier GPU moderna (RTX 3060 en adelante, A100, H100) reduce la latencia a nivel de milisegundos por lote.
- Cabe en GPU consumer: si, en todas las gamas actuales, incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True`), `pipeline("text-classification")` y el script incluido `shiori_infer.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el modelo usa codigo custom, lo que complica su portabilidad a runtimes alternativos).
- Dependencias: torch, transformers, safetensors, huggingface_hub, fugashi y unidic-lite. Versiones verificadas: torch 2.6.0, transformers 5.20.1, safetensors 0.8.0, fugashi 1.5.2, unidic-lite 1.0.8.
- Throughput: no disponible de forma agregada; solo se publica la latencia por frontera en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shiori-bert-jp | 110,6 M | 256 tokens | Segmentacion de topico en dialogo japones | Apache 2.0 | Hugging Face |
| tohoku-nlp/bert-base-japanese-v3 | ~110 M | 512 tokens | Modelo base japones (MLM), sin cabeza de segmentacion | Apache 2.0 | Hugging Face |
| Profesor LLM (Claude Opus 5.5) | no disponible | no disponible | Etiquetado de fronteras via prompt | propietaria | API de Anthropic |

No se dispone de informacion sobre otros clasificadores de segmentacion de topico en japones comparables en la busqueda realizada. La comparacion mas directa es con su modelo base (que no realiza esta tarea de forma nativa) y con el profesor LLM del que se destilo, que obtiene F1 0,769 frente al 0,770-0,790 del BERT.

## Limitaciones y advertencias

- Modelo no generativo: solo emite probabilidades de frontera; no produce texto ni razonamiento.
- Entrenado exclusivamente con dos etiquetas de hablante (`利用者` y `相棒`); con otros nombres es necesario remapear y el rendimiento puede degradarse.
- Entrenado sobre conversaciones sinteticas generadas por LLM y etiquetadas por otro LLM: puede heredar sesgos y errores del profesor, y la distribucion puede no coincidir con dialogos reales de dominios especificos.
- Ventana de 256 tokens: entradas mas largas se truncan con una regla concreta; usar `truncation=True` del tokenizador produce un recorte distinto y resultados inconsistentes.
- Solo japones; no hay soporte multilingue.
- Los datos de entrenamiento no se publican, lo que limita la reproducibilidad y la auditoria del sesgo.
- Requiere `trust_remote_code=True` para cargar con `transformers`, lo que implica ejecutar codigo del repositorio; conviene revisar `modeling_shiori.py` antes de usarlo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor lo describe como modelo para investigacion y uso recreativo; no hay garantias de rendimiento en produccion.
- Riesgo de falsos positivos y negativos en fronteras ambiguas: el F1 de ~0,77 sobre datos humanos indica que aproximadamente una de cada cuatro fronteras se clasifica incorrectamente.
- No se documentan cuantizaciones oficiales; el soporte en runtimes alternativos (llama.cpp, Ollama) no esta garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/melon1891/shiori-bert-jp
- Modelo base: https://huggingface.co/tohoku-nlp/bert-base-japanese-v3
- Revision anterior del layout: https://huggingface.co/melon1891/shiori-bert-jp/tree/a6ad40d749bc4fbebf1c0d2d57e959dc44cd17b8
- Repositorio de codigo, paper o demo: no disponible en la informacion proporcionada.
