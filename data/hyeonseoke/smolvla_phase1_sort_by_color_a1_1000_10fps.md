# HyeonseokE/smolvla_phase1_sort_by_color_A1_1000_10fps

## Resumen

El modelo `HyeonseokE/smolvla_phase1_sort_by_color_A1_1000_10fps` es un fine-tuning del modelo base SmolVLA (`lerobot/smolvla_base`) desarrollado por Hugging Face, entrenado específicamente para la tarea de **clasificación de bloques por color** en un robot SO101. SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) diseñado para ser eficiente y desplegable en hardware de consumo, a diferencia de otros VLA de gran tamaño. Este fine-tune se ha realizado con el framework LeRobot y un dataset propio de 100 episodios a 10 FPS, recopilado mediante la herramienta SCRAPE-IsaacLab en Isaac Sim.

El modelo tiene **450.046.176 parámetros** (unos 450M), un tamaño moderado para un VLA, y se distribuye bajo licencia Apache-2.0. Su propósito es ejecutar políticas de control robótico a partir de imágenes y estado del robot, emitiendo acciones de 6 grados de libertad. Aunque está enfocado a una tarea concreta, sirve como ejemplo de cómo adaptar SmolVLA a tareas específicas de manipulación robótica mediante aprendizaje por imitación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo contiene safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un modelo de lenguaje (probablemente basado en SmolLM2) con un codificador visual y una cabeza de acción. El modelo base (`lerobot/smolvla_base`) fue preentrenado de forma general para tareas de robótica, y este fine-tune se ha ajustado para la tarea de clasificación de bloques por color. El entrenamiento se realizó con el framework LeRobot, usando un dataset de 100 episodios (74.255 frames) a 10 FPS, con la tarea "Sort the blocks onto the matching colored dishes". Se emplearon 58.000 pasos de entrenamiento, batch de 64, optimizador AdamW con learning rate de 1e-4 y seed 1000. No se menciona el uso de RLHF ni DPO; se trata de un entrenamiento de imitación supervisada (behavior cloning). El modelo consume como entrada tres imágenes (256x256), el estado del robot (6 valores) y produce acciones de 6 dimensiones.

## Capacidades

- **Control robótico**: genera acciones de 6 grados de libertad para el robot SO-101, basándose en observaciones visuales y el estado del robot.
- **Percepción visual**: procesa tres imágenes de cámara (256x256) para identificar y clasificar bloques por color.
- **Ejecución de tareas de manipulación**: está entrenado para la tarea específica de ordenar bloques en platos de colores.
- **Integración con LeRobot**: funciona con las herramientas de rollout y entrenamiento de LeRobot, permitiendo despliegue directo en robots SO-101.
- **No soporta tool calling ni razonamiento multi-step**: al ser un modelo de acción, no tiene funciones de lenguaje conversacional ni agentes.

## Casos de uso

- **Automatización de clasificación en almacenes**: el modelo puede ordenar objetos por color en una cinta transportadora, reduciendo la intervención humana.
- **Prototipado de políticas robóticas**: sirve como base para probar algoritmos de imitación en tareas de manipulación con un robot SO-101.
- **Investigación en aprendizaje por refuerzo**: como punto de partida para comparar con otros métodos de control.
- **Entrenamiento de robots en simulación**: el dataset se generó en Isaac Sim, lo que permite validar políticas en simulación antes de trasladarlas a hardware real.
- **Benchmark de eficiencia**: al ser un modelo compacto, puede usarse para evaluar el rendimiento de VLA en hardware de consumo.
- **Educación y experimentación**: permite a estudiantes y desarrolladores aprender a entrenar y desplegar modelos VLA con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna evaluación sobre el robot real, solo indica que no hay resultados.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Dado el tamaño de 450M de parámetros, es probable que pueda ejecutarse en GPU con 6-8 GB de VRAM en cuantización, pero no se proporcionan datos concretos.
- **GPUs recomendadas**: no especificadas. SmolVLA está diseñado para hardware de consumo, por lo que tarjetas como RTX 3060 o superiores podrían ser suficientes, aunque sin confirmación.
- **Opciones de despliegue**: compatible con LeRobot, que soporta inferencia en GPU mediante PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u otros motores.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos VLA como OpenVLA o RT-2. No se ha encontrado información adicional en la búsqueda.

## Limitaciones y advertencias

- **Especialización excesiva**: el modelo solo está entrenado para la tarea de clasificar bloques por color y puede fallar en otras tareas o entornos.
- **Dependencia del robot y cámaras**: requiere el robot SO-101 y las cámaras específicas (top y left_wrist, aunque la tabla de features muestra tres cámaras). No es portátil a otros robots sin reentrenamiento.
- **Falta de evaluación**: no se han publicado resultados reales de éxito en el robot, lo que dificulta conocer su fiabilidad.
- **Dataset limitado**: solo 100 episodios, lo que puede causar sobreajuste a las condiciones de simulación.
- **Idioma**: al ser un modelo de acción, no tiene capacidad de procesamiento de lenguaje natural, aunque el nombre de la tarea está en inglés.
- **Licencia**: Apache-2.0, permite uso comercial y modificación, pero hay que citar la fuente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_phase1_sort_by_color_A1_1000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_sort_by_color_A1_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
