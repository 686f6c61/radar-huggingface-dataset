# Deviant65/so101_redcube_3cam_2train

## Resumen

so101_redcube_3cam_2train es una politica de aprendizaje por imitacion (imitation learning) entrenada con el metodo ACT (Action Chunking with Transformers) sobre el brazo robotico de bajo coste SO-101. La publica el usuario Deviant65 en Hugging Face Hub mediante la libreria LeRobot de Hugging Face. El modelo tiene 51.668.614 parametros (unos 51,7 millones) y ocupa 0,2 GB en el repositorio, por lo que es un checkpoint ligero pensado para ejecucion en tiempo real sobre hardware modesto.

El modelo resuelve una tarea concreta de manipulacion manipulativa: "Pick up the red block and place it in the brown box" (coger el bloque rojo y colocarlo en la caja marron). Para ello consume tres flujos de imagen RGB de 480x640 (camaras `wrist`, `top` y `base`) junto con el estado propioceptivo del robot (vector de 6 dimensiones) y produce un vector de accion de 6 dimensiones. No es un modelo de lenguaje ni un modelo vision-lenguaje-accion (VLA) general: es una politica especializada entrenada exclusivamente con datos de teleoperacion de la tarea.

Su relevancia actual radica en el auge de la robotica de bajo coste y el aprendizaje por imitacion reproducible: ACT es uno de los metodos de referencia desde 2023, y LeRobot lo ha convertido en un flujo de trabajo accesible (grabar demostraciones, entrenar y desplegar con comandos de linea de comandos). Este checkpoint concreto sirve como ejemplo reproducible de un pipeline completo de sim-to-real/pick-and-place, aunque no incluye resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual multi-camara y prediccion de chunks de acciones |
| Parametros totales | 51.668.614 (aproximadamente 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de robotica; consume la observacion actual y predice un chunk de acciones, no una ventana de tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | no aplica (politica de robotica; no procesa ni genera lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (leer con la libreria `lerobot`) |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice chunks de acciones (varios pasos de control por inferencia) en lugar de una unica accion por paso. La arquitectura es un transformer con un encoder visual que procesa simultaneamente las tres camaras (`observation.images.wrist`, `observation.images.top`, `observation.images.base`, cada una de 3x480x640) junto con el estado propioceptivo del robot (`observation.state`, vector de 6 valores), y una cabeza de decodificacion que emite el vector de accion (`action`, 6 valores). El metodo original se describe en el paper arXiv 2304.13705, "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware".

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset `Deviant65/so101_redcube_3cam`, compuesto por 136 episodios y 123.593 frames capturados a 30 FPS con tres camaras. La configuracion de entrenamiento indicada es: 100.000 pasos, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. El robot objetivo es de tipo `so_follower` (SO-101). No se documenta en la model card el uso de RLHF, DPO ni etapas de refinamiento posteriores; se trata de aprendizaje supervisado a partir de demostraciones teleoperadas.

## Capacidades

- Manipulacion robotica de pick-and-place: coger un bloque rojo y depositarlo en una caja marron.
- Percepcion visual multi-camara: integra tres vistas simultaneas (muneca, superior y base) de 480x640 a 30 FPS.
- Control de 6 grados de libertad: mapea estado propioceptivo de 6 dimensiones a un vector de accion de 6 dimensiones.
- Prediccion de chunks de acciones: emite varios pasos de control por inferencia, lo que reduce la frecuencia de computo necesaria y suaviza la trayectoria.
- Ejecucion en bucle cerrado desde observaciones en tiempo real mediante el script `lerobot-rollout`.
- Entrenamiento reproducible: el mismo repositorio documenta el comando `lerobot-train` con `--policy.type=act` para reentrenar sobre datasets propios.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingues, al no ser un modelo de lenguaje.
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla de las tres camaras descritas.

## Casos de uso

- Pick-and-place industrial simple: colocar la politica en una celda de manipulacion para coger piezas de un color/contenedor concreto y depositarlas en otro. Es adecuado porque el modelo esta entrenado exactamente para esa distribucion de tarea con tres vistas, lo que aporta robustez frente a oclusiones parciales.
- Robotica educativa y docencia: usar el SO-101 con tres camaras y este checkpoint para ilustrar un flujo completo de aprendizaje por imitacion (grabacion de demos, entrenamiento ACT, despliegue). Su tamano de 51,7 M permite entrenar y ejecutar en equipos de aula sin GPU de gama alta.
- Linea de montaje de clasificacion por color: si el objeto y la caja de destino mantienen la misma apariencia que en el dataset (bloque rojo, caja marron), se puede integrar en un puesto de trabajo para separar piezas por color dentro de los limites de la distribucion entrenada.
- Prototipado rapido de politicas de manipulacion: sirve como linea base (baseline) sobre la que comparar variantes (mas camaras, mas episodios, otras tareas) usando el mismo pipeline LeRobot.
- Automatizacion de tareas repetitivas en laboratorio: recogida y ubicacion de pequenos objetos en contenedores fijos, donde la repetibilidad de la trayectoria importa mas que la generalizacion a objetos nuevos.
- Investigacion en sim-to-real y transferencia: el checkpoint puede servir como politica de referencia para medir la brecha entre simulacion y realidad en el brazo SO-101, comparando su tasa de exito real con la obtenida en simulador.
- Aumento de datos y evaluacion: reejecutar la politica para generar trayectorias adicionales o para comparar metricas de exito entre configuraciones de camaras y condiciones de iluminacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la seccion de evaluacion con la nota "No evaluation results have been provided for this policy yet", por lo que no hay tasas de exito en robot real ni en simulador para esta politica concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2-0,5 GB en FP32 (51,7 M de parametros, unos 207 MB solo en pesos) y algo menos en FP16; el cuello de botella real es el procesamiento de las tres imagenes de 480x640 a 30 FPS.
- GPU recomendadas: cualquier GPU con CUDA capaz de ejecutar la codificacion visual a 30 FPS, por ejemplo RTX 3060, RTX 4070, RTX 4090, A100, H100 o similares, aunque un modelo tan pequeno no aprovecha la gama alta.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060 o superior) e incluso en iGPU/NPU para versiones optimizadas, dado el tamano reducido.
- Opciones de despliegue: la via documentada es la CLI de LeRobot (`lerobot-rollout`) con PyTorch/CUDA; no se documentan integraciones nativas con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica de robotica.
- Latencia y throughput: no disponibles de forma explicita. El dataset fue capturado a 30 FPS, por lo que la inferencia debe mantenerse por debajo de unos 33 ms por paso para seguir el ritmo de control; el chunking de acciones ayuda a cumplir ese presupuesto.
- Otros componentes necesarios: brazo SO-101 de tipo `so_follower`, tres camaras OpenCV a 640x480 y 30 FPS, y la libreria `lerobot` para cargar el checkpoint.

## Comparativa con modelos similares

Los valores de parametros de los modelos alternativos son aproximados y proceden de sus respectivas fichas publicas; no se dispone de una comparacion medida sobre la misma tarea.

| Modelo | Tipo | Parametros (aprox.) | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_redcube_3cam_2train (ACT) | Politica de imitacion especializada | 51,7 M | 3 camaras RGB + estado 6D | apache-2.0 | Pesos abiertos en Hugging Face |
| Diffusion Policy | Politica de imitacion (difusion) | no disponible | Imagenes + estado | codigo abierto (consulta la licencia del repositorio) | Repositorio publico, requiere entrenamiento por tarea |
| pi0 (Physical Intelligence) | VLA generalista | ~3 B (aproximado) | Imagenes + lenguaje + estado | apache-2.0 (pesos abiertos) | Pesos abiertos, requiere hardware de gama alta |
| GR00T N1 (NVIDIA) | VLA generalista | ~2 B (aproximado) | Imagenes + lenguaje + estado | licencia NVIDIA especifica | Pesos abiertos bajo terminos NVIDIA |

La diferencia clave es el alcance: este checkpoint es una politica cerrada a una unica tarea y un unico robot, mientras que los VLA como pi0 o GR00T N1 aceptan instrucciones en lenguaje y generalizan a multiples tareas, a costa de un tamano y unos requisitos de computo muy superiores.

## Limitaciones y advertencias

- Tarea unica: el modelo esta entrenado exclusivamente para "coger el bloque rojo y colocarlo en la caja marron"; no se documenta generalizacion a otros objetos, colores o contenedores.
- Sin resultados de evaluacion: no hay tasa de exito publicada ni en robot real ni en simulador, por lo que el rendimiento real es desconocido.
- Sensibilidad al entorno: al depender de tres camaras con posiciones concretas (`wrist`, `top`, `base`) y de una iluminacion y fondo similares a los del dataset, es probable que cambios en la escena degraden el comportamiento.
- Riesgo de sobreajuste a la distribucion de demostraciones: 136 episodios y 123.593 frames para una tarea concreta implican una cobertura limitada de posiciones y condiciones.
- Sesgos: no se documentan analisis de sesgo; al ser una politica de robotica entrenada con demos de un unico operador, puede heredar sesgos de la teleoperacion (velocidades, trayectorias, posiciones de reposo).
- Alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones fisicamente incorrectas o inseguras fuera de la distribucion entrenada.
- Idioma: no aplica; el modelo no procesa ni genera lenguaje.
- Licencia: apache-2.0, que permite uso comercial y modificacion, siempre que se conserve la atribucion y el aviso de licencia correspondiente.
- Advertencia para produccion: cualquier despliegue debe incluir limites de seguridad a nivel de controlador (paradas de emergencia, limites de par y de espacio), ya que la politica no incorpora salvaguardas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deviant65/so101_redcube_3cam_2train
- Dataset de entrenamiento: https://huggingface.co/datasets/Deviant65/so101_redcube_3cam
- Dataset (variante fechada): https://huggingface.co/datasets/Deviant65/so101_redcube_20260925_151937
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento (imitation learning): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inference/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Deviant65/so101_redcube_3cam
- Curso de NVIDIA sobre SO-101 sim-to-real (referencia externa): https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
