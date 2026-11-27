# briskVLA/student_8L_early

## Resumen

briskVLA/student_8L_early es un checkpoint de un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por el colectivo briskVLA. Se trata de un "student" destilado del modelo base lerobot/smolvla_libero, orientado a tareas de manipulación robótica en el benchmark LIBERO. Con 400,9 millones de parámetros, es una versión de profundidad reducida del experto de acción de SmolVLA, manteniendo solo 8 capas del experto (índices 0 a 7) con un layout canónico "early" y un ancho de FFN por defecto de 2048.

El modelo resuelve el problema de desplegar políticas VLA en entornos con recursos limitados: al recortar la profundidad del experto de acción se reduce el coste computacional y la latencia de inferencia, manteniendo (presumiblemente) gran parte del rendimiento del profesor gracias a un proceso de destilación. Es relevante para quienes investigan compresión de modelos VLA y quieren evaluar el compromiso entre profundidad, latencia y tasa de éxito en tareas robóticas.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card del autor. No se han publicado datos de benchmarks, licencia ni idiomas en la información proporcionada, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en SmolVLA (experto de acción con 8 capas, layout "early", FFN de 2048) |
| Parametros totales | 400.923.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo es un checkpoint "student" derivado de lerobot/smolvla_libero (commit a24f1f380461) mediante reducción de profundidad del experto de acción: conserva las capas [0, 1, 2, 3, 4, 5, 6, 7] (8L) con layout canónico "early" y ancho de FFN por defecto (2048). La arquitectura subyacente es SmolVLA, un modelo de visión-lenguaje-acción de la familia LeRobot orientado a control robótico; el checkpoint se distribuye con la librería lerobot y pesos en safetensors.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset de destilación ni si hubo RLHF/DPO. Sí documenta el flujo de trabajo previsto: evaluación en LIBERO con K=10 y K=1, medición de latencia mediante `latency.py`, y posibilidad de continuar la destilación o comprimir aún más (por ejemplo, de 8L a 4L) con `distill_student.py` y `build_student.py` (agrupación de capas cada 2, retención alterna y fusión de FFN). No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico de manipulación: genera acciones a partir de observaciones visuales e instrucciones de lenguaje, entrenado y evaluado sobre el benchmark LIBERO.
- Ejecución de políticas VLA en formato LeRobot, con evaluación nativa mediante `run_eval.sh` (K=10 y K=1).
- Medición de latencia de inferencia con la herramienta `latency.py` del proyecto.
- Destilación y compresión adicional: sirve como punto de partida para generar students de menor profundidad (p. ej. 4L) con `build_student.py`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos especiales (thinking, visión general, audio).

## Casos de uso

- Evaluación de compresión de políticas VLA: usar el checkpoint como student de referencia para medir la caída de tasa de éxito en LIBERO respecto al profesor smolvla_libero, con K=10 y K=1, y cuantificar el compromiso profundidad-rendimiento.
- Despliegue en hardware robótico de recursos limitados: al tener solo 8 capas de experto, reduce el coste de cómputo por paso de control, lo que lo hace candidato para robots con GPUs de gama baja o embebidas.
- Medición de latencia en pipelines de control: ejecutar `latency.py` para obtener curvas de latencia por paso y decidir si cumple los requisitos de frecuencia de control de una plataforma concreta.
- Punto de partida para destilación adicional: continuar el entrenamiento con `distill_student.py` para afinar el student sobre un dataset propio o comprimirlo a 4L con `build_student.py`.
- Investigación en destilación de modelos VLA: comparar estrategias de recorte de capas (layout "early" frente a otras disposiciones) y su efecto en tareas de manipulación de LIBERO.
- Reproducción de experimentos de robótica: integrar el checkpoint en el ecosistema LeRobot para replicar evaluaciones de LIBERO y comparar con el modelo profesor en igualdad de condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe los comandos de evaluación (`run_eval.sh` con K=10 y K=1, y `latency.py`), pero no incluye cifras de tasa de éxito ni de latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 400,9 M de parámetros, los pesos en precisión completa ocuparían aproximadamente 1,6 GB en FP32 o 0,8 GB en FP16/BF16 (cálculo orientativo a partir del tamaño del repo de 0,8 GB, no confirmado por el autor).
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de parámetros sería viable en GPUs de consumo, pero no hay datos oficiales de requisitos.
- Opciones de despliegue: librería lerobot (evaluación con `run_eval.sh` y `latency.py`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor proporciona un script para medirlos, pero no publica resultados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/student_8L_early | 400.923.616 | no disponible | no disponible | no disponible | Hugging Face (0 descargas, 0 likes) |
| lerobot/smolvla_libero (profesor) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otros students de briskVLA (p. ej. 4L) | no disponible | no disponible | no disponible | no disponible | Referenciados en la model card, sin datos |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del modelo; al ser un modelo de robótica entrenado sobre LIBERO, su comportamiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación: no evaluable con la información disponible; en políticas VLA el fallo se manifiesta como acciones incorrectas o inseguras, no como texto inventado.
- Limitaciones de contexto e idioma: no disponibles; no se documentan idiomas soportados ni longitud de contexto.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un caveat crítico para producción.
- Modelo con 0 descargas y 0 likes: sin validación externa ni reportes de la comunidad.
- Es un student de profundidad reducida (8L frente al profesor): se espera una pérdida de rendimiento respecto al profesor, aunque no se han publicado cifras.
- El uso está orientado a investigación y evaluación en LIBERO; no hay evidencia de robustez en entornos reales ni de seguridad en robots físicos.

## Enlaces

- Hugging Face: https://huggingface.co/briskVLA/student_8L_early
- Modelo base (profesor): https://huggingface.co/lerobot/smolvla_libero
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
