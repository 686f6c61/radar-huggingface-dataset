# heyskylark/microduck-heist-headfree

## Resumen

`microduck-heist-headfree` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto MicroDuck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje ni un transformer generativo: es una política neuronal que produce comandos de actuación a 50 Hz a partir de observaciones de 61 dimensiones, con 14 acciones de salida. Lo publica el usuario `heyskylark` en HuggingFace bajo el pipeline `robotics` y la librería `microduck`.

El artefacto principal es un fichero `policy.onnx` que incluye el normalizador de observaciones embebido, de modo que el consumidor puede alimentar observaciones en crudo sin preprocesado adicional. Se acompaña de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de MicroDuck. La política se describe como "perpetua": ejecuta una marcha de forma continua hasta que se le indique lo contrario, y se carga en una ranura de política del demonio `robotctl` del robot.

La relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento y despliegue de políticas de locomoción para un robot cuadrúpedo de bajo coste, con un pipeline reproducible (mjlab + MuJoCo, 4096 entornos paralelos, 5000 iteraciones, semilla 2). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y ocupa 0.0 GB, lo que sugiere un artefacto muy pequeño (coherente con una MLP de política).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (red de política entrenada con RL; topología exacta no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje; ventana de observación de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (exportación a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica; sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de MicroDuck) |

## Arquitectura y entrenamiento

La política se entrena con el framework `mjlab` (versión base `mjlab-microduck 0.1.0 @ 1efd853be`), que combina simulación física con MuJoCo y entrenamiento RL masivo en paralelo. El entrenamiento usa 4096 entornos simultáneos, hasta 5000 iteraciones del agente, semilla 2 y registro en TensorBoard. La tarea se identifica como `Mjlab-SockHeist6m-MicroDuck`, es decir, una tarea de locomoción ("sock heist") con horizonte de episodio de 6 millones de pasos de simulación. El checkpoint publicado es el 4700.

La política opera a 50 Hz con 61 dimensiones de observación y 14 acciones, lo que encaja con un cuadrúpedo de 12 articulaciones más un par de acciones auxiliares o de torso (la asignación exacta no está documentada en la información disponible). El normalizador de observaciones está integrado en el grafo ONNX, una decisión de ingeniería que elimina una fuente habitual de errores de integración al desplegar en el robot. No se documenta la topología interna de la red (número de capas, anchura, activaciones), ni el algoritmo RL concreto (PPO u otro), ni la composición del dataset de entrenamiento más allá de la simulación. El autor advierte explícitamente de que el entrenamiento no es bit-reproducible entre máquinas: misma semilla y mismo comando producen una política "comparable", no idéntica.

## Capacidades

- Locomoción continua ("perpetua") del robot MicroDuck: ejecuta una marcha hasta recibir una orden de parada o reemplazo de política.
- Control reactivo a partir de observaciones proprioceptivas de 61 dimensiones a 50 Hz.
- Salida de 14 acciones de control motor.
- Integración con el demonio `robotctl` mediante carga en una ranura de política (`robotctl policy load <slot> ...`).
- Inferencia vía ONNX Runtime, con normalizador de observaciones embebido (acepta observaciones en crudo).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modos de pensamiento: no es un modelo generativo.

## Casos de uso

- **Demostración de locomoción en MicroDuck**: cargar la política en una ranura del robot y ejecutar una marcha continua para validar el hardware y el firmware del cuadrúpedo en laboratorio o aula.
- **Punto de partida para fine-tuning de tareas**: usar el checkpoint 4700 como inicialización para entrenar variantes de la tarea `SockHeist` con recompensas o terrenos distintos, reutilizando el pipeline `mjlab` documentado.
- **Pruebas de integración del stack `robotctl`**: verificar el flujo de carga de políticas, el esquema 2 del manifiesto y la inferencia ONNX en el robot antes de desplegar políticas propias.
- **Investigación en RL sim-a-real**: emplear la política como referencia de comportamiento entrenado en simulación (4096 entornos) para estudiar la brecha sim-a-real en un cuadrúpedo de bajo coste.
- **Docencia y talleres de robótica**: ejemplo reproducible de extremo a extremo (clonar repo, `uv sync`, entrenar, exportar a ONNX, desplegar) para cursos de aprendizaje por refuerzo aplicado.
- **Benchmark interno de políticas de marcha**: comparar esta política "headfree" con otras políticas publicadas para MicroDuck en métricas de estabilidad, velocidad y consumo, usando el mismo robot y el mismo demonio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad de marcha, estabilidad ni tasas de éxito sim-a-real.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; el repositorio ocupa 0.0 GB y el artefacto es un `policy.onnx`, por lo que se espera un modelo de pocos megabytes compatible con inferencia en CPU.
- **GPU recomendadas**: no se requiere GPU para inferencia; el cómputo cabe holgadamente en cualquier CPU moderna del propio robot o de un equipo de escritorio.
- **Consumer GPU**: sí, en cualquier GPU de consumo (o incluso sin GPU), dado el tamaño reducido del artefacto y la frecuencia de control de 50 Hz.
- **Opciones de despliegue**: ONNX Runtime (formato nativo del artefacto) y el demonio `robotctl` del stack MicroDuck; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles; el requisito funcional es sostener 50 Hz de bucle de control, holgadamente alcanzable con una política ONNX pequeña.

## Comparativa con modelos similares

| Modelo | Tipo | Robot | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `heyskylark/microduck-heist-headfree` | Política RL de locomoción | MicroDuck | ONNX + manifest | no disponible | HuggingFace (0 descargas) |
| Otras políticas de MicroDuck en HuggingFace | Políticas RL de locomoción | MicroDuck | no disponible | no disponible | no disponible |
| Políticas de locomotion para cuadrúpedos comerciales (p. ej. Unitree, ANYmal) | Políticas RL propietarias o de investigación | Plataformas comerciales | no disponible | habitualmente restrictiva | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a tipo de artefacto, plataforma y disponibilidad.

## Limitaciones y advertencias

- **Licencia no especificada**: no se declara licencia, lo que impide determinar si el uso comercial está permitido. Tratar como no apto para producción comercial hasta aclararlo con el autor.
- **Sin métricas publicadas**: no hay benchmarks, curvas de recompensa ni evaluación sim-a-real; el rendimiento real en el robot es desconocido.
- **No reproducible bit a bit**: el propio autor advierte que reentrenar con la misma semilla produce pesos distintos; no es posible auditar exactamente el artefacto a partir del comando de entrenamiento.
- **Especialización estrecha**: la política solo ejecuta la tarea `SockHeist6m`; no generaliza a otras tareas, terrenos o morfologías sin reentrenamiento.
- **Dependencia de hardware y firmware**: requiere el robot MicroDuck y el demonio `robotctl` con soporte del esquema 2 del manifiesto; no es portable a otras plataformas sin adaptación.
- **Riesgo en operación física**: una política de locomoción sin evaluación publicada puede provocar caídas o comportamientos erráticos; usar con supervisión y parada de emergencia.
- **Sin soporte lingüístico ni generativo**: no debe evaluarse con criterios de MMLU, HumanEval o GSM8K; esas métricas no aplican.
- **Madurez del ecosistema**: 0 descargas y 0 likes; sin evidencia de uso por terceros ni mantenimiento continuado.

## Enlaces

- HuggingFace: https://huggingface.co/heyskylark/microduck-heist-headfree
- Repositorio del robot MicroDuck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `git@github.com:heyskylark/microduck-challenges.git` (commit `eda395bf9`, rama `main`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (no se proporciona URL directa)
