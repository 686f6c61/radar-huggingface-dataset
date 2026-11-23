# nipuna02/snake-dqn

## Resumen

Snake DQN (10×10) es un conjunto de pesos de agente de aprendizaje por refuerzo para el juego de la serpiente en un tablero de 10×10, publicado por el usuario nipuna02 en Hugging Face. No es un modelo de lenguaje: se trata de un pequeño perceptrón multicapa (MLP) entrenado con Double DQN que mapea un vector de observación del estado del juego a tres acciones relativas (seguir recto, girar a la izquierda, girar a la derecha). Los pesos se distribuyen como `state_dict` de PyTorch para la clase `snake_rl.dqn.qnet(n_in, 256)`, cuya arquitectura es n_in → 256 → 256 → 3.

El repositorio incluye dos familias de agentes según la representación de observación: la variante «flood» (20 características, con relleno por inundación) y la variante «classic» (11 características). Según la model card, los agentes flood alcanzan una media de 51,9, 48,4 y 49,6 manzanas en 500 partidas de test, mientras que los classic se quedan en torno a 18,8-19,0. Como referencia, el autor reporta baselines de política voraz (18,3), voraz con flood fill (30,8) y aleatoria (0,2).

Su relevancia es acotada: es un artefacto de investigación y demostración para el proyecto `snake-rl`, útil como ejemplo reproducible de entrenamiento DQN y como entorno de juguete para experimentar con representaciones de estado. El tamaño del repositorio es de 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con capas 256 → 256 → 3, entrenado con Double DQN |
| Parámetros totales | no disponible (depende de n_in: 20 o 11 características de entrada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es un vector de observación fijo) |
| Tipos de cuantización | no disponible (pesos PyTorch en precisión original) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `state_dict` de PyTorch (`.pt`) |
| Librería | PyTorch |
| Pipeline | reinforcement-learning |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La red es un MLP de tres capas (entrada → 256 → 256 → 3) que recibe un vector de características del estado del juego y produce tres valores Q correspondientes a acciones relativas: seguir recto, girar a la izquierda y girar a la derecha. El algoritmo de entrenamiento es Double DQN, una variante de Deep Q-Learning que desacopla la selección y la evaluación de la acción objetivo para reducir el sobreestimación de los valores Q. No se dispone de información sobre el número de pasos de entrenamiento, la composición del buffer de experiencia, la tasa de exploración ni hiperparámetros concretos.

La innovación destacable está en la representación del estado. La variante «flood» emplea 20 características que incorporan información de relleno por inundación (flood fill), lo que permite al agente estimar el espacio libre accesible y evitar encerrarse; la variante «classic» usa 11 características más simples. Esta diferencia se traduce en una mejora sustancial del rendimiento: de ~19 manzanas de media con la representación clásica a ~50 con la representación flood. El autor publica tres semillas por variante (`dqn_flood_seed{0,1,2}.pt` y `dqn_classic_seed{0,1,2}.pt`), lo que permite evaluar la varianza entre ejecuciones.

## Capacidades

- Jugar al juego de la serpiente en tableros de 10×10 con política greedy sobre los valores Q aprendidos.
- Selección de acciones relativas (recto, izquierda, derecha) a partir de un vector de observación del estado.
- Dos representaciones de estado intercambiables: flood (20 características) y classic (11 características).
- Evaluación reproducible mediante `snake_rl.evaluate.play` y `summary`, con métricas de manzanas comidas por partida.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el par de variantes flood/classic permite ilustrar cómo la ingeniería de características altera el rendimiento de un mismo algoritmo DQN, con métricas concretas (51,9 frente a 18,9 manzanas de media).
- Reproducción de experimentos: los tres pesos por variante (`seed0`, `seed1`, `seed2`) permiten estudiar la varianza entre semillas y validar la estabilidad del entrenamiento.
- Baseline para nuevos agentes: los resultados reportados (voraz 18,3; voraz con flood fill 30,8; aleatorio 0,2) sirven como referencia para comparar políticas propias en el mismo entorno 10×10.
- Pruebas de infraestructura de RL: al ser un MLP pequeño en formato `state_dict`, se puede cargar y ejecutar en CPU en milisegundos, lo que lo hace adecuado para tests de integración de pipelines de evaluación.
- Investigación sobre representaciones de estado: la comparación entre 11 y 20 características ofrece un caso controlado para medir el impacto del flood fill en la planificación implícita del agente.
- Demostraciones educativas: el código de ejemplo de la model card permite mostrar en pocas líneas la carga de pesos, la política y la evaluación en 500 partidas.

## Benchmarks y rendimiento

Resultados reportados en la model card (media de manzanas en 500 partidas de test, tablero 10×10):

| Agente / política | Observación | Media de manzanas | Mejor partida |
|---|---|---|---|
| `dqn_flood_seed0.pt` | flood (20 características) | 51,9 | 97 (tablero completo) |
| `dqn_flood_seed1.pt` | flood (20 características) | 48,4 | no disponible |
| `dqn_flood_seed2.pt` | flood (20 características) | 49,6 | no disponible |
| `dqn_classic_seed0.pt` | classic (11 características) | 18,9 | no disponible |
| `dqn_classic_seed1.pt` | classic (11 características) | 18,8 | no disponible |
| `dqn_classic_seed2.pt` | classic (11 características) | 19,0 | no disponible |
| Baseline voraz | — | 18,3 | no disponible |
| Baseline voraz + flood fill | — | 30,8 | no disponible |
| Baseline aleatoria | — | 0,2 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: despreciable; el MLP es de tamaño mínimo y cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Una RTX 4090 o A100 no aportan ventaja frente a CPU para este tamaño de red.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), y también en CPU.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load` y `load_state_dict`); no aplican vLLM, llama.cpp, Ollama ni TGI al no ser un modelo generativo de lenguaje.
- Latencia y throughput: no disponibles de forma explícita; por el tamaño de la red (dos capas ocultas de 256 unidades) la inferencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Observación | Rendimiento reportado | Licencia |
|---|---|---|---|---|---|
| Snake DQN (este) | Snake 10×10 | MLP 256→256→3, Double DQN | flood (20) / classic (11) | 51,9 / 18,9 manzanas | MIT |
| Baseline voraz + flood fill | Snake 10×10 | Política heurística | flood | 30,8 manzanas | no disponible |
| Baseline voraz | Snake 10×10 | Política heurística | clásica | 18,3 manzanas | no disponible |
| Baseline aleatoria | Snake 10×10 | Política aleatoria | — | 0,2 manzanas | no disponible |

No se dispone de información sobre otros modelos DQN publicados para Snake 10×10 con los que comparar parámetros, contexto o disponibilidad; los únicos puntos de comparación son los baselines heurísticos reportados por el propio autor.

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve Snake en tableros de 10×10; no generaliza a otros tamaños de tablero ni a otros juegos sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades multilingües ni de razonamiento general.
- Varianza entre semillas: la variante flood oscila entre 48,4 y 51,9 manzanas de media, por lo que conviene evaluar con varias semillas antes de extraer conclusiones.
- La variante classic rinde al nivel del baseline voraz (18,9 frente a 18,3), lo que sugiere que sin la representación flood el agente apenas supera una heurística simple.
- Riesgo de sobreajuste al entorno de entrenamiento: no hay información sobre la diversidad de estados visitados ni sobre pruebas fuera de distribución.
- Sin datos de sesgo ni de alucinación aplicables, al no ser un modelo generativo; el riesgo principal es la fragilidad de la política ante configuraciones distintas de las de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright y atribución al autor original.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nipuna02/snake-dqn
- Repositorio del proyecto: https://github.com/Nipuna-Lakruwan/snake-rl
