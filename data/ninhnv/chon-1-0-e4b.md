# ninhnv/chon-1.0-e4b

## Resumen

Chon-1.0-E4B es un adaptador LoRA sobre el modelo google/gemma-4-E4B-it orientado a un caso de uso muy concreto: la clasificación calibrada con conjuntos cerrados de opciones. En lugar de generar texto libre, el modelo recibe un estado (texto, JSON o una conversación) junto con una pregunta de opciones cerradas y devuelve una probabilidad calibrada para cada opción. Admite tres tipos de pregunta: choice (de 2 a 16 opciones etiquetadas), yes/no (probabilidad P(yes)) y score (distribución sobre niveles ordenados).

Lo desarrolla el usuario ninhnv y se sirve a través del formato de cable TypeSafe /v1/systemone empleado por JevBench, con un servidor propio (`chon`). El adaptador ocupa unos 558 MB y se carga junto al modelo base sin modificarlo; el repositorio completo pesa 0,6 GB. El estado de entrada admite hasta 6.000 tokens (los estados más largos se truncan conservando el inicio) y el prompt hasta 8.192 tokens.

Su relevancia es acotada pero clara: no compite en generación generalista, sino que ataca el problema de obtener decisiones discretas con probabilidades utilizables en producción (enrutado de tickets, etiquetado, puntuación ordinal) en lugar de texto que hay que parsear. Está publicado con licencia Apache-2.0, igual que el modelo base, e incluye mediciones propias de calibración y latencia en H100 y en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre google/gemma-4-E4B-it; la model card no detalla la arquitectura interna del modelo base |
| Parametros totales | no disponible (el modelo base se describe como Gemma 4 E4B, de unos 4B de parametros efectivos) |
| Parametros activos | no disponible (la model card no separa parametros totales de activos) |
| Longitud de contexto | Prompt de hasta 8.192 tokens; estado de entrada de hasta 6.000 tokens (se trunca conservando el inicio) |
| Tipos de cuantizacion | no disponible; la model card menciona ejecucion en bf16 (GPU y CPU), sin documentar GGUF, INT8 ni INT4 |
| Idiomas soportados | Ingles; vietnamita tambien soportado |
| Licencia | Apache-2.0 (igual que el modelo base) |
| Formato de pesos | safetensors (adaptador LoRA PEFT: `adapter_model.safetensors` + `adapter_config.json`) |
| Tamano del adaptador | ~558 MB (repositorio completo: 0,6 GB) |
| Tipos de pregunta | choice (2-16 opciones), yes/no (P(yes)), score (distribucion sobre niveles ordenados) |
| Formato de servicio | TypeSafe `/v1/systemone` (JevBench) mediante el servidor `chon` |

## Arquitectura y entrenamiento

Chon-1.0-E4B no es un modelo entrenado desde cero: es un adaptador LoRA (~558 MB) que se carga junto a google/gemma-4-E4B-it, que permanece sin modificar. El repositorio incluye `adapter_model.safetensors` y `adapter_config.json` (PEFT), un `chon_config.json` con los ajustes de prompt y calibracion que lee el servidor `chon`, y los ficheros de tokenizer y plantilla de chat del modelo base, sin cambios.

La model card no publica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Lo que si se describe es el contrato de inferencia: dada una pregunta con opciones cerradas, la mayoria de decisiones se resuelven en una unica pasada hacia delante sin generar tokens de salida; para preguntas dudosas se realiza una pasada corta adicional cuyo texto generado si se contabiliza en `output_tokens`. El parametro `--no-think` fuerza una unica pasada en todas las decisiones, pensado para ejecucion en CPU.

## Capacidades

- Decision tipada con opciones cerradas: devuelve `choice` y `probabilities` para preguntas de eleccion entre 2 y 16 opciones etiquetadas.
- Preguntas binarias: devuelve `noul` (P(yes)) para preguntas de si/no.
- Puntuacion ordinal: devuelve una distribucion de probabilidad sobre niveles ordenados.
- Salida calibrada: el objetivo declarado del modelo es que las probabilidades sean utilizables directamente, no solo la etiqueta ganadora.
- Entrada heterogenea: acepta como estado texto plano, JSON o una conversacion.
- Multilingue limitado: ingles como idioma principal y vietnamita tambien soportado.
- Integracion mediante API: expone el formato de cable TypeSafe `/v1/systemone` a traves del servidor `chon`, con contabilidad de `input_tokens` y `output_tokens` en la respuesta.
- No se documentan en la informacion disponible capacidades de generacion abierta, codigo, matematicas, vision, audio, tool calling ni uso como agente.

## Casos de uso

- Enrutado de tickets de soporte: el propio ejemplo de la model card recibe un estado con el pedido y la incidencia y devuelve la probabilidad de cada ruta (reembolso, envio, otros), lo que permite fijar un umbral y derivar a revision humana solo los casos dudosos.
- Triaje de moderacion de contenido: con una pregunta yes/no por cada politica se obtiene P(yes) y se decide automaticamente por encima de un umbral, en lugar de parsear texto generado.
- Puntuacion ordinal de calidad: usando el tipo score, se puede asignar una distribucion sobre niveles (por ejemplo, reseñas de una a cinco estrellas) y usar la esperanza de esa distribucion como nota continua.
- Clasificacion de intenciones en un asistente conversacional: el estado puede ser la conversacion completa, hasta los 6.000 tokens de estado admitidos, y la salida alimenta el enrutador de habilidades del sistema.
- Etiquetado asistido para anotacion: las probabilidades por opcion permiten ordenar la cola de revision humana por incertidumbre y reducir el coste de anotacion.
- Analisis de encuestas con escalas cerradas: agregacion de respuestas de texto libre en categorias predefinidas con una medida de confianza por asignacion.
- Control de calidad en pipelines de datos: verificacion binaria de si un registro cumple un criterio, integrable en un proceso por lotes con el servidor `chon` local o en CPU.

## Benchmarks y rendimiento

Los siguientes datos proceden de mediciones del propio autor (no son cifras oficiales de un leaderboard). La columna de calibracion es un proxy propio, porque el mapeo de calibracion del board no esta publicado del todo.

| Conjunto | Intelligence | Calibracion (proxy) | Capacidad (proxy) |
|---|---:|---:|---:|
| Replica reservada (720) | 72,0 | 83,8 | 77,9 |
| JevBench publico (231) | 77,9 | 85,7 | 81,8 |

Precision con el arnes oficial de JevBench (adaptador `typesafe`, ficheros publicos) contra el paquete servido: easy 100,0%, original 98,6%, hard 78,4%.

Composicion de la replica reservada de 720 elementos: 360 de tipo choice, 180 de yes/no y 180 de score; niveles 14/28/28/30%. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

Latencia y trafico medidos:

| Entorno | Mediana | p95 | Notas |
|---|---:|---:|---|
| H100 80 GB, bf16, una peticion a la vez | 0,08 s | 21,4 s | 740 tokens de entrada y 121 de salida por decision de media |
| CPU, 8 hilos de Intel Xeon Platinum 8480+, bf16, `--no-think` | 3,0 s | 3,4 s | 30 preguntas reservadas, una pasada por decision |

La model card advierte que ese equipo de CPU es de centro de datos con aceleracion bf16 y que un portatil sera mas lento.

## Requisitos de hardware

- GPU: la model card indica una GPU con 24 GB o mas para bf16; las mediciones se hicieron en una H100 de 80 GB.
- Memoria: adaptador de ~558 MB mas el modelo base; no se publica el peso del base en bf16, por lo que no se puede dar una cifra de VRAM total distinta de la recomendacion de 24 GB.
- CPU: funciona sin GPU con la opcion `--no-think`, que convierte cada decision en una unica pasada; medido en un Intel Xeon Platinum 8480+ con 8 hilos.
- GPU de consumo: no se documenta soporte ni rendimiento en tarjetas tipo RTX 4090 u otras consumer en la informacion disponible.
- Despliegue: el unico metodo documentado es el servidor propio del proyecto (`pip install "chon[serve]"` y `python -m chon.serve --model ninhnv/chon-1.0-e4b --port 8000`), que descarga el modelo base y el adaptador. No se documentan vLLM, llama.cpp, Ollama, TGI ni otras opciones.
- Throughput: no se publica una cifra de peticiones por segundo, solo latencias con una peticion simultanea.
- Advertencia practica: el p95 de 21,4 s en H100 refleja las decisiones que requieren la pasada corta extra, frente a la mediana de 0,08 s de las decisiones resueltas en una sola pasada.

## Comparativa con modelos similares

La busqueda web realizada no devolvio ninguna referencia util (los resultados correspondian a un servicio de supermercado sin relacion con el modelo), por lo que no hay datos de terceros con los que comparar. La unica referencia contrastable es el modelo base sobre el que se aplica el adaptador.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chon-1.0-E4B | No disponible (adaptador de ~558 MB sobre Gemma 4 E4B, ~4B efectivos) | Prompt 8.192 tokens / estado 6.000 tokens | Mediciones propias: Intelligence 77,9 y calibracion 85,7 en JevBench publico (231) | Apache-2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| google/gemma-4-E4B-it | No disponible en la informacion proporcionada | No disponible | No disponible para tareas de decision tipada | Apache-2.0 segun la model card | HuggingFace |
| Otros modelos comparables de decision tipada | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance muy restringido: el modelo esta disenado para preguntas de opciones cerradas; no es un modelo de generacion general ni se documentan capacidades de codigo, matematicas o vision.
- Cobertura idiomatica limitada a ingles y vietnamita; no se documenta rendimiento en castellano ni en otros idiomas.
- Truncamiento silencioso: los estados de mas de 6.000 tokens se recortan conservando el inicio, lo que puede descartar informacion relevante situada al final.
- Calibracion no verificable de forma independiente: la columna de calibracion de la tabla de evaluacion es un proxy del autor porque el mapeo oficial del board no esta publicado del todo.
- Evaluacion no independiente: tanto la replica reservada (720 elementos) como el conjunto publico (231 elementos) proceden del ecosistema JevBench, y el conjunto reservado fue escrito para este proyecto; no hay verificacion por terceros.
- Latencia de cola elevada: aunque la mediana es de 0,08 s en H100, el p95 llega a 21,4 s por las decisiones que requieren una pasada adicional, algo a tener en cuenta en servicios con SLA estrictos.
- Sin adopcion constatable: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Riesgo de alucinacion: la model card no documenta evaluaciones especificas de sesgo ni de alucinacion; en tareas de clasificacion el riesgo se traslada a asignaciones erroneas con probabilidad alta.
- Licencia: Apache-2.0 tanto en el adaptador como en el modelo base, lo que en principio permite uso comercial, pero conviene revisar los terminos publicados por el autor de Gemma 4 E4B-it antes de desplegar.
- Fechas de metadatos extranas: el repositorio figura como creado el 2026-10-16, dato que conviene verificar antes de tratar la ficha como estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ninhnv/chon-1.0-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del servidor: https://github.com/xoai/chon
- No se han encontrado en la busqueda web articulos, papers, blogs ni demos adicionales relacionados con el modelo.
