# LindsayCC/cube_v1_policy

## Resumen

`cube_v1_policy` es una política de aprendizaje por imitación para robótica real publicada en Hugging Face por el usuario LindsayCC (Tiancong Li) y entrenada con LeRobot. Implementa el método ACT (Action Chunking with Transformers, arXiv:2304.13705), que en lugar de predecir una acción por paso predice fragmentos cortos de acciones (action chunks), lo que reduce el error acumulado y produce un control más estable en tareas de manipulación.

El modelo resuelve una única tarea: coger un cubo verde con un brazo SO-101 de tipo `so_follower` equipado con dos cámaras (`side` y `top`). Consume el estado articular en 6 dimensiones y dos imágenes RGB de 3×240×320, y devuelve un vector de acción de 6 dimensiones a 30 FPS.

Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo pequeño que cabe en cualquier GPU consumer. Su interés es práctico: es un ejemplo reproducible y completo de un pipeline de LeRobot (dataset de 150 episodios y 134.970 frames, configuración de entrenamiento documentada, comandos de despliegue) y una base razonable para fine-tuning en tareas de pick-and-place con robots de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), método de aprendizaje por imitación con transformer que predice fragmentos de acción |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Consume una observación por paso (estado de 6 dimensiones + 2 imágenes de 3×240×320) |
| Tipos de cuantización | No disponible. Solo se publican pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No aplica / no disponible: las entradas documentadas son estado articular e imágenes; no hay procesamiento de lenguaje natural |
| Licencia | No disponible (la model card indica «[More Information Needed]») |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras de entrada | `side`, `top` |
| Entradas | `observation.state` (6,), `observation.images.side` (3, 240, 320), `observation.images.top` (3, 240, 320) |
| Salidas | `action` (6,) |
| Tamaño del repositorio | 0,2 GB |
| Fecha de publicación | 2026-10-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de *behavior cloning* sobre datos de teleoperación. La política combina un codificador visual que procesa los dos flujos de cámara (`side` y `top`) con un transformer que modela la secuencia de observaciones y emite un *chunk* de acciones futuras en cada inferencia, en lugar de una sola acción. El paper original describe un backbone visual convolucional y un esquema encoder-decoder con variable latente de estilo CVAE; la model card de este checkpoint no detalla la configuración concreta del backbone ni del transformer, por lo que ese dato se considera no disponible. Tampoco se publica el tamaño del *chunk* de acciones ni el número de pasos de ejecución en bucle abierto.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `LindsayCC/so101_cube_v1_1026`: 150 episodios, 134.970 frames a 30 FPS, una única instrucción («Pick up the green cube») y un solo operador y montaje físico. La configuración fue de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se menciona RLHF, DPO ni ningún ajuste por preferencias: es imitación supervisada pura sobre trayectorias de teleoperación.

## Capacidades

- Control robótico de manipulación: mapea estado articular e imágenes a un vector de acción de 6 dimensiones para el brazo SO-101.
- Predicción por *action chunks*: emite fragmentos de acción, lo que suaviza la ejecución y reduce el error acumulado frente a políticas paso a paso.
- Percepción visual con dos vistas simultáneas (`side` y `top`) a resolución 3×240×320.
- Ejecución de una tarea concreta: recoger el cubo verde y levantarlo.
- Inferencia a 30 FPS, en línea con la frecuencia de grabación del dataset.
- Despliegue directo con la CLI `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación de tareas.
- No soporta agentes, ni modo *thinking*, ni visión general, ni audio.
- No es multilingüe: no procesa lenguaje; la cadena de tarea (`--task`) es metadato del entorno de ejecución, no una entrada del modelo.

## Casos de uso

- **Pick-and-place de un objeto en laboratorio**: ejecutar la tarea «Pick up the green cube» sobre un SO-101 calibrado con cámaras `side` y `top`, usando `lerobot-rollout --strategy.type=base --duration=60`. Es el escenario para el que fue entrenado y el único validado por el autor.
- **Base para fine-tuning con datos propios**: partir de estos pesos y reentrenar con `lerobot-train --policy.type=act` sobre un dataset nuevo, lo que ahorra pasos frente a entrenar desde cero en tareas de agarre similares.
- **Referencia reproducible de un pipeline LeRobot completo**: sirve para validar instalación, calibración de hardware, teleoperación, grabación a 30 FPS y entrenamiento, ya que la configuración (semilla, learning rate, batch, versión de LeRobot) está documentada.
- **Docencia y prototipado en robótica de bajo coste**: demostrar aprendizaje por imitación con un brazo SO-101 y dos cámaras web, sin necesidad de GPU de datacenter.
- **Evaluación comparativa de políticas ACT**: usar este checkpoint como *baseline* con semilla y dataset fijos al comparar variantes de arquitectura, aumentos de datos o estrategias de grabación.
- **Generación de datos sintéticos de evaluación**: ejecutar la política de forma repetida con `--strategy.type=base` para medir estabilidad, tiempos de aproximación y tasa de éxito antes de desplegar una versión propia.
- **Pruebas de integración en un lazo de control real**: verificar latencia, *jitter* y comportamiento del bus del robot a 30 FPS antes de sustituir la política por un modelo más grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la nota «_No evaluation results have been provided for this policy yet_» y la tabla de evaluación real (tarea, intentos, éxitos, tasa de éxito) está vacía. No hay datos de MMLU, HumanEval ni GSM8K porque el modelo no es un LLM, ni tasas de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,2 GB para los pesos en fp32 y unos 0,1 GB en fp16/bf16; con activaciones de dos imágenes de 3×240×320 por paso, el consumo total se mantiene por debajo de 2 GB (estimación a partir del número de parámetros, no dato oficial).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM. Para desarrollo, una RTX 3060, RTX 4060 o RTX 4090 es más que suficiente; en servidor, A100 o H100 no aportan ventaja a este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier modelo con soporte CUDA (GTX 1650 en adelante).
- CPU: la inferencia es viable para pruebas, pero no hay datos publicados que garanticen los 33 ms por paso que exige el lazo a 30 FPS.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=LindsayCC/cube_v1_policy`; la librería `lerobot` sobre PyTorch para integraciones propias. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El presupuesto temporal del lazo de control a 30 FPS es de 33,3 ms por paso, y no se documenta si el checkpoint lo cumple en hardware concreto.

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Entrada | Tarea | Dataset | Licencia |
|---|---|---|---|---|---|---|
| `LindsayCC/cube_v1_policy` | ACT | 51.668.614 | Estado (6) + 2 imágenes 3×240×320 | Recoger cubo verde con SO-101 | 150 episodios / 134.970 frames | No disponible |
| `simonholmes001/my_policy_cube-100-v1` | ACT (LeRobot) | No disponible | No disponible | Tarea de cubo | No disponible | No disponible |
| ACT original (arXiv:2304.13705) | ACT | No disponible en la información | No disponible | Manipulación diversa (paper) | No disponible | No disponible |

No se dispone de tasas de éxito ni de métricas comparables entre estos modelos; la comparación solo puede hacerse por método, formato de publicación (ambos sobre LeRobot) y licencia, que en los dos checkpoints de Hugging Face consultados figura como no disponible.

## Limitaciones y advertencias

- **Tarea única**: solo se ha entrenado para «Pick up the green cube». No generaliza a otros objetos, colores ni instrucciones.
- **Dataset muy pequeño y de un solo operador**: 150 episodios y 134.970 frames implican un riesgo alto de sobreajuste a posiciones, iluminación y fondo concretos del montaje de grabación.
- **Montaje físico rígido**: las cámaras `side` y `top` deben colocarse en la misma disposición relativa y las imágenes tienen que llegar a 3×240×320; cambiar la resolución, el encuadre o la exposición degrada la política.
- **Un único tipo de robot**: diseñada para `so_follower` con estado de 6 dimensiones y acción de 6 dimensiones. No es portable directamente a otros brazos sin reentrenar.
- **Sin resultados de evaluación**: el autor no publica tasa de éxito ni número de intentos, así que el rendimiento real es desconocido.
- **Licencia sin definir**: la model card marca «[More Information Needed]», lo que impide asumir permiso de uso comercial. Hay que contactar con el autor antes de cualquier despliegue productivo.
- **Riesgo físico**: como toda política de control, puede generar trayectorias erráticas ante entradas fuera de distribución. Es obligatorio usar parada de emergencia, límites de par y zonas de trabajo despejadas.
- **Sin comprensión de lenguaje**: la cadena `--task` no condiciona la política de forma documentada; no se puede cambiar de tarea por prompt.
- **Alucinación en sentido estricto no aplica**, pero sí el fallo silencioso: la política puede ejecutar movimientos plausibles pero incorrectos sin señal de error.
- **Trazabilidad**: descargas y likes a cero y publicación reciente; no hay evidencia de uso en terceros ni mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LindsayCC/cube_v1_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/LindsayCC/so101_cube_v1_1026
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=LindsayCC/so101_cube_v1_1026
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor: https://huggingface.co/LindsayCC
- Política ACT similar encontrada en la búsqueda: https://huggingface.co/simonholmes001/my_policy_cube-100-v1
