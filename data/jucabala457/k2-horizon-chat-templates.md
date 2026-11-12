# jucabala457/K2-Horizon-Chat-Templates

## Resumen

K2 Horizon Chat Templates es un repositorio de plantillas de chat Jinja para los modelos de la familia K2 Horizon de IFM, concretamente para K2-Horizon-MoVA-36B-A4B y K2-Horizon-7B. No contiene pesos ni cuantizaciones: es exclusivamente un paquete de plantillas que define el formato de conversacion, incluyendo soporte de tool calling, para su uso con runtimes compatibles como llama.cpp. Lo publica el usuario jucabala457 como trabajo experimental y derivado, no como lanzamiento oficial del desarrollador del modelo base.

El repositorio ofrece dos variantes: una plantilla "Fixed v1.0" orientada a compatibilidad y fidelidad de esquema, y una plantilla "Sharp v0.4" que anade instrucciones para respuestas mas concisas. La relevancia es practica: la plantilla de chat condiciona directamente la calidad del tool calling y el consumo de tokens en agentes, y el autor documenta una evaluacion con NanoBench 0.7.0 sobre 13 tareas que compara ambas variantes con la plantilla original del modelo.

Ambas plantillas comparten la misma estructura de conversacion que los checkpoints K2 Horizon, de ahi que puedan intercambiarse, pero los resultados publicados corresponden unicamente a ejecuciones sobre la cuantizacion GGUF de K2-Horizon-MoVA-36B-A4B. No se realizo ninguna prueba con K2-Horizon-7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene solo plantillas Jinja, sin pesos) |
| Parametros totales | no disponible (modelo base: K2-Horizon-MoVA-36B-A4B, 36B segun nomenclatura; K2-Horizon-7B, 7B) |
| Parametros activos | no disponible (el nombre del modelo base sugiere A4B, es decir, 4B activos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el benchmark uso una GGUF Q4_K_M del modelo base) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica (plantillas .jinja); el modelo base se distribuye en GGUF, entre otros |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica pesos: publica dos archivos Jinja que controlan como se serializan los turnos de conversacion, los mensajes de sistema, las llamadas a herramientas y los resultados de herramientas antes de enviarlos al modelo. La variante Fixed v1.0 reproduce la plantilla nativa de K2 Horizon con correcciones de compatibilidad y no anade instrucciones adicionales. La variante Sharp v0.4 incorpora una guia de estilo adaptada de la configuracion "Sharp" de peculiar-ragdoll, con el parametro `terse` activado por defecto y `tool_fidelity` desactivado por defecto.

El autor indica que encargo a GPT Astra la auditoria y correccion de la plantilla de K2 Horizon y la adaptacion de la configuracion Sharp. La guia de estilo Sharp es una adaptacion propia y no cuenta con el aval de IFM ni de peculiar-ragdoll. Los parametros de la plantilla pueden desactivarse desde la capa de servicio mediante `chat_template_kwargs` con `{"terse": false, "tool_fidelity": false}`.

## Capacidades

- Serializacion de conversaciones multi-turno con roles de sistema, usuario, asistente y herramienta segun el esquema de K2 Horizon.
- Soporte de tool calling / function calling: los argumentos de las llamadas a herramientas deben pasarse como objetos JSON, no como cadenas JSON sin parsear.
- Control de verbosidad mediante el parametro `terse`, activado por defecto en Sharp v0.4.
- Parametro `tool_fidelity` para forzar mayor fidelidad en la generacion de llamadas a herramientas (desactivado por defecto; el experimento con `true` no se incluye en el release).
- Compatibilidad declarada con K2-Horizon-MoVA-36B-A4B y K2-Horizon-7B, que comparten plantilla de chat.
- Integracion con llama.cpp mediante `--jinja` y `--chat-template-file`.
- No incluye capacidades de vision, audio ni modos de razonamiento extendido; esas capacidades, si existen, dependen del modelo base y no de la plantilla.

## Casos de uso

- Despliegue de agentes con tool calling sobre K2-Horizon-MoVA-36B-A4B en llama.cpp: se pasa la plantilla Fixed v1.0 con `--jinja` para maximizar la finalizacion de tareas y la fidelidad de esquema, segun el resultado observado de 1300/1300 en NanoBench.
- Reduccion de coste por tokens en pipelines agenticos: Sharp v0.4 registro un 13.8% menos de tokens de tarea que Fixed y un 12.6% menos de tiempo de tarea puntuado, con una puntuacion de 1255/1300, adecuado cuando se prioriza eficiencia sobre perfeccion absoluta.
- Estandarizacion del formato de chat en equipos que sirven el mismo modelo con distintos clientes: al ser archivos Jinja independientes, pueden versionarse y desplegarse de forma controlada junto al servidor de inferencia.
- Evaluacion comparativa de plantillas en tareas de agente: el repositorio incluye el conjunto de 13 tareas de NanoBench 0.7.0 con SHA-256 documentado, util para reproducir o ampliar la comparacion.
- Ajuste de verbosidad en asistentes integrados en interfaces de usuario: activar `terse` para respuestas mas cortas en chatbots donde la latencia y el coste de salida importan.
- Pruebas de compatibilidad con runtimes y parsers: el autor advierte que no se establecio compatibilidad con todos los runtimes, parsers, cuantizaciones o clientes, por lo que el repositorio sirve como base para validar el comportamiento del tool calling en cada stack.
- Integracion en flujos de CI/CD que validan esquemas de llamadas a herramientas: la variante Fixed prioriza la fidelidad de esquema, lo que facilita tests deterministas sobre la estructura de las llamadas generadas.

## Benchmarks y rendimiento

Los datos proceden de NanoBench 0.7.0 sobre un conjunto de 13 tareas (SHA-256 `582957436f034474bddc6686487adddc0fb46bcee24777727126f486aed60602`), con una ejecucion por configuracion y un maximo de 100 puntos por tarea. Solo se evaluo la cuantizacion GGUF de K2-Horizon-MoVA-36B-A4B.

| Configuracion | Puntuacion | Tiempo de tarea puntuado (s) | Tokens de tarea (entrada + salida) |
|---|---:|---:|---:|
| Plantilla original de K2 Horizon | 1210 / 1300 (93.1%) | 28.465,9 | 222.400 |
| Fixed v1.0 | 1300 / 1300 (100,0%) | 20.372,6 | 253.646 |
| Sharp v0.4 | 1255 / 1300 (96,5%) | 17.802,6 | 218.548 |
| Sharp con `tool_fidelity=true` (no publicado) | 1195 / 1300 (91,9%) | 15.192,7 | 176.093 |

Segun los totales derivados de la base de datos de OpenCode, Sharp v0.4 uso un 13,8% menos de tokens que Fixed, y NanoBench reporta un 12,6% menos de tiempo de tarea puntuado. Fixed obtuvo la puntuacion mas alta pero consumio mas tokens de tarea que la plantilla original. El experimento con `tool_fidelity=true` fue el mas rapido y el que menos tokens uso, pero no completo la funcionalidad requerida en la tarea `systems-01` y por eso no se publica como plantilla. Los totales de tokens de tarea cubren la ventana entre `issued_at` y `submitted_at`; los totales de sesion completa incluyen la configuracion y el informe final.

## Requisitos de hardware

- El repositorio no requiere hardware: son dos archivos Jinja sin pesos.
- El hardware depende del modelo base. Para K2-Horizon-MoVA-36B-A4B en GGUF Q4_K_M se necesita un runtime compatible con llama.cpp con soporte de K2 Horizon; la VRAM concreta no esta disponible en la informacion proporcionada.
- Para K2-Horizon-7B, la VRAM estimada tampoco esta disponible; el autor no realizo pruebas con este checkpoint.
- Opciones de despliegue documentadas: llama.cpp con `llama-server`, `--jinja` y `--chat-template-file`. No se documenta compatibilidad con vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: no disponibles como metricas de inferencia; el benchmark reporta tiempos de tarea agregados, no latencia por peticion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otras plantillas de chat ni con otros modelos; la unica comparacion documentada es interna, entre la plantilla original de K2 Horizon, Fixed v1.0 y Sharp v0.4.

## Limitaciones y advertencias

- Cada configuracion tiene una sola ejecucion observada; los resultados no establecen una tasa de exito ni fiabilidad estadistica.
- El paquete de benchmark no registra el SHA exacto de la plantilla usada en cada ejecucion. El archivo Fixed actual coincide con su manifiesto de origen local; el archivo Sharp v0.4 es unos 22 minutos anterior a su ejecucion de 1255 puntos, sin vinculo criptografico con esos bytes exactos.
- Algunos campos de modelo, harness, contexto y cuantizacion estan marcados como desconocidos o autodeclarados en los archivos de benchmark.
- Los totales de tokens y los recuentos de intervenciones de plugins provienen de un informe basado en la base de datos de sesiones de OpenCode, no del JSON de resultados de NanoBench.
- No se probo K2-Horizon-7B; los resultados solo aplican a la GGUF de K2-Horizon-MoVA-36B-A4B.
- No se establecio compatibilidad con todos los runtimes, parsers, cuantizaciones o clientes. Los argumentos de las llamadas a herramientas deben pasarse como objetos JSON, no como cadenas sin parsear.
- La guia Sharp es una adaptacion del autor y no cuenta con el aval de IFM ni de peculiar-ragdoll.
- Licencia Apache-2.0 heredada del modelo base; conviene verificar las condiciones del checkpoint subyacente antes de un uso comercial en produccion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; dependen del modelo base, no de la plantilla.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jucabala457/K2-Horizon-Chat-Templates
- Modelo base K2-Horizon-MoVA-36B-A4B: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Modelo base K2-Horizon-7B: https://huggingface.co/IFM/K2-Horizon-7B
- GGUF usado en el benchmark: https://huggingface.co/bartowski/K2-Horizon-MoVA-36B-A4B-GGUF
- Informe completo del benchmark: benchmarks/nanobench_0.7.0.md (dentro del repositorio)
- Datos por configuracion: benchmarks/nanobench_results.csv (dentro del repositorio)
- Datos por tarea: benchmarks/nanobench_task_metrics.csv (dentro del repositorio)
- Atribuciones: NOTICE.md (dentro del repositorio)
- Texto de la licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
