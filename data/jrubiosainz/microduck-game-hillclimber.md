# jrubiosainz/microduck-game-hillclimber

## Resumen

Microduck Game Hill Climber es una política de control para el robot cuadrúpedo de bajo coste Microduck, desarrollado por Pollen Robotics. Se trata de un fine-tune de la política de referencia `pollen-robotics/microduck-sprint-2m-reference`, reentrenada mediante PPO (Proximal Policy Optimization) en CPU para superar el circuito de subida de 1,5 m de la Microduck Arena, un entorno de competición basado en el simulador MuJoCo 3.10.0.

El modelo resuelve un problema muy concreto: completar el circuito de hill climb de la Arena en el menor tiempo posible, con estabilidad garantizada. Según la model card, alcanza 0,976 s en los seeds oficiales (1-5) y 0,980 s de media en los seeds 1-200, con 200/200 finalizaciones y 0 caídas. Es relevante ahora como ejemplo de entrenamiento de refuerzo reproducible en hardware modesto (sin GPU, sin datos nuevos, sin cómputo de pago) dentro de un ecosistema de robótica open source como el de Pollen Robotics.

La red mantiene la forma de la referencia: 61 entradas → 512 → 256 → 128 → 14 salidas, con activación ELU y normalizador de entrada congelado. La política ignora la velocidad comandada (twist) y está diseñada exclusivamente para simulación, sin randomización sim-to-real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con activación ELU; forma 61 → 512 → 256 → 128 → 14 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX en precisión original) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible (el repo base no declara licencia propia) |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 de microduck policy manifest) |

## Arquitectura y entrenamiento

La política es una red neuronal densa con la misma topología que la referencia de Pollen Robotics: 61 observaciones de entrada, tres capas ocultas de 512, 256 y 128 neuronas con activación ELU, y 14 acciones de salida. El normalizador de entrada se mantiene congelado respecto al modelo base. La inferencia se ejecuta a 50 Hz y el grafo ONNX incluye el normalizador integrado, de modo que acepta observaciones en crudo. Un detalle técnico relevante: los 13 slots de comando de la observación se reescriben dentro del grafo con un comando interno fijo (velocidad frontal 0,55 m/s, velocidad lateral cero, yaw rate, cabeza y cuerpo), por lo que la política ignora el twist comandado externamente.

El entrenamiento consistió en una cadena de runs PPO ejecutados íntegramente en CPU dentro del runner y la física del propio Arena (MuJoCo 3.10.0, runner versión 4). La secuencia fue: 375 iteraciones PPO sobre sprint-2m (run r1), seguidas de 3075 iteraciones sobre hill-climb-1m5 (runs h1, h2 y h4 con ramificaciones desde checkpoints intermedios), 350 iteraciones adicionales sobre sprint-2m (run s2) y finalmente 5125 iteraciones sobre hill-climb-1m5 (runs h5 y h5b, este último reanudado tras un reinicio de máquina con nueva semilla aleatoria). Se usaron 96 a 192 copias paralelas del circuito por iteración, 64 pasos de control por iteración, y la perturbación de arranque propia del Arena. La función de recompensa combina progreso frontal mientras corre el reloj de carrera, penalizaciones pequeñas por velocidad lateral, yaw rate, deriva hacia las paredes y caídas, más un bonus único por cruzar la línea equivalente a correr a 1,5 m/s por cada paso restante antes del horizonte de 2,5 s. El checkpoint seleccionado fue `it05125` del run h5b.

## Capacidades

- Control locomotor de un robot cuadrúpedo Microduck en simulación: marcha frontal estable a una velocidad interna fija de 0,55 m/s.
- Superación de circuitos con cambios de pendiente (plano, subida, plano, subida) en el evento hill-climb-1m5 del Arena.
- Finalización fiable de la carrera: 200/200 finalizaciones y 0 caídas en los seeds 1-200.
- Robustez limitada a ruido de observación: completa 20/20 con ruido gaussiano σ = 1e-04 y σ = 1e-03.
- Inferencia determinista y ligera: un único input `obs` [1, 61] y un único output `actions` [1, 14] a 50 Hz.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües (no es un modelo de lenguaje).
- No soporta modo thinking, visión ni audio.
- Ignora deliberadamente el comando de velocidad: todas las velocidades del barrido (0,15–1,00 m/s) producen el mismo tiempo.

## Casos de uso

- Participación en la Microduck Arena: el modelo está pensado como entrada para el evento hill-climb-1m5 de la Arena, donde se evalúa contra otros participantes con los seeds oficiales y el runner del propio entorno.
- Benchmark de referencia para RL en robótica de bajo coste: sirve como línea base reproducible para comparar estrategias de entrenamiento PPO en CPU, dado que documenta la cadena completa de runs, iteraciones y checkpoints.
- Estudio de transferencia entre tareas: la cadena de entrenamiento alterna sprint-2m y hill-climb-1m5, lo que permite analizar cómo el fine-tuning sobre una tarea afecta al rendimiento en otra y cómo se recupera mediante runs intermedios.
- Investigación sobre robustez a ruido de observación: las filas de ruido σ = 1e-04 y σ = 1e-03 documentan el comportamiento bajo perturbaciones, útil para estudiar la sensibilidad de políticas chaotic gait a diferencias de redondeo entre máquinas.
- Validación de pipelines de publicación: el repo incluye `manifest.json` con schema 2 generado con el código `microduck_rl` de Pollen, por lo que puede usarse para probar flujos de empaquetado y despliegue de políticas ONNX en el ecosistema Microduck.
- Docencia y divulgación de RL: al no requerir GPU ni datos nuevos, es un caso práctico asequible para explicar PPO, función de recompensa, selección de checkpoints y evaluación con seeds en un entorno de simulación físico.
- Pruebas de integración del runner del Arena: el modelo permite verificar el funcionamiento de `arena score --event hill-climb-1m5` y del runner versión 4 con MuJoCo 3.10.0 en distintas máquinas.

## Benchmarks y rendimiento

| Evaluación (runner del Arena) | Puntuación | Finalizaciones |
|---|---|---|
| Seeds 1-5 (set oficial) | 0,976 s (peor 0,98 s) | 5/5 |
| Seeds 1-200 | 0,980 s (p90 1,00 s, peor 1,04 s) | 200/200, 0 caídas |
| Seeds 1-5 con ruido σ = 1e-04, 4 runs por seed | 0,976–0,984 s (rango) | 20/20 |
| Seeds 1-5 con ruido σ = 1e-03, 4 runs por seed | 0,968–0,976 s (rango) | 20/20 |

El barrido de `arena score --event hill-climb-1m5` con 18 velocidades comandadas entre 0,15 y 1,00 m/s devuelve 0,98 s en todos los casos, coherente con que la política ignora el comando. El resultado reportado por el barrido es 0,976 s con 5/5 finalizaciones, puntuado a 0,15 m/s. Los tiempos locales son indicativos y pueden diferir en unas centésimas en la máquina del Arena. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es una MLP pequeña exportada a ONNX y el autor indica que el entrenamiento se hizo en CPU, sin GPU.
- GPU recomendadas: no aplica; no se requiere GPU para la inferencia según la información disponible.
- ¿Cabe en consumer GPU? Sí, con toda probabilidad, dado el tamaño reducido de la red (61 → 512 → 256 → 128 → 14) y el formato ONNX, aunque no se proporcionan cifras de VRAM.
- Opciones de despliegue: ONNX Runtime (formato nativo `policy.onnx`), integración con el runner del Arena y el ecosistema `microduck_rl` de Pollen Robotics; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: inferencia a 50 Hz según la model card; no se proporcionan cifras de latencia por inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Entrenamiento | Rendimiento en hill-climb-1m5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-game-hillclimber | MLP ONNX (fine-tune) | PPO en CPU sobre base sprint-2m | 0,976 s (seeds 1-5), 200/200 en seeds 1-200 | no disponible | Hugging Face |
| pollen-robotics/microduck-sprint-2m-reference | MLP ONNX (referencia) | Entrenamiento original de Pollen | no disponible en la información proporcionada | no disponible (el repo base no declara licencia propia) | Hugging Face |
| Otras entradas de la Microduck Arena | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de la referencia sprint-2m ni de otras entradas de la Arena en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No apto para robot real: la política solo ha corrido en simulación y se entrenó sin randomización sim-to-real. El autor advierte explícitamente de que no debe cargarse en un Microduck físico.
- Ignora el comando de velocidad: siempre corre hacia adelante a su propio ritmo y nunca se detiene por sí sola; el twist comandado no tiene efecto.
- Sensibilidad a diferencias numéricas: la marcha es caótica y amplifica diferencias de redondeo entre máquinas; los tiempos pueden variar unas centésimas en el hardware del Arena.
- Robustez a ruido limitada a los niveles probados (σ = 1e-04 y σ = 1e-03); no se documenta comportamiento con perturbaciones mayores.
- Licencia no disponible: ni el modelo ni el repo base declaran licencia, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- Sesgos conocidos: no se documentan sesgos en la información disponible, aunque al ser una política de control no aplican los sesgos típicos de modelos de lenguaje.
- Riesgo de alucinación: no aplica (no es un modelo generativo de texto); el riesgo equivalente es la degradación del rendimiento fuera de las condiciones de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje.
- Restricciones de licencia para uso comercial: no especificadas; conviene contactar con Pollen Robotics o el autor antes de cualquier uso comercial.
- Dependencia del entorno: el rendimiento está ligado al runner versión 4 y a MuJoCo 3.10.0 del Arena; cambios en el simulador o en la física pueden alterar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-game-hillclimber
- Modelo base: https://huggingface.co/pollen-robotics/microduck-sprint-2m-reference
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Pollen Robotics en Hugging Face: https://huggingface.co/pollen-robotics
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
