# ShamilBritto/q-Taxi-v4

## Resumen

q-Taxi-v4 es un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular sobre el entorno Taxi-v3 de Gymnasium. Lo publica el usuario ShamilBritto en Hugging Face bajo el pipeline `reinforcement-learning` y la etiqueta `custom-implementation`, lo que indica que no se apoya en una librería estándar de RL (como Stable-Baselines3) sino en una implementación propia del algoritmo.

El modelo no es una red neuronal ni un transformer: se trata de una tabla Q serializada en un fichero `q-learning.pkl` que mapea pares estado-acción a valores de recompensa esperada. El entorno Taxi-v3 es un problema de juguete con un espacio de estados discreto y finito (500 estados) y 6 acciones posibles, en el que un taxi debe recoger y dejar pasajeros en cuatro ubicaciones de una cuadrícula.

Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo mínimo reproducible de un agente Q-Learning funcional sobre un entorno clásico de control, útil para comparar curvas de aprendizaje, validar implementaciones propias o como baseline en experimentos de RL. El autor declara una recompensa media de 7,56 ± 2,71 en la evaluación sobre Taxi-v3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-acción) |
| Parametros totales | no disponible (tabla Q discreta, no red neuronal) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con 500 estados discretos) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clásico, un algoritmo de diferencias temporales off-policy que actualiza iterativamente una tabla Q mediante la regla de Bellman: Q(s,a) ← Q(s,a) + α[r + γ·max Q(s',a') − Q(s,a)]. El espacio de estados de Taxi-v3 es discreto y finito (500 estados: 25 posiciones del taxi × 5 posiciones de pasajero × 4 destinos), y el espacio de acciones consta de 6 movimientos (norte, sur, este, oeste, recoger, dejar). La tabla Q resultante es, por tanto, de tamaño 500 × 6.

La model card no detalla hiperparámetros de entrenamiento (tasa de aprendizaje α, factor de descuento γ, política de exploración ε-greedy, número de episodios) ni la composición del dataset de entrenamiento, más allá de indicar que se ha entrenado sobre Taxi-v3. Tampoco se documenta si se empleó decodificación especulativa, atención lineal ni ninguna innovación técnica adicional, ya que no aplica a un agente tabular.

## Capacidades

- Resolución del entorno Taxi-v3: el agente aprende una política que recoge al pasajero y lo deja en el destino correcto maximizando la recompensa acumulada.
- Control discreto con espacio de estados y acciones finito: adecuado para problemas de planificación tabular de pequeño tamaño.
- Inferencia determinista por argmax sobre la tabla Q: dada una observación, selecciona la acción con mayor valor Q.
- Reproducibilidad: al ser una tabla serializada, la política es completamente determinista y auditable.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento extendido.
- No es un modelo de lenguaje: no genera texto ni mantiene conversaciones.

## Casos de uso

- Docencia y formación en RL: sirve como ejemplo mínimo y reproducible de Q-Learning tabular para ilustrar la convergencia de la tabla Q y la política óptima en un entorno clásico.
- Baseline de comparación: permite contrastar el rendimiento de implementaciones propias (Deep Q-Network, SARSA, etc.) frente a un agente tabular de referencia sobre Taxi-v3.
- Validación de pipelines de evaluación: útil para comprobar que un harness de RL (Gymnasium, evaluación de recompensa media) funciona correctamente antes de escalar a entornos más complejos.
- Depuración de entornos Gymnasium: al ser un agente ya entrenado, permite verificar que la configuración del entorno (`is_slippery`, renderizado, wrappers) se comporta como se espera.
- Experimentos de ablation sobre hiperparámetros: el fichero `q-learning.pkl` puede compararse con nuevas ejecuciones variando α, γ o ε para estudiar su efecto en la recompensa media.
- Demostraciones educativas en notebooks: carga sencilla mediante `load_from_hub` y `gym.make`, lo que facilita tutoriales interactivos sin requisitos de GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,56 ± 2,71 | No |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el agente es una tabla Q tabular de 500 × 6 valores, con un tamaño de repositorio de 0,0 GB.
- GPU recomendadas: ninguna; la inferencia se ejecuta en CPU sin requisitos relevantes.
- Cabe en cualquier equipo consumer: sí, en cualquier CPU moderna y en sistemas embebidos.
- Opciones de despliegue: Python con `gymnasium` y `huggingface_hub` (`load_from_hub`), tal como indica la model card. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser una búsqueda en tabla, la latencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| ShamilBritto/q-Taxi-v4 | Q-Learning tabular | Taxi-v3 | Tabla 500×6 | No aplica | mean_reward 7,56 ± 2,71 | no disponible |
| Agentes Q-Learning de referencia en Taxi-v3 | Q-Learning tabular | Taxi-v3 | Tabla 500×6 | No aplica | no disponible | variable |
| Agentes DQN sobre Taxi-v3 | Deep Q-Network | Taxi-v3 | Red pequeña | No aplica | no disponible | variable |

No se dispone de datos comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Específico del entorno: la política solo es válida para Taxi-v3; no generaliza a otros entornos ni a variantes con distinta configuración (`is_slippery`, tamaños de mapa).
- Sin transferencia: al ser una tabla Q tabular, no aprende representaciones reutilizables ni admite fine-tuning sobre otras tareas.
- Sesgos: no aplica en el sentido habitual de modelos de lenguaje, pero la política refleja únicamente la dinámica del entorno de entrenamiento.
- Alucinación: no aplica; el agente no genera texto.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de reutilizarlo en producción.
- Resultados no verificados: la métrica declarada (`verified: false`) no ha sido validada de forma independiente.
- Documentación incompleta: faltan hiperparámetros, número de episodios y detalles del proceso de entrenamiento, lo que dificulta la reproducibilidad exacta.
- Formato pickle: la carga de `q-learning.pkl` requiere confiar en el origen del fichero, ya que pickle puede ejecutar código arbitrario al deserializarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShamilBritto/q-Taxi-v4
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de `load_from_hub`: https://huggingface.co/docs/huggingface_hub
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
