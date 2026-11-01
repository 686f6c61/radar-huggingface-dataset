# JSI123/q-Taxi-v4

## Resumen

q-Taxi-v4 es un agente de aprendizaje por refuerzo basado en Q-Learning tabular, entrenado desde cero con Python, NumPy y Gymnasium sobre el entorno Taxi-v4. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q de 500 estados por 6 acciones que el autor, JSI123, publica como artefacto reproducible en HuggingFace. El repositorio tiene un tamano de 0.0 GB, lo que confirma que los pesos son una tabla discreta serializada en pickle, no un conjunto de tensores.

El interes del artefacto es fundamentalmente didactico y de validacion de pipelines: sirve como referencia minima de un agente RL que resuelve Taxi-v4 con una recompensa media de 7.5200 (desviacion tipica 2.7658) sobre 100 episodios de evaluacion, superando el objetivo de 4.5 fijado por el autor. El entorno Taxi-v4 es una variante de Gymnasium del clasico Taxi-v3 de la literatura RL, con espacio de estados de 500 y espacio de acciones de 6.

Es relevante ahora como ejemplo de publicacion reproducible de agentes RL tabulares: el autor incluye hiperparametros, semillas de evaluacion y metricas en `results.json`, ademas de una grabacion `replay.mp4`. No debe confundirse con un modelo generativo: no procesa texto, no tiene contexto en tokens ni cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q discreta, sin red neuronal) |
| Parametros totales | 500 estados x 6 acciones = 3000 entradas Q (tabla discreta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica (valores float en tabla pickle) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular clasico. El agente mantiene una tabla Q de dimension 500 x 6 (estados x acciones) e inicializa sus valores de forma implicita en el entrenamiento. Los hiperparametros declarados son: tasa de aprendizaje 0.7, factor de descuento 0.95, maximo de 99 pasos por episodio y politica de exploracion no especificada en la model card (habitualmente epsilon-greedy en este tipo de implementaciones, aunque el valor no se detalla). El entrenamiento se realizo integramente con Python, NumPy y Gymnasium, sin frameworks de deep learning.

El autor declara un entrenamiento inicial de 25000 episodios mas un presupuesto adicional de 175000 episodios, aunque aclara que el numero exacto de episodios adicionales completados no se registro por separado. La evaluacion se realizo sobre 100 episodios con semillas incluidas en el modelo guardado, reportando recompensa media 7.5200, desviacion tipica 2.7658 y recompensa media menos desviacion 4.7542, frente a un objetivo de 4.5. No hay innovaciones tecnicas destacables: es una implementacion de referencia sin decodificacion especulativa, atencion lineal ni mecanismos equivalentes.

## Capacidades

- Resolucion del entorno Taxi-v4 de Gymnasium: recoger y dejar pasajeros en las cuatro ubicaciones del mapa con 500 estados y 6 acciones.
- Politica determinista derivada de la tabla Q entrenada (argmax sobre acciones).
- Reproducibilidad: semillas de evaluacion e hiperparametros guardados junto con la tabla.
- Serializacion y carga via `pickle` en Python.
- No soporta tool calling ni function calling.
- No soporta agentes multi-step fuera del bucle episodico del entorno.
- No tiene capacidades multilingues ni procesamiento de texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Docencia de RL tabular: usar `q-learning.pkl` como ejemplo funcional de Q-Learning para explicar actualizacion de Bellman, exploracion y convergencia en un entorno de 500 estados.
- Validacion de pipelines de evaluacion: el `results.json` con recompensa media y desviacion tipica sirve como referencia para comprobar que un harness de evaluacion de Gymnasium reproduce los mismos numeros con las semillas guardadas.
- Baseline en experimentos de RL: comparar un agente tabular contra variantes con redes neuronales (DQN) en Taxi-v4 para medir la brecha de rendimiento y coste computacional.
- Test de integracion de entornos Gymnasium: verificar que la version de Gymnasium instalada expone Taxi-v4 con espacio de estados 500 y acciones 6 antes de migrar a entornos mas complejos.
- Demostracion visual: el `replay.mp4` permite mostrar el comportamiento del agente en una charla o tutorial sin necesidad de ejecutar codigo.
- Reproducibilidad de publicaciones: el artefacto incluye hiperparametros y semillas, lo que facilita replicar el resultado en un articulo o memoria tecnica.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Entorno | Taxi-v4 (Gymnasium) |
| Episodios de evaluacion | 100 |
| Recompensa media | 7.5200 |
| Desviacion tipica | 2.7658 |
| Media menos desviacion | 4.7542 |
| Objetivo declarado | 4.5 |

No se han publicado resultados de benchmarks comparativos con otros agentes en la informacion disponible. El autor advierte explicitamente de que el resultado corresponde a Taxi-v4 y no es un resultado oficial del leaderboard de Taxi-v3.

## Requisitos de hardware

- VRAM: no aplica; la tabla Q ocupa unos pocos kilobytes y se carga en RAM.
- GPU: no necesaria; la inferencia es una consulta a un array NumPy.
- Cabe en cualquier CPU consumer, Raspberry Pi incluida.
- Despliegue: script Python con `pickle` y `gymnasium`; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia: del orden de microsegundos por paso (una indexacion de array); el cuello de botella es el renderizado del entorno, no el agente.
- Throughput: limitado por la velocidad de `env.step()` de Gymnasium, no por el modelo.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Estados | Acciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| q-Taxi-v4 (JSI123) | Q-Learning tabular | Taxi-v4 | 500 | 6 | no disponible | HuggingFace |
| Agente DQN tipico | Deep Q-Network | Taxi-v3 | 500 | 6 | variable | implementaciones publicas |
| Agente SARSA tabular | SARSA | Taxi-v3 | 500 | 6 | variable | implementaciones publicas |

La comparacion con DQN y SARSA es cualitativa: no se dispone de resultados numericos de esos alternativas en la informacion proporcionada. La diferencia clave es que q-Taxi-v4 es tabular y determinista, mientras que DQN usa una red neuronal y SARSA es on-policy.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni respuestas; cualquier uso fuera del entorno Taxi-v4 carece de sentido.
- El resultado corresponde a Taxi-v4, no a Taxi-v3; no es comparable con el leaderboard oficial de Taxi-v3.
- No se especifica la politica de exploracion (epsilon, decaimiento) en la model card.
- El numero exacto de episodios adicionales completados no se registro, lo que limita la trazabilidad del entrenamiento.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- La carga via `pickle` implica riesgos de seguridad si el archivo procede de una fuente no confiable.
- Sin sesgos de lenguaje ni riesgo de alucinacion en el sentido habitual, pero la politica puede sobreajustarse a las semillas de evaluacion declaradas.
- Sin garantias de generalizacion a variantes del entorno con distinto espacio de estados o acciones.

## Enlaces

- HuggingFace: https://huggingface.co/JSI123/q-Taxi-v4
- Gymnasium (entorno Taxi-v4): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de Q-Learning en Gymnasium: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
