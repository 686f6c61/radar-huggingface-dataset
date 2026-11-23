# qwbyxy/taxi_v3_1

## Resumen

`qwbyxy/taxi_v3_1` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-Learning tabular sobre el entorno clásico `Taxi-v3` de Gymnasium. Lo publica el usuario qwbyxy en Hugging Face y se distribuye como un fichero `q-learning.pkl` que contiene la tabla Q aprendida junto con metadatos del entorno. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es un artefacto de política tabular para un entorno de juguete con espacio de estados y acciones finito y discreto.

El problema que resuelve es el control óptimo en un MDP pequeño: un taxi debe recoger y dejar pasajeros en una cuadrícula de 5x5 con cuatro ubicaciones de recogida y entrega, gestionando además la posición del pasajero y la ubicación del destino. El interés de este tipo de publicación es fundamentalmente pedagógico y de reproducibilidad: sirve como referencia de implementación casera de Q-Learning y como baseline de comparación para entornos `Taxi-v3`.

Su relevancia es limitada fuera del ámbito educativo. No hay información sobre hiperparámetros, número de episodios, política de exploración ni semillas utilizadas, y el resultado declarado (recompensa media de 7,38 ± 2,45) es modesto y no verificado. La ficha se redacta con los datos disponibles, que son escasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q sobre espacio de estados discreto) |
| Parametros totales | no disponible (tabla Q, no red neuronal; tamano no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno Taxi-v3, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en pickle, no cuantizables) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular clásico: una tabla que asigna un valor Q a cada par (estado, acción) del entorno `Taxi-v3`. El espacio de estados de Taxi-v3 tiene 500 estados discretos y el espacio de acciones tiene 6 acciones (moverse al norte, sur, este, oeste, recoger y dejar). El agente actualiza la tabla mediante la regla de Bellman con una tasa de aprendizaje y un factor de descuento que no se documentan en la model card.

No hay información sobre el número de episodios de entrenamiento, la estrategia de exploración (epsilon-greedy u otra), el decaimiento de epsilon, la semilla aleatoria ni el proceso de evaluación. Tampoco se especifica si se usó la variante estocástica por defecto del entorno (`is_slippery=True`) o una versión determinista. La model card advierte explícitamente de que puede ser necesario añadir atributos adicionales al entorno al cargarlo, lo que sugiere que los metadatos guardados pueden ser incompletos. No hay innovaciones técnicas destacables: es una implementación casera ("custom-implementation") de un algoritmo estándar.

## Capacidades

- Resolución del entorno `Taxi-v3` de Gymnasium mediante política greedy sobre la tabla Q aprendida.
- Toma de decisiones discreta en un MDP finito con 500 estados y 6 acciones.
- Persistencia de la política en un único fichero pickle cargable con `load_from_hub`.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del propio bucle del entorno.
- No tiene capacidades multilingües.
- No dispone de modo thinking, audio ni ninguna capacidad multimodal.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo resuelto de Q-Learning tabular para comparar con implementaciones propias en un curso introductorio, dado que el entorno es de los más simples de Gymnasium.
- Baseline de referencia en Taxi-v3: servir como punto de partida para medir la mejora de algoritmos más avanzados (DQN, PPO, SARSA) sobre el mismo entorno, aunque la recompensa media declarada es baja y conviene reentrenar antes de usarla como cota.
- Pruebas de infraestructura de evaluación: validar pipelines de `evaluate` de Hugging Face o de harness de RL que cargan políticas desde el Hub y ejecutan episodios contra `gym.make`.
- Reproducción de experimentos: cargar el pickle y ejecutar la política greedy para inspeccionar la tabla Q y estudiar qué estados tienen valores altos o mal calibrados.
- Prototipado de entornos personalizados: usar el formato de serialización como plantilla para publicar agentes tabulares propios en el Hub.
- Demostraciones educativas de MDPs: ilustrar en una charla o tutorial cómo un agente tabular converge (o no) en un entorno con recompensas dispersas y penalizaciones por paso.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index de la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,38 ± 2,45 |

No se han publicado otros resultados de benchmarks en la información disponible. No hay comparación con otros agentes ni desglose por episodios, semillas o condiciones del entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto es una tabla Q en pickle y se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier GPU consumer y también en CPU y en entornos sin GPU (Raspberry Pi, contenedores ligeros).
- Opciones de despliegue: script Python con `gymnasium` y `huggingface_hub` para cargar el pickle; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del bucle de simulación de Gymnasium, no del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwbyxy/taxi_v3_1 | Q-Learning tabular | Taxi-v3 | 7,38 ± 2,45 (no verificado) | no disponible | Hugging Face |
| Agentes Q-Learning tabulares de referencia en el Hub | Q-Learning tabular | Taxi-v3 | no disponible | variable | Hugging Face |
| DQN sobre Taxi-v3 (implementaciones de la comunidad) | Red neuronal profunda | Taxi-v3 | no disponible | variable | Repositorios de la comunidad |
| Política aleatoria (baseline trivial) | Ninguna | Taxi-v3 | no disponible | no aplica | Gymnasium |

No se dispone de datos verificados de los modelos alternativos en la información proporcionada; la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Resultado declarado no verificado (`verified: false`) y con alta varianza (±2,45 sobre una media de 7,38), lo que indica una política poco estable.
- No hay información sobre hiperparámetros, episodios ni semillas: la reproducibilidad del entrenamiento no está garantizada.
- Licencia no disponible: no puede asumirse uso comercial ni redistribución sin consultar al autor.
- El pickle de Python puede ejecutar código arbitrario al deserializarse; cárguelo solo desde fuentes de confianza y en un entorno aislado.
- La model card advierte de que pueden faltar atributos del entorno al cargarlo (por ejemplo `is_slippery`), lo que puede alterar la evaluación.
- Específico de Taxi-v3: no generaliza a otros entornos ni tareas.
- Sin información sobre sesgos, alucinación o comportamiento multilingüe porque no es un modelo de lenguaje.
- No apto para producción en ningún caso de uso real más allá de docencia o experimentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qwbyxy/taxi_v3_1
- Entorno Taxi-v3 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de Hugging Face sobre reinforcement learning: https://huggingface.co/docs/hub/en/models-the-hub
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
