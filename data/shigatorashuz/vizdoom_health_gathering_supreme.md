# ShigatoraShuz/vizdoom_health_gathering_supreme

## Resumen

ViZDoom Health Gathering Supreme es una política de aprendizaje por refuerzo entrenada con Sample Factory sobre el escenario `doom_health_gathering_supreme` del entorno ViZDoom. El modelo resuelve una tarea de control visual en primera persona: el agente debe navegar por un mapa de Doom, recoger bidones de salud (health pickups) con recompensa de 1.0 por unidad y sobrevivir el máximo tiempo posible. Lo publica el usuario ShigatoraShuz en Hugging Face bajo el pipeline `reinforcement-learning`.

El entrenamiento combina APPO (Asynchronous Proximal Policy Optimization) con una fase de imitación a partir de un profesor de navegación hacia la salud, seguida de un ajuste fino con APPO. El resultado declarado es una recompensa media de 11.27 ± 5.54 en evaluación con acciones greedy sobre la recompensa original del escenario. Es relevante como referencia reproducible de un pipeline híbrido RL + imitation learning sobre un benchmark clásico de ViZDoom, útil para comparar métodos de exploración y estabilidad en entornos con recompensa dispersa.

El repositorio es de tamaño 0.0 GB y no incluye pesos visibles en la información disponible; la model card se limita a describir el procedimiento de entrenamiento y el resultado de evaluación. No se especifican arquitectura de red, hiperparámetros ni composición del dataset más allá del escenario citado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con Sample Factory; tipo de red no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada basada en observaciones del entorno ViZDoom, no en texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería declarada: sample-factory) |

## Arquitectura y entrenamiento

La política se entrena en dos fases según la model card: primero APPO (Asynchronous Proximal Policy Optimization) sobre `doom_health_gathering_supreme` con recompensa de 1.0 por recogida de salud, después imitación a partir de un profesor de navegación hacia la salud y, finalmente, ajuste fino con APPO. La evaluación se realiza con selección greedy de acciones y reporta la recompensa original del escenario. No se detallan la arquitectura de la red (CNN, MLP u otra), el número de pasos de entrenamiento, el tamaño del buffer ni los hiperparámetros de APPO.

Sample Factory es un framework de RL distribuido y asíncrono orientado a alto rendimiento en entornos como ViZDoom; la elección de APPO es coherente con entrenamiento paralelo en múltiples workers. La fase de imitación sugiere que la recompensa dispersa del escenario dificulta la exploración pura por RL, y que se usó un profesor para inicializar la política de navegación antes del ajuste con refuerzo. No hay información sobre decodificación especulativa, atención lineal ni otras innovaciones, ya que no es un modelo generativo.

## Capacidades

- Control visual en primera persona sobre el escenario ViZDoom `doom_health_gathering_supreme`.
- Navegación hacia objetivos de salud y recogida de bidones con recompensa de 1.0 por unidad.
- Política entrenada con acciones greedy en evaluación, orientada a maximizar supervivencia y recogida.
- Entrenamiento híbrido RL + imitation learning (APPO + profesor de navegación + ajuste fino APPO).
- No soporta tool calling, function calling, agentes multi-step ni razonamiento simbólico.
- No tiene capacidades multilingües, de visión general, audio ni generación de texto.

## Casos de uso

- Investigación en RL con recompensa dispersa: sirve como referencia de pipeline APPO + imitation learning para comparar métodos de exploración en `doom_health_gathering_supreme`.
- Reproducción de experimentos con Sample Factory: el modelo documenta la secuencia entrenamiento APPO, imitación y ajuste fino, útil para replicar el flujo en otros escenarios ViZDoom.
- Evaluación de agentes visuales en primera persona: permite medir recompensa media y varianza en un benchmark clásico con acciones greedy.
- Baseline para comparación de algoritmos: su resultado declarado (11.27 ± 5.54) puede usarse como punto de partida frente a otras políticas entrenadas en el mismo escenario.
- Estudio de estabilidad del entrenamiento: la desviación estándar de 5.54 es informativa sobre la varianza entre episodios y la robustez de la política.
- Docencia y demostraciones de RL: ejemplo concreto de cómo combinar un profesor de navegación con APPO para inicializar políticas en entornos con recompensa escasa.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | doom_health_gathering_supreme | mean_reward | 11.27 +/- 5.54 | false |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica tamaño de red ni pesos).
- GPU recomendadas: no disponible; Sample Factory está diseñado para entrenamiento e inferencia en GPU, pero no se indican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es `sample-factory`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de RL).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de RL comparables en el mismo escenario ni datos de referencia de ViZDoom para contrastar.

## Limitaciones y advertencias

- El resultado 11.27 ± 5.54 está marcado como no verificado en el model-index; no hay validación independiente.
- No se especifica licencia, lo que impide determinar si el uso comercial está permitido.
- El repositorio es de 0.0 GB y no se confirma la presencia de pesos descargables en la información disponible.
- El modelo está especializado exclusivamente en `doom_health_gathering_supreme`; no generaliza a otros escenarios ni tareas.
- No se documentan sesgos, pero al ser una política de RL en un entorno de juego, su comportamiento está acotado a la dinámica del escenario.
- No hay información sobre robustez ante cambios de semilla, configuración del entorno o variaciones de recompensa.
- No es un modelo de lenguaje: no aplican riesgos de alucinación, pero tampoco capacidades de texto, código o matemáticas.

## Enlaces

- Hugging Face: https://huggingface.co/ShigatoraShuz/vizdoom_health_gathering_supreme
- Sample Factory (framework): no disponible en la información proporcionada
- ViZDoom (entorno): no disponible en la información proporcionada
- Paper de APPO: no disponible en la información proporcionada
