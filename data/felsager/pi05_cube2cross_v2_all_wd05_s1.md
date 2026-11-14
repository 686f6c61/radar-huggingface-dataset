# felsager/pi05_cube2cross_v2_all_wd05_s1

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos de robotica. A diferencia de su predecesor π₀, π₀.₅ busca generalizar a entornos y situaciones completamente nuevas que no se vieron durante el entrenamiento. La implementacion disponible en LeRobot esta adaptada del repositorio open source OpenPI del mismo equipo.

El modelo que nos ocupa, `felsager/pi05_cube2cross_v2_all_wd05_s1`, es un fine-tuning de `lerobot/pi05_base` realizado por el usuario felsager sobre un dataset propio de tareas de manipulacion con cubos. Concretamente, la politica ha sido entrenada para recoger cubos de distintos colores y colocarlos sobre una cruz roja, empleando un robot UR5e con pinza y dos camaras (vista superior y vista de muneca).

Se trata de una politica de aprendizaje por imitacion (imitation learning) de 4.143.404.816 parametros, distribuida en formato safetensors con un repositorio de 42,6 GB. Es relevante como ejemplo practico de fine-tuning de un VLA de gran tamano sobre hardware asequible y con el stack LeRobot, aunque carece por completo de resultados de evaluacion publicados y de descargas o interacciones en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ de Physical Intelligence; implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset estan en ingles) |
| Licencia | gemma |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo base es π₀.₅ (Pi05), un VLA de Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones nunca vistas durante el entrenamiento. La implementacion concreta procede de OpenPI y ha sido portada al ecosistema LeRobot. La politica consume observaciones multimodales (estado del robot de 10 dimensiones y dos imagenes RGB de 3x480x640) y produce un vector de accion de 10 dimensiones. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset original ni si se empleo RLHF o DPO.

El fine-tuning se realizo sobre el dataset `felsager/vla_cubes_cross_v2`, compuesto por 1000 episodios y 493.474 frames a 30 FPS. Las tareas cubiertas son cuatro variantes de "pick up the [blue|green|yellow|red] cube and place it on the red cross". La configuracion de entrenamiento reportada es: 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 1 y LeRobot 0.6.2. El sufijo `wd05` del nombre sugiere un weight decay de 0.05, aunque no se documenta explicitamente. No se describe ninguna innovacion tecnica adicional en la model card.

## Capacidades

- Control robotico de manipulacion: genera acciones de 10 dimensiones para un robot UR5e con pinza a partir de observaciones visuales y de estado.
- Percepcion visual multimodal: procesa dos flujos de camara simultaneos (vista superior y vista de muneca) a 480x640.
- Ejecucion de instrucciones en lenguaje natural: acepta tareas como "pick up the blue cube and place it on the red cross".
- Discriminacion de objetos por color: entrenado para distinguir cubos azul, verde, amarillo y rojo.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones humanas.
- No dispone de tool calling, function calling, soporte de agentes multi-paso, capacidades multilingues documentadas ni modos de razonamiento extendido.

## Casos de uso

- Automatizacion de picking y placing en laboratorio: el modelo puede ejecutar la tarea de recoger un cubo de color concreto y depositarlo sobre una diana, util para prototipos de investigacion en manipulacion robotica con un UR5e.
- Benchmark de fine-tuning de VLA: sirve como referencia practica para evaluar el coste y el flujo de trabajo de adaptar π₀.₅ a una tarea concreta con LeRobot, dado que documenta pasos, batch, learning rate y dataset.
- Docencia y formacion en robotica: permite a estudiantes reproducir el pipeline completo (grabacion de datos, entrenamiento, rollout) con un robot industrial estandar y dos camaras.
- Pruebas de generalizacion a variaciones de color: al cubrir cuatro colores de cubo, permite estudiar como se comporta la politica ante cambios de objeto dentro de la misma categoria.
- Base para experimentos de sim-to-real o variaciones de dominio: puede reutilizarse como punto de partida para fine-tunings adicionales con nuevos objetos, posiciones o iluminacion.
- Investigacion en imitation learning: util para comparar estrategias de entrenamiento (weight decay, semillas, tamano de dataset) sobre una misma politica base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la linea "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito en robot real ni metricas de simulacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 4.143 millones de parametros, una estimacion en FP16 rondaria los 8,3 GB solo en pesos, mas el coste de las activaciones y del procesamiento visual, pero no se confirma en la documentacion.
- GPU recomendadas: no disponible. El comando de entrenamiento documentado usa `--policy.device=cuda` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada. Por tamano de pesos, una GPU con 16-24 GB de VRAM podria alojar el modelo en FP16, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` con `--policy.path=felsager/pi05_cube2cross_v2_all_wd05_s1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de politica robotica.
- Latencia y throughput: no disponibles. La politica opera a 30 FPS en la captura de datos, pero no se reporta la frecuencia de inferencia alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_wd05_s1 | 4.143.404.816 | no disponible | VLA fine-tuned | gemma | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA base | gemma | Hugging Face |
| π₀ (Pi0) | no disponible | no disponible | VLA predecesor | no disponible | OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito ni validacion en robot real, lo que impide conocer la fiabilidad de la politica.
- Especificidad extrema de la tarea: solo se ha entrenado para cuatro instrucciones de recogida de cubos y colocacion sobre una cruz roja; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware: requiere un robot UR5e con pinza y la configuracion exacta de camaras (`top` y `wrist`) con la que se entreno; cambios de montaje o calibracion pueden degradar el comportamiento.
- Riesgo de sobreajuste al dataset: con 1000 episodios y 30.000 pasos, el modelo puede memorizar posiciones y condiciones de iluminacion del entorno de captura.
- Licencia "gemma": impone las condiciones de uso de Gemma, que deben revisarse antes de cualquier uso comercial; no es una licencia permisiva generica.
- Idiomas: las instrucciones de tarea estan en ingles y no se documenta soporte multilingue.
- Sin descargas ni likes: el modelo no ha sido validado por la comunidad, por lo que su reproducibilidad no esta contrastada.
- Riesgo de alucinacion en el sentido de acciones incorrectas o inseguras: al ser una politica robotica, errores de prediccion pueden provocar colisiones o manipulaciones erroneas; se recomienda supervisión y limites de seguridad en el robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_wd05_s1
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
