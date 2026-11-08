# AirrStorm/ql_Taxi_v4

## Resumen

ql_Taxi_v4 es un agente de aprendizaje por refuerzo entrenado mediante Q-Learning tabular para resolver el entorno Taxi-v3 de Gymnasium. Lo publica el usuario AirrStorm en Hugging Face y no es un modelo de lenguaje: no contiene una red neuronal transformer ni pesos en safetensors, sino una tabla Q serializada (presumiblemente en `q-learning.pkl`) que mapea pares estado-accion a valores de recompensa esperada. El repositorio ocupa 0.0 GB, lo que confirma que se trata de un artefacto de tamano despreciable.

El problema que resuelve es el clasico entorno Taxi-v3: un tablero de 5x5 con cuatro puntos de recogida y entrega, donde el agente debe recoger a un pasajero y dejarlo en su destino con el minimo numero de pasos. El espacio de estados es discreto y finito (500 estados), por lo que un enfoque tabular como Q-Learning es suficiente y no requiere aproximacion funcional.

Su relevancia es fundamentalmente educativa y de referencia: sirve como ejemplo minimo reproducible de un pipeline de RL (entrenamiento, evaluacion y publicacion en el Hub) y como baseline para comparar con variantes mas sofisticadas (DQN, PPO). No esta pensado para produccion ni para tareas de generacion de texto, codigo o vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-accion, sin red neuronal) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones como maximo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno discreto, sin contexto textual) |
| Tipos de cuantizacion | no aplica (artefacto pickle, no hay pesos en coma flotante que cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`), cargado via `load_from_hub` |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clasico, un algoritmo de diferencias temporales off-policy que actualiza la tabla Q mediante la regla de Bellman: Q(s,a) <- Q(s,a) + alpha * (r + gamma * max_a' Q(s',a') - Q(s,a)). El entorno Taxi-v3 tiene 500 estados discretos y 6 acciones (mover norte, sur, este, oeste, recoger pasajero, dejar pasajero), por lo que la tabla Q es de dimensiones manejables y converge con suficiente exploracion.

No se dispone de informacion sobre hiperparametros (tasa de aprendizaje alpha, factor de descuento gamma, politica de exploracion epsilon-greedy, numero de episodios), composicion del dataset (aqui el "dataset" es el propio entorno Taxi-v3) ni sobre si se aplicaron tecnicas adicionales como decodificacion especulativa o atencion lineal, que no tienen sentido en este contexto. La model card unicamente indica que se trata de un agente entrenado y muestra el snippet de carga.

## Capacidades

- Resolucion del entorno Taxi-v3: el agente aprende una politica que le permite recoger y entregar pasajeros en un tablero 5x5.
- Toma de decisiones discreta en 6 acciones posibles.
- No soporta tool calling ni function calling.
- No soporta agentes multi-step reasoning en el sentido de LLM; su "razonamiento" es la consulta a la tabla Q.
- No tiene capacidades multilingues.
- No dispone de modo thinking, vision ni audio.
- Capacidad unica: inferencia tabular sobre el espacio de estados de Taxi-v3.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo minimo para explicar Q-Learning tabular, la ecuacion de Bellman y la exploracion epsilon-greedy en un curso introductorio.
- Baseline de comparacion: servir como referencia de rendimiento para evaluar algoritmos mas complejos (DQN, PPO, A2C) sobre Taxi-v3 en experimentos academicos.
- Verificacion de pipelines de RL: comprobar que un flujo de entrenamiento, evaluacion y publicacion en el Hub funciona de extremo a extremo antes de escalar a entornos mas costosos.
- Pruebas de integracion con Gymnasium: validar la carga del artefacto `q-learning.pkl` y la recreacion del entorno con `gym.make(model["env_id"])` en tests automatizados.
- Reproducibilidad de experimentos: comparar la recompensa media declarada (7.56 +/- 2.71) con reentrenamientos propios para calibrar hiperparametros.
- Demostraciones educativas interactivas: integrar el agente en un notebook o demo web que visualice la politica aprendida sobre el tablero de Taxi-v3.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.56 +/- 2.71 | No |

No se han publicado otros resultados de benchmarks en la informacion disponible. El valor de recompensa media de 7.56 con desviacion de 2.71 sugiere un rendimiento moderado: en Taxi-v3 la recompensa optima ronda valores mas altos (entregas exitosas con penalizaciones por paso), por lo que este agente probablemente no ha convergido a la politica optima o la evaluacion incluye episodios fallidos.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula (el artefacto pickle ocupa 0.0 GB y la tabla Q es de tamano despreciable).
- GPU recomendadas: no aplica; la inferencia es una consulta a diccionario en CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU; no requiere aceleracion.
- Opciones de despliegue: Python con Gymnasium y la utilidad `load_from_hub` del ecosistema Hugging Face; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser una consulta tabular, la latencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AirrStorm/ql_Taxi_v4 | Q-Learning tabular | Taxi-v3 | 7.56 +/- 2.71 | no disponible | Hugging Face |
| rllearner/q-Taxi-v4 | Q-Learning tabular | Taxi-v3 | no disponible | no disponible | Hugging Face |
| Learnix-AI-Lab/q-Taxi-v4 | Q-Learning tabular | Taxi-v3 | no disponible | no disponible | Hugging Face |

Los dos modelos comparables encontrados en la busqueda web son agentes Q-Learning equivalentes sobre Taxi-v3, pero no se dispone de sus metricas ni de sus licencias en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni respuestas conversacionales; cualquier uso fuera de Taxi-v3 es invalido.
- La tabla Q esta sobreajustada al entorno Taxi-v3 con su configuracion por defecto; si se cambia `is_slippery` u otros parametros del entorno, el agente puede degradarse, como advierte la propia model card.
- La recompensa media declarada (7.56 +/- 2.71) no esta verificada y presenta alta varianza, lo que indica inestabilidad en la politica aprendida.
- Licencia no disponible: no se puede asumir permiso para uso comercial ni redistribucion sin consultar al autor.
- Riesgo de alucinacion no aplica, pero si de comportamiento suboptimo en estados poco visitados durante el entrenamiento.
- No hay informacion sobre sesgos, idiomas ni restricciones adicionales; al ser un agente tabular, estos conceptos no son directamente aplicables.
- El artefacto esta en formato pickle, lo que implica riesgos de seguridad al deserializar archivos de origen no verificado.

## Enlaces

- Hugging Face: https://huggingface.co/AirrStorm/ql_Taxi_v4
- Modelo comparable: https://huggingface.co/rllearner/q-Taxi-v4
- Modelo comparable: https://huggingface.co/Learnix-AI-Lab/q-Taxi-v4
