# felsager/pi05_cube2cross_dr_og

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en mundo abierto en tareas roboticas. Este repositorio concreto, `felsager/pi05_cube2cross_dr_og`, es un fine-tuning del modelo base `lerobot/pi05_base` realizado por el usuario felsager mediante la libreria LeRobot. El modelo resuelve una tarea especifica de manipulacion robotica: recoger un cubo de color (verde, azul, amarillo o rojo) y colocarlo sobre una cruz roja.

El modelo tiene 4.143.404.816 parametros (aproximadamente 4,1 mil millones) y se distribuye en formato safetensors con un tamano de repositorio de 24,9 GB. Esta entrenado para el robot `ur5e_hand_e` con dos camaras de observacion (`top` y `wrist`) a resolucion 640x480, mas una tercera camara auxiliar de 224x224. La salida es un vector de accion de 10 dimensiones.

Su relevancia radica en que ejemplifica el flujo de trabajo de fine-tuning de modelos VLA de gran escala sobre hardware robotico concreto usando LeRobot, la pila open source de Hugging Face para robotica. No obstante, se trata de un modelo de investigacion con licencia Gemma, sin resultados de evaluacion publicados y sin descargas registradas, por lo que su uso en produccion requiere validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en π₀.₅ de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de texto general) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Libreria | lerobot |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist, empty_camera_0 |
| Entrada observation.state | (10,) |
| Entrada observation.images.top | (3, 480, 640) |
| Entrada observation.images.wrist | (3, 480, 640) |
| Entrada observation.images.empty_camera_0 | (3, 224, 224) |
| Salida action | (10,) |
| Tamano del repositorio | 24,9 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, la implementacion en LeRobot del modelo π₀.₅ de Physical Intelligence. π₀.₅ es un modelo Vision-Language-Action que evoluciona π₀ para generalizar a entornos y situaciones completamente nuevos no vistos durante el entrenamiento. La implementacion de LeRobot esta adaptada del repositorio open source OpenPI de Physical Intelligence. No se dispone de detalles adicionales sobre la arquitectura interna (tipo de transformer, mecanismos de atencion, etc.) en la informacion proporcionada.

El fine-tuning se realizo sobre el dataset `felsager/vla_cubes_cross_dr`, compuesto por 999 episodios y 510.363 frames a 30 FPS. Las tareas de entrenamiento son cuatro variantes de la misma habilidad: recoger un cubo verde, azul, amarillo o rojo y colocarlo sobre una cruz roja. La configuracion de entrenamiento incluye 30.000 pasos, batch size de 8, optimizador AdamW, learning rate de 5e-05 y semilla 0, usando LeRobot version 0.6.2. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Control robotico de manipulacion: genera vectores de accion de 10 dimensiones para el robot `ur5e_hand_e` a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara: procesa simultaneamente imagenes de una camara superior (`top`), una camara en la muneca (`wrist`) y una camara auxiliar (`empty_camera_0`).
- Ejecucion de tareas de pick-and-place: entrenado especificamente para recoger cubos de cuatro colores y colocarlos sobre una cruz roja.
- Generalizacion a variaciones de color del objeto: el dataset cubre cuatro colores de cubo distintos.
- Integracion con LeRobot: compatible con el CLI `lerobot-rollout` para despliegue en robot real y `lerobot-train` para reentrenamiento.
- No se dispone de informacion sobre tool calling, capacidades de agente multi-paso, capacidades multilingues ni modos especiales como thinking o vision general.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger un cubo de color y colocarlo sobre una cruz roja, adecuado para experimentos de imitacion robotica y validacion de pipelines VLA en robot UR5e con mano.
- Base para fine-tuning en nuevas tareas de clasificacion por color: al estar entrenado con cuatro colores de cubo, sirve como punto de partida para tareas que requieran discriminacion cromatica de objetos.
- Investigacion en generalizacion de VLA: permite estudiar como un modelo base de Physical Intelligence se adapta a un entorno concreto con 999 episodios y 510.363 frames, evaluando la transferencia desde `pi05_base`.
- Prototipado de pipelines de imitacion con LeRobot: util para desarrolladores que quieran replicar el flujo completo de grabacion de datos, entrenamiento y despliegue con `lerobot-train` y `lerobot-rollout`.
- Benchmark interno de robustez ante variaciones de iluminacion y posicion: el modelo puede emplearse para medir la tasa de exito en condiciones controladas, aunque no se hayan publicado resultados oficiales.
- Docencia y demostraciones de robotica con vision-lenguaje-accion: sirve como ejemplo funcional de un modelo VLA de 4,1 mil millones de parametros desplegado sobre hardware UR5e.
- Reentrenamiento con datos propios: al estar disponible el modelo base y la configuracion de entrenamiento, se puede fine-tunear para tareas adicionales con el mismo robot y conjunto de camaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.143.404.816 parametros, en precision completa (fp32) se requeririan aproximadamente 16,6 GB solo para pesos; en fp16/bf16, unos 8,3 GB; en int8, unos 4,1 GB. Estas cifras son estimaciones teoricas a partir del numero de parametros y no estan confirmadas por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU con al menos 16-24 GB de VRAM (RTX 4090, A100, H100) seria razonable para inferencia en fp16, pero no hay confirmacion oficial.
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB) en fp16 segun la estimacion teorica, pero no confirmado.
- Opciones de despliegue: LeRobot CLI (`lerobot-rollout` para ejecucion en robot, `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_dr_og | 4.143.404.816 | no disponible | VLA (fine-tuning) | gemma | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA (base) | no disponible en la informacion | Hugging Face (modelo base) |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA | no disponible en la informacion | Referenciado por el autor como predecesor |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- Sin resultados de evaluacion publicados: la model card indica explicitamente que no se han proporcionado resultados de evaluacion, por lo que se desconoce la tasa de exito real.
- Tarea muy restringida: el modelo solo esta entrenado para recoger cubos de cuatro colores y colocarlos sobre una cruz roja; no generaliza a otras tareas fuera de ese dominio.
- Hardware especifico: disenado para el robot `ur5e_hand_e` con una configuracion concreta de camaras (`top`, `wrist`, `empty_camera_0`); no es portable directamente a otro hardware sin reentrenamiento.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma, que impone restricciones y obligaciones especificas; debe revisarse antes de cualquier despliegue productivo.
- Riesgo de alucinacion y fallos de percepcion: como todo modelo VLA, puede generar acciones incorrectas ante objetos no vistos, cambios de iluminacion, oclusiones o posiciones fuera de distribucion.
- Sin datos sobre sesgos: no se dispone de informacion sobre sesgos del modelo ni sobre su comportamiento en entornos diversos.
- Cero descargas y cero likes: el repositorio no tiene validacion de la comunidad, lo que reduce la confianza en su robustez.
- Idiomas no disponibles: al ser un modelo de robotica, no aplica soporte linguistico general; las instrucciones de tarea son frases fijas en ingles.
- Sin informacion sobre cuantizacion: no se documentan formatos cuantizados ni su impacto en el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_dr_og
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
