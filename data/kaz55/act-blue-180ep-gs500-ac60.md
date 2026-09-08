# Kaz55/act-blue-180ep-gs500-ac60

## Resumen

El modelo `Kaz55/act-blue-180ep-gs500-ac60` es un checkpoint de politica robotica basado en ACT (Action Chunking with Transformers), entrenado con la libreria LeRobot. Lo desarrolla el usuario Kaz55 como parte de un barrido de resoluciones de sensores tactiles GelSight sobre una tarea de manipulacion de un cable azul con un robot UR5e equipado con una pinza DG-5F. El objetivo del barrido es aislar el efecto de la resolucion tactil en el rendimiento, manteniendo el resto de entradas (camaras RealSense, estado del robot) identicas entre ejecuciones.

El modelo tiene 51.668.634 parametros totales y los pesos se almacenan en formato safetensors. La politica predice secuencias de acciones con un chunk_size de 60 pasos, y consume entradas multimodales: estado del robot (26 dimensiones), dos camaras RealSense a 640x480 y dos sensores GelSight a resolucion nativa 500x375. La relevancia de este checkpoint es metodologica: permite comparar el efecto de la resolucion tactil en una tarea de manipulacion fina, aunque el propio autor advierte que la perdida de entrenamiento no distingue entre resoluciones, por lo que se necesita evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.634 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robotica, no aplica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica, modelo de robotica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, una politica de robotica que predice un bloque de acciones futuras (chunking) en lugar de una sola accion, lo que mejora la estabilidad y la suavidad del control. En este checkpoint, el chunk_size es 60 y el numero de pasos de accion predichos tambien es 60. La arquitectura combina entradas de estado, vision y tacto, y se entrena con el dataset `Kaz55/dg5f_ur5e_blue_180ep_gs500`, compuesto por 186 episodios y 186.152 frames. El entrenamiento se realizo durante 100.000 pasos (aproximadamente 4.3 epocas) con batch size 8 y semilla 1000.

Las entradas del modelo son `observation.state` (26 dimensiones), dos camaras RealSense a 640x480 y dos sensores GelSight a 500x375. El autor excluye deliberadamente `observation.velocity` y `observation.effort`, aunque estan presentes en el dataset, para evitar que la derivacion automatica de caracteristicas los alimente a la politica y anada una diferencia adicional entre las ejecuciones del barrido. Este checkpoint corresponde a la resolucion GelSight nativa (500x375) y forma parte de un sweep que incluye resoluciones 320x240, 160x120, 88x66 y una configuracion sin GelSight.

## Capacidades

- Prediccion de secuencias de acciones (chunking) para control robotico, con chunk_size igual a 60.
- Fusion multimodal de estado del robot, vision (RealSense 640x480) y tacto (GelSight 500x375).
- Especializado en una tarea concreta: manipulacion de un cable azul con un robot UR5e y pinza DG-5F.
- Disenado para estudios de ablativo: permite comparar el efecto de la resolucion tactil manteniendo constantes el resto de entradas.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni razonamiento simbolico.
- No soporta vision generalista ni audio: su capacidad visual esta limitada a las camaras del robot.

## Casos de uso

- Investigacion en manipulacion tactil: utilizar este checkpoint como punto de referencia para evaluar si una mayor resolucion de GelSight mejora el exito en tareas de insercion o manipulacion de cables.
- Reproduccion de experimentos en robotica: el modelo y el dataset publicados permiten replicar el entrenamiento y verificar los resultados del barrido de resoluciones.
- Comparacion de sensores tactiles: ejecutar este modelo junto con los otros checkpoints del sweep (gs320, gs160, gs88, gs0) para medir la diferencia en rendimiento real sobre el robot.
- Desarrollo de politicas para manipulacion de cables: en entornos de laboratorio con el mismo robot UR5e y pinza DG-5F, el modelo puede servir como baseline para tareas similares de cable routing.
- Validacion de metodologias de ablativo: usar este checkpoint para comprobar si la perdida de entrenamiento es un indicador fiable de la utilidad de las entradas tactiles, tal y como sugiere el caveat del autor.
- Formacion en robotica con LeRobot: el modelo y su configuracion de entrenamiento son un ejemplo practico de como preparar un dataset multimodal y entrenar una politica ACT con la libreria LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que en un barrido relacionado de 180 episodios, la perdida final de entrenamiento fue 0.118 en todas las resoluciones, incluida la configuracion sin GelSight, y advierte que estos datos deben tratarse como una comprobacion de sanidad, no como evidencia de que la resolucion tactil importa. No hay metricas de exito en robot real, tasas de acierto ni comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. El checkpoint ocupa aproximadamente 0.2 GB, lo que sugiere que es ligero, pero no se especifican requisitos de hardware.
- Compatibilidad con GPU de consumo: probablemente viable en hardware modesto por el tamano de los pesos, aunque no hay datos medidos.
- Opciones de despliegue: el modelo esta disenado para usarse con la libreria LeRobot, por lo que la inferencia se realiza tipicamente en el propio robot o en un ordenador conectado a el. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para comparar este modelo con alternativas. Sin embargo, el propio autor publica un barrido de resoluciones de GelSight que constituye la comparativa mas directa, aunque solo se listan los checkpoints, sin resultados:

| Modelo | Resolucion GelSight | Parametros | Notas |
|---|---|---|---|
| act-blue-180ep-gs500-ac60 | 500x375 (nativa) | 51.668.634 | Este checkpoint |
| act-blue-180ep-gs320-ac60 | 320x240 | no disponible | Mismo barrido, resolucion reducida |
| act-blue-180ep-gs160-ac60 | 160x120 | no disponible | Mismo barrido, resolucion reducida |
| act-blue-180ep-gs88-ac60 | 88x66 | no disponible | Mismo barrido, resolucion reducida |
| act-blue-180ep-gs0-ac60 | sin GelSight | no disponible | Mismo barrido, sin tacto |

Tambien existe otro modelo del mismo autor, `Kaz55/act-cable3sizes-180ep-4cam-ac60`, que aborda una tarea relacionada con cables de tres tamanos y cuatro camaras, pero no se ofrecen datos comparativos.

## Limitaciones y advertencias

- El propio autor advierte que la perdida final de entrenamiento fue identica (0.118) en todas las resoluciones del sweep combinado, incluida la configuracion sin GelSight. Esto sugiere que la perdida de entrenamiento no detecta la contribucion de la entrada tactil, por lo que los resultados deben interpretarse con cautela.
- No hay evaluacion en robot real publicada. El rendimiento real del modelo en la tarea de manipulacion es desconocido.
- El modelo esta especializado en una tarea muy concreta (cable azul con UR5e y DG-5F) y no es generalizable a otros robots, objetos o entornos sin reentrenamiento.
- La licencia no esta disponible, lo que genera incertidumbre sobre el uso comercial.
- No se proporcionan instrucciones de inferencia ni scripts de despliegue mas alla de la integracion con LeRobot.
- Los idiomas no aplican al ser un modelo de robotica, pero la ausencia de documentacion en castellano puede dificultar su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaz55/act-blue-180ep-gs500-ac60
- Dataset asociado: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_blue_180ep_gs500
- Modelo relacionado del mismo autor: https://huggingface.co/Kaz55/act-cable3sizes-180ep-4cam-ac60
