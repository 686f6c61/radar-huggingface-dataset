# arvinesmaeilydev/smolvla_so101_pick_up_the_cube_realsim_100_norl

## Resumen

Este repositorio contiene una politica robotica de tipo vision-language-action (VLA) denominada smolvla, publicada por el usuario arvinesmaeilydev como un ajuste fino del modelo base lerobot/smolvla_base. No es un modelo de lenguaje generativo al uso, sino un controlador de imitacion que traduce observaciones multimodales (estado de las articulaciones e imagenes de camara) directamente en comandos de accion para un brazo robotico SO-101 (perfil `so101_follower`). Se ha entrenado con la libreria LeRobot 0.6.1 sobre el conjunto de datos arvinesmaeilydev/PickUpTheCube_REALSIM_100_NoRL, compuesto por 100 episodios y 26.614 fotogramas grabados a 30 FPS para una unica tarea: "pick up the cube".

El interes de esta ficha radica en que ejemplifica el flujo de trabajo actual de la robotica open source: un modelo base preentrenado y compacto (450.046.176 parametros, algo mas de 450 millones) que se ajusta con relativamente pocos datos de demostracion real (100 episodios) y se ejecuta en hardware de consumo. La etiqueta "NoRL" del dataset indica que el ajuste se ha hecho exclusivamente por aprendizaje por imitacion, sin refuerzo posterior, con 20.000 pasos de entrenamiento y un tamano de lote de 4. El resultado es una politica muy especializada, ligera y facil de replicar, pero de alcance limitado a la tarea y al robot concretos para los que fue entrenada.

La relevancia de este tipo de publicaciones es metodologica: muestra el coste real (un dataset pequeno, un modelo de 450 M de parametros y una licencia Apache 2.0) de poner a funcionar un manipulador con una tarea de picking, y sirve como plantilla reproducible para laboratorios y desarrolladores que quieran entrenar sus propias politicas VLA sin infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); el backbone de vision-lenguaje y el modulo de generacion de acciones no se detallan en la model card |
| Parametros totales | 450.046.176 (segun los pesos safetensors publicados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors sin variantes cuantizadas |
| Idiomas soportados | no disponible; la unica instruccion de tarea documentada es "pick up the cube" (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`; repositorio de 5,3 GB) |
| Tipo de robot | `so101_follower` (brazo SO-101) |
| Camaras declaradas | campo `front` en la cabecera de la model card; la tabla de entradas lista tres camaras (`observation.images.camera1/2/3`) |
| Entradas | `observation.state` (6,), `observation.images.camera1/2/3` (3, 256, 256) |
| Salidas | `action` (6,) |
| Frecuencia de los datos | 30 FPS |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | arvinesmaeilydev/PickUpTheCube_REALSIM_100_NoRL (100 episodios, 26.614 fotogramas) |
| Version de libreria | LeRobot 0.6.1 |

## Arquitectura y entrenamiento

SmolVLA se presenta en el articulo vinculado (arXiv:2506.01844) como un modelo vision-language-action compacto y eficiente, pensado para reducir el coste computacional y poder desplegarse en hardware de consumo. La model card no especifica la composicion interna (tipo de encoder visual, backbone de lenguaje, mecanismo de decodificacion de acciones ni si emplea flow matching u otra formulacion), por lo que esos detalles deben consultarse en el articulo y no pueden confirmarse a partir de la informacion proporcionada.

El entrenamiento de esta instancia concreta es un ajuste fino supervisado del modelo base lerobot/smolvla_base sobre un unico dataset de demostraciones reales y simuladas (el sufijo `realsim` del nombre lo sugiere, aunque la model card no detalla la mezcla). La configuracion declarada es: 20.000 pasos, tamano de lote 4, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 1000 y LeRobot 0.6.1. El dataset contiene 100 episodios y 26.614 fotogramas a 30 FPS para la tarea "pick up the cube". La ausencia de una fase de refuerzo (etiqueta `NoRL`) implica que la politica se limita a imitar la distribucion de las demostraciones, sin optimizacion adicional por recompensa.

## Capacidades

- Generacion de acciones de control continuo de 6 grados de libertad para un brazo SO-101, a partir de estado de articulaciones e imagenes.
- Percepcion visual multimodal: consume hasta tres flujos de imagen de 3x256x256 ademas del vector de estado.
- Ejecucion de una tarea de manipulacion concreta: coger un cubo ("pick up the cube").
- Condicionamiento por instruccion de tarea en lenguaje natural, aunque en la practica solo se ha entrenado y validado con el enunciado "pick up the cube".
- Integracion nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y ejecucion en robot con `lerobot-rollout`.
- Inferencia en hardware de consumo, segun la afirmacion de la model card del modelo base.
- No dispone de soporte documentado de tool calling, function calling, capacidades de agente multi-paso, vision general de proposito abierto, audio ni modo de razonamiento explicito.

## Casos de uso

- Recogida de piezas en linea de montaje: la politica convierte las imagenes de las camaras y el estado del brazo en comandos de 6 dimensiones para coger un cubo; encaja en celdas donde la posicion del objeto y la iluminacion se parecen a las del dataset de entrenamiento.
- Banco de pruebas para investigacion en imitacion: al ser un ajuste de 450 M de parametros sobre 100 episodios, sirve para medir como escala el exito en funcion del numero de demostraciones, con la receta exacta (20.000 pasos, lote 4, AdamW, lr 1e-4) reproducible con `lerobot-train`.
- Docencia y formacion en robotica: el flujo completo (grabar con LeRobot, ajustar smolvla_base, desplegar con `lerobot-rollout`) se puede ejecutar en un laboratorio con una GPU de gama media y un SO-101.
- Prototipado rapido de tareas de picking en nuevos objetos: reentrenando el mismo modelo base con un dataset propio de 100 episodios se puede obtener una politica equivalente para otra pieza, reutilizando el pipeline de datos.
- Evaluacion comparativa de frameworks VLA: permite contrastar la variante sin refuerzo (`NoRL`) frente a variantes con RL sobre el mismo dataset, aislando el efecto del metodo de optimizacion.
- Demostraciones en ferias y laboratorios: al caber en GPU de consumo, se puede montar un puesto de demostracion autonomo con una sola maquina que ejecute el bucle de control a 30 FPS.
- Validacion de hardware SO-101: la politica actua como carga de trabajo realista para comprobar calibracion de camaras, latencias del bus y repetibilidad del brazo antes de escalar a un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet", y la seccion de evaluacion aparece sin rellenar (sin tabla de tareas, intentos, exitos ni tasa de exito). Tampoco se proporcionan metricas de perdida de entrenamiento, curvas de aprendizaje ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,8 GB solo para los pesos en fp32 y unos 0,9 GB en bf16, calculados a partir de los 450.046.176 parametros; la model card del modelo base no publica cifras oficiales de memoria.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU con al menos 4-6 GB de VRAM libre deberia poder ejecutar la politica, aunque no hay confirmacion oficial.
- GPU de consumo: la model card del modelo base afirma que SmolVLA puede desplegarse en hardware de consumo, lo que incluiria tarjetas tipo RTX 3060, RTX 4060/4070 o superiores; no se especifica un modelo concreto validado.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=arvinesmaeilydev/smolvla_so101_pick_up_the_cube_realsim_100_norl` para ejecucion en robot, y `lerobot-train` para reentrenamiento. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a una politica de control.
- Latencia y throughput: no disponibles. La referencia disponible es la frecuencia del dataset de entrenamiento (30 FPS), y la model card advierte de que omitir el parametro `--duration` hace que la politica se ejecute indefinidamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (smolvla_so101_pick_up_the_cube_realsim_100_norl) | 450.046.176 | no disponible | Manipulacion: coger un cubo con SO-101 | apache-2.0 | HuggingFace, libreria `lerobot` |
| lerobot/smolvla_base (modelo base) | no confirmado en la informacion disponible; el ajuste deriva de el | no disponible | VLA generalista preentrenado para ajuste fino | no disponible en la informacion proporcionada | HuggingFace |
| Alternativas de la misma categoria (por ejemplo, otras politicas VLA o de imitacion del ecosistema LeRobot) | no disponible | no disponible | manipulacion robotica | no disponible | no disponible |

No se dispone de datos verificables de otras politicas comparables (parametros, contexto, tasas de exito o licencia) en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Politica de proposito unico: entrenada exclusivamente para la tarea "pick up the cube" con un brazo `so101_follower`; no generaliza a otras tareas, objetos o morfologias sin reentrenamiento.
- Sin resultados de evaluacion publicados: no hay tasa de exito medida en robot real, por lo que se desconoce su fiabilidad en produccion.
- Riesgo de sobreajuste al entorno de recogida de datos: cambios de iluminacion, posicion de la pieza, fondo o distracciones pueden degradar el comportamiento, ya que no se documenta ninguna estrategia de aumento de datos.
- Inconsistencia documental a revisar antes de desplegar: la cabecera de la model card declara la camara `front`, mientras que la tabla de entradas exige tres camaras (`observation.images.camera1/2/3`); los nombres de camara deben coincidir exactamente con las claves de observacion del entrenamiento.
- Dependencia estricta del entorno LeRobot 0.6.1 y del formato de observaciones (estado de 6 dimensiones, imagenes de 256x256); versiones distintas pueden romper la compatibilidad.
- Ausencia de refuerzo o post-entrenamiento: la etiqueta `NoRL` implica que la politica no corrige errores que no aparezcan en las demostraciones, con el consiguiente riesgo de acumulacion de error a lo largo de episodios largos.
- Idiomas: no hay informacion sobre soporte multilingue de las instrucciones; en la practica, la unica instruccion documentada y entrenada es en ingles.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio no incluye avisos sobre sesgos, seguridad fisica en el entorno de trabajo ni limitaciones de responsabilidad en un contexto robotico real.
- Sin variantes cuantizadas publicadas: no hay pesos GGUF, int8 ni int4, lo que limita el despliegue en dispositivos de muy bajos recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arvinesmaeilydev/smolvla_so101_pick_up_the_cube_realsim_100_norl
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/arvinesmaeilydev/PickUpTheCube_REALSIM_100_NoRL
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=arvinesmaeilydev/PickUpTheCube_REALSIM_100_NoRL
- Articulo de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- No se han encontrado enlaces adicionales relevantes en la busqueda web realizada.
