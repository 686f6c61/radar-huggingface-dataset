# sadiyaaa/act_pick_scissor_small_test

## Resumen

Este modelo es una política de robótica basada en el método Action Chunking with Transformers (ACT), desarrollada con la librería LeRobot de Hugging Face. Está entrenada para la tarea concreta de "recoger las tijeras y ponerlas en la cesta amarilla" sobre un robot SO-4 con dos cámaras (lateral y de muñeca). El modelo consume imágenes de 480x640 píxeles y el estado del robot (6 dimensiones) para predecir acciones de control de 6 grados de libertad, empleando una arquitectura transformer que predice secuencias de acciones (action chunks) en lugar de pasos individuales.

Con solo 17,19 millones de parámetros, es un modelo ligero diseñado para inferencia en tiempo real en robots físicos. Su relevancia radica en demostrar el uso práctico de ACT, un método de aprendizaje por imitación que logra altas tasas de éxito en manipulación robótica, dentro del ecosistema LeRobot. El repositorio incluye los pesos en formato safetensors y la configuración necesaria para ejecutar la política con el CLI de LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 17.194.246 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con codificadores de visión y estado. La política predice un chunk de acciones (una secuencia de pasos futuros) a partir de las observaciones actuales, lo que reduce la acumulación de errores en comparación con la predicción paso a paso. En este modelo concreto, las entradas son dos imágenes (cámara lateral y cámara de muñeca) con resolución 480x640 y un vector de estado de 6 dimensiones; la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con el dataset `pick_scissor_InternV2`, compuesto por 50 episodios de teleoperación con un total de 21.896 frames a 30 FPS. Se empleó el optimizador AdamW con una tasa de aprendizaje de 1e-5, tamaño de lote de 8 y 1.000 pasos de entrenamiento, con semilla fija 1000 y la versión 0.6.2 de LeRobot. No se reporta el uso de técnicas de refuerzo (RLHF/DPO) ni de datos adicionales más allá del dataset mencionado.

## Capacidades

- Generación de acciones de control para robot manipulador de 6 grados de libertad (posición y orientación del efector).
- Percepción visual multimodal con dos cámaras (lateral y de muñeca) que proporcionan imágenes de 480x640 píxeles.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, con predicción de secuencias de acciones (action chunking).
- Ejecución de tareas de manipulación de objetos en entornos controlados, específicamente la tarea de recoger tijeras y depositarlas en una cesta.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots SO-4.
- No soporta tool calling, razonamiento multi-paso, lenguaje natural ni capacidades de visión general fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de manipulación en laboratorios: el modelo puede ejecutar la tarea de recogida y colocación de objetos en posiciones determinadas, útil en entornos de investigación robótica.
- Benchmark de aprendizaje por imitación: sirve como referencia para evaluar el rendimiento de ACT en un robot SO-4 con dos cámaras, facilitando comparaciones con otras políticas.
- Desarrollo de habilidades robóticas en entornos de producción: con la configuración de LeRobot, puede integrarse en líneas de montaje que requieran manipulación precisa de objetos pequeños.
- Investigación en generalización de políticas: al estar entrenado con 50 episodios, es un caso de estudio para analizar la eficiencia de muestras del método ACT.
- Base para aprendizaje de nuevas tareas: se puede partir de esta política preentrenada para transferir conocimiento a tareas similares de recogida y colocación mediante fine-tuning.
- Demostración de despliegue con LeRobot: el repositorio incluye comandos CLI completos para ejecutar la política en un robot físico, útil para desarrolladores que aprenden a usar la librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se proporcionan resultados de evaluación en el robot real.

## Requisitos de hardware

- VRAM estimada: con 17 millones de parámetros y entrada de imágenes de 480x640, se estima un consumo inferior a 2 GB de VRAM en inferencia con precisión float32; el modelo cabe en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) para ejecución con CUDA y PyTorch.
- Puede ejecutarse en GPU de consumo (RTX serie 30/40) sin problemas; no se requiere hardware de datacenter.
- Opciones de despliegue: LeRobot proporciona CLI de rollout (`lerobot-rollout`) para ejecutar la política en un robot real. No se mencionan compatibilidades con vLLM, llama.cpp, u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible; depende del hardware y del robot físico.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada otros modelos de robótica con la misma arquitectura (ACT) y tarea específica para comparar directamente. Se recomienda consultar el catálogo de LeRobot para políticas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha evaluado el modelo en diferentes entornos, iluminaciones o variaciones de objetos; su comportamiento puede degradarse fuera de las condiciones de entrenamiento.
- Riesgo de alucinación: no aplica, al ser un modelo de control robótico y no un generador de texto.
- Limitaciones de contexto: el modelo solo es válido para la tarea específica de recoger tijeras y colocarlas en la cesta amarilla; no generaliza a otras tareas sin reentrenamiento.
- Restricciones de licencia: licencia Apache-2.0, que permite uso comercial con atribución y sin garantía.
- Caveat para producción: el modelo requiere un robot SO-4 físico y un entorno controlado con las cámaras configuradas (lateral y muñeca) con las mismas dimensiones de imagen (480x640). No se han reportado resultados de evaluación en el robot, por lo que el rendimiento real no está validado.
- Riesgo de seguridad: como cualquier política robótica, debe probarse en entornos seguros antes de cualquier uso en producción, dado que no hay garantías de comportamiento en condiciones inesperadas.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/sadiyaaa/act_pick_scissor_small_test
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Guía de despliegue en robots: https://huggingface.co/docs/lerobot/main/en/rollout
- Dataset de entrenamiento: https://huggingface.co/datasets/pick_scissor_InternV2
