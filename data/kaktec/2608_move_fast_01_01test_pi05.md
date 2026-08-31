# kaKTEC/2608_move_fast_01_01test_pi05

## Resumen

El modelo `kaKTEC/2608_move_fast_01_01test_pi05` es un fine-tune del modelo base `lerobot/pi05_base`, que a su vez es una implementación en LeRobot del modelo π₀.₅ (Pi05) de Physical Intelligence, un Vision-Language-Action (VLA) diseñado para generalización en mundo abierto. Este checkpoint concreto ha sido entrenado por el usuario kaKTEC sobre un dataset propio de 60 episodios (21.818 frames a 30 FPS) para la tarea "Carrying a Moving White Cube" (transportar un cubo blanco en movimiento), utilizando un robot tipo `so_follower` con dos cámaras (superior y muñeca).

El modelo resuelve el problema de control robótico por imitación: dado un estado del robot (6 dimensiones) y dos imágenes (480x640), produce una acción de 6 dimensiones. Su relevancia radica en que parte de un VLA preentrenado con capacidades de generalización open-world, lo que permite adaptarlo a tareas específicas con relativamente pocos datos. Con 4.143.404.816 parámetros (~4,14 mil millones), es un modelo de tamaño medio para robótica, y su licencia Apache 2.0 facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en transformer, con head de flow matching (según implementación openpi) |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 9,4 GB) |

## Arquitectura y entrenamiento

El modelo base π₀.₅ es un VLA que combina un codificador de visión, un modelo de lenguaje y una cabeza de acción. Según la documentación de Physical Intelligence, π₀.₅ evoluciona π₀ para generalizar a entornos y situaciones nunca vistos durante el entrenamiento, utilizando una técnica denominada "knowledge insulation" (aislamiento de conocimiento) que separa el conocimiento del mundo del control motor. La implementación en LeRobot se adapta del repositorio open-source OpenPI, y en esta versión solo se soporta la cabeza de flow matching para entrenamiento e inferencia.

El fine-tune se realizó con LeRobot versión 0.6.1, con 60.000 pasos de entrenamiento, batch size de 32, optimizador AdamW, learning rate de 2,5e-05 y semilla 1000. El dataset de entrenamiento contiene 60 episodios de la tarea "Carrying a Moving White Cube", con 21.818 frames a 30 FPS, grabados con dos cámaras (top y wrist) y el estado del robot (6 dimensiones). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un entrenamiento de imitación supervisada estándar.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones (posición/orientación del efector) a partir de observaciones de estado y visión.
- Percepción visual multimodal: procesa dos flujos de imagen simultáneos (cámara superior y cámara de muñeca) a 480x640 píxeles.
- Generalización open-world: heredada del modelo base π₀.₅, diseñado para operar en entornos no vistos durante el entrenamiento.
- Tarea específica: especializado en transportar un cubo blanco en movimiento, con seguimiento de objeto dinámico.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo entrenamiento, evaluación y despliegue.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural, al ser un modelo puramente robótico.

## Casos de uso

- Manipulación robótica en líneas de montaje: el modelo puede controlar un brazo robótico para recoger y transportar piezas en movimiento, como en cintas transportadoras, gracias a su entrenamiento con objetos dinámicos.
- Automatización de laboratorios: manejo de muestras o placas que se desplazan sobre una mesa, donde el robot debe seguir y agarrar el objeto con precisión.
- Robótica educativa e investigación: sirve como punto de partida para experimentos de aprendizaje por imitación con el framework LeRobot, permitiendo a investigadores fine-tunear sobre nuevos datasets.
- Pruebas de concepto en logística: clasificación y reubicación de paquetes pequeños en entornos controlados, donde el robot debe adaptarse a posiciones variables.
- Desarrollo de políticas de agarre dinámico: el modelo demuestra la viabilidad de controlar objetos en movimiento, útil para prototipos de robots colaborativos.
- Benchmarking de VLA en tareas de seguimiento: puede utilizarse como referencia para comparar el rendimiento de otros modelos de visión-lenguaje-acción en tareas con objetos móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay datos de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con ~4,14 B parámetros en precisión fp32, el peso ocupa ~16,5 GB; en fp16/bf16 ~8,3 GB. Para inferencia con batch pequeño, se estima un consumo de VRAM entre 10 y 16 GB, dependiendo de la resolución de imagen y el framework.
- GPU recomendadas: no hay especificación oficial. Por el tamaño, una GPU con al menos 16 GB de VRAM (p. ej., RTX 4080/4090, A100 40GB) sería adecuada para inferencia en fp16. Para entrenamiento, se necesitaría más memoria o técnicas de gradiente acumulado.
- Compatibilidad con GPU de consumo: probablemente sí en cuantización fp16/bf16 con GPUs de 16 GB o más, aunque no hay datos confirmados.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que soporta inferencia en PyTorch. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo robótico, no un LLM estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kaKTEC/2608_move_fast_01_01test_pi05 (este) | 4,14 B | no disponible | Manipulación robótica (cubo en movimiento) | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | 4,14 B (estimado) | no disponible | VLA generalista | Apache 2.0 | Hugging Face |
| π₀ (pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista | no disponible | openpi (GitHub) |
| π₀-FAST | no disponible | no disponible | VLA autoregresivo con tokenizador FAST | no disponible | openpi (GitHub) |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a características arquitectónicas y de disponibilidad.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay métricas de éxito en tareas reales, por lo que el rendimiento efectivo es desconocido.
- Especialización limitada: el fine-tune está orientado a una única tarea ("Carrying a Moving White Cube") y puede no generalizar a otras tareas sin reentrenamiento.
- Dependencia del hardware: requiere un robot `so_follower` y dos cámaras específicas (top y wrist) con las mismas características que el dataset de entrenamiento.
- Riesgo de sobreajuste: con solo 60 episodios, el modelo puede memorizar el dataset y fallar ante variaciones de iluminación, posición de cámara o texturas del objeto.
- Sin capacidades de lenguaje: a diferencia de otros VLA, este checkpoint no procesa instrucciones en lenguaje natural; la tarea está fijada en el entrenamiento.
- Sesgos del dataset: el dataset fue grabado por un único operador y en un entorno concreto; puede haber sesgos en la distribución de poses y movimientos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset asociado deben cumplir sus respectivas licencias (el dataset no especifica licencia en la información disponible).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaKTEC/2608_move_fast_01_01test_pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/kaKTEC/2608_move_fast_01_01test_20260820_140812
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kaKTEC/2608_move_fast_01_01test_20260820_140812
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio openpi (GitHub): https://github.com/Physical-Intelligence/openpi
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
