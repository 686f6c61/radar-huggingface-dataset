# pixelouie/oman_workshop_model

## Resumen

`pixelouie/oman_workshop_model` es una politica de aprendizaje por imitacion basada en ACT (Action Chunking with Transformers), desarrollada por el usuario pixelouie y publicada en Hugging Face dentro del ecosistema LeRobot. No es un modelo de lenguaje: es un modelo de control robotico que consume el estado articular y dos flujos de imagen de camara, y produce comandos de accion de 7 grados de libertad para un brazo robotico de tipo `nema_arm`.

El modelo resuelve una tarea unica y muy concreta, descrita en la model card como "Move arm left to right", entrenada a partir de 98 episodios de teleoperacion (14.527 fotogramas a 15 FPS) recogidos en el dataset `pixelouie/oman_workshop_1_clean`. Su relevancia es la de servir como ejemplo reproducible del flujo completo de LeRobot (grabacion de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) y como punto de partida para reentrenar o ajustar politicas ACT en brazos de bajo coste.

Tecnicamente, ACT predice "chunks" de acciones (secuencias cortas de comandos) en lugar de un unico paso, lo que reduce el error de acumulacion y mejora la estabilidad del control. El modelo tiene 51.670.663 parametros reales en safetensors, ocupa 1,2 GB en el repositorio, se entreno durante 10.000 pasos con batch de 64 y learning rate 1e-5 usando LeRobot 0.6.2, y no publica licencia, idiomas ni resultados de evaluacion. Sus descargas y "likes" son cero, por lo que no hay evidencia de uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; procesa ventanas de observacion y predice chunks de acciones) |
| Tipos de cuantizacion | no disponible (repo publicado en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las instrucciones de tarea son etiquetas de texto fijas, en este caso "Move arm left to right") |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `nema_arm` |
| Camaras | `cam_top`, `cam_side` (640x480, 3 canales) |
| Entrada de estado | `observation.state`, forma `(7,)` |
| Salida | `action`, forma `(7,)` |
| Tamano del repositorio | 1,2 GB |
| Pipeline | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion presentado en el paper arXiv:2304.13705. Su rasgo distintivo es que el decodificador predice un chunk de acciones (varios pasos futuros de una sola vez) en lugar de una accion por paso, lo que amortigua el ruido de las demostraciones teleoperadas y evita el error de acumulacion tipico de las politicas paso a paso. La variante de LeRobot combina un codificador de imagenes por camara con un transformer que fusiona las representaciones visuales y el estado proprioceptivo, y una cabeza de accion que emite las 7 dimensiones de control del brazo. Ademas, ACT incorpora una componente de estilo (CVAE) que ayuda a modelar la variabilidad humana durante el entrenamiento.

El entrenamiento se realizo integramente con el dataset `pixelouie/oman_workshop_1_clean`: 98 episodios y 14.527 fotogramas capturados a 15 FPS, con una unica tarea ("Move arm left to right"). La configuracion declarada es de 10.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre LeRobot 0.6.2. No se documenta el numero total de tokens ni el uso de RLHF o DPO, algo que no aplica a un modelo de control: el paradigma es imitacion supervisada sobre demostraciones, sin ninguna fase de refuerzo ni de preferencias humanas. Tampoco se indica si se aplico aumento de datos, normalizacion de acciones o tecnicas de decodificacion especulativa.

## Capacidades

- Control robotico de 7 grados de libertad: mapea estado articular de 7 dimensiones mas dos imagenes de 640x480 a un vector de accion de 7 dimensiones.
- Aprendizaje por imitacion a partir de teleoperacion: reproduce la tarea demostrada por un operador humano, con prediccion por chunks de acciones.
- Percepcion visual multi-camara: usa de forma conjunta una camara superior (`cam_top`) y una lateral (`cam_side`), lo que aporta informacion de profundidad y de oclusion parcial.
- Ejecucion autonoma de la tarea "Move arm left to right" durante un tiempo configurable (el ejemplo de la model card usa `--duration=60`).
- Integracion con el ecosistema LeRobot: comandos `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- Soporte de tool calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica (la unica planificacion es el chunk de acciones).
- Capacidades multilingues: no aplica.
- Capacidades especiales: no dispone de modo "thinking", vision generativa, audio ni generacion de texto. La unica modalidad de salida es control motor.

## Casos de uso

- Docencia y talleres de robotica: el modelo sirve como ejemplo cerrado y reproducible del flujo de LeRobot, desde la grabacion de datos con teleoperador hasta el despliegue de la politica, para que los alumnos vean un caso completo de imitacion con vision.
- Validacion de un montaje fisico de brazo `nema_arm`: antes de invertir tiempo en recoger cientos de episodios, se puede ejecutar esta politica ya entrenada para comprobar que el cableado, las camaras, la calibracion y los topicos de observacion coinciden con lo esperado.
- Base para fine-tuning sobre una tarea nueva: al ser un checkpoint ACT de 51,67 M de parametros, se puede continuar el entrenamiento con un dataset propio de pocos cientos de episodios cambiando `--policy.path` por el repositorio local, aprovechando la inicializacion en lugar de partir de cero.
- Test de regresion de pipelines de datos: sirve para verificar que el formato de un dataset nuevo (tipos de camara, forma de `observation.state`, frecuencia de muestreo) es compatible con lo que espera una politica ACT antes de entrenamientos largos.
- Demostraciones en ferias o workshops con hardware de bajo coste: la tarea simple de mover el brazo de izquierda a derecha es visualmente clara y no requiere manipulacion de objetos ni deteccion de contacto, lo que reduce el riesgo de fallo en entorno publico.
- Estudio comparativo de politicas de imitacion: al tratarse de un modelo publico con configuracion de entrenamiento documentada, permite medir la diferencia entre ACT y otras familias (por ejemplo Diffusion Policy) sobre el mismo brazo y las mismas camaras.
- Control supervisado con parada rapida: dado que la politica esta acotada a una tarea de movimiento libre, puede usarse en pruebas donde un operador tiene el boton de parada de emergencia y se evalua unicamente la suavidad de la trayectoria generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la linea "_No evaluation results have been provided for this policy yet._" y deja vacia la tabla de evaluacion en robot real (tarea, numero de ensayos, exitos y tasa de exito). Tampoco se proporcionan metricas de error de accion, latencia de inferencia ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 207 MB en fp32 (51,67 M de parametros x 4 bytes) y aproximadamente 104 MB en fp16 o bf16. Son estimaciones calculadas a partir del numero de parametros declarado; no las publica el autor.
- VRAM real de inferencia: superior a la de los pesos, porque hay que procesar dos imagenes de 480x640 por paso de inferencia y mantener activaciones del codificador visual. No hay cifras publicadas, por lo que se recomienda reservar al menos 2-4 GB para trabajar con holgura en fp32.
- GPU recomendadas: cualquier GPU consumer con soporte CUDA sirve por tamano, por ejemplo RTX 3060, RTX 4070 o RTX 4090. En tarjetas profesionales, A100 o H100 resultan sobredimensionadas para este modelo y solo se justifican si se comparten con otros procesos.
- Cabe en GPU consumer: si, con margen amplio, dado que el modelo ronda los 200 MB de pesos. Tambien es viable ejecutarlo en CPU para pruebas, aunque la latencia se degrada por el preprocesado de imagen.
- Opciones de despliegue: el soporte oficial es LeRobot (`lerobot-rollout` con `--policy.path=pixelouie/oman_workshop_model`) sobre PyTorch. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI, que por otra parte no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El dato relacionado que si se conoce es la frecuencia del dataset de entrenamiento, 15 FPS, pero no se especifica la tasa de control efectiva durante la inferencia ni el tiempo por chunk de acciones.
- Nota de hardware robotico: se requiere un brazo `nema_arm` con puerto serie accesible y dos camaras OpenCV configuradas con nombres que coincidan exactamente con `observation.images.cam_top` y `observation.images.cam_side`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pixelouie/oman_workshop_model | ACT (imitacion, robotica) | 51.670.663 | Estado (7,) + 2 camaras 640x480; tarea unica "Move arm left to right" | no disponible | Hugging Face, 0 descargas |
| pixelouie/act_dual_cam_model | ACT (imitacion, robotica) | no disponible | Configuracion de doble camara; datos no publicados en la informacion disponible | no disponible | Hugging Face |
| Otras politicas LeRobot (Diffusion Policy, SmolVLA) | imitacion / VLA | no disponible | No se dispone de especificaciones en la informacion proporcionada | no disponible | repositorios publicos de LeRobot |

No se dispone de datos de rendimiento comparativos entre estas opciones, por lo que la comparativa se limita a la categoria, la configuracion de sensores y la disponibilidad.

## Limitaciones y advertencias

- Tarea unica y muy restringida: la politica solo ha sido entrenada para "Move arm left to right". No generaliza a otras tareas de manipulacion, agarre o ensamblaje.
- Sin evaluacion publicada: no hay tasa de exito medida en robot real, ni numero de ensayos, ni condiciones de prueba. No se puede afirmar que funcione de forma fiable.
- Sesgos de los datos de demostracion: al proceder de 98 episodios teleoperados por una o pocas personas, la politica hereda los sesgos de estilo, velocidad y trayectoria de esas demostraciones, y el CVAE de ACT puede reproducir esa variabilidad de forma no deseada.
- Sensibilidad al entorno visual: cambios de iluminacion, posicion de las camaras, fondo o presencia de distractores pueden degradar el rendimiento de forma notable, algo habitual en politicas de imitacion con entrada visual.
- Dependencia estricta del montaje: si el brazo, la cinematica o la calibracion difieren del `nema_arm` original, las acciones de 7 dimensiones pueden no ser validas ni seguras.
- Licencia no especificada: la model card indica "More Information Needed". Sin licencia explicita no hay autorizacion clara para uso comercial, por lo que conviene contactar con el autor antes de integrarlo en un producto.
- Riesgo de movimiento fisico peligroso: un fallo de inferencia se traduce en movimiento real del brazo. Es imprescindible un boton de parada de emergencia, limites de par y espacio de trabajo despejado durante cualquier prueba.
- Idiomas y texto: no aplica soporte multilingue; la unica cadena de texto relevante es la etiqueta de tarea, que debe coincidir exactamente con la usada en el entrenamiento.
- Sin informacion sobre cuantizacion: no se ofrecen pesos GGUF, int8 ni int4, de modo que las optimizaciones de despliegue en hardware limitado quedan por hacer.
- Popularidad nula: cero descargas y cero "likes" en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pixelouie/oman_workshop_model
- Dataset de entrenamiento: https://huggingface.co/datasets/pixelouie/oman_workshop_1_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=pixelouie/oman_workshop_1_clean
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Perfil del autor: https://huggingface.co/pixelouie/datasets
- Otro modelo del mismo autor: https://huggingface.co/pixelouie/act_dual_cam_model
