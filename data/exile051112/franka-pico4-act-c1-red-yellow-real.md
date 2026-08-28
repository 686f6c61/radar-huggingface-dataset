# Exile051112/franka-pico4-act-c1-red-yellow-real

## Resumen

El modelo `Exile051112/franka-pico4-act-c1-red-yellow-real` es un artefacto de despliegue privado que contiene una política de control robótico basada en la arquitectura ACT (Action Chunking with Transformers), entrenada mediante el framework LeRobot (versión 0.6.2) con PyTorch. El modelo fue desarrollado por el usuario Exile051112 para controlar un brazo robótico Franka equipado con una cámara Pico4, en la condición de entrenamiento `c1_red_yellow_real` (objetos rojos y amarillos en entorno real). Se trata de un fine-tuning completo (no LoRA) de la política ACT, con un checkpoint de 10.000 pasos de entrenamiento.

El modelo resuelve el problema de la manipulación robótica por imitación: a partir de observaciones visuales (dos cámaras RGB) y de propiocpción, genera acciones de control para el robot. Es relevante porque demuestra un despliegue práctico de ACT en un entorno real con hardware Franka y Pico4, aunque está pensado como un artefacto de despliegue interno más que como un modelo público generalista. Con 51,7 millones de parámetros, es un modelo compacto orientado a inferencia en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.683.978 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones de imagen y estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura basada en transformadores diseñada para aprendizaje por imitación en robótica. El modelo procesa dos flujos de entrada: dos imágenes RGB (cámara superior y cámara de muñeca) a 480x640 píxeles y 30 FPS, junto con un vector de propiocpción de 17 valores flotantes (`observation.state`). La salida es un vector de 10 valores (`action`) que representa la pose TCP (Tool Center Point) más el estado del gripper. El entrenamiento se realizó con fine-tuning completo sobre el checkpoint base de ACT, durante 10.000 pasos, utilizando el dataset `c1_red_yellow_real` que contiene estadísticas de normalización incluidas en los archivos de pre/postprocesador. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un entrenamiento supervisado de imitación estándar.

## Capacidades

- Control robótico por imitación: genera acciones de 10 dimensiones (pose TCP + gripper) a partir de observaciones visuales y de propiocpción.
- Percepción visual dual: procesa simultáneamente imágenes de cámara superior y de muñeca, lo que permite manipulación con información de contexto y de precisión.
- Propiocpción integrada: utiliza 17 valores de estado del robot (posición articular, velocidad, etc.) para condicionar la generación de acciones.
- Generación de acciones en bloques (action chunking): ACT produce secuencias de acciones futuras, lo que mejora la estabilidad del control en tareas de manipulación.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni razonamiento simbólico. Su única función es el control motor.

## Casos de uso

- Manipulación de objetos en entornos reales: el modelo está entrenado para tareas con objetos rojos y amarillos, probablemente recogida y colocación (pick-and-place) en un entorno de laboratorio con el robot Franka.
- Despliegue de políticas de imitación en producción: al ser un artefacto de despliegue, puede integrarse en un sistema robótico existente apuntando LeRobot a este directorio mediante `--policy.path`.
- Investigación en aprendizaje por imitación: sirve como referencia para comparar el rendimiento de ACT con otras arquitecturas (diffusion policies, etc.) en tareas de manipulación real.
- Prototipado rápido de tareas robóticas: dado su tamaño compacto (51M parámetros), puede ejecutarse en hardware modesto, facilitando iteraciones de prueba en laboratorio.
- Control de brazo Franka con cámara Pico4: el modelo está específicamente calibrado para esta configuración de hardware, lo que lo hace útil para equipos que usen el mismo setup.
- Evaluación de políticas en condiciones específicas: la condición `c1_red_yellow_real` permite estudiar el comportamiento del modelo con variaciones de color y entorno real frente a simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de éxito en tareas robóticas (tasa de éxito, precisión de agarre, etc.) en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 51,7M de parámetros en precisión FP32, el modelo ocupa aproximadamente 207 MB. En FP16 serían unos 103 MB. Cabe holgadamente en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100). Para inferencia en tiempo real a 30 FPS, una GPU de gama media es suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer actual (incluso integradas si se usa CPU, aunque con menor rendimiento).
- Opciones de despliegue: LeRobot (PyTorch) es el framework principal. También podría exportarse a ONNX o TensorRT para optimización, aunque no se menciona en la documentación.
- Latencia y throughput: no disponibles. Dado el tamaño del modelo y la naturaleza de las imágenes (480x640), se espera una latencia de decenas de milisegundos en GPU moderna, pero no hay datos confirmados.

## Comparativa con modelos similares

No hay modelos comparables directos en la información proporcionada. ACT es una arquitectura específica para robótica, y este modelo es un artefacto de despliegue privado. Se podría comparar con otras políticas de imitación como Diffusion Policy o ACT original, pero no se dispone de datos de rendimiento para establecer una comparación cuantitativa. La información sobre alternativas no está disponible.

## Limitaciones y advertencias

- Artefacto privado: la model card indica explícitamente que es un "private deployment artifact", por lo que no está pensado para uso público ni para reproducción por terceros sin el contexto completo del sistema robótico.
- Dependencias externas no incluidas: el controlador del robot Franka, la configuración de cámaras, la calibración, los límites de seguridad y el adaptador de pose TCP a comandos del robot son dependencias separadas que no se incluyen en el repositorio. Sin ellas, el modelo no puede ejecutarse.
- Riesgo de seguridad: la model card advierte que hay que confirmar el orden de las características y las unidades antes de habilitar el movimiento. Un despliegue incorrecto puede causar daños al robot o al entorno.
- Sin licencia especificada: al no tener licencia, no se puede determinar si es de uso comercial, académico o restringido. Esto limita su reutilización legal.
- Sin datos de rendimiento: no hay métricas de éxito en tareas reales, por lo que no se puede evaluar su fiabilidad en producción.
- Sesgos y alucinación: al ser un modelo de control motor, no aplican los sesgos de lenguaje, pero sí puede haber comportamientos erráticos si las observaciones difieren del dataset de entrenamiento (por ejemplo, cambios de iluminación o posición de cámara).
- Contexto limitado: el modelo solo funciona con la configuración exacta de entrada (dos cámaras, 17 valores de estado, 10 acciones). No es adaptable a otros robots sin reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Exile051112/franka-pico4-act-c1-red-yellow-real
- Repositorio de referencia ACTFranka (modificación de ACT para Franka): https://github.com/sainavaneet/ACTfranka
