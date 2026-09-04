# mattwinwood/qwen3.5-9b-structured-review-profile

## Resumen

Este repositorio no contiene un modelo entrenado ni afinado: es un artefacto de configuracion y evaluacion (model-recipe) que documenta el uso acotado de Qwen/Qwen3.5-9B para cargas de trabajo de revision asesora dentro del Winwood AI Toolkit. Desarrollado por mattwinwood, empaqueta contratos JSON de salida exacta, decisiones permitidas e inseguras explicitas, reglas de prompt que tratan la evidencia suministrada como unica autoridad, validacion determinista antes de que cualquier resultado llegue a una persona y una frontera de promocion controlada por humanos y limitada a canary. La relevancia del proyecto reside en que los modelos locales pequenos ganan utilidad cuando el sistema circundante asume las fronteras de decision: el modelo propone, el codigo valida y una persona decide. No se especifican arquitectura, tamano de parametros ni longitud de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio no contiene pesos; no se especifica la arquitectura del modelo upstream) |
| Parametros totales | No disponible (el nombre sugiere 9B, pero no se confirma en la informacion proporcionada) |
| Parametros activos | No aplicable (no se trata de un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se menciona una build de Ollama con digest-pinned, sin detalle de cuantizacion) |
| Idiomas soportados | en (segun el frontmatter del repositorio; no se especifican idiomas del modelo upstream) |
| Licencia | Apache-2.0 para el repositorio; el modelo upstream Qwen tiene su propia licencia |
| Formato de pesos | No disponible (no incluye pesos; se ejecuta mediante Ollama) |

## Arquitectura y entrenamiento

El repositorio no es un modelo, sino un conjunto de contratos JSON, prompts y reglas de validacion que definen el comportamiento de Qwen3.5-9B en tres cargas de trabajo concretas. No se realizo fine-tuning ni se emplearon tecnicas como RLHF o DPO. La innovacion principal no esta en el modelo, sino en el sistema que lo envuelve: las fronteras de decision se desplazan fuera del modelo, de modo que el modelo solo propone salidas y el codigo se encarga de validarlas de forma determinista. Las instrucciones de prompt tratan la evidencia aportada como la unica autoridad, y existe una frontera de promocion controlada por humanos que impide que los resultados se utilicen de forma autonoma en produccion.

## Capacidades

- Generacion de texto y clasificacion en cargas de revision asesora.
- Salida estructurada en JSON con contratos exactos para tres tareas: roadmap intake, release readiness y catalog mutation review.
- Reglas de prompt que tratan la evidencia suministrada como unica fuente de verdad.
- Validacion determinista de esquemas antes de que cualquier resultado llegue a una persona.
- Frontera de promocion controlada por humanos, limitada a canary, para decisiones de despliegue o mutacion de datos.
- Evaluacion con metricas de tasa de aprobacion, validez de esquema y salidas inseguras.
- No se menciona soporte de tool calling, vision ni audio en la informacion proporcionada.

## Casos de uso

La informacion disponible documenta tres cargas de trabajo concretas. Se describen a continuacion; no se dispone de informacion sobre casos de uso adicionales.

- Clasificacion de solicitudes de roadmap: el modelo clasifica una solicitud entrante y redacta tareas acotadas, pero nunca crea ni modifica registros de roadmap. Es adecuado porque el perfil impone contratos JSON exactos y reglas que impiden la escritura autonoma.
- Evaluacion de readiness de release: el modelo juzga unicamente la evidencia de release suministrada, sin desplegar, fusionar, publicar ni afirmar comprobaciones ausentes. Es adecuado porque el prompt restringe la salida a la evidencia proporcionada y la validacion determinista bloquea decisiones inseguras.
- Revision de mutaciones de catalogo: el modelo reconcilia una propuesta, las fuentes y las compuertas deterministas, pero nunca escribe ni promociona datos de catalogo. Es adecuado porque el perfil define decisiones permitidas e inseguras explicitas y una frontera de promocion humana.

## Benchmarks y rendimiento

El README presenta mediciones historicas de un entorno local especifico (build de Ollama con digest-pinned, `qwen3.5:9b`, el 2026-08-29). No son benchmarks estandar y no se reproducen con otros runtimes o configuraciones.

| Carga de trabajo | Casos | Tasa de aprobacion | Esquema valido | Salidas inseguras |
|---|---:|---:|---:|---:|
| Roadmap intake | 23 | 95.7% | 100% | 0 |
| Release readiness | 20 | 95.0% | 100% | 0 |
| Catalog mutation review | 19 | 84.2% | 100% | 0 |

La carga de catalog mutation review no alcanzo el umbral de promocion del 90%, por lo que todas las cargas permanecieron en modo canary. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: no disponible (se ejecuto localmente via Ollama, lo que sugiere que puede ejecutarse en hardware de consumo, pero no hay datos concretos).
- Opciones de despliegue: Ollama (mencionado en el repositorio); se utilizo un gateway compatible con OpenAI para la evaluacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion comparativa en la informacion proporcionada. No se han publicado datos que permitan comparar este perfil con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- No incluye pesos, adaptadores, tokenizer ni endpoint de inferencia.
- No se realizo fine-tuning.
- Los prompts y esquemas no hacen que la salida del modelo sea fiable o segura por si mismos.
- Los resultados pueden cambiar con una cuantizacion, runtime, prompt, politica, sampler o revision del modelo diferentes.
- El perfil no debe usarse para autorizar despliegues, mutar datos de usuario ni tomar decisiones consecuentes de forma autonoma.
- La carga de catalog mutation review no alcanzo el umbral del 90%, lo que indica un rendimiento insuficiente para esa tarea en el entorno evaluado.
- Los sesgos y el riesgo de alucinacion del modelo upstream no se evaluan en la informacion proporcionada; el perfil no los mitiga por si solo.

## Enlaces

- Repositorio del perfil: https://huggingface.co/mattwinwood/qwen3.5-9b-structured-review-profile
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset publico de evaluacion de guardrails: https://huggingface.co/datasets/mattwinwood/production-ai-guardrail-evals
- Resena externa sobre Qwen3.5-9B: https://wavespeed.ai/blog/ai-models/qwen3-5-9b-review/
