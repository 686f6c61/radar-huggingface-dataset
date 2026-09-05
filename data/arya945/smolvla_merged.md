# Arya945/smolvla_merged

## Resumen

Arya945/smolvla_merged es un modelo de visión-lenguaje-acción (VLA) compacto, basado en SmolVLA, desarrollado por Arya945 (Arya Pangging) a partir del modelo base lerobot/smolvla_base. Está diseñado para tareas de manipulación robótica: recibe imágenes de cámaras y el estado del robot, y genera acciones de control de 6 dimensiones. El modelo tiene 450.046.176 parámetros y está publicado bajo licencia Apache 2.0. Su relevancia radica en que SmolVLA logra un rendimiento competitivo con costes computacionales reducidos, lo que permite desplegarlo en hardware de consumo. Este fine-tuning concreto se entrenó sobre un dataset de 237 episodios y 118.666 frames, con 12 tareas de movimiento de cubos entre placas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Tamano del repo | 0.9 GB |
| Modelo base | lerobot/smolvla_base |

No se incluye la fila de parámetros activos porque el modelo no es de tipo MoE.

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina un codificador de imágenes, un modelo de lenguaje y una cabeza de acción. Este modelo concreto es un fine-tuning de lerobot/smolvla_base, entrenado con el framework LeRobot. El dataset de entrenamiento, denominado "merged", contiene 237 episodios y 118.666 frames a 30 FPS, con 12 tareas consistentes en mover cubos de colores (verde, rojo, gris) entre placas rojas y verdes, incluyendo variantes con posiciones opuestas. La configuración de entrenamiento fue: 20.000 pasos, batch size 4, optimizador AdamW, learning rate 0.0001, seed 1000 y LeRobot 0.6.2. No se menciona el uso de RLHF ni DPO, ya que es un modelo de aprendizaje por imitación.

## Capacidades

- Genera acciones de control de 6 dimensiones a partir de observaciones de estado y tres imágenes de 256x256 píxeles.
- Procesa hasta tres cámaras simultáneamente (camera1, camera2, camera3) y el estado del robot (6 valores).
- Ejecuta tareas de manipulación robótica de pick-and-place: mover cubos de colores entre placas.
- Aprendizaje por imitación: entrenado con demostraciones humanas registradas en el dataset "merged".
- Soporta 12 tareas específicas de manipulación, incluyendo variantes con posiciones opuestas de los cubos.
- Desplegable en hardware de consumo gracias a su tamaño compacto (450M parámetros).

## Casos de uso

- Automatización de pick-and-place en laboratorios: el modelo puede controlar un robot so_follower para mover cubos entre placas, reduciendo la intervención humana en tareas repetitivas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar políticas VLA en robots de bajo coste, gracias a su tamaño reducido.
- Prototipado rápido de tareas robóticas: al ser un fine-tuning de SmolVLA, se puede adaptar a nuevas tareas con pocos datos de demostración usando LeRobot.
- Evaluación de políticas en robots reales: el modelo se integra con LeRobot para realizar rollouts y medir el éxito en entornos físicos.
- Entrenamiento de nuevos datasets: permite fine-tuning adicional sobre el modelo base para personalizar el comportamiento del robot.
- Demostraciones educativas: al ejecutarse en hardware de consumo, es adecuado para cursos de robótica que necesiten un modelo VLA accesible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, aunque el tamaño del repo (0.9 GB) sugiere que los pesos ocupan poco espacio.
- Opciones de despliegue: el modelo se usa mediante el framework LeRobot, con comandos como `lerobot-rollout` para ejecutar la política y `lerobot-train` para entrenar o fine-tunear.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado datos de modelos comparables en la información proporcionada. El modelo base lerobot/smolvla_base es el preentrenado del que deriva este fine-tuning, pero no se dispone de resultados de rendimiento comparativos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica, ya que el modelo genera acciones de control, no texto.
- Limitaciones de contexto o idioma: no aplica, al ser un modelo de robótica sin capacidades de lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos completos.
- Caveats para producción: el modelo está entrenado exclusivamente en tareas de movimiento de cubos entre placas; su rendimiento fuera de este dominio no está evaluado. No hay resultados de evaluación publicados. El modelo requiere que las observaciones de entrada coincidan con la configuración del entrenamiento (3 cámaras de 256x256, estado de 6 dimensiones) y el tipo de robot so_follower.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arya945/smolvla_merged
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
