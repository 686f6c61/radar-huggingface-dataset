# brian564237/act-block-bowl-test

## Resumen

El modelo `brian564237/act-block-bowl-test` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario brian564237 y publicada en Hugging Face bajo licencia Apache 2.0. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite al robot ejecutar movimientos coordinados a partir de demostraciones teleoperadas. Este modelo concreto está entrenado para operar sobre un robot tipo `so_follower` con una cámara frontal, y su tarea asociada aparece vacía en la configuración, lo que sugiere que se trata de una prueba o demostración técnica.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 millones) y un tamaño de repositorio de 0,2 GB, con pesos en formato safetensors. Fue entrenado con la librería LeRobot (versión 0.6.2) sobre un dataset de 50 episodios y 14.946 fotogramas a 30 FPS, aunque solo se realizaron 10 pasos de entrenamiento, lo que indica que es un modelo de validación o test más que una política lista para producción. Su relevancia radica en servir como ejemplo de integración de ACT con LeRobot, mostrando el flujo completo de entrenamiento, publicación y despliegue en un entorno de robótica real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que utiliza un transformer para predecir un chunk de acciones futuras (típicamente de 10 a 100 pasos) a partir de observaciones actuales, combinando una representación visual (imagen de cámara) y una representación de estado (posición articular). En este caso, las observaciones de entrada son `observation.state` con forma `(6,)` y `observation.images.front` con forma `(3, 720, 1280)`, y la salida es una acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot sobre el dataset `brian564237/so101-block-bowl-test`, que contiene 50 episodios y 14.946 fotogramas a 30 FPS. La configuración de entrenamiento incluye 10 pasos, batch size 1, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se especifica si se aplicaron técnicas de RLHF o DPO, ya que es un método de imitación supervisada. El número extremadamente bajo de pasos de entrenamiento (10) sugiere que el modelo no ha convergido y es solo una prueba de concepto.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones (chunks) para ejecutar tareas de manipulación, como recoger y colocar objetos.
- Procesamiento de visión: utiliza una cámara frontal (imagen RGB de 720x1280) como entrada visual para percibir el entorno.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Soporte de teleoperación: aprende de demostraciones humanas teleoperadas, lo que permite transferir habilidades sin programación explícita.
- No tiene capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico, ya que es un modelo puramente motor.

## Casos de uso

- Pruebas de integración de LeRobot: el modelo sirve como ejemplo para verificar el flujo de entrenamiento, publicación y carga de políticas ACT en Hugging Face, útil para desarrolladores que quieren familiarizarse con la plataforma.
- Demostración de aprendizaje por imitación: permite mostrar cómo un robot aprende una tarea de manipulación (en este caso, aparentemente relacionada con bloques y cuencos, según el nombre del dataset) a partir de demostraciones.
- Evaluación de pipelines de robótica: al ser un modelo pequeño (51,7 M parámetros), es adecuado para probar la infraestructura de inferencia en hardware limitado antes de escalar a modelos más grandes.
- Desarrollo de políticas de control para robots `so_follower`: puede servir como punto de partida para ajustar o reentrenar sobre datasets más completos.
- Investigación en action chunking: útil para estudiar el efecto del número de pasos de entrenamiento y la calidad de las demostraciones en el rendimiento de ACT.
- Validación de despliegue en tiempo real: con solo 0,2 GB de pesos, puede ejecutarse en GPUs de gama baja o incluso en CPU para pruebas de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tener 51,7 M parámetros y un tamaño de repo de 0,2 GB, el modelo cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en GPUs integradas. En cuantización FP32 ocuparía aproximadamente 207 MB, y en FP16 unos 103 MB.
- GPU recomendadas: cualquier GPU moderna, desde una NVIDIA GTX 1050 Ti (4 GB) hasta una RTX 4090. También puede ejecutarse en CPU para pruebas de baja frecuencia.
- Compatibilidad con consumer GPU: sí, cabe en todas las GPUs de consumo actuales.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También se puede usar con PyTorch directamente.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño reducido, se espera una latencia de inferencia inferior a 10 ms en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. El modelo es una instancia de ACT entrenada con LeRobot, y existen otros repositorios similares del mismo autor (por ejemplo, `brian564237/act-test`) con características parecidas, pero no se han publicado métricas comparativas. En general, los modelos ACT de tamaño similar (50-100 M parámetros) se comparan por su tasa de éxito en tareas de manipulación, pero aquí no hay datos.

## Limitaciones y advertencias

- Entrenamiento insuficiente: solo 10 pasos de entrenamiento, lo que hace que el modelo no haya aprendido la tarea de forma fiable. No debe usarse en producción sin reentrenamiento.
- Dataset pequeño y específico: 50 episodios de una única tarea (aparentemente bloques y cuencos) con una cámara fija, lo que limita la generalización a otros entornos o variaciones.
- Sin evaluación: no hay resultados de éxito en robot real, por lo que se desconoce su rendimiento real.
- Tarea no especificada: el campo `task` está vacío, lo que dificulta saber qué comportamiento exacto se espera.
- Sesgos y alucinaciones: al ser un modelo de control motor, no aplican sesgos lingüísticos, pero puede presentar comportamientos erráticos si las observaciones difieren de las de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo es de prueba y no se recomienda su uso en aplicaciones críticas.
- Dependencia de hardware: requiere el robot `so_follower` y la configuración de cámaras específica para funcionar correctamente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/brian564237/act-block-bowl-test
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Dataset de entrenamiento: https://huggingface.co/datasets/brian564237/so101-block-bowl-test
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
