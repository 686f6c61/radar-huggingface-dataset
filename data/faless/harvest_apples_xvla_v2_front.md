# Faless/harvest_apples_xvla_v2_front

## Resumen

`Faless/harvest_apples_xvla_v2_front` es una política robótica de tipo XVLA (visión-lenguaje-acción, VLA) publicada en HuggingFace Hub y entrenada con el framework LeRobot. El modelo resuelve la tarea concreta de recogida de manzanas (harvest apples) sobre un entorno simulado con el brazo robótico Agilex Piper, y se distribuye como un checkpoint de pesos `safetensors` de aproximadamente 879,7 millones de parámetros (3,5 GB de repositorio). La autoría corresponde al usuario Faless y la licencia es Apache 2.0.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje generalista, sino de una política de control motor entrenada para un dataset y un robot específicos (el dataset `Faless/harvest_apples_with_agilex_piper_sim`). Su interés radica en servir como ejemplo reproducible de un pipeline VLA completo en LeRobot: recogida de datos simulados, entrenamiento de política y despliegue de inferencia sobre un robot tipo `so100_follower` o equivalente.

La información pública disponible es escasa. La model card generada automáticamente por LeRobot no describe arquitectura interna, hiperparámetros, composición del dataset ni resultados de evaluación, y el propio autor no ha actualizado la plantilla ("Model type not recognized"). Por tanto, muchos de los campos de esta ficha se marcan como "no disponible" en lugar de inferirse.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XVLA (visión-lenguaje-acción); detalles internos no disponibles |
| Parametros totales | 879.738.545 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 3,5 GB) |

## Arquitectura y entrenamiento

El modelo se etiqueta como `xvla`, siguiendo la familia de políticas VLA integradas en LeRobot. Una política VLA combina un codificador visual, un componente de lenguaje y una cabeza de acción que emite comandos motores (típicamente acciones de efector final y articulaciones) condicionados por observaciones visuales y una instrucción en lenguaje natural. No obstante, la model card no especifica la arquitectura exacta (transformer, híbrida, número de capas, dimensión oculta ni tamaño del codificador visual), por lo que no es posible detallar la topología interna.

El entrenamiento se realizó sobre el dataset `Faless/harvest_apples_with_agilex_piper_sim`, un conjunto de demostraciones simuladas de recogida de manzanas con el robot Agilex Piper. No se documentan el número de episodios, el número de tokens o frames, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por imitación supervisada. El pipeline utilizado es el estándar de LeRobot (`lerobot-train`), y la plantilla de la model card sugiere el tipo de política `act`, aunque el nombre del modelo indica `xvla`; esta discrepancia no se aclara en la documentación.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones motoras a partir de observaciones visuales y del estado del robot.
- Condicionamiento por tarea: la política está especializada en la tarea de recogida de manzanas en simulación con Agilex Piper.
- Integración con LeRobot: compatible con las herramientas `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- Inferencia sobre robot físico o simulado: la model card muestra un ejemplo con `so100_follower`, aunque no se confirma compatibilidad real con ese hardware.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): visión como entrada (implícita en la naturaleza VLA), sin más detalles.

## Casos de uso

- Investigación en manipulación robótica simulada: usar el checkpoint como línea base para experimentos de recogida de objetos con Agilex Piper en entornos simulados, aprovechando que el dataset de entrenamiento es público.
- Reproducción de pipelines VLA en LeRobot: servir de ejemplo de extremo a extremo (dataset, entrenamiento, evaluación) para equipos que quieran replicar el flujo con sus propios datos.
- Evaluación comparativa de políticas de imitación: comparar el rendimiento de esta política XVLA frente a políticas ACT o Diffusion Policy sobre la misma tarea de recogida.
- Prototipado de automatización agrícola en simulación: probar estrategias de recogida de fruta antes de trasladarlas a un entorno real, reduciendo coste y riesgo.
- Docencia y formación en robótica: utilizar el modelo y su dataset como material didáctico para ilustrar el ciclo completo de una política VLA.
- Fine-tuning sobre nuevas tareas de recogida: reentrenar o adaptar el checkpoint a variantes de la tarea (otros objetos, posiciones o brazos) partiendo de los pesos publicados.
- Integración en banco de pruebas con `lerobot-record`: ejecutar episodios de evaluación de 10 pasos sobre un robot `so100_follower` para validar el comportamiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 879,7 M de parámetros, en FP16 se requieren aproximadamente 1,8 GB solo para pesos; en FP32, unos 3,5 GB. A ello hay que sumar memoria para el codificador visual, buffers de observación y activaciones.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU consumer con 8 GB o más debería ser suficiente para inferencia en FP16, aunque no hay confirmación.
- ¿Cabe en GPU consumer? Probablemente sí (RTX 3060 12 GB, RTX 4070, RTX 4090), pero no está verificado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Faless/harvest_apples_xvla_v2_front | 879,7 M | no disponible | Recogida de manzanas (sim, Agilex Piper) | Apache 2.0 | HuggingFace |
| Políticas ACT en LeRobot | no disponible | no disponible | Manipulación general por imitación | Apache 2.0 (LeRobot) | HuggingFace / repo LeRobot |
| Políticas Diffusion Policy | no disponible | no disponible | Manipulación por imitación | según implementación | Repos académicos |
| OpenVLA | ~7 B | no disponible | VLA generalista | según versión | HuggingFace |

La comparación es orientativa: no se dispone de datos de rendimiento de este checkpoint frente a las alternativas, y las políticas ACT y Diffusion Policy son familias, no modelos concretos con parámetros fijos. OpenVLA se incluye como referencia de VLA generalista de mayor tamaño, pero no es directamente comparable en tarea ni en datos de entrenamiento.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (recogida de manzanas) en un entorno simulado con Agilex Piper; no se espera generalización a otras tareas sin reentrenamiento.
- Brecha sim-a-real: no se documenta si el modelo se ha validado en un robot físico; el uso en producción real requeriría evaluación adicional.
- Documentación insuficiente: la model card es una plantilla sin rellenar, sin arquitectura, hiperparámetros ni métricas de éxito.
- Posible inconsistencia de tipo de política: la plantilla sugiere `--policy.type=act` mientras el nombre indica `xvla`; conviene verificar la configuración antes de reutilizarlo.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Sesgos: no documentados; al entrenarse en simulación, puede heredar sesgos del simulador y del dataset.
- Licencia Apache 2.0: permite uso comercial y modificación, pero sin garantías del autor; el uso en robótica real queda bajo responsabilidad del integrador.
- Sin datos de benchmarks ni de éxito de la tarea: no es posible afirmar su rendimiento real.

## Enlaces

- HuggingFace: https://huggingface.co/Faless/harvest_apples_xvla_v2_front
- Dataset de entrenamiento: https://huggingface.co/datasets/Faless/harvest_apples_with_agilex_piper_sim
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
