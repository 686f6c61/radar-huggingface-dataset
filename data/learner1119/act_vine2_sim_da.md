# learner1119/act_vine2_sim_da

## Resumen

El modelo `learner1119/act_vine2_sim_da` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario learner1119 (doyoung kim) y publicada en Hugging Face. ACT es un algoritmo de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación. Este modelo concreto ha sido entrenado con la librería LeRobot sobre un dataset de simulación denominado `VINE2_sim_420_da`, y está pensado para ser evaluado o utilizado como punto de partida en entornos simulados.

Con aproximadamente 51,6 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto. Su arquitectura se basa en transformers, aunque no se especifican detalles adicionales como el número de capas o la longitud de contexto. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas. Este modelo es relevante como ejemplo práctico de entrenamiento de políticas robóticas con LeRobot y como referencia para quienes trabajan con el dataset VINE2 en simulación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.590.792 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, descrita en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT utiliza un transformer codificador-decodificador que procesa observaciones (imágenes y estados del robot) y genera un chunk de acciones futuras, lo que reduce la acumulación de errores frente a políticas que predicen un solo paso. El entrenamiento se realizó con la librería LeRobot, que proporciona un pipeline completo de registro de datos, entrenamiento y evaluación. El dataset empleado es `VINE2_sim_420_da`, un conjunto de demostraciones teleoperadas en simulación, aunque no se han publicado detalles sobre el número de episodios, la composición exacta de las observaciones ni si se aplicaron técnicas como RLHF o DPO (no aplicables en este contexto). No se dispone de información sobre innovaciones técnicas adicionales más allá de las propias de ACT.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones (chunks) a partir de observaciones visuales y de estado.
- Aprendizaje a partir de demostraciones teleoperadas, lo que permite transferir habilidades humanas al robot.
- Ejecución en entornos simulados, específicamente diseñado para el dataset VINE2.
- Integración con el ecosistema LeRobot: puede cargarse y evaluarse con las herramientas estándar de LeRobot (`lerobot-record`, `lerobot-train`).
- No soporta tareas de lenguaje natural, visión general ni tool calling; su ámbito es exclusivamente robótico.

## Casos de uso

- Evaluación de políticas en simulación: el modelo puede cargarse con LeRobot y ejecutarse en un entorno simulado VINE2 para medir tasas de éxito y robustez antes de cualquier despliegue físico.
- Investigación en aprendizaje por imitación: sirve como baseline para comparar variantes de ACT o algoritmos alternativos (p. ej., Diffusion Policy) sobre el mismo dataset.
- Prototipado de control robótico: desarrolladores pueden usar este modelo como punto de partida para fine-tuning con nuevos datos de demostración en simulación.
- Validación de pipelines de entrenamiento: al ser un modelo pequeño y rápido de entrenar, es útil para verificar que la infraestructura de LeRobot funciona correctamente antes de lanzar entrenamientos más grandes.
- Estudio de transferencia sim2real: aunque no se ha validado en el mundo real, el modelo puede servir para experimentar con técnicas de domain adaptation o randomization.
- Formación y docencia: en cursos de robótica, este modelo permite ilustrar el flujo completo de entrenamiento y evaluación de una política neuronal sin necesidad de hardware costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como tasas de éxito, precisión de acciones ni comparaciones con otros modelos en el dataset VINE2.

## Requisitos de hardware

- VRAM estimada: con 51,6 millones de parámetros, el modelo ocupa aproximadamente 200 MB en fp32 (51.590.792 × 4 bytes). En la práctica, con safetensors y cargas en fp16, el uso de VRAM es inferior a 1 GB, por lo que cabe en cualquier GPU moderna, incluidas las de gama de entrada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1650, RTX 2060, RTX 3060, o incluso integradas con soporte CUDA.
- Despliegue: al ser un modelo de LeRobot, se ejecuta mediante el framework de LeRobot (PyTorch). No es compatible directamente con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño reducido, se espera una inferencia en tiempo real en GPU consumer, pero depende del entorno de simulación y de la resolución de las observaciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo dataset o con la misma configuración. Existen otros modelos ACT entrenados con LeRobot en Hugging Face, pero no se han encontrado datos públicos que permitan una comparación cuantitativa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (VINE2), por lo que su comportamiento en robots físicos no está garantizado y puede requerir transferencia sim2real.
- El dataset `VINE2_sim_420_da` es específico y puede no generalizar a otras tareas o entornos.
- No se han documentado sesgos, pero al ser un modelo de control robótico, los riesgos de alucinación o sesgo lingüístico no aplican.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No se especifican detalles sobre la longitud de contexto ni el tamaño de los chunks de acción, lo que limita el ajuste fino en tareas con requisitos temporales distintos.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/learner1119/act_vine2_sim_da
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
