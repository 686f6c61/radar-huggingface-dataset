# RaquelBG05/ppo-SnowballTarget-unit5

## Resumen

SnowballTarget es un agente de aprendizaje por refuerzo profundo entrenado con Unity ML-Agents 1.1.0 y el algoritmo PPO (Proximal Policy Optimization) para el entorno de simulacion SnowballTarget. Lo desarrolla RaquelBG05 como parte de la Unidad 5 del Deep Reinforcement Learning Course, un curso practico ampliamente conocido en la comunidad de RL. El modelo no es un modelo de lenguaje ni un transformer generativo: es una politica neuronal entrenada para controlar un agente dentro de un entorno Unity, por lo que su ambito de aplicacion es la simulacion y la investigacion en RL, no el procesamiento de texto.

El entrenamiento se realizo en CPU sobre Google Colab, alcanzando 200.000 pasos registrados con una recompensa media por episodio de 24,614 +/- 2,298. El artefacto publicado es un fichero ONNX (`SnowballTarget.onnx`) que puede cargarse en la demo de Unity correspondiente para visualizar el comportamiento del agente. El repositorio tiene un tamano practicamente nulo (0,0 GB) y no registra descargas ni likes, lo que es coherente con un modelo de tipo educativo y de alcance limitado.

Su relevancia es, por tanto, didactica y de referencia: sirve como ejemplo reproducible de un pipeline completo de ML-Agents (configuracion de entrenamiento, log de texto, eventos de TensorBoard y exportacion a ONNX) para quienes estan aprendiendo RL aplicado a videojuegos y entornos simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica entrenada con PPO en Unity ML-Agents (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX en precision original) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`SnowballTarget.onnx`); se incluyen configuracion de entrenamiento, log de texto y eventos de TensorBoard |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de aprendizaje por refuerzo profundo con PPO, implementado a traves de Unity ML-Agents 1.1.0. PPO es un algoritmo de gradiente de politica con recorte de la ratio de probabilidad (clipped surrogate objective) que estabiliza las actualizaciones y es el algoritmo por defecto de ML-Agents para tareas de control continuo y discreto. La politica y la funcion de valor se implementan como redes neuronales cuyos detalles de capas, activaciones y tamano no se especifican en la informacion disponible.

El entrenamiento se ejecuto en CPU en Google Colab durante 200.000 pasos, con una recompensa media por episodio de 24,614 +/- 2,298 en el ultimo paso registrado. No se documenta el numero de episodios, la composicion del entorno de entrenamiento, ni si se aplicaron tecnicas adicionales como normalizacion de observaciones, recompensas por curiosidad o entrenamiento con multiples instancias. El autor incluye la configuracion de entrenamiento, el log de texto y los eventos de TensorBoard, lo que permite reproducir o inspeccionar el proceso.

## Capacidades

- Control de agente en el entorno SnowballTarget de Unity ML-Agents: la politica genera acciones a partir de las observaciones del entorno simulado.
- Toma de decisiones secuencial en episodios de simulacion fisica (lanzamiento de bolas de nieve contra objetivos, segun el nombre del entorno).
- Despliegue en inferencia mediante ONNX Runtime, integrable en Unity o en otros runtimes compatibles con ONNX.
- Reproducibilidad del entrenamiento: se incluyen configuracion, log y eventos de TensorBoard.
- No soporta tool calling, function calling, agentes multi-paso basados en lenguaje, capacidades multilingues, vision, audio ni modo de razonamiento explicito. Es exclusivamente un agente de RL para un entorno concreto.

## Casos de uso

- Docencia y aprendizaje de RL: sirve como ejemplo completo y reproducible de un pipeline de ML-Agents con PPO, desde la configuracion hasta la exportacion a ONNX, para cursos y tutoriales.
- Visualizacion en la demo de Unity: cargando `SnowballTarget.onnx` en la demo publica de ML-Agents-SnowballTarget se puede observar el comportamiento aprendido del agente y compararlo con otras politicas.
- Punto de partida para fine-tuning o reentrenamiento: la configuracion incluida permite reanudar el entrenamiento o ajustar hiperparametros para experimentar con variantes del entorno.
- Comparacion de algoritmos: util como referencia base de PPO frente a otros algoritmos de ML-Agents (SAC, DQN, etc.) en el mismo entorno.
- Integracion en prototipos de videojuegos: el fichero ONNX puede embeberse en un build de Unity para probar agentes controlados por politica neuronal en un entorno de simulacion.
- Investigacion en entornos simulados: permite estudiar la estabilidad del entrenamiento y la variabilidad de la recompensa (desviacion de 2,298 sobre una media de 24,614) en tareas de control con ML-Agents.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Entorno | Tarea | Metrica | Valor |
|---|---|---|---|
| ML-Agents-SnowballTarget | Reinforcement Learning | Recompensa media por episodio durante el entrenamiento | 24,614 +/- 2,298 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia: al ser un fichero ONNX de un agente de ML-Agents, el coste computacional es muy reducido; cabe en CPU y en cualquier GPU consumer.
- GPU recomendadas: no se requieren; el entrenamiento original se realizo en CPU en Google Colab. Para reentrenamiento, una GPU consumer (por ejemplo, RTX 3060 o superior) acelera el proceso, aunque no se dispone de datos de throughput.
- Cabe en GPU consumer: si, sin restricciones relevantes dado el tamano reducido del artefacto.
- Opciones de despliegue: ONNX Runtime, Unity con el paquete ML-Agents, y la demo publica de Hugging Face Spaces.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RaquelBG05/ppo-SnowballTarget-unit5 | PPO (ML-Agents) | SnowballTarget | 200.000 pasos, CPU | no disponible | Hugging Face |
| Otras politicas PPO de ML-Agents del mismo curso | PPO (ML-Agents) | SnowballTarget | no disponible | no disponible | Hugging Face (modelos de la comunidad) |
| Agentes SAC/DQN de ML-Agents | SAC / DQN | Entornos ML-Agents | no disponible | no disponible | Hugging Face / repositorios de la comunidad |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada; la comparativa se limita a categoria, entorno y disponibilidad.

## Limitaciones y advertencias

- Modelo de proposito educativo: no es un modelo de lenguaje ni un modelo generativo; no debe evaluarse con metricas de NLP.
- Entorno especifico: la politica esta entrenada exclusivamente para SnowballTarget y no generaliza a otros entornos sin reentrenamiento.
- Licencia no disponible: no se especifica licencia, por lo que el uso comercial queda en un limbo legal y requiere contactar con el autor.
- Sin verificacion independiente: los resultados de recompensa son declarados por el autor y no estan verificados (`verified: false`).
- Sin datos de parametros, arquitectura de red ni hiperparametros en la informacion disponible, lo que limita la reproducibilidad fina.
- Sin descargas ni likes: no hay evidencia de uso por parte de la comunidad ni de validacion externa.
- Riesgo de sobreajuste al entorno de entrenamiento y de comportamiento suboptimo fuera de la distribucion de observaciones vista durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RaquelBG05/ppo-SnowballTarget-unit5
- Demo de Unity en Hugging Face Spaces: https://huggingface.co/spaces/ThomasSimonini/ML-Agents-SnowballTarget
- Documentacion de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentacion de PPO en ML-Agents: https://github.com/Unity-Technologies/ml-agents/blob/main/docs/Training-PPO.md
- Deep Reinforcement Learning Course (Unidad 5): https://huggingface.co/deep-rl-course/unit5/introduction
