# Ishaan-codes11/act_move_blue_cube_red_area

## Resumen

El modelo `act_move_blue_cube_red_area` es una política de control robótico entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers), desarrollado por Ishaan Iyer y publicado en Hugging Face. El modelo resuelve la tarea de mover un cubo azul a un área roja en un entorno de manipulación robótica, utilizando un robot de tipo SO-100 follower con dos cámaras (aérea y de muñeca). Es relevante porque demuestra el uso de LeRobot, la librería de Hugging Face para robótica, para entrenar políticas de control de bajo nivel a partir de datos de teleoperación.

Arquitectónicamente, ACT es un transformer que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en tareas de manipulación. El modelo cuenta con aproximadamente 51,7 millones de parámetros y se distribuye en formato safetensors. No se trata de un modelo de lenguaje: sus entradas son imágenes (640x480) y un vector de estado de 6 dimensiones, y su salida es un vector de acción de 6 dimensiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión-robot, no texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers, propuesto en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). En lugar de predecir una acción por paso de tiempo, el modelo predice un bloque de acciones (chunk) que abarca varios pasos futuros, lo que reduce el error acumulativo y mejora la coherencia del movimiento. La arquitectura emplea un encoder de visión para procesar las imágenes de las cámaras `overhead` y `wrist` (cada una de 640x480), junto con un encoder del estado del robot (6 dimensiones), y un decoder que produce las acciones de control.

El entrenamiento se realizó con LeRobot v0.6.2 sobre un dataset de 49 episodios teleoperados (14.730 frames a 30 FPS) para la tarea específica de mover el cubo azul al área roja. Se usó el optimizador AdamW con una tasa de aprendizaje de 1e-5, batch size de 16, y se ejecutaron 30.000 pasos de entrenamiento. No se aplicó RLHF ni DPO; el aprendizaje es puramente por imitación supervisada.

## Capacidades

- Generación de acciones de control robótico para manipulación de objetos (posición y orientación del efector, 6 dimensiones).
- Percepción visual multimodal: procesa simultáneamente imágenes de cámara aérea y de muñeca.
- Control de robot SO-300 follower (compatible con LeRobot).
- Ejecución de tareas de pick-and-place y manipulación de objetos en entornos controlados.
- Inferencia en tiempo real con una política de bajo nivel (no requiere planificación de alto nivel).
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede ejecutar la tarea de mover objetos a posiciones objetivo, útil para investigación en aprendizaje por imitación.
- Automatización de procesos de clasificación: puede adaptarse para mover piezas a zonas específicas en líneas de montaje controladas.
- Desarrollo de políticas de control para robots SO-300: sirve como punto de partida para entrenar variantes con otras tareas de manipulación.
- Evaluación de algoritmos de aprendizaje por imitación: permite comparar ACT con otros métodos (por ejemplo, Diffusion Policy) en un entorno estándar.
- Entrenamiento de datos de teleoperación: puede ser reentrenado con nuevos datasets para transferir habilidades a otras tareas.
- Demostración de LeRobot en producción: útil para validar el flujo completo de LeRobot (captura de datos, entrenamiento, rollout) en un robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito ni métricas de evaluación en el robot real. Se recomienda evaluar el modelo en el entorno físico antes de uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero dado que el modelo tiene 51,7 millones de parámetros y procesa dos imágenes de 640x480, se estima que cabe en GPU de consumo con al menos 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 3070) en FP16.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB de VRAM (RTX 2080, RTX 3060, RTX 4090, A100, H100). La inferencia es liviana en comparación con LLMs.
- Compatibilidad con hardware de consumo: sí, una RTX 3060 o similar es suficiente para ejecutar el modelo en tiempo real (30 FPS).
- Opciones de despliegue: LeRobot (librería oficial), con comandos `lerobot-rollout` y `lerobot-train`. No es compatible con vLLM, llama.cpp ni Ollama, ya que es un modelo de robótica, no de lenguaje.
- Latencia y throughput: no disponible. Se espera inferencia en tiempo real en GPU moderna, pero depende del robot y la configuración de cámaras.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada (mismo tamaño, misma tarea o misma arquitectura). Se recomienda consultar la documentación de LeRobot para comparar con otras políticas entrenadas con el mismo pipeline.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: la cap card indica que no hay datos de éxito en el robot real, por lo que no se puede garantizar su rendimiento.
- Dataset de entrenamiento pequeño: solo 49 episodios, lo que puede limitar la generalización a variaciones de posición, iluminación o distracciones.
- Dependencia del hardware físico: el modelo está entrenado para un robot SO-300 específico y cámaras concretas; no es transferible a otros robots sin reentrenamiento.
- Tarea específica: solo funciona para la tarea "Mover el cubo azul al área roja"; no es un modelo de propósito general.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, tool calling, ni multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el autor no proporciona garantías ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ishaan-codes11/act_move_blue_cube_red_area
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Ishaan-codes11/move_blue_cube_red_area
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
