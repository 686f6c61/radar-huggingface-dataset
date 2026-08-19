# iamazim/sonic-g1-uzbek-greeting

## Resumen

El modelo `iamazim/sonic-g1-uzbek-greeting` es una política de control de cuerpo completo (whole-body control) desarrollada como fine-tuning del sistema GEAR-SONIC de NVIDIA, especializada en ejecutar un gesto tradicional de saludo uzbeco sobre el robot humanoide Unitree G1 de 29 grados de libertad. Fue creado por el usuario iamazim para el hackathon Ghost Trial (Ultimate Bots) y destaca por mejorar significativamente la precisión del movimiento respecto al checkpoint original de SONIC, reduciendo el error medio de posición conjunta (MPJPE) en un 39% y el error local de la parte superior del cuerpo en un 71%.

El modelo se distribuye en formato ONNX e incluye un archivo de configuración de entrenamiento. Su relevancia radica en demostrar cómo el fine-tuning de políticas de control preentrenadas puede adaptar robots humanoides a gestos culturalmente específicos con alta fidelidad, un paso hacia la personalización de comportamientos robóticos en entornos sociales y de servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control de cuerpo completo (whole-body control) basada en GEAR-SONIC, con encoder y decoder para entrada de articulaciones del robot |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX, sin cuantización declarada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | ONNX (archivo `model_step_012000_g1.onnx`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint oficial de SONIC, que a su vez se basa en GEAR-SONIC, un sistema de control de cuerpo completo desarrollado por NVIDIA Labs. La arquitectura consta de un encoder y un decoder que procesan las entradas de las articulaciones del robot Unitree G1 (29 DOF) y generan comandos de control para todo el cuerpo. El entrenamiento se realizó mediante Proximal Policy Optimization (PPO) durante 12,000 pasos, con 4096 entornos paralelos en una GPU H100, utilizando Isaac Lab 2.3.2 como plataforma de simulación.

El dataset de entrenamiento consistió en 12 clips de movimiento grabados específicamente para el gesto de saludo uzbeco, mezclados con movimientos base de locomoción del G1 para preservar la estabilidad general. Los datos de movimiento fueron proporcionados por Bones Studio. Esta combinación permite que la política aprenda el gesto sin degradar las capacidades básicas de equilibrio y locomoción del robot.

## Capacidades

- Ejecución de un gesto de saludo tradicional uzbeco sobre el robot Unitree G1 con alta precisión.
- Control de cuerpo completo que integra movimientos de extremidades superiores e inferiores.
- Mantenimiento de la estabilidad y locomoción básica del robot gracias a la mezcla con movimientos base.
- Inferencia en tiempo real mediante modelo ONNX, adecuado para despliegue en el robot o en simulación.
- No incluye capacidades de lenguaje, visión ni razonamiento; es exclusivamente una política de control motor.

## Casos de uso

- Demostraciones culturales y educativas: el robot puede realizar el saludo uzbeco en museos, ferias o eventos culturales, mostrando la integración de tradiciones en robótica social.
- Entretenimiento y robótica de servicio: en hoteles o centros de atención, el gesto puede servir como saludo personalizado para visitantes de habla uzbeca o como parte de un espectáculo.
- Investigación en fine-tuning de políticas de control: sirve como caso de estudio para adaptar modelos preentrenados a movimientos específicos con pocos datos (12 clips).
- Desarrollo de robots humanoides para interacción social: el enfoque de whole-body control puede extenderse a otros gestos o comportamientos culturales.
- Validación de técnicas de simulación a real (sim-to-real): el entrenamiento en Isaac Lab y el despliegue en ONNX permiten probar la transferencia de políticas en el robot real.
- Benchmarking de control de cuerpo completo: las métricas de error (MPJPE) y tasa de éxito pueden compararse con otros checkpoints para evaluar mejoras.

## Benchmarks y rendimiento

Los resultados reportados en la model card comparan el modelo fine-tuned con el checkpoint stock de SONIC:

| Metrica | Stock SONIC | Fine-tuned | Cambio |
|---|---|---|---|
| MPJPE (error medio de posición conjunta) | 31.96 mm | 19.51 mm | -39% |
| Error local de parte superior del cuerpo | 36.16 mm | 10.38 mm | -71% |
| Tasa de éxito | 0.9833 | 0.9945 | +1.1 pt |

No se han publicado resultados de benchmarks en otros conjuntos de datos o tareas más allá de este gesto específico.

## Requisitos de hardware

- El entrenamiento se realizó en una GPU NVIDIA H100 (según la model card), pero los requisitos de inferencia no están especificados.
- Dado que el modelo es un ONNX de 0.5 GB, la inferencia podría ejecutarse en hardware embebido del robot (como NVIDIA Jetson) o en una GPU de gama media, aunque no hay datos confirmados de VRAM o latencia.
- Se requiere el robot Unitree G1 (29 DOF) para el despliegue físico, o un entorno de simulación compatible con Isaac Lab.
- Opciones de despliegue: ejecución directa del ONNX con runtime de ONNX (ONNX Runtime) en el robot o en un PC conectado; también podría integrarse en pipelines de control de Isaac Lab o ROS.
- No se dispone de estimaciones de throughput o latencia.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de control de cuerpo completo específicos para el saludo uzbeco o gestos similares. La comparativa más relevante es con el checkpoint stock de SONIC, ya presentada en la sección de benchmarks. No hay modelos comparables publicados en el ecosistema de GEAR-SONIC con los que se pueda contrastar directamente.

## Limitaciones y advertencias

- El modelo está especializado únicamente en un gesto concreto; no es generalizable a otros movimientos sin un nuevo fine-tuning.
- La licencia es "other", lo que implica restricciones no especificadas; es necesario contactar con el autor para conocer los términos exactos de uso comercial.
- No se proporcionan datos sobre sesgos o alucinaciones (no aplica a un modelo de control motor), pero sí existe riesgo de fallos de ejecución si el robot no está calibrado o si las condiciones del entorno difieren de las de entrenamiento.
- El entrenamiento se realizó con solo 12 clips de movimiento, lo que podría limitar la robustez ante variaciones en la postura inicial o perturbaciones externas.
- No se incluyen instrucciones de seguridad para operar el robot, por lo que se recomienda supervisión humana durante el despliegue.
- El formato ONNX puede requerir conversión o adaptación para el runtime específico del robot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iamazim/sonic-g1-uzbek-greeting
- Repositorio de GEAR-SONIC (GR00T-WholeBodyControl): https://github.com/NVlabs/GR00T-WholeBodyControl
