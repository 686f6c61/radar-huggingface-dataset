# kmirain/rl_course_vizdoom_health_gathering_supreme

## Resumen

El modelo `kmirain/rl_course_vizdoom_health_gathering_supreme` es un agente de aprendizaje por refuerzo (RL) entrenado con el algoritmo APPO (Asymmetric Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo ha desarrollado el usuario kmirain como parte de un curso de RL, utilizando la librería Sample-Factory 2.0 para el entrenamiento. El objetivo del entorno es que el agente aprenda a recolectar paquetes de salud en un escenario 3D de estilo Doom, maximizando su recompensa acumulada (mean reward de 12.22 ± 5.01 en el benchmark declarado).

La relevancia de este modelo es didáctica y práctica: representa un ejemplo de entrenamiento de un agente RL con una política asíncrona sobre un entorno parcialmente observable, y sirve como referencia para quien quiera reproducir o comparar resultados en tareas de navegación y recolección en entornos de simulación. No se trata de un modelo de lenguaje ni de visión general, sino de un agente especializado para un entorno concreto. La información pública es limitada: no se especifican la arquitectura de la red neuronal, el número de parámetros, ni los detalles del entrenamiento más allá del algoritmo y el entorno.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente una CNN, pero no se especifica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene 0.1 GB de datos, probablemente pesos en formato PyTorch, pero no se indica) |

## Arquitectura y entrenamiento

El modelo fue entrenado con el algoritmo `APPO` (Asymmetric Proximal Policy Optimization), implementado en la librería Sample-Factory 2.0. APPO es una variante asíncrona de PPO que permite entrenar agentes con múltiples actores y un aprendiz central, optimizando el uso de recursos en entornos de simulación como ViZDoom. No se han publicado detalles sobre la arquitectura de la red neuronal (capas, número de parámetros, tipo de red), ni sobre el dataset de entrenamiento más allá del entorno `doom_health_gathering_supreme`. Tampoco se indica si se emplearon técnicas como normalización de observaciones, buffers de experiencia o procesos de recompensa adicionales.

El entorno `doom_health_gathering_supreme` es un escenario estándar de ViZDoom donde el agente debe moverse por un mapa 3D para recolectar paquetes de salud, con un límite de tiempo. La recompensa se basa en la cantidad de salud recogida. El modelo se entrenó con Sample-Factory 2.0, y el repositorio incluye el modelo finalizado listo para ejecutar con el script `enjoy` correspondiente.

## Capacidades

- Ejecución de políticas de control en entornos de simulación 3D: el agente es capaz de tomar decisiones de movimiento y navegación en el entorno `doom_health_gathering_supreme`.
- Recolección de objetos: el modelo aprende a localizar y recolectar paquetes de salud de forma eficiente, maximizando la recompensa media.
- Aprendizaje por refuerzo: el agente ha sido entrenado mediante RL, por lo que su comportamiento está optimizado para la tarea específica del entorno.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, razonamiento simbólico, tool calling ni agentes conversacionales.
- No soporta visión general: aunque procesa observaciones visuales (píxeles del entorno), su capacidad se limita al entorno de entrenamiento.
- No tiene soporte multilingüe ni capacidades de audio.

## Casos de uso

- **Evaluación de algoritmos de RL**: el modelo sirve como punto de comparación para estudiantes o investigadores que quieran validar implementaciones de APPO o PPO en entornos de ViDoom, comparando su recompensa media (12.22 ± 5.01) con otros agentes.
- **Práctica en cursos de deep reinforcement learning**: es un ejemplo típico para ejercicios de certificación (como el del curso de Hugging Face Deep RL), donde se pide obtener un resultado ≥ 5 en este entorno; este modelo supera ese umbral y puede usarse como referencia de éxito.
- **Estudio de comportamiento en entornos parcialmente observables**: el entorno de ViDoom es parcialmente observable (el agente solo ve una parte del mapa), lo que permite analizar cómo el modelo gestiona la incertidumbre y la memoria a corto plazo.
- **Prueba de integración con Sample-Factory**: el modelo sirve para verificar el flujo de descarga, carga y ejecución de agentes entrenados con Sample-Factory 2.0, tanto en inferencia (`enjoy`) como en re-entrenamiento (`resume`).
- **Comparativa entre agentes de la misma tarea**: hay otros modelos del mismo curso (p.ej., `liamleirs/rl_course_vizdoom_health_gathering_supreme` o `Cloud1989/rl_course_vizdoom_health_gathering_supreme`) que pueden compararse para estudiar la variabilidad del entrenamiento.
- **Investigación en entornos de juego**: el modelo puede usarse como baseline para probar variaciones de hiperparámetros o modificaciones del entorno en tareas de recolección de recursos.

## Benchmarks y rendimiento

El autor ha declarado el siguiente resultado en la model card:

| Modelo | Entorno | Métrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 12.22 ± 5.01 |

No se han publicado resultados de benchmarks en la información disponible. No hay comparaciones con otros modelos del mismo entorno ni métricas adicionales (como el número de pasos de entrenamiento, tiempo de entrenamiento o tasa de éxito).

## Requisitos de hardware

No se ha especificado los requisitos de hardware en la información proporcionada. Sin embargo, por la naturaleza del entorno (ViZDoom, con observaciones de píxeles de baja resolución) y el algoritmo APPO, se puede inferir:

- El modelo es ligero (0.1 GB de tamaño del repositorio), por lo que la inferencia puede ejecutarse en una CPU moderna o en una GPU de gama baja (p.ej., NVIDIA GTX 1050 o superior).
- El entrenamiento de un agente en este entorno típicamente requiere una GPU para acelerar la red neuronal, pero la memoria VRAM necesaria es baja (menos de 2 GB en la mayoría de configuraciones).
- Para inferencia, la carga del modelo y la ejecución del entorno puede realizarse en un portátil estándar sin GPU, aunque con menor velocidad de fotogramas.
- El despliegue se realiza mediante los scripts de Sample-Factory (`enjoy`), que requieren tener instalada la librería y el entorno de ViZDoom. No se ha documentado el uso de vLLM, Ollama ni otros frameworks de inferencia, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No hay datos de rendimiento comparables de otros modelos en la información proporcionada. Sin embargo, se conocen otros agentes entrenados en el mismo entorno por otros usuarios del mismo curso:

| Modelo | Algoritmo | Recompensa media declarada |
|---|---|---|
| kmirain/rl_course_vizdoom_health_gathering_supreme | APPO | 12.22 ± 5.01 |
| liamliars/rl_course_vizdoom_health_gathering_supreme | APPO | no disponible |
| Cloud1989/rl_course_vizdoom_health_gathering_supreme | APPO | no disponible |

No se dispone de más detalles técnicos (parámetros, contexto, licencia) de los modelos comparables.

## Limitaciones y advertencias

- **Alcance limitado**: el modelo está entrenado exclusivamente para el entorno `doom_health_gathering_supreme`. No funciona en otros escenarios de ViZDoom ni en tareas fuera del ámbito de recolección de salud.
- **Datos de entrenamiento no especificados**: no se informa sobre el número de pasos de entrenamiento, la configuración de hiperparámetros ni la composición de las observaciones, lo que dificulta la reproducibilidad exacta.
- **Rendimiento con alta varianza**: la recompensa media de 12.22 ± 5.01 indica una desviación estándar significativa, lo que sugiere que el agente puede tener un comportamiento muy variable entre episodios.
- **Licencia desconocida**: no se ha declarado licencia, por lo que su uso comercial o redistribución puede estar sujeto a incertidumbre legal. Se recomienda contactar con el autor antes de usar en producción.
- **Sin soporte de texto ni lenguaje**: no es un modelo de lenguaje; no puede generar texto, responder preguntas ni procesar instrucciones.
- **Dependencia de Sample-Factory**: el modelo solo puede ejecutarse con la infraestructura de Sample-Factory, lo que limita su portabilidad a otros frameworks de RL.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kmirain/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Modelo similar de liamliars: https://huggingface.co/liamliars/rl_course_vizdoom_health_gathering_supreme
- Modelo similar de Cloud1989: https://huggingface.co/Cloud1989/rl_course_vizdoom_health_gathering_supreme
- Repositorio de ejemplo en GitHub: https://github.com/RENHANFEI/vizdoom_health_gathering
- Notebook de la clase de Deep RL (unidad 8): https://colab.research.google.com/github/huggingface/deep-rl-class/blob/master/notebooks/unit8/unit8_part2.ipynb
