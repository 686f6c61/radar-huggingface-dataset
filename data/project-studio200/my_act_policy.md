# Project-Studio200/my_act_policy

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, en lugar de una única acción por inferencia. El modelo `Project-Studio200/my_act_policy` es una política concreta entrenada con este método mediante la librería LeRobot de Hugging Face y publicada en el Hub por el usuario Project-Studio200. Se distribuye como pesos en formato safetensors con 51.668.614 parámetros (aproximadamente 51,7 millones) y un tamaño de repositorio de 0,2 GB.

La política está especializada en control robótico visomotor: consume el estado de las articulaciones (`observation.state`, vector de 6 dimensiones) y una imagen de cámara cenital (`observation.images.top`, tensor de 3x480x640) y produce un vector de acción de 6 dimensiones. Está asociada al tipo de robot `so_follower` (el seguidor del brazo SO-100/SO-101 de bajo coste), por lo que su ámbito de aplicación es la manipulación robótica de sobremesa, no el procesamiento de lenguaje natural.

Su relevancia es doble: por un lado, demuestra el flujo completo de entrenamiento y publicación de políticas con LeRobot 0.6.2; por otro, sirve como punto de partida reproducible para quien quiera replicar el método ACT sobre su propio conjunto de datos teleoperados. El entrenamiento se realizó con 51 episodios y 20.730 fotogramas a 30 FPS, con 100.000 pasos de optimización. No se han publicado resultados de evaluación en robots reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers), encoder visual convolucional + transformer encoder-decoder con predicción de chunks de acciones |
| Parametros totales | 51.668.614 (aproximadamente 51,7 M) |
| Longitud de contexto | No aplica: política de imitación visomotora, no procesa secuencias de texto |
| Tipos de cuantizacion | No se documentan variantes cuantizadas; el repositorio distribuye safetensors en precisión completa |
| Idiomas soportados | No aplica: no procesa lenguaje natural (los campos de idioma del Hub figuran como no disponibles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `lerobot`) |
| Tipo de robot | `so_follower` (brazo seguidor SO-100/SO-101) |
| Camaras | `top` (una camara cenital) |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,2 GB |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT sigue un esquema de aprendizaje por imitación supervisado con predicción de chunks de acciones: en lugar de generar una acción por paso de control, el modelo emite una secuencia de acciones futuras de una sola vez, lo que reduce el horizonte efectivo de decisión y mitiga el problema de la acumulación de errores y la no estacionariedad que afecta a las políticas que predicen un único paso. La arquitectura combina un backbone visual convolucional que procesa la imagen de la cámara cenital con un transformer encoder que integra la observación (imagen y estado de 6 articulaciones) y un decoder que produce el chunk de acciones de 6 grados de libertad. El paper de referencia es «Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware» (arXiv:2304.13705).

El entrenamiento se realizó con LeRobot 0.6.2 sobre el conjunto de datos `Project-Studio200/my_phone_vision_task`, compuesto por 51 episodios y 20.730 fotogramas capturados a 30 FPS (aproximadamente 11,5 minutos de demostraciones teleoperadas). La configuración registrada es: 100.000 pasos de entrenamiento, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni ningún ajuste por preferencias humanas, algo esperable en una política de imitación. El modelo se distribuye como una política ligera que puede entrenarse desde cero con el comando `lerobot-train` en una GPU de consumo.

## Capacidades

- Control visomotor de un brazo robótico `so_follower` de 6 grados de libertad a partir de una imagen RGB de 480x640 y del vector de estado de las articulaciones.
- Predicción de chunks de acciones: emite secuencias de acciones (no pasos aislados) para suavizar la trayectoria y mejorar la estabilidad del control.
- Aprendizaje por imitación de demostraciones teleoperadas: replica las habilidades demostradas en el conjunto de datos de entrenamiento.
- Ejecución autónoma de la tarea aprendida mediante `lerobot-rollout`, sin necesidad de teleoperador durante la inferencia.
- Capacidad de reentrenamiento o ajuste fino sobre nuevos conjuntos de datos con la misma interfaz de observación.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso simbólico ni comportamiento de agente basado en texto.
- No dispone de capacidades multilingües, de visión general (VQA, OCR, descripción de imágenes) ni de audio.
- No incluye modo de razonamiento explícito (thinking mode) ni generación de texto.

## Casos de uso

- Manipulación robótica de sobremesa: la política ejecuta la tarea demostrada en `my_phone_vision_task` sobre un brazo `so_follower`, usando una única cámara cenital como entrada. Es adecuada porque el modelo fue entrenado exactamente con esa configuración de observación y ese robot.
- Replicación de experimentos de aprendizaje por imitación: un laboratorio puede desplegar la política con `lerobot-rollout` para reproducir el flujo de trabajo ACT completo y comparar sus propios resultados con los de este modelo publicado.
- Punto de partida para ajuste fino: dado su tamaño reducido (51,7 M de parámetros, 0,2 GB), sirve como inicialización para reentrenar sobre un conjunto de datos propio con el mismo espacio de observación.
- Prototipado rápido en robótica de bajo coste: al caber en GPU de consumo, permite iterar en entornos docentes o de investigación sin acceso a clústeres de cálculo.
- Automatización de tareas repetitivas de pick-and-place: útil en demostraciones de laboratorio donde se quiere sustituir la teleoperación por una política entrenada con pocas decenas de episodios.
- Evaluación de pipelines de inferencia en tiempo real: al requerir 30 FPS de cámara, sirve como banco de pruebas para medir latencia del ciclo completo (captura, inferencia, envío de acciones) en hardware modesto.
- Docencia de aprendizaje por imitación: el repositorio incluye comandos de entrenamiento y despliegue reproducibles, lo que lo hace útil como material práctico en cursos de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con la indicacion explicita de que no se han proporcionado resultados de evaluacion en robot real (tasas de exito por tarea, numero de ensayos, etc.).

## Requisitos de hardware

- Parametros: 51,7 M. El peso de los parametros en precision completa (float32) ocupa aproximadamente 207 MB, y en float16/bfloat16 aproximadamente 103 MB. Son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- VRAM estimada para inferencia: el modelo en si es muy pequeno; en la practica el consumo agregado (pesos + buffers de activacion + pipeline de imagen de 480x640) se situa en el rango de 2 a 4 GB, cifra estimada y no confirmada por el autor. Cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). Las GPU de centro de datos (A100, H100) solo serian necesarias para entrenamiento a gran escala, no para inferencia.
- Cabe en GPU de consumo: si. El comando de despliegue documentado usa `--policy.device=cuda` con `lerobot-rollout`.
- Opciones de despliegue: LeRobot con los comandos `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento), sobre PyTorch. El repositorio usa safetensors como formato de pesos. No es aplicable el despliegue con llama.cpp, Ollama, vLLM ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. Como referencia derivada del conjunto de datos, la captura se realiza a 30 FPS (33 ms por fotograma), por lo que el ciclo completo de inferencia deberia mantenerse por debajo de ese presupuesto temporal para operar en tiempo real, pero no se han publicado mediciones de latencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Project-Studio200/my_act_policy` (ACT) | 51,7 M | No aplica | Sin resultados de evaluacion publicados | Apache 2.0 | Hugging Face Hub, libreria `lerobot` |
| ACT original (ALOHA, arXiv:2304.13705) | No disponible | No aplica | Tasas de exito reportadas en el paper, no comparables directamente (hardware y tareas distintas) | No disponible | Codigo y paper publicos |
| Diffusion Policy | No disponible | No aplica | No disponible | No disponible | Implementaciones publicas y soporte en LeRobot |
| SmolVLA | No disponible | No disponible | No disponible | No disponible | Hugging Face Hub, libreria `lerobot` |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparacion cuantitativa fiable. La comparacion relevante seria con otras politicas soportadas por LeRobot (ACT, Diffusion Policy, SmolVLA) sobre el mismo robot y la misma tarea, pero este modelo no publica metricas de evaluacion que permitan contrastarlo.

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real, por lo que se desconoce la tasa de exito de la politica.
- Especializacion extrema: el modelo solo funciona con la configuracion de observacion para la que fue entrenado (robot `so_follower`, una camara llamada `top` a 480x640, estado de 6 articulaciones). Cualquier cambio de camara, nombre de la observacion o robot invalida su uso.
- Sobreajuste al entorno de recogida de datos: al entrenarse con solo 51 episodios, es probable que la politica sea sensible a cambios de iluminacion, posicion de los objetos, fondo o distracciones. No hay datos publicados que cuantifiquen esta sensibilidad.
- Sesgos: no se documenta ningun analisis de sesgos. En el contexto robotico, el sesgo relevante es la tendencia a reproducir las trayectorias y condiciones de las demostraciones, incluidas posibles asimetrias del operador humano.
- Alucinacion: el concepto no aplica en su acepcion linguistica, pero si existe el riesgo de generar acciones incorrectas o inseguras cuando la observacion se aleja de la distribucion de entrenamiento. No hay mecanismos de seguridad documentados.
- Idioma: el modelo no procesa lenguaje natural; no procede evaluacion multilingue.
- Campo `Task` vacio en el conjunto de datos: la cadena de tarea es vacia, lo que limita la trazabilidad de que habilidad concreta se esta replicando.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al no haber evaluacion publicada no se recomienda su uso en entornos de produccion o en interaccion con personas sin una validacion previa exhaustiva.
- Hardware real: el despliegue requiere un brazo `so_follower` fisico, calibracion y puertos de camara correctos; los comandos de la model card contienen marcadores de posicion que el usuario debe reemplazar.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/Project-Studio200/my_act_policy
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/Project-Studio200/my_phone_vision_task
- Visualizacion del conjunto de datos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Project-Studio200/my_phone_vision_task
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
