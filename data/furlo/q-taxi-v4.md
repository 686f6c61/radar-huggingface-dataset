# Furlo/q-Taxi-v4

## Resumen

Furlo/q-Taxi-v4 no es un modelo de lenguaje, sino un agente de aprendizaje por refuerzo entrenado con Q-Learning tabular para resolver el entorno Taxi-v4 de Gymnasium. Lo publica el usuario Furlo en Hugging Face bajo la librería de reinforcement learning, con un único artefacto serializado en formato pickle (`q-learning.pkl`) que contiene la tabla Q y los metadatos del entorno. El repositorio no ocupa espacio medible (0.0 GB) y no cuenta con descargas ni interacciones al momento de la consulta.

El entorno Taxi-v4 es un problema clásico de gridworld de 5x5 con 500 estados discretos y 6 acciones posibles (moverse en cuatro direcciones, recoger pasajero y dejarlo). El agente aprende una política que maximiza la recompensa acumulada; en este caso declara una recompensa media de 7,54 ± 2,73 sobre el entorno de evaluación. No hay arquitectura neuronal, parámetros entrenables en el sentido habitual ni ventana de contexto: es una implementación tabular personalizada.

Su relevancia es didáctica y de referencia: sirve como ejemplo reproducible de cómo empaquetar y publicar un agente Q-Learning en el Hub, y como línea base para comparar algoritmos de RL en un entorno de juguete. No debe confundirse con un LLM ni usarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (custom-implementation), sin red neuronal |
| Parametros totales | no disponible (tabla Q de dimensiones no especificadas en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica a un artefacto pickle) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

Se trata de un agente Q-Learning clásico sobre el entorno Taxi-v4 de Gymnasium. La política se representa implícitamente mediante una tabla Q serializada con pickle, que se carga con `load_from_hub` desde el repositorio. El entorno Taxi-v4 define 500 estados discretos (posición del taxi, posición del pasajero y destino) y 6 acciones; el agente actualiza la tabla Q con la regla de Bellman estándar durante el entrenamiento.

La model card no documenta hiperparámetros (tasa de aprendizaje, factor de descuento, epsilon de exploración, número de episodios), ni la composición de los datos de entrenamiento, ni si se aplicaron técnicas como Double Q-Learning o experience replay. No hay información sobre RLHF, DPO ni innovaciones técnicas. El resultado declarado es una recompensa media de 7,54 ± 2,73, marcada como no verificada (`verified: false`) por el autor.

## Capacidades

- Resolución del entorno Taxi-v4: recoger y dejar pasajeros en un gridworld de 5x5 con 500 estados discretos.
- Política determinista implícita en la tabla Q: selecciona una de las 6 acciones por estado.
- Carga portable vía `load_from_hub` y serialización pickle para reproducción del agente.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling.
- No soporta agentes multi-step en el sentido de LLM; el "razonamiento" se limita a la política de RL.
- No tiene capacidades multilingües.
- No dispone de modo thinking ni de funciones especiales más allá del entorno de Gymnasium.

## Casos de uso

- Reproducción de experimentos de RL: cargar el agente con `load_from_hub` y ejecutarlo en `gym.make("Taxi-v4")` para replicar la recompensa media declarada.
- Línea base en comparativas de algoritmos: usar Q-Learning tabular como referencia frente a DQN, PPO o SARSA en Taxi-v4.
- Docencia de reinforcement learning: ilustrar el ciclo estado-acción-recompensa y la actualización de la tabla Q en un entorno de juguete.
- Pruebas de integración de pipelines RL: validar flujos de carga de modelos desde el Hub y evaluación con métricas de recompensa media.
- Benchmarking de entornos Gymnasium: verificar la estabilidad del entorno Taxi-v4 y la reproducibilidad de resultados entre ejecuciones.
- Experimentos de ingeniería de recompensa: modificar o ampliar el entorno y reentrenar para estudiar el efecto en la política aprendida.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7,54 ± 2,73 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el artefacto es un pickle de tabla Q y no requiere GPU.
- GPU recomendadas: ninguna; la inferencia es CPU-only.
- Cabe en cualquier equipo consumer: sí, por tratarse de un agente tabular de tamaño despreciable (repo de 0.0 GB).
- Opciones de despliegue: carga directa con `load_from_hub` y ejecución en Gymnasium; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del entorno Taxi-v4 y del hardware de CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Furlo/q-Taxi-v4 | Q-Learning tabular | no disponible | no aplica | mean_reward 7,54 ± 2,73 (no verificado) | no disponible | Hugging Face |
| Agentes DQN para Taxi-v4 | Red neuronal | no disponible | no aplica | no disponible | no disponible | no disponible |
| Agentes PPO para Taxi-v4 | Red neuronal | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de comparativas publicadas con métricas equiparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el entorno Taxi-v4 es determinista en su dinámica base, pero la política tabular puede sobreajustarse a la configuración de entrenamiento.
- Riesgo de alucinación: no aplica (no es un modelo generativo), pero la tabla Q puede contener estados no visitados con valores por defecto.
- Limitaciones de contexto o idioma: no aplica; el agente solo opera en Taxi-v4 y no procesa lenguaje.
- Restricciones de licencia: licencia no disponible; verificar antes de cualquier uso comercial o redistribución.
- Caveats para producción: recompensa media no verificada (`verified: false`) y varianza alta (± 2,73); el formato pickle requiere confianza en el origen del artefacto por riesgos de deserialización; el tamaño del repo es 0.0 GB, lo que sugiere un artefacto mínimo sin documentación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Furlo/q-Taxi-v4
- Entorno Taxi-v4 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de carga de modelos RL en el Hub: https://huggingface.co/docs/hub/en/models-downloading
