# LordN77/Reinforce-CartPole-v1

## Resumen

Reinforce-CartPole-v1 es una política de aprendizaje por refuerzo entrenada con el algoritmo REINFORCE (gradiente de política Monte Carlo) sobre el entorno clásico CartPole-v1 de Gymnasium. Lo desarrolla el usuario LordN77 como solución práctica de la unidad 4 del curso Deep RL de Hugging Face, y su propósito es didáctico: demostrar una implementación completa y reproducible de policy gradient en PyTorch. No es un modelo de lenguaje ni un transformer; es una red neuronal pequeña que mapea observaciones de cuatro dimensiones (posición y velocidad del carro, ángulo y velocidad angular de la barra) a una distribución categórica sobre dos acciones discretas.

El modelo alcanza una recompensa media de 500.00 con desviación estándar de 0.00 en 30 episodios de evaluación con semilla fija (60291), lo que equivale al máximo teórico del entorno (500 pasos por episodio). Supera con holgura el umbral de 350 que exige la unidad 4 del curso. Su relevancia es formativa: sirve como referencia mínima de cómo estructurar entrenamiento, evaluación y publicación de un agente RL, no como componente de producción.

La ficha se limita a lo declarado por el autor. No hay información sobre licencia, idiomas ni formato de pesos más allá de la mención a safetensors dentro de `agent.py`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (policy network) con salida categórica; algoritmo REINFORCE (Monte Carlo policy gradient). El autor no detalla el número de capas ni las dimensiones ocultas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno CartPole-v1: observación de 4 dimensiones por paso, episodios de hasta 500 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según la model card, el payload entrenado está incluido dentro de `agent.py`) |

## Arquitectura y entrenamiento

La política es una red neuronal en PyTorch que recibe el vector de observación de CartPole-v1 y emite logits sobre dos acciones; en inferencia se muestrea de una distribución categórica. El entrenamiento sigue el esquema REINFORCE clásico: se recolectan episodios completos, se calcula el retorno descontado (reward-to-go) para cada paso y se estandariza dentro de cada episodio antes de aplicar la actualización de gradiente de política. El optimizador es Adam. La model card no especifica el factor de descuento, la tasa de aprendizaje, el número de episodios de entrenamiento ni el tamaño de la red.

La evaluación se realizó sobre 30 episodios independientes con semilla 60291, obteniendo recompensa media 500.00 y desviación estándar 0.00, lo que indica que la política mantiene la barra durante los 500 pasos en todos los episodios evaluados. Los resultados por episodio y la semilla de evaluación están en `results.json`. El autor no documenta técnicas adicionales como baseline con valor, entropy bonus o normalización de observaciones; solo la estandarización del retorno por episodio.

## Capacidades

- Control de política discreta en CartPole-v1: selecciona entre las dos acciones del entorno (empujar a izquierda o derecha) a partir de observaciones continuas de cuatro dimensiones.
- Inferencia con muestreo categórico: la política devuelve una distribución de probabilidad sobre acciones, no una acción determinista.
- Evaluación reproducible: incluye función `evaluate` con semilla configurable y métricas de recompensa media, desviación estándar y score del curso.
- Carga de pesos preentrenados mediante `load_pretrained()` desde el payload safetensors embebido en `agent.py`.
- Creación de entornos mediante `make_env(False)`, que devuelve instancias de CartPole-v1 listas para evaluación.
- Código de entrenamiento incluido en el mismo `agent.py`, lo que permite reproducir el pipeline completo.
- No soporta tool calling, agentes multi-paso, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Docencia de policy gradient: usar el agente como ejemplo ejecutable de REINFORCE en un curso o taller, ya que el código de entrenamiento, la arquitectura y los pesos están en un único archivo y la evaluación es reproducible con semilla fija.
- Verificación de instalaciones de RL: ejecutar `evaluate` con 30 episodios para comprobar que PyTorch, Gymnasium 1.2.3 y safetensors funcionan correctamente en un entorno nuevo, dado que el resultado esperado es 500.00 ± 0.00.
- Baseline de comparación: servir como referencia mínima de rendimiento en CartPole-v1 frente a alternativas como DQN o PPO; cualquier agente que no alcance 500.00 en evaluación con semilla fija puede contrastarse contra esta política.
- Reproducción de experimentos: el `agent.py` incluye el código de entrenamiento, por lo que se puede reentrenar desde cero y comparar la curva de aprendizaje con la política publicada.
- Pruebas de integración de pipelines de RL: validar herramientas de registro de modelos, evaluación automática o empaquetado de agentes usando un artefacto pequeño y con métricas deterministas.
- Material de auditoría metodológica: revisar cómo se declaran resultados en una model card (episodios, semilla, desviación estándar, umbral del curso) y contrastarlo con el `results.json` adjunto.
- Demostración de despliegue de políticas: integrar `load_pretrained()` en un bucle de simulación propio para ilustrar el ciclo observación-acción en un entorno clásico de control.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Tarea | Reinforcement Learning |
| Dataset / entorno | CartPole-v1 |
| Mean reward | 500.00 +/- 0.00 |
| Episodios de evaluación | 30 |
| Semilla de evaluación | 60291 |
| Score del curso (media − desviación) | 500.00 |
| Umbral unidad 4 del curso | 350 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima, por debajo de 1 GB; la política es una red pequeña que procesa vectores de 4 dimensiones. El autor no publica el número de parámetros, por lo que no se puede dar una cifra exacta.
- GPU recomendadas: no es necesario GPU. Cualquier CPU moderna es suficiente para evaluar 30 episodios de hasta 500 pasos.
- GPU de consumo: cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), aunque no aporta ventaja frente a CPU por el tamaño ínfimo del cómputo.
- Opciones de despliegue: ejecución directa con Python y PyTorch siguiendo las instrucciones de la model card (`pip install torch "gymnasium[classic-control]==1.2.3" scipy safetensors imageio imageio-ffmpeg`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. Por la naturaleza del entorno (pasos discretos de simulación), el cuello de botella es la simulación de Gymnasium, no la inferencia de la red.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reinforce-CartPole-v1 (LordN77) | REINFORCE (policy gradient Monte Carlo) | CartPole-v1 | 500.00 +/- 0.00 (30 episodios, semilla 60291) | no disponible | Hugging Face |
| Políticas REINFORCE de referencia del Deep RL Course (Hugging Face) | REINFORCE | CartPole-v1 | no disponible en la información proporcionada | según el curso | Material del curso |
| Agentes DQN sobre CartPole-v1 | Deep Q-Learning | CartPole-v1 | no disponible en la información proporcionada | variable según implementación | Repositorios públicos |
| Agentes PPO sobre CartPole-v1 | Policy gradient con clipping | CartPole-v1 | no disponible en la información proporcionada | variable según implementación | Repositorios públicos |

No se dispone de datos comparativos verificados de estos modelos alternativos en la información proporcionada; la comparación se limita a la categoría y al entorno.

## Limitaciones y advertencias

- Ámbito muy restringido: la política solo es válida para CartPole-v1; no generaliza a otros entornos ni a variantes con observaciones o acciones distintas.
- Resultado sospechosamente perfecto: 500.00 ± 0.00 en 30 episodios con semilla fija puede reflejar una evaluación sobre episodios muy similares o un ajuste fino al máximo del entorno; no se ha verificado de forma independiente (`verified: false` en el model-index).
- Sin información de licencia: no se puede confirmar el uso comercial ni la redistribución de los pesos o del código.
- Sin información sobre parámetros, hiperparámetros ni composición del entrenamiento: dificulta la reproducibilidad exacta y la comparación cuantitativa con otras implementaciones.
- Pesos embebidos en `agent.py`: el payload safetensors está dentro del script, lo que complica su reutilización en pipelines que esperan un archivo de pesos independiente.
- Dependencia de versiones concretas: la model card fija `gymnasium[classic-control]==1.2.3`; otras versiones pueden cambiar la dinámica del entorno o la API y romper la reproducibilidad.
- Sin capacidades de lenguaje, razonamiento, tool calling ni multilingüismo: no debe evaluarse con los criterios habituales de modelos generativos.
- Riesgo de sobreinterpretación: un resultado de 500.00 en CartPole no implica calidad en tareas de control más complejas ni robustez ante perturbaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LordN77/Reinforce-CartPole-v1
- Unidad 4 del Hugging Face Deep RL Course (hands-on): https://huggingface.co/learn/deep-rl-course/en/unit4/hands-on
- Repositorio del curso Deep RL: https://github.com/huggingface/deep-rl-class
- Documentación de Gymnasium (CartPole-v1): https://gymnasium.farama.org/environments/classic_control/cart_pole/
- Documentación de safetensors: https://huggingface.co/docs/safetensors
