# Guru-Raja-124/ppo-Pyramid

## Resumen

ppo-Pyramid es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo PPO (Proximal Policy Optimization) para resolver el entorno Pyramids del toolkit Unity ML-Agents. Su autor es el usuario de Hugging Face Guru-Raja-124, y el modelo se enmarca en el ecosistema educativo del curso de Deep RL de Hugging Face, que enseña a entrenar agentes con ML-Agents y publicarlos en el Hub. No se trata de un modelo de lenguaje, sino de una política entrenada cuyo objetivo es que el agente navegue por el entorno 3D Pyramids, empuje una caja hacia una zona objetivo y supere obstáculos.

El entorno Pyramids es uno de los ejemplos clásicos de Unity ML-Agents: un agente en forma de esfera debe aprender, mediante recompensas dispersas y curriculúm de entrenamiento, a mover una caja gigante hasta una zona dorada situada detrás de un muro. Resolverlo requiere que la política aprenda comportamientos compuestos (empujar, esquivar, planificar rutas), lo que lo convierte en un buen banco de pruebas didáctico para PPO con entornos vectorizados.

Su relevancia actual es principalmente formativa y de demostración: permite verificar el flujo completo de entrenamiento, exportación a ONNX y visualización en el navegador, y sirve como punto de partida para experimentos propios de RL con ML-Agents. El modelo se distribuye con pesos en formato ONNX y es ejecutable directamente desde el navegador mediante el espacio de demostración de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (PPO), arquitectura detallada no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (y/o .nn de ML-Agents) |

## Arquitectura y entrenamiento

El agente se ha entrenado con PPO (Proximal Policy Optimization), el algoritmo por defecto de Unity ML-Agents, un método actor-crítico on-policy que optimiza la política mediante recortes del objetivo de sustitución para garantizar actualizaciones estables. En ML-Agents, la red de política suele ser una red neuronal pequeña (por defecto, capas totalmente conectadas de 128-256 unidades, o una CNN si se usan observaciones visuales), aunque la configuración exacta de este entrenamiento no está publicada en la model card.

El entorno Pyramids incorpora un mecanismo de curriculum de entrenamiento: la dificultad aumenta progresivamente (la distancia y los obstáculos cambian) a medida que el agente mejora su recompensa media. El entrenamiento emplea observaciones vectorizadas del estado del entorno y recompensas esparcidas combinadas con bonificaciones por acercar la caja a la zona objetivo. No hay información publicada sobre el número de pasos de entrenamiento, hiperparámetros concretos ni la semilla utilizada.

## Capacidades

- Control de un agente en el entorno 3D Pyramids de Unity ML-Agents: navegar, empujar una caja y alcanzar la zona objetivo.
- Comportamientos aprendidos de forma autónoma mediante recompensas, sin programación explícita de reglas.
- Inferencia eficiente en tiempo real gracias a la exportación a ONNX, compatible con el runtime de Unity (Sentis/Barracuda).
- Visualización directa del agente jugando en el navegador desde la página de demostraciones de Hugging Face.
- Posibilidad de reanudar el entrenamiento con `mlagents-learn --resume` para seguir afinando la política.

## Casos de uso

- Formación en aprendizaje por refuerzo: sirve como ejemplo completo y funcional del flujo PPO + ML-Agents, ideal para estudiantes del curso de Deep RL de Hugging Face que quieran comparar sus propios entrenamientos con una política ya resuelta.
- Evaluación de entornos: permite comprobar rápidamente que una instalación de Unity ML-Agents y su pipeline de inferencia ONNX funcionan correctamente antes de lanzar experimentos propios.
- Demostraciones interactivas: el agente puede visualizarse en el navegador desde https://huggingface.co/unity, útil para presentaciones, docencia o divulgación de RL sin instalar nada.
- Punto de partida para transferencia: la política puede reanudarse y ajustarse con otros hiperparámetros, recompensas o curriculum como base para experimentos de mejora.
- Benchmarking educativo: comparar el rendimiento de variantes de PPO (tamaño de red, tasa de aprendizaje, GAE) sobre un entorno estándar y reproducible.
- Prototipado de políticas para juegos: el flujo ONNX + Unity Sentis es el mismo que se usaría para incorporar agentes entrenados en videojuegos reales, por lo que el modelo ilustra el pipeline de producción de RL en Unity.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa media, número de pasos de entrenamiento ni comparativas con otras políticas del entorno Pyramids.

## Requisitos de hardware

- VRAM: mínima; al ser una política pequeña exportada a ONNX, la inferencia funciona en CPU y en cualquier GPU moderna con unos cientos de MB de memoria.
- GPU recomendadas: no se requiere GPU para inferencia. Para reentrenar, cualquier GPU de consumo (por ejemplo, una GTX 1660 o superior) es suficiente, ya que ML-Agents ejecuta la red en PyTorch y la simulación en CPU.
- Consumer GPU: sí, cabe sin problemas en cualquier GPU de consumo; incluso es ejecutable íntegramente en CPU.
- Despliegue: Unity ML-Agents (mediante `mlagents-learn` para reanudar entrenamiento), Unity con runtime ONNX (Sentis/Barracuda) para inferencia en el motor, y el visualizador web de Hugging Face en https://huggingface.co/unity.
- Latencia y throughput: no disponible; en entornos de este tipo la inferencia por paso es de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia |
|---|---|---|---|---|
| Guru-Raja-124/ppo-Pyramid | Pyramids (Unity ML-Agents) | PPO | ONNX | no disponible |
| Otras políticas ppo-Pyramids en el Hub (p. ej. las generadas en el curso de Deep RL de Hugging Face) | Pyramids (Unity ML-Agents) | PPO | ONNX | habitualmente Apache 2.0 (según el usuario) |
| Políticas ppo-Huggy o ppo-Pyramids de la organización hf-course / usuarios del curso | Huggy, Pyramids, otros entornos ML-Agents | PPO | ONNX | varía por usuario |

Todos estos modelos comparten categoría (políticas PPO para entornos de Unity ML-Agents publicadas como resultado del curso de Deep RL de Hugging Face); se diferencian principalmente en hiperparámetros de entrenamiento y recompensa final obtenida, datos que no están publicados para esta ficha.

## Limitaciones y advertencias

- Licencia no especificada en la model card: antes de cualquier uso comercial o redistribución conviene contactar con el autor o asumir que no hay permisos explícitos.
- Alcance muy limitado: la política solo es válida para el entorno Pyramids con las observaciones para las que fue entrenada; no generaliza a otros entornos ni tareas.
- No es un modelo de lenguaje: carece de capacidades de texto, razonamiento lingüístico o tool calling; cualquier comparación con LLMs carece de sentido.
- Riesgo de comportamiento subóptimo: sin métricas publicadas, no se puede garantizar que la política resuelva el entorno de forma óptima o estable en todas las ejecuciones (varianza típica de PPO).
- Metadatos escasos: no hay información sobre hiperparámetros, semillas ni pasos de entrenamiento, lo que dificulta la reproducibilidad exacta del resultado.
- Descargas muy bajas (23 en el momento de la ficha) y ausencia de validación comunitaria (0 likes), por lo que el modelo no ha sido probado ampliamente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Guru-Raja-124/ppo-Pyramid
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación de ML-Agents Toolkit: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto (Huggy) del curso de Deep RL: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents (unidad 5) del curso de Deep RL: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Demostraciones de agentes ML-Agents en el navegador: https://huggingface.co/unity
