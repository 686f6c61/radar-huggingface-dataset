# adriancsanchez/q-learning-Taxi-v3

## Resumen

`adriancsanchez/q-learning-Taxi-v3` es un agente de aprendizaje por refuerzo entrenado con el algoritmo tabular Q-Learning sobre el entorno `Taxi-v4` de Gymnasium. Lo publica el usuario adriancsanchez en Hugging Face y no es un modelo de lenguaje: es una tabla Q serializada en formato pickle que se carga mediante el helper `load_from_hub` del ecosistema de Hugging Face para RL. El repositorio tiene un tamano practicamente nulo (0.0 GB), coherente con un espacio de estados discreto y pequeno como el de Taxi.

Taxi-v4 es un entorno clasico de juguete: un grid de 5x5 con cuatro paradas, un pasajero y un destino, con 500 estados discretos y 6 acciones posibles. El agente aprende una politica que maximiza la recompensa acumulada (entregar al pasajero en la parada correcta con el minimo de pasos). El interes de esta ficha no esta en el rendimiento bruto, sino en que sirve como ejemplo minimo reproducible de un pipeline de RL con Q-Learning y como referencia didactica para validar infraestructura de entrenamiento y publicacion en el Hub.

No se dispone de informacion sobre arquitectura neuronal, parametros, contexto ni idiomas porque el artefacto no es una red neuronal ni un modelo generativo. Los datos de la model card son escasos: unicamente el identificador del entorno, el algoritmo y una metrica de recompensa media declarada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q sobre espacio de estados discreto) |
| Parametros totales | no disponible (no es una red neuronal; tabla Q de 500 estados x 6 acciones en Taxi-v4) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno MDP discreto, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en pickle, no cuantizables como un transformer) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clasico, un metodo de diferencias temporales off-policy que actualiza la tabla Q mediante la regla de Bellman con una tasa de aprendizaje y un factor de descuento. No hay red neuronal, ni funcion de aproximacion, ni fases de preentrenamiento o RLHF: la "arquitectura" es una tabla de valores indexada por el par (estado, accion) del entorno `Taxi-v4`. El espacio de estados de Taxi-v4 es de 500 estados y el de acciones de 6, por lo que la tabla Q tiene como maximo 3000 entradas, lo que explica el tamano despreciable del repositorio.

No se especifican en la informacion disponible los hiperparametros de entrenamiento (alpha, gamma, epsilon, numero de episodios, politica de exploracion) ni la composicion del dataset, porque en RL tabular no hay dataset: el agente interactua con el simulador del entorno. Tampoco se documenta si se uso decaimiento de epsilon, inicializacion optimista u otras variantes. La model card solo indica que es un agente entrenado de Q-Learning para Taxi-v4 y muestra un snippet de carga.

## Capacidades

- Resolucion del entorno `Taxi-v4`: seleccionar acciones (moverse norte, sur, este, oeste, recoger pasajero, dejar pasajero) para completar episodios.
- Politica greedy derivada de la tabla Q aprendida, sin capacidad de generalizacion a estados no vistos.
- Carga reproducible via `load_from_hub` con el fichero `q-learning.pkl`.
- Integracion con Gymnasium mediante `gym.make(model["env_id"])`.
- No soporta tool calling, function calling, agentes multi-paso fuera del MDP, ni razonamiento simbolico.
- No tiene capacidades multilingues, vision, audio ni modo thinking.
- No es un modelo generativo: no produce texto ni codigo.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo minimo de Q-Learning tabular para explicar la ecuacion de Bellman, la exploracion epsilon-greedy y la convergencia de la tabla Q en un entorno de 500 estados.
- Validacion de pipelines de RL: probar de extremo a extremo el flujo de entrenamiento, serializacion en pickle y publicacion en Hugging Face Hub con un artefacto de tamano despreciable.
- Baseline de referencia: comparar algoritmos mas avanzados (DQN, PPO, SARSA) contra este agente tabular en Taxi-v4 para medir la brecha entre metodos tabulares y aproximaciones neuronales.
- Test de integracion de Gymnasium: verificar que la version del entorno `Taxi-v4` y la API de carga funcionan correctamente en un entorno de CI antes de escalar a entornos mas complejos.
- Reproduccion de experimentos: servir como semilla o punto de partida para estudiar la sensibilidad de Q-Learning a hiperparametros en un entorno deterministico y barato de evaluar.
- Demostracion educativa interactiva: integrar el agente en un notebook o demo web que visualice la politica aprendida sobre el grid de Taxi-v4 sin requerir GPU ni infraestructura de inferencia.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset/entorno | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.54 +/- 2.72 |

No se han publicado en la informacion disponible resultados comparativos con otros agentes (DQN, SARSA, PPO) ni curvas de aprendizaje, numero de episodios hasta convergencia o tasa de exito. La recompensa media de 7.54 con desviacion tipica de 2.72 es coherente con un agente que completa la mayoria de episodios de Taxi-v4 con penalizaciones por pasos, pero no se puede contrastar sin los detalles de evaluacion (numero de episodios, politica usada en test, semilla).

## Requisitos de hardware

- VRAM: no requiere GPU. La inferencia es una consulta a una tabla en memoria de unos pocos kilobytes.
- CPU: cualquier CPU moderna es suficiente; el cuello de botella es el simulador de Gymnasium, no el agente.
- GPU recomendadas: ninguna. No aplica CUDA.
- Cabe en cualquier consumer GPU y tambien en entornos sin GPU (Raspberry Pi, contenedores ligeros).
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, que estan pensados para transformers. El despliegue se hace cargando el pickle con `load_from_hub` y ejecutando el bucle de interaccion con Gymnasium.
- Latencia y throughput: no disponibles de forma oficial; en la practica, la seleccion de accion es una operacion O(1) sobre la tabla y el coste dominante es el step del entorno.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| adriancsanchez/q-learning-Taxi-v3 | Q-Learning tabular | Taxi-v4 | tabla Q de 500x6 | no aplica | no disponible | Hugging Face |
| Agentes DQN para Taxi-v4 | Deep Q-Network | Taxi-v4 | red pequena (MLP) | no aplica | variable segun autor | repositorios de RL |
| Agentes PPO para Taxi-v4 | PPO | Taxi-v4 | red pequena (MLP) | no aplica | variable segun autor | repositorios de RL |
| Agentes tabulares SARSA | SARSA | Taxi-v4 | tabla Q de 500x6 | no aplica | variable segun autor | repositorios de RL |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada, por lo que la comparativa se limita a categoria y naturaleza del artefacto. Para Taxi-v4, un agente tabular bien entrenado suele igualar o superar a aproximaciones neuronales por la naturaleza discreta y pequena del espacio de estados, pero no hay cifras verificables en esta ficha.

## Limitaciones y advertencias

- No generaliza: la tabla Q solo cubre los 500 estados de Taxi-v4; cualquier cambio de entorno o de configuracion (por ejemplo, `is_slippery`) invalida la politica.
- Sin licencia declarada: no se puede asumir uso comercial ni redistribucion sin consultar al autor.
- Metrica no verificada: el `mean_reward` de 7.54 +/- 2.72 esta marcado como `verified: false` y no se documenta el protocolo de evaluacion.
- Sin documentacion de hiperparametros ni de proceso de entrenamiento: la reproducibilidad es limitada.
- Formato pickle: cargar ficheros pickle de origen no confiable es un riesgo de seguridad; conviene auditar o reentrenar antes de usarlo en produccion.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de NLP ni desplegarse con servidores de inferencia para transformers.
- Sin soporte de idiomas, contexto largo, vision ni audio; fuera de su entorno no tiene ninguna utilidad.
- Nombre del repo (`Taxi-v3`) y entorno real (`Taxi-v4`) no coinciden, lo que puede generar confusion en integraciones automatizadas.

## Enlaces

- Hugging Face: https://huggingface.co/adriancsanchez/q-learning-Taxi-v3
- Entorno Taxi-v4 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de Hugging Face para RL: https://huggingface.co/docs/hub/en/models
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
