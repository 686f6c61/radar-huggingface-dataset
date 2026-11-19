# inhastupid/act_20

## Resumen

`inhastupid/act_20` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario `inhastupid` en Hugging Face mediante la librería LeRobot de Hugging Face, y está pensado para controlar un robot de tipo `so_follower` (brazo SO-100/SO-101 de bajo coste) equipado con una única cámara cenital.

El modelo resuelve una tarea concreta de manipulación: "Pick the object and place it on the target". Se entrenó sobre el dataset `inhastupid/pick_place_100`, compuesto por 100 episodios de teleoperación (60.000 fotogramas a 30 FPS). Con 51,6 millones de parámetros y un repositorio de 0,2 GB, es un modelo compacto que cabe en cualquier GPU consumer y puede ejecutarse en tiempo real.

Su relevancia es la de un ejemplo canónico de política ACT en LeRobot: sirve como referencia reproducible para quien quiera entrenar y desplegar su propia política de imitación en hardware asequible. No obstante, es un modelo de autor individual, sin licencia declarada, sin resultados de evaluación publicados y con cero descargas, por lo que debe tratarse como un artefacto experimental más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT): transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje natural como entrada; la instrucción de tarea es una cadena fija) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `top` (una sola, 3x480x640) |
| Entrada de estado | `observation.state`, forma (6,) |
| Salida de accion | `action`, forma (6,) |
| Libreria | lerobot 0.7.1 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers, paper arXiv:2304.13705) es un método de aprendizaje por imitación que combina un codificador visual (procesa la imagen de la cámara cenital de 3x480x640) con un transformer que predice un chunk de acciones futuras en lugar de una sola acción por paso. Esta predicción por chunks reduce el error de acumulación y suaviza el comportamiento, lo que en la práctica se traduce en tasas de éxito más altas que las políticas paso a paso. La observación de estado tiene 6 dimensiones (posición articular del brazo) y la acción predicha también es de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.7.1 sobre 100 episodios de teleoperación (60.000 fotogramas a 30 FPS) de la tarea "Pick the object and place it on the target". La configuración fue de 10.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni ningún ajuste posterior; es aprendizaje supervisado puro a partir de demostraciones. Tampoco se detalla la composición del dataset más allá del número de episodios y la tarea.

## Capacidades

- Control de un brazo robótico `so_follower` de 6 grados de libertad a partir de una imagen cenital y del estado articular.
- Ejecución de la tarea de pick-and-place aprendida: coger un objeto y depositarlo en el objetivo.
- Predicción de chunks de acción, lo que produce movimientos más suaves y coherentes que las políticas paso a paso.
- Inferencia en tiempo real a 30 FPS (la frecuencia del dataset de entrenamiento).
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política visomotora, no un modelo de lenguaje.
- No tiene modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- **Automatización de pick-and-place en laboratorio:** desplegar la política con `lerobot-rollout` sobre un SO-100/SO-101 para mover objetos de una posición a otra de forma repetible, usando la cámara cenital como única entrada visual.
- **Punto de partida para fine-tuning:** usar el modelo como inicialización y reentrenar con `lerobot-train` sobre un dataset propio de otra tarea de manipulación, aprovechando que la arquitectura ACT y el pipeline ya están configurados.
- **Banco de pruebas de hardware:** validar la cadena completa (robot, cámara, calibración, puerto serie, frecuencia de control) antes de invertir en datasets más grandes, dado el reducido tamaño del modelo (0,2 GB) y su bajo coste computacional.
- **Docencia y divulgación en robótica de imitación:** ilustrar el flujo completo de teleoperación, grabación de dataset y entrenamiento de una política ACT con un ejemplo mínimo y reproducible.
- **Investigación en robustez visomotora:** evaluar cómo se degrada la política ante cambios de iluminación, posición del objeto o distractores, ya que el autor no ha publicado evaluación y el modelo está entrenado con una sola cámara.
- **Prototipado de bajo coste:** ejecutar la política en una GPU consumer (el modelo cabe holgadamente en 8 GB de VRAM) para demostraciones en ferias, aulas o entornos con presupuesto limitado.
- **Base para comparativas de métodos de imitación:** contrastar ACT con alternativas como Diffusion Policy o VQ-BeT sobre la misma tarea y el mismo dataset de 100 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito, número de ensayos ni condiciones de evaluación documentadas.

## Requisitos de hardware

- **VRAM estimada:** el modelo tiene 51,6 M de parámetros (unos 207 MB en fp32, unos 103 MB en fp16). La inferencia cabe en menos de 2 GB de VRAM incluyendo buffers de activación y la imagen de entrada de 3x480x640.
- **GPU recomendadas:** cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes; el cuello de botella será la latencia del robot y de la cámara, no la GPU.
- **GPU consumer:** sí, cabe en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida, aunque no se garantiza la latencia de 30 FPS.
- **Opciones de despliegue:** LeRobot (`lerobot-rollout` con `--strategy.type=base`), que carga pesos safetensors vía PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput:** no disponibles. El dataset se grabó a 30 FPS y el bucle de control espera esa frecuencia, pero no se publican mediciones de latencia de inferencia.
- **Hardware robótico:** brazo `so_follower` (SO-100/SO-101), una cámara OpenCV a 640x480 y 30 FPS, y el puerto serie correspondiente.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `inhastupid/act_20` (este) | 51,6 M | ACT (imitación) | Imagen 3x480x640 + estado (6,) | no disponible | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot | ~50 M (típico) | ACT (imitación) | Imagen + estado | Apache-2.0 (LeRobot) | Hugging Face / docs LeRobot |
| Diffusion Policy (referencia LeRobot) | variable, mayor que ACT | Difusión para acciones | Imagen + estado | según implementación | Hugging Face / docs LeRobot |
| VQ-BeT (referencia LeRobot) | variable | Transformer discretizado | Imagen + estado | según implementación | Hugging Face / docs LeRobot |

No se dispone de datos de rendimiento comparativo para este modelo concreto, por lo que la comparativa se limita a parámetros, tipo de método y disponibilidad. Las alternativas citadas son implementaciones genéricas del ecosistema LeRobot, no modelos entrenados sobre el mismo dataset.

## Limitaciones y advertencias

- **Sin licencia declarada:** la model card marca la licencia como "[More Information Needed]". No hay autorización explícita para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- **Sin evaluación publicada:** no hay tasas de éxito ni condiciones de prueba, por lo que se desconoce la fiabilidad real de la política.
- **Sobreajuste probable al entorno de entrenamiento:** una sola cámara cenital, una única tarea y 100 episodios implican poca variedad; cambios de iluminación, fondo, posición inicial del objeto o del propio robot pueden degradar el comportamiento.
- **Especificidad de hardware:** entrenado para `so_follower` con cámara `top`; usar otro robot o montaje de cámara invalida la política.
- **Riesgo de alucinación en el sentido de acciones erróneas:** como toda política de imitación, puede ejecutar trayectorias no deseadas ante entradas fuera de distribución; requiere supervisión y parada de emergencia en el robot.
- **Sesgos:** no evaluados. El dataset de teleoperación refleja los sesgos del operador humano que grabó las demostraciones.
- **Sin soporte de lenguaje:** la tarea se pasa como cadena fija; no hay comprensión de instrucciones variables ni generalización a tareas no entrenadas.
- **Repositorio sin tracción:** cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso por terceros ni de mantenimiento.
- **Caveat de producción:** no usar en entornos con personas o objetos frágiles sin validación exhaustiva y mecanismos de seguridad físicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inhastupid/act_20
- Dataset de entrenamiento: https://huggingface.co/datasets/inhastupid/pick_place_100
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=inhastupid/pick_place_100
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
