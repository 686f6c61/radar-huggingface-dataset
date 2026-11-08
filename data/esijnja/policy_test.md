# esijnja/policy_test

## Resumen

`esijnja/policy_test` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario esijnja en Hugging Face mediante la librería LeRobot de Hugging Face, y está asociado al pipeline `robotics`. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular y una imagen de cámara cenital para producir comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros (dato real extraído de los pesos en safetensors) y un repositorio de 0,2 GB. Está entrenado para una única tarea concreta: "put the orange brick in a yellow form" (colocar el ladrillo naranja en una forma amarilla), sobre un robot de tipo `so_follower` (SO-100/101 follower de LeRobot) con una sola cámara llamada `top`.

Su relevancia es la de un artefacto de demostración o prueba de concepto dentro del ecosistema LeRobot: el dataset de entrenamiento contiene solo 5 episodios y 8.974 fotogramas a 30 FPS, y el autor no ha publicado resultados de evaluación en robot real. Sirve como ejemplo reproducible del flujo de entrenamiento y despliegue de ACT, no como política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación por paso, no contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo de robótica sin capacidades lingüísticas; la tarea se especifica como cadena de texto) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice *chunks* de acciones (secuencias cortas de comandos) en lugar de una acción por paso. Esto reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. La entrada del modelo combina el estado de las articulaciones (`observation.state`, vector de 6 dimensiones) con una imagen RGB de 3×360×640 procedente de la cámara `top`, procesada por un codificador visual; la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `esijnja/hackaton26_test_20261107_182356`: 5 episodios, 8.974 fotogramas a 30 FPS, una única tarea de manipulación. La configuración fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta uso de RLHF, DPO ni datos adicionales; es aprendizaje por imitación puro a partir de teleoperación.

## Capacidades

- Control visomotor de un robot `so_follower` a partir de una imagen cenital y el estado articular.
- Predicción de chunks de acciones de 6 dimensiones para manipulación de objetos.
- Ejecución de una tarea concreta de pick-and-place: colocar un ladrillo naranja en una forma amarilla.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo de pensamiento.

## Casos de uso

- Reproducción del flujo de entrenamiento de ACT: sirve como referencia práctica para grabar un dataset pequeño con LeRobot, lanzar `lerobot-train` con `--policy.type=act` y desplegar la política resultante.
- Prueba de concepto de pick-and-place en laboratorio: con 5 episodios y una sola cámara, es adecuado para validar la cadena hardware-software (SO-100/101, cámara USB, calibración) antes de escalar a datasets mayores.
- Docencia y talleres de robótica: el modelo y su dataset son pequeños (0,2 GB) y fáciles de inspeccionar, lo que facilita explicar aprendizaje por imitación y chunking de acciones.
- Base para *fine-tuning* en tareas similares: se puede partir de estos pesos y reentrenar con un dataset propio del mismo robot y cámara para una tarea de manipulación parecida.
- Evaluación comparativa de métodos de imitación: útil como baseline ACT frente a otros métodos de LeRobot (por ejemplo, diffusion policy) en la misma tarea y robot.
- Demostración de despliegue con `lerobot-rollout`: permite ensayar la inferencia en tiempo real con `--strategy.type=base` y medir latencia y estabilidad del controlador en el robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros los pesos ocupan aproximadamente 0,1 GB en FP32 y unos 0,05 GB en FP16, por lo que la política cabe holgadamente en cualquier GPU consumer reciente.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; una RTX 3060 o superior es más que suficiente para inferencia. Para entrenamiento con batch size 8 y 20.000 pasos, una RTX 4090 o A100 acelera notablemente el proceso, aunque no se documentan tiempos.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer con al menos 4 GB de VRAM, incluidas GTX 1650 o superiores.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=esijnja/policy_test`), con `--policy.device=cuda` para entrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control se ejecuta a 30 FPS según la tasa del dataset, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| esijnja/policy_test (ACT) | 51,7 M | estado 6D + imagen 3×360×640 | pick-and-place específico (5 episodios) | no disponible | Hugging Face, LeRobot |
| Políticas ACT de referencia en LeRobot | variable | estado + imágenes | tareas de manipulación con datasets mayores | según repositorio | Hugging Face, LeRobot |
| Diffusion Policy (LeRobot) | variable | estado + imágenes | manipulación por imitación con difusión | según repositorio | Hugging Face, LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a arquitectura, tamaño y disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 5 episodios y 8.974 fotogramas, insuficiente para generalizar a variaciones de posición, iluminación o distractores.
- Sin evaluación en robot real: no hay tasas de éxito publicadas, por lo que se desconoce su fiabilidad.
- Licencia no especificada: la model card indica "More Information Needed", lo que impide confirmar el uso comercial.
- Dependencia estricta del hardware: solo funciona con robot `so_follower` y cámara `top` con la geometría y calibración usadas en el entrenamiento; los nombres de cámara deben coincidir con las claves de observación.
- Tarea única: no es un modelo general; fuera de "put the orange brick in a yellow form" no hay garantía de comportamiento correcto.
- Riesgo de sobreajuste y de fallo ante cambios de entorno (fondo, luz, posición inicial de los objetos).
- No aplica a tareas de lenguaje, visión general, código ni matemáticas; carece de sesgos lingüísticos pero puede heredar sesgos de los datos de teleoperación (posiciones, velocidades y objetos concretos).
- Para producción se recomienda ampliar el dataset, documentar la licencia y validar con múltiples ensayos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/esijnja/policy_test
- Dataset de entrenamiento: https://huggingface.co/datasets/esijnja/hackaton26_test_20261107_182356
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=esijnja/hackaton26_test_20261107_182356
