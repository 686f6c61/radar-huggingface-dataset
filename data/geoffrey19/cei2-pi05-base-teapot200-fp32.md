# Geoffrey19/cei2-pi05-base-teapot200-fp32

## Resumen

cei2-pi05-base-teapot200-fp32 es una política robótica de imitación derivada de pi05 (openpi, Physical Intelligence), ajustada por fine-tuning completo sobre 200 demostraciones de teleoperación reales para la tarea de verter té desde una tetera. El autor es Geoffrey19 y el modelo se publica bajo licencia Apache 2.0. No es un modelo de lenguaje: es una política visuomotora que mapea una imagen RGB, 18 posiciones articulares medidas y una instrucción textual a 16 pasos de consignas articulares absolutas a 15 Hz.

El modelo parte de los pesos de `pi05_base` (no de un checkpoint de mid-training CEI) y se entrena con el objetivo de flow matching propio de pi05. Cuenta con 3.616.757.520 parámetros almacenados en float32 (812 tensores), lo que explica un repositorio de 14,5 GB. El contexto no es una ventana de tokens: la condicionación es una única imagen de 640×480, un vector de estado de 18 dimensiones y un prompt fijo de tarea.

Su relevancia es acotada y muy específica: sirve como referencia reproducible de un pipeline openpi completo (configuración, normalización por cuantiles, orden articular y metadatos de entrenamiento) sobre un robot UR7e con mano XHand de 12 articulaciones. No se han publicado evaluaciones en robot real ni en conjunto reservado, por lo que debe tratarse como un artefacto de investigación, no como un controlador validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (openpi, Physical Intelligence); política visuomotora con flow matching, no disponible el detalle interno de capas |
| Parametros totales | 3.616.757.520 (812 tensores) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no aplica como ventana de tokens; condicionada por 1 imagen 640×480, estado de 18 dimensiones y prompt de tarea |
| Tipos de cuantizacion | no disponible; pesos publicados en float32 |
| Idiomas soportados | no disponible (el prompt de tarea está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `metadata.pt`, `norm_stats.json`, `joint_order.json`, `train_config.json` y `openpi_cei2_configs.py` |

## Arquitectura y entrenamiento

La política se construye sobre pi05 de openpi y se entrena con flow matching para predecir chunks de 16 acciones de 18 dimensiones (consignas articulares absolutas). La entrada es una única cámara RGB exterior de 640×480, un vector de estado de 18 posiciones articulares en radianes y un prompt textual fijo. La normalización usa cuantiles calculados sobre las 200 epopeyas de entrenamiento, con q01/q99 mapeados a −1/+1 en `assets/teapot200/norm_stats.json`; el autor advierte explícitamente de que no deben recalcularse sobre otros datos.

Los datos son 200 epopeyas teleoperadas reales sobre UR7e (6 articulaciones) y XHand (12 articulaciones), con 43.115 fotogramas a 15 Hz y entre 51 y 743 fotogramas por epopeya (14,4 s de media). Se usaron las 200 epopeyas para entrenamiento, sin partición reservada. El entrenamiento fue de 20.000 pasos con batch 32 en una sola GPU, learning rate pico de 2e-5 tras 500 pasos de warmup con decaimiento coseno hasta 1e-6, pesos maestros y estado del optimizador en float32 con autocast en bfloat16 y sin EMA. La pérdida media de flow matching bajó de 0,1118 (pasos 0–100) a 0,0025 (pasos 19.000–20.000); el autor subraya que son ajustes a las epopeyas de entrenamiento, no medidas de calidad de la política.

## Capacidades

- Generación de consignas articulares: produce `(16, 18)` objetivos absolutos de articulación a 15 Hz a partir de una imagen y del estado medido.
- Control visuomotor de brazo UR7e de 6 articulaciones más mano XHand de 12 articulaciones, con orden articular documentado y sin reordenación en el lado del robot.
- Condicionamiento por prompt de tarea: acepta una instrucción textual, aunque entrenado con un único prompt ("Pick up the teapot from the tabletop and pour tea into the teacup.").
- Ejecución de una habilidad concreta de manipulación: agarre de tetera y vertido en taza.
- Integración con el ecosistema openpi y LeRobot mediante la configuración `cei2_pi05_teapot200_absq`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni multilingüismo.

## Casos de uso

- Reproducción de un pipeline openpi completo: sirve para validar la cadena de configuración, normalización y carga de política en una instalación openpi en el commit `215abfb`, incluyendo el parche `transformers_replace`.
- Referencia de fine-tuning sobre pi05_base: permite comparar el efecto de partir de `pi05_base` frente a partir del mid-training CEI, ya que el autor publica ambos runs con la misma receta y curvas de pérdida.
- Benchmark interno de políticas de imitación: al existir un GR00T N1.7 entrenado con los mismos datos y 40.000 pasos, se puede usar como punto de comparación controlado por datos y tarea.
- Prototipado de vertido de líquidos en laboratorio: útil para estudiar la dinámica de una tarea de contacto con objeto deformable en un UR7e con mano multiarticulada, siempre con supervisión y sin asumir éxito.
- Validación de retargeting de mano: el modelo consume las 12 articulaciones de la XHand en el orden del modelo de robot `ur7e_xhand`, por lo que sirve para comprobar la coherencia del retargeting y de los límites articulares.
- Docencia e investigación en imitación: el repositorio incluye `joint_order.json`, `train_config.json` y `metadata.pt`, lo que facilita auditar decisiones de normalización y de representación de acciones (absolutas frente a delta).
- Base para comparaciones de representación de acciones: al usar consignas absolutas en lugar de la siguiente posición medida, es un caso de estudio sobre el desfase de 1,5° de media entre comando y medición en la mano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que no hay partición reservada, que no se evaluó el éxito de la tarea (`task_outcome: not_assessed`) y que no hay resultados en robot real. Solo se reporta la pérdida de entrenamiento:

| Pasos | pi05 desde base | pi05 desde CEI |
|---|---|---|
| 0–100 | 0,1118 | 0,1009 |
| 4.900–5.000 | 0,0083 | 0,0070 |
| 9.900–10.000 | 0,0056 | 0,0048 |
| 14.900–15.000 | 0,0033 | 0,0029 |
| 19.000–20.000 | 0,0025 | 0,0022 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 14,5 GB; se necesita margen adicional para activaciones y para el estado de flow matching (10 pasos por defecto), por lo que una GPU de 24 GB es el mínimo práctico razonable.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y para servir con holgura; RTX 4090 (24 GB) para inferencia en float32, con riesgo de quedarse justo según el runtime.
- Cabe en GPU de consumo: sí, en RTX 4090 o superiores de 24 GB; en GPUs de 16 GB no cabe en float32 sin cuantización, y no se documentan pesos cuantizados.
- Opciones de despliegue: openpi en el commit `215abfb` con el parche `transformers_replace`, usando `policy_config.create_trained_policy` y la configuración `cei2_pi05_teapot200_absq`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El bucle de control opera a 15 Hz con chunks de 16 acciones y 10 pasos de flow matching por inferencia, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cei2-pi05-base-teapot200-fp32 | 3,62 B (float32) | 1 imagen 640×480 + estado 18-D + prompt | 20.000 pasos, batch 32, desde pi05_base | Apache 2.0 | Hugging Face, repo de 14,5 GB |
| cei2-pi05-ur7e-xhand-112h-teapot200-fp32 | no disponible | misma tarea y datos | misma receta, desde mid-training CEI | Apache 2.0 | Hugging Face |
| cei2-groot-n17-base-teapot200-40k | no disponible | misma tarea y datos | GR00T N1.7, 40.000 pasos, desde base | no disponible | Hugging Face |
| cei2-groot-n17-ur7e-xhand-112h-teapot200-40k | no disponible | misma tarea y datos | GR00T N1.7, 40.000 pasos, desde CEI | no disponible | Hugging Face |

La comparación relevante es de receta, no de rendimiento: los cuatro modelos comparten datos y tarea, pero no hay métricas de éxito publicadas para ninguno en la información disponible.

## Limitaciones y advertencias

- Sin partición reservada: las 200 epopeyas se usaron para entrenamiento, por lo que no existe evaluación de generalización.
- Sin resultados en robot real y con `task_outcome: not_assessed`: no hay evidencia de que la tarea de vertido se complete con éxito.
- La pérdida reportada es un ajuste a las epopeyas de entrenamiento y no una medida de calidad de la política; el propio autor lo advierte.
- Fuerte acoplamiento al hardware: solo válido para UR7e con XHand en el orden articular documentado; cualquier cambio de robot, cámara o montaje invalida la política.
- Normalización obligatoria: usar `assets/teapot200/norm_stats.json` a través de la configuración `cei2_pi05_teapot200_absq`; recalcular estadísticas sobre otros datos rompe el modelo.
- Dependencia de una versión concreta de openpi (commit `215abfb`) y de un parche de `transformers_replace`; la configuración debe registrarse manualmente.
- El estado del optimizador (26 GB) no se incluye, lo que impide reanudar el entrenamiento tal cual.
- Una sola cámara exterior y una única instrucción de tarea: no hay evidencia de robustez ante cambios de iluminación, oclusiones o prompts distintos.
- Riesgo de alucinación en el sentido de generar consignas articulares plausibles pero incorrectas fuera de la distribución de entrenamiento; no hay mecanismo de verificación interno.
- Sesgos conocidos: no disponibles; no se documenta análisis de sesgo demográfico, de iluminación ni de materiales.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación hace desaconsejable su despliegue en producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-pi05-base-teapot200-fp32
- Run equivalente desde mid-training CEI: https://huggingface.co/Geoffrey19/cei2-pi05-ur7e-xhand-112h-teapot200-fp32
- GR00T N1.7 desde base, mismos datos: https://huggingface.co/Geoffrey19/cei2-groot-n17-base-teapot200-40k
- GR00T N1.7 desde CEI, mismos datos: https://huggingface.co/Geoffrey19/cei2-groot-n17-ur7e-xhand-112h-teapot200-40k
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
