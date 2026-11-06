# Hugh12345/Taxy

## Resumen

Taxy es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular para resolver el entorno Taxi-v3 de Gymnasium (antiguo OpenAI Gym). Lo publica el usuario Hugh12345 en Hugging Face Hub y se distribuye como un fichero `q-learning.pkl` que contiene la tabla Q aprendida junto con los metadatos del entorno. No es un modelo de lenguaje ni una red neuronal profunda: es una política discreta almacenada como diccionario de valores Q, lo que lo convierte en un artefacto ligero y reproducible para experimentos de RL clásico.

El modelo resuelve el problema de navegación de un taxi en una cuadrícula 5x5 con cuatro ubicaciones de recogida y entrega, donde el agente debe recoger a un pasajero y dejarlo en su destino con el menor coste posible. Su relevancia es fundamentalmente didáctica: sirve como referencia de baseline para comparar algoritmos de RL más avanzados (DQN, PPO, A2C) sobre el mismo entorno, y como ejemplo mínimo de integración con el ecosistema `stable-baselines3` y el Hub de Hugging Face.

El repositorio tiene un tamaño de 0.0 GB (esencialmente un fichero pickle de pocos kilobytes), sin descargas ni likes en el momento de la consulta, y sin licencia ni idiomas declarados. La model card reporta un `mean_reward` de 7.54 ± 2.74 sobre Taxi-v3, un resultado modesto que sugiere una convergencia parcial del agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q como diccionario estado-accion) |
| Parametros totales | no disponible (tabla Q discreta, no aplica recuento de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno Taxi-v3 con observaciones discretas de 500 estados) |
| Tipos de cuantizacion | no disponible (no aplica a un pickle de tabla Q) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clásico, un algoritmo de diferencias temporales off-policy que actualiza una tabla Q indexada por el par (estado, acción) mediante la regla de Bellman. El entorno Taxi-v3 tiene 500 estados discretos y 6 acciones (moverse al norte, sur, este, oeste, recoger pasajero y dejar pasajero), por lo que la tabla Q resultante es de tamaño manejable y se serializa directamente como diccionario en un fichero pickle. No hay red neuronal, ni función de aproximación, ni representación vectorial de estados.

La model card no especifica hiperparámetros de entrenamiento (tasa de aprendizaje, factor de descuento, política epsilon-greedy, número de episodios), ni la composición del dataset de entrenamiento más allá de indicar que se trata del entorno Taxi-v3. Tampoco se documenta si se aplicó decaimiento de epsilon, inicialización optimista o técnicas de exploración adicionales. La etiqueta `custom-implementation` sugiere que el autor no usó `stable-baselines3` directamente sino una implementación propia, aunque el formato de carga (`load_from_hub`) es el estándar de la integración de RL en Hugging Face.

## Capacidades

- Resolución del entorno Taxi-v3: el agente selecciona acciones discretas para recoger y entregar pasajeros en una cuadrícula 5x5.
- Política greedy determinista: dado un estado discreto, devuelve la acción con mayor valor Q aprendido.
- Integración con Gymnasium: se carga mediante `load_from_hub` y se ejecuta con `gym.make(model["env_id"])`.
- Compatibilidad con el ecosistema Hugging Face RL: formato de pickle reconocido por las utilidades de carga del Hub.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo thinking.
- No es un modelo generativo: no produce texto ni código.

## Casos de uso

- Baseline de referencia en investigación de RL: sirve como punto de comparación para medir la mejora de algoritmos profundos (DQN, PPO) sobre Taxi-v3, ya que su `mean_reward` de 7.54 ± 2.74 está documentado y es reproducible.
- Docencia y tutoriales de Q-Learning: el fichero pickle es un ejemplo mínimo y autocontenido para ilustrar la actualización de Bellman y la política epsilon-greedy en un entorno discreto.
- Pruebas de integración del pipeline de Hugging Face RL: permite verificar que `load_from_hub` y `gym.make` funcionan correctamente en un entorno controlado antes de desplegar agentes más complejos.
- Evaluación de robustez de entornos: al ser una política tabular determinista, se puede usar para estudiar cómo afectan variaciones en `is_slippery` o en la recompensa al comportamiento del agente.
- Generación de trayectorias sintéticas: el agente puede producir episodios completos de recogida y entrega que sirvan como datos para entrenar modelos de imitación o para análisis de recompensas.
- Benchmarking de infraestructura de RL: al ser un artefacto de pocos kilobytes, es útil para medir latencia de carga y de inferencia en pipelines de evaluación sin que el cuello de botella sea el modelo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados por Hugging Face, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| Taxi-v3 | mean_reward | 7.54 +/- 2.74 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparación con DQN, PPO u otros agentes sobre el mismo entorno en la documentación proporcionada.

## Requisitos de hardware

- VRAM: no aplica; el agente es una tabla Q en memoria principal (del orden de kilobytes).
- GPU: no necesaria; la inferencia es una búsqueda en diccionario en CPU.
- Cabe en cualquier CPU consumer y en entornos sin GPU (incluidos contenedores ligeros y Raspberry Pi).
- Despliegue: no requiere vLLM, llama.cpp, Ollama ni TGI; se ejecuta con Python, `gymnasium` y `huggingface_hub`.
- Latencia: del orden de microsegundos por paso de entorno; el cuello de botella es la simulación de Gymnasium, no el agente.
- Throughput: limitado por la velocidad de `env.step`, no por el modelo.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Hugh12345/Taxy | Q-Learning tabular | Taxi-v3 | Tabla Q discreta (500 estados x 6 acciones) | no aplica | mean_reward 7.54 ± 2.74 (no verificado) | no disponible | Hugging Face Hub |
| Agentes DQN sobre Taxi-v3 | Deep Q-Network | Taxi-v3 | Red MLP pequena (miles de parametros) | no aplica | no disponible en la informacion proporcionada | variable segun implementacion | Comunidad SB3 / CleanRL |
| Agentes PPO sobre Taxi-v3 | PPO | Taxi-v3 | Red MLP pequena | no aplica | no disponible en la informacion proporcionada | variable segun implementacion | Comunidad SB3 / CleanRL |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparativa de rendimiento queda limitada al valor declarado por el autor de Taxy.

## Limitaciones y advertencias

- Resultado modesto: un `mean_reward` de 7.54 ± 2.74 en Taxi-v3 está lejos del óptimo (en torno a 8-9 con éxito consistente) y la desviación típica alta indica una política inestable.
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni redistribución; hay que contactar con el autor.
- Sin idiomas declarados: irrelevante para RL, pero impide clasificarlo en el Hub por lengua.
- Sin hiperparámetros documentados: no es posible reproducir el entrenamiento a partir de la model card.
- Implementación "custom": no se garantiza compatibilidad con las versiones actuales de `stable-baselines3` ni con futuras versiones de Gymnasium.
- El pickle de Python es un formato inseguro para cargar artefactos de origen desconocido; conviene inspeccionarlo antes de deserializarlo en producción.
- No generaliza fuera de Taxi-v3: la tabla Q está indexada por los 500 estados de ese entorno concreto.
- Sin verificación por parte de Hugging Face (`verified: false`): el resultado del benchmark es una declaración del autor.
- Sin descargas ni validación comunitaria: no hay evidencia externa de que el agente funcione según lo declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hugh12345/Taxy
- Entorno Taxi-v3 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de RL en Hugging Face: https://huggingface.co/docs/hub/en/models-downloading
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
- Stable-Baselines3 (referencia para agentes comparables): https://github.com/DLR-RM/stable-baselines3
