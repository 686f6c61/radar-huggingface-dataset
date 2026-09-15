# Ricky97/SO101_pick_dice_in_bowl_small_image_size

## Resumen

SO101_pick_dice_in_bowl_small_image_size es un modelo de política de difusión (Diffusion Policy) para control visuomotor en robótica, desarrollado por Ricky97 y publicado en HuggingFace mediante la librería LeRobot. El modelo está entrenado para ejecutar la tarea de coger un dado y colocarlo en un cuenco blanco, utilizando un robot de tipo `so_follower` con dos cámaras (`wrist` y `agent`). Se trata de un modelo de aprendizaje por imitación que genera trayectorias de acciones suaves y multi-paso, lo que resulta especialmente adecuado para manipulaciones que requieren contacto rico.

La arquitectura se basa en el método Diffusion Policy descrito en el paper 2303.04137, que trata el control visuomotor como un proceso generativo de difusión. El modelo tiene 89.243.670 parámetros y un tamaño de repositorio de 0.4 GB, con los pesos en formato safetensors. No es un modelo de lenguaje, por lo que la longitud de contexto y los idiomas soportados no aplican en el sentido convencional; su "contexto" son las observaciones de estado y las imágenes de las cámaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (paper 2303.04137) |
| Parametros totales | 89.243.670 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponibles (pesos en safetensors, sin cuantizacion documentada) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Diffusion Policy trata el control visuomotor como un proceso generativo de difusión: en lugar de predecir una única acción, el modelo genera una trayectoria completa de acciones mediante denoising iterativo, lo que produce salidas suaves y estables, especialmente en tareas de manipulación con contacto. El modelo consume como entradas el estado del robot (`observation.state`, dimensión 6) y dos imágenes RGB de 480x640 (`observation.images.wrist` y `observation.images.agent`), y produce una acción de dimensión 6 (`action`).

El entrenamiento se realizó con el dataset `Ricky97/SO101_pick_dice_in_bowl`, compuesto por 30 episodios y 11.573 frames a 30 FPS. La configuración de entrenamiento incluye 150.000 pasos, batch size de 32, optimizador Adam, learning rate de 0.0001, seed 1000 y la versión 0.6.2 de LeRobot. No se menciona el uso de RLHF ni DPO; es un modelo de imitación puro.

## Capacidades

- Control visuomotor: genera acciones de 6 dimensiones para un robot `so_follower` a partir de observaciones de estado y dos cámaras.
- Aprendizaje por imitación: reproduce la tarea específica "Pick the dice and put it in the white bowl".
- Entrada multimodal: combina información de estado del robot y visión de las cámaras `wrist` y `agent`.
- Generación de trayectorias: al ser una política de difusión, produce acciones multi-paso suaves, adecuadas para contacto rico.
- No soporta lenguaje, tool calling, razonamiento simbólico ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede ejecutar la tarea de coger un dado y colocarlo en un cuenco, demostrando control preciso en un entorno controlado.
- Investigación en políticas de difusión: sirve como referencia para comparar el rendimiento de Diffusion Policy con otras políticas de imitación en el mismo robot y tarea.
- Fine-tuning para nuevas tareas de manipulación: utilizando LeRobot, el modelo puede ajustarse con nuevos datos de demostración para adaptarlo a otras tareas de recoger y colocar.
- Educación en robótica: permite ilustrar conceptos de control visuomotor, aprendizaje por imitación y modelos generativos aplicados a robots.
- Benchmarking de hardware: útil para evaluar el rendimiento del robot `so_follower` y de las cámaras configuradas en el pipeline de LeRobot.
- Prototipado de aplicaciones de manipulación: el modelo puede integrarse en un pipeline de LeRobot para pruebas rápidas de tareas de manipulación en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendada: no disponible.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño de 89 millones de parámetros, pero no está confirmado ni documentado.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` con el robot `so_follower` y las cámaras configuradas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con datos de rendimiento en la información proporcionada. La política es específica para el robot `so_follower` y la tarea de pick-and-place; otros modelos de LeRobot podrían ser comparables, pero no se dispone de métricas de evaluación para establecer una comparativa.

## Limitaciones y advertencias

- Sesgos conocidos: no evaluados.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto.
- Limitaciones de contexto: no es un modelo de lenguaje; su "contexto" se limita a las observaciones de estado y las imágenes en el momento de la inferencia.
- Entrenado solo para una tarea específica: puede fallar ante variaciones de iluminación, posición de objetos o distracciones no presentes en el dataset de entrenamiento.
- Dependencia del entorno: requiere la librería LeRobot y el robot `so_follower`; no es directamente ejecutable en otros robots sin adaptación.
- Sin evaluación publicada: el rendimiento real en el robot es desconocido, por lo que no se recomienda su uso en producción sin validación previa.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no ha sido validado en escenarios de producción.

## Enlaces

- HuggingFace: https://huggingface.co/Ricky97/SO101_pick_dice_in_bowl_small_image_size
- Dataset de entrenamiento: https://huggingface.co/datasets/Ricky97/SO101_pick_dice_in_bowl
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
