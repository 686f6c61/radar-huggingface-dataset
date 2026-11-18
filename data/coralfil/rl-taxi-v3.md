# Coralfil/rl-taxi-v3

## Resumen

`Coralfil/rl-taxi-v3` es un agente de aprendizaje por refuerzo entrenado con Q-learning sobre el entorno Taxi-v3 de Gymnasium, el clasico problema de recogida y entrega de pasajeros en una cuadricula de 5x5. Lo publica el usuario Coralfil como artefacto del curso Deep RL de Hugging Face, donde se certifica la resolucion del ejercicio practico. No es un modelo de lenguaje ni una red neuronal profunda: es una tabla Q serializada que asocia pares estado-accion con valores de recompensa esperada.

El entorno Taxi-v3 tiene 500 estados discretos y 6 acciones posibles, y el agente debe aprender a recoger al pasajero en una de las 4 paradas, dejarlo en su destino y evitar acciones ilegales que conllevan penalizacion. La relevancia de este modelo es exclusivamente pedagogica: sirve como referencia minima reproducible de un agente tabular convergido, util para comparar con variantes de Deep Q-Learning (DQN) o para validar pipelines de evaluacion de RL.

No hay informacion publica sobre arquitectura interna, hiperparametros de entrenamiento, licencia ni idiomas soportados mas alla de los metadatos de Hugging Face. El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que confirma su caracter de entrega academica mas que de modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q estado-accion) |
| Parametros totales | no disponible (tabla de 500 estados x 6 acciones como maximo teorico) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente pickle o numpy, no confirmado) |

## Arquitectura y entrenamiento

El agente implementa Q-learning clasico, un metodo de diferencias temporales off-policy que actualiza la tabla Q mediante la regla de Bellman con una tasa de aprendizaje y un factor de descuento. No hay red neuronal, ni funcion de aproximacion, ni replay buffer: el espacio de estados de Taxi-v3 es lo bastante pequeno (500 estados) como para representar la funcion de valor de forma exacta en una tabla.

La model card no documenta el numero de episodios, la politica de exploracion (epsilon-greedy u otra), los valores de alpha y gamma, ni si se aplico decaimiento de epsilon. Tampoco se especifica la semilla ni el numero de ejecuciones de evaluacion que respaldan el resultado declarado. La unica innovacion tecnica reseñable es la certificacion del curso Deep RL de Hugging Face, que implica haber superado los criterios minimos de recompensa media establecidos por el propio curso.

## Capacidades

- Resolucion del entorno Taxi-v3: recoger al pasajero en la parada correcta y dejarlo en el destino.
- Politica greedy derivada de la tabla Q aprendida.
- Evaluacion determinista sobre el entorno estandar de Gymnasium.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle episodico del entorno.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Docencia de RL tabular: usar el agente como solucion de referencia en un curso introductorio para ilustrar la convergencia de Q-learning frente a metodos con aproximacion de funcion.
- Validacion de pipelines de evaluacion: integrar el agente en un script que ejecute `gym.make("Taxi-v3")` y compruebe que la recompensa media cae en el rango declarado de 8,50 +/- 1,50, sirviendo de test de regresion del entorno.
- Baseline para comparativas DQN: medir la brecha entre un agente tabular y una red neuronal profunda sobre el mismo entorno y presupuesto de episodios.
- Reproduccion de experimentos: partir de este repositorio para reentrenar con distintos hiperparametros y estudiar la sensibilidad de Q-learning en Taxi-v3.
- Demostracion de entornos Gymnasium: ejemplo minimo para mostrar como se carga un agente desde Hugging Face y se ejecuta un episodio completo con renderizado.
- Material de portafolio: referencia reproducible de una entrega certificada del curso Deep RL de Hugging Face.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados por un tercero):

| Metrica | Tarea | Dataset | Valor | Verificado |
|---|---|---|---|---|
| mean_reward | reinforcement-learning | Taxi-v3 | 8,50 +/- 1,50 | no |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB; el agente es una tabla de valores discretos y se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleracion por hardware.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna, incluidos entornos sin GPU.
- Opciones de despliegue: scripts de Python con Gymnasium y la libreria estandar; no aplica vLLM, llama.cpp, Ollama ni TGI, que estan pensados para modelos de lenguaje.
- Latencia y throughput: no disponibles; dependen del bucle de simulacion del entorno, no del agente.

## Comparativa con modelos similares

| Modelo | Metodo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Coralfil/rl-taxi-v3 | Q-learning tabular | Taxi-v3 | no disponible | no aplica | no disponible | Hugging Face |
| Agentes DQN de referencia (p. ej. stable-baselines3) | Deep Q-Learning | Taxi-v3 y otros | red pequena (MLP) | no aplica | MIT (libreria) | pip |
| Agentes tabulares del curso Deep RL de HF | Q-learning | Taxi-v3 | tabla | no aplica | no disponible | Hugging Face |

La comparativa con modelos de lenguaje no procede: este artefacto no comparte categoria con ningun LLM. Frente a DQN, la diferencia clave es la representacion exacta del valor sin generalizacion, lo que limita su aplicacion a entornos discretos y pequenos.

## Limitaciones y advertencias

- Solo funciona en Taxi-v3; no generaliza a otros entornos ni a variaciones de la cuadricula.
- La tabla Q no aproxima estados no vistos: cualquier cambio en la definicion del entorno invalida el agente.
- El resultado de 8,50 +/- 1,50 no esta verificado y no se documenta el numero de episodios de evaluacion, por lo que la incertidumbre real puede ser mayor.
- No hay licencia declarada: el uso comercial queda en un limbo legal hasta que el autor la especifique.
- No hay informacion sobre sesgos, semillas ni reproducibilidad exacta del entrenamiento.
- No apto para produccion fuera del ambito educativo o de investigacion en RL tabular.
- Cero descargas y cero likes: sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Coralfil/rl-taxi-v3
- Curso Deep RL de Hugging Face: https://huggingface.co/learn/deep-rl-course/unit0/introduction
- Entorno Taxi-v3 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
