# dokterkepin/omniman_drive_pick_place_v2

## Resumen

El modelo `dokterkepin/omniman_drive_pick_place_v2` es una política de control robótico basada en el método **Action Chunking with Transformers (ACT)**, entrenada con el framework **LeRobot** de Hugging Face. Desarrollado por dokterkepin, este modelo resuelve tareas de *pick and place* (recoger y colocar objetos) en un entorno de conducción teleoperada, como parte de un dataset específico (`dokterkepin/omniman_drive_pick_place`). ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación.

El modelo tiene aproximadamente 51,67 millones de parámetros, un tamaño moderado que lo hace adecuado para ejecutarse en hardware de consumo. Se distribuye en formato `safetensors` bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia radica en ser un ejemplo práctico de aplicación de transformers a la robótica, demostrando cómo entrenar y desplegar políticas de imitación con herramientas open source como LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.670.711 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura basada en transformers diseñada específicamente para aprendizaje por imitación en robótica. En lugar de predecir una única acción por paso de tiempo, el modelo genera un *chunk* de acciones futuras (típicamente de 10 a 100 pasos), lo que reduce el error acumulativo y mejora la suavidad de los movimientos. El entrenamiento se realiza mediante supervisión directa sobre datos teleoperados, sin necesidad de refuerzo (RLHF/DPO no aplica en este contexto). El framework LeRobot se encarga de la gestión del dataset, el entrenamiento y la evaluación, proporcionando una interfaz estandarizada para políticas de control.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como aumentación de datos. El modelo fue entrenado con el script estándar de LeRobot para políticas ACT, usando CUDA como dispositivo de cómputo.

## Capacidades

- Control de robot manipulador para tareas de *pick and place* (recoger, transportar y colocar objetos).
- Generación de trayectorias de acción suaves y coherentes gracias a la predicción por chunks.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de programación explícita.
- Integración con el ecosistema LeRobot: permite entrenar, evaluar y desplegar la política en robots reales o simulados.
- Soporte para robots SO100 (follower) según la documentación de evaluación incluida.
- No soporta tool calling, agentes ni razonamiento multi-step fuera del ámbito de control robótico.
- No es un modelo de lenguaje; no tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- **Automatización de líneas de ensamblaje**: el modelo puede controlar un brazo robótico para recoger piezas de una cinta transportadora y colocarlas en posiciones específicas, reduciendo la intervención humana en tareas repetitivas.
- **Logística y almacenamiento**: en almacenes, la política puede ejecutar tareas de *pick and place* para clasificar paquetes o mover productos entre contenedores, gracias a su capacidad de aprender trayectorias a partir de demostraciones.
- **Investigación en robótica**: sirve como punto de partida para experimentos con ACT y LeRobot, permitiendo a investigadores comparar variantes de arquitectura o métodos de entrenamiento sin partir de cero.
- **Despliegue en robots educativos**: al ser un modelo pequeño (51M parámetros), puede ejecutarse en GPUs de consumo, lo que lo hace accesible para laboratorios universitarios o makerspaces que utilizan plataformas como SO100.
- **Evaluación de políticas de imitación**: su integración con LeRobot facilita la reproducción de experimentos y la evaluación en entornos controlados, útil para validar mejoras en el algoritmo ACT.
- **Prototipado rápido de tareas de manipulación**: dado que se entrena con teleoperación, un operador puede generar demostraciones de nuevas tareas y reentrenar el modelo en horas, acelerando el desarrollo de aplicaciones robóticas personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como tasa de éxito, precisión de movimiento o comparativas con otros modelos en el repositorio.

## Requisitos de hardware

- VRAM estimada: al tener 51,67 millones de parámetros, el modelo en precisión FP32 ocupa aproximadamente 207 MB. Con cuantización a FP16 o INT8, el requisito baja aún más. Cabe en cualquier GPU moderna con al menos 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (GTX 1060, RTX 2060, RTX 3090, A100, etc.). Para entrenamiento se requiere al menos 8 GB de VRAM según las prácticas habituales de LeRobot con ACT, aunque no se especifica en la documentación.
- Compatibilidad con GPU de consumo: sí, es perfectamente ejecutable en tarjetas como RTX 3060, RTX 4070 o incluso en CPU para inferencia (aunque más lento).
- Opciones de despliegue: LeRobot ofrece scripts para evaluación con robots SO100; también se puede exportar a formatos como ONNX o TensorRT para optimización, aunque no está documentado en este repositorio.
- Latencia y throughput: no se proporcionan datos. Dado el tamaño del modelo, la inferencia debería ser de milisegundos en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de robótica basadas en ACT). No hay datos públicos de otros modelos similares con los que comparar parámetros, contexto o rendimiento. Se recomienda consultar el paper original de ACT y el repositorio de LeRobot para referencias adicionales.

## Limitaciones y advertencias

- **Sesgos en datos de entrenamiento**: el modelo aprende exclusivamente de las demostraciones teleoperadas del dataset `omniman_drive_pick_place`. Si las demostraciones contienen movimientos subóptimos o sesgos del operador, la política los replicará.
- **Generalización limitada**: al ser un modelo especializado en una tarea concreta (*pick and place* en un entorno de conducción), no generaliza a otras tareas de manipulación sin reentrenamiento.
- **Riesgo de alucinación en acciones**: aunque ACT reduce errores acumulativos, puede generar trayectorias no deseadas si se enfrenta a estados fuera de la distribución de entrenamiento.
- **Sin capacidades de lenguaje**: no es un modelo multimodal ni de texto; no puede interpretar instrucciones verbales ni generar descripciones.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial y modificación, pero requiere atribución y no ofrece garantías. No hay restricciones adicionales conocidas.
- **Dependencia de hardware**: para entrenamiento se necesita GPU con CUDA; la inferencia en CPU es posible pero lenta, lo que limita su uso en tiempo real sin aceleración.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dokterkepin/omniman_drive_pick_place_v2)
- [Dataset asociado](https://huggingface.co/datasets/dokterkepin/omniman_drive_pick_place)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
