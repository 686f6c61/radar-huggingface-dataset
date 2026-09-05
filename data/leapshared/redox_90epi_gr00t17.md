# leapshared/Redox_90epi_GR00T17

## Resumen

`leapshared/Redox_90epi_GR00T17` es una política de aprendizaje por imitación para robótica desarrollada por Leapshared y entrenada con el framework LeRobot de Hugging Face. El modelo se basa en el tipo de política `groot_frozen_bf16` y está especializado en la tarea de sumergir una placa metálica en un líquido azul cinco veces y devolverla al vaso de la izquierda, sobre un brazo robótico bimanual `bi_openarm_follower`. Dispone de 3.144.016.000 parámetros (aproximadamente 3,14 mil millones) almacenados en formato safetensors con precisión bf16, y su repositorio ocupa 90,0 GB.

El modelo resuelve un problema de control motor en robótica: transformar observaciones multimodales (estado del robot y tres feeds de cámara RGB a 480x640) en acciones de 16 dimensiones para el brazo. Es relevante porque ofrece una política entrenada de forma abierta (licencia Apache 2.0) lista para evaluar o continuar entrenando con LeRobot, en un contexto donde los modelos de imitación para manipulación siguen siendo escasos y difíciles de reproducir.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por imitación (tipo: `groot_frozen_bf16`) |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política se entrena mediante aprendizaje por imitación (behavior cloning) con LeRobot 0.6.1. El proceso de entrenamiento se realizó durante 40.000 pasos con un tamaño de lote de 16, optimizador AdamW fusionado y tasa de aprendizaje 0,0001, con semilla 42. El dataset de entrenamiento es `leapshared/Redox_100epi`, que contiene 90 episodios y 120.588 fotogramas a 30 FPS. La tarea para la que se entrenó es: "sumergir la placa metálica en el líquido azul cinco veces, y luego ponerla de nuevo en el vaso de la izquierda".

La arquitectura consume observaciones de estado de 16 dimensiones y tres imágenes RGB de 480x640 (cámara seguidora y dos cámaras de muñeca), y produce una acción de 16 dimensiones. El tipo de política `groot_frozen_bf16` sugiere que el modelo base se encuentra congelado en bf16, pero no se detallan más innovaciones técnicas ni la composición del dataset en la información disponible. No se especifica si se aplicó RLHF, DPO ni ningún otro método de alineación posterior.

## Capacidades

- Ejecutar la tarea robótica específica para la que fue entrenada: sumergir una placa metálica en un líquido azul cinco veces y devolverla al vaso izquierdo.
- Procesar entradas multimodales simultáneas: estado del robot (16 valores) y tres flujos de vídeo RGB de 480x640 a 30 FPS.
- Generar comandos de acción de 16 dimensiones para el brazo robótico `bi_openarm_follower`.
- Integrarse con LeRobot para inferencia mediante `lerobot-rollout` y para re-entrenamiento mediante `lerobot-train`.
- Ser ejecutada en bucle continuo (sin duración prefijada) o con una duración determinada por el usuario.
- No proporciona capacidades de lenguaje, generación de texto, tool calling, razonamiento simbólico ni soporte de agentes; es un modelo de política puramente de control.

## Casos de uso

- Automatización de ensayos de laboratorio: el modelo controla un brazo bimanual para sumergir placas metálicas en líquidos, una operación repetitiva y precisa. Esta tarea es adecuada para políticas de imitación porque requiere aprender el gesto exacto a partir de demostraciones, en lugar de programar trayectorias manualmente.

- Investigación en aprendizaje por imitación: sirve como referencia para estudiar cómo una política entrenada con 90 episodios generaliza dentro de una tarea concreta, y para comparar la estabilidad de la variante `groot_frozen_bf16` frente a otros tipos de política de LeRobot.

- Evaluación de controladores en brazos `bi_openarm_follower`: la política puede desplegarse para probar la repetitividad del hardware en un entorno controlado, midiendo cuántas veces se completa la tarea en sucesión.

- Recogida de datos y re-entrenamiento: puede utilizarse como modelo base para fine-tuning en una tarea similar, aprovechando que los pesos están en bf16 y son compatibles con el pipeline de LeRobot. Permite añadir nuevos episodios al dataset y re-entrenar sin partir de cero.

- Demo en ferias y exposiciones: dado que la tarea es visualmente clara y se ejecuta con un brazo bimanual, el modelo puede alimentar una demo de robótica educativa o de divulgación científica en tiempo real.

- Banco de pruebas para visión robótica: las tres cámaras (seguidora y dos muñecas) ofrecen un caso de estudio para evaluar cómo combina la política información de distintas vistas para decidir acciones, útil en cursos y proyectos de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que todavía no se han aportado resultados de evaluación: "No evaluation results have been provided for this policy yet." No existen métricas numéricas de tasa de éxito ni comparativas con otros modelos.

## Requisitos de hardware

- El repositorio del modelo ocupa 90,0 GB. Los pesos safetensors para 3.144.016.000 parámetros en bf16 ocupan aproximadamente 6,3 GB, pero el repositorio incluye además otros ficheros.
- La inferencia puede ejecutarse con el runtime de LeRobot en GPU. No se proporcionan cifras oficiales de VRAM; a partir del tamaño de los pesos (6,3 GB en bf16), una GPU con capacidad de al menos 8 GB sería razonable para la inferencia básica, aunque el requisito real depende del framework y las activaciones.
- No se especifican latencia ni throughput.
- Opciones de despliegue: `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento, integrados con LeRobot.

## Comparativa con modelos similares

No disponible. La información pública no incluye comparaciones con otros modelos de la misma categoría, y no se conocen alternativas comparables para esta tarea específica con el mismo tamaño y configuración de hardware.

## Limitaciones y advertencias

- El modelo ha sido entrenado con un único dataset de 90 episodios y 120.588 fotogramas, lo que limita su capacidad de generalización a variaciones de iluminación, posición de objetos o configuración de cámaras.
- No se han publicado resultados de evaluación en robot real; no existe tasa de éxito medida, por lo que no se puede afirmar que la tarea se complete de forma fiable.
- La política depende críticamente de las claves de observación exactas (`follower_d455f`, `left_wrist`, `right_wrist`). Cualquier cambio en la configuración de cámaras puede invalidar el modelo.
- Es un modelo de control, no un modelo de lenguaje: no tiene soporte de idiomas, generación de texto ni comprensión semántica; no debe esperarse que responda a instrucciones en lenguaje natural ni que razone de forma general.
- Los pesos están en bf16; si el hardware no soporta esta precisión, el modelo podría sufrir degradación de rendimiento o fallos de compatibilidad.
- La licencia Apache 2.0 permite uso comercial y modificación, pero es responsabilidad del usuario revisar las condiciones de la licencia y las citas requeridas (LeRobot).
- Existe riesgo de sesgo en el comportamiento si la recogida de demostraciones fue realizada por un solo operador en un entorno único; no se aportan análisis de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leapshared/Redox_90epi_GR00T17
- Dataset de entrenamiento: https://huggingface.co/datasets/leapshared/Redox_100epi
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=leapshared/Redox_100epi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil del autor en Hugging Face: https://huggingface.co/leapshared/models
