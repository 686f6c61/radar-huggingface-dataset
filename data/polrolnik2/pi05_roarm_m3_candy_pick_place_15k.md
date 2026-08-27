# polrolnik2/pi05_roarm_m3_candy_pick_place_15k

## Resumen

El modelo `polrolnik2/pi05_roarm_m3_candy_pick_place_15k` es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) de código abierto, adaptado para controlar un brazo robótico RoArm-M3 de Waveshare en tareas de pick and place de caramelos. Desarrollado por el usuario polrolnik2 sobre la base `lerobot/smolvla_base` y la librería LeRobot 0.6.2, este modelo convierte observaciones visuales de dos cámaras (frontal y de muñeca) en comandos de acción para el brazo, demostrando cómo un VLA general puede especializarse en un robot concreto con un dataset reducido.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y se distribuye en formato safetensors. Su relevancia radica en que ejemplifica el flujo de trabajo de fine-tuning de VLA para robótica de bajo coste, permitiendo a desarrolladores e investigadores adaptar modelos de manipulación a hardware específico sin necesidad de entrenar desde cero. La licencia Apache 2.0 facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action transformer) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible (modelo de accion, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción basado en una arquitectura transformer multimodal que procesa imágenes de cámaras y produce acciones de control para robots. En este caso, el modelo base `lerobot/smolvla_base` fue fine-tuneado con LeRobot 0.6.2 sobre el dataset `rtrtwrw/roarm_m3_candy_pick_place`, que contiene demostraciones de pick and place de caramelos con un brazo RoArm-M3. El entrenamiento se realizó durante 30.000 pasos con un batch size de 4, precisión bf16 y semilla 1000, guardando el checkpoint en el paso 15.000.

Una particularidad del fine-tuning es el mapeo de nombres de cámaras: el dataset utiliza `front` y `wrist`, mientras que SmolVLA espera `camera1` y `camera2`. El entrenamiento empleó una renombrado (`observation.images.front` a `observation.images.base_0_rgb` y `observation.images.wrist` a `observation.images.left_wrist_0_rgb`), que debe replicarse en inferencia. No se dispone de información sobre la composición exacta del dataset ni sobre técnicas de alineación adicionales como RLHF o DPO.

## Capacidades

- Control de brazo robótico: genera acciones de articulación para el RoArm-M3 a partir de observaciones visuales.
- Percepción multimodal: procesa dos flujos de cámara (frontal y de muñeca) simultáneamente.
- Tarea específica de pick and place: especializado en recoger y colocar objetos (caramelos) en posiciones definidas.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento y despliegue.
- Inferencia en tiempo real: diseñado para control en bucle cerrado con el robot.
- No incluye capacidades de lenguaje natural, tool calling ni agentes; es un modelo puramente de acción.

## Casos de uso

- Automatización de líneas de clasificación: el modelo puede controlar un RoArm-M3 para separar caramelos u objetos pequeños en una cinta transportadora, usando la cámara frontal para detectar la posición y la de muñeca para precisión en el agarre.
- Investigación en robótica manipulativa: sirve como punto de partida para estudiar la transferencia de VLA a hardware de bajo coste, permitiendo reproducir experimentos de pick and place con un brazo de 5+1 grados de libertad.
- Demostraciones educativas: en laboratorios universitarios, el modelo permite mostrar el ciclo completo de entrenamiento de un VLA (recogida de datos, fine-tuning, despliegue) con un robot asequible como el RoArm-M3.
- Prototipado rápido de tareas de manipulación: desarrolladores pueden adaptar el modelo a nuevas tareas similares (por ejemplo, cambiar el objeto o la posición) con un dataset pequeño, gracias al fine-tuning eficiente.
- Evaluación de robustez visual: al depender de dos cámaras, el modelo puede probarse bajo distintas condiciones de iluminación o fondo para medir su generalización.
- Benchmark de control de robots: puede utilizarse como referencia para comparar el rendimiento de otros VLA o métodos de control clásico en la misma tarea y hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de robótica (tasa de éxito en pick and place) en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 4,14 mil millones de parámetros en bf16, el modelo ocupa aproximadamente 8,3 GB en memoria (sin contar overhead). Una GPU con al menos 12 GB de VRAM sería necesaria para inferencia en bf16; con cuantización a 8 bits podría caber en 8 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: no especificadas. Por tamaño, una RTX 3090/4090 (24 GB) o una A10G (24 GB) serían adecuadas para inferencia cómoda. Para entrenamiento, se necesitaría al menos 24 GB o usar gradiente acumulado.
- Compatibilidad con GPU de consumo: sí, es plausible en GPUs de 16-24 GB, pero no hay confirmación oficial.
- Opciones de despliegue: LeRobot es la librería principal; también podría usarse con vLLM o TGI si se adapta el formato, aunque no está documentado. Para el robot, se requiere el SDK de RoArm-M3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLA fine-tuneados para RoArm-M3). Existen otros VLA como OpenVLA o RT-2, pero no hay datos de rendimiento ni configuración equivalente para comparar. Se indica "no disponible".

## Limitaciones y advertencias

- Especialización extrema: el modelo solo es útil para la tarea de pick and place de caramelos con el RoArm-M3; no generaliza a otros robots u objetos sin reentrenamiento.
- Dependencia del mapeo de cámaras: si no se aplica el renombrado correcto en inferencia, el modelo fallará.
- Sin datos de robustez: no se han evaluado sesgos, alucinaciones (en el sentido de acciones incorrectas) ni comportamiento ante condiciones adversas.
- Riesgo de sobreajuste: entrenado con un dataset de 15.000 pasos (según el nombre) y checkpoint en 15.000, podría memorizar las demostraciones y fallar ante variaciones.
- Licencia Apache 2.0: permite uso comercial, pero el hardware (RoArm-M3) y el dataset tienen sus propias condiciones.
- Sin soporte de lenguaje: no puede interpretar instrucciones en texto; las acciones se generan directamente desde las imágenes.
- Fecha de creación futura (2026-08-27): el modelo está registrado con una fecha posterior a la actual, lo que sugiere que puede ser un artefacto de prueba o un error de metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/polrolnik2/pi05_roarm_m3_candy_pick_place_15k
- Dataset de entrenamiento: https://huggingface.co/datasets/rtrtwrw/roarm_m3_candy_pick_place
- Wiki de RoArm-M3 (Waveshare): https://www.waveshare.com/wiki/RoArm-M3
- Página del producto RoArm-M3: https://www.waveshare.com/roarm-m3.htm
- Repositorio de referencia de RoArm-M3: https://github.com/EffectsMachine/roarm-m3
