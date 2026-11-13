# RomanSentsov-MIPT/hf_act_recordpolicy0_test1

## Resumen

`hf_act_recordpolicy0_test1` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicada por el usuario RomanSentsov-MIPT en Hugging Face. No es un modelo de lenguaje: es un controlador visomotor entrenado con LeRobot que, a partir del estado articular del robot y de dos cámaras, predice vectores de acción de 29 dimensiones. El repositorio tiene 51.715.741 parámetros y un tamaño de 0,2 GB en safetensors, lo que lo sitúa en la categoría de políticas ligeras ejecutables en tiempo real.

El modelo está entrenado para el robot Unitree G1 de 29 grados de libertad (mano y cintura), con observaciones de `observation.state` de forma `(29,)` y dos cámaras RGB de 480x640 (`cam_head` y `cam_right_wrist`). La tarea registrada en el dataset es "record demonstration", con 45 episodios y 12.681 fotogramas a 30 FPS. Por el nombre del repositorio y la ausencia de resultados de evaluación, parece un artefacto de prueba o validación de pipeline más que una política lista para producción.

Su relevancia es metodológica: ilustra el flujo completo de LeRobot 0.7.1 para entrenar y desplegar políticas ACT, incluyendo los comandos `lerobot-train` y `lerobot-rollout`. Para desarrolladores e investigadores es útil como referencia de formato de datos, configuración de entrenamiento y estructura de model card, no como un modelo con rendimiento demostrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.715.741 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; salida de acciones) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. La arquitectura combina un codificador visual de tipo transformer con un decodificador de acciones que genera secuencias de comandos motores, lo que reduce el error de acumulación típico de las políticas paso a paso. El modelo consume el estado articular de 29 dimensiones y dos imágenes RGB de 480x640, y produce un vector de acción de 29 dimensiones.

El entrenamiento se realizó con LeRobot 0.7.1 durante 20.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset de origen es `RomanSentsov-MIPT/test_dataset1`, con 45 episodios, 12.681 fotogramas a 30 FPS y una única tarea etiquetada como "record demonstration". No se documenta composición adicional del dataset, aumentación de datos ni fases de RLHF/DPO, que no aplican a este tipo de política.

## Capacidades

- Control visomotor de un robot humanoide Unitree G1 de 29 grados de libertad (mano y cintura).
- Predicción de chunks de acción a partir de estado articular e imágenes de cabeza y muñeca derecha.
- Ejecución en bucle cerrado mediante `lerobot-rollout` con estrategia base.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Entrada multimodal: estado propioceptivo (`(29,)`) y dos flujos visuales (`(3, 480, 640)`).
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo de texto.

## Casos de uso

- Validación de pipeline de LeRobot: sirve para comprobar que la instalación, la configuración de cámaras y el robot Unitree G1 funcionan de extremo a extremo antes de entrenar políticas reales.
- Prueba de integración de hardware: ejecutar `lerobot-rollout` con esta política permite verificar puertos, índices de cámara y calibración del robot sin depender de un modelo con rendimiento validado.
- Referencia de formato de datos: el par política-dataset muestra cómo estructurar observaciones, acciones y metadatos para entrenar ACT con LeRobot.
- Plantilla de model card: el repositorio ejemplifica la estructura esperada (inputs/outputs, configuración de entrenamiento, comandos de despliegue) para publicar políticas en el Hub.
- Reproducción de entrenamiento: los hiperparámetros documentados (20.000 pasos, batch 8, AdamW, lr 1e-05) permiten replicar el experimento sobre el mismo dataset.
- Docencia e investigación en imitación: útil para estudiar el comportamiento de ACT con datasets pequeños (45 episodios) y analizar sobreajuste o degradación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros, el peso en precisión nativa ronda los 0,2 GB y la inferencia en FP32 requiere típicamente menos de 2 GB, aunque no hay medición publicada.
- GPU recomendadas: no disponible. Para robótica en tiempo real se suele usar una GPU dedicada con CUDA; el comando de entrenamiento de la model card asume `--policy.device=cuda`.
- Compatibilidad con GPU de consumo: probable en tarjetas con CUDA y al menos 4 GB de VRAM, pero no confirmado por el autor.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política está pensada para operar a 30 FPS (frecuencia del dataset), pero no se publican mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RomanSentsov-MIPT/hf_act_recordpolicy0_test1` | 51,7 M | no aplica | ACT para Unitree G1 | no disponible | Hugging Face |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Imitación visomotora | según repositorio | Hugging Face / docs LeRobot |
| Políticas Diffusion Policy | no disponible | no aplica | Imitación visomotora | según repositorio | Hugging Face / LeRobot |
| Políticas VLA (p. ej. familias tipo RT/OpenVLA) | no disponible | no aplica | Visión-lenguaje-acción | según repositorio | Hugging Face |

No se dispone de datos de rendimiento comparables para este modelo concreto; la comparativa se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real; se desconoce la tasa de éxito de la política.
- El dataset es muy pequeño (45 episodios, 12.681 fotogramas) y con una sola tarea ("record demonstration"), lo que limita la generalización.
- El nombre del repositorio sugiere un artefacto de prueba (`test1`, `recordpolicy0`); no debe tratarse como política de producción.
- La licencia no está especificada, por lo que no se puede confirmar el uso comercial.
- Depende de una configuración hardware concreta: robot Unitree G1 de 29 DoF y cámaras `cam_head` y `cam_right_wrist`; cambiar nombres o índices de cámara rompe la inferencia.
- Riesgo de sobreajuste a posiciones, iluminación y objetos de las demostraciones originales.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento; la tarea se pasa como cadena fija.
- No se documentan sesgos, pero al ser una política de imitación hereda los sesgos y errores de las demostraciones teleoperadas.

## Enlaces

- Hugging Face: https://huggingface.co/RomanSentsov-MIPT/hf_act_recordpolicy0_test1
- Dataset de entrenamiento: https://huggingface.co/datasets/RomanSentsov-MIPT/test_dataset1
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RomanSentsov-MIPT/test_dataset1
