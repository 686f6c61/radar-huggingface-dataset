# SajiSaez/taxi-v3

## Resumen

`SajiSaez/taxi-v3` es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular para resolver el entorno `Taxi-v4` de Gymnasium. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q serializada que mapea estados discretos del entorno a valores de accion, publicada en Hugging Face por el usuario SajiSaez dentro del ecosistema de modelos de reinforcement learning.

El entorno Taxi-v4 es un problema clasico de planificacion con estados discretos (500 estados posibles) en el que un taxi debe recoger y dejar pasajeros en cuatro ubicaciones de una cuadricula, con recompensas penalizadas por pasos y por acciones invalidas. El agente ha sido entrenado con una implementacion personalizada de Q-Learning y declara una recompensa media de 7,56 +/- 2,71 sobre el conjunto de evaluacion, un resultado modesto que sugiere una convergencia parcial.

Su relevancia es fundamentalmente didactica y de referencia: sirve como ejemplo reproducible de un pipeline de RL clasico (entorno Gymnasium, agente Q-Learning, serializacion en `.pkl`, publicacion en el Hub). No debe confundirse con un modelo generativo: no procesa texto, no tiene parametros en el sentido de un transformer y no admite cuantizacion ni despliegue en servidores de inferencia tipo vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla de valores estado-accion, sin red neuronal) |
| Parametros totales | no disponible (tabla Q discreta; el tamano depende de la dimension del espacio de estados y acciones de Taxi-v4) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no procede; el artefacto es un `.pkl` con la tabla Q) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (pickle de Python, fichero `q-learning.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular clasico: una tabla Q que asigna un valor esperado a cada par (estado, accion) del entorno `Taxi-v4`. El agente actualiza los valores mediante la regla de Bellman con una tasa de aprendizaje y un factor de descuento que no se documentan en la model card. La politica resultante es greedy sobre la tabla Q aprendida. No hay red neuronal, ni funcion de aproximacion, ni mecanismo de atencion; por tanto, no aplican conceptos como decodificacion especulativa, atencion lineal o mezcla de expertos.

No se especifican en la informacion disponible el numero de episodios de entrenamiento, la politica de exploracion (epsilon-greedy u otra), los hiperparametros concretos ni la composicion del conjunto de evaluacion. La model card solo indica que se trata de una "custom-implementation" de Q-Learning y que el entorno objetivo es `Taxi-v4`. El resultado declarado (recompensa media de 7,56 +/- 2,71) es coherente con un agente que ha aprendido parcialmente la politica optima, ya que el maximo teorico en Taxi-v4 suele rondar valores superiores a 8-9 en agentes bien convergidos.

## Capacidades

- Resolucion del entorno `Taxi-v4` de Gymnasium mediante politica greedy sobre la tabla Q aprendida.
- Toma de decisiones secuencial en un espacio de estados discreto (recogida y entrega de pasajeros en una cuadricula).
- Aprendizaje por refuerzo tabular clasico, sin generalizacion a estados no vistos mas alla de la tabla almacenada.
- Serializacion y carga via `load_from_hub` desde el Hub de Hugging Face.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del propio bucle del entorno Gymnasium.
- No tiene capacidades multilingues.
- No dispone de modo thinking, vision, audio ni ninguna modalidad adicional.

## Casos de uso

- Docencia de reinforcement learning: usar el agente como ejemplo reproducible de un pipeline completo (entorno, entrenamiento Q-Learning, serializacion y publicacion en el Hub) en cursos o talleres introductorios.
- Baseline de referencia en Taxi-v4: emplearlo como punto de comparacion al evaluar implementaciones propias de Q-Learning, SARSA o Deep Q-Network sobre el mismo entorno.
- Pruebas de integracion de Gymnasium: validar que el pipeline de carga de entornos (`gym.make(model["env_id"])`) y de agentes funciona correctamente en un proyecto nuevo.
- Reproducibilidad de experimentos: cargar el `.pkl` y comparar la recompensa media obtenida con la declarada (7,56 +/- 2,71) para verificar la estabilidad del entorno y de la politica.
- Demostracion de despliegue en el Hub: ilustrar el flujo `load_from_hub` en tutoriales sobre como publicar y consumir modelos de RL en Hugging Face.
- Analisis de convergencia: estudiar por que un agente tabular alcanza una recompensa media limitada y que hiperparametros (epsilon, alpha, gamma) podrian mejorarla, usando este modelo como caso de estudio.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7,56 +/- 2,71 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto es una tabla Q en un `.pkl` de tamano despreciable (repo de 0,0 GB).
- GPU recomendadas: no aplica; la inferencia es una consulta a diccionario en CPU.
- Cabe en cualquier consumer GPU y en CPU sin requisitos relevantes.
- Opciones de despliegue: carga directa con `load_from_hub` y ejecucion sobre `gym.make(model["env_id"])`; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; dependen del bucle de simulacion del entorno Gymnasium, no del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SajiSaez/taxi-v3 | Q-Learning tabular | Taxi-v4 | 7,56 +/- 2,71 | no disponible | Hugging Face |
| Agentes Q-Learning de referencia en Taxi-v4 | Q-Learning tabular | Taxi-v4 | no disponible | variable segun implementacion | Tutoriales y repos de RL |
| Agentes DQN sobre Taxi-v4 | Deep Q-Network | Taxi-v4 | no disponible | variable segun implementacion | Repos de RL |

No se dispone de datos comparativos verificados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El modelo es especifico del entorno `Taxi-v4`; no es transferible a otras tareas ni a otros entornos sin reentrenamiento.
- La recompensa media declarada (7,56 +/- 2,71) no esta verificada (`verified: false`) y la desviacion tipica es elevada, lo que indica una politica inestable o parcialmente convergida.
- No hay informacion sobre sesgos, ya que no procesa datos humanos ni lenguaje natural.
- Riesgo de alucinacion no aplicable en el sentido de modelos generativos; el riesgo real es ejecutar acciones suboptimas por una tabla Q incompleta.
- La licencia no esta declarada, por lo que no se puede confirmar el uso comercial sin consultar al autor.
- No se documentan hiperparametros ni protocolo de evaluacion, lo que dificulta la reproduccion exacta del resultado.
- El formato `.pkl` implica riesgos de seguridad al deserializar ficheros pickle de origen no confiable; conviene auditar el contenido antes de cargarlo en produccion.
- No apto para despliegues de inferencia de lenguaje, atencion al cliente, generacion de codigo ni ninguna tarea de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SajiSaez/taxi-v3
- Documentacion de Gymnasium sobre Taxi-v4: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de Hugging Face sobre `load_from_hub`: https://huggingface.co/docs/hub
