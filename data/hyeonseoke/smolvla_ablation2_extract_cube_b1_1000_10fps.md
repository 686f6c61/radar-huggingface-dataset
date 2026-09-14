# HyeonseokE/smolvla_ablation2_extract_cube_B1_1000_10fps

## Resumen

SmolVLA es un modelo compacto de vision-language-action (VLA) desarrollado en el ecosistema de LeRobot de Hugging Face, pensado para ejecutar politicas de robotica manipulativa con un coste computacional reducido y desplegable en hardware de consumo. La ficha que se analiza no es el modelo base, sino un ajuste fino concreto publicado por el usuario HyeonseokE: `HyeonseokE/smolvla_ablation2_extract_cube_B1_1000_10fps`, derivado de `lerobot/smolvla_base` y entrenado sobre un unico conjunto de datos de demostraciones.

El modelo resuelve una tarea especifica de manipulacion: extraer un cubo de un hueco o bolsillo y colocarlo sobre un marcador objetivo ("Extract the cube from the pocket and place it on the target marker"). Se trata, por tanto, de una politica de imitacion monoTarea, monorobot (brazo `so101_follower`) y con dos camaras declaradas (`top`, `left_wrist`), no de un modelo de proposito general. Cuenta con 450.046.176 parametros (~450 M) y se distribuye en safetensors bajo licencia Apache 2.0.

Su relevancia actual es doble: por un lado, demuestra que una politica VLA de ~450 M de parametros puede entrenarse y ejecutarse en equipos asequibles; por otro, forma parte de una serie de ablaciones (identificador B1, semilla 1000, datos capturados a 10 FPS) destinada a estudiar el efecto de distintas decisiones de entrenamiento en el rendimiento final. El repositorio no incluye resultados de evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, entrenada como politica de imitacion con LeRobot; detalle interno del backbone no disponible en la informacion proporcionada |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; pesos en safetensors) |
| Idiomas soportados | no disponible (la tarea se especifica mediante un prompt de texto en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,9 GB; libreria `lerobot`) |
| Tipo de robot | `so101_follower` |
| Camaras declaradas | `top`, `left_wrist` (la tabla de entradas del modelo define tres ranuras de imagen: `camera1`, `camera2`, `camera3`) |
| Entradas | `observation.state` (6,), `observation.images.*` (3, 256, 256) |
| Salidas | `action` (6,), `action.radian_urdf0` (6,) |
| Modelo base | `lerobot/smolvla_base` |

## Arquitectura y entrenamiento

La informacion disponible describe SmolVLA como un modelo compacto y eficiente de vision-language-action, con un rendimiento competitivo a un coste computacional reducido y capacidad de desplegarse en hardware de consumo. No se detallan en la ficha el tipo de backbone de vision-lenguaje, el mecanismo de atencion ni el esquema exacto de fusion de las observaciones visuales y propioceptivas con las acciones; esos datos figuran, segun la propia model card, en el articulo vinculado (arXiv 2506.01844), pero no se reproducen en la informacion proporcionada.

El ajuste fino se realizo con LeRobot 0.6.0 sobre el conjunto `HyeonseokE/ablation2_extract_cube_B1_10fps`: 100 episodios, 31.573 fotogramas capturados a 10 FPS, una unica tarea y un unico tipo de robot. La configuracion de entrenamiento declarada es de 24.650 pasos, tamano de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se indica en la informacion disponible si hubo etapas de RLHF, DPO u otro ajuste por preferencias; al tratarse de aprendizaje por imitacion supervisado, lo esperable es que no las haya. Tampoco se especifican el numero total de tokens de entrenamiento ni la composicion del dataset mas alla de los episodios y fotogramas citados.

## Capacidades

- Generacion de acciones de manipulacion de 6 grados de libertad para el brazo `so101_follower`, a partir de estado propioceptivo de 6 dimensiones e imagenes de 256x256.
- Ejecucion de una tarea concreta de pick-and-place: extraer un cubo de un hueco y depositarlo en un marcador objetivo.
- Consumo de tres ranuras de imagen simultaneas (tres entradas visuales de 3x256x256), lo que permite politicas con vistas de muneca y vista cenital.
- Condicionamiento por instruccion textual en ingles: la tarea se pasa al modelo como cadena de texto en el comando de despliegue.
- Integracion nativa con el ecosistema LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento o ajuste posterior).
- Inferencia en bucle cerrado sobre robot real a traves de la estrategia `base` de rollout.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision general, audio ni modo de razonamiento explicito. El modelo es una politica de robotica, no un asistente conversacional.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo extrae un cubo de un hueco y lo coloca sobre un marcador, que es exactamente la tarea sobre la que fue entrenado; es el uso directo y el unico validado por los datos de entrenamiento.
- Estudio de ablaciones en aprendizaje por imitacion: al tratarse de la variante B1 con semilla 1000 y datos a 10 FPS, sirve como punto de comparacion frente a otras configuraciones de la misma serie para medir el efecto de la semilla, la frecuencia de captura o el volumen de datos.
- Reproduccion de experimentos en robotica de bajo coste: el brazo SO-101 y una politica de ~450 M de parametros permiten montar un banco de pruebas de investigacion sin GPU de gama alta.
- Docencia y formacion en robotica: el flujo `lerobot-rollout` con un `--task` en texto y una duracion fija facilita demostraciones reproducibles en aula o taller.
- Punto de partida para ajuste fino de nuevas tareas: dado que deriva de `lerobot/smolvla_base` y se reentrena con `lerobot-train`, puede servir como inicializacion para tareas de pick-and-place similares con el mismo robot y la misma disposicion de camaras.
- Evaluacion comparativa de politicas VLA: permite medir tiempo de inferencia, tasa de exito y robustez frente a cambios de iluminacion o posicion de objeto en un montaje controlado, siempre que se documenten los resultados (este repositorio no los incluye).
- Pruebas de integracion de pipelines de datos: el conjunto asociado (100 episodios, 31.573 fotogramas, 10 FPS) es util para validar herramientas de visualizacion, conversion y curado de datasets en LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"), y la seccion de evaluacion del repositorio esta vacia. No se dispone de tasas de exito en robot real, ni de comparaciones con otras politicas, ni de medidas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el recuento real de parametros (450.046.176) implica aproximadamente 1,8 GB de pesos en precision de 32 bits y unos 0,9 GB en precision de 16 bits; el repositorio ocupa 0,9 GB, coherente con pesos de 16 bits. Sumando activaciones y las tres entradas visuales de 256x256, una estimacion prudente es de 2 a 4 GB de VRAM en 16 bits. Son estimaciones derivadas del numero de parametros, no mediciones publicadas por el autor.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de memoria. Una RTX 3060, RTX 4060 o superior es suficiente para inferencia; una RTX 4090 ofrece margen sobrado y permite ademas reentrenar. No se documentan requisitos especificos para A100 o H100.
- Cabe en GPU de consumo: si, segun la propia model card, que afirma que el modelo puede desplegarse en hardware de consumo. No se especifica el rendimiento en CPU ni en aceleradores tipo Apple Silicon.
- Opciones de despliegue: la ruta documentada es LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=HyeonseokE/smolvla_ablation2_extract_cube_B1_1000_10fps`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica de robotica con entradas multimodales y salidas de accion.
- Latencia y throughput: no disponibles.
- Requisitos adicionales: robot `so101_follower` real, puerto serie (`--robot.port`), y camaras OpenCV cuyos nombres e indices deben coincidir con las claves de observacion usadas en el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HyeonseokE/smolvla_ablation2_extract_cube_B1_1000_10fps` | 450.046.176 | no disponible | sin resultados de evaluacion publicados | apache-2.0 | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| `lerobot/smolvla_base` | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face; es el modelo base del ajuste fino |
| Otras politicas VLA (familia SmolVLA y alternativas de robotica) | no disponible | no disponible | no disponible | no disponible | el articulo arXiv 2506.01844 realiza comparaciones, pero las cifras no se incluyen en la informacion proporcionada |

No se dispone de datos verificados de parametros, contexto, rendimiento o licencia de los modelos alternativos, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Especializacion extrema: el modelo se ha ajustado sobre una unica tarea y un unico tipo de robot. Fuera de "extraer el cubo del hueco y colocarlo en el marcador objetivo" con un `so101_follower`, el comportamiento no esta garantizado.
- Volumen de datos reducido: 100 episodios y 31.573 fotogramas a 10 FPS es un conjunto pequeno, con riesgo de sobreajuste a las posiciones, iluminacion y apariencia del montaje original.
- Ausencia total de evaluacion: no hay tasa de exito, ni numero de ensayos, ni condiciones de prueba publicadas. Cualquier despliegue en produccion requiere una evaluacion propia previa.
- Dependencia de la configuracion de camaras: los nombres e indices de camara deben coincidir con las claves de observacion del entrenamiento; una discrepancia o un cambio de encuadre degrada la politica.
- Inconsistencia documental: la seccion de detalles declara dos camaras (`top`, `left_wrist`) mientras que la tabla de entradas define tres (`camera1`, `camera2`, `camera3`). Conviene verificar la configuracion real antes de desplegar.
- Idioma: la tarea se proporciona como texto en ingles; no se documenta soporte multilingue ni comprension de instrucciones en castellano.
- Riesgo de acciones fuera de distribucion: al ser una politica de imitacion, ante estados no vistos puede generar trayectorias incorrectas o bruscas. Es imprescindible contar con parada de emergencia y limites de par en el robot.
- Sesgos: no se documentan analisis de sesgo. Al operar sobre objetos y entornos concretos, el modelo puede comportarse de forma desigual ante cambios de textura, color o material.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar los avisos de licencia. Conviene revisar igualmente la licencia del modelo base y del articulo asociado.
- Repositorio con nulo historial de uso (0 descargas, 0 likes) y sin demo ni video publicado: no hay evidencia externa de funcionamiento.
- Los resultados de busqueda web disponibles no contienen informacion relacionada con este modelo; consisten en paginas de una asociacion alemana de maquinaria alimentaria, por lo que no aportan datos tecnicos utilizables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_ablation2_extract_cube_B1_1000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation2_extract_cube_B1_10fps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/ablation2_extract_cube_B1_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Articulo SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot (parcial, tal como aparece en la model card): `@misc{cadene2024lerobot, author = {Cadene, Remi and Alibert, Simon and Soare, Alexander and Gallouedec, Quentin and Zouitine, Adil and Palma, Steven and Kooijmans, Pepijn and Aracting...`
