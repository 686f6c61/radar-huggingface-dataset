# Haku-2004/act_k5t_base_15

## Resumen

`Haku-2004/act_k5t_base_15` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705, y distribuida a través de la librería LeRobot de Hugging Face. El modelo aprende a partir de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suele mejorar la tasa de éxito en tareas de manipulación reales. Lo desarrolla el usuario Haku-2004 y se publica bajo licencia Apache 2.0.

Se trata de un modelo específico para un robot de tipo `so_follower` (típicamente un brazo SO-100/SO-101 de bajo coste) con dos cámaras (`front` y `side`) a resolución 480x640 y una sola tarea: "taskbox". El estado de observación es un vector de 6 dimensiones y la salida es una acción también de 6 dimensiones, correspondiente a los grados de libertad del brazo. El checkpoint tiene 51.668.614 parámetros y ocupa aproximadamente 0,2 GB en el repositorio.

Su relevancia es acotada: no es un modelo de lenguaje ni un modelo fundacional general, sino una política de imitación entrenada sobre un dataset muy pequeño (20 episodios, 25.815 fotogramas a 30 FPS) para una tarea concreta. Resulta útil como ejemplo reproducible del flujo de entrenamiento de ACT en LeRobot y como punto de partida para quien quiera replicar o adaptar el pipeline a su propio robot y tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no usa contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que combina un codificador de imágenes (típicamente ResNet preentrenado) con un transformer que fusiona las observaciones visuales y el estado propioceptivo, y un decodificador que genera un chunk de acciones de longitud fija. La predicción por chunks, junto con el truco de "temporal ensembling" en inferencia, suaviza las trayectorias y mitiga el compounding error típico de las políticas paso a paso. La implementación concreta usada aquí es la de LeRobot 0.5.2.

El entrenamiento se realizó sobre el dataset `Haku-2004/k5_20261110_143202`, con 20 episodios y 25.815 fotogramas a 30 FPS para la tarea "taskbox". La configuración reportada es de 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta en la model card el número de tokens, la composición del dataset más allá del recuento de episodios y fotogramas, ni si hubo etapas de RLHF/DPO (no aplicables en este paradigma). Tampoco se detallan innovaciones adicionales más allá de las propias del método ACT.

## Capacidades

- Generación de acciones de control para un brazo robótico `so_follower` a partir de observaciones visuales (cámaras `front` y `side`) y estado propioceptivo de 6 dimensiones.
- Predicción de chunks de acción de 6 dimensiones, con temporal ensembling para suavizar la ejecución.
- Ejecución autónoma de la tarea "taskbox" tras el entrenamiento por imitación.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking".
- No es un modelo de propósito general: está especializado en una única tarea y un único tipo de robot.

## Casos de uso

- Replicación del pipeline de ACT en LeRobot: sirve como referencia reproducible para validar la instalación, el flujo `lerobot-train` y `lerobot-rollout` antes de entrenar políticas propias.
- Automatización de la tarea "taskbox" en un brazo SO-follower: el modelo puede ejecutar la tarea de manipulación para la que fue entrenado usando las dos cámaras configuradas, siempre que el entorno y la iluminación sean similares a los del dataset.
- Base para fine-tuning con datos propios: al ser Apache 2.0 y tener solo ~51,7 M de parámetros, es viable reentrenarlo o ajustarlo con un dataset adicional del mismo robot y tarea.
- Docencia y divulgación en robótica de imitación: permite mostrar de extremo a extremo cómo se graba teleoperación, se entrena una política y se despliega en hardware de bajo coste.
- Pruebas de integración de hardware: útil para verificar cámaras, calibración y puertos del robot antes de invertir en datasets mayores.
- Benchmark interno de infraestructura de inferencia robótica: al ser un modelo pequeño (0,2 GB), permite medir latencia de rollout y throughput de un pipeline LeRobot en una máquina concreta.
- Punto de partida para comparativas de métodos de imitación (ACT frente a Diffusion Policy o VQ-BeT) sobre una misma tarea y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros y pesos en safetensors de ~0,2 GB, cabe holgadamente en GPUs consumer con 4-8 GB. El cuello de botella real es el procesamiento de dos flujos de vídeo a 480x640 y 30 FPS.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA reciente (RTX 3060/4060 en adelante); para entrenamiento, una RTX 4090 o A100 acelera los 50.000 pasos, aunque el modelo es lo bastante pequeño para entrenar en GPUs de gama media.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs NVIDIA modernas e incluso en algunas integradas con suficiente memoria compartida para inferencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) como vía oficial; el checkpoint en safetensors es cargable desde PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del hardware, de las cámaras y de la frecuencia de control del robot (el dataset está grabado a 30 FPS).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k5t_base_15 | 51.668.614 | no aplica | taskbox (so_follower) | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible en la información | no aplica | manipulación diversa | según implementación | paper + código de referencia |
| Políticas LeRobot ACT genéricas | variable | no aplica | tareas varias | Apache 2.0 (mayoría) | Hugging Face |
| Diffusion Policy | no disponible en la información | no aplica | manipulación | según implementación | paper + código |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado con solo 20 episodios y 25.815 fotogramas: la generalización fuera de las condiciones del dataset (posiciones, iluminación, distractores) es previsiblemente limitada.
- Específico para el robot `so_follower` y la tarea "taskbox"; no funciona en otros robots ni tareas sin reentrenamiento.
- Requiere que las cámaras se llamen exactamente `front` y `side` y que la resolución y el encuadre coincidan con los del entrenamiento.
- No hay resultados de evaluación publicados en robot real, por lo que la tasa de éxito es desconocida.
- Riesgo de sobreajuste al dataset pequeño y de fallos ante cambios de entorno no vistos.
- Sesgos: no aplica en el sentido de sesgos lingüísticos, pero sí puede heredar sesgos de las demostraciones de teleoperación (estilos de movimiento, posiciones iniciales).
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia; conviene revisar también las licencias de las dependencias (LeRobot, pesos preentrenados del codificador visual si los hubiera).
- Para producción: validar exhaustivamente en el robot objetivo, definir paradas de seguridad y no asumir un comportamiento robusto fuera del dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5t_base_15
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_20261110_143202
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_20261110_143202
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
