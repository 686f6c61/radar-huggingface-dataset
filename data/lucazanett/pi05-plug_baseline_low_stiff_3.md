# lucazanett/pi05-plug_baseline_low_stiff_3

## Resumen

π₀.₅ (Pi05) es un modelo de Vision-Lenguaje-Acción (VLA) desarrollado por Physical Intelligence, orientado a la generalización en entornos abiertos en robótica. El repositorio `lucazanett/pi05-plug_baseline_low_stiff_3` es un checkpoint concreto de esa política, entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robots. La implementación de LeRobot está adaptada del repositorio OpenPI del propio laboratorio.

El checkpoint está especializado en una tarea de manipulación concreta (el identificador `plug_baseline_low_stiff_3` sugiere una tarea de inserción de conector con rigidez baja, aunque la model card no documenta el entorno ni el montaje experimental). Los pesos suman 4.143.404.816 parámetros en formato safetensors, con un repositorio de 9,4 GB, y se distribuyen bajo licencia Apache 2.0.

Su relevancia es doble: por un lado, permite reproducir y evaluar una política π₀.₅ sin partir de cero; por otro, sirve como referencia de cómo LeRobot empaqueta políticas VLA de gran tamaño (más de 4.000 millones de parámetros) para entrenamiento con `lerobot-train` e inferencia con `lerobot-record`. No hay información pública sobre el dataset de entrenamiento más allá del identificador, ni sobre el número de episodios o de tokens utilizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) tipo π₀.₅; detalles internos (backbone VLM, módulo de acciones, flow matching) no disponibles en la información proporcionada |
| Parametros totales | 4.143.404.816 (4,14 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La model card define el modelo como una política π₀.₅, es decir, un modelo de Vision-Lenguaje-Acción que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras. La implementación incluida en LeRobot es una adaptación del repositorio OpenPI de Physical Intelligence, lo que implica que la política se ejecuta dentro del ecosistema LeRobot con las interfaces estándar de entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).

No se dispone de información sobre la arquitectura interna (tipo de backbone visual-lenguaje, mecanismo de decodificación de acciones, uso de flow matching o difusión), el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste fino supervisado adicional. El checkpoint parece ser un ajuste fino sobre una tarea concreta del dataset `lucazanett/plug_baseline_low_stiff_3`; el pipeline de ejemplo de la model card emplea `--policy.type=act`, pero ese comando corresponde a la plantilla genérica de LeRobot y no necesariamente al tipo de política de este repositorio.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones, propio de un modelo VLA.
- Generalización a entornos y situaciones no vistas durante el entrenamiento, según el objetivo declarado de π₀.₅.
- Ejecución de políticas de manipulación de precisión (el nombre del checkpoint apunta a una tarea de inserción de conector).
- Integración con el stack LeRobot: entrenamiento, evaluación y registro de episodios.
- Compatibilidad con robots tipo `so100_follower` en los comandos de ejemplo de la model card.
- Soporte de tool calling, agentes, razonamiento multi-paso, matemáticas, código o multimodalidad texto-audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de una tarea de inserción de precisión: la política puede desplegarse sobre un brazo robótico para ejecutar la maniobra de acoplamiento con la que fue entrenada, usando `lerobot-record --policy.path` para validar el comportamiento en el robot real.
- Evaluación comparativa de políticas: sirve como baseline (`baseline` aparece en el identificador) frente a variantes con distinta rigidez o configuración, registrando episodios de evaluación con prefijo `eval_` para medir tasas de éxito.
- Reproducción de experimentos de investigación: al estar publicada bajo Apache 2.0 y en formato safetensors, permite a un laboratorio replicar el resultado sin reentrenar desde cero.
- Ajuste fino sobre un dataset propio: el checkpoint puede actuar como punto de partida para `lerobot-train` con un dataset nuevo de la misma familia de tareas, reduciendo el coste frente a entrenar desde cero.
- Docencia y formación en robótica de imitación: el par de comandos de entrenamiento e inferencia de la model card constituye un ejemplo mínimo reproducible de un pipeline VLA completo.
- Integración en un banco de pruebas de manipulación: comparar latencia y robustez de una política de 4,14 B de parámetros frente a políticas más ligeras tipo ACT en el mismo montaje físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 8,3 GB solo para los pesos, más activaciones y memoria del runtime visual; un presupuesto práctico de 12-16 GB es razonable, aunque no hay mediciones publicadas.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,1 GB de pesos; en 4 bits, en torno a 2,1 GB. Ambas cifras son cálculos teóricos sobre el recuento de parámetros, no datos publicados.
- GPU recomendadas: A100 (40/80 GB), H100 o L40S para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) para inferencia y ajuste fino ligero.
- Cabe en GPU de consumo: sí previsiblemente en RTX 4090, RTX 3090, RTX 4080 y modelos con 16 GB o más; en tarjetas de 8-12 GB requeriría cuantización, sin garantías documentadas.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) sobre PyTorch/CUDA. vLLM, llama.cpp, Ollama o TGI no son aplicables de forma directa a una política VLA con salidas de acción.
- Latencia y throughput: no disponibles. El modelo es de 4,14 B de parámetros y debe ejecutarse a la frecuencia de control del robot, factor crítico que no se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π₀.₅ plug_baseline_low_stiff_3 (este) | 4,14 B | no disponible | no disponible | Apache 2.0 | Hugging Face, vía LeRobot |
| π₀ / π₀.₅ original (Physical Intelligence, OpenPI) | no disponible | no disponible | no disponible | no disponible en la información proporcionada | Repositorio OpenPI |
| Políticas ACT de LeRobot | no disponible | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face, vía LeRobot |
| Otras políticas VLA open source (p. ej. OpenVLA) | no disponible | no disponible | no disponible | no disponible en la información proporcionada | no disponible |

No se han proporcionado datos numéricos de modelos comparables, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- La model card es una plantilla prácticamente sin rellenar: no documenta dataset, hiperparámetros, entorno, robot objetivo ni métricas de éxito.
- Es un checkpoint de tarea específica; no debe asumirse generalización fuera de la configuración para la que fue entrenado.
- Riesgo de alucinación y de comportamiento errático fuera de la distribución visual del entrenamiento, inherente a las políticas VLA.
- Sin información sobre sesgos demográficos, culturales o de otro tipo en los datos de entrenamiento.
- Sin datos sobre longitud de contexto, idiomas soportados ni robustez ante instrucciones en castellano.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la seguridad física del despliegue.
- El número de descargas y de "likes" es cero y la fecha de publicación es muy reciente, por lo que no existe validación independiente de la comunidad.
- El comando de entrenamiento de la model card usa `--policy.type=act`, lo que puede no corresponder al tipo real de política π₀.₅; conviene verificar la configuración antes de reentrenar.
- Despliegue en robot real implica riesgos físicos: se recomienda validación en simulación y límites de par/velocidad antes de operar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucazanett/pi05-plug_baseline_low_stiff_3
- Dataset de entrenamiento: https://huggingface.co/datasets/lucazanett/plug_baseline_low_stiff_3
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/PhysicalIntelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
