# hindsight-ai/hs-date-1

## Resumen

hs-date-1 es un modelo compacto desarrollado por Hindsight AI (responsable del proyecto vectorize-io/hindsight) cuyo objetivo es identificar las expresiones temporales que aparecen en una pregunta en lenguaje natural y traducirlas a un codigo de significado intermedio. No genera fechas directamente: produce codigos como `week -1` o `2025-05 ; 2026-06`, que la libreria timmytime convierte en rangos de fechas mediante Python estandar, garantizando correccion en anos bisiestos, longitudes de mes e inicios de semana. Es un componente de infraestructura para el sistema de recuperacion (recall) de Hindsight, no un modelo de proposito general.

Tecnicamente es un transformer encoder-decoder a nivel de byte, con solo 4,8 millones de parametros (4.831.499 exactos) y un fichero de 9,7 MB en FP16. La entrada son los bytes UTF-8 de la pregunta, hasta 256, y la salida es un codigo de hasta 24 tokens sobre un vocabulario de 1.271 palabras. Funciona en CPU con numpy puro, sin torch ni GPU, con una latencia de aproximadamente 1 ms por pregunta (p95 de 1,5 ms).

Su relevancia radica en que resuelve un problema clasico de los sistemas de recuperacion temporal (parsing de expresiones como "la semana pasada", "上上周" o "since March") con una precision muy superior a la de dateparser, la libreria de reglas que Hindsight utilizaba antes, y con una tasa de falsos positivos mucho menor. Cubre 16 idiomas y se distribuye con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder a nivel de byte (parser semantico); 2 convoluciones (reducen 4x), 6 capas de encoder, 1 capa de decoder, 256 de ancho, 4 cabezas |
| Parametros totales | 4.831.499 (4,8 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrada de hasta 256 bytes UTF-8; salida de hasta 24 tokens |
| Tipos de cuantizacion | No disponible (pesos en FP16; el checkpoint de entrenamiento se ofrece en FP32) |
| Idiomas soportados | Ingles, chino simplificado y tradicional, espanol, aleman, arabe, japones, coreano, italiano, portugues, frances, vietnamita, indonesio, tailandes, hindi y ruso |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16 en `model.safetensors`; `training/checkpoint.safetensors` en FP32) |

## Arquitectura y entrenamiento

El modelo es un encoder-decoder transformer a nivel de byte con un diseno muy comprimido: dos capas convolucionales que reducen la secuencia de entrada cuatro veces, seis capas de encoder y una sola capa de decoder, con dimension oculta de 256 y 4 cabezas de atencion. La entrada son los bytes UTF-8 crudos de la pregunta (hasta 256), lo que le permite procesar cualquier idioma sin tokenizador especifico; la salida es un codigo de significado corto (hasta 24 tokens) sobre un vocabulario de 1.271 palabras definido en `vocab.json`.

El entrenamiento se realizo sobre el dataset hindsight-ai/hs-date-1-data, con 940.000 preguntas en 16 idiomas generadas por un LLM (Gemma 4) y validadas convirtiendo cada codigo de vuelta a fechas, complementadas con preguntas de plantilla y ejemplos dificiles en los que el modelo fallaba. El proceso consistio en 20 pasadas desde cero, seguidas de ajustes finos cortos y una poda de unidades feed-forward no utilizadas. Un principio de diseno destacable es que todas las correcciones provienen de datos de entrenamiento, nunca de reglas anadidas al codigo. La separacion entre el parser (que produce el codigo) y la resolucion a fechas (que hace timmytime en Python) es la innovacion clave: delega la aritmetica de calendario a codigo determinista.

## Capacidades

- Extraccion de expresiones temporales en lenguaje natural: relativas ("last week", "hace dos meses"), absolutas ("since March", "el 3 del mes pasado") y combinaciones multiples en una misma pregunta.
- Deteccion de ausencia de fecha: preguntas sin referencia temporal ("what is my wifi password", "install Office 2019") devuelven una lista vacia, evitando falsos positivos.
- Soporte multilingue en 16 idiomas, incluyendo escrituras no latinas (chino, arabe, japones, coreano, tailandes, hindi, ruso).
- Salida de codigos de significado interpretables y acotados (`week -1`, `last 6 month`, `2025-05 ; 2026-06`, `none`).
- Resolucion dependiente del ancla temporal: el resultado se calcula respecto a la fecha en que se formula la pregunta y con zona horaria configurable.
- Ejecucion en CPU pura con numpy, sin dependencias de torch, GPU ni red.
- No soporta tool calling, function calling, agentes, vision ni audio; su alcance es exclusivamente el parsing temporal.

## Casos de uso

- Recuperacion de memoria en asistentes personales: un asistente que almacena notas o conversaciones puede usar hs-date-1 para convertir "que decidi la semana pasada" en un rango concreto de fechas y filtrar los recuerdos correspondientes, con latencia de 1 ms en CPU.
- Busqueda documental con filtros temporales: en un motor de busqueda sobre correos o documentos, el modelo traduce "facturas desde marzo" a un rango de fechas que se aplica como filtro en la consulta al indice, sin necesidad de GPU en el servidor.
- Analitica de conversaciones y atencion al cliente: clasificar tickets o mensajes por el periodo al que se refieren ("el problema de la semana pasada") para agrupar incidencias por ventana temporal de forma automatica y multilingue.
- Procesamiento por lotes de registros: al ejecutarse en CPU con numpy y ~1 ms por pregunta, permite anotar millones de consultas historicas con su referencia temporal en pipelines ETL sin coste de GPU.
- Sistemas de recordatorios y agenda: interpretar "la reunion del 3 del mes pasado" o "上个月的会议" para localizar eventos en un calendario, con la aritmetica de fechas delegada a Python para evitar errores de calendario.
- Agentes de recuperacion aumentada (RAG) con conciencia temporal: como componente previo al retrieval, desambigua consultas que dependen de la fecha de formulacion y mejora la precision del contexto recuperado.
- Preprocesado multilingue en pipelines de NLP: normalizar expresiones temporales en 16 idiomas antes de pasarlas a un LLM mayor, reduciendo coste y errores de fechas en el modelo principal.

## Benchmarks y rendimiento

Los datos de evaluacion provienen de la model card: preguntas reservadas (unos 3.000 por idioma) y la comparacion con dateparser, la libreria de reglas usada previamente por Hindsight. "Exact" significa que todos los rangos de fecha son correctos; "false dates" indica que se detecto una fecha en una pregunta que no la contiene.

| Idioma | dateparser exact | hs-date-1 exact | dateparser false dates | hs-date-1 false dates |
|---|---|---|---|---|
| Ingles | 55,9% | 98,7% | 24,4% | 1,1% |
| Chino | 66,9% | 97,7% | 3,1% | 0,4% |
| Chino tradicional | 63,4% | 96,9% | 1,8% | 0,6% |
| Espanol | 50,3% | 96,4% | 19,6% | 0,0% |
| Aleman | 48,1% | 97,9% | 18,4% | 0,8% |
| Arabe | 42,2% | 94,6% | 4,3% | 1,1% |
| Japones | 47,0% | 96,2% | 8,9% | 1,6% |
| Coreano | 46,4% | 97,6% | 5,4% | 1,6% |
| Italiano | 49,9% | 96,5% | 10,4% | 1,0% |
| Portugues | 41,4% | 96,7% | 18,3% | 0,7% |
| Frances | 54,2% | 95,6% | 14,2% | 0,9% |
| Vietnamita | 40,4% | 95,0% | 11,3% | 1,3% |
| Indonesio | 40,0% | 95,5% | 21,9% | 1,6% |
| Tailandes | 43,2% | 95,6% | 10,0% | 1,2% |
| Hindi | 46,9% | 95,2% | 16,9% | 1,3% |
| Ruso | 53,3% | 95,4% | 16,9% | 1,0% |
| Tests propios de Hindsight (834) | 91,0% | 98,7% | 5,2% | 1,5% |

En latencia, dateparser tarda entre 0,1 y 16 ms por pregunta (p95 hasta 57 ms), mientras que hs-date-1 tarda aproximadamente 1 ms (p95 de 1,5 ms). No se han publicado resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada: 0 GB. El modelo se ejecuta en CPU con numpy; el fichero de pesos FP16 ocupa 9,7 MB.
- GPU recomendadas: ninguna necesaria. No requiere CUDA ni torch.
- Cabe en cualquier consumer GPU y, de hecho, en cualquier maquina con CPU moderna; el cuello de botella es la memoria RAM del proceso Python, insignificante para este tamano.
- Opciones de despliegue: el paquete Python timmytime incluye los pesos y no descarga nada en tiempo de ejecucion. Tambien se puede cargar el `model.safetensors` de este repositorio con `Parser(hf_hub_download(...))`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 1 ms por pregunta (p95 de 1,5 ms) en CPU, segun la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Enfoque | Licencia |
|---|---|---|---|---|---|
| hs-date-1 | Transformer encoder-decoder a nivel de byte | 4,8 M | 16 | Codigo de significado + resolucion en Python | MIT |
| dateparser | Libreria de reglas (sin red neuronal) | No aplica | Amplio, con reglas manuales | Reglas heuristicas y expresiones regulares | BSD (libreria de codigo abierto) |
| LLM de proposito general (p. ej. Gemma 4) | LLM generativo | Miles de millones | Amplio | Extraccion de fechas via prompt | Segun el modelo |

La comparacion directa con dateparser es la mas relevante: hs-date-1 mejora la precision exacta entre 30 y 50 puntos porcentuales en la mayoria de idiomas y reduce los falsos positivos de forma drastica (por ejemplo, del 24,4% al 1,1% en ingles). Frente a delegar la tarea en un LLM generativo, hs-date-1 ofrece una latencia tres ordenes de magnitud menor, ejecucion sin GPU y un coste energetico minimo. No se dispone de comparaciones con otros parsers neuronales de fechas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo maneja dias completos: "yesterday at 3pm" se resuelve como el dia de ayer, sin hora.
- No reconoce festividades del calendario hindu (Diwali, Holi) ni eventos personales ("my birthday"), que devuelven ausencia de fecha.
- Los idiomas fuera de los 16 entrenados no provocan errores (lee bytes crudos), pero no estan entrenados ni testados, por lo que su precision no esta garantizada.
- La salida es un codigo de significado, no fechas; requiere la libreria timmytime para obtener los rangos finales, lo que anade una dependencia de despliegue.
- La resolucion depende del ancla temporal y la zona horaria que se pasen explicitamente; un ancla incorrecta produce rangos incorrectos.
- Riesgo de alucinacion bajo por diseno (detecta ausencia de fecha con alta tasa de acierto), pero no nulo: la model card reporta entre 0,0% y 1,6% de falsos positivos segun el idioma.
- Licencia MIT: permite uso comercial sin restricciones, pero conviene verificar las condiciones del dataset de entrenamiento (hindsight-ai/hs-date-1-data) si se redistribuye.
- Modelo con 0 descargas y 0 likes en Hugging Face en el momento de la consulta: ecosistema y soporte comunitario practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hindsight-ai/hs-date-1
- Dataset de entrenamiento: https://huggingface.co/datasets/hindsight-ai/hs-date-1-data
- Repositorio de la libreria timmytime: https://github.com/vectorize-io/timmytime
- Receta de entrenamiento: https://github.com/vectorize-io/timmytime/blob/main/TRAINING.md
- Proyecto Hindsight: https://github.com/vectorize-io/hindsight
