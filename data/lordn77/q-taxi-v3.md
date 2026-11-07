# LordN77/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo tabular basado en Q-learning, entrenado desde cero por el usuario LordN77 sobre el entorno `Taxi-v3` de Gymnasium. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q de 500 estados por 6 acciones que se ha publicado en Hugging Face como parte de la resolución del ejercicio practico de la Unidad 2 del curso Deep RL de Hugging Face. Su relevancia es, por tanto, fundamentalmente didactica y de referencia para quienes siguen ese itinerario formativo.

El repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y no declara licencia ni idiomas soportados (conceptos que, por otra parte, no aplican a un agente tabular sobre un entorno de gridworld). El artefacto principal es un checkpoint `q-learning.pkl` que contiene la Q-table y los hiperparametros de entrenamiento, acompanado de un `replay.mp4` con el primer episodio de evaluacion.

El modelo declara un resultado de recompensa media de 7.50 con desviacion tipica poblacional de 2.71 sobre 100 episodios de evaluacion con politica greedy, lo que arroja una puntuacion de curso (media menos desviacion) de 4.79. Estos datos no estan verificados por el hub (`verified: false`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q, sin red neuronal) |
| Parametros totales | 500 estados x 6 acciones = 3.000 valores Q |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de un solo paso con estado discreto) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`), mas `replay.mp4` |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular clasico sobre el entorno `Taxi-v3` de Gymnasium, un gridworld de 5x5 con 500 estados discretos y 6 acciones posibles (moverse en las cuatro direcciones, recoger pasajero y dejarlo). La tabla Q almacena un valor por cada par estado-accion y se actualiza mediante la regla de actualizacion de Q-learning (off-policy, basada en la ecuacion de Bellman con la accion de maximo valor del estado siguiente). No hay funcion de aproximacion, ni red neuronal, ni representacion de caracteristicas: el agente memoriza directamente los valores.

El entrenamiento se realizo durante 25.000 episodios con semilla 42. La evaluacion se llevo a cabo sobre 100 episodios aplicando una politica greedy pura sobre la tabla aprendida. No se documentan en la informacion disponible la tasa de aprendizaje, el factor de descuento, la politica de exploracion (epsilon-greedy u otra) ni el esquema de decaimiento empleado, por lo que esos hiperparametros deben consultarse directamente en el checkpoint `q-learning.pkl`. No se menciona ningun tipo de RLHF, DPO ni innovacion tecnica adicional; el valor del artefacto es su trazabilidad didactica.

## Capacidades

- Resolucion del entorno `Taxi-v3`: recoger un pasajero y dejarlo en la ubicacion destino dentro de un gridworld de 5x5.
- Politica determinista greedy derivada de la tabla Q aprendida.
- Aprendizaje por refuerzo tabular off-policy (Q-learning) con actualizacion de valores por estado-accion.
- Persistencia del estado aprendido en un checkpoint pickle que incluye la Q-table y los ajustes de entrenamiento.
- Generacion de una grabacion de replay (`replay.mp4`) del primer episodio de evaluacion.
- No soporta tool calling, function calling, agentes multi-paso fuera del entorno, capacidades multilingues, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como referencia resuelta de la Unidad 2 del curso Deep RL de Hugging Face, permitiendo comparar la implementacion propia con un agente ya entrenado sobre el mismo entorno.
- Verificacion de pipelines de entrenamiento: al fijar semilla 42 y 25.000 episodios, permite reproducir el experimento y comprobar si una implementacion de Q-learning produce resultados equivalentes.
- Benchmark de referencia para entornos tabulares: la recompensa media de 7.50 +/- 2.71 sobre 100 episodios greedy ofrece una linea base contra la que comparar variantes (SARSA, Double Q-learning, epsilon-greedy con distintos decaimientos).
- Analisis de sensibilidad a hiperparametros: el checkpoint `q-learning.pkl` permite inspeccionar la Q-table resultante y estudiar como se distribuyen los valores por estado y accion.
- Material de demostracion visual: el `replay.mp4` se puede usar en clases o presentaciones para mostrar el comportamiento de una politica greedy entrenada sobre Taxi-v3.
- Pruebas de integracion con Gymnasium 0.29.1: util para validar que un entorno de evaluacion carga correctamente el checkpoint y reproduce la recompensa declarada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por el hub):

| Metrica | Dataset | Valor |
|---|---|---|
| mean_reward | Taxi-v3 | 7.50 +/- 2.71 |
| Course score (media - desviacion) | Taxi-v3 | 4.79 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparaciones con otros agentes en la model card ni en los resultados de busqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. La Q-table ocupa 500 x 6 valores en memoria, es decir, unos pocos kilobytes; el checkpoint pickle completo es de tamano despreciable (el repositorio declara 0.0 GB).
- GPU recomendadas: no se requiere GPU. El agente se ejecuta en CPU sin coste apreciable.
- Compatibilidad con GPU de consumo: irrelevante; cualquier CPU moderna es suficiente.
- Opciones de despliegue: carga del checkpoint con `pickle` y uso directo de la tabla Q en un bucle de interaccion con Gymnasium 0.29.1. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; en la practica, la inferencia consiste en una busqueda en tabla con coste O(1) por paso.

## Comparativa con modelos similares

| Modelo | Entorno | Metodo | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LordN77/q-Taxi-v3 | Taxi-v3 | Q-learning tabular | 7.50 +/- 2.71 | no disponible | Hugging Face |
| linksaiyajin/q-Taxi-v3 | Taxi-v3 | Q-learning | no disponible | no disponible | Hugging Face |
| jonnynd/Taxi-v3 | Taxi-v3 | Q-learning | no disponible | no disponible | Hugging Face |

Los dos modelos comparables detectados en la busqueda web resuelven el mismo entorno con la misma familia de algoritmos, pero no publican metricas en la informacion disponible, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- El modelo solo es valido para el entorno `Taxi-v3`; no generaliza a otros entornos ni a variantes del problema.
- La Q-table es especifica de la discretizacion de 500 estados y 6 acciones de Taxi-v3; cualquier cambio en la definicion del entorno invalida el checkpoint.
- La recompensa declarada no esta verificada por el hub (`verified: false`) y proviene unicamente del autor.
- La desviacion tipica de 2.71 sobre una media de 7.50 indica una varianza considerable entre episodios; el rendimiento no es uniforme.
- No se declara licencia, lo que impide determinar las condiciones de uso comercial o de redistribucion.
- El checkpoint se distribuye en formato pickle; cargarlo implica ejecucion de codigo Python, por lo que solo debe hacerse desde fuentes de confianza, tal como advierte el propio autor.
- Requiere Gymnasium 0.29.1 para reproducir la evaluacion; otras versiones pueden alterar la dinamica del entorno o la interfaz de la API.
- No hay informacion sobre sesgos, alucinacion ni comportamiento multilingue porque estos conceptos no aplican a un agente tabular.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LordN77/q-Taxi-v3
- Curso Deep RL, Unidad 2 (ejercicio de referencia): https://huggingface.co/learn/deep-rl-course/unit2/hands-on
- Modelo comparable: https://huggingface.co/linksaiyajin/q-Taxi-v3
- Modelo comparable: https://huggingface.co/jonnynd/Taxi-v3
