# Ebishj/taxi-v3advanced-Q-learning

## Resumen

`Ebishj/taxi-v3advanced-Q-learning` no es un modelo de lenguaje ni una red neuronal: es un agente de Q-learning tabular entrenado para resolver el entorno `Taxi-v3` de Gymnasium. El artefacto publicado consiste en una tabla Q de 500 estados por 6 acciones (3000 entradas) almacenada como array NumPy (`qtable_taxi.npy`), acompanada del notebook de entrenamiento y evaluacion (`q_learning_taxi_v3.ipynb`) y un video de una partida (`replay.mp4`). Lo firma el usuario Ebishj y se enmarca explicitamente en la unidad 2 del curso Deep RL de Hugging Face.

El problema que resuelve es el clasico problema de recogida y entrega de pasajeros en una rejilla 5x5 con 4 ubicaciones de recogida/entrega, donde el agente debe aprender una politica optima mediante interaccion y refuerzo. El autor reporta una recompensa media de 8,20 +/- 2,39 sobre 200 episodios de test desde estados iniciales aleatorios.

Su relevancia es formativa y de referencia: sirve como ejemplo minimo reproducible de Q-learning tabular, como baseline de comparacion para algoritmos de RL profundo y como pieza de docencia o de test de pipelines. No debe evaluarse con los criterios habituales de un LLM (contexto, cuantizacion, licencia de pesos, VRAM) porque ninguna de esas dimensiones aplica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla de valores Q; sin red neuronal) |
| Parametros totales | 3000 entradas (500 estados x 6 acciones) en `qtable_taxi.npy` |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: el estado es un entero de 0 a 499; no hay secuencia de entrada |
| Tipos de cuantizacion | No disponible (el array se guarda como `.npy`; el `dtype` no se documenta en la model card) |
| Idiomas soportados | No aplica: no procesa lenguaje natural |
| Licencia | No disponible |
| Formato de pesos | `.npy` (NumPy); el repo incluye ademas `.ipynb` y `.mp4` |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular, un metodo de diferencias temporales, model-free y off-policy. El agente mantiene una tabla `Q[estado, accion]` de 500 x 6 valores y selecciona la accion con `argmax` sobre la fila del estado actual. No hay funcion de aproximacion, ni embeddings, ni capas: la "capacidad" del agente es exactamente la del espacio de estados discreto de `Taxi-v3`, lo que garantiza convergencia en el limite pero imposibilita cualquier generalizacion a estados no vistos o a otros entornos.

La model card no documenta los hiperparametros de entrenamiento (tasa de aprendizaje alfa, factor de descuento gamma, politica epsilon-greedy, numero de episodios ni semilla), ni el numero total de pasos de interaccion con el entorno. Si se indica el origen pedagogico (unidad 2 del curso Deep RL de Hugging Face) y el resultado de evaluacion: recompensa media de 8,20 con desviacion tipica de 2,39 en 200 episodios de test con reinicio aleatorio.

## Capacidades

- Resolucion del entorno `Taxi-v3` de Gymnasium: recoger al pasajero y dejarlo en el destino con la politica aprendida.
- Seleccion de accion determinista por `argmax` de la tabla Q, con coste computacional despreciable (una indexacion y un `argmax` sobre 6 valores).
- Inspeccion de la tabla Q completa: al estar publicada, permite analizar valores de estado-accion, extraer la politica greedy implicita y estudiar el aprendizaje.
- Reproduccion del entrenamiento y de la evaluacion mediante el notebook incluido.
- Visualizacion cualitativa del comportamiento en `replay.mp4`.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de LLM; el unico "razonamiento" es la descomposicion episodica del MDP.
- Capacidades multilingues: no aplica.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Docencia de RL tabular: usar la tabla y el notebook como material de clase para explicar diferencias temporales, exploracion/explotacion y convergencia de la funcion de valor, con un ejemplo que se ejecuta en CPU en segundos.
- Baseline de comparacion: fijar la recompensa media reportada (8,20 +/- 2,39) como referencia al evaluar DQN, PPO o SARSA sobre el mismo entorno, garantizando que las condiciones de evaluacion (200 episodios, reinicio aleatorio) son reproducibles.
- Test de integracion de pipelines de RL: el agente es un oraculo barato y determinista para verificar wrappers de entorno, logging de recompensas, serializacion de politicas y versionado de dependencias.
- Validacion de fijado de versiones: la model card advierte de que `gymnasium` 1.2.3 es necesario porque versiones posteriores ya no incluyen `Taxi-v3`, lo que convierte el repo en un caso de prueba util para matrices de compatibilidad de dependencias.
- Analisis de la funcion de valor: cargar `qtable_taxi.npy` y visualizar el valor esperado por estado para estudiar la estructura del MDP (coste por paso negativo, primas por entrega) y detectar estados con politica ambigua.
- Demos interactivas y visualizaciones: generar GIFs o videos de episodios greedy para articulos, tutoriales o charlas introductorias a RL sin dependencia de GPU.
- Agente embebido en entornos de simulacion ligera: en prototipos donde el espacio de estados es discreto y pequeno, la tabla puede incrustarse como fichero de recursos y consultarse en microsegundos sin infraestructura de inferencia.

## Benchmarks y rendimiento

| Metrica | Valor reportado | Entorno de evaluacion |
|---|---|---|
| Recompensa media | 8,20 | 200 episodios de test, reinicios aleatorios |
| Desviacion tipica de la recompensa | 2,39 | 200 episodios de test, reinicios aleatorios |

No se han publicado en la informacion disponible resultados comparativos con otros agentes sobre `Taxi-v3` (SARSA, DQN, PPO), ni curvas de aprendizaje en forma de tabla, ni numero de episodios de entrenamiento hasta convergencia.

## Requisitos de hardware

- VRAM para inferencia: no aplica; la politica es una consulta a un array NumPy. La tabla de 3000 entradas ocupa del orden de decenas de kilobytes en memoria.
- GPU recomendadas: ninguna. El agente se ejecuta integramente en CPU.
- Cabe en cualquier GPU de consumo: si, y tambien en cualquier CPU y en entornos sin acelerador, incluidos contenedores de CI y Raspberry Pi.
- Opciones de despliegue: Python con `numpy`, `huggingface_hub` (para `hf_hub_download`) y `gymnasium==1.2.3` para instanciar el entorno. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a redes neuronales.
- Latencia y throughput: no documentados numericamente; por la naturaleza de la operacion (`argmax` sobre 6 valores) la latencia por decision es del orden de microsegundos y el cuello de botella real es el `step` del entorno de Gymnasium.

## Comparativa con modelos similares

| Modelo / familia | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este agente (Q-learning tabular, `Taxi-v3`) | 3000 entradas (500 x 6) | No aplica (estado discreto) | 8,20 +/- 2,39 de recompensa media en 200 episodios | No disponible | Repo publico en Hugging Face, 0 descargas |
| SARSA tabular sobre `Taxi-v3` | Tabla de igual dimension (500 x 6) | No aplica | No disponible | No aplica (algoritmo) | Implementable, sin artefacto comparable identificado |
| DQN sobre `Taxi-v3` | Red neuronal, tamano dependiente de la implementacion | No aplica | No disponible | No disponible | Implementable, sin artefacto comparable identificado |
| PPO sobre `Taxi-v3` | Red neuronal actor-critica | No aplica | No disponible | No disponible | Implementable (Stable-Baselines3, CleanRL), sin resultados reportados aqui |

No se dispone de datos publicados en la informacion proporcionada para comparar numericamente con alternativas. La comparacion anterior es estructural (familia de algoritmo, forma del artefacto), no de rendimiento.

## Limitaciones y advertencias

- Especificidad total al entorno: la tabla solo es valida para los 500 estados de `Taxi-v3`. Cualquier modificacion del entorno (otra rejilla, otros obstaculos, otra accion) invalida el artefacto por completo.
- Ausencia de generalizacion: al ser tabular, no hay funcion de aproximacion; no puede interpolar ni transferir conocimiento a estados o tareas nuevas.
- Dependencia de version critica: la model card advierte de que `gymnasium` 1.2.3 es necesario porque versiones mas recientes han retirado `Taxi-v3`; sin ese fijado el codigo de ejemplo falla.
- Inconsistencia en el identificador: el `repo_id` del ejemplo (`Ebishj/taxi-v3-q-learning`) no coincide con el identificador del repositorio (`Ebishj/taxi-v3advanced-Q-learning`), lo que puede provocar errores de descarga si se copia el snippet tal cual.
- Metadatos incompletos: sin licencia declarada, lo que impide determinar si el uso comercial esta permitido; sin idiomas, sin pipeline de inferencia estandar y sin `dtype` documentado de la tabla.
- Madurez y trazabilidad: 0 descargas y 0 likes, repo de 0,0 GB segun metadatos pese a contener varios ficheros, y ventana de creacion/actualizacion de unos 11 minutos; no hay historial de versiones ni validacion externa del resultado reportado.
- Hiperparametros y semillas no documentados: la recompensa de 8,20 +/- 2,39 no es reproducible de forma exacta sin conocer la semilla, la politica epsilon final y el criterio de corte de episodios.
- Varianza alta en el resultado: una desviacion tipica de 2,39 sobre una media de 8,20 indica una dispersion considerable; no conviene tratar el valor medio como garantia de comportamiento optimo en todos los estados iniciales.
- Sin capacidades de lenguaje, vision ni audio: no es adecuado para ninguna tarea de NLP, generacion de codigo ni atencion al cliente, pese a que el repositorio este alojado en Hugging Face junto a modelos de ese tipo.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe riesgo de sobreinterpretar el resultado como "agente resuelto"; la tabla no incluye informacion sobre estados con politica suboptima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ebishj/taxi-v3advanced-Q-learning
- Entorno `Taxi-v3` (documentacion de Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Curso Deep RL de Hugging Face, unidad 2 (origen del ejercicio): https://huggingface.co/learn/deep-rl-course/en/unit2/hands-on
