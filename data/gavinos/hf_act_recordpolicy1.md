# GavinOS/hf_act_recordpolicy1

## Resumen

El modelo `GavinOS/hf_act_recordpolicy1` es una política robótica entrenada mediante aprendizaje por imitación con la arquitectura Action Chunking with Transformers (ACT), desarrollada originalmente por el equipo de Google Research y ahora integrada en el ecosistema LeRobot de HuggingFace. El modelo está diseñado para controlar un robot manipulador de tipo `so101` (SO-101, un brazo robótico de bajo coste basado en el diseño de LeRobot) en la tarea concreta de colocar un bloque azul en un contenedor.

La relevancia de este modelo reside en que es un ejemplo práctico de cómo LeRobot permite a cualquier desarrollador entrenar y publicar políticas robóticas de manera reproducible. Con solo 51,5 millones de parámetros y un dataset de entrenamiento reducido (11 episodios, 22.504 fotogramas), demuestra que ACT puede aprender tareas de manipulación con pocos datos teleoperados. El modelo se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial y su integración en proyectos de robótica educativa o de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT (Action Chunking with Transformers), una arquitectura basada en transformer que combina un codificador de visión con un decodificador autoregresivo para predecir secuencias de acciones (chunks) en lugar de acciones individuales. La política consume como entrada dos imágenes RGB de 256x256 píxeles (una cámara frontal y una cámara en la muñeca) junto con el estado del robot (6 dimensiones), y produce una secuencia de acciones de 6 dimensiones. El componente clave de ACT es el uso de una CVAE (Conditional Variational Autoencoder) que permite capturar la multimodalidad de las demostraciones humanas.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset de 11 episodios teleoperados con una tasa de 20 FPS, totalizando 22.504 fotogramas para la tarea "Put blue block in the bin". La configuración de entrenamiento incluye 100 pasos de entrenamiento, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento de aprendizaje por imitación supervisado puro.

## Capacidades

- Control de robot manipulador: genera comandos de acción de 6 grados de libertad (posición y orientación del efector final) para el robot SO-101.
- Percepción visual: procesa dos flujos de imagen simultáneos (cámara principal y cámara de muñeca) a resolución 256x256.
- Aprendizaje por imitación: reproduce la tarea aprendida de las demostraciones teleoperadas, incluyendo la variabilidad multimodal capturada por la CVAE.
- Acción por chunks: predice secuencias de acciones (action chunking) en lugar de pasos individuales, lo que mejora la suavidad y robustez del movimiento.
- Integración con LeRobot: compatible con el pipeline de inferencia y entrenamiento de LeRobot, incluyendo los comandos `lerobot-rollout` y `lerobot-train`.
- Tarea específica: ejecuta exclusivamente la tarea "Put blue block in the bin" para la que fue entrenado.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como referencia para estudiar cómo ACT se comporta con datasets pequeños (11 episodios) y qué umbral de datos es necesario para tareas de manipulación simples.
- Educacion robótica: permite a estudiantes y desarrolladores desplegar una política de control en un brazo SO-101 de bajo coste y estudiar el ciclo completo de entrenamiento e inferencia con LeRobot.
- Prototipado rápido de tareas de pick-and-place: con solo unas pocas horas de teleoperación, un desarrollador puede entrenar y publicar una política para tareas similares de colocación de objetos, reutilizando el flujo de trabajo.
- Benchmark para evaluar la transferencia entre robots: el modelo puede servir de baseline para comparar el rendimiento de la misma política en distintos robots de la familia SO-101 o con distintas configuraciones de cámaras.
- Estudio de robustez a variaciones de iluminación o posicion: el modelo entrenado con pocos datos es un caso de prueba para medir la degradación del rendimiento ante cambios en el entorno.
- Desarrollo de sistemas de control basados en visión: el modelo demuestra un pipeline completo de percepción-acción que puede adaptarse a tareas de mayor complejidad mediante la adición de más datos o la modificación de la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de exito en pruebas reales ni comparaciones con otros modelos en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no se ha medido oficialmente, pero con 51,5 millones de parametros y entradas de imagen de 256x256, se estima que la inferencia requiere menos de 2 GB de VRAM en FP32, y puede caber en una GPU de consumo como una NVIDIA GTX 1650 o superior.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4090). Tambien es viable en CPU para inferencia a baja frecuencia, aunque el rendimiento real dependerá del robot y de la latencia aceptable.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo convencionales.
- Opciones de despliegue: el modelo se ejecuta con el framework LeRobot, que usa PyTorch. No se distribuyen archivos GGUF ni ONNX. Se puede usar con `lerobot-rollout` para despliegue en robot real.
- Latencia y throughput: no se dispone de datos de latencia oficiales. En una GPU moderna, la inferencia de ACT con este tamano deberia ser inferior a 50 ms por paso, lo que permite control en tiempo real a 20 FPS.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente comparables en el mismo repositorio. ACT es una arquitectura establecida en robótica, y existen otras políticas entrenadas con LeRobot para tareas similares (por ejemplo, políticas para el robot SO-101 en otros datasets), pero no se ha encontrado una comparativa publicada con este modelo concreto. En terminos de arquitectura, se puede comparar con:

- ACT original (paper 2304.13705): la implementacion de referencia con la misma arquitectura, entrenada con datasets mas grandes (por ejemplo, 50 episodios) y con resultados publicados en tareas como ensamblaje o manipulacion de objetos.
- Diffusion Policy (Chi et al., 2023): otra familia de politicas de imitacion que genera acciones mediante difusion, con rendimiento comparable o superior en tareas complejas, pero con mayor coste de inferencia.
- RDT (Robotics Diffusion Transformer): una arquitectura mas reciente con parametros del orden de 100 millones, que muestra mejores resultados en tareas de manipulacion generalizada, pero con un modelo mucho mas pesado.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 11 episodios, lo que limita la generalizacion. El modelo puede fallar ante variaciones de posicion del objeto, iluminacion o configuracion del entorno.
- Tarea unica: la politica solo ejecuta la tarea "colocar bloque azul en el contenedor" y no puede adaptarse a otras tareas sin reentrenamiento.
- Dependencia de la configuracion de camaras: las entradas de imagen se capturan con una configuracion especifica de camaras; cambios en la posicion o tipo de camara degradaran el rendimiento.
- Sin evaluacion publicada: no hay metricas de exito en pruebas reales, por lo que no se conoce la tasa de exito real del modelo.
- Riesgo de sobreajuste: con un dataset tan pequeno, el modelo puede memorizar las trayectorias de las demos y fallar ante perturbaciones.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no incluye garantias de seguridad para operacion en entornos no controlados. Se recomienda usar con supervisión humana.

## Enlaces

- Modelo: https://huggingface.co/GavinOS/hf_act_recordpolicy1
- Dataset: https://huggingface.co/datasets/GavinOS/leRobot_dataset
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=GavinOS/leRobot_dataset
