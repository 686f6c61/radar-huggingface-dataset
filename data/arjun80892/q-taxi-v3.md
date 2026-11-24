# arjun80892/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo basado en Q-Learning tabular entrenado para resolver el entorno Taxi-v3 de Gymnasium. Lo publica el usuario arjun80892 en Hugging Face como parte de la Unidad 2 del curso Deep Reinforcement Learning de Hugging Face. No es un modelo de lenguaje ni una red neuronal: es una tabla Q serializada en formato pickle que mapea cada uno de los 500 estados discretos del entorno a las 6 acciones posibles.

El entorno Taxi-v3 es un problema clasico de planificacion con recompensas dispersas: un taxi debe recoger a un pasajero en una de cuatro ubicaciones y dejarlo en otra, con un grid de 5x5 y paredes internas. El agente aprende una politica determinista mediante actualizaciones de Bellman con epsilon-greedy, sin aproximacion de funcion. El resultado declarado es una recompensa media de 7,56 con desviacion tipica de 2,71 sobre episodios de evaluacion, lo que supera el umbral de certificacion del curso (mean_reward - std_reward = 4,85).

Su relevancia es exclusivamente didactica: sirve como referencia minima de un pipeline completo de RL (entrenamiento, evaluacion, publicacion en el Hub y replay). No tiene aplicaciones fuera del propio entorno Taxi-v3 ni capacidad de generalizacion a otros problemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q de 500 estados x 6 acciones) |
| Parametros totales | 3000 entradas Q (no hay parametros neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno episodico, maximo 99 pasos por episodio) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular clasico. La tabla Q tiene dimension 500 x 6, correspondiente a los 500 estados discretos de Taxi-v3 y a las 6 acciones (mover norte, sur, este, oeste, recoger pasajero, dejar pasajero). La actualizacion sigue la regla de Bellman: Q(s,a) <- Q(s,a) + alpha * (r + gamma * max_a' Q(s',a') - Q(s,a)). La politica de exploracion es epsilon-greedy con epsilon inicial de 1,0, epsilon minimo de 0,05 y decaimiento de 0,005.

Los hiperparametros declarados son: 30 000 episodios de entrenamiento, tasa de aprendizaje alpha = 0,7, factor de descuento gamma = 0,95 y un maximo de 99 pasos por episodio. No se especifica la semilla, el numero exacto de pasos de decaimiento de epsilon ni el criterio de parada. No hay redes neuronales, por lo que no existen fases de RLHF, DPO ni ajuste fino supervisado. Tampoco hay innovaciones tecnicas destacables: es una implementacion de referencia del algoritmo.

## Capacidades

- Resolucion del entorno Taxi-v3: dado un estado entero (0-499), devuelve la accion optima segun la tabla Q entrenada.
- Politica determinista: la accion se obtiene con `argmax` sobre la fila del estado, sin muestreo estocastico.
- Ejecucion episodica: opera hasta terminacion o truncamiento con un limite de 99 pasos.
- Serializacion portable: el objeto pickle incluye la tabla Q, el `env_id` y el campo `max_steps`, lo que permite reconstruir el bucle de inferencia con Gymnasium.
- No soporta tool calling, function calling, agentes multi-paso generales, capacidades multilingues, vision, audio ni modo de razonamiento extendido.
- No generaliza a estados no vistos: los 500 estados estan enumerados de antemano y cualquier entorno distinto queda fuera de su espacio de definicion.

## Casos de uso

- Docencia de RL tabular: usar el agente como ejemplo ejecutable de Q-Learning con epsilon-greedy en un curso introductorio, comparando curvas de recompensa con y sin decaimiento de epsilon.
- Verificacion de pipelines de evaluacion: integrar el modelo en un script que reproduzca la metrica declarada (7,56 +/- 2,71) para validar herramientas de evaluacion de agentes en el Hub.
- Baseline en experimentos comparativos: emplearlo como referencia inferior frente a metodos con aproximacion de funcion (DQN, PPO) sobre Taxi-v3 para medir la mejora en recompensa media y estabilidad.
- Pruebas de reproducibilidad de entornos Gymnasium: comprobar que la version de Gymnasium instalada produce transiciones compatibles con la tabla Q serializada.
- Generacion de replays y visualizaciones: producir videos del agente resolviendo episodios para material divulgativo o documentacion de clases.
- Test de integracion en infraestructura de Hugging Face: validar flujos de `hf_hub_download` y carga de objetos pickle en pipelines de CI para modelos de reinforcement learning.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,56 +/- 2,71 |

La model card anade una puntuacion de certificacion de 4,85 (mean_reward - std_reward) y estado "Passed". No se han publicado resultados comparativos con otros agentes en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU. La tabla Q ocupa 3000 valores float, es decir, unos pocos kilobytes en memoria.
- CPU: cualquier procesador moderno ejecuta la inferencia en microsegundos por paso.
- GPU recomendadas: ninguna. No hay operaciones tensoriales.
- Cabe en cualquier equipo, incluidos Raspberry Pi y entornos sin acelerador.
- Despliegue: carga directa con `pickle` y `gymnasium`; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia: dominada por el coste de `env.step` de Gymnasium, no por el modelo; el `argmax` sobre 6 valores es despreciable.
- Throughput: limitado por el bucle de simulacion del entorno, no por el agente.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| q-Taxi-v3 (arjun80892) | Q-Learning tabular | Taxi-v3 | 7,56 +/- 2,71 | no disponible | Hugging Face |
| Agentes Q-Learning del curso HF (otros usuarios) | Q-Learning tabular | Taxi-v3 | no disponible en esta busqueda | variable | Hugging Face |
| DQN sobre Taxi-v3 | Red neuronal (DQN) | Taxi-v3 | no disponible en esta busqueda | variable | Implementaciones publicas |

No se dispone de datos verificables de alternativas concretas en la informacion proporcionada; la comparativa cuantitativa queda pendiente.

## Limitaciones y advertencias

- Especificidad total al entorno: solo funciona con Taxi-v3; no acepta entradas fuera de los 500 estados definidos.
- Sin generalizacion: al ser tabular, no puede interpolar ni transferir conocimiento a variantes del entorno.
- Recompensa modesta: 7,56 de media esta por debajo de politicas optimas documentadas para Taxi-v3 (cercanas a 8-9 en configuraciones estandar), lo que sugiere una politica no completamente convergida.
- Varianza alta: desviacion tipica de 2,71 indica episodios con recompensas muy dispares, probablemente por exploracion residual o por el limite de 99 pasos.
- Licencia no declarada: no hay base legal explicita para uso comercial o redistribucion; conviene contactar con el autor antes de reutilizarlo.
- Riesgo de seguridad al cargar pickle: deserializar ficheros pickle de origen no verificado permite ejecucion de codigo arbitrario; hay que auditar el archivo antes de cargarlo en produccion.
- Sin verificacion externa: la metrica esta marcada como `verified: false` en el model-index.
- Repositorio vacio en cuanto a documentacion adicional: 0,0 GB de tamano y sin idiomas declarados; no hay informacion sobre semilla ni procedimiento exacto de evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arjun80892/q-Taxi-v3
- Curso Deep Reinforcement Learning de Hugging Face: https://huggingface.co/deep-rl-course
- Entorno Taxi-v3 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
