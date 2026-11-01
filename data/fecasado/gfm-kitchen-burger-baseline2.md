# fecasado/gfm-kitchen-burger-baseline2

## Resumen

GFM Kitchen Burger Baseline2 es una política robótica entrenada con LeRobot y publicada en HuggingFace por el usuario `fecasado`. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) orientado a control robótico, concretamente a la manipulación de un objeto tipo hamburguesa en un entorno de cocina, tal como indica su nombre y el dataset asociado `fecasado/burger-to-plate-good-320x240`. El modelo emplea una arquitectura denominada `gaze_flow_matching`, que combina mecanismos de atención basados en mirada (gaze) con flow matching para generar trayectorias de acción continuas.

El modelo tiene 75.216.858 parámetros (aproximadamente 75,2 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,3 GB. Está pensado para ejecutarse sobre robots tipo SO-100 (el ejemplo de la model card usa `so100_follower`) y se integra en el ecosistema LeRobot de HuggingFace, que proporciona las herramientas de entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).

Su relevancia es acotada pero concreta: sirve como baseline reproducible para tareas de manipulación pick-and-place en robótica de bajo coste, y demuestra el flujo completo de entrenamiento y despliegue de políticas con LeRobot. La licencia Apache 2.0 permite reutilización comercial, aunque el modelo está entrenado para una tarea muy específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gaze_flow_matching (política de imitación con flow matching y atención gaze) |
| Parametros totales | 75.216.858 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo robótico, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como `gaze_flow_matching`. Flow matching es una técnica generativa que aprende un campo vectorial que transforma una distribución simple (por ejemplo, ruido gaussiano) en la distribución de acciones objetivo, y se usa habitualmente en políticas de imitación para modelar distribuciones multimodales de acciones. El componente "gaze" sugiere que la política incorpora información de atención visual o de mirada, aunque la model card no detalla cómo se implementa ni qué entradas recibe exactamente.

El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/burger-to-plate-good-320x240`, que por su nombre corresponde a episodios de demostración a resolución 320x240 de una tarea de mover una hamburguesa a un plato. No se dispone de información sobre el número de episodios, tokens o pasos de entrenamiento, ni sobre si se aplicaron técnicas de RLHF, DPO o aumentación de datos. La model card es una plantilla sin completar ("Model type not recognized — please update this template"), por lo que los detalles técnicos del entrenamiento no están documentados.

## Capacidades

- Control robótico de manipulación: genera acciones motoras continuas para un brazo robótico (por ejemplo, SO-100) a partir de observaciones visuales y de estado.
- Imitación de demostraciones: reproduce la tarea de trasladar un objeto (hamburguesa) a un destino (plato) aprendida del dataset de demostraciones.
- Política visual-motora: procesa observaciones de cámara a resolución 320x240 según el dataset de entrenamiento.
- Integración con LeRobot: compatible con `lerobot-train` para reentrenamiento y `lerobot-record` para evaluación en robot real.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Baseline para investigación en imitación robótica: sirve como punto de partida reproducible para comparar nuevas políticas de flow matching sobre la misma tarea y dataset, gracias a que el checkpoint y el dataset están publicados.
- Manipulación pick-and-place en cocina de bajo coste: el modelo puede desplegarse en un SO-100 follower para trasladar objetos de una posición a otra en un entorno controlado, usando `lerobot-record` con `--policy.path`.
- Evaluación de pipelines de LeRobot: útil para validar el flujo completo de entrenamiento, registro de episodios y evaluación en hardware real antes de escalar a tareas más complejas.
- Docencia y prototipado rápido: con 75,2 M de parámetros y 0,3 GB de pesos, es ligero y adecuado para demostraciones de aprendizaje por imitación en cursos o talleres.
- Reentrenamiento con datos propios: al estar en formato safetensors y bajo Apache 2.0, se puede afinar sobre nuevos datasets de manipulación con la misma configuración de política.
- Pruebas de robustez visual: permite experimentar con variaciones de iluminación, posición de cámara o resolución para estudiar la generalización de políticas gaze+flow matching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 75,2 M de parámetros en fp32 los pesos ocupan aproximadamente 0,3 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060, RTX 4090 o cualquier GPU con soporte CUDA es suficiente. Para entrenamiento se recomienda al menos una GPU con 8-12 GB.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con backend PyTorch/CUDA; no se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo robótico).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gfm-kitchen-burger-baseline2 | 75,2 M | Manipulación robótica (burger to plate) | no aplica | Apache 2.0 | HuggingFace |
| Políticas ACT de LeRobot | no disponible | Imitación robótica genérica | no aplica | Apache 2.0 (LeRobot) | HuggingFace / GitHub |
| Políticas Diffusion Policy | no disponible | Imitación robótica multimodal | no aplica | según implementación | Repos de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Model card incompleta: la plantilla no se ha rellenado ("Model type not recognized"), por lo que faltan detalles de arquitectura, datos y evaluación.
- Especialización extrema: entrenado para una única tarea (mover una hamburguesa a un plato) y un único dataset; no generaliza a otras tareas sin reentrenamiento.
- Sin métricas publicadas: no hay tasas de éxito, curvas de aprendizaje ni evaluaciones cuantitativas que permitan juzgar su calidad.
- Dependencia de hardware específico: el ejemplo usa `so100_follower`; su funcionamiento en otros robots no está verificado.
- Riesgo de sobreajuste al entorno: cambios de iluminación, fondo, posición de cámara o resolución pueden degradar el rendimiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo en producción.
- Sin capacidades lingüísticas: no debe evaluarse con benchmarks de texto (MMLU, HumanEval, GSM8K) ni usarse como modelo conversacional.

## Enlaces

- HuggingFace: https://huggingface.co/fecasado/gfm-kitchen-burger-baseline2
- Dataset asociado: https://huggingface.co/datasets/fecasado/burger-to-plate-good-320x240
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
