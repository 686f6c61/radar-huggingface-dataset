# rubatotree/so101_classify_the_blocks_act_manual

## Resumen

`rubatotree/so101_classify_the_blocks_act_manual` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (*action chunks*) en lugar de pasos individuales. Lo publica el usuario `rubatotree` en el Hub de Hugging Face dentro del ecosistema LeRobot, y está entrenada para una única tarea: clasificar bloques ("classify the blocks") con un brazo `so_follower` (familia SO-101) equipado con una cámara frontal.

El modelo consume dos entradas: el estado del robot (`observation.state`, vector de 6 dimensiones) y una imagen frontal de 3x480x640 píxeles; produce como salida un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real sobre hardware de bajo coste, no para generación de texto ni tareas de lenguaje.

Su relevancia es doble. Por un lado, es un ejemplo reproducible del flujo completo de LeRobot: dataset teleoperado de 120 episodios y 31.602 fotogramas a 15 FPS, entrenamiento de 100.000 pasos y publicación de los pesos en safetensors con licencia Apache-2.0. Por otro, sirve como referencia para comparar políticas de manipulación de bajo coste y para hacer *fine-tuning* con datos propios. La ficha no incluye resultados de evaluación en robot real, por lo que su tasa de éxito real no está cuantificada públicamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer encoder-decoder con cuello de botella latente tipo CVAE, según el método referenciado en la ficha |
| Parametros totales | 51.668.614 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en tokens: la política consume un estado de 6 dimensiones y una imagen de 3x480x640 por observación |
| Tipos de cuantizacion | no disponible; no se documentan variantes cuantizadas |
| Idiomas soportados | no disponible; no es un modelo de lenguaje. La tarea se fija con la cadena "classify the blocks" |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio); no se publican GGUF ni ONNX |

Datos adicionales de la ficha: tipo de robot `so_follower`, una cámara (`front`), 18 descargas y 0 *likes* en el momento de la consulta, tamaño del repositorio 0,2 GB, y publicación en el Hub el 2026-09-17 según los metadatos.

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que aprende de datos teleoperados y predice *chunks* de acciones en lugar de un único paso, lo que reduce el error de acumulación de acciones y aporta consistencia temporal. La formulación del paper original combina un autoencoder variacional condicionado (CVAE) con un transformador encoder-decoder y un extractor visual convolucional, de modo que el modelo aprende una representación latente del estilo de la demostración y la usa para desambiguar trayectorias. La ficha del autor no detalla la configuración exacta de la política (tamaño del *chunk*, número de capas, resolución interna del *backbone*), por lo que esos valores concretos no están disponibles.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `rubatotree/classify_the_blocks_front`: 120 episodios, 31.602 fotogramas a 15 FPS, una única tarea ("classify the blocks") y una sola cámara frontal. La configuración declarada es de 100.000 pasos con *batch* de 64, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. La ficha no indica número de tokens ni composición adicional del dataset, y no menciona etapas de RLHF, DPO ni *fine-tuning* posterior; se trata, por tanto, de un entrenamiento supervisado puro sobre demostraciones. Tampoco se documenta ninguna innovación propia más allá del método ACT de referencia ni resultados de evaluación en robot real.

## Capacidades

- Manipulación robótica de una sola tarea: clasificar bloques mediante movimientos del brazo `so_follower`.
- Control visomotor de 6 grados de libertad de salida (`action`, shape 6) a partir de estado de 6 dimensiones e imagen frontal RGB de 3x480x640.
- Aprendizaje por imitación a partir de demostraciones teleoperadas: replica la distribución de trayectorias del dataset de entrenamiento.
- Predicción por *action chunking*: emite secuencias cortas de acciones, lo que aporta suavidad y consistencia temporal frente a políticas paso a paso.
- Integración nativa con el ecosistema LeRobot: ejecución con `lerobot-rollout` y reentrenamiento con `lerobot-train` mediante `--policy.type=act`.
- Capacidad de servir como punto de partida para *fine-tuning* con datasets propios del mismo tipo de robot y cámara.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso, ni agentes, ni diálogo multilingüe: no es un modelo de lenguaje.
- No dispone de modo *thinking*, ni visión general-purpose, ni audio, ni OCR; la entrada visual se usa exclusivamente como observación de control.

## Casos de uso

- Clasificación de bloques en un banco de trabajo: la política ejecuta la secuencia de recogida y colocación sobre el brazo SO-101 con cámara frontal, adecuada para tareas de *pick and place* de objetos pequeños en un espacio acotado y con iluminación controlada.
- Banco de pruebas docente de aprendizaje por imitación: permite a un aula recorrer el ciclo completo (teleoperar, grabar 120 episodios a 15 FPS, entrenar 100.000 pasos y desplegar) con hardware de bajo coste.
- Línea base (*baseline*) para investigación: sirve como referencia ACT reproducible sobre el dataset `classify_the_blocks_front` frente a variantes como Diffusion Policy o VQ-BeT, entrenadas con los mismos datos y métricas.
- Validación del *pipeline* de datos de LeRobot: el dataset asociado (31.602 fotogramas, una tarea, una cámara) es un caso de prueba útil para verificar calibración, sincronización de cámara y formato de episodios antes de escalar a datasets mayores.
- Prueba de integración de hardware: útil para verificar cableado, puerto serie y mapeo de cámaras de un SO-101 antes de invertir tiempo en tareas más complejas, ya que la política depende de claves de observación concretas (`observation.state`, `observation.images.front`).
- *Fine-tuning* para tareas de manipulación similares: al ser un modelo de 51,7 M de parámetros con licencia Apache-2.0, se puede reentrenar o ajustar con datos propios de otro conjunto de bloques u objetos sin coste de licencia.
- Automatización de rutinas repetitivas de laboratorio: separación de piezas o muestras pequeñas por categoría en una estación fija, siempre que el montaje y la iluminación se mantengan estables.
- Demostración de inferencia en *hardware* de consumo: el tamaño del modelo permite ejecutar la política en una GPU de gama media o incluso en CPU, lo que facilita prototipos fuera de un clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia ficha del modelo incluye la línea "_No evaluation results have been provided for this policy yet_", es decir, no hay tabla de ensayos ni tasas de éxito en robot real para la tarea "classify the blocks".

| Benchmark | Resultado |
|---|---|
| Evaluación en robot real (tasa de éxito) | no disponible |
| Métricas de *offline* (MSE/L1 de acciones) | no disponible |
| Comparativas con otras políticas ACT o Diffusion Policy | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB solo de pesos en FP32 (51,7 M de parámetros) y unos 0,1 GB en FP16. Contando activaciones, *buffers* de CUDA y el *backbone* visual, es razonable asumir menos de 1 GB en FP16 y del orden de 1-2 GB en FP32. Son estimaciones de cálculo, no medidas publicadas por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA y 4 GB o más de memoria es suficiente; por ejemplo RTX 3050, RTX 3060, RTX 4090, A100 o H100. Las GPU de datacenter no aportan ventaja relevante aquí, ya que el cuello de botella suele ser el bucle de control del robot y la captura de cámara, no el cómputo.
- Viabilidad en GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Viabilidad en CPU: previsiblemente sí para inferencia a baja frecuencia, dado el reducido número de parámetros; el autor no documenta latencias en CPU.
- Opciones de despliegue: LeRobot con PyTorch y pesos safetensors, mediante `lerobot-rollout` para ejecución en el robot y `lerobot-train` para reentrenamiento. No aplican servidores de inferencia de LLM como vLLM, TGI, Ollama o llama.cpp, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como referencia operativa, el dataset de entrenamiento se grabó a 15 FPS y el ejemplo de *rollout* de la ficha configura cámaras a 30 FPS durante 60 segundos, pero no se publica ninguna medición de frecuencia de inferencia real.

## Comparativa con modelos similares

No hay datos verificables en la informacion proporcionada sobre parámetros, licencia o rendimiento de las alternativas. La tabla siguiente recoge únicamente lo que se puede afirmar por categoría, marcando como "no disponible" todo aquello que no está confirmado.

| Modelo | Categoría | Parámetros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (esta ficha, `rubatotree/so101_classify_the_blocks_act_manual`) | Transformer encoder-decoder con CVAE para imitación | 51.668.614 | Estado 6-D + imagen 3x480x640 | Apache-2.0 | Pesos safetensors en Hugging Face |
| Diffusion Policy (Chi et al., 2023) | Política visomotora basada en modelos de difusión | no disponible | Imagen + estado (configurable) | no disponible en la información | Repositorio de investigación público |
| Políticas ACT equivalentes publicadas por otros usuarios en el Hub de LeRobot | Transformer con *action chunking* | no disponible | Estado + una o varias cámaras | habitualmente Apache-2.0 en el ecosistema LeRobot, no verificado caso por caso | Variables; muchas con muy pocas descargas |
| Políticas VLA con instrucciones en lenguaje (por ejemplo, familias tipo pi0) | Modelo visión-lenguaje-acción | no disponible | Imagen + estado + instrucción textual | no disponible | Pesos públicos en algunos casos |

La diferencia funcional clave frente a las alternativas basadas en difusión es la velocidad de muestreo: ACT genera el *chunk* de acciones en una sola pasada del decodificador, mientras que las políticas de difusión requieren varios pasos de denoising. Frente a los VLA, esta política carece de comprensión de instrucciones en lenguaje natural: solo ejecuta la tarea para la que fue entrenada.

## Limitaciones y advertencias

- Especialización extrema: entrenada para una única tarea ("classify the blocks") sobre un único tipo de robot y una única cámara. No generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no existe tasa de éxito medida en robot real, por lo que no se puede estimar su fiabilidad en producción.
- Dataset reducido: 120 episodios y 31.602 fotogramas a 15 FPS. Es un volumen bajo, con riesgo de sobreajuste a las posiciones de objeto, la iluminación y el fondo presentes durante la grabación.
- Sensibilidad al montaje: cualquier cambio de posición de la cámara, iluminación, color de los bloques o mesa puede degradar el comportamiento sin aviso.
- Dependencia de las claves de observación: la política espera `observation.state` de 6 dimensiones y `observation.images.front` de 3x480x640. Si los nombres o las dimensiones de las cámaras no coinciden, el *rollout* fallará.
- Sin capacidades de lenguaje: no admite instrucciones en lenguaje natural, diálogo, *tool calling* ni razonamiento multi-paso. La tarea se pasa como cadena fija.
- Sesgos: al derivar de demostraciones humanas, hereda los sesgos del operador (velocidad, trayectorias preferidas, posibles colisiones evitadas de forma idiosincrática).
- Riesgo de alucinación en sentido literal: no aplica generación de texto, pero sí puede producir acciones incorrectas o inseguras ante observaciones fuera de distribución.
- Licencia Apache-2.0: permite uso comercial y modificación siempre que se conserven los avisos de copyright y licencia y se indique si hubo cambios. No hay restricciones de uso comercial, pero el autor no ofrece garantías.
- Advertencia de seguridad física: cualquier despliegue sobre un brazo real debe incluir límites de par, parada de emergencia y espacio de trabajo despejado. LeRobot no incorpora salvaguardas de seguridad certificadas.
- Validación comunitaria mínima: 18 descargas y 0 *likes* en el momento de la consulta; conviene tratar el modelo como un artefacto de investigación sin validación independiente.
- Fecha de publicación poco habitual: los metadatos indican 2026-09-17. Conviene verificar la vigencia del repositorio y de la versión de LeRobot (0.6.1) antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rubatotree/so101_classify_the_blocks_act_manual
- Dataset de entrenamiento: https://huggingface.co/datasets/rubatotree/classify_the_blocks_front
- Visualizador del dataset en LeRobot Spaces: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rubatotree/classify_the_blocks_front
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference

Nota sobre la búsqueda web: los resultados devueltos corresponden a páginas de ayuda de Google Maps y a hilos de Reddit y Stack Overflow sobre esa API. No guardan relación con este modelo ni con robótica, por lo que no se incluyen como fuentes.
