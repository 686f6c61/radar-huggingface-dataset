# kaKTEC/2608_move_slow_01_02test_pi05

## Resumen

Este modelo es una política robótica de tipo Vision-Language-Action (VLA) obtenida mediante fine-tuning del modelo base `lerobot/pi05_base` (π₀.₅) de Physical Intelligence, utilizando la librería LeRobot de Hugging Face. El fine-tuning se ha realizado sobre un dataset propio de 60 episodios (28.665 fotogramas a 30 FPS) para la tarea concreta de "transportar un cubo blanco en movimiento" con un robot tipo `so_follower` equipado con cámaras superior y de muñeca.

El modelo consume observaciones de estado (6 dimensiones) y dos imágenes RGB de 480×640 píxeles, y produce acciones de 6 dimensiones. Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones), es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo con cuantización adecuada. Su relevancia radica en demostrar el flujo de fine-tuning de un VLA de última generación para tareas robóticas específicas, siguiendo el ecosistema LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en π₀.₅ (no se especifican detalles internos) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un VLA (Vision-Language-Action) que combina percepción visual, información de estado del robot y genera acciones de control. Se trata de un fine-tuning del modelo base `lerobot/pi05_base` de Physical Intelligence, que a su vez es una evolución del modelo π₀. La implementación en LeRobot está adaptada del repositorio open-source OpenPI.

El entrenamiento se realizó con el dataset `kaKTEC/2608_move_slow_01_02test_20260820_150254`, compuesto por 60 episodios y 28.665 fotogramas a 30 FPS, con la tarea "Carrying a Moving White Cube". La configuración de entrenamiento incluye 60.000 pasos, batch size de 32, optimizador AdamW, learning rate de 2,5e-05 y semilla 1000, utilizando LeRobot versión 0.6.1. No se menciona el uso de técnicas como RLHF o DPO; se trata de aprendizaje por imitación supervisado.

## Capacidades

- Control de robot manipulador: genera acciones de 6 grados de libertad a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa dos cámaras RGB (superior y muñeca) de 480×640 píxeles junto con el estado propioceptivo del robot.
- Especialización en tarea concreta: entrenado específicamente para transportar un cubo blanco en movimiento, lo que implica seguimiento visual y coordinación de movimiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento e inferencia de LeRobot, incluyendo comandos CLI como `lerobot-rollout` y `lerobot-train`.
- No incluye capacidades de lenguaje natural, tool calling ni razonamiento simbólico; es una política puramente motora.

## Casos de uso

- Investigación en robótica de manipulación: permite estudiar el fine-tuning de VLA para tareas específicas, sirviendo como punto de partida para experimentos con otros objetos o entornos.
- Desarrollo de políticas de seguimiento de objetos: el modelo está entrenado para seguir un cubo en movimiento, lo que puede adaptarse a tareas de pick-and-place dinámico o ensamblaje en líneas de producción.
- Benchmarking de algoritmos de imitación: al estar publicado con dataset y configuración de entrenamiento, puede usarse para comparar métodos de aprendizaje por imitación en robótica.
- Prototipado rápido de controladores robóticos: con LeRobot, se puede desplegar en un robot `so_follower` real mediante `lerobot-rollout` para validar la tarea en pocos minutos.
- Educación y formación: sirve como ejemplo didáctico de cómo entrenar y evaluar un VLA de última generación con herramientas open-source.
- Base para fine-tuning adicional: dado que se distribuye con licencia Apache-2.0, puede reutilizarse como punto de partida para tareas similares con nuevos datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM, latencia o throughput para este modelo concreto.
- Con 4.143 millones de parámetros, una estimación orientativa en FP16 requeriría aproximadamente 8,3 GB de VRAM solo para los pesos, más memoria para activaciones y optimizador durante el entrenamiento. Para inferencia, una GPU con 8-12 GB podría ser suficiente con cuantización, aunque no se han publicado configuraciones oficiales.
- El despliegue se realiza mediante LeRobot, que soporta inferencia en GPU (CUDA) y puede ejecutarse en GPUs de consumo como RTX 3090, RTX 4090 o superiores.
- Para entrenamiento, se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090, A100) dado el tamaño del modelo y el batch size de 32.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje; la vía estándar es el pipeline de LeRobot.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de robótica (como GR00T de NVIDIA u otros VLA) en términos de rendimiento, ya que no hay benchmarks publicados. Se puede indicar que el modelo base `lerobot/pi05_base` es la referencia principal, y que este fine-tuning es una variante específica para una tarea concreta.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para la tarea "Carrying a Moving White Cube" y no generaliza a otras tareas u objetos sin un nuevo fine-tuning.
- Dependencia del hardware: requiere el robot tipo `so_follower` y las cámaras específicas (top y wrist) con las mismas posiciones y calibración; cualquier cambio en la configuración puede degradar el rendimiento.
- Sin evaluación reportada: no hay datos de éxito en robot real, por lo que su fiabilidad en producción no está verificada.
- Riesgo de sobreajuste: el dataset es pequeño (60 episodios) y puede no cubrir variaciones de iluminación, fondo o posición del objeto.
- Sin capacidades de lenguaje: a pesar de ser un VLA, no procesa instrucciones en lenguaje natural; la tarea está fijada en el entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales; se recomienda revisar las licencias de los componentes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kaKTEC/2608_move_slow_01_02test_pi05)
- [Dataset de entrenamiento](https://huggingface.co/datasets/kaKTEC/2608_move_slow_01_02test_20260820_150254)
- [Modelo base lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Blog de π₀.₅ de Physical Intelligence](https://www.physicalintelligence.company/blog/pi05)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de pi05 en LeRobot](https://huggingface.co/docs/lerobot/main/en/pi05)
