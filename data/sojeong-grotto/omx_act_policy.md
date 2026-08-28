# sojeong-grotto/omx_act_policy

## Resumen

El modelo `sojeong-grotto/omx_act_policy` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido entrenado y publicado mediante la librería LeRobot de Hugging Face, utilizando el dataset `sojeong-grotto/record-pick-can-test`, orientado a tareas de manipulación fina como recoger una lata. El modelo está diseñado para ser usado en robots físicos, típicamente con un brazo tipo SO-100, y su tamaño compacto (51,7 millones de parámetros) lo hace adecuado para entornos con recursos limitados.

La relevancia de este modelo radica en su simplicidad y eficiencia: ACT es el primer modelo recomendado por LeRobot para iniciarse en aprendizaje por imitación debido a su rápido entrenamiento, bajos requisitos computacionales y buen rendimiento en tareas de manipulación. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. Aunque el repositorio no incluye información detallada sobre arquitectura interna ni benchmarks, el hecho de estar basado en ACT implica un transformer con codificador y decodificador, entrenado con demostraciones teleoperadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer con codificador y decodificador |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers diseñada para aprendizaje por imitación. El modelo recibe observaciones (imágenes y estado del robot) y predice un "chunk" de acciones futuras (por ejemplo, 50 pasos) en lugar de una sola acción, lo que mejora la estabilidad y el éxito en tareas de manipulación. El entrenamiento se realiza mediante comportamiento clonado sobre demostraciones teleoperadas, sin necesidad de refuerzo. En este caso, el modelo se entrenó con LeRobot, que utiliza una variante de ACT con un codificador de visión (ResNet) y un decodificador autoregresivo. No se dispone de información sobre el número de tokens de entrenamiento, composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de acciones para control de robots: predice secuencias de posiciones de articulaciones o comandos de movimiento.
- Manipulación fina: adecuado para tareas como recoger objetos, apilar, insertar piezas, etc.
- Aprendizaje por imitación: puede aprender de demostraciones humanas teleoperadas.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo entrenamiento y evaluación mediante CLI.
- No soporta lenguaje natural, visión general ni tool calling, al ser un modelo puramente motor.

## Casos de uso

- Automatización de tareas repetitivas en laboratorio: el modelo puede controlar un brazo robótico para recoger y colocar objetos (por ejemplo, latas) en entornos de investigación, reduciendo la intervención humana.
- Prototipado rápido de políticas robóticas: gracias a su bajo coste de entrenamiento, es ideal para validar conceptos de manipulación antes de escalar a modelos más complejos.
- Educación en robótica: estudiantes pueden entrenar y evaluar este modelo en plataformas como LeRobot para comprender los fundamentos del aprendizaje por imitación.
- Integración en sistemas de fabricación ligera: para tareas de pick-and-place con precisión moderada, el modelo puede desplegarse en brazos de bajo coste como SO-100.
- Investigación en generalización de políticas: al ser pequeño y fácil de reentrenar, sirve como base para experimentos sobre transferencia entre entornos o variaciones de objetos.
- Benchmarking de hardware robótico: permite medir el rendimiento de diferentes controladores y GPUs en tareas de inferencia en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje. Tampoco hay datos de tasas de éxito en tareas robóticas específicas.

## Requisitos de hardware

- VRAM estimada: con 51,7 millones de parámetros, el modelo en precisión FP32 ocupa aproximadamente 207 MB. Con cuantizaciones típicas (FP16, INT8) podría reducirse a ~100 MB o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; una NVIDIA GTX 1050 Ti o superior sería adecuada. Para entrenamiento, se recomienda al menos 4 GB (p. ej., RTX 3050).
- Compatibilidad con GPUs de consumo: sí, cabe en la mayoría de GPUs de consumo actuales (RTX 20, 30, 40 series, etc.).
- Opciones de despliegue: LeRobot ofrece scripts de inferencia y evaluación; también puede ejecutarse con PyTorch estándar. No hay soporte oficial para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño se espera inferencia en tiempo real (típicamente <10 ms por predicción en GPU moderna).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sojeong-grotto/omx_act_policy | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face |
| kimy0420/omx_act_policy | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| asd0821-omx_act_policy | no disponible | no disponible | no disponible | no disponible | GitHub/Hugging Face |

No se dispone de información suficiente sobre los modelos alternativos para realizar una comparación detallada. Todos parecen ser variantes de ACT entrenadas con LeRobot, pero sin datos públicos de rendimiento.

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado con un dataset específico (recoger una lata), puede no generalizar a otras tareas u objetos sin reentrenamiento.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede generar acciones erróneas si las observaciones difieren de las del entrenamiento.
- Limitaciones de contexto: la ventana de observación está limitada a las imágenes y estados que recibe en cada paso; no hay memoria a largo plazo más allá del chunk de acciones.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y no usar marcas registradas.
- Caveat para producción: requiere un robot físico y un entorno controlado; la seguridad en entornos reales debe validarse exhaustivamente antes del despliegue.
- Idiomas: no aplica, al ser un modelo de control motor.

## Enlaces

- Hugging Face: https://huggingface.co/sojeong-grotto/omx_act_policy
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Documentación de ACT en LeRobot: https://huggingface.co/docs/lerobot/act
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
