# felsager/pi05_cube2cross_dr_200_epis

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en mundo abierto: evoluciona π₀ para operar en entornos y situaciones que no se han visto durante el entrenamiento. Esta ficha concreta corresponde a un fine-tuning del checkpoint base `lerobot/pi05_base`, publicado por el usuario felsager, orientado a una tarea robotica especifica de manipulacion (recoger cubos de colores y colocarlos sobre una cruz roja) con un robot UR5e equipado con mano.

El modelo combina percepcion visual (dos camaras de 480x640 y una tercera de 224x224) con el estado articular del robot (vector de 10 dimensiones) para producir acciones continuas de 10 dimensiones a 30 FPS. El checkpoint tiene 4.143.404.816 parametros (unos 4,14 mil millones) y se distribuye en formato safetensors con un repositorio de 9,4 GB.

Es relevante porque demuestra el flujo completo de LeRobot para adaptar un VLA de proposito general a una tarea industrial concreta mediante imitation learning, con 120.000 pasos de entrenamiento sobre un dataset de 999 episodios y 510.363 frames. No obstante, se trata de un artefacto de investigacion sin evaluacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), transformer multimodal con codificador visual y decodificador de acciones |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | gemma |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, la implementacion en LeRobot del VLA π₀.₅ de Physical Intelligence, adaptada desde su repositorio OpenPI. La arquitectura es un transformer multimodal que procesa conjuntamente observaciones visuales e instrucciones en lenguaje natural para generar secuencias de acciones motoras. Las entradas son `observation.state` (10 dimensiones), dos imagenes de 480x640 (camaras `top` y `wrist`) y una tercera imagen de 224x224 (`empty_camera_0`); la salida es un vector de accion de 10 dimensiones.

El entrenamiento se realizo con imitation learning sobre el dataset `felsager/vla_cubes_cross_dr` (999 episodios, 510.363 frames a 30 FPS), con cuatro tareas de picking-and-placing de cubos verdes, azules, amarillos y rojos sobre una cruz roja. La configuracion reportada es de 120.000 pasos, batch size de 8, optimizador AdamW, learning rate 5e-05, semilla 0 y LeRobot 0.6.2. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO; por la naturaleza del pipeline (imitation learning sobre demostraciones), no se espera un ajuste por preferencias humanas.

## Capacidades

- Generacion de acciones motoras continuas de 10 dimensiones para un robot UR5e con mano, a partir de observaciones visuales y estado articular.
- Percepcion visual multi-camara: procesa simultaneamente vistas `top` y `wrist` de 480x640 y una vista adicional de 224x224.
- Seguimiento de instrucciones en lenguaje natural para tareas de manipulacion (p. ej. "pick up the green cube and place it on the red cross.").
- Discriminacion por color de objetos (verde, azul, amarillo, rojo) en la tarea de picking.
- Control de politicas en bucle cerrado a 30 FPS mediante el comando `lerobot-rollout`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso simbolico, capacidades multilingues ni modos de pensamiento (thinking mode). Es un modelo de accion, no un asistente conversacional.

## Casos de uso

- **Automatizacion de picking-and-placing en linea de montaje**: el modelo recoge cubos de un color especifico y los deposita en una zona marcada (cruz roja). Es adecuado porque ha sido entrenado especificamente sobre 999 episodios de esta tarea con el mismo tipo de robot.
- **Prototipado rapido de politicas roboticas con LeRobot**: sirve como punto de partida para fine-tuning con `lerobot-train` sobre datasets propios, usando `lerobot/pi05_base` como base y este checkpoint como referencia de configuracion.
- **Investigacion en imitation learning y VLA**: permite reproducir el pipeline completo (grabacion de datos, entrenamiento, rollout) y comparar hiperparametros y volumenes de datos frente a otros checkpoints del mismo autor.
- **Clasificacion y seleccion de objetos por color en entornos controlados**: las cuatro tareas del dataset cubren cuatro colores, lo que permite evaluar la robustez del modelo ante variaciones cromaticas y de posicion.
- **Benchmark interno de generalizacion visual**: al incluir tres camaras con resoluciones distintas, es util para medir como afecta la percepcion multi-vista al exito de la politica.
- **Demostraciones educativas de robotica con UR5e**: el comando de rollout documentado permite ejecutar la politica en 60 segundos sobre hardware real, lo que facilita talleres y validaciones rapidas.
- **Base para data augmentation y domain randomization**: el sufijo `dr` del dataset sugiere entrenamiento con domain randomization; el checkpoint puede servir para estudiar transferencia a condiciones de iluminacion o fondo distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real ni de comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Con 4,14 mil millones de parametros, en precision FP16 se requieren aproximadamente 8,3 GB solo para pesos; en BF16/FP16 con overhead de activaciones y buffers visuales es razonable prever 12-16 GB, aunque no hay dato confirmado por el autor.
- **GPU recomendadas**: no especificadas. Por tamano, una GPU con 16 GB o mas (RTX 4090, A100, H100) es el rango esperable; no se confirma compatibilidad con GPUs de 8 GB.
- **Consumer GPU**: no confirmado. El modelo podria caber en una RTX 4090 (24 GB) en FP16, pero no hay validacion publicada.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` para ejecucion en robot, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas VLA.
- **Latencia y throughput**: no disponibles. El dataset y el control se registran a 30 FPS, pero no se reporta la latencia de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_dr_200_epis | 4,14 B | no disponible | Picking-and-placing de cubos sobre cruz (UR5e) | gemma | Hugging Face, 31 descargas |
| lerobot/pi05_base | no disponible en la informacion | no disponible | VLA de proposito general (base) | no disponible en la informacion | Hugging Face (modelo base) |
| felsager/pi05_cube2cross_dr_bs64 | no disponible en la informacion | no disponible | Variante del mismo autor con batch size 64 | gemma (presumible) | Hugging Face (referenciado en la model card) |

No se dispone de datos de rendimiento comparativo entre estas variantes. La comparativa se limita a parametros, tarea y disponibilidad.

## Limitaciones y advertencias

- **Sin evaluacion publicada**: no hay tasas de exito en robot real; el rendimiento en produccion es desconocido.
- **Alta especializacion**: entrenado unicamente para cuatro tareas de picking de cubos de colores sobre una cruz roja con un UR5e; no se espera generalizacion a otras tareas, objetos o robots.
- **Dependencia de hardware y camaras**: requiere exactamente las camaras `top`, `wrist` y `empty_camera_0` con las resoluciones indicadas; cualquier cambio en la configuracion invalida la politica.
- **Riesgo de sobreajuste al entorno**: el dataset tiene 999 episodios de un unico setup; cambios de iluminacion, fondo o posicion pueden degradar el exito.
- **Licencia Gemma**: el uso comercial esta sujeto a los terminos de la licencia Gemma de Google, que impone restricciones y obligaciones de atribucion; conviene revisarlos antes de un despliegue productivo.
- **Idioma**: las instrucciones de tarea estan en ingles; no se documenta soporte multilingue.
- **Sesgos**: no documentados, pero al ser un modelo entrenado con datos de un unico dominio fisico, puede heredar sesgos de posicion, color y configuracion del setup de grabacion.
- **Alucinacion**: en el contexto VLA se traduce en acciones fisicas incorrectas o inseguras; se recomienda supervision humana y limites de seguridad en el robot.
- **Fecha de creacion futura**: el repositorio figura creado el 2026-11-01, lo que sugiere un artefacto reciente o con metadatos anomalos; verificar la integridad antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_dr_200_epis
- Arbol de ficheros: https://huggingface.co/felsager/pi05_cube2cross_dr_200_epis/tree/main
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: no disponible como enlace directo en la informacion
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guia LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
