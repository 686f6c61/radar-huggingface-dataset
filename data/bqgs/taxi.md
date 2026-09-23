# bqgs/taxi

## Resumen

bqgs/taxi es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-learning tabular sobre el entorno Taxi-v4 de Gym/Gymnasium. No es un modelo de lenguaje ni una red neuronal: se trata de una tabla Q (pares estado-accion) serializada en un fichero pickle, publicada en HuggingFace Hub dentro de la categoria de pipeline `reinforcement-learning`. El autor es el usuario bqgs y el repositorio no supera los 0.0 GB, lo que confirma que el artefacto ocupa apenas unos kilobytes.

El problema que resuelve es canonico en RL: un taxi debe recoger y dejar pasajeros en una cuadricula de 5x5 con cuatro ubicaciones posibles, gestionando estados discretos y recompensas negativas por paso. El agente aprende una politica que maximiza la recompensa acumulada. Su relevancia es fundamentalmente educativa y de referencia: sirve como baseline reproducible para comparar algoritmos tabulares frente a aproximaciones con redes neuronales profundas (DQN), y como ejemplo minimo de publicacion de artefactos RL en el Hub.

La model card del autor declara un resultado de `mean_reward` de 7.50 +/- 2.70 sobre el dataset Taxi-v4, marcado como no verificado. No se especifica licencia, idiomas ni detalles del proceso de entrenamiento (hiperparametros, episodios, politica de exploracion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (sin red neuronal); tabla Q de 500 estados x 6 acciones = 3000 valores, segun la especificacion del entorno Taxi-v4 |
| Parametros totales | No disponible en la model card; segun la definicion del entorno equivaldria a 3000 entradas numericas |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo secuencial basado en atencion) |
| Tipos de cuantizacion | No aplica; el fichero se carga como objeto pickle |
| Idiomas soportados | No disponible (no aplica; el modelo no procesa lenguaje natural) |
| Licencia | No disponible; el repositorio no declara ninguna licencia |
| Formato de pesos | Pickle de Python (`q-learning.pkl`), cargable con `load_from_hub` |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular, una tecnica de control off-policy basada en diferencias temporales. El agente mantiene una tabla Q indexada por el par (estado, accion) y la actualiza con la regla de Bellman usando la recompensa inmediata y el maximo valor Q del estado siguiente, con una tasa de aprendizaje y un factor de descuento que la model card no detalla. No hay red neuronal, no hay retropropagacion y no hay gradientes: la "inferencia" consiste en consultar la entrada de la tabla y aplicar una politica greedy.

El entorno objetivo es Taxi-v4, con 500 estados discretos (25 posiciones del taxi x 5 posiciones de pasajero, incluyendo el estado "en taxi" x 4 destinos) y 6 acciones (norte, sur, este, oeste, recoger, dejar). El dataset de entrenamiento implicito es la propia dinamica del entorno; no se especifica numero de episodios, composicion ni si se aplico algun tipo de decaimiento de epsilon. Tampoco se menciona RLHF, DPO ni ninguna innovacion tecnica adicional, algo coherente con la naturaleza de este algoritmo.

## Capacidades

- Control de agente en el entorno Taxi-v4: seleccion de acciones discretas para completar recogidas y entregas.
- Politica determinista derivada de la tabla Q (tipicamente greedy sobre la accion de mayor valor).
- Aprendizaje tabular off-policy con actualizaciones de diferencias temporales (capacidad del algoritmo, no necesariamente verificada en este artefacto concreto).
- Serializacion y publicacion en HuggingFace Hub mediante el formato `load_from_hub` del curso de Deep RL de HuggingFace.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingues: no procesa texto.
- No dispone de modo "thinking", vision, audio ni ninguna capacidad multimodal.
- No se documenta soporte de decodificacion especulativa ni de atencion lineal (no aplica).

## Casos de uso

- Docencia de aprendizaje por refuerzo: el artefacto sirve para ilustrar como se ve una tabla Q entrenada y como se carga desde el Hub, sin necesidad de GPU ni de pipelines complejos.
- Baseline de comparacion: cualquier experimento con DQN, SARSA o policy gradient sobre Taxi-v4 puede contrastarse contra el `mean_reward` declarado de 7.50.
- Test de integracion de infraestructura RL: permite validar el flujo `load_from_hub` + `gym.make(model["env_id"])` en un entorno de CI sin coste computacional apreciable.
- Simuladores interactivos educativos: proyectos tipo simulador de taxi (como el repositorio Nithesh-27/Taxi-AI) pueden usar este agente como politica preentrenada para demostraciones visuales.
- Investigacion sobre variantes del entorno: al ser un agente tabular puro, resulta util para medir el impacto de cambios como `is_slippery` o variaciones en la dinamica de recompensas.
- Reproducibilidad de pipelines de RL: el pickle es un artefacto minimo que permite probar sistemas de versionado, evaluacion automatica y registro de modelos en el Hub.
- Benchmark de entornos toy: comparar la dificultad relativa de Taxi-v4 frente a otros entornos de Gymnasium usando un agente de referencia barato de ejecutar.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.50 +/- 2.70 | No |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; la politica es una consulta a una tabla indexada.
- GPU recomendadas: ninguna; el modelo se ejecuta integramente en CPU.
- Compatibilidad con GPU de consumo: no aplica, no requiere GPU (funciona en cualquier CPU, incluida una Raspberry Pi).
- Opciones de despliegue: no soporta vLLM, llama.cpp, Ollama ni TGI; el unico camino documentado es deserializar el pickle con `load_from_hub` y usar Gym/Gymnasium.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la naturaleza de la operacion (lookup en tabla) la latencia por decision es del orden de microsegundos en CPU, si bien el cuello de botella real sera el bucle de simulacion del entorno.
- Almacenamiento: el repositorio ocupa 0.0 GB reportados, es decir, unos pocos kilobytes.

## Comparativa con modelos similares

No se dispone de datos publicados de benchmarks para alternativas concretas en la informacion proporcionada. La comparacion siguiente es cualitativa, a nivel de familia de algoritmo sobre Taxi-v4:

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bqgs/taxi (Q-learning tabular) | Tabla Q de 500 x 6 valores | No aplica | mean_reward 7.50 +/- 2.70 (no verificado) | No disponible | HuggingFace Hub |
| SARSA tabular sobre Taxi-v4 | Tabla Q equivalente | No aplica | No disponible | No disponible | Implementable con Gymnasium |
| DQN sobre Taxi-v4 | Red neuronal pequena (miles de parametros) | No aplica | No disponible | No disponible | Implementable con Stable-Baselines3 |
| Agente aleatorio sobre Taxi-v4 | Ninguno | No aplica | No disponible en la informacion proporcionada | No aplica | Gymnasium |

## Limitaciones y advertencias

- El resultado de `mean_reward` esta marcado como no verificado en el model-index; no debe tratarse como una cifra auditada.
- No se declara licencia en el repositorio. La ausencia de licencia implica, por defecto, reserva de derechos: no hay cesion explicita para uso comercial ni para redistribucion.
- El fichero se distribuye como pickle de Python. Deserializar pickles de origen no confiable supone un riesgo de ejecucion de codigo arbitrario; conviene inspeccionarlo o cargarlo en un entorno aislado.
- Sesgos conocidos: no hay informacion al respecto; al ser un agente tabular sobre un entorno sintetico, no aplican sesgos de datos de lenguaje, pero la politica hereda las simplificaciones del entorno (sin trafico, sin pasajeros multiples, sin tiempo real).
- Riesgo de alucinacion: no aplica, el modelo no genera texto.
- Limitaciones de contexto e idioma: no aplica; el agente solo opera sobre los 500 estados discretos de Taxi-v4.
- El agente esta acoplado al identificador de entorno concreto (`Taxi-v4`); cambiar de version del entorno puede invalidar la tabla Q o la semantica de los indices.
- El autor advierte en la model card de que puede ser necesario anadir atributos al crear el entorno (`is_slippery=False`, etc.); si la configuracion en inferencia difiere de la de entrenamiento, el rendimiento declarado no se sostiene.
- Pese a la etiqueta del repositorio, no hay documentacion de hiperparametros, numero de episodios ni semillas, lo que limita la reproducibilidad exacta.
- Uso en produccion: no es un modelo apto para tareas reales de negocio; su ambito es la investigacion, la docencia y la validacion de infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bqgs/taxi
- Documentacion del entorno Taxi de Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Los resultados de busqueda web obtenidos no guardan relacion con este modelo: tratan sobre prediccion de tarifas de taxi con BigQuery ML y sobre simuladores de Q-learning independientes (por ejemplo, https://github.com/Nithesh-27/Taxi-AI-Interactive-Q-Learning-Reinforcement-Learning-Simulator), no sobre el artefacto bqgs/taxi. No se han encontrado papers, blogs ni demos oficiales asociados a este repositorio.
