# bilimili/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular para resolver el entorno Taxi-v3 de Gymnasium. Lo publica el usuario bilimili en Hugging Face y no es un modelo de lenguaje: es una política Q almacenada como tabla de estados-acciones que se carga desde el repositorio y se ejecuta contra el entorno `Taxi-v3` original.

El entorno Taxi-v3 es un problema clásico de control con espacio de estados discreto (500 estados) y 6 acciones posibles, donde un taxi debe recoger y dejar pasajeros en ubicaciones designadas. El agente aprende una función Q sobre ese espacio tabular, sin redes neuronales ni parámetros entrenables en el sentido habitual de un transformer.

Su relevancia es didáctica y de referencia: sirve como ejemplo mínimo de cómo empaquetar y distribuir un agente Q-Learning mediante el ecosistema de Hugging Face (formato `.pkl` con metadatos del entorno), y como baseline de comparación para entornos de RL clásicos. No tiene aplicaciones de generación de texto, visión ni tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (sin red neuronal) |
| Parametros totales | no disponible (tabla Q de estados-acciones, no se reporta recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno Gymnasium Taxi-v3, 500 estados discretos) |
| Tipos de cuantizacion | no disponible (no aplica a tablas Q) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (pickle, fichero `q-learning.pkl`) |

## Arquitectura y entrenamiento

El modelo implementa Q-Learning clásico, un algoritmo de diferencias temporales off-policy que actualiza la tabla Q mediante la regla de actualización de Bellman. El espacio de estados de Taxi-v3 es discreto (500 estados) y el de acciones tiene 6 elementos (moverse en cuatro direcciones, recoger y dejar pasajero), por lo que la representación es una tabla de tamaño 500 x 6.

No se dispone de información sobre hiperparámetros de entrenamiento (tasa de aprendizaje, factor de descuento, política epsilon-greedy, número de episodios) ni sobre la composición del dataset, ya que no se documentan en la model card. El artefacto se distribuye en formato pickle con los metadatos necesarios para reconstruir el entorno (`env_id`), y la propia model card advierte de que puede ser necesario ajustar atributos como `is_slippery` al cargar el entorno.

## Capacidades

- Resolución del entorno Taxi-v3 de Gymnasium mediante política Q tabular.
- Selección de acciones discretas (6 posibles) a partir del estado discreto observado.
- Carga y ejecución mediante `load_from_hub` del ecosistema Hugging Face, con el fichero `q-learning.pkl`.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes multi-step fuera del bucle episódico del entorno Taxi-v3.
- No tiene capacidades multilingües (no procesa lenguaje).

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo mínimo funcional de Q-Learning tabular en un curso introductorio, cargándolo con `load_from_hub` y evaluándolo contra `gym.make("Taxi-v3")`.
- Baseline de comparación: emplearlo como referencia de rendimiento (mean_reward 7.24) frente a implementaciones propias de Q-Learning o de métodos más avanzados (DQN, PPO) sobre el mismo entorno.
- Validación de pipelines de RL: integrarlo en pruebas de CI que verifiquen que el flujo de carga desde Hugging Face y ejecución contra Gymnasium funciona de extremo a extremo.
- Reproducibilidad de experimentos: servir como artefacto congelado para reproducir resultados de un artículo o práctica docente sin reentrenar.
- Depuración de entornos: comprobar el comportamiento de Taxi-v3 (incluido el parámetro `is_slippery`) usando una política ya entrenada como referencia.
- Demostración de empaquetado de agentes: ejemplo de cómo publicar un agente de RL en Hugging Face con model-index y metadatos de entorno.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.24 +/- 2.60 | No |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el artefacto es una tabla Q en pickle y no requiere GPU.
- GPU recomendadas: ninguna; la inferencia es puramente tabular y se ejecuta en CPU.
- Cabe en cualquier equipo: el tamaño del repositorio es de 0.0 GB y el coste computacional es despreciable.
- Despliegue: no aplican servidores de inferencia de LLM (vLLM, TGI, llama.cpp, Ollama). Se ejecuta con Python, Gymnasium y la utilidad `load_from_hub` de Hugging Face.
- Latencia y throughput: no disponibles; dependen del bucle de simulación de Gymnasium, no del modelo.

## Comparativa con modelos similares

| Modelo | Categoría | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bilimili/q-Taxi-v3 | Q-Learning tabular | Taxi-v3 | no disponible | no aplica | no disponible | Hugging Face |
| Agentes Q-Learning de la comunidad HF | Q-Learning tabular | Taxi-v3 | no disponible | no aplica | variable | Hugging Face |
| DQN sobre Taxi-v3 | Deep RL | Taxi-v3 | red pequeña | no aplica | variable | implementaciones propias |
| PPO sobre Taxi-v3 | Policy gradient | Taxi-v3 | red pequeña | no aplica | variable | implementaciones propias |

No se dispone de datos comparativos de rendimiento publicados para estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El valor de mean_reward (7.24 +/- 2.60) está marcado como no verificado en la model card.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- El agente está acoplado al entorno Taxi-v3; no generaliza a otros entornos ni tareas.
- La carga requiere reconstruir el entorno con los atributos correctos (por ejemplo `is_slippery`), según advierte la model card.
- El formato pickle (`.pkl`) implica riesgos de seguridad al deserializar ficheros de origen no confiable.
- Sin información sobre hiperparámetros ni proceso de entrenamiento, la reproducibilidad es limitada.
- No aplica a tareas de lenguaje, visión ni agentes conversacionales; no debe evaluarse con benchmarks de LLM.

## Enlaces

- Hugging Face: https://huggingface.co/bilimili/q-Taxi-v3
