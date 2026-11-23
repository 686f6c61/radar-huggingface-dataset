# jrubiosainz/microduck-game-sprinter-ppo

## Resumen

`jrubiosainz/microduck-game-sprinter-ppo` es una política de control para robots, empaquetada en formato ONNX, que compite en la prueba de sprint de 2 metros de la Microduck Arena. Se trata de un ajuste fino (finetune) del modelo de referencia `pollen-robotics/microduck-sprint-2m-reference` de Pollen Robotics, reentrenado con PPO (Proximal Policy Optimization) íntegramente en CPU dentro del simulador propio de la Arena. No es un modelo de lenguaje: es una política de refuerzo que mapea observaciones de 61 dimensiones a acciones motoras de 14 dimensiones a 50 Hz.

El problema que resuelve es concreto y acotado: recorrer el circuito de sprint de 2 m lo más rápido posible sin caerse. Según la model card, logra 1,156 s en el conjunto oficial de semillas y completa 200 de 200 episodios sin caídas en las semillas 1-200. Es relevante como ejemplo de entrenamiento por refuerzo de bajo coste (sin GPU, sin datos nuevos, sin cómputo de pago) aplicado a robótica simulada.

La limitación principal es explícita: la política ignora la velocidad comandada (escribe un comando interno fijo de 0,55 m/s dentro del grafo) y solo ha sido entrenada y evaluada en simulación, sin ninguna aleatorización sim-to-real. No debe cargarse en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (perceptrón multicapa) 61 → 512 → 256 → 128 → 14, activación ELU |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB y no se publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje); observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (solo se distribuye `policy.onnx` en precisión original) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible (el modelo base declara no tener licencia propia) |
| Formato de pesos | ONNX (`policy.onnx`); incluye `manifest.json` con esquema 2 del manifiesto de políticas de microduck |
| Frecuencia de control | 50 Hz |
| Entradas / salidas | `obs` [1, 61] / `actions` [1, 14] |
| Normalizador de entrada | congelado, integrado en el grafo (observaciones en bruto) |

## Arquitectura y entrenamiento

La política mantiene la forma exacta de la red de referencia: un MLP de cuatro capas (61 → 512 → 256 → 128 → 14) con activación ELU, cuyo normalizador de entrada se mantiene congelado durante el ajuste. El entrenamiento se realizó con PPO en CPU, dentro del runner y la física del propio Arena (MuJoCo 3.10.0, versión 4 del runner), sobre el circuito del evento.

La cadena de entrenamiento documentada es larga y por etapas: 375 iteraciones PPO sobre sprint-2m (run r1), seguidas de 3075 iteraciones sobre hill-climb-1m5 repartidas en tres runs (h1, h2 y h4, con ramificaciones desde checkpoints intermedios), y finalmente 1750 iteraciones sobre sprint-2m (run s2). El checkpoint seleccionado es `it01750` del run s2. La función de recompensa combina progreso hacia delante mientras corre el cronómetro, penalizaciones pequeñas por velocidad lateral, velocidad de giro, deriva hacia las paredes y caída, y en los runs h4 y s2 un bonus único al cruzar la línea equivalente a correr a 1,5 m/s por cada paso restante antes del horizonte de 2,5 s. Se usaron 96 copias paralelas del circuito en el run s2 (192 en r1, 144 en h1, 96 en h2 y h4), con 64 pasos de control por iteración y la perturbación de arranque propia del Arena. El comando interno fijo (0,55 m/s de avance, velocidad lateral y de giro nulas) se escribe directamente en las 13 ranuras de comando de la observación dentro del grafo.

## Capacidades

- Control locomotor de sprint en simulación: recorre el circuito de 2 m en 1,156 s sobre las semillas oficiales.
- Robustez a ruido de observación: mantiene 20/20 finalizaciones con ruido gaussiano σ = 1e-04 y σ = 1e-03 aplicado a todas las observaciones.
- Estabilidad: 200/200 finalizaciones y 0 caídas en las semillas 1-200.
- Inferencia en CPU: el modelo se entrenó y se ejecuta sin GPU.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües.
- No tiene modo de razonamiento (thinking), visión ni audio.
- Ignora el comando de velocidad: la política siempre corre hacia delante a su propio ritmo y no se detiene por sí sola.

## Casos de uso

- Evaluación de políticas de RL en robótica simulada: sirve como referencia de rendimiento en la prueba de sprint de 2 m de la Microduck Arena, permitiendo comparar contra otras entradas con las mismas semillas y el mismo runner.
- Reproducción de experimentos de PPO en CPU: la cadena de entrenamiento documentada (r1, h1, h2, h4, s2) permite reproducir el proceso de ajuste fino sobre la referencia de Pollen Robotics sin necesidad de GPU.
- Pruebas de robustez frente a ruido de observación: las filas de ruido σ = 1e-04 y σ = 1e-03 permiten estudiar cómo una marcha caótica amplifica diferencias de redondeo en coma flotante entre máquinas.
- Validación de pipelines de publicación: el `manifest.json` con esquema 2 y las claves de procedencia `microduck_game_*` sirven para verificar el código de publicación `microduck_rl` de Pollen Robotics.
- Docencia y divulgación de RL aplicado: ejemplo completo y de bajo coste de ajuste fino con PPO, recompensas compuestas y selección de checkpoints.
- Integración en el runner del Arena: el archivo `policy.onnx` se puede cargar con `arena score --event sprint-2m` para puntuar la política en el barrido de velocidades comandadas.

## Benchmarks y rendimiento

| Evaluación (runner del Arena) | Puntuación | Media de finalizadores | Finalizados |
|---|---|---|---|
| Semillas 1-5 (conjunto oficial) | 1,156 s | 1,156 s (peor 1,16) | 5/5 |
| Semillas 1-200 | 1,157 s | 1,157 s (p90 1,18, peor 1,22) | 200/200, 0 caídas |
| Semillas 1-5 con ruido σ = 1e-04, 4 ejecuciones por semilla | 1,156-1,160 s (rango) | no disponible | 20/20 |
| Semillas 1-5 con ruido σ = 1e-03, 4 ejecuciones por semilla | 1,156-1,160 s (rango) | no disponible | 20/20 |

El barrido de 21 velocidades comandadas entre 0,20 y 1,20 m/s devuelve 1,16 s en todos los casos, ya que la política ignora el comando y el barrido reporta el valor más bajo. Los tiempos locales son indicativos: la máquina del Arena puede diferir en algunas centésimas de segundo.

## Requisitos de hardware

- Inferencia en CPU: el modelo se entrenó y se ejecuta sin GPU; el autor declara explícitamente "no GPU".
- VRAM estimada: no aplica (ejecución en CPU).
- GPU recomendadas: ninguna; no se requiere acelerador.
- Cabe en cualquier GPU de consumo: sí, pero es innecesaria.
- Opciones de despliegue: ONNX Runtime para cargar `policy.onnx`; el runner del Arena (`arena score --event sprint-2m`) con MuJoCo 3.10.0 y versión 4 del runner.
- Latencia y throughput: control a 50 Hz; no se publican cifras de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-game-sprinter-ppo` | no disponible (MLP 61 → 512 → 256 → 128 → 14) | obs. de 61 dimensiones, control a 50 Hz | 1,156 s en semillas 1-5; 200/200 sin caídas | no disponible | Hugging Face |
| `pollen-robotics/microduck-sprint-2m-reference` (base) | misma forma de red | obs. de 61 dimensiones | no disponible en la información proporcionada | sin licencia propia declarada | Hugging Face |
| Otras entradas de la Microduck Arena | no disponible | no disponible | no disponible | no disponible | Hugging Face Spaces |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Ignora el comando de velocidad: siempre corre hacia delante a su propio ritmo y nunca se detiene por sí sola; el comando de giro se ignora dentro del grafo.
- Solo simulación: no se ha entrenado con ninguna aleatorización sim-to-real; no debe cargarse en un Microduck físico.
- Sesgos conocidos: no se documentan sesgos de datos, pero la política está especializada exclusivamente en el circuito de sprint de 2 m y en la física del Arena.
- Riesgo de alucinación: no aplica (no es un modelo generativo de texto).
- Limitaciones de contexto o idioma: no aplica (política de control, sin capacidades lingüísticas).
- Restricciones de licencia: el repositorio no declara licencia y el modelo base tampoco declara una propia; el uso comercial queda sin definir y requiere consulta con el autor.
- Caveat de producción: los tiempos locales pueden diferir en algunas centésimas de segundo respecto a la máquina del Arena; la marcha es caótica y amplifica diferencias de redondeo en coma flotante entre máquinas.
- El repositorio ocupa 0.0 GB y no publica el recuento de parámetros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-game-sprinter-ppo
- Modelo base: https://huggingface.co/pollen-robotics/microduck-sprint-2m-reference
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Pollen Robotics en Hugging Face: https://huggingface.co/pollen-robotics
