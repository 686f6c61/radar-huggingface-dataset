# HasanBozkurt/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un agente entrenado con aprendizaje por refuerzo profundo (deep reinforcement learning) que juega al entorno SoccerTwos de Unity ML-Agents. Lo publica el usuario HasanBozkurt en Hugging Face y emplea el algoritmo POCA (Policy Optimization with Clipped Advantages), una variante de PPO orientada a entornos multijugador cooperativo-competitivo. El modelo resuelve el problema de control de agentes en un partido de fútbol 2 contra 2 dentro de un entorno simulado, donde dos equipos de dos agentes compiten por marcar gol.

El artefacto no es un modelo de lenguaje: es una política neuronal exportada en formato ONNX (y potencialmente .nn) que se carga dentro del ecosistema Unity ML-Agents. El repositorio ocupa 0,2 GB y no incluye información sobre arquitectura de red, número de parámetros ni longitud de contexto, ya que estos conceptos no aplican a un agente de RL en un entorno físico simulado.

Su relevancia es acotada y experimental: sirve como ejemplo reproducible de entrenamiento multiagente con ML-Agents y como política lista para visualizar en el navegador mediante la integración de Hugging Face con Unity. No está pensado para despliegue en producción ni para tareas de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política entrenada con ML-Agents (algoritmo POCA); topología no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (y presumiblemente .nn de ML-Agents); no confirmado en la información disponible |

## Arquitectura y entrenamiento

El agente se entrena con la librería Unity ML-Agents usando el algoritmo POCA, una extensión de PPO diseñada para entornos con múltiples agentes que comparten política pero compiten entre sí. En SoccerTwos, dos equipos de dos agentes se enfrentan en un campo reducido; cada agente recibe observaciones vectoriales y visuales del entorno y emite acciones de movimiento y patada. La política se optimiza mediante refuerzo con recompensas basadas en goles y posesión del balón.

No se dispone de información sobre el número de pasos de entrenamiento, la composición del currículo, la arquitectura exacta de la red (capas, unidades, si usa red separada de valor) ni sobre técnicas auxiliares como recompensas intrínsecas o self-play. El repositorio incluye los artefactos de TensorBoard y el modelo exportado, lo que permite reanudar el entrenamiento con `mlagents-learn --resume`, pero los detalles numéricos no están publicados en la model card.

## Capacidades

- Control de agente en el entorno SoccerTwos de Unity ML-Agents (movimiento y patada).
- Juego cooperativo-competitivo 2 contra 2 dentro de la simulación.
- Inferencia en navegador a través de la integración de Hugging Face con Unity (visor "Watch the agent play").
- Exportación a ONNX para su uso en Unity Barracuda u otros runtimes compatibles.
- Reanudación del entrenamiento desde el checkpoint publicado.
- No soporta tool calling, function calling, agentes multi-paso fuera del entorno, ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Demostración educativa de RL multiagente: cargar el modelo en el visor de Hugging Face para mostrar cómo dos agentes aprenden a coordinarse en un partido 2v2, útil en cursos de deep RL.
- Reproducción de experimentos: reanudar el entrenamiento con `mlagents-learn --resume` para comparar curvas de recompensa frente a otras configuraciones de POCA o PPO.
- Base para fine-tuning en variantes del entorno: partir de esta política y ajustar recompensas o currículo para estudiar transferencia en SoccerTwos.
- Benchmark de algoritmos de RL: usar el agente como referencia cualitativa frente a políticas entrenadas con self-play o MAPPO en el mismo entorno.
- Integración en pipelines de Unity: exportar el ONNX y ejecutarlo con Barracuda dentro de una build de Unity para pruebas de comportamiento en tiempo real.
- Docencia sobre exportación de modelos ML-Agents: ilustrar el flujo completo desde el entrenamiento hasta la publicación en el Hub y la inferencia en navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política de RL de tamaño reducido (repo de 0,2 GB, que incluye artefactos de entrenamiento), la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime o Unity Barracuda es suficiente.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU moderna con al menos 2-4 GB de VRAM; también es viable en CPU para inferencia puntual.
- Opciones de despliegue: Unity ML-Agents (runtime nativo), Unity Barracuda con ONNX, ONNX Runtime, visor web de Hugging Face para Unity.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HasanBozkurt/poca-SoccerTwos | SoccerTwos | POCA | no disponible | no aplica | no disponible | Hugging Face |
| Políticas oficiales de ML-Agents para SoccerTwos | SoccerTwos | PPO | no disponible | no aplica | MIT (repo ML-Agents) | GitHub Unity-Technologies |
| Agentes comunitarios SoccerTwos en el Hub | SoccerTwos | PPO / POCA / self-play | variable | no aplica | variable | Hugging Face |

La comparación cuantitativa no es posible con la información disponible; las alternativas se limitan a otras políticas del mismo entorno publicadas por la comunidad o por Unity.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona simbólicamente ni responde a prompts.
- Específico del entorno SoccerTwos; no generaliza a otros escenarios sin reentrenamiento.
- Sin licencia declarada: el uso comercial queda en un limbo legal y requiere contactar con el autor.
- Sin información sobre sesgos, robustez o comportamiento fuera de distribución.
- Riesgo de sobreajuste a la configuración exacta del entorno (versión de ML-Agents, parámetros del simulador).
- El repositorio incluye artefactos de TensorBoard y checkpoints, no solo el modelo final; conviene revisar el contenido antes de desplegarlo.
- Fecha de creación indicada como 2026-11-15, posterior a la fecha actual de consulta; conviene verificar la integridad del repositorio.
- Sin métricas publicadas de win-rate ni de recompensa media, por lo que no se puede evaluar su calidad relativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HasanBozkurt/poca-SoccerTwos
- Repositorio Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes Unity en Hugging Face: https://huggingface.co/unity
