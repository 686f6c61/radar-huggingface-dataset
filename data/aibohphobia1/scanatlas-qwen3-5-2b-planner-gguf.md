# aibohphobia1/ScanAtlas-Qwen3.5-2B-Planner-GGUF

## Resumen

ScanAtlas-Qwen3.5-2B-Planner-GGUF es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-2B, desarrollado por el usuario aibohphobia1, orientado especificamente a la planificacion de acciones para el asistente en dispositivo de la aplicacion ScanAtlas. No se trata de un modelo conversacional de proposito general: espera el prompt y la gramatica JSON propias de la aplicacion, y genera planes de accion estructurados en 15 idiomas.

El modelo se construye mediante un LoRA entrenado sobre ejemplos de planificacion de ScanAtlas, fusionado en los pesos de texto del modelo base y posteriormente cuantizado a Q4_0 con llama.cpp (build b11799). El resultado es un artefacto de 1,2 GB en formato GGUF, disenado para inferencia en movil: la evaluacion publicada se realizo en un telefono con Snapdragon 8 Gen 1, con un turno mediano de 5,6 segundos usando 4 hilos de CPU.

Su relevancia radica en el nicho: demuestra un flujo completo de especializacion de un modelo pequeno (1.881.825.088 parametros) para una tarea concreta de tool calling en un entorno de recursos limitados, con licencia Apache-2.0 y pesos listos para llama.cpp. No obstante, el propio autor advierte que no es un modelo de chat general y que su evaluacion no ha sido revisada por hablantes nativos en los idiomas distintos del ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-2B); detalles no disponibles |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (unica publicada en el repo) |
| Idiomas soportados | 15 idiomas (lista concreta no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, del que hereda la arquitectura transformer; la informacion proporcionada no detalla la configuracion interna (numero de capas, dimension oculta, mecanismo de atencion ni contexto maximo). Sobre ese modelo base se entreno un LoRA con ejemplos de planificacion de ScanAtlas, que posteriormente se fusiono en los pesos de texto del modelo original. No se especifica el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica principal no esta en la arquitectura sino en el pipeline de especializacion y despliegue: ajuste con LoRA, fusion, cuantizacion a Q4_0 con llama.cpp b11799 y explotacion de una gramatica JSON y un formato de prompt especificos de la aplicacion para forzar salidas estructuradas. El objetivo es ejecutar la planificacion de acciones en el propio dispositivo, sin depender de la nube.

## Capacidades

- Planificacion de acciones para el asistente de ScanAtlas: genera planes en el formato JSON esperado por la aplicacion.
- Tool calling / function calling: el modelo esta entrenado especificamente para decidir y estructurar acciones invocables.
- Generacion de texto condicionada al prompt de la aplicacion, no como chat libre.
- Soporte de 15 idiomas, segun la model card.
- Inferencia en dispositivo mediante llama.cpp, compatible con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de vision, audio, matemáticas avanzadas ni razonamiento multi-paso general fuera del dominio de la aplicacion.

## Casos de uso

- Asistente en dispositivo de ScanAtlas: el modelo recibe el prompt y la gramatica JSON de la aplicacion y devuelve el siguiente plan de accion; es su caso de uso nativo y el unico validado por el autor.
- Procesamiento offline en movil: al ejecutarse con llama.cpp sobre CPU, permite planificar acciones sin conexion en un Snapdragon 8 Gen 1, con turnos medianos de 5,6 s en 4 hilos.
- Prototipado de asistentes con tool calling en recursos limitados: sirve como referencia para equipos que quieran especializar un modelo de ~2B en una tarea de planificacion estructurada mediante LoRA y cuantizacion Q4_0.
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` permite servirlo en infraestructura de inferencia estandar para pruebas de integracion con la app.
- Evaluacion de pipelines de gramatica JSON: util para medir la fiabilidad de salidas estructuradas forzadas por gramatica en modelos pequenos.
- Base para nuevos ajustes de dominio: al estar bajo Apache-2.0 y en GGUF, puede servir de punto de partida para otras aplicaciones que necesiten planificacion de acciones multilingue en dispositivo.

## Benchmarks y rendimiento

| Metrica | ScanAtlas-Qwen3.5-2B-Planner | Qwen3.5-2B sin entrenar |
|---|---|---|
| Tareas superadas (de 356) | 349 | 274 |
| Entorno de evaluacion | Snapdragon 8 Gen 1, 4 hilos de CPU, mediante la app | PC |
| Turno mediano | 5,6 s | no disponible |

La evaluacion cubre 356 tareas en 15 idiomas. El autor advierte que las tareas en idiomas distintos del ingles no han sido revisadas por hablantes nativos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo ocupa 1,2 GB en Q4_0, por lo que el peso en memoria rondara ese orden de magnitud mas el overhead de llama.cpp.
- GPU recomendadas: no disponibles; el modelo esta pensado para CPU en movil (Snapdragon 8 Gen 1) y no se documentan requisitos de GPU.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del archivo GGUF, aunque no se confirma en la informacion proporcionada.
- Opciones de despliegue: llama.cpp (build b11799 o posterior), con soporte declarado para endpoints compatibles.
- Latencia y throughput: turno mediano de 5,6 s en Snapdragon 8 Gen 1 con 4 hilos de CPU; no hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| ScanAtlas-Qwen3.5-2B-Planner-GGUF | 1.881.825.088 | no disponible | 349/356 tareas propias | Apache-2.0 | GGUF Q4_0 |
| Qwen/Qwen3.5-2B (base) | no disponible | no disponible | 274/356 tareas propias | no disponible en la informacion | safetensors |
| Otras alternativas de ~2B para tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat general: espera el prompt y la gramatica JSON de ScanAtlas; fuera de ese contexto su comportamiento no esta garantizado.
- La evaluacion se realizo con 356 tareas propias y las tareas no inglesas no fueron revisadas por hablantes nativos, por lo que el rendimiento multilingue real puede diferir.
- Riesgo de alucinacion en la generacion de planes de accion no validados por la aplicacion; se recomienda validacion estricta de la salida JSON.
- No se documentan sesgos conocidos, pero al derivar de un modelo base no auditado en la informacion disponible, deben asumirse los sesgos heredados.
- Solo se publica una cuantizacion (Q4_0), lo que limita el ajuste de precision frente a velocidad.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias y el modelo se distribuye tal cual.
- El repo tiene 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/aibohphobia1/ScanAtlas-Qwen3.5-2B-Planner-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp: no disponible en la informacion proporcionada
- Paper, blog o demo: no disponible en la informacion proporcionada
