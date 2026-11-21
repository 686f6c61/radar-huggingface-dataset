# RaquelBG05/mapoca-SoccerTwos-unit7

## Resumen

`RaquelBG05/mapoca-SoccerTwos-unit7` es un agente de aprendizaje por refuerzo entrenado con Unity ML-Agents para el entorno SoccerTwos, un escenario de fútbol 2 contra 2 en el que dos equipos de agentes compiten por marcar goles. El modelo emplea MA-POCA (Multi-Agent POsthumous Credit Assignment), el algoritmo multiagente de ML-Agents que asigna crédito a agentes que pueden abandonar la partida antes de que termine el episodio, combinado con self-play para generar una curva de dificultad progresiva durante el entrenamiento.

Se trata de un artefacto formativo más que de un modelo de propósito general: el autor lo publica como entrega de la unidad 7 del curso de deep reinforcement learning de Hugging Face, entrenado en CPU con semilla 42 y un presupuesto de 250.000 pasos sobre ML-Agents 1.1.0. El resultado es un fichero ONNX que encapsula la política aprendida y que se evalúa jugando partidos contra un equipo de agentes aleatorios.

Su relevancia es acotada: sirve como referencia reproducible de un pipeline completo de RL multiagente (entrenamiento, exportación a ONNX, evaluación determinista por lotes) y como punto de partida para quien quiera replicar o mejorar el hands-on del curso. No es un modelo de lenguaje ni un sistema multimodal, y sus cifras de rendimiento deben interpretarse únicamente dentro del entorno SoccerTwos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal entrenada con MA-POCA (ML-Agents) sobre observaciones y acciones del entorno SoccerTwos; topología de red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL con observaciones por paso, no modelo de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (exportado desde ML-Agents); se referencian además `SoccerTwos.yaml`, `training.log` y `evaluacion.json` en el repo |

## Arquitectura y entrenamiento

El agente se entrena con MA-POCA, un algoritmo de policy gradient multiagente pensado para entornos cooperativos y competitivos donde los agentes pueden aparecer o desaparecer a mitad de episodio. La innovación central de MA-POCA es el *posthumous credit assignment*: cuando un agente deja de estar activo, su recompensa se redistribuye entre los agentes que quedan, de modo que la política aprendida no depende de que todos los agentes sobrevivan hasta el final del episodio. En SoccerTwos esto encaja con la dinámica de goles y reinicios parciales.

El entrenamiento combina MA-POCA con self-play: el equipo rival es una versión congelada o actualizada de la propia política, lo que genera una oposición adaptativa y evita el colapso frente a un rival fijo. Según la model card, se ejecutó en CPU con semilla 42 y 250.000 pasos en ML-Agents 1.1.0. No se documentan el número de tokens (no aplica), la composición del dataset (no aplica) ni detalles de la topología de red, las capas o el tamaño de las observaciones. El repositorio incluye la configuración (`SoccerTwos.yaml`) y el registro de entrenamiento (`training.log`), que son las fuentes primarias para reconstruir los hiperparámetros.

## Capacidades

- Control de agentes en el entorno SoccerTwos: la política mapea observaciones del entorno a acciones discretas de movimiento y patada.
- Juego multiagente 2v2 con coordinación implícita entre los dos agentes del mismo equipo.
- Comportamiento determinista en evaluación: el ONNX se evaluó con acciones deterministas, lo que permite reproducir partidos de forma estable.
- Política exportada a ONNX, ejecutable fuera de Unity mediante runtime ONNX (onnxruntime u otros).
- Entrenamiento reproducible: semilla fija (42), configuración YAML y log de entrenamiento incluidos en el repositorio.
- No soporta tool calling, function calling, agentes multi-paso basados en lenguaje, capacidades multilingües ni modos de razonamiento extendido (thinking mode); no es un modelo de lenguaje.
- No dispone de visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Reproducción del hands-on del curso: cargar el ONNX y el `SoccerTwos.yaml` para replicar el entrenamiento y la evaluación de la unidad 7, verificando la curva de recompensa frente al log incluido.
- Evaluación por lotes contra agentes aleatorios: usar el script de evaluación implícito en `evaluacion.json` para lanzar 60 partidos balanceados entre lados y calcular victorias, empates y derrotas de forma determinista.
- Punto de partida para experimentos de self-play: reutilizar la configuración como baseline y modificar el presupuesto de pasos, la semilla o la recompensa para estudiar el efecto en la política final.
- Docencia de RL multiagente: ilustrar el funcionamiento de MA-POCA y del credit assignment póstumo con un caso concreto y un artefacto ejecutable.
- Integración en pipelines de ML-Agents: servir como checkpoint intermedio en un entrenamiento más largo, continuando desde el ONNX o desde el modelo de ML-Agents asociado.
- Pruebas de robustez de entornos Unity: comparar el comportamiento del agente determinista frente a variantes del entorno (cambios en la física, en el tamaño del campo o en la recompensa) para medir sensibilidad.
- Benchmark interno de referencia: usar la recompensa media de grupo (0,058 ± 0,599) como línea base para comparar nuevos entrenamientos en el mismo entorno.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Valor |
|---|---|
| Tarea | Reinforcement Learning |
| Dataset / entorno | ML-Agents-SoccerTwos |
| Recompensa media de grupo frente a agentes aleatorios | 0,05786000 ± 0,59937274 |
| Partidos evaluados | 60 (reparto equitativo entre los dos lados) |
| Victorias / empates / derrotas | 17 / 33 / 10 |
| Presupuesto de entrenamiento | 250.000 pasos |
| Semilla | 42 |
| Versión de ML-Agents | 1.1.0 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no aplican a este tipo de modelo.

## Requisitos de hardware

- Entrenamiento: ejecutado en CPU según la model card; no se especifican requisitos de GPU para el entrenamiento original.
- Inferencia: al ser un ONNX de una política para SoccerTwos, la huella de memoria es reducida y cabe holgadamente en cualquier GPU de consumo; no se dispone de cifras exactas de VRAM.
- GPU recomendadas: no disponible; para inferencia de un ONNX de este tipo basta con una GPU de gama media o incluso CPU con onnxruntime.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier RTX o equivalente; no se documenta el mínimo exacto.
- Opciones de despliegue: onnxruntime (Python, C++, C#), Unity ML-Agents con el modelo exportado, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RaquelBG05/mapoca-SoccerTwos-unit7` | SoccerTwos (2v2) | MA-POCA + self-play | 250.000 pasos, CPU, semilla 42 | no disponible | Hugging Face |
| Checkpoints oficiales de ML-Agents para SoccerTwos | SoccerTwos (2v2) | PPO / MA-POCA según configuración | No disponible en esta ficha | Licencia de Unity ML-Agents | Repositorio de ML-Agents |
| Otros agentes del curso (unidades anteriores) | Entornos varios (Pyramids, Walker, etc.) | PPO, SAC u otros | No disponible en esta ficha | no disponible | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita a entorno, algoritmo y disponibilidad.

## Limitaciones y advertencias

- Rendimiento modesto: 17 victorias, 33 empates y 10 derrotas frente a agentes aleatorios, con recompensa media de 0,058 ± 0,599; el intervalo de confianza incluye el cero, por lo que la ventaja sobre el azar no está claramente establecida con 60 partidos.
- Entrenamiento corto: 250.000 pasos es un presupuesto reducido para self-play; es probable que la política no haya convergido a un nivel competitivo.
- Resultado de evaluación local y no verificado (`verified: false` en el model-index); el Elo del registro proviene del entrenamiento por self-play y no de la evaluación contra aleatorios.
- Sesgos conocidos: no documentados; en RL multiagente pueden aparecer comportamientos degenerados (pasividad, explotación de recompensas) no analizados en la model card.
- Riesgo de alucinación: no aplica (no es un modelo generativo de lenguaje).
- Limitaciones de contexto e idioma: no aplica; el modelo solo opera sobre observaciones del entorno SoccerTwos.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de reutilizarlo en producción.
- Caveat para producción: el ONNX está acoplado a la versión del entorno y de ML-Agents (1.1.0); cambios en la física, en el espacio de observaciones o en las acciones pueden invalidar la política.
- No incluye información sobre la topología de red ni sobre el tamaño del modelo, lo que dificulta estimar su coste computacional con precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RaquelBG05/mapoca-SoccerTwos-unit7
- Hands-on del curso (unidad 7): https://huggingface.co/learn/deep-rl-course/unit7/hands-on
- Documentación de MA-POCA en ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación de ONNX Runtime: https://onnxruntime.ai/
