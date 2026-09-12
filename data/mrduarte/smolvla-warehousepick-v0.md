# MrDuarte/smolvla-WarehousePick-v0

## Resumen

MrDuarte/smolvla-WarehousePick-v0 es una politica robotica de tipo vision-language-action (VLA) publicada en HuggingFace por el usuario MrDuarte. Se trata de un fine-tuning del modelo base lerobot/smolvla_base, entrenado con LeRobot 0.6.1 sobre el dataset propio MrDuarte/WarehousePick-v0, compuesto por 40 episodios y 29.707 fotogramas grabados a 30 FPS para una unica tarea: recoger todos los paquetes y depositarlos en la caja verde.

El modelo tiene 450.046.176 parametros (aproximadamente 450 M) y un repositorio de 1,2 GB en formato safetensors. Consume como entrada el estado del robot (vector de 6 dimensiones) y tres flujos de imagen procedentes de las camaras `innomaker`, `intel_rgb` y `front`, y produce como salida un vector de accion de 6 dimensiones. Esta disenado para el robot `so101_follower`, un brazo de bajo coste del ecosistema LeRobot.

Su relevancia es doble: por un lado demuestra que es posible entrenar politicas VLA de tamano compacto en hardware de consumo; por otro, sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitacion (grabacion de datos, entrenamiento, publicacion y despliegue) dentro de LeRobot. No se han publicado resultados de evaluacion en robot real para esta politica concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo vision-language-action (VLA) compacto, fine-tuneado desde lerobot/smolvla_base |
| Parametros totales | 450.046.176 (aprox. 450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (la tarea se condiciona mediante la instruccion en ingles "Lift all parcels and put them in the Green Box") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Especificaciones de entrada y salida documentadas por el autor:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.innomaker` | VISUAL | `(3, 720, 1280)` |
| `observation.images.intel_rgb` | VISUAL | `(3, 424, 240)` |
| `observation.images.front` | VISUAL | `(3, 720, 1280)` |
| `action` | ACTION | `(6,)` |

## Arquitectura y entrenamiento

La model card describe SmolVLA como un modelo compacto y eficiente de vision-lenguaje-accion que alcanza rendimiento competitivo con un coste computacional reducido y que puede desplegarse en hardware de consumo. La implementacion concreta de esta ficha es un fine-tuning del checkpoint `lerobot/smolvla_base`, por lo que hereda la arquitectura del modelo base; la informacion proporcionada no detalla la composicion interna (codificador visual, torre de lenguaje, modulo de accion) ni el mecanismo exacto de generacion de acciones.

El entrenamiento se realizo con LeRobot 0.6.1 durante 20.000 pasos, con tamano de lote 28, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El dataset de ajuste contiene 40 episodios y 29.707 fotogramas a 30 FPS, con la unica tarea "Lift all parcels and put them in the Green Box". No se documenta en la informacion disponible si hubo fases de RLHF, DPO u otro ajuste por preferencias, ni el numero de tokens o la composicion del corpus del modelo base.

## Capacidades

- Generacion de acciones motoras de 6 grados de libertad para el robot `so101_follower`, a partir de observaciones multimodales (una senal de estado y tres camaras).
- Percepcion visual simultanea de tres puntos de vista: `innomaker` a 720x1280, `intel_rgb` a 424x240 y `front` a 720x1280.
- Ejecucion de una tarea de manipulation especifica inducida por lenguaje: recoger paquetes y colocarlos en una caja verde.
- Aprendizaje por imitacion: la politica se ha obtenido por fine-tuning supervisado de demostraciones, no por refuerzo.
- Despliegue mediante la CLI `lerobot-rollout`, con la estrategia `base` (sin grabacion de episodios) o con grabacion de los mismos.
- Inferencia en hardware de consumo, segun indica la propia descripcion de SmolVLA.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision general de proposito abierto, audio ni modo de razonamiento explicito ("thinking mode").

## Casos de uso

- Picking y paletizado en almacen: es exactamente la tarea para la que se entreno el modelo; se conecta al `so101_follower` con las tres camaras configuradas y se lanza `lerobot-rollout` con la instruccion "Lift all parcels and put them in the Green Box" para un ciclo de recogida y deposito de 60 segundos o indefinido.
- Automatizacion de estaciones de clasificacion en logistica de e-commerce: el modelo puede ejecutar el traslado repetitivo de bultos ligeros a un contenedor designado, liberando al operario de la tarea mas monotonay reduciendo el riesgo de lesion por movimientos repetidos.
- Banco de pruebas para investigacion en aprendizaje por imitacion: al ser un checkpoint publico con dataset asociado, permite reproducir el pipeline completo (grabacion, entrenamiento, evaluacion) y comparar variantes de hiperparametros con coste bajo.
- Fine-tuning sobre nuevos dominios: el modelo sirve como punto de partida para reentrenar con `lerobot-train` sobre otros datasets de la misma morfologia de robot y ampliar el repertorio de tareas sin partir de cero.
- Validacion de robustez frente a cambios de entorno: con 40 episodios de entrenamiento es util para medir la degradacion de la politica ante nuevas posiciones de objeto, cambios de iluminacion o distractores, un experimento habitual en publicaciones de VLA.
- Docencia y formacion en robotica: su tamano (450 M de parametros) y su licencia permisiva lo hacen adecuado para practicas universitarias o cursos donde se ensene a calibrar camaras, grabar episodios y desplegar una politica entrenada.
- Prototipado rapido de celdas robotizadas: permite evaluar la viabilidad de un brazo de bajo coste en una tarea de pick-and-place antes de invertir en integraciones industriales mas costosas.
- Recoleccion de datos asistida: ejecutando la politica con la estrategia de grabacion activada se pueden generar episodios adicionales que alimenten iteraciones posteriores del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la nota explicita de que no se han proporcionado resultados para esta politica, y no se ofrecen tasas de exito, tiempos de ciclo ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 450.046.176 parametros, no facilitada por el autor): aproximadamente 1,8 GB en fp32, 0,9 GB en fp16/bf16 y 0,45 GB en int8, sin contar las activaciones ni el preprocesado de las tres camaras.
- Cabe en practicamente cualquier GPU de consumo con 4 GB o mas de VRAM; una RTX 3060, RTX 4060, RTX 3090 o RTX 4090 es mas que suficiente en terminos de memoria de pesos.
- El cuello de botella realista no es la memoria sino la latencia de preprocesado y de bucle de control: se procesan simultaneamente imagenes de 720x1280, 424x240 y 720x1280 a 30 FPS.
- GPU de centro de datos (A100, H100) no son necesarias para la inferencia, aunque pueden emplearse para entrenamiento o fine-tuning a mayor velocidad.
- Opciones de despliegue documentadas: la CLI de LeRobot (`lerobot-rollout` para ejecucion y `lerobot-train` para reentrenamiento). No se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que no se trata de un modelo de lenguaje sino de una politica robotica acoplada a un hardware concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MrDuarte/smolvla-WarehousePick-v0 | 450.046.176 | no disponible | apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace (`lerobot/smolvla_base`), citado como modelo base |
| Otras politicas VLA comparables (por ejemplo ACT, pi0 o OpenVLA) | no disponible | no disponible | no disponible | no disponible: no se ha encontrado informacion sobre ellos en los datos proporcionados |

La busqueda web realizada no devolvio resultados relacionados con el modelo ni con politicas roboticas comparables, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 40 episodios y 29.707 fotogramas para una unica tarea, lo que limita la generalizacion y favorece el sobreajuste a las condiciones exactas de grabacion.
- Sin resultados de evaluacion publicados: la propia model card indica que no se han proporcionado resultados, de modo que se desconoce la tasa de exito real de la politica.
- Acoplamiento al hardware: entrenada para el robot `so101_follower` con las camaras `innomaker`, `intel_rgb` y `front`. Los nombres de las camaras deben coincidir exactamente con las claves de observacion del entrenamiento para que la politica funcione.
- Tarea unica y condicionada por una instruccion fija en ingles; no hay evidencia de comportamiento multilingue ni de generalizacion a otras ordenes.
- Sesgos probables derivados del operador, la iluminacion, la disposicion del almacen y la posicion de los objetos en el dataset original; no se documentan analisis de sesgo.
- Riesgo de alucinacion en el sentido de acciones erráticas o inconsistentes ante escenas fuera de distribucion; al tratarse de un sistema fisico, estas acciones pueden causar danos materiales o personales.
- Ausencia de mecanismos de seguridad documentados (parada de emergencia, limites de par, validacion de trayectorias): cualquier despliegue real debe anadir barreras de seguridad externas.
- Licencia apache-2.0, permisiva y compatible con uso comercial, pero se recomienda verificar la licencia del modelo base `lerobot/smolvla_base` y de las dependencias antes de un producto.
- Repositorio sin traccion comunitaria (0 descargas, 0 likes) y publicado el 12 de septiembre de 2026, por lo que no existe validacion independiente de su comportamiento.
- No se documentan tipos de cuantizacion ni presupuesto de contexto, lo que dificulta planificar despliegues con restricciones estrictas de latencia o memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrDuarte/smolvla-WarehousePick-v0
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/MrDuarte/WarehousePick-v0
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrDuarte/WarehousePick-v0
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv 2506.01844)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Busqueda web: no se encontraron enlaces relevantes sobre el modelo; los resultados devueltos correspondian al videojuego Titan Quest II y no guardan relacion con esta ficha.
