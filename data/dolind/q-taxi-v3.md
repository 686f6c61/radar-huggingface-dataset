# dolind/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo entrenado mediante Q-Learning tabular para resolver el entorno Taxi-v3 de Gymnasium. Lo desarrolla el usuario dolind y se distribuye a través de Hugging Face Hub como un artefacto serializado en formato pickle (`q-learning.pkl`), no como un modelo de lenguaje. El entorno Taxi-v3 es un problema discreto de 500 estados y 6 acciones en el que un taxi debe recoger y dejar pasajeros en cuatro ubicaciones de una cuadrícula, con recompensas penalizadoras por cada paso.

El modelo no emplea redes neuronales ni transformers: se trata de una tabla Q clásica, por lo que su huella computacional es mínima y su despliegue no requiere GPU. Es relevante únicamente como referencia didáctica o como baseline para experimentos de RL en entornos discretos, no como componente de sistemas de producción basados en lenguaje.

La model card declara un recompensa media de 7,48 ± 2,74 en Taxi-v3, un valor que indica un rendimiento por debajo de las políticas óptimas típicas del entorno (que suelen rondar recompensas medias superiores a 8-9 con políticas bien entrenadas). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se especifica licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q, sin red neuronal) |
| Parametros totales | no disponible (tabla Q de 500 estados × 6 acciones en Taxi-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pickle (`.pkl`) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clásico, un algoritmo de diferencias temporales off-policy que actualiza una tabla Q(state, action) mediante la regla de Bellman con una tasa de aprendizaje y un factor de descuento. El entorno Taxi-v3 es totalmente observable y discreto, con 500 estados y 6 acciones, por lo que una tabla Q es suficiente y no requiere aproximación funcional. No hay información en la model card sobre hiperparámetros (alpha, gamma, epsilon, número de episodios) ni sobre la política de exploración empleada.

No se dispone de datos sobre el número de episodios de entrenamiento, la composición del dataset (el entorno es determinista salvo por la opción `is_slippery`), ni sobre técnicas de estabilización. La model card menciona únicamente la carga del artefacto serializado y la creación del entorno con `gym.make(model["env_id"])`, advirtiendo que pueden ser necesarios atributos adicionales como `is_slippery=False`.

## Capacidades

- Resolución del entorno Taxi-v3 mediante política greedy derivada de la tabla Q.
- Aprendizaje por refuerzo tabular en entornos discretos y totalmente observables.
- Serialización y carga mediante `load_from_hub` de Hugging Face Hub.
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes multi-step basados en lenguaje.
- No tiene capacidades multilingües.
- No dispone de modo thinking, audio ni ninguna capacidad multimodal.

## Casos de uso

- Baseline didáctico en cursos de RL: el agente sirve como ejemplo mínimo de Q-Learning tabular para ilustrar la actualización de Bellman y la política greedy en un entorno de 500 estados.
- Comparación de algoritmos en Taxi-v3: puede usarse como referencia para contrastar Q-Learning con SARSA, Double Q-Learning o métodos basados en redes neuronales profundas en el mismo entorno.
- Pruebas de infraestructura de RL: permite validar pipelines de carga de artefactos desde Hugging Face Hub y de ejecución con Gymnasium sin coste computacional apreciable.
- Reproducción de experimentos docentes: al ser un artefacto pequeño y determinista, facilita la replicación de resultados en aulas o laboratorios.
- Evaluación de políticas en entornos discretos: útil para medir recompensa media y varianza en Taxi-v3 con distintas semillas.
- Prototipado de sistemas de dispatch simplificados: Taxi-v3 es una abstracción de logística de recogida y entrega, por lo que el agente puede servir como demostración conceptual de planificación en cuadrículas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,48 ± 2,74 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el agente es una tabla Q tabular y no requiere GPU.
- GPU recomendadas: ninguna; ejecutable en CPU.
- Cabe en cualquier equipo consumer, incluidos Raspberry Pi y entornos sin acelerador.
- Despliegue: carga del pickle mediante `load_from_hub` y ejecución con Gymnasium; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser una consulta de tabla, la latencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dolind/q-Taxi-v3 | Q-Learning tabular | Taxi-v3 | tabla Q (500 × 6) | no disponible | Hugging Face Hub |
| Agentes SARSA en Taxi-v3 | SARSA tabular | Taxi-v3 | tabla Q equivalente | variable | repositorios comunitarios |
| Agentes DQN en Taxi-v3 | Deep Q-Network | Taxi-v3 | red neuronal pequeña | variable | repositorios comunitarios |
| Política óptima Taxi-v3 | programación dinámica | Taxi-v3 | tabla Q | no aplica | literatura de RL |

No se dispone de datos comparativos de rendimiento verificados para estos alternativas en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento declarado (7,48 ± 2,74) por debajo de políticas óptimas habituales en Taxi-v3; puede indicar convergencia incompleta o exploración insuficiente.
- Métrica no verificada (`verified: false`); no hay evidencia independiente de la recompensa reportada.
- El artefacto es un pickle; la carga de pickles de origen no confiable supone un riesgo de ejecución de código arbitrario.
- Dependencia del entorno Gymnasium y de atributos como `is_slippery`; cambios en la configuración invalidan la política.
- Licencia no especificada: no hay autorización explícita para uso comercial ni para redistribución.
- Sin soporte de lenguaje, visión ni tool calling; no apto para aplicaciones de NLP.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica (no genera texto).
- Limitaciones de contexto o idioma: no aplica.
- Caveat de producción: al ser un agente tabular para un entorno concreto, no generaliza fuera de Taxi-v3.

## Enlaces

- Hugging Face: https://huggingface.co/dolind/q-Taxi-v3
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de Hugging Face Hub para RL: https://huggingface.co/docs/hub/en/models-downloading
