# mrrl-emcnei/diffusion_pnp-blcb-1p1o

## Resumen

`mrrl-emcnei/diffusion_pnp-blcb-1p1o` es una política de control visuomotor entrenada con el algoritmo Diffusion Policy (arXiv:2303.04137) y publicada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: recibe el estado del robot (vector de 16 dimensiones) y tres imágenes RGB de 480x640 píxeles (una cámara cenital y dos cámaras de muñeca) y devuelve un vector de acción de 16 dimensiones. El checkpoint tiene 293.326.840 parámetros y ocupa 1,2 GB en formato safetensors.

Está especializada en una única tarea de manipulación, «Pick the blue cube and place it in the black bowl», aprendida por imitación a partir de 50 episodios (20.118 fotogramas a 30 FPS) teleoperados sobre un robot `mobileai_robot`. Diffusion Policy formula la generación de acciones como un proceso de difusión generativo, lo que produce trayectorias multimodales y suaves, adecuadas para manipulación con contacto rico.

Su relevancia es fundamentalmente práctica: documenta un pipeline completo de imitation learning con LeRobot 0.6.2 (dataset, configuración de entrenamiento y comando de rollout). Sin embargo, el autor no ha publicado ninguna evaluación en robot real ni tasa de éxito, por lo que el rendimiento efectivo del checkpoint es desconocido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (difusión condicionada para control visuomotor); el backbone concreto (U-Net 1D o variante transformer) no está documentado en la model card |
| Parametros totales | 293.326.840 |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje; el horizonte de acciones y el número de pasos de difusión no están documentados) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (1,2 GB para 293 M de parámetros, coherente con fp32) |
| Idiomas soportados | no disponible (no aplica; la instrucción de tarea está en inglés y se pasa como texto al rollout) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB, librería `lerobot`) |

Otros datos de la model card: tipo de robot `mobileai_robot`; cámaras `cam_high`, `cam_left_wrist`, `cam_right_wrist`; entrada `observation.state` con forma `(16,)`; salida `action` con forma `(16,)`.

## Arquitectura y entrenamiento

Diffusion Policy trata el control visuomotor como un problema generativo: la política aprende a invertir un proceso de difusión que añade ruido a las acciones, de modo que en inferencia parte de ruido gaussiano y lo denoisa condicionado por las observaciones (estado propioceptivo e imágenes). En lugar de predecir una única acción, el modelo predice secuencias de acciones (action chunking) y ejecuta solo un subconjunto antes de volver a planificar, lo que aporta suavidad temporal y permite representar distribuciones multimodales de comportamiento, algo útil en tareas con contacto. El paper enlazado describe variantes con backbone convolucional (U-Net 1D) y con backbone transformer; para este checkpoint concreto la model card no especifica cuál se usó ni cuántos pasos de denoising se emplean en inferencia.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `mrrl-emcnei/pnp-blcb-1p1o`: 50 episodios, 20.118 fotogramas a 30 FPS, una única instrucción de tarea. La configuración declarada es de 100.000 pasos con batch de 8 (unas 800.000 muestras vistas, equivalentes a aproximadamente 40 pasadas sobre el dataset), optimizador Adam, learning rate 1e-4 y semilla 1000. No se documenta ningún proceso de RLHF, DPO ni ajuste por refuerzo, lo cual es esperable en imitation learning. Tampoco se detalla la composición de datos aumentados, la resolución de las imágenes durante el entrenamiento ni si se aplicaron augmentations visuales.

## Capacidades

- Control visuomotor de manipulación: genera trayectorias de acción de 16 dimensiones a partir de tres vistas de cámara y del estado del robot.
- Ejecución de una tarea de pick-and-place específica: coger el cubo azul y depositarlo en el cuenco negro.
- Generación de acciones multimodales y temporalmente suaves gracias al modelado por difusión, con ventaja en fases de contacto (agarre, inserción, soltado).
- Política reactiva: consume observaciones en bucle cerrado, por lo que puede corregir desviaciones durante la ejecución.
- Integración nativa con el ecosistema LeRobot: carga directa con `lerobot-rollout` y compatible con el flujo `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, visión general, audio ni generación de texto: no es un modelo fundacional de propósito general.

## Casos de uso

- Automatización de una celda de pick-and-place: el modelo ejecuta la secuencia completa de recogida y depósito a 30 FPS sobre un `mobileai_robot` con tres cámaras, sustituyendo la programación explícita de trayectorias por una política aprendida.
- Baseline de investigación en imitation learning: sirve como referencia reproducible de Diffusion Policy con hiperparámetros y dataset publicados, para comparar frente a ACT, VQ-BeT u otras políticas del catálogo de LeRobot.
- Validación de pipelines de datos robóticos: al estar vinculado a un dataset de 50 episodios y 20.118 fotogramas, permite probar de extremo a extremo el flujo de grabación, cuantización de episodios, entrenamiento y despliegue.
- Prototipado rápido de manipulación con contacto rico: tareas donde el objeto debe deslizarse o encajarse se benefician de la representación multimodal de acciones del modelo, frente a políticas deterministas que promedian modos.
- Docencia y formación en robótica: el comando de rollout documentado y el espacio de visualización del dataset permiten reproducir el experimento en laboratorio con hardware asequible.
- Evaluación de robustez visual: al depender de tres cámaras fijas, el modelo es un banco de pruebas para medir la degradación ante cambios de iluminación, oclusiones o desplazamientos de cámara.
- Punto de partida para fine-tuning en una tarea propia: reentrenar con `--policy.type=diffusion` sobre un dataset nuevo partiendo de esta configuración de hiperparámetros reduce el coste de búsqueda inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet», e incluye una plantilla de tabla de éxito (tarea, ensayos, aciertos, tasa) sin cumplimentar. No existen, por tanto, cifras de tasa de éxito, MMLU, HumanEval, GSM8K ni métricas equivalentes aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 y 4 GB en fp32 con lote de 1 (estimación propia a partir de los 1,2 GB de pesos más las activaciones de tres codificadores visuales sobre imágenes de 480x640; no publicada por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para ejecución cómoda; RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, RTX A5000 o A100. Para control en bucle cerrado a 30 Hz con múltiples pasos de denoising conviene una GPU dedicada de gama media-alta.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 8 GB o más, dado el tamaño del checkpoint.
- Opciones de despliegue: `lerobot-rollout` (script oficial documentado en la model card) sobre PyTorch con CUDA. No se documenta exportación a ONNX, TensorRT, ni soporte en llama.cpp, Ollama, vLLM o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. No se especifican el número de pasos de difusión, el tiempo por inferencia ni la frecuencia real alcanzada en el robot.

## Comparativa con modelos similares

La información proporcionada no incluye parámetros, contextos ni métricas de las alternativas, por lo que las celdas correspondientes se marcan como no disponibles. La comparación es, por tanto, cualitativa y centrada en el paradigma y la disponibilidad.

| Política | Paradigma | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion_pnp-blcb-1p1o (este modelo) | Difusión condicionada con action chunking | 293.326.840 | Estado (16) + 3 imágenes 480x640 | apache-2.0 | Hugging Face Hub, librería `lerobot` |
| ACT (Action Chunking Transformer) | Transformer con CVAE y chunking de acciones | no disponible | Estado + imágenes | no disponible en la información aportada | implementada en LeRobot |
| VQ-BeT | Cuantización vectorial de acciones + generación autoregresiva | no disponible | Estado + imágenes | no disponible en la información aportada | implementada en LeRobot |
| Políticas VLA tipo SmolVLA / pi0 | Modelos visión-lenguaje-acción con instrucción en lenguaje natural | no disponible | Estado + imágenes + texto | no disponible en la información aportada | ecosistema LeRobot |

Diferencias clave frente a las alternativas: este checkpoint es un modelo de una sola tarea, sin entrada de lenguaje natural, mientras que las políticas VLA aceptan instrucciones textuales y generalizan a múltiples tareas a costa de un mayor tamaño. Frente a ACT, el enfoque de difusión maneja mejor distribuciones multimodales de acción, pero requiere varios pasos de denoising por inferencia.

## Limitaciones y advertencias

- Especialización extrema: una única tarea («Pick the blue cube and place it in the black bowl») y 50 episodios de entrenamiento; no se espera generalización a otros objetos, contenedores o instrucciones.
- Ausencia total de evaluación: no hay tasa de éxito publicada, ni número de ensayos, ni condiciones de prueba. El rendimiento real en robot es desconocido.
- Dependencia estricta de la configuración sensorial: los nombres de cámara (`cam_high`, `cam_left_wrist`, `cam_right_wrist`), la resolución 480x640, los 30 FPS y el tipo de robot `mobileai_robot` deben coincidir, incluida la calibración, o la política fallará.
- Riesgo de sobreajuste al entorno de grabación: con 50 episodios, cambios de iluminación, fondo, posición inicial de los objetos o del robot pueden degradar gravemente el comportamiento. Este tipo de fallo se manifiesta como acciones erráticas o bloqueos, no como «alucinación» en el sentido de los modelos de lenguaje.
- Sin mecanismo de estimación de incertidumbre ni de detección de fallo: la política siempre emite una acción de 16 dimensiones, incluso fuera de distribución.
- Sesgos: no hay información sobre la diversidad de posiciones, objetos o condicionesdurante la grabación, por lo que no puede caracterizarse el sesgo del dataset.
- Idioma: la instrucción de tarea se pasa en inglés; no hay soporte multilingüe ni interfaz en castellano.
- Licencia apache-2.0: permite uso comercial y modificación, pero el usuario debe verificar las licencias de LeRobot y de las dependencias, así como el cumplimiento de normativa de seguridad aplicable a robots físicos.
- No apto para producción sin validación previa: al no existir métricas, cualquier despliegue exige una campaña de evaluación propia con ensayos repetidos y análisis de modos de fallo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrrl-emcnei/diffusion_pnp-blcb-1p1o
- Dataset de entrenamiento: https://huggingface.co/datasets/mrrl-emcnei/pnp-blcb-1p1o
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrrl-emcnei/pnp-blcb-1p1o
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
