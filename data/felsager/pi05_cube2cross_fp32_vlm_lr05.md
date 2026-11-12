# felsager/pi05_cube2cross_fp32_vlm_lr05

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para generalizar en entornos abiertos y situaciones no vistas durante el entrenamiento. Este repositorio concreto, `felsager/pi05_cube2cross_fp32_vlm_lr05`, es un fine-tuning del modelo base `lerobot/pi05_base` realizado por el usuario felsager mediante la libreria LeRobot de Hugging Face, orientado a una tarea robotica especifica de manipulacion.

El modelo resuelve el problema de control robotico guiado por lenguaje e imagen: recibe el estado del robot y dos flujos de camara (vista superior y vista de muneca) y produce un vector de acciones de 10 dimensiones. Esta especializado en tareas de tipo "pick and place" sobre cubos de colores y una cruz roja, con cuatro instrucciones de lenguaje distintas. Su relevancia radica en que demuestra el flujo completo de fine-tuning de un VLA de proposito general sobre un dataset de imitacion propio, usando el ecosistema LeRobot.

El modelo cuenta con 4.143.404.816 parametros (aproximadamente 4,1 mil millones) en formato safetensors, con un repositorio de 42,6 GB. La licencia es Gemma, heredada del modelo base, y el pipeline declarado es robotics. No se dispone de informacion sobre longitud de contexto, idiomas soportados ni resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32 segun el nombre del repo) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist |
| Tamano del repositorio | 42,6 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de π₀.₅ (Pi05), un VLA de Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones completamente nuevos no vistos en entrenamiento. La implementacion utilizada es la de LeRobot, adaptada del repositorio open source OpenPI. La arquitectura combina percepcion visual (dos camaras), comprension del lenguaje (la instruccion de tarea) y generacion de acciones motoras, aunque la informacion disponible no detalla la composicion interna de capas, el mecanismo de atencion ni el esquema exacto de fusion vision-lenguaje-accion.

El entrenamiento se realizo mediante imitacion supervisada sobre el dataset `felsager/vla_cubes_cross_dr`, compuesto por 999 episodios y 510.363 frames a 30 FPS. La configuracion reportada incluye 30.000 pasos de entrenamiento, batch size de 8, optimizador AdamW, learning rate de 5e-05, semilla 0 y LeRobot version 0.6.2. No se especifica el numero total de tokens de entrenamiento, la composicion del dataset mas alla de las cuatro tareas de pick-and-place, ni si se aplicaron tecnicas de RLHF o DPO. El nombre del repositorio sugiere pesos en fp32 y un ajuste fino del componente VLM con learning rate 0,05, aunque esto no se confirma en la model card.

## Capacidades

- Generacion de acciones roboticas de 10 dimensiones a partir de observaciones multimodales (estado del robot y dos imagenes de camara).
- Comprension de instrucciones de lenguaje natural para seleccionar el objeto y el destino de la tarea.
- Manipulacion pick-and-place sobre cuatro cubos de colores (verde, azul, amarillo y rojo) y una cruz roja como destino.
- Percepcion visual dual: vista superior y vista de muneca, con resolucion de 480x640 por camara.
- Control de un robot UR5e con mano (tipo `ur5e_hand_e`) mediante la interfaz de rollout de LeRobot.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el modelo ejecuta una tarea de manipulacion por instruccion.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): vision integrada como entrada; no se documentan otras.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo puede recoger cubos de colores y colocarlos sobre una cruz roja siguiendo instrucciones de lenguaje, adecuado para prototipos de investigacion en robotica de manipulacion.
- Demostracion de fine-tuning de VLA: sirve como ejemplo reproducible del flujo `lerobot-train` sobre un dataset propio, util para equipos que quieran adaptar π₀.₅ a sus propias tareas.
- Evaluacion de generalizacion en entornos controlados: al estar entrenado con 999 episodios y cuatro instrucciones, permite medir la robustez del modelo ante variaciones de posicion, iluminacion o distractores en un banco de pruebas acotado.
- Investigacion en imitation learning: el dataset de 510.363 frames a 30 FPS y la configuracion de entrenamiento documentada permiten reproducir y comparar experimentos de aprendizaje por imitacion.
- Integracion en pipelines de robotica con LeRobot: el comando `lerobot-rollout` permite desplegar la politica en un UR5e real con camaras OpenCV, lo que facilita pruebas de inferencia en hardware fisico.
- Base para transferencia a tareas similares: al partir de `lerobot/pi05_base`, el modelo puede servir como punto de partida para fine-tunings adicionales en tareas de manipulacion con objetos y destinos distintos.
- Docencia y formacion: el repositorio incluye instrucciones completas de instalacion, grabacion de datos y entrenamiento, lo que lo hace util como material practico en cursos de robotica e IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica y que la tabla de evaluacion en robot real esta pendiente de rellenar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.143.404.816 parametros en fp32, los pesos ocupan aproximadamente 16,6 GB, a los que hay que sumar el estado del entorno de inferencia y los buffers de vision; se recomienda al menos 24 GB de VRAM para fp32.
- GPU recomendadas: no especificadas por el autor. Por tamano, una A100, H100 o RTX 4090 son opciones razonables para fp32; no se confirma compatibilidad con GPUs de menor VRAM.
- Cabe en consumer GPU: previsiblemente en RTX 4090 (24 GB) en fp32; en GPUs de 16 GB o menos requeriria cuantizacion, que no esta documentada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia en robot, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_fp32_vlm_lr05 | 4.143.404.816 | no disponible | VLA fine-tuned | gemma | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA base | no disponible | Hugging Face |
| π₀ (Pi0) | no disponible | no disponible | VLA | no disponible | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad; los datos de contexto y benchmarks no estan publicados para ninguno de ellos en las fuentes consultadas.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado unicamente para cuatro instrucciones de pick-and-place sobre cubos de colores y una cruz roja; no se espera que generalice a otras tareas, objetos o entornos sin fine-tuning adicional.
- Sin resultados de evaluacion: no hay tasas de exito publicadas, por lo que se desconoce su fiabilidad real en robot fisico.
- Dependencia del hardware: requiere un robot UR5e con mano y dos camaras configuradas con los nombres `top` y `wrist`; cualquier desviacion en la configuracion puede invalidar la politica.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma, que impone restricciones y obligaciones especificas; debe revisarse antes de cualquier despliegue productivo.
- Riesgo de alucinacion: no aplica en el sentido textual, pero el modelo puede generar acciones incorrectas o inseguras ante situaciones fuera de distribucion, con riesgo fisico en un robot real.
- Sesgos conocidos: no documentados; el dataset de entrenamiento es limitado y especifico, lo que puede introducir sesgos hacia posiciones, iluminaciones y configuraciones concretas.
- Limitaciones de contexto e idioma: no disponibles; las instrucciones de tarea estan en ingles y limitadas a las cuatro frases del dataset.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion comunitaria y el soporte disponible.
- Caveat de produccion: al ser un fine-tuning de investigacion sin evaluacion publicada, no se recomienda su uso en entornos de produccion sin una validacion exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_fp32_vlm_lr05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr
- Blog de π₀.₅ (Pi05): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
