# bp343475/diffusion_pusht_h16

## Resumen

`bp343475/diffusion_pusht_h16` es una política de control visuomotor entrenada con **Diffusion Policy**, el método presentado en el artículo *Diffusion Policy: Visuomotor Policy Learning via Action Diffusion* (arXiv:2303.04137). Se trata de un modelo de robótica, no de un modelo de lenguaje: consume observaciones visuales y de estado del robot y produce directamente acciones de control. El autor lo ha subido al Hub mediante la librería **LeRobot** de Hugging Face.

El modelo resuelve una tarea concreta de manipulación: empujar un bloque con forma de T hasta una diana también en forma de T (*PushT*). Está entrenado sobre el conjunto de datos `lerobot/pusht`, compuesto por 206 episodios y 25.650 fotogramas grabados a 10 FPS. La entrada visual es una imagen RGB de 96×96 píxeles, más un vector de estado de dos dimensiones, y la salida es un vector de acción de dos dimensiones.

Su relevancia es la de servir como política de referencia reproducible dentro del ecosistema LeRobot: cualquiera puede descargarla, ejecutarla sobre hardware compatible y comparar el comportamiento de Diffusion Policy frente a otros tipos de política (ACT, TDMPC, VQ-BeT) sobre la misma tarea y el mismo dataset. El modelo tiene 262.718.644 parámetros, ocupa 1,1 GB en el repositorio y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotora generativa basada en difusión; codificador visual + red de denoising condicionada) |
| Parametros totales | 262.718.644 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; no se especifica horizonte de observación ni de predicción en la información disponible) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control robótico, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | unknown |
| Camaras | image |
| Entrada (observacion) | `observation.image` VISUAL (3, 96, 96); `observation.state` STATE (2,) |
| Salida (accion) | `action` ACTION (2,) |
| Dataset de entrenamiento | lerobot/pusht (206 episodios, 25.650 fotogramas, 10 FPS) |
| Tarea | "Push the T-shaped block onto the T-shaped target." |
| Descargas / likes | 0 / 0 |
| Tamano del repositorio | 1,1 GB |
| Creado / actualizado | 2026-09-19 / 2026-09-19 |

## Arquitectura y entrenamiento

Diffusion Policy plantea el control visuomotor como un proceso generativo de difusión: en lugar de predecir una única acción de forma directa, el modelo aprende a invertir un proceso de ruido para generar trayectorias de acción multimodales y suaves, lo que resulta especialmente útil en tareas de manipulación con mucho contacto físico. La política consume la imagen (`observation.image`, 3×96×96) y el estado del robot (`observation.state`, 2 dimensiones), y devuelve una acción de 2 dimensiones. La información disponible no detalla la composición exacta del bloque de denoising ni la configuración de horizonte, más allá de que el nombre del repositorio incluye el sufijo `h16`.

El entrenamiento se realizó con LeRobot 0.6.2 durante 20.000 pasos, con un tamaño de lote de 8, optimizador Adam, tasa de aprendizaje 0,0001 y semilla 1000. El conjunto de datos `lerobot/pusht` contiene 206 episodios y 25.650 fotogramas a 10 FPS de la tarea de empuje del bloque en T. No se documenta en la información proporcionada si hubo etapas de ajuste adicionales, uso de EMA, aumentos de datos ni la composición exacta del pipeline de difusión empleado.

## Capacidades

- Generacion de trayectorias de accion multimodales y suaves para control visuomotor, adecuadas para tareas con contacto físico.
- Control a partir de una unica camara RGB a 96×96 píxeles mas el estado del robot (2 dimensiones).
- Produccion directa de acciones de 2 grados de libertad (`action`, shape (2,)), sin necesidad de un controlador intermedio complejo.
- Aprendizaje por imitacion (imitation learning) a partir de demostraciones humanas, no aprendizaje por refuerzo.
- Ejecucion en bucle cerrado sobre robot real mediante el comando `lerobot-rollout` de LeRobot.
- Capacidad de reentrenamiento con el mismo pipeline (`lerobot-train --policy.type=diffusion`) sobre otros datasets.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico, capacidades multilingues, vision general, audio ni modo "thinking": es exclusivamente una politica de control para una tarea de manipulacion.

## Casos de uso

- **Investigacion en aprendizaje por imitacion:** usar esta politica como referencia reproducible de Diffusion Policy sobre PushT para comparar con ACT, TDMPC o VQ-BeT dentro del mismo entorno y dataset. Su licencia Apache 2.0 facilita su uso en publicaciones y experimentos.
- **Punto de partida para nuevas tareas de manipulacion:** reentrenar el pipeline de difusion de LeRobot sobre un dataset propio (por ejemplo, apilar objetos o insertar piezas) tomando esta politica como plantilla de configuracion y de flujo de trabajo.
- **Validacion de hardware robotico:** ejecutar `lerobot-rollout` con `--policy.path=bp343475/diffusion_pusht_h16` para verificar que un brazo robotico, sus camaras y su calibracion funcionan correctamente antes de invertir en la grabacion de datos propios, dado que la tarea PushT es rapida de evaluar visualmente.
- **Banco de pruebas de despliegue:** medir latencia de inferencia y estabilidad de control en una GPU concreta (por ejemplo, una RTX 4090 o una Jetson) usando esta politica de 262 millones de parametros como carga representativa de una politica de difusion real.
- **Docencia y divulgacion:** demostrar de forma tangible como un modelo generativo de difusion puede controlar un robot, sirviendo como ejemplo practico en cursos de robotica o de IA aplicada.
- **Generacion de datos sinteticos de evaluacion:** emplear la politica como "experto" para producir trayectorias de accion sobre PushT y ampliar datasets de evaluacion o de comparacion entre metodos de imitacion.
- **Benchmark interno de pipelines de entrenamiento:** reproducir los 20.000 pasos de entrenamiento documentados (batch 8, Adam, lr 1e-4, seed 1000) para validar que una instalacion de LeRobot produce resultados equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: *"No evaluation results have been provided for this policy yet."* No hay tabla de exito por tarea, ni comparaciones cuantitativas con otras politicas sobre PushT en los datos proporcionados.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible de forma explicita. Con 262,7 millones de parametros (aproximadamente 1 GB en FP32 y unos 0,5 GB en FP16), la inferencia cabe holgadamente en GPUs de consumo.
- **GPU recomendadas:** cualquier GPU NVIDIA con soporte CUDA y al menos 4-6 GB de VRAM es suficiente en la practica; una RTX 3060, 4060, 4090 o superiores funcionan sin problema. Tambien es razonable el despliegue en GPUs embebidas tipo Jetson en funcion del presupuesto de latencia.
- **Cabe en GPU de consumo:** si. El modelo es pequeno en terminos de memoria de pesos; el cuello de botella principal suele ser el bucle de control en tiempo real, no la VRAM.
- **Opciones de despliegue:** LeRobot (`lerobot-rollout` para ejecucion en robot, `lerobot-train` para reentrenamiento), con backend CUDA. La informacion proporcionada no menciona soporte especifico para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas de control.
- **Latencia y throughput estimados:** no disponible. Dependeran de la GPU, del numero de pasos de difusion y de la frecuencia de control del robot (el dataset se grabo a 10 FPS).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bp343475/diffusion_pusht_h16 | Diffusion Policy (PushT) | 262.718.644 | no disponible (nombre con sufijo `h16`) | apache-2.0 | Hub de Hugging Face, via LeRobot |
| ACT (Action Chunking Transformer) en LeRobot | Politica de imitacion por troceado de acciones | no disponible en la informacion proporcionada | no disponible | apache-2.0 (ecosistema LeRobot) | Repositorios de LeRobot |
| TDMPC / VQ-BeT en LeRobot | Politicas alternativas de control | no disponible en la informacion proporcionada | no disponible | apache-2.0 (ecosistema LeRobot) | Repositorios de LeRobot |
| SmolVLA | Vision-Language-Action | no disponible en la informacion proporcionada | no disponible | no disponible | Hub de Hugging Face (ecosistema LeRobot) |

No se dispone de datos cuantitativos de rendimiento para establecer una comparacion objetiva entre estas politicas sobre PushT a partir de la informacion proporcionada.

## Limitaciones y advertencias

- **Sin resultados de evaluacion:** la model card no reporta tasa de exito ni numero de ensayos, por lo que no hay evidencia publicada de su rendimiento en robot real.
- **Tarea unica y muy acotada:** esta entrenada exclusivamente para la tarea "Push the T-shaped block onto the T-shaped target" sobre `lerobot/pusht`. No generaliza a otras tareas de manipulacion sin reentrenamiento.
- **Entrada de baja resolucion:** la unica camara aporta imagenes de 96×96 píxeles, lo que limita la percepcion de detalles finos y puede degradar el comportamiento ante cambios de iluminacion, oclusiones o posiciones no vistas.
- **Tipo de robot "unknown":** la model card no especifica el robot objetivo, de modo que la transferencia a un robot con distinta cinematica o calibracion no esta garantizada.
- **Riesgo de sobreajuste al dataset:** 206 episodios y 25.650 fotogramas es un volumen reducido; es probable que la politica sea sensible a variaciones de posicion inicial, apariencia de objetos y condiciones de la escena.
- **Naturaleza estocastica:** al ser un modelo de difusion, las acciones generadas pueden variar entre ejecuciones; conviene fijar semillas y validar la estabilidad del bucle de control.
- **Sin capacidades de lenguaje, tool calling ni agentes:** no debe emplearse para tareas de razonamiento, generacion de texto, codigo ni vision general.
- **Licencia permisiva:** Apache 2.0 permite uso comercial, pero al reutilizar el modelo conviene citar tanto el articulo de Diffusion Policy (arXiv:2303.04137) como LeRobot, tal y como pide el autor.
- **Procedencia poco verificada:** el repositorio tiene 0 descargas y 0 likes, y pertenece a un autor individual sin evaluaciones publicas; conviene tratarlo como material de experimentacion, no como componente listo para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bp343475/diffusion_pusht_h16
- Articulo de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/pusht
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/pusht
