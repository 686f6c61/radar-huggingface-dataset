# cbrian/pi05_task1_ND3_epi_100_step_10000_batch_32

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, diseñado para abordar el reto de la generalización en mundo abierto en robótica. A diferencia de los modelos de control robótico tradicionales que operan en entornos controlados, π₀.₅ pretende ejecutar tareas de largo horizonte en entornos y situaciones nunca vistas durante el entrenamiento. Este modelo se basa en su predecesor π₀ y utiliza co-entrenamiento sobre datos heterogéneos de robots y datos multimodales a gran escala para lograr esta capacidad.

Este repositorio concreto, `cbrian/pi05_task1_ND3_epi_100_step_10000_batch_32`, es un ajuste fino del modelo base π₀.₅ realizado con la librería LeRobot de Hugging Face. Se ha entrenado sobre un dataset de demostraciones robóticas (`cbrian/merge_task1_ND_epi_100`) durante 10.000 pasos con un tamaño de lote de 32. El modelo tiene 3.616.757.520 parámetros, está disponible en formato safetensors y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo reside en que representa una aplicación práctica de la arquitectura π₀.₅ a una tarea robótica específica, demostrando el flujo de trabajo de entrenamiento y evaluación con LeRobot. Para desarrolladores e investigadores en robótica, es un ejemplo de cómo adaptar un VLA de última generación a un dominio de tarea particular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Physical Intelligence) |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀.₅ es un modelo de visión-lenguaje-acción que combina un modelo de lenguaje y visión pre-entrenado con un módulo de acción de flujo (flow matching) para generar comandos de control del robot. La arquitectura general se describe en el artículo técnico de Physical Intelligence. La implementación en LeRobot se adapta del repositorio oficial OpenPI.

La clave de π₀.₅ es su co-entrenamiento en datos heterogéneos: combina demostraciones de robots con datos multimodales a gran escala (imagen, texto, etc.). Esto permite al modelo generalizar a entornos y situaciones no vistas durante el entrenamiento. En este repositorio, el modelo base se ha ajustado (fine-tuning) sobre un dataset de demostraciones robóticas específico (`cbrian/merge_task1_ND_epi_100`) con 100 episodios, 10.000 pasos de optimización y un tamaño de lote de 32. El entrenamiento se realizó con LeRobot.

## Capacidades

- Control robótico: el modelo genera acciones de control (posiciones, velocidades o pares) a partir de observaciones visuales y, opcionalmente, instrucciones en lenguaje natural.
- Generalización en mundo abierto: entrenado para operar en entornos y situaciones no vistas durante el entrenamiento, gracias al co-entrenamiento con datos multimodales.
- Tareas de largo horizonte: diseñado para ejecutar secuencias de acciones complejas que requieren planificación a largo plazo.
- Integración con LeRobot: se puede evaluar y ejecutar directamente con las herramientas de LeRobot (`lerobot-record`, `lerobot-train`).
- Capacidades de visión y lenguaje: al estar basado en un VLM pre-entrenado, hereda la capacidad de entender imágenes y texto, aunque en este ajuste el enfoque es el control robótico.
- Control de robots reales: el flujo de evaluación con `lerobot-record` permite conectar el modelo a un robot físico (por ejemplo, SO-100) para ejecutar políticas en tiempo real.

## Casos de uso

- **Investigación en robótica**: este modelo es útil para investigadores que quieran estudiar la generalización en mundo abierto de VLAs. Pueden evaluar el rendimiento en tareas nuevas no vistas durante el entrenamiento y comparar con el modelo base.
- **Entrenamiento de políticas robóticas**: el flujo de entrenamiento con LeRobot permite replicar el ajuste fino sobre otros datasets, adaptando el modelo a tareas específicas (por ejemplo, manipulación, navegación o ensamblaje).
- **Desarrollo de robots de servicio**: un robot equipado con este modelo podría realizar tareas domésticas como ordenar objetos o abrir cajones, en entornos variables y no controlados.
- **Automatización industrial flexible**: a diferencia de las automatizaciones rígidas, este modelo permite reconfigurar la tarea sin reprogramar, adaptándose a cambios en el entorno o en la disposición de los objetos.
- **Teleoperación asistida**: el modelo puede usarse en modo de asistencia, donde el robot ejecuta la tarea con supervisión humana, corrigiendo errores en tiempo real.
- **Benchmark de generalización**: el checkpoint puede usarse como referencia para medir la capacidad de generalización de otras arquitecturas VLA, ya que se ha entrenado con un dataset pequeño (100 episodios) y es representativo de un ajuste rápido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un ajuste específico para un dataset de demostraciones robóticas y no se reportan métricas de rendimiento en tareas estandarizadas como MMLU o HumanEval. El rendimiento se evalúa típicamente en robótica a través de la tasa de éxito en tareas físicas, que no está cuantificada aquí.

## Requisitos de hardware

- **VRAM estimada**: 3.6B parámetros en FP32 requieren aproximadamente 14.5 GB de VRAM solo para los pesos. En FP16 (safetensors) se reduce a ~7.2 GB, y con cuantización (por ejemplo, 8-bit) se puede bajar a ~3.6 GB, aunque la cuantización no está documentada en este repo.
- **GPU recomendadas**: para inferencia en FP16, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100). Para entrenamiento completo, se recomienda una GPU de alta gama con más de 24 GB (A100 80GB, H100 80GB).
- **¿Cabe en GPU de consumo?**: con cuantización de 8-bit o 4-bit, es posible ejecutar en GPUs consumer de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090), pero el rendimiento puede degradarse y no está oficialmente soportado.
- **Opciones de despliegue**: LeRobot ofrece herramientas de inferencia y evaluación. También se puede exportar a formatos optimizados como ONNX o TensorRT para inferencia de baja latencia.
- **Latencia y rendimiento**: no disponible. Depende de la GPU, la cuantización y la longitud de la secuencia de acciones generadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| **π₀.₅ (este repo)** | 3.6B | no disponible | Apache 2.0 | Hugging Face | Ajuste fino para tarea robótica específica |
| **π₀ (base)** | ~3B (estimado) | no disponible | Apache 2.0 | OpenPI (GitHub) | Predecesor, sin co-entrenamiento multimodal |
| **π₀.₅ (base)** | ~3.6B | no disponible | Apache 2.0 | Hugging Face (LeRobot) | Modelo base sin ajuste fino, entrenado en datos heterogéneos |

La comparación directa no es posible sin datos de rendimiento publicados. Sin embargo, π₀.₅ base tiene la ventaja de la generalización en mundo abierto frente a π₀, y este ajuste concreto demuestra un flujo de entrenamiento eficiente con pocos datos (100 episodios).

## Limitaciones y advertencias

- **Rendimiento específico**: el modelo se ha entrenado para una tarea concreta (`task1`) y puede no generalizar a otras tareas sin re-entrenamiento.
- **Dependencia de datos**: la calidad del comportamiento depende de la calidad del dataset de demostraciones (`merge_task1_ND_epi_100`), que no está documentado en detalle.
- **Entorno de evaluación**: la evaluación se realiza en el robot físico, por lo que el rendimiento puede variar según el entorno, la calibración del robot y la iluminación.
- **Sesgos**: no se han documentado sesgos específicos, pero como VLA, puede heredar sesgos de los datos multimodales pre-entrenados.
- **Alucinaciones en acciones**: puede generar acciones que no son físicamente factibles si el entorno difiere demasiado del entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero sin garantías.
- **Contexto limitado**: no se especifica la longitud de contexto, lo que puede limitar la cantidad de instrucciones o historial visual que puede procesar.

## Enlaces

- [HuggingFace - cbrian/pi05_task1_ND3_epi_100_step_10000_batch_32](https://huggingface.co/cbrian/pi05_task1_ND3_epi_100_step_10000_batch_32)
- [Artículo técnico de π₀.₅ (arXiv)](https://arxiv.org/abs/2504.16054)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Documentación de LeRobot para π₀.₅](https://huggingface.co/docs/lerobot/pi05)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Repositorio OpenPI (fuente original)](https://github.com/physical-intelligence/openpi)
