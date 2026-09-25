# fecasado/gfm-kitchen-lettuce-27bN

## Resumen

`gfm-kitchen-lettuce-27bN` es una política robótica (policy) entrenada y publicada por el usuario fecasado mediante el framework LeRobot de Hugging Face. El modelo implementa una arquitectura denominada `gaze_flow_matching` y está asociado a la tarea de manipulación "lettuce-to-plate" (trasladar lechuga a un plato), tal como indica el dataset de entrenamiento `fecasado/lettuce-to-plate-320x240`, con observaciones de imagen de 320x240 píxeles.

El modelo cuenta con 75.228.826 parámetros reales en formato safetensors, lo que lo sitúa en la categoría de políticas ligeras de imitación para robótica, muy por debajo de los grandes modelos visión-lenguaje-acción. Se distribuye bajo licencia Apache 2.0 y con la librería LeRobot, lo que facilita su carga, evaluación y despliegue en robots compatibles (por ejemplo, brazos SO-100/SO-101 usados habitualmente con LeRobot).

La relevancia de esta ficha es limitada en terminos de documentacion: la model card publicada es practicamente la plantilla por defecto de LeRobot y no incluye detalles de arquitectura, datos de entrenamiento, hiperparametros ni resultados de evaluacion. Por tanto, gran parte de los apartados tecnicos deben marcarse como "no disponible", y cualquier uso en produccion requiere validacion empirica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gaze_flow_matching (policy de robótica basada en flow matching); detalles internos no disponibles |
| Parametros totales | 75.228.826 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (política de robótica; no expone ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (repo en safetensors, 0,3 GB) |
| Idiomas soportados | no disponibles (modelo de robótica, sin interfaz de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tamano del repositorio | 0,3 GB |
| Dataset de entrenamiento | fecasado/lettuce-to-plate-320x240 (resolucion 320x240) |

## Arquitectura y entrenamiento

La unica informacion fiable sobre la arquitectura es el identificador `gaze_flow_matching` y la etiqueta `gaze_flow_matching` en los tags del repositorio. Esto sugiere una política de imitacion basada en flow matching (una familia de modelos generativos que aprenden un campo de velocidad para transformar ruido en acciones) combinada con algun componente de atencion o guiado por mirada ("gaze"). No obstante, la model card no describe la topologia de red, el numero de capas, la dimensionalidad de las observaciones ni el mecanismo exacto de condicionamiento, por lo que no es posible detallar la arquitectura.

Respecto al entrenamiento, la model card indica que la politica fue entrenada y subida al Hub con LeRobot, e incluye los comandos genericos `lerobot-train` y `lerobot-record` de la documentacion oficial, pero no aporta el numero de tokens, el numero de episodios, la composicion del dataset, ni si se aplicaron tecnicas de RLHF/DPO (poco habituales en politicas de imitacion). El dataset asociado (`lettuce-to-plate-320x240`) sugiere demostraciones teleoperadas de una tarea de coger y colocar lechuga, con imagenes de 320x240. No se documenta ninguna innovacion tecnica adicional mas alla del propio esquema de flow matching.

## Capacidades

- Generacion de acciones motoras para control de robot: la politica produce comandos de accion a partir de observaciones visuales y de estado del robot, orientados a la tarea de manipulacion "lettuce-to-plate".
- Imitacion de demostraciones: entrenada a partir de un dataset de demostraciones, aprende a reproducir la politica de control asociada a la tarea.
- Percepcion visual: consume observaciones de imagen de 320x240 píxeles.
- Inferencia en robot real o en simulacion mediante `lerobot-record` con `--policy.path`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues (el modelo no expone interfaz de lenguaje natural).
- Cualquier capacidad especial adicional (modo "thinking", vision avanzada, audio) no esta disponible en la informacion proporcionada.

## Casos de uso

- Manipulacion robotica de pick-and-place en cocina: la politica puede controlar un brazo robotico para coger una pieza de lechuga y depositarla en un plato, replicando la tarea del dataset de entrenamiento.
- Prototipado rapido en laboratorio: un equipo de investigacion puede cargar el checkpoint con LeRobot y ejecutar `lerobot-record` para evaluar la politica en su propio hardware SO-100/SO-101 en pocos minutos, dado el reducido tamano del modelo (0,3 GB).
- Linea base para comparacion de politicas: sirve como referencia para contrastar variantes de flow matching frente a otras politicas de la misma tarea dentro del ecosistema LeRobot.
- Fine-tuning sobre tareas cercanas: al tener 75 M de parametros y licencia Apache 2.0, es viable reentrenarlo con un dataset propio de manipulacion similar sin requerir hardware de gran escala.
- Investigacion en condicionamiento por mirada: si el componente "gaze" efectivamente incorpora senales de atencion visual, puede usarse para estudiar como el foco de atencion mejora el aprendizaje de politicas de imitacion.
- Evaluacion de robustez visual: al operar sobre imagenes de 320x240, permite analizar la sensibilidad de la politica a cambios de iluminacion, fondo o posicion de camara en entornos de cocina.
- Despliegue en robot de bajo coste: su tamano permite ejecutar inferencia en GPUs de gama media o incluso en CPU, adecuado para plataformas educativas o de bajo presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de error de accion, ni comparaciones cuantitativas frente a otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en precision de 32 bits, dado que el repositorio completo ocupa 0,3 GB y el modelo tiene 75 M de parametros. La VRAM real dependera del tamano del lote y de las imagenes de entrada (320x240), pero es previsible que se mantenga por debajo de 1-2 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente. Se puede usar desde una GTX 1650 o RTX 3050 hasta una RTX 4090, A100 o H100; las GPU de gama alta no aportan ventaja sustancial por el reducido tamano del modelo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo actual e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`) es el metodo documentado. Otros runtimes como vLLM, llama.cpp, Ollama o TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No hay datos publicados en la informacion disponible para comparar cuantitativamente con alternativas. Como referencia cualitativa, dentro del ecosistema LeRobot existen otras familias de politicas de imitacion (por ejemplo ACT, Diffusion Policy o SmolVLA), pero no se dispone de sus especificaciones ni resultados en esta busqueda, por lo que no se puede establecer una comparacion rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gfm-kitchen-lettuce-27bN | 75.228.826 | no disponible | no disponible | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Otras politicas LeRobot (ACT, Diffusion Policy, SmolVLA) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al entrenarse con un dataset concreto de una sola tarea, es probable que la politica este fuertemente especializada y generalice mal a otras tareas, objetos o entornos.
- Riesgo de alucinacion: en el sentido de acciones incorrectas o no seguras, no cuantificado. Al ser una politica de imitacion, puede producir acciones fuera de distribucion ante observaciones no vistas.
- Limitaciones de contexto o idioma: el modelo no maneja lenguaje natural; las observaciones son imagenes de 320x240 y estado del robot. La resolucion fija y el encuadre de camara condicionan el rendimiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se atribuya correctamente. No se identifican restricciones adicionales.
- Caveat importante para produccion: la model card es practicamente la plantilla por defecto y declara explicitamente "Model type not recognized — please update this template", lo que indica documentacion incompleta. El modelo no tiene descargas ni likes y no se han publicado evaluaciones, por lo que no deberia desplegarse en entornos criticos sin una validacion exhaustiva propia.
- La nomenclatura "27bN" en el identificador no se corresponde con 27.000 millones de parametros (el modelo tiene 75 M); su significado exacto (posible etiqueta de checkpoint, semilla o variante) no esta documentado.
- No se dispone de informacion sobre seguridad fisica, limites de fuerza, ni protocolos de parada de emergencia asociados a la politica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-kitchen-lettuce-27bN
- Dataset de entrenamiento (referenciado): https://huggingface.co/datasets/fecasado/lettuce-to-plate-320x240
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Modelo relacionado del mismo autor: https://huggingface.co/fecasado/gfm-kitchen-lettuce-22dN
- Modelo relacionado del mismo autor: https://huggingface.co/fecasado/gfm-cubes-27bN
