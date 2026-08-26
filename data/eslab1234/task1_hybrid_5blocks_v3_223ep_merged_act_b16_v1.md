# eslab1234/task1_hybrid_5blocks_v3_223ep_merged_act_b16_v1

## Resumen

Este modelo es una política robótica entrenada con el método ACT (Action Chunking with Transformers) mediante la librería LeRobot. Fue desarrollada por el usuario eslab1234 para una tarea concreta de manipulación: recoger cinco bloques de colores (rojo, amarillo, madera, verde y azul) en secuencia y colocarlos en una zona objetivo. El modelo integra dos cámaras RGB (vista superior y vista de la muñeca) junto con el estado del robot para predecir acciones de control de seis dimensiones.

ACT, propuesto por Zhao et al. en el artículo arxiv 2304.13705, es un método de aprendizaje por imitación que predice bloques de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. El modelo cuenta con aproximadamente 51,7 millones de parámetros y fue entrenado con 223 episodios teleoperados (303.283 frames a 30 FPS) en un robot tipo so_follower. La relevancia de este modelo radica en demostrar la viabilidad de ACT para tareas de pick-and-place multicanal con datos de teleoperación relativamente reducidos, dentro del ecosistema LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no se especifica el action chunk) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica (modelo de robotica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) se basa en un transformer con un CVAE (Conditional Variational Autoencoder). El encoder toma las observaciones —imágenes de dos cámaras (top y wrist) y el estado del robot (6 dimensiones)— junto con el futuro bloque de acciones, y el decoder genera de forma autorregresiva las acciones de control. Esta arquitectura permite que la política prediga secuencias de acciones completas, reduciendo la acumulación de errores típica de las políticas de un solo paso y mejorando la suavidad del movimiento.

El entrenamiento se realizó con el dataset eslab1234/task1_hybrid_5blocks_v3_223ep_merged, que contiene 223 episodios y 303.283 frames capturados a 30 FPS con un robot so_follower. La configuración de entrenamiento incluye 50.000 pasos con batch size 16, optimizador AdamW, learning rate de 1e-05 y semilla 1000, utilizando la versión 0.5.2 de LeRobot. No se menciona el uso de RLHF ni DPO; el método es puramente de imitación supervisada.

## Capacidades

- Manipulación robótica de precisión: pick-and-place de bloques de colores en una secuencia determinada.
- Percepción visual multimodal: integra dos cámaras RGB (top y wrist) con resolución 480x640.
- Control de robot en 6 grados de libertad: genera acciones de posición y orientación para el efector final.
- Predicción de action chunks: produce secuencias de acciones de corta duración que mejoran la estabilidad del control.
- Ejecución en tiempo real: el modelo está diseñado para despliegue en bucle de control cerrado sobre un robot so_follower.

## Casos de uso

1. Automatización de clasificación de piezas en línea de montaje: el modelo puede recoger bloques de colores en un orden fijo y depositarlos en zonas determinadas, lo que resulta útil para tareas de ordenamiento de componentes industriales donde la secuencia de manipulación es conocida.

2. Prototipado de soluciones con aprendizaje por imitación: sirve como referencia práctica para equipos que desean evaluar ACT con datos teleoperados, ya que la model card incluye la configuración completa de entrenamiento y despliegue.

3. Benchmark de métodos de imitación en robotica: puede utilizarse como caso de comparación para evaluar ACT frente a diffusion policies u otros métodos de control robótico en tareas de pick-and-place multicanal.

4. Investigación en generalización de políticas robóticas: los investigadores pueden utilizar este modelo para estudiar cómo los cambios en la posición de las cámaras o la iluminación afectan al rendimiento de la política.

5. Formación en robótica con LeRobot: el modelo y su dataset asociado son un recurso didáctico para aprender a entrenar y desplegar políticas ACT con el ecosistema LeRobot.

6. Desarrollo de sistemas de teleoperación asistida: el modelo puede ejecutar el robot de forma autónoma tras una fase de demostración humana, reduciendo la carga del operador en tareas repetitivas.

7. Evaluación de robustez ante variaciones del entorno: al estar entrenado con 223 episodios, se puede probar el rendimiento del modelo ante ligeras variaciones de posición de los bloques o del fondo.

## Benchmarks y rendimiento

No se han publicado resultados de evaluación en la información disponible. La model card indica que no hay resultados de evaluación para esta política, por lo que se desconoce la tasa de éxito en el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 millones de parámetros, lo que supone aproximadamente 103 MB en FP16 y 207 MB en FP32. Cabe en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (GTX 1060 o superior, RTX 3060, RTX 4090, A100). Para el entrenamiento se recomienda una GPU con al menos 8 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, el modelo se puede ejecutar en GPU consumer sin problema.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y de entrenamiento (`lerobot-train`). También puede integrarse en pipelines de PyTorch personalizados.
- Latencia y throughput: no se dispone de datos de latencia específicos para esta política.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia |
|---|---|---|---|
| eslab1234/task1_hybrid_5blocks_v3_223ep_merged_act_b16_v1 | 51,7 M | Pick-and-place de 5 bloques | Apache 2.0 |
