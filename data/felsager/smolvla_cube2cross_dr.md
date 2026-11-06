# felsager/smolvla_cube2cross_dr

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para control robótico mediante imitación y desplegable en hardware de consumo. Este repositorio concreto, `felsager/smolvla_cube2cross_dr`, es un ajuste fino del modelo base `felsager/smolvla_base_ee_rel` orientado a una tarea específica de manipulación: recoger un cubo de color y colocarlo sobre una cruz roja. El modelo consume observaciones multimodales (estado del robot y tres cámaras) y produce una acción de 10 dimensiones a 30 FPS.

El modelo resuelve el problema de la política de control de bajo nivel en robótica manipulativa, sustituyendo pipelines de planificación tradicionales por una política neuronal entrenada por imitación sobre 999 episodios y 510.363 frames. Su relevancia radica en que demuestra que un VLA de 450 millones de parámetros puede ejecutar tareas de precisión con hardware asequible, sin necesidad de clústeres de GPU.

La arquitectura subyacente es SmolVLA, presentada en el paper arXiv:2506.01844, que combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones. La licencia Apache 2.0 y el formato safetensors lo hacen directamente utilizable en producción con el stack LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones, no a texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Tipo de robot | ur5e_hand_e |
| Cámaras de entrada | top, wrist, empty_camera_0 |
| Dimensión de estado | (10,) |
| Dimensión de acción | (10,) |
| Frecuencia de control | 30 FPS |
| Tamaño del repo | 19,9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que integra percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras en una única red. El modelo procesa tres flujos visuales de resolución 480x640 (cámara superior, cámara de muñeca y una cámara adicional) junto con un vector de estado del robot de 10 dimensiones, y emite un vector de acción de 10 dimensiones. El ajuste fino se realizó sobre el checkpoint `felsager/smolvla_base_ee_rel`, que a su vez parte del SmolVLA original de Hugging Face.

El entrenamiento se llevó a cabo con LeRobot 0.6.2 sobre el dataset `felsager/vla_cubes_cross_dr`, compuesto por 999 episodios y 510.363 frames a 30 FPS. Se entrenaron 80.000 pasos con batch size 64, optimizador AdamW, learning rate 0,001 y semilla 0. Las tareas cubiertas son cuatro variantes de "pick up the [color] cube and place it on the red cross" para cubos verde, azul, amarillo y rojo. No se documenta el uso de RLHF, DPO ni decodificación especulativa en este ajuste fino.

## Capacidades

- Control robótico de manipulación pick-and-place: recoger un cubo de un color especificado y depositarlo sobre una cruz roja.
- Percepción visual multimodal con tres cámaras simultáneas (vista superior, muñeca y cámara auxiliar).
- Condicionamiento por instrucción en lenguaje natural (task prompt) para seleccionar el objeto objetivo entre cuatro colores.
- Generación de acciones de 10 dimensiones a 30 FPS, adecuada para control en tiempo real de un UR5e con mano.
- Ejecución de políticas de imitación entrenadas end-to-end, sin planificación simbólica explícita.
- Integración nativa con el ecosistema LeRobot para rollout, evaluación y reentrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni generación de texto libre: es un modelo puramente orientado a acción.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia completa de recogida y colocación sobre una cruz de referencia, útil para tareas de clasificación de piezas por color en entornos controlados.
- Prototipado rápido de políticas robóticas: al partir de un checkpoint preentrenado, un equipo puede ajustar el modelo con pocos episodios propios para una nueva variante de la tarea, reduciendo el coste de recogida de datos.
- Validación de pipelines de imitación con LeRobot: sirve como referencia funcional para verificar la instalación, calibración de cámaras y configuración de un UR5e antes de abordar tareas más complejas.
- Investigación en VLA de bajo coste computacional: con 450 millones de parámetros, permite experimentar con arquitecturas visión-lenguaje-acción en una sola GPU, sin infraestructura de clúster.
- Benchmark de generalización por color: las cuatro instrucciones de color permiten evaluar la capacidad del modelo de discriminar objetos visualmente similares bajo distintas condiciones de iluminación y posición.
- Docencia y formación en robótica: el modelo y su dataset asociado constituyen un ejemplo completo y reproducible de entrenamiento por imitación, desde la grabación de datos hasta el despliegue en robot real.
- Base para tareas de "pick and place" con referencia espacial: la cruz roja actúa como punto de destino fijo, lo que facilita la evaluación objetiva del éxito de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros en precisión FP32 el peso ronda 1,8 GB, por lo que en FP16 cabría en menos de 1 GB de VRAM, más el coste de los tres flujos visuales a 480x640.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque el autor no lo confirma.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es el método documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: el control opera a 30 FPS según el dataset de entrenamiento; no se publican cifras de latencia de inferencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/smolvla_cube2cross_dr | 450 M | VLA (SmolVLA) | Pick-and-place 4 colores sobre cruz | Apache 2.0 | Hugging Face |
| felsager/smolvla_base_ee_rel | no disponible | VLA (SmolVLA) | Base para ajuste fino | Apache 2.0 | Hugging Face |
| SmolVLA original (Hugging Face) | no disponible en esta ficha | VLA | Manipulación general | Apache 2.0 | Hugging Face / LeRobot |
| Políticas ACT / Diffusion Policy en LeRobot | no disponible | Imitación | Manipulación | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está ajustado a una tarea muy concreta (cuatro colores de cubo sobre una cruz roja) y un robot específico (UR5e con mano); no generaliza a otras tareas sin reentrenamiento.
- No se han publicado resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito efectiva.
- Depende de la configuración exacta de cámaras (`top`, `wrist`, `empty_camera_0`) y de sus nombres; un cambio en la disposición o calibración puede degradar el rendimiento.
- El modelo no procesa lenguaje libre ni mantiene conversaciones; la instrucción de tarea se limita a las cuatro variantes entrenadas.
- Riesgo de sobreajuste al entorno de recogida de datos (iluminación, posiciones, fondo); no se documenta aumento de datos ni variabilidad.
- No se documentan sesgos sociales ni de idioma porque el modelo no genera texto, pero sí puede heredar sesgos visuales del dataset de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento en robot real recae en el integrador.
- El tamaño del repo (19,9 GB) incluye probablemente checkpoints y artefactos de entrenamiento; conviene revisar qué se descarga antes de desplegar.
- No se especifican requisitos de seguridad física para el UR5e; en producción debe existir supervisión y paradas de emergencia independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/smolvla_cube2cross_dr
- Modelo base: https://huggingface.co/felsager/smolvla_base_ee_rel
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
