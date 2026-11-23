# jrubiosainz/microduck-game-roller-ppo

## Resumen

Microduck Game Roller (PPO) es una política de control para robótica entrenada mediante aprendizaje por refuerzo, publicada por el usuario jrubiosainz en Hugging Face. Se trata de un fine-tune de la política de referencia `pollen-robotics/microduck-roller-sprint-2m-reference` de Pollen Robotics, especializada en la prueba de sprint de 2 metros sobre patines de la Microduck Arena. El modelo parte de la red original de Pollen y la reentrena con PPO (Proximal Policy Optimization) ejecutado íntegramente en CPU, dentro del propio simulador de la Arena (MuJoCo 3.10.0, runner versión 4).

La red conserva la forma de la referencia: una MLP con entrada de 61 dimensiones, capas ocultas de 512, 256 y 128 neuronas con activación ELU, y salida de 14 dimensiones, operando a 50 Hz. El modelo se exporta como un único archivo ONNX (`policy.onnx`) con el normalizador de observaciones integrado en el grafo, de modo que consume observaciones en crudo. Su relevancia es acotada pero clara: demuestra que es posible obtener un rendimiento competitivo en una competición de robótica simulada con recursos de cómputo mínimos (sin GPU, sin datos nuevos, sin cómputo de pago).

El resultado declarado es de 1,888 s en los semillas oficiales (1–5) y 200/200 llegadas sin caídas en las semillas 1–200. Una advertencia central del propio autor: la política ignora la velocidad comandada, siempre avanza en línea recta a su propio ritmo y solo ha sido entrenada en simulación sin aleatorización sim-to-real, por lo que no debe cargarse en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con activación ELU; entrada 61 → 512 → 256 → 128 → 14 |
| Parametros totales | no disponible (pesos en `policy.onnx`, repo de 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación directa a ONNX, sin cuantización declarada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (el repo base tampoco declara licencia propia según el autor) |
| Formato de pesos | ONNX (`policy.onnx`, entrada `obs` [1, 61], salida `actions` [1, 14], 50 Hz) + `manifest.json` (schema 2) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal feedforward (MLP) que replica exactamente la forma de la política de referencia de Pollen Robotics, con normalizador de observaciones congelado. La entrada son 61 valores de observación y la salida son 14 acciones de control a 50 Hz. El entrenamiento se realizó en dos fases encadenadas sobre la política de referencia: una primera ejecución (ro1) de 875 iteraciones PPO sobre el circuito roller-sprint-2m, cuyas primeras 15 iteraciones entrenaron solo un crítico nuevo; y una segunda ejecución (ro2) de 1750 iteraciones PPO en la que el actor resultante se emparejó con un crítico nuevo, que entrenó en solitario durante las primeras 25 iteraciones.

La función de recompensa premia el progreso hacia delante mientras corre el reloj de carrera, con penalizaciones pequeñas por velocidad lateral, tasa de guiñada, deriva hacia las paredes y caída. En la ejecución ro2, el episodio termina cuando el pato cruza la línea de meta, con una bonificación única equivalente a la recompensa de correr a 1,5 m/s por cada paso restante antes del horizonte de 3,7 s. Se usaron 96 copias paralelas del circuito con 64 pasos de control por iteración y la perturbación de arranque propia de la Arena. Un detalle técnico clave: el modelo escribe un comando interno fijo (velocidad frontal 1,1 m/s, velocidad lateral, tasa de guiñada, cabeza y cuerpo a cero) en las 13 ranuras de comando de la observación dentro del propio grafo, de modo que la velocidad comandada externamente se ignora. Todo el entrenamiento se ejecutó en CPU, sin GPU, sin datos nuevos y sin cómputo de pago.

## Capacidades

- Control de locomoción sobre patines en simulación: la política genera 14 acciones de control a 50 Hz para el robot Microduck en el circuito roller-sprint-2m.
- Sprint de 2 metros: completa el recorrido en aproximadamente 1,88 s de forma consistente.
- Robustez a ruido de observación: mantiene el rendimiento con ruido gaussiano de σ = 1e-04 y σ = 1e-03 en todas las observaciones (20/20 llegadas en cada caso).
- Estabilidad: 200/200 llegadas y 0 caídas en las semillas 1–200.
- Inferencia en CPU: el modelo ONNX está pensado para ejecutarse sin acelerador hardware.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No responde a comandos de velocidad: el twist comandado se sobrescribe dentro del grafo.

## Casos de uso

- Participación en la Microduck Arena: el modelo está diseñado como entrada para el evento roller-sprint-2m de la competición simulada de Pollen Robotics; se carga en el runner de la Arena y se evalúa sobre las semillas oficiales.
- Referencia para experimentos de RL en robótica: sirve como punto de partida para estudiar cómo un fine-tune PPO en CPU sobre una política de referencia puede mejorar tiempos de carrera sin datos adicionales.
- Benchmark de robustez a ruido: sus filas de evaluación con σ = 1e-04 y 1e-03 permiten comparar la sensibilidad de distintas políticas a perturbaciones en las observaciones, como sustituto de diferencias de redondeo entre máquinas.
- Docencia y divulgación de aprendizaje por refuerzo: al ser un modelo pequeño con entrenamiento reproducible en CPU, es adecuado para demostrar el ciclo completo de PPO (actor, crítico, recompensa, selección de checkpoint) en un entorno de simulación física.
- Estudio de transferencia de políticas: permite analizar la brecha entre políticas entrenadas sin aleatorización sim-to-real y su viabilidad teórica en hardware, documentando explícitamente por qué no debe desplegarse en un robot físico.
- Evaluación comparativa de checkpoints: el modelo documenta la cadena completa de entrenamiento (ro1 → ro2 → checkpoint it01750), lo que facilita reproducir y comparar selecciones de checkpoint en experimentos similares.

## Benchmarks y rendimiento

| Evaluación (runner de la Arena) | Puntuación (no finalizar = 40 s) | Media de finalizadores | Finalizados |
|---|---|---|---|
| Semillas 1–5 (conjunto oficial) | 1,888 s | 1,888 s (peor 1,90) | 5/5 |
| Semillas 1–200 | 1,883 s | 1,883 s (p90 1,92, peor 1,98) | 200/200, 0 caídas |
| Semillas 1–5 con ruido σ = 1e-04, 4 ejecuciones por semilla | 1,872–1,896 s (rango) | — | 20/20 |
| Semillas 1–5 con ruido σ = 1e-03, 4 ejecuciones por semilla | 1,860–1,896 s (rango) | — | 20/20 |

El barrido de `arena score --event roller-sprint-2m` sobre 18 velocidades comandadas (0,30–2,00 m/s) devuelve 1,88 s en todos los casos, confirmando que el comando se ignora; el sistema puntúa a 0,30 m/s y reporta: semilla 1 → 1,88 s, semilla 2 → 1,90 s, semilla 3 → 1,90 s, semilla 4 → 1,88 s, semilla 5 → 1,88 s, con puntuación 1,888 s y 5/5 finalizados. Los tiempos locales son indicativos y pueden diferir en centésimas en la máquina de la Arena.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el modelo es una MLP exportada a ONNX y se ejecuta en CPU. No se declara un requisito de VRAM concreto.
- GPU recomendadas: no se requiere GPU; el entrenamiento y la inferencia documentados se realizaron en CPU.
- Cabe en cualquier GPU consumer e incluso en CPU sin acelerador; no hay indicación de que se necesite CUDA.
- Opciones de despliegue: ONNX Runtime (formato nativo `policy.onnx`), y el runner propio de la Microduck Arena (`arena score --event roller-sprint-2m`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el modelo opera a 50 Hz (paso de control de 20 ms); no se publican cifras de latencia ni throughput adicionales.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jrubiosainz/microduck-game-roller-ppo | MLP + PPO (fine-tune) | no disponible | no aplica | 1,888 s (semillas 1–5), 200/200 llegadas | no disponible | Hugging Face (25 descargas) |
| pollen-robotics/microduck-roller-sprint-2m-reference | MLP (referencia base) | no disponible | no aplica | no disponible en la información proporcionada | no disponible (el autor indica que el repo base no declara licencia propia) | Hugging Face (Pollen Robotics) |
| Otras entradas de la Microduck Arena | Políticas de RL para robótica simulada | no disponible | no aplica | no disponible | no disponible | Hugging Face Spaces (microduck-arena) |

No se dispone de datos de benchmarks de la política de referencia ni de otras entradas de la Arena en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Ignora el comando de velocidad: el twist comandado se sobrescribe con un comando interno fijo (1,1 m/s frontal) dentro del grafo; no se puede dirigir ni detener.
- Solo simulación: entrenada exclusivamente en el simulador de la Arena, sin aleatorización sim-to-real; el autor advierte explícitamente de que no debe cargarse en un robot Microduck físico.
- Sesgos conocidos: no se documentan sesgos de datos en el sentido habitual (no es un modelo de lenguaje); el sesgo operativo es la rigidez de comportamiento (siempre avanza en línea recta).
- Riesgo de alucinación: no aplica como modelo generativo de texto; el riesgo equivalente es la fragilidad ante condiciones no vistas, mitigada parcialmente por las pruebas con ruido de observación.
- Limitaciones de contexto o idioma: no aplica (política de control, no modelo lingüístico).
- Restricciones de licencia: la licencia no está disponible; el repo base tampoco declara licencia propia según el autor, lo que genera incertidumbre sobre el uso comercial.
- Caveat para producción: los tiempos locales son indicativos y pueden variar en centésimas según la máquina; la selección del checkpoint `it01750` se hizo sobre un conjunto de semillas concreto, lo que puede implicar sobreajuste a esas condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-game-roller-ppo
- Modelo base: https://huggingface.co/pollen-robotics/microduck-roller-sprint-2m-reference
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Pollen Robotics en Hugging Face: https://huggingface.co/pollen-robotics
