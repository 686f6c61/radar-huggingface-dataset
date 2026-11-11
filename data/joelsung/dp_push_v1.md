# joelsung/dp_push_v1

## Resumen

`joelsung/dp_push_v1` es una política de control visuomotor entrenada con Diffusion Policy y publicada en Hugging Face mediante la librería LeRobot. El modelo resuelve una tarea concreta de manipulación robótica: el empuje (push) de objetos con un brazo SO-101, a partir del dataset `joelsung/so101_push_v1`. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un checkpoint de política para un robot físico concreto.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, con un tamaño de repositorio de 0,3 GB y 78.027.428 parámetros en formato safetensors. Su interés técnico reside en que ejemplifica el flujo de trabajo actual de LeRobot para entrenar y desplegar políticas de imitación con difusión en robots de bajo coste de la familia SO-100/SO-101.

Diffusion Policy trata el control visuomotor como un proceso generativo de difusión, produciendo trayectorias de acción multimodales y suaves que rinden bien en manipulación con contacto rico. Este checkpoint concreto está especializado en una única tarea de empuje y no debe interpretarse como un modelo generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión para control visuomotor), entrenada con LeRobot |
| Parámetros totales | 78.027.428 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones y horizonte de acción) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el planteamiento de Diffusion Policy (paper arXiv 2303.04137): el control visuomotor se modela como un proceso de difusión que genera secuencias de acciones (action chunks) en lugar de predecir una única acción por paso. Esto permite producir trayectorias multimodales y suaves, lo que resulta especialmente útil en tareas de manipulación con contacto, como el empuje de objetos.

El entrenamiento se ha realizado con LeRobot sobre el dataset `joelsung/so101_push_v1`, orientado al robot SO-101. No se dispone de información sobre el número de episodios, la composición del dataset, el número de pasos de entrenamiento ni si se aplicaron técnicas de aumento de datos o regularización. La model card no documenta detalles de hiperparámetros ni de la configuración de difusión (número de pasos de ruido, scheduler, etc.).

## Capacidades

- Generación de trayectorias de acción para manipulación robótica mediante difusión.
- Ejecución de una tarea especializada de empuje de objetos con un brazo SO-101.
- Producción de acciones multimodales y suaves, adecuadas para contacto rico.
- Integración con el ecosistema LeRobot para entrenamiento, registro y evaluación.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües, de visión general, audio ni modo thinking.
- No se documentan capacidades de generalización a otras tareas, objetos o morfologías de robot.

## Casos de uso

- Investigación en imitación robótica: sirve como punto de partida reproducible para estudiar Diffusion Policy en tareas de empuje con SO-101, usando el dataset asociado y el flujo de LeRobot.
- Prototipado de pipelines de entrenamiento: permite validar el ciclo `lerobot-train` → `lerobot-record` con una política de difusión y un robot de bajo coste antes de escalar a tareas más complejas.
- Docencia y demostraciones: útil en cursos de robótica de aprendizaje para ilustrar políticas generativas de acciones con hardware asequible.
- Benchmark interno de manipulación con contacto: puede emplearse como línea base frente a políticas ACT u otras alternativas en la misma tarea de empuje.
- Evaluación de infraestructura de inferencia en robot: permite medir latencia y estabilidad de una política de difusión en un SO-101 real o simulado.
- Reentrenamiento con datos propios: el checkpoint y la receta LeRobot facilitan el fine-tuning sobre nuevos episodios de empuje o variantes de la tarea.
- No es adecuado para atención al cliente, generación de código, análisis de documentos ni ninguna aplicación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 78 millones de parámetros en safetensors, el peso en precisión completa ronda los 0,3 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no documentadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia, y una RTX 3060/4060 o superior para entrenamiento ligero.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas modernas con 8 GB o más, aunque el autor no lo confirma.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de CUDA vía `--policy.device=cuda`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joelsung/dp_push_v1 | Diffusion Policy (SO-101, empuje) | 78.027.428 | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT en LeRobot | Política de imitación (transformer) | no disponible | no aplica | según checkpoint | Ecosistema LeRobot |
| Otras Diffusion Policy en LeRobot Hub | Política de difusión | variable | no aplica | según checkpoint | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado para una única tarea de empuje con SO-101; no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Sin datos de evaluación publicados: no hay métricas de éxito, robustez ni generalización, lo que impide valorar su calidad real.
- Sesgos: al derivarse de un dataset concreto de demostraciones, hereda los sesgos de las trayectorias humanas registradas (posiciones, velocidades, condiciones de iluminación y disposición de objetos).
- Riesgo de fallo en condiciones fuera de distribución: cambios de iluminación, fondo, posición inicial del objeto o del robot pueden degradar el comportamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Sin información sobre cuantización ni sobre requisitos de hardware verificados.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- No apto para aplicaciones lingüísticas: carece de capacidades de texto, código o razonamiento simbólico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joelsung/dp_push_v1
- Dataset asociado: https://huggingface.co/datasets/joelsung/so101_push_v1
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
