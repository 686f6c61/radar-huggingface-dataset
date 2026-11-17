# Asentia/q-Taxi-v

## Resumen

q-Taxi-v es un agente de aprendizaje por refuerzo entrenado con Q-learning tabular para resolver el entorno Taxi-v3 de Gymnasium. Lo publica el usuario Asentia en Hugging Face y no se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q serializada que mapea estados discretos del entorno a valores de accion. El problema que resuelve es el clasico de planificacion en un mundo rejilla: recoger y dejar pasajeros en una ciudad de 5x5 con cuatro paradas designadas, gestionando el trafico y las restricciones de recogida.

Es relevante como referencia pedagogica y como baseline reproducible para experimentos de RL: el entorno Taxi-v3 tiene 500 estados discretos y 6 acciones, por lo que un agente Q-learning converge rapido y permite comparar variantes de hiperparametros sin coste computacional significativo. El repositorio ocupa 0,0 GB y contiene un fichero `q-learning.pkl`; no hay pesos en safetensors ni GGUF porque no hay pesos neuronales.

La model card declara un rendimiento medio de recompensa de 7,48 +/- 2,75 sobre Taxi-v3, con metrica marcada como no verificada (`verified: false`). No hay informacion sobre licencia, idiomas ni arquitectura mas alla de la etiqueta `q-learning` y `custom-implementation`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q estado-accion), no disponible el detalle de implementacion |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones como maximo, sin confirmacion del autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica a una tabla Q; el artefacto es un `.pkl`) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |
| Entorno | Taxi-v3 (Gymnasium) |
| Pipeline declarado | reinforcement-learning |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es Q-learning clasico, un metodo de control off-policy sin modelo que aprende una funcion Q(s, a) mediante actualizaciones de diferencias temporales sobre pares (estado, accion, recompensa, siguiente estado). En Taxi-v3 el espacio de estados es discreto y finito (500 estados), de modo que la tabla Q cabe en memoria y no requiere aproximacion funcional ni redes neuronales. La etiqueta `custom-implementation` indica que el autor entreno el agente con una implementacion propia en lugar de un framework estandar como Stable-Baselines3 o CleanRL.

No se dispone de informacion sobre el numero de episodios de entrenamiento, la politica de exploracion (epsilon-greedy u otra), la tasa de aprendizaje, el factor de descuento ni la composicion del dataset, porque Taxi-v3 genera transiciones mediante interaccion con el entorno y no a partir de un corpus. Tampoco consta si se aplicaron tecnicas como Double Q-learning, experience replay o decodificacion especulativa; esta ultima no tiene sentido en este contexto. El unico artefacto publicado es el fichero pickle de la tabla Q.

## Capacidades

- Resolucion del entorno Taxi-v3: recogida y entrega de pasajeros en una rejilla 5x5 con cuatro paradas y gestion de la posicion del taxi.
- Politica determinista derivada de la tabla Q: para cada estado discreto selecciona la accion con mayor valor Q aprendido.
- Ejecucion ligera: la inferencia consiste en una consulta a diccionario o array, sin coste de GPU.
- Reproducibilidad mediante `load_from_hub` con el fichero `q-learning.pkl`.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle del entorno Taxi-v3.
- No tiene capacidades multilingues, de vision, audio ni modo de razonamiento explicito.
- No genera texto ni codigo.

## Casos de uso

- Baseline de referencia en experimentos de RL: sirve como punto de comparacion para variantes de Q-learning (Double Q, SARSA, Q con redes profundas) sobre el mismo entorno Taxi-v3, gracias a que el resultado declarado (7,48 +/- 2,75) es reproducible con la semilla adecuada.
- Docencia y tutoriales: el agente permite ilustrar la convergencia de Q-learning tabular en un entorno con estados finitos y mostrar como la tabla Q se estabiliza tras suficientes episodios.
- Pruebas de infraestructura de evaluacion: al no requerir GPU, se puede usar para validar pipelines de `evaluate` de Hugging Face o de Gymnasium sin consumir recursos de computo.
- Comparacion de hiperparametros: al ser un artefacto pequeno y de carga instantanea, facilita barridos de epsilon, alpha y gamma en entornos discretos.
- Demostracion de despliegue de agentes RL en Hugging Face Hub: ejemplifica el flujo `load_from_hub` y el formato de model card con `model-index`.
- Integracion en entornos de simulacion discretos: puede adaptarse como politica de referencia en juegos de rejilla o problemas de planificacion con espacios de estados pequenos, siempre que se redefina la tabla Q.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (metrica no verificada):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,48 +/- 2,75 |

No se han publicado otros resultados de benchmarks en la informacion disponible. El valor de recompensa media debe interpretarse con cautela porque la metrica figura como `verified: false` y no se especifica el numero de episodios de evaluacion ni la semilla utilizada.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; la tabla Q es un artefacto de unos kilobytes y se ejecuta en CPU.
- GPU recomendadas: no aplica; cualquier CPU convencional es suficiente.
- Cabe en cualquier GPU consumer, pero no la necesita; tambien funciona en entornos sin GPU.
- Opciones de despliegue: carga directa del pickle con `load_from_hub` y `gym.make`; no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; la consulta a la tabla Q es de orden O(1) por paso, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Asentia/q-Taxi-v | Q-learning tabular | Taxi-v3 | 7,48 +/- 2,75 (no verificada) | no disponible | Hugging Face Hub |
| Agentes Q-learning de Stable-Baselines3 | Q-learning / DQN | Taxi-v3 | no disponible en esta ficha | MIT (SB3) | GitHub / PyPI |
| Agentes CleanRL | Q-learning / DQN | Taxi-v3 | no disponible en esta ficha | MIT (CleanRL) | GitHub |

No se dispone de resultados comparables publicados para alternativas concretas en la informacion proporcionada; la comparativa anterior se limita a frameworks de referencia y no a artefactos entrenados equivalentes.

## Limitaciones y advertencias

- La metrica de recompensa esta marcada como no verificada; no hay evidencia independiente de que el agente alcance 7,48 de media.
- No se especifican hiperparametros, semilla ni numero de episodios de entrenamiento, lo que dificulta la reproduccion exacta.
- La tabla Q solo es valida para Taxi-v3 con la configuracion por defecto; si se usa `is_slippery` distinto o se modifica el entorno, la politica deja de ser fiable.
- El artefacto es un pickle de Python: cargarlo de fuentes no confiables implica riesgo de ejecucion de codigo arbitrario.
- No hay licencia declarada, por lo que el uso comercial no esta autorizado de forma explicita.
- No hay informacion sobre sesgos porque el entorno es sintetico y no contiene datos humanos.
- No es un modelo de lenguaje: no puede usarse para generacion de texto, codigo, vision ni tareas de NLP.
- No hay garantias de robustez fuera de la distribucion de estados vista durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Asentia/q-Taxi-v
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de `load_from_hub` (Hugging Face Hub): https://huggingface.co/docs/huggingface_hub
- Stable-Baselines3 (referencia de RL): https://github.com/DLR-RM/stable-baselines3
- CleanRL (referencia de RL): https://github.com/vwxyzjn/cleanrl
