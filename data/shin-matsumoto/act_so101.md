# Shin-Matsumoto/act_so101

## Resumen

`Shin-Matsumoto/act_so101` es una política de imitación entrenada con el método ACT (Action Chunking with Transformers) sobre un robot SO-101 (variante `so_follower`) con una única cámara frontal. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de una imagen RGB de 480×640 y del estado de las articulaciones (vector de 6 dimensiones), produce directamente un vector de acción de 6 dimensiones. Predice trozos de acciones (*action chunks*) en lugar de pasos individuales, lo que reduce el error acumulado típico de las políticas paso a paso.

El modelo lo publica el usuario Shin-Matsumoto en el Hub de HuggingFace con la librería LeRobot y un total de 51.668.614 parámetros en safetensors (0,2 GB de repositorio). Se ha entrenado exclusivamente con el dataset `Shin-Matsumoto/so101_test_20261025_155816`, compuesto por 10 episodios y 8.737 fotogramas a 30 FPS para una sola tarea: "Grasp the blue plush toy and put it in the black box". Es, por tanto, una política de un solo cometido y de alcance muy acotado.

Su relevancia es práctica más que de investigación: sirve como ejemplo reproducible de extremo a extremo del flujo de imitación de LeRobot (grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) sobre hardware de bajo coste. No hay resultados de evaluación publicados ni licencia declarada, así que debe tratarse como un artefacto de experimentación, no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación con transformer y componente CVAE según el paper arXiv:2304.13705 |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo de lenguaje, consume una observación por paso de control |
| Tipos de cuantización | No disponible; el repositorio publica únicamente safetensors (no hay GGUF ni versiones cuantizadas) |
| Idiomas soportados | No disponible; la tarea se especifica con una cadena de texto en inglés en la model card |
| Licencia | No disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors, librería `lerobot` |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras | `front`, imagen de entrada de forma (3, 480, 640) |
| Entrada de estado | `observation.state`, forma (6,) |
| Salida de acción | `action`, forma (6,) |
| Tamaño del repositorio | 0,2 GB |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con un esquema de autoencoder variacional condicional (CVAE) para modelar la variabilidad de las demostraciones humanas, y que predice secuencias cortas de acciones en lugar de un único paso. En este caso concreto, la política mapea una imagen frontal de 480×640 píxeles y un vector de estado de 6 dimensiones a un vector de acción de 6 dimensiones; el número total de parámetros, 51.668.614, es coherente con una red de este tipo y muy inferior al de una política basada en un modelo de lenguaje.

El entrenamiento se realizó con `lerobot-train` sobre 10 episodios y 8.737 fotogramas a 30 FPS, lo que equivale a unos 291 segundos de demostraciones teleoperadas para una única tarea. La configuración declarada es de 20.000 pasos con tamaño de lote 8 (160.000 muestras procesadas), optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se documenta composición adicional del dataset, aumento de datos, ni fases de RLHF o DPO (no aplicables a este tipo de política). Tampoco se detalla la inicialización de los pesos ni si se partió de un entrenamiento previo.

## Capacidades

- Manipulación robótica de una sola tarea: recoger un peluche azul y depositarlo en una caja negra, tal como se especifica en la instrucción de entrenamiento.
- Control visuomotor de 6 grados de libertad a partir de una cámara RGB frontal y del estado articular.
- Predicción de trozos de acción (*action chunking*), que reduce la acumulación de error y la frecuencia efectiva de inferencia frente a políticas paso a paso.
- Acondicionamiento por instrucción textual de la tarea: el comando `--task` se pasa en tiempo de ejecución con la cadena exacta usada en el entrenamiento.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout` y visualización del dataset asociado.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso en el sentido de un agente basado en lenguaje, ni generación de texto, código o matemáticas.
- No tiene capacidades multilingües: no procesa ni genera lenguaje natural como salida.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales más allá de la observación visual necesaria para el control.

## Casos de uso

- Recogida de objetos en el entorno entrenado: ejecutar la tarea "Grasp the blue plush toy and put it in the black box" sobre un SO-101 con cámara frontal, usando `lerobot-rollout` con `--strategy.type=base` y la instrucción exacta de entrenamiento.
- Punto de partida para *fine-tuning*: reutilizar los 51,7 millones de parámetros como inicialización y reentrenar con un dataset propio mediante `lerobot-train --policy.type=act`, útil cuando se dispone de pocas demostraciones de una tarea nueva.
- Validación de una canalización completa de imitación: sirve para comprobar de extremo a extremo la grabación teleoperada, el formateo del dataset, el entrenamiento y el despliegue antes de invertir en un dataset mayor.
- Referencia interna de comparación: al tener una configuración de entrenamiento completamente documentada (20.000 pasos, lote 8, lr 1e-5, semilla 1000), permite reproducir el experimento y comparar contra otras políticas del mismo ecosistema bajo condiciones idénticas.
- Docencia y formación: ejemplo mínimo y de bajo coste de una política visuomotora real, adecuado para talleres sobre ACT y LeRobot con hardware SO-101.
- Pruebas de infraestructura de inferencia: al ocupar 0,2 GB, es útil para validar *pipelines* de despliegue en borde (CPU o GPU modesta) antes de migrar a políticas de mayor tamaño.
- Automatización de tareas de *pick-and-place* en laboratorio con objetos y posiciones similares a los del dataset, aceptando que la generalización fuera de esa distribución no está medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la nota "No evaluation results have been provided for this policy yet", sin tabla de ensayos, tasas de éxito ni comparaciones con otras políticas. No se dispone tampoco de métricas de latencia o caudal de inferencia medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en fp32 (51.668.614 × 4 bytes ≈ 207 MB) y unos 0,1 GB en fp16; el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4060 o RTX 4090 queda enormemente sobredimensionada para este modelo.
- Cabe holgadamente en GPU de consumo e incluso es viable en CPU, aunque no hay mediciones publicadas de latencia en ninguno de los dos casos.
- Presupuesto temporal: el dataset se registró a 30 FPS, es decir, 33,3 ms por paso de control. El *action chunking* reduce la frecuencia efectiva de inferencia, pero no se han publicado cifras de latencia real que confirmen el cumplimiento de ese presupuesto.
- Opciones de despliegue: `lerobot-rollout` (CLI de LeRobot 0.6.2) con PyTorch y `--policy.device=cuda`. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje y no se publican pesos GGUF.
- Hardware físico necesario: robot SO-101 (`so_follower`), puerto serie accesible y al menos una cámara OpenCV configurada a 640×480 y 30 FPS con el nombre de observación `front`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la información proporcionada. La comparación siguiente se limita a lo que puede afirmarse sin métricas:

| Modelo | Tipo de política | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Shin-Matsumoto/act_so101` | ACT sobre SO-101, una tarea | 51.668.614 | No aplica | No disponible | Hub de HuggingFace, safetensors |
| Otras políticas ACT de LeRobot | ACT, según dataset y robot | No disponible | No aplica | No disponible | Hub de HuggingFace y guía ACT de LeRobot |
| Diffusion Policy (LeRobot) | Política de imitación basada en difusión | No disponible | No aplica | No disponible | Implementada en LeRobot |
| SmolVLA (LeRobot) | Política visión-lenguaje-acción | No disponible | No disponible | No disponible | Implementada en LeRobot |

No se han encontrado en la búsqueda web resultados utilizables sobre estos modelos; los enlaces devueltos no guardan relación con el modelo consultado.

## Limitaciones y advertencias

- Dataset muy reducido: 10 episodios y 8.737 fotogramas para una sola tarea, lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y apariencia concretas del objeto y de la caja.
- Ausencia total de evaluación: no hay tasa de éxito medida en robot real, ni número de ensayos, ni condiciones de dificultad documentadas.
- Generalización no demostrada: no hay evidencia de que la política funcione con otros objetos, otras posiciones iniciales, distractores, cambios de iluminación o un robot distinto del mismo modelo.
- Una sola cámara y estado de 6 dimensiones: no hay redundancia sensorial ni margen para oclusiones parciales de la vista frontal.
- Licencia no declarada: la model card indica "[More Information Needed]", por lo que no puede asumirse permiso para uso comercial ni para redistribución; es un riesgo legal en producción.
- Dependencia de la cadena exacta de tarea: el comando de despliegue debe coincidir con la instrucción de entrenamiento ("Grasp the blue plush toy and put it in the black box.").
- Sin capacidades lingüísticas: no debe emplearse para generación de texto, razonamiento, código, matemáticas ni tareas de agente; el campo de idiomas figura como no disponible porque no aplica.
- Sin versiones cuantizadas ni formatos alternativos: solo safetensors para `lerobot`; no hay GGUF ni soporte en runtimes de inferencia de LLM.
- El parche de seguridad de la tarea recae en el operador: al ejecutar `lerobot-rollout` sin `--duration` la política se ejecuta de forma indefinida, lo que exige supervisión y límites físicos en el entorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shin-Matsumoto/act_so101
- Dataset de entrenamiento: https://huggingface.co/datasets/Shin-Matsumoto/so101_test_20261025_155816
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (*rollout*): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Shin-Matsumoto/so101_test_20261025_155816
