# Cameron2day/Taxi-v4

## Resumen

Taxi-v4 es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular sobre el entorno Taxi-v3 de Gymnasium, publicado por el usuario Cameron2day en Hugging Face. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q serializada en formato pickle que asigna valores de accion a cada par estado-accion del entorno Taxi-v3, un problema clasico de planificacion con 500 estados discretos y 6 acciones posibles.

El problema que resuelve es el tipico benchmark de RL: un taxi debe recoger a un pasajero en una de cuatro ubicaciones y dejarlo en su destino, con recompensas de -1 por paso, -10 por recogidas o entregas ilegales y +20 por entrega correcta. El resultado declarado por el autor es una recompensa media de 7.56 +/- 2.71, un valor bajo en comparacion con el optimo del entorno (alrededor de 8-9 en politica casi optima, con episodios de hasta 15-20 pasos penalizados), lo que sugiere una politica funcional pero no convergida al maximo.

Su relevancia es limitada fuera del ambito docente y de prototipado: sirve como ejemplo minimo de pipeline de RL con `stable-baselines3` y `huggingface_sb3`, y como referencia para comparar implementaciones de Q-Learning en entornos discretos. No es adecuado para tareas de generacion de texto, codigo o vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-accion) |
| Parametros totales | no disponible (tabla de 500 estados x 6 acciones como maximo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno discreto de 500 estados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es una tabla Q clasica: para cada estado del entorno Taxi-v3 (500 estados discretos) se almacena un vector de 6 valores Q, uno por accion (moverse al norte, sur, este, oeste, recoger pasajero, dejar pasajero). La actualizacion sigue la ecuacion de Bellman con tasa de aprendizaje y factor de descuento, y la politica resultante es epsilon-greedy en entrenamiento y greedy en inferencia. No hay red neuronal, ni funcion de aproximacion, ni procesamiento de lenguaje.

Los detalles de entrenamiento (numero de episodios, hiperparametros como alpha, gamma y epsilon, y la semilla) no estan documentados en la model card. El autor indica que el agente fue entrenado con `stable-baselines3` y exportado con `huggingface_sb3`, y advierte que al cargar el modelo conviene comprobar atributos del entorno como `is_slippery=False`. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Resolucion del entorno Taxi-v3: recoger y entregar pasajeros en un grid 5x5 con cuatro ubicaciones y destinos.
- Politica discreta determinista: dado un estado entero, devuelve una accion entera entre 0 y 5.
- Integracion con Gymnasium mediante `gym.make(model["env_id"])`.
- Carga via `load_from_hub` de `huggingface_sb3`.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle episodico del entorno.
- No tiene capacidades multilingues.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Docencia de RL: usar el agente como ejemplo minimo de Q-Learning tabular para explicar la ecuacion de Bellman y la exploracion epsilon-greedy en un curso introductorio.
- Baseline de comparacion: servir de referencia inferior frente a agentes DQN o PPO en Taxi-v3 para medir la mejora de metodos con aproximacion de funcion.
- Pruebas de integracion de `huggingface_sb3`: validar el pipeline `load_from_hub` + `gym.make` en un entorno controlado y reproducible.
- Prototipado de entornos personalizados: reutilizar la estructura de tabla Q como plantilla para entornos discretos de menor tamano.
- Demostraciones de evaluacion de politicas: calcular recompensa media y varianza sobre N episodios para ilustrar la varianza de una politica no convergida.
- Reproduccion de experimentos: comparar hiperparametros de Q-Learning (alpha, gamma, epsilon) contra este agente publicado como punto de partida.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Dataset | Valor |
|---|---|---|
| mean_reward | Taxi-v3 | 7.56 +/- 2.71 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la tabla Q cabe en memoria RAM (unos pocos kilobytes).
- GPU recomendadas: no aplica; puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer y en CPU de gama baja, incluso en Raspberry Pi.
- Despliegue: script Python con `gymnasium` y `huggingface_sb3`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; al ser una consulta a tabla, la latencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Taxi-v4 (Cameron2day) | Q-Learning tabular | Taxi-v3 | 7.56 +/- 2.71 | no disponible | Hugging Face |
| Agentes DQN en Taxi-v3 | Red neuronal profunda | Taxi-v3 | no disponible | variable | repositorios SB3 |
| Agentes PPO en Taxi-v3 | Policy gradient | Taxi-v3 | no disponible | variable | repositorios SB3 |

No se dispone de datos publicados de recompensa media para las alternativas en la informacion proporcionada; la comparativa se limita al tipo de algoritmo y al entorno.

## Limitaciones y advertencias

- Recompensa media de 7.56 +/- 2.71, por debajo de una politica casi optima en Taxi-v3; la varianza alta indica episodios con recogidas o entregas ilegales.
- No generaliza fuera de Taxi-v3: la tabla Q esta indexada a los 500 estados de ese entorno concreto.
- Sensible a la configuracion del entorno: si se activa `is_slippery=True` o se modifica el grid, la politica deja de ser valida.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Riesgo de alucinacion no aplica (no genera texto), pero si de sobreajuste al entorno de entrenamiento.
- El formato pickle puede presentar riesgos de seguridad al deserializar archivos de origen no verificado.
- No apto para produccion en tareas de NLP, vision o generacion; su uso es exclusivamente educativo o de investigacion en RL discreto.

## Enlaces

- Hugging Face: https://huggingface.co/Cameron2day/Taxi-v4
- Documentacion de Gymnasium Taxi: https://gymnasium.farama.org/environments/toy_text/taxi/
- `huggingface_sb3`: https://github.com/huggingface/huggingface_sb3
- `stable-baselines3`: https://github.com/DLR-RM/stable-baselines3
