# guilleg003/poca-SoccerTwos

## Resumen

MA-POCA SoccerTwos es un checkpoint de agente de refuerzo entrenado con Unity ML-Agents 1.1.0 sobre el entorno SoccerTwos, un escenario de fútbol 2 contra 2 donde dos equipos de agentes compiten por marcar goles. El modelo lo publica el usuario guilleg003 como material de práctica de la Unidad 7 del currículo de ML-Agents, empleando el algoritmo MA-POCA (Multi-Agent POsthumous Credit Assignment), diseñado específicamente para el aprendizaje cooperativo y competitivo en entornos multiagente. No se trata de un modelo de lenguaje ni de un modelo generativo: es una política neuronal exportada a ONNX que se integra en el motor Unity a través de la librería `ml-agents`.

El artefacto corresponde a un checkpoint intermedio de 99 592 pasos de entrenamiento, con semilla 42 y autojuego. Al alcanzar los 100 000 pasos, el entrenador registró un retorno medio grupal de -0,142 y un Elo interno de 1198,926 frente a oponentes generados por el propio autojuego. No hay evaluación contra la competición oficial de la plataforma, que el autor indica que está fuera de servicio.

Su relevancia es acotada: sirve como referencia reproducible de un pipeline de entrenamiento multiagente con MA-POCA y como punto de partida para experimentos docentes o de investigación en entornos Unity. No debe confundirse con un modelo listo para producción ni con un sistema con capacidades lingüísticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política de agente entrenada con MA-POCA (Unity ML-Agents); topología interna no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de observación por pasos de simulación, no secuencia de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (exportado desde ML-Agents) |
| Algoritmo de entrenamiento | MA-POCA |
| Entorno | ML-Agents SoccerTwos (Unity) |
| Versión de ML-Agents | 1.1.0 |
| Semilla | 42 |
| Pasos de entrenamiento | 99 592 (checkpoint); 100 000 (registro final del entrenador) |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

El modelo se entrena con MA-POCA, un algoritmo de aprendizaje por refuerzo multiagente propuesto por DeepMind en colaboración con Unity, pensado para asignar crédito a agentes individuales dentro de un equipo cuando la recompensa es grupal. La política se materializa como una red neuronal que consume observaciones del entorno SoccerTwos (posiciones, velocidades y estado del balón y de los agentes) y produce acciones discretas de movimiento y patada. El checkpoint se exporta a ONNX para su inferencia dentro del motor Unity mediante el paquete `ml-agents`.

El entrenamiento se realizó con Unity ML-Agents 1.1.0, semilla 42 y autojuego, un esquema en el que los oponentes se generan a partir de versiones anteriores de la propia política para estabilizar el aprendizaje competitivo. El autor no documenta el número total de tokens ni la composición del dataset, ya que no aplica: el agente aprende de la interacción con la simulación. No se reporta uso de RLHF, DPO ni técnicas de alineación, ni innovaciones adicionales como decodificación especulativa o atención lineal, que no tienen sentido en este contexto.

## Capacidades

- Control de agente en el entorno SoccerTwos: movimiento y patada del balón en un partido 2 contra 2.
- Aprendizaje cooperativo multiagente mediante MA-POCA, con asignación de crédito a nivel de equipo.
- Política exportada a ONNX, ejecutable dentro de Unity con el paquete `ml-agents`.
- Comportamiento derivado de autojuego: la política se ha enfrentado a versiones previas de sí misma.
- Reproducibilidad del pipeline: semilla fija (42) y versión de ML-Agents documentada (1.1.0).
- No soporta tool calling, function calling, agentes de razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento. No es un modelo de lenguaje.

## Casos de uso

- Docencia de ML-Agents: reproducir la práctica de la Unidad 7 cargando el checkpoint en Unity con la versión 1.1.0 y la semilla 42 para comparar curvas de aprendizaje.
- Investigación en aprendizaje multiagente: usar el checkpoint como línea base de MA-POCA en SoccerTwos para experimentos de asignación de crédito, recompensas gruesas o currículos de autojuego.
- Análisis de autojuego: estudiar la evolución del Elo interno (1198,926 a 100 000 pasos) frente a oponentes autogenerados y su relación con el retorno medio grupal (-0,142).
- Pruebas de integración ONNX-Unity: validar el pipeline de exportación e inferencia de políticas ONNX en el motor Unity con un artefacto pequeño.
- Comparación de algoritmos: contrastar MA-POCA con PPO u otros algoritmos de ML-Agents sobre el mismo entorno y semilla para medir diferencias de convergencia.
- Generación de oponentes sintéticos: emplear la política como rival de referencia en entrenamientos de nuevos agentes en SoccerTwos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index y en la model card. La métrica no está verificada (`verified: false`).

| Métrica | Valor | Contexto |
|---|---|---|
| Retorno medio grupal de entrenamiento | -0,142 | Registrado a 100 000 pasos |
| Elo interno | 1198,926 | Frente a oponentes de autojuego |
| Pasos del checkpoint publicado | 99 592 | Checkpoint exportado |

No se han publicado resultados de benchmarks adicionales (evaluación contra la competición oficial, win rate, goles por partido) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y la política es una red pequeña típica de ML-Agents, pero no se documenta el tamaño exacto.
- GPU recomendadas: no disponible. Al ejecutarse dentro de Unity, la inferencia puede realizarse en CPU o en GPU mediante el backend de inferencia del motor.
- Viabilidad en GPU de consumo: previsiblemente sí por el tamaño reducido del artefacto, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: Unity con el paquete `ml-agents` (inferencia ONNX); `mlagents-learn` para reentrenamiento; no aplica vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Pasos | Retorno medio | Elo | Licencia |
|---|---|---|---|---|---|---|
| guilleg003/poca-SoccerTwos | MA-POCA | SoccerTwos | 99 592 | -0,142 | 1198,926 | no disponible |
| Políticas de referencia de Unity ML-Agents | PPO / MA-POCA | SoccerTwos | no disponible | no disponible | no disponible | según ML-Agents |
| Otros checkpoints comunitarios de SoccerTwos | PPO / MA-POCA | SoccerTwos | no disponible | no disponible | no disponible | variable |

No se dispone de datos publicados de modelos comparables con métricas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- El retorno medio grupal es negativo (-0,142), lo que sugiere un rendimiento limitado en el momento del registro; no es un agente competitivo validado.
- No hay evaluación contra la competición oficial de la plataforma, que el autor indica que está fuera de servicio.
- El Elo de 1198,926 es interno y se refiere únicamente a oponentes de autojuego; no es comparable con clasificaciones externas.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Checkpoint intermedio (99 592 pasos) frente al registro final (100 000 pasos): puede no coincidir exactamente con el estado evaluado.
- Dependencia estricta de Unity ML-Agents 1.1.0 y del entorno SoccerTwos; no es portable a otros dominios sin reentrenamiento.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no tiene capacidades multilingües, de visión ni de audio.
- Riesgo de sobreajuste al autojuego: el comportamiento puede degradarse frente a oponentes con estrategias distintas a las generadas por la propia política.
- Sin datos de sesgos, alucinación o robustez, ya que no aplican a un agente de control en simulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guilleg003/poca-SoccerTwos
- Documentación de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Entorno SoccerTwos en ML-Agents: https://github.com/Unity-Technologies/ml-agents/tree/main/Project/Assets/ML-Agents/Examples/Soccer
- Paper de MA-POCA: https://arxiv.org/abs/2206.08853
- Documentación de ML-Agents 1.1.0: https://github.com/Unity-Technologies/ml-agents/releases/tag/release_19
