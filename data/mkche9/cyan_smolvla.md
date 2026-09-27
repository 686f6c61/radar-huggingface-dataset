# mkche9/cyan_smolvla

## Resumen

cyan_smolvla es un modelo de vision-lenguaje-accion (VLA) orientado a robotica, publicado por el usuario mkche9 como un ajuste fino del modelo base lerobot/smolvla_base. No es un modelo de lenguaje conversacional, sino una politica de control motor que traduce observaciones visuales y de estado del robot, junto con una instruccion en lenguaje natural, en comandos de accion de 6 grados de libertad. Su proposito es ejecutar una tarea de manipulacion concreta sobre un brazo robotico de tipo `so_follower`.

El modelo tiene 450.046.176 parametros (~450 M) en formato safetensors y ocupa 0,9 GB en el repositorio, lo que lo situa en la categoria de VLA compactos pensados para hardware de consumo, en la linea del trabajo SmolVLA (arXiv:2506.01844). Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificacion sin restricciones adicionales, y se entrena y ejecuta con la libreria LeRobot de Hugging Face.

La relevancia de esta ficha es doble: por un lado documenta un caso real de ajuste fino de un VLA sobre un dataset pequeno (50 episodios, 18.905 fotogramas) y una unica tarea; por otro, sirve como ejemplo reproducible del flujo de trabajo de imitacion de LeRobot 0.6.2. El autor no ha publicado resultados de evaluacion en el robot real, por lo que su rendimiento efectivo en produccion no esta verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en SmolVLA: backbone de vision-lenguaje mas modulo de generacion de acciones |
| Parametros totales | 450.046.176 (~450 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la instruccion de tarea del dataset esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint base lerobot/smolvla_base, que implementa la arquitectura SmolVLA descrita en el paper arXiv:2506.01844. SmolVLA combina un modelo de vision-lenguaje compacto con un modulo de generacion de acciones, de forma que la politica condiciona los comandos motores tanto en las imagenes de camara y el estado del robot como en la instruccion textual de la tarea. El modelo consume `observation.state` con forma `(6,)` y tres entradas visuales `(3, 256, 256)` mas una camara adicional de `(3, 480, 640)`, y produce una accion de forma `(6,)`. La informacion disponible no detalla la composicion completa del dataset de preentrenamiento del modelo base ni si se emplearon etapas de RLHF o DPO.

El ajuste fino se realizo con LeRobot 0.6.2 sobre el dataset mkche9/cyan, compuesto por 50 episodios y 18.905 fotogramas a 30 FPS, todos ellos de la tarea "Pick the blue block and place in the black plate". La configuracion de entrenamiento fue de 30.000 pasos, tamano de lote 4, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El robot objetivo es un `so_follower` con camaras de muneca y cenital (`wrist`, `overhead`). No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni estrategias de inferencia asincrona especificas de este ajuste.

## Capacidades

- Generacion de acciones motoras de 6 grados de libertad para un brazo robotico `so_follower`, a partir de observaciones multimodales.
- Percepcion visual multi-camara: procesa simultaneamente vistas de muneca, cenital y hasta tres imagenes adicionales de 256x256 mas una de 480x640.
- Condicionamiento por instruccion en lenguaje natural: la politica recibe la descripcion textual de la tarea como entrada.
- Ejecucion de la tarea especifica de recoger un bloque azul y depositarlo en un plato negro.
- Integracion nativa con el ecosistema LeRobot para rollout y entrenamiento.
- No dispone de modo de razonamiento explicito (thinking mode), generacion de texto, codigo, matematicas ni capacidades de audio.
- No se ha documentado soporte de tool calling, function calling ni comportamiento agentico multi-paso.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: la politica puede controlar un brazo `so_follower` para trasladar objetos entre posiciones fijas, adecuada para entornos controlados donde la tarea y la iluminacion son estables.
- Base para ajuste fino en tareas nuevas: dado que parte de lerobot/smolvla_base y se entrena en unas pocas horas con 50 episodios, sirve como punto de partida para reentrenar politicas con nuevos objetos o destinos.
- Prototipado educativo en robotica: su tamano de 450 M y su licencia Apache 2.0 lo hacen util para ensenar flujos de imitacion con LeRobot en cursos y talleres.
- Banco de pruebas de VLA de bajo coste: permite medir en hardware accesible como se comporta un VLA compacto frente a alternativas de mayor tamano, con dos camaras y una tarea acotada.
- Validacion de pipelines de datos de imitacion: el par dataset mkche9/cyan y esta politica sirven para verificar el ciclo completo de grabacion, entrenamiento y rollout de LeRobot 0.6.2.
- Manipulacion con multiples vistas: al integrar camaras de muneca y cenital, el modelo puede emplearse en escenarios donde la oclusion parcial exige combinar perspectivas.
- Demostracion de inferencia en hardware de consumo: encaja en equipos con GPU de gama media o incluso CPU, lo que permite desplegar robots de bajo coste sin servidores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real (numero de intentos, exitos ni tasa de exito) para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (FP32) en torno a 1,8 GB; en BF16/FP16 cerca de 0,9 GB; en cuantizaciones de 8 y 4 bits seria inferior, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cabe en cualquier GPU de consumo con 4 GB o mas de VRAM (por ejemplo RTX 3050, RTX 4060, RTX 4090). No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de escritorio o portatil, y segun el paper de SmolVLA tambien es viable en CPU.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) sobre PyTorch es la via documentada. No hay soporte confirmado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de generacion de texto.
- Latencia y throughput: no disponibles. Al tratarse de control robotico a 30 FPS, el bucle de inferencia debe operar idealmente por debajo de 33 ms por paso, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| mkche9/cyan_smolvla | ~450 M | VLA (SmolVLA ajustado) | Apache 2.0 | Hugging Face (0 descargas, 0 likes al consultar) |
| lerobot/smolvla_base | ~450 M | VLA (SmolVLA base) | no disponible en la informacion aportada | Hugging Face |
| OpenVLA | ~7.000 M | VLA | no disponible en la informacion aportada | Hugging Face |
| Octo | no disponible | Transformer de politica (difusion) | no disponible en la informacion aportada | Hugging Face |

La comparacion con OpenVLA y Octo se incluye a titulo orientativo de categoria; los datos de parametros, licencia y rendimiento de esos modelos no estan presentes en la informacion proporcionada. No se dispone de resultados de benchmarks comunes que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Tarea unica: el modelo esta ajustado para "Pick the blue block and place in the black plate"; fuera de esa tarea o de condiciones visuales similares su comportamiento no esta garantizado.
- Dataset muy pequeno: 50 episodios y 18.905 fotogramas son una base de entrenamiento limitada, lo que aumenta el riesgo de sobreajuste y de baja generalizacion a nuevas posiciones, iluminacion u objetos.
- Sin evaluacion publicada: no hay tasa de exito en robot real, por lo que no puede afirmarse su fiabilidad en produccion.
- Dependencia de hardware especifico: espera un brazo `so_follower` con camaras de muneca y cenital, y nombres de camara alineados con las claves de observacion del entrenamiento.
- Confusion potencial de sensores: la model card lista una entrada `observation.images.empty_camera_0` a 480x640, lo que sugiere una camara sin datos utiles de entrenamiento y conviene verificar el mapeado real de camaras antes de desplegar.
- Sesgos conocidos: no disponibles; al ser un modelo de control motor, los sesgos relevantes serian de distribucion de datos (colores, posiciones, condiciones de laboratorio) mas que de lenguaje.
- Riesgo de alucinacion motora: como toda politica de imitacion, puede producir trayectorias plausibles pero incorrectas, con riesgo fisico para el robot o los objetos.
- Idiomas: no se declaran idiomas soportados; la instruccion de tarea esta en ingles y no hay evidencia de comprension multilingue.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad de validar el modelo en su propio entorno.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkche9/cyan_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mkche9/cyan
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mkche9/cyan
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
