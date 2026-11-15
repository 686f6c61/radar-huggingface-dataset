# felsager/pi05_cube2cross_v2_all_wd03_s2

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos: evoluciona π₀ para operar en situaciones y entornos nunca vistos durante el entrenamiento. La implementacion disponible en este repositorio es la adaptacion de LeRobot (Hugging Face) del repositorio OpenPI de Physical Intelligence.

Este repositorio concreto, `felsager/pi05_cube2cross_v2_all_wd03_s2`, es un fine-tuning del modelo base `lerobot/pi05_base` sobre el dataset `felsager/vla_cubes_cross_v2`. Esta especializado en una tarea de manipulacion robotica muy concreta: recoger un cubo de un color determinado (azul, verde, amarillo o rojo) y colocarlo sobre una cruz roja. El modelo opera con un robot `ur5e_hand_e` y dos camaras (`top` y `wrist`).

El modelo tiene 4.143.404.816 parametros y se distribuye en formato safetensors con un tamano de repositorio de 42,6 GB. Es relevante como ejemplo de pipeline completo de imitation learning con LeRobot: desde la grabacion del dataset hasta el despliegue de una politica VLA sobre hardware real, con licencia gemma heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), derivada de π₀.₅ (Pi05) de Physical Intelligence; implementacion LeRobot/OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de accion robotica; las instrucciones de tarea estan en ingles) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist |
| Entrada (estado) | observation.state, shape (10,) |
| Entrada (vision) | observation.images.top, (3, 480, 640); observation.images.wrist, (3, 480, 640) |
| Salida (accion) | action, shape (10,) |
| Libreria | lerobot |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 42,6 GB |

## Arquitectura y entrenamiento

El modelo es un VLA basado en π₀.₅, la evolucion de π₀ de Physical Intelligence orientada a la generalizacion en entornos abiertos. La implementacion concreta es la de LeRobot, adaptada del repositorio OpenPI. El modelo consume observaciones multimodales (estado del robot de dimension 10 y dos flujos de imagen RGB de 480x640) y produce un vector de accion de dimension 10. No se dispone en la informacion proporcionada de detalles adicionales sobre el backbone, el mecanismo de atencion ni la composicion exacta del corpus de preentrenamiento.

El fine-tuning se realizo sobre el dataset `felsager/vla_cubes_cross_v2`, compuesto por 1000 episodios y 493.474 frames a 30 FPS. Las tareas cubiertas son cuatro variantes de "pick up the [color] cube and place it on the red cross" (azul, verde, amarillo y rojo). La configuracion de entrenamiento fue: 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05 y semilla 2. No se especifica en la informacion disponible si hubo RLHF, DPO ni otras fases de alineamiento.

## Capacidades

- Control robotico de manipulacion: genera acciones de 10 dimensiones para un robot UR5e con mano, a partir de estado y vision.
- Percepcion visual multimodal: procesa simultaneamente una vista cenital (`top`) y una vista de muneca (`wrist`) a 480x640.
- Seguimiento de instrucciones en lenguaje natural: acepta tareas como "pick up the blue cube and place it on the red cross.".
- Discriminacion de color de objetos: entrenado para distinguir cubos azules, verdes, amarillos y rojos.
- Generalizacion a entornos abiertos: heredada del diseno de π₀.₅, orientada a situaciones no vistas en entrenamiento (no verificada en este fine-tuning concreto).
- Ejecucion de politicas en bucle cerrado mediante `lerobot-rollout` con `--strategy.type=base`.
- No se dispone de informacion sobre soporte de tool calling, agentes multi-paso, audio ni otras capacidades genericas de texto.

## Casos de uso

- Pick-and-place industrial de objetos codificados por color: el modelo recoge un cubo de un color especifico y lo deposita en una zona marcada (cruz roja). Adecuado por su entrenamiento especifico sobre 1000 episodios de esta tarea con un UR5e.
- Prototipado rapido de politicas de imitacion: sirve como referencia para validar el pipeline completo de LeRobot (grabacion de dataset, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) antes de escalar a tareas propias.
- Base para fine-tuning en tareas de clasificacion y deposito: al partir de `lerobot/pi05_base`, puede reentrenarse con nuevos datasets de cubos, contenedores o zonas objetivo manteniendo el mismo esquema de observaciones.
- Automatizacion de tareas de pick-and-place en laboratorio: con dos camaras (cenital y de muneca) y un UR5e, el modelo cubre la percepcion y la generacion de acciones sin necesidad de programacion cinematica explicita.
- Evaluacion de robustez de politicas VLA: util para medir como afectan cambios de iluminacion, posiciones de objetos o distracciones al exito de la tarea, dado que el autor no ha publicado aun resultados de evaluacion.
- Docencia y demostraciones de robotica con aprendizaje por imitacion: el repositorio incluye comandos listos para ejecutar el modelo en un robot real, lo que facilita demostraciones reproducibles en cursos y talleres.
- Investigacion en generalizacion de π₀.₅: permite comparar el comportamiento del modelo base frente a un fine-tuning especializado en una tarea acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real, latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio pesa 42,6 GB en safetensors, lo que orienta sobre el orden de magnitud, pero no se especifica la precision de los pesos ni el consumo en inferencia.
- GPU recomendadas: no disponible. Para un modelo de ~4,1 mil millones de parametros en precision completa se requiere una GPU con memoria suficiente para los pesos y las activaciones de los dos flujos de imagen; no se detalla en la informacion.
- Compatibilidad con GPU de consumo: no confirmada. No se indica si cabe en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion y `lerobot-train` para entrenamiento), con `--policy.device=cuda`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica robotica.
- Latencia y throughput: no disponibles. La captura de camaras se realiza a 30 FPS y el dataset se grabo a 30 FPS, pero no se publica la frecuencia de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_all_wd03_s2 | 4.143.404.816 | VLA fine-tuned (π₀.₅) | no disponible | gemma | Hugging Face (LeRobot) |
| lerobot/pi05_base | no disponible | VLA base (π₀.₅) | no disponible | no disponible en la informacion | Hugging Face (LeRobot) |
| π₀ (Pi0) de Physical Intelligence | no disponible | VLA predecesor | no disponible | no disponible en la informacion | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a la relacion de linaje (fine-tuning de `lerobot/pi05_base`, que a su vez deriva de π₀.₅, evolucion de π₀).

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo ha sido entrenado para cuatro tareas de recogida y deposito de cubos sobre una cruz roja; no se espera que generalice a otras tareas sin reentrenamiento.
- Sin evaluacion publicada: no hay tasas de exito en robot real, por lo que no se puede afirmar su fiabilidad en produccion.
- Dependencia de hardware concreto: asume un robot `ur5e_hand_e` y dos camaras con nombres `top` y `wrist`; cualquier cambio de configuracion requiere adaptar las claves de observacion.
- Riesgo de sobreajuste al entorno de grabacion: al provenir de un unico dataset de 1000 episodios, puede degradarse ante cambios de iluminacion, fondo, posiciones de objetos o distracciones.
- Licencia gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma, que impone restricciones y obligaciones especificas; conviene revisarla antes de un despliegue comercial.
- Idiomas: las instrucciones de tarea estan en ingles; no se documenta soporte multilingue.
- Sin datos de cuantizacion ni de contexto: no se puede planificar el despliegue en hardware limitado con la informacion disponible.
- Riesgo de alucinacion en el sentido de acciones incorrectas: como toda politica de imitacion, puede producir trayectorias plausibles pero fallidas ante estados fuera de distribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_all_wd03_s2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
