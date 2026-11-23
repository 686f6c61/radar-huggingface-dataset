# DW12345/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un modelo de aprendizaje por refuerzo profundo (deep reinforcement learning) entrenado con el algoritmo POCA (Policy Optimization with Clipped Advantages) dentro de la librería Unity ML-Agents. Lo publica el usuario DW12345 en Hugging Face y está diseñado específicamente para resolver el entorno SoccerTwos, un escenario competitivo 2 contra 2 en el que dos equipos de agentes controlan jugadores de fútbol en un campo de Unity. No es un modelo de lenguaje: es una política neuronal que mapea observaciones del entorno a acciones motoras.

El modelo se distribuye en formato ONNX (y presumiblemente .nn, el formato propietario de ML-Agents) y se integra con el ecosistema de Unity para ejecutarse tanto en el editor como en el navegador mediante el visor de Hugging Face. Su relevancia es acotada: sirve como ejemplo reproducible de entrenamiento multiagente competitivo con POCA, una variante de PPO adaptada a entornos cooperativos-competitivos, y como punto de partida para experimentos de self-play en ML-Agents.

La información pública es muy limitada: no hay licencia declarada, no se especifican idiomas (no aplica), no hay benchmarks publicados ni detalles sobre hiperparámetros, número de pasos de entrenamiento o composición de recompensas. El tamaño del repositorio es de aproximadamente 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para RL (ML-Agents, algoritmo POCA); topología exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observaciones por paso del entorno SoccerTwos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (y presumiblemente .nn de ML-Agents); safetensors no disponible |

## Arquitectura y entrenamiento

El modelo es una política entrenada con POCA, un algoritmo de optimización de política con ventajas recortadas (clipped advantages) implementado en Unity ML-Agents. POCA está pensado para entornos multiagente con dinámicas cooperativas y competitivas, como SoccerTwos, donde dos equipos de dos agentes compiten por el balón. La política consume observaciones vectoriales y, opcionalmente, raycast/visuales del entorno, y produce acciones discretas o continuas según la configuración del escenario.

No se dispone de información sobre el número de pasos de entrenamiento, la configuración de hiperparámetros (learning rate, batch size, número de épocas), la composición de las recompensas, el uso de self-play o curricula, ni sobre si se aplicaron técnicas auxiliares como reward shaping o imitation learning. Tampoco se documenta la topología de la red (número de capas, unidades por capa, uso de LSTM o memoria recurrente). El repositorio incluye logs de TensorBoard según las etiquetas, pero no se detalla su contenido.

## Capacidades

- Control motor de agentes en el entorno SoccerTwos de Unity ML-Agents (movimiento, orientación y acciones de fútbol definidas por el escenario).
- Juego competitivo 2 contra 2 mediante políticas entrenadas con POCA.
- Ejecución en inferencia dentro del editor de Unity y en el visor web de Hugging Face a partir del archivo ONNX.
- Reanudación del entrenamiento con `mlagents-learn --resume` usando el checkpoint correspondiente.
- No soporta tool calling, function calling, agentes multi-step, generación de texto, visión general, audio ni capacidades multilingües.
- No dispone de modo "thinking" ni de razonamiento simbólico; su comportamiento es puramente reactivo según la política aprendida.

## Casos de uso

- Investigación en RL multiagente: reproducir el entrenamiento de POCA en SoccerTwos para estudiar dinámicas de cooperación y competición entre agentes; el modelo sirve como baseline entrenado.
- Docencia y tutoriales de ML-Agents: usar el agente como ejemplo práctico en cursos sobre Unity ML-Agents y el flujo de publicación en Hugging Face, tal como sugiere la model card.
- Evaluación de algoritmos: comparar el rendimiento de POCA frente a PPO u otros algoritmos en el mismo escenario usando este checkpoint como referencia.
- Demostraciones interactivas: desplegar el agente en el visor web de Hugging Face para mostrar comportamiento aprendido sin necesidad de infraestructura local.
- Punto de partida para fine-tuning: reanudar el entrenamiento con `--resume` y modificar recompensas o curricula para experimentar con variantes del escenario.
- Pruebas de integración de ONNX en Unity: validar pipelines de exportación e inferencia de modelos ONNX dentro de proyectos Unity ML-Agents.
- Generación de datos sintéticos de juego: ejecutar partidas del agente para recolectar trayectorias y analizar estrategias emergentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio ocupa 0,1 GB y la política es una red pequeña típica de ML-Agents, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más. No se dispone de cifra exacta de parámetros.
- GPU recomendadas: cualquier GPU compatible con Unity y ONNX Runtime; para entrenamiento se recomienda al menos una RTX 3060 o superior, aunque no hay datos publicados de throughput.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU moderna (GTX 1060 en adelante) e incluso en CPU para inferencia.
- Opciones de despliegue: Unity ML-Agents (editor y build), ONNX Runtime, visor web de Hugging Face (https://huggingface.co/unity) y el formato .nn nativo de ML-Agents.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DW12345/poca-SoccerTwos | SoccerTwos | POCA | no disponible | no aplica | no disponible | Hugging Face |
| Agentes oficiales de Unity ML-Agents (p. ej. los publicados en huggingface.co/unity) | SoccerTwos y otros | PPO/POCA según configuración | no disponible | no aplica | generalmente licencia del proyecto ML-Agents | Hugging Face |
| Checkpoints de la comunidad para SoccerTwos | SoccerTwos | PPO habitualmente | no disponible | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; en RL, las políticas pueden explotar recompensas de forma no prevista y mostrar comportamientos degenerados.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero la política puede generalizar mal fuera de la distribución de entrenamiento del escenario SoccerTwos.
- Limitaciones de contexto o idioma: el modelo solo funciona en el entorno SoccerTwos con la configuración de observaciones y acciones para la que fue entrenado; no es reutilizable directamente en otros escenarios sin reentrenamiento.
- Restricciones de licencia para uso comercial: la licencia no está declarada, por lo que no se puede asumir permiso de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Caveats para producción: repositorio con 0 descargas y 0 likes, sin documentación de hiperparámetros ni métricas; la fecha de creación indicada (2026-11-23) es futura respecto a la información habitual, lo que sugiere posibles inconsistencias en los metadatos.
- No incluye información sobre versiones de ML-Agents ni de Unity compatibles, lo que puede provocar fallos de carga si las versiones no coinciden.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DW12345/poca-SoccerTwos
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Hugging Face: https://huggingface.co/unity
