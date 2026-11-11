# hiupjump/connectailab-rl-haruga-v1-drone-ppo

## Resumen

`connectailab-rl-haruga-v1-drone-ppo` es una política de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) para el control continuo de un cuadricóptero simulado en MuJoCo. El modelo, publicado por el usuario `hiupjump`, actúa como "cerebro" de un dron de 3D dentro del entorno `CustomDrone-v0`, mapeando un vector de estado de 16 dimensiones a cuatro comandos continuos de empuje de rotor en el rango [-1, 1].

El objetivo del agente es volar y mantener posición (hovering) en un waypoint designado. Según la model card, el agente alcanza una puntuación media de 1458,2 puntos en 10 episodios no vistos durante el entrenamiento, tras 300 000 pasos de entrenamiento con 8 entornos paralelos. Se trata de un artefacto de carácter didáctico, enmarcado en el curso de IA de refuerzo "AI CITY BUILDERS" del CONNECT AI LAB.

No es un modelo de lenguaje ni un modelo fundacional: es un checkpoint de pesos de PyTorch para una tarea de control robótico concreta. Su relevancia es acotada al ámbito de la simulación MuJoCo y a la experimentación con PPO en control continuo de drones, no a aplicaciones de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (MLP, capa oculta de 128 unidades) entrenada con PPO sobre observaciones de 16 dimensiones y acciones continuas de 4 dimensiones |
| Parametros totales | no disponible (no se especifica el número exacto; con hidden=128 y E/S 16/4 el orden de magnitud es de unos pocos miles de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el estado es un vector de 16 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en precisión nativa; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoint de política PPO; no se especifica si `.pt`, `.pth` o `state_dict`) |

## Arquitectura y entrenamiento

La política es una red neuronal feed-forward (MLP) con una capa oculta de 128 unidades, entrenada mediante PPO con los siguientes hiperparámetros declarados en la model card: 300 000 pasos totales, 8 entornos paralelos, `n_steps=256`, `batch_size=256`, `clip=0.2`, `gamma=0.99`, `gae_lambda=0.95` y `lr=0.0003`. El espacio de observación es un vector de 16 dimensiones compuesto por posición relativa al objetivo (3), posición actual (3), cuaternión de orientación (4), velocidad lineal (3) y velocidad angular (3). El espacio de acción es continuo de 4 dimensiones, correspondiente al empuje de cada rotor normalizado en [-1, 1].

El entorno de entrenamiento es `CustomDrone-v0`, un cuadricóptero 3D simulado en MuJoCo. No se documenta en la información disponible la composición del dataset (no aplica en RL), el número exacto de episodios, la función de recompensa detallada, ni si hubo fases de ajuste fino o curriculum learning. Tampoco se especifica la semilla, la versión de MuJoCo ni la implementación de PPO utilizada (Stable-Baselines3, CleanRL u otra).

## Capacidades

- Control continuo de un cuadricóptero simulado: genera comandos de empuje para 4 rotores en el rango [-1, 1].
- Navegación a waypoint: vuela hacia una posición objetivo relativa codificada en la observación.
- Hovering: mantiene posición estable en el objetivo (según la descripción de la model card).
- Procesamiento de estado completo del dron: posición, orientación en cuaternión, velocidad lineal y angular.
- Política determinista o estocástica según el muestreo de la distribución de acciones de PPO (no se especifica en la información disponible).
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo thinking: es una política de control, no un modelo generativo.

## Casos de uso

- Investigación en control continuo con RL: servir como línea base reproducible de PPO para cuadricópteros en MuJoCo, permitiendo comparar hiperparámetros y variantes de recompensa.
- Docencia en aprendizaje por refuerzo: ejemplo práctico de un agente que aprende hovering y navegación a waypoint, adecuado para cursos introductorios como el del CONNECT AI LAB.
- Pruebas de robustez de políticas: evaluar la degradación del agente ante perturbaciones (viento simulado, ruido en observaciones) modificando el entorno `CustomDrone-v0`.
- Transferencia sim-a-real como estudio preliminar: aunque no hay evidencia de transferencia real, la política puede usarse como punto de partida en pipelines de sim-a-real con dominio aleatorizado.
- Benchmarking de algoritmos RL: comparar PPO frente a SAC, TD3 o Dreamer en la misma tarea de control de dron con la misma observación de 16 dimensiones.
- Generación de datos de demostración: usar la política entrenada para recolectar trayectorias de vuelo que sirvan como datos de imitación para otros agentes.
- Integración en entornos de simulación multiagente: desplegar varias instancias de la política para estudiar coordinación de flotas de drones en MuJoCo.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Puntuación media en 10 episodios no vistos | 1458,2 | Según la model card del autor |
| Pasos de entrenamiento | 300 000 | 8 entornos paralelos, `n_steps=256` |
| Entornos paralelos | 8 | — |
| Tamaño de lote | 256 | — |
| Capa oculta | 128 | — |

No se han publicado resultados comparativos con otros algoritmos (SAC, TD3, A2C) ni con otras políticas de dron en la información disponible. La puntuación de 1458,2 no es directamente comparable con métricas estándar (retorno medio, éxito en waypoint, error de posición) porque no se documenta la función de recompensa ni la escala.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima, del orden de decenas de MB o menos; la red es una MLP de capa oculta 128 y entrada/salida de 16/4 dimensiones. Cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con soporte PyTorch (GTX 1050, RTX 3050, RTX 4090, A100, H100) es sobrada. Para entrenamiento paralelo con 8 entornos, una GPU consumer moderna acelera la simulación MuJoCo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer y también en CPU.
- Opciones de despliegue: PyTorch nativo para cargar el checkpoint; MuJoCo (versión no especificada) para el entorno `CustomDrone-v0`; no se documentan exportaciones a ONNX, TorchScript, TensorRT ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican).
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser una MLP pequeña, la latencia por paso de inferencia es del orden de microsegundos en GPU y de decenas de microsegundos en CPU, pero el cuello de botella real es la simulación MuJoCo, no la política.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados con la misma tarea, entorno (`CustomDrone-v0`) o configuración exacta. A continuación se indican alternativas genéricas de la categoría (políticas RL para control continuo), pero sin datos de rendimiento comparables verificables en la información disponible:

| Modelo | Tipo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-haruga-v1-drone-ppo | PPO, MLP | CustomDrone-v0 (MuJoCo) | no disponible | no aplica | no disponible | Hugging Face |
| Políticas PPO de Stable-Baselines3 (referencia) | PPO, MLP | Gymnasium/MuJoCo | configurables | no aplica | MIT | Repositorio SB3 |
| Políticas RL de drone en MuJoCo (genéricas) | PPO/SAC | Quadrotor custom | no disponible | no aplica | variable | no disponible |

La comparativa cuantitativa no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Ámbito restringido: es una política de control para un entorno MuJoCo concreto (`CustomDrone-v0`); no es un modelo de lenguaje ni un modelo fundacional y no debe evaluarse como tal.
- Licencia no disponible: no se puede confirmar el uso comercial, la redistribución ni la modificación de los pesos. Antes de usarlo en producción, contactar con el autor.
- Dependencia del entorno: la política está entrenada para una observación de 16 dimensiones y una recompensa concretas; cambios en la dinámica, en la escala de las observaciones o en la función de recompensa pueden degradar el comportamiento.
- Sin evidencia de transferencia sim-a-real: no se documentan pruebas en hardware físico ni dominio aleatorizado.
- Riesgo de sobreajuste al entorno de entrenamiento: la puntuación de 1458,2 corresponde a 10 episodios; no se reportan intervalos de confianza, desviación estándar ni pruebas con perturbaciones.
- Sesgos y alucinaciones: no aplican en el sentido de NLP; el riesgo equivalente es la extrapolación fuera de la distribución de estados vista durante el entrenamiento, que puede producir maniobras inestables.
- Idiomas y contexto: no aplica; no procesa texto ni tiene ventana de contexto lingüística.
- Reproducibilidad: no se documentan la semilla, la versión de MuJoCo, la implementación de PPO ni los detalles de la función de recompensa, lo que dificulta reproducir exactamente los resultados.
- Tamaño del repo de 0,0 GB: el checkpoint puede no estar subido o ser extremadamente pequeño; conviene verificar la integridad de los archivos antes de cargarlos.

## Enlaces

- Hugging Face: https://huggingface.co/hiupjump/connectailab-rl-haruga-v1-drone-ppo
- Repositorio del autor en Hugging Face: https://huggingface.co/hiupjump
- MuJoCo (documentación oficial): https://mujoco.org
- Stable-Baselines3 (implementación de referencia de PPO): https://github.com/DLR-RM/stable-baselines3
- CleanRL (implementación de referencia de PPO): https://github.com/vwxyzjn/cleanrl
- CONNECT AI LAB: no disponible en la información proporcionada
- Paper de PPO (Schulman et al., 2017): https://arxiv.org/abs/1707.06347
