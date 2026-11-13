# felsager/pi05_cube2cross_v2_aug

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos. Evoluciona π₀ para generalizar a situaciones y entornos completamente nuevos que no fueron vistos durante el entrenamiento. La implementacion en LeRobot esta adaptada del repositorio OpenPI de la compania. Este checkpoint concreto, `felsager/pi05_cube2cross_v2_aug`, es un fine-tuning de `lerobot/pi05_base` sobre el dataset `felsager/vla_cubes_cross_v2`, orientado a una tarea especifica de picking y placing sobre un robot UR5e.

El modelo resuelve el problema de control de robots manipuladores a partir de observaciones visuales y del estado del robot, generando acciones de 10 dimensiones. Es relevante porque combina comprension vision-lenguaje con accion motora en un unico transformer, y porque su integracion en LeRobot permite entrenar y desplegar politicas de imitacion con relativa facilidad. El checkpoint tiene 4.143.404.816 parametros y un tamano de repositorio de 24,5 GB.

La tarea concreta entrenada consiste en coger un cubo de color (azul, verde, amarillo o rojo) y colocarlo sobre una cruz roja, usando dos camaras (top y wrist) y un robot UR5e con mano. El modelo se distribuye con licencia gemma y pesos en formato safetensors a traves de la libreria LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, evolucion de π₀; implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist |
| Entrada observation.state | STATE, shape (10,) |
| Entrada observation.images.top | VISUAL, shape (3, 480, 640) |
| Entrada observation.images.wrist | VISUAL, shape (3, 480, 640) |
| Salida action | ACTION, shape (10,) |
| Libreria | lerobot |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 24,5 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un modelo Vision-Language-Action que procesa observaciones multimodales (imagenes de camaras y estado del robot) y emite acciones continuas de 10 dimensiones. La implementacion utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. No se dispone de detalles adicionales sobre el numero de capas, dimensiones ocultas, mecanismos de atencion ni innovaciones tecnicas especificas en la informacion proporcionada.

El entrenamiento es un fine-tuning supervisado (imitacion) sobre el dataset `felsager/vla_cubes_cross_v2`, compuesto por 1000 episodios y 493.474 frames a 30 FPS. Las tareas del dataset son cuatro variantes de "pick up the [color] cube and place it on the red cross" para los colores azul, verde, amarillo y rojo. La configuracion de entrenamiento fue: 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 0. No se especifica si hubo RLHF, DPO ni otras fases de alineamiento, ni la composicion exacta del dataset de preentrenamiento del modelo base.

## Capacidades

- Control de robot manipulador UR5e con mano: genera acciones de 10 dimensiones a partir de observaciones visuales y de estado.
- Percepcion visual multimodal: procesa dos flujos de imagen simultaneos (camara superior y camara de muneca) a resolucion 480x640.
- Ejecucion de tareas de picking y placing guiadas por instruccion en lenguaje natural: las cuatro tareas entrenadas son variantes de coger un cubo de color y colocarlo sobre una cruz roja.
- Generalizacion a entornos abiertos segun la descripcion de π₀.₅ (capacidad declarada por el disenador del metodo, no verificada en este checkpoint).
- Integracion con el ecosistema LeRobot para rollout y entrenamiento mediante CLI (`lerobot-rollout`, `lerobot-train`).
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de robotica).
- Soporte de agentes y multi-step reasoning: no disponible como capacidad declarada.
- Capacidades multilingues: no disponible; las instrucciones del dataset estan en ingles.
- Capacidades especiales: no disponible (no se documenta thinking mode, vision generativa, audio ni otras).

## Casos de uso

- Automatizacion de picking y placing en laboratorio: el modelo ejecuta la tarea de coger un cubo de color y depositarlo sobre una cruz roja, adecuado para montajes de investigacion en manipulacion robotica con UR5e.
- Prototipado rapido de politicas de imitacion: al estar integrado en LeRobot, permite entrenar y desplegar una politica con `lerobot-train` y `lerobot-rollout` en pocos pasos, util para validar pipelines de aprendizaje por imitacion.
- Benchmark de generalizacion visual: las cuatro variantes de color permiten evaluar como responde la politica ante cambios en el objeto objetivo, usando las dos camaras disponibles.
- Base para fine-tuning en tareas similares: al partir de `lerobot/pi05_base`, sirve como punto de partida para nuevos datasets de manipulacion con el mismo tipo de robot y configuracion de camaras.
- Docencia y formacion en VLA: el checkpoint y su dataset asociado (1000 episodios, 493.474 frames) permiten ilustrar el flujo completo de grabacion de datos, entrenamiento y despliegue en robot real.
- Investigacion en robustez ante posiciones y condiciones variables: la model card sugiere evaluar el efecto de nuevas posiciones de objetos, iluminacion, distractores o un robot distinto del mismo tipo, lo que lo hace util para estudios de robustez.
- Demostraciones de robotica con hardware UR5e: el comando de rollout documentado permite ejecutar la politica durante un tiempo determinado (`--duration=60`) para demos reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"). No se dispone de tasas de exito, latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 4.143.404.816 parametros, una estimacion en precision completa (fp32) rondaria los 16,6 GB solo en pesos, y en bf16/fp16 unos 8,3 GB, pero son calculos derivados del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: no disponible. El comando de entrenamiento documentado usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (estrategia `base`) y entrenamiento mediante `lerobot-train`. No se documentan otros backends como vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_aug | 4.143.404.816 | no disponible | VLA (fine-tuning de π₀.₅) | gemma | Hugging Face, via LeRobot |
| lerobot/pi05_base | no disponible | no disponible | VLA (modelo base π₀.₅) | no disponible en la informacion | Hugging Face, via LeRobot |
| π₀ (Pi0) | no disponible | no disponible | VLA (generacion anterior) | no disponible en la informacion | OpenPI (repositorio de Physical Intelligence) |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada. Las alternativas de la misma categoria (otros checkpoints VLA de LeRobot) no se han podido contrastar con cifras.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan sesgos especificos.
- Riesgo de alucinacion: no disponible como metrica, pero al ser una politica de imitacion entrenada con 1000 episodios, su comportamiento fuera de la distribucion de entrenamiento (posiciones, iluminacion, objetos) no esta garantizado.
- Limitaciones de contexto o idioma: las instrucciones de tarea estan en ingles y limitadas a cuatro frases concretas; no se documenta soporte multilingue ni contexto de lenguaje amplio.
- Restricciones de licencia: licencia gemma, que impone condiciones de uso (terminos de la licencia Gemma de Google); es necesario revisar sus restricciones antes de un uso comercial.
- Especificidad de hardware: el modelo esta entrenado para el robot `ur5e_hand_e` con camaras `top` y `wrist` a 480x640; los nombres de camara deben coincidir con las claves de observacion entrenadas.
- Sin resultados de evaluacion: la model card no reporta tasas de exito ni pruebas en robot real, por lo que el rendimiento en produccion es desconocido.
- Sin datos de cuantizacion: no se documentan formatos cuantizados ni requisitos de VRAM verificados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_aug
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
