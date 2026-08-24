# herurg/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo entrenado con Q-learning para resolver el entorno Taxi-v3 de OpenAI Gym, un problema clásico de navegación en el que un taxi debe recoger a un pasajero y llevarlo a su destino en un grid de 5x5. Lo desarrolla el usuario herurg como parte de la Unidad 2 del curso de Deep Reinforcement Learning de Hugging Face, con fines educativos y de demostración. A diferencia de los modelos generativos de lenguaje, este no es un modelo neuronal de gran tamaño, sino una tabla Q de dimensiones reducidas que mapea cada estado del entorno a una política de acción óptima. Su relevancia radica en ser un ejemplo mínimo y reproducible de cómo un agente puede aprender a interactuar con un entorno mediante refuerzo, y su inclusión en el Hub de Hugging Face sirve como material didáctico para estudiantes de RL. El repositorio ocupa 0.0 GB y no se dispone de información sobre licencia ni idiomas soportados, dado que no se trata de un modelo de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning con tabla Q (sin red neuronal) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones, segun el entorno Taxi-v3) |
| Parametros activos | no disponible (no aplica, no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de aprendizaje por refuerzo) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente tabla Q en archivo binario o numpy) |

## Arquitectura y entrenamiento

El modelo implementa el algoritmo Q-learning tabular, una técnica de aprendizaje por refuerzo sin modelos que estima la funcion de valor de acción Q(s, a) para cada par estado-accion. El entorno Taxi-v3 presenta un grid de 5x5 con 500 estados discretos (posicion del taxi, ubicacion del pasajero y destino) y 6 acciones (mover en cuatro direcciones, recoger y dejar). El agente se entrena mediante la actualizacion de la tabla Q con la ecuacion de Bellman, explorando con una politica epsilon-greedy. Segun la model card, el entrenamiento se realizo en el marco del curso de Deep RL de Hugging Face (Unidad 2), y el autor indica que la evaluacion final se ejecuto con el entorno `Taxi-v4` de Gymnasium, ya que `Taxi-v3` esta deprecado en las versiones actuales de la libreria. No se especifican hiperparametros (tasa de aprendizaje, factor de descuento, numero de episodios) en la informacion disponible.

## Capacidades

- Resolucion del entorno Taxi-v3: el agente aprende a navegar el grid, recoger y dejar pasajeros de forma eficiente.
- Toma de decisiones secuencial: optimiza la politica de acciones para maximizar la recompensa acumulada.
- Aprendizaje por refuerzo basico: demuestra la convergencia de Q-learning en un entorno de espacio de estados discreto.
- No soporta generacion de texto, codigo, vision ni tool calling: es un agente de RL clasico, no un modelo de lenguaje.

## Casos de uso

- Educacion en aprendizaje por refuerzo: el modelo sirve como ejemplo practico en cursos y tutoriales para ilustrar el funcionamiento de Q-learning tabular, la exploracion versus explotacion y la evaluacion de politicas. Se puede ejecutar en un notebook para visualizar la tabla Q y el comportamiento del agente.
- Benchmark de algoritmos de RL: investigadores y estudiantes pueden comparar este agente con otras implementaciones de Q-learning o con agentes basados en redes neuronales (como DQN) en el mismo entorno, midiendo recompensa media y episodios necesarios para converger.
- Prueba de pipelines de evaluacion: sirve para validar herramientas de evaluacion de agentes RL en Hugging Face, ya que se puede cargar desde el Hub y ejecutar con las utilidades de la libreria de RL.
- Prototipo de integracion con Gymnasium: desarrolladores que trabajan con la libreria Gymnasium pueden usar este modelo para probar integraciones con frameworks de RL (Stable-Baselines3, etc.) o para generar datos de demostracion.
- Referencia de compatibilidad: la nota del autor sobre el uso de `Taxi-v4` en lugar de `Taxi-v3` lo convierte en un caso util para entender la migracion de entornos deprecados en el ecosistema Gym.
- Analisis de convergencia: se puede utilizar para estudiar la influencia de los hiperparametros de Q-learning (tasa de aprendizaje, gamma, epsilon) en la recompensa final, comparando las metricas declaradas (recompensa media 7.52) con las obtenidas en nuevos entrenamientos.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card, obtenidos con 100 episodios de evaluacion en el entorno Taxi-v3 (aunque se evaluo con `Taxi-v4` segun la nota de compatibilidad):

| Entorno | Metrica | Valor | Verificado |
|---|---|---|---|
| Taxi-v3 | Recompensa media | 7.52 +/- 2.73 | no |
| Taxi-v3 | Resultado (media - desviacion) | 4.79 | no |
| Taxi-v3 | Resultado requerido (curso) | 4.5 | - |

No se han publicado comparaciones con otros modelos en la informacion disponible. La recompensa media de 7.52 con desviacion de 2.73 indica que el agente resuelve el entorno de forma parcialmente optima, pero con una variabilidad considerable entre episodios.

## Requisitos de hardware

- Inferencia en CPU: el modelo no requiere GPU. La tabla Q es de dimensiones reducidas (500x6) y la ejecucion del agente en el entorno Gymnasium es inmediata.
- GPU recomendada: no se necesita ninguna. Un equipo con CPU basica es suficiente.
- Compatible con hardware consumer: si, cualquier ordenador con Python y Gymnasium instalado puede ejecutarlo.
- Opciones de despliegue: se puede integrar en entornos de evaluacion de Gymnasium, en scripts de Python con la libreria de Hugging Face `gymnasium` y en pipelines de CI para tests de RL. No se puede servir como API REST de generacion de texto ni con vLLM u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: la latencia por paso es del orden de milisegundos en CPU, y un episodio completo (hasta 200 pasos) se completa en menos de un segundo en hardware moderno.

## Comparativa con modelos similares

| Modelo | Autor | Recompensa media | Notas |
|---|---|---|---|
| q-Taxi-v3 (herurg) | herurg | 7.52 +/- 2.73 | Evaluado con Taxi-v4 |
| q-Taxi-v3 (Hiten1896) | Hiten1896 | no disponible | Mismo entorno y algoritmo |
| q-Taxi-v3 (nam194) | nam194 | no disponible | Mismo entorno y algoritmo |

No se dispone de resultados cuantitativos publicados para los otros dos modelos de la misma categoria. Todos comparten la arquitectura de Q-learning tabular y el objetivo de resolver Taxi-v3. La comparativa se limita al rendimiento declarado por el autor de herurg, que supera el umbral del curso (4.5) con un margen de 0.29.

## Limitaciones y advertencias

- Entorno deprecado: el agente se entreno y evaluo con `Taxi-v4` porque `Taxi-v3` esta deprecado en Gymnasium actual; si se ejecuta con la version antigua, el comportamiento puede diferir.
- Recompensa media baja: con una media de 7.52 y desviacion de 2.73, el agente no alcanza la politica optima (que en Taxi-v3 tiene recompensa media de alrededor de 8.5); puede cometer errores como recoger o dejar pasajeros en lugares incorrectos.
- Sin licencia declarada: no se especifica la licencia de uso, por lo que no se puede asumir permisos para uso comercial o redistribucion.
- No es un modelo de lenguaje: no se puede usar para generacion de texto, chat, codigo ni ninguna tarea de NLP; su aplicacion se limita al entorno Taxi-v3.
- Sin soporte de produccion: es una implementacion educativa sin garantias de robustez, sin soporte de tool calling y sin capacidad de adaptacion a otros entornos sin reentrenamiento.
- Riesgo de sobreajuste: el entrenamiento se realizo para un curso especifico, y el resultado declarado (4.79) apenas supera el requisito (4.5), lo que sugiere que el agente no esta optimizado para generalizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/herurg/q-Taxi-v3
- Modelo similar (Hiten1896): https://huggingface.co/Hiten1896/q-Taxi-v3
- Modelo similar (nam194): https://huggingface.co/nam194/q-Taxi-v3
- Proyecto de Q-learning en Taxi-v3 (GitHub): https://github.com/yatheshl/Q-Learning-Taxi-v3
- Proyecto alternativo de RL en Taxi-v3 (GitHub): https://github.com/peter-z3ng/csci323-drive-a-taxi
- Articulo sobre el modelo Fast-Taxi-v3 (fxis.ai): https://fxis.ai/edu/mastering-q-learning-with-the-fast-taxi-v3-model/
