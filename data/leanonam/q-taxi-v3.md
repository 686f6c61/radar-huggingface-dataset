# LeaNonam/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular para resolver el entorno Taxi-v3 de Gymnasium. Lo publica el usuario LeaNonam en Hugging Face y no se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q serializada que mapea estados discretos del entorno a valores de accion. El repositorio ocupa 0,0 GB y contiene un unico artefacto, `q-learning.pkl`, que se carga mediante la funcion `load_from_hub` del ecosistema de Hugging Face.

El entorno Taxi-v3 es un clasico de control secuencial con 500 estados discretos y 6 acciones posibles (moverse en cuatro direcciones, recoger pasajero y dejarlo). El objetivo es recoger a un pasajero en una de cuatro ubicaciones y dejarlo en su destino con el minimo coste. El agente declara una recompensa media de 7,46 +/- 2,78, un valor que, dado el rango de recompensas de Taxi-v3 (tipicamente entre -200 y 20), sugiere una politica funcional pero lejos de la solucion optima.

Su relevancia es limitada y de caracter didactico: sirve como referencia de implementacion de Q-Learning con serializacion en formato pickle compatible con el flujo de `deep-rl-class` de Hugging Face. No compite con modelos de proposito general ni con agentes profundos; su interes es exclusivamente academico y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-accion) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones como maximo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de 500 estados discretos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | pickle (`.pkl`) |
| Entorno | Taxi-v3 (Gymnasium) |
| Espacio de estados | 500 estados discretos |
| Espacio de acciones | 6 acciones discretas |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular clasico, sin redes neuronales. El agente mantiene una tabla Q que asocia cada uno de los 500 estados del entorno Taxi-v3 con los valores esperados de las 6 acciones. La actualizacion sigue la regla de Bellman: Q(s,a) <- Q(s,a) + alpha * (r + gamma * max_a' Q(s',a') - Q(s,a)). No hay funcion de aproximacion, por lo que la convergencia depende de la cobertura de estados y de la politica de exploracion empleada durante el entrenamiento.

No se especifican en la informacion disponible los hiperparametros de entrenamiento (tasa de aprendizaje alpha, factor de descuento gamma, politica epsilon-greedy, numero de episodios) ni la composicion del dataset, ya que el agente se entrena interactuando con el simulador Taxi-v3 y no con un corpus de datos. Tampoco se documenta si se aplico alguna variante como SARSA, Double Q-Learning o decodificacion especulativa, ni si hubo ajuste fino posterior. El artefacto publicado es el resultado final del entrenamiento, sin informacion sobre el proceso.

## Capacidades

- Resolucion del entorno Taxi-v3: recoger y dejar pasajeros en un mapa de 5x5 con cuatro ubicaciones de recogida y destino.
- Politica determinista derivada de la tabla Q: para cada estado, selecciona la accion con mayor valor Q.
- Carga directa mediante `load_from_hub(repo_id="LeaNonam/q-Taxi-v3", filename="q-learning.pkl")`.
- Integracion con Gymnasium a traves de `gym.make(model["env_id"])`.
- Reproducibilidad del agente en el entorno declarado.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio ni modo thinking.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo funcional de Q-Learning tabular en un curso introductorio, cargandolo con `load_from_hub` y evaluandolo sobre Taxi-v3 para ilustrar la diferencia entre politica aprendida y politica optima.
- Comparacion de algoritmos: servir de linea base tabular frente a implementaciones de DQN, SARSA o Monte Carlo sobre el mismo entorno Taxi-v3, midiendo recompensa media y varianza.
- Verificacion de pipelines de serializacion: probar el flujo completo de Hugging Face (subida, carga con `load_from_hub`, ejecucion en Gymnasium) con un artefacto pequeno y sin dependencias pesadas.
- Reproduccion de experimentos: validar que la recompensa declarada (7,46 +/- 2,78) se obtiene al reevaluar el agente, detectando posibles diferencias por version de Gymnasium o por `is_slippery`.
- Pruebas de integracion en entornos de RL: usar el agente como smoke test en un framework de evaluacion antes de desplegar agentes mas costosos.
- Analisis de robustez: modificar parametros del entorno (por ejemplo `is_slippery=True`) y observar la degradacion de la politica, ya que el agente fue entrenado presumiblemente con el entorno por defecto.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,46 +/- 2,78 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparacion con agentes de referencia ni con la politica optima de Taxi-v3.

## Requisitos de hardware

- VRAM: no aplica; el agente es una tabla Q en formato pickle y se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier consumer GPU y en cualquier CPU convencional; el cuello de botella es el simulador de Gymnasium, no el modelo.
- Opciones de despliegue: Python con `gymnasium` y la utilidad `load_from_hub` del ecosistema de Hugging Face (habitualmente del curso `deep-rl-class`). No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del simulador y del bucle de evaluacion, no del agente.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeaNonam/q-Taxi-v3 | Q-Learning tabular | Taxi-v3 | 7,46 +/- 2,78 | no disponible | Hugging Face |
| Agente Q-Learning de referencia (deep-rl-class) | Q-Learning tabular | Taxi-v3 | no disponible | no disponible | Hugging Face |
| DQN sobre Taxi-v3 | Deep Q-Network | Taxi-v3 | no disponible | no disponible | Implementaciones publicas |
| Politica optima de Taxi-v3 | Solver exacto | Taxi-v3 | no disponible en esta ficha | no aplica | Referencia teorica |

No se dispone de datos comparativos verificados en la informacion proporcionada. La comparativa con DQN y con la politica optima requeriria reevaluar el agente en el mismo entorno y con la misma semilla.

## Limitaciones y advertencias

- El agente es especifico de Taxi-v3; no generaliza a otros entornos ni tareas.
- La recompensa media declarada (7,46) es modesta y con alta varianza (+/- 2,78); no hay evidencia de que sea una politica optima.
- No se documentan hiperparametros ni semillas, lo que dificulta la reproducibilidad exacta.
- La licencia no esta disponible, por lo que el uso comercial queda sin marco legal claro.
- El formato pickle puede implicar riesgos de seguridad al deserializar archivos de origen no confiable.
- No se especifica si el entrenamiento uso `is_slippery=True` o `False`; el comportamiento puede diferir del esperado si se carga con otra configuracion.
- No soporta texto, vision, audio ni tool calling; no debe evaluarse como modelo de lenguaje.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/LeaNonam/q-Taxi-v3
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Curso deep-rl-class de Hugging Face (utilidad `load_from_hub`): https://github.com/huggingface/deep-rl-class
