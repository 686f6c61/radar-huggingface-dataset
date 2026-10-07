# castanetnicolas/smolvla_UR5e_BS_32_Act_Chunk_10_Exec_10_TASK_tool_hang_ID_148313

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) orientado a robótica. Este repositorio concreto es un ajuste fino (*fine-tune*) del modelo base `lerobot/smolvla_base`, realizado por el usuario `castanetnicolas` con la librería LeRobot de Hugging Face, para la tarea robótica "Insert the hook into the base to build a frame, then hang the wrench on the hook" (insertar el gancho en la base y colgar la llave inglesa). El modelo consume observaciones multimodales (estado del robot más tres cámaras) y produce directamente un vector de acción de 7 dimensiones, sin necesidad de planificación simbólica intermedia.

El modelo tiene 450.046.176 parámetros (~450 M) y un peso en disco de 0,9 GB en formato safetensors, lo que lo sitúa en la categoría de políticas ligeras desplegables en hardware de consumo. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La arquitectura subyacente de SmolVLA combina un modelo de visión-lenguaje preentrenado con un experto de acción entrenado mediante *flow matching*, según el paper referenciado por el autor (arXiv:2506.01844).

Su relevancia actual es doble: por un lado, demuestra que es posible obtener políticas robóticas funcionales con menos de 500 M de parámetros, frente a alternativas de 3-7 B; por otro, sirve como ejemplo reproducible del flujo de trabajo de LeRobot (grabación de datos, entrenamiento de imitación y despliegue con `lerobot-rollout`). El entrenamiento se realizó sobre 200 episodios y 95.962 fotogramas a 20 FPS, con 40.000 pasos de optimización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en un modelo de vision-lenguaje preentrenado con experto de accion; detalles completos en arXiv:2506.01844 |
| Parametros totales | 450.046.176 (~450 M), dato real de los safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones precalculadas; pesos en safetensors) |
| Idiomas soportados | No disponible (la tarea se especifica en ingles mediante el campo `task`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 0,9 GB, libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA pertenece a la familia de modelos visión-lenguaje-acción: un *backbone* de visión-lenguaje procesa las imágenes de cámara y la instrucción textual, y un módulo de acción específico genera la secuencia de comandos motores. El paper citado en la model card (arXiv:2506.01844) describe un diseño compacto y eficiente, pensado para ser desplegado en hardware de consumo, con un experto de acción entrenado por *flow matching* (los detalles exactos de capas, atención y esquema de entrenamiento deben consultarse en el paper, ya que la model card no los reproduce). El modelo final tiene 450.046.176 parámetros, lo que confirma que se trata de un modelo denso de escala media, no de una arquitectura de mezcla de expertos.

Este repositorio concreto es un ajuste fino supervisado del modelo base `lerobot/smolvla_base` sobre el dataset `castanetnicolas/robomimic_tool_hang_ph_image256`. Ese dataset contiene 200 episodios, 95.962 fotogramas a 20 FPS, y proviene de entornos robomimic con imágenes a 256x256 píxeles. La configuración de entrenamiento declarada es: 40.000 pasos, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.1. El nombre del repositorio indica *action chunk* de 10 y horizonte de ejecución de 10 (`Act_Chunk_10_Exec_10`), parámetros típicos del entrenamiento de imitación por trozos de acción. No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de ajuste por preferencias.

La política consume `observation.state` con forma `(6,)` y tres cámaras de `(3, 256, 256)` píxeles, y produce `action` con forma `(7,)`. La model card declara tipo de robot `panda` con cámaras `sideview` y `robot0_eye_in_hand`, mientras que el identificador del repositorio hace referencia a `UR5e`; esta discrepancia entre el nombre del repositorio y la model card debe verificarse antes de desplegar en hardware real.

## Capacidades

- Generacion de acciones roboticas de 7 grados de libertad (`action` de forma `(7,)`) a partir de observaciones multimodales, sin planificador externo.
- Percepcion visual multi-camara: procesa tres flujos de imagen RGB de 256x256 píxeles por paso de inferencia.
- Fusion de estado proprioceptivo (`observation.state`, 6 dimensiones) con entrada visual y condicionamiento por instruccion textual de tarea.
- Ejecucion de tareas manipulativas de horizonte medio con multiples fases: la tarea declarada encadena insertar un gancho en una base y colgar una llave, dos subtareas encadenadas.
- Inferencia por trozos de accion (*action chunking*), con configuracion de 10 pasos de chunk y 10 de ejecucion segun el identificador del repositorio.
- Integracion nativa con el ecosistema LeRobot (entrenamiento, evaluacion y despliegue mediante linea de comandos).
- No se documenta soporte de *tool calling*, agentes, razonamiento multi-paso simbolico, vision general (VQA, OCR) ni audio. Es una politica de imitacion, no un asistente conversacional.

## Casos de uso

- Manipulacion robotica de ensamblaje en laboratorio: el modelo ejecuta la secuencia de insertar el gancho en la base y colgar la llave, adecuado para bancos de prueba de investigacion en imitacion aprendizaje donde se necesita una politica ligera y reproducible.
- Benchmark de algoritmos de imitacion: al estar construido sobre LeRobot 0.6.1 y un dataset publico de 200 episodios, sirve como linea base reproducible para comparar variantes de *action chunking*, tasas de aprendizaje o aumentos de datos.
- Prototipado rapido en robot de sobremesa: con 0,9 GB de pesos, puede cargarse y ejecutarse en una GPU de gama media, lo que permite iterar sobre una politica real sin acceso a clúster.
- Educacion y formacion en robotica: el flujo completo (`lerobot-train` y `lerobot-rollout`) permite que estudiantes comprendan el ciclo grabacion-entrenamiento-despliegue con un coste computacional contenido.
- Evaluacion de transferencia entre robots: la discrepancia entre `panda` (model card) y `UR5e` (nombre del repo) lo convierte en un caso practico para estudiar hasta que punto una politica entrenada en una morfologia se transfiere a otra con cinematica distinta.
- Recoleccion de datos activa (*DAgger* o correcciones humanas): al ser un *fine-tune* de un modelo base, puede recibir nuevos ajustes con datos del mismo entorno para corregir fallos sistematicos detectados en despliegue.
- Investigacion en eficiencia de VLA: sirve para medir latencia, throughput y uso de VRAM de una politica de ~450 M frente a alternativas de 3-7 B en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet." No hay tabla de tareas, numero de ensayos ni tasas de exito, y tampoco se aportan resultados comparativos frente a otras politicas.

## Requisitos de hardware

- VRAM estimada: con pesos en precision de 16 bits, los 450 M de parametros ocupan aproximadamente 0,9 GB; sumando activaciones de tres imagenes de 256x256 y el grafo de inferencia, el consumo practico se situa en el rango de 2-4 GB en funcion del backend y del tamaño de lote (estimacion a partir del tamaño documentado del repo, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente; una RTX 3060, RTX 4070 o RTX 4090 es adecuada. No se requieren A100 ni H100 para inferencia.
- Si cabe en GPU de consumo: si, es uno de los casos de uso declarados por el paper de SmolVLA (despliegue en hardware de consumo).
- Opciones de despliegue: LeRobot es la via documentada (`lerobot-rollout` con `--policy.path`, estrategia `base`, dispositivo CUDA). El script de ejemplo pasa `--policy.device=cuda` en entrenamiento. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica de accion.
- Latencia y throughput: no disponibles. La tasa de datos de entrenamiento es de 20 FPS, pero no se publica la frecuencia de control alcanzable en inferencia ni el tiempo por paso.
- Nota de despliegue: los nombres de camara deben coincidir exactamente con las claves de observacion usadas en entrenamiento (`observation.images.camera1/2/3`, con nombres de camara `sideview` y `robot0_eye_in_hand` en la model card), y el puerto del robot y los indices de camara son especificos de cada maquina.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SmolVLA fine-tune, tool_hang) | ~450 M | No disponible | Sin resultados publicados | Apache 2.0 | Hugging Face, libreria lerobot |
| `lerobot/smolvla_base` | ~450 M (mismo backbone) | No disponible | No disponible | Apache 2.0 | Hugging Face |
| OpenVLA | ~7 B (orden de magnitud ampliamente citado; no verificado en la informacion disponible) | No disponible | No disponible | No disponible | No disponible |
| pi0 (Physical Intelligence) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de benchmarks ni de especificaciones completas de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no puede realizarse. La unica comparacion defendible con los datos disponibles es el orden de magnitud: este modelo es aproximadamente 15 veces mas pequeño que una politica VLA de 7 B, con el objetivo declarado de mantener un rendimiento competitivo a menor coste computacional.

## Limitaciones y advertencias

- Riesgo de alucinacion de acciones: al ser una politica de imitacion entrenada con 200 episodios, puede generar trayectorias plausibles pero incorrectas ante posiciones de objeto, iluminacion o distractores no vistos en el dataset.
- Sin evaluacion publicada: no hay tasas de exito ni numero de ensayos, por lo que no se puede estimar su fiabilidad real en la tarea declarada.
- Ambiguedad de morfologia: la model card indica robot `panda`, mientras que el identificador del repositorio menciona `UR5e`. Desplegar en el robot equivocado invalidaria las acciones generadas.
- Dependencia estricta de las claves de observacion: los nombres de camara y el orden del vector de estado deben coincidir con los del entrenamiento; cualquier cambio de calibracion, encuadre o resolucion degrada la politica.
- Dominio reducido: entrenado exclusivamente para la tarea "Insert the hook into the base to build a frame, then hang the wrench on the hook" en el dataset `robomimic_tool_hang_ph_image256`; no generaliza a otras tareas sin reentrenamiento.
- Cobertura de idiomas no documentada: la instruccion de tarea se proporciona en ingles; no hay evidencia de soporte multilingue.
- Sesgos: no documentados por el autor; en robótica, los sesgos se manifiestan como sesgo de posicion, de apariencia o de condiciones de iluminacion presentes en los 95.962 fotogramas de entrenamiento.
- Sin datos de seguridad: no se documentan paradas de emergencia, limites de fuerza ni envolventes de seguridad. En un robot real, la politica debe ejecutarse bajo capas de control de seguridad independientes.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar avisos de licencia. Conviene verificar la licencia del modelo base y del dataset por separado.
- Sin mantenimiento declarado: el repositorio tiene 0 descargas y 0 *likes*, creado y actualizado el mismo dia (2026-10-07), lo que sugiere que no hay soporte activo del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/smolvla_UR5e_BS_32_Act_Chunk_10_Exec_10_TASK_tool_hang_ID_148313
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image256
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (*rollout*): https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre el modelo; los resultados obtenidos eran contenido no relacionado con robotica ni con inteligencia artificial y se han descartado.
