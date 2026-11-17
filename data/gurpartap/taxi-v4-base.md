# Gurpartap/Taxi-v4-base

## Resumen

Taxi-v4-base es un agente de aprendizaje por refuerzo entrenado con Q-Learning sobre el entorno Taxi-v4 de Gymnasium. Lo publica el usuario Gurpartap en Hugging Face como un artefacto de tipo `reinforcement-learning`, con un único fichero de pesos en formato pickle (`q-learning.pkl`) que contiene la tabla Q y los metadatos del entorno. No es un modelo de lenguaje ni una red neuronal profunda: es una implementación tabular clásica aplicada a un problema de planificación con recompensa dispersa.

El modelo resuelve la tarea de recoger y dejar pasajeros en una cuadrícula de 5x5 con cuatro ubicaciones de recogida y entrega, un total de 500 estados discretos y 6 acciones posibles. Su relevancia es fundamentalmente didáctica y de referencia: sirve como línea base reproducible para comparar algoritmos de RL más sofisticados (DQN, PPO, A2C) sobre el mismo entorno, y como ejemplo mínimo de integración con el ecosistema `stable-baselines3` y el hub de Hugging Face.

La información publicada es muy escasa: el repositorio ocupa 0.0 GB, no declara licencia, no especifica idiomas y no incluye documentación sobre hiperparámetros, semillas ni número de episodios de entrenamiento. El autor reporta una recompensa media de 7.52 +/- 2.77 en la model card, sin verificación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q sobre espacio de estados discreto) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones como maximo teorico) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de un solo paso con estado discreto) |
| Tipos de cuantizacion | no disponible (pesos en pickle, sin cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular, un algoritmo de diferencias temporales off-policy que aprende una función de valor-acción Q(s, a) mediante actualizaciones iterativas de Bellman. El entorno Taxi-v4 de Gymnasium define 500 estados discretos (25 posiciones del taxi x 5 posiciones de pasajero x 4 destinos) y 6 acciones (moverse al norte, sur, este, oeste, recoger y dejar). La tabla Q resultante tiene, por tanto, un tamaño máximo de 500 x 6 entradas.

No se dispone de información sobre el número de episodios de entrenamiento, la tasa de aprendizaje, el factor de descuento, la política de exploración (epsilon-greedy u otra) ni las semillas utilizadas. La model card únicamente indica que se trata de un agente de Q-Learning entrenado sobre Taxi-v4 y que los pesos se cargan con `load_from_hub`, advirtiendo de la necesidad de comprobar atributos del entorno como `is_slippery`. No se documenta ningún uso de RLHF, DPO ni técnicas de aprendizaje profundo.

## Capacidades

- Resolución del entorno Taxi-v4: recoger y entregar pasajeros en una cuadrícula 5x5 con recompensa dispersa.
- Política determinista derivada de la tabla Q aprendida (argmax sobre acciones).
- Integración con Gymnasium mediante `gym.make(model["env_id"])`.
- Carga de pesos desde el hub de Hugging Face con `load_from_hub`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso fuera del propio entorno de RL.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Línea base en investigación de RL: comparar la recompensa media de Q-Learning tabular (7.52 +/- 2.77) con la de algoritmos deep RL como DQN o PPO sobre el mismo Taxi-v4, para justificar la complejidad adicional.
- Docencia de aprendizaje por refuerzo: ilustrar el funcionamiento de las actualizaciones de Bellman y la exploración epsilon-greedy en un entorno con espacio de estados pequeño y verificable manualmente.
- Test de integración de pipelines: validar flujos de `stable-baselines3` + Hugging Face Hub antes de escalar a entornos y modelos más costosos.
- Reproducción de experimentos: servir como artefacto de referencia para comprobar que una instalación de Gymnasium y las dependencias de RL funcionan correctamente.
- Benchmarking de entornos: medir la varianza de recompensa entre episodios (desviación de 2.77) para caracterizar la dificultad intrínseca de Taxi-v4.
- Demostraciones educativas: mostrar en un notebook cómo se carga un agente desde el hub, se ejecuta en el entorno y se visualiza la política aprendida.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| Taxi-v4 | mean_reward | 7.52 +/- 2.77 | No |

No se han publicado resultados adicionales de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; la tabla Q en memoria ocupa unos pocos kilobytes.
- GPU recomendadas: no necesaria; la inferencia es una búsqueda en tabla y se ejecuta en CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna, incluidos entornos sin aceleración.
- Opciones de despliegue: Python con Gymnasium y `stable-baselines3`; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del bucle de simulación del entorno, no del modelo.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gurpartap/Taxi-v4-base | Q-Learning tabular | Taxi-v4 | Tabla Q (500x6 max.) | no aplica | no disponible | Hugging Face |
| Agentes DQN sobre Taxi-v4 | Deep Q-Network | Taxi-v4 | Red pequeña (MLP) | no aplica | variable | Implementaciones en stable-baselines3 |
| Agentes PPO sobre Taxi-v4 | PPO | Taxi-v4 | Red pequeña (MLP) | no aplica | variable | Implementaciones en stable-baselines3 |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un agente tabular sobre un entorno sintético, no hay sesgos de datos reales, pero la política puede ser subóptima si el entrenamiento fue insuficiente.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero la política puede tomar acciones erróneas en estados poco visitados durante el entrenamiento.
- Limitaciones de contexto o idioma: el modelo solo opera sobre Taxi-v4; no generaliza a otros entornos ni tareas.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar si se permite uso comercial; se recomienda contactar con el autor antes de cualquier uso en producción.
- Caveats para producción: el formato pickle puede suponer riesgos de seguridad al deserializar ficheros no confiables; la falta de documentación sobre hiperparámetros y semillas dificulta la reproducibilidad; el autor advierte de comprobar atributos del entorno como `is_slippery` antes de ejecutar.

## Enlaces

- Hugging Face: https://huggingface.co/Gurpartap/Taxi-v4-base
- Entorno Taxi-v4 de Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de stable-baselines3: https://stable-baselines3.readthedocs.io/
- Resultado de búsqueda web (NYC Open Data, no relacionado con el modelo): https://data.cityofnewyork.us/api/views/inv2-dzmf/rows.pdf?app_token=U29jcmF0YS0td2VraWNrYXNz0
