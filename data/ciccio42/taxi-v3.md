# ciccio42/Taxi-v3

## Resumen

`ciccio42/Taxi-v3` es un agente de aprendizaje por refuerzo entrenado con Q-learning tabular sobre el entorno Taxi-v3 de Gym/Gymnasium. Lo publica el usuario de HuggingFace ciccio42 (Francesco Rosa) y no es un modelo de lenguaje: es un artefacto de politica entrenada, almacenado como un fichero `q-learning.pkl` que contiene la tabla Q y el identificador del entorno. Su publicacion responde al flujo habitual de las librerias de RL (por ejemplo, las utilidades de subida de modelos de Stable-Baselines3), que empaquetan agentes entrenados para poder recargarlos y evaluarlos.

El modelo no tiene parametros de red neuronal, ni capas, ni tokenizador. La "arquitectura" es una tabla Q que mapea pares estado-accion a valores de recompensa esperada, actualizada de forma iterativa mediante la ecuacion de Bellman durante el entrenamiento. El repositorio ocupa 0.0 GB, lo que confirma que el artefacto es de tamano minimo, coherente con un espacio de estados discreto y pequeno como el de Taxi-v3.

La relevancia de esta ficha es acotada y conviene enmarcarla bien: se trata de un ejemplo docente o de un punto de partida reproducible para experimentar con RL tabular, no de un componente para produccion ni de un modelo comparable a un LLM. Su unico resultado declarado es una recompensa media de 7.56 +/- 2.71 en Taxi-v3, marcado como no verificado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q estado-accion, sin red neuronal) |
| Parametros totales | no aplicable (no hay parametros de red neuronal; el artefacto es una tabla Q) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (entorno de estados discretos, no hay contexto textual) |
| Tipos de cuantizacion | no aplicable (no hay pesos que cuantizar) |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | fichero Pickle (`q-learning.pkl`) con la tabla Q y el `env_id` |
| Entorno de entrenamiento | Taxi-v3 (Gym/Gymnasium) |
| Tarea declarada | reinforcement-learning |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La politica es una implementacion propia de Q-learning tabular. El agente mantiene una tabla Q indexada por estado discreto y accion discreta, y la actualiza aplicando la regla de diferencias temporales de un paso: Q(s,a) <- Q(s,a) + alfa * [r + gamma * max Q(s',a') - Q(s,a)]. No hay aproximacion de funcion, ni red neuronal, ni generalizacion entre estados: cada estado del entorno tiene sus propios valores, por lo que el aprendizaje converge a una politica optima para ese entorno concreto y no se transfiere a otros.

La model card no documenta hiperparametros (tasa de aprendizaje, factor de descuento, epsilon de exploracion, numero de episodios, semilla), ni la composicion de episodios de entrenamiento, ni si se uso decaimiento de epsilon. Tampoco indica la version exacta de Gym/Gymnasium ni si el entorno se ejecuto con `is_slippery` u otras variantes; la propia model card avisa de que hay que comprobar si es necesario anadir atributos adicionales al crear el entorno. No consta uso de RLHF, DPO ni tecnicas de ajuste fino, que no aplican a este tipo de agente.

## Capacidades

- Resolucion del entorno Taxi-v3: recoger un pasajero en una de las paradas y dejarlo en el destino indicado dentro del entorno discreto.
- Politica greedy derivada de la tabla Q: dado un estado, selecciona la accion de mayor valor aprendido.
- Aprendizaje tabular sin generalizacion: solo cubre los estados observados del entorno Taxi-v3.
- Recarga mediante `load_from_hub`: el artefacto esta pensado para cargarse con las utilidades de HuggingFace para modelos de RL.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificacion fuera del MDP de Taxi-v3.
- No tiene capacidades multilingues.
- No tiene modo thinking, vision ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo minimo y funcional de Q-learning tabular para explicar la ecuacion de Bellman, la exploracion frente a la explotacion y la convergencia de la tabla Q en un entorno de espacio de estados pequeno.
- Baseline en experimentos de RL: permite comparar algoritmos de RL profundo (DQN, PPO) contra un agente tabular de referencia sobre el mismo entorno, aislando el efecto de la aproximacion de funcion.
- Verificacion de pipelines de carga de modelos: util para comprobar que el flujo `load_from_hub` + `gym.make(model["env_id"])` funciona correctamente en una instalacion concreta antes de desplegar agentes mas grandes.
- Pruebas de integracion con librerias de RL: sirve para validar wrappers de entornos, envoltorios de monitorizacion y utilidades de evaluacion sin coste computacional apreciable.
- Reproduccion de resultados de referencia: al declarar una recompensa media concreta, permite intentar reproducir el mismo valor en una maquina distinta y detectar diferencias por versiones de Gym o por semillas.
- Material de practicas en cursos de IA: dado su tamano minimo y su licencia sin restricciones conocidas, es adecuado para que el alumnado lo inspeccione, modifique los hiperparametros y reentrene desde cero.
- Demostracion de despliegue de agentes en CPU: por su naturaleza tabular, se puede ejecutar en cualquier maquina sin GPU, lo que resulta util para pruebas de latencia de sistemas de decision en entornos embebidos.

## Benchmarks y rendimiento

Resultado declarado por el autor en el `model-index` de la model card. No esta verificado (`verified: false`) y no se aportan curvas de aprendizaje ni intervalos de confianza mas alla de la desviacion tipica indicada.

| Tarea | Dataset / entorno | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.56 +/- 2.71 |

No se han publicado en la informacion disponible resultados adicionales ni comparaciones con otros agentes sobre el mismo entorno. Tampoco se documentan el numero de episodios de evaluacion usados para calcular esa media ni la politica de seleccion de acciones durante la evaluacion (greedy o con exploracion).

## Requisitos de hardware

- VRAM para inferencia: no aplicable. El artefacto es una tabla Q en un fichero Pickle y se ejecuta enteramente en CPU.
- GPU recomendadas: ninguna. No se requiere GPU para cargar ni para ejecutar el agente.
- Compatibilidad con GPU de consumo: irrelevante; cualquier CPU moderna es suficiente.
- Espacio en disco: minimo (repositorio de 0.0 GB declarado).
- Opciones de despliegue: Python con Gym/Gymnasium y las utilidades de HuggingFace para cargar el modelo; no aplican vLLM, llama.cpp, Ollama ni TGI porque no hay pesos de transformer que servir.
- Latencia y throughput: no disponibles; dependen del bucle de simulacion del entorno Taxi-v3 mas que del modelo en si.
- Dependencias relevantes: version de Gym/Gymnasium compatible con el `env_id` guardado y, segun la model card, posible necesidad de anadir atributos como `is_slippery`.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Metrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ciccio42/Taxi-v3 | Taxi-v3 | Q-learning tabular | mean_reward 7.56 +/- 2.71 | no disponible | HuggingFace |
| ciccioz/Taxi-v3 | Taxi-v3 | Q-learning | no disponible | no disponible | HuggingFace |
| peter-z3ng/csci323-drive-a-taxi | Taxi-v3 | Q-learning (proyecto en Python) | no disponible | no disponible | GitHub |
| Notebooks de Q-learning con Taxi-v3 (por ejemplo, el gist de simoninithomas) | Taxi-v3 | Q-learning | no disponible | no disponible | Google Colab |

La comparacion es limitada: los artefactos alternativos encontrados no publican metricas comparables en la informacion disponible, por lo que no es posible establecer una jerarquia de rendimiento entre ellos.

## Limitaciones y advertencias

- Ambito reducido: el agente solo es valido para Taxi-v3. No generaliza a otros entornos ni a variaciones del propio entorno.
- Sin red neuronal: no hay transferencia de aprendizaje, representaciones latentes ni capacidad de adaptacion a estados nuevos.
- Metricas no verificadas: el unico resultado disponible esta marcado como `verified: false` y no se detallan los episodios de evaluacion.
- Falta de reproducibilidad: no se documentan hiperparametros, semillas, numero de episodios de entrenamiento ni versiones de las dependencias.
- Licencia no especificada: al no constar licencia, no hay autorizacion explicita para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier uso fuera del ambito personal o academico.
- Riesgo de deserializacion insegura: el formato Pickle puede ejecutar codigo arbitrario al cargarse. Cargar unicamente ficheros de fuentes de confianza y, preferiblemente, en un entorno aislado.
- Dependencia del entorno: si el `env_id` guardado o los atributos del entorno (por ejemplo, `is_slippery`) no coinciden con la version instalada de Gym/Gymnasium, la politica puede comportarse de forma incorrecta.
- Cero traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Sin soporte de lenguaje, vision ni audio: no debe considerarse un sustituto de un modelo de lenguaje en ninguna tarea de generacion o comprension de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ciccio42/Taxi-v3
- Perfil del autor: https://huggingface.co/ciccio42
- Modelo similar de otro usuario: https://huggingface.co/ciccioz/Taxi-v3
- Notebook de Q-learning con Taxi-v3 (Colab): https://colab.research.google.com/gist/simoninithomas/466c81aa1c2a07dd14793240c6d033c5/q-learning-with-taxi-v3.ipynb
- Notebook de TD de n pasos con Taxi-v3 (Colab): https://colab.research.google.com/github/Fortuz/rl_education/blob/main/6.%20n-step%20TD/taxi.ipynb
- Proyecto de Q-learning en Taxi-v3 (GitHub): https://github.com/peter-z3ng/csci323-drive-a-taxi
