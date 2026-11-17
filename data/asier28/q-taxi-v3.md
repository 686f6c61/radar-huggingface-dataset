# Asier28/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-Learning tabular para resolver el entorno Taxi-v4 de Gymnasium. Lo publica el usuario Asier28 en Hugging Face y no es un modelo de lenguaje ni una red neuronal profunda: se trata de un artefacto de política serializada (un fichero `q-learning.pkl`) que contiene la tabla Q aprendida durante el entrenamiento. El entorno Taxi-v4 es un problema clásico de planificación con 500 estados discretos (25 posiciones del taxi × 5 ubicaciones de pasajero × 4 destinos) y 6 acciones posibles.

Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo mínimo reproducible de un pipeline de RL clásico (definición de entorno, bucle de entrenamiento, evaluación y subida al Hub) y como punto de partida para comparar variantes de Q-Learning en el mismo entorno. No está pensado para tareas de generación, razonamiento ni procesamiento de lenguaje, y su huella es prácticamente nula (repo de 0.0 GB), lo que lo hace trivial de cargar y ejecutar en cualquier máquina.

El autor declara un `mean_reward` de 7.56 ± 2.71 sobre Taxi-v4, un valor que sitúa al agente por debajo del umbral típico de resolución del entorno (habitualmente considerado en torno a 8-9 de recompensa media), lo que sugiere una política funcional pero no plenamente óptima.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q sobre espacio de estados discreto) |
| Parametros totales | no disponible (tabla Q de 500 estados × 6 acciones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | fichero `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clásico, un método de diferencias temporales off-policy que actualiza una tabla Q indexada por pares (estado, acción). El espacio de estados de Taxi-v4 es finito y pequeño (500 estados), y el de acciones es discreto (6 acciones: mover norte, sur, este, oeste, recoger pasajero y dejar pasajero), por lo que una representación tabular es suficiente y no requiere aproximación funcional. El autor etiqueta el modelo como `custom-implementation`, lo que indica que el bucle de entrenamiento y la política de exploración no provienen de una librería estándar de RL, sino de una implementación propia.

No se dispone de información sobre hiperparámetros (tasa de aprendizaje, factor de descuento, política epsilon-greedy, número de episodios), composición del dataset (el propio entorno genera las transiciones) ni sobre si se aplicó alguna variante como Q-Learning con doble estimador o SARSA. Tampoco se documenta el proceso de evaluación más allá del `mean_reward` declarado en la model card. El único artefacto publicado es el fichero `q-learning.pkl`, que debe cargarse junto con el entorno `Taxi-v4` para su uso.

## Capacidades

- Resolución del entorno Taxi-v4: el agente es capaz de navegar la cuadrícula, recoger al pasajero y dejarlo en el destino dentro del entorno de Gymnasium.
- Política greedy determinista: una vez cargada la tabla Q, la acción se selecciona como `argmax` sobre las acciones disponibles en cada estado.
- Reproducibilidad: al ser un entorno determinista en su dinámica de estados (salvo la estocasticidad propia de Taxi-v4), el comportamiento es reproducible dado el mismo estado inicial.
- Integración con Gymnasium: se carga mediante `load_from_hub` y se ejecuta con `gym.make(model["env_id"])`.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modos de razonamiento extendido.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el agente sirve como ejemplo mínimo y ejecutable para introducir Q-Learning tabular, mostrando el ciclo completo de entrenamiento, evaluación y publicación en el Hub.
- Prueba de pipelines de RL: permite validar infraestructura de carga de políticas desde Hugging Face (`load_from_hub`) y ejecución con Gymnasium sin coste computacional apreciable.
- Baseline de comparación: al ser un agente tabular sobre Taxi-v4, se puede usar como referencia inferior frente a variantes como Double Q-Learning o SARSA(λ) en el mismo entorno.
- Reproducción de experimentos: investigadores que necesiten un agente ya entrenado para reproducir curvas de recompensa o estudiar la varianza del `mean_reward` (7.56 ± 2.71) pueden cargarlo directamente.
- Demostraciones interactivas: al ser un fichero pickle pequeño, se puede integrar en notebooks o demos web que visualicen la política del taxi paso a paso.
- Test de regresión en librerías de RL: útil para comprobar que una versión nueva de Gymnasium o de una librería de carga de modelos sigue interpretando correctamente el formato `q-learning.pkl`.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7.56 +/- 2.71 |

No se han publicado resultados de benchmarks adicionales en la información disponible. No hay comparación con otros agentes en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (no requiere GPU; la tabla Q cabe en memoria principal sin problema).
- GPU recomendadas: no aplica; cualquier CPU es suficiente.
- Cabe en cualquier hardware consumer: sí, incluyendo Raspberry Pi y entornos sin aceleración.
- Opciones de despliegue: Python con `gymnasium` y `pickle`/`huggingface_hub`; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma oficial; al ser una consulta a tabla, la latencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Asier28/q-Taxi-v3 | Q-Learning tabular | Taxi-v4 | Tabla Q (500×6) | no aplica | no disponible | Hugging Face |
| Agentes Q-Learning de la comunidad en Taxi-v4 | Q-Learning tabular | Taxi-v4 | Tabla Q similar | no aplica | variable | Hugging Face (múltiples) |
| Agentes DQN sobre Taxi-v4 | Deep Q-Network | Taxi-v4 | Red pequeña (MLP) | no aplica | variable | Repositorios de RL |
| Agentes PPO sobre Taxi-v4 | Policy Gradient | Taxi-v4 | Red pequeña (MLP) | no aplica | variable | Repositorios de RL |

No se dispone de datos comparativos de rendimiento publicados en la información proporcionada para estas alternativas; la comparación se limita a la categoría de algoritmo y entorno.

## Limitaciones y advertencias

- El `mean_reward` declarado (7.56 ± 2.71) está por debajo del umbral habitual de resolución de Taxi-v4 (en torno a 8-9), por lo que la política puede no ser óptima.
- El resultado no está verificado (`verified: false`) y no se documentan hiperparámetros ni número de episodios, lo que impide reproducir el entrenamiento con exactitud.
- La licencia no está especificada, lo que impide confirmar si se permite uso comercial o redistribución.
- Al ser un fichero pickle, existe riesgo de seguridad al cargarlo desde fuentes no confiables (ejecución de código arbitrario durante la deserialización); conviene revisar el origen.
- No es un modelo de lenguaje: no tiene capacidades de generación, razonamiento, código, matemáticas, visión ni multilingüismo.
- Depende de la versión de Gymnasium y de la disponibilidad del entorno `Taxi-v4`; cambios en la API pueden romper la carga.
- No hay información sobre sesgos, alucinaciones ni comportamiento fuera del entorno Taxi-v4, porque el agente solo opera en ese espacio de estados.

## Enlaces

- Hugging Face: https://huggingface.co/Asier28/q-Taxi-v3
- Documentación de Gymnasium Taxi: https://gymnasium.farama.org/environments/toy_text/taxi/
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
- Documentación de Hugging Face Hub para RL: https://huggingface.co/docs/hub/en/models-the-hub
