# jrubiosainz/microduck-game-hillclimber

## Resumen

`jrubiosainz/microduck-game-hillclimber` es una política de control para el robot cuadrúpedo de código abierto Microduck, desarrollada por el autor independiente `jrubiosainz` como participación en el evento de subida de colina de 1,5 m de la Microduck Arena. Se trata de un fine-tune de la política de referencia `pollen-robotics/microduck-sprint-2m-reference`, entrenada adicionalmente con PPO (Proximal Policy Optimization) sobre el simulador de la propia Arena (MuJoCo 3.10.0, runner versión 4) y ejecutada exclusivamente en CPU.

El modelo resuelve una tarea muy concreta: recorrer el circuito de subida de 1,5 m en el menor tiempo posible, manteniéndose estable. La red mantiene la arquitectura de la referencia: un perceptrón multicapa de 61 entradas, tres capas ocultas de 512, 256 y 128 neuronas con activación ELU, y 14 salidas de acciones, a 50 Hz. El resultado reportado es de 0,956 s en los seeds oficiales y 200/200 finalizaciones sin caídas en los seeds 1-200.

Su relevancia es acotada pero clara: demuestra que es posible hacer fine-tuning de políticas de locomoción con recursos mínimos (sin GPU, sin datos nuevos, sin cómputo de pago) dentro del ecosistema de simulación de Pollen Robotics, y sirve como referencia reproducible para quienes experimentan con el entorno Microduck Arena. No está pensado para transferencia a un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) 61 → 512 → 256 → 128 → 14, activación ELU |
| Parametros totales | no disponible (pesos en `policy.onnx`, repo de 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, sin contexto textual) |
| Tipos de cuantizacion | no disponible (exportación ONNX estándar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (el repo base no declara licencia propia) |
| Formato de pesos | ONNX (`policy.onnx`), más `manifest.json` (esquema 2 de microduck policy manifest) |

## Arquitectura y entrenamiento

La política es una red neuronal densa con la misma forma que la referencia de Pollen Robotics: entrada de 61 dimensiones (observación del robot y del entorno), tres capas ocultas de 512, 256 y 128 unidades con activación ELU, y salida de 14 dimensiones (acciones de control). El normalizador de entrada de la referencia se mantiene congelado y queda integrado en el grafo ONNX. La frecuencia de control es de 50 Hz y el modelo incluye una normalización "horneada" (baked in), de modo que acepta observaciones en crudo.

El entrenamiento consistió en una cadena larga de iteraciones PPO ejecutadas en CPU dentro del runner y la física de la propia Arena: 375 iteraciones sobre sprint-2m (run r1), 3.075 iteraciones sobre hill-climb-1m5 (runs h1, h2 y h4), 350 iteraciones de nuevo sobre sprint-2m (run s2) y 7.250 iteraciones finales sobre hill-climb-1m5 (runs h5, h5b y hl1, este último con objetivo KL reducido a 0,01 y suelo de learning rate de 1e-6). En las últimas fases se usaron 96 copias paralelas del circuito, 64 pasos de control por iteración y la perturbación de inicio propia de la Arena. La función de recompensa combina progreso hacia delante mientras corre el cronómetro de carrera, penalizaciones pequeñas por velocidad lateral, tasa de giro, deriva hacia las paredes y caída, y un bonus único al cruzar la línea. Un detalle técnico destacable: el comando interno de velocidad (0,55 m/s hacia delante, cero lateral, cero giro, cabeza y cuerpo) se escribe dentro del grafo en las 13 ranuras de comando de la observación, por lo que la política ignora la orden de twist que recibe.

## Capacidades

- Locomoción bípeda/cuadrúpeda simulada: recorrer el circuito de subida de 1,5 m de la Microduck Arena a velocidad constante.
- Estabilidad: 200/200 finalizaciones sin caídas en los seeds 1-200, con peor tiempo de 1,02 s y p90 de 0,98 s.
- Robustez a ruido de observación: mantiene 20/20 finalizaciones con ruido gaussiano σ = 1e-4 y σ = 1e-3 sobre todas las observaciones.
- Ejecución en CPU: inferencia y entrenamiento sin GPU.
- Exportación ONNX con normalizador integrado, apta para el runner de la Arena.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No soporta modo "thinking", visión ni audio.
- Ignora el comando de twist: siempre avanza en línea recta a su propio ritmo y no se detiene por sí mismo.

## Casos de uso

- Participación en la Microduck Arena: el modelo se carga directamente en el runner de la Arena para competir en el evento de subida de 1,5 m, ya que cumple el formato ONNX y el manifiesto de política esperados.
- Referencia reproducible para fine-tuning con PPO: sirve como punto de partida documentado (cadena de runs, hiperparámetros, recompensa) para quienes quieran reentrenar políticas sobre el simulador de Pollen Robotics sin GPU.
- Evaluación de robustez en simulación: los experimentos con ruido gaussiano σ = 1e-4 y σ = 1e-3 permiten estudiar cómo afecta la precisión numérica de otra máquina a una marcha caótica, como paso previo a pruebas de portabilidad.
- Docencia e investigación en aprendizaje por refuerzo: el modelo y su historial de entrenamiento (runs, checkpoints, cambios de KL y learning rate) ofrecen un caso de estudio concreto de entrenamiento incremental y branching de checkpoints.
- Benchmarking de políticas de locomoción: al tener tiempos medidos en seeds oficiales y en 200 seeds, se puede usar como línea base frente a otras políticas presentadas a la Arena.
- Pruebas de integración del runner de la Arena: validar el pipeline `arena score --event hill-climb-1m5`, el barrido de velocidades comandadas y la carga de manifiestos de política.
- Prototipado de controladores de bajo coste: dado que todo el ciclo se ejecuta en CPU, es adecuado para entornos con recursos limitados donde no se dispone de aceleradores.

## Benchmarks y rendimiento

| Evaluación | Resultado | Finalizaciones |
|---|---|---|
| Seeds 1-5 (conjunto oficial) | 0,956 s (peor 0,96) | 5/5 |
| Seeds 1-200 | 0,962 s (p90 0,98, peor 1,02) | 200/200, 0 caídas |
| Seeds 1-5 con ruido σ = 1e-4, 4 ejecuciones por seed | 0,956–0,960 s | 20/20 |
| Seeds 1-5 con ruido σ = 1e-3, 4 ejecuciones por seed | 0,956–0,956 s | 20/20 |
| Barrido de 18 velocidades comandadas 0,15–1,00 m/s | 0,96 s en todas (comando ignorado) | — |

Los tiempos locales son indicativos: la máquina de la Arena puede diferir en algunas centésimas de segundo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia se ejecuta en CPU.
- GPU recomendadas: ninguna; el autor entrenó e infirió sin GPU.
- Cabe en cualquier CPU de consumo: la red es un MLP pequeño (61 → 512 → 256 → 128 → 14) exportado a ONNX.
- Opciones de despliegue: runner de la Microduck Arena (MuJoCo 3.10.0, runner versión 4) y ONNX Runtime; el manifiesto `manifest.json` sigue el esquema 2 de microduck policy manifest generado con el código `microduck_rl` de Pollen Robotics.
- Latencia y throughput: control a 50 Hz; no se han publicado cifras de latencia por inferencia.
- Almacenamiento: el repositorio ocupa 0.0 GB según Hugging Face, es decir, pesos de tamaño muy reducido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-game-hillclimber` | no disponible | no aplica | 0,956 s en seeds oficiales; 200/200 sin caídas | no disponible | Hugging Face |
| `pollen-robotics/microduck-sprint-2m-reference` | no disponible | no aplica | no disponible en la información proporcionada | no disponible | Hugging Face |
| Otras entradas de la Microduck Arena | no disponible | no aplica | no disponible | no disponible | Hugging Face Spaces |

La comparación se limita al modelo base, del que este es un fine-tune, y a las entradas de la Arena, cuyos datos no se han proporcionado. No se dispone de cifras de rendimiento comparables de otros participantes.

## Limitaciones y advertencias

- No apto para robot físico: la política solo se ha ejecutado en simulación y se entrenó sin ninguna aleatorización sim-to-real. El autor advierte explícitamente de que no se cargue en un Microduck real.
- Ignora el comando de twist: siempre corre en línea recta a su propio ritmo y nunca se detiene por sí misma, lo que impide usarla para control direccional o parada.
- Sin licencia declarada: el repositorio base no declara licencia propia y este fine-tune tampoco especifica una, por lo que el uso comercial queda en un limbo legal que conviene aclarar con el autor.
- Riesgo de sobreajuste al circuito: los resultados se miden en el curso concreto de la Arena y con su perturbación de inicio; no hay evidencia de generalización a otros terrenos.
- Sensibilidad numérica: la marcha es caótica y los tiempos pueden variar algunas centésimas según la máquina, aunque las pruebas con ruido sugieren cierta robustez.
- Sin capacidades de lenguaje, razonamiento, código ni multilingües: no debe evaluarse con benchmarks de NLP.
- Sesgos conocidos: no se han documentado sesgos en la información disponible, más allá del sesgo implícito hacia el circuito de entrenamiento.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-game-hillclimber
- Modelo base: https://huggingface.co/pollen-robotics/microduck-sprint-2m-reference
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Organización Pollen Robotics en Hugging Face: https://huggingface.co/pollen-robotics
