# neverlish/omx_act_record-apple-20261109-1

## Resumen

`neverlish/omx_act_record-apple-20261109-1` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el paper arXiv:2304.13705. El modelo lo ha desarrollado el usuario `neverlish` y se ha subido al Hub mediante la librería LeRobot de Hugging Face, el framework de referencia para aprendizaje por imitación en robótica. No es un modelo de lenguaje: es una política visomotora que traduce observaciones (imágenes de cámara y estado del robot) en secuencias cortas de acciones de control.

La arquitectura ACT se basa en un transformer con codificador visual y un decodificador que predice *chunks* de acciones en lugar de pasos individuales, lo que reduce la acumulación de error y mejora la estabilidad del control. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras que pueden ejecutarse en tiempo real en hardware modesto.

Su relevancia es acotada y práctica: se trata de un artefacto entrenado sobre un dataset concreto (`neverlish/record-apple-20261109-1`), presumiblemente una tarea de recogida de manzanas teleoperada. No tiene descargas ni likes en el momento de redactar esta ficha, y no se han publicado resultados de evaluación. Es útil como ejemplo reproducible de entrenamiento ACT con LeRobot y como punto de partida para quien quiera replicar el pipeline en un robot SO-100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visomotora con ventana de observación fija) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone visual (codificador de imágenes) con un transformer encoder-decoder que genera *chunks* de acciones de longitud fija. La innovación principal del paper original es la predicción de secuencias cortas de acciones en lugar de acciones individuales, lo que mitiga el problema de la acumulación de error en tareas de manipulación de horizonte largo y permite un control más suave. El modelo incorpora también una técnica de *temporal ensembling* durante la inferencia para promediar predicciones solapadas.

Los detalles concretos de entrenamiento de esta instancia no están disponibles en la información proporcionada: no se especifica el número de episodios, el número de tokens o frames, la composición del dataset, ni si se aplicaron técnicas de aumento de datos. El dataset asociado es `neverlish/record-apple-20261109-1`, que por el nombre sugiere una tarea de recogida de manzanas grabada por teleoperación el 9 de noviembre de 2026. El entrenamiento se ha realizado con LeRobot, que por defecto aplica el pipeline estándar de ACT descrito en el paper.

## Capacidades

- Control robótico visomotor: predice *chunks* de acciones a partir de observaciones de cámara y estado de las articulaciones.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de datos teleoperados, sin necesidad de recompensas explícitas.
- Manipulación de objetos: la tarea asociada (recogida de manzanas) sugiere agarre y traslado de objetos.
- Ejecución en tiempo real: el tamaño reducido (51,7 M de parámetros) permite inferencia de baja latencia en GPU de consumo.
- Integración con LeRobot: compatible con los comandos `lerobot-train` y `lerobot-record` para reentrenamiento y evaluación.
- No soporta tool calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Replicación de experiments de ACT: sirve como checkpoint de referencia para comparar el pipeline de LeRobot con el paper original en una tarea de manipulación concreta.
- Recogida automatizada de frutas: el modelo puede desplegarse en un brazo robótico SO-100 para ejecutar la tarea de recogida de manzanas aprendida del dataset, siempre que el entorno físico coincida con el de entrenamiento.
- Base para *fine-tuning*: al estar en formato LeRobot y con licencia Apache 2.0, puede reentrenarse con nuevos datasets de teleoperación para adaptar la política a otras frutas u objetos.
- Docencia y formación en robótica: ejemplo completo y ligero (0,2 GB) para enseñar el flujo completo de aprendizaje por imitación, desde la grabación hasta la evaluación.
- Evaluación de robustez: útil para estudiar cómo se degrada una política ACT ante cambios de iluminación, posición de cámara o variaciones del objeto.
- Prototipado rápido en laboratorio: al caber en GPU de consumo, permite iterar sobre la política sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones con otras políticas. El autor no ha documentado el número de episodios de evaluación ni las condiciones del entorno de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 dado el tamaño de 51,7 M de parámetros; en la práctica, el cuello de botella es el codificador visual y el tamaño del *batch* de observaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha validado el flujo con `--policy.device=cuda`, por lo que se asume compatibilidad con RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de NVIDIA con soporte CUDA; también es viable en CPU para evaluación no interactiva, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. La latencia vendrá determinada por la frecuencia de control del robot y el coste del codificador visual, no por el decodificador de acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neverlish/omx_act_record-apple-20261109-1 | 51,7 M | no aplica | Recogida de manzanas (ACT) | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot | ~50 M (típico) | no aplica | Manipulación genérica | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy (paper) | variable | no aplica | Manipulación visomotora | MIT (código) | Repositorio oficial |
| RT-1 / RT-2 (Google) | no disponible | no aplica | Manipulación a gran escala | no disponible | No público en su mayoría |

No se dispone de datos de rendimiento comparativo para esta instancia concreta. La comparación se limita a categoría, tamaño y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con un dataset propio y reducido, la política heredará los sesgos de las demostraciones (posiciones, iluminación, objetos concretos).
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni mantiene conversaciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en entornos distintos al de entrenamiento.
- Caveat para producción: no hay métricas de éxito publicadas, ni número de episodios de evaluación, ni descripción del entorno físico. Desplegarlo en un robot real sin validación previa es arriesgado.
- El nombre del repositorio incluye una fecha futura (20261109), lo que sugiere un artefacto de prueba o un error de nomenclatura; conviene verificar la integridad del checkpoint antes de usarlo.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/neverlish/omx_act_record-apple-20261109-1
- Dataset asociado: https://huggingface.co/datasets/neverlish/record-apple-20261109-1
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
