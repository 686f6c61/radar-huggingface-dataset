# felsager/pi05_cube2cross_v2_all_wd03

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos: evoluciona π₀ para generalizar a situaciones y entornos completamente nuevos no vistos durante el entrenamiento. La implementacion disponible en LeRobot esta adaptada de su repositorio OpenPI de codigo abierto. Este checkpoint concreto, `felsager/pi05_cube2cross_v2_all_wd03`, es un fine-tuning del modelo base `lerobot/pi05_base` realizado por el usuario felsager para una tarea robotica especifica de manipulacion.

El modelo resuelve el problema de control robotico mediante imitacion: dado un estado de articulaciones y dos vistas de camara (superior y de muneca), predice una accion de 10 dimensiones para un robot UR5e con mano. La tarea entrenada consiste en coger un cubo de un color determinado (azul, verde, amarillo o rojo) y colocarlo sobre una cruz roja. Es relevante como ejemplo de fine-tuning de un VLA de proposito general sobre un dataset propio, mostrando el flujo completo de LeRobot para entrenamiento e inferencia.

El modelo tiene 4.143.404.816 parametros (aproximadamente 4,14 mil millones), se distribuye en formato safetensors con un tamano de repositorio de 42,6 GB y esta publicado bajo licencia Gemma. El contexto, los idiomas y los tipos de cuantizacion no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), adaptada de OpenPI; transformer multimodal con entrada visual y de estado |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones roboticas, no a texto libre) |
| Licencia | gemma |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo es un VLA de tipo π₀.₅ (Pi05), que combina percepcion visual, comprension del lenguaje y generacion de acciones en un unico transformer multimodal. La implementacion usada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. El modelo consume dos imagenes de camara (`top` y `wrist`, de 3×480×640) y un vector de estado de 10 dimensiones (`observation.state`), y produce un vector de accion de 10 dimensiones. La tarea se especifica mediante una instruccion en lenguaje natural.

El fine-tuning se realizo sobre el modelo base `lerobot/pi05_base` con el dataset `felsager/vla_cubes_cross_v2`: 1000 episodios, 493.474 frames a 30 FPS, con cuatro tareas de recogida y colocacion de cubos de colores sobre una cruz roja. La configuracion de entrenamiento fue de 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05, semilla 0 y LeRobot 0.6.2. No se dispone de informacion sobre la composicion detallada del dataset de preentrenamiento del modelo base, ni sobre si hubo RLHF o DPO.

## Capacidades

- Generacion de acciones roboticas de 10 dimensiones para un robot UR5e con mano (`ur5e_hand_e`).
- Percepcion visual multimodal a partir de dos camaras simultaneas (vista superior y de muneca).
- Comprension de instrucciones en lenguaje natural para especificar la tarea (por ejemplo, "pick up the blue cube and place it on the red cross.").
- Manipulacion de objetos con distincion por color (azul, verde, amarillo, rojo) y colocacion sobre un objetivo (cruz roja).
- Control de politica de imitacion entrenada de extremo a extremo con LeRobot.
- No se dispone de informacion sobre tool calling, function calling, capacidades de agente multi-paso, modo thinking, vision general, audio ni capacidades multilingues en el sentido de texto libre.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta la tarea de coger un cubo de color y colocarlo sobre la cruz roja, adecuado para experimentos de imitacion con un UR5e y dos camaras.
- Prototipado rapido de politicas roboticas: sirve como punto de partida para fine-tuning sobre nuevos datasets con LeRobot, usando `lerobot-train` y el modelo base `lerobot/pi05_base`.
- Evaluacion de generalizacion visual: al estar entrenado con dos vistas (superior y muneca), permite estudiar como generaliza el VLA ante cambios de posicion, iluminacion o distractores en el entorno de trabajo.
- Investigacion en aprendizaje por imitacion: el checkpoint y su dataset asociado (1000 episodios, 493.474 frames) permiten reproducir y analizar el proceso de entrenamiento de un VLA.
- Despliegue en robot real con `lerobot-rollout`: integracion directa con el hardware UR5e y camaras OpenCV para ejecutar la politica en tiempo real a 30 FPS.
- Benchmark de referencia para tareas de clasificacion por color y colocacion: util para comparar variantes de fine-tuning (por ejemplo, distintas semillas o hiperparametros) sobre la misma tarea.
- Educacion y divulgacion: ejemplo completo del flujo LeRobot (instalacion, grabacion de datos, entrenamiento, rollout) para ensenar VLA en robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio ocupa 42,6 GB en safetensors, lo que sugiere que la inferencia en precision completa requiere una GPU con memoria abundante (no se especifica).
- GPU recomendadas: no disponible; no se indica en la model card.
- Cabe en GPU consumer: no disponible; no se confirma.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion, `lerobot-train` para entrenamiento), con soporte de `--policy.device=cuda`.
- Latencia y throughput estimados: no disponible; el dataset se grabo a 30 FPS, pero no se documenta la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_wd03 (este) | 4.143.404.816 | no disponible | VLA fine-tuned para pick-and-place de cubos | gemma | Hugging Face |
| lerobot/pi05_base | no disponible en la informacion | no disponible | VLA base de proposito general | no disponible en la informacion | Hugging Face |
| π₀ (Pi0) | no disponible en la informacion | no disponible | VLA predecesor de π₀.₅ | no disponible en la informacion | OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en una unica tarea y un unico tipo de robot (`ur5e_hand_e`); no es un modelo de proposito general fuera de ese dominio.
- Solo reconoce cuatro colores de cubo (azul, verde, amarillo, rojo) y un unico objetivo (cruz roja); cualquier variacion fuera de ese espacio puede degradar el rendimiento.
- No hay resultados de evaluacion publicados, por lo que se desconoce la tasa de exito real de la politica.
- Riesgo de sobreajuste al entorno de grabacion del dataset (posiciones, iluminacion, fondo); no se documenta la robustez ante cambios.
- Licencia Gemma: existen restricciones de uso comercial y condiciones especificas que deben revisarse antes de un despliegue en produccion.
- No se dispone de informacion sobre sesgos, alucinacion (en el sentido de acciones incorrectas) ni limitaciones de contexto o idioma.
- El modelo no esta pensado para generacion de texto libre ni para tareas de lenguaje; su salida es un vector de accion.
- El repositorio ocupa 42,6 GB, lo que puede complicar el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_wd03
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ (Pi05): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
