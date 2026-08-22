# Atharva1232/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este modelo es un agente de aprendizaje por refuerzo (RL) entrenado en el escenario *Health Gathering Supreme* del simulador VizDoom. Lo desarrolló Atharva1232 con el algoritmo APPO (Asynchronous Proximal Policy Optimization) implementado en Sample-Factory 2.0, un framework de RL de código abierto. El objetivo del agente es recoger paquetes de salud en un entorno 3D en primera persona mientras se desplaza por el mapa, un problema típico de navegación y toma de decisiones secuenciales con entrada visual.

El modelo es ligero (0.1 GB) y se distribuye a través de Hugging Face Hub, con soporte para descarga, inferencia y reanudación del entrenamiento mediante las herramientas de Sample-Factory. Su rendimiento declarado es una recompensa media de 13.30 ± 6.33 en el entorno doom_health_gathering_supreme, aunque el resultado no está verificado externamente. Es relevante como recurso para investigación en RL, comparación de algoritmos y docencia en sistemas de aprendizaje por refuerzo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | APPO (actor-crítico) |
| Parámetros totales | no disponible |
| Longitud de contexto | no aplica (entorno de visión) |
| Tipos de cuantización | no aplica |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo usa el algoritmo APPO (Asynchronous Proximal Policy Optimization), una variante asíncrona de PPO que permite entrenamiento distribuido con múltiples trabajadores. Está implementado con Sample-Factory 2.0, un framework de RL de código abierto desarrollado por Alex Petrenko que optimiza el throughput de entrenamiento mediante buffers de experiencia y actualizaciones asíncronas. La arquitectura concreta de la red neuronal (número de capas convolucionales, dimensiones, tipo de red) no se especifica en la información disponible.

El entorno de entrenamiento es *doom_health_gathering_supreme*, un escenario de VizDoom donde el agente debe recoger paquetes de salud en un mapa 3D mientras evita obstáculos. No se dispone de datos sobre el número de pasos de entrenamiento, la composición del dataset de observaciones ni si se aplicaron técnicas adicionales de regularización o recompensa modelada.

## Capacidades

- Navegación autónoma en entornos 3D en primera persona basada en observaciones visuales.
- Recolección de paquetes de salud de forma eficiente, maximizando la recompensa acumulada.
- Toma de decisiones secuenciales con política aprendida mediante aprendizaje por refuerzo.
- Integración con el ecosistema Sample-Factory para inferencia y reanudación de entrenamiento.
- Funciona exclusivamente en el escenario doom_health_gathering_supreme; no se garantiza generalización a otros entornos de VizDoom.
- No es un modelo de lenguaje: no ofrece generación de texto, tool calling ni capacidades de agentes lingüísticos.

## Casos de uso

- **Investigación en RL**: sirve como ejemplo de entrenamiento de APPO en un entorno 3D con recompensa densa, útil para estudiar la convergencia y estabilidad del algoritmo.
- **Evaluación de algoritmos RL**: permite comparar APPO con otros métodos (PPO, DQN, SAC) en un escenario estandarizado de VizDoom.
- **Fine-tuning para escenarios similares**: el modelo puede servir como punto de partida para transferir la política a otros escenarios de VizDoom con recompensas similares, como *Health Gathering* estándar o *Deadly Corridor*.
- **Entrenamiento de agentes en simulación**: como base para desarrollar agentes autónomos en entornos de simulación 3D, incluyendo robótica virtual o videojuegos.
- **Docencia en RL**: recurso práctico para cursos de aprendizaje por refuerzo, donde los estudiantes pueden cargar el modelo, ejecutarlo y visualizar el comportamiento del agente en el entorno.
- **Benchmarking de frameworks**: permite validar la integración entre Sample-Factory 2.0 y Hugging Face Hub, así como el flujo de descarga y ejecución de modelos RL.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Algoritmo | Entorno | Métrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 13.30 ± 6.33 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 0.1 GB, lo que indica un modelo ligero que cabe en cualquier GPU consumer (incluso de gama baja) y en la mayoría de CPUs para inferencia.
- Para inferencia en tiempo real, una GPU con al menos 4 GB de VRAM es suficiente; la carga del modelo en memoria es mínima.
- Para reanudar el entrenamiento, se recomienda una GPU con al menos 8 GB de VRAM para un rendimiento razonable, aunque el requisito exacto no está documentado.
- El despliegue se realiza mediante los scripts de Sample-Factory 2.0 (`enjoy` para inferencia y `train` para reanudar el entrenamiento). No se usa vLLM, Ollama ni TGI, ya que es un modelo de RL, no un LLM.

## Comparativa con modelos similares

Existen otros modelos publicados en Hugging Face para el mismo entorno, como `dawnandscience/rl_course_vizdoom_health_gathering_supreme` y `Ryukijano/rl_course_vizdoom_health_gathering_supreme`. No se dispone de datos de rendimiento comparativos de estos modelos en la información disponible, por lo que no es posible realizar una comparación cuantitativa.

| Modelo | Autor | Recompensa media | Licencia |
|---|---|---|---|
| rl_course_vizdoom_health_gathering_supreme | Atharva1232 | 13.30 ± 6.33 | no disponible |
| dawnandsand/rl_course_vizdoom_health_gathering_supreme | dawnandsand | no disponible | no disponible |
| Ryukijano/rl_course_vizdoom_health_gathering_supreme | Ryukijano | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia del modelo no está especificada, lo que genera incertidumbre jurídica para un uso comercial o de redistribución.
- El resultado de benchmark (mean_reward 13.30 ± 6.33) está declarado por el autor y no verificado externamente (`verified: false`).
- El modelo es específico para el escenario *doom_health_gathering_supreme*; no se garantiza que generalice a otros entornos de VizDoom ni a tareas fuera del dominio de juego.
- No se ha publicado información sobre el dataset de entrenamiento, el número de pasos ni las técnicas de regularización utilizadas.
- El agente puede presentar comportamientos no óptimos o sesgos derivados de la función de recompensa del entorno, como preferir rutas cortas en lugar de una exploración completa.
- No es un modelo de lenguaje, por lo que no aplica para tareas de NLP, generación de código o tool calling.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Atharva1232/rl_course_vizdoom_health_gathering_supreme)
- [Repositorio de Sample-Factory en GitHub](https://github.com/alex-petrenko/sample-factory)
- [Documentación de Sample-Factory](https://www.samplefactory.dev/)
- [Modelo similar de dawnandsand](https://huggingface.co/dawnandsand/rl_course_vizdoom_health_gathering_supreme)
- [Modelo similar de Ryukijano](https://huggingface.co/Ryukijano/rl_course_vizdoom_health_gathering_supreme)
