# Greynar/act_CameraOnGripperColoredPiece_2

## Resumen

El modelo `Greynar/act_CameraOnGripperColoredPiece_2` es una política de aprendizaje por imitación basada en la arquitectura ACT (Action Chunking with Transformers), desarrollada por el usuario Greynar bajo licencia Apache 2.0. Se ha entrenado con el framework LeRobot de Hugging Face para controlar un robot manipulador en tareas de manipulación y colocación de piezas de colores, con una cámara situada en el gripper.

ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce la acumulación de errores y produce movimientos más coherentes y precisos. Este modelo, con 51.668.614 parámetros, está diseñado para ejecutarse en tiempo real y su tamaño compacto lo hace adecuado para configuraciones de robótica de bajo coste.

La relevancia de este modelo radica en su integración con el ecosistema LeRobot, que permite entrenar, evaluar y desplegar políticas robóticas de forma accesible. Su compatibilidad con robots SO100 y su licencia permisiva lo convierten en un punto de partida útil para investigadores y desarrolladores que trabajan con manipulación robótica y aprendizaje por imitación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política de robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), presentada en el artículo arXiv:2304.13705. ACT es una política de control por imitación que, en lugar de predecir una única acción por paso de control, predice un segmento (chunk) de acciones futuras mediante un transformer encoder-decoder. Esto reduce la frecuencia de decisiones y mejora la estabilidad del movimiento en tareas de manipulación.

El entrenamiento se realizó con el framework LeRobot de Hugging Face, sobre el dataset `Greynar/CameraOnGripperColoredPiece`, que contiene demostraciones teleoperadas de manipulación de piezas de colores con cámara en el gripper. No se dispone de información detallada sobre el número de episodios, el número de tokens ni la composición exacta del dataset en la información proporcionada. Tampoco se indica el uso de etapas RLHF o DPO; se trata de un entrenamiento supervisado de aprendizaje por imitación.

## Capacidades

- Predicción de secuencias de acciones (action chunking) para control de robot manipulador.
- Manipulación de piezas de colores con percepción visual desde cámara montada en el gripper.
- Entrenamiento, evaluación e inferencia completos dentro del ecosistema LeRobot mediante `lerobot-train` y `lerobot-record`.
- Compatibilidad con robots SO100 de LeRobot (brazo seguidor).
- Inferencia en tiempo real gracias a su tamaño compacto (51,7 millones de parámetros, 0,2 GB en disco).
- Evaluación reproducible con el dataset `eval_act_CameraOnGripperColoredPiece`.

## Casos de uso

- **Pick-and-place de piezas coloreadas en entornos de laboratorio**: el robot SO100, guiado por la cámara del gripper, puede recoger piezas de un color concreto y depositarlas en una posición destino. La predicción por chunks permite movimientos fluidos y sin oscilaciones.
- **Investigación en aprendizaje por imitación**: sirve como baseline para comparar variantes de ACT, probar hiperparámetros o estudiar el efecto del tamaño del chunk en la precisión de la tarea.
- **Automatización de tareas repetitivas en entornos de ensamblaje**: tareas de clasificación o alimentación de piezas pequeñas pueden delegarse al robot, aprovechando que el modelo es reentrenable con nuevos datos teleoperados.
- **Evaluación de políticas robóticas**: el dataset de evaluación asociado (`eval_act_CameraOnGripperColoredPiece`) permite medir la tasa de éxito de la política en episodios de prueba de forma estandarizada.
- **Educación en robótica**: su tamaño reducido y la integración con LeRobot lo hacen adecuado para cursos y talleres donde se enseña aprendizaje por imitación en hardware de bajo coste (SO100).
- **Fine-tuning para nuevas tareas**: al estar basado en ACT, el modelo puede adaptarse a tareas similares (otras piezas, otras posiciones) mediante fine-tuning con un dataset teleoperado específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo ocupa aproximadamente 0,2 GB en disco (safetensors). Para inferencia en GPU se estima un consumo inferior a 1 GB de VRAM, ya que se trata de una política compacta.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1060 Ti, RTX 3060, etc.). También es viable la inferencia en CPU para frecuencias de control bajas.
- **GPU consumer**: sí, cabe en cualquier GPU de consumo actual sin problema.
- **Opciones de despliegue**: framework LeRobot con scripts de CLI (`lerobot-record`, `lerobot-train`), integración con Hugging Face Hub para descarga de pesos.
- **Latencia y throughput**: no se proporcionan cifras oficiales, pero dado el tamaño del modelo se espera una inferencia en tiempo real (varios Hz) en GPU de consumo, suficiente para control de robots.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. La categoría de políticas ACT entrenadas con LeRobot es amplia, pero no se han identificado modelos equivalentes con los que comparar de forma rigurosa.

## Limitaciones y advertencias

- **Especificidad de la tarea**: el modelo está entrenado para la manipulación de piezas de colores con cámara en el gripper; su generalización a otras tareas o entornos no está garantizada y requeriría reentrenamiento o fine-tuning.
- **Dependencia del robot**: la política está diseñada para el brazo SO100 de LeRobot; su uso en otros hardware requeriría adaptaciones no triviales.
- **Robustez limitada**: no se dispone de datos sobre el comportamiento ante perturbaciones visuales, cambios de iluminación o variaciones en la posición de las piezas.
- **Sesgos y alucinación**: no aplican en el sentido de un modelo de lenguaje, pero el modelo puede presentar comportamientos erráticos en situaciones no vistas durante el entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe mantener la atribución al autor y conservar el aviso de licencia.
- **Modelo no validado**: con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de validación externa ni de uso en producción por terceros.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Greynar/act_CameraOnGripperColoredPiece_2
- Dataset de entrenamiento: https://huggingface.co/datasets/Greynar/CameraOnGripperColoredPiece
- Dataset de evaluación: https://huggingface.co/datasets/Greynar/eval_act_CameraOnGripperColoredPiece
- Artículo ACT (arXiv): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
