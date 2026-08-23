# hesh0629/groot-grab_socks_v2

## Resumen

El modelo `hesh0629/groot-grab_socks_v2` es una política de robótica entrenada mediante aprendizaje por imitación (imitation learning) con la librería LeRobot de Hugging Face. Desarrollado por el usuario hesh0629, está diseñado para controlar un robot en la tarea de agarrar calcetines (`grab_socks`), probablemente sobre un brazo robótico tipo SO-100. Con aproximadamente 2.724 millones de parámetros, el modelo se publica bajo licencia Apache 2.0 y en formato safetensors, lo que facilita su descarga y despliegue en entornos de investigación.

La relevancia de este modelo radica en su naturaleza abierta y reproducible: sigue el ecosistema LeRobot, que permite entrenar, evaluar y compartir políticas robóticas de forma estandarizada. Aunque no se aportan detalles específicos de arquitectura o rendimiento en la model card, el repositorio incluye instrucciones de entrenamiento e inferencia, lo que permite a otros equipos replicar el flujo de trabajo. Su tamaño moderado lo hace accesible para GPUs de consumo medio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (posiblemente ACT, según comando de entrenamiento en la model card) |
| Parametros totales | 2.724.163.520 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card es una plantilla genérica de LeRobot, sin detalles específicos sobre la arquitectura. Sin embargo, el comando de entrenamiento mostrado usa `--policy.type=act`, lo que sugiere que la política implementada es **ACT (Action Chunking with Transformers)**, una arquitectura basada en transformers diseñada para control robótico de alta frecuencia. ACT procesa observaciones visuales (imágenes de cámaras) y estados del robot para generar secuencias de acciones, y fue popularizada por el proyecto ALOHA de Stanford.

El dataset asociado es `hesh0629/grab_socks_v2`, que contiene teleoperaciones de la tarea de agarrar calcetines. No se dispone de información sobre el número de episodios, la composición exacta de las observaciones ni si se aplicaron técnicas de refinamiento como RLHF. El modelo fue entrenado con el pipeline estándar de LeRobot, que incluye normalización de observaciones y acciones, y checkpoints periódicos durante el entrenamiento.

## Capacidades

- Control robótico de una tarea de manipulación: agarre de calcetines con un brazo SO-100.
- Generación de acciones de alta frecuencia (chunking de acciones) a partir de observaciones visuales y del estado del robot.
- Compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots físicos o simulados.
- Soporte para evaluación mediante teleoperación y grabación de episodios (ver comandos en la model card).
- No se documentan capacidades de lenguaje, visión general ni razonamiento simbólico; es un modelo específico para una tarea robótica.

## Casos de uso

- **Investigación en aprendizaje por imitación**: el modelo puede servir como punto de partida para estudiar técnicas de ACT en tareas de manipulación, comparando su rendimiento con variantes del mismo dataset o arquitectura.
- **Automatización de tareas de recogida en entornos controlados**: en un laboratorio o planta piloto, el modelo puede controlar un brazo robótico para recoger calcetines de una superficie, reduciendo la intervención humana.
- **Benchmark para políticas robóticas**: al ser público y con licencia abierta, se puede utilizar como referencia para evaluar nuevos algoritmos de aprendizaje por refuerzo o imitación.
- **Prototipado de sistemas de robot asistente**: integrado en un sistema más grande, podría probarse en tareas de organización de ropa en hogares o entornos de asistencia.
- **Educación en robótica**: permite a estudiantes y desarrolladores practicar el ciclo completo de entrenamiento y despliegue de una política robótica sin partir de cero.
- **Evaluación de robustez**: se puede usar para probar la generalización del modelo ante variaciones de iluminación, posición de la cámara o tipo de calcetín, siempre que se disponga de un entorno de evaluación adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como tasa de éxito, precisión de agarre ni comparación con otros modelos en la tarea `grab_socks`.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con ~2.7B parámetros en FP32, el modelo requiere al menos 10 GB de VRAM solo para los pesos; con cuantización (p. ej., FP16 o INT8) podría reducirse a 5-6 GB. Sin embargo, no se han publicado configuraciones de cuantización.
- **GPU recomendadas**: una GPU de gama media como RTX 3060/4060 (12 GB) o superior sería suficiente para inferencia en tiempo real; para entrenamiento, se recomienda una GPU con al menos 16-24 GB (RTX 3090, A5000, etc.).
- **¿Cabe en GPU de consumo?**: Sí, en GPUs de 12 GB o más, siempre que se cargue en FP16 o se utilice un framework de optimización como vLLM (aunque vLLM no es típico para robótica). LeRobot usa PyTorch estándar.
- **Opciones de despliegue**: el modelo se ejecuta con LeRobot, que soporta inferencia local con CUDA. También es posible integrarlo en ROS u otros sistemas robóticos mediante wrappers.
- **Latencia y throughput**: no se han publicado datos. Para un modelo ACT de 2.7B, la inferencia en una GPU moderna suele estar en el rango de 10-30 ms por paso, dependiendo del tamaño de las imágenes de entrada y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hesh0629/groot-grab_socks_v2` | 2.724M | No aplica | Agarre de calcetines | Apache 2.0 | Público en HF |
| `hesh0629/xvla-grab_socks_v2` | no disponible | no disponible | Agarre de calcetines | no disponible | Público en HF |
| Modelos NVIDIA GR00T (N1.7) | ~2B (VLM backbone) | no aplica | Manipulación general | NVIDIA Open Model License | Público en GitHub |

La comparativa es limitada porque no se dispone de datos de rendimiento ni de arquitectura para el modelo `xvla-grab_socks_v2`. Los modelos GR00T de NVIDIA están orientados a tareas de manipulación general, pero no son directamente comparables sin benchmarks compartidos.

## Limitaciones y advertencias

- **Especificidad de tarea**: el modelo está entrenado exclusivamente para la tarea de agarrar calcetines; no generaliza a otras tareas de manipulación sin reentrenamiento.
- **Dependencia del entorno**: su rendimiento puede degradarse con cambios en la iluminación, la posición de la cámara, el tipo de calcetín o la configuración del robot.
- **Sesgos del dataset**: no se ha publicado información sobre la variabilidad del dataset; puede haber sesgos en la forma de agarrar los objetos o en la posición de la cámara.
- **Riesgo de alucinación**: no aplica, al ser un modelo de acción robótica y no de generación de texto.
- **Licencia**: Apache 2.0 permite uso comercial, pero es recomendable revisar la licencia del dataset `hesh0629/grab_socks_v2` si se usa en producción.
- **Mantenimiento**: el modelo fue creado en agosto de 2026 y no se ha actualizado desde entonces; no hay garantía de soporte o compatibilidad futura con versiones de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hesh0629/groot-grab_socks_v2
- Dataset asociado: https://huggingface.co/datasets/hesh0629/grab_socks_v2
- Modelo relacionado (`xvla-grab_socks_v2`): https://huggingface.co/hesh0629/xvla-grab_socks_v2
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
