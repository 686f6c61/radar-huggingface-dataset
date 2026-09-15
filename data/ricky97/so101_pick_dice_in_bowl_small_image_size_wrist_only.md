# Ricky97/SO101_pick_dice_in_bowl_small_image_size_wrist_only

## Resumen

Este repositorio contiene una política de control visuomotor entrenada con LeRobot mediante *Diffusion Policy*, el método presentado en el artículo arXiv:2303.04137, que trata el control visuomotor como un proceso generativo de difusión. En lugar de predecir una única acción por paso, el modelo produce trayectorias de acción multimodales y suaves, lo que resulta especialmente adecuado para tareas de manipulación con contacto rico. El autor es el usuario de HuggingFace Ricky97 y la política se publica bajo licencia Apache 2.0.

Se trata de un modelo pequeno, de 76.201.934 parámetros (unos 76,2 M), orientado a un robot concreto de tipo `so_follower` (el seguidor del brazo SO-101 de LeRobot). La tarea entrenada es específica: "Pick the dice and put it in the white bowl" (coger el dado y meterlo en el cuenco blanco), con una única cámara de muneca como entrada visual y un vector de estado de 6 dimensiones.

Su relevancia es práctica y no de escala: es un ejemplo reproducible de *imitation learning* de bajo coste que cabe en cualquier GPU de consumo y sirve como referencia para quien quiera entrenar o reproducir políticas de difusión con LeRobot 0.6.2 sobre hardware accesible. No dispone de resultados de evaluación publicados ni de descargas, por lo que debe considerarse un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (control visuomotor como proceso de difusion generativo) |
| Parametros totales | 76.201.934 (aprox. 76,2 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; cada inferencia procesa una observacion) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; sin variantes GGUF/AWQ/GPTQ documentadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de Diffusion Policy: en lugar de una regresión directa accion-observacion, aprende a desruidar una secuencia de acciones condicionada por las observaciones, lo que permite representar distribuciones multimodales de comportamiento y generar trayectorias suaves de varios pasos. En LeRobot, la política consume una observacion compuesta por el estado del robot (`observation.state`, vector de 6 componentes) y una imagen de muneca (`observation.images.wrist`, tensor de 3x480x640), y produce un vector de acción de 6 componentes. La model card cita el artículo Diffusion Policy (arXiv:2303.04137) como referencia del método.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Ricky97/SO101_pick_dice_in_bowl`, compuesto por 30 episodios y 11.573 fotogramas capturados a 30 FPS de la única tarea "Pick the dice and put it in the white bowl". La configuración reportada es de 150.000 pasos de entrenamiento, tamano de lote 32, optimizador Adam, tasa de aprendizaje 0,0001 y semilla 1000. No se documentan detalles sobre la composición exacta del encoder visual, el número de pasos de difusión ni si se aplicó algún tipo de refinamiento posterior (RLHF/DPO equivalentes), por lo que esos datos quedan como no disponibles.

## Capacidades

- Generación de trayectorias de acción multimodales y suaves para control visuomotor continuo.
- Manipulación robotica con contacto rico: la tarea objetivo es coger un dado y depositarlo en un cuenco.
- Control reactivo a partir de una imagen de muneca en resolución 480x640 a 30 FPS.
- Integración con el robot `so_follower` del ecosistema LeRobot mediante el comando `lerobot-rollout`.
- Entrada de estado propioceptivo de 6 dimensiones y salida de acción de 6 dimensiones.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni ninguna capacidad fuera del control robotico.

## Casos de uso

- Reproducción de la tarea entrenada: ejecutar la política sobre un brazo SO-101 (`so_follower`) para realizar el pick-and-place del dado en el cuenco blanco, usando `lerobot-rollout` con la cámara de muneca calibrada.
- Base para *imitation learning* propio: partir de esta política y del dataset de 30 episodios para reentrenar con `lerobot-train` sobre una tarea similar de manipulación con un solo objeto.
- Referencia educativa de Diffusion Policy: estudiar un caso completo y de bajo coste de política de difusión entrenada de extremo a extremo dentro de LeRobot.
- Prototipado de manipulación en investigación: validar pipelines de captura de datos a 30 FPS, calibración de cámara de muneca y control de un seguidor antes de escalar a tareas más complejas.
- Comparación de metodos en robótica: usar esta política como línea base de difusión frente a alternativas como ACT sobre el mismo tipo de robot y dataset.
- Despliegue en hardware de bajo coste: al tener solo ~76 M de parámetros, permite experimentar con inferencia en GPU de consumo o incluso CPU para pruebas no críticas.
- Benchmark interno de recogida de datos: servir de plantilla para medir cuántos episodios y fotogramas hacen falta para una tarea de pick-and-place concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política (_No evaluation results have been provided for this policy yet_), por lo que no existe tasa de éxito en robot real, número de ensayos ni comparación cuantitativa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,3 GB solo para los pesos (76,2 M de parámetros).
- VRAM estimada en FP16/BF16: aproximadamente 0,15 GB solo para los pesos. El consumo real será mayor por activaciones y procesamiento de imagen.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), en iGPU modernas y, con latencia mayor, en CPU.
- El cuello de botella habitual no es el tamano del modelo, sino mantener el bucle de control a 30 FPS con captura de cámara y preprocesado de imagen.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA es suficiente; no se requiere A100 ni H100 para esta política.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`), PyTorch con CUDA. No se documentan soportes para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles (no se reportan medidas en la información proporcionada).

## Comparativa con modelos similares

No se dispone de datos cuantitativos publicados para esta política ni para alternativas comparables en la información proporcionada. Como referencia cualitativa, dentro del ecosistema LeRobot la alternativa metodológica más habitual a Diffusion Policy es ACT (Action Chunking Transformer), también orientada a imitación visuomotora sobre robots tipo SO-101.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| SO101_pick_dice_in_bowl_small_image_size_wrist_only (Diffusion Policy) | 76,2 M | No aplica | Apache 2.0 | HuggingFace (LeRobot) | No publicados |
| Políticas ACT comparables en LeRobot | No disponible | No aplica | No disponible | No disponible | No disponible |
| Otras políticas de difusión de la comunidad | No disponible | No aplica | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No hay resultados de evaluación: se desconoce la tasa de éxito real de la política y su robustez.
- Sesgos conocidos: no aplica en el sentido de sesgos linguisticos, pero la política puede estar sobreajustada a las condiciones del dataset (posiciones de objeto, iluminación, fondo y robot concretos).
- Riesgo de alucinacion: no aplica; el riesgo equivalente es generar trayectorias de acción no válidas o inseguras ante observaciones fuera de distribución.
- Entrenada sobre una única tarea y solo 30 episodios / 11.573 fotogramas, lo que limita la generalización a otras tareas u objetos.
- Discrepancia en la model card: se listan las camaras `wrist` y `agent`, pero la tabla de entradas solo incluye `observation.images.wrist`, y el nombre del modelo indica "wrist_only". Conviene verificar qué cámara se usa realmente antes de desplegar.
- Dependencia fuerte del hardware: requiere un robot `so_follower` y una cámara de muneca calibrada con nombres de observación coincidentes (`observation.images.wrist`).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de validación en robot real hace desaconsejable su uso en producción sin una evaluación propia.
- Sin descargas ni likes en el momento de la consulta, lo que indica que es un artefacto de investigación sin validación comunitaria.
- Datos de cuantizacion y despliegue en formatos alternativos no documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ricky97/SO101_pick_dice_in_bowl_small_image_size_wrist_only
- Dataset de entrenamiento: https://huggingface.co/datasets/Ricky97/SO101_pick_dice_in_bowl
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Ricky97/SO101_pick_dice_in_bowl
- Articulo Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
