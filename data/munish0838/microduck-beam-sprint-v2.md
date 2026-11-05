# munish0838/microduck-beam-sprint-v2

## Resumen

`microduck-beam-sprint-v2` es una política de control para el robot cuadrúpedo de código abierto microduck de Pollen Robotics, entrenada mediante aprendizaje por refuerzo para ejecutar una marcha de sprint de 2 metros. El modelo no es un modelo de lenguaje: es un policy checkpoint en formato ONNX que se carga directamente en el daemon del robot y produce acciones motoras a partir de observaciones crudas del entorno. Fue generado por el autor `munish0838` con un pipeline automatizado (denominado "Beam", atribuido a Reflection AI) que selecciona hiperparámetros de recompensa leyendo la documentación del propio repositorio de retos de Pollen.

La política es perpetua: una vez cargada en un slot de política del robot, ejecuta la marcha de forma continua hasta que se le indique lo contrario. El espacio de observación es de 61 dimensiones y el de acciones de 14, operando a 50 Hz. El checkpoint corresponde a la iteración 999 de un entrenamiento de 1000 iteraciones con 4096 entornos paralelos y semilla 1.

El interés de esta ficha es limitado para el público general de IA, pero es relevante como ejemplo de pipeline de RL robótico reproducible y de generación automática de recetas de recompensa. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0.0 GB (lo que sugiere artefactos muy pequeños o metadatos sin pesos publicados).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de RL (red neuronal para control robótico); arquitectura interna no detallada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del policy manifest de microduck) |

## Arquitectura y entrenamiento

La política se entrenó con `mjlab-microduck 0.1.0` (commit `1efd853be`), sobre la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`, en la rama `beam/S1/r8` (commit `d2975dcbf`). El entrenamiento usó 4096 entornos paralelos, 1000 iteraciones y semilla 1, con registro en TensorBoard bajo el nombre `S1-r8`. La observación tiene 61 dimensiones y la acción 14 dimensiones, con frecuencia de control de 50 Hz. El normalizador de observaciones está embebido en `policy.onnx`, de modo que el robot puede alimentar observaciones crudas directamente.

La receta de recompensa fue seleccionada automáticamente por el sistema "Beam" (atribuido a Reflection AI), no por un operador humano, leyendo el fichero `AGENTS.md` del propio repositorio de retos de sprint de Pollen. Los componentes de la recompensa son: `forward_reward` 4.0, `upright_reward` 3.0, `step_reward` 5.0, curriculum de tasa de acción relajado a -0.4 y `heading_hold` con desviación estándar 0.2. Un operador humano ejecutó cada comando, pero no hubo ajuste manual de hiperparámetros. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: reentrenar con la misma semilla produce una política comparable, no los mismos pesos.

## Capacidades

- Ejecución de una marcha de sprint de 2 metros sobre el robot microduck.
- Política perpetua: se ejecuta de forma continua hasta que se descarga o se sustituye.
- Control a 50 Hz con observaciones crudas de 61 dimensiones y 14 acciones.
- Normalización de observaciones integrada en el artefacto ONNX.
- Carga mediante el comando `robotctl policy load <slot> munish0838/microduck-beam-sprint-v2`.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni visión: es una política motora, no un modelo generativo.

## Casos de uso

- Despliegue directo en robot microduck: cargar la política en un slot mediante `robotctl` y ejecutar la marcha de sprint en el hardware real, aprovechando que el normalizador está embebido en el ONNX.
- Benchmark de referencia para retos de sprint: usar el tiempo de 2.797–2.917 s como línea base reproducible al comparar nuevas políticas entrenadas sobre `Mjlab-Sprint2m-MicroDuck`.
- Estudio de generación automática de recompensas: analizar la receta seleccionada por Beam (pesos de `forward_reward`, `upright_reward`, `step_reward` y curriculum de tasa de acción) como caso de búsqueda automática de hiperparámetros en RL robótico.
- Reproducción de experimentos de RL: reentrenar con el comando documentado (`uv run train ... --env.scene.num-envs 4096 --agent.max-iterations 1000 --agent.seed 1`) para validar la variabilidad entre semillas y máquinas.
- Integración en pipelines de simulación a realidad: servir como política inicial en flujos de sim-to-real sobre microduck, dado que el artefacto es un ONNX autocontenido.
- Docencia y divulgación de RL aplicado a robótica: ejemplo mínimo de política perpetua con manifiesto versionado y comando de despliegue de una línea.

## Benchmarks y rendimiento

El autor reporta un tiempo de sprint de 2 metros de 2.797 s en la mejor ejecución de esta receta (semilla 1) y de 3.252 s al reentrenar con una segunda semilla. El resultado reproducible que el autor considera válido es de 2.797–2.917 s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

| Métrica | Valor reportado |
|---|---|
| Tiempo sprint 2 m (mejor ejecución, semilla 1) | 2.797 s |
| Tiempo sprint 2 m (reentrenamiento, segunda semilla) | 3.252 s |
| Rango reproducible declarado | 2.797–2.917 s |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0.0 GB, lo que sugiere un artefacto ONNX muy pequeño, pero no se publica el número de parámetros.
- GPU recomendadas: no disponibles para entrenamiento ni para inferencia; el entrenamiento se ejecutó con 4096 entornos paralelos, lo que en la práctica requiere aceleración por GPU, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: el artefacto se ejecuta mediante el daemon de microduck (`robotctl policy load`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms); no se publican cifras de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `microduck-beam-sprint-v2` | Política RL para microduck | no disponible | no aplica | 2.797–2.917 s en sprint 2 m | no disponible | HuggingFace (0 descargas) |
| Otras políticas del repo `microduck-challenges` | Políticas RL para microduck | no disponible | no aplica | no disponible en esta consulta | no disponible | Repositorio de Pollen Robotics |
| Políticas de referencia de microduck (baseline del reto) | Políticas RL para microduck | no disponible | no aplica | no disponible en esta consulta | no disponible | Repositorio de Pollen Robotics |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes o frameworks; la comparativa se limita a políticas del mismo ecosistema microduck, cuyos resultados no se han proporcionado.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no tiene capacidades de razonamiento, código ni matemáticas.
- El resultado es específico de la semilla 1; con otra semilla el tiempo empeora a 3.252 s, por lo que el rendimiento no es estable entre entrenamientos.
- El entrenamiento no es bit-reproducible entre máquinas; la reproducibilidad se limita a políticas comparables, no a pesos idénticos.
- La receta de recompensa fue generada automáticamente por Beam sin ajuste humano, lo que reduce la interpretabilidad de por qué funciona.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Idiomas no declarados, irrelevante para el caso de uso pero relevante para el filtrado de metadatos.
- Sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- El tamaño del repo es de 0.0 GB, lo que puede indicar que los pesos no están efectivamente publicados o que el artefacto es extremadamente pequeño; conviene verificar la integridad de `policy.onnx` antes de desplegar.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto porque no aplican a una política motora; el riesgo principal es de seguridad física en el robot si la política se ejecuta en entornos no previstos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/munish0838/microduck-beam-sprint-v2
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos microduck: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
- Commit de entrenamiento: `d2975dcbf` (rama `beam/S1/r8`)
- Base de entrenamiento: `mjlab-microduck 0.1.0 @ 1efd853be`
- Space enlazado por el autor: no disponible como URL directa en la información proporcionada
