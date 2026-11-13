# Mira2026Mecha/so101_pick_place_act_aug

## Resumen

`so101_pick_place_act_aug` es una política de imitación (imitation learning) para robótica entrenada con el método Action Chunking with Transformers (ACT) sobre el framework LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de control visomotor que consume dos flujos de imagen (cámaras `top` y `front`) más el estado de las articulaciones del robot, y produce comandos de acción de 6 dimensiones. El autor es el usuario de Hugging Face Mira2026Mecha y el repositorio se publicó el 13 de noviembre de 2026.

El modelo resuelve una tarea concreta de manipulación robótica: `pick_place` (coger y colocar un objeto) sobre una plataforma SO-101, un brazo robótico de bajo coste. La arquitectura es un transformer que predice "chunks" de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad del control, tal como se describe en el paper ACT (arXiv:2304.13705).

Su relevancia es práctica y acotada: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento y despliegue en robot real) con un modelo pequeño (51,7 millones de parámetros, 0,2 GB) que cabe en cualquier GPU consumer. No debe confundirse con un modelo fundacional de robótica ni con un LLM; su alcance es una única tarea entrenada con 18 episodios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitación visomotora |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana temporal definida por el chunking de acciones de ACT |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un codificador visual y un decodificador de acciones. En lugar de predecir una acción por paso, el modelo predice un chunk de acciones futuras, lo que mitiga el problema de la varianza en datos teleoperados y permite un control más suave. La política recibe dos imágenes RGB de 3×168×224 píxeles (cámaras `top` y `front`) y un vector de estado de 6 dimensiones, y emite un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `Mira2026Mecha/so101_pick_place`: 18 episodios, 919 fotogramas a 20 FPS, tarea única `pick_place`. La configuración fue de 10.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni aumentación de datos más allá de lo que sugiere el sufijo `_aug` en el nombre del repositorio, que no se detalla en la model card. Tampoco se especifica el número de tokens de entrenamiento (no aplica) ni la composición exacta del dataset más allá de los episodios y fotogramas indicados.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de dos cámaras y el estado de las articulaciones.
- Predicción de chunks de acciones, lo que permite trayectorias más estables que un control paso a paso.
- Ejecución de la tarea `pick_place` sobre la plataforma SO-101 en entornos similares a los del dataset de entrenamiento.
- Integración con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo thinking, visión general, audio ni otras modalidades fuera de las dos cámaras RGB y el estado articular.

## Casos de uso

- Recogida y colocación de objetos en un brazo SO-101: el modelo ejecuta la tarea `pick_place` en un entorno controlado, usando las cámaras `top` y `front` para localizar el objeto y el estado de 6 articulaciones para generar la trayectoria. Es adecuado porque fue entrenado específicamente para esa tarea y esa morfología.
- Prototipado de pipelines de imitación con LeRobot: sirve como referencia reproducible para validar la instalación, el flujo de `lerobot-train` y `lerobot-rollout` antes de entrenar políticas propias con más datos.
- Docencia y demostraciones de aprendizaje por imitación: al ser un modelo pequeño (51,7 M de parámetros, 0,2 GB) y con licencia Apache 2.0, se puede usar en aulas o talleres para mostrar el ciclo completo de teleoperación, entrenamiento y despliegue.
- Pruebas de integración hardware-software: permite verificar la calibración de cámaras, la correspondencia de nombres de observación (`observation.images.top`, `observation.images.front`) y la latencia del bucle de control a 20 FPS.
- Benchmark interno de políticas ACT: sirve como línea base para comparar con políticas entrenadas con más episodios o con aumentación de datos, midiendo tasas de éxito en la misma tarea.
- Automatización de tareas repetitivas de laboratorio: en un entorno con posiciones de objeto similares a las del dataset, puede ejecutar ciclos de recogida y colocación sin intervención humana, siempre con supervisión y parada de emergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros y pesos en safetensors (0,2 GB de repositorio), la inferencia cabe en GPUs con 4-8 GB de VRAM, e incluso en CPU para pruebas lentas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento se recomienda al menos 8-12 GB de VRAM por el batch size 8 y las dos cámaras.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs NVIDIA con soporte CUDA de los últimos años.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch y CUDA; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El dataset se grabó a 20 FPS, lo que sugiere que el bucle de control debe operar en ese orden de magnitud, pero no se publican mediciones de latencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `so101_pick_place_act_aug` (este) | 51,7 M | no aplica | `pick_place` en SO-101 | Apache 2.0 | Hugging Face, LeRobot |
| Políticas ACT genéricas de LeRobot | variable | no aplica | manipulación diversa | Apache 2.0 (típico) | Hugging Face, LeRobot |
| Políticas Diffusion Policy | variable | no aplica | manipulación visomotora | variable | Hugging Face, LeRobot |
| Políticas π0 / OpenVLA (fundacionales) | miles de millones | no aplica | manipulación generalista | variable | Hugging Face, repositorios propios |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad. Los modelos fundacionales de robótica como π0 u OpenVLA no son directamente comparables por tamaño y alcance, pero se incluyen como referencia de categoría.

## Limitaciones y advertencias

- Entrenado con solo 18 episodios y 919 fotogramas: la generalización es muy limitada y probablemente fallará ante cambios de posición, iluminación, objetos o fondo.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito, por lo que no debe asumirse un rendimiento concreto en producción.
- Dependencia de la morfología SO-101 y de los nombres exactos de las cámaras (`top`, `front`); un robot distinto o una configuración de cámara diferente invalidará la política.
- Riesgo de sobreajuste al dataset de teleoperación; el sufijo `_aug` sugiere aumentación de datos, pero no se detalla qué transformaciones se aplicaron.
- Sin capacidades de lenguaje, razonamiento ni tool calling; no es adecuado para tareas fuera de la manipulación visomotora entrenada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la baja cobertura de datos hacen desaconsejable su uso en producción sin validación adicional y supervisión humana.
- No se documentan sesgos, pero al ser un modelo de control físico, los fallos pueden provocar colisiones o daños; se recomienda parada de emergencia y entornos acotados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mira2026Mecha/so101_pick_place_act_aug
- Dataset de entrenamiento: https://huggingface.co/datasets/Mira2026Mecha/so101_pick_place
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Mira2026Mecha/so101_pick_place
