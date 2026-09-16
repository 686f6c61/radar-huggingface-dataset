# HueyWoo/lekiwi_pick_and_place_red_cube_smolvla

## Resumen

El modelo `HueyWoo/lekiwi_pick_and_place_red_cube_smolvla` es una política robótica de tipo visión-lenguaje-acción (VLA) obtenida al afinar el modelo base `lerobot/smolvla_base`, que a su vez implementa la arquitectura SmolVLA descrita en el artículo arXiv:2506.01844. Lo desarrolla el usuario HueyWoo y está pensado para una única tarea de manipulación: coger un cubo rojo y colocarlo sobre una caja ("pick a red cube and place it on box"). Se publica a través de la librería LeRobot de Hugging Face, que gestiona tanto el entrenamiento por imitación como el despliegue sobre robots reales.

La relevancia de este tipo de modelos radica en su tamaño reducido. Con 450.046.176 parámetros (unos 450 millones), SmolVLA está diseñado para ejecutarse en hardware de consumo, algo poco habitual en modelos VLA, que suelen superar los miles de millones de parámetros. Esta ficha concreta es un ejemplo de ajuste fino sobre un robot LeKiwi con dos cámaras (front y wrist, aunque la interfaz declara tres entradas visuales) y una tarea muy acotada.

Conviene subrayar que no se trata de un modelo de lenguaje general, sino de una policy de control motor: recibe observaciones (estado del robot e imágenes) y emite directamente un vector de acciones de 9 dimensiones. Por tanto, muchas de las categorías habituales de una ficha de modelo (idiomas, contexto, razonamiento) no aplican y se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA), basada en SmolVLA (arXiv:2506.01844) |
| Parámetros totales | 450.046.176 (aprox. 450 M) |
| Parámetros activos | no aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible (no es un modelo conversacional) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de LeRobot) |
| Tipo de robot | lekiwi_client |
| Cámaras | front, wrist (claves observation.images.camera1/2/3) |
| Entradas | observation.state (6,), observation.images (3, 256, 256) |
| Salidas | action (9,) |
| Tamaño del repositorio | 0,9 GB |
| Modelo base | lerobot/smolvla_base |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que combina un backbone de visión-lenguaje preentrenado con un experto de acción, y que se entrena para producir trayectorias de control a partir de observaciones multimodales. En este caso concreto, el modelo parte de `lerobot/smolvla_base` y se ha afinado por imitación sobre un único conjunto de datos propio. La model card no detalla la composición interna del backbone ni el mecanismo exacto de generación de acciones, por lo que esos extremos quedan como no disponibles.

El ajuste fino se realizó sobre el dataset `HueyWoo/lekiwi_pick_and_place_red_cube`, compuesto por 65 episodios y 13.123 fotogramas capturados a 30 FPS, todos ellos correspondientes a la tarea "pick a red cube and place it on box". La configuración de entrenamiento documentada es la siguiente: 80.000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, con LeRobot versión 0.6.0. No se especifica si hubo etapas de RLHF, DPO ni otras fases de alineamiento, ni el número total de tokens o muestras vistas más allá de los pasos indicados.

## Capacidades

- Control robótico por imitación: genera acciones de 9 dimensiones para un robot LeKiwi a partir de estado y observaciones visuales.
- Percepción visual multimodal: procesa tres entradas de imagen de 3×256×256 píxeles (cámaras front y wrist) junto con el estado del robot de 6 dimensiones.
- Ejecución de una tarea específica: recoger un cubo rojo y depositarlo sobre una caja.
- Integración con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- Capacidades multilingües: no aplica / no disponible.
- Capacidades especiales: no se documentan modos de pensamiento, visión general o audio más allá de las cámaras indicadas.

## Casos de uso

- Automatización de picking en entornos controlados: la política puede ordenar piezas recogiendo un objeto y depositándolo en una ubicación fija, útil para tareas repetitivas de clasificación en laboratorio o línea de montaje.
- Prototipado de robótica de bajo coste: al ser un modelo de 450 M que cabe en hardware de consumo, sirve para validar flujos de imitación sin depender de GPUs de centro de datos.
- Investigación en aprendizaje por imitación: permite reproducir el pipeline completo de LeRobot (grabación de datos, entrenamiento y despliegue) con un caso de estudio documentado y reproducible.
- Educación y formación: como ejemplo didáctico de VLA completo con dataset, configuración de entrenamiento y comandos de ejecución publicados.
- Base para ajuste fino adicional: sirve como punto de partida para entrenar variantes sobre otras tareas de manipulación manteniendo el backbone de SmolVLA.
- Pruebas de generalización robótica: permite evaluar cómo se comporta una policy afinada con solo 65 episodios ante variaciones de posición, iluminación o distractores.
- Demostraciones de bajo consumo energético: su tamaño reducido facilita ejecutarlo en plataformas embebidas o mini-PC con GPU integrada para robótica móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de tasas de éxito, MMLU ni métricas comparables para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros, en precisión FP16 los pesos ocupan aproximadamente 0,9 GB; en FP32, alrededor de 1,8 GB. A ello hay que sumar el coste de procesar tres imágenes de 256×256 y el estado, de modo que 2-4 GB de VRAM serían suficientes en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una RTX 3050, RTX 3060, RTX 4060 o superior. También es viable en GPUs de centro de datos (A100, H100) aunque sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna; incluso podría ejecutarse en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: el método documentado es `lerobot-rollout` con `--strategy.type=base`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. La captura de datos se hizo a 30 FPS, pero no se especifica la frecuencia de inferencia alcanzable en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HueyWoo/lekiwi_pick_and_place_red_cube_smolvla | 450 M | no aplica | Apache 2.0 | Hugging Face (0 descargas) | Política afinada para una tarea concreta |
| lerobot/smolvla_base | aprox. 450 M | no aplica | Apache 2.0 | Hugging Face | Modelo base de SmolVLA, sin ajuste a tarea |
| OpenVLA | aprox. 7 B | no aplica | no disponible en esta búsqueda | Hugging Face | VLA de mayor tamaño, orientado a propósito general |
| Otras políticas LeRobot | no disponible | no aplica | variable | Hugging Face | Dependen del robot y dataset |

Los datos de rendimiento comparativo no están disponibles; la comparación se limita a tamaño, licencia y disponibilidad según lo documentado.

## Limitaciones y advertencias

- Tarea única: la política solo ha sido entrenada para "pick a red cube and place it on box"; no se espera que generalice a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas de robustez, por lo que se desconoce su fiabilidad real.
- Dataset muy reducido: 65 episodios y 13.123 fotogramas son una base pequeña, lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y objetos concretos.
- Posible desajuste de entradas: la model card menciona dos cámaras (front y wrist), pero la interfaz declara tres entradas visuales de 3×256×256; conviene verificar las claves de observación antes de desplegar.
- Dependencia del hardware: requiere un robot LeKiwi (`lekiwi_client`) y cámaras configuradas con los mismos nombres de observación que en el entrenamiento.
- Sesgos: no disponibles explícitamente, aunque en robótica los sesgos de demostración (posiciones, colores, entorno) pueden inducir comportamientos frágiles.
- Riesgo de alucinación: no aplica en el sentido lingüístico; en su lugar existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se cite correctamente.
- Sin garantías de seguridad física: al tratarse de una política de control, su uso en entornos reales debe ir acompañado de salvaguardas mecánicas y de parada de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HueyWoo/lekiwi_pick_and_place_red_cube_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HueyWoo/lekiwi_pick_and_place_red_cube
- Artículo SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HueyWoo/lekiwi_pick_and_place_red_cube
