# raihan-js/demodoctor-act-cleaned-s1

## Resumen

`raihan-js/demodoctor-act-cleaned-s1` no es un modelo de lenguaje, sino una política de control robótico de imitación basada en ACT (Action Chunking with Transformers, arXiv 2304.13705) y entrenada con la librería LeRobot de HuggingFace. El modelo aprende a resolver la tarea "Push the T-shaped block onto the T-shaped target" a partir de demostraciones teleoperadas, consumiendo una imagen RGB de 96x96 píxeles y un vector de estado de 2 dimensiones, y produciendo una acción de 2 dimensiones (típicamente velocidad o posición cartesiana en un plano).

El autor, raihan-js (Akteruzzaman Raihan Sikder, ingeniero de IA/ML en Bangladés), lo publica como parte de su proyecto DemoDoctor, cuyo objetivo es medir de forma controlada cuánto afecta la calidad de los datos de demostración al éxito de una política de imitación. Esta variante concreta está entrenada sobre la versión "cleaned" (limpia) del dataset `raihan-js/demodoctor-pusht-cleaned`, de modo que sirve como referencia o línea base frente a políticas entrenadas con datos corruptos y con datos autocorregidos.

Con 51.660.418 parámetros (unos 51,7 millones) y un repositorio de solo 0,2 GB, es una política ligera que puede ejecutarse en hardware muy modesto. Su relevancia es metodológica más que de rendimiento: es un artefacto reproducible (semilla, pasos, optimizador y versión de LeRobot documentados) para estudiar el impacto de la curación de datos en robótica, un tema recurrente en los equipos de robot learning. No se han publicado resultados de evaluación de la política en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con CVAE para predicción de chunks de acción |
| Parametros totales | 51.660.418 (aprox. 51,7 M), según safetensors del repositorio |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); horizonte de chunk no documentado en la model card |
| Tipos de cuantizacion | no disponible; pesos en safetensors sin cuantización declarada |
| Idiomas soportados | no aplica (no procesa lenguaje natural); condicionamiento por tarea no declarado entre las entradas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Entradas | `observation.image` VISUAL `(3, 96, 96)`; `observation.state` STATE `(2,)` |
| Salidas | `action` ACTION `(2,)` |
| Camaras | `image` (una cámara) |
| Frecuencia del dataset de entrenamiento | 10 FPS |
| Framework | LeRobot 0.6.1 (PyTorch) |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso de control. La arquitectura combina un encoder visual y de estado con un transformer encoder-decoder, y utiliza una formulación CVAE (autoencoder variacional condicional) en la que un encoder de estilo procesa las acciones de la demostración durante el entrenamiento y se descarta en inferencia. Predecir chunks en lugar de pasos individuales reduce el error de compartición (compounding error) característico del comportamiento clonado, y en inferencia suele combinarse con ensamblado temporal de predicciones solapadas para suavizar el control.

El entrenamiento se realizó con 60.000 pasos, batch de 32, optimizador AdamW y tasa de aprendizaje 1e-05 con semilla 1. El dataset `raihan-js/demodoctor-pusht-cleaned` contiene 175 episodios y 21.735 fotogramas a 10 FPS de una única tarea de empuje de un bloque en forma de T sobre una diana con la misma forma. No hay indicios de RLHF, DPO ni aprendizaje por refuerzo: es comportamiento clonado puro sobre demostraciones teleoperadas. Según la descripción del proyecto DemoDoctor en GitHub, el flujo de trabajo inyecta fallos conocidos en demostraciones limpias, los detecta a partir de señales y mide el éxito de la política en simulación sobre datos limpios, corruptos y autocorregidos; esta política corresponde a la rama de datos limpios y semilla 1.

## Capacidades

- Control visomotor para manipulación planar: predice acciones de 2 grados de libertad a partir de una imagen de 96x96 y un estado de 2 dimensiones.
- Predicción por chunks de acción, lo que permite un control más estable que la predicción paso a paso.
- Ejecución de una única tarea concreta de empuje ("Push the T-shaped block onto the T-shaped target") en el entorno de PushT.
- Integración directa con el ecosistema LeRobot: carga desde el Hub, ejecución con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No soporta generación de texto, razonamiento simbólico, código ni matemáticas.
- No soporta tool calling, function calling ni uso como agente multi-paso.
- No hay capacidades multilingües: no procesa lenguaje natural.
- No dispone de modo de pensamiento, visión generalista, audio ni otras modalidades fuera de la imagen de entrada.

## Casos de uso

- Línea base del experimento DemoDoctor: esta política es la referencia entrenada con demostraciones limpias, de modo que cualquier mejora medida sobre políticas entrenadas con datos corruptos o autocorregidos debe compararse contra ella en la misma tarea y semilla.
- Estudio del impacto de la calidad de datos en imitación: permite cuantificar la caída (o no) de la tasa de éxito cuando el mismo algoritmo ACT se entrena con datos con fallos inyectados, aislando la variable de calidad del dataset.
- Validación de pipelines de limpieza automática: al existir una versión "cleaned" y su equivalente sobre datos completos, se puede medir si el filtrado automático recupera el rendimiento de la política limpia.
- Reentrenamiento para tareas de empuje propias: el script `lerobot-train` documentado permite reutilizar la receta (ACT, 60.000 pasos, batch 32, lr 1e-05) sobre un dataset propio de manipulación planar.
- Prototipado docente en robótica: por su tamaño (51,7 M de parámetros) y su licencia Apache-2.0, es adecuado para prácticas de aprendizaje por imitación y despliegue en laboratorios con hardware limitado.
- Evaluación en simulación: el proyecto DemoDoctor mide el éxito de la política en simulación sobre datos limpios, corruptos y autocorregidos, por lo que esta política encaja como componente evaluado en bucles automáticos de experimentación.
- Reproducción de resultados de ACT: sirve para verificar la implementación de ACT de LeRobot 0.6.1 sobre un dataset de tamaño medio (175 episodios, 21.735 fotogramas) con hiperparámetros documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"), y no aparece ninguna tabla de tasa de éxito, número de ensayos ni comparación numérica en los resultados de búsqueda disponibles.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia aritmética a partir del número de parámetros declarado, los pesos ocuparían aproximadamente 207 MB en fp32 y unos 103 MB en fp16; a ello habría que sumar activaciones y buffers del encoder visual, de modo que la cifra real es superior pero previsiblemente inferior a 1 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con soporte CUDA de los últimos años es suficiente; una RTX 3060, RTX 4090, A100 o H100 estarían sobradamente dimensionadas para esta política.
- GPU de consumo: sí cabe con holgura en cualquier GPU de consumo actual, e incluso en GPUs integradas o en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=raihan-js/demodoctor-act-cleaned-s1` y `--strategy.type=base`, sobre PyTorch con CUDA o CPU. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabó a 10 FPS, mientras que el ejemplo de ejecución configura las cámaras a 30 FPS, pero no se documenta la frecuencia de control efectiva ni la latencia de inferencia.
- Almacenamiento: el repositorio ocupa 0,2 GB, por lo que el despliegue no plantea requisitos de disco relevantes.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `raihan-js/demodoctor-act-cleaned-s1` | ACT (chunking de acciones con transformer + CVAE) | 51,66 M | no disponible | apache-2.0 | HuggingFace Hub, librería `lerobot` |
| ACT original (Zhao et al., arXiv 2304.13705) | ACT | no disponible | no disponible | no disponible en la información proporcionada | paper y código de referencia |
| Diffusion Policy | política generativa basada en difusión de acciones | no disponible | no disponible | no disponible en la información proporcionada | implementaciones públicas |
| VQ-BeT | política jerárquica con cuantización vectorial de comportamiento | no disponible | no disponible | no disponible en la información proporcionada | implementaciones públicas |

La comparación cuantitativa de parámetros, contexto y rendimiento entre estas alternativas no está disponible en la información proporcionada. La diferencia principal de esta ficha frente a las demás es que se trata de una política ya entrenada y publicada en el Hub, con hiperparámetros y dataset documentados, mientras que las alternativas se citan como métodos de referencia.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada, ni número de ensayos, ni condiciones de prueba, por lo que el rendimiento real de la política es desconocido.
- Especialización extrema: está entrenada para una única tarea ("Push the T-shaped block onto the T-shaped target") sobre una única distribución de datos, con una cámara y una resolución fija de 96x96.
- Sensibilidad al entorno: cualquier cambio en la posición, el tipo o la calibración de la cámara, en la iluminación o en la disposición de los objetos puede degradar el comportamiento, ya que no hay aumentos de datos ni evaluación de robustez documentados.
- Sin generalización a otras tareas ni condicionamiento por lenguaje: no se declara la tarea como entrada del modelo, por lo que no cabe esperar control instruido por texto.
- Riesgo de sobreajuste y de fallo silencioso: al ser comportamiento clonado sobre 175 episodios de una sola tarea, los modos de fallo no están caracterizados.
- Adopción nula: cero descargas y cero "likes" en el momento de la consulta, sin validación por parte de terceros.
- Fechas del repositorio: la model card indica creación el 2026-10-04, una fecha posterior a la habitual en el ecosistema, lo que conviene verificar antes de citarla.
- Licencia: los pesos son Apache-2.0, lo que permite uso comercial, pero la licencia del dataset `raihan-js/demodoctor-pusht-cleaned` no está disponible en la información proporcionada y debe comprobarse por separado.
- No apta para producción robótica sin validación previa en el hardware objetivo y sin evaluación de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raihan-js/demodoctor-act-cleaned-s1
- Dataset de entrenamiento: https://huggingface.co/datasets/raihan-js/demodoctor-pusht-cleaned
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=raihan-js/demodoctor-pusht-cleaned
- Proyecto DemoDoctor (GitHub): https://github.com/raihan-js/demodoctor
- Perfil de GitHub del autor: https://github.com/raihan-js/
- Perfil de HuggingFace del autor: https://huggingface.co/raihan-js/datasets
- Web personal del autor: https://raihan-js.github.io/
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Cita de LeRobot (bibtex): Cadene, Remi et al., "LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch", 2024.
