# SEONGMIN1234/act_pick_cube_chunk100

## Resumen
`act_pick_cube_chunk100` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo lo ha desarrollado el usuario SEONGMIN1234 y se distribuye a través del Hub de Hugging Face con la librería LeRobot, el framework de Hugging Face para aprendizaje por imitación en robots reales. No es un modelo de lenguaje: es un controlador visomotor que, a partir de dos cámaras y del estado de las articulaciones, genera comandos de acción para un brazo robótico de tipo `so_follower` (SO-101).

El modelo resuelve una tarea concreta: agarrar un cubo negro. Consume observaciones de estado de 6 dimensiones y dos flujos de imagen RGB de 480x640 (cámara cenital y cámara en la muñeca), y produce una acción de 6 dimensiones. La innovación de ACT frente a políticas que predicen un paso cada vez es que genera trozos de acción (*action chunks*) de varios pasos futuros, lo que reduce el error de composición y estabiliza el control.

Es relevante ahora porque ejemplifica el flujo completo de LeRobot: grabación de datos de teleoperación, entrenamiento de una política y despliegue en hardware de bajo coste. Con 51,7 millones de parámetros y un repositorio de 0,2 GB, es un modelo pequeño y ligero que cabe en cualquier GPU consumer, aunque su utilidad está acotada a la tarea y al robot con los que se entrenó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera por pasos de control) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
ACT es un transformer que combina un codificador de imágenes (procesa las dos cámaras de 480x640) con el estado de las articulaciones, y un decodificador que predice un *chunk* de acciones futuras en lugar de un único paso. Esta predicción por trozos, junto con una pérdida de reconstrucción sobre el chunk completo, mitiga el error de composición acumulado típico de las políticas paso a paso. El modelo está etiquetado como `act` y `lerobot` y se ha entrenado con la versión 0.6.0 de LeRobot.

Los datos de entrenamiento provienen del dataset `SEONGMIN1234/so101-pick-cube-2cam-50ep`: 50 episodios, 13.028 fotogramas a 15 FPS, con la tarea "Grab the black cube". La configuración de entrenamiento es de 100.000 pasos, batch de 4, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de ajuste; es aprendizaje por imitación supervisado a partir de teleoperación.

## Capacidades
- Control visomotor de un brazo robótico `so_follower` con 6 grados de libertad de acción y estado.
- Fusión de dos cámaras (cenital y muñeca) para localizar y manipular objetos.
- Predicción de *action chunks* para movimientos más estables y continuos.
- Ejecución de una única tarea de manipulación: "Grab the black cube".
- Integración nativa con el CLI de LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso
- **Automatización de pick-and-place en laboratorio**: el modelo ejecuta la secuencia de agarre del cubo negro sobre un SO-101, adecuado para prototipos de investigación en manipulación con hardware de bajo coste.
- **Punto de partida para fine-tuning**: al ser una política ACT entrenada con LeRobot, sirve como base para reentrenar con un dataset propio cambiando `--dataset.repo_id` y `--policy.type=act`.
- **Validación de pipelines de imitación**: útil para comprobar el flujo completo de grabación, entrenamiento y despliegue con 50 episodios y 13.028 fotogramas, un volumen manejable para pruebas de concepto.
- **Docencia y formación en robótica**: ejemplo reproducible de ACT con dos cámaras y configuración de entrenamiento documentada, ideal para cursos de aprendizaje por imitación.
- **Benchmark interno de manipulación**: sirve como referencia base para comparar variantes de ACT (distinto número de cámaras, chunk size, episodios) en la misma tarea.
- **Demostración de despliegue en GPU consumer**: con 51,7 M de parámetros y 0,2 GB, se puede ejecutar en tiempo real en una GPU de gama media para demostraciones en ferias o presentaciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (*"No evaluation results have been provided for this policy yet"*).

## Requisitos de hardware
- **VRAM estimada**: inferior a 1 GB en FP32 para los 51,7 M de parámetros; en la práctica, el cuello de botella es el procesamiento de las dos imágenes de 480x640, no el modelo.
- **GPU recomendadas**: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia en tiempo real a 15-30 FPS.
- **GPU consumer**: sí, cabe holgadamente en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida para pruebas no críticas.
- **Despliegue**: mediante LeRobot (`lerobot-rollout`); no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles en la información proporcionada; dependen del hardware y de la resolución de las cámaras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SEONGMIN1234/act_pick_cube_chunk100` | 51,7 M | no aplica | Agarrar cubo negro con SO-101 | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot (referencia) | variable | no aplica | Manipulación genérica | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy (referencia) | variable | no aplica | Manipulación visomotora | MIT (implementación de referencia) | Repositorios académicos |
| VQ-BeT (referencia) | variable | no aplica | Manipulación y navegación | MIT (implementación de referencia) | Repositorios académicos |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias
- **Tarea única**: el modelo solo se ha entrenado para "Grab the black cube"; no generaliza a otros objetos, posiciones ni tareas sin reentrenamiento.
- **Hardware específico**: está calibrado para un robot `so_follower` con cámaras `overhead` y `wrist`; usar otro robot o disposición de cámaras invalida la política.
- **Sin evaluación publicada**: no hay tasas de éxito en robot real, por lo que se desconoce su robustez ante variaciones de iluminación, posición del objeto o distracciones.
- **Dataset pequeño**: 50 episodios y 13.028 fotogramas son un volumen limitado; es probable que la política sea frágil fuera de la distribución de entrenamiento.
- **Sesgos**: no aplican sesgos lingüísticos, pero sí sesgos de dominio (posiciones, iluminación y objetos vistos en el dataset).
- **Alucinación**: no aplica en el sentido textual; el riesgo equivalente es generar acciones no válidas o inseguras ante entradas fuera de distribución.
- **Licencia**: Apache 2.0 permite uso comercial, pero la responsabilidad sobre la seguridad física del robot recae en el integrador.
- **Producción**: no recomendado para entornos de producción sin una evaluación exhaustiva previa y mecanismos de parada de emergencia.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/SEONGMIN1234/act_pick_cube_chunk100
- Dataset de entrenamiento: https://huggingface.co/datasets/SEONGMIN1234/so101-pick-cube-2cam-50ep
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SEONGMIN1234/so101-pick-cube-2cam-50ep
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
