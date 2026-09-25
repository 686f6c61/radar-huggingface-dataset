# polarisai-robots/bento_ur7e_pi0_v3

## Resumen

bento_ur7e_pi0_v3 es una politica robotica de tipo Vision-Language-Action (VLA) publicada por polarisai-robots en Hugging Face. Es un ajuste fino de lerobot/pi0_base, la implementacion en LeRobot del modelo fundacional pi0 de Physical Intelligence, y esta especializada en dos tareas concretas de empaquetado de fiambreras ejecutadas con un brazo robotico Universal Robots UR7e. El repositorio contiene 4.028.019.472 parametros (unos 4,03 mil millones) en formato safetensors y ocupa 8,9 GB.

El modelo resuelve el problema de traducir observaciones visuales e instrucciones en lenguaje natural a comandos de accion de 7 grados de libertad, mediante aprendizaje por imitacion a partir de 304 episodios y 588.314 fotogramas grabados a 60 FPS. Es relevante para equipos que necesiten desplegar manipulacion pick-and-place sobre un UR7e sin entrenar desde cero, o como punto de partida para ajustar sus propias tareas.

La licencia es Apache 2.0 y la ejecucion se realiza con las herramientas de LeRobot (lerobot-rollout y lerobot-train). No hay resultados de evaluacion publicados ni datos de benchmarks, y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha, por lo que se trata de un artefacto reciente y sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en pi0; detalles internos de capas no disponibles |
| Parametros totales | 4.028.019.472 (4,03 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica ventana de observacion ni de historial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; las instrucciones de las tareas del dataset estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | Universal Robots UR7e (6 articulaciones + pinza) |
| Camaras declaradas | top, wrist |
| Entradas | 3 imagenes RGB de (3, 224, 224) y observation.state |
| Salidas | action de shape (7,) |
| Modelo base | lerobot/pi0_base (ajuste fino) |
| Dataset de entrenamiento | polarisai-robots/bento_ur7e_v1 (304 episodios, 588.314 fotogramas, 60 FPS) |
| Tamano del repositorio | 8,9 GB |
| Libreria | lerobot (entrenado con LeRobot 0.6.0) |
| Tareas entrenadas | "Pack me a lunchbox with two fried chicken pieces and two brocolli." y "Pack me a lunchbox with two fish fillet and three sausages." |

## Arquitectura y entrenamiento

El modelo es una politica VLA generalista heredada de pi0: recibe imagenes de camara y una instruccion en lenguaje natural, y emite comandos de accion de 7 dimensiones para el robot. La model card indica que la implementacion en LeRobot esta adaptada del repositorio OpenPI de Physical Intelligence y que esta politica se ha entrenado y subido al Hub con LeRobot. No se detallan en la informacion disponible la composicion exacta del encoder visual, del backbone de lenguaje ni del cabezal de acciones del modelo base.

El ajuste fino se realizo sobre lerobot/pi0_base con 20.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 5e-05 y semilla 1000. El dataset contiene 304 episodios y 588.314 fotogramas a 60 FPS, con observaciones de estado y acciones de 7 valores (joint_0.pos a joint_5.pos mas gripper.pos). No hay informacion sobre el numero de tokens de preentrenamiento del modelo base, la composicion de su dataset original, ni sobre si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Control de manipulacion robotica: genera secuencias de acciones de 7 grados de libertad (6 articulaciones mas pinza) a partir de observaciones visuales y de estado.
- Seguimiento de instrucciones en lenguaje natural: interpreta ordenes en ingles del tipo "Pack me a lunchbox with two fried chicken pieces and two brocolli.".
- Percepcion multi-camara: consume tres flujos de imagen RGB de 224x224 (camara superior y camaras de muneca, segun la model card) mas el vector de estado.
- Ejecucion de tareas de empaquetado: especializado en dos tareas de llenado de fiambreras con piezas de pollo frito, brocoli, filetes de pescado y salchichas.
- Despliegue en bucle de control: se ejecuta con `lerobot-rollout` sobre un robot UR7e, con duracion configurable o ejecucion indefinida.
- Reutilizacion como base para ajuste fino: puede servir como punto de partida para nuevas tareas mediante `lerobot-train` partiendo de lerobot/pi0_base.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje conversacional).
- Agentes y razonamiento multi-paso explicito: no disponible; el modelo emite acciones, no planes textuales ni llamadas a herramientas.
- Capacidades multilingues: no disponible; las tareas de entrenamiento estan unicamente en ingles.
- Capacidades especiales adicionales (modo thinking, audio, vision general): no disponibles.

## Casos de uso

- Empaquetado automatico de fiambreras en linea de produccion: la politica ejecuta directamente las dos tareas de llenado para las que fue entrenada sobre un UR7e, con seguimiento de la instruccion escrita en lenguaje natural y sin necesidad de programar trayectorias manualmente.
- Pick-and-place de piezas de comida en celdas de manipulacion: selecciona y coloca elementos como pollo frito, brocoli, pescado o salchichas en posiciones definidas por la tarea, usando las imagenes de camara superior y de muneca.
- Punto de partida para ajuste fino de nuevas tareas: un equipo con un UR7e puede reutilizar los pesos y el pipeline de LeRobot para entrenar variantes sobre su propio dataset, reduciendo el coste frente a partir de lerobot/pi0_base.
- Investigacion en aprendizaje por imitacion: el repositorio documenta hiperparametros completos (20.000 pasos, batch 8, AdamW, lr 5e-05, semilla 1000, LeRobot 0.6.0), lo que permite reproducir o comparar experimentos de VLA sobre el mismo dataset.
- Generacion de datos y evaluacion comparativa de politicas: el rollout con `--strategy.type=base` permite ejecutar la politica sin grabar episodios, util para medir tasas de exito frente a alternativas como bento_ur7e_pi05_v3 sobre el mismo robot y dataset.
- Prototipado en laboratorio de robotica: sirve para validar la integracion hardware-software (puerto del robot, calibracion de camaras OpenCV a 640x480 y 30 FPS) antes de escalar a una celda industrial.
- Automatizacion de catering o cocina industrial: como demostrador de manipulacion de alimentos no rigidos, donde el modelo aprende de demostraciones humanas en lugar de reglas geometricas.
- Banco de pruebas para seguridad robotica: permite estudiar comportamiento de la politica ante cambios de iluminacion, posiciones de objetos o distracciones, aunque no se han publicado metricas al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una seccion de evaluacion con la nota explicita de que todavia no se han proporcionado resultados para esta politica, y la tabla de tareas con numero de intentos y tasa de exito aparece vacia. No hay datos de MMLU, HumanEval, GSM8K ni de tasa de exito en robot real, por lo que no se puede comparar su rendimiento con otras politicas.

## Requisitos de hardware

- VRAM estimada (calculo a partir de los 4,03 mil millones de parametros, no confirmado por el autor): en bf16/fp16 los pesos ocupan aproximadamente 8,1 GB, mas overhead de activaciones y buffers de vision, lo que situa la inferencia en torno a 10-12 GB; en fp32 los pesos solos ocuparian unos 16,1 GB.
- GPU de datacenter recomendadas: A100 (40 o 80 GB), H100, L40S o similares, especialmente si se quiere margen para batch de imagenes y ejecucion simultanea de otras tareas.
- GPU de consumo: cabe en tarjetas con 16 GB o mas, como RTX 4090 o RTX 4080 en bf16; en tarjetas de 12 GB (RTX 4070, RTX 3060) el margen es insuficiente sin cuantizacion, y no se documentan formatos cuantizados.
- CPU: no viable para control en tiempo real; el bucle de control requiere latencia baja y aceleracion por GPU (CUDA).
- Opciones de despliegue: comandos de LeRobot (`lerobot-rollout` para ejecutar, `lerobot-train` para entrenar) con `--policy.device=cuda`. vLLM, TGI, llama.cpp u Ollama no aplican, ya que no es un modelo de lenguaje de texto.
- Almacenamiento: el repositorio ocupa 8,9 GB, por lo que conviene prever ese espacio en el equipo de inferencia.
- Latencia y throughput: no disponibles. El dataset se grabo a 60 FPS y el ejemplo de rollout configura las camaras a 30 FPS, pero la model card no especifica la frecuencia de inferencia alcanzable ni el tiempo por accion.

## Comparativa con modelos similares

| Modelo | Modelo base | Robot | Dataset | Parametros | Licencia | Resultados publicados |
|---|---|---|---|---|---|---|
| polarisai-robots/bento_ur7e_pi0_v3 | lerobot/pi0_base | ur7e | bento_ur7e_v1 (304 episodios, 588.314 fotogramas) | 4.028.019.472 | Apache 2.0 | no disponibles |
| polarisai-robots/bento_ur7e_pi05_v3 | lerobot/pi05_base | ur7e | bento_ur7e_v1 (304 episodios, 588.314 fotogramas) | no disponible | no disponible | no disponibles |
| polarisai-robots/bento_ur7e_v1_pi05 | lerobot/pi05_base | ur7e | 204 episodios, 364.128 fotogramas | no disponible | no disponible | no disponibles |
| lerobot/pi0_base | no aplica (modelo base) | generico | no disponible | no disponible | no disponible | no disponibles |

Las alternativas mas cercanas comparten robot (ur7e) y, en dos casos, el mismo dataset, pero se construyen sobre pi05_base en lugar de pi0_base. No hay tasas de exito ni metricas publicadas para ninguno de ellos, por lo que la comparacion se limita a la configuracion de entrenamiento y al linaje del modelo base.

## Limitaciones y advertencias

- Politica especializada: solo se ha ajustado para dos tareas de empaquetado de fiambreras; fuera de ese dominio y de ese robot no hay garantia de comportamiento util.
- Dataset pequeno y poco diverso: 304 episodios y dos instrucciones en ingles, con posiciones de objetos, iluminacion y disposicion de camaras fijas. Es probable que degrade ante cambios de entorno no vistos.
- Dependencia del hardware: el modelo declara el tipo de robot ur7e y exige que los nombres e indices de camara coincidan con las claves de observacion del entrenamiento; usar otro robot o renombrar camaras invalida la politica.
- Desajuste en la model card: la seccion de entradas declara `observation.images.base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb` y un `observation.state` de 32 dimensiones, mientras que la ficha del dataset bento_ur7e_v1 describe `observation.images.top` y un `observation.state` de 7 dimensiones. Conviene verificar las claves reales antes de desplegar.
- Sin evaluacion publicada: no existe ninguna tasa de exito medida, ni en simulacion ni en robot real, que respalde el rendimiento del ajuste fino.
- Riesgo de acciones incorrectas: en un modelo VLA el fallo no se manifiesta como texto inventado sino como movimientos erroneos del brazo, con riesgo fisico sobre objetos y personas.
- Idioma: las instrucciones de entrenamiento estan en ingles; el comportamiento con instrucciones en castellano no esta documentado.
- Seguridad fisica: la operacion de un brazo UR7e requiere limites de fuerza, paradas de emergencia, vallado o escaneado de seguridad y supervision humana durante las fases de prueba.
- Trazabilidad y validacion: el repositorio registra cero descargas y cero valoraciones, sin evidencia de uso por terceros; conviene tratarlo como experimental.
- Licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial, pero no se detalla en la informacion disponible la licencia del modelo base lerobot/pi0_base ni las condiciones de los datos, que deben comprobarse por separado.
- Utilidad limitada fuera de robotica: no genera texto, no razona de forma conversacional, no soporta tool calling ni agentes, y no procesa audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/polarisai-robots/bento_ur7e_pi0_v3
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/polarisai-robots/bento_ur7e_v1
- Version alternativa del dataset: https://huggingface.co/datasets/polarisai-robots/bento_ur7e_v1_20260908_104320
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=polarisai-robots/bento_ur7e_v1
- Blog de pi0 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi0 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Modelo hermano basado en pi05: https://huggingface.co/polarisai-robots/bento_ur7e_pi05_v3
- Modelo hermano alternativo: https://huggingface.co/polarisai-robots/bento_ur7e_v1_pi05
- Repositorio OpenPI de Physical Intelligence: mencionado en la model card sin URL explicita (no disponible)
- Citacion: la model card incluye un BibTeX de LeRobot (Cadene et al., 2024) que aparece truncado en la informacion disponible
