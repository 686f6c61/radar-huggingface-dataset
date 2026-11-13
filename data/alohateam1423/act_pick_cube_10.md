# alohateam1423/act_pick_cube_10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación desarrollado originalmente por Tony Z. Zhao y colaboradores (paper arXiv:2304.13705, 2023) que predice bloques cortos de acciones en lugar de pasos individuales. El modelo aquí descrito, `alohateam1423/act_pick_cube_10`, es una política concreta entrenada con la librería LeRobot de Hugging Face sobre un conjunto de datos propio de teleoperación, y publicada en el Hub con licencia Apache 2.0. Está pensado para controlar un robot de tipo `so_follower` (brazo SO-100/SO-101) equipado con dos cámaras: una cenital (`overhead`) y otra en la muñeca (`wrist`).

La tarea aprendida es muy específica: "Grab the black cube" (coger el cubo negro). El modelo consume un vector de estado de 6 dimensiones y dos imágenes RGB de 480×640, y produce un vector de acción de 6 dimensiones por paso. Con 51.576.454 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto que cabe holgadamente en GPUs de consumo. No es un modelo de lenguaje: no procesa ni genera texto, y sus "idiomas" no aplican en el sentido habitual.

Su relevancia es la de un ejemplo práctico de flujo de trabajo de robótica de imitación de extremo a extremo con LeRobot 0.6.0: grabación de datos, entrenamiento y despliegue con la CLI `lerobot-rollout`. No obstante, al ser una política entrenada sobre 50 episodios y una única tarea, su utilidad fuera de ese entorno concreto es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT) |
| Parámetros totales | 51.576.454 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de entrenamiento, no documentada) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

Especificaciones adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.overhead` | VISUAL | (3, 480, 640) |
| `observation.images.wrist` | VISUAL | (3, 480, 640) |
| `action` | ACTION | (6,) |

| Dato de entrenamiento | Valor |
|---|---|
| Dataset | `alohateam1423/pick-cube_20261008_100512` |
| Episodios | 50 |
| Fotogramas | 22.500 |
| Frecuencia | 30 FPS |
| Tarea | "Grab the black cube" |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.0 |
| Tipo de robot | `so_follower` |
| Cámaras | `overhead`, `wrist` |

## Arquitectura y entrenamiento

ACT se basa en un transformer encoder-decoder con un cuello de botella latente de estilo CVAE: el encoder procesa las observaciones (estado y las dos imágenes de las cámaras) y el decoder genera un chunk de acciones futuras, en lugar de una sola acción por paso. Esta predicción por bloques reduce el error de composición acumulado típico de las políticas paso a paso y mejora la estabilidad en tareas de manipulación. La implementación concreta corresponde a la disponible en LeRobot, con dos cámaras RGB a 480×640 y un vector de estado de 6 dimensiones.

El entrenamiento se realizó por imitación supervisada sobre 50 episodios teleoperados (22.500 fotogramas a 30 FPS) durante 100.000 pasos con batch size 8, AdamW y learning rate 1e-5. No se documenta el uso de RLHF, DPO ni datos sintéticos; es aprendizaje por imitación puro. La model card no detalla la composición del dataset más allá de la tarea única, ni si se aplicaron aumentos de datos o técnicas de regularización adicionales.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un brazo `so_follower`.
- Percepción visual multimodal: integra dos flujos de imagen (cenital y muñeca) junto con el estado de las articulaciones.
- Predicción de chunks de acciones: emite secuencias cortas de acciones coherentes en el tiempo.
- Ejecución de una tarea concreta: "Grab the black cube".
- Despliegue mediante la CLI de LeRobot (`lerobot-rollout`) con estrategia `base`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: ejecutar la recogida de un cubo negro sobre una mesa con un brazo SO-100/SO-101 y dos cámaras, replicando la configuración exacta del dataset de entrenamiento. Adecuado por la correspondencia directa entre observaciones y acciones.
- **Punto de partida para fine-tuning**: usar esta política como inicialización y reentrenar con `lerobot-train` sobre nuevos datasets de la misma tarea con variaciones de posición o iluminación. Útil para equipos que quieren un baseline funcional sin partir de cero.
- **Validación de pipelines de imitación**: servir como caso de prueba reproducible del flujo LeRobot 0.6.0 (grabación, entrenamiento y rollout) en entornos docentes o de investigación.
- **Demostraciones de robótica educativa**: mostrar el ciclo completo de aprendizaje por imitación con hardware asequible (SO-100) y un modelo de 51,6 M de parámetros que cabe en una GPU de consumo.
- **Benchmark interno de infraestructura de inferencia**: medir latencia y throughput de un transformer de control sobre GPU consumer o embebida antes de escalar a políticas mayores.
- **Base para experimentos de generalización**: evaluar la degradación del éxito al cambiar la posición del cubo, la iluminación o los distractores, dado que la model card no reporta tasas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, latencia ni throughput medidos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 51,6 M de parámetros; en FP32 ocupa aproximadamente 0,2 GB de pesos, más el coste de activaciones de dos imágenes de 480×640. Cabe en GPUs con 4-8 GB de VRAM.
- **GPU recomendadas**: cualquier GPU NVIDIA con CUDA (RTX 3060 en adelante) es suficiente; también es viable en CPU para inferencia de baja frecuencia, aunque no se documentan latencias.
- **GPU de consumo**: sí, cabe en RTX 3050/3060/4060 y superiores.
- **Opciones de despliegue**: CLI de LeRobot (`lerobot-rollout`), con `--policy.path=alohateam1423/act_pick_cube_10`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alohateam1423/act_pick_cube_10` (este) | 51,6 M | no disponible | Pick cube (SO-100) | Apache 2.0 | Hub de Hugging Face |
| Políticas ACT genéricas de LeRobot | variable | no disponible | Manipulación por imitación | Apache 2.0 (LeRobot) | Hub de Hugging Face |
| Diffusion Policy (referencia) | variable | no disponible | Manipulación por imitación | según implementación | Repositorios de investigación |
| Políticas VLA (p. ej. RT-2, OpenVLA) | cientos de M a miles de M | no disponible | Manipulación generalista | variable | variable |

No se dispone de datos de rendimiento comparativos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- **Tarea única y altamente específica**: solo se ha entrenado para "Grab the black cube"; no generaliza a otras tareas sin reentrenamiento.
- **Dataset pequeño**: 50 episodios y 22.500 fotogramas; riesgo de sobreajuste a posiciones, iluminación y disposición concretas del entorno de grabación.
- **Sin evaluación publicada**: no hay tasas de éxito en robot real, por lo que no se puede garantizar su funcionamiento fuera del entorno de entrenamiento.
- **Dependencia del hardware**: requiere un robot `so_follower` y dos cámaras con los nombres `overhead` y `wrist`; cualquier cambio en la configuración invalida las observaciones esperadas.
- **Sesgos**: no documentados; al ser un modelo de control, los sesgos se manifiestan como fallos sistemáticos ante distribuciones de entrada no vistas.
- **Alucinación**: no aplica en el sentido de generación de texto; el equivalente es la producción de acciones incorrectas o inseguras ante entradas fuera de distribución.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción exige validación propia.
- **Sin soporte multilingüe ni de texto**: no debe evaluarse como modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alohateam1423/act_pick_cube_10
- Dataset de entrenamiento: https://huggingface.co/datasets/alohateam1423/pick-cube_20261008_100512
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=alohateam1423/pick-cube_20261008_100512
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
