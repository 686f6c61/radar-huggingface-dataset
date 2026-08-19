# nchristo-synaptics/QVGA_pick_place_v7

## Resumen

El modelo `nchristo-synaptics/QVGA_pick_place_v7` es una política de robótica basada en el método **Action Chunking with Transformers (ACT)**, entrenada con la librería **LeRobot** de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación robótica. El modelo ha sido desarrollado por el usuario `nchristo-synaptics` y está diseñado para ejecutar la tarea concreta de "colocar un cubo negro en un cuenco rojo" sobre un robot tipo `so_follower` (probablemente un brazo robótico de bajo coste).

Con aproximadamente 62,85 millones de parámetros, este modelo es relativamente compacto y está pensado para ejecutarse en tiempo real en hardware modesto. Utiliza dos cámaras (muñeca y superior) para percibir el entorno y genera comandos de acción de 6 dimensiones (posición y orientación del efector final). La relevancia de este modelo radica en su naturaleza de ejemplo práctico del flujo de trabajo de LeRobot: desde la recopilación de datos teleoperados hasta el entrenamiento y despliegue de una política de imitación, todo bajo una licencia Apache 2.0 que permite uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 62.854.726 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (política de robótica, sin contexto de lenguaje; la ventana de observación depende de la configuración de LeRobot) |
| Tipos de cuantizacion | no disponible (no se han publicado versiones cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura **ACT** (Action Chunking with Transformers), descrita en el paper [arXiv:2304.13705](https://arxiv.org/abs/2304.13705). ACT combina un codificador de visión (para procesar las imágenes de las cámaras) con un transformador que predice un *chunk* de acciones futuras (una secuencia de varios pasos de control) en lugar de una sola acción. Esto reduce la acumulación de errores y mejora la suavidad del movimiento en comparación con políticas que generan acciones paso a paso.

El entrenamiento se realizó mediante **aprendizaje por imitación** sobre un dataset de demostraciones teleoperadas (`nchristo-synaptics/QVGA_pick_place_demo_v7`), que contiene 102 episodios y 34.724 frames a 30 FPS. La configuración de entrenamiento incluye 200.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000, usando la versión 0.6.2 de LeRobot. No se menciona el uso de RLHF, DPO u otras técnicas de refinamiento; es un entrenamiento puramente de imitación supervisada.

## Capacidades

- **Control robótico para pick-and-place**: el modelo está entrenado específicamente para la tarea de recoger un cubo negro y colocarlo en un cuenco rojo.
- **Percepción visual multimodal**: procesa imágenes de dos cámaras (muñeca y superior) con resolución de 240x320 píxeles y 3 canales RGB.
- **Predicción de acciones de 6 dimensiones**: genera comandos de control (posición y orientación) para el efector final del robot.
- **Ejecución en tiempo real**: al ser un modelo compacto (62,8M parámetros), puede ejecutarse en hardware de bajo coste, como el robot `so_follower`.
- **Integración con LeRobot**: compatible con el ecosistema de Hugging Face para robótica, incluyendo scripts de entrenamiento y despliegue.
- **No incluye capacidades de lenguaje natural, tool calling ni razonamiento simbólico**: es un modelo puramente de control motor.

## Casos de uso

- **Automatización de tareas repetitivas en laboratorios**: el modelo puede integrarse en un brazo robótico para clasificar o mover objetos pequeños en entornos controlados, reduciendo la intervención humana.
- **Prototipado de políticas de imitación**: sirve como ejemplo de referencia para desarrolladores que quieren entrenar sus propias políticas con LeRobot, ya que muestra el flujo completo desde dataset hasta despliegue.
- **Investigación en aprendizaje por imitación**: el modelo y su dataset asociado permiten estudiar el rendimiento de ACT en tareas de manipulación con dos cámaras y acción de 6 grados de libertad.
- **Demostraciones educativas**: es adecuado para cursos de robótica o IA aplicada, donde se puede ejecutar la política en un robot real o simulado para ilustrar conceptos de control y visión.
- **Pruebas de robustez en entornos cambiantes**: aunque no se han publicado evaluaciones, el modelo puede utilizarse para medir la generalización de ACT ante variaciones de iluminación, posición de objetos o distracciones.
- **Desarrollo de sistemas de pick-and-place en logística**: a pequeña escala, el modelo podría adaptarse (con reentrenamiento) para tareas de clasificación de piezas en cintas transportadoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "no se han proporcionado resultados de evaluación para esta política". No se dispone de métricas como tasa de éxito en pruebas reales, ni comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- **VRAM estimada para inferencia**: dado que el modelo tiene ~62,8M de parámetros, en float32 ocuparía aproximadamente 251 MB solo en pesos. Sin embargo, al procesar imágenes (dos cámaras de 240x320), la memoria total durante la inferencia puede superar los 1-2 GB dependiendo del batch y de las activaciones intermedias. Se recomienda al menos 4 GB de VRAM para margen.
- **GPU recomendadas**: cualquier GPU moderna con soporte CUDA, como NVIDIA GTX 1060 (6 GB), RTX 2060, RTX 3060, o superiores. También puede ejecutarse en CPU para pruebas lentas, aunque la inferencia en tiempo real requeriría una GPU.
- **Compatibilidad con GPUs de consumo**: sí, cabe en GPUs de gama media y baja, siempre que tengan al menos 4-6 GB de VRAM.
- **Opciones de despliegue**: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y ejecutan la política en el robot. También se puede integrar con ROS u otros frameworks, aunque no se documenta explícitamente.
- **Latencia y throughput**: no se han publicado datos. Dado el tamaño del modelo y la resolución de imagen, se espera una inferencia en tiempo real (30 FPS o más) en una GPU moderna, pero es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos entrenados con la misma configuración o tarea. Existen otros repositorios del mismo autor (por ejemplo, `QVGA_pick_place_demo_v4` y `v5`) que son datasets, no modelos. En el ecosistema LeRobot hay múltiples políticas ACT para diferentes robots y tareas, pero sin datos comparativos de rendimiento no es posible realizar una comparación objetiva. Se indica por tanto: **no disponible**.

## Limitaciones y advertencias

- **Especialización limitada**: el modelo está entrenado únicamente para la tarea "colocar cubo negro en cuenco rojo" con un robot específico y configuraciones de cámara concretas. No generalizará a otras tareas, objetos o entornos sin reentrenamiento.
- **Riesgo de sobreajuste**: con solo 102 episodios de demostración, el modelo puede memorizar las trayectorias del dataset y fallar ante variaciones sutiles (posición inicial, iluminación, distracciones).
- **Sin evaluación publicada**: no hay datos de tasa de éxito en pruebas reales, por lo que su rendimiento efectivo es desconocido.
- **Dependencia de la calibración del robot**: el modelo asume que el robot `so_follower` está correctamente calibrado y que las cámaras están colocadas como en el entrenamiento. Cualquier cambio en la cinemática o en la posición de las cámaras puede degradar el rendimiento.
- **Sin soporte de lenguaje natural**: no se puede interactuar con el modelo mediante texto; es un sistema de control de bajo nivel.
- **Licencia Apache 2.0**: permite uso comercial, pero el usuario debe cumplir con las condiciones de atribución y redistribución. No hay restricciones adicionales conocidas.
- **Fecha de creación futura**: el modelo fue creado en agosto de 2026 (según HuggingFace), lo que sugiere que podría ser un artefacto de prueba o un proyecto personal, no un modelo de producción validado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nchristo-synaptics/QVGA_pick_place_v7)
- [Dataset de entrenamiento](https://huggingface.co/datasets/nchristo-synaptics/QVGA_pick_place_demo_v7)
- [Paper de ACT (arXiv:2304.13705)](https://arxiv.org/abs/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Perfil de GitHub del autor](https://github.com/nchristo-synaptics)
