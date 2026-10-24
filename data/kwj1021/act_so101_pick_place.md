# Kwj1021/act_so101_pick_place

## Resumen

`Kwj1021/act_so101_pick_place` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705 (Zhao et al., 2023). No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un brazo SO-101 (6 dimensiones) y dos imágenes de cámara (muñeca y cenital, 480x640) y emite comandos de acción de 6 dimensiones. El modelo lo publica el usuario Kwj1021 y se ha entrenado y subido con LeRobot 0.6.2, la librería de Hugging Face para aprendizaje por imitación en robots reales.

La política resuelve una única tarea: "pick up the object and place it in the target area" (coger un objeto y depositarlo en la zona objetivo). Se ha entrenado con un dataset propio de 23 episodios teleoperados y 19.190 fotogramas a 30 FPS, durante 20.000 pasos con batch de 8 y learning rate de 1e-5. El resultado es un checkpoint de 51.668.614 parámetros (unos 51,7 millones) en formato safetensors, con un repositorio de 0,2 GB.

Su relevancia es práctica: sirve como ejemplo reproducible y ligero de un pipeline completo de aprendizaje por imitación (grabación de datos, entrenamiento, despliegue) sobre hardware de bajo coste, y como punto de partida para quien quiera reentrenar ACT en su propio robot SO-101. Conviene subrayar que es un modelo de nicho, sin resultados de evaluación publicados y sin licencia declarada, por lo que su uso en producción exige validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificadores visuales por cámara, codificador de estado y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 (≈51,7 M), dato real de los safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa texto; ventana temporal implícita en el chunking de acciones) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precisión original; no hay variantes GGUF, int8 ni similares) |
| Idiomas soportados | no disponible / no aplica (la tarea se especifica con una cadena de texto fija, no hay comprensión multilingüe) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (SO-101) |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Frecuencia de datos de entrenamiento | 30 FPS |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación (behavior cloning) que, en lugar de predecir una acción por paso, predice un chunk de acciones futuras de una sola vez. La arquitectura combina codificadores visuales independientes (uno por cámara, típicamente ResNet en la implementación de referencia del paper), un codificador del estado propioceptivo, un codificador de la instrucción de tarea y un decodificador transformer con queries de acción; el entrenamiento se hace con pérdida L1 sobre el chunk objetivo y un término auxiliar de reconstrucción de imagen (CVAE). Esta formulación reduce el error acumulado de las políticas paso a paso y suaviza la señal de control, algo especialmente relevante en tareas de manipulación con contacto.

En este caso concreto, el entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Kwj1021/so101_pick_place_20261024_143100`: 23 episodios, 19.190 fotogramas a 30 FPS, una única tarea de pick-and-place, dos cámaras (`wrist` y `top`) a 640x480 y estado/acción de 6 dimensiones. La configuración declarada es de 20.000 pasos, batch de 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta en la información disponible el tamaño del chunk de acciones, el número exacto de capas ni la composición de aumentos de datos, ni se menciona ningún proceso de RLHF/DPO (no aplicable en este paradigma, que es imitación supervisada).

## Capacidades

- Control visomotor de manipulación: ejecuta una secuencia de pick-and-place a partir de dos vistas de cámara y del estado articular del SO-101.
- Predicción de chunks de acción: emite bloques de comandos de 6 dimensiones, lo que reduce el jitter y mejora la estabilidad frente a políticas paso a paso.
- Fusión de dos cámaras: integra una vista de muñeca (próxima al objeto) y una vista cenital (contexto de la escena) en la misma observación.
- Condicionamiento por instrucción de tarea: acepta una cadena de texto (`task`) que debe coincidir con la tarea entrenada; no generaliza a instrucciones nuevas.
- Aprendizaje por imitación a partir de demostraciones teleoperadas: el modelo es reentrenable con el mismo pipeline `lerobot-train` sobre un dataset propio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico, ni procesamiento de lenguaje natural.
- No tiene visión general (captioning, VQA): las cámaras se usan únicamente como entrada de control.

## Casos de uso

- **Automatización de pick-and-place en laboratorio o línea piloto**: desplegar el checkpoint con `lerobot-rollout` sobre un SO-101 calibrado para mover piezas de una posición fija a una zona objetivo, sin desarrollo de control clásico.
- **Banco de pruebas docente de aprendizaje por imitación**: usar el repositorio como ejemplo completo y de tamaño reducido (0,2 GB, 51,7 M de parámetros) para enseñar el ciclo grabar-entrenar-desplegar en cursos de robótica.
- **Línea base para comparar métodos de IL**: servir de referencia ACT frente a Diffusion Policy u otros métodos sobre el mismo dataset de 23 episodios, midiendo tasas de éxito con idéntico protocolo.
- **Reentrenamiento con datos propios (fine-tuning)**: partir de la configuración declarada (20.000 pasos, batch 8, AdamW, lr 1e-5) y sustituir el dataset por uno propio con más episodios para una tarea distinta.
- **Validación de infraestructura de despliegue**: probar el pipeline de inferencia en tiempo real (dos cámaras USB a 30 FPS más el bucle de control del robot) antes de invertir en grabación de datos a gran escala.
- **Investigación en robustez de políticas visomotoras**: evaluar la degradación del modelo ante cambios de iluminación, posiciones de objeto o cámara, ya que el autor no ha publicado métricas de éxito y estas pruebas son necesarias.
- **Generación de datos sintéticos o sim-to-real**: usar el repo `aviadarn/so101-lerobot` (en los resultados de búsqueda) como referencia para replicar el pipeline en MuJoCo antes de pasar al hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye el apartado de evaluación vacío con la nota literal "_No evaluation results have been provided for this policy yet._", por lo que no existe tasa de éxito, número de ensayos ni comparación cuantitativa con otras políticas.

| Metrica | Resultado |
|---|---|
| Tasa de exito en la tarea | no disponible (sin evaluacion publicada) |
| Numero de ensayos | no disponible |
| Benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) | no aplica: no es un modelo de lenguaje |
| Latencia / throughput medidos | no disponible |

## Requisitos de hardware

- **VRAM estimada para inferencia**: el checkpoint tiene 51,7 M de parámetros; en fp32 ocupa aproximadamente 207 MB y en fp16 unos 103 MB, a lo que hay que sumar activaciones de los dos codificadores visuales a 480x640. En la práctica, menos de 2 GB de VRAM en fp32, holgado en cualquier GPU con 4 GB o más (cálculo estimado a partir del número de parámetros, no medido).
- **GPU recomendadas**: cualquier GPU moderna sirve; para un bucle de control fiable a 30 FPS se recomienda una RTX 3060/4060 o superior. A100/H100 no aportan ventaja apreciable para este tamaño.
- **Cabe en GPU de consumo**: sí, en cualquier GPU de consumo con al menos 4 GB de VRAM (GTX 1650, RTX 3050 en adelante). También es viable en placas embebidas tipo Jetson Orin Nano, aunque el rendimiento real no está documentado.
- **CPU**: es posible ejecutar la inferencia en CPU, pero sostener 30 FPS con dos flujos de 640x480 requiere comprobación empírica; no hay medidas publicadas.
- **Opciones de despliegue**: `lerobot-rollout` (CLI oficial de LeRobot), integración directa con PyTorch mediante la clase de política `act` de LeRobot, y exportación a ONNX/TorchScript con herramientas estándar (no documentada por el autor). vLLM, TGI, llama.cpp y Ollama no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. El requisito del sistema es mantener el ritmo del robot (los datos se grabaron a 30 FPS); el chunking de acciones permite desacoplar parcialmente la frecuencia de inferencia de la de control.

## Comparativa con modelos similares

| Modelo | Metodo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Kwj1021/act_so101_pick_place` | ACT | 51,7 M | Pick-and-place SO-101, 2 camaras | no disponible | Hugging Face, 0 descargas, 0 likes |
| `ViVi-AI/ACT_so101_pick_place` | ACT | no disponible | Pick-and-place SO-101 | no disponible | Hugging Face |
| `simaai/ACT-SO101-PickPlace` | ACT | no disponible | Pick-and-place SO-101 | no disponible | Hugging Face |
| Diffusion Policy (alternativa metodologica en LeRobot) | Difusion de acciones | no disponible | Manipulacion general | no disponible en la informacion disponible | Implementado en LeRobot |

Las tres políticas ACT sobre SO-101 localizadas en la búsqueda web parten del mismo método y del mismo robot, por lo que las diferencias reales dependen del dataset de cada autor (número de episodios, posiciones, iluminación) y no de la arquitectura. No se dispone de datos de parametros, licencia ni métricas de éxito para las alternativas, de modo que la comparación cuantitativa no es posible con la información disponible.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasa de éxito, ni número de ensayos, ni condiciones de prueba; el rendimiento real es desconocido hasta que se valide en hardware.
- **Dataset muy pequeno**: 23 episodios y 19.190 fotogramas para una sola tarea. Es un régimen propenso a sobreajuste y a fallos ante cambios de posición del objeto, iluminación o fondo.
- **Una única tarea**: el modelo solo ejecuta "pick up the object and place it in the target area". La cadena de tarea debe coincidir con la del entrenamiento; no hay generalización a instrucciones nuevas ni composición de subtareas.
- **Configuración de sensores fija**: requiere exactamente las claves `observation.images.wrist` y `observation.images.top` a 640x480 y 30 FPS, y un estado/acción de 6 dimensiones. Cambiar la disposición de cámaras invalida la política.
- **Sesgos y distribucion**: al ser behavior cloning, hereda los sesgos de las demostraciones (trayectorias, velocidades, posiciones preferidas del operador). Ante estados fuera de distribución no hay mecanismo de rechazo explícito.
- **Riesgo de fallo silencioso**: no es un modelo de lenguaje y no "alucina" texto, pero sí puede ejecutar una trayectoria incorrecta con alta confianza; en un robot real esto implica riesgo físico.
- **Licencia no declarada**: la model card indica "More Information Needed". Sin licencia explícita no se puede asumir permiso de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- **Sin garantías de mantenimiento**: 0 descargas y 0 likes en el momento de la ficha, repositorio creado en una única sesión; no hay evidencia de soporte, versionado ni actualizaciones.
- **Dependencia de version**: entrenado con LeRobot 0.6.2; cambios de versión en la API de políticas o en el formato del dataset pueden romper la carga del checkpoint.
- **Seguridad en produccion**: cualquier despliegue necesita límites de par, paradas de emergencia y supervisión; el modelo no incluye ninguna capa de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kwj1021/act_so101_pick_place
- Dataset de entrenamiento: https://huggingface.co/datasets/Kwj1021/so101_pick_place_20261024_143100
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Kwj1021/so101_pick_place_20261024_143100
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Politica ACT similar (ViVi-AI): https://huggingface.co/ViVi-AI/ACT_so101_pick_place
- Politica ACT similar (simaai): https://huggingface.co/simaai/ACT-SO101-PickPlace
- Repositorio SO-101 con LeRobot y MuJoCo: https://github.com/aviadarn/so101-lerobot
- Ficha indexada del modelo (Essa Mamdani): https://essamamdani.com/ai-models/hf-anvil2718-act-so101-pickplace
