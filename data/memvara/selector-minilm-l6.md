# memvara/selector-minilm-l6

## Resumen

memvara/selector-minilm-l6 es un cross-encoder de ranking de texto desarrollado por memvara, un proyecto de memoria conversacional local. Su tarea es concreta: dada una pregunta y hasta 40 turnos candidatos de una conversacion pasada, puntua cada par (pregunta, turno) para decidir que turnos contienen la respuesta. Es el modelo que hay detras de `LocalSelector`, el selector de memvara que ejecuta el ranking de memoria en la propia maquina, sin clave de API ni envio de datos a un proveedor externo.

Tecnicamente es un ajuste fino de cross-encoder/ms-marco-MiniLM-L-6-v2, un transformer tipo BERT de 6 capas y 22.713.601 parametros (0,1 GB de repositorio). El entrenamiento se hizo durante una epoca sobre las etiquetas gold de 256 preguntas de LongMemEval-S (1.816 pares pregunta-turno, 454 de ellos turnos con la respuesta), con una funcion de perdida que penaliza tres veces mas un turno de respuesta omitido que uno retenido por error. La ventana de entrenamiento fue de 256 tokens y el modelo solo maneja ingles.

Su relevancia ahora es que ofrece un selector de memoria conversacional de calidad cercana a la de un modelo de pago, pero ejecutable en CPU y con licencia Apache-2.0. En 191 preguntas retenidas de LongMemEval-S alcanza 0,928 frente a 0,903 del MiniLM sin ajustar y 0,958 de un selector de pago, con una latencia p95 de unos 330 ms para puntuar 40 candidatos en 4 hilos de CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en BERT (MiniLM-L6, 6 capas) |
| Parametros totales | 22.713.601 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion; entrenado con 256 tokens |
| Tipos de cuantizacion | No disponible en la informacion |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder, es decir, un transformer que recibe el par (pregunta, turno) de forma conjunta y produce una puntuacion de relevancia unica, en lugar de generar embeddings independientes y compararlos. Parte de cross-encoder/ms-marco-MiniLM-L-6-v2 (commit 233902d2), una variante MiniLM de BERT de 6 capas con 22,7 millones de parametros, y se ajusta para la tarea especifica de seleccion de turnos de memoria conversacional.

El ajuste fino se realizo durante una epoca sobre las etiquetas gold de 256 preguntas de LongMemEval-S (licencia MIT), lo que suma 1.816 pares pregunta-turno, de los cuales 454 son los turnos que contienen la respuesta. La funcion de perdida pondera un turno de respuesta omitido tres veces mas que un turno retenido por error. Los hiperparametros fueron: tasa de aprendizaje 2e-5, longitud de 256 tokens, lotes de 16 y semilla 0. El repositorio incluye ademas `memvara_selector.json`, con la calibracion que el selector aplica a la puntuacion bruta (escalado de Platt mediante los parametros `scale` y `shift`, seguido de una regla de retencion con `threshold` y `max_keep`), medida sobre 45 preguntas de LongMemEval que el modelo nunca vio durante el entrenamiento.

## Capacidades

- Ranking de relevancia sobre pares pregunta-turno de conversaciones pasadas, con hasta 40 turnos candidatos por consulta.
- Seleccion de los turnos que contienen la respuesta mediante una probabilidad calibrada que supera un umbral.
- Ordenacion del resto de candidatos segun la puntuacion del modelo, util para presentar resultados secundarios.
- Inferencia totalmente local: no requiere clave de API ni envia datos a ningun proveedor.
- Integracion con la libreria memvara a traves de la clase `LocalSelector` (requiere `pip install 'memvara[rerank]'`).
- Funcionamiento en CPU: puntua 40 candidatos en unos 330 ms (p95) con 4 hilos.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento explicito; es un modelo de ranking de un solo paso.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Recuperacion de memoria en asistentes conversacionales locales: dado un historial de conversacion, el modelo selecciona que turnos pasados responden a la pregunta actual, permitiendo respuestas coherentes en dialogos multi-turno sin salir del dispositivo.
- Asistentes de privacidad estricta: al ejecutarse en CPU sin llamadas a servicios externos, encaja en entornos donde el historial de conversacion no puede enviarse a un proveedor (sanidad, legal, datos personales).
- RAG sobre transcripciones de reuniones o chats: actua como etapa de reranking que filtra turnos relevantes antes de pasarlos a un generador, reduciendo el ruido y el coste de contexto.
- Agentes con memoria a largo plazo: integrado como `LocalSelector` en memvara, permite que un agente recupere decisiones o compromisos previos (por ejemplo, "que decidi sobre la fecha limite") y los inserte en el prompt.
- Despliegue en hardware modesto o en el borde: con 22,7 millones de parametros y unos 130 MB de memoria adicional en un proceso que ya tiene el reranker, cabe en maquinas sin GPU dedicada.
- Sistemas de busqueda sobre historiales de soporte: para localizar turnos concretos dentro de conversaciones largas de atencion al cliente y alimentar resumenes o respuestas automaticas.
- Filtrado previo en pipelines de memoria de bajo coste: como etapa barata que descarta turnos irrelevantes antes de un modelo mayor o mas caro.

## Benchmarks y rendimiento

Todas las cifras cuentan los turnos que contienen la respuesta y que caben completos en un bloque de 720 tokens.

| Test | Este modelo | MiniLM sin ajustar | Sin modelo (reranker y routing) | Selector de pago |
|---|---|---|---|---|
| LongMemEval-S, 191 preguntas retenidas | 0,928 | 0,903 | 0,903 | 0,958 |
| LoCoMo, 1.496 preguntas, nunca vistas en entrenamiento | 0,777 | 0,758 | — | — |

Respuestas evaluadas sobre 199 preguntas de LongMemEval-S, con gpt-oss-120b leyendo y juzgando: 165 correctas con este modelo, 162 sin modelo y 171 con el selector de pago gpt-5.4-mini.

Rendimiento de inferencia: aproximadamente 330 ms (p95) para puntuar 40 candidatos en 4 hilos de CPU, y unos 130 MB de memoria adicional en un proceso que ya mantiene el reranker en memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo de 22,7 millones de parametros, los pesos en precision completa ocupan del orden de decenas de MB, y esta pensado para ejecutarse en CPU.
- GPU recomendadas: no disponible; el modelo esta disenado para funcionar sin GPU (la medicion de referencia es en 4 hilos de CPU).
- Compatibilidad con GPU de consumo: previsiblemente cabe en cualquier GPU de consumo e incluso en CPU, aunque no se aportan medidas de VRAM ni de rendimiento en GPU.
- Opciones de despliegue: la libreria sentence-transformers y la integracion nativa con memvara (`LocalSelector`); los tags del repositorio indican compatibilidad con text-embeddings-inference y endpoints.
- Latencia y throughput: unos 330 ms (p95) para puntuar 40 candidatos en 4 hilos de CPU; no se aportan cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LongMemEval-S (191 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| memvara/selector-minilm-l6 | 22,7 M | Entrenado con 256 tokens | 0,928 | Apache-2.0 | HuggingFace (safetensors) |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | 22,7 M | No disponible | 0,903 | Apache-2.0 | HuggingFace |
| Selector de pago gpt-5.4-mini | No disponible | No disponible | 0,958 | Propietaria | API de pago |

Frente al MiniLM sin ajustar, este modelo mejora la retencion de turnos con respuesta (0,928 frente a 0,903 en LongMemEval-S y 0,777 frente a 0,758 en LoCoMo) manteniendo el mismo tamano. Frente al selector de pago, queda por detras (0,928 frente a 0,958, y 165 frente a 171 respuestas correctas sobre 199), pero se ejecuta en local y sin coste por consulta. Para modelos de ranking alternativos de la misma categoria no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- No sustituye al selector de pago: responde aproximadamente seis preguntas menos de cada 199.
- Es mas debil en preguntas sobre lo que dijo el asistente, donde la respuesta se encuentra dentro de una respuesta larga.
- Entrenado unicamente en ingles y sobre un unico conjunto de conversaciones entre un usuario y un asistente; su generalizacion a otros dominios o idiomas es incierta.
- Al derivar del modelo base ms-marco-MiniLM-L-6-v2, cuyos datos (MS MARCO) se describen como destinados a investigacion no comercial, conviene verificar si ese termino afecta al uso derivado, aunque los pesos se publican bajo Apache-2.0.
- Es un cross-encoder de ranking, no un generador: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de alucinacion no aplicable directamente al ser un modelo de puntuacion; el riesgo se traslada a falsos positivos o falsos negativos en la seleccion de turnos.
- Requiere fijar la `revision` (commit) al usar `LocalSelector`, ya que memvara solo dispone de calibracion para los commits publicados y rechaza un modelo del que no la tenga.
- Sin descargas ni valoraciones registradas en el momento de la consulta (0 descargas, 0 likes), lo que limita la evidencia de uso en produccion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/memvara/selector-minilm-l6
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L-6-v2
- Repositorio memvara: https://github.com/memvara/memvara
- Documentacion de benchmarks: memvara, `docs/BENCHMARKS.md`, seccion "The local selector"
- Dataset de ajuste: https://huggingface.co/datasets/xiaowu0162/longmemeval-cleaned (longmemeval-cleaned)
