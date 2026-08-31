# heee1234/omx_act_policy

## Resumen

`heee1234/omx_act_policy` es un modelo de política robótica basado en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación desarrollado por investigadores de Stanford y publicado en el paper arXiv:2304.13705. El modelo predice secuencias cortas de acciones (action chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina. Ha sido entrenado y publicado utilizando la librería LeRobot de Hugging Face, sobre el dataset `heee1234/pick_and_place`, un conjunto de demostraciones teleoperadas de tareas de recoger y colocar objetos.

Con 51.668.614 parámetros, es un modelo ligero y eficiente, diseñado para ejecutarse en hardware de consumo y para ser fine-tuneado con pocos datos. Su relevancia radica en que representa una opción accesible para desarrolladores e investigadores que necesitan una política de control robótico lista para desplegar en brazos manipuladores como el SO-100, sin requerir infraestructura de entrenamiento masiva. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - Transformer con codificador y decodificador |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de entrenamiento, tipicamente ventana de observacion de 1-2 frames) |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16 segun safetensors) |
| Idiomas soportados | no disponible (modelo de control motor, no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformer que combina un codificador de visión (para procesar imágenes de cámaras) con un decodificador autoregresivo que genera secuencias de acciones (chunks) de longitud fija. A diferencia de los métodos que predicen una sola acción por paso, ACT predice un bloque de acciones futuras, lo que reduce la acumulación de errores y permite movimientos más suaves y consistentes. El modelo utiliza una estrategia de cierre de bucles con un módulo de consulta (query transformer) que extrae información relevante del contexto observado.

El entrenamiento se realiza mediante aprendizaje por imitación sobre demostraciones teleoperadas, utilizando el dataset `heee1234/pick_and_place` que contiene episodios de tareas de pick-and-place. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo fue entrenado con la librería LeRobot, que proporciona un pipeline estandarizado para entrenamiento y evaluación de políticas robóticas. La innovación clave de ACT es su capacidad para aprender tareas complejas con relativamente pocas demostraciones (típicamente entre 50 y 200 episodios), gracias al action chunking y al uso de un transformer con atención sobre las observaciones.

## Capacidades

- Control robótico de manipulación: genera comandos de posición y rotación para brazos robóticos, especialmente adecuado para tareas de pick-and-place (recoger, mover y soltar objetos).
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones humanas teleoperadas, sin necesidad de modelar dinámica del entorno.
- Generación de secuencias de acciones (action chunks): predice bloques de acciones futuras, lo que permite movimientos coordinados y reduce la frecuencia de decisiones.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluación y despliegue en robots reales o simulados.
- Ejecución en tiempo real: al ser un modelo ligero (51.6M parámetros), puede ejecutarse en GPUs de consumo con latencia baja.
- Sin capacidades de lenguaje: no procesa texto ni entiende instrucciones verbales; está especializado exclusivamente en control motor.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios: el modelo puede controlar un brazo robótico SO-100 para recoger objetos de una posición y colocarlos en otra, útil para automatizar experimentos repetitivos o clasificación de piezas.
- Prototipado rápido de nuevas tareas de manipulación: gracias a su capacidad de aprendizaje con pocas demostraciones, un investigador puede teleoperar el robot unos pocos episodios y obtener una política funcional, ideal para validar hipótesis en robótica.
- Benchmarking de algoritmos de aprendizaje por imitación: al ser un modelo estándar de ACT entrenado con LeRobot, sirve como punto de comparación para evaluar nuevas arquitecturas o técnicas de entrenamiento en tareas de manipulación.
- Educación y formación en robótica: estudiantes pueden desplegar este modelo en un robot de bajo coste (como el SO-100) para aprender sobre control robótico, visión por computador y aprendizaje por imitación en entornos académicos.
- Investigación en generalización de políticas: el modelo puede ser fine-tuneado sobre nuevos datasets para estudiar cómo se transfieren habilidades entre diferentes configuraciones de cámara, iluminación o disposición de objetos.
- Control de robots en entornos simulados: puede integrarse en simuladores como MuJoCo o Isaac Gym para desarrollo y prueba de algoritmos antes de su despliegue en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos. La documentación de LeRobot sobre ACT indica que alcanza altas tasas de éxito en tareas de manipulación fina, pero no se dispone de datos concretos para este modelo específico.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 51.6M parámetros, el modelo ocupa aproximadamente 200 MB en fp32 (o ~100 MB en fp16). La VRAM requerida dependerá de la resolución de las imágenes de entrada y del tamaño del batch, pero típicamente puede ejecutarse en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM, como GTX 1650, RTX 2060, RTX 3060, o GPUs integradas con soporte CUDA. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100, etc.).
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media y baja. También puede ejecutarse en CPU para tareas de baja frecuencia, aunque con mayor latencia.
- Opciones de despliegue: LeRobot proporciona scripts de inferencia y registro de episodios; también puede utilizarse con el servidor de políticas de Hugging Face o exportarse a ONNX/TensorRT para optimización.
- Latencia y throughput: no se dispone de datos medidos para este modelo concreto. En general, ACT con 51M parámetros puede generar chunks de acciones (típicamente 10-20 acciones) en menos de 50 ms en una GPU moderna, lo que permite control en tiempo real a 20-50 Hz.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heee1234/omx_act_policy | 51.7M | ACT (Transformer) | no disponible | Apache-2.0 | Hugging Face |
| LeRobot ACT (modelo base de referencia) | ~50-60M | ACT | no disponible | Apache-2.0 | Hugging Face |
| Diffusion Policy (Chi et al., 2023) | ~10-100M | Denoising Diffusion | no disponible | MIT | GitHub |

Los modelos comparables son otras políticas de aprendizaje por imitación para robótica. Diffusion Policy es una alternativa popular que genera acciones mediante difusión, pero requiere más cómputo en inferencia. ACT se destaca por su simplicidad y eficiencia. No se dispone de una comparativa cuantitativa directa entre estos modelos para este dataset concreto.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre demostraciones teleoperadas de un único operador y un dataset específico (`pick_and_place`), el modelo puede no generalizar a variaciones en la disposición de objetos, iluminación o texturas no presentes en los datos de entrenamiento.
- Riesgo de alucinación: en el contexto robótico, el modelo puede generar acciones inconsistentes con la tarea si las observaciones están fuera de la distribución de entrenamiento, lo que podría provocar movimientos erráticos.
- Limitaciones de idioma: no procesa lenguaje natural; no puede interpretar instrucciones verbales ni responder a comandos de texto.
- Restricciones de contexto: la ventana de observación es limitada (típicamente 1-2 frames en ACT), por lo que no tiene memoria a largo plazo de la escena.
- Requiere calibración y configuración del robot: el modelo asume una configuración específica de cámaras y cinemática del brazo; cambios en la posición de la cámara o en el robot requieren reentrenamiento o adaptación.
- Sin garantías de seguridad: no debe utilizarse en aplicaciones donde un fallo pueda causar daños físicos sin supervisión humana y mecanismos de seguridad adicionales.
- Datos de entrenamiento no auditables: no se dispone de información detallada sobre la calidad, cantidad o diversidad del dataset `heee1234/pick_and_place`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heee1234/omx_act_policy
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Documentación específica de ACT en LeRobot: https://huggingface.co/docs/lerobot/act
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
