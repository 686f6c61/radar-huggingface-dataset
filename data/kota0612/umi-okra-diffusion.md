# Kota0612/umi-okra-diffusion

## Resumen

El modelo `Kota0612/umi-okra-diffusion` es un checkpoint de Diffusion Policy entrenado con la interfaz UMI (Universal Manipulation Interface) para la tarea de agarre de okra (quingombó) mediante teleoperación handheld. Ha sido desarrollado por Kota0612 como parte de un pipeline de cosecha autónoma de okra con el robot humanoide Unitree G1, que combina una aproximación gruesa por cinemática inversa (IK) seguida de un ajuste fino del efector final mediante este modelo de difusión.

El modelo se basa en la implementación oficial de UMI (`TrainDiffusionUnetImageWorkspace`) y está entrenado con 101 episodios de demostración del dataset `2026-08-07_okura_canary`. La acción tiene 9 dimensiones (3 de posición + 6 de rotación en representación 6D, sin dimensión de pinza) y tanto las observaciones como las acciones usan representación relativa. Su relevancia radica en demostrar la aplicación de Diffusion Policies a tareas agrícolas de manipulación fina en robots humanoides, un campo emergente en robótica de campo abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (UNet de difusion condicionada por imagen) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa secuencias de observaciones) |
| Tipos de cuantizacion | no disponible (checkpoint en precision completa) |
| Idiomas soportados | no disponible (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch checkpoint (`.ckpt`, serializado con `dill`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Diffusion Policy implementada en el repositorio oficial de UMI (Stanford). Se trata de un UNet de difusion que procesa imagenes de observacion (tipicamente desde una camara montada en la muneca del robot) y genera secuencias de acciones de 9 dimensiones (posicion 3D + rotacion 6D). La representacion de pose es relativa tanto para observaciones como para acciones, lo que facilita la generalizacion a diferentes posiciones iniciales.

El entrenamiento se realizo con 101 episodios de demostraciones recogidas mediante teleoperacion handheld con UMI, correspondientes al dataset `2026-08-07_okura_canary`. El checkpoint guardado corresponde a la epoca 15 de un entrenamiento de 101 epocas. No se especifica el numero total de parametros, el tamano del dataset en horas, ni si se aplicaron tecnicas adicionales como aumentacion de datos o regularizacion. La integracion con el robot Unitree G1 se realiza a traves del repositorio `Orboh/DimOS_base_G1-TOYOTA-BODY-RESEARCH` (rama `IK_dex1_umi`), que gestiona la conexion entre el modelo y el robot.

## Capacidades

- Generacion de trayectorias de efector final (posicion 3D + orientacion 6D) para tareas de agarre y manipulacion.
- Ajuste fino del efector final (EE) a partir de una aproximacion gruesa por cinematica inversa, permitiendo correcciones precisas en tiempo real.
- Aprendizaje por imitacion a partir de demostraciones humanas teleoperadas, sin necesidad de ingenieria de recompensas.
- Especializado en la tarea de agarre de okra en entornos de campo (tanto en laboratorio como en campo real, segun los datasets asociados).
- Integracion con el robot humanoide Unitree G1 mediante el stack de inferencia de UMI (`diffusion_policy` package).
- Capacidad de operar con representaciones relativas de pose, lo que mejora la robustez frente a variaciones de posicion inicial.

## Casos de uso

- Cosecha autonoma de okra en invernaderos o campos: el modelo se integra en un pipeline donde el robot G1 se aproxima al fruto mediante IK y luego usa este Diffusion Policy para ajustar la posicion y orientacion del efector final antes del agarre.
- Teleoperacion asistida para agricultura: un operador humano recoge demostraciones con UMI y el modelo las reproduce de forma autonoma, reduciendo la carga de trabajo manual.
- Investigacion en aprendizaje por imitacion para manipulacion fina: sirve como punto de partida para estudiar tecnicas de Diffusion Policy en tareas con objetos deformables o de forma irregular (okra).
- Desarrollo de robots humanoides para entornos agricolas: el checkpoint demuestra la viabilidad de usar Unitree G1 para tareas de precision en campo, combinando IK y aprendizaje por difusion.
- Benchmark de manipulacion con UMI: puede utilizarse como referencia para comparar diferentes datasets, arquitecturas o hiperparametros en tareas de agarre.
- Extension a otras frutas u hortalizas: la arquitectura es agnostica a la tarea, por lo que el mismo enfoque puede reentrenarse con nuevos datasets para otros cultivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas de exito de agarre, tasa de acierto, latencia de inferencia ni comparaciones con otros metodos.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un UNet de difusion con entrada de imagen, se estima que puede ejecutarse en GPUs de gama media (8-16 GB) para inferencia, pero no hay datos confirmados.
- GPU recomendadas: no disponible. El entrenamiento se realizo probablemente con una GPU de alta gama (A100 o similar), pero no se especifica.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano del checkpoint (2.7 GB), pero no confirmado.
- Opciones de despliegue: el stack de inferencia de UMI usa PyTorch; puede ejecutarse en cualquier sistema con PyTorch y CUDA. No se mencionan integraciones con vLLM, Ollama o TGI (no aplicables a modelos de robotica).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. Como referencia cualitativa, se pueden mencionar otros Diffusion Policies para manipulacion:

| Modelo | Arquitectura | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| umi-okra-diffusion (este) | Diffusion Policy (UNet) | Agarre de okra con Unitree G1 | Apache 2.0 | Hugging Face |
| Diffusion Policy original (Chi et al., 2023) | Diffusion Policy (UNet) | Manipulacion general (varias tareas) | MIT (codigo) | GitHub |
| ACT (Action Chunking with Transformers) | Transformer | Manipulacion con demostraciones | MIT | GitHub |

La comparacion directa no es posible sin benchmarks comunes. Este modelo se distingue por su aplicacion especifica a agricultura y su integracion con un robot humanoide comercial.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con 101 episodios de un dataset concreto (`okura_canary`); su generalizacion a otros entornos, iluminaciones o variedades de okra no esta garantizada.
- No se especifican sesgos conocidos, pero al ser un modelo de imitacion, hereda los sesgos de las demostraciones humanas (por ejemplo, preferencia por ciertos angulos de agarre).
- Riesgo de alucinacion: en el contexto de Diffusion Policy, esto se traduce en trayectorias irreales o inestables cuando el modelo opera fuera de la distribucion de entrenamiento.
- La representacion de accion no incluye dimension de pinza (gripper), por lo que el control de apertura/cierre debe gestionarse externamente.
- No se proporcionan metricas de robustez ni tasas de exito en condiciones reales de campo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de librerias externas (UMI, diffusion_policy) cuyas licencias deben verificarse.
- El checkpoint esta en formato `.ckpt` con serializacion `dill`, lo que puede requerir versiones especificas de PyTorch y dependencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kota0612/umi-okra-diffusion
- Repositorio UMI (Universal Manipulation Interface): https://github.com/real-stanford/universal_manipulation_interface
- Repositorio de integracion con Unitree G1: https://github.com/Orboh/DimOS_base_G1-TOYOTA-BODY-RESEARCH (rama `IK_dex1_umi`)
- Dataset relacionado (campo): https://huggingface.co/datasets/Kota0612/umi-okra-grassland-20260724
- Dataset relacionado (laboratorio, via claru.ai): https://claru.ai/datasets/orboh-umi-okra-dex1
