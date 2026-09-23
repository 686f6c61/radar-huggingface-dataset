# flaukowski/laya-kannaka-supersession

## Resumen

laya-kannaka-supersession es un checkpoint de la familia Laya (arquitectura ModernBERT-large, 421.293.830 parametros) afinado por Kannaka Labs sobre el modelo base convaiinnovations/laya. No es un modelo generativo: es un cabezal de decisiones tipadas no autorregresivo que resuelve una pregunta binaria muy concreta del ciclo de escritura de una memoria de agente, la "supersesion" o `noul`: ¿la afirmacion posterior actualiza, corrige o reemplaza un hecho afirmado en la afirmacion anterior? La respuesta se devuelve como una probabilidad `P(yes)` en el campo `noul`.

El problema que aborda es el de la actualizacion de conocimiento en sustratos de memoria de largo plazo: cuando un usuario corrige un dato (por ejemplo, un record personal), el sistema debe decidir si la memoria antigua queda obsoleta. El modelo se usa en la ruta de escritura, recuperando los k recuerdos anteriores mas cercanos y sellando `expires_at` sobre el antiguo cuando `P(yes) >= 0.5`. Es el segundo "reflejo entrenado" para Kannaka, hermano de laya-kannaka-evidence-gate, y se evalua en el banco de pruebas kannaka-bench (experimentos E-L3b a E-L3f).

Es relevante ahora porque demuestra un patron de modelos pequenos y especializados (421M) que resuelven una decision concreta de sistema con coste minimo, frente a delegar la logica de memoria en un LLM generativo grande. La revision publicada como `main` (E-L3d) reporta AUROC 0.939 en pares retenidos y 0.824 de precision de respuesta, frente al 0.765 de un control sin supersesion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer, decisiones tipadas no autorregenerativas) |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, entrenamiento en fp16) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | convaiinnovations/laya |
| Tamano del repositorio | 1,7 GB |
| Pipeline | no disponible |
| Revisiones publicadas | `e-l3b` (primer push) y `main` = `e-l3d` |

## Arquitectura y entrenamiento

El modelo parte de convaiinnovations/laya, un encoder ModernBERT-large descrito por sus autores como un "System 1 decision engine" multilingue de baja latencia. Sobre esa base, la fina sintonizacion sustituye la generacion de texto por decisiones tipadas: el modelo recibe un estado JSON con dos afirmaciones en orden cronologico verdadero (`earlier` y `later`, cada una con marca de fecha, rol y texto) y emite la probabilidad de un campo tipado concreto (`supersedes.noul`). Al ir las dos afirmaciones en orden cronologico real, la fecha por si sola no separa los casos: la decision depende del contenido.

El entrenamiento de la revision actual (`main` = `e-l3d`) se construye con `build_e_l3d_dataset.py`: recorrido cronologico del haystack de cada pregunta de entrenamiento, recuperacion de los 5 vecinos anteriores mas cercanos por turno con MiniLM, etiqueta 1 unicamente para el par (hecho antiguo, hecho nuevo), 40 negativos por positivo (la mitad de ellos los mas duros por coseno, la otra mitad uniformes) y positivos multiplicados por 6, dando 2.346 filas. La receta es la de RLCD del proyecto original sobre una sola GPU (`train_e_l1b.py`): 6 epocas, micro-batch 8, acumulacion de gradiente 4 y fp16, ejecutada en una RTX 5090 en 364 segundos. La revision anterior (`e-l3b`) se entreno con 255 filas y negativos de la misma conversacion en proporcion 1:4, lo que la hacia precisa en evaluacion por pares pero desastrosa a la tasa base de la ruta de escritura; la revision actual mantiene el recall con 13 veces menos sellos falsos.

## Capacidades

- Decision binaria de supersesion: dado un par de afirmaciones, devuelve `P(yes)` sobre si la posterior actualiza, corrige o reemplaza a la anterior.
- Salida de decisiones tipadas no autorregenerativa (no genera texto libre; rellena campos definidos como `supersedes.noul`).
- Integracion como componente de la ruta de escritura de un sistema de memoria: recuperar top-k recuerdos anteriores, consultar por par y sellar `expires_at` cuando la probabilidad supera 0.5.
- Especificidad de hablante y fecha: el estado incluye fecha y rol, de modo que la decision no puede resolverse solo por orden temporal.
- Idiomas: unicamente ingles.
- No se documenta soporte de tool calling, function calling, capacidades de agente multi-paso, vision ni audio en la informacion disponible.
- Control de falsos positivos: la revision `main` reduce los sellos falsos de ~384 a 29 sobre el conjunto retenido, sin expirar ningun hecho vigente.

## Casos de uso

- Actualizacion de hechos en memoria de agente: al escribir un nuevo turno, recuperar los k recuerdos anteriores mas cercanos y consultar el modelo por par para decidir si el recuerdo antiguo debe marcarse como caducado (`expires_at`), evitando que el agente arrastre datos obsoletos.
- Correccion de datos personales en asistentes: si el usuario declara un nuevo record (por ejemplo, una marca deportiva) que contradice uno anterior, el modelo sella la version antigua y conserva solo la vigente.
- Deduplicacion temporal de un almacen de conversaciones: procesar cronologicamente un historial de chat y expirar afirmaciones reemplazadas, reduciendo el ruido en la recuperacion posterior.
- Filtrado en pipelines de RAG sobre historiales: aplicar el reflejo antes de indexar para que el retriever no devuelva hechos superados por versiones mas recientes.
- Auditoria de coherencia de una base de conocimiento: ejecutar el modelo sobre pares candidatos para detectar contradicciones y priorizar revisiones humanas.
- Componente de bajo coste en produccion: al ser un encoder de 421M en fp16 (menos de 1 GB de pesos), puede ejecutarse por par en la ruta de escritura sin depender de un LLM generativo, con la latencia baja que se atribuye a la familia Laya.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La metrica principal es AUROC sobre pares retenidos, junto con el numero de sellos generados en 17 preguntas retenidas, los "true catches" (cuantos hechos realmente supersedidos se detectan) y la precision de respuesta comparada con el control sin supersesion (0.765).

| Revision | Entrenado con | AUROC pares retenidos | Sellos en 17 preguntas | True catches | Sellos falsos | Precision de respuesta (vs 0.765) |
|---|---|---|---|---|---|---|
| `e-l3b` | 255 filas, negativos de misma conversacion (1:4) | 0.929 | 397 | 13/17 | ~384 | 0.647 (corregido el 2026-09-23; una pregunta se habia perdido por un bug del parser, kannaka-bench f33a542) |
| `main` = `e-l3d` | 2.346 filas, negativos del top-5 de la propia ruta de escritura (~1:2.300) | 0.939 | 42 | 13/17 | 29 | 0.824 |
| E-L3e (no publicado como revision) | `main` con top-k de 10 y 20 | no disponible | 48 (k=10) | 14/17 (k=10) | no disponible | 14/17 (k=10); k=20 expira un hecho vigente y baja a 13/17 |
| E-L3f (no publicado) | union de negativos de `e-l3b` y `main` | 0.853 | 24 | 11/17 | no disponible | 13/17 (precision 1.00 / recall 0.65) |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 421.293.830 parametros, los pesos en fp16 ocupan aproximadamente 0,84 GB; sumando activaciones y overhead de un encoder de 1024 tokens, el consumo practico se mantiene por debajo de 2 GB.
- GPU recomendadas: cualquier GPU con >= 4 GB, incluidas consumer. La sintonizacion se realizo en una RTX 5090 (364 segundos), lo que indica un coste de computo muy bajo.
- Cabe en GPU de consumo: si, en gamas como RTX 3060, 4090 o equivalentes, y probablemente tambien en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: la model card muestra uso mediante la libreria `laya` (`import laya; agent = laya.Agent(...)`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible, ni se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles para este checkpoint concreto. La pagina de la familia Laya describe el modelo base como un motor de decision de 33 ms, dato que corresponde a la familia y no a esta sintonizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-kannaka-supersession | 421.293.830 | 1024 tokens | Decision de supersesion (`noul`) | apache-2.0 | HuggingFace (flaukowski) |
| convaiinnovations/laya (base) | ~421M (ModernBERT-large) | no disponible | Decisiones tipadas de proposito general ("System 1 decision engine") | apache-2.0 | HuggingFace (convaiinnovations) |
| laya-kannaka-evidence-gate (hermano) | no disponible | no disponible | Puerta de evidencia en el sustrato de memoria Kannaka | no disponible | HuggingFace (flaukowski) |

No se dispone de comparativas con modelos de deteccion de contradiccion o supersesion de otros autores dentro de la informacion proporcionada. Los resultados del banco kannaka-bench solo comparan entre revisiones del propio modelo.

## Limitaciones y advertencias

- Base estadistica reducida: solo 17 positivos retenidos; el autor recomienda tratar el AUROC como +/- 0,06 y el delta de respuestas (+1 pregunta) como ruido.
- Idioma: unicamente ingles. No hay soporte multilingue documentado en este checkpoint, aunque el modelo base se describa como multilingue.
- Contexto limitado a 1024 tokens y afirmaciones truncadas a 1.500 caracteres.
- Distribucion de entrenamiento: entrenado sobre turnos de chat (LongMemEval); un almacen de notas telegraficas es una distribucion distinta y puede degradar el rendimiento.
- Recall incompleto: 19 de 51 pares verdaderos del conjunto de entrenamiento no aparecen siquiera en un top-5, y el reflejo solo detecta 13 de 17 positivos retenidos. No detecta todos los hechos supersedidos.
- Riesgo de sellar hechos vigentes: `e-l3d` no expira ningun hecho actual en la evaluacion, pero variantes con shortlist mas amplia (k=20) si expiran uno y bajan la precision de respuesta.
- Calibracion: el umbral recomendado es `P(yes) >= 0.5`; el autor advierte de que una puerta de mismo hablante elimina un tercio de los sellos falsos a cambio de perder una deteccion, y que un suelo de coseno reduce el recall.
- Licencia: Apache-2.0, permite uso comercial, pero los datos de entrenamiento derivan de LongMemEval (Wu et al.), usado bajo su licencia para investigacion; conviene revisar las condiciones de ese dataset antes de un despliegue comercial.
- Riesgo de alucinacion: al ser un clasificador no autorregenerativo no genera texto, por lo que el riesgo se manifiesta como falsos positivos o falsos negativos en la decision, no como contenido inventado.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flaukowski/laya-kannaka-supersession
- Modelo hermano (evidence gate): https://huggingface.co/flaukowski/laya-kannaka-evidence-gate
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio del modelo base Laya: https://github.com/NandhaKishorM/laya
- Pagina de la familia Laya: https://laya.convaiinnovations.com/
- Kannaka (sustrato de memoria): https://github.com/kannaka-labs/kannaka-memory
- Banco de pruebas kannaka-bench: https://github.com/kannaka-labs/kannaka-bench
- Modelos etiquetados como kannaka en HuggingFace: https://huggingface.co/models?other=kannaka
- Otro modelo del autor: https://huggingface.co/flaukowski/kannaka-brain-v2-lora
- Paper de LongMemEval: Wu et al. (referenciado como origen de los datos de entrenamiento; enlace no disponible en la informacion proporcionada)
