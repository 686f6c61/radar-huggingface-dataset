# shamitwell/pi05-so101-v2-fft

## Resumen

El modelo `shamitwell/pi05-so101-v2-fft` es un fine-tuning del modelo base `lerobot/pi05_base`, que a su vez es una implementación del modelo π₀.₅ (Pi05) de Physical Intelligence, un Vision-Language-Action (VLA) diseñado para generalización en entornos abiertos. Este checkpoint concreto ha sido entrenado con el framework LeRobot para controlar un robot tipo `so_follower` (Sober Robotics) con dos cámaras (muñeca y vista superior), especializándose en tareas de manipulación como apilar bloques, mover objetos o colocar piezas en una taza.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y se distribuye bajo licencia Apache-2.0. Su relevancia radica en que demuestra cómo un VLA preentrenado puede adaptarse mediante fine-tuning a un conjunto de tareas específicas con un dataset relativamente pequeño (173 episodios, 42.312 frames), siguiendo el flujo de trabajo de LeRobot. Es un ejemplo práctico de aprendizaje por imitación en robótica con un modelo de última generación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅, de tipo flow-based (según el repositorio openpi) |
| Parametros totales | 4.143.404.816 (≈4,14 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificada en la información) |
| Tipos de cuantizacion | no disponible (solo se mencionan pesos en safetensors) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a procesamiento de lenguaje general) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 9,4 GB) |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, un VLA desarrollado por Physical Intelligence que evoluciona el modelo π₀ original para mejorar la generalización a entornos y situaciones no vistas durante el entrenamiento. Según el repositorio openpi, π₀.₅ es un modelo de flujo (flow-based) que combina visión, lenguaje y acción. La implementación en LeRobot adapta el código de OpenPI.

El fine-tuning se realizó sobre el checkpoint `lerobot/pi05_base` utilizando el dataset `shamitwell/dsouza-so101-data`, que contiene 173 episodios y 42.312 frames a 30 FPS, con 17 tareas distintas (mover cajas, apilar bloques, recoger objetos, etc.). La configuración de entrenamiento incluye 20.000 pasos, batch size de 8, optimizador AdamW con learning rate 2,5e-05 y semilla 1000. Se usó LeRobot versión 0.6.1. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado de imitación.

## Capacidades

- Control de robot manipulador: genera acciones de 6 dimensiones (posición y orientación) a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa tres imágenes RGB (base, muñeca izquierda, muñeca derecha) de 224x224 píxeles y un vector de estado de 32 dimensiones.
- Ejecución de tareas de manipulación específicas: apilar/desapilar bloques, mover objetos, colocar piezas en recipientes, rotar objetos, etc.
- Generalización a variaciones dentro de las tareas entrenadas (posiciones de objetos, iluminación, etc.) gracias al preentrenamiento de π₀.₅.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot (comandos `lerobot-rollout` y `lerobot-train`).
- No se especifican capacidades de tool calling, agentes ni razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar tareas como "pick up the block and place it in the cup" o "move the box on the cup", útiles en líneas de montaje o laboratorios de robótica.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los VLA se adaptan a dominios específicos con pocos datos (173 episodios).
- Desarrollo de robots colaborativos en entornos domésticos o industriales: tareas como "stack the blocks" o "push the block forward" pueden transferirse a escenarios de organización de objetos.
- Benchmarking de políticas robóticas: al estar publicado en HuggingFace con LeRobot, permite comparar el rendimiento de diferentes fine-tunes de π₀.₅ en el mismo robot y tareas.
- Educación y prototipado: estudiantes e investigadores pueden desplegar el modelo en un robot SO-101 para experimentar con VLA sin necesidad de entrenar desde cero.
- Pruebas de robustez en manipulación: las tareas incluyen variaciones como "move the box as far as possible from the gray thing", que exigen razonamiento espacial básico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- Dado el tamaño del modelo (4,14 B parámetros) y su naturaleza de VLA, se requiere una GPU con al menos 16-24 GB de VRAM para inferencia en tiempo real, aunque no hay datos oficiales.
- LeRobot suele ejecutarse en GPUs NVIDIA (por ejemplo, RTX 4090, A100), pero no se confirma para este modelo concreto.
- Opciones de despliegue: el modelo se usa mediante el framework LeRobot, que soporta inferencia en GPU con PyTorch. No se mencionan formatos como GGUF, vLLM u Ollama, ya que no es un modelo de lenguaje puro.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Existen otros fine-tunes de π₀.₅ en HuggingFace para el mismo robot SO-101, como `hyf010124/pi05_so101_pi0824_v2` o `felixmayor/pi05_so101_orange_cube`. Sin embargo, no se dispone de sus especificaciones detalladas (parámetros, contexto, rendimiento) en la información recopilada. Todos comparten la misma arquitectura base y licencia Apache-2.0, pero difieren en el dataset de entrenamiento y las tareas específicas. No se puede realizar una comparación cuantitativa sin datos de evaluación.

## Limitaciones y advertencias

- No se han evaluado formalmente las tasas de éxito en tareas reales; el rendimiento en entornos no vistos es incierto.
- El modelo está entrenado para un robot específico (`so_follower`) y con cámaras concretas; su transferencia a otros robots o configuraciones de sensores requeriría reentrenamiento o adaptación.
- Las tareas están limitadas a las 17 definidas en el dataset; no es un modelo de propósito general para manipulación arbitraria.
- Al ser un VLA, puede presentar alucinaciones visuales o errores de razonamiento espacial en situaciones ambiguas, lo que puede provocar acciones incorrectas.
- No se proporcionan datos sobre sesgos, pero el dataset es reducido y puede no representar la diversidad de entornos reales.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos de los modelos base y datasets asociados.
- Para producción, es necesario implementar mecanismos de seguridad y supervisión humana, dado que se trata de un sistema físico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/shamitwell/pi05-so101-v2-fft
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/shamitwell/dsouza-so101-data
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio openpi (código fuente de π₀.₅): https://github.com/Physical-Intelligence/openpi
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
