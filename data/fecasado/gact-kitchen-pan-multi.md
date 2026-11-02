# fecasado/gact-kitchen-pan-multi

## Resumen

`gact-kitchen-pan-multi` es una política de control robótico (no un modelo de lenguaje) publicada por el usuario `fecasado` en HuggingFace. Está entrenada con LeRobot, la librería de HuggingFace para aprendizaje por imitación en robótica, y emplea el tipo de política `gaze_act`, una variante de ACT (Action Chunking with Transformers) que incorpora información de mirada (gaze) como señal adicional de entrada. El modelo resuelve una tarea concreta de manipulación: coger y mover una sartén sobre una placa de cocina, a partir del dataset `fecasado/pan-on-hob-320x240`.

Con 51.670.922 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre un brazo robótico tipo SO-100. Su relevancia es acotada pero clara: demuestra un pipeline completo de entrenamiento y despliegue de políticas visomotoras con LeRobot, incluyendo la integración de señales de gaze, y sirve como referencia reproducible para quien quiera entrenar políticas similares en entornos de cocina.

No se trata de un modelo generativo de texto ni multimodal de propósito general: no procesa lenguaje, no tiene ventana de contexto textual y no soporta tool calling. Cualquier evaluación debe hacerse en el marco de políticas de imitación para control motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gaze_act (variante de ACT, Action Chunking with Transformers, con señal de gaze) |
| Parametros totales | 51.670.922 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo LeRobot) |

## Arquitectura y entrenamiento

La política se basa en ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación. La variante `gaze_act` añade una señal de mirada como entrada adicional, presumiblemente para guiar la atención del modelo hacia las regiones relevantes de la escena durante la manipulación de la sartén.

El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/pan-on-hob-320x240`, compuesto por episodios de demostración teleoperada a resolución 320x240. No se dispone de información sobre el número de episodios, el número de tokens o pasos de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de regularización o aumento de datos. La model card es una plantilla genérica de LeRobot sin detalles técnicos específicos del autor.

## Capacidades

- Control visomotor para manipulación robótica: predice acciones de un brazo (tipo SO-100 follower) a partir de observaciones de cámara.
- Ejecución de la tarea específica de coger y colocar una sartén sobre una placa de cocina.
- Predicción de chunks de acción, lo que permite movimientos más suaves y coherentes que el control paso a paso.
- Integración de señal de gaze como entrada auxiliar para focalizar la atención visual.
- Despliegue mediante `lerobot-record` con `--policy.path` apuntando al checkpoint.
- No soporta tool calling, agentes multi-step, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como punto de partida reproducible para estudiar el efecto de añadir gaze a ACT en tareas de manipulación.
- Automatización de tareas de cocina en laboratorio: el modelo puede ejecutar la secuencia de agarre y colocación de una sartén sobre una placa, útil para prototipos de robots domésticos.
- Evaluación comparativa de políticas LeRobot: al ser un checkpoint público con licencia permisiva, permite comparar ACT frente a gaze_act en el mismo dataset.
- Docencia y formación: ejemplo completo de entrenamiento y evaluación con `lerobot-train` y `lerobot-record` sobre un brazo SO-100.
- Recolección de datos asistida: usar la política como baseline para generar episodios adicionales o para inicializar el entrenamiento de variantes.
- Pruebas de integración hardware-software: validar el pipeline de inferencia en tiempo real con cámaras de baja resolución (320x240) y brazos de bajo coste.
- Benchmark de robustez visual: evaluar cómo se comporta la política ante cambios de iluminación o posición de la sartén en el entorno de cocina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors, el peso de los parámetros en FP32 ronda los 207 MB, por lo que la inferencia cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060 o superior es más que adecuada. Para entrenamiento, se recomienda al menos una RTX 3090/4090 o una A100 si se quiere iterar rápido.
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con `--policy.device=cuda`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gact-kitchen-pan-multi | 51,7 M | gaze_act (ACT + gaze) | no disponible | apache-2.0 | HuggingFace |
| Políticas ACT estándar en LeRobot | variable (decenas de M) | ACT | no disponible | según checkpoint | HuggingFace / LeRobot |
| Políticas Diffusion Policy en LeRobot | variable | difusión | no disponible | según checkpoint | HuggingFace / LeRobot |
| Políticas VQ-BeT en LeRobot | variable | transformer discreto | no disponible | según checkpoint | HuggingFace / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de tarea: entrenado únicamente para manipular una sartén sobre una placa; no generaliza a otras tareas sin reentrenamiento.
- Sin datos de evaluación: no se han publicado métricas de éxito, robustez ni generalización.
- Dependencia del entorno: el rendimiento puede degradarse con cambios de iluminación, posición de cámara o disposición de los objetos distintos a los del dataset.
- Resolución de entrada baja (320x240): puede limitar la precisión en escenas con objetos pequeños o solapados.
- Sin capacidades de lenguaje ni razonamiento simbólico: no es adecuado para tareas que requieran instrucciones en lenguaje natural.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el comportamiento en el entorno real antes de producción.
- Riesgo de sobreajuste al dataset de demostración: al no documentarse el tamaño ni la diversidad del dataset, no puede descartarse un sobreajuste a las condiciones de recolección.
- La model card es una plantilla genérica: no hay información sobre sesgos, limitaciones conocidas ni protocolo de evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fecasado/gact-kitchen-pan-multi
- Dataset asociado: https://huggingface.co/datasets/fecasado/pan-on-hob-320x240
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
