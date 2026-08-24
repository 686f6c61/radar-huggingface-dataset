# agentic-ptb/sol-max-v2-record

## Resumen

El repositorio `agentic-ptb/sol-max-v2-record` no contiene un modelo de lenguaje propiamente dicho, sino el registro completo de ejecución de una célula de entrenamiento del proyecto AgentPTB. Se trata de un artefacto de datos que documenta el proceso de entrenamiento de un agente basado en Codex / gpt-5.6-sol con esfuerzo de razonamiento máximo, durante 100 horas ininterrumpidas. El autor, `agentic-ptb`, publica este registro como parte de un sistema de evaluación de agentes autónomos de entrenamiento, donde cada célula produce checkpoints y métricas de rendimiento.

El contenido incluye la trayectoria completa del agente (576 archivos de eventos), los resultados de sus propias evaluaciones en terminal-bench-2 y swe-bench-verified, el código del harness y las configuraciones de entrenamiento, así como el registro de decisiones y el log del supervisor. No se trata de un modelo con pesos ni arquitectura definida, sino de un conjunto de datos de trazabilidad y auditoría. Su relevancia radica en que permite analizar cómo un agente autónomo decide qué checkpoint enviar y cómo se comporta durante largas sesiones de entrenamiento, un área emergente en la investigación de IA.

El repositorio tiene un tamaño de 2,3 GB y fue creado en agosto de 2026. No se especifican licencia, idiomas ni pipeline de inferencia, lo que refuerza su naturaleza de registro técnico más que de modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de inferencia, es un registro de ejecución) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no aplica, no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica (contiene archivos de texto, JSON, logs y código) |

## Arquitectura y entrenamiento

Este repositorio no describe la arquitectura de un modelo, sino el proceso de entrenamiento de un agente autónomo. El agente, basado en Codex / gpt-5.6-sol con esfuerzo de razonamiento `max`, fue ejecutado durante 100 horas (desde 2026-08-19T19:15:00Z) en un nodo denominado `tb-1`. Durante la ejecución se publicaron 36 checkpoints (identificados como `agentic-ptb/sol-max-v2.h*`) y el agente seleccionó uno concreto, `sol-max-v2.h007.pi-agent-sft-v5.step_600`, como su envío final, a pesar de haber generado 75 horas adicionales de entrenamiento posterior.

El registro incluye la trayectoria completa del agente (cada turno de Codex, 576 archivos de eventos), el código del harness y los scripts de entrenamiento/evaluación que el propio agente escribió, así como el corpus de entrenamiento que construyó (publicado por separado en `agentic-ptb/sol-max-v2-data`). No se detallan datos sobre el dataset de entrenamiento del modelo subyacente ni sobre técnicas como RLHF o DPO, ya que el foco está en el comportamiento del agente, no en el modelo resultante.

## Capacidades

- No es un modelo de generación de texto, razonamiento, código o visión. No tiene capacidades de tool calling, agentes o multilingües.
- Contiene la trayectoria de decisiones de un agente de entrenamiento autónomo, incluyendo sus evaluaciones y selección de checkpoints.
- Incluye métricas de rendimiento del agente en dos benchmarks de tareas de agente: terminal-bench-2 y swe-bench-verified.
- Proporciona el código fuente del harness y las configuraciones utilizadas, lo que permite reproducir o analizar el proceso.
- Ofrece un registro de auditoría completo (supervisor.log, RUNLOG.md) para estudiar el comportamiento del agente durante 100 horas.

## Casos de uso

- Investigación en agentes autónomos de entrenamiento: el registro permite estudiar cómo un agente decide qué checkpoint enviar, cómo gestiona su presupuesto de tiempo y cómo prioriza entre diferentes objetivos de evaluación.
- Auditoría y reproducibilidad de experimentos: al incluir la trayectoria completa, el código del harness y los logs, se puede auditar cada paso del proceso y reproducir las condiciones exactas de la ejecución.
- Análisis de estrategias de selección de modelos: el hecho de que el agente eligiera un checkpoint de la hora 7 en lugar de uno posterior es un caso de estudio sobre criterios de selección basados en métricas propias.
- Desarrollo de métricas de evaluación para agentes: los resultados en terminal-bench-2 y swe-bench-verified, aunque no comparables entre células, sirven como referencia para calibrar nuevos harnesses.
- Formación de nuevos agentes: el corpus de entrenamiento publicado en `agentic-ptb/sol-max-v2-data` puede utilizarse como datos de partida para otros experimentos.
- Comparación de metodologías: al existir otros registros de células (como `sol-max`), se pueden contrastar estrategias de ejecución y resultados.

## Benchmarks y rendimiento

La model card incluye métricas auto-reportadas por el agente bajo su propio harness y tamaño de muestra. Estas cifras no son comparables entre células y deben interpretarse con cautela. Se presentan tal como aparecen en la documentación:

| Harness | Suite | Episodios | Score | IC 95% |
|---|---|---|---|---|
| enviado | terminal-bench-2 | 89 | 4.49 | [1.76, 10.99] |
| enviado | swe-bench-verified | 500 | 22.40 | [18.96, 26.26] |
| stock-compatible | terminal-bench-2 | 89 | 2.25 | [0.62, 7.83] |
| stock-compatible | swe-bench-verified | 500 | 20.40 | [17.10, 24.15] |

No se dispone de resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el repositorio no contiene un modelo de lenguaje evaluable.

## Requisitos de hardware

- No aplica: el repositorio es un conjunto de datos de registro, no un modelo de inferencia.
- Para analizar los archivos (logs, JSON, trayectorias) se requiere almacenamiento de 2,3 GB y una máquina con capacidad de procesamiento de texto, sin necesidad de GPU.
- Si se quisiera reproducir la ejecución del agente, se necesitaría acceso a la API de Codex / gpt-5.6-sol y una infraestructura capaz de sostener 100 horas de ejecución continua, pero esto no está documentado en el repositorio.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje comparable con otros modelos de la misma categoría. Existen otros registros de células de AgentPTB (como `sol-max`), pero no se proporcionan datos suficientes para una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo desplegable: no contiene pesos, arquitectura ni pipeline de inferencia. Intentar usarlo como un LLM sería un error.
- Las métricas de rendimiento son auto-reportadas por el agente bajo su propio harness y no son comparables con otras células ni con benchmarks estándar.
- No se especifica licencia, por lo que el uso comercial o la redistribución del contenido requieren verificación con el autor.
- El repositorio incluye credenciales de driver en `codex_home/` que no se publican, lo que indica que parte del contenido sensible se ha omitido deliberadamente.
- La fecha de creación (2026) y la referencia a modelos como gpt-5.6-sol sugieren que el contenido puede estar desactualizado o ser especulativo; no hay confirmación independiente de los resultados.

## Enlaces

- Repositorio principal: https://huggingface.co/agentic-ptb/sol-max-v2-record
- Índice de checkpoints y métricas: https://huggingface.co/datasets/agentic-ptb/INDEX
- Lista de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
- Checkpoints publicados: `agentic-ptb/sol-max-v2.h*` (36 archivos)
- Corpus de entrenamiento: `agentic-ptb/sol-max-v2-data`
