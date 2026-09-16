# alan-abraham/q-taxi-v3

## Resumen

q-taxi-v3 es un agente de aprendizaje por refuerzo entrenado con Q-learning tabular para resolver el entorno Taxi-v3 de Gym/Gymnasium. No es un modelo de lenguaje ni una red neuronal: se trata de un artefacto de pesos (tabla Q) serializado en un fichero `q-learning.pkl`, publicado por el usuario alan-abraham en HuggingFace con pipeline declarado `reinforcement-learning`. El problema que resuelve es el control discreto clásico del entorno Taxi-v3, en el que un agente debe recoger y dejar pasajeros en una cuadrícula cumpliendo las reglas del entorno.

El interés de este tipo de publicación es fundamentalmente metodológico y docente: sirve como referencia reproducible de un algoritmo de RL tabular, como baseline en experimentos y como prueba de integración para pipelines de evaluación que cargan checkpoints desde el Hub. El repositorio no tiene descargas ni likes, y la métrica declarada no está verificada por el Hub, por lo que debe tratarse como un artefacto de uso experimental y no como un componente listo para producción.

Al no ser un transformer, no aplican conceptos como parámetros activos, longitud de contexto, cuantización o soporte multilingüe. Su tamaño efectivo es el de la tabla Q del entorno (500 estados discretos por 6 acciones según la especificación estándar del entorno), con un peso en disco del orden de kilobytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (off-policy, TD(0)); no es una red neuronal |
| Parametros totales | No aplica en sentido neuronal; tabla Q de 500 estados x 6 acciones (3.000 valores Q) según la especificación estándar de Taxi-v3 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entorno de decisión secuencial, no secuencias de texto) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | `q-learning.pkl` (serialización pickle de Python) |

## Arquitectura y entrenamiento

La arquitectura es Q-learning clásico sobre una representación tabular: una tabla que asigna un valor Q a cada par (estado, acción) del entorno Taxi-v3. La actualización es off-policy con diferencias temporales de un paso (TD(0)) aplicando la ecuación de Bellman, y la política de comportamiento se infiere del uso típico de este tipo de entrenamientos con exploración epsilon-greedy, aunque los hiperparámetros concretos (tasa de aprendizaje, factor de descuento, política de epsilon, número de episodios) no están documentados en la información disponible.

No hay entrenamiento con datos de texto ni fases de RLHF o DPO: el "dataset" es el propio entorno Taxi-v3 y el material de entrenamiento son las transiciones generadas por la interacción del agente con él. El resultado es una política determinista derivada de la tabla Q, y el artefacto se integra con el ecosistema de Stable-Baselines3 / RL Zoo mediante `load_from_hub`, que recupera el checkpoint y el identificador del entorno. No se declara ninguna innovación técnica: es una implementación personalizada (`custom-implementation`) de un algoritmo estándar.

## Capacidades

- Resolución del entorno Taxi-v3: selecciona acciones discretas (movimiento, recogida y dejada de pasajero) a partir del estado discreto observado.
- Inferencia por consulta de tabla: el paso de decisión es una búsqueda del valor máximo, sin cómputo matricial ni GPU.
- Política determinista y auditable: cada celda de la tabla Q se puede inspeccionar individualmente.
- Cobertura completa del espacio de estados del entorno si la tabla se ha entrenado en todos ellos (500 estados discretos).
- No genera texto ni código, y no tiene capacidades de matemáticas, visión, audio ni comprensión de lenguaje natural.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso fuera del bucle de interacción con el entorno ni planificación simbólica.
- No es multilingüe: no hay procesamiento de idioma alguno.
- No dispone de modo "thinking", ni de cualquier capacidad generativa.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el checkpoint permite cargar una tabla Q ya entrenada y compararla con implementaciones propias en un curso de RL tabular, sin depender de entrenamientos largos.
- Baseline en investigación: sirve como punto de referencia para algoritmos que abordan control discreto (SARSA, DQN, PPO) sobre Taxi-v3 antes de escalar a entornos continuos o parcialmente observables.
- Prueba de integración de pipelines de evaluación: útil para verificar que un runner basado en RL Zoo o en la librería `evaluate` carga correctamente checkpoints `.pkl`, instancia el entorno con el `env_id` guardado y calcula `mean_reward`.
- Validación de infraestructura Gymnasium en CI: un smoke test con este agente detecta rápidamente incompatibilidades entre versiones de `gym` y `gymnasium`, o cambios en el registro de entornos.
- Prototipado de formalizaciones MDP: la estructura estado-acción-recompensa de Taxi-v3 es una abstracción de problemas de logística de recogida y entrega, útil para bocetar el modelado antes de trasladarlo a un dominio real.
- Reproducibilidad de experimentos: al ser una tabla finita, la política es completamente inspeccionable y replicable, algo imposible de auditar celda a celda en un agente basado en red neuronal.
- Comparación tabular frente a deep RL: permite medir el coste y el beneficio de sustituir una tabla Q de 3.000 valores por una red neuronal en un problema de estado discreto y pequeño.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados por el Hub):

| Metrica | Tarea | Dataset | Valor | Verificado |
|---|---|---|---|---|
| mean_reward | reinforcement-learning | Taxi-v3 | 7,56 ± 2,71 | no |

No se han publicado otros resultados de benchmarks en la información disponible, ni valores de referencia de agentes alternativos sobre el mismo entorno que permitan contextualizar la recompensa media. La desviación típica de 2,71 sobre una media de 7,56 indica una varianza elevada entre episodios, coherente con un entorno con componente estocástico y penalizaciones por pasos y por acciones ilegales.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El modelo no utiliza GPU ni tensores.
- GPU recomendadas: no aplica. No requiere acelerador de ningún tipo (A100, H100, RTX 4090 son innecesarias).
- Consumer GPU: no es necesaria; el agente se ejecuta íntegramente en CPU, incluida hardware de gama baja o placas tipo Raspberry Pi.
- Memoria RAM: del orden de megabytes, muy por debajo de 1 GB.
- Almacenamiento: el fichero de pesos es del orden de kilobytes; el repositorio de HuggingFace declara 0,0 GB.
- Opciones de despliegue: Python con `gym` o `gymnasium` y carga directa del `.pkl`; integración con RL Zoo / Stable-Baselines3 mediante `load_from_hub`. vLLM, llama.cpp, Ollama y TGI no aplican a este artefacto.
- Latencia y throughput: la decisión es una consulta de tabla O(1), del orden de microsegundos; el límite práctico lo impone el `step` del entorno, que en CPU permite del orden de miles de pasos por segundo.
- Escalado: irrelevante; un único proceso cubre cualquier carga realista de este agente.

## Comparativa con modelos similares

No se han publicado cifras comparables en la información disponible. Comparación cualitativa con alternativas habituales para el mismo entorno:

| Modelo | Tipo | Representacion | Entorno | Rendimiento | Licencia |
|---|---|---|---|---|---|
| q-taxi-v3 | Q-learning tabular | tabla Q de 500 x 6 valores | Taxi-v3 | mean_reward 7,56 ± 2,71 (no verificado) | no disponible |
| Agente DQN (familia RL Zoo) | Deep RL, red neuronal | red densa aproximadora de Q | Taxi-v3 | no disponible | no disponible |
| Agente SARSA tabular | RL tabular on-policy | tabla Q de 500 x 6 valores | Taxi-v3 | no disponible | no disponible |

La diferencia principal frente a DQN es la representación: la tabla Q no generaliza a estados no vistos ni permite transferencia a entornos modificados, mientras que una red neuronal sí puede aproximar funciones de valor en espacios mayores; a cambio, la tabla es exacta, inspeccionable y mucho más ligera.

## Limitaciones y advertencias

- Especialización total: el agente solo es válido para Taxi-v3 (o variantes con idéntico espacio de estados y acciones). No hay transferencia a otros entornos.
- No es un modelo de lenguaje: no procesa texto, no comprende instrucciones y no sirve para tareas generativas, de código o de razonamiento en lenguaje natural.
- Métrica no verificada: el `mean_reward` declarado figura con `verified: false` y fue reportado por el autor.
- Varianza alta: la desviación típica de 2,71 sobre una media de 7,56 sugiere un comportamiento irregular entre episodios; no hay información sobre la política de evaluación ni sobre el número de episodios usados para la media.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial ni de redistribución.
- Formato pickle: cargar un `.pkl` de origen no confiable implica riesgo de ejecución de código arbitrario. Debe validarse la procedencia antes de deserializarlo.
- Dependencia del entorno: la propia model card advierte de que hay que comprobar el `env_id` y atributos como `is_slippery` antes de instanciar el entorno; un cambio de configuración invalida la política entrenada.
- Falta de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de reproducibilidad del resultado.
- Hiperparámetros no documentados: sin tasa de aprendizaje, descuento, epsilon ni número de episodios, la reproducibilidad exacta del entrenamiento no está garantizada.
- Impacto de sesgos y alucinación: no aplica en el sentido habitual de los modelos generativos, pero sí existe el riesgo de sobreinterpretar la recompensa declarada como un rendimiento óptimo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alan-abraham/q-taxi-v3
- Búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a una entidad del sector asegurador sanitario sin relación con este artefacto, por lo que se descartan como fuentes. No se dispone de paper, blog, repositorio adicional ni demo asociados en la información proporcionada.
