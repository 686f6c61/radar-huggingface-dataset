# jucabala457/flint-chat-templates

## Resumen

`jucabala457/flint-chat-templates` no es un modelo de lenguaje, sino un repositorio de plantillas de chat Jinja para el modelo RecursiveSI/flint. Contiene dos variantes independientes: "Flint Fixed", centrada en compatibilidad y esquema, y "Flint Fixed + Sharp", que añade instrucciones de concisión. El autor declara explícitamente que no se incluyen pesos ni cuantizaciones, solo los ficheros de plantilla.

El problema que aborda es la fidelidad del formato de conversación y del tool calling en Flint. Según la model card, la plantilla original obtenía 98.8/100 en NanoBench v0.7.1 (12 de 13 tareas), perdiendo puntos únicamente en `coding-05`. Las dos variantes publicadas alcanzaron 100.0/100 (13 de 13) en una única ejecución cada una, con una ventana de contexto reportada de 65.536 tokens.

La relevancia es acotada: se trata de un artefacto de comunidad, experimental, con una sola ejecución por variante y métricas marcadas como `CLIENT_REPORTED`. No hay datos verificables sobre arquitectura, tamaño o entrenamiento del modelo subyacente en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene solo plantillas Jinja; no pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (ajuste reportado por el operador en OpenCode; el campo de contexto de NanoBench queda nulo) |
| Tipos de cuantizacion | no disponible (la model card menciona la configuración `flint-ud-iq3_xxs`, sin registrar la cuantización exacta ni el fichero) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | no aplica (ficheros `.jinja`; no se incluyen safetensors ni GGUF) |

## Arquitectura y entrenamiento

No disponible. El repositorio no publica información sobre la arquitectura del modelo base RecursiveSI/flint (transformer, MoE, híbrido u otra), ni sobre el volumen o composición de los datos de entrenamiento, ni sobre fases de alineación como RLHF o DPO. El objeto técnico publicado son dos plantillas Jinja: `templates/flint_fixed.jinja` y `templates/flint_fixed_sharp.jinja`.

La variante "Fixed" aplica correcciones de compatibilidad y esquema sobre la plantilla oficial de RecursiveSI. La variante "Fixed + Sharp" añade guía de respuesta concisa, con el parámetro `terse` activado por defecto, y admite `tool_fidelity` como parámetro adicional. Ambas se distribuyen con `SHA256SUMS.txt` para verificación de integridad y un `release_manifest.json` que documenta el alcance del benchmark y los límites de procedencia.

## Capacidades

- Formateo de conversaciones multi-turno en formato Jinja para el modelo Flint.
- Soporte de tool calling: la model card indica que los argumentos de las llamadas a herramientas deben pasarse como objetos JSON, no como cadenas JSON sin parsear.
- Modo conciso opcional mediante `terse` (activado por defecto en la variante Sharp) y `tool_fidelity`.
- Compatibilidad declarada con `llama-server` de llama.cpp usando `--jinja` y `--chat-template-file`.
- Recepción de `chat_template_kwargs` desde la capa de servicio para desactivar la guía Sharp (`{"terse": false, "tool_fidelity": false}`).
- Idioma: únicamente inglés.
- No se documentan capacidades de visión, audio, matemáticas, razonamiento extendido ni agentes autónomos más allá de lo que permite el tool calling del modelo base.

## Casos de uso

- Despliegue de Flint con llama.cpp en modo servidor: sustituir la plantilla por defecto por `flint_fixed.jinja` mediante `--chat-template-file` para corregir problemas de esquema en la generación de llamadas a herramientas.
- Reducción de coste y latencia en pipelines de agentes: la variante Sharp registró un 16,6 % menos de tiempo de ejecución (5.153,719 s frente a 6.181,937 s) y un 19,8 % menos de llamadas a herramientas (295 frente a 368) en el benchmark reportado, lo que la hace candidata para flujos con muchas iteraciones.
- Integración en OpenCode u otros clientes que consuman plantillas Jinja: el repositorio documenta su evaluación en ese entorno con una ventana de 65.536 tokens.
- Estandarización del formato de argumentos en herramientas: forzar el paso de argumentos como objetos JSON para evitar fallos de parseo en el runtime.
- Pruebas A/B de plantillas en evaluación de agentes: comparar la plantilla original, la Fixed y la Fixed + Sharp sobre el mismo conjunto de 13 tareas de NanoBench v0.7.1 para medir impacto en precisión, tiempo y número de llamadas.
- Control de verbosidad en asistentes conversacionales: activar o desactivar `terse` según el caso de uso para alternar entre respuestas concisas y explicativas sin cambiar de plantilla.

## Benchmarks y rendimiento

NanoBench v0.7.1, 13 tareas, SHA-256 del conjunto de tareas `7e5baefb6485699c93f1aaa67de0b642fa3b5ffb312086340e48347d7aef115f`. Ejecución única por configuración, configuración `flint-ud-iq3_xxs` en OpenCode, contexto reportado de 65.536 tokens.

| Configuracion | Puntuacion | Tareas resueltas | Tiempo oficial (s) | Llamadas a herramientas |
|---|---:|---:|---:|---:|
| Plantilla original | 98,8 / 100 | 12 / 13 | 6.476,142 | 378 |
| Fixed | 100,0 / 100 | 13 / 13 | 6.181,937 | 368 |
| Fixed + Sharp | 100,0 / 100 | 13 / 13 | 5.153,719 | 295 |

La sesión Sharp registró nueve compactaciones de contexto frente a seis de Fixed, elevando el total de tokens de entrada a 670.349; el autor advierte que los totales brutos de entrada no deben interpretarse como medida directa del trabajo realizado. No se han publicado resultados de benchmarks de MMLU, HumanEval, GSM8K ni similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base; el repositorio no incluye pesos ni cuantizaciones.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: llama.cpp (`llama-server` con `--jinja` y `--chat-template-file`), en una build compatible con Flint. El autor no valida otros runtimes, parsers, clientes ni ficheros de modelo.
- Latencia y throughput: solo los tiempos agregados del benchmark NanoBench (6.181,937 s para Fixed y 5.153,719 s para Sharp en 13 tareas); no se publican métricas de tokens por segundo.

## Comparativa con modelos similares

| Artefacto | Tipo | Contexto | Resultado reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Plantilla oficial de RecursiveSI/flint | Plantilla Jinja | no disponible | 98,8 / 100 en NanoBench v0.7.1 | Apache-2.0 (según model card de RecursiveSI) | Hugging Face, commit `2a247be` |
| Flint Fixed (este repo) | Plantilla Jinja | 65.536 tokens (reportado) | 100,0 / 100, 1 ejecución | Apache-2.0 | Hugging Face |
| Flint Fixed + Sharp (este repo) | Plantilla Jinja | 65.536 tokens (reportado) | 100,0 / 100, 1 ejecución, 16,6 % más rápida | Apache-2.0 | Hugging Face |
| Configuración Sharp de peculiar-ragdoll | Plantilla Jinja (origen de la adaptación) | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparación con plantillas de otros modelos porque el artefacto es específico de Flint.

## Limitaciones y advertencias

- Una sola ejecución por variante: una puntuación de 100/100 no constituye una estimación de repetibilidad.
- Los artefactos de NanoBench no guardan el SHA-256 exacto de la plantilla usada; los ficheros actuales se modificaron antes de las ejecuciones correspondientes y los registros no identifican criptográficamente esos bytes. El desajuste con el manifiesto está documentado en `release_manifest.json`.
- Las métricas de OpenCode proceden de un resumen proporcionado por el operador; no se incluyen la base de datos bruta ni los registros privados de ejecución.
- Los resultados son `CLIENT_REPORTED`: la cuantización y el fichero del modelo no están verificados de forma independiente y el campo de contexto del runner queda nulo.
- Los totales brutos de tokens de entrada incluyen relecturas por compactación de contexto y no son comparables como medida de trabajo; la sesión Sharp compactó más veces.
- Los resultados solo describen el conjunto de 13 tareas de NanoBench v0.7.1 y el entorno observado.
- Son plantillas de comunidad modificadas, no lanzamientos oficiales de RecursiveSI ni de peculiar-ragdoll.
- Solo inglés; sin datos sobre sesgos, alucinación o robustez multilingüe del modelo base.
- Licencia Apache-2.0 permite uso comercial de las plantillas, pero no se documentan garantías de compatibilidad con otros parsers, runtimes o ficheros de modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jucabala457/flint-chat-templates
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Plantilla oficial de Flint (commit referenciado): https://huggingface.co/RecursiveSI/flint/blob/2a247be0c0aec895ccb0ac7ca92229ec6df37288/chat_template.jinja
- Plantilla Fixed: `templates/flint_fixed.jinja` (dentro del repositorio)
- Plantilla Fixed + Sharp: `templates/flint_fixed_sharp.jinja` (dentro del repositorio)
- Informe completo del benchmark: `benchmarks/nanobench_0.7.1.md`
- Métricas por sesión: `benchmarks/flint_session_metrics.csv`
- Resultados por tarea: `benchmarks/flint_task_results.csv`
- Verificación de integridad: `SHA256SUMS.txt`
- Manifiesto de release: `release_manifest.json`
