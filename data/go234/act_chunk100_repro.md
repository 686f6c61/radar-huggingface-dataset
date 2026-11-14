# go234/act_chunk100_repro

## Resumen

`go234/act_chunk100_repro` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación publicado en 2023 (arXiv:2304.13705) que predice fragmentos de acciones (*action chunks*) en lugar de pasos individuales. El modelo lo publica el usuario `go234` como reproducción reproducible de un entrenamiento con LeRobot, y está pensado para controlar un robot seguidor de tipo `so_follower` con dos cámaras.

El modelo resuelve una tarea concreta de manipulación: "Pick up the cube and put it in the box." Se entrenó sobre el dataset `go234/cube-box_20261013_041703`, compuesto por 50 episodios y 24.423 fotogramas a 30 FPS de demostraciones teleoperadas. La política consume el estado articular (vector de 6 dimensiones) y dos imágenes RGB de 480x640 píxeles, y emite un vector de acción de 6 dimensiones.

Es relevante como ejemplo mínimo y reproducible de entrenamiento ACT con LeRobot 0.6.0: 51,7 millones de parámetros, pesos en safetensors y licencia Apache 2.0. No es un modelo de lenguaje ni un modelo generativo generalista; es un controlador visual-motor especializado cuya utilidad queda acotada al robot, cámaras y entorno para los que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política visuomotora, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos originales en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica como cadena fija en tiempo de ejecución) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | `cam1`, `cam2` (RGB, 3x480x640) |
| Entrada de estado | `observation.state`, shape (6,) |
| Salida de acción | `action`, shape (6,) |
| Dataset de entrenamiento | `go234/cube-box_20261013_041703` (50 episodios, 24.423 fotogramas, 30 FPS) |
| Tarea | "Pick up the cube and put it in the box." |
| Librería | LeRobot 0.6.0 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT combina un codificador visual (procesa las dos imágenes de `cam1` y `cam2`) con un transformer que modela la secuencia de acciones, y un decodificador que genera un *chunk* de acciones futuras por cada inferencia. Esta predicción por bloques reduce el error de composición acumulado típico de las políticas que predicen una sola acción por paso. El método procede del paper arXiv:2304.13705 y se implementa en LeRobot.

El entrenamiento se realizó con LeRobot 0.6.0 durante 100.000 pasos, con batch size 1, optimizador AdamW, learning rate 1e-5 y semilla 1000. La model card no detalla composición del dataset más allá de los 50 episodios teleoperados de una única tarea, ni indica si hubo aumento de datos, RLHF/DPO (no aplicable en este paradigma) o técnicas adicionales como decodificación especulativa. El nombre del repositorio (`chunk100_repro`) sugiere una reproducción con chunk de 100, aunque ese valor no se confirma explícitamente en la documentación disponible.

## Capacidades

- Generación de acciones de control visuomotor de 6 dimensiones a partir de estado articular y dos vistas RGB.
- Aprendizaje por imitación de una tarea de manipulación concreta: coger un cubo y colocarlo en una caja.
- Predicción de *action chunks* (varias acciones por inferencia), lo que favorece la suavidad y reduce la acumulación de error.
- Ejecución en tiempo real:
  - mediante el comando `lerobot-rollout` sobre un robot `so_follower` con dos cámaras configuradas a 640x480 y 30 FPS;
  - con estrategia `base` (sin grabación de episodios) o con grabación de episodios.
- Entrenamiento reproducible y reentrenamiento con `lerobot-train --policy.type=act`.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modo *thinking*; no es un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos ACT: sirve como referencia reproducible (semilla 1000, 100.000 pasos, configuración documentada) para validar la implementación de ACT en LeRobot 0.6.0 y comparar con variantes propias.
- Manipulación pick-and-place en laboratorio: controlar un `so_follower` para coger un cubo y depositarlo en una caja con dos cámaras cenitales o laterales; adecuado por el bajo coste computacional (51,7 M de parámetros) y la latencia reducida al predecir chunks.
- Base para *fine-tuning* con nuevos datasets: partir de estos pesos y reentrenar con `lerobot-train` sobre demostraciones adicionales del mismo robot y utillaje, aprovechando la licencia Apache 2.0.
- Docencia y formación en robótica de imitación: ejemplo completo de extremo a extremo (grabación de datos, entrenamiento, rollout) con hardware asequible tipo SO-100/SO-101.
- Pruebas de integración de pipelines LeRobot: verificar instalación, calibración de cámaras, nombres de claves de observación y ejecución de `lerobot-rollout` antes de entrenar políticas propias.
- Evaluación comparativa de políticas: usar el modelo como *baseline* frente a otras variantes (por ejemplo, con distinto tamaño de chunk) en la misma tarea y mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No existen tasas de éxito, latencias ni métricas de *throughput* documentadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (51,7 M de parámetros en safetensors; los pesos ocupan del orden de 100-200 MB). No se documenta un requisito oficial.
- GPU recomendadas: cualquier GPU con CUDA es suficiente dada la carga; el autor usa `--policy.device=cuda` en el ejemplo de entrenamiento. Para entrenamiento se recomienda al menos una GPU de gama media; no se especifican modelos concretos.
- GPU de consumo: el modelo cabe holgadamente en cualquier GPU de consumo moderna (por ejemplo, RTX 3060 o superior); no se han publicado mediciones.
- Opciones de despliegue: `lerobot-rollout` (inferencia sobre robot real) y `lerobot-train` (entrenamiento); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La configuración de captura es de 30 FPS, pero no se publica latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Paradigma | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `go234/act_chunk100_repro` | ACT (chunking) | 51,7 M | estado (6,) + 2 imágenes 480x640 | Apache 2.0 | Hugging Face |
| Políticas ACT de referencia en LeRobot | ACT (chunking) | variable según configuración | estado + imágenes | Apache 2.0 (LeRobot) | Hugging Face / docs LeRobot |
| Políticas Diffusion Policy | difusión de acciones | variable | estado + imágenes | según implementación | Hugging Face / repositorios de investigación |
| Políticas basadas en VLA (vision-language-action) | transformer multimodal | cientos de millones a miles de millones | instrucción en lenguaje + imágenes | variable | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: este modelo no publica métricas y las alternativas citadas no se han evaluado en el mismo dataset ni robot. Cualquier comparación de éxito requeriría ejecutar las políticas en el mismo entorno físico.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con 50 episodios de un único operador, hereda los sesgos de estilo y trayectoria de ese operador.
- Riesgo de sobreajuste al entorno: la política se entrenó con posiciones, iluminación y utillaje concretos; cambios en la disposición de objetos, colores o iluminación pueden degradar el rendimiento.
- Dependencia estricta del hardware: espera un robot `so_follower`, dos cámaras con nombres `cam1` y `cam2`, y resoluciones 640x480 a 30 FPS; desviaciones en la calibración o en los índices de cámara rompen la inferencia.
- Sin evaluación publicada: no hay tasa de éxito ni número de ensayos, por lo que no puede afirmarse su fiabilidad en producción.
- Alcance limitado: no es un modelo de lenguaje ni un agente general; no soporta tool calling, razonamiento multi-paso ni conversación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene citar el paper ACT (arXiv:2304.13705) y LeRobot según indica la model card.
- Reproducibilidad condicionada: la configuración documentada (semilla, pasos, learning rate) no garantiza resultados idénticos si cambian versiones de LeRobot, CUDA o drivers.
- Fechas del repositorio y del dataset posteriores a la fecha actual de referencia; conviene verificar su vigencia antes de integrarlo en un proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/go234/act_chunk100_repro
- Dataset de entrenamiento: https://huggingface.co/datasets/go234/cube-box_20261013_041703
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=go234/cube-box_20261013_041703
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
