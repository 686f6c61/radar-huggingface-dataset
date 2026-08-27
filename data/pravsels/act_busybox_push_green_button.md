# pravsels/act_busybox_push_green_button

## Resumen

El modelo `pravsels/act_busybox_push_green_button` es una política de control robótico basada en ACT (Action Chunking with Transformers), desarrollada por Praveen Selvaraj (pravsels) dentro del ecosistema LeRobot. Está diseñada para que un brazo robótico SO-101 ejecute la tarea de empujar un botón verde en un escenario denominado `busybox_push_green_button`. El modelo resuelve el problema de control motor fino a partir de observaciones visuales de tres cámaras (superior, muñeca y frontal), generando secuencias de acciones de 6 dimensiones (posición y orientación del efector final).

Con 51,6 millones de parámetros, es un modelo compacto entrenado desde cero mediante aprendizaje por imitación sobre un dataset de demostraciones humanas. Su relevancia radica en que demuestra cómo un transformer de tamaño moderado puede aprender manipulaciones precisas con relativamente pocos datos, y se integra directamente con la librería LeRobot para su carga y despliegue. El entrenamiento se realizó en una GPU A100-80GB durante 30.000 pasos, con un horizonte de acción de 30 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.596.934 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control motor, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura basada en transformers que introduce el concepto de *action chunking*: en lugar de predecir una sola acción por paso, el modelo predice una secuencia de acciones futuras (en este caso, un horizonte de 30 pasos). Esto reduce el error de acumulación y mejora la estabilidad del control. La política procesa las imágenes de tres cámaras (top, wrist y front) a 720x1280 píxeles, las codifica mediante un encoder de visión y las combina con el estado del robot para generar las acciones.

El entrenamiento se realizó desde cero (sin pesos preentrenados) sobre el dataset `villekuosmanen/busybox_push_green_button`, que contiene demostraciones de la tarea de pulsar un botón verde. Se usaron 30.000 pasos con un batch de 16, optimizador Adam y una configuración estándar de ACT. No se menciona el uso de RLHF ni DPO, ya que es un pipeline de aprendizaje por imitación supervisada. El proyecto de seguimiento está en Weights & Biases con el run `q1o39jlw`.

## Capacidades

- Control de un brazo robótico SO-101 para tareas de pulsación de botones.
- Percepción visual multi-cámara (top, wrist, front) con resolución 720x1280.
- Generación de trayectorias de 6 dimensiones (posición y orientación) con horizonte de 30 pasos.
- Aprendizaje por imitación a partir de demostraciones humanas.
- Integración nativa con LeRobot: carga directa mediante `ACTPolicy.from_pretrained`.
- No soporta tool calling, agentes ni razonamiento simbólico; es un modelo puramente motor.

## Casos de uso

- Automatización de ensamblaje industrial: el modelo puede controlar un brazo robótico para pulsar botones físicos en líneas de producción, sustituyendo actuadores fijos por un sistema adaptable basado en visión.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del action chunking en tareas de manipulación precisa, comparando con otras políticas como Diffusion Policy o VLA.
- Pruebas de robustez en entornos controlados: el escenario `busybox` permite evaluar la generalización del modelo ante variaciones de iluminación, posición de la cámara o ligero desplazamiento del botón.
- Desarrollo de gemelos digitales: el modelo puede integrarse en simuladores (por ejemplo, MuJoCo o Isaac Gym) para validar estrategias de control antes del despliegue físico.
- Benchmarking de hardware robótico: al ser un modelo ligero (51,6M parámetros), es adecuado para medir el rendimiento de GPUs embebidas o de bajo consumo en robots móviles.
- Formación en robótica: su carga sencilla con LeRobot lo convierte en un ejemplo didáctico para enseñar pipelines de entrenamiento de políticas visomotoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un modelo de robótica, no aplican métricas estándar de NLP como MMLU o HumanEval. La evaluación se realiza típicamente mediante tasa de éxito en la tarea física, pero no se proporcionan datos numéricos en la model card ni en la búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 51,6M parámetros, en FP32 ocupa ~206 MB y en FP16 ~103 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas integradas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (GTX 1060 o superior). El entrenamiento se realizó en A100-80GB, pero la inferencia es mucho menos exigente.
- Compatibilidad con consumer GPU: sí, funciona en RTX 3060, RTX 4060, etc., sin problemas.
- Opciones de despliegue: LeRobot (Python), también puede exportarse a ONNX o TensorRT para entornos embebidos. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Depende del hardware y del tamaño de las imágenes de entrada (720x1280).

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Dataset | Licencia |
|---|---|---|---|---|
| pravsels/act_busybox_push_green_button | 51,6M | Pulsar botón verde (single-arm) | busybox_push_green_button | no disponible |
| pravsels/act_busybox_buttons_25k | no disponible | Pulsar botones (probablemente single-arm) | busybox_buttons | no disponible |
| pravsels/busybox_buttons_bimanual (dataset) | no aplica | Pulsar botón verde y amarillo (bimanual) | 50 episodios | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a la arquitectura (todos usan ACT) y a la tarea. No hay modelos de referencia públicos con métricas publicadas para esta tarea específica.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un modelo entrenado en un entorno controlado, puede fallar ante variaciones no vistas en el dataset (cambios de iluminación, fondos, posiciones de cámara).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede generar trayectorias inválidas o inestables si las observaciones difieren mucho de las de entrenamiento.
- Limitaciones de contexto: el modelo no procesa lenguaje ni instrucciones; solo actúa sobre el estado visual y del robot.
- Restricciones de licencia: la licencia no está especificada, lo que impide conocer si es de uso comercial libre. Se recomienda contactar al autor antes de usarlo en producción.
- Caveat para producción: el modelo fue entrenado para una tarea muy específica (pulsar un botón verde) y no generaliza a otras tareas sin reentrenamiento. Además, el dataset de entrenamiento no está documentado en detalle (número de episodios, variabilidad), lo que limita la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pravsels/act_busybox_push_green_button
- Dataset de entrenamiento: https://huggingface.co/datasets/villekuosmanen/busybox_push_green_button
- Proyecto W&B: https://wandb.ai/pravsels/act_busybox_push_green_button
- Run W&B específico: https://wandb.ai/pravsels/act_busybox_push_green_button/runs/q1o39jlw
- Repositorio GitHub del autor: https://github.com/pravsels
- Modelo relacionado (act_busybox_buttons_25k): https://huggingface.co/pravsels/act_busybox_buttons_25k
- Dataset bimanual relacionado: https://huggingface.co/datasets/pravsels/busybox_buttons_bimanual
