# MaxHi/smolvla_twix_01_02_03_04

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para control robótico por aprendizaje por imitación. Este repositorio concreto, `MaxHi/smolvla_twix_01_02_03_04`, es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base` sobre el dataset de demostraciones `MaxHi/gm_twix_01_02_03_04_merged`, que contiene episodios de manipulación robótica. El modelo fue entrenado y subido al Hub mediante la librería LeRobot de HuggingFace, y está pensado para ser desplegado en hardware de consumo, lo que lo hace accesible para laboratorios de investigación y desarrolladores sin infraestructura de alto coste.

Con 450 millones de parámetros, este VLA es significativamente más pequeño que alternativas como OpenVLA (7B), lo que permite inferencia en tiempo real en GPUs de gama media. Su relevancia actual radica en la tendencia hacia modelos de control robótico abiertos, reproducibles y de bajo coste computacional, alineados con el ecosistema LeRobot. La licencia Apache 2.0 facilita su uso comercial y académico sin restricciones importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en SmolVLA (paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura compacta de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje pequeño y una cabeza de predicción de acciones. El modelo base `lerobot/smolvla_base` fue preentrenado y luego ajustado en este repositorio con el dataset `MaxHi/gm_twix_01_02_03_04_merged` usando LeRobot. No se proporcionan detalles sobre el número de tokens de entrenamiento, composición exacta del dataset ni técnicas de alineación como RLHF o DPO. La metodología de entrenamiento es la estándar de LeRobot para políticas de imitación, con supervisión directa de las acciones del robot.

## Capacidades

- Control robótico: predice acciones de articulaciones (joint positions o velocidades) a partir de observaciones de cámara y, opcionalmente, instrucciones en lenguaje natural.
- Aprendizaje por imitación: puede reproducir comportamientos demostrados en el dataset de entrenamiento.
- Ejecución en tiempo real: gracias a su tamaño reducido, es apto para inferencia de baja latencia en hardware de consumo.
- Integración con LeRobot: soporta entrenamiento, evaluación y despliegue mediante las herramientas estándar de LeRobot.
- Generalización a tareas similares: al ser un fine-tuning sobre un dataset específico (twix), está especializado en las tareas de ese dataset, pero puede servir como base para nuevos ajustes.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo robótico (por ejemplo, SO-100) para tareas de pick-and-place, apilado o ensamblaje, usando las demostraciones del dataset `gm_twix`.
- Desarrollo de políticas de imitación para investigación: los investigadores pueden usar este modelo como punto de partida para fine-tuning en nuevas tareas, reduciendo el tiempo de entrenamiento.
- Prototipado rápido de controladores: gracias a LeRobot, se puede entrenar y evaluar en horas, ideal para iterar en entornos de investigación.
- Educación en robótica: permite a estudiantes experimentar con VLA sin necesidad de GPUs de alta gama.
- Automatización de procesos repetitivos en entornos controlados: el modelo puede ejecutar tareas predefinidas con alta precisión si el dataset cubre la variabilidad necesaria.
- Benchmarking de modelos VLA: al ser compacto y abierto, sirve como referencia para comparar arquitecturas más grandes en tareas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de éxito en tareas, ni comparaciones con otros modelos en el repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero con 450M parámetros en fp32 se requieren aproximadamente 1.8 GB de VRAM solo para los pesos; en inferencia con activaciones y overhead, se estima que una GPU con 4-6 GB de VRAM es suficiente (por ejemplo, RTX 3050, RTX 3060, GTX 1660 Super).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 6 GB de VRAM y soporte CUDA. Para entrenamiento, se recomienda 8-12 GB (RTX 3070/3080 o superior).
- Compatibilidad con hardware de consumo: sí, es el objetivo principal del modelo.
- Opciones de despliegue: LeRobot (inferencia y entrenamiento), posiblemente exportación a ONNX o TensorRT, aunque no está documentado. También se puede usar con frameworks de inferencia genéricos si se extraen los pesos.
- Latencia y throughput: no disponible, pero por el tamaño se espera latencia de decenas de milisegundos en GPUs modernas.

## Comparativa con modelos similares

No se dispone de información comparativa en el repositorio. Sin embargo, se puede contextualizar con otros VLA abiertos:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este) | 450M | no disponible | Apache 2.0 | HuggingFace |
| OpenVLA | 7B | no disponible | MIT | HuggingFace |
| RT-2 (Google) | 55B | no disponible | propietaria | no abierto |

La comparación directa no es posible por falta de datos de rendimiento, pero SmolVLA destaca por su tamaño reducido y licencia permisiva.

## Limitaciones y advertencias

- Especialización limitada: el modelo está ajustado para el dataset `gm_twix`, por lo que su rendimiento en tareas fuera de ese dominio puede ser pobre.
- Sesgos del dataset: las demostraciones pueden contener sesgos del operador (por ejemplo, trayectorias subóptimas o preferencias de agarre).
- Riesgo de alucinación de acciones: como todo modelo generativo, puede predecir acciones incorrectas o inestables si la observación está fuera de la distribución.
- Sin información sobre robustez a cambios de iluminación, fondo o configuración del robot.
- No se documentan limitaciones de contexto o idioma; el modelo probablemente acepta instrucciones en inglés, pero no está confirmado.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del dataset original si se redistribuye.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MaxHi/smolvla_twix_01_02_03_04
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/MaxHi/gm_twix_01_02_03_04_merged
- Modelo base: https://huggingface.co/lerobot/smolvla_base
