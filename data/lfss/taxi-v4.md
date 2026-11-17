# lfss/Taxi-V4

## Resumen

Taxi-V4 es un agente de aprendizaje por refuerzo entrenado con Q-Learning sobre el entorno Taxi-v3 de Gymnasium, publicado en Hugging Face por el usuario lfss. No se trata de un modelo de lenguaje: es una politica tabular serializada en un fichero `q-learning.pkl` que resuelve la tarea clasica de recogida y entrega de pasajeros en una cuadricula de 5x5 con cuatro ubicaciones de recogida y destino. El repositorio tiene un tamano de 0.0 GB y cero descargas en el momento de la consulta.

El interes de esta ficha es acotado: sirve como ejemplo de publicacion de agentes de RL en el Hub y como referencia de un resultado concreto (recompensa media de 7.50 +/- 2.63 sobre Taxi-v3) declarado por el autor. No hay informacion sobre arquitectura neuronal, datos de entrenamiento, idiomas ni licencia, por lo que muchas secciones de esta ficha quedan marcadas como no disponibles.

La relevancia practica es limitada para produccion: Taxi-v3 es un entorno de juguete con un espacio de estados discreto y pequeno, util para docencia, validacion de pipelines de RL y comparacion de algoritmos, no para tareas del mundo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (implementacion propia, sin red neuronal declarada) |
| Parametros totales | no disponible (tabla Q de dimensiones no declaradas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | fichero `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El autor declara un agente de Q-Learning, un algoritmo de aprendizaje por refuerzo off-policy y libre de modelo que estima el valor Q(s, a) de cada par estado-accion. No se especifica si la tabla Q se implementa como diccionario, array de NumPy u otra estructura, ni se detallan los hiperparametros (tasa de aprendizaje, factor de descuento, politica epsilon-greedy, numero de episodios). Tampoco se indica si el entrenamiento se realizo con la variante `is_slippery` activada o desactivada, un detalle relevante en Taxi-v3 porque altera la dinamica de transiciones y, por tanto, la dificultad del entorno.

El entorno Taxi-v3 de Gymnasium tiene 500 estados discretos (25 posiciones del taxi x 5 posibles ubicaciones de pasajero x 4 destinos) y 6 acciones (norte, sur, este, oeste, recoger, dejar). La recompensa por entrega correcta es +20, con penalizaciones de -1 por paso y -10 por recogida o entrega ilegal. El resultado declarado de 7.50 +/- 2.63 de recompensa media es coherente con una politica que completa la tarea en la mayoria de episodios pero con margen de mejora respecto al optimo teorico del entorno. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Resolucion del entorno Taxi-v3: seleccion de acciones discretas para recoger y entregar pasajeros en la cuadricula.
- Politica greedy derivada de la tabla Q aprendida; no hay generacion de texto, codigo ni razonamiento simbolico.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle episodico del entorno Gymnasium.
- Sin capacidades multilingues: no procesa lenguaje natural.
- Sin modos especiales (thinking, vision, audio).

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo resuelto de Q-Learning tabular para comparar con SARSA, Monte Carlo o Deep Q-Network en el mismo entorno.
- Validacion de pipelines de evaluacion: cargar el `.pkl` y ejecutar `evaluate` con `stable-baselines3` o el script de `rl-baselines3-zoo` para verificar que la infraestructura de evaluacion funciona antes de entrenar modelos mayores.
- Baseline en experimentos de RL: emplear la recompensa media de 7.50 como referencia inferior frente a la que comparar agentes con redes neuronales o con planificacion.
- Pruebas de integracion de Gymnasium: comprobar la compatibilidad de versiones del entorno Taxi-v3 y de las utilidades de carga del Hub en un entorno controlado.
- Demostraciones de publicacion en Hugging Face: servir de plantilla para entender como se estructura una model card de RL con `model-index` y metadatos de evaluacion.
- Analisis de robustez ante `is_slippery`: replicar el entrenamiento con y sin transiciones estocasticas para estudiar la degradacion de la politica, dado que el autor no documenta esta configuracion.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.50 +/- 2.63 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el agente es una tabla Q serializada en pickle y se ejecuta en CPU.
- GPU recomendadas: ninguna; el entrenamiento y la inferencia de Q-Learning tabular sobre 500 estados no requiere aceleracion.
- Cabe en cualquier equipo consumer, incluidos Raspberry Pi y entornos sin GPU.
- Despliegue: carga directa con `load_from_hub` del ecosistema Hugging Face y ejecucion sobre `gym.make(model["env_id"])`; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del bucle de simulacion del entorno, no del modelo.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lfss/Taxi-V4 | Q-Learning tabular | Taxi-v3 | 7.50 +/- 2.63 | no disponible | Hugging Face |
| Agentes DQN sobre Taxi-v3 | Deep Q-Network | Taxi-v3 | no disponible | variable | Implementaciones de referencia en literatura |
| Agentes PPO sobre Taxi-v3 | PPO | Taxi-v3 | no disponible | variable | Implementaciones de referencia en literatura |

No se dispone de resultados publicados de alternativas concretas en la informacion proporcionada para establecer una comparacion numerica fiable.

## Limitaciones y advertencias

- Ambito restringido: solo resuelve Taxi-v3; no es un modelo de proposito general ni transferible a otras tareas sin reentrenamiento.
- Resultado no verificado: la metrica 7.50 +/- 2.63 esta marcada como `verified: false` y procede unicamente del autor.
- Configuracion del entorno no documentada: se desconoce si se entreno con `is_slippery=True` o `False`, lo que impide reproducir el resultado con garantias.
- Licencia ausente: sin licencia declarada no hay autorizacion explicita para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier uso en produccion.
- Formato pickle: la carga de ficheros `.pkl` de origen no confiable implica riesgo de ejecucion de codigo arbitrario; debe hacerse en un entorno aislado.
- Sin informacion sobre sesgos, alucinacion o limitaciones idiomaticas porque el modelo no procesa lenguaje natural.
- Cero descargas y cero likes: sin validacion por parte de la comunidad, la calidad del agente no esta contrastada de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lfss/Taxi-V4
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de `load_from_hub` (Hugging Face): https://huggingface.co/docs/huggingface_hub
- Repositorio de referencia de RL con Stable-Baselines3: https://github.com/DLR-RM/rl-baselines3-zoo
