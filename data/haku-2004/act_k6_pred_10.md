# Haku-2004/act_k6_pred_10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación de horizonte largo. Este checkpoint concreto, publicado por el usuario Haku-2004 bajo el identificador `act_k6_pred_10`, es una política entrenada con LeRobot sobre el dataset propio `Haku-2004/k6_4seg` y empaquetada en formato safetensors para su uso directo con la librería LeRobot.

El modelo resuelve el problema de control robótico imitando demostraciones teleoperadas: dado el estado de las articulaciones y las observaciones visuales de las cámaras, genera comandos de acción para el robot. Con 51.672.714 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware de consumo, lo que lo hace adecuado para prototipado e investigación en laboratorio.

Su relevancia es limitada al ámbito de la robótica de imitación: no es un modelo de lenguaje y no dispone de capacidades de generación de texto, razonamiento simbólico ni tool calling. La licencia Apache 2.0 y la integración nativa con LeRobot facilitan su reutilización y reproducción experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana temporal de observaciones definida por el dataset y la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice un chunk de acciones futuras en cada paso de inferencia, en lugar de una única acción. La arquitectura combina un codificador de imágenes (resnet o similar, según la implementación de LeRobot) con un transformer que fusiona las observaciones visuales y el estado propioceptivo del robot, y un decodificador que emite la secuencia de acciones. Esta predicción por chunks mitiga el problema de acumulación de errores en tareas de manipulación de varios pasos, una innovación descrita en el paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k6_4seg`, compuesto por demostraciones teleoperadas. No se dispone de información sobre el número de episodios, el número de tokens de entrenamiento (concepto no aplicable en este dominio), la composición exacta del dataset ni si se aplicaron técnicas de refinamiento posteriores como RLHF o DPO. El sufijo `pred_10` en el nombre del checkpoint sugiere, sin confirmación por parte del autor, una configuración de predicción de 10 pasos por chunk; este dato no está documentado en la model card.

## Capacidades

- Control robótico por imitación: genera comandos de acción a partir de observaciones visuales y del estado de las articulaciones.
- Predicción de chunks de acción: emite secuencias cortas de acciones, lo que mejora la estabilidad en tareas de manipulación de horizonte largo.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Compatibilidad con robots tipo SO-100 (el ejemplo de la model card usa `so100_follower`).
- No soporta tool calling ni function calling.
- No soporta agentes basados en lenguaje ni razonamiento multi-step simbólico.
- No tiene capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la percepción visual necesaria para el control.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo ejecuta tareas de pick-and-place imitando demostraciones teleoperadas, adecuado por su entrenamiento específico en el dataset `k6_4seg` y su integración directa con LeRobot.
- Prototipado rápido de políticas: con 51,7 M de parámetros y 0,2 GB de pesos, permite iterar sobre el pipeline de entrenamiento y evaluación en estaciones de trabajo con una sola GPU.
- Evaluación comparativa de métodos de imitación: sirve como referencia ACT frente a otras políticas de LeRobot (diffusion policy, VQ-BeT) sobre el mismo dataset.
- Reproducción de experimentos: la licencia Apache 2.0 y el formato safetensors facilitan la réplica y la auditoría de los resultados.
- Educación y formación: útil para demostrar el flujo completo de entrenamiento y despliegue de una política ACT en un robot de bajo coste tipo SO-100.
- Investigación en chunking de acciones: permite analizar el efecto del tamaño de chunk (posiblemente 10 pasos) en la tasa de éxito de tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en precisión completa (fp32) para 51,7 M de parámetros; aproximadamente 0,5-1 GB en fp16, sin contar el codificador visual ni los buffers de inferencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: sí, en modelos como GTX 1660, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de inferencia en CUDA o CPU.
- Latencia y throughput estimados: no disponibles; dependen del robot, la frecuencia de control y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACT (este checkpoint) | 51,7 M | no aplica | no disponible | apache-2.0 | Hugging Face (LeRobot) |
| Diffusion Policy | no disponible | no aplica | no disponible | no disponible | implementación en LeRobot |
| VQ-BeT | no disponible | no aplica | no disponible | no disponible | implementación en LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparativa se limita a la disponibilidad de implementaciones dentro del ecosistema LeRobot.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre el dataset `Haku-2004/k6_4seg`; su generalización a otras tareas, objetos o entornos no está documentada y probablemente sea limitada.
- No se han publicado métricas de tasa de éxito, por lo que no es posible evaluar su fiabilidad en producción.
- Riesgo de sobreajuste a las condiciones de iluminación, posiciones de cámara y configuración del robot presentes en las demostraciones.
- No apto para tareas que requieran razonamiento lingüístico, tool calling o interacción multimodal más allá de la percepción visual.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset subyacente impide verificar la procedencia y los derechos de las demostraciones originales.
- El nombre del checkpoint (`pred_10`) sugiere una configuración de predicción de 10 pasos, pero no está confirmado en la model card; verificar antes de asumir dicho parámetro.
- Sin garantías de soporte ni mantenimiento por parte del autor; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6_pred_10
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
- Paper ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
