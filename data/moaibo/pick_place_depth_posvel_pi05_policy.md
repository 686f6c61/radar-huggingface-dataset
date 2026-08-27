# MoAIBo/pick_place_depth_posvel_pi05_policy

## Resumen

Este modelo es una política de control robótico basada en π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, fine-tuneado por el usuario MoAIBo para tareas de pick-and-place con un robot móvil de tipo SO-101 TB4. El modelo parte del checkpoint base `lerobot/pi05_base` y se ha entrenado con el framework LeRobot sobre un dataset propio de 68 episodios que incluye imágenes de cinco cámaras (izquierda, derecha, muñeca, D455 y profundidad) junto con el estado del robot.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de un VLA de última generación para una tarea concreta de manipulación, utilizando herramientas open source como LeRobot. Con 4.143 millones de parámetros, el modelo es capaz de procesar entradas multimodales (visión y estado) y generar acciones de control de 8 dimensiones para ejecutar tareas de recoger y colocar objetos con generalización a entornos no vistos durante el entrenamiento, una capacidad clave de la arquitectura π₀.₅.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀.₅ (Vision-Language-Action, basada en transformer con co-entrenamiento heterogéneo) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en inglés en el dataset) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (a través de LeRobot) |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, una evolución de π₀ que incorpora co-entrenamiento sobre datos heterogéneos de manipulación, navegación y otras tareas para lograr generalización a entornos y situaciones no vistas durante el entrenamiento. La arquitectura combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones, procesando simultáneamente imágenes de múltiples cámaras, el estado del robot y una instrucción textual para producir acciones de control continuas.

El fine-tuning se realizó con LeRobot versión 0.6.0 sobre el dataset `MoAIBo/so101_tb4_pick_place_depth_posvel`, que contiene 68 episodios y 90.743 frames a 30 FPS. La configuración de entrenamiento incluyó 25.000 pasos, batch size de 16, optimizador AdamW con learning rate de 2,5e-5 y semilla 1000. El modelo se entrenó para dos tareas específicas: recoger un objeto azul o amarillo de una caja marrón, colocarlo en un plato blanco y volver al dock. No se menciona el uso de RLHF o DPO; el entrenamiento es de imitación supervisada.

## Capacidades

- Control robótico end-to-end: genera acciones de 8 dimensiones a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente cinco flujos de imagen (cuatro cámaras RGB y un canal de profundidad) a resolución 360x640.
- Generalización a entornos nuevos: gracias a la arquitectura π₀.₅, puede adaptarse a situaciones no vistas durante el entrenamiento.
- Ejecución de tareas de manipulación: pick-and-place, desacoplar y volver a la base, con instrucciones en lenguaje natural.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de Hugging Face para robótica.
- No soporta tool calling ni razonamiento multi-paso en el sentido de agentes de lenguaje; su salida es directamente el vector de acción.

## Casos de uso

- Automatización de líneas de montaje: el modelo puede controlar un brazo robótico para recoger componentes de una caja y colocarlos en una posición determinada, reduciendo la intervención humana en tareas repetitivas.
- Logística de almacén: con el robot SO-101 TB4, puede ejecutar tareas de recogida y colocación de objetos en estaciones de trabajo, integrando percepción de profundidad para manejar variaciones de posición.
- Investigación en robótica: sirve como punto de partida para experimentos de fine-tuning con nuevos datasets o tareas, gracias a su licencia Apache-2.0 y su integración con LeRobot.
- Demostraciones de VLA en entornos educativos: permite a estudiantes y desarrolladores explorar el flujo completo de entrenamiento y despliegue de un modelo visión-lenguaje-acción con hardware accesible.
- Prototipado rápido de tareas de manipulación: al estar pre-entrenado en una tarea concreta, puede adaptarse con pocos datos a variantes similares (cambiar el color del objeto, la posición del plato, etc.).
- Benchmarking de políticas robóticas: el modelo puede utilizarse como referencia para comparar el rendimiento de otras arquitecturas o estrategias de entrenamiento en tareas de pick-and-place.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. No se dispone de métricas como tasa de éxito, MMLU, HumanEval o GSM8K, ya que se trata de un modelo de control robótico y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 4.143 millones de parámetros en precisión FP32, el modelo ocuparía aproximadamente 16,5 GB solo en pesos; con cuantización a FP16 o int8 podría reducirse a 8-9 GB, pero no se han publicado configuraciones de cuantización.
- GPU recomendadas: para inferencia en tiempo real con múltiples cámaras, se recomienda al menos una GPU con 24 GB de VRAM (por ejemplo, RTX 4090, A100 40GB). Para entrenamiento, se necesitaría una GPU con mayor capacidad o técnicas de gradiente acumulado.
- Compatibilidad con GPU de consumo: posiblemente sí con cuantización y optimizaciones, pero no hay datos confirmados.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que gestionan la inferencia; también es compatible con el ecosistema de Hugging Face. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje puro.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoAIBo/pick_place_depth_posvel_pi05_policy (este) | 4,14B | no disponible | Pick-and-place con SO-101 TB4 | Apache-2.0 | Hugging Face |
| lerobot/pi05_base | 4,14B (estimado) | no disponible | VLA generalista | Apache-2.0 | Hugging Face |
| OpenVLA (7B) | 7B | 32K tokens | VLA generalista | MIT | Hugging Face |
| RT-2 (55B) | 55B | no disponible | VLA generalista | no disponible | no público |

La comparativa se limita a modelos VLA de código abierto. Este modelo es un fine-tuning específico de pi05_base, por lo que su rendimiento en la tarea concreta dependerá del dataset de entrenamiento. OpenVLA es una alternativa con más parámetros y contexto, pero no está adaptado a este robot concreto. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 68 episodios, lo que puede limitar la generalización a variaciones no representadas en los datos.
- Sin evaluación publicada: no hay resultados de tasa de éxito en robot real, por lo que el rendimiento real es desconocido.
- Tareas específicas: el modelo está entrenado para dos tareas muy concretas (objeto azul o amarillo, caja marrón, plato blanco); cualquier cambio en el entorno puede degradar el rendimiento.
- Dependencia de hardware específico: las cámaras y el robot SO-101 TB4 deben coincidir con la configuración de entrenamiento; cambios en la disposición de cámaras o en la calibración pueden invalidar el modelo.
- Riesgo de alucinación en acciones: como todo modelo de imitación, puede generar acciones incorrectas o inseguras si las observaciones difieren del dominio de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales; se debe verificar la licencia del dataset `MoAIBo/so101_tb4_pick_place_depth_posvel`.
- Sin soporte de idiomas: las instrucciones están en inglés y el modelo no está diseñado para procesar lenguaje natural más allá de las tareas definidas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/MoAIBo/pick_place_depth_posvel_pi05_policy
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/MoAIBo/so101_tb4_pick_place_depth_posvel
- Paper de π₀.₅: https://arxiv.org/abs/2504.16054
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
