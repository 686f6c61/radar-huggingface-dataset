# nrburns/pi05_Pot_1_and_2_Red_3_full_side_short_good24_9-16

## Resumen

Este modelo es un ajuste fino del modelo vision-lenguaje-accion (VLA) π₀.₅ (Pi05) de Physical Intelligence, publicado por el usuario nrburns bajo licencia Apache 2.0. Se trata de una politica robotica de imitacion entrenada con la libreria LeRobot sobre el checkpoint base lerobot/pi05_base, especializada en una unica tarea de manipulacion: "pick each highlighted strawberry, place it into the green bin, and return home" (recoger cada fresa resaltada, depositarla en el contenedor verde y volver a la posicion de reposo). El modelo consume senales de estado del robot y tres flujos de imagen a 480x640 (camaras scene, wrist y side) y produce un vector de accion de 8 dimensiones.

El interes de esta ficha es doble. Por un lado, ilustra el flujo de trabajo estandar de fine-tuning de politicas VLA en LeRobot sobre el modelo base π₀.₅, que la model card describe como disenado para generalizacion en entornos abiertos. Por otro, es un ejemplo de artefacto muy especializado: 120 episodios, 76.615 fotogramas a 20 FPS y 16.000 pasos de entrenamiento sobre un robot concreto (tipo `rizon4`) y una configuracion de camaras fija, lo que acota drasticamente su ambito de aplicacion.

El modelo tiene 4.143.404.816 parametros (aproximadamente 4,14 mil millones) y el repositorio ocupa 9,4 GB en formato safetensors. En el momento de redactar esta ficha no registra descargas ni "likes", y no se han publicado resultados de evaluacion. La busqueda web realizada no devolvio ninguna fuente tecnica relevante sobre este modelo o su modelo base: todos los resultados obtenidos correspondian a recursos no relacionados (Scratch), por lo que la informacion se limita a los metadatos y la model card proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); la model card la describe como evolucion de π₀ orientada a generalizacion en entornos abiertos. Composicion interna del backbone: no disponible |
| Parametros totales | 4.143.404.816 (≈4,14 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (politica de accion, no modelo de lenguaje conversacional; no se publica ventana de contexto ni horizonte de action chunk) |
| Tipos de cuantizacion | No disponible. Unico formato publicado: safetensors; el tamano del repo (9,4 GB para 4,14 B de parametros) es compatible con pesos en precision de 16 bits |
| Idiomas soportados | No disponible en los metadatos. La unica instruccion documentada esta en ingles y es la cadena de tarea fija del dataset |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Libreria / ecosistema | LeRobot 0.6.2 |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | `rizon4` |
| Camaras | `scene`, `wrist`, `side` (3 x 480 x 640) |
| Entradas | `observation.state` (8,), `observation.dq` (7,), `observation.tcp_pose` (7,), `observation.tcp_wrench` (6,), `observation.gripper.current_mA` (1,), `observation.gripper.object_detected` (1,), `observation.gripper.valid` (1,), `observation.images.scene` / `wrist` / `side` (3, 480, 640) y marcas de tiempo por camara (1,) |
| Salidas | `action` (8,) |
| Dataset de entrenamiento | nrburns/Pot_1_and_2_Red-3_full_side-short: 120 episodios, 76.615 fotogramas, 20 FPS |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

La model card identifica el modelo como una implementacion de π₀.₅ dentro de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence, y lo describe como un modelo Vision-Language-Action concebido para generalizar a entornos y situaciones no vistos durante el entrenamiento. No se detallan en la informacion disponible ni el backbone de vision-lenguaje, ni el mecanismo de generacion de acciones, ni el numero de tokens de entrenamiento, ni si se emplearon etapas de RLHF o DPO. Todo ello debe considerarse "no disponible" a partir de las fuentes consultadas. Lo que si consta es que se trata de un ajuste fino supervisado del checkpoint lerobot/pi05_base, no de un entrenamiento desde cero.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset nrburns/Pot_1_and_2_Red-3_full_side-short, compuesto por 120 episodios y 76.615 fotogramas capturados a 20 FPS, todos ellos correspondientes a la tarea de recoger fresas resaltadas y depositarlas en un contenedor verde. La configuracion declarada es de 16.000 pasos, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 1000. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion u otras), ni aumentos de datos, ni estrategia de regularizacion. La combinacion de una unica tarea con un volumen de datos relativamente pequeno apunta a una politica de proposito muy especifico mas que a un modelo generalista.

## Capacidades

- Generacion de acciones de robot de 8 dimensiones a partir de observaciones multimodales (estado articular, pose y wrench del TCP, senales del gripper y tres vistas de camara).
- Manipulacion visomotora de proposito especifico: recoger objetos resaltados (fresas) y colocarlos en un contenedor, finalizando con el retorno a la posicion de reposo.
- Percepcion multimodal con tres camaras simultaneas (vista de escena, vista de muneca y vista lateral) a 480x640, con marcas de tiempo por camara.
- Uso de senales propioceptivas ricas: `observation.state` (8), `observation.dq` (7), `observation.tcp_pose` (7), `observation.tcp_wrench` (6) y realimentacion del gripper (corriente en mA, deteccion de objeto, validez).
- Condicionamiento por instruccion de tarea en lenguaje natural, con una unica cadena documentada: "pick each highlighted strawberry, place it into the green bin, and return home".
- Ejecucion de episodios en bucle con `lerobot-rollout` durante una duracion configurable o de forma indefinida.
- Soporte de fine-tuning posterior desde el modelo base lerobot/pi05_base con `lerobot-train`.
- Tool calling / function calling: no disponible (no es una capacidad documentada para politicas VLA de este tipo en la informacion proporcionada).
- Razonamiento multi-paso explicito, modo "thinking", vision-lenguaje conversacional, audio o generacion de texto general: no disponibles.

## Casos de uso

- Recogida selectiva en agricultura de precision: el modelo esta entrenado exactamente para identificar fresas resaltadas y depositarlas en un contenedor, por lo que puede desplegarse en una celda de recoleccion con iluminacion y distribucion de objetos similares a las del dataset de 120 episodios.
- Bin picking con contenedor de destino: cualquier tarea de transferencia objeto-a-contenedor con un efector tipo pinza instrumentado puede reutilizar la politica si se respetan las claves de observacion y la disposicion de camaras.
- Ciclos de manipulacion con retorno a home: la instruccion incluye explicitamente el retorno a la posicion de reposo, lo que permite encadenar ciclos repetidos de recogida sin intervencion manual entre episodios.
- Investigacion en politicas VLA: sirve como caso de estudio reproducible de fine-tuning de π₀.₅ con LeRobot, util para comparar configuraciones de entrenamiento (pasos, lote, learning rate) sobre una tarea acotada y medir tasas de exito en robot real.
- Punto de partida para nuevos ajustes finos: al derivar de lerobot/pi05_base y estar bajo Apache 2.0, puede emplearse como inicializacion para tareas de picking similares, reduciendo los pasos necesarios frente a partir del modelo base.
- Validacion de pipelines de datos roboticos: la politica obliga a que las camaras y las claves de observacion coincidan exactamente con las del entrenamiento, por lo que es util para verificar la integridad de un pipeline de adquisicion (nombres de camara, resolucion, FPS, timestamps) antes de escalar a produccion.
- Automatizacion de demostraciones y docencia en robotica: con `--strategy.type=base` y una duracion fija, el modelo permite generar demos repetibles de una tarea de manipulacion para formacion o presentaciones tecnicas.
- Pruebas de robustez ante cambios de entorno: al no existir evaluacion publicada, el modelo es adecuado como sujeto de experimentos controlados sobre variaciones de posicion de objeto, iluminacion o distractores, midiendo la degradacion de la tasa de exito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card figura vacia ("No evaluation results have been pro...", texto truncado), y no se proporcionan tasas de exito, numero de ensayos ni metricas de tarea. Tampoco procede aplicar benchmarks de lenguaje (MMLU, HumanEval, GSM8K) a una politica de accion.

| Benchmark | Resultado | Notas |
|---|---|---|
| Evaluacion en robot real | No disponible | La plantilla de la model card esta sin rellenar |
| MMLU / HumanEval / GSM8K | No aplica | Modelo de accion robotica, no de texto |
| Comparativa con π₀ o π₀.₅ base | No disponible | No se han publicado mediciones conjuntas |

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de 4,14 B de parametros en precision de 16 bits (≈8,3 GB de pesos) y del tamano del repo (9,4 GB), se puede estimar un minimo practico de 10-12 GB de VRAM contando activaciones de los tres flujos de imagen. Es una estimacion derivada del numero de parametros, no un dato publicado.
- GPU de consumo: cabe con holgura en RTX 4090 (24 GB) y RTX 3090 (24 GB); previsiblemente tambien en RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB). En tarjetas de 12 GB el margen es escaso y no esta confirmado.
- GPU profesionales: A100, H100, L40S o RTX 6000 Ada son adecuadas tanto para inferencia como para reentrenamiento.
- Entrenamiento: el ajuste documentado (16.000 pasos, lote 32) exige mas memoria que la inferencia; se recomienda una GPU de 40-80 GB (A100/H100) para reproducir la configuracion, aunque no se publican requisitos oficiales.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (con `--policy.device=cuda`) y el ecosistema OpenPI. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje de texto.
- Integracion con hardware: requiere un robot `rizon4` accesible por puerto serie y tres camaras OpenCV configuradas a 640x480; los nombres de camara deben coincidir con las claves de observacion del entrenamiento.
- Latencia y throughput: no disponibles. El dataset se capturo a 20 FPS y el bucle de control opera en tiempo real sobre tres camaras de 480x640, pero no se publican cifras de latencia de inferencia ni de frecuencia de control alcanzable.
- Almacenamiento: el repositorio de pesos ocupa 9,4 GB, a los que hay que anadir el dataset si se va a reentrenar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (nrburns/pi05_...good24_9-16) | 4,14 B | No disponible | Sin evaluacion publicada | Apache 2.0 | HuggingFace, 0 descargas |
| lerobot/pi05_base | No disponible en la informacion proporcionada | No disponible | Sin datos en la informacion disponible | Apache 2.0 (segun el campo `base_model` y la licencia declarada del ajuste) | HuggingFace |
| Otras alternativas VLA (π₀, SmolVLA, etc.) | No disponible | No disponible | No disponible | No disponible | No se han encontrado fuentes comparables en la busqueda web realizada |

No se dispone de comparativas cuantitativas entre este ajuste fino y otras politicas. La unica relacion verificable es de dependencia: este modelo es un fine-tuning del checkpoint lerobot/pi05_base, con el mismo numero de parametros esperado aunque no confirmado por los metadatos disponibles.

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card no incluye tasa de exito, numero de ensayos ni condiciones de prueba, por lo que el rendimiento real de la politica es desconocido.
- Especializacion extrema: 120 episodios, 76.615 fotogramas y una unica tarea. Es esperable un sobreajuste al entorno, la iluminacion, la posicion de los objetos y la configuracion de camaras del dataset.
- Dependencia estricta del hardware de captura: el modelo exige tres camaras (`scene`, `wrist`, `side`) a 480x640 y un robot `rizon4`; los nombres de camara deben coincidir exactamente con las claves de observacion. Cualquier cambio de montaje o resolucion invalida la politica.
- Dependencia del efector: las entradas incluyen corriente del gripper en mA, deteccion de objeto y validez, senales que no todos los robots proporcionan.
- Instruccion unica: solo se documenta una cadena de tarea en ingles. No hay evidencia de generalizacion a otras instrucciones en lenguaje natural ni a otros idiomas.
- Riesgo de alucinacion: no aplica en el sentido de texto generado, pero si existe riesgo de acciones erroneas o inseguras cuando la escena difiere de la distribucion de entrenamiento; sin evaluacion publicada no puede acotarse ese riesgo.
- Sesgos y generalizacion en entornos abiertos: aunque la model card base de π₀.₅ enfatiza la generalizacion a entornos nuevos, ese comportamiento no esta verificado para este ajuste concreto.
- Perfil de uso en produccion: con cero descargas, cero "likes" y sin validacion externa, no debe considerarse un artefacto listo para produccion sin una evaluacion propia en robot real.
- Licencia: el ajuste se publica bajo Apache 2.0, lo que permite uso comercial, pero conviene verificar los terminos del modelo base lerobot/pi05_base y de los datos de Physical Intelligence antes de un despliegue comercial.
- Inconsistencia documental: el ejemplo de `lerobot-rollout` de la model card referencia `nrburns/pi05_Pot_1_and_2_Red_3_full_side_short_good24`, mientras que el identificador real del repositorio es `nrburns/pi05_Pot_1_and_2_Red_3_full_side_short_good24_9-16`. Hay que usar el ID real al cargar la politica.
- Texto truncado: la model card termina de forma abrupta en la seccion de evaluacion, lo que sugiere que la documentacion no esta completa.
- Fechas: los metadatos indican creacion y actualizacion el 2026-09-16, posteriores a la fecha habitual de publicacion de modelos de esta familia; conviene confirmar la vigencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nrburns/pi05_Pot_1_and_2_Red_3_full_side_short_good24_9-16
- Dataset de entrenamiento: https://huggingface.co/datasets/nrburns/Pot_1_and_2_Red-3_full_side-short
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nrburns/Pot_1_and_2_Red-3_full_side-short
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI (implementacion de referencia de Physical Intelligence): no se ha proporcionado la URL en la informacion disponible; se menciona como origen de la adaptacion de LeRobot.
- Fuentes adicionales: la busqueda web realizada no devolvio ningun resultado tecnico relacionado con este modelo ni con π₀.₅.
