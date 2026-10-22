# njdonato/taxi

## Resumen

`njdonato/taxi` es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular para resolver el entorno Taxi-v3 de Gymnasium (etiquetado como Taxi-v4 en los metadatos del repo). No es un modelo de lenguaje ni una red neuronal: es una tabla Q serializada en un fichero `q-learning.pkl` que se carga con `load_from_hub` y se evalúa contra el entorno de Gymnasium correspondiente. Lo publica el usuario njdonato en Hugging Face, con pipeline `reinforcement-learning` y licencia no declarada.

El modelo resuelve un MDP discreto clásico de planificación: un taxi debe recoger a un pasajero en una de cuatro paradas y dejarlo en su destino dentro de una cuadrícula de 5x5, con recompensa -1 por paso, +20 por entrega correcta y -10 por recogida o entrega ilegal. Su relevancia es eminentemente docente y de referencia: sirve como baseline reproducible de Q-Learning, como material de curso y como prueba de integración de pipelines de RL en Hugging Face.

El autor declara un `mean_reward` de 7,56 ± 2,71 sobre Taxi-v4, marcado como no verificado (`verified: false`). El repo ocupa 0,0 GB, no tiene descargas ni likes, y la model card es una plantilla mínima sin hiperparámetros, semillas ni protocolo de evaluación. Conviene tratarlo, por tanto, como un artefacto de demostración más que como un agente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (off-policy, TD control); sin red neuronal |
| Parametros totales | No declarado. Agente tabular: para Taxi-v3 (500 estados discretos × 6 acciones) una tabla Q densa implicaría 3000 valores, estimación derivada del entorno, no del repo |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. La entrada es una observación discreta del entorno (Taxi-v3: 500 estados); no hay ventana de tokens |
| Tipos de cuantizacion | No aplica. Pesos en `q-learning.pkl` (pickle de Python), sin variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | No aplica (no procesa lenguaje natural). No declarados en el repo |
| Licencia | No disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | `q-learning.pkl` (pickle de Python), cargado vía `load_from_hub` |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular clásico: una tabla de valores Q indexada por estado y acción, actualizada con la regla de diferencias temporales de Watkins (objetivo `r + γ·max_a' Q(s', a')`) y una política de exploración de tipo epsilon-greedy. No hay función de aproximación, ni red profunda, ni atención, ni mecanismo de decodificación. La model card no declara hiperparámetros (tasa de aprendizaje α, factor de descuento γ, schedule de ε), número de episodios, semillas ni criterio de parada, de modo que el entrenamiento no es reproducible tal cual con la información publicada.

El entrenamiento se realizó sobre el entorno Taxi de Gymnasium; los tags y el `model-index` indican **Taxi-v4**, mientras que el cuerpo de la model card dice **Taxi-v3**. Es una discrepancia relevante porque ambos entornos comparten espacio de estados y acciones (500 estados, 6 acciones), pero conviene verificar `env_id` en el pickle antes de evaluar. El uso previsto es `gym.make(model["env_id"])` tras cargar el fichero; el propio autor advierte de que pueden ser necesarios atributos adicionales del entorno (`is_slippery=False`, etc.).

## Capacidades

- Resolución del entorno Taxi-v3/v4: política greedy que mapea cada uno de los 500 estados discretos a una de las 6 acciones (sur, norte, este, oeste, recoger, dejar).
- Aprendizaje por refuerzo off-policy tabular, apto para dominios con espacio de estados y acciones finitos y pequeño.
- Evaluación episódica estándar mediante `gymnasium` y el wrapper de Hugging Face para agentes de RL.
- Serialización y distribución vía Hub con `load_from_hub`, lo que permite integración directa en scripts de evaluación.
- No soporta generación de texto, razonamiento en lenguaje natural, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso basados en LLM; su "razonamiento" se limita a la política Markoviana del episodio.
- No tiene capacidades multilingües ni modo "thinking", audio o multimodalidad.
- No se declaran capacidades de generalización a variantes del entorno distintas de la entrenada.

## Casos de uso

- **Docencia de RL clásico**: usar el agente como ejemplo resuelto de Q-Learning tabular en un curso introductorio, comparando la tabla Q aprendida con la política óptima teórica del entorno Taxi.
- **Baseline de referencia en experimentos**: punto de comparación frente a DQN, PPO o Monte Carlo sobre Taxi-v3, con la cautela de que los hiperparámetros no están publicados y el resultado no está verificado.
- **Prueba de integración de `load_from_hub`**: validar en CI que el flujo de descarga, deserialización y `gym.make(model["env_id"])` funciona tras cambios de versión de `huggingface_hub` o `gymnasium`.
- **Sanity check de pipelines de evaluación de RL**: comprobar que un runner de evaluación calcula correctamente `mean_reward` y su desviación típica, usando este agente como caso de prueba con valor conocido (7,56 ± 2,71 declarado).
- **Prototipado de dominios pickup-and-delivery**: emplear la política como referencia conceptual en problemas discretos de logística con recogida y entrega, antes de escalar a entornos con estado continuo.
- **Reproducción y auditoría de artefactos del Hub**: inspeccionar el pickle para documentar la estructura de la tabla Q, el `env_id` real y el número de entradas, y así completar la model card con los datos que faltan.
- **Demostración de agentes RL en Hugging Face**: ejemplo mínimo para talleres que muestren el pipeline `reinforcement-learning` y el formato `model-index` del Hub.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card:

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7,56 ± 2,71 | No (`verified: false`) |

No se han publicado en la información disponible el número de episodios de evaluación, la política usada durante la evaluación (greedy o epsilon-greedy), la semilla ni el intervalo de confianza. Tampoco se aportan resultados comparativos con otros agentes sobre el mismo entorno. El valor debe interpretarse con cautela: la desviación típica de 2,71 sobre una recompensa media de 7,56 indica una política con varianza apreciable entre episodios.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: una consulta a la tabla Q es un acceso indexado O(1), sin operaciones matriciales.
- VRAM estimada: 0 GB. No requiere GPU.
- GPU recomendadas: ninguna. Cualquier GPU sería infrautilizada; no hay kernels que aprovechar.
- Cabe en cualquier equipo consumer, incluidos Raspberry Pi y contenedores de 128 MB de RAM; el repo ocupa 0,0 GB.
- Despliegue: script de Python con `gymnasium` + `huggingface_hub` (`load_from_hub`) + `pickle`. No aplica vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no medidos en la información disponible; por la naturaleza del artefacto, la latencia vendrá dominada por el paso del entorno de Gymnasium y no por el modelo.
- Advertencia de seguridad: la carga de ficheros `.pkl` ejecuta deserialización arbitraria; conviene hacerlo en un entorno aislado y verificar la procedencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros agentes Q-Learning sobre Taxi-v3/v4 que permitan una comparación con cifras (parámetros, contexto, recompensa media, licencia). Como referencia categórica, existirían otros agentes tabulares del mismo entorno publicados en el Hub y derivados de cursos de RL, pero no se dispone de sus métricas en esta búsqueda, por lo que cualquier comparación numérica sería inventada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| njdonato/taxi | Tabla Q tabular (tamaño no declarado) | No aplica | 7,56 ± 2,71 (Taxi-v4, no verificado) | No disponible | Hugging Face, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Resultado no verificado**: el `mean_reward` está marcado como `verified: false` y no se documenta el protocolo de evaluación; no debe citarse como cifra de referencia sin reproducirlo.
- **Discrepancia de entorno**: los metadatos apuntan a Taxi-v4 y la model card menciona Taxi-v3; hay que comprobar `env_id` en el pickle antes de evaluar.
- **Licencia ausente**: sin licencia declarada no hay autorización explícita de uso comercial; en producción esto es un bloqueo legal, no un detalle.
- **Riesgo de deserialización**: el formato `.pkl` permite ejecución de código arbitrario al cargar el fichero; tratar como artefacto no confiable.
- **Falta de reproducibilidad**: no se publican hiperparámetros, semillas, número de episodios ni versión de Gymnasium, por lo que el entrenamiento no se puede replicar.
- **Varianza alta**: ±2,71 sobre una media de 7,56 sugiere una política ruidosa; parte de los episodios podría tener recompensas bajas o negativas.
- **Generalización nula**: la política solo es válida para el entorno y la configuración exactos de entrenamiento (incluida la dinámica de deslizamiento); no transfiere a otros MDP ni a estados continuos.
- **Sin sesgos lingüísticos ni de contenido**: al no procesar lenguaje natural no hay riesgo de sesgo textual, alucinación o toxicidad, pero tampoco hay salvaguardas aplicables.
- **Madurez**: 0 descargas y 0 likes; el artefacto no ha sido validado por la comunidad y su model card es una plantilla sin información técnica sustancial.
- **No apto para producción**: es una demo educativa, no un componente con SLA, versionado semántico ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/njdonato/taxi
- Búsqueda web realizada: no se han encontrado papers, blogs, repositorios ni demos relevantes sobre este modelo; los resultados devueltos corresponden a servicios de traducción sin relación con el artefacto.
