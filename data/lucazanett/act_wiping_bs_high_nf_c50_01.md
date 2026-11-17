# lucazanett/act_wiping_bs_high_nf_c50_01

## Resumen
`act_wiping_bs_high_nf_c50_01` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado por el usuario lucazanett en Hugging Face mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de observaciones (imágenes de cámaras y estado del robot), predice secuencias cortas de acciones articulares en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación.

El modelo tiene 51.627.658 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras ejecutables en GPUs de consumo. Se ha entrenado sobre el dataset `lucazanett/new_setup_baseline_high_no_force`, cuyo nombre sugiere un montaje experimental orientado a tareas de limpieza o frotado ("wiping") sin sensor de fuerza, con 50 episodios o pasos de chunking según la nomenclatura del identificador.

Su relevancia es acotada: se trata de un checkpoint experimental con cero descargas y cero likes en el momento de la consulta, sin model card detallada más allá de la plantilla estándar de LeRobot. Resulta útil como referencia de implementación de ACT con LeRobot y como punto de partida reproducible para quien trabaje con el mismo montaje hardware, pero no debe considerarse un modelo validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.627.658 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la política, no documentada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo visuomotor, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone de visión (típicamente ResNet) que codifica las imágenes de las cámaras con un transformer encoder-decoder que fusiona esas características visuales con el estado proprioceptivo del robot y genera un chunk de acciones futuras de forma conjunta. La predicción por chunks, en lugar de acción a acción, mitiga el problema de la acumulación de errores en políticas de comportamiento (behavior cloning) y suaviza las trayectorias.

El entrenamiento se realiza sobre datos de teleoperación. En este caso, el dataset asociado es `lucazanett/new_setup_baseline_high_no_force`, del que no se dispone de número de episodios, horas de grabación ni composición detallada. El sufijo del identificador (`bs_high`, `nf`, `c50`) sugiere un baseline con ausencia de señal de fuerza y un chunk size de 50, pero esta interpretación no está confirmada en la información disponible. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores, algo esperable en este tipo de políticas.

## Capacidades
- Control visuomotor de robots manipuladores tipo SO-100/SO-101 (el ejemplo de la model card usa `so100_follower`).
- Predicción de chunks de acciones articulares a partir de observaciones multimodales (imágenes + estado).
- Ejecución de tareas de frotado o limpieza ("wiping") en el montaje concreto del dataset de entrenamiento.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso
- Reproducción de experimentos ACT: sirve como checkpoint de referencia para comparar variantes de arquitectura o de dataset dentro de LeRobot, cargándolo con `--policy.path` en `lerobot-record`.
- Automatización de tareas de limpieza en banco de pruebas: el modelo puede ejecutar la política de wiping sobre el robot SO-100 del montaje original, siempre que se replique la configuración de cámaras y calibración.
- Base para fine-tuning con datos propios: al ser una política ligera (51,6 M de parámetros) y con licencia Apache 2.0, es viable reentrenarla con un dataset propio de teleoperación para una tarea similar.
- Docencia e investigación en aprendizaje por imitación: permite ilustrar el flujo completo de LeRobot (grabación, entrenamiento, evaluación) con un modelo pequeño que cabe en una GPU de consumo.
- Evaluación comparativa de políticas: útil como baseline "sin fuerza" frente a variantes que incorporen sensor de fuerza en el mismo montaje.
- Prototipado rápido en laboratorio: al ocupar 0,2 GB, se puede desplegar en estaciones de trabajo modestas para pruebas de concepto de manipulación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de trayectoria ni comparaciones con otras políticas, y el repositorio no registra descargas ni evaluaciones públicas.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,6 M de parámetros (aproximadamente 0,21 GB solo de pesos, más activaciones y buffers de imagen).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento se recomienda RTX 3090/4090 o A100 si se amplía el dataset.
- Cabe holgadamente en GPUs de consumo, incluidas GTX 1650 o RTX 3050 portátiles.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) es la vía documentada. No se han publicado conversiones a ONNX, TensorRT ni formatos GGUF.
- Latencia y throughput: no disponibles. La latencia vendrá dominada por la inferencia del encoder visual y el bucle de control del robot, no por el tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_wiping_bs_high_nf_c50_01 | 51,6 M | no aplica | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| ACT original (paper 2304.13705) | no disponible en la información | no aplica | tasas de éxito reportadas en el paper, no comparables directamente | no disponible | código y pesos de referencia en el ecosistema LeRobot |
| Otras políticas LeRobot (Diffusion Policy, TDMPC) | variable | no aplica | no disponible en esta consulta | variable | Hugging Face / LeRobot |

No se dispone de datos suficientes para establecer una comparación cuantitativa con alternativas; la comparativa anterior es meramente descriptiva.

## Limitaciones y advertencias
- Modelo experimental sin validación pública: cero descargas y cero likes, sin métricas de éxito reportadas.
- Fuerte dependencia del montaje: la política está entrenada para un robot, cámaras y calibración concretos; cambiar la cámara, la iluminación o la posición del robot degradará el rendimiento.
- Sin señal de fuerza: el identificador sugiere un baseline "no force", por lo que no reaccionará a contactos físicos inesperados.
- Riesgo de sobreajuste al dataset: con un único dataset y sin información sobre su tamaño, es probable que generalice mal a objetos o posiciones no vistos.
- Sin capacidades de lenguaje: no debe emplearse para tareas de texto, razonamiento o diálogo.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento físico del robot recae en el integrador; se recomienda supervisión humana y parada de emergencia.
- No hay información sobre sesgos, alucinación (no aplica en el sentido habitual) ni limitaciones idiomáticas.
- La fecha de creación del repositorio (2026-11-17) es posterior a la fecha actual de referencia habitual; conviene verificar la integridad del checkpoint antes de usarlo.

## Enlaces
- Hugging Face: https://huggingface.co/lucazanett/act_wiping_bs_high_nf_c50_01
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/lucazanett/new_setup_baseline_high_no_force
