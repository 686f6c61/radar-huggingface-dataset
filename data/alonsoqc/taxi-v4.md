# alonsoqc/Taxi-v4

## Resumen

alonsoqc/Taxi-v4 es un agente de aprendizaje por refuerzo entrenado con Q-Learning para el entorno Taxi-v3 de Gymnasium. No es un modelo de lenguaje ni una red neuronal profunda: se distribuye como un artefacto `q-learning.pkl` que contiene la politica aprendida (presumiblemente una tabla Q) y el identificador del entorno con el que se entrenó. El autor lo publica en HuggingFace con el pipeline `reinforcement-learning` y sin licencia declarada.

El problema que resuelve es el clasico de Taxi: un taxi debe moverse por una cuadricula de 5x5, recoger a un pasajero en una de cuatro ubicaciones (R, G, Y, B) y dejarlo en el destino correcto. Su relevancia es principalmente docente y de referencia: sirve como baseline reproducible de Q-Learning tabular, como ejemplo de integracion con `huggingface_sb3`/`load_from_hub` y como punto de partida para comparar variantes de RL en un entorno de juguete.

El unico resultado declarado es un `mean_reward` de 7,56 +/- 2,71 sobre Taxi-v3, marcado como no verificado (`verified: false`). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB, lo que es coherente con un artefacto tabular de pocos kilobytes. Existe una inconsistencia de naming: el modelo se llama Taxi-v4 pero el dataset, el `env_id` y las etiquetas hacen referencia a Taxi-v3.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (aprendizaje por refuerzo, sin red neuronal); tabla Q almacenada como artefacto |
| Parametros totales | No disponible. Al ser tabular, el numero de entradas depende del espacio de estados y acciones de Taxi-v3; la model card no declara dimensiones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la entrada es un estado discreto de Taxi-v3, no una secuencia de texto |
| Tipos de cuantizacion | No aplica; los pesos se distribuyen como pickle de Python, no en formatos cuantizables (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No aplica / no disponible: el agente no procesa ni genera lenguaje |
| Licencia | No disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning clasico, un metodo de control off-policy basado en diferencias temporales (TD) que aprende una funcion de valor accion-estado Q(s,a) sobre un espacio de estados discreto y finito. En la practica, esto implica una tabla indexada por estado y accion, actualizada iterativamente con la recompensa observada y el maximo Q del estado siguiente. La model card no especifica hiperparametros: ni tasa de aprendizaje, ni factor de descuento, ni politica de exploracion (epsilon-greedy u otra), ni numero de episodios, ni semilla.

No hay datos de entrenamiento en el sentido habitual: el agente se entrena interactuando con el simulador Taxi-v3, sin corpus de texto, sin RLHF, sin DPO y sin fase supervisada. Tampoco se documenta ninguna innovacion tecnica (sin decodificacion especulativa, sin atención lineal, sin arquitectura híbrida): es una implementacion etiquetada como `custom-implementation` por el autor. El codigo de carga sugerido en la model card implica el uso de `load_from_hub` y de `gym.make(model["env_id"])`, con la advertencia explicita de comprobar atributos del entorno como `is_slippery=False`.

## Capacidades

- Seleccion de acciones discretas en Taxi-v3: dado un estado del entorno, el agente devuelve una de las acciones disponibles (mover en las cuatro direcciones, recoger o dejar pasajero).
- Aprendizaje de una politica de navegacion y recogida/entrega en una cuadricula de 5x5 con cuatro ubicaciones.
- Integracion con el ecosistema Gymnasium mediante el `env_id` almacenado en el artefacto.
- Carga reproducible desde el Hub mediante `load_from_hub` (ecosistema `huggingface_sb3`).
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso basados en lenguaje ni planificacion simbolica mas alla del bucle de decision del MDP.
- No tiene capacidades multilingues.
- No dispone de modo "thinking", audio ni ninguna modalidad adicional.
- No generaliza a otros entornos sin reentrenamiento: la tabla Q esta ligada a la dinamica y al espacio de estados de Taxi-v3.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo funcionando de Q-Learning tabular para explicar la ecuacion de Bellman, la exploracion epsilon-greedy y la convergencia de la tabla Q en un entorno de juguete.
- Baseline de referencia en Taxi-v3: comparar nuevas implementaciones (DQN, PPO, SARSA) contra el `mean_reward` declarado de 7,56 +/- 2,71, teniendo en cuenta que la metrica no esta verificada.
- Pruebas de pipelines de evaluacion RL: validar que un harness que carga artefactos desde el Hub, ejecuta `gym.make` y agrega recompensas por episodio funciona de extremo a extremo con un modelo pequeno y rapido.
- Verificacion de reproducibilidad: comprobar como afectan variaciones en el entorno (`is_slippery`, limite de pasos, semilla) al rendimiento del mismo artefacto, util para auditar configuraciones de evaluacion.
- Demostraciones y material didactico interactivo: ejecutar el agente en un notebook sin GPU para ilustrar el comportamiento de una politica RL en una cuadricula, con latencia despreciable.
- Integracion en tests de regresion de infraestructura ML: al ser un artefacto de pocos kilobytes, sirve como caso de prueba para validar flujos de descarga, cache y versionado en el Hub sin coste de computo.
- Punto de partida para extensiones: reentrenar o ajustar la politica para variantes del entorno (rejillas mayores, distintos niveles de estocasticidad) partiendo del artefacto publicado.

## Benchmarks y rendimiento

| Entorno | Metrica | Valor | Verificado | Notas |
|---|---|---|---|---|
| Taxi-v3 | mean_reward | 7,56 +/- 2,71 | No (`verified: false`) | Unico resultado declarado por el autor en el `model-index`; no se especifican numero de episodios, semilla ni desviacion estandar de la media frente a la poblacion |

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de otras tareas de lenguaje, ya que el artefacto no es un modelo de lenguaje. Tampoco se aporta la tasa de exito por episodio, el retorno medio de la politica optima como referencia ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El artefacto es una tabla Q en pickle y se ejecuta en CPU.
- RAM estimada: inferior a unas pocas decenas de MB, incluyendo el interprete de Python y el entorno Taxi-v3; el tamano del repositorio declarado es de 0,0 GB.
- GPU recomendadas: ninguna. No se requiere GPU; cualquier CPU sirve.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, iGPU) y en entornos sin GPU, pero no las aprovecha.
- Opciones de despliegue: carga directa del pickle con `load_from_hub` (ecosistema `huggingface_sb3`) y ejecucion con `gymnasium.make(model["env_id"])`; no aplica a vLLM, TGI, llama.cpp ni Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles de forma publicada. Por la naturaleza tabular del artefacto, la inferencia se reduce a una consulta en memoria y el cuello de botella sera el paso del simulador, no el modelo.
- Consideracion de seguridad: la carga de pickles ejecuta codigo Python; conviene usar entornos aislados y verificar el origen del archivo.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | mean_reward | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| alonsoqc/Taxi-v4 | Q-Learning tabular (`custom-implementation`) | Taxi-v3 | No disponible (tabular) | No aplica | 7,56 +/- 2,71 (no verificado) | No disponible | HuggingFace, 0 descargas |
| Learnix-AI-Lab/q-Taxi-v4 | Agente Q-Learning | Taxi-v4 segun el nombre del repo | No disponible | No aplica | No disponible | No disponible | HuggingFace |
| drcxd1122/q-Taxi-v4 | Agente Q-Learning | Taxi-v4 segun la model card | No disponible | No aplica | No disponible | No disponible | HuggingFace |

La comparacion cuantitativa no es posible con la informacion disponible: los modelos alternativos identificados no publican metricas en los resultados de busqueda y el unico dato numerico es el del modelo analizado, ademas sin verificar. La comparacion con modelos de lenguaje de gran tamano no aplica por categoria.

## Limitaciones y advertencias

- Metrica no verificada: el `mean_reward` de 7,56 +/- 2,71 esta marcado como `verified: false` y no se documentan episodios, semilla ni metodologia de evaluacion.
- Varianza alta: una desviacion de 2,71 sobre una media de 7,56 implica una dispersion considerable; el rendimiento por episodio puede ser muy variable.
- Falta de documentacion de hiperparametros: sin tasa de aprendizaje, descuento, epsilon ni numero de episodios, la reproducibilidad del entrenamiento no esta garantizada.
- Dependencia del entorno: el atributo `is_slippery` y el `env_id` deben coincidir con la configuracion de entrenamiento; la propia model card advierte de comprobarlo. Cambiarlos puede degradar la politica.
- Inconsistencia de naming: el nombre del modelo es Taxi-v4 mientras que el dataset, las etiquetas y el `env_id` apuntan a Taxi-v3, lo que puede provocar errores de configuracion.
- Cero validacion de la comunidad: 0 descargas y 0 likes; no hay evidencia externa de que el artefacto funcione segun lo declarado.
- Licencia ausente: sin licencia declarada no hay autorizacion explicita para uso comercial, redistribucion o modificacion; hay que contactar con el autor.
- Riesgo de seguridad del formato: los archivos pickle pueden ejecutar codigo arbitrario al cargarse; no son un formato seguro para artefactos de procedencia desconocida.
- Ausencia total de capacidades de lenguaje: no es utilizable para texto, codigo, vision, tool calling ni tareas de agentes basadas en LLM.
- Sin generalizacion: la politica esta ligada al MDP de Taxi-v3 y no transferira a otros entornos sin reentrenamiento.
- No hay informacion sobre sesgos, alucinacion o limitaciones idiomaticas porque el artefacto no procesa lenguaje; esas categorias no aplican.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alonsoqc/Taxi-v4
- Documentacion del entorno Taxi en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Implementacion de referencia Taxi-v4 en GitHub: https://github.com/janashams/Taxi-v4-OpenAI-Gymnasium/blob/main/main.py
- Modelo comparable Learnix-AI-Lab/q-Taxi-v4: https://huggingface.co/Learnix-AI-Lab/q-Taxi-v4
- Modelo comparable drcxd1122/q-Taxi-v4: https://huggingface.co/drcxd1122/q-Taxi-v4
- Ficha indexada de un modelo q-Taxi-v4: https://essamamdani.com/ai-models/hf-roshana1s-q-taxi-v4
