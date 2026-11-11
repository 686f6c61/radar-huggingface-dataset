# Muhammad241198/act_dsub_120

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. Este repositorio concreto, `Muhammad241198/act_dsub_120`, es una política ACT entrenada con LeRobot sobre el dataset `rbtrprjkt/DSUB-installnew2026_20261026_033023` y publicada en Hugging Face con licencia Apache 2.0. Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

El modelo resuelve el problema de control robótico de manipulación a partir de demostraciones teleoperadas: en lugar de predecir una acción por paso de control, genera un chunk de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad en tareas de precisión. Es relevante para quienes trabajan con brazos robóticos de bajo coste (tipo SO-100/SO-101) y quieren replicar o adaptar políticas de imitación sin partir de cero.

La arquitectura es un transformer con codificador visual y decodificador de acciones, con 51.705.479 parámetros totales (unos 51,7 M) y un tamaño de repositorio de 0,2 GB en formato safetensors. No se dispone de información sobre longitud de contexto, idiomas ni cuantizaciones, ya que no es un modelo de lenguaje sino una política de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.705.479 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformer. El modelo combina un codificador visual (procesa observaciones de cámara) con un decodificador que genera chunks de acciones de longitud fija, en lugar de predecir una única acción por paso. Esta estrategia de "action chunking" reduce el error compuesto y permite movimientos más suaves y coherentes. La técnica se describe en el paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot sobre el dataset `rbtrprjkt/DSUB-installnew2026_20261026_033023`, que corresponde a demostraciones teleoperadas. No se dispone de información sobre el número de episodios, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto de imitación). Tampoco se documentan innovaciones adicionales más allá del propio mecanismo de action chunking.

## Capacidades

- Control robótico de manipulación mediante aprendizaje por imitación.
- Predicción de chunks de acciones a partir de observaciones visuales.
- Ejecución de tareas aprendidas de demostraciones teleoperadas.
- Integración con el ecosistema LeRobot para entrenamiento y evaluación.
- Inferencia sobre robots tipo `so100_follower` (según el ejemplo de la model card).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Manipulación robótica de laboratorio: replicar tareas de pick-and-place entrenadas con demostraciones teleoperadas, usando el chunk de acciones para movimientos estables.
- Investigación en aprendizaje por imitación: servir como punto de partida para comparar variantes de ACT o ajustar hiperparámetros sobre el mismo dataset.
- Prototipado con brazos de bajo coste: desplegar sobre robots SO-100/SO-101 mediante `lerobot-record` para evaluar la política en entornos controlados.
- Automatización de tareas repetitivas de ensamblaje: el modelo puede ejecutar secuencias aprendidas de inserción o montaje si el dataset de entrenamiento cubre esas trayectorias.
- Evaluación comparativa de políticas: usar el checkpoint como baseline en experimentos de imitación frente a otros métodos (Diffusion Policy, VQ-BeT).
- Docencia y formación: ejemplo práctico de entrenamiento y despliegue de una política ACT con LeRobot en cursos de robótica o IA aplicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en fp32 (51,7 M de parámetros), aunque el consumo real depende del codificador visual y del tamaño de las imágenes de entrada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha documentado entrenamiento con `--policy.device=cuda`.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte para CUDA y CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_dsub_120 (este) | 51,7 M | no disponible | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| Diffusion Policy | no disponible | no disponible | no disponible | no disponible | no disponible |
| VQ-BeT | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo de investigación sin validación comunitaria: cero descargas y cero likes, sin evidencia de éxito en producción.
- Riesgo de sobreajuste al dataset específico `DSUB-installnew2026_20261026_033023`; la generalización a otras tareas o entornos no está demostrada.
- No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones; cualquier uso fuera de control robótico carece de sentido.
- Sesgos y alucinaciones: no aplicables en el sentido habitual, pero la política puede fallar silenciosamente ante distribuciones de entrada no vistas.
- Limitaciones de idioma: no aplica, al no tener capacidades lingüísticas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Para producción se requiere validación exhaustiva en el robot objetivo antes de cualquier despliegue real.

## Enlaces

- Hugging Face: https://huggingface.co/Muhammad241198/act_dsub_120
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
