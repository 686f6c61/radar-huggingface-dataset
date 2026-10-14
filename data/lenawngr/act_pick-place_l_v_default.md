# lenawngr/ACT_pick-place_L_v_default

## Resumen

ACT_pick-place_L_v_default es una politica de robotica entrenada con Action Chunking with Transformers (ACT), un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario lenawngr y publicado en HuggingFace Hub mediante LeRobot, la libreria de HuggingFace para aprendizaje por imitacion en robotica. El identificador del repositorio indica que se ha entrenado sobre el dataset lenawngr/pick-place, con la variante "L" y configuracion "default".

El modelo resuelve una tarea concreta de manipulacion tipo pick-and-place: dado el estado del robot y las observaciones de camara, genera una secuencia de acciones de control de bajo nivel para completar la tarea. Con 51.668.614 parametros (aproximadamente 51,7 millones) y un repositorio de 0,2 GB en formato safetensors, es un modelo ligero orientado a inferencia en tiempo real sobre hardware de robot de bajo coste, no a generacion de texto ni a tareas de lenguaje.

Su relevancia actual es doble: por un lado, sirve como ejemplo reproducible de entrenamiento de una politica ACT con LeRobot; por otro, es un punto de partida para fine-tuning con datos propios de teleoperacion. La model card no incluye informacion sobre tasas de exito, datos de entrenamiento detallados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), segun el paper arXiv:2304.13705; arquitectura exacta de esta instancia no detallada en la model card |
| Parametros totales | 51.668.614 (datos reales del archivo safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es una ventana de contexto de lenguaje. El metodo ACT predice chunks de acciones, cuyo tamano no se especifica en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; no se publican variantes cuantizadas de esta politica |
| Idiomas soportados | no aplica / no disponible: es una politica robotica que consume observaciones visuales y de estado, no texto |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion presentado en el paper arXiv:2304.13705 que, en lugar de predecir una unica accion por paso de tiempo, predice un chunk de acciones futuras. Esta formulacion reduce el error de compounding y mejora la consistencia temporal en tareas de manipulacion. La model card unicamente confirma que el entrenamiento se ha realizado con LeRobot y que el metodo aprende de datos teleoperados, alcanzando "a menudo" tasas de exito altas, sin aportar cifras.

No se dispone de informacion sobre el numero de tokens o episodios de entrenamiento, la composicion del dataset lenawngr/pick-place, el uso de RLHF/DPO (fuera de alcance en este tipo de politica) ni innovaciones adicionales como decodificacion especulativa. Tampoco se detalla la configuracion concreta de la variante "L" ni que diferencia la etiqueta "default" de otras variantes del mismo autor. El flujo de entrenamiento documentado es el comando `lerobot-train` con `--policy.type=act`, y la evaluacion se realiza con `lerobot-record` sobre un robot `so100_follower`.

## Capacidades

- Generacion de trayectorias de accion para manipulacion robotica: produce chunks de acciones de control a partir de observaciones, en lugar de un unico paso.
- Tarea especifica pick-and-place: el modelo esta entrenado para recoger y colocar objetos segun la distribucion del dataset lenawngr/pick-place.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas.
- Ejecucion de inferencia sobre un robot real mediante `lerobot-record` y `--policy.path`.
- Compatibilidad con el ecosistema LeRobot para entrenamiento, evaluacion y publicacion en el Hub.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje natural.
- No dispone de vision generativa ni de razonamiento simbolico: la vision se usa como entrada de observacion para la politica.

## Casos de uso

- Automatizacion de pick-and-place en linea de montaje: el modelo recibe las imagenes de las camaras y el estado de las articulaciones y emite chunks de acciones para coger una pieza y depositarla en una ubicacion objetivo, lo que encaja con la tarea del dataset de entrenamiento.
- Clasificacion y separacion de piezas por posicion: reutilizando la politica para mover objetos desde una bandeja de entrada a distintas salidas segun la posicion de recogida aprendida.
- Recogida y colocacion en almacen de bajo coste: la ligereza del modelo (51,7 millones de parametros) permite ejecutarlo junto al bucle de control en equipos con GPU modesta o incluso en CPU, algo relevante en robots tipo SO-100.
- Baseline para investigacion en aprendizaje por imitacion: servir como referencia reproducible para comparar con otras politicas de LeRobot (por ejemplo, Diffusion Policy) en el mismo dataset.
- Fine-tuning con datos propios: partir de estos pesos y reentrenar con `lerobot-train` sobre un dataset nuevo de teleoperacion para adaptar la politica a otra tarea de manipulacion.
- Evaluacion comparativa de politicas: usar `lerobot-record` con `--episodes=10` para medir tasas de exito de esta politica frente a otras variantes ACT del mismo autor o de la comunidad.
- Demostraciones educativas de robotica: por su tamano reducido y licencia permisiva, es adecuado para talleres y cursos donde se ensena a entrenar y desplegar politicas ACT.
- Prototipado rapido de tareas de agarre: validar la viabilidad de una celda robotica antes de invertir en entrenamientos a mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, numero de episodios de evaluacion ni comparaciones cuantitativas con otras politicas. El paper de referencia (arXiv:2304.13705) reporta resultados para las tareas que describe, pero no se dispone de ellos en la informacion proporcionada y no deben atribuirse a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los pesos ocupan aproximadamente 207 MB (51.668.614 parametros x 4 bytes). Con activaciones, buffers de imagen y overhead de PyTorch, es razonable reservar entre 1 y 2 GB de VRAM, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: practicamente cualquier GPU con al menos 4 GB de VRAM es suficiente. Tarjetas como RTX 3060, RTX 4060, RTX 3090 o RTX 4090 permiten inferencia con margen amplio. GPU de datacenter (A100, H100) no son necesarias.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida, a costa de mayor latencia.
- Despliegue: el flujo oficial es LeRobot (`lerobot-record` con `--policy.path`). No se documentan integraciones especificas con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a politicas roboticas. El checkpoint esta en safetensors y se carga con PyTorch.
- Latencia y throughput: no disponibles. Dependen del hardware, del numero de camaras, de la frecuencia de control del robot y del tamano de chunk configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_pick-place_L_v_default (este modelo) | 51.668.614 | no disponible | no disponible | apache-2.0 | HuggingFace Hub, 0 descargas, 0 likes |
| Otras variantes ACT de lenawngr | no disponible | no disponible | no disponible | no disponible | mismo autor en HuggingFace |
| Diffusion Policy (LeRobot) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | implementada en LeRobot |
| SmolVLA (LeRobot) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | implementada en LeRobot |

No se dispone de datos cuantitativos para establecer una comparacion rigurosa con alternativas de la misma categoria. Las politicas mencionadas (Diffusion Policy, SmolVLA) forman parte del ecosistema LeRobot y son las alternativas naturales, pero sus especificaciones no aparecen en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser una politica entrenada por imitacion, heredara los sesgos de las demostraciones teleoperadas del dataset lenawngr/pick-place: posiciones, iluminacion, objetos y configuracion de camara presentes en la teleoperacion.
- Riesgo de fallo fuera de distribucion: cualquier cambio en la posicion de la camara, el fondo, la iluminacion o los objetos puede degradar el comportamiento, ya que el modelo no ha visto esas condiciones.
- Sobreajuste a la tarea: el nombre del repositorio indica una tarea concreta de pick-and-place. No debe esperarse generalizacion a otras tareas sin reentrenamiento o fine-tuning.
- Idiomas: no aplica. El modelo no procesa lenguaje; no puede recibir instrucciones en lenguaje natural.
- Contexto: no aplica una ventana de contexto de lenguaje. El horizonte efectivo esta limitado por el tamano del chunk de acciones y por el estado observable en cada inferencia.
- Licencia: apache-2.0, permisiva y compatible con uso comercial. Conviene revisar igualmente la licencia del dataset lenawngr/pick-place si se va a redistribuir o usar comercialmente.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, y la model card no documenta hiperparametros, numero de episodios, ni resultados de evaluacion. No hay evidencia publica de su tasa de exito.
- Fecha de publicacion: el repositorio figura como creado y actualizado en octubre de 2026, lo que puede indicar una fecha no fiable o un artefacto del sistema de metadatos.
- Produccion: antes de desplegarlo en un entorno real, es imprescindible validar con `lerobot-record` sobre el robot objetivo y establecer limites de seguridad fisicos (paradas de emergencia, limites de par, espacios de trabajo acotados).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lenawngr/ACT_pick-place_L_v_default
- Dataset de entrenamiento: https://huggingface.co/datasets/lenawngr/pick-place
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
