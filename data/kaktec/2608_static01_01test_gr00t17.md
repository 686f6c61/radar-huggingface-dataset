# kaKTEC/2608_static01_01test_GR00T17

## Resumen

El modelo `kaKTEC/2608_static01_01test_GR00T17` es una política robótica entrenada mediante aprendizaje por imitación con la librería LeRobot, basada en el modelo fundacional GR00T N1.7 de NVIDIA. Está diseñada para controlar un robot seguidor de tipo `so_follower` en la tarea concreta de transportar un cubo blanco, utilizando dos cámaras (superior y de muñeca) y el estado propioceptivo del robot como entradas, y generando acciones de 6 grados de libertad como salida.

El modelo emplea la arquitectura GR00T N1.7, que combina un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, lo que permite predecir secuencias de acciones condicionadas a observaciones visuales, instrucciones en lenguaje natural y propriocepción. Con 3.144 millones de parámetros y un tamaño de repositorio de 12,6 GB, se distribuye bajo licencia Apache 2.0, lo que facilita su uso y modificación en entornos de investigación y desarrollo.

Su relevancia radica en ser un ejemplo práctico de aplicación de un modelo fundacional de robótica de código abierto a una tarea específica, demostrando el flujo completo de entrenamiento, despliegue y evaluación con LeRobot. Aunque el dataset de entrenamiento es reducido (60 episodios), el modelo ilustra cómo adaptar GR00T a tareas personalizadas con un esfuerzo relativamente bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + action transformer con flow matching) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (entradas multimodales: imagen, estado y lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo procesa instrucciones en lenguaje, pero no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en GR00T N1.7, un modelo fundacional de NVIDIA para robótica humanoides y de propósito general. Su arquitectura combina un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las imágenes de las cámaras y las instrucciones textuales, con un transformer de acciones que utiliza flow matching para generar trayectorias de acción suaves y coherentes. Las observaciones incluyen dos imágenes RGB de 480x640 píxeles (cámara superior y de muñeca) y un vector de estado de 6 dimensiones (posición y orientación del efector final). La salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre un dataset propio de 60 episodios y 34.477 fotogramas a 30 FPS, correspondientes a la tarea "Carrying a White Cube". Se utilizaron 60.000 pasos de entrenamiento con un batch size de 64, optimizador AdamW, tasa de aprendizaje de 0,0001 y semilla 42. No se menciona el uso de técnicas como RLHF o DPO; el aprendizaje es puramente por imitación supervisada.

## Capacidades

- Control de robot manipulador: genera comandos de acción de 6 grados de libertad para un robot seguidor `so_follower`.
- Percepción visual: procesa imágenes de dos cámaras (superior y de muñeca) para entender la escena y localizar objetos.
- Integración de propriocepción: utiliza el estado del robot (posición y orientación) como entrada adicional para el control.
- Ejecución de tareas específicas: entrenado para transportar un cubo blanco, aunque la arquitectura subyacente permite adaptación a otras tareas mediante fine-tuning.
- Compatibilidad con LeRobot: se integra con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No incluye capacidades de lenguaje general, tool calling ni razonamiento conversacional; su función es exclusivamente robótica.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede controlar un brazo robótico para mover objetos de un punto a otro, como en la tarea de transportar un cubo, reduciendo la intervención manual en entornos de investigación.
- Evaluación de políticas robóticas: sirve como punto de partida para probar el flujo de LeRobot en un robot real, midiendo tasas de éxito en tareas de pick-and-place.
- Fine-tuning para nuevas tareas: al ser un modelo de código abierto, se puede reentrenar con datasets adicionales para adaptarlo a otros objetos o entornos, aprovechando el conocimiento previo de GR00T.
- Investigación en aprendizaje por imitación: permite estudiar el comportamiento de modelos basados en flow matching y visión-lenguaje en robótica, comparando con otras arquitecturas.
- Prototipado rápido de soluciones robóticas: con el comando `lerobot-rollout` se puede desplegar el modelo en un robot compatible en cuestión de minutos, ideal para demostraciones y pruebas de concepto.
- Educación y formación: útil para enseñar conceptos de robótica y aprendizaje automático, ya que el código y los datos están disponibles públicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas como tasa de éxito, precisión o comparativas con otros modelos.

## Requisitos de hardware

- El tamaño del repositorio es de 12,6 GB, lo que sugiere pesos en precisión fp32 (3.144 millones de parámetros × 4 bytes ≈ 12,6 GB). Para inferencia se recomienda una GPU con al menos 16 GB de VRAM para cargar el modelo sin cuantización.
- No se especifican requisitos oficiales de hardware en la documentación. Como referencia, una GPU como la NVIDIA RTX 4090 (24 GB) o una A100 (40 GB) sería suficiente para ejecutar el modelo en fp32.
- No se indica si el modelo admite cuantización (GGUF, etc.), por lo que no se puede confirmar su ejecución en GPUs de gama baja.
- El despliegue se realiza mediante LeRobot, que utiliza PyTorch y CUDA. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen del hardware y de la resolución de las imágenes (480x640). No se proporcionan datos estimados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas basadas en GR00T o similares) dentro de los datos proporcionados. La model card no incluye comparaciones con otras políticas ni con versiones anteriores de GR00T. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Carrying a White Cube" con un dataset de solo 60 episodios, lo que puede provocar overfitting y bajo rendimiento en variaciones de la tarea (cambios de iluminación, posición de objetos, etc.).
- No se han realizado evaluaciones en robot real, por lo que se desconoce su tasa de éxito real y su robustez en condiciones no controladas.
- Depende de un robot específico (`so_follower`) y de una configuración de cámaras concreta (superior y de muñeca). Su transferencia a otros robots o configuraciones requiere reentrenamiento.
- Al ser un modelo de robótica, no es adecuado para tareas de procesamiento de lenguaje natural, generación de texto o razonamiento general.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente y cumplir con los términos de la licencia. No se indican restricciones adicionales.
- El tamaño del modelo (3.1B parámetros) puede suponer un reto para despliegue en hardware limitado, especialmente en robots con computación embarcada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kaKTEC/2608_static01_01test_GR00T17
- Dataset de entrenamiento: https://huggingface.co/datasets/kaKTEC/2608_static01_01test_20260805_171241
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kaKTEC/2608_static01_01test_20260805_171241
- Proyecto GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- LeRobot (librería de entrenamiento): https://github.com/huggingface/lerobot
- Documentación de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
