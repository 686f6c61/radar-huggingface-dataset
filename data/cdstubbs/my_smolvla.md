# cdstubbs/my_smolvla

## Resumen

cdstubbs/my_smolvla es una politica robotica de tipo vision-language-action (VLA) publicada por el usuario cdstubbs en Hugging Face, obtenida por ajuste fino del modelo base lerobot/smolvla_base. Se trata de un modelo compacto de aproximadamente 450 millones de parametros (450.046.176, segun los pesos en safetensors) que consume estado proprioceptivo y dos flujos de imagen para producir directamente comandos de accion de 6 dimensiones. La arquitectura de referencia es SmolVLA, descrita en el paper arXiv:2506.01844, que se presenta como un VLA compacto y eficiente capaz de desplegarse en hardware de consumo.

El modelo esta especializado en una unica tarea de manipulacion: introducir un ladrillo de Lego rosa en una caja transparente ("pink lego brick into the transparent box"). El ajuste se realizo sobre el dataset lerobot/svla_so101_pickplace (50 episodios, 11.939 fotogramas a 30 FPS) y esta asociado al robot so100_follower con dos camaras, denominadas "up" y "side". El entrenamiento registrado es muy corto: 100 pasos con tamano de lote 32, optimizador AdamW y tasa de aprendizaje 1e-4.

Su relevancia practica es doble. Por un lado, sirve como ejemplo reproducible de un flujo completo de imitation learning con LeRobot (grabacion de datos, ajuste fino, rollout en robot real). Por otro, demuestra que una politica VLA de tamano reducido puede ejecutarse en una GPU de consumo, sin necesidad de infraestructura de centro de datos. No obstante, el autor no ha publicado resultados de evaluacion en robot real, por lo que su tasa de exito efectiva es desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); detalles internos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (modelo de politica robotica; no expone una ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors, 1,2 GB, compatible con fp32) |
| Idiomas soportados | no disponible (el modelo consume instrucciones de tarea y observaciones; no se documentan idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Entradas | observation.state (6,), observation.images.up (3, 480, 640), observation.images.side (3, 480, 640) |
| Salidas | action (6,) |
| Tipo de robot | so100_follower |
| Camaras | up, side |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

SmolVLA se define en la informacion disponible como un modelo compacto de vision-lenguaje-accion que combina observaciones visuales y estado del robot para emitir acciones de control. En esta ficha concreta, el modelo consume dos imagenes RGB de 480x640 y un vector de estado de 6 dimensiones, y devuelve un vector de accion de 6 dimensiones, que corresponde tipicamente a las articulaciones de un brazo SO-100/SO-101. Los detalles del backbone de vision-lenguaje, del modulo de generacion de acciones y del esquema de entrenamiento (por ejemplo, si se emplea flow matching o regresion directa) no se especifican en la informacion proporcionada; la referencia tecnica es el paper arXiv:2506.01844.

El ajuste fino se realizo con LeRobot 0.6.2 sobre el dataset lerobot/svla_so101_pickplace: 50 episodios, 11.939 fotogramas a 30 FPS, una unica tarea de pick and place. La configuracion registrada es de 100 pasos de entrenamiento, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. Conviene subrayar que 100 pasos x lote 32 equivalen a 3.200 muestras procesadas, muy por debajo de los 11.939 fotogramas disponibles, por lo que el ajuste es extremadamente corto y probablemente no completa una sola epoca sobre el dataset. No se documenta uso de RLHF, DPO ni ninguna fase de alineacion adicional, algo por otra parte habitual en politicas de imitation learning.

## Capacidades

- Control de manipulacion robota: genera comandos de accion de 6 grados de libertad a partir de observaciones visuales y de estado.
- Percepcion visual multivista: procesa simultaneamente dos camaras ("up" y "side") a 480x640, lo que aporta informacion de profundidad y de oclusion parcial.
- Ejecucion de una tarea concreta de pick and place: tomar un ladrillo de Lego rosa y depositarlo en una caja transparente.
- Condicionamiento por instruccion de tarea: el rollout acepta un parametro de tarea en texto ("pink lego brick into the transparent box").
- Inferencia en bucle cerrado: la politica se ejecuta de forma continua sobre el robot a la frecuencia del sistema de camaras (30 FPS en los datos de entrenamiento).
- Compatibilidad con el ecosistema LeRobot: se ejecuta con lerobot-rollout y se puede reentrenar con lerobot-train.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingues; no es un modelo de lenguaje generalista.
- No se documentan capacidades de audio, vision generativa ni modos de razonamiento explicito ("thinking mode").

## Casos de uso

- Replicacion de la tarea pick and place en un SO-100/SO-101: el modelo se carga con lerobot-rollout sobre el robot so100_follower y ejecuta la secuencia de recogida y deposito del ladrillo, usando las dos camaras entrenadas.
- Banco de pruebas de imitation learning: sirve para validar el pipeline completo de LeRobot (calibracion, grabacion de episodios, ajuste y rollout) antes de escalar a tareas mas complejas.
- Punto de partida para ajuste fino con datos propios: al derivar de lerobot/smolvla_base y tener licencia Apache-2.0, se puede reentrenar con un dataset propio de otra tarea de manipulacion.
- Docencia y talleres de robotica: su tamano de 450 M parametros permite entrenar y ejecutar en una sola GPU de consumo, lo que facilita demostraciones en aula o laboratorio.
- Evaluacion de robustez frente a variaciones de iluminacion y posicion: al ser un modelo con dos vistas, permite estudiar como afectan los distractores visuales y los cambios de colocacion del objeto.
- Investigacion en politicas VLA compactas: sirve como referencia para comparar calidad de accion frente a modelos VLA mucho mayores en la misma tarea.
- Prototipado de celulas de pick and place en laboratorio: con 30 FPS de captura y acciones de 6 dimensiones, es adecuado para montajes de bajo coste con un brazo y dos camaras USB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito medidas en robot real ni comparaciones numericas con otras politicas. Tampoco se proporcionan metricas de perdida de entrenamiento, latencia de inferencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de los 450 M parametros, sin incluir el coste de los codificadores de imagen ni de las activaciones): en fp32, alrededor de 1,8 GB solo de pesos, con 2,5-3 GB reales en ejecucion; en fp16/bf16, alrededor de 0,9 GB de pesos, con 1,5-2 GB reales; en int8, alrededor de 0,45 GB de pesos.
- El repositorio ocupa 1,2 GB, coherente con pesos en fp32.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4060, RTX 4090) deberia poder ejecutarlo. El modelo esta descrito por sus autores como desplegable en hardware de consumo.
- GPU recomendadas: no hay una recomendacion oficial en la informacion disponible; para entrenamiento se usa el dispositivo cuda del flujo de LeRobot, y tarjetas como RTX 4090, A100 o H100 agilizan el reentrenamiento, aunque no son necesarias para inferencia.
- Opciones de despliegue: LeRobot mediante el comando lerobot-rollout (estrategia base), con soporte de PyTorch y CUDA. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas de accion.
- Latencia y throughput: no disponibles. El unico dato temporal es que los datos de entrenamiento se grabaron a 30 FPS, lo que marca la frecuencia de control esperada, pero no se publica la latencia real de inferencia.
- Entrenamiento: la configuracion registrada (100 pasos, lote 32) es muy ligera y puede reproducirse en una GPU de consumo; el comando de ejemplo usa --policy.device=cuda y wandb opcional.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| cdstubbs/my_smolvla | 450.046.176 | Pick and place de un ladrillo de Lego en caja transparente (SO-100) | Apache-2.0 | Hugging Face (cdstubbs/my_smolvla) |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | VLA generalista preentrenado del que deriva este ajuste | no disponible en la informacion proporcionada | Hugging Face (lerobot/smolvla_base) |
| Otras politicas VLA como OpenVLA o pi0 | no disponible | Manipulacion generalista | no disponible | no disponible |

La informacion proporcionada no incluye datos numericos de rendimiento ni especificaciones completas de alternativas, por lo que no es posible establecer una comparacion cuantitativa fiable. La unica comparacion defendible es cualitativa: este modelo es un ajuste fino especializado del base lerobot/smolvla_base, con la misma arquitectura y un dominio de aplicacion mucho mas estrecho.

## Limitaciones y advertencias

- No hay resultados de evaluacion: la model card indica explicitamente que no se han proporcionado resultados. Se desconoce la tasa de exito real en robot.
- Entrenamiento extremadamente corto: 100 pasos con lote 32 (3.200 muestras) frente a 11.939 fotogramas del dataset, lo que sugiere un ajuste incompleto o al limite del sobreajuste a las posiciones vistas.
- Dataset muy reducido y poco diverso: 50 episodios de una sola tarea y presumiblemente un unico entorno, iluminacion y colocacion de objetos. La generalizacion a nuevas posiciones, objetos o condiciones de luz es dudosa.
- Especificidad de hardware: el modelo espera el tipo de robot so100_follower y exactamente dos camaras con nombres "up" y "side"; los nombres deben coincidir con las claves de observacion para las que fue entrenado. Cualquier cambio en el montaje de camaras invalida las entradas.
- Dependencia de la instruccion de tarea: el rollout se condiciona con el texto "pink lego brick into the transparent box"; el comportamiento con otras instrucciones no esta documentado.
- Sin capacidades de lenguaje general: no es un chatbot ni un modelo de razonamiento; no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- Riesgo de alucinacion en el sentido habitual del termino no aplica; el riesgo equivalente es la generacion de acciones erroneas o inseguras cuando la escena difiere de la distribucion de entrenamiento.
- Seguridad fisica: al controlar un brazo robotico real, conviene ejecutar con limites de velocidad, parada de emergencia y espacio de trabajo despejado. No se documentan limites de seguridad en el modelo.
- Sesgos: no se documentan sesgos demograficos ni linguisticos, dado que el modelo no procesa lenguaje natural de forma generativa. Si pueden aparecer sesgos de entorno (colores, texturas y posiciones presentes en el dataset).
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el texto de atribucion. Conviene revisar tambien las condiciones del modelo base lerobot/smolvla_base y del dataset lerobot/svla_so101_pickplace.
- Repositorio con 0 descargas y 0 likes: se trata de una publicacion recien creada y sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cdstubbs/my_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/svla_so101_pickplace
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/svla_so101_pickplace
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
