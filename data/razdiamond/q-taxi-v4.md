# razdiamond/q-Taxi-v4

## Resumen

q-Taxi-v4 es un agente de aprendizaje por refuerzo (Q-Learning tabular) entrenado para resolver el entorno **Taxi-v4** de Gymnasium, una variante del clásico problema del taxi en una cuadrícula. Lo publica el usuario `razdiamond` en Hugging Face y se distribuye como un fichero serializado (`q-learning.pkl`) que contiene la tabla Q y los metadatos del entorno, no como pesos de una red neuronal. No se trata, por tanto, de un modelo de lenguaje: es un artefacto de RL clásico pensado para cargarse con `load_from_hub` y evaluarse contra el entorno Gymnasium correspondiente.

El modelo es relevante únicamente como referencia educativa o como baseline reproducible para experimentos de Q-Learning tabular sobre Taxi. No hay información sobre arquitectura neuronal, tamaño de parámetros, contexto ni idiomas porque no aplica: el "modelo" es una tabla de valores Q para un espacio de estados discreto. La model card declara un resultado de `mean_reward` de 7.56 ± 2.71 sobre Taxi-v3 (el `model-index` mantiene el nombre v3 aunque el título del README mencione v4), con `verified: false`.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, tamaño de 0.0 GB y fecha de creación en noviembre de 2026. La licencia no está declarada, lo que impide asumir permisos de uso comercial. En conjunto, se trata de un artefacto de bajo perfil, útil para reproducir un ejercicio de RL, no para despliegues en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q sobre espacio de estados discreto de Taxi) |
| Parametros totales | no disponible (no es una red neuronal; tamaño de la tabla Q no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponibles (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | fichero `.pkl` (`q-learning.pkl`) con tabla Q y metadatos del entorno |
| Entorno | Taxi-v4 (Gymnasium), segun README; `model-index` referencia Taxi-v3 |
| Pipeline | reinforcement-learning |
| Descargas / likes | 0 / 0 |
| Tamaño del repo | 0.0 GB |

## Arquitectura y entrenamiento

Se trata de un agente de Q-Learning tabular, no de un transformer ni de una red neuronal profunda. El artefacto publicado es un diccionario serializado en pickle que contiene la tabla Q aprendida y, presumiblemente, el identificador del entorno (`env_id`) y otros metadatos necesarios para reconstruir la política. La política de actuación se deriva de la tabla Q mediante selección greedy (argmax) sobre las acciones disponibles en cada estado.

No se dispone de información sobre hiperparámetros de entrenamiento (tasa de aprendizaje, factor de descuento, política de exploración epsilon-greedy, número de episodios), composición de datos ni técnicas de estabilización. Tampoco se documenta si el entrenamiento se realizó con la variante determinista o estocástica del entorno (`is_slippery`), aunque el README advierte explícitamente de que puede ser necesario ajustar atributos del entorno al cargarlo. El `model-index` declara un `mean_reward` de 7.56 ± 2.71, sin verificación externa.

## Capacidades

- Resolución del entorno Taxi-v4 de Gymnasium mediante política greedy derivada de la tabla Q.
- Carga directa desde Hugging Face con `load_from_hub(repo_id="razdiamond/q-Taxi-v4", filename="q-learning.pkl")`.
- Integración con Gymnasium: el README sugiere `gym.make(model["env_id"])` para reconstruir el entorno.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingües, de visión, audio ni modo "thinking".
- No soporta agentes conversacionales ni generación de texto.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo funcional de Q-Learning tabular en un curso introductorio, cargándolo con `load_from_hub` y evaluándolo contra Taxi-v4 para ilustrar la convergencia de la tabla Q.
- Baseline reproducible en investigación: comparar nuevas variantes (Double Q-Learning, SARSA, Q-Learning con function approximation) contra este agente en el mismo entorno y con la misma métrica `mean_reward`.
- Pruebas de infraestructura de RL: validar pipelines de evaluación (por ejemplo, `stable-baselines3` o `rl-baselines3-zoo`) usando este artefacto como entrada conocida y comprobando que se carga y se ejecuta correctamente.
- Demostración de entornos Gymnasium: integrar el agente en un notebook o tutorial que muestre cómo se resuelve Taxi-v4 paso a paso, visualizando la política sobre la cuadrícula.
- Test de regresión de entornos: verificar que una versión concreta de Gymnasium mantiene la compatibilidad con el `env_id` y los atributos declarados en el pickle.
- Referencia para comparativas de sample efficiency: usar el `mean_reward` declarado (7.56 ± 2.71) como punto de partida al evaluar métodos que requieren menos episodios de entrenamiento.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.56 +/- 2.71 | false |

No se han publicado otros resultados de benchmarks en la información disponible. No hay comparación con otros agentes en la model card.

## Requisitos de hardware

- VRAM: no aplica; el artefacto es una tabla Q en un fichero `.pkl` de tamaño despreciable (repo de 0.0 GB).
- GPU: no requiere GPU; la inferencia es una búsqueda en tabla sobre estados discretos y se ejecuta en CPU.
- Consumer GPU: irrelevante; cabe en cualquier equipo, incluidos entornos sin aceleración.
- Despliegue: carga mediante `huggingface_hub.load_from_hub` y ejecución con Gymnasium (`gym.make`). No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; dependen del bucle de simulación de Gymnasium, no del modelo.

## Comparativa con modelos similares

| Modelo | Entorno | Metodo | Metrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| razdiamond/q-Taxi-v4 | Taxi-v4 (README) / Taxi-v3 (model-index) | Q-Learning tabular | mean_reward 7.56 +/- 2.71 (no verificado) | no disponible | Hugging Face, 0 descargas |
| Agentes de `rl-baselines3-zoo` para Taxi | Taxi-v3 | DQN, PPO, A2C (redes neuronales) | no disponible en esta ficha | MIT (el zoo) | GitHub |
| Implementaciones tabulares de referencia en tutoriales de Gymnasium | Taxi-v3 | Q-Learning tabular | no disponible en esta ficha | variable segun tutorial | Multiples |

No se dispone de datos comparativos verificados en la información proporcionada. La comparación con agentes neuronales (DQN, PPO) no es directa porque el espacio de estados de Taxi es discreto y el Q-Learning tabular es suficiente para resolverlo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling.
- El `model-index` referencia Taxi-v3 mientras que el README habla de Taxi-v4; conviene verificar el `env_id` guardado en el pickle antes de usarlo.
- El README advierte de que puede ser necesario ajustar atributos del entorno (`is_slippery=False`, etc.) al cargar el modelo; ignorarlo puede invalidar la política aprendida.
- El resultado `mean_reward` de 7.56 ± 2.71 está marcado como `verified: false`; no ha sido reproducido de forma independiente.
- No se documentan hiperparámetros de entrenamiento ni número de episodios, lo que dificulta la reproducibilidad.
- La licencia no está declarada: no se puede asumir permiso para uso comercial ni para redistribución.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- El agente está especializado exclusivamente en Taxi; no generaliza a otros entornos sin reentrenamiento.
- Riesgo de sobreajuste a la configuración exacta del entorno (versión de Gymnasium, semilla, dinámica estocástica) con la que se entrenó.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/razdiamond/q-Taxi-v4
- Entorno Taxi de Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de `load_from_hub` (huggingface_hub): https://huggingface.co/docs/huggingface_hub
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
- Repositorio de Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
