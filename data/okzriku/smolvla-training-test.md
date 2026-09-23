# OkzRIKU/smolvla-training-test

## Resumen

OkzRIKU/smolvla-training-test es un ajuste fino del modelo vision-lenguaje-accion (VLA) SmolVLA, publicado por el usuario OkzRIKU en Hugging Face y entrenado con la libreria LeRobot 0.6.2. SmolVLA es un modelo compacto de 450 millones de parametros, desarrollado por Hugging Face, que traduce observaciones visuales y de estado del robot en comandos de accion de bajo nivel, con el objetivo declarado de reducir el coste computacional tanto de entrenamiento como de inferencia frente a los VLA de gran tamano.

Este checkpoint concreto se ha especializado mediante aprendizaje por imitacion en una unica tarea: "Turn the upside-down drone upright and place it stably on its landing supports", es decir, levantar un dron volcado y dejarlo apoyado de forma estable sobre sus soportes de aterrizaje. El entrenamiento parte del modelo base lerobot/smolvla_base y utiliza un dataset propio de 5 episodios y 5730 fotogramas grabados a 30 FPS con dos camaras, con solo 100 pasos de optimizacion.

Su relevancia es fundamentalmente metodologica: sirve como ejemplo reproducible de como adaptar un VLA preentrenado a una tarea concreta con recursos minimos, y como caso de estudio de las limitaciones que aparecen cuando el ajuste fino se realiza con un volumen de datos muy reducido. No es un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacto; columna vertebral de vision-lenguaje con modulo de generacion de acciones (detalle en arXiv:2506.01844) |
| Parametros totales | 450.046.176 (450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica como ventana de texto (el modelo consume una observacion por paso de control) |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar en safetensors) |
| Idiomas soportados | no disponible; no es un modelo de texto. La unica instruccion de tarea del dataset esta en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 1,2 GB) |
| Libreria | lerobot 0.6.2 |
| Tipo de robot | so_follower |
| Camaras de entrada | front (3, 480, 640) y top (3, 480, 640) |
| Entrada de estado | observation.state, forma (6,) |
| Salida | action, forma (6,) |
| Modelo base | lerobot/smolvla_base |
| Dataset de ajuste | OkzRIKU/record-test_20260922_212122 |

## Arquitectura y entrenamiento

SmolVLA pertenece a la familia de modelos vision-lenguaje-accion: un backbone de vision-lenguaje procesa las imagenes de camara y el estado proprioceptivo del robot, y un modulo especifico genera el vector de accion que se ejecuta en el actuador. El paper asociado (arXiv:2506.01844) describe ademas una pila de inferencia asincrona pensada para mejorar la reactividad en tareas de manipulacion reales. El modelo base tiene 450 M de parametros y esta disenado, segun sus autores, para entrenarse en una sola GPU y desplegarse en GPUs de consumo o incluso en CPU.

Este checkpoint no se ha entrenado desde cero: es un ajuste fino supervisado (aprendizaje por imitacion, behavior cloning) sobre lerobot/smolvla_base. La configuracion registrada en la model card es de 100 pasos, batch de 64, optimizador AdamW, learning rate 1e-4 y semilla 1000. El dataset consta de 5 episodios y 5730 fotogramas a 30 FPS, con dos camaras sincronizadas y una unica tarea anotada. No hay evidencia de RLHF, DPO ni ninguna otra fase de alineacion o refinamiento por preferencias: es exclusivamente imitacion de demostraciones.

## Capacidades

- Generacion de acciones de manipulacion: produce un vector de accion continuo de 6 dimensiones a partir de dos vistas de camara (front y top) y del estado del robot.
- Percepcion visual multi-camara a 480x640 por vista, con integracion de la informacion de ambas camaras en una unica politica.
- Ejecucion de una tarea especifica de manipulacion: enderezar un dron volcado y depositarlo sobre sus soportes.
- Acondicionamiento por instruccion de tarea en lenguaje natural: el prompt "Turn the upside-down drone upright and place it stably on its landing supports" se pasa como tarea al ejecutar la politica.
- Compatibilidad con el ecosistema LeRobot: entrenamiento, evaluacion y despliegue mediante los comandos `lerobot-train` y `lerobot-rollout`.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente, planificacion multi-paso ni razonamiento simbolico.
- No dispone de capacidades multilingues ni de generacion de texto: no es un modelo de lenguaje.
- No se ha documentado capacidad de vision general (VQA, descripcion de imagenes) ni de audio.

## Casos de uso

- Reproduccion del flujo de ajuste fino de un VLA: el repositorio permite replicar el pipeline completo de LeRobot (grabacion de datos, entrenamiento y rollout) con la configuracion documentada, util como plantilla para equipos que quieran adaptar SmolVLA a su propio robot.
- Manipulacion robotica de una tarea acotada: enderezar objetos volcados y colocarlos en una posicion estable, aplicable a lineas de montaje o celdas de ensayo donde la tarea sea siempre la misma y el objeto no varie.
- Laboratorio docente de robotica: sirve para demostrar el ciclo de aprendizaje por imitacion con solo 5 episodios y 100 pasos de entrenamiento, mostrando de forma tangible el impacto de la cantidad de datos en el exito de la tarea.
- Punto de partida para nuevas adaptaciones: al ser un ajuste fino de lerobot/smolvla_base con licencia Apache 2.0, puede reutilizarse como inicializacion para fine-tunes adicionales sobre el mismo tipo de brazo.
- Pruebas de robustez y analisis de fallos: con solo 5 episodios es un candidato claro para estudiar sobreajuste, generalizacion a posiciones nuevas del objeto y sensibilidad a la iluminacion.
- Validacion de infraestructura de inferencia: permite medir latencia y throughput de un VLA de 450 M en GPUs de consumo o en CPU antes de invertir en un modelo mayor.
- Pruebas de integracion con hardware SO-100/SO-101: el ajuste esta vinculado al tipo de robot `so_follower`, por lo que resulta util para verificar calibracion, nombres de camaras y puertos antes de entrenar modelos mas grandes.
- Generacion de datos sinteticos o de demostraciones adicionales: al no ser un modelo fiable, su uso mas realista es como generador de rollouts que luego se filtran manualmente para ampliar el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica: no hay tabla de tareas, numero de ensayos ni tasa de exito en robot real. Tampoco se incluyen metricas de simulacion ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 0,9 GB solo para pesos, mas activaciones de dos imagenes a 480x640 y el estado del robot; un presupuesto practico de 2 a 4 GB de VRAM es suficiente.
- VRAM estimada en fp32: aproximadamente 1,8 GB de pesos, con un presupuesto practico de 4 a 6 GB.
- VRAM estimada en int8: en torno a 0,45 GB de pesos, con un presupuesto de 1 a 2 GB.
- Cabe sobradamente en cualquier GPU de consumo moderna: RTX 3060, RTX 4060, RTX 4070, RTX 4090, asi como en GPUs de portatil con 6 GB o mas.
- Los autores de SmolVLA afirman que el modelo puede desplegarse en GPUs de consumo o incluso en CPU, lo que hace viable su ejecucion sin acelerador dedicado.
- Entrenamiento: el diseno del modelo base apunta a ajuste fino en una sola GPU; la configuracion documentada (100 pasos, batch 64) es de coste muy reducido.
- Opciones de despliegue: el camino soportado es la CLI de LeRobot (`lerobot-rollout`) sobre PyTorch, con el paquete `lerobot` instalado. Frameworks como vLLM, TGI, llama.cpp u Ollama no aplican, porque no es un modelo de lenguaje autorregresivo de texto.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabo a 30 FPS, pero no se especifica la frecuencia de control alcanzada en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OkzRIKU/smolvla-training-test | 450 M | VLA ajustado a una tarea | 2 imagenes 480x640 + estado (6,) | Apache 2.0 | Hugging Face; 0 descargas, 0 likes |
| lerobot/smolvla_base | 450 M | VLA preentrenado | no disponible | Apache 2.0 | Hugging Face (modelo base) |
| jtekt-physical-ai/lerobot_smolvlav1 | 450 M (arquitectura SmolVLA) | VLA ajustado | no disponible | Apache 2.0 | Hugging Face |
| Otros VLA de mayor tamano (OpenVLA, pi0, RDT) | no disponible en la informacion proporcionada | VLA | no disponible | no disponible | no disponible |

Todos los modelos comparables directos pertenecen a la misma familia SmolVLA de 450 M de parametros. No se dispone de datos de rendimiento comparado entre ellos, ni de cifras verificadas de alternativas de otros desarrolladores dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Dataset extremadamente reducido: 5 episodios, 5730 fotogramas y una sola tarea. El riesgo de sobreajuste es alto.
- Entrenamiento de solo 100 pasos con learning rate 1e-4; no hay evidencia de convergencia ni curva de perdida publicada.
- Sin resultados de evaluacion: el autor no ha reportado tasa de exito, ni en robot real ni en simulacion.
- Ausencia de validacion de robustez: no se documenta comportamiento ante cambios de iluminacion, posicion del objeto, distractores u otro robot del mismo tipo.
- Especificidad de hardware: la politica espera el tipo de robot `so_follower` y exactamente dos camaras con los nombres `front` y `top`. Cambiar nombres, indices o resoluciones invalida su uso.
- Sesgos: no se ha realizado ningun analisis de sesgo. En un modelo puramente viso-motor, el sesgo relevante es de distribucion de datos (posiciones, texturas y condiciones del entorno de grabacion).
- Alucinacion: no aplica en el sentido linguistico, pero si existe el riesgo equivalente de generar acciones plausibles y fisicamente incorrectas cuando la observacion se sale de la distribucion de entrenamiento.
- Seguridad fisica: es un modelo de politica robotica. Cualquier despliegue sobre hardware real exige limites de par, paradas de emergencia y supervision humana.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se debe citar el metodo SmolVLA y LeRobot segun la model card.
- Nomenclatura: el nombre del repositorio ("training-test") y las fechas de creacion y actualizacion registradas (2026) apuntan a un experimento de prueba, no a un artefacto mantenido.
- Trazabilidad limitada: 0 descargas y 0 likes; no hay comunidad ni issues que permitan inferir comportamiento en otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkzRIKU/smolvla-training-test
- Dataset de entrenamiento: https://huggingface.co/datasets/OkzRIKU/record-test_20260922_212122
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=OkzRIKU/record-test_20260922_212122
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Paper en HTML: https://arxiv.org/html/2506.01844v1
- Blog de SmolVLA: https://huggingface.co/blog/smolvla
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Sitio divulgativo de SmolVLA: https://smolvla.net/index_en
- Ejemplo de ajuste de terceros: https://huggingface.co/jtekt-physical-ai/lerobot_smolvlav1
