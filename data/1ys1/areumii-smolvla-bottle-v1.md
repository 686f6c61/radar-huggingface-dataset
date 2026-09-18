# 1ys1/areumii-smolvla-bottle-v1

## Resumen

areumii-smolvla-bottle-v1 es una politica de robotica (vision-language-action) entrenada mediante aprendizaje por imitacion sobre el modelo base lerobot/smolvla_base (SmolVLA). La publica el usuario 1ys1 en Hugging Face y esta especializada en una unica tarea de manipulacion: "Pick up the pink bottle and place it in the box". El modelo consume el estado del robot (6 dimensiones) y tres imagenes de camara de 256x256, y produce un vector de accion de 16 dimensiones, todo ello dentro del ecosistema LeRobot.

Tecnicamente es un modelo compacto de 450.046.176 parametros (aproximadamente 0,45 mil millones) con pesos en safetensors y un tamano de repositorio de 0,9 GB, lo que lo situa en el rango de despliegue en hardware de consumo. Deriva del SmolVLA presentado en el paper arXiv:2506.01844, que se describe como un modelo vision-language-action compacto y eficiente con rendimiento competitivo a coste computacional reducido.

Su relevancia practica es doble: por un lado sirve como ejemplo reproducible de un flujo completo de LeRobot (grabacion de datos, entrenamiento, publicacion en el Hub y rollout en robot real); por otro, es un punto de partida para quien quiera ajustar una politica de pick-and-place en un robot del tipo `areumii` con su propio dataset. El autor no ha publicado resultados de evaluacion, por lo que su rendimiento en robot real no esta cuantificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; detalles internos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (es una politica robotica, no un modelo de lenguaje conversacional) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (tamano de repo 0,9 GB, compatible con pesos de ~16 bits) |
| Idiomas soportados | no disponible (no aplica como modelo de lenguaje; la tarea se define en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Entradas | `observation.state` (6,), tres imagenes visuales (3, 256, 256) de `camera1`, `camera2`, `camera3` |
| Salidas | `action` (16,) |
| Tipo de robot | `areumii` |
| Camaras declaradas en la model card | `head`, `left_wrist`, `right_wrist` |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Dataset de entrenamiento | 1ys1/areumii-bottle-v1 |
| Tamano del repositorio | 0,9 GB |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

La model card identifica el modelo como una politica SmolVLA, es decir, un modelo vision-language-action que procesa observaciones multimodales (estado propioceptivo de 6 dimensiones y tres vistas de camara a 256x256) y emite directamente un vector de accion de 16 dimensiones. El paper de referencia (arXiv:2506.01844) describe SmolVLA como un VLA compacto y eficiente, desplegable en hardware de consumo, pero la informacion proporcionada no detalla la composicion interna (backbone de vision-lenguaje, cabezal de acciones, mecanismo de decodificacion ni si emplea flow matching u otra formulacion). Estos detalles se marcan como no disponibles.

El entrenamiento es un fine-tune supervisado del modelo base `lerobot/smolvla_base`, ejecutado con LeRobot 0.6.1 sobre 30 episodios y 18.169 fotogramas grabados a 30 FPS de la tarea unica "Pick up the pink bottle and place it in the box". La configuracion declarada es: 30.000 pasos de entrenamiento, batch size 8, optimizador AdamW con learning rate 0,0001 y semilla 1000. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion adicional, algo por otra parte habitual en politicas de imitacion. Tampoco se documentan aumentos de datos, composicion del dataset mas alla del conteo de episodios y fotogramas, ni innovaciones tecnicas especificas de esta version.

## Capacidades

- Manipulacion robotica de una tarea concreta: recoger una botella rosa y depositarla en una caja, ejecutada sobre un robot de tipo `areumii`.
- Percepcion multimodal: fusiona estado propioceptivo de 6 dimensiones con tres flujos de imagen RGB de 256x256 (vistas de cabeza y munecas segun la model card).
- Generacion de acciones continuas: salida de 16 dimensiones por paso de control, consumible directamente por el bucle de control del robot.
- Ejecucion en bucle cerrado a 30 FPS de frecuencia de datos (la frecuencia efectiva de inferencia depende del hardware y no esta documentada).
- Integracion nativa con LeRobot: rollout mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso en el sentido de los modelos de lenguaje: es una politica de accion, no un asistente.
- No se declaran capacidades multilingues, de codigo, matematicas, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Automatizacion de pick-and-place en linea de laboratorio: la politica ejecuta la secuencia de recogida de botella y deposito en caja en un robot `areumii`, con inferencia a partir de tres camaras y el estado articular, lo que permite montar una celda repetitiva sin programacion explicita de trayectorias.
- Base para fine-tuning con datos propios: partiendo de `lerobot/smolvla_base` o de este checkpoint, un equipo puede grabar sus propios episodios con `lerobot-train` y adaptar la politica a otro objeto, otra caja u otra posicion inicial.
- Referencia reproducible de un pipeline LeRobot completo: sirve como plantilla de extremo a extremo (dataset en el Hub, entrenamiento, publicacion del checkpoint, rollout), util para equipos que evaluan adoptar LeRobot.
- Validacion de hardware robotico: al ser una tarea simple y medible, se puede usar para comprobar calibracion de camaras, latencia del bucle de control y repetibilidad del robot `areumii` antes de abordar tareas mas complejas.
- Investigacion en aprendizaje por imitacion con pocos datos: con solo 30 episodios y 18.169 fotogramas, es un caso de estudio de como de lejos llega un VLA pequeno con un dataset minimo.
- Despliegue en estaciones con GPU de gama media: su tamano de 0,45 mil millones de parametros y 0,9 GB de pesos permiten ejecutarlo en GPUs de consumo, lo que habilita prototipos en laboratorio o en el borde sin infraestructura de centro de datos.
- Demostraciones y docencia: la tarea esta acotada y descrita en una frase, lo que facilita usarla en cursos o talleres de robotica e IA sin necesidad de montar un entorno experimental complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la nota explicita "No evaluation results have been provided for this policy yet", sin tabla de ensayos, tasa de exito ni condiciones de prueba. No se dispone tampoco de metricas comparativas frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB solo para los pesos en 16 bits (coherente con los 450 millones de parametros y el repositorio de 0,9 GB). Sumando activaciones y los tres codificadores de imagen a 256x256, un presupuesto realista de trabajo se situa en el entorno de 2 a 4 GB, si bien se trata de una estimacion y no de un dato publicado.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente en principio; una RTX 3060, RTX 4060, RTX 4070 o RTX 4090 cubren el caso con holgura. Para entrenamiento con `lerobot-train --policy.device=cuda`, batch size 8 y 30.000 pasos, se recomienda una GPU de gama media-alta con 12 GB o mas.
- Compatibilidad con GPU de consumo: si, el modelo esta disenado explicitamente para hardware de consumo segun la descripcion de SmolVLA. Tambien es candidato razonable para plataformas embebidas tipo Jetson, aunque no hay confirmacion en la informacion proporcionada.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=1ys1/areumii-smolvla-bottle-v1`; entrenamiento con `lerobot-train`. No aplican servidores de inferencia de texto como vLLM, TGI, llama.cpp u Ollama, al no ser un modelo de lenguaje ni publicarse pesos GGUF.
- Latencia y throughput: no disponibles. El requisito de facto viene del bucle de control: los datos se grabaron a 30 FPS, por lo que la inferencia deberia sostener ese ritmo para un comportamiento fluido, pero no se publica ninguna medicion de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1ys1/areumii-smolvla-bottle-v1 | 450.046.176 | no aplica | sin resultados de evaluacion publicados | apache-2.0 | Hugging Face, libreria LeRobot |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no aplica | no disponible | no disponible en la informacion proporcionada | Hugging Face, modelo base del fine-tune |
| Otros VLA de la misma categoria | no disponible | no aplica | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo base del que deriva este checkpoint. No se incluyen datos de parametros, licencia ni rendimiento de alternativas como otros VLA de robotica, por lo que la comparativa con modelos de terceros se marca como no disponible.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea ("Pick up the pink bottle and place it in the box"). Fuera de esa tarea, de ese objeto o de ese entorno, no hay garantia de comportamiento util.
- Dataset muy reducido: 30 episodios y 18.169 fotogramas implican poca diversidad de posiciones, iluminacion y condiciones; es probable una degradacion notable ante cambios de disposicion de objetos, fondos o distracciones.
- Sin evaluacion publicada: no hay tasa de exito ni numero de ensayos, por lo que no se puede afirmar nada sobre su fiabilidad real en robot.
- Dependencia del hardware concreto: entrenado para el tipo de robot `areumii`, con estado de 6 dimensiones y accion de 16 dimensiones. No es transferible directamente a otra morfologia sin reentrenamiento.
- Inconsistencia documental sobre las camaras: la model card nombra las camaras como `head`, `left_wrist` y `right_wrist`, mientras que la tabla de entradas usa `observation.images.camera1`, `camera2` y `camera3`. Los nombres de camara deben coincidir con las claves de observacion del entrenamiento, por lo que conviene verificar la configuracion antes del rollout.
- Riesgo de fallo fisico: como toda politica de control, un error de prediccion puede traducirse en colisiones, caidas de objetos o dano al robot. Es obligatorio operar con parada de emergencia y limites de seguridad.
- Sesgos: no se documenta analisis de sesgos, pero al derivar de un dataset propio y limitado, hereda sus sesgos de iluminacion, posicion, color del objeto y disposicion de la escena.
- Alucinacion: el concepto no aplica igual que en modelos de lenguaje, pero si existe el riesgo analogo de generar acciones no justificadas por la observacion (movimientos espurios) en situaciones fuera de distribucion.
- Licencia: apache-2.0, permisiva y apta para uso comercial, pero se recomienda revisar tambien las condiciones del modelo base `lerobot/smolvla_base` y del dataset `1ys1/areumii-bottle-v1`, cuya licencia no se detalla en la informacion proporcionada.
- Contexto e idioma: al no ser un modelo generativo de lenguaje, no tiene ventana de contexto ni soporte multilingue; la instruccion de tarea es fija.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin senales de uso por terceros ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1ys1/areumii-smolvla-bottle-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/1ys1/areumii-bottle-v1
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=1ys1/areumii-bottle-v1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: los resultados de la busqueda web realizada no contenian ningun enlace relevante sobre el modelo (devolvieron paginas de inicio de sesion de un servicio bancario), por lo que todos los enlaces anteriores proceden de la informacion de Hugging Face y de la model card.
