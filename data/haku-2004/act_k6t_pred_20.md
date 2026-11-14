# Haku-2004/act_k6t_pred_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_k6t_pred_20`, es una política entrenada con LeRobot sobre el dataset `Haku-2004/k6_4seg` y publicada en Hugging Face con licencia Apache 2.0. El modelo está pensado para control de robots manipuladores a partir de demostraciones teleoperadas.

El modelo emplea una arquitectura transformer con un codificador visual y un decodificador de acciones, con 51,7 millones de parámetros en formato safetensors. Es un modelo de robótica de extremo a extremo: recibe observaciones (típicamente imágenes de cámaras y estado de las articulaciones) y emite comandos de acción para el robot. No es un modelo de lenguaje ni un modelo multimodal de propósito general; su ámbito es la política de control.

Su relevancia radica en que ejemplifica el flujo actual de entrenamiento y despliegue de políticas robóticas con LeRobot, la librería de Hugging Face, y en que el método ACT es una referencia habitual para tareas de manipulación con pocas demostraciones. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye información sobre idiomas ni resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT: Action Chunking with Transformers), con codificador visual y decodificador de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un fragmento (chunk) de acciones futuras. La arquitectura combina un codificador de observaciones (habitualmente imágenes de una o varias cámaras junto con el estado de las articulaciones) y un decodificador transformer que genera la secuencia de acciones. Esta formulación reduce el error de acumulación y mejora la estabilidad en tareas de manipulación, según el paper de referencia (arXiv:2304.13705).

El modelo se ha entrenado con LeRobot sobre el dataset `Haku-2004/k6_4seg`, que no está descrito en la información disponible (no se indica número de episodios, composición ni número de tokens). No se documenta si hubo RLHF, DPO ni ninguna etapa de ajuste posterior; en el contexto de ACT, el entrenamiento es supervisado sobre demostraciones teleoperadas. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control de robots manipuladores mediante predicción de fragmentos de acción a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Ejecución de políticas entrenadas con LeRobot, con soporte para el flujo `lerobot-record` y `lerobot-train`.
- Integración con robots del ecosistema LeRobot, como el `so100_follower` mencionado en la model card.
- No dispone de generación de texto, razonamiento lingüístico, código ni matemáticas.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso.
- No dispone de capacidades multilingües, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política puede ejecutar tareas de picking y colocación tras entrenarse con demostraciones teleoperadas del dataset `k6_4seg`, usando el flujo de LeRobot para entrenamiento y evaluación.
- Prototipado de políticas con LeRobot: sirve como punto de partida para reproducir el pipeline `lerobot-train` y `lerobot-record` con el robot `so100_follower`, útil para equipos que evalúan el ecosistema antes de invertir en hardware propio.
- Investigación en aprendizaje por imitación: permite comparar la formulación de action chunking frente a políticas que predicen acciones paso a paso en tareas de manipulación con pocas demostraciones.
- Automatización de tareas repetitivas en entornos controlados: al predecir fragmentos de acción, reduce la acumulación de error en secuencias largas, lo que encaja en tareas de ensamblaje o clasificación de piezas.
- Docencia y formación en robótica: el modelo y su model card permiten ilustrar el ciclo completo de entrenamiento, evaluación y despliegue de una política ACT con herramientas open source.
- Base para fine-tuning en tareas específicas: al estar en formato safetensors y con licencia Apache 2.0, puede reentrenarse o ajustarse sobre nuevos datasets de demostraciones sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 millones de parámetros en safetensors, el peso en precisión completa ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para la política, aunque el requisito real depende de las cámaras y del preprocesado visual.
- Cabe en GPU de consumo: sí, previsiblemente en modelos como RTX 3060, RTX 4060 o superiores, dado el reducido número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte para ejecución en local o desde el Hub; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k6t_pred_20 | 51,7 M | no disponible | Política ACT para manipulación | Apache 2.0 | Hugging Face, 0 descargas |
| ACT (implementación de referencia LeRobot) | no disponible | no disponible | Política ACT genérica | Apache 2.0 | Repositorio LeRobot |
| Diffusion Policy | no disponible | no disponible | Política de imitación basada en difusión | no disponible | Repositorios de investigación |
| RT-1 / RT-2 | no disponible | no disponible | Políticas robóticas de gran escala | no disponible | Principalmente investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No hay información sobre sesgos; al ser un modelo de robótica entrenado con un dataset concreto, puede heredar los sesgos de las demostraciones (posiciones, objetos y condiciones de iluminación del dataset `k6_4seg`).
- Riesgo de alucinación en el sentido de acciones incorrectas o fuera de distribución cuando las observaciones difieren de las del entrenamiento; no hay evaluación publicada que cuantifique este riesgo.
- Limitaciones de contexto e idioma: no aplica el concepto de contexto lingüístico; el alcance está limitado al entorno y al robot con los que se entrenó.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset `Haku-2004/k6_4seg`.
- Caveat para producción: el repositorio tiene 0 descargas y 0 likes, no incluye métricas de éxito ni detalles del dataset, por lo que no debe desplegarse en entornos reales sin una evaluación propia previa.
- No se documentan requisitos de seguridad física para la operación del robot; en manipulación real es imprescindible establecer límites de par, paradas de emergencia y supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6t_pred_20
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
