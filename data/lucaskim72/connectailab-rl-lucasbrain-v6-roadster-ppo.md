# lucaskim72/connectailab-rl-lucasbrain-v6-roadster-ppo

## Resumen

`connectailab-rl-lucasbrain-v6-roadster-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con PPO para una tarea de control continuo: aterrizar un vehículo tipo roadster invertido en un simulador 2D. Lo desarrolla Lucas Kim (usuario `lucaskim72`) en el marco del curso experimental CONNECT AI LAB × AI CITY BUILDERS, y forma parte de una serie de doce versiones (v1–v12) que documentan la influencia de hiperparámetros sobre la tasa de aterrizaje.

No es un modelo de lenguaje ni un transformer: es una política neuronal pequeña, un MLP de dos capas ocultas de 64 unidades con activación Tanh, que emite una distribución gaussiana sobre dos acciones continuas (empuje del propulsor inferior entre 0 y 1, y par de rotación entre -1 y 1). El estado tiene 7 dimensiones (posición x/y, velocidad x/y, seno y coseno de la inclinación, y velocidad angular). La relevancia de esta ficha no está en el rendimiento bruto, sino en el valor didáctico del registro experimental: doce ablaciones controladas con semillas de evaluación fijas y un informe de correlaciones.

El modelo reporta una tasa de aterrizaje del 98,0 % sobre 50 episodios de holdout (semillas 9000–9049) y una puntuación media de 113,65. El repositorio ocupa 0,0 GB y solo contiene los pesos en formato PyTorch (`model.pt`), sin licencia declarada ni idiomas especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP actor-crítico (2 capas ocultas de 64 unidades, activación Tanh), política gaussiana con desviación aprendida, entrenado con PPO |
| Parametros totales | No disponible (estimable en el orden de decenas de miles: 7→64→64→2 en política y 7→64→64→1 en valor, más 2 parámetros de desviación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el estado es un vector de 7 dimensiones por paso) |
| Tipos de cuantizacion | No disponible (pesos en punto flotante PyTorch; no se documentan variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | `model.pt` (checkpoint PyTorch con clave `state_dict`) |

## Arquitectura y entrenamiento

La política es una red neuronal feedforward con dos torres independientes (política y función de valor) que comparten estructura: `Linear(estado, 64) → Tanh → Linear(64, 64) → Tanh → Linear(64, salida)`. En modo continuo, la política emite la media de una distribución normal y un parámetro `log_std` inicializado a -0,5 e independiente del estado. Las acciones se recortan al rango válido: empuje en [0, 1] y rotación en [-1, 1].

El entrenamiento usa PPO con la configuración documentada: `total_steps = 1.000.000`, `n_envs = 16`, `rollout = 256` pasos por entorno (4096 transiciones por actualización), `clip = 0.2`, `lr = 0.0003`, `entropy_coef = 0.0`, `gamma = 0.99`, `gae_lambda = 0.95`, `epochs = 10`, `minibatch = 256` y `hidden = 64`. El entorno es la variante «joystick» del simulador `로드스터_시뮬레이터.py` (roadster continuo). La recompensa proviene del criterio de aterrizaje del simulador: dentro de la plataforma, con límites de inclinación y de velocidad vertical y horizontal.

La innovación destacable no es algorítmica sino metodológica: la model card documenta doce versiones con una única variable modificada respecto a una línea base (v2), midiendo el efecto de `clip`, número de entornos, tasa de aprendizaje, pasos totales y bonus de entropía. Se reportan correlaciones de Pearson sobre 12 muestras, con la advertencia explícita de que la correlación no implica causalidad y de que algunas variables nunca se variaron de forma aislada (gamma, lambda, rollout, minibatch, epochs, hidden).

## Capacidades

- Control continuo de dos dimensiones (empuje y par de rotación) a partir de un vector de estado de 7 componentes.
- Aterrizaje estable en la plataforma del simulador: 98,0 % de éxito en 50 episodios de holdout no vistos durante el entrenamiento.
- Generalización a semillas de evaluación fijas (9000–9049), lo que permite reproducibilidad del protocolo de evaluación.
- Política estocástica en entrenamiento (gaussiana) y determinista en inferencia (se usa la media de la distribución).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación simbólica; es una política reactiva por paso.
- No tiene capacidades multilingües, de visión, audio ni modo «thinking».
- No procesa texto: su única entrada es el vector de observación del simulador.

## Casos de uso

- Docencia de RL con PPO: el repositorio sirve como ejemplo mínimo y reproducible de un ciclo completo de entrenamiento (entorno, rollout, GAE, clipping, evaluación con semillas fijas) para cursos introductorios.
- Estudio de sensibilidad a hiperparámetros: las doce versiones permiten analizar empíricamente cómo `clip`, `lr` y `n_envs` afectan a la varianza del retorno en tareas de control continuo con recompensa escasa.
- Referencia base para comparativas de algoritmos: sirve como línea base PPO contra la que contrastar SAC, TD3 o DDPG en el mismo simulador de aterrizaje.
- Prototipado de simuladores: al incluir el script `로드스터_시뮬레이터.py`, se puede usar para validar la dinámica del entorno antes de escalar a simuladores físicos más complejos.
- Reproducción de experimentos: la configuración exacta y las semillas de evaluación permiten replicar los resultados en una CPU convencional en minutos.
- Demostración de despliegue de políticas ligeras: el modelo se carga en CPU con `torch.load` y ejecuta inferencia por paso sin GPU, útil para ejemplos de integración en bucles de control en tiempo real.

## Benchmarks y rendimiento

Los únicos datos publicados son la tasa de aterrizaje y la puntuación media del propio simulador, no benchmarks estándar de ML.

| Metrica | Valor | Protocolo |
|---|---|---|
| Tasa de aterrizaje (holdout) | 98,0 % | 50 episodios, semillas 9000–9049 |
| Puntuación media | 113,64628685160886 | Mismas 50 semillas |
| Puntuación del episodio mostrado (semilla 9018) | 120,0 | Reproducción con acciones deterministas |

Comparativa interna de versiones (tasa de aterrizaje sobre las mismas 50 semillas):

| Version | Cambio respecto a v2 | Tasa de aterrizaje | Diferencia |
|---|---|---|---|
| v2 (base joystick) | — | 98,0 % | — |
| v6 (este modelo) | n_envs 8→16 | 98,0 % | 0,0 |
| v12 | pasos 1M→2M sobre v6 | 100,0 % | +2,0 |
| v3 | clip 0,20→0,05 | 96,0 % | -2,0 |
| v4 | clip 0,20→0,50 | 76,0 % | -22,0 |
| v5 | n_envs 8→2 | 34,0 % | -64,0 |
| v7 | lr 0,0003→0,001 | 94,0 % | -4,0 |
| v8 | lr 0,0003→0,0001 | 40,0 % | -58,0 |
| v9 | pasos 1M→500K | 76,0 % | -22,0 |
| v10 | pasos 1M→2M | 98,0 % | 0,0 |
| v11 | entropy 0→0,01 | 94,0 % | -4,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB; el checkpoint completo cabe holgadamente en memoria RAM y se ejecuta en CPU sin problemas.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con soporte CUDA (por ejemplo, RTX 3060 o superior) aceleraría el entrenamiento, no la inferencia.
- Cabe en cualquier GPU de consumo e incluso en sistemas embebidos; el cuello de botella es el simulador, no la red.
- Opciones de despliegue: PyTorch nativo (`torch.load` + `state_dict`), exportación manual a ONNX o TorchScript. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma medida; por el tamaño de la red (dos MLP de 64 unidades) la inferencia por paso es del orden de microsegundos en CPU, y el rendimiento efectivo vendrá limitado por el paso del simulador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados en el mismo simulador. Como referencia cualitativa de la categoría (políticas PPO para control continuo):

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-lucasbrain-v6-roadster-ppo | Decenas de miles (no confirmado) | Vector de estado de 7 dimensiones | 98,0 % de aterrizaje en 50 semillas | No disponible | HuggingFace, repo de 0,0 GB |
| Políticas PPO de referencia (p. ej. Stable-Baselines3 Zoo) | Variable según tarea | Variable | Depende del entorno | MIT (SB3) | GitHub |
| Políticas SAC/TD3 equivalentes | Similar orden | Similar orden | No disponible para este simulador | Depende de la implementación | Repositorios públicos |

La comparación cuantitativa con alternativas no está disponible porque no se han publicado resultados de otros agentes sobre el mismo entorno y protocolo de semillas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política entrenada en un simulador sintético, hereda cualquier simplificación de la dinámica del entorno.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero la política puede producir acciones fuera de distribución si el estado se sale del rango visto en entrenamiento; en ese caso el recorte a [0, 1] y [-1, 1] enmascara la incertidumbre.
- Limitaciones de contexto o idioma: no procesa lenguaje; el «contexto» es un vector de 7 dimensiones sin memoria histórica, por lo que la política es puramente reactiva (Markoviana) y no puede planificar secuencias largas.
- Restricciones de licencia: la licencia no está declarada en la model card ni en los metadatos de HuggingFace; no se puede asumir uso comercial sin contactar con el autor.
- El autor no ha publicado una evaluación independiente; las métricas provienen de su propio protocolo y de su propio simulador.
- La correlación reportada entre hiperparámetros y tasa de aterrizaje se calcula sobre 12 muestras y el propio autor advierte que no implica causalidad; varias variables (gamma, lambda, rollout, minibatch, epochs, hidden) nunca se variaron de forma aislada.
- El repositorio es de tamaño 0,0 GB según los metadatos; conviene verificar que los pesos y el script del simulador estén realmente presentes antes de integrarlo en un pipeline.
- Sin garantías de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un proyecto personal sin soporte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucaskim72/connectailab-rl-lucasbrain-v6-roadster-ppo
- CONNECT AI LAB (repositorio del curso): https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS: enlace truncado en la model card, no disponible completo
- Contacto del autor: lucaskim72@gmail.com
