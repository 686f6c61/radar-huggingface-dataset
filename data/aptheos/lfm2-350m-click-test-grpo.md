# Aptheos/lfm2-350m-click-test-grpo

## Resumen

Aptheos/lfm2-350m-click-test-grpo es un conjunto de tres adaptadores LoRA (semillas 23, 47 y 71) entrenados sobre el modelo base LiquidAI/LFM2-350M mediante GRPO (Group Relative Policy Optimization) con TRL 0.29. El objetivo es muy concreto: alinear al modelo para que emita la acción estricta `click('13')` en la tarea MiniWoB `click-test`, un escenario de control de navegador con un único prompt invariante a la semilla. No se trata de un agente de navegador general, sino de una demostración de alineamiento reproducible a un formato de acción sobre un prompt fijo.

El modelo base LFM2-350M es un transformer de 350 millones de parámetros desarrollado por Liquid AI. Los adaptadores son de rango 8 (alpha 16) en FP32 y se entrenaron en una Colab T4 gratuita en unos 17 minutos por semilla, con 60 grupos de 8 muestras cada uno. El resultado reportado es contundente en esa tarea: 50/50 evaluaciones muestreadas correctas por semilla entrenada frente a 2/50 del modelo congelado.

La relevancia es metodológica más que de producto: muestra que un modelo de 350M puede alinearse de forma fiable a un formato de acción estructurado con un presupuesto de cómputo mínimo, y documenta el proceso con hashes de pesos, revisiones fijadas y una guía de reproducción. Su utilidad práctica fuera de ese prompt concreto es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base LFM2-350M) con adaptadores LoRA de rango 8 (alpha 16) |
| Parametros totales | 350M en el modelo base; los adaptadores LoRA son un subconjunto entrenable de ese total (no se especifica el número exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (los adaptadores se distribuyen en safetensors FP32) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial limitado a entidades con ingresos anuales inferiores a 10 millones de dólares |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA en subcarpetas `seed-23`, `seed-47`, `seed-71`) |

## Arquitectura y entrenamiento

El modelo base es LFM2-350M de Liquid AI, un transformer decoder-only de 350 millones de parámetros. Sobre él se aplican tres adaptadores LoRA independientes de rango 8 y alpha 16, entrenados en FP32. El entrenamiento usa GRPO con TRL 0.29: 60 grupos de 8 muestras por semilla, con recompensa derivada del entorno de la tarea MiniWoB `click-test`. Cada ejecución de entrenamiento tardó aproximadamente 17 minutos en una Colab T4 gratuita.

Un detalle metodológico relevante que el autor declara explícitamente: durante los primeros 40 de los 60 grupos estuvo activo un currículo de formato derivado de la respuesta, por lo que el aprendizaje a partir únicamente de la recompensa del entorno no queda aislado. Además, la revisión del modelo base no se fijó en las ejecuciones originales de julio de 2026; en noviembre de 2026 se re-evaluaron los tres adaptadores sobre la revisión `f37d3f5c8c5484bc01dad379a595cf4c68c4e70e`, obteniendo de nuevo 50/50 frente a 2/50 del base.

## Capacidades

- Generación de texto como capacidad heredada del modelo base LFM2-350M.
- Emisión de acciones estructuradas en el formato exacto `click('13')` para la tarea MiniWoB `click-test`, tras el alineamiento con GRPO.
- Alineamiento reproducible a un formato de acción concreto sobre un prompt invariante a la semilla (tres semillas distintas convergen al mismo comportamiento).
- No es un agente de navegador general: el autor lo declara explícitamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible (la tarea es de un solo paso).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de RLHF/GRPO a bajo coste: sirve como caso de referencia para validar un pipeline de TRL + PEFT en una GPU consumer, ya que el entrenamiento completo cabe en una T4 gratuita en menos de 20 minutos por semilla.
- Estudio de alineamiento a formatos de acción: permite analizar cómo un modelo de 350M pasa de generar texto libre a emitir una acción estructurada, con métricas de éxito y intervalos de Wilson documentados.
- Docencia y formación en RL para agentes: el repositorio incluye hashes SHA-256 de los pesos y una guía de reproducción, lo que facilita usarlo como ejercicio práctico verificable.
- Prueba de concepto de control de navegador: demuestra el ciclo completo (entorno MiniWoB, recompensa, adaptador LoRA, evaluación con temperatura 1.0 y top_p 0.95) antes de escalar a tareas más complejas.
- Validación de infraestructura de evaluación: los replays en GIF y el Space asociado permiten comprobar de forma visual la diferencia entre el modelo base y el adaptado sobre la misma semilla.
- Base para experimentos de generalización: al ser un caso deliberadamente fácil y de un solo prompt, es un punto de partida controlado para medir cuánto se degrada el alineamiento al variar el prompt o la tarea.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre la tarea `click-test`, con 50 evaluaciones muestreadas a temperatura 1.0 y top_p 0.95, más una evaluación greedy.

| Semilla de entrenamiento | Modelo congelado (base) | Adaptador entrenado | Entrenado greedy | Primer grupo 8/8 |
|---|---|---|---|---|
| 23 | 2/50 | 50/50 | Éxito | 8 |
| 47 | 2/50 | 50/50 | Éxito | 6 |
| 71 | 2/50 | 50/50 | Éxito | 3 |

Intervalo de confianza Wilson al 95%: entrenado 92,9–100%; congelado 1,1–13,5%. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo base (350M) y unos adaptadores LoRA de rango 8, la huella es muy reducida y cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA T4 (Colab gratuita); para inferencia basta con GPUs de gama baja o incluso CPU.
- Cabe en GPU consumer: sí, el propio entrenamiento se ejecutó en una T4 gratuita.
- Opciones de despliegue: `transformers` + `peft` (carga mediante `PeftModel.from_pretrained` con subcarpeta `seed-23`, `seed-47` o `seed-71`); se recomienda usar las versiones fijadas de `transformers`, `peft` y `trl` del repositorio de código.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aptheos/lfm2-350m-click-test-grpo | 350M (base) + LoRA r8 | no disponible | `click-test` MiniWoB | LFM Open License v1.0 | HuggingFace (0 descargas) |
| LiquidAI/LFM2-350M (base) | 350M | no disponible | Generación de texto general | LFM Open License v1.0 | HuggingFace |
| Otros adaptadores GRPO para control de navegador | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables de la misma categoría (adaptadores LoRA para control de navegador sobre modelos pequeños) en la información proporcionada.

## Limitaciones y advertencias

- No es un agente de navegador general: el autor lo declara explícitamente; solo se ha validado sobre un prompt invariante a la semilla de `click-test`.
- El currículo de formato derivado de la respuesta estuvo activo durante los primeros 40 de 60 grupos, por lo que no se aísla el aprendizaje a partir únicamente de la recompensa del entorno.
- La revisión del modelo base no se fijó en las ejecuciones originales de julio de 2026; los resultados se re-verificaron en noviembre de 2026 sobre una revisión concreta, pero existe riesgo de reproducibilidad si se usa otra revisión.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo base puede generar texto libre en lugar de acciones si no se aplica el adaptador correctamente.
- Licencia restrictiva: LFM Open License v1.0 limita el uso comercial a entidades con ingresos anuales inferiores a 10 millones de dólares.
- Los adaptadores son archivos nuevos entrenados sobre el modelo base; los ficheros del modelo base no se incluyen ni se modifican, por lo que hay que descargarlos por separado.
- Sin descargas ni likes en el momento de la consulta; proyecto de investigación con soporte comunitario limitado.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe fiable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aptheos/lfm2-350m-click-test-grpo
- Modelo base: https://huggingface.co/LiquidAI/LFM2-350M
- Repositorio de código: https://github.com/DerrickKirimi/browser-control
- Guía de reproducción: https://github.com/DerrickKirimi/browser-control/blob/main/docs/reproducing.md
- Demo (Space): https://huggingface.co/spaces/Aptheos/browser-control-demo
