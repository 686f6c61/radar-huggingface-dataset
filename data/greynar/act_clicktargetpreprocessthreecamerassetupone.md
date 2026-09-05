# Greynar/act_ClickTargetPreprocessThreeCamerasSetUpOne

## Resumen

El modelo `Greynar/act_ClickTargetPreprocessThreeCamerasSetUpOne` es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), desarrollada por el usuario Greynar y publicada en HuggingFace bajo el framework LeRobot. Está entrenada para controlar un robot a partir de observaciones de tres cámaras, con el objetivo de predecir secuencias de acciones (chunks) en lugar de pasos individuales, lo que reduce la acumulación de errores en tareas de manipulación. El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors, con licencia Apache-2.0. Es relevante para el campo de la robótica de bajo coste, ya que permite entrenar políticas de control a partir de demostraciones teleoperadas y desplegarlas en robots como el SO100 follower.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende de las observaciones de tres cámaras; no se especifica en la documentación) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors; no se especifican variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo de visión-acción, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, un método de aprendizaje por imitación que predice un chunk de acciones futuras (por ejemplo, 100 pasos) a partir de un contexto de observaciones. Utiliza un transformer codificador-decodificador con atención sobre las entradas visuales y de estado del robot. La innovación principal es el "action chunking": en lugar de predecir un solo paso de acción, el modelo genera una secuencia completa de acciones, lo que mitiga el error de composición durante la ejecución en bucle cerrado.

El entrenamiento se realizó con el framework LeRobot, usando un dataset teleoperado del autor (`Greynar/ClickTargetPreprocessThreeCamerasSetUpOne`). No se han publicado detalles sobre el número de demostraciones, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El modelo es una política de control, no un modelo de lenguaje, por lo que su entrenamiento se centra en datos de demostraciones robóticas.

## Capacidades

- Predicción de secuencias de acciones (chunks) para control robótico, lo que permite ejecutar movimientos suaves y consistentes.
- Entrada multimodal basada en imágenes de tres cámaras y, probablemente, estados de articulaciones del robot.
- Generación de acciones de baja dimensión, como posiciones de articulaciones o referencias de esfuerzo.
- Compatibilidad con el framework LeRobot para entrenamiento, evaluación e inferencia, incluyendo el comando `lerobot-record` para recopilar datos de evaluación.
- No soporta tool calling, generación de texto, razonamiento simbólico ni capacidades multilingües.
- No es un modelo de visión generalista: está especializado en tareas de manipulación específicas del dataset de entrenamiento.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: el modelo puede controlar un brazo robótico para tareas de agarre y colocación de objetos, gracias a la predicción de chunks de acciones que reducen el error acumulado.
- Teleoperación y aprendizaje por demostración: permite entrenar políticas a partir de datos capturados por un operador humano y luego reproducirlas de forma autónoma, acelerando el desarrollo de nuevas habilidades robóticas.
- Automatización de tareas repetitivas en entornos controlados: adecuado para procesos de pick-and-place o ensamblaje sencillo en líneas de producción de investigación.
- Investigación en aprendizaje por imitación: sirve como modelo de referencia para comparar métodos de action chunking frente a otras arquitecturas (por ejemplo, Diffusion Policy) en entornos de simulación o robots reales.
- Control de brazos robóticos de bajo coste (tipo SO100): el modelo se integra con el robot SO100 follower mediante LeRobot, lo que facilita el despliegue en plataformas de hardware asequible.
- Prototipado rápido de políticas de control: al ser un modelo pequeño (51,7 M parámetros), permite iterar sobre el dataset y la arquitectura sin necesidad de infraestructura de computación costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 51,7 M parámetros ocupan aproximadamente 207 MB en FP32 y 104 MB en FP16. Con overhead de inferencia, cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo, como RTX 3060, RTX 4090, o incluso una GPU integrada para inferencia lenta. No se requiere hardware de gama alta.
- Compatibilidad con consumer GPU: sí, el modelo es ligero y puede ejecutarse en GPUs de gama baja.
- Opciones de despliegue: LeRobot (entrenamiento, evaluación e inferencia), HuggingFace Hub. No es aplicable a vLLM, llama.cpp, Ollama o TGI, al ser un modelo de robótica y no de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Greynar/act_ClickTargetPreprocessThreeCamerasSetUpOne | 51.668.614 | No disponible | Apache-2.0 | HuggingFace |
| Greynar/act_ClickTargetPreprocessCleanThreeCameras | 51,7 M | No disponible | Apache-2.0 | HuggingFace |
| Greynar/act_ClickTargetPreprocessTestThreeCamera | 51,7 M (estimado, no confirmado) | No disponible | Apache-2.0 | HuggingFace |

Los tres modelos comparten la misma arquitectura ACT y tamaño, diferenciándose en el dataset de entrenamiento utilizado. No se dispone de resultados de benchmarks para comparar su rendimiento relativo.

## Limitaciones y advertencias

- Entrenado en un dataset específico (`ClickTargetPreprocessThreeCamerasSetUpOne`); la generalización a otras tareas, entornos o configuraciones de cámara no está garantizada.
- Dependencia crítica de la disposición de las tres cámaras: cambios en la posición o calibración pueden degradar significativamente el rendimiento.
- No es un modelo de lenguaje: no puede procesar instrucciones textuales ni mantener diálogos, por lo que su uso se limita a control robótico.
- Riesgo de acciones erróneas o inseguras en situaciones no vistas; se recomienda validar la política en simulación antes de desplegarla en robots reales.
- No se han publicado evaluaciones de sesgos, robustez ni seguridad.
- La licencia Apache-2.0 permite uso comercial, pero el dataset de entrenamiento podría tener restricciones adicionales no documentadas en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/Greynar/act_ClickTargetPreprocessThreeCamerasSetUpOne
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
