# aestoquera/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo (reinforcement learning) que resuelve el entorno Taxi-v3 de OpenAI Gym mediante el algoritmo clásico Q-Learning. El modelo ha sido desarrollado por el usuario aestoquera y publicado en Hugging Face Hub como una implementación personalizada, sin dependencias de frameworks de RL externos más allá del propio entorno. El agente aprende una política de control óptima para recoger y dejar pasajeros en un mapa de 5x5 con una tabla Q tabular.

Este modelo es relevante para desarrolladores e investigadores que trabajan con RL clásico y desean disponer de un agente entrenado de referencia para Taxi-v3, un benchmark canónico en el campo. Al tratarse de un agente tabular, su tamaño es mínimo (el repositorio ocupa 0.0 GB) y su inferencia es instantánea. No se trata de un modelo de lenguaje ni de visión, sino de un agente de decisión para un espacio de estados y acciones discretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q) |
| Parametros totales | No disponible (tabla Q de tamaño 500 estados x 6 acciones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Pickle (archivo q-learning.pkl) |

## Arquitectura y entrenamiento

El modelo implementa el algoritmo Q-Learning clásico, una técnica de aprendizaje por refuerzo sin modelo (model-free) basada en la actualización iterativa de una tabla Q que mapea pares estado-acción a valores de recompensa esperada. El entorno Taxi-v3 tiene un espacio de estados de 500 estados discretos (posiciones del taxi, pasajero y destino) y 6 acciones (mover hacia las cuatro direcciones, recoger y dejar pasajero). El entrenamiento se realiza mediante exploración y explotación, típicamente con una política epsilon-greedy, aunque los hiperparámetros exactos (tasa de aprendizaje, factor de descuento, número de episodios) no se han publicado en la información disponible. No se ha utilizado RLHF, DPO ni ningún esquema de aprendizaje supervisado; el agente aprende exclusivamente de las recompensas del entorno.

## Capacidades

- Resolución del entorno Taxi-v3 de OpenAI Gym, alcanzando una recompensa media de 7.42 ± 2.67 (según el autor, sin verificación independiente).
- Toma de decisiones en un espacio de estados y acciones discretos con política óptima aprendida.
- Inferencia instantánea al ser una tabla Q (consulta directa, sin cálculo neuronal).
- Capacidad de carga desde Hugging Face Hub mediante la función `load_from_hub` de la librería `rl_zoo3` o similar, como se indica en el ejemplo de uso.
- No soporta generación de texto, código, visión, tool calling, agentes conversacionales ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Educación y docencia en aprendizaje por refuerzo: el agente puede utilizarse como ejemplo de referencia para que estudiantes comparen sus propias implementaciones de Q-Learning en Taxi-v3 y validen la convergencia de sus algoritmos.
- Benchmarking de algoritmos de RL: investigadores pueden usar este agente como línea base para comparar el rendimiento de métodos más avanzados (DQN, SARSA, doble Q-Learning) en el mismo entorno.
- Demostración de despliegue de agentes RL en Hugging Face Hub: sirve como ejemplo práctico de cómo publicar y cargar un agente entrenado con el formato de archivo pickle y la integración con Gym.
- Pruebas de entornos personalizados: el agente puede adaptarse para evaluar variantes de Taxi-v3 (por ejemplo, con slippery=False u otras modificaciones) y comprobar la robustez de la política aprendida.
- Investigación en exploración y explotación: al conocer la recompensa media, se puede estudiar el efecto de diferentes estrategias de exploración (epsilon decreciente, UCB, etc.) comparando los resultados con este agente de referencia.
- Integración en pipelines de RL experimentales: el archivo q-learning.pkl puede cargarse en scripts de Python para reproducir episodios, visualizar trayectorias o extraer la política para análisis posteriores.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card, sin verificación independiente:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.42 ± 2.67 |

No se han publicado resultados adicionales (como tasa de éxito o número de pasos por episodio) en la información disponible. Tampoco se proporcionan comparaciones con otros agentes en el mismo entorno.

## Requisitos de hardware

- No requiere GPU: la inferencia es una consulta a una tabla Q de 500x6, realizable en cualquier CPU.
- Memoria RAM mínima: el archivo pickle del modelo ocupa unos pocos kilobytes (el repositorio se reporta como 0.0 GB).
- Compatible con cualquier sistema que ejecute Python y las librerías Gym y rl_zoo3 (o equivalente).
- Despliegue trivial: puede cargarse en un script Python estándar o en un notebook sin infraestructura adicional.
- Latencia: inferior a un milisegundo por decisión en hardware moderno, al ser una simple operación de indexado.

## Comparativa con modelos similares

No disponible. No se ha encontrado información sobre agentes comparables publicados en Hugging Face Hub con la misma configuración (Q-Learning tabular para Taxi-v3) en los resultados de búsqueda web. Los resultados de búsqueda proporcionados (Mercedes-Benz CLS, CLS Group) no guardan relación con el modelo. Se recomienda buscar en el Hub por el tag "Taxi-v3" para encontrar alternativas.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para el entorno Taxi-v3; no es transferible a otros entornos sin reentrenamiento.
- La recompensa media de 7.42 ± 2.67 es una declaración del autor sin verificación independiente; al ejecutar el agente pueden obtenerse valores diferentes según la semilla aleatoria y el número de episodios.
- Al ser un método tabular, no generaliza a estados no vistos; si el entorno se modifica (por ejemplo, cambiando el mapa o las recompensas), el agente fallará.
- No hay información sobre la política de exploración utilizada durante el entrenamiento ni sobre el número de episodios, lo que impide evaluar la optimalidad de la política aprendida.
- La licencia no está especificada; se recomienda contactar con el autor antes de un uso comercial o de redistribución.
- El repositorio no contiene documentación adicional (hiperparámetros, código de entrenamiento) más allá de la model card, lo que limita la reproducibilidad.
- No es un modelo de lenguaje: no debe usarse para tareas de NLP, generación de texto o razonamiento.

## Enlaces

- Hugging Face Hub: https://huggingface.co/aestoquera/q-Taxi-v3
- Entorno Taxi-v3 (documentación de Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
