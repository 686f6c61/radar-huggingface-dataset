# brunopaschoal/poca-SoccerTwos

## Resumen

`brunopaschoal/poca-SoccerTwos` es un agente entrenado con el algoritmo POCA (Policy Optimization with Competitive Advantage, variante de PPO orientada a entornos competitivos multiagente) sobre el entorno SoccerTwos de Unity ML-Agents. El modelo lo publica el usuario brunopaschoal en Hugging Face y su propósito es exclusivamente de investigación en aprendizaje por refuerzo: jugar partidos de fútbol 2 contra 2 en un campo simulado de Unity.

No es un modelo de lenguaje ni un modelo generativo de propósito general. Se trata de una política neuronal (policy network) exportada en formato ONNX y en el formato nativo `.nn` de ML-Agents, pensada para ser cargada por el runtime de Unity ML-Agents o por el visor web de Hugging Face para agentes de Unity. El repositorio ocupa aproximadamente 0,1 GB, coherente con los pesos de una red pequeña de tipo MLP o convolucional ligera.

Su relevancia es acotada: sirve como referencia reproducible de entrenamiento POCA en SoccerTwos, un entorno benchmark habitual en la comunidad ML-Agents para estudiar cooperación y competición multiagente. No hay información publicada sobre hiperparámetros, número de pasos de entrenamiento ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política entrenada con POCA (ML-Agents); topología exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX y `.nn` (formato nativo de Unity ML-Agents) |

## Arquitectura y entrenamiento

El agente se entrena con POCA, un algoritmo de la familia PPO adaptado por Unity ML-Agents para escenarios competitivos con recompensas por equipo. La política consume las observaciones del entorno SoccerTwos (vector de estado y, según configuración, observaciones visuales o raycast) y produce acciones discretas de movimiento y rotación, además de la acción de disparo o chut.

No se dispone de información sobre el número de pasos de entrenamiento, la configuración YAML utilizada, el tamaño de las capas ocultas ni si se emplearon recompensas intrínsecas o currículo. Tampoco se documenta si el entrenamiento se completó o quedó en una fase intermedia. El repositorio incluye los artefactos habituales de ML-Agents (pesos `.nn` y exportación ONNX), pero la model card no detalla el contenido exacto.

## Capacidades

- Control de un agente en el entorno SoccerTwos de Unity ML-Agents (fútbol 2 contra 2).
- Toma de decisiones en tiempo real a partir de observaciones del simulador.
- Comportamiento multiagente competitivo y cooperativo dentro del equipo.
- Ejecución en el visor web de Hugging Face para agentes Unity.
- Reanudación del entrenamiento mediante `mlagents-learn --resume`.
- No soporta generación de texto, código, matemáticas, visión general, tool calling ni razonamiento multi-paso fuera del entorno de simulación.

## Casos de uso

- Reproducción de experimentos en SoccerTwos: cargar el agente con ML-Agents y comparar su comportamiento frente a otros checkpoints POCA o PPO publicados en el Hub.
- Docencia en aprendizaje por refuerzo multiagente: usar el agente como ejemplo funcional de política entrenada en un entorno competitivo para ilustrar conceptos de recompensa por equipo y auto-juego.
- Baseline para fine-tuning: reanudar el entrenamiento con `mlagents-learn --resume` y modificar hiperparámetros para estudiar su impacto en la convergencia.
- Evaluación de robustez: enfrentar el agente a políticas de referencia (por ejemplo, el agente heurístico de Unity) para medir win rate en partidos simulados.
- Demostración interactiva: publicar el agente en el visor de Hugging Face para que otros usuarios lo vean jugar sin instalar Unity.
- Investigación en curricula y self-play: emplear el checkpoint como punto de partida en pipelines de auto-juego con poblaciones de agentes.
- Integración en pruebas de infraestructura ML-Agents: verificar que el runtime ONNX y el formato `.nn` se cargan correctamente en despliegues propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: muy baja, inferior a 1 GB; el repositorio completo pesa 0,1 GB y la red es de tamaño reducido (dato exacto no disponible).
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es suficiente, e incluso CPU.
- Cabe en cualquier GPU consumer y en la mayoría de entornos CPU-only.
- Opciones de despliegue: runtime de Unity ML-Agents (Unity Editor o build), ONNX Runtime para la exportación `.onnx`, y el visor web de Hugging Face para agentes Unity.
- Latencia y throughput: no disponibles; dependen del motor Unity y del hardware, no del modelo en sí.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brunopaschoal/poca-SoccerTwos | SoccerTwos | POCA | ONNX, .nn | no disponible | Hugging Face |
| unity/ml-agents SoccerTwos (referencia oficial) | SoccerTwos | POCA/PPO | .nn | según ML-Agents | Hugging Face (org. unity) |
| Otros checkpoints comunitarios de SoccerTwos | SoccerTwos | PPO/POCA | .nn, ONNX | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos agentes en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico del entorno SoccerTwos; no generaliza fuera de él.
- Sin licencia declarada: no se puede asumir permiso de uso comercial ni de redistribución.
- Sin métricas de rendimiento publicadas: se desconoce su win rate o calidad de política.
- Sin información sobre hiperparámetros ni pasos de entrenamiento: difícil de reproducir.
- Riesgo de sobreajuste a la configuración concreta de ML-Agents usada durante el entrenamiento (versión, observaciones, recompensas).
- El agente puede exhibir comportamientos degenerados o explotar artefactos del simulador, algo habitual en políticas RL sin evaluación exhaustiva.
- No apto para producción fuera de contextos de simulación o investigación.
- La model card incluye instrucciones genéricas de ML-Agents que no garantizan que el checkpoint funcione con versiones distintas de la librería.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brunopaschoal/poca-SoccerTwos
- Documentación ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes Unity en Hugging Face: https://huggingface.co/unity
