# Eilon96/q-Taxi-v4

## Resumen

q-Taxi-v4 es un agente de aprendizaje por refuerzo basado en Q-learning tabular, entrenado para resolver el entorno Taxi-v3 de Gymnasium. Lo publica el usuario Eilon96 en Hugging Face y se distribuye como un artefacto de tipo `reinforcement-learning`, no como un modelo de lenguaje: no contiene pesos neuronales ni parámetros en el sentido habitual de un transformer, sino una tabla Q serializada (habitualmente en `q-learning.pkl`) junto con los metadatos del entorno.

El modelo resuelve el problema clásico de planificación en el que un taxi debe recoger y dejar pasajeros en cuatro ubicaciones de una cuadrícula de 5x5, con 500 estados discretos y 6 acciones posibles. Es relevante como referencia educativa y como línea base reproducible para comparar algoritmos de RL tabular, no para tareas de generación de texto, código o visión.

La información disponible es muy limitada: el repositorio ocupa 0,0 GB, no declara licencia ni idiomas, no tiene descargas ni likes, y la model card únicamente documenta el uso mediante `load_from_hub` y `gym.make`. Cualquier dato no presente en esa información se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (sin red neuronal) |
| Parámetros totales | no disponible (tabla Q de 500 estados x 6 acciones en el entorno Taxi-v3) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; la model card referencia `q-learning.pkl` |
| Entorno | Taxi-v3 (Gymnasium) |
| Pipeline declarado | reinforcement-learning |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

Se trata de un agente de Q-learning tabular. La política se representa mediante una tabla Q que asigna un valor a cada par (estado, acción) del entorno Taxi-v3, que cuenta con 500 estados discretos y 6 acciones. La actualización sigue la regla clásica de Q-learning (off-policy, basada en la ecuación de Bellman con la recompensa inmediata y el máximo valor Q del estado siguiente), sin aproximación funcional ni red neuronal.

La información proporcionada no detalla hiperparámetros de entrenamiento (tasa de aprendizaje, factor de descuento, política epsilon-greedy, número de episodios), composición del dataset ni si se aplicaron variantes como Double Q-learning. Tampoco se documenta ninguna innovación técnica adicional. El artefacto se carga mediante `load_from_hub(repo_id="Eilon96/q-Taxi-v3", filename="q-learning.pkl")`, lo que sugiere que el agente se serializa como un diccionario con la tabla Q y el identificador del entorno.

## Capacidades

- Resolución del entorno Taxi-v3 de Gymnasium mediante política Q-learning tabular.
- Toma de decisiones discreta sobre 6 acciones en 500 estados.
- Carga e integración con Gymnasium mediante `load_from_hub` y `gym.make(model["env_id"])`.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del bucle episódico del entorno.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo mínimo y reproducible de Q-learning tabular para explicar la ecuación de Bellman y la exploración epsilon-greedy en un entorno de 500 estados.
- Línea base en experimentos comparativos: permite contrastar algoritmos tabulares frente a aproximaciones con redes neuronales (DQN, PPO) sobre el mismo entorno Taxi-v3.
- Validación de pipelines de RL: útil para comprobar que un flujo de entrenamiento, serialización y carga con `load_from_hub` funciona de extremo a extremo antes de escalar a entornos mayores.
- Pruebas de integración con Gymnasium: adecuado para verificar la compatibilidad de versiones de Gymnasium y el formato de serialización `q-learning.pkl` en un entorno controlado.
- Reproducción de resultados: permite replicar la métrica declarada de recompensa media (7,54 ± 2,70) y auditar la variabilidad entre episodios.
- Demostraciones de agentes en entornos discretos: útil en talleres o tutoriales donde se necesita un agente ligero que no requiera GPU y que se ejecute en CPU en milisegundos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Modelo | Entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|
| q-Taxi-v3 (según model-index de q-Taxi-v4) | Taxi-v3 | mean_reward | 7,54 ± 2,70 | No |

No se han publicado otros resultados de benchmarks en la información disponible. La métrica corresponde a la recompensa media por episodio en Taxi-v3, con una desviación estándar de 2,70 que indica una variabilidad considerable entre episodios.

## Requisitos de hardware

- VRAM: no aplica; el agente es tabular y se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier CPU consumer; el estado completo es una tabla de 500 x 6 valores.
- Despliegue: carga mediante `load_from_hub` y ejecución con Gymnasium; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza tabular del agente, la inferencia por paso es una consulta a tabla.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| q-Taxi-v4 (Eilon96) | Q-learning tabular | Taxi-v3 | 7,54 ± 2,70 (no verificado) | no disponible | Hugging Face |
| q-Taxi-v3 (Eilon96) | Q-learning tabular | Taxi-v3 | no disponible | no disponible | Hugging Face |
| DQN sobre Taxi-v3 | Q-learning con red neuronal | Taxi-v3 | no disponible en esta información | no disponible | Implementaciones de referencia en literatura |
| PPO sobre Taxi-v3 | Policy gradient | Taxi-v3 | no disponible en esta información | no disponible | Implementaciones de referencia en literatura |

No se dispone de datos comparativos verificados de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en Taxi-v3; no generaliza a otros entornos ni tareas.
- La métrica declarada (7,54 ± 2,70) no está verificada y presenta una desviación estándar elevada, lo que sugiere una política con comportamiento variable entre episodios.
- No se declara licencia, por lo que el uso comercial queda sin marco legal explícito y debe consultarse con el autor.
- No se documentan hiperparámetros, semilla ni protocolo de evaluación, lo que dificulta la reproducibilidad exacta.
- La model card mezcla identificadores: el repositorio es `q-Taxi-v4` pero el ejemplo de carga y el model-index referencian `q-Taxi-v3`; conviene verificar qué artefacto se descarga realmente.
- No hay información sobre sesgos, alucinación ni limitaciones idiomáticas porque no es un modelo de lenguaje.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Eilon96/q-Taxi-v4
- Repositorio referenciado en la model card: https://huggingface.co/Eilon96/q-Taxi-v3
- Entorno Taxi-v3 (Gymnasium): no disponible en la información proporcionada.
