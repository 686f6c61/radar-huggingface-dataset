# lookarooka/connectailab-rl-novice-v1-lunarlander

## Resumen

connectailab-rl-novice-v1-lunarlander es un agente de aprendizaje por refuerzo profundo entrenado con DQN (Deep Q-Network) para resolver el entorno LunarLander-v3 de Gymnasium. Lo publica el usuario lookarooka en Hugging Face como parte de un material didactico de CONNECT AI LAB en colaboracion con AI CITY BUILDERS, dentro de un curso de refuerzo (leccion 5). No es un modelo de lenguaje ni un modelo fundacional: es una politica neuronal pequena que mapea un vector de estado de 8 dimensiones a 4 acciones discretas.

El modelo resuelve una tarea muy acotada: controlar el modulo de aterrizaje lunar de LunarLander-v3 (posicion, velocidad, inclinacion, velocidad angular y contacto de cada pata) y elegir entre reposo, motor izquierdo, motor central y motor derecho. La red es un perceptron multicapa de 8 -> 128 -> 128 -> 4 con activaciones ReLU, entrenado durante 200.000 pasos con un DQN clasico (replay buffer, red objetivo y exploracion epsilon-greedy).

Su relevancia es fundamentalmente educativa y de referencia: sirve como ejemplo minimo, reproducible y ligero de un agente DQN funcional que supera el umbral de exito del entorno (200 puntos de recompensa media) con 233,6 en 10 episodios no vistos. No esta pensado para produccion, no tiene licencia declarada y no dispone de informacion sobre idiomas ni contexto, ya que no procesa texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) con 3 capas densas: 8 -> 128 -> 128 -> 4, activacion ReLU; agente DQN (Deep Q-Network) |
| Parametros totales | Aproximadamente 18.692 (8x128 + 128 + 128x128 + 128 + 128x4 + 4) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; entrada fija de 8 valores de estado) |
| Tipos de cuantizacion | No disponible (pesos en punto flotante PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`model.pt`, `state_dict` cargable con `torch.load`) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tres capas completamente conectadas (8 entradas, dos capas ocultas de 128 neuronas con ReLU y 4 salidas Q, una por accion). El agente se entrena con DQN estandar: red Q principal, red objetivo actualizada cada 500 pasos, buffer de repeticion, batch de 128 y politica epsilon-greedy con una fase de exploracion inicial de 0,3. Los hiperparametros documentados son 200.000 pasos totales de entrenamiento, tasa de aprendizaje 0,0005 y factor de descuento gamma de 0,99.

No se documenta composicion del dataset (el agente aprende por interaccion con el simulador, no con datos supervisados), ni uso de RLHF, DPO o tecnicas como decodificacion especulativa o atencion lineal, que no aplican a este tipo de modelo. La unica innovacion reseñable es su caracter didactico: una implementacion minima y reproducible de DQN sobre Gymnasium.

## Capacidades

- Control de politica discreta en LunarLander-v3: selecciona una de 4 acciones (reposo, motor izquierdo, motor central, motor derecho) a partir de 8 variables de estado.
- Aprendizaje por refuerzo profundo con DQN: red Q y red objetivo con actualizacion periodica.
- Inferencia determinista: la accion se obtiene con `argmax` sobre los valores Q.
- Entrenamiento reproducible con hiperparametros documentados (pasos, learning rate, gamma, epsilon, batch, periodo de la red objetivo).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbolico, vision, audio ni capacidades multilingues.
- No dispone de modo de razonamiento (thinking mode) ni de generacion de texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo funcional de DQN en un curso introductorio, cargando `model.pt` y comparando la politica aprendida con una politica aleatoria.
- Verificacion de pipelines de RL: servir como referencia de "agente que supera el umbral" (233,6 >= 200) para validar entornos de evaluacion y scripts de rollout en Gymnasium.
- Benchmark de entornos: emplear la recompensa media en 10 episodios como linea base para comparar nuevos algoritmos (PPO, A2C, SAC discreto) sobre LunarLander-v3.
- Reproduccion de experimentos: reentrenar con los hiperparametros documentados (200.000 pasos, lr 0,0005, gamma 0,99) para estudiar sensibilidad y estabilidad del DQN.
- Demostracion en vivo: integrar el agente en una demo interactiva o video (`replay.mp4`) para mostrar aterrizajes en tiempo real con PyTorch en CPU.
- Material de aula para AI CITY BUILDERS: usar el modelo como "cerebro" de ejemplo en talleres de robotica/refuerzo, ilustrando el mapeo estado -> accion en un entorno fisico simplificado.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Tarea | Entorno | Metrica | Valor | Umbral de exito |
|---|---|---|---|---|
| reinforcement-learning | LunarLander-v3 | mean_reward (media de 10 episodios no vistos) | 233,6 | 200 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (unos 18.692 parametros en float32, ~75 KB); el modelo cabe holgadamente en cualquier GPU o incluso en CPU.
- GPU recomendadas: ninguna en particular; funciona en CPU, en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) o en entornos sin GPU.
- Cabe en GPU consumer: si, en cualquiera, con un consumo de memoria despreciable.
- Opciones de despliegue: PyTorch nativo (carga directa de `state_dict`), exportacion a TorchScript/ONNX, o integracion en bucles de Gymnasium. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamano de la red, la inferencia es del orden de microsegundos a pocos milisegundos por paso en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-novice-v1-lunarlander | DQN (MLP 8-128-128-4) | ~18.692 | LunarLander-v3 | 233,6 (10 episodios) | No disponible | Hugging Face |
| Agente DQN de referencia (SB3, `DQN('MlpPolicy')`) | DQN (MLP) | Del orden de decenas de miles | LunarLander-v3 | No disponible en esta busqueda | MIT (Stable-Baselines3) | GitHub / PyPI |
| Agente PPO de referencia (SB3, `PPO('MlpPolicy')`) | PPO (MLP) | Del orden de decenas de miles | LunarLander-v3 | No disponible en esta busqueda | MIT (Stable-Baselines3) | GitHub / PyPI |

No se dispone de datos de rendimiento publicados para las alternativas en la informacion proporcionada; la comparacion se limita a tipo de algoritmo, tamano y licencia.

## Limitaciones y advertencias

- Modelo especifico de un unico entorno (LunarLander-v3); no generaliza a otras tareas ni a otros espacios de estados o acciones.
- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no admite instrucciones.
- La metrica de 233,6 no esta verificada de forma independiente (`verified: false`) y procede solo de la model card del autor.
- Licencia no declarada: no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de cualquier uso fuera del ambito educativo.
- Ausencia de informacion sobre sesgos, robustez o evaluacion estadistica (varianza entre semillas, numero de ejecuciones).
- Riesgo de sobreajuste al entorno y de sensibilidad a cambios en la version de Gymnasium o en la dinamica del simulador.
- No hay garantias de mantenimiento, soporte ni actualizaciones; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- No se documentan limitaciones de contexto ni de idioma porque no aplican.

## Enlaces

- Hugging Face: https://huggingface.co/lookarooka/connectailab-rl-novice-v1-lunarlander
- CONNECT AI LAB (GitHub): https://github.com/wonseokjung/connect-tycoon
- AI CITY BUILDERS (curso de refuerzo): https://www.aicitybuilders.com/robot
- Entorno LunarLander-v3 (Gymnasium): no disponible en la informacion proporcionada
- Paper DQN original (Mnih et al., 2015): no disponible en la informacion proporcionada
