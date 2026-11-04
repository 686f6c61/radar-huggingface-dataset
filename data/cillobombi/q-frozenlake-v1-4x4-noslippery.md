# cillobombi/q-FrozenLake-v1-4x4-noSlippery

## Resumen

`q-FrozenLake-v1-4x4-noSlippery` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-Learning tabular sobre el entorno `FrozenLake-v1` de Gymnasium, en su variante de rejilla 4x4 sin deslizamiento (`is_slippery=False`). Lo publica el usuario de Hugging Face `cillobombi` como parte del flujo estándar de la librería `stable-baselines3`, que genera automáticamente un repositorio con la política serializada y una model card con metadatos.

No se trata de un modelo de lenguaje: no hay pesos neuronales, ni tokenizador, ni ventana de contexto. El artefacto es una tabla Q serializada en formato pickle (`q-learning.pkl`) que mapea los 16 estados de la rejilla a las 4 acciones posibles (izquierda, abajo, derecha, arriba). Su relevancia es didáctica: sirve como referencia mínima de un agente que resuelve de forma óptima un problema de control con recompensa dispersa y entorno determinista.

El modelo declara una recompensa media de 1.00 ± 0.00, es decir, alcanza el objetivo en el 100 % de los episodios de evaluación. Al ser un entorno determinista de 16 estados, esto equivale a haber aprendido la política óptima exacta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla de valores Q estado-acción) |
| Parámetros totales | 16 estados × 4 acciones = 64 valores Q (no es una red neuronal) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de 16 estados discretos) |
| Tipos de cuantización | no aplica (tabla de floats serializada en pickle) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clásico, un método de diferencias temporales *off-policy* que actualiza iterativamente la función de valor-acción Q(s, a) mediante la regla de Bellman con tasa de aprendizaje α y factor de descuento γ. La exploración se gestiona habitualmente con una política ε-greedy con decaimiento lineal. El espacio de estados es discreto y pequeño (16 celdas), por lo que la tabla Q converge sin necesidad de aproximación funcional.

El entorno `FrozenLake-v1-4x4-no_slippery` es una rejilla de 4x4 con celdas de hielo, agujeros y una meta. Al desactivar el deslizamiento, las transiciones son deterministas, lo que simplifica enormemente el problema. No hay información en la model card sobre hiperparámetros concretos (α, γ, ε, número de episodios), composición del dataset ni proceso de ajuste fino; el entrenamiento se realizó presumiblemente con la integración de `stable-baselines3` en Hugging Face Hub.

## Capacidades

- Resolución del entorno `FrozenLake-v1-4x4-no_slippery` mediante política greedy sobre la tabla Q aprendida.
- Selección de acción discreta entre las 4 disponibles a partir del estado observado (índice entero de 0 a 15).
- Alcanza la meta en todos los episodios de evaluación según la métrica declarada.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No implementa modo *thinking* ni decodificación especulativa.

## Casos de uso

- Docencia de aprendizaje por refuerzo: ejemplo canónico para ilustrar Q-Learning tabular, convergencia de la tabla Q y política ε-greedy en un entorno de juguete determinista.
- Test de integración de `stable-baselines3`: verificar que el pipeline `load_from_hub` + `gym.make` funciona correctamente en un entorno controlado antes de pasar a problemas reales.
- Baseline de comparación: punto de referencia trivial para contrastar con agentes neuronales (DQN, PPO) sobre el mismo entorno y comprobar que aprenden la política óptima.
- Reproducción de experimentos: al ser un entorno determinista con recompensa máxima alcanzada, permite validar reproducibilidad de semillas y configuraciones.
- Generación de trayectorias sintéticas: usar la política óptima para producir demostraciones de episodios completos que alimenten *imitation learning* o *offline RL* en variantes más complejas del entorno.
- Pruebas de infraestructura de evaluación: validar pipelines de `evaluate` de Hugging Face o scripts propios de RL antes de desplegarlos con modelos de mayor coste computacional.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| reinforcement-learning | FrozenLake-v1-4x4-no_slippery | mean_reward | 1.00 ± 0.00 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: 0 GB. La tabla Q ocupa unos pocos cientos de bytes; el repositorio completo mide 0.0 GB.
- GPU: no necesaria. La inferencia es una búsqueda en un diccionario o array de 16x4 valores.
- Cabe en cualquier CPU, incluidos dispositivos embebidos y Raspberry Pi.
- Despliegue: cualquier entorno con Python y `gymnasium` + `stable-baselines3` para cargar el pickle; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia: del orden de microsegundos por paso (lookup en tabla); el throughput está limitado por el bucle del entorno, no por el modelo.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parámetros | Recompensa media | Licencia |
|---|---|---|---|---|---|
| q-FrozenLake-v1-4x4-noSlippery (este) | Q-Learning tabular | FrozenLake-v1-4x4-no_slippery | 64 valores Q | 1.00 ± 0.00 | no disponible |
| Agente DQN sobre FrozenLake | Deep Q-Network | FrozenLake-v1-4x4 | red neuronal pequeña | no disponible | no disponible |
| Agente PPO sobre FrozenLake | Policy Gradient | FrozenLake-v1-4x4 | red neuronal pequeña | no disponible | no disponible |

No se dispone de datos verificables de modelos comparables concretos en la información proporcionada; la comparativa anterior es estructural, no basada en mediciones publicadas.

## Limitaciones y advertencias

- El agente solo funciona en `FrozenLake-v1-4x4-no_slippery`; no generaliza a otras rejillas, tamaños ni a la variante con deslizamiento (`is_slippery=True`).
- La política es determinista y óptima solo bajo el modelo de transición exacto del entorno; cualquier cambio en la dinámica invalida la tabla Q.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- El artefacto es un pickle de Python; cargarlo de fuentes no confiables implica riesgo de ejecución de código arbitrario.
- La métrica `mean_reward` está marcada como `verified: false`; conviene reproducirla con la configuración exacta del entorno.
- No es un modelo de lenguaje: no procesa texto, no tiene sesgos lingüísticos ni riesgo de alucinación en el sentido habitual, pero tampoco ofrece ninguna capacidad de NLP.
- El rendimiento reportado (1.00) puede deberse a un entorno trivialmente resoluble; no es indicativo de la calidad del algoritmo en problemas reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cillobombi/q-FrozenLake-v1-4x4-noSlippery
- Entorno FrozenLake-v1 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/frozen_lake/
- Documentación de stable-baselines3: https://stable-baselines3.readthedocs.io/
- Integración de stable-baselines3 con Hugging Face Hub: https://huggingface.co/docs/hub/stable-baselines3
